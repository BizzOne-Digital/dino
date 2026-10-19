/** Credit card (Stripe) processing fee — 3% of order total before this fee. */
export const CARD_PROCESSING_FEE_RATE = 0.03;

export function cardProcessingFeeCents(amountBeforeFeeCents: number): number {
  if (amountBeforeFeeCents <= 0) return 0;
  return Math.round(amountBeforeFeeCents * CARD_PROCESSING_FEE_RATE);
}

export function orderTotalWithCardFee(amountBeforeFeeCents: number): number {
  return amountBeforeFeeCents + cardProcessingFeeCents(amountBeforeFeeCents);
}
