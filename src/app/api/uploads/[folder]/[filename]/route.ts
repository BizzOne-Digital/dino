import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { StoredUpload } from "@/models/StoredUpload";
import { isUploadFolder, sanitizeUploadFilename } from "@/lib/stored-uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ folder: string; filename: string }> }
) {
  try {
    const { folder, filename } = await params;

    if (!isUploadFolder(folder) || !sanitizeUploadFilename(filename)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await connectDB();
    const doc = await StoredUpload.findOne({ folder, filename }).lean();
    if (!doc?.data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = Buffer.isBuffer(doc.data) ? doc.data : Buffer.from(doc.data);

    return new NextResponse(new Uint8Array(body), {
      status: 200,
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Length": String(doc.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("Stored upload read error:", err);
    return NextResponse.json({ error: "Failed to load image" }, { status: 500 });
  }
}
