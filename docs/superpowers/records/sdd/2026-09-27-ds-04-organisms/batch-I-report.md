# Batch I report — carried I1–I3, Task 14 MenuList

Base `ffd54f0`, branch `feat/design-system`. Implementer: Claude Opus 5.5.
Status: IN PROGRESS

## Status log (resume from the first unchecked box)

- [x] Read contract, global constraints, progress rulings (R116), fold list, carried-fixes-I, briefs 12 + 14, AUTHORING, CLAUDE.md, batch-G report
- [x] I1 (a) real page-level overflow play at 1024/1279/1280/1536 — seen FAILING on old LONG_LINKS fixture (all 4: doc width 1267/1307/1779/1907)
- [x] I1 (b) realistic worst-case fixture; at 1280 all-six = 1303px document (overflow 23)
- [x] I1 (c) moved all-inline xl → 2xl (1440); +1440 story; unit test 2xl classes (old assertions failed vs new build)
- [x] I1 (d) `links` JSDoc per-label budget
- [x] I1 commit a0bac54
- [x] I2 blank-logo fallback test + 0/false slot case — 449922a (mutation-seen failing)
- [x] I3 drawer nav only with drawerLinks — RED/GREEN — e30a4e7
- [x] I1–I3 plan sync (Task 12 + Review Focus 2 + deviation row) — f93bc99
- [ ] T14 MenuList: RED, filter leaf, organism, stories, export, gates, commit
- [ ] T14 plan sync / re-sort
- [ ] Final: format:check, sync:check, storybook:test, guard:founder, report complete
