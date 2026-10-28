import type {
  AdminNotification,
  LocationAlertTrigger,
  OutboundNotification,
  OutboundNotificationAudience,
} from "@/types";

export type LocationAlertDemoRide = {
  id: string;
  customerName: string;
  pilotName: string;
  corridor: string;
};

const DEMO_RIDES: LocationAlertDemoRide[] = [
  {
    id: "RD-7A21F0",
    customerName: "Ananya Sharma",
    pilotName: "Ravi Kumar",
    corridor: "Gachibowli → HITEC City",
  },
  {
    id: "RD-5E01AA",
    customerName: "Neha Kapoor",
    pilotName: "Suresh Reddy",
    corridor: "Secunderabad → Madhapur",
  },
  {
    id: "RD-4D88C1",
    customerName: "Rohit Menon",
    pilotName: "Kiran Joshi",
    corridor: "Banjara Hills → Financial District",
  },
];

let rideCursor = 0;

export function nextDemoRide(): LocationAlertDemoRide {
  const ride = DEMO_RIDES[rideCursor % DEMO_RIDES.length]!;
  rideCursor += 1;
  return ride;
}

export const LOCATION_ALERT_COPY: Record<
  LocationAlertTrigger,
  {
    label: string;
    description: string;
    admin: (ride: LocationAlertDemoRide) => Pick<AdminNotification, "title" | "body" | "category" | "href">;
    outbound: {
      audience: OutboundNotificationAudience;
      title: string;
      body: (ride: LocationAlertDemoRide) => string;
    }[];
  }
> = {
  ride_completed: {
    label: "Ride completed",
    description: "Pilot marks drop-off complete → fare reminder to pilot, safe-arrival note to customer.",
    admin: (ride) => ({
      title: `Trip completed · ${ride.id}`,
      body: `${ride.corridor}. Auto alerts queued for pilot (${ride.pilotName}) and customer (${ride.customerName}).`,
      category: "ops",
      href: `/rides/${ride.id}`,
    }),
    outbound: [
      {
        audience: "pilot",
        title: "Don't take extra fare",
        body: (ride) =>
          `Trip ${ride.id} is complete. Collect only the app fare shown — never request cash beyond the billed amount.`,
      },
      {
        audience: "customer",
        title: "You have arrived safely",
        body: (ride) =>
          `You've reached your drop-off on ${ride.corridor}. Rate your pilot when you're ready.`,
      },
    ],
  },
  route_changed: {
    label: "Route changed",
    description: "GPS shows the pilot left the planned corridor → ask why the route changed.",
    admin: (ride) => ({
      title: `Route deviation · ${ride.id}`,
      body: `${ride.pilotName} left the planned path on ${ride.corridor}. Pilot prompted for a reason.`,
      category: "safety",
      href: `/rides/${ride.id}`,
    }),
    outbound: [
      {
        audience: "pilot",
        title: "Why did the route change?",
        body: (ride) =>
          `We noticed a detour on ${ride.corridor}. Tap to tell us what happened — traffic, road closure, or rider request.`,
      },
      {
        audience: "customer",
        title: "Route update on your trip",
        body: (ride) =>
          `Your pilot took a different path on ${ride.corridor}. We're checking in with them — you can share live trip from Safety.`,
      },
    ],
  },
  long_stop: {
    label: "Long stop",
    description: "Vehicle stationary too long mid-trip → ask the pilot what the issue is.",
    admin: (ride) => ({
      title: `Long stop detected · ${ride.id}`,
      body: `${ride.pilotName} has been stationary mid-trip on ${ride.corridor}. Pilot asked to report the issue.`,
      category: "safety",
      href: `/rides/${ride.id}`,
    }),
    outbound: [
      {
        audience: "pilot",
        title: "What's the hold-up?",
        body: (ride) =>
          `You've been stopped for a while on ${ride.corridor}. Tell us if it's traffic, a rider stop, or a vehicle issue.`,
      },
      {
        audience: "customer",
        title: "Your trip paused briefly",
        body: (ride) =>
          `Your pilot appears stopped on ${ride.corridor}. We'll follow up if the delay continues.`,
      },
    ],
  },
};

export function buildLocationAlertBundle(
  trigger: LocationAlertTrigger,
  ride: LocationAlertDemoRide = nextDemoRide(),
  createdAt = new Date().toISOString(),
): { admin: AdminNotification; outbound: OutboundNotification[] } {
  const template = LOCATION_ALERT_COPY[trigger];
  const adminMeta = template.admin(ride);
  const idSuffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  return {
    admin: {
      id: `NT-LOC-${idSuffix}`,
      ...adminMeta,
      createdAt,
      read: false,
      trigger,
      rideId: ride.id,
    },
    outbound: template.outbound.map((item, index) => ({
      id: `OB-${idSuffix}-${index}`,
      trigger,
      audience: item.audience,
      title: item.title,
      body: item.body(ride),
      rideId: ride.id,
      createdAt,
    })),
  };
}
