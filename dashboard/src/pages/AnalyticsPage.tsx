import {
  Download,
  MousePointerClick,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import {
  useAnalyticsOverview,
  useAnalyticsDaily,
  useAnalyticsTopProjects,
  useAnalyticsRecentEvents,
} from "@/hooks/useAnalytics";

export function AnalyticsPage() {
  const overviewQuery = useAnalyticsOverview();
  const dailyQuery = useAnalyticsDaily();
  const topProjectsQuery = useAnalyticsTopProjects();
  const recentEventsQuery = useAnalyticsRecentEvents();

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Monitor bot performance and user engagement."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Downloads"
          value={overviewQuery.data?.downloads ?? 0}
          icon={<Download className="h-4 w-4" />}
          loading={overviewQuery.isLoading}
        />
        <StatCard
          label="Verify Clicks"
          value={overviewQuery.data?.verifyClicks ?? 0}
          icon={<MousePointerClick className="h-4 w-4" />}
          loading={overviewQuery.isLoading}
        />
        <StatCard
          label="Today's Users"
          value={overviewQuery.data?.todayUsers ?? 0}
          icon={<Users className="h-4 w-4" />}
          loading={overviewQuery.isLoading}
        />
        <StatCard
          label="New Users (Today)"
          value={overviewQuery.data?.newUsers ?? 0}
          icon={<Users className="h-4 w-4" />}
          loading={overviewQuery.isLoading}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyQuery.isLoading ? (
              <Skeleton className="h-64" />
            ) : dailyQuery.isError ? (
              <p className="text-destructive">Failed to load daily data.</p>
            ) : (
              <pre className="text-xs">{JSON.stringify(dailyQuery.data, null, 2)}</pre>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {topProjectsQuery.isLoading ? (
              <Skeleton className="h-64" />
            ) : topProjectsQuery.isError ? (
              <p className="text-destructive">Failed to load top projects.</p>
            ) : (
              <ul className="space-y-2">
                {topProjectsQuery.data?.map((p: any) => (
                  <li key={p.projectId} className="flex justify-between border-b pb-1">
                    <span>Project {p.projectId}</span>
                    <span className="font-semibold">{p._count.projectId}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentEventsQuery.isLoading ? (
            <Skeleton className="h-64" />
          ) : recentEventsQuery.isError ? (
            <p className="text-destructive">Failed to load recent activity.</p>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {recentEventsQuery.data?.map((event: any) => (
                <div key={event.id} className="border-b py-2 text-sm">
                  <span className="font-medium">{event.eventType}</span> ·{" "}
                  <span className="text-muted-foreground">{new Date(event.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
