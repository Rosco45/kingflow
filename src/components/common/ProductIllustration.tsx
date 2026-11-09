import React from "react";
import {
  Laptop,
  Headphones,
  Mouse,
  Printer,
  HardDrive,
  Wifi,
  Package,
  Wrench,
  ScanBarcode,
  Disc,
  FileSpreadsheet,
  BatteryCharging,
} from "lucide-react";

interface ProductIllustrationProps {
  name: string;
  category?: string;
  sku?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function ProductIllustration({
  name,
  category = "",
  sku = "",
  className = "",
  size = "md",
}: ProductIllustrationProps) {
  const text = `${name} ${category} ${sku}`.toLowerCase();

  const sizeClasses = {
    sm: "w-9 h-9 p-1.5 rounded-lg text-xs",
    md: "w-12 h-12 p-2 rounded-xl text-sm",
    lg: "w-16 h-16 p-3 rounded-2xl text-base",
  };

  // 1. Laptop / Ordinateur Portable
  if (text.includes("ordinateur") || text.includes("portable") || text.includes("laptop") || text.includes("dell") || text.includes("vostro")) {
    return (
      <div
        className={`flex items-center justify-center shrink-0 bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 text-blue-400 border border-blue-800/40 shadow-sm ${sizeClasses[size]} ${className}`}
        title={name}
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full drop-shadow">
          {/* Laptop Screen */}
          <rect x="8" y="10" width="32" height="22" rx="2" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
          {/* Display Glow */}
          <rect x="11" y="13" width="26" height="16" rx="1" fill="#0284c7" />
          <path d="M11 25L19 17L27 25L37 15" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
          {/* Laptop Base */}
          <path d="M4 33C4 32.4477 4.44772 32 5 32H43C43.5523 32 44 32.4477 44 33V35C44 36.1046 43.1046 37 42 37H6C4.89543 37 4 36.1046 4 35V33Z" fill="#334155" />
          <rect x="20" y="33" width="8" height="2" rx="1" fill="#94a3b8" />
        </svg>
      </div>
    );
  }

  // 2. Bluetooth Headphones / Casque
  if (text.includes("casque") || text.includes("audio") || text.includes("ecouteur") || text.includes("bluetooth")) {
    return (
      <div
        className={`flex items-center justify-center shrink-0 bg-gradient-to-br from-slate-900 via-neutral-900 to-zinc-950 text-slate-200 border border-slate-700 shadow-sm ${sizeClasses[size]} ${className}`}
        title={name}
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full drop-shadow">
          {/* Headband */}
          <path d="M12 24C12 17.3726 17.3726 12 24 12C30.6274 12 36 17.3726 36 24V28" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
          {/* Left Earpad */}
          <rect x="8" y="24" width="7" height="14" rx="3.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <rect x="11" y="27" width="2" height="8" rx="1" fill="#38bdf8" />
          {/* Right Earpad */}
          <rect x="33" y="24" width="7" height="14" rx="3.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <rect x="35" y="27" width="2" height="8" rx="1" fill="#38bdf8" />
        </svg>
      </div>
    );
  }

  // 3. Wireless Mouse / Souris
  if (text.includes("souris") || text.includes("mouse")) {
    return (
      <div
        className={`flex items-center justify-center shrink-0 bg-gradient-to-br from-zinc-900 to-black text-slate-300 border border-zinc-700 shadow-sm ${sizeClasses[size]} ${className}`}
        title={name}
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full drop-shadow">
          {/* Mouse Body */}
          <path d="M15 18C15 13.0294 19.0294 9 24 9C28.9706 9 33 13.0294 33 18V29C33 33.9706 28.9706 38 24 38C19.0294 38 15 33.9706 15 29V18Z" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
          {/* Scroll Wheel */}
          <rect x="22" y="14" width="4" height="8" rx="2" fill="#38bdf8" />
          {/* Click divider */}
          <line x1="24" y1="22" x2="24" y2="28" stroke="#3f3f46" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  // 4. Printer / Imprimante & Toner
  if (text.includes("imprimante") || text.includes("laserjet") || text.includes("toner") || text.includes("cartouche")) {
    return (
      <div
        className={`flex items-center justify-center shrink-0 bg-gradient-to-br from-indigo-950 to-slate-900 text-indigo-400 border border-indigo-800/40 shadow-sm ${sizeClasses[size]} ${className}`}
        title={name}
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full drop-shadow">
          <path d="M12 18V10H36V18" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="8" y="18" width="32" height="18" rx="3" fill="#1e293b" stroke="#6366f1" strokeWidth="2" />
          <path d="M14 28H34V38H14V28Z" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
          <circle cx="34" cy="22" r="1.5" fill="#22c55e" />
        </svg>
      </div>
    );
  }

  // 5. Router / Wifi
  if (text.includes("routeur") || text.includes("wifi") || text.includes("switch") || text.includes("tp-link")) {
    return (
      <div
        className={`flex items-center justify-center shrink-0 bg-gradient-to-br from-teal-950 to-slate-900 text-teal-400 border border-teal-800/40 shadow-sm ${sizeClasses[size]} ${className}`}
        title={name}
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full drop-shadow">
          {/* Antennas */}
          <line x1="14" y1="12" x2="14" y2="26" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" />
          <line x1="24" y1="8" x2="24" y2="26" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" />
          <line x1="34" y1="12" x2="34" y2="26" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" />
          {/* Router box */}
          <rect x="8" y="26" width="32" height="12" rx="3" fill="#0f172a" stroke="#14b8a6" strokeWidth="2" />
          {/* LED dots */}
          <circle cx="14" cy="32" r="1.5" fill="#22c55e" />
          <circle cx="19" cy="32" r="1.5" fill="#22c55e" />
          <circle cx="24" cy="32" r="1.5" fill="#22c55e" />
          <circle cx="29" cy="32" r="1.5" fill="#2dd4bf" />
        </svg>
      </div>
    );
  }

  // 6. UPS / Onduleur / Énergie
  if (text.includes("onduleur") || text.includes("apc") || text.includes("batterie") || text.includes("back-ups")) {
    return (
      <div
        className={`flex items-center justify-center shrink-0 bg-gradient-to-br from-amber-950 to-slate-900 text-amber-400 border border-amber-800/40 shadow-sm ${sizeClasses[size]} ${className}`}
        title={name}
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full drop-shadow">
          <rect x="14" y="8" width="20" height="32" rx="3" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="24" cy="16" r="3" fill="#10b981" />
          <path d="M22 24L26 28M26 24L22 28" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="18" y="32" width="12" height="3" rx="1.5" fill="#f59e0b" />
        </svg>
      </div>
    );
  }

  // 7. Hard Drive / Disque Dur
  if (text.includes("disque") || text.includes("dur") || text.includes("ssd") || text.includes("stockage")) {
    return (
      <div
        className={`flex items-center justify-center shrink-0 bg-gradient-to-br from-cyan-950 to-slate-900 text-cyan-400 border border-cyan-800/40 shadow-sm ${sizeClasses[size]} ${className}`}
        title={name}
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full drop-shadow">
          <rect x="12" y="8" width="24" height="32" rx="4" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
          <circle cx="24" cy="20" r="7" stroke="#22d3ee" strokeWidth="1.5" />
          <circle cx="24" cy="20" r="2.5" fill="#22d3ee" />
          <circle cx="24" cy="34" r="1.5" fill="#10b981" />
        </svg>
      </div>
    );
  }

  // 8. Barcode Scanner / Caisse
  if (text.includes("code-barres") || text.includes("caisse") || text.includes("douchette") || text.includes("scanner")) {
    return (
      <div
        className={`flex items-center justify-center shrink-0 bg-gradient-to-br from-purple-950 to-slate-900 text-purple-400 border border-purple-800/40 shadow-sm ${sizeClasses[size]} ${className}`}
        title={name}
      >
        <ScanBarcode className="w-3/5 h-3/5 text-purple-400" />
      </div>
    );
  }

  // 9. Paper / Ramettes
  if (text.includes("papier") || text.includes("ramette") || text.includes("bobine")) {
    return (
      <div
        className={`flex items-center justify-center shrink-0 bg-gradient-to-br from-emerald-950 to-slate-900 text-emerald-400 border border-emerald-800/40 shadow-sm ${sizeClasses[size]} ${className}`}
        title={name}
      >
        <Package className="w-3/5 h-3/5 text-emerald-400" />
      </div>
    );
  }

  // 10. Services / IT
  if (text.includes("service") || text.includes("prestation") || text.includes("maintenance") || text.includes("installation")) {
    return (
      <div
        className={`flex items-center justify-center shrink-0 bg-gradient-to-br from-blue-950 to-indigo-950 text-blue-300 border border-blue-800/40 shadow-sm ${sizeClasses[size]} ${className}`}
        title={name}
      >
        <Wrench className="w-3/5 h-3/5 text-blue-400" />
      </div>
    );
  }

  // Default Generic Product
  return (
    <div
      className={`flex items-center justify-center shrink-0 bg-gradient-to-br from-slate-900 to-slate-800 text-blue-400 border border-slate-700 shadow-sm ${sizeClasses[size]} ${className}`}
      title={name}
    >
      <Package className="w-3/5 h-3/5 text-blue-400" />
    </div>
  );
}
