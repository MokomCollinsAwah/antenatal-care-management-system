"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import {
  createPatientAction,
  updatePatientAction,
} from "@/features/patients/actions";
import { Button } from "@/components/ui/Button";
import { FeedbackAlert } from "@/components/ui/FeedbackAlert";
import { FormSection } from "@/components/ui/FormSection";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { USER_STATUS_OPTIONS, UserStatus } from "@/lib/constants";
import {
  createPatientWithProfileSchema,
  updatePatientWithProfileSchema,
} from "@/lib/validations";
import type {
  ActionResult,
  HealthCentreOption,
  HealthWorkerOption,
  PatientSummary,
} from "@/types";

type CreateValues = z.input<typeof createPatientWithProfileSchema>;
type UpdateValues = z.input<typeof updatePatientWithProfileSchema>;
type CreateRegister = UseFormRegister<CreateValues>;
type CreateErrors = FieldErrors<CreateValues>;

type PatientFormProps =
  | {
      mode: "create";
      healthCentres: HealthCentreOption[];
      healthWorkers: HealthWorkerOption[];
      isAdmin: boolean;
    }
  | {
      mode: "edit";
      patient: PatientSummary;
      healthCentres: HealthCentreOption[];
      healthWorkers: HealthWorkerOption[];
      isAdmin: boolean;
    };

export function PatientForm(props: PatientFormProps) {
  return props.mode === "create" ? (
    <CreatePatientForm {...props} />
  ) : (
    <EditPatientForm {...props} />
  );
}

function CreatePatientForm({
  healthCentres,
  healthWorkers,
}: Extract<PatientFormProps, { mode: "create" }>) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult<{ id: string }>>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateValues>({
    resolver: zodResolver(createPatientWithProfileSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      age: 18,
      address: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      healthCentreId: "",
      assignedHealthWorkerId: "",
      lastMenstrualPeriod: "",
      expectedDeliveryDate: "",
      gravidity: undefined,
      parity: undefined,
      bloodGroup: "",
      riskNote: "",
    },
  });

  const onSubmit = async (values: CreateValues) => {
    const response = await createPatientAction(values);
    setResult(response);
    if (response.success && response.data?.id) {
      router.push(`/patients/${response.data.id}`);
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FeedbackAlert message={result?.message} success={result?.success} />
      <AccountFields
        register={register}
        errors={errors}
        serverErrors={result?.errors}
        includePassword
      />
      <PersonalFields register={register} errors={errors} serverErrors={result?.errors} />
      <AntenatalFields
        register={register}
        errors={errors}
        serverErrors={result?.errors}
        healthCentres={healthCentres}
        healthWorkers={healthWorkers}
      />
      <FormActions cancelHref="/patients" loading={isSubmitting} />
    </form>
  );
}

function EditPatientForm({
  patient,
  healthCentres,
  healthWorkers,
  isAdmin,
}: Extract<PatientFormProps, { mode: "edit" }>) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult<{ id: string }>>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateValues>({
    resolver: zodResolver(updatePatientWithProfileSchema),
    defaultValues: {
      fullName: patient.fullName,
      phone: patient.phone,
      email: patient.email ?? "",
      status: patient.status as UserStatus,
      age: patient.age,
      address: patient.address,
      emergencyContactName: patient.emergencyContactName ?? "",
      emergencyContactPhone: patient.emergencyContactPhone ?? "",
      healthCentreId: patient.healthCentreId,
      assignedHealthWorkerId: patient.assignedHealthWorkerId,
      lastMenstrualPeriod: toDateInput(patient.lastMenstrualPeriod),
      expectedDeliveryDate: toDateInput(patient.expectedDeliveryDate),
      gravidity: patient.gravidity,
      parity: patient.parity,
      bloodGroup: patient.bloodGroup ?? "",
      riskNote: patient.riskNote ?? "",
    },
  });

  const onSubmit = async (values: UpdateValues) => {
    const response = await updatePatientAction(patient.id, {
      ...values,
      status: isAdmin ? values.status : undefined,
    });
    setResult(response);
    if (response.success) {
      router.push(`/patients/${patient.id}`);
      router.refresh();
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}
      className="space-y-6"
    >
      <FeedbackAlert message={result?.message} success={result?.success} />
      <AccountFields
        register={register as unknown as CreateRegister}
        errors={errors as unknown as CreateErrors}
        serverErrors={result?.errors}
      />
      {isAdmin && (
        <Select
          label="Status"
          options={USER_STATUS_OPTIONS}
          error={errors.status?.message ?? result?.errors?.status?.[0]}
          {...register("status")}
        />
      )}
      <PersonalFields
        register={register as unknown as CreateRegister}
        errors={errors as unknown as CreateErrors}
        serverErrors={result?.errors}
      />
      <AntenatalFields
        register={register as unknown as CreateRegister}
        errors={errors as unknown as CreateErrors}
        serverErrors={result?.errors}
        healthCentres={healthCentres}
        healthWorkers={healthWorkers}
      />
      <FormActions cancelHref={`/patients/${patient.id}`} loading={isSubmitting} />
    </form>
  );
}

