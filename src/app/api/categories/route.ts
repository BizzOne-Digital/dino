import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ProductCategory } from "@/models/ProductCategory";
import { sanitizeStoredImageUrl } from "@/lib/product-image";

export async function GET() {
  try {
    await connectDB();
    const categories = await ProductCategory.find({ isActive: true }).sort({ order: 1 }).lean();
    return NextResponse.json({
      categories: categories.map((c) => ({
        ...c,
        _id: c._id.toString(),
        image: sanitizeStoredImageUrl(c.image),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
