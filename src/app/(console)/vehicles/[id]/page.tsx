"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { verificationLabel, verificationTone } from "@/lib/status";
import { getVehicle } from "@/services/data";
import type { Vehicle } from "@/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VehicleDetailPage() {
  const params = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    getVehicle(params.id).then(setVehicle);
  }, [params.id]);

  if (!vehicle) return <p className="text-sm text-muted">Loading vehicle…</p>;

  return (
    <div>
      <PageHeader
        title={vehicle.plate}
        description={`${vehicle.make} ${vehicle.model}`}
        actions={
          <Link href="/vehicles">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        }
      />
      <Badge tone={verificationTone(vehicle.verification)} className="mb-4">
        {verificationLabel[vehicle.verification]}
      </Badge>
      <Card>
        <CardHeader title="Vehicle details" />
        <CardBody className="grid gap-3 sm:grid-cols-2 text-sm">
          <p>ID: {vehicle.id}</p>
          <p>Year: {vehicle.year}</p>
          <p>Colour: {vehicle.color}</p>
          <p className="capitalize">Category: {vehicle.category}</p>
          <p>City: {vehicle.city}</p>
          <p>
            Linked Pilot:{" "}
            {vehicle.pilotId ? (
              <Link href={`/pilots/${vehicle.pilotId}`} className="text-flyt-purple hover:underline">
                {vehicle.pilotName}
              </Link>
            ) : (
              "—"
            )}
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
