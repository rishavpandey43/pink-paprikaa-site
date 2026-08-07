import baseConfig from "../../eslint.config.mjs";
import tseslint from "typescript-eslint";

export default [
  ...baseConfig,
  // `strictTypeChecked`/`stylisticTypeChecked` in tools/eslint-config/base.js apply with no
  // `files` restriction, so without this the `@nx/dependency-checks` block below inherits
  // type-aware TS rules it can't satisfy (jsonc-eslint-parser has no `parserOptions.project`).
  // Mirrors the existing `**/*.js`/`**/*.mjs` disable-type-checked block in base.js.
  {
    files: ["**/*.json"],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        {
          ignoredFiles: [
            "{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}",
            "{projectRoot}/vitest.config.{js,ts,mjs,mts}",
          ],
        },
      ],
    },
    languageOptions: {
      parser: await import("jsonc-eslint-parser"),
    },
  },
  {
    ignores: ["**/out-tsc"],
  },
];
