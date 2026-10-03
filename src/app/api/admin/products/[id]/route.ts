import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { ProductCategory } from "@/models/ProductCategory";
import { z } from "zod";
import { requireAdmin, logAudit } from "@/lib/admin-auth";
import { adminProductSchema } from "@/lib/admin-product-schema";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  await connectDB();
  const product = await Product.findById(id).populate("category").lean();
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product: { ...product, _id: product._id.toString() } });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  try {
    const data = adminProductSchema.parse(await request.json());
    await connectDB();
    const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await logAudit(session!.user.id, session!.user.email, "update", "product", id);
    return NextResponse.json({ product: { ...product.toObject(), _id: product._id.toString() } });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    console.error("Product update error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  try {
    const body = z
      .object({
        isPublished: z.boolean().optional(),
        inStock: z.boolean().optional(),
      })
      .parse(await request.json());

    await connectDB();
    const product = await Product.findByIdAndUpdate(id, { $set: body }, { new: true });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await logAudit(session!.user.id, session!.user.email, "update", "product", id, JSON.stringify(body));
    return NextResponse.json({ product: { ...product.toObject(), _id: product._id.toString() } });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  await connectDB();
  const product = await Product.findByIdAndDelete(id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await ProductCategory.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } });
  await logAudit(session!.user.id, session!.user.email, "delete", "product", id);
  return NextResponse.json({ success: true });
}
