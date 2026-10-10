# Plan 3b final fix wave — report (base 6ca22f3)

Scope: `W/final-fix-wave-3b.md` items 1–29 (R105–R109; 22–23 owner feedback, 24–25 controller
additions, 26–28 from the re-review, 29 owner ruling R109). Status: DONE.
- Items 1–21 landed in `6ca22f3..eed7609` (23 commits).
- Items 22–25 landed in `eed7609..c307865` (5 commits).
- Items 26–28 landed in `c307865..180db64` (3 commits).
- Item 29 landed in `172c9da`.
- Every gate is green cold on `172c9da`. The item 26 design note is resolved by R109.

- Items 1–21: `6ca22f3..eed7609`.
- Items 22–25: `eed7609..c307865`.
- Items 26–28: `c307865..180db64`.
- Item 29: `172c9da`.

Every gate is green cold on `172c9da`. R109 settles the item-26 design note.

Commands: plays `pnpm nx test @pink-paprikaa-web/storybook -- <fragment>`; unit
`pnpm nx test @pink-paprikaa-web/ui -- <fragment>`. Screenshots (throwaway, git-ignored):
`W/final-fix-wave/*.png`, made by `W/final-fix-wave/focus.mjs` against `storybook:serve`.

## Commits

| SHA | Subject | Items |
| --- | ------- | ----- |
| 46e6482 | fix(ui): keep the coupon stub and filter rail focus rings inside their clip | 1 |
| 6a8a595 | fix(ui): read a choice card's offer with its option and show it whole at 360 | 2 |
| dad069c | feat(ui): give the chip group a focusable ref for react-hook-form's controller | 3 |
| 702297e | fix(ui): allow role=list in the lint config and give every unstyled list one | 4 |
| 5a404dd | test(ui): add the invalid check-card stories with computed-style plays | 5 |
| e67e5bc | test(ui): restore every spy before each test instead of at the end of one | 6 |
| 8156d94 | test(ui): name the segmented chip group apart and stack the surfaces frame at 360 | 7 |
| 6be92b1 | fix(ui): clip a table without a floor instead of making its frame scroll | 8 |
| 76370c3 | refactor(ui): gate the 3b ReactNode slots on isShown | 9 |
| 7771af8 | fix(ui): keep a disabled unticked check-card box outlined in ink-400 | 10 |
| 0391aae | fix(storybook): keep the docs prose inside a 360px page | 11 |
| d8b44a4 | test(ui): pin the booking-rules value column at the 360 floor | 12 |
| 5f779f5 | refactor(ui): draw every struck price with one shared StruckPrice | 13 |
| 7f30c15 | feat(ui): let a struck price's hidden word be overridden | 13 |
| 3a246ac | docs: draw plan 4's quote panel struck price with StruckPrice | 13 |
| ecd8ca4 | docs: record the filter bar's dropped name and onBlur as deviation 19 | 14 |
| 3772123 | fix(ui): wire a check card into field without a second label | 15 |
| 6393bad | test(ui): read the check and choice card colours through story-paint | 16 |
| b644ec6 | docs(ui): say why in the highlighted table column's header text | 17 |
| 543d04b | test(ui): format the feature item story's locked price with formatRupees | 18 |
| 1e35438 | refactor(storybook): drop the docs tables' history comments | 19 |
| 84e2ac9 | fix(ui): read an announcement's countdown lead-in once | 20 |
| eed7609 | docs(ui): state the chip group's keyboard model and that both groups skip field | 21 |
| 0b0cf51 | fix(ui): bound a choice card's badge by its tile, not its own text | 22 |
| f91bdf2 | fix(storybook): name each scrolling docs table by its caption or heading | 23 |
| e22a8e6 | fix(storybook): give storybook:test the canvas's layout gutter | 24 |
| c307865 | test(ui): drop the coupon ticket's redundant restoreAllMocks | 25 |
| a470b8d | fix(ui): wrap a choice card's badge instead of truncating it | 26 |
| fa1b617 | fix(storybook): keep docs table region names unique across headings and resizes | 27 |
| 180db64 | docs(ui): note the filter bar rail's 4px gutter need | 28 |
| 172c9da | test(ui): give the 360 plan-length badge copy that never breaks mid-word | 29 |
| 172c9da | test(ui): give the 360 plan-length badge copy that never breaks mid-word | 29 |

## Items

### 1 — I1 focus rings clipped by overflow (46e6482)

- CouponTicket: copyable stub gets `focus-visible:-outline-offset-4` (inset ring); the stub's
  corners follow the ticket's (`md`: `rounded-b-xl` stacked, `sm:rounded-tr-xl sm:rounded-bl-none`
  split; `lg`: `rounded-r-xl`) so the inset ring's corners are not cut by the root's rounded clip.
  No visual change: the root already clipped the stub to those corners.
- FilterBar (scrolling): group `-m-1 p-1 pb-2 scroll-px-1` (was `pb-1`): the ring lives in the
  scroller's padding, `-m-1` keeps the rail in place (same 4px under the chips), `scroll-px-1`
  makes a chip scrolled into view leave ring room.
