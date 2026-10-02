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
=== PAUSED BY OWNER 2026-09-28 === (RESUMED 2026-10-01)
RESUME HERE: (1) dispatch review of batch G on W/review-e19b2b3..b6fda87.diff (generate with review-package e19b2b3 b6fda87) — carried items G1–G7 + T15–T17; (2) in parallel dispatch batch H = W/carried-fixes-H.md items 1–8 FIRST, then T18 StickyActionBar, T19 AnnouncementBar, T20 Table (+ plan-5 doc-table.tsx → Table hand-off, remap article→md / narrow→lg to Table minWidth); (3) batch I = T21 parity; (4) 3b final review; then plans 4 and the rest of 5 (Tasks 7, 9–15; Shape page merges into Layout T7).
Open owner decisions: danger-strong #B81E1E (R72); logo clear-space "P" (R98). stash@{0} is a lint-staged duplicate of d07a6ba (safe to drop by owner).
Resumed 2026-10-01: Ledger: H (carried-fixes-H.md 1–8, then T18 StickyActionBar, T19 AnnouncementBar, T20 Table + plan-5 doc-table hand-off) dispatched base f1a6fd9; review G (e19b2b3..b6fda87) in parallel
Review G: carried G1–G7 ADDRESSED; T15 ✅ T16 ✅ (LongName unbroken-word deviation endorsed) T17 ✅ approved, 0 Critical/Important. Minor → carried-fixes-I.md (LinkCard asChild card-level target).
Task 15: complete (..a20a1ff) · Task 16: complete (..e2354ef) · Task 17: complete (..b6fda87)
=== STOPPED BY OWNER 2026-10-02 === Batch H implementer killed mid-run; tree clean. Commits landed f1a6fd9..f580554 (H1–H8 fixes, T18 2ffadf3, T19 5d65f51, T20 0623386, doc-table hand-off f580554). UNVERIFIED: no review, final gates unconfirmed.
RESUME HERE: (1) confirm/complete W/batch-H-report.md + gates on f580554; (2) review H (review-package f1a6fd9 HEAD); (3) batch I = carried-fixes-I.md then T21 parity; (4) 3b final review.
Resumed 2026-10-02: tree clean, stash@{0} is the old 09-28 backup. Dispatched recovery agent: completeness audit + cold gates + batch-H-report.md on f580554. Then review H, then batch I.
Batch H: DONE_WITH_CONCERNS (recovered after interruption: 8836939 99df651 cf017ac f485d43 5a7fcd2 04da7d8 eaadd48 c439433 fixes H1–H8; 2ffadf3 T18 StickyActionBar, 5d65f51 T19 AnnouncementBar, 0623386 T20 Table, f580554 doc-table hand-off, 2 re-sorts; e796d35 act() test fix; all gates cold green; ui 1352, sb 776, tokens 284). H6 already held (test-only guard).
Concern for 3b final review: steps.tsx eslint-disable jsx-a11y/no-redundant-roles (only one in packages/ui) — config-level allow of role="list" on ol/ul would remove it.
Ledger: I (carried-fixes-I.md 1, then T21 parity) dispatched base e796d35; review H (f1a6fd9..e796d35) in parallel
Review H: carried H1–H8 ADDRESSED (H6 regression-guard only, verified no rest spread); T18 ✅ T19 ✅ T20 ✅ hand-off ✅ approved, 0 Critical/Important. 6 minors → carried-fixes-final.md. Pre-existing e2e playwright/no-conditional-in-test warnings (out of scope).
Ruling R103: docs tables adopt the library Table look (card frame, pink header, narrower min widths) — the hand-off's point is docs dogfood the DS; "visually equivalent" = no data/legibility loss, not pixel-identical; verified by screenshots in batch I (message sent) — cost if wrong: restyle two docs-kit tables.
Task 18: complete (..38aed58) · Task 19: complete (..5d65f51) · Task 20: complete (..e796d35)
=== PAUSED BY OWNER 2026-10-02 (batch I) === Batch I implementer stopped mid-run. Landed: b341939 (I1 LinkCard card-level target), 74673ee (ChoiceCardGroup meta badge at 360). Uncommitted WIP in tree: check-card.tsx disabled grey, menu-item-row.stories.tsx arg resets — backed up to W/batch-I-uncommitted-wip.diff. Gates NOT run. Status in W/batch-I-report.md.
RESUME HERE: (1) finish batch I per W/batch-I-report.md "Resume" (commit/test WIP, rest of T21 sweep + Docs tables row R103, gates); (2) review I (e796d35..HEAD); (3) 3b final review + one fix wave with carried-fixes-final.md 1–6; then plans 4 and rest of 5.
Resumed 2026-10-02 20:30: tree = 74673ee + 2 WIP files (matches backup diff). Ledger: I-resume dispatched (WIP verify+commit, T21 sweep all 20 + Docs tables R103, record commit, gates). Screenshots → W/parity/ (git-ignored, survives interruption) instead of /tmp.
Batch I: DONE_WITH_CONCERNS (b30b676 CheckCard disabled = atom ink-200 + has-disabled:shadow-none, 8706bb4 MenuItemRow stories, bd667fa 59286d1 d9f9bad bed9b86 1add859 2e6fe64 9732329 375789d e2c8876 parity fixes, 6ca22f3 record commit; all 20 + Docs tables at 360/1280; ui 1354, sb 778, tokens 284; guard clean). R103 Docs tables PASS (compared vs f580554's deleted DocTable; dev path never existed).
Ruling R104: parity concerns 3/4/5/8 (ReviewCard Google name/link row, ChoiceCardGroup DecideList row metrics + Platters/Service price slot, KeyValueList per-usage typography) ACCEPTED — same class as the brief's pre-approved "one anatomy" rows (ReviewCard Google, ChoiceCardGroup, PricingCard) — cost if wrong: a variant/option added at page build (plan 4).
Carried → carried-fixes-final.md items 7–10 (concerns 1, 6, 7, 10). Concern 9 (Table header bottom / body top alignment is plan Task 20 code) → OWNER question before the final fix wave.
Ledger: review I dispatched on W/review-e796d35..6ca22f3.diff
Review I: I1 ✅, T21 ✅ approved, 0 Critical/Important (component-level fixes proven by computed-style/geometry plays; w-90→max-w-90 frames are frame faults, not masking). ⚠️ record body verified by controller: all 13 fix SHAs listed. Minors → carried-fixes-final.md 11–12.
Task 21: complete (..6ca22f3) · Carried I1: complete (b341939). ALL 3b TASKS COMPLETE.
Ledger: 3b final whole-branch review dispatched (a1b3112..6ca22f3)
3b final review (W/final-review-3b.md): With fixes — 0 Critical, 3 Important (I1 focus rings clipped by overflow: CouponTicket copy button, FilterBar scroll chips; I2 ChoiceCardGroup badge/meta not in the accessible description; I3 ChipGroup no focusable ref for Controller), 10 Minor; carried 1–12 all kept (6 amended, 8 → Important with I2).
OWNER 2026-10-02 (R105): Table alignment stays as the plan wrote it (header bottom, body top) — reviewer's top/middle option declined — cost if wrong: price-list name sits ~10px above its button.
OWNER 2026-10-02 (R106): FilterBar name/onBlur drop (R99) is documented — add plan deviation 19, amend spec D17 and contract §6 — cost if wrong: doc churn only.
OWNER 2026-10-02 (R107): fix wave includes Minor 1 (shared lib struck price, one colour, one guard; Plan 4 QuotePanel wasLabel lower-case). AUTHORING.md update (Minor 6) and the library-wide focus audit play are OUT of this wave.
Controller: carried 10 (docs pages at 360) fixed now in the docs-kit prose wrapper. Plan 4/5 Task 0 reconciliation notes (Rating "5.0 out of 5", ChipGroup field.ref, Table tabIndex config, Plan 5 RHF ChipGroup story) → recorded for Plan 4/5 Task 0, not code here.
Ledger: final fix wave dispatched base 6ca22f3 (W/final-fix-wave-3b.md)
OWNER feedback 2026-10-02 23:57 (items 1–21 landed 46e6482..eed7609, gates running): item 22 ChoiceCardGroup badge wrapper overflows a 150px tile (needs `flex min-w-0 max-w-full` + badge-width play); item 23 docs-kit prose.tsx scroll regions all named "Scrollable table" (name from caption / heading). Added to W/final-fix-wave-3b.md; re-review MUST verify both — W/final-fix-wave-3b-review-checklist.md. Sent to the same fix agent once its gate run returns.
Fix wave items 1–21: DONE_WITH_CONCERNS (46e6482..eed7609, 23 commits; ui 1376, sb 787; gates cold green; guard clean). Concerns: 1 → item 24 (360 test geometry), 5 → item 25; 2, 3 accepted; 4 → Plan 4 Task 0 (handoff header doubles "closes in").
Ledger: fix agent resumed with items 22–25 (base eed7609).
Fix wave items 22–25: DONE (0b0cf51 badge bounded by tile, f91bdf2 docs table region names, e22a8e6 storybook:test canvas gutter — no play newly failed, c307865 restoreAllMocks; ui 1376, sb 792, tokens 284; gates cold green; guard clean). Item 22: long badge in a 150px tile truncates (Badge design; owner's feedback asked for truncation; wording kept in accessible description).
Ledger: fix-wave re-review dispatched on W/review-6ca22f3..c307865.diff against W/final-fix-wave-3b-review-checklist.md
Re-review (W/final-fix-wave-3b-rereview.md): With fixes — 0 Critical, 1 Important (badge truncates at 360; play reads the Badge root so cannot fail), 3 Minor. Items 1–21, 23–25 ✅; 5 cross-cutting risks clean.
OWNER 2026-10-03 (R108): ChoiceCardGroup badge WRAPS (full offer always visible); M1 + M2 fixed in the same pass; M3 accepted.
Ledger: fix agent resumed with items 26–28 (base c307865).
Items 26–28: DONE_WITH_CONCERNS (a470b8d badge wraps, wrap-anywhere; fa1b617 unique docs region names; 180db64 FilterBar gutter JSDoc; ui 1376, sb 793; gates cold green). Concern: "RECOMMENDATION" breaks mid-word at 360.
OWNER 2026-10-03 (R109): keep wrap-anywhere as safety net; fixture badge copy "Our pick". Ledger: fix agent resumed with item 29 (base 180db64).
Item 29: DONE (172c9da "Our pick" + mid-word-break play, RED on 180db64; ui 1376, sb 793; gates cold green; guard clean). Description-text "Our recommendation" left (wraps at spaces; outside R109).
Ledger: re-review of items 26–29 (c307865..172c9da) dispatched to the same reviewer.
Re-review 2 (26–29): Plan 3b ready to merge — YES. 0 Critical, 0 Important, 1 optional Minor (150px-tile story lacks the mid-word play) → Plan 4 Task 0 list. All checklist boxes ✅.
Final fix wave: complete (6ca22f3..172c9da, 31 commits, items 1–29; ui 1376, sb 793, tokens 284; gates cold green; guard clean).
=== PLAN 3b COMPLETE 2026-10-03 (a1b3112..172c9da) ===
Plan 4 / Plan 5 Task 0 reconciliation list (from final review + waves): Rating names "5.0 out of 5" (ds-04:2039); ChipGroup now has ref → pass field.ref; Table scroll wrapper needs no no-noninteractive-tabindex config (ds-04:230); Plan 5 Task 13 RHF story must use ChipGroup's own status/message, not Field (ds-05:7300-7336); Plan 4 handoff header doubles "closes in" (omit countdownLabel when the message leads in); promote ringClippers to lib if a third copy appears; optional mid-word play on the 150px-tile story. Open owner decisions still: R72 danger-strong #B81E1E, R98 logo clear-space "P".
NEXT: Plan 4 (organisms) and the rest of Plan 5 (Tasks 7, 9–15; Shape page merges into Layout T7).
