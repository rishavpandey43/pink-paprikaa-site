### Task 0b: Guardrails: visual snapshots and the count guard (before any code change)

**Why:** this plan touches ~100 components. A change meant for one component must not silently alter another, and no test or story may disappear to make a gate pass.

**Files:**
- Create: `apps/storybook/visual/visual.spec.ts`, `apps/storybook/visual/playwright.config.ts`, `apps/storybook/visual/Dockerfile` (or a `docker run` script), `apps/storybook/visual/__screenshots__/**` (baselines, committed)
- Modify: `apps/storybook/package.json` (`pnpm add -D @playwright/test --filter @pink-paprikaa-web/storybook` if it isn't already resolvable; script `"visual": …` exposed as the Nx target `storybook:visual`)
- Create: `tools/scripts/count-guard.mjs` + `docs/superpowers/specs/2026-10-04-design-parity/baseline-counts.json`

- [ ] **Step 1: Visual snapshot suite.**
  - `visual.spec.ts` reads `apps/storybook/storybook-static/index.json`, iterates every entry of `type: "story"` (skip the `!test`/`!visual` tags), opens `iframe.html?id=<id>&viewMode=story`, waits for fonts (`document.fonts.ready`) and for animations to settle (`reducedMotion: "reduce"` in the context, so loops and transitions are frozen), and runs `expect(page).toHaveScreenshot("<id>.png", { fullPage: true, maxDiffPixelRatio: 0.001 })`.
  - Two projects: `mobile` (360×800) and `desktop` (1280×800).
  - `playwright.config.ts` serves `storybook-static` through its `webServer` option, using a tiny Node `http` static server script (`apps/storybook/visual/serve.mjs`, the same approach as the plan-3 parity tools). No ad-hoc `npx` servers.
  - Rendering must be deterministic, so the suite runs inside the official Playwright Docker image whose version matches the installed `@playwright/test`: `docker run --rm -v "$PWD":/work -w /work mcr.microsoft.com/playwright:v<same version>-noble pnpm nx run storybook:visual`. Document the command in `apps/storybook/visual/README.md`. If Docker isn't available, ledger a `Ruling:` and run natively, with baselines marked as macOS-generated.
- [ ] **Step 2: Baseline.** `pnpm nx run storybook:build`, then the suite with `--update-snapshots`. Commit the baselines (`test(storybook): add visual baselines for every story`). Record the PNG count and total size in the ledger.
- [ ] **Step 3: How later tasks use it.** Each component task runs `storybook:visual -- --grep <component-id-prefix>`. If **its own** screenshots change as the task intends, update **only those** (`--update-snapshots --grep <prefix>`) and look at each diff image before committing. If **any other** story's screenshot changes, that's an unintended side effect: fix the code and never update those baselines. The batch gate runs the full suite with no updates.
- [ ] **Step 4: Count guard.** `count-guard.mjs` runs the ui and storybook Vitest suites with `--reporter=json` (or reads their JSON output files), counts passed tests, counts stories in `storybook-static/index.json`, and compares them with `baseline-counts.json` (`{ "ui": N, "storybook": N, "tokens": N, "stories": N }`). It exits 1 if any count is lower than the baseline, printing which one; after a green batch it may raise the baseline (`--update`), never lower it. Unit-test it with two fixture JSONs (lower → exit 1; equal or higher → exit 0). Add it to the batch gate: `… && pnpm nx run storybook:build && node tools/scripts/count-guard.mjs`.
- [ ] **Step 5: Commit** `chore: add visual snapshots and a count guard for the parity pass`.

