# Plan 3a, batch F report (carried fixes + Task 14 SectionHeader + Task 15 Stat + Task 16 Accordion)

Base `cd83cd9`. Tree clean at the end. Commits, in order:

| SHA | Subject |
| --- | --- |
| `7de8596` | fix(ui): hand focus back when a snackbar closes under it |
| `7c4d988` | fix(ui): sort the snackbar barrel line after slot picker |
| `99aace8` | fix(ui): let toasts and snackbars follow a swipe |
| `c0d65cd` | test(ui): cover snackbar escape, swipe and brand politeness |
| `bf52f11` | fix(ui): treat a null alert action like no action |
| `2ae9316` | feat(ui): add the SectionHeader molecule |
| `060e7dd` | docs: re-sort the section header classes in plan 3a |
| `47194e0` | feat(ui): add the Stat molecule |
| `1117a1e` | docs: re-sort the stat classes in plan 3a |
| `6c223ac` | feat(ui): add the Accordion molecule on native details |
| `079ae71` | docs: re-sort the accordion classes in plan 3a |

## Carried fixes (`carried-fixes-F.md`, items 1–5)

1. **IMPORTANT, R82: Snackbar hands focus back when it closes** (`7de8596`).
   - **Cause.** Radix `handleClose` moves focus to the viewport when focus is inside the toast. Swipe-end closes without moving it. Snackbar then returns `null`, so the viewport unmounts and focus drops to `<body>`.
   - **Fix, part 1.** A `useLayoutEffect` keyed on `isOpen` stores `document.activeElement` (if it is an `HTMLElement`) when the bar opens. Radix never moves focus on open.
   - **Fix, part 2.** Snackbar now gives Radix `handleOpenChange` in place of `setIsOpen`. On a close (`next === false`) it checks `viewportRef.current.contains(document.activeElement)`. If focus is inside, it focuses the stored element (only if `isConnected`), then calls `setIsOpen(false)`.
   - **Coverage.** Every Radix close path runs through this: Dismiss, the action (Undo/Retry), Escape, the timer and swipe-end.
   - **Tests** (`describe "hands focus back to what opened it (R82)"`). A controlled opener button opens the bar, focus moves to a bar button, and a key closes it. Each case expects the region to be gone and the opener to have focus:
     - "after Dismiss" (Enter)
     - "after its Undo action" and "after its Retry action" (`it.each`, Enter; each also expects `onClick` called once)
     - "after Escape"
     - guard: "leaves focus alone when it was never inside the bar" (focus sits in an outside input, a 20ms timer closes the bar, the input keeps focus).
   - **TDD:** the 4 focus tests failed first (focus on `<body>`), then 27/27 passed.
   - **Chromium.** I added to the `LiveCopy` story play: after the bar opens, focus Dismiss, press Enter, and expect "Copy PAPRIKAA50" to have focus.
   - **Mutation-checked:** I put `onOpenChange={setIsOpen}` back, and the `LiveCopy` play failed. I then restored the fix.
   - **Not covered:** a *controlled* close by the parent (`open` flipped to `false` from outside) while focus is inside the bar. It does not go through Radix, so it still drops focus. Every user-driven and timer close goes through Radix.
2. **Barrel order** (`7c4d988`). The Snackbar line now follows SlotPicker's (`slot-picker` < `snackbar`). ESLint and `index.spec` are green.
3. **Swipe classes** (`99aace8`).
   - The arbitrary var shorthand `translate-y-(--radix-toast-swipe-move-y)` is rejected by `pink-paprikaa/no-arbitrary-shorthand` (R23: it flags `-(--`). So, as the dispatch allowed, this is an `@utility toast-swipe-y` in `styles.css`, placed before the keyframes. It does three things:
     - `[data-swipe="move"]` → `translate: 0 var(--radix-toast-swipe-move-y)`
     - `[data-swipe="cancel"]` → `translate: 0 0`, with `transition: translate var(--duration-fast) var(--ease-out)`
     - `[data-swipe="end"]` → `translate: 0 var(--radix-toast-swipe-end-y)`
   - It uses the `translate` property, so it composes with the `transform` in `pp-sheet-in` / `pp-toast-pop`.
   - It is on the Snackbar root and the Toast root. Both swipe on y only (Toast `down`, Snackbar `up`/`down`).
   - The built Storybook CSS contains the utility and the `--radix-toast-swipe-move-y` rule. Prettier's tailwind plugin sorts the class, so the design system knows it.
