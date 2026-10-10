# Plan 3a, Task 0: fold list (BINDING OVERLAY, ruling R43)

The plan file is not patched. Each item below overrides the task brief it names. An implementer
applies it on top of the brief and does not reinterpret it. Base: `a984709` (Plans 1, 2a, 2b, 2c
built; Plan 5 foundations live). Every check below was run against the tree, not the plan text.
Task 0 made one code change: `28a5d45 fix(ui): choice controls keep isInvalid over a caller's
aria-invalid` (item 3).

## Checks run (Task 0 Steps 1 to 7)

| Step | Result |
| ---- | ------ |
| 1. Baseline | Green at `a984709`: design-tokens build + 249 tests; ui typecheck, lint, 800 tests (48 files); Storybook build OK. The 1, 2a, 2b and 2c commits are in the log. |
| 2. Internals | `componentVariants` (+ module consts `TEXT`, `SPACING` at component-variants.ts:16/94), `HeadingLevel`/`headingTag`, `LinkAs`/`LinkAsProps` (**`"aria-current"?: "page" \| "step" \| "true" \| undefined`**, so Task 13 passes `aria-current` directly — no conditional spread), `FieldStatus`/`FIELD_STATUS_ICON` (error CircleAlert, success CircleCheck, warning TriangleAlert), `FieldControl` (brief's props plus `control`, `suffix`, `affordance`, `isMultiline`; sets `data-surface="light"`, draws the glyph and the pulsing `SymbolMark`), `fieldControlVariants` (slots `root icon control glyph spinner suffix`), `joinIds`, `OnSurfaces({ grounds?, children })`, `SymbolMark` (masked span, R19), `@utility mask-symbol` + `--pp-symbol-mask` in `lib/brand-artwork.css`, `transition-control`, `duration-fast/base`, `press-scale`, `z-toast` utilities, `--animate-toast-pop`/`--animate-sheet-in`, `fakeRegister` (vitest.setup.ts:34), `expectNoA11yViolations`. All as the briefs use them. |
| 3. Atoms | Icon: `size` xs–xl, wraps the `<svg>` in a `<span class="size-icon-*">`, unlabelled = `aria-hidden`; lucide 1.30 classes verified by rendering (`lucide-check`, `lucide-info`, `lucide-triangle-alert`, `lucide-circle-alert`, `lucide-megaphone`, `lucide-heart`, `lucide-chevron-right/left/down`, `lucide-building-2` + `lucide-building2`, `lucide-soup`, `lucide-utensils`, `lucide-search`). PriceTag `tone="ink"` default paints `text-text-heading`. Input spreads `{...state} {...input}`: a caller's `aria-invalid` survives on `default` — **no Input change** (Step 3's fix is not needed). Select `options/placeholder/status/defaultValue`; Switch `label/isLabelHidden` + native `defaultChecked`; Badge `tone="soft"`; Button `variant` ghost/primary/secondary, `size="sm"`, `icon`, `iconAfter`. |
| 4. Tokens | All 67 names present. Alias paths exist as written: `{color.pink.700}`, `{color.ink.000}`, `{color.ink.200}`, `{color.ink.400}`, `{color.white-alpha.25}`, `{color.white-alpha.50}`, `{color.mint-strong}`, `{font-weight.bold}`, `{font-weight.black}`. Each surface file prints `surface-<name>` → `["color", "shadow"]`; add component skins inside `color`. Surface shadows overridden: `focus-ring` (brand, ink, light), `button-primary` (brand, light) — `shadow-3` (Toast, Snackbar) is not, so **no new `@utility shadow-*`**. `contrast-pairs.json` supports `pairs`, `foregrounds`+`backgrounds`, `surface`, `exception: "brand-fill"` exactly as Tasks 6–18 write them. Alert's four status tones are covered by the existing `status-on-soft` group. `grid-cols-*` reads `--grid-template-columns-*` in tailwindcss 4.3.3 (Tasks 2, 6) and that namespace is not cleared by `sd.config.mjs`. |
| 5. Lint escape | `requiresQuotes` modifier present (naming-convention.js:61). |
| 6. Stories | `storybook/test` resolves; earlier stories import it and use `play: ({ canvas, userEvent })`. **The 360px viewport id is `floor360`, set through `globals`, not `mobile1`/`parameters.viewport`** (item 12). Story-test target: `pnpm nx test @pink-paprikaa-web/storybook`. |
| 7. Dev parity | 19 `**Dev parity` tables (Task 1 + Tasks 2–19), each with a `**Dev reference:**` line. DELTA rows: ruled by **R39** (foundation ledger) and now in contracts §5 — items 9–11. |
| Radix | Installed `radix-ui` 1.6.7 → `@radix-ui/react-toast` 1.2.23, `react-tabs` 1.1.21, `react-slot` 1.3.3, as the briefs say. Toast: announcer `role="status"` + `aria-live` assertive for `foreground` (the default) and polite for `background`; `hotkey={[]}` is guarded (`hotkey.length !== 0`), so Snackbar's viewport takes no hotkey; the region label is `label.replace("{hotkey}", …)`, so `"Messages"` stays `Messages`. Tabs `Content` spreads its props after `hidden` and renders children when `forceMount`. `Slot.Slottable` has the `{ child, children(fn) }` form. |
| R13 / R15 / R19 | Every optional prop in Tasks 1–19 already reads `?: T \| undefined` or `?: ReactNode`; no brief reads a file; every `svg` selector targets a lucide glyph, and every brand-mark assertion uses `.mask-symbol` / `animate-mark-pulse`. Nothing to fold. |

