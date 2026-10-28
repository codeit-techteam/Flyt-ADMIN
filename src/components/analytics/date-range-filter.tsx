"use client";

import { DATE_PRESET_LABELS } from "@/lib/date-range";
import { cn } from "@/lib/cn";
import type { DateRangePreset, ReportingDateRange } from "@/types";
import { Input } from "@/components/ui/input";

const PRESETS: DateRangePreset[] = [
  "today",
  "yesterday",
  "last_7_days",
  "last_30_days",
  "custom",
];

export function DateRangeFilter({
  period,
  onPresetChange,
  onCustomChange,
}: {
  period: ReportingDateRange;
  onPresetChange: (preset: DateRangePreset) => void;
  onCustomChange?: (next: { from: string; to: string }) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Reporting period">
        {PRESETS.map((preset) => {
          const selected = period.preset === preset;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onPresetChange(preset)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flyt-purple",
                selected
                  ? "border-flyt-purple bg-flyt-purple text-white"
                  : "border-border bg-surface text-muted hover:border-flyt-purple/40 hover:text-ink",
              )}
            >
              {DATE_PRESET_LABELS[preset]}
            </button>
          );
        })}
      </div>
      {period.preset === "custom" && onCustomChange ? (
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-40">
            <Input
              type="date"
              label="From"
              value={period.from}
              onChange={(e) => onCustomChange({ from: e.target.value, to: period.to })}
            />
          </div>
          <div className="w-40">
            <Input
              type="date"
              label="To"
              value={period.to}
              onChange={(e) => onCustomChange({ from: period.from, to: e.target.value })}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
