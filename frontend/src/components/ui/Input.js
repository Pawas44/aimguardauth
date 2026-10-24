import React from "react";
import { cn } from "../../lib/utils";

export function Input({ className, label, testId, ...props }) {
  return (
    <input
      data-testid={testId}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
        "placeholder:text-muted-foreground/60 transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent",
        "disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, testId, ...props }) {
  return (
    <select
      data-testid={testId}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Field({ label, children, hint }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="label-tech block">{label}</label>}
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
