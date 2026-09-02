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
    <section id="home" className="relative overflow-hidden bg-[#f5ebe0]">
      {/* Desktop background image */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block lg:left-[8%] xl:left-[5%]">
        <Image
          src="/images/hero-bg.jpg"
          alt=""
          fill
          priority
          className="object-contain object-center"
          sizes="85vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f5ebe0] via-[#f5ebe0]/50 via-30% to-transparent" />
      </div>

      {/* Wavy shapes — desktop only */}
      <div className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
        <svg
          className="absolute -left-20 top-0 h-full w-[70%] opacity-90"
          viewBox="0 0 800 900"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path d="M0,0 L800,0 L800,200 Q600,280 500,400 Q350,550 200,650 Q80,730 0,900 Z" fill="#faf3e8" />
          <path d="M0,100 Q200,180 300,350 Q400,520 150,750 Q80,820 0,900 Z" fill="#ede4d4" opacity="0.7" />
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
            <span
              className="mt-1 block text-3xl font-bold uppercase sm:text-4xl lg:text-[3.25rem]"
              style={{
                background: "linear-gradient(135deg, #c86b32 0%, #e8944a 40%, #a85a28 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
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
              className="inline-flex w-full items-center justify-center rounded-full bg-forest px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-cream shadow-lg sm:w-auto sm:px-8"
              whileTap={reducedMotion ? {} : { scale: 0.98 }}
            >
              Shop Fresh Bakes
            </motion.a>
            <a
              href="#shop"
              className="inline-flex w-full items-center justify-center rounded-full border-2 border-forest bg-white/80 px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-forest sm:w-auto sm:px-8"
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
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-forest/20 bg-white/70 text-forest">
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
        <div className="relative mt-8 h-56 w-full overflow-hidden rounded-2xl sm:h-72 lg:hidden">
          <Image
            src="/images/hero-bg.jpg"
            alt="Fresh bagels, cookies and Dino mascot"
            fill
            priority
            className="object-contain object-center"
            sizes="100vw"
          />
        </div>
      </div>

      <motion.div
        className="absolute bottom-[22%] right-[12%] z-20 hidden lg:block xl:right-[18%]"
        initial={reducedMotion ? {} : { opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="rounded-full bg-cream px-5 py-4 text-center shadow-lg ring-2 ring-beige/80">
          <p className="font-display text-xs font-semibold uppercase tracking-widest text-forest">Baked</p>
          <p className="font-display text-lg font-bold text-dino">with Love</p>
        </div>
      </motion.div>
    </section>
  );
}
