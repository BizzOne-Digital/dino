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

interface Review {
  _id: string;
  name: string;
  content: string;
  rating: number;
  isPublished: boolean;
  order: number;
}

const emptyForm = { name: "", content: "", rating: 5, isPublished: true, order: 0 };

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function fetchReviews() {
    setLoading(true);
    const res = await fetch("/api/admin/reviews");
    const data = await res.json();
    setReviews(data.reviews || []);
    setLoading(false);
  }

  useEffect(() => { fetchReviews(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Review added");
      setShowForm(false);
      setForm(emptyForm);
      fetchReviews();
    } else {
      toast.error("Failed to add review");
    }
  }

  async function togglePublished(id: string, isPublished: boolean) {
    await fetch("/api/admin/reviews", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isPublished }),
    });
    fetchReviews();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this review?")) return;
    await fetch("/api/admin/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    toast.success("Deleted");
    fetchReviews();
  }

  return (
    <div>
      <AdminPageHeader
        title="Reviews"
        description="Manage customer testimonials"
        action={
          <AdminButton onClick={() => setShowForm(!showForm)}>
            <Plus size={16} className="inline mr-1" /> {showForm ? "Cancel" : "Add Review"}
          </AdminButton>
        }
      />

      {showForm && (
        <AdminCard className="mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Customer Name</label>
                <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className={labelClass}>Rating (1-5)</label>
                <input type="number" className={inputClass} value={form.rating} onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) || 5 })} min={1} max={5} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Review</label>
                <textarea className={inputClass} rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /> Published
              </label>
            </div>
            <AdminButton type="submit">Add Review</AdminButton>
          </form>
        </AdminCard>
      )}

      <AdminCard>
        {loading ? (
          <LoadingState />
        ) : reviews.length === 0 ? (
          <EmptyState message="No reviews yet" />
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="p-4 border border-gray-100 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-forest">{review.name}</p>
                    <p className="text-yellow-500 text-sm">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1 text-xs text-gray-500">
                      <input type="checkbox" checked={review.isPublished} onChange={(e) => togglePublished(review._id, e.target.checked)} />
                      Published
                    </label>
                    <button onClick={() => handleDelete(review._id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{review.content}</p>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
