"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Gift, Sparkles, Star } from "lucide-react";

interface Promotion {
  _id: string;
  name: string;
  buyQuantity: number;
  freeQuantity: number;
}

interface SpecialOffersProps {
  promotions?: Promotion[];
}

const DEFAULT_PROMOTIONS: Promotion[] = [
  { _id: "1", name: "Cookie Lovers", buyQuantity: 6, freeQuantity: 1 },
  { _id: "2", name: "Bagel Bundle", buyQuantity: 12, freeQuantity: 2 },
  { _id: "3", name: "Mix & Match", buyQuantity: 4, freeQuantity: 1 },
];

export function SpecialOffers({ promotions }: SpecialOffersProps) {
  const reducedMotion = useReducedMotion();
  const items = promotions?.length ? promotions : DEFAULT_PROMOTIONS;

  return (
    <section id="offers" className="py-20 px-4 lg:px-6 relative overflow-hidden section-gradient-cool">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 h-80 w-80 blob bg-dino/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 blob bg-caramel/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          className="text-center mb-14"
          initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-dino/20 px-4 py-1.5 text-sm font-medium text-dino">
            <Sparkles size={16} />
            Sweet Deals
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-cream sm:text-4xl">
            Special Offers
          </h2>
          <p className="mt-3 text-cream/60 max-w-xl mx-auto">
            The more you bake in your cart, the more you save
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((promo, i) => (
            <motion.div
              key={promo._id}
              className="group relative overflow-hidden rounded-3xl bg-cream/10 p-5 backdrop-blur-sm border border-cream/10 sm:p-8"
              initial={reducedMotion ? {} : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={reducedMotion ? {} : { y: -6, scale: 1.02 }}
            >
              <motion.div
                className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-dino/10"
                animate={reducedMotion ? {} : { scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
              />
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-dino/20">
                  {i === 0 ? <Gift className="text-dino" size={24} /> : <Star className="text-caramel" size={24} />}
                </div>
                <h3 className="font-display text-xl font-bold text-cream">{promo.name}</h3>
                <div className="mt-4 flex flex-col items-start gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-2">
                  <span className="font-display text-3xl font-bold text-dino sm:text-4xl">
                    Buy {promo.buyQuantity}
                  </span>
                  <span className="text-xl font-bold text-caramel sm:text-2xl">
                    Get {promo.freeQuantity} Free
                  </span>
                </div>
                <p className="mt-3 text-sm text-cream/60">
                  Automatically applied at checkout when you add eligible items
                </p>
                <a
                  href="#shop"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-dino hover:text-cream transition-colors"
                >
                  Shop now →
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
