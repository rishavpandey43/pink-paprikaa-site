# Plan 3a, batch A report (Task 0 + Task 1)

Base `a984709`. Commits: `28a5d45` (Task 0 code fix), `c333ebe` (Task 1). Tree clean.

## Task 0: reconcile (R43 overlay)

**Built:** `W/task-0-fold-list.md`: a checks table (Steps 1–7, Radix, R13/R15/R19), 17 binding
overlay items, hand-offs and a pre-flight table. The plan file was not patched.

**The one code change:** `28a5d45 fix(ui): choice controls keep isInvalid over a caller's aria-invalid`.
`ChoiceControl` spread the caller's props after its own `aria-invalid`, so `aria-invalid={false}`
beside `isInvalid` cleared the error. `isInvalid` now wins, and without it the caller's value stands
(Field's `true`). There is a new test in `checkbox.test.tsx`. I watched it fail first, then pass.
This carried 2b item lives in lib, has no Field dependency and was small, so I landed it now rather
than giving it to Task 2.

**Carried 2b items, where each went:**
- Field keeps the status message for Input, Select and Checkbox `isInvalid`: overlay item 4 (Task 2 table test + docs).
- A caller's `aria-invalid` does not override `isInvalid`: done (`28a5d45`), item 3.
- Controls inside the field box are its direct child: item 6. SearchField already complies. OtpInput cells need the full disabled paint and the brand compound gated off when disabled.
- `@custom-variant field-disabled`: item 7. Not applied in 3a because no 3a task writes the selector. It stays a standalone ride-along, recipe included.
- Lower-case commit subjects: item 1. commitlint rejects all 18 brief subjects (tested); use `feat(ui): add the <Name> molecule …`.

**Other findings folded (would have failed a gate or broken behaviour):**
- Item 5 (Task 2): Field's `group-has-disabled/form-field:` would mute the label of every Select with a placeholder (its disabled `<option>`), the b2565db bug class. Use `group-has-[:is(input,textarea,select):disabled]/form-field:` and add a computed-colour `play`.
- Item 8 (Tasks 7, 12): `export const OnSurfaces: Story` collides with the imported `OnSurfaces` (TS2440). Use `OnSurfacesStory` with `name: "OnSurfaces"`, as the 2b stories do.
- Item 13 (Task 13): `pageNames()` reads `textContent`, but `Icon label=` names by `aria-label`, so the arrows read `""` and the test fails. Render the arrow names as `sr-only` text.
- Item 12 (Task 12): the viewport id is `floor360` via `globals`, not `mobile1`.
- Items 9–11: the contracts file now carries the R39 deltas: SearchField `clearLabel`, QuantityStepper `decrementLabel`/`incrementLabel`, Tabs `TabItem.isDisabled` and `isFullWidth`. Accordion `isDisabled` is DROP per R39.
- Item 14: R61 markers are needed in Tasks 4 (`quantity-stepper-count` `["min-w"]`), 9 (`snackbar` `["max-w"]`), 10 (`empty-state-symbol-lg` `["size"]`), 14 (both section-header measures `["max-w"]`), 16 (`accordion-answer-measure` `["max-w"]`) and 19 (`step-tracker-marker`, `step-tracker-mark` `["size"]`). Without them `storybook:test` goes red. An unmarked `ch` measure used as `max-w` also fails the spec.
- Item 17: molecules may NOT import layouts. `atomic-layering.js` orders atoms → molecules → organisms → layouts, and the plan's tier rule agrees. The dispatch line saying otherwise is wrong for this tree.
- Items 15–16: minors. Safari's `::-webkit-details-marker` (Task 16). Task 20's stale "15px `text-control`" expected difference (R21 makes it 16px).

**Verified OK, nothing to fold:** the Input `aria-invalid` row, so no Input change. `LinkAsProps["aria-current"]` accepts `undefined`, so Task 13 needs no conditional spread. Every token and alias path exists. `shadow-3` is not surface-overridden, so no `@utility` is needed. The contrast-pair schema matches. Radix 1.6.7 sub-packages match the briefs (toast 1.2.23, tabs 1.1.21, slot 1.3.3), including the `hotkey={[]}` guard and the Content `hidden` spread order. The lucide class names match (rendered). There are no R13 gaps, no R15 file reads and no stale brand-mark `svg` selectors in Tasks 1–19.

**Dev parity:** 19 tables present (Task 1 + Tasks 2–19). DELTA rows are resolved by R39 (items 9–11).

**Gate (Task 0 fix):** `pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui --skip-nx-cache`: 48 files, 801 tests passed, typecheck and lint green. `pnpm nx format:check`: exit 0.

## Task 1: shared internals

**Built:** `packages/ui/src/lib/use-controllable-state.ts` (+ `.test.tsx`, 5 tests), `assign-ref.ts`
(+ `.spec.ts`, 3 tests), `field-message.tsx` (+ `.test.tsx`, 8 tests), verbatim from the brief. ESLint
and Prettier changed nothing (diffed against the brief). Not exported from the barrel.

**TDD:** first run → 3 files FAIL, "Failed to resolve import ./assign-ref / ./field-message /
./use-controllable-state". After the implementation: `src/lib` has 11 files and 117 tests passing.

**Deviations:** none.

**Dev parity (FieldMessage):**

| Dev item | Ruling | Where / why |
| --- | --- | --- |
| error message is `role="alert"` (announced without focus) | ADD | `FieldMessage` + test "announces an error message…" |
| a `message` on the `default` status still shows, neutral, no glyph, over a hint | ADD | `FieldMessage` / `hasFieldMessage` + test "shows a message on the default status…" |
| renders nothing without hint or message | ALREADY | test "renders nothing without a hint or a status message" |
| per-status colour + glyph; message replaces hint | ALREADY | `it.each` status test |
| `loading` status → Spinner beside the message; `disabled`/`readOnly` statuses | DROP | contracts §1 `FieldStatus` has four values; modes are control props |
| exported `FIELD_STATUS_TONE` map | DROP | contracts §1 exports only `FieldStatus` + `FIELD_STATUS_ICON`; tone lives in the variant |
| dev `FieldMessage` renders a `<span>`; the plan renders a `<p>` | ALREADY (shape) | a block line under the control; the id and role contract are unchanged |
| dev `message`/`hint` typed `string` | ALREADY (wider) | `ReactNode`; `isShown` treats `""`, `false`, `null` as absent, as dev treated `""` |

`useControllableState` and `assignRef` have no dev counterpart.

**Gate:**
```
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache      → Successfully ran target build
pnpm nx run-many -t typecheck lint test -p ui design-tokens --skip-nx-cache
  design-tokens: Test Files 4 passed, Tests 249 passed
  ui:            Test Files 51 passed, Tests 817 passed
  → Successfully ran targets typecheck, lint, test for 2 projects
pnpm nx run @pink-paprikaa-web/storybook:build                       → Successfully ran target build
pnpm nx format:check                                                  → exit 0
```

**Commit:** `c333ebe feat(ui): shared internals for the molecules`.

## Concerns

- The dispatch said molecules may import layouts. The lint rule and the plan both forbid it (item 17). Please confirm the plan's reading stands.
- Item 7 (`@custom-variant field-disabled`) is deliberately left undone. It needs a controller call if it should land anyway.
- `storybook:test` was not run in batch A: neither brief's gate includes it, and Task 1 adds no token classes. Item 14 makes it mandatory from Task 4 on.
