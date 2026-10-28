import { pilotDocumentLabel, requiredDocumentTypes } from "@/config/pilot-documents";
import type {
  PilotBankDetails,
  PilotDocumentRecord,
  PilotDocumentStatus,
  PilotDrivingLicence,
  PilotIdentitySelfie,
  PilotLiveLocation,
  PilotOnboarding,
  PilotOnboardingCategoryId,
  PilotOnboardingVehicle,
  VerificationStatus,
  VehicleCategory,
} from "@/types";

type SeedInput = {
  id: string;
  name: string;
  phone: string;
  city: string;
  status: "online" | "offline" | "busy" | "suspended";
  verification: VerificationStatus;
  joinedAt: string;
  sheEligible?: boolean;
  gender?: PilotOnboarding["gender"];
  preferredLanguage?: PilotOnboarding["preferredLanguage"];
  dateOfBirth?: string;
  vehicle?: {
    category: VehicleCategory;
    plate: string;
    make: string;
    model: string;
    year: number;
    color: string;
    fuelType?: PilotOnboardingVehicle["fuelType"];
    ownership?: PilotOnboardingVehicle["ownership"];
  } | null;
  /** Override document statuses by type. Unlisted required docs default from verification. */
  documentOverrides?: Partial<Record<PilotDocumentRecord["type"], Partial<PilotDocumentRecord>>>;
  selfieOverride?: Partial<PilotIdentitySelfie>;
  bankOverride?: Partial<PilotBankDetails> | null;
  licenceOverride?: Partial<PilotDrivingLicence> | null;
  locationOverride?: PilotLiveLocation | null;
  applicationConsentAccepted?: boolean;
};

function mapRideCategoryToPilot(category: VehicleCategory): PilotOnboardingCategoryId {
  if (category === "bike" || category === "auto") return category;
  return "cab";
}

function defaultDocStatus(verification: VerificationStatus): PilotDocumentStatus {
  switch (verification) {
    case "approved":
      return "verified";
    case "rejected":
      return "rejected";
    case "needs_correction":
      return "rejected";
    case "under_review":
      return "under_review";
    default:
      return "uploaded";
  }
}

function buildDocuments(
  categoryId: PilotOnboardingCategoryId | "",
  ownership: PilotOnboardingVehicle["ownership"],
  verification: VerificationStatus,
  overrides?: SeedInput["documentOverrides"],
): PilotDocumentRecord[] {
  const types = requiredDocumentTypes(categoryId, ownership);
  const baseStatus = defaultDocStatus(verification);
  return types.map((type) => {
    const override = overrides?.[type];
    const status = override?.status ?? baseStatus;
    return {
      type,
      status,
      fileName:
        override?.fileName ??
        (status === "missing" ? undefined : `${type.replace(/_/g, "-")}.jpg`),
      uploadedAt: override?.uploadedAt ?? (status === "missing" ? undefined : undefined),
      expiryDate: override?.expiryDate,
      rejectionReason: override?.rejectionReason,
    };
  });
}

function hyderabadPin(label: string, updatedAt: string): PilotLiveLocation {
  // Demo pins around central Hyderabad (matches Pilot app demo map area).
  const jitter = (seed: number) => ((seed % 17) - 8) * 0.004;
  const n = label.length + updatedAt.length;
  return {
    latitude: 17.4156 + jitter(n),
    longitude: 78.4346 + jitter(n * 3),
    label,
    updatedAt,
  };
}

