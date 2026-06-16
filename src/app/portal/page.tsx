import { Activity, Bell, CalendarDays, HeartPulse, ScanLine } from "lucide-react";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { getCurrentPortalPatientProfile } from "@/features/patients/queries";
import { getPortalAppointmentsForPatient } from "@/features/appointments/queries";
import { getPortalVisitsForPatient } from "@/features/visits/queries";
import { AppointmentStatus } from "@/lib/constants";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

const portalStats = [
  { title: "Next Appointment", value: "Not scheduled", icon: CalendarDays },
  { title: "Active Supplements", value: "—", icon: Activity },
  { title: "Unread Reminders", value: "—", icon: Bell },
  { title: "Upcoming Scan", value: "Not scheduled", icon: ScanLine },
];

export default async function PortalPage() {
  const user = await requireRole([UserRole.PREGNANT_WOMAN]);
  const profile = await getCurrentPortalPatientProfile(user.id);
  const [appointments, visits] = profile
    ? await Promise.all([
        getPortalAppointmentsForPatient(profile.id),
        getPortalVisitsForPatient(profile.id),
      ])
    : [[], []];
  const upcomingAppointments = appointments.filter(
    (appointment) => appointment.status === AppointmentStatus.SCHEDULED,
  );
  const missedAppointments = appointments.filter(
    (appointment) => appointment.status === AppointmentStatus.MISSED,
  );

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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
