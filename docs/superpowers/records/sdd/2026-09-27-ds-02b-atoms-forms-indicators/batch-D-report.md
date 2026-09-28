# Batch D report: carried fixes (R54, review C) + Plan 2b Task 7 (Slider), Task 8 (Spinner), Task 9 (Skeleton), Task 10 (ProgressBar)

Base `163c7c1`. Branch `feat/design-system`. Status: **DONE_WITH_CONCERNS** (concerns at the end, none blocking).

Commits:

- `254b35d fix(ui): keep a read-only Select readable, not painted disabled` (carried items 1–3)
- `53191f6 fix(ui): redden a chosen radio in an invalid group; a status needs its message` (carried items 4–5)
- `d850c29 feat(ui): add the Slider atom from the handoff calculators` (Task 7)
- `ea7532c feat(ui): add the Spinner atom — the pulsing brand mark` (Task 8)
- `68970de feat(ui): add the Skeleton atom` (Task 9)
- `526a8aa feat(ui): add the ProgressBar atom — loyalty stamps and continuous progress` (Task 10)
- `a8cbad4 docs: re-sort classes in the 2b plan's ProgressBar code block` (format:check fix after Task 10's tokens)

Fold-list items applied: **1** (Task 8's `markIn` uses `.mask-symbol`, the doc comment is fixed and the `ARTWORK` import is deleted), **8** (barrel placement, sorted by path in the atoms block), **9** (trailer). No other fold item names Tasks 7–10. **R61**: every new px spacing token carries the `utility` marker (`spinner-*` → `["size"]`, `progress-*` → `["h"]`). The docs-kit `catalogue.spec` stays green.

---

## Carried fixes

### Item 1 (Important, R54): a read-only Select was painted disabled

Root cause: a read-only Select renders a natively `disabled` `<select>`, so the box's `has-disabled:` classes applied (ink-400 text on a subtle border, ~2:1).

Fix (`lib/field-control.tsx`): a compound variant `{ control: "select", isReadOnly: true }` sets root `has-disabled:cursor-default has-disabled:border-border-default has-disabled:text-text-body`, icon `group-has-disabled/field:text-ink-500` and control `disabled:cursor-default`. tailwind-merge drops the conflicting `has-disabled:` classes, so the override does not rely on source order. `select.tsx` passes `isReadOnly={readOnly && disabled !== true}`, so a Select that is both disabled and read-only still greys. It then shows the chevron rather than the lock, because disabled wins.

The fill was not overridden. `has-disabled:bg-ink-100` and `bg-surface-sunken` are the same value inside the field's `data-surface="light"` island (sunken = ink-100).

Proof: a computed-colour play on the `readOnly / disabled` story. Probes painted with `var(--color-text-body)`, `var(--color-border-default)` and `var(--color-ink-400)` sit inside the same field box and give the expected values. The play asserts:

- the read-only select's `color` equals text-body;
- its `opacity` is `1`;
- the box's `borderColor` equals border-default;
- the disabled select's `color` equals ink-400.

- RED, before the fix: `Expected: "rgb(43, 31, 37)"` (text-body), `Received: "rgb(184, 171, 177)"` (ink-400). 1 failed, 9 passed.
- GREEN, after the fix: `Tests 10 passed (10)`.

A unit test also pins the merged class list: read-only has `has-disabled:text-text-body` and no `has-disabled:text-ink-400`, and read-only + disabled keeps `has-disabled:text-ink-400`.

### Item 2: a read-only placeholder no longer posts `name=""`

`submitted = value ?? initialValue ?? ""`, and the hidden input renders only when `submitted !== ""`. New test: "posts no empty value from a read-only placeholder". It was RED before the change (the hidden input existed) and is GREEN after.

### Item 3: the "cannot change" test now tries to change the value

The test calls `user.selectOptions(select, "7:30pm")` (user-event rejects on a disabled select, and the rejection is swallowed). It then asserts that the value stays `"20:00"` and that `onChange` was never called.

### Item 4: the group error reddens a chosen radio

A play on the `group status + message` story clicks Regular, waits for the ring's transitions (`getAnimations()…finished`), then asserts the ring is `6px` and its `borderColor` equals a `var(--color-status-danger)` probe.

- The first GREEN was false. The first read came mid-transition: the ring was still 2px and danger-coloured from the unchecked state, so the play passed with no fix. Waiting for the transitions exposed the real state.
- RED, after the wait was added: `Expected: "rgb(207, 34, 34)"`, `Received: "rgb(238, 44, 104)"` (pink-500).
- Fix: add `in-aria-invalid:group-has-checked/choice:border-status-danger` to the ring base. The same loss also hit the option-level `isInvalid`, so the fix adds `group-has-checked/choice:group-has-aria-invalid/choice:border-status-danger` too.
- GREEN: `Tests 9 passed (9)`.

The unit tests assert both classes. The JSDoc now reads "turns every ring red, a chosen one too", which is now true.

### Item 5: a status needs its message

`RadioGroupProps` is now `RadioGroupOwnProps & ({ status?: "default"; message?: ReactNode } | { status: "error" | "success" | "warning"; message: NonNullable<ReactNode> })`.

- A new test holds a `// @ts-expect-error` over `<RadioGroup status="error">` with no message. `tsconfig.spec.json` includes `*.test.tsx`, so typecheck would fail if the error disappeared.
- The test fixture `Portion` uses a local `DistributiveOmit`, because a plain `Omit` collapses the union.

Input and Select: not aligned, because they carry no `message`. Field owns the message there, and Field is not built yet (plan 3). A Field-level check belongs to that task.

### Gate after the fixes

```
pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache
 Tests 232 passed (232)   # design-tokens
 Tests 468 passed (468)   # ui (+3)
 NX Successfully ran targets typecheck, lint, test for 2 projects
pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache → Test Files 27 passed, Tests 314 passed
pnpm nx format:check → exit 0
```

One lint error was fixed on the way: `non-nullable-type-assertion-style` flagged `parentElement as HTMLElement` in the Select play, so the play now uses a null guard that throws.

---

## Task 7: Slider

**Built:** `atoms/slider/slider.{tsx,test.tsx,stories.tsx}`, verbatim from the brief. The barrel export sits between `skeleton` and `social-headline`. No tokens.

**Deviations:** none. Prettier re-sorted the story classes (`max-w-text-measure-prose w-full` → `w-full max-w-text-measure-prose`).

**Dev parity:** there is no dev reference (handoff component).

**Evidence:**
- RED: `Failed to resolve import "./slider"`, plus the 2 `index.spec` folder checks.
- GREEN: typecheck/lint/test green, ui **474** tests (+6), design-tokens 232, Storybook build completed, `format:check` exit 0.

## Task 8: Spinner

**Built:**
- `tokens/component/spinner.json`: 24/36/52px, each with an R61 `utility: ["size"]` marker (the brief's JSON lacked the marker).
- `SPACING` gains `spinner-sm/md/lg`.
- `atoms/spinner/*`, verbatim except fold item 1.
- The barrel export sits between `social-headline` and `status-dot`.
- Dist: `--spacing-spinner-sm: 24px; -md: 36px; -lg: 52px;`.

**Deviations:**
1. Fold item 1: `markIn = (root) => root.querySelector(".mask-symbol")`, and the `ARTWORK` import is dropped.
2. R61 markers were added to `spinner.json`.

**Dev parity** (the brief's table, checked against dev's 12 Spinner tests; every dev test maps to a row):

| Dev item | Ruling | Where / clause |
| --- | --- | --- |
| no `label` → `aria-hidden`, no status | DROP | contract §3 + `Spinner.jsx`: `label` = "Loading", always `role="status"` |
| labelled → announced politely | ALREADY | "takes its own label" |
| pulses the brand mark, never a ring | ALREADY | "draws the brand mark" |
| paints with `currentColor` | ALREADY | `SymbolMark` (R19 `mask-symbol`) |
| sizes xs–xl (16–64), default 32 | DROP | card 24/36/52 → sm/md/lg |
| tones muted / subtle / onBrand / current | DROP | contract tone brand/ink/inverse; D5 |
| brand tone by default | ALREADY | tone `it.each` + default |
| caller `className` merges and wins | ADD | className test (on the status root; dev merged onto the svg) |
| axe | ALREADY | a11y test |
| stories default / sizes / labelled | ALREADY | stories |
| story: inverse on an ink panel as well as brand | ADD | `Inverse` |
| story: inheriting the parent colour | DROP | goes with `tone="current"` |
| **(added) the mark is drawn from path data (dev asserted `path` count)** | DROP | R19: a mask, no path data per instance |

**Evidence:**
- RED: `Failed to resolve import "./spinner"`, plus index.spec and component-variants.
- GREEN: ui **485** (+11), design-tokens 232, docs-kit project 82 passed (R61 catalogue check green), Storybook build completed, `format:check` exit 0.

## Task 9: Skeleton

**Built:** `atoms/skeleton/*`, verbatim. The barrel export sits between `select` and `slider`. No tokens.

**Deviations:** Prettier class re-sorts in the stories only.

**Dev parity** (the brief's table, checked against dev's 10 Skeleton tests; all mapped):

| Dev item | Ruling | Where / clause |
| --- | --- | --- |
| soft pink, a straight pulse, never grey or a gradient | ALREADY | default-block test |
| hidden from assistive tech without a label | ALREADY | always `aria-hidden` |
| `label` → `role="status"`, announced | ALREADY (differently) | the region is named once: `card shape` story + a11y test |
| variants text / block / circle | ALREADY | tests |
| block floor `h-20 rounded-3` | DROP | `Skeleton.jsx` 16px, `radius-sm` (D2) |
| stacked lines, varied widths, cycling past four | ALREADY | cycling test |
| `lines` forces the text shape | ALREADY | `lines` belongs to `variant="text"` |
| caller `className` on a single block | ALREADY | className test |
| caller `className` on the stack (`gap-6` replaces `gap-2`) | ADD | stack test |
| axe over block, lines and circle | ADD | a11y test |
| stories block / lines / circle / menu row | ALREADY | `card shape` is the menu row |

**Evidence:**
- RED: `Failed to resolve import "./skeleton"`.
- GREEN: ui **493** (+8), Storybook build completed, `format:check` exit 0.

## Task 10: ProgressBar

**Built:**
- Primitive `color.white-alpha.28` between 25 and 30.
- `tokens/component/progress-bar.json`: `progress-sm` 6px and `progress-md` 8px, each with an R61 `utility: ["h"]` marker; `text.progress-label` 13.5px.
- `SPACING` gains `progress-sm/md`, and `TEXT` gains `progress-label`.
- `atoms/progress-bar/*`.
- The barrel export sits between `pattern-field` and `radio`.
- Dist: `--spacing-progress-sm: 6px; --spacing-progress-md: 8px; --text-progress-label: 13.5px; --color-white-alpha-28: rgba(255, 255, 255, 0.28);`.

**Deviations:**
1. R61 markers were added to `progress-bar.json`.
2. **The `Narrow` story uses `w-90` (360px), not the brief's `w-80` (320px).** The story name ("six stamps at 360px") and the parity row ("fit the 360px floor") both say 360. The comment is reworded to match.
3. Prettier re-sorted the label slot to `font-body text-progress-label text-text-muted` and the story classes. The plan doc's copy of the label line needed the same re-sort: `a8cbad4`.

**Dev parity** (the brief's table, checked against dev's 13 ProgressBar tests; all mapped):

| Dev item | Ruling | Where / clause |
| --- | --- | --- |
| Radix Progress | DROP | D7: native `role="progressbar"` |
| `aria-valuenow` / `aria-valuemax` | ALREADY | stamps + continuous tests |
| named by the visible label | ALREADY | `aria-labelledby` |
| no caption → `aria-label` | ALREADY | `label` required + `isLabelHidden` |
| fills by the real share of any `max` | ADD | `max={200}` test |
| an overshooting value clamps | ALREADY | clamp `it.each` |
| one stamp per segment, earned ones filled | ALREADY | stamps test |
| the segment count is the scale, ignoring `max` | ADD | test |
| a fractional segment count (dev rounds it) | ADD | throws `RangeError`; test |
| a segmented track gaps, a continuous one clips | ALREADY | one segment shape |
| tones brand / mint / inverse | ALREADY | tone `it.each` |
| size lg (12px) | DROP | contract sm/md |
| inverse label on the on-brand colour | ALREADY | `text-text-muted` follows the surface |
| `value` optional (= 0) | DROP | contract `value: number` required |
| caller `className` on the root, replacing a conflict | ADD | className test |
| axe over stamps, continuous, mint | ADD | a11y test |
| stories default / segments / continuous / tones / sizes | ALREADY | stories |
| story: an inverse continuous bar beside the stamps | ADD | `Inverse` |
| story: six stamps fit the 360px floor | ADD | `Narrow` (`w-90`, deviation 2) |

**Evidence:**
- RED: `Failed to resolve import "./progress-bar"`.
- GREEN:

```
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache
 Tests 232 passed (232)   # design-tokens
 Tests 511 passed (511)   # ui (+18)
 NX Successfully ran targets typecheck, lint, test for 2 projects and 2 tasks they depend on
pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache   # both projects: storybook (chromium) + docs-kit
 Test Files 31 passed (31)   Tests 339 passed (339)   # first run, no cold-cache re-run needed
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache → Storybook build completed successfully
pnpm nx format:check → exit 0 (after a8cbad4)
```

Commit hooks (lint-staged, commitlint) passed on all seven commits. The tree is clean.

---

## Concerns

1. **Disabled + read-only Select shows the chevron, not the lock.** It follows the dispatch's `isReadOnly={readOnly && disabled !== true}`, so disabled wins outright. If the lock should stay, FieldControl needs a separate "undo disabled paint" flag.
2. **The disabled + invalid + checked radio** is still the deferred review-C minor (red on grey). Item 4's new classes do not change which of disabled or invalid wins. Not verified in the browser.
3. **The plan-doc re-sort commit recurs** (one more in this batch).
