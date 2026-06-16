"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { resetPasswordAction } from "@/features/admin/users/actions";
import { Button } from "@/components/ui/Button";
import { FeedbackAlert } from "@/components/ui/FeedbackAlert";
import { Input } from "@/components/ui/Input";
import { resetPasswordSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult<{ id: string }>>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ResetPasswordValues) => {
    const response = await resetPasswordAction(userId, values);
    setResult(response);
    if (response.success) {
      router.push(`/admin/users/${userId}`);
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FeedbackAlert message={result?.message} success={result?.success} />
      <Input
        label="New Password"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message ?? result?.errors?.password?.[0]}
        {...register("password")}
      />
      <Input
        label="Confirm Password"
        type="password"
        autoComplete="new-password"
        error={
          errors.confirmPassword?.message ??
          result?.errors?.confirmPassword?.[0]
        }
        {...register("confirmPassword")}
      />
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={`/admin/users/${userId}`}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>
        <Button type="submit" loading={isSubmitting}>
          Reset Password
        </Button>
      </div>
    </form>
  );
}
