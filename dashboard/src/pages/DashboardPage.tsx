import { Link } from "react-router-dom";
import {
  Package,
  FolderTree,
  Layers,
  Eye,
  Plus,
  RefreshCw,
  ArrowRight,
  Activity,
  Database,
  Server,
  Globe,
  CircleAlert,
  CircleCheck,
  CircleX,
} from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";

import { useResources } from "@/hooks/useResources";
import { useCategories } from "@/hooks/useCategories";
import { usePlatforms } from "@/hooks/usePlatforms";
import type { Resource } from "@/types";
import { cn } from "@/lib/utils";

const RECENT_LIMIT = 5;

export function DashboardPage() {
  const resourcesQuery = useResources();
  const categoriesQuery = useCategories();
  const platformsQuery = usePlatforms();

  const isLoading =
    resourcesQuery.isLoading ||
    categoriesQuery.isLoading ||
    platformsQuery.isLoading;

  const totalResources = resourcesQuery.data?.length ?? 0;
  const visibleResources =
    resourcesQuery.data?.filter((r) => r.isVisible).length ?? 0;
  const platformsCount = platformsQuery.data?.length ?? 0;
  const categoriesCount = categoriesQuery.data?.length ?? 0;

  const recent = pickRecent(resourcesQuery.data, RECENT_LIMIT);

  const refetchAll = () => {
    resourcesQuery.refetch();
    categoriesQuery.refetch();
    platformsQuery.refetch();
  };

  // System Status is derived from the entity queries themselves.
  // Any successful entity response proves the backend is reachable AND
  // Prisma is connected (the routes throw 5xx otherwise). This removes
  // the dependency on a separate /api/health probe, which was 404'ing
  // because the backend exposes /health (not /api/health).
  const anyQuerySettled =
    !resourcesQuery.isLoading &&
    !categoriesQuery.isLoading &&
    !platformsQuery.isLoading;

  const anyQuerySucceeded =
    resourcesQuery.isSuccess ||
    categoriesQuery.isSuccess ||
    platformsQuery.isSuccess;

  const anyQueryErrored =
    !anyQuerySucceeded &&
    anyQuerySettled &&
    (resourcesQuery.isError ||
      categoriesQuery.isError ||
      platformsQuery.isError);

  const apiOnline = anyQuerySettled
    ? anyQuerySucceeded
      ? true
      : anyQueryErrored
      ? false
      : null
    : null;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="High-level overview of your Telegram bot content."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={refetchAll}
              disabled={resourcesQuery.isFetching}
            >
              <RefreshCw
                className={
                  resourcesQuery.isFetching
                    ? "h-4 w-4 animate-spin"
                    : "h-4 w-4"
                }
              />
              Refresh
            </Button>
            <Button type="button" asChild>
              <Link to="/resources">
                <Plus className="h-4 w-4" />
                Add Resource
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Resources"
          value={totalResources}
          description="Across all platforms and categories"
          icon={<Package className="h-4 w-4" />}
          loading={isLoading}
          href="/resources"
        />
        <StatCard
          label="Visible Resources"
          value={visibleResources}
          description="Shown to Telegram users"
          icon={<Eye className="h-4 w-4" />}
          loading={isLoading}
          href="/resources"
        />
        <StatCard
          label="Platforms"
          value={platformsCount}
          description="OS / device buckets"
          icon={<Layers className="h-4 w-4" />}
          loading={isLoading}
          href="/platforms"
        />
        <StatCard
          label="Categories"
          value={categoriesCount}
          description="Resource groupings"
          icon={<FolderTree className="h-4 w-4" />}
          loading={isLoading}
          href="/categories"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentResourcesCard
            resources={recent}
            isLoading={resourcesQuery.isLoading}
            isError={resourcesQuery.isError}
            total={totalResources}
          />
        </div>
        <div className="space-y-4">
          <SystemStatusCard
            apiOnline={apiOnline}
            apiStatus={apiStatusFor(apiOnline)}
            dbConnected={apiOnline}
          />
          <QuickActionsCard />
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-cards                                                          */
/* ------------------------------------------------------------------ */

interface RecentResourcesCardProps {
  resources: Resource[];
  isLoading: boolean;
  isError: boolean;
  total: number;
}

function RecentResourcesCard({
  resources,
  isLoading,
  isError,
  total,
}: RecentResourcesCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle>Recent Resources</CardTitle>
          <CardDescription>
            {total === 0
              ? "No resources yet"
              : `Last ${Math.min(RECENT_LIMIT, total)} of ${total}`}
          </CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link to="/resources">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <p className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            Failed to load recent resources.
          </p>
        ) : resources.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-6 text-center">
            <p className="text-sm text-muted-foreground">No resources yet.</p>
            <Button asChild className="mt-3" size="sm">
              <Link to="/resources">
                <Plus className="h-4 w-4" />
                Create your first resource
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {resources.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    {r.platform ? (
                      <Badge variant="secondary">{r.platform.name}</Badge>
                    ) : null}
                    {r.category ? (
                      <Badge variant="outline">{r.category.name}</Badge>
                    ) : null}
                    {r.version ? <span>· {r.version}</span> : null}
                  </div>
                </div>
                <Badge
                  variant={r.isVisible ? "success" : "muted"}
                  className="shrink-0"
                >
                  {r.isVisible ? "Visible" : "Hidden"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

interface SystemStatusCardProps {
  apiOnline: boolean | null;
  apiStatus: string | null;
  dbConnected: boolean | null;
}

function SystemStatusCard({
  apiOnline,
  apiStatus,
  dbConnected,
}: SystemStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
        <CardDescription>Live liveness of the dashboard stack.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5">
        <StatusRow
          icon={<Server className="h-4 w-4" />}
          label="Backend"
          value={
            apiOnline === null
              ? "Checking..."
              : apiOnline
              ? "Online"
              : "Offline"
          }
          tone={toneFor(apiOnline)}
          hint={apiStatus ?? undefined}
        />
        <StatusRow
          icon={<Database className="h-4 w-4" />}
          label="Database"
          value={
            dbConnected === null
              ? "Checking..."
              : dbConnected
              ? "Connected"
              : "Unreachable"
          }
          tone={toneFor(dbConnected)}
        />
        <StatusRow
          icon={<Globe className="h-4 w-4" />}
          label="API"
          value={
            apiOnline === null
              ? "Checking..."
              : apiOnline
              ? "Healthy"
              : "Unavailable"
          }
          tone={toneFor(apiOnline)}
        />
      </CardContent>
    </Card>
  );
}

function QuickActionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Jump to common tasks.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Button asChild variant="outline" className="justify-between">
          <Link to="/resources">
            <span className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Open Resources
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="justify-between">
          <Link to="/resources">
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Resource
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="justify-between">
          <Link to="/settings">
            <span className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Update Settings
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

interface StatusRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "ok" | "warn" | "bad" | "neutral";
  hint?: string;
}

function StatusRow({ icon, label, value, tone, hint }: StatusRowProps) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-border/50 bg-muted/20 px-3 py-2">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">{icon}</span>
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        {hint ? (
          <span className="hidden text-muted-foreground sm:inline">{hint}</span>
        ) : null}
        <Badge
          variant={
            tone === "ok"
              ? "success"
              : tone === "bad"
              ? "destructive"
              : tone === "warn"
              ? "secondary"
              : "muted"
          }
          className={cn("gap-1")}
        >
          {tone === "ok" ? (
            <CircleCheck className="h-3 w-3" />
          ) : tone === "bad" ? (
            <CircleX className="h-3 w-3" />
          ) : tone === "warn" ? (
            <CircleAlert className="h-3 w-3" />
          ) : null}
          {value}
        </Badge>
      </div>
    </div>
  );
}

function toneFor(value: boolean | null): "ok" | "warn" | "bad" | "neutral" {
  if (value === null) return "neutral";
  return value ? "ok" : "bad";
}

function apiStatusFor(online: boolean | null): string | null {
  if (online === null) return "checking";
  return online ? "healthy" : "unreachable";
}

/**
 * Choose the most recent N resources. The backend orders by
 * `displayOrder asc, name asc` — for "most recent" we sort by
 * `createdAt desc` and slice.
 */
function pickRecent(
  resources: Resource[] | undefined,
  limit: number
): Resource[] {
  if (!resources) return [];
  return [...resources]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
}
