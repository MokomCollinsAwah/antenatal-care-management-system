"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { changeOwnPasswordAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/Button";
import { FeedbackAlert } from "@/components/ui/FeedbackAlert";
import { Input } from "@/components/ui/Input";
import { changePasswordSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm() {
  const [result, setResult] = useState<ActionResult>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ChangePasswordValues) => {
    const response = await changeOwnPasswordAction(values);
    setResult(response);
    if (response.success) {
      await signOut({ callbackUrl: "/login" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <FeedbackAlert message={result?.message} success={result?.success} />
      <Input
        label="Current Password"
        required
        type="password"
        autoComplete="current-password"
        error={
          errors.currentPassword?.message ??
          result?.errors?.currentPassword?.[0]
        }
        {...register("currentPassword")}
      />
      <Input
        label="New Password"
        required
        type="password"
        autoComplete="new-password"
        error={errors.password?.message ?? result?.errors?.password?.[0]}
        {...register("password")}
      />
      <Input
        label="Confirm New Password"
        required
        type="password"
        autoComplete="new-password"
        error={
          errors.confirmPassword?.message ??
          result?.errors?.confirmPassword?.[0]
        }
        {...register("confirmPassword")}
      />
      <Button type="submit" className="w-full" loading={isSubmitting}>
        Change Password
      </Button>
    </form>
  );
}
