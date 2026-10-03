import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { StoredUpload } from "@/models/StoredUpload";
import {
  ALLOWED_IMAGE_MIMES,
  MAX_UPLOAD_BYTES,
  buildStoredUploadUrl,
  extensionForMime,
  isUploadFolder,
} from "@/lib/stored-uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folderRaw = String(formData.get("folder") || "misc");

    if (!isUploadFolder(folderRaw)) {
      return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_MIMES.has(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "File exceeds 8MB limit" }, { status: 400 });
    }

    const ext = extensionForMime(file.type);
    if (!ext) {
      return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
    }

    const filename = `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await connectDB();
    await StoredUpload.create({
      folder: folderRaw,
      filename,
      mimeType: file.type,
      size: buffer.length,
      data: buffer,
    });

    const url = buildStoredUploadUrl(folderRaw, filename);

    return NextResponse.json({
      success: true,
      url,
      filename,
      size: buffer.length,
      folder: folderRaw,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
