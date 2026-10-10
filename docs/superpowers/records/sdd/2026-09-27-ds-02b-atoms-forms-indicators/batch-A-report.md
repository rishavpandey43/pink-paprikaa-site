# Batch A report: Plan 2b Task 0 (reconcile) and Task 1 (shared form status + register() double)

Base `dcd18d8`. Branch `feat/design-system`. One commit:

- `613fd7f feat(ui): add the shared form status and a register() test double`

Status: **DONE_WITH_CONCERNS**. The concerns are listed at the end. None of them blocks later tasks.

---

## Task 0: reconcile (R43: the fold list is an overlay, and the plan file is untouched)

The full results, with the numbered BINDING OVERLAY (10 items) and the pre-flight table, are in
`.superpowers/sdd/2026-09-27-ds-02b-atoms-forms-indicators/task-0-fold-list.md`. In summary:

| Step | Result |
| ---- | ------ |
| 1. Exports | Everything the plan consumes is present, with two exceptions that differ from the brief: there is no `SYMBOL_DATA_URI_WHITE` (R25), and `SymbolMark` is a `mask-symbol` span, not inline SVG (R19). Both are superseded by R19/R25. |
| 2. Tokens | `all consumed tokens present`, and `radius-diamond` exists. `white-alpha-28` is absent, which is correct because Task 10 adds it. `shadow-focus-ring` is overridden on the brand, ink and light surfaces, and it had no `@utility`. |
| 3. Shared files | on-inverse is not paired with brand, so Task 14's contrast step stays. No token names collide. The counts are 13 dev-parity tables, 2 `Dev reference: none` and 13 copy lines. |
| 4. Probe | The brief's classes and 14 extra ones from later tasks all exist: no `no-custom-classname` error. The errors that did fire were only the probe's own intentional contradictions. The probe was removed and the tree is clean. |
| 5. Baseline | Green: design-tokens 190 tests, ui 386 tests, typecheck and lint pass, Storybook build completed. |

Overlay items, each with the task it affects:
1. Stale `svg` queries become `.mask-symbol`, and the unused `ARTWORK` imports are dropped (Tasks 2, 8, 11, 12).
2. `radius.brand-diamond` is removed. Task 11 uses `rounded-diamond` and appends nothing to `RADIUS`.
3. R21, 16px field text: `text-body` at every size. `control.json` moves from Task 2 to Task 4 (Tasks 2, 4).
4. A read-only Select renders a hidden input and gets a test (Task 3).
5. The shadow `@utility` guard: **Task 1** implements it.
6. R41 over `src/lib/**`: **Task 1** implements it.
7. `"tooltip"` must be appended to the `Z` class group, or `component-variants.spec` fails (Task 15).
8. Barrel exports are inserted in path order in the atoms block (Tasks 1 to 16).
9. The commit trailer placeholder is replaced with the real trailer (all tasks).
10. Task 0's own stale text needs no action.

Task 0 changed no tracked file (the fold list lives in the git-ignored SDD workspace), so it made **no commit**, per the brief.

**Pre-flight:** 13 pair rows and 17 self-consistency rows are in the fold list. There are 4 CONFLICTs: T2↔T4 `control.json`, 2a SymbolMark → the T2/8/11/12 tests, T15 `Z` list, and T3 hidden input. Each has its resolution in the overlay. A script cross-checked every class that a task's tests assert against the classes its code writes. The only misses were caller `className` inputs and lucide glyph classes.

---

## Task 1: what was built

- `packages/ui/src/lib/field-status.ts`: `FieldStatus` and `FIELD_STATUS_ICON`, verbatim from the brief.
- `packages/ui/src/lib/field-status.spec.ts`: verbatim.
- `packages/ui/vitest.setup.ts`: `fakeRegister(name)`, returning `{ name, onChange, onBlur, ref }` as `vi.fn()`.
- `packages/ui/src/index.ts`: `export type { FieldStatus } from "./lib/field-status";`, placed in the lib block before `./lib/heading` (overlay item 8).
- **Fold item 5, the shadow guard:**
  - `packages/ui/src/styles.css`: adds `@utility shadow-focus-ring { --tw-shadow: var(--shadow-focus-ring); }` after `shadow-button-primary`, and generalises the comment above them.
  - `packages/ui/src/styles.spec.ts`: a new `surface-overridden shadows` suite reads `design-tokens/dist/tokens.json` via `join(import.meta.dirname, …)`. For every shadow token that has a surface entry, it asserts that the matching `@utility shadow-<name>` block is present. It runs today for `button-primary` and `focus-ring`.
