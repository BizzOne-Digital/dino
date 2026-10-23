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
  inputClass,
  labelClass,
} from "@/components/admin/admin-ui";
import { ProductNutritionFields } from "@/components/admin/ProductNutritionFields";
import {
  defaultProductNutrition,
  normalizeProductNutrition,
  type ProductNutrition,
} from "@/lib/product-nutrition";

interface NutritionProduct {
  _id: string;
  name: string;
  categoryName: string;
  isPublished: boolean;
  nutrition: ProductNutrition;
}

export default function AdminNutritionPage() {
  const [products, setProducts] = useState<NutritionProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<ProductNutrition>(defaultProductNutrition);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/nutrition");
    const data = await res.json();
    setProducts((data.products || []) as NutritionProduct[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (selectedId || products.length === 0) return;
    setSelectedId(products[0]._id);
  }, [products, selectedId]);

  useEffect(() => {
    const p = products.find((x) => x._id === selectedId);
    if (p) setDraft(normalizeProductNutrition(p.nutrition));
  }, [selectedId, products]);

  const filtered = products.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q)
    );
  });

  async function handleSave() {
    if (!selectedId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${selectedId}/nutrition`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Nutrition saved");
      await fetchProducts();
    } catch {
      toast.error("Could not save nutrition");
    } finally {
      setSaving(false);
    }
  }

  const selected = products.find((p) => p._id === selectedId);

  return (
    <div>
      <AdminPageHeader
        title="Nutrition"
        description="Add nutrition facts per product for the public nutrition page"
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
            <label className={labelClass}>Search products</label>
            <input
              className={`${inputClass} mb-4`}
              placeholder="Name or category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <ul className="max-h-[32rem] overflow-y-auto divide-y divide-gray-100 text-sm">
              {filtered.map((p) => (
                <li key={p._id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(p._id)}
                    className={`w-full text-left px-2 py-3 rounded-lg transition-colors ${
                      selectedId === p._id ? "bg-dino/10 text-forest font-medium" : "hover:bg-gray-50"
                    }`}
                  >
                    <span className="block">{p.name}</span>
                    <span className="text-xs text-gray-500">{p.categoryName}</span>
                    {p.nutrition?.showOnPage && (
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
                <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                  <div>
                    <h2 className="font-display text-xl font-bold text-forest">{selected.name}</h2>
                    <p className="text-sm text-gray-500">{selected.categoryName}</p>
                  </div>
                  <Link
                    href={`/admin/products/${selected._id}`}
                    className="text-sm text-dino hover:underline"
                  >
                    Edit full product
                  </Link>
                </div>
                <ProductNutritionFields value={draft} onChange={setDraft} />
                <div className="mt-6 flex justify-end">
                  <AdminButton type="button" onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <Loader2 size={16} className="animate-spin inline mr-1" />
                    ) : (
                      <Save size={16} className="inline mr-1" />
                    )}
                    Save nutrition
                  </AdminButton>
                </div>
              </>
            ) : (
              <p className="text-gray-500">Select a product to edit nutrition.</p>
            )}
          </AdminCard>
        </div>
      )}
    </div>
  );
}
