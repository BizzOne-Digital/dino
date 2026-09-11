"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  startingPrice?: number;
  productCount?: number;
}

const DEFAULT_CATEGORIES: Category[] = [
  {
    _id: "1",
    name: "Bagels",
    slug: "bagels",
    description: "12 sourdough flavours",
    startingPrice: 350,
  },
  {
    _id: "2",
    name: "Cookies",
    slug: "cookies",
    description: "15 cookie flavours",
    startingPrice: 350,
  },
  {
    _id: "3",
    name: "Combo Deals",
    slug: "combo-deals",
    description: "Bagel + cookie for $6",
    startingPrice: 600,
  },
];

const GRADIENTS = [
  "from-dino/80 to-forest",
  "from-caramel to-cocoa",
  "from-purple/80 to-forest",
  "from-beige to-caramel/80",
  "from-forest to-dino/70",
];

interface CategoryShowcaseProps {
  categories?: Category[];
}

export function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  const reducedMotion = useReducedMotion();
  const items = (categories?.length ? categories.slice(0, 5) : DEFAULT_CATEGORIES).slice(0, 5);

  return (
    <section className="py-20 px-4 lg:px-6 relative overflow-hidden section-gradient-warm">
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="text-center mb-12"
          initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl font-bold text-forest sm:text-4xl">
            Browse by Category
          </h2>
          <p className="mt-3 text-charcoal/60 max-w-xl mx-auto">
            From classic cookies to artisan bagels — find your favorites
          </p>
        </motion.div>

        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide snap-x snap-mandatory sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-5">
          {items.map((cat, i) => (
            <motion.a
              key={cat._id}
              href={`#shop?category=${cat.slug}`}
              className="group relative min-w-[72vw] shrink-0 snap-center overflow-hidden rounded-2xl aspect-[3/4] shadow-lg sm:min-w-0 sm:aspect-[4/5]"
              initial={reducedMotion ? {} : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={reducedMotion ? {} : { y: -8, rotateX: 5, rotateY: -5 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}`} />
              {cat.image && (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover mix-blend-overlay opacity-60 transition-transform duration-500 group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-5 text-cream">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold">{cat.name}</h3>
                    <p className="mt-1 text-sm text-cream/70">{cat.description}</p>
                  </div>
                  <motion.span
                    className="rounded-full bg-cream/20 p-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                    whileHover={reducedMotion ? {} : { rotate: 45 }}
                  >
                    <ArrowUpRight size={18} />
                  </motion.span>
                </div>
                {cat.startingPrice && (
                  <p className="mt-3 text-sm font-medium text-beige">
                    From {formatCurrency(cat.startingPrice)}
                  </p>
                )}
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
