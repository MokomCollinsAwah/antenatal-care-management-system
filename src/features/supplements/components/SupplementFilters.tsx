import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SUPPLEMENT_STATUS_OPTIONS } from "@/lib/constants";
import type { ClinicalRecordFilters, HealthCentreOption } from "@/types";

export function SupplementFilters({ filters, healthCentres }: { filters: ClinicalRecordFilters; healthCentres: HealthCentreOption[] }) {
  return (
    <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_190px_190px_auto]">
      <Input name="search" defaultValue={filters.search} placeholder="Search patient name or phone" />
      <Select name="status" defaultValue={filters.status} placeholder="All statuses" options={SUPPLEMENT_STATUS_OPTIONS} />
      <Select name="healthCentreId" defaultValue={filters.healthCentreId} placeholder="All centres" options={healthCentres} />
      <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
        <Search className="size-4" /> Filter
      </button>
    </form>
  );
}
