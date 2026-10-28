export type RideStatus =
  | "requested"
  | "searching"
  | "assigned"
  | "arrived"
  | "in_progress"
  | "completed"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type VerificationStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "needs_correction";

export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type IncidentStatus = "open" | "acknowledged" | "escalated" | "resolved";

export type VehicleCategory = "flyt" | "she" | "silver" | "xl";

export type Ride = {
  id: string;
  customerName: string;
  customerId: string;
  pilotName: string | null;
  pilotId: string | null;
  pickup: string;
  destination: string;
  status: RideStatus;
  vehicleCategory: VehicleCategory;
  fareInr: number;
  paymentStatus: PaymentStatus;
  requestedAt: string;
  completedAt: string | null;
  city: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  status: "active" | "suspended" | "deleted";
  totalRides: number;
  totalSpendInr: number;
  joinedAt: string;
  lastRideAt: string | null;
};

export type Pilot = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  status: "online" | "offline" | "busy" | "suspended";
  verification: VerificationStatus;
  vehicleId: string | null;
  rating: number;
  totalTrips: number;
  documentsMissing: string[];
  joinedAt: string;
};

export type Vehicle = {
  id: string;
  plate: string;
  make: string;
  model: string;
  year: number;
  category: VehicleCategory;
  color: string;
  pilotId: string | null;
  pilotName: string | null;
  verification: VerificationStatus;
  city: string;
};

export type Transaction = {
  id: string;
  rideId: string | null;
  type: "ride_payment" | "refund" | "pilot_payout" | "adjustment";
  partyName: string;
  amountInr: number;
  method: "upi" | "card" | "wallet" | "cash" | "bank";
  status: PaymentStatus;
  createdAt: string;
};

export type SosIncident = {
  id: string;
  rideId: string;
  reporter: "customer" | "pilot";
  reporterName: string;
  pilotName: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  city: string;
  summary: string;
  openedAt: string;
  updatedAt: string;
};

export type TicketPriority = "p1" | "p2" | "p3" | "p4";
export type TicketStatus =
  | "open"
  | "investigating"
  | "pending"
  | "awaiting_info"
  | "escalated"
  | "resolved";
export type TicketCategory =
  | "rider_experience"
  | "pilot_ops"
  | "payments"
  | "safety"
  | "app_bug"
  | "other";
export type TicketChannel = "in_app" | "phone" | "chatbot" | "web" | "email";

export type SupportTicket = {
  id: string;
  subject: string;
  description: string;
  category: TicketCategory;
  requesterName: string;
  requesterId: string;
  requesterType: "customer" | "pilot";
  requesterTier: string;
  rideId: string | null;
  channel: TicketChannel;
  status: TicketStatus;
  priority: TicketPriority;
  agentName: string | null;
  /** Minutes remaining on SLA; null when resolved / not tracked. */
  slaMinutesLeft: number | null;
  city: string;
  createdAt: string;
  updatedAt: string;
};

export type CmsBanner = {
  id: string;
  title: string;
  placement: "home_hero" | "promotions" | "pilot_home";
  status: "draft" | "scheduled" | "live" | "expired";
  startsAt: string;
  endsAt: string | null;
  imageUrl: string | null;
};

export type PromoCode = {
  id: string;
  code: string;
  discountType: "percent" | "flat";
  discountValue: number;
  status: "active" | "paused" | "expired";
  usageCount: number;
  maxUsage: number | null;
  endsAt: string | null;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "ops_manager" | "support" | "finance" | "viewer";
  status: "active" | "invited" | "disabled";
  lastActiveAt: string | null;
};

export type AuditLog = {
  id: string;
  actorName: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;
};

export type DashboardKpis = {
  ridesToday: number;
  activeRides: number;
  completedRides: number;
  cancelledRides: number;
  onlinePilots: number;
  registeredCustomers: number;
  grossBookingValueInr: number;
  pilotPayoutsPendingInr: number;
  openSos: number;
  pendingPilotVerifications: number;
};

export type RideTimelineEvent = {
  id: string;
  label: string;
  at: string;
  detail?: string;
};

export type AdminNotificationCategory =
  | "safety"
  | "ops"
  | "verification"
  | "finance"
  | "system";

export type AdminNotification = {
  id: string;
  title: string;
  body: string;
  category: AdminNotificationCategory;
  href: string;
  createdAt: string;
  read: boolean;
};

export type DataMode = "demo" | "cached" | "live";
