import { cn } from "@/lib/cn";
import { SelectHTMLAttributes, forwardRef } from "react";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, children, id, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <label className="block space-y-1.5">
        {label ? <span className="text-sm font-medium text-ink">{label}</span> : null}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-ink outline-none transition focus:border-flyt-purple focus:ring-2 focus:ring-flyt-purple/20",
            className,
          )}
          {...props}
        >
          {children}
        </select>
      </label>
    );
  },
);
Select.displayName = "Select";
