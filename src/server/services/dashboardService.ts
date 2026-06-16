import { AppointmentStatus, FollowUpOutcome, ReminderStatus, SupplementStatus } from "@/lib/constants";
import { listAppointmentsForUser, type CurrentCareUser } from "@/server/services/appointmentService";
import { listVisitsForUser } from "@/server/services/visitService";
import { listPatientsForUser } from "@/server/services/patientService";
import { listFollowUps, listReminders, listScans, listSupplements } from "@/server/services/clinicalSupportService";

export async function getDashboardData(user: CurrentCareUser) {
  const now = new Date();
  const [
    patients,
    appointments,
    visits,
    supplements,
    scans,
    followUps,
    reminders,
  ] = await Promise.all([
    listPatientsForUser(user, {}),
    listAppointmentsForUser(user, {}),
    listVisitsForUser(user, {}),
    listSupplements(user, {}),
    listScans(user, {}),
    listFollowUps(user, {}),
    listReminders(user, {}),
  ]);

  const upcomingAppointments = appointments.filter(
    (item) => item.status === AppointmentStatus.SCHEDULED && new Date(item.scheduledDateTime) >= now,
  );
  const missedAppointments = appointments.filter((item) => item.status === AppointmentStatus.MISSED);
  const activeSupplements = supplements.filter((item) => item.status === SupplementStatus.ACTIVE);
  const pendingFollowUps = followUps.filter((item) => item.outcome === FollowUpOutcome.PENDING);
  const dueReminders = reminders.filter((item) => item.status === ReminderStatus.DUE);
  const recentScans = scans.filter((item) => Date.now() - new Date(item.scanDate).getTime() <= 1000 * 60 * 60 * 24 * 30);

  return {
    stats: {
      totalPregnantWomen: patients.length,
      upcomingAppointments: upcomingAppointments.length,
      missedAppointments: missedAppointments.length,
      completedVisits: visits.length,
      activeSupplements: activeSupplements.length,
      pendingFollowUps: pendingFollowUps.length,
      dueReminders: dueReminders.length,
      recentScans: recentScans.length,
    },
    recentAppointments: upcomingAppointments.slice(0, 5),
    recentMissedAppointments: missedAppointments.slice(0, 5),
    recentFollowUps: followUps.slice(0, 5),
    recentDueReminders: dueReminders.slice(0, 5),
  };
}
