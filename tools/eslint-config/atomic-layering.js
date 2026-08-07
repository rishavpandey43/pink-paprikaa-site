const layerOrder = ["atoms", "molecules", "organisms", "templates"];

/**
 * no-restricted-imports zones: a layer may not import from any layer above it (spec §7 rule 2).
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

export default atomicLayering;
