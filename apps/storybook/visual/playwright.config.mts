import { defineConfig, devices } from "@playwright/test";

/**
 * Visual snapshot suite for every story in `storybook-static/`.
 *
 * Run it through Nx — it builds Storybook first, then serves the static export:
 *
 *   pnpm nx run storybook:visual                          # compare against the baselines
 *   pnpm nx run storybook:visual -- --grep <id-prefix>    # one component's stories
 *   pnpm nx run storybook:visual -- --update-snapshots    # re-baseline (see visual/README.md)
 *
 * Two viewports, one baseline folder each: `__screenshots__/mobile/<id>.png` and
 * `__screenshots__/desktop/<id>.png`. The tolerance (0.1% of pixels) lives in `visual.spec.ts`
 * and is never widened globally.
 */
const PORT = process.env.VISUAL_PORT ?? "6107";
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: ".",
  testMatch: "visual.spec.ts",
  // One folder per viewport, no OS suffix: the baselines are macOS-generated (see README.md).
  snapshotPathTemplate: "{snapshotDir}/{projectName}/{arg}{ext}",
  snapshotDir: "./__screenshots__",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"]],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    colorScheme: "light",
    locale: "en-IN",
    timezoneId: "Asia/Kolkata",
    // Without this, a retina Mac would capture 2x PNGs that a 1x machine could never match.
    deviceScaleFactor: 1,
    trace: "off",
    // Not a top-level `use` option: reduced motion freezes the `motion-safe:` transitions, scroll
    // smoothing and loops so entrances and carousels are in their end state.
    contextOptions: { reducedMotion: "reduce" },
  },
  webServer: {
    command: `node serve.mjs ../storybook-static ${PORT}`,
    cwd: import.meta.dirname,
    url: `${baseURL}/index.json`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      name: "mobile",
      use: { ...devices["Desktop Chrome"], viewport: { width: 360, height: 800 } },
    },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
  ],
});
