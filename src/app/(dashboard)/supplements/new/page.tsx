import { PageHeader } from "@/components/ui/PageHeader";
import { SupplementForm } from "@/features/supplements/components/SupplementForm";
import { getAppointmentPatientOptions } from "@/features/appointments/queries";

export default async function NewSupplementPage({ searchParams }: { searchParams: Promise<{ patientId?: string }> }) {
  const [{ patientId }, patients] = await Promise.all([searchParams, getAppointmentPatientOptions()]);
  return (
    <div className="space-y-6">
      <PageHeader title="New Supplement Record" description="Record a supplement plan and create an in-system reminder." />
      <SupplementForm patients={patients} initialPatientId={patientId} />
    </div>
  );
}
