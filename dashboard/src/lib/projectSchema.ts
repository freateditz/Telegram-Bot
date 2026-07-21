import { z } from "zod";

/**
 * Client-side validation for the project form. The form fields use
 * strings (HTML inputs are always strings); the dialog converts them
 * to the right backend shape on submit. We keep the input type and
 * output type identical so react-hook-form's resolver doesn't trip
 * on the zod input/output split.
 */
const SLUG_REGEX = /^[a-z0-9-]+$/;

export const projectFormSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required")
      .regex(SLUG_REGEX, "Slug must be lowercase letters, numbers, and dashes"),
    description: z.string().trim(),

    // New delivery model — strings in the form, dialog converts to numbers.
    channelId: z.string(),
    messageId: z.string(),

    // Legacy delivery model — both optional.
    telegramMessageLink: z.string(),
    telegramFileId: z.string(),

    thumbnail: z.string(),
    isActive: z.boolean(),
  })
  .superRefine((value, ctx) => {
    const channelId = value.channelId.trim();
    const messageId = value.messageId.trim();
    const hasFile = value.telegramFileId.trim().length > 0;
    const hasLink = value.telegramMessageLink.trim().length > 0;

    if (channelId && !messageId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["messageId"],
        message: "Message ID is required when a channel is selected",
      });
    }
    if (messageId && !channelId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["channelId"],
        message: "Select a channel before adding a message ID",
      });
    }
    if (!channelId && !messageId && !hasFile && !hasLink) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["channelId"],
        message:
          "Pick a channel + message ID, or provide a legacy Telegram file id / message link",
      });
    }
  });

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
