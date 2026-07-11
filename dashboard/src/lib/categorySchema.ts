import { z } from "zod";

/**
 * Client-side validation for the category form. Mirrors the backend's
 * rules: name + slug required, slug auto-derives from name if blank
 * (but we still require it for explicit control on the dashboard).
 */
export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase letters, numbers, and dashes"
    ),
  displayOrder: z.number().int(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
