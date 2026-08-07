import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import { createRequire } from "node:module";

import base from "./base.js";
import noRawHex from "./rules/no-raw-hex.js";

// `settings.react.version: "detect"` crashes under ESLint 10's flat config:
// eslint-plugin-react@7.37.5 (the current `latest` — no newer release fixes
// this) calls `context.getFilename()` from its version-detection path, an API
// ESLint 9+ removed from the rule context. This only surfaces once a rule
// that queries the React version actually runs against a real component
// (e.g. `react/display-name`), which is why it wasn't caught until
// `packages/ui` had real .tsx files. Resolving the installed `react` version
// once, at config-load time via `createRequire`, gets the same
// self-updating behaviour `"detect"` was meant to provide without going
// through the broken runtime code path.
const reactVersion = createRequire(import.meta.url)("react/package.json").version;

// Nx also ships `@nx/eslint-plugin`'s `flat/react*` presets, but they are a
// port of the old create-react-app config (mostly `warn` severities,
// requires `eslint-plugin-import`, predates the plugins' own current
// recommended flat configs) — composing on them would replace the actively
// maintained `react.configs.flat.recommended` / `reactHooks.configs
// ["recommended-latest"]` / `jsxA11y.flatConfigs.recommended` rulesets below
// with a stricter-on-paper-but-actually-weaker legacy one. Using each
// plugin's own documented flat preset directly instead.

export default [
  ...base,
  {
    files: ["**/*.tsx", "**/*.jsx"],
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      "pink-paprikaa": { rules: { "no-raw-hex": noRawHex } },
    },
    settings: { react: { version: reactVersion } },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs["recommended-latest"].rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "pink-paprikaa/no-raw-hex": "error",
    },
  },
  {
    files: ["**/*.ts"],
    plugins: { "pink-paprikaa": { rules: { "no-raw-hex": noRawHex } } },
    rules: { "pink-paprikaa/no-raw-hex": "error" },
  },
];
