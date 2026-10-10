# Batch C report — carried fix + Plan 3b Tasks 3–5

Base `af3da55`. Head `9ef8b3b`. Tree clean. No `git checkout`, no stash use (`stash@{0}` untouched).

| SHA | Subject |
| --- | --- |
| `bc99875` | fix(ui): name the in-cart action with its dish |
| `333dd3a` | feat(ui): add the OutletCard molecule |
| `04d45dc` | feat(ui): add the ReviewCard molecule |
| `9ef8b3b` | feat(ui): add the LoyaltyCard molecule |

## Carried fix 1 — InCart action accessible name (`bc99875`)

`menu-item-row.stories.tsx` InCart: the "In cart · 2" Button gets
`aria-label="Paprikaa Chilli Paneer in cart, 2"` (the action JSDoc: name it with the dish). A new
play pins `getByRole("button", { name: "Paprikaa Chilli Paneer in cart, 2" })`. Gate: ui lint green;
`storybook test -- menu-item-row` 10/10.

## Task 3 — OutletCard (`333dd3a`)

Built: `molecules/outlet-card/outlet-card.{tsx,test.tsx,stories.tsx}`, barrel line between
`otp-input` and `pagination`. No tokens. TDD: "Failed to resolve import ./outlet-card", then 14/14.

Fold items applied: 1 (lower-case subject), 2 (sorted barrel), 3 (R83
`createElement(headingTag(headingLevel), { className }, href ? <LinkComponent…> : name)` with the
R83 comment; the link is the third argument), 5 (`Narrow`: `isRotated: false`).

Deviations / additions:
- **Added `AsLink` story + play** (MenuItemCard precedent): href + Directions action, compact form.
  In Chromium, `elementFromPoint` at the address is the stretched link, and at Directions it is
  Directions. Mutation check: removing `relative z-raised` fails it. Removing only `z-raised` still
  passes. The action comes after the link in DOM order, so `relative` alone already paints above the
  `::after`. `z-raised` stays as the brief and test require (it guards against a reorder).
- The `directions` action was pulled into a story-level const, shared by `WithoutImage` and `AsLink`.
- **Brand facts.** The component takes outlet data only through props and has no hard-coded
  address, phone or name. `packages/ui` (`type:ui`) may not import `@pink-paprikaa-web/content`
  (`type:content`) under the depConstraints in `tools/eslint-config/base.js`, so the stories keep the
  brief's fixture. That fixture is a verbatim prefix of `brand.outlets[0].address`, and the city is
  shown separately. The fixtures carry no phone number and no founder or owner name. The story Maps
  link is a search query (`brand.outlets[0].mapsUrl` is `null`).

### Dev parity

