"use client";

import { DateRangeFilter } from "@/components/analytics/date-range-filter";
import { DemandSupplyPanel } from "@/components/analytics/demand-supply-panel";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { rideCategoryLabel } from "@/config/ride-categories";
import { getZoneById, isZoneId } from "@/config/zones";
import { DATE_PRESET_LABELS, resolveDateRange } from "@/lib/date-range";
import { formatInr } from "@/lib/format";
import { formatMetric, formatPct } from "@/lib/metrics";
import {
  downloadCsv,
  getZoneDetail,
  zoneReportToCsv,
} from "@/services/zone-analytics";
import type { DateRangePreset, ZoneId } from "@/types";
import {
  ArrowLeft,
  ChevronRight,
  Download,
  FlaskConical,
  MapPinned,
  Radio,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function ZoneDetailPage() {
  const params = useParams<{ zoneId: string }>();
  const router = useRouter();
  const zoneId = params.zoneId as string;
  const zone = getZoneById(zoneId);

  const [preset, setPreset] = useState<DateRangePreset>("today");
  const [customFrom, setCustomFrom] = useState(() => resolveDateRange("custom").from);
  const [customTo, setCustomTo] = useState(() => resolveDateRange("custom").to);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof getZoneDetail>>>(null);

  const period = resolveDateRange(preset, { from: customFrom, to: customTo });
  const peakHour = usePeakHour(detail?.analytics.activity ?? []);
  const isValid = useMemo(() => isZoneId(zoneId), [zoneId]);

  useEffect(() => {
    if (!isValid) {
      setLoading(false);
      setError("Unknown zone.");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getZoneDetail(zoneId as ZoneId, {
      preset,
      from: customFrom,
      to: customTo,
    })
      .then((data) => {
        if (!cancelled) {
          setDetail(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load zone detail.");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [zoneId, isValid, preset, customFrom, customTo]);

  if (!isValid || (!loading && !zone)) {
    return (
      <EmptyState
        title="Zone not found"
        description="Choose a configured Hyderabad operational zone."
        actionLabel="Back to analytics"
        onAction={() => router.push("/analytics")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
        <Link href="/analytics" className="font-medium text-flyt-purple hover:underline">
          Analytics & Reports
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/analytics" className="hover:text-ink">
          Zones
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-ink">{zone?.name ?? zoneId}</span>
      </nav>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => router.push("/analytics")}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Badge tone="warning">
              <span className="inline-flex items-center gap-1">
                <FlaskConical className="h-3 w-3" />
                DEMO DATA
              </span>
            </Badge>
            <Badge tone="success">{zone?.status ?? "active"}</Badge>
          </div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-ink">
            <MapPinned className="h-6 w-6 text-flyt-purple" />
            {zone?.name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {zone?.city}, {zone?.state} · Reporting {DATE_PRESET_LABELS[preset]} ({period.from} →{" "}
            {period.to})
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/live-operations?zone=${zoneId}`}>
            <Button size="sm" variant="secondary">
              <Radio className="h-3.5 w-3.5" />
              Live ops
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            disabled={!detail}
            onClick={() => {
              if (!detail) return;
              downloadCsv(
                `flyt-${zoneId}-${preset}.csv`,
                zoneReportToCsv(detail.report),
              );
            }}
          >
            <Download className="h-3.5 w-3.5" />
            Download CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardBody>
          <DateRangeFilter
            period={period}
            onPresetChange={setPreset}
            onCustomChange={({ from, to }) => {
              setCustomFrom(from);
              setCustomTo(to);
            }}
          />
        </CardBody>
      </Card>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : null}

      {error ? (
        <Card>
          <CardBody>
            <p className="text-sm text-danger">{error}</p>
          </CardBody>
        </Card>
      ) : null}

      {!loading && !error && detail ? (
        <>
          <section>
            <h2 className="mb-3 text-sm font-semibold text-ink">Overview</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <OverviewStat
                label="Customers registered"
                value={formatMetric(detail.analytics.customers.totalRegistered)}
              />
              <OverviewStat
                label="Pilots approved"
                value={formatMetric(detail.analytics.pilots.approvedReady)}
              />
              <OverviewStat
                label="Rides in period"
                value={formatMetric(detail.analytics.rides.totalRides)}
              />
              <OverviewStat
                label="Gross booking value"
                value={formatInr(detail.analytics.rides.grossBookingValueInr)}
              />
            </div>
          </section>

          <ZoneCustomerKpis
            data={detail.analytics.customers}
            zoneId={zoneId as ZoneId}
          />
          <ZonePilotKpis data={detail.analytics.pilots} zoneId={zoneId as ZoneId} />

          <section className="space-y-4">
            <h2 className="mb-3 text-sm font-semibold text-ink">Ride operations</h2>
            <div className="grid gap-4 xl:grid-cols-3">
              <Card className="xl:col-span-2">
                <CardHeader
                  title="Ride activity"
                  description={formatPeakDescription(peakHour)}
                />
                <CardBody className="h-80 pt-2">
                  <RideActivityChart
                    data={detail.analytics.activity}
                    gradientId="zoneDetailRideBar"
                  />
                </CardBody>
              </Card>
              <DemandSupplyPanel data={detail.analytics.demandSupply} />
            </div>
            <ZoneRideKpis
              data={detail.analytics.rides}
              zoneId={zoneId as ZoneId}
              showTitle={false}
            />
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-ink">Onboarding</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <OverviewStat
                label="Customer completion"
                value={formatPct(detail.analytics.customers.completionRatePct)}
              />
              <OverviewStat
                label="Pilot completion"
                value={formatPct(detail.analytics.pilots.completionRatePct)}
              />
              <OverviewStat
                label="Verification backlog"
                value={formatMetric(detail.analytics.pilots.pendingVerification)}
              />
              <OverviewStat
                label="Customer pending"
                value={formatMetric(detail.analytics.customers.pending)}
              />
            </div>
            <Card>
              <CardHeader title="Registration trend" description="Daily onboarding in period" />
              <CardBody className="space-y-2">
                {detail.analytics.onboardingTrend.length ? (
                  detail.analytics.onboardingTrend.slice(-7).map((point) => (
                    <div
                      key={point.date}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                    >
                      <span className="text-muted">{point.date}</span>
                      <span className="tabular-nums text-ink">
                        {point.customers} customers · {point.pilots} pilots
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted">No onboarding trend for this period.</p>
                )}
              </CardBody>
            </Card>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-ink">Reports</h2>
            <ZoneReportTable rows={detail.report} periodLabel={DATE_PRESET_LABELS[preset]} />
            <Card>
              <CardHeader title="Vehicle category distribution" />
              <CardBody className="space-y-3">
                {detail.analytics.vehicleDistribution.map((item) => (
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
                ))}
              </CardBody>
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-ink">Recent activity</h2>
            <ZoneRecentActivity events={detail.analytics.recentEvents} />
          </section>
        </>
      ) : null}
    </div>
  );
}

function OverviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1.5 text-2xl font-bold tabular-nums text-ink">{value}</p>
    </div>
  );
}
