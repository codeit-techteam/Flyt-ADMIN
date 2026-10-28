import { Badge } from "@/components/ui/badge";
import type { VerificationStatus } from "@/types";
import { BadgeCheck, MapPin, Nfc, UserRound } from "lucide-react";

/** Formats Pilot reference for card display (readable groups of 4). */
export function formatPilotIdDisplay(id: string): string {
  const cleaned = id.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (cleaned.length <= 4) return cleaned || id;
  const parts: string[] = [];
  for (let i = 0; i < cleaned.length; i += 4) {
    parts.push(cleaned.slice(i, i + 4));
  }
  return parts.join(" ");
}

function cityCode(city?: string): string {
  const c = (city ?? "").trim().toLowerCase();
  if (c.startsWith("bengal")) return "BLR";
  if (c.startsWith("chennai") || c.startsWith("madras")) return "MAA";
  if (c.startsWith("mumbai") || c.startsWith("bombay")) return "BOM";
  return "HYD";
}

function cardStatus(verification: VerificationStatus): { label: string; tone: "success" | "info" | "warning" | "danger" | "neutral" } {
  switch (verification) {
    case "approved":
      return { label: "Verified Pilot", tone: "success" };
    case "under_review":
      return { label: "Under review", tone: "info" };
    case "needs_correction":
      return { label: "Action required", tone: "warning" };
    case "rejected":
      return { label: "Rejected", tone: "danger" };
    default:
      return { label: "Onboarding", tone: "neutral" };
  }
}

export function PilotIdCard({
  fullName,
  pilotId,
  phone,
  city,
  verification,
  vehicleLabel,
}: {
  fullName: string;
  pilotId: string;
  phone: string;
  city?: string;
  verification: VerificationStatus;
  vehicleLabel?: string;
}) {
  const cityLabel = city?.trim() || "Hyderabad";
  const displayId = formatPilotIdDisplay(pilotId);
  const status = cardStatus(verification);
  const phoneDigits = phone.replace(/\D/g, "");
  const phoneDisplay =
    phoneDigits.length === 10 ? `+91 ${phoneDigits.slice(0, 5)} ${phoneDigits.slice(5)}` : phone.startsWith("+") ? phone : `+91 ${phone}`;

  return (
    <article
      className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-2xl border border-white/15 shadow-[0_18px_40px_-18px_rgba(61,30,99,0.65)]"
      aria-label={`Pilot ID card for ${fullName}. ID ${pilotId}. ${cityLabel}`}
    >
      {/* Gradient sky + foil — mirrors Flyt-Pilot PilotIdCard */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #3D1E63 0%, #4A2A72 45%, #2E164B 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#C9B8E8] opacity-20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-[#C9B8E8] opacity-10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-[52px] h-[3px] bg-gradient-to-r from-[#C9B8E8]/5 via-[#C9B8E8]/35 to-[#C9B8E8]/10"
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
                Pilot
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/35 bg-white/10 px-2 py-0.5 text-[11px] text-white/80">
                <MapPin className="h-2.5 w-2.5" strokeWidth={2.25} />
                {cityLabel}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Nfc className="h-5 w-5 text-white/55" strokeWidth={1.75} />
            <Badge tone={status.tone} className="bg-white/95 shadow-sm">
              {status.label}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/40 bg-white/15">
            <UserRound className="h-8 w-8 text-white/90" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="truncate text-lg font-semibold leading-tight text-white">{fullName}</p>
            <p className="truncate text-xs text-white/78">{phoneDisplay}</p>
            {vehicleLabel ? (
              <p className="truncate text-xs text-white/58">{vehicleLabel}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-white/70">
            <BadgeCheck className="h-3.5 w-3.5 text-[#C9B8E8]" strokeWidth={2} />
            <span>PILOT ID · {cityCode(cityLabel)}</span>
          </div>
          <p className="font-mono text-xl font-semibold tracking-wide text-white sm:text-2xl">
            {displayId}
          </p>
        </div>
      </div>
    </article>
  );
}
