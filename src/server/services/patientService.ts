import { Types } from "mongoose";
import { UserRole } from "@/lib/constants";
import { hashPassword } from "@/lib/password";
import { healthCentreExists } from "@/server/repositories/healthCentreRepository";
import {
  createPatientWithProfile,
  findHealthWorkerForAssignment,
  findHealthWorkerOptions,
  findPatientById,
  findPatientByUserId,
  findPatientProfileByUserId,
  findPatients,
  findPregnantWomanConflict,
  updatePatientWithProfile,
  type PatientScope,
} from "@/server/repositories/patientRepository";
import { recordAdminAudit } from "@/server/services/auditLogService";
import { AdminServiceError } from "@/server/services/adminServiceError";
import type {
  HealthWorkerOption,
  PatientListFilters,
  PatientSummary,
  UserRole as UserRoleValue,
  UserStatus as UserStatusValue,
} from "@/types";

interface CurrentUserScope {
  id: string;
  role: UserRoleValue;
  healthCentreId?: string;
}

interface CreatePatientServiceInput {
  fullName: string;
  phone: string;
  email?: string;
  password: string;
  age: number;
  address: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  healthCentreId: string;
  assignedHealthWorkerId: string;
  lastMenstrualPeriod: Date;
  expectedDeliveryDate: Date;
  gravidity?: number;
  parity?: number;
  bloodGroup?: string;
  riskNote?: string;
}

interface UpdatePatientServiceInput
  extends Omit<CreatePatientServiceInput, "password"> {
  status?: UserStatusValue;
}

type PatientAggregate = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  age: number;
  address: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  healthCentreId: Types.ObjectId;
  assignedHealthWorkerId: Types.ObjectId;
  lastMenstrualPeriod: Date;
  expectedDeliveryDate: Date;
  gravidity?: number;
  parity?: number;
  bloodGroup?: string;
  riskNote?: string;
  createdAt: Date;
  updatedAt: Date;
  patientUser: {
    _id: Types.ObjectId;
    fullName: string;
    phone: string;
    email?: string;
    status: UserStatusValue;
  };
  healthCentre: { _id: Types.ObjectId; name: string };
  assignedHealthWorker: { _id: Types.ObjectId; fullName: string };
};

const serializePatient = (patient: PatientAggregate): PatientSummary => ({
  id: patient._id.toString(),
  userId: patient.userId.toString(),
  fullName: patient.patientUser.fullName,
  phone: patient.patientUser.phone,
  email: patient.patientUser.email,
  status: patient.patientUser.status,
  age: patient.age,
  address: patient.address,
  emergencyContactName: patient.emergencyContactName,
  emergencyContactPhone: patient.emergencyContactPhone,
  healthCentreId: patient.healthCentreId.toString(),
  healthCentreName: patient.healthCentre.name,
  assignedHealthWorkerId: patient.assignedHealthWorkerId.toString(),
  assignedHealthWorkerName: patient.assignedHealthWorker.fullName,
  lastMenstrualPeriod: patient.lastMenstrualPeriod.toISOString(),
  expectedDeliveryDate: patient.expectedDeliveryDate.toISOString(),
  gravidity: patient.gravidity,
  parity: patient.parity,
  bloodGroup: patient.bloodGroup,
  riskNote: patient.riskNote,
  createdAt: patient.createdAt.toISOString(),
  updatedAt: patient.updatedAt.toISOString(),
});

export async function listPatientsForUser(
  currentUser: CurrentUserScope,
  filters: PatientListFilters,
) {
  assertCareTeam(currentUser.role);
  const scope = buildScope(currentUser);
  const safeFilters = scopeFiltersForUser(currentUser, filters);
  const patients = (await findPatients(scope, safeFilters)) as PatientAggregate[];
  return patients.map(serializePatient);
}

export async function getPatientForUser(id: string, currentUser: CurrentUserScope) {
  assertObjectId(id);
  assertCareTeam(currentUser.role);
  const patient = (await findPatientById(
    id,
    buildScope(currentUser),
  )) as PatientAggregate | null;

  if (!patient) {
    throw new AdminServiceError("Patient profile not found.", "NOT_FOUND");
  }

  return serializePatient(patient);
}

export async function getPortalPatientProfile(userId: string) {
  assertObjectId(userId);
  const patient = (await findPatientByUserId(userId)) as PatientAggregate | null;
  return patient ? serializePatient(patient) : null;
}

export async function getHealthWorkerOptionsForUser(
  currentUser: CurrentUserScope,
): Promise<HealthWorkerOption[]> {
  assertCareTeam(currentUser.role);
  const workers = await findHealthWorkerOptions(
    currentUser.role === UserRole.HEALTH_WORKER
      ? currentUser.healthCentreId
      : undefined,
  );

  return workers.map((worker) => ({
    value: worker._id.toString(),
    label: `${worker.fullName} (${worker.phone})`,
    healthCentreId: worker.healthCentreId?.toString(),
  }));
}

