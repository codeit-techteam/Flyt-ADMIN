/**
 * Zone analytics service layer.
 *
 * Currently backed by DEMO DATA fixtures (`zone-demo-data.ts`).
 * When a backend is available, replace seed lookups with API calls while
 * keeping the same return shapes.
 *
 * Required production endpoints (document for future integration):
 * - GET /analytics/zones → OperationalZone[]
 * - GET /analytics/zones/:zoneId?from=&to= → ZoneAnalytics
 * - GET /analytics/zones/comparison?from=&to= → ZoneComparisonRow[]
 * - GET /analytics/zones/report?from=&to=&q= → ZoneReportRow[]
 */

import { ALL_ZONES_ID, getZoneById, getZoneLabel, OPERATIONAL_ZONES } from "@/config/zones";
import { periodDayCount, resolveDateRange } from "@/lib/date-range";
import { ratePct } from "@/lib/metrics";
import { getDataMode } from "@/services/data";
import {
  buildHourlySeries,
  buildOnboardingTrend,
  DATE_PRESET_SCALE,
  zoneDemoEvents,
  zoneDemoSeeds,
  type ZoneDemoSeed,
} from "@/services/zone-demo-data";
import type {
  DateRangePreset,
  DemandLevel,
  ReportingDateRange,
  VehicleCategory,
  VehicleCategoryShare,
  ZoneAnalytics,
  ZoneAnalyticsBundle,
  ZoneComparisonRow,
  ZoneCustomerOnboarding,
  ZoneId,
  ZonePilotOnboarding,
  ZoneReportRow,
  ZoneRideStats,
  ZoneDemandSupply,
} from "@/types";

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export type ZoneAnalyticsQuery = {
  zoneId?: ZoneId | "all";
  preset?: DateRangePreset;
  from?: string;
  to?: string;
};

function scaleCount(n: number, scale: number, cumulative: boolean): number {
  if (!cumulative) return Math.max(0, Math.round(n * Math.min(scale, 1.15)));
  return Math.max(0, Math.round(n * scale));
}

function demandFromRatio(ratio: number | null): DemandLevel {
  if (ratio === null) return "low";
  if (ratio >= 0.45) return "high";
  if (ratio >= 0.25) return "moderate";
  return "low";
}

function buildCustomerMetrics(seed: ZoneDemoSeed, scale: number, cumulative: boolean): ZoneCustomerOnboarding {
  const totalRegistered = seed.customers.totalRegistered;
  const onboardedInPeriod = scaleCount(seed.customers.onboardedToday, scale, cumulative);
  const pending = seed.customers.pending;
  const incomplete = seed.customers.incomplete;
  const completedApprox = Math.max(0, totalRegistered - pending - incomplete);
  return {
    totalRegistered,
    onboardedInPeriod,
    pending,
    incomplete,
    completionRatePct: ratePct(completedApprox, totalRegistered),
  };
}

function buildPilotMetrics(seed: ZoneDemoSeed, scale: number, cumulative: boolean): ZonePilotOnboarding {
  const totalRegistered = seed.pilots.totalRegistered;
  return {
    totalRegistered,
    onboardedInPeriod: scaleCount(seed.pilots.onboardedToday, scale, cumulative),
    pendingVerification: seed.pilots.pendingVerification,
    approvedReady: seed.pilots.approvedReady,
    currentlyOnline: cumulative ? Math.round(seed.pilots.currentlyOnline * 0.85) : seed.pilots.currentlyOnline,
    onActiveTrip: cumulative ? Math.round(seed.pilots.onActiveTrip * 0.85) : seed.pilots.onActiveTrip,
    completionRatePct: ratePct(seed.pilots.approvedReady, totalRegistered),
  };
}

function buildRideMetrics(seed: ZoneDemoSeed, scale: number, cumulative: boolean): ZoneRideStats {
  const totalRides = scaleCount(seed.rides.totalToday, scale, cumulative);
  const completed = scaleCount(seed.rides.completed, scale, cumulative);
  const cancelled = scaleCount(seed.rides.cancelled, scale, cumulative);
  const active = cumulative ? 0 : seed.rides.active;
  const finalOutcomes = completed + cancelled;
  return {
    totalRides,
    completed,
    active,
    cancelled,
    acceptanceRatePct: ratePct(seed.rides.acceptedOffers, seed.rides.totalOffers),
    avgPickupMinutes: seed.rides.avgPickupMinutes,
    grossBookingValueInr: scaleCount(seed.rides.grossBookingValueInr, scale, cumulative),
    cancellationRatePct: ratePct(cancelled, finalOutcomes),
    completionRatePct: ratePct(completed, finalOutcomes),
    avgTripDistanceKm: seed.rides.avgTripDistanceKm,
    avgTripDurationMinutes: seed.rides.avgTripDurationMinutes,
  };
}

