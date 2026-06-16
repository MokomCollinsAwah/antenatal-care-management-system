"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  canRoleAccessPath,
  getUnauthorizedRedirect,
} from "@/lib/route-access";
import { loginSchema } from "@/lib/validations";

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginValues) => {
    setFormError(undefined);

    try {
      const result = await signIn("credentials", {
        ...values,
        redirect: false,
      });

      if (!result?.ok) {
        setFormError(
          result?.code === "suspended"
            ? "Account is suspended. Contact administrator."
            : result?.code === "service_unavailable"
              ? "Sign in is temporarily unavailable. Please try again shortly."
            : "Invalid phone/email or password",
        );
        return;
      }

      const session = await getSession();
      const role = session?.user.role;

      if (!role) {
        setFormError("Unable to start your session. Please try again.");
        return;
      }

      const safeCallbackUrl =
        callbackUrl?.startsWith("/") &&
        !callbackUrl.startsWith("//") &&
        canRoleAccessPath(role, callbackUrl.split("?")[0])
          ? callbackUrl
          : getUnauthorizedRedirect(role);

      router.replace(safeCallbackUrl);
      router.refresh();
    } catch {
      setFormError("Unable to sign in. Please try again.");
    }
  };

  return (
    <form
      className="mt-8 space-y-5"
      method="post"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Input
        label="Phone number or email"
        placeholder="Enter your phone number or email"
        autoComplete="username"
        error={errors.identifier?.message}
        {...register("identifier")}
      />
      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
      {formError && (
        <p
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {formError}
        </p>
      )}
      <Button type="submit" className="w-full" loading={isSubmitting}>
        Login
      </Button>
    </form>
  );
}
