"use client";

import { useEffect, useState } from "react";
import { LoadingScreen } from "./LoadingScreen";
import { SmoothScroll } from "./SmoothScroll";
import { AnnouncementBar } from "./AnnouncementBar";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { Marquee } from "./Marquee";
import { CategoryShowcase } from "./CategoryShowcase";
import { ShopSection } from "./ShopSection";
import { SpecialOffers } from "./SpecialOffers";
import { WhyDinos } from "./WhyDinos";
import { OurStory } from "./OurStory";
import { VideoSection } from "./VideoSection";
import { PickupDelivery } from "./PickupDelivery";
import { Reviews } from "./Reviews";
import { Instagram } from "./Instagram";
import { FAQ } from "./FAQ";
import { Contact } from "./Contact";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";
import type { SiteSettingsData } from "@/types";

interface SiteData {
  settings: SiteSettingsData & {
    logo?: string;
    homepageVideo?: { url: string; poster: string };
  };
  promotions: Array<{ _id: string; name: string; buyQuantity: number; freeQuantity: number }>;
  publicDiscountCodes: Array<{ code: string; type: string; value: number }>;
  faqs: Array<{ _id: string; question: string; answer: string; category: string }>;
  testimonials: Array<{
    _id: string;
    name: string;
    content: string;
    rating: number;
    isPlaceholder: boolean;
  }>;
}

const DEFAULT_SETTINGS: SiteSettingsData = {
  businessName: "Dino's Cookies & Bagels",
  email: "sales@dinoscookiesandbagels.ca",
  phone: "905-832-3272",
  socialLinks: {},
  heroHeading: "Wildly Fresh. Naturally Baked.",
  heroDescription:
    "Organic sourdough bagels, irresistible chocolate chip cookies, and small-batch bakes made with quality local ingredients.",
  announcementBar: {
    enabled: true,
    message: "Fresh bakes daily — order online for pickup or local delivery!",
  },
  story: "",
  pickup: {
    address: "[Configure pickup address in admin settings]",
    instructions: "",
    days: [],
    timeWindows: [],
    cutoffNotice: "",
  },
  delivery: { enabled: true, fee: 500, minimumOrder: 2500, minimumOrderEnabled: false },
  taxRate: 13,
  stripeEnabled: true,
  payOnPickupEnabled: true,
  storeOpen: true,
  seo: {
    title: "Dino's Cookies & Bagels",
    description: "Organic home-baked bagels and cookies",
  },
  allergyDisclaimer:
    "Please contact us about allergies and cross-contamination concerns.",
  privacyPolicy: "",
  termsConditions: "",
  refundPolicy: "",
  footerText: "© Dino's Cookies & Bagels. Handcrafted with love.",
};

export function HomePage() {
  const [loaded, setLoaded] = useState(false);
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<
    Array<{
      _id: string;
      name: string;
      slug: string;
      description?: string;
      image?: string;
      startingPrice?: number;
    }>
  >([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});

    fetch("/api/site-data")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setSiteData(data);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const settings = siteData?.settings ?? DEFAULT_SETTINGS;

  return (
    <>
      <LoadingScreen />
      <SmoothScroll>
        <AnnouncementBar
          announcement={settings.announcementBar}
          publicCodes={siteData?.publicDiscountCodes}
        />
        <Header settings={settings} onSearch={setSearchQuery} />
        <main>
          <Hero settings={settings} />
          <Marquee
            items={[
              "Sourdough Bagels",
              "Chocolate Chip Cookies",
              "Gluten-Free Bakes",
              "English Muffins",
              "Buy 6 Get 1 Free",
              "Organic Ingredients",
              "Local Delivery",
            ]}
          />
          <CategoryShowcase categories={categories} />
          <ShopSection initialSearch={searchQuery} />
          <SpecialOffers />
          <WhyDinos />
          <OurStory settings={settings} />
          <VideoSection
            videoUrl={siteData?.settings?.homepageVideo?.url}
            posterUrl={siteData?.settings?.homepageVideo?.poster}
          />
          <PickupDelivery settings={settings} />
          <Reviews testimonials={siteData?.testimonials} />
          <Instagram settings={settings} />
          <FAQ faqs={siteData?.faqs} />
          <Contact settings={settings} />
        </main>
        <Footer settings={settings} />
        <CartDrawer />
      </SmoothScroll>
    </>
  );
}
