import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { VisitTable } from "@/features/visits/components/VisitTable";
import { getVisits } from "@/features/visits/queries";
import { getHealthCentresForSelect } from "@/features/admin/health-centres/queries";
import { getPageNumber, paginate } from "@/lib/pagination";
import type { VisitListFilters } from "@/types";

type VisitSearchParams = VisitListFilters & { page?: string | string[] };

export default async function VisitsPage({ searchParams }: { searchParams: Promise<VisitSearchParams> }) {
  const filters = await searchParams;
  const [visits, healthCentres] = await Promise.all([getVisits(filters), getHealthCentresForSelect()]);
  const page = paginate(visits, getPageNumber(filters.page));
  return (
    <div className="space-y-6">
      <PageHeader title="Visits" description="View recorded antenatal visit records." />
      <Card><CardContent className="pt-6"><form className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]"><Input name="search" defaultValue={filters.search} placeholder="Search patient name or phone" /><Input name="dateFrom" type="date" defaultValue={filters.dateFrom} /><Input name="dateTo" type="date" defaultValue={filters.dateTo} /><Select name="healthCentreId" defaultValue={filters.healthCentreId} placeholder="All centres" options={healthCentres} /><button className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm font-semibold">Filter</button></form></CardContent></Card>
      <Card><CardContent className="p-0"><VisitTable visits={page.items} /><Pagination {...page} searchParams={filters} /></CardContent></Card>
    </div>
  );
}
