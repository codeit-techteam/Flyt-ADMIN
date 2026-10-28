"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/tables/data-table";
import { formatInr } from "@/lib/format";
import { formatMetric } from "@/lib/metrics";
import { downloadCsv, zoneReportToCsv } from "@/services/zone-analytics";
import type { DemandLevel, ZoneReportRow } from "@/types";
import { Download, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type SortKey = keyof ZoneReportRow;

export function ZoneReportTable({
  rows,
  periodLabel,
}: {
  rows: ZoneReportRow[];
  periodLabel: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [demand, setDemand] = useState<"all" | DemandLevel>("all");
  const [sortKey, setSortKey] = useState<SortKey>("totalRides");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const filtered = useMemo(() => {
    let next = [...rows];
    if (q.trim()) {
      const query = q.toLowerCase();
      next = next.filter((r) => r.zone.toLowerCase().includes(query));
    }
    if (demand !== "all") {
      next = next.filter((r) => r.demandLevel === demand);
    }
    next.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return next;
  }, [rows, q, demand, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice(page * pageSize, page * pageSize + pageSize);

  const columns: Column<ZoneReportRow>[] = [
    {
      key: "zone",
      header: "Zone",
      render: (r) => <span className="font-semibold text-ink">{r.zone}</span>,
    },
    {
      key: "registeredCustomers",
      header: "Customers",
      render: (r) => <span className="tabular-nums">{formatMetric(r.registeredCustomers)}</span>,
    },
    {
      key: "customersOnboardedInPeriod",
      header: "Onboarded",
      render: (r) => (
        <span className="tabular-nums">{formatMetric(r.customersOnboardedInPeriod)}</span>
      ),
    },
    {
      key: "registeredPilots",
      header: "Pilots",
      render: (r) => <span className="tabular-nums">{formatMetric(r.registeredPilots)}</span>,
    },
    {
      key: "pilotsOnboardedInPeriod",
      header: "Pilots new",
      render: (r) => (
        <span className="tabular-nums">{formatMetric(r.pilotsOnboardedInPeriod)}</span>
      ),
    },
    {
      key: "pilotsPendingVerification",
      header: "Pending",
      render: (r) => (
        <span className="tabular-nums">{formatMetric(r.pilotsPendingVerification)}</span>
      ),
    },
    {
      key: "onlinePilots",
      header: "Online",
      render: (r) => <span className="tabular-nums">{formatMetric(r.onlinePilots)}</span>,
    },
    {
      key: "totalRides",
      header: "Rides",
      render: (r) => <span className="tabular-nums">{formatMetric(r.totalRides)}</span>,
    },
    {
      key: "completedRides",
      header: "Completed",
      render: (r) => <span className="tabular-nums">{formatMetric(r.completedRides)}</span>,
    },
    {
      key: "cancelledRides",
      header: "Cancelled",
      render: (r) => <span className="tabular-nums">{formatMetric(r.cancelledRides)}</span>,
    },
    {
      key: "grossBookingValueInr",
      header: "GBV",
      render: (r) => (
        <span className="font-semibold tabular-nums">{formatInr(r.grossBookingValueInr)}</span>
      ),
    },
    {
      key: "demandLevel",
      header: "Demand",
      render: (r) => (
        <Badge
          tone={
            r.demandLevel === "high"
              ? "danger"
              : r.demandLevel === "moderate"
                ? "warning"
                : "success"
          }
        >
          {r.demandLevel}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/service-areas/hyderabad/zones/${r.id}`);
          }}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Details
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader
        title="Zone-wise ride report"
        description={`Aggregate KPIs · ${periodLabel} · DEMO DATA`}
        action={
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              downloadCsv(
                `flyt-zone-report-${periodLabel.replace(/\s+/g, "-").toLowerCase()}.csv`,
                zoneReportToCsv(filtered),
              )
            }
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        }
      />
      <CardBody className="space-y-4 border-b border-border !py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="min-w-0 flex-1">
            <Input
              label="Search zones"
              placeholder="Filter by zone name"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <div className="w-full sm:w-44">
            <Select
              label="Demand"
              value={demand}
              onChange={(e) => {
                setDemand(e.target.value as "all" | DemandLevel);
                setPage(0);
              }}
            >
              <option value="all">All levels</option>
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </Select>
          </div>
          <div className="w-full sm:w-48">
            <Select
              label="Sort by"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
            >
              <option value="totalRides">Total rides</option>
              <option value="grossBookingValueInr">Gross booking value</option>
              <option value="registeredCustomers">Customers</option>
              <option value="registeredPilots">Pilots</option>
              <option value="onlinePilots">Online Pilots</option>
              <option value="zone">Zone name</option>
            </Select>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          >
            {sortDir === "asc" ? "Asc" : "Desc"}
          </Button>
        </div>
      </CardBody>
      <DataTable
        columns={columns}
        rows={pageRows}
        onRowClick={(r) => router.push(`/service-areas/hyderabad/zones/${r.id}`)}
        emptyTitle="No zones match filters"
        emptyDescription="Try clearing search or demand filters."
      />
      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
        <p className="text-xs text-muted">
          {filtered.length} zone{filtered.length === 1 ? "" : "s"} · page {page + 1} of {pageCount}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}
