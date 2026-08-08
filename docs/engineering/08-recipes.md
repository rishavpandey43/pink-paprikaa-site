# 08 — Recipes

Step-by-step, exact files named. Recipes are **verified procedures** — each was executed at
least once in this repo (or is marked FORWARD for a future phase). Follow numbered steps; the
final step is always the gate. If a recipe and reality disagree, the recipe is a bug — fix it
in the same PR (and say so in [09](09-decision-log.md)).

## 1. New design-system component

1. Create `packages/ui/src/<layer>/<name>/<name>.tsx` — copy the canonical shape
   ([03 §1](03-patterns.md)). Layer per the atomic table; when torn between layers, the lower
   one wins until composition proves otherwise.
2. `<name>.test.tsx` beside it: render + each variant's observable behaviour + axe
   (`expect(await axe(container)).toHaveNoViolations()`).
3. `<name>.stories.tsx`: one story per variant, controls for the rest.
4. Export from `packages/ui/src/index.ts` (the single public barrel).
5. Tokens first: any new visual value goes into `packages/design-tokens/tokens/` (recipe 3)
   BEFORE the component uses its utility class.
6. Gate: `pnpm nx test ui && pnpm nx lint ui && pnpm nx run storybook:build`, then
   `pnpm verify`.

## 2. New feature module (in an app)

1. `apps/<app>/src/features/<name>/` — create only what the feature needs today:
   `components/`, `<name>-constants.ts`, `<name>-transformer.ts` (+ tests beside each).
2. Route: add path to `src/constants/routes.ts` (`as const`), then `app/<route>/page.tsx` as a
   thin binding (imports feature, binds content; no logic).
3. Content: if the feature needs new data, recipe 4 FIRST — the schema is the feature's
   foundation, not an afterthought.
4. Client islands: smallest-leaf `"use client"` only; state per the ladder.
5. e2e: extend the app's journey spec if the feature adds a user journey.
6. Gate: `pnpm verify` + `pnpm nx e2e <app>-e2e`.

## 3. New design token

1. Add to the right tier in `packages/design-tokens/tokens/*.json` — primitive (raw value,
   only place a hex may exist), semantic (references primitive), component (references
   semantic). DTCG format (`$type`/`$value`).
2. `pnpm nx build design-tokens`; grep `dist/theme.css` for the emitted `--` property.
3. Use the generated utility class (`bg-<token>`) — never the value.
4. Gate: `pnpm verify` (consumers recompile), visual check in Storybook.

## 4. New content type (schema + data)

1. Schema in `packages/content/src/schemas.ts` (or a new file for a large domain): Zod, every
   field's business rule encoded (min lengths, literal spellings, enum unions).
2. Data file `packages/content/src/data/<name>.json`.
3. Parse-at-boundary export in `src/index.ts`: `export const <name> = <schema>.parse(raw)` +
   `export type <Name> = z.infer<…>`.
4. Tests: valid fixture + one invalid fixture per rule-carrying field.
5. Gate: `pnpm nx test content && pnpm verify` — a schema violation now fails every consumer's
   build, which is the point.

## 5. New lint rule / gate (the promotion move)

1. Decide home: shared policy → `tools/eslint-config` (custom rules in `rules/` with a
   RuleTester test); output scanning → `scripts/` + CI step; budget → `.lighthouserc.json`.
2. Implement + wire at the right severity (new CONVENTION-promotions may land as `warn` for one
   phase, then `error`).
3. **Probe it** ([06 §4](06-quality-gates.md)): deliberate violation → gate fails with expected
   message (captured) → probe removed → green. An unprobed gate is not a gate.
4. Register it: [05 §1](05-tooling-and-config.md) registry + [06 §2](06-quality-gates.md) +
   decision-log entry.
5. Gate: `pnpm nx run-many -t lint --skip-nx-cache` (cold).

## 6. New workspace package (FORWARD — pattern proven by utils/content/seo)

1. `pnpm nx g @nx/js:library packages/<name> --bundler=none --unitTestRunner=vitest --linter=eslint`
   (check `--help` first — flags drift). React lib: `@nx/react:library` + the react eslint preset.
2. Post-generation corrections (generators lie — architecture spec §18): eslint config composes
   the shared preset; no `project.json` (migrate to package.json `nx` field); `pnpm nx sync`.
3. Tag it in package.json `nx.tags` per the boundary matrix; add depConstraints if a new tag
   type is born (decision-log event).
4. Gate: cold `pnpm verify:all` + a boundary probe (illegal import must fail lint).

## 7. New environment variable

1. Declare in `apps/<app>/src/env.ts` — the only `process.env` reader — with validation and a
   comment. `NEXT_PUBLIC_*` only (no server exists).
2. Add to `.env.example` with the same comment.
3. Consumers import from `@/env`, never `process.env`.
4. Gate: build fails loudly when the var is absent — prove it once (probe).

## 8. Dependency add/upgrade

1. `pnpm add [-D] <pkg>` at the owning package (`--filter`) or root (`-w`) — never hand-edit a
   version. `@nx/*` stays exact-pinned in lockstep.
2. pnpm build-script warning → add to `onlyBuiltDependencies` + re-install.
3. Verify the API you're about to use against `node_modules/<pkg>` (not memory).
4. Gate: `pnpm verify` cold + `pnpm install --frozen-lockfile` sanity.

## 9. Release / merge (this repo's binding today)

Branch → work through §2 lifecycle → `/pre-merge` command (full cold gauntlet) → merge to
`main` → re-run suite on merged result → delete branch. Remote + PR flow replaces local merge
at Phase 6 cutover; the gauntlet is identical either way.
