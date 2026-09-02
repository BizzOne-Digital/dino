import mongoose, { Schema, type Model } from "mongoose";

export interface IAuditLog {
  _id: mongoose.Types.ObjectId;
  adminId: mongoose.Types.ObjectId;
  adminEmail: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    adminEmail: { type: String, required: true },
    action: { type: String, required: true, index: true },
    entity: { type: String, required: true },
    entityId: String,
    details: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog ?? mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
