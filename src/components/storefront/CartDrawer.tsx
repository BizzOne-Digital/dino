"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, Trash2, Gift, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import type { PricingResult } from "@/types";

export function CartDrawer() {
  const reducedMotion = useReducedMotion();
  const {
    items,
    itemCount,
    isOpen,
    setIsOpen,
    removeItem,
    updateQuantity,
    clearCart,
    justAdded,
  } = useCart();
  const [pricing, setPricing] = useState<PricingResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || items.length === 0) {
      setPricing(null);
      return;
    }

    const calculate = async () => {
      setLoading(true);
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
            fulfillment: "pickup",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setPricing(data);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };

    calculate();
  }, [items, isOpen]);

  const subtotal = pricing?.subtotal ?? items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />

          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl safe-top safe-bottom"
            initial={reducedMotion ? { x: "100%" } : { x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={reducedMotion ? { duration: 0.01 } : { type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="flex items-center justify-between border-b border-beige/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <ShoppingBag size={22} className="text-forest" />
                <h2 className="font-display text-xl font-bold text-forest">
                  Your Cart ({itemCount})
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 hover:bg-beige/30 transition-colors"
                aria-label="Close cart"
              >
                <X size={22} />
              </button>
            </div>

            {justAdded && (
              <motion.div
                className="bg-dino/10 px-6 py-2 text-sm font-medium text-forest text-center"
                initial={reducedMotion ? {} : { opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Added to cart! 🍪
              </motion.div>
            )}

            {pricing && pricing.promotionSavings > 0 && (
              <div className="flex items-center gap-2 bg-caramel/10 px-6 py-3 text-sm">
                <Gift size={16} className="text-caramel shrink-0" />
                <span className="text-charcoal">
                  Promotion savings: <strong className="text-caramel">{formatCurrency(pricing.promotionSavings)}</strong>
                  {pricing.freeItems > 0 && ` · ${pricing.freeItems} free item(s)!`}
                </span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ShoppingBag size={48} className="text-beige mb-4" />
                  <p className="font-display text-lg text-forest">Your cart is empty</p>
                  <p className="mt-2 text-sm text-charcoal/60">Add some fresh bakes to get started</p>
                  <a
                    href="#shop"
                    onClick={() => setIsOpen(false)}
                    className="mt-6 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream hover:bg-dino transition-colors"
                  >
                    Browse Shop
                  </a>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <motion.li
                      key={`${item.productId}-${item.variantId}`}
                      className="flex gap-4 rounded-2xl bg-white p-3 shadow-sm"
                      layout={!reducedMotion}
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-beige/30">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ShoppingBag size={24} className="text-beige" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-forest truncate">{item.name}</h3>
                        <p className="text-sm font-semibold text-charcoal mt-1">
                          {formatCurrency(item.price)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1, item.variantId)
                            }
                            className="rounded-full border border-beige p-1 hover:bg-beige/30"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1, item.variantId)
                            }
                            className="rounded-full border border-beige p-1 hover:bg-beige/30"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={() => removeItem(item.productId, item.variantId)}
                            className="ml-auto rounded-full p-1 text-charcoal/40 hover:text-caramel transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-beige/50 px-6 py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-charcoal/60">Subtotal</span>
                  <span className="font-display text-xl font-bold text-forest">
                    {loading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      formatCurrency(subtotal)
                    )}
                  </span>
                </div>

                {pricing && pricing.promotionSavings > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-caramel">Promotion savings</span>
                    <span className="font-semibold text-caramel">
                      -{formatCurrency(pricing.promotionSavings)}
                    </span>
                  </div>
                )}

                <a
                  href="/checkout"
                  className="flex w-full items-center justify-center rounded-full bg-forest py-4 font-semibold text-cream hover:bg-dino transition-colors"
                >
                  Checkout
                </a>

                <button
                  onClick={clearCart}
                  className="w-full text-center text-sm text-charcoal/40 hover:text-caramel transition-colors"
                >
                  Clear cart
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
