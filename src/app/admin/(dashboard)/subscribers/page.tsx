"use client";

import { useEffect, useState } from "react";
import {
  AdminCard,
  AdminPageHeader,
  EmptyState,
  LoadingState,
} from "@/components/admin/admin-ui";

interface Subscriber {
  _id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/subscribers")
      .then((r) => r.json())
      .then((d) => { setSubscribers(d.subscribers || []); setLoading(false); });
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Newsletter Subscribers"
        description={`${subscribers.length} subscriber${subscribers.length !== 1 ? "s" : ""}`}
      />

      <AdminCard>
        {loading ? (
          <LoadingState />
        ) : subscribers.length === 0 ? (
          <EmptyState message="No subscribers yet" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={sub._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 font-medium text-forest">{sub.email}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${sub.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                      {sub.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">{new Date(sub.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AdminCard>
    </div>
  );
}
