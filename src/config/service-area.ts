import { getEnabledRideCategories } from "@/config/ride-categories";
import { RIDE_MODES } from "@/config/ride-modes";
import { OPERATIONAL_ZONES } from "@/config/zones";

/**
 * Hyderabad is the only configured FLYT launch service area in this Admin demo.
 * Bengaluru, Mumbai, and other cities are intentionally omitted.
 */
export const HYDERABAD_SERVICE_AREA = {
  id: "SA-HYD",
  city: "Hyderabad",
  state: "Telangana",
  country: "India",
  status: "active" as const,
  launchCity: true,
  slug: "hyderabad",
  zones: OPERATIONAL_ZONES,
  rideCategories: getEnabledRideCategories(),
  modes: RIDE_MODES,
  /** Map polygon editing is not available in this frontend demo. */
  mapEditingSupported: false,
  /** Zone activate/deactivate requires backend configuration APIs. */
  zoneActivationSupported: false,
} as const;

export type ServiceAreaSummary = typeof HYDERABAD_SERVICE_AREA;

export function getConfiguredServiceAreas(): ServiceAreaSummary[] {
  return [HYDERABAD_SERVICE_AREA];
}

export function getHyderabadServiceArea(): ServiceAreaSummary {
  return HYDERABAD_SERVICE_AREA;
}
