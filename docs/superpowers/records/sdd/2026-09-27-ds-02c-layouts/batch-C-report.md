# Plan 2c, batch C report (Task 5 AutoGrid, Task 6 Section, plan-5 Spacing Rhythm)

Base `01308e6`, head `fd787a4`. Four commits. Status: **DONE**.

| Commit | What |
| --- | --- |
| `d445180` | feat(ui): add the AutoGrid layout |
| `f473585` | docs: re-sort autogrid-min classes in the 3b and 4 plans' code blocks |
| `c563719` | feat(ui): add the Section layout |
| `fd787a4` | feat(storybook): add the Spacing Rhythm specimen |

## Task 5: AutoGrid

**Built:**
- `packages/design-tokens/tokens/component/auto-grid.json`.
- `packages/ui/src/layouts/auto-grid/{auto-grid.tsx,auto-grid.test.tsx,auto-grid.stories.tsx}`.
- The `@utility autogrid-min-*` rule in `styles.css`, placed after `autogrid-wide`.
- The six `grid-min-*` names in `SPACING`.
- The barrel line, first in the layouts block (sorted by path).

**TDD:** the test failed first with `Failed to resolve import "./auto-grid"`, along with index.spec's three layouts rows. The `component-variants` spec was already green with the six new names and the two new merge rows. After the implementation, the test passed (19 tests).

**Deviations (all from the fold list unless marked):**
1. R13 (item 1): `min`, `columns`, `space` and `as` are declared `?: T | undefined`.
2. R15 (item 2): both file reads use `join(import.meta.dirname, …)`.
3. R61 (item 4): every `grid-min-*` token carries `"$extensions": { "pink-paprikaa": { "utility": [] } }`, and each `$description` ends with "A grid template reads it, so it has no class of its own."
4. Item 5, the tailwind-merge registration:
   - The `autogrid` class group is now `["autogrid", "autogrid-wide", { "autogrid-min": AUTOGRID_MIN }]`. `AUTOGRID_MIN` is a named const, like `PATTERN_TILE`.
   - `twMergeConfig.extend` gains `conflictingClassGroups: { autogrid: ["grid-cols"], "grid-cols": ["autogrid"] }`.
   - I checked this against the installed tailwind-merge 3.6.0: the group id is `'grid-cols'` in `dist/bundle-mjs.mjs`, and `conflictingClassGroups` is in `types.d.ts`.
   - The spec gains the rows `autogrid-min-md → autogrid-min-lg` and `autogrid-min-md → grid-cols-2`, and both are green.
5. TS2322 fired (item 11 says to cast only if it does). Typecheck reported it at `auto-grid.tsx:55` on the `ol` member, so I used `const Element = as as "div";` with the same comment as Stack and Cluster.
6. Commit subject lower-cased (item 10).
7. **Not in the fold list: plan-doc re-sorts in other plans.** Item 7 predicted re-sorts in the 2c plan, but `format:check` instead failed on `2026-09-27-ds-03b-molecules-domain.md` (1 line) and `2026-09-27-ds-04-organisms.md` (2 lines). Their code blocks use `autogrid-min-*`, which the Prettier Tailwind plugin now recognises and re-sorts. I ran `prettier --write` on both and committed them alone as `f473585`. The 2c plan itself needed no re-sort.

