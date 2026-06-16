import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IHealthCentre extends Document {
  name: string;
  location: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const HealthCentreSchema = new Schema<IHealthCentre>(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
  },
  { timestamps: true },
);

HealthCentreSchema.index({ name: 1 });
HealthCentreSchema.index({ location: 1 });
HealthCentreSchema.index({ name: 1, location: 1 });

const HealthCentre =
  (mongoose.models.HealthCentre as Model<IHealthCentre> | undefined) ??
  mongoose.model<IHealthCentre>("HealthCentre", HealthCentreSchema);

export default HealthCentre;
