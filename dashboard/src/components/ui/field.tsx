import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  id: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Form field wrapper: label + control + optional hint + optional
 * error. Used by every form in the dashboard.
 */
export function Field({ label, id, error, hint, children, className }: FieldProps) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
