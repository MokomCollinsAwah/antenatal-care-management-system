import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { PageHeader } from "@/components/ui/PageHeader";
import { HealthCentreTable } from "@/features/admin/health-centres/components/HealthCentreTable";
import { getHealthCentres } from "@/features/admin/health-centres/queries";
import { getPageNumber, paginate } from "@/lib/pagination";

export default async function HealthCentresPage({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const params = await searchParams;
  const healthCentres = await getHealthCentres();
  const page = paginate(healthCentres, getPageNumber(params.page));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Health Centres"
        description="Manage health facilities where antenatal care records are handled."
        action={
          <Link
            href="/admin/health-centres/new"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
          >
            <Plus className="size-4" />
            Add Health Centre
          </Link>
        }
      />
      <Card>
        <CardContent className="p-0">
          <HealthCentreTable healthCentres={page.items} />
          <Pagination {...page} searchParams={params} />
        </CardContent>
      </Card>
    </div>
  );
}
