# Plan 3a, batch E report (carried fixes + Task 10 EmptyState + Task 11 Tabs + Task 12 Breadcrumb + Task 13 Pagination)

Base `a335bb1`. Tree clean at the end. Commits, in order:

| SHA | Subject |
| --- | --- |
| `aa32a7e` | fix(ui): pin the otp caret to the end of the code |
| `ab58e11` | fix(ui): keep stepper focus on a button that reaches the end of the range |
| `2ee0900` | fix(ui): treat a slot picker value without a handler as its starting pick |
| `205e09c` | feat(ui): add the EmptyState molecule |
| `9c85a1e` | feat(ui): add the Tabs molecule on Radix Tabs |
| `8f265a5` | docs: re-sort the tabs classes in plan 3a |
| `4de5e34` | feat(ui): add the Breadcrumb molecule |
| `cd83cd9` | feat(ui): add the Pagination molecule with real links |

## Carried fixes (`carried-fixes-E.md`, items 1–3)

1. **OtpInput caret pinned to the end** (`aa32a7e`).
   - The input has an `onSelect` that calls `setSelectionRange(len, len)`. An arrow key or a tap can no longer move the invisible caret, so only append and Backspace are possible, which matches what the cells show.
   - New test: "keeps the invisible caret at the end…". It types `48`, presses ArrowLeft twice, types `2`, and expects cells `4 8 2`.
   - TDD: the test failed first (1 failed), then all 17 passed. The paste, too-long and Backspace tests are still green.
2. **QuantityStepper end buttons use `aria-disabled`** (`ab58e11`).
   - The − and + buttons at min and max get `aria-disabled="true"` and an `onClick` guard in place of `disabled`, so focus stays on the button.
   - Native `disabled` is now only the whole-control `disabled` prop.
   - Visuals: `aria-disabled:cursor-not-allowed aria-disabled:text-ink-400` were added next to the `disabled:` pair. Hover and press became `not-disabled:not-aria-disabled:hover:` / `…:active:press-scale`.
   - Tests:
     - "disables − at the minimum…" is now "marks − at the minimum and + at the maximum aria-disabled, and they step no further". It checks the attribute and that a click reports nothing.
     - New: "keeps focus on − when a press reaches the minimum". It checks `aria-disabled`, `toBeEnabled` and `toHaveFocus`.
     - The grey test also asserts `aria-disabled:text-ink-400`.
   - Chromium `play` on `AtMin`: press + then −, then focus is on −, it is `aria-disabled`, and the computed cursor is `not-allowed`.
   - **Mutation-checked:** I put `disabled={disabled || isAtMin}` back, and the `AtMin` play failed on `toHaveFocus`. I then restored the fix.
   - I tried a hover-background probe and dropped it: `transition-control` makes the computed colour read transparent even on an enabled button, so the check proved nothing.
3. **SlotPicker `value` without a handler** (`2ee0900`).
   - `isControlled` now needs both `value` and `onValueChange`. Otherwise the radios take `defaultChecked` from `value ?? defaultValue`.
   - The `value` JSDoc says controlled use needs `onValueChange`.
   - New test: "takes a value with no handler as its starting pick, without React's read-only warning". It spies on `console.error`, expects no calls, and checks that the pick still moves on click.
   - TDD: failed first, then 19/19 passed.

Gate for the fixes: ui tests green per file, and `storybook:test` for quantity-stepper passed 7/7. The full gates below include them.

## Task 10: EmptyState (server-safe)

**Built:**
- `tokens/component/empty-state.json` (`empty-state-symbol-lg`, 52px).
- `"empty-state-symbol-lg"` in `SPACING`.
- `molecules/empty-state/{empty-state.tsx,.test.tsx,.stories.tsx}`.
- A barrel line sorted after Alert and before Field.

**Fold items applied:**
- **Item 14 (R61):** `empty-state-symbol-lg` carries `"$extensions": { "pink-paprikaa": { "utility": ["size"] } }`, and `storybook:test` (catalogue spec) is green.
- **Items 1, 2 and 17.**

**Deviations:**
- **The heading uses `createElement(headingTag(headingLevel), { className }, title)`, not `const Heading = headingTag(…)`.** The brief's form fails lint with `react-hooks/static-components` ("Cannot create components during render"): the React Compiler lint reads a capitalised call result as a component created during render. This is the first consumer of `headingTag`, so SectionHeader, Accordion and others in batches F and G will hit the same rule. Dev avoided it with a map lookup (`HEADING_TAG[level]`), but `lib/heading.ts` exports only the function (contracts §1). A comment in the code records why.

