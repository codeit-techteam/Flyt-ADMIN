"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatInr } from "@/lib/format";
import {
  getServiceAreaOverview,
  listHyderabadZoneRows,
  type ZoneListRow,
} from "@/services/service-areas";
import type { DateRangePreset } from "@/types";
import {
  BarChart3,
  Bike,
  Car,
  FlaskConical,
  MapPinned,
  Settings2,
  Shield,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const ZONE_STATUS_TONE = {
  active: "success",
  paused: "warning",
  planned: "neutral",
} as const;

function zoneStatusLabel(status: ZoneListRow["status"]) {
  if (status === "active") return "Active";
  if (status === "paused") return "Inactive";
  return "Not Configured";
}

export default function ServiceAreasPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<Awaited<ReturnType<typeof getServiceAreaOverview>> | null>(
    null,
  );
  const [rows, setRows] = useState<ZoneListRow[]>([]);
  const [preset] = useState<DateRangePreset>("today");
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([getServiceAreaOverview(), listHyderabadZoneRows({ preset })])
      .then(([ov, zoneList]) => {
        if (cancelled) return;
        setOverview(ov);
        setRows(zoneList.rows);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Failed to load service area configuration.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [preset]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) => r.name.toLowerCase().includes(needle) || r.id.includes(needle),
    );
  }, [rows, q]);

  const area = overview?.area;

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
        <span>Admin</span>
        <span aria-hidden>/</span>
        <span className="font-medium text-ink">Service Areas</span>
      </nav>

      <PageHeader
        title="Service Areas"
        description="Manage Hyderabad service coverage, operational zones, supported ride categories, and zone-wise performance."
      />

      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-warning-soft px-3 py-2 text-xs font-medium text-warning">
        <FlaskConical className="h-3.5 w-3.5 shrink-0" />
        DEMO DATA — zone metrics are sample fixtures for UI verification, not live operations.
      </div>

      {error ? (
        <Card>
          <CardBody>
            <p className="text-sm text-danger">{error}</p>
          </CardBody>
        </Card>
      ) : null}

      {loading || !area ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <Card className="ring-1 ring-flyt-purple/20">
            <CardHeader
              title={`${area.city}, ${area.state}, ${area.country}`}
              description={`Service area ID ${area.id}`}
              action={
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  {area.launchCity ? <Badge tone="brand">Launch city</Badge> : null}
                  <Badge tone="success">Active</Badge>
                </div>
              }
            />
            <CardBody className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Metric label="City" value={area.city} />
                <Metric label="State" value={area.state} />
                <Metric label="Country" value={area.country} />
                <Metric label="Configured zones" value={String(overview.zoneCount)} />
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href="#zone-performance">
                  <Button size="sm">
                    <BarChart3 className="h-3.5 w-3.5" />
                    View zone reports
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  disabled
                  title="Zone editing requires backend configuration APIs"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  Manage zones
                </Button>
              </div>
              <p className="text-xs text-muted">
                Zone activation and map polygon editing are not available in this frontend demo —
                backend configuration APIs are required.
              </p>
            </CardBody>
          </Card>

          <section className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader
                title="Vehicle categories"
                description="Canonical bookable categories from the FLYT customer app. Pilot Hyderabad onboarding groups Mini / Sedan / SUV under FLYT Cab."
              />
              <CardBody className="space-y-3">
                {area.rideCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-border bg-ground/40 px-3 py-2.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-flyt-purple-soft text-flyt-purple">
                        {cat.id === "bike" ? (
                          <Bike className="h-4 w-4" />
                        ) : (
                          <Car className="h-4 w-4" />
                        )}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-ink">{cat.label}</p>
                        <p className="text-xs text-muted">{cat.description}</p>
                        <p className="mt-1 text-[11px] text-muted">
                          Pilot: {cat.pilotLabel}
                          {cat.pilotCategoryId === "cab" && cat.id !== "mini"
                            ? " (umbrella)"
                            : ""}
                        </p>
                      </div>
                    </div>
                    <Badge tone="success">Enabled</Badge>
                  </div>
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Supported modes & policies"
                description="Rider experience and Pilot dispatch preferences — not vehicle types."
              />
              <CardBody className="space-y-3">
                {area.modes.map((mode) => (
                  <div
                    key={mode.id}
                    className="rounded-xl border border-border bg-ground/40 px-3 py-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {mode.id === "she" ? (
                          <Shield className="h-4 w-4 text-flyt-purple" />
                        ) : mode.id === "silver" ? (
                          <Sparkles className="h-4 w-4 text-flyt-purple" />
                        ) : (
                          <MapPinned className="h-4 w-4 text-flyt-purple" />
                        )}
                        <p className="text-sm font-semibold text-ink">{mode.label}</p>
                      </div>
                      <div className="flex flex-wrap justify-end gap-1">
                        {mode.customerSupported ? (
                          <Badge tone="brand">Customer</Badge>
                        ) : null}
                        {mode.pilotDispatchSupported ? (
                          <Badge tone="info">Pilot dispatch</Badge>
                        ) : (
                          <Badge tone="neutral">No Pilot dispatch</Badge>
                        )}
                      </div>
                    </div>
                    <p className="mt-1.5 text-xs text-muted">{mode.description}</p>
                    <p className="mt-1 text-[11px] text-muted">{mode.eligibility}</p>
                  </div>
                ))}
              </CardBody>
            </Card>
          </section>

          <section id="zone-performance" className="scroll-mt-6 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-ink">
                  Hyderabad operational zones
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {overview.zoneCount} configured zones · metrics shown for today (DEMO DATA)
                </p>
              </div>
              <label className="block w-full sm:w-72">
                <span className="mb-1 block text-xs font-semibold text-muted">Search zones</span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Zone name or ID…"
                  className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none transition focus:border-flyt-purple focus:ring-2 focus:ring-flyt-purple/15"
                />
              </label>
            </div>

            {filtered.length === 0 ? (
              <Card>
                <CardBody>
                  <p className="text-sm text-muted">No zones match “{q}”.</p>
                </CardBody>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((zone) => (
                  <Card key={zone.id} className="flex flex-col">
                    <CardBody className="flex flex-1 flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-ink">{zone.name}</p>
                          <p className="font-mono text-[11px] text-muted">{zone.id}</p>
                        </div>
                        <Badge tone={ZONE_STATUS_TONE[zone.status]}>
                          {zoneStatusLabel(zone.status)}
                        </Badge>
                      </div>

                      <dl className="grid grid-cols-2 gap-2 text-xs">
                        <Stat label="Customers" value={zone.registeredCustomers.toLocaleString("en-IN")} />
                        <Stat label="Pilots" value={zone.registeredPilots.toLocaleString("en-IN")} />
                        <Stat label="Online now" value={String(zone.onlinePilots)} />
                        <Stat label="Rides (period)" value={zone.totalRides.toLocaleString("en-IN")} />
                        <Stat label="Completed" value={zone.completedRides.toLocaleString("en-IN")} />
                        <Stat label="Cancelled" value={zone.cancelledRides.toLocaleString("en-IN")} />
                        <Stat
                          label="Gross booking"
                          value={formatInr(zone.grossBookingValueInr)}
                          className="col-span-2"
                        />
                      </dl>

                      <div className="mt-auto pt-1">
                        <Link href={`/service-areas/hyderabad/zones/${zone.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            View Report
                          </Button>
                        </Link>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-ground/50 px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-muted">{label}</dt>
      <dd className="mt-0.5 font-semibold tabular-nums text-ink">{value}</dd>
    </div>
  );
}