## Overlay items

1. **Commit subjects must start lower-case. Affects Tasks 2–19.** commitlint rejects
   `feat(ui): EmptyState molecule` (tested). Use `feat(ui): add the <Name> molecule` plus the brief's
   tail, e.g. `feat(ui): add the Field molecule wired by render prop`, `feat(ui): add the Toast and
   ToastProvider molecules on Radix Toast`. Bodies unchanged. Trailer: the model actually running.

2. **Barrel placement. Affects Tasks 2–19.** The barrel is sorted by path: atoms → layouts → lib →
   **molecules**. The molecule exports form one block **after `./lib/space` (the last line today),
   sorted by path**. Insert each task's line at its sorted place, never simply at the end (Task 4's
   `quantity-stepper` goes before Task 3's `search-field`). `index.spec.ts` activates the
   `molecules` tier once `src/molecules/` exists: each folder needs its barrel line, a PascalCase
   export and the `tsx`/`test.tsx`/`stories.tsx` trio. `alert-dismiss.tsx` and `lib/notification.ts`
   are extra files, allowed; neither is exported.

3. **Caller `aria-invalid` vs `isInvalid` (carried from 2b). DONE in Task 0 (`28a5d45`).**
   `ChoiceControl` now destructures `aria-invalid` and renders `aria-invalid={isInvalid ? true :
   ariaInvalid}`, so `isInvalid` beats a caller's `aria-invalid={false}` and Field's `true` still
   lands. Covers Checkbox, Radio and Switch. Test in `checkbox.test.tsx`. Input and Select need no
   change: Field only ever hands them `aria-invalid: true`, never `false`.

4. **Field keeps "a status needs its message" for Input, Select and Checkbox (carried from 2b).
   Affects Task 2.** The three atoms paint a status by colour and glyph only; Field is where the
   words come from. Add to `field.test.tsx` one table test:
   ```tsx
   it.each([
     ["Input", (c: FieldControlProps) => <Input {...c} status="error" />, "textbox"],
     ["Select", (c: FieldControlProps) => <Select {...c} status="error" options={HEAT} placeholder="Pick one" defaultValue="" />, "combobox"],
     ["Checkbox", (c: FieldControlProps) => <Checkbox {...c} label="I agree to the terms" isInvalid />, "checkbox"],
   ] as const)("gives an invalid %s its words: marked invalid and described by the message", (_n, control, role) => {
     render(<Field label="Terms" status="error" message="Tick to continue.">{control}</Field>);
     const el = screen.getByRole(role);
     expect(el).toHaveAttribute("aria-invalid", "true");
     expect(el).toHaveAccessibleDescription("Tick to continue.");
     expect(screen.getByRole("alert")).toHaveTextContent("Tick to continue.");
   });
   ```
   (`HEAT` = two options; `Checkbox` from `../../atoms/checkbox/checkbox`.) In `field.tsx`, the
   `status` JSDoc becomes: "Pass the same status to the control for its border or box. A status
   always comes with `message`: the control shows only a colour and a glyph, Field shows the words."
   Append to the stories' component description: "A lone Checkbox (consent) takes its error message
   from Field: Field's label asks the question, the Checkbox's label answers it."

