import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DeliveryZone } from "@/models/DeliveryZone";
import { requireAdmin, logAudit } from "@/lib/admin-auth";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  const zones = await DeliveryZone.find().sort({ name: 1 }).lean();
  return NextResponse.json({ zones: zones.map((z) => ({ ...z, _id: z._id.toString() })) });
}

export async function POST(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const data = await request.json();
    await connectDB();
    const zone = await DeliveryZone.create(data);
    await logAudit(session!.user.id, session!.user.email, "create", "delivery_zone", zone._id.toString());
    return NextResponse.json({ zone: { ...zone.toObject(), _id: zone._id.toString() } });
  } catch {
    return NextResponse.json({ error: "Failed to create delivery zone" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const { id, ...data } = await request.json();
    await connectDB();
    const zone = await DeliveryZone.findByIdAndUpdate(id, data, { new: true });
    if (!zone) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await logAudit(session!.user.id, session!.user.email, "update", "delivery_zone", id);
    return NextResponse.json({ zone: { ...zone.toObject(), _id: zone._id.toString() } });
  } catch {
    return NextResponse.json({ error: "Failed to update delivery zone" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await request.json();
  await connectDB();
  await DeliveryZone.findByIdAndDelete(id);
  await logAudit(session!.user.id, session!.user.email, "delete", "delivery_zone", id);
  return NextResponse.json({ success: true });
}
