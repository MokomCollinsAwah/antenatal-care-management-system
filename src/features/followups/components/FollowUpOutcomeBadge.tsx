import { Badge } from "@/components/ui/Badge";
import { FollowUpOutcome } from "@/lib/constants";
import type { FollowUpOutcome as FollowUpOutcomeValue } from "@/types";

export function FollowUpOutcomeBadge({ outcome }: { outcome: FollowUpOutcomeValue }) {
  const variant =
    outcome === FollowUpOutcome.CONTACTED || outcome === FollowUpOutcome.VISITED
      ? "active"
      : outcome === FollowUpOutcome.NOT_REACHED
        ? "cancelled"
        : outcome === FollowUpOutcome.RESCHEDULED
          ? "read"
          : "pending";
  return <Badge variant={variant}>{outcome.replaceAll("_", " ")}</Badge>;
}
