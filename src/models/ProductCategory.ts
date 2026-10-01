import mongoose, { Schema, type Model } from "mongoose";

export interface IProductCategory {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  image?: string;
  productCount: number;
  startingPrice?: number;
  isRequestOnly: boolean;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductCategorySchema = new Schema<IProductCategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    image: String,
    productCount: { type: Number, default: 0 },
    startingPrice: Number,
    isRequestOnly: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ProductCategory: Model<IProductCategory> =
  mongoose.models.ProductCategory ??
  mongoose.model<IProductCategory>("ProductCategory", ProductCategorySchema);
