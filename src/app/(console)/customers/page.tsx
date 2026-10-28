"use client";

import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDate, formatInr, formatPhone } from "@/lib/format";
import { listCustomers } from "@/services/data";
import type { Customer } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CustomersPage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Customer[]>([]);

  useEffect(() => {
    listCustomers(q).then(setRows);
  }, [q]);

  const columns: Column<Customer>[] = [
    { key: "id", header: "ID", render: (c) => <span className="font-mono text-xs">{c.id}</span> },
    { key: "name", header: "Name", render: (c) => c.name },
    { key: "phone", header: "Phone", render: (c) => formatPhone(c.phone) },
    { key: "city", header: "City", render: (c) => c.city },
    {
      key: "status",
      header: "Status",
      render: (c) => (
        <Badge tone={c.status === "active" ? "success" : c.status === "suspended" ? "warning" : "neutral"}>
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
  ];

  return (
    <div>
      <PageHeader title="Customers" description="Search rider accounts and open profiles." />
      <Card className="mb-4 p-4">
        <Input
          label="Search"
          placeholder="Name, email, phone, ID…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </Card>
      <Card>
        <DataTable
          columns={columns}
          rows={rows}
          onRowClick={(c) => router.push(`/customers/${c.id}`)}
        />
      </Card>
    </div>
  );
}
