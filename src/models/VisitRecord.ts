import mongoose, { type Document, type Model, Schema, Types } from "mongoose";

export interface IVisitRecord extends Document {
  appointmentId: Types.ObjectId;
  patientId: Types.ObjectId;
  visitDate: Date;
  weightKg?: number;
  systolicBP?: number;
  diastolicBP?: number;
  complaint?: string;
  advice?: string;
  notes?: string;
  nextAppointmentDate?: Date;
  recordedById: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VisitRecordSchema = new Schema<IVisitRecord>(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "PatientProfile",
      required: true,
    },
    visitDate: { type: Date, required: true },
    weightKg: { type: Number, min: 0 },
    systolicBP: { type: Number, min: 0 },
    diastolicBP: { type: Number, min: 0 },
    complaint: { type: String, trim: true },
    advice: { type: String, trim: true },
    notes: { type: String, trim: true },
    nextAppointmentDate: Date,
    recordedById: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

VisitRecordSchema.index({ appointmentId: 1 });
VisitRecordSchema.index({ patientId: 1 });
VisitRecordSchema.index({ visitDate: 1 });
VisitRecordSchema.index({ recordedById: 1 });

const VisitRecord =
  (mongoose.models.VisitRecord as Model<IVisitRecord> | undefined) ??
  mongoose.model<IVisitRecord>("VisitRecord", VisitRecordSchema);

export default VisitRecord;
