import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Testimonial } from "@/models/Testimonial";
import { requireAdmin, logAudit } from "@/lib/admin-auth";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  const reviews = await Testimonial.find().sort({ order: 1 }).lean();
  return NextResponse.json({ reviews: reviews.map((r) => ({ ...r, _id: r._id.toString() })) });
}

export async function POST(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const data = await request.json();
    await connectDB();
    const review = await Testimonial.create(data);
    await logAudit(session!.user.id, session!.user.email, "create", "review", review._id.toString());
    return NextResponse.json({ review: { ...review.toObject(), _id: review._id.toString() } });
  } catch {
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const { id, ...data } = await request.json();
    await connectDB();
    const review = await Testimonial.findByIdAndUpdate(id, data, { new: true });
    if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await logAudit(session!.user.id, session!.user.email, "update", "review", id);
    return NextResponse.json({ review: { ...review.toObject(), _id: review._id.toString() } });
  } catch {
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await request.json();
  await connectDB();
  await Testimonial.findByIdAndDelete(id);
  await logAudit(session!.user.id, session!.user.email, "delete", "review", id);
  return NextResponse.json({ success: true });
}
