import { AppointmentType } from "@/lib/constants";
import { createAppointment } from "@/server/repositories/appointmentRepository";
import { createVisit, findVisits } from "@/server/repositories/visitRepository";
import { recordAdminAudit } from "@/server/services/auditLogService";
import { assertScheduled, getAppointmentForUser, setAppointmentAttended, type CurrentCareUser, buildScope } from "@/server/services/appointmentService";
import { serializeVisit, type VisitAggregate } from "@/server/services/appointmentMappers";
import type { VisitListFilters } from "@/types";

export async function listVisitsForUser(user: CurrentCareUser, filters: VisitListFilters) {
  const visits = (await findVisits(buildScope(user), filters)) as VisitAggregate[];
  return visits.map(serializeVisit);
}

export async function createVisitForAppointment(input: {
  appointmentId: string;
  patientId: string;
  visitDate: Date;
  weightKg?: number;
  systolicBP?: number;
  diastolicBP?: number;
  complaint?: string;
  advice?: string;
  notes?: string;
  nextAppointmentDate?: Date;
}, user: CurrentCareUser) {
  const appointment = await getAppointmentForUser(input.appointmentId, user);
  assertScheduled(appointment);
  if (appointment.patientId !== input.patientId) {
    throw new Error("Appointment patient mismatch.");
  }

  const visit = (await createVisit({
    ...input,
    complaint: input.complaint?.trim() || undefined,
    advice: input.advice?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    recordedById: user.id,
  })) as { id: string };
  await setAppointmentAttended(input.appointmentId);
  await recordAdminAudit({
    actorId: user.id,
    action: "VISIT_CREATED",
    entityType: "VisitRecord",
    entityId: visit.id,
    description: `Recorded antenatal visit for ${appointment.patientName}.`,
  });
  await recordAdminAudit({
    actorId: user.id,
    action: "APPOINTMENT_MARKED_ATTENDED",
    entityType: "Appointment",
    entityId: input.appointmentId,
    description: `Marked appointment as attended for ${appointment.patientName}.`,
  });

  if (input.nextAppointmentDate) {
    const next = (await createAppointment({
      patientId: input.patientId,
      appointmentType: AppointmentType.ANTENATAL_VISIT,
      scheduledDateTime: input.nextAppointmentDate,
      reason: "Next antenatal visit",
      createdById: user.id,
    })) as { id: string };
    await recordAdminAudit({
      actorId: user.id,
      action: "NEXT_APPOINTMENT_CREATED",
      entityType: "Appointment",
      entityId: next.id,
      description: `Created next antenatal appointment for ${appointment.patientName}.`,
    });
  }

  return { id: visit.id, appointmentId: input.appointmentId };
}
