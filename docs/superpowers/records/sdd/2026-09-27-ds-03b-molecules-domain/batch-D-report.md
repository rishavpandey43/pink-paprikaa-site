# Batch D report: carried fixes D 1–4, then Plan 3b Tasks 6–8

The base was `9ef8b3b` and the head is `8cd7430`. The tree is clean. I ran no `git checkout` and did not use the stash (`stash@{0}` is untouched).

| SHA | Subject |
| --- | --- |
| `9dea52e` | fix(tokens): lower the select minimum width to 128px |
| `825a5ab` | fix(tokens): fade the upcoming step-tracker marker on ink |
| `10d38c2` | fix(ui): ring the whole menu item card on keyboard focus |
| `d2a1879` | test(ui): pin that a select drops the field's min-w-0 |
| `87df8b9` | feat(ui): add the FilterBar molecule |
| `e0ce52d` | feat(ui): add the LogoLockup molecule |
| `ea3449d` | feat(ui): add the OfferSeal molecule |
| `8cd7430` | docs: re-sort the 3b plan's offer-seal classes |

## Carried fixes (carried-fixes-D.md)

### 1. R95: Select minimum width 128px (`9dea52e`)

- **Token.** `field-select-min` in `field.json` went from 160px to 128px. Its description now cites R95 and the two-up fit. The fix list gives line 140, but the token is at line 19.
- **New story `TwoUpAt360`.** The frame is `grid w-82 grid-cols-2 gap-3`: a 360px phone's 328px content box with 12px between columns. The story uses the floor360 viewport global. The play asserts that the frame does not overflow, that the Guests box ends before the Time box starts, and that Time ends inside the frame.
- **TDD.** At 160px the play went red: "expected 330 to be ≤ 328". At 128px it went green.
- **First draft.** `w-90 px-4` measured a clientWidth of 344 under the storybook padding, so I replaced it with a fixed 328px frame. This is deterministic whether or not the viewport global applies.
- **Gate.** `ContentSizedParent` stays green: `storybook test -- select` passed 12/12 and tokens passed 272.

### 2. Ink `step-tracker-marker-off` (`825a5ab`)

- **Token.** `surface/ink.json` gains `step-tracker-marker-off: {color.white-alpha.25}`, which matches `bar-off` on ink. `light.json` already restores the key.
- **Build output.** In `dist/surfaces.css` both ink blocks (lines 8 and 56) now read `var(--color-white-alpha-25)`.
- **Docs.** I updated the token description and the `VerticalSurfaces` story doc comment. No new test: the existing `VerticalSurfaces` play already asserts that each diamond differs from its ground, and it stays green.
- **Gate.** tokens 272 · `storybook test -- step-tracker` 8/8.

### 3. MenuItemCard whole-card focus ring (`10d38c2`)

- **Change.** The root gets `has-[a:focus-visible]:outline-2 outline-offset-2 outline-focus`. The link gets `focus-visible:outline-none` so the name does not draw a second ring inside the card ring.
- **New story `KeyboardFocus`.** The play checks four things:
  - Before any Tab, the card has no ring.
  - The first Tab lands on the Add button, and the card still has no ring.
  - The second Tab lands on the link, and the card ring shows (`outlineStyle` is `solid`).
  - The link's own outline is `none`.
- **TDD.** Before the fix the play was red ("expected 'none' to be 'solid'"). After it, green.
- **Gate.** `storybook test -- menu-item-card` 6/6 · ui menu-item-card 13/13 · lint green.
- **Concern.** OutletCard, from batch C, uses the same stretched-link anatomy (deviation 17) and has the same gap. I did not touch it because the batch C review is running on those files. It is a two-class fix if the controller wants it carried.

### 4. Select test assertion (`d2a1879`)

The "never lets a long option label widen its box" test gains `expect(select.parentElement).not.toHaveClass("min-w-0")`. This pins that twMerge replaces the field's shared `min-w-0` instead of keeping both. The fix list gives line 385, but the assertion sits with the existing min-width check at about line 239. Gate: ui select.test 22/22.

