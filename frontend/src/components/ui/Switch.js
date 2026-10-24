import React from "react";
import { cn } from "../../lib/utils";

export function Switch({ checked, onCheckedChange, testId, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      data-testid={testId}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        checked
          ? "bg-primary dark:shadow-[0_0_10px_-1px_hsl(var(--primary)/0.7)]"
          : "bg-muted border border-border",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200",
          checked ? "translate-x-[18px] dark:bg-black" : "translate-x-[3px]"
        )}
      />
    </button>
  );
}
