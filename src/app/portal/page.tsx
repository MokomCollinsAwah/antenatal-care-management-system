import { Activity, Bell, CalendarDays, HeartPulse, ScanLine } from "lucide-react";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { getCurrentPortalPatientProfile } from "@/features/patients/queries";
import { getPortalAppointmentsForPatient } from "@/features/appointments/queries";
import { getPortalVisitsForPatient } from "@/features/visits/queries";
import { FollowUpOutcomeBadge } from "@/features/followups/components/FollowUpOutcomeBadge";
import { PatientReminderList } from "@/features/reminders/components/PatientReminderList";
import { SupplementStatusBadge } from "@/features/supplements/components/SupplementStatusBadge";
import { getPortalFollowUpsForPatient } from "@/features/followups/queries";
import { getPortalRemindersForPatient } from "@/features/reminders/queries";
import { getPortalScansForPatient } from "@/features/scans/queries";
import { getPortalSupplementsForPatient } from "@/features/supplements/queries";
import { AppointmentStatus, ReminderStatus, SupplementStatus } from "@/lib/constants";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { runDashboardMaintenance } from "@/server/services/systemMaintenanceService";

export default async function PortalPage() {
  const user = await requireRole([UserRole.PREGNANT_WOMAN]);
  await runDashboardMaintenance();
  const profile = await getCurrentPortalPatientProfile(user.id);
  const [appointments, visits, supplements, scans, followUps, reminders] = profile
    ? await Promise.all([
        getPortalAppointmentsForPatient(profile.id),
        getPortalVisitsForPatient(profile.id),
        getPortalSupplementsForPatient(profile.id),
        getPortalScansForPatient(profile.id),
        getPortalFollowUpsForPatient(profile.id),
        getPortalRemindersForPatient(profile.id),
      ])
    : [[], [], [], [], [], []];
  const upcomingAppointments = appointments.filter(
    (appointment) => appointment.status === AppointmentStatus.SCHEDULED,
  );
  const missedAppointments = appointments.filter(
    (appointment) => appointment.status === AppointmentStatus.MISSED,
  );
  const activeSupplements = supplements.filter((record) => record.status === SupplementStatus.ACTIVE);
  const upcomingScans = scans.filter((scan) => !scan.nextScanDate || new Date(scan.nextScanDate) >= new Date());
  const openReminders = reminders.filter((reminder) => reminder.status === ReminderStatus.PENDING || reminder.status === ReminderStatus.DUE);
  const portalStats = [
    { title: "Next Appointment", value: upcomingAppointments[0] ? formatDate(upcomingAppointments[0].scheduledDateTime) : "Not scheduled", icon: CalendarDays },
    { title: "Active Supplements", value: activeSupplements.length, icon: Activity },
    { title: "Unread Reminders", value: openReminders.length, icon: Bell },
    { title: "Upcoming Scan", value: upcomingScans[0]?.nextScanDate ? formatDate(upcomingScans[0].nextScanDate) : "Not scheduled", icon: ScanLine },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-18 max-w-7xl items-center px-4 sm:px-6">
          <span className="rounded-xl bg-teal-700 p-2 text-white">
            <HeartPulse className="size-5" />
          </span>
          <p className="ml-3 font-bold text-slate-900">My Care Portal</p>
          <div className="ml-auto">
            <LogoutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <PageHeader
          title="My Antenatal Care"
          description="View your antenatal care profile and upcoming care information."
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {portalStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>
        {profile ? (
          <div className="space-y-6">
            {missedAppointments.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6 text-sm font-medium text-red-700">
                  You have {missedAppointments.length} missed appointment(s). Please contact your health worker.
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader><CardTitle>Profile Summary</CardTitle></CardHeader>
              <CardContent>
                <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <Detail label="Full Name" value={profile.fullName} />
                  <Detail label="Phone" value={profile.phone} />
                  <Detail label="Age" value={String(profile.age)} />
                  <Detail label="Address" value={profile.address} />
                  <Detail label="Health Centre" value={profile.healthCentreName} />
                  <Detail label="Assigned Health Worker" value={profile.assignedHealthWorkerName} />
                  <Detail label="Last Menstrual Period" value={formatDate(profile.lastMenstrualPeriod)} />
                  <Detail label="Expected Delivery Date" value={formatDate(profile.expectedDeliveryDate)} />
                  <Detail label="Blood Group" value={profile.bloodGroup || "—"} />
                  {profile.riskNote && <Detail label="Risk Note" value={profile.riskNote} />}
                </dl>
              </CardContent>
            </Card>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>Upcoming Appointments</CardTitle></CardHeader>
                <CardContent>
                  {upcomingAppointments.length ? upcomingAppointments.slice(0, 5).map((appointment) => (
                    <div key={appointment.id} className="border-b border-slate-100 py-3 last:border-0">
                      <p className="font-semibold text-slate-900">{appointment.appointmentType.replaceAll("_", " ")}</p>
                      <p className="text-sm text-slate-500">{formatDate(appointment.scheduledDateTime)} · {appointment.healthCentreName}</p>
                    </div>
                  )) : <EmptyState title="No upcoming appointments" description="Scheduled appointments will appear here." />}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Recent Visits</CardTitle></CardHeader>
                <CardContent>
                  {visits.length ? visits.slice(0, 5).map((visit) => (
                    <div key={visit.id} className="border-b border-slate-100 py-3 last:border-0">
                      <p className="font-semibold text-slate-900">{formatDate(visit.visitDate)}</p>
                      {visit.advice && <p className="text-sm text-slate-600">Advice: {visit.advice}</p>}
                      {visit.notes && <p className="text-sm text-slate-500">Notes: {visit.notes}</p>}
                    </div>
                  )) : <EmptyState title="No recent visits" description="Visit records will appear after attended appointments." />}
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>Active Supplements</CardTitle></CardHeader>
                <CardContent>
                  {activeSupplements.length ? activeSupplements.slice(0, 5).map((record) => (
                    <div key={record.id} className="border-b border-slate-100 py-3 last:border-0">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-slate-900">{record.supplementName}</p>
                        <SupplementStatusBadge status={record.status} />
                      </div>
                      <p className="text-sm text-slate-500">{record.dosage} · {record.frequency}</p>
                      {record.instructions && <p className="text-sm text-slate-600">{record.instructions}</p>}
                    </div>
                  )) : <EmptyState title="No active supplements" description="Active supplement plans will appear here." />}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Upcoming Scans</CardTitle></CardHeader>
                <CardContent>
                  {upcomingScans.length ? upcomingScans.slice(0, 5).map((scan) => (
                    <div key={scan.id} className="border-b border-slate-100 py-3 last:border-0">
                      <p className="font-semibold text-slate-900">{scan.scanType}</p>
                      <p className="text-sm text-slate-500">Scan: {formatDate(scan.scanDate)} · Next: {scan.nextScanDate ? formatDate(scan.nextScanDate) : "Not scheduled"}</p>
                    </div>
                  )) : <EmptyState title="No upcoming scans" description="Future scan reminders will appear here." />}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Follow-ups</CardTitle></CardHeader>
                <CardContent>
                  {followUps.length ? followUps.slice(0, 5).map((record) => (
                    <div key={record.id} className="border-b border-slate-100 py-3 last:border-0">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-slate-900">{formatDate(record.followUpDate)}</p>
                        <FollowUpOutcomeBadge outcome={record.outcome} />
                      </div>
                      <p className="text-sm text-slate-500">{record.method.replaceAll("_", " ")}</p>
                      {record.notes && <p className="text-sm text-slate-600">{record.notes}</p>}
                    </div>
                  )) : <EmptyState title="No follow-ups" description="Follow-up records from your care team will appear here." />}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Reminders</CardTitle></CardHeader>
                <CardContent>
                  <PatientReminderList reminders={openReminders.slice(0, 5)} portal />
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <EmptyState
                title="Profile not completed"
                description="Your antenatal profile has not been completed yet. Please contact your health worker."
              />
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}
