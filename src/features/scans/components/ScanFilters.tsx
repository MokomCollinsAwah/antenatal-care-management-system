import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { ClinicalRecordFilters, HealthCentreOption } from "@/types";

export function ScanFilters({ filters, healthCentres }: { filters: ClinicalRecordFilters; healthCentres: HealthCentreOption[] }) {
  return (
    <form className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
      <Input name="search" defaultValue={filters.search} placeholder="Search patient name or phone" />
      <Select name="healthCentreId" defaultValue={filters.healthCentreId} placeholder="All centres" options={healthCentres} />
      <Input name="dateFrom" type="date" defaultValue={filters.dateFrom} aria-label="Date from" />
      <Input name="dateTo" type="date" defaultValue={filters.dateTo} aria-label="Date to" />
      <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
        <Search className="size-4" /> Filter
      </button>
    </form>
  );
}
