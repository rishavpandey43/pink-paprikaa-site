# SDD ledger — plan: docs/superpowers/plans/2026-09-27-ds-05-storybook-kits-docs.md
Spec: docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md. Contracts: docs/superpowers/plans/2026-09-27-ds-00-contracts.md.
Carried rulings: R13, R19/R25, R42, R43, R44, R46, R47, R48, R51 (pipeline review), R55 (Tasks 1–6 + 8 run early, after 2b batch C), R56 (every scale copyable as utility class + CSS var — see plan's last amendment).
Batches (early, R55): P5-A = T0 (scoped to T1–T6+T8 consumes) + T1 + T2 · P5-B = T3 + T4 · P5-C = T5 + T6 + T8. Later: T7, T9–T15 after plan 4.
Ledger: P5-A dispatched base 6d9104c
P5-A: DONE_WITH_CONCERNS (3c888cc T1 contrast evaluator, 5b0005f T2 docs-kit + R56 copy chips/utilitiesOf; T0 no commit; sb-test 188, tokens 228). doc-table.tsx stands in for 3b Table until 3b T20. apps/storybook nx.projectType=application.
Ruling R59: text-measure (and any width-only spacing token) maps to max-w-* only, not p/m/gap — carried into P5-B — cost if wrong: extra chips removed later.
Note: specimens deferred by fold list (components not built) need a follow-up pass after 2b–3b land — tracked for Plan 5's later run.
Task 0: complete (overlay) · Ledger: P5-B (T3 Brand, T4 Colors+Contrast) dispatched base 5b0005f; review P5-A in parallel
Review P5-A: T0 ✅ T1 ✅ T2 ✅ w/ 1 Important — docs offer banned max-w-prose (container-prose*). All 15 namespace mappings verified vs Tailwind 4.3.3 + theme.
Ruling R60: container-prose* → text-measure alias class (constraint binding) + 6 minors → carried into P5-C (carried-fixes-P5-C.md) — cost if wrong: P5-B's Colors pages don't use container tokens, so nothing builds on the defect for one batch.
Task 1: complete (6d9104c..3c888cc, review clean) · Task 2: fix pending (carried to P5-C)
P5-B: DONE_WITH_CONCERNS (31f4173 R59 ch→max-w, 9fa3f5f T3 Intro+Brand, 26ba97e T4 Colors+Contrast; sb-test 211; 14 pages smoke-loaded headless, no errors). Deferred specimens per fold list (ClearSpace, DietAndHeat, StatusAlerts, SpiceLevel/Rating/Spinner/StepTracker rows) → follow-up pass after 2b–3b.
Ruling R61: px size/width tokens carry a `$extensions.pink-paprikaa.utility` marker in token JSON; utilitiesOf reads it — keeps R56's no-hand-list rule — cost if wrong: token JSON gains metadata; drop the marker and fall back to defaults.
Ledger: P5-C (carried fixes + T5 Type, T6 Spacing, T8 Motion) dispatched base 26ba97e; review P5-B in parallel
Review P5-B: R59 ✅ T3 ✅ T4 ✅ approved, 0 Critical/Important. Brand hard rules verified (Paprikaa ×2 a, no founder, pure veg/no egg, 2025).
Ruling R62: colour chips by token role (text-/bg-/border- derived from name) — carried with 3 minors to carried-fixes-P5-D.md (dispatched after P5-C, with P5-C review findings) — cost if wrong: some valid-but-odd chips hidden.
Task 3: complete (5b0005f..9fa3f5f, review clean) · Task 4: complete (..26ba97e, review clean)
P5-C: DONE_WITH_CONCERNS (c507f4f + 5b6517e carried fixes R60/R61/minors; 3e1471b T5 Type, c674d7f T6 Spacing + Shape page (R56 deviation), 163c7c1 T8 Motion; sb 314 incl 79 node checks, tokens 232, ui 465). Deferred: Spacing Rhythm (2c), Motion FormStates (3a Field).
Note: Shape page to merge into T7 Layout pages or delete when T7 runs. vitest.config.mts now 2 projects (browser + node catalogue.spec).
Ledger: review P5-C dispatched; P5-D fix dispatch follows its review. Foundations early run (R55) complete pending reviews.
Review P5-C: carried fixes all ADDRESSED; T5 ✅ T6 ✅ (Shape page accepted) T8 ✅; 1 Important — R61 spec forbids markers on unused primitive sizing tokens → padding chips for header/tabbar/hit.
Ruling R63: unused tokens may carry a marker; mark primitive size tokens by documented use — carried to P5-D (items 5–8) — cost if wrong: a few extra markers.
Note (for 2b implementers): catalogue.spec reads packages/ui/src live — a new px spacing token used only as size-/w-/h- needs an R61 marker or storybook:test goes red.
Task 5: complete (26ba97e..3e1471b) · Task 6: fix pending (P5-D) · Task 8: complete (..163c7c1)
Ledger: P5-D fixes ride with 2b batch E implementer (base a8cbad4)
P5-D: done inside 2b batch E dispatch (21cf1a2 R63 markers, 6ee9190 items 1–8). R65 + hit marker carried to 2b batch F.
Review P5-D: items 1–4, 6–8 ADDRESSED; item 5 Important — marker spec doesn't implement R63 for used non-size markers (dock-clearance ["bottom"] will fail when 3a lands) → 2b carried-fixes-G item 1. Note: DietMark uses text-veg → R65 covers.
Deferred plan 5 specimens (DiamondMotif, HeatScale, MarkLegibility rows) now unblocked → 2b carried-fixes-G item 4.
SLIM MODE. Remaining: T7, T9–T14 then T15 gauntlet. Plans frozen at f1a6c3e.
Ledger 2026-10-03: P5-E = T7 Layout + T9 Marketing foundations + T10 Website kit dispatched base c66c71d — foreground. Review of P5-E runs in parallel with P5-F (T11–T13).
P5-E: DONE_WITH_CONCERNS (db81a7e T7, a2c7d09 T9, cbb384b T10; sb 103/970). Rulings: DepthLadder from tokensWithPrefix; no compactActions below-lg; toast in-document; Cluster min-w-0.
Ledger: P5-F = T11 App kit + T12 Marketing kit + T13 RHF/Zod dispatched base cbb384b; review E (c66c71d..cbb384b) in parallel — foreground.
Review E: T7✅ T9✅ T10✅; 1 Important (nested booking/menu dialogs @ website-kit.tsx:79); Minors → T15 wave.
P5-F: DONE (8a6a58c T11, 4cc5243 T12, 463018d T13; sb 107/989).
Ledger: T14 docs + carried E Important dispatched base 463018d; review F (cbb384b..463018d) in parallel — foreground.
Review F: T11✅ T12✅ T13✅ Approve; Minors → T15 wave.
T14: DONE_WITH_CONCERNS (4b7cd58 drawer/booking, 5b9147a docs; sb 107/989).
Ledger: T15 gauntlet + whole-branch review (c66c71d..HEAD) + T14 review in parallel — foreground; then ONE fix wave.
T15 gauntlet (pre-wave, 5b9147a): run-many 12 projects; tokens 288; ui 108/1619; storybook 107/989; format/sync/founder clean.
Review T14: ✅ + Important fix ✅ Approve; Minors → wave.
P5 whole-branch: With fixes; 2 Important (ItemSheet frame, Guests Field) + minors.
T15 fix wave: complete (21f4185, 6301784; ui 1620; sb 989/107).
P5 remaining work: complete. HEAD 6301784.
Ruling R121: DepthLadder names from tokensWithPrefix("shadow-","primitive") including shadow-inset — cost if wrong: extra chip.
Ruling R122: no compactActions; drawer covers below-lg — cost if wrong: 360 overflow vs a compact row.
Ruling R123: toast play is in-document (pop starts opacity 0) — cost if wrong: flake.
Ruling R124: Cluster cards min-w-0 not min-w-50 — cost if wrong: layout specimen width.
Ruling R125: T13 shouldFocusError false; empty submit focuses [name=name] — cost if wrong: RHF default focus.
Ruling R126: living founder check is guard:founder exit 0 — cost if wrong: raw grep on the ban sentence.
Ruling R127: QuantityStepper takes Field control a11y props; stepper min 1 so KeyboardOnly +1×5 from 10 hits schema 15 — cost if wrong: guests a11y or the play.
RESUME HERE: all remaining slim tasks done; do not push.
