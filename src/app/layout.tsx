import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Toaster from "@/components/layout/Toaster";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "KingFlow | SaaS de Gestion Commerciale, Facturation & Stocks",
  description:
    "Solution SaaS complète pour PME et entrepreneurs : devis, facturation A4, tickets thermiques 80mm, gestion des stocks, créances et exports comptables.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased text-slate-900 min-h-screen bg-[#f4f7fc] dark:bg-[#070d1e] dark:text-slate-100 transition-colors`}
      >
        <ThemeProvider>
          <CurrencyProvider>
            {children}
            <Toaster />
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
