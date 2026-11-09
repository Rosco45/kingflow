"use client";

import React from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export default function Toaster() {
  const { toasts, removeToast } = useCurrency();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        let bgColor = "bg-white border-slate-200 text-slate-800";
        let Icon = Info;
        let iconColor = "text-blue-600";

        if (toast.type === "success") {
          bgColor = "bg-emerald-50 border-emerald-200 text-emerald-950";
          Icon = CheckCircle2;
          iconColor = "text-emerald-600";
        } else if (toast.type === "error") {
          bgColor = "bg-rose-50 border-rose-200 text-rose-950";
          Icon = AlertCircle;
          iconColor = "text-rose-600";
        } else if (toast.type === "warning") {
          bgColor = "bg-amber-50 border-amber-200 text-amber-950";
          Icon = AlertTriangle;
          iconColor = "text-amber-600";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 ${bgColor}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm">{toast.title}</h4>
              {toast.description && (
                <p className="text-xs mt-0.5 opacity-90 leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
