import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ContactSubmission } from "@/models/ContactSubmission";
import { requireAdmin, logAudit } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unread") === "true";

  const filter = unreadOnly ? { isRead: false } : {};
  const inquiries = await ContactSubmission.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json({
    inquiries: inquiries.map((i) => ({ ...i, _id: i._id.toString() })),
  });
}

export async function PUT(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const { id, isRead } = await request.json();
    await connectDB();
    const inquiry = await ContactSubmission.findByIdAndUpdate(id, { isRead }, { new: true });
    if (!inquiry) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await logAudit(session!.user.id, session!.user.email, "update", "inquiry", id);
    return NextResponse.json({ inquiry: { ...inquiry.toObject(), _id: inquiry._id.toString() } });
  } catch {
    return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await request.json();
  await connectDB();
  await ContactSubmission.findByIdAndDelete(id);
  await logAudit(session!.user.id, session!.user.email, "delete", "inquiry", id);
  return NextResponse.json({ success: true });
}