4. **Tests** (`c0d65cd`).
   - New Snackbar test "follows a downward swipe and closes past the threshold". It fires pointer down, move 20 and move 60: the bar has `toast-swipe-y`, `data-swipe="move"` and `--radix-toast-swipe-move-y: 60px`. On pointer up it calls `onOpenChange(false)` and the region is gone. This works on the R81 pointer-capture stubs.
   - New Snackbar test "closes on Escape and reports it".
   - `brand` added to the politeness `it.each`.
   - `toast.test.tsx`: the `console.error` spy is now set up before `renderToString`.
   - `toast.stories` `AddToOrder`: `VIEW_CART.onClick` is now asserted with `toHaveBeenCalledTimes(1)`. It passes in Chromium, so Storybook clears the module-level `fn()` per story.
5. **Alert `action={null}`** (`bf52f11`). It now reads `action === undefined || action === null ? null : …`, matching `children`. Test: "draws no action wrapper for a null action" failed first, then 16/16 passed.

Fix gate: snackbar + toast 49/49 and alert 16/16 in jsdom, snackbar stories 10/10 in Chromium, ui typecheck and lint green. The full gates below include them.

## Task 14: SectionHeader (server-safe)

**Built:**
- `tokens/component/section-header.json` (`section-header-measure` 48ch, `section-header-measure-centered` 56ch).
- Both names in `SPACING`.
- `molecules/section-header/{section-header.tsx,.test.tsx,.stories.tsx}`, from the brief.
- A barrel line after SearchField (`search-field` < `section-header`).

**Fold items applied:**
- **Item 14 (R61):** both measures carry `"$extensions": { "pink-paprikaa": { "utility": ["max-w"] } }`. The catalogue spec in `storybook:test` is green.
- **R83:** the heading is `createElement(headingTag(headingLevel), { className: styles.title() }, title)`, with the EmptyState comment.
- **Items 1, 2 and 17** also apply.
- **Item 8 (OnSurfacesStory) is not needed here.** The brief's export is `Surfaces`, which does not collide with the `OnSurfaces` import, and Task 20 expects the id `surfaces`.

**Deviations:**
- R83 `createElement` (ruled).
- Plan-doc re-sort (`060e7dd`): `mx-auto` now sorts before `max-w-section-header-measure-centered`. The component file carries the same sorted order.
- 12 tests, as the brief expects.

**TDD:** "Failed to resolve import ./section-header" first, then 12 passed.

**Dev parity** (brief table; verified against `git show dev:…/section-header.test.tsx`, which has 13 tests, and the dev stories):

| Dev item | Ruling | Where / why |
| --- | --- | --- |
| every heading level 1, 3–6 renders, keeping the h2 look | ADD | `it.each` level test |
| overline and lede omitted when not given (no stray top margin) | ADD | test "omits the overline and the lede…" |
| caller `className` merges | ADD | test "merges a caller className…" |
| `HeadingLevels` and `Narrow` (360px, action wraps) stories | ADD | `HeadingLevels`, `Narrow` stories |
| `on="brand"` (eyebrow, heading, lede to white) | DROP | spec D5: semantic text tokens follow the surface; the `OnBrand` / `Surfaces` stories show it. Dev's three flip tests ("flips the ink tones…", "sets the eyebrow in white…", "…flips it to white") are this row |
| lede at a fluid body step (`text-body1-fluid`) | DROP | spec D4 / D2: the design system's lede is `text-body-lg` |
| default level 2 at the fluid h2 step; overline + lede; action | ALREADY | tests "titles a section…", "sets the overline…", "renders its action…" |
| action dropped and prose centred when `align="center"` | ALREADY | test "drops the action when centred" (asserts `text-center` as well) |
| `Default`, `WithAction`, `WithLede`, `Centred`, `OnBrand` stories | ALREADY | `Playground`, `WithLede`, `Centred`, `OnBrand`, `Surfaces` |

