import mongoose, { Schema, type Model } from "mongoose";

export interface IPromotionRule {
  _id: mongoose.Types.ObjectId;
  name: string;
  buyQuantity: number;
  freeQuantity: number;
  eligibleCategories: mongoose.Types.ObjectId[];
  eligibleProducts: mongoose.Types.ObjectId[];
  stackable: boolean;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const PromotionRuleSchema = new Schema<IPromotionRule>(
  {
    name: { type: String, required: true },
    buyQuantity: { type: Number, required: true },
    freeQuantity: { type: Number, required: true },
    eligibleCategories: [{ type: Schema.Types.ObjectId, ref: "ProductCategory" }],
    eligibleProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    stackable: { type: Boolean, default: false },
    startDate: Date,
    endDate: Date,
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const PromotionRule: Model<IPromotionRule> =
  mongoose.models.PromotionRule ??
  mongoose.model<IPromotionRule>("PromotionRule", PromotionRuleSchema);
