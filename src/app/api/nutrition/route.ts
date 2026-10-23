import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { loadNutritionPageEntries } from "@/lib/nutrition-page-data";

export async function GET() {
  try {
    await connectDB();
    const entries = await loadNutritionPageEntries();
    return NextResponse.json({
      entries: entries.map((e) => ({
        categoryName: e.categoryName,
        categorySlug: e.categorySlug,
        nutrition: e.nutrition,
      })),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Nutrition API error:", error);
    return NextResponse.json({ error: "Failed to load nutrition data" }, { status: 500 });
  }
}
