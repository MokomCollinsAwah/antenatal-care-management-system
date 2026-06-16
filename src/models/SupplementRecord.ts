import mongoose, { type Document, type Model, Schema, Types } from "mongoose";
import { SupplementStatus } from "@/lib/constants";

export interface ISupplementRecord extends Document {
  patientId: Types.ObjectId;
  supplementName: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  instructions?: string;
  status: SupplementStatus;
  recordedById: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SupplementRecordSchema = new Schema<ISupplementRecord>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "PatientProfile",
      required: true,
    },
    supplementName: { type: String, required: true, trim: true },
    dosage: { type: String, required: true, trim: true },
    frequency: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: Date,
    instructions: { type: String, trim: true },
    status: {
      type: String,
      enum: Object.values(SupplementStatus),
      default: SupplementStatus.ACTIVE,
    },
    recordedById: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

SupplementRecordSchema.index({ patientId: 1 });
SupplementRecordSchema.index({ status: 1 });
SupplementRecordSchema.index({ startDate: 1 });

const SupplementRecord =
  (mongoose.models.SupplementRecord as Model<ISupplementRecord> | undefined) ??
  mongoose.model<ISupplementRecord>(
    "SupplementRecord",
    SupplementRecordSchema,
  );

export default SupplementRecord;
