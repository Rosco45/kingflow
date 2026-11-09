"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  ShoppingCart,
  FileText,
  Boxes,
  Clock,
  ArrowUpRight,
  MoreVertical,
  Calendar as CalendarIcon,
  ChevronDown,
  Plus,
  Sparkles,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { DashboardStats, InvoiceData, ProductData } from "@/types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import ProductIllustration from "../common/ProductIllustration";
import CalendarAgendaModal from "./CalendarAgendaModal";
import { TabId } from "../layout/Sidebar";

interface DashboardViewProps {
  onNavigateToTab: (tab: TabId) => void;
  onQuickCreate: (type: "invoice" | "quote" | "customer" | "expense") => void;
  onOpenInvoice: (invoice: InvoiceData) => void;
}

export default function DashboardView({
  onNavigateToTab,
  onQuickCreate,
  onOpenInvoice,
}: DashboardViewProps) {
  const { formatAmount } = useCurrency();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Time range filter for sales evolution chart
  const [timeRange, setTimeRange] = useState<"7j" | "30j" | "90j" | "1an">("7j");

  // Calendar Modal State
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error loading dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // 7-day sales curve data matching the reference image layout
  const sales7DaysData = [
    { day: "Lun", sales: 420000 },
    { day: "Mar", sales: 780000 },
    { day: "Mer", sales: 890000 },
    { day: "Jeu", sales: 1150000 },
    { day: "Ven", sales: 1420000 },
    { day: "Sam", sales: 1850000 },
    { day: "Dim", sales: 1320000 },
  ];

  const sales30DaysData = [
    { day: "Sem 1", sales: 2450000 },
    { day: "Sem 2", sales: 3100000 },
    { day: "Sem 3", sales: 2890000 },
    { day: "Sem 4", sales: 3650000 },
  ];

  const currentChartData = timeRange === "7j" ? sales7DaysData : sales30DaysData;

  // Payment Breakdown Donut Chart
  const paymentBreakdownData = [
    { name: "Espèces", value: 42.5, amount: 1041250, color: "#2563eb" }, // Blue
    { name: "Mobile Money", value: 38.1, amount: 933450, color: "#10b981" }, // Emerald Green
    { name: "Virement", value: 19.4, amount: 475300, color: "#8b5cf6" }, // Purple
  ];

  // Today date format: 9 novembre 2026
  const todayFormatted = "9 novembre 2026";

  // Watchlist stock products (enriched with realistic items)
  const stockWatchlist = [
    {
      id: "prod-1",
      name: "Ordinateur Portable HP",
      category: "Informatique",
      sku: "HP-15-PRO",
      stockQuantity: 3,
      minStockAlert: 5,
      status: "Stock faible",
    },
    {
      id: "prod-2",
      name: "Casque Bluetooth",
      category: "Audio",
      sku: "BT-HEAD-01",
      stockQuantity: 5,
      minStockAlert: 8,
      status: "Stock faible",
    },
    {
      id: "prod-3",
      name: "Souris Sans Fil",
      category: "Accessoires",
      sku: "WL-MOUSE-X",
      stockQuantity: 8,
      minStockAlert: 10,
      status: "Stock faible",
    },
    {
      id: "prod-4",
      name: "Onduleur APC Back-UPS 800VA",
      category: "Énergie",
      sku: "PRD-OND-005",
      stockQuantity: 0,
      minStockAlert: 4,
      status: "Rupture de stock",
    },
  ];

  interface TransactionItem {
    id: string;
    rawInvoice?: InvoiceData;
    client: string;
    initials: string;
    ref: string;
    date: string;
    amount: number;
    isPaid: boolean;
    statusLabel: string;
  }

  // Dynamic Recent Transactions matching reference format
  const recentTransactions: TransactionItem[] = stats?.recentInvoices && stats.recentInvoices.length > 0
    ? stats.recentInvoices.map((inv, idx) => {
        const initials = inv.customer?.name
          ? inv.customer.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
          : "CL";

        return {
          id: inv.id,
          rawInvoice: inv,
          client: inv.customer?.name || "Client Comptant",
          initials,
          ref: inv.number.replace("FACT-", "VNT-").replace("DEV-", "DEV-"),
          date: new Date(inv.issueDate).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }) + " • " + (idx === 0 ? "14:32" : idx === 1 ? "13:50" : idx === 2 ? "11:20" : "10:15"),
          amount: inv.total,
          isPaid: inv.status === "PAID",
          statusLabel: inv.status === "PAID" ? "Payée" : "En attente",
        };
      })
    : [
        {
          id: "1",
          client: "Jean Dupont",
          initials: "JD",
          ref: "VNT-2026-1148",
          date: "09/11/2026 • 14:32",
          amount: 450000,
          isPaid: true,
          statusLabel: "Payée",
        },
        {
          id: "2",
          client: "Marie Koffi",
          initials: "MK",
          ref: "VNT-2026-1147",
          date: "09/11/2026 • 13:50",
          amount: 275000,
          isPaid: false,
          statusLabel: "En attente",
        },
        {
          id: "3",
          client: "Abdoulaye Diallo",
          initials: "AD",
          ref: "VNT-2026-1146",
          date: "09/11/2026 • 11:20",
          amount: 620000,
          isPaid: true,
          statusLabel: "Payée",
        },
        {
          id: "4",
          client: "Sophie Soglo",
          initials: "SS",
          ref: "VNT-2026-1145",
          date: "09/11/2026 • 10:15",
          amount: 180000,
          isPaid: true,
          statusLabel: "Payée",
        },
      ];

  const totalRevenue = stats?.monthlyRevenue || 2450000;
  const totalSalesCount = 128;
  const pendingInvoicesCount = stats?.unpaidInvoicesCount || 14;
  const totalStockCount = 342;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* 1. Dashboard Header: Greeting on Left & Date / Action Button on Right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Bonjour, Roserick</span>
            <span className="text-2xl animate-pulse">👋</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Voici un aperçu de votre activité aujourd'hui.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Interactive Date Pill Button with Calendar Popover */}
          <button
            onClick={() => setIsCalendarOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold shadow-sm transition-all group"
            title="Cliquez pour ouvrir l'agenda et les dates clés"
          >
            <CalendarIcon className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
            <span>{todayFormatted}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>

          {/* Primary Action Button */}
          <button
            onClick={() => onQuickCreate("invoice")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nouvelle vente</span>
          </button>
        </div>
      </div>

      {/* 2. Four KPI Cards in a row - Identical to reference image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* KPI 1: Chiffre d'affaires */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-[#2563eb] text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500">Chiffre d'affaires</span>
              <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight leading-tight">
                {formatAmount(totalRevenue)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              ↗ +12,8%
            </span>
            {/* Sparkline curve preview */}
            <svg className="w-20 h-6 text-blue-500" viewBox="0 0 80 24" fill="none">
              <path
                d="M2 18 C 20 22, 35 8, 50 14 C 65 20, 70 6, 78 4"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* KPI 2: Ventes */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-[#10b981] text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500">Ventes</span>
              <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight leading-tight">
                {totalSalesCount}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              ↗ +8,2%
            </span>
            <svg className="w-20 h-6 text-emerald-500" viewBox="0 0 80 24" fill="none">
              <path
                d="M2 20 C 20 18, 35 10, 50 12 C 65 14, 70 6, 78 2"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* KPI 3: Factures en attente */}
        <div
          onClick={() => onNavigateToTab("debts")}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-[#f59e0b] text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500">Factures en attente</span>
              <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight leading-tight">
                {pendingInvoicesCount}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> À suivre
            </span>
            <svg className="w-20 h-6 text-amber-500" viewBox="0 0 80 24" fill="none">
              <path
                d="M2 14 C 20 8, 35 18, 50 12 C 65 8, 70 16, 78 10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* KPI 4: Produits en stock */}
        <div
          onClick={() => onNavigateToTab("inventory")}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-[#8b5cf6] text-white flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500">Produits en stock</span>
              <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight leading-tight">
                {totalStockCount}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-bold text-purple-600 flex items-center gap-1">
              ↗ +5,4%
            </span>
            <svg className="w-20 h-6 text-purple-500" viewBox="0 0 80 24" fill="none">
              <path
                d="M2 16 C 20 20, 35 12, 50 10 C 65 8, 70 14, 78 6"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Middle Row: Évolution des ventes (2 cols) & Répartition des ventes (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Évolution des ventes */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                Évolution des ventes
              </h3>
            </div>

            {/* Time filter tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {(["7j", "30j", "90j", "1an"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    timeRange === range
                      ? "bg-[#2563eb] text-white shadow-sm font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {range === "1an" ? "1 an" : range}
                </button>
              ))}
            </div>
          </div>

          {/* Area Chart with smooth gradient as in reference */}
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => {
                    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`.replace(".0M", "M");
                    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                    return val;
                  }}
                />
                <Tooltip
                  formatter={(value: any) => [formatAmount(Number(value) || 0), "Ventes"]}
                  contentStyle={{
                    backgroundColor: "#0a1228",
                    color: "#ffffff",
                    borderRadius: "14px",
                    border: "1px solid #1e3160",
                    fontSize: "12px",
                    fontWeight: 700,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#salesGradient)"
                  dot={{ r: 4, fill: "#2563eb", stroke: "#ffffff", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#2563eb", stroke: "#ffffff", strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Répartition des ventes (Donut Chart) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
            <h3 className="font-extrabold text-slate-900 text-base">
              Répartition des ventes
            </h3>
          </div>

          {/* Donut Chart with Center Amount */}
          <div className="relative h-56 flex items-center justify-center my-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={88}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {paymentBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val}%`, "Part"]}
                  contentStyle={{
                    backgroundColor: "#0a1228",
                    color: "#ffffff",
                    borderRadius: "12px",
                    fontSize: "11px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-slate-900 font-mono tracking-tight">
                2,45M
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                FCFA
              </span>
            </div>
          </div>

          {/* Legend on Bottom matching reference */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            {paymentBreakdownData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-slate-700">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Transactions récentes & Stock à surveiller avec illustrations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Transactions récentes (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                Transactions récentes
              </h3>
            </div>
            <button
              onClick={() => onNavigateToTab("invoicing")}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Voir tout</span>
              <span>➔</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-bold text-slate-400 uppercase border-b border-slate-100 pb-2">
                <tr>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Référence</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Montant</th>
                  <th className="py-2.5 px-3 text-center">Statut</th>
                  <th className="py-2.5 px-2 text-center w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => {
                      if (tx.rawInvoice) onOpenInvoice(tx.rawInvoice);
                      else onNavigateToTab("invoicing");
                    }}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                          {tx.initials}
                        </div>
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {tx.client}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 text-xs">
                      {tx.ref}
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-xs whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-slate-900 text-xs sm:text-sm">
                      {formatAmount(tx.amount)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold ${
                          tx.isPaid
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {tx.statusLabel}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-slate-400 hover:text-slate-700">
                      <MoreVertical className="w-4 h-4 mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Stock à surveiller avec illustrations détaillées (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Stock à surveiller
                </h3>
              </div>
              <button
                onClick={() => onNavigateToTab("inventory")}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Voir tout</span>
                <span>➔</span>
              </button>
            </div>

            {/* List with rich illustrations as in reference screenshot */}
            <div className="divide-y divide-slate-100 mt-2">
              {stockWatchlist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigateToTab("inventory")}
                  className="py-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/80 rounded-xl px-1.5 -mx-1.5 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Illustration vignette */}
                    <ProductIllustration
                      name={item.name}
                      category={item.category}
                      sku={item.sku}
                      size="md"
                    />

                    <div className="min-w-0">
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm group-hover:text-blue-600 transition-colors truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Stock : <strong className="text-slate-800">{item.stockQuantity} unités</strong>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                      item.stockQuantity === 0
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => onNavigateToTab("inventory")}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all text-center"
            >
              Gérer les réapprovisionnements
            </button>
          </div>
        </div>
      </div>

      {/* 5. Interactive Calendar & Agenda Modal */}
      <CalendarAgendaModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={new Date("2026-11-09T09:00:00")}
        onEventChanged={() => fetchStats()}
      />
    </div>
  );
}
