"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  AdminButton,
  AdminCard,
  AdminPageHeader,
  EmptyState,
  inputClass,
  labelClass,
  LoadingState,
} from "@/components/admin/admin-ui";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  isActive: boolean;
  productCount: number;
}

const emptyForm = { name: "", description: "", order: 0, isActive: true };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function fetchCategories() {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data.categories || []);
    setLoading(false);
  }

  useEffect(() => { fetchCategories(); }, []);

  function startEdit(cat: Category) {
    setForm({ name: cat.name, description: cat.description, order: cat.order, isActive: cat.isActive });
    setEditingId(cat._id);
    setShowForm(true);
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const body = editingId ? { id: editingId, ...form } : form;
    const res = await fetch("/api/admin/categories", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast.success(editingId ? "Category updated" : "Category created");
      resetForm();
      fetchCategories();
    } else {
      toast.error("Failed to save category");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    const res = await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast.success("Category deleted");
      fetchCategories();
    } else {
      toast.error("Failed to delete");
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="Manage product categories"
        action={
          <AdminButton onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus size={16} className="inline mr-1" /> Add Category
          </AdminButton>
        }
      />

      {showForm && (
        <AdminCard className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Name</label>
                <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className={labelClass}>Order</label>
                <input type="number" className={inputClass} value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea className={inputClass} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Active
              </label>
            </div>
            <div className="flex gap-2">
              <AdminButton type="submit">{editingId ? "Update" : "Create"}</AdminButton>
              <AdminButton type="button" variant="secondary" onClick={resetForm}>Cancel</AdminButton>
            </div>
          </form>
        </AdminCard>
      )}

      <AdminCard>
        {loading ? (
          <LoadingState />
        ) : categories.length === 0 ? (
          <EmptyState message="No categories yet" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Slug</th>
                <th className="pb-3 font-medium">Products</th>
                <th className="pb-3 font-medium">Order</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 font-medium text-forest">{cat.name}</td>
                  <td className="py-3 text-gray-500">{cat.slug}</td>
                  <td className="py-3">{cat.productCount}</td>
                  <td className="py-3">{cat.order}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${cat.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button onClick={() => startEdit(cat)} className="text-dino hover:text-forest p-1"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(cat._id)} className="text-red-500 hover:text-red-700 p-1 ml-2"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AdminCard>
    </div>
  );
}
