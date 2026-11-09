"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  Trash2,
  Truck,
  Users,
  CreditCard,
  Package,
  Sparkles,
  CalendarDays,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

export interface CalendarEventData {
  id: string;
  title: string;
  type: "LIVRAISON" | "RDV_CLIENT" | "REUNION" | "INVENTAIRE" | "ECHEANCE" | "AUTRE" | string;
  date: string | Date;
  time?: string | null;
  location?: string | null;
  clientName?: string | null;
  notes?: string | null;
  isDone: boolean;
}

interface CalendarAgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  onEventChanged?: () => void;
}

export default function CalendarAgendaModal({
  isOpen,
  onClose,
  selectedDate = new Date("2026-11-09T09:00:00"),
  onEventChanged,
}: CalendarAgendaModalProps) {
  const { addToast } = useCurrency();

  // Current calendar view month & year
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth()); // 0-indexed
  const [activeDateStr, setActiveDateStr] = useState<string>(
    selectedDate.toISOString().split("T")[0]
  );

  const [events, setEvents] = useState<CalendarEventData[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>("ALL");

  // Add Event Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<string>("LIVRAISON");
  const [newTime, setNewTime] = useState("10:00");
  const [newLocation, setNewLocation] = useState("");
  const [newClient, setNewClient] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMonthEvents();
    }
  }, [isOpen, currentYear, currentMonth]);

  // Handle Escape key to close agenda modal
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

  const loadMonthEvents = async () => {
    try {
      setLoading(true);
      const mStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
      const res = await fetch(`/api/events?month=${mStr}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Month metadata
  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Mon = 0, Sun = 6

  // Events filtered
  const filteredEvents = events.filter((e) => {
    if (filterType !== "ALL" && e.type !== filterType) return false;
    return true;
  });

  // Events on active date
  const activeDayEvents = filteredEvents.filter((e) => {
    const eDate = new Date(e.date).toISOString().split("T")[0];
    return eDate === activeDateStr;
  });

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          type: newType,
          date: activeDateStr,
          time: newTime,
          location: newLocation,
          clientName: newClient,
          notes: newNotes,
        }),
      });

      if (res.ok) {
        addToast({
          type: "success",
          title: "Événement programmé",
          description: `"${newTitle}" a été ajouté à votre agenda KingFlow.`,
        });
        setNewTitle("");
        setNewLocation("");
        setNewClient("");
        setNewNotes("");
        setShowAddForm(false);
        await loadMonthEvents();
        if (onEventChanged) onEventChanged();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleDone = async (eventItem: CalendarEventData) => {
    try {
      const res = await fetch(`/api/events/${eventItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDone: !eventItem.isDone }),
      });
      if (res.ok) {
        setEvents((prev) =>
          prev.map((e) => (e.id === eventItem.id ? { ...e, isDone: !e.isDone } : e))
        );
        if (onEventChanged) onEventChanged();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast({
          type: "info",
          title: "Événement retiré",
        });
        setEvents((prev) => prev.filter((e) => e.id !== id));
        if (onEventChanged) onEventChanged();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "LIVRAISON":
        return {
          label: "Livraison",
          icon: Truck,
          color: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "RDV_CLIENT":
        return {
          label: "RDV Client",
          icon: User,
          color: "bg-emerald-100 text-emerald-800 border-emerald-200",
        };
      case "REUNION":
        return {
          label: "Réunion Équipe",
          icon: Users,
          color: "bg-purple-100 text-purple-800 border-purple-200",
        };
      case "INVENTAIRE":
        return {
          label: "Inventaire",
          icon: Package,
          color: "bg-amber-100 text-amber-800 border-amber-200",
        };
      case "ECHEANCE":
        return {
          label: "Échéance Facture",
          icon: CreditCard,
          color: "bg-rose-100 text-rose-800 border-rose-200",
        };
      default:
        return {
          label: "Événement",
          icon: CalendarIcon,
          color: "bg-slate-100 text-slate-800 border-slate-200",
        };
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 cursor-default"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-inner">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg tracking-tight">
                Agenda Commercial & Dates Clés
              </h3>
              <p className="text-xs text-slate-300">
                Livraisons clients, rendez-vous d'affaires, réunions et échéances
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Programmer</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split Calendar Left & Schedule Right */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#f8faff]">
          {/* Left Column: Interactive Month Calendar (7 cols) */}
          <div className="md:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-base">
                {monthNames[currentMonth]} {currentYear}
              </h4>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const today = new Date("2026-11-09T09:00:00");
                    setCurrentMonth(today.getMonth());
                    setCurrentYear(today.getFullYear());
                    setActiveDateStr("2026-11-09");
                  }}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Aujourd'hui
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-slate-400 uppercase tracking-wider">
              <span>Lun</span>
              <span>Mar</span>
              <span>Mer</span>
              <span>Jeu</span>
              <span>Ven</span>
              <span>Sam</span>
              <span>Dim</span>
            </div>

            {/* Month Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Empty leading cells */}
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="h-11 sm:h-12 rounded-xl bg-slate-50/50" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(
                  dayNum
                ).padStart(2, "0")}`;
                const isSelected = dStr === activeDateStr;
                const isToday = dStr === "2026-11-09";

                // Count events on this day
                const dayEvents = events.filter((e) => {
                  const evDate = new Date(e.date).toISOString().split("T")[0];
                  return evDate === dStr;
                });

                return (
                  <button
                    key={dStr}
                    type="button"
                    onClick={() => setActiveDateStr(dStr)}
                    className={`h-11 sm:h-12 rounded-xl flex flex-col items-center justify-between p-1 text-xs font-bold transition-all relative group ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105 z-10"
                        : isToday
                        ? "bg-blue-50 text-blue-700 border-2 border-blue-400"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100"
                    }`}
                  >
                    <span>{dayNum}</span>

                    {/* Event indicators dots */}
                    {dayEvents.length > 0 && (
                      <div className="flex items-center gap-0.5 mt-auto">
                        {dayEvents.slice(0, 3).map((ev, idx) => (
                          <span
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected
                                ? "bg-white"
                                : ev.type === "LIVRAISON"
                                ? "bg-blue-500"
                                : ev.type === "RDV_CLIENT"
                                ? "bg-emerald-500"
                                : ev.type === "ECHEANCE"
                                ? "bg-rose-500"
                                : "bg-purple-500"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Event Type Filters */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Filtre :</span>
              {[
                { id: "ALL", label: "Tous" },
                { id: "LIVRAISON", label: "Livraisons" },
                { id: "RDV_CLIENT", label: "RDV Clients" },
                { id: "REUNION", label: "Réunions" },
                { id: "ECHEANCE", label: "Échéances" },
                { id: "INVENTAIRE", label: "Inventaires" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    filterType === f.id
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Events on Selected Day (5 cols) */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Programme du jour
                  </h4>
                  <p className="text-xs text-blue-600 font-bold capitalize">
                    {new Date(activeDateStr + "T00:00:00").toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  {activeDayEvents.length} prévu(s)
                </span>
              </div>

              {/* Event Cards List */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {activeDayEvents.length > 0 ? (
                  activeDayEvents.map((ev) => {
                    const badge = getTypeBadge(ev.type);
                    const Icon = badge.icon;

                    return (
                      <div
                        key={ev.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          ev.isDone
                            ? "bg-slate-50 border-slate-200 opacity-60"
                            : "bg-white border-slate-200 shadow-sm hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <button
                              onClick={() => handleToggleDone(ev)}
                              className={`p-1 rounded-lg shrink-0 mt-0.5 transition-colors ${
                                ev.isDone
                                  ? "text-emerald-600 bg-emerald-50"
                                  : "text-slate-400 hover:text-emerald-600 hover:bg-slate-100"
                              }`}
                              title={ev.isDone ? "Marquer comme à faire" : "Marquer comme fait"}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>

                            <div className="min-w-0">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-md text-[9px] font-bold border uppercase tracking-wider mb-1 ${badge.color}`}
                              >
                                <Icon className="w-3 h-3" />
                                {badge.label}
                              </span>

                              <h5
                                className={`text-xs font-bold text-slate-900 leading-tight ${
                                  ev.isDone ? "line-through text-slate-500" : ""
                                }`}
                              >
                                {ev.title}
                              </h5>

                              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-500 font-medium">
                                {ev.time && (
                                  <span className="flex items-center gap-1 font-mono text-slate-700 font-semibold">
                                    <Clock className="w-3 h-3 text-blue-500" />
                                    {ev.time}
                                  </span>
                                )}
                                {ev.clientName && (
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3 text-slate-400" />
                                    {ev.clientName}
                                  </span>
                                )}
                                {ev.location && (
                                  <span className="flex items-center gap-1 truncate max-w-[180px]">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    {ev.location}
                                  </span>
                                )}
                              </div>

                              {ev.notes && (
                                <p className="text-[10px] text-slate-500 italic mt-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                  "{ev.notes}"
                                </p>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteEvent(ev.id)}
                            className="p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
                    <Sparkles className="w-8 h-8 mx-auto text-blue-400 mb-2" />
                    <p className="text-xs font-bold text-slate-700">Aucune activité programmée</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Ce créneau est libre. Cliquez sur "Ajouter à cette date" pour planifier.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une date clé pour le {activeDateStr}</span>
            </button>
          </div>
        </div>

        {/* Form Modal / Overlay to Add an Event */}
        {showAddForm && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-extrabold text-slate-900 text-base">
                  Nouvelle Date Clé / Événement
                </h4>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-3.5 mt-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Intitulé de l'événement *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Livraison 5 ordinateurs Dell Vostro"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-semibold text-xs focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Type d'activité</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
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
                    <label className="block font-bold text-slate-700 mb-1">Heure prévue</label>
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Client ou Partenaire</label>
                  <input
                    type="text"
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    placeholder="Ex: Fatou Bamba / Bamba Tech"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lieu / Adresse</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Ex: Cocody Riviera / Siège Dakar"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Notes / Instructions</label>
                  <textarea
                    rows={2}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Consignes de livraison, documents à signer..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 disabled:opacity-50"
                  >
                    {isSubmitting ? "Enregistrement..." : "Ajouter à l'agenda"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
