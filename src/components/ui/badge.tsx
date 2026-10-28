import { cn } from "@/lib/cn";
import type { BadgeTone } from "@/lib/status";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-ground text-muted ring-border",
  success: "bg-success-soft text-success ring-green-200",
  warning: "bg-warning-soft text-warning ring-amber-200",
  danger: "bg-danger-soft text-danger ring-red-200",
  info: "bg-info-soft text-info ring-blue-200",
  brand: "bg-flyt-purple-soft text-flyt-purple ring-purple-200",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
