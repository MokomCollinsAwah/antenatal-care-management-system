import { type PipelineStage, Types } from "mongoose";
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

function parseStartOfDay(value: string) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function parseEndOfDay(value: string) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

export async function findAuditLogs(filters: AuditLogFilters) {
  await connectDB();
  const match: Record<string, unknown> = {};
  if (filters.action) match.action = filters.action;
  if (filters.entityType) match.entityType = filters.entityType;
  if (filters.startDate || filters.endDate) {
    match.createdAt = {
      ...(filters.startDate ? { $gte: parseStartOfDay(filters.startDate) } : {}),
      ...(filters.endDate ? { $lte: parseEndOfDay(filters.endDate) } : {}),
    };
  }
  const pipeline: PipelineStage[] = [
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
  );
  return AuditLog.aggregate(pipeline);
}
