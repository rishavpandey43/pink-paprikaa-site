# Task 1 Report — `sx` token-typed style prop

**Status:** Complete  
**Branch:** `feat/design-system`  
**Commit:** `661b9cd` — `feat(ui): add the token-typed sx prop helper`  
**Baseline (Task 0):** ui 1653 tests @ `98952f8` (per brief)

## Deliverables

| File | Action |
|------|--------|
| `packages/ui/src/lib/sx.ts` | Created — `Sx`, `Responsive`, `SxBreakpoint`, `sxClass`, `withSx`, `SX_SAFELIST` |
| `packages/ui/src/lib/sx.spec.ts` | Created — 30 unit tests |
| `packages/ui/src/lib/sx.stories.tsx` | Created — `Foundations/Sx/Proof`, computed-style play |
| `packages/ui/src/styles.css` | Modified — five `@source inline` safelist lines after `@source not …` |

Components are **not** wired to `sx` yet (later tasks).

## TDD Evidence

### RED — `sx.spec`

Command: `pnpm nx test ui -- sx.spec`

```
Error: Failed to resolve import "./sx" from "src/lib/sx.spec.ts". Does the file exist?
Test Files  1 failed (1)
Tests  no tests
```

### GREEN — `sx.spec` + typecheck

Command: `pnpm nx test ui -- sx.spec`

```
✓ src/lib/sx.spec.ts (30 tests) 3ms
Tests  30 passed (30)
```

Command: `pnpm nx run ui:typecheck` — PASS (confirms four `@ts-expect-error` cases are real type errors).

Full ui suite: **1683 passed** (+30 vs Task 0 baseline).

### GREEN — Storybook computed-style proof

Command: `pnpm nx run storybook:test -- sx.stories`

```
✓ ../../packages/ui/src/lib/sx.stories.tsx (1 test)
Tests  1 passed (1)
```

Play assertions: `marginTop === "24px"` (mt-6), `display === "none"`, `columnGap === "12px"` (gap-x-3).

**Expected RED (not re-run in this session):** With the five `@source inline` lines commented out in `styles.css`, the same play fails with `expected '0px' to be '24px'` (per task brief Step 6).

Full storybook suite (no cache): **995 passed** (+1 vs pre-task).

## CSS budget (Storybook static, gzipped CSS)

| When | `gzip -c apps/storybook/storybook-static/assets/*.css \| wc -c` |
|------|------------------------------------------------------------------|
| Before safelist (HEAD build) | 25,483 |
| After safelist (`--skip-nx-cache` rebuild) | 34,277 |
| **Delta** | **8,794** (≤ 20,480 budget — no xl trim needed) |

## Self-review

- Matches spec §3 and task brief implementations (key order in `sxClass`, `withSx` ordering for tailwind-merge, light-only `bg`, `SpaceStep` margins/padding/gap).
- `SX_SAFELIST` strings match `styles.css` verbatim; spec enforces via `readFileSync` loop.
- Lint: fixed import sort (`perfectionist/sort-named-imports`), `String(v)` for template literal rule, safe static lookup without `!`.
- Pre-commit ran eslint --fix + prettier on staged files.
- No exports added to public barrel yet — intentional; wiring is later tasks.
- **Concern:** Nx marked `storybook:test` flaky once on cached run; `--skip-nx-cache` full run was green (995).

## Gates run

- `pnpm nx test ui -- sx.spec` — PASS  
- `pnpm nx run ui:typecheck` — PASS  
- `pnpm nx run ui:lint` — PASS  
- `pnpm nx test ui` — PASS (1683)  
- `pnpm nx run storybook:test -- sx.stories` — PASS  
- `pnpm nx run storybook:test --skip-nx-cache` — PASS (995)

## Review fix — SX_SAFELIST / Prettier (2026-10-04)

**Finding:** Prettier wrapped four of five `@source inline(...)` safelist directives across multiple lines in `styles.css`, so `sx.spec.ts` `toContain('@source inline("${line}");')` failed.

**Fix:** Restored all five entries as single lines matching `SX_SAFELIST` verbatim; added `/* prettier-ignore */` before each so format-on-save / lint-staged cannot re-wrap. Updated block comment to state five identical single-line entries.

**Covering tests**

Command: `pnpm nx test ui -- sx.spec`

```
✓ src/lib/sx.spec.ts (30 tests) 6ms
Tests  30 passed (30)
```

Command: `pnpm nx run ui:typecheck` — PASS

Command: `pnpm prettier --write packages/ui/src/styles.css` — no re-wrap (prettier-ignore holds).
