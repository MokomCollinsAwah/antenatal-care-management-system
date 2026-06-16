import Link from "next/link";
import { HeartPulse } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card, CardContent } from "@/components/ui/Card";

export const metadata = { title: "Login" };
export const dynamic = "force-dynamic";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl, error } = await searchParams;

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
              <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
              <p className="mt-2 text-sm text-slate-500">
                Sign in to access your care management workspace.
              </p>
            </div>
            <LoginForm callbackUrl={callbackUrl} authError={error} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
