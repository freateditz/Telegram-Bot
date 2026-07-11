import { useMemo, useState } from "react";
import { Plus, RefreshCw, Package } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { ResourceTable } from "@/components/resources/ResourceTable";
import { ResourceDialog } from "@/components/resources/ResourceDialog";
import { DeleteResourceDialog } from "@/components/resources/DeleteResourceDialog";
import {
  ResourceFilters,
  type ResourceFilterValues,
} from "@/components/resources/ResourceFilters";

import {
  useResources,
  useToggleResourceVisible,
} from "@/hooks/useResources";
import type { Resource } from "@/types";

const DEFAULT_FILTERS: ResourceFilterValues = {
  search: "",
  platformId: null,
  categoryId: null,
};

type SortKey = "name" | "displayOrder";
type SortDir = "asc" | "desc";

export function ResourcesPage() {
  const resourcesQuery = useResources();
  const toggleVisible = useToggleResourceVisible();

  const [filters, setFilters] = useState<ResourceFilterValues>(DEFAULT_FILTERS);
  const [sortKey, setSortKey] = useState<SortKey>("displayOrder");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [editing, setEditing] = useState<Resource | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleSortChange = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditing(resource);
    setDialogOpen(true);
  };

  const handleDelete = (resource: Resource) => {
    setDeleteTarget(resource);
    setDeleteOpen(true);
  };

  const handleCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleToggleVisible = (resource: Resource) => {
    toggleVisible.mutate({
      id: resource.id,
      isVisible: !resource.isVisible,
      previous: resource,
    });
  };

  const filteredAndSorted = useMemo(() => {
    const data = resourcesQuery.data ?? [];
    const search = filters.search.trim().toLowerCase();

    const filtered = data.filter((r) => {
      if (search && !r.name.toLowerCase().includes(search)) return false;
      if (filters.platformId !== null && r.platformId !== filters.platformId)
        return false;
      if (filters.categoryId !== null && r.categoryId !== filters.categoryId)
        return false;
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortKey === "displayOrder") {
        const diff = a.displayOrder - b.displayOrder;
        return sortDir === "asc" ? diff : -diff;
      }
      // name
      const diff = a.name.localeCompare(b.name);
      return sortDir === "asc" ? diff : -diff;
    });

    return sorted;
  }, [resourcesQuery.data, filters, sortKey, sortDir]);

  const visibleCount = useMemo(
    () => (resourcesQuery.data ?? []).filter((r) => r.isVisible).length,
    [resourcesQuery.data]
  );

  return (
    <>
      <PageHeader
        title="Resources"
        description="Manage downloadable resources exposed to the Telegram bot."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => resourcesQuery.refetch()}
              disabled={resourcesQuery.isFetching}
            >
              <RefreshCw
                className={
                  resourcesQuery.isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"
                }
              />
              Refresh
            </Button>
            <Button type="button" onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              New Resource
            </Button>
          </>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Total"
          value={resourcesQuery.data?.length ?? 0}
          icon={<Package className="h-4 w-4" />}
        />
        <StatCard
          label="Visible"
          value={visibleCount}
          icon={<Badge variant="success">ON</Badge>}
        />
        <StatCard
          label="Showing"
          value={filteredAndSorted.length}
          icon={<Badge variant="muted">Filtered</Badge>}
        />
      </div>

      <div className="mb-4">
        <ResourceFilters
          values={filters}
          onChange={setFilters}
          onReset={() => setFilters(DEFAULT_FILTERS)}
        />
      </div>

      <ResourceTable
        resources={filteredAndSorted}
        isLoading={resourcesQuery.isLoading}
        isError={resourcesQuery.isError}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleVisible={handleToggleVisible}
        togglingId={
          toggleVisible.isPending && toggleVisible.variables
            ? toggleVisible.variables.id
            : null
        }
        sortKey={sortKey}
        sortDir={sortDir}
        onSortChange={handleSortChange}
      />

      <ResourceDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        resource={editing ?? undefined}
      />

      <DeleteResourceDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        resource={deleteTarget}
      />
    </>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
        </div>
        <div className="text-muted-foreground">{icon}</div>
      </CardContent>
    </Card>
  );
}
