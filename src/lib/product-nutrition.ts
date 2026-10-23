import { z } from "zod";

export const productNutritionSchema = z.object({
  showOnPage: z.boolean().default(false),
  servingSize: z.string().default(""),
  calories: z.number().min(0).optional(),
  fatG: z.number().min(0).optional(),
  saturatedFatG: z.number().min(0).optional(),
  carbohydratesG: z.number().min(0).optional(),
  sugarsG: z.number().min(0).optional(),
  proteinG: z.number().min(0).optional(),
  fiberG: z.number().min(0).optional(),
  sodiumMg: z.number().min(0).optional(),
  ingredients: z.string().default(""),
  allergens: z.string().default(""),
});

export type ProductNutrition = z.infer<typeof productNutritionSchema>;

export const defaultProductNutrition: ProductNutrition = {
  showOnPage: false,
  servingSize: "",
  ingredients: "",
  allergens: "",
};

export function normalizeProductNutrition(
  value?: Partial<ProductNutrition> | null
): ProductNutrition {
  if (!value) return { ...defaultProductNutrition };
  const parsed = productNutritionSchema.safeParse(value);
  return parsed.success ? parsed.data : { ...defaultProductNutrition };
}

export function formatNutrient(value?: number | null, unit = "g"): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return unit === "g" ? `${value} g` : `${value} ${unit}`;
}
