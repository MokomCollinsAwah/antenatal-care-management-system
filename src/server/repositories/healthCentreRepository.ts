import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { UserRole } from "@/lib/constants";
import HealthCentre from "@/models/HealthCentre";
import User from "@/models/User";

export interface HealthCentreWriteInput {
  name: string;
  location: string;
  phone?: string;
}

export async function findHealthCentresWithWorkerCounts() {
  await connectDB();

  return HealthCentre.aggregate<{
    _id: Types.ObjectId;
    name: string;
    location: string;
    phone?: string;
    healthWorkerCount: number;
    createdAt: Date;
    updatedAt: Date;
  }>([
    {
      $lookup: {
        from: User.collection.name,
        let: { centreId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$healthCentreId", "$$centreId"] },
                  { $eq: ["$role", UserRole.HEALTH_WORKER] },
                ],
              },
            },
          },
          { $count: "count" },
        ],
        as: "workerStats",
      },
    },
    {
      $addFields: {
        healthWorkerCount: {
          $ifNull: [{ $arrayElemAt: ["$workerStats.count", 0] }, 0],
        },
      },
    },
    { $project: { workerStats: 0 } },
    { $sort: { name: 1, location: 1 } },
  ]);
}

export async function findHealthCentreById(id: string) {
  await connectDB();

  const healthCentre = await HealthCentre.findById(id).lean();
  if (!healthCentre) {
    return null;
  }

  const healthWorkerCount = await User.countDocuments({
    healthCentreId: healthCentre._id,
    role: UserRole.HEALTH_WORKER,
  });

  return { ...healthCentre, healthWorkerCount };
}

export async function findHealthCentreOptions() {
  await connectDB();
  return HealthCentre.find()
    .select("_id name location")
    .sort({ name: 1, location: 1 })
    .lean();
}

export async function findDuplicateHealthCentre(
  name: string,
  location: string,
  excludeId?: string,
) {
  await connectDB();

  const query: Record<string, unknown> = { name, location };
  if (excludeId) {
    query._id = { $ne: new Types.ObjectId(excludeId) };
  }

  return HealthCentre.findOne(query)
    .collation({ locale: "en", strength: 2 })
    .select("_id")
    .lean();
}

export async function createHealthCentre(input: HealthCentreWriteInput) {
  await connectDB();
  return HealthCentre.create(input);
}

export async function updateHealthCentre(
  id: string,
  input: HealthCentreWriteInput,
) {
  await connectDB();
  return HealthCentre.findByIdAndUpdate(
    id,
    {
      $set: {
        name: input.name,
        location: input.location,
        ...(input.phone ? { phone: input.phone } : {}),
      },
      ...(input.phone ? {} : { $unset: { phone: 1 } }),
    },
    { returnDocument: "after" },
  );
}

export async function healthCentreExists(id: string) {
  await connectDB();
  return Boolean(await HealthCentre.exists({ _id: id }));
}
