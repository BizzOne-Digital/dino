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

/** Store-wide minimum merchandise subtotal before checkout (cents). 0 = no minimum. */
export const MIN_ORDER_CENTS = 0;

export function meetsMinimumOrder(subtotalCents: number): boolean {
  // An empty cart can never check out; otherwise only enforce a minimum if one is set.
  return subtotalCents > 0 && subtotalCents >= MIN_ORDER_CENTS;
}

export function minOrderShortfallCents(subtotalCents: number): number {
  return Math.max(0, MIN_ORDER_CENTS - subtotalCents);
}
