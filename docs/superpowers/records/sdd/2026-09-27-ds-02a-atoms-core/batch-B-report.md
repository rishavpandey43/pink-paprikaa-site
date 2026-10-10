# Batch B report — Tasks 2 (Text), 3 (Link), 4 (PatternField)

Base: 97d44b3 (tree held uncommitted Task 2 WIP from the lost dispatch). Commits:

| Task | Commit    | Subject                                                                 |
| ---- | --------- | ----------------------------------------------------------------------- |
| 2    | `e4cd0e0` | feat(ui): add the Text atom, the type ramp as one component             |
| 3    | `5eca1e7` | feat(ui): add the Link atom with surface-aware underline and nav tones  |
| 4    | `8bf5570` | feat(ui): add the PatternField atom, the tiled diamond texture          |

Overlay applied (task-0-fold-list, R43): R13 (`?: T | undefined` on every optional custom prop in
TextProps, LinkProps, PatternFieldProps), R19/R25 (PatternField uses `var(--pp-symbol-mask)`, no
data URI), R36 (external arrow announced "Opens in a new tab", built-in English, no prop), M7
(`max-w-text-measure-prose`, never `max-w-prose`), item 10 (barrel export added before each gate,
index.spec folder triple satisfied). Items 2, 4, 5, 7, 11 do not touch these tasks.

---

## Task 2 — Text

**Built:** `tokens/component/text.json` (two measure spacing tokens aliasing the containers),
`SPACING` += `text-measure-prose`, `text-measure-narrow`; `atoms/text/{text.tsx,text.test.tsx,
text.stories.tsx}`; barrel export.

**Handover WIP check:** the uncommitted files matched the brief verbatim plus R13 (`| undefined`).
Kept, not rewritten.

**Deviation (one):** the brief's `const Component: ElementType = as ?? DEFAULT_ELEMENT[variant]`
fails `tsc -b` — TS2322 at text.tsx:158: with a union tag, TypeScript checks the spread props
against every element's own `ref` type (`Ref<HTMLParagraphElement>` vs `ClassAttributes<HTMLQuoteElement>`
etc.). The WIP's typecheck errors in the test/story files were a knock-on (stale `dist` d.ts from
the dev-era build, because the lib reference failed to emit). Fix: 
`const Component = (as ?? DEFAULT_ELEMENT[variant]) as "p";` with a comment — the contract types
TextProps as `<p>`'s props, every `TextElement` accepts them at runtime. `ElementType` import dropped.

**TDD:** red verified by moving text.tsx aside → `Failed to resolve import "./text"`; restored →
green.

**Gate:**
- `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && grep text-measure dist/theme.css`
  → `--spacing-text-measure-prose: var(--container-prose);` and
  `--spacing-text-measure-narrow: var(--container-prose-narrow);`
- `pnpm exec prettier --write …` → all formatted
- `pnpm nx run-many -t typecheck lint test -p ui design-tokens --skip-nx-cache --outputStyle=static`
  → design-tokens 4 files / 139 tests pass; ui 11 files / 147 tests pass;
  `Successfully ran targets typecheck, lint, test for 2 projects and 2 tasks they depend on`
- `pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache` → `Storybook build completed successfully`

**Dev parity:**

