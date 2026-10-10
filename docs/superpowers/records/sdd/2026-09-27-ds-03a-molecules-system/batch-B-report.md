# Plan 3a, batch B report (2c fix wave + Task 2 Field + Task 3 SearchField + plan-5 FormStates)

Base `c333ebe`. Tree clean at the end. Commits, in order:

| SHA | Subject |
| --- | --- |
| `fad1dd7` | fix(ui): type-check container's spread props through a narrow as cast |
| `c0ec4f0` | fix(ui): prove the scrollable rail never widens the page at 360 |
| `0425247` | fix(ui): count autogrid columns at 360 |
| `8c73e6c` | fix(ui): assert the 1280 viewport in container's desktop story |
| `503dddb` | fix(storybook): drop the vacuous runtime check of the spacing steps |
| `901bed7` | fix(ui): keep post frame's scale while its frame measures 0 wide |
| `8b3744a` | feat(ui): add the Field molecule wired by render prop |
| `581f0bc` | docs: re-sort the field-side classes in plan 3a |
| `26be279` | feat(ui): add the SearchField molecule on the shared field box |
| `2fabad0` | feat(storybook): add the FormStates motion specimen on Field |

## 2c fix wave (`02c-layouts/final-fix-wave.md`, items 1–6)

One fix commit per item.

1. **Container cast** (`fad1dd7`). `const Element: ElementType = as` became `const Element = as as "div"`, with the same comment the other layouts carry. The `ElementType` import is gone.
2. **Rail at 360** (`c0ec4f0`). There is a JSDoc on `isScrollable`: the rail's `-m-1` needs at least 4px of parent padding, and a Container gutter provides it. `ScrollableRailAt360` now asserts `document.documentElement.scrollWidth <= innerWidth`.
   - **Deviation:** the new assertion failed at once, measuring **364 on a 360 viewport**. The story rendered the rail with no padded parent, because the vitest story runner applies no `layout: "padded"` body padding. That is exactly the edge the JSDoc warns about.
   - **Fix:** the story now wraps the rail in `<div className="px-gutter">`, the page gutter a Container gives. The ring-room checks are unchanged and pass.
3. **AutoGrid at 360** (`0425247`). `ColumnsAt360` renders `<AutoGrid data-testid="grid">` and a `play` asserts `columnCount === 1`, matching the 768 and 1280 stories.
4. **Container desktop** (`8c73e6c`). `AtDesktop`'s play asserts `window.innerWidth === 1280` first.
5. **Spacing** (`503dddb`). `await expect(isEveryStepShown).toBe(true)` became `void isEveryStepShown;`. The real check is the type, and a comment says so.
6. **PostFrameScaler** (`901bed7`). The ResizeObserver callback returns early when `clientWidth === 0`.
   - New test: "keeps its last scale while the frame measures 0 wide". It watches a 0 → 540 → 0 sequence: the canvas stays invisible at the first 0, then keeps `scale(0.5)`.
   - I watched it fail first (1 failed / 40), then pass (41).

Gate: `run-many -t typecheck lint test -p ui storybook` was green. ui has 818 tests; `storybook:test` ran 45 files and 490 tests. `format:check` exited 0.

## Task 2: Field

**Built:**
- `tokens/component/field-layout.json` (`--grid-template-columns-field-side` in `theme.css`).
- `molecules/field/{field.tsx,field.test.tsx,field.stories.tsx}`.
- A barrel line after `./lib/space`.

**Fold items applied:**
- **Item 4:** the `it.each` table for Input, Select and Checkbox. Each is marked invalid, described by the message and `role="alert"`. The `status` JSDoc is worded as the fold item says, and the stories' component description has the lone-Checkbox sentence appended.
- **Item 5:** the label slot uses `group-has-[:is(input,textarea,select):disabled]/form-field:text-text-subtle`, and the test asserts that class. `WithError` (a Select with a placeholder) has a `play`: the label's computed colour equals the resting `text-text-body` colour, read from a probe span with that class.
  - **Mutation-checked:** I swapped the selector back to `group-has-disabled/form-field:` and the `WithError` play failed (1/18). I then restored it.
- **Items 1 and 2:** lower-case subject, barrel placement.