- Plays: `CouponTicket › StubFocusRing` (+ `StubFocusRingNarrow`, floor360, stacked) and
  `FilterBar › Scroll` (Tab → first chip; End → last chip, rail scrolled to its end). A local
  `ringClippers(el)` helper inflates the element rect by `outlineWidth + outlineOffset` and returns
  every `overflow` ancestor whose padding box cuts it (1px slack: scroll extents are whole pixels —
  measured: last chip ring 0.1px past at max scroll). Each play also asserts `:focus-visible`.
- RED (old code): `Tests 3 failed | 13 passed (16)` — `× Stub Focus Ring`, `× Stub Focus Ring
  Narrow`, `× Scroll`, each at the `ringClippers(...)).toEqual([])` line.
- GREEN: `Tests 16 passed (16)`; ui `coupon-ticket filter-bar` 23 passed.
- Screenshots: `coupon-brand-focus.png`, `coupon-light-360-focus.png`, `filter-scroll-focus.png`,
  `filter-scroll-end-focus.png` — whole rings.

### 2 — I2 + carried 8 + carried 12, ChoiceCardGroup offer wording (6a8a595)

- `badge` and `meta` are wrapped (only when `isShown`) in `span#${id}-badge` / `span#${id}-meta`
  (`flex`), and joined into the radio's `aria-describedby` after the description
  (description, meta, badge). The meta wrapper is `flex max-w-full **:whitespace-normal`, so a
  Badge (nowrap + truncate by design) wraps inside a 150px tile instead of truncating.
- Unit: "names each radio by its title and price, and describes it with its blurb and badge"
  (Classic → "The full Pink Paprikaa menu. Our recommendation. Pick"; Everyday unchanged) and new
  "reads an option's meta line in its description, so an offer is never silent" (with and without
  a description).
- Play `PlanLengths` (floor360): card no overflow (kept) + every "Offer: +1 free / month" label
  `scrollWidth <= clientWidth` + Weekday/Full month `toHaveAccessibleDescription(/Offer: \+1 free \/ month/i)`.
- RED: ui `2 failed | 18 passed (20)`; storybook `× Plan Lengths` at the badge `scrollWidth` line.
- GREEN: ui 20 passed; storybook 10 passed. Screenshot `plan-lengths-360.png` (badge on two lines).

### 3 — I3 ChipGroup focusable ref (dad069c)

- `ref?: Ref<HTMLDivElement> | undefined` on `ChipGroupBaseProps`, forwarded to `ToggleGroup.Root`
  in both Single and Multiple groups. JSDoc names it RHF's `field.ref`.
- Unit: "gives react-hook-form's Controller a name, onBlur and a focusable ref" (single: ref is the
  radiogroup, hidden input `meals=dinner`, `ref.current.focus()` lands on the chosen "Dinner",
  Tab out → `onBlur` once) and "focuses the first chip through its ref when nothing is chosen yet"
  (multiple → "Chilli Potato").
- RED: `2 failed | 19 passed (21)` (`expected null to be <div …>`). GREEN: 21 passed; ui typecheck ok.

### 4 — carried 1 + Minor 2, list roles (702297e)

- `tools/eslint-config/react.js`: `"jsx-a11y/no-redundant-roles": ["error", { nav: ["navigation"], ol: ["list"], ul: ["list"] }]`
  (default `nav` entry kept). The only `eslint-disable` in `packages/ui` (`steps.tsx`) is gone.
  StepTracker's `ol` and PricingCard's points `ul` get `role="list"`.
- Tests: new `tools/eslint-config/react.test.mjs` (lints probes with the preset's own setting:
  `ol/ul role=list` and `nav role=navigation` pass; `button role=button`, `li role=listitem` still
  flagged; any non-rule message fails the probe). ui: "keeps its unstyled steps a list for Safari…"
  (StepTracker) and "keeps its unstyled points a list for Safari…" (PricingCard).
- RED: ui `2 failed | 23 passed (25)`; eslint-config probe with the old `{ nav }` setting:
  `✖ allows role=list on a list…`. GREEN: ui 33 passed (steps + step-tracker + pricing-card);
  `nx run @pink-paprikaa-web/eslint-config:test` pass 11 fail 0; eslint on the three folders clean.

### 5 — carried 2, CheckCard invalid stories (5a404dd)

- Stories `Invalid` and `InvalidChecked` (caller message joined via `aria-describedby`). Plays read
  card + box `borderTopColor` == `paint(card, "borderColor", "--color-status-danger")`, card
  `boxShadow` `none` (Invalid) / not containing pink-500 (InvalidChecked), and the description.
- New stories over correct code, so RED is by mutation: removing `has-aria-invalid:has-checked:shadow-none`
  → `× Invalid Checked` at the boxShadow `toContain`; also removing `aria-invalid:border-status-danger`
  → `× Invalid`, `× Invalid Checked` at the border `toBe`. GREEN: 7 passed.

### 6 — carried 3, restoreMocks (e67e5bc)

- `packages/ui/vite.config.mts`: `restoreMocks: true`; per-test `vi.restoreAllMocks()` removed from
  `chip-group.test.tsx` ("rejects a limit…") and `pricing-card.test.tsx` ("refuses a struck price…").
- RED (throwaway probe, deleted): test A `vi.spyOn(console, "error")` and ends; test B
  `expect(vi.isMockFunction(console.error)).toBe(false)` → `1 failed | 1 passed`. GREEN with the
  config: `2 passed`. Full ui suite after: `Test Files 90 passed`, `Tests 1359 passed`.

