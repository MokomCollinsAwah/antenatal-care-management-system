import mongoose, { type Document, type Model, Schema, Types } from "mongoose";

export interface IScanRecord extends Document {
  patientId: Types.ObjectId;
  scanDate: Date;
  scanType: string;
  healthCentreId?: Types.ObjectId;
  resultNote?: string;
  nextScanDate?: Date;
  recordedById: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ScanRecordSchema = new Schema<IScanRecord>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "PatientProfile",
      required: true,
    },
    scanDate: { type: Date, required: true },
    scanType: { type: String, required: true, trim: true },
    healthCentreId: { type: Schema.Types.ObjectId, ref: "HealthCentre" },
    resultNote: { type: String, trim: true },
    nextScanDate: Date,
    recordedById: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

ScanRecordSchema.index({ patientId: 1 });
ScanRecordSchema.index({ scanDate: 1 });
ScanRecordSchema.index({ healthCentreId: 1 });

const ScanRecord =
  (mongoose.models.ScanRecord as Model<IScanRecord> | undefined) ??
  mongoose.model<IScanRecord>("ScanRecord", ScanRecordSchema);

export default ScanRecord;
