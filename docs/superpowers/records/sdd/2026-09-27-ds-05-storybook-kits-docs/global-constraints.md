# Design System — Plan 5 of 5: Storybook foundations, kits, form pattern, docs and gauntlet

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Storybook the design system's "Design System tab": all 33 guideline cards as live, token-read foundation pages (plus Contrast, Voice & content, Iconography, Company details, Utility classes, Section reveal), the Website / App / Marketing reference kits as page stories composed only from the library, the React Hook Form + Zod pattern, the final records, and a cold gauntlet with a whole-branch review — ending with an evidence table and the branch left unmerged for the owner.

**Architecture:** Foundation pages are MDX (`apps/storybook/src/foundations/<group>/*.mdx`) holding prose and `<Canvas of>` blocks only. Every live visual on a page is a **specimen story** in one hidden CSF file per group (`tags: ["!dev", "!autodocs"]` — out of the sidebar, still rendered in docs and still run by `storybook:test` with axe and `play`). Specimens read tokens only through `apps/storybook/src/docs-kit/catalogue.ts` over `@pink-paprikaa-web/design-tokens/tokens.json`; its lookups throw on a missing name, so a renamed token fails the suite instead of rendering a blank swatch. The Contrast page renders the **same evaluator the token gate runs** (`evaluateContrastPolicy`, moved into `packages/design-tokens/src/contrast.ts`). Kits and the form pattern compose only public `@pink-paprikaa-web/ui` exports, with facts from `@pink-paprikaa-web/content`.

**Tech Stack:** Nx 23 · pnpm 10 · React 19.2 · TypeScript 6 · Tailwind 4.3 · Storybook 10.5 (`@storybook/addon-docs` MDX 3 + remark-gfm, `@storybook/addon-a11y`, `@storybook/addon-vitest` browser mode) · Vitest 4 · `storybook/test` (Testing Library + user-event 14) · react-hook-form + `@hookform/resolvers` + Zod 4 (installed in Task 13).

**Spec:** `docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md` — read §1, §5, §7.3, §10, §11, §12, §16 before any task.

**Contracts:** `docs/superpowers/plans/2026-09-27-ds-00-contracts.md` — §8 (Storybook ownership) and §9 (story titles) are this plan's; every component API used here is the contract's.

**Depends on:** Plans 1–4 fully merged into `feat/design-system` (tokens, library core, all 90 components with stories, Storybook wiring from Plan 1 Task 8). This plan executes last.

## Global Constraints

Plan 1's constraints, verbatim:

- Package manager **pnpm only**; install with `pnpm add` (never hand-write a version in `package.json`). Workspace deps: `pnpm add <pkg> --workspace --filter <project>`.
- TypeScript stays on **6.x** (typescript-eslint caps `<6.1.0`). Node ≥ 24.
- **Never write a literal hex colour** in `.ts/.tsx/.js/.jsx` (`pink-paprikaa/no-raw-hex`, error). Test fixtures that need hex live in `.json` files.
- `#EE2C68` exists once: `packages/design-tokens/tokens/primitive/color.json`.
- **`Pink Paprikaa`** — two `a`s, everywhere. **No founder names** anywhere (source, comments, fixtures, output) — `scripts/check-founder-names.mjs` regex is `/rishav|pandey|anand/i`.
- **Pure veg brand:** nothing non-veg, not even egg (owner, 2026-09-27). Founded **2025**.
- Nx inferred tasks only — **no `project.json`**; per-project overrides go in `package.json` → `"nx"`.
- Named exports, function declarations, **no default exports** (except framework/tool config files). `ref` is a prop (React 19) — **no `forwardRef`**. No TS `enum`; use `as const`.
- Files kebab-case; one primary export per file; booleans prefixed `is/has/should/can/did/will/does`.
- Imports inside `packages/{utils,content,design-tokens}` use `nodenext` resolution → relative imports end in `.js`. Inside `packages/ui` (bundler resolution) relative imports have **no** extension.
- Class names: **only token-backed utilities** — no arbitrary values (`h-[13px]`, `bg-[#…]`, `w-(--x)`); a missing value becomes a token first.
- Commits: Conventional Commits, author with `git commit -m` (commitlint runs in the `commit-msg` hook). Allowed scopes: `web blog storybook ui tokens content seo utils tools ci deps`. Every commit message ends with the `Co-Authored-By:` trailer the harness supplies for the model actually running (the `Claude <model>` in the examples below is a placeholder — substitute it, never commit it literally). **Never `--no-verify`**, never `eslint-disable` a LAW rule.
- Verify APIs against the **installed** package (`node_modules/<pkg>`), never memory.
- A task is done only when its gate command output is green and pasted in the report.

