import { PageHeader } from "@/components/ui/PageHeader";
import { getAppointmentDetails, getAppointmentPatientOptions } from "@/features/appointments/queries";
import { FollowUpForm } from "@/features/followups/components/FollowUpForm";
import { AdminServiceError } from "@/server/services/adminServiceError";

export default async function NewFollowUpPage({ searchParams }: { searchParams: Promise<{ patientId?: string; appointmentId?: string }> }) {
  const params = await searchParams;
  const [patients, appointment] = await Promise.all([
    getAppointmentPatientOptions(),
    params.appointmentId ? loadAppointment(params.appointmentId) : Promise.resolve(null),
  ]);
  return (
    <div className="space-y-6">
      <PageHeader title="New Follow-up Record" description="Track patient contact and follow-up outcomes." />
      <FollowUpForm patients={patients} initialPatientId={appointment?.patientId ?? params.patientId} initialAppointmentId={appointment?.id ?? params.appointmentId} />
    </div>
  );
}

async function loadAppointment(id: string) {
  try {
    return await getAppointmentDetails(id);
  } catch (error) {
    if (error instanceof AdminServiceError) return null;
    throw error;
  }
}
