import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { getHealthCentresForSelect } from "@/features/admin/health-centres/queries";
import { PatientForm } from "@/features/patients/components/PatientForm";
import { getAssignableHealthWorkers } from "@/features/patients/queries";
import { getCurrentUser } from "@/lib/auth-utils";
import { UserRole } from "@/lib/constants";

export default async function NewPatientPage() {
  const user = await getCurrentUser();
  const [healthCentres, healthWorkers] = await Promise.all([
    getHealthCentresForSelect(),
    getAssignableHealthWorkers(),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Register Pregnant Woman"
        description="Create a patient account and antenatal profile."
      />
      <Card>
        <CardContent className="pt-6">
          {healthCentres.length > 0 && healthWorkers.length > 0 ? (
            <PatientForm
              mode="create"
              healthCentres={healthCentres}
              healthWorkers={healthWorkers}
              isAdmin={user?.role === UserRole.ADMIN}
            />
          ) : (
            <EmptyState
              title="Health centre and worker required"
              description="Create at least one health centre and one health worker before registering patients."
              action={
                <Link
                  href="/admin/health-centres"
                  className="inline-flex h-10 items-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
                >
                  Manage Health Centres
                </Link>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
