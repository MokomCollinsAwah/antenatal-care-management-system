import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { REMINDER_STATUS_OPTIONS, REMINDER_TYPE_OPTIONS } from "@/lib/constants";
import type { ClinicalRecordFilters } from "@/types";

export function ReminderFilters({ filters }: { filters: ClinicalRecordFilters }) {
  return (
    <form className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
      <Input name="search" defaultValue={filters.search} placeholder="Search patient name or phone" />
      <Select name="type" defaultValue={filters.type} placeholder="All types" options={REMINDER_TYPE_OPTIONS} />
      <Select name="status" defaultValue={filters.status} placeholder="All statuses" options={REMINDER_STATUS_OPTIONS} />
      <Input name="dateFrom" type="date" defaultValue={filters.dateFrom} aria-label="Due from" />
      <Input name="dateTo" type="date" defaultValue={filters.dateTo} aria-label="Due to" />
      <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
        <Search className="size-4" /> Filter
      </button>
    </form>
  );
}
