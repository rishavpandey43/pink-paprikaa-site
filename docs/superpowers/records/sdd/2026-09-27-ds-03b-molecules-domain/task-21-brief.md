### Task 21: Tier parity review (spec §11.4)

**Files:**

- Modify: only files of Tasks 1–20 where the review finds a real defect.
- Screenshots go to `/tmp/pp-parity-3b/` — review evidence, never committed.

**Interfaces:**

- Consumes: every story from Tasks 1–20; the design-system cards (`zip-files/Pink Paprikaa Design System/components/molecules/*.card.html`) and the handoff pages (`zip-files/pink-paprikaa-handoff/design/*.dc.html`).
- Produces: a difference list (fixed, or accepted with a reason) in the commit body; a green `storybook:test`.

- [ ] **Step 1: Serve the three sources**

Run each in the background (Bash `run_in_background`), then check each URL answers:

```bash
pnpm exec serve "zip-files/Pink Paprikaa Design System" -l 5050
pnpm exec serve zip-files/pink-paprikaa-handoff/design -l 5051
pnpm nx run @pink-paprikaa-web/storybook:serve
```

The design-system cards load React and Babel from unpkg; if the sandbox blocks the network, rerun that `serve` with the sandbox disabled. Story iframe URLs are `http://localhost:6006/iframe.html?id=<story-id>&viewMode=story`, where the id is the title and export name in kebab-case (`Molecules/Table` → `ScrollsAt360` = `molecules-table--scrolls-at-360`).

- [ ] **Step 2: Screenshot every pair at 360 and 1280**

With the Chrome DevTools MCP (`new_page`, `resize_page` to 360×900 then 1280×900, `take_screenshot`) — or a throwaway Playwright script outside the repo — capture each pair side by side into `/tmp/pp-parity-3b/<component>-<width>-{source,story}.png`:

| Component       | Source                                                                                                                      | Story ids                                                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| MenuItemRow     | `:5050/components/molecules/MenuItemRow.card.html`                                                                          | `molecules-menuitemrow--full`, `--discount`, `--devanagari`, `--minimal`                                                          |
| MenuItemCard    | `:5050/components/molecules/MenuItemCard.card.html`                                                                         | `molecules-menuitemcard--variants`                                                                                                |
| OutletCard      | `:5050/components/molecules/OutletCard.card.html`                                                                           | `molecules-outletcard--with-image`, `--without-image`                                                                             |
| ReviewCard      | `:5050/components/molecules/ReviewCard.card.html`; `:5051/GoogleReviews.dc.html`                                            | `molecules-reviewcard--default`, `--brand`, `--symbol-mark`, `--google-review`                                                    |
| LoyaltyCard     | `:5050/components/molecules/LoyaltyCard.card.html`                                                                          | `molecules-loyaltycard--in-progress`, `--one-left`, `--complete`, `--brand`                                                       |
| FilterBar       | `:5050/components/molecules/FilterBar.card.html`                                                                            | `molecules-filterbar--wrap`, `--scroll`, `--icons`                                                                                |
| LogoLockup      | `:5050/components/molecules/LogoLockup.card.html`                                                                           | `molecules-logolockup--pink`, `--white`, `--centred`, `--wordmark`                                                                |
| OfferSeal       | `:5050/components/molecules/OfferSeal.card.html`; `:5051/Home.dc.html` (hero)                                               | `molecules-offerseal--tones`, `--values`, `--handoff-hero`, `--bleed-off-corner`                                                  |
| CouponTicket    | `:5050/components/molecules/CouponTicket.card.html`                                                                         | `molecules-couponticket--brand`, `--light`, `--on-pink-artwork`                                                                   |
| ChoiceCardGroup | `:5051/PlanCalculator.dc.html`, `DawatCalculator.dc.html`, `Home.dc.html` (trial), `HomelyMeals.dc.html` (decide)           | `molecules-choicecardgroup--plates`, `--plan-lengths`, `--dawats`, `--platters`, `--service`, `--trial-on-brand`, `--decide-list` |
| CheckCard       | `:5051/PlanCalculator.dc.html`                                                                                              | `molecules-checkcard--upfront`, `--no-onion-garlic`                                                                               |
| ChipGroup       | `:5051/PlanCalculator.dc.html`, `DawatCalculator.dc.html`, `HomelyMeals.dc.html` (price-list switch), `OfficeLunch.dc.html` | `molecules-chipgroup--which-meals`, `--make-it-yours`, `--standing-add-ons`, `--starter-picks`, `--segmented`, `--on-ink`         |
| KeyValueList    | `:5051/PlanCalculator.dc.html` (Your box), `Catering.dc.html` (rules), `HomelyMeals.dc.html` (customise)                    | `molecules-keyvaluelist--your-box`, `--booking-rules`, `--customisations`, `--upgrade-prices`, `--quote-lines`                    |
| Steps           | `:5051/Home.dc.html`, `Catering.dc.html`, `HomelyMeals.dc.html`                                                             | `molecules-steps--how-it-works`, `--how-to-book`, `--starting-takes-one-message`                                                  |
| FeatureItem     | `:5051/Catering.dc.html`, `OfficeLunch.dc.html`, `HomelyMeals.dc.html`                                                      | `molecules-featureitem--why-us`, `--office-perks`, `--what-you-get`                                                               |
| PricingCard     | `:5051/Home.dc.html`, `HomelyMeals.dc.html`, `Catering.dc.html`, `OfficeLunch.dc.html`                                      | `molecules-pricingcard--home-plates`, `--homely-plates`, `--catering-dawats`, `--office-plates`, `--long-name`                    |
| LinkCard        | `:5051/Home.dc.html` (doors), `About.dc.html` (CTAs)                                                                        | `molecules-linkcard--home-doors`, `--about-ctas`                                                                                  |
| StickyActionBar | `:5051/PlanCalculator.dc.html`, `DawatCalculator.dc.html` (at 360)                                                          | `molecules-stickyactionbar--plan-calculator`, `--dawat-calculator`                                                                |
| AnnouncementBar | `:5051/PPHeader.dc.html`                                                                                                    | `molecules-announcementbar--launch-price`, `--expired`                                                                            |
| Table           | `:5051/HomelyMeals.dc.html` (price list, box, offers, vs app), `Catering.dc.html` (glance)                                  | `molecules-table--price-list`, `--scrolls-at-360`, `--box-compare`, `--offers`, `--plan-vs-app`, `--catering-glance`              |

