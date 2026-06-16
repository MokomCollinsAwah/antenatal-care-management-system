import { CircleCheck, CircleX } from "lucide-react";
import { cn } from "@/lib/utils";

export function FeedbackAlert({
  message,
  success = false,
}: {
  message?: string;
  success?: boolean;
}) {
  if (!message) {
    return null;
  }

  const Icon = success ? CircleCheck : CircleX;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg px-4 py-3 text-sm",
        success
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-700",
      )}
      role={success ? "status" : "alert"}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
