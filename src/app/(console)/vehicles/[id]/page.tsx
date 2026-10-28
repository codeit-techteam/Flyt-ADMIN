"use client";

import { DetailField, DetailGrid } from "@/components/pilots/detail-field";
import { DocumentReviewGrid } from "@/components/pilots/document-review-grid";
import { VehiclePlateCard } from "@/components/vehicles/vehicle-plate-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import {
  fuelLabel,
  isVehicleOnboardingDocument,
  ownershipLabel,
  pilotCategoryLabel,
  requiredDocumentTypes,
} from "@/config/pilot-documents";
import { getRideCategory, rideCategoryLabel } from "@/config/ride-categories";
import { cn } from "@/lib/cn";
import { formatDate, formatPhone, formatRelative } from "@/lib/format";
import {
  rideStatusLabel,
  rideTone,
  verificationLabel,
  verificationTone,
} from "@/lib/status";
import { getPilot, getVehicle, listRides } from "@/services/data";
import type { Pilot, PilotDocumentRecord, Ride, Vehicle, VerificationStatus } from "@/types";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Ban,
  Car,
  CheckCircle2,
  ClipboardList,
  Copy,
  FileText,
  FileWarning,
  IdCard,
  MapPin,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function VehicleDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [pilot, setPilot] = useState<Pilot | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([getVehicle(params.id), listRides()]).then(async ([v, allRides]) => {
      if (cancelled) return;
      setVehicle(v);
      if (v?.pilotId) {
        setPilot(await getPilot(v.pilotId));
      } else {
        setPilot(null);
      }
      setRides(
        allRides.filter(
          (r) =>
            (v?.pilotId && r.pilotId === v.pilotId) ||
            (v?.pilotName && r.pilotName === v.pilotName),
        ),
      );
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const category = useMemo(
    () => (vehicle ? getRideCategory(vehicle.category) : undefined),
    [vehicle],
  );

  const onboardVehicle = pilot?.onboarding.vehicle ?? null;
  const drivingLicence = pilot?.onboarding.drivingLicence ?? null;

  const vehicleDocs = useMemo((): PilotDocumentRecord[] => {
    const docs = (pilot?.onboarding.documents ?? []).filter((d) =>
      isVehicleOnboardingDocument(d.type),
    );
    if (docs.length > 0) return docs;

    // Unassigned / no Pilot payload — still show the compliance checklist expected at onboarding.
    const required = requiredDocumentTypes(
      onboardVehicle?.categoryId ||
        (vehicle?.category === "bike"
          ? "bike"
          : vehicle?.category === "auto"
            ? "auto"
            : "cab"),
      onboardVehicle?.ownership || "owned",
    ).filter(isVehicleOnboardingDocument);

    return required.map((type) => ({ type, status: "missing" }));
  }, [pilot, onboardVehicle, vehicle]);

  const rcDoc = vehicleDocs.find((d) => d.type === "registration_certificate");

  function copy(value: string, label: string) {
    void navigator.clipboard.writeText(value).then(
      () => push(`${label} copied`, "success"),
      () => push(`Could not copy ${label.toLowerCase()}`, "error"),
    );
  }

  function setVerification(next: VerificationStatus) {
    setVehicle((prev) => (prev ? { ...prev, verification: next } : prev));
    push(
      next === "approved"
        ? "Vehicle approved (local demo only)."
        : next === "rejected"
          ? "Vehicle rejected (local demo only)."
          : next === "needs_correction"
            ? "Correction requested (local demo only)."
            : "Moved to under review (local demo only).",
      "success",
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,400px)_1fr]">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <EmptyState
        title="Vehicle not found"
        description="This fleet record is not in the demo dataset."
        actionLabel="Back to vehicles"
        onAction={() => router.push("/vehicles")}
      />
    );
  }

  const activeRides = rides.filter((r) =>
    ["searching", "assigned", "arrived", "in_progress"].includes(r.status),
  ).length;

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
        <Link href="/vehicles" className="font-medium text-flyt-purple hover:underline">
          Vehicles
        </Link>
        <span>/</span>
        <span className="font-semibold text-ink">{vehicle.plate}</span>
      </nav>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Link href="/vehicles">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <Badge tone={verificationTone(vehicle.verification)}>
              {verificationLabel[vehicle.verification]}
            </Badge>
            <Badge tone="brand">{rideCategoryLabel(vehicle.category)}</Badge>
            <Badge tone="neutral">{vehicle.city}</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            {vehicle.make} {vehicle.model}
          </h1>
          <p className="mt-1 font-mono text-sm text-muted">
            {vehicle.plate} · {vehicle.id} · {vehicle.year} · {vehicle.color}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => copy(vehicle.plate, "Plate")}>
            <Copy className="h-3.5 w-3.5" />
            Copy plate
          </Button>
          {vehicle.pilotId ? (
            <Link href={`/pilots/${vehicle.pilotId}`}>
              <Button size="sm" variant="secondary">
                <UserRound className="h-3.5 w-3.5" />
                Open Pilot
              </Button>
            </Link>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,400px)_1fr]">
        <VehiclePlateCard vehicle={vehicle} />

        <Card className="overflow-hidden">
          <div className="border-b border-border bg-gradient-to-r from-flyt-purple-soft/50 via-surface to-surface px-5 py-4">
            <h2 className="text-sm font-semibold text-ink">Vehicle & RC details</h2>
            <p className="mt-0.5 text-xs text-muted">
              Fleet directory + Pilot onboarding vehicle form (registration, fuel, ownership)
            </p>
          </div>
          <CardBody className="space-y-5">
            <DetailGrid>
              <DetailField label="Vehicle ID" value={vehicle.id} mono />
              <DetailField
                label="RC / registration no."
                value={onboardVehicle?.registrationNumber || vehicle.plate}
                mono
              />
              <DetailField
                label="Make / model"
                value={
                  onboardVehicle
                    ? [onboardVehicle.make, onboardVehicle.model].filter(Boolean).join(" ") ||
                      `${vehicle.make} ${vehicle.model}`
                    : `${vehicle.make} ${vehicle.model}`
                }
              />
              <DetailField
                label="Year"
                value={onboardVehicle?.year || String(vehicle.year)}
              />
              <DetailField
                label="Colour"
                value={
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-full border border-border"
                      style={{
                        backgroundColor:
                          (
                            {
                              White: "#F5F5F5",
                              Silver: "#C0C0C0",
                              Grey: "#9CA3AF",
                              Black: "#1F2937",
                              Blue: "#3B82F6",
                            } as Record<string, string>
                          )[onboardVehicle?.color || vehicle.color] ?? "#D1D5DB",
                      }}
                    />
                    {onboardVehicle?.color || vehicle.color}
                  </span>
                }
              />
              <DetailField label="Booking category" value={rideCategoryLabel(vehicle.category)} />
              <DetailField
                label="Pilot onboarding category"
                value={pilotCategoryLabel(onboardVehicle?.categoryId)}
              />
              <DetailField
                label="Fuel type"
                value={fuelLabel[onboardVehicle?.fuelType ?? ""] ?? "—"}
              />
              <DetailField
                label="Ownership"
                value={ownershipLabel[onboardVehicle?.ownership ?? ""] ?? "—"}
              />
              <DetailField label="Capacity" value={category ? `${category.capacity} seats` : "—"} />
              <DetailField label="City" value={vehicle.city} />
              <DetailField
                label="RC document"
                value={
                  rcDoc ? (
                    <Badge tone={rcDoc.status === "verified" ? "success" : rcDoc.status === "missing" ? "warning" : "info"}>
                      {rcDoc.status.replace(/_/g, " ")}
                      {rcDoc.fileName ? ` · ${rcDoc.fileName}` : ""}
                    </Badge>
                  ) : (
                    "—"
                  )
                }
              />
            </DetailGrid>
            {category ? (
              <p className="rounded-xl bg-ground/70 px-3.5 py-2.5 text-xs text-muted">
                {category.description} · Same fields collected in Pilot app vehicle onboarding
                (RC, fuel, ownership, compliance docs).
              </p>
            ) : null}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Verification"
          value={verificationLabel[vehicle.verification]}
          icon={BadgeCheck}
          tone={
            vehicle.verification === "approved"
              ? "success"
              : vehicle.verification === "rejected"
                ? "danger"
                : "warning"
          }
        />
        <Kpi
          label="Assignment"
          value={vehicle.pilotId ? "Linked" : "Open"}
          hint={vehicle.pilotName ?? "No Pilot linked"}
          icon={UserRound}
          tone={vehicle.pilotId ? "brand" : "info"}
        />
        <Kpi
          label="Linked trips"
          value={String(rides.length)}
          hint={`${activeRides} active now`}
          icon={Car}
          tone="info"
        />
        <Kpi
          label="Service city"
          value={vehicle.city}
          icon={MapPin}
          tone="brand"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <div className="border-b border-border bg-gradient-to-r from-flyt-purple-soft/40 via-surface to-surface px-5 py-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-flyt-purple-soft text-flyt-purple">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-ink">
                  RC & vehicle compliance (Pilot onboarding)
                </h2>
                <p className="mt-0.5 text-xs text-muted">
                  Registration certificate, insurance, permit, fitness — same pack submitted in the
                  Pilot app
                </p>
              </div>
            </div>
          </div>
          <CardBody>
            {pilot ? (
              <DocumentReviewGrid documents={vehicleDocs} includeSelfie={false} />
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted">
                  No linked Pilot onboarding payload. Showing the Hyderabad compliance checklist
                  expected during vehicle onboarding:
                </p>
                <DocumentReviewGrid documents={vehicleDocs} includeSelfie={false} />
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Driving licence"
            description="Operator licence from Pilot onboarding"
          />
          <CardBody className="space-y-3 text-sm">
            {drivingLicence ? (
              <>
                <div className="flex items-start gap-3 rounded-xl bg-ground px-3 py-2.5">
                  <IdCard className="mt-0.5 h-4 w-4 shrink-0 text-flyt-purple" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted">Holder</p>
                    <p className="font-medium text-ink">{drivingLicence.holderName}</p>
                  </div>
                </div>
                <DetailField label="Licence number" value={drivingLicence.licenceNumber} mono />
                <DetailField
                  label="Class / state"
                  value={`${drivingLicence.vehicleClass} · ${drivingLicence.issuingState}`}
                />
                <DetailField
                  label="Valid"
                  value={`${formatDate(drivingLicence.issueDate)} – ${formatDate(drivingLicence.expiryDate)}`}
                />
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-ground/40 px-3 py-8 text-center">
                <IdCard className="mx-auto h-5 w-5 text-muted" />
                <p className="mt-2 text-sm font-medium text-ink">No licence on file</p>
                <p className="mt-1 text-xs text-muted">
                  Link a Pilot with onboarding data to see DL details.
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Linked Pilot"
            description="Partner currently assigned to this fleet unit"
          />
          <CardBody>
            {vehicle.pilotId && (pilot || vehicle.pilotName) ? (
              <Link
                href={`/pilots/${vehicle.pilotId}`}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-gradient-to-br from-flyt-purple-soft/40 to-surface p-4 transition hover:-translate-y-0.5 hover:border-flyt-purple/30 hover:shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-flyt-purple text-sm font-bold text-white">
                    {(vehicle.pilotName ?? "?")
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((p) => p[0]?.toUpperCase() ?? "")
                      .join("")}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {vehicle.pilotName ?? pilot?.name}
                    </p>
                    <p className="font-mono text-xs text-muted">{vehicle.pilotId}</p>
                    {pilot ? (
                      <p className="mt-0.5 text-xs text-muted">
                        {formatPhone(pilot.phone)} · {pilot.status} · rating{" "}
                        {pilot.rating ? pilot.rating.toFixed(2) : "—"}
                      </p>
                    ) : null}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-flyt-purple">
                  Open profile
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-ground/40 px-4 py-8 text-center">
                <UserRound className="mx-auto h-5 w-5 text-muted" />
                <p className="mt-2 text-sm font-medium text-ink">No Pilot linked</p>
                <p className="mt-1 text-xs text-muted">
                  This vehicle is available for assignment in the demo fleet.
                </p>
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="overflow-hidden">
          <div
            className={cn(
              "border-b px-5 py-4",
              vehicle.verification === "approved" &&
                "border-emerald-200 bg-gradient-to-br from-emerald-50 to-surface",
              vehicle.verification === "rejected" &&
                "border-red-200 bg-gradient-to-br from-danger-soft/70 to-surface",
              vehicle.verification !== "approved" &&
                vehicle.verification !== "rejected" &&
                "border-border bg-gradient-to-br from-flyt-purple-soft/50 to-surface",
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  vehicle.verification === "approved" && "bg-emerald-100 text-success",
                  vehicle.verification === "rejected" && "bg-danger-soft text-danger",
                  vehicle.verification !== "approved" &&
                    vehicle.verification !== "rejected" &&
                    "bg-flyt-purple-soft text-flyt-purple",
                )}
              >
                {vehicle.verification === "approved" ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : vehicle.verification === "rejected" ? (
                  <Ban className="h-5 w-5" />
                ) : (
                  <ClipboardList className="h-5 w-5" />
                )}
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">
                  {vehicle.verification === "approved"
                    ? "Vehicle verified"
                    : vehicle.verification === "rejected"
                      ? "Vehicle rejected"
                      : "Verification pending"}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {verificationLabel[vehicle.verification]} · demo actions only
                </p>
              </div>
            </div>
          </div>
          <CardBody className="space-y-3">
            {vehicle.verification === "approved" ? (
              <>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-3.5 py-3">
                  <p className="text-sm font-medium text-ink">Already approved</p>
                  <p className="mt-0.5 text-xs text-muted">
                    Approve is hidden while this fleet unit stays verified.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setVerification("needs_correction")}
                >
                  <FileWarning className="h-4 w-4" />
                  Request correction
                </Button>
                <Button
                  variant="danger"
                  className="w-full justify-start"
                  onClick={() => setVerification("rejected")}
                >
                  <Ban className="h-4 w-4" />
                  Revoke approval
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="w-full justify-start"
                  onClick={() => setVerification("approved")}
                >
                  <BadgeCheck className="h-4 w-4" />
                  Approve vehicle
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setVerification("needs_correction")}
                >
                  <FileWarning className="h-4 w-4" />
                  Request correction
                </Button>
                <Button
                  variant="danger"
                  className="w-full justify-start"
                  onClick={() => setVerification("rejected")}
                >
                  <Ban className="h-4 w-4" />
                  Reject vehicle
                </Button>
              </>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title={`Recent trips (${rides.length})`}
          description={
            vehicle.pilotId
              ? "Trips attributed to the linked Pilot in demo data"
              : "No Pilot linked — trip list is empty"
          }
          action={
            vehicle.pilotId ? (
              <Link
                href={`/rides?q=${encodeURIComponent(vehicle.pilotName ?? "")}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-flyt-purple hover:underline"
              >
                All rides
                <ArrowRight className="h-3 w-3" />
              </Link>
            ) : undefined
          }
        />
        <CardBody className="space-y-2">
          {rides.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              No linked rides in the demo dataset for this vehicle.
            </p>
          ) : (
            rides.slice(0, 8).map((ride) => (
              <Link
                key={ride.id}
                href={`/rides/${ride.id}`}
                className="flex flex-col gap-2 rounded-xl border border-border px-3.5 py-3 transition hover:border-flyt-purple/30 hover:bg-flyt-purple-soft/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-mono text-xs font-semibold text-flyt-purple">{ride.id}</p>
                  <p className="mt-0.5 truncate text-sm text-ink">
                    {ride.pickup} → {ride.destination}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {ride.customerName} · {formatRelative(ride.requestedAt)}
                  </p>
                </div>
                <Badge tone={rideTone(ride.status)}>{rideStatusLabel[ride.status]}</Badge>
              </Link>
            ))
          )}
        </CardBody>
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
  hint?: string;
  icon: typeof Car;
  tone: "brand" | "success" | "warning" | "info" | "danger";
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-xl",
            tone === "brand" && "bg-flyt-purple-soft text-flyt-purple",
            tone === "success" && "bg-emerald-50 text-success",
            tone === "warning" && "bg-warning-soft text-warning",
            tone === "info" && "bg-info-soft text-info",
            tone === "danger" && "bg-danger-soft text-danger",
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 truncate text-xl font-bold text-ink">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
