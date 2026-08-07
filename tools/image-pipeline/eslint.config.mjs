import baseConfig from "../../eslint.config.mjs";

export default [
  ...baseConfig,
  // `strictTypeChecked`/`stylisticTypeChecked` in `tools/eslint-config/base.js` are now scoped to
  // `**/*.ts`/`.tsx`/`.mts`/`.cts` via `extends`, so the `@nx/dependency-checks` block below no
  // longer inherits type-aware TS rules it can't satisfy — the local `disableTypeChecked`-for-JSON
  // workaround this block used to need is gone.
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
