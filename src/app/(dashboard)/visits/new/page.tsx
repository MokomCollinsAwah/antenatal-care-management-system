import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { VisitForm } from "@/features/visits/components/VisitForm";
import { getAppointmentDetails } from "@/features/appointments/queries";
import { AppointmentStatus } from "@/lib/constants";
import { AdminServiceError } from "@/server/services/adminServiceError";

export default async function NewVisitPage({ searchParams }: { searchParams: Promise<{ appointmentId?: string }> }) {
  const { appointmentId } = await searchParams;
  if (!appointmentId) notFound();
  const appointment = await loadAppointment(appointmentId);
  if (appointment.status !== AppointmentStatus.SCHEDULED) notFound();
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Record Visit" description={`Mark appointment attended and record visit for ${appointment.patientName}.`} />
      <Card><CardContent className="pt-6"><VisitForm appointment={appointment} /></CardContent></Card>
    </div>
  );
}

async function loadAppointment(id: string) {
  try { return await getAppointmentDetails(id); } catch (error) { if (error instanceof AdminServiceError) notFound(); throw error; }
}
