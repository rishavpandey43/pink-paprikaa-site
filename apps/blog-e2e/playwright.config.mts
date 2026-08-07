import { defineConfig, devices } from "@playwright/test";
import { nxE2EPreset } from "@nx/playwright/preset";
import { workspaceRoot } from "@nx/devkit";

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env.BASE_URL ?? "http://localhost:4301";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import 'dotenv/config';

/**
 * See https://playwright.dev/docs/test-configuration.
 *
 * Generated as a .mts file so Node forces ESM regardless of workspace
 * `type`. Playwright routes `.mts` through its ESM loader (dynamic import,
 * bypassing the pirates CJS-compile path), and Nx's native TS strip loads
 * `.mts` directly. Playwright's configLoader auto-discovers
 * `playwright.config.mts` via its extension list
 * (.ts/.js/.mts/.mjs/.cts/.cjs).
 */
export default defineConfig({
  ...nxE2EPreset(import.meta.dirname, { testDir: "./src" }),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },
  /* Serve the real static export (spec §10 — this is what Task 12's CI,
   * Lighthouse and founder-gate consume from `apps/blog/out/`), not
   * `next dev`. `basePath: "/blog"` means the exported HTML's asset URLs
   * expect to live under `/blog`, so the export is mounted at `/blog` in a
   * scratch dir rather than served at the root — this matches production,
   * where the blog is deployed under `/blog` on the marketing domain. The
   * e2e target depends on `blog:build` producing `out/` first (see
   * `apps/blog-e2e/package.json`). */
  webServer: {
    command:
      "rm -rf apps/blog-e2e/.serve && mkdir -p apps/blog-e2e/.serve && cp -R apps/blog/out apps/blog-e2e/.serve/blog && pnpm exec serve apps/blog-e2e/.serve -l 4301",
    url: "http://localhost:4301/blog",
    reuseExistingServer: !process.env.CI,
    cwd: workspaceRoot,
  },
  // Only chromium is installed (`pnpm exec playwright install chromium`) —
  // firefox/webkit are the generator's defaults, added back if/when this
  // workspace needs cross-browser e2e coverage.
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
