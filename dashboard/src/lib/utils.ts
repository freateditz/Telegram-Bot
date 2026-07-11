import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Concatenate Tailwind class names with conflict resolution.
 * Standard shadcn/ui helper.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
