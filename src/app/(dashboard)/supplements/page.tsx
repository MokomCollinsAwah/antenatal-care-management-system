import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getHealthCentresForSelect } from "@/features/admin/health-centres/queries";
import { SupplementFilters } from "@/features/supplements/components/SupplementFilters";
import { SupplementTable } from "@/features/supplements/components/SupplementTable";
import { getSupplements } from "@/features/supplements/queries";
import type { ClinicalRecordFilters } from "@/types";

export default async function SupplementsPage({ searchParams }: { searchParams: Promise<ClinicalRecordFilters> }) {
  const filters = await searchParams;
  const [supplements, healthCentres] = await Promise.all([getSupplements(filters), getHealthCentresForSelect()]);
  return (
    <div className="space-y-6">
      <PageHeader title="Supplements" description="Track supplement plans, instructions, and status." action={<Link href="/supplements/new" className="inline-flex h-11 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"><Plus className="size-4" /> New Supplement</Link>} />
      <Card><CardContent className="pt-6"><SupplementFilters filters={filters} healthCentres={healthCentres} /></CardContent></Card>
      <Card><CardContent className="p-0"><SupplementTable supplements={supplements} /></CardContent></Card>
    </div>
  );
}
