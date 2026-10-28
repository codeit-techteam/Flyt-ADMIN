import { env } from "@/config/env";
import type {
  AdminNotification,
  AdminUser,
  AuditLog,
  CmsBanner,
  Customer,
  DashboardKpis,
  DataMode,
  Pilot,
  PromoCode,
  Ride,
  RideTimelineEvent,
  SosIncident,
  SupportTicket,
  Transaction,
  Vehicle,
} from "@/types";
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
    recentRides: demoRides.slice(0, 6),
    pendingApprovals: demoPilots.filter((p) =>
      ["pending", "under_review", "needs_correction"].includes(p.verification),
    ),
    criticalAlerts: demoIncidents.filter((i) => i.status !== "resolved"),
  };
}

export async function listRides(filters?: {
  q?: string;
  status?: string;
  category?: string;
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

export async function listCustomers(q?: string): Promise<Customer[]> {
  await delay();
  if (!q) return demoCustomers;
  const query = q.toLowerCase();
  return demoCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.phone.includes(query) ||
      c.id.toLowerCase().includes(query),
  );
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

export async function listVehicles(): Promise<Vehicle[]> {
  await delay();
  return demoVehicles;
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

export async function listIncidents(): Promise<SosIncident[]> {
  await delay();
  return demoIncidents;
}

export async function getIncident(id: string): Promise<SosIncident | null> {
  await delay();
  return demoIncidents.find((i) => i.id === id) ?? null;
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
