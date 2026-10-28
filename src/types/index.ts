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

/**
 * Customer-bookable ride / vehicle category IDs.
 * Matches FLYT `VehicleType`. SHE / Silver are modes, not categories.
 * See `config/ride-categories.ts`.
 */
export type VehicleCategory = "bike" | "auto" | "mini" | "sedan" | "suv";

/** Rider experience / dispatch modes — not vehicle types. */
export type RideMode = "standard" | "she" | "silver";

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
  /** Rider experience / dispatch mode — not a vehicle category. */
  mode: RideMode;
  /** Pickup operational zone; null when outside Hyderabad service area. */
  zoneId: ZoneId | null;
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
  /** Home / primary Hyderabad operational zone. */
  zoneId: ZoneId;
  status: "active" | "suspended" | "deleted";
  totalRides: number;
  totalSpendInr: number;
  joinedAt: string;
  lastRideAt: string | null;
};

/** Document type IDs — mirrors FLYT-Pilot `DocumentTypeId`. */
export type PilotDocumentTypeId =
  | "driving_licence"
  | "driving_licence_back"
  | "registration_certificate"
  | "vehicle_insurance"
  | "commercial_permit"
  | "fitness_certificate"
  | "identity_kyc"
  | "ownership_authorisation";

/** Document statuses shown in admin review — mirrors FLYT-Pilot review states. */
export type PilotDocumentStatus =
  | "missing"
  | "uploaded"
  | "under_review"
  | "verified"
  | "rejected"
  | "expired";

/** Pilot onboarding category — mirrors FLYT-Pilot `VehicleCategoryId`. */
export type PilotOnboardingCategoryId = "bike" | "auto" | "cab" | "sedan" | "suv";

export type PilotDocumentRecord = {
  type: PilotDocumentTypeId;
  status: PilotDocumentStatus;
  fileName?: string;
  uploadedAt?: string;
  expiryDate?: string;
  rejectionReason?: string;
};

export type PilotDrivingLicence = {
  holderName: string;
  licenceNumber: string;
  issuingState: string;
  issueDate: string;
  expiryDate: string;
  vehicleClass: string;
};

export type PilotOnboardingVehicle = {
  categoryId: PilotOnboardingCategoryId | "";
  registrationNumber: string;
  make: string;
  model: string;
  year: string;
  fuelType: "petrol" | "diesel" | "cng" | "electric" | "hybrid" | "";
  color: string;
  ownership: "owned" | "leased" | "authorised" | "";
};

export type PilotBankDetails = {
  accountHolderName: string;
  bankName: string;
  accountNumberLast4: string;
  ifsc: string;
  upiId: string;
  consentAccepted: boolean;
  status: "draft" | "pending" | "verified" | "demo";
};

export type PilotIdentitySelfie = {
  status: "missing" | "uploaded" | "under_review" | "rejected";
  uploadedAt?: string;
  rejectionReason?: string;
  /** Demo placeholder — real builds would use a signed URL. */
  previewLabel?: string;
};

export type PilotLiveLocation = {
  latitude: number;
  longitude: number;
  label: string;
  updatedAt: string;
};

/**
 * Full onboarding payload as submitted from the Pilot app.
 * Shape mirrors FLYT-Pilot `SessionUser` profile / vehicle / docs / bank / selfie.
 */
export type PilotOnboarding = {
  applicationReference: string | null;
  submittedAt: string | null;
  applicationConsentAccepted: boolean;
  sheEligible: boolean;
  preferredLanguage: "en" | "hi" | "ur";
  dateOfBirth: string;
  gender: "male" | "female" | "other" | "prefer_not_to_say" | "";
  operatingCity: string;
  drivingLicence: PilotDrivingLicence | null;
  vehicle: PilotOnboardingVehicle | null;
  documents: PilotDocumentRecord[];
  identitySelfie: PilotIdentitySelfie;
  bank: PilotBankDetails | null;
  /** Last known GPS when Pilot granted location (demo for online/busy). */
  lastKnownLocation: PilotLiveLocation | null;
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
  /** Derived labels for list views — prefer `onboarding.documents` on detail. */
  documentsMissing: string[];
  joinedAt: string;
  onboarding: PilotOnboarding;
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
  /** Operational zone where the incident was reported. */
  zoneId: ZoneId;
  summary: string;
  openedAt: string;
  updatedAt: string;
};

