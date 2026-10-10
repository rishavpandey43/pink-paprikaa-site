# Batch D report — carried fixes D1–D7, Task 6 (QuotePanel), Task 7 (OrderTracker)

Base: `01e9c61` (feat/design-system, tree clean). `stash@{0}` (`5271974…`, "lint-staged automatic
backup") untouched — its hash was checked after every commit.

## Status log (resume point)

- [x] Read contract, global constraints, progress (R94/R110/R111, 3b conventions), fold list, carried-fixes-D, briefs 6/7, plan Task 6/7 at HEAD, batch C report, AUTHORING.md.
- [x] D1–D4 `cce6d21` (tests; RED by mutation), D5 `fe0ebb7` (RED seen), D6 `e452b9c`, D7 + plan sync `7a5c1ca`
- [x] Task 6 QuotePanel — `86e4ef3` (+ `lib/story-ring.ts`), plan re-sort + sync `9b5eac3` (gate, format:check, storybook:test green)
- [x] Task 7 OrderTracker — `9ab6abe`, plan sync `10802c8` (gate, format:check, storybook:test green)
- [x] Final: format:check exit 0, storybook:test 872 / 92 files exit 0, `pnpm guard:founder` clean, tree clean, `stash@{0}` = `5271974…`

## Carried fixes

| Fix | Commit | What changed | Evidence |
| --- | --- | --- | --- |
| D1 | `cce6d21` test(ui) | StatBand "colours the numbers brand on soft and white on the flooded fields" now rerenders `tone="brand"` and asserts `text-text-on-inverse` between the soft and ink checks. | RED: `STAT_TONE.brand = "brand"` → this test failed |
| D2 | `cce6d21` test(ui) | Dropped StatBand "renders no sub-line wrapper for an empty sub". The `0`-sub test stays (a falsy number does tell `isShown` from truthiness). StatBand 14 → 13 tests. | — |
| D3 | `cce6d21` test(ui) | HeroBanner's single pattern test became: `it.each(["brand","ink","soft"])` "carries the diamond on the %s field by default"; "carries no diamond on the alt tint unless asked, nor on a flooded field with pattern=none" (alt → none, alt+faint → layer, brand+none → none); "hands the faint density to the diamond" (the layer's tint span has `pattern-opacity-faint`, and `pattern-opacity-default` without the prop). | RED: `DEFAULT_PATTERN` ink/soft → `none` failed the ink/soft rows; dropping `density={density}` failed the faint test; gating the layer on `pattern === undefined` failed the `none` row |
| D4 | `cce6d21` test(ui) | New HeroBanner test "sets the split media beside the copy from lg and stacks it below; center has one column": split inner has `grid lg:grid-cols-2` and no unprefixed `grid-cols-*` (one column below `lg`); center lacks `lg:grid-cols-2`. Took the assertion, not a reword. | RED: split `inner: ""` failed it |
| D5 | `fe0ebb7` fix(ui) | HeroBanner filters `meta` through `isShown` before rendering; a list of no shown facts renders no `ul`. Test "skips an empty meta fact — no bare item, no stray diamond — and a list of none" (`["Est. 2025", "", "Sector 57, Gurgaon"]` → 2 items, 1 diamond; `["", null]` → no list). HeroBanner 17 → 23 tests. | RED first: 1 failed, 22 passed; then green |
| D6 | `e452b9c` docs(tokens) | `stat-band-gap` gains `"$description": "Gap between the stats on the band's grid (design system StatBand)."` | design-tokens 284 green |
| D7 | `7a5c1ca` docs | Plan Tasks 2–4 code blocks replaced with the built files (StatBand test + token, HeroBanner test + component, TestimonialWall test + component — the last two carry the built `role="list"`). Counts: StatBand 14 → 13, HeroBanner 17 → 23. Parity rows: StatBand numbers row "(all three tones)", the empty-sub row now names only the 0-sub test; HeroBanner split row names the D4 test, new rows for the empty meta fact (D5) and the pattern defaults (D3); TestimonialWall gains the `role="list"` row. | Comparison script over Tasks 1–5: all 20 blocks byte-identical to their files after Prettier |

