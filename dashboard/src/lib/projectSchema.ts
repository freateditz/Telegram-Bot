import { z } from "zod";

/**
 * Client-side validation for the project form.
 */
export const projectFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase letters, numbers, and dashes"
    ),
  description: z.string().trim().nullable(),
  telegramMessageLink: z.string().trim().url("Invalid URL").optional().nullable(),
  telegramFileId: z.string().trim().optional().nullable(),
  thumbnail: z.string().trim().nullable(),
  isActive: z.boolean().optional(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
