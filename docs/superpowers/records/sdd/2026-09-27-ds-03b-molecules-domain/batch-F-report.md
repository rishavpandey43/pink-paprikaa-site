# Batch F report: carried fixes F 1–5, then Plan 3b Tasks 12–14 (+ Plan 5 Company details hand-off)

The base was `a164d7d` and the head is `e19b2b3`. The tree is clean. I ran no `git checkout` of any kind and did not touch the stash. Mutation checks were undone by copying the file back from a scratch copy (untracked new files) or by an inverse `sed`/Python edit, with the restored line grepped before moving on.

| SHA | Subject |
| --- | --- |
| `a45f1b6` | fix(ui): keep the offer seal's tips and note legible |
| `d8febc5` | fix(ui): pin the filter bar's note and trailing slot while it scrolls |
| `0d72861` | fix(ui): show the logo lockup's badge tone |
| `00497d8` | feat(ui): add the ChipGroup molecule |
| `0a38405` | feat(ui): add the KeyValueList molecule |
| `d32546e` | feat(storybook): render the company details with KeyValueList |
| `f2198b0` | feat(ui): add the Steps molecule |
| `e19b2b3` | docs: re-sort the 3b plan's steps-title classes |

## Carried fixes (carried-fixes-F.md)

### Items 1 and 2: OfferSeal (`a45f1b6`)

These two share one commit because they touch the same three files (batch E precedent).

