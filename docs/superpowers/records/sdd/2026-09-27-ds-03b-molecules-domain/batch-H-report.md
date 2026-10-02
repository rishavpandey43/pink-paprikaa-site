# Batch H report: carried fixes H 1–8, then Plan 3b Tasks 18–20 + the plan-5 doc-table hand-off

Base `f1a6fd9`, head `e796d35`. The first implementer was killed after `f580554` and wrote no report.
This report comes from the recovery run: it audits every landed commit against its brief and the fold
list, re-runs the gates cold, fixes what it found and writes the record. The tree is clean. There was
no `git checkout` of any kind, and `stash@{0}` (the 09-28 lint-staged backup) was not touched.

| SHA | Subject |
| --- | --- |
| `8836939` | fix(ui): let a chip group that starts over its limit drop chips |
| `99df651` | fix(ui): check an errored multiple chip group with axe |
| `cf017ac` | fix(ui): type-check the chip group stories' args |
| `f485d43` | fix(ui): submit no chip values while the group is disabled |
| `5a7fcd2` | fix(ui): keep the steps list a list in Safari |
| `04da7d8` | test(ui): pin that a caller's aria-invalid never reaches the chips |
| `eaadd48` | fix(ui): drop the pink inset from an invalid checked check card |
| `c439433` | fix(ui): refuse a pricing card struck price that is not above the price |
| `2ffadf3` | feat(ui): add the StickyActionBar molecule |
| `38aed58` | docs: re-sort the 3b plan's sticky-action-bar classes |
| `5d65f51` | feat(ui): add the AnnouncementBar molecule |
| `0623386` | feat(ui): add the Table molecule |
| `0fdef56` | docs: re-sort the 3b plan's table header classes |
| `f580554` | refactor(storybook): render the docs tables with the library Table |
| `e796d35` | test(ui): focus the blocked chip inside act (recovery run) |

Every subject is lower-case (fold item 1). Every commit ends with `Co-Authored-By: Claude Opus 5.5`.

## Carried fixes (carried-fixes-H.md)

1. **An over-the-limit group can drop chips** (`8836939`). The guard now blocks a change only when it
   adds a chip and the result is over the limit:
   `next.length > selected.length && next.length > maxSelected`. A new test starts at 3 chips with
   `maxSelected={1}`. It checks that deselecting works, fires `onValueChange` with the shorter list,
   and that pressing an unchosen chip still does nothing.
2. **Axe row "multiple with an error"** (`99df651`). Added to the `it.each`: `status="error"`, a
   message and `maxSelected={2}`.
3. **Story args are type-checked** (`cf017ac`). Each story's args end in
   `satisfies Partial<SingleChipGroupProps>` or `satisfies Partial<MultipleChipGroupProps>`.
   `OnSurfacesStory` renders `{...(args as SingleChipGroupProps)}` twice again, the second time with
   `variant="segmented"`. The meta comment explains why the type is a plain `StoryObj`.
4. **A disabled group submits nothing** (`f485d43`). `HiddenValues` takes `isDisabled` and returns
   null when it is set. Both branches pass `disabled` to it. A test checks a disabled multiple group
   with a `name` and checks that no hidden input renders.
5. **Steps keeps its list role in Safari** (`5a7fcd2`). `<ol role="list">`, with a test. **Deviation:**
   jsx-a11y's `no-redundant-roles` rejects the attribute, so the line carries
   `eslint-disable-next-line jsx-a11y/no-redundant-roles` with a reason. That rule is not a LAW rule:
   07-ai-workflows §1.4 lists the LAW rules as boundary, hex and naming. It is still the only
   `eslint-disable` in `packages/ui`. The cleaner fix is to configure the rule with
   `{ ol: ["list"], ul: ["list"] }` in `tools/eslint-config`. That would also cover the other
   `list-style:none` lists (KeyValueList, FeatureItem lists, Breadcrumb), which have the same
   VoiceOver gap. This is a controller call for the 3b final review.