Nothing the plan missed.

**Gate:**
```
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache → Successfully ran
run-many -t typecheck lint test -p ui design-tokens --skip-nx-cache → tokens 4 files / 263 · ui 64 files / 1035 → Successfully ran
pnpm nx run storybook:test            → 58 files / 589 passed
storybook:build                       → Successfully ran
pnpm nx format:check                  → failed on the plan doc only → re-sorted (060e7dd) → exit 0
```

## Task 15: Stat (server-safe)

**Built:**
- `tokens/component/stat.json` (`text-stat-value` fluid clamp at `{font-weight.black}`, `text-stat-label`, `text-stat-sub`).
- The three names in `TEXT`.
- `molecules/stat/{stat.tsx,.test.tsx,.stories.tsx}`, verbatim from the brief.
- A barrel line after Snackbar and before Tabs.
- No new contrast pair (brief).
- No spacing tokens, so no R61 marker.

**Deviations:**
- Plan-doc re-sort (`1117a1e`): `font-display text-stat-value` and `font-body text-stat-label`.
- 11 tests, as the brief expects.

**TDD:** "Failed to resolve import ./stat" first, then 11 passed.

**Dev parity** (verified against dev's 9 tests and 8 stories):

| Dev item | Ruling | Where / why |
| --- | --- | --- |
| no sub line and no glyph unless given | ADD | test "renders no sub line and no glyph…" |
| caller `className` merges | ADD | test "merges a caller className…" |
| `WithSub`, `Row` (three across) and `Narrow` stories | ADD | `WithSub`, `Row`, `Narrow` stories |
| inverse label / sub at 85% / 65% white (`text-text-on-inverse/85`) | DROP | spec D5 / §3.2.2: label and sub are semantic text that the ink surface remaps |
| number fluid (`text-h1-fluid`, extrabold) | ALREADY | `text-stat-value` fluid clamp at font-weight black |
| label and value; three tones; centre; decorative glyph | ALREADY | tests "reads number, label and sub…", tone `it.each`, "centres…", glyph `it.each` (asserts `aria-hidden`, matching dev's "hides the decorative glyph…") |
| `Default`, `WithIcon`, `Tones`, `OnInk`, `Centred` stories | ALREADY | `Playground`, `Default`, `IconBrand`, `InverseCentre` |

Nothing the plan missed.

**Gate:**
```
run-many -t typecheck lint test -p ui design-tokens --skip-nx-cache → tokens 263 · ui 65 files / 1046 → Successfully ran
pnpm nx run storybook:test            → 59 files / 596 passed
storybook:build                       → Successfully ran
pnpm nx format:check                  → failed on the plan doc only → re-sorted (1117a1e) → exit 0
```

## Task 16: Accordion (native `<details name>`, server-safe)

**Built:**
- `tokens/component/accordion.json` (`accordion-answer-measure` 62ch, `text-accordion-question`, `text-accordion-answer`).
- The names in `SPACING` and `TEXT`.
- `@utility details-content-motion` in `styles.css`, directly after `search-reset` (pre-flight order). Tailwind accepted the nested `&::details-content`, so the brief's `@layer components` fallback was not needed.
- `molecules/accordion/{accordion.tsx,.test.tsx,.stories.tsx}`.
- A barrel line at the head of the molecule block, before Alert (`accordion` < `alert`).
- The built Storybook CSS contains `::details-content` (×2), the WebKit marker rule and `max-w-accordion-answer-measure`.

**Fold items applied:**
- **Item 14 (R61):** `accordion-answer-measure` carries `["max-w"]`, and the catalogue spec is green.
- **Item 15:** `& > summary::-webkit-details-marker { display: none; }` is inside `details-content-motion`, and `marker:hidden` is dropped from the summary slot.
- **Item 11:** the `isDisabled` row is DROP (R39). The table below records it as DROP.
- **Items 1, 2 and 17** also apply. The heading rule (R83) does not apply: the questions are `<summary>`, not headings.

**Deviations:**
- **The `Playground` play's keyboard step was changed.**
  - The brief's `userEvent.keyboard("{Enter}")` then `expect(second).not.toHaveAttribute("open")` fails in Chromium. The name-group exclusivity part passes.
  - Storybook's `userEvent` is `@testing-library/user-event`. Its synthetic Enter clicks only `button`, `a[href]` and `input` (`event/behavior/keypress.js`), and a synthetic keydown never triggers the browser's native `<summary>` activation. Its `tab()` also did not reach the next summary: focus went to `<body>`.
  - The play now proves what the component owns. Every `<summary>` has `tabIndex === 0` and takes focus. The Enter/Space toggle is left to the platform, with a comment.
  - A real-keypress proof would need Playwright's keyboard (`vitest/browser`), which the Storybook UI cannot import. The repo has no such precedent. **Controller call** if a real Enter proof is required.
- Plan-doc re-sort (`079ae71`): the summary and answer slot classes.
- 11 tests, as the brief expects.

**TDD:** "Failed to resolve import ./accordion" first, then 11 passed. There are no React warnings for `name` or `open` on `<details>`.

**Dev parity** (verified against dev's 12 tests and 6 stories):

| Dev item | Ruling | Where / why |
| --- | --- | --- |
| clicking a question reveals its answer; a second click hides it | ADD | test "reveals an answer when its question is clicked…" |
| keyboard toggling | ADD (changed) | `Playground` play checks every summary is a focusable Tab stop (`tabIndex` 0, takes focus). The native Enter/Space toggle is not replayable with user-event (see deviation) |
| caller `className` merges | ADD | test "merges a caller className…" |
| `Narrow` story | ADD | `Narrow` story |
| per-item `isDisabled` (inert row "not live yet") + `WithDisabledRow` story | **DROP (R39, fold 11)** | a native `<details>` cannot be disabled; contracts §5 `AccordionItem` is `{ value, question, answer }`. Was DELTA |
| questions rendered as h2–h4 headings (`headingLevel`) + story | DROP | spec D7 / §3.3: native `<summary>`, whose children are presentational |
| Radix roving focus (ArrowDown between questions) | DROP | spec §3.3: `<details name>`; summaries are in the Tab order |
| all collapsed by default; `value` defaults to the question | DROP | contracts §5: `defaultOpen = [items[0].value]`, `value` required |
| egg-containing bakes in the FAQ fixture | DROP | spec C10: pure veg, no egg |
| one open at a time; `isMultiple`; `defaultOpen` | ALREADY | shared `name` tests + `Playground` play (real exclusivity in Chromium: opening "Do you deliver?" closes the first), `isMultiple` and `defaultOpen` tests |
| open question brand pink; chevron rotates | ALREADY | `group-open:text-text-brand`, chevron test |
| `Default`, `FirstOpen`, `Multiple` stories | ALREADY | `Playground` (first open), `Multiple`, `Surfaces` |

Added beyond the plan: the WebKit summary-marker rule (fold 15), which the brief's table does not list.

**Gate:**
```
run-many -t typecheck lint test -p ui design-tokens --skip-nx-cache → tokens 263 · ui 66 files / 1057 → Successfully ran
pnpm nx run storybook:test            → first run: 1 failed (Playground Enter step, above) → after fix 60 files / 601 passed
storybook:build --skip-nx-cache       → Successfully ran
pnpm nx format:check                  → re-sorted the plan (079ae71) → exit 0
```

## Final batch gate (cold)

```
pnpm nx run-many -t typecheck lint test -p ui design-tokens storybook --skip-nx-cache
  design-tokens 263 · ui 66 files / 1057 · storybook 601 → Successfully ran for 3 projects
pnpm nx format:check → exit 0 · pnpm nx sync:check → up to date · pnpm run guard:founder → clean
```

## Concerns

- **Accordion keyboard proof.** Storybook's synthetic user-event cannot fire native `<summary>` activation, so the play checks the Tab stops rather than Enter toggling. This needs a controller call if a real-key proof is required.
- **Snackbar focus return covers every Radix close,** but not a parent flipping a controlled `open` to `false` while focus is inside the bar.
- **The lint-staged backup `stash@{0}` from batch C is still there, untouched.** No new stash was created in this batch.
