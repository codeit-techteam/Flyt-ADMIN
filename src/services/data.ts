import { env } from "@/config/env";
import { ALL_ZONES_ID, OPERATIONAL_ZONES, type ZoneSelectionId } from "@/config/zones";
import type {
  AdminNotification,
  AdminUser,
  AuditLog,
  CmsBanner,
  Customer,
  DashboardKpis,
  DataMode,
  LiveOperationsSnapshot,
  LocationAlertTrigger,
  OutboundNotification,
  Pilot,
  PromoCode,
  Ride,
  RideTimelineEvent,
  SosIncident,
  SupportTicket,
  Transaction,
  Vehicle,
} from "@/types";
import { buildLocationAlertBundle } from "./location-notifications";
import {
  demoAdmins,
  demoAuditLogs,
  demoBanners,
  demoCustomers,
  demoIncidents,
  demoKpis,
  demoNotifications,
  demoPilots,
  demoPromos,
  demoRides,
  demoTickets,
  demoTransactions,
  demoVehicles,
  operationalEvents,
  rideActivitySeries,
} from "./mock-data";

const LIVE_RIDE_STATUSES = new Set(["searching", "assigned", "arrived", "in_progress"]);

/** In-memory outbound queue for the notifications composer / auto alerts demo. */
const outboundNotifications: OutboundNotification[] = [];

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export function getDataMode(): DataMode {
  if (env.hasBackend) return "live";
  return "demo";
}

export async function getDashboard() {
  await delay();
  return {
    mode: getDataMode(),
    kpis: demoKpis as DashboardKpis,
    activity: rideActivitySeries,
    events: operationalEvents,
    recentRides: demoRides.slice(0, 8),
    pendingApprovals: demoPilots.filter((p) =>
      ["pending", "under_review", "needs_correction"].includes(p.verification),
    ),
    criticalAlerts: demoIncidents.filter((i) => i.status !== "resolved"),
    pendingVehicles: demoVehicles.filter((v) =>
      ["pending", "under_review", "needs_correction"].includes(v.verification),
    ),
    unassignedVehicles: demoVehicles.filter((v) => !v.pilotId),
  };
}

export async function listRides(filters?: {
  q?: string;
  status?: string;
  category?: string;
  mode?: string;
  zoneId?: string;
  assignment?: string;
  payment?: string;
}): Promise<Ride[]> {
  await delay();
  let rows = [...demoRides];
  if (filters?.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        (r.pilotName?.toLowerCase().includes(q) ?? false),
    );
  }
  if (filters?.status && filters.status !== "all") {
    rows = rows.filter((r) => r.status === filters.status);
  }
  if (filters?.category && filters.category !== "all") {
    rows = rows.filter((r) => r.vehicleCategory === filters.category);
  }
  if (filters?.mode && filters.mode !== "all") {
    rows = rows.filter((r) => r.mode === filters.mode);
  }
  if (filters?.zoneId && filters.zoneId !== "all") {
    rows = rows.filter((r) => r.zoneId === filters.zoneId);
  }
  if (filters?.assignment === "assigned") {
    rows = rows.filter((r) => Boolean(r.pilotId));
  } else if (filters?.assignment === "unassigned") {
    rows = rows.filter((r) => !r.pilotId);
  }
  if (filters?.payment && filters.payment !== "all") {
    rows = rows.filter((r) => r.paymentStatus === filters.payment);
  }
  return rows;
}

export async function getRide(id: string): Promise<Ride | null> {
  await delay();
  return demoRides.find((r) => r.id === id) ?? null;
}

export async function getRideTimeline(id: string): Promise<RideTimelineEvent[]> {
  await delay();
  const ride = demoRides.find((r) => r.id === id);
  if (!ride) return [];
  const events: RideTimelineEvent[] = [
    { id: "1", label: "Ride requested", at: ride.requestedAt, detail: ride.pickup },
  ];
  if (ride.pilotName) {
    events.push({
      id: "2",
      label: "Pilot assigned",
      at: ride.requestedAt,
      detail: ride.pilotName,
    });
  }
  if (["arrived", "in_progress", "completed"].includes(ride.status)) {
    events.push({ id: "3", label: "Pilot arrived", at: ride.requestedAt });
  }
  if (["in_progress", "completed"].includes(ride.status)) {
    events.push({ id: "4", label: "Trip started", at: ride.requestedAt });
  }
  if (ride.status === "completed" && ride.completedAt) {
    events.push({
      id: "5",
      label: "Trip completed",
      at: ride.completedAt,
      detail: ride.destination,
    });
  }
  if (ride.status === "cancelled") {
    events.push({ id: "6", label: "Ride cancelled", at: ride.requestedAt });
  }
  return events;
}

