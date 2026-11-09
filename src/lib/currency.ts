import { CurrencyCode } from "@/types";

// Base currency in database is XOF (FCFA)
export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  XOF: 1,
  EUR: 1 / 655.957,
  USD: 1 / 605,
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  XOF: "FCFA",
  EUR: "€",
  USD: "$",
};

export const CURRENCY_NAMES: Record<CurrencyCode, string> = {
  XOF: "Franc CFA (XOF)",
  EUR: "Euro (€)",
  USD: "Dollar US ($)",
};

/**
 * Formats a monetary amount in base XOF to the target currency
 */
export function formatCurrency(
  amountInXof: number,
  currency: CurrencyCode = "XOF",
  includeDecimals: boolean = false
): string {
  if (isNaN(amountInXof) || amountInXof === null || amountInXof === undefined) {
    amountInXof = 0;
  }

  const rate = EXCHANGE_RATES[currency] || 1;
  const converted = amountInXof * rate;

  if (currency === "XOF") {
    // FCFA does not use decimal fractions in general commerce
    const formatted = Math.round(converted).toLocaleString("fr-FR");
    return `${formatted} FCFA`;
  }

  const decimals = includeDecimals ? 2 : converted % 1 === 0 ? 0 : 2;
  const formatted = converted.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (currency === "EUR") {
    return `${formatted} €`;
  }

  return `$${formatted}`;
}

/**
 * Converts a target currency value into base XOF
 */
export function convertToXof(amount: number, fromCurrency: CurrencyCode): number {
  const rate = EXCHANGE_RATES[fromCurrency] || 1;
  return Math.round(amount / rate);
}

/**
 * Helper to convert a number to French words for formal invoicing
 */
export function numberToFrenchWords(n: number): string {
  n = Math.round(n);
  if (n === 0) return "zéro";

  const units = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
  const teens = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
  const tens = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"];

  function convertGroup(val: number): string {
    let res = "";
    const h = Math.floor(val / 100);
    const remainder = val % 100;

    if (h > 0) {
      if (h === 1) res += "cent ";
      else res += units[h] + " cent" + (remainder === 0 && h > 1 ? "s " : " ");
    }

    if (remainder > 0) {
      if (remainder < 10) {
        res += units[remainder];
      } else if (remainder < 20) {
        res += teens[remainder - 10];
      } else {
        const t = Math.floor(remainder / 10);
        const u = remainder % 10;

        if (t === 7) {
          res += "soixante-" + (u === 1 ? "et-onze" : teens[u]);
        } else if (t === 9) {
          res += "quatre-vingt-" + teens[u];
        } else {
          res += tens[t];
          if (u === 1 && t !== 8) {
            res += "-et-un";
          } else if (u > 0) {
            res += "-" + units[u];
          } else if (t === 8) {
            res += "s";
          }
        }
      }
    }

    return res.trim();
  }

  const millions = Math.floor(n / 1000000);
  const thousands = Math.floor((n % 1000000) / 1000);
  const remainder = n % 1000;

  const parts: string[] = [];

  if (millions > 0) {
    if (millions === 1) parts.push("un million");
    else parts.push(`${convertGroup(millions)} millions`);
  }

  if (thousands > 0) {
    if (thousands === 1) parts.push("mille");
    else parts.push(`${convertGroup(thousands)} mille`);
  }

  if (remainder > 0) {
    parts.push(convertGroup(remainder));
  }

  const text = parts.join(" ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}
