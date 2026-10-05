# Task 0b report — visual snapshots and the count guard

Checkpoint ① on `ds-parity/1-foundations`: **75780f2** `chore: add visual snapshots and a count guard` (one commit, not pushed).

## Built

- `apps/storybook/visual/` — `visual.spec.ts`, `playwright.config.mts`, `serve.mjs` (Node `http` static server used as Playwright `webServer`), `README.md`, `__screenshots__/{mobile,desktop}/<story-id>.png`. `Dockerfile` + `docker.sh` were added to that folder by someone else while I worked (untested: no Docker here) and are in the commit because I staged the folder.
- `storybook:visual` Nx target: `visual` script in `apps/storybook/package.json` + `nx.targets.visual {cache:false, dependsOn:[build-storybook]}`. Extra args pass through (`-- --grep <prefix>`, `-- --update-snapshots`). `build-storybook` inputs now exclude `visual/**` so baselines never bust the Storybook build cache.
- `@playwright/test` 1.62.1 was already resolvable (root devDependency, matches installed Chromium) → **no `pnpm add`, no lockfile change**.
- `tools/scripts/count-guard.mjs` + `count-guard.test.mjs` + `fixtures/` + `docs/superpowers/specs/2026-10-04-design-parity/baseline-counts.json`.
- `tsconfig.storybook.json` now includes `visual/**/*.ts|mts` (typecheck covers the harness); `.gitignore` ignores `apps/storybook/visual/test-results`.
- One story edit: `website-homepage--homepage` tagged `no-visual` (below).

## Baseline counts (re-measured, match Task 0)

ui 1968 · storybook 1112 · tokens 290 · stories 926. `node tools/scripts/count-guard.mjs` → all `ok`, exit 0.

## Baselines

1850 PNGs (925 mobile + 925 desktop), 58,502,872 bytes (55.8 MiB). 926 stories minus the one `no-visual` story = 925 per viewport. macOS-generated, native Chromium (Playwright 1.62.1); README says so and gives the Docker re-baseline command.

## Determinism

Harness waits: preview `currentRender.phase` finished (play done) → `document.fonts.ready` + all images → 2 rAF → scroll-snap tracks scrolled to start → scroll offsets unchanged for 10 frames → no `sb-show-errordisplay` → `toHaveScreenshot(fullPage, maxDiffPixelRatio 0.001)` (never loosened). `reducedMotion: "reduce"` (in `use.contextOptions` — a top-level `use.reducedMotion` is silently ignored and fails typecheck; my first baselines were therefore made without it, and I regenerated everything), `deviceScaleFactor 1`, fixed locale/timezone.

Masked / skipped / special-cased:

| Story | Handling | Why |
| --- | --- | --- |
| `organisms-reviewcarousel--mobile`, `--desktop`, `--paging` | scroll-snap tracks reset to start in the harness (all stories) | final scroll position after the play's focus-scrolling/paging differed ~1 run in 4 under load. Reproduced with `--repeat-each 4` (5–8 fails/72), 0 fails/288 after the reset. Fonts/remount and reduced-motion alone did not fix it. |
| `website-homepage--homepage` | tagged `no-visual` (+ its docs entry has no snapshot anyway) | play ends with toast + two stacked dialogs mid-animation; 22% pixel diff in 1 of 5 identical full runs. `website-homepage--homepage-360` is still snapshotted. Kit stories (`website|app|marketing`) then ran 2× `--repeat-each 4` = 384 runs, 0 fails. |

No global tolerance change.

Verification runs: 2 baseline-creation runs earlier (with an older harness, discarded) → final baseline run (1852 created) → homepage baseline removed → **two consecutive full no-update runs: 1850 passed / 0 failed, both** (4.1m, 4.6m). (A third no-update run in the same sequence hit an unrelated transient Nx "plugin worker exited" graph error before starting any test; re-run was clean.)

## Count guard

- Runs `pnpm exec vitest run --reporter=json --outputFile=…` in `packages/ui`, `apps/storybook`, `packages/design-tokens` (counts `numPassedTests`; any failing test also fails the guard) and counts `type:"story"` in `storybook-static/index.json`. Compares with `baseline-counts.json`; exit 1 naming the key that dropped; `--update` only raises and refuses if anything is lower. `--counts <file>` / `--baseline <file>` let the unit test skip the multi-minute measuring. ~1 min to run.
- Test runner: `node:test` (same as `tools/eslint-config`). 9 tests: CLI lower → exit 1 naming `storybook dropped from 50 to 49`; equal/higher → exit 0; `--update` raises, never lowers, refuses on regression; helper tests.
- **Gate target:** `tools/scripts` is not an Nx project (adding one would contradict "13 projects"), so `tools/eslint-config`'s `test` script now also globs `../scripts/*.test.mjs` and its target `inputs` include `{workspaceRoot}/tools/scripts/**/*` (cache invalidation). Runs in `pnpm nx test @pink-paprikaa-web/eslint-config`, i.e. `nx run-many -t test` / `verify`.
- TDD evidence: I wrote the module before the test, so no honest RED. Mutation check instead: changing `<` to `<=` in `findRegressions` → 4 of 9 tests fail (`exits 1…`, `exits 0…`, `raises…`, `finds every lowered key`); reverted → 9/9 pass.

## Gates (final tree)

- `pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/storybook @pink-paprikaa-web/eslint-config` → success. `storybook:test` 1112/1112 (it failed twice on `kits/app/app.stories.tsx:36 toBeVisible` — the contract's known toast flake — and passed on re-run; unrelated to my change).
- `pnpm nx run storybook:build` ✔ · `pnpm nx sync:check` ✔ · `node tools/scripts/count-guard.mjs` ✔ exit 0.
- `pnpm nx format:check` → **fails only on `docs/engineering/07-ai-workflows.md`**, an uncommitted edit by someone else (not in my commit; `prettier --check` on it directly passes, so it may have flipped already). All my files are Prettier-clean (lint-staged also ran at commit).

## Concerns

1. Baselines are macOS-only; the suite will fail on Linux/CI, so it is deliberately **not** in `.github/workflows/ci.yml`. Docker re-baseline (Dockerfile/docker.sh by another contributor) is untested.
2. `--grep` through Nx goes via a shell: use a plain prefix, not `a|b` (README notes it).
3. Task 0b's baselines are 55.8 MiB of binary in git history — heavy but within the brief; re-baselines add the same again.
4. Owner-edited plan/guardrails files and `.cursor/rules/05-lean-workflow.mdc`, `docs/engineering/07-ai-workflows.md` remain unstaged/uncommitted, untouched by me.

## Files in the commit

`.gitignore`, `apps/storybook/{package.json,tsconfig.storybook.json}`, `apps/storybook/src/kits/website/website.stories.tsx` (tag), `apps/storybook/visual/**` (incl. 1850 PNGs), `apps/storybook/scripts/design-coverage.mjs` + `coverage.md` (Task 0), `tools/eslint-config/package.json`, `tools/scripts/**`, `baseline-counts.json`.