Ran the full gate after D5/D6: design-tokens 284 / 4 files; ui 1447 / 96 files (1442 − 1 + 5 + 1); Storybook build ok (`/tmp/ppD-dfix-gate.log`).

## Task 6 — QuotePanel

**Built:** `packages/design-tokens/tokens/component/quote-panel.json` (`quote-panel-pad` spacing, `quote-panel-amount` typography composite; no R61 marker — `p` and `text` uses only), appended to `SPACING` / `TEXT`; `organisms/quote-panel/{quote-panel,quote-panel.test,quote-panel.stories}.tsx`; barrel entry between HeroBanner and StatBand (path order); **`packages/ui/src/lib/story-ring.ts`** (fold item 20): `ringClippers(element)` promoted verbatim from 3b's CouponTicket copy, doc comment says stories only / never exported. It is a `story-*` file (library-source scan excludes it) and not in `src/index.ts`. The two 3b copies stay (final fix wave). `dist/theme.css`: `--spacing-quote-panel-pad: clamp(18px, 3vw, 28px)`, `--text-quote-panel-amount: clamp(44px, 6vw, 60px)` + line-height 1, letter-spacing −0.03em, weight 800.

Struck price: `lib/struck-price`'s `StruckPrice` with `label={wasLabel}` (default `"was"`, lower-case, R94); the test asserts the `<s>` reads "was ₹140".

TDD: test first — `Failed to resolve import "./quote-panel"`, no tests; after the implementation 15/15. The item-18 pair was seen RED separately (every `isShown(x) ?` swapped for `x ?` → the 0-slot test failed, 14 passed). The ring play was seen RED: with `p-quote-panel-pad` removed, HandoffPlan, HandoffDawat, HandoffOffice and Mobile failed (4 failed, 4 passed).

**Deviations from the plan:**

