import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getHealthCentresForSelect } from "@/features/admin/health-centres/queries";
import { ScanFilters } from "@/features/scans/components/ScanFilters";
import { ScanTable } from "@/features/scans/components/ScanTable";
import { getScans } from "@/features/scans/queries";
import type { ClinicalRecordFilters } from "@/types";

export default async function ScansPage({ searchParams }: { searchParams: Promise<ClinicalRecordFilters> }) {
  const filters = await searchParams;
  const [scans, healthCentres] = await Promise.all([getScans(filters), getHealthCentresForSelect()]);
  return (
    <div className="space-y-6">
      <PageHeader title="Scans" description="Organize scan schedules, brief notes, and future scan dates." action={<Link href="/scans/new" className="inline-flex h-11 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"><Plus className="size-4" /> New Scan</Link>} />
      <Card><CardContent className="pt-6"><ScanFilters filters={filters} healthCentres={healthCentres} /></CardContent></Card>
      <Card><CardContent className="p-0"><ScanTable scans={scans} /></CardContent></Card>
    </div>
  );
}
