"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Building2,
  Coins,
  FileText,
  Receipt,
  Save,
  CheckCircle2,
  Calendar,
  Plus,
  Clock,
  MapPin,
  Trash2,
  Truck,
  Users,
  CreditCard,
  Package,
  Palette,
  Sun,
  Moon,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { useTheme } from "@/context/ThemeContext";
import { CompanySettingsData, CurrencyCode } from "@/types";
import { CalendarEventData } from "../dashboard/CalendarAgendaModal";

export default function SettingsView() {
  const { companySettings, refreshSettings, setCurrency, addToast } = useCurrency();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<"company" | "agenda" | "theme">("company");

  const [formData, setFormData] = useState<CompanySettingsData>({
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
    receiptFooter: "Merci de votre fidélité ! Facturette non remboursable après 48h.",
  });

  const [saving, setSaving] = useState(false);

  // Agenda Admin state
  const [events, setEvents] = useState<CalendarEventData[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);

  const [evTitle, setEvTitle] = useState("");
  const [evType, setEvType] = useState("LIVRAISON");
  const [evDate, setEvDate] = useState("2026-11-09");
  const [evTime, setEvTime] = useState("10:00");
  const [evLocation, setEvLocation] = useState("");
  const [evClient, setEvClient] = useState("");
  const [evNotes, setEvNotes] = useState("");
  const [evSubmitting, setEvSubmitting] = useState(false);

  useEffect(() => {
    if (companySettings) {
      setFormData(companySettings);
    }
    loadEvents();
  }, [companySettings]);

  const loadEvents = async () => {
    try {
      setLoadingEvents(true);
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleChange = (field: keyof CompanySettingsData, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await refreshSettings();
        setCurrency(formData.currency as CurrencyCode);
        addToast({
          type: "success",
          title: "Paramètres mis à jour",
          description: "Les informations de l'entreprise ont été enregistrées.",
        });
      } else {
        const err = await res.json();
        addToast({
          type: "error",
          title: "Erreur",
          description: err.error || "Impossible d'enregistrer.",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evTitle.trim()) return;

    try {
      setEvSubmitting(true);
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: evTitle,
          type: evType,
          date: evDate,
          time: evTime,
          location: evLocation,
          clientName: evClient,
          notes: evNotes,
        }),
      });

      if (res.ok) {
        addToast({
          type: "success",
          title: "Événement programmé",
          description: `"${evTitle}" a été ajouté avec succès.`,
        });
        setEvTitle("");
        setEvLocation("");
        setEvClient("");
        setEvNotes("");
        setShowAddEvent(false);
        loadEvents();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEvSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast({
          type: "info",
          title: "Événement supprimé",
        });
        loadEvents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      {/* Top Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("company")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "company"
              ? "bg-[#2563eb] text-white shadow-md shadow-blue-500/20"
              : "text-slate-600 hover:bg-white"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Entreprise & Fiscalité</span>
        </button>

        <button
          onClick={() => setActiveTab("agenda")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "agenda"
              ? "bg-[#2563eb] text-white shadow-md shadow-blue-500/20"
              : "text-slate-600 hover:bg-white"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Agenda & Dates Clés ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("theme")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "theme"
              ? "bg-[#2563eb] text-white shadow-md shadow-blue-500/20"
              : "text-slate-600 hover:bg-white"
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Thème & Couleurs</span>
        </button>
      </div>

      {/* TAB 1: Company Profile & Tax */}
      {activeTab === "company" && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Identité Commerciale</h3>
                <p className="text-xs text-slate-500">
                  Coordonnées légales figurant sur vos devis, factures et reçus
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Raison Sociale / Nom Commercial *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Slogan d'activité</label>
                <input
                  type="text"
                  value={formData.tagline || ""}
                  onChange={(e) => handleChange("tagline", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Entreprise</label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Téléphone Appel</label>
                <input
                  type="text"
                  value={formData.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">WhatsApp Professionnel</label>
                <input
                  type="text"
                  value={formData.whatsapp || ""}
                  onChange={(e) => handleChange("whatsapp", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Identifiant Fiscal (NINEA / RCCM / TVA)
                </label>
                <input
                  type="text"
                  value={formData.taxId || ""}
                  onChange={(e) => handleChange("taxId", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ville</label>
                <input
                  type="text"
                  value={formData.city || ""}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pays</label>
                <input
                  type="text"
                  value={formData.country || ""}
                  onChange={(e) => handleChange("country", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Adresse Siège Social</label>
                <input
                  type="text"
                  value={formData.address || ""}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Currency & Tax */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Devise & Fiscalité</h3>
                <p className="text-xs text-slate-500">
                  Devise de référence et taux de taxe standard
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Devise par défaut</label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold text-slate-800"
                >
                  <option value="XOF">Franc CFA (XOF / FCFA)</option>
                  <option value="EUR">Euro (€ / EUR)</option>
                  <option value="USD">Dollar US ($ / USD)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Taux de TVA Standard (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={formData.defaultVatRate}
                  onChange={(e) => handleChange("defaultVatRate", parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Sauvegarde..." : "Enregistrer les Paramètres"}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Programmable Agenda Admin */}
      {activeTab === "agenda" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Gestionnaire de l'Agenda Commercial
              </h3>
              <p className="text-xs text-slate-500">
                Programmez les dates de livraison, réunions, inventaires et relances
              </p>
            </div>

            <button
              onClick={() => setShowAddEvent(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Programmer une date</span>
            </button>
          </div>

          {/* Add Event Form in Admin */}
          {showAddEvent && (
            <form
              onSubmit={handleCreateEvent}
              className="p-4 rounded-xl bg-[#f8faff] border border-blue-200 space-y-3.5 text-xs animate-in fade-in"
            >
              <h4 className="font-extrabold text-slate-900 text-sm">
                Ajouter un Événement à l'Agenda
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Titre de l'activité *</label>
                  <input
                    type="text"
                    required
                    value={evTitle}
                    onChange={(e) => setEvTitle(e.target.value)}
                    placeholder="Ex: Livraison lot d'onduleurs APC"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={evType}
                    onChange={(e) => setEvType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold"
                  >
                    <option value="LIVRAISON">🚚 Livraison</option>
                    <option value="RDV_CLIENT">🤝 RDV Client</option>
                    <option value="REUNION">👥 Réunion</option>
                    <option value="INVENTAIRE">📦 Inventaire</option>
                    <option value="ECHEANCE">💳 Échéance Facture</option>
                    <option value="AUTRE">📌 Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={evDate}
                    onChange={(e) => setEvDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Heure</label>
                  <input
                    type="time"
                    value={evTime}
                    onChange={(e) => setEvTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Client / Partenaire</label>
                  <input
                    type="text"
                    value={evClient}
                    onChange={(e) => setEvClient(e.target.value)}
                    placeholder="Ex: Diallo Trading"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-bold text-slate-700 mb-1">Lieu & Notes</label>
                  <input
                    type="text"
                    value={evNotes}
                    onChange={(e) => setEvNotes(e.target.value)}
                    placeholder="Détails du créneau, adresse..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEvent(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={evSubmitting}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm disabled:opacity-50"
                >
                  {evSubmitting ? "Enregistrement..." : "Ajouter à l'agenda"}
                </button>
              </div>
            </form>
          )}

          {/* Events Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Date & Heure</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Intitulé</th>
                  <th className="py-2.5 px-3">Client / Lieu</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-mono whitespace-nowrap">
                      {new Date(ev.date).toLocaleDateString("fr-FR")} • {ev.time || "—"}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                        {ev.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">{ev.title}</td>
                    <td className="py-3 px-3 text-slate-500">
                      {ev.clientName || ev.location || "—"}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Theme Customization */}
      {activeTab === "theme" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base">
              Thème & Palette de Couleurs
            </h3>
            <p className="text-xs text-slate-500">
              Personnalisez l'apparence visuelle de votre espace KingFlow SaaS
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Theme Option 1: Fond blanc bleuté */}
            <div
              onClick={() => setTheme("light")}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
                theme === "light"
                  ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <h4 className="font-black text-slate-900 text-sm">
                    Fond Blanc avec Légère Teinte Bleue
                  </h4>
                </div>
                {theme === "light" && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Fond principal subtilement teinté de bleu glacé (#f4f7fc / #f8faff) avec barre latérale bleu nuit profond (#0a1228), comme sur la maquette officielle.
              </p>
              <div className="h-6 rounded-lg bg-[#f4f7fc] border border-blue-200 flex items-center px-3 text-[10px] text-slate-600 font-mono">
                Aperçu fond : #f4f7fc
              </div>
            </div>

            {/* Theme Option 2: Bleu Nuit Sombre */}
            <div
              onClick={() => setTheme("dark")}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
                theme === "dark"
                  ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="w-5 h-5 text-blue-500" />
                  <h4 className="font-black text-slate-900 text-sm">Bleu Nuit Sombre (Dark)</h4>
                </div>
                {theme === "dark" && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Palette complète sombre pour un confort visuel optimal en soirée et en faible luminosité.
              </p>
              <div className="h-6 rounded-lg bg-[#0a1228] border border-blue-900 flex items-center px-3 text-[10px] text-blue-300 font-mono">
                Aperçu fond : #0a1228
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
