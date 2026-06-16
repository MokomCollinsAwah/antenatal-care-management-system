import { AppointmentStatus, SupplementStatus } from "@/lib/constants";
import { listAppointmentsForUser, type CurrentCareUser } from "@/server/services/appointmentService";
import { listFollowUps, listReminders, listScans, listSupplements } from "@/server/services/clinicalSupportService";
import { listPatientsForUser } from "@/server/services/patientService";
import { listVisitsForUser } from "@/server/services/visitService";
import type { AppointmentListFilters, ClinicalRecordFilters, ReportFilters, VisitListFilters } from "@/types";

function dateFilters(filters: ReportFilters) {
  return {
    dateFrom: filters.startDate,
    dateTo: filters.endDate,
    healthCentreId: filters.healthCentreId,
  };
}

export async function getReportData(user: CurrentCareUser, filters: ReportFilters) {
  const appointmentFilters: AppointmentListFilters = {
    ...dateFilters(filters),
    status: filters.status as AppointmentStatus | undefined,
  };
  const baseAppointmentFilters: AppointmentListFilters = dateFilters(filters);
  const visitFilters: VisitListFilters = dateFilters(filters);
  const clinicalFilters: ClinicalRecordFilters = dateFilters(filters);

  const [
    patients,
    appointments,
    allAppointments,
    visits,
    supplements,
    scans,
    followUps,
    reminders,
  ] = await Promise.all([
    listPatientsForUser(user, { healthCentreId: filters.healthCentreId }),
    listAppointmentsForUser(user, appointmentFilters),
    listAppointmentsForUser(user, baseAppointmentFilters),
    listVisitsForUser(user, visitFilters),
    listSupplements(user, { ...clinicalFilters, status: filters.status === SupplementStatus.ACTIVE ? filters.status : undefined }),
    listScans(user, clinicalFilters),
    listFollowUps(user, clinicalFilters),
    listReminders(user, clinicalFilters),
  ]);

  const upcomingAppointments = appointments.filter((item) => item.status === AppointmentStatus.SCHEDULED);
  const missedAppointments = appointments.filter((item) => item.status === AppointmentStatus.MISSED);

  return {
    summary: {
      totalRegisteredPregnantWomen: patients.length,
      totalScheduledAppointments: allAppointments.filter((item) => item.status === AppointmentStatus.SCHEDULED).length,
      totalAttendedAppointments: allAppointments.filter((item) => item.status === AppointmentStatus.ATTENDED).length,
      totalMissedAppointments: allAppointments.filter((item) => item.status === AppointmentStatus.MISSED).length,
      totalCancelledAppointments: allAppointments.filter((item) => item.status === AppointmentStatus.CANCELLED).length,
      totalVisitRecords: visits.length,
      totalActiveSupplements: supplements.filter((item) => item.status === SupplementStatus.ACTIVE).length,
      totalScanRecords: scans.length,
      totalFollowUps: followUps.length,
      totalReminders: reminders.length,
    },
    upcomingAppointments,
    missedAppointments,
    followUps,
    supplements,
    scans,
  };
}
