# Batch H — Task 20 (tier parity review, spec §11.4) and the story test run — report

Status: **DONE_WITH_CONCERNS**. Base `ac135b0`, head `aaa17c5`. One commit.

## Method

- Servers: `python3 -m http.server 4800` over `zip-files/` (cards and handoff pages) and
  `pnpm nx run storybook:serve` on 6006. unpkg was reachable, so every card rendered. **Both servers
  were stopped** at the end (ports 4800 and 6006 confirmed free before the gate).
- Scripts and screenshots live in the scratchpad `pp-parity-3a/`, not the repo. Nothing from it is
  committed.
  - `shoot.mjs`: takes each card full-page and every `Molecules/*` story (128 stories) cropped to
    `#storybook-root`, at 360 and 1280. It builds one side-by-side sheet per molecule per width.
    Handoff `ThisWeek.dc.html` (Tabs) and `FaqBlock.dc.html` (Accordion) were shot too.
  - `FILL=1 shoot.mjs`: a second pass that stretches `#storybook-root` to the viewport. Storybook's
    `centered` layout shrink-wraps every story, so the width-dependent molecules (SlotPicker
    auto-fit, Field, SearchField, Tabs, Alert, rows) need the fill pass to compare with the
    full-width card column.
  - `full.mjs`: full-viewport shots of Toast and Snackbar. Both portal or anchor outside the crop.
  - `hscroll.mjs`: every molecule story at 360, in both modes. It flags `scrollWidth > 360` or a
    `#storybook-root` narrower than 40px (a collapsed frame).
  - `probe.mjs` / `q.mjs`: computed box, padding, gap, radius, border, background, font and colour,
    card against story, for 27 element pairs.
  - `keys.mjs`: the R85 and R82 real-keyboard checks (`page.keyboard`).
- I read every sheet with Read at both widths, and zoomed crops where it mattered.

## Fixes (commit `aaa17c5`)

| Molecule | Defect | Fix | Evidence |
| --- | --- | --- | --- |
| Pagination | The gap `…` rendered as bare text. The card draws it as the same 40px bordered white pill as the page numbers (a disabled button with `1px solid var(--border-default)`, ink-000 fill, ink-400 text). No ruling or DROP covers it. Dev and the brief were also borderless, so this is a card-parity correction to both. | `gap: { item: "border border-border-default bg-surface-card text-ink-400" }` | probe after the fix, card against story: `40x40 pad=0 10px rad=999px bd=1px rgb(220,211,215) bg=rgb(255,255,255) Poppins 14px w700 col=rgb(184,171,177)`, identical. Re-shot: the sheet matches the card. |
| Snackbar (stories) | **Every Snackbar story showed a 34px-wide sliver in the default canvas.** The frame is a `relative` box with no width, the bar is absolutely anchored inside it, and the `centered` layout shrink-wraps it to zero. That covers the 9 arg stories, LiveCopy and ClosedByParent. Tests stayed green because they query by role and text. | meta `parameters.layout: "padded"` (atom precedent: Input, Select, Slider…), frames `max-w-120`. Narrow keeps `max-w-90`, and its height goes `h-28` → `h-36` so the 3-line wrapped bar stays inside the frame. | `hscroll.mjs` after the fix: no collapsed or overflowing story at 360. Re-shot montages at 360 and 1280 show the bars at their 420px max-width. |
| Toast `Contained` (story) | Same zero-width frame, so the contained toast was invisible in the default canvas. | `parameters.layout: "padded"`, frame `max-w-120`. | Same as above. |

These are pixel and story-frame fixes, not behaviour, so no unit test was added (brief Step 3). The
existing pagination, snackbar and toast tests passed (60/60).

## Keyboard checks (real Playwright keyboard)

**R85, Accordion.** Chromium, `page.keyboard`. Focus starts from a click at the page origin.
- `playground` (single-open, after its play left item 1 open): **Tab** reached each summary in turn
  ("Is everything vegetarian?" → "Do you deliver?" → "Can I book a table?"), then left the story.
  On every summary, **Enter** toggled its `<details>` and **Space** toggled it back. Opening an item
  closed the other, so `<details name>` exclusivity holds under the keyboard:
  `[F,T,F] → Enter [T,F,F] → Space [F,F,F]`.
