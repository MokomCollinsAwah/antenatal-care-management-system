import { z } from "zod";
import {
  AppointmentType,
  FollowUpMethod,
  FollowUpOutcome,
  SupplementStatus,
  UserRole,
  UserStatus,
  AppointmentStatus,
} from "@/lib/constants";

const requiredText = (message: string) => z.string().trim().min(1, message);
const optionalText = z.string().trim().optional();
const requiredDate = (message: string) =>
  z.coerce.date({ error: message });
const optionalDate = z.coerce.date().optional();
const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^[+0-9()\-\s]{7,20}$/,
    "Enter a valid phone number using 7 to 20 digits or phone symbols",
  );
const optionalPhoneSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^[+0-9()\-\s]{7,20}$/.test(value),
    "Enter a valid phone number using 7 to 20 digits or phone symbols",
  )
  .optional();
const optionalEmailSchema = z
  .union([z.email("Enter a valid email"), z.literal("")])
  .optional();

export const loginSchema = z.object({
  identifier: requiredText("Phone or email is required"),
  password: requiredText("Password is required"),
});

export const createHealthCentreSchema = z.object({
  name: requiredText("Name is required"),
  location: requiredText("Location is required"),
  phone: optionalPhoneSchema,
});

export const updateHealthCentreSchema = createHealthCentreSchema;

export const createUserSchema = z.object({
  fullName: requiredText("Full name is required"),
  phone: phoneSchema,
  email: optionalEmailSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(UserRole),
  healthCentreId: optionalText,
});

export const createHealthWorkerSchema = z.object({
  fullName: requiredText("Full name is required"),
  phone: phoneSchema,
  email: optionalEmailSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
  healthCentreId: requiredText("Health centre is required"),
});

export const updateHealthWorkerSchema = z.object({
  fullName: requiredText("Full name is required"),
  phone: phoneSchema,
  email: optionalEmailSchema,
  healthCentreId: requiredText("Health centre is required"),
  status: z.enum(UserStatus),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: requiredText("Please confirm the new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const patientBaseSchema = {
  fullName: requiredText("Full name is required"),
  phone: phoneSchema,
  email: optionalEmailSchema,
  age: z.coerce.number().int().min(10, "Age must be at least 10"),
  address: requiredText("Address is required"),
  emergencyContactName: optionalText,
  emergencyContactPhone: optionalPhoneSchema,
  healthCentreId: requiredText("Health centre is required"),
  assignedHealthWorkerId: requiredText("Health worker is required"),
  lastMenstrualPeriod: requiredDate("Last menstrual period is required"),
  expectedDeliveryDate: requiredDate("Expected delivery date is required"),
  gravidity: z.coerce.number().int().min(0).optional(),
  parity: z.coerce.number().int().min(0).optional(),
  bloodGroup: optionalText,
  riskNote: optionalText,
};

const deliveryDateAfterLmp = <
  T extends { lastMenstrualPeriod: Date; expectedDeliveryDate: Date },
>(
  data: T,
) => data.expectedDeliveryDate > data.lastMenstrualPeriod;

export const createPatientWithProfileSchema = z
  .object({
    ...patientBaseSchema,
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: requiredText("Please confirm the temporary password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(deliveryDateAfterLmp, {
    message: "Expected delivery date must be after the last menstrual period",
    path: ["expectedDeliveryDate"],
  });

export const updatePatientWithProfileSchema = z
  .object({
    ...patientBaseSchema,
    status: z.enum(UserStatus).optional(),
  })
  .refine(deliveryDateAfterLmp, {
    message: "Expected delivery date must be after the last menstrual period",
    path: ["expectedDeliveryDate"],
  });

export const createPatientProfileSchema = z
  .object({
    age: z.coerce.number().int().min(10, "Age must be at least 10"),
    address: requiredText("Address is required"),
    emergencyContactName: optionalText,
    emergencyContactPhone: optionalText,
    healthCentreId: requiredText("Health centre is required"),
    assignedHealthWorkerId: requiredText("Health worker is required"),
    lastMenstrualPeriod: requiredDate("Last menstrual period is required"),
    expectedDeliveryDate: requiredDate("Expected delivery date is required"),
    gravidity: z.coerce.number().int().min(0).optional(),
    parity: z.coerce.number().int().min(0).optional(),
    bloodGroup: optionalText,
    riskNote: optionalText,
  })
  .refine(
    (data) => data.expectedDeliveryDate > data.lastMenstrualPeriod,
    {
      message: "Expected delivery date must be after the last menstrual period",
      path: ["expectedDeliveryDate"],
    },
  );

export const createAppointmentSchema = z.object({
  patientId: requiredText("Patient is required"),
  appointmentType: z.enum(AppointmentType),
  scheduledDateTime: requiredDate("Scheduled date and time is required"),
  reason: optionalText,
  notes: optionalText,
});

export const createVisitRecordSchema = z.object({
  appointmentId: requiredText("Appointment is required"),
  patientId: requiredText("Patient is required"),
  visitDate: requiredDate("Visit date is required"),
  weightKg: z.coerce.number().positive().optional(),
  systolicBP: z.coerce.number().positive().optional(),
  diastolicBP: z.coerce.number().positive().optional(),
  complaint: optionalText,
  advice: optionalText,
  notes: optionalText,
  nextAppointmentDate: optionalDate,
});

export const updateAppointmentStatusSchema = z.object({
  appointmentId: requiredText("Appointment is required"),
  status: z.enum([
    AppointmentStatus.ATTENDED,
    AppointmentStatus.MISSED,
    AppointmentStatus.CANCELLED,
  ]),
});

export const createSupplementRecordSchema = z.object({
  patientId: requiredText("Patient is required"),
  supplementName: requiredText("Supplement name is required"),
  dosage: requiredText("Dosage is required"),
  frequency: requiredText("Frequency is required"),
  startDate: requiredDate("Start date is required"),
  endDate: optionalDate,
  instructions: optionalText,
  status: z.enum(SupplementStatus),
});

export const createScanRecordSchema = z.object({
  patientId: requiredText("Patient is required"),
  scanDate: requiredDate("Scan date is required"),
  scanType: requiredText("Scan type is required"),
  healthCentreId: optionalText,
  resultNote: optionalText,
  nextScanDate: optionalDate,
});

export const createFollowUpRecordSchema = z.object({
  patientId: requiredText("Patient is required"),
  appointmentId: optionalText,
  followUpDate: requiredDate("Follow-up date is required"),
  method: z.enum(FollowUpMethod),
  outcome: z.enum(FollowUpOutcome),
  notes: optionalText,
});
