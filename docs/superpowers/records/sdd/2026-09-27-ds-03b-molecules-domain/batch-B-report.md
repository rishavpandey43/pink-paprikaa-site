# Batch B report — Plan 3a final-review fix wave (R93) + Plan 3b Task 2 MenuItemCard

Base `198ef93`. Head `af3da55`. Tree clean at the end. Commits, in order:

| SHA | Subject | Items |
| --- | --- | --- |
| `4bb3050` | fix(ui): stop the accordion height transition under reduced motion | 3a item 1 |
| `9ee1e3a` | fix(ui): keep brand-pink marks visible on the brand surface | 3a item 2 (R89) |
| `5ddf262` | fix(ui): give the select box an intrinsic minimum width | 3a item 3 (R90) |
| `2183c5f` | fix(ui): hand focus back when a toast closes under focus | 3a item 4 (R91) |
| `bf640fd` | fix(ui): land the plan 3a review minors | 3a items 5–16 |
| `af3da55` | feat(ui): add the MenuItemCard molecule | 3b Task 2 |

## 3a fix wave

### Item 1 (Important): Accordion `::details-content` under reduced motion (`4bb3050`)

- **Fix.** Inside `@utility details-content-motion`, a nested `@media (prefers-reduced-motion: reduce) { &::details-content { transition: none } }`.
- **Why not add it to the base reset list.** A browser that can't parse `::details-content` would drop the whole `*, ::before, ::after` rule, so every other reduced-motion guarantee would go with it. A separate rule fails on its own.
- **Proof in Chromium** (Playwright 1.62.1 against the built Storybook, `molecules-accordion--multiple`, `getComputedStyle(details, "::details-content")`):
  - before the fix: `reduce` → `matches:true, duration:"0.22s, 0.22s"` (the bug)
  - after the fix: `no-preference` → `0.22s, 0.22s` · `reduce` → `duration:"0s", property:"none"`
  - The probe script is in the scratchpad (`rm/probe.mjs`) and is not committed.
- **Regression guard.** A new `styles.spec.ts` test, "turns its height transition off under reduced motion", reads the utility's source. Mutation check: it fails with `transition: nonex`.

### Item 2: R89, brand-pink marks on the brand surface (`9ee1e3a`)

Each mark below gets a component colour token that `surface/brand.json` overrides and `surface/light.json` restores (the bar-token pattern). Ink and soft keep the base values.

| Component | Token (base → brand) |
| --- | --- |
| StepTracker reached diamond | `step-tracker-marker-on` pink-500 → ink-000 |
| StepTracker diamond still to come | `step-tracker-marker-off` ink-200 → white-alpha-25 (dimmer than a reached one, like `bar-off`) |
| StepTracker mark + check on reached | `step-tracker-mark-on` ink-000 → pink-500 (the check was `text-ink-000`, so it would have been white on the white diamond) |
| StepTracker mark still to come | `step-tracker-mark-off` pink-500 → ink-000 |
| EmptyState symbol | `empty-state-symbol` pink-500 → ink-000 |
| EmptyState icon | `empty-state-icon` pink-300 → white-alpha-70 |
| Stat icon (ink/brand tones) | `stat-icon` pink-500 → ink-000 |
| Tabs underline bar | `tabs-indicator` pink-500 → ink-000 |

- **Plays.** New `OnSurfacesStory` (`name: "OnSurfaces"`) for EmptyState, Stat and Tabs underline (spec §10.2). StepTracker's `VerticalSurfaces` gains a play.
  - Each play asserts every mark's painted colour ≠ its ground, using a new stories-only helper `groundOf()` in `lib/story-paint.ts` (the first non-transparent ancestor background).
  - StepTracker also asserts that the mark and the check ≠ their own diamond.
- **Mutation check.** With the 4 old component files restored, all 4 plays fail. With the fix: pass.
- **Unit tests** that pinned the old classes now pin the tokens. One title changed: "…at 32px in its soft tint".
- **Unchanged:** the StepTracker `inverse`-free DROP. There is still no tone prop; the surface does it.

