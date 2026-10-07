/** Fallback when image URL is missing or not usable on the web. */
export const PRODUCT_IMAGE_PLACEHOLDER = "/images/logo.jpg";

const FILESYSTEM_PATH_PREFIXES = ["/Users/", "/home/", "/var/", "/private/", "/tmp/"];

function isFilesystemPath(url: string): boolean {
  if (url.startsWith("file://")) return true;
  if (/^[a-zA-Z]:[\\/]/.test(url)) return true;
  if (url.includes(":\\")) return true;
  return FILESYSTEM_PATH_PREFIXES.some((prefix) => url.startsWith(prefix));
}

/** URLs safe for next/image localPatterns + remotePatterns. */
export function isPublicImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed || isFilesystemPath(trimmed)) return false;
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) return true;
  if (trimmed.startsWith("/images/") || trimmed.startsWith("/api/uploads/")) return true;
  return false;
}

export function resolvePublicImageUrl(
  url?: string | null,
  fallback?: string | null
): string {
  if (url?.trim() && isPublicImageUrl(url)) return url.trim();
  if (fallback?.trim() && isPublicImageUrl(fallback)) return fallback.trim();
  if (url?.trim() && (url.startsWith("/uploads/") || url.startsWith("/public/uploads/"))) {
    return fallback && isPublicImageUrl(fallback) ? fallback.trim() : PRODUCT_IMAGE_PLACEHOLDER;
  }
  return PRODUCT_IMAGE_PLACEHOLDER;
}

/** @deprecated Use resolvePublicImageUrl */
export function resolveProductImageUrl(url?: string | null): string {
  return resolvePublicImageUrl(url);
}

/** Strip invalid URLs before saving to MongoDB (e.g. pasted desktop paths). */
export function sanitizeStoredImageUrl(url?: string | null): string {
  if (!url?.trim()) return "";
  return isPublicImageUrl(url) ? url.trim() : "";
}
