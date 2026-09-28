# SDD ledger — plan: docs/superpowers/plans/2026-09-27-ds-02c-layouts.md
Spec: docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md. Contracts: docs/superpowers/plans/2026-09-27-ds-00-contracts.md.
Carried rulings: R13, R19/R25, R42, R43 (Task 0 writes fold-list overlay), R44, R46, R47, R48, R51 (pipeline review; fixes fold into next batch), R61/R63/R65 (docs-kit markers: px size tokens used as size-/w-/h- carry $extensions.pink-paprikaa.utility; catalogue.spec reads packages/ui/src live), R66.
Note: Plan 5 foundations (R55) are live in apps/storybook/src/foundations; Spacing Rhythm + step-list type check + Layout (T7) wait on this plan's Section/AutoGrid/Stack.
Ruling R69: 2c starts while 2b's final review runs; 2b's final fix wave rides in 2c batch B (R51) — cost if wrong: 2c batch A builds on a 2b defect for one batch (2c layouts don't consume 2b atoms much).
Ledger: A (T0 + T1) dispatched base 9970d1c
Batches: A=T0+T1+T2 · B=(2b final fix wave)+T3–T4 · C=T5–T6 · D=T7–T8 · E=T9 parity.
Ledger: 2b final fix wave (…/02b…/final-fix-wave.md) rides in batch B.
Batch A: DONE_WITH_CONCERNS (5e58bf7 T1 lib/space.ts, c581ffe T2 Container; T0 fold list 11 items + F1–F7 + pre-flight, no commit; ui 653, sb 409, tokens 234).
Ruling R70: DROP contract deltas 1 (Container as="ul"|"ol") and 2 (AppShell size="fluid") — contracts win, no plan 3–5 consumer — cost if wrong: additive union member + test later.
Note: commitlint rejects upper-case subjects (fold item 10) — briefs' commit messages must be lower-cased.
Task 0: complete (overlay) · Ledger: B (2b final-fix-wave.md 1–12, then T3 Stack, T4 Cluster) dispatched base c581ffe; review A in parallel
Review A: T0 ✅ T1 ✅ T2 ✅ approved, 0 Critical/Important; fold claims (R61 markers, grid-min [] marker, autogrid twMerge, lower-case subjects) verified.
Task 2: minor (deferred): AtDesktop story would pass on any ≥1000px viewport — assert innerWidth 1280.
Task 1: complete (9970d1c..5e58bf7) · Task 2: complete (..c581ffe)
Batch B: DONE_WITH_CONCERNS (2b fix wave 9d8eada..2644e71, 12 items; b8088af T3 Stack; 4054ce4 plan-5 Spacing step check restored; 01308e6 T4 Cluster; tokens 249, ui 702, sb 430).
Ruling R71: Cluster rail far-end focus story scrolls the rail to its end then measures ring room; no client focus handler (layouts stay server-first) — cost if wrong: a real user tabbing to a ≥32px-visible last item sees a partly clipped ring; revisit if Plan 4 nav uses the rail.
Ruling R72: accept new primitive `danger-strong` #B81E1E for danger text on soft (AA) — OWNER may pick a different value — cost if wrong: one hex in color.json.
Ruling R73: accept Badge/Tag status text on fixed-colour tokens (item 2 knock-on) — cost if wrong: none on light grounds (same values).
Ledger: review B dispatched; C (T5 AutoGrid, T6 Section, then plan-5 Spacing Rhythm specimen) dispatched base 01308e6
Review B: 2b fix wave 12/12 ADDRESSED; T3 Stack ✅, Spacing restore ✅, T4 Cluster ✅ approved, 0 Critical/Important.
Task 3–4: minor (deferred): spacing.stories isEveryStepShown runtime expect is vacuous (use void).
Task 3: complete (..b8088af) · Task 4: complete (..01308e6)
Pending: archive plan 2b records at next idle gap.
Batch C: DONE (d445180 T5 AutoGrid, f473585 3b/4 plan re-sorts, c563719 T6 Section, fd787a4 plan-5 Spacing Rhythm; ui 746, sb 458, tokens 249).
Note: plan-5 Task 7 (Layout group) now unblocked — runs with plan 5's later run (or after 2c T7 AppShell).
Archive: 657e3eb (2b complete + 2c A–C + plan 5 foundations).
Ledger: D (T7 AppShell, T8 PostFrame) dispatched base 657e3eb; review C in parallel
Review C: T5 ✅ T6 ✅ Rhythm ✅ approved, 0 Critical/Important. Minors (autogrid twMerge grouping latent bug, one-direction spec, column plays) → carried-fixes-E.md.
Task 5: complete (..d445180) · Task 6: complete (..c563719)
Batch D: DONE (7e76a72 T7 AppShell, 5f80d82 T8 PostFrame + POST_FORMATS, 2f584a1/4c9aae9 plan re-sorts; ui 796, sb 490, tokens 249). No cast needed (no `as` prop).
Ledger: E (carried-fixes-E.md 1–2, then T9 parity) dispatched base 4c9aae9; review D in parallel
Review D: T7 ✅ T8 ✅ approved, 0 Critical/Important; decided deviations 2,3,5–8 + R70 verified.
Task 8: minor (deferred, plan-mandated): post-frame-scaler.tsx:33 parent width 0 → scale 0 marked measured; skip update when clientWidth === 0.
Task 7: complete (..7e76a72) · Task 8: complete (..5f80d82)
Batch E: DONE (7d35c06 autogrid-min own twMerge group, 1585e8c column plays, a984709 T9 parity — fixed PostFrame mpu headline font; ui 800, sb 490, tokens 249 cold).
Ruling R74: batch E task review folded into the 2c final review (precedent R49/R68); 2c's final fix wave rides in 3a batch B (precedent R69) — cost if wrong: 3a batch A builds on a 2c defect for one batch.
Final review dispatched: range 657e3eb..a984709 (2c A–E; archive commit 657e3eb is docs only)
Final review 2c: READY WITH FIXES — 0 Critical/Important; 4 minors + 3 deferred → final-fix-wave.md (rides in 3a batch B). Batch E ✅ (task review per R74). R69–R74 hold.
Task 9: complete (4c9aae9..a984709). Plan 2c: COMPLETE pending fix wave (all minor).
2c final fix wave: done in 3a batch B (fad1dd7..901bed7); reviewed in 3a review B.
Plan 2c: COMPLETE (fix wave re-reviewed ✅ in 3a review B).
