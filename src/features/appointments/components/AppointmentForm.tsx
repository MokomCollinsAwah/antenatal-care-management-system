"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createAppointmentAction } from "@/features/appointments/actions";
import { Button } from "@/components/ui/Button";
import { FeedbackAlert } from "@/components/ui/FeedbackAlert";
import { FormSection } from "@/components/ui/FormSection";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { APPOINTMENT_TYPE_OPTIONS, AppointmentType } from "@/lib/constants";
import { createAppointmentSchema } from "@/lib/validations";
import type { ActionResult, PatientOption } from "@/types";

type Values = z.input<typeof createAppointmentSchema>;

export function AppointmentForm({ patients, initialPatientId }: { patients: PatientOption[]; initialPatientId?: string }) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult<{ id: string }>>();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: { patientId: initialPatientId ?? "", appointmentType: AppointmentType.ANTENATAL_VISIT, scheduledDateTime: "", reason: "", notes: "" },
  });
  const onSubmit = async (values: Values) => {
    const response = await createAppointmentAction(values);
    setResult(response);
    if (response.success && response.data?.id) {
      router.push(`/appointments/${response.data.id}`);
      router.refresh();
    }
  };
  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])} noValidate>
      <FeedbackAlert message={result?.message} success={result?.success} />
      <FormSection title="Appointment Information">
        <div className="grid gap-5 md:grid-cols-2">
          <Select label="Patient" required placeholder="Select patient" options={patients} error={errors.patientId?.message ?? result?.errors?.patientId?.[0]} {...register("patientId")} />
          <Select label="Appointment Type" required options={APPOINTMENT_TYPE_OPTIONS} error={errors.appointmentType?.message ?? result?.errors?.appointmentType?.[0]} {...register("appointmentType")} />
          <Input label="Scheduled Date and Time" required type="datetime-local" error={errors.scheduledDateTime?.message ?? result?.errors?.scheduledDateTime?.[0]} {...register("scheduledDateTime")} />
          <Input label="Reason (optional)" error={errors.reason?.message ?? result?.errors?.reason?.[0]} {...register("reason")} />
          <Textarea label="Notes (optional)" error={errors.notes?.message ?? result?.errors?.notes?.[0]} {...register("notes")} />
        </div>
      </FormSection>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href="/appointments" className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</Link>
        <Button type="submit" loading={isSubmitting}>Schedule Appointment</Button>
      </div>
    </form>
  );
}
