import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ProductCategory } from "@/models/ProductCategory";
import { requireAdmin } from "@/lib/admin-auth";
import { normalizeProductNutrition } from "@/lib/product-nutrition";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const categories = await ProductCategory.find()
    .select("name slug order isActive productCount nutrition")
    .sort({ order: 1, name: 1 })
    .lean();

  return NextResponse.json({
    categories: categories.map((c) => ({
      _id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      order: c.order,
      isActive: c.isActive,
      productCount: c.productCount,
      nutrition: normalizeProductNutrition(c.nutrition),
    })),
  });
}
