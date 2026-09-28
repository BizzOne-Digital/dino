"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  AdminButton,
  AdminCard,
  AdminPageHeader,
  EmptyState,
  LoadingState,
} from "@/components/admin/admin-ui";

interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  async function fetchInquiries() {
    setLoading(true);
    const params = filter === "unread" ? "?unread=true" : "";
    const res = await fetch(`/api/admin/inquiries${params}`);
    const data = await res.json();
    setInquiries(data.inquiries || []);
    setLoading(false);
  }

  useEffect(() => { fetchInquiries(); }, [filter]);

  async function markRead(id: string) {
    await fetch("/api/admin/inquiries", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isRead: true }),
    });
    fetchInquiries();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this inquiry?")) return;
    await fetch("/api/admin/inquiries", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    toast.success("Deleted");
    fetchInquiries();
  }

  return (
    <div>
      <AdminPageHeader title="Inquiries" description="Contact form submissions" />

      <div className="flex gap-2 mb-6">
        <AdminButton variant={filter === "all" ? "primary" : "secondary"} onClick={() => setFilter("all")}>All</AdminButton>
        <AdminButton variant={filter === "unread" ? "primary" : "secondary"} onClick={() => setFilter("unread")}>Unread</AdminButton>
      </div>

      <AdminCard>
        {loading ? (
          <LoadingState />
        ) : inquiries.length === 0 ? (
          <EmptyState message="No inquiries" />
        ) : (
          <div className="space-y-4">
            {inquiries.map((inq) => (
              <div key={inq._id} className={`p-4 border rounded-lg ${inq.isRead ? "border-gray-100" : "border-dino bg-green-50/30"}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-forest">{inq.name}</p>
                      {!inq.isRead && <span className="text-xs bg-dino text-white px-2 py-0.5 rounded-full">New</span>}
                    </div>
                    <p className="text-sm text-gray-500">{inq.email} {inq.phone && `· ${inq.phone}`}</p>
                    <p className="text-sm font-medium mt-2">{inq.subject}</p>
                    <p className="text-sm text-gray-600 mt-1">{inq.message}</p>
                    <div className="flex gap-2 mt-2 text-xs text-gray-400">
                      <span className="capitalize">{inq.type.replace(/_/g, " ")}</span>
                      <span>·</span>
                      <span>{new Date(inq.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!inq.isRead && (
                      <AdminButton variant="secondary" onClick={() => markRead(inq._id)}>Mark Read</AdminButton>
                    )}
                    <button onClick={() => handleDelete(inq._id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={16} /></button>
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
