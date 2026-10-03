/** Fallback when image URL is missing or points at legacy disk uploads on serverless. */
export const PRODUCT_IMAGE_PLACEHOLDER = "/images/logo.jpg";

export function resolveProductImageUrl(url?: string | null): string {
  if (!url?.trim()) return PRODUCT_IMAGE_PLACEHOLDER;
  const trimmed = url.trim();
  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("/public/uploads/")) {
    return PRODUCT_IMAGE_PLACEHOLDER;
  }
  return trimmed;
}
