import type { PilotDocumentStatus, PilotDocumentTypeId, PilotOnboardingCategoryId } from "@/types";
import type { BadgeTone } from "@/lib/status";

/** Labels aligned with FLYT-Pilot `constants/compliance.ts`. */
export const PILOT_DOCUMENT_LABELS: Record<PilotDocumentTypeId, string> = {
  driving_licence: "Driving licence (front)",
  driving_licence_back: "Driving licence (back)",
  registration_certificate: "Registration certificate (RC)",
  vehicle_insurance: "Vehicle insurance",
  commercial_permit: "Commercial / contract carriage permit",
  fitness_certificate: "Fitness certificate",
  identity_kyc: "Identity / KYC",
  ownership_authorisation: "Ownership / lease authorisation",
};

/** Compact labels for dense list columns (Pilots table “Missing docs”). */
export const PILOT_DOCUMENT_SHORT_LABELS: Record<PilotDocumentTypeId, string> = {
  driving_licence: "DL front",
  driving_licence_back: "DL back",
  registration_certificate: "RC",
  vehicle_insurance: "Insurance",
  commercial_permit: "Permit",
  fitness_certificate: "Fitness",
  identity_kyc: "KYC",
  ownership_authorisation: "Ownership",
};

export const PILOT_CATEGORY_LABELS: Record<PilotOnboardingCategoryId, string> = {
  bike: "FLYT Bike Taxi",
  auto: "FLYT Auto",
  cab: "FLYT Cab",
  sedan: "FLYT Sedan",
  suv: "FLYT SUV",
};

/** Required docs by Pilot onboarding category (Hyderabad compliance). */
export function requiredDocumentTypes(
  categoryId: PilotOnboardingCategoryId | "",
  ownership: "owned" | "leased" | "authorised" | "",
): PilotDocumentTypeId[] {
  const base: PilotDocumentTypeId[] = [
    "driving_licence",
    "driving_licence_back",
    "registration_certificate",
    "vehicle_insurance",
    "identity_kyc",
  ];
  if (categoryId === "auto" || categoryId === "cab" || categoryId === "sedan" || categoryId === "suv") {
    base.push("commercial_permit", "fitness_certificate");
  }
  if (ownership === "leased" || ownership === "authorised") {
    base.push("ownership_authorisation");
  }
  return base;
}

export function pilotDocumentLabel(type: PilotDocumentTypeId): string {
  return PILOT_DOCUMENT_LABELS[type];
}

export function pilotDocumentShortLabel(type: PilotDocumentTypeId): string {
  return PILOT_DOCUMENT_SHORT_LABELS[type];
}

/** Vehicle / RC compliance docs collected during Pilot onboarding. */
export const VEHICLE_ONBOARDING_DOCUMENT_TYPES: PilotDocumentTypeId[] = [
  "registration_certificate",
  "vehicle_insurance",
  "commercial_permit",
  "fitness_certificate",
  "ownership_authorisation",
];

export function isVehicleOnboardingDocument(type: PilotDocumentTypeId): boolean {
  return VEHICLE_ONBOARDING_DOCUMENT_TYPES.includes(type);
}

export function pilotCategoryLabel(id: PilotOnboardingCategoryId | "" | null | undefined): string {
  if (!id) return "—";
  return PILOT_CATEGORY_LABELS[id] ?? id;
}

export const documentStatusLabel: Record<PilotDocumentStatus, string> = {
  missing: "Missing",
  uploaded: "Uploaded",
  under_review: "Under review",
  verified: "Verified",
  rejected: "Rejected",
  expired: "Expired",
};

export function documentStatusTone(status: PilotDocumentStatus): BadgeTone {
  switch (status) {
    case "verified":
      return "success";
    case "rejected":
    case "expired":
      return "danger";
    case "missing":
      return "warning";
    case "under_review":
    case "uploaded":
      return "info";
    default:
      return "neutral";
  }
}

export const genderLabel: Record<string, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
  prefer_not_to_say: "Prefer not to say",
  "": "—",
};

export const languageLabel: Record<"en" | "hi" | "ur", string> = {
  en: "English",
  hi: "Hindi",
  ur: "Urdu",
};

export const ownershipLabel: Record<string, string> = {
  owned: "Owned",
  leased: "Leased",
  authorised: "Authorised",
  "": "—",
};

export const fuelLabel: Record<string, string> = {
  petrol: "Petrol",
  diesel: "Diesel",
  cng: "CNG",
  electric: "Electric",
  hybrid: "Hybrid",
  "": "—",
};

export const bankStatusLabel: Record<"draft" | "pending" | "verified" | "demo", string> = {
  draft: "Draft",
  pending: "Pending",
  verified: "Verified",
  demo: "Demo",
};
