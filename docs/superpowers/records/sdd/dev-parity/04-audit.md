# Dev-parity audit — Plan 4 (organisms)

Plan: `docs/superpowers/plans/2026-09-27-ds-04-organisms.md`. Dev source: `git show dev:packages/ui/src/organisms/<name>/…`
(12 organisms on `dev`). QuotePanel (Task 6), ActionDock (Task 9) and ReviewCarousel (Task 13) have no dev counterpart;
they are marked `**Dev reference:** none (handoff component)`. Task 0 gained Step 4a, which checks the 12 tables and the
3 markers.

Totals: **ADD 73** (62 built into the plan, 11 pending on 7 contract deltas) · **DROP 41** · **ALREADY 98**.

"Pending" means the row is in the task's parity table as `ADD — pending contract delta N`, with no code. It is built
only if the controller rules it in.

## Per component

| Task | Component | ADD (built + pending) | DROP | ALREADY | Notable |
| --- | --- | --- | --- | --- | --- |
| 1 | CtaBand | 7 | 3 | 7 | ADD: action click-through, bg class per tone, split `shrink-0` / centre `justify-center` action, className merge, HeadingOnly and WithoutAction stories. DROP: heading ink classes (D5), `on="brand"` (D5), "one action, never two" (the handoff bands carry two). Test count corrected to 12 (the plan said 7 for 9 expanded tests). |
| 2 | StatBand | 8 | 1 | 6 | ADD: sub-line only when given, glyph per stat, bg per tone, number colour brand/inverse, centring, className merge, WithIcons and WithSubLines stories (real facts only). DROP: the "4.6 rating" / "7 sections" copy (not verifiable). |
| 3 | HeroBanner | 5 | 5 | 8 | ADD: default `text-display-1-fluid`, className merge, HeadlineOnly story, WithPhotograph story (media slot + `scrim-bottom` caption; this keeps dev's "scrim only over a real photo" behaviour). DROP: `image`/`imageAlt`/`imageCaption`/`imageLabel` default (contract `media` slot, D9), tone ink classes (D5), `on="brand"`, "Est. 2019" (C3). |
| 4 | TestimonialWall | 4 + 2 | 3 | 7 | ADD: scores announced as images, no score when absent, className merge, WithoutScores story. Pending: `lede` (delta 1, plus the WithLede story). DROP: dev default `variant="brand"` and forced `mark="symbol"` (D1: the design system's jsx defaults `default` and passes no mark); SixReviews with invented guests (§10.1). |
| 5 | FaqSection | 3 + 2 | 2 | 7 | ADD: className merge, WithoutLede and HeadingLevel3 stories. Pending: `defaultOpen` (delta 2, plus the SecondOpen/AllClosed stories). DROP: the egg answer (C10); question headings one level down (the Accordion has none, see cross-plan). |
| 7 | OrderTracker | 4 + 1 | 4 | 9 | ADD: no action when none is given, className merge, DeliverySteps and Mobile stories. Pending: the named tracker list (delta 3). DROP: auto Preparing/Ready badge (D9, badge slot), bare-string steps (§8.2), `onDone`/`doneLabel` (§8.1), default content (D9). |
| 8 | SiteFooter | 3 | 5 | 7 | ADD: bg per tone, className merge, FourColumns story. DROP: every content default including the fake FSSAI line (D9), generic network glyphs (D10), `<p>` headings (§9.3), `inverse`/`on` props (D5). |
| 10 | TabBar | 7 | 1 | 7 | ADD (code): label `truncate` + `min-w-0` so five tabs fit at 360px, `active:press-scale`. ADD (tests): five destinations, controlled bar does not move itself, className merge. ADD (stories): EachDestinationActive (self-named landmarks), Mobile. DROP: uncontrolled `defaultValue`/internal state (contract `value` required + D6). |
| 11 | Dialog | 6 + 3 | 1 | 12 | ADD (code): only the body scrolls, header and footer stay `shrink-0` (dev kept the footer on screen). ADD (tests): focus moves in on open, scrim present, sheet has no `rounded-xl`. ADD (stories): InsideAPhoneFrame (portalContainer + `contain-layout` frame), Mobile. Pending: `hasCloseButton` (delta 4, plus the MustBeAnswered story), `className` (delta 5). DROP: `isOpen`/`isDefaultOpen` names (§8.2). |
| 12 | SiteHeader | 6 | 6 | 7 | ADD: custom `navLabel` test; one test that opens the drawer by keyboard, checks the rail is hidden from AT while it is open, and closes it from its close button; className merge; CartCounts story (0/1/12, each masthead self-named). DROP: 72px (C1), `on*` callbacks and built-in buttons (§8.1), `isScrolled` prop (client leaf), the sheet description copy (D9), default links (D9). |
| 14 | MenuList | 5 + 3 | 4 | 11 | ADD: note rendered, smaller `gridCount`, no overflow divider when every dish fits, className merge, GridOnly and SmallGrid stories. Pending: `defaultCategory` (delta 6), `lede` (delta 7), plus the PreselectedCategory/WithLede stories. DROP: controlled `category`/`onCategoryChange` (D6), `onAdd` (§9.2 action slot), empty-state copy (D9), `diet` (C10). |
| 15 | CartPanel | 4 | 6 | 10 | ADD (code): name and option lines truncate. ADD (tests): no pay bar on an empty cart, className merge. ADD (stories): OneLine, DineIn, Mobile. DROP: the Radix side-sheet shell (D1/§9.3: a panel; a sheet is `Dialog variant="sheet"` around it), line total ₹560 vs the unit price (D2: the design system's jsx prints `l.price`), `onPlaceOrder`/`onBrowse` (§8.1), built-in note/labels/copy (D9), `diet: "egg"` (C10). |

Other edit (hard rule): the Task 1 `GOOGLE_REVIEWS` fixture still spelled the brand with one `a` inside a verbatim review.
The plan's own Controller amendment (R17) ordered it elided, so I applied the elision, "…order more […]. Packing…". It
now matches Plan 5 `fixtures.ts`, and I updated the doc comment to say so.

## Proposed contract deltas

All are additive, optional and R13-shaped. Target: `docs/superpowers/plans/2026-09-27-ds-00-contracts.md` §7. If one is
approved, add it to Plan 4's "Contract deviations" table, then build that row's code and tests in the task.

1. **TestimonialWallProps** `+ lede?: ReactNode | undefined`. Forward it to `SectionHeader lede`. Story `WithLede`.
   Dev had it; spec §9.3 does not forbid it.
2. **FaqSectionProps** `+ defaultOpen?: string[] | undefined`. Forward it to `Accordion defaultOpen`, which already
   exists in Plan 3a. `[]` opens none; the default stays the first item. Tests: "opens the questions named in
   defaultOpen", "opens none when defaultOpen is empty". Stories `SecondOpen`, `AllClosed`.
3. **OrderTrackerProps** `+ progressLabel?: string | undefined /* = "Order progress" */`. It is an accessible chrome
   label, passed as `aria-label` on `<StepTracker>`, whose props extend `ComponentProps<"ol">`. Test:
   `getByRole("list", { name: "Order progress" })`.
4. **DialogProps** `+ hasCloseButton?: boolean | undefined /* = true */`. When false, the close `IconButton` is not
   rendered (Escape and the scrim still close). Test "drops the close glyph when the decision must be answered". Story
   `MustBeAnswered`.
5. **DialogProps** `+ className?: string | undefined`. Merge it into the `content` slot. Dev had it; the contract's
   `DialogProps` extends no native props. Test: the caller class replaces `rounded-xl`.
6. **MenuListProps** `+ defaultCategory?: string | undefined`. It is the initial chosen option of the `MenuListFilter`
   leaf, and a string is serialisable. It falls back to `allLabel` when it is not among the options. Test "opens on the
   caller's default category". Story `PreselectedCategory`.
7. **MenuListProps** `+ lede?: ReactNode | undefined`. Forward it to `SectionHeader lede`. Story `WithLede`.

## Cross-plan notes

- **Plan 3a Accordion.** On dev, the Accordion took `headingLevel` (questions rendered as headings, default 3), and
  FaqSection passed its own level + 1. Plan 3a renders questions in `<summary>` with no heading level. If Plan 3a adds
  one, FaqSection should forward `headingLevel + 1`, which needs a contract change.
- **Plan 3a StepTracker.** Dev had `label` naming the `<ol>`. Delta 3 relies on `aria-label` passing through
  `ComponentProps<"ol">`.
- **Plan 3a Stat.** The new StatBand tests read Stat's classes: `text-text-brand` / `text-text-on-inverse` on the value,
  `text-center` on the root. Task 0 must patch them if Stat's classes change.
- **Plan 2a IconButton `count`.** Dev SiteHeader put the cart count into the button's name ("Your order, 2 items") and
  hid it at 0. Plan 4 leaves this to IconButton's `count`, so Plan 2a should cover count = 0 hidden and the count being
  read with the label.
- **Plan 3b ReviewCard.** Dev TestimonialWall asserted that the component wraps a quote in “…” marks. That belongs in
  ReviewCard's test. Plan 3b's own `GOOGLE_REVIEWS` fixture, at about line 1962, still has the one-`a` "Pink Paprika"
  inside the review and needs the R17 elision.
- **Plan 2b Rating.** The TestimonialWall tests match the Rating name `/out of 5$/`.
- **Plan 2c AppShell.** The Dialog `InsideAPhoneFrame` story uses the same `contain-layout` containment that AppShell's
  frame has. This replaces dev's `position="container"` variant on Dialog and CartPanel.

## Concerns

- The plan's "Expected: PASS (N tests)" counts were inconsistent. CtaBand said 7 for 9 expanded tests; SiteFooter said
  12 for 11. I set every count I touched to the expanded `it.each` count.
- Two design-system choices override dev behaviour a reviewer might expect to keep: CartPanel shows the unit price, not
  the line total (D2), and TestimonialWall defaults to `variant="default"` (D1). Both follow the current design-system
  jsx. I ruled DROP; the owner can revisit.
- The 11 pending rows leave real dev behaviour unbuilt until the controller rules on deltas 1–7. The most user-visible
  are FaqSection `defaultOpen`, Dialog `hasCloseButton` and MenuList `defaultCategory`.
