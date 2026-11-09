"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Users,
  Boxes,
  Wallet,
  BarChart3,
  Settings,
  X,
  Rocket,
  ChevronDown,
  Moon,
  Sun,
  Palette,
  Sparkles,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { useTheme } from "@/context/ThemeContext";

export type TabId =
  | "dashboard"
  | "sales"
  | "invoicing"
  | "clients"
  | "suppliers"
  | "inventory"
  | "treasury"
  | "debts"
  | "reports"
  | "settings";

interface SidebarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  lowStockCount?: number;
  pendingReceivablesCount?: number;
  onOpenPromo?: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
  lowStockCount = 0,
  pendingReceivablesCount = 0,
  onOpenPromo,
}: SidebarProps) {
  const { companySettings } = useCurrency();
  const { theme, toggleTheme, setTheme } = useTheme();
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  // Banner reappears at each page reload, but can be dismissed during the session
  const [showPremiumBanner, setShowPremiumBanner] = useState(true);

  useEffect(() => {
    try {
      localStorage.removeItem("kingflow_hide_premium");
    } catch (err) {}
  }, []);

  const navItems = [
    {
      id: "dashboard" as TabId,
      label: "Tableau de bord",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "sales" as TabId,
      label: "Ventes",
      icon: ShoppingCart,
      badge: null,
    },
    {
      id: "invoicing" as TabId,
      label: "Factures",
      icon: FileText,
      badge: pendingReceivablesCount > 0 ? `${pendingReceivablesCount}` : null,
      badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    },
    {
      id: "clients" as TabId,
      label: "Clients",
      icon: Users,
      badge: null,
    },
    {
      id: "inventory" as TabId,
      label: "Produits & stocks",
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount}` : null,
      badgeColor: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
    },
    {
      id: "treasury" as TabId,
      label: "Dépenses",
      icon: Wallet,
      badge: null,
    },
    {
      id: "reports" as TabId,
      label: "Rapports",
      icon: BarChart3,
      badge: null,
    },
    {
      id: "settings" as TabId,
      label: "Paramètres",
      icon: Settings,
      badge: null,
    },
  ];

  const handleSelect = (tab: TabId) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container - Bleu Nuit Profond as in reference image */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0a1228] text-slate-200 flex flex-col border-r border-[#152347] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-[#152347]/80">
          <div className="flex items-center gap-3">
            {/* Custom stylized "K" Logo */}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-600/30 text-white font-black text-2xl tracking-tight shrink-0">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M4 3h4v8.2L14.4 3H19l-7.3 9 7.8 9h-4.6L9.6 13.5 8 15.3V21H4V3z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  KingFlow
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate leading-tight">
                Gestion intelligente, croissance assurée
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                  isActive
                    ? "bg-[#2563eb] text-white shadow-lg shadow-blue-600/30 font-bold"
                    : "text-slate-300 hover:text-white hover:bg-[#131f42]/70"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Promo Upgrade Card - Dismissible */}
        {showPremiumBanner && (
          <div className="p-4 border-t border-[#152347]/60 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#101c3d] to-[#0a1228] border border-[#1e3160] text-center space-y-2.5 relative overflow-hidden shadow-lg group">
              {/* Close Cross Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPremiumBanner(false);
                }}
                className="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-10"
                title="Fermer cette bannière"
                aria-label="Fermer la bannière premium"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-inner">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-white">Passez à la version Premium</h5>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                  Plus de fonctionnalités pour aller plus loin.
                </p>
              </div>
              <button
                onClick={() => {
                  if (onOpenPromo) onOpenPromo();
                  else setActiveTab("settings");
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Découvrir</span>
                <span>➔</span>
              </button>
            </div>
          </div>
        )}

        {/* User Profile & Theme Switcher Footer - Exactly as in the reference image */}
        <div className="p-3 border-t border-[#152347] bg-[#070d1e]">
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#131f42]/70 cursor-pointer transition-colors group">
            <div
              onClick={() => setActiveTab("settings")}
              className="flex items-center gap-2.5 min-w-0 flex-1"
            >
              {/* Avatar circle "RK" */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-indigo-600/30 shrink-0">
                RK
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">Roserick K.</p>
                <p className="text-[10px] text-slate-400 truncate">Administrateur</p>
              </div>
            </div>

            {/* Quick theme trigger */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setThemeMenuOpen(!themeMenuOpen);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e2f59] transition-colors"
                title="Changer de thème"
              >
                {theme === "light" ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-blue-400" />
                )}
              </button>

              {themeMenuOpen && (
                <div className="absolute right-0 bottom-full mb-2 w-44 bg-[#0f1b38] rounded-xl shadow-2xl border border-[#1e3160] py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Thème d'affichage
                  </div>
                  <button
                    onClick={() => {
                      setTheme("light");
                      setThemeMenuOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#192b57] ${
                      theme === "light" ? "text-blue-400 font-bold" : "text-slate-300"
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Fond Blanc Légèrement Bleu</span>
                  </button>
                  <button
                    onClick={() => {
                      setTheme("dark");
                      setThemeMenuOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#192b57] ${
                      theme === "dark" ? "text-blue-400 font-bold" : "text-slate-300"
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-blue-400" />
                    <span>Bleu Nuit Sombre</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
