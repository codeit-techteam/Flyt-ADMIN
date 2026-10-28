"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { formatDateTime, formatInr } from "@/lib/format";
import {
  paymentStatusLabel,
  paymentTone,
  rideStatusLabel,
  rideTone,
} from "@/lib/status";
import { getRide, getRideTimeline } from "@/services/data";
import type { Ride, RideTimelineEvent } from "@/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RideDetailPage() {
  const params = useParams<{ id: string }>();
  const [ride, setRide] = useState<Ride | null>(null);
  const [timeline, setTimeline] = useState<RideTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRide(params.id), getRideTimeline(params.id)]).then(([r, t]) => {
      setRide(r);
      setTimeline(t);
      setLoading(false);
    });
  }, [params.id]);

  if (loading) return <p className="text-sm text-muted">Loading ride…</p>;
  if (!ride) {
    return (
      <div>
        <p className="text-sm text-muted">Ride not found.</p>
        <Link href="/rides" className="mt-2 inline-block text-sm text-flyt-purple hover:underline">
          Back to rides
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={ride.id}
        description={`${ride.pickup} → ${ride.destination}`}
        actions={
          <Link href="/rides">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Badge tone={rideTone(ride.status)}>{rideStatusLabel[ride.status]}</Badge>
        <Badge tone={paymentTone(ride.paymentStatus)}>
          {paymentStatusLabel[ride.paymentStatus]}
        </Badge>
        <Badge tone="brand">{ride.vehicleCategory}</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Trip details" />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Field label="Customer" value={ride.customerName} href={`/customers/${ride.customerId}`} />
            <Field
              label="Pilot"
              value={ride.pilotName ?? "Unassigned"}
              href={ride.pilotId ? `/pilots/${ride.pilotId}` : undefined}
            />
            <Field label="Pickup" value={ride.pickup} />
            <Field label="Destination" value={ride.destination} />
            <Field label="Fare" value={formatInr(ride.fareInr)} />
            <Field label="City" value={ride.city} />
            <Field label="Requested" value={formatDateTime(ride.requestedAt)} />
            <Field
              label="Completed"
              value={ride.completedAt ? formatDateTime(ride.completedAt) : "—"}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Lifecycle timeline" />
          <CardBody>
            <ol className="space-y-4">
              {timeline.map((event, index) => (
                <li key={event.id} className="relative pl-5">
                  <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-flyt-purple" />
                  {index < timeline.length - 1 ? (
                    <span className="absolute left-[4px] top-4 h-[calc(100%+8px)] w-px bg-border" />
                  ) : null}
                  <p className="text-sm font-medium text-ink">{event.label}</p>
                  {event.detail ? <p className="text-xs text-muted">{event.detail}</p> : null}
                  <p className="text-xs text-muted">{formatDateTime(event.at)}</p>
                </li>
              ))}
            </ol>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted">{label}</p>
      {href ? (
        <Link href={href} className="text-sm font-medium text-flyt-purple hover:underline">
          {value}
        </Link>
      ) : (
        <p className="text-sm font-medium text-ink">{value}</p>
      )}
    </div>
  );
}
