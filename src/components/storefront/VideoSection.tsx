"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Play, Pause } from "lucide-react";

interface VideoSectionProps {
  videoUrl?: string;
  posterUrl?: string;
  title?: string;
  description?: string;
}

export function VideoSection({
  videoUrl,
  posterUrl = "/images/logo.jpg",
  title = "See How We Bake",
  description = "A peek behind the counter at Dino's kitchen — where every batch tells a story.",
}: VideoSectionProps) {
  const reducedMotion = useReducedMotion();
  const [playing, setPlaying] = useState(false);

  return (
    <section className="py-20 px-4 lg:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-purple opacity-5" />
      <div className="mx-auto max-w-5xl">
        <motion.div
          className="text-center mb-10"
          initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl font-bold text-forest sm:text-4xl">{title}</h2>
          <p className="mt-3 text-charcoal/60 max-w-xl mx-auto">{description}</p>
        </motion.div>

        <motion.div
          className="relative overflow-hidden rounded-3xl shadow-2xl ring-4 ring-beige/50"
          initial={reducedMotion ? {} : { opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          {videoUrl ? (
            <div className="relative aspect-video bg-charcoal">
              {playing ? (
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                  poster={posterUrl}
                />
              ) : (
                <>
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${posterUrl})` }}
                  />
                  <div className="absolute inset-0 bg-charcoal/40" />
                  <button
                    onClick={() => setPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center group"
                    aria-label="Play video"
                  >
                    <motion.span
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-cream/90 text-forest shadow-xl"
                      whileHover={reducedMotion ? {} : { scale: 1.1 }}
                      whileTap={reducedMotion ? {} : { scale: 0.95 }}
                    >
                      <Play size={32} className="ml-1" fill="currentColor" />
                    </motion.span>
                  </button>
                </>
              )}
              {playing && (
                <button
                  onClick={() => setPlaying(false)}
                  className="absolute top-4 right-4 rounded-full bg-charcoal/60 p-2 text-cream"
                  aria-label="Pause video"
                >
                  <Pause size={20} />
                </button>
              )}
            </div>
          ) : (
            <div className="relative aspect-video bg-gradient-to-br from-forest to-dino flex items-center justify-center">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30"
                style={{ backgroundImage: `url(${posterUrl})` }}
              />
              <div className="relative text-center p-8">
                <Play size={48} className="mx-auto text-cream/60 mb-4" />
                <p className="font-display text-xl text-cream">Video coming soon</p>
                <p className="mt-2 text-cream/60 text-sm">Follow us on Instagram for kitchen sneak peeks</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
