import { Badge } from "@/components/ui/Badge";
import { ReminderStatus } from "@/lib/constants";
import type { ReminderStatus as ReminderStatusValue } from "@/types";

export function ReminderStatusBadge({ status }: { status: ReminderStatusValue }) {
  const variant =
    status === ReminderStatus.PENDING
      ? "pending"
      : status === ReminderStatus.DUE
        ? "due"
        : "neutral";
  return <Badge variant={variant}>{status.replaceAll("_", " ")}</Badge>;
}
