# Batch G report — carried G1–G5, Task 12 SiteHeader

Base `5e30040`, branch `feat/design-system`, HEAD `e1934a3`. Implementer: Claude Opus 5.5.
Status: **DONE**

## Status log (resume from the first unchecked box)

- [x] Read contract, global constraints, progress rulings, fold list, carried-fixes-G, brief 12 (== plan Task 12 at 5e30040, diffed byte-for-byte), AUTHORING, CLAUDE.md, batch-F report
- [x] G1 probe filter fixed + re-run against storybook-static (log overwritten; W only, no commit)
- [x] G2 accordion AsHeadings play compares fixture strings — 204bd92
- [x] G3+G4 site-footer label once + unique-key JSDoc — f14491a; G5 skip empty columns (RED seen) — 2813484
- [x] G3–G5 plan sync (Task 8) — aaece50
- [x] T12 SiteHeader: tokens + contrast pair, RED, leaves, organism, stories (+ring play, +1024 play), export, gates, commit — 397affd
- [x] T12 plan re-sort bf14f33 / plan sync e1934a3
- [x] Final: format:check, sync:check, storybook:test, guard:founder, report complete

## Commits

| SHA | Subject |
| --- | --- |
| 204bd92 | test(ui): check the accordion's question headings against the fixture (G2) |
| f14491a | refactor(ui): build each footer social label once and document unique keys (G3, G4) |
| 2813484 | fix(ui): skip a footer column that has no items (G5) |
| aaece50 | docs: bring plan 4's site footer code in line with carried fixes g3-g5 |
| 397affd | feat(ui): add the SiteHeader organism (T12) |
| bf14f33 | docs: re-sort the site header classes in plan 4 |
| e1934a3 | docs: bring plan 4's site header code in line with the build |

## Carried fixes

### G1 — probe dead counter (W only)
`batch-E-e1-probe.mjs` now filters `/^DisclosureTriangle/` (Chromium 151 says
`DisclosureTriangleGrouped`). Re-run was cheap: `storybook-static` (built 19:44 at 5e30040) served
by `python3 -m http.server`, probe copied into `apps/storybook/` so `playwright` resolves, run, copy
deleted. `batch-E-e1-probe.log` overwritten; every story now reads e.g.
`DisclosureTriangle (summary) nodes: 6; with a heading child: 6` (Accordion AsHeadings 3/3, FaqSection
Default 6/6, HeadingLevel3 6/6), headings level 3/3/4 as before.

### G2 — accordion AsHeadings (204bd92)
The play now maps each summary's level-3 heading to its text and `toEqual`s
`FAQ.map(({ question }) => question)`. Proof it is no longer circular: with the story's items
temporarily reversed, the play failed (`expected [ 'Can I book a table?', …(2) ] to deeply equal …`),
where the old summary-vs-heading check would have passed. Reverted → 5/5 accordion stories pass.
Not in plan 4 (a 3a molecule story), so no plan sync.

### G3 + G4 — SiteFooter (f14491a)
`const label = \`${link.label} (Opens in a new tab)\`` once per social link, passed to IconButton and
the anchor. JSDoc on `columns` / `social` / `policies`: unique by `heading` / `network` / `href` (they
key the elements). Keys unchanged (no index keys).

### G5 — empty column (2813484)
New test "skips a column with no items, heading and all". RED: `expected document not to contain
element, found <h2 …>Coming soon</h2>`. Fix: `if (column.items.length === 0) return null;` + JSDoc
"A column with no items is skipped." → 15/15.

Plan sync aaece50: Task 8 component and test blocks == build (script-compared), "PASS (14 tests)" → 15.

## Task 12 — SiteHeader (397affd)

Built from the plan (brief identical to plan at base). Tokens `site-header-logo`,
`site-header-logo-compact` (`["w"]` markers, fold 13), text `site-header-link`; registered in
`SPACING` / `TEXT`; contrast group `site-header-glass` (design-tokens 284 → 288). Bar and drawer are
`"use client"` leaves; organism is server. Barrel block after SiteFooter (path order). RED:
`Failed to resolve import "./site-header"`. Then 16/16.

Deviations from the plan (all overlay-driven; plan synced in e1934a3):
1. **Fold 18 `isShown`** on `badge`, `actions`, `compactActions`, `drawerActions` (and `hasDrawer`
   uses `isShown(drawerActions)` instead of `!== undefined`). `logo` is wrapped by the home link, so
   it also gates: a blank `logo` falls back to the default lockup (R79) rather than an empty link.
   New test "renders no wrapper for an empty badge or action slot, and no drawer with nothing in it"
   (16 tests, plan said 15).
