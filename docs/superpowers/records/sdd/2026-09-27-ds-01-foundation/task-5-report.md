# Task 5 report — library core (stylesheet, variant builder, test setup, reveal observer)

**Status:** DONE
**Commit:** `80166f4 feat(ui): library core — stylesheet, variant builder, reveal observer` (commit message exactly as the brief, ends with the Co-Authored-By line; husky + commitlint + lint-staged all passed, no `--no-verify`)

## Implementation

Everything follows the brief. The code blocks were extracted from the brief by line range, so they match it exactly, apart from the deviations listed below.

| Step | File | Result |
| --- | --- | --- |
| 1 | `packages/ui/package.json` | `pnpm add @pink-paprikaa-web/utils --workspace --filter @pink-paprikaa-web/ui` added `"@pink-paprikaa-web/utils": "workspace:*"` (lockfile +3). Added the `./styles.css` export and `"sideEffects": ["**/*.css"]`. Prettier expands the array onto separate lines, which is the canonical form for package.json. |
| 1b | `packages/ui/tsconfig.lib.json` | The new dependency put the workspace out of sync (the gate refused to run). `pnpm nx sync` added a single reference to `../utils/tsconfig.lib.json` and changed nothing else. |
| 2 | `packages/ui/src/styles.css` | Verbatim from the brief. Every `var(--…)` it references exists in `design-tokens/dist/theme.css` (checked by script, none missing). |
| 2 | `packages/ui/src/styles.spec.ts` | From the brief, with one path fix (deviation 1). |
| 3/5 | `packages/ui/src/lib/component-variants{,.spec}.ts` | Implementation verbatim; the spec has the same path fix (deviation 1). |
| 6 | `packages/ui/vitest.setup.ts` | Brief's content, with the DOM-shim block rewritten under R4 (deviation 2). |
| 6 | `packages/ui/vite.config.mts` | Removed `passWithNoTests` and its "Temporary" comment. |
| 7/8 | `packages/ui/src/lib/reveal-observer{.tsx,.test.tsx}`, `src/index.ts` | Verbatim. |

### Deviations (behaviour and assertions unchanged)

1. **Spec file paths: `import.meta.dirname` replaces `new URL("…", import.meta.url)`.** As the brief wrote it, `styles.spec.ts` failed with `ENOENT: scandir '/src/index.ts'`. Vite's asset plugin rewrites the literal pattern `new URL("<string>", import.meta.url)` into an asset URL when it transforms a jsdom test. I probed it:
   - `new URL(".", import.meta.url)` gave `http://localhost:3000/src/index.ts`
   - `new URL("../styles.css", import.meta.url)` gave `http://localhost:3000/styles.css`
   - `import.meta.dirname` gave `/Users/…/packages/ui/src`, which is correct.

   So `styles.spec.ts` now uses `const SRC = import.meta.dirname;`, and `component-variants.spec.ts` uses `join(import.meta.dirname, "../../../design-tokens/dist/tokens.json")` and `join(import.meta.dirname, "../styles.css")`. Each has a comment explaining why. All assertions are unchanged. **Plans 2–4 should avoid `new URL(literal, import.meta.url)` in ui tests.**

2. **`vitest.setup.ts` DOM shims (R4).** Lint raised 7 errors on the brief's version:
   - `no-empty-function` ×3 on the empty `InertObserver` methods
   - `no-unnecessary-condition` ×3 on `??=`
   - `unbound-method` on `window.matchMedia ??=`

   The rewrite:
   - The methods became arrow class fields returning `undefined`, the same style as the brief's `matchMedia` stub.
   - Each `x ??= y` became `if (typeof x === "undefined") x = y;`. This is the same guard `reveal-observer.tsx` uses, and it is closer to `??=` semantics than an `in` check.
   - The `as unknown as typeof ResizeObserver` cast was dropped because `no-unnecessary-type-assertion` flagged it: `InertObserver` is structurally a `ResizeObserver`. The IntersectionObserver cast stays because it is still needed.

   The shims behave the same: each is installed only where it is missing.

## TDD evidence

- **Variant spec, RED:** `FAIL src/lib/component-variants.spec.ts — Error: Failed to resolve import "./component-variants" from "src/lib/component-variants.spec.ts". Does the file exist?` (at that point `styles.spec.ts` passed with 1 test).
- **Variant spec, GREEN:** `✓ src/lib/component-variants.spec.ts (16 tests)`, with `Test Files 2 passed (2) · Tests 17 passed (17)`.
- **The config is load-bearing.** With the bare `tv` from tailwind-variants:
  - `text-h1 text-text-muted` comes out as `"text-text-muted"` (`text-h1` is silently dropped)
  - `px-4` with `className: "px-gutter"` comes out as `"px-4 px-gutter"` (no merge)

  With `componentVariants`, both produce the output the spec expects.
