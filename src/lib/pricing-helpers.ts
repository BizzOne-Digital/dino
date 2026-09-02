import type { IProduct } from "@/models/Product";

export function getEffectivePrice(product: IProduct, variantId?: string): number {
  const now = new Date();
  const onSale =
    product.isOnSale &&
    product.salePrice != null &&
    (!product.saleStart || product.saleStart <= now) &&
    (!product.saleEnd || product.saleEnd >= now);

  if (variantId && product.variants?.length) {
    const variant = product.variants.find((v) => v._id?.toString() === variantId);
    if (variant) return variant.price;
  }

  if (onSale && product.salePrice != null) return product.salePrice;
  return product.price;
}

export function getCompareAtPrice(product: IProduct, variantId?: string): number | undefined {
  if (variantId && product.variants?.length) {
    const variant = product.variants.find((v) => v._id?.toString() === variantId);
    if (variant?.compareAtPrice) return variant.compareAtPrice;
  }
  return product.compareAtPrice;
}

export function isProductOnSale(product: IProduct): boolean {
  const now = new Date();
  return (
    product.isOnSale &&
    product.salePrice != null &&
    (!product.saleStart || product.saleStart <= now) &&
    (!product.saleEnd || product.saleEnd >= now)
  );
}
