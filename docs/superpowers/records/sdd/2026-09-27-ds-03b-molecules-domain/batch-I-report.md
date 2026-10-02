# Batch I report: carried fix I1, then Plan 3b Task 21 (tier parity)

## Status — DONE_WITH_CONCERNS (2026-10-02)

Base `e796d35`. Screenshots in `W/parity/` (git-ignored, never committed). Tooling there:
`shoot.mjs` + `jobs.mjs` (source crops and story shots per component), `probe.mjs` (computed
values), `dump.mjs` (text anchors), `overflow.mjs` (page `scrollWidth` at 360 for every story),
`docs-tables.mjs` (docs-table audit + `docs-tables.jsonl`).

## Commits

| SHA | Subject |
| --- | --- |
| `b341939` | fix(ui): announce a new-tab linkcard when the target sits on the card (carried I1) |
| `74673ee` | fix(ui): keep a long choice-card meta badge inside its tile at 360 (earlier run) |
| `b30b676` | fix(ui): grey a disabled check card's box like the checkbox atom (WIP a) |
| `8706bb4` | fix(ui): stop the menu-item-row card stories inheriting the full row's meta (WIP b) |
| `bd667fa` | fix(ui): stack the review-card default pair at 360 |
| `59286d1` | fix(ui): wrap the offer-seal tone and value rows at 360 |
| `d9f9bad` | fix(ui): wrap a long choice-card row price under its words at 360 |
| `bed9b86` | fix(ui): let the pricing-card page stories reach their section width |
| `1add859` | fix(ui): let the link-card section stories reach their section width |
| `2e6fe64` | fix(ui): match the key-value-list rules padding and quote lines to the handoff |
| `9732329` | fix(ui): fit the sticky-action-bar stories inside a 360px viewport |
| `375789d` | fix(ui): cap the 360px story frames so the canvas never scrolls sideways |
| `e2c8876` | fix(ui): set the table plan-vs-app column in regular weight, as the handoff does |
| `6ca22f3` | test(ui): parity review of the domain and handoff molecules (record, `--allow-empty`) |

## Parity table (all at 360 and 1280)

| Component | Verdict | Fix SHA / accepted reason |
| --- | --- | --- |
| MenuItemRow | fixed + accepted | `8706bb4` (stories leaked badge/spice/description); `375789d` (Narrow frame overflowed 360). Accepted: thumbnail 80px at 360 (DS card 104px) — documented Task 1 decision (`size-20 sm:size-26`). |
| MenuItemCard | matches + accepted | Accepted (table): lifts only as a link. ImageSlot label pink-700 not pink-500 — Plan 2a atom's soft-tone contrast rule. |
| OutletCard | matches | Fixture copy only. |
| ReviewCard | fixed + accepted | `bd667fa` (Default pair squeezed to two columns at 360). Accepted (table): no rule above the footer; uppercase Badge chip. Score numeral shown: ruling D2 (Task 4, hasValueLabel DROP). Concern 3. |
| LoyaltyCard | matches | — |
| FilterBar | matches | Pills measured identical (38px, 14px/500, 16px padding, pill radius, colours). `375789d` (Scroll frame overflowed 360). |
| LogoLockup | matches | Clear space = width ÷ 6 (deviation 12). |
| OfferSeal | fixed + accepted | `59286d1` (tone/value rows overflowed 360). Accepted (table): full-tone label and note. Accepted: Values story at `md` because the note drops at `sm` (documented in the story); BleedOffCorner and Sizes are fixed-size artwork boards (`xl` = 360px feed seal, deviation 7), wider than a padded 360 canvas by definition. |
| CouponTicket | matches + accepted | Accepted (table): `md` terms 14px, stub label 11.5px. Accepted: `lg` at 360 squeezes — documented in `coupon-ticket.tsx` ("Artwork is scaled, never reflowed"). Accepted (ramp snap): headline one line vs two (30 vs 30.8px, 24 vs 25px padding; 334px line in 340px). |
| ChoiceCardGroup | fixed + accepted | `74673ee`, `d9f9bad` (row price squeezed the words to a word per line at 360). Accepted (table): price 20px; tile min height 64px. Concerns 4–6. |
| CheckCard | fixed | `b30b676` (disabled box/inset stayed brand pink). Concern 1. |
| ChipGroup | matches + accepted | Accepted (table): segmented unchosen unfilled. OnInk matches OfficeLunch. Concern 7 (OnSurfaces story at 360). |
| KeyValueList | fixed + accepted | `2e6fe64` (booking-rules frame kept 24px twice at 360 → 100px rule column; quote lines had row rules the handoff panel lacks). Accepted (table): 120px key column; 13/15px text on the ramp. Concern 8. |
| Steps | matches + accepted | Accepted (table): 260px tracks. StartingTakesOneMessage is 2+1 in the 760px story frame; 3 columns at the handoff's 940px. |
| FeatureItem | matches + accepted | Accepted (table): office-perks tile 40px. Columns are container-driven. |
| PricingCard | fixed + accepted | `bed9b86` (page stories ~150px wide, truncated buttons); `375789d` (LongName frame overflowed 360). Accepted (table): one card; tag beside the name; no lift. Accepted: flooded card's action is `inverse` (Task 16 prescribes `build("Classic","inverse")`; white-outline on pink-500 measures below AA for 15px text). |
| LinkCard | fixed + accepted | `b341939` (I1), `1add859` (section stories collapsed to content width). Accepted (table): pink-600 CTA. |
| StickyActionBar | fixed | `9732329` (fixed 360px frame scrolled the canvas to 376px and clipped the button). Pill, caption truncation and pink action match the handoff at 360. |
| AnnouncementBar | matches + accepted | Accepted (table): 8px padding, 12.5px text. Expired renders nothing. |
| Table | fixed + accepted | `e2c8876` (plan-vs-app answers were semibold; handoff regular ink-900); `375789d` (ScrollsAt360 frame overflowed). Price list, box compare, offers, glance match (pink header, rules, highlighted column). Concern 9. |
| Docs tables (R103) | pass | See below. |

