"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { SiteSettingsData } from "@/types";

interface OurStoryProps {
  settings: SiteSettingsData;
}

export function OurStory({ settings }: OurStoryProps) {
  const reducedMotion = useReducedMotion();

  return (
    <section id="story" className="py-20 px-4 lg:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            className="relative order-2 lg:order-1"
            initial={reducedMotion ? {} : { opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              <Image
                src={settings.heroImage || "/images/logo.jpg"}
                alt="Dino's baking story"
                width={600}
                height={500}
                className="aspect-[6/5] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/50 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="font-display text-2xl font-bold text-cream">
                  {settings.businessName}
                </p>
                <p className="text-cream/80 text-sm mt-1">Est. with love & sourdough</p>
              </div>
            </div>
            <motion.div
              className="absolute -bottom-6 -right-6 hidden lg:block h-32 w-32 rounded-2xl bg-caramel/90 p-4 shadow-xl"
              animate={reducedMotion ? {} : { rotate: [0, 5, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
            >
              <p className="font-display text-3xl font-bold text-cream">15+</p>
              <p className="text-sm text-cream/80">Years of baking joy</p>
            </motion.div>
          </motion.div>

          <motion.div
            className="order-1 lg:order-2"
            initial={reducedMotion ? {} : { opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-dino">Our Story</span>
            <h2 className="mt-2 font-display text-3xl font-bold text-forest sm:text-4xl">
              From Our Kitchen to Your Table
            </h2>
            <div className="mt-6 space-y-4 text-charcoal/70 leading-relaxed">
              {settings.story ? (
                settings.story.split("\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))
              ) : (
                <>
                  <p>
                    Dino&apos;s Cookies & Bagels started in a small home kitchen with a passion for
                    organic ingredients and time-honored baking techniques. What began as weekend
                    treats for friends and family quickly grew into a beloved local bakery.
                  </p>
                  <p>
                    Today, we still bake every cookie and bagel by hand, using the same sourdough
                    starter that&apos;s been with us since day one. We believe food should be wild,
                    fresh, and made with ingredients you can pronounce.
                  </p>
                  <p>
                    Whether you&apos;re picking up a dozen bagels for Sunday brunch or sending a gift
                    box to someone special, we pour the same love into every batch.
                  </p>
                </>
              )}
            </div>
            <a
              href="#shop"
              className="mt-8 inline-flex rounded-full bg-forest px-8 py-3 font-semibold text-cream transition-colors hover:bg-dino"
            >
              Taste Our Story
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
