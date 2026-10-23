import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { requireAdmin } from "@/lib/admin-auth";
import { normalizeProductNutrition } from "@/lib/product-nutrition";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const products = await Product.find()
    .populate("category", "name slug")
    .select("name slug categorySlug category isPublished nutrition")
    .sort({ categorySlug: 1, name: 1 })
    .lean();

  return NextResponse.json({
    products: products.map((p) => ({
      _id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      categorySlug: p.categorySlug,
      categoryName:
        typeof p.category === "object" && p.category && "name" in p.category
          ? (p.category as { name: string }).name
          : "",
      isPublished: p.isPublished,
      nutrition: normalizeProductNutrition(p.nutrition),
    })),
  });
}
