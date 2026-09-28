"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Cookie, Gift, Sparkles } from "lucide-react";

const PRICING_DEALS = [
  {
    id: "bagels",
    title: "Bagel Prices",
    icon: Gift,
    accent: "text-dino",
    lines: ["1 Bagel — $3.50", "6 Bagels — $18.00", "1 Dozen — $30.00"],
  },
  {
    id: "cookies",
    title: "Cookie Prices",
    icon: Cookie,
    accent: "text-caramel",
    lines: ["1 Cookie — $3.50", "6 Cookies — $18.00", "1 Dozen — $30.00"],
  },
  {
    id: "combo",
    title: "Combo Deal",
    icon: Sparkles,
    accent: "text-dino",
    lines: ["1 Bagel + 1 Cookie — $6.00"],
    highlight: "$6.00",
  },
];

export function SpecialOffers() {
  const reducedMotion = useReducedMotion();

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
            Menu Pricing
          </h2>
          <p className="mt-3 text-cream/60 max-w-xl mx-auto">
            Order singles, 6-packs, or dozens — plus our bagel &amp; cookie combo
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {PRICING_DEALS.map((deal, i) => {
            const Icon = deal.icon;
            return (
              <motion.div
                key={deal.id}
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
                    <Icon className={deal.accent} size={24} />
                  </div>
                  <h3 className="font-display text-xl font-bold text-cream">{deal.title}</h3>
                  {deal.highlight ? (
                    <p className="mt-4 font-display text-3xl font-bold text-dino sm:text-4xl">
                      {deal.highlight}
                    </p>
                  ) : null}
                  <ul className="mt-4 space-y-2">
                    {deal.lines.map((line) => (
                      <li key={line} className="text-sm text-cream/80 sm:text-base">
                        {line}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#shop"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-dino hover:text-cream transition-colors"
                  >
                    Shop now →
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
