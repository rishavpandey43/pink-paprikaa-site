# Batch E report: P5-D Storybook fixes, then Tasks 11–14

Base `a8cbad4`. The P5-D carried fixes came first (`21cf1a2`, `6ee9190`) and are reported in
`W5/batch-P5-D-report.md`. Commits for this batch: `14d10a4` (T11), `69dd905` (plan re-sort), `b45c3a3`
(T12), `fe647de` (T13), `b896a1a` (T14), `4e42d43` (plan re-sort).

The fold-list items I applied were 1 (`.mask-symbol` selectors, T11/T12), 2 (`rounded-diamond`, no
`radius` group in `brand-diamond.json`, no `brand-diamond` in `RADIUS`), 8 (barrel sorted by path:
rating after radio, spice-level before spinner, diet-mark before divider, price-tag before
progress-bar) and 9 (trailer). T14's contrast step is kept.

R61: every new px spacing token is used only as `size-*`, so each carries
`"$extensions": { "pink-paprikaa": { "utility": ["size"] } }`. That is 10 in `brand-diamond.json`
and 3 in `diet-mark.json`. `catalogue.spec` grew by 13 cases, all green.

## Task 11: Rating and the shared brand diamond (`14d10a4`)

Built: `tokens/component/{brand-diamond,rating}.json`, `lib/brand-diamond.tsx` (`BrandDiamond`,
`BrandDiamondProps`, `BrandDiamondSize`, `brandDiamondVariants`), and `atoms/rating/*`. Lists: 10
`SPACING` entries and 2 `TEXT` entries.

Deviations:

1. Fold item 1: the test selectors are `… > .mask-symbol` and `.mask-symbol.opacity-22`.
2. Fold item 2: the diamond slot uses `rounded-diamond`, and no radius token was created.
3. R61 markers on all 10 brand-diamond spacing tokens (not in the brief).
4. **Added an `OnSurfacesStory`.** The brief has none, but the score and count use `text-text-heading`
   and `text-text-subtle`, which follow `data-surface`. Global Constraints: "A surface-aware component
   … gets one."
5. Prettier re-sorted the plan's Rating slot classes once the tokens existed (`69dd905`).

Dev parity (brief table confirmed; checked against `git show dev:…/rating.{tsx,test.tsx,stories.tsx}`):

| Dev item | Ruling | Where / clause |
| --- | --- | --- |
| named "Rated 4.6 out of 5" | ALREADY | "4.6 out of 5" test |
| count in the name and in brackets, Indian grouping | ALREADY | count test (`formatCount`) |
| score to one decimal; hide it | ALREADY | `hasValue` test |
| one mark per point; a shorter scale | ALREADY | "honours another max" |
| whole marks full, fraction by real percentage, no fill layer on an empty mark | ALREADY | 4.5 / 4.3 / 0 tests |
| an overshooting score clamps | ALREADY (differently) | throws `RangeError` |
| size xs | DROP | contract sm/md/lg |
| rotated diamond by default; `symbol` variant | ALREADY | symbol test |
| small sizes step the mark's opacity up | ALREADY | opacity test |
| caller `className` replaces a conflict | ADD | className test |
| tabular numerals | ADD | value/count assertions |
| axe over count / symbols lg / sm without score | ADD | a11y test |
| stories: 0 score, count at sm, outlet card | ADD | `Values`, `Count`, `OnAnOutletCard` |
| stories sizes / variants / partial fill | ALREADY | stories |
| (missed by plan) surface-aware text shown on every ground | ADD | `OnSurfacesStory` (deviation 4) |

Gate: `pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache`
gave "Successfully ran targets typecheck, lint, test for 2 projects" (tokens 232, ui 530). The TDD red
was `Failed to resolve import "./rating"`. `storybook:test` passed 358/358. `format:check` failed only
on the plan doc, which was re-sorted.

## Task 12: SpiceLevel (`b45c3a3`)

Built `atoms/spice-level/*` from the brief verbatim. No new tokens. Deviation: fold item 1 (the
selectors are `.bg-heat-1 > .mask-symbol` and `.bg-ink-200 > .mask-symbol`).

Dev parity: the brief table is confirmed. Nothing further came up in dev: its heat-name-once and
neutral-ramp checks are covered by the `role="img"` label and the ink-200 test.

Gate: ui/tokens green (ui 546). The TDD red was `Failed to resolve import "./spice-level"`.
`storybook:test` 364/364, `format:check` exit 0.

## Task 13: DietMark, veg only (`fe647de`)

Built `tokens/component/diet-mark.json` (3 `SPACING` entries, R61 `size` markers) and
`atoms/diet-mark/*` from the brief. **Veg mark only: there is no egg or non-veg variant, prop or
story.** The docs say why (C10). A grep of the three new atoms for egg/non-veg/meat words finds only
the rule statements ("not even egg", "no non-veg mark may be added").

Dev parity: the brief table is confirmed. Dev's `variant="egg"` test and story are dropped (C10). Dev's
"dot fills from the outline colour" is ALREADY covered (`currentColor` asserted).

Gate: ui/tokens green (ui 554). The TDD red was `Failed to resolve import "./diet-mark"`.
`storybook:test` 370/370, `format:check` exit 0.

## Task 14: PriceTag (`b896a1a`)

Built `tokens/component/price-tag.json` (6 `TEXT` entries), the **contrast step**
(`contrast-pairs.json` group `inverse-text-on-brand-fill`: `color-text-on-inverse` on
`color-surface-brand`, min 3, exception `brand-fill`, placed after `on-brand-fill`) and
`atoms/price-tag/*` from the brief. Deviation: Prettier re-sorted the plan's PriceTag slot classes (`4e42d43`).

Dev parity: the brief table is confirmed. Dev's paise case is DROP (§7.4), and dev's `OnBrand` story is
ALREADY covered by the `tone` story's brand panel.

Gate: `pnpm nx run-many -t test -p @pink-paprikaa-web/design-tokens @pink-paprikaa-web/ui` gave tokens
234 (232 plus the new contrast group's cases) and a TDD red of `Failed to resolve import "./price-tag"`.
Then typecheck, lint and test succeeded for both projects (ui 576). `storybook:test` 378/378.

## Whole batch

- Cold run (`sb-vitest` cache moved aside):
  `pnpm nx run-many -t typecheck lint test -p storybook design-tokens ui --skip-nx-cache` gave
  "Successfully ran targets typecheck, lint, test for 3 projects". Results: design-tokens 234, ui
  576 (37 files), storybook 378 (35 files). It passed first time, with no "Failed to fetch dynamically
  imported module".
- `pnpm nx run storybook:build --skip-nx-cache`: "Successfully ran target build".
- `format:check` exit 0 after the two plan re-sorts; `sync:check` "All files are up to date";
  `pnpm guard:founder` "clean".

## Concerns

- None blocking. The Rating `OnSurfacesStory` is an addition the brief did not ask for (deviation 4).