### 7 — carried 4 + 9, ChipGroup OnSurfaces frame (8156d94)

- OnSurfacesStory: segmented copy `label="Meals per day"`; the groups' wrapper is
  `grid min-w-0 grow basis-full gap-3 sm:basis-0` (full row under the ground label below sm).
  Play: 5× radiogroup "Which meals" and 5× "Meals per day". New `OnSurfacesAt360` (floor360) runs
  the same play + `documentElement.scrollWidth <= clientWidth`.
- RED: label reverted → both stories fail at `toHaveLength` (names collide); frame reverted (label
  kept) → `× OnSurfaces at 360`, `expected 378 to be less than or equal to 360`. GREEN: 10 passed.

### 8 — carried 5, Table minWidth none (6be92b1)

- Frame base drops `overflow-x-auto`; `minWidth.none` → `overflow-clip` (still rounds the pink
  head), `sm/md/lg` → `overflow-x-auto` (the named focusable region). Alignment untouched (R105).
- Unit: "clips a table that never scrolls instead of making its frame a scroll container". Story
  `PlanVsAppAt360` (floor360): frame `overflowX === "clip"`, frame `scrollWidth <= clientWidth`, page
  no sideways scroll.
- RED: ui `1 failed | 9 passed (10)`; storybook `× Plan Vs App At 360`, `expected 'auto' to be 'clip'`.
  GREEN: ui 10, storybook table 8 passed.

### 9 — carried 6, isShown sweep (76370c3)

- `isShown` now gates StickyActionBar `caption`; MenuItemRow / MenuItemCard / OutletCard `action`;
  FilterBar `note` / `trailing`; ChoiceCardGroup `description`, `price`, `was` (and `meta`/`badge`
  from item 2). The `aria-describedby` id for the description is joined only when shown.
- Tests: per component "…whenever React would render it — a 0 counts, false does not"; ChoiceCardGroup
  "skips a slot React would not render — no empty span, nothing to describe or name it by"
  (`description={false}`, `price={null}`, `meta=""`, `badge={false}` → no `aria-describedby`,
  `aria-labelledby` title only, no empty span) and "shows a 0 price, as React renders it" (guard).
- RED: `6 failed | 76 passed (82)`. GREEN: 82 passed; ui typecheck ok.

### 10 — carried 7, CheckCard disabled unticked border (7771af8)

- Input adds `disabled:not-checked:border-ink-400` (ticked stays `ink-200` all over, as the
  DisabledChecked play pins).
- Play `Disabled`: box `borderTopColor` == ink-400 paint and `!== groundOf(box)`.
- RED: `× Disabled`, `expected 'rgb(236, 230, 232)' to be 'rgb(184, 171, 177)'`. GREEN: 7 passed;
  ui check-card 12 passed.

### 11 — docs prose at 360 (0391aae)

- `apps/storybook/src/docs-kit/prose.tsx`: `ProseTable` (MDX `table` override via
  `parameters.docs.components = PROSE_COMPONENTS` in `preview.tsx`) wraps the table in a
  `max-w-full overflow-x-auto` frame; a ResizeObserver makes the frame a named
  (`role="region" aria-label="Scrollable table"`), focusable region only while it actually scrolls
  (Table's semantics; a fitting table adds no tab stop).
- `styles.css`: `.sbdocs-content :not(pre) > code { white-space: normal; overflow-wrap: anywhere; }`
  (Storybook sets docs inline code `nowrap`, so one long token widened the page).
- Stories `ProseTableScrollsAt360` (floor360: region found, page `scrollWidth <= clientWidth`) and
  `ProseTableThatFitsAddsNoTabStop`.
- RED: probe at base (`W/final-fix-wave/docs-probe.mjs`) — Introduction page `scrollWidth 595`,
  Contrast `385` at 360; the new play failed before the override. GREEN: probe 360 / 360;
  `docs-sweep.mjs` — all 27 MDX docs pages `<= 360`; storybook typecheck + lint green.

### 12 — KeyValueList BookingRules at floor360 (d8b44a4)

- Story `BookingRulesAt360` (floor360): six `dd`, each value column `>= 128px`, page no sideways
  scroll.
- Finding: the Vitest browser runner does not apply Storybook's `padded` layout (body padding
  `0px`), so at floor360 the runner measured the value column at 164px (fixed frame) and **132px
  with the old `p-6`/`px-6` frame** — the naive play passed on old code (no RED). The canvas the
  review measured (padded, 16px a side) gives 132 / 100. The play therefore subtracts the missing
  gutter (`32 - body padding`, 0 in the Storybook UI) and states why in a comment.
- RED (old frame restored by sed, file restored after): `× Booking Rules At 360`,
  `expected 100 to be greater than or equal to 128`, `1 failed | 7 passed (8)`. GREEN: 8 passed.

### 13 — Minor 1, shared struck price (5f779f5, 7f30c15, 3a246ac)

