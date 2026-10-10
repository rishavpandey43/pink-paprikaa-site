# Task 4 report: brand facts in `packages/content`

**Status:** DONE
**Commit:** `6dc94aa feat(content): validated brand facts from the design system's brand.js`

## Implementation

The brief's code went in verbatim: I extracted each block from the brief with awk, so none of it was retyped.

- `packages/content/src/brand/brand-schema.ts`: the Zod schema. It covers the two-`a` name literal, the entity literal, CIN/GSTIN/FSSAI/PAN/+91-phone regexes, `z.url()`/`z.email()`, `pending` (a nullable non-empty string), `socialNetworkSchema` (instagram/youtube/linkedin), the billing `.refine` (gstSplit must add up to gstRate), and the policies enum. Exports `brandSchema`, `socialNetworkSchema`, `Brand` and `SocialNetwork`.
- `packages/content/src/brand/brand-data.ts`: `rawBrand as const`, taken from `zip-files/Pink Paprikaa Design System/brand.js` with these changes:
  - `est: 2019` became `established: 2025`
  - the outlet address became "Booth No. 67P, HSVP Market (MKM Market), Sector 57, Gurgaon 122003"
  - the registered address is kept verbatim
  - `social` changed from a keyed map to an array of `{network, handle, url}`
  - outlet `maps` became `mapsUrl`
  - every `TODO` (outlet hours, maps, bankName, accountNumber, ifsc, and `upi: "TODO@upi"`) became `null`
- `packages/content/src/brand/brand.ts`: `brand: Brand = brandSchema.parse(rawBrand)`.
- `packages/content/src/brand/brand-lines.ts`: `toBrandLines(brand, year)` produces the copyright, fssai, gstin, cin, cities and contactShort lines plus `footerPolicies`. It throws `RangeError` when the year is not a whole number.
- `packages/content/src/index.ts`: replaced with the brief's barrel.
- Deleted the placeholder files `src/lib/content.ts` and `src/lib/content.spec.ts`. Nothing imported them; I checked with grep across apps, packages and tools.
- `packages/content/package.json`: `zod: ^4.4.3`, added with `pnpm add zod --filter @pink-paprikaa-web/content`.

### Test rewrites under ruling R4 (lint-driven; asserted behaviour unchanged)

- In `brand.spec.ts`, "rejects an unknown social network" used `(d.social as …)[0]!.network = "facebook"`, which `@typescript-eslint/no-non-null-assertion` rejected. It now uses a guarded destructure: `const [first] = …; if (!first) throw new Error(...)`, then `first.network = "facebook"`. A missing fixture now fails loudly instead of passing silently, and the `success === false` assertion is unchanged.
- `perfectionist/sort-imports` required reordering the imports in both specs (`./brand-data.js`, then `./brand-schema.js`, then `./brand.js`; `./brand-lines.js` before `./brand.js`). Only the order changed.
- Lint accepted the brief's `as unknown as Record<string, unknown>` casts, so I kept them.

## TDD evidence

**RED** (specs written, no implementation):

```
 FAIL  |@pink-paprikaa-web/content| src/brand/brand-lines.spec.ts
Error: Cannot find module './brand.js' imported from .../packages/content/src/brand/brand-lines.spec.ts
 FAIL  |@pink-paprikaa-web/content| src/brand/brand.spec.ts
Error: Cannot find module './brand.js' imported from .../packages/content/src/brand/brand.spec.ts
 Test Files  2 failed | 1 passed (3)
```

**GREEN** (implementation in place, placeholder deleted):

```
 ✓ |@pink-paprikaa-web/content| src/brand/brand.spec.ts (9 tests) 4ms
 ✓ |@pink-paprikaa-web/content| src/brand/brand-lines.spec.ts (5 tests) 2ms
 Test Files  2 passed (2)
      Tests  14 passed (14)
```

## Zod version and API checks

- The resolved version is **4.4.3** (`node -p "require('./packages/content/node_modules/zod/package.json').version"`).
- I probed the installed package directly from `packages/content`:
  - `typeof z.url` and `typeof z.email` are both `function`, so the v4 top-level string formats exist.
  - `z.url()`: accepts `https://pinkpaprikaa.com` and rejects `pinkpaprikaa.com`. `z.url().nullable()` accepts `null`.
  - `z.email()`: accepts `business@pinkpaprikaa.com` and rejects `nope`.
  - `z.literal("Pink Paprikaa")` rejects "Pink Paprika".
  - `.refine` on an object rejects with the given message, and still works when nested inside another `z.object`.
  - `z.number().int()` rejects 2025.5.
