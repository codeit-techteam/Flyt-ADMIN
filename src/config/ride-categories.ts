/**
 * Canonical ride / vehicle categories for FLYT Admin.
 *
 * Source of truth mirrors the customer booking UI (`FLYT/constants/vehicles.ts`):
 *   bike | auto | mini | sedan | suv
 *
 * Pilot Hyderabad onboarding (`FLYT-Pilot` compliance) enables auto, bike, and cab.
 * Pilot `cab` is the umbrella for customer mini / sedan / suv during vehicle selection.
 *
 * SHE and Silver are rider/dispatch modes — see `ride-modes.ts`. They are never
 * vehicle categories. `XL` is not a FLYT category (unknown API strings fall back
 * to sedan artwork in the customer app).
 */

export type RideCategoryId = "bike" | "auto" | "mini" | "sedan" | "suv";

/** Pilot onboarding / rate-card category IDs. */
export type PilotCategoryId = "bike" | "auto" | "cab" | "sedan" | "suv";

export type RideCategoryConfig = {
  id: RideCategoryId;
  /** Customer-facing booking label (matches FLYT app). */
  label: string;
  shortLabel: string;
  description: string;
  capacity: number;
  /** Whether this category appears as a bookable option in the customer app. */
  enabledInCustomerBooking: boolean;
  /**
   * Pilot onboarding category that covers this ride type in Hyderabad.
   * mini/sedan/suv map to the FLYT Cab card.
   */
  pilotCategoryId: PilotCategoryId;
  pilotLabel: string;
  enabledInPilotHyderabad: boolean;
};

export const RIDE_CATEGORIES: RideCategoryConfig[] = [
  {
    id: "auto",
    label: "flyt Auto",
    shortLabel: "Auto",
    description: "Doorstep autos, no haggling",
    capacity: 3,
    enabledInCustomerBooking: true,
    pilotCategoryId: "auto",
    pilotLabel: "FLYT Auto",
    enabledInPilotHyderabad: true,
  },
  {
    id: "bike",
    label: "flyt Bike",
    shortLabel: "Bike",
    description: "Beat the traffic, solo rides",
    capacity: 1,
    enabledInCustomerBooking: true,
    pilotCategoryId: "bike",
    pilotLabel: "FLYT Bike Taxi",
    enabledInPilotHyderabad: true,
  },
  {
    id: "mini",
    label: "flyt Mini",
    shortLabel: "Mini",
    description: "Compact AC hatchbacks",
    capacity: 4,
    enabledInCustomerBooking: true,
    pilotCategoryId: "cab",
    pilotLabel: "FLYT Cab",
    enabledInPilotHyderabad: true,
  },
  {
    id: "sedan",
    label: "flyt Sedan",
    shortLabel: "Sedan",
    description: "Roomy sedans, extra boot space",
    capacity: 4,
    enabledInCustomerBooking: true,
    pilotCategoryId: "cab",
    pilotLabel: "FLYT Cab",
    enabledInPilotHyderabad: true,
  },
  {
    id: "suv",
    label: "flyt SUV",
    shortLabel: "SUV",
    description: "Family & group rides",
    capacity: 6,
    enabledInCustomerBooking: true,
    pilotCategoryId: "cab",
    pilotLabel: "FLYT Cab",
    enabledInPilotHyderabad: true,
  },
];

/** Display order matching the customer ServiceSelector. */
export const RIDE_CATEGORY_ORDER: RideCategoryId[] = [
  "auto",
  "bike",
  "mini",
  "sedan",
  "suv",
];

export const RIDE_CATEGORY_IDS = RIDE_CATEGORY_ORDER;

const byId = Object.fromEntries(RIDE_CATEGORIES.map((c) => [c.id, c])) as Record<
  RideCategoryId,
  RideCategoryConfig
>;

export function getRideCategory(id: string): RideCategoryConfig | undefined {
  return byId[id as RideCategoryId];
}

export function rideCategoryLabel(id: string | null | undefined): string {
  if (!id) return "—";
  return getRideCategory(id)?.label ?? "Unknown category";
}

export function rideCategoryShortLabel(id: string | null | undefined): string {
  if (!id) return "—";
  return getRideCategory(id)?.shortLabel ?? "Unknown";
}

export function isRideCategoryId(value: string): value is RideCategoryId {
  return value in byId;
}

/** Categories enabled for Hyderabad service-area summaries. */
export function getEnabledRideCategories(): RideCategoryConfig[] {
  return RIDE_CATEGORY_ORDER.map((id) => byId[id]).filter(
    (c) => c.enabledInCustomerBooking,
  );
}
