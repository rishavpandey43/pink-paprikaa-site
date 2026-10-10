# Plan 2c, batch A report (Tasks 0, 1, 2)

Base `9970d1c`. Commits: `5e58bf7` (Task 1), `c581ffe` (Task 2). Task 0 changed no tracked file
and made no commit.

## Task 0: reconcile (R43)

**Built:** `task-0-fold-list.md`. It records the Step 1–5b checks with their output, facts F1–F7
(surfaces, shadow `@utility` guard, surface aliases, contrast, R61/R63 markers, the `max-w-prose`
ban, and which Plan 5 deferrals 2c unblocks), 11 overlay items and the pre-flight table. The plan
file is not patched.

Check results:
- Step 1: all 41 tokens present, with the spec values. `spacing-text-measure-prose` = 64ch exists.
  None of the plan's new token names exists yet.
- Step 2: the library core matches its declared interfaces. One piece of body text is stale: the
  `ResizeObserver` stub uses a `typeof` guard, not `??=`. The effect is the same.
- Step 3: the atom props match. The PatternField transparent-layer probe **PASSED** (1 test) and
  was deleted.
- Step 4: nothing exists yet. I also ran a class probe of every stock and token class the plan
  uses. No `no-custom-classname` error came back; the probe was deleted.
- Step 5: the baseline gate is green (tokens 234, ui 610, storybook 403).
- Step 5b: 8 dev-parity tables. Task 2's table was spot-checked against dev.

Items later tasks must apply (summary; the fold list is binding):
1. R13 `| undefined` on every props interface (Tasks 2–8).
2. R15 `join(import.meta.dirname, …)` in place of `new URL(…)` (Tasks 2, 5, 8).
3. Barrel order: one layouts block, sorted by path, between the atoms and the lib exports.
4. R61 markers:
   - Task 5: `grid-min-*` get `[]`.
   - Task 7: `app-shell-{w,sm-w,home-bar-w}` get `["w"]`; `app-shell-{h,sm-h,home,home-bar-h}` get `["h"]`; `status-x` gets none.
   - Task 8: `story-safe-{top,bottom}` get `["h"]`; `canvas-pad(-tight)` gets none.
   - Tasks 2 and 6: none.
5. Task 5: register `autogrid-min-*` as a tailwind-merge group, with `grid-cols` conflicts.
6. Contract deltas 1 and 2 have no ruling, so the contract unions are built as written (PENDING).
7. Plan-doc re-sorts (Tasks 5–8).
8. The commit trailer.
9. Task 0 body text is stale.
10. Found in Task 2: commit subjects must be lower-case.
11. Found in Task 2: `ElementType` + spread `ref` typechecks for this shape.

Plan 5 unblocks (F7):
- The `SpaceStep` compile-time check is unblocked by Task 1 (`SpaceStep` is exported). The brief's
  `StackProps["space"]` spelling needs Task 3.
- The `Rhythm` specimen needs Task 6 (Section) and Task 5 (AutoGrid).
- Plan 5 T7's `AutoGridCards` needs Task 5.

**Deviations:** none from the brief. No product code changed.

## Task 1: `lib/space.ts`

**Built:** `packages/ui/src/lib/space.ts` (`SpaceStep`, `GAP_CLASS`), `space.spec.ts`, and the barrel
line (placed last in the lib block, fold item 3). I also verified that tailwind-variants resolves
numeric keys, `0.5` included: `tv({variants:{space:{0.5:"gap-0.5"}}})({space:0.5})` → `gap-0.5`.

**TDD:** the spec failed first with `Failed to resolve import "./space"`, then passed (22 tests).

**Deviations:** none.

**Dev parity:**

| Dev item | Ruling | Where / clause |
| -------- | ------ | -------------- |
| Per-layout `GAP` maps (Stack 0–16, Cluster 0–12, AutoGrid 0/2–12) and `StackSpace`/`ClusterSpace`/`AutoGridSpace` | ALREADY | One shared `GAP_CLASS` / `SpaceStep` (contracts §1), a superset of every dev map |
| Half-step classes `gap-0-5`, `gap-1-5` | DROP | D4 (old token names); Tailwind 4's native `gap-0.5` / `gap-1.5` |
| Literal class strings so Tailwind scans them | ALREADY | Step 3 doc comment + the `it.each(STEPS)` spec |

