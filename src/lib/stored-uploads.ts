import { StoredUpload } from "@/models/StoredUpload";
import { parseStoredUploadUrl } from "@/lib/upload-url";

export {
  UPLOAD_FOLDERS,
  type UploadFolder,
  isUploadFolder,
  isStoredUploadUrl,
  parseStoredUploadUrl,
  sanitizeUploadFilename,
  buildStoredUploadUrl,
} from "@/lib/upload-url";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function extensionForMime(mimeType: string): string | null {
  return MIME_TO_EXT[mimeType] ?? null;
}

export async function deleteStoredUploadByUrl(url: string): Promise<boolean> {
  const parsed = parseStoredUploadUrl(url);
  if (!parsed) return false;
  const result = await StoredUpload.deleteOne({
    folder: parsed.folder,
    filename: parsed.filename,
  });
  return result.deletedCount > 0;
}
