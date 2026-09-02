import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { FAQ } from "@/models/FAQ";
import { requireAdmin, logAudit } from "@/lib/admin-auth";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  const faqs = await FAQ.find().sort({ order: 1 }).lean();
  return NextResponse.json({ faqs: faqs.map((f) => ({ ...f, _id: f._id.toString() })) });
}

export async function POST(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const data = await request.json();
    await connectDB();
    const faq = await FAQ.create(data);
    await logAudit(session!.user.id, session!.user.email, "create", "faq", faq._id.toString());
    return NextResponse.json({ faq: { ...faq.toObject(), _id: faq._id.toString() } });
  } catch {
    return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const { id, ...data } = await request.json();
    await connectDB();
    const faq = await FAQ.findByIdAndUpdate(id, data, { new: true });
    if (!faq) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await logAudit(session!.user.id, session!.user.email, "update", "faq", id);
    return NextResponse.json({ faq: { ...faq.toObject(), _id: faq._id.toString() } });
  } catch {
    return NextResponse.json({ error: "Failed to update FAQ" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await request.json();
  await connectDB();
  await FAQ.findByIdAndDelete(id);
  await logAudit(session!.user.id, session!.user.email, "delete", "faq", id);
  return NextResponse.json({ success: true });
}
