"use client";

import { DateRangeFilter } from "@/components/analytics/date-range-filter";
import { DemandSupplyPanel } from "@/components/analytics/demand-supply-panel";
import { OnboardingComparison } from "@/components/analytics/onboarding-comparison";
import {
  RideActivityChart,
  formatPeakDescription,
  usePeakHour,
} from "@/components/analytics/ride-activity-chart";
import {
  ZoneCustomerKpis,
  ZonePilotKpis,
  ZoneRecentActivity,
  ZoneRideKpis,
} from "@/components/analytics/zone-kpi-grids";
import { ZoneReportTable } from "@/components/analytics/zone-report-table";
import { ZoneSelector, type ZoneSelection } from "@/components/analytics/zone-selector";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { rideCategoryLabel } from "@/config/ride-categories";
import { ALL_ZONES_ID, getZoneLabel, isZoneId } from "@/config/zones";
import { DATE_PRESET_LABELS, resolveDateRange } from "@/lib/date-range";
import { getZoneAnalyticsBundle } from "@/services/zone-analytics";
import type { DateRangePreset, ZoneAnalyticsBundle, ZoneId } from "@/types";
import { FlaskConical } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

function AnalyticsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialZone = (searchParams.get("zone") as ZoneSelection | null) ?? ALL_ZONES_ID;
  const initialPreset = (searchParams.get("period") as DateRangePreset | null) ?? "today";

  const [selection, setSelection] = useState<ZoneSelection>(
    initialZone === ALL_ZONES_ID || isZoneId(initialZone) ? initialZone : ALL_ZONES_ID,
  );
  const [preset, setPreset] = useState<DateRangePreset>(
    ["today", "yesterday", "last_7_days", "last_30_days", "custom"].includes(initialPreset)
      ? initialPreset
      : "today",
  );
  const [customFrom, setCustomFrom] = useState(() => resolveDateRange("custom").from);
  const [customTo, setCustomTo] = useState(() => resolveDateRange("custom").to);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bundle, setBundle] = useState<ZoneAnalyticsBundle | null>(null);

  const period = resolveDateRange(preset, { from: customFrom, to: customTo });
  const peakHour = usePeakHour(bundle?.analytics.activity ?? []);

  const syncUrl = useCallback(
    (zone: ZoneSelection, nextPreset: DateRangePreset) => {
      const params = new URLSearchParams();
      params.set("zone", zone);
      params.set("period", nextPreset);
      router.replace(`/analytics?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getZoneAnalyticsBundle({
      zoneId: selection,
      preset,
      from: customFrom,
      to: customTo,
    })
      .then((data) => {
        if (!cancelled) {
          setBundle(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load zone analytics. Please try again.");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selection, preset, customFrom, customTo]);

  const onZoneChange = (id: ZoneSelection) => {
    setSelection(id);
    syncUrl(id, preset);
  };

  const onPresetChange = (next: DateRangePreset) => {
    setPreset(next);
    syncUrl(selection, next);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Reports"
        description={`${getZoneLabel(selection)} · ${DATE_PRESET_LABELS[preset]} · Hyderabad zone operations`}
        actions={
          <Badge tone="warning">
            <span className="inline-flex items-center gap-1">
              <FlaskConical className="h-3 w-3" />
              DEMO DATA
            </span>
          </Badge>
        }
      />

      <Card>
        <CardBody className="space-y-4">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
              City / zone
            </p>
            <ZoneSelector value={selection} onChange={onZoneChange} includeAll />
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Reporting period
            </p>
            <DateRangeFilter
              period={period}
              onPresetChange={onPresetChange}
              onCustomChange={({ from, to }) => {
                setCustomFrom(from);
                setCustomTo(to);
              }}
            />
          </div>
        </CardBody>
      </Card>

      {loading ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      ) : null}

      {error ? (
        <Card>
          <CardBody>
            <p className="text-sm text-danger">{error}</p>
          </CardBody>
        </Card>
      ) : null}

      {!loading && !error && bundle ? (
        <>
          <div className="rounded-xl border border-flyt-purple/15 bg-flyt-purple-soft/40 px-4 py-3">
            <p className="text-sm font-semibold text-flyt-purple">
              Viewing · {bundle.analytics.zoneName}
            </p>
            <p className="text-xs text-muted">
              Service area {bundle.analytics.status} · {period.from} → {period.to}
            </p>
          </div>

          <ZoneCustomerKpis data={bundle.analytics.customers} zoneId={selection} />
          <ZonePilotKpis data={bundle.analytics.pilots} zoneId={selection} />

          <OnboardingComparison
            rows={bundle.comparison}
            trend={bundle.analytics.onboardingTrend}
          />

          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-ink">Ride operations</h2>
            <div className="grid gap-4 xl:grid-cols-3">
              <Card className="xl:col-span-2">
                <CardHeader
                  title="Ride activity"
                  description={formatPeakDescription(peakHour)}
                />
                <CardBody className="h-80 pt-2">
                  <RideActivityChart
                    data={bundle.analytics.activity}
                    gradientId="analyticsRideBar"
                  />
                </CardBody>
              </Card>
              <DemandSupplyPanel data={bundle.analytics.demandSupply} />
            </div>
            <ZoneRideKpis
              data={bundle.analytics.rides}
              zoneId={selection}
              showTitle={false}
            />
          </section>

          <ZoneReportTable
            rows={
              selection === ALL_ZONES_ID
                ? bundle.report
                : bundle.report.filter((r) => r.id === (selection as ZoneId))
            }
            periodLabel={DATE_PRESET_LABELS[preset]}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="Vehicle category distribution" />
              <CardBody className="space-y-3">
                {bundle.analytics.vehicleDistribution.length ? (
                  bundle.analytics.vehicleDistribution.map((item) => (
                    <div key={item.category}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="font-medium text-ink">
                          {rideCategoryLabel(item.category)}
                        </span>
                        <span className="tabular-nums text-muted">
                          {item.rides} · {item.sharePct}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-ground">
                        <div
                          className="h-2 rounded-full bg-flyt-purple"
                          style={{ width: `${Math.max(item.sharePct, 2)}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted">No vehicle distribution available.</p>
                )}
              </CardBody>
            </Card>
            <ZoneRecentActivity events={bundle.analytics.recentEvents} />
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-12 w-72" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      }
    >
      <AnalyticsPageInner />
    </Suspense>
  );
}