### Item 3: R90, Select intrinsic min width (`5ddf262`)

- **New token** `spacing.field-select-min` = 160px in `field.json`, with R61 marker `["min-w"]`. It is registered in `SPACING`.
- **Fix.** `fieldControlVariants` `control: select` adds `root: "min-w-field-select-min"`. twMerge replaces the base `min-w-0` for selects only.
- **Play.** New Select story `ContentSizedParent`: an `inline-flex` parent, "Pick one", status error. It measures the placeholder width with a font-matched probe against the room inside the select.
  - Before the fix: `expected 0 to be ≥ 62.36` (fail). After: pass.
- **Unit test update.** The select test's `min-w-0` assertion now expects `min-w-field-select-min`.
- **Catalogue spec** (R61) is green.

### Item 4: R91, Toast focus restore (`2183c5f`)

- **Shared hook.** New `lib/use-focus-return.ts` holds the Snackbar R82 logic: the pre-open element, `isFocusInsideRef` via `onFocus`/`onBlur`, and a layout effect for a parent close.
  - **Snackbar** now uses the hook, with no behaviour change. All 31 existing tests pass.
  - **Toast** uses the hook too. Its `onOpenChange` restores focus when Radix has parked focus on the provider's viewport (`document.activeElement === root.parentElement`). The viewport outlives the toast, so that check is exact, and it never steals focus from a sibling toast.
- **Toast tests** (new `describe "hands focus back to what opened it (R91)"`):
  - after its action
  - after Escape
  - timer with focus inside
  - parent close with focus inside
  - leaves focus alone when it was never inside
  - The first 4 failed first; the last one is a guard.
- **Timer with focus inside.** Radix pauses the close timer while focus is inside the region (`focusin` → pause, `radix-ui` 1.2.23 source). So the test pins two things:
  - the toast stays after 5× its duration, with focus kept
  - the later close restores focus
  - It uses `vi.useFakeTimers({ shouldAdvanceTime: true })` and `userEvent.setup({ delay: null })`. Plain fake timers hung `user.click`.
- **Snackbar:** the same timer-with-focus-inside test was added. This is the test deferred from T14–16.
- **Chromium:** the `AddToOrder` play now asserts that focus returns to "Add Chilli Paneer" after View Cart, so there is no outlined empty viewport.

### Items 5–16 (`bf640fd`)

5. **ListRow.** The chevron is now `text-text-subtle`. The link hover is `hover:bg-button-hover-tint`, the tint the ghost Button and IconButton already use: pink-50 on light (same as before), white-alpha-16 on ink and brand, so ink rows are no longer white-on-pink-50. The unit test was updated.
6. **Alert** gets `key={role}`. New test: "mounts a fresh node when a status turns into an alert". Mutation check: it fails without the key.
7. **JSDoc.** Alert `onDismiss` and QuantityStepper `min` now say the parent owns the removal, so it must move focus.
8. **JSDoc "a status needs a message"** on the `status` prop of SearchField (`hint`), OtpInput (`message`) and SlotPicker (`message`).
9. **SearchField.** `aria-invalid={status === "error" ? true : props["aria-invalid"]}`. New test: "keeps a caller's own aria-invalid at the default status".
10. **Accordion.** The group is now named `group/accordion-item` (`group-open/accordion-item:`). The test was updated.
11. **`lib/is-shown.ts`** (false, `""`, null, undefined → hidden) has its own spec.
    - Used in Alert (title, content, action), EmptyState (body, action), ListRow (description, value), PriceSummary (note), Stat (sub), SectionHeader and FieldMessage.
    - SectionHeader's and FieldMessage's local copies were deleted. SectionHeader's copy didn't treat `""` as empty; it now matches FieldMessage.
    - New tests: Stat `sub` false/""/null draws no sub line; Alert `action` null/false/"" draws no wrapper.
