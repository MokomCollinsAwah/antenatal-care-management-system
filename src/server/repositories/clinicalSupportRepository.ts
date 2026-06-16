import { type PipelineStage, Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { UserRole } from "@/lib/constants";
import Appointment from "@/models/Appointment";
import FollowUpRecord from "@/models/FollowUpRecord";
import HealthCentre from "@/models/HealthCentre";
import PatientProfile from "@/models/PatientProfile";
import Reminder from "@/models/Reminder";
import ScanRecord from "@/models/ScanRecord";
import SupplementRecord from "@/models/SupplementRecord";
import User from "@/models/User";
import type { ClinicalRecordFilters } from "@/types";
import type { PatientScope } from "@/server/repositories/patientRepository";

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const emptyObjectId = new Types.ObjectId("000000000000000000000000");
const objectIdOrEmpty = (value: string) =>
  Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : emptyObjectId;

function patientScopeMatch(scope: PatientScope, filters: ClinicalRecordFilters) {
  const patientMatch: Record<string, unknown> = {};
  if (scope.role === UserRole.HEALTH_WORKER) {
    patientMatch.$or = [
      { assignedHealthWorkerId: new Types.ObjectId(scope.userId) },
      ...(scope.healthCentreId
        ? [{ healthCentreId: new Types.ObjectId(scope.healthCentreId) }]
        : []),
    ];
  }
  if (filters.patientId) patientMatch._id = objectIdOrEmpty(filters.patientId);
  if (filters.healthCentreId) {
    patientMatch.healthCentreId = objectIdOrEmpty(filters.healthCentreId);
  }
  return patientMatch;
}

function basePipeline(
  scope: PatientScope,
  filters: ClinicalRecordFilters,
  recordedByField: string,
): PipelineStage[] {
  const patientMatch = patientScopeMatch(scope, filters);
  const pipeline: PipelineStage[] = [
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
      ? [
          {
            $match: Object.fromEntries(
              Object.entries(patientMatch).map(([key, value]) => [
                `patient.${key}`,
                value,
              ]),
            ),
          } as PipelineStage,
        ]
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
        localField: recordedByField,
        foreignField: "_id",
        as: "recordedBy",
      },
    },
    { $unwind: { path: "$recordedBy", preserveNullAndEmptyArrays: true } },
  ];

  if (filters.search) {
    const regex = new RegExp(escapeRegex(filters.search), "i");
    pipeline.push({
      $match: {
        $or: [{ "patientUser.fullName": regex }, { "patientUser.phone": regex }],
      },
    });
  }

  pipeline.push({
    $project: {
      "patientUser.passwordHash": 0,
      "recordedBy.passwordHash": 0,
    },
  });
  pipeline.push({ $sort: { createdAt: -1 } });
  return pipeline;
}

type AggregateModel = {
  aggregate: (pipeline: PipelineStage[]) => Promise<unknown[]>;
};

async function aggregateRecords(
  model: AggregateModel,
  scope: PatientScope,
  filters: ClinicalRecordFilters,
  recordedByField: string,
  ownMatch: Record<string, unknown>,
) {
  await connectDB();
  return model.aggregate([
    ...(Object.keys(ownMatch).length ? [{ $match: ownMatch }] : []),
    ...basePipeline(scope, filters, recordedByField),
  ]);
}

export async function findSupplements(scope: PatientScope, filters: ClinicalRecordFilters) {
  return aggregateRecords(
    SupplementRecord,
    scope,
    filters,
    "recordedById",
    filters.status ? { status: filters.status } : {},
  );
}

export async function findScans(scope: PatientScope, filters: ClinicalRecordFilters) {
  const match: Record<string, unknown> = {};
  if (filters.dateFrom || filters.dateTo) {
    match.scanDate = {
      ...(filters.dateFrom ? { $gte: new Date(filters.dateFrom) } : {}),
      ...(filters.dateTo ? { $lte: new Date(filters.dateTo) } : {}),
    };
  }
  return aggregateRecords(ScanRecord, scope, filters, "recordedById", match);
}

export async function findFollowUps(scope: PatientScope, filters: ClinicalRecordFilters) {
  return aggregateRecords(FollowUpRecord, scope, filters, "followedById", {
    ...(filters.method ? { method: filters.method } : {}),
    ...(filters.outcome ? { outcome: filters.outcome } : {}),
  });
}

export async function findReminders(scope: PatientScope, filters: ClinicalRecordFilters) {
  return aggregateRecords(Reminder, scope, filters, "_id", {
    ...(filters.type ? { reminderType: filters.type } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.dateFrom || filters.dateTo
      ? {
          dueDateTime: {
            ...(filters.dateFrom ? { $gte: new Date(filters.dateFrom) } : {}),
            ...(filters.dateTo ? { $lte: new Date(filters.dateTo) } : {}),
          },
        }
      : {}),
  });
}

export async function createSupplementRecord(input: Record<string, unknown>) {
  await connectDB();
  return SupplementRecord.create(input);
}

export async function createScanRecord(input: Record<string, unknown>) {
  await connectDB();
  return ScanRecord.create(input);
}

export async function createFollowUpRecord(input: Record<string, unknown>) {
  await connectDB();
  return FollowUpRecord.create(input);
}

export async function createReminder(input: Record<string, unknown>) {
  await connectDB();
  return Reminder.create(input);
}

export async function updateReminderStatus(id: string, status: string) {
  await connectDB();
  return Reminder.findByIdAndUpdate(
    id,
    { $set: { status } },
    { returnDocument: "after" },
  );
}

export async function findReminderById(id: string, scope: PatientScope) {
  await connectDB();
  const reminders = await Reminder.aggregate([
    { $match: { _id: new Types.ObjectId(id) } },
    ...basePipeline(scope, {}, "_id"),
  ]);
  return reminders[0] ?? null;
}

export async function appointmentBelongsToPatient(appointmentId: string, patientId: string) {
  await connectDB();
  if (!Types.ObjectId.isValid(appointmentId) || !Types.ObjectId.isValid(patientId)) {
    return false;
  }
  return Boolean(
    await Appointment.exists({
      _id: new Types.ObjectId(appointmentId),
      patientId: new Types.ObjectId(patientId),
    }),
  );
}
