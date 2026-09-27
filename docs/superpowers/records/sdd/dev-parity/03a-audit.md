# Dev-parity audit — Plan 3a (molecules, system)

Plan: `docs/superpowers/plans/2026-09-27-ds-03a-molecules-system.md`. Every component task (2–19) has a dev
counterpart under `dev:packages/ui/src/molecules/<name>/`. Task 1 carries a table for `FieldMessage`, which
lived in dev's `field.tsx`. Task 0 gained Step 7, "Dev parity tables present on every ported-component task".
The old Step 7 is now Step 8.

Rulings: **ADD** means amended in place (code, test, story). **DROP** means the spec or contract contradicts the
dev item. **ALREADY** means the plan covers it. **DELTA** means it needs a contract change. DELTA rows are not
implemented; Task 0 Step 7 tells implementers to wait for the controller's ruling.

## Totals

ADD 94 · DROP 40 · ALREADY 75 · DELTA 5.

## Per component

| Task / component   | ADD | DROP | ALREADY | DELTA | Notable                                                                                                                                                                                                          |
| ------------------ | --: | ---: | ------: | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 FieldMessage     |   2 |    2 |       2 |     0 | ADD an error message as `role="alert"`. ADD: a `message` on the `default` status now shows neutral, with no glyph (`hasFieldMessage` = message ∨ hint). DROP the loading/disabled/readOnly statuses (contracts §1). |
| 2 Field            |   6 |    2 |       5 |     0 | ADD: `side` is two columns only from `sm` (480px). ADD: the label mutes while the control is disabled (CSS `group/form-field` + `group-has-disabled/form-field:`, no prop). ADD the `ControlModes` story. DROP the label-without-control mode (render-prop wiring). |
| 3 SearchField      |   9 |    3 |       5 |     1 | ADD: 40px clear hit area (`before:-inset-2`). ADD tests for size heights, 2px status border + glyph, disabled/read-only, loading mark and className. ADD the `Statuses`/`Narrow` stories. DELTA `clearLabel`. |
| 4 QuantityStepper  |   6 |    4 |       3 |     1 | ADD: the count is announced after a button press (`role="status"` sr-only, cleared on input focus). ADD tests for zero, fixed size, grey-not-opacity and className. ADD the `InACartRow` story. DROP 36/44 buttons (DS 32/40), `max=20` and the default label. DELTA the increment/decrement labels. |
| 5 OtpInput         |   8 |    4 |       5 |     0 | ADD the filled-cell brand border and status-outranks-filled tests. ADD the dev `hint` via `message` on the default status (no new prop). ADD the disabled no-typing test, the `WithHint`/`Narrow` stories and className. DROP per-digit inputs + arrow keys (deviation 3). |
| 6 SlotPicker       |   9 |    4 |       4 |     0 | ADD a native arrow-key test. ADD a sold-out click reporting nothing. ADD the legend muting on a disabled fieldset. ADD success/warning slot borders, invalid-only-on-error, hint via `message`, and the `Statuses`/`Narrow` stories. DROP string slots, Radix RadioGroup and `InsideAField`. |
| 7 Alert            |   5 |    2 |       3 |     0 | ADD a soft-fill assertion per tone, the full-border test, a 40px dismiss hit area, className and the `Narrow` story. DROP the non-overridable glyph (contract has `icon`). |
| 8 Toast            |   4 |    1 |       5 |     0 | ADD Radix `type` by tone (danger assertive, the rest polite; Radix's default is all assertive) + an announcer test. ADD a 44px action hit + press. ADD className, the danger-with-Retry story and `CustomGlyph`. DROP the rise-in on every toast (DS animates `pop` only). |
| 9 Snackbar         |   4 |    1 |       5 |     0 | ADD the same politeness split. ADD a 44px action + 40px dismiss hit. ADD className and the `Brand`/`TopCenter`/`BottomRight`/`Narrow` stories. DROP dismiss-only-with-`onClose` (deviation 6). |
| 10 EmptyState      |   4 |    1 |       4 |     0 | ADD the 32px pink-300 glyph assertion, md padding, className and the `InCart` story. DROP the default copy (D9). |
| 11 Tabs            |   5 |    0 |       5 |     2 | ADD `min-h-hit` on underline triggers (spec §5.5). ADD the underline-colour assertion. ADD a glyph in the ReactNode label (`inline-flex gap-2`), className and the `WithIcons`/`Narrow` stories. DELTA per-tab `isDisabled` and `isFullWidth`. |
| 12 Breadcrumb      |   2 |    1 |       4 |     0 | ADD the className test and the `UnlinkedLevel` story. DROP `tone` (D5). |
| 13 Pagination      |   3 |    3 |       5 |     0 | ADD `<ol>` (was `<ul>`), className and the `ManyPages`/`Narrow` stories. DROP `onPageChange`, the single-page render (deviation 13) and 44px pills (DS 40). |
| 14 SectionHeader   |   4 |    2 |       3 |     0 | ADD levels 1–6 as an `it.each`, omitted overline/lede, className and the `HeadingLevels`/`Narrow` stories. DROP `on="brand"` and the fluid lede (DS `body-lg`). |
| 15 Stat            |   3 |    1 |       3 |     0 | ADD a "no sub / no glyph unless given" test, className and the `WithSub`/`Row`/`Narrow` stories. |
| 16 Accordion       |   4 |    4 |       3 |     1 | ADD a click-toggles test (jsdom supports summary activation), Enter in the `Playground` play, className and `Narrow`. DROP `headingLevel` questions, Radix roving focus, all-collapsed default and the egg fixture (C10). DELTA per-item `isDisabled`. |
| 17 ListRow         |   7 |    0 |       4 |     0 | ADD "a static row has no button/link", Space as well as Enter, chevron only when asked, `active:press-scale`, className, axe on a danger row and `Narrow`. |
| 18 PriceSummary    |   4 |    2 |       4 |     0 | ADD Indian grouping, a total with no lines + a note only when given, className and the `WithStrongLine`/`Receipt`/`TotalOnly`/`Narrow` stories. The Space Mono figures are ALREADY covered by `tabular-nums` (DS sets body-sm). |
| 19 StepTracker     |   5 |    3 |       3 |     0 | ADD a sr-only state text per step ("Done" / "In progress" / "Not started yet"), also added to the plan's accessible-defaults table. ADD `current={-1}`, the `aria-label` name, className and the `NotStarted`/`VerticalSurfaces`/`Narrow` stories. DROP `tone`, string steps and the default label. |

The plan's "Expected: PASS (N tests)" lines were updated for the new tests. The original counts treated
`it.each` inconsistently, so read them as approximate.

## Proposed contract deltas

All five are additive and optional. They leave the §5 defaults unchanged.

1. **SearchField:** add `clearLabel?: string | undefined` (default `"Clear search"`) to `SearchFieldProps`.
   Dev had it. Plan deviation 15 fixes the string until a second locale arrives.
2. **QuantityStepper:** add `decrementLabel?: string | undefined` and `incrementLabel?: string | undefined` to
   `QuantityStepperProps`. The defaults stay `"Remove one"` / `"Add one"`, or `"Remove N"` / `"Add N"` for
   `step` N. Dev used them to name the dish: "Add one Paneer Tikka".
3. **Tabs:** add `isDisabled?: boolean | undefined` to `TabItem`. It maps to Radix `Trigger disabled`: the
   tab stays visible, inert, and out of the arrow order.
4. **Tabs:** add `isFullWidth?: boolean | undefined` to `TabsProps`. It gives equal-share triggers
   (`flex-1`, list `gap-0`) for two or three sections in a card. `className` cannot reach the triggers
   without an arbitrary variant.
5. **Accordion:** add `isDisabled?: boolean | undefined` to `AccordionItem`. A native `<details>` cannot be
   disabled, so it would render a non-interactive row (question plus muted state, no `<details>`). The
   controller may prefer DROP.

## Cross-plan notes

- **Plan 2b, `FieldMessage` politeness.** Error messages are now `role="alert"`. RadioGroup and
  ChoiceCardGroup in Plan 2b render their own `message`. They should match, or reuse `lib/field-message.tsx`.
- **Plan 2b, `group/field`.** `FieldControl` names its group `group/field`. The Field molecule uses
  `group/form-field`, so the two never cross-match. Keep that name if 2b refactors.
- **Plan 2b, what SearchField and OtpInput rely on.** SearchField's new assertions depend on `FieldControl`:
  `h-field-sm`/`h-field-md`, `border-2 border-status-*`, the trailing status glyph,
  `motion-safe:animate-mark-pulse`, and the `has-disabled:` fill. The OtpInput assertions depend on
  `fieldControlVariants({ status })` painting `border-status-danger`.
- **Plan 2a, hit-area helper.** The 24px-glyph / 40px-hit pattern (`relative before:absolute
  before:-inset-2`) now appears three times: SearchField clear, Alert dismiss, Snackbar dismiss. It could
  become a Plan 2a utility (`hit-extend`) if IconButton or others need it.
- **Plan 4 (OrderTracker, CartPanel) and the app kit.** StepTracker has no default name, so an organism
  should pass `aria-label` ("Order progress"). QuantityStepper stays 32/40px (DS). Dev's 44px was dropped,
  so cart rows are relevant to the hit-target concern below.
- **Dev's `loading`/`disabled`/`readOnly` field statuses** are dropped everywhere. They map to control props
  (contracts §1 is owned by Plan 2b).

## Concerns

1. **Hit targets.** QuantityStepper (DS 32/40px) and Pagination (DS 40px) are DROPped to the DS sizes. The
   ruling cites D2 and §5.5's ≥24px floor, but §5.5 literally exempts only 36/38px controls. Dev had
   36/44 and 44. Controller: confirm, or ADD the dev sizes.
2. **Pagination single page.** Dev renders it so the layout does not jump; the plan renders nothing. The DROP
   rests on plan deviation 13, not a spec clause.
3. **Tabs overflow.** Dev and the DS row do not wrap (dev scrolls); the plan wraps. I ruled ALREADY because a
   scroll container would clip the underline's 1px overlap of the hairline. It is a visual call for the
   owner or controller.
4. **Accordion `headingLevel`.** The DROP rests on platform behaviour: `<summary>`'s children are
   presentational, so a heading inside it loses its role. It is not an explicit spec clause.
5. **Toast/Snackbar politeness.** Confirmations are now `type="background"` (polite), matching dev. Radix's
   docs suggest `foreground` for toasts from user actions.
6. **Unverified class names.** The new variant classes (`group-has-disabled/form-field:`,
   `group-disabled/slot-picker:`, `before:-inset-2`, `max-w-120`) compile under tailwindcss 4.3.3. I checked
   this with its `compile()` API. `eslint-plugin-tailwindcss` acceptance was not run: nothing was
   executed beyond reading, per the brief.
