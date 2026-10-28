import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
  tone = "default",
  size = "md",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  href?: string;
  tone?: "default" | "danger" | "warning" | "success" | "info";
  size?: "md" | "lg";
}) {
  const toneStyles = {
    default: {
      card: "border-border bg-surface hover:border-flyt-purple/25",
      icon: "bg-flyt-purple-soft text-flyt-purple",
      glow: "from-flyt-purple/[0.06]",
    },
    danger: {
      card: "border-red-200/80 bg-gradient-to-br from-danger-soft/70 to-surface hover:border-red-300",
      icon: "bg-danger text-white shadow-sm shadow-red-200",
      glow: "from-danger/[0.08]",
    },
    warning: {
      card: "border-amber-200/80 bg-gradient-to-br from-warning-soft/60 to-surface hover:border-amber-300",
      icon: "bg-warning text-white shadow-sm shadow-amber-200",
      glow: "from-warning/[0.08]",
    },
    success: {
      card: "border-green-200/80 bg-gradient-to-br from-success-soft/50 to-surface hover:border-green-300",
      icon: "bg-success text-white shadow-sm shadow-green-200",
      glow: "from-success/[0.08]",
    },
    info: {
      card: "border-blue-200/80 bg-gradient-to-br from-info-soft/50 to-surface hover:border-blue-300",
      icon: "bg-info text-white shadow-sm shadow-blue-200",
      glow: "from-info/[0.08]",
    },
  }[tone];

  const content = (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-4 shadow-[var(--shadow-card)] transition duration-200",
        href && "hover:-translate-y-0.5 hover:shadow-[var(--shadow-overlay)]",
        toneStyles.card,
        size === "lg" && "p-5",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br to-transparent opacity-80",
          toneStyles.glow,
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
          <p
            className={cn(
              "mt-1.5 font-bold tabular-nums tracking-tight text-ink",
              size === "lg" ? "text-3xl" : "text-2xl",
            )}
          >
            {value}
          </p>
          {hint ? <p className="mt-1.5 text-xs font-medium text-muted">{hint}</p> : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={cn("rounded-xl p-2.5 transition group-hover:scale-105", toneStyles.icon)}>
            <Icon className={cn(size === "lg" ? "h-5 w-5" : "h-4 w-4")} />
          </span>
          {href ? (
            <ArrowUpRight className="h-3.5 w-3.5 text-muted opacity-0 transition group-hover:opacity-100" />
          ) : null}
        </div>
      </div>
    </div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}
