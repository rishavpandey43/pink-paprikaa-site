import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Storybook's builder config (`framework.options.builder.viteConfigPath` in `.storybook/main.ts`).
// It is deliberately minimal: this app has no Vite build or test of its own — `build-storybook`
// is the only thing that consumes it.

/**
 * `@/…` → this app's `src/…`, the same alias `paths` gives `tsc` in `tsconfig.storybook.json`.
 * The anchored regex keeps it off scoped packages such as `@storybook/…`. `vitest.config.mts`
 * reuses it, because Vitest does not read this file.
 */
export const srcAlias = [{ find: /^@\//, replacement: `${import.meta.dirname}/src/` }];

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: "../../node_modules/.vite/apps/storybook",
  plugins: [react()],
  resolve: { alias: srcAlias },
}));