| Dev item | Ruling | Where, or the spec clause |
| --- | --- | --- |
| Outlet name is a heading; city, address, hours printed | ALREADY | tests "names the outlet…", "puts the address in an address element…" |
| `nameAs` picks the name element | ALREADY | `headingLevel`; test "uses the heading level the page needs" |
| Status in words for open / busy / closed; `statusLabel` overrides | ALREADY | `it.each` status test, "lets the page override the status words" |
| `href` → one stretched link over the card (`after:inset-0`) | ADD | `href` + `linkAs` (deviation 17) |
| Hover lift only when the card is a link | ADD | `isInteractive={href !== undefined}`; test "becomes one stretched link that lifts only when given an href" |
| Secondary action stays clickable above the stretched link | ADD | `action` slot `relative z-raised`; test "keeps the action outside…" + `AsLink` play (hit-tested in Chromium) |
| Labelled 16:9 placeholder; `hasImage={false}` drops it | ALREADY | test "shows the labelled 16:9 placeholder…" |
| Photograph with its alt once supplied | ADD | test "shows the outlet photograph once one is supplied" (dev's `image`/`imageAlt` strings → `MenuItemImage`) |
| Caller `className` replaces the card radius | ADD | test "lets a caller className replace the card radius" |
| axe | ALREADY | last test (now with `href`) |
| `h-full` so a locator row of cards shares one height | ADD | root `relative flex h-full flex-col` |
| Header wraps so the status drops under a long name at 360 | ALREADY | `top` slot `flex-wrap`; story `Narrow` play |
| `StatusDot size="sm"` | DROP | D2. The StatusDot default is already `sm`, so the output is identical |
| Stories `Default`, `WithImage`, `CompactWithAction` | ALREADY | `Playground`, `WithImage`, `WithoutImage` |
| Stories `StatusStates`, `CustomStatusLine`, `Narrow` (360) | ADD | stories `StatusStates`, `CustomStatusLine`, `Narrow` |
| (extra) Dev body `p-5`, `after:content-['']` | Brief wins / not needed | `p-4.5`; Tailwind 4 `after:` emits `content: var(--tw-content)` |
| (extra) Real-layout proof that the action sits above the link | ADD | story `AsLink` play, mutation-checked |

Gate: tokens 272 · ui 1149 (73 files) · Storybook build OK · format:check OK · storybook:test
655 (66 files) · guard:founder clean.

## Task 4 — ReviewCard (`04d45dc`)

Built: `molecules/review-card/review-card.{tsx,test.tsx,stories.tsx}`, barrel line between
`quantity-stepper` and `search-field`. No tokens. TDD: "Failed to resolve import ./review-card",
then 10/10.

Fold items applied: 1, 2, 6 (test "shows the score…" queries `{ name: "5.0 out of 5" }`; the
`/out of 5/` regex stays). No other deviations: implementation and stories are verbatim from the
brief. The fixtures are the four real Google reviews, verbatim, including the reviewer's
"Mahararaja" spelling.

### Dev parity

| Dev item | Ruling | Where, or the spec clause |
| --- | --- | --- |
| Quote inside the component's own curly quotes, in a `<blockquote>` | ALREADY | test "quotes the guest in curly quotes…" |
| Attribution: name and meta | ALREADY | same test (`figcaption`) |
| Initials stand in for a missing photo | ALREADY | test "drops the avatar when asked…" ("VK") |
| No meta line and no score when neither is given | ADD | test "omits the score and the meta line when neither is given" |
| Score named for assistive tech | ALREADY | test "shows the score…" ("5.0 out of 5") |
| `default` on the white card | ADD | test "sits on a white light-island card by default" |
| `brand` on the light-pink feature card, name/quote in the pink ramp | ALREADY | test "uses the light-pink feature treatment…" |
| `mark="symbol"` drops the diamond | ALREADY | Rating owns the glyph; story `SymbolMark` |
| Old class asserts `bg-surface-card`, `rounded-4` | DROP | D4 / D5 |
| `Rating hasValueLabel={false}` | DROP | D2 |
| Caller `className` replaces the card radius | ADD | test "lets a caller className replace the card radius" |
| axe on both variants and both marks | ADD | last test |
| Stories `Default`, `Variants`, `SymbolMark`, `LongQuote` | ALREADY | `Playground` / `Default`, `Brand`, `SymbolMark` |
| Story `WithoutScore` | ADD | story `WithoutScore` |
| Story `PartialScore` (4.5, invented review) | DROP | spec §10.1 |
| Story `Wall` | ALREADY | TestimonialWall organism (Plan 4) |
| (extra) Avatar initials announced twice | ADD | Avatar `aria-hidden`; the name is written beside it |
| (extra) Verified chip copy inside the system | ADD | `verifiedLabel` (deviation 10); test "marks a verified review…" |

Gate: tokens 272 · ui 1159 (74 files) · Storybook build OK · format:check OK · storybook:test
661 (67 files) · guard:founder clean.

## Task 5 — LoyaltyCard (`9ef8b3b`)

Built: `molecules/loyalty-card/loyalty-card.{tsx,test.tsx,stories.tsx}`, barrel line between
`list-row` and `menu-item-card`. No tokens (`w-8.5`; `logo-symbol` is registered in `SPACING`, so
twMerge replaces Logo's `w-logo-symbol`). TDD: "Failed to resolve import ./loyalty-card", then 15/15.

Fold items applied: 1, 2. No other deviations: verbatim from the brief. The fixtures are veg only
(chai, kulfi, gulkand kulfi).

### Dev parity

| Dev item | Ruling | Where, or the spec clause |
| --- | --- | --- |
| Generated sentence: many / one / none left | ALREADY | `it.each` "reads naturally at %i of %i visits" |
| Reads naturally with an article-first reward | ADD | test "reads naturally with an article-first reward" |
| One stamp per goal visit (segmented) | ALREADY | test "shows the stamps as a segmented progress bar" |
| Track named for AT without printing a caption | ADD | same test (`sr-only`) |
| Stale count clamps to the goal | ALREADY | test "never shows more stamps than the goal" |
| Negative count clamps to zero | ALREADY | throws `RangeError` (deviation 11); test "rejects an impossible count…" |
| Content defaults `goal = 6`, `reward = "chai"`, `visits = 0` | DROP | D9; contract §6 makes them required |
| `feature` skin on the light-pink card | ADD | test "sits on the light-pink feature card by default" |
| `brand` skin flips the ink and the stamps | ALREADY | test "floods pink for the brand variant" (Logo `white`, ProgressBar `inverse`) |
| Brand symbol hidden from AT | ADD | test "hides the brand symbol…" |
| Caller `className` replaces the card radius | ADD | test "lets a caller className replace the card radius" |
| axe on in-progress, complete and brand | ADD | last test |
| `min-w-0` so a long reward shrinks the copy column | ALREADY | `body` slot; story `LongReward` |
| Stories `Default`, `Progress`, `OnBrand`, `Skins` | ALREADY | `Playground`, `InProgress` / `OneLeft` / `Complete`, `Brand` |
| Stories `Empty`, `LongReward` | ADD | stories `Empty`, `LongReward` |

Gate (final, at `9ef8b3b`):

```
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache                → ok
pnpm nx run-many -t typecheck lint test -p ui design-tokens --skip-nx-cache   → tokens 4 files / 272 · ui 75 files / 1174 · Successfully ran
pnpm nx run @pink-paprikaa-web/storybook:build                                → Successfully ran
pnpm nx format:check                                                          → exit 0
pnpm nx sync:check                                                            → up to date
pnpm nx run storybook:test --skip-nx-cache (R77)                              → 68 files / 668 passed (no cold-cache flake)
pnpm run guard:founder                                                        → clean
```

Counts: ui 1135 → 1149 (+14 T3) → 1159 (+10 T4) → 1174 (+15 T5). sb 648 → 655 (+7 T3) → 661 (+6 T4)
→ 668 (+7 T5).

## Other

- **Plan-doc re-sort (fold 9).** None was needed: no task added tokens, and format:check was green
  at every commit.
- **Not applicable this batch.** Fold item 4 (`OnSurfacesStory`) names none of T3–T5, and none of
  their briefs has an OnSurfaces story.
