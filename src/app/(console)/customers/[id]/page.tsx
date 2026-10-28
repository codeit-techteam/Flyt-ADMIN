"use client";

import { CustomerProfileCard } from "@/components/customers/customer-profile-card";
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
import { formatDate, formatInr, formatPhone, formatRelative } from "@/lib/format";
import {
  incidentStatusLabel,
  rideStatusLabel,
  rideTone,
  severityLabel,
  severityTone,
  ticketPriorityLabel,
  ticketPriorityTone,
  ticketStatusLabel,
  ticketStatusTone,
} from "@/lib/status";
import { getCustomer, listIncidents, listRides, listTickets } from "@/services/data";
import type { Customer, Ride, SosIncident, SupportTicket } from "@/types";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  LifeBuoy,
  Mail,
  MapPinned,
  Phone,
  Route,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [incidents, setIncidents] = useState<SosIncident[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([getCustomer(params.id), listRides(), listTickets(), listIncidents()]).then(
      ([c, allRides, allTickets, allIncidents]) => {
        if (cancelled) return;
        setCustomer(c);
        const customerRides = allRides.filter((r) => r.customerId === params.id);
        const rideIds = new Set(customerRides.map((r) => r.id));
        setRides(customerRides);
        setTickets(allTickets.filter((t) => t.requesterId === params.id));
        setIncidents(
          allIncidents.filter(
            (i) => rideIds.has(i.rideId) || i.reporterName === c?.name,
          ),
        );
        setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const stats = useMemo(() => {
    if (!customer) return null;
    const completed = rides.filter((r) => r.status === "completed").length;
    const cancelled = rides.filter((r) => r.status === "cancelled").length;
    const active = rides.filter((r) =>
      ["searching", "assigned", "arrived", "in_progress"].includes(r.status),
    ).length;
    const avgFare =
      customer.totalRides > 0
        ? Math.round(customer.totalSpendInr / customer.totalRides)
        : 0;

    const categoryCounts = rides.reduce<Record<string, number>>((acc, ride) => {
      acc[ride.vehicleCategory] = (acc[ride.vehicleCategory] ?? 0) + 1;
      return acc;
    }, {});
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    const modeCounts = rides.reduce<Record<string, number>>((acc, ride) => {
      acc[ride.mode] = (acc[ride.mode] ?? 0) + 1;
      return acc;
    }, {});
    const topMode = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    return { completed, cancelled, active, avgFare, topCategory, topMode };
  }, [customer, rides]);

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
        <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <EmptyState
        title="Customer not found"
        description="This rider account is not in the demo dataset."
        actionLabel="Back to customers"
        onAction={() => router.push("/customers")}
      />
    );
  }

  const zone = getZoneById(customer.zoneId);
  const zoneName = getZoneLabel(customer.zoneId);
  const statusTone =
    customer.status === "active"
      ? "success"
      : customer.status === "suspended"
        ? "warning"
        : "danger";

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
        <Link href="/customers" className="font-medium text-flyt-purple hover:underline">
          Customers
        </Link>
        <span>/</span>
        <span className="font-semibold text-ink">{customer.name}</span>
      </nav>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Link href="/customers">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <Badge tone={statusTone}>{customer.status}</Badge>
            <Badge tone="info">{zoneName}</Badge>
            <Badge tone="neutral">{customer.city}</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">{customer.name}</h1>
          <p className="mt-1 text-sm text-muted">
            Rider profile · {customer.id} · joined {formatDate(customer.joinedAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => copy(customer.phone, "Phone")}
          >
            <Phone className="h-3.5 w-3.5" />
            Call
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => copy(customer.email, "Email")}
          >
            <Mail className="h-3.5 w-3.5" />
            Email
          </Button>
          <Link href={`/live-operations?zone=${customer.zoneId}`}>
            <Button size="sm" variant="secondary">
              <MapPinned className="h-3.5 w-3.5" />
              Zone live ops
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
        <CustomerProfileCard customer={customer} zoneName={zoneName} />

        <Card className="overflow-hidden">
          <div className="border-b border-border bg-gradient-to-r from-flyt-purple-soft/50 via-surface to-surface px-5 py-4">
            <h2 className="text-sm font-semibold text-ink">Account overview</h2>
            <p className="mt-0.5 text-xs text-muted">
              Contact, home zone, and lifetime activity for this rider
            </p>
          </div>
          <CardBody className="space-y-5">
            <DetailGrid>
              <DetailField label="Customer ID" value={customer.id} mono />
              <DetailField label="Status" value={customer.status} />
              <DetailField label="Phone" value={formatPhone(customer.phone)} />
              <DetailField label="Email" value={customer.email} />
              <DetailField label="City" value={customer.city} />
              <DetailField
                label="Home zone"
                value={
                  <Link
                    href={`/service-areas/hyderabad/zones/${customer.zoneId}`}
                    className="text-flyt-purple hover:underline"
                  >
                    {zoneName}
                    {zone?.shortLabel ? ` (${zone.shortLabel})` : ""}
                  </Link>
                }
              />
              <DetailField label="Joined" value={formatDate(customer.joinedAt)} />
              <DetailField
                label="Last ride"
                value={
                  customer.lastRideAt
                    ? `${formatRelative(customer.lastRideAt)} · ${formatDate(customer.lastRideAt)}`
                    : "No rides yet"
                }
              />
            </DetailGrid>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copy(customer.id, "Customer ID")}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy ID
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copy(customer.email, "Email")}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy email
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Lifetime rides"
          value={String(customer.totalRides)}
          hint={stats ? `${stats.completed} completed in demo` : undefined}
          icon={Route}
          tone="brand"
        />
        <Kpi
          label="Lifetime spend"
          value={formatInr(customer.totalSpendInr)}
          hint={stats ? `Avg ${formatInr(stats.avgFare)} / ride` : undefined}
          icon={Wallet}
          tone="info"
        />
        <Kpi
          label="Open support"
          value={String(tickets.filter((t) => t.status !== "resolved").length)}
          hint={`${tickets.length} total tickets`}
          icon={LifeBuoy}
          tone="warning"
        />
        <Kpi
          label="SOS linked"
          value={String(incidents.length)}
          hint={
            incidents.some((i) => i.severity === "critical")
              ? "Includes critical"
              : incidents.length === 0
                ? "No safety events"
                : "Safety history"
          }
          icon={ShieldAlert}
          tone="danger"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Riding preferences" description="Derived from demo ride history" />
          <CardBody className="space-y-3 text-sm">
            <PrefRow
              label="Top category"
              value={
                stats?.topCategory
                  ? rideCategoryLabel(stats.topCategory as Ride["vehicleCategory"])
                  : "—"
              }
            />
            <PrefRow
              label="Preferred mode"
              value={stats?.topMode ? rideModeLabel(stats.topMode as Ride["mode"]) : "—"}
            />
            <PrefRow label="Active now" value={String(stats?.active ?? 0)} />
            <PrefRow label="Cancelled (demo)" value={String(stats?.cancelled ?? 0)} />
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title={`Ride history (${rides.length})`}
            description="Recent trips linked to this customer"
            action={
              <Link
                href={`/rides?q=${encodeURIComponent(customer.name)}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-flyt-purple hover:underline"
              >
                All rides
                <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <CardBody className="space-y-2">
            {rides.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">
                No rides in the demo dataset for this customer.
              </p>
            ) : (
              rides.map((ride) => {
                const rideZone = ride.zoneId ? getZoneById(ride.zoneId) : undefined;
                return (
                  <Link
                    key={ride.id}
                    href={`/rides/${ride.id}`}
                    className="group flex flex-col gap-2 rounded-xl border border-border bg-surface px-3.5 py-3 transition hover:-translate-y-0.5 hover:border-flyt-purple/30 hover:shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mono text-xs font-semibold text-flyt-purple">
                          {ride.id}
                        </p>
                        {rideZone ? (
                          <span className="rounded-full bg-flyt-purple-soft/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-flyt-purple">
                            {rideZone.shortLabel}
                          </span>
                        ) : null}
                        <span className="text-[11px] text-muted">
                          {rideCategoryLabel(ride.vehicleCategory)} · {rideModeLabel(ride.mode)}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-ink">
                        {ride.pickup} → {ride.destination}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {formatRelative(ride.requestedAt)}
                        {ride.pilotName ? ` · ${ride.pilotName}` : " · Searching Pilot"}
                        {" · "}
                        {formatInr(ride.fareInr)}
                      </p>
                    </div>
                    <Badge tone={rideTone(ride.status)}>{rideStatusLabel[ride.status]}</Badge>
                  </Link>
                );
              })
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title={`Support tickets (${tickets.length})`}
            description="Care desk history for this rider"
            action={
              <Link
                href="/support"
                className="inline-flex items-center gap-1 text-xs font-semibold text-flyt-purple hover:underline"
              >
                Support desk
                <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <CardBody className="space-y-2">
            {tickets.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">No support tickets in demo data.</p>
            ) : (
              tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/support/${ticket.id}`}
                  className="flex items-start justify-between gap-3 rounded-xl border border-border px-3.5 py-3 transition hover:border-flyt-purple/25 hover:bg-flyt-purple-soft/30"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{ticket.subject}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      #{ticket.id} · {formatRelative(ticket.updatedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge tone={ticketStatusTone(ticket.status)}>
                      {ticketStatusLabel[ticket.status]}
                    </Badge>
                    <Badge tone={ticketPriorityTone(ticket.priority)}>
                      {ticketPriorityLabel[ticket.priority]}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </CardBody>
        </Card>

        <Card className={incidents.length > 0 ? "border-red-200" : undefined}>
          <CardHeader
            title={`Safety & SOS (${incidents.length})`}
            description="Incidents linked to this rider’s trips"
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
            {incidents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-ground/40 px-3 py-8 text-center">
                <ShieldAlert className="mx-auto h-5 w-5 text-muted" />
                <p className="mt-2 text-sm font-medium text-ink">No SOS history</p>
                <p className="mt-1 text-xs text-muted">No linked safety incidents in demo data.</p>
              </div>
            ) : (
              incidents.map((incident) => (
                <Link
                  key={incident.id}
                  href={`/safety/${incident.id}`}
                  className="block rounded-xl border border-red-200 bg-danger-soft/40 px-3.5 py-3"
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
                  <p className="mt-1 text-xs text-muted">
                    {getZoneLabel(incident.zoneId)} · Ride {incident.rideId} ·{" "}
                    {formatRelative(incident.openedAt)}
                  </p>
                </Link>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof Route;
  tone: "brand" | "info" | "warning" | "danger";
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
            tone === "warning" && "bg-warning-soft text-warning",
            tone === "danger" && "bg-danger-soft text-danger",
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-ink">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

function PrefRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-ground/60 px-3 py-2.5">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-sm font-semibold text-ink">{value}</span>
    </div>
  );
}
