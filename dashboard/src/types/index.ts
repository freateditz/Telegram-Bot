/**
 * Domain types. These mirror the Prisma models in
 * `backend/prisma/schema.prisma`. Keep in sync when the schema changes.
 */

export interface Platform {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  displayOrder: number;
  createdAt: string;
}

export interface Resource {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  version: string | null;
  platformId: number;
  categoryId: number;
  downloadLink: string | null;
  fixLink: string | null;
  tutorialChannelId: string | null;
  tutorialMessageId: number | null;
  displayOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  platform?: Platform;
  category?: Category;
}

export interface Setting {
  id: number;
  key: string;
  value: string;
}

export interface User {
  id: number;
  telegramId: string;
  verified: boolean;
  createdAt: string;
}

/**
 * A source Telegram channel that holds project file messages. The
 * bot reads the message directly from the channel — projects never
 * need a `telegramFileId` once they reference a channel.
 */
export interface Channel {
  id: number;
  name: string;
  channelId: string;
  username: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { projects: number };
}

export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  // New delivery model.
  channelId: number | null;
  messageId: number | null;
  channel: Pick<Channel, "id" | "name" | "channelId" | "username" | "isActive"> | null;
  // Legacy delivery model (kept for backward compatibility).
  telegramFileId: string | null;
  telegramMessageLink: string | null;
  thumbnail: string | null;
  isActive: boolean;
  viewCount: number;
  downloadCount: number;
  failedVerificationCount: number;
  lastViewedAt: string | null;
  lastDownloadedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/* -- Input shapes (create / update) ------------------------------------ */

export type PlatformInput = Pick<Platform, "name" | "slug">;

export type CategoryInput = Pick<Category, "name" | "slug" | "displayOrder">;

export type ResourceInput = Omit<
  Resource,
  "id" | "createdAt" | "updatedAt" | "platform" | "category"
>;

export type ResourceUpdateInput = Partial<ResourceInput>;

export type SettingInput = Pick<Setting, "key" | "value">;

export type ChannelInput = Pick<
  Channel,
  "name" | "channelId" | "username" | "isActive"
>;

export type ChannelUpdateInput = Partial<ChannelInput>;

export type ProjectInput = Omit<
  Project,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "downloadCount"
  | "lastDownloadedAt"
  | "viewCount"
  | "failedVerificationCount"
  | "lastViewedAt"
  | "channel"
>;
