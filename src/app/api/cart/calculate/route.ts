import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { PromotionRule } from "@/models/PromotionRule";
import { DiscountCode } from "@/models/DiscountCode";
import { DeliveryZone } from "@/models/DeliveryZone";
import { getSiteSettings } from "@/models/SiteSettings";
import { calculateOrderPricing, calculatePromotions } from "@/lib/pricing";
import { getEffectivePrice } from "@/lib/pricing-helpers";
import type { CartItem } from "@/types";

const schema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      quantity: z.number().min(1),
    })
  ),
  discountCode: z.string().optional(),
  fulfillment: z.enum(["pickup", "delivery"]).default("pickup"),
  postalCode: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    await connectDB();
    const settings = await getSiteSettings();
    const productIds = data.items.map((i) => i.productId);
    const [products, promotionRules] = await Promise.all([
      Product.find({ _id: { $in: productIds }, isPublished: true }),
      PromotionRule.find({ isActive: true }),
    ]);

    if (products.length !== data.items.length) {
      return NextResponse.json({ error: "Some products are unavailable" }, { status: 400 });
    }

    let discountCode = null;
    if (data.discountCode) {
      discountCode = await DiscountCode.findOne({
        code: data.discountCode.toUpperCase(),
        isActive: true,
      });
    }

    let deliveryFee = 0;
    if (data.fulfillment === "delivery") {
      deliveryFee = settings.delivery.fee;
      if (data.postalCode) {
        const prefix = data.postalCode.replace(/\s/g, "").substring(0, 3).toUpperCase();
        const zone = await DeliveryZone.findOne({
          isActive: true,
          postalCodePrefixes: { $regex: new RegExp(`^${prefix}`, "i") },
        });
        if (zone) deliveryFee = zone.fee;
        else if (!settings.delivery.enabled) {
          return NextResponse.json({ error: "Delivery not available for this area" }, { status: 400 });
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

    const cartItems: CartItem[] = data.items.map((item) => {
      const product = products.find((p) => p._id.toString() === item.productId)!;
      return {
        productId: item.productId,
        variantId: item.variantId,
        name: product.name,
        price: getEffectivePrice(product, item.variantId),
        quantity: item.quantity,
        categorySlug: product.categorySlug,
        image: product.media[0]?.url,
      };
    });

    const promoDetails = calculatePromotions(cartItems, promotionRules);

    return NextResponse.json({
      ...pricing,
      appliedPromotions: promoDetails.appliedRules,
      discountCodeValid: discountCode ? pricing.discount > 0 : false,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to calculate cart" }, { status: 500 });
  }
}
