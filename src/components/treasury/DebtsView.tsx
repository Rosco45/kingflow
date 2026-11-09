"use client";

import React, { useState, useEffect } from "react";
import {
  Scale,
  CreditCard,
  Truck,
  MessageSquare,
  Phone,
  AlertCircle,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  DollarSign,
  Share2,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { CustomerData, ExpenseData, InvoiceData } from "@/types";
import { shareInvoiceViaWhatsApp } from "@/lib/pdf";

interface DebtsViewProps {
  onOpenInvoice: (invoice: InvoiceData) => void;
  onNavigateToTab: (tab: any) => void;
}

export default function DebtsView({ onOpenInvoice, onNavigateToTab }: DebtsViewProps) {
  const { formatAmount, companySettings, addToast } = useCurrency();
  const [activeTab, setActiveTab] = useState<"CUSTOMERS" | "SUPPLIERS">("CUSTOMERS");
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cRes, eRes] = await Promise.all([
        fetch("/api/customers"),
        fetch("/api/expenses?isPaid=false"),
      ]);
      if (cRes.ok) setCustomers(await cRes.json());
      if (eRes.ok) setExpenses(await eRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter only customers with balanceDue > 0
  const debtorCustomers = customers.filter((c) => (c.balanceDue || 0) > 0);
  const totalCustomerReceivables = debtorCustomers.reduce(
    (sum, c) => sum + (c.balanceDue || 0),
    0
  );

  const totalSupplierDebts = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleWhatsAppReminder = (c: CustomerData) => {
    const cleanPhone = (c.whatsapp || c.phone || "").replace(/[^0-9]/g, "");
    const message = `*Bonjour ${c.name}*,\n\nNous nous permettons de vous contacter concernant votre compte chez *${companySettings?.name || "KingFlow"}*.\n\n📌 *Solde global en attente de règlement :* ${formatAmount(c.balanceDue || 0)}\n\nMerci de bien vouloir procéder à la régularisation de vos factures par Wave, Orange Money ou Virement bancaire.\n\nRestant à votre écoute,\n*${companySettings?.name}*`;

    const encoded = encodeURIComponent(message);
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* High-level KPI Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => setActiveTab("CUSTOMERS")}
          className={`p-5 rounded-2xl border shadow-sm cursor-pointer transition-all ${
            activeTab === "CUSTOMERS"
              ? "bg-rose-50 border-rose-300 ring-2 ring-rose-500/20"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Créances Clients (À Recouvrer)
            </span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-950 font-mono mt-2">
            {formatAmount(totalCustomerReceivables)}
          </p>
          <p className="text-xs text-rose-700 font-medium mt-1">
            {debtorCustomers.length} client(s) avec des factures impayées
          </p>
        </div>

        <div
          onClick={() => setActiveTab("SUPPLIERS")}
          className={`p-5 rounded-2xl border shadow-sm cursor-pointer transition-all ${
            activeTab === "SUPPLIERS"
              ? "bg-amber-50 border-amber-300 ring-2 ring-amber-500/20"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Dettes Fournisseurs (À Régler)
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-950 font-mono mt-2">
            {formatAmount(totalSupplierDebts)}
          </p>
          <p className="text-xs text-amber-700 font-medium mt-1">
            {expenses.length} facture(s) d'achats en attente de décaissement
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("CUSTOMERS")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "CUSTOMERS"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Balance Âgée Clients ({debtorCustomers.length})
        </button>
        <button
          onClick={() => setActiveTab("SUPPLIERS")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "SUPPLIERS"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Dettes Fournisseurs ({expenses.length})
        </button>
      </div>

      {/* VIEW 1: CUSTOMERS RECEIVABLES */}
      {activeTab === "CUSTOMERS" && (
        <div className="space-y-4">
          {debtorCustomers.length > 0 ? (
            debtorCustomers.map((c) => {
              const unpaidInvoices =
                c.invoices?.filter(
                  (i) => i.type === "INVOICE" && i.balanceDue > 0 && i.status !== "CANCELLED"
                ) || [];

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-rose-200 p-5 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 font-bold flex items-center justify-center shrink-0">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base">{c.name}</h4>
                        <p className="text-xs text-slate-500 font-medium">
                          {c.companyName ? `${c.companyName} • ` : ""}
                          {c.phone || c.whatsapp || "Pas de numéro"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* WhatsApp Relance */}
                      <button
                        onClick={() => handleWhatsAppReminder(c)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Relance WhatsApp</span>
                      </button>

                      {c.phone && (
                        <a
                          href={`tel:${c.phone}`}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                          <span>Appeler</span>
                        </a>
                      )}

                      <div className="text-right pl-3 border-l border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">
                          Total Dû
                        </span>
                        <span className="text-base font-black text-rose-600 font-mono">
                          {formatAmount(c.balanceDue || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* List of Unpaid Invoices */}
                  <div className="space-y-2 text-xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Factures en retard / impayées ({unpaidInvoices.length})
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {unpaidInvoices.map((inv) => {
                        const isOverdue = new Date(inv.dueDate) < new Date();
                        const daysLate = Math.floor(
                          (Date.now() - new Date(inv.dueDate).getTime()) / 86400000
                        );

                        return (
                          <div
                            key={inv.id}
                            onClick={() => onOpenInvoice(inv)}
                            className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-400 cursor-pointer transition-all space-y-1.5"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-mono font-bold text-blue-600">
                                {inv.number}
                              </span>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                                  isOverdue
                                    ? "bg-rose-100 text-rose-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {isOverdue ? `+${daysLate}j retard` : "À échéance"}
                              </span>
                            </div>

                            <div className="flex justify-between text-slate-600 pt-1">
                              <span>Total : {formatAmount(inv.total)}</span>
                              <span className="font-black text-rose-600 font-mono">
                                Reste : {formatAmount(inv.balanceDue)}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400">
                              Échéance : {new Date(inv.dueDate).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
              <h4 className="font-bold text-slate-800 text-base">Toutes les créances sont recouvrées !</h4>
              <p className="text-xs text-slate-500 mt-1">
                Aucun client n'a de facture en attente ou en retard.
              </p>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: SUPPLIERS PAYABLES */}
      {activeTab === "SUPPLIERS" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Factures Fournisseurs Impayées ({expenses.length})
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {expenses.length > 0 ? (
              expenses.map((exp) => (
                <div key={exp.id} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between gap-3 text-xs">
                  <div>
                    <h5 className="font-black text-slate-900 text-sm">{exp.title}</h5>
                    <p className="text-slate-500 font-medium mt-0.5">
                      Fournisseur : <strong>{exp.supplier?.name || "Non spécifié"}</strong> • {exp.category}
                    </p>
                    <p className="text-slate-400 text-[11px] mt-1">
                      Date d'engagement : {new Date(exp.expenseDate).toLocaleDateString("fr-FR")}
                    </p>
                    {exp.notes && <p className="text-[10px] text-slate-600 italic mt-1">"{exp.notes}"</p>}
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Montant à payer
                    </span>
                    <p className="text-base font-black text-rose-600 font-mono">
                      {formatAmount(exp.amount)}
                    </p>
                    <button
                      onClick={() => onNavigateToTab("treasury")}
                      className="mt-2 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold"
                    >
                      Régler dans Trésorerie
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400">
                <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
                <h4 className="font-bold text-slate-800 text-base">Aucune dette fournisseur !</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Tous vos achats et charges opérationnelles sont à jour.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
