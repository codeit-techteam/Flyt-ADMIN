"use client";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ALL_ZONES_ID } from "@/config/zones";
import { formatInr } from "@/lib/format";
import { formatKm, formatMetric, formatMinutes, formatPct } from "@/lib/metrics";
import type { ZoneAnalytics, ZoneId } from "@/types";
import {
  CheckCircle2,
  Clock3,
  IndianRupee,
  Route,
  ShieldCheck,
  UserPlus,
  Users,
  UserCheck,
  Car,
  XCircle,
  Activity,
  Percent,
  Radio,
} from "lucide-react";

type ZoneScope = ZoneId | typeof ALL_ZONES_ID | undefined;

function zoneQuery(zoneId: ZoneScope, key: "zone" | "zoneId" = "zone") {
  if (!zoneId || zoneId === ALL_ZONES_ID) return "";
  return `?${key}=${zoneId}`;
}

function withParam(base: string, key: string, value: string) {
  const join = base.includes("?") ? "&" : "?";
  return `${base}${join}${key}=${value}`;
}

export function ZoneCustomerKpis({
  data,
  zoneId,
  showTitle = true,
}: {
  data: ZoneAnalytics["customers"];
  zoneId?: ZoneScope;
  showTitle?: boolean;
}) {
  const customersHref = `/customers${zoneQuery(zoneId, "zoneId")}`;

  return (
    <section>
      {showTitle ? (
        <h3 className="mb-3 text-sm font-semibold text-ink">Customer onboarding</h3>
      ) : null}
      <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Registered"
          value={formatMetric(data.totalRegistered)}
          hint="Open customer directory"
          icon={Users}
          href={customersHref}
        />
        <KpiCard
          label="Onboarded in period"
          value={formatMetric(data.onboardedInPeriod)}
          hint="Joined this reporting window"
          icon={UserPlus}
          tone="success"
          href={customersHref}
        />
        <KpiCard
          label="Pending"
          value={formatMetric(data.pending)}
          hint="Awaiting activation"
          icon={Clock3}
          tone="warning"
          href={customersHref}
        />
        <KpiCard
          label="Incomplete"
          value={formatMetric(data.incomplete)}
          hint="Profiles missing details"
          icon={XCircle}
          tone="danger"
          href={customersHref}
        />
      </div>
      <div className="mt-3 grid auto-rows-fr gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Completion rate"
          value={formatPct(data.completionRatePct)}
          hint="Completed / registered"
          icon={Percent}
          tone="info"
          href={customersHref}
        />
      </div>
    </section>
  );
}

export function ZonePilotKpis({
  data,
  zoneId,
  showTitle = true,
}: {
  data: ZoneAnalytics["pilots"];
  zoneId?: ZoneScope;
  showTitle?: boolean;
}) {
  const liveHref = `/live-operations${zoneQuery(zoneId) || "?zone=all"}`;

  return (
    <section>
      {showTitle ? (
        <h3 className="mb-3 text-sm font-semibold text-ink">Pilot onboarding & operations</h3>
      ) : null}
      <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Registered Pilots"
          value={formatMetric(data.totalRegistered)}
          hint="Open Pilot directory"
          icon={ShieldCheck}
          href="/pilots"
        />
        <KpiCard
          label="Onboarded in period"
          value={formatMetric(data.onboardedInPeriod)}
          hint="New applications in window"
          icon={UserPlus}
          tone="success"
          href="/pilots"
        />
        <KpiCard
          label="Pending verification"
          value={formatMetric(data.pendingVerification)}
          hint="Docs awaiting review"
          icon={Clock3}
          href="/pilots?verification=under_review"
          tone="warning"
        />
        <KpiCard
          label="Approved & ready"
          value={formatMetric(data.approvedReady)}
          hint="Verified partners"
          icon={CheckCircle2}
          tone="success"
          href="/pilots?verification=approved"
        />
      </div>
      <div className="mt-3 grid auto-rows-fr gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Currently online"
          value={formatMetric(data.currentlyOnline)}
          hint="Available to match"
          icon={UserCheck}
          tone="info"
          href="/pilots"
        />
        <KpiCard
          label="On active trip"
          value={formatMetric(data.onActiveTrip)}
          hint="Busy on live rides"
          icon={Car}
          href={liveHref}
        />
        <KpiCard
          label="Onboarding rate"
          value={formatPct(data.completionRatePct)}
          hint="Approved / registered"
          icon={Percent}
          href="/pilots?verification=approved"
        />
        <KpiCard
          label="Zone live ops"
          value={formatMetric(data.onActiveTrip + data.currentlyOnline)}
          hint="Online + on trip"
          icon={Radio}
          href={liveHref}
          tone="info"
        />
      </div>
    </section>
  );
}