export async function createPatientRecord(
  input: CreatePatientServiceInput,
  currentUser: CurrentUserScope,
) {
  assertCareTeam(currentUser.role);
  await assertAssignmentAllowed(input, currentUser);
  await assertNoPatientConflict(input.phone, input.email);

  const { profile } = await createPatientWithProfile({
    ...normalizePatient(input),
    passwordHash: await hashPassword(input.password),
    createdById: currentUser.id,
  });

  await recordAdminAudit({
    actorId: currentUser.id,
    action: "PATIENT_CREATED",
    entityType: "PatientProfile",
    entityId: profile.id,
    description: `Registered pregnant woman ${input.fullName.trim()}.`,
  });

  return { id: profile.id };
}

export async function updatePatientRecord(
  id: string,
  input: UpdatePatientServiceInput,
  currentUser: CurrentUserScope,
) {
  const patient = await getPatientForUser(id, currentUser);
  await assertAssignmentAllowed(input, currentUser);
  await assertNoPatientConflict(input.phone, input.email, patient.userId);

  const { profile } = await updatePatientWithProfile(
    id,
    patient.userId,
    normalizePatient(input),
  );

  if (!profile) {
    throw new AdminServiceError("Patient profile not found.", "NOT_FOUND");
  }

  await recordAdminAudit({
    actorId: currentUser.id,
    action: "PATIENT_UPDATED",
    entityType: "PatientProfile",
    entityId: profile.id,
    description: `Updated antenatal profile for ${input.fullName.trim()}.`,
  });

  return { id: profile.id };
}

async function assertAssignmentAllowed(
  input: Pick<
    CreatePatientServiceInput,
    "healthCentreId" | "assignedHealthWorkerId"
  >,
  currentUser: CurrentUserScope,
) {
  assertObjectId(input.healthCentreId);
  assertObjectId(input.assignedHealthWorkerId);

  if (!(await healthCentreExists(input.healthCentreId))) {
    throw new AdminServiceError("Invalid health centre selected.", "NOT_FOUND");
  }

  const worker = await findHealthWorkerForAssignment(
    input.assignedHealthWorkerId,
  );
  if (!worker) {
    throw new AdminServiceError("Invalid health worker selected.", "NOT_FOUND");
  }

  if (worker.healthCentreId?.toString() !== input.healthCentreId) {
    throw new AdminServiceError(
      "Selected health worker is not assigned to this health centre.",
      "INVALID_ROLE",
    );
  }

  if (currentUser.role === UserRole.HEALTH_WORKER) {
    if (!currentUser.healthCentreId) {
      throw new AdminServiceError(
        "Your account is not assigned to a health centre.",
        "INVALID_ROLE",
      );
    }
    if (
      input.healthCentreId !== currentUser.healthCentreId ||
      input.assignedHealthWorkerId !== currentUser.id
    ) {
      throw new AdminServiceError(
        "You can only manage patients assigned to your own account.",
        "INVALID_ROLE",
      );
    }
  }
}

async function assertNoPatientConflict(
  phone: string,
  email?: string,
  excludeUserId?: string,
) {
  const normalizedPhone = phone.trim();
  const normalizedEmail = normalizeEmail(email);
  const conflict = await findPregnantWomanConflict(
    normalizedPhone,
    normalizedEmail,
    excludeUserId,
  );

  if (conflict?.phone === normalizedPhone) {
    throw new AdminServiceError(
      "A user with this phone number already exists.",
      "DUPLICATE",
    );
  }
  if (
    normalizedEmail &&
    conflict?.email?.toLowerCase() === normalizedEmail
  ) {
    throw new AdminServiceError(
      "A user with this email already exists.",
      "DUPLICATE",
    );
  }

  if (!excludeUserId && conflict?._id) {
    const existingProfile = await findPatientProfileByUserId(
      conflict._id.toString(),
    );
    if (existingProfile) {
      throw new AdminServiceError(
        "This pregnant woman already has an antenatal profile.",
        "DUPLICATE",
      );
    }
  }
}

function buildScope(currentUser: CurrentUserScope): PatientScope {
  return {
    role: currentUser.role,
    userId: currentUser.id,
    healthCentreId: currentUser.healthCentreId,
  };
}

function scopeFiltersForUser(
  currentUser: CurrentUserScope,
  filters: PatientListFilters,
) {
  if (currentUser.role === UserRole.HEALTH_WORKER) {
    return {
      ...filters,
      healthCentreId: currentUser.healthCentreId,
      assignedHealthWorkerId: currentUser.id,
    };
  }

  return filters;
}

function normalizePatient<T extends CreatePatientServiceInput | UpdatePatientServiceInput>(
  input: T,
) {
  return {
    ...input,
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    email: normalizeEmail(input.email),
    address: input.address.trim(),
    emergencyContactName: input.emergencyContactName?.trim() || undefined,
    emergencyContactPhone: input.emergencyContactPhone?.trim() || undefined,
    bloodGroup: input.bloodGroup?.trim() || undefined,
    riskNote: input.riskNote?.trim() || undefined,
  };
}

function normalizeEmail(email?: string) {
  return email?.trim().toLowerCase() || undefined;
}

function assertCareTeam(role: UserRoleValue) {
  if (role !== UserRole.ADMIN && role !== UserRole.HEALTH_WORKER) {
    throw new AdminServiceError(
      "You are not authorized to perform this action.",
      "INVALID_ROLE",
    );
  }
}

function assertObjectId(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AdminServiceError("Invalid patient id.", "INVALID_ID");
  }
}
