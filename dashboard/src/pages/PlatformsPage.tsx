import { useMemo, useState } from "react";
import { Plus, RefreshCw, Layers, Pencil, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { PlatformDialog } from "@/components/platforms/PlatformDialog";
import { DeletePlatformDialog } from "@/components/platforms/DeletePlatformDialog";
import { usePlatforms } from "@/hooks/usePlatforms";
import type { Platform } from "@/types";

export function PlatformsPage() {
  const platformsQuery = usePlatforms();

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Platform | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Platform | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleEdit = (platform: Platform) => {
    setEditing(platform);
    setDialogOpen(true);
  };

  const handleDelete = (platform: Platform) => {
    setDeleteTarget(platform);
    setDeleteOpen(true);
  };

  const handleCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const filtered = useMemo(() => {
    const data = platformsQuery.data ?? [];
    const searchLower = search.trim().toLowerCase();
    if (!searchLower) return data;
    return data.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.slug.toLowerCase().includes(searchLower)
    );
  }, [platformsQuery.data, search]);

  return (
    <>
      <PageHeader
        title="Platforms"
        description="Define the device / OS buckets the bot can show."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => platformsQuery.refetch()}
              disabled={platformsQuery.isFetching}
            >
              <RefreshCw
                className={
                  platformsQuery.isFetching
                    ? "h-4 w-4 animate-spin"
                    : "h-4 w-4"
                }
              />
              Refresh
            </Button>
            <Button type="button" onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              New Platform
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          placeholder="Search by name or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="text-sm text-muted-foreground">
          {filtered.length} of {platformsQuery.data?.length ?? 0} platforms
        </div>
      </div>

      {platformsQuery.isLoading ? (
        <Card>
          <CardContent className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : platformsQuery.isError ? (
        <EmptyState
          icon={<Layers className="h-5 w-5" />}
          title="Failed to load platforms"
          description="There was a problem fetching platforms from the API."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Layers className="h-5 w-5" />}
          title="No platforms found"
          description={
            search
              ? "Try adjusting your search or create a new platform."
              : "Create your first platform to organize resources."
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    <Badge variant="muted">{p.slug}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(p)}
                        aria-label={`Edit ${p.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(p)}
                        aria-label={`Delete ${p.name}`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <PlatformDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        platform={editing ?? undefined}
      />

      <DeletePlatformDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        platform={deleteTarget}
      />
    </>
  );
}
