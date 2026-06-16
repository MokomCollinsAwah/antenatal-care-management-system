import { Badge } from "@/components/ui/Badge";
import { SupplementStatus } from "@/lib/constants";
import type { SupplementStatus as SupplementStatusValue } from "@/types";

export function SupplementStatusBadge({ status }: { status: SupplementStatusValue }) {
  const variant =
    status === SupplementStatus.ACTIVE
      ? "active"
      : status === SupplementStatus.COMPLETED
        ? "read"
        : "stopped";
  return <Badge variant={variant}>{status.replaceAll("_", " ")}</Badge>;
}
