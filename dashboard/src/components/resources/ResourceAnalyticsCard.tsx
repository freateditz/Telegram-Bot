import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useResourceAnalytics } from "@/hooks/useResourceAnalytics";

export function ResourceAnalyticsCard({ resourceId }: { resourceId: number }) {
  const analyticsQuery = useResourceAnalytics(resourceId);

  if (analyticsQuery.isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (analyticsQuery.isError || !analyticsQuery.data) {
    return <Card><CardContent className="p-4 text-destructive">Failed to load analytics.</CardContent></Card>;
  }

  const data = analyticsQuery.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Analytics</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="grid grid-cols-2 gap-2">
            <div className="rounded border p-2">
                <div className="text-xs text-muted-foreground">Downloads</div>
                <div className="text-xl font-semibold">{data.totalDownloads}</div>
            </div>
            <div className="rounded border p-2">
                <div className="text-xs text-muted-foreground">Unique Users</div>
                <div className="text-xl font-semibold">{data.uniqueUsers}</div>
            </div>
            <div className="col-span-2 rounded border p-2">
                <div className="text-xs text-muted-foreground">Last Download</div>
                <div className="text-sm font-semibold">{data.lastDownload ? new Date(data.lastDownload).toLocaleString() : 'Never'}</div>
            </div>
        </div>
        
        <div>
            <div className="text-xs text-muted-foreground mb-2">Daily Downloads (Last 30 days)</div>
            <div className="flex h-32 items-end gap-1">
                {Object.entries(data.dailyDownloads).map(([date, count]) => (
                    <div key={date} className="flex-1 bg-primary" style={{ height: `${(Number(count) / Math.max(...Object.values(data.dailyDownloads) as number[])) * 100}%` }} title={`${date}: ${count}`}></div>
                ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
