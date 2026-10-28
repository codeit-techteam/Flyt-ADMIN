import { Badge } from "@/components/ui/badge";
import { formatPhone } from "@/lib/format";
import type { Customer } from "@/types";
import { MapPin, Nfc, UserRound } from "lucide-react";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function statusMeta(status: Customer["status"]): {
  label: string;
  tone: "success" | "warning" | "danger" | "neutral";
} {
  switch (status) {
    case "active":
      return { label: "Active rider", tone: "success" };
    case "suspended":
      return { label: "Suspended", tone: "warning" };
    case "deleted":
      return { label: "Deleted", tone: "danger" };
    default:
      return { label: status, tone: "neutral" };
  }
}

export function CustomerProfileCard({
  customer,
  zoneName,
}: {
  customer: Customer;
  zoneName: string;
}) {
  const status = statusMeta(customer.status);

  return (
    <article
      className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-2xl border border-white/15 shadow-[0_18px_40px_-18px_rgba(61,30,99,0.65)]"
      aria-label={`Customer card for ${customer.name}. ${customer.id}. ${zoneName}`}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(145deg, #3D1E63 0%, #5A3A8A 48%, #2E164B 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-[#C9B8E8] opacity-20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-12 -left-10 h-40 w-40 rounded-full bg-[#E8DFF5] opacity-10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-[56px] h-[3px] bg-gradient-to-r from-[#C9B8E8]/5 via-[#C9B8E8]/40 to-[#C9B8E8]/10"
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
                Rider
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/35 bg-white/10 px-2 py-0.5 text-[11px] text-white/80">
                <MapPin className="h-2.5 w-2.5" strokeWidth={2.25} />
                {zoneName}
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
          <div className="relative flex h-[68px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/40 bg-white/15">
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold tracking-wide text-white">
              {initials(customer.name)}
            </span>
            <UserRound className="sr-only h-8 w-8" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="truncate text-lg font-semibold leading-tight text-white">{customer.name}</p>
            <p className="truncate text-xs text-white/78">{formatPhone(customer.phone)}</p>
            <p className="truncate text-xs text-white/58">{customer.email}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-wide text-white/70">Customer ID · HYD</p>
          <p className="font-mono text-xl font-semibold tracking-wide text-white sm:text-2xl">
            {customer.id}
          </p>
        </div>
      </div>
    </article>
  );
}
