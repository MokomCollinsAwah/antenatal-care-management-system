import mongoose, { type Document, type Model, Schema, Types } from "mongoose";
import { FollowUpMethod, FollowUpOutcome } from "@/lib/constants";

export interface IFollowUpRecord extends Document {
  patientId: Types.ObjectId;
  appointmentId?: Types.ObjectId;
  followUpDate: Date;
  method: FollowUpMethod;
  outcome: FollowUpOutcome;
  notes?: string;
  followedById: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FollowUpRecordSchema = new Schema<IFollowUpRecord>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "PatientProfile",
      required: true,
    },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
    followUpDate: { type: Date, required: true },
    method: {
      type: String,
      enum: Object.values(FollowUpMethod),
      required: true,
    },
    outcome: {
      type: String,
      enum: Object.values(FollowUpOutcome),
      required: true,
    },
    notes: { type: String, trim: true },
    followedById: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

FollowUpRecordSchema.index({ patientId: 1 });
FollowUpRecordSchema.index({ appointmentId: 1 });
FollowUpRecordSchema.index({ followUpDate: 1 });
FollowUpRecordSchema.index({ outcome: 1 });
FollowUpRecordSchema.index({ followedById: 1 });

const FollowUpRecord =
  (mongoose.models.FollowUpRecord as Model<IFollowUpRecord> | undefined) ??
  mongoose.model<IFollowUpRecord>("FollowUpRecord", FollowUpRecordSchema);

export default FollowUpRecord;
