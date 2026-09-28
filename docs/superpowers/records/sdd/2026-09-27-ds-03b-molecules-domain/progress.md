# SDD ledger — plan: docs/superpowers/plans/2026-09-27-ds-03b-molecules-domain.md
Spec: docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md. Contracts: docs/superpowers/plans/2026-09-27-ds-00-contracts.md.
Carried rulings: R13, R15, R19/R25, R42, R43 (Task 0 fold-list overlay), R44, R46–R48, R51 (pipeline review, fixes fold into next batch), R61/R63/R65 (docs-kit markers/chips; catalogue.spec reads packages/ui/src live), R66, R72/R73, R75 (nothing imports a layout — layouts are the top tier), R77 (storybook:test in every gate), R79 (blank labels fall back), R82 (overlays restore focus on close), R83 (heading via createElement(headingTag(level))), R86, R87.
Known traps: lower-case commit subjects (commitlint); OnSurfacesStory name clash with the OnSurfaces import; floor360 viewport via globals; sr-only text over Icon labels when textContent matters; font-regular not font-normal; plan-doc re-sort commits; TS2322 narrow cast for  props.
Pure-veg brand: nothing non-veg, not even egg — MenuItemRow/MenuItemCard/DietMark usage is veg-only. "Pink Paprikaa" two a's. No founder identity.
Plan 5 hand-offs: Company details FactList → KeyValueList (T13; remap article→md, narrow→lg); doc-table.tsx → Table (T20).
Batches: A=T0+T1 · B=T2–T4 · C=T5–T7 · D=T8–T10 · E=T11–T13 · F=T14–T17 · G=T18–T20 · H=T21 parity. 3a's final fix wave (if any) rides in B (R74 precedent).
Ledger: A (T0 + T1 MenuItemRow) dispatched base a1b3112
Ledger: batch B carries 3a final-fix-wave.md (…/03a…/final-fix-wave.md, items 1–16) FIRST.
Batch A: DONE_WITH_CONCERNS (307c93e T1 MenuItemRow, 198ef93 re-sort; T0 fold list 7 items + pre-flight, no commit; ui 1101, sb 637, tokens 272).
Ruling R94: struck-price hidden word is lower-case "was" everywhere (PriceTag's), T10/T16 follow — fold item 8 — cost if wrong: SR reads "was" either way.
Re-batch (3a fix wave is 16 items): B = 3a final-fix-wave + T2 · C = T3–T5 · D = T6–T8 · E = T9–T11 · F = T12–T14 · G = T15–T17 · H = T18–T20 · I = T21 parity.
Task 0: complete · Task 1: pending review · Ledger: B dispatched base 198ef93; review A in parallel
Review A: T0 ✅ (Rating 5.0, R61 T8/T9/T20, ToggleGroup roles verified) T1 ✅ approved; veg-only, R83, floor360, rupees-via-utils hold. Fold item 9 added (plan-doc re-sort). InCart a11y → carried-fixes-C.md.
Task 1: complete (..198ef93)
Batch B: DONE_WITH_CONCERNS (3a fix wave: 4bb3050 reduced-motion Accordion, 9ee1e3a R89 brand-surface marks, 5ddf262 R90 Select min-w, 2183c5f R91 Toast focus via shared lib hook, bf640fd minors 5–16; af3da55 T2 MenuItemCard; ui 1135, sb 648, tokens 272).
Note: StepTracker upcoming diamond on ink stays light grey (visible on dark; R89 was brand-only).
Ledger: C (carried-fixes-C.md, then T3 OutletCard, T4 ReviewCard, T5 LoyaltyCard) dispatched base af3da55; review B in parallel
Review B: 3a fix wave 16/16 ADDRESSED (Snackbar identical after the shared use-focus-return hook; Toast restore can't misfire) → Plan 3a COMPLETE. T2 MenuItemCard ✅ approved.
Ruling R95: Select min width 128px (160 overflowed 2-up at 360) — carried-fixes-D.md with ink marker-off, MenuItemCard card focus ring, select test — cost if wrong: a slightly narrower floor.
Task 2: complete (..af3da55)
Batch C: DONE_WITH_CONCERNS (bc99875 InCart name; 333dd3a T3 OutletCard, 04d45dc T4 ReviewCard, 9ef8b3b T5 LoyaltyCard; ui 1174, sb 668, tokens 272).
Ruling R96: packages/ui never imports @pink-paprikaa-web/content (module boundary holds); ui stories use prop fixtures (address fixture = prefix of the brand fact); real brand facts reach components through apps — cost if wrong: fixture drift from brand facts in stories only.
Ledger: D (carried-fixes-D.md 1–4, then T6 FilterBar, T7 LogoLockup, T8 OfferSeal) dispatched base 9ef8b3b; review C in parallel
Review C: InCart ✅; T3 ✅ T4 ✅ approved; T5 1 Important (plan-mandated): "Your a kulfi is on us." Brand rules + R96 hold.
Ruling R97: LoyaltyCard progressbar named "Visits" (valuetext carries "N of M") — cost if wrong: contract label wording differs.
Carried → carried-fixes-E.md (1 Important + 4 minors).
Task 3: complete (..333dd3a) · Task 4: complete (..04d45dc) · Task 5: fix pending (E)
Batch D: DONE_WITH_CONCERNS (9dea52e R95 Select 128 + 2-up play, 825a5ab ink marker-off, 10d38c2 MenuItemCard card ring, d2a1879 select test; 87df8b9 T6 FilterBar, e0ce52d T7 LogoLockup, ea3449d T8 OfferSeal, 8cd7430 re-sort; ui 1211, sb 690, tokens 277).
Ruling R98: LogoLockup clear space = height of the FIRST "P" ("Pink", width ÷ 5.4) → p-9/p-11/p-13/p-17; brand text says only "the height of the 'P'" — OWNER may choose the "Paprikaa" P (p-12/15/17/22) — cost if wrong: four padding values.
Ruling R99: FilterBar stays as briefed (no name/onBlur — it's a filter, not a form value control) — cost if wrong: add when a form needs it.
Ledger: E (carried-fixes-E.md 1–5, then T9 CouponTicket, T10 ChoiceCardGroup, T11 CheckCard) dispatched base 8cd7430; review D in parallel
Review D: carried D fixes 1–4 ADDRESSED; T6 ✅ T7 ✅ T8 ✅ approved, 0 Critical/Important (Radix ToggleGroup verified in node_modules).
Ruling R100: FilterBar keeps Radix's arrows-move / Space-selects (documented) rather than select-on-focus — cost if wrong: differs from strict ARIA radio pattern.
Carried → carried-fixes-F.md (OfferSeal overhang + note size, FilterBar pinned trailing, badge tone). OutletCard focus ring already in E.
Task 6: complete (..87df8b9) · Task 7: complete (..e0ce52d) · Task 8: complete (..8cd7430)
Batch E: DONE_WITH_CONCERNS (fda4890 LoyaltyCard kulfi/R97/stamps, 9db8bde shared lib/stretched-link ring via data-stretched-link; cdd57b7 T9 CouponTicket + 55ee930 timer fix, 3e89f77 T10 ChoiceCardGroup, a164d7d T11 CheckCard, 2 re-sorts; ui 1253, sb 716, tokens 281).
Ruling R101: ChoiceCardGroup gains status/message (beyond contract §6, additive) reusing FieldMessage/RadioGroup; "status needs message" enforced at render (typed union broke story typing) — cost if wrong: a misuse is caught at runtime, not compile time.
Ruling R102: CheckCard gains isInvalid (like Checkbox); a Field description joins the card's own (not replaces) — cost if wrong: longer description.
Note: second contract-banned `git checkout -p` slip (no input, nothing lost) — process risk; contract already bans it.
Task 5: complete (fix fda4890) · Task 3: complete (fix 9db8bde)
Ledger: F (carried-fixes-F.md 1–5, then T12 ChipGroup, T13 KeyValueList + plan-5 Company details FactList swap, T14 Steps) dispatched base a164d7d; review E in parallel
Review E: carried E1–E5 ADDRESSED; T9 ✅ T10 ✅ T11 ✅ approved, 0 Critical/Important; gate-forced deviations justified. Minors → carried-fixes-G.md.
Task 9: complete (..55ee930) · Task 10: complete (..6494bec) · Task 11: complete (..a164d7d)
Batch F: DONE_WITH_CONCERNS (a45f1b6 OfferSeal clear margin + note, d8febc5 FilterBar pinned, 0d72861 LogoLockup Badge story; 00497d8 T12 ChipGroup, 0a38405 T13 KeyValueList, d32546e plan-5 Company details → KeyValueList, f2198b0 T14 Steps, e19b2b3 re-sort; ui 1288, sb 741, tokens 281).
Note: the "article→md, narrow→lg" remap belongs to T20 Table (doc-table.tsx hand-off), not KeyValueList (keyWidth sm|md). Company details mono font → carried-fixes-G item 7.
Ledger: G (carried-fixes-G.md 1–7, then T15 FeatureItem, T16 PricingCard, T17 LinkCard) dispatched base e19b2b3; review F in parallel
Review F: carried F1–F5 ADDRESSED (offer-seal-clear used only as m- → no R61 marker); T12 ✅ T13 ✅ Company details ✅ T14 ✅ approved, 0 Critical/Important. Minors → carried-fixes-H.md.
Task 12: complete (..00497d8) · Task 13: complete (..0a38405) · Task 14: complete (..e19b2b3)
OWNER 2026-09-28: stop after batch G completes; restart later. No further dispatch.
Batch G: DONE_WITH_CONCERNS (75a0b15 stretched-link via heading marker, 267e35f ChoiceCardGroup red+aria-invalid, 85ab97e coupon announce, 162272f stub scope, 41c99a1 Company details mono + xl play; 475d540 T15 FeatureItem, a9de0f7 T16 PricingCard, b6fda87 T17 LinkCard, 2 re-sorts; ui 1321, sb 758, tokens 281). LinkCard is a whole-card link (no stretched overlay); R44 new-tab announce added.
=== PAUSED BY OWNER 2026-09-28 ===
RESUME HERE: (1) dispatch review of batch G on W/review-e19b2b3..b6fda87.diff (generate with review-package e19b2b3 b6fda87) — carried items G1–G7 + T15–T17; (2) in parallel dispatch batch H = W/carried-fixes-H.md items 1–8 FIRST, then T18 StickyActionBar, T19 AnnouncementBar, T20 Table (+ plan-5 doc-table.tsx → Table hand-off, remap article→md / narrow→lg to Table minWidth); (3) batch I = T21 parity; (4) 3b final review; then plans 4 and the rest of 5 (Tasks 7, 9–15; Shape page merges into Layout T7).
Open owner decisions: danger-strong #B81E1E (R72); logo clear-space "P" (R98). stash@{0} is a lint-staged duplicate of d07a6ba (safe to drop by owner).
