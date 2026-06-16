"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-xl">
        <CardContent className="pt-6">
          <EmptyState
            title="Something went wrong"
            description="The request could not be completed. Please try again or contact the system administrator."
            action={<Button type="button" onClick={reset}>Try Again</Button>}
          />
        </CardContent>
      </Card>
    </main>
  );
}
