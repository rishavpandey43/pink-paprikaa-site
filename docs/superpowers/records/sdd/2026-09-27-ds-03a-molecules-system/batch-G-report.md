# Plan 3a, batch G report (carried fixes + Task 17 ListRow + Task 18 PriceSummary + Task 19 StepTracker + Plan 5 StepTracker specimen row)

Base `079ae71`. Tree clean at the end. Commits, in order:

| SHA | Subject |
| --- | --- |
| `e7ae16b` | test(ui): prove the pagination link names in chromium |
| `bb06d67` | fix(ui): start tabs at the first tab that is not disabled |
| `459a847` | docs(ui): reword the pagination arrow-name comments |
| `3134f8d` | test(ui): restore the slot picker console spy even on failure |
| `a200f1b` | fix(ui): hand focus back when the parent closes a snackbar |
| `89ff314` | feat(ui): add the ListRow molecule with asChild |
| `415bdf8` | feat(ui): add the PriceSummary molecule |
| `fa5dc71` | feat(ui): add the StepTracker molecule |
| `6871162` | docs: re-sort the step tracker classes in plan 3a |
| `ac135b0` | feat(storybook): add the step tracker row to the diamond motif |

The carried fixes are one commit each. Each commit's type says what it changes: `test` for items 1 and 4, `docs` for item 3, `fix` for items 2 and 5.

## Carried fixes (`carried-fixes-G.md`, items 1–5)

1. **Pagination names proven in Chromium** (`e7ae16b`).
   - The `Playground` story (page 4 of 12) now has a play. It checks that `getByRole("link", { name: "Page 5" })` has `href="#page-5"`, and that "Previous page" and "Next page" are visible links.
   - **Chromium does not compute "Page5", so the markup is unchanged.** I checked Chromium's own accessibility tree through CDP (`Accessibility.getFullAXTree`, Playwright 1.62.1), using the `sr-only` CSS. The current form `<span class="sr-only">Page</span> 5` reads "Page 5". The brief's original form `<span class="sr-only">Page </span>5` also reads "Page 5". "Previous page" reads correctly.
   - The "Page5" trap is jsdom-only: dom-accessibility-api trims the text there without layout.
   - Mutation check: I put the brief's form back, and the play still passed. The play measures names over real CSS; it would not catch a regression that only jsdom shows. The jsdom tests keep that guard.
2. **Tabs default skips disabled tabs** (`bb06d67`). The default is now `defaultValue ?? items.find((item) => item.isDisabled !== true)?.value ?? ""`, with a comment and a JSDoc line on `defaultValue`. New test: "starts at the first tab that is not disabled when no defaultValue is given" (the first item is disabled, so Breakfast is selected and its panel is visible). TDD: 1 failed first, then 13/13 passed.
3. **Pagination comment wording** (`459a847`). Both arrow comments now read "Text, not an Icon label: matches the pages' sr-only name text."
4. **SlotPicker spy restore** (`3134f8d`). The `console.error` spy is now restored in `try/finally`. 19/19 pass.
5. **Snackbar: focus comes back when the parent closes it** (`a200f1b`, R82 completion).
   - **Cause.** A parent setting `open` to `false` never goes through Radix, so `handleOpenChange` never runs. The bar returns `null` and unmounts with focus inside it, and focus drops to `<body>`.
   - **Fix, part 1.** An `isFocusInsideRef` is set by `onFocus` on the Radix Root. `onBlur` clears it only when `relatedTarget` is outside the bar.
   - **Why the ref survives the unmount.** React turns event dispatch off during a commit, so any blur a removed node fires is ignored, and the ref still reads `true` afterwards.
   - **Fix, part 2.** The existing `useLayoutEffect([isOpen])` now also handles close: if `isOpen` is false and focus was inside, it restores focus through a shared `returnFocus()` (the same element and `isConnected` guard as R82). Radix closes are unchanged: Radix first moves focus to the viewport, and that blur clears the ref, so there is no double restore.
   - **jsdom test.** "when the parent closes it while focus is inside" rerenders with `open` true, focuses Dismiss, then rerenders with `open` false. It expects the region gone, the opener focused and `onOpenChange` not called. It failed first, then 31/31 passed.
   - **Chromium story.** New `ClosedByParent` story: the parent's own 400ms timer closes the bar, with `duration` 10s. Its play clicks "Save address", focuses Dismiss, waits for the bar to go, and expects the opener to have focus. 11/11 pass.
   - **Mutation-checked:** I removed the `returnFocus()` call in the effect. The jsdom test and the Chromium play both failed. I then restored the fix.

