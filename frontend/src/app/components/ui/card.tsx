// frontend/src/lib/utils.ts
// Small utility helpers used across the app.

/**
 * Simple className joiner similar to `clsx` but tiny and dependency-free.
 * Accepts strings and falsy values and returns a space-joined string.
 */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default cn;