- New `packages/ui/src/lib/struck-price.tsx`: `StruckPrice` (`<s>` in `text-text-subtle`, hidden
  `<span className="sr-only">{label}</span> {children}`, `label = "was"`) and
  `assertStruckAbove(component, was, price)` (the shared `RangeError`, same message). Colour:
  PriceTag's `text-subtle`; it is AA-checked on every surface in `contrast-pairs.json`
  (light/brand/ink/soft groups, plus `text-subtle` on `surface-page-alt` = pink-50, the checked
  choice card). No new token.
- PriceTag and PricingCard use both (their own size classes only; PricingCard's `text-muted`
  goes). ChoiceCardGroup uses `StruckPrice` (its `was` is a ReactNode, so no numeric guard — JSDoc
  says it must be higher); its struck price was inheriting heading / pink-700 and is now
  `text-subtle`, greyed with a disabled card via `group/card` + `group-has-disabled/card:text-ink-400`.
- `label` (7f30c15) exists so Plan 4's QuotePanel keeps its overridable `wasLabel` (the plan's
  chrome-label rule) while drawing through the helper.
- Plan 4 doc (3a246ac): QuotePanel deviation row and code — `wasLabel = "was"`, imports
  `StruckPrice`, `was` slot `text-body-sm` (colour and line-through now come from the helper), the
  test expects `"was ₹140"`. The rest of that diff is Prettier re-padding the widened table row.
- Tests: `lib/struck-price.test.tsx` (6: subtle + hidden lower-case word, `label`, colour override,
  guard pass, guard throws ×2); PricingCard "draws the struck price with the shared StruckPrice…";
  ChoiceCardGroup "…in text-subtle like PriceTag" and "greys a disabled card's struck price…".
- RED: `3 failed` (PricingCard muted, ChoiceCardGroup no colour / no disabled grey); `label` test
  `1 failed | 5 passed (6)`. GREEN: ui struck-price + price-tag + pricing-card + choice-card-group
  67 passed; storybook price-tag + pricing-card + choice-card-group 24 passed; ui lint + typecheck ok.
- Probed and rejected: a comment claiming Chromium drops a trailing space inside the sr-only word.
  Mutating to `was </span>{children}` still passed the PlanLengths name play, so the claim was
  unproven and the comment was removed before commit.

### 14 — Minor 3, FilterBar deviation 19 (ecd8ca4)

- 3b plan "Contract deviations": row 19 (FilterBar: contract `name`/`onBlur` for `<Controller>`
  (R32, D17) → `value`/`onValueChange` only, R99; why + cost if wrong). The FilterBar task's
  "Produces" line cites deviations 6 and 19.
- Spec D17: FilterBar leaves the Controller list, with a parenthetical pointing to deviation 19.
- Contract §6 (`ds-00-contracts.md` FilterBarProps): `name`/`onBlur` removed, comment cites
  deviation 19 / R99. Docs only (no RED).

### 15 — Minor 4, CheckCard with Field (3772123)

