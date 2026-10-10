import playwright from "eslint-plugin-playwright";

import baseConfig from "../../eslint.config.mjs";

export default [
  playwright.configs["flat/recommended"],
  ...baseConfig,
  {
    files: ["**/*.ts", "**/*.js"],
    // Override or add rules here
    rules: {},
  },
  // `typecheck`'s `tsc --build tsconfig.json --emitDeclarationOnly` emits
  // into `out-tsc/playwright` (see tsconfig.json's `outDir`); without this,
  // ESLint picks up those generated `.d.ts`/`.d.mts` files and the
  // type-aware project service fails to parse them (they're not covered by
  // any tsconfig `include`). Same pattern already used by
  // `packages/{ui,content,seo,utils}`.
  {
    ignores: ["**/out-tsc"],
  },
];
