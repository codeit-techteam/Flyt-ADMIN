import { format, subDays } from "date-fns";
import type { DateRangePreset, ReportingDateRange } from "@/types";

export function toIsoDate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function resolveDateRange(
  preset: DateRangePreset,
  custom?: { from?: string; to?: string },
): ReportingDateRange {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (preset) {
    case "today":
      return { preset, from: toIsoDate(today), to: toIsoDate(today) };
    case "yesterday": {
      const y = subDays(today, 1);
      return { preset, from: toIsoDate(y), to: toIsoDate(y) };
    }
    case "last_7_days":
      return { preset, from: toIsoDate(subDays(today, 6)), to: toIsoDate(today) };
    case "last_30_days":
      return { preset, from: toIsoDate(subDays(today, 29)), to: toIsoDate(today) };
    case "custom": {
      const from = custom?.from ?? toIsoDate(subDays(today, 6));
      const to = custom?.to ?? toIsoDate(today);
      return { preset, from, to };
    }
    default:
      return { preset: "today", from: toIsoDate(today), to: toIsoDate(today) };
  }
}

export function periodDayCount(period: ReportingDateRange): number {
  const from = new Date(`${period.from}T00:00:00`);
  const to = new Date(`${period.to}T00:00:00`);
  const diff = Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1;
  return Math.max(1, diff);
}

export const DATE_PRESET_LABELS: Record<DateRangePreset, string> = {
  today: "Today",
  yesterday: "Yesterday",
  last_7_days: "Last 7 days",
  last_30_days: "Last 30 days",
  custom: "Custom range",
};

/** Scale factors relative to "today" for demo date presets. */
export const DATE_PRESET_SCALE: Record<DateRangePreset, number> = {
  today: 1,
  yesterday: 0.94,
  last_7_days: 6.4,
  last_30_days: 26.5,
  custom: 3.2,
};
