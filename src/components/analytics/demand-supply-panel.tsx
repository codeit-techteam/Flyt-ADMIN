"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { rideCategoryShortLabel } from "@/config/ride-categories";
import { formatMetric } from "@/lib/metrics";
import type { ZoneDemandSupply } from "@/types";
import type { BadgeTone } from "@/lib/status";
import { Activity, Car, Gauge, Users } from "lucide-react";

function demandTone(level: ZoneDemandSupply["demandLevel"]): BadgeTone {
  if (level === "high") return "danger";
  if (level === "moderate") return "warning";
  return "success";
}

function demandLabel(level: ZoneDemandSupply["demandLevel"]) {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

export function DemandSupplyPanel({ data }: { data: ZoneDemandSupply }) {
  const ratioPct =
    data.demandSupplyRatio === null ? null : Math.min(100, Math.round(data.demandSupplyRatio * 100));

  return (
    <Card>
      <CardHeader
        title="Demand vs supply"
        description="Eligible Pilots against active requests"
        action={<Badge tone={demandTone(data.demandLevel)}>{demandLabel(data.demandLevel)}</Badge>}
      />
      <CardBody className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Metric
            icon={Users}
            label="Available Pilots"
            value={formatMetric(data.availableEligiblePilots)}
          />
          <Metric
            icon={Activity}
            label="Active requests"
            value={formatMetric(data.activeRideRequests)}
          />
          <Metric
            icon={Gauge}
            label="Demand / supply"
            value={data.demandSupplyRatio === null ? "—" : String(data.demandSupplyRatio)}
          />
          <Metric
            icon={Car}
            label="Top category"
            value={rideCategoryShortLabel(data.mostRequestedVehicleCategory)}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-muted">Supply pressure</span>
            <span className="tabular-nums text-muted">{ratioPct === null ? "—" : `${ratioPct}%`}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-ground">
            <div
              className={`h-full rounded-full transition-all ${
                data.demandLevel === "high"
                  ? "bg-danger"
                  : data.demandLevel === "moderate"
                    ? "bg-warning"
                    : "bg-success"
              }`}
              style={{ width: `${Math.max(ratioPct ?? 0, 4)}%` }}
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
            Peak ride hours
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.peakRideHours.length ? (
              data.peakRideHours.map((h) => (
                <Badge key={h} tone="brand">
                  {h}:00
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted">—</span>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-ground/50 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-muted">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-lg font-bold tabular-nums text-ink">{value}</p>
    </div>
  );
}
