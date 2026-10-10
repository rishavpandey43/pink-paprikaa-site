# SDD ledger — plan: docs/superpowers/plans/2026-09-27-ds-02a-atoms-core.md
Spec: docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md. Contracts: docs/superpowers/plans/2026-09-27-ds-00-contracts.md (§0.0 dev parity).
Carried from Plan 1 ledger: R13, R15, R19, R25, R27 (dev parity), R28 (never delete; archive to docs/superpowers/records/sdd/, exclude .gitignore), R35 (ImageSlot native div props), R36 (Link external sr text), R41 (lint: self-package import + ../../../src/index barrel → this plan Task 1), final review routing (pattern-tile-*/pattern-opacity-* twMerge classGroups → this plan), M7 (never max-w-prose).
Task 0: dispatched (base 5de283e) — reconcile + fold amendments/routed rulings into task code + pre-flight scan table (preflight.md)
Ruling R42 (OWNER 2026-09-28: too many tokens/time): batch 3–4 atoms per implementer dispatch, one review per batch, re-review only on Critical/Important, archive once per plan, terse status.
Task 0: previous dispatch lost (no report, no commits). Re-run.
Ruling R43: Task 0 does NOT patch the 308KB plan file; task-0-fold-list.md items 1–11 + plan "Controller amendments" become a binding overlay each batch implementer applies while writing — why: patching the whole plan costs a full extra model pass per plan and the overlay is short/clear — cost if wrong: an implementer misapplies one overlay item; review catches it.
Batches (R42): A=T0(verify steps 1–6)+T1 · B=T2–T4 · C=T5–T6 · D=T7–T9 · E=T10–T12 · F=T13–T14 · G=T15 parity.
Ledger: A dispatched base 8e736ec
Stopped by owner 2026-09-28 during batch A (Task 0 Step 5); no commits, tree clean.
Resuming non-stop 2a→5 (owner 2026-09-28, controller now Sonnet 5, subagents inherit session model per global model policy — no hard-coded model). Ledger: A re-dispatched base 8e736ec
Task 0: complete (verification only, nothing to reconcile).
Task 1: complete (commit 8e736ec..97d44b3, review clean). Deferred minors: symbol-mark.tsx:15 aria-hidden spread order; pattern-* twMerge conflictingClassGroups vs opacity/mask-size; naming-convention requiresQuotes has no key-shape filter; R41 doesn't cover src/lib/*; link-as.test.tsx lacks a negative @ts-expect-error case.
Routed deltas applied to briefs: Task 4 (skip Step 1, pattern utilities already in styles.css), Task 10 (query .mask-symbol not svg), Task 13 (query .mask-symbol not svg; use rounded-diamond, no radius-status-dot).
Ledger: B (Tasks 2-4: Text, Link, PatternField) dispatched base 97d44b3
Ledger: B re-dispatched base 97d44b3 (prior B dispatch lost; uncommitted Text WIP handed over). Agent id ab7faf88edf0d0c98. Report: batch-B-report.md
Batch B: implementer DONE_WITH_CONCERNS (e4cd0e0 Text, 5eca1e7 Link, 8bf5570 PatternField; ui 191 tests green). Review dispatched on review-97d44b3..8bf5570.diff
Batch B review: T2 ✅ clean, T4 ✅ clean, T3 1 Important (plan-mandated: isExternal+iconAfter drops "Opens in a new tab").
Ruling R44: overlay item 6 (R36) beats brief's link.test.tsx:106 exception — isExternal always announces; collapse to one after-icon — why: overlay is binding, a11y floor; brief exception predates R36 — cost if wrong: extra sr text when a caller passes a custom trailing icon.
Task 2: minor (deferred): TextProps extends ComponentProps<"p"> so as=label/time/blockquote can't take htmlFor/dateTime/cite; cast comment overstates — contracts §2, route to Task 15.
Task 3: minor (deferred): link.test.tsx:44-45 "hover state" table asserts resting classes — retitle.
Task 3: fix round 1/5 dispatched (resume implementer).
Task 3: fix round 1/5 (2 addressed, 0 open; commits 8bf5570..0b6300c)
Task 3: minor (deferred): link.tsx:15 isExternal JSDoc still says "appends the outward arrow" — with iconAfter it draws caller glyph + announces.
Task 2: complete (commits 97d44b3..e4cd0e0, review clean)
Task 3: complete (commits e4cd0e0..0b6300c, review clean after fix round 1)
Task 4: complete (commits 5eca1e7..8bf5570, review clean)
Ledger: C (Tasks 5-6) dispatched base 0b6300c
Batch C: implementer DONE (777b67f SocialHeadline, a4180e9 Button; ui 241, tokens 159, storybook-test 66/66 on warm rerun).
Ruling R45: Button gets no isExternal prop — contract has none; an asChild new-tab link is the caller's anchor/Link, which carries R44's announcement — cost if wrong: a Button-styled external anchor without Link goes unannounced; add prop in contracts later.
Note (deferred, tooling): storybook:test cold-cache run failed 34 pre-existing stories "Failed to fetch dynamically imported module"; warm rerun green — watch in CI.
Batch C review: T5 ✅ T6 ✅ approved. ⚠️ ghost-on-brand white text verified by controller (brand.json:11 text.link→ink.000). R44/asChild → R45.
Task 6: minor (deferred): button.tsx:85-93 {...props} after {...state} lets caller aria-disabled={false} override busy/disabled on asChild.
Task 6: minor (deferred): busy asChild link blocks pointer but Enter still follows — note for Plan 2 molecules submitting via links.
Task 6: minor (deferred): inverse = solid ink-900 on every surface (C9) → near-invisible on ink section; design question.
Task 5: complete (commits 0b6300c..777b67f, review clean)
Task 6: complete (commits 777b67f..a4180e9, review clean)
Ledger: D (Tasks 7-9) dispatched base a4180e9
Batch D: implementer DONE_WITH_CONCERNS (57cb80a IconButton, 850e2e6 Tag, a22e287 Card; ui 295, tokens 177, storybook-test cold 93/93). Concerns observational (R45 covers Card asChild; aria-disabled spread order same as T6 minor; static Tag accepts button props per contract).
Batch D review: T7 ✅ T8 ✅ T9 ✅ approved, 0 Critical/Important.
Task 9: minor (deferred, plan-mandated): card.tsx:40 isInteractive cursor-pointer on plain div — pointer over whole card though only nested link clicks.
Task 8: minor (deferred): tag.tsx:39 hover:bg-pink-50 applies to every tone (success tag hovers pink).
Task 7: minor (deferred): icon-button/tag {...state} before {...props} — same as T6 minor.
Task 7: minor (deferred): icon-button.test.tsx:45-51 conditional count spread unneeded post-R13; :114-125 asChild test doesn't assert count bubble inside link.
Task 7: complete (commits a4180e9..57cb80a, review clean)
Task 8: complete (commits 57cb80a..850e2e6, review clean)
Task 9: complete (commits 850e2e6..a22e287, review clean)
Ledger: E (Tasks 10-12) dispatched base a22e287
Batch E: implementer DONE_WITH_CONCERNS (fb2afdd Divider, 72b8c0d ImageSlot, 0593701 Badge; ui 342, tokens 188). ImageSlot restructured for R35 (branch on src). format:check fails on plan doc from controller commit 980c6b3 → controller fixes.
Batch E review: T10 ✅ T11 ✅ T12 ✅ approved, 0 Critical/Important. ⚠️ format:check verified green by controller at a6008b4 (plan code-block class re-sort).
Ruling R46: atom stories may import ../../assets/* (brand SVGs) — asset not code, lint passes, no layering meaning — cost if wrong: an atom story couples to asset path; AUTHORING wording to follow in Task 15/plan 5.
Task 11: minor (deferred): image-slot.tsx:98,119 root div duplicated across src branches (union forces it); image-slot.test.tsx:135 R35 test lacks ref/aria-* assertion.
Task 10: complete (commits a22e287..fb2afdd, review clean)
Task 11: complete (commits fb2afdd..72b8c0d, review clean)
Task 12: complete (commits 72b8c0d..0593701, review clean)
Ledger: F (Tasks 13-14) dispatched base a6008b4
Batch F: implementer DONE_WITH_CONCERNS (d20811a StatusDot, 4443700 Avatar, 5a9b82d plan class re-sort; ui 381, tokens 189, storybook-test 127).
Ruling R47: move radius.diamond from component/status-dot.json to primitive/shape.json — shared by StatusDot + 2b brand-diamond, a component file is the wrong home — cost if wrong: one token move, no class name change.
Task 14: minor (deferred): Avatar ring fixed white+pink-500 blends into data-surface=brand; no designed on-brand variant.
Batch F review: T13 ✅ T14 ✅ approved, 0 Critical/Important. Trailers verified by controller.
Ruling R48: take review Minor #1 (StatusDot label="" → colour-only state) into fix round with R47 — spec §5.5 a11y floor, one-line fix — cost if wrong: none beyond one extra test.
Task 13: minor (deferred): status-dot.tsx:57 size has no param default (tone does) — inconsistent with Avatar.
Task 13: fix round 1/5 dispatched (R47 move, blank label, plan text rounded-status-dot → rounded-diamond).
Task 13: fix round 1/5 (3 addressed, 0 open; commits 5a9b82d..ecbcad1)
Task 13: complete (commits a6008b4..ecbcad1, review clean after fix round 1)
Task 14: complete (commits d20811a..4443700, review clean)
Ledger: T15 (tier parity) dispatched base ecbcad1
T15: implementer DONE (3657323 fix(ui): primary Button shadow-2 on brand via @utility shadow-button-primary; 1 fixed / 39 listed; cold tier gate green; ui 382, tokens 189, storybook-test 127).
Note (deferred, trap): Tailwind shadow-* inlines theme value, so surface-overridden shadow tokens need an @utility each — any future surface-aware shadow.
Ruling R49: T15's one-commit task review folded into the final whole-branch review (reviewer gets task-15 brief+report as a task-review input) — owner R42 lean-review ruling; final review sees the same diff — cost if wrong: final reviewer spends less attention on 3657323.
Final review dispatched: range 8e736ec..HEAD
Final review: READY WITH FIXES. 0 Critical, 1 Important (non-light surfaces don't restore base → nested soft/ink inside brand inherits white text/focus/components). T15 spec ✅ quality ✅.
Final minors: divider/image-slot blank label (R48 parity); styles.css:91 base a underline fixed pink-200; link.tsx:27 inline-flex blocks prose wrap; static Tag isSelected exposes no state; no guard for surface-overridden shadow-* @utility; 2b plan body stale (SYMBOL_DATA_URI_WHITE, inline-svg SymbolMark, radius-status-dot).
Ruling R50: fix wave = Important + divider/image-slot blank label + base a underline token + link.tsx:15 JSDoc + Tag isSelected doc + link inline (only if dev parity agrees). Route to Plan 2b Task 0 fold list: shadow @utility guard spec, R41 over src/lib/*, stale 2b body (data URI / inline SymbolMark / radius-status-dot → R19/R47). Rest of deferred minors ride along per final-review triage — cost if wrong: ride-along items resurface in 2b/3 reviews.
Final fix wave dispatched base 3657323
Final fix wave: DONE (a932a99 tokens surface build = light + own overrides; 2bf1580 divider/image-slot blank label; 47cdcba base a underline token + Link/Tag JSDoc). Item 5 link inline-flex left: dev + brief use inline-flex for all links. tokens 190, ui 386, storybook 128.
Final fix wave re-review: all addressed (item 5 inline-flex justified: dev + brief), 0 new breakage.
Task 15: complete (commits ecbcad1..3657323, review clean via final review per R49)
Final: minor (deferred): link.stories.tsx:26 docs still say "isExternal adds the arrow" — ride-along.
Final: minor (deferred, owner): Link inline-flex on every link blocks prose wrap at 360 — dev + brief chose it; owner call.
Plan 2a: COMPLETE (8e736ec..47cdcba + docs b088a6f). Workspace archived, not deleted (owner rule).
