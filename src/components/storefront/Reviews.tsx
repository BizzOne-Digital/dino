"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  _id: string;
  name: string;
  content: string;
  rating: number;
  isPlaceholder?: boolean;
}

interface ReviewsProps {
  testimonials?: Testimonial[];
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    _id: "1",
    name: "Sarah M.",
    content: "The chocolate chip cookies are absolutely incredible — chewy, chunky, and made with real butter. My kids fight over them!",
    rating: 5,
  },
  {
    _id: "2",
    name: "James K.",
    content: "Best sourdough bagels in the GTA. Crispy outside, chewy inside. I order a dozen every Sunday.",
    rating: 5,
  },
  {
    _id: "3",
    name: "Priya R.",
    content: "Finally found gluten-free cookies that actually taste amazing. Dino's is a game changer for our family.",
    rating: 5,
  },
];

export function Reviews({ testimonials }: ReviewsProps) {
  const reducedMotion = useReducedMotion();
  const real = testimonials?.filter((t) => !t.isPlaceholder) ?? [];
  const items = real.length > 0 ? real : DEFAULT_TESTIMONIALS;
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((c) => (c + 1) % items.length);
  const prev = () => setCurrent((c) => (c - 1 + items.length) % items.length);

  return (
    <section id="reviews" className="py-20 px-4 lg:px-6">
      <div className="mx-auto max-w-4xl">
        <motion.div
          className="text-center mb-12"
          initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl font-bold text-forest sm:text-4xl">
            What Our Customers Say
          </h2>
          <p className="mt-3 text-charcoal/60">Real reviews from real cookie lovers</p>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={reducedMotion ? {} : { opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reducedMotion ? {} : { opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl bg-white p-5 sm:p-10 shadow-xl relative"
            >
              <Quote className="absolute top-6 left-6 text-dino/20" size={48} />
              <div className="relative">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: items[current].rating }).map((_, i) => (
                    <Star key={i} size={18} className="fill-caramel text-caramel" />
                  ))}
                </div>
                <p className="text-base sm:text-lg text-charcoal/80 leading-relaxed italic">
                  &ldquo;{items[current].content}&rdquo;
                </p>
                <p className="mt-6 font-display font-semibold text-forest">
                  {items[current].name}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="rounded-full border border-beige p-3 hover:bg-beige/30 transition-colors"
              aria-label="Previous review"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === current ? "w-6 bg-dino" : "w-2 bg-beige"
                  }`}
                  aria-label={`Go to review ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="rounded-full border border-beige p-3 hover:bg-beige/30 transition-colors"
              aria-label="Next review"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