12. **StepTracker.** The mark is now `size-4`. The `step-tracker-mark` spacing token, its R61 marker and its `SPACING` entry are deleted.
13. **Barrel.** `export type { NotificationAction, NotificationTone } from "./lib/notification"`.
14. **Tests and plays:**
    - ClosedByParent asserts Dismiss has focus before the parent closes.
    - The Snackbar swipe test focuses the bar first and now also expects focus back on the trigger. It is renamed "…closes past the threshold, handing focus back".
    - ListRow `AccountList` has a Chromium play: link "Default outlet Sector 57" → `#outlet`.
    - The CHECKOUT fixture step is renamed "Done" → "Confirmed", in both the test and the stories, so it no longer collides with the sr-only "Done".
    - The Alert `.mt-2.5` selector is now a structural children-count check.
    - The ControlModes play pins the disabled label to `paint(…, "--color-text-subtle")`.
15. **Docs:**
    - The ListRow props JSDoc says `ref` and the div props land on the wrapper.
    - Accordion `defaultOpen` JSDoc: changing it re-applies it.
    - `form-states.mdx`: "(Field mutes its label)" moved into the Applies-to column ("Field mutes its label to `text-subtle`").
    - A new SearchField `ClearLabel` story ("Clear outlet search") with a play.
16. **Tabs `isFullWidth`.** The trigger gets `text-center whitespace-normal`. New story `FullWidthLongLabels` at 320px.
    - Before the fix: `expected 327 ≤ 320` (fail). After: pass.
    - The unit test asserts `whitespace-normal`, not `-nowrap`.

**Deviations (fix wave):**
- **Items 5–16 are one commit.** Several files carry two or three items each (ListRow 5/11/15, Alert 6/7/11/14, SearchField 8/9), and patch-level staging isn't available here. The commit body lists every item.
- **Item 2 on ink.** The StepTracker marker-off stays ink-200 on ink (not overridden). The ruling and the review named brand only.

## Task 2: MenuItemCard (`af3da55`)

**Built:**
- `molecules/menu-item-card/menu-item-card.{tsx,test.tsx,stories.tsx}`, from the brief.
- A barrel line between `list-row` and `menu-item-row`.
- No tokens: it reuses `text-menu-item-name`, and the offsets are scale steps.

**TDD.** "Failed to resolve import ./menu-item-card" first, then 13/13 pass. The `@ts-expect-error` on `diet="egg"` is used, and typecheck is green.

**Fold items applied:**
- 1: lower-case subject.
- 2: the sorted barrel slot.
- 3: `createElement(headingTag(headingLevel), { className }, href ? <LinkComponent …> : name)`, with the R83 comment. The link is the third argument.
- 5: `Narrow` uses `globals: { viewport: { value: "floor360", isRotated: false } }`.
- Items 4, 6, 7 and 8 don't apply to T2.

