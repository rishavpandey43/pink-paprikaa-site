# Batch C report: Plan 2b Task 4 (Checkbox + shared choice row), Task 5 (Radio, RadioGroup), Task 6 (Switch)

Base `fc566d1`. Branch `feat/design-system`. Status: **DONE_WITH_CONCERNS** (concerns at the end, none blocking).

Commits:

- `9cfa8a8 feat(ui): add the Checkbox atom on a shared choice row` (Task 4)
- `91113c0 docs: re-sort classes in the 2b plan's code blocks` (format:check fix after Task 4's tokens)
- `a7b4163 feat(ui): add the Radio and RadioGroup atoms` (Task 5)
- `551afed feat(ui): add the Switch atom` (Task 6)
- `542f891 docs: re-sort classes in the 2b plan's Switch code block` (format:check fix after Task 6's tokens)

Fold-list items applied: **3** (Task 4 creates `control.json`, appends `"control"` and `"control-description"` to `TEXT`; `control` description reads "The label of a checkbox, radio or switch."), **6** (R41 over `src/lib/**`: `choice-control.tsx` lints clean), **8** (barrel placement, sorted by path in the atoms block), **9** (trailer). No other fold item names Tasks 4–6.

---

## Task 4: Checkbox and the shared choice row

### Built

- `packages/design-tokens/tokens/component/choice.json`: verbatim (`spacing.choice-box` 22px).
- `packages/design-tokens/tokens/component/control.json`: **created** (fold item 3), the brief's block verbatim except the `control` description. `text.control` 15px, `text.control-description` 13px.
- `component-variants.ts`: `TEXT` += `control`, `control-description`; `SPACING` += `choice-box`.
- `packages/ui/src/lib/choice-control.tsx`: `ChoiceControl`, `ChoiceControlProps`, `choiceVariants`, `joinIds`, verbatim.
- `packages/ui/src/atoms/checkbox/checkbox.{tsx,test.tsx,stories.tsx}`: verbatim.
- `index.ts`: `Checkbox`, `CheckboxProps` between `card` and `divider`.

Dist check: `--spacing-choice-box: 22px;`, `--text-control: 15px;`, `--text-control-description: 13px;` in `design-tokens/dist/theme.css`.

### Deviations

1. **Fold item 3, as specified.** `control.json` is a Create, not a Modify.
2. **Prettier re-sorts** (no content change): `choice-control.tsx` text slot → `flex min-w-0 flex-1 flex-col gap-0.5 text-control font-medium`; `checkbox.tsx` box base line → `grid size-choice-box place-items-center … transition-control`. Once the tokens existed, `format:check` failed on the plan file's code blocks (4 lines: the stale Task 2 `text-control h-field-*` rows, Task 4's text slot and box line). Re-sorted in `91113c0`, per the batch-B precedent `6e8964f`.

### Dev-parity check (brief table, confirmed against dev's 12 Checkbox tests; every dev test maps to a row)

| Dev item | Ruling | Where / clause |
| --- | --- | --- |
| Radix Checkbox + `onCheckedChange(checked)` | DROP | D7, D17, contract §3: native `checked` / `onChange` |
| indeterminate (`checked="indeterminate"`, `aria-checked="mixed"`, minus glyph) | DROP — contract delta P1 raised | dev test "reads as mixed when indeterminate" has no counterpart; the controller rules on P1 |
| unchecked, named by its label | ALREADY | first test |
| add-on price folded into the name (`+₹40`) | ALREADY | price test |
| click toggles and reports the state | ALREADY | first + register() tests |
| space bar after Tab | ALREADY | keyboard test |
| disabled ignores clicks | ADD | disabled test |
| second line as the accessible description | ALREADY | description test |
| checked floods the box pink | ALREADY | checked test |
| error (`hasError`) | ALREADY | `isInvalid` test |
| disabled: real grey fill, never opacity | ALREADY | disabled test |
| caller `className` on the row, replacing a conflict | ADD | className test (`gap-6` replaces `gap-3`) |
| axe over plain, priced + described + checked, disabled, invalid | ADD | a11y test |
| `label` typed `string` | ALREADY | `ReactNode` (wider) |
| stories default / checked / price / description / states | ALREADY | stories |
| story: add-on list in a fieldset, with a disabled priced row | ADD | `AddOnList` |
| **(added) Field's `aria-describedby` kept beside the description** | ADD | brief's describedby test (not in dev) |

### Evidence

RED: `FAIL src/atoms/checkbox/checkbox.test.tsx — Failed to resolve import "./checkbox"` (+ the 3 `index.spec` folder checks).
GREEN:
```
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
GATE_EXIT=0
 Tests  190 passed (190)   # design-tokens
 Test Files  27 passed (27)   Tests  436 passed (436)   # ui (+11)
 NX   Successfully ran targets typecheck, lint, test for 2 projects and 2 tasks they depend on
 Storybook build completed successfully
pnpm nx format:check → exit 0 (after 91113c0)
```

---

## Task 5: Radio and RadioGroup

### Built

- `packages/ui/src/atoms/radio/radio.{tsx,test.tsx,stories.tsx}`: verbatim.
- `index.ts`: `Radio, RadioGroup, type RadioGroupProps, type RadioProps` between `pattern-field` and `select`.
- No tokens (reuses `choice-box`, stock `border-6`).

### Deviations

None. Prettier changed nothing. Verified the built Storybook CSS emits `in-aria-invalid:border-status-danger`.

### Dev-parity check (brief table, confirmed against dev's 12 Radio tests; every dev test maps to a row)

| Dev item | Ruling | Where / clause |
| --- | --- | --- |
| Radix RadioGroup (roving focus; `defaultValue` / `onValueChange`) | DROP | D7, D17, contract §3: native radios sharing a `name` |
| group named by `aria-label` | ALREADY | required `legend` + `isLegendHidden` |
| the chosen option is checked; a click moves the choice and unchecks the last | ADD | click test |
| price folded into the name (`₹280`, absolute) | ALREADY | first test |
| arrow keys move the choice | ALREADY | arrow-key test (native) |
| second line as the description | ALREADY | description test |
| a disabled option ignores clicks | ADD | disabled test |
| chosen = 6px pink ring, never a filled disc | ALREADY | ring test |
| one option invalid (`hasError`) | ADD | option `isInvalid` test |
| disabled: real grey fill, never opacity | ADD | disabled test (+ no-`opacity-`) |
| horizontal orientation | ALREADY | orientation `it.each` |
| caller `className` on the group and on an option | ADD | two className tests |
| axe incl. a horizontal group with a disabled option | ADD | a11y test |
| stories default / prices / horizontal | ALREADY | stories |
| story: states | ADD | `States` |
| story: portion picker | ADD | `PortionPicker` |
| **(added) group status + message (deviation 2), disabled fieldset** | ADD | brief's RadioGroup tests (not in dev) |

### Evidence

RED: `FAIL src/atoms/radio/radio.test.tsx — Failed to resolve import "./radio"` (+ 3 `index.spec` checks).
GREEN (same gate): `GATE_EXIT=0`; design-tokens 190; ui **28 files, 454 tests** (+18); typecheck/lint green; Storybook build completed; `format:check` exit 0.

---

## Task 6: Switch

### Built

- `packages/design-tokens/tokens/component/switch.json`: verbatim (`switch-width` 46, `switch-height` 28, `switch-knob` 22).
- `component-variants.ts`: `SPACING` += `switch-width`, `switch-height`, `switch-knob`.
- `packages/ui/src/atoms/switch/switch.{tsx,test.tsx,stories.tsx}`: verbatim.
- `index.ts`: `Switch, SwitchProps` between `status-dot` and `tag`.

### Deviations

1. **Prettier re-sorts** (no content change): track → `relative flex h-switch-height w-switch-width …`, knob → `absolute top-0.75 left-0.75 size-switch-knob …`; stories `max-w-text-measure-prose w-full` → `w-full max-w-text-measure-prose` (3 places). The plan file's Switch block needed the same re-sort (2 lines): `542f891`.

### Dev-parity check (brief table, confirmed against dev's 9 Switch tests; every dev test maps to a row)

| Dev item | Ruling | Where / clause |
| --- | --- | --- |
| Radix Switch + `onCheckedChange` | DROP | D7, D17, contract §3: `<input type="checkbox" role="switch">` |
| off by default, named by its label | ALREADY | first test |
| click turns it on and reports the state | ALREADY | click + register() tests |
| space bar after Tab, with a visible focus ring | ADD | Tab test |
| disabled ignores clicks | ADD | disabled test |
| second line as the description | ALREADY | description test |
| on: track floods pink, knob slides | ALREADY | on test |
| disabled: real grey track, never opacity | ALREADY | disabled test (+ no-`opacity-`) |
| label left, track right, so knobs align | ALREADY | layout test |
| caller `className` on the row, replacing a conflict | ADD | className test |
| axe over off, on + described, disabled | ADD | a11y test |
| stories default / on / description / states | ALREADY | stories |
| story: preferences panel | ADD | `PreferencesPanel` |
| **(added) `isLabelHidden` (deviation 4)** | ADD | brief's label-hidden test + story |

### Evidence

RED: `FAIL src/atoms/switch/switch.test.tsx — Failed to resolve import "./switch"`.
GREEN (same gate): `GATE_EXIT=0`; design-tokens 190; ui **29 files, 465 tests** (+11); typecheck/lint green; Storybook build completed; `format:check` exit 0 (after `542f891`).

Real Chromium, after all three tasks:
```
pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache → SB_EXIT=0 (first cold run, no re-run needed)
 ✓ |storybook (chromium)| packages/ui/src/atoms/switch/switch.stories.tsx (7 tests)
 ✓ |storybook (chromium)| packages/ui/src/atoms/checkbox/checkbox.stories.tsx (8 tests)
 ✓ |storybook (chromium)| packages/ui/src/atoms/radio/radio.stories.tsx (9 tests)
 Test Files  20 passed (20)   Tests  175 passed (175)
```
Commit hooks (lint-staged, commitlint) passed on all five commits. Tree clean.

---

## Carried fixes

None were carried into this dispatch (batch B's review runs in parallel).

## Concerns

1. **R21 scope reading.** The dispatch says "field and control text is 16px (`text-body`) at every size". Fold item 3 says Task 4 creates `control.json` verbatim, and that block is 15px. I read R21 as the *field value* text (`FieldControl`, already 16px), so the choice-row label stays `text-control` 15px, as the design system cards show. If the controller meant the choice labels too, set `control` to 16px in `control.json`: one value, no class changes.
2. **Indeterminate Checkbox (contract delta P1)** is still unruled. Dev had it (`aria-checked="mixed"`); this batch drops it per the brief.
3. **The plan-doc re-sort keeps coming back.** Every task that adds a token named in a plan code block adds a small `docs: re-sort …` commit. There were two in this batch.
