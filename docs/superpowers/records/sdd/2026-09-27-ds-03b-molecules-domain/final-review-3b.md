# Plan 3b final whole-branch review — a1b3112..6ca22f3

Reviewer: Senior Code Reviewer (read-only; HEAD, index and tree untouched). Evidence beyond the diff:
the existing `apps/storybook/storybook-static` build served read-only and inspected in Chromium
(computed style, geometry, the accessibility tree). Screenshots are in `W/final-review/`.

### Strengths

- **The plan is fully delivered.** All 20 molecules exist with the `tsx` / `test.tsx` / `stories.tsx`
  trio, a sorted barrel export (fold item 2), and the component tokens, R61 markers and contrast
  pairs the plan names (`offer-seal`, `offer-seal-brand`, `choice-card-selected`,
  `choice-card-on-brand`, `table-head`, `shadow.selected`). All five Review Focus tests and plays
  exist under their planned names, and each would fail against the naive implementation.
- **The architecture holds everywhere.** No molecule imports `layouts/`, `organisms/` or
  `@pink-paprikaa-web/content` (R75, R96). Only `filter-bar.tsx`, `chip-group.tsx`,
  `coupon-copy-button.tsx` and `announcement-expiry.tsx` are `"use client"`. Every other file is
  hook-free apart from `useId`, and attaches a handler only when the consumer supplied one
  (`ChoiceCardGroup.handleChange`). No arbitrary values, no hex, no unsound casts in component code.
  The only `@ts-` lines are the two `@ts-expect-error diet="egg"` guards.
- **The same concern is mostly solved the same way.** Headings use
  `createElement(headingTag(level))` in all 7 titled components (R83). MenuItemCard and OutletCard
  share `lib/stretched-link`, with the ring keyed on `data-stretched-link` so router links that drop
  props still ring. LinkCard is a whole-card link that announces "Opens in a new tab" in the Link
  atom's own words (R44). Every hidden struck-price word is lower-case "was" (R94). Rupees go through
  `PriceTag` / `formatRupees`. RangeError guards are in LoyaltyCard, ChipGroup, PricingCard and
  AnnouncementBar. `isShown` was promoted to `lib/` and FieldMessage now reuses it.
- **Behaviour was thought through and pinned.** ChipGroup's limit guards additions only, so a group
  that starts over its limit can still drop chips. A disabled group submits nothing. The coupon copy
  is armed with the write, and a refused write selects the code instead of claiming "Copied", with
  one silent-on-reset live region. AnnouncementBar expiry uses `useSyncExternalStore`, a server
  snapshot and a re-arming >24.8-day timeout. Table scrolls inside a named, focusable region.
  OfferSeal's 0.18 × side bleed limit is enforced by its types.
- **RHF compatibility for the native controls is real.** `register()` is proven with `fakeRegister`
  on ChoiceCardGroup (the ref reaches every radio) and CheckCard.
