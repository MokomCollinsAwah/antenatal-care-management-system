import { format, isValid } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: Date | string | number): string {
  const date = new Date(value);
  return isValid(date) ? format(date, "MMM d, yyyy") : "Not available";
}

export function formatDateTime(value: Date | string | number): string {
  const date = new Date(value);
  return isValid(date) ? format(date, "MMM d, yyyy 'at' h:mm a") : "Not available";
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function safeString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}
