import type { CartItem, PricingResult } from "@/types";
import type { IDiscountCode } from "@/models/DiscountCode";
import type { IPromotionRule } from "@/models/PromotionRule";
import type { IProduct } from "@/models/Product";
import { getEffectivePrice } from "./pricing-helpers";

interface PricingInput {
  items: { productId: string; variantId?: string; quantity: number }[];
  products: IProduct[];
  promotionRules: IPromotionRule[];
  discountCode?: IDiscountCode | null;
  taxRate: number;
  deliveryFee: number;
  fulfillment: "pickup" | "delivery";
}

export function calculatePromotions(
  items: CartItem[],
  rules: IPromotionRule[]
): { freeQuantity: number; savingsCents: number; appliedRules: { name: string; buyQuantity: number; freeQuantity: number }[] } {
  const activeRules = rules
    .filter((r) => r.isActive)
    .filter((r) => {
      const now = new Date();
      if (r.startDate && r.startDate > now) return false;
      if (r.endDate && r.endDate < now) return false;
      return true;
    })
    .sort((a, b) => b.buyQuantity - a.buyQuantity);

  let totalFree = 0;
  let totalSavings = 0;
  const appliedRules: { name: string; buyQuantity: number; freeQuantity: number }[] = [];

  const eligibleItems = items.filter((item) => !item.variantLabel?.includes("free"));

  for (const rule of activeRules) {
    const categoryIds = rule.eligibleCategories.map((c) => c.toString());
    const productIds = rule.eligibleProducts.map((p) => p.toString());

    const matchingItems = eligibleItems.filter((item) => {
      if (productIds.length && !productIds.includes(item.productId)) return false;
      if (categoryIds.length && item.categorySlug) {
        return categoryIds.some(() => true);
      }
      return productIds.length === 0 && categoryIds.length === 0;
    });

    const totalQty = matchingItems.reduce((sum, i) => sum + i.quantity, 0);
    if (totalQty < rule.buyQuantity) continue;

    const sets = Math.floor(totalQty / rule.buyQuantity);
    const freeQty = sets * rule.freeQuantity;

    if (freeQty > 0) {
      const cheapestPrice = Math.min(...matchingItems.map((i) => i.price));
      totalFree += freeQty;
      totalSavings += freeQty * cheapestPrice;
      appliedRules.push({
        name: rule.name,
        buyQuantity: rule.buyQuantity,
        freeQuantity: rule.freeQuantity,
      });

      if (!rule.stackable) break;
    }
  }

  return { freeQuantity: totalFree, savingsCents: totalSavings, appliedRules };
}

export function calculateOrderPricing(input: PricingInput): PricingResult {
  const lineItems: PricingResult["lineItems"] = [];
  let subtotal = 0;

  for (const item of input.items) {
    const product = input.products.find((p) => p._id.toString() === item.productId);
    if (!product) continue;

    const unitPrice = getEffectivePrice(product, item.variantId);
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    lineItems.push({
      productId: item.productId,
      variantId: item.variantId,
      name: product.name,
      quantity: item.quantity,
      unitPrice,
      lineTotal,
    });
  }

  const cartItems: CartItem[] = lineItems.map((li) => {
    const product = input.products.find((p) => p._id.toString() === li.productId)!;
    return {
      productId: li.productId,
      variantId: li.variantId,
      name: li.name,
      price: li.unitPrice,
      quantity: li.quantity,
      categorySlug: product.categorySlug,
    };
  });

  const promo = calculatePromotions(cartItems, input.promotionRules);
  const promotionSavings = promo.savingsCents;
  const afterPromo = subtotal - promotionSavings;

  let discount = 0;
  if (input.discountCode && input.discountCode.isActive) {
    const code = input.discountCode;
    const now = new Date();
    const valid =
      (!code.startDate || code.startDate <= now) &&
      (!code.expiryDate || code.expiryDate >= now) &&
      (code.usageLimit === 0 || code.usageCount < code.usageLimit) &&
      afterPromo >= code.minimumOrder;

    if (valid) {
      if (code.type === "percentage") {
        discount = Math.round(afterPromo * (code.value / 100));
      } else if (code.type === "fixed") {
        discount = Math.min(code.value, afterPromo);
      }
    }
  }

  const taxable = afterPromo - discount;
  const tax = Math.round(taxable * (input.taxRate / 100));
  const deliveryFee = input.fulfillment === "delivery" ? input.deliveryFee : 0;
  const total = taxable + tax + deliveryFee;

  return {
    subtotal,
    discount,
    promotionSavings,
    freeItems: promo.freeQuantity,
    tax,
    deliveryFee,
    total,
    lineItems,
  };
}
