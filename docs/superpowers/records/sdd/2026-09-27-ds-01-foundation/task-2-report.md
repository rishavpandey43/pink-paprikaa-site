# Task 2 report — token system and contrast policy gate

**Status:** DONE
**Commit:** `27bf514 feat(tokens): rebuild the token system from the design system folder`

## Implementation summary

- Deleted the 11 August `packages/design-tokens/tokens/*.json` files. Created the DTCG tiers
  `tokens/{primitive,semantic,surface}/*.json` and `tokens/component/.gitkeep`, using the brief's
  values verbatim.
- Replaced `sd.config.mjs` with three custom formats: `pp/tailwind-theme` (`dist/theme.css`),
  `pp/surfaces` (`dist/surfaces.css`) and `pp/catalogue` (`dist/tokens.json`).
- Added the TypeScript, lint and test scaffolding (`tsconfig{,.lib,.spec}.json`,
  `vitest.config.mts`, `eslint.config.mjs`). Added the `./surfaces.css` and `./contrast` exports and
  a `test` target with `dependsOn: ["build"]` in `package.json`.
- Added `src/contrast.ts` (`parseColor`, `composite`, `relativeLuminance`, `contrastRatio`, `Rgba`),
  `contrast-pairs.json` (9 groups), and the `contrast`, `policy` and `theme` spec suites.
- Rewrote `README.md` (109 lines).
- Output: 263 tokens (174 primitive, 44 semantic, 45 surface overrides: 13 each for brand, ink
  and light, 6 for soft). theme.css has 18 `initial` resets. surfaces.css has 4 blocks.

### Checks against the installed Style Dictionary (5.5.1)

- **DTCG `$type` inheritance works.** `lib/utils/typeDtcgDelegate.js` pushes a group's `$type`
  down to its leaves, and `usesDtcg` is auto-detected. The catalogue has no entry with
  `type: null`.
- **`token.original.$value` keeps the raw alias** (`{color.ink.800}`), so references come out as
  `var()`. `token.$description` also passes through.
- **Changed from the brief: `token.filePath` is relative.** It is the glob match
  (`tokens/primitive/color.json`, from `lib/utils/combineJSON.js`), with no leading separator. The
  brief's `TIER = /[\\/]tokens[\\/](…)[\\/]/` would therefore label every token `"unknown"` and
  fail the tier test. I changed it to `/(?:^|[\\/])tokens[\\/](primitive|semantic|component|surface)[\\/]/`
  and added a one-line comment saying why. The output contract is unchanged.
- Style Dictionary printed no collision or unknown-token warnings.

### Fixture placeholder

- `#FFFFFFCC` on `#1A1216` measures **11.92**. The first GREEN run gave 11.921788499647416 against
  the placeholder 12.34, and that was the only failure; the fixture now says `11.92`.
- Hand check: 80% white over ink-900 is about rgb(209, 208, 208), which is roughly 11.9:1.
- Every other fixture passed as written.

### Lint-driven rewrites (ruling R4; no assertion changed)

- **`contrast.ts`** (`@typescript-eslint/no-misused-spread`): the brief's
  `[...hex].map((d) => d + d).join("")` became `hex.replace(/./g, "$&$&")`. The regex guarantees
  the input is ASCII hex, so behaviour is identical, and the `#fff` fixture still passes.
- **`policy.spec.ts`** (`@typescript-eslint/no-unnecessary-type-parameters`): the generic
  `readJson<T>(…): T` became `readJson(…): unknown`, with the `as` cast moved to the two call sites.

### Contrast results (lowest ratio per group)

All groups passed on the first run, and no text token needed to move.

