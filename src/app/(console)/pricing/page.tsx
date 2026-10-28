"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { formatInr } from "@/lib/format";
import { listPromos } from "@/services/data";
import type { PromoCode } from "@/types";
import { useEffect, useState } from "react";

const baseFares = [
  { category: "flyt", base: 49, perKm: 12, perMin: 1.5 },
  { category: "she", base: 59, perKm: 13, perMin: 1.6 },
  { category: "silver", base: 69, perKm: 14, perMin: 1.8 },
  { category: "xl", base: 99, perKm: 18, perMin: 2.2 },
];

export default function PricingPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);

  useEffect(() => {
    listPromos().then(setPromos);
  }, []);

  return (
    <div>
      <PageHeader
        title="Pricing & Promotions"
        description="Category fare cards and promo overview. Fare edits require backend approval workflows."
      />
      <div className="mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {baseFares.map((fare) => (
          <Card key={fare.category}>
            <CardBody>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {fare.category}
              </p>
              <p className="mt-2 text-2xl font-bold tabular-nums">{formatInr(fare.base)}</p>
              <p className="mt-1 text-xs text-muted">Base fare</p>
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
