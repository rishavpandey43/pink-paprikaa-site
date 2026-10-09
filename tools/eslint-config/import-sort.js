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
    },
  ],
  "perfectionist/sort-named-imports": "error",
};
