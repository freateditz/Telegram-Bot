import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlatforms } from "@/hooks/usePlatforms";
import { useCategories } from "@/hooks/useCategories";

const ALL_VALUE = "__all__";

export interface ResourceFilterValues {
  search: string;
  platformId: number | null;
  categoryId: number | null;
}

interface ResourceFiltersProps {
  values: ResourceFilterValues;
  onChange: (values: ResourceFilterValues) => void;
  onReset: () => void;
}

export function ResourceFilters({
  values,
  onChange,
  onReset,
}: ResourceFiltersProps) {
  const platformsQuery = usePlatforms();
  const categoriesQuery = useCategories();

  const hasActiveFilter =
    values.search.length > 0 ||
    values.platformId !== null ||
    values.categoryId !== null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:flex-wrap sm:items-center">
      <SearchInput
        className="sm:max-w-none sm:min-w-[220px]"
        placeholder="Search by name..."
        value={values.search}
        onChange={(e) =>
          onChange({ ...values, search: e.target.value })
        }
      />

      <Select
        value={
          values.platformId !== null ? String(values.platformId) : ALL_VALUE
        }
        onValueChange={(value) =>
          onChange({
            ...values,
            platformId: value === ALL_VALUE ? null : Number(value),
          })
        }
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="All platforms" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>All platforms</SelectItem>
          {platformsQuery.data?.map((p) => (
            <SelectItem key={p.id} value={String(p.id)}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={
          values.categoryId !== null ? String(values.categoryId) : ALL_VALUE
        }
        onValueChange={(value) =>
          onChange({
            ...values,
            categoryId: value === ALL_VALUE ? null : Number(value),
          })
        }
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>All categories</SelectItem>
          {categoriesQuery.data?.map((c) => (
            <SelectItem key={c.id} value={String(c.id)}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilter ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      ) : null}
    </div>
  );
}
