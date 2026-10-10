# Batch B report — Plan 4 Task 2 (StatBand) + Task 3 (HeroBanner)

Base: `120b837` (feat/design-system, tree clean). End: `25c4f15`, tree clean.

## Status log (resume point)

- [x] Read contract, global constraints, progress (R110/R111), fold list, briefs, plan Task 2/3. Plan vs briefs: only the SymbolMark selector (fold 12) and the lower-case commit subjects (fold 1) differ — plan used.
- [x] Task 2 StatBand — committed `5a1d1a8`, plan re-sort `8f5df49` (gate, format:check, storybook:test green)
- [x] Task 3 HeroBanner — committed `e4b26e4`, plan re-sort `25c4f15` (gate, format:check, storybook:test green)
- [x] Final storybook:test on `25c4f15` — 833 / 88 files; `pnpm guard:founder` clean

## Task 2 — StatBand

**Built:** `packages/design-tokens/tokens/component/stat-band.json` (`stat-band-y`, `stat-band-gap`; no R61
marker — both are used only as `py`/`gap`), appended to `SPACING`; `organisms/stat-band/{stat-band,
stat-band.test,stat-band.stories}.tsx` (stories byte-identical to the plan, 10 stories); barrel entry
in the organisms block, path order (`cta-band`, `hero-banner`, `stat-band`).

TDD: test file ran first — `Failed to resolve import "./stat-band"` (no tests); after the
implementation 13/13 pass.

**Deviations from the plan (all fold-list overlays):**

