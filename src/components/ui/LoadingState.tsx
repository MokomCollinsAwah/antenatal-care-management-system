import { LoaderCircle } from "lucide-react";

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div
      className="flex min-h-48 items-center justify-center gap-3 text-sm text-slate-500"
      role="status"
    >
      <LoaderCircle className="size-5 animate-spin text-teal-700" />
      <span>{label}</span>
    </div>
  );
}
