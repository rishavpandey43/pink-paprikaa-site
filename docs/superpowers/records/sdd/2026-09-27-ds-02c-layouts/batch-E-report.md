# Batch E report — carried fixes 1–2, Task 9 (layouts tier parity)

Base 4c9aae9 · commits `7d35c06`, `1585e8c`, `a984709`.

## Carried fixes (carried-fixes-E.md)

| # | Fix | Commit | Evidence |
| - | --- | ------ | -------- |
| 1 | `component-variants.ts`: `autogrid` group is now only `autogrid`/`autogrid-wide`; new `autogrid-min` group; `conflictingClassGroups` is `autogrid-min ↔ grid-cols` (both directions). `autogrid`/`autogrid-wide` no longer conflict with `grid-cols`. Spec: reverse row `["grid-cols-2", "autogrid-min-md"]`, plus a "keeps both halves" `it.each` over `autogrid autogrid-min-lg`, `autogrid grid-cols-2`, `autogrid-wide autogrid-min-sm`. | `7d35c06` | Red first: 3 of 46 failed (the three keeps-both rows; the reverse row already passed through the old conflict). Green 46/46. |
| 2 | `auto-grid.stories.tsx`: `ColumnsAt768` / `ColumnsAt1280` plays count the cells' distinct `offsetLeft` values (2 and 4). | `1585e8c` | First version read `canvasElement.firstElementChild` and got 1: the preview decorator wraps the story root. So both stories now render `<AutoGrid data-testid="grid">` and the count reads that grid. 11/11 then. The two counts differ, so the viewport global really applies under addon-vitest, and the plays test something. |

Deviation: those two stories now use `render` instead of `args.children`, so their Controls no longer drive the grid.

## Task 9 — tier parity review

**Method.** The scripts live in the scratchpad `pp-parity-2c/` and are not committed.
- The zip was served with `python3 -m http.server 5055`. unpkg was reachable, so every card rendered.
- Storybook was served as the fresh static build on 6006. It was rebuilt after the fix.
- `shoot.mjs` (the 2b script, adapted) took each card full-page and every story of its component, cropped to `#storybook-root`, at 360 and 1280. It covered 7 layout cards and 4 guideline cards (spacing-layout, autogrid and breakpoints against Container/AutoGrid; canvas-formats against PostFrame `AllFormats`). Output: 240 PNGs, and side-by-side sheets I read with Read.
- `probe.mjs`, `shell.mjs` and `guide.mjs` dumped computed box, padding, gap, template, background, radius, border, font and scrollWidth on both sides.
- Both servers were stopped (`lsof` shows 0 listeners).

Caveat: a static `iframe.html` does not apply `globals.viewport`. At 1280, the stories named "360px — …" therefore render at 1280. The vitest run does apply the global (see fix 2).

### Container
| difference | fixed/listed | reason |
| --- | --- | --- |
| Gutter 16px at 360, where the card has 20px | listed | spec C8 handoff value |
| `size="prose"` resolves to 700.4px, where the card has 702.1px | listed | `ch` font metric / rasterisation; both are 64ch |
| Extra sizes: narrow 960, article 760, full | listed | contract additions |
| Otherwise, content 1200 max, wide 1440 max, gutter 40px at 1280 | match | probe |

### Section
| difference | fixed/listed | reason |
| --- | --- | --- |
| Gutter 16 vs 20 at 360; default rhythm clamp(48,8vw,96) | listed | spec C8 |
| `soft` tone row | listed | contract addition |
| Label copy "·" where the card has "-" | listed | demo copy only |
| Tight bands 51.2px (1280) and 36px (360), the five surface colours, h4 Poppins 20/26/700 | match | probe, identical |

### Stack
| difference | fixed/listed | reason |
| --- | --- | --- |
| Demo chip is 34px tall; the card's is 42px | listed | The card puts a caption `span` inside a body-font `div`, so the div's 16px line-height strut sets the height. The story's chip puts caption on the div. This is demo scaffolding, not Stack. |
| Gap 8/24/12 and the 1px `border-subtle` hairline | match | probe |
| `LongWordAt360` HSCROLL at 360 | listed | By design: the word overflows its own row and never widens the stack (the play asserts this). |

