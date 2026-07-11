import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { SubmitActions } from "@/components/ui/submit-actions";

import {
  platformFormSchema,
  type PlatformFormValues,
} from "@/lib/platformSchema";
import { toSlug } from "@/lib/slug";
import type { Platform } from "@/types";

interface PlatformFormProps {
  defaultValues?: Platform;
  onSubmit: (values: PlatformFormValues) => Promise<void> | void;
  submitLabel?: string;
  onCancel?: () => void;
}

const EMPTY_DEFAULTS: PlatformFormValues = {
  name: "",
  slug: "",
};

export function PlatformForm({
  defaultValues,
  onSubmit,
  submitLabel = "Save",
  onCancel,
}: PlatformFormProps) {
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultValues?.slug));

  const form = useForm<PlatformFormValues>({
    resolver: zodResolver(platformFormSchema),
    defaultValues: defaultValues
      ? mapPlatformToForm(defaultValues)
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
          placeholder="Windows"
          autoComplete="off"
          {...register("name")}
        />
      </Field>

      <Field label="Slug" id="slug" error={errors.slug?.message}>
        <Input
          id="slug"
          placeholder="windows"
          autoComplete="off"
          {...register("slug", {
            onChange: () => setSlugTouched(true),
          })}
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

function mapPlatformToForm(platform: Platform): PlatformFormValues {
  return {
    name: platform.name,
    slug: platform.slug,
  };
}
