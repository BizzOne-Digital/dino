"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { AdminCard, AdminPageHeader, LoadingState, StatusBadge } from "@/components/admin/admin-ui";
import { ShoppingCart, DollarSign, Clock, Truck } from "lucide-react";

interface DashboardData {
  stats: {
    totalSales: number;
    ordersToday: number;
    ordersWeek: number;
    ordersMonth: number;
    pendingOrders: number;
    preparingOrders: number;
    pickupOrders: number;
    deliveryOrders: number;
  };
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    customer: { name: string };
    total: number;
    orderStatus: string;
    fulfillment: string;
    createdAt: string;
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <LoadingState />;

  const { stats, recentOrders } = data;
  const cards = [
    { label: "Total Sales", value: formatCurrency(stats.totalSales), icon: DollarSign, color: "text-forest" },
    { label: "Orders Today", value: stats.ordersToday, icon: ShoppingCart, color: "text-dino" },
    { label: "This Week", value: stats.ordersWeek, icon: Clock, color: "text-caramel" },
    { label: "Pending", value: stats.pendingOrders, icon: Clock, color: "text-yellow-600" },
    { label: "Preparing", value: stats.preparingOrders, icon: Clock, color: "text-orange-600" },
    { label: "Pickup Active", value: stats.pickupOrders, icon: Truck, color: "text-purple-600" },
    { label: "Delivery Active", value: stats.deliveryOrders, icon: Truck, color: "text-indigo-600" },
    { label: "This Month", value: stats.ordersMonth, icon: ShoppingCart, color: "text-forest" },
  ];

  return (
    <div>
      <AdminPageHeader title="Dashboard" description="Overview of your store performance" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <AdminCard key={label} className="!p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gray-50 ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-xl font-bold text-forest">{value}</p>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>

      <AdminCard title="Recent Orders">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="pb-3 font-medium">Order #</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3">
                    <Link href={`/admin/orders/${order._id}`} className="text-dino hover:underline font-medium">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3">{order.customer.name}</td>
                  <td className="py-3">{formatCurrency(order.total)}</td>
                  <td className="py-3"><StatusBadge status={order.orderStatus} /></td>
                  <td className="py-3 capitalize">{order.fulfillment}</td>
                  <td className="py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
