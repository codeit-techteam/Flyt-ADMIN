import { env } from "@/config/env";
import { getDataMode } from "@/services/data";
import { FlaskConical } from "lucide-react";

export function DemoBanner() {
  if (!env.demoMode && env.hasBackend) return null;
  const mode = getDataMode();
  return (
    <div className="flex items-center gap-2 border-b border-amber-200 bg-warning-soft px-4 py-2 text-xs font-medium text-warning">
      <FlaskConical className="h-3.5 w-3.5 shrink-0" />
      <span>
        Demonstration data — metrics and records are not live business performance
        {mode === "demo" ? " (no backend connected)." : "."}
      </span>
    </div>
  );
}
