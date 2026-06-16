import {
  Activity,
  Bell,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  ClipboardList,
  ScanLine,
  Users,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";

export function DashboardStats({
  stats,
}: {
  stats: {
    totalPregnantWomen: number;
    upcomingAppointments: number;
    missedAppointments: number;
    completedVisits: number;
    activeSupplements: number;
    pendingFollowUps: number;
    dueReminders: number;
    recentScans: number;
  };
}) {
  const cards = [
    { title: "Total Pregnant Women", value: stats.totalPregnantWomen, icon: Users },
    { title: "Upcoming Appointments", value: stats.upcomingAppointments, icon: CalendarClock },
    { title: "Missed Appointments", value: stats.missedAppointments, icon: CalendarX },
    { title: "Completed Visits", value: stats.completedVisits, icon: CalendarCheck },
    { title: "Active Supplements", value: stats.activeSupplements, icon: Activity },
    { title: "Pending Follow-ups", value: stats.pendingFollowUps, icon: ClipboardList },
    { title: "Due Reminders", value: stats.dueReminders, icon: Bell },
    { title: "Recent Scans", value: stats.recentScans, icon: ScanLine },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {cards.map((card) => <StatCard key={card.title} {...card} />)}
    </div>
  );
}
