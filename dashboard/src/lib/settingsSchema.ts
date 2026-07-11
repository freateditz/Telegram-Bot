import { z } from "zod";

/**
 * Settings form validation. Optional fields accept blank input —
 * we only enforce shape on values the user actually types.
 *
 * IMPORTANT: keys here are the canonical storage keys used across the
 * whole project (bot, backend, dashboard, database). They must match
 * `STORAGE_KEYS` in `SettingsPage.tsx` and the keys the bot reads
 * from the backend (see `backend/src/services/verificationService.js`).
 */
export const settingsFormSchema = z.object({
  botName: z.string().trim().max(80, "Maximum 80 characters").optional().or(z.literal("")),
  youtubeLink: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || /^https?:\/\/.+/.test(v),
      "Must be a valid URL (starting with http:// or https://)"
    ),
  channelLink: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || /^(@[A-Za-z0-9_]{4,}|https?:\/\/t\.me\/.+)/.test(v),
      "Use a @channel handle or https://t.me/... link"
    ),
  supportLink: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || /^https?:\/\/.+/.test(v),
      "Must be a valid URL (starting with http:// or https://)"
    ),
  adminNotes: z
    .string()
    .trim()
    .max(2000, "Maximum 2000 characters")
    .optional()
    .or(z.literal("")),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;
