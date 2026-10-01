"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface MarqueeProps {
  items: string[];
  speed?: number;
  className?: string;
}

export function Marquee({ items, speed = 30, className = "" }: MarqueeProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (!items.length) return null;

  const content = items.join("  ✦  ");

  if (reducedMotion) {
    return (
      <div className={`overflow-hidden gradient-forest py-3 ${className}`}>
        <p className="text-center text-sm font-medium text-cream">{content}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden gradient-forest py-3 ${className}`} aria-hidden="true">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
      >
        {[0, 1].map((dup) => (
          <span
            key={dup}
            className="mx-4 font-display text-sm font-medium tracking-wider text-cream uppercase"
          >
            {content}
            <span className="mx-8 text-dino">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
