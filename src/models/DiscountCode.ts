import mongoose, { Schema, type Model } from "mongoose";

export interface IDiscountCode {
  _id: mongoose.Types.ObjectId;
  code: string;
  type: "percentage" | "fixed" | "free_item";
  value: number;
  freeItemQuantity?: number;
  minimumOrder: number;
  eligibleProducts: mongoose.Types.ObjectId[];
  eligibleCategories: mongoose.Types.ObjectId[];
  usageLimit: number;
  usageCount: number;
  perCustomerLimit: number;
  startDate?: Date;
  expiryDate?: Date;
  isActive: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DiscountCodeSchema = new Schema<IDiscountCode>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    type: { type: String, enum: ["percentage", "fixed", "free_item"], required: true },
    value: { type: Number, required: true },
    freeItemQuantity: Number,
    minimumOrder: { type: Number, default: 0 },
    eligibleProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    eligibleCategories: [{ type: Schema.Types.ObjectId, ref: "ProductCategory" }],
    usageLimit: { type: Number, default: 0 },
    usageCount: { type: Number, default: 0 },
    perCustomerLimit: { type: Number, default: 0 },
    startDate: Date,
    expiryDate: Date,
    isActive: { type: Boolean, default: true, index: true },
    isPublic: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const DiscountCode: Model<IDiscountCode> =
  mongoose.models.DiscountCode ??
  mongoose.model<IDiscountCode>("DiscountCode", DiscountCodeSchema);
