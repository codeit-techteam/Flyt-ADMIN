"use client";

import type { HourlyRidePoint } from "@/types";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/** Parse chart hour keys like "00", "18", "6" into 0–23. */
export function parseHour(hour: string | number | undefined): number {
  if (hour === undefined || hour === null) return 0;
  const n = typeof hour === "number" ? hour : Number.parseInt(String(hour).replace(/\D/g, ""), 10);
  if (Number.isNaN(n)) return 0;
  return ((n % 24) + 24) % 24;
}

/** Short axis label: 12a, 2a, 12p, 6p … */
export function formatHourTick(hour: string | number): string {
  const h = parseHour(hour);
  const suffix = h < 12 ? "a" : "p";
  const twelve = h % 12 === 0 ? 12 : h % 12;
  return `${twelve}${suffix}`;
}

/** Friendly clock time: 12:00 AM, 6:00 PM … */
export function formatHourClock(hour: string | number): string {
  const h = parseHour(hour);
  const suffix = h < 12 ? "AM" : "PM";
  const twelve = h % 12 === 0 ? 12 : h % 12;
  return `${twelve}:00 ${suffix}`;
}

/** 2-hour bucket label matching demo series (00, 02, … 22). */
export function formatHourWindow(hour: string | number): string {
  const start = parseHour(hour);
  const end = (start + 2) % 24;
  return `${formatHourClock(start)} – ${formatHourClock(end)}`;
}

export function formatPeakDescription(peak: HourlyRidePoint | null | undefined): string {
  if (!peak) return "Rides by time of day (2-hour slots)";
  return `Busiest around ${formatHourClock(peak.hour)} · ${peak.rides} rides`;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number; payload?: HourlyRidePoint }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  const hour = point?.hour ?? "00";
  const rides = payload[0]?.value ?? 0;

  return (
    <div
      className="max-w-[220px] rounded-xl border border-border bg-surface px-3 py-2.5 shadow-[var(--shadow-overlay)]"
      role="status"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Time of day</p>
      <p className="mt-0.5 text-sm font-semibold text-ink">{formatHourWindow(hour)}</p>
      <p className="mt-1.5 text-sm font-bold tabular-nums text-flyt-purple">
        {rides} {rides === 1 ? "ride" : "rides"}
      </p>
      <p className="mt-0.5 text-[11px] leading-snug text-muted">
        Number of rides that started in this 2-hour window
      </p>
    </div>
  );
}

export function RideActivityChart({
  data,
  gradientId = "zoneRideBar",
}: {
  data: HourlyRidePoint[];
  gradientId?: string;
}) {
  const peakHour = useMemo(() => {
    if (!data.length) return null;
    return data.reduce((best, row) => (row.rides > best.rides ? row : best));
  }, [data]);

  const chartData = useMemo(
    () =>
      data.map((row) => ({
        ...row,
        label: formatHourTick(row.hour),
      })),
    [data],
  );

  if (!data.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        No ride activity for this period
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="18%" accessibilityLayer>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5a3488" />
                <stop offset="100%" stopColor="#3D1E63" />
              </linearGradient>
              <linearGradient id={`${gradientId}Peak`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tick={{ fill: "#6B7280" }}
              dy={6}
              interval={0}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tick={{ fill: "#6B7280" }}
              width={40}
              tickFormatter={(v) => String(v)}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(61,30,99,0.04)" }} />
            <Bar dataKey="rides" name="Rides" radius={[6, 6, 2, 2]} maxBarSize={36}>
              {chartData.map((row) => (
                <Cell
                  key={row.hour}
                  fill={
                    row.hour === peakHour?.hour
                      ? `url(#${gradientId}Peak)`
                      : `url(#${gradientId})`
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 shrink-0 px-1 text-center text-[11px] text-muted">
        Bottom labels are time of day (a = AM, p = PM). Highlighted bar is the busiest slot.
      </p>
    </div>
  );
}

export function usePeakHour(data: HourlyRidePoint[]) {
  return useMemo(() => {
    if (!data.length) return null;
    return data.reduce((best, row) => (row.rides > best.rides ? row : best));
  }, [data]);
}
