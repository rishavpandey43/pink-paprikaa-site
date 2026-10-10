# Batch P5-D report: carried fixes (carried-fixes-P5-D.md, items 1–8)

Base `a8cbad4`. Commits: `21cf1a2` (fix(tokens), R63 markers) and `6ee9190` (fix(storybook), items
1–8 in the app).

| #   | Fix | Test / evidence |
| --- | --- | --------------- |
| 1   | **R62.** `catalogue.ts` `colorUtilities(step, entry)` reads the role from the name. `text-*` gives `text-` only, `surface-*` gives `bg-` only, `border-*` gives `border-` only (so `border-strong` is a border), and `-strong` gives `text-`. `status-*`, and any primitive hue one path step below `color` (turmeric/tandoor/mint/kesar with their `-soft`s, `danger`, `danger-soft`, `veg`), give `bg-`/`border-`. Everything else keeps all three: the ramps, `white-alpha-*`, `ink-alpha-56`, `brand-hover/active`, `heat-*`, `focus` and the component colours. The class-mapping contract story (`UtilitiesDeriveFromTheCatalogue`) gains six colour cases (`text-text-body`, `bg-surface-card`, `border-border-subtle`, `text-mint-strong`, `bg-/border-status-success`, `bg-/border-turmeric`). Each one is asserted as the exact list and painted in the browser. | Probe (the old all-three rule restored): `× Utilities Derive From The Catalogue`, `expected [ 'bg-text-body', …(2) ] to deeply equal [ 'text-text-body' ]`. Restored, green. |
| 2   | `SemanticPanels`: every label is `<CopyButton text={token(name).cssVar}>` (a small `VarChip`), and each panel is a `CopyScope`. The hand-typed `--color-*` strings are gone, and the h4 lines are now sample copy. | New play: the `--color-text-on-brand` chip copies itself. Green. |
| 3   | New `docs-kit/clipboard.ts` `spyOnClipboard(check)` spies on `writeText` and restores it in `finally`. Used by the brand, colors, type, spacing, motion and docs-kit plays; the local helper in docs-kit is removed. `CopyWithoutAClipboard`'s getter spy is also restored in a `try/finally`. | All clipboard plays green (340/340). |
| 4   | `vitest.config.mts` storybook project: `optimizeDeps.include: ["@storybook/addon-docs > @storybook/react-dom-shim", "@storybook/addon-docs > @mdx-js/react"]`. The bare `@storybook/react-dom-shim` id (the module 2a batch C's cold failure named) is an alias that `include` cannot resolve: it printed `Failed to resolve dependency: @storybook/react-dom-shim, present in client 'optimizeDeps.include'` and was removed. | **Not reproducible at base.** I ran three truly cold runs, each moving `node_modules/.cache/storybook/…/sb-vitest` aside first (the earlier guess, `node_modules/.vite`, is the wrong cache). All three passed first time, 339/339. `DEBUG=vite:deps` printed `using post-scan optimizer result, the scanner found every used dependency`. With the include, a cold run passed 339/339 with no resolve warning. After 2b batch E, a cold whole-batch run passed 378/378 on the first attempt. The include is insurance, not a proven fix. |
| 5   | **Important, R63.** Spec: when the library uses a token, its marker must equal those uses (as before). An unused token may carry a marker, but every marker utility must match `SPACING_READER`. New case "marks the primitive chrome sizes by their documented use (R63)". Markers in `primitive/space.json`: `header`, `header-compact` and `tabbar` get `["h"]`; `hit` gets `["min-h","min-w"]`; `dock-clearance` gets `["bottom"]` (spec §StickyActionBar `bottom: var(--spacing-dock-clearance)`, 3a's `bottom-dock-clearance`). `card-min` and `card-min-wide` get `[]`: AutoGrid reads them through a grid template (2c's `grid-min-md/lg` aliases), so they have no class, and each gains a one-line description saying so. The gutters, sections and grid-gap stay unmarked (they are real padding and gaps). DERIVED probe: `spacing-hit` now paints `min-h-hit`/`min-w-hit`, a `spacing-header` case (`h-header`) was added, and `spacing-gutter-mobile` became the unmarked p/m/mt/gap example. | Red first: the markers against the old strict spec gave `FAIL (7)`, `expected [ 'h' ] to deeply equal undefined` ×3, `[ 'min-h', 'min-w' ]`, and `[]`. After the relaxation, the docs-kit project passed 85/85. |
| 6   | `Animations`: the chips are `[utility, --utility]`. The play asserts that each `--animate-*` resolves on `:root` and that both chips copy. | Probe (the var chip dropped): `× Animations`, `TestingLibraryElementError` (no `--animate-mark-pulse` button). Restored. |
| 7   | `catalogue.spec.ts` `usesOf` comment names the blind spots: `var(--spacing-…)`, arbitrary values (`h-(--spacing-…)`, `min-h-[…]`) and runtime-built classes all read as unused, which R63 now lets carry any marker. | — |
| 8   | `DEPTH_LADDER = tokensWithPrefix("shadow-", "primitive")`, which gives `shadow-1…4`, `shadow-brand` and `shadow-inset`. The Elevation specimen therefore gains `shadow-inset` (it has no description, so its caption is empty). | Elevation renders (the story's axe and smoke checks pass). |

## Gates

- `pnpm nx run-many -t typecheck lint test -p storybook design-tokens --skip-nx-cache`: design-tokens
  `Tests 232 passed (232)`, storybook `Test Files 31 passed (31)`, `Tests 340 passed (340)` (+1: the R63
  node case). The first run found one `perfectionist/sort-imports` error in colors.stories. After
  `eslint --fix`, typecheck and lint both succeeded.
- `pnpm nx format:check` exit 0; `pnpm nx sync:check` "All files are up to date."

## Concerns

- **R62 hides classes the library uses.** `text-status-success/-warning/-danger` colour glyphs through
  currentColor in `field-control.tsx` and `status-dot.tsx`, but the status rule offers only `bg-`/`border-`.
  This is the ruling's stated cost ("some valid-but-odd chips hidden"), and I applied the ruling as written.
- **`spacing-hit` is marked `min-h` + `min-w` per the item, but the plans only ever write `min-h-hit`.**
  When 3a lands, the spec will require the marker to equal the real uses, so 3a narrows it to `["min-h"]`
  (or adds `min-w-hit`).
- The accent rule is structural (a primitive whose path is `color.<hue>`), so `veg`, `danger` and
  `danger-soft` fall under it (`bg-`/`border-`). That fits the DietMark: the veg mark is a border plus a fill.
- Item 4 could not be reproduced (see above).
