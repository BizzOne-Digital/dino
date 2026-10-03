"use client";

import { useRef, useState } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { AdminButton } from "./admin-ui";
import { isStoredUploadUrl, type UploadFolder } from "@/lib/upload-url";
import { resolveProductImageUrl } from "@/lib/product-image";

interface AdminImageFieldProps {
  value: string;
  onChange: (url: string) => void;
  folder: UploadFolder;
  label?: string;
  helperText?: string;
}

export function AdminImageField({
  value,
  onChange,
  folder,
  label = "Image",
  helperText,
}: AdminImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function removeStoredIfNeeded(url: string) {
    if (!isStoredUploadUrl(url)) return;
    try {
      await fetch("/api/admin/stored-upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
    } catch {
      /* best-effort cleanup */
    }
  }

  async function handleFile(file: File) {
    setUploading(true);
    try {
      if (value) await removeStoredIfNeeded(value);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Upload failed");
      }

      onChange(data.url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    if (value) await removeStoredIfNeeded(value);
    onChange("");
    toast.success("Image removed");
  }

  const previewSrc = value ? resolveProductImageUrl(value) : "";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-forest">{label}</label>
        {helperText && <span className="text-xs text-charcoal/50">{helperText}</span>}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          {previewSrc ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin preview (api + static URLs)
            <img src={previewSrc} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="px-2 text-center text-xs text-gray-400">No image</span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
          <div className="flex flex-wrap gap-2">
            <AdminButton
              type="button"
              variant="secondary"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} className="inline mr-1" />
              )}
              {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
            </AdminButton>
            {value && (
              <AdminButton type="button" variant="secondary" disabled={uploading} onClick={handleRemove}>
                <Trash2 size={16} className="inline mr-1" />
                Remove
              </AdminButton>
            )}
          </div>
          <p className="text-xs text-charcoal/50">PNG, JPEG, WebP, or GIF · max 8MB · stored in MongoDB (works on Vercel)</p>
          <input
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="Or paste a URL (/api/uploads/… or /images/…)"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