- Item 21: the `pattern` slot is `absolute inset-0 bg-transparent`; the merge test now also asserts
  the layer has `bg-transparent` and not `bg-surface-brand-soft` (renamed "…and the diamond layer
  lets that ground show", CtaBand's wording).
- Item 19: the grid `ul` carries `role="list"`; the grid test asserts the attribute.
- Item 18 (applied in spirit — the item lists Task 3, not Task 2): StatBand wraps no slot itself
  (Stat already gates `sub` on `isShown`), so the added test proves an empty `sub` renders no
  sub-line span — "renders no sub-line wrapper for an empty sub". 13 tests (plan said 12).
- Prettier re-sorted the grid slot's classes (`relative container-page grid autogrid-min-sm
  gap-stat-band-gap py-stat-band-y`); the plan doc's copy was re-sorted in `8f5df49`.

**Dev parity** (plan table, extended):

| Dev item | Ruling | Where / clause |
| --- | --- | --- |
| Every value and label render | ALREADY | test "lists every stat with its value, label and sub-line" |
| A sub-line only on the stat that carries one | ADD | test "renders a sub-line only for the stat that carries one" |
| One glyph per stat that asks for one | ADD | test "draws one glyph per stat that asks for one" |
| Each tone floods its `bg-surface-*` ground | ADD | tone `it.each` (background class + `data-surface`) |
| Numbers white on brand/ink, pink on soft | ADD | test "colours the numbers brand on soft and white on the flooded fields" |
| Every column centred | ADD | test "centres every stat so the row reads as one band" |
| Auto-fit grid survives 360px (`min(200px,100%)`) | ALREADY | `autogrid-min-sm` test; story `Mobile` (floor360) |
| Merges a caller `className` | ADD | test "merges a caller className over its own, and the diamond layer lets that ground show" |
| axe | ALREADY | test "has no accessibility violations" |
| `label`/`sub` as `string`, `icon` as `LucideIcon` | ALREADY | `ReactNode` / `IconComponent` (D10) |
| Exported `StatBandTone` | ALREADY | `StatBandProps["tone"]` |
| Stories Default · Tones · FourAcross · Narrow | ALREADY | Playground · Soft/Brand/Ink · FourStats · Mobile |
| Story WithIcons | ADD | `WithIcons` |
| Story WithSubLines | ADD | `WithSubLines` |
| "4.6 average guest rating", "7 sections" copy | DROP | prompt "only real, verifiable numbers" + spec §10.1 |
| Dev keyed stats by `label` | DROP | labels are `ReactNode` now; keyed by index (static list, never reordered) |
| *(not in dev)* caller ground visible through the diamond | ADD | fold item 21; merge test |
| *(not in dev)* explicit list semantics | ADD | fold item 19; grid test asserts `role="list"` |
| *(not in dev)* empty sub renders nothing | ADD | fold item 18 spirit; test "renders no sub-line wrapper for an empty sub" |

**Gates** (`/tmp/ppB-t2-gate.log`, `/tmp/ppB-t2-sbt.log`, `/tmp/ppB-t2-fmt.log`):

- `pnpm exec prettier --write …` + `pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache` — exit 0.
- `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build` — exit 0. design-tokens 284 / 4 files; ui 1405 / 93 files (1392 + 13); Storybook build ok.
- `pnpm nx run storybook:test` — exit 0, 819 / 87 files (`stat-band.stories.tsx` 10). No cold-cache failure.
- `pnpm nx format:check` — red on the plan doc only (class re-sort); fixed in `8f5df49`, re-run exit 0.

**Commits:** `5a1d1a8` feat(ui): add the StatBand organism · `8f5df49` docs: re-sort the stat band classes in plan 4 now that its tokens exist.

## Task 3 — HeroBanner

**Built:** `packages/design-tokens/tokens/component/hero-banner.json` (`hero-banner-y`,
`hero-banner-gap`; no R61 marker — `py`/`gap` only), appended to `SPACING`;
`organisms/hero-banner/{hero-banner,hero-banner.test,hero-banner.stories}.tsx` (stories copied
from the plan doc lines 1540–1829, 12 stories); barrel entry between CtaBand and StatBand.

TDD: test file ran first — `Failed to resolve import "./hero-banner"` (no tests); after the
implementation 16/16 pass.

**Deviations from the plan:**

- Item 18: `badges`, `overline`, `body`, `actions`, `media` gate on `isShown` (plan used
  truthiness); new test "renders no wrapper for an empty badges, overline, body, actions or media
  slot". 16 tests (plan said 15). `meta` stays on `meta.length > 0` (an array, not a slot).
- Item 19: the meta `ul` carries `role="list"`; the meta test asserts the attribute.
- Item 21: the `pattern` slot is `absolute inset-0 bg-transparent`; the merge test asserts the
  layer has `bg-transparent` and not `bg-surface-brand`.
- Item 12 was already patched in the plan (meta diamonds counted as `[aria-hidden="true"]`, 2).
- `WithPhotograph` story caption: the plan's `absolute right-6 bottom-6 left-6` became
  `absolute inset-x-6 bottom-6` — `pnpm nx lint --fix` (Tailwind shorthand rule) rewrote it and
  Prettier re-sorted. The plan doc still shows the long form (format:check does not flag it).
- Prettier re-sorted the `inner` slot's classes; the plan doc's copy was re-sorted in `25c4f15`.

**Dev parity** (plan table, extended):

| Dev item | Ruling | Where / clause |
| --- | --- | --- |
| The title is the page's `h1` | ALREADY | test "renders its title as the page's h1 by default" |
| The title is the fluid display step by default (`text-display-1-fluid`) | ADD | test "sets the title in the fluid display-1 step by default…" |
| Overline, body and actions render | ALREADY | test "renders the badges, overline, body and actions…" |
| Every meta fact, diamond between each pair | ALREADY | test "lists the meta facts…" |
| Headline ink class per tone | DROP | D5 — `data-surface` per tone (tested) |
| Default placeholder `imageLabel = "Hero food photography 4:5"` | DROP | D9; contract §7 `media` slot (Playground passes the labelled ImageSlot) |
| `image` / `imageAlt` / `imageCaption` props | DROP | contract §7 / spec §9.3 `media` slot (ImageSlot + overlays) |
| Caption on the `scrim-bottom` over a real photograph, never over a placeholder | ADD | story `WithPhotograph` composes it in the media slot |
| Centred layout shows no image | ALREADY | `media` renders only when passed (SoftCentred passes none) |
| Split tracks stack the photo under the copy at 360px | ALREADY | one column below `lg`; story `Mobile` |
| Merges a caller `className` | ADD | test "merges a caller className over its own, and the diamond layer lets that ground show" |
| axe | ALREADY | test "has no accessibility violations" |
| `variant` split/center | ALREADY | contract `layout` |
| `on="brand"` on the actions | DROP | D5 |
| "Est. 2019" | DROP | C3 — established 2025 |
| Stories Default · Tones · Centred · Soft · AwaitingPhotography · Smallest | ALREADY | Playground · BrandSplit/InkSplit · SoftCentred · SoftCentred · Playground (labelled ImageSlot) · Mobile |
| Story HeadlineOnly | ADD | `HeadlineOnly` |
| Story WithPhotograph | ADD | `WithPhotograph` |
| Dev test "paints no scrim over the placeholder" | ALREADY | the hero paints no scrim itself; only `WithPhotograph`'s media slot adds one |
| *(not in dev)* empty slot renders no wrapper | ADD | fold item 18; test "renders no wrapper for an empty…" |
| *(not in dev)* explicit list semantics on the meta row | ADD | fold item 19; meta test |
| *(not in dev)* caller ground visible through the diamond | ADD | fold item 21; merge test |
| *(not in dev)* `badges`, `titleSize`, `pattern`, `headingLevel` | ADD | contract deviations (HeroBanner rows) + spec §5.5; tests for display-2, pattern by tone, heading level |

**Gates** (`/tmp/ppB-t3-gate.log`, `/tmp/ppB-t3-sbt.log`, `/tmp/ppB-t3-fmt.log`, `/tmp/ppB-final-sbt.log`):

- `pnpm exec prettier --write …` + `pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache` — exit 0.
- Same gate chain as Task 2 — exit 0. design-tokens 284 / 4 files; ui 1421 / 94 files (1405 + 16); Storybook build ok.
- `pnpm nx run storybook:test` — exit 0, 833 / 88 files (`hero-banner.stories.tsx` 12). Re-run on the final commit `25c4f15`: 833 / 88, exit 0. No cold-cache failure.
- `pnpm nx format:check` — red on the plan doc (class re-sort) and on the stories file (lint --fix ran after Prettier and rewrote the caption's classes). Stories re-formatted before commit; plan fixed in `25c4f15`; `pnpm nx lint @pink-paprikaa-web/ui` re-run exit 0; format:check exit 0.
- `pnpm guard:founder` — clean.

**Commits:** `e4b26e4` feat(ui): add the HeroBanner organism · `25c4f15` docs: re-sort the hero banner classes in plan 4 now that its tokens exist.

## Concerns

- Format order trap: the plan's Step 8 runs Prettier before `lint --fix`; when lint --fix rewrites classes (shorthand), the file ends un-Prettier'd and format:check fails. Later briefs could run Prettier again after `lint --fix`.
- Fold item 18 names Task 3 but not Task 2; I added Task 2's empty-`sub` test anyway (one extra test). Drop it if the reviewer reads item 18 as Task-3-only.
- The plan doc's HeroBanner `WithPhotograph` still shows `right-6 bottom-6 left-6`; the built story uses `inset-x-6 bottom-6` (lint's shorthand). Plan 5 copies nothing from it, so I did not patch the plan.
- No concurrent edits observed in this batch; the plan doc changed only by my two re-sorts.
