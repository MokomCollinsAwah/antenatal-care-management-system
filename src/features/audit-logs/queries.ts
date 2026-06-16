import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@/lib/constants";
import { listAuditLogs } from "@/server/services/auditLogReadService";
import type { AuditLogFilters } from "@/types";

export async function getAuditLogs(filters: AuditLogFilters) {
  await requireRole([UserRole.ADMIN]);
  return listAuditLogs(filters);
}