- **Brand rules hold.** Every fixture is vegetarian (the only "egg" is the compile guard; "Mushroom
  Keema Pav" is the design system's own veg dish). "Pink Paprikaa" is spelled correctly, no founder
  identity appears, and the Company details card shows only the statutory entity.
- **The parity sweep was honest.** 13 targeted fixes, each proven by a geometry or computed-style
  play rather than a class assertion. Frame faults were fixed as frame faults and not masked.

### Issues

#### Critical (Must Fix)

None.

#### Important (Should Fix)

**I1. Keyboard focus rings are clipped by the component's own overflow container (CouponTicket stub, FilterBar scrolling rail).**
- `packages/ui/src/molecules/coupon-ticket/coupon-ticket.tsx:9` — the ticket root is
  `overflow-hidden`, which it needs to cut the notches into semicircles. The stub button
  (`coupon-copy-button.tsx:86`) runs flush to the root's top, right and bottom edges, and the base
  ring (2px solid at a 2px offset) is drawn outside the button. Measured in Chromium: the button's
  rect is `[408,16,576,185]` and the root's is `[16,16,576,185]`. With `:focus-visible` on, only a
  hairline along the perforation is visible (`W/final-review/coupon-stub-focus-visible.png`).
- `packages/ui/src/molecules/filter-bar/filter-bar.tsx:46` — the non-wrapping group is
  `overflow-x-auto pb-1`. That computes `overflow-y: auto` as well, and the group has no top or
  inline padding. The selected chip sits at gap 0 on its top and left, so its ring is clipped on both
  sides (`W/final-review/filter-bar-scroll-focus-visible.png`). The last chip at the end of the scroll
  is clipped on its right in the same way.
- **Why it matters.** These are the primary keyboard targets of two components Plan 4 consumes
  directly (MenuList, offer pages). The AUTHORING §9 checklist requires a visible focus ring, and no
  play checks either ring, so per-task review could not see it. It is the same class of bug in two
  places, so it will be copied.
- **How to fix.**
  - Coupon stub: an inset ring, `focus-visible:-outline-offset-4` on the stub root (a core Tailwind
    v4 utility; no token needed).
  - FilterBar: `p-1 -m-1` on the scrolling group, keeping the scrollbar room. The ring then lives
    inside the scroller's padding box.
  - Add one play per component that focuses with `focus({ focusVisible: true })` and asserts the
    ring fits: for the rail, the item's rect inflated by `outlineWidth + outlineOffset` lies inside
    the scroller's rect; for the stub, a negative `outlineOffset`.
  - Add a line to AUTHORING §9: "a focusable child of an `overflow-*` box needs inset ring room".

**I2. ChoiceCardGroup never announces an option's `badge` or `meta` (e.g. "OFFER: +1 FREE / MONTH").**
- `packages/ui/src/molecules/choice-card-group/choice-card-group.tsx:202-205`. This is plan Task 10
  code, so it is a plan issue too. The radio's name is pinned to title + price by
  `aria-labelledby`, and its description to the description alone. The badge (`:216`) and the meta
  (`:224`) sit inside the label, but they are excluded from both.
- The accessibility tree of `PlanLengths` in Chromium reads only "Weekday plan" with the description
  "24 meals · Mon–Sat". The offer, the reason that plan is cheaper, is silent for a screen-reader user
  arrowing through the radios.
- **Why it matters.** Price and offer facts on the subscription pages are the content that drives
  orders. Carried items 8 and 12 already lose the same words visually at 360px.
- **How to fix.** Wrap `option.badge` and `option.meta` in spans with ids `${id}-badge` /
  `${id}-meta` when `isShown`, and set `aria-describedby={joinIds(descId, metaId, badgeId)}`. Add a
  test asserting `toHaveAccessibleDescription("24 meals · Mon–Sat OFFER: +1 FREE / MONTH")`. The
  wording follows the Badge's text content, so check whether the uppercase is CSS. Extend the
  PlanLengths play (item 12) with the same assertion.

**I3. ChipGroup has no focusable `ref`, so RHF's `<Controller>` cannot focus it on error.**
- `packages/ui/src/molecules/chip-group/chip-group.tsx:23-47` (the props); the Roots are at
  `:190` and `:258`.
- Spec §11 (the RHF row, `…design.md:795`) requires the RHF story to assert "focus-on-error … across
  … QuantityStepper (Controller), ChipGroup (Controller)". Plan 3a added `ref` to QuantityStepper and
  OtpInput for exactly this reason ("Controller needs a focusable ref", 3a deviations 2–3). The 3a
  value controls all have a test, *"gives react-hook-form's Controller a name, onBlur and a focusable
  ref"*. ChipGroup is the one value control in 3b without it, so `field.ref` is dropped and
  `shouldFocusError` silently skips it.
- **Why it matters.** Plan 4's calculators (meals, breads, starter picks) are ChipGroups inside
  forms. Adding the ref later is additive, but every Plan 4/5 call site written now will omit it.
- **How to fix.** Add `ref?: Ref<HTMLDivElement> | undefined` to `ChipGroupBaseProps` and forward it
  to `ToggleGroup.Root`. Radix's RovingFocusGroup root is focusable (`tabIndex 0`), and a
  programmatic `focus()` on it moves focus to the active or first item (verified in
  `@radix-ui/react-roving-focus@1.1.19/dist/index.mjs:92-113`). Add the 3a-style test (ref receives
  the group, `ref.current.focus()` lands on the chosen chip, `onBlur` once).

#### Minor (Nice to Have)

1. **The struck price is drawn three ways, in three colours.**
   - Locations: `atoms/price-tag/price-tag.tsx:12` (`text-text-subtle`),
     `molecules/pricing-card/pricing-card.tsx:30,108-114` (`text-text-muted`) and
     `molecules/choice-card-group/choice-card-group.tsx:83,181-188` (no colour: it inherits the
     heading colour, or pink-700 when checked).
   - The `was <= price` RangeError is also duplicated (PriceTag, PricingCard).
   - Plan 4's QuotePanel adds a fourth copy with `wasLabel = "Was"` (`ds-04-organisms.md:135,2624`),
     which contradicts R94.
   - Fix: extract `lib/struck-price.tsx` (the `<s>`, the hidden word, the guard, one colour token) and
     have all three use it, so Plan 4 consumes it. Fix Plan 4's default to lower-case.
2. **The Safari list-semantics fix was applied to one list only.**
   - `steps.tsx:67` adds `role="list"`.
   - `step-tracker.tsx:95` (an `ol`) and `pricing-card.tsx:118` (the points `ul`) are the same case:
     preflight's `list-style: none`, outside a `nav`. Breadcrumb and Pagination are inside a `nav`,
     where WebKit keeps the semantics.
   - Decide once and apply it everywhere (see carried item 1).
3. **R99 dropped FilterBar's `name` / `onBlur`, but the contract and spec still promise them.**
   - Contract §6 (`ds-00-contracts.md:720-721`, R32) and spec D17 list FilterBar among the Controller
     value controls. The plan's "Contract deviations" table has no row for the drop.
   - The ruling is right on substance (it is a filter), but Plan 4/5 Task 0 audits will flag the gap.
   - Fix: add deviation 19 and amend D17's list.
4. **CheckCard + Field composition gives one input two labels.**
   - Spreading Field's `control` (`check-card.test.tsx:91-102`; the JSDoc at `check-card.tsx:30-34`
     says "wrap the card in Field") passes `id`. The input is then labelled by CheckCard's wrapping
     `<label>` and by Field's `<label htmlFor>`.
   - Field's visible label is not in the accessible name, which is pinned by `aria-labelledby`.
   - Plan 5 already avoids this by not passing `id` (`ds-05:7422`).
   - Fix: say so in the JSDoc ("pass `aria-describedby` / `aria-invalid`, not `id`") and change the
     test to that shape.
