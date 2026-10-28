"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

/** Zones aligned with rider-app HYDERABAD_PLACES + pilot demand hotspots. */
const HYDERABAD_ZONES = [
  "HITEC City",
  "Madhapur",
  "Gachibowli",
  "Financial District",
  "Kondapur",
  "Jubilee Hills",
  "Banjara Hills",
  "Ameerpet",
  "Begumpet",
  "Secunderabad",
  "Necklace Road",
  "Kukatpally",
  "Charminar",
  "Mindspace",
  "Inorbit Mall",
  "Durgam Cheruvu",
  "Uppal",
  "LB Nagar",
  "Rajiv Gandhi Intl Airport",
] as const;

const areas = [
  {
    id: "SA-HYD",
    city: "Hyderabad",
    state: "Telangana",
    zones: HYDERABAD_ZONES.length,
    status: "active" as const,
    launch: true,
    categories: ["flyt", "she", "silver", "xl"],
    zoneNames: [...HYDERABAD_ZONES],
  },
  {
    id: "SA-BLR",
    city: "Bengaluru",
    state: "Karnataka",
    zones: 18,
    status: "active" as const,
    launch: false,
    categories: ["flyt", "she", "silver", "xl"],
    zoneNames: [] as string[],
  },
  {
    id: "SA-MUM",
    city: "Mumbai",
    state: "Maharashtra",
    zones: 0,
    status: "planned" as const,
    launch: false,
    categories: ["flyt"],
    zoneNames: [] as string[],
  },
];

export default function ServiceAreasPage() {
  return (
    <div>
      <PageHeader
        title="Service Areas"
        description="City and zone configuration. Map editing is not available in this frontend demo."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {areas.map((area) => (
          <Card key={area.id} className={area.launch ? "ring-1 ring-flyt-purple/25" : undefined}>
            <CardHeader
              title={area.city}
              description={area.state}
              action={
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  {area.launch ? <Badge tone="brand">launch city</Badge> : null}
                  <Badge tone={area.status === "active" ? "success" : "neutral"}>{area.status}</Badge>
                </div>
              }
            />
            <CardBody className="space-y-3 text-sm">
              <p className="text-muted">ID: {area.id}</p>
              <p>
                Zones: <span className="font-semibold text-ink">{area.zones}</span>
              </p>
              <p className="capitalize">Categories: {area.categories.join(", ")}</p>
              {area.zoneNames.length > 0 ? (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    Active zones
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {area.zoneNames.map((zone) => (
                      <span
                        key={zone}
                        className="rounded-md bg-ground px-2 py-1 text-xs text-ink ring-1 ring-inset ring-border"
                      >
                        {zone}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
