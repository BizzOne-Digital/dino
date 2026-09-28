"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  type: "crumb" | "seed";
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  rotation: number;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export function FloatingParticles({ count = 24 }: { count?: number }) {
  const reducedMotion = usePrefersReducedMotion();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        type: i % 3 === 0 ? "seed" : "crumb",
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 4,
        duration: Math.random() * 8 + 6,
        delay: Math.random() * 4,
        rotation: Math.random() * 360,
      }))
    );
  }, [count]);

  if (reducedMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.type === "seed" ? p.size * 0.6 : p.size,
          }}
          initial={{ opacity: 0, y: 0, rotate: p.rotation }}
          animate={{
            opacity: [0, 0.7, 0.5, 0],
            y: [-20, -80, -140],
            x: [0, Math.sin(p.id) * 30, Math.cos(p.id) * 20],
            rotate: p.rotation + 180,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {p.type === "crumb" ? (
            <span
              className="block rounded-full bg-caramel/60"
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <span
              className="block rounded-full bg-beige/80"
              style={{ width: "100%", height: "100%" }}
            />
          )}
        </motion.span>
      ))}
    </div>
  );
}