- Fold item 18: `unit`, `was`, `note`, `alerts`, `action`, `footnote` gate on `isShown` (not truthiness). `badge` is a bare `{badge}` (no wrapper, no gate); `total` is an object, so it keeps `total ?`. Two tests added: "renders no wrapper for an empty unit, was, note, alerts, action or footnote" and "renders the wrapper for a 0 … — a number is content". 13 → 15 tests.
- Fold item 20: stories gain `proveRingsWhole` — tabs to every link in the canvas in DOM order and asserts focus, `:focus-visible`, and `ringClippers(link)` is `[]`. On HandoffPlan, HandoffDawat, HandoffOffice (two actions: the button and the ghost footnote) and Mobile (360, the padding's 18px floor). No geometry change was needed: the panel's padding holds the 2px + 2px ring.
- The plan's order test wrote `container.textContent ?? ""`; the installed DOM lib types an element's `textContent` as `string`, so `@typescript-eslint/no-unnecessary-condition` rejected the fallback. Dropped it.
- Prettier re-sorted the `root` (`… rounded-xl p-quote-panel-pad`) and `amount` classes once the tokens existed. The plan's Task 6 now equals the build in `9b5eac3` (re-sort plus everything above, the `story-ring.ts` block, the Files list and the Step 8 `prettier`/`git add` lists).
- R44/R111: the stories' actions are same-tab WhatsApp links (no `target="_blank"`), so no new-tab announcement applies.

**Dev parity:** none — QuotePanel is a handoff component with no dev counterpart (plan: "Dev reference: none (handoff component)"). The handoff parity is the three calculator stories (HandoffPlan, HandoffDawat, HandoffOffice) using `rates.js` default-state numbers.

Contract deviation row as built: QuotePanel `+ wasLabel = "was"` (lower-case, R94), StruckPrice, `lines` through KeyValueList (split rows, compact, no dividers), `total` as its own `<dl>` row — matches the plan's row.

**Gates** (`/tmp/ppD-t6-gate.log`, `/tmp/ppD-t6-sbt.log`, `/tmp/ppD-t6-fmt.log`, `/tmp/ppD-t6-fmt2.log`):

- Prettier → `pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache` → Prettier: the first lint run failed on the `?? ""` (above); after the fix exit 0, no further changes.
- `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build` — exit 0. design-tokens 284 / 4 files; ui 1462 / 97 files (1447 + 15); Storybook build ok.
- `pnpm nx run storybook:test` — exit 0, 865 / 91 files (`quote-panel.stories.tsx` 8; docs-kit `catalogue.spec.ts` 160). No cold-cache failure.
- `pnpm nx format:check` — red on the plan doc only (the re-sort); after `9b5eac3` exit 0.

**Commits:** `86e4ef3` feat(ui): add the QuotePanel organism · `9b5eac3` docs: re-sort the quote panel classes in plan 4 and bring its code in line with the build.

## Task 7 — OrderTracker

**Built:** `organisms/order-tracker/{order-tracker,order-tracker.test,order-tracker.stories}.tsx`; barrel entry between HeroBanner and QuotePanel (path order). No tokens (4px scale). Component and test are the plan's code verbatim (no Prettier re-sort). Consumed APIs checked against the build: StepTracker spreads `ComponentProps<"ol">` (so `aria-label` names its `role="list"` `<ol>`) and marks the current `<li>` `aria-current="step"`; Card `variant="quiet" padding="sm"`; Divider `variant="diamond"`; Text `variant="mono" | "h2" | "body-sm"`, `weight="bold"`; `formatRupees` from `@pink-paprikaa-web/utils`.

R110 delta 3: `progressLabel = "Order progress"` → StepTracker `aria-label`, an overridable chrome label.

TDD: test first — `Failed to resolve import "./order-tracker"`, no tests; after the implementation 11/11. The two `progressLabel` tests were seen RED with the `aria-label` forward removed (2 failed, 9 passed). The ring play was seen RED with the body's `p-5` removed (OrderIn, AsCard, Mobile failed).

**Deviations from the plan:**

- Fold item 20: stories gain `proveActionRingWhole` (tab to "Back to Home", assert focus, `:focus-visible`, `ringClippers(action)` is `[]`) on `OrderIn` (flush, `overflow-y-auto`), `AsCard` (`overflow-hidden`) and `Mobile`.
- **Plan story defect, fixed:** the meta decorator wrapped every story — `AsCard` included — in the 340px phone frame (`w-85 … overflow-hidden`), while `AsCard`'s own decorator sets `w-100` (400px). The frame cut the card's right edge, and the new play failed on that frame (its only clipper). The meta decorator now wraps only the flush variant (`args.variant === "card" ? <Story /> : <frame>`), with a comment. Plan Task 7's stories block synced in `10802c8`, plus two `_(not in dev)_` parity rows.
- No item-18 test: OrderTracker wraps no ReactNode slot — `badge` and `action` render bare; `note` and `outlet` are strings.

**Dev parity** (plan table, extended):

| Dev item | Ruling | Where / clause |
| --- | --- | --- |
| Leads with the current step's label and note | ALREADY | test "heads the screen with the current step…" (and a `status` live region) |
| The heading moves as the kitchen works | ALREADY | same test at `current={1}` |
| "Preparing" until the last step, then "Ready" | DROP | D9 — status copy is the `badge` slot (Contract deviations); stories `OrderIn` / `Ready` pass each |
| Clamps an index past the end | ALREADY | test "clamps a current index past the end…" |
| Code and outlet on one line | ALREADY | test "prints the order code with its label and the outlet" |
| StepTracker composed, current step marked | ALREADY | test "marks the current step in the tracker, named Order progress" |
| The tracker list is named ("Order progress") | ADD | contract delta 3 (R110): `progressLabel`; tests "marks the current step…", "takes the tracker's name from progressLabel" |
| Bare-string steps | DROP | spec §8.2 — object lists only |
| What was paid and how | ALREADY | test "formats the total beside the payment line" (dev's PriceTag → `formatRupees` text) |
| No action when there is nowhere to go | ADD | test "renders no action when none is given" |
| `onDone` / `doneLabel` | DROP | spec §8.1 — slots, not callbacks (`action`) |
| Card frame rounds and clips | ALREADY | test "frames itself as a light card with variant=card" |
| Merges a caller `className` | ADD | test "merges a caller className" |
| axe | ALREADY | test "has no accessibility violations" |
| Default steps, code, outlet, payment, total | DROP | D9 |
| Stories Default · EveryState · WithAction · CardFrame | ALREADY | Playground · OrderIn/OnTheTandoor/Ready · Playground (`action` arg) · AsCard |
| Story DeliverySteps | ADD | `DeliverySteps` |
| Story Smallest | ADD | `Mobile` |
| _(not in dev)_ the action's ring clears every clip | ADD | fold item 20; `play` on `OrderIn`, `AsCard`, `Mobile` |
| _(not in dev)_ the card is not framed as a phone | ADD | meta decorator frames only `variant="flush"` |
| Dev `steps.length === 0` guard (index 0) | not carried | see concerns — an empty `steps` renders an empty heading |

Contract deviation row as built: OrderTracker `+ badge?`, `+ codeLabel = "Order"`, `+ paymentLabel = "Paid"`, `+ headingLevel = 2`, and (R110) `+ progressLabel = "Order progress"` — matches the plan's rows.

**Gates** (`/tmp/ppD-t7-gate.log`, `/tmp/ppD-t7-sbt.log`, `/tmp/ppD-t7-fmt.log`, `/tmp/ppD-t7-fmt2.log`):

- Prettier → `pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache` → Prettier: exit 0, no changes.
- Same gate chain — exit 0. design-tokens 284 / 4 files; ui 1473 / 98 files (1462 + 11); Storybook build ok.
- `pnpm nx run storybook:test` — first run exit 1: 871 passed, 1 failed (`AsCard`, the frame defect above). After the fix exit 0, 872 / 92 files (`order-tracker.stories.tsx` 7; docs-kit `catalogue.spec.ts` 160). No cold-cache failure in this batch.
- `pnpm nx format:check` — exit 0 (before and after the plan sync).
- `pnpm guard:founder` — clean.

**Commits:** `9ab6abe` feat(ui): add the OrderTracker organism · `10802c8` docs: bring plan 4's order tracker stories in line with the build.

## Test counts

| Point | design-tokens | ui | storybook:test |
| --- | --- | --- | --- |
| Base `01e9c61` (batch C) | 284 / 4 | 1442 / 96 | 856 / 90 |
| After D1–D6 | 284 / 4 | 1447 / 96 | — |
| After Task 6 | 284 / 4 | 1462 / 97 | 865 / 91 |
| After Task 7 | 284 / 4 | 1473 / 98 | 872 / 92 |

## Concerns

- **Plan Task 7's `AsCard` story was broken** (a 400px card inside the 340px phone frame, its edge cut). The fold-item-20 play caught it; the meta decorator now frames only the flush variant. Later tasks with a framed meta decorator and a wider variant story (Task 11 Dialog, Task 15 CartPanel) should check the same.
- **OrderTracker with `steps=[]`** clamps to index −1 and renders an empty `h2` (an axe `empty-heading` risk) and an empty list. Dev guarded `steps.length === 0`. The plan neither tests nor guards it; left as built for the reviewer (fix: guard the index, or type `steps` as a non-empty tuple).
- **Plan syncs went beyond the re-sort.** Each task's `docs:` commit makes the plan's code equal to the build (as D7 asked for Tasks 2–4), so the next review needs no C3/D7-style catch-up: Tasks 1–7 all match their files.
- **D2 judgment:** only the empty-string sub test was dropped. The `0`-sub test stays, because a falsy number does tell `isShown` from truthiness.
- `docs-kit` `catalogue.spec.ts` went 159 → 160 for Task 6's two tokens (one spacing, one text), not 161. It passed, but if the catalogue should list text tokens too, the reviewer may want to look.
- No concurrent edits observed: the plan file and tree changed only through this batch's commits.
