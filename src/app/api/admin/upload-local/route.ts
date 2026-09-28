import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/admin-auth";
import { slugify } from "@/lib/utils";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const categorySlug = String(formData.get("categorySlug") || "misc").replace(/[^a-z0-9-]/g, "");
    const productSlug = slugify(String(formData.get("slug") || `product-${Date.now()}`));

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const ext =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : file.type === "image/gif"
            ? "gif"
            : "jpg";

    const dir = path.join(process.cwd(), "public", "images", "products", categorySlug);
    await mkdir(dir, { recursive: true });

    const filename = `${productSlug}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), buffer);

    const url = `/images/products/${categorySlug}/${filename}`;
    return NextResponse.json({
      url,
      publicId: `local/${categorySlug}/${filename}`,
    });
  } catch (err) {
    console.error("Local upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
