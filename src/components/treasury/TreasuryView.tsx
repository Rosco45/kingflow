"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  Receipt,
  Search,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Building,
  CreditCard,
  Edit2,
  Trash2,
  X,
  Filter,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { ExpenseData, SupplierData } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const expenseSchema = z.object({
  title: z.string().min(2, "L'intitulé est requis"),
  category: z.string().min(1, "Catégorie requise"),
  amount: z.number().min(1, "Le montant doit être supérieur à 0"),
  expenseDate: z.string(),
  paymentMethod: z.string(),
  isPaid: z.boolean(),
  supplierId: z.string().optional(),
  notes: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface TreasuryViewProps {
  onOpenCreateExpense?: () => void;
}

export default function TreasuryView({ onOpenCreateExpense }: TreasuryViewProps) {
  const { formatAmount, addToast } = useCurrency();
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "UNPAID">("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseData | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      category: "AUTRES",
      amount: 0,
      expenseDate: new Date().toISOString().split("T")[0],
      paymentMethod: "CASH",
      isPaid: true,
      supplierId: "",
      notes: "",
    },
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (statusFilter === "PAID") params.set("isPaid", "true");
      if (statusFilter === "UNPAID") params.set("isPaid", "false");

      const res = await fetch(`/api/expenses?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const res = await fetch("/api/suppliers");
      if (res.ok) setSuppliers(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExpenses();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, categoryFilter, statusFilter]);

  const handleOpenCreate = () => {
    setEditingExpense(null);
    reset({
      title: "",
      category: "AUTRES",
      amount: 0,
      expenseDate: new Date().toISOString().split("T")[0],
      paymentMethod: "CASH",
      isPaid: true,
      supplierId: "",
      notes: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp: ExpenseData) => {
    setEditingExpense(exp);
    reset({
      title: exp.title,
      category: exp.category,
      amount: exp.amount,
      expenseDate: new Date(exp.expenseDate).toISOString().split("T")[0],
      paymentMethod: exp.paymentMethod,
      isPaid: exp.isPaid,
      supplierId: exp.supplierId || "",
      notes: exp.notes || "",
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (values: ExpenseFormValues) => {
    try {
      const url = editingExpense ? `/api/expenses/${editingExpense.id}` : "/api/expenses";
      const method = editingExpense ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        addToast({
          type: "success",
          title: editingExpense ? "Dépense mise à jour" : "Dépense enregistrée",
          description: `${values.title} (${formatAmount(values.amount)}) enregistré dans le grand livre.`,
        });
        setIsModalOpen(false);
        fetchExpenses();
      } else {
        const err = await res.json();
        addToast({
          type: "error",
          title: "Erreur",
          description: err.error || "Impossible d'enregistrer la charge.",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast({
          type: "success",
          title: "Dépense supprimée",
        });
        setDeleteConfirmId(null);
        fetchExpenses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalPaidExpenses = expenses
    .filter((e) => e.isPaid)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalUnpaidDebts = expenses
    .filter((e) => !e.isPaid)
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Dépenses Réglées
            </span>
            <p className="text-2xl font-black text-amber-600 font-mono mt-1">
              {formatAmount(totalPaidExpenses)}
            </p>
            <p className="text-xs text-slate-400 mt-1">Charges d'exploitation et décaissements</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Dettes Fournisseurs Restantes
            </span>
            <p className="text-2xl font-black text-rose-600 font-mono mt-1">
              {formatAmount(totalUnpaidDebts)}
            </p>
            <p className="text-xs text-slate-400 mt-1">Factures d'achats en attente de paiement</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher une dépense, loyer, salaire..."
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
            <option value="ALL">Toutes catégories</option>
            <option value="LOYER">Loyer bureaux</option>
            <option value="ELECTRICITE_EAU">Électricité & Eau</option>
            <option value="TRANSPORT">Transport & Transit</option>
            <option value="SALAIRES">Salaires & Rémunérations</option>
            <option value="ACHAT_FOURNISSEUR">Achats Marchandises</option>
            <option value="MARKETING">Marketing & Pub</option>
            <option value="AUTRES">Autres charges</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
          >
            <option value="ALL">Tous statuts</option>
            <option value="PAID">Payé (Décaissé)</option>
            <option value="UNPAID">Dette non réglée</option>
          </select>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Dépense</span>
        </button>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Grand Livre des Dépenses ({expenses.length})
          </span>
          <span className="text-xs text-slate-400">Suivi rigoureux de vos flux de sortie</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Intitulé de la dépense</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Fournisseur lié</th>
                <th className="py-3 px-4">Moyen de Paiement</th>
                <th className="py-3 px-4 text-right">Montant</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {expenses.length > 0 ? (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                      {new Date(exp.expenseDate).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-extrabold text-slate-900">{exp.title}</p>
                      {exp.notes && (
                        <p className="text-[10px] text-slate-400 italic mt-0.5 line-clamp-1">
                          "{exp.notes}"
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {exp.category.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {exp.supplier?.name || "—"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {exp.paymentMethod}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                      {formatAmount(exp.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          exp.isPaid
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800 border border-rose-200 font-black"
                        }`}
                      >
                        {exp.isPaid ? "Payé" : "Dette Due"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(exp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(exp.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">Aucune dépense enregistrée</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create/Edit Expense */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                {editingExpense ? "Modifier la Dépense" : "Enregistrer une Dépense"}
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
                  Intitulé de la dépense *
                </label>
                <input
                  {...register("title")}
                  placeholder="Ex: Loyer bureau Dakar ou Facture Senelec..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                {errors.title && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catégorie de charge
                  </label>
                  <select
                    {...register("category")}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    <option value="LOYER">Loyer</option>
                    <option value="ELECTRICITE_EAU">Électricité & Eau</option>
                    <option value="TRANSPORT">Transport & Logistique</option>
                    <option value="SALAIRES">Salaires & Équipe</option>
                    <option value="ACHAT_FOURNISSEUR">Achat Marchandises</option>
                    <option value="MARKETING">Marketing & Publicité</option>
                    <option value="AUTRES">Autres charges diverses</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Montant de la dépense (FCFA) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    {...register("amount", { valueAsNumber: true })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-amber-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                  {errors.amount && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.amount.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    {...register("expenseDate")}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mode de Règlement
                  </label>
                  <select
                    {...register("paymentMethod")}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="CASH">Espèces (Cash)</option>
                    <option value="WAVE">Wave Mobile</option>
                    <option value="ORANGE_MONEY">Orange Money</option>
                    <option value="MTN_MOMO">MTN MoMo</option>
                    <option value="BANK_TRANSFER">Virement Bancaire</option>
                    <option value="CHECK">Chèque</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Fournisseur associé (optionnel)
                  </label>
                  <select
                    {...register("supplierId")}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="">-- Aucun fournisseur rattaché --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      {...register("isPaid")}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-700">
                      Cette dépense est déjà réglée (décaissement immédiat)
                    </span>
                  </label>
                  <p className="text-[10px] text-slate-400 pl-6">
                    Décochez cette case s'il s'agit d'une facture fournisseur en attente (dette).
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
                  <textarea
                    {...register("notes")}
                    rows={2}
                    placeholder="Détails du paiement, numéro de reçu..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
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
                  {isSubmitting ? "Enregistrement..." : editingExpense ? "Mettre à jour" : "Enregistrer la charge"}
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
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">Supprimer cette dépense ?</h4>
              <p className="text-xs text-slate-500 mt-1">
                La ligne sera effacée du grand livre comptable.
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