5. **Field's disabled-label selector must name the control. Affects Task 2** (the b2565db bug class,
   parity-found in 2b). `group-has-disabled/form-field:` also matches a Select's disabled placeholder
   `<option>`, any `isDisabled` option and a disabled trailing button, so it would mute the label of
   every Select with a placeholder. Use
   `group-has-[:is(input,textarea,select):disabled]/form-field:text-text-subtle` on the label slot
   (descendant, not `>`: the control sits inside the field box), and change the test's class
   assertion to match. Add a `play` to the `WithError` story (a Select with a placeholder):
   the label's computed `color` equals the `Required` story's label colour, i.e. not muted.
   Known edge, accepted: a read-only Select is a natively disabled `<select>` (R52), so its label
   mutes too, as under the brief's selector.

6. **Controls inside the field box are its direct child (carried from 2b). Affects Tasks 3, 5.**
   - Task 3 (SearchField): the brief's render prop returns the bare `<input>`, a direct child of
     `FieldControl` — keep it so; never wrap the input. The clear button is rendered only when the
     box is enabled, so a disabled trailing button never meets the box's selector.
   - Task 5 (OtpInput): the cells are field-box skins with no control inside, so the box's
     `has-[>:is(input,textarea,select):disabled]` never fires; `isDisabled` must reproduce the whole
     disabled paint. `isDisabled: { true: { cell: "cursor-not-allowed border-border-subtle bg-ink-100
     text-ink-400" } }`, and the brand compound applies only when enabled:
     `{ status: "default", isDisabled: false, state: ["filled", "active"], class: { cell:
     "border-border-brand" } }`. Add to the disabled test: every cell has `border-border-subtle` and
     none has `border-border-brand` (`defaultValue="48"` fills two).

7. **`@custom-variant field-disabled` (carried from 2b): not applied in 3a.** No 3a task writes the
   selector: SearchField reaches the box through `FieldControl`, OtpInput through
   `fieldControlVariants` + item 6. The refactor would touch `lib/field-control.tsx` (11 uses) and
   the Input/Select tests (16 class assertions) for readability only. It stays a standalone
   ride-along for the controller; recipe if taken: `@custom-variant field-disabled
   (&:has(> :is(input, textarea, select):disabled));` plus a group form for the `/field` uses.

8. **Story export named `OnSurfaces` collides with the imported `OnSurfaces`. Affects Tasks 7, 12.**
   `export const OnSurfaces: Story` redeclares the import (TS2440). Follow the 2b precedent:
   `export const OnSurfacesStory: Story = { name: "OnSurfaces", … }`. Task 20's story ids
   (`on-surfaces`) are unchanged by `name`.

9. **R39: SearchField `clearLabel`. Affects Task 3.** Contracts §5 now has
   `clearLabel?: string` (default `"Clear search"`). Add `clearLabel?: string | undefined` to
   `SearchFieldProps`, default `"Clear search"`, used as the button's `aria-label`; test "names the
   clear button by clearLabel" (`clearLabel="Clear dish search"`). Dev parity row: DELTA → ADD (R39).

10. **R39: QuantityStepper `decrementLabel` / `incrementLabel`. Affects Task 4.** Add both
    `?: string | undefined`; defaults stay the brief's `Remove one`/`Add one` (step 1) and
    `Remove N`/`Add N`. Test: `decrementLabel="Remove one Paneer Tikka"` /
    `incrementLabel="Add one Paneer Tikka"` name the buttons. The `InACartRow` story passes them.
    Dev parity row: DELTA → ADD (R39).

