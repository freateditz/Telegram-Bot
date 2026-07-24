import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserActivity, useTopDownloaders, useSearchUser } from "@/hooks/useUserAnalytics";

export function UserAnalyticsView() {
  const activityQuery = useUserActivity();
  const topDownloadersQuery = useTopDownloaders();
  const [telegramId, setTelegramId] = useState("");
  const [searchId, setSearchId] = useState("");
  const searchQuery = useSearchUser(searchId);

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader><CardTitle>Daily Active Users</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{activityQuery.data?.dailyActiveUsers ?? <Skeleton className="h-8"/>}</CardContent></Card>
        <Card><CardHeader><CardTitle>Monthly Active Users</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{activityQuery.data?.monthlyActiveUsers ?? <Skeleton className="h-8"/>}</CardContent></Card>
        <Card><CardHeader><CardTitle>Returning Users</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{activityQuery.data?.returningUsers ?? <Skeleton className="h-8"/>}</CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Top Downloaders</CardTitle></CardHeader>
          <CardContent>
            {topDownloadersQuery.isLoading ? <Skeleton className="h-32"/> : (
              <ul>{topDownloadersQuery.data?.map((u: any) => <li key={u.userId} className="flex justify-between">User ID: {u.userId} <span>{u._count.userId} downloads</span></li>)}</ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Search User</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input placeholder="Enter Telegram ID" value={telegramId} onChange={e => setTelegramId(e.target.value)} />
              <Button onClick={() => setSearchId(telegramId)}>Search</Button>
            </div>
            {searchQuery.isLoading ? <Skeleton className="h-20"/> : searchQuery.data ? (
                <div className="text-sm">
                    <p>Telegram ID: {searchQuery.data.telegramId}</p>
                    <p>First Seen: {new Date(searchQuery.data.createdAt).toLocaleString()}</p>
                    <p>Last Seen: {searchQuery.data.lastSeen ? new Date(searchQuery.data.lastSeen).toLocaleString() : 'Never'}</p>
                </div>
            ) : searchQuery.isError ? <p className="text-destructive">User not found</p> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
