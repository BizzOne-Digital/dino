import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ProductCategory } from "@/models/ProductCategory";
import { requireAdmin, logAudit } from "@/lib/admin-auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  const categories = await ProductCategory.find().sort({ order: 1 }).lean();
  return NextResponse.json({
    categories: categories.map((c) => ({ ...c, _id: c._id.toString() })),
  });
}

export async function POST(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const data = await request.json();
    await connectDB();
    const slug = slugify(data.name);
    const category = await ProductCategory.create({ ...data, slug });
    await logAudit(session!.user.id, session!.user.email, "create", "category", category._id.toString());
    return NextResponse.json({ category: { ...category.toObject(), _id: category._id.toString() } });
  } catch {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const { id, ...data } = await request.json();
    await connectDB();
    if (data.name) data.slug = slugify(data.name);
    const category = await ProductCategory.findByIdAndUpdate(id, data, { new: true });
    if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await logAudit(session!.user.id, session!.user.email, "update", "category", id);
    return NextResponse.json({ category: { ...category.toObject(), _id: category._id.toString() } });
  } catch {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await request.json();
  await connectDB();
  await ProductCategory.findByIdAndDelete(id);
  await logAudit(session!.user.id, session!.user.email, "delete", "category", id);
  return NextResponse.json({ success: true });
}
