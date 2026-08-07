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

const layerOrder = ["atoms", "molecules", "organisms", "templates"];

/**
 * no-restricted-imports zones: a layer may not import from any layer above it (spec §7 rule 2).
 *
 * The `files` pattern is anchored on `src/<layer>`, not `packages/ui/src/<layer>`. ESLint's flat
 * config resolves `files` globs relative to the *base path* — the directory of whichever
 * `eslint.config.mjs` was auto-discovered — and when `nx lint <project>` runs `eslint .` with
 * `cwd` set to the package root, that base path IS the package root (`packages/ui`), so the file
 * path ESLint matches against is already relative to it (`src/atoms/foo.ts`, not
 * `packages/ui/src/atoms/foo.ts`). A `packages/ui/`-prefixed pattern silently never matches under
 * that invocation and only appeared to work when linting via an explicit `--config` flag from the
 * repo root, which uses `cwd` (the repo root) as the base path instead — a different code path
 * `nx lint` never takes. Anchoring the pattern on `src/<layer>` and leading it with a globstar
 * matches both cases: the globstar absorbs the `packages/ui/` prefix when the base path is the
 * repo root, and absorbs nothing when the base path is already the package root.
 */
const atomicLayering = layerOrder.slice(0, -1).map((layer, i) => ({
  files: [`**/src/${layer}/**/*`],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: layerOrder.slice(i + 1).map((upper) => ({
          group: [`**/${upper}/**`, `**/${upper}`],
          message: `Atomic layering: ${layer} cannot import from ${upper} (layers only go upward).`,
        })),
      },
    ],
  },
}));

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
  ...atomicLayering,
];
