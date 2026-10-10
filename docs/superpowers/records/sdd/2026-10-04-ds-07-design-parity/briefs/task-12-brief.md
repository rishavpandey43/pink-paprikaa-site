### Task 12: Final parity sweep, gate, records, review and one fix wave

- [ ] **Step 1: Visual parity tool.** Write `apps/storybook/scripts/parity.mjs` (dev script, not shipped). It uses Playwright from the workspace and, for each handoff `components/**/<Name>.card.html` and the matching story IDs, screenshots both at 360px and 1280px into `.superpowers/sdd/2026-10-04-ds-07-design-parity/parity/<Name>-{design,story}-{360,1280}.png`, plus a side-by-side montage. The plan-3a/3b parity tools in `docs/superpowers/records/sdd/2026-09-27-ds-03a-molecules-system/` (`q.mjs`, `shoot.mjs`, montage) are the reference.
- [ ] **Step 2:** Run it over every component, inspect every montage, and list each visible difference in `minors.md` as `Component — difference — fix`. Fix them all (they count as parity gaps, not minors).
- [ ] **Step 3: Grep gate:** `grep -rnE '<select\b|type="(date|time|datetime-local|month|week|color|file)"|\srequired[\s>=]|\stitle="' packages/ui/src apps/storybook/src --include=*.tsx | grep -vE "lib/hidden-native-select|<title>|test\.|stories\."` → no output. `pnpm guard:founder` → 0. `grep -rniE "\begg\b|18 spices" apps/storybook/src packages/ui/src packages/content` → only the "no egg" sentence.
- [ ] **Step 4:** Full batch gate → green. Archive records (`rsync … .superpowers/sdd/ docs/superpowers/records/sdd/`; if lint-staged chokes on `.tsx` copies in records, remove those copies from `docs/` only). Commit.
- [ ] **Step 5: Whole-branch review** of `af118fa..HEAD` against `coverage.md` (every row `have` or an approved R-number; any other row is a Critical finding) and the four audits (every line closed or ruled), the rulings table and Review Focus. Fix Critical/Important plus the remaining minors in ONE pass. Re-run the gate. Ledger: `Final: done (ui X, sb Y, tokens Z)` + all `Ruling:` lines. Do not push.

---

