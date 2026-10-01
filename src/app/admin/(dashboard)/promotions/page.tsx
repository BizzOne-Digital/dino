"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import {
  AdminButton,
  AdminCard,
  AdminPageHeader,
  EmptyState,
  inputClass,
  labelClass,
  LoadingState,
} from "@/components/admin/admin-ui";

interface PromotionRule {
  _id: string;
  name: string;
  buyQuantity: number;
  freeQuantity: number;
  stackable: boolean;
  isActive: boolean;
  order: number;
}

const emptyForm = { name: "", buyQuantity: 3, freeQuantity: 1, stackable: false, isActive: true, order: 0 };

export default function PromotionsPage() {
  const [rules, setRules] = useState<PromotionRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function fetchRules() {
    setLoading(true);
    const res = await fetch("/api/admin/promotions");
    const data = await res.json();
    setRules(data.rules || []);
    setLoading(false);
  }

  useEffect(() => { fetchRules(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Promotion created");
      setShowForm(false);
      setForm(emptyForm);
      fetchRules();
    } else {
      toast.error("Failed to create promotion");
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch("/api/admin/promotions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive }),
    });
    fetchRules();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this promotion?")) return;
    await fetch("/api/admin/promotions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    toast.success("Deleted");
    fetchRules();
  }

  return (
    <div>
      <AdminPageHeader
        title="Promotions"
        description="Buy X get Y free promotion rules"
        action={
          <AdminButton onClick={() => setShowForm(!showForm)}>
            <Plus size={16} className="inline mr-1" /> {showForm ? "Cancel" : "New Promotion"}
          </AdminButton>
        }
      />

      {showForm && (
        <AdminCard className="mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className={labelClass}>Name</label>
                <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Buy 3 Get 1 Free" />
              </div>
              <div>
                <label className={labelClass}>Buy Quantity</label>
                <input type="number" className={inputClass} value={form.buyQuantity} onChange={(e) => setForm({ ...form, buyQuantity: parseInt(e.target.value) || 1 })} min={1} />
              </div>
              <div>
                <label className={labelClass}>Free Quantity</label>
                <input type="number" className={inputClass} value={form.freeQuantity} onChange={(e) => setForm({ ...form, freeQuantity: parseInt(e.target.value) || 1 })} min={1} />
              </div>
              <div>
                <label className={labelClass}>Order</label>
                <input type="number" className={inputClass} value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.stackable} onChange={(e) => setForm({ ...form, stackable: e.target.checked })} /> Stackable
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active
              </label>
            </div>
            <AdminButton type="submit">Create Promotion</AdminButton>
          </form>
        </AdminCard>
      )}

      <AdminCard>
        {loading ? (
          <LoadingState />
        ) : rules.length === 0 ? (
          <EmptyState message="No promotions yet" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Rule</th>
                <th className="pb-3 font-medium">Stackable</th>
                <th className="pb-3 font-medium">Active</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 font-medium text-forest">{rule.name}</td>
                  <td className="py-3">Buy {rule.buyQuantity}, get {rule.freeQuantity} free</td>
                  <td className="py-3">{rule.stackable ? "Yes" : "No"}</td>
                  <td className="py-3">
                    <input type="checkbox" checked={rule.isActive} onChange={(e) => toggleActive(rule._id, e.target.checked)} />
                  </td>
                  <td className="py-3 text-right">
                    <button onClick={() => handleDelete(rule._id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button>
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
