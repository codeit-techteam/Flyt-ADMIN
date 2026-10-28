"use client";

import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RIDE_CATEGORY_ORDER, rideCategoryLabel } from "@/config/ride-categories";
import { cn } from "@/lib/cn";
import { verificationLabel, verificationTone } from "@/lib/status";
import { listVehicles } from "@/services/data";
import type { Vehicle } from "@/types";
import { Car, CheckCircle2, ChevronRight, ClipboardList, UserRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

function ColorDot({ color }: { color: string }) {
  const map: Record<string, string> = {
    White: "#F5F5F5",
    Silver: "#C0C0C0",
    Grey: "#9CA3AF",
    Gray: "#9CA3AF",
    Black: "#1F2937",
    Blue: "#3B82F6",
    Red: "#EF4444",
  };
  const fill = map[color] ?? "#D1D5DB";
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full border border-border-strong/30"
      style={{ backgroundColor: fill }}
      title={color}
      aria-hidden
    />
  );
}

function VehiclesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState("");
  const [verification, setVerification] = useState(
    searchParams.get("verification") ?? "all",
  );
  const [category, setCategory] = useState("all");
  const [assignment, setAssignment] = useState("all");
  const [rows, setRows] = useState<Vehicle[]>([]);

  useEffect(() => {
    listVehicles({ q, verification, category, assignment }).then(setRows);
  }, [q, verification, category, assignment]);

  const summary = useMemo(() => {
    const approved = rows.filter((v) => v.verification === "approved").length;
    const review = rows.filter((v) =>
      ["pending", "under_review", "needs_correction"].includes(v.verification),
    ).length;
    const unassigned = rows.filter((v) => !v.pilotId).length;
    return { total: rows.length, approved, review, unassigned };
  }, [rows]);

  const columns: Column<Vehicle>[] = [
    {
      key: "id",
      header: "ID",
      render: (v) => (
        <span className="font-mono text-xs font-semibold text-flyt-purple">{v.id}</span>
      ),
    },
    {
      key: "plate",
      header: "Plate",
      render: (v) => (
        <span className="rounded-md border border-border bg-ground px-2 py-1 font-mono text-xs font-bold tracking-wide text-ink">
          {v.plate}
        </span>
      ),
    },
    {
      key: "vehicle",
      header: "Vehicle",
      render: (v) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-flyt-purple-soft text-flyt-purple">
            <Car className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">
              {v.make} {v.model}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <ColorDot color={v.color} />
              {v.year} · {v.color}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (v) => (
        <Badge tone="brand">{rideCategoryLabel(v.category)}</Badge>
      ),
    },
    {
      key: "pilot",
      header: "Pilot",
      render: (v) =>
        v.pilotName ? (
          <span className="text-sm font-medium text-ink">{v.pilotName}</span>
        ) : (
          <span className="text-xs font-medium text-warning">Unassigned</span>
        ),
    },
    {
      key: "verification",
      header: "Verification",
      render: (v) => (
        <Badge tone={verificationTone(v.verification)}>
          {verificationLabel[v.verification]}
        </Badge>
      ),
    },
    { key: "city", header: "City", render: (v) => v.city },
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
    <div className="space-y-4">
      <PageHeader
        title="Vehicles"
        description="Fleet directory for Hyderabad — click a row for full vehicle details."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="In view" value={summary.total} icon={Car} tone="brand" />
        <SummaryCard label="Approved" value={summary.approved} icon={CheckCircle2} tone="success" />
        <SummaryCard
          label="Needs review"
          value={summary.review}
          icon={ClipboardList}
          tone="warning"
        />
        <SummaryCard
          label="Unassigned"
          value={summary.unassigned}
          icon={UserRound}
          tone="info"
        />
      </div>

      <Card>
        <CardBody className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Input
              label="Search"
              placeholder="Plate, model, pilot, ID…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Select
              label="Verification"
              value={verification}
              onChange={(e) => setVerification(e.target.value)}
            >
              <option value="all">All</option>
              {Object.entries(verificationLabel).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All categories</option>
              {RIDE_CATEGORY_ORDER.map((id) => (
                <option key={id} value={id}>
                  {rideCategoryLabel(id)}
                </option>
              ))}
            </Select>
            <Select
              label="Assignment"
              value={assignment}
              onChange={(e) => setAssignment(e.target.value)}
            >
              <option value="all">All vehicles</option>
              <option value="assigned">Linked to Pilot</option>
              <option value="unassigned">Unassigned</option>
            </Select>
          </div>
        </CardBody>
      </Card>

      <Card>
        <DataTable
          columns={columns}
          rows={rows}
          onRowClick={(v) => router.push(`/vehicles/${v.id}`)}
          emptyTitle="No vehicles found"
          emptyDescription="Try a different search or filter."
        />
      </Card>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof Car;
  tone: "brand" | "success" | "warning" | "info";
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-xl",
            tone === "brand" && "bg-flyt-purple-soft text-flyt-purple",
            tone === "success" && "bg-emerald-50 text-success",
            tone === "warning" && "bg-warning-soft text-warning",
            tone === "info" && "bg-info-soft text-info",
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-ink">{value}</p>
    </div>
  );
}

export default function VehiclesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading vehicles…</p>}>
      <VehiclesContent />
    </Suspense>
  );
}
