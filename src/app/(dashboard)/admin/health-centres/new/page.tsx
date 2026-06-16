import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { HealthCentreForm } from "@/features/admin/health-centres/components/HealthCentreForm";

export default function NewHealthCentrePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Add Health Centre"
        description="Register a facility where antenatal care services are managed."
      />
      <Card>
        <CardContent className="pt-6">
          <HealthCentreForm />
        </CardContent>
      </Card>
    </div>
  );
}
