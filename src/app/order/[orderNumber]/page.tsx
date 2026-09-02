"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Package, Clock, CheckCircle, Loader2 } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-800" },
  preparing: { label: "Preparing", color: "bg-purple-100 text-purple-800" },
  ready_for_pickup: { label: "Ready for Pickup", color: "bg-dino/20 text-forest" },
  out_for_delivery: { label: "Out for Delivery", color: "bg-caramel/20 text-caramel" },
  completed: { label: "Completed", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
  refunded: { label: "Refunded", color: "bg-gray-100 text-gray-800" },
};

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then((p) => {
      setOrderNumber(p.orderNumber);
      fetch(`/api/orders/${p.orderNumber}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.order) setOrder(d.order);
          else setError("Order not found");
        })
        .catch(() => setError("Failed to load order"))
        .finally(() => setLoading(false));
    });
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="animate-spin text-dino" size={32} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
        <Package size={48} className="text-charcoal/30 mb-4" />
        <h1 className="font-display text-2xl font-bold text-forest mb-2">Order Not Found</h1>
        <p className="text-charcoal/60 mb-6">{error || "We couldn't find this order."}</p>
        <Link href="/" className="text-dino hover:underline">Back to shop</Link>
      </div>
    );
  }

  const status = STATUS_LABELS[order.orderStatus as string] ?? STATUS_LABELS.pending;
  const items = order.items as Array<{ name: string; quantity: number; lineTotal: number; variantLabel?: string }>;
  const customer = order.customer as { name: string; email: string };

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-beige/50 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-4">
          <Link href="/">
            <Image src="/images/logo.jpg" alt="Dino's" width={40} height={40} className="rounded-full" />
          </Link>
          <h1 className="font-display text-xl font-bold text-forest">Order #{orderNumber}</h1>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-charcoal/50">Status</p>
            <span className={`inline-block mt-1 rounded-full px-3 py-1 text-sm font-semibold ${status.color}`}>
              {status.label}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm text-charcoal/50">Total</p>
            <p className="font-display text-2xl font-bold text-forest">
              {formatCurrency(order.total as number)}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-display font-bold text-forest mb-4 flex items-center gap-2">
            <Package size={18} /> Items
          </h2>
          <ul className="space-y-3">
            {items.map((item, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span>
                  {item.name}
                  {item.variantLabel ? ` (${item.variantLabel})` : ""} × {item.quantity}
                </span>
                <span className="font-semibold">{formatCurrency(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-display font-bold text-forest mb-2 flex items-center gap-2">
            <Clock size={18} /> Details
          </h2>
          <p className="text-sm"><strong>Customer:</strong> {customer.name}</p>
          <p className="text-sm"><strong>Email:</strong> {customer.email}</p>
          <p className="text-sm capitalize"><strong>Fulfillment:</strong> {order.fulfillment as string}</p>
          {order.preferredDate ? (
            <p className="text-sm"><strong>Preferred date:</strong> {order.preferredDate as string}</p>
          ) : null}
        </div>

        {order.orderStatus === "ready_for_pickup" && (
          <div className="rounded-2xl bg-dino/10 border border-dino/30 p-6 flex items-center gap-4">
            <CheckCircle className="text-dino shrink-0" size={32} />
            <div>
              <p className="font-semibold text-forest">Your order is ready!</p>
              <p className="text-sm text-charcoal/60">Head over to pick up your fresh bakes.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