11. **R39: Tabs `TabItem.isDisabled` and `TabsProps.isFullWidth`; Accordion `isDisabled` DROP.
    Affects Tasks 11, 16.**
    - Task 11: `TabItem.isDisabled?: boolean | undefined` → `<RadixTabs.Trigger disabled={item.isDisabled === true}>`;
      trigger gains `disabled:cursor-not-allowed disabled:text-ink-400`, and every `hover:` on the
      trigger becomes `not-disabled:hover:`. `isFullWidth?: boolean | undefined` → variant
      `isFullWidth: { true: { list: "flex-nowrap justify-self-stretch", trigger: "min-w-0 flex-1 shrink" } }`
      plus compound `{ variant: "underline", isFullWidth: true, class: { list: "gap-x-0" } }`.
      Tests: a disabled tab is `toBeDisabled()` and ArrowRight skips it; `isFullWidth` puts `flex-1`
      on every trigger. Stories: `WithDisabledTab`, `FullWidth` (segmented, two items). Dev parity
      rows: both DELTA → ADD (R39).
    - Task 16: the per-item `isDisabled` row is DROP (R39: native `<details>` cannot be disabled).

12. **Viewport id. Affects Task 12.** The `Long` story uses
    `globals: { viewport: { value: "floor360", isRotated: false } }` (2c precedent), not
    `parameters: { viewport: { defaultViewport: "mobile1" } }`.

13. **Pagination arrow names must be text. Affects Task 13.** The brief's `pageNames()` reads
    `textContent`, but `<Icon label="Previous page">` puts the name in `aria-label` (textContent
    `""`), so "shows the first, the last…" fails. Render each arrow as
    `<Icon icon={ChevronLeft} size="sm" /><span className="sr-only">Previous page</span>` (same for
    Next), matching the pages' `sr-only` "Page " text. Names and test stay as written.

14. **R61/R63 sizing markers. Affects Tasks 4, 9, 10, 14, 16, 19; none for the rest.**
    `apps/storybook/src/docs-kit/catalogue.spec.ts` reads `packages/ui/src` live: a `spacing-*` token
    the library uses only as `size|w|h|min-w|min-h|max-w|max-h` needs
    `"$extensions": { "pink-paprikaa": { "utility": [ … ] } }` equal to exactly those uses, or
    `storybook:test` fails. An unmarked `ch` measure used as `max-w` fails too (precedent:
    `text-measure-narrow` carries `["max-w"]`).
    - Task 4 `quantity-stepper-count`: `["min-w"]`.
    - Task 9 `snackbar`: `["max-w"]` (`text-snackbar` is the TEXT token, not a spacing use).
    - Task 10 `empty-state-symbol-lg`: `["size"]`.
    - Task 14 `section-header-measure`, `section-header-measure-centered`: `["max-w"]` each.
    - Task 16 `accordion-answer-measure`: `["max-w"]`.
    - Task 19 `step-tracker-marker`, `step-tracker-mark`: `["size"]` each.
    - Existing marked tokens stay consistent: 3a uses `min-h-hit` (hit = `["min-h"]`),
      `bottom-dock-clearance` (`["bottom"]`), `max-w-text-measure-narrow` (`["max-w"]`) and the field
      heights as `h-` only. Run `pnpm nx test @pink-paprikaa-web/storybook` in each of these tasks'
      gates (cold cache: re-run once on "Failed to fetch dynamically imported module").

15. **Accordion marker in Safari. Affects Task 16 (minor).** `list-none` hides the summary marker in
    Chromium and Firefox; WebKit draws `::-webkit-details-marker`. Add inside
    `@utility details-content-motion`: `& > summary::-webkit-details-marker { display: none; }` and
    drop `marker:hidden` from the summary slot (it targets `::marker`, which `list-none` already
    removes).

16. **Stale expected difference. Affects Task 20.** "SearchField … text is 15px `text-control`" is
    wrong since R21: field value text is 16px `text-body` (FieldControl). Delete that clause; also add
    to the expected list the R39 extras (SearchField `clearLabel`, QuantityStepper labels, Tabs
    `isDisabled`/`isFullWidth`) if a card lacks them.

