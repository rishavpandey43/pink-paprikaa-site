# SDD ledger — plan: docs/superpowers/plans/2026-09-27-ds-03a-molecules-system.md
Spec: docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md. Contracts: docs/superpowers/plans/2026-09-27-ds-00-contracts.md.
Carried rulings: R13, R15, R19/R25, R42, R43 (Task 0 fold-list overlay), R44, R46, R47, R48, R51 (pipeline review), R52–R54/R64 (Select read-only), R57 (choice labels 15px), R61/R63/R65 (docs-kit markers + chips), R66, R70, R71 (no client focus handlers in layouts), R72 (danger-strong), R73.
Carried from 2b final review (must land in 3a):
- Field must keep "a status needs its message" for Input, Select AND Checkbox isInvalid (colour-only today).
- Caller-passed aria-invalid on choice controls must not override isInvalid (ChoiceControl spreads props after aria-invalid).
- Any control rendered inside the field box (SearchField, OtpInput) must be the box's DIRECT child (b2565db + has-[>:is(input,textarea,select):disabled]).
- field-control long selector repeated ~15× → consider @custom-variant field-disabled.
- Commit subjects lower-case (commitlint).
Plan 5 deferred specimens unblocked by 3a: Motion FormStates (Field, T2).
Batches: A=T0+T1 · B=T2 Field+T3 SearchField · C=T4 QuantityStepper+T5 OtpInput+T6 SlotPicker · D=T7 Alert+T8 Toast+T9 Snackbar · E=T10 EmptyState+T11 Tabs+T12 Breadcrumb+T13 Pagination · F=T14 SectionHeader+T15 Stat+T16 Accordion · G=T17 ListRow+T18 PriceSummary+T19 StepTracker · H=T20 parity. Plan-5 FormStates specimen rides in batch B (after Field). StepTracker row rides in G.
Ledger: A (T0 + T1) dispatched base a984709; 2c final fix wave (if any) rides in B (R74)
Ledger: batch B carries 2c final-fix-wave.md (…/02c-layouts/final-fix-wave.md, items 1–6) FIRST.
Batch A: DONE_WITH_CONCERNS (28a5d45 T0 fix choice aria-invalid, c333ebe T1 shared internals; fold list 17 items; ui 817, tokens 249).
Ruling R75: molecules may NOT import layouts (atomic-layering lint + plan tier rule win; controller dispatch was wrong) — fold item 17 — cost if wrong: none, lint enforces it.
Ruling R76: skip @custom-variant field-disabled refactor (no 3a task writes the selector) — YAGNI — cost if wrong: selector stays repeated ~15× in field-control.
Ruling R77: storybook:test (`pnpm nx run storybook:test`) is part of every batch gate from now on (R61 marker spec reads the library live).
Task 0: complete · Ledger: B (2c final-fix-wave.md 1–6, then T2 Field, T3 SearchField, then plan-5 Motion FormStates specimen) dispatched base c333ebe; review A in parallel
Ruling R75 (corrected): layerOrder atoms→molecules→organisms→layouts; layouts are top tier, nothing (molecules, organisms) imports a layout.
Review A: T0 ✅ (4 fold claims verified, all 2b carried items folded) T1 ✅ (byte-identical to brief) approved, 0 Critical/Important. Minors → carried-fixes-C.md.
Task 0–1: minor (deferred): aria-invalid precedence differs Input/Select vs choice controls (harmless under Field's true-only contract).
Task 1: complete (..c333ebe)
Batch B: DONE_WITH_CONCERNS (2c fix wave fad1dd7..901bed7; 8b3744a T2 Field + 581f0bc re-sort; 26be279 T3 SearchField; 2fabad0 plan-5 FormStates; ui 854, sb 508, tokens 249).
Ruling R78: Cluster scrollable rail keeps its documented ≥4px parent-padding requirement (story wraps in px-gutter) — cost if wrong: a caller placing a rail flush at a 360 viewport edge gets 4px page scroll.
Note: implementer ran `git checkout -p --` (contract-banned) by mistake; no input given, nothing discarded, verified — process slip recorded.
Ledger: C (carried-fixes-C.md 1–2, then T4 QuantityStepper, T5 OtpInput, T6 SlotPicker) dispatched base 2fabad0; review B in parallel
Review B: 2c fix wave 6/6 ADDRESSED (2c scoped re-review ✅ → Plan 2c COMPLETE). T2 Field ✅ T3 SearchField ✅ FormStates ✅ approved, 0 Critical/Important.
Task 2–3: minor (deferred): ControlModes play asserts only "differs" (pin text-subtle probe); form-states.mdx "(Field mutes its label)" in Message column; no clearLabel story.
Task 2: complete (..581f0bc) · Task 3: complete (..26be279)
Batch C: DONE_WITH_CONCERNS (eda52a8 field-message key, 03b7243 JSDoc; b0858f5 T4 QuantityStepper, 3750a25 T5 OtpInput, d07a6ba T6 SlotPicker, acaf1f3/374d96c re-sorts; ui 914, sb 530, tokens 253).
Ruling R79: blank stepper labels fall back to defaults (R48) — carried-fixes-D item 1.
Ruling R80: accept 2px border on a filled disabled OTP cell (fold item 6 classes) — cost if wrong: 1px visual mismatch vs disabled Input.
Note: lint-staged backup stash@{0} (5271974) = content of d07a6ba; left in place (not dropped — owner rule, never let work vanish).
Ledger: D (carried-fixes-D.md, then T7 Alert, T8 Toast+ToastProvider, T9 Snackbar) dispatched base 374d96c; review C in parallel
Review C: carried fixes 1–2 ADDRESSED; T4 ✅ T5 ✅ T6 ✅ approved, 0 Critical/Important. Minors (OTP invisible caret move, stepper focus loss at ends, SlotPicker controlled w/o handler) → carried-fixes-E.md.
Task 4: complete (..b0858f5) · Task 5: complete (..acaf1f3) · Task 6: complete (..374d96c)
Batch D: DONE_WITH_CONCERNS (2077071 R79; e0c93c6 T7 Alert, 24d5fdf T8 Toast+Provider, 5bb389a T9 Snackbar; 3 plan re-sorts; ui 972, sb 557, tokens 261; Toast SSR→hydrate clean).
Ruling R81: accept guarded no-op pointer-capture stubs in packages/ui/vitest.setup.ts (Radix Toast swipe in jsdom) — test-only — cost if wrong: none in product.
Ledger: E (carried-fixes-E.md 1–3, then T10 EmptyState, T11 Tabs, T12 Breadcrumb, T13 Pagination) dispatched base a335bb1; review D in parallel
Review D: R79 ✅; T7 ✅ T8 ✅ T9 ✅-with 1 Important (plan-mandated): Snackbar unmount-while-focused drops focus to <body>.
Ruling R82: fix it — restore focus to the pre-open element on close — carried-fixes-F.md item 1 (+ minors 2–5) — cost if wrong: none; a11y floor.
Task 7: complete (..e0c93c6) · Task 8: complete (..24d5fdf) · Task 9: fix pending (F)
Batch E: DONE_WITH_CONCERNS (aa32a7e OTP caret, ab58e11 stepper aria-disabled, 2ee0900 SlotPicker defaultChecked; 205e09c T10 EmptyState, 9c85a1e T11 Tabs, 4de5e34 T12 Breadcrumb, cd83cd9 T13 Pagination, 8f265a5 re-sort; ui 1014, sb 580, tokens 263).
Ruling R83: titled components render their heading via `createElement(headingTag(level), …)` (react-hooks/static-components rejects `const Heading = headingTag(level)`); no contract §1 change — cost if wrong: slightly less readable JSX.
Ruling R84: accept OTP select-all-then-type not replacing the code (caret pinned, R-fix) — Backspace clears — cost if wrong: minor UX.
Ledger: F (carried-fixes-F.md 1–5, then T14 SectionHeader, T15 Stat, T16 Accordion) dispatched base cd83cd9; review E in parallel
Review E: carried fixes 1–3 ADDRESSED; T10 ✅ T11 ✅ (Radix Tabs 1.1.21 keyboard verified) T12 ✅ T13 ✅ approved, 0 Critical/Important. Minors → carried-fixes-G.md.
Task 11: minor (deferred): isFullWidth long label overflows pill on very narrow card (fold-mandated).
Task 10: complete (..205e09c) · Task 11: complete (..8f265a5) · Task 12: complete (..4de5e34) · Task 13: complete (..cd83cd9) · carried E fixes closed
Batch F: DONE_WITH_CONCERNS (7de8596 R82 Snackbar focus restore, 7c4d988 barrel, 99aace8 swipe @utility toast-swipe-y, c0d65cd tests, bf52f11 Alert null action; 2ae9316 T14 SectionHeader, 47194e0 T15 Stat, 6c223ac T16 Accordion + 3 re-sorts; ui 1057, sb 601, tokens 263).
Ruling R85: Accordion keyboard toggle is native <summary>; Storybook userEvent can't trigger it — story play checks focusability; T20 parity verifies Enter/Space toggles with real Playwright keyboard — cost if wrong: an untested native behaviour.
Ruling R86: SectionHeader/Accordion keep story name `Surfaces` (no clash with OnSurfaces import; T20 expects id surfaces) — fold item 8 N/A.
Snackbar parent-controlled close focus restore → carried-fixes-G item 5.
Ledger: G (carried-fixes-G.md 1–5, then T17 ListRow, T18 PriceSummary, T19 StepTracker, then plan-5 StepTracker specimen row) dispatched base 079ae71; review F in parallel
Review F: carried fixes 1–5 ADDRESSED (R82 traced on every Radix close path); T14 ✅ T15 ✅ T16 ✅ approved, 0 Critical/Important.
Task 14–16 + fixes: minor (deferred → 3a final triage): snackbar swipe test doesn't focus the bar first; timer-close-with-focus untested; alert.test .mt-2.5 selector brittle; stat sub={false} renders empty span; accordion defaultOpen re-applies on change (doc it).
Task 9: complete (fix 7de8596) · Task 14: complete (..060e7dd) · Task 15: complete (..1117a1e) · Task 16: complete (..079ae71)
Batch G: DONE_WITH_CONCERNS (e7ae16b..a200f1b carried fixes 1–5; 89ff314 T17 ListRow, 415bdf8 T18 PriceSummary, fa5dc71 T19 StepTracker, 6871162 re-sort, ac135b0 plan-5 StepTracker row; ui 1088, sb 627, tokens 272 cold).
Ruling R87: ListRow keeps contract §5 (child link carries no title); tests/stories use `<a href>{/* comment */}</a>` to satisfy jsx-a11y/anchor-has-content — cost if wrong: consumer confusion; contract change later.
Ruling R88: plan-5 DiamondMotif StepTracker row uses the vertical tracker (the one that draws diamonds); Pattern prose reworded — cost if wrong: none.
Ledger: H (T20 parity + story test run + R85 Accordion real-keyboard check) dispatched base ac135b0; review G in parallel
Review G: carried fixes 1–5 ADDRESSED; T17 ✅ T18 ✅ T19 ✅ plan-5 row ✅ approved, 0 Critical/Important.
Task 17–19: minor (deferred → 3a final triage): ClosedByParent play can pass vacuously (assert dismiss has focus first); ListRow link name only proven in jsdom (Chromium play); CHECKOUT fixture step "Done" collides with sr-only state text (rename "Confirmed"); ListRow ref lands on wrapper (JSDoc).
Task 17: complete (..89ff314) · Task 18: complete (..415bdf8) · Task 19: complete (..6871162) · carried G fixes closed
Batch H: DONE_WITH_CONCERNS (aaa17c5 parity fixes: Pagination gap circle per card, Snackbar/Toast story frames; R85 Accordion real-keyboard ✅; R82 Snackbar Escape focus-return ✅; sb 627 first run).
Ruling R89: StepTracker markers on brand are invisible (pink on pink) — the dev-parity DROP assumed wrongly — add per-surface marker colour tokens (bar-token pattern) — 3a fix wave — cost if wrong: two tokens.
Ruling R90: Select gets an intrinsic min width (token) so a content-sized Field doesn't clip the placeholder — 3a fix wave (atom touch) — cost if wrong: a min width on narrow custom layouts.
Ruling R91: Toast restores focus on close like Snackbar (R82) instead of leaving an outlined empty region — 3a fix wave.
Ruling R92: Pagination gap follows the card (bordered circle) over the brief/dev — parity is against the card.
Ruling R93: batch H task review folded into the 3a final review (precedent R49/R68/R74); 3a fix wave rides in 3b batch B.
Task 20: complete pending final review.
