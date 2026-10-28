"use client";

import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { formatDateTime, formatInr } from "@/lib/format";
import { paymentStatusLabel, paymentTone } from "@/lib/status";
import { listTransactions } from "@/services/data";
import type { Transaction } from "@/types";
import { useEffect, useMemo, useState } from "react";

export default function PaymentsPage() {
  const [rows, setRows] = useState<Transaction[]>([]);

  useEffect(() => {
    listTransactions().then(setRows);
  }, []);

  const pendingPayouts = useMemo(
    () => rows.filter((t) => t.type === "pilot_payout" && t.status === "pending"),
    [rows],
  );

  const columns: Column<Transaction>[] = [
    { key: "id", header: "Txn", render: (t) => <span className="font-mono text-xs">{t.id}</span> },
    {
      key: "type",
      header: "Type",
      render: (t) => <span className="capitalize">{t.type.replaceAll("_", " ")}</span>,
    },
    { key: "party", header: "Party", render: (t) => t.partyName },
    {
      key: "ride",
      header: "Ride",
      render: (t) => t.rideId ?? "—",
    },
    {
      key: "amount",
      header: "Amount",
      render: (t) => <span className="tabular-nums font-medium">{formatInr(t.amountInr)}</span>,
    },
    {
      key: "method",
      header: "Method",
      render: (t) => t.method.toUpperCase(),
    },
    {
      key: "status",
      header: "Status",
      render: (t) => <Badge tone={paymentTone(t.status)}>{paymentStatusLabel[t.status]}</Badge>,
    },
    {
      key: "at",
      header: "Created",
      render: (t) => <span className="text-xs text-muted">{formatDateTime(t.createdAt)}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Payments & Payouts"
        description="Ride payments, refunds, and Pilot payout status (demo data)."
      />
      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-xs text-muted">Pending payouts</p>
            <p className="mt-1 text-xl font-bold tabular-nums">
              {formatInr(pendingPayouts.reduce((sum, t) => sum + t.amountInr, 0))}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-muted">Successful payments</p>
            <p className="mt-1 text-xl font-bold tabular-nums">
              {rows.filter((t) => t.status === "paid").length}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-muted">Failed / refunded</p>
            <p className="mt-1 text-xl font-bold tabular-nums">
              {rows.filter((t) => t.status === "failed" || t.status === "refunded").length}
            </p>
          </CardBody>
        </Card>
      </div>
      <Card>
        <CardHeader title="Transactions" />
        <DataTable columns={columns} rows={rows} />
      </Card>
    </div>
  );
}