**TDD:** "Failed to resolve import ./empty-state" first, then 8 passed.

**Dev parity:**

| Dev item | Ruling | Where / why |
| --- | --- | --- |
| glyph drawn at 32px in pink-300 | ADD | assertions in the glyph test |
| `md` padding (`py-10`) as well as `lg` | ADD | size test |
| caller `className` merges | ADD | test "merges a caller className…" |
| `InCart` story (inside a cart panel, one action) | ADD | `InCart` story |
| default title "Nothing here yet." / body "Let's fix that." | DROP | spec D9 (no content defaults); contracts §5 makes `title` required |
| `hasSymbol` boolean | ALREADY | `variant="symbol"` (spec §8.2, contracts §5) |
| title as a `<p>` | ALREADY | a real heading at `headingLevel` (default 3, deviation 14) |
| caller copy; symbol hidden from AT; one action; axe | ALREADY | tests "titles itself…", "shows the brand diamond…", "renders its one action", axe |
| `Default`, `Symbol`, `WithIcon`, `Sizes` stories | ALREADY | `Playground` (symbol + action), `WithIcon`, `Large` |

I checked this against dev's `empty-state.test.tsx`: its 7 tests map to the rows above. Its `InCart` story is covered.

**Gate:**
```
pnpm nx build design-tokens + run-many -t typecheck lint test -p ui design-tokens --skip-nx-cache
  tokens 4 files / 261 · ui 60 files / 983 → Successfully ran
pnpm nx run storybook:test            → 54 files / 562 passed (catalogue spec green with the marker)
pnpm nx run @pink-paprikaa-web/storybook:build → Successfully ran
pnpm nx format:check                  → exit 0
```

## Task 11: Tabs (client, Radix Tabs)

**Built:**
- `tokens/component/tabs.json` (`tabs-segmented-fg`, `text-tabs-label`).
- `"tabs-label"` in `TEXT`.
- A `tabs` contrast group (pink-700 on the card).
- `molecules/tabs/{tabs.tsx,.test.tsx,.stories.tsx}`.
- A barrel line sorted after SlotPicker and before Toast.

**Fold item 11 (R39) applied:**
- `TabItem.isDisabled?: boolean | undefined` → `<RadixTabs.Trigger disabled={item.isDisabled === true}>`.
- The trigger gains `disabled:cursor-not-allowed disabled:text-ink-400`, and every trigger `hover:` became `not-disabled:hover:` (including `aria-selected:not-disabled:hover:bg-brand-hover`).
- `isFullWidth?: boolean | undefined`: the variant `{ list: "flex-nowrap justify-self-stretch", trigger: "min-w-0 flex-1 shrink" }` plus the compound `{ variant: "underline", isFullWidth: true, class: { list: "gap-x-0" } }`.
- Tests:
  - "disables a tab it is told to, and the arrow keys skip it": `toBeDisabled`, a click reports nothing, and ArrowRight from All Day lands on Bar.
  - "shares the row equally between its tabs when full width": `flex-1` on every trigger.
- Stories:
  - `WithDisabledTab`, with a play: disabled, and ArrowRight skips it in Chromium.
  - `FullWidth` (segmented, two items), with a play: both triggers have equal rendered widths.
- Items 1, 2 and 17 also apply.

**Deviations:**
- There are 12 tests: the brief's 10 plus the 2 fold tests.
- Plan-doc re-sort (`8f265a5`, the known trap). Once `text-tabs-label` and `text-tabs-segmented-fg` existed, Prettier moved them in the plan's Task 11 code block.

**TDD:** "Failed to resolve import ./tabs" first, then 12 passed.

**Dev parity:**

