"use client";

import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Download,
  FileText,
  BarChart3,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Printer,
  Sparkles,
  Layers,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import {
  exportInvoicesToExcel,
  exportExpensesToExcel,
  exportInventoryToExcel,
  exportReceivablesToExcel,
} from "@/lib/excel";
import { exportElementToPdf } from "@/lib/pdf";
import { InvoiceData, ExpenseData, ProductData, CustomerData, DashboardStats } from "@/types";

export default function ReportsView() {
  const { formatAmount, companySettings, currency, addToast } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [iRes, eRes, pRes, cRes, sRes] = await Promise.all([
        fetch("/api/invoices"),
        fetch("/api/expenses"),
        fetch("/api/products"),
        fetch("/api/customers"),
        fetch("/api/dashboard"),
      ]);

      if (iRes.ok) setInvoices(await iRes.json());
      if (eRes.ok) setExpenses(await eRes.json());
      if (pRes.ok) setProducts(await pRes.json());
      if (cRes.ok) setCustomers(await cRes.json());
      if (sRes.ok) setStats(await sRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportInvoicesExcel = () => {
    exportInvoicesToExcel(invoices);
    addToast({
      type: "success",
      title: "Export Excel généré",
      description: "Le fichier des factures et ventes a été téléchargé.",
    });
  };

  const handleExportExpensesExcel = () => {
    exportExpensesToExcel(expenses);
    addToast({
      type: "success",
      title: "Export Excel généré",
      description: "Le grand livre des dépenses a été téléchargé.",
    });
  };

  const handleExportInventoryExcel = () => {
    exportInventoryToExcel(products);
    addToast({
      type: "success",
      title: "Export Excel généré",
      description: "L'état des stocks et la valorisation ont été exportés.",
    });
  };

  const handleExportReceivablesExcel = () => {
    exportReceivablesToExcel(customers);
    addToast({
      type: "success",
      title: "Export Excel généré",
      description: "La balance âgée des créances a été exportée.",
    });
  };

  const handleExportMonthlyReportPdf = async () => {
    try {
      await exportElementToPdf(
        "monthly-summary-pdf",
        `Bilan_Mensuel_KingFlow_${new Date().toISOString().slice(0, 7)}.pdf`
      );
      addToast({
        type: "success",
        title: "Bilan PDF généré",
        description: "Le rapport financier mensuel est prêt.",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const totalStockValueAchat = products.reduce(
    (sum, p) => sum + p.stockQuantity * p.purchasePrice,
    0
  );

  const totalStockValueVente = products.reduce(
    (sum, p) => sum + p.stockQuantity * p.sellingPrice,
    0
  );

  return (
    <div className="space-y-8">
      {/* Excel Exports Grid */}
      <div>
        <div className="mb-4">
          <h3 className="text-base sm:text-lg font-black text-slate-900">
            Exports Excel (.xlsx) Instantanés
          </h3>
          <p className="text-xs text-slate-500">
            Téléchargez les données brutes compatibles avec Microsoft Excel, LibreOffice et Google Sheets
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Ventes & Factures */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-400 transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Ventes & Facturation</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Liste complète des devis, factures, statuts, montants HT, TVA et acomptes ({invoices.length} docs).
              </p>
            </div>
            <button
              onClick={handleExportInvoicesExcel}
              className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter Ventes .xlsx</span>
            </button>
          </div>

          {/* Card 2: Grand Livre Dépenses */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-400 transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Grand Livre des Dépenses</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Toutes les charges d'exploitation réparties par catégorie, mode de règlement et fournisseurs ({expenses.length} entrées).
              </p>
            </div>
            <button
              onClick={handleExportExpensesExcel}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter Dépenses .xlsx</span>
            </button>
          </div>

          {/* Card 3: État des Stocks */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-400 transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">État des Stocks & Valorisation</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Inventaire actuel, prix de revient, prix de vente, valorisation globale et alertes de rupture ({products.length} réf).
              </p>
            </div>
            <button
              onClick={handleExportInventoryExcel}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter Stocks .xlsx</span>
            </button>
          </div>

          {/* Card 4: Balance des Créances */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-rose-400 transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Balance des Créances Clients</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Synthèse des impayés par client avec coordonnées téléphoniques, WhatsApp et montants à recouvrer.
              </p>
            </div>
            <button
              onClick={handleExportReceivablesExcel}
              className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter Créances .xlsx</span>
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Summary PDF Report Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Rapport Périodique (Bilan Mensuel Imprimable)
            </h3>
            <p className="text-xs text-slate-500">
              Générez un rapport exécutif synthétique pour votre direction ou votre comptable
            </p>
          </div>

          <button
            onClick={handleExportMonthlyReportPdf}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Télécharger Rapport PDF</span>
          </button>
        </div>

        {/* Printable Monthly Summary Sheet */}
        <div
          id="monthly-summary-pdf"
          className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6 max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-6 border-b-2 border-slate-900">
            <div>
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest block mb-1">
                KINGFLOW RAPPORT MENSUEL D'ACTIVITÉ
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {companySettings?.name || "KingFlow SARL"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Période : {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
              </p>
            </div>

            <div className="text-right text-xs text-slate-500 space-y-0.5">
              <p className="font-bold text-slate-800">{companySettings?.city}, {companySettings?.country}</p>
              <p>Émis le : {new Date().toLocaleDateString("fr-FR")}</p>
              <p>Devise de référence : <strong>{currency}</strong></p>
            </div>
          </div>

          {/* Key Metrics Grid in Report */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Chiffre d'Affaires</span>
              <p className="text-base sm:text-lg font-black text-blue-900 font-mono mt-0.5">
                {formatAmount(stats?.monthlyRevenue || 0)}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Charges & Dépenses</span>
              <p className="text-base sm:text-lg font-black text-amber-900 font-mono mt-0.5">
                {formatAmount(stats?.monthlyExpenses || 0)}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Marge Nette Estimée</span>
              <p className="text-base sm:text-lg font-black text-emerald-900 font-mono mt-0.5">
                {formatAmount(stats?.estimatedNetMargin || 0)}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Créances à Recouvrer</span>
              <p className="text-base sm:text-lg font-black text-rose-900 font-mono mt-0.5">
                {formatAmount(stats?.pendingReceivables || 0)}
              </p>
            </div>
          </div>

          {/* Valorisation des Stocks */}
          <div className="p-4 rounded-xl border border-slate-200 space-y-2">
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Valorisation du Stock en Rayon & Entrepôt
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50">
                <span className="text-slate-500">Valeur d'Achat (Coût de revient) :</span>
                <p className="font-mono font-black text-slate-900 text-sm mt-0.5">
                  {formatAmount(totalStockValueAchat)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <span className="text-slate-500">Valeur Vente Estimée :</span>
                <p className="font-mono font-black text-blue-600 text-sm mt-0.5">
                  {formatAmount(totalStockValueVente)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50">
                <span className="text-emerald-800 font-semibold">Marge Brute Potentielle :</span>
                <p className="font-mono font-black text-emerald-700 text-sm mt-0.5">
                  {formatAmount(Math.max(0, totalStockValueVente - totalStockValueAchat))}
                </p>
              </div>
            </div>
          </div>

          {/* Footnotes */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>KingFlow SaaS Business Platform</span>
            <span>Document certifié conforme à la comptabilité interne</span>
          </div>
        </div>
      </div>
    </div>
  );
}
