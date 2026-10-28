/** Safe percentage helpers — returns null when the denominator is zero. */

export function ratePct(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 1000) / 10;
}

export function formatPct(value: number | null, digits = 1): string {
  if (value === null || Number.isNaN(value)) return "—";
  return `${value.toFixed(digits)}%`;
}

export function formatMetric(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toLocaleString("en-IN");
}

export function formatMinutes(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)} min`;
}

export function formatKm(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)} km`;
}