- I did not need to adapt anything.

## Gate

`pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/content --skip-nx-cache --outputStyle=static`:

```
 Test Files  2 passed (2)
      Tests  14 passed (14)
> nx run @pink-paprikaa-web/content:typecheck
> tsc --build tsconfig.json --emitDeclarationOnly
> nx run @pink-paprikaa-web/content:lint
> eslint .
 NX   Successfully ran targets typecheck, lint, test for project @pink-paprikaa-web/content
  Run duration:      2.1s
  Cache:             Skipped (--skip-nx-cache)
```

Lint reported no warnings at all, so the code already passes `naming-convention`.

Other checks:

- `prettier --check packages/content pnpm-lock.yaml`: all files formatted.
- `node scripts/check-founder-names.mjs packages/content`: "Founder-name guard: clean."
- `nx format:check` flags only the other agents' untracked `docs/superpowers/plans/*` files, which I did not touch.
- The commit went through husky and commitlint; I did not use `--no-verify`.

## Files changed

- `packages/content/package.json` (M)
- `packages/content/src/index.ts` (M)
- `packages/content/src/brand/brand-schema.ts` (A)
- `packages/content/src/brand/brand-data.ts` (A)
- `packages/content/src/brand/brand.ts` (A)
- `packages/content/src/brand/brand-lines.ts` (A)
- `packages/content/src/brand/brand.spec.ts` (A)
- `packages/content/src/brand/brand-lines.spec.ts` (A)
- `packages/content/src/lib/content.ts` (D)
- `packages/content/src/lib/content.spec.ts` (D)
- `pnpm-lock.yaml` (M)

## Self-review

- I checked every value in the data against brand.js, applying the brief's corrections. There are no TODO strings, and the founder regex does not match anywhere in the facts, which a test also asserts.
- Every rejection test changes a single field of a copy of `rawBrand`, and the unmodified `rawBrand` parses cleanly. So each rejection is caused by the field under test and not by some other invalid field.
- `toBrandLines` takes the year as an argument instead of reading `new Date()`, so its output is deterministic. The original brand.js called `new Date()` directly.
- All relative imports use `.js` (`nodenext`). Every export is named, functions are declarations, there is no `enum` and no raw hex.
- `packages/ui` does not import `content`.
- I staged only `packages/content` and `pnpm-lock.yaml`.

## Concerns

1. **Lockfile drift.** `pnpm add` also re-resolved a transitive dependency, `third-party-web` 0.29.2 → 0.30.0, which is pulled in by the lighthouse tooling. It is pnpm's own resolution within the existing range and I did not hand-edit anything. It is in the commit because the brief says to `git add pnpm-lock.yaml`.
2. **Devanagari name, for the owner to check.** `nameDevanagari: "पैप्रिका"` is copied verbatim from the design system. It reads as "paiprika", which has no trailing long ā, so it may not match the two-`a` "Paprikaa". This is a content decision for the owner; the code does not change either way.

---

# Fix round 1 (controller ruling R11)

**Status:** DONE
**Commit:** `eaae700 test(content): reject malformed CIN, PAN, entity and non-http links`

## Changes

### F1: invalid fixtures for CIN, PAN and the entity

Three `withChange` rejection tests were added to `packages/content/src/brand/brand.spec.ts`. Each is named for its rule:

| Test | Fixture | Covers |
| --- | --- | --- |
| `rejects a CIN that is not 21 characters of the right shape` | `U56101HR2025PTC13346` (last digit removed) | `legal.cin` regex (`brand-schema.ts:25`) |
| `rejects a PAN that is not 10 characters of the right shape` | `AAPCP9130` (9 characters) | `legal.pan` regex (`:28`) |
| `rejects the legal entity with one 'a'` | `Paprika Culinary Ventures Private Limited` | `legal.entity` literal (`:24`) |

### F2: links are http or https only