- **Fold item 6, R41 over lib:**
  - `tools/eslint-config/atomic-layering.js`: a new `**/src/lib/**/*` block with `barrelPattern` and `selfPackagePattern` only. Lib is not a tier, so `../atoms/icon/icon` stays allowed.
  - `atomic-layering.test.mjs`: two new tests. From `src/lib/probe.js`, 8 barrel spellings must each error, and 6 allowed imports must pass.

### Deviations

1. **`fakeRegister` has an explicit return type.** The brief's version relied on inference and failed `ui:typecheck` with `TS2883: The inferred type of 'fakeRegister' cannot be named without a reference to 'Procedure' from '@vitest/spy'`. The fix annotates the return as `{ name: string; onChange: Mock; onBlur: Mock; ref: Mock }`, with `type Mock` imported from `vitest` (checked in `node_modules`: `fn<T = Procedure>(): Mock<T>`, and `Mock` is re-exported by vitest).
2. **Scope grew by fold items 5 and 6.** Beyond the brief's file list, the commit touches `styles.css`, `styles.spec.ts` and `tools/eslint-config/atomic-layering{.js,.test.mjs}`. The commit body says so.
3. **No Prettier re-sorts.** `prettier --write` reported every file unchanged.

### Dev-parity check

There is no dev counterpart: `lib/field-status.ts` and `fakeRegister` are new internals, and the plan gives Task 1 no dev-parity table.
The contract glyphs follow deviation 5 of the plan's contract deviations (`TriangleAlert`, the non-deprecated lucide 1.30 name).

### Evidence

**RED, before implementation.** `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache`:
```
× shadow-focus-ring reads its variable at the element
FAIL src/lib/field-status.spec.ts            (Cannot find module './field-status')
Test Files  2 failed | 22 passed (24)
Tests  1 failed | 387 passed (388)
```
`shadow-button-primary` passed, which confirms the guard matches the existing utility. `pnpm nx test @pink-paprikaa-web/eslint-config --skip-nx-cache`:
`AssertionError [ERR_ASSERTION]: lib importing ".."`.

**Compiled utility check.** Tailwind 4.3.3 `compile().build(["focus-within:shadow-focus-ring"])`, run against `packages/ui/tailwind.css`:
```
.focus-within\:shadow-focus-ring:focus-within {
    --tw-shadow: 0 0 0 3px var(--tw-shadow-color, #FFB9CE);
    box-shadow: …, var(--tw-shadow);
    --tw-shadow: var(--shadow-focus-ring);
  }
```
The `@utility` merges into the variant rule, and its later declaration wins.

**GREEN gate, first run.** It failed on the TS2883 above, which led to deviation 1. After the fix:
```
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
GATE_EXIT=0
 NX   Successfully ran target build for project @pink-paprikaa-web/design-tokens
 Test Files  4 passed (4)      Tests  190 passed (190)     # design-tokens
 Test Files  24 passed (24)    Tests  389 passed (389)     # ui (+3: field-status, 2 shadow guards)
 NX   Successfully ran targets typecheck, lint, test for 2 projects and 2 tasks they depend on
└  Storybook build completed successfully
 NX   Successfully ran target build for project @pink-paprikaa-web/storybook and 2 tasks it depends on

pnpm nx test @pink-paprikaa-web/eslint-config --skip-nx-cache
ℹ tests 8   ℹ pass 8   ℹ fail 0

pnpm nx format:check   → exit 0
```
The commit hooks (lint-staged and commitlint) passed. The tree is clean after the commit.

### Commits

- Task 0: none. It changed no tracked files.
- Task 1: `613fd7f feat(ui): add the shared form status and a register() test double` (8 files, +128 −5).

---

## Concerns (for the controller)

1. **The read-only Select ruling and RHF.** react-hook-form v7 leaves a registered field out of `handleSubmit` data when its ref is `disabled`. The hidden input fixes native form posts, but not RHF's own data, contrary to the ruling's "(react-hook-form reads it)". Overlay item 4 implements the ruling as written. A real RHF fix would mean registering the hidden input, or using `aria-readonly` with a non-disabled select. That is the controller's call.
2. **The class probe in Task 0's brief cannot come out error-free.** It puts contradicting pairs (`size-3/4` with `size-6/7`, and so on) on one element, so `no-contradicting-classname` always fires. The meaningful check is "no `no-custom-classname`", and that passed.
3. **R21 changes the field's visuals.** Field sm drops from 14px to 16px, and md/lg go from 15px to 16px. Task 17's parity review should list this as an intentional deviation from `Input.card.html`.
