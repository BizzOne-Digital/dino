import { Product } from "@/models/Product";
import { ProductCategory } from "@/models/ProductCategory";
import { normalizeProductNutrition, type ProductNutrition } from "@/lib/product-nutrition";
import { HIDDEN_CATEGORY_SLUGS } from "@/lib/storefront-constants";

export interface NutritionPageEntry {
  categoryName: string;
  categorySlug: string;
  nutrition: ProductNutrition;
  source: "category" | "product-fallback";
}

function hasDisplayableNutrition(n: ProductNutrition): boolean {
  return (
    n.showOnPage &&
    Boolean(
      n.servingSize ||
        n.calories != null ||
        n.ingredients ||
        n.allergens ||
        n.fatG != null ||
        n.proteinG != null
    )
  );
}

/** One approximate nutrition block per category (cookies, bagels, bread, etc.). */
export async function loadNutritionPageEntries(): Promise<NutritionPageEntry[]> {
  const categories = await ProductCategory.find({
    isActive: true,
    slug: { $nin: [...HIDDEN_CATEGORY_SLUGS] },
  })
    .select("name slug order nutrition")
    .sort({ order: 1 })
    .lean();

  const products = await Product.find({
    isPublished: true,
    categorySlug: { $nin: [...HIDDEN_CATEGORY_SLUGS] },
  })
    .select("name categorySlug nutrition")
    .sort({ name: 1 })
    .lean();

  const entries: NutritionPageEntry[] = [];

  for (const cat of categories) {
    const categoryNutrition = normalizeProductNutrition(cat.nutrition);
    if (hasDisplayableNutrition(categoryNutrition)) {
      entries.push({
        categoryName: cat.name,
        categorySlug: cat.slug,
        nutrition: categoryNutrition,
        source: "category",
      });
      continue;
    }

    const fallbackProduct = products.find(
      (p) =>
        p.categorySlug === cat.slug &&
        hasDisplayableNutrition(normalizeProductNutrition(p.nutrition))
    );
    if (fallbackProduct) {
      entries.push({
        categoryName: cat.name,
        categorySlug: cat.slug,
        nutrition: normalizeProductNutrition(fallbackProduct.nutrition),
        source: "product-fallback",
      });
    }
  }

  return entries;
}
