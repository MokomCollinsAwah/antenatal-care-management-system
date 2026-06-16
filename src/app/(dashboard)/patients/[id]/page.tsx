import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PatientFutureSections } from "@/features/patients/components/PatientFutureSections";
import { PatientProfileDetails } from "@/features/patients/components/PatientProfileDetails";
import { getPatientDetails } from "@/features/patients/queries";
import { getAppointmentsForPatient } from "@/features/appointments/queries";
import { getVisitsForPatient } from "@/features/visits/queries";
import { AppointmentStatusBadge } from "@/features/appointments/components/AppointmentStatusBadge";
import { formatDateTime } from "@/lib/utils";
import { AdminServiceError } from "@/server/services/adminServiceError";

export default async function PatientDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [patient, appointments, visits] = await Promise.all([
    loadPatient(id),
    getAppointmentsForPatient(id),
    getVisitsForPatient(id),
  ]);

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
          </div>
        }
      />
      <PatientProfileDetails patient={patient} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length ? (
              <div className="space-y-3">
                {appointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
                    <div>
                      <p className="font-semibold text-slate-900">{appointment.appointmentType.replaceAll("_", " ")}</p>
                      <p className="text-sm text-slate-500">{formatDateTime(appointment.scheduledDateTime)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <AppointmentStatusBadge status={appointment.status} />
                      <Link href={`/appointments/${appointment.id}`} className="text-sm font-semibold text-teal-700">View</Link>
                    </div>
                  </div>
                ))}
                <Link href={`/appointments/new?patientId=${patient.id}`} className="inline-flex h-10 items-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800">Schedule new appointment</Link>
              </div>
            ) : (
              <EmptyState title="No appointments yet" description="Schedule this patient's first appointment." action={<Link href={`/appointments/new?patientId=${patient.id}`} className="inline-flex h-10 items-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800">Schedule Appointment</Link>} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Visits</CardTitle>
          </CardHeader>
          <CardContent>
            {visits.length ? (
              <div className="space-y-3">
                {visits.slice(0, 5).map((visit) => (
                  <div key={visit.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900">{formatDateTime(visit.visitDate)}</p>
                      <Link href={`/appointments/${visit.appointmentId}`} className="text-sm font-semibold text-teal-700">View appointment</Link>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">BP: {visit.systolicBP && visit.diastolicBP ? `${visit.systolicBP}/${visit.diastolicBP}` : "—"} · Weight: {visit.weightKg ? `${visit.weightKg} kg` : "—"}</p>
                    {visit.advice && <p className="mt-1 text-sm text-slate-600">{visit.advice}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No visits yet" description="Visit records are created when scheduled appointments are marked attended." />
            )}
          </CardContent>
        </Card>
      </div>
      <PatientFutureSections />
    </div>
  );
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
