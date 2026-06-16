import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-xl">
        <CardContent className="pt-6">
          <EmptyState
            title="Page not found"
            description="The page you are looking for does not exist or you may not have access to it."
            action={
              <Link
                href="/"
                className="inline-flex h-10 items-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
              >
                Go Home
              </Link>
            }
          />
        </CardContent>
      </Card>
    </main>
  );
}
