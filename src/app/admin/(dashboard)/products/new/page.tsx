"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";
import { ProductForm, type ProductFormData } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  const router = useRouter();

  async function handleSubmit(data: ProductFormData) {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("Product created");
      router.push("/admin/products");
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to create product");
    }
  }

  return (
    <div>
      <AdminPageHeader title="New Product" description="Add a new product to your catalog" />
      <AdminCard>
        <ProductForm onSubmit={handleSubmit} submitLabel="Create Product" />
      </AdminCard>
    </div>
  );
}
