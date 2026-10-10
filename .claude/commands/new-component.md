---
description: Create a design-system component the canonical way (shape, tests, stories, gates)
---

Create a new component in `packages/ui`. Component request: $ARGUMENTS

`packages/ui/AUTHORING.md` is the binding contract. Read it first. This procedure is its checklist
(docs/engineering/08-recipes.md §1):

1. **Read the four design-system source files** in
   `zip-files/Pink Paprikaa Design System/components/<tier>/`: `<Name>.d.ts` (props contract),
   `<Name>.jsx` (reference behaviour only, never copied), `<Name>.card.html` (every variant and
   state), `<Name>.prompt.md` (usage). Then read the component's row in spec §9
   (`docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md`) and its entry in
   `docs/superpowers/plans/2026-09-27-ds-00-contracts.md`. Translate props per AUTHORING §4.
2. **Confirm the layer** (`atoms → molecules → organisms → layouts`, AUTHORING §2). If torn
   between two, take the lower. State the layer and why in one line. An atom imports only the Icon
   atom, `../../lib` and packages.
3. **Tokens first** (AUTHORING §5). Any value the token build lacks becomes a component token in
   `packages/design-tokens/tokens/component/<name>.json`, under its Tailwind namespace (`spacing`,
   `text`, `color`, `radius`, `shadow`). Add each new name to its list in
   `packages/ui/src/lib/component-variants.ts`. Add each new text/background pair to
   `packages/design-tokens/contrast-pairs.json`. Restore every surface override in
   `tokens/surface/light.json`. Never write a literal, an arbitrary value or `(--x)` shorthand.
4. **Create** `packages/ui/src/<layer>/<name>/<name>.tsx` in the canonical shape
   (docs/engineering/03-patterns.md §1, AUTHORING §3). Use `componentVariants` (never the bare
   `tv`). Extend native props, spread them last and merge `className`. Use a named export with no
   `forwardRef`. Optional props are `?: T | undefined`. Use `asChild` via Radix `Slot` where the spec
   row says so. Use `data-surface`, never an `on` prop. `"use client"` goes only in the smallest leaf
   that needs it.
5. **Write `<name>.test.tsx` BEFORE finishing the implementation.** Test behaviour by role and
   label, each variant's observable effect and keyboard paths, then finish with
   `await expectNoA11yViolations(container)` (from `../../../vitest.setup`). Run it RED, implement,
   run it GREEN.
6. **Write `<name>.stories.tsx` with card parity**: one story per `.card.html` row, labelled with
   the prop that produces it. Add `Playground`, `OnSurfaces` where the component is surface-aware,
   and `play` for client components. The docs description comes from `.prompt.md`.
7. **Export** from `packages/ui/src/index.ts` only (no folder barrels).
8. **Gate** (all must pass; show the output): `pnpm exec prettier --write <files>`, then
   `pnpm nx test ui && pnpm nx lint ui && pnpm nx run storybook:build`, then
   `pnpm nx test storybook` and `pnpm verify`.
9. **Self-review** against docs/engineering/06-quality-gates.md §5, then commit with scope `ui`
   (`pnpm commit` or a conventional message).

Hard rules that override anything else: no raw hex, no default export, no boolean render forks,
Pink Paprikaa spelled with two a's in any copy or fixture, no founder names anywhere.
