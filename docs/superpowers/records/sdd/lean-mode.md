# Lean mode (owner order 2026-10-03) — overrides implementer-contract.md / reviewer-contract.md where they conflict

## Plan docs are FROZEN
`docs/superpowers/plans/` is prettier-ignored (f1a6c3e). Never sync, re-sort or edit any plan doc.
No `docs:` plan-sync or re-sort commits. The built code is the truth: record every plan-vs-code
difference as ONE line in your batch report ("Plan vs code" section).

## Standard (unchanged)
Every component per `.claude/commands/new-component.md` + `packages/ui/AUTHORING.md`.
Read first: your task brief, AUTHORING.md, docs/engineering/03-patterns.md + 04-naming-conventions.md,
W/global-constraints.md, W/task-0-fold-list.md items naming your task, W/progress.md `Ruling` lines,
and ONE already-built sibling (organisms: e.g. `packages/ui/src/organisms/review-carousel/`) as the reference shape.
- Tokens first (component token JSON, register in component-variants.ts, contrast pairs, surface overrides).
  `componentVariants` only (no bare `tv`). Native props spread last + className merged. Named export, no forwardRef.
  `?: T | undefined`. `data-surface`, never an `on` prop. `"use client"` only in the smallest leaf.
- Conventions: `isShown` for ReactNode slots; `StruckPrice` for struck prices; `lib/story-ring.ts` for focus-ring
  plays; `role="list"` on unstyled lists outside nav; R44 new-tab phrase "(Opens in a new tab)"; R83 `headingTag`;
  R96 ui never imports `@pink-paprikaa-web/content`.
- TDD: `<name>.test.tsx` first (role/label behaviour, variants, keyboard, empty slots, edge cases, then
  `expectNoA11yViolations`). Run RED (record it), implement, run GREEN.
- Stories: card parity (one story per `.card.html` row), Playground, OnSurfaces where surface-aware, a 360px story,
  plays for client components.
- Export from `packages/ui/src/index.ts` only.

## Process
- One commit per component: `feat(ui): add the <Name> organism` (tests + stories in the same commit). Non-component
  work (carried fixes, docs pages, kits) uses an accurate lower-case Conventional Commit. Every message ends with
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. `git commit -m`; never `--no-verify`.
- Per component: run only its own tests — `pnpm nx test ui -- <name>` + its storybook stories
  (`pnpm nx run storybook:test -- <name>` or the equivalent filter).
- Full gauntlet ONCE at the end of the batch, and paste its summary in the report:
  `pnpm nx run-many -t typecheck lint test build && pnpm nx format:check && pnpm nx sync:check && pnpm nx run storybook:test && pnpm guard:founder`
  (storybook:test cold-cache "Failed to fetch dynamically imported module" → re-run once, report both).
- Hard rules: "Pink Paprikaa" two a's · pure veg (no egg/meat in fixtures) · no founder identity · no raw hex ·
  no eslint-disable on LAW rules · pnpm only · atomic layering upward only · never `git reset --hard`/`checkout --`/
  `clean`/`stash drop` · do NOT dispatch subagents · only you drive the tree while you run.
- Ambiguity: decide it, write `Ruling: <decision> — <why> — <cost if wrong>` in your report; keep going.
- Report: `W/batch-<X>-report.md` — short: per component built / deviations / RED+GREEN evidence / commits;
  "Plan vs code" one-liners; Rulings; gauntlet summary. Keep a status-log checklist at the top and tick it as you go
  (it is how a dead session is recovered). Return ONLY: status, SHAs, one-line test summary, concerns.

## Reviewer (one per batch)
Read-only. Checks: spec compliance (brief + fold list + global constraints + Rulings), correctness/a11y, and
CONSISTENCY with sibling components and AUTHORING.md. Plan-doc drift is NOT a finding (plans are frozen) unless the
code violates the spec/brief intent. Severity: Critical / Important (go into the next batch's first commits) /
Minor (go to W/minors.md, fixed once in the plan's final fix wave). Return inline, concise:
Spec ✅/❌ per task, issues as `path:line — severity — problem — fix`, Task quality verdict.
