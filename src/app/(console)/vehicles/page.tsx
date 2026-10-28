"use client";

import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { verificationLabel, verificationTone } from "@/lib/status";
import { listVehicles } from "@/services/data";
import type { Vehicle } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VehiclesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Vehicle[]>([]);

  useEffect(() => {
    listVehicles().then(setRows);
  }, []);

  const columns: Column<Vehicle>[] = [
    { key: "id", header: "ID", render: (v) => <span className="font-mono text-xs">{v.id}</span> },
    {
      key: "plate",
      header: "Plate",
      render: (v) => <span className="font-mono text-sm font-semibold tracking-wide">{v.plate}</span>,
    },
    {
      key: "vehicle",
      header: "Vehicle",
      render: (v) => `${v.make} ${v.model} (${v.year})`,
    },
    {
      key: "category",
      header: "Category",
      render: (v) => <span className="capitalize">{v.category}</span>,
    },
    { key: "pilot", header: "Pilot", render: (v) => v.pilotName ?? "—" },
    {
      key: "verification",
      header: "Verification",
      render: (v) => (
        <Badge tone={verificationTone(v.verification)}>{verificationLabel[v.verification]}</Badge>
      ),
    },
    { key: "city", header: "City", render: (v) => v.city },
  ];

  return (
    <div>
      <PageHeader title="Vehicles" description="Vehicle directory and verification status." />
      <Card>
        <DataTable columns={columns} rows={rows} onRowClick={(v) => router.push(`/vehicles/${v.id}`)} />
      </Card>
    </div>
  );
}
