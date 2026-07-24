import {
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectAnalytics } from "@/hooks/useProjectAnalytics";

export function ProjectAnalyticsCard({ projectId }: { projectId: number }) {
  const analyticsQuery = useProjectAnalytics(projectId);

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
        <CardTitle>Project Analytics</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="grid grid-cols-2 gap-2">
            {[
                {label: "Open", value: data.PROJECT_OPEN},
                {label: "YouTube", value: data.YOUTUBE_CLICK},
                {label: "Telegram", value: data.TELEGRAM_CLICK},
                {label: "Verify", value: data.VERIFY_CLICK},
                {label: "Verified", value: data.VERIFY_SUCCESS},
                {label: "Download", value: data.RESOURCE_DOWNLOAD},
            ].map(item => (
                <div key={item.label} className="rounded border p-2">
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                    <div className="text-xl font-semibold">{item.value}</div>
                </div>
            ))}
        </div>
        
        <div className="flex flex-col items-center justify-center gap-1">
            {[
                {label: "Open", value: data.PROJECT_OPEN},
                {label: "YouTube", value: data.YOUTUBE_CLICK},
                {label: "Telegram", value: data.TELEGRAM_CLICK},
                {label: "Verify", value: data.VERIFY_CLICK},
                {label: "Verified", value: data.VERIFY_SUCCESS},
                {label: "Download", value: data.RESOURCE_DOWNLOAD},
            ].map((item, i, arr) => (
                <div key={item.label} className="flex flex-col items-center">
                    <div className="rounded bg-muted px-2 py-1 text-sm">{item.label} ({item.value})</div>
                    {i < arr.length - 1 && <ArrowRight className="h-4 w-4 rotate-90 text-muted-foreground" />}
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
