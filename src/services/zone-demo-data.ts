/**
 * DEMO DATA — Hyderabad zone operations fixtures.
 * Not live production statistics. Values are deterministic for UI demos
 * and KPI calculation verification. Always label as DEMO DATA in the UI.
 */

import { OPERATIONAL_ZONES } from "@/config/zones";
import type {
  DailyOnboardingPoint,
  DemandLevel,
  HourlyRidePoint,
  VehicleCategory,
  ZoneActivityEvent,
  ZoneId,
} from "@/types";

export type ZoneDemoSeed = {
  zoneId: ZoneId;
  customers: {
    totalRegistered: number;
    onboardedToday: number;
    pending: number;
    incomplete: number;
  };
  pilots: {
    totalRegistered: number;
    onboardedToday: number;
    pendingVerification: number;
    approvedReady: number;
    currentlyOnline: number;
    onActiveTrip: number;
  };
  rides: {
    totalToday: number;
    completed: number;
    active: number;
    cancelled: number;
    acceptedOffers: number;
    totalOffers: number;
    avgPickupMinutes: number;
    grossBookingValueInr: number;
    avgTripDistanceKm: number;
    avgTripDurationMinutes: number;
  };
  demand: {
    demandLevel: DemandLevel;
    availableEligiblePilots: number;
    activeRideRequests: number;
    peakRideHours: string[];
    mostRequestedVehicleCategory: VehicleCategory;
  };
  /** Relative hourly weights (normalized in the service). */
  hourlyWeights: number[];
  vehicleShares: Record<VehicleCategory, number>;
};

const HOURS = [
  "00",
  "02",
  "04",
  "06",
  "08",
  "10",
  "12",
  "14",
  "16",
  "18",
  "20",
  "22",
] as const;

export const ZONE_DEMO_HOURS = [...HOURS];

const DEFAULT_SHARES: Record<VehicleCategory, number> = {
  auto: 38,
  bike: 22,
  mini: 20,
  sedan: 12,
  suv: 8,
};

const CATEGORY_ROTATION: VehicleCategory[] = ["auto", "bike", "mini", "sedan", "suv"];

