# Batch A report — Plan 4 Task 0 + Task 1

Base: `35f4fd9` (feat/design-system, tree clean).

## Status log (resume point)

- [x] Task 0 Step 1 baseline gate — green (design-tokens 284 tests / 4 files, ui 1376 tests / 91 files)
- [x] Task 0 Steps 2–4a checks
- [x] Task 0 fold list written (W/task-0-fold-list.md, 25 items)
- [x] Task 0 plan patch committed — `5e7ec89`
- [x] Task 1 built + gated + committed — `27d80ac`, plan re-sort `bd2171f`

## Task 0 — reconcile

See `task-0-fold-list.md` (binding overlay; "Checks run" table holds every command and result).

- Commit `5e7ec89` `docs: reconcile plan 4 with the built atoms and molecules` — plan file only.
- Patched into the plan: the seven R110 deltas (code, tests, stories, parity rows, deviation rows), Rating "5.0 out of 5", ReviewCard brand → `data-surface="soft"`, SymbolMark selector, R61 markers (T1, T10, T11, T12, T15), countdownLabel dropped (T12), lower-case commit subjects, Dialog `isShown`.
- Overlay only (implementers apply): `isShown` gates, `role="list"`, ring-clipping plays + `lib/story-ring.ts`, PatternField layer `bg-transparent`, R44 announcements (T8, T13), 3b story conventions, barrel placement.
- Task 13 Step 1 is NOT skipped: a literal `role="region"` + `tabIndex={0}` fails the current lint config (probe run, deleted).
- Uncommitted working-tree changes NOT mine and left alone: `docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md` (owner rulings C17/C18) and the 3b records `progress.md`.
- Concurrent-edit incident: during patching, the plan file gained text I did not write (a second MenuList lede test, duplicated defaultCategory tests and prop). Removed before commit; the committed diff was re-read.

## Task 1 — CtaBand + story fixtures

**Built:** `packages/design-tokens/tokens/component/cta-band.json` (`cta-band-y`, `cta-band-copy` with
its `["max-w"]` R61 marker), both appended to `SPACING`; `packages/ui/src/organisms/story-fixtures.ts`
(byte-identical to the brief: real BRAND facts, the four verified Google reviews with R17's "[…]"
elision, `VIEWPORT_360/768/1024/1280`); `organisms/cta-band/{cta-band,cta-band.test,cta-band.stories}.tsx`
(12 stories, byte-identical to the brief); barrel entry after the molecules block.

TDD: the test file ran first and failed with `Failed to resolve import "./cta-band"` (0 tests);
after the implementation, 13/13 pass.

**Deviations from the brief (all from the fold list):**

- Item 13: `cta-band-copy` carries `"$extensions": { "pink-paprikaa": { "utility": ["max-w"] } }` — without it the catalogue spec in `storybook:test` fails (used only as `max-w`).
- Item 18: `overline`, `body`, `action` gate on `isShown`; new test "renders no wrapper for an empty overline, body or action" (13 tests, brief said 12).
- Item 21: the `pattern` slot is `absolute inset-0 bg-transparent`, so PatternField's own tone ground no longer covers the band's or a caller's; the merge test also asserts the layer has `bg-transparent` and not `bg-surface-inverse`.
- Commit subject lower-case ("add the CtaBand organism…"), item 1.

**Dev parity** (plan table, extended):

| Dev item | Ruling | Where / clause |
| --- | --- | --- |
| Overline, heading and body render | ALREADY | test "renders the overline, a level-2 title…" |
| `headingLevel` | ALREADY | test "takes its heading level from headingLevel" |
| The action stays clickable | ADD | test "keeps the action clickable" |
| Nothing extra without an action | ALREADY | test "renders nothing but the title…" |
| Each tone floods its `bg-surface-*` ground | ADD | tone `it.each` (background class + `data-surface`) |
| Split: action beside the copy (`shrink-0`) | ADD | test "sits the action beside the copy with align=split" |
| Centre: action stacks under the copy (`justify-center`) | ADD | test "stacks and centres…" |
| Type inverts on ink/brand, dark on soft | DROP | D5 — text follows `data-surface` |
| Merges a caller `className` | ADD | test "merges a caller className over its own, and the diamond layer lets that ground show" |
| axe | ALREADY | test "has no accessibility violations" |
| Heading always the fluid `h2` step | ALREADY | `variant="h2" isFluid` |
| `on="brand"` on the action's Button | DROP | D5 |
| "One action, never two" | DROP | D2 — handoff bands carry two (`HandoffOfficeStrip`, `HandoffTasteFirst`) |
| Exported `CtaBandTone` | ALREADY | `CtaBandProps["tone"]` |
| Stories Default · Split · Centred · Tones · Narrow | ALREADY | Playground · InkSplit · BrandCentred · InkSplit/BrandCentred/SoftSplit · Mobile |
| Story HeadingOnly | ADD | `HeadingOnly` |
| Story WithoutAction | ADD | `WithoutAction` |
| *(not in dev)* tiled diamond layer, `pattern` default/faint/none | ADD | spec C7; test "carries the tiled diamond…", story `WithoutPattern`, `HandoffTasteFirst` |
| *(not in dev)* empty slot renders no wrapper | ADD | fold item 18; test "renders no wrapper…" |
| *(not in dev)* caller ground visible through the diamond | ADD | fold item 21; merge test |

**Gates** (`/tmp/ppA-t1-gate.log`, `/tmp/ppA-t1-sbt.log`):

- `pnpm exec prettier --write …` + `pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache` — clean (lint --fix exit 0; it re-sorted the inner slot's classes).
- `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build` — exit 0. design-tokens 284 tests / 4 files; ui 1392 tests / 92 files (baseline 1376 + 13 CtaBand + 3 index.spec rows for the new `organisms` tier); Storybook build ok.
- `pnpm nx run storybook:test` — exit 0, 807 tests / 86 files (catalogue spec 153 incl. the `cta-band-copy` marker; `cta-band.stories.tsx` 12 story tests in chromium). No cold-cache failure.
- `pnpm nx format:check` — first run red on the plan file only: Prettier's Tailwind plugin re-sorts `py-cta-band-y` once the token exists (3b precedent). Fixed in its own `docs:` commit `bd2171f`; re-run exit 0.

**Commits:** `27d80ac` feat(ui): add the CtaBand organism and the organism story fixtures · `bd2171f` docs: re-sort the cta band classes in plan 4 now that its token exists.

## Concerns

- C1 (fold item 23): the IconButton new-tab label wording for Task 8 ("`<label>` (opens in a new tab)") is my pick, not a ruling — confirm before batch E.
- The plan file changed under me during Task 0 (text I did not write appeared in the MenuList section); cleaned before commit. If another agent shares this tree, later batches risk the same.
- Fold item 18 asks every later task for an empty-slot test, which raises each task's expected test count by one.
