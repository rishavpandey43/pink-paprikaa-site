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

### Task 0: Reconcile with the code as built

Plans 2–4 were written in parallel with this one. Before writing anything, confirm every name and behaviour this plan relies on, and **patch this plan's later tasks in place** (edit the code blocks here, in this file) wherever the built code differs. Record every patch in the Task 0 report as `Task N, <file>: <old> → <new>, because <evidence file:line>`.

**Files:** none created. Modify this plan file only if reality differs; modify a `packages/ui` component only under Step 6.

- [ ] **Step 1: The workspace is green before this plan starts**

Run:

```bash
pnpm nx run-many -t typecheck lint test build --outputStyle=static 2>&1 | tail -15
for layer in atoms molecules organisms layouts; do printf "%s " "$layer"; find packages/ui/src/$layer -mindepth 1 -maxdepth 1 -type d | wc -l; done
```

Expected: all targets succeed; `atoms 30`, `molecules 38`, `organisms 15`, `layouts 7` (90). Anything else: stop and report — this plan does not repair Plans 1–4.

- [ ] **Step 2: Every public export this plan uses exists**

Run:

```bash
for name in Accordion AccordionItem Alert AppShell AutoGrid Avatar Badge BadgeProps Button Card CartLine CartPanel \
  CheckCard Checkbox ChipGroup ChoiceCardGroup ChoiceOption Cluster CouponTicket CtaBand Dialog DietMark Divider \
  FaqSection Field FieldProps FilterBar FooterColumn HeroBanner Icon IconButton ImageSlot Input InstagramGlyph \
  KeyValueItem KeyValueList LinkedinGlyph ListRow Logo LogoLockup LoyaltyCard MenuItemCard MenuList MenuListItem \
  NavLink OfferSeal OrderTracker OutletCard PatternField POST_FORMATS PostFormat PostFrame PriceTag QuantityStepper \
  Radio RadioGroup Rating ReviewCardProps RevealObserver SearchField Section SectionHeader Select SelectOption \
  SiteFooter SiteHeader SlotOption SlotPicker SocialHeadline SpiceLevel Spinner Stack StackProps Stat StatBand \
  StatusDot StepTracker Switch TabBar Table TableBody TableCell TableHead TableHeaderCell TableRow TestimonialWall \
  Text Toast ToastProvider TrackerStep YoutubeGlyph; do
  grep -Eq "\\b${name}\\b" packages/ui/src/index.ts || echo "MISSING export: ${name}"
done; echo "export check done"
```

Expected: only `export check done`. A missing **type** export that its component file does export (e.g. `CartLine`) is added to `packages/ui/src/index.ts` in Step 6; a missing component is a stop-and-report.

- [ ] **Step 3: Every Lucide icon this plan imports exists in the installed version**

Run:

```bash
node -e '
const lucide = require(require.resolve("lucide-react", { paths: ["packages/ui"] }));
const names = ["ArrowRight","ArrowUpRight","Bell","CreditCard","House","LogOut","Mail","MapPin","MessageCircle",
  "Phone","Plus","Receipt","Search","ShoppingBag","Store","User","Utensils"];
const missing = names.filter((n) => typeof lucide[n] !== "object" && typeof lucide[n] !== "function");
console.log(missing.length === 0 ? "lucide: all present" : "lucide MISSING: " + missing.join(", "));'
```

Expected: `lucide: all present`. For a missing name, pick the installed equivalent from `packages/ui/node_modules/lucide-react/dist/lucide-react.d.ts` and patch Tasks 3, 10–13.

- [ ] **Step 4: Every token name and prefix the specimens ask for exists**

Run (after `pnpm nx build @pink-paprikaa-web/design-tokens`):

```bash
node -e '
const catalogue = require("./packages/design-tokens/dist/tokens.json");
const base = new Set(catalogue.filter((e) => e.surface === null).map((e) => e.name));
const ramp = (p, steps) => steps.map((s) => p + s);
const names = [
  ...ramp("color-pink-", [50,100,200,300,400,500,600,700,800]),
  ...ramp("color-ink-", ["000",100,200,300,400,500,600,700,800,900]),
  "color-turmeric","color-turmeric-soft","color-turmeric-strong","color-tandoor","color-tandoor-soft",
  "color-mint","color-mint-soft","color-mint-strong","color-kesar","color-kesar-soft","color-kesar-strong","color-veg",
  ...ramp("color-heat-", [1,2,3,4]),
  ...["success","warning","danger","info"].flatMap((s) => ["color-status-" + s, "color-status-" + s + "-soft"]),
  "color-text-heading","color-text-body","color-text-muted","color-text-subtle","color-text-brand","color-text-on-brand",
  "color-surface-brand","color-brand-hover","color-brand-active","color-focus",
  "color-border-subtle","color-border-default","color-border-strong","color-border-brand",
  "shadow-1","shadow-2","shadow-3","shadow-4","shadow-brand","shadow-focus-ring","shadow-focus-ring-inverse",
  "border-width-default","border-width-strong",
  "spacing","spacing-gutter","spacing-gutter-mobile","spacing-gutter-desktop","spacing-section","spacing-section-mobile",
  "spacing-section-desktop","spacing-grid-gap","spacing-card-min","spacing-card-min-wide",
  "spacing-logo-lockup","spacing-logo-wordmark","spacing-logo-symbol", ...ramp("spacing-icon-", ["xs","sm","md","lg","xl"]),
  "spacing-header","spacing-header-compact","spacing-tabbar","spacing-hit","spacing-dock-clearance",
  "motion-press-scale","duration-instant","duration-fast","duration-base","duration-slow","ease-out","ease-in-out","ease-entrance","ease-pop",
  ...ramp("text-", ["display-1","display-2","h1","h2","h3","h4","body-lg","body","body-sm","caption","overline","mono"]),
  ...ramp("text-", ["display-1","display-2","h1","h2","h3","h4","body"]).map((n) => n + "-fluid"),
  ...ramp("text-canvas-", ["hero","h1","h2","body","caption","overline"]),
  "font-display","font-body","font-devanagari","font-mono",
  "canvas-pad","canvas-pad-tight","canvas-story-safe-top","canvas-story-safe-bottom",
  ...["post","portrait","story","landscape","wide","mpu","leaderboard"].flatMap((f) => ["canvas-" + f + "-w", "canvas-" + f + "-h"]),
];
const prefixes = ["color-surface-","color-text-","color-border-","radius-","duration-","ease-","motion-","breakpoint-",
  "container-","canvas-","text-canvas-","font-weight-","pattern-"];
const missing = names.filter((n) => !base.has(n));
const empty = prefixes.filter((p) => ![...base].some((n) => n.startsWith(p)));
const surfaces = ["brand","ink","soft","light"].filter((s) => !catalogue.some((e) => e.surface === s));
const undescribed = ["shadow-1","shadow-2","shadow-3","shadow-4","shadow-brand"].filter((n) => !catalogue.find((e) => e.name === n && e.surface === null).description);
console.log(JSON.stringify({ missing, empty, surfaces, undescribed }));'
```

Expected: `{"missing":[],"empty":[],"surfaces":[],"undescribed":[]}`. A missing name means a token was named differently — patch the specimen that asks for it (never add a token to satisfy a docs page).

- [ ] **Step 5: Behaviour assumptions — read, record, patch**

Read each file named and answer each question in the report. Where the answer differs from this plan, patch the named task's code.

| #   | Read                                                                             | Question — and the task it feeds                                                                                                                                                                                                                                                                                                               |
| --- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | `molecules/choice-card-group/choice-card-group.tsx`                              | Plan 3b deviation 1 says `ChoiceCardGroup` forwards `name`, `onChange`, `onBlur` and `ref` from `{...register("meal")}` to **every** radio `<input>` (spec D17) — confirm in the code and its test. (Task 13; if not, Step 6)                                                                                                                  |
| A2  | `molecules/quantity-stepper/quantity-stepper.{tsx,test.tsx}`                     | Exact accessible names of the increase/decrease buttons (e.g. `Increase guests`)? Are they `type="button"`? (Task 13 play)                                                                                                                                                                                                                     |
| A3  | `molecules/chip-group/chip-group.tsx`                                            | Plan 3b: `type="single"` renders `role="radiogroup"` with items `role="radio"` + `aria-checked`, named by their label; a single group never deselects; `onBlur` is a prop (deviation 5). Confirm, since the Task 13 play presses ArrowRight then Space. (Task 13)                                                                              |
| A4  | `molecules/field/field.tsx`                                                      | Is the label a `<label htmlFor={id}>`; does the required marker change the accessible name (`Name *` vs `Name`)? The plays use `/^Name/`-style regexes, so either is fine — confirm. (Task 13)                                                                                                                                                 |
| A5  | `atoms/radio/radio.tsx`                                                          | `RadioGroup` exported beside `Radio`, props `legend`, `isLegendHidden`, `status`; it spreads fieldset props (`id`, `aria-describedby`). (Tasks 11, 13)                                                                                                                                                                                         |
| A6  | `molecules/table/table.tsx`                                                      | Parts and `caption`/`isCaptionVisible`/`minWidth` as the contract; does the scroll wrapper handle `scrollable-region-focusable`? (Task 2)                                                                                                                                                                                                      |
| A7  | `layouts/post-frame/post-frame.tsx`                                              | `POST_FORMATS[format]` is `{ width, height, label }`; the frame is `position: relative`; `isFit` fits the parent's width. (Tasks 9, 12)                                                                                                                                                                                                        |
| A8  | `molecules/logo-lockup/*`, `molecules/offer-seal/*`, `molecules/coupon-ticket/*` | Plan 3b fixes the scales — LogoLockup `sm` 200 · `md` 240 · `lg` 280 · `xl` 360 (default tone **white**); OfferSeal `sm` 110 · `md` 156 · `lg` 260 · `xl` 360, bleed `sm` = 1/12, `md` = 1/6 of the side; CouponTicket adds `notch="brand"`. Confirm against the component tokens. (Tasks 3, 12)                                               |
| A9  | `layouts/app-shell/app-shell.tsx` + tokens                                       | Width of `size="phone-sm"` — must be ≤ 360px for `Home360`. If it is wider, `Home360` renders the screens without `AppShell` and the report says so. (Task 11)                                                                                                                                                                                 |
| A10 | `layouts/cluster/cluster.tsx`                                                    | With `isScrollable`, does Cluster make the rail keyboard-focusable (tabindex + role region)? If not, the App kit passes `tabIndex={0}` + `role="region"` + `aria-label`. (Task 11)                                                                                                                                                             |
| A11 | `organisms/menu-list/menu-list.tsx`                                              | Does it add an "All" category itself (the kits pass only real categories)? (Tasks 10, 11)                                                                                                                                                                                                                                                      |
| A12 | `organisms/site-header/*`                                                        | Drawer trigger accessible name equals `menuLabel` (`"Menu"`); desktop `actions` hidden from the accessibility tree below `md`, drawer actions hidden above it. (Task 10 plays)                                                                                                                                                                 |
| A13 | `molecules/toast/toast.tsx`                                                      | `ToastProvider` props (`duration`, `label`) and the name of its **contained-viewport** option (Plan 3a); whether `Toast` takes a `portalContainer`, or the provider itself must sit inside `AppShell`'s `overlay` to contain the viewport. The App kit writes `isContained` + `Toast portalContainer`. (Tasks 10, 11)                          |
| A14 | `organisms/dialog/dialog.tsx`                                                    | Title is the dialog's accessible name; `footer` renders inside the dialog content; the prop that portals it into a given element is `portalContainer` (Plan 4) and accepts `HTMLElement \| null`. (Tasks 10, 11)                                                                                                                               |
| A15 | `atoms/button/button.tsx`, `atoms/icon-button/icon-button.tsx`                   | `asChild` with an `<a>` child keeps `icon`/`iconAfter`; `IconButton count` keeps the accessible name equal to `label`. (Tasks 10–12)                                                                                                                                                                                                           |
| A16 | `.storybook/preview.tsx`                                                         | Viewport option key `floor360` exists; `a11y.test = "error"`; the storySort order from Plan 1 Task 8. (Tasks 2, 10–12)                                                                                                                                                                                                                         |
| A17 | `packages/design-tokens/dist/tokens.json` (container tokens)                     | The utility names for the container steps this plan uses: `max-w-article` (the form) and `max-w-text-measure-prose` (Type → Body). Tailwind's static `max-w-prose` is never used. Patch Tasks 5 and 13 to the built names.                                                                                                                     |
| A18 | `layouts/post-frame/post-frame.tsx`                                              | The `alt` tone (pink-50, Plan 2c) exists for the carousel board. (Task 12)                                                                                                                                                                                                                                                                     |
| A19 | every component the kits and specimens pass optional values to                   | Optional custom props accept `undefined` (`name?: T \| undefined`, Plans 2–4 ruling R13), so optional fields are passed straight through (`was={item.was}`). If one does not, that component is fixed forward under Step 6, not worked around here.                                                                                            |
| A20 | this plan file                                                                   | Dev parity tables present on every ported-component task — here, every task with a dev counterpart (Tasks 1–8, 14, 15) carries a `**Dev parity:**` table, and Tasks 9–13 say `**Dev reference:** none`. Each implementer copies its task's table into the report, extended with anything missed. (contracts §0.0)                              |
| A21 | `organisms/site-header/*`, `organisms/tab-bar/*`, `layouts/app-shell/*`          | Dev's first `storybook:test` run failed `landmark-unique` (app-shell, site-header, tab-bar) and `landmark-no-duplicate-banner` (site-header). Do these name their landmarks (or take `aria-label`) so a kit page composing SiteHeader, AppShell and TabBar passes axe? If not: stop and report — the kits never work around it. (Tasks 10, 11) |

- [ ] **Step 6: Fix forward only what D17 or the contracts require**

If A1 fails (ChoiceCardGroup cannot take `register()`), that is a bug in the component against spec D17, not a docs problem: add a failing test to `molecules/choice-card-group/choice-card-group.test.tsx` that asserts the contract `register()` relies on (RHF itself is not a `ui` dependency, so the test passes the same four props by hand): render with `name="meal" onChange={spy} onBlur={spy} ref={refSpy}`, click the second card, expect `spy` called with an event whose `target.value` is the second option's value and `refSpy` called with an `HTMLInputElement`. Make it pass by forwarding the props to each radio, then commit:

```bash
git add packages/ui/src/molecules/choice-card-group
git commit -m "fix(ui): forward register props to every ChoiceCard radio

react-hook-form's register() hands a group one name/onChange/onBlur/ref set;
spec D17 requires the native radios to receive it so the group works
unmodified.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

Missing type re-exports found in Step 2 are added to `packages/ui/src/index.ts` (named re-exports beside their component) and committed as `fix(ui): export the <Type> type from the barrel`.

- [ ] **Step 7: Report**

The Task 0 report lists: Step 1–4 outputs, the A1–A21 answers, every patch made to this plan (task, file, old → new, evidence), and any Step 6 commit. No other commit.

---

### Task 1: One contrast evaluator for the gate and the docs

**Files:**

- Create: `packages/design-tokens/src/catalogue.ts`
- Modify: `packages/design-tokens/src/contrast.ts` (append), `packages/design-tokens/src/policy.spec.ts` (replace), `packages/design-tokens/package.json` (exports)

**Dev reference:** `git show dev:apps/storybook/README.md` (§ "Current state: this target is red") and `git show dev:apps/storybook/.storybook/preview.tsx` (the `color-contrast` comment)

**Dev parity:**

| Dev item                                                                                   | Ruling  | Where / spec clause                                                                                        |
| ------------------------------------------------------------------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------- |
| Measured failing-pair table (on-brand 4.04, subtle 3.78, brand-on-soft 3.18, mint 3.15, …) | DROP    | Spec §5.2–§5.3, C13: text tokens re-pointed; this task's evaluator re-measures every pair on every build   |
| Blanket `color-contrast` OFF, justified by ~460 unactionable failures                      | ALREADY | Spec §5.4: off because axe cannot scope one exception; the token gate replaces it (Plan 1 preview comment) |
| "White on the brand pink passes large, fails body; the brand fill is not negotiable"       | ALREADY | D3 + the `brand-fill` exception group; Colors → Contrast (Task 4) renders it                               |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: Plan 1 Task 2 — `contrastRatio`, `parseColor`, `dist/tokens.json`, `contrast-pairs.json`.
- Produces: `@pink-paprikaa-web/design-tokens/catalogue` → `type TokenEntry`; `@pink-paprikaa-web/design-tokens/contrast` adds `AA_NORMAL`, `type CatalogueEntry`, `type PolicyGroup`, `type ContrastPolicy`, `type ContrastVerdict`, `type ContrastResult`, `resolveColor(catalogue, name, surface)`, `pairsOf(group)`, `verdictOf(ratio, min)`, `evaluateContrastPolicy(catalogue, policy)`; `@pink-paprikaa-web/design-tokens/contrast-pairs.json`.

- [ ] **Step 1: Write the failing spec**

Replace `packages/design-tokens/src/policy.spec.ts`:

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { TokenEntry } from "./catalogue.js";

import {
  AA_NORMAL,
  type ContrastPolicy,
  evaluateContrastPolicy,
  pairsOf,
  resolveColor,
  verdictOf,
} from "./contrast.js";

const readJson = <T>(relative: string): T =>
  JSON.parse(readFileSync(join(import.meta.dirname, relative), "utf8")) as T;

const catalogue = readJson<TokenEntry[]>("../dist/tokens.json");
const policy = readJson<ContrastPolicy>("../contrast-pairs.json");
const results = evaluateContrastPolicy(catalogue, policy);

describe.each(policy.groups)("contrast group $id", (group) => {
  const groupResults = results.filter((result) => result.group === group.id);

  it("declares at least one pair", () => {
    expect(groupResults.length).toBeGreaterThan(0);
  });

  it.each(groupResults.map((result) => [result.foreground, result.background, result] as const))(
    "%s on %s meets the group minimum",
    (_foreground, _background, result) => {
      expect(
        result.ratio,
        `${result.foreground} on ${result.background} (${result.surface ?? "light"}) = ${result.ratio.toFixed(2)}:1`
      ).toBeGreaterThanOrEqual(result.min);
    }
  );
});

describe("contrast policy", () => {
  it("allows a ratio below AA only for the brand-fill exception, and never below the AA-large floor", () => {
    const loose = policy.groups.filter((group) => group.min < AA_NORMAL);
    expect(loose.every((group) => group.exception === "brand-fill" && group.min === 3)).toBe(true);
  });

  it("uses the brand-fill exception only over the brand pink", () => {
    const brandPink = resolveColor(catalogue, "color-surface-brand", null);
    for (const group of policy.groups.filter((candidate) => candidate.exception === "brand-fill")) {
      for (const [, background] of pairsOf(group)) {
        const ground = resolveColor(catalogue, group.backdrop ?? background, group.surface);
        expect(ground, `${group.id}: exception ground`).toBe(brandPink);
      }
    }
  });

  it("rates white on the brand pink as the declared exception, not a pass", () => {
    const onBrand = results.find(
      (result) =>
        result.foreground === "color-text-on-brand" && result.background === "color-surface-brand"
    );
    expect(onBrand?.verdict).toBe("exception");
  });
});

describe("verdictOf", () => {
  it.each([
    [4.5, 3, "pass"],
    [4.04, 3, "exception"],
    [2.9, 3, "fail"],
    [4.49, 4.5, "fail"],
  ] as const)("rates %s against a minimum of %s as %s", (ratio, min, verdict) => {
    expect(verdictOf(ratio, min)).toBe(verdict);
  });
});

describe("pairsOf", () => {
  it("rejects a declared pair that is not [foreground, background]", () => {
    expect(() =>
      pairsOf({ id: "bad", surface: null, pairs: [["color-text-body"]], min: 4.5 })
    ).toThrow(/group "bad" has a pair that is not \[foreground, background\]/);
  });
});
```

Run: `pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -12`
Expected: FAIL — `Cannot find module './catalogue.js'` / `evaluateContrastPolicy is not exported`.

- [ ] **Step 2: The catalogue type**

Create `packages/design-tokens/src/catalogue.ts`:

```ts
/**
 * One entry of `dist/tokens.json` — the catalogue `sd.config.mjs` emits (format `pp/catalogue`).
 * The type lives beside the build that writes the file, so every reader (the contrast policy,
 * Storybook's foundation pages) shares one shape. `theme.spec.ts` asserts the build keeps it.
 */
export interface TokenEntry {
  /** Path joined with `-`, e.g. `color-text-body`. */
  readonly name: string;
  /** `--${name}` — what a consumer puts in `var()`. */
  readonly cssVar: string;
  readonly path: readonly string[];
  /** Resolved value: a CSS string, a number, or a typography composite. */
  readonly value: unknown;
  /** The DTCG alias this token points at (`color.ink.800`), or null for a literal. */
  readonly reference: string | null;
  readonly type: string | null;
  readonly tier: "primitive" | "semantic" | "component" | "surface" | "unknown";
  /** Set on a surface override; null for the base token. */
  readonly surface: "brand" | "ink" | "soft" | "light" | null;
  readonly description: string;
}
```

- [ ] **Step 3: Move the evaluation into `contrast.ts`**

Append to `packages/design-tokens/src/contrast.ts` (after `contrastRatio`), and add the type import at the top of the file (`import type { TokenEntry } from "./catalogue.js";`):

```ts
/** WCAG 2.x AA minimum for normal-size text. */
export const AA_NORMAL = 4.5;

/** The part of a catalogue entry the policy reads. */
export type CatalogueEntry = Pick<TokenEntry, "name" | "value" | "surface">;

/** One group of `contrast-pairs.json` (spec §5.4). Pairs are string arrays so the JSON types as-is. */
export interface PolicyGroup {
  readonly id: string;
  readonly surface: string | null;
  readonly foregrounds?: readonly string[];
  readonly backgrounds?: readonly string[];
  readonly pairs?: readonly (readonly string[])[];
  readonly backdrop?: string;
  readonly min: number;
  readonly exception?: string;
}

export interface ContrastPolicy {
  readonly groups: readonly PolicyGroup[];
}

export type ContrastVerdict = "pass" | "exception" | "fail";

export interface ContrastResult {
  readonly group: string;
  readonly surface: string | null;
  readonly foreground: string;
  readonly background: string;
  readonly backdrop: string | null;
  readonly foregroundValue: string;
  readonly backgroundValue: string;
  readonly backdropValue: string | null;
  readonly ratio: number;
  readonly min: number;
  readonly exception: string | null;
  readonly verdict: ContrastVerdict;
}

/** A colour token's value on a surface: the surface override if there is one, else the base token. */
export function resolveColor(
  catalogue: readonly CatalogueEntry[],
  name: string,
  surface: string | null
): string {
  const override =
    surface === null
      ? undefined
      : catalogue.find((entry) => entry.surface === surface && entry.name === name);
  const entry =
    override ??
    catalogue.find((candidate) => candidate.surface === null && candidate.name === name);
  if (entry === undefined || typeof entry.value !== "string") {
    throw new Error(
      `contrast policy: no colour token "${name}"${surface === null ? "" : ` on ${surface}`}`
    );
  }
  return entry.value;
}

/** Every [foreground, background] pair a group declares. */
export function pairsOf(group: PolicyGroup): [string, string][] {
  if (group.pairs !== undefined) {
    return group.pairs.map((pair) => {
      const [foreground, background] = pair;
      if (pair.length !== 2 || foreground === undefined || background === undefined) {
        throw new Error(
          `contrast policy: group "${group.id}" has a pair that is not [foreground, background]`
        );
      }
      return [foreground, background];
    });
  }
  const backgrounds = group.backgrounds ?? [];
  return (group.foregrounds ?? []).flatMap((foreground) =>
    backgrounds.map((background): [string, string] => [foreground, background])
  );
}

/** "pass" at AA; "exception" between a group's lower minimum and AA; "fail" below the minimum. */
export function verdictOf(ratio: number, min: number): ContrastVerdict {
  if (ratio >= AA_NORMAL) return "pass";
  return ratio >= min ? "exception" : "fail";
}

/**
 * Measures every pair the policy declares against the built catalogue. The contrast gate
 * (`policy.spec.ts`) and Storybook's Colors → Contrast page both call this, so the page can never
 * show a different verdict from the one CI enforces.
 */
export function evaluateContrastPolicy(
  catalogue: readonly CatalogueEntry[],
  policy: ContrastPolicy
): ContrastResult[] {
  return policy.groups.flatMap((group) =>
    pairsOf(group).map(([foreground, background]) => {
      const backdropValue =
        group.backdrop === undefined
          ? null
          : resolveColor(catalogue, group.backdrop, group.surface);
      const foregroundValue = resolveColor(catalogue, foreground, group.surface);
      const backgroundValue = resolveColor(catalogue, background, group.surface);
      const ratio = contrastRatio(foregroundValue, backgroundValue, backdropValue ?? undefined);
      return {
        group: group.id,
        surface: group.surface,
        foreground,
        background,
        backdrop: group.backdrop ?? null,
        foregroundValue,
        backgroundValue,
        backdropValue,
        ratio,
        min: group.min,
        exception: group.exception ?? null,
        verdict: verdictOf(ratio, group.min),
      };
    })
  );
}
```

- [ ] **Step 4: Export the catalogue type and the policy file**

In `packages/design-tokens/package.json` → `exports`, keep the four Plan 1 entries and add:

```json
"./catalogue": {
  "types": "./src/catalogue.ts",
  "import": "./src/catalogue.ts",
  "default": "./src/catalogue.ts"
},
"./contrast-pairs.json": "./contrast-pairs.json"
```

- [ ] **Step 5: Run to green, then probe the gate**

Run: `pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -12` → PASS (all groups, the three policy tests, verdictOf, pairsOf).

Probe (the refactor must still bite): set `tokens/semantic/color.json` → `color.text.muted` to `{color.ink.400}`, rerun, expect FAIL `color-text-muted on color-surface-page (light) = 2.…:1`; `git checkout packages/design-tokens/tokens/semantic/color.json`, rerun, PASS. Paste both.

- [ ] **Step 6: Gate and commit**

```bash
pnpm nx run-many -t typecheck lint test build -p @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static 2>&1 | tail -10
pnpm nx format:check && pnpm nx sync:check
git add packages/design-tokens
git commit -m "feat(tokens): share the contrast policy evaluator with the docs

evaluateContrastPolicy moves out of the policy spec into contrast.ts so the
gate and Storybook's Contrast page read one implementation and can never show
different verdicts. The catalogue entry type and contrast-pairs.json become
package exports (a relative import across packages is a boundary violation).
Probe: muted text on ink-400 fails the gate; reverted.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 2: Storybook plumbing and the docs-kit

**Files:**

- Create: `apps/storybook/src/docs-kit/{token-files.d.ts,catalogue.ts,dom.ts,specimen.tsx,swatch.tsx,token-table.tsx,type-specimen.tsx,contrast-matrix.tsx,spacing-scale.tsx,radius-scale.tsx,shadow-ladder.tsx,motion-demo.tsx,docs-kit.stories.tsx}`, `apps/storybook/src/kits/fixtures.ts` (seed; replaced in Task 10)
- Modify: `apps/storybook/package.json` (deps, `serve` dependsOn), `apps/storybook/.storybook/preview.tsx` (nested sort order)

**Dev reference:** `git show dev:apps/storybook/{.storybook/main.ts,.storybook/preview.tsx,.storybook/styles.css,package.json,vite.config.mts,vitest.config.mts}`; the docs helpers in `git show dev:packages/ui/src/docs/{colour,typography,space-shape-motion}.mdx` (`Swatch`, `Grid`, `Row`, `Space`, `Radius`, `Shadow`, the duration/easing tracks)

**Dev parity:**

| Dev item                                                                                      | Ruling  | Where / spec clause                                                                                       |
| --------------------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| `remark-gfm` in addon-docs `mdxCompileOptions` (tables otherwise render as raw pipes)         | ALREADY | Plan 1 `main.ts`; Task 15 Step 7 now fails a docs page that shows a raw table (ADD there)                 |
| addon-a11y, addon-vitest (browser mode), `@chromatic-com/storybook` + `chromatic` target      | ALREADY | Plan 1 `main.ts` / `package.json` / `vitest.config.mts`, unchanged here                                   |
| react-docgen-typescript `include` + `tsconfigPath` + node_modules `propFilter`                | ALREADY | Plan 1 `main.ts`; Task 15 Step 7 now fails an empty component props table (ADD there)                     |
| Viewports: `floor360` + the five breakpoints + `INITIAL_VIEWPORTS`                            | ALREADY | Plan 1 `preview.tsx` (A16); kits test at `floor360`                                                       |
| Backgrounds as token references (page, tint, brand, inverse)                                  | ALREADY | Plan 1 `preview.tsx`, plus `soft` (spec §10.2 grounds)                                                    |
| `a11y.test = "error"`, `color-contrast` off                                                   | ALREADY | Plan 1 `preview.tsx`, with the §5.4 reason                                                                |
| storySort `Foundations → Atoms → Molecules → Organisms → Templates`                           | DROP    | D13 / spec §10.1: the 13 design-system groups (Step 2); D14 `templates` → `layouts`                       |
| Decorator `font-body text-body1 leading-body1`                                                | ALREADY | Plan 1 decorator `font-body text-body` (D4 names)                                                         |
| Google Fonts `@import` in `styles.css`                                                        | DROP    | D11: fonts self-hosted through `@fontsource/*` (`.storybook/fonts.ts`)                                    |
| `@source` over `packages/ui/src/**/*.{ts,tsx,mdx}`                                            | ALREADY | Spec §6.5: the library scans itself; Storybook adds only its `src/` and the library's stories             |
| `Swatch` reads the value off the live custom property (no second source of truth)             | ALREADY | `catalogue.ts` reads `tokens.json` and throws on a missing name — stronger (Review Focus 1)               |
| `Swatch`: click the name or the value to copy it, with "copied" feedback                      | ADD     | Step 7 `swatch.tsx` (copy buttons + `role="status"`); Step 4 `SwatchCopiesNameAndValue`                   |
| `Swatch` per-swatch usage note                                                                | ALREADY | The token's `description`, printed under the value                                                        |
| `Grid` auto-fit swatch grid                                                                   | ALREADY | `Swatches` (responsive grid)                                                                              |
| `Space` / `Radius` / `Shadow` / type `Row` specimens                                          | ALREADY | `SpacingScale`, `RadiusScale`, `ShadowLadder`, `TypeSpecimen`                                             |
| Duration track per step (hover)                                                               | ALREADY | `MotionDemo`, toggled by a button (keyboard-operable); its label now names the duration too (ADD, Step 7) |
| Old class names in the helpers (`rounded-3`, `text-body2`, `bg-brand-primary`, `max-w-(--…)`) | DROP    | D4 names; spec §11.2 `no-arbitrary-value` / R23 `no-arbitrary-shorthand`                                  |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: Task 1 exports; `Button`, `Badge`, `Table*` from `@pink-paprikaa-web/ui`; `brand` from `@pink-paprikaa-web/content`.
- Produces (docs-kit, used by Tasks 3–9 and the kits): `token(name, surface?)`, `tokensWithPrefix(prefix, tier?)`, `surfaceOverrides(surface)`, `selectTokens(selection)`, `formatValue(value)`, `cssValue(name)`, `typographyOf(name)`, `rgbOf(name)`, `CATALOGUE`, types `TokenEntry`, `TokenSelection`, `Surface`, `Tier`; `requireElement(root, selector)`; components `Swatch`, `Swatches`, `TokenTable`, `TypeSpecimen`, `ContrastMatrix` (+ `contrastResults(groups?)`, `VERDICT_LABEL`), `SpacingScale`, `RadiusScale`, `ShadowLadder`, `MotionDemo`, `SpecimenRow`, `SpecimenTile`. Fixtures seed: `OUTLET`, `ORDER_STEPS`, `BUILD_YEAR`.

**Where the docs-kit tests run (decided):** as hidden stories with `play` functions in `docs-kit.stories.tsx`, run by the existing `storybook:test`. Not a jsdom config: the helpers exist to paint live CSS variables, and only a real browser with the real stylesheet can assert a swatch's computed colour or a bar's computed width. `@storybook/addon-vitest` overrides `test.include` with the stories globs, so a second unit suite would need a second Vitest project for no gain.

- [ ] **Step 1: Dependencies and targets**

```bash
pnpm add @pink-paprikaa-web/utils --workspace --filter @pink-paprikaa-web/storybook
pnpm add -D lucide-react --filter @pink-paprikaa-web/storybook
pnpm why lucide-react -r 2>&1 | grep -E "^lucide-react|lucide-react [0-9]" | sort -u
pnpm nx sync
```

If `pnpm why` shows two different `lucide-react` versions, run `pnpm update -r --latest lucide-react` so the workspace shares one (no hand-written version), and rerun `pnpm why`.

In `apps/storybook/package.json` → `nx.targets.serve`, add `"dependsOn": ["^build"]` (foundation pages read `design-tokens/dist`; the inferred `storybook`, `build-storybook` and `test` targets already depend on `^build`, the declared `serve` did not).

- [ ] **Step 2: Sidebar order inside each group**

In `apps/storybook/.storybook/preview.tsx`, replace the `options.storySort.order` array from Plan 1 Task 8 with:

```tsx
        order: [
          "Introduction",
          "Brand",
          ["Logo", "Pattern", "Company details", "Voice & content", "Iconography"],
          "Colors",
          ["Primary", "Ink", "Accents", "Heat", "Semantic", "Surfaces", "Status", "Contrast"],
          "Type",
          ["Display", "Headings", "Body", "Overline & mono", "Devanagari", "Fluid"],
          "Spacing",
          ["Scale", "Layout rhythm"],
          "Layout",
          ["Breakpoints", "AutoGrid", "Radii", "Borders", "Elevation", "Card anatomy", "Utility classes"],
          "Motion",
          ["Motion", "States", "Form states", "Section reveal"],
          "Marketing",
          ["Canvas formats", "Canvas type", "Kit", ["Feed", "Ads"]],
          "Atoms",
          "Molecules",
          "Organisms",
          "Layouts",
          "Website",
          "App",
        ],
```

(The page order is the design system's card order; atom/molecule/organism/layout stories stay alphabetical.)

- [ ] **Step 3: Type the two JSON files without parsing them**

Create `apps/storybook/src/docs-kit/token-files.d.ts`:

```ts
/**
 * Types for the JSON files the docs read from @pink-paprikaa-web/design-tokens. Vite loads them at
 * runtime; TypeScript never parses them (this project leaves `resolveJsonModule` off), so these
 * declarations are what it sees. Typecheck therefore never depends on `dist/` having been built,
 * and each file has one explicit shape owned by the package that writes it.
 */
declare module "@pink-paprikaa-web/design-tokens/tokens.json" {
  import type { TokenEntry } from "@pink-paprikaa-web/design-tokens/catalogue";

  const catalogue: readonly TokenEntry[];
  export default catalogue;
}

declare module "@pink-paprikaa-web/design-tokens/contrast-pairs.json" {
  import type { ContrastPolicy } from "@pink-paprikaa-web/design-tokens/contrast";

  const policy: ContrastPolicy;
  export default policy;
}
```

(If `tsc` still reports TS2732 for these imports, the ambient path is not being honoured: stop and report the exact error — do not enable `resolveJsonModule`, which would pull `dist/` into this composite project.)

- [ ] **Step 4: Write the failing docs-kit contract stories**

Create `apps/storybook/src/docs-kit/docs-kit.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, spyOn, within } from "storybook/test";

import { cssValue, formatValue, rgbOf, token, tokensWithPrefix, typographyOf } from "./catalogue";
import { ContrastMatrix, VERDICT_LABEL } from "./contrast-matrix";
import { requireElement } from "./dom";
import { MotionDemo } from "./motion-demo";
import { RadiusScale } from "./radius-scale";
import { ShadowLadder } from "./shadow-ladder";
import { SpacingScale } from "./spacing-scale";
import { Swatch } from "./swatch";
import { TokenTable } from "./token-table";
import { TypeSpecimen } from "./type-specimen";

/** Contract tests for the docs-only helpers. Hidden from the sidebar; run by storybook:test. */
const meta = {
  title: "Introduction/Docs kit",
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const MissingTokenFailsLoudly: Story = {
  render: () => <span className="font-mono text-mono">Token lookups throw on unknown names.</span>,
  play: async () => {
    await expect(() => token("color-does-not-exist")).toThrow(/no token "color-does-not-exist"/);
    await expect(() => tokensWithPrefix("color-nope-")).toThrow(
      /no base token starts with "color-nope-"/
    );
    await expect(() => typographyOf("color-pink-500")).toThrow(/not a typography token/);
  },
};

export const NumericStepsSortByNumber: Story = {
  render: () => <span className="font-mono text-mono">Numeric steps list in numeric order.</span>,
  play: async () => {
    const ink = tokensWithPrefix("color-ink-", "primitive")
      .filter((entry) => entry.path.length === 3 && entry.path[1] === "ink")
      .map((entry) => entry.name);
    await expect(ink.at(0)).toBe("color-ink-000");
    await expect(ink.at(-1)).toBe("color-ink-900");
    const pink = tokensWithPrefix("color-pink-", "primitive").map((entry) => entry.name);
    await expect(pink.indexOf("color-pink-50")).toBeLessThan(pink.indexOf("color-pink-100"));
  },
};

export const SwatchPaintsItsToken: Story = {
  render: () => (
    <div className="grid max-w-150 grid-cols-2 gap-4">
      <Swatch name="color-pink-500" />
      <Swatch name="color-text-body" />
    </div>
  ),
  play: async ({ canvas }) => {
    const chip = canvas.getByRole("img", { name: token("color-pink-500").cssVar });
    await expect(getComputedStyle(chip).backgroundColor).toBe(rgbOf("color-pink-500"));
    await expect(
      canvas.getByText(`→ ${token("color-text-body").reference ?? "no reference"}`)
    ).toBeVisible();
  },
};

export const SwatchCopiesNameAndValue: Story = {
  render: () => <Swatch name="color-pink-500" />,
  play: async ({ canvas, userEvent }) => {
    // The play's userEvent (user-event setup()) stubs navigator.clipboard; the spy observes the write.
    const write = spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    const entry = token("color-pink-500");
    const value = formatValue(entry.value);
    await userEvent.click(canvas.getByRole("button", { name: entry.cssVar }));
    await expect(write).toHaveBeenLastCalledWith(entry.cssVar);
    await expect(canvas.getByRole("status")).toHaveTextContent(`Copied ${entry.cssVar}`);
    await userEvent.click(canvas.getByRole("button", { name: value }));
    await expect(write).toHaveBeenLastCalledWith(value);
    await expect(canvas.getByRole("status")).toHaveTextContent(`Copied ${value}`);
    write.mockRestore();
  },
};

export const TokenTableListsEveryMatch: Story = {
  render: () => <TokenTable caption="Durations" selection={{ prefix: "duration-" }} />,
  play: async ({ canvas }) => {
    const table = canvas.getByRole("table", { name: "Durations" });
    await expect(within(table).getAllByRole("row")).toHaveLength(
      tokensWithPrefix("duration-").length + 1
    );
    await expect(within(table).getByText(token("duration-fast").cssVar)).toBeVisible();
  },
};

export const TypeSpecimenUsesTheStep: Story = {
  render: () => (
    <TypeSpecimen step="h1" family="display">
      Our Menu
    </TypeSpecimen>
  ),
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByText("Our Menu")).fontSize).toBe(
      typographyOf("text-h1").fontSize
    );
    const h1 = token("text-h1");
    await expect(
      canvas.getByText(`${h1.cssVar} · ${formatValue(h1.value)} · ${token("font-display").cssVar}`)
    ).toBeVisible();
  },
};

export const ContrastMatrixRatesEachPair: Story = {
  render: () => <ContrastMatrix groups={["on-brand-fill", "on-inverse"]} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText(VERDICT_LABEL.exception)).toBeVisible();
    await expect(canvas.getByText(VERDICT_LABEL.pass)).toBeVisible();
    await expect(canvas.queryByText(VERDICT_LABEL.fail)).toBeNull();
  },
};

export const SpacingScaleMultipliesTheUnit: Story = {
  render: () => <SpacingScale steps={[1, 6, 10]} />,
  play: async ({ canvasElement }) => {
    const unit = Number.parseFloat(cssValue("spacing"));
    for (const step of [1, 6, 10]) {
      const bar = requireElement(canvasElement, `[data-step="${String(step)}"]`);
      await expect(bar.getBoundingClientRect().width).toBe(step * unit);
    }
  },
};

export const RadiusScaleShowsEveryRadius: Story = {
  render: () => <RadiusScale />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getAllByRole("listitem")).toHaveLength(
      tokensWithPrefix("radius-", "primitive").length
    );
    const card = requireElement(canvasElement, '[data-token="radius-lg"]');
    await expect(getComputedStyle(card).borderTopLeftRadius).toBe(cssValue("radius-lg"));
  },
};

export const ShadowLadderPaintsEachStep: Story = {
  render: () => <ShadowLadder names={["shadow-1", "shadow-3", "shadow-brand"]} />,
  play: async ({ canvas, canvasElement }) => {
    const raised = requireElement(canvasElement, '[data-token="shadow-3"]');
    await expect(getComputedStyle(raised).boxShadow).not.toBe("none");
    await expect(canvas.getByText(token("shadow-brand").description)).toBeVisible();
  },
};

export const MotionDemoRunsOnTheTokens: Story = {
  render: () => <MotionDemo ease="out" duration="base" use="state changes" />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const play = canvas.getByRole("button", {
      name: `Play ${token("ease-out").cssVar} over ${token("duration-base").cssVar}`,
    });
    await userEvent.click(play);
    await expect(play).toHaveAttribute("aria-pressed", "true");
    const dot = getComputedStyle(requireElement(canvasElement, '[data-token="ease-out"]'));
    await expect(dot.transitionTimingFunction).toBe(cssValue("ease-out"));
    await expect(Number.parseFloat(dot.transitionDuration) * 1000).toBe(
      Number.parseFloat(cssValue("duration-base"))
    );
  },
};
```

Run: `pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- docs-kit.stories 2>&1 | tail -12`
Expected: FAIL — `Failed to resolve import "./catalogue"`.

- [ ] **Step 5: The catalogue — the only door to token values**

Create `apps/storybook/src/docs-kit/catalogue.ts`:

```ts
import { parseColor } from "@pink-paprikaa-web/design-tokens/contrast";
import catalogue from "@pink-paprikaa-web/design-tokens/tokens.json";

import type { TokenEntry } from "@pink-paprikaa-web/design-tokens/catalogue";

export type { TokenEntry } from "@pink-paprikaa-web/design-tokens/catalogue";

/**
 * Foundation pages ask for tokens by name or prefix and never retype a value. Every lookup throws
 * when nothing matches, so a renamed or removed token fails `storybook:test` on the specimen that
 * asked for it — it can never render as an empty swatch.
 */
export const CATALOGUE: readonly TokenEntry[] = catalogue;

export type Surface = NonNullable<TokenEntry["surface"]>;
export type Tier = Exclude<TokenEntry["tier"], "unknown">;

/** Which tokens a helper shows: base tokens with a prefix, an explicit list, or a surface's overrides. */
export type TokenSelection =
  | { readonly prefix: string; readonly tier?: Tier }
  | { readonly names: readonly string[] }
  | { readonly surface: Surface };

export interface TypographyValue {
  readonly fontSize: string;
  readonly lineHeight?: number | string;
  readonly letterSpacing?: string;
  readonly fontWeight?: number | string;
}

function notFound(what: string): Error {
  return new Error(
    `docs-kit: ${what} in @pink-paprikaa-web/design-tokens/tokens.json. A token was renamed or removed — update the page that asks for it; never retype its value.`
  );
}

/** The token called `name` — its base value, or its override on `surface`. */
export function token(name: string, surface?: Surface): TokenEntry {
  const wanted = surface ?? null;
  const entry = CATALOGUE.find(
    (candidate) => candidate.name === name && candidate.surface === wanted
  );
  if (entry === undefined) {
    throw notFound(
      `no token "${name}"${surface === undefined ? "" : ` on the ${surface} surface`}`
    );
  }
  return entry;
}

const BUILD_ORDER = new Map(CATALOGUE.map((entry, index) => [entry, index]));
const INTEGER = /^\d+$/;

/**
 * Build order, except that sibling steps with numeric names sort by number. The catalogue lists
 * integer-like keys first (JavaScript object key order), so `ink-000` would follow `ink-900` and
 * `white-alpha-06` would follow `white-alpha-92` without this.
 */
function byStep(a: TokenEntry, b: TokenEntry): number {
  const depth = Math.min(a.path.length, b.path.length);
  for (let index = 0; index < depth; index += 1) {
    const left = a.path[index] ?? "";
    const right = b.path[index] ?? "";
    if (left === right) continue;
    if (INTEGER.test(left) && INTEGER.test(right)) return Number(left) - Number(right);
    break;
  }
  return (BUILD_ORDER.get(a) ?? 0) - (BUILD_ORDER.get(b) ?? 0);
}

/** Base tokens whose name starts with `prefix` (optionally one tier), numeric steps in order. */
export function tokensWithPrefix(prefix: string, tier?: Tier): readonly TokenEntry[] {
  const entries = CATALOGUE.filter(
    (entry) =>
      entry.surface === null &&
      entry.name.startsWith(prefix) &&
      (tier === undefined || entry.tier === tier)
  );
  if (entries.length === 0) {
    throw notFound(`no ${tier ?? "base"} token starts with "${prefix}"`);
  }
  return [...entries].sort(byStep);
}

/** Every token a surface redefines, numeric steps in order. */
export function surfaceOverrides(surface: Surface): readonly TokenEntry[] {
  const entries = CATALOGUE.filter((entry) => entry.surface === surface);
  if (entries.length === 0) {
    throw notFound(`the ${surface} surface overrides nothing`);
  }
  return [...entries].sort(byStep);
}

export function selectTokens(selection: TokenSelection): readonly TokenEntry[] {
  if ("names" in selection) return selection.names.map((name) => token(name));
  if ("surface" in selection) return surfaceOverrides(selection.surface);
  return tokensWithPrefix(selection.prefix, selection.tier);
}

function isTypography(value: unknown): value is TypographyValue {
  return typeof value === "object" && value !== null && "fontSize" in value;
}

/** A value as the docs print it; a typography composite as `size / line-height / tracking / weight`. */
export function formatValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (isTypography(value)) {
    return [value.fontSize, value.lineHeight, value.letterSpacing, value.fontWeight]
      .filter((part) => part !== undefined)
      .map(String)
      .join(" / ");
  }
  throw new Error(`docs-kit: cannot print the token value ${JSON.stringify(value)}`);
}

/** A single-value token as a CSS string (colours, lengths, durations, easings). */
export function cssValue(name: string): string {
  const { value } = token(name);
  if (typeof value !== "string" && typeof value !== "number") {
    throw new Error(`docs-kit: "${name}" is a composite token, not a single CSS value`);
  }
  return String(value);
}

/** The composite of a `text-*` token. */
export function typographyOf(name: string): TypographyValue {
  const { value } = token(name);
  if (!isTypography(value)) {
    throw new Error(`docs-kit: "${name}" is not a typography token`);
  }
  return value;
}

/** An opaque colour token as the browser reports a computed colour: `rgb(r, g, b)`. */
export function rgbOf(name: string): string {
  const { r, g, b } = parseColor(cssValue(name));
  return `rgb(${String(r)}, ${String(g)}, ${String(b)})`;
}
```

Create `apps/storybook/src/docs-kit/dom.ts`:

```ts
/** The one element a specimen test inspects, or a failure naming the selector. */
export function requireElement(root: HTMLElement, selector: string): HTMLElement {
  const found = root.querySelector(selector);
  if (!(found instanceof HTMLElement)) {
    throw new Error(`docs-kit test: nothing matches ${selector}`);
  }
  return found;
}
```

- [ ] **Step 6: Layout helpers for specimens**

Create `apps/storybook/src/docs-kit/specimen.tsx`:

```tsx
import type { ReactNode } from "react";

export interface SpecimenRowProps {
  /** Names the prop or token that produces the examples. */
  label: string;
  children: ReactNode;
}

/** A labelled, wrapping row of live examples. */
export function SpecimenRow({ label, children }: SpecimenRowProps) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="font-mono text-mono text-text-subtle">{label}</span>
      <div className="flex min-w-0 flex-wrap items-end gap-6">{children}</div>
    </div>
  );
}

export interface SpecimenTileProps {
  caption: string;
  /** Set when the tile floods a dark field, so what sits on it re-reads the tokens. */
  surface?: "brand" | "ink" | "soft";
  /** The tile's field, size, padding and alignment — token classes only (the base sets none, so nothing conflicts). */
  className: string;
  children: ReactNode;
}

/** One example on its own field, captioned with what produced it. */
export function SpecimenTile({ caption, surface, className, children }: SpecimenTileProps) {
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <div data-surface={surface} className={`flex rounded-lg ${className}`}>
        {children}
      </div>
      <figcaption className="font-mono text-mono text-text-subtle">{caption}</figcaption>
    </figure>
  );
}
```

- [ ] **Step 7: The eight helpers**

Create `apps/storybook/src/docs-kit/swatch.tsx`:

```tsx
import { useState } from "react";

import { formatValue, selectTokens, token, type TokenSelection } from "./catalogue";

export interface SwatchProps {
  /** Token name, e.g. `color-pink-500`. */
  name: string;
}

/**
 * One colour token: a chip painted with its CSS variable, then its name, value and reference. The
 * name and the value are buttons that copy themselves (the August port's Colour page did the
 * same); a status line confirms the copy.
 */
export function Swatch({ name }: SwatchProps) {
  const entry = token(name);
  const value = formatValue(entry.value);
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(text);
      },
      () => {
        setCopied(null);
      }
    );
  };
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <div
        role="img"
        aria-label={entry.cssVar}
        className="h-16 rounded-sm border border-border-subtle"
        style={{ backgroundColor: `var(${entry.cssVar})` }}
      />
      <figcaption className="flex min-w-0 flex-col items-start font-mono text-mono">
        <button
          type="button"
          className="cursor-pointer text-left wrap-break-word text-text-heading hover:text-text-brand"
          onClick={() => {
            copy(entry.cssVar);
          }}
        >
          {entry.cssVar}
        </button>
        <button
          type="button"
          className="cursor-pointer text-left text-text-muted hover:text-text-brand"
          onClick={() => {
            copy(value);
          }}
        >
          {value}
        </button>
        <span role="status" className="font-body text-caption text-text-brand">
          {copied === null ? "" : `Copied ${copied}`}
        </span>
        {entry.reference === null ? null : (
          <span className="text-text-subtle">→ {entry.reference}</span>
        )}
        {entry.description === "" ? null : (
          <span className="font-body text-caption text-text-subtle">{entry.description}</span>
        )}
      </figcaption>
    </figure>
  );
}

export interface SwatchesProps {
  selection: TokenSelection;
}

export function Swatches({ selection }: SwatchesProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
      {selectTokens(selection).map((entry) => (
        <Swatch key={entry.name} name={entry.name} />
      ))}
    </div>
  );
}
```

Create `apps/storybook/src/docs-kit/token-table.tsx`:

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@pink-paprikaa-web/ui";

import { formatValue, selectTokens, type TokenSelection } from "./catalogue";

export interface TokenTableProps {
  /** Visible caption and the table's accessible name. */
  caption: string;
  selection: TokenSelection;
}

/** Tokens as a table: CSS variable, resolved value, the alias it points at, and its use. */
export function TokenTable({ caption, selection }: TokenTableProps) {
  return (
    <Table caption={caption} isCaptionVisible minWidth="md">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Token</TableHeaderCell>
          <TableHeaderCell>Value</TableHeaderCell>
          <TableHeaderCell>References</TableHeaderCell>
          <TableHeaderCell>Use</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {selectTokens(selection).map((entry) => (
          <TableRow key={`${entry.surface ?? "base"}:${entry.name}`}>
            <TableCell className="font-mono text-mono text-text-heading">{entry.cssVar}</TableCell>
            <TableCell className="font-mono text-mono">{formatValue(entry.value)}</TableCell>
            <TableCell className="font-mono text-mono text-text-muted">
              {entry.reference ?? "—"}
            </TableCell>
            <TableCell className="text-body-sm text-text-muted">{entry.description}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

Create `apps/storybook/src/docs-kit/type-specimen.tsx`:

```tsx
import type { ReactNode } from "react";

import { formatValue, token } from "./catalogue";

export type TypeFamily = "display" | "body" | "devanagari" | "mono";
export type TypeTone = "heading" | "body" | "muted" | "subtle" | "brand";

export interface TypeSpecimenProps {
  /** A `text-*` step without the prefix: `h1`, `body-sm`, `display-2-fluid`. */
  step: string;
  family: TypeFamily;
  tone?: TypeTone;
  isUppercase?: boolean;
  children: ReactNode;
}

/** A sample set in one type step, read from its tokens, captioned with the step's values. */
export function TypeSpecimen({
  step,
  family,
  tone = "heading",
  isUppercase = false,
  children,
}: TypeSpecimenProps) {
  const size = token(`text-${step}`);
  const font = token(`font-${family}`);
  const color = token(`color-text-${tone}`);
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <div
        className={isUppercase ? "wrap-break-word uppercase" : "wrap-break-word"}
        style={{
          fontFamily: `var(${font.cssVar})`,
          fontSize: `var(${size.cssVar})`,
          lineHeight: `var(${size.cssVar}--line-height, normal)`,
          letterSpacing: `var(${size.cssVar}--letter-spacing, normal)`,
          fontWeight: `var(${size.cssVar}--font-weight, inherit)`,
          color: `var(${color.cssVar})`,
        }}
      >
        {children}
      </div>
      <figcaption className="font-mono text-mono text-text-muted">
        {size.cssVar} · {formatValue(size.value)} · {font.cssVar}
      </figcaption>
    </figure>
  );
}
```

Create `apps/storybook/src/docs-kit/contrast-matrix.tsx`:

```tsx
import {
  type ContrastPolicy,
  type ContrastResult,
  type ContrastVerdict,
  evaluateContrastPolicy,
} from "@pink-paprikaa-web/design-tokens/contrast";
import pairs from "@pink-paprikaa-web/design-tokens/contrast-pairs.json";
import {
  Badge,
  type BadgeProps,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@pink-paprikaa-web/ui";

import { CATALOGUE } from "./catalogue";

const POLICY: ContrastPolicy = pairs;

export const VERDICT_LABEL: Readonly<Record<ContrastVerdict, string>> = {
  pass: "Pass — AA",
  exception: "Exception — brand fill, AA-large",
  fail: "Fail",
};

const VERDICT_TONE: Readonly<Record<ContrastVerdict, NonNullable<BadgeProps["tone"]>>> = {
  pass: "success",
  exception: "warning",
  fail: "danger",
};

/** The policy measured on this build — the same call the contrast gate makes. */
export function contrastResults(groups?: readonly string[]): ContrastResult[] {
  const all = evaluateContrastPolicy(CATALOGUE, POLICY);
  return groups === undefined ? all : all.filter((result) => groups.includes(result.group));
}

function Sample({ result }: { result: ContrastResult }) {
  const chip = (
    <span
      aria-hidden
      className="inline-flex size-10 items-center justify-center rounded-sm font-display font-bold"
      style={{ backgroundColor: result.backgroundValue, color: result.foregroundValue }}
    >
      Aa
    </span>
  );
  if (result.backdropValue === null) return chip;
  return (
    <span
      aria-hidden
      className="inline-flex rounded-md p-1"
      style={{ backgroundColor: result.backdropValue }}
    >
      {chip}
    </span>
  );
}

export interface ContrastMatrixProps {
  /** Policy group ids to show; every group when omitted. */
  groups?: readonly string[];
}

/** Every declared text/background pair with its measured ratio, its minimum and its verdict. */
export function ContrastMatrix({ groups }: ContrastMatrixProps) {
  const results = contrastResults(groups);
  const count = (verdict: ContrastVerdict) =>
    results.filter((result) => result.verdict === verdict).length;
  return (
    <div className="flex flex-col gap-4">
      <div className="font-mono text-mono text-text-muted">
        {results.length} pairs · {count("pass")} pass AA · {count("exception")} declared exceptions
        · {count("fail")} fail
      </div>
      <Table
        caption="Every text and background pair the components paint, measured from this build's tokens"
        isCaptionVisible
        minWidth="lg"
      >
        <TableHead>
          <TableRow>
            <TableHeaderCell>Sample</TableHeaderCell>
            <TableHeaderCell>Text</TableHeaderCell>
            <TableHeaderCell>Background</TableHeaderCell>
            <TableHeaderCell>Surface</TableHeaderCell>
            <TableHeaderCell>Ratio</TableHeaderCell>
            <TableHeaderCell>Needs</TableHeaderCell>
            <TableHeaderCell>Verdict</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map((result) => (
            <TableRow
              key={`${result.group}:${result.foreground}:${result.background}`}
              data-verdict={result.verdict}
            >
              <TableCell>
                <Sample result={result} />
              </TableCell>
              <TableCell className="font-mono text-mono">{result.foreground}</TableCell>
              <TableCell className="font-mono text-mono">
                {result.backdrop === null
                  ? result.background
                  : `${result.background} over ${result.backdrop}`}
              </TableCell>
              <TableCell>{result.surface ?? "light"}</TableCell>
              <TableCell className="font-mono text-mono tabular-nums">
                {result.ratio.toFixed(2)}:1
              </TableCell>
              <TableCell className="font-mono text-mono tabular-nums">{result.min}:1</TableCell>
              <TableCell>
                <Badge tone={VERDICT_TONE[result.verdict]}>{VERDICT_LABEL[result.verdict]}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

Create `apps/storybook/src/docs-kit/spacing-scale.tsx`:

```tsx
import { cssValue, token } from "./catalogue";

export interface SpacingScaleProps {
  steps: readonly number[];
}

/** Each step drawn at N × the spacing unit, labelled with its step and its pixel length. */
export function SpacingScale({ steps }: SpacingScaleProps) {
  const unit = token("spacing");
  const unitPx = Number.parseFloat(cssValue("spacing"));
  return (
    <ol aria-label="Spacing scale" className="flex flex-wrap items-end gap-3">
      {steps.map((step) => (
        <li key={step} className="flex flex-col items-center gap-1">
          <span
            aria-hidden
            data-step={step}
            className="h-15 rounded-xs bg-pink-500"
            style={{ width: `calc(var(${unit.cssVar}) * ${String(step)})` }}
          />
          <span className="font-mono text-mono text-text-heading">{step}</span>
          <span className="font-mono text-mono text-text-muted">{step * unitPx}px</span>
        </li>
      ))}
    </ol>
  );
}
```

Create `apps/storybook/src/docs-kit/radius-scale.tsx`:

```tsx
import { formatValue, tokensWithPrefix } from "./catalogue";

/** Every primitive radius on a sample tile; the pill on a button-shaped bar. */
export function RadiusScale() {
  return (
    <ul aria-label="Corner radii" className="flex flex-wrap items-end gap-4">
      {tokensWithPrefix("radius-", "primitive").map((entry) => {
        const isPill = entry.name === "radius-pill";
        return (
          <li key={entry.name} className="flex flex-col gap-2">
            <span
              aria-hidden
              data-token={entry.name}
              className={
                isPill ? "h-10 w-28 bg-pink-500" : "h-15 w-18 border border-pink-200 bg-pink-100"
              }
              style={{ borderRadius: `var(${entry.cssVar})` }}
            />
            <span className="font-mono text-mono text-text-muted">
              {entry.name.replace("radius-", "")} · {formatValue(entry.value)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
```

Create `apps/storybook/src/docs-kit/shadow-ladder.tsx`:

```tsx
import { token } from "./catalogue";

export interface ShadowLadderProps {
  /** Shadow tokens in ladder order. */
  names: readonly string[];
}

/** The depth ladder: each shadow on a card-sized block, with the use its token describes. */
export function ShadowLadder({ names }: ShadowLadderProps) {
  return (
    <ul aria-label="Depth ladder" className="flex flex-wrap gap-6 py-2">
      {names.map((name) => {
        const entry = token(name);
        return (
          <li key={name} className="flex w-28 flex-col gap-2">
            <span
              aria-hidden
              data-token={name}
              className={
                name === "shadow-brand"
                  ? "h-16 rounded-lg bg-pink-500"
                  : "h-16 rounded-lg border border-border-subtle bg-surface-card"
              }
              style={{ boxShadow: `var(${entry.cssVar})` }}
            />
            <span className="font-mono text-mono text-text-heading">{entry.name}</span>
            <span className="text-caption text-text-subtle">{entry.description}</span>
          </li>
        );
      })}
    </ul>
  );
}
```

Create `apps/storybook/src/docs-kit/motion-demo.tsx`:

```tsx
import { Button } from "@pink-paprikaa-web/ui";
import { useState } from "react";

import { formatValue, token } from "./catalogue";

export interface MotionDemoProps {
  /** Easing step: `out`, `in-out`, `entrance`, `pop`. */
  ease: string;
  /** Duration step: `instant`, `fast`, `base`, `slow`, `page`. */
  duration: string;
  /** Where the design system uses this pairing. */
  use: string;
}

/** A dot that travels its track on one easing and one duration, toggled by a button. */
export function MotionDemo({ ease, duration, use }: MotionDemoProps) {
  const easing = token(`ease-${ease}`);
  const time = token(`duration-${duration}`);
  const unit = token("spacing");
  const [isAtEnd, setIsAtEnd] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button
        variant="secondary"
        size="sm"
        aria-pressed={isAtEnd}
        onClick={() => {
          setIsAtEnd((current) => !current);
        }}
      >
        Play {easing.cssVar} over {time.cssVar}
      </Button>
      <div className="relative h-2.5 w-full max-w-75 rounded-pill bg-ink-200">
        <span
          aria-hidden
          data-token={easing.name}
          className="absolute inset-y-0 w-8 rounded-pill bg-pink-500"
          style={{
            left: isAtEnd ? `calc(100% - var(${unit.cssVar}) * 8)` : "0px",
            transitionProperty: "left",
            transitionDuration: `var(${time.cssVar})`,
            transitionTimingFunction: `var(${easing.cssVar})`,
          }}
        />
      </div>
      <span className="font-mono text-mono text-text-muted">
        {time.cssVar} {formatValue(time.value)} · {use}
      </span>
    </div>
  );
}
```

- [ ] **Step 8: Seed the shared fixtures**

Create `apps/storybook/src/kits/fixtures.ts` (Task 10 replaces it with the full kit fixtures — these three exports stay identical):

```ts
import { brand } from "@pink-paprikaa-web/content";

import type { TrackerStep } from "@pink-paprikaa-web/ui";

const [flagship] = brand.outlets;
if (flagship === undefined) {
  throw new Error("storybook: the brand facts list no outlet (packages/content)");
}

/** The outlet every specimen, kit and pattern names. */
export const OUTLET = flagship;

/** The year the legal lines print — read once when Storybook is built, as an app does at build. */
export const BUILD_YEAR = new Date().getFullYear();

/** Order steps from the design system's OrderTracker. */
export const ORDER_STEPS: TrackerStep[] = [
  { label: "Order in", note: "Kitchen's on it." },
  { label: "On the tandoor", note: "Chilli paneer is charring." },
  { label: "Ready for pickup", note: "Counter 2, ask for Paprikaa." },
];
```

- [ ] **Step 9: Run to green, then probe the loud failure**

Run:

```bash
pnpm nx lint @pink-paprikaa-web/storybook --fix 2>&1 | tail -5
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- docs-kit.stories 2>&1 | tail -15
```

Expected: 11 stories pass (axe included).

Probe (Review Focus 1): in `docs-kit.stories.tsx`, change `<Swatch name="color-pink-500" />` to `<Swatch name="color-pink-501" />`; rerun; expect FAIL with `docs-kit: no token "color-pink-501" in @pink-paprikaa-web/design-tokens/tokens.json`. Revert; rerun green. Paste both.

- [ ] **Step 10: Gate and commit**

```bash
pnpm nx run-many -t typecheck lint -p @pink-paprikaa-web/storybook --skip-nx-cache --outputStyle=static 2>&1 | tail -8
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -4
pnpm nx format:check && pnpm nx sync:check
git add apps/storybook pnpm-lock.yaml tsconfig.json
git commit -m "feat(storybook): docs-kit helpers that read tokens and fail loudly

Swatch, TokenTable, TypeSpecimen, ContrastMatrix, SpacingScale, RadiusScale,
ShadowLadder and MotionDemo read every value from the token catalogue; a
missing name throws, so a renamed token fails storybook:test on the page that
asked for it. Contract tests are hidden stories in a real browser, where a
computed colour or width can actually be asserted.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 3: Introduction and the Brand group

Sources: `guidelines/{brand-logo,brand-wordmark,brand-symbol,mark-legibility,brand-pattern,diamond-motif,brand-company}.card.html`, design-system `readme.md` §2 and §4, spec §4 C3/C10/C16 and §7.3.

**Files:**

- Replace: `apps/storybook/src/docs/introduction.mdx`
- Create: `apps/storybook/src/foundations/brand/{company-details.tsx,brand.stories.tsx,logo.mdx,pattern.mdx,company-details.mdx,voice-and-content.mdx,iconography.mdx}`

**Dev reference:** `git show dev:packages/ui/src/docs/{introduction,voice-and-accessibility}.mdx`

**Dev parity:**

| Dev item                                                                                                                        | Ruling        | Where / spec clause                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intro hero: flooded pink panel, overline, display title, tagline, "pink is the whole identity"                                  | ADD / DROP    | ADD the line as prose (Step 4). DROP the hand-classed panel: D4 names (`rounded-5`, `text-subtitle2`), §11.2 R23 (`max-w-(--…)`); the flooded-pink move is live on Brand → Pattern and Colors → Surfaces |
| "What this is": pure-veg café, Sector 57 / MKM Market                                                                           | ALREADY       | Brand → Company details binds the outlet from `@pink-paprikaa-web/content` (D12 — a page never retypes a fact)                                                                                           |
| Personality: loud, warm, young, city-street; one pink, warm neutrals, one accent; restraint                                     | ADD           | Step 4 intro                                                                                                                                                                                             |
| "How it fits together" layer table + imports only go downward (lint-enforced)                                                   | ADD           | Step 4 intro, with D14 (`layouts`, atoms import only Icon)                                                                                                                                               |
| "Using it": barrel import + the two-line CSS contract                                                                           | ALREADY       | Step 4 "Consume it"                                                                                                                                                                                      |
| What `styles.css` pulls in (theme, keyframes, base layer, focus ring, reduced motion)                                           | ADD           | Step 4 "Consume it"                                                                                                                                                                                      |
| "Stock Tailwind classes do not exist here" (`rounded-lg`, `text-sm`, `bg-red-500`, `shadow-md`, `font-sans`)                    | ADD           | Step 4, re-stated for D4 names (`rounded-lg` is real and 16px; the rest compile to nothing)                                                                                                              |
| "Before you add a component": tokens first, canonical shape, the trio, the gate                                                 | ADD           | Step 4 "For authors", pointing at AUTHORING.md §5, §3, §2 and spec §11.1                                                                                                                                 |
| Voice: tone, you/we, the seven Write/Don't rows, casing, numbers, plain labels, no emoji, one "!", never-say, veg once          | ALREADY       | Step 5 `voice-and-content.mdx`                                                                                                                                                                           |
| Hard rule: **Pink Paprikaa** — two `a`s; a misspelling is a content bug                                                         | ADD           | Step 5 `voice-and-content.mdx` Rules                                                                                                                                                                     |
| Accessibility: axe in every test and again in every story; `a11y.test = "error"`                                                | ADD           | Step 4 intro "Accessibility"                                                                                                                                                                             |
| Guarantees: brand focus ring, 44px targets, disabled = real grey fill, behaviour from Radix, global reduced motion              | ADD           | Step 4 intro "Accessibility" — Radix line restated for D7 (native first, Radix for five); 36/38px exception per §5.5                                                                                     |
| Each use owns: a name (icon-only label, decorative `aria-hidden`), never colour alone (SpiceLevel/DietMark text), heading order | ADD           | Step 4 intro — heading order via `headingLevel` (§5.5), not only `Text as`                                                                                                                               |
| "`text-muted` only on light grounds; on pink/ink use `text-on-brand`/`text-on-inverse`"                                         | ADD (adapted) | Step 4 intro: D5 — put the content on a `data-surface` field and the tokens remap; Colors → Contrast lists the pairs                                                                                     |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: docs-kit (Task 2); `brand`, `toBrandLines` (content); `Logo`, `LogoLockup`, `PatternField`, `Text`, `SpiceLevel`, `StepTracker`, `Rating`, `StatusDot`, `Spinner`, `Icon`, brand glyphs, `DietMark`, `Card`, `Badge`, `KeyValueList` (ui).
- Produces: `CompanyDetails`, `pendingFacts(value)`, `OWNER_TO_SUPPLY`; specimens `Brand/Specimens` → `Lockup`, `Wordmark`, `ClearSpace`, `LogoTokens`, `SymbolMark`, `MarkLegibility`, `PatternFields`, `PatternTokens`, `DiamondMotif`, `CompanyFacts`, `IconSizes`, `BrandGlyphs`, `DietAndHeat`; pages `Introduction`, `Brand/Logo`, `Brand/Pattern`, `Brand/Company details`, `Brand/Voice & content`, `Brand/Iconography`.

- [ ] **Step 1: Write the failing Company details test (Review Focus 2)**

Create `apps/storybook/src/foundations/brand/brand.stories.tsx` with the meta and **only** this story first:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { brand, toBrandLines } from "@pink-paprikaa-web/content";
import { expect, within } from "storybook/test";

import { BUILD_YEAR } from "../../kits/fixtures";
import { CompanyDetails, OWNER_TO_SUPPLY, pendingFacts } from "./company-details";

/** Live visuals for the Brand pages. Hidden from the sidebar; rendered by the MDX; run by storybook:test. */
const meta = {
  title: "Brand/Specimens",
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const CompanyFacts: Story = {
  render: () => <CompanyDetails />,
  play: async ({ canvas }) => {
    const pending = pendingFacts(brand);
    await expect(pending.length).toBeGreaterThan(0);
    // Every null fact is shown where it belongs, and nowhere does a placeholder read TODO.
    await expect(canvas.getAllByText(OWNER_TO_SUPPLY)).toHaveLength(pending.length);
    await expect(canvas.queryByText(/TODO/)).toBeNull();
    // …and listed by path, with the count computed from the data.
    const list = canvas.getByRole("list", {
      name: `${String(pending.length)} facts pending from the owner`,
    });
    for (const path of pending) {
      await expect(within(list).getByText(path)).toBeVisible();
    }
    await expect(canvas.getByText(toBrandLines(brand, BUILD_YEAR).copyright)).toBeVisible();
  },
};
```

Run: `pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- brand.stories 2>&1 | tail -8`
Expected: FAIL — `Failed to resolve import "./company-details"`.

- [ ] **Step 2: Implement `CompanyDetails`**

Create `apps/storybook/src/foundations/brand/company-details.tsx`:

```tsx
import { brand, toBrandLines } from "@pink-paprikaa-web/content";
import { Badge, Card, type KeyValueItem, KeyValueList, Text } from "@pink-paprikaa-web/ui";
import { type ReactNode, useId } from "react";

import { BUILD_YEAR } from "../../kits/fixtures";

export const OWNER_TO_SUPPLY = "Owner to supply";

/** Every fact the owner has not supplied yet, by path (`billing.upi`, `outlets[0].hours`). */
export function pendingFacts(value: unknown, path = ""): string[] {
  if (value === null) return [path];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => pendingFacts(item, `${path}[${String(index)}]`));
  }
  if (typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) =>
      pendingFacts(child, path === "" ? key : `${path}.${key}`)
    );
  }
  return [];
}

function fact(value: string | number | null): ReactNode {
  return value === null ? <Badge tone="danger">{OWNER_TO_SUPPLY}</Badge> : value;
}

function percent(rate: number): string {
  return `${String(Math.round(rate * 1000) / 10)}%`;
}

interface FactBox {
  heading: string;
  items: KeyValueItem[];
}

/** The brand facts as the design system's Company details card shows them, bound to the real data. */
export function CompanyDetails() {
  const pendingId = useId();
  const lines = toBrandLines(brand, BUILD_YEAR);
  const { billing, contact, legal } = brand;
  const pending = pendingFacts(brand);
  const boxes: FactBox[] = [
    {
      heading: "Identity",
      items: [
        { key: "name", value: `${brand.name} · ${brand.nameDevanagari}` },
        { key: "tagline", value: brand.tagline },
        { key: "statement", value: brand.statement },
        { key: "veg", value: brand.vegStatement },
        { key: "established", value: brand.established },
      ],
    },
    {
      heading: "Legal",
      items: [
        { key: "entity", value: legal.entity },
        { key: "cin", value: legal.cin },
        { key: "gstin", value: legal.gstin },
        { key: "fssai", value: legal.fssai },
        { key: "pan", value: legal.pan },
        { key: "registered", value: legal.registeredAddress },
      ],
    },
    {
      heading: "Contact",
      items: [
        { key: "web", value: contact.website },
        { key: "phone", value: contact.phoneDisplay },
        { key: "whatsapp", value: contact.whatsapp },
        { key: "email", value: contact.email },
        { key: "orders", value: contact.ordersEmail },
        { key: "franchise", value: contact.franchiseEmail },
        { key: "careers", value: contact.careersEmail },
      ],
    },
    {
      heading: "Billing",
      items: [
        {
          key: "gst",
          value: `${percent(billing.gstRate)} (CGST ${percent(billing.gstSplit.cgst)} + SGST ${percent(billing.gstSplit.sgst)})`,
        },
        { key: "tax note", value: billing.taxNote },
        { key: "invoice", value: `${billing.invoicePrefix}-0000` },
        { key: "account", value: billing.accountName },
        { key: "bank", value: fact(billing.bankName) },
        { key: "account no.", value: fact(billing.accountNumber) },
        { key: "ifsc", value: fact(billing.ifsc) },
        { key: "upi", value: fact(billing.upi) },
      ],
    },
    {
      heading: "Social",
      items: brand.social.map((profile) => ({ key: profile.network, value: profile.handle })),
    },
    {
      heading: `Outlets · ${lines.cities}`,
      items: brand.outlets.flatMap((outlet) => [
        { key: outlet.city, value: `${outlet.name} — ${outlet.address}` },
        { key: "hours", value: fact(outlet.hours) },
        { key: "maps", value: fact(outlet.mapsUrl) },
      ]),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {boxes.map((box) => (
          <Card key={box.heading} padding="sm" className="flex min-w-0 flex-col gap-3">
            <Text variant="overline" tone="brand" as="h2">
              {box.heading}
            </Text>
            <KeyValueList items={box.items} density="compact" keyWidth="sm" />
          </Card>
        ))}
      </div>
      <Card variant="quiet" padding="sm" className="flex flex-col gap-3">
        <Text variant="overline" tone="brand" as="h2">
          Derived lines — toBrandLines(brand, year)
        </Text>
        <KeyValueList
          density="compact"
          keyWidth="md"
          items={[
            { key: "copyright", value: lines.copyright },
            { key: "fssai", value: lines.fssai },
            { key: "gstin", value: lines.gstin },
            { key: "cin", value: lines.cin },
            { key: "contactShort", value: lines.contactShort },
            { key: "footerPolicies", value: lines.footerPolicies.join(" · ") },
          ]}
        />
      </Card>
      <div className="flex flex-col gap-2">
        <Text variant="h4" as="h2" id={pendingId}>
          {pending.length} facts pending from the owner
        </Text>
        <ul aria-labelledby={pendingId} className="flex flex-col gap-1">
          {pending.map((path) => (
            <li key={path} className="font-mono text-mono text-text-muted">
              {path}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

Run the Step 1 command → PASS.

Probe: delete the `{ key: "ifsc", … }` row; rerun; expect FAIL (`expected … to have length 6` — the count comes from the data, the page lost a fact). Restore; rerun green. Paste both.

- [ ] **Step 3: The remaining Brand specimens**

Replace `apps/storybook/src/foundations/brand/brand.stories.tsx` with the full file (the `CompanyFacts` story unchanged):

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MapPin, MessageCircle, Search, ShoppingBag, Store } from "lucide-react";
import { expect, within } from "storybook/test";

import { brand, toBrandLines } from "@pink-paprikaa-web/content";
import {
  DietMark,
  Icon,
  InstagramGlyph,
  LinkedinGlyph,
  Logo,
  LogoLockup,
  PatternField,
  Rating,
  SpiceLevel,
  Spinner,
  StatusDot,
  StepTracker,
  Text,
  YoutubeGlyph,
} from "@pink-paprikaa-web/ui";

import { formatValue, token } from "../../docs-kit/catalogue";
import { SpecimenRow, SpecimenTile } from "../../docs-kit/specimen";
import { TokenTable } from "../../docs-kit/token-table";
import { BUILD_YEAR, ORDER_STEPS } from "../../kits/fixtures";
import { CompanyDetails, OWNER_TO_SUPPLY, pendingFacts } from "./company-details";

/** Live visuals for the Brand pages. Hidden from the sidebar; rendered by the MDX; run by storybook:test. */
const meta = {
  title: "Brand/Specimens",
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const SIZES = ["sm", "md", "lg"] as const;
const ICON_SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const LEVELS = [1, 2, 3, 4] as const;

export const Lockup: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-3">
      <SpecimenTile
        caption='variant="lockup" tone="pink"'
        className="h-30 items-center justify-center border border-border-subtle bg-surface-page p-6"
      >
        <Logo className="w-44" />
      </SpecimenTile>
      <SpecimenTile
        caption='tone="white" · on ink'
        surface="ink"
        className="h-30 items-center justify-center bg-surface-inverse p-6"
      >
        <Logo tone="white" className="w-44" />
      </SpecimenTile>
      <SpecimenTile
        caption='tone="badge"'
        className="h-30 items-center justify-center bg-surface-sunken p-3"
      >
        <Logo tone="badge" className="w-24" />
      </SpecimenTile>
    </div>
  ),
};

export const Wordmark: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-3">
      <SpecimenTile
        caption='variant="wordmark" tone="pink"'
        className="h-30 items-center justify-center border border-border-subtle bg-surface-page p-6"
      >
        <Logo variant="wordmark" className="w-44" />
      </SpecimenTile>
      <SpecimenTile
        caption='tone="white" · on ink'
        surface="ink"
        className="h-30 items-center justify-center bg-surface-inverse p-6"
      >
        <Logo variant="wordmark" tone="white" className="w-44" />
      </SpecimenTile>
      <SpecimenTile
        caption='tone="badge"'
        className="h-30 items-center justify-center bg-surface-sunken p-3"
      >
        <Logo variant="wordmark" tone="badge" className="w-24" />
      </SpecimenTile>
    </div>
  ),
};

export const ClearSpace: Story = {
  render: () => (
    <SpecimenRow label="Dashed: the clear space LogoLockup keeps on every side — the height of the P">
      <div className="border border-dashed border-border-brand">
        <LogoLockup tone="pink" />
      </div>
      <div className="border border-dashed border-border-brand">
        <LogoLockup tone="pink" hasTagline={false} />
      </div>
    </SpecimenRow>
  ),
};

export const LogoTokens: Story = {
  render: () => (
    <TokenTable
      caption="Logo widths"
      selection={{ names: ["spacing-logo-lockup", "spacing-logo-wordmark", "spacing-logo-symbol"] }}
    />
  ),
};

export const SymbolMark: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-4">
      <SpecimenTile
        caption='tone="pink"'
        className="size-30 items-center justify-center bg-surface-page-alt"
      >
        <Logo variant="symbol" className="w-16" />
      </SpecimenTile>
      <SpecimenTile
        caption='tone="white"'
        surface="brand"
        className="size-30 items-center justify-center bg-surface-brand"
      >
        <Logo variant="symbol" tone="white" className="w-16" />
      </SpecimenTile>
      <SpecimenTile
        caption='tone="white" · on ink'
        surface="ink"
        className="size-30 items-center justify-center bg-surface-inverse"
      >
        <Logo variant="symbol" tone="white" className="w-16" />
      </SpecimenTile>
      <SpecimenTile
        caption='tone="badge" · app icon'
        className="size-30 items-center justify-center"
      >
        <span className="block overflow-hidden rounded-xl shadow-brand">
          <Logo variant="symbol" tone="badge" className="block w-30" />
        </span>
      </SpecimenTile>
    </div>
  ),
};

export const MarkLegibility: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <SpecimenRow label='StatusDot — size="sm" · "md"'>
        {(["sm", "md"] as const).map((size) => (
          <StatusDot key={size} tone="live" size={size} label={`Live · ${size}`} />
        ))}
      </SpecimenRow>
      <SpecimenRow label='SpiceLevel — size="sm" · "md" · "lg"'>
        {SIZES.map((size) => (
          <SpiceLevel key={size} level={2} size={size} />
        ))}
      </SpecimenRow>
      <SpecimenRow label='Rating — size="sm" · "md" · "lg"'>
        {SIZES.map((size) => (
          <Rating key={size} value={4} size={size} hasValue={false} />
        ))}
      </SpecimenRow>
      <SpecimenRow label='Spinner — size="sm" · "md" · "lg"'>
        {SIZES.map((size) => (
          <Spinner key={size} size={size} label={`Loading · ${size}`} />
        ))}
      </SpecimenRow>
    </div>
  ),
};

export const PatternFields: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <PatternField tone="brand" radius="lg" className="flex flex-col gap-1.5 px-7 py-6">
        <Text variant="overline" tone="muted" as="span">
          Loyalty
        </Text>
        <Text variant="h3" weight="black" as="span">
          3 more visits and chai&apos;s on us.
        </Text>
      </PatternField>
      <div className="grid gap-4 md:grid-cols-4">
        <PatternField tone="ink" radius="lg" className="h-24 p-4">
          <span className="font-mono text-mono">tone=&quot;ink&quot;</span>
        </PatternField>
        <PatternField tone="ink" density="faint" radius="lg" className="h-24 p-4">
          <span className="font-mono text-mono">density=&quot;faint&quot;</span>
        </PatternField>
        <PatternField tone="soft" radius="lg" className="h-24 p-4">
          <span className="font-mono text-mono">tone=&quot;soft&quot;</span>
        </PatternField>
        <PatternField tone="light" radius="lg" className="h-24 p-4">
          <span className="font-mono text-mono">tone=&quot;light&quot;</span>
        </PatternField>
      </div>
    </div>
  ),
};

export const PatternTokens: Story = {
  render: () => (
    <TokenTable caption="Pattern opacity and tiles" selection={{ prefix: "pattern-" }} />
  ),
};

export const DiamondMotif: Story = {
  render: () => (
    <div className="grid gap-6 md:grid-cols-2">
      <SpecimenRow label="Heat scale — SpiceLevel">
        {LEVELS.map((level) => (
          <SpiceLevel key={level} level={level} />
        ))}
      </SpecimenRow>
      <SpecimenRow label="Step — StepTracker">
        <StepTracker steps={ORDER_STEPS} current={1} orientation="horizontal" />
      </SpecimenRow>
      <SpecimenRow label="Score — Rating">
        <Rating value={4.5} />
      </SpecimenRow>
      <SpecimenRow label="Dot — StatusDot">
        <StatusDot tone="open" label="Open now" />
        <StatusDot tone="busy" label="Kitchen is busy" />
        <StatusDot tone="closed" label="Closed" />
        <StatusDot tone="live" label="Live" isPulsing />
      </SpecimenRow>
      <SpecimenRow label="Loader — Spinner">
        <Spinner size="lg" />
      </SpecimenRow>
    </div>
  ),
};

export const CompanyFacts: Story = {
  render: () => <CompanyDetails />,
  play: async ({ canvas }) => {
    const pending = pendingFacts(brand);
    await expect(pending.length).toBeGreaterThan(0);
    // Every null fact is shown where it belongs, and nowhere does a placeholder read TODO.
    await expect(canvas.getAllByText(OWNER_TO_SUPPLY)).toHaveLength(pending.length);
    await expect(canvas.queryByText(/TODO/)).toBeNull();
    // …and listed by path, with the count computed from the data.
    const list = canvas.getByRole("list", {
      name: `${String(pending.length)} facts pending from the owner`,
    });
    for (const path of pending) {
      await expect(within(list).getByText(path)).toBeVisible();
    }
    await expect(canvas.getByText(toBrandLines(brand, BUILD_YEAR).copyright)).toBeVisible();
  },
};

export const IconSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <SpecimenRow label="Icon — size · token value">
        {ICON_SIZES.map((size) => (
          <span key={size} className="flex flex-col items-center gap-2 text-text-heading">
            <Icon icon={MessageCircle} size={size} />
            <span className="font-mono text-mono text-text-muted">
              {size} · {formatValue(token(`spacing-icon-${size}`).value)}
            </span>
          </span>
        ))}
      </SpecimenRow>
      <SpecimenRow label='Lucide glyphs — size="lg"'>
        <Icon icon={MessageCircle} size="lg" label="Message" />
        <Icon icon={ShoppingBag} size="lg" label="Order" />
        <Icon icon={MapPin} size="lg" label="Location" />
        <Icon icon={Search} size="lg" label="Search" />
        <Icon icon={Store} size="lg" label="Outlet" />
      </SpecimenRow>
    </div>
  ),
};

export const BrandGlyphs: Story = {
  render: () => (
    <SpecimenRow label="InstagramGlyph · YoutubeGlyph · LinkedinGlyph — the same grid and stroke">
      <Icon icon={InstagramGlyph} size="lg" label="Instagram" />
      <Icon icon={YoutubeGlyph} size="lg" label="YouTube" />
      <Icon icon={LinkedinGlyph} size="lg" label="LinkedIn" />
    </SpecimenRow>
  ),
};

export const DietAndHeat: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <SpecimenRow label='DietMark — the only diet mark; size="sm" · "md" · "lg"'>
        {SIZES.map((size) => (
          <DietMark key={size} size={size} />
        ))}
      </SpecimenRow>
      <SpecimenRow label="SpiceLevel — hasLabel, level 1–4">
        {LEVELS.map((level) => (
          <SpiceLevel key={level} level={level} hasLabel />
        ))}
      </SpecimenRow>
    </div>
  ),
};
```

- [ ] **Step 4: The Introduction page**

Replace `apps/storybook/src/docs/introduction.mdx`:

````mdx
import { Meta } from "@storybook/addon-docs/blocks";

<Meta title="Introduction" />

# Pink Paprikaa Design System

The production design system for pinkpaprikaa.com — tokens, 90 React components and three
reference kits, rebuilt from the supplied design-system folder. This Storybook is that folder's
"Design System tab": the same thirteen groups, in the same order.

The system is loud, warm, young and city-street confident. Pink is not decorative here — it is the
whole identity: one primary pink used at full strength, warm neutrals tinted toward it, and a single
accent per screen. Everything else is restraint.

| Group                                                         | What it holds                                                                                                                                     |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brand · Colors · Type · Spacing · Layout · Motion · Marketing | Foundations — every guideline card as a live page. Values are read from the token build, never retyped.                                           |
| Atoms · Molecules · Organisms · Layouts                       | One story file per component: every variant, size, tone and state on its design-system card, a Playground, surface stories and interaction tests. |
| Website · App · Marketing → Kit                               | Reference kits composed only from the library, with real brand facts and verified reviews — each badged "Reference kit — not production copy".    |

## How it fits together

| Layer                              | What lives there                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| `@pink-paprikaa-web/design-tokens` | Every value, authored as DTCG JSON and compiled by Style Dictionary            |
| `@pink-paprikaa-web/ui` — atoms    | Indivisible primitives: `Button` `Text` `Icon` `Input` `SpiceLevel` `DietMark` |
| — molecules                        | Small compositions: `Field` `MenuItemCard` `Tabs` `Alert`                      |
| — organisms                        | Page-level regions: `SiteHeader` `HeroBanner` `MenuList` `CtaBand`             |
| — layouts                          | Spacing, width and frame only: `Container` `Section` `AutoGrid` `PostFrame`    |

A layer composes only the layers below it: a molecule may use atoms, an atom may never reach a
molecule, and an atom imports nothing but `Icon`. The rule is lint-enforced (`atomic-layering`),
not advisory.

## Consume it

An app imports Tailwind and the library's one stylesheet — nothing else. The library scans its
own sources, so the app adds no `@source` for it.

```css
@import "tailwindcss";
@import "@pink-paprikaa-web/ui/styles.css";
```

That one import brings the token theme, the `data-surface` remaps, the base layer (element
defaults, the pink focus ring, the reduced-motion contract), the system's named utilities and its
seven animations.

Components are named imports from the one barrel — `import { Button, Field, Input } from "@pink-paprikaa-web/ui";` —
and a Next.js app adds `transpilePackages: ["@pink-paprikaa-web/ui"]`. Fonts are the app's to load
(Poppins with the Devanagari subset, DM Sans, Space Mono); the font tokens pick them up by name.

## The one thing that will surprise you

**Stock Tailwind scales do not exist here.** The tokens package clears every Tailwind namespace it
replaces, so `text-sm`, `bg-red-500`, `shadow-md` and `font-sans` compile to nothing — a class
outside the system fails loudly instead of quietly rendering an off-brand value. Where a name
matches the design system's own token it is the system's value: `rounded-lg` is the card radius.
Use `text-body-sm`, `bg-status-danger`, `shadow-2`, `font-body`.

## Rules the system keeps

- **Tokens only.** Every class is a token utility (`bg-surface-brand`, `text-h2`, `rounded-lg`) —
  no arbitrary values, no literal colours. The brand pink's hex exists once, in
  `packages/design-tokens`.
- **Text colour follows the surface.** A flooded field carries `data-surface`; headings, text,
  links, borders and focus re-read the semantic tokens inside it. No component takes an `on` prop.
- **No content inside the system.** Copy, links, prices and brand facts arrive as props; stories
  bind fixtures, and Brand → Company details and the kits bind `@pink-paprikaa-web/content`.
- **Server-first, native-first.** Only components that own state or effects are client components;
  native `<select>`, `<details>` and inputs come before any library.
- **Accessibility is gated.** Every story runs axe in headless Chromium. Colour contrast is owned by
  the token contrast policy instead — **Colors → Contrast** shows the one declared exception.

## Accessibility

Every component test ends with an axe check, and every story runs axe again in headless Chromium
with `a11y.test = "error"` — a violation fails the suite; it does not sit in a panel nobody opens.

### What the system guarantees

- **Focus is a brand decision.** The base layer paints `:focus-visible` as a 2px `--color-focus`
  outline at a 2px offset, everywhere; fields add the 3px focus ring. No component restates it,
  and none can quietly drop it.
- **Touch targets are at least the hit token** (`--spacing-hit`), icon-only buttons included. Only
  the system's 36/38px controls go smaller, and never below 24px (spec §5.5).
- **Disabled is a real grey fill**, never a reduced opacity — opacity fails contrast and reads as
  "loading" rather than "unavailable".
- **Behaviour is native or Radix, never hand-rolled.** Native `<select>`, `<details>` and inputs
  come first; Dialog/Sheet, Tabs, Tooltip, Toast and ToggleGroup use Radix, so roles, keyboard
  handling and focus management come built in.
- **Reduced motion is global.** `prefers-reduced-motion: reduce` collapses animation and transition
  durations in the base layer; no component handles it alone.

### What each use owns

- **A name.** An icon-only control takes a `label` (`IconButton` requires one); a decorative icon is
  `aria-hidden`, so its meaning is not announced twice beside the text it decorates.
- **Never colour alone.** A status colour always arrives with a message and a glyph. `SpiceLevel`
  and `DietMark` carry text alternatives — heat and diet are load-bearing information.
- **Heading order.** A component's look and its document level are separate decisions: every titled
  component takes `headingLevel` (and `Text` takes `as`); the page owns its outline.
- **Contrast follows the surface.** Put content that sits on pink or ink inside a `data-surface`
  field and the text tokens remap; never hand-pick a light text colour. Muted and subtle text are
  for secondary content only.

## For authors

The binding authoring contract is `packages/ui/AUTHORING.md`; the decisions are in
`docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md`. Foundation pages live in
`apps/storybook/src/foundations`, their helpers in `apps/storybook/src/docs-kit` — docs-only, never
shipped in `packages/ui`.

Before you add a component:

1. **Tokens first** — a new visual value goes into `packages/design-tokens/tokens/` before any
   component uses it (AUTHORING §5).
2. **Read the design-system files and copy the canonical shape** (AUTHORING §1, §3), or run
   `/new-component`.
3. **Ship the trio** — component, test (behaviour + axe), stories (every card row) (AUTHORING §2).
4. **Gate:** `pnpm nx test ui && pnpm nx lint ui && pnpm nx run storybook:build`, then
   `pnpm nx test storybook` (AUTHORING §12).
````

- [ ] **Step 5: The Brand pages**

Create `apps/storybook/src/foundations/brand/logo.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./brand.stories";

<Meta title="Brand/Logo" />

{/* source: guidelines/brand-logo.card.html */}
{/* source: guidelines/brand-wordmark.card.html */}
{/* source: guidelines/brand-symbol.card.html */}
{/* source: guidelines/mark-legibility.card.html */}

# Logo

Three marks — **lockup**, **wordmark**, **symbol** — each in three tones: `pink` on light, `white`
on pink, ink or photography, and `badge` on its own pink plate. Reach for them through `Logo`
(`variant`, `tone`) or `LogoLockup` (clear space built in); never place, recolour or retype the
artwork by hand.

## Lockup

The official logo, tagline included — pink, white and the badge plate.

<Canvas of={Specimens.Lockup} meta={Specimens} sourceState="none" />

The tagline is part of the artwork — never set it in live type next to the mark; it is drawn,
kerned and locked to the wordmark, and retyping it drifts. Use the lockup wherever there is at
least 200px of width; below that switch to the wordmark. The lockup is the default in every
header, footer, app screen, artboard and template: the tagline tucks into the space beside the
"P" descender, so swapping it in costs no layout anywhere.

## Wordmark

The lockup with the tagline removed — headers, app chrome, anything under 200px wide.

<Canvas of={Specimens.Wordmark} meta={Specimens} sourceState="none" />

Clear space around any logo is the height of the "P". The wordmark's minimum width is 140px.
Never recolour, rotate, outline or add effects to the logo.

<Canvas of={Specimens.ClearSpace} meta={Specimens} sourceState="none" />

<Canvas of={Specimens.LogoTokens} meta={Specimens} sourceState="none" />

## Symbol

The standalone diamond mark: pink and white on transparent, plus the badge plate — the app icon,
favicon and avatar.

<Canvas of={Specimens.SymbolMark} meta={Specimens} sourceState="none" />

## Mark legibility

How the embedded mark scales and strengthens as the diamond shrinks. Mark size and opacity both
ramp with the diamond: below 14px the mark is 86% of the square at 85% white, from 14 to 19px it
is 80% at 66%, and from 20px up it is 74% at 50%. Without the ramp a 12px dot draws an 8.9px
glyph at 42% — below the size where its strokes resolve, which is why small marks looked missing.
The components below draw the ramp themselves; they are shown at every size they ship.

<Canvas of={Specimens.MarkLegibility} meta={Specimens} sourceState="none" />
```

Create `apps/storybook/src/foundations/brand/pattern.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./brand.stories";

<Meta title="Brand/Pattern" />

{/* source: guidelines/brand-pattern.card.html */}
{/* source: guidelines/diamond-motif.card.html */}

# Pattern

The white symbol, tiled faintly, is the brand's only texture. No noise, no grain, no paper
texture, no hand-drawn illustration.

<Canvas of={Specimens.PatternFields} meta={Specimens} sourceState="none" />

`PatternField` paints it: `tone` sets the field and its `data-surface`, `tile` picks a tile size,
and `density="faint"` is the lighter pattern the handoff uses on ink sections. Use it on pink
panels, ticket stubs and loading states — never on cards, and never behind body text.

<Canvas of={Specimens.PatternTokens} meta={Specimens} sourceState="none" />

## Diamond + symbol

Every small diamond the system draws — heat levels, review scores, order-step markers, status
dots — is a rotated square with the brand mark inside it: white on a coloured fill, pink on an
empty ink-200 fill, so it never blends away. The loader is the bare mark, pulsing. These are the
live components, at the sizes the design system weighed (heat, step, score, dot, loader).

<Canvas of={Specimens.DiamondMotif} meta={Specimens} sourceState="none" />

The design system compared five treatments before settling on this one: plain diamonds, the mark
inside and upright, inside and aligned with the diamond, knocked out, and the mark alone (which
loses the heat colour). Places that already use the mark on its own — the loyalty card, empty
states, dividers, pattern fields — keep the bare symbol.
```

Create `apps/storybook/src/foundations/brand/company-details.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./brand.stories";

<Meta title="Brand/Company details" />

{/* source: guidelines/brand-company.card.html */}

# Company details

`brand` from `@pink-paprikaa-web/content` is the single source for name, legal, GST, contact,
outlets and billing — the design system's `brand.js`, validated by a Zod schema where it enters the
workspace. Every design reads from it; a page never retypes a fact. The derived strings —
copyright, licence lines, footer policies — come from `toBrandLines(brand, year)`, with the year
passed in when the site is built.

<Canvas of={Specimens.CompanyFacts} meta={Specimens} sourceState="none" />

A fact the owner has not supplied yet is `null` in the data — never the string "TODO" — and this
page shows every one as **Owner to supply**, then lists them by path. The count is computed from
the data, so a new pending fact appears here the moment it is added, and the page's test fails if
a box stops showing one.

The design system itself never imports these facts (a boundary rule): components take them as
props, and only apps and this Storybook bind them.
```

Create `apps/storybook/src/foundations/brand/voice-and-content.mdx` (design-system `readme.md` §2, verbatim except the two table-header glyphs, which are words here — the brand uses no emoji — plus the first bullet, the two-`a` rule carried from dev's Voice page):

```mdx
import { Meta } from "@storybook/addon-docs/blocks";

<Meta title="Brand/Voice & content" />

{/* source: readme.md §2 Content fundamentals */}

# Voice & content

**Voice: a confident city café that speaks Hinglish without apology.** The brand's one supplied
line of copy sets the whole tone — _"India's First Desi Urban Café"_: a claim, stated flatly, in
Title Case, no punctuation, no hedging. Copy follows that lead.

## Rules

- **`Pink Paprikaa` — two `a`s**, everywhere. A misspelling is a content bug, not a typo.
- **Person.** Talk to the guest as **you**; the café speaks as **we**. Never "the customer", never
  "users". _"Your table's ready."_ / _"We roast our own masala."_
- **Casing.** Title Case for names, claims and buttons of consequence (_"Order Now"_, _"Find a
  Paprikaa"_). Sentence case for body, helper text and form labels. **ALL CAPS only for
  eyebrows/overlines and heat labels** (`MENU`, `EXTRA HOT`) — never for a full sentence.
- **Length.** Headlines ≤ 6 words. Body sentences short — average 12 words, hard stop at 24. Menu
  descriptions ≤ 14 words, ingredient-led, no adjective stacking: _"Amritsari paneer, burnt chilli
  mayo, potato brioche."_ not _"A delicious hand-crafted artisanal paneer creation."_
- **Interface labels are plain, generic English.** Spice is _Mild / Medium / Hot / Extra Hot_;
  sizes are _Regular / Sharing_; nothing a guest has to decode. Anything a person taps, filters by,
  or is billed for uses the word they already know.
- **Hinglish belongs to dish names and voice, not to controls.** _Kulhad Chai_, _Gulkand Kulfi_,
  _Masala Cold Brew_ are dish names and stay as they are; the tagline _"Desi at heart. Urban by
  nature."_ stays exactly as written. But a filter chip, a radio label, a status line or a button
  never carries a word the guest might not know. Devanagari is reserved for the logo, big display
  moments and dish names on the menu (`छोले`, `कुल्फी`).
- **Numbers & prices.** `₹` with no space, no decimals on whole rupees: `₹240`. Ranges use an en
  dash: `₹180–₹320`. Times are 12-hour lowercase: `8am – 11:30pm`.
- **Emoji: no.** The brand has a chilli, a diamond symbol and a very loud pink; it does not need
  emoji. Use the chilli/heat glyph component for spice, not an emoji.
- **Exclamation marks:** at most one per screen, and never in a heading.
- **Being pure veg is stated once, plainly, and never apologised for or over-sold**: _"100%
  vegetarian kitchen."_ Never "veg-friendly", never "even meat-eaters love it", never a leaf emoji.
  The veg badge sits in the menu header and the footer — not on every dish name (the `DietMark`
  does that job).
- **Never say:** "artisanal", "curated", "experience" (as a noun), "elevated", "journey",
  "unleash", "revolutionise". Never call the food "authentic" — the brand's claim is _desi_, which
  is a fact, not a compliment.

## Examples

| Situation       | Write                                                                  | Don't                                                          |
| --------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| Hero headline   | Desi at heart. Urban by nature.                                        | Experience Our Curated Culinary Journey                        |
| Menu item       | Paprikaa Chilli Paneer — `₹280` · Amritsari paneer, burnt chilli mayo. | Our signature artisanal paneer creation, lovingly hand-crafted |
| Veg claim       | 100% vegetarian kitchen. Always was.                                   | 100% PURE VEG!! No compromise!                                 |
| Empty cart      | Nothing here yet. Let's fix that.                                      | Your cart is currently empty!                                  |
| Error           | That card didn't go through. Try another?                              | Transaction failed. Error code 402.                            |
| Order confirmed | Order in. Kitchen's on it.                                             | Thank you for your purchase!!!                                 |
| Loyalty         | 3 more visits and chai's on us.                                        | Unlock exclusive rewards today                                 |
```

(The design system's "Empty cart — Don't" cell ends with a cart emoji; it is dropped here for the same no-emoji rule the row illustrates.)

Create `apps/storybook/src/foundations/brand/iconography.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./brand.stories";

<Meta title="Brand/Iconography" />

{/* source: readme.md §4 Iconography */}

# Iconography

- **Lucide, self-hosted.** No icon set was supplied with the brand assets, so the system
  standardises on Lucide — a 24px grid, round caps, geometric construction, the closest match to
  the logo's even-weight geometry. It ships as `lucide-react` (tree-shaken, server-safe) and is
  passed as a component — `icon={MessageCircle}` — never a name string, never fetched from a CDN.
- **Stroke icons only**, painted with `currentColor` — never a second colour, never filled and
  stroked together. `Icon` sets the stroke itself: 2 at the two smallest sizes, 1.75 above.
- **Sizes by job:** `sm` inline with body text, `md` in buttons and list rows, `lg` in nav and the
  tab bar, `xl` in empty states.

<Canvas of={Specimens.IconSizes} meta={Specimens} sourceState="none" />

- **Brand glyphs belong to the brand.** The diamond symbol is a brand mark — bullets, loaders,
  pattern tiles, the app's launcher — never restyled or recoloured beyond pink and white. The
  chilli in the logo is part of the lockup and is never extracted as a standalone icon. The three
  social glyphs Lucide 1.x no longer ships are `InstagramGlyph`, `YoutubeGlyph` and
  `LinkedinGlyph`, drawn on the same grid.

<Canvas of={Specimens.BrandGlyphs} meta={Specimens} sourceState="none" />

- **Emoji are never icons** — not even for spice. Heat is `SpiceLevel`: filled diamonds on the heat
  ramp.
- **Unicode is used for two things only:** `₹` and the en dash in ranges.
- **The kitchen is 100% vegetarian — nothing non-veg, not even egg.** The only diet mark is the
  statutory green veg mark, `DietMark`, and every dish carries it. There is no egg mark and never a
  non-veg mark (owner decision 2026-09-27, spec C10 — the design system's egg-dot line is
  superseded).

<Canvas of={Specimens.DietAndHeat} meta={Specimens} sourceState="none" />
```

- [ ] **Step 6: Gate and commit**

```bash
pnpm nx lint @pink-paprikaa-web/storybook --fix 2>&1 | tail -5
pnpm nx run-many -t typecheck lint -p @pink-paprikaa-web/storybook --skip-nx-cache --outputStyle=static 2>&1 | tail -8
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- brand.stories 2>&1 | tail -12
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -4
pnpm nx format:check
```

Expected: 13 Brand specimens pass (axe included); the build indexes `Introduction` and the five Brand pages. Open `storybook:serve` → Brand → each page and confirm every Canvas renders (MDX is not run by the test suite; a broken `<Canvas of>` shows only here).

```bash
git add apps/storybook/src/docs apps/storybook/src/foundations/brand
git commit -m "feat(storybook): introduction and the Brand foundation pages

Logo, Pattern, Company details, Voice & content and Iconography from the
design system's cards and readme. Company details binds the validated brand
facts and lists every fact the owner has not supplied, counted from the data.
No egg mark: the kitchen is egg-free.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 4: The Colors group and the Contrast page

Sources: `guidelines/{color-primary,color-ink,color-accents,color-heat,color-semantic,color-surfaces,color-status}.card.html`, readme §3.1/§3.8, spec §5.

**Files:**

- Create: `apps/storybook/src/foundations/colors/{colors.stories.tsx,primary.mdx,ink.mdx,accents.mdx,heat.mdx,semantic.mdx,surfaces.mdx,status.mdx,contrast.mdx}`

**Dev reference:** `git show dev:packages/ui/src/docs/colour.mdx`

**Dev parity:**

| Dev item                                                                                         | Ruling  | Where / spec clause                                                               |
| ------------------------------------------------------------------------------------------------ | ------- | --------------------------------------------------------------------------------- |
| One primary at full strength; flat pink fields with white type; the soft pink does the calm work | ALREADY | `primary.mdx`                                                                     |
| Click any swatch name or value to copy it                                                        | ADD     | Task 2 `Swatch` (every `Swatches` here inherits it)                               |
| Neutrals warm, tinted toward pink — never blue-grey                                              | ALREADY | `ink.mdx`                                                                         |
| Max one spice accent per screen; max two backgrounds per composition                             | ALREADY | `accents.mdx`                                                                     |
| Only two gradients, both legibility scrims                                                       | ALREADY | `accents.mdx` + Layout → Utility classes                                          |
| Brand swatches with notes (primary, hover, active, soft, tint)                                   | ALREADY | `PinkRamp` + `SemanticTokens` "Interaction" table (`color-brand-hover`/`-active`) |
| Surface swatches (page, page-alt, card, sunken, brand, brand-soft, inverse, overlay, glass)      | ALREADY | `SemanticTokens` "Surfaces" (every `color-surface-*`) + `FourGrounds`             |
| "Text colours carry the family name: `text-text-heading`, not `text-heading`"                    | ADD     | Step 2 `semantic.mdx`                                                             |
| Border swatches (subtle, default, strong, brand, brand-soft)                                     | ALREADY | `SemanticTokens` "Borders"                                                        |
| Status pairs; never a status colour without a message                                            | ALREADY | `status.mdx`                                                                      |
| Heat: in order, used only by `SpiceLevel`                                                        | ALREADY | `heat.mdx`                                                                        |
| Primitives: prefer a semantic token                                                              | ALREADY | `semantic.mdx` ("a component never names a ramp step")                            |
| August token names (`brand-primary`, `ink-0`, `heat-1`, `border-brand-soft`)                     | DROP    | D4                                                                                |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: docs-kit (`Swatches`, `TokenTable`, `ContrastMatrix`, `contrastResults`, `VERDICT_LABEL`, `rgbOf`), `Alert`, `Card`, `SpiceLevel` (ui), `brand`, `OUTLET`.
- Produces: `Colors/Specimens` → `PinkRamp`, `InkRamp`, `Accents`, `TextCompanions`, `HeatScale`, `SemanticPanels`, `SemanticTokens`, `FourGrounds`, `LightIsland`, `SurfaceOverrides`, `StatusAlerts`, `StatusSwatches`, `Contrast`; eight pages under `Colors/`.

- [ ] **Step 1: Write the failing specimens (Contrast is Review Focus 4)**

Create `apps/storybook/src/foundations/colors/colors.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { brand } from "@pink-paprikaa-web/content";
import { Alert, Card, SpiceLevel } from "@pink-paprikaa-web/ui";

import { rgbOf } from "../../docs-kit/catalogue";
import { ContrastMatrix, contrastResults, VERDICT_LABEL } from "../../docs-kit/contrast-matrix";
import { SpecimenTile } from "../../docs-kit/specimen";
import { Swatches } from "../../docs-kit/swatch";
import { TokenTable } from "../../docs-kit/token-table";
import { OUTLET } from "../../kits/fixtures";

/** Live visuals for the Colors pages. Hidden from the sidebar; rendered by the MDX; run by storybook:test. */
const meta = {
  title: "Colors/Specimens",
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const PINK_RAMP = [50, 100, 200, 300, 400, 500, 600, 700, 800].map(
  (step) => `color-pink-${String(step)}`
);
const INK_RAMP = ["900", "800", "700", "600", "500", "400", "300", "200", "100", "000"].map(
  (step) => `color-ink-${step}`
);
const ACCENTS = [
  "color-turmeric",
  "color-turmeric-soft",
  "color-tandoor",
  "color-tandoor-soft",
  "color-mint",
  "color-mint-soft",
  "color-kesar",
  "color-kesar-soft",
];
const TEXT_COMPANIONS = [
  "color-turmeric-strong",
  "color-mint-strong",
  "color-kesar-strong",
  "color-veg",
];
const HEAT = ["color-heat-1", "color-heat-2", "color-heat-3", "color-heat-4"];
const STATUS = ["success", "warning", "danger", "info"].flatMap((status) => [
  `color-status-${status}`,
  `color-status-${status}-soft`,
]);
const LEVELS = [1, 2, 3, 4] as const;

/** The same markup on every ground — only the ground's surface changes. */
function SurfaceSample() {
  return (
    <>
      <h2>Find a Paprikaa</h2>
      <p>{`${OUTLET.name}, ${OUTLET.city}. Open ${brand.hours.display}.`}</p>
      <a href="#directions">Get directions</a>
    </>
  );
}

export const PinkRamp: Story = { render: () => <Swatches selection={{ names: PINK_RAMP }} /> };

export const InkRamp: Story = { render: () => <Swatches selection={{ names: INK_RAMP }} /> };

export const Accents: Story = { render: () => <Swatches selection={{ names: ACCENTS }} /> };

export const TextCompanions: Story = {
  render: () => <Swatches selection={{ names: TEXT_COMPANIONS }} />,
};

export const HeatScale: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-8">
        {LEVELS.map((level) => (
          <SpiceLevel key={level} level={level} hasLabel />
        ))}
      </div>
      <Swatches selection={{ names: HEAT }} />
    </div>
  ),
};

export const SemanticPanels: Story = {
  render: () => (
    <div className="grid gap-3 md:grid-cols-4">
      <div className="flex flex-col gap-1 rounded-md border border-border-subtle bg-surface-page p-3">
        <span className="font-mono text-mono text-text-muted">--color-surface-page</span>
        <span className="font-display text-h4 text-text-heading">Heading</span>
        <span className="text-body-sm text-text-body">--color-text-body</span>
        <span className="text-body-sm text-text-muted">--color-text-muted</span>
      </div>
      <div className="flex flex-col gap-1 rounded-md bg-surface-page-alt p-3">
        <span className="font-mono text-mono text-text-muted">--color-surface-page-alt</span>
        <span className="font-display text-h4 text-text-brand">--color-text-brand</span>
        <span className="text-body-sm text-text-body">Tinted section</span>
      </div>
      <div data-surface="brand" className="flex flex-col gap-1 rounded-md bg-surface-brand p-3">
        <span className="font-mono text-mono text-text-muted">--color-surface-brand</span>
        <span className="font-display text-h4 text-text-heading">--color-text-on-brand</span>
        <span className="text-body-sm text-text-muted">Flooded pink panel</span>
      </div>
      <div data-surface="ink" className="flex flex-col gap-1 rounded-md bg-surface-inverse p-3">
        <span className="font-mono text-mono text-text-muted">--color-surface-inverse</span>
        <span className="font-display text-h4 text-text-heading">--color-text-on-inverse</span>
        <span className="text-body-sm text-text-muted">Footer / ink panel</span>
      </div>
    </div>
  ),
};

export const SemanticTokens: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <TokenTable caption="Surfaces" selection={{ prefix: "color-surface-", tier: "semantic" }} />
      <TokenTable caption="Text" selection={{ prefix: "color-text-", tier: "semantic" }} />
      <TokenTable caption="Borders" selection={{ prefix: "color-border-", tier: "semantic" }} />
      <TokenTable
        caption="Interaction"
        selection={{
          names: [
            "color-brand-hover",
            "color-brand-active",
            "color-focus",
            "shadow-focus-ring",
            "shadow-focus-ring-inverse",
          ],
        }}
      />
    </div>
  ),
};

export const FourGrounds: Story = {
  render: () => (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <SpecimenTile
        caption="page · no attribute"
        className="min-h-38 flex-col items-start border border-border-subtle bg-surface-page p-4"
      >
        <SurfaceSample />
      </SpecimenTile>
      <SpecimenTile
        caption='data-surface="soft"'
        surface="soft"
        className="min-h-38 flex-col items-start bg-surface-brand-soft p-4"
      >
        <SurfaceSample />
      </SpecimenTile>
      <SpecimenTile
        caption='data-surface="brand"'
        surface="brand"
        className="min-h-38 flex-col items-start bg-surface-brand p-4"
      >
        <SurfaceSample />
      </SpecimenTile>
      <SpecimenTile
        caption='data-surface="ink"'
        surface="ink"
        className="min-h-38 flex-col items-start bg-surface-inverse p-4"
      >
        <SurfaceSample />
      </SpecimenTile>
    </div>
  ),
};

export const LightIsland: Story = {
  render: () => (
    <div data-surface="ink" className="flex flex-col gap-4 rounded-xl bg-surface-inverse p-6">
      <span className="font-mono text-mono text-text-muted">data-surface=&quot;ink&quot;</span>
      <div data-surface="brand" className="flex flex-col gap-4 rounded-lg bg-surface-brand p-5">
        <span className="font-mono text-mono text-text-muted">data-surface=&quot;brand&quot;</span>
        <Card>
          <h2>Light island</h2>
          <p>A white card inside pink inside ink reads dark again: Card sets its own surface.</p>
          <a href="#light-island">A link on the island</a>
        </Card>
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    const heading = canvas.getByRole("heading", { name: "Light island" });
    await expect(getComputedStyle(heading).color).toBe(rgbOf("color-ink-900"));
  },
};

export const SurfaceOverrides: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <TokenTable caption='data-surface="brand"' selection={{ surface: "brand" }} />
      <TokenTable caption='data-surface="ink"' selection={{ surface: "ink" }} />
      <TokenTable caption='data-surface="soft"' selection={{ surface: "soft" }} />
      <TokenTable
        caption='data-surface="light" — the light island'
        selection={{ surface: "light" }}
      />
    </div>
  ),
};

export const StatusAlerts: Story = {
  render: () => (
    <div className="grid gap-3 md:grid-cols-2">
      <Alert tone="success" title="Order confirmed">
        Order in. Kitchen&apos;s on it.
      </Alert>
      <Alert tone="warning" title="Kitchen is busy">
        Pickup may take a little longer tonight.
      </Alert>
      <Alert tone="danger" title="Payment failed">
        That card didn&apos;t go through. Try another?
      </Alert>
      <Alert tone="info" title="Table held 10 min">
        We&apos;ll text you the confirmation.
      </Alert>
    </div>
  ),
};

export const StatusSwatches: Story = { render: () => <Swatches selection={{ names: STATUS }} /> };

export const Contrast: Story = {
  render: () => <ContrastMatrix />,
  play: async ({ canvas }) => {
    const results = contrastResults();
    await expect(results.filter((result) => result.verdict === "fail")).toEqual([]);

    const onBrand = results.find(
      (result) =>
        result.foreground === "color-text-on-brand" && result.background === "color-surface-brand"
    );
    if (onBrand === undefined)
      throw new Error("the policy no longer declares white on the brand pink");
    await expect(onBrand.verdict).toBe("exception");
    await expect(onBrand.ratio).toBeCloseTo(4.04, 2); // spec §5.2, measured

    const exceptionRows = canvas
      .getAllByRole("row")
      .filter((row) => row.getAttribute("data-verdict") === "exception");
    await expect(exceptionRows).toHaveLength(
      results.filter((result) => result.verdict === "exception").length
    );
    const row = exceptionRows.find(
      (candidate) =>
        within(candidate).queryByText("color-text-on-brand") !== null &&
        within(candidate).queryByText("color-surface-brand") !== null
    );
    if (row === undefined)
      throw new Error("white on the brand pink is not rendered as an exception");
    await expect(within(row).getByText(VERDICT_LABEL.exception)).toBeVisible();
    await expect(within(row).getByText(`${onBrand.ratio.toFixed(2)}:1`)).toBeVisible();
    await expect(within(row).queryByText(VERDICT_LABEL.pass)).toBeNull();
  },
};
```

Run: `pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- colors.stories 2>&1 | tail -15`
Expected: PASS on first run is acceptable here only because the docs-kit already exists (Task 2) — the Review Focus test is proved by the probe in Step 3, not by a red run.

- [ ] **Step 2: The Colors pages**

Create `apps/storybook/src/foundations/colors/primary.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./colors.stories";

<Meta title="Colors/Primary" />

{/* source: guidelines/color-primary.card.html */}

# Brand pink

The primary ramp. `--color-pink-500` is the logo pink, given by the client; its hex exists in one
file only — `packages/design-tokens/tokens/primitive/color.json` — and everything else refers to
it by name.

<Canvas of={Specimens.PinkRamp} meta={Specimens} sourceState="none" />

- **One primary, used at full strength.** Large flat fields of `pink-500` — full-bleed hero panels,
  footers, CTA bars — with white type on top are the signature move.
- **`pink-100`**, the client's light pink, is the calm counterpart: page tints, soft badges, card
  fills, section backgrounds. Together with white it does most of the work.
- **As text, pink is one step darker.** `--color-text-brand` is `pink-600`: `pink-500` text on white
  falls short of AA for body sizes (Colors → Contrast has the measured ratio). Fills never change;
  only text tokens moved (spec §5.3).
```

Create `apps/storybook/src/foundations/colors/ink.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./colors.stories";

<Meta title="Colors/Ink" />

{/* source: guidelines/color-ink.card.html */}

# Warm ink neutrals

Neutrals are tinted warm toward the pink — never blue-grey, never a flat grey.

<Canvas of={Specimens.InkRamp} meta={Specimens} sourceState="none" />

`ink-900` carries headings, `ink-800` body text and `ink-600` muted and subtle text; `ink-200` and
`ink-300` are borders, `ink-100` the sunken fill, `ink-000` white. The design system set subtle
text in `ink-500`, which falls below AA on white, so subtle text moved up to `ink-600` (spec §3.2).
```

Create `apps/storybook/src/foundations/colors/accents.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./colors.stories";

<Meta title="Colors/Accents" />

{/* source: guidelines/color-accents.card.html */}

# Spice accents

Secondary only. Turmeric, tandoor, mint and kesar exist for heat scales, status and the occasional
data point. **At most one accent per screen beside the pink**, and at most two background colours
per composition: white or `pink-50`, plus one flooded pink or ink panel.

<Canvas of={Specimens.Accents} meta={Specimens} sourceState="none" />

## Text companions

An accent is a fill. Where status needs _text_, the system uses the strong companions, which pass
AA on white and on their soft fills; `veg` is the statutory mark's green.

<Canvas of={Specimens.TextCompanions} meta={Specimens} sourceState="none" />

Gradients: essentially none. The only two are the legibility scrims over photography
(Layout → Utility classes) — no pink-to-orange, no purple, no mesh.
```

Create `apps/storybook/src/foundations/colors/heat.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./colors.stories";

<Meta title="Colors/Heat" />

{/* source: guidelines/color-heat.card.html */}

# Spice heat scale

Heat is shown with diamonds on the heat ramp, never with emoji. The labels are plain English —
Mild, Medium, Hot, Extra Hot — because a guest should never have to decode a control.

<Canvas of={Specimens.HeatScale} meta={Specimens} sourceState="none" />

`SpiceLevel` draws it (`level` 1–4, `hasLabel`). The ramp is semantic: each step references an
accent, and the hottest is the brand's own `pink-600`.
```

Create `apps/storybook/src/foundations/colors/semantic.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./colors.stories";

<Meta title="Colors/Semantic" />

{/* source: guidelines/color-semantic.card.html */}

# Semantic surfaces & text

The aliases to reach for in components. A component never names a ramp step for its field or its
text — it names what the colour means, and the semantic token points at the step.

Utilities carry the family name twice: `text-text-heading`, not `text-heading`; `border-border-subtle`,
not `border-subtle`; `bg-surface-card`.

<Canvas of={Specimens.SemanticPanels} meta={Specimens} sourceState="none" />

<Canvas of={Specimens.SemanticTokens} meta={Specimens} sourceState="none" />
```

Create `apps/storybook/src/foundations/colors/surfaces.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./colors.stories";

<Meta title="Colors/Surfaces" />

{/* source: guidelines/color-surfaces.card.html */}

# Text on surfaces

`data-surface` remaps every text token — the same `h2`, `p` and link on four grounds, with no
overrides.

<Canvas of={Specimens.FourGrounds} meta={Specimens} sourceState="none" />

Identical markup in all four. Card, Section, PatternField, SiteFooter, HeroBanner, CtaBand,
StatBand, QuotePanel, PricingCard (flooded) and PostFrame set the attribute themselves; in raw
HTML add it (or `.pp-on-brand` / `.pp-on-ink` / `.pp-on-soft`) to the flooded container. Never
hard-code white on a heading — put the heading on a surface.

## Light islands

A white surface nested inside a dark one restores the light tokens. Every white-filled component —
Card `default`, the form controls, QuotePanel `light` — sets `data-surface="light"` itself.

<Canvas of={Specimens.LightIsland} meta={Specimens} sourceState="none" />

## What each surface redefines

Surfaces override semantic and component tokens only, never primitives, so the remap cascades.
`light` restores, to its exact base value, every token the other three change.

<Canvas of={Specimens.SurfaceOverrides} meta={Specimens} sourceState="none" />
```

Create `apps/storybook/src/foundations/colors/status.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./colors.stories";

<Meta title="Colors/Status" />

{/* source: guidelines/color-status.card.html */}

# Status colors

Success, warning, danger and info — each with a soft fill. Status is never colour alone: it always
carries a message and a glyph.

<Canvas of={Specimens.StatusAlerts} meta={Specimens} sourceState="none" />

<Canvas of={Specimens.StatusSwatches} meta={Specimens} sourceState="none" />

The fills are accents. Status **text** uses the strong companions — `--color-text-success` is
`mint-strong`, `--color-text-warning` is `turmeric-strong` — which pass AA on white and on the soft
fills.
```

Create `apps/storybook/src/foundations/colors/contrast.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./colors.stories";

<Meta title="Colors/Contrast" />

{/* source: spec §5 — the accessibility balance policy */}

# Contrast

WCAG 2.2 AA everywhere **except** the one pairing the brand cannot give up: white text on the brand
pink fill. That pair is held to the AA-large floor (3:1) and is declared, tested and shown here as
the sole exception (spec §5, owner decision D3). Everything else about accessibility — semantics,
names, keyboard, focus, targets, motion — is uncompromised and gated.

<Canvas of={Specimens.Contrast} meta={Specimens} sourceState="none" />

The matrix is computed on this build from `tokens.json` and
`packages/design-tokens/contrast-pairs.json` by the same evaluator the gate runs
(`design-tokens:test`), so this page cannot disagree with CI. A pair below its minimum fails the
build; a pair between 3:1 and AA is allowed only in a group tagged `brand-fill`, over the brand
pink.

## Why axe does not check contrast

axe cannot scope an exception to one pair, so its `color-contrast` rule is off in the component
tests and the story tests. The token policy replaces it and measures every pair the components
paint. A component that paints a new text-on-background pair adds that pair to
`contrast-pairs.json` in the same change.

## Changing it

Change a **text** token, never a fill. Lowering a group's minimum is a decision-log event.
```

- [ ] **Step 3: Probe the Contrast test (Review Focus 4)**

In `docs-kit/contrast-matrix.tsx`, temporarily replace `{VERDICT_LABEL[result.verdict]}` inside the verdict `Badge` with `{VERDICT_LABEL.pass}` (every row now claims a pass); run the Step 1 command; expect FAIL on `Contrast` (the exception row shows the pass label) and on the docs-kit `ContrastMatrixRatesEachPair` story. Revert; rerun green. Paste both.

- [ ] **Step 4: Gate and commit**

```bash
pnpm nx lint @pink-paprikaa-web/storybook --fix 2>&1 | tail -5
pnpm nx run-many -t typecheck lint -p @pink-paprikaa-web/storybook --skip-nx-cache --outputStyle=static 2>&1 | tail -8
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- colors.stories 2>&1 | tail -12
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -4
pnpm nx format:check
```

Expected: 13 Colors specimens pass; eight Colors pages build. Visually confirm in `storybook:serve` that each Canvas renders.

```bash
git add apps/storybook/src/foundations/colors
git commit -m "feat(storybook): the Colors foundation pages and the Contrast matrix

Primary, Ink, Accents, Heat, Semantic, Surfaces and Status from the design
system's cards, every swatch painted from its token. The Contrast page renders
the gate's own evaluator: white on the brand pink shows as the declared
exception with its measured ratio, and no pair fails.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 5: The Type group

Sources: `guidelines/{type-display,type-headings,type-body,type-overline-mono,type-devanagari,fluid-type}.card.html`, readme §3.2, §3.10.

**Files:**

- Create: `apps/storybook/src/foundations/type/{type.stories.tsx,display.mdx,headings.mdx,body.mdx,overline-and-mono.mdx,devanagari.mdx,fluid.mdx}`

**Dev reference:** `git show dev:packages/ui/src/docs/typography.mdx`

**Dev parity:**

| Dev item                                                                                          | Ruling  | Where / spec clause                                                                      |
| ------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------- |
| Poppins structural (carries Devanagari), DM Sans body/UI, Space Mono codes only; final, no swaps  | ALREADY | `display.mdx`, `overline-and-mono.mdx`                                                   |
| "Every piece of text goes through `Text`, which locks each step's size, line-height and tracking" | ADD     | Step 2 `headings.mdx`                                                                    |
| The 12-step ramp, each captioned with size / line-height / tracking / family                      | ALREADY | The six pages' specimens; `TypeSpecimen` prints each step's composite from `tokens.json` |
| Step names `display1`, `subtitle1`, `subtitle2`, `body1`, `body2`                                 | DROP    | D4 (`display-1`, `h4`, `body-lg`, `body`, `body-sm`)                                     |
| Seven fluid twins                                                                                 | ALREADY | `FluidTokens`                                                                            |
| "Set `isFluid` in every responsive layout" + the `<Text isFluid variant="h1">` example            | ADD     | Step 2 `fluid.mdx`                                                                       |
| Why the small end has no fluid twin (already comfortable; would crowd the hit-target floor)       | ADD     | Step 2 `fluid.mdx`                                                                       |
| "Resize the panel" h1-fluid demo                                                                  | ALREADY | `FluidSteps` at `floor360`, with a `play` proving the clamp minimum — stronger           |
| Display: negative tracking, line-height near 1.0; body stays generous                             | ALREADY | `display.mdx`, `body.mdx`                                                                |
| ALL CAPS only for overlines and heat labels                                                       | ALREADY | `overline-and-mono.mdx`                                                                  |
| Headlines ≤ 6 words; body avg 12 / max 24; menu descriptions ≤ 14, ingredient-led                 | ALREADY | `headings.mdx`, `body.mdx`, Brand → Voice & content                                      |
| Line length: `measure` prose for long-form, narrow for pull quotes                                | ADD     | Step 2 `body.mdx` (narrow was missing; `Text measure="prose" \| "narrow"`)               |
| Headings balance, running text avoids orphans — `Text` does it                                    | ALREADY | `headings.mdx` (`isBalanced`), `body.mdx` (`text-wrap: pretty`)                          |
| Devanagari only for the logo, display moments, dish names — never a control                       | ALREADY | `devanagari.mdx`                                                                         |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `TypeSpecimen`, `TokenTable`, `typographyOf` (docs-kit); `brand`, `OUTLET`; `formatRupees` (utils).
- Produces: `Type/Specimens` → `DisplaySteps`, `FamiliesAndWeights`, `HeadingSteps`, `BodySteps`, `OverlineAndMono`, `Devanagari`, `FluidSteps`, `FluidTokens`; six pages under `Type/`.

- [ ] **Step 1: The Type specimens**

Create `apps/storybook/src/foundations/type/type.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { brand } from "@pink-paprikaa-web/content";
import { formatRupees } from "@pink-paprikaa-web/utils";

import { typographyOf } from "../../docs-kit/catalogue";
import { TokenTable } from "../../docs-kit/token-table";
import { TypeSpecimen } from "../../docs-kit/type-specimen";
import { OUTLET } from "../../kits/fixtures";

/** Live visuals for the Type pages. Hidden from the sidebar; rendered by the MDX; run by storybook:test. */
const meta = {
  title: "Type/Specimens",
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const FLUID_TOKENS = ["display-1", "display-2", "h1", "h2", "h3", "h4", "body"].map(
  (step) => `text-${step}-fluid`
);

export const DisplaySteps: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <TypeSpecimen step="display-1" family="display">
        {brand.statement}
      </TypeSpecimen>
      <TypeSpecimen step="display-2" family="display">
        {brand.statement}
      </TypeSpecimen>
    </div>
  ),
};

export const FamiliesAndWeights: Story = {
  render: () => <TokenTable caption="Families and weights" selection={{ prefix: "font-" }} />,
};

export const HeadingSteps: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <TypeSpecimen step="h1" family="display">
        Our Menu
      </TypeSpecimen>
      <TypeSpecimen step="h2" family="display">
        Chai &amp; Coffee
      </TypeSpecimen>
      <TypeSpecimen step="h3" family="display">
        Small Plates
      </TypeSpecimen>
      <TypeSpecimen step="h4" family="display">
        Add-ons
      </TypeSpecimen>
    </div>
  ),
};

export const BodySteps: Story = {
  render: () => (
    <div className="flex max-w-text-measure-prose flex-col gap-4">
      <TypeSpecimen step="body-lg" family="body" tone="body">
        We roast our own masala every morning, then build the rest of the day around it.
      </TypeSpecimen>
      <TypeSpecimen step="body" family="body" tone="body">
        Amritsari paneer, burnt chilli mayo, potato brioche. Served with masala fries.
      </TypeSpecimen>
      <TypeSpecimen step="body-sm" family="body" tone="muted">
        Contains dairy and gluten. Ask us about swaps.
      </TypeSpecimen>
      <TypeSpecimen step="caption" family="body" tone="subtle">
        {brand.billing.taxNote}
      </TypeSpecimen>
    </div>
  ),
};

export const OverlineAndMono: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <TypeSpecimen step="overline" family="display" tone="brand" isUppercase>
        {brand.tagline}
      </TypeSpecimen>
      <TypeSpecimen step="overline" family="display" tone="muted" isUppercase>
        {`Now Serving · ${OUTLET.name}, ${OUTLET.city}`}
      </TypeSpecimen>
      <TypeSpecimen step="mono" family="mono">
        {`ORDER #${brand.billing.invoicePrefix}-4821 · 26 JUL 2026 · ${formatRupees(1240)}`}
      </TypeSpecimen>
    </div>
  ),
};

export const Devanagari: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <TypeSpecimen step="h1" family="devanagari" tone="brand">
        {brand.nameDevanagari}
      </TypeSpecimen>
      <div className="flex flex-wrap items-baseline gap-7">
        <TypeSpecimen step="h2" family="devanagari">
          छोले
        </TypeSpecimen>
        <TypeSpecimen step="h2" family="devanagari">
          कुल्फी
        </TypeSpecimen>
        <TypeSpecimen step="h2" family="devanagari">
          मसाला चाय
        </TypeSpecimen>
      </div>
    </div>
  ),
};

export const FluidSteps: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <TypeSpecimen step="display-2-fluid" family="display">
        Desi at heart.
      </TypeSpecimen>
      <TypeSpecimen step="h1-fluid" family="display">
        Most ordered this week
      </TypeSpecimen>
      <TypeSpecimen step="h3-fluid" family="display">
        Small Plates
      </TypeSpecimen>
    </div>
  ),
  globals: { viewport: { value: "floor360", isRotated: false } },
  play: async ({ canvas }) => {
    // At the 360px floor a fluid step sits at its clamp() minimum and still fits the screen.
    const sample = canvas.getByText("Most ordered this week");
    const minimum = /clamp\((?<min>[\d.]+)px/.exec(typographyOf("text-h1-fluid").fontSize)?.groups
      ?.min;
    if (minimum === undefined) throw new Error("text-h1-fluid is not a clamp() with a px minimum");
    await expect(getComputedStyle(sample).fontSize).toBe(`${minimum}px`);
    await expect(sample.scrollWidth).toBeLessThanOrEqual(sample.clientWidth);
  },
};

export const FluidTokens: Story = {
  render: () => <TokenTable caption="Fluid steps" selection={{ names: FLUID_TOKENS }} />,
};
```

(Note on the Devanagari sample: the card sets the name in `pink-500`; this page sets it in `--color-text-brand` (`pink-600`) because text tokens, not fills, carry pink as type — spec §5.3.)

- [ ] **Step 2: The Type pages**

Create `apps/storybook/src/foundations/type/display.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./type.stories";

<Meta title="Type/Display" />

{/* source: guidelines/type-display.card.html */}

# Display

Poppins at the black weight, tight negative tracking and a line-height near 1.0 — for the one loud
line on a hero or a board.

<Canvas of={Specimens.DisplaySteps} meta={Specimens} sourceState="none" />

Fixed display sizes are for specimens and fixed moments; responsive layouts use the fluid twins
(Type → Fluid). **Poppins, DM Sans and Space Mono are the brand's final typefaces** — Poppins for
display and headings (it carries Devanagari), DM Sans for body and UI, Space Mono for order and
promo codes. Do not substitute.

## Families & weights

<Canvas of={Specimens.FamiliesAndWeights} meta={Specimens} sourceState="none" />
```

Create `apps/storybook/src/foundations/type/headings.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./type.stories";

<Meta title="Type/Headings" />

{/* source: guidelines/type-headings.card.html */}

# Headings

Poppins bold for every structural heading, h1 to h4 — geometric and circular, matching the
wordmark's bowls.

<Canvas of={Specimens.HeadingSteps} meta={Specimens} sourceState="none" />

Set every piece of text through the `Text` atom (`variant`): each step owns its size, line-height,
tracking and weight together — one decision, never mixed by hand.

The visual step and the document outline are separate decisions: every titled component takes
`headingLevel`, so a card title can look like an h4 and still be the page's third-level heading.
Headlines stay at six words or fewer and use `text-wrap: balance` (`Text isBalanced`).
```

Create `apps/storybook/src/foundations/type/body.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./type.stories";

<Meta title="Type/Body" />

{/* source: guidelines/type-body.card.html */}

# Body

DM Sans for running text and interface copy, regular and medium, at a generous line-height.

<Canvas of={Specimens.BodySteps} meta={Specimens} sourceState="none" />

Body sentences stay short — about 12 words on average, never more than 24. Prose uses
`text-wrap: pretty` and the prose measure (`max-w-text-measure-prose`); helper text drops to `body-sm` in the
muted tone and fine print to `caption` in the subtle tone. Cap line length with `Text measure`:
`prose` for long-form, `narrow` for pull quotes (Spacing → Layout rhythm lists both widths).
```

Create `apps/storybook/src/foundations/type/overline-and-mono.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./type.stories";

<Meta title="Type/Overline & mono" />

{/* source: guidelines/type-overline-mono.card.html */}

# Overline & mono

Poppins bold in capitals with wide tracking for eyebrows; Space Mono for order codes, promo codes
and receipt lines — nowhere else.

<Canvas of={Specimens.OverlineAndMono} meta={Specimens} sourceState="none" />

ALL CAPS is only ever an overline or a heat label, never a full sentence.
```

Create `apps/storybook/src/foundations/type/devanagari.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./type.stories";

<Meta title="Type/Devanagari" />

{/* source: guidelines/type-devanagari.card.html */}

# Devanagari

Poppins carries Devanagari, so the Devanagari name sets in the same family as everything else. It
is reserved for the logo, dish names on the menu and big display moments — never for controls,
labels or status lines.

<Canvas of={Specimens.Devanagari} meta={Specimens} sourceState="none" />
```

Create `apps/storybook/src/foundations/type/fluid.mdx`:

````mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./type.stories";

<Meta title="Type/Fluid" />

{/* source: guidelines/fluid-type.card.html */}

# Fluid type

`clamp()` sizes for layouts — headings never overflow a 360px screen. Type is fluid in layouts and
fixed only in specimens and on marketing canvases. The design system's `.pp-fluid-*` classes are
the `text-*-fluid` utilities here (`text-h1-fluid`), each carrying its line-height, tracking and
weight.

<Canvas of={Specimens.FluidSteps} meta={Specimens} sourceState="none" />

**Set `isFluid` in every responsive layout:**

```tsx
<Text variant="h1" isFluid>
  Desi at heart. Urban by nature.
</Text>
```

Only the display steps, h1–h4 and body have a twin. The small end — `body-sm`, `caption`,
`overline`, `mono` — is already comfortable at any width, and scaling it down would crowd the
hit-target floor.

<Canvas of={Specimens.FluidTokens} meta={Specimens} sourceState="none" />
````

- [ ] **Step 3: Gate and commit**

```bash
pnpm nx lint @pink-paprikaa-web/storybook --fix 2>&1 | tail -5
pnpm nx run-many -t typecheck lint -p @pink-paprikaa-web/storybook --skip-nx-cache --outputStyle=static 2>&1 | tail -8
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- type.stories 2>&1 | tail -12
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -4
pnpm nx format:check
```

Expected: 8 Type specimens pass, including `FluidSteps` at 360px (computed size = the clamp minimum). Visually confirm each Canvas in `storybook:serve`; Devanagari must render in Poppins (the Devanagari subset loads — compare with the glyph shapes on the card).

```bash
git add apps/storybook/src/foundations/type
git commit -m "feat(storybook): the Type foundation pages

Display, Headings, Body, Overline and mono, Devanagari and Fluid, each step
set from its own tokens and captioned with the values the build emits. The
fluid specimen proves a heading sits at its clamp minimum on a 360px screen.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 6: The Spacing group

Sources: `guidelines/{spacing-scale,spacing-layout}.card.html`, readme §3.3, spec §4 C8.

**Files:**

- Create: `apps/storybook/src/foundations/spacing/{spacing.stories.tsx,scale.mdx,layout-rhythm.mdx}`

**Dev reference:** `git show dev:packages/ui/src/docs/space-shape-motion.mdx` (§ Spacing, § Layout)

**Dev parity:**

| Dev item                                                                         | Ruling  | Where / spec clause                                                                                |
| -------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------- |
| 4px base; the step number is the multiple (`p-6` = 24px)                         | ALREADY | `scale.mdx` + `Scale` play (unit is 4, step 6 is 24px)                                             |
| Steps 1–12, then 14 · 16 · 18 · 20 · 24 · 32; half steps for optical nudges only | ALREADY | `scale.mdx`; `SPACE_STEPS` checked against `StackProps["space"]` at compile time                   |
| "16 / 24 / 40 do most of the work"                                               | ALREADY | `scale.mdx` ("steps 4, 6 and 10")                                                                  |
| Container max, fluid gutter, fluid section rhythm                                | ALREADY | `RhythmTokens` (values per C8)                                                                     |
| Layout table row `--layout-header-h` 72px (SiteHeader)                           | DROP    | C1: header is `spacing-header` (default) / `spacing-header-compact`, both listed in `ChromeTokens` |
| Layout table rows tab bar height and hit minimum ("every interactive target")    | ADD     | Step 1 `ChromeTokens` + `layout-rhythm.mdx`                                                        |
| Layout table row card minimum (AutoGrid track)                                   | ALREADY | Layout → AutoGrid `AutoGridTokens`                                                                 |
| `--layout-*` token names                                                         | DROP    | D4 (`spacing-*`, `container-*`)                                                                    |
| Grids are honest grids with `gap`, never masonry; columns 1 → 2 → 3 → 4 → 4      | ALREADY | Layout → AutoGrid, Layout → Breakpoints (`COLUMNS`)                                                |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `SpacingScale`, `TokenTable`, `cssValue`, `requireElement` (docs-kit); `AutoGrid`, `Card`, `Section`, `type StackProps` (ui).
- Produces: `Spacing/Specimens` → `Scale`, `Rhythm`, `RhythmTokens`, `ChromeTokens`; pages `Spacing/Scale`, `Spacing/Layout rhythm`.

- [ ] **Step 1: The Spacing specimens**

Create `apps/storybook/src/foundations/spacing/spacing.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { AutoGrid, Card, Section, type StackProps } from "@pink-paprikaa-web/ui";

import { cssValue } from "../../docs-kit/catalogue";
import { requireElement } from "../../docs-kit/dom";
import { SpacingScale } from "../../docs-kit/spacing-scale";
import { TokenTable } from "../../docs-kit/token-table";

/** Live visuals for the Spacing pages. Hidden from the sidebar; rendered by the MDX; run by storybook:test. */
const meta = {
  title: "Spacing/Specimens",
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type SpaceStep = NonNullable<StackProps["space"]>;

/** Every step of the scale in order — checked against the layouts' `space` type in both directions. */
const SPACE_STEPS = [
  0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 32,
] as const satisfies readonly SpaceStep[];

/** Compile-time: a step the system gains but this page does not show fails typecheck. */
const _isEveryStepShown: [Exclude<SpaceStep, (typeof SPACE_STEPS)[number]>] extends [never]
  ? true
  : false = true;

const RHYTHM_TOKENS = [
  "spacing-gutter",
  "spacing-gutter-mobile",
  "spacing-gutter-desktop",
  "spacing-section",
  "spacing-section-mobile",
  "spacing-section-desktop",
  "spacing-grid-gap",
];

const CHROME_TOKENS = [
  "spacing-header",
  "spacing-header-compact",
  "spacing-tabbar",
  "spacing-dock-clearance",
  "spacing-hit",
];

export const Scale: Story = {
  render: () => <SpacingScale steps={SPACE_STEPS} />,
  play: async ({ canvasElement }) => {
    // Design-system rule: step N is N × 4px, so step 6 is always 24px.
    const unit = Number.parseFloat(cssValue("spacing"));
    await expect(unit).toBe(4);
    const six = requireElement(canvasElement, '[data-step="6"]');
    await expect(six.getBoundingClientRect().width).toBe(24);
  },
};

export const Rhythm: Story = {
  render: () => (
    <Section tone="alt" space="tight">
      <AutoGrid min="xs">
        {["card 1", "card 2", "card 3", "card 4"].map((label) => (
          <Card key={label} padding="sm">
            <span className="font-mono text-mono text-text-muted">{label}</span>
          </Card>
        ))}
      </AutoGrid>
    </Section>
  ),
};

export const RhythmTokens: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <TokenTable caption="Containers" selection={{ prefix: "container-" }} />
      <TokenTable
        caption="Gutters, section rhythm and grid gap"
        selection={{ names: RHYTHM_TOKENS }}
      />
    </div>
  ),
};

export const ChromeTokens: Story = {
  render: () => (
    <TokenTable caption="Fixed chrome and the touch target" selection={{ names: CHROME_TOKENS }} />
  ),
};
```

- [ ] **Step 2: The Spacing pages**

Create `apps/storybook/src/foundations/spacing/scale.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./spacing.stories";

<Meta title="Spacing/Scale" />

{/* source: guidelines/spacing-scale.card.html */}

# Spacing scale

Step N is N × the spacing unit, so the step number _is_ the multiple: `p-6` is the design system's
`--space-6`, `gap-10` its `--space-10`.

<Canvas of={Specimens.Scale} meta={Specimens} sourceState="none" />

Steps run from 1 to 12 one at a time, then 14, 16, 18, 20, 24 and 32; half steps 0.5 and 1.5 exist
for optical nudges. Steps 4, 6 and 10 do most of the work. Layouts take `space` as a step
(`Stack space={6}`), never as a length.
```

Create `apps/storybook/src/foundations/spacing/layout-rhythm.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./spacing.stories";

<Meta title="Spacing/Layout rhythm" />

{/* source: guidelines/spacing-layout.card.html */}

# Layout rhythm

A content container, a fluid gutter, a fluid grid gap and fluid section spacing set the page's
rhythm. `Container` and `Section` apply them; the `container-page` and `section-y` utilities do the
same for raw markup.

<Canvas of={Specimens.Rhythm} meta={Specimens} sourceState="none" />

<Canvas of={Specimens.RhythmTokens} meta={Specimens} sourceState="none" />

The gutter and section values are the handoff's (spec C8) — newer than the design system's and used
on every handoff page; the difference is at most a few pixels of gutter at 360px. Sections breathe:
never less than the mobile section value, never more than the desktop one.

The fixed chrome — the sticky site header (default and the handoff's compact row), the bottom tab
bar and the clearance sticky bars keep above the mobile dock — and the minimum touch target every
interactive element meets:

<Canvas of={Specimens.ChromeTokens} meta={Specimens} sourceState="none" />
```

- [ ] **Step 3: Probe the compile-time step check, then gate and commit**

Probe: delete `32` from `SPACE_STEPS`; run `pnpm nx typecheck @pink-paprikaa-web/storybook --skip-nx-cache 2>&1 | tail -5`; expect `Type 'true' is not assignable to type 'false'` on `_isEveryStepShown`. Restore; rerun green.

```bash
pnpm nx lint @pink-paprikaa-web/storybook --fix 2>&1 | tail -5
pnpm nx run-many -t typecheck lint -p @pink-paprikaa-web/storybook --skip-nx-cache --outputStyle=static 2>&1 | tail -8
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- spacing.stories 2>&1 | tail -10
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -4
pnpm nx format:check
git add apps/storybook/src/foundations/spacing
git commit -m "feat(storybook): the Spacing foundation pages

The scale is drawn from the spacing unit and asserted (step 6 is 24px); the
step list is checked against the layouts' space type in both directions, so a
new step cannot be left off the page.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 7: The Layout group

Sources: `guidelines/{breakpoints,autogrid,radii,borders,elevation,card-anatomy}.card.html`, readme §3.5, §3.6, §3.10, §3.11, spec §6.5 (utility-class map).

**Files:**

- Create: `apps/storybook/src/foundations/layout/{layout.stories.tsx,breakpoints.mdx,autogrid.mdx,radii.mdx,borders.mdx,elevation.mdx,card-anatomy.mdx,utility-classes.mdx}`

**Dev reference:** `git show dev:packages/ui/src/docs/space-shape-motion.mdx` (§ Breakpoints, § Radius, § Elevation, "Cards"); `git show dev:packages/ui/src/docs/voice-and-accessibility.mdx` (focus)

**Dev parity:**

| Dev item                                                                                     | Ruling  | Where / spec clause                                                             |
| -------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------- |
| Breakpoints `sm` 480 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1440                         | ALREADY | `Breakpoints` (read from `breakpoint-*`)                                        |
| Every design survives 360px — the floor, checked in the `360 — smallest supported` viewport  | ALREADY | `breakpoints.mdx`; `floor360` viewport (Plan 1); kits test at 360               |
| Radius per job (chips, small controls, inputs/thumbnails, cards, sheets/modals, pill)        | ALREADY | `radii.mdx` + radius token descriptions                                         |
| "Geometric, so nothing is blobby"                                                            | ALREADY | `radii.mdx`                                                                     |
| Shadows warm-ink tinted, sparing; `shadow-brand` only for the primary CTA and floating cart  | ALREADY | `elevation.mdx` + shadow token descriptions                                     |
| Card: white, card radius, 1px subtle border, shadow-1; hover lifts 2px to shadow-3           | ALREADY | `CardAnatomy` + `card-anatomy.mdx` (`isInteractive`)                            |
| Feature card: soft fill, no border, no shadow, bigger radius; menu rows are rules, not cards | ALREADY | `card-anatomy.mdx`                                                              |
| No card ever has a coloured left border                                                      | ALREADY | `borders.mdx`, `card-anatomy.mdx`                                               |
| Focus ring painted by the base layer, 2px pink, 2px offset                                   | ALREADY | `borders.mdx` (fields: the 3px outer `shadow-focus-ring`, spec §5.5 as amended) |
| `rounded-1`…`rounded-6`, `shadow-elevation1`…`4`                                             | DROP    | D4 (`radius-xs`…`pill`, `shadow-1`…`4`)                                         |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `RadiusScale`, `ShadowLadder`, `TokenTable`, `SpecimenRow`, `tokensWithPrefix`, `formatValue`, `token` (docs-kit); `AutoGrid`, `Badge`, `Card`, `ImageSlot` (ui).
- Produces: `Layout/Specimens` → `Breakpoints`, `AutoGridCards`, `AutoGridTokens`, `Radii`, `Borders`, `BorderTokens`, `DepthLadder`, `CardAnatomy`, `UtilityClasses`; seven pages under `Layout/`.

- [ ] **Step 1: The Layout specimens**

Create `apps/storybook/src/foundations/layout/layout.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AutoGrid, Badge, Card, ImageSlot } from "@pink-paprikaa-web/ui";

import { formatValue, token, tokensWithPrefix } from "../../docs-kit/catalogue";
import { RadiusScale } from "../../docs-kit/radius-scale";
import { ShadowLadder } from "../../docs-kit/shadow-ladder";
import { SpecimenRow } from "../../docs-kit/specimen";
import { TokenTable } from "../../docs-kit/token-table";

/** Live visuals for the Layout pages. Hidden from the sidebar; rendered by the MDX; run by storybook:test. */
const meta = {
  title: "Layout/Specimens",
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Column counts per breakpoint — a design-system rule (readme §3.10), not a token. */
const COLUMNS: Readonly<Record<string, string>> = {
  "breakpoint-sm": "1 col",
  "breakpoint-md": "2 col",
  "breakpoint-lg": "3 col",
  "breakpoint-xl": "4 col",
  "breakpoint-2xl": "4 col · capped by the content container",
};
const BAR_FILL = ["bg-pink-300", "bg-pink-400", "bg-pink-500", "bg-pink-600", "bg-pink-700"];

function Cell({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-pink-200 bg-pink-50 p-3.5">
      <div className="h-8.5 rounded-md bg-pink-100" />
      <span className="mt-2.5 block font-mono text-mono text-text-muted">{label}</span>
    </div>
  );
}

export const Breakpoints: Story = {
  render: () => (
    <ol aria-label="Breakpoints" className="flex items-end gap-2.5">
      {tokensWithPrefix("breakpoint-").map((entry, index) => (
        <li
          key={entry.name}
          className="flex min-w-0 flex-col gap-1"
          style={{ flexGrow: index + 2 }}
        >
          <span
            aria-hidden
            className={`rounded-t-sm ${BAR_FILL[index] ?? "bg-pink-700"}`}
            style={{ height: `calc(var(${token("spacing").cssVar}) * ${String(11 + index * 4)})` }}
          />
          <span className="font-mono text-mono text-text-heading">{entry.cssVar}</span>
          <span className="font-mono text-mono text-text-muted">{formatValue(entry.value)}</span>
          <span className="font-mono text-mono text-text-brand">{COLUMNS[entry.name] ?? ""}</span>
        </li>
      ))}
    </ol>
  ),
};

export const AutoGridCards: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <SpecimenRow label='AutoGrid — min="md" (the default)'>
        <AutoGrid className="w-full">
          {["card 1", "card 2", "card 3", "card 4"].map((label) => (
            <Cell key={label} label={label} />
          ))}
        </AutoGrid>
      </SpecimenRow>
      <SpecimenRow label='AutoGrid — min="xs"'>
        <AutoGrid min="xs" className="w-full">
          {["card 1", "card 2", "card 3", "card 4", "card 5", "card 6"].map((label) => (
            <Cell key={label} label={label} />
          ))}
        </AutoGrid>
      </SpecimenRow>
    </div>
  ),
};

export const AutoGridTokens: Story = {
  render: () => (
    <TokenTable
      caption="Grid tokens"
      selection={{ names: ["spacing-card-min", "spacing-card-min-wide", "spacing-grid-gap"] }}
    />
  ),
};

export const Radii: Story = { render: () => <RadiusScale /> };

export const Borders: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3.5">
      <span
        className="flex h-12 w-38 items-center justify-center rounded-md border-solid border-border-subtle font-mono text-mono text-text-muted"
        style={{ borderWidth: `var(${token("border-width-default").cssVar})` }}
      >
        border-subtle
      </span>
      <span
        className="flex h-12 w-38 items-center justify-center rounded-md border-solid border-border-default font-mono text-mono text-text-muted"
        style={{ borderWidth: `var(${token("border-width-default").cssVar})` }}
      >
        border-default
      </span>
      <span
        className="flex h-12 w-38 items-center justify-center rounded-md border-solid border-border-brand font-mono text-mono text-text-muted shadow-focus-ring"
        style={{ borderWidth: `var(${token("border-width-strong").cssVar})` }}
      >
        focus · strong + ring
      </span>
      <span
        className="flex h-12 w-38 items-center justify-center rounded-md border-solid border-border-strong font-mono text-mono text-text-muted"
        style={{ borderWidth: `var(${token("border-width-strong").cssVar})` }}
      >
        border-strong
      </span>
    </div>
  ),
};

export const BorderTokens: Story = {
  render: () => (
    <TokenTable
      caption="Border widths, colours and focus"
      selection={{
        names: [
          "border-width-default",
          "border-width-strong",
          "color-border-subtle",
          "color-border-default",
          "color-border-strong",
          "color-border-brand",
          "color-focus",
          "shadow-focus-ring",
        ],
      }}
    />
  ),
};

export const DepthLadder: Story = {
  render: () => (
    <ShadowLadder names={["shadow-1", "shadow-2", "shadow-3", "shadow-4", "shadow-brand"]} />
  ),
};

export const CardAnatomy: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="flex flex-col gap-2">
        <span className="font-display text-h4 text-text-heading">default</span>
        <span className="font-mono text-mono text-text-muted">
          surface-card · radius-lg · border-subtle · shadow-1
        </span>
      </Card>
      <Card variant="feature" className="flex flex-col gap-2">
        <span className="font-display text-h4 text-text-heading">feature</span>
        <span className="font-mono text-mono text-text-muted">
          brand-soft · radius-xl · no border · no shadow
        </span>
      </Card>
      <Card variant="quiet" className="flex flex-col gap-2">
        <span className="font-display text-h4 text-text-heading">quiet</span>
        <span className="font-mono text-mono text-text-muted">
          sunken · radius-lg · no border · no shadow
        </span>
      </Card>
      <Card isInteractive className="flex flex-col gap-2">
        <span className="font-display text-h4 text-text-heading">isInteractive</span>
        <span className="font-mono text-mono text-text-muted">hover: lift-y → shadow-3</span>
      </Card>
      <Card variant="brand" className="flex flex-col gap-2">
        <span className="font-display text-h4 text-text-heading">brand</span>
        <span className="font-mono text-mono text-text-muted">
          surface-brand · sets data-surface
        </span>
      </Card>
      <Card variant="ink" className="flex flex-col gap-2">
        <span className="font-display text-h4 text-text-heading">ink</span>
        <span className="font-mono text-mono text-text-muted">
          surface-inverse · sets data-surface
        </span>
      </Card>
    </div>
  ),
};

export const UtilityClasses: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <SpecimenRow label="container-page">
        <div className="container-page rounded-md border border-dashed border-border-brand py-3">
          <span className="font-mono text-mono text-text-muted">content width, fluid gutter</span>
        </div>
      </SpecimenRow>
      <SpecimenRow label="section-y">
        <div className="w-full rounded-md bg-surface-page-alt px-4 section-y">
          <span className="font-mono text-mono text-text-muted">fluid section rhythm</span>
        </div>
      </SpecimenRow>
      <SpecimenRow label="autogrid · autogrid-wide">
        <div className="autogrid w-full">
          <Cell label="autogrid" />
          <Cell label="autogrid" />
          <Cell label="autogrid" />
        </div>
        <div className="autogrid-wide w-full">
          <Cell label="autogrid-wide" />
          <Cell label="autogrid-wide" />
        </div>
      </SpecimenRow>
      <SpecimenRow label="cluster">
        <div className="cluster">
          <Badge>Bestseller</Badge>
          <Badge tone="success">Pure veg</Badge>
          <Badge tone="warning">Extra Hot</Badge>
        </div>
      </SpecimenRow>
      <SpecimenRow label="line-clamp-2 · text-h1-fluid">
        <span className="line-clamp-2 max-w-60 text-body-sm text-text-body">
          Amritsari paneer, burnt chilli mayo, potato brioche, masala fries on the side, and a
          pickle that argues back.
        </span>
        <span className="font-display text-h1-fluid text-text-heading">Most ordered this week</span>
      </SpecimenRow>
      <SpecimenRow label="scrim-bottom — the only gradient, over photography">
        <div className="relative w-60 overflow-hidden rounded-lg">
          <ImageSlot ratio="4:3" radius="none" label="Dish photo 4:3" />
          <div className="absolute inset-0 scrim-bottom" />
        </div>
      </SpecimenRow>
    </div>
  ),
};
```

- [ ] **Step 2: The Layout pages**

Create `apps/storybook/src/foundations/layout/breakpoints.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./layout.stories";

<Meta title="Layout/Breakpoints" />

{/* source: guidelines/breakpoints.card.html */}

# Breakpoints

Five breakpoints and the column count at each. Every design must survive **360px** on the low end.

<Canvas of={Specimens.Breakpoints} meta={Specimens} sourceState="none" />

- **Never a bare `1fr` track.** Always `minmax(0, 1fr)`, or `AutoGrid` — `1fr` carries a
  min-content floor, and a long uppercase label silently widens the track and overflows the row.
- **Nothing clips text.** Buttons, tags and pills never wrap and never shrink; anything that could
  run long uses `text-wrap: pretty` (prose), `text-wrap: balance` (headlines) or `line-clamp-*`. A
  nav shortens its link list at narrower widths rather than clipping a word.
- **Flex rows that hold text carry `min-w-0`**, and any row that can run out of space wraps with a
  `gap` — never per-child margins.
- **Fixed-height controls never wrap** — buttons, fields, tags — and every touch target is at least
  the hit token (`--spacing-hit`).
- **Images always sit in an aspect-ratio box**, so a missing photo cannot collapse a layout.
```

Create `apps/storybook/src/foundations/layout/autogrid.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./layout.stories";

<Meta title="Layout/AutoGrid" />

{/* source: guidelines/autogrid.card.html */}

# Auto grid

`repeat(auto-fit, minmax(min(<minimum>, 100%), 1fr))` — the grid collapses a column instead of
clipping a card.

<Canvas of={Specimens.AutoGridCards} meta={Specimens} sourceState="none" />

`AutoGrid min` picks the track minimum from its component tokens (`xs` to `2xl`); `columns` fixes
a count instead. Every track is `minmax(0, 1fr)`, so a long label wraps instead of widening its
track. Menus and card grids are honest grids with `gap` — never masonry.

<Canvas of={Specimens.AutoGridTokens} meta={Specimens} sourceState="none" />
```

Create `apps/storybook/src/foundations/layout/radii.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./layout.stories";

<Meta title="Layout/Radii" />

{/* source: guidelines/radii.card.html */}

# Corner radii

Geometric, never blobby — the brand's forms are circles and straight lines.

<Canvas of={Specimens.Radii} meta={Specimens} sourceState="none" />

Chips and buttons are `pill`; cards `lg`; sheets and modals `xl` (top corners only on a bottom
sheet); inputs and thumbnails `md`; avatars are circles. Images carry the radius of the card they
sit in, except when full-bleed.
```

Create `apps/storybook/src/foundations/layout/borders.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./layout.stories";

<Meta title="Layout/Borders" />

{/* source: guidelines/borders.card.html */}

# Borders & focus

The default border width for rules and controls, the strong width on focus and selection, and the
pink focus ring.

<Canvas of={Specimens.Borders} meta={Specimens} sourceState="none" />

Inputs rest on `border-default`, and on focus take the strong width in `border-brand` plus the
3px focus ring (`shadow-focus-ring`, an outer spread). Everything else keyboard-focusable gets a 2px outline in
`--color-focus` with a 2px offset — white on pink and ink. No card ever gets a coloured left border.

<Canvas of={Specimens.BorderTokens} meta={Specimens} sourceState="none" />
```

Create `apps/storybook/src/foundations/layout/elevation.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./layout.stories";

<Meta title="Layout/Elevation" />

{/* source: guidelines/elevation.card.html */}

# Elevation — the depth ladder

Warm-ink tinted, used sparingly, picked by _meaning_ rather than taste. `shadow-brand`, the pink
glow, is reserved for the primary CTA and the floating add button.

<Canvas of={Specimens.DepthLadder} meta={Specimens} sourceState="none" />

The ladder's first step is **none**: flat panels, feature and quiet cards, and menu rows carry no
shadow at all. Transparency and blur appear in exactly three places — the scrolled site header,
the modal and sheet scrim, and the legibility scrim over photography — never on cards and never as
decoration.
```

Create `apps/storybook/src/foundations/layout/card-anatomy.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./layout.stories";

<Meta title="Layout/Card anatomy" />

{/* source: guidelines/card-anatomy.card.html */}

# Card anatomy

`default`, `feature` and `quiet` — fill, radius, border and shadow per variant — plus the two
flooded variants that set their own surface.

<Canvas of={Specimens.CardAnatomy} meta={Specimens} sourceState="none" />

- **Default:** the card fill, `radius-lg`, a `border-subtle` rule and `shadow-1`; with
  `isInteractive` it lifts on hover to `shadow-3`.
- **Feature:** the soft pink fill, `radius-xl`, no border, no shadow.
- **Menu row:** no card at all — a `border-subtle` rule between rows.
- **No card ever gets a coloured left border.** Media cards use `padding="none"` and put the radius
  on the image corners only.
```

Create `apps/storybook/src/foundations/layout/utility-classes.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./layout.stories";

<Meta title="Layout/Utility classes" />

{/* source: spec §6.5 — the design system's utility classes */}

# Utility classes

The design system's `.pp-*` classes are Tailwind utilities here (or built-ins). Each is used live
below, so a renamed utility fails lint on this page's specimen.

| Design system                                         | This system                                                               |
| ----------------------------------------------------- | ------------------------------------------------------------------------- |
| `.pp-container`                                       | `container-page`, or the `Container` layout                               |
| `.pp-section`                                         | `section-y`, or the `Section` layout                                      |
| `.pp-autogrid` · `.pp-autogrid-wide`                  | `autogrid` · `autogrid-wide`, or `AutoGrid`                               |
| `.pp-cluster`                                         | `cluster`, or `Cluster`                                                   |
| `.pp-clamp-2` · `.pp-clamp-3`                         | `line-clamp-2` · `line-clamp-3` (Tailwind built-ins)                      |
| `.pp-fluid-display-1` … `.pp-fluid-h3`                | `text-display-1-fluid` … `text-h3-fluid`                                  |
| `.pp-display-2` · `.pp-overline` · `.pp-mono`         | `text-display-2` · `text-overline` · `text-mono` (+ a font)               |
| `--scrim-bottom` · `--scrim-top`                      | `scrim-bottom` · `scrim-top`                                              |
| `.pp-on-brand` · `.pp-on-ink` · `.pp-on-soft`         | `data-surface="brand"` … (the classes still work)                         |
| `--dur-*` · `--ease-*` · `--press-scale` · `--lift-y` | `duration-fast` … · `ease-out` … · `press-scale` · `lift`                 |
| stacking                                              | `z-raised` · `z-sticky` · `z-header` · `z-dock` · `z-overlay` · `z-toast` |

<Canvas of={Specimens.UtilityClasses} meta={Specimens} sourceState="none" />
```

- [ ] **Step 3: Gate and commit**

```bash
pnpm nx lint @pink-paprikaa-web/storybook --fix 2>&1 | tail -5
pnpm nx run-many -t typecheck lint -p @pink-paprikaa-web/storybook --skip-nx-cache --outputStyle=static 2>&1 | tail -8
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- layout.stories 2>&1 | tail -12
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -4
pnpm nx format:check
git add apps/storybook/src/foundations/layout
git commit -m "feat(storybook): the Layout foundation pages and the utility-class map

Breakpoints, AutoGrid, Radii, Borders, Elevation and Card anatomy from the
design system's cards, and the map from its .pp-* classes to this system's
utilities — each utility used live so a rename fails lint.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 8: The Motion group

Sources: `guidelines/{motion,states,form-states}.card.html`, readme §3.7, §3.8, spec §3.2.4 (section reveal), D15.

**Files:**

- Create: `apps/storybook/src/foundations/motion/{motion.stories.tsx,motion.mdx,states.mdx,form-states.mdx,section-reveal.mdx}`

**Dev reference:** `git show dev:packages/ui/src/docs/space-shape-motion.mdx` (§ Motion, § Reduced motion)

**Dev parity:**

| Dev item                                                                                 | Ruling  | Where / spec clause                                                                                     |
| ---------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------- |
| Short and matter-of-fact; fades always pair with a small translate                       | ALREADY | `motion.mdx`                                                                                            |
| Duration table with "used for" (press, hover, state changes, sheets/pages)               | ALREADY | `MotionTokens` (token descriptions) + `motion.mdx` / `states.mdx` prose                                 |
| Easing table with "used for"; `ease-pop` has one overshoot, add-to-cart and rewards only | ALREADY | `MotionTokens`, `motion.mdx`                                                                            |
| "Durations, side by side": one curve, four durations, the same distance                  | ADD     | Step 1 `Durations` + `motion.mdx`                                                                       |
| "Easings, side by side"                                                                  | ALREADY | `Easings` (each curve on the duration it ships with)                                                    |
| "Animations, running": every keyframe live, captioned by utility and use                 | ADD     | Step 1 `Animations` (play asserts each block runs its keyframe) + `motion.mdx`                          |
| August keyframes `pp-spin`, `pp-pulse`, `pp-shimmer`, `pp-rise`, `pp-fade`               | DROP    | D1 / spec §6.5: the design system's seven (`pp-rotate`, `pp-mark-pulse`, `pp-skeleton`, …) replace them |
| Entrance animations play once on mount — reload to see them again                        | ADD     | Step 2 `motion.mdx`                                                                                     |
| Reduced motion is global in the base layer; keep the fade, drop the movement             | ALREADY | `motion.mdx`, `section-reveal.mdx`                                                                      |
| How to check it: turn on the OS "Reduce motion" setting and reload                       | ADD     | Step 2 `motion.mdx`                                                                                     |
| Tracks animate on hover                                                                  | ALREADY | `MotionDemo` is a button toggle — keyboard-operable, `aria-pressed`                                     |
| Class names `duration-(--duration-*)`, `translate-x-[calc(…)]`, `rounded-6`              | DROP    | Spec §11.2 `no-arbitrary-value` / R23; D4                                                               |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `MotionDemo`, `TokenTable`, `requireElement` (docs-kit); `Button`, `Field`, `Input`, `RevealObserver` (ui); `OUTLET`.
- Produces: `Motion/Specimens` → `Durations`, `Easings`, `Animations`, `MotionTokens`, `States`, `StateTokens`, `FormStates`, `SectionReveal`; four pages under `Motion/`.

- [ ] **Step 1: The Motion specimens**

Create `apps/storybook/src/foundations/motion/motion.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Phone, Search } from "lucide-react";
import { expect, waitFor } from "storybook/test";

import { Button, Field, Input, RevealObserver } from "@pink-paprikaa-web/ui";

import { requireElement } from "../../docs-kit/dom";
import { MotionDemo } from "../../docs-kit/motion-demo";
import { TokenTable } from "../../docs-kit/token-table";
import { OUTLET } from "../../kits/fixtures";

/** Live visuals for the Motion pages. Hidden from the sidebar; rendered by the MDX; run by storybook:test. */
const meta = {
  title: "Motion/Specimens",
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const REVEAL_SECTIONS = [1, 2, 3, 4, 5, 6];

/** The design system's seven keyframes (packages/ui styles.css), by the utility that runs each. */
const ANIMATIONS = [
  ["animate-rotate", "Button isLoading"],
  ["animate-mark-pulse", "Spinner, loading fields"],
  ["animate-spin-pulse", "the diamond pulse"],
  ["animate-dot-pulse", "StatusDot isPulsing"],
  ["animate-skeleton", "Skeleton blocks"],
  ["animate-sheet-in", "sheets, dialogs, snackbars — once"],
  ["animate-toast-pop", "Toast isPop — once"],
] as const;

export const Durations: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <MotionDemo ease="out" duration="instant" use="press" />
      <MotionDemo ease="out" duration="fast" use="hovers" />
      <MotionDemo ease="out" duration="base" use="state changes" />
      <MotionDemo ease="out" duration="slow" use="sheets, page transitions, section reveal" />
    </div>
  ),
};

export const Easings: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <MotionDemo ease="out" duration="fast" use="hovers and anything entering" />
      <MotionDemo ease="in-out" duration="base" use="moves and state changes" />
      <MotionDemo ease="entrance" duration="slow" use="sheets" />
      <MotionDemo ease="pop" duration="base" use="add-to-cart and rewards only" />
    </div>
  ),
};

export const Animations: Story = {
  render: () => (
    <ul aria-label="Animations" className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {ANIMATIONS.map(([utility, use]) => (
        <li key={utility} className="flex flex-col items-center gap-2 text-center">
          <span
            aria-hidden
            data-animation={utility}
            className={`size-10 rounded-md bg-pink-500 ${utility}`}
          />
          <span className="font-mono text-mono text-text-heading">{utility}</span>
          <span className="text-caption text-text-subtle">{use}</span>
        </li>
      ))}
    </ul>
  ),
  play: async ({ canvasElement }) => {
    // A renamed utility or keyframe would leave its block still; fail instead.
    for (const [utility] of ANIMATIONS) {
      const block = requireElement(canvasElement, `[data-animation="${utility}"]`);
      await expect(getComputedStyle(block).animationName).toBe(utility.replace("animate-", "pp-"));
    }
  },
};

export const MotionTokens: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <TokenTable caption="Durations" selection={{ prefix: "duration-" }} />
      <TokenTable caption="Easings" selection={{ prefix: "ease-" }} />
      <TokenTable caption="Press, lift and reveal" selection={{ prefix: "motion-" }} />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button>Order Now</Button>
      <Button variant="secondary">See Full Menu</Button>
      <Button disabled>Order Now</Button>
    </div>
  ),
};

export const StateTokens: Story = {
  render: () => (
    <TokenTable
      caption="Hover, press and disabled"
      selection={{
        names: [
          "color-brand-hover",
          "color-brand-active",
          "motion-press-scale",
          "duration-instant",
          "duration-fast",
          "color-ink-200",
          "color-ink-400",
        ],
      }}
    />
  ),
};

export const FormStates: Story = {
  render: () => (
    <div className="grid gap-5 md:grid-cols-2">
      <Field label="Mobile number" hint="We text your pickup code here.">
        {(control) => <Input {...control} type="tel" icon={Phone} placeholder="98765 43210" />}
      </Field>
      <Field label="Mobile number" status="error" message="Enter a 10-digit mobile number.">
        {(control) => (
          <Input {...control} type="tel" icon={Phone} status="error" defaultValue="98765" />
        )}
      </Field>
      <Field label="Coupon" status="success" message="PAPRIKAA50 applied to your order.">
        {(control) => <Input {...control} status="success" defaultValue="PAPRIKAA50" />}
      </Field>
      <Field
        label="Pickup time"
        status="warning"
        message="The kitchen is busy — pickup may take longer."
      >
        {(control) => <Input {...control} status="warning" defaultValue="8:30pm" />}
      </Field>
      <Field label="Outlet">
        {(control) => (
          <Input {...control} defaultValue={`${OUTLET.name}, ${OUTLET.city}`} disabled />
        )}
      </Field>
      <Field label="Order code">
        {(control) => <Input {...control} defaultValue="PPK-4821" readOnly />}
      </Field>
      <Field label="Search the menu">
        {(control) => (
          <Input {...control} type="search" icon={Search} defaultValue="paneer" isLoading />
        )}
      </Field>
    </div>
  ),
};

function RevealDemo() {
  return (
    <div data-reveal-demo className="flex flex-col gap-4">
      <RevealObserver selector="[data-reveal-demo] > section" />
      {REVEAL_SECTIONS.map((index) => (
        <section
          key={index}
          aria-label={`Section ${String(index)}`}
          className="flex h-60 items-center justify-center rounded-lg bg-surface-page-alt"
        >
          <span className="font-display text-h3 text-text-heading">Section {index}</span>
        </section>
      ))}
    </div>
  );
}

export const SectionReveal: Story = {
  render: () => <RevealDemo />,
  play: async ({ canvasElement }) => {
    const first = requireElement(canvasElement, "[data-reveal-demo] > section:first-of-type");
    const last = requireElement(canvasElement, "[data-reveal-demo] > section:last-of-type");
    // Below the fold: hidden until it scrolls in. Above the fold: never touched (no LCP cost).
    await waitFor(() => expect(last).toHaveAttribute("data-pp-reveal"));
    await expect(first).not.toHaveAttribute("data-pp-reveal");
    last.scrollIntoView();
    await waitFor(() => expect(last).toHaveAttribute("data-pp-revealed"));
  },
};
```

- [ ] **Step 2: The Motion pages**

Create `apps/storybook/src/foundations/motion/motion.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./motion.stories";

<Meta title="Motion/Motion" />

{/* source: guidelines/motion.card.html */}

# Duration & easing

Short and matter-of-fact. Hovers run on `duration-fast`, state changes on `duration-base`, sheets
and page transitions on `duration-slow`.

One curve, four durations — each dot travels the same track, so the difference is something you
feel rather than read:

<Canvas of={Specimens.Durations} meta={Specimens} sourceState="none" />

Each curve on the duration it ships with:

<Canvas of={Specimens.Easings} meta={Specimens} sourceState="none" />

- `ease-out` for anything entering, `ease-in-out` for moves, `ease-entrance` for sheets.
- **`ease-pop` — one overshoot — is reserved for add-to-cart and reward confirmations** (`Toast
isPop`). Nowhere else; no bouncing UI.
- Fades always pair with a small translate (8–12px) — never opacity alone.
- `prefers-reduced-motion` is honoured globally: durations collapse, and reveals keep the fade but
  drop the translate.
- **CSS does every animation.** The system ships no motion library (spec D15); adding one needs a
  decision-log entry naming the component and the CSS limit it hit.

<Canvas of={Specimens.MotionTokens} meta={Specimens} sourceState="none" />

## Animations

The system's seven keyframes, running — the loader really is the brand mark pulsing, not a
borrowed ring. `animate-sheet-in` and `animate-toast-pop` are entrances: they play once on mount,
so reload the page to see them again.

<Canvas of={Specimens.Animations} meta={Specimens} sourceState="none" />

To check reduced motion, turn on the operating system's **Reduce motion** setting (macOS: System
Settings → Accessibility → Display) and reload: every specimen on this page goes still, and nothing
breaks.
```

Create `apps/storybook/src/foundations/motion/states.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./motion.stories";

<Meta title="Motion/States" />

{/* source: guidelines/states.card.html */}

# Interaction states

Rest → hover (darken) → press (scale down **and** darken) → disabled (a real grey). Hover and press
the live buttons.

<Canvas of={Specimens.States} meta={Specimens} sourceState="none" />

- **Hover:** darken pink one step (`--color-brand-hover`); on white surfaces tint toward `pink-50`;
  on imagery, lift the scrim slightly. **Never fade a button on hover.**
- **Press:** `press-scale` and `--color-brand-active`, both together, on the instant duration.
- **Focus:** a 2px pink outline with a 2px offset (fields use the 3px focus ring).
- **Disabled:** an `ink-200` fill, `ink-400` text, no shadow, `cursor: not-allowed` — a real fill,
  not reduced opacity.
- **Loading:** the pink diamond symbol pulsing, or a soft pink skeleton block — never a spinner with
  a gradient.

<Canvas of={Specimens.StateTokens} meta={Specimens} sourceState="none" />
```

Create `apps/storybook/src/foundations/motion/form-states.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./motion.stories";

<Meta title="Motion/Form states" />

{/* source: guidelines/form-states.card.html */}

# Form states

One status system across every control: default, error, success, warning, disabled, read-only and
loading.

| State      | Border                                        | Message              | Applies to                                                               |
| ---------- | --------------------------------------------- | -------------------- | ------------------------------------------------------------------------ |
| `default`  | default width, `border-default`               | hint, subtle         | all                                                                      |
| `focus`    | strong width, `border-brand` + the focus ring | —                    | all                                                                      |
| `error`    | strong width, danger                          | says what to do next | Input, Select, SearchField, OtpInput, Checkbox, Radio, SlotPicker, Field |
| `success`  | strong width, mint                            | confirms the result  | Input, Select, SearchField, OtpInput, Field                              |
| `warning`  | strong width, turmeric                        | flags a caveat       | Input, Select, SearchField, Field                                        |
| `disabled` | `ink-100` fill, `ink-400` text                | —                    | all — a real fill, never opacity                                         |
| `readOnly` | sunken fill + lock glyph                      | —                    | Input, Select                                                            |
| `loading`  | unchanged                                     | trailing Spinner     | Input, SearchField                                                       |

A status raises the border, tints the leading icon, shows the matching glyph and **replaces the
hint with its message** — never a status colour without a message. The control carries `status`;
`Field` renders the message and wires `aria-describedby` and `aria-invalid`.

<Canvas of={Specimens.FormStates} meta={Specimens} sourceState="none" />
```

Create `apps/storybook/src/foundations/motion/section-reveal.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./motion.stories";

<Meta title="Motion/Section reveal" />

{/* source: spec §3.2.4 — handoff section reveal */}

# Section reveal

Sections below the fold fade and rise into view once, as they scroll in — the handoff's page
motion, shipped as CSS (`[data-pp-reveal]`) plus the tiny client `RevealObserver`. Scroll the demo.

<Canvas of={Specimens.SectionReveal} meta={Specimens} sourceState="none" />

- Mount `RevealObserver` once near the root; by default it watches every `<section>`.
- **It never hides a section already on screen**, so there is no flash and no LCP or CLS cost.
- Without `IntersectionObserver` nothing is hidden; reduced motion keeps the fade and drops the
  rise; print always shows everything.
```

- [ ] **Step 3: Gate and commit**

```bash
pnpm nx lint @pink-paprikaa-web/storybook --fix 2>&1 | tail -5
pnpm nx run-many -t typecheck lint -p @pink-paprikaa-web/storybook --skip-nx-cache --outputStyle=static 2>&1 | tail -8
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- motion.stories 2>&1 | tail -12
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -4
pnpm nx format:check
git add apps/storybook/src/foundations/motion
git commit -m "feat(storybook): the Motion foundation pages and the section reveal demo

Duration and easing demos run on the tokens, the interaction states use the
live Button, form states show every status on real Fields, and the reveal
demo proves a section below the fold waits for the scroll while one above it
is never touched.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 9: The Marketing foundations, and the 33-card mapping check

Sources: `guidelines/{canvas-formats,canvas-type}.card.html`, readme §4b.

**Files:**

- Create: `apps/storybook/src/foundations/marketing/{marketing.stories.tsx,canvas-formats.mdx,canvas-type.mdx}`

**Dev reference:** none (dev has no Marketing foundations — `git ls-tree -r --name-only dev packages/ui/src/docs` lists five pages, none on canvases)

**Interfaces:**

- Consumes: `TokenTable`, `cssValue`, `formatValue`, `token` (docs-kit); `POST_FORMATS`, `PostFrame`, `SocialHeadline` (ui).
- Produces: `Marketing/Specimens` → `CanvasFormats`, `CanvasTokens`, `CanvasType`, `CanvasTypeTokens`; pages `Marketing/Canvas formats`, `Marketing/Canvas type`.

- [ ] **Step 1: The Marketing specimens**

Create `apps/storybook/src/foundations/marketing/marketing.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { POST_FORMATS, PostFrame, SocialHeadline } from "@pink-paprikaa-web/ui";

import { cssValue, formatValue, token } from "../../docs-kit/catalogue";
import { TokenTable } from "../../docs-kit/token-table";

/** Live visuals for the Marketing pages. Hidden from the sidebar; rendered by the MDX; run by storybook:test. */
const meta = {
  title: "Marketing/Specimens",
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Preview scale for the format outlines — the card draws a 1080px side at about 79px. */
const PREVIEW_SCALE = 0.073;

const CANVAS_STEPS = [
  ["overline", "Overline"],
  ["hero", "Hero"],
  ["h1", "Canvas h1"],
  ["h2", "Canvas h2"],
  ["body", "Canvas body — ingredient-led, under 14 words."],
  ["caption", "Caption"],
] as const;

export const CanvasFormats: Story = {
  render: () => (
    <ul aria-label="Canvas formats" className="flex flex-wrap items-end gap-3.5">
      {Object.entries(POST_FORMATS).map(([format, { width, height, label }]) => (
        <li key={format} className="flex flex-col gap-1">
          <span
            aria-hidden
            className="rounded-xs bg-pink-500"
            style={{
              width: `${String(width * PREVIEW_SCALE)}px`,
              height: `${String(height * PREVIEW_SCALE)}px`,
            }}
          />
          <span className="font-mono text-mono text-text-heading">
            {format} · {label}
          </span>
          <span className="font-mono text-mono text-text-muted">
            {width}×{height}
          </span>
        </li>
      ))}
    </ul>
  ),
  play: async () => {
    // PostFrame's formats are derived from the canvas tokens — prove they have not drifted.
    for (const [format, { width, height }] of Object.entries(POST_FORMATS)) {
      await expect(`${String(width)}px`).toBe(cssValue(`canvas-${format}-w`));
      await expect(`${String(height)}px`).toBe(cssValue(`canvas-${format}-h`));
    }
  },
};

export const CanvasTokens: Story = {
  render: () => (
    <TokenTable
      caption="Canvas sizes, safe margins and story chrome"
      selection={{ prefix: "canvas-" }}
    />
  ),
};

export const CanvasType: Story = {
  render: () => (
    <div className="w-full max-w-150">
      <PostFrame format="post" tone="light" isFit>
        <div className="flex flex-col gap-6">
          {CANVAS_STEPS.map(([size, sample]) => (
            <SocialHeadline key={size} size={size} as="p">
              {sample} · {formatValue(token(`text-canvas-${size}`).value)}
            </SocialHeadline>
          ))}
        </div>
      </PostFrame>
    </div>
  ),
};

export const CanvasTypeTokens: Story = {
  render: () => <TokenTable caption="Canvas type scale" selection={{ prefix: "text-canvas-" }} />,
};
```

- [ ] **Step 2: The Marketing pages**

Create `apps/storybook/src/foundations/marketing/canvas-formats.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./marketing.stories";

<Meta title="Marketing/Canvas formats" />

{/* source: guidelines/canvas-formats.card.html */}

# Canvas formats

The only seven artboard sizes, shown to scale. The brand ships far more artwork than product UI,
so canvases are tokens. Never invent a size outside this list — add a canvas token instead.

<Canvas of={Specimens.CanvasFormats} meta={Specimens} sourceState="none" />

| Format        | Use                                            |
| ------------- | ---------------------------------------------- |
| `post`        | Instagram feed 1:1, carousel slides            |
| `portrait`    | Feed 4:5 — the loudest, default for statements |
| `story`       | Stories, Reels covers                          |
| `landscape`   | Link previews, OG images, email headers        |
| `wide`        | In-store screens, menu boards                  |
| `leaderboard` | Display ad                                     |
| `mpu`         | Display ad                                     |

- **Build every asset inside `PostFrame`** — it pins the true pixel canvas and scales for preview,
  so nothing is designed at an arbitrary size.
- **Safe margins:** the canvas pad on 1080px canvases, the tight pad on the 1200 × 628 landscape;
  stories keep the top and bottom story-safe bands clear of platform chrome.
- **One idea per board:** overline, headline, signature. One field colour per board — flooded pink
  with the tiled pattern is the house look; ink for statements; the soft pinks for product-led
  boards.
- **One `OfferSeal` per board**, cornered and allowed to bleed off the edge — but the number stays
  fully inside the canvas. Pass `bleed`; never position the seal by hand.
- **Every board is signed** with `LogoLockup` (or `Logo` on small ad units), white on pink or ink.
- **Display ads** carry the smallest possible message: mark, one line, one button.

<Canvas of={Specimens.CanvasTokens} meta={Specimens} sourceState="none" />
```

Create `apps/storybook/src/foundations/marketing/canvas-type.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./marketing.stories";

<Meta title="Marketing/Canvas type" />

{/* source: guidelines/canvas-type.card.html */}

# Canvas type

The type scale for a 1080px artboard, set through `SocialHeadline` and previewed scaled to fit.

<Canvas of={Specimens.CanvasType} meta={Specimens} sourceState="none" />

Canvas type is its own scale: screen sizes look like fine print on a 1080 canvas and are never used
there. Headlines stay at six words or fewer, balanced, two or three lines at most. Prices on artwork
keep the `₹` rules — no space, no decimals.

<Canvas of={Specimens.CanvasTypeTokens} meta={Specimens} sourceState="none" />
```

- [ ] **Step 3: Every guideline card maps to a page**

Run:

```bash
diff <(ls "zip-files/Pink Paprikaa Design System/guidelines" | sed 's/\.card\.html$//' | sort) \
     <(grep -rhoE 'guidelines/[a-z0-9-]+\.card\.html' apps/storybook/src/foundations | sed -E 's#guidelines/##; s#\.card\.html##' | sort -u) \
  && echo "33 of 33 guideline cards mapped"
find apps/storybook/src/foundations -name '*.mdx' | wc -l
```

Expected: `33 of 33 guideline cards mapped`; `34` MDX pages — 29 pages carry the 33 cards (Logo holds four, Pattern two) and Contrast, Voice & content, Iconography, Utility classes and Section reveal are the other five.

- [ ] **Step 4: Gate and commit**

```bash
pnpm nx lint @pink-paprikaa-web/storybook --fix 2>&1 | tail -5
pnpm nx run-many -t typecheck lint -p @pink-paprikaa-web/storybook --skip-nx-cache --outputStyle=static 2>&1 | tail -8
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- marketing.stories 2>&1 | tail -10
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -4
pnpm nx format:check
git add apps/storybook/src/foundations/marketing
git commit -m "feat(storybook): the Marketing foundation pages

Canvas formats drawn to scale from PostFrame's formats, with a test that they
still equal the canvas tokens, and the canvas type scale set through
SocialHeadline. All 33 guideline cards now map to a foundation page.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 10: Kit fixtures and the Website kit

Sources: `ui_kits/website/{index.html,Sections.jsx,README.md}`; handoff `design/rates.js` (`google.reviews`, `catering.faqs`, `links.directions`); the design system's organism defaults (`components/organisms/*.jsx` — MenuList, TestimonialWall, FaqSection, SiteHeader, SiteFooter, OrderTracker), passed explicitly because this system's components carry no copy (D9).

**Facts rule for every kit:** layouts and sample copy come from the design system; every _fact_ — year, address, hours, legal lines, contact, outlet — comes from `@pink-paprikaa-web/content`. The kit's invented testimonials (three named guests) are replaced by the four verified Google reviews; its invented "4.6 average guest rating" and "18 spices" stats are replaced by brand facts; its FAQ line about egg-containing bakes is replaced (the kitchen is egg-free); its "chilli paneer at midnight" is replaced by the real hours.

**Files:**

- Replace: `apps/storybook/src/kits/fixtures.ts`
- Create: `apps/storybook/src/kits/{kit-notice.tsx,expect-no-overflow.ts}`, `apps/storybook/src/kits/website/{website-kit.tsx,website.stories.tsx}`

**Dev reference:** none (dev has no reference kits). Dev's landmark findings for the components this kit composes are Task 0 A21.

**Interfaces:**

- Consumes: `brand`, `toBrandLines` (content); ui organisms/molecules per the imports below.
- Produces: fixtures `OUTLET`, `BUILD_YEAR`, `ORDER_STEPS` (unchanged from Task 2), `GOOGLE_REVIEWS`, `MENU_ITEMS`, `MENU_CATEGORIES`, `FEATURED_DISH`, `SAMPLE_CART`, `NAV_LINKS`, `FOOTER_COLUMNS`, `SOCIAL_LINKS`, `FAQS`, `GUEST_OPTIONS`, `BOOKING_SLOTS`, `DIRECTIONS_URL`; `KitNotice`, `KIT_NOTICE`; `expectNoHorizontalOverflow(canvasElement, width)`; `WebsiteKit`; stories `Website/Homepage` → `Homepage`, `Homepage360`.

- [ ] **Step 1: The fixtures**

Replace `apps/storybook/src/kits/fixtures.ts`:

```ts
import { brand } from "@pink-paprikaa-web/content";

import type {
  AccordionItem,
  CartLine,
  FooterColumn,
  MenuListItem,
  NavLink,
  ReviewCardProps,
  SelectOption,
  SlotOption,
  TrackerStep,
} from "@pink-paprikaa-web/ui";

/**
 * Reference-kit fixtures. Layouts and sample copy come from the design system's ui_kits; every
 * fact — year, address, hours, legal lines, contact, outlet — comes from @pink-paprikaa-web/content,
 * and the only reviews are the four verified Google reviews from the handoff (design/rates.js →
 * google.reviews). Nothing here is non-veg, not even egg.
 */

const [flagship] = brand.outlets;
if (flagship === undefined) {
  throw new Error("storybook: the brand facts list no outlet (packages/content)");
}

/** The outlet every specimen, kit and pattern names. */
export const OUTLET = flagship;

/** The year the legal lines print — read once when Storybook is built, as an app does at build. */
export const BUILD_YEAR = new Date().getFullYear();

/** Order steps from the design system's OrderTracker. */
export const ORDER_STEPS: TrackerStep[] = [
  { label: "Order in", note: "Kitchen's on it." },
  { label: "On the tandoor", note: "Chilli paneer is charring." },
  { label: "Ready for pickup", note: "Counter 2, ask for Paprikaa." },
];

/** Google Maps directions to the outlet — the handoff's links.directions. */
export const DIRECTIONS_URL = "https://maps.google.com/?q=Pink+Paprikaa+Sector+57+Gurgaon";

/**
 * The four verified Google reviews, as the guests wrote them — spelling and emoji included. Never
 * edit a review. One elision ("[…]") removes a guest's one-a spelling of the brand name, because
 * the two-a spelling is a hard rule in this repository; nothing else is changed.
 */
export const GOOGLE_REVIEWS: ReviewCardProps[] = [
  {
    name: "Raj Chrome",
    meta: "Restaurant · Google review",
    rating: 5,
    isVerified: true,
    hasAvatar: false,
    source: { label: "View on Google", href: "https://maps.app.goo.gl/uGhWvzmZW7To5etbA" },
    quote:
      "I ordered Mahararaja Thali, steamed Momos and other few extras for the first time. The experience and taste was great😋 A1. Restaurant customer support over phone were well spoken. I will recommend this to my friends. Looking forward to order more […]. Packing was great👌Hatts of Team",
  },
  {
    name: "Vikas Kumar",
    meta: "Restaurant · Google review",
    rating: 5,
    isVerified: true,
    hasAvatar: false,
    source: { label: "View on Google", href: "https://maps.app.goo.gl/32n6SYDUMejsa3NeA" },
    quote: "Very nice and economical food or very tasty food as home",
  },
  {
    name: "Abhishek Aggarwal",
    meta: "Restaurant · Google review",
    rating: 4,
    isVerified: true,
    hasAvatar: false,
    source: { label: "View on Google", href: "https://maps.app.goo.gl/GB38hi9T2G2UfQdG9" },
    quote: "Good place for indian main course at reasonable price in gurgaon sector 57",
  },
  {
    name: "Shrideep Chatterjee",
    meta: "Restaurant · Google review",
    rating: 4,
    isVerified: true,
    hasAvatar: false,
    source: { label: "View on Google", href: "https://maps.app.goo.gl/s1ghZv4qg3f773Gn8" },
    quote: "Had Honey chili potato and it was good 👍",
  },
];

/** The design system's sample dishes (ui_kits) — every one vegetarian, not even egg. */
export const MENU_ITEMS: MenuListItem[] = [
  {
    id: "paprikaa-chilli-paneer",
    name: "Paprikaa Chilli Paneer",
    price: 280,
    spice: 3,
    category: "Small Plates",
    badge: "Bestseller",
    description: "Amritsari paneer, burnt chilli mayo, potato brioche.",
  },
  {
    id: "mushroom-keema-pav",
    name: "Mushroom Keema Pav",
    price: 340,
    was: 380,
    spice: 2,
    category: "Small Plates",
    description: "Slow-cooked mushroom keema, buttered pav, pickled onion.",
  },
  {
    id: "masala-cold-brew",
    name: "Masala Cold Brew",
    price: 220,
    spice: 1,
    category: "Chai & Coffee",
    badge: "New",
    description: "Cold brew, jaggery, cardamom.",
  },
  {
    id: "kulhad-chai",
    name: "Kulhad Chai",
    price: 90,
    spice: 1,
    category: "Chai & Coffee",
    description: "Assam leaf, ginger, clay cup.",
  },
  {
    id: "bombay-toastie",
    name: "Bombay Toastie",
    price: 240,
    spice: 2,
    category: "All Day",
    description: "Green chutney, potato, amul butter, coal-grilled.",
  },
  {
    id: "tandoori-paneer-bowl",
    name: "Tandoori Paneer Bowl",
    price: 420,
    spice: 3,
    category: "All Day",
    description: "Charred paneer, burnt garlic rice, pickled slaw.",
  },
  {
    id: "gulkand-kulfi",
    name: "Gulkand Kulfi",
    price: 180,
    spice: 1,
    category: "Sweets",
    description: "Rose petal preserve, pistachio, saffron.",
  },
  {
    id: "masala-fries",
    name: "Masala Fries",
    price: 190,
    spice: 4,
    category: "Small Plates",
    description: "Masala fries, amchur, curry-leaf salt.",
  },
];

export const MENU_CATEGORIES = [...new Set(MENU_ITEMS.map((item) => item.category))];

const [featured] = MENU_ITEMS;
if (featured === undefined) throw new Error("kits: MENU_ITEMS is empty");

/** The dish the app kit opens first. */
export const FEATURED_DISH = featured;

export const SAMPLE_CART: CartLine[] = [
  {
    id: "paprikaa-chilli-paneer",
    name: "Paprikaa Chilli Paneer",
    price: 280,
    quantity: 1,
    note: "Regular · Hot",
  },
  { id: "kulhad-chai", name: "Kulhad Chai", price: 90, quantity: 2, note: "Regular · Mild" },
];

export const NAV_LINKS: NavLink[] = [
  { label: "Menu", href: "#menu" },
  { label: "Our Story", href: "#story" },
  { label: "Outlets", href: "#outlets" },
  { label: "Franchise", href: "#franchise" },
  { label: "Careers", href: `mailto:${brand.contact.careersEmail}` },
];

const WHATSAPP_URL = `https://wa.me/${brand.contact.whatsapp.replace("+", "")}`;

/** The design system's footer columns, trimmed to links that exist, plus the real contact lines. */
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: "Eat",
    items: [
      { label: "Full Menu", href: "#menu" },
      { label: "Small Plates", href: "#menu" },
      { label: "Chai & Coffee", href: "#menu" },
      { label: "Sweets", href: "#menu" },
    ],
  },
  {
    heading: "Visit",
    items: [
      { label: "Outlets", href: "#outlets" },
      { label: "Book a Table", href: "#book" },
      { label: "Directions", href: DIRECTIONS_URL },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: "Our Story", href: "#story" },
      { label: "Franchise", href: `mailto:${brand.contact.franchiseEmail}` },
      { label: "Careers", href: `mailto:${brand.contact.careersEmail}` },
    ],
  },
  {
    heading: "Contact",
    items: [
      { label: brand.contact.phoneDisplay, href: `tel:${brand.contact.phone}` },
      { label: "WhatsApp", href: WHATSAPP_URL },
      { label: brand.contact.email, href: `mailto:${brand.contact.email}` },
    ],
  },
];

export const SOCIAL_LINKS = brand.social.map((profile) => ({
  network: profile.network,
  href: profile.url,
  label: profile.handle,
}));

/** Real answers only: the brand facts, and the handoff's catering FAQ on Jain food. */
export const FAQS: AccordionItem[] = [
  {
    value: "veg",
    question: "Is everything vegetarian?",
    answer: `Yes. ${brand.vegStatement} Nothing non-veg, not even egg.`,
  },
  { value: "hours", question: "When are you open?", answer: `${brand.hours.display}.` },
  { value: "where", question: "Where are you?", answer: `${OUTLET.address}.` },
  {
    value: "jain",
    question: "Can you make Jain or satvik food?",
    answer:
      "Yes. No onion, no garlic, and no root vegetables if you need. Tell us when you book, not on the day — it changes how we shop.",
  },
];

export const GUEST_OPTIONS: SelectOption[] = [
  { value: "2", label: "2 guests" },
  { value: "3", label: "3 guests" },
  { value: "4", label: "4 guests" },
  { value: "6", label: "6 guests" },
];

export const BOOKING_SLOTS: SlotOption[] = [
  { value: "7:30pm", label: "7:30pm" },
  { value: "8:00pm", label: "8:00pm" },
  { value: "8:30pm", label: "8:30pm" },
  { value: "9:00pm", label: "9:00pm", isDisabled: true },
];
```

- [ ] **Step 2: The notice and the 360px assertion**

Create `apps/storybook/src/kits/kit-notice.tsx`:

```tsx
import { Badge } from "@pink-paprikaa-web/ui";

export const KIT_NOTICE = "Reference kit — not production copy";

export interface KitNoticeProps {
  /** The design-system kit this page reproduces, e.g. `ui_kits/website`. */
  source: string;
}

/** The badge every kit page carries: a layout reference with real facts, not shippable copy. */
export function KitNotice({ source }: KitNoticeProps) {
  return (
    <div
      role="note"
      className="flex w-full flex-wrap items-center gap-3 border-b border-border-subtle bg-surface-sunken px-gutter py-2"
    >
      <Badge tone="warning">{KIT_NOTICE}</Badge>
      <span className="font-mono text-mono text-text-muted">
        {source} · facts from @pink-paprikaa-web/content · reviews verbatim from Google
      </span>
    </div>
  );
}
```

Create `apps/storybook/src/kits/expect-no-overflow.ts`:

```ts
import { expect } from "storybook/test";

/**
 * Every design must survive the 360px floor (readme §3.10): the story really ran at `width`, and
 * nothing on the page scrolls sideways.
 */
export async function expectNoHorizontalOverflow(
  canvasElement: HTMLElement,
  width: number
): Promise<void> {
  const page = canvasElement.ownerDocument.documentElement;
  await expect(canvasElement.ownerDocument.defaultView?.innerWidth).toBe(width);
  await expect(
    page.scrollWidth,
    `the page is ${String(page.scrollWidth)}px wide at a ${String(page.clientWidth)}px viewport`
  ).toBeLessThanOrEqual(page.clientWidth);
}
```

- [ ] **Step 3: Write the failing Website stories (Review Focus 3)**

Create `apps/storybook/src/kits/website/website.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, screen, within } from "storybook/test";

import { expectNoHorizontalOverflow } from "../expect-no-overflow";
import { FEATURED_DISH } from "../fixtures";
import { KIT_NOTICE } from "../kit-notice";
import { WebsiteKit } from "./website-kit";

const meta = {
  title: "Website/Homepage",
  component: WebsiteKit,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The design system's website kit (ui_kits/website), composed only from @pink-paprikaa-web/ui. Layouts and sample copy are the design system's; every fact is from @pink-paprikaa-web/content, and the reviews are the four verified Google reviews. Interactions: add a dish (header count + pop toast), book a table (two-step dialog), the header turns to glass on scroll. Reference kit — not production copy.",
      },
    },
  },
} satisfies Meta<typeof WebsiteKit>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Homepage: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByText(KIT_NOTICE)).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: `Add ${FEATURED_DISH.name}` }));
    await expect(
      await screen.findByText(`${FEATURED_DISH.name} added to your order.`)
    ).toBeVisible();

    await userEvent.click(
      within(canvas.getByRole("banner")).getByRole("button", { name: "Book a Table" })
    );
    const booking = await screen.findByRole("dialog", { name: "Book a table" });
    await userEvent.click(within(booking).getByRole("button", { name: "Hold My Table" }));
    await expect(
      await screen.findByRole("dialog", { name: "Table held for 10 minutes" })
    ).toBeVisible();
  },
};

export const Homepage360: Story = {
  name: "Homepage at 360px",
  globals: { viewport: { value: "floor360", isRotated: false } },
  play: async ({ canvas, canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement, 360);
    await expect(canvas.getByText(KIT_NOTICE)).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Menu" })).toBeVisible();
  },
};
```

Run: `pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- website.stories 2>&1 | tail -8`
Expected: FAIL — `Failed to resolve import "./website-kit"`.

- [ ] **Step 4: The Website kit**

Create `apps/storybook/src/kits/website/website-kit.tsx`:

```tsx
import { ArrowRight, ArrowUpRight, Phone, Plus, Search, ShoppingBag } from "lucide-react";
import { useState } from "react";

import { brand, toBrandLines } from "@pink-paprikaa-web/content";
import {
  AutoGrid,
  Badge,
  Button,
  Card,
  Cluster,
  CtaBand,
  Dialog,
  FaqSection,
  Field,
  HeroBanner,
  IconButton,
  ImageSlot,
  Input,
  Logo,
  MenuList,
  type MenuListItem,
  OutletCard,
  Section,
  SectionHeader,
  Select,
  SiteFooter,
  SiteHeader,
  SlotPicker,
  SpiceLevel,
  Stack,
  Stat,
  StatBand,
  TestimonialWall,
  Text,
  Toast,
  ToastProvider,
} from "@pink-paprikaa-web/ui";

import {
  BOOKING_SLOTS,
  BUILD_YEAR,
  DIRECTIONS_URL,
  FAQS,
  FOOTER_COLUMNS,
  GOOGLE_REVIEWS,
  GUEST_OPTIONS,
  MENU_CATEGORIES,
  MENU_ITEMS,
  NAV_LINKS,
  OUTLET,
  SOCIAL_LINKS,
} from "../fixtures";
import { KitNotice } from "../kit-notice";

const LINES = toBrandLines(brand, BUILD_YEAR);
const OUTLET_OPTIONS = brand.outlets.map((outlet) => ({
  value: outlet.id,
  label: `${outlet.name}, ${outlet.city}`,
}));

/** The design system's marketing homepage (ui_kits/website), composed from the library. */
export function WebsiteKit() {
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [slot, setSlot] = useState("8:00pm");

  function addToOrder(item: MenuListItem) {
    setCartCount((count) => count + 1);
    setToast(`${item.name} added to your order.`);
  }

  function openBooking() {
    setIsBooked(false);
    setIsBooking(true);
  }

  const bookButton = (
    <Button variant="secondary" size="sm" onClick={openBooking}>
      Book a Table
    </Button>
  );
  const orderButton = (
    <Button size="sm" icon={ShoppingBag} asChild>
      <a href="#menu">Order Now</a>
    </Button>
  );

  return (
    <ToastProvider duration={2600} label="Notifications">
      <KitNotice source="ui_kits/website" />
      <SiteHeader
        homeHref="#top"
        links={NAV_LINKS}
        badge={<Badge tone="success">Pure veg</Badge>}
        actions={
          <>
            <IconButton icon={Search} label="Search the menu" variant="ghost" />
            <IconButton icon={ShoppingBag} label="Your order" variant="ghost" count={cartCount} />
            {bookButton}
            {orderButton}
          </>
        }
        drawerActions={
          <>
            {bookButton}
            {orderButton}
          </>
        }
      />

      <main id="main">
        <HeroBanner
          overline={brand.tagline}
          title={brand.statement}
          body={`We roast our own masala every morning, then build the rest of the day around it. Open ${brand.hours.display}.`}
          meta={[
            `Est. ${String(brand.established)}`,
            `${OUTLET.name}, ${OUTLET.city}`,
            brand.hours.weekday,
          ]}
          media={
            <ImageSlot
              ratio="4:5"
              radius="xl"
              label="Hero food photography 4:5 — warm, close-cropped"
            />
          }
          actions={
            <>
              <Button size="lg" icon={ShoppingBag} asChild>
                <a href="#menu">Order Now</a>
              </Button>
              <Button size="lg" variant="secondary" iconAfter={ArrowRight} asChild>
                <a href="#menu">See Full Menu</a>
              </Button>
            </>
          }
        />

        <MenuList
          id="menu"
          items={MENU_ITEMS}
          categories={MENU_CATEGORIES}
          overline="The Menu"
          title="Most ordered this week"
          note="100% Vegetarian"
          variant="grid"
          gridCount={4}
          action={
            <Button variant="ghost" iconAfter={ArrowRight} asChild>
              <a href="#menu">See Full Menu</a>
            </Button>
          }
          renderItemAction={(item) => (
            <IconButton
              icon={Plus}
              label={`Add ${item.name}`}
              size="sm"
              onClick={() => {
                addToOrder(item);
              }}
            />
          )}
        />

        <Section id="story" tone="alt">
          <AutoGrid min="lg" className="items-center">
            <div className="grid grid-cols-2 gap-4">
              <ImageSlot ratio="3:4" tone="strong" radius="lg" label="Kitchen portrait 3:4" />
              <ImageSlot ratio="3:4" radius="lg" label="Masala grinding 3:4" className="mt-10" />
            </div>
            <Stack space={4}>
              <SectionHeader overline="Our Story" title="A café that tastes like where it's from" />
              <Text variant="body-lg">
                We started in one Gurgaon market with a chai counter and a grinder. The idea was
                simple: a café that runs on Indian flavour instead of borrowing someone else&apos;s.
              </Text>
              <Text variant="body-lg">
                Every masala is roasted in-house each morning. Every dish is built to be shared,
                argued over, and ordered again.
              </Text>
              <Cluster space={4}>
                <Card variant="feature" className="min-w-50 flex-1">
                  <Stat
                    value={String(brand.outlets.length)}
                    label={`kitchen, ${OUTLET.name} ${OUTLET.city}`}
                    tone="brand"
                  />
                </Card>
                <Card variant="feature" className="flex min-w-50 flex-1 flex-col gap-1.5">
                  <SpiceLevel level={4} hasLabel />
                  <Text variant="body-sm">the heat scale we cook to</Text>
                </Card>
              </Cluster>
              <Button variant="secondary" iconAfter={ArrowRight} className="self-start" asChild>
                <a href="#story">Read Our Story</a>
              </Button>
            </Stack>
          </AutoGrid>
        </Section>

        <StatBand
          stats={[
            { value: String(brand.established), label: `established in ${OUTLET.city}` },
            { value: "100%", label: "vegetarian kitchen" },
            { value: brand.hours.weekday, label: "every day" },
          ]}
        />

        <TestimonialWall
          overline="Guests"
          title="What people actually say"
          reviews={GOOGLE_REVIEWS}
        />

        <Section id="outlets">
          <Stack space={8}>
            <SectionHeader overline="Outlets" title="Find a Paprikaa" />
            <AutoGrid min="lg">
              {brand.outlets.map((outlet) => (
                <OutletCard
                  key={outlet.id}
                  name={outlet.name}
                  city={outlet.city}
                  address={outlet.address}
                  hours={outlet.hours ?? brand.hours.display}
                  imageLabel="Outlet interior 16:9"
                  action={
                    <Button size="sm" variant="ghost" iconAfter={ArrowUpRight} asChild>
                      <a href={outlet.mapsUrl ?? DIRECTIONS_URL} target="_blank" rel="noreferrer">
                        Directions
                      </a>
                    </Button>
                  }
                />
              ))}
            </AutoGrid>
          </Stack>
        </Section>

        <FaqSection
          overline="Questions"
          title="The things people ask"
          lede="Everything guests ask us at the counter."
          items={FAQS}
        />

        <CtaBand
          id="franchise"
          overline="Franchise"
          title="Bring Pink Paprikaa to your city"
          body="One kitchen, one playbook. Franchise applications are open."
          action={
            <Button size="lg" iconAfter={ArrowRight} asChild>
              <a href={`mailto:${brand.contact.franchiseEmail}`}>Apply to Franchise</a>
            </Button>
          }
        />
      </main>

      <SiteFooter
        tone="brand"
        brand={
          <Stack space={3}>
            <Logo tone="white" className="w-50" />
            <Text variant="body-sm">{`${brand.statement} ${brand.hours.display}.`}</Text>
            <Badge tone="soft" className="self-start">
              {brand.vegStatement}
            </Badge>
            <Text variant="caption">{LINES.fssai}</Text>
          </Stack>
        }
        columns={FOOTER_COLUMNS}
        social={SOCIAL_LINKS}
        legal={
          <>
            <span>{LINES.copyright}</span>
            <span>{LINES.gstin}</span>
            <span>{LINES.cin}</span>
          </>
        }
        policies={brand.policies.map((policy) => ({
          label: policy,
          href: `#${policy.toLowerCase()}`,
        }))}
      />

      <Toast
        open={toast !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setToast(null);
        }}
        tone="brand"
        icon={ShoppingBag}
        isPop
        action={{
          label: "View Cart",
          altText: "View your order",
          onClick: () => {
            setToast(null);
          },
        }}
      >
        {toast ?? ""}
      </Toast>

      <Dialog
        open={isBooking}
        onOpenChange={setIsBooking}
        variant="modal"
        size="sm"
        title={isBooked ? "Table held for 10 minutes" : "Book a table"}
        footer={
          isBooked ? (
            <Button
              onClick={() => {
                setIsBooking(false);
              }}
            >
              Done
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsBooking(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsBooked(true);
                }}
              >
                Hold My Table
              </Button>
            </>
          )
        }
      >
        {isBooked ? (
          <Text>{`We'll text you the confirmation. See you at ${OUTLET.name}.`}</Text>
        ) : (
          <Stack space={4}>
            <Field label="Outlet">
              {(control) => <Select {...control} options={OUTLET_OPTIONS} />}
            </Field>
            <Field label="Guests">
              {(control) => <Select {...control} options={GUEST_OPTIONS} defaultValue="2" />}
            </Field>
            <SlotPicker
              name="time"
              legend="Time"
              slots={BOOKING_SLOTS}
              value={slot}
              onValueChange={setSlot}
              columns={4}
            />
            <Field label="Mobile number" isRequired>
              {(control) => (
                <Input
                  {...control}
                  type="tel"
                  icon={Phone}
                  placeholder="98765 43210"
                  autoComplete="tel"
                />
              )}
            </Field>
          </Stack>
        )}
      </Dialog>
    </ToastProvider>
  );
}
```

Run the Step 3 command → PASS (both stories; axe included).

- [ ] **Step 5: Probe the 360px test (Review Focus 3)**

Temporarily add `<div className="w-200" />` (800px) as the first child of `<main>`; rerun; expect `Homepage360` FAIL with `the page is 8…px wide at a 360px viewport`. Remove; rerun green. Paste both.

- [ ] **Step 6: Visual parity check, gate and commit**

Serve the source kit and Storybook side by side and compare at 1280 and 360 (layout, rhythm, surfaces; differences expected only in copy that became real facts, and font rasterisation):

```bash
pnpm exec serve "zip-files/Pink Paprikaa Design System" -l 6008   # open /ui_kits/website/index.html
pnpm nx run @pink-paprikaa-web/storybook:serve                      # Website → Homepage
```

List any layout difference with its reason in the report.

```bash
pnpm nx lint @pink-paprikaa-web/storybook --fix 2>&1 | tail -5
pnpm nx run-many -t typecheck lint -p @pink-paprikaa-web/storybook --skip-nx-cache --outputStyle=static 2>&1 | tail -8
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- website.stories 2>&1 | tail -10
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -4
pnpm nx format:check
git add apps/storybook/src/kits
git commit -m "feat(storybook): the Website reference kit

The design system's homepage composed only from the library: header, hero,
menu, story, stats, reviews, outlets, FAQ, franchise band, footer, the pop
toast and the two-step booking dialog. Facts come from the brand module; the
invented testimonials, rating and spice count are replaced by the four
verified Google reviews and real brand facts. Tested at the 360px floor.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 11: The App kit

Sources: `ui_kits/app/{index.html,Screens.jsx,ItemSheet.jsx,README.md}`. The kit's `diet: "egg"` dish flag is gone (C10); the invented account holder ("Aditi Rao", a phone number, "12 orders since 2024") becomes a signed-out Guest; the promo's closing time comes from `brand.hours`.

**Files:**

- Create: `apps/storybook/src/kits/app/{item-sheet.tsx,app-screens.tsx,ordering-app.tsx,app.stories.tsx}`

**Dev reference:** none (dev has no reference kits). Dev's `landmark-unique` (app-shell, tab-bar) and `scrollable-region-focusable` (cluster) findings are Task 0 A21 and A10.

**Interfaces:**

- Consumes: fixtures (Task 10), `KitNotice`, `expectNoHorizontalOverflow`; ui components per the imports; `formatRupees` (utils).
- Produces: `ItemSheet`, `HomeScreen`, `AccountScreen`, `OrderingApp` (`initialScreen`, `initialItem`, `initialLines`, `size`); stories `App/Ordering app` → `Home`, `Menu`, `ItemSheetOpen` ("Item sheet"), `Cart`, `Tracking`, `Account`, `Home360`.

- [ ] **Step 1: Write the failing App stories (Review Focus 3)**

Create `apps/storybook/src/kits/app/app.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, screen, within } from "storybook/test";

import { expectNoHorizontalOverflow } from "../expect-no-overflow";
import { FEATURED_DISH, SAMPLE_CART } from "../fixtures";
import { KIT_NOTICE } from "../kit-notice";
import { OrderingApp } from "./ordering-app";

const meta = {
  title: "App/Ordering app",
  component: OrderingApp,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "The design system's ordering-app kit (ui_kits/app) at 390×844 inside AppShell, composed only from @pink-paprikaa-web/ui. Flow: Home → customise a dish in the sheet → Add to Order (pop toast) → Cart → Pay → tracking advances Order in → On the tandoor → Ready → Back to Home. The item sheet and the pop toast render inside the phone frame, through AppShell's overlay slot. Reference kit — not production copy.",
      },
    },
  },
} satisfies Meta<typeof OrderingApp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home: Story = {
  args: { initialScreen: "home" },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByText(KIT_NOTICE)).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: `Customise ${FEATURED_DISH.name}` }));
    const sheet = await screen.findByRole("dialog", { name: FEATURED_DISH.name });
    await userEvent.click(within(sheet).getByRole("button", { name: /^Add to Order/ }));
    await expect(
      await screen.findByText(`${FEATURED_DISH.name} added to your order.`)
    ).toBeVisible();
  },
};

export const Menu: Story = { args: { initialScreen: "menu" } };

export const ItemSheetOpen: Story = {
  name: "Item sheet",
  args: { initialScreen: "menu", initialItem: FEATURED_DISH },
};

export const Cart: Story = { args: { initialScreen: "cart", initialLines: SAMPLE_CART } };

export const Tracking: Story = { args: { initialScreen: "tracking", initialLines: SAMPLE_CART } };

export const Account: Story = { args: { initialScreen: "you" } };

export const Home360: Story = {
  name: "Home at 360px",
  args: { initialScreen: "home", size: "phone-sm" },
  globals: { viewport: { value: "floor360", isRotated: false } },
  play: async ({ canvas, canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement, 360);
    await expect(canvas.getByText(KIT_NOTICE)).toBeVisible();
  },
};
```

Run: `pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- app.stories 2>&1 | tail -8`
Expected: FAIL — `Failed to resolve import "./ordering-app"`.

- [ ] **Step 2: The item sheet**

Create `apps/storybook/src/kits/app/item-sheet.tsx`:

```tsx
import { ShoppingBag } from "lucide-react";
import { useState } from "react";

import {
  Badge,
  Button,
  Checkbox,
  Cluster,
  Dialog,
  DietMark,
  ImageSlot,
  type MenuListItem,
  PriceTag,
  QuantityStepper,
  Radio,
  RadioGroup,
  SpiceLevel,
  Stack,
} from "@pink-paprikaa-web/ui";
import { formatRupees } from "@pink-paprikaa-web/utils";

const HEAT = [
  { value: 1, label: "Mild" },
  { value: 2, label: "Medium" },
  { value: 3, label: "Hot" },
  { value: 4, label: "Extra Hot" },
] as const;

type Heat = (typeof HEAT)[number]["value"];

/** The kit's sharing portion: 1.6 × the regular price, rounded. */
const SHARING_MULTIPLIER = 1.6;
const MAYO_PRICE = 40;

export interface ItemSheetProps {
  item: MenuListItem;
  /** AppShell's overlay element, so the sheet opens inside the phone frame (null before mount). */
  portalContainer: HTMLElement | null;
  onClose: () => void;
  onAdd: (item: MenuListItem, unitPrice: number, quantity: number) => void;
}

/** Item detail as a bottom sheet: portion, heat, add-on, quantity and a live total. */
export function ItemSheet({ item, portalContainer, onClose, onAdd }: ItemSheetProps) {
  const [portion, setPortion] = useState<"regular" | "sharing">("regular");
  const [heat, setHeat] = useState<Heat>(item.spice ?? 2);
  const [hasMayo, setHasMayo] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const sharingPrice = Math.round(item.price * SHARING_MULTIPLIER);
  const portionPrice = portion === "sharing" ? sharingPrice : item.price;
  const unitPrice = portionPrice + (hasMayo ? MAYO_PRICE : 0);

  return (
    <Dialog
      open
      variant="sheet"
      title={item.name}
      description={item.description}
      portalContainer={portalContainer}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      footer={
        <Button
          isFullWidth
          size="lg"
          icon={ShoppingBag}
          onClick={() => {
            onAdd(item, unitPrice, quantity);
          }}
        >
          {`Add to Order · ${formatRupees(unitPrice * quantity)}`}
        </Button>
      }
    >
      <Stack space={5}>
        <ImageSlot ratio="16:10" radius="lg" label="Dish photo 16:10" />
        <Cluster space={3}>
          <DietMark />
          {item.badge === undefined ? null : <Badge tone="soft">{item.badge}</Badge>}
          <PriceTag amount={portionPrice} was={item.was} />
          <SpiceLevel level={heat} hasLabel />
        </Cluster>
        <RadioGroup legend="Portion">
          <Radio
            name="portion"
            value="regular"
            label="Regular"
            price={item.price}
            checked={portion === "regular"}
            onChange={() => {
              setPortion("regular");
            }}
          />
          <Radio
            name="portion"
            value="sharing"
            label="Sharing"
            description="Feeds two."
            price={sharingPrice}
            checked={portion === "sharing"}
            onChange={() => {
              setPortion("sharing");
            }}
          />
        </RadioGroup>
        <RadioGroup legend="How spicy?">
          {HEAT.map(({ value, label }) => (
            <Radio
              key={value}
              name="heat"
              value={String(value)}
              label={label}
              checked={heat === value}
              onChange={() => {
                setHeat(value);
              }}
            />
          ))}
        </RadioGroup>
        <Checkbox
          label="Extra burnt chilli mayo"
          price={MAYO_PRICE}
          checked={hasMayo}
          onChange={(event) => {
            setHasMayo(event.target.checked);
          }}
        />
        <QuantityStepper label="Quantity" value={quantity} min={1} onValueChange={setQuantity} />
      </Stack>
    </Dialog>
  );
}
```

- [ ] **Step 3: Home and Account screens**

Create `apps/storybook/src/kits/app/app-screens.tsx`:

```tsx
import { Bell, CreditCard, MapPin, Plus, Receipt } from "lucide-react";

import { brand } from "@pink-paprikaa-web/content";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Cluster,
  Divider,
  FilterBar,
  Icon,
  IconButton,
  ListRow,
  Logo,
  LoyaltyCard,
  MenuItemCard,
  type MenuListItem,
  PatternField,
  SearchField,
  SpiceLevel,
  Switch,
  Text,
} from "@pink-paprikaa-web/ui";

import { MENU_CATEGORIES, MENU_ITEMS, OUTLET } from "../fixtures";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All" },
  ...MENU_CATEGORIES.map((category) => ({ value: category, label: category })),
];

export interface HomeScreenProps {
  onOpenItem: (item: MenuListItem) => void;
  onSeeMenu: () => void;
}

/** App home: pink header, loyalty, category rail, most-ordered rail, tonight's promo. */
export function HomeScreen({ onOpenItem, onSeeMenu }: HomeScreenProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-surface-page">
      <PatternField tone="brand" tile={56}>
        <div className="flex flex-col gap-4.5 px-5 pt-1 pb-6.5">
          <div className="flex items-center justify-between">
            <Logo variant="wordmark" tone="white" className="w-35" />
            <IconButton icon={Bell} label="Notifications" variant="ghost" />
          </div>
          <Text variant="h2" as="p">
            Chai first,
            <br />
            decisions later.
          </Text>
          <span className="flex items-center gap-2">
            <Icon icon={MapPin} size="sm" />
            <Text variant="body-sm" tone="muted" as="span">
              {`${OUTLET.name} · pickup`}
            </Text>
          </span>
          <SearchField label="Search the menu" placeholder="Search chai, paneer, kulfi…" />
        </div>
      </PatternField>

      <div className="px-5 pt-5">
        <LoyaltyCard visits={3} goal={6} reward="chai" />
      </div>

      <div className="pt-5.5 pl-5">
        <FilterBar
          label="Menu categories"
          options={CATEGORY_OPTIONS}
          defaultValue="all"
          onValueChange={onSeeMenu}
        />
      </div>

      <div className="flex items-baseline justify-between px-5 pt-5.5">
        <Text variant="h4" as="h2">
          Most ordered
        </Text>
        <Button variant="ghost" size="sm" onClick={onSeeMenu}>
          See all
        </Button>
      </div>
      <Cluster
        isScrollable
        isNowrap
        space={3}
        aria-label="Most ordered dishes"
        className="px-5 pt-3.5 pb-1"
      >
        {MENU_ITEMS.slice(0, 3).map(({ id, category: _category, ...dish }) => (
          <MenuItemCard
            key={id}
            {...dish}
            className="w-54 shrink-0"
            action={
              <IconButton
                icon={Plus}
                label={`Customise ${dish.name}`}
                size="sm"
                onClick={() => {
                  const item = MENU_ITEMS.find((candidate) => candidate.id === id);
                  if (item !== undefined) onOpenItem(item);
                }}
              />
            }
          />
        ))}
      </Cluster>

      <div className="px-5 pt-6 pb-7">
        <Card variant="ink" padding="none" className="overflow-hidden">
          <PatternField tone="ink" tile={56} className="flex flex-col gap-2.5 p-5">
            <Badge tone="brand" className="self-start">
              Tonight Only
            </Badge>
            <Text variant="h4" weight="black" as="p">
              Extra Hot Fries, half price
            </Text>
            <span className="flex items-center gap-2.5">
              <SpiceLevel level={4} />
              <Text variant="caption" tone="muted" as="span">
                {brand.hours.weekday}
              </Text>
            </span>
            <Button size="sm" className="mt-1.5 self-start" onClick={onSeeMenu}>
              Add to Order
            </Button>
          </PatternField>
        </Card>
      </div>
    </div>
  );
}

/** Account: a signed-out guest, loyalty, settings rows and two switches. */
export function AccountScreen() {
  return (
    <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-5 pt-1 pb-5">
      <div className="flex items-center gap-3.5 pt-2 pb-5">
        <Avatar name="Guest" size="lg" hasRing />
        <div className="flex flex-col">
          <Text variant="h4" as="p">
            Guest
          </Text>
          <Text variant="body-sm" tone="muted" as="span">
            Sign in with your mobile number
          </Text>
        </div>
      </div>
      <LoyaltyCard visits={3} goal={6} reward="chai" />
      <Divider variant="diamond" className="my-5" />
      <ListRow icon={MapPin} title="Default outlet" value={OUTLET.name} />
      <ListRow icon={Receipt} title="Order history" description="Your past orders" />
      <ListRow icon={CreditCard} title="Payment methods" value="UPI" />
      <Switch
        label="Order updates"
        description="A message when your order is ready."
        defaultChecked
      />
      <Switch label="Jain preferences" description="Hides onion and garlic." />
      <Button variant="secondary" isFullWidth className="mt-4">
        Sign out
      </Button>
    </div>
  );
}
```

(The kit's settings rows were buttons with chevrons wired to nothing; here they are informational rows without chevrons, so nothing looks tappable that is not. Recorded as a parity difference.)

- [ ] **Step 4: The ordering app**

Create `apps/storybook/src/kits/app/ordering-app.tsx`:

```tsx
import { ArrowRight, House, Plus, ShoppingBag, User, Utensils } from "lucide-react";
import { useEffect, useState } from "react";

import { brand } from "@pink-paprikaa-web/content";
import {
  AppShell,
  Button,
  type CartLine,
  CartPanel,
  IconButton,
  MenuList,
  type MenuListItem,
  OrderTracker,
  TabBar,
  Toast,
  ToastProvider,
} from "@pink-paprikaa-web/ui";
import { formatRupees } from "@pink-paprikaa-web/utils";

import { MENU_CATEGORIES, MENU_ITEMS, ORDER_STEPS, OUTLET } from "../fixtures";
import { KitNotice } from "../kit-notice";
import { AccountScreen, HomeScreen } from "./app-screens";
import { ItemSheet } from "./item-sheet";

const TAB_SCREENS = ["home", "menu", "cart", "you"] as const;
export type AppScreen = (typeof TAB_SCREENS)[number] | "tracking";

/** The kit's demo pacing between tracking steps. */
const STEP_INTERVAL_MS = 2600;

export interface OrderingAppProps {
  initialScreen?: AppScreen | undefined;
  /** Open the item sheet for this dish on first render. */
  initialItem?: MenuListItem | undefined;
  initialLines?: CartLine[] | undefined;
  size?: "phone" | "phone-sm" | undefined;
}

/** The design system's pickup-ordering app (ui_kits/app) at phone size, composed from the library. */
export function OrderingApp({
  initialScreen = "home",
  initialItem,
  initialLines = [],
  size = "phone",
}: OrderingAppProps) {
  const [screen, setScreen] = useState<AppScreen>(initialScreen);
  const [item, setItem] = useState<MenuListItem | null>(initialItem ?? null);
  const [lines, setLines] = useState<CartLine[]>(initialLines);
  const [toast, setToast] = useState<string | null>(null);
  const [step, setStep] = useState(initialScreen === "tracking" ? 1 : 0);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [overlayRoot, setOverlayRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!isAdvancing || step >= ORDER_STEPS.length - 1) return undefined;
    const timer = setTimeout(() => {
      setStep((current) => current + 1);
    }, STEP_INTERVAL_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [isAdvancing, step]);

  const itemCount = lines.reduce((count, line) => count + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const total = subtotal + Math.round(subtotal * brand.billing.gstRate);
  const isTracking = screen === "tracking";

  function addToOrder(dish: MenuListItem, unitPrice: number, quantity: number) {
    setLines((current) =>
      current.some((line) => line.id === dish.id)
        ? current.map((line) =>
            line.id === dish.id ? { ...line, quantity: line.quantity + quantity } : line
          )
        : [...current, { id: dish.id, name: dish.name, price: unitPrice, quantity }]
    );
    setItem(null);
    setToast(`${dish.name} added to your order.`);
  }

  function changeQuantity(id: string, quantity: number) {
    setLines((current) =>
      quantity <= 0
        ? current.filter((line) => line.id !== id)
        : current.map((line) => (line.id === id ? { ...line, quantity } : line))
    );
  }

  function placeOrder() {
    setStep(0);
    setIsAdvancing(true);
    setScreen("tracking");
  }

  function finishOrder() {
    setIsAdvancing(false);
    setLines([]);
    setScreen("home");
  }

  function showMenu() {
    setScreen("menu");
  }

  function renderScreen() {
    switch (screen) {
      case "home":
        return <HomeScreen onOpenItem={setItem} onSeeMenu={showMenu} />;
      case "menu":
        return (
          <MenuList
            items={MENU_ITEMS}
            categories={MENU_CATEGORIES}
            variant="list"
            title={null}
            className="flex-1 overflow-y-auto px-5 pb-5"
            renderItemAction={(dish) => (
              <IconButton
                icon={Plus}
                label={`Customise ${dish.name}`}
                size="sm"
                onClick={() => {
                  setItem(dish);
                }}
              />
            )}
          />
        );
      case "cart":
        return (
          <CartPanel
            lines={lines}
            title="Your order"
            meta={`Pickup · ${OUTLET.name}`}
            gstRate={brand.billing.gstRate}
            onQuantityChange={changeQuantity}
            placeAction={
              <Button isFullWidth size="lg" iconAfter={ArrowRight} onClick={placeOrder}>
                {`Pay ${formatRupees(total)}`}
              </Button>
            }
            browseAction={<Button onClick={showMenu}>Browse the Menu</Button>}
          />
        );
      case "you":
        return <AccountScreen />;
      case "tracking":
        return (
          <OrderTracker
            steps={ORDER_STEPS}
            current={step}
            code={`${brand.billing.invoicePrefix}-4821`}
            outlet={`${OUTLET.name}, ${OUTLET.city}`}
            total={total}
            payment="UPI"
            variant="flush"
            action={
              <Button variant="secondary" isFullWidth onClick={finishOrder}>
                Back to Home
              </Button>
            }
          />
        );
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <KitNotice source="ui_kits/app" />
      <AppShell
        size={size}
        statusTone={screen === "home" || isTracking ? "light" : "ink"}
        tabBar={
          isTracking ? undefined : (
            <TabBar
              label="Primary"
              value={screen}
              onValueChange={(value) => {
                const next = TAB_SCREENS.find((tab) => tab === value);
                if (next !== undefined) setScreen(next);
              }}
              items={[
                { value: "home", label: "Home", icon: House },
                { value: "menu", label: "Menu", icon: Utensils },
                {
                  value: "cart",
                  label: "Cart",
                  icon: ShoppingBag,
                  count: itemCount > 0 ? itemCount : undefined,
                },
                { value: "you", label: "You", icon: User },
              ]}
            />
          )
        }
        overlay={<div ref={setOverlayRoot} className="contents" />}
      >
        {renderScreen()}
      </AppShell>
      <ToastProvider duration={2400} label="Notifications" isContained>
        {item === null ? null : (
          <ItemSheet
            item={item}
            portalContainer={overlayRoot}
            onClose={() => {
              setItem(null);
            }}
            onAdd={addToOrder}
          />
        )}
        <Toast
          open={toast !== null}
          onOpenChange={(isOpen) => {
            if (!isOpen) setToast(null);
          }}
          tone="brand"
          icon={ShoppingBag}
          isPop
          portalContainer={overlayRoot}
          action={{
            label: "View Cart",
            altText: "View your order",
            onClick: () => {
              setToast(null);
              setScreen("cart");
            },
          }}
        >
          {toast ?? ""}
        </Toast>
      </ToastProvider>
    </div>
  );
}
```

**Overlay wiring is Task 0's A13/A14 answer, not a guess to keep:** Plan 4's `Dialog` takes `portalContainer` and Plan 3a's `ToastProvider` has a contained viewport, so the sheet and the toast render inside `AppShell`'s `overlay` slot. This file assumes the prop names `portalContainer` (Dialog, and forwarded by `ItemSheet`) and `isContained` (ToastProvider), and that the contained viewport portals into the same `portalContainer` given to `Toast`. Replace each with the built API recorded in Task 0 — if the toast viewport is contained by rendering `ToastProvider` itself inside `overlay`, move the provider into the `overlay` element instead and drop `portalContainer` from `Toast`.

`ItemSheet` forwards `portalContainer` to `Dialog` (Step 2); if Task 0 recorded a different prop name, rename it in both files.

- [ ] **Step 5: Run to green, probe, gate and commit**

Run the Step 1 command → PASS (7 stories). Probe (Review Focus 3): render `Home360` with `size: "phone"` (390px) instead of `"phone-sm"`; expect FAIL `the page is 3…px wide at a 360px viewport`; revert. Paste both. (If A9 recorded that `phone-sm` is wider than 360px, `Home360` renders `<HomeScreen>` without `AppShell` — patch this story in Task 0 and say so.)

Compare with the source kit (`/ui_kits/app/index.html` on the Task 10 `serve`) at 1280; list differences with reasons.

```bash
pnpm nx lint @pink-paprikaa-web/storybook --fix 2>&1 | tail -5
pnpm nx run-many -t typecheck lint -p @pink-paprikaa-web/storybook --skip-nx-cache --outputStyle=static 2>&1 | tail -8
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- app.stories 2>&1 | tail -10
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -4
pnpm nx format:check
git add apps/storybook/src/kits/app
git commit -m "feat(storybook): the App reference kit

The design system's ordering app at phone size: home, menu, item sheet, cart,
tracking and account, with the sheet and pop toast inside the phone frame.
The egg flag and the invented account holder are gone; closing time and the
outlet come from the brand facts. Tested at the 360px floor.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 12: The Marketing kit

Sources: `ui_kits/marketing/{index.html,FeedArtboards.jsx,AdArtboards.jsx,README.md}`. Facts bound: the statement board's "Since …" and hero line (`brand.established`, `brand.statement`), its veg line (`brand.vegStatement` — the invented "18 spices" clause is dropped), the outlet name, the tagline. Campaign copy (offers, promo code) stays the kit's sample copy under the notice.

**Files:**

- Create: `apps/storybook/src/kits/marketing/{artboard.tsx,feed-artboards.tsx,ad-artboards.tsx,feed.stories.tsx,ads.stories.tsx}`

**Dev reference:** none (dev has no reference kits)

**Interfaces:**

- Consumes: `POST_FORMATS`, `PostFrame` (tones incl. Plan 2c's `alt`), `PatternField`, `SocialHeadline`, `LogoLockup`, `Logo`, `OfferSeal`, `CouponTicket`, `DietMark`, `SpiceLevel`, `ImageSlot`, `Divider`, `Button` (ui); `token` (docs-kit); `formatRupees`.
- Produces: `Artboard`; `OfferPost`, `DishLaunchPost`, `StatementPost`, `CarouselSlide`; `OfferStory`, `DishStory` (`hasSafeArea`), `LinkBanner`, `Leaderboard`, `Mpu`; stories `Marketing/Kit/Feed` → four boards + `Feed360`; `Marketing/Kit/Ads` → five boards + `Ads360`.

- [ ] **Step 1: Write the failing kit stories (Review Focus 3)**

Create `apps/storybook/src/kits/marketing/feed.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { expectNoHorizontalOverflow } from "../expect-no-overflow";
import { KIT_NOTICE, KitNotice } from "../kit-notice";
import { Artboard } from "./artboard";
import { CarouselSlide, DishLaunchPost, OfferPost, StatementPost } from "./feed-artboards";

const meta = {
  title: "Marketing/Kit/Feed",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The design system's feed artboards (ui_kits/marketing), each built inside PostFrame at its true canvas and fitted for preview. Sizes are token steps: the feed seal is OfferSeal xl (360) and the MPU seal sm (110), as in the kit; the lockups are lg (280), md (240, also for the kit's 220) and sm (200). Reference kit — not production copy.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex flex-col gap-4">
        <KitNotice source="ui_kits/marketing" />
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Offer: Story = {
  render: () => (
    <Artboard format="post" className="max-w-92">
      <OfferPost />
    </Artboard>
  ),
};

export const DishLaunch: Story = {
  render: () => (
    <Artboard format="post" className="max-w-92">
      <DishLaunchPost />
    </Artboard>
  ),
};

export const Statement: Story = {
  render: () => (
    <Artboard format="portrait" className="max-w-76">
      <StatementPost />
    </Artboard>
  ),
};

export const Carousel: Story = {
  render: () => (
    <Artboard format="post" className="max-w-92">
      <CarouselSlide />
    </Artboard>
  ),
};

export const Feed360: Story = {
  name: "Feed at 360px",
  globals: { viewport: { value: "floor360", isRotated: false } },
  render: () => (
    <div className="flex flex-col gap-6">
      <Artboard format="post" className="max-w-92">
        <OfferPost />
      </Artboard>
      <Artboard format="post" className="max-w-92">
        <DishLaunchPost />
      </Artboard>
      <Artboard format="portrait" className="max-w-76">
        <StatementPost />
      </Artboard>
      <Artboard format="post" className="max-w-92">
        <CarouselSlide />
      </Artboard>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement, 360);
    await expect(canvas.getByText(KIT_NOTICE)).toBeVisible();
  },
};
```

Create `apps/storybook/src/kits/marketing/ads.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { expectNoHorizontalOverflow } from "../expect-no-overflow";
import { KIT_NOTICE, KitNotice } from "../kit-notice";
import { DishStory, Leaderboard, LinkBanner, Mpu, OfferStory } from "./ad-artboards";
import { Artboard } from "./artboard";

const meta = {
  title: "Marketing/Kit/Ads",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The design system's story and display-ad artboards (ui_kits/marketing). Stories show the platform-chrome safe area with `hasSafeArea`. Small units sign with the wordmark (the lockup's 200px minimum does not fit them). Reference kit — not production copy.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex flex-col gap-4">
        <KitNotice source="ui_kits/marketing" />
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const OfferStoryBoard: Story = {
  name: "Offer story",
  render: () => (
    <Artboard format="story" className="max-w-54">
      <OfferStory hasSafeArea />
    </Artboard>
  ),
};

export const DishStoryBoard: Story = {
  name: "Dish story",
  render: () => (
    <Artboard format="story" className="max-w-54">
      <DishStory hasSafeArea />
    </Artboard>
  ),
};

export const LinkBannerBoard: Story = {
  name: "Link / OG",
  render: () => (
    <Artboard format="landscape" className="max-w-150">
      <LinkBanner />
    </Artboard>
  ),
};

export const LeaderboardBoard: Story = {
  name: "Leaderboard",
  render: () => (
    <Artboard format="leaderboard" className="max-w-182">
      <Leaderboard />
    </Artboard>
  ),
};

export const MpuBoard: Story = {
  name: "MPU",
  render: () => (
    <Artboard format="mpu" className="max-w-75">
      <Mpu />
    </Artboard>
  ),
};

export const Ads360: Story = {
  name: "Ads at 360px",
  globals: { viewport: { value: "floor360", isRotated: false } },
  render: () => (
    <div className="flex flex-col gap-6">
      <Artboard format="story" className="max-w-54">
        <OfferStory hasSafeArea />
      </Artboard>
      <Artboard format="landscape" className="max-w-150">
        <LinkBanner />
      </Artboard>
      <Artboard format="leaderboard" className="max-w-182">
        <Leaderboard />
      </Artboard>
      <Artboard format="mpu" className="max-w-75">
        <Mpu />
      </Artboard>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement, 360);
    await expect(canvas.getByText(KIT_NOTICE)).toBeVisible();
  },
};
```

Run: `pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- kits/marketing 2>&1 | tail -8`
Expected: FAIL — `Failed to resolve import "./artboard"`.

- [ ] **Step 2: The artboard frame**

Create `apps/storybook/src/kits/marketing/artboard.tsx`:

```tsx
import type { ReactNode } from "react";

import { POST_FORMATS, type PostFormat } from "@pink-paprikaa-web/ui";

export interface ArtboardProps {
  format: PostFormat;
  /** The preview's maximum width — a spacing-scale `max-w-*`, so it shrinks to fit a phone. */
  className: string;
  children: ReactNode;
}

/** A board on its preview card, captioned with the true canvas it is authored at. */
export function Artboard({ format, className, children }: ArtboardProps) {
  const { width, height, label } = POST_FORMATS[format];
  return (
    <figure
      className={`flex w-full flex-col gap-2.5 rounded-lg bg-surface-card p-3 shadow-1 ${className}`}
    >
      {children}
      <figcaption className="font-mono text-mono text-text-subtle uppercase">
        {label} · {width}×{height}
      </figcaption>
    </figure>
  );
}
```

- [ ] **Step 3: The feed artboards**

Create `apps/storybook/src/kits/marketing/feed-artboards.tsx`:

```tsx
import { brand } from "@pink-paprikaa-web/content";
import {
  DietMark,
  Divider,
  ImageSlot,
  LogoLockup,
  OfferSeal,
  PatternField,
  PostFrame,
  SocialHeadline,
  SpiceLevel,
} from "@pink-paprikaa-web/ui";
import { formatRupees } from "@pink-paprikaa-web/utils";

import { token } from "../../docs-kit/catalogue";
import { OUTLET } from "../fixtures";

/** The canvas safe margin, read from its token (canvas tokens have no utility class). */
const CANVAS_PAD = `var(${token("canvas-pad").cssVar})`;

/** 1:1 offer post — flooded pink, the pattern, one cornered seal. */
export function OfferPost() {
  return (
    <PostFrame format="post" tone="brand" isFit>
      <PatternField tone="brand" tile={96} className="absolute inset-0" />
      <div className="relative flex h-full flex-col justify-between">
        <SocialHeadline size="overline" as="p">
          Tonight Only
        </SocialHeadline>
        <SocialHeadline size="hero" measure="tight" as="h2">
          Masala Fries, half price.
        </SocialHeadline>
        <div className="flex items-end justify-between gap-10">
          <LogoLockup tone="white" size="lg" />
          <SocialHeadline size="caption" measure="tight" align="end" as="p">
            {`Dine-in and pickup. At our ${OUTLET.name} café.`}
          </SocialHeadline>
        </div>
      </div>
      <OfferSeal value="50%" label="Off" size="xl" corner="top-right" bleed="md" />
    </PostFrame>
  );
}

/** 1:1 dish launch — photo half, copy half. */
export function DishLaunchPost() {
  return (
    <PostFrame format="post" tone="light" padding="none" isFit>
      <div className="flex h-full flex-col">
        <ImageSlot ratio="16:9" radius="none" label="Dish photo 16:9" />
        <div className="flex flex-1 flex-col justify-between" style={{ padding: CANVAS_PAD }}>
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-5">
              <DietMark size="lg" />
              <SocialHeadline size="overline" as="p">
                New On The Menu
              </SocialHeadline>
            </div>
            <SocialHeadline size="h1" as="h2">
              Masala Cold Brew
            </SocialHeadline>
            <SocialHeadline size="body" measure="wide" as="p">
              Cold brew, jaggery, cardamom. Served over one big cube.
            </SocialHeadline>
          </div>
          <div className="flex items-end justify-between">
            <SocialHeadline size="h2" as="p">
              {formatRupees(220)}
            </SocialHeadline>
            <LogoLockup tone="pink" size="sm" />
          </div>
        </div>
      </div>
    </PostFrame>
  );
}

/** 4:5 statement post — the brand's loudest format, on ink. */
export function StatementPost() {
  return (
    <PostFrame format="portrait" tone="ink" isFit>
      <PatternField tone="ink" tile={96} className="absolute inset-0" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex flex-col gap-10">
          <SocialHeadline size="overline" as="p">
            {`Since ${String(brand.established)}`}
          </SocialHeadline>
          <SocialHeadline size="hero" measure="tight" as="h2">
            {brand.statement}
          </SocialHeadline>
        </div>
        <div className="flex flex-col gap-7">
          <Divider />
          <div className="flex items-end justify-between gap-8">
            <SocialHeadline size="body" measure="wide" as="p">
              {brand.vegStatement}
            </SocialHeadline>
            <LogoLockup tone="white" size="md" />
          </div>
        </div>
      </div>
    </PostFrame>
  );
}

/** 1:1 carousel slide — one dish per slide, the index top-right. */
export function CarouselSlide() {
  return (
    <PostFrame format="post" tone="alt" isFit>
      <div className="flex h-full flex-col gap-10">
        <div className="flex items-center justify-between">
          <SocialHeadline size="overline" as="p">
            Small Plates
          </SocialHeadline>
          <span className="font-mono text-canvas-caption text-text-brand">2/5</span>
        </div>
        <ImageSlot ratio="16:9" radius="xl" label="Dish photo 16:9" />
        <div className="flex flex-col gap-5.5">
          <SocialHeadline size="h2" as="h2">
            Paprikaa Chilli Paneer
          </SocialHeadline>
          <div className="flex items-center gap-7">
            <SocialHeadline size="body" as="p">
              {formatRupees(280)}
            </SocialHeadline>
            <SpiceLevel level={3} size="lg" />
          </div>
        </div>
      </div>
    </PostFrame>
  );
}
```

- [ ] **Step 4: The story and ad artboards**

Create `apps/storybook/src/kits/marketing/ad-artboards.tsx`:

```tsx
import { brand } from "@pink-paprikaa-web/content";
import {
  Button,
  CouponTicket,
  Divider,
  ImageSlot,
  Logo,
  LogoLockup,
  OfferSeal,
  PatternField,
  PostFrame,
  SocialHeadline,
} from "@pink-paprikaa-web/ui";
import { formatRupees } from "@pink-paprikaa-web/utils";

import { token } from "../../docs-kit/catalogue";

const CANVAS_PAD = `var(${token("canvas-pad").cssVar})`;
const STORY_SAFE_TOP = `var(${token("canvas-story-safe-top").cssVar})`;
const STORY_SAFE_BOTTOM = `var(${token("canvas-story-safe-bottom").cssVar})`;

export interface StoryArtboardProps {
  /** Show the platform-chrome safe area guides. */
  hasSafeArea?: boolean | undefined;
}

/** 9:16 story — the offer with a coupon stub, inside the chrome safe area. */
export function OfferStory({ hasSafeArea = false }: StoryArtboardProps) {
  return (
    <PostFrame format="story" tone="brand" padding="none" hasSafeArea={hasSafeArea} isFit>
      <PatternField tone="brand" tile={96} className="absolute inset-0" />
      <div
        className="relative flex h-full flex-col justify-between"
        style={{ padding: `${STORY_SAFE_TOP} ${CANVAS_PAD} ${STORY_SAFE_BOTTOM}` }}
      >
        <div className="flex flex-col gap-8">
          <SocialHeadline size="overline" as="p">
            First Order
          </SocialHeadline>
          <SocialHeadline size="hero" measure="tight" as="h2">
            Half off, on us.
          </SocialHeadline>
        </div>
        <CouponTicket
          tone="light"
          size="lg"
          notch="brand"
          headline="50% off your first order"
          code="PAPRIKAA50"
          terms="One use per guest. Dine-in and pickup."
        />
        <LogoLockup tone="white" size="lg" align="center" className="self-center" />
      </div>
    </PostFrame>
  );
}

/** 9:16 story — a dish, photo on top, copy below. */
export function DishStory({ hasSafeArea = false }: StoryArtboardProps) {
  return (
    <PostFrame format="story" tone="ink" padding="none" hasSafeArea={hasSafeArea} isFit>
      <div className="flex h-full flex-col">
        <ImageSlot ratio="square" radius="none" tone="soft" label="Dish photo 1:1" />
        <div
          className="flex flex-1 flex-col gap-7 pt-14"
          style={{ paddingInline: CANVAS_PAD, paddingBottom: STORY_SAFE_BOTTOM }}
        >
          <SocialHeadline size="overline" as="p">
            On The Tandoor
          </SocialHeadline>
          <SocialHeadline size="h1" measure="tight" as="h2">
            Tandoori Paneer Bowl
          </SocialHeadline>
          <SocialHeadline size="body" measure="wide" as="p">
            {`Charred paneer, burnt garlic rice, pickled slaw. ${formatRupees(420)}.`}
          </SocialHeadline>
          <LogoLockup tone="white" size="md" className="mt-3" />
        </div>
      </div>
    </PostFrame>
  );
}

/** 1200×628 link preview / OG image. */
export function LinkBanner() {
  return (
    <PostFrame format="landscape" tone="soft" padding="tight" isFit>
      <div className="flex h-full items-center gap-12">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <SocialHeadline size="overline" as="p">
            {brand.tagline}
          </SocialHeadline>
          <SocialHeadline size="h2" as="h2">
            One kitchen. One grinder.
          </SocialHeadline>
          <LogoLockup tone="pink" size="md" />
        </div>
        <div className="h-full">
          <ImageSlot
            ratio="3:4"
            radius="xl"
            tone="strong"
            label="Photo 3:4"
            className="h-full w-auto"
          />
        </div>
      </div>
    </PostFrame>
  );
}

/** 728×90 leaderboard — mark, one line, one button. */
export function Leaderboard() {
  return (
    <PostFrame format="leaderboard" tone="brand" padding="none" isFit>
      <PatternField tone="brand" tile={56} className="absolute inset-0" />
      <div className="relative flex h-full items-center gap-4.5 px-4.5">
        <Logo variant="wordmark" tone="white" className="w-35 shrink-0" />
        <Divider orientation="vertical" className="h-10" />
        <SocialHeadline size="caption" as="p" className="min-w-0 flex-1 truncate">
          50% off your first order
        </SocialHeadline>
        <Button size="sm" asChild>
          <a href="#order">Order Now</a>
        </Button>
      </div>
    </PostFrame>
  );
}

/** 300×250 MPU — mark, one line, one button, one seal. */
export function Mpu() {
  return (
    <PostFrame format="mpu" tone="ink" padding="none" isFit>
      <PatternField tone="ink" tile={56} className="absolute inset-0" />
      <div className="relative flex h-full flex-col justify-between p-4.5">
        <Logo variant="wordmark" tone="white" className="w-35" />
        <SocialHeadline size="caption" as="p">
          Chai first, decisions later.
        </SocialHeadline>
        <Button size="sm" isFullWidth asChild>
          <a href="#order">Order Now</a>
        </Button>
      </div>
      <OfferSeal value="50%" label="Off" size="sm" corner="top-right" bleed="md" />
    </PostFrame>
  );
}
```

- [ ] **Step 5: Run to green, probe, gate and commit**

Run the Step 1 command → PASS (11 stories). Probe (Review Focus 3): in `Feed360`, change the first `Artboard` class to `max-w-150` **and** remove `isFit` from `OfferPost`'s `PostFrame`; expect FAIL `the page is 1…px wide`; revert both. Paste both.

Compare every board with the source kit (`/ui_kits/marketing/index.html` on the Task 10 `serve`; Feed, Stories and Ads tabs); list any difference with its reason (expected: only the kit's 220px lockups, now the 240px `md` step — V4).

```bash
pnpm nx lint @pink-paprikaa-web/storybook --fix 2>&1 | tail -5
pnpm nx run-many -t typecheck lint -p @pink-paprikaa-web/storybook --skip-nx-cache --outputStyle=static 2>&1 | tail -8
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- kits/marketing 2>&1 | tail -10
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -4
pnpm nx format:check
git add apps/storybook/src/kits/marketing
git commit -m "feat(storybook): the Marketing reference kit

Feed boards (offer, dish launch, statement, carousel) and story and ad boards
(offer and dish stories, link preview, leaderboard, MPU), each authored inside
PostFrame at its true canvas and fitted for preview, signed with the lockup or
the wordmark. Statement facts come from the brand module. Tested at 360px.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 13: The React Hook Form + Zod pattern (spec D17)

A realistic catering enquiry — the handoff's real dawats, services and guest minimum (`design/rates.js` → `catering`) — built on the library's controls with one Zod schema driving validation and types. It proves the D17 contract: native-backed controls take `{...register()}` unmodified, value-based controls take `<Controller>`, `Field` renders the message, and the whole form can be completed from the keyboard.

**Files:**

- Create: `apps/storybook/src/patterns/{enquiry-form.tsx,forms.stories.tsx}`
- Modify: `apps/storybook/package.json` (devDependencies via `pnpm add`)

**Dev reference:** none (new in the rewrite, spec D17 — dev has no form-library story)

**Interfaces:**

- Consumes: `Alert`, `AutoGrid`, `Button`, `Card`, `CheckCard`, `Checkbox`, `ChipGroup`, `ChoiceCardGroup`, `ChoiceOption`, `Field`, `FieldProps`, `Input`, `QuantityStepper`, `Radio`, `RadioGroup`, `Select`, `SelectOption`, `Stack` (ui); `formatRupees` (utils).
- Produces: `enquirySchema`, `ENQUIRY_MESSAGES`, `ENQUIRY_DEFAULTS`, types `EnquiryInput`/`EnquiryValues`, `EnquiryForm`; story `Molecules/Field/React Hook Form + Zod` → `KeyboardOnly`.

- [ ] **Step 1: Install and verify the installed APIs**

```bash
pnpm add -D react-hook-form @hookform/resolvers zod --filter @pink-paprikaa-web/storybook
node -p "['react-hook-form','@hookform/resolvers','zod'].map((p) => p + ' ' + require(require.resolve(p + '/package.json', { paths: ['apps/storybook'] })).version).join('\n')"
```

Expected: react-hook-form 7.x (or later), `@hookform/resolvers` 5.x, zod 4.x. Then confirm, by reading the installed type definitions (never memory):

- `apps/storybook/node_modules/react-hook-form/dist/types/form.d.ts` — `UseFormProps<TFieldValues, TContext, TTransformedValues>` and `handleSubmit` passing `TTransformedValues` to the valid callback.
- `apps/storybook/node_modules/@hookform/resolvers/zod/dist/zod.d.ts` — `zodResolver` accepts a Zod 4 schema and returns `Resolver<Input, Context, Output>`.
- `apps/storybook/node_modules/zod` — `z.string().trim()`, `.transform().pipe()`, `.refine(fn, { error })`, `z.string({ error })` exist in the installed major.

If a name differs, adapt Step 3 to the installed API and note it in the report.

- [ ] **Step 2: Write the failing keyboard-only story (Review Focus 5)**

Create `apps/storybook/src/patterns/forms.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, type UserEventObject, waitFor } from "storybook/test";

import { ENQUIRY_MESSAGES, EnquiryForm } from "./enquiry-form";

/** The messages an empty submit must show — every required field. */
const REQUIRED_MESSAGES = [
  ENQUIRY_MESSAGES.name,
  ENQUIRY_MESSAGES.phone,
  ENQUIRY_MESSAGES.occasion,
  ENQUIRY_MESSAGES.guestsMin,
  ENQUIRY_MESSAGES.date,
  ENQUIRY_MESSAGES.meal,
  ENQUIRY_MESSAGES.spice,
  ENQUIRY_MESSAGES.service,
  ENQUIRY_MESSAGES.consent,
];

const MAX_TABS = 80;

/** Press Tab until `target` has focus — proves it is reachable by keyboard, in document order. */
async function tabTo(user: UserEventObject, target: HTMLElement): Promise<void> {
  for (
    let presses = 0;
    presses < MAX_TABS && target.ownerDocument.activeElement !== target;
    presses += 1
  ) {
    await user.tab();
  }
  await expect(target).toHaveFocus();
}

const meta = {
  title: "Molecules/Field/React Hook Form + Zod",
  component: EnquiryForm,
  args: { onSubmit: fn() },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The design system is form-library-agnostic and RHF-compatible by contract (spec D17). Native-backed controls — Input, Select, Checkbox, Radio, ChoiceCardGroup, CheckCard — take `{...register(\"field\")}` unmodified; value-based controls — QuantityStepper, ChipGroup — take `<Controller>` (`value`, `onValueChange`, `onBlur`, `name`); Field renders the message from `formState.errors` through `status` and `message`. One Zod schema drives validation and the submitted types. The form sets `noValidate` so validation is the schema's, not the browser's. react-hook-form, @hookform/resolvers and zod are devDependencies of this Storybook only — never of packages/ui.",
      },
    },
  },
} satisfies Meta<typeof EnquiryForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const KeyboardOnly: Story = {
  name: "Enquiry form — keyboard only",
  play: async ({ args, canvas, step, userEvent }) => {
    const submit = canvas.getByRole("button", { name: "Send enquiry" });

    await step(
      "an empty submit shows every message and focuses the first invalid field",
      async () => {
        await tabTo(userEvent, submit);
        await userEvent.keyboard("{Enter}");
        for (const message of REQUIRED_MESSAGES) {
          await expect(await canvas.findByText(message)).toBeVisible();
        }
        await expect(canvas.getByRole("textbox", { name: /^Name/ })).toHaveFocus();
        await expect(args.onSubmit).not.toHaveBeenCalled();
      }
    );

    await step("every field completed from the keyboard submits the parsed values", async () => {
      await userEvent.keyboard("Kavya Menon");

      await tabTo(userEvent, canvas.getByRole("textbox", { name: /^Mobile number/ }));
      await userEvent.keyboard("98765 43210");

      const occasion = canvas.getByRole("combobox", { name: /^Occasion/ });
      await tabTo(userEvent, occasion);
      // A native <select> is operated by the browser itself; user-event cannot drive its
      // keyboard UI, so the value is chosen directly once the control has keyboard focus.
      await userEvent.selectOptions(occasion, "birthday");

      await tabTo(userEvent, canvas.getByLabelText(/^Date/));
      await userEvent.keyboard("2026-10-24");

      const increase = canvas.getByRole("button", { name: /^Increase/ });
      await tabTo(userEvent, increase);
      for (let press = 0; press < 5; press += 1) {
        await userEvent.keyboard("{Enter}");
      }

      await tabTo(userEvent, canvas.getByRole("radio", { name: /^Classic Dawat/ }));
      await userEvent.keyboard("{ArrowDown}");
      await expect(canvas.getByRole("radio", { name: /^Signature Dawat/ })).toBeChecked();

      await tabTo(userEvent, canvas.getByRole("radio", { name: "Mild" }));
      await userEvent.keyboard("{ArrowRight}");
      await expect(canvas.getByRole("radio", { name: "Medium" })).toHaveFocus();
      await userEvent.keyboard(" ");
      await expect(canvas.getByRole("radio", { name: "Medium" })).toBeChecked();

      const delivered = canvas.getByRole("radio", { name: /^Delivered/ });
      await tabTo(userEvent, delivered);
      await userEvent.keyboard(" ");
      await expect(delivered).toBeChecked();

      await tabTo(userEvent, canvas.getByRole("checkbox", { name: /^No onion, no garlic/ }));
      await userEvent.keyboard(" ");

      await tabTo(userEvent, canvas.getByRole("textbox", { name: /^Notes/ }));
      await userEvent.keyboard("Jain thali for four of the guests.");

      await tabTo(userEvent, canvas.getByRole("checkbox", { name: "Reply to me on WhatsApp" }));
      await userEvent.keyboard(" ");

      await tabTo(userEvent, submit);
      await userEvent.keyboard("{Enter}");

      await waitFor(() => expect(args.onSubmit).toHaveBeenCalledOnce());
      await expect(args.onSubmit).toHaveBeenCalledWith({
        name: "Kavya Menon",
        phone: "9876543210",
        occasion: "birthday",
        guests: 15,
        date: "2026-10-24",
        meal: "signature",
        spice: "medium",
        service: "delivered",
        noOnionGarlic: true,
        notes: "Jain thali for four of the guests.",
        consent: true,
      });
      for (const message of REQUIRED_MESSAGES) {
        await expect(canvas.queryByText(message)).toBeNull();
      }
      await expect(await canvas.findByText("Enquiry sent")).toBeVisible();
    });
  },
};
```

(The increase button's name, the stepper's starting value of 10 and five presses to reach the 15-guest minimum come from Task 0 A2; adjust the regex, not the count, if the built name differs.)

Run: `pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- forms.stories 2>&1 | tail -8`
Expected: FAIL — `Failed to resolve import "./enquiry-form"`.

- [ ] **Step 3: The schema and the form**

Create `apps/storybook/src/patterns/enquiry-form.tsx`:

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { Phone } from "lucide-react";
import { Controller, type FieldError, useForm } from "react-hook-form";
import { z } from "zod";

import {
  Alert,
  AutoGrid,
  Button,
  Card,
  CheckCard,
  Checkbox,
  ChipGroup,
  ChoiceCardGroup,
  type ChoiceOption,
  Field,
  type FieldProps,
  Input,
  QuantityStepper,
  Radio,
  RadioGroup,
  Select,
  type SelectOption,
  Stack,
} from "@pink-paprikaa-web/ui";
import { formatRupees } from "@pink-paprikaa-web/utils";

type FieldStatus = NonNullable<FieldProps["status"]>;

/** Catering minimum — the handoff's rates.js `catering.minGuests`. */
const MIN_GUESTS = 15;
const MAX_GUESTS = 500;
/** An Indian mobile: optional +91, then ten digits starting 6–9. */
const INDIAN_MOBILE = /^(?:\+91)?[6-9]\d{9}$/;

/** Every message the form can show — one source for the schema and its tests. */
export const ENQUIRY_MESSAGES = {
  name: "Tell us your name",
  phone: "Enter a 10-digit Indian mobile number",
  occasion: "Choose an occasion",
  guestsMin: `Catering starts at ${String(MIN_GUESTS)} guests`,
  guestsMax: `For more than ${String(MAX_GUESTS)} guests, call us`,
  date: "Pick a date",
  meal: "Choose a dawat",
  spice: "Pick a spice level",
  service: "Choose how it arrives",
  notes: "Keep notes under 500 characters",
  consent: "We need your OK to reply on WhatsApp",
} as const;

const OCCASIONS: SelectOption[] = [
  { value: "birthday", label: "Birthday" },
  { value: "office-lunch", label: "Office lunch" },
  { value: "pooja", label: "Pooja or prasad" },
  { value: "family-function", label: "Family function" },
];

/** The handoff's three dawats (rates.js `catering.dawats`), per head. */
const DAWATS: ChoiceOption[] = [
  {
    value: "classic",
    title: "Classic Dawat",
    price: `${formatRupees(149)} a head`,
    description: "Honest, homely food, and plenty of it.",
  },
  {
    value: "signature",
    title: "Signature Dawat",
    price: `${formatRupees(199)} a head`,
    badge: "Most ordered",
    description: "The one we would put in front of our own family.",
  },
  {
    value: "maharaja",
    title: "Maharaja Dawat",
    price: `${formatRupees(269)} a head`,
    description: "For the days that deserve a proper table.",
  },
];

const SPICE_LEVELS = [
  { value: "mild", label: "Mild" },
  { value: "medium", label: "Medium" },
  { value: "hot", label: "Hot" },
  { value: "extra-hot", label: "Extra Hot" },
];

/** The handoff's service options (rates.js `catering.service`). */
const SERVICES = [
  { value: "delivered", label: "Delivered", description: "Sealed insulated trays." },
  {
    value: "setup",
    label: "Full setup and service",
    description: "Buffet tables, chafing dishes, serving staff and cleanup.",
  },
];

export const enquirySchema = z.object({
  name: z.string().trim().min(1, ENQUIRY_MESSAGES.name),
  phone: z
    .string()
    .transform((value) => value.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(INDIAN_MOBILE, ENQUIRY_MESSAGES.phone)),
  occasion: z.string().min(1, ENQUIRY_MESSAGES.occasion),
  guests: z
    .number()
    .int()
    .min(MIN_GUESTS, ENQUIRY_MESSAGES.guestsMin)
    .max(MAX_GUESTS, ENQUIRY_MESSAGES.guestsMax),
  date: z.string().min(1, ENQUIRY_MESSAGES.date),
  // An unchosen radio group reaches the resolver as null, so the type error carries the message too.
  meal: z.string({ error: ENQUIRY_MESSAGES.meal }).min(1, ENQUIRY_MESSAGES.meal),
  spice: z.string({ error: ENQUIRY_MESSAGES.spice }).min(1, ENQUIRY_MESSAGES.spice),
  service: z.string({ error: ENQUIRY_MESSAGES.service }).min(1, ENQUIRY_MESSAGES.service),
  noOnionGarlic: z.boolean(),
  notes: z.string().max(500, ENQUIRY_MESSAGES.notes),
  consent: z.boolean().refine((isGiven) => isGiven, { error: ENQUIRY_MESSAGES.consent }),
});

export type EnquiryInput = z.input<typeof enquirySchema>;
export type EnquiryValues = z.output<typeof enquirySchema>;

export const ENQUIRY_DEFAULTS: EnquiryInput = {
  name: "",
  phone: "",
  occasion: "",
  guests: 10,
  date: "",
  meal: "",
  spice: "",
  service: "",
  noOnionGarlic: false,
  notes: "",
  consent: false,
};

function statusOf(error: FieldError | undefined): FieldStatus {
  return error === undefined ? "default" : "error";
}

export interface EnquiryFormProps {
  onSubmit: (values: EnquiryValues) => void;
}

/** A catering enquiry on the design system's controls, validated by one Zod schema. */
export function EnquiryForm({ onSubmit }: EnquiryFormProps) {
  const {
    control,
    formState: { errors, isSubmitSuccessful },
    handleSubmit,
    register,
  } = useForm<EnquiryInput, unknown, EnquiryValues>({
    defaultValues: ENQUIRY_DEFAULTS,
    resolver: zodResolver(enquirySchema),
  });

  return (
    <Card padding="lg" className="w-full max-w-article">
      <form
        noValidate
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event);
        }}
      >
        <Stack space={6}>
          <AutoGrid min="sm">
            <Field
              label="Name"
              isRequired
              status={statusOf(errors.name)}
              message={errors.name?.message}
            >
              {(field) => (
                <Input
                  {...field}
                  {...register("name")}
                  autoComplete="name"
                  status={statusOf(errors.name)}
                />
              )}
            </Field>
            <Field
              label="Mobile number"
              hint="We reply on WhatsApp."
              isRequired
              status={statusOf(errors.phone)}
              message={errors.phone?.message}
            >
              {(field) => (
                <Input
                  {...field}
                  {...register("phone")}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  icon={Phone}
                  placeholder="98765 43210"
                  status={statusOf(errors.phone)}
                />
              )}
            </Field>
          </AutoGrid>

          <AutoGrid min="sm">
            <Field
              label="Occasion"
              isRequired
              status={statusOf(errors.occasion)}
              message={errors.occasion?.message}
            >
              {(field) => (
                <Select
                  {...field}
                  {...register("occasion")}
                  options={OCCASIONS}
                  placeholder="Choose an occasion"
                  status={statusOf(errors.occasion)}
                />
              )}
            </Field>
            <Field
              label="Date"
              isRequired
              status={statusOf(errors.date)}
              message={errors.date?.message}
            >
              {(field) => (
                <Input
                  {...field}
                  {...register("date")}
                  type="date"
                  status={statusOf(errors.date)}
                />
              )}
            </Field>
          </AutoGrid>

          <Field
            label="Guests"
            hint={`Catering starts at ${String(MIN_GUESTS)} guests.`}
            isRequired
            status={statusOf(errors.guests)}
            message={errors.guests?.message}
          >
            {() => (
              <Controller
                control={control}
                name="guests"
                render={({ field }) => (
                  <QuantityStepper
                    label="Guests"
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    min={1}
                    max={MAX_GUESTS}
                  />
                )}
              />
            )}
          </Field>

          <Field
            label="Dawat"
            isRequired
            status={statusOf(errors.meal)}
            message={errors.meal?.message}
          >
            {(field) => (
              <ChoiceCardGroup
                id={field.id}
                aria-describedby={field["aria-describedby"]}
                legend="Dawat"
                isLegendHidden
                options={DAWATS}
                min="sm"
                {...register("meal")}
              />
            )}
          </Field>

          <Field
            label="Spice level"
            isRequired
            status={statusOf(errors.spice)}
            message={errors.spice?.message}
          >
            {() => (
              <Controller
                control={control}
                name="spice"
                render={({ field }) => (
                  <ChipGroup
                    type="single"
                    label="Spice level"
                    name={field.name}
                    options={SPICE_LEVELS}
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            )}
          </Field>

          <Field
            label="Service"
            isRequired
            status={statusOf(errors.service)}
            message={errors.service?.message}
          >
            {(field) => (
              <RadioGroup
                id={field.id}
                aria-describedby={field["aria-describedby"]}
                legend="Service"
                isLegendHidden
                status={statusOf(errors.service)}
              >
                {SERVICES.map((service) => (
                  <Radio
                    key={service.value}
                    value={service.value}
                    label={service.label}
                    description={service.description}
                    isInvalid={errors.service !== undefined}
                    {...register("service")}
                  />
                ))}
              </RadioGroup>
            )}
          </Field>

          <CheckCard
            title="No onion, no garlic"
            description="Cooked without onion and garlic for the whole order."
            {...register("noOnionGarlic")}
          />

          <Field
            label="Notes"
            isOptional
            status={statusOf(errors.notes)}
            message={errors.notes?.message}
          >
            {(field) => (
              <Input
                {...field}
                {...register("notes")}
                isMultiline
                rows={3}
                placeholder="Allergies, timings, anything we should know"
                status={statusOf(errors.notes)}
              />
            )}
          </Field>

          <Field
            label="Replies"
            isRequired
            status={statusOf(errors.consent)}
            message={errors.consent?.message}
          >
            {({ id: _labelTarget, ...field }) => (
              <Checkbox
                {...field}
                {...register("consent")}
                label="Reply to me on WhatsApp"
                isInvalid={errors.consent !== undefined}
              />
            )}
          </Field>

          <Button type="submit" size="lg" className="self-start">
            Send enquiry
          </Button>
          {isSubmitSuccessful ? (
            <Alert tone="success" title="Enquiry sent">
              We&apos;ll reply on WhatsApp.
            </Alert>
          ) : null}
        </Stack>
      </form>
    </Card>
  );
}
```

Two deliberate wiring choices, both for accessible names: group controls (ChoiceCardGroup, RadioGroup, ChipGroup, QuantityStepper) name themselves (legend or `label`), so `Field` supplies the visible label and the message and only `aria-describedby` is passed down; the consent checkbox has its own label, so `Field`'s `id` is not given to it (two labels on one input fail axe's `form-field-multiple-labels`).

- [ ] **Step 4: Run to green, probe, gate and commit**

Run the Step 2 command → PASS (one story, two steps, axe included).

Probe (Review Focus 5): remove `noValidate` from the `<form>`; rerun; expect FAIL in step 1 (the browser's own validation blocks the submit, so the schema's messages never appear). Restore; rerun green. Paste both.

```bash
pnpm nx lint @pink-paprikaa-web/storybook --fix 2>&1 | tail -5
pnpm nx run-many -t typecheck lint -p @pink-paprikaa-web/storybook --skip-nx-cache --outputStyle=static 2>&1 | tail -8
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- forms.stories 2>&1 | tail -10
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -4
pnpm nx format:check && pnpm install --frozen-lockfile 2>&1 | tail -2
git add apps/storybook package.json pnpm-lock.yaml
git commit -m "feat(storybook): React Hook Form + Zod pattern on the design system's controls

A catering enquiry with one Zod schema: native-backed controls take
register() unmodified, value-based controls take Controller, Field renders
every message. The story's play submits empty (every message, focus on the
first invalid field), then completes the form from the keyboard and asserts
the parsed values. RHF, the resolvers and Zod are Storybook devDependencies
only (spec D17).

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 14: Docs and records

Every edit below is exact text. "Replace section X" means from that heading to the next heading of the same or higher level. Plan 1 Task 9 already touched 02/05/06/09; this task sets their **final** state, so check each file first and replace rather than append where Plan 1's text overlaps. Never write the git remote's URL anywhere (it contains a name the founder guard bans) — say "`origin` (GitHub)".

**Files:**

- Modify: `docs/engineering/{02-architecture,03-patterns,04-naming-conventions,05-tooling-and-config,06-quality-gates,09-decision-log}.md`, `docs/superpowers/specs/2026-08-07-boilerplate-architecture-design.md`, `docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md` (status line), `CLAUDE.md`, `docs/README.md`
- Replace: `apps/storybook/README.md`, `packages/ui/README.md`

**Dev reference:** `git show dev:apps/storybook/README.md`

**Dev parity:**

| Dev item                                                                                                        | Ruling  | Where / spec clause                                                                                            |
| --------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| Run every CLI command from `apps/storybook`; the root fails with `SB_CORE-SERVER_0006 MainFileMissingError`     | ADD     | Step 9 README (the error code was dropped)                                                                     |
| Commands table incl. story tests, watch mode, one story file, Chromatic                                         | ALREADY | Step 9 README                                                                                                  |
| Story tests: render → `play` → axe; headless Chromium via Playwright, not jsdom, and why; jsdom suite separate  | ADD     | Step 9 README "Story tests"                                                                                    |
| Watch mode starts a dev server on 6006 so failures deep-link to the story                                       | ADD     | Step 9 README "Story tests"                                                                                    |
| "Current state: this target is red" — 200/441 failing, the ten failing contrast pairs                           | DROP    | Spec §5.2–§5.4, C13: text tokens re-pointed; `design-tokens:test` measures every pair; the suite must be green |
| Structural findings `landmark-unique`, `landmark-no-duplicate-banner`, `scrollable-region-focusable`            | ALREADY | Owned by the components (cross-plan); checked before the kits compose them — Task 0 A21, A10                   |
| "The brand pink is not negotiable; text-on-pink is a separate, one-token decision"                              | ALREADY | D3; Step 9 "Accessibility policy"; Colors → Contrast "Changing it"                                             |
| Visual tests (Chromatic) section                                                                                | ALREADY | Step 9 README, verbatim                                                                                        |
| (Plan 1's README, not dev) "The founder guard covers this build" — `relativeDocgenPaths()`, blanked `NODE_PATH` | ADD     | Step 9 README — the replacement would otherwise delete it                                                      |

Implementer: copy this table into your report, extended with anything the plan missed.

**Nothing vanishes (controller ruling R28).** Steps 9 and 10 _replace_ two READMEs. Before replacing
either, diff the current file against the replacement. Every paragraph of the current README that
the replacement lacks is carried over unless it is now false; each one dropped is named in the report
with the reason. Known carry-overs in `apps/storybook/README.md` that are not in the replacement
text above:

- the Fontsource / `@source` scope paragraph;
- the `build` / `serve-static` `nx:noop` alias paragraph.

**Interfaces:** Consumes the built system (Tasks 0–13). Produces the records spec §12 lists.

- [ ] **Step 1: `03-patterns.md` §1 — the canonical component from the real Button**

Replace section `## 1. Component (the base form)` with:

````md
## 1. Component (the base form)

The reference shape is the real Button, `packages/ui/src/atoms/button/button.tsx`, copied here
verbatim when the design system was completed (2026-09-27). If that file changes shape, this
excerpt changes in the same PR.

```tsx
BUTTON_SOURCE;
```

Encoded rules — all CONVENTION unless marked:

- `componentVariants()` owns every class decision; no conditional string concatenation in JSX.
  **Never import `tv` from `tailwind-variants` directly** (LAW-in-practice): the bare instance
  merges against stock Tailwind scales and silently deletes token classes — `text-h1` is read as a
  colour and disappears next to `text-text-muted`. `packages/ui/src/lib/component-variants.ts` is
  the configured instance, and its spec asserts the scale lists against the generated tokens.
- **Only token classes exist** (LAW: `tailwindcss/no-arbitrary-value`, `tailwindcss/no-custom-classname`,
  `pink-paprikaa/no-raw-hex`). `packages/design-tokens` clears the stock scales it replaces, so
  `rounded-lg` is the system's 16px, and `shadow-md`, `bg-red-500` or `max-w-prose` compile to
  nothing or to the wrong thing. A value the scales lack becomes a token first — component tokens
  live in `packages/design-tokens/tokens/component/<name>.json` (`packages/ui/AUTHORING.md`).
- Extend native element props; spread last; `className` merges through `componentVariants()`.
  Every optional custom prop accepts `undefined` (`name?: T | undefined`), so callers can pass an
  optional field straight through under `exactOptionalPropertyTypes`.
- `ref` is a plain prop (React 19) — **no `forwardRef`** (R-03).
- **Named exports, function declarations. No default exports** (R-02) — except framework
  contracts (`page.tsx`, `layout.tsx`, config files, CSF `export default meta`).
- **Surfaces are CSS, not props.** A component that paints a field sets `data-surface`
  (`brand | ink | soft | light`); everything inside re-reads the semantic tokens. Never an
  `on="brand"` prop (spec D5).
- **`asChild` for links and custom elements.** Button, IconButton, Link, Card, LinkCard, ListRow and
  TabBar items take `asChild` (Radix `Slot`), so the app passes `next/link`, a `wa.me` link or `tel:`
  without the system knowing about routers (D8). Components that render **lists** of links take
  `linkAs` (default `"a"`).
- **`Field` wires a control by render prop:** `<Field label hint status message>{(control) => <Input {...control} />}</Field>`
  — `control` is `{ id, "aria-describedby", "aria-invalid", required }`; no context, so Field stays
  server-safe. With react-hook-form, native-backed controls take `{...register("name")}` and
  value-based controls take `<Controller>` (Storybook → Molecules → Field → React Hook Form + Zod).
- **Native first, then Radix.** `<select>`, `<input type="range|date|checkbox|radio">` and
  `<details name>` before any library; Radix only for Dialog/Sheet, Tabs, Tooltip, Toast,
  ToggleGroup and `Slot` (D7). Hand-rolled behaviour is a review reject.
- **Server-first.** `"use client"` only in the smallest file that owns state, effects or browser
  APIs (D6); hover, press and focus are CSS.
- No boolean render forks — `{isX ? <A/> : <B/>}` spanning whole render paths means two components
  or a variant.
- Multi-part components use `componentVariants()` **slots** (the reason tailwind-variants was chosen
  over CVA).
````

Then fill the fence from the real file — the excerpt is canonical because it _is_ the file:

```bash
node -e 'const fs = require("fs"); const doc = "docs/engineering/03-patterns.md";
const source = fs.readFileSync("packages/ui/src/atoms/button/button.tsx", "utf8").trimEnd();
fs.writeFileSync(doc, fs.readFileSync(doc, "utf8").replace("BUTTON_SOURCE", () => source));'
grep -c "BUTTON_SOURCE" docs/engineering/03-patterns.md   # prints 0
```

(Keep §2 onwards; in §2 replace `(\`expect(await axe(container)).toHaveNoViolations()\`)`-style wording, if any survives, with `await expectNoA11yViolations(container)`.)

- [ ] **Step 2: `02-architecture.md` — layers, `lib/`, Storybook**

In §1's table, replace the `packages/ui` row and add an `apps/storybook` row directly after the `apps/web, apps/blog` row:

```md
| `apps/storybook` | The design system's workbench: foundation docs (MDX + specimens), docs-kit helpers, reference kits, patterns. Local + static build only. | `ui`, `content`, `utils`, `design-tokens` |
| `packages/ui` | Presentational components (atoms, molecules, organisms, layouts), `src/lib/` internals, and their stories | `ui` (upward only — LAW; atoms import only `atoms/icon` + `lib`), `utils`, `design-tokens` |
```

Replace section `## 2. Atomic layers inside \`packages/ui\`` with:

```md
## 2. Atomic layers inside `packages/ui` (LAW — `atomic-layering` lint)

`atoms → molecules → organisms → layouts`, imports upward only, and **an atom imports nothing but
`atoms/icon` and `lib/`** — the design system's tier rule, now a gate. `src/lib/` holds library
internals every layer may use: `component-variants.ts` (the configured tailwind-variants),
`brand-artwork.ts` (generated logo paths), `reveal-observer.tsx`, `heading.ts`, `link-as.ts`,
`field-status.ts` and `space.ts`. `src/index.ts` is the one public barrel. Pages are **not** in the
design system — apps (and Storybook's reference kits) compose organisms and layouts with real
content.
```

In §4 "Data flow", add as the first bullet:

```md
- **Design tokens:** `packages/design-tokens/tokens/**` (DTCG) → Style Dictionary → `theme.css`
  (Tailwind `@theme static`), `surfaces.css` (`data-surface` remaps) and `tokens.json` (the
  catalogue) → `packages/ui/src/styles.css`, the one stylesheet consumers import, and Storybook's
  foundation pages. `contrast-pairs.json` is measured on every `design-tokens:test`.
```

In §5, replace item 1 with:

```md
1. Visual building block, reusable, presentational → `packages/ui`, correct atomic layer.
   Docs-only helpers (swatches, token tables, specimens) → `apps/storybook/src/docs-kit`, never
   `packages/ui`.
```

- [ ] **Step 3: `04-naming-conventions.md` — the prop translation table**

Append a new section after §5:

```md
## 6. Props — translating a design-system `.d.ts` (LAW for booleans; CONVENTION otherwise)

Every design-system prop keeps its name and meaning except these translations (spec §8.2):

| Design system prop pattern                               | This system                                                                             |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `icon?: string` (a Lucide name)                          | `icon?: IconComponent` — a `lucide-react` icon or a brand glyph                         |
| `style?: CSSProperties`                                  | `className?: string` (+ native props)                                                   |
| `on?: "light" \| "brand"`                                | removed — surface-aware through `data-surface` (D5)                                     |
| `base?: string` (asset folder)                           | removed — artwork is inlined                                                            |
| boolean `fullWidth`, `loading`, `selected`, `chevron`, … | `isFullWidth`, `isLoading`, `isSelected`, `hasChevron`, … (`is/has` prefixes — LAW)     |
| numeric px `size`/`width`/`min`/`tile`                   | token-backed enums (`size: "sm" \| "md" \| "lg"`, AutoGrid `min: "xs" … "2xl"`)         |
| free CSS strings (`radius`, a tone colour, `measure`)    | token enums only                                                                        |
| `onClick` used for navigation                            | `href` / `asChild`                                                                      |
| `onChange(value)`                                        | `onValueChange(value)` (native-backed controls keep native `onChange` for `register()`) |
| `open` + `onClose`                                       | `open` / `defaultOpen` / `onOpenChange`                                                 |
| `error?: boolean \| string` on a control                 | control `status` + `aria-invalid`; the message is rendered by `Field`                   |
| string-or-object option lists                            | object lists only (`{ value, label }`) — strings are not control flow                   |

Controlled/uncontrolled pairs follow Radix: `value`/`defaultValue`/`onValueChange`,
`checked`/`defaultChecked`/`onCheckedChange`, `open`/`defaultOpen`/`onOpenChange`. Titled
components take `headingLevel`.
```

- [ ] **Step 4: `05-tooling-and-config.md` — registry rows**

Add to the §1 table (keep Plan 1's rows; add only what is missing):

```md
| `packages/design-tokens/contrast-pairs.json` | The contrast policy — every text/background pair the components paint | Adding pairs is free; lowering a `min` is a decision-log event |
| `apps/storybook/.storybook/{main.ts,preview.tsx}` | Stories globs, docs addons, a11y policy, sidebar order, viewports | Sidebar order follows the design system's tab groups; the a11y rule list changes only with spec §5 |
| `apps/storybook/vitest.config.mts` | Story tests in headless Chromium (addon-vitest) | One project; docs-kit contract tests are stories, not a second config |
```

- [ ] **Step 5: `06-quality-gates.md` §2 — the final gate registry**

Replace the §2 table with:

```md
| Gate                   | Tool                                                                                                                                                                                                                                                                                                                                                                                                                   | Blocking where       |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Types                  | `tsc` strict (max flags)                                                                                                                                                                                                                                                                                                                                                                                               | verify, pre-push, CI |
| Lint policy (all LAWs) | ESLint 10 flat config — boundaries, `no-raw-hex`, `atomic-layering` (atoms → molecules → organisms → layouts; atoms import only Icon + lib), `naming-convention` (error), `tailwindcss/no-arbitrary-value` + `no-custom-classname` (token classes only)                                                                                                                                                                | verify, pre-push, CI |
| Unit/component tests   | Vitest + Testing Library + axe (`expectNoA11yViolations` — every rule but `color-contrast`)                                                                                                                                                                                                                                                                                                                            | verify, pre-push, CI |
| Story tests            | `storybook:test` — every story in headless Chromium (`@storybook/addon-vitest`), axe `test: "error"` (every rule but `color-contrast`), `play` interactions; includes the foundation specimens (a missing token fails), Company details (every null fact listed), the Contrast matrix (the exception shown as an exception), the kits at 360px (no sideways scroll) and the React Hook Form + Zod form (keyboard only) | verify, CI           |
| Contrast policy        | `design-tokens:test` over `contrast-pairs.json` — ≥ 4.5, or ≥ 3 only for `brand-fill` over the brand pink                                                                                                                                                                                                                                                                                                              | verify, CI           |
| Token build contract   | `design-tokens:test` (`theme.spec.ts`: namespace resets, references kept, light island restores every override)                                                                                                                                                                                                                                                                                                        | verify, CI           |
| Stylesheet literals    | `ui:test` (`styles.spec.ts`) — no hex/rgb/hsl/oklch in `packages/ui/src/**/*.css`                                                                                                                                                                                                                                                                                                                                      | verify, CI           |
| Brand facts            | `content:test` — the two-`a` literal, GSTIN/FSSAI/CIN/PAN/phone formats, nulls not TODOs, no founder names                                                                                                                                                                                                                                                                                                             | verify, CI           |
| Build                  | `next build` static exports + package builds + `storybook:build`                                                                                                                                                                                                                                                                                                                                                       | verify, pre-push, CI |
| Formatting             | Prettier via `nx format:check`, with `prettier-plugin-tailwindcss` class order                                                                                                                                                                                                                                                                                                                                         | CI, lint-staged      |
| TS project references  | `nx sync:check`                                                                                                                                                                                                                                                                                                                                                                                                        | CI                   |
| E2E + a11y             | Playwright + @axe-core (vs the real export)                                                                                                                                                                                                                                                                                                                                                                            | CI                   |
| Performance/a11y/SEO   | Lighthouse budgets (perf ≥ 0.95, a11y = 1, SEO = 1, LCP ≤ 2.5s, CLS ≤ 0.1, TBT ≤ 200ms, ≤ 1MB total, ≤ 600KB images)                                                                                                                                                                                                                                                                                                   | CI                   |
| Founder-name ban       | `guard:founder` over `apps/web/out`, `apps/blog/out`, `apps/storybook/storybook-static` (incl. sourcemaps, extensionless, svg)                                                                                                                                                                                                                                                                                         | CI                   |
| Commit hygiene         | commitlint + Commitizen                                                                                                                                                                                                                                                                                                                                                                                                | commit-msg hook      |
| Package manager        | only-allow + engines + workspace protocol                                                                                                                                                                                                                                                                                                                                                                              | preinstall           |
```

- [ ] **Step 6: `09-decision-log.md` — final entries and the drift ledger's final state**

First confirm Plan 1 Task 9's rows D1–D18 exist (`grep -cE '^\| D([1-9]|1[0-8]) ' docs/engineering/09-decision-log.md` → `18`); add any missing one from spec §3.1 as a one-line row with the spec link.

Append this section before `## Drift ledger`:

```md
## Design system rewrite — Storybook, kits and records (2026-09-27, Plan 5)

| #    | Decision                                                                                                                                                                                                                                        | Where                                             |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| S-01 | Foundation visuals are hidden specimen stories (`!dev`, `!autodocs`) embedded in MDX, so every docs visual runs in `storybook:test` (axe + `play`); MDX holds prose and blocks only                                                             | `apps/storybook/README.md`                        |
| S-02 | Docs read token values only through `docs-kit/catalogue.ts`; a missing name throws, so a renamed token fails the suite instead of rendering blank                                                                                               | `apps/storybook/src/docs-kit/catalogue.ts`        |
| S-03 | One contrast evaluator (`evaluateContrastPolicy`, `design-tokens/src/contrast.ts`) serves the gate and the Contrast page; `contrast-pairs.json` and the catalogue type are package exports                                                      | spec §5.4                                         |
| S-04 | Docs-kit helpers live in `apps/storybook`, never `packages/ui`; their contract tests are hidden stories in the one story runner — no second Vitest config                                                                                       | handbook 02 §5                                    |
| S-05 | Kits compose only public ui exports; facts from `@pink-paprikaa-web/content`; the four verified Google reviews verbatim (one elision where a guest misspelt the brand); no invented rating or testimonial; every kit badged and tested at 360px | spec §10.1, `apps/storybook/src/kits/fixtures.ts` |
| S-06 | `react-hook-form`, `@hookform/resolvers` and `zod` are Storybook devDependencies only; the "React Hook Form + Zod" story's keyboard-only `play` is the D17 compatibility gate                                                                   | spec D17                                          |
| S-07 | The JSON token files are typed by ambient module declarations (no `resolveJsonModule`), so Storybook's typecheck never depends on `dist/`                                                                                                       | `apps/storybook/src/docs-kit/token-files.d.ts`    |
```

Replace the `## Drift ledger` table with its final state:

```md
| Item                                                                                                               | State                                                                                  | Owner phase           |
| ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | --------------------- |
| `tools/typescript-config` presets unconsumed — wire or retire                                                      | Open                                                                                   | step 2 (web-app spec) |
| `prettier-plugin-tailwindcss` (class sorting) not installed                                                        | Closed 2026-09-27 — installed and configured (D18)                                     | —                     |
| naming-convention promotion warn → error                                                                           | Closed 2026-09-27 — error (P-08)                                                       | —                     |
| eslint-config cleanup cluster (unused eslint-plugin-import, ts-node; .js/.mjs config files carry no TS-lint rules) | Open                                                                                   | step 2 (web-app spec) |
| Interactive `pnpm commit` never smoke-tested end-to-end (inquirer peer)                                            | Open                                                                                   | next touch            |
| Content-integrity gate (link/asset checker beyond Zod)                                                             | Deferred                                                                               | step 2 (web app)      |
| Reference component + real tokens + Storybook stories glob widened already                                         | Closed 2026-09-27 — 90 components, rebuilt tokens, Storybook indexes both source trees | —                     |
| Storybook public hosting                                                                                           | Deferred (D16)                                                                         | Phase 6               |
| `PriceTag` has no canvas size (marketing boards use `SocialHeadline` + `formatRupees`)                             | Open — owner decision                                                                  | step 2                |
```

- [ ] **Step 7: Architecture spec — §8 amendment and §15 Phase 1 progress**

In `docs/superpowers/specs/2026-08-07-boilerplate-architecture-design.md`, insert directly under `## 8. Design system`:

```md
> **Amended 2026-09-27** by the [design system rewrite spec](2026-09-27-design-system-rewrite-design.md),
> implemented on `feat/design-system`. Where this section and that spec disagree, the spec wins:
>
> - Outputs are `theme.css`, `surfaces.css` (the `data-surface` remaps) and `tokens.json`; no
>   `tokens.ts` is produced (no JavaScript consumer — spec §3.3).
> - Tiers are primitive → semantic → component, plus **surface** overrides; the contrast policy
>   (`contrast-pairs.json`) is part of `design-tokens:test`.
> - Atomic layers are `atoms → molecules → organisms → layouts` (not `templates`), with `src/lib/`
>   internals; atoms import only Icon.
> - Native elements first; Radix only for Dialog/Sheet, Tabs, Tooltip, Toast, ToggleGroup and `Slot`.
> - Storybook is its own app (`apps/storybook`), local + static build only — no Netlify site in this
>   phase (D16).
> - The system is 90 components (74 from the design system, 16 derived from the handoff), 33
>   foundation cards across the Brand … Marketing groups, and three reference kits.
```

In §15, directly under the `### Phase 0 progress` paragraph that begins "Phase 0 is complete", add:

```md
_Amended 2026-09-27:_ the branch and remote facts in this subsection are historical. Current branch
and remote state lives in `CLAUDE.md` → Current state.
```

Then insert a new subsection after the Phase 0 progress table's closing paragraphs (before `---` / `## 16`):

```md
### Phase 1 progress

Phase 1 runs in two steps (design system spec, header). Step 1 is complete on
`feat/design-system`, pending the owner's merge decision.

| Item                                                                                                                                                                                                       | Status  | Notes                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | --------------------------------------------------------- |
| Tokens — primitive, semantic, component, surface; contrast policy gate                                                                                                                                     | ✅ done | spec §5–§6; `design-tokens:test`                          |
| Library core — `styles.css` consumer contract, `componentVariants`, lint gates, class order                                                                                                                | ✅ done | spec §6.5, §8.3, §11.2                                    |
| Brand facts (`packages/content`) and formatters (`packages/utils`)                                                                                                                                         | ✅ done | spec §7.3–§7.4                                            |
| 90 components in `packages/ui` — 30 atoms, 38 molecules, 15 organisms, 7 layouts                                                                                                                           | ✅ done | each with test (behaviour + axe) and card-parity stories  |
| Storybook — 13 groups, 33 foundation cards as docs pages, Contrast / Voice & content / Iconography / Utility classes / Section reveal pages, Website / App / Marketing kits, React Hook Form + Zod pattern | ✅ done | `apps/storybook`; local + static build (D16)              |
| Step 2 — the web app (the handoff's nine routes, rates, calculators, SEO, `next/font`, Netlify)                                                                                                            | ⏳ next | its own spec; carried items in the design system spec §16 |
```

And in the §15 roadmap table's Phase 1 row, change the "Contents" cell to `Design tokens populated + full component library — **step 1 done** (see Phase 1 progress); step 2 is the web app`.

- [ ] **Step 8: `CLAUDE.md` — current state (inside the project section only)**

Leave everything between `<!-- nx configuration start-->` and `<!-- nx configuration end-->` untouched. In `## Commands`, add after the `storybook:serve` line:

```bash
pnpm nx run storybook:test            # every story in headless Chromium, axe on
```

and replace the paragraph beginning "`nx affected` compares against `main` by default." with:

```md
`nx affected` compares against `main` by default, so on a feature branch it reports everything that
differs from `main`. CI instead uses `nrwl/nx-set-shas` to diff against the last successful run.
```

Replace section `## Current state` with:

````md
## Current state

**Phase 0 (foundation) is complete. Phase 1 step 1 — the design system — is complete** on
`feat/design-system` (branched from `dev`), pending the owner's merge decision: tokens with the
contrast policy, 90 components in `packages/ui`, and Storybook (`apps/storybook`) with the 13
design-system groups, 33 foundation cards as docs pages, the Website / App / Marketing reference
kits and the React Hook Form + Zod pattern. Spec:
`docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md`. Step 2 (the web app) gets its
own spec.

The item-by-item record lives in **§15 of the architecture spec** ("Phase 0 progress", "Phase 1
progress"). Read it before planning the next step, and update it as items land — it is the only
place that state is tracked, so do not duplicate it here.

The working tree is authoritative if it and that table disagree. To establish ground truth:

```bash
pnpm nx format:check && pnpm nx sync:check   # confirm current state is green
pnpm nx show projects                         # 13 projects
git log --oneline                             # commit messages carry the reasoning
```

Facts that are easy to trip on, all verified against the working tree:

- **Branches:** `main` holds the live site; `dev` is the integration branch; the design system is on
  `feat/design-system`. Nothing merges without `/pre-merge`.
- **`origin` (GitHub) is configured.** CI (`.github/workflows/ci.yml`) runs on pushes to `main` and on
  pull requests; every workflow command is also verified locally before it lands.
- **Storybook:** `pnpm nx run storybook:serve` (6006), `storybook:build`, `storybook:test` (every story in
  headless Chromium, axe on) — local and static build only; public hosting waits for Phase 6.
- **Root `package.json` scripts:** `verify`, `verify:all`, `commit` (`cz`), `format`, `format:check`,
  `guard:founder` (scans `apps/{web,blog}/out` and `apps/storybook/storybook-static`), `prepare`.

**§18 records the traps already hit** during setup — Nx and pnpm defaults that contradict this
spec. Read it before running any generator; four of `create-nx-workspace`'s defaults had to be
undone.

Do not start a later phase before its dependencies (§15) are done.
````

Verify the facts before committing, and correct the text if any differ: `git branch --list main dev feat/design-system`, `git remote` (prints `origin`), `node -p "require('./package.json').scripts['guard:founder']"`.

- [ ] **Step 9: `apps/storybook/README.md`**

Replace the file with (its `## Visual tests (Chromatic)` section is the current file's, unchanged):

````md
# Storybook — the Pink Paprikaa Design System tab

`apps/storybook` is the design system's workbench and its documentation: the thirteen groups of the
design-system folder's "Design System tab", in the same order. Component stories live beside their
components in `packages/ui/src`; everything else lives here. Local and static build only — public
hosting waits for the Phase 6 cutover (spec D16).

Every Storybook CLI command must run from **this directory** (or be given `--config-dir`); there is
no `.storybook` at the workspace root, so `npx storybook <cmd>` from the root fails with
`SB_CORE-SERVER_0006 MainFileMissingError`. The Nx targets below already set `cwd`.

## Commands

| What                                     | Command                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| Dev server (port 6006)                   | `pnpm nx run @pink-paprikaa-web/storybook:serve`                               |
| Static build (`storybook-static/`)       | `pnpm nx run @pink-paprikaa-web/storybook:build`                               |
| Serve the static build                   | `pnpm nx run @pink-paprikaa-web/storybook:serve-static`                        |
| Story tests (every story, once)          | `pnpm nx run @pink-paprikaa-web/storybook:test`                                |
| Story tests, watch mode                  | `pnpm nx run @pink-paprikaa-web/storybook:test -- --watch`                     |
| One story file                           | `pnpm nx run @pink-paprikaa-web/storybook:test -- forms.stories`               |
| Visual tests (Chromatic) — needs a token | `CHROMATIC_PROJECT_TOKEN=… pnpm nx run @pink-paprikaa-web/storybook:chromatic` |

Story tests run in headless Chromium; install it once with `pnpm exec playwright install chromium`.

## Story tests (`@storybook/addon-vitest`)

`vitest.config.mts` turns every story into a Vitest test: it renders the story, runs its `play`
function if it has one, then runs axe against the rendered DOM. The tests run in **headless
Chromium via Playwright**, not jsdom, because focus visibility and computed roles and names need
real layout and a resolved stylesheet. The library's own jsdom suite (`pnpm nx test ui`) is
separate; the two complement each other and neither config touches the other. The `test` target's
cache inputs include `^default`, so a change to any `packages/ui` component or story re-runs it.
Watch mode also starts a Storybook dev server (if none is on port 6006), so failure output can
deep-link to the failing story.

## Groups and where they live

| Group                                                         | Source                                                                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Introduction                                                  | `src/docs/introduction.mdx`                                                                                  |
| Brand · Colors · Type · Spacing · Layout · Motion · Marketing | `src/foundations/<group>/*.mdx`, with the group's specimens in `src/foundations/<group>/<group>.stories.tsx` |
| Atoms · Molecules · Organisms · Layouts                       | `packages/ui/src/<layer>/<name>/<name>.stories.tsx`                                                          |
| Molecules → Field → React Hook Form + Zod                     | `src/patterns/forms.stories.tsx`                                                                             |
| Website · App · Marketing → Kit                               | `src/kits/{website,app,marketing}/`                                                                          |

## Foundation pages

- **Values are read, never typed.** Every token value reaches a page through
  `src/docs-kit/catalogue.ts`, which reads `@pink-paprikaa-web/design-tokens/tokens.json`.
  `token()` and `tokensWithPrefix()` throw on a missing name, so a renamed token fails
  `storybook:test` on the specimen that asked for it.
- **Every live visual is a specimen story.** MDX holds prose and
  `<Canvas of={Specimens.X} meta={Specimens} sourceState="none" />`; the story sits in the group's
  hidden CSF file (`tags: ["!dev", "!autodocs"]` — out of the sidebar, still rendered and tested).
  Keep `className` out of MDX: ESLint cannot see it there.
- **The docs-kit is docs-only** — `Swatch`, `Swatches`, `TokenTable`, `TypeSpecimen`,
  `ContrastMatrix`, `SpacingScale`, `RadiusScale`, `ShadowLadder`, `MotionDemo`, `SpecimenRow`,
  `SpecimenTile`. `packages/ui` never imports it. Its contract tests are
  `src/docs-kit/docs-kit.stories.tsx`.
- Inline `style` here may reference only a token's custom property (`var(--…)` from the catalogue)
  or a value computed from `tokens.json` — never a literal.
- Every design-system guideline card maps to a page, named in a `{/* source: guidelines/<card>.card.html */}`
  comment. Check from the workspace root:

  ```bash
  diff <(ls "zip-files/Pink Paprikaa Design System/guidelines" | sed 's/\.card\.html$//' | sort) \
       <(grep -rhoE 'guidelines/[a-z0-9-]+\.card\.html' apps/storybook/src/foundations | sed -E 's#guidelines/##; s#\.card\.html##' | sort -u)
  ```

## Reference kits

- Composed only from `@pink-paprikaa-web/ui` public exports.
- Facts — year, address, hours, legal lines, contact, outlet — come from `@pink-paprikaa-web/content`;
  the only reviews are the four verified Google reviews, as the guests wrote them
  (`src/kits/fixtures.ts`). No invented testimonial, no rating the business has not been given,
  nothing non-veg — not even egg.
- Every kit page carries the "Reference kit — not production copy" notice and a 360px story whose
  test fails on any sideways scroll.

## Accessibility policy (spec §5)

`preview.tsx` sets `parameters.a11y.test = "error"`: an axe violation fails the story test. Every
rule runs except `color-contrast` — axe cannot scope an exception to the brand's single declared
pair (white on the brand pink, held at the AA-large 3:1 floor). Contrast is owned by the token
policy instead: `packages/design-tokens/contrast-pairs.json`, measured on every
`design-tokens:test` run by the same evaluator that renders **Colors → Contrast**. Storybook itself
disables `region` (stories are fragments, not pages).

## The founder guard covers this build

`pnpm guard:founder` scans `storybook-static` along with the apps' output. Two things would
otherwise leak the builder's home directory into the build, and `.storybook/main.ts` handles both:

- `relativeDocgenPaths()` rewrites react-docgen-typescript's absolute `filePath` to a
  workspace-relative one.
- `env` blanks `NODE_PATH`, which pnpm's bin shims export and Storybook bakes into the manager
  bundles.

Never narrow the guard to make a build pass.

## Visual tests (Chromatic)

The addon is registered and appears in the Storybook sidebar; the `chromatic` target builds
Storybook and hands the static output to the Chromatic CLI. Everything up to the network call is
wired. What is **not** wired, because it cannot be created from here, is the project token.

To take the first baseline:

1. Sign in at <https://www.chromatic.com/start> and create a project for this repository.
2. Copy the project token from the project's **Manage** screen.
3. Put it where the tooling looks for it. Either is fine; `.env` is gitignored:

   ```bash
   # apps/storybook/.env
   CHROMATIC_PROJECT_TOKEN=<token>
   ```

   …or export `CHROMATIC_PROJECT_TOKEN` in the shell / add it as a CI secret.

4. Run the first baseline from the workspace root:

   ```bash
   pnpm nx run @pink-paprikaa-web/storybook:chromatic
   ```

   The first build accepts every snapshot as the baseline; later runs diff against it.

The in-Storybook **Visual Tests** panel uses the same token — open Storybook, click the panel, and
paste the token when it asks. It writes a `chromatic.config.json` here containing the `projectId`
(not the token); that file is safe to commit once it exists. Nothing in this repo fabricates a
token or a project id.
````

- [ ] **Step 10: `packages/ui/README.md` — the consumer contract**

Replace the file with:

````md
# @pink-paprikaa-web/ui

The Pink Paprikaa design system: 90 React 19 components — atoms, molecules, organisms, layouts —
token-driven and server-first. How to author one: [`AUTHORING.md`](AUTHORING.md) (binding).

## Consume it

1. Depend on it: `pnpm add @pink-paprikaa-web/ui --workspace --filter <app>`.
2. Import one stylesheet, after Tailwind — nothing else. The library scans its own sources, so the
   app adds no `@source` for it:

   ```css
   @import "tailwindcss";
   @import "@pink-paprikaa-web/ui/styles.css";
   ```

3. Next.js: add `transpilePackages: ["@pink-paprikaa-web/ui"]` (the package ships TypeScript source).
4. Load the fonts in the app — Poppins 400–800 (+ 600 italic, with the Devanagari subset), DM Sans
   400/500/700 (+ 400 italic), Space Mono 400/700. The font tokens read `var(--font-poppins,
"Poppins")` and friends, so `next/font` variables and Fontsource both work.
5. Import components by name from the one barrel: `import { Button, Field, Input } from "@pink-paprikaa-web/ui";`

## The contract

- **Content arrives as props.** The system has no copy, prices or brand facts of its own —
  `@pink-paprikaa-web/content` holds those, and the app binds them.
- **Surfaces:** a flooded field sets `data-surface="brand" | "ink" | "soft" | "light"`; text, links,
  borders, focus and skins follow. Components that paint a field set it themselves.
- **Navigation:** `asChild` on Button, IconButton, Link, Card, LinkCard, ListRow and TabBar items;
  `linkAs` on components that render lists of links. Pass `next/link`.
- **Forms:** native-backed controls take `{...register("name")}`; value-based controls take
  `<Controller>`; `Field` renders the message. See Storybook → Molecules → Field → React Hook Form + Zod.
- **Client boundary:** only components that own state or effects are `"use client"`; everything else
  renders on the server and ships no JavaScript.

## Develop

| What                         | Command                                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------------------- |
| Tests (jsdom + axe)          | `pnpm nx test @pink-paprikaa-web/ui`                                                      |
| Lint (token classes, layers) | `pnpm nx lint @pink-paprikaa-web/ui`                                                      |
| Stories                      | beside each component here; Storybook is `apps/storybook` — `pnpm nx run storybook:serve` |
| Regenerate the logo artwork  | `pnpm nx run @pink-paprikaa-web/ui:brand-artwork`                                         |

`tailwind.css` at this package's root is not bundled by anything; it exists so ESLint's and
Prettier's Tailwind integrations have a stylesheet to resolve.
````

- [ ] **Step 11: `docs/README.md` and the spec's status line**

In `docs/README.md`'s spec table, set the design-system row's Status cell to `Implemented 2026-09-27 — pending owner merge` and its Scope cell to `**Step 1 of the build** — tokens, 90 components, Storybook (foundations, kits, RHF pattern); sources of truth, conflicts resolved, a11y balance policy`.

In `docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md`, replace the line `**Status:** Draft — awaiting owner review` with `**Status:** Implemented on \`feat/design-system\` (Plans 1–5, 2026-09-27) — awaiting the owner's merge decision`.

- [ ] **Step 12: Gate and commit**

```bash
grep -rniE 'rishav|pandey|anand' CLAUDE.md docs/engineering apps/storybook/README.md packages/ui/README.md docs/README.md; echo "founder grep exit $? (1 = clean)"
grep -n "nx configuration" CLAUDE.md
pnpm nx format:check && pnpm nx sync:check
```

Expected: founder grep exit `1`; both Nx markers still present on their original lines; format and sync green.

```bash
git add CLAUDE.md docs apps/storybook/README.md packages/ui/README.md
git commit -m "docs: record the finished design system

Handbook 02/03/04/05/06/09 at their final state (layers and lib, the real
Button as the canonical component, the prop translation table, the gate
registry, Plan 5 decisions and the closed drift items), the architecture
spec's section 8 amendment and Phase 1 progress, CLAUDE.md's current state,
the Storybook and ui READMEs, and the spec marked implemented.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 15: The final gauntlet, the whole-branch review and the visual sweep

`/pre-merge` (`.claude/commands/pre-merge.md`) run cold, plus spec §11.5's extra gates, a fresh whole-branch review against the spec, and a visual sweep of all thirteen groups. **This task does not merge** — the owner decides; it ends with the evidence table.

**Files:** none planned. Findings are fixed in their own commits (`fix(<scope>): …`), each followed by the affected gate.

**Dev reference:** `git show dev:apps/storybook/.storybook/main.ts` (the `remark-gfm` and react-docgen-typescript comments)

**Dev parity:**

| Dev item                                                                                          | Ruling  | Where / spec clause                                                       |
| ------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------- |
| Regression on record: without `remark-gfm` every Foundations table shipped as raw pipe characters | ADD     | Step 7 sweep fails a docs page whose text shows a raw Markdown table      |
| Regression on record: docgen resolving from the wrong root documented 6 of 69 components          | ADD     | Step 7 sweep fails a `packages/ui` component docs page with no props rows |
| Story tests with axe `test: "error"` over every story                                             | ALREADY | Step 2 `storybook:test --skip-nx-cache`                                   |

Implementer: copy this table into your report, extended with anything the plan missed.

- [ ] **Step 1: Clean tree, formatting, references**

```bash
git status --short                     # must print nothing
pnpm nx format:check && pnpm nx sync:check
```

- [ ] **Step 2: Everything, cold**

```bash
pnpm verify:all --skip-nx-cache --outputStyle=static 2>&1 | tail -30
pnpm nx run @pink-paprikaa-web/design-tokens:test --skip-nx-cache 2>&1 | tail -8
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -5
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache 2>&1 | tail -12
```

Expected: every task green; the story-test summary counts every story file (packages/ui + apps/storybook) with 0 failures.

- [ ] **Step 3: End-to-end, founder guard over fresh output, budgets, lockfile**

```bash
pnpm nx run-many -t e2e 2>&1 | tail -10
pnpm nx run-many -t build && pnpm guard:founder
pnpm nx build @pink-paprikaa-web/web && pnpm exec lhci autorun 2>&1 | tail -10
pnpm install --frozen-lockfile 2>&1 | tail -3
```

Expected: e2e green; `Founder-name guard: clean.` (it scans `apps/storybook/storybook-static`); Lighthouse budgets pass (if no Chrome is available, skip `lhci` and say why in the table — nothing else may be skipped); the frozen install changes nothing.

- [ ] **Step 4: Diff review against the merge base (`dev`)**

```bash
BASE=$(git merge-base dev HEAD)
# Raw hex outside the token package (docs and reference material excluded):
git diff --name-only "$BASE"...HEAD -- . ':!packages/design-tokens/**' ':!docs/**' ':!zip-files/**' ':!pnpm-lock.yaml' \
  | xargs grep -nE '#[0-9a-fA-F]{3,8}\b' 2>/dev/null | grep -vE '^\S+\.md:' ; echo "hex scan done"
# Hand-written versions: every package.json change must be pnpm's (compare with the lockfile):
git diff "$BASE"...HEAD -- '**/package.json' package.json | grep -E '^\+\s+"[^"]+": "[\^~]?[0-9]' ; echo "version lines above must each match pnpm-lock.yaml"
# No project.json, no --no-verify, no egg, no founder names in source:
git ls-files '**/project.json'; echo "project.json scan done"
git log "$BASE"..HEAD --format=%B | grep -i -- '--no-verify'; echo "no-verify scan done"
grep -rniE '\begg' apps/storybook/src packages/ui/src packages/content/src | grep -viE 'egg-free|not even egg|no egg|egg mark|egg-dot'; echo "egg scan done"
grep -rniE 'rishav|pandey|anand' apps packages --include='*.ts' --include='*.tsx' --include='*.mdx' --include='*.json' --include='*.css' \
  -l | grep -v node_modules | grep -v 'scripts/check-founder-names'; echo "founder scan done"
# Scope creep: files outside the spec's §12 list
git diff --stat "$BASE"...HEAD -- apps/web apps/blog packages/seo tools/image-pipeline tools/typescript-config | tail -3
```

Expected: each scan prints only its `… done` line (hex hits in `.md` are excluded by the filter; any other hit is a finding); version lines each correspond to a lockfile entry; the last command shows no changes to the untouched projects (spec §12 "Untouched"), or each change is justified by a baseline repair (§11.3).

- [ ] **Step 5: Drift check (handbook maintenance contract)**

Every decision this branch changed has its handbook edit on this branch: confirm `docs/engineering/{02,03,04,05,06,09}-*.md` appear in `git diff --name-only "$BASE"...HEAD`, and that 09 lists D1–D18 and S-01–S-07. Missing → add it now (Task 14 wording), commit, rerun Steps 1–2.

- [ ] **Step 6: Whole-branch review by a fresh reviewer**

Dispatch a **new** reviewer subagent (superpowers:requesting-code-review — never the implementer's own session) with this brief, the spec path, the contracts path and `git diff "$BASE"...HEAD`:

> Review branch `feat/design-system` against `docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md`. For each of §1's six done-criteria, state met / not met with file:line evidence. Then walk every section — §2 sources (nothing copied from the zip `.jsx`), §3 decisions D1–D18, §4 conflicts C1–C16 as resolved, §5 the accessibility policy (one declared exception, axe everywhere else), §6 token architecture and name mapping, §7 assets/fonts/brand facts, §8 component rules (canonical shape, prop translation, client boundary, no arbitrary values), §9 the 90-component inventory against `packages/ui/src/index.ts`, §10 Storybook (13 groups in order, 33 cards mapped, kit copy rule), §11 gates (each probe-verified), §12 repository changes (and "Untouched"), §16 carried-forward items — and the contracts file's §0–§9. Hard rules: two-`a` Pink Paprikaa, no founder names, no egg, no literal brand hex outside `packages/design-tokens`, no hand-written versions, no `project.json`. Report findings as Critical / Important / Minor with file:line and a one-line fix.

For each finding: fix it (own commit, `fix(<scope>): …`), rerun the affected gate, and send the fix diff back to the **same** reviewer for a scoped re-review. Loop until no Critical or Important remain. A Minor not fixed is added to 09's drift ledger with its owner phase. Record every finding and its resolution for the evidence table.

- [ ] **Step 7: Visual sweep — all thirteen groups at 360 and 1280**

```bash
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -3
mkdir -p /tmp/pp-visual-sweep
pnpm exec serve apps/storybook/storybook-static -l 6007 >/tmp/pp-visual-sweep/serve.log 2>&1 &
SERVE_PID=$!
cd apps/storybook && node --input-type=module <<'SWEEP'
import { chromium } from "playwright";

const BASE = "http://localhost:6007";
const GROUPS = ["Introduction", "Brand", "Colors", "Type", "Spacing", "Layout", "Motion", "Marketing",
  "Atoms", "Molecules", "Organisms", "Layouts", "Website", "App"];
const index = await (await fetch(`${BASE}/index.json`)).json();
const visible = Object.values(index.entries).filter((entry) => (entry.tags ?? []).includes("dev"));
const isKit = (title) => title.startsWith("Website/") || title.startsWith("App/") || title.startsWith("Marketing/Kit/");
const pages = visible.filter((entry) => entry.type === "docs" || isKit(entry.title));
const perGroup = Object.fromEntries(GROUPS.map((group) => [group, pages.filter((p) => p.title.split("/")[0] === group).length]));
const problems = Object.entries(perGroup).filter(([, count]) => count === 0).map(([group]) => `no pages in ${group}`);
const browser = await chromium.launch();
for (const width of [360, 1280]) {
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await context.newPage();
  page.on("pageerror", (error) => problems.push(`${width} ${page.url()} — ${error.message}`));
  for (const entry of pages) {
    const viewMode = entry.type === "docs" ? "docs" : "story";
    await page.goto(`${BASE}/iframe.html?id=${entry.id}&viewMode=${viewMode}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (isKit(entry.title) && entry.type !== "docs" && width === 360 && overflow > 0) {
      problems.push(`${entry.id} overflows by ${overflow}px at 360`);
    }
    if (entry.type === "docs" && width === 1280) {
      // remark-gfm (main.ts): without it an MDX table renders as literal pipes.
      if (await page.evaluate(() => /\|\s*-{3,}/.test(document.body.innerText))) {
        problems.push(`${entry.id} shows a raw Markdown table`);
      }
      // react-docgen-typescript include + tsconfigPath (main.ts): a component page lists its props.
      if (entry.importPath.includes("packages/ui/src/") && (await page.locator(".docblock-argstable-body tr").count()) === 0) {
        problems.push(`${entry.id} has an empty props table`);
      }
    }
    await page.screenshot({ path: `/tmp/pp-visual-sweep/${width}-${entry.id}.png`, fullPage: true });
  }
  await context.close();
}
await browser.close();
console.log(JSON.stringify(perGroup));
console.log(`${pages.length} pages × 2 widths → /tmp/pp-visual-sweep`);
console.log(problems.length === 0 ? "sweep: no page errors, every group present, no kit overflow" : problems.join("\n"));
process.exitCode = problems.length === 0 ? 0 : 1;
SWEEP
cd - && kill $SERVE_PID
```

Expected: every group has ≥ 1 page, `sweep: no page errors, every group present, no kit overflow` — no raw Markdown table on any docs page, and a props table on every component docs page (a component whose props are all native legitimately has none: list it with that reason; any other hit is a docgen finding). Then **look** at the screenshots (open each PNG; the reviewer from Step 6 may split the load by group) and compare foundation pages with their cards and kits with their source pages, served from the zip:

```bash
pnpm exec serve "zip-files/Pink Paprikaa Design System" -l 6008   # guidelines/*.card.html, ui_kits/*/index.html
```

Differences are fixed, or listed with a reason (expected: font rasterisation; copy that became real facts; the V4 token-step sizes). The kits' source pages load React from unpkg; if the sandbox blocks the network, compare against the `Pink Paprikaa Design System/ui_kits/*/README.md` composition tables and say so.

- [ ] **Step 8: The evidence table — and stop**

Write the report as a table, one row per step, each with the actual command and the tail of its output:

| #   | Step                            | Command                                      | Result    | Output tail |
| --- | ------------------------------- | -------------------------------------------- | --------- | ----------- |
| 1   | Clean tree                      | `git status --short`                         | PASS/FAIL |             |
| 2   | Formatting · references         | `nx format:check && nx sync:check`           |           |             |
| 3   | Everything, cold                | `pnpm verify:all --skip-nx-cache`            |           |             |
| 4   | Token gates                     | `design-tokens:test --skip-nx-cache`         |           |             |
| 5   | Storybook build                 | `storybook:build --skip-nx-cache`            |           |             |
| 6   | Story tests                     | `storybook:test --skip-nx-cache`             |           |             |
| 7   | E2E                             | `nx run-many -t e2e`                         |           |             |
| 8   | Founder guard (incl. Storybook) | `nx run-many -t build && pnpm guard:founder` |           |             |
| 9   | Lighthouse budgets              | `nx build web && lhci autorun`               |           |             |
| 10  | Lockfile integrity              | `pnpm install --frozen-lockfile`             |           |             |
| 11  | Diff review                     | Step 4 scans                                 |           |             |
| 12  | Drift check                     | Step 5                                       |           |             |
| 13  | Whole-branch review             | findings → resolutions (count by severity)   |           |             |
| 14  | Visual sweep                    | Step 7 script + manual comparison            |           |             |
| 15  | 33 cards mapped                 | Task 9 Step 3 `diff`                         |           |             |

Any FAIL stops here: fix through the normal loop and rerun from Step 1. With every row PASS, report the table and **do not merge** — the merge (and re-running `pnpm verify:all` on the merged result, and deleting the branch) is the owner's decision under `/pre-merge`'s last paragraph.

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
