"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
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

function getAuthErrorMessage(error?: string) {
  switch (error) {
    case "Configuration":
      return "Sign in is not configured correctly. Contact the system administrator.";
    case "AccessDenied":
      return "You do not have permission to access this workspace.";
    case "Verification":
      return "The sign-in link is invalid or has expired.";
    default:
      return error ? "Unable to sign in. Please try again." : undefined;
  }
}

interface LoginFormProps {
  callbackUrl?: string;
  authError?: string;
}

export function LoginForm({ callbackUrl, authError }: LoginFormProps) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | undefined>(() =>
    getAuthErrorMessage(authError),
  );
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

  useEffect(() => {
    const frame = requestAnimationFrame(() => setHydrated(true));
    return () => cancelAnimationFrame(frame);
  }, []);

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
      <div className="space-y-1.5">
        <label
          htmlFor="login-password"
          className="block text-sm font-medium text-slate-700"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "login-password-error" : undefined
            }
            className="h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 pr-12 text-base leading-normal text-slate-900 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100 sm:text-sm"
            {...register("password")}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-lg text-slate-500 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-100"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {errors.password?.message && (
          <p id="login-password-error" className="text-xs text-red-600">
            {errors.password.message}
          </p>
        )}
      </div>
      {formError && (
        <p
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {formError}
        </p>
      )}
      {!hydrated && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Loading secure sign-in...
        </p>
      )}
      <Button
        type="submit"
        className="w-full"
        loading={isSubmitting}
        disabled={!hydrated}
      >
        {hydrated ? "Login" : "Loading"}
      </Button>
    </form>
  );
}
