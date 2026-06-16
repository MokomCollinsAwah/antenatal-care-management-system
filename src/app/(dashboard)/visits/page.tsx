import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { VisitTable } from "@/features/visits/components/VisitTable";
import { getVisits } from "@/features/visits/queries";
import { getHealthCentresForSelect } from "@/features/admin/health-centres/queries";
import type { VisitListFilters } from "@/types";

export default async function VisitsPage({ searchParams }: { searchParams: Promise<VisitListFilters> }) {
  const filters = await searchParams;
  const [visits, healthCentres] = await Promise.all([getVisits(filters), getHealthCentresForSelect()]);
  return (
    <div className="space-y-6">
      <PageHeader title="Visits" description="View recorded antenatal visit records." />
      <Card><CardContent className="pt-6"><form className="grid gap-4 md:grid-cols-[1fr_180px_180px_180px_auto]"><Input name="search" defaultValue={filters.search} placeholder="Search patient name or phone" /><Input name="dateFrom" type="date" defaultValue={filters.dateFrom} /><Input name="dateTo" type="date" defaultValue={filters.dateTo} /><Select name="healthCentreId" defaultValue={filters.healthCentreId} placeholder="All centres" options={healthCentres} /><button className="h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold">Filter</button></form></CardContent></Card>
      <Card><CardContent className="p-0"><VisitTable visits={visits} /></CardContent></Card>
    </div>
  );
}
