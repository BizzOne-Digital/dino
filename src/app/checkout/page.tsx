"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, MapPin, Package, CreditCard, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import type { PricingResult } from "@/types";

const checkoutSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    notes: z.string().optional(),
    fulfillment: z.enum(["pickup", "delivery"]),
    street: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    postalCode: z.string().optional(),
    preferredDate: z.string().optional(),
    preferredTimeWindow: z.string().optional(),
    discountCode: z.string().optional(),
    marketingConsent: z.boolean(),
    paymentMethod: z.enum(["stripe", "pay_on_pickup"]),
  })
  .refine(
    (data) => {
      if (data.fulfillment === "delivery") {
        return data.street && data.city && data.province && data.postalCode;
      }
      return true;
    },
    { message: "Delivery address is required", path: ["street"] }
  );

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const [pricing, setPricing] = useState<PricingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [settings, setSettings] = useState({
    stripeEnabled: true,
    payOnPickupEnabled: true,
    delivery: { enabled: true, fee: 500 },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fulfillment: "pickup",
      paymentMethod: "stripe",
      marketingConsent: false,
    },
  });

  const fulfillment = watch("fulfillment");
  const discountCode = watch("discountCode");
  const postalCode = watch("postalCode");

  useEffect(() => {
    fetch("/api/site-data")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) {
          setSettings({
            stripeEnabled: d.settings.stripeEnabled,
            payOnPickupEnabled: d.settings.payOnPickupEnabled,
            delivery: d.settings.delivery,
          });
        }
      });
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const calc = async () => {
      setCalculating(true);
      try {
        const res = await fetch("/api/cart/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((i) => ({
              productId: i.productId,
              variantId: i.variantId,
              quantity: i.quantity,
            })),
            fulfillment,
            discountCode: discountCode || undefined,
            postalCode: postalCode || undefined,
          }),
        });
        if (res.ok) setPricing(await res.json());
      } finally {
        setCalculating(false);
      }
    };
    const timer = setTimeout(calc, 300);
    return () => clearTimeout(timer);
  }, [items, fulfillment, discountCode, postalCode]);

  async function onSubmit(data: CheckoutForm) {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          customer: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            notes: data.notes,
            marketingConsent: data.marketingConsent,
          },
          fulfillment: data.fulfillment,
          deliveryAddress:
            data.fulfillment === "delivery"
              ? {
                  street: data.street!,
                  city: data.city!,
                  province: data.province!,
                  postalCode: data.postalCode!,
                }
              : undefined,
          preferredDate: data.preferredDate,
          preferredTimeWindow: data.preferredTimeWindow,
          discountCode: data.discountCode,
          paymentMethod: data.paymentMethod,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Checkout failed");
        return;
      }

      clearCart();

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        window.location.href = `/checkout/success?order=${result.orderNumber}`;
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
        <Package size={48} className="text-dino mb-4" />
        <h1 className="font-display text-2xl font-bold text-forest mb-2">Your cart is empty</h1>
        <p className="text-charcoal/60 mb-6">Add some delicious bakes before checking out.</p>
        <Link
          href="/#shop"
          className="rounded-full bg-forest px-8 py-3 font-semibold text-cream hover:bg-dino transition-colors"
        >
          Shop Fresh Bakes
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-beige/50 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-forest hover:text-dino transition-colors">
            <ArrowLeft size={20} />
            <Image src="/images/logo.jpg" alt="Dino's" width={40} height={40} className="rounded-full" />
          </Link>
          <h1 className="font-display text-xl font-bold text-forest">Checkout</h1>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 pb-28 sm:py-10 lg:grid-cols-5 lg:gap-8 lg:pb-10">
        {/* Order summary first on mobile */}
        <aside className="order-1 lg:order-2 lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-6"
          >
            <h2 className="font-display text-lg font-bold text-forest mb-4">Order Summary</h2>
            <ul className="space-y-3 mb-6 max-h-48 overflow-y-auto lg:max-h-none">
              {items.map((item) => (
                <li key={`${item.productId}-${item.variantId}`} className="flex gap-3 min-w-0">
                  {item.image && (
                    <Image src={item.image} alt="" width={48} height={48} className="rounded-lg object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-xs text-charcoal/50">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold shrink-0">{formatCurrency(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>

            {calculating ? (
              <div className="flex justify-center py-4">
                <Loader2 className="animate-spin text-dino" />
              </div>
            ) : pricing ? (
              <div className="space-y-2 border-t border-beige pt-4 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(pricing.subtotal)}</span>
                </div>
                {pricing.promotionSavings > 0 && (
                  <div className="flex justify-between text-caramel">
                    <span>Promotion ({pricing.freeItems} free)</span>
                    <span>-{formatCurrency(pricing.promotionSavings)}</span>
                  </div>
                )}
                {pricing.discount > 0 && (
                  <div className="flex justify-between text-dino">
                    <span>Discount</span>
                    <span>-{formatCurrency(pricing.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(pricing.tax)}</span>
                </div>
                {pricing.deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>{formatCurrency(pricing.deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between font-display text-lg font-bold text-forest pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(pricing.total)}</span>
                </div>
              </div>
            ) : null}
          </motion.div>
        </aside>

        <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="order-2 space-y-6 lg:order-1 lg:col-span-3 lg:space-y-8">
          <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
            <h2 className="font-display text-lg font-bold text-forest mb-4">Contact Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input {...register("name")} className="w-full rounded-lg border border-beige px-4 py-2.5 outline-none focus:ring-2 focus:ring-dino" />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" {...register("email")} className="w-full rounded-lg border border-beige px-4 py-2.5 outline-none focus:ring-2 focus:ring-dino" />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input {...register("phone")} className="w-full rounded-lg border border-beige px-4 py-2.5 outline-none focus:ring-2 focus:ring-dino" />
                {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
            <h2 className="font-display text-lg font-bold text-forest mb-4">Fulfillment</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-colors ${fulfillment === "pickup" ? "border-dino bg-dino/5" : "border-beige"}`}>
                <input type="radio" value="pickup" {...register("fulfillment")} className="sr-only" />
                <Package size={20} className="text-dino" />
                <div>
                  <p className="font-semibold">Pickup</p>
                  <p className="text-sm text-charcoal/60">Collect at our location</p>
                </div>
              </label>
              {settings.delivery.enabled && (
                <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-colors ${fulfillment === "delivery" ? "border-dino bg-dino/5" : "border-beige"}`}>
                  <input type="radio" value="delivery" {...register("fulfillment")} className="sr-only" />
                  <MapPin size={20} className="text-dino" />
                  <div>
                    <p className="font-semibold">Local Delivery</p>
                    <p className="text-sm text-charcoal/60">+{formatCurrency(settings.delivery.fee)}</p>
                  </div>
                </label>
              )}
            </div>

            {fulfillment === "delivery" && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Street Address</label>
                  <input {...register("street")} className="w-full rounded-lg border border-beige px-4 py-2.5 outline-none focus:ring-2 focus:ring-dino" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input {...register("city")} className="w-full rounded-lg border border-beige px-4 py-2.5 outline-none focus:ring-2 focus:ring-dino" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Province</label>
                  <input {...register("province")} className="w-full rounded-lg border border-beige px-4 py-2.5 outline-none focus:ring-2 focus:ring-dino" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Postal Code</label>
                  <input {...register("postalCode")} className="w-full rounded-lg border border-beige px-4 py-2.5 outline-none focus:ring-2 focus:ring-dino" />
                </div>
              </div>
            )}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Preferred Date</label>
                <input type="date" {...register("preferredDate")} className="w-full rounded-lg border border-beige px-4 py-2.5 outline-none focus:ring-2 focus:ring-dino" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Preferred Time</label>
                <input {...register("preferredTimeWindow")} placeholder="e.g. 10am - 12pm" className="w-full rounded-lg border border-beige px-4 py-2.5 outline-none focus:ring-2 focus:ring-dino" />
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
            <h2 className="font-display text-lg font-bold text-forest mb-4">Payment</h2>
            <div className="space-y-3">
              {settings.stripeEnabled && (
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-beige p-4 has-[:checked]:border-dino has-[:checked]:bg-dino/5">
                  <input type="radio" value="stripe" {...register("paymentMethod")} />
                  <CreditCard size={20} className="text-dino" />
                  <span className="font-semibold">Pay with Card (Stripe)</span>
                </label>
              )}
              {settings.payOnPickupEnabled && (
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-beige p-4 has-[:checked]:border-dino has-[:checked]:bg-dino/5">
                  <input type="radio" value="pay_on_pickup" {...register("paymentMethod")} />
                  <Wallet size={20} className="text-dino" />
                  <span className="font-semibold">Pay on Pickup</span>
                </label>
              )}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
            <label className="block text-sm font-medium mb-1">Discount Code</label>
            <input {...register("discountCode")} placeholder="Enter code" className="w-full rounded-lg border border-beige px-4 py-2.5 outline-none focus:ring-2 focus:ring-dino uppercase" />
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Order Notes</label>
              <textarea {...register("notes")} rows={3} className="w-full rounded-lg border border-beige px-4 py-2.5 outline-none focus:ring-2 focus:ring-dino resize-none" />
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("marketingConsent")} className="rounded" />
              Send me updates about new flavours and offers
            </label>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="hidden w-full items-center justify-center gap-2 rounded-full bg-forest py-4 font-semibold text-cream hover:bg-dino transition-colors disabled:opacity-50 lg:flex"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : null}
            {loading ? "Processing..." : `Place Order — ${pricing ? formatCurrency(pricing.total) : "..."}`}
          </button>
        </form>
      </div>

      {/* Mobile sticky checkout bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-beige/50 bg-white/95 p-4 backdrop-blur-md safe-bottom lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="text-xs text-charcoal/50">Total</p>
            <p className="font-display text-lg font-bold text-forest">
              {pricing ? formatCurrency(pricing.total) : "—"}
            </p>
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={loading}
            className="flex flex-1 max-w-[200px] items-center justify-center gap-2 rounded-full bg-forest py-3.5 text-sm font-semibold text-cream disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
