# Batch E report — carried fixes E1–E6, Task 8 (SiteFooter), Task 9 (ActionDock)

Base: `10802c8` (feat/design-system, tree clean). `stash@{0}` untouched.
Recovery base (second implementer): `0fedb1c`, with Task 8 WIP uncommitted in the tree.

## Status log (resume point)

- [x] Read contract, global constraints (Review Focus 4/5), progress (R111/R112, 3b conventions), fold list (items 18–21, 23–26), carried-fixes-E, briefs 8/9, plan Tasks 5/7/8/9 at HEAD, batch D report, AUTHORING.md.
- [x] E1 Chromium probe — heading inside `<summary>` IS exposed (Chromium 151). E1 kept.
- [x] E1 + E2 `c3398ab`, E3 `0c103f6`, E4 `3e43f63`, E5 `1e346a2`, plan sync Tasks 5/7 `0fedb1c`
- [x] Task 8 SiteFooter — recovered WIP audited (= plan + fold 18/19/20/21/23), RED seen for the 2 fold tests against plan code, gate green; `99bc2a7`, re-sort `cbbdfb3`, plan sync `6484468`
- [x] Task 9 ActionDock — RED (cannot resolve `./action-dock`), GREEN 7, Chromium footer-clearance play (RED without clearance); `7073893`, re-sort `4df23bf`, plan sync `52e18e8`
- [x] Final: format:check green, storybook:test 891 green, guard:founder clean

## Carried fixes E1–E6

Done by the first implementer (see the commits above; E1 probe log `W/batch-E-e1-probe.log`). E6 is an
overlay note: Task 8 and Task 9 have no phone frame. Task 9's stories are full-page (fixed dock over a
page + footer), not framed; nothing wraps a wider element.

## Task 8 — SiteFooter

### Recovery audit

The dead implementer's WIP (`site-footer.{tsx,test.tsx,stories.tsx}`, `site-footer.json`, `index.ts`
export block, three `SPACING` names) was diffed against the plan's Task 8 code at `0fedb1c`:

- `site-footer.json`, `SPACING` entries, barrel block: identical to the plan.
- `site-footer.tsx` = plan + fold 18 (`isShown(brand)` / `isShown(legal)` drive `hasBrandBlock` /
  `hasLegalBar` and the legal-text wrapper) + fold 19 (`role="list"` on the social `ul`, the policies
  `ul`, and a column's `ul` when the column renders as `div`; the `ul` inside a column `nav` takes none)
  + Prettier's class sort of `grid` (plan was unsorted). Fold 21 (`bg-transparent` layer) and fold 23
  (R111 social names) were already in the plan.
- `site-footer.test.tsx` = plan + 2 tests: "renders no brand block and no legal bar for empty brand
  and legal slots" (fold 18) and "gives every list outside a nav explicit list semantics" (fold 19).
  14 tests.
- `site-footer.stories.tsx` = plan + a `proveRingsWhole` play (tab through every link, `:focus-visible`,
  `ringClippers(link)` is `[]`, from `lib/story-ring.ts`) on `DesignSystemPink` and `HandoffInk`
  (inherited by `Mobile`/`Tablet`/`Desktop`). Fold 20 does not name Task 8; harmless and cheap — kept.
- Nothing missing against brief + fold list. Barrel placement (fold 25): after `quote-panel`, before
  `stat-band` — path order.

### TDD

RED (probe: WIP `site-footer.tsx` backed up to /tmp, plan's version swapped in, test run, WIP restored
byte-identical via `cmp`): 14 tests, **2 failed** — exactly the two fold tests. GREEN with the WIP: 14.

### Dev parity (plan table, extended)

| Dev item | Ruling | Where / clause |
| --- | --- | --- |
| The `contentinfo` landmark | ALREADY | test "is the page's contentinfo landmark…" |
| White lockup built in | DROP | D9 — the `brand` slot (stories pass `<Logo tone="white">`) |
| Floods `bg-surface-brand` | ADD | the tone `it.each` asserts the background class |
| Default columns, blurb, statement, FSSAI licence, legal entity, policies, social | DROP | D9 — the August fake FSSAI default; Review Focus 5 test |
| Caller columns replace everything | ALREADY | test "renders exactly what it is given…" |
| Social links named, new tab, `rel` | ALREADY | test "names each social link and opens it in a new tab" (name carries "(Opens in a new tab)", R111) |
| Social links keep the 44px hit target | ALREADY | IconButton's `::before` hit area (Plan 2a) |
| Generic glyphs for the networks (AtSign, Play, Briefcase) | DROP | D10 — the real brand glyphs |
| Policy links | ALREADY | test "renders the brand block, legal lines and policy links…" |
| Column headings as `<p>` | DROP | spec §9.3 — "headings not `<p>`" |
| `Link variant="inverse"`, `Divider on="brand"` | DROP | D5 |
| Merges a caller `className` | ADD | test "merges a caller className over its own, and the diamond layer lets that ground show" |
| axe | ALREADY | test "has no accessibility violations" |
| Stories Default · OneColumn · OwnCopy · Smallest | ALREADY | DesignSystemPink · ColumnsOnly · Playground (`brand` slot) · Mobile |
| Story FourColumns | ADD | `FourColumns` |
| (plan missed) Empty brand/legal slot renders no wrapper | ADD (fold 18) | test "renders no brand block and no legal bar for empty brand and legal slots" |
| (plan missed) Lists keep semantics in Safari | ADD (fold 19) | test "gives every list outside a nav explicit list semantics" |
| (plan missed) Focus rings whole | ADD | `DesignSystemPink` / `HandoffInk` plays (`ringClippers`) |

### Gates (Task 8)

- Prettier → `lint --fix` → Prettier again on the task's files: all unchanged.
- `design-tokens build && run-many typecheck lint test (ui, design-tokens) && storybook:build`: green —
  design-tokens 284 tests (4 files), ui **1492** tests (99 files).
- `pnpm nx run storybook:test`: 93 files, **884** tests passed (warm cache, no retry needed).
- `pnpm nx format:check`: failed only on the plan doc (the new tokens re-sort its `grid` class) →
  `docs: re-sort` commit `cbbdfb3`; then green.
- `pnpm guard:founder`: clean.

### Commits

- `99bc2a7` feat(ui): add the SiteFooter organism
- `cbbdfb3` docs: re-sort the site footer classes in plan 4
- `6484468` docs: bring plan 4's site footer code in line with the build (test/tsx/stories blocks = build;
  Step 5 "PASS (14 tests)")

