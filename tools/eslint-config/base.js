import js from "@eslint/js";
import nx from "@nx/eslint-plugin";
import prettier from "eslint-config-prettier";
import perfectionist from "eslint-plugin-perfectionist";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

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
export default defineConfig(
  { ignores: ["**/dist", "**/out", "**/.next", "**/storybook-static", "**/node_modules"] },
  ...nx.configs["flat/base"],
  // ESLint's own recommended rules. Listed before the TypeScript presets on purpose: those switch
  // off the ones TypeScript already covers (`no-undef`, `no-redeclare`, …) for `.ts`/`.tsx`.
  js.configs.recommended,
  // Scoped via `extends` (a `defineConfig()` feature: the referenced
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
      // `verbatimModuleSyntax` already makes tsc reject a type imported as a value; this adds the
      // autofix, so saving rewrites it to `import type`.
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
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
          // The in-project absolute aliases — `@/…` in apps, `#…` subpath imports in packages. Nx
          // otherwise rejects any non-relative import of a file in the importer's own project.
          // (`/**` is a prefix match; anything else is read as a regular expression.)
          allow: ["@/**", "^#"],
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
      "perfectionist/sort-imports": [
        "error",
        {
          // The monorepo tier: workspace packages, the apps' `@/` alias and a package's own `#`
          // subpath imports (`#ui/…`, see `imports` in its package.json).
          internalPattern: ["^@pink-paprikaa-web/.+", "^@/.+", "^#.+"],
          // v5 schema: a number of blank lines between groups ("always" = 1).
          newlinesBetween: 1,
          // Three tiers, a blank line between each: 1) packages (Node built-ins and npm),
          // 2) this monorepo, 3) relative paths. A type import sits beside the value imports of
          // its tier instead of the plugin default of one `import type` block at the top.
          groups: [
            ["value-builtin", "type-builtin", "value-external", "type-external"],
            ["value-internal", "type-internal"],
            [
              "value-parent",
              "type-parent",
              "value-sibling",
              "type-sibling",
              "value-index",
              "type-index",
            ],
            "ts-equals-import",
            "unknown",
          ],
        },
      ],
      "perfectionist/sort-named-imports": "error",

      // Curated core rules ported from a predecessor workspace (the subset
      // not already covered by strictTypeChecked/stylisticTypeChecked).
      eqeqeq: "error",
      "array-callback-return": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
      "max-lines": ["warn", { max: 500, skipComments: true, skipBlankLines: true }],
      "no-sequences": "error", // the comma operator hides a second expression
      "no-useless-concat": "error", // "a" + "b" is just "ab"
      "no-lone-blocks": "error", // a bare { } block that scopes nothing
      "no-template-curly-in-string": "error", // "${x}" in plain quotes was meant to be a template
      // A value import and a type import from one module are fine; two value imports are not.
      "no-duplicate-imports": ["error", { allowSeparateTypeImports: true }],
      // One or two `../` is fine; three or more means the file wants an absolute path. In an app
      // that is `@/…` (tsconfig `paths`). Package source is shipped to Next as-is, and Next cannot
      // resolve a package's `#` imports, so there the fix is to move the file or hoist the code.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: String.raw`^(\.\./){3,}`,
              message:
                "Three or more `../` — use the app's `@/` alias, or move the code closer. See docs/engineering/04.",
            },
          ],
        },
      ],
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
  // Plain JS in this repo is Node: scripts, build and tool configs. TypeScript files get their
  // globals from the compiler, so `no-undef` is only switched on here for `.js`/`.mjs`/`.cjs`.
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    languageOptions: { globals: globals.node },
  },
  // Disable type-aware linting for plain JS config files.
  {
    files: ["**/*.js", "**/*.mjs"],
    ...tseslint.configs.disableTypeChecked,
  },
  prettier
);