- **RevealObserver, RED:** `FAIL src/lib/reveal-observer.test.tsx — Error: Failed to resolve import "./reveal-observer" …` (the other 17 tests passed).
- **RevealObserver, GREEN:** `✓ src/lib/reveal-observer.test.tsx (4 tests)`, with `Test Files 3 passed (3) · Tests 21 passed (21)`.

## API verifications (against installed packages)

- **tailwindcss 4.3.3** (`node_modules/tailwindcss`):
  - `lib.js` has the `layer(…)` handling for `@import`, with the error "`layer(…)` in an `@import` should come before any other functions".
  - `lib.js` parses `@source`, and requires source paths to be quoted.
- **Fresh-consumer compile (empirical).** I ran `@tailwindcss/node` `compile('@import "tailwindcss"; @import "@pink-paprikaa-web/ui/styles.css";')` from `apps/storybook`:
  - `compiler.sources` resolved to `{ base: "…/packages/ui/src", pattern: "./" }`, so `@source "./"` is relative to the stylesheet.
  - The scanner picked up every file in `packages/ui/src`.
  - All 29 named classes were generated, none missing:
    - `container-page section-y autogrid autogrid-wide cluster scrim-bottom scrim-top`
    - `duration-{instant,fast,base,slow,page}`
    - `z-{raised,sticky,header,dock,overlay,toast}`
    - `press-scale lift`
    - `animate-{skeleton,mark-pulse,spin-pulse,dot-pulse,rotate,sheet-in,toast-pop}`
  - Example output: `.z-raised { z-index: var(--z-raised); }`, `.duration-fast { transition-duration: var(--duration-fast); }`, `.animate-skeleton { animation: var(--animate-skeleton); }`. So the non-static `@theme` block in an imported library stylesheet works (R7 as briefed).
- **Built Storybook CSS.** The `[data-surface=brand]` rules, the `[data-pp-reveal]` rules and `text-size-adjust` all sit inside `@layer base`, and `@keyframes pp-mark-pulse` sits at root. The `layer(base)` import therefore works as the comment claims.
- **tailwind-merge 3.6.0** (`packages/ui/node_modules/tailwind-merge/dist/types.d.ts:193`): `DefaultThemeGroupIds` includes all 12 keys used: `animate aspect blur breakpoint container ease font-weight font radius shadow spacing text`.
- **tailwind-variants 3.3.1:**
  - `createTV: (config: TVConfig) => TV` exists.
  - `TWMergeConfig` and `VariantProps` are exported from the root.
  - `TWMergeConfig.extend.theme` is `Record<string, ClassGroup>`.
  - 3.3.1 ships its own internal merger (`src/internal/merge/create-tailwind-merge.ts`, whose `mergeConfigs` handles `extend.theme`), and `tailwind-merge` is an *optional* peer. The spec confirms that `extend.theme` takes effect.

## Gate

`pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui --skip-nx-cache --outputStyle=static` exited 0:

```
> nx run @pink-paprikaa-web/ui:test
 ✓ |@pink-paprikaa-web/ui| src/styles.spec.ts (1 test) 3ms
 ✓ |@pink-paprikaa-web/ui| src/lib/component-variants.spec.ts (16 tests) 7ms
 ✓ |@pink-paprikaa-web/ui| src/lib/reveal-observer.test.tsx (4 tests) 15ms
 Test Files  3 passed (3)
      Tests  21 passed (21)
> nx run @pink-paprikaa-web/ui:lint
 NX   Successfully ran targets typecheck, lint, test for project @pink-paprikaa-web/ui and 3 tasks it depends on
  Run duration:      6.0s
  Cache:             Skipped (--skip-nx-cache)
```

Lint reported 0 errors and 0 warnings; there are no `naming-convention` warnings either.

`pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache` exited 0:

```
└  Storybook build completed successfully
 NX   Successfully ran target build for project @pink-paprikaa-web/storybook and 2 tasks it depends on
  Run duration:      6.0s
```

The only warning was Vite's standard "Some chunks are larger than 500 kB" notice for the Storybook bundle.

Other checks:
- `prettier --check` on all changed files: all formatted.
- `pnpm nx sync:check`: all files up to date.
- `pnpm guard:founder`: clean.

## Files changed (12)

- `packages/ui/package.json`
- `packages/ui/tsconfig.lib.json`
- `packages/ui/vite.config.mts`
- `packages/ui/vitest.setup.ts`
- `packages/ui/src/index.ts`
- `packages/ui/src/styles.css`
- `packages/ui/src/styles.spec.ts`
- `packages/ui/src/lib/component-variants.ts`
- `packages/ui/src/lib/component-variants.spec.ts`
- `packages/ui/src/lib/reveal-observer.tsx`
- `packages/ui/src/lib/reveal-observer.test.tsx`
- `pnpm-lock.yaml`

