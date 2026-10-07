import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { assertStripeConfigured } from "@/lib/stripe";
import { sendOrderConfirmationEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Called from the success page after Stripe redirect.
 * Confirms payment if the webhook has not run yet (common on serverless).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("order");
  const sessionId = searchParams.get("session_id");

  if (!orderNumber) {
    return NextResponse.json({ error: "Missing order number" }, { status: 400 });
  }

  try {
    await connectDB();
    let order = await Order.findOne({ orderNumber }).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentMethod === "pay_on_pickup") {
      return NextResponse.json({
        order: { ...order, _id: order._id.toString() },
        paid: order.paymentStatus === "paid",
      });
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json({
        order: { ...order, _id: order._id.toString() },
        paid: true,
      });
    }

    if (!sessionId) {
      return NextResponse.json({
        order: { ...order, _id: order._id.toString() },
        paid: false,
        pending: true,
      });
    }

    const stripeClient = assertStripeConfigured();
    const session = await stripeClient.checkout.sessions.retrieve(sessionId);

    if (session.metadata?.orderNumber !== orderNumber) {
      return NextResponse.json({ error: "Payment session does not match this order" }, { status: 400 });
    }

    const paid =
      session.payment_status === "paid" ||
      session.status === "complete";

    if (paid) {
      const updated = await Order.findOneAndUpdate(
        { orderNumber, paymentStatus: { $ne: "paid" } },
        {
          $set: {
            paymentStatus: "paid",
            orderStatus: "confirmed",
            stripeSessionId: session.id,
            stripePaymentIntentId:
              typeof session.payment_intent === "string" ? session.payment_intent : undefined,
            webhookProcessed: true,
          },
        },
        { new: true }
      );

      if (updated) {
        await sendOrderConfirmationEmail(updated);
        order = updated.toObject();
      } else {
        order = (await Order.findOne({ orderNumber }).lean())!;
      }
    }

    return NextResponse.json({
      order: { ...order, _id: order._id.toString() },
      paid: paid || order.paymentStatus === "paid",
    });
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      console.error("Stripe complete error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    console.error("Checkout complete error:", error);
    return NextResponse.json({ error: "Could not confirm payment" }, { status: 500 });
  }
}
