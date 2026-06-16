import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { UserRole, UserStatus } from "@/lib/constants";
import HealthCentre from "@/models/HealthCentre";
import User from "@/models/User";
import type { UserRole as UserRoleValue, UserStatus as UserStatusValue } from "@/types";

export interface UserListFilters {
  search?: string;
  role?: UserRoleValue;
  status?: UserStatusValue;
}

export interface CreateHealthWorkerInput {
  fullName: string;
  phone: string;
  email?: string;
  passwordHash: string;
  healthCentreId: string;
  createdById: string;
}

export interface UpdateHealthWorkerInput {
  fullName: string;
  phone: string;
  email?: string;
  healthCentreId: string;
  status: UserStatusValue;
}

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function findUsers(filters: UserListFilters) {
  await connectDB();

  const match: Record<string, unknown> = {};
  if (filters.role) {
    match.role = filters.role;
  }
  if (filters.status) {
    match.status = filters.status;
  }
  if (filters.search) {
    const search = new RegExp(escapeRegex(filters.search.trim()), "i");
    match.$or = [{ fullName: search }, { phone: search }, { email: search }];
  }

  return User.aggregate<{
    _id: Types.ObjectId;
    fullName: string;
    phone: string;
    email?: string;
    role: UserRoleValue;
    status: UserStatusValue;
    healthCentreId?: Types.ObjectId;
    healthCentreName?: string;
    createdAt: Date;
    updatedAt: Date;
  }>([
    { $match: match },
    {
      $lookup: {
        from: HealthCentre.collection.name,
        localField: "healthCentreId",
        foreignField: "_id",
        as: "healthCentre",
      },
    },
    {
      $addFields: {
        healthCentreName: { $arrayElemAt: ["$healthCentre.name", 0] },
      },
    },
    {
      $project: {
        passwordHash: 0,
        healthCentre: 0,
      },
    },
    { $sort: { createdAt: -1 } },
  ]);
}

export async function findUserById(id: string) {
  await connectDB();

  const users = await User.aggregate<{
    _id: Types.ObjectId;
    fullName: string;
    phone: string;
    email?: string;
    role: UserRoleValue;
    status: UserStatusValue;
    healthCentreId?: Types.ObjectId;
    healthCentreName?: string;
    createdAt: Date;
    updatedAt: Date;
  }>([
    { $match: { _id: new Types.ObjectId(id) } },
    {
      $lookup: {
        from: HealthCentre.collection.name,
        localField: "healthCentreId",
        foreignField: "_id",
        as: "healthCentre",
      },
    },
    {
      $addFields: {
        healthCentreName: { $arrayElemAt: ["$healthCentre.name", 0] },
      },
    },
    { $project: { passwordHash: 0, healthCentre: 0 } },
    { $limit: 1 },
  ]);

  return users[0] ?? null;
}

export async function findUserConflict(
  phone: string,
  email?: string,
  excludeId?: string,
) {
  await connectDB();

  const conditions: Record<string, unknown>[] = [{ phone }];
  if (email) {
    conditions.push({ email: email.toLowerCase() });
  }

  const query: Record<string, unknown> = { $or: conditions };
  if (excludeId) {
    query._id = { $ne: new Types.ObjectId(excludeId) };
  }

  return User.findOne(query).select("_id phone email").lean();
}

export async function createHealthWorker(input: CreateHealthWorkerInput) {
  await connectDB();

  return User.create({
    fullName: input.fullName,
    phone: input.phone,
    email: input.email || undefined,
    passwordHash: input.passwordHash,
    role: UserRole.HEALTH_WORKER,
    status: UserStatus.ACTIVE,
    healthCentreId: new Types.ObjectId(input.healthCentreId),
    createdById: new Types.ObjectId(input.createdById),
  });
}

export async function updateHealthWorker(
  id: string,
  input: UpdateHealthWorkerInput,
) {
  await connectDB();

  return User.findOneAndUpdate(
    { _id: id, role: UserRole.HEALTH_WORKER },
    {
      $set: {
        fullName: input.fullName,
        phone: input.phone,
        ...(input.email ? { email: input.email } : {}),
        healthCentreId: new Types.ObjectId(input.healthCentreId),
        status: input.status,
      },
      ...(input.email ? {} : { $unset: { email: 1 } }),
    },
    { new: true },
  );
}

export async function updateUserStatus(id: string, status: UserStatusValue) {
  await connectDB();
  return User.findOneAndUpdate(
    { _id: id, role: UserRole.HEALTH_WORKER },
    { $set: { status } },
    { new: true },
  );
}

export async function updateUserPassword(id: string, passwordHash: string) {
  await connectDB();
  return User.findOneAndUpdate(
    { _id: id, role: UserRole.HEALTH_WORKER },
    { $set: { passwordHash } },
    { new: true },
  );
}