5. **Hand-rolled colour probes duplicate `lib/story-paint`'s `paint`.** They are in
   `check-card.stories.tsx:69-76` and `choice-card-group.stories.tsx:82` (and in 3a's radio, field and
   select stories). Use the shared helper.
6. **AUTHORING.md has drifted from the code.**
   - §8 (`AUTHORING.md:294-296`) still lists only RevealObserver, Tooltip and Countdown as client
     files.
   - The conventions 3b established (`isShown` for slots, `STRETCHED_LINK`, the struck price, the
     createElement heading, focus room under overflow) are nowhere in the authoring guide that Plan 4
     authors will read.
7. **Table's highlighted column header is marked by colour alone.** `table.tsx:36` sets only
   `text-pink-700` (body cells also go semibold). Add a JSDoc line: "say why in the header text
   (‘Our pick’)", for WCAG 1.4.1.
8. **Story copy hard-codes a rupee amount.** `feature-item.stories.tsx:166` writes "Join at ₹130 and
   it stays ₹130…", but the global constraint says fixtures format with `formatRupees`. This is a
   nit.
9. **Two comments describe history.** `contrast-matrix.tsx:81` and `token-table.tsx:27` explain how
   the deleted DocTable's widths map to Table's. That is a review note, not a constraint; drop them.
