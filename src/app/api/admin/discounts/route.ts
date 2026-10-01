import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { DiscountCode } from "@/models/DiscountCode";
import { requireAdmin, logAudit } from "@/lib/admin-auth";
import { nanoid } from "nanoid";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  const codes = await DiscountCode.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ codes: codes.map((c) => ({ ...c, _id: c._id.toString() })) });
}

const schema = z.object({
  code: z.string().optional(),
  type: z.enum(["percentage", "fixed", "free_item"]),
  value: z.number().min(0),
  freeItemQuantity: z.number().optional(),
  minimumOrder: z.number().default(0),
  usageLimit: z.number().default(0),
  perCustomerLimit: z.number().default(0),
  startDate: z.string().optional(),
  expiryDate: z.string().optional(),
  isActive: z.boolean().default(true),
  isPublic: z.boolean().default(false),
});

export async function POST(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const data = schema.parse(await request.json());
    await connectDB();
    const code = data.code?.toUpperCase() || `DINO${nanoid(6).toUpperCase()}`;
    const discount = await DiscountCode.create({ ...data, code });
    await logAudit(session!.user.id, session!.user.email, "create", "discount", discount._id.toString());
    return NextResponse.json({ code: { ...discount.toObject(), _id: discount._id.toString() } });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const { id, ...data } = await request.json();
    await connectDB();
    const code = await DiscountCode.findByIdAndUpdate(id, data, { new: true });
    await logAudit(session!.user.id, session!.user.email, "update", "discount", id);
    return NextResponse.json({ code });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;
  const { id } = await request.json();
  await connectDB();
  await DiscountCode.findByIdAndDelete(id);
  await logAudit(session!.user.id, session!.user.email, "delete", "discount", id);
  return NextResponse.json({ success: true });
}