6. **A caller's `aria-invalid` never reaches the chips** (`04da7d8`, test only). The batch G
   concern does not reproduce, and the code was already correct, as the recovery run checked:
   `ChipGroupBaseProps` extends no DOM props type, and `SingleChipGroup` and `MultipleChipGroup`
   destructure only named props. Nothing is spread onto the root or onto `ToggleGroup.Root`. So an
   untyped `aria-invalid` is dropped, and the only `aria-invalid` is the one the group derives from
   `status="error"` plus a message. The test spreads an untyped `{ "aria-invalid": true }` and
   asserts that no element has `[aria-invalid]`. It guards against a future `...props`. It could not
   be seen failing first, because no behaviour changed.
7. **An invalid checked CheckCard drops the pink inset** (`eaadd48`). The root gains
   `has-aria-invalid:has-checked:shadow-none`, with a comment that follows the ChoiceCardGroup
   precedent from `267e35f`. The pink-50 fill stays. A test checks that both classes are present.
8. **PricingCard checks `was`** (`c439433`). It throws a `RangeError` when `was <= price`, the same
   way PriceTag does. The JSDoc on `was` says so. An `it.each([130, 120])` test covers a `was` equal
   to the price and one below it, with `console.error` muted.

## Task 18: StickyActionBar (`2ffadf3`, re-sort `38aed58`)

- **Built.** The token `sticky-action-bar.json` defines `text.sticky-action-bar-amount`, and the name
  is added to `TEXT`. The component, its 6 tests and 4 stories (Playground, PlanCalculator,
  DawatCalculator, InAScrollingPage) match the brief verbatim. The barrel exports it after `steps`
  (fold item 2).
- **Deviation.** Prettier moved `text-sticky-action-bar-amount` after `font-display` in the amount
  slot, and the same move in the plan doc is the separate `docs:` re-sort commit (fold item 9).
- **Dev parity.** No counterpart: the brief says "none (handoff component)", and `git ls-tree dev`
  has no sticky, announcement or table file.
- **Gates.** See the batch gates below. `sticky-action-bar.test.tsx` passes 6 tests, and its stories
  pass 4 in Chromium.

## Task 19: AnnouncementBar (`5d65f51`)

- **Built.** `announcement-bar.tsx` is server-safe. `announcement-expiry.tsx` is the client gate on
  `useSyncExternalStore`, and the barrel does not export it (fold item 2). There are 9 tests and 4
  stories, including the play on `Expired` that checks no strip is left above the header. The barrel
  exports it before `breadcrumb`. No new tokens.
- **Deviation.** The test's `RouterLink` destructures `children` and renders it inside the `<a>`. The
  brief self-closed `<a {...props} />`. The new shape matches the `RouterLink` in
  `link-as.test.tsx`, `link.test.tsx` and `icon-button.test.tsx`, and jsx-a11y `anchor-has-content`
  is the likely reason. The behaviour is the same. Every other file matches the brief byte for byte.
- **Dev parity.** No counterpart (handoff component).
- **Gates.** `announcement-bar.test.tsx` passes 9 tests. Its stories pass 4 in Chromium, `Expired`'s
  play included.

## Task 20: Table (`0623386`, re-sort `0fdef56`)

- **Built.**
  - `table.json` defines `spacing.table-sm`, `table-md` and `table-lg`, each with the R61 marker
    `"utility": ["min-w"]` (fold item 7), plus `text.table-head`. The new names are added to `SPACING`
    and `TEXT`.
  - Contrast group `table-head` added to `contrast-pairs.json`.
  - A compound `table.tsx`, 9 tests and 7 stories: PriceList, ScrollsAt360 (with its play),
    CateringGlance, BoxCompare, Offers, PlanVsApp and CaptionVisible. Every component and every
    `*Props` type is exported from the barrel before `tabs`.
- **Deviations.**
  - The cell base `px-3 py-3` became `p-3`, the shorthand the tailwind lint enforces.
  - Prettier re-sorted the header slot and the stories' `shadow-selected`. The same re-sort in the
    plan doc is commit `0fdef56`.
  - The two price ranges in the PlanVsApp story use `formatRupeeRange(120, 200)` and
    `formatRupeeRange(250, 350)`, which the brief allows. The output is identical (`₹120–₹200`). This
    is the `formatRupeeRange` story work the killed run was on when it stopped, and it landed
    complete.
  - Import order was re-sorted in the test file.
  - The docs-kit catalogue play (`docs-kit.stories.tsx`) now expects `divide-border-subtle` among
    the `color-border-subtle` utilities, because R65 counts Table's row rules as a new library use. Its
    probe also renders two children for a `divide-*` utility and reads the first one, because a
    divide colour paints the children, not the element. This change was forced by
    `storybook:test`, and the reason is in the commit body.