## Task 6: FilterBar (`87df8b9`)

**Built:** `molecules/filter-bar/filter-bar.{tsx,test.tsx,stories.tsx}`. The barrel line sits between `field` and `list-row`. No tokens. TDD: "Failed to resolve import ./filter-bar", then 9/9.

**Fold items applied:**
- 1: lower-case subject.
- 2: sorted barrel.
- 4: `export const OnSurfacesStory: Story = { name: "OnSurfaces", … }`.

**Deviations:** none. The code is verbatim from the brief.

**Radix `disabled`.** FilterBar passes no `disabled` to `ToggleGroup.Root`, because the contract has no FilterBar `disabled`. So the exactOptionalPropertyTypes guard does not arise here. It still applies to Task 12 ChipGroup, which already defaults it.

### Dev parity

| Dev item | Ruling | Where, or the spec clause |
| --- | --- | --- |
| One pill per category inside a named group | ALREADY | named `radiogroup` of `radio` items (test "is a named radio group…") |
| Default group name "Filter by category" | ALREADY | `label` is required (contract §6), so there is no copy default (D9) |
| Exactly one pill selected; the pressed value is reported | ALREADY | tests "chooses a filter…" and "keeps exactly one filter chosen…" |
| An option's value is separate from its label | ALREADY | options are `{ value, label }` (the test reports `"sweets"` for "Sweets") |
| Bare-string options | DROP | spec §8.2: object lists only (`{ value, label }`) |
| Scrolls on one line by default, wraps with `isWrapping` | ALREADY | test "scrolls on one line by default…" |
| The statement badge is not a filter | ADD | assertion in "pins the statement badge…": still one radio per option |
| Trailing control pinned at the end, never squeezed | ADD | `trailing` wrapper slot `shrink-0` (the badge already has it) |
| Without a handler, a press changes nothing | ALREADY | superseded: uncontrolled by default (`defaultValue`), controlled via `value` (test "follows a controlled value") |
| Caller `className` replaces its own gap | ADD | test "lets a caller className replace its own gap" |
| axe with note, trailing and icons | ALREADY | last test |
| Stories `Default`, `Wrapping`, `WithStatement`, `Scrolling`, `WithIcons`, `Narrow` (360) | ALREADY | `Playground`, `Wrap` (with the note), `Scroll` (`w-90` = 360px), `Icons` |
| Story `WithTrailingControl` | ADD | story `WithTrailing` |
| (extra) Dev spreads `div` props (`id`, `data-*`) onto the root | Not built | contract §6's `FilterBarProps` does not extend `div`; built as the brief says |
| (extra) Global constraints name `name` / `onBlur` for value controls (ChipGroup, FilterBar) | Not built | the brief's Interfaces list only `value` / `onValueChange` for `<Controller>`; the brief wins. Controller call if a form ever needs a FilterBar |

**Gate:** tokens 272 · ui 1183 (76 files) · Storybook build OK · format:check 0 · storybook:test 676 (69 files).

## Task 7: LogoLockup (`e0ce52d`)

**Built:** `molecules/logo-lockup/logo-lockup.{tsx,test.tsx,stories.tsx}`. The barrel line sits between `list-row` and `loyalty-card`. No tokens. It uses the Plan 1 `Logo` atom (`lib/brand-artwork` ARTWORK) and does not import `@pink-paprikaa-web/content` (R96). The accessible name is "Pink Paprikaa — India's First Desi Urban Café", spelled with two a's. TDD: "Failed to resolve import ./logo-lockup", then 11/11.

**Fold items applied:** 1 and 2.

