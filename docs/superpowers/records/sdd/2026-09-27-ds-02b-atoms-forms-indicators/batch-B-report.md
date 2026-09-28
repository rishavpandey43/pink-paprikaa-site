# Batch B report: Plan 2b Task 2 (Input + shared field box) and Task 3 (Select)

Base `613fd7f`. Branch `feat/design-system`. Status: **DONE_WITH_CONCERNS** (concerns at the end, none blocking).

Commits:

- `021aa79 feat(ui): add the Input atom on a shared field box` (Task 2)
- `6e8964f docs: re-sort classes in the 2b plan's code blocks` (format:check fix, see Task 2 deviation 3)
- `fc566d1 feat(ui): add the Select atom in Input's field box` (Task 3)

---

## Task 2: Input and the shared field box

### Built

- `packages/design-tokens/tokens/component/field.json`: verbatim from the brief (spacing field-sm/md/lg/spinner, text field-suffix, shadow field-ring-danger/success/warning).
- `packages/ui/src/lib/component-variants.ts`: `SPACING` += field-sm, field-md, field-lg, field-spinner; `TEXT` += field-suffix; `SHADOW` += field-ring-danger, field-ring-success, field-ring-warning.
- `packages/ui/src/lib/field-control.tsx`: `FieldControl`, `FieldControlProps`, `fieldControlVariants`, per the brief with fold item 3 applied.
- `packages/ui/src/atoms/input/input.{tsx,test.tsx,stories.tsx}`: per the brief, with fold items 1 and 3 applied to the test.
- `packages/ui/src/index.ts`: `Input` export in the atoms block between `image-slot` and `link` (fold item 8).

### Deviations

1. **Fold item 3 (R21), as specified.** Size variants are `h-field-{sm,md,lg} text-body`, with a one-line R21 comment. The test expects `text-body` in the first test, and the `it.each` rows are `text-body` at every size with the title "renders size %s at %s with the 16px value text %s". **`control.json` was not created and `"control"` was not appended to `TEXT`**. Task 4 owns both. The dist check dropped `--text-control`. Verified: `--spacing-field-md: 48px;`, `--shadow-field-ring-danger: 0 0 0 3px #FCE9E9;` (and `--text-field-suffix: 12px;`).
2. **Fold item 1, as specified.** `markIn` is now `root.querySelector(".mask-symbol")` with the updated doc comment, and the `ARTWORK` import is deleted.
3. **Prettier re-sorts.** In `field-control.tsx`: spinner → `ms-auto size-field-spinner shrink-0 …`, suffix → `shrink-0 font-mono text-field-suffix text-text-subtle`, and the status rows → `border-2 border-status-* focus-within:shadow-field-ring-*`. In the stories: `max-w-text-measure-prose w-full` → `w-full max-w-text-measure-prose`. Once the field tokens existed, **`pnpm nx format:check` also failed on the plan file's code blocks** (the base `613fd7f` fails the same way once `dist` has the field tokens). Following the precedent of `a6008b4`/`5a9b82d`, `6e8964f` re-sorts those code blocks only (7 lines of class order, no content change). After that, format:check exits 0.

### Dev-parity check (brief table, copied and confirmed against `git show dev:packages/ui/src/atoms/input/input.test.tsx`)

| Dev item | Ruling | Where / clause |
| --- | --- | --- |
| input `type` defaults to `"text"` | ADD | `input.tsx` `type="text"` before the spread; first test |
| typing reaches `onChange` | ALREADY | register() test |
| no typing while disabled (`onChange` silent) | ADD | disabled test |
| fixed heights 40 / 48 / 56 | ALREADY | size test (`h-field-*`) |
| status: 2px border + trailing glyph | ALREADY | status test |
| `aria-invalid` on error only | ALREADY | invalid test |
| leading icon, mono suffix, `trailing` slot | ALREADY | icon/suffix/trailing test |
| multiline: textarea, `rows`, drag-resizable | ALREADY | textarea tests |
| loading: pulsing mark on the trailing edge | ALREADY | SymbolMark (`.mask-symbol`) + `aria-busy` |
| read-only: lock + sunken fill | ALREADY | read-only test |
| disabled: real grey fill, never opacity | ALREADY | disabled test (+ no-`opacity-` assertion) |
| disabled wins over a status | ALREADY | `has-disabled:border-border-subtle` |
| caller `className` replaces a conflicting class | ALREADY | `w-60` replaces `w-full` |
| glyphs and mark shrink to 16px at size sm | DROP | spec D2 |
| axe over rest, error, read-only and multiline | ADD | second a11y test |
| `icon` / `trailing` controls off in Storybook | ADD | `argTypes` |
| stories: sizes, statuses, icons, suffix + trailing, states, multiline | ALREADY | one story per card row |
| docs: the control is label-less; Field owns label / hint / message | ALREADY | docs description |
| `onChange` typed for input and textarea | ALREADY | discriminated `InputProps` union |
| **(added) field value text 16px at every size** | CHANGE (R21) | dev's sm 14 / md-lg 15 → 16; Task 17 parity lists it |

