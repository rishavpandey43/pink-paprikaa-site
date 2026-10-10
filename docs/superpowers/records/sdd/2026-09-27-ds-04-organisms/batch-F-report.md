# Batch F report — carried F1–F3, Task 10 TabBar, Task 11 Dialog

Base `52e18e8`, branch `feat/design-system`, HEAD `5e30040`. Implementer: Claude Opus 5.5.
Status: **DONE_WITH_CONCERNS** (see Concerns).

## Status log (resume from the first unchecked box)

- [x] Read contract, global constraints, progress rulings, fold list, carried-fixes-F, briefs 10/11, AUTHORING, CLAUDE.md
- [x] F1 story-ring fails loudly on no outline (+ proof) — ae26a82
- [x] F2 OrderTracker flush frame fits the 328px canvas — da802c4
- [x] F3 OrderTracker negative clamp test (RED seen) — e2ba633
- [x] F1–F3 plan sync (Tasks 6, 7) — fbe7544
- [x] T10 TabBar: tokens, RED, impl, stories (+ring plays), export, gates — 12ca4c9
- [x] T10 plan re-sort c42e804 / plan sync 9b74270
- [x] Story frames held at width in Storybook's centred canvas (TabBar, OrderTracker) — 2aee512
- [x] story-ring measures a box-shadow ring (fields; needed by T11's field play) — c8cdb60
- [x] story-ring follows the containing-block chain (T11's fixed scrim) — 6cde313
- [x] T11 Dialog: tokens, RED, impl (+R82), stories (+ring plays, frame fit), export, gates — 49b5010
- [x] T11 plan re-sort dfc9b37; plan sync of 2aee512 → 29497e7; plan sync story-ring + T11 → 5e30040
- [x] Final: format:check, sync:check, storybook:test, guard:founder, report complete

## Commits

| SHA | Subject |
| --- | --- |
| ae26a82 | fix(ui): fail a ring-clip check on a control that draws no outline (F1) |
| da802c4 | fix(ui): fit the order tracker's phone frame inside the 360 canvas (F2) |
| e2ba633 | test(ui): pin the order tracker's lower clamp on the current step (F3) |
| fbe7544 | docs: plan 4 story ring + order tracker = F1–F3 |
| 12ca4c9 | feat(ui): add the TabBar organism (T10) |
| c42e804 | docs: re-sort the tab bar classes in plan 4 |
| 9b74270 | docs: plan 4 tab bar code = build |
| 2aee512 | fix(ui): hold the tab bar and order tracker story frames at their width |
| c8cdb60 | test(ui): measure a field's box-shadow focus ring in ringClippers |
| 6cde313 | test(ui): walk the containing-block chain in ringClippers |
| 49b5010 | feat(ui): add the Dialog organism (T11) |
| dfc9b37 | docs: re-sort the dialog classes in plan 4 |
| 29497e7 | docs: plan 4 tab bar / order tracker story frames = build (2aee512) |
| 5e30040 | docs: plan 4 story ring + dialog code = build |

## Carried fixes

### F1 — `ringClippers` no longer passes vacuously (ae26a82, extended by c8cdb60, 6cde313)

- **Bug reproduced first** (temporary probe story, deleted): a button with `focus-visible:shadow-focus-ring
  focus-visible:outline-none` inside `overflow-hidden p-4`, play `expect(ringClippers(button)).toEqual([])`
  — **passed** on the old helper (nothing measured).
- **After ae26a82** the same probe **failed**: `ringClippers: <button> draws no focus outline
  (outline-style "none", width "2px")`. Note Chromium 151 reports `outline-width: 2px` even with
  `outline-style: none`, so the style check is what catches it — a width-only check would not.
- **Deviation from the brief's wording** ("throw when … reach is not > 0"): an *inset* ring
  (`-outline-offset-4`, which fold item 20 prescribes for TabBar) has negative reach legitimately, so
  the guard is "no outline style, or outline width not > 0, or reach not finite". The spec pins an inset
  ring as measured.
- Every existing ring play stayed green (QuotePanel 8, OrderTracker 7, SiteFooter 8 stories).
- Permanent proof: `packages/ui/src/lib/story-ring.spec.ts` (jsdom, frame geometry stubbed) — now 9 tests.
- **c8cdb60 (needed by Task 11, fold 20 "a form field in the body"):** a field's focus ring is a
  `shadow-focus-ring` box-shadow on the field box (`focus-within`), the `<input>` has `outline-none`, so
  F1's helper threw on every field. Without an outline the helper now measures the outer box-shadow
  (spread + blur + offset; inset shadows ignored) and finishes the element's CSS *transitions* first
  (`transition-control` animates the shadow in; measured mid-transition it read `0px`). Still throws
  when neither ring is drawn. Chromium probe (deleted): no-ring button throws; flush shadow ring → 1
  clipper; `<Input>` flush in `overflow-hidden` → input throws, field box → 1 clipper; with `p-1` → `[]`.
- **6cde313 (needed by Task 11):** the walk followed plain parents, so Radix's fixed scrim was reported
  cut by the scroll-locked `<body>` (react-remove-scroll sets `overflow: hidden`). It now follows the
  containing-block chain (fixed → transform/filter/perspective/contain ancestor or viewport; absolute →
  positioned ancestor). Chromium probe (deleted): fixed button escapes an `overflow-hidden` box → `[]`;
  inside `contain-layout overflow-hidden` → 1 clipper. Known limit (unchanged): the viewport itself is
  not a clipper.

### F2 — OrderTracker Mobile frame (da802c4, then 2aee512)

- RED: added to `Mobile`'s play `expect(canvasElement.scrollWidth).toBeLessThanOrEqual(clientWidth)` —
  failed `expected 340 to be less than or equal to 328`. Then `w-full max-w-85` → green.
- **Follow-up 2aee512:** measured in the *built* Storybook (playwright against `storybook-static`), a fluid
  `w-full max-w-*` frame shrinks to its content in the centred canvas (`#storybook-root` is a
  fit-content flex item): tracker frame 337.8px, and the new TabBar frames 147–192px instead of 390.
  `w-<n> max-w-full` holds the width (tracker 340, tab bars 390 at 1280) but a centred canvas grows to
  hold a fixed frame at 360, so OrderTracker `Mobile` now runs `layout: "fullscreen"` (measured at 360:
  frame right edge 340, document not wider than 360). Vitest's runner has no centred canvas, so the
  plays cannot catch this; the measurement is the evidence.

### F3 — lower clamp (e2ba633)

`it("clamps a negative current index to the first step")` (`current={-1}` → heading "Order in"). RED
seen by temporarily dropping `Math.max(current, 0)` (12 pass, 1 fail), restored → 13/13.

## Task 10 — TabBar (12ca4c9)

Built per brief/plan: `tab-bar.json` (`tab-bar-count` spacing with `["h","min-w"]` marker; `tab-bar-label`,
`tab-bar-count` text), registered in `SPACING`/`TEXT`; component, 10 tests, 6 stories; barrel export
after StatBand (path order). RED: "Failed to resolve import ./tab-bar".

Deviations:
1. **Count announcement whitespace** — plan's `<span className="sr-only"> ({item.count})</span>` named the
   tab "Cart(2)" (accessible-name computation drops a child's edge whitespace), so the plan's own test
   failed. The space is now a text node outside the span (`{" "}<span className="sr-only">(2)</span>`),
   with a one-line comment. Chromium story play queries "Cart (2)" and passes.
2. **Inset ring (fold 20)** — `focus-visible:-outline-offset-4` on the control. Plays on `FiveTabs`,
   `AsLinks`, `Mobile` tab through every tab and assert `ringClippers` `[]` on the first and last.
   Removing the class fails `FiveTabs` and `AsLinks` (`expected [ <div …> ] to deeply equal []`).
3. **Frames** — `w-97.5 max-w-full` (plan `w-97.5` overflowed the runner's 382px canvas; see F2 follow-up).
   `EachDestinationActive` puts the width on the column. `Mobile` also asserts nothing overflows the canvas.
4. Commit body adds one sentence about the inset ring.

Dev parity (brief table, extended):

| Dev item | Ruling | Where / clause |
| --- | --- | --- |
| One control per destination in a named `nav` | ALREADY | test "is a navigation landmark named Primary by default" |
| Five destinations | ADD | test "carries five destinations too" |
| The destination in view is `aria-current="page"` | ALREADY | test "marks the current destination…" |
| Uncontrolled: starts on the first / `defaultValue`, moves itself | DROP | contract §7 `value` required + D6; stories hold state in `Frame` |
| Controlled: reports the tap, does not move itself | ADD | the `onValueChange` test asserts Home stays current |
| Count announced with the label | ALREADY | "Cart (2)" — needed the whitespace fix above |
| The 64px bar | ALREADY | test "sits in the fixed 64px bar height" |
| A long label truncates; tabs `min-w-0` | ADD | test "keeps a long label on one line…" |
| Press feedback | ADD | `active:press-scale` |
| 44px hit target | ALREADY | full-height 64px controls |
| Merges a caller `className` | ADD | test "merges a caller className over its own" |
| axe | ALREADY | test "has no accessibility violations" |
| Stories Default · FourDestinations · FiveDestinations | ALREADY | Playground · FourTabsWithCount · FiveTabs |
| Story EachDestinationActive | ADD | `EachDestinationActive` |
| Story Smallest | ADD | `Mobile` |
| (plan missed) dev's focus ring had no clip story | ADD | inset ring + ring plays (fold 20) |

## Task 11 — Dialog (49b5010)

Built from the **plan** (the brief predates the plan's scrim assertions in the `hasCloseButton` test and
`MustBeAnswered` play; plan wins). `dialog.json` (`dialog-sm/md/lg` with `["max-w"]` markers;
`dialog-title`, `dialog-body` text) registered; component (client), 18 tests, 8 stories; barrel export
after CtaBand. RED: "Failed to resolve import ./dialog"; then plan code → 17 pass, the new R82 test fails;
then the fix → 18/18.

Deviations:
1. **R82 focus return without a trigger** — Radix's `onCloseAutoFocus` refocuses only `triggerRef` and
   `preventDefault`s, so a dialog the app opens itself (`MustBeAnswered`, a controlled confirm) dropped
   focus to `<body>`. `onOpenAutoFocus` records the element focused at open; without `trigger`,
   `onCloseAutoFocus` prevents Radix's handler and refocuses it if still connected. New test "returns
   focus to what had it when a dialog without a trigger closes" (footer button and Escape paths). JSDoc +
   docs description say so. With a trigger, Radix's own behaviour is untouched.
2. **Boolean naming LAW** — the plan's `const [open, setOpen] = useState` fails
   `@typescript-eslint/naming-convention`; renamed `isOpen`/`setIsOpen` (story + test).
3. **`OPEN_DIALOG_A11Y`** — a story's `a11y.config.rules` *replaces* the preview's list, so the plan's
   object re-enabled `color-contrast` (white on brand pink failed in 4 stories). It now lists
   `color-contrast` off beside `aria-hidden-focus`.
4. **Entrance animation** — `animate-sheet-in` starts at opacity 0; `KeyboardFlow`/`MustBeAnswered`'s
   `toBeVisible()` failed intermittently. A `settle(dialog)` helper awaits the panel's animations.
5. **Ring plays (fold 20/26)** — `proveRingsWhole(stops)` tabs round the trapped focus and asserts
   `ringClippers` `[]` for every stop (fields measured on the field box) and the stop count:
   `CentredModal` 5, `Sheet` 3, `InsideAPhoneFrame` 3, `Mobile` 5. Mutation check: footer `pb-0` + body
   `px-0` fails all four. `InsideAPhoneFrame`'s `w-90` frame stays fixed (its only content is the
   out-of-flow portal, so a fluid frame would collapse to 0 in a centred canvas); 360px fits every canvas
   it is shown at.
6. Commit body extended (R82, delta 4/5 sentences).

Dev parity (brief table, extended):

| Dev item | Ruling | Where / clause |
| --- | --- | --- |
| Closed until the trigger is used | ALREADY | test "opens from its trigger…" |
| Named by its title; described by its description | ALREADY | same test |
| Escape closes and reports `onOpenChange(false)` | ALREADY | tests "closes on Escape…", "reports open changes…" |
| The close glyph closes | ALREADY | test "closes from its labelled close button" |
| `hasCloseButton={false}` (R110 delta 4) | ADD | test "hides only the close button…; Escape and the scrim still ask to close" |
| Focus moves into the dialog when it opens | ADD | test "moves focus into the dialog when it opens" |
| (plan missed) focus returns without a trigger (R82) | ADD | test "returns focus to what had it when a dialog without a trigger closes" |
| Footer actions render and work | ALREADY | test "renders the footer actions" |
| Controlled open state holds | ALREADY | test "reports open changes and stays open when controlled" |
| Sheet: top corners only, plus a grab handle | ADD | sheet test asserts no `rounded-xl` |
| Three widths | ALREADY | `it.each` sizes |
| `position="container"` anchors inside a phone frame | ALREADY | `portalContainer` + `contain-layout`; story `InsideAPhoneFrame` |
| A scrim over everything behind it | ADD | test "lays the ink scrim over the page behind it" |
| Merges a caller `className` (R110 delta 5) | ADD | test "merges a caller className onto the panel" |
| axe | ALREADY | test "has no accessibility violations while open" |
| The body scrolls; header and footer stay | ADD | test "scrolls its body…" |
| Footer wraps at 360px | ALREADY | `flex-wrap` |
| `aria-describedby` opt-out | ALREADY | Radix 1.1.23 omits it without a Description |
| `isOpen` / `isDefaultOpen` names | DROP | spec §8.2 |
| Stories Default · Sheet · WithDescription · WithForm · Sizes | ALREADY | Playground · Sheet · Large · Playground · CentredModal/Large |
| Story MustBeAnswered | ADD | controlled, own footer, `play` (Escape, scrim click) |
| Story InsideAPhoneFrame | ADD | + ring play |
| Story Smallest | ADD | `Mobile` + ring play |
| (plan missed) focus rings inside the clipping panel | ADD | `proveRingsWhole` plays (fold 20) |

## Gates (final, after 49b5010; later commits are docs only)

- `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache` → Successfully ran target build
- `pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static`
  → design-tokens 4 files / **284** tests; ui 103 files / **1537** tests; "Successfully ran targets typecheck, lint, test for 2 projects"
- `pnpm nx run @pink-paprikaa-web/storybook:build` → Successfully ran target build
- `pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache` → 96 files / **909** tests passed (no cold-cache failure this batch)
- `pnpm nx format:check` → clean (after 5e30040) · `pnpm nx sync:check` → all files up to date
- `pnpm guard:founder` → "Founder-name guard: clean."
- Mid-batch: after T10, ui 1514 / sb 898 / tokens 284, all green.

## Concerns

1. **Story-ring grew beyond F1** (c8cdb60 box-shadow rings + transition settle; 6cde313 containing-block
   walk). Both were required to meet fold 20 for Dialog (field ring; fixed scrim under a scroll-locked
   body) and are pinned by spec + Chromium probes; the reviewer should judge the helper's added surface.
   Batch D/E plays (QuotePanel, OrderTracker, SiteFooter) and T10's are green on the new helper.
2. **Fluid story frames collapse in Storybook's centred canvas** (2aee512): the `w-full max-w-*` idiom
   (also used by 3a/3b molecule stories: tabs, pagination, accordion, list-row, section-header,
   menu-item-row, pricing-card) renders at content width in the real Storybook UI though every play
   passes (the vitest runner has no centred canvas). Fixed here for TabBar/OrderTracker only; the
   molecule frames are a cross-plan item for the final fix wave — not touched.
3. Two plan bugs fixed in build and synced: TabBar's count whitespace (its own test failed), Dialog's
   `open` state name (naming LAW) and `OPEN_DIALOG_A11Y` re-enabling `color-contrast`.
4. Stash list unchanged at 2 (both pre-existing lint-staged backups from batch E); none dropped.
5. The Task 11 parity-table row addition realigned the whole Markdown table in the plan (large but
   whitespace-only diff in 5e30040).
