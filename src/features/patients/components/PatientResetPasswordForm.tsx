"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { resetPatientPasswordAction } from "@/features/patients/actions";
import { Button } from "@/components/ui/Button";
import { FeedbackAlert } from "@/components/ui/FeedbackAlert";
import { DEFAULT_TEMPORARY_PASSWORD } from "@/lib/constants";
import type { ActionResult } from "@/types";

export function PatientResetPasswordForm({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult<{ id: string }>>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async () => {
    setIsSubmitting(true);
    const response = await resetPatientPasswordAction(patientId);
    setResult(response);
    setIsSubmitting(false);
    if (response.success) {
      router.push(`/patients/${patientId}`);
      router.refresh();
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
      className="space-y-5"
    >
      <FeedbackAlert message={result?.message} success={result?.success} />
      <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
        This will reset the account password to{" "}
        <span className="font-semibold">{DEFAULT_TEMPORARY_PASSWORD}</span> and
        require the patient to change it at next login.
      </p>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={`/patients/${patientId}`}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>
        <Button type="submit" loading={isSubmitting}>
          Reset to Default Password
        </Button>
      </div>
    </form>
  );
}
