"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { OrderStatus } from "@/types";
import {
  AdminButton,
  AdminCard,
  AdminPageHeader,
  labelClass,
  LoadingState,
  selectClass,
  StatusBadge,
  inputClass,
} from "@/components/admin/admin-ui";

interface OrderDetail {
  _id: string;
  orderNumber: string;
  customer: { name: string; email: string; phone: string; notes?: string };
  items: Array<{ name: string; variantLabel?: string; quantity: number; unitPrice: number; lineTotal: number; isFree: boolean }>;
  fulfillment: string;
  deliveryAddress?: { street: string; city: string; province: string; postalCode: string };
  preferredDate?: string;
  preferredTimeWindow?: string;
  subtotal: number;
  discount: number;
  promotionSavings: number;
  tax: number;
  deliveryFee: number;
  total: number;
  discountCode?: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: OrderStatus;
  internalNotes?: string;
  createdAt: string;
}

const statuses: OrderStatus[] = [
  "pending", "confirmed", "preparing", "ready_for_pickup",
  "out_for_delivery", "completed", "cancelled", "refunded",
];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("pending");
  const [internalNotes, setInternalNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setOrder(d.order);
        setOrderStatus(d.order.orderStatus);
        setInternalNotes(d.order.internalNotes || "");
      });
  }, [id]);

  async function handleUpdate() {
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus, internalNotes }),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setOrder(data.order);
      toast.success("Order updated");
    } else {
      toast.error("Failed to update order");
    }
  }

  if (!order) return <LoadingState />;

  return (
    <div>
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-forest mb-4">
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <AdminPageHeader
        title={`Order ${order.orderNumber}`}
        description={`Placed ${new Date(order.createdAt).toLocaleString()}`}
        action={<StatusBadge status={order.orderStatus} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AdminCard title="Items">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="pb-2 font-medium">Item</th>
                  <th className="pb-2 font-medium">Qty</th>
                  <th className="pb-2 font-medium">Price</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2">
                      {item.name}
                      {item.variantLabel && <span className="text-gray-400 text-xs ml-1">({item.variantLabel})</span>}
                      {item.isFree && <span className="ml-2 text-xs bg-dino text-white px-1.5 py-0.5 rounded">FREE</span>}
                    </td>
                    <td className="py-2">{item.quantity}</td>
                    <td className="py-2">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-2 text-right">{formatCurrency(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div>}
              {order.promotionSavings > 0 && <div className="flex justify-between text-green-600"><span>Promotions</span><span>-{formatCurrency(order.promotionSavings)}</span></div>}
              <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(order.tax)}</span></div>
              {order.deliveryFee > 0 && <div className="flex justify-between"><span>Delivery</span><span>{formatCurrency(order.deliveryFee)}</span></div>}
              <div className="flex justify-between font-bold text-forest text-base pt-2"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
            </div>
          </AdminCard>

          <AdminCard title="Update Status">
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Order Status</label>
                <select className={selectClass} value={orderStatus} onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}>
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Internal Notes</label>
                <textarea className={inputClass} rows={3} value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} />
              </div>
              <AdminButton onClick={handleUpdate} disabled={saving}>
                {saving ? "Saving..." : "Update Order"}
              </AdminButton>
            </div>
          </AdminCard>
        </div>

        <div className="space-y-6">
          <AdminCard title="Customer">
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Name:</span> {order.customer.name}</p>
              <p><span className="text-gray-500">Email:</span> {order.customer.email}</p>
              <p><span className="text-gray-500">Phone:</span> {order.customer.phone}</p>
              {order.customer.notes && <p><span className="text-gray-500">Notes:</span> {order.customer.notes}</p>}
            </div>
          </AdminCard>

          <AdminCard title="Fulfillment">
            <div className="space-y-2 text-sm capitalize">
              <p><span className="text-gray-500">Method:</span> {order.fulfillment}</p>
              {order.preferredDate && <p><span className="text-gray-500">Date:</span> {order.preferredDate}</p>}
              {order.preferredTimeWindow && <p><span className="text-gray-500">Time:</span> {order.preferredTimeWindow}</p>}
              {order.deliveryAddress && (
                <p className="text-gray-600">
                  {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.province} {order.deliveryAddress.postalCode}
                </p>
              )}
            </div>
          </AdminCard>

          <AdminCard title="Payment">
            <div className="space-y-2 text-sm capitalize">
              <p><span className="text-gray-500">Method:</span> {order.paymentMethod.replace(/_/g, " ")}</p>
              <p><span className="text-gray-500">Status:</span> {order.paymentStatus}</p>
              {order.discountCode && <p><span className="text-gray-500">Code:</span> {order.discountCode}</p>}
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