### Sweep-wide overflow check

`overflow.mjs` at 360 over all 132 stories of the 20 components (run after `9732329`, which had
already fixed StickyActionBar's three): 7 stories scrolled the page sideways — four at 376px from
fixed `w-90` frames (fixed in `375789d`), ChipGroup OnSurfaces at 394 (concern 7), OfferSeal Sizes
at 545 and BleedOffCorner at 592 (artwork boards, accepted above). After `375789d` only the last
three remain.

## Docs tables row (ruling R103)

Compared against the pre-swap `DocTable` read with `git show f580554 -- apps/storybook/src/docs-kit/`
— the brief's `dev:apps/storybook/src/docs-kit/doc-table.tsx` does not exist (`git show` fails:
`path … does not exist in 'dev'`); DocTable was created and deleted on this branch (`5b0005f` →
`f580554`). Old look: bare table, 2px header rule, `min-w-article` (760px) / `min-w-narrow` (960px).
New: library Table (card frame, pink header, `md` 620px / `lg` 720px).

`docs-tables.mjs` audited every captioned table on every foundations docs page (23 tables on 13
pages: brand logo/pattern, colours semantic/surfaces/contrast, type display/fluid, spacing
scale/layout-rhythm/shape, motion/states), screenshots `docs-<id>-<n>-<width>.png`:

- **360:** every table scrolls inside a `role="region"` frame with `tabIndex=0` and
  `aria-labelledby` its caption; after `scrollLeft = scrollWidth` the last header is fully inside
  the frame (all 23 `reach: true`). 0 hidden columns, 0 cells whose content spills its cell. No
  docs table widens the page.
- **1280:** no table scrolls; all columns visible; 0 spills. Token names in mono wrap at hyphens in
  the ~200px Token column (e.g. `--color-text-` / `heading`) — readable; the "Use" column is only
  narrow (56–72px) where the descriptions are empty.
- **Verdict: PASS** — no data or legibility loss. The narrower min widths add some hyphen wrapping;
  R103 accepts the library look and the narrower widths.

## TDD evidence

### b30b676 CheckCard disabled
- WIP verified against `atoms/checkbox/checkbox.tsx`: the atom greys a disabled box with **ink-200** border + fill (checked or not) and an **ink-400** tick. The WIP used ink-400 border/fill and a white tick — different, so replaced with the atom's rule. Also found: a disabled+checked card kept the pink `shadow-selected` inset (probe: `rgb(238, 44, 104) 0 0 0 1px inset`); added `has-disabled:shadow-none`.
- RED (pre-fix `check-card.tsx` from HEAD): `pnpm nx test @pink-paprikaa-web/ui -- check-card` → `× greys a disabled box like Checkbox…`, `Tests 1 failed | 11 passed (12)`; `pnpm nx test @pink-paprikaa-web/storybook -- check-card` → `× Disabled Checked`, `Expected "rgb(236, 230, 232)" Received "rgb(238, 44, 104)"`, `Tests 1 failed | 4 passed (5)`.
- GREEN: ui `Tests 12 passed (12)`; storybook `Tests 5 passed (5)`.

