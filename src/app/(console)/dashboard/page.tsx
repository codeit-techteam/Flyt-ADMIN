"use client";

import { DateRangeFilter } from "@/components/analytics/date-range-filter";
import {
  RideActivityChart,
  formatHourClock,
  formatPeakDescription,
  usePeakHour,
} from "@/components/analytics/ride-activity-chart";
import { RideActivityInsights } from "@/components/analytics/ride-activity-insights";
import { ZoneOpsSection } from "@/components/analytics/zone-ops-section";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, type Column } from "@/components/tables/data-table";
import { DATE_PRESET_LABELS, resolveDateRange } from "@/lib/date-range";
import { formatInr, formatRelative } from "@/lib/format";
import { summarizeRideActivity } from "@/lib/ride-activity";
import { rideStatusLabel, rideTone, severityTone, verificationLabel, verificationTone } from "@/lib/status";
import { getDashboard } from "@/services/data";
import type { DateRangePreset, Pilot, Ride, SosIncident, Vehicle } from "@/types";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Car,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  FlaskConical,
  IndianRupee,
  MapPin,
  Radio,
  ShieldAlert,
  Sparkles,
  UserCheck,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [preset, setPreset] = useState<DateRangePreset>("today");
  const [customFrom, setCustomFrom] = useState(() => resolveDateRange("custom").from);
  const [customTo, setCustomTo] = useState(() => resolveDateRange("custom").to);
  const [data, setData] = useState<Awaited<ReturnType<typeof getDashboard>> | null>(null);

  const period = useMemo(
    () => resolveDateRange(preset, { from: customFrom, to: customTo }),
    [preset, customFrom, customTo],
  );

  useEffect(() => {
    let cancelled = false;
    setActivityLoading(true);
    setError(null);

    getDashboard({ period })
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setLoading(false);
        setActivityLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Failed to load ride activity. Please try again.");
        setLoading(false);
        setActivityLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [period]);

  const peakHour = usePeakHour(data?.activity ?? []);
  const activitySummary = useMemo(
    () => summarizeRideActivity(data?.activity ?? []),
    [data?.activity],
  );

  const rideColumns: Column<Ride>[] = [
    {
      key: "id",
      header: "Ride",
      render: (r) => <span className="font-mono text-xs font-semibold text-flyt-purple">{r.id}</span>,
    },
    {
      key: "route",
      header: "Route",
      render: (r) => (
        <div className="max-w-[220px]">
          <p className="truncate text-sm font-medium text-ink">{r.customerName}</p>
          <p className="truncate text-xs text-muted">
            {r.pickup.split(",")[0]} → {r.destination.split(",")[0]}
          </p>
        </div>
      ),
    },
    { key: "pilot", header: "Pilot", render: (r) => r.pilotName ?? "—" },
    {
      key: "status",
      header: "Status",
      render: (r) => <Badge tone={rideTone(r.status)}>{rideStatusLabel[r.status]}</Badge>,
    },
    {
      key: "fare",
      header: "Fare",
      render: (r) => <span className="tabular-nums font-semibold">{formatInr(r.fareInr)}</span>,
    },
  ];

  if (loading || !data) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          <Skeleton className="h-80 rounded-2xl xl:col-span-2" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { kpis } = data;
  const statusTotal = kpis.completedRides + kpis.activeRides + kpis.cancelledRides || 1;
  const statusBreakdown = [
    {
      label: "Completed",
      value: kpis.completedRides,
      tone: "success" as const,
      icon: CheckCircle2,
      pct: Math.round((kpis.completedRides / statusTotal) * 100),
      bar: "bg-success",
    },
    {
      label: "Active",
      value: kpis.activeRides,
      tone: "info" as const,
      icon: CircleDot,
      pct: Math.round((kpis.activeRides / statusTotal) * 100),
      bar: "bg-info",
    },
    {
      label: "Cancelled",
      value: kpis.cancelledRides,
      tone: "danger" as const,
      icon: XCircle,
      pct: Math.round((kpis.cancelledRides / statusTotal) * 100),
      bar: "bg-danger",
    },
  ];

  const todayLabel = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-flyt-purple/10 bg-gradient-to-br from-[#2a1445] via-flyt-purple to-[#5a3488] p-5 text-white shadow-[var(--shadow-overlay)] sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-[#c4a5ef]/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
                </span>
                Live snapshot
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
                <MapPin className="h-3 w-3" />
                Hyderabad · Telangana
              </span>
            </div>
            <h1 className="font-brand text-2xl font-bold tracking-tight sm:text-3xl">Operations dashboard</h1>
            <p className="mt-1.5 text-sm text-white/75">
              {todayLabel} · {kpis.activeRides} trips live · {kpis.onlinePilots} pilots online
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="border-0 bg-white/95 text-flyt-purple hover:bg-white"
              onClick={() => router.push("/live-operations")}
            >
              <Radio className="h-4 w-4" />
              Live Operations
            </Button>
            <Button
              size="sm"
              className="bg-white/15 text-white ring-1 ring-inset ring-white/25 hover:bg-white/25"
              onClick={() => router.push("/safety")}
            >
              <ShieldAlert className="h-4 w-4" />
              SOS queue ({kpis.openSos})
            </Button>
          </div>
        </div>
      </section>

      {/* Primary KPIs */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Today at a glance</h2>
          <p className="text-xs text-muted">Demonstration metrics</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Rides today"
            value={String(kpis.ridesToday)}
            hint="+12% vs yesterday"
            icon={Activity}
            href="/rides"
            size="lg"
          />
          <KpiCard
            label="Active rides"
            value={String(kpis.activeRides)}
            hint="In progress now"
            icon={Car}
            href="/live-operations"
            tone="info"
            size="lg"
          />
          <KpiCard
            label="Online Pilots"
            value={String(kpis.onlinePilots)}
            hint="Available to match"
            icon={UserCheck}
            href="/pilots"
            tone="success"
            size="lg"
          />
          <KpiCard
            label="Gross booking value"
            value={formatInr(kpis.grossBookingValueInr)}
            hint="Today · INR"
            icon={IndianRupee}
            href="/analytics"
            size="lg"
          />
        </div>
      </section>

      {/* Attention + secondary */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          label="Open SOS"
          value={String(kpis.openSos)}
          hint="Needs immediate attention"
          icon={ShieldAlert}
          href="/safety"
          tone="danger"
        />
        <KpiCard
          label="Pending Pilot verifications"
          value={String(kpis.pendingPilotVerifications)}
          hint="Docs awaiting review"
          icon={AlertTriangle}
          href="/pilots?verification=under_review"
          tone="warning"
        />
        <KpiCard
          label="Pilot payouts pending"
          value={formatInr(kpis.pilotPayoutsPendingInr)}
          hint="Ready for finance"
          icon={Wallet}
          href="/payments"
          tone="warning"
        />
      </section>

      {/* Chart + status */}
      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Ride Activity Today"
            description={
              preset === "today"
                ? formatPeakDescription(peakHour)
                : `${DATE_PRESET_LABELS[preset]} · ${formatPeakDescription(peakHour)}`
            }
            action={
              <div className="flex flex-wrap items-center justify-end gap-2">
                {data.isDemo ? (
                  <Badge tone="warning">
                    <span className="inline-flex items-center gap-1">
                      <FlaskConical className="h-3 w-3" />
                      DEMO DATA
                    </span>
                  </Badge>
                ) : null}
                <Button
                  type="button"
                  variant={analyticsOpen ? "secondary" : "outline"}
                  size="sm"
                  className="relative z-10 shrink-0"
                  aria-expanded={analyticsOpen}
                  onClick={() => setAnalyticsOpen((open) => !open)}
                >
                  {analyticsOpen ? "Hide details" : "Expand analytics"}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition duration-200 ${analyticsOpen ? "rotate-180" : ""}`}
                  />
                </Button>
              </div>
            }
          />
          <CardBody className="pt-2">
            <div className="mb-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                Reporting period
              </p>
              <DateRangeFilter
                period={period}
                onPresetChange={setPreset}
                onCustomChange={({ from, to }) => {
                  setCustomFrom(from);
                  setCustomTo(to);
                }}
              />
            </div>

            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-surface p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Total rides
                </p>
                <p className="mt-1 text-lg font-bold tabular-nums text-ink">
                  {activitySummary.total.toLocaleString("en-IN")}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {preset === "today" || preset === "yesterday"
                    ? "Sum of 2-hour slots"
                    : "Typical day pattern for range"}
                </p>
              </div>
              <div className="rounded-xl border border-flyt-purple/20 bg-flyt-purple-soft/40 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Peak time
                </p>
                <p className="mt-1 text-lg font-bold text-ink">
                  {activitySummary.peak
                    ? formatHourClock(activitySummary.peak.hour)
                    : "—"}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {activitySummary.peak
                    ? `${activitySummary.peak.rides} rides`
                    : "No peak yet"}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Quietest time
                </p>
                <p className="mt-1 text-lg font-bold text-ink">
                  {activitySummary.quiet
                    ? formatHourClock(activitySummary.quiet.hour)
                    : "—"}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {activitySummary.quiet
                    ? `${activitySummary.quiet.rides} rides`
                    : "No quiet slot yet"}
                </p>
              </div>
            </div>

            {error ? (
              <div className="mb-3 rounded-xl border border-danger/20 bg-danger-soft/50 px-3 py-2.5 text-sm text-danger">
                {error}
              </div>
            ) : null}

            <div
              className={`flex h-[22rem] flex-col transition-opacity ${activityLoading ? "opacity-50" : ""}`}
              aria-busy={activityLoading}
            >
              {activityLoading && !data.activity.length ? (
                <Skeleton className="h-full w-full rounded-xl" />
              ) : (
                <RideActivityChart data={data.activity} gradientId="dashRideArea" />
              )}
            </div>
            {analyticsOpen ? (
              <div className="mt-2">
                <RideActivityInsights
                  data={data.activity}
                  showSummaryStats={false}
                  analyticsHref={`/analytics?zone=all&period=${preset === "custom" ? "today" : preset}`}
                />
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-border bg-ground/40 px-3 py-2.5">
                <p className="text-xs text-muted">
                  Click <span className="font-semibold text-ink">Expand analytics</span> for a
                  plain-language breakdown of peak hours and demand.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="shrink-0 text-flyt-purple"
                  onClick={() => setAnalyticsOpen(true)}
                >
                  Show details
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Ride status" description="Share of today’s volume" />
          <CardBody className="space-y-4">
            {statusBreakdown.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-ground p-1.5 text-muted">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-sm font-medium text-ink">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold tabular-nums text-ink">{item.value}</span>
                      <Badge tone={item.tone}>{item.pct}%</Badge>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-ground">
                    <div
                      className={`h-full rounded-full ${item.bar} transition-all duration-500`}
                      style={{ width: `${Math.max(item.pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="rounded-xl border border-dashed border-border bg-ground/60 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                <Sparkles className="h-3 w-3" />
                Quick actions
              </p>
              <div className="flex flex-col gap-1.5">
                {[
                  { href: "/live-operations", label: "Live Operations" },
                  { href: "/pilots?verification=under_review", label: "Pilot verification" },
                  { href: "/safety", label: "SOS incidents" },
                  { href: "/customers", label: "Customers" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center justify-between rounded-lg px-2 py-1.5 text-sm font-medium text-flyt-purple transition hover:bg-flyt-purple-soft"
                  >
                    {link.label}
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Secondary metrics strip */}
      <section className="grid auto-rows-fr gap-3 sm:grid-cols-3">
        <KpiCard
          label="Completed"
          value={String(kpis.completedRides)}
          hint="Open completed rides"
          icon={CheckCircle2}
          tone="success"
          href="/rides?status=completed"
        />
        <KpiCard
          label="Cancelled"
          value={String(kpis.cancelledRides)}
          hint="Open cancelled rides"
          icon={XCircle}
          tone="danger"
          href="/rides?status=cancelled"
        />
        <KpiCard
          label="Registered customers"
          value={kpis.registeredCustomers.toLocaleString("en-IN")}
          hint="Open customer directory"
          icon={Users}
          href="/customers"
        />
      </section>

      <ZoneOpsSection />

      {/* Bottom grid */}
      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader
            title="Recent rides"
            description={`${data.recentRides.length} latest Hyderabad trips · click a row for details`}
            action={
              <Link
                href="/rides"
                className="inline-flex items-center gap-1 text-xs font-semibold text-flyt-purple hover:underline"
              >
                View all
                <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <DataTable
            columns={rideColumns}
            rows={data.recentRides}
            onRowClick={(r) => router.push(`/rides/${r.id}`)}
            emptyTitle="No recent rides"
            emptyDescription="Demo rides will appear here."
          />
        </Card>

        <div className="space-y-4">
          <Card className="overflow-hidden border-red-100">
            <CardHeader
              title="Critical alerts"
              description={`${data.criticalAlerts.length} open`}
              action={
                <Link href="/safety" className="text-xs font-semibold text-flyt-purple hover:underline">
                  SOS queue
                </Link>
              }
            />
            <CardBody className="space-y-2.5">
              {data.criticalAlerts.length === 0 ? (
                <p className="text-sm text-muted">No open SOS incidents.</p>
              ) : (
                data.criticalAlerts.map((incident: SosIncident) => (
                  <Link
                    key={incident.id}
                    href={`/safety/${incident.id}`}
                    className="block rounded-xl border border-red-100 bg-gradient-to-br from-danger-soft/80 to-surface p-3 transition hover:border-red-200 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-danger">
                        {incident.id}
                      </span>
                      <Badge tone={severityTone(incident.severity)}>{incident.severity}</Badge>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-sm text-ink">{incident.summary}</p>
                    <p className="mt-1 text-xs text-muted">{formatRelative(incident.openedAt)}</p>
                  </Link>
                ))
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Pending approvals"
              description="Pilot verification backlog"
              action={
                <Link
                  href="/pilots?verification=under_review"
                  className="text-xs font-semibold text-flyt-purple hover:underline"
                >
                  Review
                </Link>
              }
            />
            <CardBody className="space-y-2">
              {data.pendingApprovals.map((pilot: Pilot) => (
                <Link
                  key={pilot.id}
                  href={`/pilots/${pilot.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-transparent bg-ground px-3 py-2.5 transition hover:border-flyt-purple/20 hover:bg-flyt-purple-soft/40"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-flyt-purple text-[11px] font-bold text-white">
                      {pilot.name
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink">{pilot.name}</p>
                      <p className="font-mono text-[11px] text-muted">{pilot.id}</p>
                    </div>
                  </div>
                  <Badge tone={verificationTone(pilot.verification)}>
                    {verificationLabel[pilot.verification]}
                  </Badge>
                </Link>
              ))}
            </CardBody>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Fleet attention"
            description="Vehicles needing verification or Pilot assignment"
            action={
              <Link
                href="/vehicles"
                className="text-xs font-semibold text-flyt-purple hover:underline"
              >
                All vehicles
              </Link>
            }
          />
          <CardBody className="space-y-2">
            {[...data.pendingVehicles, ...data.unassignedVehicles]
              .filter(
                (v, index, arr) => arr.findIndex((item) => item.id === v.id) === index,
              )
              .slice(0, 5)
              .map((vehicle: Vehicle) => (
                <Link
                  key={vehicle.id}
                  href={`/vehicles/${vehicle.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5 transition hover:border-flyt-purple/25 hover:bg-flyt-purple-soft/30"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-flyt-purple">
                      {vehicle.plate}
                    </p>
                    <p className="truncate text-sm text-ink">
                      {vehicle.make} {vehicle.model}
                      {!vehicle.pilotId ? " · Unassigned" : ""}
                    </p>
                  </div>
                  <Badge tone={verificationTone(vehicle.verification)}>
                    {verificationLabel[vehicle.verification]}
                  </Badge>
                </Link>
              ))}
            {data.pendingVehicles.length === 0 && data.unassignedVehicles.length === 0 ? (
              <p className="text-sm text-muted">Fleet is clear — no pending vehicle actions.</p>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Operational events" description="City-wide ops feed" />
          <CardBody>
            <ol className="relative space-y-0 border-l border-border pl-4">
              {data.events.map((event, index) => (
                <li key={event.id} className="relative pb-4 last:pb-0">
                  <span
                    className={`absolute -left-[1.28rem] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-surface ${
                      event.tone === "danger"
                        ? "bg-danger"
                        : event.tone === "warning"
                          ? "bg-warning"
                          : event.tone === "success"
                            ? "bg-success"
                            : "bg-info"
                    }`}
                  />
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm leading-snug text-ink">{event.title}</p>
                      <p className="mt-0.5 text-xs text-muted">{formatRelative(event.at)}</p>
                    </div>
                    {index === 0 ? <Badge tone="brand">new</Badge> : null}
                  </div>
                </li>
              ))}
            </ol>
          </CardBody>
        </Card>
      </section>

      <section className="rounded-2xl border border-border bg-gradient-to-br from-flyt-purple-soft/40 via-surface to-surface p-5 shadow-[var(--shadow-card)]">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ink">Jump to operations</h2>
            <p className="text-xs text-muted">Shortcuts for the most common admin workflows</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { href: "/live-operations?zone=all", label: "Live Operations", hint: "Active rides & SOS" },
            { href: "/service-areas", label: "Service Areas", hint: "Hyderabad zones" },
            { href: "/vehicles?verification=under_review", label: "Vehicle review", hint: "Fleet verification" },
            { href: "/analytics?zone=all", label: "Analytics", hint: "Zone reports" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-xl border border-border bg-surface px-4 py-3 transition hover:-translate-y-0.5 hover:border-flyt-purple/30 hover:shadow-[var(--shadow-card)]"
            >
              <p className="text-sm font-semibold text-ink group-hover:text-flyt-purple">
                {item.label}
              </p>
              <p className="mt-0.5 flex items-center justify-between text-xs text-muted">
                {item.hint}
                <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
