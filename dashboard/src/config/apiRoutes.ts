/**
 * REST API route constants.
 *
 * Mirrors the backend's `shared/apiRoutes.js` so we never type a URL
 * by hand. Add new endpoints here when the backend adds them — do not
 * scatter endpoint strings across services.
 *
 * IMPORTANT: the Axios `baseURL` is already `/api`, so every path below
 * MUST be relative to that — never start a path with `/api` here.
 */
export const API_ROUTES = {
  health: "/health",
  platforms: {
    base: "/platforms",
    byId: (id: number | string) => `/platforms/${id}`,
  },
  categories: {
    base: "/categories",
    byId: (id: number | string) => `/categories/${id}`,
  },
  projects: {
    base: "/projects",
    byId: (id: number | string) => `/projects/${id}`,
  },
  channels: {
    base: "/channels",
    byId: (id: number | string) => `/channels/${id}`,
  },
  resources: {
    base: "/resources",
    byId: (id: number | string) => `/resources/${id}`,
    menu: (platform: string, category: string) =>
      `/menu/${platform}/${category}`,
    detail: (platform: string, slug: string) =>
      `/resource/${platform}/${slug}`,
  },
  settings: {
    base: "/settings",
    byId: (id: number | string) => `/settings/${id}`,
  },
  users: {
    base: "/users",
    byId: (id: number | string) => `/users/${id}`,
  },
} as const;