function hashZone(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

function generateSeed(zoneId: ZoneId, index: number): ZoneDemoSeed {
  const h = hashZone(zoneId);
  const scale = 0.45 + (h % 55) / 100;
  const customersTotal = Math.round(6200 + scale * 11000);
  const pilotsTotal = Math.round(140 + scale * 280);
  const ridesToday = Math.round(120 + scale * 380);
  const completed = Math.round(ridesToday * 0.84);
  const cancelled = Math.round(ridesToday * 0.08);
  const active = Math.max(0, ridesToday - completed - cancelled);
  const approved = Math.round(pilotsTotal * 0.86);
  const online = Math.round(approved * (0.22 + (h % 10) / 100));
  const pending = Math.round(28 + (h % 40));
  const incomplete = Math.round(18 + (h % 30));
  const pendingVerification = Math.round(6 + (h % 14));
  const demandLevel: DemandLevel =
    scale > 0.85 ? "high" : scale > 0.6 ? "moderate" : "low";
  const topCategory = CATEGORY_ROTATION[(index + h) % CATEGORY_ROTATION.length];

  return {
    zoneId,
    customers: {
      totalRegistered: customersTotal,
      onboardedToday: Math.round(12 + scale * 50),
      pending,
      incomplete,
    },
    pilots: {
      totalRegistered: pilotsTotal,
      onboardedToday: Math.max(1, Math.round(2 + scale * 6)),
      pendingVerification,
      approvedReady: approved,
      currentlyOnline: online,
      onActiveTrip: Math.round(online * 0.28),
    },
    rides: {
      totalToday: ridesToday,
      completed,
      active,
      cancelled,
      acceptedOffers: Math.round(ridesToday * 0.92),
      totalOffers: Math.round(ridesToday * 1.04),
      avgPickupMinutes: Math.round((5.2 + (h % 30) / 10) * 10) / 10,
      grossBookingValueInr: Math.round(ridesToday * (980 + (h % 400))),
      avgTripDistanceKm: Math.round((5.5 + (h % 40) / 10) * 10) / 10,
      avgTripDurationMinutes: Math.round(16 + (h % 14)),
    },
    demand: {
      demandLevel,
      availableEligiblePilots: Math.max(8, online - Math.round(online * 0.28)),
      activeRideRequests: Math.round(8 + scale * 30),
      peakRideHours: scale > 0.8 ? ["09", "18", "20"] : ["18", "20"],
      mostRequestedVehicleCategory: topCategory,
    },
    hourlyWeights: [
      6 + (h % 6),
      4,
      3 + (h % 3),
      10 + (h % 8),
      20 + (h % 16),
      26 + (h % 14),
      30 + (h % 12),
      28 + (h % 10),
      34 + (h % 12),
      42 + (h % 16),
      32 + (h % 12),
      18 + (h % 10),
    ],
    vehicleShares: {
      ...DEFAULT_SHARES,
      [topCategory]: DEFAULT_SHARES[topCategory] + 8,
    },
  };
}

/** Hand-tuned seeds for high-traffic corridors; remaining zones are generated. */
const HAND_TUNED: Partial<Record<ZoneId, ZoneDemoSeed>> = {
  "jubilee-hills": {
    zoneId: "jubilee-hills",
    customers: {
      totalRegistered: 11240,
      onboardedToday: 38,
      pending: 64,
      incomplete: 41,
    },
    pilots: {
      totalRegistered: 286,
      onboardedToday: 4,
      pendingVerification: 11,
      approvedReady: 248,
      currentlyOnline: 72,
      onActiveTrip: 19,
    },
    rides: {
      totalToday: 312,
      completed: 268,
      active: 14,
      cancelled: 22,
      acceptedOffers: 290,
      totalOffers: 318,
      avgPickupMinutes: 6.4,
      grossBookingValueInr: 428600,
      avgTripDistanceKm: 7.2,
      avgTripDurationMinutes: 22,
    },
    demand: {
      demandLevel: "moderate",
      availableEligiblePilots: 53,
      activeRideRequests: 18,
      peakRideHours: ["18", "20"],
      mostRequestedVehicleCategory: "sedan",
    },
    hourlyWeights: [8, 5, 4, 12, 22, 28, 34, 31, 38, 46, 36, 24],
    vehicleShares: { auto: 34, bike: 18, mini: 22, sedan: 18, suv: 8 },
  },
  "banjara-hills": {
    zoneId: "banjara-hills",
    customers: {
      totalRegistered: 9840,
      onboardedToday: 29,
      pending: 52,
      incomplete: 33,
    },
    pilots: {
      totalRegistered: 244,
      onboardedToday: 3,
      pendingVerification: 9,
      approvedReady: 211,
      currentlyOnline: 58,
      onActiveTrip: 15,
    },
    rides: {
      totalToday: 264,
      completed: 226,
      active: 11,
      cancelled: 19,
      acceptedOffers: 241,
      totalOffers: 272,
      avgPickupMinutes: 7.1,
      grossBookingValueInr: 356200,
      avgTripDistanceKm: 6.8,
      avgTripDurationMinutes: 20,
    },
    demand: {
      demandLevel: "moderate",
      availableEligiblePilots: 43,
      activeRideRequests: 14,
      peakRideHours: ["18", "19"],
      mostRequestedVehicleCategory: "auto",
    },
    hourlyWeights: [6, 4, 3, 10, 20, 26, 30, 28, 34, 42, 32, 20],
    vehicleShares: { auto: 40, bike: 16, mini: 24, sedan: 12, suv: 8 },
  },
  gachibowli: {
    zoneId: "gachibowli",
    customers: {
      totalRegistered: 14620,
      onboardedToday: 54,
      pending: 78,
      incomplete: 49,
    },
    pilots: {
      totalRegistered: 368,
      onboardedToday: 7,
      pendingVerification: 16,
      approvedReady: 318,
      currentlyOnline: 94,
      onActiveTrip: 28,
    },
    rides: {
      totalToday: 418,
      completed: 352,
      active: 22,
      cancelled: 28,
      acceptedOffers: 386,
      totalOffers: 430,
      avgPickupMinutes: 5.8,
      grossBookingValueInr: 512400,
      avgTripDistanceKm: 8.1,
      avgTripDurationMinutes: 24,
    },
    demand: {
      demandLevel: "high",
      availableEligiblePilots: 66,
      activeRideRequests: 31,
      peakRideHours: ["09", "18"],
      mostRequestedVehicleCategory: "auto",
    },
    hourlyWeights: [10, 6, 5, 18, 36, 40, 38, 34, 42, 52, 40, 28],
    vehicleShares: { auto: 42, bike: 20, mini: 18, sedan: 12, suv: 8 },
  },
  "hitec-city": {
    zoneId: "hitec-city",
    customers: {
      totalRegistered: 16880,
      onboardedToday: 61,
      pending: 92,
      incomplete: 55,
    },
    pilots: {
      totalRegistered: 412,
      onboardedToday: 8,
      pendingVerification: 18,
      approvedReady: 356,
      currentlyOnline: 108,
      onActiveTrip: 34,
    },
    rides: {
      totalToday: 486,
      completed: 408,
      active: 28,
      cancelled: 32,
      acceptedOffers: 452,
      totalOffers: 498,
      avgPickupMinutes: 5.2,
      grossBookingValueInr: 598800,
      avgTripDistanceKm: 7.6,
      avgTripDurationMinutes: 21,
    },
    demand: {
      demandLevel: "high",
      availableEligiblePilots: 74,
      activeRideRequests: 38,
      peakRideHours: ["09", "18", "20"],
      mostRequestedVehicleCategory: "auto",
    },
    hourlyWeights: [12, 7, 6, 22, 44, 48, 42, 38, 46, 58, 48, 32],
    vehicleShares: { auto: 44, bike: 18, mini: 20, sedan: 10, suv: 8 },
  },
  rgia: {
    zoneId: "rgia",
    customers: {
      totalRegistered: 8420,
      onboardedToday: 22,
      pending: 38,
      incomplete: 24,
    },
    pilots: {
      totalRegistered: 198,
      onboardedToday: 2,
      pendingVerification: 8,
      approvedReady: 172,
      currentlyOnline: 48,
      onActiveTrip: 16,
    },
    rides: {
      totalToday: 286,
      completed: 242,
      active: 18,
      cancelled: 16,
      acceptedOffers: 268,
      totalOffers: 292,
      avgPickupMinutes: 9.4,
      grossBookingValueInr: 612400,
      avgTripDistanceKm: 28.4,
      avgTripDurationMinutes: 48,
    },
    demand: {
      demandLevel: "high",
      availableEligiblePilots: 32,
      activeRideRequests: 22,
      peakRideHours: ["06", "10", "22"],
      mostRequestedVehicleCategory: "suv",
    },
    hourlyWeights: [18, 14, 10, 28, 36, 32, 28, 26, 30, 34, 38, 42],
    vehicleShares: { auto: 18, bike: 8, mini: 22, sedan: 24, suv: 28 },
  },
};

export const zoneDemoSeeds: Record<ZoneId, ZoneDemoSeed> = Object.fromEntries(
  OPERATIONAL_ZONES.map((zone, index) => [
    zone.id,
    HAND_TUNED[zone.id] ?? generateSeed(zone.id, index),
  ]),
) as Record<ZoneId, ZoneDemoSeed>;

/** Scale factors relative to "today" for demo date presets. */
export const DATE_PRESET_SCALE: Record<string, number> = {
  today: 1,
  yesterday: 0.94,
  last_7_days: 6.4,
  last_30_days: 26.5,
  custom: 3.2,
};

export function buildHourlySeries(weights: number[], totalRides: number): HourlyRidePoint[] {
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  return HOURS.map((hour, i) => ({
    hour,
    rides: Math.max(0, Math.round((weights[i] / sum) * totalRides)),
  }));
}

export function buildOnboardingTrend(
  zoneId: ZoneId,
  days: number,
): DailyOnboardingPoint[] {
  const seed = zoneDemoSeeds[zoneId];
  const points: DailyOnboardingPoint[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const wave = 0.75 + ((i * 7 + zoneId.length) % 5) * 0.08;
    points.push({
      date: d.toISOString().slice(0, 10),
      customers: Math.max(1, Math.round(seed.customers.onboardedToday * wave)),
      pilots: Math.max(0, Math.round(seed.pilots.onboardedToday * wave)),
    });
  }
  return points;
}

export const zoneDemoEvents: ZoneActivityEvent[] = [
  {
    id: "ZE-01",
    zoneId: "hitec-city",
    at: new Date(Date.now() - 12 * 60_000).toISOString(),
    title: "Demand spiked to High near Cyber Towers",
    category: "ops",
    tone: "warning",
  },
  {
    id: "ZE-02",
    zoneId: "gachibowli",
    at: new Date(Date.now() - 28 * 60_000).toISOString(),
    title: "7 Pilots approved and ready to drive",
    category: "verification",
    tone: "success",
  },
  {
    id: "ZE-03",
    zoneId: "jubilee-hills",
    at: new Date(Date.now() - 45 * 60_000).toISOString(),
    title: "Customer onboarding backlog cleared (−12 pending)",
    category: "onboarding",
    tone: "success",
  },
  {
    id: "ZE-04",
    zoneId: "banjara-hills",
    at: new Date(Date.now() - 70 * 60_000).toISOString(),
    title: "Cancellation rate edged above 7% for the hour",
    category: "rides",
    tone: "warning",
  },
  {
    id: "ZE-05",
    zoneId: "hitec-city",
    at: new Date(Date.now() - 95 * 60_000).toISOString(),
    title: "18 Pilot documents awaiting verification",
    category: "verification",
    tone: "info",
  },
  {
    id: "ZE-06",
    zoneId: "gachibowli",
    at: new Date(Date.now() - 120 * 60_000).toISOString(),
    title: "Peak lunch hour — 52 rides completed",
    category: "rides",
    tone: "info",
  },
  {
    id: "ZE-07",
    zoneId: "jubilee-hills",
    at: new Date(Date.now() - 160 * 60_000).toISOString(),
    title: "4 new customers completed onboarding",
    category: "onboarding",
    tone: "success",
  },
  {
    id: "ZE-08",
    zoneId: "banjara-hills",
    at: new Date(Date.now() - 200 * 60_000).toISOString(),
    title: "Supply tightened — available Pilots below target",
    category: "ops",
    tone: "danger",
  },
  {
    id: "ZE-09",
    zoneId: "rgia",
    at: new Date(Date.now() - 35 * 60_000).toISOString(),
    title: "Airport SUV demand elevated — night arrivals",
    category: "ops",
    tone: "warning",
  },
  {
    id: "ZE-10",
    zoneId: "madhapur",
    at: new Date(Date.now() - 55 * 60_000).toISOString(),
    title: "Auto category share led evening bookings",
    category: "rides",
    tone: "info",
  },
];
