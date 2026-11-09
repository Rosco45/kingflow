"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CurrencyCode, CompanySettingsData } from "@/types";
import { formatCurrency as formatCurrUtil } from "@/lib/currency";

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  description?: string;
}

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  formatAmount: (amountInXof: number, includeDecimals?: boolean) => string;
  companySettings: CompanySettingsData | null;
  refreshSettings: () => Promise<void>;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
}

const defaultCompany: CompanySettingsData = {
  id: "default",
  name: "KingFlow Commerce SARL",
  tagline: "Solutions de Gestion Commerciale, Facturation & Stocks",
  email: "contact@kingflow.com",
  phone: "+221 77 450 89 20",
  whatsapp: "+221774508920",
  address: "14 Boulevard de la République",
  city: "Dakar",
  country: "Sénégal",
  taxId: "SN-DKR-2024-B-9942 / NINEA: 008741258",
  currency: "XOF",
  defaultVatRate: 18.0,
  invoiceTerms: "Paiement à 30 jours. Aucun escompte pour paiement anticipé.",
  receiptFooter: "Merci de votre fidélité ! À très bientôt.",
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("XOF");
  const [companySettings, setCompanySettings] = useState<CompanySettingsData | null>(defaultCompany);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    // Load persisted currency from localStorage
    const saved = localStorage.getItem("kingflow_currency") as CurrencyCode;
    if (saved && (saved === "XOF" || saved === "EUR" || saved === "USD")) {
      setCurrencyState(saved);
    }
    refreshSettings();
  }, []);

  const refreshSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setCompanySettings(data);
        if (!localStorage.getItem("kingflow_currency") && data.currency) {
          setCurrencyState(data.currency as CurrencyCode);
        }
      }
    } catch (err) {
      console.warn("Could not load company settings:", err);
    }
  };

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem("kingflow_currency", c);
  };

  const formatAmount = (amountInXof: number, includeDecimals: boolean = false) => {
    return formatCurrUtil(amountInXof, currency, includeDecimals);
  };

  const addToast = (toast: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatAmount,
        companySettings,
        refreshSettings,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