- In `brand-schema.ts`, `contact.websiteUrl`, `social[].url` and `outlets[].mapsUrl` changed from `z.url()` to `z.httpUrl()`. `mapsUrl` stays `.nullable()`.
- The pre-commit prettier step wrapped the now-longer `social` line across three lines. Only the formatting changed.
- Added the requested test, `rejects a social link that is not http or https`, which sets `social[0].url = "javascript:alert(1)"`. It uses a guarded destructure, the same R4 pattern as the existing social test.
- **Beyond the literal instruction:** I also added `rejects a website URL that is not http or https` and `rejects a maps URL that is not http or https`, both with `javascript:alert(1)`. Without them, reverting `websiteUrl` or `mapsUrl` alone to `z.url()` would have left every test green. That is the gap §7.3 forbids, and these are the fields F2 changes.

### Checking `z.httpUrl()` in the installed Zod 4.4.3

- `node_modules/zod/v4/classic/schemas.d.ts:198` declares `export declare function httpUrl(params?: string | Omit<core.$ZodURLParams, "protocol" | "hostname">): ZodURL;`.
- I probed it at runtime from `packages/content`:

```
httpUrl function
https://pinkpaprikaa.com true
http://x.com true
https://instagram.com/pinkpaprikaa true
javascript:alert(1) false
ftp://x.com false
mailto:a@b.c false
url accepts js: true        <- z.url() does accept javascript:, confirming the finding
nullable null true
```

## TDD and bite probes

**RED:** the new link test failed against `z.url()` before the schema change:

```
     × rejects a link that is not http or https 3ms
AssertionError: expected true to be false // Object.is equality
      Tests  1 failed | 17 passed (18)
```

**GREEN:** after `z.url()` became `z.httpUrl()`: `Tests  18 passed (18)`.

**Bite probes.** For each probe I copied `brand-schema.ts` to a backup, loosened one rule with `sed`, ran `pnpm nx test @pink-paprikaa-web/content --skip-nx-cache`, and restored from the backup. Each probe failed exactly its covering test and nothing else:

| Rule loosened | Failing test | Result |
| --- | --- | --- |
| `cin: z.string().regex(CIN)` → `z.string()` | rejects a CIN that is not 21 characters of the right shape | 1 failed, 17 passed |
| `pan: z.string().regex(PAN)` → `z.string()` | rejects a PAN that is not 10 characters of the right shape | 1 failed, 17 passed |
| `entity: z.literal(...)` → `text` | rejects the legal entity with one 'a' | 1 failed, 17 passed |
| social `url: z.httpUrl()` → `z.url()` | rejects a social link that is not http or https | 1 failed, 19 passed |
| `websiteUrl: z.httpUrl()` → `z.url()` | rejects a website URL that is not http or https | 1 failed, 19 passed |
| `mapsUrl: z.httpUrl().nullable()` → `z.url().nullable()` | rejects a maps URL that is not http or https | 1 failed, 19 passed |

After restoring, the schema's diff against HEAD was exactly the three `httpUrl` lines, and all 20 tests passed.

## Gate

I ran `pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/content --skip-nx-cache --outputStyle=static` before the commit, and again on the committed tree after the hook's prettier reflow:

```
 ✓ |@pink-paprikaa-web/content| src/brand/brand.spec.ts (15 tests) 5ms
 ✓ |@pink-paprikaa-web/content| src/brand/brand-lines.spec.ts (5 tests) 3ms
 Test Files  2 passed (2)
      Tests  20 passed (20)
> nx run @pink-paprikaa-web/content:typecheck
> tsc --build tsconfig.json --emitDeclarationOnly
> nx run @pink-paprikaa-web/content:lint
> eslint .
 NX   Successfully ran targets typecheck, lint, test for project @pink-paprikaa-web/content
```

Lint reported no warnings.

Other checks:

- `prettier --check packages/content`: clean.
- `node scripts/check-founder-names.mjs packages/content`: clean.
- The commit went through husky and commitlint; I did not use `--no-verify`.
- I staged only `packages/content`, and the commit touches only `brand-schema.ts` and `brand.spec.ts`.

## Remaining gap (reported, not fixed)

Under a strict reading of §7.3, some rule-bearing fields still have no invalid fixture:

- `established` (int, at least 2025)
- `contact.whatsapp` (the +91 regex)
- the four `z.email()` fields
- `billing.currency` and `billing.currencySymbol` (literals)
- the `billing.gstRate` bounds
- the `policies` enum
- the `.min(1)` on arrays
- `text` (min 1)

I kept to the scope of F1. If the controller wants full §7.3 coverage, each needs one more `withChange` test.

The Devanagari concern from the first report is withdrawn, per the coordinator's check.
