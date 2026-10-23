import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { ProductCategory } from "@/models/ProductCategory";
import { normalizeProductNutrition } from "@/lib/product-nutrition";
import { HIDDEN_CATEGORY_SLUGS } from "@/lib/storefront-constants";
import { NutritionFactCard } from "@/components/nutrition/NutritionFactCard";
import { getSiteSettings } from "@/models/SiteSettings";

export const metadata = {
  title: "Nutrition Information | Dino's Cookies & Bagels",
  description: "Nutrition facts for our cookies, bagels, and baked goods.",
};

export default async function NutritionPage() {
  let groups: {
    name: string;
    slug: string;
    products: { name: string; nutrition: ReturnType<typeof normalizeProductNutrition> }[];
  }[] = [];
  let disclaimer = "";

  try {
    await connectDB();
    const settings = await getSiteSettings();
    disclaimer = settings.allergyDisclaimer || "";

    const products = await Product.find({
      isPublished: true,
      "nutrition.showOnPage": true,
      categorySlug: { $nin: [...HIDDEN_CATEGORY_SLUGS] },
    })
      .select("name categorySlug nutrition")
      .sort({ categorySlug: 1, name: 1 })
      .lean();

    const categories = await ProductCategory.find({ isActive: true })
      .select("name slug order")
      .sort({ order: 1 })
      .lean();

    const items = products.map((p) => ({
      name: p.name,
      categorySlug: p.categorySlug,
      nutrition: normalizeProductNutrition(p.nutrition),
    }));

    groups = categories
      .map((cat) => ({
        name: cat.name,
        slug: cat.slug,
        products: items.filter((p) => p.categorySlug === cat.slug),
      }))
      .filter((g) => g.products.length > 0);

    const known = new Set(categories.map((c) => c.slug));
    const other = items.filter((p) => !known.has(p.categorySlug));
    if (other.length > 0) {
      groups.push({ name: "Other", slug: "other", products: other });
    }
  } catch {
    groups = [];
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
            <p className="text-sm text-charcoal/60">Cookies, bagels &amp; baked goods</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-charcoal/70 leading-relaxed max-w-3xl">
          Per-serving nutrition facts for our menu items. Values are provided as a guide; baked goods may vary
          slightly batch to batch.
        </p>

        {disclaimer && (
          <p className="mt-4 rounded-xl bg-caramel/10 px-4 py-3 text-sm text-charcoal/80">{disclaimer}</p>
        )}

        {groups.length === 0 ? (
          <div className="mt-12 rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-charcoal/60">Nutrition information is being updated. Please check back soon.</p>
            <Link href="/#shop" className="mt-6 inline-block text-dino hover:underline">
              ← Browse the shop
            </Link>
          </div>
        ) : (
          <div className="mt-10 space-y-12">
            {groups.map((group) => (
              <section key={group.slug}>
                <h2 className="font-display text-2xl font-bold text-forest border-b border-beige pb-2 mb-6">
                  {group.name}
                </h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {group.products.map((product) => (
                    <NutritionFactCard
                      key={`${group.slug}-${product.name}`}
                      productName={product.name}
                      nutrition={product.nutrition}
                    />
                  ))}
                </div>
              </section>
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
