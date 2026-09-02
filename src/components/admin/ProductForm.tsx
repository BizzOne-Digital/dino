"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { AdminButton, inputClass, labelClass, selectClass } from "./admin-ui";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Variant {
  name: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  inStock: boolean;
}

interface Media {
  url: string;
  publicId: string;
  type: "image" | "video";
  alt?: string;
  order: number;
}

export interface ProductFormData {
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  categorySlug: string;
  media: Media[];
  variants: Variant[];
  isGlutenFree: boolean;
  isFeatured: boolean;
  isRequestOnly: boolean;
  inStock: boolean;
  stock: number;
  salePrice?: number;
  saleStart?: string;
  saleEnd?: string;
  isOnSale: boolean;
  isPublished: boolean;
  seoTitle?: string;
  seoDescription?: string;
  tags: string[];
}

const defaultData: ProductFormData = {
  name: "",
  description: "",
  shortDescription: "",
  price: 0,
  category: "",
  categorySlug: "",
  media: [],
  variants: [],
  isGlutenFree: false,
  isFeatured: false,
  isRequestOnly: false,
  inStock: true,
  stock: 0,
  isOnSale: false,
  isPublished: false,
  tags: [],
};

interface ProductFormProps {
  initial?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  submitLabel?: string;
}

export function ProductForm({ initial, onSubmit, submitLabel = "Save Product" }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>({ ...defaultData, ...initial });
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [tagsInput, setTagsInput] = useState((initial?.tags || []).join(", "));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    if (initial) {
      setForm({ ...defaultData, ...initial });
      setTagsInput((initial.tags || []).join(", "));
      if (initial.media?.[0]) setImageUrl(initial.media[0].url);
    }
  }, [initial]);

  function update<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleCategoryChange(catId: string) {
    const cat = categories.find((c) => c._id === catId);
    update("category", catId);
    if (cat) update("categorySlug", cat.slug);
  }

  function addImage() {
    if (!imageUrl.trim()) return;
    const publicId = imageUrl.split("/").pop()?.split(".")[0] || `img-${Date.now()}`;
    update("media", [{ url: imageUrl.trim(), publicId, type: "image", order: 0 }]);
    toast.success("Image added");
  }

  function addVariant() {
    update("variants", [...form.variants, { name: "", price: form.price, stock: 0, inStock: true }]);
  }

  function updateVariant(index: number, field: keyof Variant, value: string | number | boolean) {
    const variants = [...form.variants];
    variants[index] = { ...variants[index], [field]: value };
    update("variants", variants);
  }

  function removeVariant(index: number) {
    update("variants", form.variants.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.category) {
      toast.error("Please select a category");
      return;
    }
    setLoading(true);
    try {
      await onSubmit({ ...form, tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className={labelClass}>Product Name *</label>
          <input className={inputClass} value={form.name} onChange={(e) => update("name", e.target.value)} required />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Short Description</label>
          <input className={inputClass} value={form.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Description</label>
          <textarea className={inputClass} rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Price (cents) *</label>
          <input type="number" className={inputClass} value={form.price} onChange={(e) => update("price", parseInt(e.target.value) || 0)} required />
        </div>
        <div>
          <label className={labelClass}>Compare At Price (cents)</label>
          <input type="number" className={inputClass} value={form.compareAtPrice || ""} onChange={(e) => update("compareAtPrice", parseInt(e.target.value) || undefined)} />
        </div>
        <div>
          <label className={labelClass}>Category *</label>
          <select className={selectClass} value={form.category} onChange={(e) => handleCategoryChange(e.target.value)} required>
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Stock</label>
          <input type="number" className={inputClass} value={form.stock} onChange={(e) => update("stock", parseInt(e.target.value) || 0)} />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="font-semibold text-forest mb-4">Image</h3>
        <div className="flex gap-2">
          <input className={inputClass} placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          <AdminButton type="button" variant="secondary" onClick={addImage}>Add</AdminButton>
        </div>
        {form.media[0] && (
          <img src={form.media[0].url} alt="" className="mt-3 w-24 h-24 object-cover rounded-lg border" />
        )}
      </div>

      <div className="border-t border-gray-100 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-forest">Variants</h3>
          <AdminButton type="button" variant="secondary" onClick={addVariant}>
            <Plus size={16} className="inline mr-1" /> Add Variant
          </AdminButton>
        </div>
        {form.variants.map((v, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
            <input className={inputClass} placeholder="Name" value={v.name} onChange={(e) => updateVariant(i, "name", e.target.value)} />
            <input type="number" className={inputClass} placeholder="Price (cents)" value={v.price} onChange={(e) => updateVariant(i, "price", parseInt(e.target.value) || 0)} />
            <input type="number" className={inputClass} placeholder="Stock" value={v.stock} onChange={(e) => updateVariant(i, "stock", parseInt(e.target.value) || 0)} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={v.inStock} onChange={(e) => updateVariant(i, "inStock", e.target.checked)} />
              In Stock
            </label>
            <button type="button" onClick={() => removeVariant(i)} className="text-red-500 hover:text-red-700 justify-self-end">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="font-semibold text-forest mb-4">Sale Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isOnSale} onChange={(e) => update("isOnSale", e.target.checked)} />
            On Sale
          </label>
          <div>
            <label className={labelClass}>Sale Price (cents)</label>
            <input type="number" className={inputClass} value={form.salePrice || ""} onChange={(e) => update("salePrice", parseInt(e.target.value) || undefined)} />
          </div>
          <div>
            <label className={labelClass}>Sale Start</label>
            <input type="datetime-local" className={inputClass} value={form.saleStart?.slice(0, 16) || ""} onChange={(e) => update("saleStart", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Sale End</label>
            <input type="datetime-local" className={inputClass} value={form.saleEnd?.slice(0, 16) || ""} onChange={(e) => update("saleEnd", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="font-semibold text-forest mb-4">Options & SEO</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[
            ["isGlutenFree", "Gluten Free"],
            ["isFeatured", "Featured"],
            ["isRequestOnly", "Request Only"],
            ["inStock", "In Stock"],
            ["isPublished", "Published"],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form[key as keyof ProductFormData] as boolean}
                onChange={(e) => update(key as keyof ProductFormData, e.target.checked as never)}
              />
              {label}
            </label>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>SEO Title</label>
            <input className={inputClass} value={form.seoTitle || ""} onChange={(e) => update("seoTitle", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Tags (comma-separated)</label>
            <input className={inputClass} value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>SEO Description</label>
            <textarea className={inputClass} rows={2} value={form.seoDescription || ""} onChange={(e) => update("seoDescription", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <AdminButton type="submit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </AdminButton>
      </div>
    </form>
  );
}
