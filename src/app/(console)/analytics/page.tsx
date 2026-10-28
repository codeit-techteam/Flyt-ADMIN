"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { formatInr } from "@/lib/format";
import { rideActivitySeries } from "@/services/mock-data";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const cancellationReasons = [
  { reason: "Pilot not found", share: 34 },
  { reason: "Customer cancelled", share: 28 },
  { reason: "Long ETA", share: 18 },
  { reason: "Payment failed", share: 12 },
  { reason: "Other", share: 8 },
];

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Analytics & Reports"
        description="Demonstration charts only — not live business performance."
      />
      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-xs text-muted">Gross booking (demo day)</p>
            <p className="mt-1 text-2xl font-bold">{formatInr(1842650)}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-muted">Completion rate</p>
            <p className="mt-1 text-2xl font-bold">85%</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-muted">Avg. Pilot rating</p>
            <p className="mt-1 text-2xl font-bold">4.84</p>
          </CardBody>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Ride volume" />
          <CardBody className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rideActivitySeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="hour" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="rides" stroke="#3D1E63" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Cancellation analytics" />
          <CardBody className="space-y-3">
            {cancellationReasons.map((item) => (
              <div key={item.reason}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{item.reason}</span>
                  <span className="tabular-nums text-muted">{item.share}%</span>
                </div>
                <div className="h-2 rounded-full bg-ground">
                  <div
                    className="h-2 rounded-full bg-flyt-purple"
                    style={{ width: `${item.share}%` }}
                  />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
