import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDeleteResource } from "@/hooks/useResources";
import type { Resource } from "@/types";

interface DeleteResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: Resource | null;
}

export function DeleteResourceDialog({
  open,
  onOpenChange,
  resource,
}: DeleteResourceDialogProps) {
  const { mutate, isPending } = useDeleteResource({
    onSuccess: () => onOpenChange(false),
  });

  const handleConfirm = () => {
    if (!resource) return;
    mutate(resource.id);
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete resource"
      description={
        resource ? (
          <span>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              "{resource.name}"
            </span>
            ? This action cannot be undone.
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