function AccountFields({
  register,
  errors,
  serverErrors,
  includePassword = false,
}: {
  register: CreateRegister;
  errors: CreateErrors;
  serverErrors?: Record<string, string[]>;
  includePassword?: boolean;
}) {
  return (
    <FormSection title="Account Information">
      <div className="grid gap-5 md:grid-cols-2">
        <Input label="Full Name" error={errors.fullName?.message ?? serverErrors?.fullName?.[0]} {...register("fullName")} />
        <Input label="Phone" error={errors.phone?.message ?? serverErrors?.phone?.[0]} {...register("phone")} />
        <Input label="Email (optional)" type="email" error={errors.email?.message ?? serverErrors?.email?.[0]} {...register("email")} />
        {includePassword && (
          <>
            <Input label="Temporary Password" type="password" error={errors.password?.message ?? serverErrors?.password?.[0]} {...register("password")} />
            <Input label="Confirm Temporary Password" type="password" error={errors.confirmPassword?.message ?? serverErrors?.confirmPassword?.[0]} {...register("confirmPassword")} />
          </>
        )}
      </div>
    </FormSection>
  );
}

function PersonalFields({
  register,
  errors,
  serverErrors,
}: {
  register: CreateRegister;
  errors: CreateErrors;
  serverErrors?: Record<string, string[]>;
}) {
  return (
    <FormSection title="Personal Information">
      <div className="grid gap-5 md:grid-cols-2">
        <Input label="Age" type="number" min={10} error={errors.age?.message ?? serverErrors?.age?.[0]} {...register("age")} />
        <Input label="Address / Quarter" error={errors.address?.message ?? serverErrors?.address?.[0]} {...register("address")} />
        <Input label="Emergency Contact Name (optional)" error={errors.emergencyContactName?.message ?? serverErrors?.emergencyContactName?.[0]} {...register("emergencyContactName")} />
        <Input label="Emergency Contact Phone (optional)" error={errors.emergencyContactPhone?.message ?? serverErrors?.emergencyContactPhone?.[0]} {...register("emergencyContactPhone")} />
      </div>
    </FormSection>
  );
}

function AntenatalFields({
  register,
  errors,
  serverErrors,
  healthCentres,
  healthWorkers,
}: {
  register: CreateRegister;
  errors: CreateErrors;
  serverErrors?: Record<string, string[]>;
  healthCentres: HealthCentreOption[];
  healthWorkers: HealthWorkerOption[];
}) {
  return (
    <FormSection title="Antenatal Information">
      <div className="grid gap-5 md:grid-cols-2">
        <Select label="Health Centre" placeholder="Select health centre" options={healthCentres} error={errors.healthCentreId?.message ?? serverErrors?.healthCentreId?.[0]} {...register("healthCentreId")} />
        <Select label="Assigned Health Worker" placeholder="Select health worker" options={healthWorkers} error={errors.assignedHealthWorkerId?.message ?? serverErrors?.assignedHealthWorkerId?.[0]} {...register("assignedHealthWorkerId")} />
        <Input label="Last Menstrual Period" type="date" error={errors.lastMenstrualPeriod?.message ?? serverErrors?.lastMenstrualPeriod?.[0]} {...register("lastMenstrualPeriod")} />
        <Input label="Expected Delivery Date" type="date" error={errors.expectedDeliveryDate?.message ?? serverErrors?.expectedDeliveryDate?.[0]} {...register("expectedDeliveryDate")} />
        <Input label="Gravidity (optional)" type="number" min={0} error={errors.gravidity?.message ?? serverErrors?.gravidity?.[0]} {...register("gravidity")} />
        <Input label="Parity (optional)" type="number" min={0} error={errors.parity?.message ?? serverErrors?.parity?.[0]} {...register("parity")} />
        <Input label="Blood Group (optional)" error={errors.bloodGroup?.message ?? serverErrors?.bloodGroup?.[0]} {...register("bloodGroup")} />
        <Textarea label="Risk Note (optional)" error={errors.riskNote?.message ?? serverErrors?.riskNote?.[0]} {...register("riskNote")} />
      </div>
    </FormSection>
  );
}

function FormActions({ cancelHref, loading }: { cancelHref: string; loading: boolean }) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <Link
        href={cancelHref}
        className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        Cancel
      </Link>
      <Button type="submit" loading={loading}>
        Save Patient
      </Button>
    </div>
  );
}

function toDateInput(value: string) {
  return value.slice(0, 10);
}
