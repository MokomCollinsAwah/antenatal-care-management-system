import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { HealthCentreForm } from "@/features/admin/health-centres/components/HealthCentreForm";
import { getHealthCentreDetails } from "@/features/admin/health-centres/queries";
import { AdminServiceError } from "@/server/services/adminServiceError";

export default async function EditHealthCentrePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const centre = await loadHealthCentre(id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Edit Health Centre"
        description={`Update details for ${centre.name}.`}
      />
      <Card>
        <CardContent className="pt-6">
          <HealthCentreForm
            healthCentreId={centre.id}
            initialValues={{
              name: centre.name,
              location: centre.location,
              phone: centre.phone ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

async function loadHealthCentre(id: string) {
  try {
    return await getHealthCentreDetails(id);
  } catch (error) {
    if (error instanceof AdminServiceError) {
      notFound();
    }
    throw error;
  }
}
