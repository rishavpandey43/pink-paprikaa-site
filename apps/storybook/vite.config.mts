import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Storybook's builder config (`framework.options.builder.viteConfigPath` in `.storybook/main.ts`).
// It is deliberately minimal: this app has no Vite build or test of its own — `build-storybook`
// is the only thing that consumes it.
export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: "../../node_modules/.vite/apps/storybook",
  plugins: [react()],
}));
