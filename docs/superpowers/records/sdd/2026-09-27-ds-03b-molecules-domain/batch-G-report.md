# Batch G report: carried fixes G 1–7, then Plan 3b Tasks 15–17

Base `e19b2b3`, head `b6fda87`. Tree clean. No `git checkout` of any kind, stash untouched. Mutation
checks were undone by an inverse `sed` edit, with the restored line grepped before moving on.

| SHA | Subject |
| --- | --- |
| `75a0b15` | fix(ui): ring stretched-link cards without trusting the router link |
| `267e35f` | fix(ui): let an errored choice card group own its red |
| `85ab97e` | fix(ui): announce a coupon copy once, and keep its name |
| `162272f` | fix(ui): stub the coupon clipboard only under the test runner |
| `41c99a1` | fix(storybook): set the company fact keys in mono again |
| `475d540` | feat(ui): add the FeatureItem molecule |
| `a20a1ff` | docs: re-sort the 3b plan's feature-item tile classes |
| `a9de0f7` | feat(ui): add the PricingCard molecule |
| `e2354ef` | docs: re-sort the 3b plan's pricing-card classes |
| `b6fda87` | feat(ui): add the LinkCard molecule |

## Carried fixes (carried-fixes-G.md)

### Item 1: the stretched-link ring no longer depends on the router link (`75a0b15`)

- **The marker moved to the card's own element.** `data-stretched-link` is now on the heading that
  MenuItemCard and OutletCard render round the link (only when `href` is set). It is no longer on
  the `LinkComponent`, which is typed `LinkAsProps` and was never promised to forward it.
- **Selector.** `STRETCHED_LINK.card` is now `has-[[data-stretched-link]_:focus-visible]:…`, which
  compiles to `:has([data-stretched-link] :focus-visible)`. It fires for any focus-visible inside the
  marked heading, so it does not depend on the link being an `<a>` either. OutletCard's Directions
  sits outside the heading, so it still rings only itself. The JSDoc in `lib/stretched-link.ts` says
  all this.
