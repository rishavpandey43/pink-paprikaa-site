# Plan 3a, batch C report (carried fixes + Task 4 QuantityStepper + Task 5 OtpInput + Task 6 SlotPicker)

Base `2fabad0`. Tree clean at the end. Commits, in order:

| SHA | Subject |
| --- | --- |
| `eda52a8` | fix(ui): mount a fresh alert when a field hint turns into an error |
| `03b7243` | fix(ui): document the limits of use-controllable-state and assign-ref |
| `b0858f5` | feat(ui): add the QuantityStepper molecule with typed entry |
| `3750a25` | feat(ui): add the OtpInput molecule on a single one-time-code input |
| `acaf1f3` | docs: re-sort the otp cell classes in plan 3a |
| `d07a6ba` | feat(ui): add the SlotPicker molecule on native radios |
| `374d96c` | docs: re-sort the slot note classes in plan 3a |

## Carried fixes (`carried-fixes-C.md`)

1. **FieldMessage remounts on a status change** (`eda52a8`). The status `<p>` now has `key={status}`, with a comment explaining why. When a hint turns into an error, or one status turns into another, the node is remounted, so the new `role="alert"` node is announced.
   - New test: "mounts a fresh alert when a hint turns into an error…". It checks node identity hint → error → warning.
   - TDD: it failed first ("expected <p> not to be <p>", 1 failed / 9) and passed after the fix (9/9).
2. **JSDoc limits** (`03b7243`).
   - `useControllableState`: the setter compares against the rendered value, not a queued one. Two sets in one event both compare against that value, and there is no updater form.
   - `assignRef`: a React 19 callback-ref cleanup return is dropped. The callback gets `null` on unmount instead, which is the pre-19 contract.
   - Comments only. Its subject is `fix(ui): document …` because the dispatch asked for fix commits.

## Task 4: QuantityStepper (client)

**Built:**
- `tokens/component/quantity-stepper.json`.
- `"quantity-stepper-count"` in `SPACING`.
- `molecules/quantity-stepper/{quantity-stepper.tsx,.test.tsx,.stories.tsx}`, verbatim from the brief plus the fold items.
- A barrel line, sorted between Field and SearchField.

**Fold items applied:**
- **Item 14 (R61):** `quantity-stepper-count` carries `"$extensions": { "pink-paprikaa": { "utility": ["min-w"] } }`.
- **Item 10 (R39):**
  - Props: `decrementLabel?: string | undefined` and `incrementLabel?: string | undefined`. Each falls back to the brief's `Remove one`/`Add one` (step 1) or `Remove N`/`Add N`.
  - New test: "names its buttons by decrementLabel and incrementLabel (the dish)". It uses `Remove one Paneer Tikka` / `Add one Paneer Tikka`.
  - The `InACartRow` story passes both labels, naming Paneer Butter Masala.
- **Items 1, 2 and 17:** lower-case subject, sorted barrel line, and no layout imports.

**Deviations:** none beyond the fold items. ESLint and Prettier changed nothing.

**TDD:** the first run failed with "Failed to resolve import ./quantity-stepper". After implementing, 25 tests pass: the brief's 24 plus the label test.

**Dev parity:**

| Dev item | Ruling | Where / why |
| --- | --- | --- |
| count announced as it changes (`aria-live="polite"`) | ADD | `role="status"` `sr-only` region + test |
| `min={0}` reaches zero (removes the line) | ADD | test "reaches zero…" |
| fixed size per `size` | ADD | `it.each` size test (`size-8` / `size-10`) |
| end-of-range button is a real grey glyph, never opacity | ADD | test "greys a button…" |
| caller `className` merges | ADD | test "merges a caller className…" |
| `InACartRow` story | ADD | `InACartRow` story (now passes both labels) |
| `decrementLabel` / `incrementLabel` overrides (name the dish) | **ADD (R39, fold 10)** | props + test (was DELTA in the brief); dev test "names the dish…" |
| default `label` "Quantity" | DROP | spec D9; `label` required |
| `max` default 20 | DROP | contracts §5 defaults only `min`/`step` |
| 36 / 44px buttons | DROP | spec D2: 32 / 40 |
| native `<div>` props on the root | DROP | contracts §5 takes `className` only |
| `onChange(value)` | ALREADY | `onValueChange` |
| named group; counts up/down; controlled; stops + disables at min and max | ALREADY | tests as named in the brief |
| `Sizes`, `AtTheEndsOfTheRange` stories | ALREADY | `Sizes`, `AtMin`, `MinZero`, `AtMax` |

I checked this against dev's `quantity-stepper.test.tsx`. Its 11 tests all map to a row above.

