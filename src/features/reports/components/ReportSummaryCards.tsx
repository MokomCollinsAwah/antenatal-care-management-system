import {
  Activity,
  Bell,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  ClipboardList,
  ScanLine,
  Stethoscope,
  Users,
  XCircle,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";

export function ReportSummaryCards({
  summary,
}: {
  summary: {
    totalRegisteredPregnantWomen: number;
    totalScheduledAppointments: number;
    totalAttendedAppointments: number;
    totalMissedAppointments: number;
    totalCancelledAppointments: number;
    totalVisitRecords: number;
    totalActiveSupplements: number;
    totalScanRecords: number;
    totalFollowUps: number;
    totalReminders: number;
  };
}) {
  const cards = [
    { title: "Registered Pregnant Women", value: summary.totalRegisteredPregnantWomen, icon: Users },
    { title: "Scheduled Appointments", value: summary.totalScheduledAppointments, icon: CalendarClock },
    { title: "Attended Appointments", value: summary.totalAttendedAppointments, icon: CalendarCheck },
    { title: "Missed Appointments", value: summary.totalMissedAppointments, icon: CalendarX },
    { title: "Cancelled Appointments", value: summary.totalCancelledAppointments, icon: XCircle },
    { title: "Visit Records", value: summary.totalVisitRecords, icon: Stethoscope },
    { title: "Active Supplements", value: summary.totalActiveSupplements, icon: Activity },
    { title: "Scan Records", value: summary.totalScanRecords, icon: ScanLine },
    { title: "Follow-ups", value: summary.totalFollowUps, icon: ClipboardList },
    { title: "Reminders", value: summary.totalReminders, icon: Bell },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
      {cards.map((card) => <StatCard key={card.title} {...card} />)}
    </div>
  );
}
