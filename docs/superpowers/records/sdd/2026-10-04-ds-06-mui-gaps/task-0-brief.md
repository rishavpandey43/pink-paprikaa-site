### Task 0: Recover the interrupted X1 work and set the baseline

**Files:**
- Inspect: `packages/ui/src/layouts/grid/grid.tsx`, `grid.test.tsx` (uncommitted, from the interrupted run)
- Inspect: `packages/ui/src/layouts/box/` (committed in `fd5d8b2`, old API, reworked in Task 4)

- [ ] **Step 1: Record state**

Run: `git status --short && git log --oneline -3`
Expected: `fd5d8b2 feat(ui): add the Box layout` is in history. `layouts/grid/` is untracked, and so are the spec and plan files if not yet committed.

- [ ] **Step 2: Park the Grid WIP without losing it**

```bash
mkdir -p .superpowers/sdd/2026-10-04-ds-06-mui-gaps/wip-grid
cp packages/ui/src/layouts/grid/grid.tsx packages/ui/src/layouts/grid/grid.test.tsx .superpowers/sdd/2026-10-04-ds-06-mui-gaps/wip-grid/
```
Leave the files in place: Task 4 finishes them.

- [ ] **Step 3: Baseline gate on HEAD, excluding the Grid WIP**

Run: `pnpm nx run-many -t typecheck test -p @pink-paprikaa-web/ui`
Expected: PASS. If the Grid WIP breaks typecheck, move the two files into the parked folder for now (`mv`, not `rm`), re-run, and restore them in Task 4. Write `Task 0: baseline ui <count> tests` in the ledger.

---

