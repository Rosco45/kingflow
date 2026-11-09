"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Building,
  CreditCard,
  Receipt,
  FilePlus2,
  Trash2,
  Edit2,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpDown,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { CustomerData, InvoiceData } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const customerSchema = z.object({
  name: z.string().min(2, "Le nom est requis (au moins 2 caractères)"),
  companyName: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().min(4, "Numéro de téléphone requis").optional().or(z.literal("")),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface ClientsViewProps {
  onQuickInvoice: (customerId: string) => void;
  onOpenInvoice: (invoice: InvoiceData) => void;
}

export default function ClientsView({
  onQuickInvoice,
  onOpenInvoice,
}: ClientsViewProps) {
  const { formatAmount, addToast } = useCurrency();
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDebtOnly, setFilterDebtOnly] = useState(false);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerData | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      companyName: "",
      email: "",
      phone: "",
      whatsapp: "",
      address: "",
      city: "Dakar",
      country: "Sénégal",
      notes: "",
    },
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const url = search ? `/api/customers?q=${encodeURIComponent(search)}` : "/api/customers";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
        // Refresh selected if open
        if (selectedCustomer) {
          const updated = data.find((c: CustomerData) => c.id === selectedCustomer.id);
          if (updated) setSelectedCustomer(updated);
        }
      }
    } catch (err) {
      console.error("Error loading customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    reset({
      name: "",
      companyName: "",
      email: "",
      phone: "",
      whatsapp: "",
      address: "",
      city: "Dakar",
      country: "Sénégal",
      notes: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer: CustomerData) => {
    setEditingCustomer(customer);
    reset({
      name: customer.name,
      companyName: customer.companyName || "",
      email: customer.email || "",
      phone: customer.phone || "",
      whatsapp: customer.whatsapp || "",
      address: customer.address || "",
      city: customer.city || "Dakar",
      country: customer.country || "Sénégal",
      notes: customer.notes || "",
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (values: CustomerFormValues) => {
    try {
      const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : "/api/customers";
      const method = editingCustomer ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        addToast({
          type: "success",
          title: editingCustomer ? "Client mis à jour" : "Client créé avec succès",
          description: `${values.name} est enregistré dans votre base de données.`,
        });
        setIsModalOpen(false);
        fetchCustomers();
      } else {
        const err = await res.json();
        addToast({
          type: "error",
          title: "Erreur",
          description: err.error || "Impossible d'enregistrer le client.",
        });
      }
    } catch (error) {
      console.error(error);
      addToast({
        type: "error",
        title: "Erreur réseau",
        description: "Une erreur est survenue lors de l'enregistrement.",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast({
          type: "success",
          title: "Client supprimé",
          description: "La fiche client a bien été retirée.",
        });
        setDeleteConfirmId(null);
        if (selectedCustomer?.id === id) setSelectedCustomer(null);
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    if (filterDebtOnly) {
      return (c.balanceDue || 0) > 0;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Action Header & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom, entreprise, téléphone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>

          <button
            onClick={() => setFilterDebtOnly(!filterDebtOnly)}
            className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              filterDebtOnly
                ? "bg-rose-50 border-rose-300 text-rose-700 shadow-sm"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Créances actives</span>
          </button>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Client</span>
        </button>
      </div>

      {/* Main Grid: Clients List + Detailed Card (if selected) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clients Table / Cards List */}
        <div className={`${selectedCustomer ? "lg:col-span-2" : "lg:col-span-3"} space-y-3`}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Répertoire Clients ({filteredCustomers.length})
              </span>
              <span className="text-xs text-slate-400">Cliquez sur un client pour afficher sa fiche</span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => {
                  const isSelected = selectedCustomer?.id === c.id;
                  const hasDebt = (c.balanceDue || 0) > 0;

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCustomer(c)}
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all hover:bg-slate-50/80 ${
                        isSelected ? "bg-blue-50/60 border-l-4 border-l-blue-600" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-sm shrink-0">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                              {c.name}
                            </h4>
                            {hasDebt ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                                Créance : {formatAmount(c.balanceDue || 0)}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                À jour
                              </span>
                            )}
                          </div>
                          {c.companyName && (
                            <p className="text-xs text-slate-500 font-medium truncate mt-0.5 flex items-center gap-1">
                              <Building className="w-3 h-3 text-slate-400" />
                              {c.companyName}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                            {c.phone && (
                              <span className="flex items-center gap-1 font-mono">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {c.phone}
                              </span>
                            )}
                            {c.city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {c.city}, {c.country}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="text-left sm:text-right">
                          <p className="text-[11px] text-slate-400 font-medium">Total Facturé</p>
                          <p className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                            {formatAmount(c.totalBilled || 0)}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(c);
                            }}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(c.id);
                            }}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Supprimer"
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
                  <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Aucun client trouvé</p>
                  <p className="text-xs text-slate-400 mt-1">Créez votre premier client pour commencer à facturer.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Client Sheet (Sidebar right) */}
        {selectedCustomer && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in slide-in-from-right-4">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                  {selectedCustomer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedCustomer.companyName || "Client particulier"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions WhatsApp & Call */}
            <div className="grid grid-cols-2 gap-2.5">
              {selectedCustomer.whatsapp || selectedCustomer.phone ? (
                <a
                  href={`https://wa.me/${(selectedCustomer.whatsapp || selectedCustomer.phone || "").replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>
              ) : (
                <button
                  disabled
                  className="py-2.5 px-3 rounded-xl bg-slate-100 text-slate-400 text-xs font-medium flex items-center justify-center gap-1.5 cursor-not-allowed"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Pas de WhatsApp</span>
                </button>
              )}

              {selectedCustomer.phone ? (
                <a
                  href={`tel:${selectedCustomer.phone}`}
                  className="py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center gap-1.5 border border-blue-200 transition-colors"
                >
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>Appeler</span>
                </a>
              ) : (
                <button
                  disabled
                  className="py-2.5 px-3 rounded-xl bg-slate-100 text-slate-400 text-xs font-medium flex items-center justify-center gap-1.5 cursor-not-allowed"
                >
                  <Phone className="w-4 h-4" />
                  <span>Pas de numéro</span>
                </button>
              )}
            </div>

            {/* Balance Overview Box */}
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                État des Comptes
              </span>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                <div>
                  <p className="text-[11px] text-slate-400">Total Réglé</p>
                  <p className="text-sm font-black text-emerald-400 font-mono">
                    {formatAmount(selectedCustomer.totalPaid || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Solde Restant Dû</p>
                  <p
                    className={`text-sm font-black font-mono ${
                      (selectedCustomer.balanceDue || 0) > 0 ? "text-rose-400" : "text-slate-300"
                    }`}
                  >
                    {formatAmount(selectedCustomer.balanceDue || 0)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onQuickInvoice(selectedCustomer.id)}
                className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <FilePlus2 className="w-4 h-4" />
                <span>Nouvelle Facture pour ce client</span>
              </button>
            </div>

            {/* Contact Details */}
            <div className="space-y-2.5 text-xs">
              <h5 className="font-bold text-slate-900">Coordonnées</h5>
              {selectedCustomer.email && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedCustomer.email}</span>
                </div>
              )}
              {selectedCustomer.address && (
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {selectedCustomer.address}, {selectedCustomer.city} ({selectedCustomer.country})
                  </span>
                </div>
              )}
              {selectedCustomer.notes && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 italic">
                  "{selectedCustomer.notes}"
                </div>
              )}
            </div>

            {/* Invoices History */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h5 className="font-bold text-slate-900 text-xs flex items-center justify-between">
                <span>Historique Factures ({selectedCustomer.invoices?.length || 0})</span>
              </h5>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                {selectedCustomer.invoices && selectedCustomer.invoices.length > 0 ? (
                  selectedCustomer.invoices.map((inv) => (
                    <div
                      key={inv.id}
                      onClick={() => onOpenInvoice(inv)}
                      className="py-2 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 px-1 rounded transition-colors"
                    >
                      <div>
                        <p className="font-mono font-bold text-blue-600">{inv.number}</p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(inv.issueDate).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold font-mono text-slate-800">{formatAmount(inv.total)}</p>
                        <p
                          className={`text-[10px] font-semibold ${
                            inv.balanceDue > 0 ? "text-rose-600" : "text-emerald-600"
                          }`}
                        >
                          {inv.balanceDue > 0 ? `Dû: ${formatAmount(inv.balanceDue)}` : "Payé"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-400 py-3 text-center">Aucune facture émise.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Create/Edit Customer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                {editingCustomer ? "Modifier le Client" : "Nouveau Client"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nom complet ou Contact principal *
                  </label>
                  <input
                    {...register("name")}
                    placeholder="Ex: Amadou Diallo"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                  {errors.name && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nom Entreprise (optionnel)
                  </label>
                  <input
                    {...register("companyName")}
                    placeholder="Ex: Diallo Trading SARL"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Adresse Email
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="amadou@diallo.sn"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Numéro de Téléphone
                  </label>
                  <input
                    {...register("phone")}
                    placeholder="+221 77 000 00 00"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp (avec indicatif)
                  </label>
                  <input
                    {...register("whatsapp")}
                    placeholder="+221770000000"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ville</label>
                  <input
                    {...register("city")}
                    placeholder="Dakar, Abidjan..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pays</label>
                  <input
                    {...register("country")}
                    placeholder="Sénégal, Côte d'Ivoire..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Adresse physique / Quartier
                  </label>
                  <input
                    {...register("address")}
                    placeholder="Ex: Marché Sandaga, Allée B"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Notes internes / Modalités
                  </label>
                  <textarea
                    {...register("notes")}
                    rows={2}
                    placeholder="Client fidèle, accepte les factures par WhatsApp..."
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
                  {isSubmitting ? "Enregistrement..." : editingCustomer ? "Mettre à jour" : "Créer le client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">Supprimer ce client ?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Cette action supprimera également ses factures et paiements associés. Cette action est irréversible.
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
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20"
              >
                Confirmer suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
