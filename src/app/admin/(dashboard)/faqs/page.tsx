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

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isPublished: boolean;
}

const emptyForm = { question: "", answer: "", category: "general", order: 0, isPublished: true };

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function fetchFaqs() {
    setLoading(true);
    const res = await fetch("/api/admin/faqs");
    const data = await res.json();
    setFaqs(data.faqs || []);
    setLoading(false);
  }

  useEffect(() => { fetchFaqs(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("FAQ added");
      setShowForm(false);
      setForm(emptyForm);
      fetchFaqs();
    } else {
      toast.error("Failed to add FAQ");
    }
  }

  async function togglePublished(id: string, isPublished: boolean) {
    await fetch("/api/admin/faqs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isPublished }),
    });
    fetchFaqs();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this FAQ?")) return;
    await fetch("/api/admin/faqs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    toast.success("Deleted");
    fetchFaqs();
  }

  return (
    <div>
      <AdminPageHeader
        title="FAQs"
        description="Manage frequently asked questions"
        action={
          <AdminButton onClick={() => setShowForm(!showForm)}>
            <Plus size={16} className="inline mr-1" /> {showForm ? "Cancel" : "Add FAQ"}
          </AdminButton>
        }
      />

      {showForm && (
        <AdminCard className="mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className={labelClass}>Question</label>
              <input className={inputClass} value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required />
            </div>
            <div>
              <label className={labelClass}>Answer</label>
              <textarea className={inputClass} rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Category</label>
                <input className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Order</label>
                <input type="number" className={inputClass} value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /> Published
            </label>
            <AdminButton type="submit">Add FAQ</AdminButton>
          </form>
        </AdminCard>
      )}

      <AdminCard>
        {loading ? (
          <LoadingState />
        ) : faqs.length === 0 ? (
          <EmptyState message="No FAQs yet" />
        ) : (
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq._id} className="p-4 border border-gray-100 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-forest">{faq.question}</p>
                    <p className="text-sm text-gray-600 mt-1">{faq.answer}</p>
                    <span className="text-xs text-gray-400 mt-1 inline-block">{faq.category}</span>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <label className="flex items-center gap-1 text-xs text-gray-500">
                      <input type="checkbox" checked={faq.isPublished} onChange={(e) => togglePublished(faq._id, e.target.checked)} />
                      Published
                    </label>
                    <button onClick={() => handleDelete(faq._id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
