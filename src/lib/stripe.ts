import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY?.trim();

export const stripe: Stripe | null = secretKey
  ? new Stripe(secretKey, {
      typescript: true,
    })
  : null;

export function assertStripeConfigured(): Stripe {
  if (!stripe) {
    throw new Error(
      "Stripe is not configured. Add STRIPE_SECRET_KEY to your environment (Vercel → Settings → Environment Variables)."
    );
  }
  return stripe;
}

export function stripeKeyHint(): string {
  const key = process.env.STRIPE_SECRET_KEY || "";
  if (key.startsWith("rk_")) {
    return "Restricted keys must allow Checkout Sessions (Write). Create or update the key in Stripe Dashboard → Developers → API keys.";
  }
  return "Use a secret key (sk_test_… or sk_live_…) or a restricted key (rk_…) with Checkout Sessions write permission.";
}
