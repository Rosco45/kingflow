"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  FileCheck2,
  Search,
  Plus,
  Eye,
  Trash2,
  Share2,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Coins,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { InvoiceData, DocumentType, InvoiceStatus } from "@/types";
import DocumentViewModal from "./DocumentViewModal";

interface InvoicesViewProps {
  onOpenCreate: (type: DocumentType) => void;
  selectedInvoiceForView?: InvoiceData | null;
  onClearSelectedInvoice?: () => void;
  mode?: "all" | "sales";
}

export default function InvoicesView({
  onOpenCreate,
  selectedInvoiceForView,
  onClearSelectedInvoice,
  mode = "all",
}: InvoicesViewProps) {
  const { formatAmount, addToast } = useCurrency();
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<DocumentType | "ALL">(
    mode === "sales" ? "INVOICE" : "ALL"
  );
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "ALL">("ALL");

  const [activeModalInvoice, setActiveModalInvoice] = useState<InvoiceData | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedInvoiceForView) {
      setActiveModalInvoice(selectedInvoiceForView);
    }
  }, [selectedInvoiceForView]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/invoices?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInvoices();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, typeFilter, statusFilter]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast({
          type: "success",
          title: "Document supprimé",
        });
        setDeleteConfirmId(null);
        fetchInvoices();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Summaries
  const totalBilled = invoices
    .filter((i) => i.type === "INVOICE" && i.status !== "CANCELLED")
    .reduce((sum, i) => sum + i.total, 0);

  const totalPaid = invoices
    .filter((i) => i.type === "INVOICE")
    .reduce((sum, i) => sum + i.paidAmount, 0);

  const totalDue = invoices
    .filter((i) => i.type === "INVOICE" && i.status !== "CANCELLED")
    .reduce((sum, i) => sum + i.balanceDue, 0);

  return (
    <div className="space-y-6">
      {/* Financial Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Facturé
            </span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1">
              {formatAmount(totalBilled)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Encaissé
            </span>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 font-mono mt-1">
              {formatAmount(totalPaid)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Créances Restantes
            </span>
            <p className="text-xl sm:text-2xl font-black text-rose-600 font-mono mt-1">
              {formatAmount(totalDue)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par n° de facture, client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>

          {/* Type Toggle */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setTypeFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                typeFilter === "ALL" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600"
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setTypeFilter("INVOICE")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                typeFilter === "INVOICE" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600"
              }`}
            >
              Factures
            </button>
            <button
              onClick={() => setTypeFilter("QUOTE")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                typeFilter === "QUOTE" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600"
              }`}
            >
              Devis
            </button>
          </div>

          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="DRAFT">Brouillon</option>
            <option value="SENT">Envoyé</option>
            <option value="PARTIALLY_PAID">Partiellement payé</option>
            <option value="PAID">Payé</option>
            <option value="OVERDUE">En retard</option>
            <option value="CANCELLED">Annulé</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenCreate("QUOTE")}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs sm:text-sm font-bold transition-all"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Nouveau Devis</span>
          </button>
          <button
            onClick={() => onOpenCreate("INVOICE")}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Facture</span>
          </button>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Documents ({invoices.length})
          </span>
          <span className="text-xs text-slate-400">Cliquez pour voir la facture A4 ou le reçu</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">N° Document</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Date Émission</th>
                <th className="py-3 px-4">Échéance</th>
                <th className="py-3 px-4 text-right">Montant TTC</th>
                <th className="py-3 px-4 text-right">Reste Dû</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {invoices.length > 0 ? (
                invoices.map((inv) => {
                  const isQuote = inv.type === "QUOTE";
                  let badgeClass = "bg-slate-100 text-slate-700";
                  let badgeLabel: string = inv.status;

                  if (inv.status === "PAID") {
                    badgeClass = "bg-emerald-100 text-emerald-800";
                    badgeLabel = "Payé";
                  } else if (inv.status === "PARTIALLY_PAID") {
                    badgeClass = "bg-blue-100 text-blue-800";
                    badgeLabel = "Partiel";
                  } else if (inv.status === "OVERDUE") {
                    badgeClass = "bg-rose-100 text-rose-800 font-bold";
                    badgeLabel = "En retard";
                  } else if (inv.status === "SENT") {
                    badgeClass = "bg-amber-100 text-amber-800";
                    badgeLabel = "Envoyé";
                  } else if (inv.status === "DRAFT") {
                    badgeClass = "bg-slate-100 text-slate-600";
                    badgeLabel = "Brouillon";
                  }

                  return (
                    <tr
                      key={inv.id}
                      onClick={() => setActiveModalInvoice(inv)}
                      className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-blue-600">
                            {inv.number}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              isQuote
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {isQuote ? "DEVIS" : "FACT"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{inv.customer?.name}</p>
                        {inv.customer?.companyName && (
                          <p className="text-[10px] text-slate-400">
                            {inv.customer.companyName}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {new Date(inv.issueDate).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {new Date(inv.dueDate).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                        {formatAmount(inv.total)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">
                        {isQuote ? (
                          <span className="text-slate-400">—</span>
                        ) : inv.balanceDue > 0 ? (
                          <span className="font-bold text-rose-600">
                            {formatAmount(inv.balanceDue)}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">0 FCFA</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeClass}`}>
                          {badgeLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveModalInvoice(inv);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                            title="Consulter"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(inv.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">Aucun document trouvé</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Créez votre premier devis ou facture pour lancer votre cycle de vente.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document View Modal (A4 + 80mm + WhatsApp + PDF + Payments) */}
      <DocumentViewModal
        invoice={activeModalInvoice}
        onClose={() => {
          setActiveModalInvoice(null);
          if (onClearSelectedInvoice) onClearSelectedInvoice();
        }}
        onRefresh={() => {
          fetchInvoices();
          if (activeModalInvoice) {
            // reload active invoice
            fetch(`/api/invoices/${activeModalInvoice.id}`)
              .then((r) => r.json())
              .then((d) => setActiveModalInvoice(d));
          }
        }}
      />

      {/* Delete confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">Supprimer ce document ?</h4>
              <p className="text-xs text-slate-500 mt-1">
                La facture ou le devis sera définitivement supprimé.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
