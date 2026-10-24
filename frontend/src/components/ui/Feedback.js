import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export function Spinner({ className }) {
  return <Loader2 className={cn("h-5 w-5 animate-spin text-muted-foreground", className)} />;
}

export function LoadingBlock({ label = "Loading", className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground", className)}>
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="label-tech">{label}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {Icon && (
        <div className="rounded-xl border border-border bg-muted/40 p-4 text-muted-foreground">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <h3 className="font-heading text-lg font-semibold text-foreground">{title}</h3>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}