- **Proof.** Both `KeyboardFocus` plays now pass `linkAs: StrictLink`, a story-local link that
  forwards only `href`, `className` and `children`. Green with the fix. Mutation: with batch E's
  selector `has-[[data-stretched-link]:focus-visible]` restored, both plays go red ("expected 'none'
  to be 'solid'").

### Items 2 and 3: ChoiceCardGroup error state (`267e35f`)

These share one commit because they touch the same three files (batch E precedent).

- **Item 2.** Both tones gain `in-aria-invalid:has-checked:border-status-danger`. The checked card's
  brand/ink border (`has-checked:`, specificity 0,2,0) out-ranked the `:where()`-wrapped
  `in-aria-invalid:` red (0,1,0).
  - **Addition: the light tone also drops the pink `selected` inset on an errored checked card**
    (`in-aria-invalid:has-checked:shadow-none`). Without it the red 1px border is lined with a pink
    1px inset. The card still reads as chosen through its pink-50 fill.
  - Unit test `it.each` over both tones pins the classes.
  - The `WithError` play clicks Classic. It then waits for the card's `transition-control`
    animations to finish (`getAnimations()` → `finished`) and asserts three things:
    - the checked and unchecked borders both equal the computed `--color-status-danger`;
    - the checked card's box-shadow has no opaque layer.
  - **The trap.** My first play passed without the fix. It read the border mid-transition, while
    the colour was still the old red. The settle step fixed that, and without the fix the play is
    now red ("expected 'rgb(238, 44, 104)' to be 'rgb(207, 34, 34)'"). Removing `shadow-none` also
    makes it red.
- **Item 3.** A caller's `aria-invalid` is destructured out (`_callerInvalid`) and dropped, so the
  group's own invalid state (error + message) always wins. New test "keeps its own invalid state
  over a caller's aria-invalid" covers both cases:
  - a bare `aria-invalid` with no message is not invalid;
  - `aria-invalid={false}` with an error message is still invalid.

  Red before the fix, green after.

### Item 4: CouponTicket's copied name and announcement (`85ab97e`)

- The stub label always reads `codeLabel`. The visible hint still flashes "Copied" with a check
  icon, but it is no longer `aria-live`.
- "Copied" is announced from one sr-only `aria-live="polite"` span. It sits **outside** the button
  (a fragment sibling), so it never joins the button's name, and it is empty except during the
  flash. The reset therefore announces nothing.
- The tests now assert these three things (both tests were red before the fix):
  - while the flash shows, the button's name is exactly "Use code PAPRIKAA50 Copied";
  - there is exactly one live region, and it reads `/^Copied$/`;
  - after the reset, the live region is empty.

### Item 5: the Brand story's clipboard stub (`162272f`)

The `beforeEach` stub now returns early unless `navigator.webdriver` is true. That value is true in
the Playwright-driven test runner and false for a person using Storybook. The comment says why. The
Brand play is still green, so the stub runs under the runner.

### Item 6: the `-translate-1/2` deviation (record only, no commit)

- `coupon-ticket.tsx`'s `notchStart` has `-translate-1/2`. The plan doc (and the Task 9 brief) has
  `-translate-x-1/2 -translate-y-1/2`.
- **Cause:** `eslint-plugin-tailwindcss`'s `enforces-shorthand` rewrote it during `lint --fix` in
  batch E. This is the same mechanism as batch F's `size-100`.
- **Effect:** none. It computes the same transform.
- **Plan doc:** left alone. `format:check` does not flag it, and R43 allows only Prettier re-sorts.

### Item 7: Company details mono keys and the xl check (`41c99a1`)

- **Keys are mono again.** A local `monoKeys()` wraps each key in `<span className="font-mono
  text-mono">`, matching the old FactList's `dt`. It is used for both the fact boxes and the
  derived lines. KeyValueList has no key-class prop, so no new API was added. The values stay
  `text-body-sm`, which is what FactList had. Only the keys were ever mono.
- **New story `CompanyFactsXl`** (`globals.viewport` `xl`, 1280). Its play checks three things:
  - the first three fact boxes share a top edge (three columns);
  - every `dt` and `dd` has `scrollWidth ≤ clientWidth`, and its right edge stays inside its card;
  - the keys' computed font family is mono.
- **TDD.** The play was red on the font before the fix ("DM Sans…"). Mutation: `whitespace-nowrap`
  on the lists makes it red ("expected 90 to be ≤ 88"), so the check catches a clipped key.
- `storybook test -- brand` 13/13.

## Task 15: FeatureItem (`475d540`, re-sort `a20a1ff`)

**Built:**
- `tokens/component/feature-item.json`.
- Tile and icon overrides in `surface/ink.json`, restored in `surface/light.json`. `surfaces.css`
  shows ink `var(--color-ink-800)` / `var(--color-pink-300)`, and the other blocks show pink-100 /
  pink-600.
- `feature-item-title-md` and `-sm` in `TEXT`.
- `molecules/feature-item/*`.
- Barrel line between `empty-state` and `field`.

TDD: "Failed to resolve import ./feature-item", then 6/6.

**Fold items applied:**
- 1: lower-case subject.
- 2: sorted barrel.
- 3 (R83): `createElement(headingTag(headingLevel), …)` with the section-header comment.
- 4: `OnSurfacesStory` named `"OnSurfaces"`.
- 9: Prettier moved the tile's `bg-`/`text-` token classes to the end. The one-line plan-doc
  re-sort is its own `docs:` commit.

**Deviations:** `isShown(description)` instead of truthiness (Steps/CheckCard precedent).

**Dev parity:** no dev reference (a handoff component). Stories as briefed: `Playground`, `WhyUs`,
`OfficePerks`, `WhatYouGet` (ink), `OnSurfaces`.

**Gate:** tokens 281 · ui 85 files / 1297 · Storybook build OK · storybook:test 78 / 747 ·
format:check 0 after `a20a1ff`.

## Task 16: PricingCard (`a9de0f7`, re-sort `e2354ef`)

**Built:**
- `tokens/component/pricing-card.json`.
- `pricing-card-price` in `TEXT` and `pricing-card-pad` in `SPACING`. The pad is used as `p-`, so
  it has no R61 marker (fold item 7), and catalogue.spec is green.
- `molecules/pricing-card/*`.
- Barrel line after `price-summary`, before `quantity-stepper`.

TDD: "Failed to resolve import ./pricing-card", then 11/11.

**Fold items applied:**
- 1, 2.
- 3 (R83).
- 8 (R94): the hidden word is lower-case `was `, and the test pins `"was ₹140"`. PriceTag is not
  reused, because the card's order is price → unit → struck price and it sets its own fluid price
  size. PriceTag puts the struck price straight after the amount, on its own size scale. Prices go
  through `formatRupees` (`@pink-paprikaa-web/utils`).
- 9: two class re-sorts (root `p-pricing-card-pad`, price `text-pricing-card-price`) in their own
  `docs:` commit.

**Deviations:**
1. **`LongName` story name is one unbroken word** (`ClassicWithDalMakhani…EverySingleDay`), not
   the brief's hyphenated one.
   - **Why.** The brief's play could not fail: a hyphenated name wraps at its hyphens without
     `wrap-anywhere`. I verified this by removing `wrap-anywhere`: the play stayed green.
   - **Now.** Without the guard the play is red ("expected 720 to be ≤ 356"); with it, green. This
     is Review Focus 4.
   - **Unchanged.** The jsdom test keeps the brief's name and class assertions.
2. **`isShown()` for `badge`, `blurb`, `footnote` and `action`** instead of truthiness (precedent).

**Dev parity:** no dev reference (a handoff component). Stories as briefed: `Playground`,
`HomePlates`, `HomelyPlates`, `CateringDawats`, `OfficePlates`, `LongName`.

**Gate:** tokens 281 · ui 86 / 1308 · Storybook build OK · storybook:test 79 / 754 (+6 stories, +1
catalogue case for `spacing-pricing-card-pad`) · `storybook test -- pricing-card` 6/6 · format:check
0 after `e2354ef`.

## Task 17: LinkCard (`b6fda87`)

**Built:**
- `tokens/component/link-card.json`.
- `link-card-title` and `-title-lg` in `TEXT`.
- `molecules/link-card/*`.
- Barrel line between `key-value-list` and `list-row`.

TDD: "Failed to resolve import ./link-card", then 13/13 (the brief's 10 plus 3 below).

**Not a stretched-link card.** The dispatch expected `STRETCHED_LINK`, but the brief makes the
**whole card the link**: the root is an `<a>`, or Slot into the consumer's link, with the heading
inside. There is no separate action to keep outside a link, so there is no overlay. The card takes
the global `a:focus-visible` ring itself. `STRETCHED_LINK` would add a ring for a descendant link
that does not exist. The JSDoc says so.

**Fold items applied:** 1, 2, 3 (R83). Item 9 had nothing to do: the classes were already in
Prettier's order.

**Deviations:**
1. **`Omit<ComponentProps<"a">, "media" | "title">`.** The anchor's native `media` (a string)
   conflicted with the `media` slot, giving TS2430. It is gate-forced.
2. **Test/story `RouterLink` renders `{children}` explicitly.** The brief's
   `<a data-router="" {...props} />` failed `jsx-a11y/anchor-has-content`. This is the Link atom's
   test pattern.
3. **R44: a `target="_blank"` card says "Opens in a new tab"**, read from `target` on the card or
   on the asChild child element. It is an sr-only line inside the link. The brief had no handling,
   and "an external anchor" is a named use. New tests: `it.each` over `<a>` / asChild, and a
   same-tab card whose name has no "new tab".
4. `isShown()` for `media` and `description` (precedent).

**Dev parity:** no dev reference (a handoff component). Stories as briefed: `Playground`,
`HomeDoors`, `AboutCtas`, `AsChild`.

**Gate:** tokens 281 · ui 87 / 1321 · Storybook build OK · storybook:test 80 / 758 · format:check 0.

## Final gate (at `b6fda87`)

```
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache                → ok
pnpm nx run-many -t typecheck lint test -p ui design-tokens --skip-nx-cache   → tokens 4 files / 281 · ui 87 files / 1321 · Successfully ran
pnpm nx run @pink-paprikaa-web/storybook:build                                → Successfully ran
pnpm nx format:check                                                          → exit 0
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache (R77)           → 80 files / 758 passed (no cold-cache flake)
pnpm nx sync:check                                                            → All files are up to date
pnpm run guard:founder                                                        → clean
```

The final gate ran on the LinkCard tree just before its commit. Nothing changed between the gate and
the commit.

**Test counts:**
- ui: 1288 → 1291 (+3 ChoiceCardGroup) → 1297 (+6 T15) → 1308 (+11 T16) → 1321 (+13 T17).
- storybook: 741 → 742 (+1 `CompanyFactsXl`) → 747 (+5 T15) → 754 (+7 T16) → 758 (+4 T17).
- tokens: 281 throughout.

## Concerns

1. **Same class of bug as item 3, in ChipGroup (not fixed).** `...props` lands on ChipGroup's root
   `div`, and the chips carry `in-aria-invalid:border-status-danger`. So a caller's `aria-invalid`
   on ChipGroup reddens every chip with no words. Fix: the same destructure-and-drop as item 3.
2. **Same pink-inset lining as item 2, in CheckCard (not fixed).** The built CSS shows
   `has-aria-invalid:border-status-danger` after `has-checked:border-border-brand`, so the red
   border already wins. But an invalid checked CheckCard keeps its pink `shadow-selected` inset
   inside the red.
3. **LinkCard is not a stretched link**, contrary to the dispatch's expectation (see Task 17).
4. **PricingCard does not guard `was ≤ price`** the way PriceTag does (PriceTag throws a
   `RangeError`). It is built as briefed. Add the same guard if content could ever send a
   misleading struck price.