**Deviations from the brief:**
- **Test `RouterLink`.** The brief's `<a data-router="" {...props} />` fails `jsx-a11y/anchor-has-content` (a LAW rule, so no disable). It is rewritten in the Breadcrumb/Pagination test pattern (`{ href, className, children }` → `<a …>{children}</a>`). The assertion is unchanged.
- **`action` JSDoc** extended: name it with the dish (MenuItemRow's wording).
- **Added to the brief:** an `AsLink` play (real layout).
  - It checks that `elementFromPoint` at the description is the stretched link, and that at the floating button it is the button, above the overlay.
  - Mutation check: removing `z-raised` fails it.

### Dev parity (brief table, extended)

| Dev item | Ruling | Where, or the spec clause |
| --- | --- | --- |
| Dish name is a heading; price printed; `was` struck | ALREADY | tests "names the dish…", "prints the price…"; PriceTag owns the `<s>` (Plan 2b) |
| `nameAs` picks the name element | ALREADY | `headingLevel` (spec §8.1) |
| Lifts on hover only when it is a link | ADD | test "lifts only when it is a link" (Card's `hover:lift`) |
| Old class asserts `rounded-4`, `shadow-elevation1`, `hover:shadow-elevation3` | DROP | D4 (`rounded-lg`, `shadow-1`, `shadow-3`) |
| One real stretched link (`after:inset-0`), not a click handler on the card | ADD | test "makes the name a link that covers the card" + `AsLink` play (hit-tested in Chromium) |
| Plain card, no link, without `href` | ADD | test "lifts only when it is a link" |
| `diet` / `egg` mark; `DietMarks` story | DROP | C10; test "takes no diet prop" |
| Heat named; badge over the photo | ALREADY | test "shows the badge, the heat…" |
| `onAdd` floating button | DROP | spec §9.2: floating `action` slot |
| Floating add named after the dish ("Add Masala Cold Brew") | ALREADY | stories' `addAction(name)`; `action` JSDoc; test "keeps the floating action a sibling…" |
| Add button above the stretched link (dev `z-1`) | ADD | `z-raised` + `AsLink` play (elementFromPoint), mutation-checked |
| No add button on a card that cannot take an order | ADD | test "draws no action…" |
| Labelled placeholder | ALREADY | test "labels the 4:3 photo placeholder…" |
| Photograph with its alt once supplied | ADD | test "shows the photograph once one is supplied" |
| Caller `className` replaces the card radius | ADD | test "lets a caller className replace the card radius" |
| Renders through the app's router link | ADD | test "renders the link through the app's router link" (`linkAs`) |
| axe | ALREADY | last test |
| Description clamped to two lines | ADD | `line-clamp-2`; asserted in "shows the badge, the heat…" |
| `h-full` + price row pinned to the bottom | ADD | body `flex flex-1 flex-col`, footer `mt-auto`; story `InAGrid` |
| `min-w-0` on the name so a long name wraps | ALREADY | `name` slot; `Narrow` play |
| Stories `Default`, `Variants` | ALREADY | `Playground`, `Variants` |
| Stories `InAGrid`, `Narrow` (360) | ADD | `InAGrid`, `Narrow` (width decorator per story, not meta) |
| (extra) Dev placeholder label "Dish photo 4:3" | Brief wins | documented default "Dish photo" (Task 1 precedent) |
| (extra) Dev body `p-5`, add `-bottom-4 right-3` | Brief wins | `p-4.5`, `-bottom-4.5 right-3.5` (card measurements, parity task T21 checks) |
| (extra) Dev `after:content-['']` | Not needed | Tailwind 4's `after:` variant emits `content: var(--tw-content)` itself |

Pure veg: the only "egg" in the files is the `@ts-expect-error diet="egg"` that pins it can't compile. The fixtures are Masala Cold Brew, Masala Fries, Kulhad Chai and Paprikaa Chilli Paneer.

## Gates (final, cold, at `af3da55`)

```
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache                 → Successfully ran
pnpm nx run-many -t typecheck lint test -p ui design-tokens --skip-nx-cache    → tokens 4 files / 272 · ui 72 files / 1135 → Successfully ran
pnpm nx run @pink-paprikaa-web/storybook:build                                 → Successfully ran
pnpm nx run-many -t typecheck lint -p @pink-paprikaa-web/storybook             → Successfully ran
pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache (R77)                → 65 files / 648 passed (first run, no cold-cache flake)
pnpm nx format:check                                                           → exit 0 (no plan-doc re-sort needed)
pnpm nx sync:check                                                             → All files are up to date
pnpm run guard:founder                                                         → clean
```

Counts since batch A (ui 1101, sb 637): the fix wave brought ui to 1122 and sb to 643, and T2 brought them to 1135 (+13) and 648 (+5).

## Other

- **Probe server.** The Chromium probe server (python http.server :4810) is stopped. The scratchpad scripts are not committed.
- **Git hygiene.** `stash@{0}` (the 3a lint-staged backup) is untouched. No `git checkout` or stash use.
- **Plan-doc re-sort.** None was needed; format:check was green at every commit.
