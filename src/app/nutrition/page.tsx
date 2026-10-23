import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/lib/db";
import { NutritionFactCard } from "@/components/nutrition/NutritionFactCard";
import { getSiteSettings } from "@/models/SiteSettings";
import { loadNutritionPageEntries } from "@/lib/nutrition-page-data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Nutrition Information | Dino's Cookies & Bagels",
  description: "Approximate nutrition facts for our cookies, bagels, and baked goods.",
};

export default async function NutritionPage() {
  let entries: Awaited<ReturnType<typeof loadNutritionPageEntries>> = [];
  let disclaimer = "";

  try {
    await connectDB();
    const settings = await getSiteSettings();
    disclaimer = settings.allergyDisclaimer || "";
    entries = await loadNutritionPageEntries();
  } catch {
    entries = [];
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-beige/50 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-4">
          <Link href="/">
            <Image src="/images/logo.jpg" alt="Dino's" width={40} height={40} className="rounded-full" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-forest">Nutrition Information</h1>
            <p className="text-sm text-charcoal/60">Approximate values by category</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-charcoal/70 leading-relaxed max-w-3xl">
          We show <strong>one approximate nutrition guide per category</strong> (for example, all cookies
          together, all bagels together). Individual flavours may vary slightly. Values are a guide only.
        </p>

        {disclaimer && (
          <p className="mt-4 rounded-xl bg-caramel/10 px-4 py-3 text-sm text-charcoal/80">{disclaimer}</p>
        )}

        {entries.length === 0 ? (
          <div className="mt-12 rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-charcoal/60">Nutrition information is being updated. Please check back soon.</p>
            <Link href="/#shop" className="mt-6 inline-block text-dino hover:underline">
              ← Browse the shop
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {entries.map((entry) => (
              <NutritionFactCard
                key={entry.categorySlug}
                productName={entry.categoryName}
                nutrition={entry.nutrition}
                subtitle="Approximate values for all items in this category"
              />
            ))}
          </div>
        )}

        <p className="mt-12 text-center">
          <Link href="/" className="text-dino font-medium hover:underline">← Back to home</Link>
        </p>
      </main>
    </div>
  );
}
