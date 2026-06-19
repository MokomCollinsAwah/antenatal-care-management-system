import { z } from "zod";
import {
  AppointmentType,
  BLOOD_GROUP_VALUES,
  FollowUpMethod,
  FollowUpOutcome,
  SupplementStatus,
  UserRole,
  UserStatus,
  AppointmentStatus,
  DEFAULT_TEMPORARY_PASSWORD,
  ReminderStatus,
} from "@/lib/constants";

const requiredText = (message: string) => z.string().trim().min(1, message);
const optionalText = z.string().trim().optional();
const requiredDate = (message: string) =>
  z.coerce.date({ error: message });
const optionalDate = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.date().optional(),
);
const phoneSchema = z
  .string()
  .trim()
  .regex(/^\d{9}$/, "Enter a valid 9-digit phone number");
const optionalPhoneSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^\d{9}$/.test(value),
    "Enter a valid 9-digit phone number",
  )
  .optional();
const optionalEmailSchema = z
  .union([z.email("Enter a valid email"), z.literal("")])
  .optional();
const optionalBloodGroupSchema = z
  .union([
    z.enum(BLOOD_GROUP_VALUES, { error: "Select a valid blood group" }),
    z.literal(""),
  ])
  .optional()
  .transform((value) => value || undefined);

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

export const changePasswordSchema = z
  .object({
    currentPassword: requiredText("Current password is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: requiredText("Please confirm the new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.password !== DEFAULT_TEMPORARY_PASSWORD, {
    message: "Choose a password different from the default password",
    path: ["password"],
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
  bloodGroup: optionalBloodGroupSchema,
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
    bloodGroup: optionalBloodGroupSchema,
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
  endDate: requiredDate("End date is required"),
  instructions: optionalText,
  status: z.enum(SupplementStatus),
}).refine((data) => data.endDate >= data.startDate, {
  message: "End date must be after or equal to start date",
  path: ["endDate"],
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

export const updateReminderStatusSchema = z.object({
  reminderId: requiredText("Reminder is required"),
  status: z.enum([
    ReminderStatus.DUE,
    ReminderStatus.READ,
    ReminderStatus.DISMISSED,
  ]),
});

const dateRangeValid = (data: { startDate?: Date; endDate?: Date }) =>
  !data.startDate || !data.endDate || data.endDate >= data.startDate;

export const reportFilterSchema = z
  .object({
    startDate: optionalDate,
    endDate: optionalDate,
    healthCentreId: optionalText,
    status: optionalText,
  })
  .refine(dateRangeValid, {
    message: "End date must be after or equal to start date",
    path: ["endDate"],
  });

export const auditLogFilterSchema = z
  .object({
    action: optionalText,
    entityType: optionalText,
    startDate: optionalDate,
    endDate: optionalDate,
    search: optionalText,
  })
  .refine(dateRangeValid, {
    message: "End date must be after or equal to start date",
    path: ["endDate"],
  });
