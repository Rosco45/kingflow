"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeMode = "light" | "dark" | "midnight";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("light");

  useEffect(() => {
    const saved = localStorage.getItem("kingflow_theme") as ThemeMode;
    if (saved && (saved === "light" || saved === "dark" || saved === "midnight")) {
      setThemeState(saved);
      applyThemeClass(saved);
    } else {
      applyThemeClass("light");
    }
  }, []);

  const applyThemeClass = (t: ThemeMode) => {
    const root = document.documentElement;
    root.classList.remove("dark", "theme-midnight", "theme-light");
    if (t === "dark") {
      root.classList.add("dark");
    } else if (t === "midnight") {
      root.classList.add("dark", "theme-midnight");
    } else {
      root.classList.add("theme-light");
    }
  };

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
    localStorage.setItem("kingflow_theme", t);
    applyThemeClass(t);
  };

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
