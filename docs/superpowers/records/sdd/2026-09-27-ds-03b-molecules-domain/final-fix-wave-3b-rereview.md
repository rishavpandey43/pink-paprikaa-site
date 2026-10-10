# Plan 3b final fix wave: re-review (6ca22f3..c307865)

Reviewer: read-only. HEAD, index, tree and branches untouched (`feat/design-system` @ `c307865`, clean).
Inputs: `final-fix-wave-3b.md` (binding), `final-review-3b.md`, the checklist, `task-0-fold-list.md`,
the implementer's report and `review-6ca22f3..c307865.diff` (read in full).

Evidence beyond the diff:
- Code at HEAD, for line numbers and the named risks (a)–(e).
- The `apps/storybook/storybook-static` build. It is dated 00:15, after HEAD's commit at 00:13. I
  served it read-only on localhost and measured it in Chromium at a 360px viewport (`sb-main-padded`).
- Library sources: Storybook 10.5.7 `base-preview-head.html`, addon-vitest's `__vitest_browser__`
  check, addon-docs' `rehype-slug`, jsx-a11y 6.10.2's `no-redundant-roles` and Vitest 4.1.10.
- The gate logs `final-fix-wave/gate2-{1..4}.log`.

I re-ran no suites and no focused tests.

### Checklist

