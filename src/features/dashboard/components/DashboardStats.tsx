import {
  Bell,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
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
    totalAppointments: number;
    upcomingAppointments: number;
    missedAppointments: number;
    totalVisits: number;
    totalScans: number;
    pendingFollowUps: number;
    dueReminders: number;
  };
}) {
  const cards = [
    { title: "Total Pregnant Women", value: stats.totalPregnantWomen, icon: Users },
    { title: "Total Appointments", value: stats.totalAppointments, icon: CalendarDays },
    { title: "Upcoming Appointments", value: stats.upcomingAppointments, icon: CalendarClock },
    { title: "Missed Appointments", value: stats.missedAppointments, icon: CalendarX },
    { title: "Total Visits", value: stats.totalVisits, icon: CalendarCheck },
    { title: "Total Scans", value: stats.totalScans, icon: ScanLine },
    { title: "Pending Follow-ups", value: stats.pendingFollowUps, icon: ClipboardList },
    { title: "Due Reminders", value: stats.dueReminders, icon: Bell },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {cards.map((card) => <StatCard key={card.title} {...card} />)}
    </div>
  );
}