| Group          | Min | Lowest | Pair                                               |
| -------------- | --- | ------ | -------------------------------------------------- |
| light-text     | 4.5 | 4.70   | color-text-brand on color-surface-sunken           |
| status-on-soft | 4.5 | 4.60   | color-text-danger on color-status-danger-soft      |
| soft-surface   | 4.5 | 5.07   | color-text-muted on color-surface-brand-soft       |
| ink-surface    | 4.5 | 8.18   | color-text-brand on color-surface-inverse          |
| ink-card       | 4.5 | 7.06   | color-text-brand on color-surface-card (over ink)  |
| brand-surface  | 3   | 3.26   | color-text-subtle on color-surface-brand           |
| brand-card     | 3   | 3.02   | color-text-subtle on color-surface-card (over pink)|
| on-inverse     | 4.5 | 18.39  | color-text-on-inverse on color-surface-inverse     |
| on-brand-fill  | 3   | 4.04   | color-text-on-brand on color-surface-brand         |

## TDD evidence

**RED** (Step 3, after scaffolding and `contrast.spec.ts`, before `contrast.ts` existed):

```
$ pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache
 FAIL  |@pink-paprikaa-web/design-tokens| src/contrast.spec.ts [ src/contrast.spec.ts ]
Error: Cannot find module './contrast.js' imported from /Users/rishavpa/Professional/pink-paprikaa-site/packages/design-tokens/src/contrast.spec.ts
 Test Files  1 failed (1)
      Tests  no tests
```

**GREEN, contrast unit** (Step 4). The first run failed only on the placeholder:

```
     × '#FFFFFFCC' on '#1A1216' ≈ 12.34 1ms
AssertionError: expected 11.921788499647416 to be close to 12.34, received difference is 0.4182115003525837, but expected 0.05
      Tests  1 failed | 15 passed (16)
```

After setting the fixture to 11.92:

```
 Test Files  1 passed (1)
      Tests  16 passed (16)
```

**GREEN, all suites** (Step 8):

```
 ✓ |@pink-paprikaa-web/design-tokens| src/theme.spec.ts (31 tests)
 ✓ |@pink-paprikaa-web/design-tokens| src/policy.spec.ts (87 tests)
 ✓ |@pink-paprikaa-web/design-tokens| src/contrast.spec.ts (16 tests)
 Test Files  3 passed (3)
      Tests  134 passed (134)
```

## Probe (Step 9)

I set `color.text.muted` to `{color.ink.400}` and ran the test.

**Output 1 (FAIL):**

```
 ❯ |@pink-paprikaa-web/design-tokens| src/theme.spec.ts (31 tests | 1 failed) 11ms
     × restores, on a light island, every token another surface overrides — to its exact base value 3ms
 ❯ |@pink-paprikaa-web/design-tokens| src/policy.spec.ts (87 tests | 5 failed) 7ms
     × color-text-muted on color-surface-page meets the group minimum 1ms
     × color-text-muted on color-surface-page-alt meets the group minimum 0ms
     × color-text-muted on color-surface-sunken meets the group minimum 0ms
     × color-text-muted on color-surface-card meets the group minimum 0ms
     × color-text-muted on color-surface-brand-soft meets the group minimum 0ms
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 6 ⎯⎯⎯⎯⎯⎯⎯
AssertionError: color-text-muted on color-surface-page (light) = 2.21:1: expected 2.210968889245736 to be greater than or equal to 4.5
AssertionError: color-text-muted on color-surface-page-alt (light) = 2.07:1: expected 2.070775069264471 to be greater than or equal to 4.5
AssertionError: color-text-muted on color-surface-sunken (light) = 2.01:1: expected 2.0089704481639497 to be greater than or equal to 4.5
AssertionError: color-text-muted on color-surface-card (light) = 2.21:1: expected 2.210968889245736 to be greater than or equal to 4.5
AssertionError: color-text-muted on color-surface-brand-soft (soft) = 1.74:1: expected 1.7424378621234553 to be greater than or equal to 4.5
AssertionError: light color-text-muted equals base: expected '#6B5A62' to deeply equal '#B8ABB1'
 Test Files  2 failed | 1 passed (3)
      Tests  6 failed | 128 passed (134)
 NX   Running target test for project @pink-paprikaa-web/design-tokens and 1 task it depends on failed
```