**Deviation: Step 7 recalibrated the clear space.**
- I measured `logo-lockup-pink.svg` in Chromium (Playwright, 240px wide = `md`).
- The lead "Pink" capital P measures **44.4px** from cap top (y 8.5) to baseline (y 52.9). That is width ÷ 5.4.
- The "Paprikaa" capital P measures **60.3px** (width ÷ 4.0).
- Both miss the planned ÷ 6 (40px) by more than 10%. So, as Step 7 says, I replaced the padding with the nearest 4px steps for the measured ratio, following the lead P (÷ 5.4): **`p-9 / p-11 / p-13 / p-17`** (36 / 44 / 52 / 68px) instead of `p-8 / p-10 / p-12 / p-15`.
- The component comment, the `it.each` size test and the className test (`not p-11`) were updated to match. The measurement is recorded in the commit body.
- **Controller call:** if "the P" means the larger "Paprikaa" P, the steps become `p-12 / p-15 / p-17 / p-22` (÷ 4).
- The readme's "P descender" that the tagline tucks beside is the lower-case p of "Paprikaa", which has the descender. That does not settle which capital the clear-space rule means.

### Dev parity

| Dev item | Ruling | Where, or the spec clause |
| --- | --- | --- |
| Mark named for assistive tech | ALREADY | test "signs the artwork…" (Logo's default title) |
| Tagline set once, beside the wordmark as text | ALREADY | the tagline is drawn into the lockup artwork (spec §7.1), so it scales with the mark |
| `tagline` override; story `AlternateTagline` | DROP | spec §7.1 / §9.2: the tagline is supplied artwork, not copy; contract §6 has no `tagline` |
| `hasTagline={false}` → bare wordmark | ALREADY | test "drops to the wordmark…" |
| `label=""` hides the mark when the artwork already names the brand | ADD | `isDecorative` (deviation 18); test "hides the logo from assistive tech…" |
| Mark re-heighted per size; 140px wordmark floor | ALREADY | widths 200 / 240 / 280 / 360 (deviation 12); 200 is the lockup minimum |
| Clear space per size | ALREADY | `it.each` size test (`p-9` … `p-17`, recalibrated in Step 7) |
| `hasClearSpace={false}` when the parent already reserves it | ALREADY | `className="p-0"` replaces the padding (merge); test "drops its clear space…"; story `ClearSpace` |
| `white` tone; `align="center"` | ALREADY | tests "signs the artwork…" and "centres the signature…" |
| Default tone `brand` | DROP | D2: the design system's default is `white` (deviation 12) |
| Caller `className` merges | ADD | test "drops its clear space…" (`p-0` replaces `p-11`) |
| axe on pink, white-centred-lg and decorative wordmark | ADD | last test renders all three |
| Stories `Default`, `Sizes`, `OnBrand`, `CentredOnInk`, `WithoutTagline` | ALREADY | `Playground` / `Pink`, `Sizes`, `White`, `Centred`, `Wordmark` |
| Story `ClearSpace` | ADD | story `ClearSpace` |
| (extra) Dev omits `children` from the div props | Not needed | explicit JSX children win over a spread `children`, so a stray child cannot reach the DOM |

**Gate:** tokens 272 · ui 1194 (77 files) · Storybook build OK · format:check 0 · storybook:test 683 (70 files).

## Task 8: OfferSeal (`ea3449d`, plan-doc re-sort `8cd7430`)

**Built:**
- `tokens/component/offer-seal.json`.
- `molecules/offer-seal/offer-seal.{tsx,test.tsx,stories.tsx}`.
- `component-variants.ts`: seven `offer-seal-*` names in `TEXT`, and `offer-seal` in `RADIUS` and in `SPACING`.
- `contrast-pairs.json`: groups `offer-seal` and `offer-seal-brand`. Tokens went from 272 to 277 tests.
- Barrel line between `menu-item-row` and `otp-input`.

`theme.css` has `--spacing-offer-seal: 10em`, `--radius-offer-seal: 1.4em`, and `--text-offer-seal-value: 3em` with its line-height, letter-spacing and weight (800). TDD: "Failed to resolve import ./offer-seal", then 17/17.

**Fold items applied:**
- 1: lower-case subject.
- 2: sorted barrel.
- 7: R61 marker `"$extensions": { "pink-paprikaa": { "utility": ["size"] } }` on `spacing.offer-seal`. storybook:test is green, and so is catalogue.spec.
- 9: Prettier re-sorted the root classes in the new component and the plan doc's code block. The re-sort is committed separately as `docs:` (`8cd7430`, 4 lines).

**Review Focus 5.**
- Test "never bleeds a corner further than 0.18 × its side" runs over the four corners × two bleeds.
- In Chromium, `storybook test -- offer-seal` passes 6/6, including the `BleedOffCorner` play.
- **Mutation check:** turning the `md` bleed to `1/3` makes `BleedOffCorner` fail. I restored it before committing.

**Deviations:** none beyond fold 9's class order.

### Dev parity

| Dev item | Ruling | Where, or the spec clause |
| --- | --- | --- |
| Value, label and note printed | ALREADY | test "reads as the value, the label and the note" |
| The value alone when there is nothing else to say | ADD | test "renders the value alone…" |
| A rupee value printed as written (`₹99`) | ALREADY | story `Values` (`formatRupees(99)`); the axe test uses `₹130` |
| Rotated diamond, text counter-rotated upright | ALREADY | test "is a rotated diamond…" |
| Three flat fills, never a gradient | ADD | `not.toMatch(/gradient/)` in the tone test |
| Old classes `bg-brand-primary`, `shadow-elevation3`, `rounded-5` | DROP | D4 (design-system token names) |
| Fixed side per size (128 / 192 / 280) | ALREADY | `size` sm 110 · md 156 · lg 260 · xl 360 (deviation 7); test "scales the whole seal…" |
| Sits in flow until a corner is asked for | ALREADY | test "sits in flow when it does not bleed" |
| Hangs off each corner by a clamped offset (18% self translate) | ALREADY | `corner` × `bleed` enum ≤ 0.18 (Review Focus 5); the arbitrary `-translate-x-[18%]` is banned |
| Caller `className` replaces its own shadow | ADD | test "lets a caller className replace its own shadow" |
| axe on three tones and sizes | ADD | last test renders all three |
| Stories `Default`, `Tones`, `Sizes`, `Values`, `WithNote`, `OnACorner` | ALREADY | `Playground`, `Tones`, `Sizes`, `Values` (the third seal has the note), `BleedOffCorner` |
| (extra) Dev default `size` `md`, `position` prop | DROP | contract §6 + deviation 7: default `lg`, and `corner` × `bleed` replace `position` |

## Final gate (at `ea3449d`, then `8cd7430`)

```
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache                → ok
pnpm nx run-many -t typecheck lint test -p ui design-tokens --skip-nx-cache   → tokens 4 files / 277 · ui 78 files / 1211 · Successfully ran
pnpm nx run @pink-paprikaa-web/storybook:build                                → Successfully ran
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache (R77)           → 71 files / 690 passed (no cold-cache flake)
pnpm nx test @pink-paprikaa-web/storybook -- offer-seal                       → 6/6 (BleedOffCorner play)
pnpm nx format:check                                                          → exit 0 (after the 8cd7430 re-sort)
pnpm nx sync:check                                                            → All files are up to date
pnpm run guard:founder                                                        → clean
```

**Test counts:**
- ui: 1174 → 1183 (+9 T6) → 1194 (+11 T7) → 1211 (+17 T8).
- storybook: 668 → 676 (+1 select two-up, +1 MenuItemCard focus, +6 T6) → 683 (+7 T7) → 690 (+6 T8, +1 catalogue).
- tokens: 272 → 277 (T8 contrast pairs).

## Concerns

1. **LogoLockup clear space.** The measured lead P forced a recalibration to `p-9 / p-11 / p-13 / p-17`. If the brand means the "Paprikaa" P, the steps are `p-12 / p-15 / p-17 / p-22`. This is a controller call, and Plan 5's kits consume these paddings.
2. **OutletCard focus ring.** OutletCard has the same stretched-link focus gap that carried fix 3 closed on MenuItemCard. I did not touch it because batch C's files are under review.