**Dev parity** (the brief's table, checked against `git show dev:packages/ui/src/templates/auto-grid/*`):

| Dev item | Ruling | Where / clause |
| --- | --- | --- |
| Default card floor 260px + fluid grid gap | ALREADY | `min="md"`, `gap-grid-gap` |
| `size` narrow 180 / card 260 / panel 320 | ALREADY | `min` xs–2xl token steps (spec §8.2, §9.4); 180 snaps to `sm` 200 |
| Arbitrary `grid-cols-[repeat(auto-fit,minmax(min(Npx,100%),1fr))]` | DROP | Token-only class rule (AUTHORING §6); the `autogrid-min-*` utility keeps the same track |
| Never a bare `1fr` track | ALREADY | Stylesheet assertion + `LongWordHoldsTracks` |
| `columns` 1–4, overriding auto-fit | ALREADY | `columns` 1–6 (`grid-cols-N`) |
| `space` overrides the gap token | ALREADY | "takes a spacing step" test |
| Test: keeps every child | ALREADY | `as="ul"` test |
| Test: emits no colour, border or type classes | ADD | "paints nothing" |
| Test: caller className replaces the gap token | ADD | className test |
| Test: axe on a `ul` | ALREADY | last test |
| Story `Default`, `FixedColumns`, `Narrow` | ALREADY | `Playground`, `Columns3`, `ColumnsAt360` / `NarrowerThanMinAt360` |
| Story `Floors` (every floor, labelled) | ADD | `Mins` (all six steps) |
| Story `Spacing` (2 · 6 · 12) | ADD | `Spacing` |
| Dev `space` map 0/2–12 (`AutoGridSpace`) | ALREADY (implicit) | Superset `SpaceStep` via `GAP_CLASS`. Not in the brief's table |
| Dev `defaultVariants: { size: "card" }` | DROP (implicit) | Plan tier rule: the default is `min = "md"` in the destructured props. Not in the brief's table |
| Dev `as?: ElementType` | DROP (implicit) | Contracts §4 union `div \| ul \| ol \| section`. Not in the brief's table |

**Gate** (`gate-t5`):
```
design-tokens: Test Files 4 passed (4) · Tests 249 passed (249)
ui:            ✓ auto-grid.test.tsx (19 tests) · Test Files 44 passed (44) · Tests 723 passed (723)
NX Successfully ran targets typecheck, lint, test for 2 projects
storybook:build OK
storybook:test: ✓ layouts/auto-grid/auto-grid.stories.tsx (11 tests) — LongWordHoldsTracks and
                NarrowerThanMinAt360 plays green · Test Files 42 passed (42) · Tests 447 passed (447)
format:check: FAILED on the 3b and 4 plan docs only (deviation 7) → re-sorted in f473585 →
              "All files formatted correctly"
```

## Task 6: Section

**Built:**
- `packages/design-tokens/tokens/component/section.json`.
- `packages/ui/src/layouts/section/{section.tsx,section.test.tsx,section.stories.tsx}`.
- `section-tight` and `section-loose` in `SPACING`.
- The barrel line, placed after `container` and before `stack` in the layouts block.

`SectionTone` is a module export only, as the brief's Produces line says; it is not in the barrel.

**TDD:** the test failed first with `Failed to resolve import "./section"`, along with index.spec's three layouts rows. After the implementation, it passed (23 tests).

**Deviations:**
1. R13: `tone`, `pattern`, `size`, `space`, `isBare` and `as` are declared `?: T | undefined`.
2. TS2322 fired here too, at `section.tsx:80`: the spread `section` (HTMLElement) ref does not fit the `div` member. I used `const Element = as as "section";` with a comment. I cast to `"section"` rather than `"div"` because the props extend `ComponentProps<"section">`.
3. No R61 marker (item 4): `py-section-tight|loose` are padding, and `catalogue.spec` is green.
4. Commit subject lower-cased. There was no plan-doc re-sort (`format:check` was green).

**Dev parity** (the brief's table, checked against `git show dev:packages/ui/src/templates/section/*`):

| Dev item | Ruling | Where / clause |
| --- | --- | --- |
| `<section>` with the default rhythm, content in a Container | ALREADY | first test |
| `padding` none/tight/default/loose (arbitrary `py-[clamp(…)]`) | ALREADY | `space` + `section-{tight,loose}` tokens (contracts §4; token-only rule) |
| Rhythm `clamp(56px, 7vw, 96px)` | DROP | C8 (handoff `clamp(48px, 8vw, 96px)`) |
| `size` passed to the Container | ALREADY | "passes size" test |
| `bare` skips the Container | ALREADY | `isBare` (spec §8.2) |
| `as` (footer → `contentinfo`) | ALREADY | `as="aside"` test; union per contracts §4 |
| Background only through `className`; test "emits no colour, border or type classes" | DROP | Spec §9.4 `tone` + §8.1: Section paints its field and sets `data-surface` (D5) |
| Test: caller className replaces the rhythm; native props pass through | ADD | className test |
| Test: axe with a heading | ALREADY | last test |
| Story `Default`, `Rhythm`, `Grounds` | ALREADY | `Playground`, `Rhythm`, `Tones` |
| Story `Widths` (`size` prose/wide, `bare`) | ADD | `Widths` |
| Story `InContext` (brand band, then a prose band) | ADD | `InContext` |
| Only large text on the brand band (the 4.04:1 note) | DROP | Spec §5.1: white on brand is the declared 3:1 exception, owned by the token policy |
| Dev base `w-full` | DROP (implicit) | A block-level `section` already fills its row, and the brief has no base class. Not in the brief's table |
| Dev `defaultVariants: { padding: "default" }` | DROP (implicit) | Plan tier rule: defaults live in destructured props. Not in the brief's table |

**Gate** (`gate-t6`):
```
design-tokens: Test Files 4 passed (4) · Tests 249 passed (249)
ui:            ✓ section.test.tsx (23 tests) · Test Files 45 passed (45) · Tests 746 passed (746)
NX Successfully ran targets typecheck, lint, test for 2 projects
storybook:build OK
storybook:test: ✓ layouts/section/section.stories.tsx (8 tests) — NestedSurfaces play green ·
                Test Files 43 passed (43) · Tests 457 passed (457)
format:check → GATE-GREEN
```

## Plan 5 deferral: the Spacing `Rhythm` specimen (F7; plan-5 fold item 3, Task 6)

**Built:** the `Rhythm` story in `apps/storybook/src/foundations/spacing/spacing.stories.tsx`, verbatim from the plan-5 Task 6 brief: a `Section tone="alt" space="tight"` holding an `AutoGrid min="xs"` of four Cards. I also:
- replaced the `import type { StackProps }` line with the brief's `import { AutoGrid, Card, Section, type StackProps }`;
- removed the `// Deferred (fold list item 3): Rhythm …` comment;
- added the `<Canvas of={Specimens.Rhythm}>` block to `layout-rhythm.mdx`, ahead of `RhythmTokens`, where the brief places it.

**Layout-rhythm rows:** `Rhythm` was the only deferral waiting on Section or AutoGrid. The `SPACE_STEPS` type check came back in batch B (`4054ce4`). Plan 5 Task 7, the Layout group with `AutoGridCards`, is a whole task that R55 defers, and this dispatch did not ask for it, so I did not build it.

**Gate:**
```
storybook typecheck + lint: Successfully ran targets typecheck, lint
storybook:build OK
storybook:test: ✓ src/foundations/spacing/spacing.stories.tsx (9 tests; 8 before) ·
                Test Files 43 passed (43) · Tests 458 passed (458)
format:check → GATE-GREEN
```

## Notes for the controller

- Plan 5 Task 7 (the Layout group, `AutoGridCards`) is now unblocked, because AutoGrid exists.
- The other plans' docs also hold code blocks with the new utilities, so later token work can re-sort them again, as it did here in 3b and 4. Deviation 7 covers this batch's case.
- I did not archive the SDD records to `docs/superpowers/records/sdd/`; that rsync is the controller's.
