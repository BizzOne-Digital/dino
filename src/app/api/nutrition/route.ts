import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { ProductCategory } from "@/models/ProductCategory";
import { normalizeProductNutrition } from "@/lib/product-nutrition";
import { HIDDEN_CATEGORY_SLUGS } from "@/lib/storefront-constants";

export async function GET() {
  try {
    await connectDB();

    const products = await Product.find({
      isPublished: true,
      "nutrition.showOnPage": true,
      categorySlug: { $nin: [...HIDDEN_CATEGORY_SLUGS] },
    })
      .select("name slug categorySlug nutrition")
      .sort({ categorySlug: 1, name: 1 })
      .lean();

    const categories = await ProductCategory.find({ isActive: true })
      .select("name slug order")
      .sort({ order: 1 })
      .lean();

    const categoryMeta = categories.map((c) => ({
      name: c.name,
      slug: c.slug,
      order: c.order,
    }));

    const items = products.map((p) => ({
      _id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      categorySlug: p.categorySlug,
      nutrition: normalizeProductNutrition(p.nutrition),
    }));

    const grouped = categoryMeta
      .map((cat) => ({
        ...cat,
        products: items.filter((p) => p.categorySlug === cat.slug),
      }))
      .filter((g) => g.products.length > 0);

    const uncategorized = items.filter(
      (p) => !categoryMeta.some((c) => c.slug === p.categorySlug)
    );
    if (uncategorized.length > 0) {
      grouped.push({
        name: "Other",
        slug: "other",
        order: 999,
        products: uncategorized,
      });
    }

    return NextResponse.json({ groups: grouped, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Nutrition API error:", error);
    return NextResponse.json({ error: "Failed to load nutrition data" }, { status: 500 });
  }
}
