interface VariantLike {
  inStock?: boolean;
}

interface ProductLike {
  inStock?: boolean;
  isRequestOnly?: boolean;
  variants?: VariantLike[];
}

/** Whether the storefront should allow adding this product to the cart. */
export function canPurchaseProduct(
  product: ProductLike,
  selectedVariant?: VariantLike
): boolean {
  const variants = product.variants ?? [];
  if (variants.length > 0) {
    const variant =
      selectedVariant ??
      variants.find((v) => v.inStock !== false) ??
      variants[0];
    return variant?.inStock !== false;
  }

  // Simple products (typical admin uploads): available on the public shop unless request-only
  return true;
}
