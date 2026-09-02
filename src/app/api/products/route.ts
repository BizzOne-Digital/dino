import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { ProductCategory } from "@/models/ProductCategory";
import { getEffectivePrice, isProductOnSale } from "@/lib/pricing-helpers";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const glutenFree = searchParams.get("glutenFree");
    const inStock = searchParams.get("inStock");
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const filter: Record<string, unknown> = { isPublished: true };
    if (category) filter.categorySlug = category;
    if (glutenFree === "true") filter.isGlutenFree = true;
    if (inStock === "true") filter.inStock = true;
    if (search) filter.$text = { $search: search };

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "popularity") sortOption = { popularity: -1 };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const serialized = products.map((p) => ({
      ...p,
      _id: p._id.toString(),
      category: p.category
        ? { ...p.category, _id: (p.category as { _id: { toString: () => string } })._id?.toString?.() }
        : null,
      effectivePrice: getEffectivePrice(p as Parameters<typeof getEffectivePrice>[0]),
      onSale: isProductOnSale(p as Parameters<typeof isProductOnSale>[0]),
    }));

    return NextResponse.json({ products: serialized, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
