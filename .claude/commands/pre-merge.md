---
description: The full cold gauntlet before any merge to main — no cached green, evidence required
---

Run the complete pre-merge verification for the current branch. Target (optional): $ARGUMENTS

This is the gate of gates — docs/engineering/08-recipes.md §9. Every step COLD where marked,
every result shown, no step skipped, no failure narrated away:

1. `git status --short` — tree must be clean (only committed work is verified work).
2. `pnpm nx format:check && pnpm nx sync:check`
3. `pnpm nx run-many -t typecheck lint test build --skip-nx-cache` — cold; cached green is not
   evidence for a merge decision.
4. `pnpm nx run-many -t e2e` — against real static exports.
5. `pnpm nx run-many -t build && pnpm guard:founder` — founder gate over fresh output.
6. `pnpm nx build web && pnpm exec lhci autorun` — budgets (skip with a stated reason ONLY if
   no Chrome available; that reason goes in the report).
7. `pnpm install --frozen-lockfile` — lockfile integrity.
8. Diff review vs merge base: scan for raw hex outside design-tokens, hand-written versions,
   `project.json` files, `--no-verify` history, scope creep beyond the branch's stated task.
9. Drift check: if any decision changed on this branch, docs/engineering must contain the edit
   in this same branch (README maintenance contract). If not — add it now, before merging.
10. Report: table of every step → PASS/FAIL with the actual command output tail. Any FAIL stops
    the merge; fixes go through the normal loop, then re-run this command from step 1.

Only after a full-pass report: merge per the repo's current flow (local `main` merge today;
PR flow post-Phase 6), re-run `pnpm verify:all` on the merged result, delete the branch.
