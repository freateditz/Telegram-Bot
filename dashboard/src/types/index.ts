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
  downloadLink: string;
  fixLink: string;
  tutorialChannelId: string;
  tutorialMessageId: number;
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

/* -- Input shapes (create / update) ------------------------------------ */

export type PlatformInput = Pick<Platform, "name" | "slug">;

export type CategoryInput = Pick<Category, "name" | "slug" | "displayOrder">;

export type ResourceInput = Omit<
  Resource,
  "id" | "createdAt" | "updatedAt" | "platform" | "category"
>;

export type ResourceUpdateInput = Partial<ResourceInput>;

export type SettingInput = Pick<Setting, "key" | "value">;
