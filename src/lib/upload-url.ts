export const UPLOAD_FOLDERS = ["products", "gallery", "pages", "misc"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export function isUploadFolder(value: string): value is UploadFolder {
  return (UPLOAD_FOLDERS as readonly string[]).includes(value);
}

export function isStoredUploadUrl(url: string): boolean {
  return url.startsWith("/api/uploads/");
}

export function parseStoredUploadUrl(url: string): { folder: string; filename: string } | null {
  if (!isStoredUploadUrl(url)) return null;
  const parts = url.replace(/^\/api\/uploads\//, "").split("/");
  if (parts.length !== 2) return null;
  const [folder, filename] = parts;
  if (!folder || !filename || folder.includes("..") || filename.includes("..")) return null;
  if (filename.includes("/") || folder.includes("/")) return null;
  return { folder, filename };
}

export function sanitizeUploadFilename(filename: string): boolean {
  if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return false;
  }
  return /^[a-zA-Z0-9._-]+$/.test(filename);
}

export function buildStoredUploadUrl(folder: string, filename: string): string {
  return `/api/uploads/${folder}/${filename}`;
}
