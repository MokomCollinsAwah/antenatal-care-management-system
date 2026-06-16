import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import AuditLog from "@/models/AuditLog";

interface CreateAuditLogInput {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
}

export async function createAuditLog(input: CreateAuditLogInput) {
  await connectDB();

  return AuditLog.create({
    actorId: new Types.ObjectId(input.actorId),
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    description: input.description,
  });
}
