import type { StorybookConfig } from "@storybook/react-vite";

import tailwindcss from "@tailwindcss/vite";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const config: StorybookConfig = {
  stories: ["../src/lib/**/*.@(mdx|stories.@(js|jsx|ts|tsx))"],
  addons: ["@storybook/addon-a11y"],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {
      builder: {
        viteConfigPath: "vite.config.mts",
      },
    },
  },
  viteFinal(config) {
    return {
      ...config,
      plugins: [...(config.plugins ?? []), tailwindcss()],
    };
  },
};

function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

export default config;

// To customize your Vite configuration you can use the viteFinal field.
// Check https://storybook.js.org/docs/react/builders/vite#configuration
// and https://nx.dev/recipes/storybook/custom-builder-configs
