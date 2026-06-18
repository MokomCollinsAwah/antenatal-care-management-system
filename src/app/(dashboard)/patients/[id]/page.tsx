import type { ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  Pencil,
  KeyRound,
  ScanLine,
  Stethoscope,
} from "lucide-react";
import { notFound } from "next/navigation";
import { CollapsiblePanel } from "@/components/ui/CollapsiblePanel";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { AppointmentStatusBadge } from "@/features/appointments/components/AppointmentStatusBadge";
import { getAppointmentsForPatient } from "@/features/appointments/queries";
import { FollowUpOutcomeBadge } from "@/features/followups/components/FollowUpOutcomeBadge";
import { getFollowUpsForPatient } from "@/features/followups/queries";
import { PatientProfileDetails } from "@/features/patients/components/PatientProfileDetails";
import { getPatientDetails } from "@/features/patients/queries";
import { PatientReminderList } from "@/features/reminders/components/PatientReminderList";
import { getRemindersForPatient } from "@/features/reminders/queries";
import { getScansForPatient } from "@/features/scans/queries";
import { getSupplementsForPatient } from "@/features/supplements/queries";
import { SupplementStatusBadge } from "@/features/supplements/components/SupplementStatusBadge";
import { getVisitsForPatient } from "@/features/visits/queries";
import { formatDate, formatDateTime } from "@/lib/utils";
import { AdminServiceError } from "@/server/services/adminServiceError";

export default async function PatientDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [patient, appointments, visits, supplements, scans, followUps, reminders] = await Promise.all([
    loadPatient(id),
    getAppointmentsForPatient(id),
    getVisitsForPatient(id),
    getSupplementsForPatient(id),
    getScansForPatient(id),
    getFollowUpsForPatient(id),
    getRemindersForPatient(id),
  ]);

  const sortedAppointments = byDateDesc(appointments, (appointment) => appointment.scheduledDateTime);
  const sortedVisits = byDateDesc(visits, (visit) => visit.visitDate);
  const sortedSupplements = byDateDesc(supplements, (record) => record.startDate);
  const sortedScans = byDateDesc(scans, (record) => record.scanDate);
  const sortedFollowUps = byDateDesc(followUps, (record) => record.followUpDate);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patient Details"
        description="View patient account and antenatal profile information."
        action={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/patients"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="size-4" />
              Back to Patients
            </Link>
            <Link
              href={`/patients/${patient.id}/edit`}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-teal-700 px-3 text-sm font-semibold text-white hover:bg-teal-800"
            >
              <Pencil className="size-4" />
              Edit Patient
            </Link>
            <Link
              href={`/patients/${patient.id}/reset-password`}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <KeyRound className="size-4" />
              Reset Password
            </Link>
          </div>
        }
      />
      <PatientProfileDetails patient={patient} />
      <div className="grid gap-6 xl:grid-cols-2">
        <ClinicalPanel
          title="Appointments"
          icon={CalendarDays}
          items={sortedAppointments.slice(0, 5)}
          emptyTitle="No appointments yet"
          emptyDescription="Schedule this patient's first appointment."
          action={<PrimaryLink href={`/appointments/new?patientId=${patient.id}`}>Schedule Appointment</PrimaryLink>}
          renderItem={(appointment) => (
            <RecordRow
              title={appointment.appointmentType.replaceAll("_", " ")}
              meta={formatDateTime(appointment.scheduledDateTime)}
              accessory={
                <div className="flex flex-wrap items-center gap-3">
                  <AppointmentStatusBadge status={appointment.status} />
                  <Link href={`/appointments/${appointment.id}`} className="text-sm font-semibold text-teal-700">
                    View
                  </Link>
                </div>
              }
            />
          )}
        />
        <ClinicalPanel
          title="Visits"
          icon={Stethoscope}
          items={sortedVisits.slice(0, 5)}
          emptyTitle="No visits yet"
          emptyDescription="Visit records are created when scheduled appointments are marked attended."
          renderItem={(visit) => (
            <RecordRow
              title={formatDateTime(visit.visitDate)}
              meta={`BP: ${visit.systolicBP && visit.diastolicBP ? `${visit.systolicBP}/${visit.diastolicBP}` : "—"} · Weight: ${visit.weightKg ? `${visit.weightKg} kg` : "—"}`}
              description={visit.advice}
              accessory={
                <Link href={`/appointments/${visit.appointmentId}`} className="text-sm font-semibold text-teal-700">
                  View appointment
                </Link>
              }
            />
          )}
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <ClinicalPanel
          title="Supplements"
          icon={Activity}
          items={sortedSupplements.slice(0, 5)}
          emptyTitle="No supplements yet"
          emptyDescription="Add a supplement record for this patient."
          action={<PrimaryLink href={`/supplements/new?patientId=${patient.id}`}>Add Supplement</PrimaryLink>}
          renderItem={(record) => (
            <RecordRow
              title={record.supplementName}
              meta={`${record.dosage} · ${record.frequency} · Starts ${formatDate(record.startDate)}`}
              accessory={<SupplementStatusBadge status={record.status} />}
            />
          )}
        />
        <ClinicalPanel
          title="Scans"
          icon={ScanLine}
          items={sortedScans.slice(0, 5)}
          emptyTitle="No scans yet"
          emptyDescription="Add a scan record for this patient."
          action={<PrimaryLink href={`/scans/new?patientId=${patient.id}`}>Add Scan</PrimaryLink>}
          renderItem={(record) => (
            <RecordRow
              title={record.scanType}
              meta={`${formatDate(record.scanDate)} · Next: ${record.nextScanDate ? formatDate(record.nextScanDate) : "—"}`}
              description={record.resultNote}
            />
          )}
        />
        <ClinicalPanel
          title="Follow-ups"
          icon={CheckCircle2}
          items={sortedFollowUps.slice(0, 5)}
          emptyTitle="No follow-ups yet"
          emptyDescription="Add a follow-up record for this patient."
          action={<PrimaryLink href={`/follow-ups/new?patientId=${patient.id}`}>Add Follow-up</PrimaryLink>}
          renderItem={(record) => (
            <RecordRow
              title={formatDateTime(record.followUpDate)}
              meta={`${record.method.replaceAll("_", " ")} · ${record.followedByName}`}
              description={record.notes}
              accessory={<FollowUpOutcomeBadge outcome={record.outcome} />}
            />
          )}
        />
        <CollapsiblePanel title="Reminders" icon={Bell} defaultOpen={reminders.length > 0}>
          <PatientReminderList reminders={reminders.slice(0, 5)} />
        </CollapsiblePanel>
      </div>
    </div>
  );
}

