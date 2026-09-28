# Implementer contract (design-system rewrite, plans 2b–5)

You implement one batch of tasks from one plan. The controller's dispatch names the plan workspace `W`, the tasks, the base commit, and any carried fixes.

## Read first (requirements, in order)
1. `W/global-constraints.md` — binding; ends with the plan's controller amendments.
2. `W/progress.md` — every `Ruling` line is a decision already made; do not re-litigate.
3. `W/task-0-fold-list.md` — numbered BINDING OVERLAY on every brief; apply each item that names your tasks.
4. Your briefs `W/task-<N>-brief.md` — exact values to use verbatim.
5. `packages/ui/AUTHORING.md`, repo `CLAUDE.md`.

## Hard rules
- No raw hex; tokens only; atomic layering upward only (atoms → lib + atoms/icon; molecules → atoms + lib; organisms → molecules + atoms + lib; layouts are the TOP tier (layouts → organisms + molecules + atoms + lib) — nothing imports a layout (R75, tools/eslint-config/atomic-layering.js)). Stories may import `../../assets/*` (R46).
- pnpm only; `pnpm add` (never hand-write versions). Never `--no-verify`, never eslint-disable a LAW rule, never `git reset --hard` / `checkout --` / `clean`.
- Optional props are `?: T | undefined` (R13). Blank label/name = no label (R48). External/new-tab links announce "Opens in a new tab" (R44).
- Do NOT dispatch subagents.

## Known traps (from plans 1–2a)
- `tsc -b` TS2322 on `const C: ElementType = …` with a spread ref → narrow local cast `(as ?? DEFAULT) as "<tag>"` + comment. ~20 phantom errors = stale `packages/ui/dist` declarations.
- Every new custom text/shadow/spacing/radius/z token class must be registered in `componentVariants`' tailwind-merge groups (`packages/ui/src/lib/component-variants.ts`), or twMerge drops classes.
- Tailwind 4 inlines `--shadow-*` into `shadow-*` utilities: a surface-overridden shadow needs an `@utility shadow-<name>` in `packages/ui/src/styles.css` (a spec guards it).
- Surfaces: every non-light surface is emitted as light + own overrides (sd.config.mjs). A component token may alias a semantic token only if no surface overrides it (surface-aliases spec). Add contrast-pairs groups for new text pairs.
- Prettier (tailwind plugin) re-sorts classes — including code blocks in plan docs once your new tokens exist; run `pnpm nx format:check`, and if only the plan doc fails, `pnpm exec prettier --write <plan>` and commit it as a separate `docs: re-sort …` commit. Report re-sorts as deviations.
- `storybook:test` from a cold cache can fail with "Failed to fetch dynamically imported module" — re-run once, report both.

## Process
One task at a time; TDD per brief (see the test fail first); run the brief's gates via `pnpm nx …` plus `pnpm nx format:check` and `pnpm nx run storybook:test` (R77). One commit per task — Conventional Commits, `git commit -m`, message ends with:
`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`

## Report
Write `W/batch-<X>-report.md`: per task — built, deviations + why, dev-parity check, gate commands + output summary, commits; plus any carried-fix section. Return ONLY: status (DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED), SHAs, one-line test summary, concerns.
