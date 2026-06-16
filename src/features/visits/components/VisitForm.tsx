"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createVisitAction } from "@/features/visits/actions";
import { Button } from "@/components/ui/Button";
import { FeedbackAlert } from "@/components/ui/FeedbackAlert";
import { FormSection } from "@/components/ui/FormSection";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { createVisitRecordSchema } from "@/lib/validations";
import type { ActionResult, AppointmentSummary } from "@/types";

type Values = z.input<typeof createVisitRecordSchema>;

export function VisitForm({ appointment }: { appointment: AppointmentSummary }) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult<{ id: string; appointmentId: string }>>();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(createVisitRecordSchema),
    defaultValues: { appointmentId: appointment.id, patientId: appointment.patientId, visitDate: new Date().toISOString().slice(0, 10), weightKg: undefined, systolicBP: undefined, diastolicBP: undefined, complaint: "", advice: "", notes: "", nextAppointmentDate: "" },
  });
  const onSubmit = async (values: Values) => {
    const response = await createVisitAction(values);
    setResult(response);
    if (response.success) {
      router.push(`/appointments/${appointment.id}`);
      router.refresh();
    }
  };
  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <FeedbackAlert message={result?.message} success={result?.success} />
      <FormSection title="Visit Record" description="Record observations entered by the health worker. This does not diagnose complications.">
        <input type="hidden" {...register("appointmentId")} />
        <input type="hidden" {...register("patientId")} />
        <div className="grid gap-5 md:grid-cols-2">
          <Input label="Visit Date" type="date" error={errors.visitDate?.message ?? result?.errors?.visitDate?.[0]} {...register("visitDate")} />
          <Input label="Weight Kg (optional)" type="number" step="0.1" error={errors.weightKg?.message ?? result?.errors?.weightKg?.[0]} {...register("weightKg")} />
          <Input label="Systolic BP (optional)" type="number" error={errors.systolicBP?.message ?? result?.errors?.systolicBP?.[0]} {...register("systolicBP")} />
          <Input label="Diastolic BP (optional)" type="number" error={errors.diastolicBP?.message ?? result?.errors?.diastolicBP?.[0]} {...register("diastolicBP")} />
          <Textarea label="Complaint (optional)" error={errors.complaint?.message ?? result?.errors?.complaint?.[0]} {...register("complaint")} />
          <Textarea label="Advice (optional)" error={errors.advice?.message ?? result?.errors?.advice?.[0]} {...register("advice")} />
          <Textarea label="Notes (optional)" error={errors.notes?.message ?? result?.errors?.notes?.[0]} {...register("notes")} />
          <Input label="Next Appointment Date (optional)" type="datetime-local" error={errors.nextAppointmentDate?.message ?? result?.errors?.nextAppointmentDate?.[0]} {...register("nextAppointmentDate")} />
        </div>
      </FormSection>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href={`/appointments/${appointment.id}`} className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</Link>
        <Button type="submit" loading={isSubmitting}>Create Visit Record</Button>
      </div>
    </form>
  );
}
