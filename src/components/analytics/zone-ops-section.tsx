"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ALL_ZONES_ID, FEATURED_ZONES } from "@/config/zones";
import { formatInr } from "@/lib/format";
import { formatMetric, formatPct } from "@/lib/metrics";
import { getZoneAnalyticsBundle } from "@/services/zone-analytics";
import type { ZoneAnalyticsBundle } from "@/types";
import { ArrowRight, FlaskConical, MapPinned } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function ZoneOpsSection() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bundle, setBundle] = useState<ZoneAnalyticsBundle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getZoneAnalyticsBundle({ zoneId: ALL_ZONES_ID, preset: "today" })
      .then((data) => {
        if (!cancelled) {
          setBundle(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Unable to load zone operations.");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  if (error || !bundle) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-danger">{error ?? "No zone data available."}</p>
        </CardBody>
      </Card>
    );
  }

  const byZone = new Map(bundle.report.map((r) => [r.id, r]));

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-ink">Zone-Wise Operations</h2>
            <Badge tone="warning">
              <span className="inline-flex items-center gap-1">
                <FlaskConical className="h-3 w-3" />
                DEMO DATA
              </span>
            </Badge>
          </div>
          <p className="text-xs text-muted">
            Hyderabad · featured corridors · all 19 zones in Service Areas
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/service-areas"
            className="inline-flex items-center gap-1 text-xs font-semibold text-flyt-purple hover:underline"
          >
            Service Areas
            <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/live-operations?zone=all"
            className="inline-flex items-center gap-1 text-xs font-semibold text-flyt-purple hover:underline"
          >
            Zone live ops
            <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/analytics"
            className="inline-flex items-center gap-1 text-xs font-semibold text-flyt-purple hover:underline"
          >
            Open zone analytics
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {FEATURED_ZONES.map((zone) => {
          const row = byZone.get(zone.id);
          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => router.push(`/service-areas/hyderabad/zones/${zone.id}`)}
              className="rounded-2xl border border-border bg-surface p-4 text-left shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-flyt-purple/30 hover:shadow-[var(--shadow-overlay)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flyt-purple"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-flyt-purple text-xs font-bold text-white">
                  {zone.shortLabel}
                </span>
                <Badge
                  tone={
                    row?.demandLevel === "high"
                      ? "danger"
                      : row?.demandLevel === "moderate"
                        ? "warning"
                        : "success"
                  }
                >
                  {row?.demandLevel ?? "—"}
                </Badge>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-ink">
                <MapPinned className="h-3.5 w-3.5 text-flyt-purple" />
                {zone.name}
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <Stat label="Customers" value={formatMetric(row?.registeredCustomers)} />
                <Stat label="Pilots" value={formatMetric(row?.registeredPilots)} />
                <Stat label="Rides today" value={formatMetric(row?.totalRides)} />
                <Stat
                  label="GBV"
                  value={row ? formatInr(row.grossBookingValueInr) : "—"}
                />
                <Stat label="Online" value={formatMetric(row?.onlinePilots)} />
                <Stat
                  label="Pending verify"
                  value={formatMetric(row?.pilotsPendingVerification)}
                />
              </dl>
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader
          title="City snapshot · All Hyderabad Zones"
          description={`Completion ${formatPct(bundle.analytics.rides.completionRatePct)} · Pilot onboarding ${formatPct(bundle.analytics.pilots.completionRatePct)}`}
          action={
            <Link
              href="/analytics?zone=all"
              className="text-xs font-semibold text-flyt-purple hover:underline"
            >
              View analytics
            </Link>
          }
        />
        <CardBody className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Snap label="Rides today" value={formatMetric(bundle.analytics.rides.totalRides)} />
          <Snap
            label="Gross booking"
            value={formatInr(bundle.analytics.rides.grossBookingValueInr)}
          />
          <Snap
            label="Online Pilots"
            value={formatMetric(bundle.analytics.pilots.currentlyOnline)}
          />
          <Snap
            label="Active requests"
            value={formatMetric(bundle.analytics.demandSupply.activeRideRequests)}
          />
        </CardBody>
      </Card>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="font-bold tabular-nums text-ink">{value}</dd>
    </div>
  );
}

function Snap({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-ground/40 px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums text-ink">{value}</p>
    </div>
  );
}