export async function listCustomers(filters?: {
  q?: string;
  zoneId?: string;
}): Promise<Customer[]> {
  await delay();
  let rows = [...demoCustomers];
  if (filters?.q) {
    const query = filters.q.toLowerCase();
    rows = rows.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.phone.includes(query) ||
        c.id.toLowerCase().includes(query),
    );
  }
  if (filters?.zoneId && filters.zoneId !== "all") {
    rows = rows.filter((c) => c.zoneId === filters.zoneId);
  }
  return rows;
}

export async function getCustomer(id: string): Promise<Customer | null> {
  await delay();
  return demoCustomers.find((c) => c.id === id) ?? null;
}

export async function listPilots(filters?: {
  q?: string;
  verification?: string;
}): Promise<Pilot[]> {
  await delay();
  let rows = [...demoPilots];
  if (filters?.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.phone.includes(q),
    );
  }
  if (filters?.verification && filters.verification !== "all") {
    rows = rows.filter((p) => p.verification === filters.verification);
  }
  return rows;
}

export async function getPilot(id: string): Promise<Pilot | null> {
  await delay();
  return demoPilots.find((p) => p.id === id) ?? null;
}

export async function listVehicles(filters?: {
  q?: string;
  verification?: string;
  category?: string;
  assignment?: string;
}): Promise<Vehicle[]> {
  await delay();
  let rows = [...demoVehicles];
  if (filters?.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter(
      (v) =>
        v.id.toLowerCase().includes(q) ||
        v.plate.toLowerCase().includes(q) ||
        v.make.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        (v.pilotName?.toLowerCase().includes(q) ?? false),
    );
  }
  if (filters?.verification && filters.verification !== "all") {
    rows = rows.filter((v) => v.verification === filters.verification);
  }
  if (filters?.category && filters.category !== "all") {
    rows = rows.filter((v) => v.category === filters.category);
  }
  if (filters?.assignment === "assigned") {
    rows = rows.filter((v) => Boolean(v.pilotId));
  } else if (filters?.assignment === "unassigned") {
    rows = rows.filter((v) => !v.pilotId);
  }
  return rows;
}

export type GlobalSearchHit = {
  id: string;
  type: "ride" | "customer" | "pilot" | "vehicle";
  title: string;
  subtitle: string;
  href: string;
};

export async function globalSearch(query: string): Promise<GlobalSearchHit[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];
  await delay(100);

  const hits: GlobalSearchHit[] = [];

  for (const r of demoRides) {
    if (
      r.id.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      (r.pilotName?.toLowerCase().includes(q) ?? false) ||
      r.pickup.toLowerCase().includes(q) ||
      r.destination.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q)
    ) {
      hits.push({
        id: r.id,
        type: "ride",
        title: r.id,
        subtitle: `${r.customerName} · ${r.pickup.split(",")[0]} → ${r.destination.split(",")[0]}`,
        href: `/rides/${r.id}`,
      });
    }
  }

  for (const c of demoCustomers) {
    if (
      c.id.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.city.toLowerCase().includes(q)
    ) {
      hits.push({
        id: c.id,
        type: "customer",
        title: c.name,
        subtitle: `${c.id} · ${c.phone} · ${c.city}`,
        href: `/customers/${c.id}`,
      });
    }
  }

  for (const p of demoPilots) {
    if (
      p.id.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q)
    ) {
      hits.push({
        id: p.id,
        type: "pilot",
        title: p.name,
        subtitle: `${p.id} · ${p.city} · ${p.verification.replace(/_/g, " ")}`,
        href: `/pilots/${p.id}`,
      });
    }
  }

  for (const v of demoVehicles) {
    if (
      v.id.toLowerCase().includes(q) ||
      v.plate.toLowerCase().includes(q) ||
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.city.toLowerCase().includes(q) ||
      (v.pilotName?.toLowerCase().includes(q) ?? false)
    ) {
      hits.push({
        id: v.id,
        type: "vehicle",
        title: `${v.make} ${v.model}`,
        subtitle: `${v.plate} · ${v.id} · ${v.city}`,
        href: `/vehicles/${v.id}`,
      });
    }
  }

  const order = { ride: 0, customer: 1, pilot: 2, vehicle: 3 } as const;
  return hits.sort((a, b) => order[a.type] - order[b.type]).slice(0, 12);
}

