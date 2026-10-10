# Batch A report — Plan 3b, Tasks 0 and 1

Base `a1b3112`. Commits: `307c93e` (T1), `198ef93` (plan-doc re-sort). Task 0: no commit (no code change).

## Task 0 — reconcile

Built: `task-0-fold-list.md` — the Step 3 table (a–l), the Radix / packages / 3a-molecule / R13 / R15 /
R19 / veg / traps checks, **7 binding overlay items**, notes and the pre-flight table.

Findings (all written as overlay items):

1. Commit subjects lower-case — Tasks 1–20 (every brief writes `feat(ui): <Name> molecule`).
2. Barrel sorted by path — Tasks 1–20 (briefs say "append").
3. R83 `createElement(headingTag(level), …)` — Tasks 1, 2, 3, 14, 15, 16, 17 (briefs use `const Heading`).
4. `OnSurfaces` story name clash → `OnSurfacesStory` + `name: "OnSurfaces"` — Tasks 1, 6, 12, 13, 14, 15.
5. `floor360` globals get `isRotated: false` — Tasks 1, 2, 3, 9 (consistency).
6. **Fact d differs:** Rating names itself `"5.0 out of 5"` (one decimal) — Task 4's test.
7. R61 markers, computed by script over every `--spacing-*` token + the new ones against the briefs'
   component code: T8 `offer-seal` `["size"]`; T9 `coupon-ticket-md/lg` `["max-w"]`, `-stub-md/lg`
   `["w"]`, `-notch` `["size"]`; T20 `table-sm/md/lg` `["min-w"]`; T16 `pricing-card-pad` none (`p-`).

Held (no fold): Radix 1.6.7 ToggleGroup roles/props, lucide 1.30 icon names, utils exports, no 3a
molecule consumed in code (prose refs resolve), R13, R15, R19, R75, veg-only (C10), brand spelling,
no founder names, no `font-normal`, no Icon-label-vs-textContent assertion, no TS2322 cast site,
dev-parity tables present (T1–9 tables, T10–20 "none"), Countdown accepts `Z`, T19's expiry test pins
fake time (no date bomb). Note, not folded: PriceTag's hidden `was ` vs T10/T16's `Was ` (tests pin it).

Baseline gate at `a1b3112`: green — tokens 272, ui 1088 (69 files), Storybook build OK,
format:check OK, storybook:test 627 (63 files).

## Task 1 — MenuItemRow

Built: `packages/design-tokens/tokens/component/menu-item.json` (`text-menu-item-name`,
`text-menu-item-devanagari`), `TEXT` entries, `molecules/menu-item-row/menu-item-row.{tsx,test.tsx,stories.tsx}`,
barrel export (between `list-row` and `otp-input`). Tokens verified in `dist/theme.css`
(`--text-menu-item-name: 17px` + line-height/letter-spacing/weight; `--text-menu-item-devanagari: 15px`).

TDD: test first failed with `Failed to resolve import "./menu-item-row"`; then 13/13 pass. The
`@ts-expect-error` on `diet="egg"` is used (typecheck green).

Deviations from the brief (all fold items or tooling):
- Heading rendered with `createElement(headingTag(headingLevel), …)` (fold 3 / R83).
- Story `OnSurfacesStory` with `name: "OnSurfaces"` (fold 4); `Narrow` uses `isRotated: false` (fold 5).
- Export inserted at its sorted place (fold 2); commit subject `feat(ui): add the MenuItemRow molecule` (fold 1).
- Prettier re-sorted `name`/`nameDevanagari` classes (`font-display text-menu-item-name …`) once the
  new text tokens existed; the same re-sort hit the plan doc (T1 and T2 blocks) — committed separately
  as `198ef93 docs: re-sort the menu item classes in plan 3b`.

### Dev parity (brief table, extended)

| Dev item | Ruling | Where |
| --- | --- | --- |
| Dish name is a heading; price printed | ALREADY | tests "names the dish…", "prints the price…" |
| `nameAs` picks the name element (incl. `"p"`) | ALREADY | `headingLevel` (spec §8.1) |
| `was` struck through (`<s>`) | ALREADY | PriceTag owns the `<s>`; test asserts both prices |
| `diet` prop, veg default, `egg` mark; `DietMarks` story | DROP | C10 — test "takes no diet prop" |
| Heat named for assistive tech | ALREADY | test "shows the heat…" ("Spice level 3 of 4") |
| No heat scale on a dish without heat | ADD | test "renders no heat scale…" |
| Devanagari name `lang="hi"`; badge | ALREADY | tests "marks the Devanagari…", "shows the heat, the badge…" |
| `onAdd` → built-in Add button | DROP | spec §9.2 (`action` slot) |
| Add button's accessible name carries the dish | ADD | `action` JSDoc; stories' `addButton(name)` |
| No control on a menu that cannot take orders | ADD | test "renders no control…" |
| Labelled placeholder until a photo; photo with its alt | ALREADY | test "labels the photo placeholder…" |
| Hairline divider on / off | ALREADY | test "draws the hairline divider…" |
| Caller `className` replaces the row's own padding | ADD | test "lets a caller className replace its own padding" |
| axe on the fullest state | ALREADY | last test |
| Thumbnail 80px at 360, 104px from `sm` | ADD | `thumbnail: "size-20 shrink-0 sm:size-26"` |
| `min-w-0` so a long name wraps | ALREADY | `body: "min-w-0 flex-1"`; `Narrow` play |
| Stories `Default`, `WithDevanagariName`, `Discounted` | ALREADY | `Playground`/`Full`, `Devanagari`, `Discount` |
| Stories `AsAMenuSection`, `SpiceLevels`, `WithCustomAction`, `Narrow` | ADD | `AsAMenuSection`, `SpiceLevels`, `InCart`, `Narrow` |
| (extra) Dev root `gap-4 sm:gap-5`; brief `gap-5` at every width | Brief wins | `Narrow` play proves no overflow at 360 |
| (extra) Dev placeholder label `"Dish photo 1:1"` | Brief wins | documented default `"Dish photo"` |
| (extra) Dev root `<div>`; brief `<article>` | Brief wins | tests query `role="article"` |

### Gate

```
pnpm exec prettier --write <paths>                         # ok
pnpm nx lint @pink-paprikaa-web/ui --fix …                 # ok
pnpm nx build @pink-paprikaa-web/design-tokens             # Successfully ran target build
run-many typecheck lint test (ui, design-tokens)           # tokens 272 passed (4 files); ui 1101 passed (70 files)
pnpm nx run @pink-paprikaa-web/storybook:build             # Storybook build completed successfully
pnpm nx format:check                                       # first run: plan doc + tsx unsorted → prettier --write → green
pnpm nx run storybook:test                                 # 637 passed (64 files) — +10 MenuItemRow stories incl. Narrow play
```

First gate run: `pnpm exec prettier --write $P` did not split paths under zsh (prettier "No files
matching"), so format:check failed on the plan doc and `menu-item-row.tsx`; re-ran prettier with
explicit paths and the ui gate + format:check + storybook:test: all green (above).

## Other

- `stash@{0}` (`5271974`, lint-staged backup from 3a) left untouched. No `git checkout`, no stash use.