### Cluster
| difference | fixed/listed | reason |
| --- | --- | --- |
| The card's scroll rail overflows its page at 360 (scrollWidth 841); ours clips at 360 | listed | Defect in the card, not in ours |
| Rail has 4px padding on all sides and a -4px margin, where the card has only 4px bottom padding | listed | ruling 11 (ring room, tab stop) |
| Wrap and justify-between gap 12, Button sm secondary 36px, Tag 38px | match | probe |

### AutoGrid
| difference | fixed/listed | reason |
| --- | --- | --- |
| min 240/160 snap to md 260 / xs 140. At 360, xs shows 2 columns where the card's 160 shows 1. | listed | spec §15 risk 2 |
| Demo Card padding 16 (`sm`), where the card has 12 | listed | Card has no 12 step (sm 16 is the nearest) |
| The card's cells are 249/317px tall | listed | Artefact of the card harness. An auto-fit grid inside the harness's flex column gets its height from a one-column min-content pass: 4×44+3×24 = 248. |
| `LongWordHoldsTracks` HSCROLL at 360 | listed | by design: the word overflows its cell while the tracks stay equal |
| Columns (4 at 1280, 1 at 360 for md), gap 24/16, `columns={3}` minmax(0,1fr) | match | probe and the new plays |

### AppShell
| difference | fixed/listed | reason |
| --- | --- | --- |
| TabBar (no cart badge), Dialog (no handle or close), FilterBar, MenuItemRow (no photo or diet mark), LoyaltyCard | listed | temporary stand-ins; Plan 4's final task replaces them |
| Battery icon | listed | Lucide `BatteryFull` |
| `statusTone="light"` floods the status row brand | listed | resolution 7 |
| The nav and home row are transparent over the white frame; the card paints them white | listed | Visually identical, and the stand-in TabBar sets no background |
| Every story shows HSCROLL at 360 | listed | A 390 frame, or 360 plus padding, cannot fit a 360 viewport. The card overflows too (412). |
| Frame 390×844 / 360×780, radius 44, shadow-4, 44px status row (Poppins 13/600, 0 22px), 22px home row with a 130×5 ink-300 bar | match | probe |

### PostFrame
| difference | fixed/listed | reason |
| --- | --- | --- |
| **mpu headline was DM Sans 26/500 (SocialHeadline `caption`); the card uses Poppins 800 26/1.05** | **fixed** `a984709` | Now `Text variant="h3" weight="black"`: Poppins 25/800, the nearest step, following the leaderboard's h4 precedent. This deviates from the brief's verbatim story code. |
| Story-format headline stays on one line; the card breaks it after "Half off," | listed | The card uses `max="10ch"`, and the measure steps are 12/18/30ch. I tried `tight` (12ch = 757px): it still fits on one line, so I reverted it. |
| The card's mpu logo is centred | listed | Only because the card's Logo `img` stretches in its flex column. The leaderboard is left-aligned. |
| Logo in place of LogoLockup; no OfferSeal | listed | stand-ins until Plan 4's final task |
| Ad-unit padding 16 (card 18); leaderboard h4 20px (card 22) | listed | nearest steps (brief) |
| Extra `tone="alt"` board | listed | deviation 3 |
| Canvas pad 72 (1080) / 48 (landscape); hero 132/800, h1 96, h2 72, overline 24/700; safe-area bands 250/320 with a 2px dashed white outline (0.42 alpha, card 0.4) | match | probe |

### Guideline cards
| difference | fixed/listed | reason |
| --- | --- | --- |
| spacing-layout and breakpoints show gutter clamp(20,4vw,40) and section clamp(56,7vw,96) | listed | spec C8 |
| canvas-formats draws rounded boards and has no `wide` | listed | PostFrame has no radius (PostFrame.jsx); `wide` is a contract format |
| autogrid: 4 columns of 260 at 1280, gap clamp(16,2vw,24) | match | same as `ColumnsAt1280` |

## Gate (cold, after all changes)

`pnpm nx build design-tokens --skip-nx-cache && run-many typecheck lint test -p ui design-tokens --skip-nx-cache && storybook:build && storybook test --skip-nx-cache && format:check` → exit 0.
- tokens 249/249
- ui 800/800 (was 796; +4 spec rows)
- storybook 490/490 (45 files)
- format clean

## Commits

- `7d35c06` fix(ui): give autogrid-min its own tailwind-merge group
- `1585e8c` test(ui): count autogrid columns at 768 and 1280
- `a984709` test(ui): layouts tier parity review at 360 and 1280. The body carries the parity notes.