- **Dev parity.** No counterpart (handoff component).
- **Gates.** `table.test.tsx` passes 9 tests. Its stories pass 7 in Chromium, ScrollsAt360's play
  included. Design-tokens pass 284 tests, contrast pairs included.

## Plan-5 hand-off: doc-table.tsx → Table (`f580554`)

- `token-table.tsx` and `contrast-matrix.tsx` now compose
  `Table` / `TableHead` / `TableBody` / `TableRow` / `TableHeaderCell` / `TableCell` with
  `isCaptionVisible`. The old `minWidth` values are remapped as briefed, and each call site has a
  comment that names the old value and its width:
  - `article` (760px) → `md` (620px)
  - `narrow` (960px) → `lg` (720px)
- `apps/storybook/src/docs-kit/doc-table.tsx` is deleted. `git grep DocTable|DocCell|doc-table`
  finds only those two comments.
- The docs-kit stories pass 14 tests, and `catalogue.spec` passes 151.

## Recovery after interruption

What I found:

- **Every commit had landed.** All 14 commits from `f1a6fd9..f580554` were in place, and the tree was
  clean.
- **The briefs were complete.** I pulled each brief's code blocks out with a script and diffed them
  against HEAD:
  - T18's test, component and stories are identical to the brief.
  - T19 and T20 differ only by the deviations listed above.
  - No brief file, export, token, contrast group, test, story or play is missing.
- **Fold items 1, 2 and 7 were applied** to T18–T20: lower-case subjects, barrel placement and the
  `min-w` markers.
- **The `formatRupeeRange` stories were complete.** That was the killed run's last work: both ranges
  in `table.stories.tsx` use it, and no hand-joined `formatRupees(…)–formatRupees(…)` remains in
  `packages/ui` or `apps`.
- **The H6 behaviour was already correct** (see carried item 6).
- **All 8 carried items were addressed.**

What I fixed:

- **`e796d35` test(ui): focus the blocked chip inside act.** The new H1 test called `blocked.focus()`
  outside `act`, so every `ui:test` run logged Radix RovingFocusGroup's "not wrapped in act(...)"
  warning. The call is now wrapped in `act`. The re-run is clean: 19 tests, no warning.

## Gates on HEAD `e796d35` (cold, `--skip-nx-cache`)

The recovery run ran these on `f580554` and again on `e796d35`, with the same results both times.

| Command | Result |
| --- | --- |
| `pnpm nx run-many -t typecheck lint test build --skip-nx-cache` | 12 projects + 1 dependency, exit 0. Tests: ui 1352 (90 files), storybook 776 (83 files), design-tokens 284, utils 18, content 20, image-pipeline 1, seo 1. Lint: 0 errors; two `playwright/no-conditional-in-test` warnings in `apps/*-e2e` that were already there. |
| `pnpm nx format:check` | exit 0 |
| `pnpm nx sync:check` | "The workspace is up to date", exit 0 |
| `pnpm nx run storybook:test --skip-nx-cache` | 776 / 776, both runs. No "Failed to fetch dynamically imported module", so no re-run was needed. |
| `pnpm guard:founder` | "Founder-name guard: clean." (run after build, against web/blog/storybook output) |

Nx marks `ui:test` and `storybook:test` as "flaky" from its local run history. Neither failed in this
run.

## Concerns

- **The only `eslint-disable` in `packages/ui`** is the one from H5. It is not a LAW rule, but
  configuring `jsx-a11y/no-redundant-roles` to allow `ol`/`ul` `list` would remove it and fix the
  same VoiceOver gap in the other `list-style:none` lists. This is a controller call.
- **H6's test was never seen failing.** The behaviour was already correct, so the test only guards
  against a regression.
