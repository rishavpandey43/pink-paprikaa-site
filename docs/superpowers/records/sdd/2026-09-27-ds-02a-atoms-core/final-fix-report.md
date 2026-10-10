# Plan 2a — final-review fix wave report

Base 3657323 · branch feat/design-system · status DONE

## Items

### 1. Nested surfaces inherit the outer surface (IMPORTANT) — FIXED (preferred route)
- `packages/design-tokens/sd.config.mjs:96-113` (`pp/surfaces` format): every surface block is now
  the light block with that surface's own overrides applied, plus any own-only token appended. The
  JSON sources are unchanged. A token added to any surface is restored everywhere via `light.json`,
  and the existing "restores, on a light island" spec already forces `light.json` to be complete.
- Spec `packages/design-tokens/src/theme.spec.ts:83-111` ("declares, on every surface, every token
  any surface overrides — base value by default"): it parses `dist/surfaces.css` and requires each
  block to declare the union of all blocks' properties. It also checks soft `--color-text-body` /
  `--color-focus` and ink `--color-button-primary-bg` equal the light values. **Failed before the
  fix** (soft was missing text-body/muted/subtle, focus, border-strong, link-underline/quiet and every
  component token; ink was missing button-primary-*, tag-selected*, badge-brand-*, shadow-button-primary).
- Play story `packages/ui/src/atoms/card/card.stories.tsx` `SoftInsideBrand`: a `Card variant="feature"`
  inside a `data-surface="brand"` field is compared with a `data-surface="light"` reference. Its body
  text colour and its `text-focus` colour must match the base and must not be white. It uses a plain
  brand div, not PatternField, because atom stories can't compose another atom. This is the same
  pattern as `LightIsland`. **Failed before the fix** (checked by rebuilding tokens without the
  sd.config change: 1 failed / 127 passed), and passes after it.
- Docs: `packages/design-tokens/README.md` (surfaces section) and `packages/ui/AUTHORING.md:210-215`
  now describe base-plus-overrides emission.

### 2. Blank labels (R48 parity) — FIXED
- `packages/ui/src/atoms/divider/divider.tsx:52-54,62,72`: `name = label?.trim() === "" ? undefined : label`.
  The layout, the `aria-label` and the printed label all use `name`, so a blank label draws the plain
  rule with no aria-label.
- `packages/ui/src/atoms/image-slot/image-slot.tsx:117-122`: `isNamedPlaceholder = children === undefined && label.trim() !== ""`.
  A blank label gives no `role="img"` and no aria-label, so the placeholder is plain decoration.
- Tests: `divider.test.tsx` "treats a blank label %j as no label" and `image-slot.test.tsx` "never
  renders an unnamed image for a blank label %j" each cover `""` and `"   "`. **All 4 failed before
  the fix.**

### 3. Base `a` underline — FIXED
- `packages/ui/src/styles.css:91`: `var(--color-pink-200)` became `var(--color-link-underline)`. The
  name was confirmed in `dist/theme.css:230` (`--color-link-underline: var(--color-pink-200)`), so the
  light value is unchanged. This is a CSS-only change with no dedicated test. Light/brand/ink values
  come from the token, which item 1's spec now guarantees on every surface.

### 4. Link `isExternal` JSDoc — FIXED
- `packages/ui/src/atoms/link/link.tsx:15-18`: it now says the link announces "Opens in a new tab" on a
  trailing glyph, which is the outward arrow or the caller's `iconAfter`. Docs only.

### 5. Link `inline-flex` — LEFT AS IS (deliberate parity)
- `git show dev:packages/ui/src/atoms/link/link.tsx:11` has `inline-flex items-center gap-1.5` on the
  base for all links. The task-3 brief (`task-3-brief.md:304`) asserts `inline-flex` on a glyph-less
  link, and the shipped `link.test.tsx:156` carries that test. Both chose inline-flex for every link.
  Running prose gets the bare `<a>` base-layer style, as the Link story docs say. Changing this
  belongs to the controller or the owner, not to this fix wave.

### 6. Tag `isSelected` JSDoc — FIXED
- `packages/ui/src/atoms/tag/tag.tsx:8-11`: the state is only announced on an interactive Tag
  (`aria-pressed`), and a static tag uses it for visual emphasis only. There is no behaviour change.

## Gates (after all fixes)

`pnpm nx run-many -t typecheck lint test build -p ui design-tokens storybook --skip-nx-cache` → exit 0
```
 NX   Successfully ran targets typecheck, lint, test, build for 3 projects and 3 tasks they depend on
design-tokens  Test Files 4 passed (4)   Tests 190 passed (190)
ui             Test Files 23 passed (23) Tests 386 passed (386)
storybook      Test Files 15 passed (15) Tests 128 passed (128)
```
`pnpm nx run storybook:test` → exit 0, passed on the first run
```
 Test Files  15 passed (15)
      Tests  128 passed (128)
 NX   Successfully ran target test for project @pink-paprikaa-web/storybook and 1 task it depends on
```
`pnpm nx format:check` → exit 0 (no output)
`pnpm guard:founder` → `Founder-name guard: clean.` exit 0

## Commits
- a932a99 fix(tokens): emit every surface as the light base plus its own overrides
- 2bf1580 fix(ui): treat a blank Divider or ImageSlot label as no label
- 47cdcba fix(ui): surface-aware base link underline, clarify Link and Tag docs

## Notes
- `docs/superpowers/plans/2026-09-27-ds-02b-atoms-forms-indicators.md` was modified during this wave
  (+9 lines) by someone other than this implementer, most likely the controller routing R50 items. It
  was left unstaged and uncommitted.
