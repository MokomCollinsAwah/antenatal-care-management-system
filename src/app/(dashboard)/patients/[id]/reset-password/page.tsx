import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { PatientResetPasswordForm } from "@/features/patients/components/PatientResetPasswordForm";
import { getPatientDetails } from "@/features/patients/queries";
import { AdminServiceError } from "@/server/services/adminServiceError";

export default async function ResetPatientPasswordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await loadPatient(id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Reset Patient Password"
        description={`Reset ${patient.fullName}'s password to the default temporary password.`}
      />
      <Card>
        <CardContent className="pt-6">
          <PatientResetPasswordForm patientId={patient.id} />
        </CardContent>
      </Card>
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
