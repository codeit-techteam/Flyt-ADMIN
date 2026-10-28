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
    { key: "id", header: "ID", render: (p) => <span className="font-mono text-xs">{p.id}</span> },
    { key: "name", header: "Name", render: (p) => p.name },
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
      render: (p) =>
        p.documentsMissing.length ? (
          <span className="text-xs text-warning">{p.documentsMissing.join(", ")}</span>
        ) : (
          <span className="text-xs text-success">Complete</span>
        ),
    },
    {
      key: "rating",
      header: "Rating",
      render: (p) => (p.rating ? p.rating.toFixed(2) : "—"),
    },
  ];

  return (
    <div>
      <PageHeader title="Pilots" description="Onboarding, verification, and availability." />
      <Card className="mb-4 grid gap-3 p-4 md:grid-cols-2">
        <Input label="Search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, ID, phone…" />
        <Select label="Verification" value={verification} onChange={(e) => setVerification(e.target.value)}>
          <option value="all">All</option>
          {Object.entries(verificationLabel).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Card>
      <Card>
        <DataTable columns={columns} rows={rows} onRowClick={(p) => router.push(`/pilots/${p.id}`)} />
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
