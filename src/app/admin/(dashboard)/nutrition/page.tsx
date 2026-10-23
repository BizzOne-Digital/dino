"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ExternalLink, Loader2, Save } from "lucide-react";
import Link from "next/link";
import {
  AdminButton,
  AdminCard,
  AdminPageHeader,
  LoadingState,
} from "@/components/admin/admin-ui";
import { ProductNutritionFields } from "@/components/admin/ProductNutritionFields";
import {
  defaultProductNutrition,
  normalizeProductNutrition,
  type ProductNutrition,
} from "@/lib/product-nutrition";

interface NutritionCategory {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  productCount: number;
  nutrition: ProductNutrition;
}

export default function AdminNutritionPage() {
  const [categories, setCategories] = useState<NutritionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<ProductNutrition>(defaultProductNutrition);
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/nutrition");
    const data = await res.json();
    setCategories((data.categories || []) as NutritionCategory[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (selectedId || categories.length === 0) return;
    setSelectedId(categories[0]._id);
  }, [categories, selectedId]);

  useEffect(() => {
    const c = categories.find((x) => x._id === selectedId);
    if (c) setDraft(normalizeProductNutrition(c.nutrition));
  }, [selectedId, categories]);

  async function handleSave() {
    if (!selectedId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/categories/${selectedId}/nutrition`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Category nutrition saved");
      await fetchCategories();
    } catch {
      toast.error("Could not save nutrition");
    } finally {
      setSaving(false);
    }
  }

  const selected = categories.find((c) => c._id === selectedId);

  return (
    <div>
      <AdminPageHeader
        title="Nutrition"
        description="One approximate nutrition guide per category (all cookies, all bagels, etc.)"
        action={
          <Link href="/nutrition" target="_blank">
            <AdminButton variant="secondary">
              <ExternalLink size={16} className="inline mr-1" /> View public page
            </AdminButton>
          </Link>
        }
      />

      {loading ? (
        <LoadingState />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <AdminCard className="lg:col-span-1">
            <p className="text-sm text-gray-600 mb-4">
              Select a category. Customers see <strong>one block per category</strong> on the nutrition page.
            </p>
            <ul className="max-h-[32rem] overflow-y-auto divide-y divide-gray-100 text-sm">
              {categories.map((c) => (
                <li key={c._id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(c._id)}
                    className={`w-full text-left px-2 py-3 rounded-lg transition-colors ${
                      selectedId === c._id ? "bg-dino/10 text-forest font-medium" : "hover:bg-gray-50"
                    }`}
                  >
                    <span className="block">{c.name}</span>
                    <span className="text-xs text-gray-500">
                      {c.productCount} product{c.productCount === 1 ? "" : "s"}
                      {!c.isActive && " · Inactive"}
                    </span>
                    {c.nutrition?.showOnPage && (
                      <span className="mt-1 inline-block text-[10px] uppercase tracking-wide text-green-700">
                        On nutrition page
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </AdminCard>

          <AdminCard className="lg:col-span-2">
            {selected ? (
              <>
                <div className="mb-6">
                  <h2 className="font-display text-xl font-bold text-forest">{selected.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Use average or typical values for everything in this category (approximation is fine).
                  </p>
                </div>
                <ProductNutritionFields value={draft} onChange={setDraft} />
                <div className="mt-6 flex justify-end">
                  <AdminButton type="button" onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <Loader2 size={16} className="animate-spin inline mr-1" />
                    ) : (
                      <Save size={16} className="inline mr-1" />
                    )}
                    Save category nutrition
                  </AdminButton>
                </div>
              </>
            ) : (
              <p className="text-gray-500">Select a category to edit nutrition.</p>
            )}
          </AdminCard>
        </div>
      )}
    </div>
  );
}
