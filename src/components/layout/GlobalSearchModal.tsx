"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  Package,
  Users,
  FileText,
  Calendar,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { ProductData, CustomerData, InvoiceData } from "@/types";
import { TabId } from "./Sidebar";
import ProductIllustration from "../common/ProductIllustration";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: TabId) => void;
  onOpenInvoice: (invoice: InvoiceData) => void;
}

export default function GlobalSearchModal({
  isOpen,
  onClose,
  onNavigateToTab,
  onOpenInvoice,
}: GlobalSearchModalProps) {
  const { formatAmount } = useCurrency();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductData[]>([]);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      loadInitialData();
    }
  }, [isOpen]);

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

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [pRes, cRes, iRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/customers"),
        fetch("/api/invoices"),
      ]);
      if (pRes.ok) setProducts(await pRes.json());
      if (cRes.ok) setCustomers(await cRes.json());
      if (iRes.ok) setInvoices(await iRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredProducts = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    : products.slice(0, 3);

  const filteredCustomers = q
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.companyName && c.companyName.toLowerCase().includes(q)) ||
          (c.phone && c.phone.includes(q))
      )
    : customers.slice(0, 3);

  const filteredInvoices = q
    ? invoices.filter(
        (i) =>
          i.number.toLowerCase().includes(q) ||
          (i.customer?.name && i.customer.name.toLowerCase().includes(q))
      )
    : invoices.slice(0, 3);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto animate-in fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#0c1633] rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 cursor-default my-auto sm:my-0"
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633]">
          <Search className="w-5 h-5 text-blue-600 shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                onClose();
              }
            }}
            placeholder="Rechercher une vente, un client, un produit, une référence..."
            className="w-full text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 bg-transparent focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-2"
              title="Effacer la saisie"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700 transition-colors mr-2 cursor-pointer"
            title="Fermer la recherche (Échap)"
          >
            <span>Échap</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Fermer (Échap ou clic extérieur)"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5 bg-[#f8faff]">
          {/* Products Group */}
          {filteredProducts.length > 0 && (
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-blue-600" />
                  Produits & Stocks ({filteredProducts.length})
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToTab("inventory");
                  }}
                  className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  Voir catalogue <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-1.5">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onClose();
                      onNavigateToTab("inventory");
                    }}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ProductIllustration name={p.name} category={p.category} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {p.name}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {p.sku} • {p.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-mono font-black text-slate-900">
                        {formatAmount(p.sellingPrice)}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Stock: {p.stockQuantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customers Group */}
          {filteredCustomers.length > 0 && (
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  Clients & CRM ({filteredCustomers.length})
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToTab("clients");
                  }}
                  className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                >
                  Voir clients <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-1.5">
                {filteredCustomers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onClose();
                      onNavigateToTab("clients");
                    }}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                          {c.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {c.companyName || c.phone || "Particulier"}
                        </p>
                      </div>
                    </div>
                    {c.balanceDue && c.balanceDue > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800">
                        Dû: {formatAmount(c.balanceDue)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-600 font-bold">À jour</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invoices Group */}
          {filteredInvoices.length > 0 && (
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  Factures & Ventes ({filteredInvoices.length})
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToTab("invoicing");
                  }}
                  className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  Voir factures <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-1.5">
                {filteredInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => {
                      onClose();
                      onOpenInvoice(inv);
                    }}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-blue-600">
                          {inv.number}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {inv.customer?.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Émis le {new Date(inv.issueDate).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono font-black text-slate-900">
                        {formatAmount(inv.total)}
                      </p>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          inv.status === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredProducts.length === 0 &&
            filteredCustomers.length === 0 &&
            filteredInvoices.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs">
                Aucun résultat pour "{query}". Essayez un autre mot-clé.
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
