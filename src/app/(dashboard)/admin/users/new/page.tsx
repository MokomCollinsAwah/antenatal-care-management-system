import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { getHealthCentresForSelect } from "@/features/admin/health-centres/queries";
import { HealthWorkerForm } from "@/features/admin/users/components/HealthWorkerForm";

export default async function NewHealthWorkerPage() {
  const healthCentres = await getHealthCentresForSelect();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Add Health Worker"
        description="Create a secure health worker account and assign a health centre."
      />
      <Card>
        <CardContent className="pt-6">
          {healthCentres.length > 0 ? (
            <HealthWorkerForm mode="create" healthCentres={healthCentres} />
          ) : (
            <EmptyState
              title="A health centre is required"
              description="Create a health centre before adding a health worker."
              action={
                <Link
                  href="/admin/health-centres/new"
                  className="inline-flex h-10 items-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
                >
                  Add Health Centre
                </Link>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
