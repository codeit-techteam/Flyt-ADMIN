"use client";

import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  RIDE_CATEGORY_ORDER,
  rideCategoryShortLabel,
} from "@/config/ride-categories";
import { RIDE_MODES, rideModeLabel } from "@/config/ride-modes";
import { ALL_ZONES_ID, OPERATIONAL_ZONES, getZoneLabel } from "@/config/zones";
import { formatDateTime, formatInr } from "@/lib/format";
import {
  paymentStatusLabel,
  paymentTone,
  rideStatusLabel,
  rideTone,
} from "@/lib/status";
import { listRides } from "@/services/data";
import type { Ride } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function RidesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "all");
  const [category, setCategory] = useState(searchParams.get("category") ?? "all");
  const [mode, setMode] = useState(searchParams.get("mode") ?? "all");
  const [zoneId, setZoneId] = useState(searchParams.get("zoneId") ?? ALL_ZONES_ID);
  const [assignment, setAssignment] = useState(searchParams.get("assignment") ?? "all");
  const [payment, setPayment] = useState(searchParams.get("payment") ?? "all");
  const [rows, setRows] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listRides({ q, status, category, mode, zoneId, assignment, payment }).then((data) => {
      setRows(data);
      setLoading(false);
    });
  }, [q, status, category, mode, zoneId, assignment, payment]);

  const resetFilters = () => {
    setQ("");
    setStatus("all");
    setCategory("all");
    setMode("all");
    setZoneId(ALL_ZONES_ID);
    setAssignment("all");
    setPayment("all");
  };

  const columns: Column<Ride>[] = [
    {
      key: "id",
      header: "Ride ID",
      render: (r) => <span className="font-mono text-xs font-semibold">{r.id}</span>,
    },
    { key: "customer", header: "Customer", render: (r) => r.customerName },
    {
      key: "pilot",
      header: "Pilot",
      render: (r) =>
        r.pilotName ?? <span className="text-sm font-medium text-warning">Unassigned</span>,
    },
    {
      key: "route",
      header: "Route",
      render: (r) => (
        <div className="max-w-xs">
          <p className="truncate text-sm">{r.pickup}</p>
          <p className="truncate text-xs text-muted">→ {r.destination}</p>
        </div>
      ),
    },
    {
      key: "zone",
      header: "Zone",
      render: (r) => (
        <span className="text-sm text-ink">
          {r.zoneId ? getZoneLabel(r.zoneId) : "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <Badge tone={rideTone(r.status)}>{rideStatusLabel[r.status]}</Badge>,
    },
    {
      key: "category",
      header: "Category",
      render: (r) => <span>{rideCategoryShortLabel(r.vehicleCategory)}</span>,
    },
    {
      key: "mode",
      header: "Mode",
      render: (r) => <span>{rideModeLabel(r.mode)}</span>,
    },
    {
      key: "fare",
      header: "Fare",
      render: (r) => <span className="tabular-nums">{formatInr(r.fareInr)}</span>,
    },
    {
      key: "payment",
      header: "Payment",
      render: (r) => (
        <Badge tone={paymentTone(r.paymentStatus)}>{paymentStatusLabel[r.paymentStatus]}</Badge>
      ),
    },
    {
      key: "time",
      header: "Requested",
      render: (r) => <span className="text-xs text-muted">{formatDateTime(r.requestedAt)}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Rides"
        description="Search and filter active and historical trips by status, assignment, zone, category, and mode."
      />
      <Card className="mb-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Search"
            placeholder="Ride ID, customer, Pilot…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            {Object.entries(rideStatusLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select
            label="Assignment"
            value={assignment}
            onChange={(e) => setAssignment(e.target.value)}
          >
            <option value="all">All pilots</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned</option>
          </Select>
          <Select label="Zone" value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
            <option value={ALL_ZONES_ID}>All Hyderabad zones</option>
            {OPERATIONAL_ZONES.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </Select>
          <Select
            label="Vehicle category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All categories</option>
            {RIDE_CATEGORY_ORDER.map((id) => (
              <option key={id} value={id}>
                {rideCategoryShortLabel(id)}
              </option>
            ))}
          </Select>
          <Select label="Mode" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="all">All modes</option>
            {RIDE_MODES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </Select>
          <Select label="Payment" value={payment} onChange={(e) => setPayment(e.target.value)}>
            <option value="all">All payments</option>
            {Object.entries(paymentStatusLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <div className="flex items-end">
            <Button variant="outline" className="w-full" onClick={resetFilters}>
              Reset filters
            </Button>
          </div>
        </div>
      </Card>
      <Card>
        {loading ? (
          <p className="p-6 text-sm text-muted">Loading rides…</p>
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            onRowClick={(r) => router.push(`/rides/${r.id}`)}
            emptyTitle="No rides match your filters"
          />
        )}
      </Card>
    </div>
  );
}

export default function RidesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
      <RidesContent />
    </Suspense>
  );
}
