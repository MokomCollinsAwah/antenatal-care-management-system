import { Types } from "mongoose";
import { AppointmentStatus, AppointmentType, UserRole } from "@/lib/constants";
import {
  createAppointment,
  findAppointmentById,
  findAppointments,
  findPatientAppointmentOptions,
  updateAppointmentStatus,
} from "@/server/repositories/appointmentRepository";
import { recordAdminAudit } from "@/server/services/auditLogService";
import { AdminServiceError } from "@/server/services/adminServiceError";
import {
  serializeAppointment,
  type AppointmentAggregate,
} from "@/server/services/appointmentMappers";
import type {
  AppointmentListFilters,
  AppointmentSummary,
  PatientOption,
  UserRole as UserRoleValue,
} from "@/types";

export interface CurrentCareUser {
  id: string;
  role: UserRoleValue;
  healthCentreId?: string;
}

export function assertCareRole(role: UserRoleValue) {
  if (role !== UserRole.ADMIN && role !== UserRole.HEALTH_WORKER) {
    throw new AdminServiceError("You are not authorized to perform this action.", "INVALID_ROLE");
  }
}

export function buildScope(user: CurrentCareUser) {
  assertCareRole(user.role);
  return { role: user.role, userId: user.id, healthCentreId: user.healthCentreId };
}

export async function listAppointmentsForUser(user: CurrentCareUser, filters: AppointmentListFilters) {
  const appointments = (await findAppointments(buildScope(user), filters)) as AppointmentAggregate[];
  return appointments.map(serializeAppointment);
}

export async function getAppointmentForUser(id: string, user: CurrentCareUser): Promise<AppointmentSummary> {
  assertObjectId(id);
  const appointment = (await findAppointmentById(id, buildScope(user))) as AppointmentAggregate | null;
  if (!appointment) throw new AdminServiceError("Appointment not found.", "NOT_FOUND");
  return serializeAppointment(appointment);
}

export async function getPatientOptionsForAppointments(user: CurrentCareUser): Promise<PatientOption[]> {
  const patients = await findPatientAppointmentOptions(buildScope(user));
  return patients.map((patient) => ({
    value: patient._id.toString(),
    label: `${patient.patientUser.fullName} (${patient.patientUser.phone})`,
    phone: patient.patientUser.phone,
    healthCentreId: patient.healthCentreId.toString(),
  }));
}

export async function createAppointmentRecord(input: {
  patientId: string;
  appointmentType: AppointmentType;
  scheduledDateTime: Date;
  reason?: string;
  notes?: string;
}, user: CurrentCareUser) {
  assertObjectId(input.patientId);
  const allowedPatients = await getPatientOptionsForAppointments(user);
  const patient = allowedPatients.find((item) => item.value === input.patientId);
  if (!patient) throw new AdminServiceError("Patient not found.", "NOT_FOUND");

  const appointment = (await createAppointment({
    ...input,
    reason: input.reason?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    createdById: user.id,
  })) as { id: string };
  await recordAdminAudit({
    actorId: user.id,
    action: "APPOINTMENT_CREATED",
    entityType: "Appointment",
    entityId: appointment.id,
    description: `Scheduled ${input.appointmentType.replaceAll("_", " ").toLowerCase()} for ${patient.label}.`,
  });
  return { id: appointment.id };
}

export async function markAppointmentMissed(id: string, user: CurrentCareUser) {
  const appointment = await getAppointmentForUser(id, user);
  assertScheduled(appointment);
  await updateAppointmentStatus(id, AppointmentStatus.MISSED);
  await recordAdminAudit({
    actorId: user.id,
    action: "APPOINTMENT_MARKED_MISSED",
    entityType: "Appointment",
    entityId: id,
    description: `Marked appointment as missed for ${appointment.patientName}.`,
  });
  return { id };
}

export async function cancelAppointmentRecord(id: string, user: CurrentCareUser) {
  const appointment = await getAppointmentForUser(id, user);
  assertScheduled(appointment);
  await updateAppointmentStatus(id, AppointmentStatus.CANCELLED);
  await recordAdminAudit({
    actorId: user.id,
    action: "APPOINTMENT_CANCELLED",
    entityType: "Appointment",
    entityId: id,
    description: `Cancelled appointment for ${appointment.patientName}.`,
  });
  return { id };
}

export async function setAppointmentAttended(id: string) {
  return updateAppointmentStatus(id, AppointmentStatus.ATTENDED);
}

export function assertScheduled(appointment: AppointmentSummary) {
  if (appointment.status !== AppointmentStatus.SCHEDULED) {
    throw new AdminServiceError("Only scheduled appointments can be updated.", "INVALID_ROLE");
  }
}

function assertObjectId(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AdminServiceError("Invalid appointment id.", "INVALID_ID");
  }
}
