import mongoose, { type Document, type Model, Schema, Types } from "mongoose";

export interface IAuditLog extends Document {
  actorId?: Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: string;
  description?: string;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  actorId: { type: Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true, trim: true },
  entityType: { type: String, required: true, trim: true },
  entityId: { type: String, trim: true },
  description: { type: String, trim: true },
  ipAddress: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
});

AuditLogSchema.index({ actorId: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ entityType: 1 });
AuditLogSchema.index({ createdAt: 1 });

const AuditLog =
  (mongoose.models.AuditLog as Model<IAuditLog> | undefined) ??
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

export default AuditLog;
