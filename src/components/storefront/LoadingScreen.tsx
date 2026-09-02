"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingScreen({ onComplete }: { onComplete?: () => void }) {
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, reducedMotion ? 300 : 1800);
    return () => clearTimeout(timer);
  }, [onComplete, reducedMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-forest"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.1 : 0.6 }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-32 -left-32 h-96 w-96 blob bg-dino/20 blur-3xl" />
            <div className="absolute -bottom-32 -right-32 h-96 w-96 blob bg-caramel/20 blur-3xl" />
          </div>

          <motion.div
            className="relative"
            animate={reducedMotion ? {} : { scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-dino/40 ring-offset-4 ring-offset-forest shadow-2xl">
              <Image
                src="/images/logo.jpg"
                alt="Dino's Cookies & Bagels"
                fill
                className="object-cover"
                priority
              />
            </div>
            {!reducedMotion && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-dino/50"
                animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.div>

          <motion.p
            className="mt-8 font-display text-xl text-cream tracking-wide"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Wildly Fresh. Naturally Baked.
          </motion.p>

          {!reducedMotion && (
            <motion.div className="mt-6 flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-2 w-2 rounded-full bg-dino"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
