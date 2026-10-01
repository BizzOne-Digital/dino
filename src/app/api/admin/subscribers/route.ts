import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { NewsletterSubscriber } from "@/models/NewsletterSubscriber";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  const subscribers = await NewsletterSubscriber.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({
    subscribers: subscribers.map((s) => ({ ...s, _id: s._id.toString() })),
  });
}
