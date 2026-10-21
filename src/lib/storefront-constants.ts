/** Products/categories hidden from the public shop until re-enabled. */
export const HIDDEN_PRODUCT_SLUGS = ["dino-plush"] as const;
export const HIDDEN_CATEGORY_SLUGS = ["merchandise"] as const;

export const COMBO_PRODUCT_SLUG = "bagel-cookie-combo";

export const E_TRANSFER_EMAIL = "sales@dinoscookiesandbagels.ca";

export const DEFAULT_SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/share/1FYDS1jnck/?mibextid=wwXIfr",
  instagram: "https://www.instagram.com/cookie_man1958",
} as const;

export const INSTAGRAM_HANDLE = "@cookie_man1958";

/** Minimum merchandise subtotal before checkout (cents). */
export const MIN_ORDER_CENTS = 1800;

export function meetsMinimumOrder(subtotalCents: number): boolean {
  return subtotalCents >= MIN_ORDER_CENTS;
}

export function minOrderShortfallCents(subtotalCents: number): number {
  return Math.max(0, MIN_ORDER_CENTS - subtotalCents);
}
