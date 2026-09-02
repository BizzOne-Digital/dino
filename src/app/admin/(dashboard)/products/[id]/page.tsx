"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { AdminCard, AdminPageHeader, LoadingState } from "@/components/admin/admin-ui";
import { ProductForm, type ProductFormData } from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [initial, setInitial] = useState<Partial<ProductFormData> | null>(null);

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then((r) => r.json())
      .then((d) => {
        const p = d.product;
        setInitial({
          ...p,
          category: typeof p.category === "object" ? p.category._id : p.category,
          saleStart: p.saleStart ? new Date(p.saleStart).toISOString() : undefined,
          saleEnd: p.saleEnd ? new Date(p.saleEnd).toISOString() : undefined,
        });
      });
  }, [id]);

  async function handleSubmit(data: ProductFormData) {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("Product updated");
      router.push("/admin/products");
    } else {
      toast.error("Failed to update product");
    }
  }

  if (!initial) return <LoadingState />;

  return (
    <div>
      <AdminPageHeader title="Edit Product" description={initial.name} />
      <AdminCard>
        <ProductForm initial={initial} onSubmit={handleSubmit} submitLabel="Update Product" />
      </AdminCard>
    </div>
  );
}
