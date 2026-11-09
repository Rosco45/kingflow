"use client";

import React, { useState } from "react";
import {
  X,
  Download,
  Printer,
  Share2,
  FileCheck2,
  CreditCard,
  Building,
  CheckCircle2,
  Phone,
  Mail,
  Receipt,
  FileText,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { InvoiceData } from "@/types";
import { exportElementToPdf, printThermalReceipt, shareInvoiceViaWhatsApp } from "@/lib/pdf";
import { numberToFrenchWords } from "@/lib/currency";

interface DocumentViewModalProps {
  invoice: InvoiceData | null;
  onClose: () => void;
  onRefresh: () => void;
}

export default function DocumentViewModal({
  invoice,
  onClose,
  onRefresh,
}: DocumentViewModalProps) {
  const { formatAmount, companySettings, addToast } = useCurrency();
  const [viewMode, setViewMode] = useState<"A4" | "THERMAL_80MM">("A4");
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  // Payment Recording Drawer inside Modal
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<string>("CASH");
  const [payRef, setPayRef] = useState<string>("");
  const [payNotes, setPayNotes] = useState<string>("");
  const [isPaySubmitting, setIsPaySubmitting] = useState(false);

  // Conversion loading
  const [isConverting, setIsConverting] = useState(false);

  // Handle Escape key to close document viewer
  React.useEffect(() => {
    if (!invoice) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [invoice, onClose]);

  if (!invoice) return null;

  const isQuote = invoice.type === "QUOTE";
  const hasRemainingBalance = invoice.balanceDue > 0;

  const handleDownloadPdf = async () => {
    try {
      setIsPdfGenerating(true);
      await exportElementToPdf(
        "invoice-a4-document",
        `${isQuote ? "Devis" : "Facture"}_${invoice.number}.pdf`
      );
      addToast({
        type: "success",
        title: "PDF Téléchargé",
        description: `Le document ${invoice.number} est sauvegardé sur votre appareil.`,
      });
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Erreur PDF",
        description: "Impossible d'exporter le PDF.",
      });
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handlePrintReceipt = () => {
    printThermalReceipt("receipt-thermal-document");
  };

  const handleWhatsAppShare = () => {
    shareInvoiceViaWhatsApp({
      phone: invoice.customer?.whatsapp || invoice.customer?.phone,
      customerName: invoice.customer?.name || "Cher client",
      invoiceNumber: invoice.number,
      total: formatAmount(invoice.total),
      balanceDue: formatAmount(invoice.balanceDue),
      dueDate: new Date(invoice.dueDate).toLocaleDateString("fr-FR"),
      companyName: companySettings?.name || "KingFlow",
    });
  };

  const handleConvertQuote = async () => {
    try {
      setIsConverting(true);
      const res = await fetch(`/api/invoices/${invoice.id}/convert`, {
        method: "POST",
      });

      if (res.ok) {
        addToast({
          type: "success",
          title: "Devis converti en Facture !",
          description: `Le devis a généré la facture officielle et le stock a été mis à jour.`,
        });
        onRefresh();
        onClose();
      } else {
        const err = await res.json();
        addToast({
          type: "error",
          title: "Erreur de conversion",
          description: err.error || "Impossible de convertir le devis.",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsConverting(false);
    }
  };

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) return;

    try {
      setIsPaySubmitting(true);
      const res = await fetch(`/api/invoices/${invoice.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: payAmount,
          paymentMethod: payMethod,
          reference: payRef,
          notes: payNotes,
        }),
      });

      if (res.ok) {
        addToast({
          type: "success",
          title: "Paiement enregistré avec succès !",
          description: `Encaissement de ${formatAmount(payAmount)} validé.`,
        });
        setShowPaymentForm(false);
        onRefresh();
      } else {
        const err = await res.json();
        addToast({
          type: "error",
          title: "Erreur paiement",
          description: err.error || "Impossible d'enregistrer le paiement.",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPaySubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-100 rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-300 max-h-[96vh] flex flex-col overflow-hidden animate-in zoom-in-95 cursor-default"
      >
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="font-mono font-black text-sm bg-blue-600 px-2.5 py-1 rounded-lg">
              {invoice.number}
            </span>
            <div className="flex items-center bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setViewMode("A4")}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === "A4" ? "bg-blue-600 text-white shadow-sm" : "text-slate-300 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Format A4 Pro</span>
              </button>
              <button
                onClick={() => setViewMode("THERMAL_80MM")}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === "THERMAL_80MM" ? "bg-amber-600 text-white shadow-sm" : "text-slate-300 hover:text-white"
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Reçu Caisse 80mm</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Convert Quote Action */}
            {isQuote && (
              <button
                onClick={handleConvertQuote}
                disabled={isConverting}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>{isConverting ? "Conversion..." : "Convertir en Facture"}</span>
              </button>
            )}

            {/* Record Payment Button */}
            {!isQuote && hasRemainingBalance && (
              <button
                onClick={() => {
                  setPayAmount(invoice.balanceDue);
                  setShowPaymentForm(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              >
                <CreditCard className="w-4 h-4" />
                <span>Encaisser Règlement</span>
              </button>
            )}

            {/* WhatsApp Share */}
            <button
              onClick={handleWhatsAppShare}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
              title="Partager un récapitulatif complet sur WhatsApp"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Print or Download PDF */}
            {viewMode === "A4" ? (
              <button
                onClick={handleDownloadPdf}
                disabled={isPdfGenerating}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold flex items-center gap-1.5 border border-slate-700 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>{isPdfGenerating ? "PDF en cours..." : "Télécharger PDF"}</span>
              </button>
            ) : (
              <button
                onClick={handlePrintReceipt}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer 80mm</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-200/80">
          {/* ==============================================================
              VIEW 1: FORMAT A4 PROFESSIONNEL
          ============================================================== */}
          {viewMode === "A4" && (
            <div
              id="invoice-a4-document"
              className="bg-white rounded-none shadow-2xl p-8 sm:p-12 w-full max-w-[800px] min-h-[1050px] flex flex-col justify-between text-slate-800 font-sans border border-slate-300"
              style={{ minWidth: "320px" }}
            >
              <div>
                {/* Header: Brand & Document Meta */}
                <div className="flex items-start justify-between pb-8 border-b-2 border-slate-900 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl font-black tracking-tight text-slate-900">
                        {companySettings?.name || "KingFlow SARL"}
                      </span>
                    </div>
                    {companySettings?.tagline && (
                      <p className="text-xs text-slate-500 font-medium">
                        {companySettings.tagline}
                      </p>
                    )}
                    <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                      <p>{companySettings?.address}</p>
                      <p>{companySettings?.city}, {companySettings?.country}</p>
                      <p>Tél: {companySettings?.phone}</p>
                      {companySettings?.taxId && (
                        <p className="font-mono text-[11px] text-slate-500">
                          {companySettings.taxId}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded text-xs font-black uppercase tracking-wider ${
                        isQuote
                          ? "bg-indigo-100 text-indigo-900 border border-indigo-200"
                          : "bg-blue-100 text-blue-900 border border-blue-200"
                      }`}
                    >
                      {isQuote ? "DEVIS PROFORMA" : "FACTURE COMMERCIALE"}
                    </span>
                    <p className="font-mono font-black text-xl text-slate-900 mt-2">
                      {invoice.number}
                    </p>
                    <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                      <p>
                        Date d'émission :{" "}
                        <strong className="text-slate-900">
                          {new Date(invoice.issueDate).toLocaleDateString("fr-FR")}
                        </strong>
                      </p>
                      <p>
                        Date d'échéance :{" "}
                        <strong className="text-slate-900">
                          {new Date(invoice.dueDate).toLocaleDateString("fr-FR")}
                        </strong>
                      </p>
                      {!isQuote && (
                        <p className="mt-1">
                          Statut :{" "}
                          <span
                            className={`font-black uppercase text-[11px] ${
                              invoice.status === "PAID"
                                ? "text-emerald-600"
                                : invoice.status === "PARTIALLY_PAID"
                                ? "text-blue-600"
                                : invoice.status === "OVERDUE"
                                ? "text-rose-600"
                                : "text-amber-600"
                            }`}
                          >
                            {invoice.status}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Client Recipient Block */}
                <div className="my-8 p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Facturé à (Client)
                    </span>
                    <h4 className="font-black text-slate-900 text-base">
                      {invoice.customer?.name}
                    </h4>
                    {invoice.customer?.companyName && (
                      <p className="text-xs font-bold text-slate-700">
                        {invoice.customer.companyName}
                      </p>
                    )}
                    <p className="text-xs text-slate-600 mt-1">{invoice.customer?.address}</p>
                    <p className="text-xs text-slate-600">
                      {invoice.customer?.city}, {invoice.customer?.country}
                    </p>
                  </div>

                  <div className="text-xs text-slate-600 sm:text-right space-y-1">
                    {invoice.customer?.phone && (
                      <p>
                        Tél : <span className="font-mono">{invoice.customer.phone}</span>
                      </p>
                    )}
                    {invoice.customer?.whatsapp && (
                      <p>
                        WhatsApp : <span className="font-mono">{invoice.customer.whatsapp}</span>
                      </p>
                    )}
                    {invoice.customer?.email && <p>{invoice.customer.email}</p>}
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-left text-xs mb-8">
                  <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-3">Désignation & Référence</th>
                      <th className="py-3 px-3 text-center w-16">Qté</th>
                      <th className="py-3 px-3 text-right w-28">Prix Unitaire</th>
                      <th className="py-3 px-3 text-right w-28">Montant HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {invoice.items.map((it, idx) => (
                      <tr key={it.id || idx}>
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-900">{it.description}</p>
                          {it.product?.sku && (
                            <p className="text-[10px] text-slate-400 font-mono">
                              SKU: {it.product.sku}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-medium">
                          {it.quantity}
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          {formatAmount(it.unitPrice)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {formatAmount(it.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Subtotals & Grand Total Block */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t-2 border-slate-900">
                  <div className="max-w-xs space-y-2 text-xs">
                    <p className="text-[11px] font-bold text-slate-500 uppercase">
                      Arrêté de la présente facture à la somme de :
                    </p>
                    <p className="font-bold italic text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-snug">
                      "{numberToFrenchWords(invoice.total)} Francs CFA"
                    </p>
                  </div>

                  <div className="w-full sm:w-64 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Total HT :</span>
                      <span className="font-mono font-bold">{formatAmount(invoice.subtotal)}</span>
                    </div>

                    {invoice.discountAmount > 0 && (
                      <div className="flex justify-between text-rose-600 font-bold">
                        <span>Remise accordée :</span>
                        <span className="font-mono">-{formatAmount(invoice.discountAmount)}</span>
                      </div>
                    )}

                    {invoice.taxAmount > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>TVA ({invoice.taxRate}%) :</span>
                        <span className="font-mono font-bold">+{formatAmount(invoice.taxAmount)}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-900 flex justify-between items-baseline font-black">
                      <span className="text-sm text-slate-900 uppercase">Total Net TTC :</span>
                      <span className="text-base text-blue-700 font-mono">
                        {formatAmount(invoice.total)}
                      </span>
                    </div>

                    {!isQuote && (
                      <>
                        <div className="flex justify-between text-emerald-700 font-semibold pt-1">
                          <span>Acomptes / Déjà Payé :</span>
                          <span className="font-mono">-{formatAmount(invoice.paidAmount)}</span>
                        </div>
                        <div className="flex justify-between text-rose-700 font-black border-t border-dashed border-slate-300 pt-1">
                          <span>Reste à payer :</span>
                          <span className="font-mono text-sm">{formatAmount(invoice.balanceDue)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Terms & Legal Notice */}
              <div className="pt-8 mt-12 border-t border-slate-200 text-[11px] text-slate-500 space-y-2">
                {invoice.terms && (
                  <p>
                    <strong className="text-slate-700">Modalités :</strong> {invoice.terms}
                  </p>
                )}
                {invoice.notes && (
                  <p>
                    <strong className="text-slate-700">Notes :</strong> {invoice.notes}
                  </p>
                )}
                <p className="text-center text-[10px] text-slate-400 pt-3 border-t border-slate-100">
                  {companySettings?.name} • NINEA: {companySettings?.taxId} • Généré avec KingFlow SaaS
                </p>
              </div>
            </div>
          )}

          {/* ==============================================================
              VIEW 2: TICKET DE CAISSE THERMIQUE 80MM
          ============================================================== */}
          {viewMode === "THERMAL_80MM" && (
            <div
              id="receipt-thermal-document"
              className="bg-white shadow-2xl p-6 w-[80mm] min-h-[480px] font-mono text-[11px] text-black border border-slate-300 rounded-sm leading-tight flex flex-col justify-between"
            >
              <div>
                {/* Receipt Header */}
                <div className="text-center pb-3 border-b border-dashed border-black">
                  <p className="font-bold text-sm uppercase">{companySettings?.name || "KINGFLOW"}</p>
                  <p className="text-[10px] mt-0.5">{companySettings?.tagline}</p>
                  <p className="text-[10px] mt-1">{companySettings?.address}</p>
                  <p className="text-[10px]">{companySettings?.city} - Tél: {companySettings?.phone}</p>
                  {companySettings?.taxId && <p className="text-[9px] mt-0.5">{companySettings?.taxId}</p>}
                </div>

                {/* Ticket Meta */}
                <div className="py-2.5 border-b border-dashed border-black text-[10px] space-y-1">
                  <div className="flex justify-between">
                    <span>DOC:</span>
                    <span className="font-bold">{invoice.number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DATE:</span>
                    <span>{new Date(invoice.issueDate).toLocaleString("fr-FR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CLIENT:</span>
                    <span className="font-bold truncate max-w-[140px]">{invoice.customer?.name}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="py-2.5 border-b border-dashed border-black">
                  <div className="flex justify-between font-bold pb-1 text-[10px]">
                    <span>ARTICLE</span>
                    <span>TOTAL</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {invoice.items.map((it, idx) => (
                      <div key={idx}>
                        <p className="font-bold truncate">{it.description}</p>
                        <div className="flex justify-between text-[10px] text-slate-700">
                          <span>
                            {it.quantity} x {it.unitPrice.toLocaleString()}
                          </span>
                          <span className="font-bold">{it.total.toLocaleString()} F</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="py-2.5 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>SOUS-TOTAL:</span>
                    <span>{invoice.subtotal.toLocaleString()} F</span>
                  </div>
                  {invoice.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span>REMISE:</span>
                      <span>-{invoice.discountAmount.toLocaleString()} F</span>
                    </div>
                  )}
                  {invoice.taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span>TVA ({invoice.taxRate}%):</span>
                      <span>+{invoice.taxAmount.toLocaleString()} F</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-xs pt-1.5 border-t border-black">
                    <span>NET A PAYER:</span>
                    <span>{invoice.total.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1">
                    <span>REGLÉ:</span>
                    <span>{invoice.paidAmount.toLocaleString()} F</span>
                  </div>
                  <div className="flex justify-between font-black pt-1">
                    <span>SOLDE DU:</span>
                    <span>{invoice.balanceDue.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>

              {/* Barcode & Footer Policy */}
              <div className="text-center pt-4 border-t border-dashed border-black text-[9px] space-y-1.5">
                <div className="tracking-[3px] font-bold text-xs py-1">
                  * {invoice.number} *
                </div>
                <p className="italic">
                  {companySettings?.receiptFooter || "Merci de votre visite ! À très bientôt."}
                </p>
                <p className="text-[8px] text-slate-600">Imprimé sur KingFlow POS</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Payment Form Drawer */}
        {showPaymentForm && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-black text-slate-900 text-base">Encaisser un Règlement</h4>
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRegisterPayment} className="space-y-4 mt-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="font-semibold text-slate-600">Reste à payer sur {invoice.number} :</span>
                  <span className="font-mono font-black text-sm text-rose-600">
                    {formatAmount(invoice.balanceDue)}
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Montant Encaissé (FCFA) *</label>
                  <input
                    type="number"
                    min="1"
                    max={invoice.balanceDue}
                    value={payAmount}
                    onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mode de Règlement</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="CASH">Espèces (Cash)</option>
                    <option value="WAVE">Wave Mobile</option>
                    <option value="ORANGE_MONEY">Orange Money</option>
                    <option value="MTN_MOMO">MTN MoMo</option>
                    <option value="BANK_TRANSFER">Virement Bancaire</option>
                    <option value="CHECK">Chèque</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Référence Transaction</label>
                  <input
                    type="text"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    placeholder="Ex: WAVE-TX-49129 ou N° Chèque..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Notes internes</label>
                  <input
                    type="text"
                    value={payNotes}
                    onChange={(e) => setPayNotes(e.target.value)}
                    placeholder="Ex: Reçu en caisse par Mamadou..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isPaySubmitting}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 disabled:opacity-50"
                  >
                    {isPaySubmitting ? "Validation..." : "Valider l'encaissement"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
