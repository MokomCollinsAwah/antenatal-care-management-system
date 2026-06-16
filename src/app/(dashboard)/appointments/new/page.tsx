import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { AppointmentForm } from "@/features/appointments/components/AppointmentForm";
import { getAppointmentPatientOptions } from "@/features/appointments/queries";

export default async function NewAppointmentPage({ searchParams }: { searchParams: Promise<{ patientId?: string }> }) {
  const [{ patientId }, patients] = await Promise.all([searchParams, getAppointmentPatientOptions()]);
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Schedule Appointment" description="Create a scheduled appointment for a registered pregnant woman." />
      <Card><CardContent className="pt-6"><AppointmentForm patients={patients} initialPatientId={patientId} /></CardContent></Card>
    </div>
  );
}
