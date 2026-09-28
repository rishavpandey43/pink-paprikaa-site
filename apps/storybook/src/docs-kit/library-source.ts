/**
 * The source packages/ui ships — not its tests, specs or stories — as one string. Vite reads it at
 * build time, so a story in the browser and the node spec scan the same text.
 */
const FILES = import.meta.glob<string>(
  ["../../../../packages/ui/src/**/*.{ts,tsx,css}", "!**/*.{test,spec,stories}.*"],
  { query: "?raw", import: "default", eager: true }
);

export const LIBRARY_SOURCE = Object.values(FILES).join("\n");
