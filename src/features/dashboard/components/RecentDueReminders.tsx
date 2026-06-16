import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PatientReminderList } from "@/features/reminders/components/PatientReminderList";
import type { ReminderSummary } from "@/types";

export function RecentDueReminders({ reminders }: { reminders: ReminderSummary[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Recent Due Reminders</CardTitle></CardHeader>
      <CardContent>
        {reminders.length ? <PatientReminderList reminders={reminders} /> : <EmptyState title="No due reminders" description="Due reminders will appear here." />}
      </CardContent>
    </Card>
  );
}
