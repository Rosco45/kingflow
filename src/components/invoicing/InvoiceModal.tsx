"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Calendar,
  User,
  Percent,
  Coins,
  FileCheck2,
  FilePlus2,
  Search,
  Check,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { CustomerData, ProductData, DocumentType } from "@/types";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialType?: DocumentType;
  initialCustomerId?: string;
}

interface LineItem {
  id: string;
  productId: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function InvoiceModal({
  isOpen,
  onClose,
  onSuccess,
  initialType = "INVOICE",
  initialCustomerId,
}: InvoiceModalProps) {
  const { formatAmount, companySettings, addToast } = useCurrency();

  const [type, setType] = useState<DocumentType>(initialType);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [customerId, setCustomerId] = useState<string>(initialCustomerId || "");
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
  );
  const [status, setStatus] = useState<string>("SENT");
  const [notes, setNotes] = useState<string>("");
  const [terms, setTerms] = useState<string>(companySettings?.invoiceTerms || "");

  // Discount & Tax
  const [discountType, setDiscountType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(companySettings?.defaultVatRate || 18);

  // Initial Payment (for invoices)
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [paymentRef, setPaymentRef] = useState<string>("");

  // Items
  const [items, setItems] = useState<LineItem[]>([
    {
      id: "item-1",
      productId: null,
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      if (initialCustomerId) setCustomerId(initialCustomerId);
      loadDependencies();
    }
  }, [isOpen, initialType, initialCustomerId]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const loadDependencies = async () => {
    try {
      const [cRes, pRes] = await Promise.all([
        fetch("/api/customers"),
        fetch("/api/products"),
      ]);
      if (cRes.ok) setCustomers(await cRes.json());
      if (pRes.ok) setProducts(await pRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  // Real-time computations
  const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);

  let discountAmount = 0;
  if (discountType === "PERCENT") {
    discountAmount = Math.round((subtotal * (discountValue || 0)) / 100);
  } else {
    discountAmount = Math.min(subtotal, discountValue || 0);
  }

  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round((afterDiscount * (taxRate || 0)) / 100);
  const total = afterDiscount + taxAmount;
  const balanceDue = Math.max(0, total - (paidAmount || 0));

  // Item handlers
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        productId: null,
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleProductSelect = (id: string, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const qty = it.quantity || 1;
          const price = prod.sellingPrice;
          return {
            ...it,
            productId: prod.id,
            description: prod.name,
            unitPrice: price,
            total: Math.round(qty * price),
          };
        }
        return it;
      })
    );
  };

