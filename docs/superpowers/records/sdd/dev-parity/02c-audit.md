# Dev-parity audit — Plan 2c (Layouts)

Plan: `docs/superpowers/plans/2026-09-27-ds-02c-layouts.md`. Dev source: `dev:packages/ui/src/templates/`
(seven layouts; dev has no `lib/space.ts`, so Task 1's table covers the gap maps each dev layout inlined).
Every count below comes from the tables in the plan (`awk` over the ruling column).

**Totals: ADD 30 · DROP 11 · ALREADY 55 · PENDING 2** (the PENDING rows wait on the contract deltas below).

Task 0 gained Step 5b, which greps for the 8 `**Dev parity:**` tables. The plan file passes `prettier --check`.

## Per component

| Task | Component | ADD | DROP | ALREADY | PENDING |
| --- | --- | --- | --- | --- | --- |
| 1 | `lib/space.ts` (dev's inline `GAP` maps) | 0 | 1 | 2 | 0 |
| 2 | Container | 3 | 2 | 5 | 1 |
| 3 | Stack | 4 | 1 | 9 | 0 |
| 4 | Cluster | 7 | 0 | 7 | 0 |
| 5 | AutoGrid | 4 | 1 | 8 | 0 |
| 6 | Section | 3 | 3 | 7 | 0 |
| 7 | AppShell | 4 | 2 | 7 | 1 |
| 8 | PostFrame | 5 | 1 | 10 | 0 |

Notable items:

- **Space (Task 1).** The shared `GAP_CLASS` is a superset of every dev map. Dev's `gap-0-5` / `gap-1-5` are
  dropped under D4.
- **Container.**
  - ADD: a "paints nothing" test run for every size. It checks each class's prefix, so
    `max-w-text-measure-prose` cannot give a false hit on `\btext-`.
  - ADD: the className test now also replaces the width cap (`max-w-none` over `max-w-content`).
  - ADD: an `InContext` prose-article story.
  - DROP: the 20px gutter (C8), the old token names (D4) and `defaultVariants` (plan tier rule).
  - PENDING: `as="ul"` (delta 1).
- **Stack.**
  - ADD: a "never spaces with margins" test.
  - ADD: `Steps` (0.5 · 2 · 6 · 12), `Align` and `DividedList` (`as="ul"`) stories.
  - DROP: `as="dl"` (it appears only in a dev doc comment). The contracts §4 union has no `dl`, and an
    injected rule element is not valid `<dl>` content.
- **Cluster.**
  - Dev automatically set `role="region"` on a labelled rail. The ruling is ALREADY, not ADD: on `as="ul"`
    that role overrides the list role and breaks axe `listitem`. That is a latent dev bug, because dev's axe
    test only rendered a non-scrolling row.
  - ADD: a test that a scrolling `ul` stays a named list with every item, is a tab stop, has no region role
    and passes axe.
  - ADD tests: no margins on a wrapping row (the rail's `-m-1` is its deliberate ring-room offset), className
    replaces the gap, and axe on the default `ul` row.
  - ADD stories: `Justify`, `Spacing` and `BaselineMetaRow`.
  - The Step 3 JSDoc now says to use `role="group"` on a `div` only, never on a `ul`.
- **AutoGrid.**
  - ADD: a "paints nothing" test and a className-replaces-gap test.
  - ADD: a `Mins` story (all six steps, labelled) and a `Spacing` story. The stories now import
    `type AutoGridMin`.
  - DROP: the arbitrary `grid-cols-[…]` classes (token-only rule).
- **Section.**
  - DROP: "background only through className" and its test, which asserted no colour classes. Spec §9.4
    `tone`, §8.1 and D5 contradict it: Section paints its own field.
  - DROP: the 56px rhythm (C8), and the dev note that only large text may sit on brand (spec §5.1 declares
    white on brand as the 3:1 exception).
  - ADD: a className-replaces-rhythm and native-props test.
  - ADD: a `Widths` story (`size` and `isBare`) and an `InContext` story (brand band, then prose).
- **AppShell.**
  - DROP: the 375 and 430 artboards (contracts §4 `size`). PENDING: `fluid` (delta 2).
  - ADD: a className test that replaces the radius and shadow.
  - ADD: an axe test on the most complex state (`statusTone="light"`, a tab bar and an open dialog).
  - ADD: a `Sizes` story.
  - ADD: `DemoTabBar` now takes a `label` (R13 `?: string | undefined`). The plan's original `StatusTones`
    drew two `navigation "Primary"` landmarks, and axe's best-practice rule `landmark-unique` fails on that.
    Dev had already solved this.
- **PostFrame.**
  - ADD: a test that children render inside the true-pixel canvas.
  - ADD: a test that a consumer className merges onto the frame, the caller's `style` is kept, and the
    scaled width still wins.
  - ADD stories: `Wide`, `SafeAreaGuides` (off and on) and `Padding` (default · tight · none).
  - DROP: arbitrary `text-[22px]` and `max-w-[13ch]` in the board copy.

The six new className tests assume token classes merge with stock ones. I checked every pair against the
installed tailwind-merge, with the plan's scale lists: `max-w-content`→`max-w-none`, `gap-grid-gap`→`gap-12`,
`py-section`→`py-0`, `rounded-app-shell`→`rounded-lg`, `shadow-4`→`shadow-1` and `shrink-0`→`shrink` all
resolve as expected.

## Proposed contract deltas

1. **Container `as` gains `"ul" | "ol"`** (contracts §4):
   `as?: "div" | "main" | "section" | "article" | "header" | "footer" | "nav" | "ul" | "ol"`.
   - Why: dev tests `as="ul"`, documented as "a list that also needs the page gutter". The spec (§9.4 "`as`")
     does not contradict it. The change is additive.
   - If accepted, Task 2 adds the union members and this test:
     `render(<Container as="ul"><li>Small Plates</li></Container>); expect(screen.getByRole("list")).toHaveClass("px-gutter");`
   - If rejected, the row becomes DROP (contracts §4 union), and the workaround is `<Container><ul>…</ul></Container>`.
2. **AppShell `size` gains `"fluid"`** (contracts §4): `size?: "phone" | "phone-sm" | "fluid"`.
   - What it would be: `h-full w-full max-w-app-shell-w`, which fills its parent up to the phone width.
     Dev capped it at 430px; this would cap at the 390px token, so no new token is needed.
   - Why: dev offered it for "embedding a screen in a real viewport".
   - Recommendation: **low value, fine to reject.** Spec §10.1 shows the app kit at 390×844 and nothing
     consumes `fluid`. If rejected, the row becomes DROP (contracts §4 enum).

## Cross-plan notes

- **Plan 1 (lib specs).** Dev has two library-wide specs that belong with `lib/`, not with any layout:
  - `lib/token-classes.spec.ts` fails when a class names a token with no Tailwind namespace. Its reasoning:
    `toHaveClass` passes whether or not the class emits CSS.
  - `lib/component-props.spec.ts` enforces the prop-name vocabulary and the boolean prefix. Its allow-list
    predates the contracts: it permits `on` (contradicts D5) and lacks `format` and `statusTone`. It would
    need updating before a port.

  Layouts lean on class-only assertions, such as `py-section-tight`, `autogrid-min-*` and `h-story-safe-top`.
  Only the Chromium `play` functions prove those classes emit CSS.
- **Plan 4 (final task: swap the stand-ins).** The real `TabBar` has `label = "Primary"` (contracts §4
  organisms). When it replaces `DemoTabBar` in `StatusTones` and `Sizes`, each frame must get its own
  `label`, or `landmark-unique` returns.
- **Storybook foundations (spec §10.1 Spacing and Layout pages).** Dev's `packages/ui/src/docs/space-shape-motion.mdx`
  covers the spacing scale and layout rhythm. It belongs to whichever plan owns those foundation pages, not
  to this one.

## Concerns

1. **`autogrid-min-*` is not a tailwind-merge class group.** Today's `component-variants.ts` registers only
   `autogrid` and `autogrid-wide`. So a consumer's `className="autogrid-min-lg"`, or a base-level
   `grid-cols-2`, will not replace `autogrid-min-md`. Both classes set `grid-template-columns`, and CSS order
   decides. Dev avoided this by accident: its auto-fit tracks were arbitrary `grid-cols-[…]` classes in the
   same group as `grid-cols-N`. A suggested fix for Task 5:
   `autogrid: ["autogrid", "autogrid-wide", { "autogrid-min": ["xs","sm","md","lg","xl","2xl"] }]`, plus a
   `conflictingClassGroups` entry against `grid-cols`. I left the plan unchanged because this goes beyond dev
   parity.
2. **R13 and R15 exist only as controller amendments.** Contracts §4 and the plan's existing code blocks still
   write `?: T` and `new URL(…, import.meta.url)`. The implementer must apply both. The code I added follows
   R13 and reads no files.
