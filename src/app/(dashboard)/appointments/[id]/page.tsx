import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { AppointmentStatusActions } from "@/features/appointments/components/AppointmentStatusActions";
import { AppointmentStatusBadge } from "@/features/appointments/components/AppointmentStatusBadge";
import { getAppointmentDetails } from "@/features/appointments/queries";
import { AppointmentStatus } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { AdminServiceError } from "@/server/services/adminServiceError";

export default async function AppointmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const appointment = await loadAppointment(id);
  return (
    <div className="space-y-6">
      <PageHeader title="Appointment Details" description="View appointment information and status." action={<AppointmentStatusActions appointment={appointment} />} />
      <Card>
        <CardHeader><CardTitle>Appointment Information</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <Detail label="Patient" value={appointment.patientName} />
            <Detail label="Phone" value={appointment.patientPhone} />
            <Detail label="Health Centre" value={appointment.healthCentreName} />
            <Detail label="Appointment Type" value={appointment.appointmentType.replaceAll("_", " ")} />
            <Detail label="Scheduled Date/Time" value={formatDateTime(appointment.scheduledDateTime)} />
            <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</dt><dd className="mt-2"><AppointmentStatusBadge status={appointment.status} /></dd></div>
            <Detail label="Reason" value={appointment.reason || "—"} />
            <Detail label="Notes" value={appointment.notes || "—"} />
            <Detail label="Created By" value={appointment.createdByName} />
            <Detail label="Created At" value={formatDateTime(appointment.createdAt)} />
            <Detail label="Updated At" value={formatDateTime(appointment.updatedAt)} />
          </dl>
        </CardContent>
      </Card>
      {appointment.status === AppointmentStatus.ATTENDED && appointment.visit && (
        <Card><CardHeader><CardTitle>Visit Summary</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-600">Visit date: {formatDateTime(appointment.visit.visitDate)}</p><p className="mt-2 text-sm text-slate-600">Advice: {appointment.visit.advice || "—"}</p></CardContent></Card>
      )}
      {appointment.status === AppointmentStatus.MISSED && (
        <Card><CardContent className="pt-6"><EmptyState title="Missed appointment" description="Create a follow-up record to track contact with the patient." action={<Link href={`/follow-ups/new?appointmentId=${appointment.id}`} className="inline-flex h-10 items-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800">Create Follow-up</Link>} /></CardContent></Card>
      )}
      <Link href="/appointments" className="font-semibold text-teal-700">Back to appointments</Link>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd></div>;
}

async function loadAppointment(id: string) {
  try { return await getAppointmentDetails(id); } catch (error) { if (error instanceof AdminServiceError) notFound(); throw error; }
}