2. **Fold 20 ring play** — new story `DrawerOpen` (360px, handoff drawer): tabs round the trapped
   focus (close + 8 links + 2 actions = 11 stops), asserts each stop is inside the dialog and
   `ringClippers(active)` is `[]`, and the stop count. Reuses `lib/story-ring.ts`. Mutation: drawer
   body `px-0 pb-0` → `DrawerOpen` fails; restored → passes. Uses `OPEN_DRAWER_A11Y`
   (`aria-hidden-focus` + `color-contrast` off — same reason as Dialog's `OPEN_DIALOG_A11Y`; a story's
   rules replace the preview's).
3. **Entrance animation** — `DrawerKeyboard`'s `toBeVisible()` waits for the sheet's animations
   (`openDrawer` helper), the flake batch F hit on Dialog.
4. **`LongLinksAtLg` play** (Review Focus 2 in real CSS): nav visible at 1024, computed `display` of
   the six items is `list-item ×3, none ×3`, `nav.scrollWidth <= clientWidth`, menu button visible.
   The `toBeVisible(nav)` guard makes it fail at any width below lg (where the nav is hidden and the
   rest would pass vacuously).
5. Commit body gained one sentence about the above.

No new-tab links exist in the header or its stories (R44/R111 not triggered). R82: the drawer has a
trigger, so Radix returns focus to the menu button (tested on Escape). Stories are `fullscreen`,
so batch F's centred-canvas frame collapse does not apply.

Dev parity (brief table, extended):

| Dev item | Ruling | Where / clause |
| --- | --- | --- |
| The `banner` landmark with the lockup | ALREADY | tests "is the banner landmark…", "links the logo home…" |
| Rail links in a named `nav` | ALREADY | test "links the logo home and lists the nav links…" |
| A custom `navLabel` keeps two mastheads on one page distinct | ADD | test "names its navigation from navLabel…" |
| Fixed 72px height | DROP | C1 — 88 default / 64 compact (tested) |
| `onOrder` / `onBook` / `onSearch` / `onCart` and the built-in buttons | DROP | spec §8.1 — slots (`actions`, `compactActions`, `drawerActions`) |
| Cart count in the button's name, printed on the glyph, hidden at 0 | ALREADY | IconButton `count` in the actions slot (`ScrolledWithCart`, `CartCounts`) |
| Glass and hairline once scrolled | ALREADY | test "turns the bar to glass…"; `ScrolledWithCart` play |
| `isScrolled` as a prop | DROP | client leaf; server snapshot keeps SSR identical |
| The sheet opens, lists every link, closes from its close button | ADD | test "opens the drawer from the keyboard…" |
| The rail behind the open sheet leaves the accessibility tree | ADD | same test (one "Catering" link) |
| Following a sheet link closes it | ALREADY | test "the drawer traps focus…" |
| Opens from the keyboard | ADD | same new test (`Enter`) |
| Merges a caller `className` | ADD | test "merges a caller className over its own" |
| axe | ALREADY | test "has no accessibility violations, closed or with the drawer open" |
| Sheet description "Every page on the Pink Paprikaa site." | DROP | D9 |
| Search moves into the sheet below md; "Book a Table" gives way first | DROP | spec §8.1 |
| Default links | DROP | D9 |
| Stories Default · Scrolled · WithCart · ShortRail · Smallest · InContext | ALREADY | Rest · ScrolledWithCart · ScrolledWithCart · HandoffCompact · Mobile · decorator `<main>` |
| Story CartCounts (0 / 1 / 12, each masthead self-named) | ADD | `CartCounts` |
| (plan missed) an empty slot renders no wrapper; an empty drawer no menu | ADD | fold 18 test |
| (plan missed) the drawer's focus rings inside its scrolling sheet | ADD | `DrawerOpen` ring play (fold 20) |
| (plan missed) the 1024px nav really hides links 4+ and never overflows | ADD | `LongLinksAtLg` play |

## Gates (after 397affd; later commits are docs only)

`pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build` → exit 0:

```
 Test Files  4 passed (4)
      Tests  288 passed (288)
…
 ✓ |@pink-paprikaa-web/ui| src/lib/heading.spec.ts (6 tests) 2ms

 Test Files  104 passed (104)
      Tests  1554 passed (1554)
   Start at  20:02:47
   Duration  26.56s
> nx run @pink-paprikaa-web/ui:lint
> eslint .
 NX   Successfully ran targets typecheck, lint, test for 2 projects and 2 tasks they depend on
…
 NX   Successfully ran target build for project @pink-paprikaa-web/storybook and 2 tasks it depends on
```

`pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache` → exit 0, first run (no cold-cache failure):

```
 ✓ |storybook (chromium)| ../../packages/ui/src/molecules/announcement-bar/announcement-bar.stories.tsx (4 tests) 86ms
 ✓ |storybook (chromium)| ../../packages/ui/src/atoms/diet-mark/diet-mark.stories.tsx (3 tests) 75ms
 ✓ |storybook (chromium)| src/docs-kit/canvas.stories.tsx (3 tests) 61ms

 Test Files  97 passed (97)
      Tests  922 passed (922)
 NX   Successfully ran target test for project @pink-paprikaa-web/storybook and 1 task it depends on
```

(909 → 922: 11 SiteHeader stories + 2 — consistent with the docs-kit catalogue spec counting one row
per spacing-namespace token, two added; not traced further.)

`pnpm nx format:check` → first run after 397affd listed only the plan doc (re-sort → bf14f33); after
e1934a3: exit 0, no files listed. `pnpm nx sync:check` → `[@nx/js:typescript-sync]: All files are up
to date.` `pnpm guard:founder` → `Founder-name guard: clean.`

Counts: ui 1537 → 1554 (+1 G5, +16 SiteHeader); storybook 909 → 922; design-tokens 284 → 288.

## Concerns

None blocking.
1. Two new plays beyond the plan (`DrawerOpen`, `LongLinksAtLg`) and one extra unit test (fold 18) —
   reviewer judges; all synced into the plan.
2. `logo` now gates on `isShown` (blank → default lockup) instead of `??` — a small behavioural
   choice under fold 18 / R79.
3. Stash list unchanged at 2 (pre-existing lint-staged backups); none dropped. The reviewer ran in
   the same tree; no lock errors hit.
