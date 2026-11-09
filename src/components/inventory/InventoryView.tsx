"use client";

import React, { useState, useEffect } from "react";
import {
  Boxes,
  Search,
  Plus,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  History,
  SlidersHorizontal,
  PackageCheck,
  PackageX,
  PackageMinus,
  Edit2,
  Trash2,
  X,
  RefreshCw,
  Barcode,
  Layers,
  Sparkles,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { ProductData, StockMovementData } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const productSchema = z.object({
  sku: z.string().optional(),
  name: z.string().min(2, "Le nom de l'article est requis"),
  description: z.string().optional(),
  category: z.string().min(1, "Catégorie requise"),
  type: z.enum(["PRODUCT", "SERVICE"]),
  purchasePrice: z.number().min(0, "Prix positif requis"),
  sellingPrice: z.number().min(0, "Prix positif requis"),
  stockQuantity: z.number().min(0, "Stock positif requis"),
  minStockAlert: z.number().min(0),
  unit: z.string(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function InventoryView() {
  const { formatAmount, addToast } = useCurrency();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [stockStatusFilter, setStockStatusFilter] = useState("ALL");

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<ProductData | null>(null);
  const [historyProduct, setHistoryProduct] = useState<ProductData | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Adjustment Form State
  const [adjType, setAdjType] = useState<"IN" | "OUT" | "ADJUSTMENT">("IN");
  const [adjQty, setAdjQty] = useState(1);
  const [adjReason, setAdjReason] = useState("RECEPTION_FOURNISSEUR");
  const [adjNotes, setAdjNotes] = useState("");
  const [adjSubmitting, setAdjSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      category: "Informatique",
      type: "PRODUCT",
      purchasePrice: 0,
      sellingPrice: 0,
      stockQuantity: 0,
      minStockAlert: 5,
      unit: "unité",
    },
  });

  const selectedType = watch("type");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      if (stockStatusFilter !== "ALL") params.set("stockStatus", stockStatusFilter);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, categoryFilter, typeFilter, stockStatusFilter]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    reset({
      sku: `ART-${Math.floor(100 + Math.random() * 900)}-${Date.now().toString().slice(-4)}`,
      name: "",
      description: "",
      category: "Matériel",
      type: "PRODUCT",
      purchasePrice: 0,
      sellingPrice: 0,
      stockQuantity: 0,
      minStockAlert: 5,
      unit: "unité",
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEdit = (prod: ProductData) => {
    setEditingProduct(prod);
    reset({
      sku: prod.sku,
      name: prod.name,
      description: prod.description || "",
      category: prod.category,
      type: prod.type,
      purchasePrice: prod.purchasePrice,
      sellingPrice: prod.sellingPrice,
      stockQuantity: prod.stockQuantity,
      minStockAlert: prod.minStockAlert,
      unit: prod.unit,
    });
    setIsProductModalOpen(true);
  };

  const onSubmitProduct = async (values: ProductFormValues) => {
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        addToast({
          type: "success",
          title: editingProduct ? "Article mis à jour" : "Article ajouté au catalogue",
          description: `${values.name} a été enregistré avec succès.`,
        });
        setIsProductModalOpen(false);
        fetchProducts();
      } else {
        const err = await res.json();
        addToast({
          type: "error",
          title: "Erreur",
          description: err.error || "Impossible d'enregistrer le produit.",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAdjustment = (prod: ProductData) => {
    setAdjustingProduct(prod);
    setAdjType("IN");
    setAdjQty(1);
    setAdjReason("RECEPTION_FOURNISSEUR");
    setAdjNotes("");
  };

  const handleSubmitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    try {
      setAdjSubmitting(true);
      const res = await fetch(`/api/products/${adjustingProduct.id}/stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: adjType,
          quantity: adjQty,
          reason: adjReason,
          notes: adjNotes,
        }),
      });

      if (res.ok) {
        addToast({
          type: "success",
          title: "Mouvement de stock enregistré",
          description: `Nouveau stock pour ${adjustingProduct.name}.`,
        });
        setAdjustingProduct(null);
        fetchProducts();
      } else {
        const err = await res.json();
        addToast({
          type: "error",
          title: "Erreur d'ajustement",
          description: err.error || "Opération refusée.",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdjSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast({
          type: "success",
          title: "Article retiré du catalogue",
        });
        setDeleteConfirmId(null);
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Derive all unique categories
  const categories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Search & Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par désignation, référence SKU, catégorie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
          >
            <option value="ALL">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
          >
            <option value="ALL">Tous les statuts de stock</option>
            <option value="LOW">⚠️ Stock faible / alerte</option>
            <option value="OUT">🛑 Rupture de stock (0)</option>
          </select>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel Article / Service</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Catalogue ({products.length} références)
          </span>
          <span className="text-xs text-slate-400">Cliquez sur un stock pour faire un ajustement</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">SKU / Réf</th>
                <th className="py-3 px-4">Désignation</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4 text-right">Prix Achat</th>
                <th className="py-3 px-4 text-right">Prix Vente</th>
                <th className="py-3 px-4 text-center">Quantité Stock</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {products.length > 0 ? (
                products.map((p) => {
                  const isService = p.type === "SERVICE";
                  const isOut = !isService && p.stockQuantity <= 0;
                  const isLow = !isService && p.stockQuantity > 0 && p.stockQuantity <= p.minStockAlert;

                  let badgeClass = "bg-emerald-100 text-emerald-800 border-emerald-200";
                  let badgeText = "En stock";

                  if (isService) {
                    badgeClass = "bg-indigo-100 text-indigo-800 border-indigo-200";
                    badgeText = "Service / Illimité";
                  } else if (isOut) {
                    badgeClass = "bg-rose-100 text-rose-800 border-rose-200 font-black";
                    badgeText = "Rupture de stock";
                  } else if (isLow) {
                    badgeClass = "bg-amber-100 text-amber-800 border-amber-200 font-bold";
                    badgeText = "Stock faible";
                  }

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {p.sku}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          {p.name}
                        </p>
                        {p.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                            {p.description}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[11px]">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                        {formatAmount(p.purchasePrice)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatAmount(p.sellingPrice)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isService ? (
                          <span className="text-slate-400 font-bold">—</span>
                        ) : (
                          <button
                            onClick={() => handleOpenAdjustment(p)}
                            className="font-mono font-black text-sm px-2.5 py-1 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                            title="Cliquer pour ajuster le stock"
                          >
                            <span>{p.stockQuantity}</span>
                            <span className="text-[10px] text-slate-400 font-normal ml-1">
                              {p.unit}s
                            </span>
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] border ${badgeClass}`}>
                          {badgeText}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!isService && (
                            <button
                              onClick={() => setHistoryProduct(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                              title="Historique des mouvements"
                            >
                              <History className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
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
                    <Boxes className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">Aucun produit ne correspond aux critères</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Ajustement de Stock</h3>
                <p className="text-xs text-slate-500 font-mono">{adjustingProduct.name}</p>
              </div>
              <button
                onClick={() => setAdjustingProduct(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdjustment} className="space-y-4 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-slate-600">Stock actuel en rayon :</span>
                <span className="font-mono font-black text-sm text-slate-900">
                  {adjustingProduct.stockQuantity} {adjustingProduct.unit}s
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Type de Mouvement</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjType("IN");
                      setAdjReason("RECEPTION_FOURNISSEUR");
                    }}
                    className={`py-2 px-2 rounded-xl border font-bold text-center transition-all ${
                      adjType === "IN"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    + Entrée
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjType("OUT");
                      setAdjReason("VENTE_DIRECTE");
                    }}
                    className={`py-2 px-2 rounded-xl border font-bold text-center transition-all ${
                      adjType === "OUT"
                        ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    - Sortie
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjType("ADJUSTMENT");
                      setAdjReason("INVENTAIRE");
                    }}
                    className={`py-2 px-2 rounded-xl border font-bold text-center transition-all ${
                      adjType === "ADJUSTMENT"
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Ajustement
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Quantité ({adjustingProduct.unit}s)
                </label>
                <input
                  type="number"
                  min="1"
                  value={adjQty}
                  onChange={(e) => setAdjQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Motif du mouvement</label>
                <select
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  <option value="RECEPTION_FOURNISSEUR">Réception commande fournisseur</option>
                  <option value="INVENTAIRE">Ajustement inventaire physique</option>
                  <option value="CASSE">Casse / Produit détérioré</option>
                  <option value="PERTE">Perte / Vol constaté</option>
                  <option value="RETOUR">Retour client en magasin</option>
                  <option value="AUTRE">Autre motif exceptionnel</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes explicatives</label>
                <textarea
                  rows={2}
                  value={adjNotes}
                  onChange={(e) => setAdjNotes(e.target.value)}
                  placeholder="Ex: Réception BL #408 ou inventaire de fin de mois..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={adjSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {adjSubmitting ? "Validation..." : "Valider le mouvement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock History Ledger Modal */}
      {historyProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Journal des Mouvements de Stock
                </h3>
                <p className="text-xs text-slate-500 font-mono">{historyProduct.name}</p>
              </div>
              <button
                onClick={() => setHistoryProduct(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 text-xs">
              {historyProduct.stockMovements && historyProduct.stockMovements.length > 0 ? (
                historyProduct.stockMovements.map((m) => {
                  const isIn = m.type === "IN" || m.quantity > 0;
                  return (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                            isIn ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {isIn ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {m.reason.replace(/_/g, " ")}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {new Date(m.createdAt).toLocaleString("fr-FR")}
                          </p>
                          {m.notes && <p className="text-[10px] text-slate-600 mt-1 italic">"{m.notes}"</p>}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p
                          className={`font-mono font-black text-xs ${
                            isIn ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {m.quantity > 0 ? `+${m.quantity}` : m.quantity} {historyProduct.unit}s
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {m.previousStock} ➔ {m.newStock}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-slate-400 py-6">Aucun mouvement archivé.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                {editingProduct ? "Modifier l'Article" : "Nouvel Article / Prestation"}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitProduct)} className="space-y-4 mt-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
                <label className="flex items-center justify-center gap-2 py-2 rounded-lg cursor-pointer text-xs font-bold transition-all">
                  <input
                    type="radio"
                    value="PRODUCT"
                    {...register("type")}
                    className="sr-only"
                  />
                  <span
                    className={`w-full py-1.5 text-center rounded-lg ${
                      selectedType === "PRODUCT"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    📦 Produit Physique
                  </span>
                </label>
                <label className="flex items-center justify-center gap-2 py-2 rounded-lg cursor-pointer text-xs font-bold transition-all">
                  <input
                    type="radio"
                    value="SERVICE"
                    {...register("type")}
                    className="sr-only"
                  />
                  <span
                    className={`w-full py-1.5 text-center rounded-lg ${
                      selectedType === "SERVICE"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    ⚡ Service / Prestation
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Désignation de l'article ou service *
                  </label>
                  <input
                    {...register("name")}
                    placeholder="Ex: PC Portable Dell Vostro 15"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                  {errors.name && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Code-barres / SKU
                  </label>
                  <input
                    {...register("sku")}
                    placeholder="Ex: PRD-LAP-001"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Catégorie</label>
                  <input
                    {...register("category")}
                    placeholder="Informatique, Consommables..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Prix d'Achat (FCFA)
                  </label>
                  <input
                    type="number"
                    {...register("purchasePrice", { valueAsNumber: true })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Prix de Vente (FCFA) *
                  </label>
                  <input
                    type="number"
                    {...register("sellingPrice", { valueAsNumber: true })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                {selectedType === "PRODUCT" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Quantité Initiale
                      </label>
                      <input
                        type="number"
                        {...register("stockQuantity", { valueAsNumber: true })}
                        disabled={!!editingProduct}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100"
                      />
                      {editingProduct && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          Utilisez le bouton Ajustement pour modifier le stock.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Seuil Alerte Stock Bas
                      </label>
                      <input
                        type="number"
                        {...register("minStockAlert", { valueAsNumber: true })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      />
                    </div>
                  </>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unité de mesure
                  </label>
                  <input
                    {...register("unit")}
                    placeholder="unité, pièce, carton, kg, forfait..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Description détaillée
                  </label>
                  <textarea
                    {...register("description")}
                    rows={2}
                    placeholder="Caractéristiques techniques, garantie..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Enregistrement..." : editingProduct ? "Mettre à jour" : "Ajouter l'article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <PackageX className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">Supprimer cet article ?</h4>
              <p className="text-xs text-slate-500 mt-1">
                L'historique des mouvements de stock associés sera également effacé.
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
                onClick={() => handleDeleteProduct(deleteConfirmId)}
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
