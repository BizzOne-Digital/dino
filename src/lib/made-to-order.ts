/** Stored as `isRequestOnly` in MongoDB (legacy field name). */
export function isMadeToOrder(product: { isRequestOnly?: boolean }): boolean {
  return Boolean(product.isRequestOnly);
}

export const MADE_TO_ORDER_LABEL = "Made to order";
