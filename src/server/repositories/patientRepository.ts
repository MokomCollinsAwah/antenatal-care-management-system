import { type PipelineStage, Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { UserRole, UserStatus } from "@/lib/constants";
import HealthCentre from "@/models/HealthCentre";
import PatientProfile from "@/models/PatientProfile";
import User from "@/models/User";
import type {
  PatientListFilters,
  UserRole as UserRoleValue,
  UserStatus as UserStatusValue,
} from "@/types";

export interface PatientScope {
  role: UserRoleValue;
  userId: string;
  healthCentreId?: string;
}

export interface CreatePatientInput {
  fullName: string;
  phone: string;
  email?: string;
  passwordHash: string;
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
  createdById: string;
}

export interface UpdatePatientInput extends Omit<CreatePatientInput, "passwordHash" | "createdById"> {
  status?: UserStatusValue;
}

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const scopedPatientMatch = (
  scope: PatientScope,
  filters: PatientListFilters = {},
) => {
  const match: Record<string, unknown> = {};

  if (scope.role === UserRole.HEALTH_WORKER) {
    const conditions: Record<string, unknown>[] = [
      { assignedHealthWorkerId: new Types.ObjectId(scope.userId) },
    ];
    if (scope.healthCentreId) {
      conditions.push({
        healthCentreId: new Types.ObjectId(scope.healthCentreId),
      });
    }
    match.$or = conditions;
  }

  if (filters.healthCentreId) {
    match.healthCentreId = new Types.ObjectId(filters.healthCentreId);
  }
  if (filters.assignedHealthWorkerId) {
    match.assignedHealthWorkerId = new Types.ObjectId(
      filters.assignedHealthWorkerId,
    );
  }
  if (filters.expectedDeliveryDateFrom || filters.expectedDeliveryDateTo) {
    match.expectedDeliveryDate = {
      ...(filters.expectedDeliveryDateFrom
        ? { $gte: new Date(filters.expectedDeliveryDateFrom) }
        : {}),
      ...(filters.expectedDeliveryDateTo
        ? { $lte: new Date(filters.expectedDeliveryDateTo) }
        : {}),
    };
  }

  return match;
};

const patientAggregation = (
  match: Record<string, unknown>,
  search?: string,
) => {
  const pipeline: PipelineStage[] = [
    { $match: match },
    {
      $lookup: {
        from: User.collection.name,
        localField: "userId",
        foreignField: "_id",
        as: "patientUser",
      },
    },
    { $unwind: "$patientUser" },
    {
      $lookup: {
        from: HealthCentre.collection.name,
        localField: "healthCentreId",
        foreignField: "_id",
        as: "healthCentre",
      },
    },
    { $unwind: "$healthCentre" },
    {
      $lookup: {
        from: User.collection.name,
        localField: "assignedHealthWorkerId",
        foreignField: "_id",
        as: "assignedHealthWorker",
      },
    },
    { $unwind: "$assignedHealthWorker" },
  ];

  if (search) {
    const regex = new RegExp(escapeRegex(search.trim()), "i");
    pipeline.push({
      $match: {
        $or: [
          { "patientUser.fullName": regex },
          { "patientUser.phone": regex },
          { address: regex },
          { "healthCentre.name": regex },
        ],
      },
    });
  }

  pipeline.push(
    {
      $project: {
        passwordHash: 0,
        "patientUser.passwordHash": 0,
        "assignedHealthWorker.passwordHash": 0,
      },
    },
    { $sort: { createdAt: -1 } },
  );

  return pipeline;
};

export async function findPatients(
  scope: PatientScope,
  filters: PatientListFilters,
) {
  await connectDB();
  return PatientProfile.aggregate(patientAggregation(scopedPatientMatch(scope, filters), filters.search));
}

export async function findPatientById(id: string, scope: PatientScope) {
  await connectDB();
  const match = { ...scopedPatientMatch(scope), _id: new Types.ObjectId(id) };
  const patients = await PatientProfile.aggregate(patientAggregation(match));
  return patients[0] ?? null;
}

export async function findPatientByUserId(userId: string) {
  await connectDB();
  const patients = await PatientProfile.aggregate(
    patientAggregation({ userId: new Types.ObjectId(userId) }),
  );
  return patients[0] ?? null;
}

export async function findPatientProfileByUserId(userId: string) {
  await connectDB();
  return PatientProfile.findOne({ userId }).select("_id").lean();
}

export async function findPregnantWomanConflict(
  phone: string,
  email?: string,
  excludeUserId?: string,
) {
  await connectDB();
  const conditions: Record<string, unknown>[] = [{ phone }];
  if (email) {
    conditions.push({ email: email.toLowerCase() });
  }
  const query: Record<string, unknown> = { $or: conditions };
  if (excludeUserId) {
    query._id = { $ne: new Types.ObjectId(excludeUserId) };
  }
  return User.findOne(query).select("_id phone email").lean();
}

export async function findHealthWorkerForAssignment(id: string) {
  await connectDB();
  return User.findOne({ _id: id, role: UserRole.HEALTH_WORKER })
    .select("_id fullName healthCentreId")
    .lean();
}

export async function findHealthWorkerOptions(healthCentreId?: string) {
  await connectDB();
  return User.find({
    role: UserRole.HEALTH_WORKER,
    ...(healthCentreId ? { healthCentreId } : {}),
  })
    .select("_id fullName phone healthCentreId")
    .sort({ fullName: 1 })
    .lean();
}

export async function createPatientWithProfile(input: CreatePatientInput) {
  await connectDB();
  const user = await User.create({
    fullName: input.fullName,
    phone: input.phone,
    email: input.email || undefined,
    passwordHash: input.passwordHash,
    role: UserRole.PREGNANT_WOMAN,
    status: UserStatus.ACTIVE,
    healthCentreId: new Types.ObjectId(input.healthCentreId),
    createdById: new Types.ObjectId(input.createdById),
  });

  try {
    const profile = await PatientProfile.create({
      userId: user._id,
      age: input.age,
      address: input.address,
      emergencyContactName: input.emergencyContactName || undefined,
      emergencyContactPhone: input.emergencyContactPhone || undefined,
      healthCentreId: new Types.ObjectId(input.healthCentreId),
      assignedHealthWorkerId: new Types.ObjectId(input.assignedHealthWorkerId),
      lastMenstrualPeriod: input.lastMenstrualPeriod,
      expectedDeliveryDate: input.expectedDeliveryDate,
      gravidity: input.gravidity,
      parity: input.parity,
      bloodGroup: input.bloodGroup || undefined,
      riskNote: input.riskNote || undefined,
    });
    return { user, profile };
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    throw error;
  }
}

export async function updatePatientWithProfile(
  profileId: string,
  userId: string,
  input: UpdatePatientInput,
) {
  await connectDB();
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        fullName: input.fullName,
        phone: input.phone,
        ...(input.email ? { email: input.email } : {}),
        ...(input.status ? { status: input.status } : {}),
        healthCentreId: new Types.ObjectId(input.healthCentreId),
      },
      ...(input.email ? {} : { $unset: { email: 1 } }),
    },
    { returnDocument: "after" },
  );
  const profile = await PatientProfile.findByIdAndUpdate(
    profileId,
    {
      $set: {
        age: input.age,
        address: input.address,
        emergencyContactName: input.emergencyContactName || undefined,
        emergencyContactPhone: input.emergencyContactPhone || undefined,
        healthCentreId: new Types.ObjectId(input.healthCentreId),
        assignedHealthWorkerId: new Types.ObjectId(input.assignedHealthWorkerId),
        lastMenstrualPeriod: input.lastMenstrualPeriod,
        expectedDeliveryDate: input.expectedDeliveryDate,
        gravidity: input.gravidity,
        parity: input.parity,
        bloodGroup: input.bloodGroup || undefined,
        riskNote: input.riskNote || undefined,
      },
    },
    { returnDocument: "after" },
  );
  return { user, profile };
}
