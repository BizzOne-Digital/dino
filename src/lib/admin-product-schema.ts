import { z } from "zod";

export const adminProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
  shortDescription: z.string().default(""),
  price: z.number().min(0),
  compareAtPrice: z.number().optional(),
  category: z.string().min(1),
  categorySlug: z.string().min(1),
  media: z
    .array(
      z.object({
        url: z.string().min(1),
        publicId: z.string().default(""),
        type: z.enum(["image", "video"]).default("image"),
        alt: z.string().optional(),
        order: z.number().default(0),
      })
    )
    .default([]),
  variants: z
    .array(
      z.object({
        name: z.string(),
        price: z.number(),
        compareAtPrice: z.number().optional(),
        stock: z.number().default(0),
        inStock: z.boolean().default(true),
      })
    )
    .default([]),
  isGlutenFree: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isRequestOnly: z.boolean().default(false),
  inStock: z.boolean().default(true),
  stock: z.number().default(0),
  salePrice: z.number().optional(),
  saleStart: z.string().optional(),
  saleEnd: z.string().optional(),
  isOnSale: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  tags: z.array(z.string()).default([]),
});
