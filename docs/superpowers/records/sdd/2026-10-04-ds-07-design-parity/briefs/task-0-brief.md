### Task 0: Baseline and read-in

- [ ] **Step 1:** `git status --short && git log --oneline -3`. Expected: the tree is clean at or after `6b1e28a`/`af118fa`. Record HEAD in the ledger.
- [ ] **Step 2:** Run the batch gate once and record the counts (`ui`, `sb`, `tokens`) as the baseline.
- [ ] **Step 2b: Design coverage map (the "nothing removed" check).** Create `docs/superpowers/specs/2026-10-04-design-parity/coverage.md` with one table per handoff component and page:
  - **Rows:** every prop in its `.d.ts` (name, type, values), every card row in its `.card.html`, and every behaviour in its `.jsx` + `IX` section.
  - **Columns:** `design item | our equivalent (file:symbol or story) | status (have / planned in Task N / approved difference R13x)`.
  - **Also:** one table for `guidelines/*`, one for `templates/*`, one for `ui_kits/*`, and one for `handoff/*.md` rules.

  Generate the skeleton with a small script (`apps/storybook/scripts/design-coverage.mjs`) that parses the `.d.ts` interfaces and `@dsCard` names, then fill in the equivalents by hand. Every later task updates its rows to `have`. Task 12 Step 5 fails the review if any row is not `have` or an approved R-number.
- [ ] **Step 3:** Read the four audit files' **Summary** and **Cross-cutting** sections and `IX` in full (73 lines). Don't read the per-component sections until the task that needs them.

