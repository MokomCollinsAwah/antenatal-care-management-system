import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ReminderFilters } from "@/features/reminders/components/ReminderFilters";
import { ReminderTable } from "@/features/reminders/components/ReminderTable";
import { getReminders } from "@/features/reminders/queries";
import type { ClinicalRecordFilters } from "@/types";

export default async function RemindersPage({ searchParams }: { searchParams: Promise<ClinicalRecordFilters> }) {
  const filters = await searchParams;
  const reminders = await getReminders(filters);
  return (
    <div className="space-y-6">
      <PageHeader title="Reminders" description="Review in-system care reminders and update their status." />
      <Card><CardContent className="pt-6"><ReminderFilters filters={filters} /></CardContent></Card>
      <Card><CardContent className="p-0"><ReminderTable reminders={reminders} /></CardContent></Card>
    </div>
  );
}
