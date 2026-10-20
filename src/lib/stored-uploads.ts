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

/** Mongoose lean() often returns BSON Binary instead of Node Buffer. */
export function storedUploadDataToBuffer(data: unknown): Buffer | null {
  if (!data) return null;
  if (Buffer.isBuffer(data)) return data;

  if (typeof data === "object" && data !== null) {
    const record = data as Record<string, unknown>;
    if (record.buffer instanceof Uint8Array) {
      return Buffer.from(record.buffer);
    }
    if (record.type === "Buffer" && Array.isArray(record.data)) {
      return Buffer.from(record.data as number[]);
    }
  }

  if (data instanceof Uint8Array) {
    return Buffer.from(data);
  }

  return null;
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
