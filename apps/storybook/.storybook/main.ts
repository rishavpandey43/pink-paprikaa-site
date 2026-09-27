import type { StorybookConfig } from "@storybook/react-vite";
import type { Plugin } from "vite";

import tailwindcss from "@tailwindcss/vite";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import remarkGfm from "remark-gfm";

const WORKSPACE_ROOT = fileURLToPath(new URL("../../../", import.meta.url));

const config: StorybookConfig = {
  // Storybook is its own app; the stories it renders live in the design system library, so the
  // globs reach out of this project into `packages/ui` (three levels up: `.storybook/` →
  // `apps/storybook/` → `apps/` → workspace root).
  stories: [
    // Foundations, kits and docs owned by the Storybook app itself.
    "../src/**/*.mdx",
    "../src/**/*.stories.@(ts|tsx)",
    // Component stories live beside the components in the design system library.
    "../../../packages/ui/src/**/*.mdx",
    "../../../packages/ui/src/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    {
      name: "@storybook/addon-docs",
      options: {
        // MDX 3 implements CommonMark only — GitHub-Flavored Markdown is NOT included. Without
        // `remark-gfm`, a `| a | b |` table is parsed as a plain paragraph and renders as raw pipe
        // characters, which is exactly how every Foundations table first shipped. GFM also restores
        // strikethrough, task lists and bare-URL autolinks.
        mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } },
      },
    },
    "@storybook/addon-a11y",
    // Turns every story into a Vitest test. The addon contributes the manager-side Testing panel
    // (run/watch stories from the sidebar); the run itself is configured in `vitest.config.mts`,
    // which applies the same `configDir` this file lives in. Registering it here is what makes the
    // panel appear and what lets a11y findings surface next to the component-test result.
    "@storybook/addon-vitest",
    // Visual Tests (Chromatic). Registering the addon is inert until a Chromatic project token is
    // configured — see `apps/storybook/README.md`. It never blocks `build-storybook`.
    "@chromatic-com/storybook",
  ],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {
      builder: {
        viteConfigPath: "vite.config.mts",
      },
    },
  },
  typescript: {
    // Props tables are the design system's API documentation — they must come from the real
    // TypeScript props types, not from inferred defaults.
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      // Without this, every prop inherited from React's HTML element types floods the table.
      propFilter: (prop) => !(prop.parent?.fileName ?? "").includes("node_modules"),
      // The two settings below are the only thing the move out of `packages/ui` changed; the rest
      // of this config is verbatim. Both exist because the docgen plugin resolves everything
      // relative to the *Vite root* — which is now this app, not the library:
      //
      //   `include`      — its default is `**/*.tsx` globbed from the Vite root, which matches
      //                    nothing here. Left alone, the plugin skips every component with
      //                    "not included in the active TypeScript project" and every props table
      //                    ships empty.
      //   `tsconfigPath` — its default is the Vite root's `tsconfig.json`. Both this app's and the
      //                    library's are solution-style (`files: []`), so the program the parser
      //                    builds has no real sources in it and falls back to whatever stale
      //                    declarations sit in `packages/ui/dist` — 6 components documented out of
      //                    69. Pointing at the library's leaf config documents all 69.
      include: ["../../packages/ui/src/**/*.tsx"],
      tsconfigPath: "../../packages/ui/tsconfig.lib.json",
    },
  },
  // pnpm's bin shims export `NODE_PATH` (absolute store paths under the builder's home directory),
  // and Storybook bakes its `env` preset into the addon manager bundles as `process.env`. Nothing in
  // the browser reads it, so it is blanked rather than shipped.
  env: (config) => ({ ...config, NODE_PATH: "" }),
  viteFinal(config) {
    return {
      ...config,
      plugins: [...(config.plugins ?? []), tailwindcss(), relativeDocgenPaths()],
    };
  },
};

/**
 * react-docgen-typescript stamps each component's *absolute* source path into its `__docgenInfo`
 * (`filePath`), and neither it nor its Vite plugin has an option to change that — so every build
 * would carry the builder's home directory (and trip the founder-name guard). This rewrites the
 * path to workspace-relative after the docgen plugin has appended its JSON.
 */
function relativeDocgenPaths(): Plugin {
  const absolute = `"filePath":${JSON.stringify(WORKSPACE_ROOT).slice(0, -1)}`;
  return {
    name: "pink-paprikaa:relative-docgen-paths",
    enforce: "post",
    transform(code) {
      return code.includes(absolute)
        ? { code: code.replaceAll(absolute, '"filePath":"'), map: null }
        : null;
    },
  };
}

function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

export default config;

// To customize your Vite configuration you can use the viteFinal field.
// Check https://storybook.js.org/docs/react/builders/vite#configuration
// and https://nx.dev/recipes/storybook/custom-builder-configs