Storybook rules added by this plan:

- **Foundation values are read from `tokens.json`, never retyped** — not in TSX, not in MDX prose. A number that is a token value appears on a page only because a specimen printed it from the catalogue. Design _rules_ that are not tokens (headline ≤ 6 words, lockup minimum 200px, the 360px floor) stay prose.
- **MDX holds prose and blocks only** — no `className` in MDX (ESLint cannot see it). Every visual is a specimen story in the group's hidden CSF file.
- Inline `style` in `apps/storybook` may reference only a token's custom property (`var(--…)` taken from the catalogue) or a value computed from `tokens.json` — never a literal.
- **The docs-kit is never imported by `packages/ui`** (and the boundary already forbids it: `type:ui` cannot depend on `type:app`).
- **Kits compose only public `@pink-paprikaa-web/ui` exports**; facts come from `@pink-paprikaa-web/content`; formatting from `@pink-paprikaa-web/utils`.
- **No fabricated reviews, ratings or testimonials.** The only reviews are the four verified Google reviews (handoff `design/rates.js` → `google.reviews`), quoted as written (one elision, recorded in `fixtures.ts`).
- **No founder names; no egg** — anywhere in fixtures, copy, alt text or captions.
- Void callbacks use block bodies (`onClick={() => { … }}`) — `@typescript-eslint/no-confusing-void-expression` is on. Numbers inside template literals go through `String()` — `restrict-template-expressions` is strict.
- Import order is owned by `perfectionist`; after writing a file run the task's lint with `--fix` and never hand-reorder to silence it.
- Prettier owns formatting, including MDX/Markdown table alignment and Tailwind class order: run `pnpm exec prettier --write <the task's new files>` before each task's gate, so `nx format:check` is green.
- Node-side specs that read a file build the path with `join(import.meta.dirname, "…")` from `node:path` — never `new URL("…", import.meta.url)`, which Vite rewrites to an http URL under Vitest's jsdom environment (ruling R15). Browser-mode story tests import JSON through the package export instead of reading files.
- Never Tailwind's static `max-w-prose`; the prose measure is the token utility `max-w-text-measure-prose`.
- `packages/ui`'s internal story helpers (for example `lib/story-surfaces.tsx`) are not public exports; Storybook's own pages use the docs-kit's `SpecimenTile`/`SpecimenRow` instead of deep-importing them.

## Contract deviations

