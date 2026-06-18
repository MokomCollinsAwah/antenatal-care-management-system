import mongoose, { type Document, type Model, Schema, Types } from "mongoose";
import { BLOOD_GROUP_VALUES } from "@/lib/constants";
import type { BloodGroup } from "@/types";

export interface IPatientProfile extends Document {
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
  bloodGroup?: BloodGroup;
  riskNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PatientProfileSchema = new Schema<IPatientProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    age: { type: Number, required: true, min: 10 },
    address: { type: String, required: true, trim: true },
    emergencyContactName: { type: String, trim: true },
    emergencyContactPhone: { type: String, trim: true },
    healthCentreId: {
      type: Schema.Types.ObjectId,
      ref: "HealthCentre",
      required: true,
    },
    assignedHealthWorkerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMenstrualPeriod: { type: Date, required: true },
    expectedDeliveryDate: { type: Date, required: true },
    gravidity: { type: Number, min: 0 },
    parity: { type: Number, min: 0 },
    bloodGroup: { type: String, enum: BLOOD_GROUP_VALUES, trim: true },
    riskNote: { type: String, trim: true },
  },
  { timestamps: true },
);

PatientProfileSchema.index({ healthCentreId: 1 });
PatientProfileSchema.index({ assignedHealthWorkerId: 1 });
PatientProfileSchema.index({ expectedDeliveryDate: 1 });

const PatientProfile =
  (mongoose.models.PatientProfile as Model<IPatientProfile> | undefined) ??
  mongoose.model<IPatientProfile>("PatientProfile", PatientProfileSchema);

export default PatientProfile;
