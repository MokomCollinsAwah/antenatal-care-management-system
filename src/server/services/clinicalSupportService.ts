import { Types } from "mongoose";
import {
  FollowUpMethod,
  FollowUpOutcome,
  ReminderStatus,
  ReminderType,
  SupplementStatus,
} from "@/lib/constants";
import {
  appointmentBelongsToPatient,
  createFollowUpRecord,
  createReminder,
  createScanRecord,
  createSupplementRecord,
  findFollowUps,
  findReminderById,
  findReminders,
  findScans,
  findSupplementById,
  findSupplements,
  updateReminderStatus,
  updateSupplementRecord,
} from "@/server/repositories/clinicalSupportRepository";
import { getPatientOptionsForAppointments, buildScope, type CurrentCareUser } from "@/server/services/appointmentService";
import { recordAdminAudit } from "@/server/services/auditLogService";
import { AdminServiceError } from "@/server/services/adminServiceError";
import type {
  ClinicalRecordFilters,
  FollowUpSummary,
  ReminderSummary,
  ScanSummary,
  SupplementSummary,
} from "@/types";

type AggregateRecord = {
  _id: Types.ObjectId;
  patientId: Types.ObjectId;
  patientUser: { fullName: string; phone: string };
  healthCentre: { _id: Types.ObjectId; name: string };
  recordedBy?: { fullName?: string };
  createdAt: Date;
  [key: string]: unknown;
};

function assertReminderTransition(currentStatus: ReminderStatus, nextStatus: ReminderStatus) {
  const allowed =
    (currentStatus === ReminderStatus.PENDING && [ReminderStatus.DUE, ReminderStatus.READ, ReminderStatus.DISMISSED].includes(nextStatus)) ||
    (currentStatus === ReminderStatus.DUE && [ReminderStatus.READ, ReminderStatus.DISMISSED].includes(nextStatus));
  if (!allowed) {
    throw new AdminServiceError("Invalid reminder status transition.", "INVALID_ROLE");
  }
}

function patientName(record: AggregateRecord) {
  return record.patientUser.fullName;
}

function serializeSupplement(record: AggregateRecord): SupplementSummary {
  return {
    id: record._id.toString(),
    patientId: record.patientId.toString(),
    patientName: patientName(record),
    patientPhone: record.patientUser.phone,
    healthCentreId: record.healthCentre._id.toString(),
    healthCentreName: record.healthCentre.name,
    supplementName: String(record.supplementName),
    dosage: String(record.dosage),
    frequency: String(record.frequency),
    startDate: (record.startDate as Date).toISOString(),
    endDate: (record.endDate as Date | undefined)?.toISOString(),
    instructions: record.instructions as string | undefined,
    status: record.status as SupplementStatus,
    recordedByName: record.recordedBy?.fullName ?? "—",
    createdAt: record.createdAt.toISOString(),
  };
}

async function assertPatientAllowed(patientId: string, user: CurrentCareUser) {
  if (!Types.ObjectId.isValid(patientId)) {
    throw new AdminServiceError("Patient not found.", "NOT_FOUND");
  }
  const patients = await getPatientOptionsForAppointments(user);
  const patient = patients.find((item) => item.value === patientId);
  if (!patient) throw new AdminServiceError("Patient not found.", "NOT_FOUND");
  return patient;
}

export async function listSupplements(user: CurrentCareUser, filters: ClinicalRecordFilters) {
  const records = (await findSupplements(buildScope(user), filters)) as AggregateRecord[];
  return records.map(serializeSupplement);
}

export async function getSupplementForUser(id: string, user: CurrentCareUser) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AdminServiceError("Supplement record not found.", "NOT_FOUND");
  }
  const record = (await findSupplementById(
    id,
    buildScope(user),
  )) as AggregateRecord | null;
  if (!record) {
    throw new AdminServiceError("Supplement record not found.", "NOT_FOUND");
  }
  return serializeSupplement(record);
}

export async function listScans(user: CurrentCareUser, filters: ClinicalRecordFilters) {
  const records = (await findScans(buildScope(user), filters)) as AggregateRecord[];
  return records.map((record): ScanSummary => ({
    id: record._id.toString(),
    patientId: record.patientId.toString(),
    patientName: patientName(record),
    patientPhone: record.patientUser.phone,
    healthCentreId: record.healthCentre._id.toString(),
    healthCentreName: record.healthCentre.name,
    scanDate: (record.scanDate as Date).toISOString(),
    scanType: String(record.scanType),
    resultNote: record.resultNote as string | undefined,
    nextScanDate: (record.nextScanDate as Date | undefined)?.toISOString(),
    recordedByName: record.recordedBy?.fullName ?? "—",
    createdAt: record.createdAt.toISOString(),
  }));
}

