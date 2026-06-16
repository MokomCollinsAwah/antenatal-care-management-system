import { createAuditLog } from "@/server/repositories/auditLogRepository";

export async function recordAdminAudit(input: {
  actorId: string;
  action: string;
  entityType: "HealthCentre" | "User" | "PatientProfile" | "Appointment" | "VisitRecord";
  entityId: string;
  description: string;
}) {
  await createAuditLog(input);
}