function buildDemand(seed: ZoneDemoSeed, pilots: ZonePilotOnboarding): ZoneDemandSupply {
  const available = pilots.currentlyOnline;
  const requests = seed.demand.activeRideRequests;
  const ratio = available > 0 ? requests / available : null;
  return {
    demandLevel: cumulativeSafeDemand(seed, ratio),
    availableEligiblePilots: available,
    activeRideRequests: requests,
    demandSupplyRatio: ratio === null ? null : Math.round(ratio * 100) / 100,
    peakRideHours: seed.demand.peakRideHours,
    mostRequestedVehicleCategory: seed.demand.mostRequestedVehicleCategory,
  };
}

function cumulativeSafeDemand(seed: ZoneDemoSeed, ratio: number | null): DemandLevel {
  return seed.demand.demandLevel ?? demandFromRatio(ratio);
}

function buildVehicleDistribution(seed: ZoneDemoSeed, totalRides: number): VehicleCategoryShare[] {
  const entries = Object.entries(seed.vehicleShares) as [VehicleCategory, number][];
  const sum = entries.reduce((a, [, v]) => a + v, 0) || 1;
  return entries.map(([category, weight]) => ({
    category,
    rides: Math.round((weight / sum) * totalRides),
    sharePct: Math.round((weight / sum) * 1000) / 10,
  }));
}

function periodScale(period: ReportingDateRange): { scale: number; cumulative: boolean } {
  const presetScale = DATE_PRESET_SCALE[period.preset] ?? periodDayCount(period);
  const cumulative = period.preset !== "today" && period.preset !== "yesterday";
  return { scale: presetScale, cumulative };
}

function analyticsForSeed(
  seed: ZoneDemoSeed,
  period: ReportingDateRange,
): ZoneAnalytics {
  const zone = getZoneById(seed.zoneId)!;
  const { scale, cumulative } = periodScale(period);
  const customers = buildCustomerMetrics(seed, scale, cumulative);
  const pilots = buildPilotMetrics(seed, scale, cumulative);
  const rides = buildRideMetrics(seed, scale, cumulative);
  const demandSupply = buildDemand(seed, pilots);
  const daySpan = periodDayCount(period);

  return {
    zoneId: seed.zoneId,
    zoneName: zone.name,
    status: zone.status,
    isDemo: true,
    period,
    customers,
    pilots,
    rides,
    demandSupply,
    activity: buildHourlySeries(seed.hourlyWeights, cumulative ? Math.round(rides.totalRides / daySpan) : rides.totalRides),
    onboardingTrend: buildOnboardingTrend(seed.zoneId, Math.min(daySpan, 30)),
    vehicleDistribution: buildVehicleDistribution(seed, rides.totalRides),
    recentEvents: zoneDemoEvents.filter((e) => e.zoneId === seed.zoneId),
  };
}

