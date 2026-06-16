import { type PipelineStage, Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { UserRole } from "@/lib/constants";
import Appointment from "@/models/Appointment";
import HealthCentre from "@/models/HealthCentre";
import PatientProfile from "@/models/PatientProfile";
import User from "@/models/User";
import VisitRecord from "@/models/VisitRecord";
import type { VisitListFilters } from "@/types";
import type { PatientScope } from "@/server/repositories/patientRepository";

export interface CreateVisitInput {
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
  recordedById: string;
}

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function visitPipeline(scope: PatientScope, filters: VisitListFilters = {}): PipelineStage[] {
  const match: Record<string, unknown> = {};
  if (filters.patientId) match.patientId = new Types.ObjectId(filters.patientId);
  if (filters.dateFrom || filters.dateTo) {
    match.visitDate = {
      ...(filters.dateFrom ? { $gte: new Date(filters.dateFrom) } : {}),
      ...(filters.dateTo ? { $lte: new Date(filters.dateTo) } : {}),
    };
  }
  const patientMatch: Record<string, unknown> = {};
  if (scope.role === UserRole.HEALTH_WORKER) {
    patientMatch.$or = [
      { assignedHealthWorkerId: new Types.ObjectId(scope.userId) },
      ...(scope.healthCentreId ? [{ healthCentreId: new Types.ObjectId(scope.healthCentreId) }] : []),
    ];
  }
  if (filters.healthCentreId) patientMatch.healthCentreId = new Types.ObjectId(filters.healthCentreId);

  const pipeline: PipelineStage[] = [
    { $match: match },
    { $lookup: { from: PatientProfile.collection.name, localField: "patientId", foreignField: "_id", as: "patient" } },
    { $unwind: "$patient" },
    ...(Object.keys(patientMatch).length
      ? [{ $match: Object.fromEntries(Object.entries(patientMatch).map(([k, v]) => [`patient.${k}`, v])) } as PipelineStage]
      : []),
    { $lookup: { from: User.collection.name, localField: "patient.userId", foreignField: "_id", as: "patientUser" } },
    { $unwind: "$patientUser" },
    { $lookup: { from: HealthCentre.collection.name, localField: "patient.healthCentreId", foreignField: "_id", as: "healthCentre" } },
    { $unwind: "$healthCentre" },
    { $lookup: { from: Appointment.collection.name, localField: "appointmentId", foreignField: "_id", as: "appointment" } },
    { $unwind: "$appointment" },
    { $lookup: { from: User.collection.name, localField: "recordedById", foreignField: "_id", as: "recordedBy" } },
    { $unwind: "$recordedBy" },
  ];
  if (filters.search) {
    const regex = new RegExp(escapeRegex(filters.search), "i");
    pipeline.push({ $match: { $or: [{ "patientUser.fullName": regex }, { "patientUser.phone": regex }] } });
  }
  pipeline.push({ $project: { "patientUser.passwordHash": 0, "recordedBy.passwordHash": 0 } });
  pipeline.push({ $sort: { visitDate: -1 } });
  return pipeline;
}

export async function findVisits(scope: PatientScope, filters: VisitListFilters) {
  await connectDB();
  return VisitRecord.aggregate(visitPipeline(scope, filters));
}

export async function createVisit(input: CreateVisitInput) {
  await connectDB();
  return VisitRecord.create({
    appointmentId: new Types.ObjectId(input.appointmentId),
    patientId: new Types.ObjectId(input.patientId),
    visitDate: input.visitDate,
    weightKg: input.weightKg,
    systolicBP: input.systolicBP,
    diastolicBP: input.diastolicBP,
    complaint: input.complaint || undefined,
    advice: input.advice || undefined,
    notes: input.notes || undefined,
    nextAppointmentDate: input.nextAppointmentDate,
    recordedById: new Types.ObjectId(input.recordedById),
  });
}
