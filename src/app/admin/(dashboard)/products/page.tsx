"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AdminButton, AdminCard, AdminPageHeader, EmptyState, inputClass, LoadingState } from "@/components/admin/admin-ui";

interface Product {
  _id: string;
  name: string;
  price: number;
  inStock: boolean;
  isPublished: boolean;
  category?: { name: string };
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/products?${params}`);
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Product deleted");
      fetchProducts();
    } else {
      toast.error("Failed to delete product");
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description="Manage your product catalog"
        action={
          <Link href="/admin/products/new">
            <AdminButton><Plus size={16} className="inline mr-1" /> New Product</AdminButton>
          </Link>
        }
      />

      <AdminCard className="mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className={`${inputClass} pl-9`}
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </AdminCard>

      <AdminCard>
        {loading ? (
          <LoadingState />
        ) : products.length === 0 ? (
          <EmptyState message="No products found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Price</th>
                  <th className="pb-3 font-medium">Stock</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 font-medium text-forest">{p.name}</td>
                    <td className="py-3">{p.category?.name || "—"}</td>
                    <td className="py-3">{formatCurrency(p.price)}</td>
                    <td className="py-3">{p.inStock ? "In Stock" : "Out of Stock"}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.isPublished ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                        {p.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button onClick={() => router.push(`/admin/products/${p._id}`)} className="text-dino hover:text-forest p-1">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(p._id, p.name)} className="text-red-500 hover:text-red-700 p-1 ml-2">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
