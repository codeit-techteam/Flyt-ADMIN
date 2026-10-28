"use client";

import { ZoneSelector, type ZoneSelection } from "@/components/analytics/zone-selector";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ALL_ZONES_ID, FEATURED_ZONES, getZoneById, getZoneLabel, isZoneId } from "@/config/zones";
import { cn } from "@/lib/cn";
import { formatRelative } from "@/lib/format";
import {
  incidentStatusLabel,
  rideStatusLabel,
  rideTone,
  severityLabel,
  severityTone,
} from "@/lib/status";
import { getLiveOperations } from "@/services/data";
import type { LiveOperationsSnapshot, ZoneId } from "@/types";
import {
  Activity,
  AlertTriangle,
  FlaskConical,
  MapPinned,
  Radio,
  Siren,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

function LiveOperationsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialZone = (searchParams.get("zone") as ZoneSelection | null) ?? ALL_ZONES_ID;

  const [selection, setSelection] = useState<ZoneSelection>(
    initialZone === ALL_ZONES_ID || isZoneId(initialZone) ? initialZone : ALL_ZONES_ID,
  );
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<LiveOperationsSnapshot | null>(null);

  const syncUrl = useCallback(
    (zone: ZoneSelection) => {
      const params = new URLSearchParams();
      params.set("zone", zone);
      router.replace(`/live-operations?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getLiveOperations(selection).then((data) => {
      if (!cancelled) {
        setSnapshot(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [selection]);

  const onZoneChange = (id: ZoneSelection) => {
    setSelection(id);
    syncUrl(id);
  };

  const byZoneMap = useMemo(() => {
    const map = new Map<ZoneId, LiveOperationsSnapshot["byZone"][number]>();
    snapshot?.byZone.forEach((row) => map.set(row.zoneId, row));
    return map;
  }, [snapshot]);

  const zoneLabel = getZoneLabel(selection);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Operations"
        description={`${zoneLabel} · active trips and open SOS. Map streaming is not connected — list view only.`}
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
        <CardBody className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Hyderabad operational zone
          </p>
          <ZoneSelector value={selection} onChange={onZoneChange} />
        </CardBody>
      </Card>

      {loading || !snapshot ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <SnapStat
              label="Active rides"
              value={snapshot.counts.activeRides}
              icon={Radio}
              tone="brand"
            />
            <SnapStat
              label="Assigned / en route"
              value={snapshot.counts.inProgress}
              icon={Activity}
              tone="info"
            />
            <SnapStat
              label="Open SOS"
              value={snapshot.counts.openSos}
              hint={
                snapshot.counts.criticalSos > 0
                  ? `${snapshot.counts.criticalSos} critical`
                  : undefined
              }
              icon={Siren}
              tone="danger"
            />
          </div>

          {selection === ALL_ZONES_ID ? (
            <section className="space-y-3">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-ink">Zone-wise activity</h2>
                  <p className="text-xs text-muted">
                    Featured corridors · select a zone to focus the board
                  </p>
                </div>
                <Link
                  href="/service-areas"
                  className="text-xs font-semibold text-flyt-purple hover:underline"
                >
                  All service areas
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {FEATURED_ZONES.map((zone) => {
                  const row = byZoneMap.get(zone.id);
                  const active = row?.activeRides ?? 0;
                  const sos = row?.openSos ?? 0;
                  return (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => onZoneChange(zone.id)}
                      className="rounded-2xl border border-border bg-surface p-4 text-left shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-flyt-purple/30 hover:shadow-[var(--shadow-overlay)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flyt-purple"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-flyt-purple text-xs font-bold text-white">
                          {zone.shortLabel}
                        </span>
                        {sos > 0 ? (
                          <Badge tone="danger">{sos} SOS</Badge>
                        ) : (
                          <Badge tone="success">Clear</Badge>
                        )}
                      </div>
                      <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-ink">
                        <MapPinned className="h-3.5 w-3.5 text-flyt-purple" />
                        {zone.name}
                      </p>
                      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <dt className="text-muted">Active</dt>
                          <dd className="font-bold tabular-nums text-ink">{active}</dd>
                        </div>
                        <div>
                          <dt className="text-muted">Searching</dt>
                          <dd className="font-bold tabular-nums text-ink">
                            {row?.searching ?? 0}
                          </dd>
                        </div>
                      </dl>
                    </button>
                  );
                })}
              </div>

              {snapshot.byZone.length > FEATURED_ZONES.length ? (
                <Card>
                  <CardHeader
                    title="Other zones with activity"
                    description="Zones outside the featured strip that currently have live rides or SOS"
                  />
                  <CardBody className="flex flex-wrap gap-2">
                    {snapshot.byZone
                      .filter((row) => !FEATURED_ZONES.some((z) => z.id === row.zoneId))
                      .map((row) => {
                        const zone = getZoneById(row.zoneId);
                        if (!zone) return null;
                        return (
                          <button
                            key={row.zoneId}
                            type="button"
                            onClick={() => onZoneChange(row.zoneId)}
                            className="inline-flex items-center gap-2 rounded-full border border-border bg-ground/50 px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-flyt-purple/40 hover:bg-flyt-purple-soft/40"
                          >
                            <span className="font-mono text-[10px] text-flyt-purple">
                              {zone.shortLabel}
                            </span>
                            {zone.name}
                            <span className="tabular-nums text-muted">
                              {row.activeRides} live
                              {row.openSos > 0 ? ` · ${row.openSos} SOS` : ""}
                            </span>
                          </button>
                        );
                      })}
                  </CardBody>
                </Card>
              ) : null}
            </section>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader
                title={`Active rides (${snapshot.activeRides.length})`}
                description={
                  selection === ALL_ZONES_ID
                    ? "All Hyderabad zones · demo snapshot"
                    : `${zoneLabel} · demo snapshot`
                }
              />
              <CardBody className="space-y-3">
                {snapshot.activeRides.length === 0 ? (
                  <EmptyState
                    title="No active rides in this zone"
                    description="Try another corridor or switch back to all Hyderabad zones."
                    actionLabel="All zones"
                    onAction={() => onZoneChange(ALL_ZONES_ID)}
                  />
                ) : (
                  snapshot.activeRides.map((ride) => {
                    const zone = ride.zoneId ? getZoneById(ride.zoneId) : undefined;
                    return (
                      <Link
                        key={ride.id}
                        href={`/rides/${ride.id}`}
                        className="flex flex-col gap-2 rounded-lg border border-border p-3 hover:border-flyt-purple/30 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-mono text-xs font-semibold text-flyt-purple">
                              {ride.id}
                            </p>
                            {zone ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-flyt-purple-soft/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-flyt-purple">
                                <MapPinned className="h-3 w-3" />
                                {zone.shortLabel}
                              </span>
                            ) : null}
                          </div>
                          <p className="text-sm text-ink">
                            {ride.customerName} · {ride.pilotName ?? "Searching Pilot"}
                          </p>
                          <p className="text-xs text-muted">
                            {ride.pickup} → {ride.destination}
                          </p>
                        </div>
                        <Badge tone={rideTone(ride.status)}>
                          {rideStatusLabel[ride.status]}
                        </Badge>
                      </Link>
                    );
                  })
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title={`Open SOS (${snapshot.openSos.length})`}
                description={
                  snapshot.counts.criticalSos > 0
                    ? `${snapshot.counts.criticalSos} critical`
                    : "No critical alerts"
                }
              />
              <CardBody className="space-y-3">
                {snapshot.openSos.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border bg-ground/40 px-3 py-8 text-center">
                    <AlertTriangle className="mx-auto h-5 w-5 text-muted" />
                    <p className="mt-2 text-sm font-medium text-ink">No open SOS</p>
                    <p className="mt-1 text-xs text-muted">
                      Safety queue is clear for {zoneLabel}.
                    </p>
                  </div>
                ) : (
                  snapshot.openSos.map((incident) => {
                    const zone = getZoneById(incident.zoneId);
                    return (
                      <Link
                        key={incident.id}
                        href={`/safety/${incident.id}`}
                        className="block rounded-lg border border-red-200 bg-danger-soft/40 p-3"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-mono text-xs font-semibold">{incident.id}</p>
                          <Badge tone={severityTone(incident.severity)}>
                            {severityLabel[incident.severity]}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-ink">{incident.summary}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                          {zone ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-flyt-purple">
                              <MapPinned className="h-3 w-3" />
                              {zone.name}
                            </span>
                          ) : null}
                          <span>{incidentStatusLabel[incident.status]}</span>
                          <span>·</span>
                          <span>{formatRelative(incident.openedAt)}</span>
                        </div>
                      </Link>
                    );
                  })
                )}
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function SnapStat({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  hint?: string;
  icon: typeof Radio;
  tone: "brand" | "warning" | "info" | "danger";
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-xl",
            tone === "brand" && "bg-flyt-purple-soft text-flyt-purple",
            tone === "warning" && "bg-warning-soft text-warning",
            tone === "info" && "bg-info-soft text-info",
            tone === "danger" && "bg-danger-soft text-danger",
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-ink">{value}</p>
      {hint ? <p className="mt-0.5 text-xs font-medium text-danger">{hint}</p> : null}
    </div>
  );
}

export default function LiveOperationsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      }
    >
      <LiveOperationsInner />
    </Suspense>
  );
}
