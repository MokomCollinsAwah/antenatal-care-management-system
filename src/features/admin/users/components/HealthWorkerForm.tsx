"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  createHealthWorkerAction,
  updateHealthWorkerAction,
} from "@/features/admin/users/actions";
import { Button } from "@/components/ui/Button";
import { FeedbackAlert } from "@/components/ui/FeedbackAlert";
import { FormSection } from "@/components/ui/FormSection";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { USER_STATUS_OPTIONS } from "@/lib/constants";
import {
  createHealthWorkerSchema,
  updateHealthWorkerSchema,
} from "@/lib/validations";
import type {
  ActionResult,
  HealthCentreOption,
} from "@/types";

type CreateValues = z.infer<typeof createHealthWorkerSchema>;
type UpdateValues = z.infer<typeof updateHealthWorkerSchema>;

type HealthWorkerFormProps =
  | {
      mode: "create";
      healthCentres: HealthCentreOption[];
    }
  | {
      mode: "edit";
      healthCentres: HealthCentreOption[];
      userId: string;
      initialValues: UpdateValues;
    };

export function HealthWorkerForm(props: HealthWorkerFormProps) {
  return props.mode === "create" ? (
    <CreateForm healthCentres={props.healthCentres} />
  ) : (
    <EditForm
      healthCentres={props.healthCentres}
      userId={props.userId}
      initialValues={props.initialValues}
    />
  );
}

function CreateForm({
  healthCentres,
}: {
  healthCentres: HealthCentreOption[];
}) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult<{ id: string }>>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateValues>({
    resolver: zodResolver(createHealthWorkerSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      healthCentreId: "",
    },
  });

  const onSubmit = async (values: CreateValues) => {
    const response = await createHealthWorkerAction(values);
    setResult(response);
    if (response.success) {
      router.push("/admin/users");
      router.refresh();
    }
  };

  return (
    <WorkerFormLayout
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      result={result}
      cancelHref="/admin/users"
    >
      <Input
        label="Full Name"
        required
        placeholder="Enter full name"
        error={errors.fullName?.message ?? result?.errors?.fullName?.[0]}
        {...register("fullName")}
      />
      <Input
        label="Phone"
        required
        inputMode="numeric"
        maxLength={9}
        pattern="\d{9}"
        placeholder="e.g. 670000002"
        error={errors.phone?.message ?? result?.errors?.phone?.[0]}
        {...register("phone")}
      />
      <Input
        label="Email (optional)"
        type="email"
        placeholder="worker@example.com"
        error={errors.email?.message ?? result?.errors?.email?.[0]}
        {...register("email")}
      />
      <Select
        label="Health Centre"
        required
        placeholder="Select a health centre"
        options={healthCentres}
        error={
          errors.healthCentreId?.message ??
          result?.errors?.healthCentreId?.[0]
        }
        {...register("healthCentreId")}
      />
    </WorkerFormLayout>
  );
}

function EditForm({
  healthCentres,
  userId,
  initialValues,
}: {
  healthCentres: HealthCentreOption[];
  userId: string;
  initialValues: UpdateValues;
}) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult<{ id: string }>>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateValues>({
    resolver: zodResolver(updateHealthWorkerSchema),
    defaultValues: initialValues,
  });

  const onSubmit = async (values: UpdateValues) => {
    const response = await updateHealthWorkerAction(userId, values);
    setResult(response);
    if (response.success) {
      router.push(`/admin/users/${userId}`);
      router.refresh();
    }
  };

  return (
    <WorkerFormLayout
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      result={result}
      cancelHref={`/admin/users/${userId}`}
    >
      <Input
        label="Full Name"
        required
        placeholder="Enter full name"
        error={errors.fullName?.message ?? result?.errors?.fullName?.[0]}
        {...register("fullName")}
      />
      <Input
        label="Phone"
        required
        inputMode="numeric"
        maxLength={9}
        pattern="\d{9}"
        placeholder="e.g. 670000002"
        error={errors.phone?.message ?? result?.errors?.phone?.[0]}
        {...register("phone")}
      />
      <Input
        label="Email (optional)"
        type="email"
        placeholder="worker@example.com"
        error={errors.email?.message ?? result?.errors?.email?.[0]}
        {...register("email")}
      />
      <Select
        label="Health Centre"
        required
        placeholder="Select a health centre"
        options={healthCentres}
        error={
          errors.healthCentreId?.message ??
          result?.errors?.healthCentreId?.[0]
        }
        {...register("healthCentreId")}
      />
      <Select
        label="Status"
        required
        options={USER_STATUS_OPTIONS}
        error={errors.status?.message ?? result?.errors?.status?.[0]}
        {...register("status")}
      />
    </WorkerFormLayout>
  );
}

function WorkerFormLayout({
  children,
  onSubmit,
  isSubmitting,
  result,
  cancelHref,
}: {
  children: React.ReactNode;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  isSubmitting: boolean;
  result?: ActionResult<{ id: string }>;
  cancelHref: string;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <FeedbackAlert message={result?.message} success={result?.success} />
      <FormSection
        title="Health worker information"
        description="Create or update the worker's account and health centre assignment."
      >
        <div className="grid gap-5 md:grid-cols-2">{children}</div>
      </FormSection>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={cancelHref}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>
        <Button type="submit" loading={isSubmitting}>
          Save Health Worker
        </Button>
      </div>
    </form>
  );
}
