import { Badge } from "@/components/ui/badge";
import { rideCategoryLabel, rideCategoryShortLabel } from "@/config/ride-categories";
import { verificationLabel, verificationTone } from "@/lib/status";
import type { Vehicle } from "@/types";
import { Car, MapPin } from "lucide-react";

function formatPlate(plate: string): string {
  const cleaned = plate.replace(/\s+/g, "").toUpperCase();
  // Indian plate groups: AA00AA0000 → AA 00 AA 0000
  const m = cleaned.match(/^([A-Z]{2})(\d{2})([A-Z]{1,3})(\d{4})$/);
  if (m) return `${m[1]} ${m[2]} ${m[3]} ${m[4]}`;
  return plate.toUpperCase();
}

export function VehiclePlateCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <article
      className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/15 shadow-[0_18px_40px_-18px_rgba(61,30,99,0.65)]"
      aria-label={`Vehicle card for ${vehicle.make} ${vehicle.model}. ${vehicle.plate}.`}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(145deg, #2E164B 0%, #3D1E63 42%, #5A3A8A 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-10 -top-8 h-40 w-40 rounded-full bg-[#C9B8E8] opacity-20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-14 left-8 h-36 w-36 rounded-full bg-white/10"
        aria-hidden
      />

      <div className="relative flex min-h-[248px] flex-col justify-between gap-4 p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <p className="font-[family-name:var(--font-quicksand)] text-2xl font-bold leading-none tracking-[-0.03em]">
              flyt
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/85">
                Fleet
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/35 bg-white/10 px-2 py-0.5 text-[11px] text-white/80">
                <MapPin className="h-2.5 w-2.5" strokeWidth={2.25} />
                {vehicle.city}
              </span>
            </div>
          </div>
          <Badge tone={verificationTone(vehicle.verification)} className="bg-white/95 shadow-sm">
            {verificationLabel[vehicle.verification]}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-2xl border-2 border-white/35 bg-white/12">
            <Car className="h-8 w-8 text-white/90" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="truncate text-lg font-semibold leading-tight text-white">
              {vehicle.make} {vehicle.model}
            </p>
            <p className="truncate text-xs text-white/78">
              {vehicle.year} · {vehicle.color} · {rideCategoryShortLabel(vehicle.category)}
            </p>
            <p className="truncate text-xs text-white/58">{rideCategoryLabel(vehicle.category)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">
            Registration plate
          </p>
          <div className="rounded-xl border-2 border-white/80 bg-white px-3 py-2.5 text-center shadow-sm">
            <p className="font-mono text-xl font-bold tracking-[0.12em] text-ink sm:text-2xl">
              {formatPlate(vehicle.plate)}
            </p>
          </div>
          <p className="font-mono text-xs text-white/60">{vehicle.id}</p>
        </div>
      </div>
    </article>
  );
}
