"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { RIDE_CATEGORY_ORDER, rideCategoryLabel } from "@/config/ride-categories";
import { formatInr } from "@/lib/format";
import { listPromos } from "@/services/data";
import type { PromoCode, VehicleCategory } from "@/types";
import { useEffect, useState } from "react";

/**
 * Demo fare cards aligned with Pilot Hyderabad rate-card base fares where available.
 * Customer booking categories: auto, bike, mini, sedan, suv.
 * SHE / Silver are modes with policy overlays — not separate fare categories here.
 */
const baseFares: { category: VehicleCategory; base: number; perKm: number; perMin: number }[] = [
  { category: "auto", base: 25, perKm: 12, perMin: 1.5 },
  { category: "bike", base: 15, perKm: 8, perMin: 1.0 },
  { category: "mini", base: 50, perKm: 14, perMin: 1.8 },
  { category: "sedan", base: 70, perKm: 16, perMin: 2.0 },
  { category: "suv", base: 100, perKm: 20, perMin: 2.4 },
];

export default function PricingPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);

  useEffect(() => {
    listPromos().then(setPromos);
  }, []);

  const ordered = RIDE_CATEGORY_ORDER.map(
    (id) => baseFares.find((f) => f.category === id)!,
  );

  return (
    <div>
      <PageHeader
        title="Pricing & Promotions"
        description="Category fare cards and promo overview. Fare edits require backend approval workflows. SHE Mode and Silver Mode apply policy overlays on these vehicle categories — they are not separate vehicle types."
      />
      <div className="mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {ordered.map((fare) => (
          <Card key={fare.category}>
            <CardBody>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {rideCategoryLabel(fare.category)}
              </p>
              <p className="mt-2 text-2xl font-bold tabular-nums">{formatInr(fare.base)}</p>
              <p className="mt-1 text-xs text-muted">Base fare (demo)</p>
              <p className="mt-3 text-sm text-ink">
                {formatInr(fare.perKm)}/km · {formatInr(fare.perMin)}/min
              </p>
            </CardBody>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader title="Active promotions" />
        <CardBody className="space-y-2">
          {promos.map((promo) => (
            <div key={promo.id} className="flex items-center justify-between rounded-lg bg-ground px-3 py-2">
              <div>
                <p className="font-mono text-sm font-semibold">{promo.code}</p>
                <p className="text-xs text-muted">
                  {promo.discountType === "flat"
                    ? `${formatInr(promo.discountValue)} off`
                    : `${promo.discountValue}% off`}
                </p>
              </div>
              <Badge tone={promo.status === "active" ? "success" : "warning"}>{promo.status}</Badge>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
