# Task 3 report — rupee/range/count formatting in `packages/utils`

**Status:** DONE
**Commit:** `9357823 feat(utils): format rupees, ranges and counts the brand way` (hooks ran, no `--no-verify`)

## Implementation

The brief's code, copied exactly. No R4 lint rewrites were needed: lint passed with zero warnings on the plan's code as written.

- `packages/utils/src/format-rupees.ts`: `formatRupees`, `formatRupeeRange`, `formatCount`. They share one `Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 })`. Constants are UPPER_SNAKE (`INDIAN_INTEGER`, `MINUS_SIGN`, `EN_DASH`). There is no boolean, so `naming-convention` has nothing to flag.
- `packages/utils/src/format-rupees.spec.ts`: the brief's tests, verbatim (15 cases).
- `packages/utils/src/index.ts`: replaced with `export { formatCount, formatRupeeRange, formatRupees } from "./format-rupees.js";`
- Deleted (`git rm`): `packages/utils/src/lib/utils.ts`, `packages/utils/src/lib/utils.spec.ts`. Before deleting, `git grep "@pink-paprikaa-web/utils"` confirmed nothing else imports the package.

## TDD evidence

### RED

Spec written, implementation not yet created:

`pnpm nx test @pink-paprikaa-web/utils --skip-nx-cache --outputStyle=static`

```
 ❯ |@pink-paprikaa-web/utils| src/format-rupees.spec.ts (0 test)
 ✓ |@pink-paprikaa-web/utils| src/lib/utils.spec.ts (1 test) 1ms
 FAIL  |@pink-paprikaa-web/utils| src/format-rupees.spec.ts [ src/format-rupees.spec.ts ]
Error: Cannot find module './format-rupees.js' imported from .../packages/utils/src/format-rupees.spec.ts
 Test Files  1 failed | 1 passed (2)
 NX   Running target test for project @pink-paprikaa-web/utils failed
```

This fails for the reason the brief expects.

### GREEN and gate

Run after the implementation and the `git rm`:

`pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/utils --skip-nx-cache --outputStyle=static`

```
> nx run @pink-paprikaa-web/utils:test
 ✓ |@pink-paprikaa-web/utils| src/format-rupees.spec.ts (15 tests) 3ms
 Test Files  1 passed (1)
      Tests  15 passed (15)
> nx run @pink-paprikaa-web/utils:typecheck
> tsc --build tsconfig.json --emitDeclarationOnly
> nx run @pink-paprikaa-web/utils:lint
> eslint .
 NX   Successfully ran targets typecheck, lint, test for project @pink-paprikaa-web/utils
  Run duration:      4.5s
  Cache:             Skipped (--skip-nx-cache)
```

Other checks:

- `node scripts/check-founder-names.mjs packages/utils/src` returned "Founder-name guard: clean."
- `pnpm prettier --check packages/utils/src` returned "All files formatted correctly".
- Workspace `nx format:check` flags only the two untracked `docs/superpowers/plans/*` files that other agents are writing. I did not touch them, and they are not in the commit.

## Files changed (commit 9357823)

- A `packages/utils/src/format-rupees.ts`
- A `packages/utils/src/format-rupees.spec.ts`
- M `packages/utils/src/index.ts`
- D `packages/utils/src/lib/utils.ts`
- D `packages/utils/src/lib/utils.spec.ts`

Only `packages/utils` was staged.

## Self-review against Review Focus 1 (money edge cases)

| Input | Output | How |
|---|---|---|
| `-500` | `−₹500` | U+2212 minus before `₹` |
| `99.4` | `₹99` | rounded |
| `1999.5` | `₹2,000` | rounded |
| `0` | `₹0` | |
| `-0.4` | `₹0` | `Math.round` gives `-0`; `-0 < 0` is false, and `Math.abs` clears the sign |
| `1_00_00_000` | `₹1,00,00,000` | en-IN grouping |
| `NaN` / `±Infinity` | `RangeError` | |

- **Range with a NaN end:** `to < from` is false, but `formatRupees` then throws `RangeError`, so it still fails loudly.
- **Brand rules:** no raw hex, named exports only, function declarations, `.js` relative imports (nodenext), kebab-case file names.

## Concerns (outside the brief; not changed, per "implement exactly the brief")

1. **`formatCount` on negative values.** Verified with `node` that `formatCount(-0.4)` returns `"-0"` and `formatCount(-5)` returns `"-5"` with an ASCII hyphen. `formatRupees` guards both cases; `formatCount` does not. This is harmless for review and item counts, which are never negative. If a negative count can ever happen, apply the same `Math.abs` and sign handling, or reject negatives.
2. **Half-rupee rounding is asymmetric.** `Math.round` rounds halves toward +∞, so `formatRupees(-1.5)` gives `−₹1` while `formatRupees(1.5)` gives `₹2`. This only matters if fractional discounts are ever passed in.
