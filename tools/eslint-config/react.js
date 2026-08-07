import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

import base from "./base.js";
import noRawHex from "./rules/no-raw-hex.js";

// Nx also ships `@nx/eslint-plugin`'s `flat/react*` presets, but they are a
// port of the old create-react-app config (mostly `warn` severities,
// requires `eslint-plugin-import`, predates the plugins' own current
// recommended flat configs) — composing on them would replace the actively
// maintained `react.configs.flat.recommended` / `reactHooks.configs
// ["recommended-latest"]` / `jsxA11y.flatConfigs.recommended` rulesets below
// with a stricter-on-paper-but-actually-weaker legacy one. Using each
// plugin's own documented flat preset directly instead.

const layerOrder = ["atoms", "molecules", "organisms", "templates"];

/** no-restricted-imports zones: a layer may not import from any layer above it (spec §7 rule 2). */
const atomicLayering = layerOrder.slice(0, -1).map((layer, i) => ({
  files: [`**/packages/ui/src/${layer}/**/*`],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: layerOrder.slice(i + 1).map((upper) => ({
          group: [`**/${upper}/*`, `**/${upper}`],
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
    settings: { react: { version: "detect" } },
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
