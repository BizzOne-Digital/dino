import { formatNutrient, type ProductNutrition } from "@/lib/product-nutrition";

interface NutritionFactCardProps {
  productName: string;
  nutrition: ProductNutrition;
  subtitle?: string;
}

export function NutritionFactCard({ productName, nutrition, subtitle }: NutritionFactCardProps) {
  const rows = [
    ["Calories", nutrition.calories != null ? `${nutrition.calories} kcal` : "—"],
    ["Fat", formatNutrient(nutrition.fatG)],
    ["Saturated fat", formatNutrient(nutrition.saturatedFatG)],
    ["Carbohydrates", formatNutrient(nutrition.carbohydratesG)],
    ["Sugars", formatNutrient(nutrition.sugarsG)],
    ["Protein", formatNutrient(nutrition.proteinG)],
    ["Fiber", formatNutrient(nutrition.fiberG)],
    ["Sodium", formatNutrient(nutrition.sodiumMg, "mg")],
  ];

  return (
    <article className="rounded-2xl border border-beige/80 bg-white p-5 shadow-sm">
      <h3 className="font-display text-lg font-bold text-forest">{productName}</h3>
      {subtitle && <p className="mt-1 text-sm text-charcoal/55 italic">{subtitle}</p>}
      {nutrition.servingSize && (
        <p className="mt-1 text-sm text-charcoal/60">
          Serving size: <span className="text-charcoal/80">{nutrition.servingSize}</span>
        </p>
      )}

      <div className="mt-4 overflow-hidden rounded-xl border-2 border-forest">
        <div className="bg-forest px-3 py-2 text-sm font-bold text-cream">Nutrition Facts</div>
        <table className="w-full text-sm">
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label} className="border-t border-beige/60">
                <td className="px-3 py-2 text-charcoal/80">{label}</td>
                <td className="px-3 py-2 text-right font-medium text-forest">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {nutrition.ingredients && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">Ingredients</p>
          <p className="mt-1 text-sm text-charcoal/75 leading-relaxed">{nutrition.ingredients}</p>
        </div>
      )}
      {nutrition.allergens && (
        <div className="mt-3 rounded-lg bg-caramel/10 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-caramel">Allergens</p>
          <p className="mt-1 text-sm text-charcoal/80">{nutrition.allergens}</p>
        </div>
      )}
    </article>
  );
}
