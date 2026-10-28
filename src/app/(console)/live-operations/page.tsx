"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { formatRelative } from "@/lib/format";
import { rideStatusLabel, rideTone } from "@/lib/status";
import { listIncidents, listRides } from "@/services/data";
import type { Ride, SosIncident } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LiveOperationsPage() {
  const [active, setActive] = useState<Ride[]>([]);
  const [sos, setSos] = useState<SosIncident[]>([]);

  useEffect(() => {
    Promise.all([listRides(), listIncidents()]).then(([rides, incidents]) => {
      setActive(
        rides.filter((r) =>
          ["searching", "assigned", "arrived", "in_progress"].includes(r.status),
        ),
      );
      setSos(incidents.filter((i) => i.status !== "resolved"));
    });
  }, []);

  return (
    <div>
      <PageHeader
        title="Live Operations"
        description="Active trips and open safety incidents. Map streaming is not connected — list view only."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title={`Active rides (${active.length})`} description="Demo snapshot" />
          <CardBody className="space-y-3">
            {active.map((ride) => (
              <Link
                key={ride.id}
                href={`/rides/${ride.id}`}
                className="flex flex-col gap-2 rounded-lg border border-border p-3 hover:border-flyt-purple/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-mono text-xs font-semibold text-flyt-purple">{ride.id}</p>
                  <p className="text-sm text-ink">
                    {ride.customerName} · {ride.pilotName ?? "Searching Pilot"}
                  </p>
                  <p className="text-xs text-muted">
                    {ride.pickup} → {ride.destination}
                  </p>
                </div>
                <Badge tone={rideTone(ride.status)}>{rideStatusLabel[ride.status]}</Badge>
              </Link>
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Open SOS" />
          <CardBody className="space-y-3">
            {sos.map((incident) => (
              <Link
                key={incident.id}
                href={`/safety/${incident.id}`}
                className="block rounded-lg border border-red-200 bg-danger-soft/40 p-3"
              >
                <p className="font-mono text-xs font-semibold">{incident.id}</p>
                <p className="mt-1 text-sm text-ink">{incident.summary}</p>
                <p className="mt-1 text-xs text-muted">{formatRelative(incident.openedAt)}</p>
              </Link>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
