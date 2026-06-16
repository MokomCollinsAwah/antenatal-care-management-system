"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  cancelAppointmentAction,
  markAppointmentMissedAction,
} from "@/features/appointments/actions";
import { Button } from "@/components/ui/Button";
import { FeedbackAlert } from "@/components/ui/FeedbackAlert";
import { AppointmentStatus } from "@/lib/constants";
import type { ActionResult, AppointmentSummary } from "@/types";

export function AppointmentStatusActions({ appointment }: { appointment: AppointmentSummary }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult<{ id: string }>>();
  if (appointment.status !== AppointmentStatus.SCHEDULED) return null;

  const run = (kind: "missed" | "cancel") => {
    const ok =
      kind === "missed"
        ? confirm("Mark this appointment as missed?")
        : confirm("Cancel this appointment?");
    if (!ok) return;
    startTransition(async () => {
      const response =
        kind === "missed"
          ? await markAppointmentMissedAction(appointment.id)
          : await cancelAppointmentAction(appointment.id);
      setResult(response);
      if (response.success) router.refresh();
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/visits/new?appointmentId=${appointment.id}`}
          className="inline-flex h-9 items-center rounded-lg bg-teal-700 px-3 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Mark Attended
        </Link>
        <Button type="button" variant="outline" size="sm" loading={pending} onClick={() => run("missed")}>
          Mark Missed
        </Button>
        <Button type="button" variant="danger" size="sm" loading={pending} onClick={() => run("cancel")}>
          Cancel
        </Button>
      </div>
      {!result?.success && <FeedbackAlert message={result?.message} />}
    </div>
  );
}
