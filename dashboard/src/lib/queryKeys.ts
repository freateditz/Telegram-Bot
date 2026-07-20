/**
 * Centralized React Query keys. Keeping them in one place makes cache
 * invalidation predictable — every mutation just has to invalidate the
 * right key here, never a string duplicated across files.
 */
export const queryKeys = {
  resources: {
    all: ["resources"] as const,
    list: () => [...queryKeys.resources.all, "list"] as const,
  },
  platforms: {
    all: ["platforms"] as const,
    list: () => [...queryKeys.platforms.all, "list"] as const,
  },
  categories: {
    all: ["categories"] as const,
    list: () => [...queryKeys.categories.all, "list"] as const,
  },
  projects: {
    all: ["projects"] as const,
    list: () => [...queryKeys.projects.all, "list"] as const,
  },
  settings: {
    all: ["settings"] as const,
    list: () => [...queryKeys.settings.all, "list"] as const,
  },
  users: {
    all: ["users"] as const,
    list: () => [...queryKeys.users.all, "list"] as const,
  },
};
