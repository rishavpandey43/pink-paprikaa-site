// The import-order rules, on their own so the pre-commit auto-fix (`eslint.fix.config.mjs`) can load
// them without `base.js`'s type-aware setup. `base.js` spreads the same object, so the committed
// fix and the lint gate can never disagree about what sorted means.
export const importSortRules = {
  "perfectionist/sort-imports": [
    "error",
    {
      // Workspace packages and the apps' `@/` self-alias sort as
      // "internal": after external packages, before relative imports.
      internalPattern: ["^@pink-paprikaa-web/.+", "^@/.+"],
      // v5 schema: a number of blank lines between groups ("always" = 1).
      newlinesBetween: 1,
      // Three tiers, a blank line between each: 1) packages (Node built-ins and npm),
      // 2) this monorepo (`@pink-paprikaa-web/*`, `@/`), 3) relative paths. A type import sits
      // beside the value imports of its tier instead of the plugin default of one `import type`
      // block at the very top.
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
};
