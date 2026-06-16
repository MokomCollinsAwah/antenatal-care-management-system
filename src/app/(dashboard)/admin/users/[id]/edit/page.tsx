import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getHealthCentresForSelect } from "@/features/admin/health-centres/queries";
import { HealthWorkerForm } from "@/features/admin/users/components/HealthWorkerForm";
import { getUserDetails } from "@/features/admin/users/queries";
import { UserRole, UserStatus } from "@/lib/constants";
import { AdminServiceError } from "@/server/services/adminServiceError";

export default async function EditHealthWorkerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, healthCentres] = await Promise.all([
    loadUser(id),
    getHealthCentresForSelect(),
  ]);

  if (user.role !== UserRole.HEALTH_WORKER || !user.healthCentreId) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Edit Health Worker"
        description={`Update account details for ${user.fullName}.`}
      />
      <Card>
        <CardContent className="pt-6">
          <HealthWorkerForm
            mode="edit"
            userId={user.id}
            healthCentres={healthCentres}
            initialValues={{
              fullName: user.fullName,
              phone: user.phone,
              email: user.email ?? "",
              healthCentreId: user.healthCentreId,
              status: user.status as UserStatus,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

async function loadUser(id: string) {
  try {
    return await getUserDetails(id);
  } catch (error) {
    if (error instanceof AdminServiceError) {
      notFound();
    }
    throw error;
  }
}
