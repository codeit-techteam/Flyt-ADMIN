import type {
  IncidentSeverity,
  IncidentStatus,
  PaymentStatus,
  RideStatus,
  TicketCategory,
  TicketChannel,
  TicketPriority,
  TicketStatus,
  VerificationStatus,
} from "@/types";

export const rideStatusLabel: Record<RideStatus, string> = {
  requested: "Requested",
  searching: "Searching",
  assigned: "Assigned",
  arrived: "Arrived",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

export const verificationLabel: Record<VerificationStatus, string> = {
  pending: "Pending",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Rejected",
  needs_correction: "Needs correction",
};

export const severityLabel: Record<IncidentSeverity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const incidentStatusLabel: Record<IncidentStatus, string> = {
  open: "Open",
  acknowledged: "Acknowledged",
  escalated: "Escalated",
  resolved: "Resolved",
};

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info" | "brand";

export function rideTone(status: RideStatus): BadgeTone {
  switch (status) {
    case "completed":
      return "success";
    case "cancelled":
      return "danger";
    case "in_progress":
    case "arrived":
      return "info";
    case "searching":
    case "requested":
      return "warning";
    default:
      return "brand";
  }
}

export function paymentTone(status: PaymentStatus): BadgeTone {
  switch (status) {
    case "paid":
      return "success";
    case "failed":
      return "danger";
    case "refunded":
      return "info";
    default:
      return "warning";
  }
}

export function verificationTone(status: VerificationStatus): BadgeTone {
  switch (status) {
    case "approved":
      return "success";
    case "rejected":
      return "danger";
    case "needs_correction":
      return "warning";
    case "under_review":
      return "info";
    default:
      return "neutral";
  }
}

export function severityTone(severity: IncidentSeverity): BadgeTone {
  switch (severity) {
    case "critical":
    case "high":
      return "danger";
    case "medium":
      return "warning";
    default:
      return "neutral";
  }
}

export const ticketPriorityLabel: Record<TicketPriority, string> = {
  p1: "P1 Urgent",
  p2: "P2 High",
  p3: "P3 Med",
  p4: "P4 Low",
};

export const ticketStatusLabel: Record<TicketStatus, string> = {
  open: "Open",
  investigating: "Investigating",
  pending: "Pending",
  awaiting_info: "Awaiting info",
  escalated: "Escalated",
  resolved: "Resolved",
};

export const ticketCategoryLabel: Record<TicketCategory, string> = {
  rider_experience: "Rider Experience",
  pilot_ops: "Pilot Ops",
  payments: "Payments",
  safety: "Safety",
  app_bug: "App Bug",
  other: "Other",
};

export const ticketChannelLabel: Record<TicketChannel, string> = {
  in_app: "In-App",
  phone: "Phone",
  chatbot: "Chat Bot",
  web: "Web Portal",
  email: "Email",
};

export function ticketPriorityTone(priority: TicketPriority): BadgeTone {
  switch (priority) {
    case "p1":
      return "danger";
    case "p2":
      return "warning";
    case "p3":
      return "brand";
    default:
      return "info";
  }
}

export function ticketStatusTone(status: TicketStatus): BadgeTone {
  switch (status) {
    case "resolved":
      return "success";
    case "escalated":
      return "danger";
    case "investigating":
      return "info";
    case "pending":
    case "awaiting_info":
      return "warning";
    default:
      return "brand";
  }
}
