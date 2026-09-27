# Task 8 report: Storybook on the consumer contract (fonts, groups, guard)

**Status:** DONE
**Base:** 15d578b. **Commits:** 94ff380, 4d43e42, 99d3050

| Commit  | Message                                                            |
| ------- | ------------------------------------------------------------------ |
| 94ff380 | `feat(storybook): consume the design system like an app`           |
| 4d43e42 | `fix(storybook): keep local paths out of the build and guard it`   |
| 99d3050 | `chore: untrack the generated next-env.d.ts`                       |

## Changes

### Brief (Steps 1–4)

- **Deps** (installed with `pnpm add`, no versions typed by hand): `@fontsource/{poppins,dm-sans,space-mono}` as devDeps, plus `@pink-paprikaa-web/content` and `@pink-paprikaa-web/design-tokens` as workspace deps. `nx sync` then added the two TS project references to `apps/storybook/tsconfig.json`. `sync:check` failed until that ran; it is green now.
- **Fontsource entry names checked** in `node_modules/@fontsource/*` (`400.css`, `600-italic.css`, …; family names `'Poppins'`, `'DM Sans'`, `'Space Mono'` match the token stacks `var(--font-poppins, "Poppins")` and so on).
- **`apps/storybook/.storybook/fonts.ts`** (new): the 12 imports exactly as the brief lists them. They match `tokens/fonts.css`: Poppins 400/500/600/700/800 + 600 italic, DM Sans 400/500/700 + 400 italic, Space Mono 400/700.
- **`apps/storybook/.storybook/styles.css`** replaced: `@import "tailwindcss"; @import "@pink-paprikaa-web/ui/styles.css"; @source "../src";` plus `@source "../../../packages/ui/src/**/*.stories.tsx";`, because the library excludes its own stories from its scan. The Google Fonts `@import` is gone.
- **`preview.tsx`**: `import "./fonts";` then `import "./styles.css";`. Added a `soft` background (`var(--color-surface-brand-soft)`). The contrast-policy comment replaces the old blanket-exemption essay, and `color-contrast` stays off. `storySort.order` is now the 14 entries (Introduction plus the 13 groups). The decorator was already `font-body text-body text-text-body` (Task 6).
- **Root `package.json`**: `guard:founder` now also scans `apps/storybook/storybook-static`.
- **`vitest.config.mts`**: I fixed one stale comment. It said "the contrast rule runs for real" in the browser suite, which contradicts the policy. It now points at the `preview.tsx` rule comment.

### Routed item R24: stale story-test cache

`apps/storybook/package.json` → `nx.targets.test.inputs = ["default", "^default", { "externalDependencies": ["storybook", "vitest"] }]`. The inferred `^production` input drops `*.stories.*`. `build-storybook` already had `default, ^default`, so it had no gap.

Resolved (`pnpm nx show project @pink-paprikaa-web/storybook --json`):
```
test {"inputs":["default","^default",{"externalDependencies":["storybook","vitest"]}],"dependsOn":["^build"],"cache":true}
```

### Routed item: absolute-path / username leak

`rtk proxy grep -rl "Users/" apps/storybook/storybook-static` found 3 files, from two causes:

1. `assets/{logo,icon}.stories-*.js`: react-docgen-typescript writes the absolute `filePath` (`/Users/<user>/…/packages/ui/src/atoms/logo/logo.tsx`) into `__docgenInfo`. I checked the installed `react-docgen-typescript@2.4.0` `ParserOptions` and `@joshwooding/vite-plugin-react-docgen-typescript@0.7.0` (`serializeComponentDoc` emits `componentDoc.filePath` verbatim): neither has an option to change it. **Fix:** a small `enforce: "post"` Vite plugin in `main.ts` (`relativeDocgenPaths`). It rewrites only the exact JSON key prefix `"filePath":"<workspace root>/` to `"filePath":"`, which gives `filePath:"packages/ui/src/atoms/logo/logo.tsx"`.
2. `sb-addons/chromatic-com-storybook-4/manager-bundle.js`: Storybook's `loadEnvs` puts `NODE_PATH: process.env.NODE_PATH` into the `env` preset, and the manager builder inlines that as `process.env`. pnpm's bin shims export `NODE_PATH` as absolute `.pnpm` store paths. **Fix:** `env: (config) => ({ ...config, NODE_PATH: "" })` in `main.ts`. This uses Storybook's documented `env` preset, which I checked in the installed type `env?: PresetValue<Record<string,string>>`.

