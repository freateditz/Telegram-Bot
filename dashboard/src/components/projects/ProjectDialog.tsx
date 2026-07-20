import { EntityDialog } from "@/components/ui/entity-dialog";
import { ProjectForm } from "./ProjectForm";
import {
  useCreateProject,
  useUpdateProject,
} from "@/hooks/useProjects";
import type { Project, ProjectInput } from "@/types";
import type { ProjectFormValues } from "@/lib/projectSchema";

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
}

export function ProjectDialog({
  open,
  onOpenChange,
  project,
}: ProjectDialogProps) {
  const isEdit = Boolean(project);
  const create = useCreateProject({
    onSuccess: () => onOpenChange(false),
  });
  const update = useUpdateProject({
    onSuccess: () => onOpenChange(false),
  });

  const handleSubmit = async (values: ProjectFormValues) => {
    const input: ProjectInput = {
      title: values.title,
      slug: values.slug,
      description: values.description,
      telegramFileId: values.telegramFileId,
      thumbnail: values.thumbnail,
      isActive: values.isActive ?? true,
    };

    if (isEdit && project) {
      await update.mutateAsync({ id: project.id, input: input });
    } else {
      await create.mutateAsync(input);
    }
  };

  return (
    <EntityDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Project" : "Create Project"}
      description={
        isEdit
          ? "Update the fields below and save your changes."
          : "Fill in the fields below to add a new project."
      }
    >
      <ProjectForm
        defaultValues={project}
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
        submitLabel={isEdit ? "Save changes" : "Create project"}
      />
    </EntityDialog>
  );
}
