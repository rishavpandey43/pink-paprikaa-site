import perfectionist from "eslint-plugin-perfectionist";
import tseslint from "typescript-eslint";

// The pre-commit auto-fix (`.lintstagedrc.json`): import order only. Sorting needs no type
// information, so this skips the type-aware program that makes the full config cost ~12s even for
// one file. Every other rule — and the failure when one is broken — stays in `nx lint`, which the
// pre-push hook (`pnpm precheck`) and CI run.
import { importSortRules } from "@pink-paprikaa-web/eslint-config/import-sort";

export default [
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs}"],
    languageOptions: { parser: tseslint.parser },
    plugins: { perfectionist },
    rules: importSortRules,
  },
];
