"use client";

import { PageHeader } from "@/components/layout/page-header";
import { PilotIdCard } from "@/components/pilots/pilot-id-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import {
  bankStatusLabel,
  documentStatusLabel,
  documentStatusTone,
  fuelLabel,
  genderLabel,
  languageLabel,
  ownershipLabel,
  pilotCategoryLabel,
  pilotDocumentLabel,
} from "@/config/pilot-documents";
import { cn } from "@/lib/cn";
import { formatDate, formatPhone } from "@/lib/format";
import { rideStatusLabel, rideTone, verificationLabel, verificationTone } from "@/lib/status";
import { getPilot, getVehicle, listRides, listTickets } from "@/services/data";
import type { Pilot, Ride, SupportTicket, Vehicle, VerificationStatus } from "@/types";
import {
  ArrowLeft,
  BadgeCheck,
  Ban,
  CheckCircle2,
  Copy,
  FileWarning,
  MapPin,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PilotDetailPage() {
  const params = useParams<{ id: string }>();
  const { push } = useToast();
  const [pilot, setPilot] = useState<Pilot | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [confirm, setConfirm] = useState<VerificationStatus | null>(null);

  useEffect(() => {
    getPilot(params.id).then(async (p) => {
      setPilot(p);
      if (p?.vehicleId) {
        setVehicle(await getVehicle(p.vehicleId));
      } else {
        setVehicle(null);
      }
    });
    Promise.all([listRides(), listTickets()]).then(([allRides, allTickets]) => {
      setRides(allRides.filter((r) => r.pilotId === params.id));
      setTickets(allTickets.filter((t) => t.requesterId === params.id));
    });
  }, [params.id]);

  if (!pilot) return <p className="text-sm text-muted">Loading Pilot…</p>;

  const current = pilot;

  function applyDecision(next: VerificationStatus) {
    const wasApproved = current.verification === "approved";
    setPilot((prev) => (prev ? { ...prev, verification: next } : prev));
    setConfirm(null);
    push(
      next === "approved"
        ? "Pilot approved (local demo only)."
        : next === "rejected"
          ? wasApproved
            ? "Approval revoked (local demo only)."
            : "Pilot rejected (local demo only)."
          : "Correction requested (local demo only).",
      "success",
    );
  }

  const confirmCopy =
    confirm === "approved"
      ? {
          title: "Approve this Pilot?",
          body: `Set verification for ${current.name} to Approved? They will be treated as a verified partner in this demo.`,
          confirmLabel: "Confirm approve",
        }
      : confirm === "rejected" && current.verification === "approved"
        ? {
            title: "Revoke approval?",
            body: `Remove Approved status for ${current.name}? They will no longer appear as a verified partner in this demo.`,
            confirmLabel: "Revoke approval",
          }
        : confirm === "rejected"
          ? {
              title: "Reject application?",
              body: `Reject verification for ${current.name}? This updates local demo state only.`,
              confirmLabel: "Confirm reject",
            }
          : {
              title: "Request correction?",
              body: `Ask ${current.name} to fix documents or details? Status becomes Needs correction in this demo.`,
              confirmLabel: "Request correction",
            };

  const onboarding = pilot.onboarding;
  const onboardVehicle = onboarding.vehicle;
  const vehicleLabel =
    onboardVehicle && (onboardVehicle.make || onboardVehicle.registrationNumber)
      ? [
          [onboardVehicle.make, onboardVehicle.model].filter(Boolean).join(" "),
          onboardVehicle.registrationNumber,
        ]
          .filter(Boolean)
          .join(" · ")
      : vehicle
        ? [`${vehicle.make} ${vehicle.model}`.trim(), vehicle.plate].filter(Boolean).join(" · ")
        : undefined;

  const pilotIdDisplay = onboarding.applicationReference || pilot.id;
  const partnerSince = onboarding.submittedAt
    ? formatDate(onboarding.submittedAt)
    : formatDate(pilot.joinedAt);

  return (
    <div>
      <PageHeader
        title={pilot.name}
        description="Pilot ID card and partner details — same identity shown in the Pilot app"
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
        <Badge
          tone={
            pilot.status === "online"
              ? "success"
              : pilot.status === "busy"
                ? "info"
                : pilot.status === "suspended"
                  ? "danger"
                  : "neutral"
          }
        >
          {pilot.status}
        </Badge>
        <Badge tone="neutral">{onboarding.operatingCity || pilot.city}</Badge>
        {onboarding.sheEligible ? <Badge tone="brand">SHE eligible</Badge> : null}
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,400px)_1fr]">
        <PilotIdCard
          fullName={pilot.name}
          pilotId={pilotIdDisplay}
          phone={pilot.phone}
          city={onboarding.operatingCity || pilot.city}
          verification={pilot.verification}
          vehicleLabel={vehicleLabel}
        />

        <Card>
          <CardHeader title="ID details" description="Mirrors the Pilot app · Pilot ID screen." />
          <CardBody className="space-y-3 text-sm">
            <div className="flex items-start gap-3 rounded-xl bg-ground px-3 py-2.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-flyt-purple" strokeWidth={1.75} />
              <div className="min-w-0">
                <p className="text-xs text-muted">Application reference</p>
                <p className="font-mono text-sm font-semibold tracking-wide">{pilotIdDisplay}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-ground px-3 py-2.5">
              <Copy className="mt-0.5 h-4 w-4 shrink-0 text-flyt-purple" strokeWidth={1.75} />
              <div className="min-w-0">
                <p className="text-xs text-muted">Account ID</p>
                <p className="font-mono text-sm font-semibold">{pilot.id}</p>
              </div>
            </div>
            <div className="rounded-xl bg-ground px-3 py-2.5">
              <p className="text-xs text-muted">Partner since</p>
              <p className="text-sm font-medium">{partnerSince}</p>
            </div>
            <p className="text-xs text-muted">
              Show this ID if Hyderabad support or city ops ask for the Pilot reference.
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Profile" />
          <CardBody className="space-y-3 text-sm">
            <p>
              <span className="text-muted">Phone:</span> {formatPhone(pilot.phone)}
            </p>
            <p>
              <span className="text-muted">Email:</span> {pilot.email}
            </p>
            <p>
              <span className="text-muted">Date of birth:</span>{" "}
              {onboarding.dateOfBirth ? formatDate(onboarding.dateOfBirth) : "—"}
            </p>
            <p>
              <span className="text-muted">Gender:</span> {genderLabel[onboarding.gender] ?? "—"}
            </p>
            <p>
              <span className="text-muted">Language:</span>{" "}
              {languageLabel[onboarding.preferredLanguage]}
            </p>
            <p>
              <span className="text-muted">City:</span> {onboarding.operatingCity || pilot.city}
            </p>
            <p>
              <span className="text-muted">Trips:</span> {pilot.totalTrips}
            </p>
            <p>
              <span className="text-muted">Rating:</span>{" "}
              {pilot.rating ? pilot.rating.toFixed(2) : "—"}
            </p>
            {onboarding.lastKnownLocation ? (
              <div className="rounded-xl border border-border bg-ground px-3 py-2.5">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <MapPin className="h-3.5 w-3.5 text-flyt-purple" />
                  Last known location
                </p>
                <p className="text-sm">{onboarding.lastKnownLocation.label}</p>
                <p className="text-xs text-muted">
                  {onboarding.lastKnownLocation.latitude.toFixed(4)},{" "}
                  {onboarding.lastKnownLocation.longitude.toFixed(4)} ·{" "}
                  {formatDate(onboarding.lastKnownLocation.updatedAt)}
                </p>
              </div>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Vehicle & licence" />
          <CardBody className="space-y-3 text-sm">
            {onboardVehicle ? (
              <>
                <p>
                  <span className="text-muted">Category:</span>{" "}
                  {pilotCategoryLabel(onboardVehicle.categoryId)}
                </p>
                <p>
                  <span className="text-muted">Vehicle:</span>{" "}
                  {[onboardVehicle.make, onboardVehicle.model].filter(Boolean).join(" ") || "—"}
                </p>
                <p>
                  <span className="text-muted">Registration:</span>{" "}
                  <span className="font-mono text-xs font-semibold">
                    {onboardVehicle.registrationNumber || "—"}
                  </span>
                </p>
                <p>
                  <span className="text-muted">Year / colour:</span>{" "}
                  {[onboardVehicle.year, onboardVehicle.color].filter(Boolean).join(" · ") || "—"}
                </p>
                <p>
                  <span className="text-muted">Fuel:</span> {fuelLabel[onboardVehicle.fuelType] ?? "—"}
                </p>
                <p>
                  <span className="text-muted">Ownership:</span>{" "}
                  {ownershipLabel[onboardVehicle.ownership] ?? "—"}
                </p>
              </>
            ) : (
              <p className="text-muted">No vehicle submitted yet.</p>
            )}
            {pilot.vehicleId ? (
              <p>
                <span className="text-muted">Fleet record:</span>{" "}
                <Link href={`/vehicles/${pilot.vehicleId}`} className="text-flyt-purple hover:underline">
                  {pilot.vehicleId}
                </Link>
              </p>
            ) : null}
            <div className="border-t border-border pt-3">
              {onboarding.drivingLicence ? (
                <>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    Driving licence
                  </p>
                  <p>
                    <span className="text-muted">Holder:</span> {onboarding.drivingLicence.holderName}
                  </p>
                  <p>
                    <span className="text-muted">Number:</span>{" "}
                    <span className="font-mono text-xs">
                      {onboarding.drivingLicence.licenceNumber}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted">Class / state:</span>{" "}
                    {onboarding.drivingLicence.vehicleClass} ·{" "}
                    {onboarding.drivingLicence.issuingState}
                  </p>
                  <p>
                    <span className="text-muted">Valid:</span>{" "}
                    {formatDate(onboarding.drivingLicence.issueDate)} –{" "}
                    {formatDate(onboarding.drivingLicence.expiryDate)}
                  </p>
                </>
              ) : (
                <p className="text-warning">Driving licence not submitted.</p>
              )}
            </div>
          </CardBody>
        </Card>

        <Card className="overflow-hidden">
          <div
            className={cn(
              "border-b px-5 py-4",
              pilot.verification === "approved" &&
                "border-emerald-200 bg-gradient-to-br from-emerald-50 to-surface",
              pilot.verification === "rejected" &&
                "border-red-200 bg-gradient-to-br from-danger-soft/70 to-surface",
              pilot.verification === "needs_correction" &&
                "border-amber-200 bg-gradient-to-br from-warning-soft/70 to-surface",
              (pilot.verification === "pending" || pilot.verification === "under_review") &&
                "border-border bg-gradient-to-br from-flyt-purple-soft/50 to-surface",
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  pilot.verification === "approved" && "bg-emerald-100 text-success",
                  pilot.verification === "rejected" && "bg-danger-soft text-danger",
                  pilot.verification === "needs_correction" && "bg-warning-soft text-warning",
                  (pilot.verification === "pending" || pilot.verification === "under_review") &&
                    "bg-flyt-purple-soft text-flyt-purple",
                )}
              >
                {pilot.verification === "approved" ? (
                  <BadgeCheck className="h-5 w-5" />
                ) : pilot.verification === "rejected" ? (
                  <ShieldAlert className="h-5 w-5" />
                ) : pilot.verification === "needs_correction" ? (
                  <FileWarning className="h-5 w-5" />
                ) : (
                  <ShieldCheck className="h-5 w-5" />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">
                  {pilot.verification === "approved"
                    ? "Partner verified"
                    : pilot.verification === "rejected"
                      ? "Application rejected"
                      : pilot.verification === "needs_correction"
                        ? "Correction requested"
                        : "Awaiting verification"}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  Status · {verificationLabel[pilot.verification]} · demo actions only
                </p>
              </div>
            </div>
          </div>

          <CardBody className="space-y-4">
            {pilot.verification === "approved" ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-3.5 py-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <div>
                      <p className="text-sm font-medium text-ink">Already approved</p>
                      <p className="mt-0.5 text-xs text-muted">
                        This Pilot can take trips. Approve is unavailable while verification stays
                        approved.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setConfirm("needs_correction")}
                    className="justify-start"
                  >
                    <FileWarning className="h-4 w-4" />
                    Request correction
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setConfirm("rejected")}
                    className="justify-start"
                  >
                    <Ban className="h-4 w-4" />
                    Revoke approval
                  </Button>
                </div>
              </div>
            ) : pilot.verification === "rejected" ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-red-200 bg-danger-soft/50 px-3.5 py-3">
                  <p className="text-sm font-medium text-ink">Rejected — reopen to continue</p>
                  <p className="mt-0.5 text-xs text-muted">
                    Approve only after documents and identity checks pass again.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Button onClick={() => setConfirm("approved")} className="justify-start">
                    <BadgeCheck className="h-4 w-4" />
                    Approve & reinstate
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setConfirm("needs_correction")}
                    className="justify-start"
                  >
                    <FileWarning className="h-4 w-4" />
                    Request correction instead
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted">
                  Review documents below, then decide. Changes apply to this demo session only.
                </p>
                <div className="grid gap-2">
                  <Button onClick={() => setConfirm("approved")} className="justify-start">
                    <BadgeCheck className="h-4 w-4" />
                    Approve Pilot
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setConfirm("needs_correction")}
                    className="justify-start"
                  >
                    <FileWarning className="h-4 w-4" />
                    Request correction
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setConfirm("rejected")}
                    className="justify-start"
                  >
                    <Ban className="h-4 w-4" />
                    Reject application
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Identity checks
              </p>
              <div className="rounded-xl border border-border bg-ground/50 px-3.5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-ink">Live selfie</p>
                    <p className="text-xs text-muted">
                      {onboarding.identitySelfie.previewLabel ?? "Identity selfie"}
                    </p>
                  </div>
                  <Badge tone={documentStatusTone(onboarding.identitySelfie.status)}>
                    {documentStatusLabel[onboarding.identitySelfie.status]}
                  </Badge>
                </div>
                {onboarding.identitySelfie.rejectionReason ? (
                  <p className="mt-2 text-xs text-danger">
                    {onboarding.identitySelfie.rejectionReason}
                  </p>
                ) : null}
              </div>

              {onboarding.bank ? (
                <div className="rounded-xl border border-border bg-ground/50 px-3.5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">Bank payout</p>
                      <p className="truncate text-xs text-muted">
                        {onboarding.bank.bankName} ····{onboarding.bank.accountNumberLast4}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {onboarding.bank.ifsc} · {onboarding.bank.upiId}
                      </p>
                    </div>
                    <Badge tone="info">{bankStatusLabel[onboarding.bank.status]}</Badge>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-warning-soft/50 px-3.5 py-3 text-sm text-warning">
                  Bank details missing.
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader
            title="Document review"
            description="Documents submitted from the Pilot app onboarding flow."
          />
          <CardBody>
            {onboarding.documents.length === 0 ? (
              <p className="text-sm text-muted">No documents in onboarding payload.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {onboarding.documents.map((doc) => (
                  <li
                    key={doc.type}
                    className="flex items-start justify-between gap-3 rounded-xl border border-border px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{pilotDocumentLabel(doc.type)}</p>
                      {doc.fileName ? (
                        <p className="truncate text-xs text-muted">{doc.fileName}</p>
                      ) : null}
                      {doc.rejectionReason ? (
                        <p className="mt-1 text-xs text-danger">{doc.rejectionReason}</p>
                      ) : null}
                    </div>
                    <Badge tone={documentStatusTone(doc.status)}>{documentStatusLabel[doc.status]}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Ride history" />
          <CardBody className="space-y-2">
            {rides.length === 0 ? (
              <p className="text-sm text-muted">No rides in demo dataset for this pilot.</p>
            ) : (
              rides.map((ride) => (
                <Link
                  key={ride.id}
                  href={`/rides/${ride.id}`}
                  className="flex items-center justify-between rounded-lg bg-ground px-3 py-2 hover:bg-flyt-purple-soft/40"
                >
                  <div>
                    <p className="font-mono text-xs font-semibold">{ride.id}</p>
                    <p className="text-xs text-muted">
                      {ride.pickup} → {ride.destination}
                    </p>
                  </div>
                  <Badge tone={rideTone(ride.status)}>{rideStatusLabel[ride.status]}</Badge>
                </Link>
              ))
            )}
          </CardBody>
        </Card>

        <Card>
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

      <Dialog
        open={Boolean(confirm)}
        title={confirmCopy.title}
        description="Local demo only — not saved to a server."
        onClose={() => setConfirm(null)}
      >
        <p className="mb-4 text-sm text-muted">{confirmCopy.body}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirm(null)}>
            Cancel
          </Button>
          <Button
            variant={confirm === "rejected" ? "danger" : "primary"}
            onClick={() => confirm && applyDecision(confirm)}
          >
            {confirmCopy.confirmLabel}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
