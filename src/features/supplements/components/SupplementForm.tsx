"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createSupplementAction } from "@/features/supplements/actions";
import { Button } from "@/components/ui/Button";
import { FeedbackAlert } from "@/components/ui/FeedbackAlert";
import { FormSection } from "@/components/ui/FormSection";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { SUPPLEMENT_STATUS_OPTIONS, SupplementStatus } from "@/lib/constants";
import { createSupplementRecordSchema } from "@/lib/validations";
import type { ActionResult, PatientOption } from "@/types";

type Values = z.input<typeof createSupplementRecordSchema>;

export function SupplementForm({ patients, initialPatientId }: { patients: PatientOption[]; initialPatientId?: string }) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult<{ id: string }>>();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(createSupplementRecordSchema),
    defaultValues: { patientId: initialPatientId ?? "", supplementName: "", dosage: "", frequency: "", startDate: "", endDate: "", instructions: "", status: SupplementStatus.ACTIVE },
  });
  const onSubmit = async (values: Values) => {
    const response = await createSupplementAction(values);
    setResult(response);
    if (response.success) {
      router.push(values.patientId ? `/patients/${values.patientId}` : "/supplements");
      router.refresh();
    }
  };
  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}>
      <FeedbackAlert message={result?.message} success={result?.success} />
      <FormSection title="Supplement Information">
        <div className="grid gap-5 md:grid-cols-2">
          <Select label="Patient" placeholder="Select patient" options={patients} error={errors.patientId?.message ?? result?.errors?.patientId?.[0]} {...register("patientId")} />
          <Input label="Supplement Name" error={errors.supplementName?.message ?? result?.errors?.supplementName?.[0]} {...register("supplementName")} />
          <Input label="Dosage" error={errors.dosage?.message ?? result?.errors?.dosage?.[0]} {...register("dosage")} />
          <Input label="Frequency" error={errors.frequency?.message ?? result?.errors?.frequency?.[0]} {...register("frequency")} />
          <Input label="Start Date" type="date" error={errors.startDate?.message ?? result?.errors?.startDate?.[0]} {...register("startDate")} />
          <Input label="End Date (optional)" type="date" error={errors.endDate?.message ?? result?.errors?.endDate?.[0]} {...register("endDate")} />
          <Select label="Status" options={SUPPLEMENT_STATUS_OPTIONS} error={errors.status?.message ?? result?.errors?.status?.[0]} {...register("status")} />
          <Textarea label="Instructions (optional)" error={errors.instructions?.message ?? result?.errors?.instructions?.[0]} {...register("instructions")} />
        </div>
      </FormSection>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href="/supplements" className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</Link>
        <Button type="submit" loading={isSubmitting}>Save Supplement</Button>
      </div>
    </form>
  );
}