- `multiple`: Tab moved between the 2 questions. Enter and Space each toggled only their own item
  (`[T,T] → [F,T] → [T,T]`).
- **Result: PASS.** No fix needed.

**R82 spot-check, Snackbar `live-copy`.** Tab reached "Copy PAPRIKAA50", and Enter opened the bar.
Tab moved focus into the snackbar (the Radix toast `<li>`). **Escape** closed it, and focus went
back to the "Copy PAPRIKAA50" trigger (`focusReturnedToTrigger=true`). **PASS.**

## Per-molecule parity

"listed (brief)" = the brief's Step 3 expected list, updated by fold item 16. Font rasterisation,
the cards' 128px row-label column (which crushes every card at 360) and the `centered` canvas
shrink-wrap apply to every molecule and are not repeated below.

#### Field
| difference | fixed / listed | reason |
| --- | --- | --- |
| stack + hint and error rows use a Select, not a SlotPicker | listed (brief) | deviation 1: a fieldset carries its own legend and message |
| Value text 16px | listed | R21 |
| side layout stacks below 480px (360 shot shows the label above) | listed (brief) | dev parity |
| `WithError` Select shows "Pick …" (truncated) and loses its chevron in the centred canvas | listed | The Select atom (plan 2b) places the `<select>` `absolute inset-0`, so the box has no intrinsic width and collapses in a shrink-to-fit parent. It renders "Pick one" in full at a real width (fill pass). This is atom scope, not molecule scope. See concerns. The chevron gives way to the status glyph by 2b design |
| Label / hint / message typography, gaps, status glyph line | matches | sheets at 360 and 1280 |

