"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  createHealthCentreAction,
  updateHealthCentreAction,
} from "@/features/admin/health-centres/actions";
import { Button } from "@/components/ui/Button";
import { FeedbackAlert } from "@/components/ui/FeedbackAlert";
import { FormSection } from "@/components/ui/FormSection";
import { Input } from "@/components/ui/Input";
import { createHealthCentreSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

type HealthCentreValues = z.infer<typeof createHealthCentreSchema>;

interface HealthCentreFormProps {
  healthCentreId?: string;
  initialValues?: HealthCentreValues;
}

export function HealthCentreForm({
  healthCentreId,
  initialValues,
}: HealthCentreFormProps) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult<{ id: string }>>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<HealthCentreValues>({
    resolver: zodResolver(createHealthCentreSchema),
    defaultValues: initialValues ?? { name: "", location: "", phone: "" },
  });

  const onSubmit = async (values: HealthCentreValues) => {
    const response = healthCentreId
      ? await updateHealthCentreAction(healthCentreId, values)
      : await createHealthCentreAction(values);
    setResult(response);

    if (response.success) {
      router.push(
        healthCentreId
          ? `/admin/health-centres/${healthCentreId}`
          : "/admin/health-centres",
      );
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FeedbackAlert
        message={result?.message}
        success={result?.success}
      />
      <FormSection
        title="Facility information"
        description="Enter the official name and contact information for this health centre."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Name"
            placeholder="e.g. Molyko Integrated Health Centre"
            error={errors.name?.message ?? result?.errors?.name?.[0]}
            {...register("name")}
          />
          <Input
            label="Location"
            placeholder="e.g. Molyko, Buea"
            error={errors.location?.message ?? result?.errors?.location?.[0]}
            {...register("location")}
          />
          <Input
            label="Phone (optional)"
            placeholder="e.g. 670100100"
            error={errors.phone?.message ?? result?.errors?.phone?.[0]}
            {...register("phone")}
          />
        </div>
      </FormSection>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={
            healthCentreId
              ? `/admin/health-centres/${healthCentreId}`
              : "/admin/health-centres"
          }
          className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>
        <Button type="submit" loading={isSubmitting}>
          Save Health Centre
        </Button>
      </div>
    </form>
  );
}
