import type { ReactNode } from "react";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCircle2,
  HeartPulse,
  MapPin,
  Phone,
  Pill,
  ScanLine,
  Stethoscope,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { Card, CardContent } from "@/components/ui/Card";
import { CollapsiblePanel } from "@/components/ui/CollapsiblePanel";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { AppointmentStatusBadge } from "@/features/appointments/components/AppointmentStatusBadge";
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
import { formatDate, formatDateTime } from "@/lib/utils";
import { runDashboardMaintenance } from "@/server/services/systemMaintenanceService";

export const dynamic = "force-dynamic";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function byDateAsc<T>(records: T[], getValue: (record: T) => string | undefined) {
  return [...records].sort((a, b) => {
    const first = new Date(getValue(a) ?? 0).getTime();
    const second = new Date(getValue(b) ?? 0).getTime();
    return first - second;
  });
}

function byDateDesc<T>(records: T[], getValue: (record: T) => string | undefined) {
  return [...records].sort((a, b) => {
    const first = new Date(getValue(a) ?? 0).getTime();
    const second = new Date(getValue(b) ?? 0).getTime();
    return second - first;
  });
}

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

  const now = new Date();
  const upcomingAppointments = byDateAsc(
    appointments.filter(
      (appointment) =>
        appointment.status === AppointmentStatus.SCHEDULED &&
        new Date(appointment.scheduledDateTime) >= now,
    ),
    (appointment) => appointment.scheduledDateTime,
  );
  const missedAppointments = appointments.filter(
    (appointment) => appointment.status === AppointmentStatus.MISSED,
  );
  const recentAppointments = byDateDesc(appointments, (appointment) => appointment.scheduledDateTime);
  const activeSupplements = supplements.filter((record) => record.status === SupplementStatus.ACTIVE);
  const supplementEndDates = activeSupplements
    .map((record) => record.endDate)
    .filter((endDate): endDate is string => Boolean(endDate));
  const supplementDaysLeft = supplementEndDates.length
    ? Math.min(
        ...supplementEndDates.map((endDate) =>
          Math.max(0, Math.ceil((new Date(endDate).getTime() - now.getTime()) / MS_PER_DAY)),
        ),
      )
    : 0;
  const supplementDaysValue =
    activeSupplements.length === 0
      ? "0 days"
      : `${supplementDaysLeft} day${supplementDaysLeft === 1 ? "" : "s"}`;
  const recentVisits = byDateDesc(visits, (visit) => visit.visitDate);
  const recentScans = byDateDesc(scans, (scan) => scan.scanDate);
  const upcomingScans = byDateAsc(
    scans.filter((scan) => scan.nextScanDate && new Date(scan.nextScanDate) >= now),
    (scan) => scan.nextScanDate,
  );
  const recentFollowUps = byDateDesc(followUps, (record) => record.followUpDate);
  const openReminders = byDateAsc(
    reminders.filter(
      (reminder) =>
        reminder.status === ReminderStatus.PENDING || reminder.status === ReminderStatus.DUE,
    ),
    (reminder) => reminder.dueDateTime,
  );
  const dueReminders = openReminders.filter((reminder) => reminder.status === ReminderStatus.DUE);
  const nextAppointment = upcomingAppointments[0];
  const nextScan = upcomingScans[0];
  const portalStats = [
    {
      title: "Next Appointment",
      value: nextAppointment ? formatDate(nextAppointment.scheduledDateTime) : "Not scheduled",
      icon: CalendarDays,
    },
    { title: "Supplement Days Left", value: supplementDaysValue, icon: Pill },
    { title: "Open Reminders", value: openReminders.length, icon: Bell },
    {
      title: "Upcoming Scan",
      value: nextScan?.nextScanDate ? formatDate(nextScan.nextScanDate) : "Not scheduled",
      icon: ScanLine,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6">
          <span className="rounded-xl bg-teal-700 p-2 text-white">
            <HeartPulse className="size-5" />
          </span>
          <p className="ml-3 font-bold text-slate-900">My Care Portal</p>
          <div className="ml-auto">
            <LogoutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <PageHeader
          title="My Antenatal Care"
          description="View your antenatal care profile and upcoming care information."
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {portalStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>
        {profile ? (
          <div className="space-y-6">
            {missedAppointments.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="flex gap-3 pt-6 text-sm text-red-700">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0" />
                  <div>
                    <p className="font-semibold">Missed appointment follow-up needed</p>
                    <p className="mt-1">
                      You have {missedAppointments.length} missed appointment(s). Please contact your health worker.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
              <CollapsiblePanel title="Care Summary" icon={HeartPulse} defaultOpen>
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <CareContact icon={UserRound} label="Full Name" value={profile.fullName} />
                    <CareContact icon={Phone} label="Phone" value={profile.phone} />
                    <CareContact icon={MapPin} label="Health Centre" value={profile.healthCentreName} />
                    <CareContact
                      icon={Stethoscope}
                      label="Assigned Health Worker"
                      value={profile.assignedHealthWorkerName}
                    />
                  </div>
                  <dl className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                    <Detail label="Age" value={String(profile.age)} />
                    <Detail label="Blood Group" value={profile.bloodGroup || "Not recorded"} />
                    <Detail label="Last Menstrual Period" value={formatDate(profile.lastMenstrualPeriod)} />
                    <Detail label="Expected Delivery Date" value={formatDate(profile.expectedDeliveryDate)} />
                    <Detail label="Gravidity" value={profile.gravidity ? String(profile.gravidity) : "Not recorded"} />
                    <Detail label="Parity" value={profile.parity ? String(profile.parity) : "Not recorded"} />
                  </dl>
                  {profile.riskNote && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                      <p className="font-semibold">Care note</p>
                      <p className="mt-1 leading-6">{profile.riskNote}</p>
                    </div>
                  )}
                </div>
              </CollapsiblePanel>

              <CollapsiblePanel title="Next Care Step" icon={CalendarDays} defaultOpen tone="teal">
                <div className="space-y-4">
                  {nextAppointment ? (
                    <div className="rounded-xl bg-teal-50 p-4">
                      <div className="flex items-start gap-3">
                        <span className="rounded-lg bg-teal-700 p-2 text-white">
                          <CalendarDays className="size-5" />
                        </span>
                        <div>
                          <p className="text-xs font-semibold uppercase text-teal-700">Upcoming appointment</p>
                          <p className="mt-1 text-lg font-bold text-slate-950">
                            {nextAppointment.appointmentType.replaceAll("_", " ")}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {formatDateTime(nextAppointment.scheduledDateTime)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <EmptyState
                      title="No appointment scheduled"
                      description="Your next appointment will appear here once your care team schedules it."
                    />
                  )}
                  {dueReminders.length > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                      <p className="font-semibold">{dueReminders.length} reminder(s) due now</p>
                      <p className="mt-1">Review the reminders section and mark items read when completed.</p>
                    </div>
                  )}
                </div>
              </CollapsiblePanel>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <CareList
                title="Upcoming Appointments"
                icon={CalendarDays}
                items={upcomingAppointments.slice(0, 5)}
                emptyTitle="No upcoming appointments"
                emptyDescription="Scheduled appointments will appear here."
                renderItem={(appointment) => (
                  <CareListItem
                    title={appointment.appointmentType.replaceAll("_", " ")}
                    meta={`${formatDateTime(appointment.scheduledDateTime)} · ${appointment.healthCentreName}`}
                    description={appointment.reason}
                  />
                )}
              />
              <CareList
                title="Recent Appointments"
                icon={CalendarDays}
                items={recentAppointments.slice(0, 5)}
                count={recentAppointments.length}
                emptyTitle="No recent appointments"
                emptyDescription="Appointment history will appear here."
                renderItem={(appointment) => (
                  <CareListItem
                    title={appointment.appointmentType.replaceAll("_", " ")}
                    meta={`${formatDateTime(appointment.scheduledDateTime)} · ${appointment.healthCentreName}`}
                    description={appointment.reason || appointment.notes}
                    accessory={<AppointmentStatusBadge status={appointment.status} />}
                  />
                )}
              />
              <CareList
                title="Recent Visits"
                icon={Stethoscope}
                items={recentVisits.slice(0, 5)}
                count={recentVisits.length}
                emptyTitle="No recent visits"
                emptyDescription="Visit records will appear after attended appointments."
                renderItem={(visit) => (
                  <CareListItem
                    title={formatDate(visit.visitDate)}
                    meta={visit.appointmentType.replaceAll("_", " ")}
                    description={visit.advice || visit.notes}
                  />
                )}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <CareList
                title="Active Supplements"
                icon={Pill}
                items={activeSupplements.slice(0, 5)}
                emptyTitle="No active supplements"
                emptyDescription="Active supplement plans will appear here."
                renderItem={(record) => (
                  <CareListItem
                    title={record.supplementName}
                    meta={`${record.dosage} · ${record.frequency}`}
                    description={record.instructions}
                    accessory={<SupplementStatusBadge status={record.status} />}
                  />
                )}
              />
              <CareList
                title="Recent Scans"
                icon={ScanLine}
                items={recentScans.slice(0, 5)}
                count={recentScans.length}
                emptyTitle="No recent scans"
                emptyDescription="Scan records will appear here."
                renderItem={(scan) => (
                  <CareListItem
                    title={scan.scanType}
                    meta={formatDate(scan.scanDate)}
                    description={scan.nextScanDate ? `Next scan: ${formatDate(scan.nextScanDate)}` : undefined}
                  />
                )}
              />
              <CareList
                title="Follow-ups"
                icon={CheckCircle2}
                items={recentFollowUps.slice(0, 5)}
                emptyTitle="No follow-ups"
                emptyDescription="Follow-up records from your care team will appear here."
                renderItem={(record) => (
                  <CareListItem
                    title={formatDateTime(record.followUpDate)}
                    meta={`${record.method.replaceAll("_", " ")} · ${record.followedByName}`}
                    description={record.notes}
                    accessory={<FollowUpOutcomeBadge outcome={record.outcome} />}
                  />
                )}
              />
              <CollapsiblePanel title="Open Reminders" icon={Bell} defaultOpen={openReminders.length > 0}>
                <PatientReminderList reminders={openReminders.slice(0, 5)} portal />
              </CollapsiblePanel>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <EmptyState
                title="Patient profile not found"
                description="Please contact your health worker to complete your profile."
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
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

function CareContact({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 gap-3 rounded-xl border border-slate-200 p-4">
      <span className="h-10 w-10 shrink-0 rounded-lg bg-slate-100 p-2.5 text-slate-700">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function CareList<T>({
  title,
  icon: Icon,
  items,
  count,
  emptyTitle,
  emptyDescription,
  renderItem,
}: {
  title: string;
  icon: typeof CalendarDays;
  items: T[];
  count?: number;
  emptyTitle: string;
  emptyDescription: string;
  renderItem: (item: T) => ReactNode;
}) {
  return (
    <CollapsiblePanel title={title} icon={Icon} count={count} defaultOpen={items.length > 0}>
      {items.length ? (
        <div className="divide-y divide-slate-100">
          {items.map((item, index) => (
            <div key={index} className="py-3 first:pt-0 last:pb-0">
              {renderItem(item)}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}
    </CollapsiblePanel>
  );
}

function CareListItem({
  title,
  meta,
  description,
  accessory,
}: {
  title: string;
  meta?: string;
  description?: string;
  accessory?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="break-words font-semibold text-slate-900">{title}</p>
        {meta && <p className="mt-1 text-sm text-slate-500">{meta}</p>}
        {description && <p className="mt-1 break-words text-sm leading-6 text-slate-600">{description}</p>}
      </div>
      {accessory && <div className="shrink-0">{accessory}</div>}
    </div>
  );
}