All 11 dev tests map to a row. Nothing was missed.

### Evidence

RED: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache` → `FAIL src/atoms/input/input.test.tsx` (module `./input` missing). Also the 3 `index.spec` folder checks failed while the folder had no component.
GREEN (the gate):
```
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
GATE_EXIT=0
 Test Files  4 passed (4)     Tests  190 passed (190)   # design-tokens
 Test Files  25 passed (25)   Tests  408 passed (408)   # ui (+19)
 NX   Successfully ran targets typecheck, lint, test for 2 projects and 2 tasks they depend on
 Storybook build completed successfully
pnpm nx format:check → exit 0 (after 6e8964f)
```

---

## Task 3: Select

### Built

- `packages/ui/src/atoms/select/select.{tsx,test.tsx,stories.tsx}`: per the brief, with fold items 4 and 11.
- `packages/ui/src/index.ts`: `Select`, `SelectOption`, `SelectProps` in the atoms block between `pattern-field` and `social-headline`.

### Deviations

1. **Fold item 4, the hidden input.** `name` is destructured and passed explicitly to the `<select>`. The render-prop child is a fragment of the `<select>` and then `<input type="hidden" name={name} value={value ?? initialValue ?? ""} />`.
   - **My addition:** the hidden input also requires `disabled !== true`. A `disabled` + `readOnly` select must not post a value that a plain disabled control would never post. One extra test pins this ("submits nothing when read-only and disabled").
   - The fold's test is included as written: a read-only Select renders one hidden input with `name="outlet"` and value `20:00`, and a non-read-only Select alongside it renders none.
2. **Fold item 11 / R52.** The `readOnly` JSDoc says the hidden input exists so "a native form post still submits it". It also says "the value is caller-owned: react-hook-form skips a disabled field, so an RHF form takes a read-only value from its own `defaultValues`". Nothing claims or tests that RHF receives the value.
3. **Prettier re-sorts** in the stories only: `max-w-text-measure-prose w-full` → `w-full max-w-text-measure-prose` (three places). No plan code-block re-sort was needed.

### Dev-parity check (brief table, confirmed against dev's 13 Select tests)

| Dev item | Ruling | Where / clause |
| --- | --- | --- |
| Radix Select popover | DROP | spec §3.3, D7 (native `<select>`) |
| `onValueChange(value)` | DROP | D17 + contracts §0: native `onChange` |
| `placeholder` defaults to "Choose one" | DROP | D9 |
| bare-string options | DROP | spec §8.2 |
| option `disabled` | ALREADY | `SelectOption.isDisabled`; first test |
| placeholder until chosen; a value wins | ALREADY | placeholder + value tests |
| opens and picks from pointer and keyboard | ALREADY | native select; register() test (Tab + `selectOptions`) |
| fixed heights | ALREADY | `FieldControl` |
| status border; its glyph replaces the chevron | ALREADY | status test |
| `aria-invalid` on error only | ADD | invalid test |
| leading icon | ALREADY | icon inset test |
| read-only cannot open + lock | ALREADY | disabled + lock test |
| disabled: real grey fill, never opacity | ADD | disabled test |
| `id` / describedby / required on the select | ADD | wiring test |
| caller `className` on the box | ADD | wiring test |
| axe over placeholder, icon + error, disabled, read-only | ADD | a11y test |
| `icon` control off in Storybook | ADD | `argTypes` |
| sizes story shows md too | ADD | `Sizes` |
| a disabled option in a story | ADD | `SLOTS` |
| stories chosen / statuses / read-only + disabled | ALREADY | stories |
| **(added) read-only value still posts natively** | ADD (controller ruling, R52) | hidden-input tests (2) |

### Evidence

RED: `FAIL src/atoms/select/select.test.tsx` (module `./select` missing).
GREEN (the gate):
```
GATE_EXIT=0
 Test Files  4 passed (4)     Tests  190 passed (190)   # design-tokens
 Test Files  26 passed (26)   Tests  425 passed (425)   # ui (+17)
 NX   Successfully ran targets typecheck, lint, test for 2 projects and 2 tasks they depend on
 Storybook build completed successfully
pnpm nx format:check → exit 0

pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache → SB_EXIT=0
 ✓ |storybook (chromium)| packages/ui/src/atoms/select/select.stories.tsx (10 tests)   # incl. "long option label at 360px" play
 ✓ |storybook (chromium)| packages/ui/src/atoms/input/input.stories.tsx (13 tests)
 Test Files  17 passed (17)   Tests  151 passed (151)
```
The first cold run passed, so no re-run was needed. The commit hooks (lint-staged, commitlint) passed on all three commits. The tree is clean.

---

## Concerns

1. **The plan-doc re-sort will recur.** Every later task that adds a token referenced in a plan code block makes `format:check` flag the plan file again. Later implementers should expect a small `docs: re-sort …` commit, as `6e8964f` did here.
2. **The hidden input's `disabled` guard** goes beyond fold item 4's literal condition (deviation 1). Revert it if the controller wants the literal form.
