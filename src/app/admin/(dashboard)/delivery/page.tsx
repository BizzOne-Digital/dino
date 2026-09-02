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
} from "@/components/admin/admin-ui";

interface DeliveryZone {
  _id: string;
  name: string;
  postalCodePrefixes: string[];
  fee: number;
  isActive: boolean;
}

const emptyForm = { name: "", postalCodePrefixes: "", fee: 500, isActive: true };

export default function DeliveryPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function fetchZones() {
    setLoading(true);
    const res = await fetch("/api/admin/delivery");
    const data = await res.json();
    setZones(data.zones || []);
    setLoading(false);
  }

  useEffect(() => { fetchZones(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/delivery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        postalCodePrefixes: form.postalCodePrefixes.split(",").map((p) => p.trim()).filter(Boolean),
        fee: form.fee,
        isActive: form.isActive,
      }),
    });
    if (res.ok) {
      toast.success("Delivery zone created");
      setShowForm(false);
      setForm(emptyForm);
      fetchZones();
    } else {
      toast.error("Failed to create zone");
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch("/api/admin/delivery", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive }),
    });
    fetchZones();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this delivery zone?")) return;
    await fetch("/api/admin/delivery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    toast.success("Deleted");
    fetchZones();
  }

  return (
    <div>
      <AdminPageHeader
        title="Delivery Zones"
        description="Manage delivery areas and fees"
        action={
          <AdminButton onClick={() => setShowForm(!showForm)}>
            <Plus size={16} className="inline mr-1" /> {showForm ? "Cancel" : "Add Zone"}
          </AdminButton>
        }
      />

      {showForm && (
        <AdminCard className="mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Zone Name</label>
                <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className={labelClass}>Delivery Fee (cents)</label>
                <input type="number" className={inputClass} value={form.fee} onChange={(e) => setForm({ ...form, fee: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Postal Code Prefixes (comma-separated)</label>
                <input className={inputClass} value={form.postalCodePrefixes} onChange={(e) => setForm({ ...form, postalCodePrefixes: e.target.value })} placeholder="L6A, L6B, L6C" required />
              </div>
            </div>
            <AdminButton type="submit">Create Zone</AdminButton>
          </form>
        </AdminCard>
      )}

      <AdminCard>
        {loading ? (
          <LoadingState />
        ) : zones.length === 0 ? (
          <EmptyState message="No delivery zones configured" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Postal Prefixes</th>
                <th className="pb-3 font-medium">Fee</th>
                <th className="pb-3 font-medium">Active</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zone) => (
                <tr key={zone._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 font-medium text-forest">{zone.name}</td>
                  <td className="py-3 text-gray-500">{zone.postalCodePrefixes.join(", ")}</td>
                  <td className="py-3">{formatCurrency(zone.fee)}</td>
                  <td className="py-3">
                    <input type="checkbox" checked={zone.isActive} onChange={(e) => toggleActive(zone._id, e.target.checked)} />
                  </td>
                  <td className="py-3 text-right">
                    <button onClick={() => handleDelete(zone._id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button>
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
