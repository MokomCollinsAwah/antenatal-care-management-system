import mongoose, { type Document, type Model, Schema, Types } from "mongoose";
import { UserRole, UserStatus } from "@/lib/constants";

export interface IUser extends Document {
  fullName: string;
  phone: string;
  email?: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  healthCentreId?: Types.ObjectId;
  createdById?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(UserRole), required: true },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    healthCentreId: { type: Schema.Types.ObjectId, ref: "HealthCentre" },
    createdById: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

UserSchema.index({ role: 1 });
UserSchema.index({ healthCentreId: 1 });

const User =
  (mongoose.models.User as Model<IUser> | undefined) ??
  mongoose.model<IUser>("User", UserSchema);

export default User;
