import mongoose, { Schema, type Model } from "mongoose";

export interface IProductVariant {
  _id?: mongoose.Types.ObjectId;
  name: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  stock: number;
  inStock: boolean;
}

export interface IProductMedia {
  url: string;
  publicId: string;
  type: "image" | "video";
  alt?: string;
  order: number;
}

export interface IProductNutrition {
  showOnPage: boolean;
  servingSize: string;
  calories?: number;
  fatG?: number;
  saturatedFatG?: number;
  carbohydratesG?: number;
  sugarsG?: number;
  proteinG?: number;
  fiberG?: number;
  sodiumMg?: number;
  ingredients: string;
  allergens: string;
}

export interface IProduct {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  category: mongoose.Types.ObjectId;
  categorySlug: string;
  media: IProductMedia[];
  variants: IProductVariant[];
  isGlutenFree: boolean;
  isFeatured: boolean;
  isRequestOnly: boolean;
  inStock: boolean;
  stock: number;
  popularity: number;
  salePrice?: number;
  saleStart?: Date;
  saleEnd?: Date;
  isOnSale: boolean;
  isPublished: boolean;
  publishAt?: Date;
  seoTitle?: string;
  seoDescription?: string;
  tags: string[];
  nutrition?: IProductNutrition;
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  compareAtPrice: Number,
  sku: String,
  stock: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true },
});

const ProductNutritionSchema = new Schema<IProductNutrition>(
  {
    showOnPage: { type: Boolean, default: false },
    servingSize: { type: String, default: "" },
    calories: Number,
    fatG: Number,
    saturatedFatG: Number,
    carbohydratesG: Number,
    sugarsG: Number,
    proteinG: Number,
    fiberG: Number,
    sodiumMg: Number,
    ingredients: { type: String, default: "" },
    allergens: { type: String, default: "" },
  },
  { _id: false }
);

const ProductMediaSchema = new Schema<IProductMedia>({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  type: { type: String, enum: ["image", "video"], default: "image" },
  alt: String,
  order: { type: Number, default: 0 },
});

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    shortDescription: { type: String, default: "" },
    price: { type: Number, required: true },
    compareAtPrice: Number,
    category: { type: Schema.Types.ObjectId, ref: "ProductCategory", required: true },
    categorySlug: { type: String, index: true },
    media: [ProductMediaSchema],
    variants: [ProductVariantSchema],
    isGlutenFree: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false },
    isRequestOnly: { type: Boolean, default: false },
    inStock: { type: Boolean, default: true, index: true },
    stock: { type: Number, default: 0 },
    popularity: { type: Number, default: 0 },
    salePrice: Number,
    saleStart: Date,
    saleEnd: Date,
    isOnSale: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false, index: true },
    publishAt: Date,
    seoTitle: String,
    seoDescription: String,
    tags: [String],
    nutrition: { type: ProductNutritionSchema, default: undefined },
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", description: "text", tags: "text" });

export const Product: Model<IProduct> =
  mongoose.models.Product ?? mongoose.model<IProduct>("Product", ProductSchema);