**Gate:**
```
pnpm nx build design-tokens + run-many -t typecheck lint test -p ui design-tokens --skip-nx-cache
  tokens 249 · ui 54 files / 880 → Successfully ran
pnpm nx run storybook:test           → 48 files / 516 passed (R61 catalogue spec green with the marker)
pnpm nx run @pink-paprikaa-web/storybook:build → Successfully ran
pnpm nx format:check                 → exit 0
```

## Task 5: OtpInput (client)

**Built:**
- `tokens/component/otp-input.json`.
- `"otp-digit"` in `TEXT`.
- `molecules/otp-input/{otp-input.tsx,.test.tsx,.stories.tsx}`.
- A barrel line, sorted before QuantityStepper.

**Fold item 6 applied:**
- `isDisabled: { true: { cell: "cursor-not-allowed border-border-subtle bg-ink-100 text-ink-400" } }`. A comment explains that the cells are skins with no control inside, so the box's `has-[>:is(input,…):disabled]` paint never reaches them.
- The brand compound is now `{ status: "default", isDisabled: false, state: ["filled", "active"], class: { cell: "border-border-brand" } }`.
- The disabled test adds these assertions for every cell: `border-border-subtle`, `text-ink-400` and `cursor-not-allowed` are present, and `border-border-brand` is absent (`defaultValue="48"` fills two cells).
- TDD for the fold: the brief's code failed the new assertions (1 failed / 16), and the fold passed them (16/16).
- The real `<input>` stays the direct child of `styles.field()`. The cells are `aria-hidden` spans.

**Deviations:**
- The test helper uses `cell.textContent`, not `cell.textContent ?? ""`. This TS DOM lib types `Element.textContent` as `string`, so `@typescript-eslint/no-unnecessary-condition` rejected the `??`.
- Plan-doc re-sort (`acaf1f3`, the known trap). Once `text-otp-digit` existed, Prettier moved it in the plan's Task 5 code block.
- A filled disabled cell keeps the state variant's `border-2`, so it is 2px `border-subtle`, while a disabled Input is 1px. The fold's classes were applied exactly as written; this is cosmetic, noted here and not changed.

**Dev parity:**

| Dev item | Ruling | Where / why |
| --- | --- | --- |
| filled cell takes the 2px brand border; empty stays thin | ADD | test "gives a filled cell the brand border, and lets a status outrank it" |
| a status border outranks the filled border | ADD | same test |
| `hint` line under the cells | ADD | via `message` on the default status + test + `WithHint` story |
| disabled takes no typing; grey fill, never opacity | ADD | disabled test, **plus the full disabled paint and no brand border (fold 6)** |
| caller `className` merges | ADD | test "merges a caller className over its own gap" |
| axe over a disabled code | ADD | axe test |
| `Narrow` story (six cells wrap at 360px) | ADD | `Narrow` story |
| error message announced (`role="alert"`) | ADD | Task 1 `FieldMessage` (now re-mounted per status, carried fix 1) |
| default `label` "One-time code" | DROP | spec D9 |
| `status` `readOnly` / `disabled` / `loading` | DROP | contracts §1 / §5 |
| one input per digit, "Digit N of M", ArrowLeft/Right between cells | DROP | deviation 3 |
| native `<div>` props on the root | DROP | contracts §5 |
| `onChange(code)` | ALREADY | `onValueChange` |
| 6 / 4 cells; one digit per cell; whole code reported; uncontrolled | ALREADY | "is one labelled code field…", "fills the cells in order…", "renders four cells…", "shows the caller's code…" |
| paste spills; non-digits ignored; Backspace walks back | ALREADY | paste (formatted + too long), letters and Backspace tests |
| `aria-invalid` only on error; describedby → the showing line | ALREADY | status test |
| `Default`, `FourDigits`, `PartlyEntered`, `Statuses` stories | ALREADY | `Playground`, `Complete`, `Partial`, `Verified` / `Expired` / `Disabled` |

I checked this against dev's `otp-input.test.tsx`. Its 16 tests all map to a row above, and "moves between cells with the arrow keys" is the DROP row.

**Gate:**
```
run-many -t typecheck lint test -p ui design-tokens --skip-nx-cache → tokens 249 · ui 55 files / 896 → Successfully ran
pnpm nx run storybook:test           → 49 files / 524 passed
storybook:build                      → Successfully ran
pnpm nx format:check                 → failed on the plan doc only → re-sorted (acaf1f3) → exit 0
```

## Task 6: SlotPicker (server-safe, native radios)

