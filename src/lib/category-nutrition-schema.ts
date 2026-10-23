import { Schema } from "mongoose";
import type { ProductNutrition } from "@/lib/product-nutrition";

export type CategoryNutrition = ProductNutrition;

export const CategoryNutritionMongooseSchema = new Schema<CategoryNutrition>(
  {
    showOnPage: { type: Boolean, default: false },
    servingSize: { type: String, default: "" },
    calories: Number,
    fatG: Number,
    saturatedFatG: Number,
    carbohydratesG: Number,
    sugarsG: Number,
    proteinG: Number,
    fiberG: Number,
    sodiumMg: Number,
    ingredients: { type: String, default: "" },
    allergens: { type: String, default: "" },
  },
  { _id: false }
);
