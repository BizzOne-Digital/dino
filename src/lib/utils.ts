import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(cents / 100);
}

export function generateOrderNumber(): string {
  const date = new Date();
  const prefix = `DCB${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${random}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function sanitizeString(input: string, maxLength = 500): string {
  return input.trim().slice(0, maxLength);
}
<<<<<<< HEAD

/** Shown on the storefront (vanity format). */
export const BUSINESS_PHONE_DISPLAY = "647-515-DINO";

const PHONE_KEYPAD: Record<string, string> = {
  A: "2",
  B: "2",
  C: "2",
  D: "3",
  E: "3",
  F: "3",
  G: "4",
  H: "4",
  I: "4",
  J: "5",
  K: "5",
  L: "5",
  M: "6",
  N: "6",
  O: "6",
  P: "7",
  Q: "7",
  R: "7",
  S: "7",
  T: "8",
  U: "8",
  V: "8",
  W: "9",
  X: "9",
  Y: "9",
  Z: "9",
};

/** Converts a display/vanity phone string to digits for tel: links (e.g. DINO → 3466). */
export function phoneToTelHref(phone: string): string {
  let digits = "";
  for (const ch of phone.toUpperCase()) {
    if (ch >= "0" && ch <= "9") digits += ch;
    else if (PHONE_KEYPAD[ch]) digits += PHONE_KEYPAD[ch];
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `tel:+${digits}`;
  }
  if (digits.length === 10) {
    return `tel:+1${digits}`;
  }
  return `tel:${digits}`;
}
=======
>>>>>>> 7fc58c974eb6e57a1188451228042ab63de29fff
