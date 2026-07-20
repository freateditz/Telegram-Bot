import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { SubmitActions } from "@/components/ui/submit-actions";

import {
  projectFormSchema,
  type ProjectFormValues,
} from "@/lib/projectSchema";
import { toSlug } from "@/lib/slug";
import type { Project } from "@/types";

interface ProjectFormProps {
  defaultValues?: Project;
  onSubmit: (values: ProjectFormValues) => Promise<void> | void;
  submitLabel?: string;
  onCancel?: () => void;
}

const EMPTY_DEFAULTS: ProjectFormValues = {
  title: "",
  slug: "",
  description: null,
  telegramFileId: "",
  thumbnail: null,
  isActive: true,
};

export function ProjectForm({
  defaultValues,
  onSubmit,
  submitLabel = "Save",
  onCancel,
}: ProjectFormProps) {
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultValues?.slug));

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: defaultValues
      ? mapProjectToForm(defaultValues)
      : EMPTY_DEFAULTS,
    mode: "onTouched",
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  // Auto-derive slug from title until the user manually edits it.
  const title = watch("title");
  useEffect(() => {
    if (!slugTouched && title) {
      setValue("slug", toSlug(title), { shouldValidate: true });
    }
  }, [title, slugTouched, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <Field label="Title" id="title" error={errors.title?.message}>
        <Input
          id="title"
          placeholder="New Project"
          autoComplete="off"
          {...register("title")}
        />
      </Field>

      <Field label="Slug" id="slug" error={errors.slug?.message}>
        <Input
          id="slug"
          placeholder="new-project"
          autoComplete="off"
          {...register("slug", {
            onChange: () => setSlugTouched(true),
          })}
        />
      </Field>

      <Field label="Description" id="description" error={errors.description?.message ?? undefined}>
        <Input
          id="description"
          placeholder="Optional project description"
          autoComplete="off"
          {...register("description")}
        />
      </Field>

      <Field label="Telegram Message Link" id="telegramMessageLink" error={errors.telegramMessageLink?.message ?? undefined}>
        <Input
          id="telegramMessageLink"
          placeholder="https://t.me/c/..."
          autoComplete="off"
          {...register("telegramMessageLink")}
        />
      </Field>

      <Field label="Thumbnail" id="thumbnail" error={errors.thumbnail?.message ?? undefined}>
        <Input
          id="thumbnail"
          placeholder="Thumbnail URL"
          autoComplete="off"
          {...register("thumbnail")}
        />
      </Field>

      <div className="flex items-center gap-2">
        <input
            type="checkbox"
            id="isActive"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            {...register("isActive")}
        />
        <label className="text-sm font-medium" htmlFor="isActive">Active</label>
      </div>

      <SubmitActions
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
        onCancel={onCancel}
      />
    </form>
  );
}

function mapProjectToForm(project: Project): ProjectFormValues {
  return {
    title: project.title,
    slug: project.slug,
    description: project.description,
    telegramMessageLink: project.telegramMessageLink,
    telegramFileId: project.telegramFileId,
    thumbnail: project.thumbnail,
    isActive: project.isActive,
  };
}
