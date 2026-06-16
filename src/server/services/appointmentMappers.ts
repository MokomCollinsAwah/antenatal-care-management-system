import type { Types } from "mongoose";
import type { AppointmentSummary, VisitSummary } from "@/types";

export type AppointmentAggregate = {
  _id: Types.ObjectId;
  patientId: Types.ObjectId;
  appointmentType: AppointmentSummary["appointmentType"];
  scheduledDateTime: Date;
  status: AppointmentSummary["status"];
  reason?: string;
  notes?: string;
  createdById: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  patientUser: { fullName: string; phone: string };
  healthCentre: { _id: Types.ObjectId; name: string };
  createdBy: { _id: Types.ObjectId; fullName: string };
  visit?: {
    _id: Types.ObjectId;
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
  };
};

export type VisitAggregate = {
  _id: Types.ObjectId;
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
  patientUser: { fullName: string; phone: string };
  healthCentre: { _id: Types.ObjectId; name: string };
  appointment: { appointmentType: VisitSummary["appointmentType"] };
  recordedBy: { _id: Types.ObjectId; fullName: string };
};

export function serializeVisit(visit: VisitAggregate): VisitSummary {
  return {
    id: visit._id.toString(),
    appointmentId: visit.appointmentId.toString(),
    patientId: visit.patientId.toString(),
    patientName: visit.patientUser.fullName,
    patientPhone: visit.patientUser.phone,
    healthCentreId: visit.healthCentre._id.toString(),
    healthCentreName: visit.healthCentre.name,
    appointmentType: visit.appointment.appointmentType,
    visitDate: visit.visitDate.toISOString(),
    weightKg: visit.weightKg,
    systolicBP: visit.systolicBP,
    diastolicBP: visit.diastolicBP,
    complaint: visit.complaint,
    advice: visit.advice,
    notes: visit.notes,
    nextAppointmentDate: visit.nextAppointmentDate?.toISOString(),
    recordedById: visit.recordedById.toString(),
    recordedByName: visit.recordedBy.fullName,
    createdAt: visit.createdAt.toISOString(),
    updatedAt: visit.updatedAt.toISOString(),
  };
}

export function serializeAppointment(
  appointment: AppointmentAggregate,
): AppointmentSummary {
  return {
    id: appointment._id.toString(),
    patientId: appointment.patientId.toString(),
    patientName: appointment.patientUser.fullName,
    patientPhone: appointment.patientUser.phone,
    healthCentreId: appointment.healthCentre._id.toString(),
    healthCentreName: appointment.healthCentre.name,
    appointmentType: appointment.appointmentType,
    scheduledDateTime: appointment.scheduledDateTime.toISOString(),
    status: appointment.status,
    reason: appointment.reason,
    notes: appointment.notes,
    createdById: appointment.createdById.toString(),
    createdByName: appointment.createdBy.fullName,
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
    visit: appointment.visit
      ? {
          id: appointment.visit._id.toString(),
          appointmentId: appointment.visit.appointmentId.toString(),
          patientId: appointment.visit.patientId.toString(),
          patientName: appointment.patientUser.fullName,
          patientPhone: appointment.patientUser.phone,
          healthCentreId: appointment.healthCentre._id.toString(),
          healthCentreName: appointment.healthCentre.name,
          appointmentType: appointment.appointmentType,
          visitDate: appointment.visit.visitDate.toISOString(),
          weightKg: appointment.visit.weightKg,
          systolicBP: appointment.visit.systolicBP,
          diastolicBP: appointment.visit.diastolicBP,
          complaint: appointment.visit.complaint,
          advice: appointment.visit.advice,
          notes: appointment.visit.notes,
          nextAppointmentDate: appointment.visit.nextAppointmentDate?.toISOString(),
          recordedById: appointment.visit.recordedById.toString(),
          recordedByName: "",
          createdAt: appointment.visit.createdAt.toISOString(),
          updatedAt: appointment.visit.updatedAt.toISOString(),
        }
      : undefined,
  };
}