export function ZoneRideKpis({
  data,
  zoneId,
  showTitle = true,
}: {
  data: ZoneAnalytics["rides"];
  zoneId?: ZoneScope;
  showTitle?: boolean;
}) {
  const ridesHref = `/rides${zoneQuery(zoneId, "zoneId")}`;
  const liveHref = `/live-operations${zoneQuery(zoneId) || "?zone=all"}`;
  const analyticsHref =
    zoneId && zoneId !== ALL_ZONES_ID
      ? `/analytics/zones/${zoneId}`
      : `/analytics${zoneQuery(zoneId) || "?zone=all"}`;

  return (
    <section className="space-y-4">
      {showTitle ? (
        <h3 className="text-sm font-semibold text-ink">Ride statistics</h3>
      ) : null}

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Volume
        </p>
        <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Total rides"
            value={formatMetric(data.totalRides)}
            hint="Open rides list"
            icon={Activity}
            href={ridesHref}
          />
          <KpiCard
            label="Completed"
            value={formatMetric(data.completed)}
            hint="Finished trips"
            icon={CheckCircle2}
            tone="success"
            href={withParam(ridesHref || "/rides", "status", "completed")}
          />
          <KpiCard
            label="Active"
            value={formatMetric(data.active)}
            hint="Live board"
            icon={Car}
            tone="info"
            href={liveHref}
          />
          <KpiCard
            label="Cancelled"
            value={formatMetric(data.cancelled)}
            hint="Cancelled trips"
            icon={XCircle}
            tone="danger"
            href={withParam(ridesHref || "/rides", "status", "cancelled")}
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Performance
        </p>
        <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Acceptance rate"
            value={formatPct(data.acceptanceRatePct)}
            hint="Pilot accept share"
            icon={Percent}
            href={analyticsHref}
          />
          <KpiCard
            label="Completion rate"
            value={formatPct(data.completionRatePct)}
            hint="Completed / total"
            icon={CheckCircle2}
            tone="success"
            href={analyticsHref}
          />
          <KpiCard
            label="Cancellation rate"
            value={formatPct(data.cancellationRatePct)}
            hint="Cancelled / total"
            icon={Percent}
            tone="warning"
            href={withParam(ridesHref || "/rides", "status", "cancelled")}
          />
          <KpiCard
            label="Gross booking value"
            value={formatInr(data.grossBookingValueInr)}
            hint="GBV in period"
            icon={IndianRupee}
            href={analyticsHref}
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Trip quality
        </p>
        <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Avg pickup time"
            value={formatMinutes(data.avgPickupMinutes)}
            hint="Request → arrive"
            icon={Clock3}
            href={analyticsHref}
          />
          <KpiCard
            label="Avg trip distance"
            value={formatKm(data.avgTripDistanceKm)}
            hint="Completed trips"
            icon={Route}
            href={analyticsHref}
          />
          <KpiCard
            label="Avg trip duration"
            value={formatMinutes(data.avgTripDurationMinutes)}
            hint="On-trip minutes"
            icon={Clock3}
            href={analyticsHref}
          />
          <KpiCard
            label="Open analytics"
            value="Zone"
            hint="Full zone report"
            icon={Activity}
            href={analyticsHref}
            tone="info"
          />
        </div>
      </div>
    </section>
  );
}

export function ZoneRecentActivity({
  events,
}: {
  events: ZoneAnalytics["recentEvents"];
}) {
  return (
    <Card>
      <CardHeader title="Recent activity" description="Onboarding and operational events" />
      <CardBody>
        {events.length === 0 ? (
          <p className="text-sm text-muted">No recent events for this zone.</p>
        ) : (
          <ol className="relative space-y-0 border-l border-border pl-4">
            {events.map((event) => (
              <li key={event.id} className="relative pb-4 last:pb-0">
                <span
                  className={`absolute -left-[1.28rem] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-surface ${
                    event.tone === "danger"
                      ? "bg-danger"
                      : event.tone === "warning"
                        ? "bg-warning"
                        : event.tone === "success"
                          ? "bg-success"
                          : "bg-info"
                  }`}
                />
                <p className="text-sm leading-snug text-ink">{event.title}</p>
                <p className="mt-0.5 text-xs capitalize text-muted">
                  {event.category} · {new Date(event.at).toLocaleString("en-IN")}
                </p>
              </li>
            ))}
          </ol>
        )}
      </CardBody>
    </Card>
  );
}
