import { useMemo, useState } from "react";
import { Plus, RefreshCw, Radio, Pencil, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { StatCard } from "@/components/ui/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { ChannelDialog } from "@/components/channels/ChannelDialog";
import { DeleteChannelDialog } from "@/components/channels/DeleteChannelDialog";
import { useChannels } from "@/hooks/useChannels";
import { useProjects } from "@/hooks/useProjects";
import type { Channel } from "@/types";

export function ChannelsPage() {
  const channelsQuery = useChannels();
  const projectsQuery = useProjects();

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Channel | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Channel | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleEdit = (channel: Channel) => {
    setEditing(channel);
    setDialogOpen(true);
  };

  const handleDelete = (channel: Channel) => {
    setDeleteTarget(channel);
    setDeleteOpen(true);
  };

  const handleCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const channels = useMemo(() => channelsQuery.data ?? [], [channelsQuery.data]);
  const projects = useMemo(() => projectsQuery.data ?? [], [projectsQuery.data]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return channels;
    return channels.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.channelId.toLowerCase().includes(term) ||
        (c.username || "").toLowerCase().includes(term)
    );
  }, [channels, search]);

  const totals = useMemo(() => {
    const active = channels.filter((c) => c.isActive).length;
    const projectCount = projects.filter((p) => p.channelId).length;
    const downloads = projects
      .filter((p) => p.channelId)
      .reduce((sum, p) => sum + p.downloadCount, 0);
    return { active, projectCount, downloads };
  }, [channels, projects]);

  return (
    <>
      <PageHeader
        title="Channels"
        description="Telegram channels that hold the file messages projects deep-link to."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => channelsQuery.refetch()}
              disabled={channelsQuery.isFetching}
            >
              <RefreshCw
                className={
                  channelsQuery.isFetching
                    ? "h-4 w-4 animate-spin"
                    : "h-4 w-4"
                }
              />
              Refresh
            </Button>
            <Button type="button" onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              Add Channel
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Channels"
          value={channels.length}
          icon={<Radio className="h-4 w-4" />}
          loading={channelsQuery.isLoading}
        />
        <StatCard
          label="Active Channels"
          value={totals.active}
          description="Available for new projects"
          loading={channelsQuery.isLoading}
        />
        <StatCard
          label="Total Downloads"
          value={totals.downloads}
          description="Across all projects in all channels"
          loading={channelsQuery.isLoading}
        />
      </div>

      <div className="mt-6 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          placeholder="Search by name, channel id, or username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="text-sm text-muted-foreground">
          {filtered.length} of {channels.length} channels
        </div>
      </div>

      {channelsQuery.isLoading ? (
        <Card>
          <CardContent className="space-y-2 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : channelsQuery.isError ? (
        <EmptyState
          icon={<Radio className="h-5 w-5" />}
          title="Failed to load channels"
          description="There was a problem fetching channels from the API."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Radio className="h-5 w-5" />}
          title="No channels found"
          description={
            search
              ? "Try adjusting your search or add a new channel."
              : "Add your first channel to start configuring projects."
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Channel ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => {
                const projectCount =
                  c._count?.projects ??
                  projects.filter((p) => p.channelId === c.id).length;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1 py-0.5 text-xs text-muted-foreground">
                        {c.channelId}
                      </code>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.username ? c.username : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.isActive ? "default" : "secondary"}>
                        {c.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{projectCount}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(c)}
                          aria-label={`Edit ${c.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(c)}
                          aria-label={`Delete ${c.name}`}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <ChannelDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        channel={editing ?? undefined}
      />

      <DeleteChannelDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        channel={deleteTarget}
      />
    </>
  );
}
