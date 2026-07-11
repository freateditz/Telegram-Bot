import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ResourceForm } from "./ResourceForm";
import {
  useCreateResource,
  useUpdateResource,
} from "@/hooks/useResources";
import type { Resource } from "@/types";
import type { ResourceFormValues } from "@/lib/resourceSchema";

interface ResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource?: Resource;
}

export function ResourceDialog({
  open,
  onOpenChange,
  resource,
}: ResourceDialogProps) {
  const isEdit = Boolean(resource);
  const create = useCreateResource({
    onSuccess: () => onOpenChange(false),
  });
  const update = useUpdateResource({
    onSuccess: () => onOpenChange(false),
  });

  const handleSubmit = async (values: ResourceFormValues) => {
    const payload = {
      ...values,
      description: values.description ?? "",
      version: values.version ?? "",
    };
    if (isEdit && resource) {
      await update.mutateAsync({ id: resource.id, input: payload });
    } else {
      await create.mutateAsync(payload);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Resource" : "Create Resource"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the fields below and save your changes."
              : "Fill in the fields below to add a new downloadable resource."}
          </DialogDescription>
        </DialogHeader>
        <ResourceForm
          defaultValues={resource}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel={isEdit ? "Save changes" : "Create resource"}
        />
      </DialogContent>
    </Dialog>
  );
}
