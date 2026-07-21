import { EntityDialog } from "@/components/ui/entity-dialog";
import { ChannelForm } from "./ChannelForm";
import {
  useCreateChannel,
  useUpdateChannel,
} from "@/hooks/useChannels";
import type { Channel } from "@/types";
import type { ChannelFormValues } from "@/lib/channelSchema";

interface ChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel?: Channel;
}

export function ChannelDialog({
  open,
  onOpenChange,
  channel,
}: ChannelDialogProps) {
  const isEdit = Boolean(channel);
  const create = useCreateChannel({
    onSuccess: () => onOpenChange(false),
  });
  const update = useUpdateChannel({
    onSuccess: () => onOpenChange(false),
  });

  const handleSubmit = async (values: ChannelFormValues) => {
    const payload = {
      name: values.name,
      channelId: values.channelId,
      username: values.username ? values.username : null,
      isActive: values.isActive ?? true,
    };

    if (isEdit && channel) {
      await update.mutateAsync({ id: channel.id, input: payload });
    } else {
      await create.mutateAsync(payload);
    }
  };

  return (
    <EntityDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Channel" : "Add Channel"}
      description={
        isEdit
          ? "Update the channel below. Inactive channels are excluded from new projects."
          : "Add a Telegram channel that holds the project file messages."
      }
    >
      <ChannelForm
        defaultValues={channel}
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
        submitLabel={isEdit ? "Save changes" : "Create channel"}
      />
    </EntityDialog>
  );
}
