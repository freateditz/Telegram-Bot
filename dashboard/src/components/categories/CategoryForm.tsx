import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { SubmitActions } from "@/components/ui/submit-actions";

import {
  categoryFormSchema,
  type CategoryFormValues,
} from "@/lib/categorySchema";
import { toSlug } from "@/lib/slug";
import type { Category } from "@/types";

interface CategoryFormProps {
  defaultValues?: Category;
  onSubmit: (values: CategoryFormValues) => Promise<void> | void;
  submitLabel?: string;
  onCancel?: () => void;
}

const EMPTY_DEFAULTS: CategoryFormValues = {
  name: "",
  slug: "",
  displayOrder: 0,
};

export function CategoryForm({
  defaultValues,
  onSubmit,
  submitLabel = "Save",
  onCancel,
}: CategoryFormProps) {
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultValues?.slug));

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: defaultValues
      ? mapCategoryToForm(defaultValues)
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

  // Auto-derive slug from name until the user manually edits it.
  const name = watch("name");
  useEffect(() => {
    if (!slugTouched && name) {
      setValue("slug", toSlug(name), { shouldValidate: true });
    }
  }, [name, slugTouched, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <Field label="Name" id="name" error={errors.name?.message}>
        <Input
          id="name"
          placeholder="Software"
          autoComplete="off"
          {...register("name")}
        />
      </Field>

      <Field label="Slug" id="slug" error={errors.slug?.message}>
        <Input
          id="slug"
          placeholder="software"
          autoComplete="off"
          {...register("slug", {
            onChange: () => setSlugTouched(true),
          })}
        />
      </Field>

      <Field
        label="Display Order"
        id="displayOrder"
        error={errors.displayOrder?.message}
      >
        <Input
          id="displayOrder"
          type="number"
          inputMode="numeric"
          placeholder="0"
          autoComplete="off"
          {...register("displayOrder", { valueAsNumber: true })}
        />
      </Field>

      <SubmitActions
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
        onCancel={onCancel}
      />
    </form>
  );
}

function mapCategoryToForm(category: Category): CategoryFormValues {
  return {
    name: category.name,
    slug: category.slug,
    displayOrder: category.displayOrder,
  };
}
