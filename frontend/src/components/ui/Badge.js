import React from "react";
import { cn } from "../../lib/utils";

const styles = {
  active: "bg-success/10 text-success border-success/25 dark:drop-shadow-[0_0_6px_hsl(var(--success)/0.4)]",
  banned: "bg-danger/10 text-danger border-danger/25 dark:drop-shadow-[0_0_6px_hsl(var(--danger)/0.4)]",
  disabled: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/25",
  expired: "bg-warning/10 text-warning border-warning/25",
  neutral: "bg-muted text-muted-foreground border-border",
  primary: "bg-primary/10 text-primary border-primary/25",
};

export function Badge({ variant = "neutral", className, children, dot }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        styles[variant] || styles.neutral,
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
