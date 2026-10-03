import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { ProductCategory } from "@/models/ProductCategory";
import { requireAdmin, logAudit } from "@/lib/admin-auth";
import { slugify } from "@/lib/utils";
import { adminProductSchema } from "@/lib/admin-product-schema";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search");

  const filter: Record<string, unknown> = {};
  if (search) filter.name = { $regex: search, $options: "i" };

  const [products, total] = await Promise.all([
    Product.find(filter).populate("category").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  return NextResponse.json({
    products: products.map((p) => ({ ...p, _id: p._id.toString() })),
    total,
    pages: Math.ceil(total / limit),
  });
}

export async function POST(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const data = adminProductSchema.parse(await request.json());
    await connectDB();

    const slug = slugify(data.name);
    const existing = await Product.findOne({ slug });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const product = await Product.create({ ...data, slug: finalSlug });
    await ProductCategory.findByIdAndUpdate(data.category, { $inc: { productCount: 1 } });

    await logAudit(session!.user.id, session!.user.email, "create", "product", product._id.toString());

    return NextResponse.json({ product: { ...product.toObject(), _id: product._id.toString() } });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    console.error("Product create error:", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