| Dev item | Ruling | Where / reason |
| --- | --- | --- |
| Step names `display1`, `subtitle1/2`, `body1/2` | DROP | D4 (`display-1`, `h4`, `body-lg`, `body-sm`) |
| `caption` and `overline` default to the `muted` tone | DROP | contracts §2 (tone = heading for display/h, body otherwise) |
| `as?: ElementType` (any element) | DROP | contracts §2 fixes the `as` union |
| `align` left/right; `measure` via `max-w-(--measure-*)` | DROP | contracts §2 (`start`/`center`/`end`); AUTHORING §6; measure tokens replace it |
| Display steps render `<p>` | ALREADY | `span` per `Text.jsx`; `as` overrides |
| Native props not forwarded | ALREADY | extends `ComponentProps<"p">`, spread |
| `isBalanced={false}` opts a heading out of balance | ADD | test + `className` merge — done |
| Test: `as="h1" variant="h2"` is level-1 on the h2 step | ADD | done |
| Test: no alignment or measure class unless asked | ADD | done |
| Tests: tone replace, fluid swap, no-fluid-twin, balance/pretty, measure, lineClamp, overline caps, axe | ALREADY | present |
| Story `ToneOnBrand` | ADD | done |
| Story `Fluid` (seven steps) | ADD | done |
| Story `Measure` | ADD | done |
| Stories `Default`, `Ramp`, `Truncated` | ALREADY | `Playground`, five ramp stories, `LineClamp` |
| `Ramp` metric captions | DROP | Type foundation pages own the metrics |
| (plan missed) Polymorphic `ElementType` tag fails `tsc -b` on `ref` | FIXED | cast to `"p"`, see deviation |

---

## Task 3 — Link

**Built:** primitives `white-alpha.40`/`.90`; `tokens/component/link.json` (`text-link-{sm,md,lg}`,
`color-link-underline`, `color-link-quiet`); `link` block in `surface/brand.json`, `ink.json`
(white-alpha 40/85) and `light.json` (restore pink-200/ink-700); four contrast groups appended
(`link`, `link-on-soft`, `link-on-ink`, `link-on-brand` with `brand-fill` exception); `TEXT` +=
`link-sm/md/lg`; `atoms/link/*`; barrel export.

**Deviations:**
- R13 `| undefined` on all LinkProps optionals.
- The brief's comment "Icon's `label` predates R13" is stale (Icon's `label` is already
  `string | undefined`); comment rewritten to cite R36. Structure kept (separate external-arrow
  element), since it reads clearest.
- Verified `text-link-quiet` (colour) and `text-link-sm` (size) are classified apart by the
  configured tailwind-merge: `m("text-link-quiet text-link-lg text-ink-000 text-link-sm")` →
  `text-ink-000 text-link-sm`.

**TDD:** red `Failed to resolve import "./link"` → green 22/22.

**Gate:**
- `pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache` → 4 files / 146 tests pass;
  `dist/surfaces.css` declares `--color-link-underline` / `--color-link-quiet` in brand, ink and
  light blocks.
- prettier write; `run-many -t typecheck lint test` (ui + design-tokens, skip cache) → tokens 146
  pass, ui 12 files / 169 pass, `Successfully ran targets typecheck, lint, test for 2 projects`.
- storybook build (skip cache) → completed successfully.

**Dev parity:**

| Dev item | Ruling | Where / reason |
| --- | --- | --- |
| `href` required | DROP | contracts §2; with `asChild` href is on the child |
| Sizes on `text-body2/body1/subtitle2`, `decoration-2`, `rounded-*` | DROP | D4; `text-link-*` + base `a` rule |
| Glyph shrinks to 14px at `sm` | DROP | 16px at every size |
| `quiet` hovers pink with underline | DROP | stays transparent; Task 15 list |
| `inverse` = `text-text-on-brand` | ALREADY | `text-ink-000` + white-alpha underline |
| On-brand story at 20px bold | DROP | spec §5.1 brand-fill exception |
| External arrow announced "Opens in a new tab" | ADD | done (R36) |
| Test: internal link has no `target`/`rel` | ADD | done |
| Test: `onClick` fires | ADD | done |
| Test: caller className replaces the variant colour | ADD | done |
| Tests: href/name, colour, variants, sizes, underline, glyph not announced, axe | ALREADY | present |
| Story `WithIcons` (`iconAfter`) | ADD | `Default` has an `iconAfter` link |
| Story `OnBrand` + ink panel + external | ADD | `Inverse` |
| Story `InFooterNav` | ADD | done |
| Stories `Default`, `Variants`, `Sizes`, `External` | ALREADY | present |

---

## Task 4 — PatternField

**Built:** `atoms/pattern-field/*`, barrel export. Step 1 skipped per controller delta (utilities
already in `styles.css` from Task 1; no duplicate `@utility`).

