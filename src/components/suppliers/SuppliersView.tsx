"use client";

import React, { useState, useEffect } from "react";
import {
  Truck,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Building,
  Receipt,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { SupplierData } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const supplierSchema = z.object({
  name: z.string().min(2, "Le nom du fournisseur est requis"),
  companyName: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  category: z.string().optional(),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

interface SuppliersViewProps {
  onQuickExpenseForSupplier?: (supplierId: string) => void;
}

export default function SuppliersView({ onQuickExpenseForSupplier }: SuppliersViewProps) {
  const { formatAmount, addToast } = useCurrency();
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierData | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      companyName: "",
      email: "",
      phone: "",
      address: "",
      category: "Fournisseur Général",
    },
  });

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const url = search ? `/api/suppliers?q=${encodeURIComponent(search)}` : "/api/suppliers";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data);
        if (selectedSupplier) {
          const updated = data.find((s: SupplierData) => s.id === selectedSupplier.id);
          if (updated) setSelectedSupplier(updated);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuppliers();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    reset({
      name: "",
      companyName: "",
      email: "",
      phone: "",
      address: "",
      category: "Fournisseur Général",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sup: SupplierData) => {
    setEditingSupplier(sup);
    reset({
      name: sup.name,
      companyName: sup.companyName || "",
      email: sup.email || "",
      phone: sup.phone || "",
      address: sup.address || "",
      category: sup.category || "Fournisseur Général",
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (values: SupplierFormValues) => {
    try {
      const url = editingSupplier ? `/api/suppliers/${editingSupplier.id}` : "/api/suppliers";
      const method = editingSupplier ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        addToast({
          type: "success",
          title: editingSupplier ? "Fournisseur modifié" : "Fournisseur ajouté",
          description: `${values.name} est enregistré avec succès.`,
        });
        setIsModalOpen(false);
        fetchSuppliers();
      } else {
        const err = await res.json();
        addToast({
          type: "error",
          title: "Erreur",
          description: err.error || "Impossible d'enregistrer le fournisseur.",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast({
          type: "success",
          title: "Fournisseur supprimé",
        });
        setDeleteConfirmId(null);
        if (selectedSupplier?.id === id) setSelectedSupplier(null);
        fetchSuppliers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, catégorie, téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Fournisseur</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${selectedSupplier ? "lg:col-span-2" : "lg:col-span-3"} space-y-3`}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Partenaires & Fournisseurs ({suppliers.length})
              </span>
              <span className="text-xs text-slate-400">Cliquez pour voir les dettes et achats</span>
            </div>

            <div className="divide-y divide-slate-100">
              {suppliers.length > 0 ? (
                suppliers.map((s) => {
                  const isSelected = selectedSupplier?.id === s.id;
                  const hasDebt = (s.totalDue || 0) > 0;

                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedSupplier(s)}
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all hover:bg-slate-50/80 ${
                        isSelected ? "bg-amber-50/60 border-l-4 border-l-amber-500" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-100 to-amber-200 border border-amber-300 flex items-center justify-center text-amber-900 font-bold text-sm shrink-0">
                          <Truck className="w-5 h-5 text-amber-700" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                              {s.name}
                            </h4>
                            {hasDebt && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                                Dette due : {formatAmount(s.totalDue || 0)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                            {s.category || "Général"} {s.companyName ? `• ${s.companyName}` : ""}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400">
                            {s.phone && <span className="font-mono">{s.phone}</span>}
                            {s.address && <span>{s.address}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="text-left sm:text-right">
                          <p className="text-[11px] text-slate-400 font-medium">Volume Achats</p>
                          <p className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                            {formatAmount(s.totalPurchased || 0)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(s);
                            }}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(s.id);
                            }}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <Truck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Aucun fournisseur répertorié</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Supplier Sheet */}
        {selectedSupplier && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in slide-in-from-right-4">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-black text-lg flex items-center justify-center shadow-md shadow-amber-500/20">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{selectedSupplier.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedSupplier.category || "Fournisseur"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSupplier(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Financial Overview */}
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Dettes Fournisseur & Approvisionnements
              </span>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                <div>
                  <p className="text-[11px] text-slate-400">Total Acheté</p>
                  <p className="text-sm font-black text-slate-200 font-mono">
                    {formatAmount(selectedSupplier.totalPurchased || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Dette En Cours</p>
                  <p
                    className={`text-sm font-black font-mono ${
                      (selectedSupplier.totalDue || 0) > 0 ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {formatAmount(selectedSupplier.totalDue || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2.5 text-xs">
              <h5 className="font-bold text-slate-900">Coordonnées Fournisseur</h5>
              {selectedSupplier.phone && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`tel:${selectedSupplier.phone}`} className="hover:underline font-mono">
                    {selectedSupplier.phone}
                  </a>
                </div>
              )}
              {selectedSupplier.email && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedSupplier.email}</span>
                </div>
              )}
              {selectedSupplier.address && (
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedSupplier.address}</span>
                </div>
              )}
            </div>

            {/* Expenses / Purchases linked */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h5 className="font-bold text-slate-900 text-xs">
                Historique des Commandes & Factures Fournisseur
              </h5>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                {selectedSupplier.expenses && selectedSupplier.expenses.length > 0 ? (
                  selectedSupplier.expenses.map((e) => (
                    <div key={e.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{e.title}</p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(e.expenseDate).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold font-mono text-slate-900">{formatAmount(e.amount)}</p>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            e.isPaid ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {e.isPaid ? "Payé" : "Dette due"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-400 py-3 text-center">Aucun achat lié.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                {editingSupplier ? "Modifier le Fournisseur" : "Nouveau Fournisseur"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nom du Fournisseur ou Entreprise *
                </label>
                <input
                  {...register("name")}
                  placeholder="Ex: Global Hardware SARL"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                {errors.name && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catégorie d'activité
                  </label>
                  <input
                    {...register("category")}
                    placeholder="Électronique, Papeterie..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    {...register("phone")}
                    placeholder="+221 33 800 00 00"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email contact
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="commandes@fournisseur.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Adresse physique
                  </label>
                  <input
                    {...register("address")}
                    placeholder="Zone Industrielle, Port..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Enregistrement..." : editingSupplier ? "Mettre à jour" : "Créer le fournisseur"}
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
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">Supprimer ce fournisseur ?</h4>
              <p className="text-xs text-slate-500 mt-1">Cette action est définitive.</p>
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
