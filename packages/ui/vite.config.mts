import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: "../../node_modules/.vite/packages/ui",
  plugins: [react()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  test: {
    name: "@pink-paprikaa-web/ui",
    watch: false,
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // Every vi.spyOn is undone before the next test, so a test that fails mid-way leaks nothing.
    restoreMocks: true,
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    reporters: ["default"],
    coverage: {
      reportsDirectory: "./test-output/vitest/coverage",
      provider: "v8" as const,
    },
  },
}));
