# 09 — Decision Log & Drift Ledger

Append-only. Every entry: what was decided, why, and — for rejections — the **reconsider
trigger** that reopens it. A decision without a written trigger is a taboo; taboos rot.
Sources: the reference-architecture review (a prior production codebase, extracted 2026-08-08,
gitignored as `docs/Reference_*.md`), and this repo's own build history.

## Adopted from the reference codebase (modernized)

| #    | Pattern                                                                                         | Verdict & adaptation                                                                                                                      |
| ---- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| R-10 | **Transformer files** (pure wire/URL ↔ view mapping, explicit types)                            | Adopted as-is — the reference's best pattern. [03 §4](03-patterns.md)                                                                     |
| R-11 | **Constants-as-data** (typed config objects, zero logic)                                        | Adopted; keys typed from schema unions. [03 §5](03-patterns.md)                                                                           |
| R-12 | **Engine + thin-adapter hooks**                                                                 | Adopted for when the case appears. [03 §7](03-patterns.md)                                                                                |
| R-13 | **Column-def hooks** (memoised, typed to the data source)                                       | Adopted FORWARD (first table). [03 §7](03-patterns.md)                                                                                    |
| R-14 | **Role-suffix files** (`-constants`, `-transformer`, `-utils`)                                  | Adopted; with kebab-case component files (not the reference's PascalCase).                                                                |
| R-16 | **Feature co-location** (a feature owns its components/hooks/constants)                         | Adopted, adapted to App Router `features/` + thin `app/` routes. [02 §3](02-architecture.md)                                              |
| R-17 | **LAW / CONVENTION / ASPIRATION severity taxonomy** (from the extraction method itself)         | Adopted as this handbook's spine.                                                                                                         |
| R-18 | **Store discipline** (typed state/actions split, labelled actions, `initialState`+`resetState`) | Pattern recorded [03 §6](03-patterns.md) — even though the library was rejected (R-05), the discipline is the standard IF one ever lands. |

## Rejected from the reference codebase (with triggers)

| #    | Pattern                                                                                                                                            | Why rejected                                                                                                                                                                                                                                 | Reconsider when                                                          |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| R-02 | Default exports + per-folder `index.ts` barrels                                                                                                    | The reference's own extraction documents the failure: root barrels exporting 4 of ~40 components ("decoy" public APIs), asymmetric folder-vs-file imports, dead stubs surviving in no barrel. Named exports + one public barrel per package. | Never — evidence-backed.                                                 |
| R-03 | `forwardRef` wrappers                                                                                                                              | Obsolete on React 19 (`ref` is a prop); crashes nothing, adds noise everywhere.                                                                                                                                                              | Never on React ≥19.                                                      |
| R-05 | Zustand (or any state library)                                                                                                                     | Zero shared mutable state exists; a store would be ceremony (KISS).                                                                                                                                                                          | v2 scope with real client server-state (auth/cart) — reopens HERE first. |
| R-06 | Prettier-through-ESLint (`plugin:prettier/recommended`)                                                                                            | Double-parse, blurred responsibilities; modern split is config-off + separate Prettier.                                                                                                                                                      | Never.                                                                   |
| R-07 | **Free-form string keys gating behaviour** (ACL `componentKey`: typo → silent deny; singular/plural type drift compiling because config was `any`) | The reference's most instructive defect: zero type safety on its most security-relevant data. Principle 6 exists because of this.                                                                                                            | Never — strings are not control flow.                                    |
| R-08 | **Hand-maintained allow-lists** (the ~35-operation header list)                                                                                    | Drifts silently; membership must derive from a source of truth.                                                                                                                                                                              | Never.                                                                   |
| R-09 | MUI + `sx` styling                                                                                                                                 | Different stack; tokens + Tailwind v4 + `tv()` is this standard's styling system.                                                                                                                                                            | Only with a full design-system decision.                                 |
| R-15 | (lesson, not pattern) Twin near-identical filenames, typo'd names shipping (`PayRum…`), misspelled component dirs                                  | Naming review heuristics [04 §5](04-naming-conventions.md) + spell-check words list.                                                                                                                                                         | —                                                                        |

## This repo's own foundational decisions (recorded during Phase 0 + handbook creation)

| #    | Decision                                                                                            | Where                                                |
| ---- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| P-01 | Nx inferred tasks; zero `project.json`; package.json `nx` field for overrides                       | Architecture spec §5; [05](05-tooling-and-config.md) |
| P-02 | Boilerplate-only Phase 0 (user directive 2026-08-07); scope altitude confirmed before code          | AI-workflows contract §2                             |
| P-03 | Tokens: `@theme static` (Tailwind v4 tree-shakes unreferenced vars) + case-preserving SD transforms | sd.config.mjs inline docs                            |
| P-04 | No state/data/i18n libraries; state ladder                                                          | [03 §6](03-patterns.md)                              |
| P-05 | Atomic layering as opt-in `./atomic-layering` export (ui-only) — shared preset stays scope-safe     | tools/eslint-config                                  |
| P-06 | Guard coverage includes sourcemaps + extensionless + svg; budgets are LAW                           | [06 §2](06-quality-gates.md)                         |
| P-07 | pnpm-only enforced 3 ways (workspace protocol, only-allow, engines)                                 | [05](05-tooling-and-config.md)                       |
| P-08 | Naming-convention lint at `warn` until Phase 1 code lands, then `error`                             | tools/eslint-config/base.js                          |
| P-09 | Reference extractions from previous employers are gitignored inputs, never committed                | .gitignore; README                                   |

## Drift ledger (open items — check before Phase 1 planning)

| Item                                                                                                               | State     | Owner phase |
| ------------------------------------------------------------------------------------------------------------------ | --------- | ----------- |
| `tools/typescript-config` presets unconsumed — wire or retire                                                      | Open      | Phase 1     |
| `prettier-plugin-tailwindcss` (class sorting) not installed                                                        | Deferred  | Phase 1     |
| naming-convention promotion warn → error                                                                           | Scheduled | Phase 1     |
| eslint-config cleanup cluster (unused eslint-plugin-import, ts-node; .js/.mjs config files carry no TS-lint rules) | Open      | Phase 1     |
| Interactive `pnpm commit` never smoke-tested end-to-end (inquirer peer)                                            | Open      | next touch  |
| Content-integrity gate (link/asset checker beyond Zod)                                                             | Deferred  | Phase 2     |
| Reference component + real tokens + Storybook stories glob widened already                                         | Partial   | Phase 1     |
