import mongoose, { type Document, type Model, Schema, Types } from "mongoose";
import { AppointmentStatus, AppointmentType } from "@/lib/constants";

export interface IAppointment extends Document {
  patientId: Types.ObjectId;
  appointmentType: AppointmentType;
  scheduledDateTime: Date;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  createdById: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "PatientProfile",
      required: true,
    },
    appointmentType: {
      type: String,
      enum: Object.values(AppointmentType),
      required: true,
    },
    scheduledDateTime: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.SCHEDULED,
    },
    reason: { type: String, trim: true },
    notes: { type: String, trim: true },
    createdById: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

AppointmentSchema.index({ patientId: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ scheduledDateTime: 1 });
AppointmentSchema.index({ appointmentType: 1 });

const Appointment =
  (mongoose.models.Appointment as Model<IAppointment> | undefined) ??
  mongoose.model<IAppointment>("Appointment", AppointmentSchema);

export default Appointment;
