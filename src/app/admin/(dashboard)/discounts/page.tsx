"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  AdminButton,
  AdminCard,
  AdminPageHeader,
  EmptyState,
  inputClass,
  labelClass,
  LoadingState,
  selectClass,
} from "@/components/admin/admin-ui";

interface DiscountCode {
  _id: string;
  code: string;
  type: "percentage" | "fixed" | "free_item";
  value: number;
  minimumOrder: number;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
  isPublic: boolean;
  expiryDate?: string;
}

export default function DiscountsPage() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{
    code: string;
    type: "percentage" | "fixed" | "free_item";
    value: number;
    minimumOrder: number;
    usageLimit: number;
    isActive: boolean;
    isPublic: boolean;
  }>({
    code: "",
    type: "percentage",
    value: 10,
    minimumOrder: 0,
    usageLimit: 0,
    isActive: true,
    isPublic: false,
  });

  async function fetchCodes() {
    setLoading(true);
    const res = await fetch("/api/admin/discounts");
    const data = await res.json();
    setCodes(data.codes || []);
    setLoading(false);
  }

  useEffect(() => { fetchCodes(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Discount code created");
      setShowForm(false);
      setForm({ code: "", type: "percentage", value: 10, minimumOrder: 0, usageLimit: 0, isActive: true, isPublic: false });
      fetchCodes();
    } else {
      toast.error("Failed to create code");
    }
  }

  async function toggleField(id: string, field: "isActive" | "isPublic", value: boolean) {
    const res = await fetch("/api/admin/discounts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [field]: value }),
    });
    if (res.ok) {
      toast.success("Updated");
      fetchCodes();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this discount code?")) return;
    const res = await fetch("/api/admin/discounts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast.success("Deleted");
      fetchCodes();
    }
  }

  function formatValue(code: DiscountCode) {
    if (code.type === "percentage") return `${code.value}%`;
    if (code.type === "fixed") return formatCurrency(code.value);
    return `${code.value} free item(s)`;
  }

  return (
    <div>
      <AdminPageHeader
        title="Discount Codes"
        description="Create and manage discount codes"
        action={
          <AdminButton onClick={() => setShowForm(!showForm)}>
            <Plus size={16} className="inline mr-1" /> {showForm ? "Cancel" : "New Code"}
          </AdminButton>
        }
      />

      {showForm && (
        <AdminCard className="mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Code (leave blank to auto-generate)</label>
                <input className={inputClass} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="Auto-generate" />
              </div>
              <div>
                <label className={labelClass}>Type</label>
                <select className={selectClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="free_item">Free Item</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Value {form.type === "fixed" ? "(cents)" : ""}</label>
                <input type="number" className={inputClass} value={form.value} onChange={(e) => setForm({ ...form, value: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <label className={labelClass}>Min Order (cents)</label>
                <input type="number" className={inputClass} value={form.minimumOrder} onChange={(e) => setForm({ ...form, minimumOrder: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <label className={labelClass}>Usage Limit (0 = unlimited)</label>
                <input type="number" className={inputClass} value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} /> Public
                </label>
              </div>
            </div>
            <AdminButton type="submit">Create Code</AdminButton>
          </form>
        </AdminCard>
      )}

      <AdminCard>
        {loading ? (
          <LoadingState />
        ) : codes.length === 0 ? (
          <EmptyState message="No discount codes yet" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="pb-3 font-medium">Code</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Value</th>
                <th className="pb-3 font-medium">Used</th>
                <th className="pb-3 font-medium">Active</th>
                <th className="pb-3 font-medium">Public</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((code) => (
                <tr key={code._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 font-mono font-medium text-forest">{code.code}</td>
                  <td className="py-3 capitalize">{code.type.replace(/_/g, " ")}</td>
                  <td className="py-3">{formatValue(code)}</td>
                  <td className="py-3">{code.usageCount}{code.usageLimit > 0 ? ` / ${code.usageLimit}` : ""}</td>
                  <td className="py-3">
                    <input type="checkbox" checked={code.isActive} onChange={(e) => toggleField(code._id, "isActive", e.target.checked)} />
                  </td>
                  <td className="py-3">
                    <input type="checkbox" checked={code.isPublic} onChange={(e) => toggleField(code._id, "isPublic", e.target.checked)} />
                  </td>
                  <td className="py-3 text-right">
                    <button onClick={() => handleDelete(code._id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button>
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