| Dev item | Ruling | Where / why |
| --- | --- | --- |
| underline trigger has a 44px hit height | ADD | `min-h-hit` on the underline trigger (spec §5.5) + assertion |
| active tab underlined in brand pink | ADD | assertion `aria-selected:after:bg-border-brand` |
| leading glyph beside a tab label | ADD | trigger `inline-flex items-center gap-2`; the glyph rides in the ReactNode `label` + test + `WithIcons` story |
| caller `className` merges | ADD | test "merges a caller className…" |
| `Narrow` story (360px) | ADD | `Narrow` story |
| per-tab `isDisabled` (inert "off today" section) | **ADD (R39, fold 11)** | `TabItem.isDisabled` + test + `WithDisabledTab` story (play) — was DELTA |
| `isFullWidth` (equal shares across a card) | **ADD (R39, fold 11)** | `TabsProps.isFullWidth` + test + `FullWidth` story (play) — was DELTA |
| underline row scrolls sideways instead of wrapping | ALREADY | the row wraps (`flex-wrap gap-y-3`): never clips or overflows at 360px, covered differently |
| `icon?: LucideIcon` on `TabItem` | ALREADY | `label: ReactNode` carries the glyph (contracts §5) |
| optional `label` | ALREADY | `label: string` required (contracts §5); an unnamed tab list is an a11y gap |
| named list; first tab default; defaultValue; click; arrows; controlled | ALREADY | tests "is a named tab list…", "starts at defaultValue", "selects a tab…", "moves and selects…", "reports but…" |
| `Default`, `TwoSections` stories | ALREADY | `Playground`, `TwoItems` |
| dev `FullWidth`, `WithDisabledSection` stories | ADD | `FullWidth`, `WithDisabledTab` |

I checked this against dev's `tabs.test.tsx`: its 12 tests map to the rows above. "does not select a disabled tab" and "splits the row into equal shares" are now the fold-11 tests.

**Gate:**
```
run-many -t typecheck lint test -p ui design-tokens --skip-nx-cache → tokens 263 · ui 61 files / 995 → Successfully ran
pnpm nx run storybook:test            → 55 files / 569 passed
storybook:build                       → Successfully ran
pnpm nx format:check                  → failed on the plan doc only → re-sorted (8f265a5) → exit 0
```

## Task 12: Breadcrumb (server-safe)

**Built:**
- `tokens/component/breadcrumb.json` (`breadcrumb-chevron`, `text-breadcrumb`).
- `breadcrumb-chevron` added inside `color` of `surface/brand.json` and `surface/ink.json` (`{color.white-alpha.50}`), and restored in `surface/light.json` (`{color.ink.400}`). These were one-line text insertions, so the rest of each file's formatting is untouched.
- `"breadcrumb"` in `TEXT`.
- `molecules/breadcrumb/{breadcrumb.tsx,.test.tsx,.stories.tsx}`.
- A barrel line sorted after Alert and before EmptyState.

**Fold items applied:**
- **Item 8:** `export const OnSurfacesStory: Story = { name: "OnSurfaces", … }`.
- **Item 12:** `Long` uses `globals: { viewport: { value: "floor360", isRotated: false } }`.
- **Items 1, 2 and 17.**

**Deviations:**
- **`OnSurfacesStory` names each landmark per ground.** The brief's story renders five `<nav aria-label="Breadcrumb">`, and the story a11y run failed axe `landmark-unique`. It now uses `OnSurfaces`' function child: `(ground) => <Breadcrumb {...args} aria-label={`Breadcrumb on ${ground}`} />`, with a comment.
- **An extra `play` on `Long`:** `innerWidth === 360`, the nav's `scrollWidth <= clientWidth`, and the document does not scroll sideways. This covers "wraps, never clips" in a real browser, following the 2c precedent.

**TDD:** "Failed to resolve import ./breadcrumb" first, then 9 passed.

**Dev parity:**

| Dev item | Ruling | Where / why |
| --- | --- | --- |
| caller `className` merges with its own | ADD | test "merges a caller className…" |
| `UnlinkedLevel` story | ADD | `UnlinkedLevel` story |
| `tone="inverse"` (white trail on brand / ink) | DROP | spec D5, deviation 7: the chevron is a surface-overridden token; the `OnSurfaces` story shows it |
| `label` prop for the landmark name | ALREADY | native `aria-label` (default "Breadcrumb", deviation 15) |
| named nav + `<ol>`; links all but current; last current even with href | ALREADY | tests "is a named navigation landmark…", "links every crumb…", "marks the last crumb…" |
| mid crumb without href is text; chevrons between, none after the last | ALREADY | tests "writes a middle crumb…", "separates crumbs…" |
| `Default`, `TwoLevels`, `LongTrail`, `OnBrand`, `Narrow` stories | ALREADY | `Playground`, `TwoLevels`, `Long` (360px viewport + no-clip play), `OnSurfaces` |

**Gate:**
```
run-many -t typecheck lint test -p ui design-tokens --skip-nx-cache → tokens 263 · ui 62 files / 1004 → Successfully ran
pnpm nx run storybook:test            → 56 files / 574 passed
storybook:build                       → Successfully ran
pnpm nx format:check                  → exit 0
```