Nothing was staged outside `packages/ui` and `pnpm-lock.yaml`. `docs/superpowers/plans/` was not touched.

## Self-review

- **Reveal never hides content (review focus 5):**
  - Sections with `top < innerHeight` are never tagged, and neither are sections already scrolled past, which have a negative top.
  - Where `IntersectionObserver` is missing, the effect returns immediately and nothing is tagged.
  - In print, `[data-pp-reveal]` is forced to `opacity: 1; transform: none`.
  - Under reduced motion there is no transform, and the opacity transition collapses to 0.01ms.
  - Tests cover the above-the-fold, no-IntersectionObserver and unmount cases. The print and reduced-motion cases are CSS-only, and jsdom can't test them.
- **No mutation loop.** The `MutationObserver` watches `childList` only, so the attribute writes it makes cannot re-trigger it. The `:not([data-pp-seen])` selector means each element is handled once.
- **Client boundary.** `"use client"` is on the component file, so the barrel can be imported from server components.
- **Stylesheet colours.** The stylesheet holds no literal colour, and `styles.spec.ts` guards this for every `.css` file under `src/`.

## Concerns (minor, none blocking)

1. **Spec pattern for later plans.** Plans 2–4 that read files from ui tests must use `import.meta.dirname`, not `new URL("…", import.meta.url)`, because Vite rewrites the latter in jsdom tests (deviation 1).
2. **Test files feed the CSS scan.** `@source "./"` also scans `*.spec.ts` / `*.test.tsx`, so class strings that appear only in tests (for example `rounded-xl shadow-3`, `px-gutter`) get generated into consumers' CSS. The effect is negligible, and the Storybook entry already scans the same globs. A `@source not "./**/*.{spec,test}.{ts,tsx}";` line would stop it if it ever matters.
3. **Setup-file comment.** The brief's `vitest.setup.ts` comment dropped the earlier explanation of why `expectNoA11yViolations` is a helper rather than a custom matcher (Vitest's `Matchers<T = any>` would force an `any`). I followed the brief. Restore the paragraph if that history is wanted.
4. **`tailwind-merge` may be redundant.** tailwind-variants 3.3.1 no longer needs it (it is an optional peer, and the merger is bundled). `tailwind-merge` stays in `packages/ui` dependencies from Task 1. It is harmless, and I left it out of scope.

---

# Fix round 1 (ruling R20)

**Status:** DONE
**Commit:** `b8b1743 fix(ui): keep revealed content visible across remounts and merge every token class` (body lists F1–F3 and M4–M8, ends with the Co-Authored-By line; hooks passed)

## Changes

- **F1 — RevealObserver remount** (`src/lib/reveal-observer.tsx`).
  - The effect records every element it tags in a local `Set`.
  - Cleanup still disconnects both observers. It now also removes `data-pp-seen` from every tagged element, and removes `data-pp-reveal` from any tagged element that lacks `data-pp-revealed`.
  - The next setup therefore takes those elements over. This covers StrictMode's double invoke, Fast Refresh, a selector change and a remount.
  - An element that was already revealed keeps `data-pp-reveal[data-pp-revealed]` and stays visible.
- **F2 — border-width merge** (`src/lib/component-variants.ts`).
  - Added `extend.classGroups["border-w"] = [{ border: ["default", "strong"] }]`.
  - **Beyond the ruling, same bug:** I added the same values to all 10 side groups (`border-w-{x,y,s,e,bs,be,t,r,b,l}`). RED showed that `border-b-strong border-border-brand` became `border-border-brand`: `border-b-strong` was read as a side colour, and a later `border-*` colour clears the side colours. Tailwind resolves every side's width from `--border-width`.
  - The group ids are verified against the merger bundled in tailwind-variants 3.3.1, whose `scaleBorderWidth()` accepts numbers only and has no theme key.
- **F3 — reduced motion keeps the fade** (`src/styles.css`). The reduced-motion `[data-pp-reveal]` block now sets `transition-duration: var(--duration-slow) !important;`, with a comment explaining it. Both rules are `!important` and in `@layer base`, so specificity decides: `[data-pp-reveal]` at (0,1,0) beats the `*` reset at (0,0,0).
- **M4 — named utilities as merge groups.**
  - `z: [{ z: [raised…toast] }]`
  - `duration: [{ duration: [instant…page] }]`
  - `scrim: ["scrim-bottom", "scrim-top"]`
  - `autogrid: ["autogrid", "autogrid-wide"]`
