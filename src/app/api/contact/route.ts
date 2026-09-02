import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { ContactSubmission } from "@/models/ContactSubmission";
import { sendContactNotification } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(2).max(200),
  message: z.string().min(10).max(2000),
  type: z.enum(["general", "order_inquiry", "product_request"]).default("general"),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const limit = rateLimit(`contact:${ip}`, 3, 60_000);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const data = schema.parse(await request.json());
    await connectDB();
    await ContactSubmission.create(data);
    await sendContactNotification(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}
