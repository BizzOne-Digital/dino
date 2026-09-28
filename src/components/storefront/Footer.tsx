"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Camera as InstagramIcon, Users as FacebookIcon, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { SiteSettingsData } from "@/types";

interface FooterProps {
  settings: SiteSettingsData;
}

export function Footer({ settings }: FooterProps) {
  const reducedMotion = useReducedMotion();
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to subscribe");
      toast.success("Welcome to the Dino family! 🍪");
      setEmail("");
    } catch {
      toast.error("Could not subscribe. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const footerLinks = [
    { label: "Shop", href: "#shop" },
    { label: "Our Story", href: "#story" },
    { label: "Pickup & Delivery", href: "#pickup" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <footer className="bg-charcoal text-cream relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 blob bg-dino/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 blob bg-caramel/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-dino/30">
                <Image
                  src="/images/logo.jpg"
                  alt={settings.businessName}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-display text-base font-bold sm:text-lg truncate">{settings.businessName}</span>
            </div>
            <p className="text-cream/60 text-sm leading-relaxed">
              {settings.footerText ||
                "Wildly fresh, naturally baked cookies and bagels made with organic ingredients in the GTA."}
            </p>
            <div className="mt-4 flex gap-3">
              {settings.socialLinks?.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-cream/10 p-2 hover:bg-dino/30 transition-colors"
                  aria-label="Instagram"
                >
                  <InstagramIcon size={18} />
                </a>
              )}
              {settings.socialLinks?.facebook && (
                <a
                  href={settings.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-cream/10 p-2 hover:bg-dino/30 transition-colors"
                  aria-label="Facebook"
                >
                  <FacebookIcon size={18} />
                </a>
              )}
              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="rounded-full bg-cream/10 p-2 hover:bg-dino/30 transition-colors"
                  aria-label="Email"
                >
                  <Mail size={18} />
                </a>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="font-display font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-cream/60 hover:text-dino transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-display font-semibold mb-4">Policies</h3>
            <ul className="space-y-2 text-sm text-cream/60">
              {settings.allergyDisclaimer && (
                <li className="leading-relaxed">{settings.allergyDisclaimer}</li>
              )}
            </ul>
          </motion.div>

          <motion.div
            initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-display font-semibold mb-4">Newsletter</h3>
            <p className="text-sm text-cream/60 mb-4">
              Get fresh bake alerts and exclusive offers
            </p>
            <form onSubmit={handleNewsletter} className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full min-w-0 flex-1 rounded-full bg-cream/10 border border-cream/10 px-4 py-2.5 text-sm outline-none focus:border-dino placeholder:text-cream/40"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="w-full rounded-full bg-dino px-4 py-2.5 text-sm font-semibold hover:bg-dino/80 disabled:opacity-60 transition-colors sm:w-auto sm:shrink-0"
              >
                {subscribing ? <Loader2 size={16} className="animate-spin" /> : "Join"}
              </button>
            </form>
          </motion.div>
        </div>

        <div className="mt-12 border-t border-cream/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-cream/40">
          <p>&copy; {new Date().getFullYear()} {settings.businessName}. All rights reserved.</p>
          <p className="text-gradient font-display font-semibold">Wildly Fresh. Naturally Baked.</p>
        </div>
      </div>
    </footer>
  );
}
