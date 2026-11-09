"use client";

import React, { useState } from "react";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Coins,
  ChevronDown,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { useTheme } from "@/context/ThemeContext";
import { TabId } from "./Sidebar";

interface NavbarProps {
  onMenuClick: () => void;
  activeTab: TabId;
  onOpenSearch: () => void;
  onQuickCreate?: (type: "invoice" | "quote" | "customer" | "expense") => void;
  lowStockCount?: number;
  pendingReceivablesCount?: number;
  onNavigateToTab: (tab: TabId) => void;
}

export default function Navbar({
  onMenuClick,
  onOpenSearch,
  lowStockCount = 0,
  pendingReceivablesCount = 0,
  onNavigateToTab,
}: NavbarProps) {
  const { currency, setCurrency, addToast } = useCurrency();
  const { theme, toggleTheme } = useTheme();

  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const totalAlerts = lowStockCount + pendingReceivablesCount;

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#f4f7fc]/95 dark:bg-[#0b1329]/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/80 transition-colors">
      {/* Left: Mobile hamburger & Global Search Bar as in reference */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors shrink-0"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search bar matching reference screenshot */}
        <div
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-white dark:bg-[#0f1b38] border border-slate-200 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 shadow-sm cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-2.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 min-w-0">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
            <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 truncate">
              Rechercher une vente, un client, un produit...
            </span>
          </div>

          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Ctrl + K
          </kbd>
        </div>
      </div>

      {/* Right Controls: Notifications, Theme Switcher & Currency */}
      <div className="flex items-center gap-2 sm:gap-3.5 ml-3 shrink-0">
        {/* Currency Switcher */}
        <div className="relative">
          <button
            onClick={() => setCurrencyOpen(!currencyOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1b38] text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm hover:bg-slate-50 transition-all"
          >
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-bold">{currency}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {currencyOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-[#0f1b38] rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 z-50 animate-in fade-in zoom-in-95 text-xs">
              <button
                onClick={() => {
                  setCurrency("XOF");
                  setCurrencyOpen(false);
                  addToast({
                    type: "info",
                    title: "Devise : FCFA (XOF)",
                  });
                }}
                className={`w-full px-3 py-1.5 text-left flex justify-between ${
                  currency === "XOF" ? "text-blue-600 font-bold bg-blue-50/50" : "text-slate-700 dark:text-slate-200"
                }`}
              >
                <span>Franc CFA</span>
                <span className="font-mono text-slate-400">FCFA</span>
              </button>
              <button
                onClick={() => {
                  setCurrency("EUR");
                  setCurrencyOpen(false);
                  addToast({
                    type: "info",
                    title: "Devise : Euro (€)",
                  });
                }}
                className={`w-full px-3 py-1.5 text-left flex justify-between ${
                  currency === "EUR" ? "text-blue-600 font-bold bg-blue-50/50" : "text-slate-700 dark:text-slate-200"
                }`}
              >
                <span>Euro</span>
                <span className="font-mono text-slate-400">€</span>
              </button>
              <button
                onClick={() => {
                  setCurrency("USD");
                  setCurrencyOpen(false);
                  addToast({
                    type: "info",
                    title: "Devise : Dollar ($)",
                  });
                }}
                className={`w-full px-3 py-1.5 text-left flex justify-between ${
                  currency === "USD" ? "text-blue-600 font-bold bg-blue-50/50" : "text-slate-700 dark:text-slate-200"
                }`}
              >
                <span>Dollar US</span>
                <span className="font-mono text-slate-400">$</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Icon with red count pill */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition-colors relative"
            title="Notifications & alertes"
          >
            <Bell className="w-5 h-5" />
            {totalAlerts > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                {totalAlerts > 9 ? "9+" : totalAlerts}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0f1b38] rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-white">
                  Alertes directes
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                  {totalAlerts} active(s)
                </span>
              </div>
              <div className="py-2 space-y-2 text-xs">
                {lowStockCount > 0 && (
                  <div
                    onClick={() => {
                      setNotifOpen(false);
                      onNavigateToTab("inventory");
                    }}
                    className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 cursor-pointer"
                  >
                    <p className="font-bold text-amber-900 dark:text-amber-200">
                      ⚠️ {lowStockCount} article(s) à surveiller
                    </p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                      Articles sous le seuil d'alerte en rayon.
                    </p>
                  </div>
                )}
                {pendingReceivablesCount > 0 && (
                  <div
                    onClick={() => {
                      setNotifOpen(false);
                      onNavigateToTab("debts");
                    }}
                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 cursor-pointer"
                  >
                    <p className="font-bold text-rose-900 dark:text-rose-200">
                      💳 {pendingReceivablesCount} créance(s) en attente
                    </p>
                    <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">
                      Factures échues à relancer sur WhatsApp.
                    </p>
                  </div>
                )}
                {totalAlerts === 0 && (
                  <p className="text-center text-slate-400 py-3">Aucune alerte en attente.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Switcher Toggle - Smooth sliding switch */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <button
            onClick={toggleTheme}
            type="button"
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              theme === "dark" ? "bg-blue-600" : "bg-slate-300"
            }`}
            title={theme === "dark" ? "Passer au fond clair avec touche de bleu" : "Passer au thème sombre bleu nuit"}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                theme === "dark" ? "translate-x-5" : "translate-x-0"
              }`}
            >
              {theme === "dark" ? (
                <Moon className="w-3 h-3 text-blue-600" />
              ) : (
                <Sun className="w-3 h-3 text-amber-500" />
              )}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
