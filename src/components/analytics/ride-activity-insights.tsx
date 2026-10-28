"use client";

import {
  formatHourClock,
  formatHourWindow,
} from "@/components/analytics/ride-activity-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { summarizeRideActivity } from "@/lib/ride-activity";
import type { HourlyRidePoint } from "@/types";
import {
  ArrowRight,
  Clock3,
  Moon,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

type DayPart = "Night" | "Morning" | "Afternoon" | "Evening";

const dayPartMeta: Record<
  DayPart,
  { icon: typeof Sun; tone: string; hint: string }
> = {
  Night: {
    icon: Moon,
    tone: "bg-slate-100 text-slate-700",
    hint: "00:00 – 06:00",
  },
  Morning: {
    icon: Sunrise,
    tone: "bg-amber-50 text-amber-800",
    hint: "06:00 – 12:00",
  },
  Afternoon: {
    icon: Sun,
    tone: "bg-sky-50 text-sky-800",
    hint: "12:00 – 17:00",
  },
  Evening: {
    icon: Sunset,
    tone: "bg-flyt-purple-soft text-flyt-purple",
    hint: "17:00 – 24:00",
  },
};

export { summarizeRideActivity };

export function RideActivityInsights({
  data,
  analyticsHref = "/analytics?zone=all&period=today",
  /** When false, omit the total/peak/quiet cards (shown elsewhere on the card). */
  showSummaryStats = true,
}: {
  data: HourlyRidePoint[];
  analyticsHref?: string;
  showSummaryStats?: boolean;
}) {
  const insights = useMemo(() => summarizeRideActivity(data), [data]);
  const maxPart = Math.max(...insights.byPart.map((p) => p.rides), 1);

  if (!data.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-ground/50 px-4 py-8 text-center text-sm text-muted">
        No activity data to explain yet.
      </div>
    );
  }

  return (
    <div className="space-y-5 border-t border-border pt-5">
      <div className="rounded-2xl border border-flyt-purple/15 bg-gradient-to-br from-flyt-purple-soft/50 to-surface p-4">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-flyt-purple" />
          <p className="text-sm font-semibold text-ink">What this chart means</p>
        </div>
        <p className="text-sm leading-relaxed text-ink/90">{insights.plainSummary}</p>
        <p className="mt-2 text-xs text-muted">
          Each point is a 2-hour window on the continuous line. Higher points = more rides that
          started then. The brighter peak marker is the busiest slot.
        </p>
      </div>

      {showSummaryStats ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <InsightStat
            label="Total rides in chart"
            value={String(insights.total)}
            hint="Sum of all 2-hour slots"
          />
          <InsightStat
            label="Peak slot"
            value={insights.peak ? formatHourClock(insights.peak.hour) : "—"}
            hint={insights.peak ? `${insights.peak.rides} rides` : undefined}
            tone="brand"
          />
          <InsightStat
            label="Quietest slot"
            value={insights.quiet ? formatHourClock(insights.quiet.hour) : "—"}
            hint={insights.quiet ? `${insights.quiet.rides} rides` : undefined}
          />
        </div>
      ) : null}

      <div>
        <div className="mb-2 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-flyt-purple" />
          <p className="text-sm font-semibold text-ink">Top 3 busiest windows</p>
        </div>
        <ol className="space-y-2">
          {insights.ranked.map((row, index) => {
            const share =
              insights.total > 0 ? Math.round((row.rides / insights.total) * 100) : 0;
            return (
              <li
                key={row.hour}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5"
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    index === 0
                      ? "bg-flyt-purple text-white"
                      : "bg-flyt-purple-soft text-flyt-purple",
                  )}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">
                    {formatHourWindow(row.hour)}
                  </p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ground">
                    <div
                      className="h-full rounded-full bg-flyt-purple"
                      style={{ width: `${Math.max(share, 4)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold tabular-nums text-ink">{row.rides}</p>
                  <p className="text-[11px] text-muted">{share}% of day</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-flyt-purple" />
          <p className="text-sm font-semibold text-ink">Demand by time of day</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {insights.byPart.map((row) => {
            const meta = dayPartMeta[row.part];
            const Icon = meta.icon;
            return (
              <div
                key={row.part}
                className="rounded-xl border border-border bg-surface p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                      meta.tone,
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {row.part}
                  </span>
                  <Badge tone={row.part === insights.busiestPart.part ? "brand" : "neutral"}>
                    {row.sharePct}%
                  </Badge>
                </div>
                <p className="mt-2 text-lg font-bold tabular-nums text-ink">{row.rides}</p>
                <p className="text-[11px] text-muted">{meta.hint}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ground">
                  <div
                    className="h-full rounded-full bg-flyt-purple/80"
                    style={{ width: `${Math.max((row.rides / maxPart) * 100, 3)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-dashed border-border bg-ground/40 p-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">
          Need zone filters, pilot onboarding, and full reports? Open the analytics workspace.
        </p>
        <Link href={analyticsHref}>
          <Button size="sm" variant="secondary">
            Full analytics
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function InsightStat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "brand";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3",
        tone === "brand"
          ? "border-flyt-purple/20 bg-flyt-purple-soft/40"
          : "border-border bg-surface",
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-lg font-bold text-ink">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
