"use client";

import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ALL_ZONES_ID, OPERATIONAL_ZONES, getZoneLabel } from "@/config/zones";
import { formatDate, formatInr, formatPhone } from "@/lib/format";
import { listCustomers } from "@/services/data";
import type { Customer } from "@/types";
import { ChevronRight, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function CustomersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState("");
  const [zoneId, setZoneId] = useState<string>(
    searchParams.get("zoneId") ?? ALL_ZONES_ID,
  );
  const [rows, setRows] = useState<Customer[]>([]);

  useEffect(() => {
    listCustomers({ q, zoneId }).then(setRows);
  }, [q, zoneId]);

  const columns: Column<Customer>[] = [
    {
      key: "id",
      header: "ID",
      render: (c) => (
        <span className="font-mono text-xs font-semibold text-flyt-purple">{c.id}</span>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (c) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-flyt-purple-soft text-[11px] font-bold text-flyt-purple">
            {c.name
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase() ?? "")
              .join("")}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{c.name}</p>
            <p className="truncate text-xs text-muted">{c.email}</p>
          </div>
        </div>
      ),
    },
    { key: "phone", header: "Phone", render: (c) => formatPhone(c.phone) },
    { key: "city", header: "City", render: (c) => c.city },
    {
      key: "zone",
      header: "Zone",
      render: (c) => (
        <span className="text-sm font-medium text-ink">{getZoneLabel(c.zoneId)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (c) => (
        <Badge
          tone={
            c.status === "active" ? "success" : c.status === "suspended" ? "warning" : "neutral"
          }
        >
          {c.status}
        </Badge>
      ),
    },
    {
      key: "rides",
      header: "Rides",
      render: (c) => <span className="tabular-nums">{c.totalRides}</span>,
    },
    {
      key: "spend",
      header: "Spend",
      render: (c) => <span className="tabular-nums">{formatInr(c.totalSpendInr)}</span>,
    },
    {
      key: "joined",
      header: "Joined",
      render: (c) => formatDate(c.joinedAt),
    },
    {
      key: "open",
      header: "",
      className: "w-10",
      render: () => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-flyt-purple opacity-70">
          View
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Search rider accounts by zone, then click a row to open the full profile."
      />
      <Card className="mb-4">
        <CardBody>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Search"
              placeholder="Name, email, phone, ID…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Select label="Zone" value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
              <option value={ALL_ZONES_ID}>All Hyderabad zones</option>
              {OPERATIONAL_ZONES.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </Select>
          </div>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted">
            <Users className="h-3.5 w-3.5" />
            {rows.length} rider{rows.length === 1 ? "" : "s"} · click any row for full details
          </p>
        </CardBody>
      </Card>
      <Card>
        <DataTable
          columns={columns}
          rows={rows}
          onRowClick={(c) => router.push(`/customers/${c.id}`)}
          emptyTitle="No customers found"
          emptyDescription="Try a different search or zone filter."
        />
      </Card>
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading customers…</p>}>
      <CustomersContent />
    </Suspense>
  );
}
