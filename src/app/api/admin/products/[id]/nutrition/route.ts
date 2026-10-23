import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { requireAdmin, logAudit } from "@/lib/admin-auth";
import { productNutritionSchema } from "@/lib/product-nutrition";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  try {
    const nutrition = productNutritionSchema.parse(await request.json());
    await connectDB();
    const product = await Product.findByIdAndUpdate(
      id,
      { $set: { nutrition } },
      { new: true, runValidators: true }
    );
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await logAudit(
      session!.user.id,
      session!.user.email,
      "update",
      "product_nutrition",
      id,
      product.name
    );

    return NextResponse.json({
      product: {
        _id: product._id.toString(),
        nutrition: product.nutrition,
      },
    });
  } catch (err) {
    console.error("Nutrition update error:", err);
    return NextResponse.json({ error: "Failed to update nutrition" }, { status: 400 });
  }
}
