# Plan 3b final fix wave (base 6ca22f3)

Source of every finding: `W/final-review-3b.md` (read the cited section for each item — it holds
the file:line, the evidence and the reviewer's suggested fix). Known minors: `W/carried-fixes-final.md`
items 1–12, as AMENDED by the review's "Triage" section (the triage wins where it differs).

Owner/controller rulings that bind this wave (W/progress.md):
- **R105 — Table alignment stays as the plan wrote it** (header cells bottom, body cells top). Do NOT
  apply the review's "Owner question: Table alignment" recommendation. No TableBody `align` prop.
- **R106 — FilterBar keeps no `name`/`onBlur`** (R99); document it instead of changing code.
- **R107 — Minor 1 is IN; Minor 6 (AUTHORING.md) and the library-wide focus-audit play are OUT.**

## Items, in this order (one commit per item or tight group; lower-case subjects)

### Important
1. **I1 — focus rings clipped by overflow.** CouponTicket's copy button (`coupon-ticket.tsx:9` +
   `coupon-copy-button.tsx:86`) and FilterBar's scrolling chips (`filter-bar.tsx:46`). Give the ring
   room inside the overflow container (padding/inset ring, or move the clip) without changing the
   visual layout. Each gets a play: Tab to the control and assert the focused element's ring box is
   not clipped by any `overflow` ancestor (compare the ring's outer rect with the clipping
   ancestor's rect). Keep the helper local to these stories (the library-wide audit is OUT, R107).
2. **I2 + carried 8 + carried 12 — ChoiceCardGroup offer wording.** The badge/meta text must be in
   each option's accessible description (`choice-card-group.tsx:202-205`) AND show in full at 360
   (PlanLengths: "OFFER: +1 FREE / MONTH" currently truncates). The PlanLengths 360 play asserts no
   truncation (scrollWidth <= clientWidth on the badge text, full wording visible) and the
   accessible description contains the wording. Unit test for the description.
3. **I3 — ChipGroup focusable ref.** Add `ref?: Ref<HTMLDivElement> | undefined` to
   `ChipGroupBaseProps`, forward to `ToggleGroup.Root`. 3a-style test: ref receives the group,
   `ref.current.focus()` lands on the chosen (or first) chip, `onBlur` fires once. Match how the 3a
   value controls (OtpInput etc.) did it.

### Carried items (as amended by the review triage)
4. **Carried 1 + Minor 2** — configure `jsx-a11y/no-redundant-roles` in `tools/eslint-config/react.js`
   with `{ nav: ["navigation"], ol: ["list"], ul: ["list"] }`; remove the disable in `steps.tsx`;
   add `role="list"` (+ test) to StepTracker's `ol` and PricingCard's points `ul`.
5. **Carried 2** — add CheckCard `Invalid` and `InvalidChecked` stories; play reads computed
   box-shadow (no pink) and the danger border via `lib/story-paint`.
6. **Carried 3** — `restoreMocks: true` in the ui Vitest config (or a shared afterEach) instead of
   per-test `vi.restoreAllMocks`; remove the per-test calls in pricing-card and chip-group tests.
7. **Carried 4 + carried 9** — ChipGroup OnSurfacesStory: segmented copy gets `label="Meals per day"`;
   below sm, stack the ground label above the group so the page never scrolls at 360 (story frame).
8. **Carried 5** — Table `minWidth="none"` uses `overflow-clip`, sm/md/lg keep `overflow-x-auto`;
   PlanVsApp gets a 360 play asserting `scrollWidth <= clientWidth`. (Alignment untouched — R105.)
9. **Carried 6** — sweep the 3b `ReactNode` slots to `isShown`: StickyActionBar `caption`;
   MenuItemRow/MenuItemCard/OutletCard `action`; FilterBar `note`/`trailing`; ChoiceCardGroup
   `description`/`price`/`meta` (no empty span for `aria-describedby` to point at). Test the
   ChoiceCardGroup `description={false}` case.
10. **Carried 7** — CheckCard disabled + unchecked box border ink-400; play compares the computed
    border colour with the card ground (`groundOf`) and asserts they differ.
11. **Carried 10** — docs-kit prose wrapper: inline `code` gets `overflow-wrap: anywhere`, markdown
    tables sit in a scroll region; Introduction and Colours › Contrast pages have
    `scrollWidth == 360` at 360 (verify with a probe; a play if the docs stories allow it).
12. **Carried 11** — KeyValueList BookingRules at floor360 (globals viewport) with a play asserting
    the value column >= 128px.

### Minors
13. **Minor 1 (R107)** — extract `packages/ui/src/lib/struck-price.tsx`: the `<s>`, the hidden
    lower-case "was" word (R94), the `was <= price` RangeError guard, one colour (pick the one
    PriceTag uses unless the review shows it fails contrast somewhere; if a new colour is needed it
    is a token). PriceTag, PricingCard and ChoiceCardGroup all consume it; their existing tests
    must still pass; add a test for the helper. Then edit Plan 4's doc
    (`docs/superpowers/plans/2026-09-27-ds-04-organisms.md`, QuotePanel `wasLabel` default ~135 and
    ~2624) to lower-case "was" and to consume the shared helper — a `docs:` commit.
14. **Minor 3 (R106)** — add "deviation 19" (FilterBar: no `name`/`onBlur`, R99) to the 3b plan's
    Contract deviations table; amend spec D17's Controller list and contract §6
    (`ds-00-contracts.md:720-721`) to match. `docs:` commit.
15. **Minor 4** — CheckCard JSDoc: with Field, pass `aria-describedby`/`aria-invalid`, not `id`;
    change the test at `check-card.test.tsx:91-102` to that shape (one label only).
16. **Minor 5** — replace the hand-rolled colour probes in `check-card.stories.tsx` and
    `choice-card-group.stories.tsx` with `lib/story-paint`'s `paint` (3b files only).
17. **Minor 7** — Table JSDoc on the highlighted column: say why in the header text (WCAG 1.4.1).
18. **Minor 8** — `feature-item.stories.tsx:166` formats amounts with `formatRupees`.
19. **Minor 9** — drop the two history comments in `contrast-matrix.tsx:81` and `token-table.tsx:27`.
20. **Minor 10** — AnnouncementBar JSDoc: omit `countdownLabel` when the message already leads into
    the countdown; fix the a11y fixture so it doesn't double "closes in".
21. **Review recommendations (JSDoc only)** — ChipGroup JSDoc states the R100 keyboard model
    (arrows move, Space selects) as FilterBar's does; ChipGroup and ChoiceCardGroup JSDoc: "own
    `status`/`message`; do not wrap in Field".

### Owner feedback on the wave (2026-10-02, after items 1–21 landed)
22. **ChoiceCardGroup badge overflows its tile** (`choice-card-group.tsx:89`). Item 2's fix wrapped
    the badge in a new flex container that grows to its content, so the Badge's own width limit is
    measured against that wrapper: a long offer badge spills out of a 150px tile instead of
    truncating/wrapping inside it. The PlanLengths play missed it because it checks the meta line,
    not the badge. Fix: the wrapper slot becomes `badge: "flex min-w-0 max-w-full"`. Test: a play
    (and the 360 PlanLengths play) asserting the badge's right edge <= the tile's content right
    edge and badge `scrollWidth <= clientWidth` for a long badge in a narrow (150px) tile; see it
    fail on the current code first.
23. **Scrolling docs tables all share one accessible name** (`apps/storybook/src/docs-kit/prose.tsx:30`).
    Every docs table wide enough to scroll gets the region name "Scrollable table", so a page with
    two such tables has two identically named regions (the Storybook a11y check flags it). Fix: name
    each region from its table's caption, else the nearest heading above it (`aria-labelledby` to
    that element's id, generating an id when it has none); fall back to the generic name only when
    neither exists. Test: a docs story/play with two scrolling tables asserting two distinct region
    names, and axe clean.

### Controller additions from the wave's own concerns
24. **360 plays run 32px wider than the canvas** (report concern 1). The test runner omits
    Storybook's padded-layout 16px each side, so every floor360 play measures against 392px of
    room instead of the 328px a 360 canvas leaves. Fix it once, centrally (the Storybook vitest
    setup / preview so tests render with the same padding as the canvas, or the floor360 viewport
    definition — whichever makes the test geometry equal the canvas geometry). Then remove the
    booking-rules play's manual 32px subtraction. Re-run every floor360 play; any that now fails
    exposed a real 360 defect — fix it in the component (not the story) or report it.
25. **coupon-ticket.test.tsx** — drop the redundant `vi.restoreAllMocks` now that `restoreMocks`
    is on (3b files only; 3a's are out of scope).

Accepted (controller): concern 2 (struck-price colour changes follow R107's one colour; both pairs AA),
concern 3 (the highlighted column's header text already names the column). Concern 4 → Plan 4 Task 0.

### From the re-review (W/final-fix-wave-3b-rereview.md), owner rulings 2026-10-03
26. **R108 — ChoiceCardGroup badge WRAPS, never truncates** (re-review I1). At 360 PlanLengths shows
    "OUR RECOMME…" (label scrollWidth 168 vs clientWidth 114); the play reads the Badge root, which
    always clips, so it cannot fail. Fix: inside ChoiceCardGroup the badge label wraps onto further
    lines within the tile (e.g. `**:whitespace-normal` on the badge slot or the equivalent that
    lifts the Badge's truncation for this use only — do not change the Badge atom for other
    consumers); item 22's bound stays (badge never wider than its tile). The plays (PlanLengths at
    360 and the ~150px tile) measure the LABEL text element: `scrollWidth <= clientWidth`, full
    wording present, right edge inside the tile. RED on c307865 first.
27. **Re-review M1** — `prose.tsx:13-66`: two docs tables can still share a name when they sit under
    different headings with the same text, or after a resize. Make region names unique in those
    cases too (e.g. reference the heading by a unique id and disambiguate equal texts); test it.
28. **Re-review M2** — `filter-bar.tsx:51`: JSDoc note that the `-m-1` focus room needs at least 4px of
    page gutter around the rail (as Cluster documents).
29. **R109 — badge copy "Our pick"** (owner 2026-10-03). `wrap-anywhere` stays as the safety net (a
    single over-long word must never overflow), but story/fixture badge copy that breaks mid-word at
    360 — "Our recommendation" — becomes "Our pick". Sweep 3b ChoiceCardGroup stories and plays for
    the old string; the 360 play additionally asserts the label's text renders without a mid-word
    break for the shipped fixtures (e.g. label height equals one line, or each word fits the label).
Accepted (controller): re-review M3 (`ringClippers` duplicated in two stories — R107 kept the audit
out; promote it if Plan 4 needs a third copy).

## Gates (final HEAD, cold)
```bash
pnpm nx format:check && pnpm nx sync:check
pnpm nx run-many -t typecheck lint test build --skip-nx-cache --outputStyle=static
pnpm nx run storybook:test --skip-nx-cache
pnpm guard:founder
```