The guard pattern and file list are unchanged.

### Routed item R22: `next-env.d.ts` churn

`git rm --cached apps/web/next-env.d.ts apps/blog/next-env.d.ts`. `.gitignore` now has `next-env.d.ts` under `# Next.js`, with an explanatory comment. web and blog have no `typecheck` target (targets: `lint build dev start serve-static build-deps watch-deps serve`), so nothing needs the file before Next recreates it.

## Proofs

**Step 5, run verbatim after the commits:**
```
$ pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -5
  Run duration:      6.0s
  Cache:             Skipped (--skip-nx-cache)
$ grep -l -- "--color-text-body" apps/storybook/storybook-static/assets/*.css
apps/storybook/storybook-static/assets/iframe-l8VDiats.css
$ grep -l "w-logo-lockup" apps/storybook/storybook-static/assets/*.css
apps/storybook/storybook-static/assets/iframe-l8VDiats.css
$ grep -c "\.h-header-compact" …/assets/*.css        # story-only class (only in logo.stories.tsx)
1
$ grep -c -- "--color-surface-brand-soft" …/assets/*.css
1
$ grep -rl "Users/" apps/storybook/storybook-static | head
(0 files)
$ grep -rl "fonts.googleapis|fonts.gstatic" apps/storybook/storybook-static | wc -l
0
$ pnpm nx run-many -t build -p @pink-paprikaa-web/web @pink-paprikaa-web/blog 2>&1 | tail -3 && pnpm guard:founder
> node scripts/check-founder-names.mjs apps/web/out apps/blog/out apps/storybook/storybook-static
Founder-name guard: clean.
$ pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache 2>&1 | tail -8
 ✓ |storybook (chromium)| ../../packages/ui/src/atoms/icon/icon.stories.tsx (5 tests)
 ✓ |storybook (chromium)| ../../packages/ui/src/atoms/logo/logo.stories.tsx (5 tests)
 Test Files  2 passed (2)
      Tests  10 passed (10)
```
`h-header-compact` appears only in `packages/ui/src/atoms/logo/logo.stories.tsx` (`grep -rl` over `packages/ui/src` and `apps/storybook/src`). `text-ink-700` appears only in `icon.stories.tsx`, and it is in the CSS too.

**Consumer-contract probe (Review Focus 4).** I temporarily deleted the stories `@source` line and rebuilt. `.h-header-compact` count was **0**, while `w-logo-lockup` stayed at **1** and the semantic variables were still present. So the library scans itself; only story-only classes need the extra `@source`. I restored the line afterwards.

**R24 cache probe.**
```
new inputs:  rerun unchanged → "storybook:test [existing outputs match the cache]" Cache 2/2 hit
             echo "// cache probe" >> logo.stories.tsx → Test Files 2 passed, Tests 10 passed, Cache 1/2 hit (test executed)
old inputs (counter-probe, test block removed): touch story → "storybook:test [existing outputs match the cache, left as is]" Cache 2/2 hit  ← the bug
```
I reverted the touch (`git checkout`) and restored `package.json`.

**Guard counter-probe.** I restored the pre-fix `main.ts` from 94ff380, rebuilt, and ran `pnpm guard:founder`:
```
FOUNDER-NAME GUARD: "<match>" found in apps/storybook/storybook-static/assets/icon.stories-3fkKM9A6.js
FOUNDER-NAME GUARD: "<match>" found in apps/storybook/storybook-static/assets/logo.stories-DvVjypfw.js
FOUNDER-NAME GUARD: "<match>" found in apps/storybook/storybook-static/sb-addons/chromatic-com-storybook-4/manager-bundle.js
Founder-name guard failed: 3 file(s).
```
(Match text redacted here.) With the fixed `main.ts` restored and rebuilt: `Founder-name guard: clean.`

**R22.**
```
$ git ls-files | grep next-env      → (none after 99d3050)
$ git check-ignore -v apps/web/next-env.d.ts
.gitignore:69:next-env.d.ts	apps/web/next-env.d.ts
$ pnpm nx lint @pink-paprikaa-web/web --skip-nx-cache   → success (file absent at the time)
$ pnpm nx run-many -t build -p web blog storybook --skip-nx-cache → success; next-env.d.ts recreated in both apps, untracked
$ git status --short                → clean after fresh lint + builds
```