**Built:**
- `tokens/component/slot-picker.json` (`grid-template-columns` `slot-picker` and text `slot-picker-note`).
- `"slot-picker-note"` in `TEXT`.
- A `slot-picker` contrast group in `contrast-pairs.json`.
- `molecules/slot-picker/{slot-picker.tsx,.test.tsx,.stories.tsx}`.
- A barrel line after SearchField.
- No `"use client"`.

**Deviations:**
- The `note` slot uses `font-regular`, not the brief's `font-normal`. `tailwindcss/no-custom-classname` rejects `font-normal`, and the typography tokens name the weight `regular`. Batch B made the same fix in Field. `regular` is in `FONT_WEIGHT` for twMerge.
- Plan-doc re-sort (`374d96c`). Once `text-slot-picker-note` existed, Prettier re-sorted the note class string in the plan. The plan still reads `font-normal`, because the plan is not patched.
- The brief expected 16 tests; there are 18. The `it.each` status-border table adds rows.

**TDD:** the first run failed with "Failed to resolve import ./slot-picker". After implementing, 18 tests pass. The design-tokens contrast spec went from 249 to 253 tests with the new group; the three pairs are ink-700/white, pink-700/pink-50 and text-subtle/pink-50.

**Dev parity:**

| Dev item | Ruling | Where / why |
| --- | --- | --- |
| arrow keys move between slots (skip sold-out) | ADD | "moves between slots with the arrow keys, skipping a sold-out one" |
| clicking a sold-out slot reports nothing; disabled is a fill | ADD | sold-out test |
| label mutes when the group is disabled | ADD | `group/slot-picker` + `group-disabled/slot-picker:text-text-subtle` + disabled test |
| success / warning paint the slot border | ADD | `status` variant + `it.each` border test |
| invalid only on error; error announced | ADD | "marks the slots invalid only on the error status" + alert assertion |
| `hint` line under the grid | ADD | via `message` on the default status + test + `Statuses` story |
| caller `className` merges | ADD | test "merges a caller className over its own gap" |
| axe over a disabled group | ADD | axe test (rest + error) |
| `Statuses` and `Narrow` stories | ADD | both present |
| bare-string slots | DROP | spec §8.2 |
| Radix RadioGroup | DROP | spec D7 / §9.2 |
| `status` `disabled` / `readOnly` / `loading` | DROP | contracts §1; native `disabled` |
| `InsideAField` story | DROP | deviation 1 |
| optional visible `label` | ALREADY | `legend` + `isLegendHidden` (test "keeps the group named when its legend is visually hidden") |
| name "ASAP, 12 min" | ALREADY | named "ASAP", described "12 min" |
| chosen slot; reports pick; uncontrolled; group disabled; columns/auto-fit | ALREADY | tests as named |
| `Default`, `FixedColumns`, `SoldOut` stories | ALREADY | `Playground`, `Columns` |

I checked this against dev's `slot-picker.test.tsx`. Its 14 tests all map to a row above. Dev's "disables every slot … on the disabled status" is the `status` DROP row, and the group-disabled test covers the behaviour.

**Gate:**
```
pnpm nx build design-tokens → tokens test 253 passed
run-many -t typecheck lint test -p ui design-tokens --skip-nx-cache → tokens 253 · ui 56 files / 914 → Successfully ran
pnpm nx run storybook:test           → 50 files / 530 passed
storybook:build                      → Successfully ran
pnpm nx format:check                 → failed on the plan doc only → re-sorted (374d96c) → exit 0
```

## Final batch gate (cold)

```
pnpm nx run-many -t typecheck lint test -p ui design-tokens storybook --skip-nx-cache
  design-tokens 253 · ui 56 files / 914 · storybook 50 files / 530 → Successfully ran for 3 projects
pnpm nx format:check → exit 0 · pnpm nx sync:check → up to date · pnpm run guard:founder → clean
```

## Concerns

- **lint-staged left a stash.** The first `git commit` of Task 6 failed inside lint-staged ("Failed to stage changes from tasks", a git error). The staged set was intact afterwards and the retry committed it as `d07a6ba`. lint-staged left its automatic backup as `stash@{0}` ("lint-staged automatic backup", `5271974`). It holds the same content as `d07a6ba`. I did not drop it, because dropping a stash is destructive; the controller may drop it.
- **Filled disabled OTP cells are 2px.** They keep the state variant's `border-2`, while a disabled Input is 1px (fold 6 applied as written). This is cosmetic. The fix, if wanted, is to add `border` to the `isDisabled` cell classes, but a disabled error cell would then go to 1px while a disabled error Input stays 2px.
- **Blank labels.** `decrementLabel`/`incrementLabel` fall back through `??`, so an explicit `""` gives a nameless button. R48 ("blank = no label") suggests treating blank as absent. Left as `??` because the fold item doesn't ask for it.
