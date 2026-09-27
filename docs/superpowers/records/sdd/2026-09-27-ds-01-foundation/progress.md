# SDD ledger — plan: docs/superpowers/plans/2026-09-27-ds-01-foundation.md

Spec: docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md (reachable)
Branch: feat/design-system. Start commit: 68b2b9a.
Concurrency note: 7 plan-writer agents (plans 02a–05) run in parallel; they only create files under docs/superpowers/plans/ and never touch git.

## Pre-flight scan

| Pair / task | Produces → consumes | Finding |
| --- | --- | --- |
| T1 ↔ T5 | T1 stubs ui index.ts/styles.css + adds ui `passWithNoTests`; T5 replaces both and removes the flag | consistent |
| T1 ↔ T7 | T1 adds storybook `passWithNoTests`; T7 removes it once Icon/Logo stories exist | consistent |
| T2 ↔ T5 | T2 catalogue `path[0]` namespaces (text, font, font-weight, radius, shadow, blur, ease, container, aspect, breakpoint, spacing) → T5 twMerge lists + spec `namesIn()` | names match the T2 token files; shadow list includes semantic focus-ring(-inverse) — consistent |
| T2 ↔ T5 | CSS vars used in styles.css (`--text-body--line-height`, `--spacing-card-min(-wide)`, `--effect-scrim-*`, `--motion-reveal-distance`, `--z-*`, `--duration-*`, `--color-focus`, `--container-prose`, `--color-pink-200`) | all produced by T2 — consistent |
| T5 ↔ T7 | T7 adds spacing component tokens icon-*/logo-* → must extend T5 `SPACING` list | T7 Step 2 says so — consistent |
| T6 ↔ T7/T8 | T6 turns on no-custom-classname; storybook preview decorator still uses August classes (`text-body1 leading-body1`) until T8 | CONFLICT — see Ruling R1 |
| T6 ↔ writers | T6 Step 6 `nx format:write` formats every file incl. plan .md files being written concurrently | CONFLICT — see Ruling R2 |
| T6 atom rule | gitignore-style `../*` patterns in no-restricted-imports may not match relative paths as intended | RISK — see Ruling R3 |
| T4 self | brand.spec uses non-null `!` and casts that strict type-aware lint may reject | RISK — see Ruling R4 |
| T5 self | vitest.setup `??=` on DOM globals typed non-nullable may trip `no-unnecessary-condition` | RISK — see Ruling R4 |
| T2 self | contrast.fixtures `#FFFFFFCC` ratio 12.34 is a placeholder the plan says to compute | plan-sanctioned — implementer computes, notes value |
| T7 self | `IconComponent` vs lucide `LucideIcon` assignability unverified | plan-sanctioned widening, no cast at call site |
| T8 self | guard over storybook-static may flag absolute local paths | plan gives the investigation path; never narrow the guard |
| T1…T9 self-consistency | each task's tests vs its code, files created vs later touched | checked — no other contradictions |

Ruling R1: T6 implementer updates `apps/storybook/.storybook/preview.tsx` decorator classes to `font-body text-body text-text-body` if lint flags them (pulled forward from T8 Step 3) — why: a LAW must not land red — cost if wrong: trivial, T8 re-edits the same line.
Ruling R2: T6 Step 6 formats only tracked files outside `docs/superpowers/plans/` (e.g. `pnpm exec prettier --write $(git ls-files … | grep -v '^docs/superpowers/plans/')`) instead of `nx format:write` — why: parallel plan writers are writing untracked .md files there — cost if wrong: a later `format:check` catches any leftover; plan files are formatted when committed.
Ruling R3: if the gitignore-style atom pattern misbehaves in the probe, implement the atom rule with ESLint's `regex` pattern option (e.g. `^\.\./(?!icon(?:/|$))[^./]`) — same intent: an atom may import only the Icon atom, `../../lib/*` and packages — cost if wrong: a probe proves it either way.
Ruling R4: lint-driven rewrites of plan-provided test/setup code are allowed when the asserted behaviour is unchanged (e.g. replace `!` with a guarded destructure; replace `??=` with an `in` check) — why: gates are LAW, the plan's intent is the behaviour — cost if wrong: none if assertions are preserved; reviewers check.

