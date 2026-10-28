/**
 * Service Areas data layer.
 *
 * Currently frontend demo fixtures only — Hyderabad is the sole configured city.
 * Future API surface:
 * - GET /service-areas → configured cities
 * - GET /service-areas/hyderabad/zones → OperationalZone[] + metrics
 * - PATCH /service-areas/.../zones/:zoneId (activation) — not supported in demo
 */

import { getConfiguredServiceAreas, getHyderabadServiceArea } from "@/config/service-area";
import { isZoneId, OPERATIONAL_ZONES } from "@/config/zones";
import { periodDayCount, resolveDateRange } from "@/lib/date-range";
import { getDataMode } from "@/services/data";
import { DATE_PRESET_SCALE, zoneDemoSeeds } from "@/services/zone-demo-data";
import {
  downloadCsv,
  getZoneAnalytics,
  getZoneDetail,
  zoneReportToCsv,
} from "@/services/zone-analytics";
import type {
  DateRangePreset,
  OperationalZone,
  ReportingDateRange,
  ZoneId,
} from "@/types";

const delay = (ms = 160) => new Promise((resolve) => setTimeout(resolve, ms));

export type ZoneListRow = {
  id: ZoneId;
  name: string;
  status: OperationalZone["status"];
  registeredCustomers: number;
  registeredPilots: number;
  onlinePilots: number;
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  grossBookingValueInr: number;
  isDemo: true;
};

function scaleCount(n: number, scale: number, cumulative: boolean): number {
  if (!cumulative) return Math.max(0, Math.round(n * Math.min(scale, 1.15)));
  return Math.max(0, Math.round(n * scale));
}

export async function listServiceAreas() {
  await delay(80);
  return {
    mode: getDataMode(),
    isDemo: true as const,
    areas: getConfiguredServiceAreas(),
  };
}

export async function getServiceAreaOverview() {
  await delay();
  const area = getHyderabadServiceArea();
  return {
    mode: getDataMode(),
    isDemo: true as const,
    area,
    zoneCount: area.zones.length,
    activeZoneCount: area.zones.filter((z) => z.status === "active").length,
  };
}

export async function listHyderabadZoneRows(
  query: { preset?: DateRangePreset; from?: string; to?: string } = {},
): Promise<{
  mode: ReturnType<typeof getDataMode>;
  isDemo: true;
  period: ReportingDateRange;
  rows: ZoneListRow[];
}> {
  await delay();
  const period = resolveDateRange(query.preset ?? "today", {
    from: query.from,
    to: query.to,
  });
  const scale = DATE_PRESET_SCALE[period.preset] ?? periodDayCount(period);
  const cumulative = period.preset !== "today" && period.preset !== "yesterday";

  const rows: ZoneListRow[] = OPERATIONAL_ZONES.map((zone) => {
    const seed = zoneDemoSeeds[zone.id];
    return {
      id: zone.id,
      name: zone.name,
      status: zone.status,
      registeredCustomers: seed.customers.totalRegistered,
      registeredPilots: seed.pilots.totalRegistered,
      onlinePilots: cumulative
        ? Math.round(seed.pilots.currentlyOnline * 0.85)
        : seed.pilots.currentlyOnline,
      totalRides: scaleCount(seed.rides.totalToday, scale, cumulative),
      completedRides: scaleCount(seed.rides.completed, scale, cumulative),
      cancelledRides: scaleCount(seed.rides.cancelled, scale, cumulative),
      grossBookingValueInr: scaleCount(seed.rides.grossBookingValueInr, scale, cumulative),
      isDemo: true,
    };
  });

  return { mode: getDataMode(), isDemo: true, period, rows };
}

export async function getHyderabadZoneDetail(
  zoneId: string,
  query: { preset?: DateRangePreset; from?: string; to?: string } = {},
) {
  if (!isZoneId(zoneId)) return null;
  return getZoneDetail(zoneId, query);
}

export { zoneReportToCsv, downloadCsv, getZoneAnalytics };
