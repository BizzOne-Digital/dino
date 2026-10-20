import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { ProductCategory } from "@/models/ProductCategory";
import { getEffectivePrice, isProductOnSale } from "@/lib/pricing-helpers";
import {
  COMBO_PRODUCT_SLUG,
  HIDDEN_CATEGORY_SLUGS,
  HIDDEN_PRODUCT_SLUGS,
} from "@/lib/storefront-constants";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const inStock = searchParams.get("inStock");
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const filter: Record<string, unknown> = {
      isPublished: true,
      slug: { $nin: [...HIDDEN_PRODUCT_SLUGS] },
      categorySlug: { $nin: [...HIDDEN_CATEGORY_SLUGS] },
    };
    if (category) {
      const catDoc = await ProductCategory.findOne({ slug: category }).select("_id").lean();
      if (catDoc) {
        filter.$or = [{ categorySlug: category }, { category: catDoc._id }];
      } else {
        filter.categorySlug = category;
      }
    }
    if (inStock === "true") filter.inStock = true;
    if (search) filter.$text = { $search: search };

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "popularity") sortOption = { popularity: -1 };

    let products = await Product.find(filter)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    let total = await Product.countDocuments(filter);

    if (category === "bagels") {
      const hasCombo = products.some((p) => p.slug === COMBO_PRODUCT_SLUG);
      if (!hasCombo) {
        const combo = await Product.findOne({
          slug: COMBO_PRODUCT_SLUG,
          isPublished: true,
        }).lean();
        if (combo) {
          products = [...products, combo];
          total += 1;
        }
      }
    }

    const serialized = products.map((p) => ({
      ...p,
      _id: p._id.toString(),
      category: p.category?.toString?.() ?? null,
      variants: (p.variants || []).map((v) => ({
        ...v,
        _id: v._id?.toString(),
      })),
      effectivePrice: getEffectivePrice(p as Parameters<typeof getEffectivePrice>[0]),
      onSale: isProductOnSale(p as Parameters<typeof isProductOnSale>[0]),
    }));

    return NextResponse.json({ products: serialized, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
