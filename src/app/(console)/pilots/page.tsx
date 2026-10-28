"use client";

import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatPhone } from "@/lib/format";
import { verificationLabel, verificationTone } from "@/lib/status";
import { listPilots } from "@/services/data";
import type { Pilot } from "@/types";
import { ChevronRight, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function PilotsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState("");
  const [verification, setVerification] = useState(searchParams.get("verification") ?? "all");
  const [rows, setRows] = useState<Pilot[]>([]);

  useEffect(() => {
    listPilots({ q, verification }).then(setRows);
  }, [q, verification]);

  const columns: Column<Pilot>[] = [
    {
      key: "id",
      header: "ID",
      render: (p) => (
        <span className="font-mono text-xs font-semibold text-flyt-purple">{p.id}</span>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (p) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-flyt-purple-soft text-[11px] font-bold text-flyt-purple">
            {p.name
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase() ?? "")
              .join("")}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{p.name}</p>
            <p className="truncate text-xs text-muted">{p.email}</p>
          </div>
        </div>
      ),
    },
    { key: "phone", header: "Phone", render: (p) => formatPhone(p.phone) },
    { key: "city", header: "City", render: (p) => p.city },
    {
      key: "status",
      header: "Availability",
      render: (p) => (
        <Badge
          tone={
            p.status === "online"
              ? "success"
              : p.status === "busy"
                ? "info"
                : p.status === "suspended"
                  ? "danger"
                  : "neutral"
          }
        >
          {p.status}
        </Badge>
      ),
    },
    {
      key: "verification",
      header: "Verification",
      render: (p) => (
        <Badge tone={verificationTone(p.verification)}>{verificationLabel[p.verification]}</Badge>
      ),
    },
    {
      key: "docs",
      header: "Missing docs",
      className: "max-w-[11rem]",
      render: (p) => {
        if (!p.documentsMissing.length) {
          return <span className="text-xs text-success">Complete</span>;
        }
        const full = p.documentsMissing.join(", ");
        const preview =
          p.documentsMissing.length <= 2
            ? full
            : `${p.documentsMissing.slice(0, 2).join(", ")} +${p.documentsMissing.length - 2}`;
        return (
          <span className="block truncate text-xs text-warning" title={full}>
            {preview}
          </span>
        );
      },
    },
    {
      key: "rating",
      header: "Rating",
      render: (p) => (p.rating ? p.rating.toFixed(2) : "—"),
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
        title="Pilots"
        description="Onboarding, verification, and availability. Open a row to review the partner profile."
      />
      <Card className="mb-4 p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, ID, phone…"
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
        </div>
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted">
          <Users className="h-3.5 w-3.5" />
          {rows.length} Pilot{rows.length === 1 ? "" : "s"} · approved partners show no Approve action
        </p>
      </Card>
      <Card>
        <DataTable
          columns={columns}
          rows={rows}
          onRowClick={(p) => router.push(`/pilots/${p.id}`)}
          emptyTitle="No Pilots found"
          emptyDescription="Try a different search or verification filter."
        />
      </Card>
    </div>
  );
}

export default function PilotsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
      <PilotsContent />
    </Suspense>
  );
}
