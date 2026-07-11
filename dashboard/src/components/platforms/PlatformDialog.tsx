import { EntityDialog } from "@/components/ui/entity-dialog";
import { PlatformForm } from "./PlatformForm";
import {
  useCreatePlatform,
  useUpdatePlatform,
} from "@/hooks/usePlatforms";
import type { Platform } from "@/types";
import type { PlatformFormValues } from "@/lib/platformSchema";

interface PlatformDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform?: Platform;
}

export function PlatformDialog({
  open,
  onOpenChange,
  platform,
}: PlatformDialogProps) {
  const isEdit = Boolean(platform);
  const create = useCreatePlatform({
    onSuccess: () => onOpenChange(false),
  });
  const update = useUpdatePlatform({
    onSuccess: () => onOpenChange(false),
  });

  const handleSubmit = async (values: PlatformFormValues) => {
    if (isEdit && platform) {
      await update.mutateAsync({ id: platform.id, input: values });
    } else {
      await create.mutateAsync(values);
    }
  };

  return (
    <EntityDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Platform" : "Create Platform"}
      description={
        isEdit
          ? "Update the fields below and save your changes."
          : "Fill in the fields below to add a new platform."
      }
    >
      <PlatformForm
        defaultValues={platform}
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
        submitLabel={isEdit ? "Save changes" : "Create platform"}
      />
    </EntityDialog>
  );
}