  const handleItemChange = (
    id: string,
    field: "description" | "quantity" | "unitPrice",
    val: any
  ) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const updated = { ...it, [field]: val };
          const qty = field === "quantity" ? parseFloat(val) || 0 : it.quantity;
          const price = field === "unitPrice" ? parseFloat(val) || 0 : it.unitPrice;
          updated.total = Math.round(qty * price);
          return updated;
        }
        return it;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      addToast({
        type: "error",
        title: "Client manquant",
        description: "Veuillez sélectionner le client destinataire.",
      });
      return;
    }

    const validItems = items.filter((it) => it.description.trim() !== "");
    if (validItems.length === 0) {
      addToast({
        type: "error",
        title: "Articles requis",
        description: "Veuillez ajouter au moins une ligne d'article ou prestation.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        type,
        customerId,
        status: type === "QUOTE" ? "SENT" : status,
        issueDate,
        dueDate,
        discountType,
        discountValue,
        taxRate,
        paidAmount: type === "INVOICE" ? paidAmount : 0,
        paymentMethod,
        paymentReference: paymentRef,
        notes,
        terms,
        items: validItems,
      };

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        addToast({
          type: "success",
          title: type === "QUOTE" ? "Devis créé avec succès" : "Facture émise avec succès",
          description: "Le document est enregistré et prêt à être partagé.",
        });
        onSuccess();
        onClose();
      } else {
        const err = await res.json();
        addToast({
          type: "error",
          title: "Erreur lors de la création",
          description: err.error || "Impossible d'enregistrer le document.",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col animate-in zoom-in-95 cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl text-white font-bold ${
                type === "INVOICE" ? "bg-blue-600 shadow-blue-500/20" : "bg-indigo-600 shadow-indigo-500/20"
              }`}
            >
              {type === "INVOICE" ? <FilePlus2 className="w-5 h-5" /> : <FileCheck2 className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                {type === "INVOICE" ? "Créer une Facture Pro" : "Créer un Devis Commercial"}
              </h3>
              <p className="text-xs text-slate-500">
                Calcul automatique des sous-totaux, TVA, remises et acomptes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Type selector toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setType("INVOICE")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  type === "INVOICE" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600"
                }`}
              >
                Facture
              </button>
              <button
                type="button"
                onClick={() => setType("QUOTE")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  type === "QUOTE" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600"
                }`}
              >
                Devis
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-6 text-xs">
          {/* Client & Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Client Destinataire *</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">-- Choisir un client --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.companyName ? `(${c.companyName})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Date d'Émission</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Date d'Échéance</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 text-xs"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                Lignes d'articles & prestations
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-blue-600 font-bold hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-500 font-bold text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3 w-1/3">Article / Prestation</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-2 text-center w-16">Qté</th>
                    <th className="py-2.5 px-3 text-right w-28">Prix Unit.</th>
                    <th className="py-2.5 px-3 text-right w-28">Total</th>
                    <th className="py-2.5 px-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((it) => (
                    <tr key={it.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3">
                        <select
                          value={it.productId || ""}
                          onChange={(e) => handleProductSelect(it.id, e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-xs"
                        >
                          <option value="">-- Choisir du catalogue ou libre --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku}) - {p.sellingPrice.toLocaleString()} FCFA
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={it.description}
                          onChange={(e) => handleItemChange(it.id, "description", e.target.value)}
                          placeholder="Libellé de la prestation..."
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={it.quantity}
                          onChange={(e) => handleItemChange(it.id, "quantity", e.target.value)}
                          className="w-16 px-1.5 py-1.5 rounded-lg border border-slate-200 font-mono text-center text-xs"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          value={it.unitPrice}
                          onChange={(e) => handleItemChange(it.id, "unitPrice", e.target.value)}
                          className="w-24 px-1.5 py-1.5 rounded-lg border border-slate-200 font-mono text-right text-xs"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                        {it.total.toLocaleString()}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(it.id)}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals & Financial Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Left: Notes & Terms */}
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Conditions & Modalités de règlement
                </label>
                <textarea
                  rows={2}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Ex: 50% d'acompte à la commande, solde à 30 jours..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes publiques pour le client</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Marchandise garantie 1 an pièces et main d'œuvre..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              {/* Initial Payment Recording if Invoice */}
              {type === "INVOICE" && (
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 space-y-2.5">
                  <span className="font-bold text-blue-900 block">
                    💰 Enregistrer un Acompte / Paiement immédiat
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-blue-800 font-semibold mb-0.5">
                        Montant Acompte (FCFA)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={total}
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-blue-300 font-mono font-bold text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-blue-800 font-semibold mb-0.5">
                        Moyen de paiement
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-blue-300 text-xs bg-white font-medium"
                      >
                        <option value="CASH">Espèces (Cash)</option>
                        <option value="WAVE">Wave Mobile</option>
                        <option value="ORANGE_MONEY">Orange Money</option>
                        <option value="MTN_MOMO">MTN MoMo</option>
                        <option value="BANK_TRANSFER">Virement Bancaire</option>
                        <option value="CHECK">Chèque</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Calculations */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Sous-total HT :</span>
                <span className="font-mono font-bold">{subtotal.toLocaleString()} FCFA</span>
              </div>

              {/* Discount control */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5">
                  <span>Remise :</span>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px]"
                  >
                    <option value="PERCENT">%</option>
                    <option value="FIXED">Fixe</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 rounded border border-slate-200 text-right font-mono"
                  />
                  <span className="text-rose-600 font-mono font-bold">
                    -{discountAmount.toLocaleString()} FCFA
                  </span>
                </div>
              </div>

              {/* VAT control */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5">
                  <span>TVA / Taxe :</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-14 px-1.5 py-0.5 rounded border border-slate-200 text-right font-mono text-[11px]"
                  />
                  <span>%</span>
                </div>
                <span className="font-mono font-bold text-slate-800">
                  +{taxAmount.toLocaleString()} FCFA
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-black text-sm text-slate-900">Total Net TTC :</span>
                <span className="font-black text-lg text-blue-700 font-mono">
                  {formatAmount(total)}
                </span>
              </div>

              {type === "INVOICE" && paidAmount > 0 && (
                <div className="pt-1 border-t border-slate-100 flex justify-between text-xs font-bold text-rose-600">
                  <span>Reste à Payer (Créance) :</span>
                  <span className="font-mono">{formatAmount(balanceDue)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {isSubmitting
                ? "Génération en cours..."
                : type === "QUOTE"
                ? "Enregistrer le Devis"
                : "Émettre la Facture"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
