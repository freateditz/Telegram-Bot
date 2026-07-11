import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDeleteCategory } from "@/hooks/useCategories";
import type { Category } from "@/types";

interface DeleteCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
}

export function DeleteCategoryDialog({
  open,
  onOpenChange,
  category,
}: DeleteCategoryDialogProps) {
  const { mutate, isPending } = useDeleteCategory({
    onSuccess: () => onOpenChange(false),
  });

  const handleConfirm = () => {
    if (!category) return;
    mutate(category.id);
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete category"
      description={
        category ? (
          <span>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              "{category.name}"
            </span>
            ? This action cannot be undone. Categories that are still
            referenced by resources cannot be deleted.
          </span>
        ) : null
      }
      confirmLabel="Delete"
      cancelLabel="Cancel"
      destructive
      loading={isPending}
      onConfirm={handleConfirm}
    />
  );
}
