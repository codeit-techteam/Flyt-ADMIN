import { cn } from "@/lib/cn";
import { InputHTMLAttributes, forwardRef } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <label className="block space-y-1.5">
        {label ? (
          <span className="text-sm font-medium text-ink">{label}</span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-10 w-full rounded-md border bg-surface px-3 text-sm text-ink placeholder:text-muted outline-none transition focus:border-flyt-purple focus:ring-2 focus:ring-flyt-purple/20",
            error ? "border-danger focus:border-danger focus:ring-danger/20" : "border-border",
            className,
          )}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {error ? <span className="block text-xs text-danger">{error}</span> : null}
        {!error && hint ? <span className="block text-xs text-muted">{hint}</span> : null}
      </label>
    );
  },
);
Input.displayName = "Input";