## Task 9 — ActionDock

Dev reference: none (handoff component). Plan Task 9 at HEAD == `task-9-brief.md` byte for byte.

### Built

Token file, `SPACING` (`action-dock-bottom`, `action-dock-float`), `action-dock.tsx`, test and barrel
block verbatim from the brief (barrel first among organisms — path order). APIs checked against the
installed atoms: Button `size="lg"`, `icon`, `asChild`; IconButton `variant="secondary"`, `size="lg"`,
`label`, `asChild` (its `inline-flex` and the caller's `md:hidden` survive twMerge — different variants).

### TDD

RED: "Failed to resolve import "./action-dock"" (no tests). GREEN: 7 tests.

### Deviations

1. **Stories gain a `proveFooterClear` play** on `Mobile`, `Tablet`, `Desktop`: scroll the story page
   to the bottom (`behavior: "instant"`), assert the footer's last legal link ("Refund & Cancellation")
   ends at or above the dock's top edge. Why: Review Focus 4's unit test only pins classes and token
   strings; this proves the geometry in Chromium at all three dock shapes. RED probe (decorator's
   `hasDockClearance` → `{false}`, file backed up and restored byte-identical): Mobile / Tablet /
   Desktop failed (739 > 705, 983 > 946, 859 > 822); restored → pass.
2. Prettier sorted the root class string (plan unsorted) and lint `--fix` moved the test's imports;
   the plan doc was re-sorted (`4df23bf`) and synced (`52e18e8`).

### Gates (Task 9)

- Prettier → `lint --fix` → Prettier again: unchanged.
- Gate: green — design-tokens 284 (4 files), ui **1499** (100 files); storybook build green.
- `pnpm nx run storybook:test`: 94 files, **891** tests passed (action-dock 5 stories).
- `pnpm nx format:check`: plan doc only → re-sort commit; after the sync, green.
- `pnpm guard:founder`: clean.

### Commits

- `7073893` feat(ui): add the ActionDock organism
- `4df23bf` docs: re-sort the action dock classes in plan 4
- `52e18e8` docs: bring plan 4's action dock code in line with the build

## Concerns

1. **A second lint-staged backup stash.** The first attempt at the Task 8 plan-sync commit failed in
   lint-staged ("Failed to stage changes from tasks", a git error — probably the parallel review seat
   touching the index). The staged change survived; the retry committed it (`6484468`). lint-staged left
   `stash@{0}` (`858868d`, "lint-staged automatic backup"); the original backup is now `stash@{1}`.
   Neither was dropped — the controller decides.
2. Task 8's ring plays are beyond fold 20's case list (it does not name Task 8) — inherited from the
   WIP and kept; Task 9's footer-clearance play is beyond the brief. Both are story-only additions,
   recorded in the plan.
