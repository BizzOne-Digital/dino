import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PromotionRule } from "@/models/PromotionRule";
import { requireAdmin, logAudit } from "@/lib/admin-auth";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  const rules = await PromotionRule.find().sort({ order: 1 }).lean();
  return NextResponse.json({ rules: rules.map((r) => ({ ...r, _id: r._id.toString() })) });
}

export async function POST(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;
  const data = await request.json();
  await connectDB();
  const rule = await PromotionRule.create(data);
  await logAudit(session!.user.id, session!.user.email, "create", "promotion", rule._id.toString());
  return NextResponse.json({ rule });
}

export async function PUT(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;
  const { id, ...data } = await request.json();
  await connectDB();
  const rule = await PromotionRule.findByIdAndUpdate(id, data, { new: true });
  await logAudit(session!.user.id, session!.user.email, "update", "promotion", id);
  return NextResponse.json({ rule });
}

export async function DELETE(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;
  const { id } = await request.json();
  await connectDB();
  await PromotionRule.findByIdAndDelete(id);
  await logAudit(session!.user.id, session!.user.email, "delete", "promotion", id);
  return NextResponse.json({ success: true });
}
