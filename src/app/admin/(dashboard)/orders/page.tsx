"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { OrderStatus } from "@/types";
import { AdminCard, AdminPageHeader, EmptyState, inputClass, LoadingState, selectClass, StatusBadge } from "@/components/admin/admin-ui";

interface Order {
  _id: string;
  orderNumber: string;
  customer: { name: string; email: string };
  total: number;
  orderStatus: OrderStatus;
  paymentStatus: string;
  fulfillment: string;
  createdAt: string;
}

const statuses: OrderStatus[] = [
  "pending", "confirmed", "preparing", "ready_for_pickup",
  "out_for_delivery", "completed", "cancelled", "refunded",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/orders?${params}`);
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  }, [search, status]);

  useEffect(() => {
    const timer = setTimeout(fetchOrders, 300);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  return (
    <div>
      <AdminPageHeader title="Orders" description="View and manage customer orders" />

      <AdminCard className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className={`${inputClass} pl-9`}
              placeholder="Search by order #, name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className={`${selectClass} sm:w-48`} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
      </AdminCard>

      <AdminCard>
        {loading ? (
          <LoadingState />
        ) : orders.length === 0 ? (
          <EmptyState message="No orders found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="pb-3 font-medium">Order #</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Payment</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3">
                      <Link href={`/admin/orders/${order._id}`} className="text-dino hover:underline font-medium">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3">
                      <div>{order.customer.name}</div>
                      <div className="text-xs text-gray-400">{order.customer.email}</div>
                    </td>
                    <td className="py-3">{formatCurrency(order.total)}</td>
                    <td className="py-3"><StatusBadge status={order.orderStatus} /></td>
                    <td className="py-3 capitalize">{order.paymentStatus}</td>
                    <td className="py-3 capitalize">{order.fulfillment}</td>
                    <td className="py-3 text-gray-500">{new Date(order.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
