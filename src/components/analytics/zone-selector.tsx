"use client";

import { ALL_ZONES_ID, ALL_ZONES_OPTION, FEATURED_ZONES, OPERATIONAL_ZONES } from "@/config/zones";
import { cn } from "@/lib/cn";
import type { ZoneId } from "@/types";
import { MapPinned } from "lucide-react";

export type ZoneSelection = ZoneId | typeof ALL_ZONES_ID;

export function ZoneSelector({
  value,
  onChange,
  includeAll = true,
  size = "md",
}: {
  value: ZoneSelection;
  onChange: (id: ZoneSelection) => void;
  includeAll?: boolean;
  size?: "sm" | "md";
}) {
  const options = includeAll
    ? [ALL_ZONES_OPTION, ...OPERATIONAL_ZONES]
    : OPERATIONAL_ZONES;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <label className="sr-only" htmlFor="zone-select">
        Hyderabad operational zone
      </label>
      <select
        id="zone-select"
        value={value}
        onChange={(e) => onChange(e.target.value as ZoneSelection)}
        className={cn(
          "h-10 max-w-full rounded-xl border border-border bg-surface px-3 text-sm font-medium text-ink outline-none transition focus:border-flyt-purple focus:ring-2 focus:ring-flyt-purple/15 sm:min-w-[16rem]",
          size === "sm" && "h-9 text-xs",
        )}
        aria-label="Hyderabad operational zones"
      >
        {options.map((zone) => (
          <option key={zone.id} value={zone.id}>
            {zone.name}
          </option>
        ))}
      </select>
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Featured zones">
        {(includeAll ? [ALL_ZONES_OPTION, ...FEATURED_ZONES] : FEATURED_ZONES).map((zone) => {
          const selected = value === zone.id;
          return (
            <button
              key={zone.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(zone.id as ZoneSelection)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flyt-purple focus-visible:ring-offset-2",
                size === "sm" ? "px-3 py-1.5 text-xs" : "px-3.5 py-2 text-sm",
                selected
                  ? "border-flyt-purple bg-flyt-purple text-white shadow-sm"
                  : "border-border bg-surface text-ink hover:border-flyt-purple/40 hover:bg-flyt-purple-soft/50",
              )}
            >
              <MapPinned className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
              {zone.id === ALL_ZONES_ID ? "All zones" : zone.shortLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ZoneCardGrid({
  selected,
  onSelect,
  demandByZone,
  zones = FEATURED_ZONES,
}: {
  selected?: ZoneSelection;
  onSelect: (id: ZoneId) => void;
  demandByZone?: Partial<Record<ZoneId, string>>;
  zones?: typeof OPERATIONAL_ZONES;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {zones.map((zone) => {
        const active = selected === zone.id;
        return (
          <button
            key={zone.id}
            type="button"
            onClick={() => onSelect(zone.id)}
            className={cn(
              "rounded-2xl border p-4 text-left shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-overlay)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flyt-purple",
              active
                ? "border-flyt-purple bg-flyt-purple-soft/40 ring-1 ring-flyt-purple/30"
                : "border-border bg-surface hover:border-flyt-purple/30",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-flyt-purple text-xs font-bold text-white">
                {zone.shortLabel}
              </span>
              <span className="rounded-full bg-ground px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                {zone.status}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-ink">{zone.name}</p>
            <p className="mt-0.5 text-xs text-muted">
              {zone.city} · {demandByZone?.[zone.id] ? `Demand ${demandByZone[zone.id]}` : "Open details"}
            </p>
          </button>
        );
      })}
    </div>
  );
}