**Deviations:**
- `optional` slot: I used `font-regular` instead of the brief's `font-normal`. The typography tokens name the weight `regular`, and `tailwindcss/no-custom-classname` rejects `font-normal`.
- There is an extra `play` on `ControlModes`. Only the disabled field's label mutes; the read-only and loading labels match the resting colour. This proves the selector's positive case in a real browser, which jsdom cannot.
- Plan-doc re-sort: `581f0bc` is a separate `docs:` commit. Once `grid-cols-field-side` existed, Prettier re-sorted one class string in the plan's Task 2 code block (the known trap).

**TDD:** the first run failed with "Failed to resolve import ./field". After implementing, 17 tests pass: the brief's 14 plus the 3 rows of the item-4 table.

**Dev parity** (brief table, with rulings as built):

| Dev item | Ruling | Where / why |
| --- | --- | --- |
| `side` splits into two columns from 480px (`sm`) only; stacks on a 360px screen | ADD | `side` variant `sm:grid-cols-field-side` / `sm:pt-3.25` + side test |
| label mutes while the control is disabled | ADD | CSS, no prop: `group/form-field` + **`group-has-[:is(input,textarea,select):disabled]/form-field:text-text-subtle`** (fold 5, not the brief's `group-has-disabled`) + test + `WithError`/`ControlModes` plays |
| required marker is brand-coloured | ADD | class assertion in the required test |
| caller `className` replaces the root gap | ADD | test "merges a caller className…" |
| story states readOnly / loading / disabled / multiline notes | ADD | `ControlModes` story |
| error message `role="alert"`; message on `default` status shown neutral | ADD | Task 1 `FieldMessage` |
| a status needs its message for Input, Select, Checkbox (2b carry) | ADD | fold 4 `it.each` + JSDoc + story description |
| `status` values `loading` / `disabled` / `readOnly` (+ loading-diamond message) | DROP | contracts §1 `FieldStatus` has four values; modes are control props |
| label as plain text when no `htmlFor`; `AroundABareControl` story | DROP | render-prop wiring always labels one control; groups carry their own legend and message |
| `side` collapses to `stack` without a label | ALREADY | `label` is required by type |
| `layout` / `htmlFor` props | ALREADY | renamed `orientation` / `id` (deviation 9) |
| hint; message replaces hint; per-status colour + glyph; optional; hidden `*` | ALREADY | tests as the brief names them |
| message id the control points at | ALREADY | render prop `aria-describedby` |
| axe over required, error, side + optional | ALREADY | axe test (rest + error) |

I checked this against the names in dev's `field.test.tsx`. Every dev test maps to a row above. Its `FieldMessage` tests are covered by Task 1.

**Gate:**
```
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache               → green
pnpm nx run-many -t typecheck lint test -p ui design-tokens --skip-nx-cache   → tokens 249; ui 52 files / 838 tests; Successfully ran
pnpm nx run storybook:test                                                    → 46 files / 499 tests passed
pnpm nx run @pink-paprikaa-web/storybook:build                                → Successfully ran
pnpm nx format:check                                                          → exit 0 (after the plan-doc re-sort)
```

## Task 3: SearchField (client)

**Built:**
- `molecules/search-field/{search-field.tsx,search-field.test.tsx,search-field.stories.tsx}`.
- `@utility search-reset` in `styles.css`, right after `z-toast`.
- A barrel line after Field's.

**Fold items applied:**
- **Item 9 (R39):** `clearLabel?: string | undefined`, default `"Clear search"`, used as the button's `aria-label`. New test: "names the clear button by clearLabel" (`"Clear dish search"`).
- **Item 6:** the render prop returns the bare `<input>`, a direct child of `FieldControl`, and a code comment records why. `canClear` excludes `disabled`, so no disabled button ever meets the box's selector.
- **Item 1:** lower-case subject.

**Deviations:** none beyond the fold items. The code is verbatim from the brief otherwise. ESLint and Prettier changed nothing.

**TDD:** the first run failed with "Failed to resolve import ./search-field". After implementing, 16 tests pass: the brief's 15 plus the `clearLabel` test.

**Dev parity:**

| Dev item | Ruling | Where / why |
| --- | --- | --- |
| clear button hit area 40px | ADD | `clear` slot `relative before:absolute before:-inset-2` + assertion |
| fixed heights per size (40 / 48) | ADD | `it.each` size test |
| status raises the border to 2px and hangs a trailing glyph | ADD | status test (FieldControl draws it) |
| disabled takes no typing, grey fill, never opacity | ADD | disabled test |
| loading shows the pulsing diamond | ADD | loading test |
| read-only hides the clear button | ADD | test "never offers to clear a read-only box" |
| caller `className` merges | ADD | test "merges a caller className…" |
| axe over a disabled `sm` box | ADD | axe test |
| stories: success / error / read-only; `Narrow` | ADD | `Statuses`, `Narrow` |
| `clearLabel` override | **ADD (R39, fold 9)** | prop + test (was DELTA in the brief) |
| default `label` / dish placeholder | DROP | spec D9; `label` required |
| `status` `loading` / `disabled` / `readOnly` | DROP | `isLoading`, `disabled`, `readOnly` props |
| separate `message` prop beside `hint` | DROP | one `hint` line that becomes the status message |
| native `onChange` as the value API | ALREADY | `onValueChange` |
| clear only with a query; `onClear`; hidden while loading | ALREADY | tests as named |
| `aria-invalid` only on error; hint replaced; describedby → showing line | ALREADY | status + describedby tests |
| glass turns brand on focus | ALREADY | FieldControl |
| `Default`, `Interactive`, `Sizes` stories | ALREADY | `Playground`, `WithValue` (play), `Small` |

I checked this against the names in dev's `search-field.test.tsx`; every one maps to a row above.

**Gate:**
```
pnpm nx run-many -t typecheck lint test -p ui design-tokens --skip-nx-cache   → tokens 249; ui 53 files / 854 tests; Successfully ran
pnpm nx run storybook:test                                                    → 47 files / 507 tests passed
pnpm nx run @pink-paprikaa-web/storybook:build                                → Successfully ran
pnpm nx format:check                                                          → exit 0
```

## Plan 5 Motion `FormStates` specimen

**Built** (`2fabad0`):
- `FormStates` in `apps/storybook/src/foundations/motion/motion.stories.tsx`, verbatim from `05/task-8-brief.md`. It imports `Phone`, `Search`, `Field`, `Input` and `OUTLET`.
- The deferral comment is removed.
- `form-states.mdx` gets its `Canvas`/`Specimens` imports and `<Canvas of={Specimens.FormStates} …>` back.

**Wording check ("ink-100 vs ink-200") against the controls as built:**
- `ink-100` is correct for Field's control. The field box disables to `border-border-subtle bg-ink-100 text-ink-400`.
- The row said "all", but the choice boxes (Checkbox, Radio, Switch) disable to an `ink-200` fill, the same fill as Buttons in `states.mdx`.
- The `disabled` row now reads: "`border-subtle`, `ink-100` fill, `ink-400` text (choice boxes: `ink-200` fill) | — (Field mutes its label)".
- **Also corrected:** the `loading` row said "trailing Spinner". As built, the box pulses the brand mark (`SymbolMark`, `animate-mark-pulse`), so the row now says "pulsing brand mark in the box".

**Gate:** storybook typecheck and lint green. `storybook:test` ran 47 files and 508 tests (+1 FormStates; a11y `test: "error"` passes). The storybook build succeeded and `format:check` exited 0.

## Final batch gate (cold)

```
pnpm nx run-many -t typecheck lint test -p ui design-tokens storybook --skip-nx-cache
  design-tokens 249 · ui 53 files / 854 · storybook 47 files / 508 → Successfully ran for 3 projects
pnpm nx format:check → exit 0 · pnpm nx sync:check → up to date · pnpm run guard:founder → clean
```

## Concerns

- In fix-wave item 2, the story's own render broke the new rule until I added the gutter wrapper. The Cluster component is unchanged; any caller that places a scrollable rail flush with the viewport would overflow by 4px. The JSDoc now documents this, but a caller without a padded parent will still hit it.
- Process slip: while restoring a temporary mutation probe, I ran an interactive `git checkout -p --` by mistake. It had no stdin and discarded nothing (I checked status and file contents). The probe itself was reverted with `sed`.
