import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ProductCategory } from "@/models/ProductCategory";
import { requireAdmin, logAudit } from "@/lib/admin-auth";
import { productNutritionSchema } from "@/lib/product-nutrition";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  try {
    const nutrition = productNutritionSchema.parse(await request.json());
    await connectDB();
    const category = await ProductCategory.findByIdAndUpdate(
      id,
      { $set: { nutrition } },
      { new: true, runValidators: true }
    );
    if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await logAudit(
      session!.user.id,
      session!.user.email,
      "update",
      "category_nutrition",
      id,
      category.name
    );

    return NextResponse.json({
      category: {
        _id: category._id.toString(),
        nutrition: category.nutrition,
      },
    });
  } catch (err) {
    console.error("Category nutrition update error:", err);
    return NextResponse.json({ error: "Failed to update nutrition" }, { status: 400 });
  }
}
