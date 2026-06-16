import {
  Activity,
  Bell,
  CalendarCheck,
  CalendarClock,
  ClipboardCheck,
  ListTodo,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";

const stats = [
  { title: "Total Pregnant Women", value: "—", icon: Users },
  { title: "Upcoming Appointments", value: "—", icon: CalendarClock },
  { title: "Missed Appointments", value: "—", icon: CalendarCheck },
  { title: "Completed Visits", value: "—", icon: ClipboardCheck },
  { title: "Active Supplements", value: "—", icon: Activity },
  { title: "Pending Follow-ups", value: "—", icon: ListTodo },
  { title: "Due Reminders", value: "—", icon: Bell },
];

interface DashboardPlaceholderProps {
  fullName: string;
  subtitle: string;
}

export function DashboardPlaceholder({
  fullName,
  subtitle,
}: DashboardPlaceholderProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${fullName}`}
        description={subtitle}
      />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s activity</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Dashboard data will appear here"
            description="Appointments, visits, reminders, and follow-ups will be connected in later implementation steps."
          />
        </CardContent>
      </Card>
    </div>
  );
}
