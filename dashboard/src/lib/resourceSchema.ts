import { z } from "zod";

/**
 * Client-side validation for the resource form.
 * The backend will re-validate; this is for UX.
 *
 * Numeric fields use plain z.number() (not z.coerce) so the Zod input
 * and output types match. The form inputs use `valueAsNumber: true`
 * so HTML <input type="number"> values arrive already coerced.
 *
 * No `.default()` here: defaults are provided by the form's
 * `defaultValues` to keep the input type identical to the output type.
 */
export const resourceFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase letters, numbers, and dashes"
    ),
  description: z.string().trim().optional().or(z.literal("")),
  version: z.string().trim().optional().or(z.literal("")),
  platformId: z
    .number({ message: "Platform is required" })
    .int()
    .positive("Platform is required"),
  categoryId: z
    .number({ message: "Category is required" })
    .int()
    .positive("Category is required"),
  downloadLink: z
    .string()
    .trim()
    .min(1, "Download link is required")
    .url("Must be a valid URL"),
  fixLink: z
    .string()
    .trim()
    .min(1, "Fix link is required")
    .url("Must be a valid URL"),
  tutorialChannelId: z
    .string()
    .trim()
    .min(1, "Tutorial channel ID is required"),
  tutorialMessageId: z
    .number({ message: "Tutorial message ID is required" })
    .int("Must be a whole number"),
  displayOrder: z.number().int(),
  isVisible: z.boolean(),
});

export type ResourceFormValues = z.infer<typeof resourceFormSchema>;