export async function listFollowUps(user: CurrentCareUser, filters: ClinicalRecordFilters) {
  const records = (await findFollowUps(buildScope(user), filters)) as AggregateRecord[];
  return records.map((record): FollowUpSummary => ({
    id: record._id.toString(),
    patientId: record.patientId.toString(),
    patientName: patientName(record),
    patientPhone: record.patientUser.phone,
    healthCentreId: record.healthCentre._id.toString(),
    healthCentreName: record.healthCentre.name,
    appointmentId: (record.appointmentId as Types.ObjectId | undefined)?.toString(),
    followUpDate: (record.followUpDate as Date).toISOString(),
    method: record.method as FollowUpMethod,
    outcome: record.outcome as FollowUpOutcome,
    notes: record.notes as string | undefined,
    followedByName: record.recordedBy?.fullName ?? "—",
    createdAt: record.createdAt.toISOString(),
  }));
}

export async function listReminders(user: CurrentCareUser, filters: ClinicalRecordFilters) {
  const records = (await findReminders(buildScope(user), filters)) as AggregateRecord[];
  return records.map((record): ReminderSummary => ({
    id: record._id.toString(),
    patientId: record.patientId.toString(),
    patientName: patientName(record),
    patientPhone: record.patientUser.phone,
    healthCentreId: record.healthCentre._id.toString(),
    healthCentreName: record.healthCentre.name,
    title: String(record.title),
    message: String(record.message),
    reminderType: record.reminderType as ReminderType,
    dueDateTime: (record.dueDateTime as Date).toISOString(),
    status: record.status as ReminderStatus,
    createdAt: record.createdAt.toISOString(),
  }));
}

export async function createSupplement(input: {
  patientId: string;
  supplementName: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  instructions?: string;
  status: SupplementStatus;
}, user: CurrentCareUser) {
  const patient = await assertPatientAllowed(input.patientId, user);
  const supplement = await createSupplementRecord({
    ...input,
    supplementName: input.supplementName.trim(),
    dosage: input.dosage.trim(),
    frequency: input.frequency.trim(),
    instructions: input.instructions?.trim() || undefined,
    patientId: new Types.ObjectId(input.patientId),
    recordedById: new Types.ObjectId(user.id),
  }) as { id: string };
  await createReminder({
    patientId: new Types.ObjectId(input.patientId),
    supplementId: new Types.ObjectId(supplement.id),
    title: "Supplement Reminder",
    message: `Take ${input.supplementName} - ${input.dosage}, ${input.frequency}.${input.instructions ? ` ${input.instructions}` : ""}`,
    reminderType: ReminderType.SUPPLEMENT,
    dueDateTime: input.startDate,
    status: ReminderStatus.PENDING,
  });
  await recordAdminAudit({ actorId: user.id, action: "SUPPLEMENT_CREATED", entityType: "SupplementRecord", entityId: supplement.id, description: `Created supplement record for ${patient.label}.` });
  return { id: supplement.id };
}

export async function updateSupplement(
  id: string,
  input: {
    patientId: string;
    supplementName: string;
    dosage: string;
    frequency: string;
    startDate: Date;
    endDate: Date;
    instructions?: string;
    status: SupplementStatus;
  },
  user: CurrentCareUser,
) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AdminServiceError("Supplement record not found.", "NOT_FOUND");
  }
  const existing = await getSupplementForUser(id, user);
  const patient = await assertPatientAllowed(input.patientId, user);
  const supplement = await updateSupplementRecord(id, {
    patientId: new Types.ObjectId(input.patientId),
    supplementName: input.supplementName.trim(),
    dosage: input.dosage.trim(),
    frequency: input.frequency.trim(),
    startDate: input.startDate,
    endDate: input.endDate,
    instructions: input.instructions?.trim() || undefined,
    status: input.status,
  });
  if (!supplement) {
    throw new AdminServiceError("Supplement record not found.", "NOT_FOUND");
  }
  await recordAdminAudit({
    actorId: user.id,
    action: "SUPPLEMENT_UPDATED",
    entityType: "SupplementRecord",
    entityId: id,
    description: `Updated supplement record for ${patient.label}.`,
  });
  return { id: existing.id };
}

