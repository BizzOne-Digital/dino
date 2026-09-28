import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SiteSettings } from "@/models/SiteSettings";
import { requireAdmin, logAudit } from "@/lib/admin-auth";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  let settings = await SiteSettings.findOne();
  if (!settings) settings = await SiteSettings.create({});
  return NextResponse.json({ settings: JSON.parse(JSON.stringify(settings)) });
}

export async function PUT(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const data = await request.json();
    await connectDB();
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create(data);
    } else {
      Object.assign(settings, data);
      await settings.save();
    }
    await logAudit(session!.user.id, session!.user.email, "update", "settings");
    return NextResponse.json({ settings: JSON.parse(JSON.stringify(settings)) });
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
