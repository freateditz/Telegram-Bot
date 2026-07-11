import { z } from "zod";

/**
 * Client-side validation for the platform form. Mirrors the backend's
 * rules: only name and slug are persisted.
 */
export const platformFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase letters, numbers, and dashes"
    ),
});

export type PlatformFormValues = z.infer<typeof platformFormSchema>;
