# Batch C report — carried fixes C1–C6, Task 4 (TestimonialWall), Task 5 (FaqSection)

Base: `25c4f15` (feat/design-system, tree clean). End: `01e9c61`, tree clean. `stash@{0}`
(`5271974…`, "lint-staged automatic backup") untouched — its hash was checked after every commit.

## Status log (resume point)

- [x] Read contract, global constraints, progress (R110/R111), fold list, carried-fixes-C, briefs 4/5, batch B report. Briefs 4/5 are byte-identical to the plan's Task 4/5 sections at `25c4f15`.
- [x] C1 `b13465b`, C2 `f4ce7dc`, C4 `a4392fb` (plan patches)
- [x] C5 `b497c6a` (test change; RED seen)
- [x] C3 `569e820` (plan Task 1–3 code = built files; done after C5 so the plan records the C5 tests)
- [x] Task 4 TestimonialWall — `b471a55` (gate, format:check, storybook:test green; no plan re-sort needed)
- [x] Task 5 FaqSection — `da901b8`, plan re-sort `01e9c61` (gate, format:check, storybook:test green)
- [x] Final: format:check exit 0, storybook:test 856 / 90 files exit 0, `pnpm guard:founder` clean

## Carried fixes

| Fix | Commit | What changed | Evidence |
| --- | --- | --- | --- |
| C1 (R111) | `b13465b` docs | Plan Task 8: social IconButton `label` and `<a aria-label>` = `` `${link.label} (Opens in a new tab)` ``; both test assertions now `"Instagram (Opens in a new tab)"` / `"YouTube (Opens in a new tab)"`; `FooterSocialLink.label` JSDoc says the footer appends the phrase. Also fold item 23's second half: Task 13's `EMPTY` story anchor gains `<span className="sr-only"> Opens in a new tab</span>` (LinkCard's wording). | Prettier-clean staged copy; format:check exit 0 |
| C2 (item 21) | `f4ce7dc` docs | Global Constraint "Fields and the pattern" now prescribes `absolute inset-0 bg-transparent` and why. Task 6 QuotePanel and Task 8 SiteFooter pattern slots carry `bg-transparent`. Task 6 had **no** merge test: added "merges a caller className over its own, and the diamond layer lets that ground show" (Step 5 count 12 → 13). Task 8's merge test renamed to that wording, renders `pattern="default"` (brand's default is no layer) and asserts the layer is `bg-transparent`, not `bg-surface-brand`; its parity row renamed. Tasks 1–3's slots are in C3. Task 7's PatternField is the header itself (children inside), not a layer — untouched. | format:check exit 0 |
| C3 | `569e820` docs | Tasks 1–3's component, test and story code blocks replaced with the built files (script compared every block: all 13 now byte-identical, incl. HeroBanner `WithPhotograph`'s `inset-x-6`). Expected counts: CtaBand 12 → 14, StatBand 12 → 14, HeroBanner 15 → 17. Parity tables gained `_(not in dev)_` rows for items 18/19/21. | `/tmp/ppC-extract.mjs 261 1880` → all SAME |
| C4 | `a4392fb` docs | Task 11: the `hasCloseButton={false}` test is now "…; Escape and the scrim still ask to close": after Escape it clears the mock, clicks `.bg-surface-overlay` (outside the panel), expects `onOpenChange(false)` and the controlled dialog still present (count stays 17). `MustBeAnswered`'s play clicks the scrim after Escape and asserts the dialog is still visible. Parity row notes the play covers Escape + scrim. | Probed first against the installed `radix-ui` Dialog in jsdom with the exact assertions (throwaway test, 1 passed, deleted) |
| C5 | `b497c6a` test(ui) | New tests: CtaBand "renders the wrapper for a 0 overline, body or action — a number is content"; HeroBanner "…for a 0 badges, overline, body, actions or media…"; StatBand "renders the sub-line wrapper for a 0 sub…" (StatBand gates nothing itself — this pins Stat's `isShown` through the organism). | RED: with every `isShown(x) ?` temporarily swapped for `x ?` (CtaBand, HeroBanner, Stat), exactly these 3 failed, 42 passed; restored, ui gate typecheck/lint/test 1424 / 94 green |
| C6 | process | Every task ran Prettier → `lint --fix` → Prettier again before the gate. | format:check exit 0 on every code commit |

## Task 4 — TestimonialWall

**Built:** `organisms/testimonial-wall/{testimonial-wall,testimonial-wall.test,testimonial-wall.stories}.tsx`; barrel entry after StatBand (path order). No tokens (section-y, container-page, autogrid). Stories byte-identical to the plan (10).

TDD: test first — `Failed to resolve import "./testimonial-wall"`, no tests; after the implementation 10/10. The `role="list"` assertion was seen RED separately (role removed → that one test failed, 9 passed).

**Deviations from the plan:**

- Item 19: the grid `ul` carries `role="list"`; the "lists one review card…" test asserts the attribute. Still 10 tests.
- No item-18 empty-slot test: the item does not name Task 4 and TestimonialWall wraps no slot — `overline`/`lede` go straight to SectionHeader, which gates them on `isShown` itself.
- The plan's Task 4 code blocks still lack `role="list"` (component and test) — not patched (no re-sort was needed, and the dispatch asked for no plan sync beyond Tasks 1–3).

**Dev parity** (plan table, extended):

| Dev item | Ruling | Where / clause |
| --- | --- | --- |
| Heading and every review render | ALREADY | tests "heads the wall…", "lists one review card per review…" |
| The component adds the quote marks | ALREADY | ReviewCard's behaviour (Plan 3b, spec §9.2); the test asserts the verbatim text |
| `lede` under the heading | ADD | contract delta 1 (R110); test "renders the lede under the heading"; story `WithLede` |
| `headingLevel` | ALREADY | test "takes its heading level from headingLevel" |
| Each score announced as an image | ADD | test "announces each score as an image with its value" ("5.0 out of 5", fold item 10) |
| No score when a review carries none | ADD | test "omits the score for a review that carries none" |
| Cards pale pink by default (`variant = "brand"`) | DROP | D1 — design system defaults `variant="default"`; `brand` tested ("dresses every card…", `data-surface="soft"`, fold item 11) |
| `mark="symbol"` forced on every card | DROP | D1 — a review's own `mark` passes through `ReviewCardProps` |
| Auto-fit grid survives 360px | ALREADY | `autogrid` test; story `Mobile` (floor360) |
| Merges a caller `className` | ADD | test "merges a caller className" |
| axe | ALREADY | test "has no accessibility violations" |
| `WallReview` type | ALREADY | `ReviewCardProps` (contract §7) |
| Stories Default · DefaultCards · Narrow | ALREADY | Default · BrandCards · Mobile |
| Story SixReviews (invented guests) | DROP | spec §10.1 — real reviews only; four exist (`FourReviews`) |
| Story WithLede | ADD | `WithLede` |
| Story WithoutScores | ADD | `WithoutScores` |
| Dev `overline`/`lede` as `string` | ALREADY | `ReactNode` (D10), gated by SectionHeader's `isShown` |
| _(not in dev)_ explicit list semantics | ADD | fold item 19; the list test asserts `role="list"` |

Contract deviation row (item 9) as built: TestimonialWall `+ lede?: ReactNode` → SectionHeader — matches the plan's row.

**Gates** (`/tmp/ppC-t4-gate.log`, `/tmp/ppC-t4-fmt.log`, `/tmp/ppC-t4-sbt.log`):

- Prettier → `pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache` → Prettier: exit 0, no changes.
- `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build` — exit 0. design-tokens 284 / 4 files; ui 1434 / 95 files (1424 + 10); Storybook build ok.
- `pnpm nx format:check` — exit 0.
- `pnpm nx run storybook:test` — exit 0, 843 / 89 files (`testimonial-wall.stories.tsx` 10). No cold-cache failure.

**Commit:** `b471a55` feat(ui): add the TestimonialWall organism.

## Task 5 — FaqSection

**Built:** `packages/design-tokens/tokens/component/faq-section.json` (`faq-section-gap`, `faq-section-sticky`; no R61 marker — `gap` and `top` uses only), appended to `SPACING`; `organisms/faq-section/{faq-section,faq-section.test,faq-section.stories}.tsx` (stories byte-identical to the plan, 11); barrel entry between CtaBand and HeroBanner. `dist/theme.css`: `--spacing-faq-section-gap: clamp(28px, 4vw, 56px);`, `--spacing-faq-section-sticky: 120px;`.

TDD: test first — `Failed to resolve import "./faq-section"`, no tests; after the implementation 8/8. The two `defaultOpen` tests were also seen RED with the forwarding removed (2 failed, 6 passed).

**Deviations from the plan:**

- Prettier re-sorted the `inner` and `lead` slot classes once the tokens existed (`container-page grid items-start gap-faq-section-gap lg:grid-cols-2`; `flex min-w-0 flex-col gap-6 lg:sticky lg:top-faq-section-sticky`); the plan's copy re-sorted in `01e9c61`. Otherwise the plan's code verbatim — the plan's Task 5 blocks now equal the built files.
- No item-18 test: `aside` is a bare `{aside}`, and `overline`/`lede` are SectionHeader's to gate.

**Dev parity** (plan table, extended):

| Dev item | Ruling | Where / clause |
| --- | --- | --- |
| Heading, lede and every question | ALREADY | test "heads the section with overline, a level-2 title and the lede" |
| The first answer open on arrival | ALREADY | test "opens the first answer by default…" |
| `defaultOpen` (named questions, or `[]` for none) | ADD | contract delta 2 (R110), forwarded to Accordion; tests "opens the answers named in defaultOpen…", "opens none…"; stories `SecondOpen`, `AllClosed` |
| Clicking another question swaps the open answer | ALREADY | native `<details name>` (shared `name` asserted); Plan 3a Accordion's play proves exclusivity |
| `isMultiple` keeps several open | ALREADY | test "lets several answers stay open with isMultiple" |
| Questions sit one heading level below the section | DROP here | Plan 3a's Accordion renders questions in `<summary>` with no heading level — cross-plan note (concerns) |
| Two columns stack at 360px | ALREADY | `lg:grid-cols-2`, one column below; story `Mobile` |
| Merges a caller `className` | ADD | test "merges a caller className" |
| axe | ALREADY | test "has no accessibility violations" |
| "A few bakes contain egg" answer | DROP | C10 (pure veg, no egg) |
| Stories Default · Multiple · Narrow | ALREADY | Default · Multiple · Mobile |
| Story WithoutLede | ADD | `WithoutLede` |
| Story HeadingLevels | ADD | `HeadingLevel3` |
| Stories SecondOpen · AllClosed | ADD | `SecondOpen` · `AllClosed` |
| _(not in dev)_ sticky heading column with an aside | ADD | handoff FaqBlock; test "puts the aside beside the heading in the column that sticks at lg"; story `HandoffWithAside` |

Contract deviation row (item 9) as built: FaqSection `+ defaultOpen?: string[] | undefined` → Accordion (its `undefined` = the first) — matches the plan's row.

**Gates** (`/tmp/ppC-t5-gate.log`, `/tmp/ppC-t5-fmt.log`, `/tmp/ppC-t5-sbt.log`, `/tmp/ppC-final-*.log`):

- Prettier → `lint --fix` → Prettier: exit 0 (the first Prettier pass did the class re-sort).
- Same gate chain — exit 0. design-tokens 284 / 4 files; ui 1442 / 96 files (1434 + 8); Storybook build ok.
- `pnpm nx format:check` — red on the plan doc only (the re-sort); fixed in `01e9c61`, re-run exit 0.
- `pnpm nx run storybook:test` — exit 0, 856 / 90 files (`faq-section.stories.tsx` 11; docs-kit `catalogue.spec.ts` 157 → 159 for the two new tokens). Re-run on `01e9c61`: 856 / 90, exit 0 (Nx cache hit — that commit changed only the plan doc). No cold-cache failure.
- `pnpm guard:founder` — clean.

**Commits:** `da901b8` feat(ui): add the FaqSection organism · `01e9c61` docs: re-sort the faq section classes in plan 4 now that its tokens exist.

## Concerns

- Ordering: C3 (plan sync) landed after C5 rather than with C1–C4, so the plan records the C5 tests; C1, C2 and C4 were committed separately by writing each commit's exact content to the working tree (no partial staging, so lint-staged never had to stash unstaged changes).
- C2 added a merge test to plan Task 6, which had none (count 12 → 13); batch D builds from that.
- C1 also patched plan Task 13's `EMPTY` anchor (fold item 23's second half, not named in C1's text).
- The plan's Task 4 blocks lack the item-19 `role="list"` the build carries (component + test assertion); a later sync could fold it in.
- Cross-plan (Task 5 parity): FAQ questions carry no heading level (Accordion renders them in `<summary>`); if the outline should list them, that is a Plan 3a Accordion change.
- No concurrent edits observed: the plan file and tree changed only through this batch's commits.
