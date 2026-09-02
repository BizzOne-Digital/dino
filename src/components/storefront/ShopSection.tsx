"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Search,
  Filter,
  X,
  Plus,
  Minus,
  ShoppingBag,
  Leaf,
  Eye,
  ChevronDown,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatCurrency, cn } from "@/lib/utils";

interface ProductMedia {
  url: string;
  alt?: string;
}

interface ProductVariant {
  _id?: string;
  name: string;
  price: number;
  inStock: boolean;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  effectivePrice: number;
  onSale: boolean;
  categorySlug: string;
  media: ProductMedia[];
  variants: ProductVariant[];
  isGlutenFree: boolean;
  inStock: boolean;
  isRequestOnly?: boolean;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface ShopSectionProps {
  initialSearch?: string;
  initialCategory?: string;
}

export function ShopSection({ initialSearch = "", initialCategory = "" }: ShopSectionProps) {
  const reducedMotion = useReducedMotion();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [glutenFree, setGlutenFree] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    if (glutenFree) params.set("glutenFree", "true");
    if (inStockOnly) params.set("inStock", "true");
    params.set("sort", sort);
    params.set("limit", "24");

    try {
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, search, glutenFree, inStockOnly, sort]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openQuickView = (product: Product) => {
    setQuickView(product);
    setSelectedVariant(product.variants[0]?._id?.toString());
    setQuantity(1);
  };

  const handleAddToCart = (product: Product, qty = quantity, variantId?: string) => {
    const variant = product.variants.find((v) => v._id?.toString() === variantId);
    const price = variant?.price ?? product.effectivePrice;
    addItem({
      productId: product._id,
      variantId: variantId,
      name: variant ? `${product.name} (${variant.name})` : product.name,
      price,
      compareAtPrice: product.compareAtPrice,
      quantity: qty,
      image: product.media[0]?.url,
      categorySlug: product.categorySlug,
      isGlutenFree: product.isGlutenFree,
      variantLabel: variant?.name,
    });
    setQuickView(null);
  };

  return (
    <section id="shop" className="py-20 px-4 lg:px-6 bg-gradient-cream">
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="text-center mb-10"
          initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl font-bold text-forest sm:text-4xl">Shop Fresh Bakes</h2>
          <p className="mt-3 text-charcoal/60">Handcrafted daily with organic ingredients</p>
        </motion.div>

        <div className="mb-8 flex flex-col gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchProducts();
            }}
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40" size={18} />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-full border border-beige bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-dino focus:ring-2 focus:ring-dino/20"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream hover:bg-dino transition-colors sm:w-auto"
            >
              Search
            </button>
          </form>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-beige bg-white px-4 py-3 text-sm font-medium hover:border-dino sm:w-auto"
            >
              <Filter size={16} />
              Filters
              <ChevronDown size={16} className={cn(filtersOpen && "rotate-180")} />
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full rounded-full border border-beige bg-white px-4 py-3 text-sm outline-none focus:border-dino sm:w-auto sm:min-w-[160px]"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popularity">Popular</option>
            </select>
          </div>
        </div>

        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-sm">
                <button
                  onClick={() => setCategory("")}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    !category ? "bg-forest text-cream" : "bg-cream text-charcoal hover:bg-beige"
                  )}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => setCategory(c.slug)}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      category === c.slug
                        ? "bg-forest text-cream"
                        : "bg-cream text-charcoal hover:bg-beige"
                    )}
                  >
                    {c.name}
                  </button>
                ))}
                <label className="flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={glutenFree} onChange={(e) => setGlutenFree(e.target.checked)} />
                  <Leaf size={14} className="text-dino" />
                  Gluten-Free
                </label>
                <label className="flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
                  In Stock Only
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/50 h-80 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-charcoal/60 py-16">No products found. Try adjusting your filters.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, i) => (
              <motion.article
                key={product._id}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-xl"
                initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={reducedMotion ? {} : { y: -4 }}
              >
                <div className="relative aspect-square overflow-hidden">
                  {product.media[0]?.url ? (
                    <Image
                      src={product.media[0].url}
                      alt={product.media[0].alt || product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-beige/30">
                      <ShoppingBag className="text-beige" size={48} />
                    </div>
                  )}
                  {product.onSale && (
                    <span className="absolute top-3 left-3 rounded-full bg-caramel px-3 py-1 text-xs font-bold text-cream">
                      Sale
                    </span>
                  )}
                  {product.isGlutenFree && (
                    <span className="absolute top-3 right-3 rounded-full bg-dino/90 px-2 py-1 text-xs font-medium text-cream flex items-center gap-1">
                      <Leaf size={12} /> GF
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex gap-2 p-3 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                    <button
                      onClick={() => openQuickView(product)}
                      className="flex-1 rounded-full bg-white/90 py-2 text-sm font-medium text-forest backdrop-blur hover:bg-white"
                    >
                      <Eye size={14} className="inline mr-1" />
                      Quick View
                    </button>
                    <button
                      onClick={() => handleAddToCart(product, 1)}
                      disabled={!product.inStock}
                      className="flex-1 rounded-full bg-forest py-2 text-sm font-medium text-cream hover:bg-dino disabled:opacity-50"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display font-semibold text-forest">{product.name}</h3>
                  {product.shortDescription && (
                    <p className="mt-1 text-sm text-charcoal/60 line-clamp-2">{product.shortDescription}</p>
                  )}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-bold text-forest">{formatCurrency(product.effectivePrice)}</span>
                      {product.onSale && product.compareAtPrice && (
                        <span className="ml-2 text-sm text-charcoal/40 line-through">
                          {formatCurrency(product.compareAtPrice)}
                        </span>
                      )}
                    </div>
                    {!product.inStock && (
                      <span className="shrink-0 text-xs font-medium text-caramel">Out of Stock</span>
                    )}
                  </div>
                  {/* Mobile add-to-cart — always visible */}
                  <div className="mt-3 flex gap-2 sm:hidden">
                    <button
                      onClick={() => openQuickView(product)}
                      className="flex-1 rounded-full border border-forest/20 py-2.5 text-xs font-semibold text-forest"
                    >
                      Quick View
                    </button>
                    <button
                      onClick={() => handleAddToCart(product, 1)}
                      disabled={!product.inStock}
                      className="flex-1 rounded-full bg-forest py-2.5 text-xs font-semibold text-cream disabled:opacity-50"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {quickView && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm" onClick={() => setQuickView(null)} />
            <motion.div
              className="relative z-10 grid max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-cream shadow-2xl lg:max-h-[90vh] lg:grid-cols-2 lg:overflow-hidden"
              initial={reducedMotion ? {} : { scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={reducedMotion ? {} : { scale: 0.9, y: 20 }}
            >
              <button
                onClick={() => setQuickView(null)}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 hover:bg-white"
                aria-label="Close"
              >
                <X size={20} />
              </button>
              <div className="relative h-48 shrink-0 sm:h-64 lg:h-auto lg:min-h-[320px] lg:aspect-auto">
                {quickView.media[0]?.url && (
                  <Image
                    src={quickView.media[0].url}
                    alt={quickView.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex flex-col p-6 lg:p-8">
                <h3 className="font-display text-2xl font-bold text-forest">{quickView.name}</h3>
                <p className="mt-2 text-charcoal/70">{quickView.description || quickView.shortDescription}</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-2xl font-bold text-forest">
                    {formatCurrency(
                      quickView.variants.find((v) => v._id?.toString() === selectedVariant)?.price ??
                        quickView.effectivePrice
                    )}
                  </span>
                  {quickView.onSale && quickView.compareAtPrice && (
                    <span className="text-charcoal/40 line-through">
                      {formatCurrency(quickView.compareAtPrice)}
                    </span>
                  )}
                </div>
                {quickView.variants.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-charcoal/60 mb-2">Options</p>
                    <div className="flex flex-wrap gap-2">
                      {quickView.variants.map((v) => (
                        <button
                          key={v._id?.toString()}
                          onClick={() => setSelectedVariant(v._id?.toString())}
                          disabled={!v.inStock}
                          className={cn(
                            "rounded-full px-4 py-2 text-sm font-medium border transition-colors",
                            selectedVariant === v._id?.toString()
                              ? "border-forest bg-forest text-cream"
                              : "border-beige hover:border-dino",
                            !v.inStock && "opacity-50"
                          )}
                        >
                          {v.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-center rounded-full border border-beige">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-beige/30 rounded-l-full"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-beige/30 rounded-r-full"
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => handleAddToCart(quickView, quantity, selectedVariant)}
                    disabled={!quickView.inStock}
                    className="flex-1 rounded-full bg-forest py-3 font-semibold text-cream hover:bg-dino disabled:opacity-50 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
