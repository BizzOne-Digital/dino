"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { SiteSettingsData } from "@/types";

interface AnnouncementBarProps {
  announcement: SiteSettingsData["announcementBar"];
  publicCodes?: Array<{ code: string; type: string; value: number }>;
}

export function AnnouncementBar({ announcement, publicCodes }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!announcement?.enabled || dismissed) return null;

  const defaultMessage = "Buy 6, Get 1 Free • Pickup & Local Delivery";
  const message = announcement.message || defaultMessage;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative z-50 border-b border-forest/10 bg-gradient-to-r from-dino/15 via-[#faf3e8] to-caramel/10"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2">
          <div className="flex flex-1 flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-forest/80 sm:text-xs">
              {message}
            </span>
            {publicCodes?.map((code) => (
              <span
                key={code.code}
                className="rounded-full bg-forest/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-forest"
              >
                Code: {code.code}
                {code.type === "percentage" ? ` — ${code.value}% off` : ""}
              </span>
            ))}
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 rounded-full p-1 text-forest/50 hover:bg-forest/5 hover:text-forest transition-colors"
            aria-label="Dismiss announcement"
          >
            <X size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
