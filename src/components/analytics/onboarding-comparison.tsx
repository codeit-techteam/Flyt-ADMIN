"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMetric } from "@/lib/metrics";
import type { ZoneComparisonRow } from "@/types";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function OnboardingComparison({
  rows,
  trend,
}: {
  rows: ZoneComparisonRow[];
  trend: { date: string; customers: number; pilots: number }[];
}) {
  const router = useRouter();

  if (!rows.length) {
    return (
      <Card>
        <CardHeader title="Onboarding by zone" />
        <EmptyState
          title="No onboarding data"
          description="Zone onboarding metrics will appear when records are available."
        />
      </Card>
    );
  }

  const chartData = rows.map((r) => ({
    zone: r.zoneName.replace(" Hills", "").replace(" City", ""),
    zoneId: r.zoneId,
    customers: r.customersOnboardedInPeriod,
    pilots: r.pilotsOnboardedInPeriod,
    pending: r.pilotsPendingVerification,
    approved: r.pilotsApproved,
  }));

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader
          title="Customer & Pilot onboarding by zone"
          description="Click a zone bar area via the comparison cards to open details"
        />
        <CardBody className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="20%" accessibilityLayer>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="zone" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} width={36} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  borderColor: "#E5E7EB",
                  fontSize: 12,
                }}
              />
              <Legend />
              <Bar dataKey="customers" name="Customers onboarded" fill="#3D1E63" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pilots" name="Pilots onboarded" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" name="Pending verification" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Daily onboarding trend" description="Selected period" />
        <CardBody className="h-80">
          {trend.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} accessibilityLayer>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis tickLine={false} axisLine={false} fontSize={11} width={28} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: "#E5E7EB",
                    fontSize: 12,
                  }}
                />
                <Legend />
                <Bar dataKey="customers" name="Customers" fill="#3D1E63" radius={[3, 3, 0, 0]} />
                <Bar dataKey="pilots" name="Pilots" fill="#a78bfa" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No trend data" />
          )}
        </CardBody>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:col-span-3 xl:grid-cols-4">
        {rows.map((row) => (
          <button
            key={row.zoneId}
            type="button"
            onClick={() => router.push(`/service-areas/hyderabad/zones/${row.zoneId}`)}
            className="rounded-2xl border border-border bg-surface p-4 text-left shadow-[var(--shadow-card)] transition hover:border-flyt-purple/30 hover:shadow-[var(--shadow-overlay)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flyt-purple"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-ink">{row.zoneName}</p>
              <Badge
                tone={
                  row.demandLevel === "high"
                    ? "danger"
                    : row.demandLevel === "moderate"
                      ? "warning"
                      : "success"
                }
              >
                {row.demandLevel}
              </Badge>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <dt className="text-muted">Customers</dt>
                <dd className="font-bold tabular-nums text-ink">
                  {formatMetric(row.customersOnboardedInPeriod)}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Pilots</dt>
                <dd className="font-bold tabular-nums text-ink">
                  {formatMetric(row.pilotsOnboardedInPeriod)}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Pending verify</dt>
                <dd className="font-bold tabular-nums text-ink">
                  {formatMetric(row.pilotsPendingVerification)}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Approved</dt>
                <dd className="font-bold tabular-nums text-ink">
                  {formatMetric(row.pilotsApproved)}
                </dd>
              </div>
            </dl>
          </button>
        ))}
      </div>
    </div>
  );
}
