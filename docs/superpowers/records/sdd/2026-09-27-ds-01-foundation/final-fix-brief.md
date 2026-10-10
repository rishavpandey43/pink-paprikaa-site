# Plan 1 — final fix wave (one dispatch). Fix ALL items below.

Source: final whole-branch review (68b2b9a..0c3724e). Repo /Users/rishavpa/Professional/pink-paprikaa-site, branch feat/design-system.

## Critical
C1. Prettier (prettier-plugin-tailwindcss via .prettierrc tailwindStylesheet → packages/ui/tailwind.css → src/styles.css → design-tokens ./dist/theme.css) and eslint-plugin-tailwindcss both throw "Can't resolve …" when packages/design-tokens/dist is absent (gitignored, nothing builds it first). CI runs `nx format:check` before any build (ci.yml:45-46); pre-commit (lint-staged eslint+prettier) fails in fresh clones/worktrees.
  Fix: root package.json `"prepare": "husky && nx build @pink-paprikaa-web/design-tokens"` (verify the real project name with `pnpm nx show projects`); nx.json targetDefaults `"lint": { "dependsOn": ["^build"] }` (merge with any existing lint default; check apps/blog already has lint dependsOn build). Prove: `mv packages/design-tokens/dist $CLAUDE_JOB_DIR/tmp/dist-bak` (or another temp dir inside the repo's .superpowers), run `pnpm install --frozen-lockfile` (prepare) and `pnpm nx format:check`, then confirm dist is rebuilt; restore/verify. Paste evidence.

## Important
I1. typecheck cache inputs = production + ^production; production excludes spec/test/stories/.storybook but `tsc --build` checks them → cached false pass. Fix nx.json targetDefaults `"typecheck": { "inputs": ["default", "^production", { "externalDependencies": ["typescript"] }] }`. Prove: typecheck, edit only a test file with a type error, re-run → fails (not cache hit); revert.
I2. Port dev's `packages/ui/src/index.spec.ts` (`git show dev:packages/ui/src/index.spec.ts` — never checkout): every component folder exported from the barrel; every component folder has <name>.tsx + <name>.test.tsx + <name>.stories.tsx; no default export. Layers atoms/molecules/organisms/layouts; skip layer folders that don't exist yet. Drop its public componentVariants-export check (spec §9.6 doesn't list it). Must pass today (Icon, Logo).
I3. storybook-static publish path unguarded. Fix: in apps/storybook/.storybook/main.ts add a Vite plugin `generateBundle` that throws if WORKSPACE_ROOT (the absolute workspace path) appears in any emitted chunk/asset source (self-check for relativeDocgenPaths); and prefix the `chromatic` target command in apps/storybook/package.json with `node ../../scripts/check-founder-names.mjs storybook-static &&` (verify the cwd/path the target runs in). Prove the self-check throws with a deliberate leak (then revert) and that `pnpm nx run storybook:build` is green.

## Minor
M1. packages/utils format-rupees.ts:18 — `Math.round` on negatives rounds toward +∞. Use `Math.sign(amount) * Math.round(Math.abs(amount))`; add test -499.5 → "−₹500" (U+2212) and 49.5 → "₹50". Avoid -0 output ("₹0" not "−₹0").
M2. R13 `?: T | undefined` on: icon.tsx:45 label, logo.tsx:32,34 title/isDecorative, reveal-observer.tsx:10 selector, brand-glyphs.tsx:9 size — and any other optional prop in packages/ui/src. Update AUTHORING.md:75-80 canonical example to the new shape.
M3. tools/eslint-config/atomic-layering.js:46 — barrel reachable via "../..", "../../", "../../index.ts". Add for EVERY tier a pattern matching `^(?:\.\./)*\.\.(?:/(?:index(?:\.[jt]sx?)?)?)?$`. Extend the rule test/probe to cover all three spellings. Then make AUTHORING.md:39-41, docs/engineering/02-architecture.md:27, 06-quality-gates.md:35, and spec docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md §11.2 atomic-layering row (~line 789, still says "atoms may import only atoms/icon + lib") describe exactly what the lint enforces.
M4. logo.tsx:29 LogoProps must Omit `dangerouslySetInnerHTML` (+ `children` if the root renders its own). Add a type test or comment consistent with SymbolMark in plan 2a.
M5. tools/eslint-config/rules/*.test.mjs never run in CI. Add an nx `test` target to tools/eslint-config/package.json (e.g. `node --test rules/*.test.mjs` — check how the tests are written) so `nx run-many -t test` / affected runs them.
M6. Stale docs:
  - apps/storybook/.storybook/main.ts:61-73 ("the rest of this config is verbatim", "6 of 69 … all 69") — make true.
  - packages/design-tokens/README.md:9,15,17,27 — px literals also in component/ + focus-ring composites; component/ holds icon.json/logo.json; theme.css holds component tokens too; theme.spec.ts scans all sources. Match AUTHORING §5.
  - CLAUDE.md "Current state" (~156-181): `origin` remote exists (github.com/rishavpandey43/pink-paprikaa-site); `dev` branch exists and holds the August port = the dev-parity source (contracts §0.0; read via git show, never restore); current branch is feat/design-system (design-system rewrite, Plan 1 done); SDD records archived in docs/superpowers/records/sdd/. Keep the Nx-managed block markers intact; do not remove hard rules. Verify every claim with git.
M7. AUTHORING §6: one binding line — never use Tailwind's built-in `max-w-prose` (65ch, wins over --container-prose 64ch); use `max-w-text-measure-prose` / the text-measure-prose token.

## Dev-parity ADDs (Plan 1 scope; read dev with git show only)
- Icon test: caller className replaces the size class (componentVariants merge).
- Icon test: decorative icon has no img role.
- Icon story `Labelled` (named icon a11y state).
- Logo test: `title` override renders the given title.
- Logo test: no plate `rect` on transparent tones (pink/white).
- Logo a11y check (expectNoA11yViolations) over default + badge + decorative.

## Rules
- Tests first where behaviour changes (M1, I2, M3, dev-parity tests). Verify every API against node_modules, never memory.
- Do NOT touch docs/superpowers/plans/** (another agent is editing plan 3a). Stage files explicitly by path — never `git add -A`/`git add .`. Never stash/reset/clean/checkout.
- Hard rules: two-a "Pink Paprikaa"; no founder identity; no literal brand hex outside design-tokens; never hand-write dep versions (pnpm add); TS stays 6.x; no --no-verify; no eslint-disable on LAW rules.
- Commits: Conventional Commits with allowed scopes [web, blog, storybook, ui, tokens, content, seo, utils, tools, ci, deps] or no scope; several focused commits are fine. Each ends with:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
- Final gate (paste summary): `pnpm nx run-many -t typecheck lint test build --skip-nx-cache` (all projects), `pnpm nx format:check`, `pnpm nx sync:check`, `pnpm nx run storybook:build`, `pnpm guard:founder`. All green. (format:check may flag only the uncommitted plan 3a file — note it, don't touch it.)

## Report
Write `.superpowers/sdd/2026-09-27-ds-01-foundation/final-fix-report.md`: per item → change (file:line), test/probe evidence, commits. Return only: status, commit shas, gate one-liner, concerns.
