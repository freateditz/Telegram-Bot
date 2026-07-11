import { useMemo, useState } from "react";
import { Plus, RefreshCw, FolderTree, Pencil, Trash2 } from "lucide-react";

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

import { CategoryDialog } from "@/components/categories/CategoryDialog";
import { DeleteCategoryDialog } from "@/components/categories/DeleteCategoryDialog";
import { useCategories } from "@/hooks/useCategories";
import type { Category } from "@/types";

export function CategoriesPage() {
  const categoriesQuery = useCategories();

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleEdit = (category: Category) => {
    setEditing(category);
    setDialogOpen(true);
  };

  const handleDelete = (category: Category) => {
    setDeleteTarget(category);
    setDeleteOpen(true);
  };

  const handleCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const filtered = useMemo(() => {
    const data = categoriesQuery.data ?? [];
    const searchLower = search.trim().toLowerCase();
    if (!searchLower) return data;
    return data.filter(
      (c) =>
        c.name.toLowerCase().includes(searchLower) ||
        c.slug.toLowerCase().includes(searchLower)
    );
  }, [categoriesQuery.data, search]);

  // Backend already returns displayOrder asc, name asc, but the user
  // can re-sort the visible rows by displayOrder asc/desc on the
  // client. (No drag-reorder in this phase.)
  const [displayOrderDir, setDisplayOrderDir] = useState<"asc" | "desc">(
    "asc"
  );
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const diff = a.displayOrder - b.displayOrder;
      return displayOrderDir === "asc" ? diff : -diff;
    });
  }, [filtered, displayOrderDir]);

  return (
    <>
      <PageHeader
        title="Categories"
        description="Group resources by category and control display order."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => categoriesQuery.refetch()}
              disabled={categoriesQuery.isFetching}
            >
              <RefreshCw
                className={
                  categoriesQuery.isFetching
                    ? "h-4 w-4 animate-spin"
                    : "h-4 w-4"
                }
              />
              Refresh
            </Button>
            <Button type="button" onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              New Category
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
          {sorted.length} of {categoriesQuery.data?.length ?? 0} categories
        </div>
      </div>

      {categoriesQuery.isLoading ? (
        <Card>
          <CardContent className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : categoriesQuery.isError ? (
        <EmptyState
          icon={<FolderTree className="h-5 w-5" />}
          title="Failed to load categories"
          description="There was a problem fetching categories from the API."
        />
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={<FolderTree className="h-5 w-5" />}
          title="No categories found"
          description={
            search
              ? "Try adjusting your search or create a new category."
              : "Create your first category to group resources."
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="w-40">
                  <button
                    type="button"
                    onClick={() =>
                      setDisplayOrderDir((d) => (d === "asc" ? "desc" : "asc"))
                    }
                    className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Display Order
                    <span
                      className={
                        displayOrderDir === "asc"
                          ? "rotate-180 transition-transform"
                          : "transition-transform"
                      }
                    >
                      ↑
                    </span>
                  </button>
                </TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>
                    <Badge variant="muted">{c.slug}</Badge>
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {c.displayOrder}
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
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        category={editing ?? undefined}
      />

      <DeleteCategoryDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        category={deleteTarget}
      />
    </>
  );
}
