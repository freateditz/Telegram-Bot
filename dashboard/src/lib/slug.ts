/**
 * Convert a free-text name to a URL-safe slug. Mirrors the backend's
 * `toSlug` so the form can pre-fill the slug field consistently.
 */
export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
