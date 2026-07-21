import { z } from "zod";

/**
 * Client-side validation for the channel form. Mirrors the backend's
 * rules: the channel id must be a numeric chat id starting with -100
 * (the same shape Telegram uses for supergroup channel ids), and the
 * name must be globally unique. Username is optional and gets a
 * leading "@" if the user didn't include one.
 */
const CHANNEL_ID_REGEX = /^-100\d{6,}$/;

export const channelFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  channelId: z
    .string()
    .trim()
    .regex(
      CHANNEL_ID_REGEX,
      "Channel ID must start with -100 followed by digits (e.g. -1002948573940)"
    ),
  username: z
    .string()
    .trim()
    .transform((v) => (v ? v.replace(/^@/, "") : "")),
  isActive: z.boolean(),
});

export type ChannelFormValues = z.infer<typeof channelFormSchema>;
