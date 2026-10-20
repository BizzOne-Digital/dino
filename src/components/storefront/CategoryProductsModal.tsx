"use client";

import { useCallback, useEffect, useState } from "react";
import { ProductImage } from "@/components/ui/ProductImage";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, ShoppingBag, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatCurrency, cn } from "@/lib/utils";
import { resolveProductImageUrl } from "@/lib/product-image";
import { canPurchaseProduct } from "@/lib/product-availability";
import { isMadeToOrder, MADE_TO_ORDER_LABEL } from "@/lib/made-to-order";

interface ProductVariant {
  _id?: string;
  name: string;
  price: number;
  inStock: boolean;
}

interface Product {
  _id: string;
  name: string;
  shortDescription?: string;
  effectivePrice: number;
  compareAtPrice?: number;
  onSale: boolean;
  media: { url: string; alt?: string }[];
  variants: ProductVariant[];
  inStock: boolean;
  isRequestOnly?: boolean;
  categorySlug: string;
}

export interface CategoryModalTarget {
  slug: string;
  name: string;
}

function variantId(product: Product, variant: ProductVariant, index: number) {
  return variant._id?.toString() ?? `${product._id}-variant-${index}`;
}

function findVariant(product: Product, id?: string) {
  if (!id) return undefined;
  return product.variants.find((v, i) => variantId(product, v, i) === id);
}

function defaultVariantId(product: Product) {
  const first = product.variants[0];
  if (!first) return undefined;
  return variantId(product, first, 0);
}

export function CategoryProductsModal({
  category,
  onClose,
}: {
  category: CategoryModalTarget | null;
  onClose: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [variantByProduct, setVariantByProduct] = useState<Record<string, string>>({});

  const getVariantId = (product: Product) =>
    variantByProduct[product._id] ?? defaultVariantId(product);

  const fetchProducts = useCallback(async (slug: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ category: slug, limit: "60", sort: "newest" });
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!category) {
      setProducts([]);
      return;
    }
    fetchProducts(category.slug);
  }, [category, fetchProducts]);

  useEffect(() => {
    if (!category) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [category, onClose]);

  const handleAddToCart = (product: Product) => {
    const resolvedVariantId = product.variants.length ? getVariantId(product) : undefined;
    const variant = findVariant(product, resolvedVariantId);
    const price = variant?.price ?? product.effectivePrice;
    addItem({
      productId: product._id,
      variantId: resolvedVariantId,
      name: variant ? `${product.name} (${variant.name})` : product.name,
      price,
      compareAtPrice: product.compareAtPrice,
      quantity: 1,
      image: resolveProductImageUrl(product.media[0]?.url),
      categorySlug: product.categorySlug,
      variantLabel: variant?.name,
    });
  };

  const goToFullShop = () => {
    if (!category) return;
    onClose();
    window.location.hash = `shop?category=${category.slug}`;
    requestAnimationFrame(() => {
      document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
    });
  };

  return (
    <AnimatePresence>
      {category && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="category-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close"
          />
          <motion.div
            className="relative z-10 flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-cream shadow-2xl sm:rounded-3xl"
            initial={reducedMotion ? {} : { y: 40, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={reducedMotion ? {} : { y: 40, scale: 0.98 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-beige/60 px-5 py-4 sm:px-6">
              <div>
                <h2 id="category-modal-title" className="font-display text-2xl font-bold text-forest">
                  {category.name}
                </h2>
                <p className="text-sm text-charcoal/60 mt-1">Tap a product to add it to your cart</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-white p-2 shadow-sm hover:bg-beige/40"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="animate-spin text-dino" size={36} />
                </div>
              ) : products.length === 0 ? (
                <p className="text-center text-charcoal/60 py-16">No products in this category yet.</p>
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2">
                  {products.map((product) => {
                    const selectedId = getVariantId(product);
                    const variant = findVariant(product, selectedId);
                    const price = variant?.price ?? product.effectivePrice;
                    const canAdd = canPurchaseProduct(product, variant);
                    return (
                      <li
                        key={product._id}
                        className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm border border-beige/40"
                      >
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-beige/30">
                          {product.media[0]?.url ? (
                            <ProductImage
                              src={resolveProductImageUrl(product.media[0].url)}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <ShoppingBag className="text-beige" size={28} />
                            </div>
                          )}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-display font-semibold text-forest text-sm leading-snug">
                              {product.name}
                            </h3>
                            {isMadeToOrder(product) && (
                              <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-forest">
                                {MADE_TO_ORDER_LABEL}
                              </span>
                            )}
                          </div>
                          {product.shortDescription && (
                            <p className="mt-0.5 text-xs text-charcoal/55 line-clamp-2">
                              {product.shortDescription}
                            </p>
                          )}
                          {product.variants.length > 0 && (
                            <select
                              className="mt-2 w-full rounded-lg border border-beige bg-cream px-2 py-1.5 text-xs"
                              value={selectedId ?? ""}
                              onChange={(e) =>
                                setVariantByProduct((prev) => ({
                                  ...prev,
                                  [product._id]: e.target.value,
                                }))
                              }
                            >
                              {product.variants.map((v, i) => {
                                const id = variantId(product, v, i);
                                return (
                                  <option key={id} value={id} disabled={!v.inStock}>
                                    {v.name} — {formatCurrency(v.price)}
                                  </option>
                                );
                              })}
                            </select>
                          )}
                          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                            <span className="font-bold text-forest">{formatCurrency(price)}</span>
                            <button
                              type="button"
                              disabled={!canAdd}
                              onClick={() => handleAddToCart(product)}
                              className={cn(
                                "rounded-full px-4 py-2 text-xs font-semibold text-cream",
                                canAdd ? "bg-forest hover:bg-dino" : "bg-charcoal/30"
                              )}
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="border-t border-beige/60 px-4 py-4 sm:px-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={goToFullShop}
                className="flex-1 rounded-full border-2 border-forest py-3 text-sm font-semibold text-forest hover:bg-forest/5"
              >
                View full shop
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full bg-forest py-3 text-sm font-semibold text-cream hover:bg-dino"
              >
                Continue browsing
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