export async function getVehicle(id: string): Promise<Vehicle | null> {
  await delay();
  return demoVehicles.find((v) => v.id === id) ?? null;
}

export async function listTransactions(): Promise<Transaction[]> {
  await delay();
  return demoTransactions;
}

export async function listIncidents(filters?: {
  zoneId?: string;
  status?: string;
}): Promise<SosIncident[]> {
  await delay();
  let rows = [...demoIncidents];
  if (filters?.zoneId && filters.zoneId !== ALL_ZONES_ID) {
    rows = rows.filter((i) => i.zoneId === filters.zoneId);
  }
  if (filters?.status && filters.status !== "all") {
    rows = rows.filter((i) => i.status === filters.status);
  }
  return rows;
}

export async function getIncident(id: string): Promise<SosIncident | null> {
  await delay();
  return demoIncidents.find((i) => i.id === id) ?? null;
}

/** Zone-filtered live rides + open SOS for Hyderabad Live Operations. */
export async function getLiveOperations(
  zoneId: ZoneSelectionId = ALL_ZONES_ID,
): Promise<LiveOperationsSnapshot> {
  await delay();
  const allActive = demoRides.filter((r) => LIVE_RIDE_STATUSES.has(r.status));
  const allOpenSos = demoIncidents.filter((i) => i.status !== "resolved");

  const activeRides =
    zoneId === ALL_ZONES_ID
      ? allActive.filter((r) => r.zoneId != null)
      : allActive.filter((r) => r.zoneId === zoneId);
  const openSos =
    zoneId === ALL_ZONES_ID
      ? allOpenSos
      : allOpenSos.filter((i) => i.zoneId === zoneId);

  const byZone = OPERATIONAL_ZONES.map((zone) => {
    const zoneRides = allActive.filter((r) => r.zoneId === zone.id);
    return {
      zoneId: zone.id,
      activeRides: zoneRides.length,
      openSos: allOpenSos.filter((i) => i.zoneId === zone.id).length,
      searching: zoneRides.filter((r) => r.status === "searching").length,
    };
  }).filter((row) => row.activeRides > 0 || row.openSos > 0);

  return {
    zoneId,
    activeRides,
    openSos,
    counts: {
      activeRides: activeRides.length,
      searching: activeRides.filter((r) => r.status === "searching").length,
      inProgress: activeRides.filter((r) =>
        ["arrived", "in_progress", "assigned"].includes(r.status),
      ).length,
      openSos: openSos.length,
      criticalSos: openSos.filter((i) => i.severity === "critical").length,
    },
    byZone,
  };
}

export async function listTickets(filters?: {
  q?: string;
  status?: string;
  priority?: string;
  category?: string;
  agent?: string;
}): Promise<SupportTicket[]> {
  await delay();
  let rows = [...demoTickets];
  if (filters?.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.requesterName.toLowerCase().includes(q) ||
        t.requesterId.toLowerCase().includes(q) ||
        (t.rideId?.toLowerCase().includes(q) ?? false) ||
        (t.agentName?.toLowerCase().includes(q) ?? false),
    );
  }
  if (filters?.status && filters.status !== "all") {
    rows = rows.filter((t) => t.status === filters.status);
  }
  if (filters?.priority && filters.priority !== "all") {
    rows = rows.filter((t) => t.priority === filters.priority);
  }
  if (filters?.category && filters.category !== "all") {
    rows = rows.filter((t) => t.category === filters.category);
  }
  if (filters?.agent && filters.agent !== "all") {
    if (filters.agent === "unassigned") {
      rows = rows.filter((t) => !t.agentName);
    } else {
      rows = rows.filter((t) => t.agentName === filters.agent);
    }
  }
  return rows.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function getTicket(id: string): Promise<SupportTicket | null> {
  await delay();
  return demoTickets.find((t) => t.id === id) ?? null;
}