### 8706bb4 MenuItemRow stories
- Screenshots: Discount/Devanagari now show no badge, Minimal shows name + price + photo only — matching the card rows "discount", "devanagari" (egg variant not built, C10) and "minimal".
- RED (WIP args removed, new plays kept): `× Discount`, `× Devanagari`, `× Minimal`, `Tests 3 failed | 7 passed (10)`. GREEN: `Tests 10 passed (10)`.

### d9f9bad ChoiceCardGroup row price
- New story `ServiceAt360` (play: each card's words keep ≥ half the card width). RED on the old row variant: `× Service At 360`, `Tests 1 failed | 9 passed (10)`. GREEN: storybook `10 passed (10)`, ui unit `19 passed (19)`.

### Story-only fixes (verified by screenshot / probe, no new test)
- `bd667fa`, `59286d1`, `bed9b86`, `1add859`: before/after screenshots in `W/parity/`.
- `2e6fe64`: booking-rules value column 100px → 132px at 360 (screenshot); quote lines without rules. `key-value-list.stories.tsx` `Tests 7 passed (7)`.
- `9732329`: probe `scrollWidth` 376 → 360 on PlanCalculator, DawatCalculator, InAScrollingPage. `Tests 4 passed (4)`.
- `375789d`: `overflow.mjs` 376 → 360 on the four stories; their files `Tests 30 passed (30)`.
- `e2c8876`: probe plan column `fontWeight` 600 → 400, `rgb(43, 31, 37)`. `Tests 7 passed (7)`.

## Gates (final HEAD `6ca22f3`, cold)

| Command | Result |
| --- | --- |
| `pnpm nx format:check && pnpm nx sync:check` | clean ("All files are up to date") |
| `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache` | exit 0 |
| `pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static` | exit 0 — design-tokens `4 files, 284 tests passed`; ui `90 files, 1354 tests passed`; typecheck + lint green |
| `pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache` | exit 0 (Storybook 10.5.7 → `storybook-static`) |
| `pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache` | exit 0 — `83 files, 778 tests passed`; no "Failed to fetch dynamically imported module", no re-run |
| `pnpm guard:founder` | "Founder-name guard: clean." |

Servers stopped: Storybook (:6006) and the two handoff servers (:5050, :5051); no listeners left.

## Concerns

1. **CheckCard disabled + unchecked:** matching the atom paints an ink-200 box on the ink-200 disabled card, so the box outline disappears (words turn ink-400, cursor not-allowed; disabled controls are exempt from WCAG 1.4.11). Kept as instructed; the controller may prefer an ink-300 box border inside cards.
2. **Brief path:** `dev:apps/storybook/src/docs-kit/doc-table.tsx` does not exist; the R103 comparison used `f580554`'s deleted DocTable instead.
3. **ReviewCard (Google page):** the handoff's name is bold display 15px with a separate "View on Google" row; ours is one anatomy (body-sm medium name, link inline at the end).
4. **ChoiceCardGroup DecideList:** rows are 64px tall, 12px padding, title 700 vs the handoff's 52px, 14/16px padding, 600.
5. **ChoiceCardGroup Platters/Service:** the handoff puts a 14px price in the head beside the title; ours puts a 20px price below the title (tile) or at the end (row) — one anatomy.
6. **ChoiceCardGroup PlanLengths at 360:** the "OFFER: +1 FREE / MONTH" badge truncates to "OFFER: +1 FREE…" (Badge atom truncates by design; the `74673ee` choice). A visible loss of the offer's wording at 360.
7. **ChipGroup OnSurfaces at 360:** the page scrolls 34px sideways — the never-wrapping segmented track (302px) is wider than the 236px left beside the ground label (a page at 360 has 328px). Story-frame artefact; not fixed.
8. **KeyValueList typography per usage:** the handoff varies it — customisation keys in body bold (ours display bold, `emphasis="key"`), upgrade prices in mono pink-700 (ours body heading), quote-line values bold (ours regular heading). One row anatomy; no option for these.
9. **Table alignment:** header cells sit bottom-aligned and body cells top-aligned (plan Task code), so in the price list the plate name sits ~10px above its price button; the handoff's div grid top-aligns headers and centres the row. Auto layout also wraps "Salad & chutney" / "Dessert & papad" in box compare at 1280 (handoff keeps them on one line).
10. **Out of R103 scope, found by the audit:** at 360 the Introduction docs page scrolls 235px sideways (its markdown table and long `code` spans) and Colours › Contrast 25px (the inline `packages/design-tokens/contrast-pairs.js` code span). Not docs-kit tables; not fixed.
