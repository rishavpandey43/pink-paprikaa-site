import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { join } from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Story tests — every story in `packages/ui` run as a Vitest test, in a real browser — plus the
 * docs-kit's node specs (the `docs-kit` project below).
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
 * the a11y addon throws on violations during a Vitest run — but much of what axe checks (focus
 * visibility, computed roles and names from real CSS) needs layout and a resolved stylesheet,
 * which jsdom does not have. Here the stories render in headless Chromium with Tailwind applied,
 * so the two suites complement rather than duplicate each other. (`color-contrast` is off in both:
 * the token contrast policy owns it — see the comment on the rule in `preview.tsx`.)
 */
export default defineConfig({
  test: {
    // `nx.json` runs the inferred `test` target as bare `vitest` (testMode: "watch"), so the config
    // is what makes a plain `nx test` a single run — same convention as `packages/ui`. Pass
    // `--watch` on the command line to opt back in.
    watch: false,
    reporters: ["default"],
    projects: [
      {
        extends: true,
        plugins: [
          // `@storybook/react-vite`'s preset contributes only the docgen plugins — the JSX transform
          // comes from the *builder* config (`vite.config.mts`), which `storybookTest` does not load.
          // Without this, `.storybook/preview.tsx` reaches vite:import-analysis as raw JSX and every
          // story file fails with "content contains invalid JS syntax".
          react(),
          storybookTest({
            // The Storybook CLI's `MainFileMissingError` is what you get if this points anywhere
            // without a `main.ts` — including the workspace root.
            configDir: join(import.meta.dirname, ".storybook"),
            // Watch mode only: if no Storybook is already serving, start one so failure output can
            // link to the failing story. Ignored by a single-shot `vitest run`.
            storybookScript: "pnpm nx run @pink-paprikaa-web/storybook:storybook --quiet",
            storybookUrl: "http://localhost:6006",
          }),
        ],
        // Pre-bundled up front, so a first cold run cannot re-optimise mid-run and fail its stories
        // with "Failed to fetch dynamically imported module … sb-vitest/deps/…" (2a batch C hit it
        // on the react-dom shim). `storybookTest` already lists its own setup files; these are the
        // preview-side deps addon-docs injects. The bare `@storybook/react-dom-shim` id is an alias
        // `optimizeDeps.include` cannot resolve ("Failed to resolve dependency"), so the shim is
        // named through the package that depends on it.
        optimizeDeps: {
          include: [
            "@storybook/addon-docs > @storybook/react-dom-shim",
            "@storybook/addon-docs > @mdx-js/react",
          ],
        },
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
            // A failing story is diagnosed from the assertion and the story URL; writing PNGs into
            // the project on every failure is noise the repo would then have to gitignore.
            screenshotFailures: false,
          },
        },
      },
      {
        // Node-side specs over the docs-kit — checks that read the library's source files
        // (`src/**/*.spec.ts`), which a story running in the browser cannot.
        extends: true,
        test: {
          name: "docs-kit",
          environment: "node",
          include: ["src/**/*.spec.ts"],
        },
      },
    ],
  },
});
