// The pre-commit auto-fix (`.lintstagedrc.json`): import order only. Sorting needs no type
// information, so this skips the type-aware program that makes the full config cost ~12s even for
// one file. Every other rule — and the failure when one is broken — stays in `nx lint`, which the
// pre-push hook (`pnpm precheck`) and CI run.

import perfectionist from "eslint-plugin-perfectionist";
import tseslint from "typescript-eslint";

import { importSortRules } from "@pink-paprikaa-web/eslint-config/import-sort";

// A file may carry `// eslint-disable some-plugin/some-rule` for a rule this config does not load,
// and ESLint reports each such comment as an error — which would fail the commit. These stand-in
// plugins define every rule as a no-op so those comments resolve, without loading the real plugins.
// A namespace missing here shows up as "Definition for rule '<ns>/…' was not found": add it.
const noop = { create: () => ({}) };
const standIn = { rules: new Proxy({}, { get: () => noop, has: () => true }) };
const STAND_IN_NAMESPACES = [
  "@next/next",
  "@nx",
  "@typescript-eslint",
  "jsx-a11y",
  "pink-paprikaa",
  "react",
  "react-hooks",
  "tailwindcss",
];

export default [
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs}"],
    languageOptions: { parser: tseslint.parser },
    // The stand-ins never report, so every disable comment would read as unused here; the full
    // config in `nx lint` is where unused directives are judged.
    linterOptions: { reportUnusedDisableDirectives: "off" },
    plugins: {
      ...Object.fromEntries(STAND_IN_NAMESPACES.map((name) => [name, standIn])),
      perfectionist,
    },
    rules: importSortRules,
  },
];
