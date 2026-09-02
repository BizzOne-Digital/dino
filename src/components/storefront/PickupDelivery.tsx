"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Clock, Truck, Package, Info } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { SiteSettingsData } from "@/types";

interface PickupDeliveryProps {
  settings: SiteSettingsData;
}

export function PickupDelivery({ settings }: PickupDeliveryProps) {
  const reducedMotion = useReducedMotion();
  const { pickup, delivery } = settings;

  return (
    <section id="pickup" className="py-20 px-4 lg:px-6 bg-forest text-cream relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 h-96 w-96 blob bg-dino/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 blob bg-caramel/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          className="text-center mb-14"
          initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Pickup & Delivery</h2>
          <p className="mt-3 text-cream/60 max-w-xl mx-auto">
            Fresh bakes, delivered to your door or ready for pickup
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          <motion.div
            className="rounded-3xl bg-cream/10 p-5 backdrop-blur-sm border border-cream/10 sm:p-8"
            initial={reducedMotion ? {} : { opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={reducedMotion ? {} : { y: -4 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-dino/20">
                <Package size={24} className="text-dino" />
              </div>
              <h3 className="font-display text-xl font-bold">Pickup</h3>
            </div>

            <div className="space-y-4 text-cream/80">
              <div className="flex gap-3">
                <MapPin size={18} className="shrink-0 mt-0.5 text-dino" />
                <p>{pickup.address || "GTA — address provided after order"}</p>
              </div>
              {pickup.instructions && (
                <div className="flex gap-3">
                  <Info size={18} className="shrink-0 mt-0.5 text-dino" />
                  <p>{pickup.instructions}</p>
                </div>
              )}
              {pickup.days?.length > 0 && (
                <div className="flex gap-3">
                  <Clock size={18} className="shrink-0 mt-0.5 text-dino" />
                  <div>
                    <p className="font-medium text-cream">Available Days</p>
                    <p>{pickup.days.join(", ")}</p>
                  </div>
                </div>
              )}
              {pickup.timeWindows?.length > 0 && (
                <div className="flex gap-3">
                  <Clock size={18} className="shrink-0 mt-0.5 text-dino" />
                  <div>
                    <p className="font-medium text-cream">Time Windows</p>
                    <p>{pickup.timeWindows.join(" · ")}</p>
                  </div>
                </div>
              )}
              {pickup.cutoffNotice && (
                <p className="text-sm text-caramel font-medium">{pickup.cutoffNotice}</p>
              )}
            </div>
          </motion.div>

          <motion.div
            className="rounded-3xl bg-cream/10 p-5 backdrop-blur-sm border border-cream/10 sm:p-8"
            initial={reducedMotion ? {} : { opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={reducedMotion ? {} : { y: -4 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-caramel/20">
                <Truck size={24} className="text-caramel" />
              </div>
              <h3 className="font-display text-xl font-bold">Local Delivery</h3>
            </div>

            {delivery.enabled ? (
              <div className="space-y-4 text-cream/80">
                <p>We deliver fresh bakes throughout the Greater Toronto Area.</p>
                {delivery.fee > 0 && (
                  <p>
                    Delivery fee: <span className="font-semibold text-cream">{formatCurrency(delivery.fee)}</span>
                  </p>
                )}
                {delivery.minimumOrderEnabled && delivery.minimumOrder > 0 && (
                  <p>
                    Minimum order: <span className="font-semibold text-cream">{formatCurrency(delivery.minimumOrder)}</span>
                  </p>
                )}
                <a
                  href="#shop"
                  className="inline-flex mt-4 rounded-full bg-dino px-6 py-3 font-semibold text-cream hover:bg-dino/80 transition-colors"
                >
                  Start Ordering
                </a>
              </div>
            ) : (
              <p className="text-cream/60">
                Local delivery is currently unavailable. Pickup orders are always welcome!
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