function aggregateZones(period: ReportingDateRange): ZoneAnalytics {
  const parts = OPERATIONAL_ZONES.map((z) => analyticsForSeed(zoneDemoSeeds[z.id], period));
  const sum = <T extends number>(pick: (a: ZoneAnalytics) => T) =>
    parts.reduce((acc, p) => acc + pick(p), 0);

  const completed = sum((p) => p.rides.completed);
  const cancelled = sum((p) => p.rides.cancelled);
  const finalOutcomes = completed + cancelled;
  const totalCustomers = sum((p) => p.customers.totalRegistered);
  const pending = sum((p) => p.customers.pending);
  const incomplete = sum((p) => p.customers.incomplete);
  const completedCustomers = Math.max(0, totalCustomers - pending - incomplete);
  const totalPilots = sum((p) => p.pilots.totalRegistered);
  const approved = sum((p) => p.pilots.approvedReady);
  const available = sum((p) => p.demandSupply.availableEligiblePilots);
  const requests = sum((p) => p.demandSupply.activeRideRequests);
  const ratio = available > 0 ? requests / available : null;

  const acceptedOffers = OPERATIONAL_ZONES.reduce(
    (a, z) => a + zoneDemoSeeds[z.id].rides.acceptedOffers,
    0,
  );
  const totalOffers = OPERATIONAL_ZONES.reduce(
    (a, z) => a + zoneDemoSeeds[z.id].rides.totalOffers,
    0,
  );

  const hourlyWeights = parts[0].activity.map((_, i) =>
    parts.reduce((a, p) => a + p.activity[i].rides, 0),
  );
  const totalRides = sum((p) => p.rides.totalRides);
  const daySpan = periodDayCount(period);

  const vehicleMap = new Map<VehicleCategory, number>();
  for (const p of parts) {
    for (const v of p.vehicleDistribution) {
      vehicleMap.set(v.category, (vehicleMap.get(v.category) ?? 0) + v.rides);
    }
  }
  const vehicleDistribution: VehicleCategoryShare[] = [...vehicleMap.entries()].map(
    ([category, rides]) => ({
      category,
      rides,
      sharePct: totalRides > 0 ? Math.round((rides / totalRides) * 1000) / 10 : 0,
    }),
  );

  const peakCandidates = parts.flatMap((p) => p.demandSupply.peakRideHours);
  const peakCounts = peakCandidates.reduce<Record<string, number>>((acc, h) => {
    acc[h] = (acc[h] ?? 0) + 1;
    return acc;
  }, {});
  const peakRideHours = Object.entries(peakCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([h]) => h);

  const topCategory =
    [...vehicleDistribution].sort((a, b) => b.rides - a.rides)[0]?.category ?? null;

  const trendDays = Math.min(daySpan, 30);
  const onboardingTrend = Array.from({ length: trendDays }, (_, idx) => {
    const date = parts[0].onboardingTrend[idx]?.date ?? "";
    return {
      date,
      customers: parts.reduce((a, p) => a + (p.onboardingTrend[idx]?.customers ?? 0), 0),
      pilots: parts.reduce((a, p) => a + (p.onboardingTrend[idx]?.pilots ?? 0), 0),
    };
  });

  return {
    zoneId: ALL_ZONES_ID,
    zoneName: getZoneLabel(ALL_ZONES_ID),
    status: "active",
    isDemo: true,
    period,
    customers: {
      totalRegistered: totalCustomers,
      onboardedInPeriod: sum((p) => p.customers.onboardedInPeriod),
      pending,
      incomplete,
      completionRatePct: ratePct(completedCustomers, totalCustomers),
    },
    pilots: {
      totalRegistered: totalPilots,
      onboardedInPeriod: sum((p) => p.pilots.onboardedInPeriod),
      pendingVerification: sum((p) => p.pilots.pendingVerification),
      approvedReady: approved,
      currentlyOnline: sum((p) => p.pilots.currentlyOnline),
      onActiveTrip: sum((p) => p.pilots.onActiveTrip),
      completionRatePct: ratePct(approved, totalPilots),
    },
    rides: {
      totalRides,
      completed,
      active: sum((p) => p.rides.active),
      cancelled,
      acceptanceRatePct: ratePct(acceptedOffers, totalOffers),
      avgPickupMinutes:
        Math.round(
          (parts.reduce((a, p) => a + (p.rides.avgPickupMinutes ?? 0), 0) / parts.length) * 10,
        ) / 10,
      grossBookingValueInr: sum((p) => p.rides.grossBookingValueInr),
      cancellationRatePct: ratePct(cancelled, finalOutcomes),
      completionRatePct: ratePct(completed, finalOutcomes),
      avgTripDistanceKm:
        Math.round(
          (parts.reduce((a, p) => a + (p.rides.avgTripDistanceKm ?? 0), 0) / parts.length) * 10,
        ) / 10,
      avgTripDurationMinutes: Math.round(
        parts.reduce((a, p) => a + (p.rides.avgTripDurationMinutes ?? 0), 0) / parts.length,
      ),
    },
    demandSupply: {
      demandLevel: demandFromRatio(ratio),
      availableEligiblePilots: available,
      activeRideRequests: requests,
      demandSupplyRatio: ratio === null ? null : Math.round(ratio * 100) / 100,
      peakRideHours,
      mostRequestedVehicleCategory: topCategory,
    },
    activity: buildHourlySeries(
      hourlyWeights,
      daySpan > 1 ? Math.round(totalRides / daySpan) : totalRides,
    ),
    onboardingTrend,
    vehicleDistribution,
    recentEvents: [...zoneDemoEvents].sort(
      (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
    ),
  };
}

function comparisonRows(period: ReportingDateRange): ZoneComparisonRow[] {
  return OPERATIONAL_ZONES.map((z) => {
    const a = analyticsForSeed(zoneDemoSeeds[z.id], period);
    return {
      zoneId: z.id,
      zoneName: z.name,
      customersRegistered: a.customers.totalRegistered,
      customersOnboardedInPeriod: a.customers.onboardedInPeriod,
      customersPending: a.customers.pending,
      pilotsRegistered: a.pilots.totalRegistered,
      pilotsOnboardedInPeriod: a.pilots.onboardedInPeriod,
      pilotsPendingVerification: a.pilots.pendingVerification,
      pilotsApproved: a.pilots.approvedReady,
      demandLevel: a.demandSupply.demandLevel,
    };
  });
}

function reportRows(period: ReportingDateRange): ZoneReportRow[] {
  return OPERATIONAL_ZONES.map((z) => {
    const a = analyticsForSeed(zoneDemoSeeds[z.id], period);
    return {
      id: z.id,
      zone: z.name,
      registeredCustomers: a.customers.totalRegistered,
      customersOnboardedInPeriod: a.customers.onboardedInPeriod,
      registeredPilots: a.pilots.totalRegistered,
      pilotsOnboardedInPeriod: a.pilots.onboardedInPeriod,
      pilotsPendingVerification: a.pilots.pendingVerification,
      onlinePilots: a.pilots.currentlyOnline,
      totalRides: a.rides.totalRides,
      completedRides: a.rides.completed,
      cancelledRides: a.rides.cancelled,
      grossBookingValueInr: a.rides.grossBookingValueInr,
      demandLevel: a.demandSupply.demandLevel,
    };
  });
}

export async function listOperationalZones() {
  await delay(80);
  return OPERATIONAL_ZONES;
}

export async function getZoneAnalytics(
  zoneId: ZoneId | "all",
  period: ReportingDateRange,
): Promise<ZoneAnalytics> {
  await delay();
  if (zoneId === ALL_ZONES_ID) return aggregateZones(period);
  const seed = zoneDemoSeeds[zoneId];
  if (!seed) throw new Error(`Unknown zone: ${zoneId}`);
  return analyticsForSeed(seed, period);
}

export async function getZoneAnalyticsBundle(
  query: ZoneAnalyticsQuery = {},
): Promise<ZoneAnalyticsBundle> {
  await delay();
  const selection = query.zoneId ?? ALL_ZONES_ID;
  const period = resolveDateRange(query.preset ?? "today", {
    from: query.from,
    to: query.to,
  });

  const analytics =
    selection === ALL_ZONES_ID
      ? aggregateZones(period)
      : analyticsForSeed(zoneDemoSeeds[selection], period);

  return {
    mode: getDataMode(),
    isDemo: true,
    selection,
    period,
    analytics,
    comparison: comparisonRows(period),
    report: reportRows(period),
    zones: OPERATIONAL_ZONES,
  };
}

export async function getZoneDetail(zoneId: ZoneId, query: ZoneAnalyticsQuery = {}) {
  await delay();
  const zone = getZoneById(zoneId);
  if (!zone) return null;
  const period = resolveDateRange(query.preset ?? "today", {
    from: query.from,
    to: query.to,
  });
  const analytics = analyticsForSeed(zoneDemoSeeds[zoneId], period);
  return {
    mode: getDataMode(),
    isDemo: true as const,
    zone,
    period,
    analytics,
    report: reportRows(period).filter((r) => r.id === zoneId),
  };
}

export function zoneReportToCsv(rows: ZoneReportRow[]): string {
  const headers = [
    "Zone",
    "Registered customers",
    "Customers onboarded in period",
    "Registered Pilots",
    "Pilots onboarded in period",
    "Pilots pending verification",
    "Online Pilots",
    "Total rides",
    "Completed rides",
    "Cancelled rides",
    "Gross booking value (INR)",
    "Demand level",
  ];
  const escape = (v: string | number) => {
    const s = String(v);
    return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.zone,
        r.registeredCustomers,
        r.customersOnboardedInPeriod,
        r.registeredPilots,
        r.pilotsOnboardedInPeriod,
        r.pilotsPendingVerification,
        r.onlinePilots,
        r.totalRides,
        r.completedRides,
        r.cancelledRides,
        r.grossBookingValueInr,
        r.demandLevel,
      ]
        .map(escape)
        .join(","),
    ),
  ];
  return lines.join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
