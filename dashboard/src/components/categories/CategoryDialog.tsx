import { EntityDialog } from "@/components/ui/entity-dialog";
import { CategoryForm } from "./CategoryForm";
import {
  useCreateCategory,
  useUpdateCategory,
} from "@/hooks/useCategories";
import type { Category } from "@/types";
import type { CategoryFormValues } from "@/lib/categorySchema";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
}: CategoryDialogProps) {
  const isEdit = Boolean(category);
  const create = useCreateCategory({
    onSuccess: () => onOpenChange(false),
  });
  const update = useUpdateCategory({
    onSuccess: () => onOpenChange(false),
  });

  const handleSubmit = async (values: CategoryFormValues) => {
    if (isEdit && category) {
      await update.mutateAsync({ id: category.id, input: values });
    } else {
      await create.mutateAsync(values);
    }
  };

  return (
    <EntityDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Category" : "Create Category"}
      description={
        isEdit
          ? "Update the fields below and save your changes."
          : "Fill in the fields below to add a new category."
      }
    >
      <CategoryForm
        defaultValues={category}
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
        submitLabel={isEdit ? "Save changes" : "Create category"}
      />
    </EntityDialog>
  );
}
