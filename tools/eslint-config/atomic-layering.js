const layerOrder = ["atoms", "molecules", "organisms", "layouts"];

/**
 * no-restricted-imports zones over the design system's four tiers — atoms → molecules →
 * organisms → layouts. In every tier a file may not import a layer above it (spec §7 rule 2) nor
 * the package barrel, by any spelling (`..`, `../..`, `../../`, `../../index`, `../../index.ts`,
 * `../../../src/index`, or the package's own name `@pink-paprikaa-web/ui`, ruling R41).
 * An atom also imports no other atom but Icon and Typography (Link renders through Typography,
 * ruling 2026-10-04), directly (`../badge/badge`) or by the roundabout path
 * (`../../atoms/badge/badge`). Everything else passes: `../../lib/*`, `../../assets/*`,
 * `../../styles.css`, `../../../vitest.setup`, packages. `src/lib/` is not a tier, but the barrel
 * and self-package bans cover it too (R41): library internals are imported by the atoms, so a lib
 * file reaching the barrel would be a cycle — as would a lib file reaching a molecule, organism,
 * layout or any atom but Icon. `atomic-layering.test.mjs` pins each case.
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

/**
 * `src/index.ts` from inside `src/<tier>/<name>/`: import the component's own file instead. The
 * optional `/src` segment catches the roundabout `../../../src/index`.
 */
const barrelPattern = {
  regex: "^(?:\\.\\./)*\\.\\.(?:/src)?(?:/(?:index(?:\\.[jt]sx?)?)?)?$",
  message: "Atomic layering: never import the package barrel from inside the package.",
};

/** The package by its own name (any subpath) resolves to the barrel or around it. */
const selfPackagePattern = {
  regex: "^@pink-paprikaa-web/ui(?:/|$)",
  message: "Atomic layering: never import @pink-paprikaa-web/ui from inside the package.",
};

const tierPatterns = (layer) => [...upperLayerPatterns(layer), barrelPattern, selfPackagePattern];

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
              // Matches `../<sibling>` unless the sibling is `icon` or `typography`; `../../lib` starts `../.` so passes.
              regex: "^\\.\\./(?!(?:icon|typography)(?:/|$))[^./]",
              message:
                "Atomic layering: an atom may import only the Icon and Typography atoms (plus ../../lib and packages).",
            },
            {
              // The same rule by the roundabout path: `../../atoms/badge/badge`.
              regex: "^(?:\\.\\./)+atoms/(?!(?:icon|typography)(?:/|$))",
              message:
                "Atomic layering: an atom may import only the Icon and Typography atoms (plus ../../lib and packages).",
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
  {
    files: ["**/src/lib/**/*"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            barrelPattern,
            selfPackagePattern,
            {
              // The atoms import lib, so lib sits below every tier: a lib file reaching a molecule,
              // organism or layout — or an atom other than Icon — would be a cycle.
              group: ["**/molecules/**", "**/organisms/**", "**/layouts/**"],
              message: "Atomic layering: lib cannot import a tier above the atoms.",
            },
            {
              regex: "^(?:\\.\\./)+(?:src/)?atoms/(?!icon(?:/|$))",
              message: "Atomic layering: lib may import only the Icon atom.",
            },
          ],
        },
      ],
    },
  },
];

export default atomicLayering;
