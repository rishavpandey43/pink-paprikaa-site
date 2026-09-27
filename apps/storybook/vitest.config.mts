import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

/**
 * Story tests — every story in `packages/ui` run as a Vitest test, in a real browser.
 *
 * This is a *separate* config from `vite.config.mts` on purpose:
 *
 *   - `vite.config.mts` is Storybook's builder config (`framework.options.builder.viteConfigPath`).
 *     It must stay free of the `storybookTest` plugin, or building Storybook would recurse into the
 *     plugin that loads Storybook.
 *   - `@nx/vitest` infers a `test` target from any `vitest.config.*`, so this file is what gives
 *     `apps/storybook` its own `test` target. The library's jsdom suite
 *     (`@pink-paprikaa-web/ui:test`, from `packages/ui/vite.config.mts`) is untouched: different
 *     project, different config, different target. `nx run-many -t test` runs both.
 *
 * Browser mode, not jsdom, is deliberate. `preview.tsx` sets `parameters.a11y.test = "error"`, and
 * the a11y addon throws on violations during a Vitest run — but half of what axe checks (colour
 * contrast, focus visibility, computed roles from real CSS) needs layout and a resolved
 * stylesheet, which jsdom does not have. That is exactly why `packages/ui/vitest.setup.ts` has to
 * disable `color-contrast` in its own jsdom suite. Here the stories render in headless Chromium
 * with Tailwind applied, so the contrast rule runs for real and the two suites complement rather
 * than duplicate each other.
 */
export default defineConfig({
  plugins: [
    // `@storybook/react-vite`'s preset contributes only the docgen plugins — the JSX transform
    // comes from the *builder* config (`vite.config.mts`), which `storybookTest` does not load.
    // Without this, `.storybook/preview.tsx` reaches vite:import-analysis as raw JSX and every
    // story file fails with "content contains invalid JS syntax".
    react(),
    storybookTest({
      // Relative to this file. The Storybook CLI's `MainFileMissingError` is what you get if this
      // points anywhere without a `main.ts` — including the workspace root.
      configDir: ".storybook",
      // Watch mode only: if no Storybook is already serving, start one so failure output can link
      // to the failing story. Ignored by a single-shot `vitest run`.
      storybookScript: "pnpm nx run @pink-paprikaa-web/storybook:storybook --quiet",
      storybookUrl: "http://localhost:6006",
    }),
  ],
  test: {
    name: "storybook",
    // `nx.json` runs the inferred `test` target as bare `vitest` (testMode: "watch"), so the config
    // is what makes a plain `nx test` a single run — same convention as `packages/ui`. Pass
    // `--watch` on the command line to opt back in.
    watch: false,
    // Temporary: no stories exist until plan 1 task 7 (Icon, Logo). Remove with that task.
    passWithNoTests: true,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
      // A failing story is diagnosed from the assertion and the story URL; writing PNGs into the
      // project on every failure is noise the repo would then have to gitignore.
      screenshotFailures: false,
    },
    reporters: ["default"],
  },
});
