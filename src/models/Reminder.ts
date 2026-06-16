import mongoose, { type Document, type Model, Schema, Types } from "mongoose";
import { ReminderStatus, ReminderType } from "@/lib/constants";

export interface IReminder extends Document {
  patientId: Types.ObjectId;
  appointmentId?: Types.ObjectId;
  supplementId?: Types.ObjectId;
  scanId?: Types.ObjectId;
  title: string;
  message: string;
  reminderType: ReminderType;
  dueDateTime: Date;
  status: ReminderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema = new Schema<IReminder>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "PatientProfile",
      required: true,
    },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
    supplementId: { type: Schema.Types.ObjectId, ref: "SupplementRecord" },
    scanId: { type: Schema.Types.ObjectId, ref: "ScanRecord" },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    reminderType: {
      type: String,
      enum: Object.values(ReminderType),
      required: true,
    },
    dueDateTime: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(ReminderStatus),
      default: ReminderStatus.PENDING,
    },
  },
  { timestamps: true },
);

ReminderSchema.index({ patientId: 1 });
ReminderSchema.index({ reminderType: 1 });
ReminderSchema.index({ status: 1 });
ReminderSchema.index({ dueDateTime: 1 });

const Reminder =
  (mongoose.models.Reminder as Model<IReminder> | undefined) ??
  mongoose.model<IReminder>("Reminder", ReminderSchema);

export default Reminder;
