"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { formatDate, formatPhone } from "@/lib/format";
import { verificationLabel, verificationTone } from "@/lib/status";
import { getPilot } from "@/services/data";
import type { Pilot, VerificationStatus } from "@/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PilotDetailPage() {
  const params = useParams<{ id: string }>();
  const { push } = useToast();
  const [pilot, setPilot] = useState<Pilot | null>(null);
  const [confirm, setConfirm] = useState<VerificationStatus | null>(null);

  useEffect(() => {
    getPilot(params.id).then(setPilot);
  }, [params.id]);

  if (!pilot) return <p className="text-sm text-muted">Loading Pilot…</p>;

  function applyDecision(next: VerificationStatus) {
    setPilot((prev) => (prev ? { ...prev, verification: next } : prev));
    setConfirm(null);
    push(
      next === "approved"
        ? "Pilot approved (local demo only)."
        : next === "rejected"
          ? "Pilot rejected (local demo only)."
          : "Correction requested (local demo only).",
      "success",
    );
  }

  return (
    <div>
      <PageHeader
        title={pilot.name}
        description={pilot.email}
        actions={
          <Link href="/pilots">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Badge tone={verificationTone(pilot.verification)}>
          {verificationLabel[pilot.verification]}
        </Badge>
        <Badge tone="neutral">{pilot.status}</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Profile" />
          <CardBody className="space-y-2 text-sm">
            <p>ID: {pilot.id}</p>
            <p>Phone: {formatPhone(pilot.phone)}</p>
            <p>City: {pilot.city}</p>
            <p>Joined: {formatDate(pilot.joinedAt)}</p>
            <p>Trips: {pilot.totalTrips}</p>
            <p>Rating: {pilot.rating || "—"}</p>
            <p>
              Vehicle:{" "}
              {pilot.vehicleId ? (
                <Link href={`/vehicles/${pilot.vehicleId}`} className="text-flyt-purple hover:underline">
                  {pilot.vehicleId}
                </Link>
              ) : (
                "Unassigned"
              )}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Document review" />
          <CardBody>
            {pilot.documentsMissing.length === 0 ? (
              <p className="text-sm text-success">All required documents present.</p>
            ) : (
              <ul className="space-y-2">
                {pilot.documentsMissing.map((doc) => (
                  <li key={doc} className="rounded-md border border-amber-200 bg-warning-soft px-3 py-2 text-sm text-warning">
                    Missing: {doc}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 space-y-2 text-xs text-muted">
              <p>Driving Licence — preview placeholder</p>
              <p>Aadhaar — preview placeholder</p>
              <p>Vehicle RC — preview placeholder</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Verification actions" description="Local demo only — not saved to a server." />
          <CardBody className="flex flex-col gap-2">
            <Button onClick={() => setConfirm("approved")}>Approve</Button>
            <Button variant="outline" onClick={() => setConfirm("needs_correction")}>
              Request correction
            </Button>
            <Button variant="danger" onClick={() => setConfirm("rejected")}>
              Reject
            </Button>
          </CardBody>
        </Card>
      </div>

      <Dialog
        open={Boolean(confirm)}
        title="Confirm verification action"
        description="This updates local demo state only. Backend enforcement is required for production."
        onClose={() => setConfirm(null)}
      >
        <p className="mb-4 text-sm text-muted">
          Set verification for <strong>{pilot.name}</strong> to{" "}
          <strong>{confirm ? verificationLabel[confirm] : ""}</strong>?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirm(null)}>
            Cancel
          </Button>
          <Button onClick={() => confirm && applyDecision(confirm)}>Confirm</Button>
        </div>
      </Dialog>
    </div>
  );
}
