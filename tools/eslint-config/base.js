import nx from "@nx/eslint-plugin";
import prettier from "eslint-config-prettier";
import perfectionist from "eslint-plugin-perfectionist";
import tseslint from "typescript-eslint";

import { importSortRules } from "./import-sort.js";
import namingConvention from "./rules/naming-convention.js";
import pinkPaprikaa from "./rules/plugin.js";

// `nx.configs["flat/base"]` registers the `@nx` plugin namespace (so
// `@nx/enforce-module-boundaries` below resolves) and ignores `.nx`.
//
// `nx.configs["flat/typescript"]` is intentionally NOT used here: it applies
// `typescript-eslint`'s plain `recommended` preset with several type-aware
// rules explicitly downgraded to `warn` (or off) rather than the
// `strictTypeChecked` + `stylisticTypeChecked` pairing this workspace
// requires (see spec §6/§13 — the whole point of pinning TypeScript to 6.x
// is to keep type-aware rules running at full strictness). Composing on it
// would silently weaken the ruleset the brief asks for, so strict
// type-checked config is applied directly instead.
export default tseslint.config(
  { ignores: ["**/dist", "**/out", "**/.next", "**/storybook-static", "**/node_modules"] },
  ...nx.configs["flat/base"],
  // Scoped via `extends` (a `tseslint.config()`-only feature: the referenced
  // configs' rules are applied constrained to this object's `files` glob)
  // rather than spread into the top-level array. Un-scoped — as this used to
  // be — `strictTypeChecked`/`stylisticTypeChecked` attach to every file
  // ESLint lints, including `**/*.json`, which `@nx/dependency-checks`
  // parses with `jsonc-eslint-parser` and no `parserOptions.project`. That
  // broke the JSON block for every consumer of this preset; only
  // `tools/image-pipeline/eslint.config.mjs` carried a local
  // `disableTypeChecked`-for-JSON workaround to compensate. Scoping here
  // makes that workaround unnecessary — removed there in the same change.
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // Underscore-prefixed = intentionally unused (ported convention).
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // LAW since the design system rewrite (drift ledger P-08 closed).
      "@typescript-eslint/naming-convention": ["error", ...namingConvention],
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    plugins: { perfectionist },
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: "type:app",
              onlyDependOnLibsWithTags: ["type:ui", "type:content", "type:util", "type:tokens"],
            },
            {
              sourceTag: "type:ui",
              onlyDependOnLibsWithTags: ["type:ui", "type:util", "type:tokens"],
            },
            { sourceTag: "type:content", onlyDependOnLibsWithTags: ["type:util"] },
            { sourceTag: "type:util", onlyDependOnLibsWithTags: ["type:util"] },
            { sourceTag: "type:tokens", onlyDependOnLibsWithTags: [] },
            { sourceTag: "scope:web", onlyDependOnLibsWithTags: ["scope:web", "scope:shared"] },
            { sourceTag: "scope:blog", onlyDependOnLibsWithTags: ["scope:blog", "scope:shared"] },
            { sourceTag: "scope:shared", onlyDependOnLibsWithTags: ["scope:shared"] },
          ],
        },
      ],
      ...importSortRules,

      // Curated core rules ported from a predecessor workspace (the subset
      // not already covered by strictTypeChecked/stylisticTypeChecked).
      eqeqeq: "error",
      "array-callback-return": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
      "max-lines": ["warn", { max: 500, skipComments: true, skipBlankLines: true }],
    },
  },
  // Workspace-wide `pink-paprikaa/no-raw-hex` for `.ts` files (CLAUDE.md rule 3), so base-only
  // consumers — content, seo, utils, image-pipeline, the e2e apps, and this file's own root
  // consumer — get raw-hex coverage without composing the React preset. `react.js` registers the
  // same rule name again for `.tsx`/`.jsx`, since JSX literal/text bodies are React-preset-only
  // surface this file never lints.
  {
    files: ["**/*.ts"],
    plugins: { "pink-paprikaa": pinkPaprikaa },
    rules: { "pink-paprikaa/no-raw-hex": "error" },
  },
  // Disable type-aware linting for plain JS config files.
  {
    files: ["**/*.js", "**/*.mjs"],
    ...tseslint.configs.disableTypeChecked,
  },
  prettier
);
