"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Camera as InstagramIcon, ExternalLink } from "lucide-react";
import Image from "next/image";
import type { SiteSettingsData } from "@/types";

interface InstagramProps {
  settings: SiteSettingsData;
}

const KITCHEN_GALLERY = [
  { src: "/images/instagram/01.jpg", alt: "Mixing sourdough in the kitchen" },
  { src: "/images/instagram/02.jpg", alt: "Hand-shaping fresh bagels" },
  { src: "/images/instagram/03.jpg", alt: "Boiling bagels before baking" },
  { src: "/images/instagram/04.jpg", alt: "Scooping chocolate chip cookie dough" },
  { src: "/images/instagram/05.jpg", alt: "Fresh bagels and cookies from the oven" },
  { src: "/images/instagram/06.jpg", alt: "Packing bagels and cookies for pickup" },
];

export function Instagram({ settings }: InstagramProps) {
  const reducedMotion = useReducedMotion();
  const instagramUrl = settings.socialLinks?.instagram;

  return (
    <section className="py-20 px-4 lg:px-6 bg-gradient-to-b from-beige/20 to-cream">
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="text-center mb-12"
          initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-purple/10 px-4 py-1.5 text-sm font-medium text-purple mb-4">
            <InstagramIcon size={16} />
            @dinoscookies
          </div>
          <h2 className="font-display text-3xl font-bold text-forest sm:text-4xl">
            Follow Our Kitchen
          </h2>
          <p className="mt-3 text-charcoal/60 max-w-xl mx-auto">
            Daily bakes, behind-the-scenes, and cookie crumb close-ups
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {KITCHEN_GALLERY.map((item, i) => (
            <motion.a
              key={item.src}
              href={instagramUrl || "https://instagram.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-2xl shadow-md"
              initial={reducedMotion ? {} : { opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={reducedMotion ? {} : { scale: 1.03 }}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-forest/0 group-hover:bg-forest/40 transition-colors flex items-center justify-center">
                <InstagramIcon
                  size={32}
                  className="text-cream opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </motion.a>
          ))}
        </div>

        {instagramUrl && (
          <motion.div
            className="mt-10 text-center"
            initial={reducedMotion ? {} : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-forest px-8 py-3 font-semibold text-cream hover:bg-dino transition-colors"
            >
              <InstagramIcon size={18} />
              Follow on Instagram
              <ExternalLink size={16} />
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
}
