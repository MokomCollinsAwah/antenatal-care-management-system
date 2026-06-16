import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { APPOINTMENT_STATUS_OPTIONS } from "@/lib/constants";
import type { HealthCentreOption, ReportFilters as ReportFiltersValue } from "@/types";

export function ReportFilters({
  filters,
  healthCentres,
}: {
  filters: ReportFiltersValue;
  healthCentres: HealthCentreOption[];
}) {
  return (
    <form className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
      <Input name="startDate" type="date" defaultValue={filters.startDate} aria-label="Start date" />
      <Input name="endDate" type="date" defaultValue={filters.endDate} aria-label="End date" />
      <Select name="healthCentreId" defaultValue={filters.healthCentreId} placeholder="All centres" options={healthCentres} />
      <Select name="status" defaultValue={filters.status} placeholder="All appointment statuses" options={APPOINTMENT_STATUS_OPTIONS} />
      <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
        <Search className="size-4" /> Filter
      </button>
    </form>
  );
}