10. **Countdown copy can repeat itself.** The AnnouncementBar a11y fixture (and Plan 4's handoff
    header) end the visible message with "· closes in" *and* pass
    `countdownLabel="Launch price closes in"`, so a screen reader hears "closes in Launch price closes
    in 3 days…". Document: omit `countdownLabel` when the message already leads into the countdown.

### Triage of carried-fixes-final.md 1–12 (keep/drop/amend each)

1. **Amend, Minor.**
   - Configure `"jsx-a11y/no-redundant-roles": ["error", { nav: ["navigation"], ol: ["list"], ul: ["list"] }]`
     in `tools/eslint-config/react.js`, keeping the default `nav` entry, then remove the disable.
   - Extend the fix to StepTracker's `ol` and PricingCard's points `ul` (Minor 2), otherwise the rule
     change only blesses one list.
2. **Amend, Minor.**
   - There is no invalid CheckCard story at all, so Chromium axe never sees the invalid state.
   - Add `InvalidChecked` (and `Invalid`) stories. The play reads
     `getComputedStyle(label).boxShadow` (no pink) and the border colour (danger), via
     `lib/story-paint`.
   - The test at what is now `check-card.test.tsx:109-115` can then keep its class assertion as
     wiring.
3. **Amend, Minor.**
   - The same pattern is at `chip-group.test.tsx:155-159`. The pricing-card one is now at
     `pricing-card.test.tsx:36-40`.
   - Fix both at once with `restoreMocks: true` in the ui Vitest config (or `afterEach`), not
     per-test `try/finally`.
4. **Keep, Minor.** Rides with item 9.
5. **Amend, Minor.**
   - Removing `overflow-x-auto` for `minWidth="none"` breaks the frame. The scroll container is what
     clips the pink `thead` to the 24px radius. With `overflow: visible`, the header's square corners
     poke out of the rounded frame (verified: `W/final-review/table-none-overflow-visible.png`).
   - Use `overflow-clip` for `none` instead (verified: `…-overflow-clip.png`). It is not a scroll
     container, so axe's scrollable-region rule never applies, and the corners stay rounded.
   - Keep `overflow-x-auto` for sm/md/lg. Add a 360 play to the PlanVsApp story asserting
     `scrollWidth <= clientWidth`, so `none` is only used where the table fits.
6. **Amend, Minor.**
   - Widen it to a sweep of the 3b `ReactNode` slots still gated by truthiness or `=== undefined`:
     - StickyActionBar `caption`;
     - MenuItemRow, MenuItemCard and OutletCard `action`;
     - FilterBar `note` / `trailing`;
     - ChoiceCardGroup `description` / `price` / `meta`. Here `description={false}` leaves an empty
       span that `aria-describedby` points at.
   - Use `isShown` everywhere, which also feeds I2's id joining.
7. **Keep, Minor.**
   - Use ink-400 for the disabled-unchecked box border. It is the step 3a's Radio already uses for
     its disabled *checked* border (`radio.tsx:16`), and ink-300 on ink-200 barely differs.
   - The play compares the computed border colour against `groundOf(box)`.
8. **Keep; raise to Important (pair it with I2).** The full offer wording is lost at 360px, the
   primary viewport, and I2 shows screen readers lose it too. Fix both together.
9. **Keep, Minor.** Story frame only.
10. **Amend, Minor.**
    - This is out of 3b's component scope. Fix it once in the docs-kit prose wrapper
      (`overflow-wrap: anywhere` on inline `code`, the markdown table in a scroll region).
    - If those pages are rewritten by Plan 5, move it to Plan 5's docs task instead.
    - Either way, verify `scrollWidth == 360`.
11. **Amend, Minor.** KeyValueList has no floor360 story. Add `globals.viewport.value = "floor360"`
    to BookingRules (or a `BookingRulesAt360` story) so the ≥128px assertion actually runs at the
    floor.
12. **Keep; rides with 8.** Also assert I2's accessible description, so the play fails if the words
    are lost visually *or* to assistive tech.

### Owner question: Table alignment (your evidence-based recommendation)

