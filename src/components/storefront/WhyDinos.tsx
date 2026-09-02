"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Leaf, Heart, Wheat, Sparkles } from "lucide-react";

const INGREDIENTS = [
  { icon: Leaf, label: "Organic Flour", color: "bg-dino/20 text-dino" },
  { icon: Wheat, label: "Sourdough", color: "bg-caramel/20 text-caramel" },
  { icon: Heart, label: "Made with Love", color: "bg-purple/20 text-purple" },
  { icon: Sparkles, label: "No Preservatives", color: "bg-forest/20 text-forest" },
];

const REASONS = [
  {
    title: "100% Organic Ingredients",
    description: "We source certified organic flour, eggs, and dairy from local farms.",
  },
  {
    title: "Handcrafted Daily",
    description: "Every cookie and bagel is made by hand in small batches for peak freshness.",
  },
  {
    title: "Sourdough Tradition",
    description: "Our bagels use a 48-hour sourdough process for unmatched flavor and texture.",
  },
  {
    title: "Gluten-Free Options",
    description: "Delicious gluten-free cookies and bakes that everyone can enjoy.",
  },
];

export function WhyDinos() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="py-20 px-4 lg:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cream to-beige/30" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-16">
          <motion.div
            initial={reducedMotion ? {} : { opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl font-bold text-forest sm:text-4xl">
              Why Dino&apos;s?
            </h2>
            <p className="mt-4 text-charcoal/70 leading-relaxed">
              We believe great baking starts with great ingredients and a whole lot of passion.
              Here&apos;s what sets us apart from the cookie jar.
            </p>

            <div className="mt-8 space-y-6">
              {REASONS.map((reason, i) => (
                <motion.div
                  key={reason.title}
                  className="flex gap-4"
                  initial={reducedMotion ? {} : { opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dino/10 font-display font-bold text-dino">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-forest">{reason.title}</h3>
                    <p className="mt-1 text-sm text-charcoal/60">{reason.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={reducedMotion ? {} : { opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="relative mx-auto aspect-square max-w-md">
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-dino/20 to-caramel/20 blur-2xl"
                animate={reducedMotion ? {} : { rotate: [0, 360] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />
              <div className="relative grid grid-cols-2 gap-4 p-8">
                {INGREDIENTS.map((item, i) => (
                  <motion.div
                    key={item.label}
                    className={`flex flex-col items-center justify-center rounded-2xl p-6 shadow-lg ${item.color} backdrop-blur-sm`}
                    animate={reducedMotion ? {} : { y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
                    whileHover={reducedMotion ? {} : { scale: 1.05, rotate: 2 }}
                  >
                    <item.icon size={32} />
                    <span className="mt-3 text-sm font-semibold">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
