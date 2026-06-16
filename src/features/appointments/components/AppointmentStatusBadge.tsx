import { Badge } from "@/components/ui/Badge";
import { AppointmentStatus } from "@/lib/constants";
import type { AppointmentStatus as AppointmentStatusValue } from "@/types";

export function AppointmentStatusBadge({ status }: { status: AppointmentStatusValue }) {
  const variant =
    status === AppointmentStatus.SCHEDULED
      ? "scheduled"
      : status === AppointmentStatus.ATTENDED
        ? "attended"
        : status === AppointmentStatus.MISSED
          ? "missed"
          : "cancelled";
  return <Badge variant={variant}>{status}</Badge>;
}
