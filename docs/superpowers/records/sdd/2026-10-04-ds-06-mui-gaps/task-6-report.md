# Task 6 report — rename table (reference for Tasks 7–12)

Status: DONE. Commits: none (reference checkpoint only; table already on `main`/`dev` lineage since 054ae42).

## Verification
- Compared `.superpowers/sdd/task-6-brief.md` to `docs/superpowers/plans/2026-10-04-ds-06-component-api.md` § Task 6 (lines 677–703).
- All 18 component rows match (Badge through CtaBand/HeroBanner/QuotePanel/SiteFooter/StatBand).
- Intro rule, catch-all paragraph (`surface` / `color` / `status` + `Ruling:`), and Step 1 checklist present in the plan.
- `git show 054ae42:…/2026-10-04-ds-06-component-api.md` contains the same Task 6 block; later plan commits (98952f8, fa8ee01, af118fa) did not alter this section.

## Step 1
- No commit: Step 1 satisfied by existing docs commits (`054ae42 docs: spec and plan the mui-grade component api` and follow-ups). HEAD remains `425aafe`.

## Ledger
- Appended: `Task 6: done 425aafe..425aafe (reference table verified)` in `.superpowers/sdd/2026-10-04-ds-06-mui-gaps/progress.md`.

## Concerns
- None. Tasks 7–12 should copy mappings from the plan Task 6 table verbatim.
