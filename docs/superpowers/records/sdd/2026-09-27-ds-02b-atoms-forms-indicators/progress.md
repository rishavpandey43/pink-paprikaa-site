# SDD ledger — plan: docs/superpowers/plans/2026-09-27-ds-02b-atoms-forms-indicators.md
Spec: docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md. Contracts: docs/superpowers/plans/2026-09-27-ds-00-contracts.md (§0.0 dev parity).
Carried from Plan 2a ledger: R13 (optional props | undefined), R19/R25 (symbol mask var, no data URI), R35, R36/R44 (external links announce), R41, R42 (batch 3–4 per dispatch, one review per batch, re-review only on Critical/Important), R43 (Task 0 writes a fold-list overlay, never patches the plan), R46 (stories may import ../../assets/*), R47 (radius.diamond in primitive/shape.json), R48 (blank label = no label), R50 routes (see plan's "routed from Plan 2a" amendments).
Ruling R51 (controller, owner 2026-09-28 "non-stop 2b→5", RCA: serial waits dominated): pipeline — review batch N runs while implementer N+1 works; Critical/Important findings from review N are folded into batch N+2's dispatch (or a dedicated fix dispatch if nothing is running); implementers never run in parallel — why: removes reviewer latency from the critical path — cost if wrong: a fix lands one batch later, so batch N+1 may build on a defect for one batch.
Batches: A=T0+T1 · B=T2–T3 · C=T4–T6 · D=T7–T10 · E=T11–T14 · F=T15–T16 · G=T17 parity.
Ledger: A dispatched base dcd18d8
Batch A: DONE_WITH_CONCERNS (613fd7f Task 1; Task 0 no commit — fold list 10 items + pre-flight table, 4 conflicts folded). Task 1 also took routed: shadow @utility guard spec + shadow-focus-ring @utility, R41 over src/lib/**.
Ruling R52: read-only Select = disabled trigger + hidden input for native posts; drop the claim "react-hook-form reads it" — RHF omits disabled fields, but a read-only field's value is caller-owned (defaultValues/setValue), so RHF already has it — cost if wrong: an RHF form expecting the read-only value from handleSubmit must merge it from its own defaults.
Note: R21 field text 16px (sm 14→16, md/lg 15→16) is intentional — Task 17 parity lists it.
Task 0: complete (no commit, overlay written)
Ledger: B (T2 Input, T3 Select) dispatched base 613fd7f; review A dispatched in parallel (R51)
Agents: B impl a8f7b7118fd4bd34e; review A a7dcc856029777ba1. Shared contracts: .superpowers/sdd/implementer-contract.md, reviewer-contract.md
Review A: T0 ✅ T1 ✅ approved, 0 Critical/Important.
Task 1: minor (deferred): styles.spec.ts:18-24 it.each([]) passes vacuously — add length>0 assertion; :51-53 exact-format string match brittle.
Task 1: minor (deferred): atomic-layering.js:81-86 lib block doesn't ban ../molecules or non-Icon atoms (indirect layering hole); test title at .test.mjs:87 overstates "Icon atom".
Task 1: minor (deferred): index.ts:25 reveal-observer out of path order (pre-existing).
Task 1: complete (commits dcd18d8..613fd7f, review clean)
Batch B: DONE_WITH_CONCERNS (021aa79 Input+field box, 6e8964f plan class re-sort, fc566d1 Select; ui 425, tokens 190, sb-test 151).
Ruling R53: read-only Select renders the hidden input only when not disabled — disabled controls post nothing, same as native — cost if wrong: disabled+readOnly Select drops its value from a native post (revert = one condition).
Ledger: C (T4 Checkbox, T5 Radio, T6 Switch) dispatched base fc566d1; review B in parallel (R51)
Review B: T2 ✅ approved; T3 1 Important (plan-mandated): read-only Select painted disabled (~2:1), fails "locked but readable".
Ruling R54: fix it (spec a11y floor beats the plan's disabled rendering) — carried into batch D per R51 (W/carried-fixes-D.md), with minors: placeholder posts name="", retitle/strengthen "cannot change" test — cost if wrong: none; batch C doesn't build on Select.
Task 2: complete (commits 613fd7f..021aa79, review clean)
Task 3: fix pending (carried to D)
Ruling R55 (owner 2026-09-28: Storybook lacks basic foundations): after batch C, run Plan 5 Tasks 1–6 + 8 (foundations) before 2b batch D; carried fix R54 moves with batch D — cost if wrong: plan 5 foundation code may need a touch-up when plans 2b–4 land.
Ruling R56: every foundation specimen shows copyable utility class(es) + CSS var (plan 5 amendment) — owner request.
Batch C: DONE_WITH_CONCERNS (9cfa8a8 Checkbox, a7b4163 Radio, 551afed Switch, +2 plan re-sorts; ui 465, sb-test 175 cold).
Ruling R57: R21 16px covers field value text only (iOS focus-zoom); choice labels stay text-control 15px — cost if wrong: one value in control.json.
Ruling R58: drop indeterminate Checkbox (contract delta P1) — not in the DS Checkbox.d.ts, no plan 3–5 consumer — cost if wrong: add a `checked="indeterminate"` state later.
Ledger: review C dispatched; Plan 5 foundations (R55) P5-A dispatched base 542f891. Batch D (with carried-fixes-D.md) follows the foundations.
Review C: T4 ✅ T5 ✅ T6 ✅ approved, 0 Critical/Important. Minors 1–2 (radio checked ring in group error; status error w/o message) carried to D (carried-fixes-D.md items 4–5).
Task 4-6: minor (deferred): disabled+invalid choice shows red border on grey; radio ring transition-all vs transition-control.
Note (cross-plan): ChoiceControl spreads caller props after aria-invalid — when Field lands, confirm Field-supplied aria-invalid doesn't override isInvalid.
Task 4: complete (commits fc566d1..9cfa8a8, review clean) · Task 5: complete (..a7b4163) · Task 6: complete (..551afed)
Ledger: D (carried-fixes-D.md items 1–5, then T7 Slider, T8 Spinner, T9 Skeleton, T10 ProgressBar) dispatched base 163c7c1
Batch D: DONE_WITH_CONCERNS (254b35d Select fixes R54 + 53191f6 Radio fixes; d850c29 Slider, ea7532c Spinner, 68970de Skeleton, 526a8aa ProgressBar, a8cbad4 plan re-sort; ui 511, sb 339 first run).
Ruling R64: disabled + readOnly Select shows chevron (disabled wins), no lock — consistent with R53 — cost if wrong: one flag in field-control.
Ledger: E = P5-D Storybook fixes (W5/carried-fixes-P5-D.md, items 1–8) FIRST, then 2b T11 Rating, T12 SpiceLevel, T13 DietMark, T14 PriceTag — one implementer (R51: never two in parallel); review D in parallel
Review D: carried fixes 1–5 ADDRESSED (computed-colour proofs); T7 ✅ T8 ✅ T9 ✅ T10 ✅ approved, 0 Critical/Important. Minors 1,2,6,7,8 → carried-fixes-F.md.
Task 7-10: minor (deferred): radio message accepts ""/false; read-only Select w/o value posts nothing; read-only Select in disabled fieldset renders readable.
Note (→ plan 3a): Field must keep "a status needs its message" for Input/Select.
Task 3: complete (fixes 254b35d) · Task 5: complete (fix 53191f6) · Task 7–10: complete (163c7c1..a8cbad4, review clean)
Batch E: DONE_WITH_CONCERNS (14d10a4 Rating+BrandDiamond, b45c3a3 SpiceLevel, fe647de DietMark veg-only, b896a1a PriceTag, 69dd905/4e42d43 re-sorts; cold run ui 576, sb 378, tokens 234).
Ruling R65: colour chips = role default ∪ library-used classes (R62 hid text-status-*) — carried to F item 5 — cost if wrong: a few extra chips.
Ledger: F (carried-fixes-F.md 1–6, then T15 Tooltip, T16 Countdown) dispatched base 4e42d43; review E + P5-D in parallel (one reviewer)
Review E: T11 ✅ T12 ✅ T13 ✅ T14 ✅ approved (brand hard rules pass; Rating OnSurfacesStory justified).
Task 11: minor → carried-fixes-G item 3. Task 11–14: complete (a8cbad4..4e42d43, review clean)
Ledger: batch G = carried-fixes-G.md 1–4, then T17 parity.
Batch F: DONE_WITH_CONCERNS (3b5d6e2 Spinner sr label, e500c60 read-only Select status border, 6fda7cd ProgressBar OnSurfaces, ca90de6 test tightening, 7606082 R65 chips + hit min-h, e550f8e Tooltip, ea5d76b Tooltip blank label, 137ae96 Countdown; ui 605, sb 396, tokens 234 cold).
Ruling R66: accept the ~200KB raw-source docs chunk (Storybook only, never shipped) — cost if wrong: slower Storybook docs load; a Vite virtual-module plugin can ship only the used-class set later.
Note → T17: Countdown dark pill uses a surface-invariant colour (ink on ink on an ink section); Tooltip fades without slide (briefed).
Ledger: G (carried-fixes-G.md 1–4, then T17 parity) dispatched base 137ae96; review F in parallel
Review F: carried fixes 1–6 ADDRESSED; T15 ✅ T16 ✅ approved (Radix 1.2.16 deviation verified in dist). 0 Critical/Important.
Task 15–16: minor (deferred → 2b final review triage): tooltip long-hint play near self-fulfilling (add scrollWidth check); radio danger-probe duplicated; library-source glob counts lib/story-surfaces.tsx (add !**/story-*.tsx); spinner aria-labelledby silently outranks a passed aria-label.
Task 15: complete (4e42d43..ea5d76b) · Task 16: complete (..137ae96) · Task 1 minors, carried-fix items: all closed
Batch G: DONE_WITH_CONCERNS (196bcd3 R63 spec, 205c51f shadow-inset desc, f2f343b Rating round+count, fa9b55b plan-5 specimens incl DietAndHeat, b2565db field box has-[>:disabled] (Select placeholder option greyed every Select — parity-found), 9970d1c Tooltip sides wrap; ui 610, sb 403, tokens 234 cold).
Ruling R67: OnSurfaces stories — Checkbox/Radio/Switch drop the brand row (no on-brand variants, documented "not on brand ground"); ProgressBar brand row uses tone="inverse" — cost if wrong: owner may later want designed on-brand choice controls.
Note → plan 3a fold list: after b2565db, any control inside the field box (SearchField, OtpInput) must be its DIRECT child for the disabled look.
Ruling R68: batch G's task review folded into the 2b final whole-branch review (precedent R49); final review also covers the early plan-5 foundations (R55) in the same range — cost if wrong: less focused attention on T17's fixes.
Task 17: complete pending final review. Final review dispatched: range dcd18d8..9970d1c
Final review 2b (+ early plan 5): READY WITH FIXES — 0 Critical, 3 Important (trailing disabled button greys Input; radio status text fails contrast on brand/ink; R67 not applied). Batch G ✅ (task review per R68). R51–R68 hold except R67 (unapplied).
Correction: Task 1 minors were NOT closed (no commit after 613fd7f touched styles.spec/atomic-layering/barrel) — now in final-fix-wave.md items 7, 11, 12.
Final fix wave: W/final-fix-wave.md → rides in 2c batch B (R69).
Task 17: complete (137ae96..9970d1c, final review ✅)
Carried to plan 3a: caller aria-invalid must not override isInvalid on choice controls; controls inside the field box must be direct children; "status needs message" covers Checkbox isInvalid too.
Carried to plan 5 later run: StepTracker row, Spacing Rhythm, Motion FormStates, FactList keyWidth, CompanyDetails xl, merge Shape page into Layout.
Ride-along (any time): disabled+invalid red on grey; radio transition-all; read-only Select no-value posts nothing (document); read-only Select in disabled fieldset; tooltip long-hint scrollWidth; radio danger probe dup.
2b final fix wave: done in 2c batch B (9d8eada..2644e71); under review in 2c review B.
Final fix wave re-review (in 2c review B): all 12 ADDRESSED, no new breakage.
Plan 2b: COMPLETE (dcd18d8..2644e71). Deferred ride-alongs listed above. Archive + commit at next idle gap (no implementer running).
Final: minor (deferred): field-control long selector repeated ~15× → @custom-variant field-disabled; library-source.spec sentinel could pass vacuously.