## Task 17: ListRow (server-safe, Slot)

**Built:**
- `molecules/list-row/{list-row.tsx,.test.tsx,.stories.tsx}`, from the brief.
- A barrel line after Field and before OtpInput (`list-row` sorts there).
- No tokens.

**Fold items applied:**
- **Slot/asChild** is the Button pattern: `const Row: ElementType = asChild ? Slot.Root : "div"`, with content through `<Slot.Slottable child={children}>{(content) => …}</Slot.Slottable>`. The classes go on the row, not on the slotted child.
- **Items 1, 2 and 17** also apply.

**Deviations:**
- **The empty slotted anchor.**
  - The brief's `<a href="…" />` fails `jsx-a11y/anchor-has-content`: 7 errors, in the test and the stories. The rule is part of the LAW lint policy, so I did not disable it.
  - The rule is a false positive here, because Slot fills the anchor with the row's content at runtime.
  - The fix keeps the contract (`title` required) and writes the child as `<a href="…">{/* ListRow renders its content here */}</a>`. The rule counts an expression container as content, and the comment says why the anchor is empty.
  - `<button type="button" onClick={…} />` children pass as written.
  - App consumers using `next/link` are not affected: the config has no `Link` → `a` component mapping.
  - **Controller call** if you prefer another shape, for example the slotted child carrying the title as Button's child carries its label. That would be a contracts §5 change.
- 10 tests, as the brief expects.

**TDD:** "Failed to resolve import ./list-row" first, then 10 passed.

**Dev parity** (brief table; checked against `git show dev:…/list-row.test.tsx`, which has 13 tests, and its 7 stories):

| Dev item | Ruling | Where / why |
| --- | --- | --- |
| a static row carries no button semantics | ADD | assertion in "shows its title…" |
| Space as well as Enter operates an action row | ADD | asChild-button test |
| chevron only when asked | ADD | chevron test |
| press feedback on an interactive row (`active:scale`) | ADD | `isInteractive` row `active:press-scale` + assertion |
| caller `className` merges | ADD | test "merges a caller className…" |
| axe over a danger action row | ADD | axe test |
| `Narrow` story | ADD | `Narrow` story |
| `onClick` turns the row into a `<button>` | ALREADY | `asChild` + `<button>` / `<a>` / `next/link` (spec D8, contracts §5) |
| description clamps to 2; value; trailing; leading over icon; danger | ALREADY | tests "shows its title…", "puts a leading element…", "renders a trailing control…", "paints…" |
| hairline, none on the last row; 44px hit | ALREADY | divider test; `min-h-hit` in the asChild-link test (dev "holds the 44px hit target") |
| `Default`, `WithValueAndChevron`, `WithDescription`, `WithTrailing`, `Danger`, `Group` stories | ALREADY | `Playground`, `WithDescription`, `TrailingBadge`, `TrailingControl`, `Danger`, `AccountList` |

Nothing the plan missed.

**Gate:**
```
run-many -t typecheck lint test -p ui design-tokens --skip-nx-cache → tokens 4 files / 263 · ui 67 files / 1069 → Successfully ran
pnpm nx run storybook:test            → 61 files / 609 passed
storybook:build                       → Successfully ran
pnpm nx format:check                  → exit 0
```

## Task 18: PriceSummary (server-safe)

**Built:**
- `tokens/component/price-summary.json` (`price-summary-discount` → `{color.mint-strong}`).
- The skin in `surface/brand.json` and `surface/ink.json` (`{color.ink.000}`), restored in `surface/light.json` (`{color.mint-strong}`). These are one-line insertions after `breadcrumb-chevron`.
- The contrast groups `price-summary`, `price-summary-ink` and `price-summary-brand` (the last with `exception: "brand-fill"`, min 3).
- `molecules/price-summary/{price-summary.tsx,.test.tsx,.stories.tsx}`.
- A barrel line after Pagination and before QuantityStepper.

**Fold items applied:**
- **Rupee formatting** goes through Plan 1's `formatRupees` (`@pink-paprikaa-web/utils`). It prints the true minus `−` (U+2212), so discounts pass `-Math.abs(amount)`.
- **Items 1, 2 and 17** also apply.
- There are no spacing tokens, so there is no R61 marker.