17. **Molecules never import layouts. Affects every task.** The dispatch wording ("molecules may
    import atoms, layouts and lib") is wrong for this tree: `tools/eslint-config/atomic-layering.js`
    orders the tiers atoms → molecules → organisms → layouts, so a molecule importing
    `../../layouts/*` is a lint error, and the plan's tier rule agrees. Stories lay out with plain
    token classes (as the briefs do), never `Stack`/`Cluster`.

## Hand-offs (no 3a task body changes)

- **Plan 5 Motion `FormStates` specimen** (deferred, needs Field) rides in batch B after Task 2.
- **Plan 5 StepTracker row** rides in batch G after Task 19.
- **2c final fix wave** (R74) rides in batch B before Task 2; it may touch `component-variants.ts`
  or `styles.css`, which Tasks 3–19 also append to — rebase the appends, never reorder them.
- **`grid-template-columns-*` tokens** (Tasks 2, 6) have no `UTILITY_RULES` entry in
  `apps/storybook/src/docs-kit/catalogue.ts`, so the docs show no class chip for them. No test
  requires one and no foundations page lists them; left as is.

## Pre-flight table

### Pairs of tasks sharing a file or an interface

| Tasks | Producer → consumer | Finding | Verdict |
| ----- | ------------------- | ------- | ------- |
| 1 → 2, 3, 5, 6 | `FieldMessage`, `hasFieldMessage` | Field and SearchField pass `hint`; OtpInput and SlotPicker pass only `message` (hint-on-default through `message`). `hasFieldMessage` ignores `status`, so every consumer references the id exactly when a line renders. | OK |
| 1 → 3, 4, 5, 8, 9, 11 | `useControllableState` | Every consumer passes `defaultValue` non-undefined (`?? ""`, `?? min`, `?? true`, `?? items[0]?.value ?? ""`). Toast/Snackbar hand `setIsOpen` to Radix `onOpenChange`: a Radix close of an uncontrolled toast sets state, so Presence unmounts it. | OK |
| 1 → 3 | `assignRef` | One consumer (SearchField merges its own ref with the caller's). QuantityStepper and OtpInput pass `ref` straight through. | OK |
| 8 → 9 | `lib/notification.ts` | Snackbar imports `NotificationProps`, `NOTIFICATION_ICON`, `NOTIFICATION_SURFACE`; lib may import the Icon atom's type. Batch D keeps T8 before T9. | OK |
| 3 → 16 | `styles.css` | T3 appends `search-reset` after `z-toast`; T16 appends `details-content-motion` after `search-reset`. | OK (order holds) |
| 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 19 | `component-variants.ts` `TEXT` / `SPACING` | No new name collides with an existing token or another task's. `snackbar` in both `SPACING` and `TEXT` and `toast` in `TEXT` beside `Z`'s `toast` are separate twMerge groups. `component-variants.spec.ts` fails a task that forgets its names. Colour tokens need no list (twMerge reads unknown `text-*` as a colour). | OK |
| 6, 7, 8, 9, 11, 18 | `contrast-pairs.json` | New group ids `slot-picker`, `alert`, `toast`, `snackbar`, `tabs`, `price-summary`, `price-summary-ink`, `price-summary-brand` are unique; the schema matches. | OK |
| 12, 18, 19 | `surface/{brand,ink,light}.json` | Each adds keys inside the existing `color` group; light restores each (theme.spec light-restore). All aliases are primitives (surface-aliases spec). | OK |
| 4, 9, 10, 14, 16, 19 ↔ storybook `catalogue.spec` | spacing markers | Item 14, or `storybook:test` goes red. | OK (after item 14) |
| 2–19 | `index.ts` | Molecule block after lib, sorted by path (item 2). | OK (after item 2) |
| 3, 5 → Plan 2b | `FieldControl` / `fieldControlVariants` | SearchField: `className="rounded-pill px-4"` beats the box's `rounded-md px-3.5` (`pill` is in `RADIUS`). OtpInput: `text-otp-digit` beats `text-body`, `w-12` beats `w-full` through twMerge once `otp-digit` is in `TEXT`. Disabled paint: item 6. | OK (after item 6) |
| 2 → Plan 2b atoms | `FieldControlProps` spread | Input and Select keep their own `aria-invalid` (spread order), ChoiceControl after item 3. Label mute selector: item 5. | OK (after items 3, 5) |
| 7, 12 | `OnSurfaces` import | Story name collision, item 8. | OK (after item 8) |
| 13 → Plan 2a | `LinkAsProps["aria-current"]` | Accepts `undefined` (R13). | OK |
| 17 → radix `Slot` | `Slot.Root` + `Slot.Slottable child` | Same pattern as Button, Link, IconButton, PatternField. | OK |