| #   | Contract says                                                                                                               | This plan does                                                                                                                                                               | Why                                                                                                                                                                                   |
| --- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V1  | Docs-kit reads `@pink-paprikaa-web/design-tokens/contrast` for `contrastRatio`/`parseColor`                                 | The pair resolution + verdict logic moves from `policy.spec.ts` into `contrast.ts` as `evaluateContrastPolicy`; new exports `./catalogue` (type) and `./contrast-pairs.json` | The Contrast page must show exactly what the gate asserts; two implementations would drift. A relative import across packages is a boundary violation, so the JSON becomes an export. |
| V2  | Kits compose only `@pink-paprikaa-web/ui`                                                                                   | Kits also use `formatRupees` from `@pink-paprikaa-web/utils` for prices on 1080px canvases                                                                                   | `PriceTag` has no canvas size; `SocialHeadline` + `formatRupees` keeps the `₹` rules. Adding a canvas size to `PriceTag` is an open question for the owner.                           |
| V3  | Docs-kit helper list: Swatch, TokenTable, TypeSpecimen, ContrastMatrix, SpacingScale, RadiusScale, ShadowLadder, MotionDemo | Adds `Swatches` (a grid of Swatch), `SpecimenRow`, `SpecimenTile` (layout for specimens) and `catalogue.ts`                                                                  | Every specimen file needs the same row/tile layout; one definition keeps them identical.                                                                                              |
| V4  | Marketing kit sizes (zip: seal 360/110px, lockup 280/240/220/200px, notch pink)                                             | `OfferSeal` `xl` (360, feed post) and `sm` (110, MPU) — exact; `LogoLockup` `lg` 280 · `md` 240 (also for the kit's 220) · `sm` 200; `CouponTicket notch="brand"`            | Sizes are token enums (spec §8.2, Plan 3b deviations 7, 8, 12). Only the 220px lockups move, to 240.                                                                                  |

## Review Focus

1. **A token renamed later silently breaks a docs page.** Lookups must throw with the missing name, and every specimen must be a tested story — owned by **Task 2** (`MissingTokenFailsLoudly` + probe) and pinned in every foundation task by its specimens running in `storybook:test`.
2. **Company details with null facts.** Every `null` fact in `brand` must render as "Owner to supply", the count must be computed from the data, and no "TODO" may appear — owned by **Task 3** (`CompanyDetails` play + probe).
3. **Kits at 360px.** No kit page may scroll sideways at the 360px floor, and the test must prove it ran at 360 — owned by **Tasks 10–12** (`Homepage360`, `Home360`, `Feed360`, `Ads360` plays + probe).
4. **The Contrast page must show the exception pair as an exception, not a pass.** White on the brand pink renders "Exception", its measured ratio, and zero pairs fail — owned by **Task 4** (`ContrastMatrix` play + probe).
5. **RHF form completed keyboard-only.** Invalid submit shows every message and focuses the first invalid field; a keyboard-only fill submits the parsed values — owned by **Task 13** (`KeyboardOnly` play + probe).

---

## File map (this plan)

```
packages/design-tokens/src/{catalogue.ts,contrast.ts,policy.spec.ts}      C/M/M   Task 1
packages/design-tokens/package.json                                        M       Task 1
apps/storybook/package.json                                                M       Tasks 2, 13
apps/storybook/.storybook/preview.tsx                                      M       Task 2
apps/storybook/src/docs-kit/{token-files.d.ts,catalogue.ts,dom.ts,specimen.tsx,swatch.tsx,token-table.tsx,
  type-specimen.tsx,contrast-matrix.tsx,spacing-scale.tsx,radius-scale.tsx,shadow-ladder.tsx,motion-demo.tsx,
  docs-kit.stories.tsx}                                                    C       Task 2
apps/storybook/src/kits/fixtures.ts                                        C/R     Tasks 2, 10
apps/storybook/src/docs/introduction.mdx                                   R       Task 3
apps/storybook/src/foundations/brand/{brand.stories.tsx,company-details.tsx,logo.mdx,pattern.mdx,
  company-details.mdx,voice-and-content.mdx,iconography.mdx}              C       Task 3
apps/storybook/src/foundations/colors/{colors.stories.tsx,primary,ink,accents,heat,semantic,surfaces,status,contrast}.mdx  C  Task 4
apps/storybook/src/foundations/type/{type.stories.tsx,display,headings,body,overline-and-mono,devanagari,fluid}.mdx        C  Task 5
apps/storybook/src/foundations/spacing/{spacing.stories.tsx,scale,layout-rhythm}.mdx                                      C  Task 6
apps/storybook/src/foundations/layout/{layout.stories.tsx,breakpoints,autogrid,radii,borders,elevation,card-anatomy,utility-classes}.mdx  C  Task 7
apps/storybook/src/foundations/motion/{motion.stories.tsx,motion,states,form-states,section-reveal}.mdx                   C  Task 8
apps/storybook/src/foundations/marketing/{marketing.stories.tsx,canvas-formats,canvas-type}.mdx                            C  Task 9
apps/storybook/src/kits/{kit-notice.tsx,expect-no-overflow.ts}, kits/website/{website-kit.tsx,website.stories.tsx}          C  Task 10
apps/storybook/src/kits/app/{ordering-app.tsx,app-screens.tsx,item-sheet.tsx,app.stories.tsx}                             C  Task 11
apps/storybook/src/kits/marketing/{artboard.tsx,feed-artboards.tsx,ad-artboards.tsx,feed.stories.tsx,ads.stories.tsx}    C  Task 12
apps/storybook/src/patterns/{enquiry-form.tsx,forms.stories.tsx}                                                           C  Task 13
docs/engineering/{02,03,04,05,06,09}-*.md, docs/superpowers/specs/{2026-08-07-boilerplate-architecture-design,2026-09-27-design-system-rewrite-design}.md,
  CLAUDE.md, apps/storybook/README.md, packages/ui/README.md, docs/README.md                                                M  Task 14
```

---


## Controller amendments (2026-09-27)

- **Review quote with the one-`a` misspelling** — elide the misspelled words with "[…]" (as written); the guest's remaining words stay verbatim. Accepted.
- **Canvas prices** — Plan 2b adds `PriceTag size="canvas"`; the Marketing kit uses `PriceTag` for every price on an artboard (the design system: "Prices on artwork use PriceTag scaled up"), not `SocialHeadline` + `formatRupees`. Task 0 confirms the size exists and patches Task 12.
- **Kit sample copy** (promo code, franchise line, story paragraphs) stays under the "Reference kit" badge — accepted.
- **Form story title** `Molecules/Field/React Hook Form + Zod` — keep; the Task 15 sweep judges the sidebar.
- **`isContained` (ToastProvider) / `portalContainer` (Dialog, Toast)** — Task 0 confirms the names against Plans 3a/4 as built and patches the kits.
- **Plan 4 deviations to reconcile in Task 0:** CartPanel `emptyTitle`/`emptyBody`/`noteField` + `cartTotals`; OrderTracker `badge`/`codeLabel`/`paymentLabel`; QuotePanel `wasLabel`; Dialog `closeLabel`/`portalContainer`; SiteHeader `compactActions`/`drawerLinks`/`portalContainer` with the drawer below `lg`; CtaBand/SiteFooter/HeroBanner `pattern` enum (replaces `hasPattern`); SiteFooter `hasDockClearance`; MenuList server organism + client filter with `allLabel`/`filterLabel`/`overflowLabel`/`emptyState`. Task 14 also amends spec §9.3 (drawer below lg).

## Controller amendments — owner request 2026-09-28 (rulings R55, R56)

- **R55 — foundations run early.** Tasks 1–6 and 8 (contrast evaluator, plumbing + docs-kit, Introduction/Brand, Colors + Contrast, Type, Spacing, Motion) depend only on Plan 1 tokens and are executed right after Plan 2b batch C, before the rest of Plans 2b–4. Their Task 0 reconcile covers only what those tasks consume. Tasks 7 (Layout — needs Plan 2c) and 9 (Marketing foundations — needs molecules) and 10–15 stay in order.
- **R56 — every scale is copyable as a utility.** Owner: "Colors, Spacing, Typography, numeric examples like `border-2`, `mt-3`, `mt-4` … things which are copyable." Every foundation specimen row shows, next to its value, **the Tailwind utility class(es) it produces and its CSS custom property, each a copy button** with the same `role="status"` "copied" feedback as `Swatch`:
  - Colors: `bg-<name>`, `text-<name>`, `border-<name>`, `var(--color-<name>)`.
  - Spacing: the step's `p-<n>` / `m-<n>` / `mt-<n>` / `gap-<n>` examples (4px base, step × 4) and the named `spacing-*` tokens; `var(--spacing-…)`.
  - Border widths (`border`, `border-2`, …), radius (`rounded-<name>`), shadows (`shadow-<name>`), z-index (`z-<name>`).
  - Type: `text-<name>`, `font-<family>`, `font-<weight>`, `leading-*`/`tracking-*` where tokenised.
  - Motion: `duration-<name>`, `ease-<name>`, `animate-<name>`.
    Class strings are derived from the token catalogue (never hand-typed lists), so a renamed token fails `storybook:test`. One play per group copies one class and asserts the clipboard write.
