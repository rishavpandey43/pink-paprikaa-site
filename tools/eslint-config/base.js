import nx from "@nx/eslint-plugin";
import prettier from "eslint-config-prettier";
import perfectionist from "eslint-plugin-perfectionist";
import tseslint from "typescript-eslint";

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
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
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
      "perfectionist/sort-imports": "error",
      "perfectionist/sort-named-imports": "error",
    },
  },
  // Disable type-aware linting for plain JS config files.
  {
    files: ["**/*.js", "**/*.mjs"],
    ...tseslint.configs.disableTypeChecked,
  },
  prettier
);
