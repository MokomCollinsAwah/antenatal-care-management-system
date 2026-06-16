import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FOLLOW_UP_METHOD_OPTIONS, FOLLOW_UP_OUTCOME_OPTIONS } from "@/lib/constants";
import type { ClinicalRecordFilters, HealthCentreOption } from "@/types";

export function FollowUpFilters({ filters, healthCentres }: { filters: ClinicalRecordFilters; healthCentres: HealthCentreOption[] }) {
  return (
    <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_170px_170px_190px_auto]">
      <Input name="search" defaultValue={filters.search} placeholder="Search patient name or phone" />
      <Select name="method" defaultValue={filters.method} placeholder="All methods" options={FOLLOW_UP_METHOD_OPTIONS} />
      <Select name="outcome" defaultValue={filters.outcome} placeholder="All outcomes" options={FOLLOW_UP_OUTCOME_OPTIONS} />
      <Select name="healthCentreId" defaultValue={filters.healthCentreId} placeholder="All centres" options={healthCentres} />
      <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
        <Search className="size-4" /> Filter
      </button>
    </form>
  );
}