export async function createScan(input: {
  patientId: string;
  scanDate: Date;
  scanType: string;
  healthCentreId?: string;
  resultNote?: string;
  nextScanDate?: Date;
}, user: CurrentCareUser) {
  const patient = await assertPatientAllowed(input.patientId, user);
  const scan = await createScanRecord({
    patientId: new Types.ObjectId(input.patientId),
    scanDate: input.scanDate,
    scanType: input.scanType.trim(),
    healthCentreId: input.healthCentreId ? new Types.ObjectId(input.healthCentreId) : new Types.ObjectId(patient.healthCentreId),
    resultNote: input.resultNote?.trim() || undefined,
    nextScanDate: input.nextScanDate,
    recordedById: new Types.ObjectId(user.id),
  }) as { id: string };
  if (input.nextScanDate) {
    await createReminder({
      patientId: new Types.ObjectId(input.patientId),
      scanId: new Types.ObjectId(scan.id),
      title: "Scan Reminder",
      message: `You have an upcoming scan scheduled on ${input.nextScanDate.toDateString()}.`,
      reminderType: ReminderType.SCAN,
      dueDateTime: input.nextScanDate,
      status: ReminderStatus.PENDING,
    });
  }
  await recordAdminAudit({ actorId: user.id, action: "SCAN_CREATED", entityType: "ScanRecord", entityId: scan.id, description: `Recorded scan information for ${patient.label}.` });
  return { id: scan.id };
}

export async function createFollowUp(input: {
  patientId: string;
  appointmentId?: string;
  followUpDate: Date;
  method: FollowUpMethod;
  outcome: FollowUpOutcome;
  notes?: string;
}, user: CurrentCareUser) {
  const patient = await assertPatientAllowed(input.patientId, user);
  if (input.appointmentId) {
    const ok = await appointmentBelongsToPatient(input.appointmentId, input.patientId);
    if (!ok) throw new AdminServiceError("Appointment does not belong to the selected patient.", "INVALID_ID");
  }
  const followUp = await createFollowUpRecord({
    patientId: new Types.ObjectId(input.patientId),
    appointmentId: input.appointmentId ? new Types.ObjectId(input.appointmentId) : undefined,
    followUpDate: input.followUpDate,
    method: input.method,
    outcome: input.outcome,
    notes: input.notes?.trim() || undefined,
    followedById: new Types.ObjectId(user.id),
  }) as { id: string };
  await recordAdminAudit({ actorId: user.id, action: "FOLLOW_UP_CREATED", entityType: "FollowUpRecord", entityId: followUp.id, description: `Created follow-up record for ${patient.label}.` });
  return { id: followUp.id };
}

export async function changeReminderStatus(reminderId: string, status: ReminderStatus, user: CurrentCareUser) {
  if (!Types.ObjectId.isValid(reminderId)) throw new AdminServiceError("Reminder not found.", "NOT_FOUND");
  const existing = await findReminderById(reminderId, buildScope(user)) as AggregateRecord | null;
  if (!existing) throw new AdminServiceError("Reminder not found.", "NOT_FOUND");
  assertReminderTransition(existing.status as ReminderStatus, status);
  const reminder = await updateReminderStatus(reminderId, status);
  await recordAdminAudit({ actorId: user.id, action: "REMINDER_STATUS_UPDATED", entityType: "Reminder", entityId: reminderId, description: `Updated reminder status for ${existing.patientUser.fullName}.` });
  return { id: reminder?.id ?? reminderId };
}

export async function changePatientReminderStatus(
  reminderId: string,
  status: ReminderStatus,
  patientId: string,
  actorId: string,
) {
  if (!Types.ObjectId.isValid(reminderId) || !Types.ObjectId.isValid(patientId)) {
    throw new AdminServiceError("Reminder not found.", "NOT_FOUND");
  }
  if (status !== ReminderStatus.READ && status !== ReminderStatus.DISMISSED) {
    throw new AdminServiceError("Invalid reminder status transition.", "INVALID_ROLE");
  }
  const existing = await findReminderById(reminderId, {
    role: "ADMIN",
    userId: "portal",
  }) as AggregateRecord | null;
  if (!existing || existing.patientId.toString() !== patientId) {
    throw new AdminServiceError("Reminder not found.", "NOT_FOUND");
  }
  assertReminderTransition(existing.status as ReminderStatus, status);
  const reminder = await updateReminderStatus(reminderId, status);
  await recordAdminAudit({ actorId, action: "REMINDER_STATUS_UPDATED", entityType: "Reminder", entityId: reminderId, description: `Updated reminder status for ${existing.patientUser.fullName}.` });
  return { id: reminder?.id ?? reminderId };
}