Checked against `git show dev:packages/ui/src/templates/stack/stack.tsx`: dev's `GAP` is 0, 0.5, 1,
1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, all contained in `SpaceStep`. Nothing was missed.

**Gate:**
```
design-tokens: Test Files 4 passed (4) · Tests 234 passed (234)
ui:            Test Files 40 passed (40) · Tests 632 passed (632)
NX Successfully ran targets typecheck, lint, test for 2 projects
storybook:build OK
storybook:test: Test Files 37 passed (37) · Tests 403 passed (403)
format:check exit 0
```

**Commit:** `5e58bf7 feat(ui): spacing steps shared by the layout primitives`

## Task 2: Container

**Built:**
- `packages/ui/src/layouts/container/{container.tsx,container.test.tsx,container.stories.tsx}`.
- The barrel line, placed at the start of the new layouts block before `./lib/reveal-observer`.
- The first `layouts/` folder, which activates `index.spec.ts`'s layouts tier. It is green.

**TDD:** the test failed first with `Failed to resolve import "./container"`, and `index.spec`'s
layouts rows failed too. After the implementation it passed (18 tests). `index.spec`'s file-trio
row stayed red until the stories existed.

**Deviations:**
1. R13 (fold item 1): `size`, `isBleed` and `as` are `?: T | undefined`.
2. R15 (fold item 2): the test reads `tokens.json` through
   `join(import.meta.dirname, "../../../../design-tokens/dist/tokens.json")`.
3. Commit subject: the brief's `feat(ui): Container layout` was rejected by commitlint
   (`subject-case`). I committed it as `feat(ui): add the Container layout` and routed the fix to
   Tasks 3–8 as fold item 10.
4. No markers were needed (fold item 4). `storybook:test`'s catalogue spec is green with Container
   in the scan.

**Dev parity:**

| Dev item | Ruling | Where / clause |
| -------- | ------ | -------------- |
| Sizes `default`/`wide`/`prose`/`full` | ALREADY | `content`/`wide`/`prose`/`full` + `narrow`/`article` (spec §9.4) |
| `isFullBleed` drops the gutter | ALREADY | `isBleed` (spec §8.2) |
| Gutter `clamp(20px, 4vw, 40px)`, `--layout-*` / `--measure-prose` names | DROP | C8 (handoff 16px gutter); D4 (old token names) |
| `defaultVariants` | DROP | Plan tier rule: defaults live in the destructured props |
| `as` any element; test "renders the element the caller asks for" with `as="ul"` | PENDING | Contracts §4 union has no `ul`/`ol` — delta 1 in `02c-audit.md`; no ruling in `progress.md`, so not implemented (fold item 6) |
| Native attributes forwarded (`id`) | ALREADY | "passes native props through" test |
| Test: emits no colour, border or type classes | ADD | "paints nothing" (per size) |
| Test: caller className replaces the width cap as well as the gutter | ADD | className test (`max-w-none`) |
| Test: axe | ALREADY | last test |
| Stories `Default`, `Sizes`, `Bleed` | ALREADY | `Playground`, `Sizes` (all `isBleed`), `Gutter` |
| Story `InContext` (prose article on alt) | ADD | `InContext` |
| Dev `max-w-full` for `full` | DROP (implicit) | `max-w-none` (no cap; the brief's value). Not in the plan's table, so I added it here |

Checked against `git show dev:packages/ui/src/templates/container/container.{tsx,test.tsx}`.

**Gate:**
```
design-tokens: Test Files 4 passed (4) · Tests 234 passed (234)
ui:            Test Files 41 passed (41) · Tests 653 passed (653)
NX Successfully ran targets typecheck, lint, test for 2 projects
storybook:build OK
storybook:test: ✓ layouts/container/container.stories.tsx (6 tests) — AtTheFloor (16px) and
                AtDesktop (40px) plays green · Test Files 38 passed (38) · Tests 409 passed (409)
format:check exit 0
```

**Commit:** `c581ffe feat(ui): add the Container layout`

## Carried fixes

None were in this batch. Under R69, 2b's final fix wave rides batch B.

## Notes for the controller

- Contract deltas 1 (Container `ul`/`ol`) and 2 (AppShell `fluid`) need a ruling. Until then the
  rows stay PENDING.
- The SDD records are not archived to `docs/superpowers/records/sdd/` in this batch. The
  controller owns the rsync.
