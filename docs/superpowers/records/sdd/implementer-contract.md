# Implementer contract (slim, from 2026-10-03)

Read ONLY: `docs/superpowers/slim/RULES.md`, your task file in `docs/superpowers/slim/`, and one finished sibling component. Nothing else unless your task file points to it.

Write only: the component, its stories, its test (plus a component token JSON and the `src/index.ts` export when needed). No plan edits, no plan-sync or re-sort commits, no reports beyond the short one below.

Per component: test first (RED) → component → stories → run its own tests (`pnpm nx test ui -- <name>` + its storybook stories) → one commit. Per batch: the full gate from RULES.md once, before the last commit.

If you find unfinished work (uncommitted files, a missing test/story/export), finish it; never discard it. Do not dispatch subagents. Decide ambiguities yourself and note them as `Ruling:` lines in the report.

Report: `W/batch-<X>-report.md`, ≤ 1 KB per task — what was built, any Ruling, gate summary, SHAs. Return only status, SHAs, a one-line test count, and concerns.