## Tasks
Task 1: dispatched (base 68b2b9a)
Task 1: implementer DONE_WITH_CONCERNS (commits cb3184f, 75ee25e); review dispatched on trimmed package (1.1 MB of pure deletions summarised).
Ruling R5: keep nx.json defaultBase = main even though local main is the live site's orphan history (so `affected` = whole workspace) — why: architecture spec §3 makes main the protected production branch; the orphan relation ends at the Phase 6 cutover — cost if wrong: slower verify runs until then, no correctness impact.
Task 1: minor (deferred): apps/blog/next-env.d.ts is rewritten by every blog build (now triggered by blog lint) — decide gitignore vs committed form in the final review.
Task 1: minor (deferred): apps/storybook/.storybook/main.ts comment about stories location partly stale after adding ../src globs.
Task 1: minor (deferred): apps/blog build outputs omit {projectRoot}/.content-collections — a cache hit after `rm -rf .content-collections` re-breaks blog lint; add the output.
Task 1: minor (deferred): CI verify installs chromium on every run before Formatting; consider moving after sync:check or caching ~/.cache/ms-playwright.
Task 1: minor (deferred): docs/engineering/03-patterns.md:43,46 point at deleted files until Task 5/9 recreate them.
Task 1: minor (deferred): two pre-existing playwright/no-conditional-in-test warnings in web-e2e/blog-e2e.
Task 1: complete (commits 68b2b9a..75ee25e, review clean)
Task 2: dispatched (base 75ee25e)
Task 2: implementer DONE (27bf514); nx sync also touched apps/web, apps/blog, packages/ui tsconfigs (committed); tier regex adapted to SD5 relative filePath; fixture 12.34 -> 11.92
Task 2: review Approved with 2 Important (plan-mandated) + 6 Minor.
Ruling R6: one-hex test hole (theme.spec.ts checks only primitive exact matches) — FIX via fix round 1: scan every tokens/**/*.json source, count case-insensitive brand hex, expect exactly 1 — why: hard rule 3 has no other JSON guard; component tokens land next — cost if wrong: none.
Ruling R7: `--z-*`/`--duration-*` not Tailwind theme namespaces — NO CHANGE: Plan 1 Task 5 defines `@utility z-*`/`duration-*` named utilities explicitly; spec §6.3 wording (`duration-(--…)`) amended in Task 9 — why: class names are identical either way and the plan already owns them — cost if wrong: a rename of 11 tokens later.
Ruling R8: mint-strong/turmeric-strong keep the plan's design-system component values (#186C51, #8A5C00) over the spec's handoff values (#1D6E52, #7A5510) — why: the design-system components use them 6×/5×, both pass AA — cost if wrong: two primitive edits; spec §5.3 table amended in Task 9.
Ruling R9: contrast-pairs.json stays at the package root (plan), spec §5.4 path amended in Task 9 — why: it is policy, not a token source; SD globs tokens/** — cost if wrong: a file move.
Task 2: minor (deferred): README.md:15 claims px literals only in primitives (semantic/surface shadows hold 3px) — say colour literals.
Task 2: minor (deferred): references inside composite string values (focus-ring shadow) resolve to literals, catalogue reference null.
Task 2: minor (deferred): surface roots listed twice in sd.config.mjs (SURFACE_ROOT + SURFACE_SELECTORS); unknown surface root would leak into theme.css silently.
Task 2: minor (deferred): catalogue ramps out of order (integer-like keys: ink-000 after 900, white-alpha-06 after 92) — Plan 5 docs-kit must sort.
Task 2: minor (deferred): exported relativeLuminance ignores alpha — document "opaque input".
Task 2: minor (deferred): preview.tsx:95 August classes (Ruling R1 / Task 8 covers).
Task 2: fix round 1/5 dispatched (R6 one-hex guard) → commit 3bad3bb; scoped re-review running
Task 2: fix round 1/5 (1 addressed, 0 open; commits 27bf514..3bad3bb)
Task 2: minor (deferred): contrast.fixtures.json also holds the brand hex literal (test fixture inside design-tokens; outside tokens/ guard) — acceptable per rule 3 scope, note for final review.
Task 2: complete (commits 75ee25e..3bad3bb, review clean)
Task 3: dispatched (base 3bad3bb)
Task 3: implementer DONE (9357823); concerns: formatCount negative sign, half-rounding asymmetry for negatives
Task 3: minor (deferred): Math.round half-rounds negatives toward +∞ (−499.5 → −₹499); one-line fix rounds magnitude — plan-mandated; no caller has fractional discounts yet.
Task 3: minor (deferred): formatCount prints ASCII hyphen/"-0" for negatives; no negative caller.
Task 3: minor (deferred): formatCount lives in format-rupees.ts (one-primary-export rule) — plan-mandated.
Task 3: minor (deferred): no tests for formatCount non-finite rejection / negative fractional amounts.
Task 3: minor (deferred): minus/en-dash written as literal chars in spec (readability).
Task 3: complete (commits 3bad3bb..9357823, review clean)
Task 4: dispatched (base 9357823)
Plan-writing: 02c layouts written. Rulings sent to writers — R10: Dialog gets portalContainer (Plan 4), Toast viewport placeable (Plan 3a), PostFrame `alt` tone (Plan 2c), layout-story stand-ins replaced by Plan 4 final task; axe `region` — if it fires on isolated components, Plan 1 Task 7 disables it inside expectNoA11yViolations (page-level rule) — cost if wrong: one helper line.
Task 4: implementer DONE (6dc94aa); lockfile bumped third-party-web transitively; Devanagari name spelling flagged for owner
Task 4: review Needs fixes — 1 Important (plan-mandated): no rejection tests for CIN, PAN, entity (spec §7.3 one invalid fixture per rule-bearing field).
Ruling R11: fix round 1 adds CIN/PAN/entity rejection tests (spec binds) AND switches URL fields to z.httpUrl() with a `javascript:` rejection test — why: values become links; security measures are never simplified away — cost if wrong: none.
Task 4: minor (deferred): GSTIN chars 3–12 should equal PAN — optional .refine.
Task 4: minor (deferred): IFSC/UPI get format patterns when the owner supplies values.
Task 4: minor (deferred): founder guard's TEXT_EXT skips .ts, so running it on packages/ proves nothing; protection is the unit test.
Task 4: note: reviewer verified पैप्रिका does end in का (long ā) — the implementer's "missing a" claim is wrong; not escalated to the owner.
Task 4: fix round 1/5 dispatched → commit eaae700 (CIN/PAN/entity rejection tests, z.httpUrl + javascript: tests on all three URL fields); scoped re-review running.
Ruling R12: remaining fields without invalid fixtures (established min, whatsapp, emails, currency literals, gstRate bounds, policies enum, non-empty arrays/text) are not added — why: whatsapp shares the tested phone regex; emails/non-empty are library primitives; the domain rules (IDs, name, entity, split, network, links) are all pinned — cost if wrong: a later schema edit could loosen an untested primitive; final review may add them.
Task 4: fix round 1/5 (2 addressed, 0 open; commits 6dc94aa..eaae700)
Task 4: minor (deferred): rejection tests assert only success===false, not the failing path (bite probes covered it now).
Task 4: complete (commits 9357823..eaae700, review clean)
Task 5: dispatched (base eaae700)
Plan-writing: 02a atoms-core written + committed (4d0f281, with 2c patch: Container prose → max-w-text-measure-prose).
Ruling R13: every optional custom prop is `?: T | undefined` (matching React DOM prop types) so compositions forward possibly-undefined values under exactOptionalPropertyTypes — broadcast to writers 2b/3a/3b/4/5 and appended to plans 2a/2c — cost if wrong: slightly looser absence semantics; zero runtime cost.
Ruling R14: Plan 2b reuses 2a's lib/symbol-mark.tsx; everyone reuses lib/control-states.ts, lib/story-surfaces.tsx, transition-control — why: no duplicate internals — cost if wrong: none.
Task 5: implementer DONE (80166f4). Spec paths via import.meta.dirname (Vite rewrites new URL(import.meta.url) to http://localhost in jsdom).
Ruling R15: every spec/test that reads files uses `join(import.meta.dirname, …)` (never `new URL(…, import.meta.url)`) in packages/ui (jsdom) — broadcast to Task 7 dispatch and all plan writers — cost if wrong: none.
Task 5: minor (deferred): `@source "./"` also scans test files, so test-only classes reach consumer CSS — consider `@source not "./**/*.test.tsx"`.
Task 5: minor (deferred): tailwind-merge direct dep may be redundant (tailwind-variants bundles/peers it) — verify in final review.
Plan-writing: 03b molecules-domain written + committed. Rulings R16: OfferSeal scale sm110/md156/lg260/xl360 final (Plan 4 hero uses md); PricingCard normalised (size variant deferred to web step); AnnouncementBar 1-frame expiry flash accepted, web step schedules rebuild at offer end — cost if wrong: minor CLS on stale caches.
Plan-writing: 05 storybook-kits-docs written + committed. Ruling R17: misspelled review words elided with […]; PriceTag gains size="canvas" (Plan 2b) and the Marketing kit uses it; kit sample copy stays under the Reference-kit badge — cost if wrong: copy edits only.
Plan-writing: 04 organisms written + committed. Ruling R18: SiteHeader drawer below lg (handoff) — spec §9.3 amended in Plan 5 T14; review misspelling elided in Plan 4 fixtures too — cost if wrong: one breakpoint class.
Task 5: review Needs fixes — 3 Important (plan-mandated): RevealObserver remount (StrictMode) leaves sections hidden; twMerge drops border-default (no border-width group); reduced motion removes the spec'd fade.
Ruling R20: fix all three AND fold in reviewer minors 4 (z/duration/scrim/autogrid classGroups so className overrides win — correctness, same file), 5 (print transition:none), 6 (:is(selector) for selector lists), 7 (remount + mutation-path tests), 8 (@source not spec/test/stories) — why: same files, small, each would otherwise bite a later plan — cost if wrong: none.
Ruling R19 (recorded): the brand symbol is one shared CSS mask (Plan 1 Task 7 Step 3b generates src/lib/brand-artwork.css with --pp-symbol-mask + @utility mask-symbol); SymbolMark = masked span; PatternField uses var(--pp-symbol-mask) — why: inline path data per diamond would add ~400 KB to a menu page — cost if wrong: none (fewer bytes).
Plan-writing: 02b written + committed (e539d56) with R19 + 2b rulings (tooltip delay 0; no on-brand controls; read-only Select + hidden input; one radius-diamond token).
Plan-writing: 03a written + committed — ALL PLANS WRITTEN. Ruling R21: text-entry controls render values at 16px (iOS focus zoom; handoff uses 16px) — owned by 2b lib/field-control.tsx — cost if wrong: 1px larger than the DS card's 15px.
Task 5: fix round 1/5 → commit b8b1743 (F1–F3, M4–M8; 47 tests; border-width groups extended to all sides; @source not works); scoped re-review running
Task 5: fix round 1/5 (8 addressed, 0 open; commits 80166f4..b8b1743)
Task 5: minor (deferred): RevealObserver `tagged` set retains removed sections until unmount.
Task 5: minor (deferred): autogrid/scrim groups don't conflict with stock grid-cols/gap/bg-none; spec doesn't assert scrim/autogrid lists against @utility blocks.
Task 5: complete (commits eaae700..b8b1743, review clean)
Task 6: dispatched (base b8b1743... HEAD addd210)
Task 6: implementer DONE (d471636 style, d4efadf gates). R3 applied: atom rule uses regex (gitignore pattern blocked ../../lib). R1 applied.
Ruling R22: untrack + gitignore apps/*/next-env.d.ts (Next regenerates it on every build/lint; create-next-app ignores it) — folded into Task 8's dispatch — cost if wrong: re-add one generated file.
Task 6: minor (deferred): atom rule misses roundabout paths (../../atoms/x, ../../index barrel).
Task 6: review Approved + 1 Important (plan-mandated): `w-(--x)` var shorthand and `[prop:val]` arbitrary properties pass lint (plugin only catches `-[…]`), and handbook 03 §1's example uses `h-(--button-h-sm)`.
Ruling R23: fix round 1 adds custom rule `pink-paprikaa/no-arbitrary-shorthand` (flags class tokens with `-(--` or a leading `[prop:`) + probe; tightens the atom rule against roundabout paths with `^(?:\.\./)+(?:atoms/(?!icon(?:/|$))|index$)` + probe; fixes stale comments (naming-convention.js header, react.js cssConfigPath note); Task 9 additionally rewrites docs/engineering/03-patterns.md §1 from the real Icon code — cost if wrong: none.
Task 6: minor (deferred): compoundVariants/compoundSlots classes unchecked by the plugin (ignoredKeys) — record in 06 gate registry (Task 9).
Task 6: minor (deferred): tailwind block omits **/*.js; prettier tailwindFunctions lacks cn/clsx — no .js class files / no cn helper today.
Task 6: minor (deferred): atom rule would block `../z` inside nested atom folders (none exist).
Task 6: fix round 1/5 → 9c76db5 (no-arbitrary-shorthand rule + test + probes; roundabout atom regex; stale comments; shared rules/plugin.js to avoid 'Cannot redefine plugin'); scoped re-review running
Task 6: fix round 1/5 (3 addressed, 0 open; commits d4efadf..9c76db5)
Task 6: minor (deferred): shorthand rule misses opacity modifier `/(--alpha)` and variant `max-(--bp):`; bare `../../atoms` barrel path allowed; react.js:56-59 comment stale.
Task 6: complete (commits addd210..9c76db5, review clean)
Task 7: dispatched (base 9c76db5)
Task 7: implementer DONE (c2b187a): 75 ui tests, 9 story tests; region did not fire; IconComponent typed via React SVG props (naming LAW).
Ruling R24: storybook:test must re-run when packages/ui stories/components change — Task 8 adds inputs (e.g. "^default" or {workspaceRoot}/packages/ui/src/**) to apps/storybook test target — cost if wrong: slower cached runs.
Ruling R25 (pending review): lockup inline artwork ~59 KB raw — reduce svgo floatPrecision to 1 in the generator (sub-pixel at logo sizes), measure, keep inline (forced-colors safe).
Task 7: concern → Task 8: storybook-static embeds absolute local paths incl. the username; the founder guard over storybook-static must pass — remove the leak (never narrow the guard).
Task 7: review Approved + 1 Important (plan-mandated): inline lockup 57.9 KB raw at svgo default precision (≈90 KB gz per page with RSC payload duplication).
Ruling R25 (final): fix round 1 sets svgo floatPrecision 1 (lockup 18.7 KB, wordmark 15.1 KB; ≤0.05 viewBox units ≈0.03 px at 240 px) with a before/after visual diff at the largest story size; folds in minors 2 (Logo Omit width/height, JSDoc h-* w-auto sizing), 3 (generator: {3,8} hex, assert no href="#", markup not starting <svg, finite width/height; fill="currentColor" on Logo root), 4 (ids non-empty), 5 (badge inset x/y/width asserted); and minor 6 — remove the SYMBOL_DATA_URI_WHITE export (use var(--pp-symbol-mask) only) and update contracts §1 + plan 2a note — cost if wrong: an invisible artwork change.
Ruling R25 amended: floatPrecision 2 (not 1) — precision 1 visibly distorts the lotus ring around the i-dots (brand: never alter the logo); lockup 23.4→14.8 KB gz; viewBoxes unchanged; pixel diff ≤0.095% AA edges — cost if wrong: 7.5 KB gz per lockup.
Task 7: fix round 1/5 → d25519d; scoped re-review running
Task 7: fix round 1/5 (6 addressed, 0 open; commits c2b187a..d25519d)
Task 7: minor (deferred): Logo JSDoc says h-12 w-auto, story uses h-10 w-auto (both valid).
Task 7: complete (commits 9c76db5..d25519d, review clean)
Task 8: dispatched (base 15d578b) with R22 (gitignore next-env.d.ts), R24 (storybook test inputs), username-path leak.
Task 8: implementer DONE (94ff380, 4d43e42, 99d3050); guard clean over storybook-static (docgen abs paths + NODE_PATH removed); R24 cache proof; R22 done
Task 8: minor (deferred, final-review triage): docgen path-rewrite has no self-check (add generateBundle throw if WORKSPACE_ROOT survives); Windows backslash paths; storybook stories re-scan glob only .stories.tsx (make {ts,tsx}); storybook typecheck inputs miss .storybook/** (set default,^production); next-env.d.ts will matter once apps import images (add next typegen before lint then).
Task 8: complete (commits 15d578b..99d3050, review clean)
Task 9: dispatched (base 99d3050)
Task 9: implementer DONE_WITH_CONCERNS (aab7676): the Tailwind plugin DOES check `class:` in compoundVariants/compoundSlots but not `className:` (docs corrected); Icon/Logo/RevealObserver props not yet R13 (drift ledger → final fix wave); design-tokens README component-tier lines + CLAUDE.md stale (Plan 5 T14 / final wave); generator output needs prettier (documented; consider running prettier in the script).
Task 9: review Needs fixes — 1 Important (05 registry next.config names swapped: real files apps/web/next.config.js, apps/blog/next.config.mjs) + 10 minors (surface-alias pitfall, focus ring not inset, atom import list LAW vs lint, Slot type/disabled wording, $type typography, contract ?: T → ?: T | undefined, spec §11.2 no-arbitrary-shorthand row + cssConfigPath, spec §6.1 tree/tiers stale, 06 known gaps need drift-ledger owner, rule-count/recipe 08 light.json).
Ruling R26: fix round 1 folds ALL 11 findings (docs-only, same files, each would mislead Plan 2+ implementers) — cost if wrong: none.
Task 9: fix round 1/5 dispatched (base aab7676, findings task-9-fix-1.md)
Task 9: fix round 1/5 → 0c3724e (11 addressed; also corrected 02/06 atom-import LAW wording, 05 basePath blog-only, §6.1 semantic group names). Concern: plan 5 lines ~3750/~4073 still say "inset ring" → routed to plan 5 dev-parity audit.
Ruling R27 (OWNER DIRECTIVE 2026-09-27): dev branch's 74 August-port components are the starting point — port+upgrade, 16 handoff new, 90 total. Mechanism: read via `git show dev:…`, never restore (old token names/templates/ would break gates); spec+contracts+plan win conflicts; dev = parity floor (every behaviour/edge/a11y/test/story state kept unless spec contradicts, named with clause); parity table in every component report. Contracts §0.0 added. Parallel audit of plans 2a–5 vs dev amends each plan up front — cost if wrong: extra plan text, no code risk.
Ruling R28 (OWNER DIRECTIVE 2026-09-27: "never let anything vanish"): SDD workspaces are NEVER deleted (overrides the skill's Finish step). They are rsynced (minus *.diff) to tracked docs/superpowers/records/sdd/ and committed at every task completion and plan finish (first archive e6d73d8). Uncommitted work is committed promptly. Never reset/rebase/force/clean/stash-drop. The dev and main branches are read-only. Local tags checkpoint each plan — cost if wrong: ~1 MB per plan in git.
Task 9: fix round 1/5 (11 addressed, 0 open; commits aab7676..0c3724e)
Task 9: minor (deferred → final fix wave): atom lint allows barrel via "../..", "../../", "../../index.ts" (regex matches only exact `index`) — tighten regex to `(?:\.\.)?/?$|index(?:\.[jt]sx?)?$` or narrow wording in AUTHORING:39-41, 02:27, 06:35; spec §11.2 atomic-layering row (~789) still overclaims "atoms/icon + lib".
Task 9: complete (commits 99d3050..0c3724e, review clean)
Dev-parity 2c: ADD 30 / DROP 11 / ALREADY 55; deltas: Container as ul|ol, AppShell size fluid (pending batch ruling); concern: autogrid-min-* not in twMerge classGroups → Plan 1 final fix wave.
Dev-parity 5: ADD 29 / DROP 13 / ALREADY 63; 0 deltas; inset-ring fixed. Ruling: Task 14 README replacements must carry every current paragraph unless false (R28) — note added to plan 5 Task 14. animate-spin-pulse unused in plans 2–4: LEAVE (DS styles.css ships it; Plan 5 motion page shows it).
Dev-parity 2b: ADD 61 / DROP 28 / ALREADY 104.
Ruling R29 (2b P1): Checkbox `indeterminate` PROP dropped (needs a client ref effect → every Checkbox client, violates D6) BUT capability kept: add `:indeterminate` styling (dash glyph) + a story where a client consumer sets it via `ref` — parity by capability — cost if wrong: consumers write one ref line.
Ruling R30 (2b P2): Tooltip gains `open`/`defaultOpen`/`onOpenChange` (spec §8.1 naming; Radix passthrough) — contracts §3 edit in the batch.
Routed to Plan 2b Task 0 (and 2a Task 0 check): tests that query the brand mark as inline <svg> (Input, Spinner, Rating, SpiceLevel) must query the R19 `mask-symbol` span; drop SYMBOL_DATA_URI_WHITE expectations; merge the end-of-plan controller amendments (read-only Select hidden input, rounded-diamond, R21 16px field text — fixes Task 2's size-based text assertions) into task code before Task 1.
Dev-parity 3b: ADD 55 / DROP 17 / ALREADY 70 (9 ported, 11 handoff).
Ruling R31: accept OutletCard `href`/`linkAs` (spec §9.2) and LogoLockup `isDecorative` (dev parity; matches Logo) — contracts §6 edits in the batch.
Ruling R32: FilterBar gains `name` + `onBlur` (spec D17 value-control rule for RHF Controller) — contracts §6 + plan 3b FilterBar task via Task 0 — cost if wrong: two unused props.
Routed to Plan 3b Task 0: `decorators: []` is a no-op in Storybook 10.5 (decorators always merge) — Tasks 16/17 (6 uses) must use a story `render` wrapper or a meta without the width decorator; CouponTicket 360px stacked layout has no design source → Task 21 parity review checks it; Narrow plays use fixed-width wrappers.
Dev-parity 4: ADD 73 (62 in plan, 11 pending deltas) / DROP 41 / ALREADY 98.
Ruling R33: accept all 7 plan-4 deltas (TestimonialWall lede, FaqSection defaultOpen, OrderTracker progressLabel, Dialog hasCloseButton + className, MenuList defaultCategory + lede) — parity floor, optional, spec-compatible — contracts §7 edits in the batch; plan 4 Task 0 writes the 11 pending ADDs into task code.
Ruling R34: two DS-over-dev DROPs stand (CartPanel shows unit price per DS, TestimonialWall defaults plain) — spec: DS is source of truth — cost if wrong: one prop default.
Fix: plan 3b review fixture (line 1962) one-a "Pink Paprika" elided to "[…]" per R17, matching plan 4/5.
Dev-parity 2a: ADD 51 / DROP 40 / ALREADY 50.
Ruling R35: ImageSlot root takes native div props (contracts §0 already says every Props extends its root's native props — contract §2 bug) — contracts batch.
Ruling R36: Link isExternal announces a built-in visually-hidden "Opens in a new tab" (WCAG G201), no `externalLabel` prop — English-only site, same class as StatusDot tone names (a11y text, not content under D9) — cost if wrong: one optional prop later. Cross-plan: plans 3a/3b/4 Task 0 switch exact-name queries of external links to prefix regex (`{ name: /^Instagram/ }`).
Ruling R37: Tag selected-hover follows DS readme §3.8 (ADD stands). Avatar keeps initials under the photo (image-error fallback) — accepted.
Routed to Plan 2a Task 0 (load-bearing): apply R19 (SymbolMark/Divider/StatusDot tests query the mask-symbol span, not inline svg), the one radius-diamond token (StatusDot must not create radius-status-dot), and R13 (`?: T | undefined`) to every interface before Task 1.
Final review (Plan 1, 68b2b9a..0c3724e): With fixes — 1 Critical (prettier/eslint need design-tokens dist before build → fresh CI/clone fails format:check + pre-commit), 3 Important (typecheck cache inputs exclude tests/stories/.storybook; dev index.spec.ts guards dropped w/o reason; storybook publish path unguarded), 7 minors. Triage table + dev-parity table in records.
Ruling R38: ONE fix wave takes C1, I1–I3, M1–M7, every FIX NOW triage row, every dev-parity ADD (Icon/Logo tests + Labelled story), and the Task 9 deferred items (spec §11.2 atomic-layering row wording). autogrid-min-*/pattern-tile-*/pattern-opacity-* classGroups routed to Plans 2c/2a (they create those utilities). LEAVE rows stand as reviewed.
Contracts batch applied (R29–R35 + 2c deltas: Container as ul|ol, AppShell size fluid — accepted per R27 parity floor, one enum member, no new token).
Dev-parity 3a: ADD 94 / DROP 40 / ALREADY 75 / DELTA 5.
Ruling R39: accept SearchField clearLabel, QuantityStepper decrement/incrementLabel, TabItem isDisabled, Tabs isFullWidth (parity, additive). DROP Accordion item isDisabled — spec §9.2 mandates native <details>, which cannot be disabled; a non-details row changes semantics — cost if wrong: one FAQ state.
Ruling R40 (3a concerns, routed to Plan 3a Task 0): (1) QuantityStepper/Pagination keep DS visual sizes (32/40, 40) but hit area ≥44px via before:-inset pseudo-element, same as IconButton contract; (2) Pagination renders nothing for one page — stands (reasonable user expectation); (3) Tabs overflow = horizontal scroll rail (dev parity, consistent with FilterBar/Cluster rails), not wrap; (4) Accordion heading-level DROP stands (summary strips heading role); (5) toasts: danger assertive, others polite — stands; (6) Task 0 runs ESLint tailwind plugin on the new variants (group-has-disabled/form-field:, group-disabled/slot-picker:, before:-inset-2, max-w-120) before Task 1.
Final fix wave → b232175 ef99127 99eff8c 6a65c84 e941a9b 554cc8d 7d77755 bbe51e0 d8abc96 c1bc57c (all gates green, 12 projects).
CORRECTION: e6d73d8 did NOT archive the records — the copied workspace .gitignore (`*`) ignored them all; my status reports claiming they were committed were wrong. Fixed in 7b62b3b (43 files tracked); rsync now excludes .gitignore; CLAUDE.md updated.
Ruling R41 (fix-wave residuals): IconComponent `size` stays `?: number | string` (| undefined breaks lucide assignability — external type) — accepted. Origin URL kept out of CLAUDE.md (owner segment = founder name) — accepted. formatCount rounding widening — accepted. Barrel via `../../../src/index` and self-package import `@pink-paprikaa-web/ui` inside ui → parked, owner Plan 2a Task 0 (extend atomic-layering; no occurrences in plans). `nx affected` with orphan main: CI nx-set-shas on a PR with no merge base untested → parked, owner Phase 6 cutover / first CI run.
