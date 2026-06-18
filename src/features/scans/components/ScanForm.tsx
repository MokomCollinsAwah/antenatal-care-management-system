"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createScanAction } from "@/features/scans/actions";
import { Button } from "@/components/ui/Button";
import { FeedbackAlert } from "@/components/ui/FeedbackAlert";
import { FormSection } from "@/components/ui/FormSection";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { createScanRecordSchema } from "@/lib/validations";
import type { ActionResult, HealthCentreOption, PatientOption } from "@/types";

type Values = z.input<typeof createScanRecordSchema>;

export function ScanForm({ patients, healthCentres, initialPatientId }: { patients: PatientOption[]; healthCentres: HealthCentreOption[]; initialPatientId?: string }) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult<{ id: string }>>();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(createScanRecordSchema),
    defaultValues: { patientId: initialPatientId ?? "", scanDate: "", scanType: "", healthCentreId: "", resultNote: "", nextScanDate: "" },
  });
  const onSubmit = async (values: Values) => {
    const response = await createScanAction(values);
    setResult(response);
    if (response.success) {
      router.push(values.patientId ? `/patients/${values.patientId}` : "/scans");
      router.refresh();
    }
  };
  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])} noValidate>
      <FeedbackAlert message={result?.message} success={result?.success} />
      <FormSection title="Scan Information">
        <div className="grid gap-5 md:grid-cols-2">
          <Select label="Patient" required placeholder="Select patient" options={patients} error={errors.patientId?.message ?? result?.errors?.patientId?.[0]} {...register("patientId")} />
          <Input label="Scan Date" required type="date" error={errors.scanDate?.message ?? result?.errors?.scanDate?.[0]} {...register("scanDate")} />
          <Input label="Scan Type" required error={errors.scanType?.message ?? result?.errors?.scanType?.[0]} {...register("scanType")} />
          <Select label="Health Centre (optional)" placeholder="Use patient's health centre" options={healthCentres} error={errors.healthCentreId?.message ?? result?.errors?.healthCentreId?.[0]} {...register("healthCentreId")} />
          <Input label="Next Scan Date (optional)" type="date" error={errors.nextScanDate?.message ?? result?.errors?.nextScanDate?.[0]} {...register("nextScanDate")} />
          <Textarea label="Result Note (brief note only)" helperText="Do not record diagnostic conclusions here." error={errors.resultNote?.message ?? result?.errors?.resultNote?.[0]} {...register("resultNote")} />
        </div>
      </FormSection>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href="/scans" className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</Link>
        <Button type="submit" loading={isSubmitting}>Save Scan</Button>
      </div>
    </form>
  );
}