**Deviations:**
- **Test "closes with the total…".** `eslint --fix` rewrote the brief's `as HTMLElement` into a non-null assertion, which the lint then rejects. The test now reads `expect(totalGroup).toContainElement(screen.getByText("₹1,139"))`, and the unused `within` import is gone. The assertion means the same thing.
- 9 tests, as the brief expects.

**TDD:** "Failed to resolve import ./price-summary" first, then 9 passed. The token suites went from 263 to 272 with the new pairs: policy, light-restore and surface-alias all green.

**Dev parity** (brief table; checked against dev's 11 tests and 7 stories):

| Dev item | Ruling | Where / why |
| --- | --- | --- |
| Indian digit grouping (`₹1,20,000`) | ADD | test "groups digits the Indian way" |
| a total with no lines; note only when given | ADD | test "renders a total with no lines…" (`lines={[]}`) + `TotalOnly` story |
| caller `className` merges | ADD | test "merges a caller className…" |
| `WithStrongLine`, `Receipt` (renamed total + fine print), `Narrow` stories | ADD | `WithStrongLine`, `Receipt`, `Narrow` stories |
| figures in Space Mono so digits line up | ALREADY | `tabular-nums` + assertion; the design system's `PriceSummary.jsx` sets amounts in body-sm, not mono (D2) |
| `tone="inverse"` (75% / 90% white lines, soft-mint saving on ink) | DROP | spec D5, deviation 7: the lines follow the surface, and the discount is a surface-overridden token. Dev's "lifts the ink tones to white…" test is this row |
| `lines` optional (default `[]`) | DROP | contracts §5 `lines: PriceLine[]` is required; `[]` is covered |
| rupee sign, no space, no decimals; discount minus in mint; strong line | ALREADY | tests "lists each line…", "prints a discount…", "emphasises a strong line" |
| total label renamed; fine print | ALREADY | test "takes another total label and a note" |
| `Default`, `WithDiscount`, `OnInk` stories | ALREADY | `Playground`, `WithDiscount`, `OnInk`, `Surfaces` |

Nothing the plan missed.

**Gate:**
```
pnpm nx run-many -t build test -p design-tokens --skip-nx-cache → 272 passed
run-many -t typecheck lint test -p ui design-tokens --skip-nx-cache → tokens 272 · ui 68 files / 1078 → Successfully ran
pnpm nx run storybook:test            → 62 files / 617 passed
storybook:build                       → Successfully ran
pnpm nx format:check                  → exit 0
```

## Task 19: StepTracker (server-safe)

**Built:**
- `tokens/component/step-tracker.json` (`step-tracker-marker` 22px, `step-tracker-mark` 16px, `step-tracker-bar-on`, `step-tracker-bar-off`).
- The surface skins: brand gets on and off, ink gets off, and light restores both. They are inserted after `price-summary-discount`.
- Both spacing names added to `SPACING`.
- `molecules/step-tracker/{step-tracker.tsx,.test.tsx,.stories.tsx}`, from the brief.
- A barrel line after Stat and before Tabs.
- No contrast pair, as the brief says.

**Fold items applied:**
- **Item 14 (R61):** `step-tracker-marker` and `step-tracker-mark` each carry `"$extensions": { "pink-paprikaa": { "utility": ["size"] } }`. The catalogue spec in `storybook:test` is green.
- **Items 1, 2 and 17** also apply.
- The R83 heading rule does not apply: StepTracker has no heading.

**Deviations:**
- Plan-doc re-sort (`6871162`, the known trap). `size-step-tracker-marker` now sorts after `mt-0.5`.
- 10 tests, as the brief expects.

**TDD:** "Failed to resolve import ./step-tracker" first, then 10 passed.

**Dev parity** (brief table; checked against dev's 12 tests and 7 stories):

| Dev item | Ruling | Where / why |
| --- | --- | --- |
| each step's state spelled out for screen readers ("Done" / "In progress" / "Not started yet") | ADD | `sr-only` `STATE_TEXT` per step + test; the strings are in the accessible-defaults table (deviation 15) |
| nothing started (`current={-1}`) → all upcoming | ADD | test "leaves every step upcoming…" + `NotStarted` story |
| the list takes an accessible name | ADD | native `aria-label` asserted in the state-text test (dev: `label` default "Progress") |
| caller `className` merges | ADD | test "merges a caller className…" |
| vertical tracker on a brand field; `Narrow` story | ADD | `VerticalSurfaces`, `Narrow` stories |
| `tone="inverse"` (white markers and bars on brand) | DROP | spec D5, deviation 7: the bar is a surface-overridden token; the markers keep their own fills. Dev's "flips to the on-brand colourway" is this row |
| bare-string steps (`["Cart", "Details"]`) | DROP | spec §8.2: object lists only |
| `label` prop default "Progress" | DROP | spec D9 / deviation 15: no default copy; the native `aria-label` names the list when a page needs it |
| named `<ol>`; `aria-current="step"`; notes vertical only; check on done | ALREADY | tests "is an ordered list…", "draws a diamond per step…", "shows the notes…", "draws the horizontal…" |
| flood up to the current step | ALREADY | `data-state` + state variants |
| `Default`, `Complete`, `Horizontal`, `OnBrand`, `HorizontalOnBrand` stories | ALREADY | `Playground`, `Complete`, `Horizontal`, `OnBrand` (horizontal on pink), `Surfaces` |

Nothing the plan missed.

**Gate:**
```
run-many -t typecheck lint test -p ui design-tokens --skip-nx-cache → tokens 272 · ui 69 files / 1088 → Successfully ran
pnpm nx run storybook:test            → 63 files / 627 passed (catalogue spec green with the markers)
storybook:build                       → Successfully ran
pnpm nx format:check                  → failed on the plan doc only → re-sorted (6871162) → exit 0
```

## Plan 5: StepTracker specimen row (Brand → DiamondMotif) (`ac135b0`)

- `brand.stories.tsx`:
  - The deferral comment is removed.
  - A `SpecimenRow label="Step — StepTracker"` now sits between SpiceLevel and Rating, as in the Plan 5 Task 3 brief.
  - `StepTracker` is imported from `@pink-paprikaa-web/ui`, and `ORDER_STEPS` from `kits/fixtures`.
- **Deviation: the row draws the vertical tracker, not the brief's `orientation="horizontal"`.**
  - The page says "every small diamond … order-step markers … is a rotated square with the brand mark inside it: white on a coloured fill, pink on an empty ink-200 fill".
  - A horizontal StepTracker draws a segmented bar and has no diamonds, so the brief's specimen would contradict its own prose.
  - The vertical tracker at `current={1}` shows all three marker states: complete (pink with a check), current (pink) and upcoming (ink-200 with a pink mark). A code comment records this.
- **Pattern page prose re-checked and changed.** The old text ended "…heat, score, dot and loader (the order-step marker joins them with StepTracker)". It now reads "…heat, step, score, dot and loader. The step markers are the vertical StepTracker's; its horizontal layout is a segmented bar instead."
- **`kits/fixtures.ts`:** `ORDER_STEPS` is retyped from the local `OrderStep` interface to the real `TrackerStep`, and the local interface is deleted. Plan 5 fold item 5 said to do this "when 3a lands".
- **Visual check:** I took a Playwright screenshot of the built `brand-specimens--diamond-motif`. The three diamonds render in the right column. The complete step's check is a white 12px `lucide-check` over the half-opacity mark: it renders, and it is faint by design.
- **Gate:**
  - storybook typecheck and lint: Successfully ran.
  - `storybook:test --skip-nx-cache`: 63 files / 627 passed.
  - `storybook:build`: Successfully ran.
  - `format:check`: exit 0.

## Final batch gate (cold)

```
pnpm nx run-many -t typecheck lint test -p ui design-tokens storybook --skip-nx-cache
  design-tokens 4 files / 272 · ui 69 files / 1088 · storybook 63 files / 627 → Successfully ran for 3 projects
pnpm nx format:check → exit 0 · pnpm nx sync:check → up to date · pnpm run guard:founder → clean
```

No "Failed to fetch dynamically imported module" flake this batch.

## Concerns

- **ListRow empty anchors (controller call).** jsx-a11y rejects `<a href />` as the slotted child. I used a JSX comment child that explains the empty anchor, rather than a disable. If you want the Button-style shape instead (the child carries the title), that is a contracts §5 change.
- **The DiamondMotif StepTracker row is vertical, not the brief's horizontal,** so it matches the page's diamond claim. The prose was updated.
- **The Pagination play cannot tell the two markup forms apart.** Chromium reads "Page 5" either way, so jsdom stays the guard for the trimming trap.
- **The lint-staged backup `stash@{0}` (batch C) is still there, untouched.** No new stash was left behind.
