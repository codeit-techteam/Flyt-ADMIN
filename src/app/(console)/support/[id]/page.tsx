"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { formatDateTime, formatRelative } from "@/lib/format";
import {
  ticketCategoryLabel,
  ticketChannelLabel,
  ticketPriorityLabel,
  ticketPriorityTone,
  ticketStatusLabel,
  ticketStatusTone,
} from "@/lib/status";
import { getTicket } from "@/services/data";
import type { SupportTicket, TicketStatus } from "@/types";
import { ArrowLeft, Clock3, LifeBuoy, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SupportTicketDetailPage() {
  const params = useParams<{ id: string }>();
  const { push } = useToast();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);

  useEffect(() => {
    getTicket(params.id).then(setTicket);
  }, [params.id]);

  if (!ticket) {
    return <p className="text-sm text-muted">Loading ticket…</p>;
  }

  function setStatus(status: TicketStatus) {
    setTicket((prev) =>
      prev
        ? {
            ...prev,
            status,
            updatedAt: new Date().toISOString(),
            slaMinutesLeft: status === "resolved" ? null : prev.slaMinutesLeft,
          }
        : prev,
    );
    push(`Ticket marked ${ticketStatusLabel[status]} (demo).`, "success");
  }

  return (
    <div>
      <PageHeader
        title={`#${ticket.id}`}
        description={ticket.subject}
        actions={
          <Link href="/support">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back to queue
            </Button>
          </Link>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Badge tone={ticketPriorityTone(ticket.priority)}>
          {ticketPriorityLabel[ticket.priority]}
        </Badge>
        <Badge tone={ticketStatusTone(ticket.status)}>
          {ticketStatusLabel[ticket.status]}
        </Badge>
        <Badge tone="neutral">{ticketCategoryLabel[ticket.category]}</Badge>
        <Badge tone="info">{ticketChannelLabel[ticket.channel]}</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Ticket details" description={ticket.city} />
          <CardBody className="space-y-4 text-sm">
            <p className="leading-relaxed text-ink">{ticket.description}</p>
            <div className="grid gap-3 rounded-xl bg-ground/70 p-4 sm:grid-cols-2">
              <Meta label="Requester" value={`${ticket.requesterName} (${ticket.requesterType})`} />
              <Meta
                label="Requester ID"
                value={
                  ticket.requesterType === "customer" ? (
                    <Link
                      href={`/customers/${ticket.requesterId}`}
                      className="font-semibold text-flyt-purple hover:underline"
                    >
                      {ticket.requesterId}
                    </Link>
                  ) : (
                    <Link
                      href={`/pilots/${ticket.requesterId}`}
                      className="font-semibold text-flyt-purple hover:underline"
                    >
                      {ticket.requesterId}
                    </Link>
                  )
                }
              />
              <Meta label="Tier" value={ticket.requesterTier} />
              <Meta
                label="Linked ride"
                value={
                  ticket.rideId ? (
                    <Link
                      href={`/rides/${ticket.rideId}`}
                      className="font-semibold text-flyt-purple hover:underline"
                    >
                      {ticket.rideId}
                    </Link>
                  ) : (
                    "None"
                  )
                }
              />
              <Meta label="Opened" value={formatDateTime(ticket.createdAt)} />
              <Meta label="Updated" value={formatRelative(ticket.updatedAt)} />
              <Meta label="Agent" value={ticket.agentName ?? "Unassigned"} />
              <Meta
                label="SLA"
                value={
                  ticket.slaMinutesLeft === null
                    ? "Closed"
                    : `${ticket.slaMinutesLeft} minutes remaining`
                }
              />
            </div>
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Actions" description="Local demo updates only." />
            <CardBody className="flex flex-col gap-2">
              <Button onClick={() => setStatus("investigating")}>
                <MessageSquare className="h-4 w-4" />
                Start investigating
              </Button>
              <Button variant="outline" onClick={() => setStatus("awaiting_info")}>
                Request more info
              </Button>
              <Button variant="secondary" onClick={() => setStatus("escalated")}>
                Escalate
              </Button>
              <Button
                className="bg-success hover:bg-green-700"
                onClick={() => setStatus("resolved")}
              >
                Mark resolved
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Queue context" />
            <CardBody className="space-y-3 text-sm">
              <div className="flex items-center gap-2 rounded-xl bg-flyt-purple-soft/60 px-3 py-2.5 text-flyt-purple">
                <LifeBuoy className="h-4 w-4" />
                <span className="font-semibold">Hyderabad support desk</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <Clock3 className="h-4 w-4" />
                <span>Created {formatRelative(ticket.createdAt)}</span>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card className="lg:col-span-3">
          <CardHeader title="Activity timeline" />
          <CardBody>
            <ol className="relative space-y-0 border-l border-border pl-4">
              {[
                { label: "Ticket created", at: ticket.createdAt, detail: ticket.channel },
                {
                  label: ticket.agentName ? `Assigned to ${ticket.agentName}` : "Waiting for assignment",
                  at: ticket.createdAt,
                },
                {
                  label: `Current status — ${ticketStatusLabel[ticket.status]}`,
                  at: ticket.updatedAt,
                },
              ].map((event, i) => (
                <li key={i} className="relative pb-4 last:pb-0">
                  <span className="absolute -left-[1.28rem] top-1.5 h-2.5 w-2.5 rounded-full bg-flyt-purple ring-4 ring-surface" />
                  <p className="text-sm font-medium text-ink">{event.label}</p>
                  <p className="text-xs text-muted">
                    {formatDateTime(event.at)}
                    {event.detail ? ` · ${ticketChannelLabel[ticket.channel]}` : ""}
                  </p>
                </li>
              ))}
            </ol>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</p>
      <div className="mt-1 font-medium text-ink">{value}</div>
    </div>
  );
}
