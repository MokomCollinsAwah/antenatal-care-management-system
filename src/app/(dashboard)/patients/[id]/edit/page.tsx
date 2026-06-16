import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getHealthCentresForSelect } from "@/features/admin/health-centres/queries";
import { PatientForm } from "@/features/patients/components/PatientForm";
import {
  getAssignableHealthWorkers,
  getPatientDetails,
} from "@/features/patients/queries";
import { getCurrentUser } from "@/lib/auth-utils";
import { UserRole } from "@/lib/constants";
import { AdminServiceError } from "@/server/services/adminServiceError";

export default async function EditPatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [patient, healthCentres, healthWorkers, user] = await Promise.all([
    loadPatient(id),
    getHealthCentresForSelect(),
    getAssignableHealthWorkers(),
    getCurrentUser(),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Edit Patient"
        description="Update patient account and antenatal profile information."
      />
      <Card>
        <CardContent className="pt-6">
          <PatientForm
            mode="edit"
            patient={patient}
            healthCentres={healthCentres}
            healthWorkers={healthWorkers}
            isAdmin={user?.role === UserRole.ADMIN}
          />
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
