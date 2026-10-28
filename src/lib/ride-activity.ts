/**
 * Centralized ride-activity aggregation for dashboard / analytics charts.
 * Buckets use ride request timestamps into fixed 2-hour windows (00–22).
 */

import { DATE_PRESET_SCALE, periodDayCount, toIsoDate } from "@/lib/date-range";
import type { HourlyRidePoint, ReportingDateRange } from "@/types";

export const TWO_HOUR_BUCKETS = [
  "00",
  "02",
  "04",
  "06",
  "08",
  "10",
  "12",
  "14",
  "16",
  "18",
  "20",
  "22",
] as const;

export type RideTimestampRow = {
  requestedAt: string;
};

export type RideActivitySummary = {
  total: number;
  peak: HourlyRidePoint | null;
  quiet: HourlyRidePoint | null;
  ranked: HourlyRidePoint[];
  byPart: {
    part: "Night" | "Morning" | "Afternoon" | "Evening";
    rides: number;
    sharePct: number;
  }[];
  busiestPart: {
    part: "Night" | "Morning" | "Afternoon" | "Evening";
    rides: number;
    sharePct: number;
  };
  plainSummary: string;
};

function parseHour(hour: string | number | undefined): number {
  if (hour === undefined || hour === null) return 0;
  const n = typeof hour === "number" ? hour : Number.parseInt(String(hour).replace(/\D/g, ""), 10);
  if (Number.isNaN(n)) return 0;
  return ((n % 24) + 24) % 24;
}

function dayPart(hour: string | number): RideActivitySummary["byPart"][number]["part"] {
  const h = parseHour(hour);
  if (h >= 0 && h < 6) return "Night";
  if (h >= 6 && h < 12) return "Morning";
  if (h >= 12 && h < 17) return "Afternoon";
  return "Evening";
}

function formatHourClock(hour: string | number): string {
  const h = parseHour(hour);
  const suffix = h < 12 ? "AM" : "PM";
  const twelve = h % 12 === 0 ? 12 : h % 12;
  return `${twelve}:00 ${suffix}`;
}

function buildHourlySeries(weights: number[], totalRides: number): HourlyRidePoint[] {
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  return TWO_HOUR_BUCKETS.map((hour, i) => ({
    hour,
    rides: Math.max(0, Math.round(((weights[i] ?? 0) / sum) * totalRides)),
  }));
}

/** Map a timestamp to the start hour of its 2-hour bucket ("00", "02", … "22"). */
export function twoHourBucketKey(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const start = Math.floor(d.getHours() / 2) * 2;
  return String(start).padStart(2, "0");
}

export function isTimestampInRange(iso: string, period: ReportingDateRange): boolean {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const day = toIsoDate(d);
  return day >= period.from && day <= period.to;
}

/** Aggregate rides into 2-hour buckets from request timestamps. Missing hours → 0. */
export function aggregateRidesByTwoHourBuckets(
  rides: RideTimestampRow[],
  period?: ReportingDateRange,
): HourlyRidePoint[] {
  const counts = Object.fromEntries(TWO_HOUR_BUCKETS.map((h) => [h, 0])) as Record<string, number>;

  for (const ride of rides) {
    if (period && !isTimestampInRange(ride.requestedAt, period)) continue;
    const key = twoHourBucketKey(ride.requestedAt);
    if (!key || !(key in counts)) continue;
    counts[key] += 1;
  }

  return TWO_HOUR_BUCKETS.map((hour) => ({ hour, rides: counts[hour] ?? 0 }));
}

/**
 * Scale a demo day-pattern series for the selected reporting period.
 * Multi-day presets show a typical daily pattern (average), not a stacked total.
 */
export function scaleActivityForPeriod(
  baseSeries: HourlyRidePoint[],
  period: ReportingDateRange,
): HourlyRidePoint[] {
  if (!baseSeries.length) {
    return TWO_HOUR_BUCKETS.map((hour) => ({ hour, rides: 0 }));
  }

  const weights = baseSeries.map((row) => Math.max(0, row.rides));
  const baseTotal = weights.reduce((sum, n) => sum + n, 0);
  const scale = DATE_PRESET_SCALE[period.preset] ?? periodDayCount(period);
  const cumulative = period.preset !== "today" && period.preset !== "yesterday";
  const daySpan = periodDayCount(period);
  const scaledTotal = Math.max(0, Math.round(baseTotal * scale));
  const chartTotal = cumulative ? Math.max(0, Math.round(scaledTotal / daySpan)) : scaledTotal;

  return buildHourlySeries(weights, chartTotal);
}

/**
 * Prefer live aggregation when enough rides exist; otherwise fall back to a
 * scaled demo pattern. Callers must surface `isDemo` in the UI.
 */
export function resolveRideActivitySeries(options: {
  rides: RideTimestampRow[];
  period: ReportingDateRange;
  demoSeries: HourlyRidePoint[];
  /** Minimum rides before treating aggregation as non-demo. */
  minLiveRides?: number;
  forceDemo?: boolean;
}): { activity: HourlyRidePoint[]; isDemo: boolean } {
  const minLive = options.minLiveRides ?? 12;
  const fromRides = aggregateRidesByTwoHourBuckets(options.rides, options.period);
  const liveTotal = fromRides.reduce((sum, row) => sum + row.rides, 0);

  if (!options.forceDemo && liveTotal >= minLive) {
    return { activity: fromRides, isDemo: false };
  }

  return {
    activity: scaleActivityForPeriod(options.demoSeries, options.period),
    isDemo: true,
  };
}

export function summarizeRideActivity(data: HourlyRidePoint[]): RideActivitySummary {
  const total = data.reduce((sum, row) => sum + row.rides, 0);
  const peak = data.length
    ? data.reduce((best, row) => (row.rides > best.rides ? row : best))
    : null;
  const quiet = data.length
    ? data.reduce((best, row) => (row.rides < best.rides ? row : best))
    : null;

  const byPart = (["Night", "Morning", "Afternoon", "Evening"] as const).map((part) => {
    const rides = data
      .filter((row) => dayPart(row.hour) === part)
      .reduce((sum, row) => sum + row.rides, 0);
    return {
      part,
      rides,
      sharePct: total > 0 ? Math.round((rides / total) * 100) : 0,
    };
  });

  const ranked = [...data].sort((a, b) => b.rides - a.rides).slice(0, 3);
  const busiestPart = byPart.reduce((best, row) => (row.rides > best.rides ? row : best));

  let plainSummary = "No ride activity recorded for this period.";
  if (peak && quiet && total > 0) {
    plainSummary = `Demand peaks around ${formatHourClock(peak.hour)} (${peak.rides} rides in that slot). The quietest window is ${formatHourClock(quiet.hour)}. Most trips fall in the ${busiestPart.part.toLowerCase()} (${busiestPart.sharePct}% of volume).`;
  }

  return { total, peak, quiet, byPart, ranked, busiestPart, plainSummary };
}
