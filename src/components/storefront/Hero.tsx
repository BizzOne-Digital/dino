"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Leaf, MapPin, Wheat } from "lucide-react";
import type { SiteSettingsData } from "@/types";

interface HeroProps {
  settings: SiteSettingsData;
}

export function Hero({ settings }: HeroProps) {
  const reducedMotion = useReducedMotion();

  const heading = settings.heroHeading || "Wildly Fresh. Naturally Baked.";
  const [line1Raw, line2Raw] = heading.includes(".")
    ? heading.split(".").map((s) => s.trim()).filter(Boolean)
    : [heading, "Naturally Baked"];

  const line1Words = (line1Raw || "Wildly Fresh").split(/\s+/);
  const wildlyWord = line1Words[0]?.toUpperCase() || "WILDLY";
  const freshWord = (line1Words.slice(1).join(" ") || "FRESH").toUpperCase();
  const line2 = (line2Raw || "Naturally Baked").toUpperCase();
  const line2Display = line2.endsWith(".") ? line2 : `${line2}.`;

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-br from-[#faf3e8] via-[#f5ebe0] to-[#e7c99b]/50"
    >
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-gradient-to-br from-dino/25 to-forest/10 blur-3xl"
          animate={reducedMotion ? {} : { scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/4 right-0 h-96 w-96 rounded-full bg-gradient-to-bl from-caramel/20 to-purple/10 blur-3xl"
          animate={reducedMotion ? {} : { x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <div className="absolute bottom-0 left-0 h-64 w-full bg-gradient-to-t from-beige/30 to-transparent" />
      </div>

      {/* Desktop hero image — anchored right, fills edge */}
      <div className="pointer-events-none absolute inset-y-0 left-[22%] right-0 hidden lg:block xl:left-[20%]">
        <Image
          src="/images/hero-bg.jpg"
          alt=""
          fill
          priority
          className="object-cover object-right"
          sizes="80vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f5ebe0] from-20% via-[#f5ebe0]/70 via-35% to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#e7c99b]/20 via-transparent to-[#faf3e8]/30" />
      </div>

      {/* Wavy gradient overlay — desktop */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        <svg
          className="absolute -left-20 top-0 h-full w-[55%] opacity-80"
          viewBox="0 0 800 900"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#faf3e8" />
              <stop offset="100%" stopColor="#ede4d4" />
            </linearGradient>
          </defs>
          <path
            d="M0,0 L800,0 L800,200 Q600,280 500,400 Q350,550 200,650 Q80,730 0,900 Z"
            fill="url(#waveGrad1)"
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:py-12 lg:flex lg:min-h-[calc(100vh-8rem)] lg:items-center lg:px-8 lg:py-16">
        <motion.div
          className="w-full max-w-xl lg:max-w-[520px]"
          initial={reducedMotion ? {} : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="font-display leading-[0.95] tracking-tight">
            <span className="block text-3xl font-bold uppercase text-forest sm:text-4xl lg:text-[3.25rem]">
              {wildlyWord}
            </span>
            <span className="mt-1 block text-3xl font-bold uppercase sm:text-4xl lg:text-[3.25rem] text-gradient-warm">
              {freshWord.endsWith(".") ? freshWord : `${freshWord}.`}
            </span>
            <span className="mt-2 block text-3xl font-bold uppercase text-forest sm:text-4xl lg:text-[3.25rem]">
              {line2Display}
            </span>
          </h1>

          <p className="mt-5 max-w-md text-sm leading-relaxed text-forest/80 sm:text-base lg:text-lg">
            {settings.heroDescription ||
              "Organic sourdough bagels, irresistible chocolate chip cookies, and small-batch bakes made with quality local ingredients."}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <motion.a
              href="#shop"
              className="btn-gradient inline-flex w-full items-center justify-center rounded-full px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-cream shadow-lg shadow-forest/30 sm:w-auto sm:px-8"
              whileTap={reducedMotion ? {} : { scale: 0.98 }}
            >
              Shop Fresh Bakes
            </motion.a>
            <a
              href="#shop"
              className="inline-flex w-full items-center justify-center rounded-full border-2 border-forest/30 bg-gradient-to-r from-white/90 to-cream/80 px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-forest backdrop-blur-sm transition-all hover:border-dino hover:shadow-md sm:w-auto sm:px-8"
            >
              See Today&apos;s Flavours
            </a>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 border-t border-forest/10 pt-6 sm:grid-cols-3 sm:gap-4">
            {[
              { icon: Leaf, label: "Organic Home Baking" },
              { icon: MapPin, label: "Locally Sourced" },
              { icon: Wheat, label: "Gluten-Free Options" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white to-beige/50 text-forest shadow-sm ring-1 ring-forest/10">
                  <Icon size={16} strokeWidth={2} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest/90 sm:text-xs">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mobile / tablet hero image */}
        <div className="relative mt-8 h-56 w-full overflow-hidden rounded-2xl sm:h-72 lg:hidden ring-1 ring-forest/10 shadow-xl">
          <Image
            src="/images/hero-bg.jpg"
            alt="Fresh bagels, cookies and Dino mascot"
            fill
            priority
            className="object-cover object-right"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f5ebe0]/60 via-transparent to-transparent" />
        </div>
      </div>

      <motion.div
        className="absolute bottom-[20%] right-[5%] z-20 hidden lg:block xl:right-[8%]"
        initial={reducedMotion ? {} : { opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="rounded-full bg-gradient-to-br from-cream to-beige px-5 py-4 text-center shadow-xl ring-2 ring-caramel/30">
          <p className="font-display text-xs font-semibold uppercase tracking-widest text-forest">Baked</p>
          <p className="font-display text-lg font-bold text-gradient-warm">with Love</p>
        </div>
      </motion.div>
    </section>
  );
}
