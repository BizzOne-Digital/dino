import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { requireAdmin, logAudit } from "@/lib/admin-auth";
import { sendOrderStatusEmail } from "@/lib/email";

const STATUS_MESSAGES: Record<string, string> = {
  confirmed: "Your order has been confirmed!",
  preparing: "We're preparing your order now.",
  ready_for_pickup: "Your order is ready for pickup!",
  out_for_delivery: "Your order is out for delivery!",
  completed: "Your order has been completed. Thank you!",
  cancelled: "Your order has been cancelled.",
  refunded: "Your order has been refunded.",
};

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  await connectDB();
  const order = await Order.findById(id).lean();
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order: { ...order, _id: order._id.toString() } });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  try {
    const { orderStatus, paymentStatus, internalNotes } = await request.json();
    await connectDB();
    const order = await Order.findByIdAndUpdate(
      id,
      {
        ...(orderStatus && { orderStatus }),
        ...(paymentStatus && { paymentStatus }),
        ...(internalNotes !== undefined && { internalNotes }),
      },
      { new: true }
    );
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (orderStatus && STATUS_MESSAGES[orderStatus]) {
      await sendOrderStatusEmail(order, STATUS_MESSAGES[orderStatus]);
    }

    await logAudit(session!.user.id, session!.user.email, "update", "order", id, `Status: ${orderStatus}`);
    return NextResponse.json({ order: { ...order.toObject(), _id: order._id.toString() } });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
