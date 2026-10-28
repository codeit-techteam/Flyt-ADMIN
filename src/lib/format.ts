import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatInrPrecise(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "dd MMM yyyy, HH:mm");
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "dd MMM yyyy");
}

export function formatRelative(value: string | Date): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return value;
}
