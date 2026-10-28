"use client";

import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { formatRelative } from "@/lib/format";
import {
  incidentStatusLabel,
  severityLabel,
  severityTone,
  ticketPriorityLabel,
  ticketPriorityTone,
  ticketStatusLabel,
  ticketStatusTone,
} from "@/lib/status";
import { listIncidents, listTickets } from "@/services/data";
import type { SosIncident, SupportTicket } from "@/types";
import { ArrowRight, LifeBuoy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SafetyPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<SosIncident[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  useEffect(() => {
    Promise.all([listIncidents(), listTickets()]).then(([i, t]) => {
      setIncidents(i);
      setTickets(t.filter((ticket) => ticket.status !== "resolved").slice(0, 4));
    });
  }, []);

  const columns: Column<SosIncident>[] = [
    {
      key: "id",
      header: "Incident",
      render: (i) => <span className="font-mono text-xs font-semibold text-danger">{i.id}</span>,
    },
    { key: "ride", header: "Ride", render: (i) => i.rideId },
    {
      key: "reporter",
      header: "Reporter",
      render: (i) => `${i.reporterName} (${i.reporter})`,
    },
    { key: "pilot", header: "Pilot", render: (i) => i.pilotName },
    {
      key: "severity",
      header: "Severity",
      render: (i) => <Badge tone={severityTone(i.severity)}>{severityLabel[i.severity]}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      render: (i) => (
        <Badge tone={i.status === "open" ? "danger" : "warning"}>
          {incidentStatusLabel[i.status]}
        </Badge>
      ),
    },
    {
      key: "opened",
      header: "Opened",
      render: (i) => formatRelative(i.openedAt),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Safety & SOS"
        description="Critical SOS queue for Hyderabad. Support tickets live in the dedicated care desk."
        actions={
          <Link href="/support">
            <Button variant="secondary" size="sm">
              <LifeBuoy className="h-4 w-4" />
              Open support tickets
            </Button>
          </Link>
        }
      />

      <Card className="overflow-hidden border-red-200">
        <CardHeader
          title="SOS incident queue"
          description="Respond quickly — severity and status are visible for authorized operators."
        />
        <DataTable
          columns={columns}
          rows={incidents}
          onRowClick={(i) => router.push(`/safety/${i.id}`)}
        />
      </Card>

      <Card>
        <CardHeader
          title="Open support tickets"
          description="Snapshot of the care queue"
          action={
            <Link
              href="/support"
              className="inline-flex items-center gap-1 text-xs font-semibold text-flyt-purple hover:underline"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          }
        />
        <CardBody className="space-y-2">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/support/${ticket.id}`}
              className="flex flex-col gap-2 rounded-xl border border-border px-3 py-3 transition hover:border-flyt-purple/25 hover:bg-flyt-purple-soft/30 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-ink">{ticket.subject}</p>
                <p className="text-xs text-muted">
                  #{ticket.id} · {ticket.requesterName} ({ticket.requesterType}) ·{" "}
                  {formatRelative(ticket.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone={ticketPriorityTone(ticket.priority)}>
                  {ticketPriorityLabel[ticket.priority]}
                </Badge>
                <Badge tone={ticketStatusTone(ticket.status)}>
                  {ticketStatusLabel[ticket.status]}
                </Badge>
              </div>
            </Link>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
