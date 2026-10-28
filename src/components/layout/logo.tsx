import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import Link from "next/link";

/**
 * Official flyt wordmark — Quicksand Bold, lowercase, tracking −0.03em.
 * Matches HAUGO brand guidelines (do not stretch PNG wordmarks).
 */
export function Logo({
  href = "/dashboard",
  showLabel = true,
  inverse = false,
  size = "md",
  className,
}: {
  href?: string;
  showLabel?: boolean;
  inverse?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const wordmarkSize =
    size === "lg" ? "text-[40px] leading-none" : size === "sm" ? "text-xl leading-none" : "text-[28px] leading-none";

  return (
    <Link href={href} className={cn("inline-flex items-center gap-3", className)}>
      <span
        className={cn(
          "font-[family-name:var(--font-quicksand)] font-bold tracking-[-0.03em]",
          wordmarkSize,
          inverse ? "text-white" : "text-ink",
        )}
        aria-label="flyt"
      >
        {brand.name}
      </span>
      {showLabel ? (
        <span
          className={cn(
            "hidden border-l pl-3 text-xs font-medium sm:inline",
            inverse ? "border-white/30 text-white/85" : "border-border text-muted",
          )}
        >
          {brand.consoleLabel}
        </span>
      ) : null}
    </Link>
  );
}
