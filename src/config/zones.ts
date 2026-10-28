import type { OperationalZone, ZoneId } from "@/types";

/**
 * Canonical Hyderabad operational zones for Service Areas and analytics.
 * IDs are stable kebab-case keys used in routes and demo fixtures.
 */
export const OPERATIONAL_ZONES: OperationalZone[] = [
  {
    id: "hitec-city",
    name: "HITEC City",
    city: "Hyderabad",
    state: "Telangana",
    status: "active",
    shortLabel: "HC",
  },
  {
    id: "madhapur",
    name: "Madhapur",
    city: "Hyderabad",
    state: "Telangana",
    status: "active",
    shortLabel: "MD",
  },
  {
    id: "gachibowli",
    name: "Gachibowli",
    city: "Hyderabad",
    state: "Telangana",
    status: "active",
    shortLabel: "GB",
  },
  {
    id: "financial-district",
    name: "Financial District",
    city: "Hyderabad",
    state: "Telangana",
    status: "active",
    shortLabel: "FD",
  },
  {
    id: "kondapur",
    name: "Kondapur",
    city: "Hyderabad",
    state: "Telangana",
    status: "active",
    shortLabel: "KP",
  },
  {
    id: "jubilee-hills",
    name: "Jubilee Hills",
    city: "Hyderabad",
    state: "Telangana",
    status: "active",
    shortLabel: "JH",
  },
  {
    id: "banjara-hills",
    name: "Banjara Hills",
    city: "Hyderabad",
    state: "Telangana",
    status: "active",
    shortLabel: "BH",
  },
  {
    id: "ameerpet",
    name: "Ameerpet",
    city: "Hyderabad",
    state: "Telangana",
    status: "active",
    shortLabel: "AM",
  },
  {
    id: "begumpet",
    name: "Begumpet",
    city: "Hyderabad",
    state: "Telangana",
    status: "active",
    shortLabel: "BG",
  },
  {
    id: "secunderabad",
    name: "Secunderabad",
    city: "Hyderabad",
    state: "Telangana",
    status: "active",
    shortLabel: "SC",
  },
  {
    id: "necklace-road",
    name: "Necklace Road",
    city: "Hyderabad",
    state: "Telangana",
    status: "active",
    shortLabel: "NR",
  },
  {
    id: "kukatpally",
    name: "Kukatpally",
    city: "Hyderabad",
    state: "Telangana",
    status: "active",
    shortLabel: "KK",
  },
  {
    id: "charminar",
    name: "Charminar",
    city: "Hyderabad",
    state: "Telangana",
    status: "active",
    shortLabel: "CH",
  },
  {
    id: "mindspace",
    name: "Mindspace",
    city: "Hyderabad",
    state: "Telangana",
    status: "active",
    shortLabel: "MS",
  },
  {
    id: "inorbit-mall",
    name: "Inorbit Mall",
    city: "Hyderabad",
    state: "Telangana",
    status: "active",
    shortLabel: "IM",
  },
  {
    id: "durgam-cheruvu",
    name: "Durgam Cheruvu",
    city: "Hyderabad",
    state: "Telangana",
    status: "active",
    shortLabel: "DC",
  },
  {
    id: "uppal",
    name: "Uppal",
    city: "Hyderabad",
    state: "Telangana",
    status: "active",
    shortLabel: "UP",
  },
  {
    id: "lb-nagar",
    name: "LB Nagar",
    city: "Hyderabad",
    state: "Telangana",
    status: "active",
    shortLabel: "LB",
  },
  {
    id: "rgia",
    name: "Rajiv Gandhi International Airport",
    city: "Hyderabad",
    state: "Telangana",
    status: "active",
    shortLabel: "RG",
  },
];

export const ALL_ZONES_ID = "all" as const;
export type ZoneSelectionId = ZoneId | typeof ALL_ZONES_ID;

export const ALL_ZONES_OPTION = {
  id: ALL_ZONES_ID,
  name: "All Hyderabad Zones",
  city: "Hyderabad",
  state: "Telangana",
  status: "active" as const,
  shortLabel: "ALL",
};

export function getZoneById(id: string): OperationalZone | undefined {
  return OPERATIONAL_ZONES.find((z) => z.id === id);
}

export function getZoneLabel(id: ZoneSelectionId): string {
  if (id === ALL_ZONES_ID) return ALL_ZONES_OPTION.name;
  return getZoneById(id)?.name ?? id;
}

export const ZONE_IDS = OPERATIONAL_ZONES.map((z) => z.id);

export function isZoneId(value: string): value is ZoneId {
  return ZONE_IDS.includes(value as ZoneId);
}

/**
 * High-traffic corridors surfaced on the dashboard zone-ops preview.
 * Full list lives in OPERATIONAL_ZONES / Service Areas.
 */
export const FEATURED_ZONE_IDS: ZoneId[] = [
  "hitec-city",
  "gachibowli",
  "jubilee-hills",
  "banjara-hills",
];

export const FEATURED_ZONES = OPERATIONAL_ZONES.filter((z) =>
  FEATURED_ZONE_IDS.includes(z.id),
);