export async function getTicketStats() {
  await delay(80);
  const open = demoTickets.filter((t) => t.status !== "resolved");
  const resolved = demoTickets.filter((t) => t.status === "resolved");
  return {
    openCount: open.length,
    avgResolutionMinutes: 74,
    csat: 4.62,
    resolvedCount: resolved.length,
    byCategory: {
      all: demoTickets.length,
      rider_experience: demoTickets.filter((t) => t.category === "rider_experience").length,
      pilot_ops: demoTickets.filter((t) => t.category === "pilot_ops").length,
      payments: demoTickets.filter((t) => t.category === "payments").length,
      safety: demoTickets.filter((t) => t.category === "safety").length,
      app_bug: demoTickets.filter((t) => t.category === "app_bug").length,
      other: demoTickets.filter((t) => t.category === "other").length,
    },
  };
}

export async function listBanners(): Promise<CmsBanner[]> {
  await delay();
  return demoBanners;
}

export async function listPromos(): Promise<PromoCode[]> {
  await delay();
  return demoPromos;
}

export async function listAdmins(): Promise<AdminUser[]> {
  await delay();
  return demoAdmins;
}

export async function listAuditLogs(): Promise<AuditLog[]> {
  await delay();
  return demoAuditLogs;
}

export async function listNotifications(): Promise<AdminNotification[]> {
  await delay(120);
  return [...demoNotifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/** Open (non-resolved) SOS incidents — used for sidebar / topbar badges. */
export async function getOpenSosCount(): Promise<number> {
  await delay(80);
  return demoIncidents.filter((i) => i.status !== "resolved").length;
}

export async function getUnreadNotificationCount(): Promise<number> {
  await delay(80);
  return demoNotifications.filter((n) => !n.read).length;
}

export async function markNotificationRead(id: string): Promise<void> {
  await delay(80);
  const item = demoNotifications.find((n) => n.id === id);
  if (item) item.read = true;
}

export async function markAllNotificationsRead(): Promise<void> {
  await delay(100);
  demoNotifications.forEach((n) => {
    n.read = true;
  });
}

export async function listOutboundNotifications(): Promise<OutboundNotification[]> {
  await delay(80);
  return [...outboundNotifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function queueManualNotification(input: {
  audience: "customers" | "pilots" | "all";
  title: string;
  body: string;
}): Promise<OutboundNotification> {
  await delay(400);
  const item: OutboundNotification = {
    id: `OB-MAN-${Date.now().toString(36)}`,
    trigger: "manual",
    audience: input.audience === "customers" ? "customer" : input.audience === "pilots" ? "pilot" : "all",
    title: input.title.trim(),
    body: input.body.trim(),
    createdAt: new Date().toISOString(),
  };
  outboundNotifications.unshift(item);

  demoNotifications.unshift({
    id: `NT-MAN-${Date.now().toString(36)}`,
    title: `Queued · ${item.title}`,
    body: `Manual ${item.audience} blast queued locally. ${item.body}`,
    category: "system",
    href: "/notifications",
    createdAt: item.createdAt,
    read: false,
  });

  return item;
}

/**
 * Fires an automatic location-based alert: admin inbox row + outbound copy for pilot/customer.
 * Frontend-only until a notification backend is connected.
 */
export async function triggerLocationAlert(
  trigger: LocationAlertTrigger,
): Promise<{ admin: AdminNotification; outbound: OutboundNotification[] }> {
  await delay(350);
  const bundle = buildLocationAlertBundle(trigger);
  demoNotifications.unshift(bundle.admin);
  outboundNotifications.unshift(...bundle.outbound);
  return bundle;
}

/** Zone analytics — see `zone-analytics.ts` for DEMO DATA fixtures and API contract. */
export {
  downloadCsv,
  getZoneAnalytics,
  getZoneAnalyticsBundle,
  getZoneDetail,
  listOperationalZones,
  zoneReportToCsv,
} from "./zone-analytics";
