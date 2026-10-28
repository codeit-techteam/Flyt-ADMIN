"use client";

import { DetailField, DetailGrid } from "@/components/pilots/detail-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { rideCategoryLabel } from "@/config/ride-categories";
import { rideModeLabel } from "@/config/ride-modes";
import { getZoneById, getZoneLabel } from "@/config/zones";
import { cn } from "@/lib/cn";
import { formatDateTime, formatInr, formatRelative } from "@/lib/format";
import {
  incidentStatusLabel,
  paymentStatusLabel,
  paymentTone,
  rideStatusLabel,
  rideTone,
  severityLabel,
  severityTone,
} from "@/lib/status";
import { getRide, getRideTimeline, listIncidents } from "@/services/data";
import type { Ride, RideTimelineEvent, SosIncident } from "@/types";
import {
  ArrowLeft,
  ArrowRight,
  Car,
  CheckCircle2,
  CircleDot,
  Copy,
  Flag,
  MapPin,
  Navigation,
  Radio,
  ShieldAlert,
  UserRound,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const LIVE_STATUSES = new Set(["searching", "assigned", "arrived", "in_progress"]);

export default function RideDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { push } = useToast();
  const [ride, setRide] = useState<Ride | null>(null);
  const [timeline, setTimeline] = useState<RideTimelineEvent[]>([]);
  const [incidents, setIncidents] = useState<SosIncident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([getRide(params.id), getRideTimeline(params.id), listIncidents()]).then(
      ([r, t, allIncidents]) => {
        if (cancelled) return;
        setRide(r);
        setTimeline(t);
        setIncidents(allIncidents.filter((i) => i.rideId === params.id));
        setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const zone = useMemo(
    () => (ride?.zoneId ? getZoneById(ride.zoneId) : undefined),
    [ride],
  );

  const progress = useMemo(() => {
    if (!ride) return { step: 0, total: 5, label: "" };
    const steps: Array<{ status: string[]; label: string }> = [
      { status: ["requested", "searching"], label: "Requested" },
      { status: ["assigned"], label: "Assigned" },
      { status: ["arrived"], label: "Arrived" },
      { status: ["in_progress"], label: "In progress" },
      { status: ["completed"], label: "Completed" },
    ];
    if (ride.status === "cancelled") {
      return { step: 0, total: steps.length, label: "Cancelled" };
    }
    const idx = steps.findIndex((s) => s.status.includes(ride.status));
    return {
      step: idx >= 0 ? idx + 1 : 1,
      total: steps.length,
      label: steps[Math.max(idx, 0)]?.label ?? rideStatusLabel[ride.status],
    };
  }, [ride]);

  function copy(value: string, label: string) {
    void navigator.clipboard.writeText(value).then(
      () => push(`${label} copied`, "success"),
      () => push(`Could not copy ${label.toLowerCase()}`, "error"),
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 rounded-2xl" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!ride) {
    return (
      <EmptyState
        title="Ride not found"
        description="This trip is not in the demo dataset."
        actionLabel="Back to rides"
        onAction={() => router.push("/rides")}
      />
    );
  }

  const isLive = LIVE_STATUSES.has(ride.status);
  const openSos = incidents.filter((i) => i.status !== "resolved");

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
        <Link href="/rides" className="font-medium text-flyt-purple hover:underline">
          Rides
        </Link>
        <span>/</span>
        <span className="font-mono font-semibold text-ink">{ride.id}</span>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-flyt-purple/15 bg-gradient-to-br from-[#2a1445] via-flyt-purple to-[#5a3488] p-5 text-white shadow-[var(--shadow-overlay)] sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-48 w-48 rounded-full bg-[#c4a5ef]/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Link href="/rides">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  </span>
                  Live trip
                </span>
              ) : null}
              {openSos.length > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-danger px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide">
                  <ShieldAlert className="h-3 w-3" />
                  {openSos.length} SOS
                </span>
              ) : null}
            </div>

            <h1 className="font-mono text-2xl font-bold tracking-tight sm:text-3xl">{ride.id}</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/80">
              {ride.pickup} → {ride.destination}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone={rideTone(ride.status)} className="bg-white/95">
                {rideStatusLabel[ride.status]}
              </Badge>
              <Badge tone={paymentTone(ride.paymentStatus)} className="bg-white/95">
                {paymentStatusLabel[ride.paymentStatus]}
              </Badge>
              <Badge tone="brand" className="bg-white/95">
                {rideCategoryLabel(ride.vehicleCategory)}
              </Badge>
              <Badge tone="neutral" className="bg-white/95 text-ink">
                {rideModeLabel(ride.mode)}
              </Badge>
              {!ride.pilotId ? (
                <Badge tone="warning" className="bg-white/95">
                  Unassigned
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="border-0 bg-white/95 text-flyt-purple hover:bg-white"
              onClick={() => copy(ride.id, "Ride ID")}
            >
              <Copy className="h-3.5 w-3.5" />
              Copy ID
            </Button>
            {ride.zoneId ? (
              <Link href={`/live-operations?zone=${ride.zoneId}`}>
                <Button
                  size="sm"
                  className="bg-white/15 text-white ring-1 ring-inset ring-white/25 hover:bg-white/25"
                >
                  <Radio className="h-3.5 w-3.5" />
                  Zone live ops
                </Button>
              </Link>
            ) : null}
            {openSos[0] ? (
              <Link href={`/safety/${openSos[0].id}`}>
                <Button size="sm" variant="danger">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Open SOS
                </Button>
              </Link>
            ) : null}
          </div>
        </div>

        {ride.status !== "cancelled" ? (
          <div className="relative mt-6">
            <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-white/65">
              <span>Lifecycle</span>
              <span>
                Step {progress.step}/{progress.total} · {progress.label}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-white transition-all duration-500"
                style={{
                  width: `${Math.max((progress.step / progress.total) * 100, 8)}%`,
                }}
              />
            </div>
          </div>
        ) : null}
      </section>

      {/* KPI strip */}
      <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Snap
          label="Fare"
          value={formatInr(ride.fareInr)}
          hint={paymentStatusLabel[ride.paymentStatus]}
          icon={Wallet}
          tone="brand"
        />
        <Snap
          label="Category"
          value={rideCategoryLabel(ride.vehicleCategory)}
          hint={rideModeLabel(ride.mode)}
          icon={Car}
          tone="info"
        />
        <Snap
          label="Zone"
          value={zone?.name ?? (ride.zoneId ? getZoneLabel(ride.zoneId) : "Outside HYD")}
          hint={ride.city}
          icon={MapPin}
          tone="brand"
        />
        <Snap
          label="Requested"
          value={formatRelative(ride.requestedAt)}
          hint={formatDateTime(ride.requestedAt)}
          icon={CircleDot}
          tone={isLive ? "success" : "info"}
        />
      </div>

      {/* Route + parties */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <div className="border-b border-border bg-gradient-to-r from-flyt-purple-soft/50 via-surface to-surface px-5 py-4">
            <h2 className="text-sm font-semibold text-ink">Route</h2>
            <p className="mt-0.5 text-xs text-muted">Pickup to destination for this trip</p>
          </div>
          <CardBody className="space-y-4">
            <div className="relative space-y-0 rounded-2xl border border-border bg-ground/40 p-4">
              <div className="absolute bottom-8 left-[1.65rem] top-8 w-px bg-flyt-purple/30" />
              <div className="relative flex gap-3 pb-5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-flyt-purple text-white shadow-sm">
                  <Navigation className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    Pickup
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-ink">{ride.pickup}</p>
                </div>
              </div>
              <div className="relative flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
                  <Flag className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    Destination
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-ink">{ride.destination}</p>
                </div>
              </div>
            </div>

            <DetailGrid>
              <DetailField
                label="Zone"
                value={
                  ride.zoneId ? (
                    <Link
                      href={`/service-areas/hyderabad/zones/${ride.zoneId}`}
                      className="text-flyt-purple hover:underline"
                    >
                      {getZoneLabel(ride.zoneId)}
                      {zone?.shortLabel ? ` (${zone.shortLabel})` : ""}
                    </Link>
                  ) : (
                    "Outside Hyderabad"
                  )
                }
              />
              <DetailField label="City" value={ride.city} />
              <DetailField label="Requested" value={formatDateTime(ride.requestedAt)} />
              <DetailField
                label="Completed"
                value={ride.completedAt ? formatDateTime(ride.completedAt) : "—"}
              />
            </DetailGrid>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="People on this trip" description="Customer and Pilot links" />
          <CardBody className="space-y-3">
            <Link
              href={`/customers/${ride.customerId}`}
              className="flex items-center gap-3 rounded-2xl border border-border bg-gradient-to-br from-flyt-purple-soft/40 to-surface p-3.5 transition hover:-translate-y-0.5 hover:border-flyt-purple/30 hover:shadow-[var(--shadow-card)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-flyt-purple text-xs font-bold text-white">
                {initials(ride.customerName)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Customer
                </p>
                <p className="truncate text-sm font-semibold text-ink">{ride.customerName}</p>
                <p className="font-mono text-[11px] text-muted">{ride.customerId}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-flyt-purple" />
            </Link>

            {ride.pilotId ? (
              <Link
                href={`/pilots/${ride.pilotId}`}
                className="flex items-center gap-3 rounded-2xl border border-border bg-gradient-to-br from-info-soft/40 to-surface p-3.5 transition hover:-translate-y-0.5 hover:border-flyt-purple/30 hover:shadow-[var(--shadow-card)]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-info text-xs font-bold text-white">
                  {initials(ride.pilotName ?? "P")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    Pilot
                  </p>
                  <p className="truncate text-sm font-semibold text-ink">
                    {ride.pilotName ?? "Pilot"}
                  </p>
                  <p className="font-mono text-[11px] text-muted">{ride.pilotId}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-flyt-purple" />
              </Link>
            ) : (
              <div className="rounded-2xl border border-dashed border-amber-200 bg-warning-soft/40 px-3.5 py-6 text-center">
                <UserRound className="mx-auto h-5 w-5 text-warning" />
                <p className="mt-2 text-sm font-medium text-ink">Searching for Pilot</p>
                <p className="mt-1 text-xs text-muted">No partner assigned yet in this demo trip.</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <div className="border-b border-border bg-gradient-to-r from-flyt-purple-soft/40 via-surface to-surface px-5 py-4">
            <h2 className="text-sm font-semibold text-ink">Trip & payment</h2>
            <p className="mt-0.5 text-xs text-muted">Fare, category, and settlement status</p>
          </div>
          <CardBody>
            <DetailGrid>
              <DetailField label="Ride ID" value={ride.id} mono />
              <DetailField label="Status" value={rideStatusLabel[ride.status]} />
              <DetailField label="Category" value={rideCategoryLabel(ride.vehicleCategory)} />
              <DetailField label="Mode" value={rideModeLabel(ride.mode)} />
              <DetailField label="Fare" value={formatInr(ride.fareInr)} />
              <DetailField
                label="Payment"
                value={paymentStatusLabel[ride.paymentStatus]}
              />
            </DetailGrid>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone={paymentTone(ride.paymentStatus)}>
                {paymentStatusLabel[ride.paymentStatus]}
              </Badge>
              <Badge tone={rideTone(ride.status)}>{rideStatusLabel[ride.status]}</Badge>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Lifecycle timeline" description="Demo event trail for this ride" />
          <CardBody>
            {timeline.length === 0 ? (
              <p className="text-sm text-muted">No timeline events.</p>
            ) : (
              <ol className="relative space-y-0 border-l border-border pl-4">
                {timeline.map((event, index) => {
                  const latest = index === timeline.length - 1;
                  return (
                    <li key={event.id} className="relative pb-4 last:pb-0">
                      <span
                        className={cn(
                          "absolute -left-[1.28rem] top-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full ring-4 ring-surface",
                          latest ? "bg-flyt-purple" : "bg-flyt-purple/40",
                        )}
                      />
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink">{event.label}</p>
                          {event.detail ? (
                            <p className="mt-0.5 text-xs text-muted">{event.detail}</p>
                          ) : null}
                          <p className="mt-0.5 text-xs text-muted">{formatDateTime(event.at)}</p>
                        </div>
                        {latest ? (
                          <span className="shrink-0 rounded-full bg-flyt-purple-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-flyt-purple">
                            Latest
                          </span>
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </CardBody>
        </Card>
      </div>

      {incidents.length > 0 ? (
        <Card className="border-red-200">
          <CardHeader
            title={`Linked SOS (${incidents.length})`}
            description="Safety incidents raised on this ride"
            action={
              <Link
                href="/safety"
                className="inline-flex items-center gap-1 text-xs font-semibold text-flyt-purple hover:underline"
              >
                SOS queue
                <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <CardBody className="space-y-2">
            {incidents.map((incident) => (
              <Link
                key={incident.id}
                href={`/safety/${incident.id}`}
                className="block rounded-xl border border-red-200 bg-danger-soft/40 px-3.5 py-3 transition hover:border-red-300"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono text-xs font-semibold text-danger">{incident.id}</p>
                  <Badge tone={severityTone(incident.severity)}>
                    {severityLabel[incident.severity]}
                  </Badge>
                  <Badge tone={incident.status === "open" ? "danger" : "warning"}>
                    {incidentStatusLabel[incident.status]}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-ink">{incident.summary}</p>
                <p className="mt-1 text-xs text-muted">{formatRelative(incident.openedAt)}</p>
              </Link>
            ))}
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function Snap({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof Wallet;
  tone: "brand" | "info" | "success";
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-xl",
            tone === "brand" && "bg-flyt-purple-soft text-flyt-purple",
            tone === "info" && "bg-info-soft text-info",
            tone === "success" && "bg-emerald-50 text-success",
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 truncate text-xl font-bold text-ink">{value}</p>
      {hint ? <p className="mt-0.5 truncate text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