- [x] ✅ **Items 1–21, against `final-review-3b.md`.** Table alignment is untouched (R105: no
  `align` prop, `tableHeaderCell`/`tableCell` alignment unchanged). There is no AUTHORING.md edit and
  no library-wide focus audit (R107). Per item:
  1. ✅ **I1, focus rings.**
     - Fix: `coupon-ticket.tsx:76` has `focus-visible:-outline-offset-4`. The stub corners follow the
       ticket at `:45` (md stacked / split) and `:60` (lg). `filter-bar.tsx:51` has
       `-m-1 … scroll-px-1 … p-1 pb-2`.
     - Plays: `coupon-ticket.stories.tsx:85` `StubFocusRing` and `:97` `StubFocusRingNarrow` (360),
       and `filter-bar.stories.tsx:88` `Scroll` (Tab to the first chip, End to the last chip). Each
       uses a local `ringClippers` (`:59` / `:44`) that inflates the rect by outline width + offset
       against every overflow ancestor's padding box, and asserts `:focus-visible`.
     - RED was reported at the `ringClippers` lines. The helper stays local (R107).
  2. ✅ **I2 + carried 8 / 12, offer wording.**
     - Fix: `choice-card-group.tsx:213-217` joins description, meta and badge (each only when
       `isShown`). `:93` sets `meta: "flex max-w-full **:whitespace-normal"`, so the offer wraps.
     - Unit tests: `choice-card-group.test.tsx:41` (badge "Pick" in the description) and `:70` (meta,
       with and without a description).
     - Play `PlanLengths` (`stories.tsx:119`): offer label `scrollWidth <= clientWidth` and
       `toHaveAccessibleDescription(/Offer…/)` on both radios.
     - Measured at 360: both offer labels have `scrollWidth == clientWidth` (114) and wrap to two
       lines.
     - See Important I1 for the **badge** half of item 2.
  3. ✅ **I3, ChipGroup ref.** `chip-group.tsx:39` adds `ref?: Ref<HTMLDivElement> | undefined`,
     forwarded at `:197` and `:267`. Tests: `chip-group.test.tsx:206` (the ref is the radiogroup,
     `focus()` lands on "Dinner", Tab out gives `onBlur` ×1) and `:234` (multiple: first chip). This
     matches 3a's test name and shape.
  4. ✅ **Carried 1 + Minor 2, list roles.**
     - Config: `tools/eslint-config/react.js:48`. The disable is gone from `steps.tsx:68` (no
       `eslint-disable` left in `packages/ui/src`). `role="list"` is on `step-tracker.tsx:97` and
       `pricing-card.tsx:112`.
     - Tests: `step-tracker.test.tsx` and `pricing-card.test.tsx` ("keeps its unstyled … a list for
       Safari"). `react.test.mjs` lints probes with the preset's own setting. It is picked up by
       `node --test *.test.mjs`.
  5. ✅ **Carried 2, CheckCard invalid.** `check-card.stories.tsx:63` `Invalid` and `:89`
     `InvalidChecked`. Both plays compute the danger border on the card and the box via `paint`, plus
     `boxShadow` `none` / no pink-500. RED was by mutation.
  6. ✅ **Carried 3, restoreMocks.** `packages/ui/vite.config.mts:19`. The per-test
     `vi.restoreAllMocks` calls are gone from `chip-group.test.tsx` and `pricing-card.test.tsx`. Risk
     (c) is below.
  7. ✅ **Carried 4 + 9, OnSurfaces.** `chip-group.stories.tsx:216` passes
     `label="Meals per day"`, and `:213` sets `basis-full … sm:basis-0`. The play asserts 5× each
     radiogroup name, and `OnSurfacesAt360` (`:227`) asserts page `scrollWidth <= clientWidth`.
  8. ✅ **Carried 5, Table `none`.** `table.tsx:15-18`: `none` uses `overflow-clip`, sm/md/lg use
     `overflow-x-auto`. Covered by unit `table.test.tsx:58` and play `table.stories.tsx:328`
     `PlanVsAppAt360` (`overflowX === "clip"`, frame and page fit).
  9. ✅ **Carried 6, isShown sweep.**
     - `sticky-action-bar.tsx:44`, `menu-item-row.tsx:103`, `menu-item-card.tsx:96`,
       `outlet-card.tsx:130`, `filter-bar.tsx:101,106`.
     - ChoiceCardGroup gates description, price, was, meta and badge (`:188-240`).
     - Each component has a "0 counts, false does not" test. ChoiceCardGroup's
       `description={false}` case is at `test.tsx:200` (no `aria-describedby`, no empty span), and a
       0 price at `:223`.
     - Risk (e) is below.
  10. ✅ **Carried 7, disabled box border.** `check-card.tsx:20` adds
      `disabled:not-checked:border-ink-400`. Play `Disabled` (`stories.tsx:111`): ink-400 paint, and
      `!== groundOf(box)`. RED is in the report (`rgb(236,230,232)` vs `rgb(184,171,177)`).
  11. ✅ **Carried 10, docs prose.**
      - Inline code: `apps/storybook/.storybook/styles.css:21` sets `overflow-wrap: anywhere`, scoped
        to `.sbdocs-content :not(pre) > code`.
      - Tables: `ProseTable` (`docs-kit/prose.tsx`) is wired through `preview.tsx`
        `docs.components`.
      - Covered by `prose.stories.tsx:23` and `:107`, plus the report's 27-page probe (`<= 360`).
  12. ✅ **Carried 11, BookingRules at 360.** `key-value-list.stories.tsx:89` `BookingRulesAt360`
      asserts six `dd` elements `>= 128` and that the page fits. RED (old `p-6`) still fails at the
      corrected geometry (item 24).
  13. ✅ **Minor 1 (R107), StruckPrice.**
      - `lib/struck-price.tsx` holds the `<s>`, `text-text-subtle`, the hidden lower-case `label = "was"`
        and `assertStruckAbove`.
      - It is consumed by PriceTag, PricingCard and ChoiceCardGroup. The latter greys a disabled card
        through `group/card` + `group-has-disabled/card:text-ink-400` (`:87`).
      - Tests: `struck-price.test.tsx` and the consumer tests. Plan 4's QuotePanel uses `"was"` and
        `StruckPrice`, in a `docs:` commit. Risk (a) is below.
  14. ✅ **Minor 3, deviation 19.** The plan table has row 19 and the FilterBar "Produces" line
      cites it. Spec D17 is amended, and contract §6 drops `name`/`onBlur` with the citation.
  15. ✅ **Minor 4, CheckCard + Field.** The JSDoc is at `check-card.tsx:34`. The test passes only
      `aria-describedby`/`aria-invalid` and asserts `labels.length === 1` (`check-card.test.tsx:106`).
  16. ✅ **Minor 5, paint.** The hand-rolled probes in `check-card.stories.tsx` (DisabledChecked) and
      `choice-card-group.stories.tsx` (WithError) now use `lib/story-paint`. A mutation check proves
      both still bite.
  17. ✅ **Minor 7.** The JSDoc is at `table.tsx:61`, and the docs description is updated.
  18. ✅ **Minor 8.** `feature-item.stories.tsx:168` uses `formatRupees(130)`.
  19. ✅ **Minor 9.** Both history comments are gone (`contrast-matrix.tsx`, `token-table.tsx`).
  20. ✅ **Minor 10.** The JSDoc is at `announcement-bar.tsx:25`. The fixture and the story meta drop
      `countdownLabel`, and the test asserts "closes in" ×1 (`announcement-bar.test.tsx:99`).
  21. ✅ **JSDoc recommendations.** ChipGroup has the R100 model (`chip-group.tsx:298`). ChipGroup
      (`:300`) and ChoiceCardGroup (`choice-card-group.tsx:133`) have "own `status`/`message`; do not
      wrap in Field".
- [~] ⚠️ **Owner item 22: the ChoiceCardGroup badge stays inside its tile.**
  - ✅ The slot is `badge: "flex max-w-full min-w-0"` (`choice-card-group.tsx:90`), as the owner
    specified.
  - ✅ A play measures the Badge element itself (`[id$='-badge'] > *`, not the meta line). It checks
    the right edge against the card's content right (rect − border − padding) and
    `scrollWidth <= clientWidth`, through `expectBadgesInsideTheirCards` (`stories.tsx:62`).
    - It runs in `LongBadgeInNarrowTile` (`:164`), which asserts the tile is exactly 150px.
    - It also runs in `PlanLengths` at floor360 (`:159`).
    - Measured at 360: the badge's right edge is 331, equal to the content right of 331. Contained.
  - ✅ RED on the pre-fix code is reported with specific numbers: `200 <= 174` and `203.2 <= 137`.
    The mechanism is sound: a content-sized flex wrapper makes the Badge's `max-w-full` circular.
  - ✅ Item 2 still holds for the accessible description: "Our recommendation" and the offer are in
    the descriptions (`stories.tsx:150-158`, `:191`).
  - ⚠️ **But** the `scrollWidth` half of the assertion cannot fail. Badge's label is `min-w-0 truncate`
    inside the root (`badge.tsx`), so the root never overflows.
    - Measured at 360: the root reads `scrollWidth 134 == clientWidth 134`, while its label is
      `scrollWidth 168 > clientWidth 114`.
    - So `PlanLengths` at 360 now shows **"OUR RECOMME…"** and passes. See Important I1.
- [x] ✅ **Owner item 23: each scrolling docs table region has its own name.**
  - ✅ `prose.tsx:56` names the region by `:scope > table > caption`, else `headingAbove` (`:13`, the
    last shown, worded heading). It sets `aria-labelledby` (`:70`, `:82`), and uses
    `aria-label="Scrollable table"` only when `name === null` (`:84`).
  - ✅ Ids are unique. A heading without an id gets `${useId()}-name`. A second table under the same
    source gets a hidden `${useId()}-ordinal` span ("table 2"). Storybook's MDX headings already
    carry deduplicated `rehype-slug` ids (addon-docs `mdx-plugin`).
  - ✅ `ProseTablesNamedApart` (`prose.stories.tsx:75`) asserts four distinct names ("Layers",
    "Build outputs", "Packages", "Packages table 2") and that every id on the page is unique. axe
    runs through the preview's `a11y.test = "error"`.
    - RED is reported, including the `landmark-unique` failure on a count-only probe.
    - The `storybook:test` log shows 85/792 green.
  - Note: names can still collide when two *different* headings share text. See Minor M1. That case
    is outside the owner's spec, and no page triggers it today.
- [x] ✅ **Item 24: 360 test geometry equals the canvas.**
  - It is fixed once, in a project `beforeEach` at `preview.tsx:122-131`, gated on the same
    `__vitest_browser__` flag addon-vitest checks (`test-utils.js`).
  - It mirrors Storybook 10.5.7's `base-preview-head.html`: padded = body 1rem, centered = root
    1rem, fullscreen = 0. The cleanup is returned.
  - Contract stories `canvas.stories.tsx:23/30/42` pin 328 / ≤328 / 360.
  - The booking-rules subtraction is gone (`key-value-list.stories.tsx:89-97`).
  - The report says no play newly failed. That is consistent with the gate log (792 passed), so no
    component was loosened.
  - The Storybook UI is unaffected: the hook returns early outside Vitest.
- [x] ✅ **Item 25.** `coupon-ticket.test.tsx:13-15`: `afterEach` keeps only `vi.useRealTimers()`. Only
  3a's `toast`/`slot-picker` `mockRestore` calls remain, which are out of scope.
- [x] ✅ **Gates on the final HEAD, cold, with counts.**
  - `gate2-1`: format/sync OK.
  - `gate2-2`: "Successfully ran targets typecheck, lint, test, build for 12 projects", cache
    skipped. Counts: ui 91/1376 · storybook 85/792 · tokens 4/284 · content 2/20 · utils 1/18.
  - `gate2-3`: `storybook:test` 85/792.
  - `gate2-4`: "Founder-name guard: clean."
  - All 27 subjects are lower-case Conventional Commits.

**Named risks, one focused check each:**
- **(a) Shared struck price.**
  - `lib/struck-price.tsx` imports only `react` types and `./component-variants`, so it imports no
    atom or molecule.
  - PriceTag is an atom importing from `lib/`, which is allowed. The two molecules import from
    `lib/`.
  - Merge safety: `price-was`, `body` and `body-sm` are in `component-variants.ts` `TEXT`, so
    tailwind-merge keeps `text-text-subtle` beside the size classes. `struck-price.test.tsx` and
    `pricing-card.test.tsx` assert both classes.
  - Clean.
- **(b) `no-redundant-roles`.** jsx-a11y 6.10.2 resolves exceptions per element type: the option if
  the key exists, else `DEFAULT_ROLE_EXCEPTIONS`. Only `ol`/`ul` → `list` is added, and `nav` is
  restated. `react.test.mjs` proves `button role=button` and `li role=listitem` still error. Not
  loosened.
- **(c) `restoreMocks`.**
  - In Vitest 4.1 this restores `vi.spyOn` spies before each test, before user `beforeEach` hooks.
  - In `packages/ui` no spy is created at module, `describe` or `beforeAll` scope, and none is in
    `vitest.setup.ts`.
  - The only hook-created spy is in `post-frame.test.tsx:127`, inside a `beforeEach`, so it is
    recreated per test.
  - No test silently stopped asserting.
- **(d) Canvas gutter.** Covered under item 24. It does not loosen anything (the test room went
  from 360 to 328), and it does not touch the UI.
- **(e) isShown.** `isShown` is `!== undefined && !== null && !== false && !== ""`. Tests pin `0` as
  shown, and `false` / `""` as skipped (`choice-card-group.test.tsx:200` uses `meta: ""`). This
  matches React's rendering.

### Strengths

- **Every behavioural fix has a real RED.** Where a new story sat on already-correct code, RED came
  from mutation (CheckCard invalid, story-paint, ring clippers). The BookingRules "passes on old code"
  discovery was reported honestly instead of being papered over, and it led straight to the central
  fix in item 24.
- **Item 24 is fixed at the root and pinned by contract stories** (`canvas.stories.tsx`). Every
  future floor360 play now measures the canvas a reviewer sees, not 32px more.
- **The lint change tests the preset itself** (`react.test.mjs` reads the preset's setting and fails
  on any parse message), so it proves both "allowed" and "still flagged".
- **The StruckPrice extraction is minimal and correct.**
  - One colour, one guard and one hidden word.
  - The `label` escape hatch exists only so Plan 4's chrome-label rule survives, and Plan 4's doc
    was updated in the same wave.
  - ChoiceCardGroup's disabled-grey interaction with the new colour was caught and handled
    (`group-has-disabled/card`).
- **The isShown sweep closes the empty-`aria-describedby` hole**, and tests both directions (0 shown,
  false skipped).
- **The ProseTable keeps Table's semantics:** it is a region and a tab stop only while it scrolls.
  It also skips Storybook's hidden "No Preview" headings, a trap the implementer hit and fixed.

### Issues

#### Critical

None.

#### Important

**I1. A ChoiceCardGroup badge still loses its words at 360, and the badge-overflow assertion cannot
detect it.** This is partly owner-mandated: item 22 allows "truncating/wrapping".
- **Where.** `choice-card-group.tsx:90` (`badge: "flex max-w-full min-w-0"`, no wrap) and
  `choice-card-group.stories.tsx:62-72` (`expectBadgesInsideTheirCards` checks `scrollWidth` on the
  Badge root). The fixture is `PlanLengths` at `:119-161`.
- **What.**
  - Item 22 added `badge: <Badge tone="brand">Our recommendation</Badge>` to the floor360
    `PlanLengths` story.
  - At 360 the tile is 160px wide, and the badge renders as "OUR RECOMME…". Measured in the HEAD
    build: label `scrollWidth 168 > clientWidth 114`.
  - The play still passes. Its `badge.scrollWidth <= badge.clientWidth` reads the Badge root. Badge's
    label is `min-w-0 truncate` (`atoms/badge/badge.tsx`), so the root is always `134 == 134`, and
    that half of the assertion can never fail. Only the right-edge half bites.
  - The report's own concern notes the 150px story truncates "OFFER: +1 FREE / M…" too.
- **Why it matters.**
  - Item 2, which binds this wave, says "the badge/meta text must be in each option's accessible
    description **AND show in full at 360**". The PlanLengths 360 play was meant to assert no
    truncation.
  - Item 22 accepts "truncating/wrapping inside" a 150px tile, so the two rulings conflict for
    badges. The wave resolved the conflict silently, in favour of truncation, inside the very story
    that pins item 2.
  - Plan 4 consumes ChoiceCardGroup on the subscription pages, where badges carry offers and "Our
    pick". Carried item 8 was raised to Important for this exact class of loss. The accessible
    description now holds, so sighted users lose the words and assistive-tech users do not.
- **Fix (owner call, one of):**
  - (a) **Wrap, like meta** (the implementer's own suggestion). Set
    `badge: "flex max-w-full min-w-0 **:whitespace-normal"`. Make the helper also assert the label
    (`[id$='-badge'] > * > :last-child`) has `scrollWidth <= clientWidth`. Then PlanLengths at 360
    and the 150px tile both show the full wording.
  - (b) **Accept truncation for badges.** Record it as a ruling that amends item 2 to cover meta
    only. Drop the vacuous `scrollWidth` line, or replace it with a label-truncation check that
    states the intent. Use a fixture short enough not to truncate in PlanLengths at 360 ("Pick").
  - Either way, the assertion should measure the element that actually clips.

#### Minor

**M1. ProseTable names can still collide in cases the story does not cover** (`prose.tsx:13-21`,
`:53-66`).
- **Cause.** The ordinal is keyed on the *source id*, not the resulting name.
- **Two different headings with the same text.** They get distinct ids: rehype-slug gives
  `examples` and `examples-1`. Each heading's first table is then ordinal 1, so two regions are both
  named "Examples", which fails axe `landmark-unique`.
- **Stale ordinals.** They are computed once, when a table starts scrolling, and are not recomputed
  when another table under the same source starts or stops scrolling later (a resize). That can
  duplicate or skip "table 2".
- **Story headings.** `headingAbove` searches the whole document, so a heading inside an embedded
  story preview can name a prose table.
- **Impact.** Latent: the implementer's sweep found 2 regions across 27 pages, both distinct.
- **Fix.** When a page has more than one region, de-duplicate on the computed name text (group by
  the source's `textContent`). Recompute ordinals from document order on every change, for example
  with a small shared registry, instead of per instance.

**M2. FilterBar's `-m-1` lets the scrolling group's box extend 4px past the root on both sides**
(`filter-bar.tsx:51`).
- **Effect.** A full-bleed rail with no ancestor gutter adds 4px to the page's `scrollWidth`.
- **Precedent.** Cluster uses the same pattern and documents its gutter need
  (`layouts/cluster/cluster.stories.tsx:145`).
- **Fix.** Add one JSDoc line ("needs ≥4px of gutter, as a Container gives"), so Plan 4's MenuList
  does not place it edge to edge.

**M3. `ringClippers` is now duplicated verbatim** in `coupon-ticket.stories.tsx:59` and
`filter-bar.stories.tsx:44`. This is correct under R107 (local helpers only). If Plan 4 needs a third
copy, promote it to `lib/story-paint` (or a sibling) rather than copying it again.

### Assessment — **Plan 3b ready to merge? With fixes**

Items 1–21, 23, 24 and 25 are fixed properly. Each has a covering test or play that bites, and none
of the five cross-cutting changes introduced a regression. One owner decision remains: a
ChoiceCardGroup badge truncates at 360 inside the item-2 story, behind an assertion that cannot catch
it (I1). Either make the badge wrap like meta, or rule truncation acceptable and fix the assertion
and fixture. It is a one-line slot change plus a one-line play change. After that, Plan 4 can
consume these components.

---

## Re-review 2 (26–29): c307865..172c9da

Scope: the 4 commits (`a470b8d`, `fa1b617`, `180db64`, `172c9da`), reviewed against items 26–29
and rulings R108 / R109.

Evidence:
- `review-c307865..172c9da.diff`, read in full, plus HEAD for line numbers. The tree is clean and
  HEAD is still `172c9da`.
- The `storybook-static` build. It is dated 01:42, after HEAD's commit at 01:40. I served it
  read-only and measured it in Chromium: at a 360px viewport, and at the story's own 150px tile.
- The gate logs `final-fix-wave/gate4-{1..4}.log`.

I re-ran no suites. The background tab runs no animation frames, so the docs-table naming (which
reacts to size changes) could not be watched live. I judged that from the code and the reported REDs.

### Checklist (26–29)

- [x] ✅ **Item 26 (R108): the badge wraps at 360 and in a ~150px tile.**
  - **Fix.** `choice-card-group.tsx:91` sets
    `badge: "flex max-w-full min-w-0 **:wrap-anywhere **:whitespace-normal"`. It is scoped to the
    ChoiceCardGroup slot. `atoms/badge/badge.tsx` is untouched (`git diff c307865 172c9da --
    packages/ui/src/atoms` is empty), so other consumers keep `truncate`. Item 22's bound is kept.
  - **The plays measure the label.** `expectBadgesWhole` (`stories.tsx:106`) reads
    `[id$='-badge'] > * > :last-child`, the element that truncates. It checks the full wording
    (`textContent` equals the expected text), the right edge inside the card's content box, and
    `scrollWidth <= clientWidth`. It is called in `PlanLengths` (`:205`) and
    `LongBadgeInNarrowTile` (`:235`).
  - **It can fail.** RED on c307865 is `168 <= 114` and `170 <= 104`. 168/114 is exactly what I
    measured in the first re-review. The report also records that `whitespace-normal` alone failed
    (`135 <= 114`), which shows why `wrap-anywhere` is needed.
  - **Measured at 360 (PlanLengths).**
    - "Our pick": 67 = 67, one line, right edge 274 ≤ 331.
    - Both offers: 114 = 114, two lines, inside the tile.
    - Swapping the label to "Our recommendation" in the page tests the safety net: it wraps to
      three lines with `scrollWidth` 114 = 114, right edge 321 ≤ 331.
  - **Measured at 150px (LongBadgeInNarrowTile).** The tile is 150. The label is 104 = 104, with its
    right edge at 143 ≤ 153. Its one line break falls at a space (before "/").
- [x] ✅ **Item 29 (R109): the fixtures say "Our pick".**
  - `PlanLengths` passes `badge: <Badge tone="brand">Our pick</Badge>`, and its description regex
    and the `expectBadgesWhole` wording are updated.
  - The `wrap-anywhere` safety net is kept.
  - **New check.** `wordsBrokenMidWord` (`:66`) walks the label's text node with a `Range`, one
    character at a time. It flags a line that starts with no space on either side of the break.
    `expectNoMidWordBreaks` (`:89`) runs it on every badge and meta label, and `PlanLengths` calls
    it at `:206`.
  - This reads the rendered lines directly, not widths. RED was reported on `180db64` (assertion
    only): `['recommendation']`. The meta, which wraps at spaces, passes, so there is no false
    positive.
  - **The two remaining "Our recommendation" strings are right to keep** (Plates' description in
    `stories.tsx:26` / `test.tsx:24`, and its expectation at `test.tsx:45`):
    - They are description prose (`text-caption`). The slot has no `wrap-anywhere` and normal
      wrapping, so the browser can only break at spaces or overflow. It never splits a word, which
      is the failure R109 targets.
    - R109 rules only on badge copy, and Plates' badge is already "Pick".
    - Changing the blurb would be churn with no benefit to the guest.
  - On the checklist's "no 'Our recommendation' left in 3b stories": the remaining hits are
    descriptions, not badges, so the box is met in intent.
  - PricingCard's "Our recommendation" badge (`pricing-card.stories.tsx:126`) is outside R109's
    ChoiceCardGroup scope, and I have no finding on it.
- [x] ✅ **Item 27: docs region names are unique, even with equal heading texts and after a resize.**
  - **Registry.** `prose.tsx:17` holds a module-level registry. `renameRegions` (`:41`) names every
    connected scrolling region in document order. It counts ordinals by the name's words, not by the
    source element, so equal-text headings give "Examples" and "Examples table 2". The generic
    fallback is counted the same way ("Scrollable table 2").
  - **Renaming triggers.** It reruns whenever a region starts or stops scrolling, and on unmount
    (cleanup at `:229`). The early return on an unchanged state avoids rename storms.
  - **Embedded stories.** Headings inside `.docs-story` are skipped (`:29`). That class is
    addon-docs' story wrapper (`blocks.js`).
  - **Ids** stay `useId`-based and unique.
  - **Play.** `ProseTableNamesStayUnique` (`prose.stories.tsx:123`) renders two h2 "Examples" with
    rehype-slug-style ids, then "Packages" over a table that fits and one that scrolls. It expects
    `["Examples","Examples table 2","Packages"]`. It then widens the fitting table, which the
    observer sees because it watches the `<table>`, and `waitFor`s
    `[…,"Packages","Packages table 2"]`.
  - **REDs** were reported for both halves separately. axe runs after the play. The earlier
    `ProseTablesNamedApart` expectations are unchanged and still hold under the new counting.
  - The live probe of the real docs found 27 pages and 0 duplicates.
- [x] ✅ **Item 28: the FilterBar JSDoc states the 4px gutter need.** `filter-bar.tsx:28-31` is on
  `isWrapping`, the prop that selects the rail, and it cites Cluster. The change is JSDoc only.
- [x] ✅ **Gates on the final HEAD, cold** (logs `gate4-*`).
  - Format and sync OK.
  - run-many "Successfully ran targets typecheck, lint, test, build for 12 projects", cache skipped.
    Counts: ui 1376 · storybook 793 (792 plus the one new prose story) · tokens 284 · utils 18 ·
    content 20.
  - `storybook:test` 793.
  - Founder guard clean.
  - The 4 subjects are lower-case Conventional Commits.

### Issues (26–29)

- **Critical:** none.
- **Important:** none. The re-review's I1 is resolved as R108 rules.
- **Minor:**
  - **M4.** `LongBadgeInNarrowTile` (`stories.tsx:235`) does not call `expectNoMidWordBreaks`. I
    measured that its offer breaks at a space today, but nothing pins that. One added line would
    keep the 150px fixture honest if its copy changes. Optional.

The first re-review's M1 and M2 are fixed (items 27 and 28), and M3 is accepted by the controller.

### Assessment (final) — **Plan 3b ready to merge? Yes**

Every item, 1–29, is fixed with a covering test or play that can fail. Each has a RED, and for
26/29 I confirmed it against my own 360 measurements. The badge now wraps inside its tile without
changing the Badge atom for its other consumers. The docs regions stay uniquely named across
equal-text headings and size changes. Only one optional Minor remains, so Plan 4 can consume these
components.