function ClinicalPanel<T>({
  title,
  icon,
  items,
  emptyTitle,
  emptyDescription,
  action,
  renderItem,
}: {
  title: string;
  icon: typeof CalendarDays;
  items: T[];
  emptyTitle: string;
  emptyDescription: string;
  action?: ReactNode;
  renderItem: (item: T) => ReactNode;
}) {
  return (
    <CollapsiblePanel title={title} icon={icon} defaultOpen={items.length > 0}>
      {items.length ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index}>{renderItem(item)}</div>
          ))}
          {action && <div className="pt-1">{action}</div>}
        </div>
      ) : (
        <EmptyState title={emptyTitle} description={emptyDescription} action={action} />
      )}
    </CollapsiblePanel>
  );
}

function RecordRow({
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
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="break-words font-semibold text-slate-900">{title}</p>
          {meta && <p className="mt-1 text-sm text-slate-500">{meta}</p>}
          {description && <p className="mt-1 break-words text-sm text-slate-600">{description}</p>}
        </div>
        {accessory && <div className="shrink-0">{accessory}</div>}
      </div>
    </div>
  );
}

function PrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 sm:w-auto"
    >
      {children}
    </Link>
  );
}

function byDateDesc<T>(records: T[], getValue: (record: T) => string | undefined) {
  return [...records].sort((a, b) => {
    const first = new Date(getValue(a) ?? 0).getTime();
    const second = new Date(getValue(b) ?? 0).getTime();
    return second - first;
  });
}

async function loadPatient(id: string) {
  try {
    return await getPatientDetails(id);
  } catch (error) {
    if (error instanceof AdminServiceError) {
      notFound();
    }
    throw error;
  }
}
