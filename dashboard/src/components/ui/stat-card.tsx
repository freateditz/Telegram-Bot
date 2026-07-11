import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  description?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  href?: string;
}

/**
 * One KPI tile for the dashboard home.
 * If `href` is provided the card becomes a navigation link.
 */
export function StatCard({
  label,
  value,
  description,
  icon,
  loading = false,
  href,
}: StatCardProps) {
  const Wrapper: React.ElementType = href ? "a" : "div";
  const wrapperProps = href ? { href } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        "block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        href && "transition-shadow hover:shadow-md"
      )}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{label}</CardTitle>
          {icon ? (
            <span className="text-muted-foreground">{icon}</span>
          ) : null}
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-3xl font-semibold tabular-nums">{value}</div>
          )}
          {description ? (
            <CardDescription className="mt-1">{description}</CardDescription>
          ) : null}
        </CardContent>
      </Card>
    </Wrapper>
  );
}