**Deviations:**
- R13 `| undefined` on all PatternFieldProps optionals.
- Dropped the brief's `compoundVariants` (tone × density → opacity) and its comment "tailwind-merge
  cannot resolve two custom utilities" — stale since overlay item 8 registered `pattern-opacity-*`
  as a twMerge class group. Each tone now carries its default opacity and `density="faint"`
  (declared later) replaces it in the merge. The "exactly one `pattern-opacity-*` class" tests
  (per tone, and faint) pass, proving the merge.

**TDD:** red `Failed to resolve import "./pattern-field"` → green 22/22.

**Gate:**
- prettier write; `run-many -t typecheck lint test` (ui + design-tokens, skip cache) → tokens 146
  pass, ui 13 files / 191 pass, `Successfully ran targets typecheck, lint, test for 2 projects`.
- storybook build (skip cache) → completed successfully.

**Dev parity:**

| Dev item | Ruling | Where / reason |
| --- | --- | --- |
| `tile` free number; SVG `<pattern>` per instance with `useId` | DROP | spec §8.2; R19 |
| `"use client"` | DROP | D6 — server-safe |
| `light` on `bg-surface-card`; `rounded-4/5` | DROP | page ground; D4 radius names |
| Token texture colour, ≤12%, `aria-hidden`, content above | ALREADY | tests present |
| Radii `none`/`md`/`lg` | ALREADY | plus `xl` |
| `isolate` on root | ADD | done, first test |
| Every instance has its own paint server | ALREADY | nothing to collide (R19) |
| Test: caller className replaces the radius | ADD | done |
| Stories `Default`, `Tones`, `TileSizes` | ALREADY | `Playground`/`Brand`, four tones, `Tiles` |
| Story `FullBleedBand` | ADD | done |
| (plan missed) tone×density compound made redundant by item 8 | SIMPLIFIED | see deviation |

---

## Concerns

- Text's `as "p"` cast is a type-level narrowing (a `ref` typed `HTMLParagraphElement` is accepted
  for any `as` element). It matches the contract (`TextProps extends ComponentProps<"p">`); widening
  the contract's ref type was out of scope. Later polymorphic atoms using `ElementType` with a
  spread `ComponentProps<…>` whose tag union spans several elements may hit the same TS2322.
- Stale `packages/ui/dist` declarations make a failing lib reference show up as many unrelated
  test/story type errors; the root error is the first lib file listed.

---

## Fix round 1 (review of batch B, ruling R44)

**Finding (Important, Task 3):** `isExternal` together with `iconAfter` opened a new tab without
announcing it; the test asserted the absence. R36 is binding: `isExternal` always announces.

**Fix (`link.tsx`):** `const after = iconAfter ?? (isExternal ? ArrowUpRight : undefined)`; one
trailing `<Icon icon={after} size="sm" label={isExternal ? "Opens in a new tab" : undefined} />`;
the separate arrow element and the old exception comment are gone (comment rewritten for R36).

**Covering tests (`link.test.tsx`):**
- "draws an explicit iconAfter instead of the external arrow and still announces the new tab" —
  now asserts `getByRole("img", { name: "Opens in a new tab" })` (was `queryByRole("img")` absent);
  still asserts arrow-right drawn, arrow-up-right absent.
- "opens an external link in a new tab …" — unchanged, still asserts the announced arrow.
- Hover test retitled to "gives the %s variant its hover colour and underline classes, or the
  resting one hover keeps (%s, %s)" — it checks class presence, and for inverse/quiet a resting class.

**Commands and output:**
- `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/atoms/link` →
  `✓ src/atoms/link/link.test.tsx (22 tests)`, `Tests 22 passed (22)`
- `pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui --skip-nx-cache --outputStyle=static` →
  `✓ src/index.spec.ts (4 tests)`, `Test Files 13 passed (13)`, `Tests 191 passed (191)`,
  `Successfully ran targets typecheck, lint, test for project @pink-paprikaa-web/ui and 3 tasks it depends on`

**Commit:** `0b6300c` fix(ui): announce the new tab on every external link.
