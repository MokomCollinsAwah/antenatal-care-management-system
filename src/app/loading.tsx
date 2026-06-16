import { LoadingState } from "@/components/ui/LoadingState";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <LoadingState label="Loading page" />
    </main>
  );
}
