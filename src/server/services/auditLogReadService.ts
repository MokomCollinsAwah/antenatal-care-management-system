import { findAuditLogs } from "@/server/repositories/auditLogRepository";
import type { AuditLogFilters, AuditLogSummary } from "@/types";

type AuditLogAggregate = {
  _id: { toString(): string };
  actor?: { fullName?: string };
  action: string;
  entityType: string;
  entityId?: string;
  description?: string;
  ipAddress?: string;
  createdAt: Date;
};

export async function listAuditLogs(filters: AuditLogFilters): Promise<AuditLogSummary[]> {
  const logs = (await findAuditLogs(filters)) as AuditLogAggregate[];
  return logs.map((log) => ({
    id: log._id.toString(),
    actorName: log.actor?.fullName ?? "System",
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    description: log.description,
    ipAddress: log.ipAddress,
    createdAt: log.createdAt.toISOString(),
  }));
}