**Fonts at runtime** (Playwright against `storybook dev` on 6006):
- `document.fonts` holds exactly these 12 faces: DM Sans 400/400i/500/700, Poppins 400/500/600/600i/700/800, Space Mono 400/700 (Nunito Sans is Storybook's own UI font and was excluded from the count).
- `document.fonts.load()` returns `loaded` for each family. Poppins loads two files (latin + devanagari) for "Aa पैप्रिका".
- Off-origin requests: `[]`.
- The decorator's computed `font-family` is `"DM Sans", "Segoe UI", system-ui, sans-serif`.

## Visual check (Step 6)

I ran `pnpm nx run @pink-paprikaa-web/storybook:serve` (port 6006), took screenshots with Playwright, stopped the server, and confirmed with curl that the port was closed. Screenshots are in `.superpowers/sdd/2026-09-27-ds-01-foundation/task-8-evidence/`:

- `01-sidebar-atoms-logo-docs.png`: the sidebar reads Introduction, then ATOMS (Icon, Logo). The Logo docs page shows the pink lockup and a populated props table.
- `atoms-logo--tones.png`: pink lockup and symbol on white; white lockup, wordmark and symbol on the pink panel; white on ink; badge lockup, wordmark and symbol on their pink plates. Labels are in Space Mono.
- `atoms-logo--variants.png`: the variants story.
- `atoms-icon--sizes.png`: all five sizes, xs to xl.

## Gate

`pnpm nx run-many -t typecheck lint test build --skip-nx-cache --outputStyle=static`, rerun after all three commits (exit 0):
```
 NX   Successfully ran targets typecheck, lint, test, build for 12 projects and 1 task they depend on

  Run duration:      22.2s
  Cache:             Skipped (--skip-nx-cache)
  Critical path:     10.1s (3 tasks)
  Recoverable time:  12.1s (54% of the run)
```
Test totals: 135 + 15 + 84 + 20 + 10 (storybook) + 1 + 1, all passed. `pnpm nx format:check` is clean and `pnpm nx sync:check` reports all files up to date. The only warnings are the existing `playwright/no-conditional-in-test` in the two e2e specs and Storybook's chunk-size notice (axe/iframe).

## Files changed (15d578b..HEAD)

- `apps/storybook/.storybook/fonts.ts` (new)
- `apps/storybook/.storybook/styles.css`
- `apps/storybook/.storybook/preview.tsx`
- `apps/storybook/.storybook/main.ts`
- `apps/storybook/vitest.config.mts` (comment only)
- `apps/storybook/package.json`
- `apps/storybook/tsconfig.json` (`nx sync` refs)
- `package.json`
- `pnpm-lock.yaml`
- `.gitignore`
- `apps/web/next-env.d.ts`, `apps/blog/next-env.d.ts` (untracked)

## Self-review

- Every brief value is used verbatim: font imports, stylesheet imports, the `soft` background, the a11y comment and rule, the 14-entry order, and the guard command. The added stories `@source` goes beyond the brief's stylesheet; the controller's context asked for it, and the probe shows it is needed.
- The docgen rewrite matches only the exact JSON key prefix, not every occurrence of the root path, so import specifiers and other code cannot be rewritten by accident. It returns `map: null`, the same way the docgen plugin itself does.
- `NODE_PATH` is not read anywhere in the browser. Only Chromatic's manager bundle inlined `process.env` whole.
- `git add` stayed within the allowed paths. One mistake happened and was fixed before moving on: the earlier `git rm --cached` was still staged when I made commit 1, so it went in with it. I restored those two index entries and amended commit 1, then removed them in commit 3. Final commit contents are as listed.
- No `--no-verify`, no eslint-disable, no hex literals, no `project.json`.

## Concerns

1. **`apps/storybook/README.md` is out of date.** Its "Current state: this target is red" section (200/441 failing, the contrast table) and its description of what the Chromium suite checks predate the contrast policy. It is in docs scope, so Task 9 should rewrite it. I did not touch it.
2. `@pink-paprikaa-web/content` is a dependency per the brief but nothing imports it yet (kits come later), so the `nx sync` reference is unused for now.
3. Fontsource ships `.woff` next to `.woff2`, so `storybook-static` holds both. Browsers fetch only the woff2 files; this costs disk space, not transfer.
