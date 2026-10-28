/**
 * Rider experience / dispatch modes — not vehicle categories.
 *
 * Customer app (`FLYT/domain/customerExperience.ts`): normal | she | silver
 * Labels (`modeLabel`): Standard | SHE | Silver
 *
 * Pilot app (`FLYT-Pilot`): DispatchMode = standard | she (no Silver dispatch).
 */

export type RideModeId = "standard" | "she" | "silver";

export type RideModeConfig = {
  id: RideModeId;
  label: string;
  description: string;
  /** Supported as a customer-requested experience in FLYT. */
  customerSupported: boolean;
  /** Supported as a Pilot dispatch preference in FLYT-Pilot. */
  pilotDispatchSupported: boolean;
  /** High-level eligibility note derived from the customer app. */
  eligibility: string;
};

export const RIDE_MODES: RideModeConfig[] = [
  {
    id: "standard",
    label: "Standard",
    description: "Default rider experience and Pilot dispatch mode.",
    customerSupported: true,
    pilotDispatchSupported: true,
    eligibility: "Available to all riders and Pilots.",
  },
  {
    id: "she",
    label: "SHE Mode",
    description:
      "Women-preferred matching with SHE presentation. Not a vehicle type.",
    customerSupported: true,
    pilotDispatchSupported: true,
    eligibility:
      "Customer: female riders (and combined SHE+Silver when 60+). Pilot dispatch: verified female Pilots only.",
  },
  {
    id: "silver",
    label: "Silver Mode",
    description:
      "Senior assistance, larger UI, and fare policies. Not a vehicle type.",
    customerSupported: true,
    pilotDispatchSupported: false,
    eligibility:
      "Customer: riders aged 60+. Pilot app has no separate Silver dispatch mode.",
  },
];

export function rideModeLabel(id: string | null | undefined): string {
  if (!id) return "—";
  return RIDE_MODES.find((m) => m.id === id)?.label ?? "Unknown mode";
}