The light-island check fired as well, because `surface/light.json` still restores ink-600. That is
the intended drift guard.

I reverted with `sed`. The file was untracked at that point, so the brief's `git checkout` had
nothing to restore. Then I reran.

**Output 2 (PASS):**

```
 ✓ |@pink-paprikaa-web/design-tokens| src/theme.spec.ts (31 tests) 9ms
 ✓ |@pink-paprikaa-web/design-tokens| src/policy.spec.ts (87 tests) 5ms
 ✓ |@pink-paprikaa-web/design-tokens| src/contrast.spec.ts (16 tests) 3ms
 Test Files  3 passed (3)
      Tests  134 passed (134)
 NX   Successfully ran target test for project @pink-paprikaa-web/design-tokens and 1 task it depends on
```

## Gate (Step 11, rerun on the committed tree)

```
$ pnpm nx run-many -t typecheck lint test build -p @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static 2>&1 | tail -12
> eslint .

 NX   Successfully ran targets typecheck, lint, test, build for project @pink-paprikaa-web/design-tokens

  Run duration:      2.4s
  Cache:             Skipped (--skip-nx-cache)
  Critical path:     2.3s (1 task)

$ pnpm nx format:check && pnpm nx sync:check
 NX   The workspace is up to date
[@nx/js:typescript-sync]: All files are up to date.
(exit 0)
```

Extra checks beyond the gate:

- `pnpm nx run-many -t typecheck -p @pink-paprikaa-web/ui` is green.
- `pnpm nx run-many -t build -p web blog storybook` is green: all three apps compile against the
  new `theme.css`. The only warning was Storybook's existing chunk-size warning.
- `pnpm guard:founder` reports clean.

## Files changed (46)

- **Deleted:** `packages/design-tokens/tokens/{breakpoint,canvas,color,elevation,motion,spacing,typography}.primitive.json`,
  `color.semantic.json`, `{button,card,field}.component.json`
- **Added:**
  - `packages/design-tokens/tokens/primitive/{breakpoint,canvas,color,elevation,motion,pattern,shape,space,typography,z-index}.json`
  - `tokens/semantic/{color,shadow}.json`
  - `tokens/surface/{brand,ink,light,soft}.json`
  - `tokens/component/.gitkeep`
  - `contrast-pairs.json`
  - `src/{contrast.ts,contrast.spec.ts,contrast.fixtures.json,policy.spec.ts,theme.spec.ts}`
  - `tsconfig.json`, `tsconfig.lib.json`, `tsconfig.spec.json`, `vitest.config.mts`,
    `eslint.config.mjs`
- **Modified:** `packages/design-tokens/{package.json,sd.config.mjs,README.md}`
- **Modified by `pnpm nx sync`:** root `tsconfig.json`, plus `apps/web/tsconfig.json`,
  `apps/blog/tsconfig.json` and `packages/ui/tsconfig.lib.json`. Each gained a project reference
  to design-tokens, which is now a TS project.

## Self-review

- The token JSON matches the brief byte-for-byte in values. Names match the Interfaces list:
  `--spacing: 4px`, no `--spacing-unit`, `--border-width-default/strong`, and `--canvas-*` from
  path join.
- Surface overrides never leak into theme.css: surface tokens are filtered by `path[0]`.
- The light island restores all 13 overridden names to identical resolved values, which the test
  enforces.
- The brand hex appears in exactly one token definition. It also appears in the README prose and
  in the JSON fixtures, which are allowed.
- `docs/superpowers/plans/` was not staged, formatted or touched. Prettier ran only on
  `packages/design-tokens` and the four tsconfig files.
- `apps/blog/next-env.d.ts`, which the blog build regenerated, was restored and not committed.
  The working tree is clean.

## Concerns

