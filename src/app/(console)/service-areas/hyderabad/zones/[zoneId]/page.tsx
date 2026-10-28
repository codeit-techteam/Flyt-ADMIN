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
import { getEnabledRideCategories, rideCategoryLabel } from "@/config/ride-categories";
import { RIDE_MODES } from "@/config/ride-modes";
import { getZoneById, isZoneId } from "@/config/zones";
import { DATE_PRESET_LABELS, resolveDateRange } from "@/lib/date-range";
import { formatInr } from "@/lib/format";
import { formatMetric, formatPct } from "@/lib/metrics";
import {
  downloadCsv,
  getHyderabadZoneDetail,
  zoneReportToCsv,
} from "@/services/service-areas";
import type { DateRangePreset } from "@/types";
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
import { useEffect, useState } from "react";

export default function HyderabadZoneDetailPage() {
  const params = useParams<{ zoneId: string }>();
  const router = useRouter();
  const zoneId = params.zoneId;
  const zone = getZoneById(zoneId);
  const valid = isZoneId(zoneId);

  const [preset, setPreset] = useState<DateRangePreset>("today");
  const [customFrom, setCustomFrom] = useState(() => resolveDateRange("custom").from);
  const [customTo, setCustomTo] = useState(() => resolveDateRange("custom").to);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof getHyderabadZoneDetail>>>(null);

  const period = resolveDateRange(preset, { from: customFrom, to: customTo });
  const peakHour = usePeakHour(detail?.analytics.activity ?? []);

  useEffect(() => {
    if (!valid) {
      setLoading(false);
      setError("Unknown zone.");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getHyderabadZoneDetail(zoneId, {
      preset,
      from: customFrom,
      to: customTo,
    })
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Failed to load zone report.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [zoneId, valid, preset, customFrom, customTo]);

  if (!valid || (!loading && !zone)) {
    return (
      <EmptyState
        title="Zone not found"
        description="Choose a configured Hyderabad operational zone."
        actionLabel="Back to Service Areas"
        onAction={() => router.push("/service-areas")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
        <span>Admin</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/service-areas" className="font-medium text-flyt-purple hover:underline">
          Service Areas
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>Hyderabad</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-ink">{zone?.name ?? zoneId}</span>
      </nav>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => router.push("/service-areas")}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Badge tone="warning">
              <span className="inline-flex items-center gap-1">
                <FlaskConical className="h-3 w-3" />
                DEMO DATA
              </span>
            </Badge>
            <Badge tone="success">{zone?.status === "active" ? "Active" : zone?.status}</Badge>
          </div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-ink">
            <MapPinned className="h-6 w-6 text-flyt-purple" />
            {zone?.name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Zone ID <span className="font-mono text-xs">{zoneId}</span> · {zone?.city},{" "}
            {zone?.state}, India · {DATE_PRESET_LABELS[preset]} ({period.from} → {period.to})
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
            disabled={!detail || detail.report.length === 0}
            onClick={() => {
              if (!detail) return;
              downloadCsv(`flyt-hyd-${zoneId}-${preset}.csv`, zoneReportToCsv(detail.report));
            }}
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
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

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Supported ride categories" description="From FLYT customer booking" />
          <CardBody className="flex flex-wrap gap-1.5">
            {getEnabledRideCategories().map((c) => (
              <Badge key={c.id} tone="brand">
                {c.label}
              </Badge>
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader
            title="Supported modes & policies"
            description="Experience modes — not vehicle categories"
          />
          <CardBody className="flex flex-wrap gap-1.5">
            {RIDE_MODES.map((m) => (
              <Badge key={m.id} tone="neutral">
                {m.label}
              </Badge>
            ))}
          </CardBody>
        </Card>
      </section>

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
            <h2 className="mb-3 text-sm font-semibold text-ink">Zone overview</h2>
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
            zoneId={isZoneId(zoneId) ? zoneId : undefined}
          />
          <ZonePilotKpis
            data={detail.analytics.pilots}
            zoneId={isZoneId(zoneId) ? zoneId : undefined}
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
                    data={detail.analytics.activity}
                    gradientId="saZoneDetailRideBar"
                  />
                </CardBody>
              </Card>
              <DemandSupplyPanel data={detail.analytics.demandSupply} />
            </div>
            <ZoneRideKpis
              data={detail.analytics.rides}
              zoneId={isZoneId(zoneId) ? zoneId : undefined}
              showTitle={false}
            />
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-ink">Onboarding trends</h2>
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
              <CardHeader title="Registration trend" description="Daily onboarding in period · DEMO DATA" />
              <CardBody className="space-y-2">
                {detail.analytics.onboardingTrend.length ? (
                  detail.analytics.onboardingTrend.slice(-7).map((point) => (
                    <div
                      key={point.date}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                    >
                      <span className="text-muted">{point.date}</span>
                      <span className="tabular-nums text-ink">
                        {point.customers} customers · {point.pilots} Pilots
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted">No onboarding records for this period.</p>
                )}
              </CardBody>
            </Card>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-ink">Reports</h2>
            {detail.report.length === 0 ? (
              <Card>
                <CardBody>
                  <p className="text-sm text-muted">
                    No report rows for this zone and reporting period.
                  </p>
                </CardBody>
              </Card>
            ) : (
              <ZoneReportTable rows={detail.report} periodLabel={DATE_PRESET_LABELS[preset]} />
            )}
            <Card>
              <CardHeader
                title="Vehicle category distribution"
                description="Grouped by customer booking category IDs · DEMO DATA"
              />
              <CardBody className="space-y-3">
                {detail.analytics.vehicleDistribution.length === 0 ? (
                  <p className="text-sm text-muted">No category distribution for this period.</p>
                ) : (
                  detail.analytics.vehicleDistribution.map((item) => (
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
                )}
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
