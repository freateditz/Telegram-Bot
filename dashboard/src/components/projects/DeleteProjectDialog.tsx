import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDeleteProject } from "@/hooks/useProjects";
import type { Project } from "@/types";

interface DeleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
}

export function DeleteProjectDialog({
  open,
  onOpenChange,
  project,
}: DeleteProjectDialogProps) {
  const { mutate, isPending } = useDeleteProject({
    onSuccess: () => onOpenChange(false),
  });

  const handleConfirm = () => {
    if (!project) return;
    mutate(project.id);
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete project"
      description={
        project ? (
          <span>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              "{project.title}"
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