export function buildPilotOnboarding(seed: SeedInput): PilotOnboarding {
  const categoryId = seed.vehicle ? mapRideCategoryToPilot(seed.vehicle.category) : "";
  const ownership = seed.vehicle?.ownership ?? (seed.vehicle ? "owned" : "");
  const vehicle: PilotOnboardingVehicle | null = seed.vehicle
    ? {
        categoryId,
        registrationNumber: seed.vehicle.plate,
        make: seed.vehicle.make,
        model: seed.vehicle.model,
        year: String(seed.vehicle.year),
        fuelType: seed.vehicle.fuelType ?? "petrol",
        color: seed.vehicle.color,
        ownership,
      }
    : null;

  const documents = buildDocuments(categoryId, ownership, seed.verification, seed.documentOverrides);

  const selfieStatus: PilotIdentitySelfie["status"] =
    seed.selfieOverride?.status ??
    (seed.verification === "needs_correction"
      ? "rejected"
      : seed.verification === "approved"
        ? "uploaded"
        : seed.verification === "under_review"
          ? "under_review"
          : "uploaded");

  const identitySelfie: PilotIdentitySelfie = {
    status: selfieStatus,
    uploadedAt: seed.selfieOverride?.uploadedAt ?? seed.joinedAt,
    rejectionReason: seed.selfieOverride?.rejectionReason,
    previewLabel: seed.selfieOverride?.previewLabel ?? "Live selfie capture",
  };

  const bank: PilotBankDetails | null =
    seed.bankOverride === null
      ? null
      : {
          accountHolderName: seed.bankOverride?.accountHolderName ?? seed.name,
          bankName: seed.bankOverride?.bankName ?? "HDFC Bank",
          accountNumberLast4: seed.bankOverride?.accountNumberLast4 ?? seed.phone.slice(-4),
          ifsc: seed.bankOverride?.ifsc ?? "HDFC0001234",
          upiId: seed.bankOverride?.upiId ?? `${seed.phone}@oksbi`,
          consentAccepted: seed.bankOverride?.consentAccepted ?? true,
          status:
            seed.bankOverride?.status ??
            (seed.verification === "approved" ? "verified" : "pending"),
        };

  const licence: PilotDrivingLicence | null =
    seed.licenceOverride === null
      ? null
      : {
          holderName: seed.licenceOverride?.holderName ?? seed.name,
          licenceNumber: seed.licenceOverride?.licenceNumber ?? `TS14${seed.phone.slice(2)}`,
          issuingState: seed.licenceOverride?.issuingState ?? "Telangana",
          issueDate: seed.licenceOverride?.issueDate ?? "2018-04-01",
          expiryDate: seed.licenceOverride?.expiryDate ?? "2028-04-01",
          vehicleClass: seed.licenceOverride?.vehicleClass ?? (categoryId === "bike" ? "MCWG" : "LMV"),
        };

  const last4 = seed.phone.slice(-4);
  const submittedAt =
    seed.verification === "pending" ? null : seed.joinedAt;

  let lastKnownLocation: PilotLiveLocation | null = seed.locationOverride ?? null;
  if (lastKnownLocation === null && (seed.status === "online" || seed.status === "busy")) {
    lastKnownLocation = hyderabadPin(
      seed.city === "Bengaluru" ? "Indiranagar, Bengaluru" : "HITEC City, Hyderabad",
      new Date().toISOString(),
    );
  }

  return {
    applicationReference: submittedAt ? `FLT-APP-${last4}-${seed.id.slice(-4)}` : null,
    submittedAt,
    applicationConsentAccepted: seed.applicationConsentAccepted ?? Boolean(submittedAt),
    sheEligible: seed.sheEligible ?? false,
    preferredLanguage: seed.preferredLanguage ?? "en",
    dateOfBirth: seed.dateOfBirth ?? "1992-06-15",
    gender: seed.gender ?? "male",
    operatingCity: seed.city,
    drivingLicence: licence,
    vehicle,
    documents,
    identitySelfie,
    bank,
    lastKnownLocation,
  };
}

/** Labels for list “Missing docs” column from structured onboarding docs + selfie. */
export function missingDocLabels(onboarding: PilotOnboarding): string[] {
  const missing = onboarding.documents
    .filter((d) => d.status === "missing" || d.status === "rejected" || d.status === "expired")
    .map((d) =>
      d.status === "rejected"
        ? `${pilotDocumentLabel(d.type)} (rejected)`
        : d.status === "expired"
          ? `${pilotDocumentLabel(d.type)} (expired)`
          : pilotDocumentLabel(d.type),
    );
  if (
    onboarding.identitySelfie.status === "missing" ||
    onboarding.identitySelfie.status === "rejected"
  ) {
    missing.push(
      onboarding.identitySelfie.status === "rejected"
        ? "Live selfie (rejected)"
        : "Live selfie",
    );
  }
  return missing;
}
