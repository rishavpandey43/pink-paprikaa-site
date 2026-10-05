# Task 2 Report — shared prop types (`lib/common-props.ts`)

**Status:** Complete  
**Branch:** `feat/design-system`  
**Commits:** `06a0125..fb7e784` — `feat(ui): add the shared surface, color and size prop types`  
**Baseline (Task 1):** ui 1683 tests @ `06a0125`

## Deliverables

| File | Action |
|------|--------|
| `packages/ui/src/lib/common-props.ts` | Created — `SurfaceProp`, `ColorProp`, `SizeProp`, `SxProp`, `BaseProps`, `BasePropsWithColor`, `SURFACE_DATA`, `SURFACE_BG` |
| `packages/ui/src/lib/common-props.spec.ts` | Created — 2 unit tests |
| `packages/ui/src/layouts/section/section.tsx` | Modified — local surface maps replaced with shared imports; prop name `tone` unchanged |
| `packages/ui/src/index.ts` | Modified — export `SurfaceProp`, `ColorProp`, `SizeProp`, `SxProp`, `Sx`, `Responsive` |

## TDD Evidence

### RED — `common-props`

Command: `pnpm nx test ui -- common-props`

```
Error: Failed to resolve import "./common-props" from "src/lib/common-props.spec.ts". Does the file exist?
Test Files  1 failed (1)
Tests  no tests
```

### GREEN — `common-props`

Command: `pnpm nx test ui -- common-props`

```
✓ src/lib/common-props.spec.ts (2 tests) 2ms
Tests  2 passed (2)
```

### GREEN — Section regression

Command: `pnpm nx test ui -- section`

```
✓ section-header.test.tsx (12 tests)
✓ faq-section.test.tsx (10 tests)
✓ section.test.tsx (23 tests)
Tests  45 passed (45)
```

Full ui suite: **1685 passed** (+2 vs Task 1).

Storybook: **not run** (n/a).

## Self-review

- Maps match prior Section literals byte-for-byte; behaviour unchanged.
- `SURFACE_BG` passed directly into `componentVariants` `tone` variant (same keys/classes).
- Public barrel exports types only (no runtime maps exported — internal to ui).
- Prettier reformatted `ColorProp` union to one line per eslint/prettier on commit.

## Concerns

- None. `SectionTone` remains a local alias; Task 5 will align naming with `SurfaceProp` / `surface`.

## Gates run

- `pnpm nx test ui -- common-props` — PASS  
- `pnpm nx test ui -- section` — PASS  
- `pnpm nx test ui` — PASS (1685)  
- Pre-commit: eslint --fix + prettier — PASS  
