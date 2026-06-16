import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import AuditLog from "@/models/AuditLog";
import User from "@/models/User";
import type { AuditLogFilters } from "@/types";

interface CreateAuditLogInput {
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  ipAddress?: string;
}

export async function createAuditLog(input: CreateAuditLogInput) {
  await connectDB();

  return AuditLog.create({
    actorId: input.actorId ? new Types.ObjectId(input.actorId) : undefined,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    description: input.description,
    ipAddress: input.ipAddress,
  });
}

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function findAuditLogs(filters: AuditLogFilters) {
  await connectDB();
  const match: Record<string, unknown> = {};
  if (filters.action) match.action = filters.action;
  if (filters.entityType) match.entityType = filters.entityType;
  if (filters.startDate || filters.endDate) {
    match.createdAt = {
      ...(filters.startDate ? { $gte: new Date(filters.startDate) } : {}),
      ...(filters.endDate ? { $lte: new Date(filters.endDate) } : {}),
    };
  }
  const pipeline: Record<string, unknown>[] = [
    { $match: match },
    {
      $lookup: {
        from: User.collection.name,
        localField: "actorId",
        foreignField: "_id",
        as: "actor",
      },
    },
    { $unwind: { path: "$actor", preserveNullAndEmptyArrays: true } },
  ];
  if (filters.search) {
    const regex = new RegExp(escapeRegex(filters.search), "i");
    pipeline.push({
      $match: {
        $or: [{ description: regex }, { "actor.fullName": regex }],
      },
    });
  }
  pipeline.push(
    { $project: { "actor.passwordHash": 0 } },
    { $sort: { createdAt: -1 } },
    { $limit: 200 },
  );
  return AuditLog.aggregate(pipeline);
}