## Task 13: Pagination (server-safe)

**Built:**
- `molecules/pagination/{pagination.tsx,.test.tsx,.stories.tsx}`.
- A barrel line sorted after OtpInput and before QuantityStepper.
- No tokens.

**Fold items applied:**
- **Item 13:** each arrow renders as `<Icon icon={ChevronLeft} size="sm" /><span className="sr-only">Previous page</span>`, and the same for Next. Names and test are as written.
- **Items 1, 2 and 17.**

**Deviations:**
- **Page link text is `<span className="sr-only">Page</span> {slot}`, not `<span className="sr-only">Page </span>{slot}`.** With the brief's form, `textContent` is "Page 5", but the computed accessible name is "Page5": dom-accessibility-api trims the span's own text. Three `getByRole("link", { name: "Page N" })` tests failed as a result. Moving the space outside the span gives "Page 5" for both, and a comment in the code says why.
- **Test helper:** `link.textContent`, not `link.textContent ?? ""`. `no-unnecessary-condition` rejects the `??`, the same fix as batch C's OtpInput helper.

**TDD:** "Failed to resolve import ./pagination" first. Then 3 failed on the "Page5" name, and all 10 passed after the space fix.

**Dev parity:**

| Dev item | Ruling | Where / why |
| --- | --- | --- |
| the pages are an ordered list (`<ol>`) | ADD | `<ol>` (was `<ul>`) + landmark test |
| caller `className` merges with its own | ADD | test "merges a caller className…" |
| `ManyPages` (6 of 24) and `Narrow` stories | ADD | `ManyPages`, `Narrow` stories |
| `onPageChange(page, event)` for a client router | DROP | contracts §5 "links, not callbacks", spec §8.2 (`onClick` for navigation → `href`); `linkAs` takes the router |
| a single page still renders (layout does not jump); `SinglePage` story | DROP | deviation 13: `pages < 2` renders nothing (a plan ruling, not a spec clause) |
| 44px pills (`h-11 min-w-11`) | DROP | spec D2: the design system's `Pagination.jsx` pills are 40px; the §5.5 floor of ≥24px holds |
| optional `page` / `pages` (default 1) | ALREADY | required by contracts §5 |
| real links; current flooded + `aria-current`; ±1 collapse; clamp | ALREADY | tests "links each page…", "shows the first, the last…", "keeps an out-of-range page…" |
| no previous on page 1, no next on the last (inert spans) | ALREADY | test "has no previous link…" |
| Enter on Next follows it | ALREADY | native `<a href>` (no callback to observe) |
| `Default`, `FirstPage`, `LastPage`, `ThreePages` stories | ALREADY | `Playground`, `FirstPage`, `LastPage`, `ThreePages` |
| arrow names as text (not in dev) | ADD | fold 13: `sr-only` "Previous page" / "Next page" |

**Gate:**
```
run-many -t typecheck lint test -p ui design-tokens --skip-nx-cache → tokens 263 · ui 63 files / 1014 → Successfully ran
pnpm nx run storybook:test            → 57 files / 580 passed
storybook:build                       → Successfully ran
pnpm nx format:check                  → exit 0
```

## Final batch gate (cold)

```
pnpm nx run-many -t typecheck lint test -p ui design-tokens storybook --skip-nx-cache
  design-tokens 263 · ui 63 files / 1014 · storybook 57 files / 580 → Successfully ran for 3 projects
pnpm nx format:check → exit 0 · pnpm nx sync:check → up to date · pnpm run guard:founder → clean
```

## Concerns

- **`headingTag` versus the React Compiler lint (affects batches F and G).** The brief's `const Heading = headingTag(level); <Heading>` fails `react-hooks/static-components`. EmptyState uses `createElement`. SectionHeader, Accordion and every later titled component will need the same, or `lib/heading.ts` could export the map. The second option is a contracts §1 change, so it is a controller call.
- **The pagination "Page5" name trap** comes from the brief's own code. Any later `sr-only` prefix written as `"Word "` + text has the same problem.
- **The OTP caret pin also collapses a select-all**, so select-all-then-type no longer replaces the code. Clearing is by Backspace, and a paste appends and is then truncated to `length`. This is what the carried fix asked for, matching the cells.
- **The lint-staged backup `stash@{0}` (`5271974`, batch C) is still there, untouched.** One commit attempt in this batch failed commitlint (a body line over 100 characters) and was retried; it created no new stash.
