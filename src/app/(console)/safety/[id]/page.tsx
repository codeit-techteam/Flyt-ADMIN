"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/format";
import { incidentStatusLabel, severityLabel, severityTone } from "@/lib/status";
import { getIncident } from "@/services/data";
import type { SosIncident } from "@/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function IncidentDetailPage() {
  const params = useParams<{ id: string }>();
  const { push } = useToast();
  const [incident, setIncident] = useState<SosIncident | null>(null);

  useEffect(() => {
    getIncident(params.id).then(setIncident);
  }, [params.id]);

  if (!incident) return <p className="text-sm text-muted">Loading incident…</p>;

  return (
    <div>
      <PageHeader
        title={incident.id}
        description={incident.summary}
        actions={
          <Link href="/safety">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge tone={severityTone(incident.severity)}>{severityLabel[incident.severity]}</Badge>
        <Badge tone="danger">{incidentStatusLabel[incident.status]}</Badge>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-red-200">
          <CardHeader title="Incident context" />
          <CardBody className="grid gap-3 sm:grid-cols-2 text-sm">
            <p>
              Ride:{" "}
              <Link href={`/rides/${incident.rideId}`} className="text-flyt-purple hover:underline">
                {incident.rideId}
              </Link>
            </p>
            <p>City: {incident.city}</p>
            <p>
              Reporter: {incident.reporterName} ({incident.reporter})
            </p>
            <p>Pilot: {incident.pilotName}</p>
            <p>Opened: {formatDateTime(incident.openedAt)}</p>
            <p>Updated: {formatDateTime(incident.updatedAt)}</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Actions" description="Local demo updates only." />
          <CardBody className="flex flex-col gap-2">
            <Button
              onClick={() => {
                setIncident({ ...incident, status: "acknowledged" });
                push("Incident acknowledged (demo).", "success");
              }}
            >
              Acknowledge
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIncident({ ...incident, status: "escalated" });
                push("Incident escalated (demo).", "info");
              }}
            >
              Escalate
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setIncident({ ...incident, status: "resolved" });
                push("Incident marked resolved (demo).", "success");
              }}
            >
              Mark resolved
            </Button>
          </CardBody>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader title="Event timeline" />
          <CardBody>
            <ol className="space-y-3 text-sm">
              <li>
                <p className="font-medium">SOS triggered</p>
                <p className="text-xs text-muted">{formatDateTime(incident.openedAt)}</p>
              </li>
              <li>
                <p className="font-medium">Ops notified</p>
                <p className="text-xs text-muted">{formatDateTime(incident.openedAt)}</p>
              </li>
              <li>
                <p className="font-medium">Last update — {incidentStatusLabel[incident.status]}</p>
                <p className="text-xs text-muted">{formatDateTime(incident.updatedAt)}</p>
              </li>
            </ol>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
