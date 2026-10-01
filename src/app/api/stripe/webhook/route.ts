import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { stripe } from "@/lib/stripe";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const body = await request.text();
  const sig = (await headers()).get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderNumber = session.metadata?.orderNumber;

    if (orderNumber) {
      await connectDB();
      const order = await Order.findOne({ orderNumber, webhookProcessed: false });
      if (order) {
        order.paymentStatus = "paid";
        order.orderStatus = "confirmed";
        order.stripePaymentIntentId = session.payment_intent as string;
        order.webhookProcessed = true;
        await order.save();
        await sendOrderConfirmationEmail(order);
      }
    }
  }

  return NextResponse.json({ received: true });
}
