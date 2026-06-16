"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createFollowUpAction } from "@/features/followups/actions";
import { Button } from "@/components/ui/Button";
import { FeedbackAlert } from "@/components/ui/FeedbackAlert";
import { FormSection } from "@/components/ui/FormSection";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { FOLLOW_UP_METHOD_OPTIONS, FOLLOW_UP_OUTCOME_OPTIONS, FollowUpMethod, FollowUpOutcome } from "@/lib/constants";
import { createFollowUpRecordSchema } from "@/lib/validations";
import type { ActionResult, PatientOption } from "@/types";

type Values = z.input<typeof createFollowUpRecordSchema>;

export function FollowUpForm({ patients, initialPatientId, initialAppointmentId }: { patients: PatientOption[]; initialPatientId?: string; initialAppointmentId?: string }) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult<{ id: string }>>();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(createFollowUpRecordSchema),
    defaultValues: {
      patientId: initialPatientId ?? "",
      appointmentId: initialAppointmentId ?? "",
      followUpDate: "",
      method: FollowUpMethod.CALL,
      outcome: FollowUpOutcome.PENDING,
      notes: "",
    },
  });
  const onSubmit = async (values: Values) => {
    const response = await createFollowUpAction(values);
    setResult(response);
    if (response.success) {
      router.push(values.patientId ? `/patients/${values.patientId}` : "/follow-ups");
      router.refresh();
    }
  };
  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}>
      <FeedbackAlert message={result?.message} success={result?.success} />
      <FormSection title="Follow-up Information">
        <div className="grid gap-5 md:grid-cols-2">
          <Select label="Patient" placeholder="Select patient" options={patients} error={errors.patientId?.message ?? result?.errors?.patientId?.[0]} {...register("patientId")} />
          <Input label="Related Appointment ID (optional)" readOnly={Boolean(initialAppointmentId)} error={errors.appointmentId?.message ?? result?.errors?.appointmentId?.[0]} {...register("appointmentId")} />
          <Input label="Follow-up Date and Time" type="datetime-local" error={errors.followUpDate?.message ?? result?.errors?.followUpDate?.[0]} {...register("followUpDate")} />
          <Select label="Method" options={FOLLOW_UP_METHOD_OPTIONS} error={errors.method?.message ?? result?.errors?.method?.[0]} {...register("method")} />
          <Select label="Outcome" options={FOLLOW_UP_OUTCOME_OPTIONS} error={errors.outcome?.message ?? result?.errors?.outcome?.[0]} {...register("outcome")} />
          <Textarea label="Notes (optional)" error={errors.notes?.message ?? result?.errors?.notes?.[0]} {...register("notes")} />
        </div>
      </FormSection>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href="/follow-ups" className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</Link>
        <Button type="submit" loading={isSubmitting}>Save Follow-up</Button>
      </div>
    </form>
  );
}
