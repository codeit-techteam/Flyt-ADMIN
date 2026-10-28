"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import {
  ticketCategoryLabel,
  ticketChannelLabel,
  ticketPriorityLabel,
  ticketPriorityTone,
  ticketStatusLabel,
  ticketStatusTone,
} from "@/lib/status";
import { getTicketStats, listTickets } from "@/services/data";
import type { SupportTicket, TicketCategory } from "@/types";
import {
  Bot,
  CalendarDays,
  Clock3,
  Download,
  ExternalLink,
  Globe2,
  Headphones,
  Mail,
  Phone,
  Plus,
  Search,
  Smartphone,
  Star,
  Ticket,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type CategoryTab = "all" | TicketCategory;

const CHANNEL_ICON = {
  in_app: Smartphone,
  phone: Phone,
  chatbot: Bot,
  web: Globe2,
  email: Mail,
} as const;

function slaLabel(minutes: number | null) {
  if (minutes === null) return { text: "Closed", tone: "text-muted" };
  if (minutes <= 20) return { text: `${minutes}m left`, tone: "text-danger font-bold" };
  if (minutes <= 60) return { text: `${minutes}m left`, tone: "text-warning font-semibold" };
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return { text: m ? `${h}h ${m}m left` : `${h}h left`, tone: "text-ink font-medium" };
}

export default function SupportTicketsPage() {
  const router = useRouter();
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getTicketStats>> | null>(null);
  const [category, setCategory] = useState<CategoryTab>("all");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [agent, setAgent] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      listTickets({
        q: q.trim() || undefined,
        status,
        priority,
        category: category === "all" ? "all" : category,
        agent,
      }),
      getTicketStats(),
    ]).then(([rows, s]) => {
      setTickets(rows);
      setStats(s);
      setLoading(false);
      setPage(1);
    });
  }, [q, status, priority, category, agent]);

  const agents = useMemo(() => {
    const names = new Set(
      tickets.map((t) => t.agentName).filter((n): n is string => Boolean(n)),
    );
    return Array.from(names).sort();
  }, [tickets]);

  const pageCount = Math.max(1, Math.ceil(tickets.length / pageSize));
  const pageRows = tickets.slice((page - 1) * pageSize, page * pageSize);

  const tabs: { id: CategoryTab; label: string; count: number }[] = [
    { id: "all", label: "All Tickets", count: stats?.byCategory.all ?? 0 },
    {
      id: "rider_experience",
      label: "Rider Experience",
      count: stats?.byCategory.rider_experience ?? 0,
    },
    { id: "pilot_ops", label: "Pilot Ops", count: stats?.byCategory.pilot_ops ?? 0 },
    { id: "payments", label: "Payments", count: stats?.byCategory.payments ?? 0 },
    { id: "safety", label: "Safety", count: stats?.byCategory.safety ?? 0 },
    { id: "app_bug", label: "App Bug", count: stats?.byCategory.app_bug ?? 0 },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Support Tickets"
        description="Customer care and Pilot ops queue for Hyderabad. Demo ledger — not live tickets."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => push("CSV export is demo-only — no file downloaded.", "info")}
            >
              <Download className="h-4 w-4" />
              Export ledger
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => push("Agent shift roster opens when workforce API is connected.", "info")}
            >
              <Users className="h-4 w-4" />
              Agent roster
            </Button>
            <Button
              size="sm"
              onClick={() => push("Internal ticket composer is demo-only for now.", "info")}
            >
              <Plus className="h-4 w-4" />
              Create ticket
            </Button>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid gap-3 md:grid-cols-3">
        <Kpi
          label="Open support queue"
          value={stats ? String(stats.openCount) : "—"}
          hint="Active tickets"
          icon={Ticket}
          tone="brand"
        />
        <Kpi
          label="Avg resolution time"
          value={stats ? "1h 14m" : "—"}
          hint="Last 7 days"
          icon={Clock3}
          tone="info"
        />
        <Kpi
          label="Customer CSAT"
          value={stats ? `${stats.csat.toFixed(2)} / 5.0` : "—"}
          hint="Post-resolution surveys"
          icon={Star}
          tone="warning"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCategory(tab.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition",
              category === tab.id
                ? "border-flyt-purple bg-flyt-purple text-white shadow-sm"
                : "border-border bg-surface text-ink hover:border-flyt-purple/30 hover:bg-flyt-purple-soft",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                category === tab.id ? "bg-white/20 text-white" : "bg-ground text-muted",
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="space-y-3 p-3 sm:p-4">
          <div className="grid gap-2 lg:grid-cols-[1.4fr_repeat(3,minmax(0,0.7fr))_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search ID, subject, rider, Pilot, ride…"
                className="h-10 w-full rounded-xl border border-border bg-ground pl-9 pr-3 text-sm outline-none transition focus:border-flyt-purple focus:bg-surface focus:ring-2 focus:ring-flyt-purple/15"
              />
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-flyt-purple"
            >
              <option value="all">Status: All active</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="pending">Pending</option>
              <option value="awaiting_info">Awaiting info</option>
              <option value="escalated">Escalated</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="h-10 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-flyt-purple"
            >
              <option value="all">Priority: All levels</option>
              <option value="p1">P1 Urgent</option>
              <option value="p2">P2 High</option>
              <option value="p3">P3 Med</option>
              <option value="p4">P4 Low</option>
            </select>
            <select
              value={agent}
              onChange={(e) => setAgent(e.target.value)}
              className="h-10 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-flyt-purple"
            >
              <option value="all">Assigned: Any agent</option>
              <option value="unassigned">Unassigned</option>
              {agents.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <div className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-ground px-3 text-xs font-semibold text-muted">
              <CalendarDays className="h-3.5 w-3.5" />
              Today
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-ground/80">
              <tr className="border-b border-border">
                {[
                  "Ticket & priority",
                  "Subject & category",
                  "Linked user",
                  "Ride",
                  "Channel",
                  "SLA",
                  "Agent",
                  "Status",
                  "",
                ].map((h) => (
                  <th
                    key={h || "actions"}
                    className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td colSpan={9} className="px-4 py-3">
                      <Skeleton className="h-12 w-full rounded-xl" />
                    </td>
                  </tr>
                ))
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <Headphones className="mx-auto h-8 w-8 text-muted/40" />
                    <p className="mt-2 text-sm font-semibold text-ink">No tickets match these filters</p>
                    <p className="mt-1 text-xs text-muted">Try clearing search or switching category.</p>
                  </td>
                </tr>
              ) : (
                pageRows.map((ticket) => {
                  const ChannelIcon = CHANNEL_ICON[ticket.channel];
                  const sla = slaLabel(ticket.slaMinutesLeft);
                  return (
                    <tr
                      key={ticket.id}
                      className="cursor-pointer border-b border-border last:border-0 transition hover:bg-flyt-purple-soft/30"
                      onClick={() => router.push(`/support/${ticket.id}`)}
                    >
                      <td className="whitespace-nowrap px-4 py-3.5 align-top">
                        <p className="font-mono text-xs font-bold text-flyt-purple">#{ticket.id}</p>
                        <div className="mt-1.5">
                          <Badge tone={ticketPriorityTone(ticket.priority)}>
                            {ticketPriorityLabel[ticket.priority]}
                          </Badge>
                        </div>
                      </td>
                      <td className="min-w-[220px] px-4 py-3.5 align-top">
                        <p className="font-semibold text-ink">{ticket.subject}</p>
                        <p className="mt-0.5 text-xs text-muted">
                          {ticketCategoryLabel[ticket.category]} · {ticket.city}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 align-top">
                        <p className="font-medium text-ink">{ticket.requesterName}</p>
                        <p className="text-xs text-muted">
                          {ticket.requesterId} · {ticket.requesterTier}
                        </p>
                        <p className="text-[11px] capitalize text-muted">{ticket.requesterType}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 align-top">
                        {ticket.rideId ? (
                          <Link
                            href={`/rides/${ticket.rideId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex rounded-full bg-flyt-purple-soft px-2.5 py-1 font-mono text-[11px] font-bold text-flyt-purple hover:bg-flyt-purple hover:text-white"
                          >
                            {ticket.rideId}
                          </Link>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 align-top">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink">
                          <ChannelIcon className="h-3.5 w-3.5 text-flyt-purple" />
                          {ticketChannelLabel[ticket.channel]}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 align-top">
                        <span className={cn("text-xs tabular-nums", sla.tone)}>{sla.text}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 align-top">
                        <span className="text-xs font-medium text-ink">
                          {ticket.agentName ?? (
                            <span className="text-warning">Unassigned</span>
                          )}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 align-top">
                        <Badge tone={ticketStatusTone(ticket.status)}>
                          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                          {ticketStatusLabel[ticket.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <span className="inline-flex rounded-lg p-1.5 text-muted hover:bg-ground hover:text-flyt-purple">
                          <ExternalLink className="h-4 w-4" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-border bg-ground/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            Showing{" "}
            <span className="font-semibold text-ink">
              {tickets.length === 0 ? 0 : (page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, tickets.length)}
            </span>{" "}
            of <span className="font-semibold text-ink">{tickets.length}</span> tickets
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="rounded-lg bg-surface px-2.5 py-1 text-xs font-semibold text-ink ring-1 ring-border">
              {page} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Ticket;
  tone: "brand" | "info" | "warning";
}) {
  const tones = {
    brand: "bg-flyt-purple-soft text-flyt-purple",
    info: "bg-info-soft text-info",
    warning: "bg-warning-soft text-warning",
  };
  return (
    <Card>
      <CardBody className="flex items-start justify-between gap-3 p-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-ink">{value}</p>
          <p className="mt-1 text-xs text-muted">{hint}</p>
        </div>
        <span className={cn("rounded-xl p-2.5", tones[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </CardBody>
    </Card>
  );
}
