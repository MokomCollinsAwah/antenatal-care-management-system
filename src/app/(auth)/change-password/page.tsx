import { HeartPulse } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { ChangePasswordForm } from "@/features/auth/ChangePasswordForm";
import { DEFAULT_TEMPORARY_PASSWORD } from "@/lib/constants";

export const metadata = { title: "Change Password" };
export const dynamic = "force-dynamic";

export default function ChangePasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-3 text-slate-900"
        >
          <span className="rounded-xl bg-teal-700 p-2.5 text-white">
            <HeartPulse className="size-5" />
          </span>
          <span className="font-bold">Antenatal Care Management</span>
        </Link>
        <Card className="shadow-lg shadow-slate-900/5">
          <CardContent className="p-6 sm:p-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-900">
                Change password
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Your current temporary password is {DEFAULT_TEMPORARY_PASSWORD}.
                Set a new password before continuing.
              </p>
            </div>
            <div className="mt-8">
              <ChangePasswordForm />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
