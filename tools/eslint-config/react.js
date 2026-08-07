import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tailwindcss from "eslint-plugin-tailwindcss";
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
  // `eslint-plugin-tailwindcss`@4.x (task 2's deferred install, task 8 wires
  // it up) — this major is "Made for Tailwind CSS v4"
  // (https://github.com/francoismassart/eslint-plugin-tailwindcss#readme),
  // confirmed by reading the installed 4.2.0's README, not assumed from the
  // package name.
  //
  // What is NOT set here: `settings.tailwindcss.cssConfigPath`. It is
  // mandatory per the plugin's own docs ("REQUIRED, as the default value may
  // not work out-of-the-box"), and — empirically, verified two ways: via
  // ESLint's Linter API directly, and by the very first `nx lint` after this
  // registration landed, which crashed `packages/ui:lint` outright — an
  // unresolvable path doesn't just skip checks, it throws ("Could not find
  // tailwindcss" / ENOENT on the theme file) at rule-init time, *before* any
  // classname is even inspected. So this is not a dormant-until-someone-
  // writes-a-classname landmine; it fails every consumer immediately. That
  // path is inherently per-consumer (this repo's Next apps keep it at
  // `src/app/global.css`; `packages/ui` keeps its Tailwind entry at
  // `.storybook/styles.css`), so it cannot be hardcoded correctly here in
  // the shared preset for every consumer at once — each consumer of
  // `react.js` (directly or via `next.js`) MUST add its own
  // `settings.tailwindcss.cssConfigPath` override. Next apps get theirs in
  // `next.js` (all of them share the same `src/app/global.css` App Router
  // convention); `packages/ui` sets its own in `packages/ui/eslint.config.mjs`.
  // A future consumer that composes `react.js` directly must do the same or
  // its `lint` target will fail immediately, not just once it writes a
  // classname.
  tailwindcss.configs.recommended,
];
