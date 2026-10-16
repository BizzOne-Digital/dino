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
    return (
      "Restricted keys need Checkout Sessions (Write). If checkout still fails, also enable Payment Intents (Write) " +
      "and Products (Write) for inline line items — or use the standard secret key (sk_live_… / sk_test_…) in STRIPE_SECRET_KEY. " +
      "Re-copy the full key with no spaces; update Vercel and redeploy."
    );
  }
  if (key.startsWith("pk_")) {
    return "STRIPE_SECRET_KEY must be sk_live_/sk_test_ (or rk_…), not the publishable pk_ key. Put pk_ in NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY only.";
  }
  return "Use a secret key (sk_test_… or sk_live_…) in STRIPE_SECRET_KEY. Re-copy from Stripe Dashboard → API keys if you see Invalid API Key.";
}