- [ ] **Step 3: Compare and act**

For each pair, compare spacing, type size and weight, colour, radius, shadow, alignment, wrapping and the 360px behaviour. A difference is either **fixed** (edit the owning task's files and rerun that task's gate) or **accepted** with a one-line reason. These are expected and accepted up front — confirm each is the only difference of its kind:

| Accepted difference                                                                                     | Reason                                                                         |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Font rasterisation                                                                                      | Self-hosted Fontsource vs Google Fonts (spec §11.4).                           |
| Handoff 13 / 15px running text renders at 12.5 / 14 / 16px                                              | Body copy snaps to the ramp (tier rules).                                      |
| PricingCard: one card (`rounded-xl`, 20→28px padding, 36→48px price, `h4` black name) on all four pages | The handoff drew it four ways; the system has one (Task 16).                   |
| PricingCard: Catering's "Most ordered" tag sits beside the name, not over the photo; no hover lift      | Fixed slot placement; a lift on a non-link promises a click that does nothing. |
| ChoiceCardGroup: price 20px (handoff 22px on plates); tile min height 64px (plates 72px)                | One card anatomy for plates, lengths and dawats.                               |
| FeatureItem: Office perks tile 40px (handoff 44px)                                                      | `size="sm"` pairs a 40px tile with the 16px title.                             |
| Steps rule grid tracks 260px (handoff 240px)                                                            | AutoGrid scale step (spec §15.2).                                              |
| OfferSeal label and note at full tone colour (design system 85% / 70% opacity)                          | 70% opacity drops the note below AA.                                           |
| CouponTicket `md`: terms 14px, stub label 11.5px (design system 10.6 / 9px at 560px)                    | Legible on screens; `lg` keeps the artwork proportions.                        |
| ReviewCard (Google): no rule above the footer; the verified chip is an uppercase Badge                  | One ReviewCard anatomy; Badge is the system's chip.                            |
| MenuItemCard lifts only when it is a link                                                               | Affordance honesty (deviation 13).                                             |
| LinkCard CTA and brand text in pink-600, not pink-500                                                   | pink-500 text measures 4.04:1 (spec §5.3).                                     |
| ChipGroup `segmented`: unchosen options are unfilled inside the track                                   | The handoff's own `seg()` style; its rendered Tags ignored it.                 |
| KeyValueList booking-rules key column 120px (handoff 110px)                                             | `keyWidth="md"` step.                                                          |
| AnnouncementBar 8px vertical padding, 12.5px text (handoff 7px / 13px)                                  | Scale and ramp steps.                                                          |

- [ ] **Step 4: Run the whole Storybook suite and the gauntlet**

```bash
pnpm nx format:check && pnpm nx sync:check
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache
pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache 2>&1 | tail -20
```

Expected: all green; the Storybook suite runs every Molecules story from this plan in Chromium (a11y enforced), including the five Review Focus plays (`BleedOffCorner`, `StarterPicks`, `LongName`, `Expired`, `ScrollsAt360`).

- [ ] **Step 5: Commit**

If Step 3 changed files, stage exactly those; otherwise the commit is empty and carries the record:

```bash
git add packages/ui packages/design-tokens
git commit --allow-empty -m "test(ui): parity review of the domain and handoff molecules

Every Plan 3b story compared with its design-system card or handoff page
at 360 and 1280px (spec §11.4).

Fixed:
<one line per fix: component — what changed>

Accepted:
<one line per accepted difference: component — difference — reason>

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

## Controller amendments (2026-09-27)

- **OfferSeal size scale is final as written here** (sm 110 · md 156 · lg 260 · xl 360). Plan 4's hero seal uses `md` (156px).
- **PricingCard normalised to one design** across the four handoff pages — accepted; a size variant is a step-2 (web app) decision if a page needs one.
- **AnnouncementBar expiry flash** (a cached page after `endsAt` shows the bar until hydration) — accepted for the design system; the web app schedules a rebuild at the offer end so no cached page shifts layout (recorded for the step-2 spec).
- **Path:** ChoiceCardGroup lives in `molecules/choice-card-group/`.
