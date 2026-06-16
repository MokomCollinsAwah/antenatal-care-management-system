import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { HealthCentreOption, HealthWorkerOption, PatientListFilters } from "@/types";

export function PatientSearchFilters({
  filters,
  healthCentres,
  healthWorkers,
  showAssignmentFilters,
}: {
  filters: PatientListFilters;
  healthCentres: HealthCentreOption[];
  healthWorkers: HealthWorkerOption[];
  showAssignmentFilters: boolean;
}) {
  return (
    <form className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
      <Input
        name="search"
        defaultValue={filters.search}
        placeholder="Search name, phone, address, or health centre"
        aria-label="Search patients"
      />
      {showAssignmentFilters && (
        <>
          <Select
            name="healthCentreId"
            defaultValue={filters.healthCentreId}
            placeholder="All centres"
            options={healthCentres}
            aria-label="Filter by health centre"
          />
          <Select
            name="assignedHealthWorkerId"
            defaultValue={filters.assignedHealthWorkerId}
            placeholder="All workers"
            options={healthWorkers}
            aria-label="Filter by assigned health worker"
          />
        </>
      )}
      <Input
        name="expectedDeliveryDateFrom"
        type="date"
        defaultValue={filters.expectedDeliveryDateFrom}
        aria-label="Expected delivery date from"
      />
      <Input
        name="expectedDeliveryDateTo"
        type="date"
        defaultValue={filters.expectedDeliveryDateTo}
        aria-label="Expected delivery date to"
      />
      <button
        type="submit"
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        <Search className="size-4" />
        Filter
      </button>
    </form>
  );
}
