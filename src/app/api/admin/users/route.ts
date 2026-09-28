import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AdminUser } from "@/models/AdminUser";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  const users = await AdminUser.find().select("-password").sort({ createdAt: -1 }).lean();
  return NextResponse.json({ users: users.map((u) => ({ ...u, _id: u._id.toString() })) });
}
