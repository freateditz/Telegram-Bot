import { z } from "zod";

const optionalString = z
  .union([z.string(), z.null(), z.literal("")])
  .transform((val) => (val === "" ? null : val));

const optionalUrl = optionalString.refine(
  (val) => !val || z.string().url().safeParse(val).success,
  { message: "Must be a valid URL" }
);

const optionalNumber = z
  .union([z.number(), z.null(), z.literal(0)])
  .transform((val) => (val === 0 ? null : val));

export const resourceFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and dashes"),
  description: optionalString,
  version: optionalString,
  platformId: z
    .number({ message: "Platform is required" })
    .int()
    .positive("Platform is required"),
  categoryId: z
    .number({ message: "Category is required" })
    .int()
    .positive("Category is required"),
  downloadLink: optionalUrl,
  fixLink: optionalUrl,
  tutorialChannelId: optionalString,
  tutorialMessageId: optionalNumber,
  displayOrder: z.number().int(),
  isVisible: z.boolean(),
});

export type ResourceFormValues = z.infer<typeof resourceFormSchema>;
