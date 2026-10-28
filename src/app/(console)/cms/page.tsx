"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/format";
import { listBanners, listPromos } from "@/services/data";
import type { CmsBanner, PromoCode } from "@/types";
import { useEffect, useState } from "react";

export default function CmsPage() {
  const { push } = useToast();
  const [banners, setBanners] = useState<CmsBanner[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [placement, setPlacement] = useState("home_hero");

  useEffect(() => {
    Promise.all([listBanners(), listPromos()]).then(([b, p]) => {
      setBanners(b);
      setPromos(p);
    });
  }, []);

  function createBanner() {
    if (!title.trim()) {
      push("Banner title is required.", "error");
      return;
    }
    const banner: CmsBanner = {
      id: `BN-${String(banners.length + 1).padStart(2, "0")}`,
      title: title.trim(),
      placement: placement as CmsBanner["placement"],
      status: "draft",
      startsAt: new Date().toISOString(),
      endsAt: null,
      imageUrl: null,
    };
    setBanners((prev) => [banner, ...prev]);
    setTitle("");
    setOpen(false);
    push("Banner saved locally as draft. Not published to mobile apps.", "success");
  }

  return (
    <div>
      <PageHeader
        title="CMS"
        description="Banners, media, and promo codes. Changes are local demos — not live in rider/Pilot apps."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            Create banner
          </Button>
        }
      />

      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-xs text-muted">Live banners</p>
            <p className="mt-1 text-2xl font-bold">{banners.filter((b) => b.status === "live").length}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-muted">Draft / scheduled</p>
            <p className="mt-1 text-2xl font-bold">
              {banners.filter((b) => b.status === "draft" || b.status === "scheduled").length}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-muted">Active promo codes</p>
            <p className="mt-1 text-2xl font-bold">{promos.filter((p) => p.status === "active").length}</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Banner management" />
          <CardBody className="space-y-3">
            {banners.map((banner) => (
              <div key={banner.id} className="rounded-lg border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-ink">{banner.title}</p>
                    <p className="text-xs text-muted">
                      {banner.id} · {banner.placement.replaceAll("_", " ")} · starts{" "}
                      {formatDate(banner.startsAt)}
                    </p>
                  </div>
                  <Badge
                    tone={
                      banner.status === "live"
                        ? "success"
                        : banner.status === "scheduled"
                          ? "info"
                          : "neutral"
                    }
                  >
                    {banner.status}
                  </Badge>
                </div>
                <div className="mt-3 overflow-hidden rounded-md bg-ground">
                  {banner.imageUrl ? (
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="h-28 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-28 items-center justify-center text-xs text-muted">
                      No image — assign artwork from Media library
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Offers & promo codes" />
            <CardBody className="space-y-2">
              {promos.map((promo) => (
                <div
                  key={promo.id}
                  className="flex items-center justify-between rounded-lg bg-ground px-3 py-2"
                >
                  <div>
                    <p className="font-mono text-sm font-semibold">{promo.code}</p>
                    <p className="text-xs text-muted">
                      {promo.discountType === "flat"
                        ? `₹${promo.discountValue} off`
                        : `${promo.discountValue}% off`}{" "}
                      · used {promo.usageCount}
                      {promo.maxUsage ? ` / ${promo.maxUsage}` : ""}
                    </p>
                  </div>
                  <Badge tone={promo.status === "active" ? "success" : "warning"}>{promo.status}</Badge>
                </div>
              ))}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Media library" />
            <CardBody>
              <p className="text-sm text-muted">
                Upload validation and media storage require a backend. This panel is a structural
                placeholder for future asset management.
              </p>
              <Button
                className="mt-3"
                variant="outline"
                size="sm"
                onClick={() => push("Media upload is not connected yet.", "info")}
              >
                Upload media
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Create banner"
        description="Saved locally as draft. Not pushed to customer or Pilot apps."
      >
        <div className="space-y-3">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Select label="Placement" value={placement} onChange={(e) => setPlacement(e.target.value)}>
            <option value="home_hero">Home hero</option>
            <option value="promotions">Promotions</option>
            <option value="pilot_home">Pilot home</option>
          </Select>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createBanner}>Save draft</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
