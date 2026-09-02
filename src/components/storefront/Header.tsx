"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { SiteSettingsData } from "@/types";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Shop", href: "#shop" },
  { label: "Our Story", href: "#story" },
  { label: "Special Offers", href: "#offers" },
  { label: "Pickup & Delivery", href: "#pickup" },
  { label: "Contact", href: "#contact" },
];

interface HeaderProps {
  settings: SiteSettingsData;
  onSearch?: (query: string) => void;
}

export function Header({ settings, onSearch }: HeaderProps) {
  const { itemCount, setIsOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
    const shop = document.getElementById("shop");
    if (shop) shop.scrollIntoView({ behavior: "smooth" });
    setSearchOpen(false);
    setMobileOpen(false);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        scrolled
          ? "glass shadow-md shadow-forest/5"
          : "bg-gradient-to-r from-[#faf3e8]/95 via-cream/90 to-beige/30 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
        <a href="#home" className="flex shrink-0 items-center gap-3 group">
          <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-forest/10 transition-transform group-hover:scale-105 sm:h-14 sm:w-14">
            <Image
              src="/images/logo.jpg"
              alt={settings.businessName}
              fill
              className="object-cover"
              priority
            />
          </div>
        </a>

        <nav className="hidden items-center gap-0.5 xl:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-2.5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-forest/85 transition-colors hover:text-dino lg:px-3 lg:text-xs"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="rounded-full p-2.5 text-forest transition-colors hover:bg-forest/5"
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          <button
            onClick={() => setIsOpen(true)}
            className="relative rounded-full p-2.5 text-forest transition-colors hover:bg-forest/5"
            aria-label="Open cart"
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-caramel text-[10px] font-bold text-cream"
              >
                {itemCount}
              </motion.span>
            )}
          </button>

          <a
            href="#shop"
            className="hidden rounded-full bg-gradient-to-r from-forest to-dino px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-cream shadow-md shadow-forest/25 transition-all hover:shadow-lg hover:shadow-dino/30 sm:inline-block"
          >
            Order Fresh
          </a>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-full p-2.5 text-forest lg:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSearch}
            className="border-t border-forest/10 px-4 py-3"
          >
            <div className="mx-auto flex max-w-xl flex-col gap-2 sm:flex-row">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cookies, bagels..."
                className="flex-1 rounded-full border border-beige bg-white px-4 py-2 text-sm outline-none focus:border-dino focus:ring-2 focus:ring-dino/20"
              />
              <button
                type="submit"
                className="w-full rounded-full bg-forest px-4 py-2.5 text-sm font-semibold text-cream sm:w-auto"
              >
                Search
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-forest/10 lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-bold uppercase tracking-wide text-forest hover:bg-forest/5"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#shop"
                onClick={() => setMobileOpen(false)}
                className="mt-2 rounded-full bg-gradient-to-r from-forest to-dino px-4 py-3 text-center text-sm font-bold uppercase text-cream shadow-md"
              >
                Order Fresh
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