1. **Four sync-edited files are in the commit.** Besides root `tsconfig.json`, the commit includes
   `apps/web/tsconfig.json`, `apps/blog/tsconfig.json` and `packages/ui/tsconfig.lib.json`. This
   goes one step past the brief's `git add` line, but leaving them out would commit an
   out-of-sync workspace and fail `sync:check`.
2. **brand-card is 3.02:1 against a 3.0 floor**: subtle text (white at 85%) on a 10% white card
   over pink. Any change to `white-alpha.85` or the brand card fill will trip the gate. That is
   the gate doing its job, but there is almost no headroom.
3. **Tier regex adapted.** See the Style Dictionary checks above. Later briefs that copy the
   original regex would silently label every tier `unknown`.

---

## Fix round 1 (ruling R6): guard the single brand hex across every token source

**Commit:** `3bad3bb test(tokens): guard the single brand hex across every token source`

### What changed

- One file changed: `packages/design-tokens/src/theme.spec.ts`.
- Added a new `describe("token sources")` block with the test **"writes the brand hex exactly
  once across every token source file"**. The existing catalogue assertion is unchanged.
- How the test works:
  - It walks `tokens/` with `readdirSync(url, { encoding: "utf8", recursive: true })`. The
    `encoding` option selects the `string[]` overload; without it, typescript-eslint flagged
    `string | Buffer`.
  - It keeps the `*.json` files, sorts them, and counts case-insensitive occurrences of the brand
    hex in each raw file.
  - The hex is `brandPink`, read from `tokens/primitive/color.json`, so no hex literal appears in
    the `.ts` file.
  - It expects the list of holders to equal `["primitive/color.json ×1"]`. A failure therefore
    names every offending file and its count.
  - An 8-digit `#EE2C68xx` also counts, since the search is a substring match. That is
    deliberately stricter.

### Probe 1: literal `#ee2c68` in a surface file value

I set `surface/soft.json` → `color.border.default` to `"#ee2c68"`.

```
 FAIL  |@pink-paprikaa-web/design-tokens| src/theme.spec.ts > token sources > writes the brand hex exactly once across every token source file
AssertionError: files holding the brand hex #EE2C68: expected [ 'primitive/color.json ×1', …(1) ] to deeply equal [ 'primitive/color.json ×1' ]
- Expected
+ Received
  [
    "primitive/color.json ×1",
+   "surface/soft.json ×1",
  ]
 ❯ src/theme.spec.ts:131:65
 Test Files  1 failed | 2 passed (3)
      Tests  1 failed | 134 passed (135)
```

The old catalogue-only test did not fail here, because the entry's tier is `surface`. That
confirms the gap the reviewer found.

### Probe 2: hex inside a composite string

I set the `surface/light.json` focus ring to `"0 0 0 3px #EE2C68"`.

```
     × restores, on a light island, every token another surface overrides — to its exact base value
     × writes the brand hex exactly once across every token source file
+   "surface/light.json ×1",
      Tests  2 failed | 133 passed (135)
```

Both probes were reverted with `git checkout <file>`.

### Green after revert

```
$ pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache
 ✓ |@pink-paprikaa-web/design-tokens| src/theme.spec.ts (32 tests)
 ✓ |@pink-paprikaa-web/design-tokens| src/policy.spec.ts (87 tests)
 ✓ |@pink-paprikaa-web/design-tokens| src/contrast.spec.ts (16 tests)
 Test Files  3 passed (3)
      Tests  135 passed (135)
 NX   Successfully ran target test for project @pink-paprikaa-web/design-tokens and 1 task it depends on

$ pnpm nx lint @pink-paprikaa-web/design-tokens --skip-nx-cache
 NX   Successfully ran target lint for project @pink-paprikaa-web/design-tokens

$ pnpm nx typecheck @pink-paprikaa-web/design-tokens --skip-nx-cache
 NX   Successfully ran target typecheck for project @pink-paprikaa-web/design-tokens

$ pnpm nx format:check   # exit 0
```

After the commit, the working tree is clean. `git add` was scoped to `packages/design-tokens`.
