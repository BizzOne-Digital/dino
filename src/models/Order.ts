import mongoose, { Schema, type Model } from "mongoose";
import type { FulfillmentMethod, OrderStatus, PaymentMethod, PaymentStatus } from "@/types";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  variantId?: string;
  name: string;
  variantLabel?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  isFree: boolean;
  image?: string;
}

export interface IOrder {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
    marketingConsent: boolean;
  };
  items: IOrderItem[];
  fulfillment: FulfillmentMethod;
  deliveryAddress?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  preferredDate?: string;
  preferredTimeWindow?: string;
  subtotal: number;
  discount: number;
  promotionSavings: number;
  freeItems: number;
  tax: number;
  deliveryFee: number;
  total: number;
  discountCode?: string;
  promotionDetails?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  internalNotes?: string;
  webhookProcessed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  variantId: String,
  name: { type: String, required: true },
  variantLabel: String,
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  lineTotal: { type: Number, required: true },
  isFree: { type: Boolean, default: false },
  image: String,
});

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true, index: true },
      phone: { type: String, required: true },
      notes: String,
      marketingConsent: { type: Boolean, default: false },
    },
    items: [OrderItemSchema],
    fulfillment: { type: String, enum: ["pickup", "delivery"], required: true },
    deliveryAddress: {
      street: String,
      city: String,
      province: String,
      postalCode: String,
    },
    preferredDate: String,
    preferredTimeWindow: String,
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    promotionSavings: { type: Number, default: 0 },
    freeItems: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    discountCode: String,
    promotionDetails: String,
    paymentMethod: { type: String, enum: ["stripe", "pay_on_pickup"], required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "ready_for_pickup",
        "out_for_delivery",
        "completed",
        "cancelled",
        "refunded",
      ],
      default: "pending",
      index: true,
    },
    stripeSessionId: { type: String, index: true },
    stripePaymentIntentId: String,
    internalNotes: String,
    webhookProcessed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Order: Model<IOrder> =
  mongoose.models.Order ?? mongoose.model<IOrder>("Order", OrderSchema);
