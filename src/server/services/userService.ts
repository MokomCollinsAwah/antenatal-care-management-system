import { Types } from "mongoose";
import {
  DEFAULT_TEMPORARY_PASSWORD,
  UserRole,
  UserStatus,
} from "@/lib/constants";
import { hashPassword } from "@/lib/password";
import { healthCentreExists } from "@/server/repositories/healthCentreRepository";
import {
  createHealthWorker,
  findUserById,
  findUserConflict,
  findUsers,
  updateHealthWorker,
  updateUserPassword,
  updateUserStatus,
  type UserListFilters,
} from "@/server/repositories/userRepository";
import { recordAdminAudit } from "@/server/services/auditLogService";
import { AdminServiceError } from "@/server/services/adminServiceError";
import type { AdminUserSummary, UserStatus as UserStatusValue } from "@/types";

interface CreateHealthWorkerServiceInput {
  fullName: string;
  phone: string;
  email?: string;
  healthCentreId: string;
}

interface UpdateHealthWorkerServiceInput {
  fullName: string;
  phone: string;
  email?: string;
  healthCentreId: string;
  status: UserStatusValue;
}

const serializeUser = (user: {
  _id: Types.ObjectId;
  fullName: string;
  phone: string;
  email?: string;
  role: AdminUserSummary["role"];
  status: AdminUserSummary["status"];
  healthCentreId?: Types.ObjectId;
  healthCentreName?: string;
  createdAt: Date;
  updatedAt: Date;
}): AdminUserSummary => ({
  id: user._id.toString(),
  fullName: user.fullName,
  phone: user.phone,
  email: user.email,
  role: user.role,
  status: user.status,
  healthCentreId: user.healthCentreId?.toString(),
  healthCentreName: user.healthCentreName,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

export async function listUsers(filters: UserListFilters) {
  const users = await findUsers(filters);
  return users.map(serializeUser);
}

export async function getUser(id: string) {
  assertObjectId(id);
  const user = await findUserById(id);
  if (!user) {
    throw new AdminServiceError("User not found.", "NOT_FOUND");
  }
  return serializeUser(user);
}

export async function createHealthWorkerRecord(
  input: CreateHealthWorkerServiceInput,
  actorId: string,
) {
  await assertHealthCentre(input.healthCentreId);
  await assertNoUserConflict(input.phone, input.email);

  const user = await createHealthWorker({
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    email: normalizeEmail(input.email),
    passwordHash: await hashPassword(DEFAULT_TEMPORARY_PASSWORD),
    mustChangePassword: true,
    healthCentreId: input.healthCentreId,
    createdById: actorId,
  });

  await recordAdminAudit({
    actorId,
    action: "HEALTH_WORKER_CREATED",
    entityType: "User",
    entityId: user.id,
    description: `Created health worker account for ${user.fullName}`,
  });

  return { id: user.id };
}

export async function updateHealthWorkerRecord(
  id: string,
  input: UpdateHealthWorkerServiceInput,
  actorId: string,
) {
  assertObjectId(id);
  const existing = await getUser(id);
  assertHealthWorker(existing.role);
  await assertHealthCentre(input.healthCentreId);
  await assertNoUserConflict(input.phone, input.email, id);

  const user = await updateHealthWorker(id, {
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    email: normalizeEmail(input.email),
    healthCentreId: input.healthCentreId,
    status: input.status,
  });

  if (!user) {
    throw new AdminServiceError("Health worker not found.", "NOT_FOUND");
  }

  await recordAdminAudit({
    actorId,
    action: "HEALTH_WORKER_UPDATED",
    entityType: "User",
    entityId: user.id,
    description: `Updated health worker account for ${user.fullName}`,
  });

  if (existing.status !== input.status) {
    await recordStatusChange(actorId, user.id, user.fullName, input.status);
  }

  return { id: user.id };
}

export async function changeHealthWorkerStatus(
  id: string,
  status: UserStatusValue,
  actorId: string,
) {
  assertObjectId(id);
  const existing = await getUser(id);
  assertHealthWorker(existing.role);

  const user = await updateUserStatus(id, status);
  if (!user) {
    throw new AdminServiceError("Health worker not found.", "NOT_FOUND");
  }

  await recordStatusChange(actorId, user.id, user.fullName, status);
  return { id: user.id };
}

export async function resetHealthWorkerPassword(
  id: string,
  actorId: string,
) {
  assertObjectId(id);
  const existing = await getUser(id);
  assertHealthWorker(existing.role);

  const user = await updateUserPassword(
    id,
    await hashPassword(DEFAULT_TEMPORARY_PASSWORD),
    true,
  );
  if (!user) {
    throw new AdminServiceError("Health worker not found.", "NOT_FOUND");
  }

  await recordAdminAudit({
    actorId,
    action: "PASSWORD_RESET",
    entityType: "User",
    entityId: user.id,
    description: `Reset password for health worker ${user.fullName}`,
  });

  return { id: user.id };
}

async function assertNoUserConflict(
  phone: string,
  email?: string,
  excludeId?: string,
) {
  const normalizedEmail = normalizeEmail(email);
  const conflict = await findUserConflict(
    phone.trim(),
    normalizedEmail,
    excludeId,
  );

  if (conflict?.phone === phone.trim()) {
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
      "A user with this email address already exists.",
      "DUPLICATE",
    );
  }
}

async function assertHealthCentre(id: string) {
  if (!Types.ObjectId.isValid(id) || !(await healthCentreExists(id))) {
    throw new AdminServiceError("Selected health centre was not found.", "NOT_FOUND");
  }
}

function assertObjectId(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AdminServiceError("Invalid user id.", "INVALID_ID");
  }
}

function assertHealthWorker(role: AdminUserSummary["role"]) {
  if (role !== UserRole.HEALTH_WORKER) {
    throw new AdminServiceError(
      "Only health worker accounts can be changed here.",
      "INVALID_ROLE",
    );
  }
}

function normalizeEmail(email?: string) {
  return email?.trim().toLowerCase() || undefined;
}

async function recordStatusChange(
  actorId: string,
  userId: string,
  fullName: string,
  status: UserStatusValue,
) {
  const action =
    status === UserStatus.ACTIVE ? "USER_ACTIVATED" : "USER_SUSPENDED";
  await recordAdminAudit({
    actorId,
    action,
    entityType: "User",
    entityId: userId,
    description: `${status === UserStatus.ACTIVE ? "Activated" : "Suspended"} health worker ${fullName}`,
  });
}