**Item 1, rotated-tip overhang.**
- **Geometry.** The side is s and the corners are 0.14s. A 45° rounded square paints its tip at 0.707s − 0.14s·(√2 − 1) = 0.649s from the centre. That is **0.149s** past its layout box on every edge, because `rotate-45` does not affect layout.
- **Token.** New `spacing.offer-seal-clear` = `1.5em` (0.15 × side, in em of the seal's own font size). It is registered in `SPACING`. It is used as `m-` only, so it needs no R61 marker, and catalogue.spec is green.
- **Where it applies.** Only `bleed: none` gets the margin (`m-offer-seal-clear`). A bleeding seal is `absolute` and overhangs on purpose.
- **JSDoc.** `size` now says that in flow the seal reserves 0.15 × side, so a 360px page should use `sm` or `md`.
- **Default size unchanged.** It stays `lg`, per contract §6 / deviation 7. I did not cap it: lg and xl are the 1080-canvas sizes.
- **New story `Floor360`.** It shows the `md` brand seal at the floor360 viewport inside a `flex` frame. The play checks that the painted tips stay inside the frame and that the page does not scroll sideways.
  - `getBoundingClientRect` returns the rotated square's sharp-cornered box (220.6px for md). So the play insets that box by the rounded corner, r·(√2 − 1), read from the computed `border-radius`. My first draft compared the raw box and was red even with the fix: −8.9 against 0.
- **Mutation check.** Without the margin, `Floor360` is red: "expected −23.26 to be ≥ 0". With it, green.
- **New unit test:** "reserves room for its rotated tips in flow, but not when it bleeds".

**Item 2, note hidden at `sm`.**
- The note renders only when `size !== "sm"`, which prevents ~7px text. The JSDoc on `note` says so.
- **New test:** "drops the note at sm…".
- **Story change.** `Values` now renders at `md`, because the meta default is `sm` and its third seal carries the note.

**TDD.** Both new tests were red before the fix and green after.

### Item 3: FilterBar trailing slot pinned (`d8febc5`)

- **Change.** In scroll mode, `overflow-x-auto pb-1` moved from the root onto the group, together with `min-w-0` so the group can shrink. The root keeps `flex-nowrap`. Now the note badge and the trailing slot, both `shrink-0`, stay at the end while the filters scroll.
- **Unit test.** "scrolls on one line…" now asserts that the radiogroup has `overflow-x-auto flex-nowrap` and that the root does not. It was red before the change and green after.
- **New story `ScrollPinned`** (floor360, note + Search trailing button, six filters). The play checks three things:
  - The group scrolls (`scrollWidth > clientWidth`).
  - The badge's and the button's right edges sit inside the bar.
  - The page does not scroll sideways.
- **Mutation check.** Putting the scroll back on the root makes the play red ("expected 555 to be greater than 555", so the group no longer scrolls).

### Item 4: the `size-100` story deviation (report only)

- **What changed.** The plan and the Task 8 brief write the `BleedOffCorner` boards as `h-100 w-100`. The committed story has `size-100` (400px on the 4px spacing scale, not a component token).
- **Cause.** `eslint-plugin-tailwindcss`'s recommended `enforces-shorthand` rewrote it during `lint --fix` in batch D.
- **Effect.** It behaves the same. `format:check` does not flag it, so the plan doc was left alone (R43: the plan is not patched except for Prettier re-sorts).

### Item 5: LogoLockup badge tone (`0d72861`)

- **What the design system shows.** The DS card (`LogoLockup.card.html`) and its prompt show only `pink` and `white`. Its `.d.ts` still allows `"pink" | "white" | "badge"`, and so does contract §6.
- **Choice.** I kept the union and added a **`Badge` story** (`tone: "badge"`, the lockup on Logo's own pink plate), whose JSDoc records this. Restricting the union would break the contract.
- **Checks.** The story's axe run passes (storybook a11y `test: "error"`). `storybook test -- logo-lockup` 8/8.

## Task 12: ChipGroup (`00497d8`)

**Built:**
- `molecules/chip-group/chip-group.{tsx,test.tsx,stories.tsx}`.
- Barrel block between `check-card` and `choice-card-group`.
- No tokens. `"use client"` is at the top, as the global constraints list it.

TDD: "Failed to resolve import ./chip-group", then 15/15.

**Fold items applied:**
- 1: lower-case subject.
- 2: sorted barrel.
- 4: `export const OnSurfacesStory: Story = { name: "OnSurfaces", … }`.

**Deviations:**
1. **R101 / R102 (dispatch: it is a form control).** Added `status`, `message` and `aria-describedby` to the base props.
   - **Message.** `message` renders through the shared `lib/field-message` `FieldMessage` under the chips. An error is `role="alert"`.
   - **Error state.** An error with a message sets `aria-invalid` on the ToggleGroup root, and every chip gets `in-aria-invalid:border-status-danger`, as ChoiceCardGroup does. A status without a message is ignored, so colour alone cannot mark the group.
   - **Description order.** The group's `aria-describedby` is `joinIds(limit line, message, caller's)`, so a caller's description joins the limit line and never replaces it (R102).
   - **Tests.** Three new ones: "says what is wrong in words…", "never marks the group invalid by colour alone…", "keeps its limit line alongside a message and a caller's description". The first and third were red against the brief's implementation.
   - **Story.** New `WithError` story with a play.
   - **Scope.** I added no `id` or `required`. Field's `<label htmlFor>` cannot label a group, so ChipGroup names itself with `label` and is not a Field child.
2. **The brief's Review Focus 1 test could not fail.** It pressed Space and then Enter on the blocked chip, and checked `aria-pressed` only after both. With the `maxSelected` guard removed, Space selects the chip and Enter deselects it, so the test stayed green. I verified this with a debug log of `onValueChange`.
   - **Fix.** The test now asserts `aria-pressed="false"` after each key and `onValueChange` called exactly twice.
   - **Mutation check.** Without the guard, the jsdom test and the `StarterPicks` play are both red. With it, both are green.
3. **Stories use plain `StoryObj`, not `StoryObj<typeof meta>`.**
   - **Why.** ChipGroupProps is the contract's `single | multiple` union. Storybook intersects the union with the meta args and collapses every story to `never`: 14 TS errors, the same limit batch E hit. `StoryObj<ChipGroupProps>` does not work either: play and render lose their contextual types.
   - **Consequences.** `meta` still `satisfies Meta<typeof ChipGroup>`. `OnInk` and `OnSurfacesStory` pass explicit props instead of spreading untyped args. `getLimitMessage` gets explicit `number` params. The component keeps the union.
4. **`StarterPicks` gets `defaultValue: []`.** The meta's single-choice `defaultValue: "lunch"` leaked into the multiple story. The string's length, 5, is at least 3, so every chip started blocked and the play's first click hit `pointer-events: none`. The brief's typed stories would have hidden this.

**Dev parity:** there is no dev reference (a handoff component). Every handoff usage has a story: `WhichMeals`, `MakeItYours`, `StandingAddOns`, `StarterPicks`, `Segmented`, `OnInk`, plus `WithError` and `OnSurfaces`.

**Gate:** tokens 281 · ui 82 files / 1270 · Storybook build OK · storybook:test 75 files / 729 · `storybook test -- chip-group` 9/9 (StarterPicks play) · format:check 0.

## Task 13: KeyValueList (`0a38405`) and Plan 5 Company details (`d32546e`)

**Built:** `molecules/key-value-list/*`, verbatim from the brief. The barrel block sits between `filter-bar` and `list-row`. No tokens. TDD: "Failed to resolve import ./key-value-list", then 10/10.

**Fold items applied:** 1, 2 and 4 (`OnSurfacesStory`). **Deviations:** none.

**Dev parity:** there is no dev reference (a handoff component). Stories as briefed: `YourBox`, `BookingRules`, `Customisations`, `UpgradePrices`, `QuoteLines`, `OnSurfaces`.

**Gate:** tokens 281 · ui 83 files / 1280 · Storybook build OK · storybook:test 76 / 736 · format:check 0.

**Plan 5 hand-off (`feat(storybook)`).** In `apps/storybook/src/foundations/brand/company-details.tsx`:
- The native `<dl>` `FactList` and its stand-in comments are gone, along with the local `FactItem`. `FactBox.items` is now `KeyValueItem[]`.
- The fact boxes use `<KeyValueList density="compact" keyWidth="sm">` and the derived lines use `keyWidth="md"`, exactly as the Plan 5 Task 3 brief wrote them.
- `className="wrap-break-word"` on both lists keeps FactList's guard against a long email or URL widening a card (`overflow-wrap` inherits into the `dd`s).
- **Visual difference.** Keys are no longer set in mono. KeyValueList has no mono option, and the Plan 5 brief shows plain keys.
- **Checks.** Storybook typecheck and lint are green. `storybook test -- brand` 12/12, including the `CompanyFacts` play.

**Concern: the remap the dispatch named does not apply here.** The dispatch said "remap keyWidth article→md and narrow→lg". But KeyValueList's `keyWidth` is `sm | md` (there is no `lg`), and FactList had no width prop. The Plan 5 records (batch-P5-C report, carried-fixes-P5-C) attach that remap to `doc-table.tsx` → **Table's `minWidth`**, which is the Task 20 hand-off. I followed the Plan 5 brief's `sm` / `md`. The remap should be carried to Task 20.

## Task 14: Steps (`f2198b0`, re-sort `e19b2b3`)

**Built:**
- `tokens/component/steps.json` (`text.steps-title` 17px / 1.3 / bold).
- `steps-title` in `TEXT`.
- `molecules/steps/*`.
- Barrel line after `step-tracker`, before `tabs`.

TDD: "Failed to resolve import ./steps", then 8/8.

**Fold items applied:**
- 1: lower-case subject.
- 2: sorted barrel.
- 3 (R83): `createElement(headingTag(headingLevel), { className: styles.title() }, item.title)` with the section-header comment.
- 4: `OnSurfacesStory`.
- 9: Prettier moved `text-steps-title` after `font-display`. The one-line plan-doc re-sort is its own `docs:` commit (`e19b2b3`).

**Deviations:**
1. **`isShown(item.description)` instead of truthiness** (CheckCard precedent). Behaviour is the same for strings, and an empty string or `false` renders no empty `<p>`.
2. **Shared `renderOnInk(args: StepsProps)` function.** The brief's `render: HowItWorks.render` fails `tsc` under `exactOptionalPropertyTypes` (TS2375: `render` may be `undefined`). Both circle stories use the shared function instead.

**Dev parity:** there is no dev reference (a handoff component). Stories as briefed: `HowItWorks`, `HowToBook`, `StartingTakesOneMessage`, `OnSurfaces`.

**Gate:** tokens 281 · ui 84 files / 1288 · Storybook build OK · storybook:test 77 / 741 · format:check 0 (after `e19b2b3`).

## Final gate (at `e19b2b3`)

```
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache                → ok
pnpm nx run-many -t typecheck lint test -p ui design-tokens --skip-nx-cache   → tokens 4 files / 281 · ui 84 files / 1288 · Successfully ran
pnpm nx run @pink-paprikaa-web/storybook:build                                → Successfully ran
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache (R77)           → 77 files / 741 passed (no cold-cache flake)
pnpm nx format:check                                                          → exit 0
pnpm nx sync:check                                                            → All files are up to date
pnpm run guard:founder                                                        → clean
```

**Test counts:**
- ui: 1253 → 1255 (+2 OfferSeal) → 1270 (+15 T12) → 1280 (+10 T13) → 1288 (+8 T14).
- storybook: 716 → 718 (+1 `Floor360`, +1 catalogue case for `spacing-offer-seal-clear`) → 729 (+1 `ScrollPinned`, +1 LogoLockup `Badge`, +9 T12) → 736 (+7 T13) → 741 (+5 T14).
- tokens: 281 throughout.

## Concerns

1. **Keywidth remap.** The dispatch's "article→md, narrow→lg" remap belongs to the Task 20 doc-table → Table hand-off, not to KeyValueList. I followed Plan 5's `sm` / `md`. Carry the remap to Task 20.
2. **Two brief defects in ChipGroup** that would have shipped silently:
   - The Review Focus 1 test's Space and Enter presses cancelled each other out.
   - The meta's `defaultValue` leaked into `StarterPicks`.

   Both are fixed and covered by mutation checks.
3. **ChipGroup stories are loosely typed** (plain `StoryObj`), because Storybook cannot type a union of props. This is the same root cause as R101's runtime guard.
4. **Company details keys lost their mono face** in the swap to KeyValueList. The deferred "CompanyDetails xl check" (carried-fixes-P5-D) is still open.
