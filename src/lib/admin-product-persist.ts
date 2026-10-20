import type { z } from "zod";
import type { adminProductSchema } from "@/lib/admin-product-schema";
import { ProductCategory } from "@/models/ProductCategory";

type AdminProductInput = z.infer<typeof adminProductSchema>;

export async function resolveAdminProductPayload(
  data: AdminProductInput
): Promise<AdminProductInput | null> {
  const category = await ProductCategory.findById(data.category).select("slug").lean();
  if (!category?.slug) return null;

  const variants = data.variants ?? [];
  const inStock =
    variants.length > 0
      ? variants.some((v) => v.inStock)
      : data.isPublished
        ? true
        : data.inStock;

  const normalizedVariants =
    variants.length > 0 && data.isPublished
      ? variants.map((v) => ({ ...v, inStock: v.inStock !== false }))
      : variants;

  return {
    ...data,
    categorySlug: category.slug,
    inStock,
    variants: normalizedVariants,
  };
}
