"use client";

import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/tables/data-table";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { listAuditLogs } from "@/services/data";
import type { AuditLog } from "@/types";
import { useEffect, useState } from "react";

export default function AuditLogsPage() {
  const [rows, setRows] = useState<AuditLog[]>([]);

  useEffect(() => {
    listAuditLogs().then(setRows);
  }, []);

  const columns: Column<AuditLog>[] = [
    { key: "id", header: "ID", render: (l) => <span className="font-mono text-xs">{l.id}</span> },
    { key: "actor", header: "Actor", render: (l) => l.actorName },
    { key: "action", header: "Action", render: (l) => l.action },
    {
      key: "entity",
      header: "Entity",
      render: (l) => (
        <span>
          {l.entity} <span className="font-mono text-xs text-muted">{l.entityId}</span>
        </span>
      ),
    },
    {
      key: "at",
      header: "When",
      render: (l) => formatDateTime(l.createdAt),
    },
  ];

  return (
    <div>
      <PageHeader title="Audit Logs" description="Immutable activity trail for sensitive admin actions (demo)." />
      <Card>
        <DataTable columns={columns} rows={rows} />
      </Card>
    </div>
  );
}
