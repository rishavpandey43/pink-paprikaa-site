const layerOrder = ["atoms", "molecules", "organisms", "layouts"];

/**
 * no-restricted-imports zones over the design system's four tiers — atoms → molecules →
 * organisms → layouts. In every tier a file may not import a layer above it (spec §7 rule 2) nor
 * the package barrel, by any spelling (`..`, `../..`, `../../`, `../../index`, `../../index.ts`).
 * An atom also imports no other atom but Icon, directly (`../text/text`) or by the roundabout
 * path (`../../atoms/text/text`). Everything else passes: `../../lib/*`, `../../assets/*`,
 * `../../styles.css`, `../../../vitest.setup`, packages. `atomic-layering.test.mjs` pins each case.
 *
 * Exported separately from `react.js` (not folded into the default react preset) because the
 * `files` pattern below — `src/<layer>` — is project-local, not workspace-global: ESLint's flat
 * config resolves `files` globs relative to the *base path*, which under `nx lint <project>` is
 * the linted project's own root (the directory of whichever `eslint.config.mjs` was
 * auto-discovered), not the repo root. There is no glob that can recover "am I `packages/ui`"
 * from inside a preset composed by every React project — the base path IS the project root, so
 * `src/atoms/**` looks structurally identical whether the project is `packages/ui` or some future
 * `apps/web`/`apps/blog` page bundle that happens to have its own `src/atoms/` directory for
 * unrelated reasons. Keeping these zones in the default `react.js` array would silently apply
 * atomic-layering restrictions to any such project the moment it composed the react preset.
 * Consuming projects that actually implement the atomic layer structure (currently only
 * `packages/ui`) opt in explicitly by also importing this export.
 */
const upperLayerPatterns = (layer) =>
  layerOrder.slice(layerOrder.indexOf(layer) + 1).map((upper) => ({
    group: [`**/${upper}/**`, `**/${upper}`],
    message: `Atomic layering: ${layer} cannot import from ${upper} (layers only go upward).`,
  }));

/** `src/index.ts` from inside `src/<tier>/<name>/`: import the component's own file instead. */
const barrelPattern = {
  regex: "^(?:\\.\\./)*\\.\\.(?:/(?:index(?:\\.[jt]sx?)?)?)?$",
  message: "Atomic layering: never import the package barrel from inside the package.",
};

const tierPatterns = (layer) => [...upperLayerPatterns(layer), barrelPattern];

const atomicLayering = [
  {
    files: ["**/src/atoms/**/*"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            ...tierPatterns("atoms"),
            {
              // Design system tier rule: "an atom imports nothing but Icon". A regex, not a
              // gitignore `group`: `../*` also matches `../..`, which flagged `../../lib/*` (probed).
              // Matches `../<sibling>` unless the sibling is `icon`; `../../lib` starts `../.` so passes.
              regex: "^\\.\\./(?!icon(?:/|$))[^./]",
              message:
                "Atomic layering: an atom may import only the Icon atom (plus ../../lib and packages).",
            },
            {
              // The same rule by the roundabout path: `../../atoms/text/text`.
              regex: "^(?:\\.\\./)+atoms/(?!icon(?:/|$))",
              message:
                "Atomic layering: an atom may import only the Icon atom (plus ../../lib and packages).",
            },
          ],
        },
      ],
    },
  },
  ...["molecules", "organisms", "layouts"].map((layer) => ({
    files: [`**/src/${layer}/**/*`],
    rules: { "no-restricted-imports": ["error", { patterns: tierPatterns(layer) }] },
  })),
];

export default atomicLayering;
