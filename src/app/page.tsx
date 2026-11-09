"use client";

import React, { useState, useEffect } from "react";
import Sidebar, { TabId } from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import DashboardView from "@/components/dashboard/DashboardView";
import InvoicesView from "@/components/invoicing/InvoicesView";
import ClientsView from "@/components/clients/ClientsView";
import SuppliersView from "@/components/suppliers/SuppliersView";
import InventoryView from "@/components/inventory/InventoryView";
import TreasuryView from "@/components/treasury/TreasuryView";
import DebtsView from "@/components/treasury/DebtsView";
import ReportsView from "@/components/reports/ReportsView";
import SettingsView from "@/components/settings/SettingsView";
import InvoiceModal from "@/components/invoicing/InvoiceModal";
import GlobalSearchModal from "@/components/layout/GlobalSearchModal";
import { InvoiceData, DocumentType } from "@/types";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Search Modal (Ctrl + K)
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Quick Action Invoice Modal
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [modalDocType, setModalDocType] = useState<DocumentType>("INVOICE");
  const [modalCustomerId, setModalCustomerId] = useState<string | undefined>();

  // Document viewing state passed to InvoicesView
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<InvoiceData | null>(null);

  // Badge alert counts
  const [lowStockCount, setLowStockCount] = useState(0);
  const [pendingReceivablesCount, setPendingReceivablesCount] = useState(0);

  const fetchAlertCounts = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const data = await res.json();
        setLowStockCount((data.lowStockCount || 0) + (data.outOfStockCount || 0));
        setPendingReceivablesCount(data.unpaidInvoicesCount || 0);
      }
    } catch (err) {
      console.warn("Could not fetch alerts:", err);
    }
  };

  useEffect(() => {
    fetchAlertCounts();
    const interval = setInterval(fetchAlertCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K for Global Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleQuickCreate = (type: "invoice" | "quote" | "customer" | "expense") => {
    if (type === "invoice") {
      setModalDocType("INVOICE");
      setModalCustomerId(undefined);
      setIsInvoiceModalOpen(true);
    } else if (type === "quote") {
      setModalDocType("QUOTE");
      setModalCustomerId(undefined);
      setIsInvoiceModalOpen(true);
    } else if (type === "customer") {
      setActiveTab("clients");
    } else if (type === "expense") {
      setActiveTab("treasury");
    }
  };

  const handleQuickInvoiceForCustomer = (customerId: string) => {
    setModalDocType("INVOICE");
    setModalCustomerId(customerId);
    setIsInvoiceModalOpen(true);
  };

  const handleOpenInvoiceFromAnywhere = (invoice: InvoiceData) => {
    setSelectedInvoiceForView(invoice);
    setActiveTab("invoicing");
  };

  return (
    <div className="min-h-screen bg-[#f4f7fc] dark:bg-[#070d1e] text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Sidebar Navigation - 64 width */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        lowStockCount={lowStockCount}
        pendingReceivablesCount={pendingReceivablesCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <Navbar
          onMenuClick={() => setMobileMenuOpen(true)}
          activeTab={activeTab}
          onOpenSearch={() => setIsSearchOpen(true)}
          onQuickCreate={handleQuickCreate}
          lowStockCount={lowStockCount}
          pendingReceivablesCount={pendingReceivablesCount}
          onNavigateToTab={setActiveTab}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "dashboard" && (
            <DashboardView
              onNavigateToTab={setActiveTab}
              onQuickCreate={handleQuickCreate}
              onOpenInvoice={handleOpenInvoiceFromAnywhere}
            />
          )}

          {activeTab === "sales" && (
            <InvoicesView
              mode="sales"
              onOpenCreate={(type) => {
                setModalDocType(type);
                setModalCustomerId(undefined);
                setIsInvoiceModalOpen(true);
              }}
              selectedInvoiceForView={selectedInvoiceForView}
              onClearSelectedInvoice={() => setSelectedInvoiceForView(null)}
            />
          )}

          {activeTab === "invoicing" && (
            <InvoicesView
              mode="all"
              onOpenCreate={(type) => {
                setModalDocType(type);
                setModalCustomerId(undefined);
                setIsInvoiceModalOpen(true);
              }}
              selectedInvoiceForView={selectedInvoiceForView}
              onClearSelectedInvoice={() => setSelectedInvoiceForView(null)}
            />
          )}

          {activeTab === "clients" && (
            <ClientsView
              onQuickInvoice={handleQuickInvoiceForCustomer}
              onOpenInvoice={handleOpenInvoiceFromAnywhere}
            />
          )}

          {activeTab === "suppliers" && <SuppliersView />}

          {activeTab === "inventory" && <InventoryView />}

          {activeTab === "treasury" && <TreasuryView />}

          {activeTab === "debts" && (
            <DebtsView
              onOpenInvoice={handleOpenInvoiceFromAnywhere}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === "reports" && <ReportsView />}

          {activeTab === "settings" && <SettingsView />}
        </main>
      </div>

      {/* Global Command Palette / Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateToTab={setActiveTab}
        onOpenInvoice={handleOpenInvoiceFromAnywhere}
      />

      {/* Quick Invoice & Quote Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        initialType={modalDocType}
        initialCustomerId={modalCustomerId}
        onSuccess={() => {
          fetchAlertCounts();
        }}
      />
    </div>
  );
}
