import js from "@eslint/js";
import nx from "@nx/eslint-plugin";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import importX from "eslint-plugin-import-x";
import perfectionist from "eslint-plugin-perfectionist";
import prettierRecommended from "eslint-plugin-prettier/recommended";
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
  // Read-only or verbatim files no project owns. .prettierignore skips the same three.
  { ignores: ["**/zip-files/**", "**/.github/skills/**", "**/docs/superpowers/records/**"] },
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
    plugins: { perfectionist, "import-x": importX },
    settings: {
      // File extensions and the TypeScript parser, as the plugin ships them for TS projects.
      "import-x/extensions": importX.flatConfigs.typescript.settings["import-x/extensions"],
      "import-x/external-module-folders": ["node_modules", "node_modules/@types"],
      // `no-named-as-default(-member)` is for OUR modules mixing default and named exports. A
      // third-party package's own shape is not ours to change — `import sharp from "sharp"` is how
      // it is documented, and a named import of a CommonJS package can be undefined at runtime —
      // so packages in `node_modules` are not analysed.
      "import-x/ignore": ["node_modules"],
      "import-x/parsers": importX.flatConfigs.typescript.settings["import-x/parsers"],
      // Without a TypeScript-aware resolver `no-named-as-default(-member)` cannot find a `.ts`
      // module's exports and silently reports nothing.
      "import-x/resolver-next": [createTypeScriptImportResolver({ alwaysTryTypes: true })],
    },
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
      // The import rules of the reference setup, from `eslint-plugin-import-x` (the maintained,
      // flat-config fork: `eslint-plugin-import` does not support ESLint 10). `no-duplicates` is
      // autofixable and merges two value imports of one module; a type import beside a value
      // import stays separate. Known fixer bug: for `import type { A } from "x"` plus
      // `import { type B, C } from "x"` its autofix writes `import type { type B, C, A }`, turning
      // the value `C` into a type-only import — `tsc` rejects that at once, so merge such a pair by
      // hand into one `import { type B, C, type A }`.
      "import-x/no-duplicates": "error",
      "import-x/no-named-as-default": "error", // `import api from "./api"` when `api` is also a named export
      "import-x/no-named-as-default-member": "error", // `api.fetch` when `fetch` is a named export
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
  // Last on purpose. Runs Prettier as the `prettier/prettier` rule (so `eslint --fix` formats, with
  // `.prettierrc` and its Tailwind class-order plugin) and switches off every ESLint rule that
  // would fight it (`eslint-config-prettier`, bundled in the recommended config).
  prettierRecommended
);
