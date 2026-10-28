export function DetailField({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</p>
      <div
        className={`mt-0.5 truncate text-sm font-medium text-ink ${mono ? "font-mono text-xs tracking-wide" : ""}`}
      >
        {value ?? "—"}
      </div>
    </div>
  );
}

export function DetailGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}