**Recommendation: top-align the header cells, and let body alignment be chosen per table, defaulting
to top. The price list uses middle.**

The handoff is not uniform:
- Its price list (`W/parity/table-1280-source-0.png`) centres each row and top-aligns the header.
- Its box comparison (`…source-1.png`) top-aligns the body, because its cells wrap to two lines
  (Paneer day, Biryani day).

So a single body rule cannot match both:
- **Header (`table.tsx:31`, `align-bottom` → `align-top`).** With a title plus sub-line anatomy
  ("Trial / 5 meals · any days…"), bottom alignment drops "Plate" onto the sub-line row. Measured: the
  "Plate" text top is at 48px against "Trial" at 30px. With `align-top` they share a line (30/30),
  which is what the handoff draws. The column headers never wrap to unequal heights except via those
  sub-lines, so nothing is lost.
- **Body.** Move `align-top` off `tableCell` (`:40`) and the row-header variant (`:32`), onto
  `tableBody`. Add `TableBody align?: "top" | "middle"` (= `"top"`). Cells inherit, per the HTML
  rendering rules (`tr, td, th { vertical-align: inherit }`), so this stays zero-JS and server-safe
  with no context. A row can also override it with `className="align-middle"`.
- **Evidence.** In the price list, middle alignment takes the plate name from 10px *above* the price
  amount to centred against the price button (the name block's top is 6px below the amount's, both
  centred). This matches the handoff (`W/final-review/table-price-list-head-top-rows-middle.png`,
  previewed by setting exactly those two alignments).
- **The cost** is small and confined to `table.tsx`, one story (PriceList → `align="middle"`) and a
  geometry play (row header centre ≈ button centre ±2px).
- **Box-compare wrapping** ("Salad & chutney" at 1280) is auto table layout. Leave it to the
  consumer (`whitespace-nowrap` on that row header column). It is not a component fault.

### Recommendations

- **One fix wave before Plan 4:** I1, I2, I3 and the carried items as triaged above. I2, item 8 and
  item 12 are one change.
- **Plan 4 Task 0, cross-plan reconciliation to add:**
  - Rating names a score "5.0 out of 5", not "5 out of 5" (`ds-04:2039`).
  - QuotePanel's `wasLabel` default becomes lower-case and consumes the shared struck price
    (Minor 1).
  - ChipGroup gains `ref` (I3), so pass `field.ref`.
  - The Table scroll wrapper needs no `jsx-a11y/no-noninteractive-tabindex` config: its tabIndex is
    an expression, which the recommended `allowExpressionValues` accepts (`ds-04:230` asks).
- **Plan 5 Task 13 (RHF story):** it wraps ChipGroup in `Field` with `{() => …}`
  (`ds-05:7300-7336`), so Field's message is neither associated (no `aria-describedby`) nor marks the
  chips invalid. ChipGroup drops a caller's `aria-invalid` by design, which is the R101/R102
  asymmetry. Either pass `status` / `message` to ChipGroup itself (its own convention) or pass
  `aria-describedby` down. Document the rule on ChipGroup and ChoiceCardGroup: "own `status` /
  `message`; do not wrap in Field".
- **Rulings.** R94–R98 and R100–R104 hold on the evidence. R99 is right on substance but needs the
  contract/spec amendment (Minor 3). On R100: SingleChipGroup inherits the same arrows-move,
  Space-selects behaviour as a *form* radiogroup. That is acceptable, but say so in ChipGroup's
  JSDoc as FilterBar's does.
- **Add a library-wide focus-visible audit play.** Tab through each interactive story and assert
  the focused element's outline box is not clipped by an `overflow` ancestor. I1 shows per-component
  review misses this class.

### Assessment — **Ready to merge?** With fixes

There are no Critical findings. The 20 molecules match the plan and contracts, with justified
deviations, clean boundaries and real behaviour tests. But three Important cross-component gaps would
be copied into Plan 4's pages if merged as is: clipped focus rings, silent choice-card offers and the
missing ChipGroup Controller `ref`. Each is a small, contained fix.
