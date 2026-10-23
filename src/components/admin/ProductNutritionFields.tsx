"use client";

import { inputClass, labelClass } from "./admin-ui";
import type { ProductNutrition } from "@/lib/product-nutrition";
import { defaultProductNutrition } from "@/lib/product-nutrition";

interface ProductNutritionFieldsProps {
  value: ProductNutrition;
  onChange: (nutrition: ProductNutrition) => void;
}

function numOrUndefined(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const n = parseFloat(trimmed);
  return Number.isFinite(n) ? n : undefined;
}

const NUTRIENT_KEYS = [
  "calories",
  "fatG",
  "saturatedFatG",
  "carbohydratesG",
  "sugarsG",
  "proteinG",
  "fiberG",
  "sodiumMg",
] as const;

export function ProductNutritionFields({ value, onChange }: ProductNutritionFieldsProps) {
  const n = value ?? defaultProductNutrition;

  function patch(partial: Partial<ProductNutrition>) {
    onChange({ ...n, ...partial });
  }

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm font-medium text-forest">
        <input
          type="checkbox"
          checked={n.showOnPage}
          onChange={(e) => patch({ showOnPage: e.target.checked })}
        />
        Show on public nutrition page
      </label>

      <div>
        <label className={labelClass}>Serving size</label>
        <input
          className={inputClass}
          placeholder="e.g. 1 bagel (105 g)"
          value={n.servingSize}
          onChange={(e) => patch({ servingSize: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          ["calories", "Calories"],
          ["fatG", "Fat (g)"],
          ["saturatedFatG", "Saturated fat (g)"],
          ["carbohydratesG", "Carbohydrates (g)"],
          ["sugarsG", "Sugars (g)"],
          ["proteinG", "Protein (g)"],
          ["fiberG", "Fiber (g)"],
          ["sodiumMg", "Sodium (mg)"],
        ].map(([key, label]) => {
          const field = key as (typeof NUTRIENT_KEYS)[number];
          const raw = n[field];
          return (
          <div key={key}>
            <label className={labelClass}>{label}</label>
            <input
              type="number"
              min={0}
              step="any"
              className={inputClass}
              value={typeof raw === "number" ? raw : ""}
              onChange={(e) => patch({ [field]: numOrUndefined(e.target.value) })}
            />
          </div>
          );
        })}
      </div>

      <div>
        <label className={labelClass}>Ingredients</label>
        <textarea
          className={inputClass}
          rows={3}
          value={n.ingredients}
          onChange={(e) => patch({ ingredients: e.target.value })}
          placeholder="List ingredients…"
        />
      </div>
      <div>
        <label className={labelClass}>Allergens</label>
        <textarea
          className={inputClass}
          rows={2}
          value={n.allergens}
          onChange={(e) => patch({ allergens: e.target.value })}
          placeholder="e.g. Contains wheat, eggs, milk"
        />
      </div>
    </div>
  );
}
