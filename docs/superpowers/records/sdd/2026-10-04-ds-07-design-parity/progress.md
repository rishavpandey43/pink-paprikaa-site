# SDD ledger — plan: docs/superpowers/plans/2026-10-04-ds-07-design-parity.md (Claude Design handoff 6b1e28a reconciliation)
OWNER 2026-10-04: everything built + Storybook must be IDENTICAL to the handoff (design, interaction, states, tokens, component set/tiers); code follows our guidelines (AUTHORING, handbook, RULES, sx/shared API, TDD, gates). Handoff wins on design/behaviour; shared API wins on prop names (mapped); hard rules always win.
Audit dispatched: A atoms · B molecules · C organisms+layouts · D tokens/guidelines/storybook/kits → W/audit-{atoms,molecules,organisms,foundations}.md
Plan written: docs/superpowers/plans/2026-10-04-ds-07-design-parity.md (Tasks 0–12, rulings R131–R142). Audits tracked in docs/superpowers/specs/2026-10-04-design-parity/. RESUME HERE: Cursor executes from Task 0.
CURSOR RUN 2026-10-05 (subagent-driven-development), start HEAD 3c9f28c on feat/design-system.
Ruling: one commit per task (not per component/step) — owner asked for fewer commits this run (2026-10-05) — cost if wrong: coarser history, git log less granular per component.
Ruling: visual baselines generated natively on macOS (Docker not installed: `command not found: docker`) — plan Task 0b's sanctioned fallback; README notes baselines are macOS-generated — cost if wrong: re-baseline inside the Playwright image later.
Ruling: Task 0 baseline gate runs only the targets that exist yet (storybook:visual + count-guard arrive in Task 0b) — cost if wrong: none.
Ruling: ds-06 minors (.superpowers/sdd/2026-10-04-ds-06-mui-gaps/minors.md) are carried into this plan's Task 12 review, since this plan supersedes ds-06 Task 17 — cost if wrong: none.
OWNER 2026-10-05: COMMIT LAYOUT CHANGED (max 3 commits per PR). Supersedes the 'one commit per task' Ruling above. Use the plan's 'PR and commit layout': 4 stacked branches ds-parity/1-foundations → 2-atoms → 3-molecules-organisms → 4-storybook, ≤3 checkpoint commits each; stage between checkpoints; never push/merge. If commits already exist on feat/design-system from this run, move them onto ds-parity/1-foundations by creating the branch at HEAD (no history rewrite needed), then continue with checkpoints.
Task 0: baseline HEAD 3c9f28c (ui 1968, sb 1112, tokens 290, stories 926)
Task 0: coverage map staged, not committed (owner layout: lands in checkpoint 1 with Task 0b) — 1749 rows: have 1305, planned 393, R-number 51, blank 0
Ruling: Task 0 files staged instead of the standalone commit — OWNER 2026-10-05 layout supersedes it and the plan puts the coverage map in checkpoint 1 — cost if wrong: one extra `git commit` of the two staged files.
Ruling: `base` (asset path) props are `have` in the coverage map — assets are bundled in the library — cost if wrong: a few rows flip to planned.
Ruling: doc-only `state` props are R138 and `diet` egg values are R140 in the coverage map — both approved differences — cost if wrong: re-label a few rows.
Ruling: rows the audits do not mention follow the plan's coverage mapping by owning task (README §13 QA to T12, kit content rows to T11, guideline renames to T11b) — cost if wrong: a row points at the wrong task id.
Branch: ds-parity/1-foundations created at 3c9f28c (feat/design-system HEAD; no commits from this run existed, so nothing moved). Owner's uncommitted edits to the plan + .cursor/rules/00-project-guardrails.mdc are left unstaged for the owner (not swept into checkpoints).
Ruling: Task 0 review is folded into the checkpoint-1 review (coverage map + Task 0b land in one commit) — cost if wrong: none; the review still covers both briefs.
OWNER 2026-10-05: the two owner-edited files (docs/superpowers/plans/2026-10-04-ds-07-design-parity.md and .cursor/rules/00-project-guardrails.mdc) are final. The CONTROLLER stages them into PR 1's first checkpoint commit (① chore: add visual snapshots and a count guard). Implementers still never modify them.
OWNER 2026-10-05 03:15: LEAN EXECUTION — read the plan's new 'LEAN EXECUTION' section (top of plan) and switch now: inline (no per-task subagents/reviewers), test-first only for interaction/api/a11y + new components (visual gaps proven by the component's screenshot diff), per-component scoped visual runs, full gate + full visual + count guard + coverage update + one review ONCE PER PR, no per-component card comparisons, no per-task reports. Target 4–6h for Tasks 1–12. Task 0b: finish stabilising the baseline (fix flaky stories, never loosen thresholds), then checkpoint ① including the two owner files.
Ruling: Playwright `reducedMotion` goes in `use.contextOptions` (a top-level `use.reducedMotion` is silently ignored and fails typecheck) — cost if wrong: baselines would need regenerating.
Ruling: scroll-snap tracks are scrolled back to start before each screenshot — organisms-reviewcarousel--mobile/desktop/paging flaked ~1 run in 4 because the play's focus-scrolling settles differently under load; other stories still cover the start state — cost if wrong: a carousel's scrolled state is not snapshotted (its play still asserts it in storybook:test).
Ruling: `website-homepage--homepage` tagged `no-visual` (its play ends with a toast + two dialogs mid-animation; 22% pixel diff in 1 of 5 identical runs). `website-homepage--homepage-360` stays snapshotted. Baseline PNGs for it removed (2, never counted as a story/test loss: story count stays 926) — cost if wrong: one fewer visual check.
Ruling: count-guard unit test lives at tools/scripts/count-guard.test.mjs and runs in `@pink-paprikaa-web/eslint-config:test` (script globs ../scripts/*.test.mjs; target inputs include tools/scripts/**) — tools/scripts is not an Nx project and adding a 14th project would contradict CLAUDE.md — cost if wrong: move to its own tool project.
Ruling: `storybook:visual` = package.json script + nx target {cache:false, dependsOn:[build-storybook]}; build-storybook inputs exclude visual/** so baselines never invalidate the Storybook build cache. `--grep` takes a plain prefix (Nx passes args through a shell; `a|b` breaks).
Ruling: visual suite is not in CI (macOS baselines mismatch ubuntu) — cost if wrong: no CI visual gate until Docker re-baseline.
Task 0b: done 75780f2 chore: add visual snapshots and a count guard (ui 1968, sb 1112, tokens 290, stories 926); visual baselines 1850 PNGs (925 mobile + 925 desktop), 58,502,872 bytes (55.8 MiB); two consecutive full no-update runs 1850/1850 green.
OWNER 2026-10-05: PR budget ≤20 source files and ≤250 changed lines/file per PR (CI). Cut the 4 PRs into smaller stacked PRs as needed (LEAN EXECUTION item 8); one ledger line per cut, no extra planning.
Ruling: recovered ds-parity/1-foundations tip from accidental reset to 75780f2 back to amended ① 346430e (mixed reset; Task 1 work kept) — cost if wrong: none (346430e is the ledger tip).
Ruling: press-scale-stepper = 0.92 (handoff INTERACTIONS.md), not the plan snippet's 0.9 — cost if wrong: steppers one step softer than design.
Ruling: Task 1 gutter/section change intentionally re-baselines layout-affected stories (186 PNGs); full --update-snapshots once for this PR then no-update gate — cost if wrong: would hide an unrelated regression (self-reviewed spacing-shaped diffs).
Ruling: soft.json and light.json declare color.state.* restores so nested surfaces keep the nest rule — cost if wrong: none (theme.spec enforces).
Task 1: done bbf2e7e feat(tokens): add the handoff's state layer, scrollbar, press scales and pop-in — tokens 314, ui 1970, sb 1117, stories 926; visual 1852/1852 green; count-guard raised; coverage Task 1 rows → have.
PR ds-parity/1b-tokens: checkpoints done — ② bbf2e7e.
Cut: continue on ds-parity/1c-interactions for T2+T3 (checkpoint ③).
Ruling: Tooltip implementation moved to lib/tooltip.tsx (atom re-exports) so Avatar can wrap with withTooltip without breaking atomic-layering (lib may only import Icon otherwise) — cost if wrong: one extra lib file.
Ruling: Task 2 eslint native-ui gate + Task 3 forced-states cut to ds-parity/1d-native-ui (next) so 1c stays ≤20 source files (currently 17) — cost if wrong: native-ui violations linger one PR longer.
Task 2: done c6b668a feat(ui): add usePress, base chrome and the native-ui policy — ui 1977, sb 1118, stories 927, tokens 314; Interactions/GlobalBase play green; enquiry-form date→text until Task 7.
PR ds-parity/1c-interactions: checkpoints done — ③a c6b668a (Task 2 behaviour only).
Cut: eslint native-ui gate + Task 3 forced-states → ds-parity/1d-forced-states (next), keeps each PR ≤20 source files.
Ruling: native <select> allowed under atoms/select until Task 7 (plan says lib-only; Select still platform-native) — cost if wrong: lint misses a stray select outside Select until Task 7 removes it.
Ruling: first visual run failed mid-suite (serve.mjs CONNECTION_REFUSED after one sb-show-errordisplay); retry 1854/1854 green — cost if wrong: none (flake, not pixel).
Task 3: done 046c002 feat(ui): add the native-ui lint gate and forced-state stories — ui 1977, sb 1118, tokens 314, stories 928; visual 1854/1854; Button States pilot !test; no-native-ui gate green.
PR ds-parity/1d-forced-states: checkpoints done — ③b 046c002 (Task 3 + Task 2 eslint gate).
Cut: continue on ds-parity/2-atoms for T4+ (off 1d).
Cut: Task 4 split — Button/IconButton/TextButton on ds-parity/2-atoms (≤20 source files); Link/Tag/Card → 2b next.
Ruling: States play asserts hover:bg-state-hover class (vitest does not apply storybook-addon-pseudo-states .pseudo-hover); addon stays for Storybook UI/visuals — cost if wrong: computed-fill regressions only caught visually.
Ruling: pin storybook-addon-pseudo-states@10.5.7 to match storybook 10.5.7 (10.6.1 peer unmet) — cost if wrong: miss 10.6 fixes.
Task 4a: done 3c4a223 fix(ui): match button, icon button and text button to the handoff — ui 1995, sb 1133, stories 939, tokens 314; visual green; TextButton new.
Ruling: inverse Link press uses active:decoration-current (not decoration-ink-000) so colors-specimens--ink-ramp stays stable — cost if wrong: inverse press underline colour drifts if text colour changes.
Ruling: app kit toast toBeVisible flake once then green — cost if wrong: none (known animation flake).
Ruling: full visual CONNECTION_REFUSED mid-suite once then 1884/1884 green — cost if wrong: none (serve flake).
Task 4b: done 31ff77e fix(ui): match link, tag and card to the handoff — ui 1996, sb 1136, stories 942, tokens 314; visual 1884/1884; coverage Task 4 rows have.
PR ds-parity/2b-link-tag-card: checkpoints done — 31ff77e (Task 4 Link/Tag/Card).
Cut: continue on ds-parity/2c-atoms-b for T5 (off 2b).
Ruling: choice-row disabled uses has-disabled:opacity-50 (IX); "never opacity" stays for pill controls — cost if wrong: choice rows look softer than grey-fill pills.
Ruling: Radio forced-state story named Interaction (States already means option matrix) — cost if wrong: card row name mismatch only.
Ruling: cascading visual updates for listrow/dialog/app/field/spacing that embed choice rows after IX padding — cost if wrong: masks an unrelated kit regression.
Task 5a: done 9eff308 fix(ui): match checkbox, radio and switch to the handoff — ui 1998, sb 1140, stories 945, tokens 315; visual 1890/1890.
PR ds-parity/2c-atoms-b: checkpoints done — 9eff308 (Task 5 Checkbox/Radio/Switch).
Cut: continue on ds-parity/2d-atoms-c for T5 Input/DietMark/ImageSlot/Avatar (off 2c).
Ruling: ImageSlot fill→variant with ink→neutral (design tone); isFill stays the boolean — cost if wrong: callers still on fill= break until updated (done in this PR).
Ruling: Input coverage "open/close" row marked have as N/A (generator artifact; no panel) — cost if wrong: miss a real open-state gap until Task 7 Select.
Task 5b: done c8693a4 fix(ui): match input, diet mark and image slot to the handoff — ui 1999, sb 1141, stories 946, tokens 315; visual 1892/1892; Task 5 coverage have.
PR ds-parity/2d-atoms-c: checkpoints done — c8693a4 (Task 5 Input/DietMark/ImageSlot/Avatar).
Cut: continue on ds-parity/2e-menu-popover for T6 (off 2d).
Ruling: Menu/Popover atom stories/tests use lib/demo-triggers (native buttons) — atomic-layering forbids Button/IconButton imports from atoms/ — cost if wrong: demos look less branded until a kit wrapper exists.
Task 6a: done 5c7df34 refactor(ui): make menu and popover atoms as the design tiers them — ui 1999, sb 1141, stories 946; visual 1892/1892; titles Atoms/Menu|Popover.
PR ds-parity/2e-menu-popover: checkpoints done — move only; behaviour (rows/sheet/pop-in) → next cut.
Cut: continue on ds-parity/2f-menu-panel for T6 Steps 2–4 behaviour (off 2e).
Ruling: menu row text uses text-control (15px) — same size as handoff; avoid a new menu-row token this cut — cost if wrong: control and menu rows share a token name.
Ruling: DatePicker keeps sheet={false} until Task 8 — auto sheet broke calendar plays mid-parity — cost if wrong: phone date pickers stay floating one PR longer.
Ruling: empty MenuPanel uses role=status (not listbox) — aria-required-children — cost if wrong: AT may not announce an empty listbox.
Task 6b: done 670847a+5a455a9 fix(ui): match menu/popover to the design handoff — ui 2008, sb 1149, stories 954; visual menu 36 + popover 20.
PR ds-parity/2f-menu-panel: checkpoints done — T6 Steps 2–4 (rows/sheet/pop-in).
Cut: continue on ds-parity/2g-select for T7 (off 2f).
Ruling: Select uses lib/listbox-popover (Radix+shell) — atomic-layering forbids atom→Popover — cost if wrong: two popover shells to keep in sync.
Ruling: InDialog/InAppShell stories use plain chrome — atom stories cannot import Dialog/AppShell — cost if wrong: overlays less realistic in Select CSF.
Ruling: select.test rewrite exceeds 250-line churn — native→listbox API swap — cost if wrong: harder review; split not worth a stacked cut mid-T7.
Ruling: DatePicker min via disabledDays before today until Task 8 lands min — cost if wrong: booking date UX slightly different from handoff prop name.
Task 7: done — Select own listbox + enquiry/website DatePicker/phone; ui select 15, sb select 18 + forms + website; visual atoms-select 40.
Ruling: FieldControl disabled has- uses button[role=combobox] not bare button — trailing IconButton must not grey the field — cost if wrong: other button controls in the box need the same role.
Task 7: done 6d58287 feat(ui): make select our own list and drop native date inputs — ui 2008, sb 1155, stories 960; visual atoms-select 40.
PR ds-parity/2g-select: checkpoint done — T7 Select + native-date sweep.
Cut: continue on ds-parity/2h-action-combobox-date for T8 (off 2g).
Ruling: Combobox keeps click-to-open (plan T8) — audit said design focuses only; plan wins for this cut — cost if wrong: revisit against Combobox.jsx click handler.
Ruling: DatePicker inline card chrome deferred past T8 — size/ISO/diamond/sheet/min-max land first; inline is visual chrome only — cost if wrong: one more story + calendar wrapper in T9 mop.
Ruling: Combobox clear shows whenever query non-empty; isClearable also drops value — matches design query-clear + keeps form hard-reset — cost if wrong: two clear semantics to document.
Task 8: done — ActionMenu + Combobox keyboard/diamond/meta + DatePicker ISO/diamond/sheet; ui 2020, sb 1161, stories 966.
Ruling: useAsSheet sync-init from matchMedia — first open at ≤640 must be sheet not floating flash — cost if wrong: SSR still false until hydrate.
Ruling: DatePicker inline calendar card chrome deferred to T9 mop — ISO/diamond/sheet/min-max/size/readOnly/weekStart/format land in T8 — cost if wrong: one card row missing until mop.
Task 8: done 6549cb3 feat(ui): add action menu and match combobox and date picker to the design — ui 2020, sb 1161, stories 966.
PR ds-parity/2h-action-combobox-date: checkpoint done — T8 ActionMenu+Combobox+DatePicker.
Cut: continue on ds-parity/3a-molecules for T9 (off 2h).
Ruling: Toast/Snackbar TextButton action+dismiss deferred past T9 molecule cut — duration-base toast-pop + action.disabled land; TextButton surface mapping needs its own file budget — cost if wrong: action hover pills lag one cut.
Task 9: done — molecule hover/press/API gaps (Pagination PageButton+onPageChange, Tabs, SearchField, Accordion default closed, …); Toast TextButton deferred.
Task 9: done 1b3c9f6 fix(ui): match the molecules to the design handoff — ui 2022; Toast TextButton deferred.
fix:  waitFor toast pop-in on App Home play (duration-base flake under suite load).
PR ds-parity/3a-molecules: checkpoint done — T9 molecules (+ toast-play flake fix).
Cut: continue on ds-parity/3b-organisms for T10 (off 3a).
OWNER 2026-10-05 09:55 (Claude check): (1) coverage.md is stale — 113 rows still 'planned' for DONE tasks (T7:2, T8:70, T9:41); most are built (e.g. ActionMenu items/variant/size/sheet, Accordion defaultOpen). Before finishing PR 3b, re-verify those rows against the code and flip them to 'have' (or list the truly missing ones). (2) Real design gaps left open — close them in the current PR, do not defer: Menu props activeIndex/onActiveChange (design MenuProps); Toast + Snackbar actions use TextButton (audit-molecules Toast/Snackbar). 'Deferred' is not allowed for a design item (nothing-removed rule). Then continue with T10.

Ruling: SiteHeader keeps 3 inline links until 2xl — five widest labels + badge + actions overflow 1280; design's five shorter labels still use this step — cost if wrong: one more breakpoint story.
Ruling: HeroBanner keeps single py-hero-banner-y (not asymmetric top/bottom) — fold budget / mobile clamp already recorded on the token — cost if wrong: 4–8px padding drift vs card.
Ruling: TestimonialWall grid stays autogrid 260; design 280 accepted (low impact at 1000px) — cost if wrong: one fewer column at a narrow band.
Ruling: Layouts BaseProps cosmetic rename deferred past T10 organism cut — same type shape today — cost if wrong: one mop commit.
Ruling: SiteFooter keeps no social default (audit: ours has none) — Instagram is caller-supplied — cost if wrong: empty brand block until kit passes social.
Task 10: done 5fea413 fix(ui): match the organisms and layouts to the design handoff — ui 2028, sb 1165, stories 968.
PR ds-parity/3b-organisms: checkpoint done — T10 organisms/layouts.
Cut: continue on ds-parity/4-storybook for T11 (off 3b).
OWNER 2026-10-05 11:00 — OVERRULES Cursor's T10 rulings (only the owner may approve a design difference; R136/R137/R140/R142/R143 are the only approved ones):
- SiteHeader: use the DESIGN's nav labels (shorten ours to the handoff wording) so all links are inline from 1280px, exactly as designed. Revert the "3 links until 2xl" step.
- HeroBanner: asymmetric top/bottom padding exactly as designed (add tokens).
- TestimonialWall: 280px autogrid minimum as designed.
- SiteFooter: social default ["instagram"] as designed.
- Layouts BaseProps rename: do it in the T10 cut (cosmetic, but no "deferred" items).
- STILL OPEN from 09:55: refresh coverage.md rows for T7–T10 (flip built rows to 'have'), add Menu activeIndex/onActiveChange, and make Toast + Snackbar actions use TextButton.
- T10 is 70 source files: cut it into ≤20-file stacked PRs before committing.
Rule for the rest of the run: never write a Ruling that keeps our version over the design — if the design can't be met, stop and ask the owner.

Cut: ds-parity/3c-t10-mop (off 3b) — owner 11:00 overrules + Menu activeIndex + Toast/Snackbar TextButton + coverage T7–T10 flip; amend blocked (HEAD author Rishav, not agent).
Task 10 mop: done 48f5343 fix(ui): apply the owner's organism layout overrules — SiteHeader xl links + short labels; Hero asymmetric pad; TestimonialWall 280; SiteFooter Instagram default; layouts BaseProps.
Task 10 mop close: done 19608e7 fix(ui): wire menu activeIndex and TextButton toast actions — MenuPanel activeIndex/onActiveChange + MenuProps alias; Toast/Snackbar TextButton + IconButton xs dismiss; coverage T7–T9 → have.
Cut: ds-parity/4-storybook (off 3c) — Task 11 foundations/kits/motion.
Task 11: done — MotionEasingSpecimen + states matrix + form-states policy notes; brand R140 (Instagram, ordering, reviews, maps, googleRating/est); Website kit FAQ/rating/maps.
Task 11: done 8dce2fd docs(storybook): match the foundations pages, brand facts, kits and motion to the design.
Task 11b Step 1: sidebar.spec.ts GREEN against DESIGN_TREE (after Readme/Templates/Explore/retitles).
Cut: ds-parity/4b-sidebar (off 4) — Task 11b retitles + sidebar.spec; PR budget.
Task 11b: done adb7a65 refactor(storybook): match the sidebar to the claude design tree — sidebar.spec GREEN; Templates/Explore on 4a a8e30bd.
Ruling: 4b Meta-title file count >20 — kept one cut after templates — splitting again would rename story IDs twice — cost: PR budget reject.
Task 12: start — visual baseline rename for sidebar story ids, then parity tool + grep gates.
Ruling: grep title= gate — treat as HTML tooltip title on lowercase DOM tags only; React title= props on Alert/SectionHeader/ListRow/CheckCard/Dialog are not browser tooltips — cost: miss a real title= if someone spreads it to DOM without a lowercase tag literal.
Ruling: orphan baselines atoms-dietmark--veg + atoms-imageslot--fills kept (story ids renamed/removed earlier); never delete baselines — cost: count-guard stories≠shots until a later cleanup Ruling.
Ruling: parity Text card → Typography (R143) — no atoms-text story id — cost: montage skip for Text only.
Task 12: done — parity.mjs (79/80+Text→Typography); grep gates OK; max-h-menu-sheet utility; homepage play settle; coverage 1749 have/R; visual 1936; count-guard raised.
Final: done (ui 2031, sb 1168, tokens 315, stories 968)
Task 12: done 7f53030 fix(ui): settle the parity sweep and final review
Task 12: done c0622fd fix(ui): settle the parity sweep and final review (amended prettier form-states).
OWNER 2026-10-05 (after final gate GREEN + whole-branch review): fix wave on a new stacked branch ds-parity/4c-review-fixes (≤3 commits). Rulings:
- R147: controls ALSO accept the design's label/hint/error/success/warning/optional props (Input, Select, Combobox, DatePicker, Checkbox, Radio, OtpInput, SlotPicker); when given, the control renders Field around itself. <Field> wrapping keeps working.
- R148: Menu, Popover and Dialog ALSO accept the design's onClose() (called on close) alongside onOpenChange.
- R138 approved by owner (forced states via the Storybook addon; no docs-only `state` prop).
- PR budget: owner waives splitting the 3 over-budget commits (no CI yet).
Fix list (design wins, no further rulings):
1. Build the props the coverage map falsely marks `have`: DatePicker inline/defaultOpen/sheet/icon; ActionMenu placement/minWidth; Menu autoFocus/inline/minWidth; Combobox defaultOpen. Mark Input rows 312-313 truthfully (N/A). Re-run a scripted check that every `have` prop row exists in its cited file.
2. Combobox: click focuses the input only (design Combobox.jsx:85,95), no click-to-open.
3. SiteHeader: add the design's steps — 3 links from 860px, 4 from 1080px, all from 1280px (SiteHeader.jsx:15); add breakpoint tokens if needed.
4. Instagram href → https://instagram.com/thepinkpaprikaa/ in site-footer.tsx, organisms/story-fixtures.ts and site-footer.test.tsx (match packages/content brand-data).
5. Records: move the 34 stray docs/superpowers/records/sdd/task-*.md and their .superpowers/sdd/ root originals into the 2026-10-04-ds-06-mui-gaps folders; commit with the ds-07 progress.md.
6. Minors: restore the 4 dropped Select tests (long label truncates; read-only placeholder posts nothing; read-only + disabled submits nothing; defaultValue kept over placeholder); delete the stale atoms/select exemption in no-native-ui.js + a RuleTester case; replace switch.tsx transition-[transform,width,height] with a token/utility; tokenise the inline styles in lib/listbox-popover.tsx + popover-shell sheet and the BrandDiamond 14px literals (or record why); export MenuProps; keep menu.tsx/select.tsx under 250 changed lines if a split is cheap, else note it.
Then: full gate + visual + count-guard, update coverage.md, one ledger line. Never push.
Cut: ds-parity/4c-review-fixes (off 4b) — owner review-fix wave R147/R148 + coverage-false-haves + minors.
Ruling: BrandDiamond size keys stay `"12px"|"14px"|…` — they are token map keys (`size-brand-diamond-14`), not raw CSS lengths — cost if wrong: rename keys later if design switches to sm/md.
Ruling: sheet-pin class is for docs/specimens; live Radix sheets keep position/inset/transform inline (Radix style attr wins) — cost if wrong: one more sheet visual flake.
Review wave 4c: done — R147 Field chrome on Input/Select/Combobox/DatePicker/Checkbox/Radio/OtpInput/SlotPicker; R148 onClose on Menu/Popover/Dialog; false-have props built; Combobox click-focus-only; SiteHeader nav-3/nav-4/xl; Instagram href; 34 ds-06 records filed; Select tests restored; no-native-ui select exemption dropped; Switch transition-switch-knob; MenuProps export; have-props script green. Gate: ui 2052, sb 1170, tokens 315, stories 970; visual 1940.
