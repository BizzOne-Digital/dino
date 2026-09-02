import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { PromotionRule } from "@/models/PromotionRule";
import { DiscountCode } from "@/models/DiscountCode";
import { DeliveryZone } from "@/models/DeliveryZone";
import { getSiteSettings } from "@/models/SiteSettings";
import { calculateOrderPricing } from "@/lib/pricing";
import { getEffectivePrice } from "@/lib/pricing-helpers";
import { generateOrderNumber } from "@/lib/utils";
import { stripe } from "@/lib/stripe";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      quantity: z.number().min(1).max(99),
    })
  ),
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    notes: z.string().optional(),
    marketingConsent: z.boolean().default(false),
  }),
  fulfillment: z.enum(["pickup", "delivery"]),
  deliveryAddress: z
    .object({
      street: z.string(),
      city: z.string(),
      province: z.string(),
      postalCode: z.string(),
    })
    .optional(),
  preferredDate: z.string().optional(),
  preferredTimeWindow: z.string().optional(),
  discountCode: z.string().optional(),
  paymentMethod: z.enum(["stripe", "pay_on_pickup"]),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const limit = rateLimit(`checkout:${ip}`, 5, 60_000);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const data = checkoutSchema.parse(body);

    await connectDB();
    const settings = await getSiteSettings();

    if (!settings.storeOpen) {
      return NextResponse.json({ error: "Store is currently closed" }, { status: 400 });
    }

    if (data.paymentMethod === "stripe" && !settings.stripeEnabled) {
      return NextResponse.json({ error: "Online payment is not available" }, { status: 400 });
    }
    if (data.paymentMethod === "pay_on_pickup" && !settings.payOnPickupEnabled) {
      return NextResponse.json({ error: "Pay on pickup is not available" }, { status: 400 });
    }

    const productIds = data.items.map((i) => i.productId);
    const [products, promotionRules] = await Promise.all([
      Product.find({ _id: { $in: productIds }, isPublished: true }),
      PromotionRule.find({ isActive: true }),
    ]);

    let discountCode = null;
    if (data.discountCode) {
      discountCode = await DiscountCode.findOne({
        code: data.discountCode.toUpperCase(),
        isActive: true,
      });
    }

    let deliveryFee = 0;
    if (data.fulfillment === "delivery") {
      if (!data.deliveryAddress) {
        return NextResponse.json({ error: "Delivery address required" }, { status: 400 });
      }
      const prefix = data.deliveryAddress.postalCode.replace(/\s/g, "").substring(0, 3).toUpperCase();
      const zone = await DeliveryZone.findOne({
        isActive: true,
        postalCodePrefixes: prefix,
      });
      if (!zone && (await DeliveryZone.countDocuments({ isActive: true })) > 0) {
        const fuzzyZone = await DeliveryZone.findOne({
          isActive: true,
          postalCodePrefixes: { $elemMatch: { $regex: new RegExp(`^${prefix}`, "i") } },
        });
        if (!fuzzyZone) {
          return NextResponse.json({ error: "Delivery not available for this postal code" }, { status: 400 });
        }
        deliveryFee = fuzzyZone.fee;
      } else {
        deliveryFee = zone?.fee ?? settings.delivery.fee;
      }

      if (settings.delivery.minimumOrderEnabled) {
        const pricingCheck = calculateOrderPricing({
          items: data.items,
          products,
          promotionRules,
          discountCode,
          taxRate: settings.taxRate,
          deliveryFee: 0,
          fulfillment: "delivery",
        });
        if (pricingCheck.subtotal < settings.delivery.minimumOrder) {
          return NextResponse.json(
            { error: `Minimum order for delivery is $${(settings.delivery.minimumOrder / 100).toFixed(2)}` },
            { status: 400 }
          );
        }
      }
    }

    const pricing = calculateOrderPricing({
      items: data.items,
      products,
      promotionRules,
      discountCode,
      taxRate: settings.taxRate,
      deliveryFee,
      fulfillment: data.fulfillment,
    });

    const orderItems = data.items.map((item) => {
      const product = products.find((p) => p._id.toString() === item.productId)!;
      const unitPrice = getEffectivePrice(product, item.variantId);
      const variant = product.variants?.find((v) => v._id?.toString() === item.variantId);
      return {
        productId: product._id,
        variantId: item.variantId,
        name: product.name,
        variantLabel: variant?.name,
        quantity: item.quantity,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
        isFree: false,
        image: product.media[0]?.url,
      };
    });

    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      customer: data.customer,
      items: orderItems,
      fulfillment: data.fulfillment,
      deliveryAddress: data.deliveryAddress,
      preferredDate: data.preferredDate,
      preferredTimeWindow: data.preferredTimeWindow,
      subtotal: pricing.subtotal,
      discount: pricing.discount,
      promotionSavings: pricing.promotionSavings,
      freeItems: pricing.freeItems,
      tax: pricing.tax,
      deliveryFee: pricing.deliveryFee,
      total: pricing.total,
      discountCode: data.discountCode?.toUpperCase(),
      promotionDetails: pricing.freeItems > 0 ? `${pricing.freeItems} free item(s)` : undefined,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === "pay_on_pickup" ? "pending" : "pending",
      orderStatus: "pending",
    });

    if (discountCode && pricing.discount > 0) {
      await DiscountCode.findByIdAndUpdate(discountCode._id, { $inc: { usageCount: 1 } });
    }

    if (data.paymentMethod === "stripe" && stripe) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "cad",
              product_data: {
                name: `Order ${orderNumber}`,
                description: "Dino's Cookies & Bagels",
              },
              unit_amount: pricing.total,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?order=${orderNumber}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancelled?order=${orderNumber}`,
        customer_email: data.customer.email,
        metadata: { orderNumber, orderId: order._id.toString() },
      });

      await Order.findByIdAndUpdate(order._id, { stripeSessionId: session.id });
      return NextResponse.json({ orderNumber, checkoutUrl: session.url });
    }

    await sendOrderConfirmationEmail(order);
    return NextResponse.json({ orderNumber, success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