- JSDoc on `isInvalid`: with Field pass on `aria-describedby` and `aria-invalid`, never `id`
  (Field's `<label htmlFor>` would label the input twice).
- Test "takes Field's error…" now passes those two props only and asserts
  `checkbox.labels` has length 1.
- RED (assertion added, old `{...control}` shape): `expected …(2) to have a length of 1 but got 2`.
  GREEN: check-card 12 passed.

### 16 — Minor 5, shared paint in 3b stories (6393bad)

- CheckCard `DisabledChecked` and ChoiceCardGroup `WithError` drop their hand-rolled probes for
  `lib/story-paint`'s `paint(el, prop, token)`.
- Refactor: GREEN 17 passed. Mutation check that the shared probes still bite (removing
  `disabled:bg-ink-200` from the box, and `in-aria-invalid:border-status-danger` from the light
  card): `× Disabled Checked`, `× With Error`; restored.

### 17 — Minor 7, Table highlighted column (b644ec6)

- `TableHeaderCell.isHighlighted` JSDoc: colour alone does not say why (WCAG 1.4.1); say it in the
  header text, e.g. "Classic · Our pick". The Table docs description says the same. JSDoc only.

### 18 — Minor 8, FeatureItem story amount (543d04b)

- "Join at ${formatRupees(130)} and it stays ${formatRupees(130)}…". GREEN: feature-item plays 5 passed.

### 19 — Minor 9, docs-kit history comments (1e35438)

- Dropped the DocTable→Table width notes in `contrast-matrix.tsx` and `token-table.tsx`.

### 20 — Minor 10, AnnouncementBar countdown lead-in (84e2ac9)

- `countdownLabel` JSDoc: omit it when the message already leads into the countdown
  ("… · closes in"). The a11y fixture and the stories' meta args drop `countdownLabel`.
- Test: the link's text contains "closes in" once.
- RED: `expected [ 'closes in', 'closes in' ] to have a length of 1 but got 2`. GREEN: ui 9 passed,
  storybook announcement-bar 4 passed.

### 21 — review recommendations, JSDoc (eed7609)

- ChipGroup: a single group is a radiogroup that does not choose on focus (an arrow only moves;
  Space/Enter choose), as FilterBar's docs say (R100).
- ChipGroup and ChoiceCardGroup: own `status`/`message`; do not wrap in Field (the group names
  itself; ChipGroup takes no `aria-invalid`, ChoiceCardGroup drops a caller's).

### 22 — owner: ChoiceCardGroup badge overflows its tile (0b0cf51)

- `choice-card-group.tsx` slot `badge: "flex min-w-0 max-w-full"`: the wrapper is bounded by the
  head, so the Badge's own `max-w-full` measures the tile and its label truncates inside it.
- Story helper `expectBadgesInsideTheirCards`: for every `[id$='-badge'] > *` (the Badge itself,
  not the meta line), right edge `<=` the card's content right (rect right − border − padding) and
  `scrollWidth <= clientWidth`.
- `PlanLengths` (floor360) gains `badge: <Badge tone="brand">Our recommendation</Badge>` on
  Weekday, plus the helper and "Our recommendation" in Weekday's accessible description. The item 2
  checks still pass: every offer label fits and "Offer: +1 free / month" is in both descriptions.
- New `LongBadgeInNarrowTile`: a `w-37.5` frame, so the tile is asserted to be exactly 150px; a long
  "Offer: +1 free / month" badge; helper plus accessible description.
- RED (old `badge: "flex"`): `× Plan Lengths` `expected 200 to be less than or equal to 174`;
  `× Long Badge In Narrow Tile` `expected 203.21875 to be less than or equal to 137`
  (`2 failed | 9 passed (11)`). GREEN: storybook 11 passed, ui choice-card-group 24 passed, eslint
  clean.

### 23 — owner: scrolling docs tables share one name (f91bdf2)

- `apps/storybook/src/docs-kit/prose.tsx`: while the frame scrolls it is `aria-labelledby` its
  table's `<caption>`. Without a caption it uses the nearest heading above it that is shown and has
  words (`checkVisibility()`, non-empty text), so Storybook's own hidden preview headings ("No
  Preview", an empty `#error-message`, which the first attempt picked up) are skipped. The source
  gets `${useId()}-name` when it has no id. A second scrolling table under the same source adds a
  hidden `${useId()}-ordinal` span ("table 2"), counted via `data-name-source`. "Scrollable table"
  (`aria-label`) is used only when no source exists, and is still covered by
  `ProseTableScrollsAt360`.
- The prose stories move to `docs-kit/prose.stories.tsx` ("Introduction/Docs prose", hidden):
  `docs-kit.stories.tsx` had crossed the 500-line `max-lines` warning.
- New `ProseTablesNamedApart` (floor360) has an h2 "Layers" with two tables (the second captioned
  "Build outputs") and an h2 "Packages" with two tables. The play finds regions named "Layers",
  "Build outputs", "Packages" and "Packages table 2", and checks every id on the page is unique.
  axe runs through the preview's `a11y.test = "error"`.
- RED (old prose.tsx): `Unable to find role="region" and name "Layers"`. A probe that only counted
  the four regions failed axe with `landmark-unique`. GREEN: docs-kit + prose 169 passed;
  storybook typecheck + eslint clean.
- Real docs pages (`W/final-fix-wave/docs-regions.mjs` against `storybook:serve`, 360): regions
  "Examples" (brand-voice-content) and "Form states" (motion-form-states); 27 pages, 0 with
  duplicate region names.

### 24 — controller: 360 plays ran 32px wider than the canvas (e22a8e6)

- Root cause: addon-vitest renders stories (`composeStory(...).run()`) without Storybook's
  `iframe.html`. That page's `base-preview-head.html` holds the layout CSS (`.sb-main-padded`
  body `padding: 1rem`, `.sb-main-centered #storybook-root` `padding: 1rem`), and the runner's body
  has neither the classes nor the CSS (debug: `body.className ""`, canvas width 360).
- Central fix in `.storybook/preview.tsx`: a project `beforeEach`, active only under Vitest
  (`"__vitest_browser__" in globalThis`, the flag addon-vitest itself checks), sets body
  `box-sizing: border-box` and `padding: 1rem`, or `0` for `fullscreen`, and removes both on
  cleanup. Stories viewed in Storybook are untouched (`iframe.html` already pads them).
- New contract stories `docs-kit/canvas.stories.tsx` ("Introduction/Canvas geometry", hidden,
  floor360): `PaddedLeaves328` (a `w-full` fill is 328), `CenteredLeaves328` (≤ 328) and
  `FullscreenLeaves360` (360).
- RED: `expected 360 to be 328`, `expected 360 to be less than or equal to 328`
  (`2 failed | 1 passed (3)`). GREEN: 3 passed.
- `BookingRulesAt360` drops its manual subtraction and plainly asserts ≥ 128. With the old frame
  (`p-6`/`px-6`) it still fails, `expected 100 to be greater than or equal to 128`, so the gap is
  closed centrally.
- Full storybook suite at the canvas geometry: `85 files, 792 tests passed`. **No play newly
  failed**, so no 360 defect surfaced and no component changed.

### 25 — controller: coupon-ticket's redundant restore (c307865)

- `coupon-ticket.test.tsx` `afterEach` keeps `vi.useRealTimers()` and drops
  `vi.restoreAllMocks()`, because `restoreMocks: true` (item 6) restores every spy before each
  test. No 3b test file has one left (`rg` finds only 3a's toast/slot-picker `mockRestore` and
  2c's post-frame, out of scope). GREEN: coupon-ticket 14 passed. This is a removal with no
  behaviour change, so there is no RED.

### 26 — R108: the ChoiceCardGroup badge wraps, never truncates (a470b8d)

- The re-review was right. Item 22's `scrollWidth` check read the Badge root, which never
  overflows: the Badge's label is the `min-w-0 truncate` part. So that half of the check could not
  fail.
- Story helper renamed to `expectBadgesWhole(canvasElement, wordings)`. It measures each
  **label** (`[id$='-badge'] > * > :last-child`) for three things:
  - its `textContent` equals the full wording;
  - its right edge is inside the card's content box;
  - `scrollWidth <= clientWidth`.
- `PlanLengths` (floor360) expects `["Our recommendation"]`. `LongBadgeInNarrowTile` (exactly
  150px) expects `["Offer: +1 free / month"]`.
- RED on c307865 (component untouched, new helper): `× Plan Lengths`
  `expected 168 to be less than or equal to 114`; `× Long Badge In Narrow Tile`
  `expected 170 to be less than or equal to 104`.
- Fix, for this use only (the Badge atom is unchanged): the badge slot is
  `flex max-w-full min-w-0 **:wrap-anywhere **:whitespace-normal`. Item 22's bound stays.
  - `whitespace-normal` alone (meta's fix) still failed: `expected 135 to be less than or equal
    to 114`. The single word "RECOMMENDATION" is 135px and the label at 360 is 114px.
  - `wrap-anywhere` follows PricingCard's name precedent: a word wider than its box breaks rather
    than clipping.
- GREEN: storybook choice-card-group + badge 17 passed; ui choice-card-group 24 passed; eslint
  clean.
- Live check (`badge-shot.mjs`, storybook:serve at 360): labels `114/114` and `104/104`. In
  `badge-plan-lengths-360.png` the pill reads "OUR / RECOMMENDATI / ON", all inside the tile; in
  `badge-narrow-tile.png` it reads "OFFER: +1 FREE / MONTH" over two lines.

### 27 — re-review M1: region names unique across same-text headings and resizes (fa1b617)

- `prose.tsx` now has a module-level registry (`Set<ProseRegion>`). Any table that starts or
  stops scrolling, mounts or unmounts triggers `renameRegions()`.
  - It names every scrolling table in document order, and the ordinal counts the name's **words**,
    not its source element.
  - Two headings "Examples" (ids `examples`, `examples-1`) therefore give "Examples" and
    "Examples table 2".
  - The generic fallback is counted the same way ("Scrollable table 2").
  - Headings inside an embedded story preview (`.docs-story`) are skipped.
- New `ProseTableNamesStayUnique` (floor360) renders two h2 "Examples" with explicit
  rehype-slug-style ids, then an h2 "Packages" over a table that fits and a table that scrolls.
  - The play expects `["Examples", "Examples table 2", "Packages"]`.
  - It then widens the fitting table to 600px (a resize) and `waitFor`s
    `["Examples", "Examples table 2", "Packages", "Packages table 2"]`.
  - axe (`landmark-unique`) runs after the play.
- RED (old prose.tsx), same-text headings: `expected [ 'Examples', 'Examples', 'Packages' ]`.
- RED, resize half isolated (second heading temporarily "Other examples", restored): received
  `…, "Packages", "Packages"`. The late-scrolling table repeated the name.
- GREEN: prose + docs-kit 173 passed; storybook typecheck and eslint clean. Two lint findings on
  the first draft were fixed in the code, not suppressed: `naming-convention` on a boolean, and an
  unnecessary `??`.
- Real docs (`docs-regions.mjs`, probe fixed to read every `.sbdocs-content [role=region]`):
  27 pages, 0 with duplicate region names. The library Table's regions are included.

### 28 — re-review M2: FilterBar gutter note (180db64)

- `isWrapping` JSDoc: the scrolling rail's `-m-1` (focus-ring room) reaches 4px past its box. Its
  parent therefore needs at least 4px of padding (a Container's gutter gives it), as Cluster's
  rail does, or it widens the page. JSDoc only.

### 29 — R109: badge copy "Our pick" (172c9da)

**Assertion.** The new story helper `wordsBrokenMidWord(label)` walks the label's text node one
character at a time with a `Range`. When a new line starts (`rect.top` drops by more than 1px) and
neither side of the break is a space, it records the word. `expectNoMidWordBreaks` runs it on every
badge label and every meta label in the cards (`[id$='-badge']`, `[id$='-meta']`). This measures
the rendered lines directly; it does not infer them from widths.

`PlanLengths` (floor360) calls it after `expectBadgesWhole`. Meta "Offer: +1 free / month" wraps
at spaces and passes, so there is no false positive.

**RED** on 180db64 (component and copy untouched, assertion only): `× Plan Lengths`,
`expected [ 'recommendation' ] to deeply equal []`.

**Copy.** The PlanLengths Weekday badge is now `<Badge tone="brand">Our pick</Badge>`. The play's
accessible-description regex and the `expectBadgesWhole` wording are updated to match.

`wrap-anywhere` stays on the badge slot as the safety net. `LongBadgeInNarrowTile` (150px) still
pins whole wording.

**GREEN:** storybook choice-card-group 11 passed, eslint clean.

**Sweep, case-insensitive across the 3b ChoiceCardGroup stories, plays and fixtures.** The only
badge use was PlanLengths, now changed. Two hits remain, kept on purpose:

- `PLATES[1].description` in the stories and the unit test reads "The full Pink Paprikaa menu.
  Our recommendation."
- The unit test's expected description is "… Our recommendation. Pick".

Both are description prose, not badge copy. They are `text-caption` with normal wrapping and no
`wrap-anywhere`, so they cannot break mid-word, and Plates' badge is already "Pick". R109 rules
only on badge copy that breaks.

## Gates — fourth pass (item 29)

At final HEAD `172c9da`, cold (`--skip-nx-cache`). Logs: `W/final-fix-wave/gate4-{1..4}.log`.

- `pnpm nx format:check && pnpm nx sync:check`: pass.
- `pnpm nx run-many -t typecheck lint test build --skip-nx-cache --outputStyle=static`:
  "Successfully ran targets typecheck, lint, test, build for 12 projects and 1 task they depend
  on", exit 0.
  - Tests: ui 91 files / 1376 · storybook 85 / 793 · design-tokens 4 / 284 · content 2 / 20 ·
    utils 1 / 18 · eslint-config 11 (node:test) · seo 1 / 1 · image-pipeline 1 / 1.
  - Warnings: the same 2 pre-existing `playwright/no-conditional-in-test` in `apps/blog-e2e`, plus
    Vite's chunk-size note.
- `pnpm nx run storybook:test --skip-nx-cache`: 85 files / 793 tests passed, exit 0. No "Failed to
  fetch dynamically imported module", so no re-run.
- `pnpm guard:founder` (after the builds): "Founder-name guard: clean."

### 29 — R109: badge copy "Our pick" (172c9da)

- The `wrap-anywhere` safety net from item 26 stays in the badge slot.
- Sweep for "Our recommendation" (case-insensitive) in `molecules/choice-card-group/`:
  - **Changed.** The `PlanLengths` (360) Weekday **badge** becomes `<Badge tone="brand">Our
    pick</Badge>`, and its play now expects `/Our pick/i` in the accessible description and
    `["Our pick"]` in `expectBadgesWhole`.
  - **Kept.** The `PLATES` Classic **description**, "The full Pink Paprikaa menu. Our
    recommendation.", appears in the stories and in the unit test (description and its expected
    accessible description). It is caption body text, not a Badge: it wraps at spaces, has no
    `wrap-anywhere`, and cannot break mid-word. R109 rules on badge copy only.
  - No badge or play elsewhere in 3b carries the string. The table and pricing-card "Our
    recommendation" fixtures are other components.
- New play helpers `wordsBrokenMidWord(label)` and `expectNoMidWordBreaks(canvasElement)`.
  - `wordsBrokenMidWord` walks the label's text node one character at a time with a `Range`. A
    glyph whose line top is lower than the previous glyph's, with no space on either side of the
    break, means the line started mid-word, and that word is returned.
  - `expectNoMidWordBreaks` runs the check on every badge and meta label in the cards. The
    `PlanLengths` 360 play calls it after `expectBadgesWhole`.
  - Legitimate wraps at spaces pass: "Offer: +1 free / month" over two lines.
- RED on 180db64 (copy unchanged, assertion added): `× Plan Lengths`,
  `expected [ 'recommendation' ] to deeply equal []`. GREEN after the copy change: storybook
  choice-card-group 11 passed; eslint clean.

## Gates — fourth pass (item 29)

At final HEAD `172c9da`, cold (`--skip-nx-cache`). Logs: `W/final-fix-wave/gate4-{1..4}.log`.

- `pnpm nx format:check && pnpm nx sync:check` — pass.
- `pnpm nx run-many -t typecheck lint test build --skip-nx-cache --outputStyle=static` —
  "Successfully ran targets typecheck, lint, test, build for 12 projects and 1 task they depend
  on", exit 0.
  - Tests: ui 91 files / 1376 · storybook 85 / 793 · design-tokens 4 / 284 · content 2 / 20 ·
    utils 1 / 18 · eslint-config 11 (node:test) · seo 1 / 1 · image-pipeline 1 / 1.
  - Warnings: the same 2 pre-existing `playwright/no-conditional-in-test` in `apps/blog-e2e`, plus
    Vite's chunk-size note.
- `pnpm nx run storybook:test --skip-nx-cache` — 85 files / 793 tests passed, exit 0. There was no
  "Failed to fetch dynamically imported module", so no re-run.
- `pnpm guard:founder` (after the builds) — "Founder-name guard: clean."

## Gates — third pass (items 26–28)

At final HEAD `180db64`, cold (`--skip-nx-cache`). Logs: `W/final-fix-wave/gate3-{1..4}.log`.

- `pnpm nx format:check && pnpm nx sync:check` — pass.
- `pnpm nx run-many -t typecheck lint test build --skip-nx-cache --outputStyle=static` —
  "Successfully ran targets typecheck, lint, test, build for 12 projects and 1 task they depend
  on", exit 0.
  - Tests: ui 91 files / 1376 · storybook 85 / 793 · design-tokens 4 / 284 · content 2 / 20 ·
    utils 1 / 18 · eslint-config 11 (node:test) · seo 1 / 1 · image-pipeline 1 / 1.
  - Warnings: the same 2 pre-existing `playwright/no-conditional-in-test` in `apps/blog-e2e`, plus
    Vite's chunk-size note.
- `pnpm nx run storybook:test --skip-nx-cache` — 85 files / 793 tests passed, exit 0. There was no
  "Failed to fetch dynamically imported module", so no re-run.
- `pnpm guard:founder` (after the builds) — "Founder-name guard: clean."

## Gates — second pass (items 22–25)

At final HEAD `c307865`, cold (`--skip-nx-cache`). Logs: `W/final-fix-wave/gate2-{1..4}.log`.

- `pnpm nx format:check && pnpm nx sync:check` — pass.
- `pnpm nx run-many -t typecheck lint test build --skip-nx-cache --outputStyle=static` — "Successfully
  ran targets typecheck, lint, test, build for 12 projects and 1 task they depend on", exit 0.
  Tests: ui 91 files / 1376 · storybook 85 / 792 · design-tokens 4 / 284 · content 2 / 20 ·
  utils 1 / 18 · eslint-config 11 (node:test) · seo 1 / 1 · image-pipeline 1 / 1. Warnings: the
  same 2 pre-existing `playwright/no-conditional-in-test` in `apps/blog-e2e` and Vite's chunk-size
  note.
- `pnpm nx run storybook:test --skip-nx-cache` — 85 files / 792 tests passed, exit 0; no "Failed to
  fetch dynamically imported module", no re-run.
- `pnpm guard:founder` (after the builds) — "Founder-name guard: clean."

## Gates — first pass (items 1–21)

At final HEAD `eed7609`, cold (`--skip-nx-cache`). Logs: `W/final-fix-wave/gate-{1..4}.log`.

- `pnpm nx format:check && pnpm nx sync:check` — pass ("All files are up to date").
- `pnpm nx run-many -t typecheck lint test build --skip-nx-cache --outputStyle=static` — "Successfully
  ran targets typecheck, lint, test, build for 12 projects and 1 task they depend on", exit 0.
  Tests: ui 91 files / 1376 · storybook 83 / 787 · design-tokens 4 / 284 · content 2 / 20 ·
  utils 1 / 18 · eslint-config 11 (node:test) · seo 1 / 1 · image-pipeline 1 / 1. Lint warnings:
  2 × `playwright/no-conditional-in-test` in `apps/blog-e2e/src/blog.spec.ts` (untouched,
  pre-existing) and Vite's chunk-size note.
- `pnpm nx run storybook:test --skip-nx-cache` — 83 files / 787 tests passed, exit 0. No "Failed to
  fetch dynamically imported module", so no re-run.
- `pnpm guard:founder` (after the builds) — "Founder-name guard: clean."

## Concerns

Fourth pass (item 29): none open. The item 26 design note is resolved by R109.

Fourth pass (item 29): none open. The third-pass design note is resolved by R109.

Third pass (items 26–28): one design note.
- R108 makes the badge wrap. At 360 the single word "RECOMMENDATION" (135px) is wider than the
  badge label's 114px, so it breaks mid-word: "RECOMMENDATI / ON" (`badge-plan-lengths-360.png`).
  Nothing is lost and nothing overflows, but it reads poorly.
- It is a copy or type call, so it is left as is. Options: shorter badge copy for tiles ("Our
  pick"), or a smaller badge type size inside cards.

Second pass (items 22–25): none open. Item 24 surfaced no new 360 failure. The badge in a 150px
tile now truncates visibly ("OFFER: +1 FREE / M…"), as Badge is designed to, while the whole
wording stays in the option's accessible description. If the owner would rather it wrap like the
meta line, add `**:whitespace-normal` to the badge slot; that is a design call.

First pass (kept for the record; 1 → item 24, 5 → item 25, 2–3 accepted, 4 → Plan 4 Task 0):

1. **The test runner draws no `padded` gutter (item 12).** In the Vitest browser runner the body
   has `0px` padding, so every floor360 play sees 32px more width than the Storybook canvas. The
   BookingRules play compensates explicitly. Other floor360 plays (2b–3b) are 32px more lenient in
   CI than what a reviewer sees. That is worth one shared fix (e.g. a preview decorator or
   runner CSS for `sb-main-padded`), which is outside this wave.
2. **Struck-price colour changes (item 13).** PricingCard's flooded card moves from
   `white-alpha-92` to `white-alpha-85`, and the checked choice card's struck price from pink-700
   to ink-600. Both are AA-listed pairs, but they are visible changes the owner has not seen.
3. **Table fixtures (item 17).** The highlighted headers in the Table stories ("Signature ₹199",
   "Classic · ₹130", "Pink Paprikaa plan") don't yet say why. That is copy, so only the JSDoc
   changed.
4. **Plan 4's handoff header (item 20).** The review says it also passes both "· closes in" and
   `countdownLabel`. The wave only asked for the JSDoc and the 3b fixture, so the Plan 4 doc is
   unchanged.
5. **Spy restores left in place (item 6).** `coupon-ticket.test.tsx`'s `afterEach` still calls
   `vi.restoreAllMocks()`, which is now redundant but harmless. 3a's toast and slot-picker
   `mockRestore` and post-frame's `afterEach` are outside 3b scope.
