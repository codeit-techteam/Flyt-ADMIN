import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatRelative } from "@/lib/format";
import type { PilotLiveLocation } from "@/types";
import { MapPin, Navigation, Radio } from "lucide-react";

export function LiveLocationPanel({
  location,
  availability,
}: {
  location: PilotLiveLocation | null;
  availability: "online" | "offline" | "busy" | "suspended";
}) {
  const live = availability === "online" || availability === "busy";

  if (!location) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-ground/50 px-4 py-10 text-center">
        <MapPin className="mb-2 h-8 w-8 text-muted opacity-40" strokeWidth={1.5} />
        <p className="text-sm font-medium text-ink">No live location</p>
        <p className="mt-1 max-w-xs text-xs text-muted">
          Location appears after the Pilot grants GPS in the app and goes online.
        </p>
      </div>
    );
  }

  // Project lat/lng into a simple demo map without a map SDK.
  const x = ((location.longitude - 78.3) / 0.4) * 100;
  const y = ((17.55 - location.latitude) / 0.3) * 100;
  const pinX = Math.min(92, Math.max(8, x));
  const pinY = Math.min(88, Math.max(12, y));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={live ? "success" : "neutral"}>
          {live ? (
            <span className="inline-flex items-center gap-1">
              <Radio className="h-3 w-3" /> Live
            </span>
          ) : (
            "Last known"
          )}
        </Badge>
        <span className="text-xs text-muted">Updated {formatRelative(location.updatedAt)}</span>
      </div>

      <div
        className="relative h-48 overflow-hidden rounded-xl border border-border"
        style={{
          background:
            "linear-gradient(160deg, #e8eef5 0%, #dfe8f2 40%, #d4e0ec 100%)",
        }}
      >
        {/* Subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden
        />
        {/* Soft roads */}
        <div
          className="pointer-events-none absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 bg-white/70"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/3 top-0 w-[3px] bg-white/60"
          aria-hidden
        />

        <div
          className="absolute -translate-x-1/2 -translate-y-full"
          style={{ left: `${pinX}%`, top: `${pinY}%` }}
        >
          <div className="relative flex flex-col items-center">
            {live ? (
              <span className="absolute -inset-2 animate-ping rounded-full bg-flyt-purple/30" />
            ) : null}
            <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-flyt-purple text-white shadow-lg ring-2 ring-white">
              <Navigation className="h-4 w-4" strokeWidth={2.25} />
            </div>
            <div className="h-2 w-2 -mt-0.5 rotate-45 bg-flyt-purple" />
          </div>
        </div>

        <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-surface/95 px-3 py-2 shadow-sm backdrop-blur">
          <p className="truncate text-sm font-semibold text-ink">{location.label}</p>
          <p className="font-mono text-[11px] text-muted">
            {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
          </p>
          <p className="text-[11px] text-muted">{formatDateTime(location.updatedAt)}</p>
        </div>
      </div>
    </div>
  );
}
