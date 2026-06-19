import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getAppointmentPatientOptions } from "@/features/appointments/queries";
import { SupplementForm } from "@/features/supplements/components/SupplementForm";
import { getSupplementDetails } from "@/features/supplements/queries";
import { AdminServiceError } from "@/server/services/adminServiceError";

export default async function EditSupplementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [supplement, patients] = await Promise.all([
    loadSupplement(id),
    getAppointmentPatientOptions(),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Edit Supplement Record"
        description={`Update ${supplement.supplementName} for ${supplement.patientName}.`}
      />
      <Card>
        <CardContent className="pt-6">
          <SupplementForm patients={patients} supplement={supplement} />
        </CardContent>
      </Card>
    </div>
  );
}

async function loadSupplement(id: string) {
  try {
    return await getSupplementDetails(id);
  } catch (error) {
    if (error instanceof AdminServiceError) {
      notFound();
    }
    throw error;
  }
}
