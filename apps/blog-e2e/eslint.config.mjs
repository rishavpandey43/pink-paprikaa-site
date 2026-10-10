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
  // `packages/{ui,content,seo,utils}` and `apps/web-e2e`.
  {
    ignores: ["**/out-tsc"],
  },
  // `playwright.config.mts`'s `webServer.command` copies `apps/blog/out`
  // (the static export, containing bundled/minified `_next/static` JS) into
  // this scratch dir so it can be served under `/blog` — matching the
  // `basePath`. It's `.gitignore`d but ESLint doesn't read `.gitignore`, so
  // without this it lints Next's own minified build output as if it were
  // hand-written source.
  {
    ignores: ["**/.serve"],
  },
];