- **M5 — print.** `transition: none` added to the print `[data-pp-reveal]` block.
- **M6 — selector lists.** The query is now `:is(${selector}):not([data-pp-seen])`.
- **M8 — scan exclusion.** Added `@source not "./**/*.{spec,test,stories}.{ts,tsx}";` after `@source "./";`.
  - Syntax verified in `node_modules/tailwindcss/dist/lib.js`: the `@source` parser strips a leading `not ` and sets `negated`.
  - Verified by compiling a fresh consumer entry: `compiler.sources` gives `[{pattern:"./",negated:false},{pattern:"./**/*.{spec,test,stories}.{ts,tsx}",negated:true}]`. The scanner now reads only `index.ts, reveal-observer.tsx, styles.css, component-variants.ts`; before this change it also read the 3 spec/test files.
  - Compiled output confirms the reduced-motion and print blocks come out exactly as written.

## Covering tests (RED then GREEN)

**`reveal-observer.test.tsx`** was rewritten around a per-instance `ControlledObserver`. Each instance keeps its own `observed` set and records its `options`, and `ControlledObserver.instances` shows a remount's fresh observer. The original 4 tests are unchanged in meaning. New tests:

| Test | RED before the fix |
| --- | --- |
| (a) `<StrictMode><RevealObserver /></StrictMode>`: asserts more than one observer was built, and the below-the-fold section is observed by the current one | `expected false to be true` |
| (b) unmount then remount: still observed, and the section still reveals | `expected false to be true` |
| (c) a section appended after mount is tagged and observed (MutationObserver path, one microtask flush) | passed (coverage) |
| (d) `isIntersecting: false`: not revealed, still observed | passed (coverage) |
| (e) options equal `{ rootMargin: "0px 0px -8% 0px" }` | passed (coverage) |
| M6: `selector="section, .reveal"` tags both matches; after both reveal, an unrelated DOM append must not re-observe | `expected 1 to be +0`: without `:is()`, the `section` half of the list was re-observed on every mutation |

**`component-variants.spec.ts`** additions:

| Test | RED before the fix |
| --- | --- |
| Drift: class groups `z`, `duration` and all 11 `border-w*` groups each equal the catalogue's `z`, `duration` and `border-width` names | 13 failures, `expected Set{} to deeply equal …` |
| `border-default border-border-subtle` kept as is (the reported drop) | received `"border-border-subtle"` |
| `border-b-strong border-border-brand` kept as is | received `"border-border-brand"` |
| className `z-overlay` replaces `z-header` | received `"z-header z-overlay"` |
| className `duration-fast` replaces `duration-slow` | failed, both classes kept |
| className `scrim-top` replaces `scrim-bottom` | failed, both classes kept |
| className `autogrid-wide` replaces `autogrid` | failed, both classes kept |
| className `border-strong` replaces `border-default` | passed (coverage) |

The RED run had 22 failures. GREEN: 47 tests pass.

F3, M5 and M8 are CSS-only; jsdom resolves no stylesheet, so they were verified through the Tailwind compile described above.

## Commands and output

`pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui --skip-nx-cache --outputStyle=static` exited 0, with no lint errors or warnings:

```
 ✓ |@pink-paprikaa-web/ui| src/styles.spec.ts (1 test) 2ms
 ✓ |@pink-paprikaa-web/ui| src/lib/component-variants.spec.ts (36 tests) 7ms
 ✓ |@pink-paprikaa-web/ui| src/lib/reveal-observer.test.tsx (10 tests) 21ms
 Test Files  3 passed (3)
      Tests  47 passed (47)
 NX   Successfully ran targets typecheck, lint, test for project @pink-paprikaa-web/ui and 3 tasks it depends on
  Run duration:      4.3s
  Cache:             Skipped (--skip-nx-cache)
```

`pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache` exited 0:

```
 NX   Successfully ran target build for project @pink-paprikaa-web/storybook and 2 tasks it depends on
  Run duration:      5.1s
```

`prettier --check packages/ui/src`: all formatted.

**Files changed:**
- `packages/ui/src/lib/reveal-observer.tsx`
- `packages/ui/src/lib/reveal-observer.test.tsx`
- `packages/ui/src/lib/component-variants.ts`
- `packages/ui/src/lib/component-variants.spec.ts`
- `packages/ui/src/styles.css`

## Notes

- **Retained elements.** The `tagged` set holds each element it tags until unmount, including elements later removed from the DOM. RevealObserver is mounted once at the root, so for a marketing site this is a handful of nodes. Pruning detached elements would only matter if routes churn thousands of sections.
- **Scan picks up config literals.** `autogrid-wide` and `scrim-*` still reach the scan, as string literals in `component-variants.ts`. They are real library utilities, so this is expected.
