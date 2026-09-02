export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "completed"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type FulfillmentMethod = "pickup" | "delivery";
export type PaymentMethod = "stripe" | "pay_on_pickup";

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  image?: string;
  variantLabel?: string;
  categorySlug?: string;
  isGlutenFree?: boolean;
}

export interface CartPromotionResult {
  freeQuantity: number;
  savingsCents: number;
  appliedRules: { name: string; buyQuantity: number; freeQuantity: number }[];
}

export interface PricingResult {
  subtotal: number;
  discount: number;
  promotionSavings: number;
  freeItems: number;
  tax: number;
  deliveryFee: number;
  total: number;
  lineItems: {
    productId: string;
    variantId?: string;
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    isFree?: boolean;
  }[];
}

export interface SiteSettingsData {
  businessName: string;
  email: string;
  phone: string;
  socialLinks: { facebook?: string; instagram?: string };
  heroHeading: string;
  heroDescription: string;
  heroImage?: string;
  announcementBar: {
    enabled: boolean;
    message: string;
    pickupNotice?: string;
    deliveryNotice?: string;
  };
  story: string;
  pickup: {
    address: string;
    instructions: string;
    days: string[];
    timeWindows: string[];
    cutoffNotice: string;
  };
  delivery: {
    enabled: boolean;
    fee: number;
    minimumOrder: number;
    minimumOrderEnabled: boolean;
  };
  taxRate: number;
  stripeEnabled: boolean;
  payOnPickupEnabled: boolean;
  storeOpen: boolean;
  seo: { title: string; description: string };
  allergyDisclaimer: string;
  privacyPolicy: string;
  termsConditions: string;
  refundPolicy: string;
  footerText: string;
}
