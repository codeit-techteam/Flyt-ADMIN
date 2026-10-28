"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { formatDate, formatInr, formatPhone, formatRelative } from "@/lib/format";
import { rideStatusLabel, rideTone } from "@/lib/status";
import { getCustomer, listRides, listTickets } from "@/services/data";
import type { Customer, Ride, SupportTicket } from "@/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  useEffect(() => {
    Promise.all([getCustomer(params.id), listRides(), listTickets()]).then(([c, allRides, allTickets]) => {
      setCustomer(c);
      setRides(allRides.filter((r) => r.customerId === params.id));
      setTickets(allTickets.filter((t) => t.requesterId === params.id));
    });
  }, [params.id]);

  if (!customer) return <p className="text-sm text-muted">Loading customer…</p>;

  return (
    <div>
      <PageHeader
        title={customer.name}
        description={customer.email}
        actions={
          <Link href="/customers">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge tone={customer.status === "active" ? "success" : "warning"}>{customer.status}</Badge>
        <Badge tone="neutral">{customer.city}</Badge>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Account" />
          <CardBody className="space-y-3 text-sm">
            <p>
              <span className="text-muted">ID:</span> {customer.id}
            </p>
            <p>
              <span className="text-muted">Phone:</span> {formatPhone(customer.phone)}
            </p>
            <p>
              <span className="text-muted">Joined:</span> {formatDate(customer.joinedAt)}
            </p>
            <p>
              <span className="text-muted">Total rides:</span> {customer.totalRides}
            </p>
            <p>
              <span className="text-muted">Total spend:</span> {formatInr(customer.totalSpendInr)}
            </p>
            <p>
              <span className="text-muted">Last ride:</span>{" "}
              {customer.lastRideAt ? formatRelative(customer.lastRideAt) : "—"}
            </p>
          </CardBody>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Ride history" />
          <CardBody className="space-y-2">
            {rides.length === 0 ? (
              <p className="text-sm text-muted">No rides in demo dataset for this customer.</p>
            ) : (
              rides.map((ride) => (
                <Link
                  key={ride.id}
                  href={`/rides/${ride.id}`}
                  className="flex items-center justify-between rounded-lg bg-ground px-3 py-2 hover:bg-flyt-purple-soft/40"
                >
                  <div>
                    <p className="font-mono text-xs font-semibold">{ride.id}</p>
                    <p className="text-xs text-muted">{ride.pickup}</p>
                  </div>
                  <Badge tone={rideTone(ride.status)}>{rideStatusLabel[ride.status]}</Badge>
                </Link>
              ))
            )}
          </CardBody>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader title="Support history" />
          <CardBody className="space-y-2">
            {tickets.length === 0 ? (
              <p className="text-sm text-muted">No support tickets in demo data.</p>
            ) : (
              tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/support/${ticket.id}`}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 transition hover:border-flyt-purple/25 hover:bg-flyt-purple-soft/30"
                >
                  <div>
                    <p className="text-sm font-medium">{ticket.subject}</p>
                    <p className="text-xs text-muted">#{ticket.id}</p>
                  </div>
                  <Badge tone="info">{ticket.status.replace(/_/g, " ")}</Badge>
                </Link>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
