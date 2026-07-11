import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDeletePlatform } from "@/hooks/usePlatforms";
import type { Platform } from "@/types";

interface DeletePlatformDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: Platform | null;
}

export function DeletePlatformDialog({
  open,
  onOpenChange,
  platform,
}: DeletePlatformDialogProps) {
  const { mutate, isPending } = useDeletePlatform({
    onSuccess: () => onOpenChange(false),
  });

  const handleConfirm = () => {
    if (!platform) return;
    mutate(platform.id);
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete platform"
      description={
        platform ? (
          <span>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              "{platform.name}"
            </span>
            ? This action cannot be undone. Platforms that are still
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
