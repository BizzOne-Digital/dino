import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null };
  }
  return { error: null, session };
}

export async function logAudit(
  adminId: string,
  adminEmail: string,
  action: string,
  entity: string,
  entityId?: string,
  details?: string
) {
  const { connectDB } = await import("@/lib/db");
  const { AuditLog } = await import("@/models/AuditLog");
  await connectDB();
  await AuditLog.create({ adminId, adminEmail, action, entity, entityId, details });
}
