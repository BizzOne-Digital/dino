import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { deleteStoredUploadByUrl, parseStoredUploadUrl } from "@/lib/stored-uploads";

export const runtime = "nodejs";

export async function DELETE(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { url } = (await request.json()) as { url?: string };
    if (!url || !parseStoredUploadUrl(url)) {
      return NextResponse.json({ error: "Invalid upload URL" }, { status: 400 });
    }

    await connectDB();
    const deleted = await deleteStoredUploadByUrl(url);
    return NextResponse.json({ success: true, deleted });
  } catch (err) {
    console.error("Delete stored upload error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