/** Live ops snapshot for a Hyderabad zone selection (city-wide or single zone). */
export type LiveOperationsSnapshot = {
  zoneId: ZoneId | "all";
  activeRides: Ride[];
  openSos: SosIncident[];
  counts: {
    activeRides: number;
    searching: number;
    inProgress: number;
    openSos: number;
    criticalSos: number;
  };
  /** Per-zone rollup used by the zone strip on Live Operations. */
  byZone: Array<{
    zoneId: ZoneId;
    activeRides: number;
    openSos: number;
    searching: number;
  }>;
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

/** Automatic location / trip events that fan out push + in-app copy. */
export type LocationAlertTrigger = "ride_completed" | "route_changed" | "long_stop";

export type AdminNotification = {
  id: string;
  title: string;
  body: string;
  category: AdminNotificationCategory;
  href: string;
  createdAt: string;
  read: boolean;
  /** Present when the inbox row was produced by an auto location alert. */
  trigger?: LocationAlertTrigger;
  rideId?: string;
};

export type OutboundNotificationAudience = "customer" | "pilot";

/** Queued push / in-app message that would be delivered to an end user. */
export type OutboundNotification = {
  id: string;
  trigger: LocationAlertTrigger | "manual";
  audience: OutboundNotificationAudience | "all";
  title: string;
  body: string;
  rideId?: string;
  createdAt: string;
};

export type DataMode = "demo" | "cached" | "live";

/** Hyderabad operational zones (Service Areas + analytics). */
export type ZoneId =
  | "hitec-city"
  | "madhapur"
  | "gachibowli"
  | "financial-district"
  | "kondapur"
  | "jubilee-hills"
  | "banjara-hills"
  | "ameerpet"
  | "begumpet"
  | "secunderabad"
  | "necklace-road"
  | "kukatpally"
  | "charminar"
  | "mindspace"
  | "inorbit-mall"
  | "durgam-cheruvu"
  | "uppal"
  | "lb-nagar"
  | "rgia";

export type ZoneServiceStatus = "active" | "paused" | "planned";

export type DemandLevel = "low" | "moderate" | "high";

export type CustomerOnboardingStatus =
  | "registered"
  | "pending"
  | "incomplete"
  | "completed";

export type DateRangePreset =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "custom";

export type ReportingDateRange = {
  preset: DateRangePreset;
  /** Inclusive start (ISO date YYYY-MM-DD). */
  from: string;
  /** Inclusive end (ISO date YYYY-MM-DD). */
  to: string;
};

export type OperationalZone = {
  id: ZoneId;
  name: string;
  city: string;
  state: string;
  status: ZoneServiceStatus;
  shortLabel: string;
};

export type ZoneCustomerOnboarding = {
  totalRegistered: number;
  onboardedInPeriod: number;
  pending: number;
  incomplete: number;
  /** completed / totalRegistered × 100; null when total is 0. */
  completionRatePct: number | null;
};

export type ZonePilotOnboarding = {
  totalRegistered: number;
  onboardedInPeriod: number;
  pendingVerification: number;
  approvedReady: number;
  currentlyOnline: number;
  onActiveTrip: number;
  /** approvedReady / totalRegistered × 100; null when total is 0. */
  completionRatePct: number | null;
};

export type ZoneRideStats = {
  totalRides: number;
  completed: number;
  active: number;
  cancelled: number;
  /** acceptedOffers / totalOffers × 100; null when unavailable. */
  acceptanceRatePct: number | null;
  /** Minutes; null when timestamps unreliable. */
  avgPickupMinutes: number | null;
  grossBookingValueInr: number;
  /** cancelled / (completed + cancelled) × 100; null when no final outcomes. */
  cancellationRatePct: number | null;
  /** completed / (completed + cancelled) × 100; null when no final outcomes. */
  completionRatePct: number | null;
  avgTripDistanceKm: number | null;
  avgTripDurationMinutes: number | null;
};

export type ZoneDemandSupply = {
  demandLevel: DemandLevel;
  availableEligiblePilots: number;
  activeRideRequests: number;
  /** Ratio demand requests / available pilots; higher = tighter supply. */
  demandSupplyRatio: number | null;
  peakRideHours: string[];
  mostRequestedVehicleCategory: VehicleCategory | null;
};

export type HourlyRidePoint = {
  hour: string;
  rides: number;
};

export type DailyOnboardingPoint = {
  date: string;
  customers: number;
  pilots: number;
};

export type VehicleCategoryShare = {
  category: VehicleCategory;
  rides: number;
  sharePct: number;
};

export type ZoneActivityEvent = {
  id: string;
  zoneId: ZoneId;
  at: string;
  title: string;
  category: "onboarding" | "ops" | "rides" | "verification";
  tone: "info" | "success" | "warning" | "danger";
};

export type ZoneAnalytics = {
  zoneId: ZoneId | "all";
  zoneName: string;
  status: ZoneServiceStatus;
  isDemo: true;
  period: ReportingDateRange;
  customers: ZoneCustomerOnboarding;
  pilots: ZonePilotOnboarding;
  rides: ZoneRideStats;
  demandSupply: ZoneDemandSupply;
  activity: HourlyRidePoint[];
  onboardingTrend: DailyOnboardingPoint[];
  vehicleDistribution: VehicleCategoryShare[];
  recentEvents: ZoneActivityEvent[];
};

export type ZoneComparisonRow = {
  zoneId: ZoneId;
  zoneName: string;
  customersRegistered: number;
  customersOnboardedInPeriod: number;
  customersPending: number;
  pilotsRegistered: number;
  pilotsOnboardedInPeriod: number;
  pilotsPendingVerification: number;
  pilotsApproved: number;
  demandLevel: DemandLevel;
};

export type ZoneReportRow = {
  id: ZoneId;
  zone: string;
  registeredCustomers: number;
  customersOnboardedInPeriod: number;
  registeredPilots: number;
  pilotsOnboardedInPeriod: number;
  pilotsPendingVerification: number;
  onlinePilots: number;
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  grossBookingValueInr: number;
  demandLevel: DemandLevel;
};

export type ZoneAnalyticsBundle = {
  mode: DataMode;
  isDemo: true;
  selection: ZoneId | "all";
  period: ReportingDateRange;
  analytics: ZoneAnalytics;
  comparison: ZoneComparisonRow[];
  report: ZoneReportRow[];
  zones: OperationalZone[];
};
