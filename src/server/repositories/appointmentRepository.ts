import { type PipelineStage, Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { AppointmentStatus, AppointmentType, UserRole } from "@/lib/constants";
import Appointment from "@/models/Appointment";
import HealthCentre from "@/models/HealthCentre";
import PatientProfile from "@/models/PatientProfile";
import User from "@/models/User";
import VisitRecord from "@/models/VisitRecord";
import type {
  AppointmentListFilters,
} from "@/types";
import type { PatientScope } from "@/server/repositories/patientRepository";

export interface CreateAppointmentInput {
  patientId: string;
  appointmentType: AppointmentType;
  scheduledDateTime: Date;
  reason?: string;
  notes?: string;
  createdById: string;
}

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function scopedMatch(scope: PatientScope, filters: AppointmentListFilters = {}) {
  const match: Record<string, unknown> = {};
  if (filters.appointmentType) match.appointmentType = filters.appointmentType;
  if (filters.patientId) match.patientId = new Types.ObjectId(filters.patientId);
  if (filters.status) match.status = filters.status;
  if (filters.dateFrom || filters.dateTo) {
    match.scheduledDateTime = {
      ...(filters.dateFrom ? { $gte: new Date(filters.dateFrom) } : {}),
      ...(filters.dateTo ? { $lte: new Date(filters.dateTo) } : {}),
    };
  }

  const patientMatch: Record<string, unknown> = {};
  if (scope.role === UserRole.HEALTH_WORKER) {
    patientMatch.$or = [
      { assignedHealthWorkerId: new Types.ObjectId(scope.userId) },
      ...(scope.healthCentreId
        ? [{ healthCentreId: new Types.ObjectId(scope.healthCentreId) }]
        : []),
    ];
  }
  if (filters.healthCentreId) {
    patientMatch.healthCentreId = new Types.ObjectId(filters.healthCentreId);
  }

  return { match, patientMatch };
}

function appointmentPipeline(
  scope: PatientScope,
  filters: AppointmentListFilters = {},
  appointmentId?: string,
): PipelineStage[] {
  const { match, patientMatch } = scopedMatch(scope, filters);
  const pipeline: PipelineStage[] = [
    { $match: { ...match, ...(appointmentId ? { _id: new Types.ObjectId(appointmentId) } : {}) } },
    {
      $lookup: {
        from: PatientProfile.collection.name,
        localField: "patientId",
        foreignField: "_id",
        as: "patient",
      },
    },
    { $unwind: "$patient" },
    ...(Object.keys(patientMatch).length
      ? [{ $match: Object.fromEntries(Object.entries(patientMatch).map(([k, v]) => [`patient.${k}`, v])) } as PipelineStage]
      : []),
    {
      $lookup: {
        from: User.collection.name,
        localField: "patient.userId",
        foreignField: "_id",
        as: "patientUser",
      },
    },
    { $unwind: "$patientUser" },
    {
      $lookup: {
        from: HealthCentre.collection.name,
        localField: "patient.healthCentreId",
        foreignField: "_id",
        as: "healthCentre",
      },
    },
    { $unwind: "$healthCentre" },
    {
      $lookup: {
        from: User.collection.name,
        localField: "createdById",
        foreignField: "_id",
        as: "createdBy",
      },
    },
    { $unwind: "$createdBy" },
    {
      $lookup: {
        from: VisitRecord.collection.name,
        localField: "_id",
        foreignField: "appointmentId",
        as: "visit",
      },
    },
    { $addFields: { visit: { $arrayElemAt: ["$visit", 0] } } },
  ];

  if (filters.search) {
    const regex = new RegExp(escapeRegex(filters.search), "i");
    pipeline.push({
      $match: {
        $or: [{ "patientUser.fullName": regex }, { "patientUser.phone": regex }],
      },
    });
  }

  pipeline.push({ $project: { "patientUser.passwordHash": 0, "createdBy.passwordHash": 0 } });
  pipeline.push({ $sort: { scheduledDateTime: 1 } });
  return pipeline;
}

export async function findAppointments(scope: PatientScope, filters: AppointmentListFilters) {
  await connectDB();
  return Appointment.aggregate(appointmentPipeline(scope, filters));
}

export async function findAppointmentById(id: string, scope: PatientScope) {
  await connectDB();
  const appointments = await Appointment.aggregate(appointmentPipeline(scope, {}, id));
  return appointments[0] ?? null;
}

export async function createAppointment(input: CreateAppointmentInput) {
  await connectDB();
  return Appointment.create({
    patientId: new Types.ObjectId(input.patientId),
    appointmentType: input.appointmentType,
    scheduledDateTime: input.scheduledDateTime,
    reason: input.reason || undefined,
    notes: input.notes || undefined,
    createdById: new Types.ObjectId(input.createdById),
  });
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  await connectDB();
  return Appointment.findByIdAndUpdate(
    id,
    { $set: { status } },
    { returnDocument: "after" },
  );
}

export async function findPatientAppointmentOptions(scope: PatientScope) {
  await connectDB();
  const patientMatch: Record<string, unknown> = {};
  if (scope.role === UserRole.HEALTH_WORKER) {
    patientMatch.$or = [
      { assignedHealthWorkerId: new Types.ObjectId(scope.userId) },
      ...(scope.healthCentreId
        ? [{ healthCentreId: new Types.ObjectId(scope.healthCentreId) }]
        : []),
    ];
  }
  return PatientProfile.aggregate([
    { $match: patientMatch },
    {
      $lookup: {
        from: User.collection.name,
        localField: "userId",
        foreignField: "_id",
        as: "patientUser",
      },
    },
    { $unwind: "$patientUser" },
    { $project: { _id: 1, healthCentreId: 1, "patientUser.fullName": 1, "patientUser.phone": 1 } },
    { $sort: { "patientUser.fullName": 1 } },
  ]);
}

export { AppointmentStatus, AppointmentType };
