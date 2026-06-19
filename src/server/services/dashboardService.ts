import { AppointmentStatus, FollowUpOutcome, ReminderStatus } from "@/lib/constants";
import { listAppointmentsForUser, type CurrentCareUser } from "@/server/services/appointmentService";
import { listVisitsForUser } from "@/server/services/visitService";
import { listPatientsForUser } from "@/server/services/patientService";
import { listFollowUps, listReminders, listScans } from "@/server/services/clinicalSupportService";

export async function getDashboardData(user: CurrentCareUser) {
  const now = new Date();
  const [
    patients,
    appointments,
    visits,
    scans,
    followUps,
    reminders,
  ] = await Promise.all([
    listPatientsForUser(user, {}),
    listAppointmentsForUser(user, {}),
    listVisitsForUser(user, {}),
    listScans(user, {}),
    listFollowUps(user, {}),
    listReminders(user, {}),
  ]);

  const upcomingAppointments = appointments.filter(
    (item) => item.status === AppointmentStatus.SCHEDULED && new Date(item.scheduledDateTime) >= now,
  );
  const missedAppointments = appointments.filter((item) => item.status === AppointmentStatus.MISSED);
  const pendingFollowUps = followUps.filter((item) => item.outcome === FollowUpOutcome.PENDING);
  const dueReminders = reminders.filter((item) => item.status === ReminderStatus.DUE);

  return {
    stats: {
      totalPregnantWomen: patients.length,
      totalAppointments: appointments.length,
      upcomingAppointments: upcomingAppointments.length,
      missedAppointments: missedAppointments.length,
      totalVisits: visits.length,
      totalScans: scans.length,
      pendingFollowUps: pendingFollowUps.length,
      dueReminders: dueReminders.length,
    },
    recentAppointments: upcomingAppointments.slice(0, 5),
    recentMissedAppointments: missedAppointments.slice(0, 5),
    recentFollowUps: followUps.slice(0, 5),
    recentDueReminders: dueReminders.slice(0, 5),
  };
}
