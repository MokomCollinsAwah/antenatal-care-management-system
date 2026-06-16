import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "scheduled"
  | "attended"
  | "missed"
  | "cancelled"
  | "active"
  | "suspended"
  | "completed"
  | "stopped"
  | "pending"
  | "due"
  | "read"
  | "neutral";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  scheduled: "bg-blue-50 text-blue-700 ring-blue-600/20",
  attended: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  missed: "bg-amber-50 text-amber-700 ring-amber-600/20",
  cancelled: "bg-red-50 text-red-700 ring-red-600/20",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  suspended: "bg-red-50 text-red-700 ring-red-600/20",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  stopped: "bg-slate-100 text-slate-700 ring-slate-600/20",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  due: "bg-orange-50 text-orange-700 ring-orange-600/20",
  read: "bg-blue-50 text-blue-700 ring-blue-600/20",
  neutral: "bg-slate-100 text-slate-700 ring-slate-600/20",
};

export function Badge({
  className,
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
