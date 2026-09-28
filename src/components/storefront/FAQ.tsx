"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
  category?: string;
}

interface FAQProps {
  faqs?: FAQItem[];
}

const DEFAULT_FAQS: FAQItem[] = [
  {
    _id: "1",
    question: "How fresh are the cookies and bagels?",
    answer: "Everything is baked fresh daily. We recommend enjoying cookies within 3-4 days and bagels within 2 days for the best experience. You can also freeze bagels for up to 3 months.",
  },
  {
    _id: "2",
    question: "Do you offer gluten-free options?",
    answer: "Yes! We have a dedicated line of gluten-free cookies and select bakes. Look for the GF badge on products in our shop.",
  },
  {
    _id: "3",
    question: "How does the Buy 6 Get 1 Free promotion work?",
    answer: "When you add 6 eligible items to your cart, the 7th item of the same category is automatically free at checkout. Promotions stack based on our current offers.",
  },
  {
    _id: "4",
    question: "What areas do you deliver to?",
    answer: "We deliver throughout the Greater Toronto Area. Enter your postal code at checkout to confirm delivery availability and fees.",
  },
  {
    _id: "5",
    question: "Can I pay when I pick up?",
    answer: "Yes! We accept pay-on-pickup for local orders. You can also pay securely online via Stripe at checkout.",
  },
];

function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
  reducedMotion,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  reducedMotion: boolean;
}) {
  return (
    <div className="border-b border-beige/50 last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="min-w-0 flex-1 font-display text-sm font-semibold text-forest sm:text-base">{item.question}</span>
        <motion.span
          animate={reducedMotion ? {} : { rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-dino"
        >
          <ChevronDown size={20} />
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={reducedMotion ? {} : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reducedMotion ? {} : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-charcoal/70 leading-relaxed">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ({ faqs }: FAQProps) {
  const reducedMotion = useReducedMotion();
  const items = faqs?.length ? faqs : DEFAULT_FAQS;
  const [openId, setOpenId] = useState<string | null>(items[0]?._id);

  return (
    <section id="faq" className="py-20 px-4 lg:px-6">
      <div className="mx-auto max-w-3xl">
        <motion.div
          className="text-center mb-12"
          initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-dino/10 px-4 py-1.5 text-sm font-medium text-dino mb-4">
            <HelpCircle size={16} />
            Got Questions?
          </div>
          <h2 className="font-display text-3xl font-bold text-forest sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <motion.div
          className="rounded-3xl bg-white p-6 sm:p-8 shadow-lg"
          initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {items.map((item) => (
            <FAQAccordionItem
              key={item._id}
              item={item}
              isOpen={openId === item._id}
              onToggle={() => setOpenId(openId === item._id ? null : item._id)}
              reducedMotion={reducedMotion ?? false}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
