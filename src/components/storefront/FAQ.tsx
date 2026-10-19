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
    question: "Do you offer local delivery?",
    answer: "No delivery at this time.",
  },
  {
    _id: "2",
    question: "Do you offer gluten-free options?",
    answer: "No, at this time.",
  },
  {
    _id: "3",
    question: "What are your bagel and cookie prices?",
    answer:
      "Single bagels and cookies are $3.50 each. 6-packs are $18.00 and dozens are $30.00. Our Bagel + Cookie combo is $7.00.",
  },
  {
    _id: "4",
    question: "How long does order preparation take?",
    answer: "Normally 2–3 days depending on the item ordered.",
  },
  {
    _id: "5",
    question: "How does pickup work?",
    answer:
      "Select pickup at checkout and choose your preferred date and time. Pickup details and address are confirmed in your order email.",
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
