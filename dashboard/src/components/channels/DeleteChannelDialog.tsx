import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDeleteChannel } from "@/hooks/useChannels";
import type { Channel } from "@/types";

interface DeleteChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel: Channel | null;
}

export function DeleteChannelDialog({
  open,
  onOpenChange,
  channel,
}: DeleteChannelDialogProps) {
  const { mutate, isPending } = useDeleteChannel({
    onSuccess: () => onOpenChange(false),
  });

  const handleConfirm = () => {
    if (!channel) return;
    mutate(channel.id);
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete channel"
      description={
        channel ? (
          <span>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              "{channel.name}"
            </span>
            ? Channels that are still referenced by projects cannot be
            deleted — reassign or delete those projects first.
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
