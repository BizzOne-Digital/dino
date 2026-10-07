"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, PartyPopper } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<{
    orderNumber: string;
    total: number;
    customer: { name: string; email: string };
    fulfillment: string;
    paymentStatus?: string;
    freeItems?: number;
  } | null>(null);

  useEffect(() => {
    if (!orderNumber) {
      setLoading(false);
      return;
    }

    const params = new URLSearchParams({ order: orderNumber });
    if (sessionId) params.set("session_id", sessionId);

    fetch(`/api/checkout/complete?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.order) {
          setOrder(d.order);
          if (d.paid || d.order.paymentStatus === "paid" || d.order.paymentMethod === "pay_on_pickup") {
            clearCart();
          }
        }
      })
      .finally(() => setLoading(false));
  }, [orderNumber, sessionId, clearCart]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full text-center rounded-3xl bg-white p-10 shadow-xl"
      >
        {loading ? (
          <div className="flex flex-col items-center py-12">
            <Loader2 className="animate-spin text-dino mb-4" size={40} />
            <p className="text-charcoal/60">Confirming your payment…</p>
          </div>
        ) : (
          <>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-dino/10"
            >
              <CheckCircle size={48} className="text-dino" />
            </motion.div>

            <h1 className="font-display text-3xl font-bold text-forest mb-2">
              Thank you for your purchase!
            </h1>
            <p className="text-charcoal/60 mb-6">
              Your order is confirmed. We&apos;re getting your fresh bakes ready!
            </p>

            {orderNumber && (
              <div className="rounded-2xl bg-cream p-6 mb-6">
                <p className="text-sm text-charcoal/50 mb-1">Order Number</p>
                <p className="font-display text-2xl font-bold text-forest">{orderNumber}</p>
                {order && (
                  <>
                    <p className="mt-3 text-sm">
                      Total: <strong>{formatCurrency(order.total)}</strong>
                    </p>
                    <p className="text-sm text-charcoal/60 capitalize">
                      {order.fulfillment === "pickup" ? "Pickup" : "Local Delivery"}
                    </p>
                    {(order.freeItems ?? 0) > 0 && (
                      <div className="mt-4 flex items-center justify-center gap-2 text-caramel font-semibold">
                        <PartyPopper size={18} />
                        You earned {order.freeItems} free item(s)!
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <p className="text-sm text-charcoal/50 mb-8">
              A confirmation email will be sent to your inbox shortly.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {orderNumber && (
                <Link
                  href={`/order/${orderNumber}`}
                  className="rounded-full bg-forest px-8 py-3 font-semibold text-cream hover:bg-dino transition-colors"
                >
                  Track Order
                </Link>
              )}
              <Link
                href="/"
                className="rounded-full border-2 border-forest px-8 py-3 font-semibold text-forest hover:bg-forest hover:text-cream transition-colors"
              >
                Continue Shopping
              </Link>
            </div>

            <Image
              src="/images/logo.jpg"
              alt="Dino's"
              width={60}
              height={60}
              className="mx-auto mt-8 rounded-full opacity-60"
            />
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <SuccessContent />
    </Suspense>
  );
}