#### SearchField
| difference | fixed / listed | reason |
| --- | --- | --- |
| Status glyph also inside the box | listed (brief) | the one field chrome (2b `FieldControl`) |
| Loading = pulsing mark (the card's spinner img is broken) | listed (brief) | the system loader |
| Value text 16px | listed (fold 16) | R21 (replaces the stale "15px" clause) |
| `clearLabel` prop | listed (fold 16) | R39 extra |
| `WithValue` shot shows the empty, focused box | listed | its `play` types, then clears (asserts focus). The state is post-play, and the render before the play matches the card |
| Message line uses the AA status-text colour + glyph, card uses raw warning amber | listed | the Field message system (2b / Task 1 `FieldMessage`) |
| Pill radius, md/sm heights, search-glyph inset, message indent | matches | fill sheets |

#### QuantityStepper
| difference | fixed / listed | reason |
| --- | --- | --- |
| Count is an input whose width follows its digits (22px min). "2000" sits close to + | listed (brief) | typed entry |
| Pill 109px vs the card's 104px wide (sizes row) | listed | the input's digit-driven width, same cause as above. Pill height 42px, radius, 1px pink-200 border and pink-50 fill match (probe) |
| Labels on − / + | listed (fold 16) | R39 extras |
| Focus rings in Playground / AtMin / TypedGuests shots | listed | post-`play` state |

#### OtpInput
| difference | fixed / listed | reason |
| --- | --- | --- |
| Identical cells, one hidden input behind them | listed (brief) | |
| Disabled filled cells: subtle border + muted digits (the card keeps the pink border and body digits) | listed | fold item 6 (the disabled paint beats the brand compound) + R80 |
| Six cells wrap to a 2nd row in the 320px `Narrow` frame | listed | dev parity (never overflow) |
| Status message carries a glyph | listed | FieldMessage system |
| Cell 48×56, radius 10, 2px border, Space Mono 20px | matches | probe |

#### SlotPicker
| difference | fixed / listed | reason |
| --- | --- | --- |
| The card's cells are ~164px tall with a big legend gap | listed | card frame artifact: the card's grid row stretches (probe `gridTemplateRows: 130px 164px`). The cell's own styles are identical: min-h 44, pad 8/10, radius 10, 1px, 14px/700 |
| Auto-fit collapses to 1 column in the centred canvas | listed | shrink-wrap. The fill pass shows 5 columns like the card |
| Status message glyph | listed | FieldMessage |

#### Alert
| difference | fixed / listed | reason |
| --- | --- | --- |
| The Dawat warning on ink is the opaque warning panel | listed (brief) | deviation 11, open question 1 |
| Box 14/16 pad, 12 gap, radius 10, 1px tone border. Title Poppins 15/700. Body 14px | matches | probe (identical rgb values) |
| Dismiss focus ring in the `Dismissible` shot | listed | post-`play` |

#### Toast
| difference | fixed / listed | reason |
| --- | --- | --- |
| `Contained` story frame had no width (invisible) | **fixed** `aaa17c5` | see Fixes |
| Success fill is the strong mint | listed (brief) | deviation 12 |
| Pills are content-width in the viewport (the card stretches them to its row) | listed | card frame. Pill pad 12/16, gap 12, radius pill, 14.5px/500 text match (probe) |
| `AddToOrder`: after the play clicks View Cart, the empty viewport `<ol>` shows the global focus outline | listed | Radix Toast moves focus to its viewport when a focused toast closes. The play's synthetic click counts as keyboard-modality, and a real mouse click shows no ring. This is Radix default behaviour, and no card or spec clause covers it. See concerns |
| Viewport sits at `bottom-dock-clearance` at 360 | listed | above the mobile action dock (spec) |

#### Snackbar
| difference | fixed / listed | reason |
| --- | --- | --- |
| Every story frame collapsed to a sliver in the default canvas | **fixed** `aaa17c5` | see Fixes |
| Tone rows show dismiss. Bar 50px tall vs the card's 46px | listed (brief) | deviation 6 (the 24px dismiss sets the height) |
| Inset fixed at 24px (the card passes `inset={0}`) | listed (brief) | |
| Bar 420px max vs the card's rows at 380px | listed | the card passes `width={380}` per row, and its own default is 420 = `max-w-snackbar` |
| Success fill strong mint | listed (brief) | deviation 12 |
| Live-copy row uses a Button stand-in for the CouponTicket | listed | CouponTicket is plan 3b |
| Pad 13/14/13/16, gap 12, radius md, 14.5px/500 text | matches | probe |

#### EmptyState
| difference | fixed / listed | reason |
| --- | --- | --- |
| `lg` body copy changed from "Your first one is on us." | listed (brief) | unmade offer |
| Title Poppins 20/700, symbol, spacing | matches | probe + sheets |

#### Tabs
| difference | fixed / listed | reason |
| --- | --- | --- |
| Triggers 44px tall (the card's are 35px), so the row is taller | listed (brief) | spec §5.5 target, dev parity |
| Inactive label ink-600 `text-subtle` (rgb 107,90,98) vs the card's ink-500 (143,127,134) | listed | the AA re-pointing of `text-subtle` (spec §5.3), same ruling as plan 2a/2b parity |
| Underline sits on the hairline where the row wraps (the `WithDisabledTab` 360 shot) | listed (brief) | |
| Segmented pill is larger than the handoff `ThisWeek` toggle (≈28px) | listed | the 44px target, as above |
| `isDisabled` / `isFullWidth` / icons | listed (fold 16) | R39 extras |
| Focus boxes in shots | listed | post-`play` |

#### Breadcrumb
| difference | fixed / listed | reason |
| --- | --- | --- |
| none beyond rasterisation | matches | probe: link 13.5px ink-600, current 13.5px/500 ink-900, identical. It wraps at 360 like the card, never clips |

#### Pagination
| difference | fixed / listed | reason |
| --- | --- | --- |
| Gap `…` had no border or fill | **fixed** `aaa17c5` | see Fixes |
| Prev/Next at the ends are inert placeholders | listed (brief) | deviation 13 |
| The row wraps at 360 (Playground: `12` and `>` on line 2) | listed | "wraps rather than overflowing" (brief, dev parity). The card wraps too |

#### SectionHeader
| difference | fixed / listed | reason |
| --- | --- | --- |
| In `Surfaces` at 1280 the action sits beside the lede, not flush right | listed | story helper only (the OnSurfaces row does not stretch its child). Playground and HeadingLevels put it flush right as on the card |
| Title Poppins 32/700 −0.48px. Eyebrow, lede, action indent at 360 | matches | probe + sheets (the card indents See All the same way) |

#### Stat
| difference | fixed / listed | reason |
| --- | --- | --- |
| The inverse + centre row is centred in a padded ink panel (the card's is left-leaning and tighter) | listed | the card's row frame (`pad on-ink`) against the story's `p-6` frame. `align="center"` centres as specified |
| Value 30px@360 / 42px@1280, 800, −0.025em. Label 15/500 | matches | probe, identical at both widths |

#### Accordion
| difference | fixed / listed | reason |
| --- | --- | --- |
| Answer copy differs (story content) | listed | the story's FAQ text |
| The handoff `FaqBlock` renders an empty accordion column | listed | the handoff's `items` prop has no default, so there is nothing to compare there. The card was compared instead |
| Summary 18/0 pad, 16 gap, Poppins 16.5/700. Answer 15px, 0/0/18 pad | matches | probe |
| Enter/Space toggle, Tab order | verified | R85 above |

#### ListRow
| difference | fixed / listed | reason |
| --- | --- | --- |
| At 360 the card's label wraps under its 128px column | listed | card frame |
| Row pad 14/12, gap 14, radius 6. Label 14/500. Value 14px ink-600 | matches | probe |

#### PriceSummary
| difference | fixed / listed | reason |
| --- | --- | --- |
| `OnInk` panel padding 24px vs the card's ~14px | listed | story frame `p-6` against the card's `pad on-ink` row. The component has no panel of its own |
| Discount mint, total Poppins 20/700, line 14px muted | matches | probe + sheets |

#### StepTracker
| difference | fixed / listed | reason |
| --- | --- | --- |
| Check glyph 12px | listed (brief) | |
| Reached segments on pink are white | listed (brief) | |
| **Vertical tracker on the brand field: complete/current diamonds are pink-500 on the pink-500 ground and vanish. Only the white 50% mark and check show, while the upcoming (ink-200) diamond reads strongest** (`VerticalSurfaces`, brand row) | listed | covered by the dev-parity **DROP** "`tone="inverse"` (white markers and bars on brand)" (task-19 brief, spec D5, deviation 7: "markers keep their own fills"). **Not fixed, per the dispatch. The screenshot contradicts that DROP's premise.** See concerns |
| Label Poppins 14/500, note 12.5px muted, 22px marker | matches | probe + sheets |

## Gates

| Command | Result |
| --- | --- |
| `pnpm nx test @pink-paprikaa-web/ui -- pagination snackbar toast` | 3 files, 60/60 |
| `pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache` (Chromium, plays + a11y) | **63 files, 627/627 passed**, first run (no cold-cache retry needed) |
| `pnpm nx format:check && pnpm nx sync:check` | green |
| `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache` | green |
| `pnpm nx run-many -t typecheck lint test -p ui design-tokens --skip-nx-cache` | green. tokens 272/272, ui 69 files 1088/1088 |
| `pnpm nx run @pink-paprikaa-web/storybook:build` | green |

`pnpm exec playwright install chromium` was not needed (Chromium already present).

## Commits

- `aaa17c5` fix(ui): molecule parity with the design-system cards (pagination gap + Snackbar/Toast
  story frames). The body carries the fixed list and the expected-difference list.

## Concerns

1. **StepTracker vertical on brand (DROP premise is false).** The DROP assumed a filled diamond
   "looks the same on every field". On `surface-brand` the pink-500 fill equals the ground, so reached
   and current steps lose their marker and the upcoming step looks the most prominent. That inverts
   the meaning (the sr-only state text still announces it correctly). R88 already puts this
   tracker in the DiamondMotif specimen. The smallest fix would be two component colour tokens
   (`step-tracker-marker-on` → pink-500, white on brand; `-mark-on` → ink-000, pink-500 on brand)
   following the bar-token pattern. The controller should rule on it.
2. **Select atom collapses in a shrink-to-fit parent** (plan 2b). The absolutely positioned
   `<select>` gives the box no intrinsic width, so `Field > Select` inside an inline or flex-cluster
   parent truncates the value to "Pick …". Full-width forms are unaffected. It is atom scope, so I
   left it alone.
3. **Toast viewport focus ring.** When a focused toast closes (e.g. keyboard Enter on View Cart),
   Radix focuses the empty viewport `<ol>`, and the global `:focus-visible` outline draws a
   full-width empty box. It is Radix default and not in any ruling. Snackbar has R82 restore; Toast
   does not.
4. The Pagination gap fix goes against the brief's verbatim `gap` value and dev (both borderless),
   in favour of the card. It is recorded here in case the controller prefers the brief.
