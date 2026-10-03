# Design System — Plan 4 of 5: Organisms

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the tier the pages assemble from — the design system's 12 organisms (SiteHeader, SiteFooter, HeroBanner, MenuList, CtaBand, StatBand, TestimonialWall, FaqSection, TabBar, Dialog, CartPanel, OrderTracker) and the 3 handoff-derived ones (ReviewCarousel, ActionDock, QuotePanel) — each with its component tokens, a behaviour + keyboard + axe test, and card-parity stories, composed only from the atoms, molecules and library core of Plans 1–3.

**Architecture:** An organism is a whole section: it sets its own width and rhythm (`container-page`, `section-y`, or a component token for a bespoke rhythm), paints its own field (`data-surface` + a token background, the diamond as an `absolute inset-0` PatternField layer), and carries no content — every string, link, fact and price is a prop. Server components by default; each interactive corner is a tiny `"use client"` leaf in its own file that receives only serialisable props (strings, booleans, pre-rendered `ReactNode`s), so the organism around it stays server-rendered HTML: the header's glass bar (`useSyncExternalStore` on scroll) and menu drawer (Radix Dialog), the carousel's track and controls, the menu's category filter. Dialog and CartPanel are client components as a whole (they own interaction end to end).

**Tech Stack:** React 19.2 (server-first, `useId`, `useSyncExternalStore`) · TypeScript 6 (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`) · Tailwind 4.3 named token utilities · tailwind-variants 3.3 via `componentVariants` · `radix-ui` 1.6.7 (`Dialog`) · lucide-react 1.30 · `@pink-paprikaa-web/utils` (`formatRupees`) · Vitest 4 + Testing Library + user-event 14 + axe-core · Storybook 10.5 (`storybook/test`, viewport globals).

**Spec:** `docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md` — §3 (D5 surfaces, D6 server-first, D8 `asChild`/`linkAs`, D9 no content, D15 CSS-only motion), §4 (C1 header 88/64, C7 pattern density, C8 rhythm), §5 (a11y), §8 (rules, §8.2 prop translation), §9.3 (this tier), §10.2 (stories), §11.1 (definition of done).

**Contracts:** `docs/superpowers/plans/2026-09-27-ds-00-contracts.md` — §7 is implemented here; §1–§6 are consumed exactly. Every departure is in "Contract deviations" below, with its reason.

**Depends on:** Plan 1 (foundation), Plan 2a (atoms I), Plan 2b (atoms II), Plan 2c (layouts), Plan 3a (molecules I), Plan 3b (molecules II) — all merged before Task 0 runs.

## File map (this plan)

```
packages/design-tokens/
  tokens/component/{cta-band,stat-band,hero-banner,faq-section,quote-panel,site-footer,
                    action-dock,tab-bar,dialog,site-header,review-carousel,cart-panel}.json   C
  contrast-pairs.json                                                    M (Task 12: glass header)
packages/ui/
  eslint.config.mjs                                                      M (Task 13: focusable region)
  src/lib/component-variants.ts                                          M (SPACING / TEXT lists)
  src/index.ts                                                           M (one export block per task)
  src/organisms/story-fixtures.ts                                        C (Task 1)
  src/organisms/cta-band/{cta-band,cta-band.test,cta-band.stories}.tsx                  C
  src/organisms/stat-band/{stat-band,stat-band.test,stat-band.stories}.tsx              C
  src/organisms/hero-banner/{hero-banner,hero-banner.test,hero-banner.stories}.tsx      C
  src/organisms/testimonial-wall/{testimonial-wall,…test,…stories}.tsx                  C
  src/organisms/faq-section/{faq-section,…test,…stories}.tsx                            C
  src/organisms/quote-panel/{quote-panel,…test,…stories}.tsx                            C
  src/organisms/order-tracker/{order-tracker,…test,…stories}.tsx                        C
  src/organisms/site-footer/{site-footer,…test,…stories}.tsx                            C
  src/organisms/action-dock/{action-dock,…test,…stories}.tsx                            C
  src/organisms/tab-bar/{tab-bar,…test,…stories}.tsx                                    C
  src/organisms/dialog/{dialog,…test,…stories}.tsx                          C (client)
  src/organisms/site-header/{site-header,site-header-bar,site-header-drawer,…test,…stories}.tsx
                                                                            C (bar + drawer are client leaves)
  src/organisms/review-carousel/{review-carousel,review-carousel-track,…test,…stories}.tsx
                                                                            C (track is a client leaf)
  src/organisms/menu-list/{menu-list,menu-list-filter,…test,…stories}.tsx   C (filter is a client leaf)
  src/organisms/cart-panel/{cart-totals.ts,cart-totals.spec.ts,cart-panel,…test,…stories}.tsx
                                                                            C (panel is client; totals are pure)
  src/layouts/**/*.stories.tsx                                              M (Task 16: real components replace stand-ins)
```

---

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

Organism-tier rules (this plan):

- **Composition.** Organisms import atoms, molecules, `lib/*` and `@pink-paprikaa-web/utils`; never a layout (atomic-layering LAW — this covers the stories and tests in `src/organisms/**` too, so frames in stories use token utilities such as `w-90 h-165`, not `AppShell`). A test or story may import a sibling organism (same tier).
- **Width and rhythm are the organism's.** Full-bleed organisms: root `<section|footer|header>` + inner `container-page`. Vertical rhythm is `section-y` unless the design system or handoff specifies a different one — then it is a component token (`py-cta-band-y`). Background is set on the root; an app that wants a tint behind a light organism passes `className="bg-surface-page-alt"`.
- **Fields and the pattern.** An organism that paints a field sets `data-surface` on its root (brand · ink · soft · light) and a token background. The diamond is `<PatternField aria-hidden tone=… tile=… density=… className="absolute inset-0 bg-transparent" />` as the root's first child; the content wrapper after it carries `relative` so it paints above the layer. The layer paints no ground of its own: PatternField's root carries its tone's `bg-surface-*`, which would cover the organism's ground and hide a caller's override (`className="bg-surface-page-alt"`), so the slot adds `bg-transparent` (twMerge drops the tone background; the mask keeps its tint) and the organism's merge test asserts the layer has `bg-transparent`. `pattern` props use Section's vocabulary: `"none" | "default" | "faint"` (C7).
- **No content (D9).** Every visible string, link, fact and price arrives through props. The only strings a component may default are accessible chrome labels (`menuLabel = "Menu"`, `previousLabel`, `closeLabel`, `skipLinkLabel`, `allLabel`, `wasLabel`), always overridable. Story fixtures hold real copy (`src/organisms/story-fixtures.ts`), never component defaults.
- **Server-first (D6).** No `"use client"` in an organism file unless the contract marks it C (Dialog, CartPanel). An interactive corner is a separate `<organism>-<part>.tsx` client leaf that receives only serialisable props — strings, booleans, and `ReactNode` rendered by the server organism; it never receives a component or a function from it. Effects never set state synchronously (`react-hooks/set-state-in-effect` is an error): subscribe with `useSyncExternalStore`, or set state in event handlers.
- **Links and actions.** Lists of links render through `linkAs` (default `"a"`); a single action is a slot (`action`, `actions`, `drawerActions`) the app fills with `<Button asChild><a …/></Button>`. External links a component owns (social, reviews) are plain `<a target="_blank" rel="noopener noreferrer">`.
- **Headings.** Titled organisms take `headingLevel` and render the heading through `headingTag(level)` (`lib/heading.ts`); nested headings sit one level below.
- **Stacking.** Only the named utilities: `z-header` (sticky header), `z-dock` (ActionDock), `z-overlay` (scrims, sheets, dialogs).
- **Ruling R13 — optional props accept `undefined`.** `exactOptionalPropertyTypes` is on, so every optional custom prop is declared `name?: T | undefined` (as React's own DOM props are), in every interface this plan adds; the atoms and molecules follow the same rule, so an organism forwards a possibly-`undefined` value directly (`href={getItemHref?.(item)}`). Third-party props that do not accept `undefined` (Radix `Dialog.Root`'s `open`, `Portal`'s `container`) get a default (`portalContainer = null`) or keep Radix's own types (`Pick<Dialog.DialogProps, …>`).
- **Reuse Plan 2a's internals where they fit:** `SymbolMark` (`lib/symbol-mark.tsx`) for any decorative diamond; `controlStates` (`lib/control-states.ts`, already inside Button/IconButton/Tag — so an `aria-disabled` IconButton needs no extra classes); `OnSurfaces` (`lib/story-surfaces.tsx`) for surface stories; the `transition-control` utility for pill controls; `buttonVariants` / `tagVariants` when something must look like a Button or Tag.
- **Measures:** never Tailwind's static `max-w-prose` (65ch shadows the 64ch token). Line measures are `max-w-text-measure-prose` / `max-w-text-measure-narrow` (Plan 2a spacing tokens) or Text's `measure` prop; container widths are `max-w-content` / `max-w-article` / `max-w-narrow`.
- **Slot rule:** with `asChild`, classes go on the component (`<Button asChild className=…><a …/></Button>`), never on the slotted child.
- **Ruling R15 — file paths in specs and tests** are `join(import.meta.dirname, "…")` from `node:path`, never `new URL("…", import.meta.url)` (Vite rewrites that to an `http://localhost` URL under Vitest's jsdom environment).
- **Variant props.** A component's public props take `Pick<VariantProps<typeof x>, "tone" | …>` — never the whole `VariantProps` when the variants include internal switches (`isActive`, `hasHiddenLinks`), so those never leak into the API.
- **Class order and import order are tools' jobs.** Before each gate run `pnpm exec prettier --write` on the task's files (prettier-plugin-tailwindcss sorts classes) and `pnpm nx lint @pink-paprikaa-web/ui --fix` (perfectionist sorts imports). Do not hand-sort.
- **Component tokens** go in `packages/design-tokens/tokens/component/<organism>.json`, named `<organism>-<part>`, in the Tailwind namespace of their use: sizes → `spacing` (`w-site-header-logo`, `py-cta-band-y`), font sizes → `text` typography composites (`text-tab-bar-label`). Auto-fit tracks reuse the utilities that exist — Plan 1's `autogrid` (260) and Plan 2c's `autogrid-min-<xs…2xl>` (140–420, the AutoGrid scale; nearest step, spec §15.2); a track no utility covers is a `grid-auto-columns` token (`auto-cols-review-carousel`). Every new `spacing` and `text` name is appended to `SPACING` / `TEXT` in `packages/ui/src/lib/component-variants.ts` (its spec asserts the lists equal the build). A new text/background pair goes in `packages/design-tokens/contrast-pairs.json`.
- **Gate (every task):**

  ```bash
  pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
    && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
    && pnpm nx run @pink-paprikaa-web/storybook:build
  ```

## Review Focus

Five ways an organism fails in the real world. Each is pinned by a test in its owning task; a reviewer checks the test exists and would fail without the behaviour.

1. **The header's menu drawer is a real dialog.** Focus is trapped inside it, Escape closes it, focus returns to the menu button, the page behind cannot scroll while it is open, and following any link in it closes it (so the next page is not covered). — Task 12, test "the drawer traps focus, locks the page, closes on Escape and on any link, and returns focus".
2. **A header with many long links between 1024 and 1279px shortens, never clips or wraps.** Only the first three links stay inline below `xl`; the rest are hidden with `display:none` (not overflowed), every link is `white-space: nowrap`, and whenever a link is hidden the menu button is shown so every link stays reachable in the drawer. — Task 12, test "keeps three links inline below xl, never wrapping, and moves the rest into the drawer".
3. **ReviewCarousel works without a mouse, without motion and with one review.** The track is a focusable region named by the heading; previous/next are `aria-disabled` at the ends (focus stays put); `scrollBy` never forces smooth scrolling (smoothness is `motion-safe:` CSS); nothing auto-advances; a single review renders no controls. — Task 13, tests "…focusable region…", "…disables previous at the start and next at the end…", "…reduced motion…", "…never auto-advances…", "…one review…".
4. **ActionDock never covers the last content or the footer's links, and clears the iOS home indicator.** The mobile bar's bottom padding and the desktop pill's offset include `env(safe-area-inset-bottom)`; `SiteFooter hasDockClearance` pads the legal bar clear of it by more than the dock's height. — Task 9, tests "pads for the iOS home indicator…" and "never covers the footer's last links…" (Task 8 owns the footer's clearance class).
5. **SiteFooter renders exactly what it is given.** No licence number, GSTIN, ©, phone, email or social link appears unless passed — the August port shipped a fake FSSAI number as a default. — Task 8, test "renders exactly what it is given — no licence, tax, contact or social defaults".

## Contract deviations

Recorded against `2026-09-27-ds-00-contracts.md` §7. Additive props keep every contract name and meaning.

| Component                    | Deviation                                                                                                                                                                                                                                                                                                                                                                           | Reason                                                                                                                                                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SiteHeader                   | `+ compactActions?: ReactNode` (shown below `lg`); `actions` show from `lg`                                                                                                                                                                                                                                                                                                         | Handoff `PPHeader`: below 1024px the two text buttons give way to a WhatsApp icon button beside the menu toggle.                                                                                                                 |
| SiteHeader                   | `+ drawerLinks?: NavLink[]` (= `links`)                                                                                                                                                                                                                                                                                                                                             | The handoff drawer lists eight destinations; the inline nav four.                                                                                                                                                                |
| SiteHeader                   | `+ navLabel = "Main"`, `+ skipLinkLabel = "Skip to content"`, `+ closeMenuLabel = "Close menu"`                                                                                                                                                                                                                                                                                     | Accessible chrome labels, overridable — the same pattern as the contract's `menuLabel`.                                                                                                                                          |
| SiteHeader                   | Responsive rule fixed as: inline nav from `lg`, first three links between `lg` and `xl`, all at `xl`; drawer trigger whenever a link is hidden                                                                                                                                                                                                                                      | Spec §9.3 says "xl → lg → md, drawer below md", but the handoff's compact header (lockup + Pure Veg chip + two buttons) does not fit a nav at 768px; the handoff itself switches to the drawer at 1024px.                        |
| SiteFooter                   | `+ pattern?: "none" \| "default" \| "faint"` (default by tone: brand → none, ink → faint)                                                                                                                                                                                                                                                                                           | The design system's pink footer is flat; the handoff's ink footer carries the 4% diamond (C7). Same vocabulary as Section.                                                                                                       |
| SiteFooter                   | `+ hasDockClearance?: boolean`                                                                                                                                                                                                                                                                                                                                                      | Review Focus 4: the legal bar must clear the ActionDock (handoff pads 110px).                                                                                                                                                    |
| SiteFooter                   | `+ headingLevel = 2` (column headings); exports `FooterItem`, `FooterColumn`, `FooterSocialLink`, `FooterPolicy`                                                                                                                                                                                                                                                                    | Spec §5.5: heading levels configurable; named types for the app.                                                                                                                                                                 |
| HeroBanner                   | `+ titleSize?: "display-1" \| "display-2"`                                                                                                                                                                                                                                                                                                                                          | Handoff Catering's long headline is display-2.                                                                                                                                                                                   |
| HeroBanner                   | `+ pattern?` (default by tone: alt → none, others → default)                                                                                                                                                                                                                                                                                                                        | Flooded tones carry the diamond (design system); the handoff's pink-50 heroes are plain.                                                                                                                                         |
| CtaBand                      | `hasPattern?: boolean` → `pattern?: "none" \| "default" \| "faint"` (= `"default"`)                                                                                                                                                                                                                                                                                                 | Handoff ink bands use the faint 4% pattern; one vocabulary with Section, SiteFooter, HeroBanner.                                                                                                                                 |
| MenuList                     | `extends Omit<ComponentProps<"section">, "title">`                                                                                                                                                                                                                                                                                                                                  | The contract's `extends ComponentProps<"section">` conflicts with `title: ReactNode \| null` (native `title` is a string). Same fix for CartPanel.                                                                               |
| MenuList                     | `categories` lists real categories only; `+ allLabel = "All"` (always first)                                                                                                                                                                                                                                                                                                        | "All" is chrome, not a category; a derived list cannot collide with it.                                                                                                                                                          |
| MenuList                     | `+ filterLabel = "Filter the menu"`, `+ overflowLabel?: string`, `+ emptyState?: ReactNode`; `MenuListItem + imageLabel?`                                                                                                                                                                                                                                                           | FilterBar needs an accessible label; the design system's "Also On The Menu" divider and "Nothing matches that yet." empty state are copy, so they arrive as props; `imageLabel` passes through to MenuItemCard/Row placeholders. |
| MenuList                     | Server organism + client `MenuListFilter` leaf that switches between server-rendered per-category panels                                                                                                                                                                                                                                                                            | `renderItemAction` / `getItemHref` are functions: they can run inside a server component but can never be passed into a client one. Only the chosen-category state is client-side.                                               |
| CartPanel                    | `+ emptyTitle?: ReactNode`, `+ emptyBody?: ReactNode` (the panel renders its own symbol EmptyState with `browseAction`)                                                                                                                                                                                                                                                             | "Nothing here yet." / "Let's fix that." are copy; the panel still owns the empty look, as the design system says ("renders its own empty state").                                                                                |
| CartPanel                    | `+ noteField?: ReactNode`, `+ subtotalLabel = "Subtotal"`, `+ taxLabel = "GST"`, `+ totalLabel = "Total"`, `+ note?: ReactNode`, `+ headingLevel = 2`                                                                                                                                                                                                                               | The design system's kitchen-notes Input and "Inclusive of all taxes." are content; summary labels are overridable chrome.                                                                                                        |
| CartPanel                    | `+ cartTotals(lines, gstRate)` + `CartTotals` exported from `cart-totals.ts` (not the client file)                                                                                                                                                                                                                                                                                  | The app labels its pay button "Pay ₹1,239" with the same maths CartPanel renders; a server caller can import it because it is not in a `"use client"` module.                                                                    |
| OrderTracker                 | `+ badge?: ReactNode`, `+ codeLabel = "Order"`, `+ paymentLabel = "Paid"` (the line reads "Paid · UPI"), `+ headingLevel = 2`                                                                                                                                                                                                                                                       | "Preparing"/"Ready" is copy (a slot, like HeroBanner's `badges`); "Order #" and "Paid ·" are overridable chrome.                                                                                                                 |
| ReviewCarousel               | `footerLink + isExternal?: boolean`; controls are `aria-disabled` (not `disabled`) at the ends                                                                                                                                                                                                                                                                                      | A footer link may be internal; a natively disabled button drops keyboard focus to `<body>` the moment the end is reached.                                                                                                        |
| Dialog                       | `+ closeLabel = "Close"`; root props are Radix's own (`Pick<Dialog.DialogProps, "open" \| "defaultOpen" \| "onOpenChange">`)                                                                                                                                                                                                                                                        | The close button needs a name.                                                                                                                                                                                                   |
| Dialog                       | `+ portalContainer?: HTMLElement \| null` (default `document.body`), passed to Radix `Dialog.Portal container` (controller ruling, 2026-09-27)                                                                                                                                                                                                                                      | The App kit renders sheets inside AppShell's `overlay` slot (a `position: relative` frame), as the design system's Dialog note asks ("works inside phone frames").                                                               |
| SiteHeader                   | `+ portalContainer?: HTMLElement \| null` (default `document.body`), forwarded to the drawer's Radix portal (same ruling)                                                                                                                                                                                                                                                           | Kits that frame a whole page render the drawer inside the frame. A DOM element can only come from a client caller; server pages omit it.                                                                                         |
| QuotePanel                   | `+ wasLabel = "was"` (visually hidden before the struck price, lower-case like PriceTag's, R94; drawn with `lib/struck-price`'s `StruckPrice`). `lines` render through KeyValueList (split rows, compact, no dividers) and `total` as its own `<dl>` row — the spec row's "PriceSummary" does not fit: quote values are pre-formatted strings ("₹99 × 40", "25"), not rupee amounts | Screen readers do not announce strike-through.                                                                                                                                                                                   |
| TestimonialWall              | `+ lede?: ReactNode`, passed to SectionHeader (contract delta 1, owner ruling R110)                                                                                                                                                                                                                                                                                                 | Dev parity: the August port's wall took a one-sentence lede under the heading, as SectionHeader already does.                                                                                                                    |
| FaqSection                   | `+ defaultOpen?: string[]` (the answers open on arrival; default the first, `[]` for none), forwarded to Accordion (contract delta 2, R110)                                                                                                                                                                                                                                         | Dev parity: a page that links to one answer opens it; Accordion (Plan 3a) already takes `defaultOpen`.                                                                                                                           |
| FaqSection · Accordion (3a)  | Accordion `+ headingLevel?: HeadingLevel` — each question becomes a heading inside its `<summary>`; omitted, nothing changes (a Plan 3a additive change). FaqSection passes its own level + 1, h6 at most (owner ruling R112)                                                                                                                                                       | Spec §5.5 heading outline: an FAQ's questions are headings under its title. Chromium exposes a heading inside `<summary>` (CDP `Accessibility.getFullAXTree`, batch E), so the outline survives the disclosure.                  |
| OrderTracker                 | `+ progressLabel = "Order progress"` — the step list's accessible name (contract delta 3, R110)                                                                                                                                                                                                                                                                                     | Dev parity: the tracker list was named; an unnamed second list on the screen tells a screen-reader user nothing. Overridable chrome, like `codeLabel`.                                                                           |
| Dialog                       | `+ hasCloseButton = true`; `false` hides the close button only — Escape and the scrim still ask to close through `onOpenChange`, and the caller decides (contract delta 4, R110)                                                                                                                                                                                                    | Dev parity: a decision that must be answered drops the close glyph; such a dialog is controlled and gives its own action buttons (story `MustBeAnswered`).                                                                       |
| Dialog                       | `+ className?: string`, merged onto the panel (contract delta 5, R110)                                                                                                                                                                                                                                                                                                              | Dev parity: every other organism merges a caller class; `DialogProps` does not extend native props, so it is declared.                                                                                                           |
| MenuList                     | `+ defaultCategory?: string` — seeds the client leaf's chosen option; "All" when omitted or not on offer (contract delta 6, R110)                                                                                                                                                                                                                                                   | Dev parity: a page linked from one category opens on it. A string, so it crosses into the client leaf; controlled `category` still cannot (D6).                                                                                  |
| MenuList                     | `+ lede?: ReactNode`, passed to SectionHeader (contract delta 7, R110)                                                                                                                                                                                                                                                                                                              | Dev parity, as TestimonialWall.                                                                                                                                                                                                  |
| TabBar, StatBand, ActionDock | None (StatBand exports `StatBandItem`, TabBar exports `TabBarItem`, ActionDock `DockAction`)                                                                                                                                                                                                                                                                                        | —                                                                                                                                                                                                                                |

**Layout stories.** Plan 2c's layout stories (AppShell, PostFrame, Stack/Cluster demos) use temporary atom-built stand-ins for TabBar, Dialog, FilterBar, MenuItemRow, LoyaltyCard, LogoLockup and OfferSeal. Task 16 replaces them with the real components (layouts are the top tier, so they may import organisms and molecules).

---

### Task 0: Reconcile with the code as built

Plans 2a–3b were written in parallel against the same contracts and executed before this one. This task proves every interface this plan consumes exists as declared and patches this plan's code to reality **before** any organism is written. It changes no product code.

**Files:**

- Read: `packages/ui/src/index.ts`, `packages/ui/src/lib/{component-variants.ts,heading.ts,link-as.ts}`, `packages/ui/src/styles.css`, `packages/ui/eslint.config.mjs`, `packages/ui/vitest.setup.ts`, every consumed component file (list in Step 3), `packages/design-tokens/tokens/component/*.json`, `packages/design-tokens/dist/theme.css`, `apps/storybook/.storybook/preview.tsx`
- Modify (only if a delta is found): this plan file

**Interfaces:**

- Consumes: contracts §1–§6; Plan 1 tokens, utilities, `componentVariants`, `expectNoA11yViolations`, Icon + brand glyphs, Logo.
- Produces: a list of deltas (possibly empty) applied to Tasks 1–15 of this plan, committed before Task 1.

- [ ] **Step 1: Confirm the prerequisite plans are merged and green**

Run:

```bash
git log --oneline | head -60
ls packages/ui/src/atoms packages/ui/src/molecules packages/ui/src/layouts
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static 2>&1 | tail -8
```

Expected: `feat(ui): …` commits for the atoms (2a, 2b), layouts (2c) and molecules (3a, 3b); `packages/ui/src/organisms` does not exist yet; the gate is green. If any prerequisite plan is incomplete, stop — this plan cannot start.

- [ ] **Step 2: Every consumed export exists**

Run:

```bash
node -e '
const fs = require("node:fs");
const index = fs.readFileSync("packages/ui/src/index.ts", "utf8");
const values = ["Text","Link","Logo","Icon","InstagramGlyph","YoutubeGlyph","LinkedinGlyph","PatternField","Button","IconButton","Badge","Card","Divider","ImageSlot","DietMark","PriceTag","StatusDot","Input","Select","Field","SectionHeader","Stat","Accordion","ReviewCard","EmptyState","PriceSummary","QuantityStepper","StepTracker","MenuItemRow","MenuItemCard","FilterBar","Alert","OfferSeal","AnnouncementBar"];
const types = ["IconComponent","ReviewCardProps","AccordionItem","TrackerStep","KeyValueItem","FilterOption","MenuItemImage","StatProps"];
const missing = [...values, ...types].filter((name) => !new RegExp("\\b" + name + "\\b").test(index));
console.log(missing.length ? "MISSING: " + missing.join(", ") : "every consumed export is present");
const lib = ["heading.ts", "link-as.ts", "symbol-mark.tsx", "control-states.ts", "story-surfaces.tsx"].map((f) => "packages/ui/src/lib/" + f);
for (const file of lib) console.log(file, fs.existsSync(file) ? "ok" : "MISSING");
'
rtk proxy grep -n "export" packages/ui/src/lib/heading.ts packages/ui/src/lib/link-as.ts
rtk proxy grep -rln "export interface MenuItemImage\|export interface TrackerStep\|export interface KeyValueItem\|export interface FilterOption\|export interface AccordionItem" packages/ui/src/molecules
```

Expected: "every consumed export is present"; all five lib files ok; `headingTag`, `HeadingLevel`, `LinkAs`, `LinkAsProps`, `SymbolMark` exported. Note the file each molecule type lives in — this plan imports `MenuItemImage` from `molecules/menu-item-row/menu-item-row`, `FilterOption` from `molecules/filter-bar/filter-bar`, `TrackerStep` from `molecules/step-tracker/step-tracker`, `KeyValueItem` from `molecules/key-value-list/key-value-list`, `AccordionItem` from `molecules/accordion/accordion`, `ReviewCardProps` from `molecules/review-card/review-card`. If a type lives elsewhere, replace that import path in every task below.

- [ ] **Step 3: Every consumed prop shape matches the contract**

For each file below, read its exported `…Props` interface (`rtk proxy grep -n "export interface .*Props" -A40 <file>`) and compare with contracts §2–§6. The right column is what this plan relies on beyond the contract — check it in the implementation, not just the type.

| File                                                                          | This plan relies on                                                                                                                                                                                                                                                                                                                                                           |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `atoms/text/text.tsx`                                                         | `variant` incl. `overline` (renders uppercase), `display-1`, `display-2`, `h2`, `h3`, `body-lg`, `body`, `body-sm`, `caption`, `mono`; `isFluid` → the `-fluid` class (`text-display-2-fluid`); `as` incl. `h1`–`h6`, `span`, `div`; `tone` `brand`/`muted`/`subtle`; `weight="bold"`; `measure="narrow"`; `isBalanced`; **resets the base `p` margin** (`m-0`) and max-width |
| `atoms/pattern-field/pattern-field.tsx`                                       | renders correctly as an **empty** decorative layer with `className="absolute inset-0"` (children optional; its own positioning classes merge away); `tone` brand/ink/soft/light; `tile` 56/64/72/80/86; `density` default/faint                                                                                                                                               |
| `atoms/button/button.tsx`                                                     | `asChild` places `icon`/`iconAfter` inside the child `<a>`; `variant` primary/secondary/ghost/inverse; `size` sm/md/lg; `isFullWidth`                                                                                                                                                                                                                                         |
| `atoms/icon-button/icon-button.tsx`                                           | `asChild` places the icon inside a childless `<a aria-label>`; sizes sm 32 / md 40 / lg 48; variants primary/secondary/ghost; spreads `aria-disabled`, `onClick`, Radix trigger props                                                                                                                                                                                         |
| `atoms/link/link.tsx`                                                         | `isExternal` adds `target="_blank"`, `rel` and the arrow glyph                                                                                                                                                                                                                                                                                                                |
| `atoms/card/card.tsx` · `atoms/divider/divider.tsx` · `atoms/badge/badge.tsx` | Card `variant="quiet" padding="sm"`; Divider `variant="diamond"`, `label`; Badge `tone` ink/soft/success/brand with icon children                                                                                                                                                                                                                                             |
| `molecules/section-header/section-header.tsx`                                 | `overline`, `title`, `headingLevel`, `lede`, `action`                                                                                                                                                                                                                                                                                                                         |
| `molecules/accordion/accordion.tsx`                                           | first item open by default; single-open items share a `name`; `isMultiple` omits it                                                                                                                                                                                                                                                                                           |
| `molecules/review-card/review-card.tsx`                                       | `<figure>` root; `variant="brand"` sets `data-surface="brand"`; `isVerified`, `source`                                                                                                                                                                                                                                                                                        |
| `molecules/filter-bar/filter-bar.tsx`                                         | Radix ToggleGroup `type="single"` → a `radiogroup` named by `label`, options `role="radio"`; re-pressing the chosen option is ignored by FilterBar itself (never reports `""`)                                                                                                                                                                                                |
| `molecules/quantity-stepper/quantity-stepper.tsx`                             | DOM order: decrease button, value, increase button (CartPanel's test clicks the last button of a line)                                                                                                                                                                                                                                                                        |
| `molecules/step-tracker/step-tracker.tsx`                                     | `<ol>`; the current step's `<li>` carries `aria-current="step"`                                                                                                                                                                                                                                                                                                               |
| `molecules/stat/stat.tsx` · `molecules/price-summary/price-summary.tsx`       | Stat `tone` brand/inverse, `align="center"`; PriceSummary renders a `<dl>` with `totalLabel` and `note`                                                                                                                                                                                                                                                                       |
| every consumed `…Props` and `lib/link-as.ts`                                  | ruling R13: optional props declared `?: T \| undefined` — this plan forwards possibly-`undefined` values directly (`aria-current`, `href`, `label`, `isExternal`, spread dish fields). Where one is not, add `\| undefined` to that interface (its owning plan's rule) rather than a conditional spread here                                                                  |
| `molecules/offer-seal/offer-seal.tsx`                                         | `size="md"` is the 156px handoff hero seal; `corner` + `bleed="none"` position it in a `relative` container                                                                                                                                                                                                                                                                   |
| `lib/symbol-mark.tsx` · `lib/control-states.ts`                               | `SymbolMark` is decorative (`aria-hidden`) and sized by class; IconButton's `aria-disabled` look comes from `controlStates`                                                                                                                                                                                                                                                   |

Record every delta in a scratch list: `<task> — <what the plan assumed> — <what exists> — <patch>`.

- [ ] **Step 4: Tokens, utilities, conventions**

Run:

```bash
for token in spacing-header spacing-header-compact spacing-tabbar spacing-dock-clearance z-header z-dock z-overlay blur-glass color-surface-glass color-surface-overlay color-surface-page-alt color-surface-brand-soft; do
  printf "%-26s " "$token"; rtk proxy grep -c -- "--$token:" packages/design-tokens/dist/theme.css
done
rtk proxy grep -n "@utility \(container-page\|section-y\|autogrid\|z-header\|z-dock\|z-overlay\|duration-base\|duration-fast\)\|--animate-sheet-in" packages/ui/src/styles.css
ls packages/design-tokens/tokens/component/
rtk proxy grep -n "^const [A-Z_]* = \[" packages/ui/src/lib/component-variants.ts
rtk proxy grep -n "floor360\|  md:\|  lg:\|  xl:\|Organisms" apps/storybook/.storybook/preview.tsx
rtk proxy grep -n "no-noninteractive-tabindex" packages/ui/eslint.config.mjs
```

Expected: every token count is `1`; all eight utilities and `--animate-sheet-in` exist; component token files follow `<component>-<part>` names in `spacing`/`text` (read one, e.g. `button.json`, and match its shape); `component-variants.ts` has `SPACING` and `TEXT` arrays (if Plans 2–3 added other arrays — e.g. `COLOR` — note it; this plan adds no colour tokens); the preview's viewport keys include `floor360`, `md`, `lg`, `xl` and `storySort` contains `Organisms`. Note whether `jsx-a11y/no-noninteractive-tabindex` is already configured (Plan 3b's Table scroll wrapper may have allowed `region`) — Task 13 Step 1 is skipped if so.

- [ ] **Step 4a: Dev parity tables present on every ported-component task**

Run: `rtk proxy grep -c "^\*\*Dev parity:\*\*" docs/superpowers/plans/2026-09-27-ds-04-organisms.md && rtk proxy grep -c "^\*\*Dev reference:\*\* none (handoff component)" docs/superpowers/plans/2026-09-27-ds-04-organisms.md`
Expected: `12`, then `3` — a parity table on each task that ports a `dev` organism (Tasks 1–5, 7, 8, 10–12, 14, 15; contracts §0.0) and the handoff marker on Tasks 6, 9 and 13. A missing table is a delta: stop and report it. Rows marked "pending contract delta" are built only if the controller has ruled them in.

- [ ] **Step 5: Apply the deltas to this plan and commit**

For each recorded delta, edit the affected task's code in this file (import path, prop name, class name, test selector). Then:

```bash
git add docs/superpowers/plans/2026-09-27-ds-04-organisms.md
git commit -m "docs: reconcile plan 4 with the built atoms and molecules

<one line per delta: task — assumed — actual — patch>

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

If there are no deltas, skip the commit and say so in the report.

---

### Task 1: CtaBand (and the organism story fixtures)

**Dev reference:** `git show dev:packages/ui/src/organisms/cta-band/cta-band.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                               | Ruling  | Where / clause                                                                  |
| ---------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------- |
| Overline, heading and body render                                      | ALREADY | test "renders the overline, a level-2 title…"                                   |
| `headingLevel`                                                         | ALREADY | test "takes its heading level from headingLevel"                                |
| The action stays clickable                                             | ADD     | test "keeps the action clickable"                                               |
| Nothing extra without an action                                        | ALREADY | test "renders nothing but the title…" (whole text content)                      |
| Each tone floods its `bg-surface-*` ground                             | ADD     | the tone `it.each` asserts the background class beside `data-surface`           |
| Split: the action sits beside the copy (`shrink-0`)                    | ADD     | test "sits the action beside the copy with align=split"                         |
| Centre: the action stacks under the copy (`justify-center`)            | ADD     | the centre test asserts the action wrapper                                      |
| Type inverts on ink/brand, stays dark on soft (heading colour classes) | DROP    | D5 — text follows `data-surface`, asserted per tone                             |
| Merges a caller `className`                                            | ADD     | test "merges a caller className over its own"                                   |
| axe                                                                    | ALREADY | test "has no accessibility violations"                                          |
| Heading always the fluid `h2` step                                     | ALREADY | `variant="h2" isFluid`                                                          |
| `on="brand"` on the action's Button                                    | DROP    | D5                                                                              |
| "One action, never two"                                                | DROP    | handoff bands carry two actions (D2; `HandoffOfficeStrip`, `HandoffTasteFirst`) |
| Exported `CtaBandTone`                                                 | ALREADY | `CtaBandProps["tone"]`                                                          |
| Stories Default · Split · Centred · Tones · Narrow                     | ALREADY | Playground · InkSplit · BrandCentred · InkSplit/BrandCentred/SoftSplit · Mobile |
| Story HeadingOnly                                                      | ADD     | `HeadingOnly`                                                                   |
| Story WithoutAction                                                    | ADD     | `WithoutAction`                                                                 |
| _(not in dev)_ an empty slot renders no wrapper; a `0` slot does       | ADD     | fold item 18 (`isShown`); tests "renders no wrapper…", "…for a 0 overline…"     |
| _(not in dev)_ a caller's ground shows through the diamond             | ADD     | fold item 21 (`bg-transparent` layer); the merge test                           |

Implementer: copy this table into your report, extended with anything the plan missed.

**Files:**

- Create: `packages/design-tokens/tokens/component/cta-band.json`
- Create: `packages/ui/src/organisms/story-fixtures.ts`
- Create: `packages/ui/src/organisms/cta-band/cta-band.tsx`, `cta-band.test.tsx`, `cta-band.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `PatternField`, `Text`, `Button` (stories), `componentVariants`, `headingTag`/`HeadingLevel`, `ReviewCardProps` (fixtures).
- Produces: `CtaBand`, `CtaBandProps`; `story-fixtures.ts` exports `BRAND`, `GOOGLE_REVIEWS`, `VIEWPORT_360`, `VIEWPORT_768`, `VIEWPORT_1024`, `VIEWPORT_1280` (stories only, not exported from the package).

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/cta-band.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "cta-band-y": {
      "$value": "clamp(48px, 6vw, 72px)",
      "$description": "CtaBand vertical rhythm (design system CtaBand)."
    },
    "cta-band-copy": {
      "$value": "36ch",
      "$description": "Copy measure beside the action in the split layout.",
      "$extensions": { "pink-paprikaa": { "utility": ["max-w"] } }
    }
  }
}
```

In `packages/ui/src/lib/component-variants.ts`, append to `SPACING`:

```ts
  "cta-band-y",
  "cta-band-copy",
```

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && rtk proxy grep -n "cta-band" packages/design-tokens/dist/theme.css`
Expected: `--spacing-cta-band-y: clamp(48px, 6vw, 72px);` and `--spacing-cta-band-copy: 36ch;`.

- [ ] **Step 2: The story fixtures**

`packages/ui/src/organisms/story-fixtures.ts`:

```ts
import type { ReviewCardProps } from "../molecules/review-card/review-card";

/**
 * Real copy for the organism stories: brand facts from
 * `zip-files/Pink Paprikaa Design System/brand.js` (spec C3/C6 applied) and handoff copy from
 * `zip-files/pink-paprikaa-handoff/design/rates.js`.
 *
 * Stories only. No component reads this file — the system carries no content (spec D9); the web
 * app binds the same facts from `@pink-paprikaa-web/content`. Internal links are `#` anchors, so
 * clicking one in a story never navigates the preview away.
 */
export const BRAND = {
  copyright: "© 2026 Paprikaa Culinary Ventures Private Limited",
  fssai: "FSSAI Lic. 10825005001702",
  gstin: "GSTIN 06AAPCP9130L1ZW",
  phoneDisplay: "+91 90907 04001",
  phoneHref: "tel:+919090704001",
  whatsappHref: "https://wa.me/919090704001",
  email: "business@pinkpaprikaa.com",
  emailHref: "mailto:business@pinkpaprikaa.com",
  website: "pinkpaprikaa.com",
  address: "Booth No. 67P, HSVP Market (MKM Market), Sector 57, Gurgaon 122003",
  hours: "8am – 11:30pm, every day",
  payments: "UPI, cards, Pluxee (Sodexo)",
  orderOnlineHref: "https://order.pinkpaprikaa.com",
  directionsHref: "https://maps.google.com/?q=Pink+Paprikaa+Sector+57+Gurgaon",
  instagramHandle: "@pinkpaprikaa",
  instagramHref: "https://instagram.com/pinkpaprikaa",
  youtubeHref: "https://youtube.com/@pinkpaprikaa",
  linkedinHref: "https://linkedin.com/company/pinkpaprikaa",
} as const;

/**
 * The four verified Google reviews (rates.js → google.reviews). Quotes are verbatim, the guests'
 * own spelling included — a review is never edited. One elision ("[…]") removes a guest's one-a
 * spelling of the brand name (ruling R17, the same text as Plan 5's `fixtures.ts`).
 */
export const GOOGLE_REVIEWS: ReviewCardProps[] = [
  {
    name: "Raj Chrome",
    meta: "Restaurant · Google review",
    rating: 5,
    quote:
      "I ordered Mahararaja Thali, steamed Momos and other few extras for the first time. The experience and taste was great😋 A1. Restaurant customer support over phone were well spoken. I will recommend this to my friends. Looking forward to order more […]. Packing was great👌Hatts of Team",
    isVerified: true,
    source: { label: "View on Google", href: "https://maps.app.goo.gl/uGhWvzmZW7To5etbA" },
  },
  {
    name: "Vikas Kumar",
    meta: "Restaurant · Google review",
    rating: 5,
    quote: "Very nice and economical food or very tasty food as home",
    isVerified: true,
    source: { label: "View on Google", href: "https://maps.app.goo.gl/32n6SYDUMejsa3NeA" },
  },
  {
    name: "Abhishek Aggarwal",
    meta: "Restaurant · Google review",
    rating: 4,
    quote: "Good place for indian main course at reasonable price in gurgaon sector 57",
    isVerified: true,
    source: { label: "View on Google", href: "https://maps.app.goo.gl/GB38hi9T2G2UfQdG9" },
  },
  {
    name: "Shrideep Chatterjee",
    meta: "Restaurant · Google review",
    rating: 4,
    quote: "Had Honey chili potato and it was good 👍",
    isVerified: true,
    source: { label: "View on Google", href: "https://maps.app.goo.gl/s1ghZv4qg3f773Gn8" },
  },
];

/** Storybook viewport globals for the review widths (keys from `apps/storybook/.storybook/preview.tsx`). */
export const VIEWPORT_360 = { viewport: { value: "floor360", isRotated: false } };
export const VIEWPORT_768 = { viewport: { value: "md", isRotated: false } };
export const VIEWPORT_1024 = { viewport: { value: "lg", isRotated: false } };
export const VIEWPORT_1280 = { viewport: { value: "xl", isRotated: false } };
```

- [ ] **Step 3: Write the failing test**

`packages/ui/src/organisms/cta-band/cta-band.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { CtaBand } from "./cta-band";

const COPY = {
  overline: "Taste it first",
  title: "If you order, the tasting is free.",
  body: "Take one Dawat as a trial at the normal per-head rate.",
};

const patternLayer = (container: HTMLElement) =>
  container.querySelector('section > [aria-hidden="true"]');

describe("CtaBand", () => {
  it("renders the overline, a level-2 title, the body and the action", () => {
    render(<CtaBand {...COPY} action={<a href="#trial">Book a trial Dawat</a>} />);
    expect(screen.getByRole("heading", { level: 2, name: COPY.title })).toBeInTheDocument();
    expect(screen.getByText(COPY.overline)).toBeInTheDocument();
    expect(screen.getByText(COPY.body)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Book a trial Dawat" })).toBeInTheDocument();
  });

  it("takes its heading level from headingLevel", () => {
    render(<CtaBand title={COPY.title} headingLevel={3} />);
    expect(screen.getByRole("heading", { level: 3, name: COPY.title })).toBeInTheDocument();
  });

  it("renders nothing but the title when nothing else is given — no default copy", () => {
    const { container } = render(<CtaBand title={COPY.title} />);
    expect(container.textContent).toBe(COPY.title);
  });

  it("renders no wrapper for an empty overline, body or action", () => {
    const { container } = render(
      <CtaBand title={COPY.title} overline="" body="" action="" pattern="none" />
    );
    const inner = container.querySelector("section > div");
    expect(inner?.children).toHaveLength(1);
    expect(inner?.firstElementChild?.children).toHaveLength(1);
  });

  it("renders the wrapper for a 0 overline, body or action — a number is content", () => {
    const { container } = render(
      <CtaBand title={COPY.title} overline={0} body={0} action={0} pattern="none" />
    );
    const inner = container.querySelector("section > div");
    expect(inner?.children).toHaveLength(2);
    expect(inner?.firstElementChild?.children).toHaveLength(3);
  });

  it("keeps the action clickable", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <CtaBand
        title={COPY.title}
        action={
          <button type="button" onClick={onClick}>
            Book a trial Dawat
          </button>
        }
      />
    );
    await user.click(screen.getByRole("button", { name: "Book a trial Dawat" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it.each([
    ["ink", "bg-surface-inverse"],
    ["brand", "bg-surface-brand"],
    ["soft", "bg-surface-brand-soft"],
  ] as const)("paints the %s field and sets its surface", (tone, background) => {
    const { container } = render(<CtaBand title={COPY.title} tone={tone} />);
    expect(container.firstElementChild).toHaveAttribute("data-surface", tone);
    expect(container.firstElementChild).toHaveClass(background);
  });

  it("carries the tiled diamond by default and drops it with pattern=none", () => {
    const { container, rerender } = render(<CtaBand title={COPY.title} />);
    expect(patternLayer(container)).toBeInTheDocument();
    rerender(<CtaBand title={COPY.title} pattern="none" />);
    expect(patternLayer(container)).not.toBeInTheDocument();
  });

  it("sits the action beside the copy with align=split (the default)", () => {
    const { container } = render(
      <CtaBand title={COPY.title} pattern="none" action={<a href="#trial">Book a trial Dawat</a>} />
    );
    expect(container.querySelector("section > div")).toHaveClass("justify-between");
    expect(screen.getByRole("link", { name: "Book a trial Dawat" }).parentElement).toHaveClass(
      "shrink-0"
    );
  });

  it("stacks and centres copy and action with align=center", () => {
    const { container } = render(
      <CtaBand
        title={COPY.title}
        align="center"
        pattern="none"
        action={<a href="#trial">Book a trial Dawat</a>}
      />
    );
    expect(container.querySelector("section > div")).toHaveClass("flex-col", "text-center");
    expect(screen.getByRole("link", { name: "Book a trial Dawat" }).parentElement).toHaveClass(
      "justify-center"
    );
  });

  it("merges a caller className over its own, and the diamond layer lets that ground show", () => {
    const { container } = render(<CtaBand title={COPY.title} className="bg-surface-page-alt" />);
    expect(container.firstElementChild).toHaveClass("bg-surface-page-alt");
    expect(container.firstElementChild).not.toHaveClass("bg-surface-inverse");
    expect(patternLayer(container)).toHaveClass("bg-transparent");
    expect(patternLayer(container)).not.toHaveClass("bg-surface-inverse");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <CtaBand {...COPY} tone="brand" action={<a href="#trial">Book a trial Dawat</a>} />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 4: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- cta-band 2>&1 | tail -8`
Expected: FAIL — `Failed to resolve import "./cta-band"`.

- [ ] **Step 5: Implement**

`packages/ui/src/organisms/cta-band/cta-band.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { Text } from "../../atoms/text/text";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { isShown } from "../../lib/is-shown";

const ctaBand = componentVariants({
  slots: {
    root: "relative",
    // A decorative layer only: the band's own ground (or a caller's) shows through it.
    pattern: "absolute inset-0 bg-transparent",
    inner: "relative container-page flex flex-wrap gap-8 py-cta-band-y",
    copy: "flex min-w-0 flex-col gap-2.5",
    action: "flex shrink-0 flex-wrap items-center gap-2.5",
  },
  variants: {
    tone: {
      ink: { root: "bg-surface-inverse" },
      brand: { root: "bg-surface-brand" },
      soft: { root: "bg-surface-brand-soft" },
    },
    align: {
      split: { inner: "items-end justify-between", copy: "max-w-cta-band-copy" },
      center: {
        inner: "flex-col items-center text-center",
        copy: "max-w-text-measure-narrow items-center",
        action: "justify-center",
      },
    },
  },
  defaultVariants: { tone: "ink", align: "split" },
});

export interface CtaBandProps
  extends
    Omit<ComponentProps<"section">, "title">,
    Pick<VariantProps<typeof ctaBand>, "tone" | "align"> {
  overline?: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  /** One or two Buttons — `<Button asChild><a …/></Button>`. */
  action?: ReactNode;
  /** The tiled diamond behind the band; `faint` is the handoff's 4% ink sections (spec C7). */
  pattern?: "none" | "default" | "faint" | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/**
 * The band that closes a page — one per page, never two. Paints its own field (ink, brand or
 * soft) and sets that surface, so the heading, body and buttons inside need no colour props.
 */
export function CtaBand({
  overline,
  title,
  body,
  action,
  tone = "ink",
  align,
  pattern = "default",
  headingLevel = 2,
  className,
  ...props
}: CtaBandProps) {
  const slots = ctaBand({ tone, align });
  return (
    <section data-surface={tone} className={slots.root({ className })} {...props}>
      {pattern === "none" ? null : (
        <PatternField
          aria-hidden
          tone={tone}
          tile={72}
          density={pattern}
          className={slots.pattern()}
        />
      )}
      <div className={slots.inner()}>
        <div className={slots.copy()}>
          {isShown(overline) ? (
            <Text variant="overline" tone="brand">
              {overline}
            </Text>
          ) : null}
          <Text as={headingTag(headingLevel)} variant="h2" isFluid isBalanced>
            {title}
          </Text>
          {isShown(body) ? (
            <Text variant="body-lg" tone="muted">
              {body}
            </Text>
          ) : null}
        </div>
        {isShown(action) ? <div className={slots.action()}>{action}</div> : null}
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- cta-band 2>&1 | tail -8`
Expected: PASS (14 tests).

- [ ] **Step 7: Stories (card parity with `components/organisms/CtaBand.card.html` + handoff bands)**

`packages/ui/src/organisms/cta-band/cta-band.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowRight, MapPin, MessageCircle } from "lucide-react";

import { Button } from "../../atoms/button/button";
import { BRAND, VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { CtaBand } from "./cta-band";

const meta = {
  title: "Organisms/CtaBand",
  component: CtaBand,
  args: {
    overline: "Taste it first",
    title: "If you order, the tasting is free.",
    body: "Take one Dawat as a trial at the normal per-head rate. You only pay if you decide not to go ahead.",
    action: (
      <Button asChild size="lg" icon={MessageCircle}>
        <a href={BRAND.whatsappHref}>Book a trial Dawat</a>
      </Button>
    ),
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          'The band that closes a page — franchise, newsletter, a free tasting. One per page, never two. Copy left and action right (`align="split"`) or stacked and centred. Carries the tiled diamond (`pattern`; `faint` is the handoff\'s 4% ink band). The tone sets the surface, so buttons inside take no colour props.',
      },
    },
  },
} satisfies Meta<typeof CtaBand>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row: `tone="ink"` split. */
export const InkSplit: Story = {
  args: {
    tone: "ink",
    align: "split",
    overline: "Catering",
    title: "Feeding thirty people? It has to be right the first time.",
    body: "Tell us the date and headcount. We take it from there.",
    action: (
      <Button asChild size="lg" iconAfter={ArrowRight}>
        <a href="#dawat-builder">Build your Dawat</a>
      </Button>
    ),
  },
};

/** Card row: `tone="brand"` centred. */
export const BrandCentred: Story = {
  args: {
    tone: "brand",
    align: "center",
    overline: "Office & PG lunch",
    title: "₹99 / ₹119 a meal for your team",
    body: undefined,
    action: (
      <Button asChild variant="inverse" size="lg" icon={MessageCircle}>
        <a href={BRAND.whatsappHref}>Get a free office tasting</a>
      </Button>
    ),
  },
};

/** Card row: `tone="soft"` split. */
export const SoftSplit: Story = {
  args: {
    tone: "soft",
    overline: "Homely Meals",
    title: "Home-style food, delivered every day.",
    body: "Pure veg lunch and dinner from our restaurant kitchen in MKM Market, Sector 57.",
    action: (
      <Button asChild variant="secondary" size="lg">
        <a href="#plans">See plans</a>
      </Button>
    ),
  },
};

/** Handoff Home — the office strip: brand, split, two actions. */
export const HandoffOfficeStrip: Story = {
  args: {
    tone: "brand",
    overline: "Office & PG lunch",
    title: "₹99 / ₹119 a meal for your team",
    body: "20+ meals at one address · fixed slot · one GST invoice a month",
    action: (
      <>
        <Button asChild variant="inverse" size="lg" icon={MessageCircle}>
          <a href={BRAND.whatsappHref}>Get a free office tasting</a>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <a href="#office-lunch">Details</a>
        </Button>
      </>
    ),
  },
};

/** Handoff Catering — "Taste first": ink with the faint 4% diamond. */
export const HandoffTasteFirst: Story = {
  args: {
    tone: "ink",
    pattern: "faint",
    action: (
      <>
        <Button asChild size="lg" icon={MessageCircle}>
          <a href={BRAND.whatsappHref}>Book a trial Dawat</a>
        </Button>
        <Button asChild variant="secondary" size="lg" icon={MapPin}>
          <a href={BRAND.directionsHref}>Eat at the restaurant</a>
        </Button>
      </>
    ),
  },
};

export const WithoutPattern: Story = { args: { pattern: "none" } };

/** No overline and no body — the heading carries the band on its own. */
export const HeadingOnly: Story = { args: { overline: undefined, body: undefined } };

/** A band that only announces — no action. Rare, but the layout holds. */
export const WithoutAction: Story = { args: { action: undefined } };

export const Mobile: Story = { ...HandoffOfficeStrip, globals: VIEWPORT_360 };
export const Tablet: Story = { ...HandoffOfficeStrip, globals: VIEWPORT_768 };
export const Desktop: Story = { ...HandoffOfficeStrip, globals: VIEWPORT_1280 };
```

- [ ] **Step 8: Export**

In `packages/ui/src/index.ts`, add (keep the file's path order — organisms after molecules):

```ts
export { CtaBand, type CtaBandProps } from "./organisms/cta-band/cta-band";
```

- [ ] **Step 9: Format, gate, commit**

Run:

```bash
pnpm exec prettier --write packages/ui/src/organisms packages/design-tokens/tokens/component/cta-band.json packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: green; Storybook lists Organisms/CtaBand with 12 stories.

```bash
git add packages/design-tokens/tokens/component/cta-band.json packages/ui/src/organisms packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): add the CtaBand organism and the organism story fixtures

The page-closing band in ink, brand and soft, split or centred, over the
tiled diamond at the default or the handoff's faint density. Story fixtures
hold the real brand facts and the four verified Google reviews, so no
component ever needs a content default.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 2: StatBand

**Dev reference:** `git show dev:packages/ui/src/organisms/stat-band/stat-band.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                          | Ruling  | Where / clause                                                                             |
| ------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------ |
| Every value and label render                      | ALREADY | test "lists every stat with its value, label and sub-line"                                 |
| A sub-line only on the stat that carries one      | ADD     | test "renders a sub-line only for the stat that carries one"                               |
| One glyph per stat that asks for one              | ADD     | test "draws one glyph per stat that asks for one"                                          |
| Each tone floods its `bg-surface-*` ground        | ADD     | the tone `it.each` asserts the background class                                            |
| Numbers white on brand/ink, pink on soft          | ADD     | test "colours the numbers brand on soft and white on the flooded fields" (all three tones) |
| Every column centred                              | ADD     | test "centres every stat so the row reads as one band"                                     |
| Auto-fit grid survives 360px (`min(200px,100%)`)  | ALREADY | `autogrid-min-sm` test                                                                     |
| Merges a caller `className`                       | ADD     | test "merges a caller className over its own"                                              |
| axe                                               | ALREADY | test "has no accessibility violations"                                                     |
| `label`/`sub` as `string`, `icon` as `LucideIcon` | ALREADY | `ReactNode` / `IconComponent` (D10)                                                        |
| Exported `StatBandTone`                           | ALREADY | `StatBandProps["tone"]`                                                                    |
| Stories Default · Tones · FourAcross · Narrow     | ALREADY | Playground · Soft/Brand/Ink · FourStats · Mobile                                           |
| Story WithIcons                                   | ADD     | `WithIcons`                                                                                |
| Story WithSubLines                                | ADD     | `WithSubLines`                                                                             |
| "4.6 average guest rating", "7 sections" copy     | DROP    | prompt "only real, verifiable numbers" + spec §10.1 (Step 6 note)                          |
| _(not in dev)_ a `0` sub keeps its wrapper        | ADD     | fold item 18 (Stat's `isShown`, which Stat's own tests own for `""`); test "…for a 0 sub…" |
| _(not in dev)_ explicit list semantics            | ADD     | fold item 19 (`role="list"`); the grid test                                                |
| _(not in dev)_ caller ground through the diamond  | ADD     | fold item 21 (`bg-transparent` layer); the merge test                                      |

Implementer: copy this table into your report, extended with anything the plan missed.

**Files:**

- Create: `packages/design-tokens/tokens/component/stat-band.json`
- Create: `packages/ui/src/organisms/stat-band/stat-band.tsx`, `stat-band.test.tsx`, `stat-band.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `PatternField`, `Stat`, `IconComponent`, `componentVariants`; the `autogrid-min-sm` utility (Plan 2c).
- Produces: `StatBand`, `StatBandProps`, `StatBandItem`.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/stat-band.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "stat-band-y": {
      "$value": "clamp(40px, 5vw, 64px)",
      "$description": "StatBand vertical rhythm (design system StatBand)."
    },
    "stat-band-gap": {
      "$value": "clamp(24px, 3vw, 40px)",
      "$description": "Gap between the stats on the band's grid (design system StatBand)."
    }
  }
}
```

Append to `SPACING` in `packages/ui/src/lib/component-variants.ts`:

```ts
  "stat-band-y",
  "stat-band-gap",
```

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && rtk proxy grep -n "stat-band" packages/design-tokens/dist/theme.css`
Expected: `--spacing-stat-band-y` and `--spacing-stat-band-gap`. The track is Plan 2c's `autogrid-min-sm` utility (`repeat(auto-fit, minmax(min(200px, 100%), 1fr))`, the design system's 200px stat minimum), so no track token is needed.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/organisms/stat-band/stat-band.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";
import { Leaf } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { StatBand, type StatBandItem } from "./stat-band";

const STATS: StatBandItem[] = [
  { value: "30", label: "dishes on the Classic plan" },
  { value: "3 km", label: "free delivery radius" },
  { value: "100%", label: "pure vegetarian kitchen", sub: "No egg, no meat, ever" },
];

const patternLayer = (container: HTMLElement) =>
  container.querySelector('section > [aria-hidden="true"]');

describe("StatBand", () => {
  it("lists every stat with its value, label and sub-line", () => {
    render(<StatBand stats={STATS} />);
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("30");
    expect(items[0]).toHaveTextContent("dishes on the Classic plan");
    expect(screen.getByText("No egg, no meat, ever")).toBeInTheDocument();
  });

  it("renders a sub-line only for the stat that carries one", () => {
    render(<StatBand stats={STATS} />);
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items[0]?.textContent).toBe("30dishes on the Classic plan");
    expect(items[2]).toHaveTextContent("No egg, no meat, ever");
  });

  it("renders the sub-line wrapper for a 0 sub — a number is content", () => {
    render(<StatBand stats={[{ value: "3 km", label: "free delivery radius", sub: 0 }]} />);
    expect(screen.getByText("3 km").parentElement?.children).toHaveLength(3);
  });

  it("draws one glyph per stat that asks for one", () => {
    render(
      <StatBand
        stats={STATS.map((stat, index) => (index === 1 ? stat : { ...stat, icon: Leaf }))}
      />
    );
    expect(screen.getByRole("list").querySelectorAll("svg")).toHaveLength(2);
  });

  it.each([
    ["soft", "bg-surface-brand-soft"],
    ["brand", "bg-surface-brand"],
    ["ink", "bg-surface-inverse"],
  ] as const)("paints the %s field and sets its surface", (tone, background) => {
    const { container } = render(<StatBand stats={STATS} tone={tone} />);
    expect(container.firstElementChild).toHaveAttribute("data-surface", tone);
    expect(container.firstElementChild).toHaveClass(background);
  });

  it("colours the numbers brand on soft and white on the flooded fields", () => {
    const { rerender } = render(<StatBand stats={STATS} tone="soft" />);
    expect(screen.getByText("3 km")).toHaveClass("text-text-brand");
    rerender(<StatBand stats={STATS} tone="brand" />);
    expect(screen.getByText("3 km")).toHaveClass("text-text-on-inverse");
    rerender(<StatBand stats={STATS} tone="ink" />);
    expect(screen.getByText("3 km")).toHaveClass("text-text-on-inverse");
  });

  it("centres every stat so the row reads as one band", () => {
    render(<StatBand stats={STATS} />);
    expect(screen.getByText("3 km").parentElement).toHaveClass("text-center");
  });

  it("merges a caller className over its own, and the diamond layer lets that ground show", () => {
    const { container } = render(<StatBand stats={STATS} className="bg-surface-page" />);
    expect(container.firstElementChild).toHaveClass("bg-surface-page");
    expect(container.firstElementChild).not.toHaveClass("bg-surface-brand-soft");
    expect(patternLayer(container)).toHaveClass("bg-transparent");
    expect(patternLayer(container)).not.toHaveClass("bg-surface-brand-soft");
  });

  it("always carries the tiled diamond", () => {
    const { container } = render(<StatBand stats={STATS} />);
    expect(patternLayer(container)).toBeInTheDocument();
  });

  it("lays the stats on the auto-fitting stat grid, an explicit list", () => {
    render(<StatBand stats={STATS} />);
    const list = screen.getByRole("list");
    expect(list).toHaveClass("autogrid-min-sm", "container-page");
    // Safari drops list semantics under `list-style: none` unless the role is explicit.
    expect(list).toHaveAttribute("role", "list");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<StatBand stats={STATS} tone="brand" />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- stat-band 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./stat-band`.

- [ ] **Step 4: Implement**

`packages/ui/src/organisms/stat-band/stat-band.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import type { IconComponent } from "../../atoms/icon/icon";

import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { Stat } from "../../molecules/stat/stat";

export interface StatBandItem {
  value: ReactNode;
  label: ReactNode;
  sub?: ReactNode;
  icon?: IconComponent | undefined;
}

const statBand = componentVariants({
  slots: {
    root: "relative",
    // A decorative layer only: the band's own ground (or a caller's) shows through it.
    pattern: "absolute inset-0 bg-transparent",
    grid: "relative container-page grid autogrid-min-sm gap-stat-band-gap py-stat-band-y",
  },
  variants: {
    tone: {
      soft: { root: "bg-surface-brand-soft" },
      brand: { root: "bg-surface-brand" },
      ink: { root: "bg-surface-inverse" },
    },
  },
  defaultVariants: { tone: "soft" },
});

type StatBandTone = NonNullable<VariantProps<typeof statBand>["tone"]>;

/** Numbers read in brand pink on the soft field and white on the flooded ones (design system). */
const STAT_TONE: Readonly<Record<StatBandTone, "brand" | "inverse">> = {
  soft: "brand",
  brand: "inverse",
  ink: "inverse",
};

export interface StatBandProps
  extends ComponentProps<"section">, Pick<VariantProps<typeof statBand>, "tone"> {
  /** Three or four real, verifiable numbers — more reads as noise. */
  stats: StatBandItem[];
}

/** A proof band of big numbers between two content sections, over the tiled diamond. */
export function StatBand({ stats, tone = "soft", className, ...props }: StatBandProps) {
  const slots = statBand({ tone });
  return (
    <section data-surface={tone} className={slots.root({ className })} {...props}>
      <PatternField aria-hidden tone={tone} tile={80} className={slots.pattern()} />
      <ul role="list" className={slots.grid()}>
        {stats.map((stat, index) => (
          <li key={index}>
            <Stat {...stat} tone={STAT_TONE[tone]} align="center" />
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- stat-band 2>&1 | tail -8`
Expected: PASS (13 tests). The number-colour and centring assertions read Stat's own classes (Plan 3a: `text-text-brand` / `text-text-on-inverse` on the value, `text-center` on the root); if Task 0 found them renamed, use the built names.

- [ ] **Step 6: Stories (card parity with `StatBand.card.html`)**

The card's own numbers ("6 outlets", "4.6 average guest rating") are not true of the brand today (one kitchen; no published rating) and the prompt rule is "only real, verifiable numbers", so the rows use verifiable facts from the handoff.

`packages/ui/src/organisms/stat-band/stat-band.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Clock, Leaf, Truck, UtensilsCrossed } from "lucide-react";

import { VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { StatBand, type StatBandItem } from "./stat-band";

const STATS: StatBandItem[] = [
  { value: "30", label: "dishes on the Classic plan" },
  { value: "3 km", label: "free delivery radius" },
  { value: "100%", label: "pure vegetarian kitchen" },
];

const meta = {
  title: "Organisms/StatBand",
  component: StatBand,
  args: { stats: STATS },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A proof band of big numbers between two content sections. Three or four real, verifiable numbers — never more. Auto-fits to one column on phones.",
      },
    },
  },
} satisfies Meta<typeof StatBand>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row: `tone="soft"` (default). */
export const Soft: Story = { args: { tone: "soft" } };

/** Card row: `tone="brand"`. */
export const Brand: Story = { args: { tone: "brand" } };

/** The third tone named on the card. */
export const Ink: Story = { args: { tone: "ink" } };

export const FourStats: Story = {
  args: { stats: [...STATS, { value: "8 km", label: "free catering delivery" }] },
};

/** Glyphs go on every stat or none — a half-set row reads as a rendering bug. */
export const WithIcons: Story = {
  args: {
    stats: [
      { value: "30", label: "dishes on the Classic plan", icon: UtensilsCrossed },
      { value: "3 km", label: "free delivery radius", icon: Truck },
      { value: "100%", label: "pure vegetarian kitchen", icon: Leaf },
    ],
  },
};

/** The sub-line carries the detail behind a number that needs one. */
export const WithSubLines: Story = {
  args: {
    stats: [
      {
        value: "8am",
        label: "the kitchen opens",
        sub: "Open till 11:30pm, every day",
        icon: Clock,
      },
      {
        value: "3 km",
        label: "free delivery radius",
        sub: "From MKM Market, Sector 57",
        icon: Truck,
      },
      {
        value: "100%",
        label: "pure vegetarian kitchen",
        sub: "No egg, no meat, ever",
        icon: Leaf,
      },
    ],
  },
};

export const Mobile: Story = { globals: VIEWPORT_360 };
export const Tablet: Story = { globals: VIEWPORT_768 };
export const Desktop: Story = { globals: VIEWPORT_1280 };
```

- [ ] **Step 7: Export**

```ts
export { StatBand, type StatBandItem, type StatBandProps } from "./organisms/stat-band/stat-band";
```

- [ ] **Step 8: Format, gate, commit**

```bash
pnpm exec prettier --write packages/ui/src/organisms/stat-band packages/design-tokens/tokens/component/stat-band.json packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
git add packages/design-tokens/tokens/component/stat-band.json packages/ui/src/organisms/stat-band packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): add the StatBand organism

Three or four stats on an auto-fitting grid over the tiled diamond, in the
soft, brand and ink tones; numbers go brand pink on soft and white on the
flooded fields.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 3: HeroBanner

**Dev reference:** `git show dev:packages/ui/src/organisms/hero-banner/hero-banner.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                       | Ruling  | Where / clause                                                                                          |
| ------------------------------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------- |
| The title is the page's `h1`                                                   | ALREADY | test "renders its title as the page's h1 by default"                                                    |
| The title is the fluid display step by default (`text-display-1-fluid`)        | ADD     | test "sets the title in the fluid display-1 step by default"                                            |
| Overline, body and actions render                                              | ALREADY | test "renders the badges, overline, body and actions…"                                                  |
| Every meta fact, diamond between each pair                                     | ALREADY | test "lists the meta facts…"                                                                            |
| Headline ink class per tone                                                    | DROP    | D5 — `data-surface` per tone (tested)                                                                   |
| Default placeholder `imageLabel = "Hero food photography 4:5"`                 | DROP    | D9; contract §7 `media` slot (Playground passes the labelled ImageSlot)                                 |
| `image` / `imageAlt` / `imageCaption` props                                    | DROP    | contract §7 / spec §9.3 `media` slot (ImageSlot + overlays)                                             |
| Caption on the `scrim-bottom` over a real photograph, never over a placeholder | ADD     | story `WithPhotograph` composes it in the media slot                                                    |
| Centred layout shows no image                                                  | ALREADY | `media` renders only when passed (SoftCentred passes none)                                              |
| Split tracks stack the photo under the copy at 360px                           | ALREADY | test "sets the split media beside the copy from lg and stacks it below…" (one column below `lg`)        |
| Merges a caller `className`                                                    | ADD     | test "merges a caller className over its own"                                                           |
| axe                                                                            | ALREADY | test "has no accessibility violations"                                                                  |
| `variant` split/center                                                         | ALREADY | contract `layout`                                                                                       |
| `on="brand"` on the actions                                                    | DROP    | D5                                                                                                      |
| "Est. 2019"                                                                    | DROP    | C3 — established 2025                                                                                   |
| Stories Default · Tones · Centred · Soft · AwaitingPhotography · Smallest      | ALREADY | Playground · BrandSplit/InkSplit · SoftCentred · SoftCentred · Playground (labelled ImageSlot) · Mobile |
| Story HeadlineOnly                                                             | ADD     | `HeadlineOnly`                                                                                          |
| Story WithPhotograph                                                           | ADD     | `WithPhotograph`                                                                                        |
| _(not in dev)_ an empty slot renders no wrapper; a `0` slot does               | ADD     | fold item 18 (`isShown`); tests "renders no wrapper…", "renders the wrapper for a 0…"                   |
| _(not in dev)_ an empty meta fact renders no item and no diamond               | ADD     | `isShown` filter; test "skips an empty meta fact…"                                                      |
| _(not in dev)_ explicit list semantics on the meta row                         | ADD     | fold item 19 (`role="list"`); the meta test                                                             |
| _(not in dev)_ a caller's ground shows through the diamond                     | ADD     | fold item 21 (`bg-transparent` layer); the merge test                                                   |
| _(not in dev)_ pattern defaults per tone; `none` and `faint` honoured          | ADD     | tests "carries the diamond on the %s field…", "carries no diamond on the alt tint…", "hands the faint…" |

Implementer: copy this table into your report, extended with anything the plan missed.

**Files:**

- Create: `packages/design-tokens/tokens/component/hero-banner.json`
- Create: `packages/ui/src/organisms/hero-banner/hero-banner.tsx`, `hero-banner.test.tsx`, `hero-banner.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `SymbolMark` (`lib/symbol-mark`, Plan 2a — the meta diamond), `PatternField`, `Text`, `componentVariants`, `headingTag`; stories: `Badge`, `Button`, `DietMark`, `Icon`, `ImageSlot`, `OfferSeal`.
- Produces: `HeroBanner`, `HeroBannerProps`.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/hero-banner.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "hero-banner-y": {
      "$value": "clamp(28px, 6vw, 80px)",
      "$description": "Hero vertical rhythm (handoff Home and Catering heroes; tighter than section-y so the fold holds the headline and actions on phones)."
    },
    "hero-banner-gap": {
      "$value": "clamp(24px, 5vw, 64px)",
      "$description": "Gap between the copy and the media column."
    }
  }
}
```

Append to `SPACING`:

```ts
  "hero-banner-y",
  "hero-banner-gap",
```

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && rtk proxy grep -c "hero-banner" packages/design-tokens/dist/theme.css`
Expected: `2`.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/organisms/hero-banner/hero-banner.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { HeroBanner } from "./hero-banner";

const TITLE = "Desi at heart. Urban by nature.";
const META = ["Est. 2025", "Sector 57, Gurgaon", "Open till 11:30pm"];

const patternLayer = (container: HTMLElement) =>
  container.querySelector('section > [aria-hidden="true"]');

describe("HeroBanner", () => {
  it("renders its title as the page's h1 by default", () => {
    render(<HeroBanner title={TITLE} />);
    expect(screen.getByRole("heading", { level: 1, name: TITLE })).toBeInTheDocument();
  });

  it("takes its heading level from headingLevel", () => {
    render(<HeroBanner title={TITLE} headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2, name: TITLE })).toBeInTheDocument();
  });

  it("sets the title in the fluid display-1 step by default, so it never overflows", () => {
    render(<HeroBanner title={TITLE} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("text-display-1-fluid");
  });

  it("renders the badges, overline, body and actions it is given — and nothing else", () => {
    const { container } = render(
      <HeroBanner
        badges={<span>Pure Veg</span>}
        overline="Homely Meals"
        title={TITLE}
        body="Pure veg lunch and dinner."
        actions={<a href="#plans">See plans</a>}
        pattern="none"
      />
    );
    expect(screen.getByRole("link", { name: "See plans" })).toBeInTheDocument();
    expect(container.textContent).toBe(
      `Pure VegHomely Meals${TITLE}Pure veg lunch and dinner.See plans`
    );
  });

  it("renders no wrapper for an empty badges, overline, body, actions or media slot", () => {
    const { container } = render(
      <HeroBanner badges="" overline="" title={TITLE} body="" actions="" media="" pattern="none" />
    );
    const inner = container.querySelector("section > div");
    expect(inner?.children).toHaveLength(1);
    expect(inner?.firstElementChild?.children).toHaveLength(1);
  });

  it("renders the wrapper for a 0 badges, overline, body, actions or media — a number is content", () => {
    const { container } = render(
      <HeroBanner
        badges={0}
        overline={0}
        title={TITLE}
        body={0}
        actions={0}
        media={0}
        pattern="none"
      />
    );
    const inner = container.querySelector("section > div");
    expect(inner?.children).toHaveLength(2);
    expect(inner?.firstElementChild?.children).toHaveLength(5);
  });

  it("lists the meta facts with a decorative diamond between each pair", () => {
    render(<HeroBanner title={TITLE} meta={META} />);
    const list = screen.getByRole("list");
    // Safari drops list semantics under `list-style: none` unless the role is explicit.
    expect(list).toHaveAttribute("role", "list");
    const facts = within(list)
      .getAllByRole("listitem")
      .map((item) => item.textContent);
    expect(facts).toEqual(META);
    // SymbolMark is a masked `<span>`, not an svg.
    expect(list.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
  });

  it("skips an empty meta fact — no bare item, no stray diamond — and a list of none", () => {
    const { rerender } = render(
      <HeroBanner title={TITLE} meta={["Est. 2025", "", "Sector 57, Gurgaon"]} />
    );
    const list = screen.getByRole("list");
    const facts = within(list)
      .getAllByRole("listitem")
      .map((item) => item.textContent);
    expect(facts).toEqual(["Est. 2025", "Sector 57, Gurgaon"]);
    expect(list.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
    rerender(<HeroBanner title={TITLE} meta={["", null]} />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("puts the media slot in a positioned column for overlays such as an OfferSeal", () => {
    render(
      <HeroBanner
        title={TITLE}
        media={<img src="hero.jpg" alt="A Homely Meals box" width={400} height={300} />}
      />
    );
    expect(screen.getByRole("img", { name: "A Homely Meals box" }).parentElement).toHaveClass(
      "relative",
      "min-w-0"
    );
  });

  it.each([
    ["brand", "brand"],
    ["ink", "ink"],
    ["soft", "soft"],
    ["alt", "light"],
  ] as const)("tone %s sets the %s surface", (tone, surface) => {
    const { container } = render(<HeroBanner title={TITLE} tone={tone} />);
    expect(container.firstElementChild).toHaveAttribute("data-surface", surface);
  });

  it.each(["brand", "ink", "soft"] as const)(
    "carries the diamond on the %s field by default",
    (tone) => {
      const { container } = render(<HeroBanner title={TITLE} tone={tone} />);
      expect(patternLayer(container)).toBeInTheDocument();
    }
  );

  it("carries no diamond on the alt tint unless asked, nor on a flooded field with pattern=none", () => {
    const { container, rerender } = render(<HeroBanner title={TITLE} tone="alt" />);
    expect(patternLayer(container)).not.toBeInTheDocument();
    rerender(<HeroBanner title={TITLE} tone="alt" pattern="faint" />);
    expect(patternLayer(container)).toBeInTheDocument();
    rerender(<HeroBanner title={TITLE} tone="brand" pattern="none" />);
    expect(patternLayer(container)).not.toBeInTheDocument();
  });

  it("hands the faint density to the diamond", () => {
    const { container, rerender } = render(<HeroBanner title={TITLE} tone="ink" pattern="faint" />);
    const tint = () => patternLayer(container)?.firstElementChild;
    expect(tint()).toHaveClass("pattern-opacity-faint");
    rerender(<HeroBanner title={TITLE} tone="ink" />);
    expect(tint()).toHaveClass("pattern-opacity-default");
  });

  it("sets the split media beside the copy from lg and stacks it below; center has one column", () => {
    const { container, rerender } = render(<HeroBanner title={TITLE} pattern="none" />);
    const inner = () => container.querySelector("section > div");
    expect(inner()).toHaveClass("grid", "lg:grid-cols-2");
    expect(inner()?.className).not.toMatch(/(^|\s)grid-cols-/);
    rerender(<HeroBanner title={TITLE} layout="center" pattern="none" />);
    expect(inner()).not.toHaveClass("lg:grid-cols-2");
  });

  it("uses the display-2 ramp for a long headline", () => {
    render(
      <HeroBanner
        title="Feeding thirty people? It has to be right the first time."
        titleSize="display-2"
      />
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("text-display-2-fluid");
  });

  it("centres everything with layout=center", () => {
    const { container } = render(<HeroBanner title={TITLE} layout="center" pattern="none" />);
    expect(container.querySelector("section > div")).toHaveClass("text-center");
  });

  it("merges a caller className over its own, and the diamond layer lets that ground show", () => {
    const { container } = render(<HeroBanner title={TITLE} className="bg-surface-page" />);
    expect(container.firstElementChild).toHaveClass("bg-surface-page");
    expect(container.firstElementChild).not.toHaveClass("bg-surface-brand");
    expect(patternLayer(container)).toHaveClass("bg-transparent");
    expect(patternLayer(container)).not.toHaveClass("bg-surface-brand");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <HeroBanner
        overline="India's First Desi Urban Café"
        title={TITLE}
        meta={META}
        actions={<a href="#order">Order Now</a>}
        media={<img src="hero.jpg" alt="Chilli paneer" width={400} height={500} />}
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- hero-banner 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./hero-banner`.

- [ ] **Step 4: Implement**

`packages/ui/src/organisms/hero-banner/hero-banner.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { Text } from "../../atoms/text/text";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { isShown } from "../../lib/is-shown";
import { SymbolMark } from "../../lib/symbol-mark";

const heroBanner = componentVariants({
  slots: {
    root: "relative",
    // A decorative layer only: the hero's own ground (or a caller's) shows through it.
    pattern: "absolute inset-0 bg-transparent",
    inner: "relative container-page grid items-center gap-hero-banner-gap py-hero-banner-y",
    copy: "flex min-w-0 flex-col gap-5",
    badges: "flex flex-wrap gap-2",
    actions: "flex flex-wrap gap-3",
    meta: "flex flex-wrap items-center gap-x-4.5 gap-y-2",
    metaItem: "flex items-center gap-4.5",
    metaMark: "size-3 opacity-80",
    media: "relative min-w-0",
  },
  variants: {
    tone: {
      // The diamond between meta facts: white on the dark fields, brand pink on the light ones.
      brand: { root: "bg-surface-brand", metaMark: "text-ink-000" },
      ink: { root: "bg-surface-inverse", metaMark: "text-ink-000" },
      soft: { root: "bg-surface-brand-soft", metaMark: "text-pink-500" },
      alt: { root: "bg-surface-page-alt", metaMark: "text-pink-500" },
    },
    layout: {
      split: { inner: "lg:grid-cols-2" },
      center: {
        inner: "justify-items-center text-center",
        copy: "max-w-article items-center",
        badges: "justify-center",
        actions: "justify-center",
        meta: "justify-center",
      },
    },
  },
  defaultVariants: { tone: "brand", layout: "split" },
});

type HeroTone = NonNullable<VariantProps<typeof heroBanner>["tone"]>;
type HeroPattern = "none" | "default" | "faint";

/** The surface each tone paints; `alt` is the handoff's pink-50 tint, a light surface. */
const SURFACE: Readonly<Record<HeroTone, "brand" | "ink" | "soft" | "light">> = {
  brand: "brand",
  ink: "ink",
  soft: "soft",
  alt: "light",
};

/** Flooded tones carry the diamond (design system); the alt tint is plain (handoff heroes). */
const DEFAULT_PATTERN: Readonly<Record<HeroTone, HeroPattern>> = {
  brand: "default",
  ink: "default",
  soft: "default",
  alt: "none",
};

export interface HeroBannerProps
  extends
    Omit<ComponentProps<"section">, "title">,
    Pick<VariantProps<typeof heroBanner>, "tone" | "layout"> {
  overline?: ReactNode;
  /** Badge row above the title (handoff): the product badge and the Pure Veg badge. */
  badges?: ReactNode;
  title: ReactNode;
  /** `display-2` for a long headline (handoff Catering). */
  titleSize?: "display-1" | "display-2" | undefined;
  headingLevel?: HeadingLevel | undefined;
  body?: ReactNode;
  /** One or two Buttons. */
  actions?: ReactNode;
  /** Short facts separated by the brand diamond, e.g. `["Est. 2025", "Sector 57, Gurgaon"]`. */
  meta?: ReactNode[] | undefined;
  /** The image column — an ImageSlot plus any overlay (an OfferSeal positions itself on it). */
  media?: ReactNode;
  /** Defaults to `default` on brand/ink/soft and `none` on alt. */
  pattern?: HeroPattern | undefined;
}

/** The top of a marketing page: headline (fluid display type, never overflows), actions, facts, media. */
export function HeroBanner({
  overline,
  badges,
  title,
  titleSize = "display-1",
  headingLevel = 1,
  body,
  actions,
  meta = [],
  media,
  tone = "brand",
  layout,
  pattern,
  className,
  ...props
}: HeroBannerProps) {
  const slots = heroBanner({ tone, layout });
  const density = pattern ?? DEFAULT_PATTERN[tone];
  const facts = meta.filter(isShown);
  return (
    <section data-surface={SURFACE[tone]} className={slots.root({ className })} {...props}>
      {density === "none" ? null : (
        <PatternField
          aria-hidden
          tone={SURFACE[tone]}
          tile={86}
          density={density}
          className={slots.pattern()}
        />
      )}
      <div className={slots.inner()}>
        <div className={slots.copy()}>
          {isShown(badges) ? <div className={slots.badges()}>{badges}</div> : null}
          {isShown(overline) ? (
            <Text variant="overline" tone="brand">
              {overline}
            </Text>
          ) : null}
          <Text as={headingTag(headingLevel)} variant={titleSize} isFluid isBalanced>
            {title}
          </Text>
          {isShown(body) ? (
            <Text as="div" variant="body-lg" tone="muted" measure="narrow">
              {body}
            </Text>
          ) : null}
          {isShown(actions) ? <div className={slots.actions()}>{actions}</div> : null}
          {facts.length > 0 ? (
            <ul role="list" className={slots.meta()}>
              {facts.map((fact, index) => (
                <li key={index} className={slots.metaItem()}>
                  {index > 0 ? <SymbolMark className={slots.metaMark()} /> : null}
                  <Text as="span" variant="body-sm" tone="muted">
                    {fact}
                  </Text>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {isShown(media) ? <div className={slots.media()}>{media}</div> : null}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- hero-banner 2>&1 | tail -8`
Expected: PASS (23 tests).

- [ ] **Step 6: Stories (card parity with `HeroBanner.card.html` + the handoff heroes)**

`packages/ui/src/organisms/hero-banner/hero-banner.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  ArrowRight,
  CirclePause,
  MessageCircle,
  RefreshCw,
  ShoppingBag,
  Store,
  Truck,
  Utensils,
} from "lucide-react";

import { Badge } from "../../atoms/badge/badge";
import { Button } from "../../atoms/button/button";
import { DietMark } from "../../atoms/diet-mark/diet-mark";
import { Icon } from "../../atoms/icon/icon";
import { ImageSlot } from "../../atoms/image-slot/image-slot";
import { Text } from "../../atoms/text/text";
import { OfferSeal } from "../../molecules/offer-seal/offer-seal";
import { BRAND, VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { HeroBanner } from "./hero-banner";

/**
 * A blank bitmap standing in for a photograph, so the scrim over it shows in review. A fixture,
 * not a design decision — no photography exists yet, which is what ImageSlot's placeholder is for.
 */
const BLANK_PHOTOGRAPH =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='5'%3E%3Crect width='4' height='5' fill='white'/%3E%3C/svg%3E";

const VEG_BADGE = (
  <Badge tone="success">
    <DietMark size="sm" />
    100% Pure Veg
  </Badge>
);

const meta = {
  title: "Organisms/HeroBanner",
  component: HeroBanner,
  args: {
    overline: "India’s First Desi Urban Café",
    title: "Desi at heart. Urban by nature.",
    body: "Pure veg lunch and dinner from our restaurant kitchen in MKM Market, Sector 57.",
    meta: ["Est. 2025", "Sector 57, Gurgaon", "Open till 11:30pm"],
    actions: (
      <>
        <Button asChild size="lg" icon={ShoppingBag}>
          <a href={BRAND.orderOnlineHref}>Order Now</a>
        </Button>
        <Button asChild variant="secondary" size="lg" iconAfter={ArrowRight}>
          <a href="#menu">See Full Menu</a>
        </Button>
      </>
    ),
    media: (
      <ImageSlot ratio="4:5" radius="xl" label="Hero food photography 4:5" className="shadow-4" />
    ),
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          'The top of any marketing page. The headline is fluid display type, so it never overflows; `titleSize="display-2"` for long ones. Tones brand/ink/soft flood the field with the diamond; `alt` is the handoff\'s pink-50 tint with no pattern. Buttons inside take no colour props — the tone sets the surface. `media` holds an ImageSlot and any overlay (an OfferSeal positions itself on the media column).',
      },
    },
  },
} satisfies Meta<typeof HeroBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row: `tone="brand"` (default), split. */
export const BrandSplit: Story = { args: { tone: "brand" } };

/** Card row: `tone="soft"` + `layout="center"`. */
export const SoftCentred: Story = {
  args: {
    tone: "soft",
    layout: "center",
    overline: "Homely Meals",
    title: "Home-style food, delivered every day.",
    body: "One dal, one sabji, rice, roti and salad in every box.",
    meta: [],
    media: undefined,
    actions: (
      <Button asChild size="lg">
        <a href="#plans">See plans</a>
      </Button>
    ),
  },
};

/** The ink tone named on the card. */
export const InkSplit: Story = { args: { tone: "ink" } };

/** Handoff Home — pink-50 split hero with the launch OfferSeal on the photo. */
export const HandoffHome: Story = {
  args: {
    tone: "alt",
    overline: undefined,
    badges: (
      <>
        <Badge tone="brand">Homely Meals by Pink Paprikaa</Badge>
        {VEG_BADGE}
      </>
    ),
    title: "Pure veg homely meals, delivered every day.",
    body: (
      <>
        <span className="block font-display text-h2-fluid font-black text-text-brand">
          ₹130 a meal. Try 5 meals for ₹650.
        </span>
        <span className="mt-3 flex items-center gap-2 text-body-sm">
          <Icon icon={Store} size="sm" />
          From the Pink Paprikaa restaurant kitchen, MKM Market, Sector 57
        </span>
      </>
    ),
    actions: (
      <>
        <Button asChild size="lg" iconAfter={ArrowRight}>
          <a href="#trial">Start a trial, ₹650</a>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <a href="#plans">See plans</a>
        </Button>
      </>
    ),
    meta: [
      <span key="delivery" className="inline-flex items-center gap-1.5">
        <Icon icon={Truck} size="sm" />
        Free delivery within 3 km
      </span>,
      <span key="pause" className="inline-flex items-center gap-1.5">
        <Icon icon={CirclePause} size="sm" />
        Pause any day
      </span>,
      <span key="menu" className="inline-flex items-center gap-1.5">
        <Icon icon={RefreshCw} size="sm" />
        New menu daily
      </span>,
    ],
    media: (
      <>
        <ImageSlot
          ratio="4:3"
          radius="xl"
          label="PHOTO: Homely Meals box — dal, rice, sabji, tawa roti, salad, raita and chutney"
        />
        <OfferSeal
          value="₹130"
          label="Launch"
          size="md"
          tone="brand"
          corner="top-right"
          bleed="none"
        />
      </>
    ),
  },
};

/** Handoff Catering — brand flood with the diamond and a display-2 headline. */
export const HandoffCatering: Story = {
  args: {
    tone: "brand",
    titleSize: "display-2",
    overline: undefined,
    badges: (
      <>
        <Badge tone="ink">Pink Paprikaa Catering</Badge>
        {VEG_BADGE}
      </>
    ),
    title: "Feeding thirty people? It has to be right the first time.",
    body: (
      <>
        <span className="block">
          We cook it in our own restaurant kitchen in Sector 57 — the same tandoor, the same cooks,
          the same food our dine-in guests eat every day. Tell us the date and headcount. We take it
          from there.
        </span>
        <span className="mt-4 block font-display text-h2-fluid font-black text-text-heading">
          From ₹99 per person.
        </span>
      </>
    ),
    actions: (
      <>
        <Button asChild variant="inverse" size="lg" iconAfter={ArrowRight}>
          <a href="#dawat-builder">Build your Dawat</a>
        </Button>
        <Button asChild variant="secondary" size="lg" icon={Utensils}>
          <a href={BRAND.whatsappHref}>Taste it first</a>
        </Button>
      </>
    ),
    meta: [
      "One kitchen, no shared surfaces, pure vegetarian — ever. Jain and satvik menus on request.",
    ],
    media: (
      <ImageSlot
        ratio="4:3"
        radius="xl"
        tone="strong"
        label="PHOTO: Real Dawat spread from our kitchen — tandoori roti, paneer, dal"
      />
    ),
  },
};

/** Handoff Office & PG Lunch — pink-50 split hero. */
export const HandoffOffice: Story = {
  args: {
    tone: "alt",
    overline: undefined,
    badges: (
      <>
        <Badge tone="brand">Office &amp; PG Lunch</Badge>
        {VEG_BADGE}
      </>
    ),
    title: "Team lunch from ₹99 a meal.",
    body: "For offices and PGs with 20+ people at one address. Fixed slot, one GST invoice a month, free tasting first.",
    actions: (
      <>
        <Button asChild size="lg" icon={MessageCircle}>
          <a href={BRAND.whatsappHref}>Get a free office tasting</a>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <a href="#quote">See my cost</a>
        </Button>
      </>
    ),
    meta: [],
    media: (
      <ImageSlot
        ratio="4:3"
        radius="xl"
        label="PHOTO: Team eating Pink Paprikaa boxes at an office pantry"
      />
    ),
  },
};

/** The title alone — everything else on the hero is optional. */
export const HeadlineOnly: Story = {
  args: { overline: undefined, body: undefined, meta: [], actions: undefined, media: undefined },
};

/**
 * A real photograph with a line printed on it: the media slot layers the `scrim-bottom` gradient
 * under the caption so it stays legible whatever the picture does. Only over a photograph — over
 * a placeholder the scrim would dim the crop note.
 */
export const WithPhotograph: Story = {
  args: {
    media: (
      <div className="relative">
        <ImageSlot
          src={BLANK_PHOTOGRAPH}
          alt=""
          width={4}
          height={5}
          ratio="4:5"
          radius="xl"
          className="shadow-4"
        />
        <div aria-hidden className="absolute inset-0 rounded-xl scrim-bottom" />
        <Text
          as="p"
          variant="body"
          weight="bold"
          tone="inverse"
          className="absolute inset-x-6 bottom-6"
        >
          From our restaurant kitchen, MKM Market, Sector 57
        </Text>
      </div>
    ),
  },
};

export const Mobile: Story = { ...HandoffHome, globals: VIEWPORT_360 };
export const Tablet: Story = { ...HandoffHome, globals: VIEWPORT_768 };
export const Desktop: Story = { ...HandoffHome, globals: VIEWPORT_1280 };
```

- [ ] **Step 7: Export**

```ts
export { HeroBanner, type HeroBannerProps } from "./organisms/hero-banner/hero-banner";
```

- [ ] **Step 8: Format, gate, commit**

```bash
pnpm exec prettier --write packages/ui/src/organisms/hero-banner packages/design-tokens/tokens/component/hero-banner.json packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
git add packages/design-tokens/tokens/component/hero-banner.json packages/ui/src/organisms/hero-banner packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): add the HeroBanner organism

Brand, ink and soft floods over the diamond plus the handoff's plain pink-50
tint; split or centred; fluid display-1 or display-2 headline at any heading
level; a badge row, diamond-separated facts and a positioned media column
for the photo and its OfferSeal.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 4: TestimonialWall

**Dev reference:** `git show dev:packages/ui/src/organisms/testimonial-wall/testimonial-wall.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                         | Ruling  | Where / clause                                                                                  |
| ------------------------------------------------ | ------- | ----------------------------------------------------------------------------------------------- |
| Heading and every review render                  | ALREADY | tests "heads the wall…", "lists one review card per review…"                                    |
| The component adds the quote marks               | ALREADY | ReviewCard's behaviour (Plan 3b, spec §9.2); this plan asserts the verbatim text                |
| `lede` under the heading                         | ADD     | contract delta 1 (R110); test "renders the lede under the heading"                              |
| `headingLevel`                                   | ALREADY | test "takes its heading level from headingLevel"                                                |
| Each score announced as an image                 | ADD     | test "announces each score as an image with its value"                                          |
| No score when a review carries none              | ADD     | test "omits the score for a review that carries none"                                           |
| Cards pale pink by default (`variant = "brand"`) | DROP    | D1 — the design system's `TestimonialWall.jsx` defaults `variant="default"`; `brand` is tested  |
| `mark="symbol"` forced on every card             | DROP    | D1 — the design system passes no `mark`; a review's own `mark` passes through `ReviewCardProps` |
| Auto-fit grid survives 360px                     | ALREADY | `autogrid` test                                                                                 |
| Merges a caller `className`                      | ADD     | test "merges a caller className"                                                                |
| axe                                              | ALREADY | test "has no accessibility violations"                                                          |
| `WallReview` type                                | ALREADY | `ReviewCardProps` (contract §7)                                                                 |
| Stories Default · DefaultCards · Narrow          | ALREADY | Default · BrandCards (the other variant) · Mobile                                               |
| Story SixReviews (invented guests)               | DROP    | spec §10.1 — real reviews only; four exist (`FourReviews`)                                      |
| Story WithLede                                   | ADD     | `WithLede` (contract delta 1)                                                                   |
| Story WithoutScores                              | ADD     | `WithoutScores`                                                                                 |
| _(not in dev)_ explicit list semantics           | ADD     | fold item 19 (`role="list"`); test "lists one review card per review…"                          |

Implementer: copy this table into your report, extended with anything the plan missed.

**Files:**

- Create: `packages/ui/src/organisms/testimonial-wall/testimonial-wall.tsx`, `testimonial-wall.test.tsx`, `testimonial-wall.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `ReviewCard`/`ReviewCardProps`, `SectionHeader`, `componentVariants`, `HeadingLevel`; the `autogrid` utility (Plan 1 — 260px tracks; the card's 280px minimum snaps to it, spec §15.2).
- Produces: `TestimonialWall`, `TestimonialWallProps`.

No component tokens: rhythm is `section-y`, width `container-page`, grid `autogrid`.

- [ ] **Step 1: Write the failing test**

`packages/ui/src/organisms/testimonial-wall/testimonial-wall.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { GOOGLE_REVIEWS } from "../story-fixtures";
import { TestimonialWall } from "./testimonial-wall";

const REVIEWS = GOOGLE_REVIEWS.slice(1);

describe("TestimonialWall", () => {
  it("heads the wall with its overline and a level-2 title", () => {
    render(
      <TestimonialWall overline="Guests" title="What people actually say" reviews={REVIEWS} />
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "What people actually say" })
    ).toBeInTheDocument();
    expect(screen.getByText("Guests")).toBeInTheDocument();
  });

  it("renders the lede under the heading", () => {
    render(
      <TestimonialWall
        title="Reviews"
        lede="Verified Google reviews, in the guests' own words."
        reviews={REVIEWS}
      />
    );
    expect(
      screen.getByText("Verified Google reviews, in the guests' own words.")
    ).toBeInTheDocument();
  });

  it("takes its heading level from headingLevel", () => {
    render(<TestimonialWall title="Reviews" reviews={REVIEWS} headingLevel={3} />);
    expect(screen.getByRole("heading", { level: 3, name: "Reviews" })).toBeInTheDocument();
  });

  it("lists one review card per review, quotes verbatim", () => {
    render(<TestimonialWall title="Reviews" reviews={REVIEWS} />);
    const list = screen.getByRole("list");
    // Safari drops list semantics under `list-style: none` unless the role is explicit.
    expect(list).toHaveAttribute("role", "list");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(REVIEWS.length);
    expect(screen.getAllByRole("figure")).toHaveLength(REVIEWS.length);
    expect(screen.getByText(/Had Honey chili potato and it was good/)).toBeInTheDocument();
  });

  it("dresses every card in the wall's variant", () => {
    render(<TestimonialWall title="Reviews" reviews={REVIEWS} variant="brand" />);
    // ReviewCard's brand variant is Card's pale-pink `feature` surface.
    for (const card of screen.getAllByRole("figure")) {
      expect(card).toHaveAttribute("data-surface", "soft");
    }
  });

  it("lays the cards on the auto-fitting card grid", () => {
    render(<TestimonialWall title="Reviews" reviews={REVIEWS} />);
    expect(screen.getByRole("list")).toHaveClass("autogrid");
  });

  it("announces each score as an image with its value", () => {
    render(<TestimonialWall title="Reviews" reviews={REVIEWS} />);
    expect(screen.getAllByRole("img", { name: /out of 5$/ })).toHaveLength(REVIEWS.length);
  });

  it("omits the score for a review that carries none", () => {
    const [first] = REVIEWS;
    if (first === undefined) throw new Error("no fixture review");
    render(<TestimonialWall title="Reviews" reviews={[{ ...first, rating: undefined }]} />);
    expect(screen.queryByRole("img", { name: /out of 5$/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole("figure")).toHaveLength(1);
  });

  it("merges a caller className", () => {
    const { container } = render(
      <TestimonialWall title="Reviews" reviews={REVIEWS} className="bg-surface-page-alt" />
    );
    expect(container.firstElementChild).toHaveClass("section-y", "bg-surface-page-alt");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <TestimonialWall overline="Guests" title="What people actually say" reviews={REVIEWS} />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- testimonial-wall 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./testimonial-wall`.

- [ ] **Step 3: Implement**

`packages/ui/src/organisms/testimonial-wall/testimonial-wall.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import type { HeadingLevel } from "../../lib/heading";

import { componentVariants } from "../../lib/component-variants";
import { ReviewCard, type ReviewCardProps } from "../../molecules/review-card/review-card";
import { SectionHeader } from "../../molecules/section-header/section-header";

const testimonialWall = componentVariants({
  slots: {
    root: "section-y",
    inner: "container-page flex flex-col gap-8",
    grid: "autogrid",
    item: "flex",
    card: "flex-1",
  },
});

export interface TestimonialWallProps extends Omit<ComponentProps<"section">, "title"> {
  overline?: ReactNode;
  title: ReactNode;
  /** One sentence under the heading. */
  lede?: ReactNode;
  /** Real guest reviews only — three or six read best. */
  reviews: ReviewCardProps[];
  variant?: "default" | "brand" | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/** A grid of guest reviews under a section header, every card in the wall's variant. */
export function TestimonialWall({
  overline,
  title,
  lede,
  reviews,
  variant = "default",
  headingLevel = 2,
  className,
  ...props
}: TestimonialWallProps) {
  const slots = testimonialWall();
  return (
    <section className={slots.root({ className })} {...props}>
      <div className={slots.inner()}>
        <SectionHeader overline={overline} title={title} lede={lede} headingLevel={headingLevel} />
        <ul role="list" className={slots.grid()}>
          {reviews.map((review, index) => (
            <li key={index} className={slots.item()}>
              <ReviewCard
                {...review}
                variant={variant}
                className={slots.card({ class: review.className })}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- testimonial-wall 2>&1 | tail -8`
Expected: PASS (10 tests). The score assertions read Rating's name ("5.0 out of 5", Plan 2b via ReviewCard — `value.toFixed(1)`, confirmed in Task 0).

- [ ] **Step 5: Stories (card parity with `TestimonialWall.card.html`)**

The card's three guests ("Aditi Rao", "Kabir Shah", "Meera Iyer") are invented; the spec's copy rule (§10.1) is real reviews only, so the rows use the verified Google reviews.

`packages/ui/src/organisms/testimonial-wall/testimonial-wall.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { GOOGLE_REVIEWS, VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { TestimonialWall } from "./testimonial-wall";

const meta = {
  title: "Organisms/TestimonialWall",
  component: TestimonialWall,
  args: {
    overline: "Guests",
    title: "What people actually say",
    reviews: GOOGLE_REVIEWS.slice(1),
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Social proof on the marketing site: a section header over a grid of ReviewCards. Three or six reviews read best. Only real guest copy — these are the verified Google reviews, verbatim.",
      },
    },
  },
} satisfies Meta<typeof TestimonialWall>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row: the grid of three reviews. */
export const Default: Story = {};

export const BrandCards: Story = { args: { variant: "brand" } };

export const FourReviews: Story = { args: { reviews: GOOGLE_REVIEWS } };

export const OnTint: Story = { args: { className: "bg-surface-page-alt" } };

export const WithLede: Story = {
  args: { lede: "Verified Google reviews, in the guests' own words." },
};

/** Quotes with no score still carry the card — the words are the proof, not the number. */
export const WithoutScores: Story = {
  args: { reviews: GOOGLE_REVIEWS.slice(1).map((review) => ({ ...review, rating: undefined })) },
};

export const Mobile: Story = { globals: VIEWPORT_360 };
export const Tablet: Story = { globals: VIEWPORT_768 };
export const Desktop: Story = { globals: VIEWPORT_1280 };
```

- [ ] **Step 6: Export**

```ts
export {
  TestimonialWall,
  type TestimonialWallProps,
} from "./organisms/testimonial-wall/testimonial-wall";
```

- [ ] **Step 7: Format, gate, commit**

```bash
pnpm exec prettier --write packages/ui/src/organisms/testimonial-wall packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
git add packages/ui/src/organisms/testimonial-wall packages/ui/src/index.ts
git commit -m "feat(ui): add the TestimonialWall organism

A section header over an auto-fitting grid of review cards in one variant;
stories show the verified Google reviews verbatim instead of the design
system's invented guests.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 5: FaqSection

**Dev reference:** `git show dev:packages/ui/src/organisms/faq-section/faq-section.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                    | Ruling  | Where / clause                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heading, lede and every question                            | ALREADY | test "heads the section with overline, a level-2 title and the lede"                                                                                                                                                                                                                                                                              |
| The first answer open on arrival                            | ALREADY | test "opens the first answer by default…"                                                                                                                                                                                                                                                                                                         |
| `defaultOpen` (named questions, or `[]` for none)           | ADD     | contract delta 2 (R110), forwarded to Accordion (Plan 3a); tests "opens the answers named in defaultOpen…", "opens none…"                                                                                                                                                                                                                         |
| Clicking another question swaps the open answer             | ALREADY | native `<details name>` (shared `name` asserted); Plan 3a Accordion's `play` proves exclusivity in Chromium                                                                                                                                                                                                                                       |
| `isMultiple` keeps several open                             | ALREADY | test "lets several answers stay open with isMultiple"                                                                                                                                                                                                                                                                                             |
| Questions sit one heading level below the section           | ADD     | R112: Accordion (Plan 3a) gains `headingLevel` (a heading inside each `<summary>`, which Chromium exposes — CDP probe in batch E); FaqSection passes its level + 1 (h6 at most); tests "makes each question a heading one level below the title", "takes its heading level from headingLevel and steps the questions down…"; `HeadingLevel3` play |
| Two columns stack at 360px                                  | ALREADY | `lg:grid-cols-2`, one column below                                                                                                                                                                                                                                                                                                                |
| Merges a caller `className`                                 | ADD     | test "merges a caller className"                                                                                                                                                                                                                                                                                                                  |
| axe                                                         | ALREADY | test "has no accessibility violations"                                                                                                                                                                                                                                                                                                            |
| "A few bakes contain egg" answer                            | DROP    | C10                                                                                                                                                                                                                                                                                                                                               |
| Stories Default · Multiple · Narrow                         | ALREADY | Default · Multiple · Mobile                                                                                                                                                                                                                                                                                                                       |
| Story WithoutLede                                           | ADD     | `WithoutLede`                                                                                                                                                                                                                                                                                                                                     |
| Story HeadingLevels                                         | ADD     | `HeadingLevel3`                                                                                                                                                                                                                                                                                                                                   |
| Stories SecondOpen · AllClosed                              | ADD     | `SecondOpen` · `AllClosed` (contract delta 2), each with a `play` counting the open answers in Chromium                                                                                                                                                                                                                                           |
| _(not in dev)_ several named answers open with `isMultiple` | ADD     | test "lets several answers stay open with isMultiple" (`defaultOpen={["veg", "pause"]}` → two open)                                                                                                                                                                                                                                               |

Implementer: copy this table into your report, extended with anything the plan missed.

**Files:**

- Create: `packages/design-tokens/tokens/component/faq-section.json`
- Create: `packages/ui/src/organisms/faq-section/faq-section.tsx`, `faq-section.test.tsx`, `faq-section.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`
- Modify (R112, batch E carried fix E1 — a Plan 3a additive change): `packages/ui/src/molecules/accordion/accordion.tsx` (`headingLevel?: HeadingLevel | undefined` — each question inside its `<summary>` becomes `createElement(headingTag(level))`; omitted, it stays a `span`), `accordion.test.tsx` (tests "keeps the questions plain summary text unless a headingLevel is given", "wraps each question in a heading at headingLevel, inside its summary"), `accordion.stories.tsx` (`AsHeadings`, a `play` finding an h3 inside every summary)

**Interfaces:**

- Consumes: `Accordion`/`AccordionItem` (with its `headingLevel`, R112), `SectionHeader`, `componentVariants`, `HeadingLevel`; stories: `Button`, `Card`, `Logo`, `StatusDot`, `Text`.
- Produces: `FaqSection`, `FaqSectionProps`.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/faq-section.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "faq-section-gap": {
      "$value": "clamp(28px, 4vw, 56px)",
      "$description": "Gap between the heading column and the answers (design system FaqSection)."
    },
    "faq-section-sticky": {
      "$value": "120px",
      "$description": "Sticky offset of the heading column at lg and up — clears the compact header and its announcement bar (handoff FaqBlock)."
    }
  }
}
```

Append to `SPACING`:

```ts
  "faq-section-gap",
  "faq-section-sticky",
```

- [ ] **Step 2: Write the failing test**

`packages/ui/src/organisms/faq-section/faq-section.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import type { AccordionItem } from "../../molecules/accordion/accordion";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { FaqSection } from "./faq-section";

const ITEMS: AccordionItem[] = [
  {
    value: "veg",
    question: "Is it really pure vegetarian?",
    answer: "One kitchen, pure vegetarian, no exceptions. No egg, no meat, ever.",
  },
  {
    value: "pause",
    question: "Can I pause or skip a day?",
    answer: "Yes. Tell us by 9pm the day before.",
  },
  { value: "gst", question: "Do I get a GST bill?", answer: "Yes, for every order." },
];

describe("FaqSection", () => {
  it("heads the section with overline, a level-2 title and the lede", () => {
    render(
      <FaqSection
        overline="Questions"
        title="Before you order"
        lede="The things people ask us most."
        items={ITEMS}
      />
    );
    expect(screen.getByRole("heading", { level: 2, name: "Before you order" })).toBeInTheDocument();
    expect(screen.getByText("Questions")).toBeInTheDocument();
    expect(screen.getByText("The things people ask us most.")).toBeInTheDocument();
  });

  it("makes each question a heading one level below the title", () => {
    render(<FaqSection title="FAQ" items={ITEMS} />);
    const questions = screen.getAllByRole("heading", { level: 3 });
    expect(questions.map((question) => question.textContent)).toEqual(
      ITEMS.map((item) => item.question)
    );
    for (const question of questions) expect(question.closest("summary")).not.toBeNull();
  });

  it("takes its heading level from headingLevel and steps the questions down with it, to h6 at most", () => {
    const { rerender } = render(<FaqSection title="FAQ" items={ITEMS} headingLevel={3} />);
    expect(screen.getByRole("heading", { level: 3, name: "FAQ" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 4 })).toHaveLength(ITEMS.length);
    rerender(<FaqSection title="FAQ" items={ITEMS} headingLevel={6} />);
    expect(screen.getAllByRole("heading", { level: 6 })).toHaveLength(ITEMS.length + 1);
  });

  it("opens the first answer by default and keeps one open at a time", () => {
    const { container } = render(<FaqSection title="FAQ" items={ITEMS} />);
    const answers = [...container.querySelectorAll("details")];
    expect(answers).toHaveLength(3);
    expect(answers[0]).toHaveAttribute("open");
    expect(container.querySelectorAll("details[open]")).toHaveLength(1);
    const names = new Set(answers.map((answer) => answer.getAttribute("name")));
    expect(names.size).toBe(1);
    expect([...names][0]).toBeTruthy();
  });

  it("opens the answers named in defaultOpen instead of the first", () => {
    const { container } = render(<FaqSection title="FAQ" items={ITEMS} defaultOpen={["pause"]} />);
    const answers = [...container.querySelectorAll("details")];
    expect(answers[0]).not.toHaveAttribute("open");
    expect(answers[1]).toHaveAttribute("open");
    expect(container.querySelectorAll("details[open]")).toHaveLength(1);
  });

  it("opens none when defaultOpen is empty", () => {
    const { container } = render(<FaqSection title="FAQ" items={ITEMS} defaultOpen={[]} />);
    expect(container.querySelectorAll("details[open]")).toHaveLength(0);
  });

  it("lets several answers stay open with isMultiple", () => {
    const { container } = render(
      <FaqSection title="FAQ" items={ITEMS} isMultiple defaultOpen={["veg", "pause"]} />
    );
    for (const answer of container.querySelectorAll("details")) {
      expect(answer).not.toHaveAttribute("name");
    }
    expect(container.querySelectorAll("details[open]")).toHaveLength(2);
  });

  it("puts the aside beside the heading in the column that sticks at lg", () => {
    render(<FaqSection title="FAQ" items={ITEMS} aside={<p>Still have a question?</p>} />);
    const lead = screen.getByText("Still have a question?").closest('[class~="lg:sticky"]');
    expect(lead).toContainElement(screen.getByRole("heading", { name: "FAQ" }));
    expect(lead).toHaveClass("lg:top-faq-section-sticky");
  });

  it("merges a caller className", () => {
    const { container } = render(
      <FaqSection title="FAQ" items={ITEMS} className="bg-surface-page-alt" />
    );
    expect(container.firstElementChild).toHaveClass("section-y", "bg-surface-page-alt");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <FaqSection overline="Questions" title="Before you order" items={ITEMS} aside={<p>Help</p>} />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- faq-section 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./faq-section`.

- [ ] **Step 4: Implement**

`packages/ui/src/organisms/faq-section/faq-section.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import type { HeadingLevel } from "../../lib/heading";

import { componentVariants } from "../../lib/component-variants";
import { Accordion, type AccordionItem } from "../../molecules/accordion/accordion";
import { SectionHeader } from "../../molecules/section-header/section-header";

const faqSection = componentVariants({
  slots: {
    root: "section-y",
    inner: "container-page grid items-start gap-faq-section-gap lg:grid-cols-2",
    lead: "flex min-w-0 flex-col gap-6 lg:sticky lg:top-faq-section-sticky",
  },
});

export interface FaqSectionProps extends Omit<ComponentProps<"section">, "title"> {
  overline?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  /** One or two short sentences per answer. The first opens by default. */
  items: AccordionItem[];
  /**
   * The `value`s of the answers open on arrival (default: the first; `[]` for none). Name more
   * than one only with `isMultiple`: a single-open group keeps one answer open.
   */
  defaultOpen?: string[] | undefined;
  /** Allow several answers open at once. */
  isMultiple?: boolean | undefined;
  /** Beside the heading, sticky at lg and up — e.g. the handoff's "Still have a question?" card. */
  aside?: ReactNode;
  /** The title's level; each question is a heading one level below it (h6 at most). */
  headingLevel?: HeadingLevel | undefined;
}

const QUESTION_LEVEL: Readonly<Record<HeadingLevel, HeadingLevel>> = {
  1: 2,
  2: 3,
  3: 4,
  4: 5,
  5: 6,
  6: 6,
};

/** Two-column FAQ — heading (and aside) left, native accordion right, stacking below lg. */
export function FaqSection({
  overline,
  title,
  lede,
  items,
  defaultOpen,
  isMultiple = false,
  aside,
  headingLevel = 2,
  className,
  ...props
}: FaqSectionProps) {
  const slots = faqSection();
  return (
    <section className={slots.root({ className })} {...props}>
      <div className={slots.inner()}>
        <div className={slots.lead()}>
          <SectionHeader
            overline={overline}
            title={title}
            lede={lede}
            headingLevel={headingLevel}
          />
          {aside}
        </div>
        <Accordion
          items={items}
          defaultOpen={defaultOpen}
          isMultiple={isMultiple}
          headingLevel={QUESTION_LEVEL[headingLevel]}
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- faq-section 2>&1 | tail -8`
Expected: PASS (10 tests).

- [ ] **Step 6: Stories (card parity with `FaqSection.card.html` + handoff `FaqBlock`)**

The card's first answer mentions egg-containing bakes, which the owner has ruled out (C10); the rows use the handoff Home FAQ.

`packages/ui/src/organisms/faq-section/faq-section.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MessageCircle, Phone } from "lucide-react";
import { expect } from "storybook/test";

import type { AccordionItem } from "../../molecules/accordion/accordion";

import { Button } from "../../atoms/button/button";
import { Card } from "../../atoms/card/card";
import { Logo } from "../../atoms/logo/logo";
import { StatusDot } from "../../atoms/status-dot/status-dot";
import { Text } from "../../atoms/text/text";
import { BRAND, VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { FaqSection } from "./faq-section";

/** Handoff Home FAQ (rates.js values filled in). */
const FAQ: AccordionItem[] = [
  {
    value: "delivery",
    question: "Where do you deliver?",
    answer:
      "Free delivery within 3 km of Sector 57. Further away, we agree the charge with you on WhatsApp. Catering delivery is free up to 8 km.",
  },
  {
    value: "pause",
    question: "Can I pause or skip a day?",
    answer: "Yes. Tell us by 9pm the day before. Skipped meals move to the end of your plan.",
  },
  {
    value: "customise",
    question: "Can I customise my meals?",
    answer: "Yes — spice level, Jain, no onion-garlic, fewer rotis. Set it once and we remember.",
  },
  {
    value: "gst",
    question: "Do I get a GST bill?",
    answer: "Yes, for every meal plan, every catering order and every office order.",
  },
  {
    value: "trial",
    question: "Can I try it before I commit?",
    answer:
      "Yes. Start with a trial: 5 meals on any days within a week — Classic ₹650, Everyday ₹600. No lock-in after that.",
  },
  {
    value: "veg",
    question: "Is it really pure vegetarian?",
    answer:
      "One kitchen, pure vegetarian, no exceptions. No egg, no meat, ever. We are a pure-veg restaurant, not a mixed kitchen.",
  },
];

const QUICK_QUESTIONS = [
  "Do you deliver to my area?",
  "Can I pause for a week?",
  "Do you cater parties?",
];

/** The handoff FaqBlock's help card — page-specific content, composed here only for the story. */
function HelpCard() {
  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Logo variant="symbol" tone="badge" isDecorative className="w-11" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <Text as="span" weight="bold" className="font-display">
              Still have a question?
            </Text>
            <StatusDot tone="open" label="A real person replies, 8am – 11:30pm" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Text as="span" variant="overline" tone="muted">
            Tap to ask on WhatsApp
          </Text>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((question) => (
              <Button key={question} asChild variant="secondary" size="sm" icon={MessageCircle}>
                <a href={`${BRAND.whatsappHref}?text=${encodeURIComponent(question)}`}>
                  {question}
                </a>
              </Button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button asChild isFullWidth icon={MessageCircle}>
            <a href={BRAND.whatsappHref}>WhatsApp</a>
          </Button>
          <Button asChild isFullWidth variant="secondary" icon={Phone}>
            <a href={BRAND.phoneHref}>Call</a>
          </Button>
        </div>
      </div>
    </Card>
  );
}

const meta = {
  title: "Organisms/FaqSection",
  component: FaqSection,
  args: {
    overline: "Questions",
    title: "The things people ask",
    lede: "Everything guests ask us at the counter.",
    items: FAQ,
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Two-column FAQ — heading left, accordion right, stacking below lg. The first answer opens by default; answers are one or two short sentences. `aside` sits under the heading and the whole column sticks at lg (the handoff's help card). Native `<details name>`: zero JS, find-in-page works, answers are in the HTML.",
      },
    },
  },
} satisfies Meta<typeof FaqSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row: the two-column FAQ. */
export const Default: Story = {};

/** Handoff FaqBlock — sticky heading column with the help card. */
export const HandoffWithAside: Story = {
  args: {
    title: "Before you order",
    lede: "The things people ask us most. Anything else, just message us.",
    aside: <HelpCard />,
    className: "bg-surface-page-alt",
  },
};

export const Multiple: Story = { args: { isMultiple: true } };

/** A page that links to one answer opens that one instead of the first. */
export const SecondOpen: Story = {
  args: { defaultOpen: ["pause"] },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelectorAll("details[open]")).toHaveLength(1);
    await expect(canvas.getByText("Can I pause or skip a day?").closest("details")).toHaveAttribute(
      "open"
    );
  },
};

export const AllClosed: Story = {
  args: { defaultOpen: [] },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll("details[open]")).toHaveLength(0);
  },
};

/** No lede: the heading sits alone in its column and the answers carry the section. */
export const WithoutLede: Story = { args: { lede: undefined } };

/** Under a page section that already owns the h2, the FAQ steps down a level. */
export const HeadingLevel3: Story = {
  args: { headingLevel: 3, overline: "Homely Meals", title: "Plans and delivery" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 3 })).toHaveTextContent("Plans and delivery");
    await expect(canvas.getAllByRole("heading", { level: 4 })).toHaveLength(FAQ.length);
  },
};

export const Mobile: Story = { ...HandoffWithAside, globals: VIEWPORT_360 };
export const Tablet: Story = { ...HandoffWithAside, globals: VIEWPORT_768 };
export const Desktop: Story = { ...HandoffWithAside, globals: VIEWPORT_1280 };
```

- [ ] **Step 7: Export**

```ts
export { FaqSection, type FaqSectionProps } from "./organisms/faq-section/faq-section";
```

- [ ] **Step 8: Format, gate, commit**

```bash
pnpm exec prettier --write packages/ui/src/organisms/faq-section packages/design-tokens/tokens/component/faq-section.json packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
git add packages/design-tokens/tokens/component/faq-section.json packages/ui/src/organisms/faq-section packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): add the FaqSection organism

Heading column and native accordion side by side from lg, stacked below;
the first answer opens by default, one at a time unless isMultiple. The
aside slot sits under the heading and the column sticks clear of the
header, as the handoff's FAQ block does.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 6: QuotePanel

**Dev reference:** none (handoff component)

**Files:**

- Create: `packages/design-tokens/tokens/component/quote-panel.json`
- Create: `packages/ui/src/organisms/quote-panel/quote-panel.tsx`, `quote-panel.test.tsx`, `quote-panel.stories.tsx`
- Create: `packages/ui/src/lib/story-ring.ts` (`ringClippers`, promoted from Plan 3b's CouponTicket and FilterBar stories on its third use; a `story-*` file — never exported, outside the library-source scan)
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`, `TEXT`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `PatternField`, `Text`, `KeyValueList`/`KeyValueItem` (Plan 3b — without `keyWidth` its rows put key and value at either end, muted key and strong value, and `isEmphasised` picks a value out in the brand colour: exactly the quote lines), `componentVariants`, `headingTag`; stories: `Alert`, `Badge`, `Button`.
- Produces: `QuotePanel`, `QuotePanelProps`.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/quote-panel.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "quote-panel-pad": {
      "$value": "clamp(18px, 3vw, 28px)",
      "$description": "QuotePanel padding (handoff Plan, Dawat and Office calculators)."
    }
  },
  "text": {
    "$type": "typography",
    "quote-panel-amount": {
      "$value": {
        "fontSize": "clamp(44px, 6vw, 60px)",
        "lineHeight": 1,
        "letterSpacing": "-0.03em",
        "fontWeight": "{font-weight.black}"
      },
      "$description": "The estimate's big number (handoff PlanCalculator)."
    }
  }
}
```

Append to `SPACING`:

```ts
  "quote-panel-pad",
```

Append to `TEXT`:

```ts
  "quote-panel-amount",
```

- [ ] **Step 2: Write the failing test**

`packages/ui/src/organisms/quote-panel/quote-panel.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { QuotePanel } from "./quote-panel";

/** Handoff PlanCalculator: Classic, Weekday plan, lunch, one person, launch price on. */
const PLAN = {
  title: "Classic · Weekday plan",
  badge: <span>Launch price</span>,
  amount: "₹130",
  unit: "a meal",
  was: "₹140",
  lines: [
    { key: "₹130 × 24 meals", value: "₹3,120" },
    { key: "Offer: free meals (1)", value: "₹0" },
    { key: "GST 5%", value: "₹156" },
    { key: "Meals delivered", value: "25" },
  ],
  total: { label: "Total", value: "₹3,276" },
  note: "Delivery free within 3 km · no packaging or platform fee",
};

describe("QuotePanel", () => {
  it("is a region named by its title, a level-3 heading by default", () => {
    render(<QuotePanel {...PLAN} />);
    expect(screen.getByRole("region", { name: PLAN.title })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: PLAN.title })).toBeInTheDocument();
  });

  it("shows the amount and unit, and announces the struck price as the old one", () => {
    const { container } = render(<QuotePanel {...PLAN} />);
    expect(screen.getByText("₹130")).toBeInTheDocument();
    expect(screen.getByText("a meal")).toBeInTheDocument();
    expect(container.querySelector("s")).toHaveTextContent("was ₹140");
  });

  it("lists every line as a term and its value, then the total", () => {
    render(<QuotePanel {...PLAN} />);
    const gst = screen.getByText("GST 5%");
    expect(gst.tagName).toBe("DT");
    expect(gst.nextElementSibling).toHaveTextContent("₹156");
    const total = screen.getByText("Total");
    expect(total.tagName).toBe("DT");
    expect(total.nextElementSibling).toHaveTextContent("₹3,276");
  });

  it("picks an emphasised line out in the brand colour, as KeyValueList does", () => {
    render(
      <QuotePanel
        tone="ink"
        title="Your Dawat estimate"
        amount="₹6,269"
        lines={[{ key: "50% to hold the date", value: "₹3,135", isEmphasised: true }]}
      />
    );
    expect(screen.getByText("₹3,135")).toHaveClass("text-text-brand");
  });

  it.each(["brand", "ink", "light"] as const)("sets the %s surface", (tone) => {
    render(<QuotePanel {...PLAN} tone={tone} />);
    expect(screen.getByRole("region")).toHaveAttribute("data-surface", tone);
  });

  it("floods only the brand tone with the diamond", () => {
    const { container, rerender } = render(<QuotePanel {...PLAN} tone="brand" />);
    const layer = () => container.querySelector('section > [aria-hidden="true"]');
    expect(layer()).toBeInTheDocument();
    rerender(<QuotePanel {...PLAN} tone="ink" />);
    expect(layer()).not.toBeInTheDocument();
  });

  it("merges a caller className over its own, and the diamond layer lets that ground show", () => {
    const { container } = render(<QuotePanel {...PLAN} className="bg-surface-page-alt" />);
    const layer = container.querySelector('section > [aria-hidden="true"]');
    expect(screen.getByRole("region")).toHaveClass("bg-surface-page-alt");
    expect(screen.getByRole("region")).not.toHaveClass("bg-surface-brand");
    expect(layer).toHaveClass("bg-transparent");
    expect(layer).not.toHaveClass("bg-surface-brand");
  });

  it("renders the note, alerts, action and footnote in that order", () => {
    const { container } = render(
      <QuotePanel
        {...PLAN}
        alerts={<p>You save ₹2,880</p>}
        action={<a href="#send">Send this plan on WhatsApp</a>}
        footnote="We confirm within the hour."
      />
    );
    const text = container.textContent;
    const positions = [
      "Delivery free",
      "You save ₹2,880",
      "Send this plan",
      "We confirm within the hour.",
    ].map((fragment) => text.indexOf(fragment));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("renders no wrapper for an empty unit, was, note, alerts, action or footnote", () => {
    const { container } = render(
      <QuotePanel
        tone="ink"
        title="Estimate"
        amount="₹99,792"
        unit=""
        was=""
        note=""
        alerts=""
        action=""
        footnote=""
      />
    );
    const body = container.querySelector("section > div");
    expect(body?.children).toHaveLength(2);
    expect(screen.getByText("₹99,792").parentElement?.children).toHaveLength(1);
  });

  it("renders the wrapper for a 0 unit, was, note, alerts, action or footnote — a number is content", () => {
    const { container } = render(
      <QuotePanel
        tone="ink"
        title="Estimate"
        amount="₹99,792"
        unit={0}
        was={0}
        note={0}
        alerts={0}
        action={0}
        footnote={0}
      />
    );
    const body = container.querySelector("section > div");
    expect(body?.children).toHaveLength(6);
    expect(screen.getByText("₹99,792").parentElement?.children).toHaveLength(3);
  });

  it("renders no summary list without lines or a total", () => {
    const { container } = render(<QuotePanel title="Estimate" amount="₹99,792" />);
    expect(container.querySelector("dl")).not.toBeInTheDocument();
  });

  it("takes its heading level from headingLevel", () => {
    render(<QuotePanel {...PLAN} headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2, name: PLAN.title })).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <QuotePanel {...PLAN} action={<a href="#send">Send this plan on WhatsApp</a>} />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- quote-panel 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./quote-panel`.

- [ ] **Step 4: Implement**

`packages/ui/src/organisms/quote-panel/quote-panel.tsx`:

```tsx
import { type ComponentProps, type ReactNode, useId } from "react";

import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { Text } from "../../atoms/text/text";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { isShown } from "../../lib/is-shown";
import { StruckPrice } from "../../lib/struck-price";
import { type KeyValueItem, KeyValueList } from "../../molecules/key-value-list/key-value-list";

const quotePanel = componentVariants({
  slots: {
    root: "relative overflow-hidden rounded-xl p-quote-panel-pad",
    // A decorative layer only: the panel's own ground (or a caller's) shows through it.
    pattern: "absolute inset-0 bg-transparent",
    body: "relative flex flex-col gap-4",
    header: "flex flex-wrap items-start justify-between gap-3",
    price: "flex flex-wrap items-baseline gap-x-2.5 gap-y-1",
    amount: "font-display text-quote-panel-amount text-text-heading",
    unit: "text-body-sm text-text-muted",
    was: "text-body-sm",
    lines: "border-t border-border-subtle pt-1.5",
    total:
      "flex justify-between gap-3 border-t border-border-subtle pt-2.5 font-display text-h4 font-black text-text-heading",
    note: "text-caption text-text-muted",
    alerts: "flex flex-col gap-2",
    action: "flex flex-col gap-2",
    footnote: "text-center text-caption text-text-muted",
  },
  variants: {
    tone: {
      brand: { root: "bg-surface-brand" },
      // The Dawat and Office quotes set their lines in mono (handoff).
      ink: { root: "bg-surface-inverse", lines: "font-mono" },
      light: { root: "bg-surface-card", lines: "font-mono" },
    },
  },
  defaultVariants: { tone: "brand" },
});

type QuoteTone = NonNullable<VariantProps<typeof quotePanel>["tone"]>;

/** Title colour: white on brand and pink-300 on ink (both `brand` there), ink-600 on the white card. */
const TITLE_TONE: Readonly<Record<QuoteTone, "brand" | "muted">> = {
  brand: "brand",
  ink: "brand",
  light: "muted",
};

export interface QuotePanelProps
  extends Omit<ComponentProps<"section">, "title">, Pick<VariantProps<typeof quotePanel>, "tone"> {
  /** The overline title, e.g. "Classic · Weekday plan". */
  title: ReactNode;
  badge?: ReactNode;
  /** The big number, already formatted ("₹130"). */
  amount: ReactNode;
  unit?: ReactNode;
  /** The struck regular price, already formatted. */
  was?: ReactNode;
  /** Read before the struck price by screen readers, which do not announce strike-through. */
  wasLabel?: string | undefined;
  lines?: KeyValueItem[] | undefined;
  total?: { label: ReactNode; value: ReactNode } | undefined;
  note?: ReactNode;
  /** Warnings and offers — usually Alerts. */
  alerts?: ReactNode;
  /** Usually one full-width `size="lg"` Button. */
  action?: ReactNode;
  footnote?: ReactNode;
  headingLevel?: HeadingLevel | undefined;
}

/**
 * The estimate panel of the Plan, Dawat and Office calculators: brand pink with the diamond,
 * ink, or a white card (a light island inside an ink section). Shows numbers it is given — the
 * pricing logic lives in the app.
 */
export function QuotePanel({
  tone = "brand",
  title,
  badge,
  amount,
  unit,
  was,
  wasLabel = "was",
  lines = [],
  total,
  note,
  alerts,
  action,
  footnote,
  headingLevel = 3,
  className,
  ...props
}: QuotePanelProps) {
  const titleId = useId();
  const slots = quotePanel({ tone });
  return (
    <section
      data-surface={tone}
      aria-labelledby={titleId}
      className={slots.root({ className })}
      {...props}
    >
      {tone === "brand" ? (
        <PatternField aria-hidden tone="brand" tile={64} className={slots.pattern()} />
      ) : null}
      <div className={slots.body()}>
        <div className={slots.header()}>
          <Text
            as={headingTag(headingLevel)}
            id={titleId}
            variant="overline"
            tone={TITLE_TONE[tone]}
          >
            {title}
          </Text>
          {badge}
        </div>
        <div className={slots.price()}>
          <span className={slots.amount()}>{amount}</span>
          {isShown(unit) ? <span className={slots.unit()}>{unit}</span> : null}
          {isShown(was) ? (
            <StruckPrice label={wasLabel} className={slots.was()}>
              {was}
            </StruckPrice>
          ) : null}
        </div>
        {lines.length > 0 ? (
          <KeyValueList
            items={lines}
            density="compact"
            hasDividers={false}
            className={slots.lines()}
          />
        ) : null}
        {total ? (
          <dl className={slots.total()}>
            <dt>{total.label}</dt>
            <dd>{total.value}</dd>
          </dl>
        ) : null}
        {isShown(note) ? <div className={slots.note()}>{note}</div> : null}
        {isShown(alerts) ? <div className={slots.alerts()}>{alerts}</div> : null}
        {isShown(action) ? <div className={slots.action()}>{action}</div> : null}
        {isShown(footnote) ? <div className={slots.footnote()}>{footnote}</div> : null}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- quote-panel 2>&1 | tail -8`
Expected: PASS (15 tests).

- [ ] **Step 6: Stories (the three handoff calculators)**

Numbers are the handoff calculators' own outputs for their default states (`rates.js`): Plan — Classic launch ₹130 × 24 = ₹3,120 + GST ₹156; Dawat — Signature ₹199 × 30 = ₹5,970 + GST ₹299 = ₹6,269; Office — Everyday ₹99 × 40 × 24 = ₹95,040 + GST ₹4,752 = ₹99,792.

The panel clips (`overflow-hidden`), so a `play` tabs to every action and proves its focus ring whole. The check is the third copy of Plan 3b's `ringClippers` (CouponTicket, FilterBar), so it moves to `lib` here; Tasks 7, 10–15 import it. The two 3b copies stay until the final fix wave.

`packages/ui/src/lib/story-ring.ts`:

```ts
/**
 * Stories only — never exported from the barrel. The `overflow` ancestors of `element` whose
 * padding box cuts its focus outline (an outline is clipped like any other paint, so a ring drawn
 * outside a flush child of an `overflow-hidden` box all but vanishes). A `play` that focuses a
 * control inside a clipping frame asserts this is `[]`.
 */
export function ringClippers(element: HTMLElement) {
  const style = getComputedStyle(element);
  const reach = Number.parseFloat(style.outlineWidth) + Number.parseFloat(style.outlineOffset);
  // Scroll extents are whole pixels, so a child scrolled fully into view can sit a fraction past.
  const box = element.getBoundingClientRect();
  const slack = 1;
  const clippers: HTMLElement[] = [];
  for (let node = element.parentElement; node !== null; node = node.parentElement) {
    const { overflowX, overflowY } = getComputedStyle(node);
    if (overflowX === "visible" && overflowY === "visible") continue;
    const frame = node.getBoundingClientRect();
    const left = frame.left + node.clientLeft;
    const top = frame.top + node.clientTop;
    if (
      box.left - reach < left - slack ||
      box.top - reach < top - slack ||
      box.right + reach > left + node.clientWidth + slack ||
      box.bottom + reach > top + node.clientHeight + slack
    ) {
      clippers.push(node);
    }
  }
  return clippers;
}
```

`packages/ui/src/organisms/quote-panel/quote-panel.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MessageCircle, Utensils } from "lucide-react";
import { expect } from "storybook/test";

import { Badge } from "../../atoms/badge/badge";
import { Button } from "../../atoms/button/button";
import { ringClippers } from "../../lib/story-ring";
import { Alert } from "../../molecules/alert/alert";
import { BRAND, VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { QuotePanel } from "./quote-panel";

const meta = {
  title: "Organisms/QuotePanel",
  component: QuotePanel,
  args: {
    tone: "brand",
    title: "Classic · Weekday plan",
    badge: <Badge tone="soft">Launch price</Badge>,
    amount: "₹130",
    unit: "a meal",
    was: "₹140",
    lines: [
      { key: "₹130 × 24 meals", value: "₹3,120" },
      { key: "Offer: free meals (1)", value: "₹0" },
      { key: "GST 5%", value: "₹156" },
      { key: "Meals delivered", value: "25" },
    ],
    total: { label: "Total", value: "₹3,276" },
    note: "Delivery free within 3 km · no packaging or platform fee",
    alerts: (
      <Alert tone="neutral">
        You save ₹2,880 vs ordering the same meals on a food app at ₹250+.
      </Alert>
    ),
    action: (
      <Button asChild variant="inverse" size="lg" icon={MessageCircle} isFullWidth>
        <a href={BRAND.whatsappHref}>Send this plan on WhatsApp</a>
      </Button>
    ),
  },
  decorators: [
    (Story) => (
      <div className="max-w-100">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'The estimate panel of the handoff\'s Plan, Dawat and Office calculators. `tone="brand"` is flooded pink with the diamond; `ink` is the Dawat panel; `light` is the white card on an ink section (a light island — text goes dark again). It renders the numbers it is given; pricing logic stays in the app.',
      },
    },
  },
} satisfies Meta<typeof QuotePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The panel clips (`overflow-hidden`, for its rounded corners and the diamond), so its padding
 * must hold every focus ring whole: tab to each action in turn and prove nothing cuts its ring.
 */
const proveRingsWhole: Story["play"] = async ({ canvas, userEvent }) => {
  for (const link of canvas.getAllByRole("link")) {
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(link.matches(":focus-visible")).toBe(true);
    await expect(ringClippers(link)).toEqual([]);
  }
};

export const Playground: Story = {};

/** Handoff PlanCalculator — brand panel. */
export const HandoffPlan: Story = { play: proveRingsWhole };

/** Handoff DawatCalculator — ink panel. */
export const HandoffDawat: Story = {
  args: {
    tone: "ink",
    title: "Your Dawat estimate",
    badge: undefined,
    amount: "₹6,269",
    unit: "₹209 a head · 30 guests · incl. GST",
    was: undefined,
    lines: [
      { key: "Signature Dawat ₹199 × 30", value: "₹5,970" },
      { key: "GST 5%", value: "₹299" },
      { key: "50% to hold the date", value: "₹3,135" },
    ],
    total: undefined,
    note: undefined,
    alerts: (
      <Alert tone="neutral" icon={Utensils}>
        Taste first: one Dawat at ₹199, credited in full when you confirm.
      </Alert>
    ),
    action: (
      <Button asChild size="lg" icon={MessageCircle} isFullWidth>
        <a href={BRAND.whatsappHref}>Check my date on WhatsApp</a>
      </Button>
    ),
    footnote: "We confirm within the hour. 50% holds the date, balance on delivery.",
  },
  play: proveRingsWhole,
};

/** Handoff OfficeLunch — white card on the ink quote section. */
export const HandoffOffice: Story = {
  args: {
    tone: "light",
    title: "Estimated per cycle",
    badge: undefined,
    amount: "₹99,792",
    unit: undefined,
    was: undefined,
    lines: [
      { key: "Everyday", value: "₹99 × 40" },
      { key: "Meals each", value: "24" },
      { key: "Subtotal", value: "₹95,040" },
      { key: "GST 5%", value: "₹4,752" },
    ],
    total: undefined,
    note: undefined,
    alerts: undefined,
    action: (
      <Button asChild size="lg" icon={MessageCircle} isFullWidth>
        <a href={BRAND.whatsappHref}>Send me this quote</a>
      </Button>
    ),
    footnote: (
      <Button asChild variant="ghost" isFullWidth>
        <a href={BRAND.whatsappHref}>Taste it first — free office tasting</a>
      </Button>
    ),
  },
  decorators: [
    (Story) => (
      <div data-surface="ink" className="bg-surface-inverse p-6">
        <Story />
      </div>
    ),
  ],
  play: proveRingsWhole,
};

export const AmountOnly: Story = {
  args: {
    badge: undefined,
    was: undefined,
    lines: [],
    total: undefined,
    note: undefined,
    alerts: undefined,
  },
};

/** The smallest supported viewport: the padding shrinks to 18px and still holds the ring. */
export const Mobile: Story = { globals: VIEWPORT_360, play: proveRingsWhole };
export const Tablet: Story = { globals: VIEWPORT_768 };
export const Desktop: Story = { globals: VIEWPORT_1280 };
```

- [ ] **Step 7: Export**

```ts
export { QuotePanel, type QuotePanelProps } from "./organisms/quote-panel/quote-panel";
```

- [ ] **Step 8: Format, gate, commit**

```bash
pnpm exec prettier --write packages/ui/src/organisms/quote-panel packages/ui/src/lib/story-ring.ts packages/design-tokens/tokens/component/quote-panel.json packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
git add packages/design-tokens/tokens/component/quote-panel.json packages/ui/src/organisms/quote-panel packages/ui/src/lib/story-ring.ts packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): add the QuotePanel organism

The calculators' estimate panel in three tones — brand with the diamond,
ink, and a white light island — with the big amount, a screen-reader-named
struck price, money lines and total as a definition list, and slots for
alerts, the action and a footnote.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 7: OrderTracker

**Dev reference:** `git show dev:packages/ui/src/organisms/order-tracker/order-tracker.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                       | Ruling  | Where / clause                                                                                                                                                                                     |
| -------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Leads with the current step's label and note                   | ALREADY | test "heads the screen with the current step…" (and a `status` live region)                                                                                                                        |
| The heading moves as the kitchen works                         | ALREADY | same test at `current={1}`                                                                                                                                                                         |
| "Preparing" until the last step, then "Ready"                  | DROP    | D9 — status copy is the `badge` slot (Contract deviations)                                                                                                                                         |
| Clamps an index past the end                                   | ALREADY | test "clamps a current index past the end…"                                                                                                                                                        |
| Code and outlet on one line                                    | ALREADY | test "prints the order code with its label and the outlet"                                                                                                                                         |
| StepTracker composed, current step marked                      | ALREADY | test "marks the current step in the tracker"                                                                                                                                                       |
| The tracker list is named ("Order progress")                   | ADD     | contract delta 3 (R110): `progressLabel`; test "marks the current step…"                                                                                                                           |
| Bare-string steps                                              | DROP    | spec §8.2 — object lists only                                                                                                                                                                      |
| What was paid and how                                          | ALREADY | test "formats the total beside the payment line"                                                                                                                                                   |
| No action when there is nowhere to go                          | ADD     | test "renders no action when none is given"                                                                                                                                                        |
| `onDone` / `doneLabel`                                         | DROP    | spec §8.1 — slots, not callbacks (`action`)                                                                                                                                                        |
| Card frame rounds and clips                                    | ALREADY | test "frames itself as a light card with variant=card"                                                                                                                                             |
| Merges a caller `className`                                    | ADD     | test "merges a caller className"                                                                                                                                                                   |
| axe                                                            | ALREADY | test "has no accessibility violations"                                                                                                                                                             |
| Default steps, code, outlet, payment, total                    | DROP    | D9                                                                                                                                                                                                 |
| Stories Default · EveryState · WithAction · CardFrame          | ALREADY | Playground · OrderIn/OnTheTandoor/Ready · Playground (`action` arg) · AsCard                                                                                                                       |
| Story DeliverySteps                                            | ADD     | `DeliverySteps`                                                                                                                                                                                    |
| Story Smallest                                                 | ADD     | `Mobile`                                                                                                                                                                                           |
| _(not in dev)_ the action's ring clears every clip             | ADD     | fold item 20; `play` on `OrderIn`, `AsCard`, `Mobile` (`ringClippers`)                                                                                                                             |
| _(not in dev)_ the card is not framed as a phone               | ADD     | the 340px phone frame wraps only `variant="flush"` (`AsCard` is 400px)                                                                                                                             |
| No steps → no empty heading (dev's `steps.length === 0` guard) | ADD     | batch E carried fix E5: with no step there is no heading, note, step list or divider; badge, code and receipt stay; test "renders no empty heading and no empty step list when there are no steps" |

Implementer: copy this table into your report, extended with anything the plan missed.

**Files:**

- Create: `packages/ui/src/organisms/order-tracker/order-tracker.tsx`, `order-tracker.test.tsx`, `order-tracker.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `Card`, `Divider`, `PatternField`, `Text`, `StepTracker`/`TrackerStep`, `formatRupees` (`@pink-paprikaa-web/utils`), `componentVariants`, `headingTag`; stories: `Badge`, `Button`.
- Produces: `OrderTracker`, `OrderTrackerProps`.

No component tokens: every dimension is on the 4px scale (18px = `4.5`, 30px = `7.5`).

- [ ] **Step 1: Write the failing test**

`packages/ui/src/organisms/order-tracker/order-tracker.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";

import type { TrackerStep } from "../../molecules/step-tracker/step-tracker";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { OrderTracker } from "./order-tracker";

const STEPS: TrackerStep[] = [
  { label: "Order in", note: "Kitchen's on it." },
  { label: "On the tandoor", note: "Chilli paneer is charring." },
  { label: "Ready for pickup", note: "Counter 2, ask for Paprikaa." },
];

describe("OrderTracker", () => {
  it("heads the screen with the current step and its note, in a live status region", () => {
    render(<OrderTracker steps={STEPS} current={1} code="PPK-4821" />);
    const status = screen.getByRole("status");
    expect(
      within(status).getByRole("heading", { level: 2, name: "On the tandoor" })
    ).toBeInTheDocument();
    expect(status).toHaveTextContent("Chilli paneer is charring.");
  });

  it("clamps a current index past the end to the last step", () => {
    render(<OrderTracker steps={STEPS} current={7} code="PPK-4821" />);
    expect(screen.getByRole("heading", { level: 2, name: "Ready for pickup" })).toBeInTheDocument();
  });

  it("renders no empty heading and no empty step list when there are no steps", async () => {
    const { container } = render(
      <OrderTracker steps={[]} current={0} code="PPK-4821" badge={<span>Preparing</span>} />
    );
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(within(screen.getByRole("status")).getByText("Preparing")).toBeInTheDocument();
    expect(screen.getByText("Order #PPK-4821")).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("marks the current step in the tracker, named Order progress", () => {
    render(<OrderTracker steps={STEPS} current={1} code="PPK-4821" />);
    const tracker = screen.getByRole("list", { name: "Order progress" });
    expect(
      within(tracker).getByText("On the tandoor").closest('[aria-current="step"]')
    ).not.toBeNull();
  });

  it("takes the tracker's name from progressLabel", () => {
    render(
      <OrderTracker steps={STEPS} current={1} code="PPK-4821" progressLabel="Delivery progress" />
    );
    expect(screen.getByRole("list", { name: "Delivery progress" })).toBeInTheDocument();
  });

  it("prints the order code with its label and the outlet", () => {
    render(<OrderTracker steps={STEPS} current={0} code="PPK-4821" outlet="Sector 57, Gurgaon" />);
    expect(screen.getByText("Order #PPK-4821 · Sector 57, Gurgaon")).toBeInTheDocument();
  });

  it("formats the total beside the payment line", () => {
    render(<OrderTracker steps={STEPS} current={0} code="PPK-4821" total={1239} payment="UPI" />);
    expect(screen.getByText("Paid · UPI")).toBeInTheDocument();
    expect(screen.getByText("₹1,239")).toBeInTheDocument();
  });

  it("renders the badge and action slots", () => {
    render(
      <OrderTracker
        steps={STEPS}
        current={0}
        code="PPK-4821"
        badge={<span>Preparing</span>}
        action={<a href="#home">Back to Home</a>}
      />
    );
    expect(within(screen.getByRole("status")).getByText("Preparing")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Home" })).toBeInTheDocument();
  });

  it("renders no action when none is given", () => {
    render(<OrderTracker steps={STEPS} current={0} code="PPK-4821" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("merges a caller className", () => {
    const { container } = render(
      <OrderTracker steps={STEPS} current={0} code="PPK-4821" className="bg-surface-page" />
    );
    expect(container.firstElementChild).toHaveClass("flex", "bg-surface-page");
  });

  it("frames itself as a light card with variant=card", () => {
    const { container } = render(
      <OrderTracker steps={STEPS} current={0} code="PPK-4821" variant="card" />
    );
    expect(container.firstElementChild).toHaveAttribute("data-surface", "light");
    expect(container.firstElementChild).toHaveClass("rounded-xl");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <OrderTracker
        steps={STEPS}
        current={1}
        code="PPK-4821"
        outlet="Sector 57, Gurgaon"
        total={1239}
        payment="UPI"
        badge={<span>Preparing</span>}
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- order-tracker 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./order-tracker`.

- [ ] **Step 3: Implement**

`packages/ui/src/organisms/order-tracker/order-tracker.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { Card } from "../../atoms/card/card";
import { Divider } from "../../atoms/divider/divider";
import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { Text } from "../../atoms/text/text";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { StepTracker, type TrackerStep } from "../../molecules/step-tracker/step-tracker";

const orderTracker = componentVariants({
  slots: {
    root: "flex flex-col",
    header: "px-5 pt-4.5 pb-7.5",
    status: "flex flex-col items-start gap-1.5",
    title: "mt-1.5",
    code: "mt-4.5 uppercase",
    body: "grid gap-3.5 p-5",
    divider: "my-1.5",
    receipt: "flex justify-between gap-3",
    total: "font-display",
  },
  variants: {
    variant: {
      flush: { root: "min-h-0 flex-1 overflow-y-auto" },
      card: {
        root: "overflow-hidden rounded-xl border border-border-subtle bg-surface-card shadow-1",
      },
    },
  },
  defaultVariants: { variant: "flush" },
});

export interface OrderTrackerProps
  extends ComponentProps<"section">, Pick<VariantProps<typeof orderTracker>, "variant"> {
  /**
   * Brand-voice steps ("Kitchen's on it."), never system status. With none there is no heading
   * and no step list; the badge, code and receipt still render.
   */
  steps: TrackerStep[];
  /** Index of the current step; clamped to the steps given. */
  current: number;
  /** Order code, uppercase, without the hash. */
  code: string;
  /** The word before the code: "Order #PPK-4821". */
  codeLabel?: string | undefined;
  outlet?: string | undefined;
  total?: number | undefined;
  /** The payment method, e.g. "UPI" — the line reads "Paid · UPI". */
  payment?: string | undefined;
  /** The word before the method. */
  paymentLabel?: string | undefined;
  /** The step list's accessible name. */
  progressLabel?: string | undefined;
  /** The status chip in the header, e.g. `<Badge tone="ink">Preparing</Badge>`. */
  badge?: ReactNode;
  /** Usually one full-width secondary Button ("Back to Home"). */
  action?: ReactNode;
  headingLevel?: HeadingLevel | undefined;
}

/**
 * The screen a guest watches while the kitchen cooks: a flooded-pink header announcing the
 * current step (a polite live region, so updates are read out), the step tracker and the receipt.
 */
export function OrderTracker({
  steps,
  current,
  code,
  codeLabel = "Order",
  outlet,
  total,
  payment,
  paymentLabel = "Paid",
  progressLabel = "Order progress",
  badge,
  action,
  variant = "flush",
  headingLevel = 2,
  className,
  ...props
}: OrderTrackerProps) {
  const slots = orderTracker({ variant });
  const index = Math.min(Math.max(current, 0), steps.length - 1);
  const step = steps[index];
  const hasReceipt = payment !== undefined || total !== undefined;
  return (
    <section
      data-surface={variant === "card" ? "light" : undefined}
      className={slots.root({ className })}
      {...props}
    >
      <PatternField tone="brand" tile={56} className={slots.header()}>
        <div role="status" className={slots.status()}>
          {badge}
          {step === undefined ? null : (
            <>
              <Text as={headingTag(headingLevel)} variant="h2" className={slots.title()}>
                {step.label}
              </Text>
              {step.note ? (
                <Text as="div" tone="muted">
                  {step.note}
                </Text>
              ) : null}
            </>
          )}
        </div>
        <Text as="div" variant="mono" tone="muted" className={slots.code()}>
          {codeLabel} #{code}
          {outlet ? ` · ${outlet}` : null}
        </Text>
      </PatternField>
      <div className={slots.body()}>
        {step === undefined ? null : (
          <>
            <StepTracker steps={steps} current={index} aria-label={progressLabel} />
            <Divider variant="diamond" className={slots.divider()} />
          </>
        )}
        {hasReceipt ? (
          <Card variant="quiet" padding="sm">
            <div className={slots.receipt()}>
              <Text as="span" variant="body-sm" tone="muted">
                {payment === undefined ? null : `${paymentLabel} · ${payment}`}
              </Text>
              {total === undefined ? null : (
                <Text as="span" variant="body-sm" weight="bold" className={slots.total()}>
                  {formatRupees(total)}
                </Text>
              )}
            </div>
          </Card>
        ) : null}
        {action}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- order-tracker 2>&1 | tail -8`
Expected: PASS (12 tests).

- [ ] **Step 5: Stories (card parity with `OrderTracker.card.html`)**

`packages/ui/src/organisms/order-tracker/order-tracker.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import type { TrackerStep } from "../../molecules/step-tracker/step-tracker";

import { Badge } from "../../atoms/badge/badge";
import { Button } from "../../atoms/button/button";
import { ringClippers } from "../../lib/story-ring";
import { VIEWPORT_360 } from "../story-fixtures";
import { OrderTracker } from "./order-tracker";

/** The design system's brand-voice steps. */
const STEPS: TrackerStep[] = [
  { label: "Order in", note: "Kitchen's on it." },
  { label: "On the tandoor", note: "Chilli paneer is charring." },
  { label: "Ready for pickup", note: "Counter 2, ask for Paprikaa." },
];

const BACK_HOME = (
  <Button asChild variant="secondary" isFullWidth>
    <a href="#home">Back to Home</a>
  </Button>
);

const meta = {
  title: "Organisms/OrderTracker",
  component: OrderTracker,
  args: {
    steps: STEPS,
    current: 0,
    code: "PPK-4821",
    outlet: "Sector 57, Gurgaon",
    total: 1239,
    payment: "UPI",
    badge: <Badge tone="ink">Preparing</Badge>,
    action: BACK_HOME,
  },
  decorators: [
    // The flush tracker fills a phone screen; the card sits on a page at its own width, so the
    // 340px frame would cut its edge.
    (Story, { args }) =>
      args.variant === "card" ? (
        <Story />
      ) : (
        <div className="flex h-165 w-85 flex-col overflow-hidden rounded-lg border border-border-subtle">
          <Story />
        </div>
      ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Live order status after checkout — the screen a guest watches while the kitchen cooks. Step copy is brand voice ("Kitchen\'s on it."), never system status. The header is a flooded pink field and a polite live region, so each step change is read out.',
      },
    },
  },
} satisfies Meta<typeof OrderTracker>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The flush tracker scrolls (`overflow-y-auto`) and the card clips (`overflow-hidden`), so the
 * body's padding must hold the action's focus ring whole: tab to it and prove nothing cuts it.
 */
const proveActionRingWhole: Story["play"] = async ({ canvas, userEvent }) => {
  await userEvent.tab();
  const action = canvas.getByRole("link", { name: "Back to Home" });
  await expect(action).toHaveFocus();
  await expect(action.matches(":focus-visible")).toBe(true);
  await expect(ringClippers(action)).toEqual([]);
};

export const Playground: Story = {};

/** Card row: the start — order in. */
export const OrderIn: Story = { args: { current: 0 }, play: proveActionRingWhole };

export const OnTheTandoor: Story = { args: { current: 1 } };

/** Card row: ready for pickup. */
export const Ready: Story = { args: { current: 2, badge: <Badge tone="ink">Ready</Badge> } };

export const AsCard: Story = {
  args: { variant: "card", current: 1 },
  decorators: [
    (Story) => (
      <div className="w-100">
        <Story />
      </div>
    ),
  ],
  play: proveActionRingWhole,
};

/** Delivery runs its own two steps — as short as the tracker is worth drawing. */
export const DeliverySteps: Story = {
  args: {
    current: 1,
    steps: [
      { label: "Order in", note: "Kitchen's on it." },
      { label: "On its way", note: "Riding out to you now." },
    ],
  },
};

/** The smallest supported viewport: the header copy wraps, nothing clips. */
export const Mobile: Story = {
  args: { current: 1 },
  globals: VIEWPORT_360,
  play: proveActionRingWhole,
};
```

- [ ] **Step 6: Export**

```ts
export { OrderTracker, type OrderTrackerProps } from "./organisms/order-tracker/order-tracker";
```

- [ ] **Step 7: Format, gate, commit**

```bash
pnpm exec prettier --write packages/ui/src/organisms/order-tracker packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
git add packages/ui/src/organisms/order-tracker packages/ui/src/index.ts
git commit -m "feat(ui): add the OrderTracker organism

A flooded-pink status header that announces the current step politely,
the step tracker, and the receipt with the total in rupees; flush for the
app screen or framed as a light card. Status chip, code label and payment
line are the app's copy.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 8: SiteFooter

**Dev reference:** `git show dev:packages/ui/src/organisms/site-footer/site-footer.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                         | Ruling  | Where / clause                                                                             |
| -------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------ |
| The `contentinfo` landmark                                                       | ALREADY | test "is the page's contentinfo landmark…"                                                 |
| White lockup built in                                                            | DROP    | D9 — the `brand` slot (stories pass `<Logo tone="white">`)                                 |
| Floods `bg-surface-brand`                                                        | ADD     | the tone `it.each` asserts the background class                                            |
| Default columns, blurb, statement, FSSAI licence, legal entity, policies, social | DROP    | D9 — the August fake FSSAI default; Review Focus 5 test                                    |
| Caller columns replace everything                                                | ALREADY | test "renders exactly what it is given…"                                                   |
| Social links named, new tab, `rel`                                               | ALREADY | test "names each social link and opens it in a new tab"                                    |
| Social links keep the 44px hit target                                            | ALREADY | IconButton's `::before` hit area (Plan 2a)                                                 |
| Generic glyphs for the networks (AtSign, Play, Briefcase)                        | DROP    | D10 — the real brand glyphs                                                                |
| Policy links                                                                     | ALREADY | test "renders the brand block, legal lines and policy links…"                              |
| Column headings as `<p>`                                                         | DROP    | spec §9.3 — "headings not `<p>`"                                                           |
| `Link variant="inverse"`, `Divider on="brand"`                                   | DROP    | D5                                                                                         |
| Merges a caller `className`                                                      | ADD     | test "merges a caller className over its own, and the diamond layer lets that ground show" |
| axe                                                                              | ALREADY | test "has no accessibility violations"                                                     |
| Stories Default · OneColumn · OwnCopy · Smallest                                 | ALREADY | DesignSystemPink · ColumnsOnly · Playground (`brand` slot) · Mobile                        |
| Story FourColumns                                                                | ADD     | `FourColumns`                                                                              |

Implementer: copy this table into your report, extended with anything the plan missed.

**Files:**

- Create: `packages/design-tokens/tokens/component/site-footer.json`
- Create: `packages/ui/src/organisms/site-footer/site-footer.tsx`, `site-footer.test.tsx`, `site-footer.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `Icon`/`IconComponent`, `InstagramGlyph`/`YoutubeGlyph`/`LinkedinGlyph`, `IconButton` (`asChild`), `PatternField`, `Text`, `LinkAs`/`LinkAsProps`, `componentVariants`, `headingTag`; the `autogrid-min-sm` utility (Plan 2c — the handoff footer's 200px column minimum); stories: `Badge`, `DietMark`, `Logo`.
- Produces: `SiteFooter`, `SiteFooterProps`, `FooterItem`, `FooterColumn`, `FooterSocialLink`, `FooterPolicy`; the `pb-site-footer-dock-clearance` contract that Task 9 relies on.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/site-footer.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "site-footer-top": {
      "$value": "clamp(44px, 5vw, 64px)",
      "$description": "Footer top padding (design system SiteFooter)."
    },
    "site-footer-gap": { "$value": "clamp(28px, 3vw, 40px)" },
    "site-footer-dock-clearance": {
      "$value": "calc(110px + env(safe-area-inset-bottom, 0px))",
      "$description": "Bottom padding when an ActionDock is on the page — the handoff's 110px plus the iOS home-indicator inset, more than the dock's own height, so it never covers the legal links."
    }
  }
}
```

Append to `SPACING`:

```ts
  "site-footer-top",
  "site-footer-gap",
  "site-footer-dock-clearance",
```

- [ ] **Step 2: Write the failing test**

`packages/ui/src/organisms/site-footer/site-footer.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";
import { Phone } from "lucide-react";

import type { LinkAsProps } from "../../lib/link-as";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { type FooterColumn, SiteFooter } from "./site-footer";

const COLUMNS: FooterColumn[] = [
  {
    heading: "Eat with us",
    items: [
      { label: "Homely Meals", href: "#homely-meals" },
      { label: "Catering & Bulk Orders", href: "#catering" },
    ],
  },
  {
    heading: "Talk to us",
    items: [{ label: "Call +91 90907 04001", href: "tel:+919090704001", icon: Phone }],
  },
  { heading: "Kitchen & restaurant", items: [{ label: "8am – 11:30pm, every day" }] },
];

function RouterLink({ href, className, children }: LinkAsProps) {
  return (
    <a href={href} className={className} data-router-link="">
      {children}
    </a>
  );
}

describe("SiteFooter", () => {
  it("is the page's contentinfo landmark with one labelled nav per link column", () => {
    render(<SiteFooter columns={COLUMNS} />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    const eat = screen.getByRole("navigation", { name: "Eat with us" });
    expect(within(eat).getByRole("heading", { level: 2, name: "Eat with us" })).toBeInTheDocument();
    expect(within(eat).getAllByRole("listitem")).toHaveLength(2);
    expect(within(eat).getByRole("link", { name: "Homely Meals" })).toHaveAttribute(
      "href",
      "#homely-meals"
    );
  });

  it("keeps a column with no links out of the navigation landmarks", () => {
    render(<SiteFooter columns={COLUMNS} />);
    expect(
      screen.queryByRole("navigation", { name: "Kitchen & restaurant" })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kitchen & restaurant" })).toBeInTheDocument();
    expect(screen.getByText("8am – 11:30pm, every day").closest("a")).toBeNull();
  });

  it("renders exactly what it is given — no licence, tax, contact or social defaults", () => {
    const { container } = render(
      <SiteFooter
        columns={[{ heading: "Eat with us", items: [{ label: "Homely Meals", href: "#homely" }] }]}
      />
    );
    expect(container.textContent).toBe("Eat with usHomely Meals");
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(container.textContent).not.toMatch(/FSSAI|GSTIN|©|\+91|pinkpaprikaa\.com/);
  });

  it("names each social link and opens it in a new tab", () => {
    render(
      <SiteFooter
        columns={COLUMNS}
        social={[
          { network: "instagram", href: "https://instagram.com/pinkpaprikaa", label: "Instagram" },
          { network: "youtube", href: "https://youtube.com/@pinkpaprikaa", label: "YouTube" },
        ]}
      />
    );
    // The aria-label overrides the anchor's content, so the label itself announces the new tab (R111).
    const instagram = screen.getByRole("link", { name: "Instagram (Opens in a new tab)" });
    expect(instagram).toHaveAttribute("href", "https://instagram.com/pinkpaprikaa");
    expect(instagram).toHaveAttribute("target", "_blank");
    expect(instagram).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: "YouTube (Opens in a new tab)" })).toBeInTheDocument();
  });

  it("renders the brand block, legal lines and policy links it is given", () => {
    render(
      <SiteFooter
        columns={COLUMNS}
        brand={<p>100% Pure Veg Kitchen</p>}
        legal={<span>© 2026 Paprikaa Culinary Ventures Private Limited</span>}
        policies={[
          { label: "Privacy Policy", href: "#privacy" },
          { label: "Terms of Service", href: "#terms" },
        ]}
      />
    );
    expect(screen.getByText("100% Pure Veg Kitchen")).toBeInTheDocument();
    expect(
      screen.getByText("© 2026 Paprikaa Culinary Ventures Private Limited")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
      "href",
      "#privacy"
    );
  });

  it("renders column and policy links through linkAs", () => {
    render(
      <SiteFooter
        columns={COLUMNS}
        policies={[{ label: "Privacy Policy", href: "#privacy" }]}
        linkAs={RouterLink}
      />
    );
    expect(screen.getByRole("link", { name: "Homely Meals" })).toHaveAttribute("data-router-link");
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
      "data-router-link"
    );
  });

  it.each([
    ["brand", "bg-surface-brand"],
    ["ink", "bg-surface-inverse"],
  ] as const)("sets the %s surface and paints its field", (tone, background) => {
    render(<SiteFooter columns={COLUMNS} tone={tone} />);
    expect(screen.getByRole("contentinfo")).toHaveAttribute("data-surface", tone);
    expect(screen.getByRole("contentinfo")).toHaveClass(background);
  });

  it("merges a caller className over its own, and the diamond layer lets that ground show", () => {
    const { container } = render(
      <SiteFooter columns={COLUMNS} pattern="default" className="bg-surface-inverse" />
    );
    const layer = container.querySelector('footer > [aria-hidden="true"]');
    expect(screen.getByRole("contentinfo")).toHaveClass("bg-surface-inverse");
    expect(screen.getByRole("contentinfo")).not.toHaveClass("bg-surface-brand");
    expect(layer).toHaveClass("bg-transparent");
    expect(layer).not.toHaveClass("bg-surface-brand");
  });

  it("carries the faint diamond on ink by default and none on brand", () => {
    const { container, rerender } = render(<SiteFooter columns={COLUMNS} tone="ink" />);
    const layer = () => container.querySelector('footer > [aria-hidden="true"]');
    expect(layer()).toBeInTheDocument();
    rerender(<SiteFooter columns={COLUMNS} tone="brand" />);
    expect(layer()).not.toBeInTheDocument();
    rerender(<SiteFooter columns={COLUMNS} tone="brand" pattern="default" />);
    expect(layer()).toBeInTheDocument();
  });

  it("pads the bottom clear of an ActionDock only when asked", () => {
    const { rerender } = render(<SiteFooter columns={COLUMNS} />);
    expect(screen.getByRole("contentinfo")).toHaveClass("pb-10");
    rerender(<SiteFooter columns={COLUMNS} hasDockClearance />);
    expect(screen.getByRole("contentinfo")).toHaveClass("pb-site-footer-dock-clearance");
    expect(screen.getByRole("contentinfo")).not.toHaveClass("pb-10");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <SiteFooter
        tone="ink"
        columns={COLUMNS}
        brand={<p>100% Pure Veg Kitchen</p>}
        social={[
          { network: "instagram", href: "https://instagram.com/pinkpaprikaa", label: "Instagram" },
        ]}
        legal={<span>© 2026 Paprikaa Culinary Ventures Private Limited</span>}
        policies={[{ label: "Privacy Policy", href: "#privacy" }]}
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- site-footer 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./site-footer`.

- [ ] **Step 4: Implement**

`packages/ui/src/organisms/site-footer/site-footer.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import type { LinkAs } from "../../lib/link-as";

import { InstagramGlyph, LinkedinGlyph, YoutubeGlyph } from "../../atoms/icon/brand-glyphs";
import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { IconButton } from "../../atoms/icon-button/icon-button";
import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { Text } from "../../atoms/text/text";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";

export interface FooterItem {
  label: ReactNode;
  /** Omit for a plain line (an address, opening hours). */
  href?: string | undefined;
  icon?: IconComponent | undefined;
}

export interface FooterColumn {
  heading: string;
  items: FooterItem[];
}

export interface FooterSocialLink {
  network: "instagram" | "youtube" | "linkedin";
  href: string;
  /** Accessible name, e.g. "Pink Paprikaa on Instagram"; the footer appends " (Opens in a new tab)". */
  label: string;
}

export interface FooterPolicy {
  label: string;
  href: string;
}

const SOCIAL_GLYPH: Readonly<Record<FooterSocialLink["network"], IconComponent>> = {
  instagram: InstagramGlyph,
  youtube: YoutubeGlyph,
  linkedin: LinkedinGlyph,
};

const siteFooter = componentVariants({
  slots: {
    root: "relative",
    // A decorative layer only: the footer's own ground (or a caller's) shows through it.
    pattern: "absolute inset-0 bg-transparent",
    grid: "gap-site-footer-gap pt-site-footer-top relative container-page grid autogrid-min-sm pb-8",
    brand: "flex flex-col items-start gap-3.5",
    social: "flex gap-2",
    column: "flex min-w-0 flex-col gap-3.5",
    items: "flex flex-col items-start gap-2.5",
    item: "inline-flex items-start gap-2 text-body text-text-body",
    link: "inline-flex items-start gap-2 text-body text-text-link no-underline hover:underline",
    itemIcon: "mt-1",
    legal: "relative container-page",
    legalBar:
      "flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5 border-t border-border-subtle pt-5 text-caption text-text-subtle",
    legalText: "flex flex-wrap gap-x-6 gap-y-2.5",
    policies: "flex flex-wrap gap-x-5 gap-y-2.5",
    policyLink: "text-text-muted no-underline hover:underline",
  },
  variants: {
    tone: {
      brand: { root: "bg-surface-brand" },
      ink: { root: "bg-surface-inverse" },
    },
    hasDockClearance: {
      true: { root: "pb-site-footer-dock-clearance" },
      false: { root: "pb-10" },
    },
  },
  defaultVariants: { tone: "brand", hasDockClearance: false },
});

type FooterTone = NonNullable<VariantProps<typeof siteFooter>["tone"]>;
type FooterPattern = "none" | "default" | "faint";

/** The design system's pink footer is flat; the handoff's ink footer carries the 4% diamond. */
const DEFAULT_PATTERN: Readonly<Record<FooterTone, FooterPattern>> = {
  brand: "none",
  ink: "faint",
};

export interface SiteFooterProps
  extends ComponentProps<"footer">, Pick<VariantProps<typeof siteFooter>, "tone"> {
  /** The brand block — lockup, veg chip, licence line, blurb, contact lines: whatever the app passes. */
  brand?: ReactNode;
  columns: FooterColumn[];
  social?: FooterSocialLink[] | undefined;
  /** Legal lines (©, GSTIN), rendered verbatim. The system holds no company facts. */
  legal?: ReactNode;
  policies?: FooterPolicy[] | undefined;
  linkAs?: LinkAs | undefined;
  /** Defaults to `none` on brand and `faint` on ink. */
  pattern?: FooterPattern | undefined;
  /** Pad the bottom so the page's ActionDock never covers the legal links. */
  hasDockClearance?: boolean | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/**
 * The site footer: brand block, link columns (each a labelled nav with list markup; a column of
 * plain lines stays a plain group), social links and the legal bar. It renders exactly what it
 * is given — the FSSAI line, GSTIN and © come from the app's brand facts, never from here.
 */
export function SiteFooter({
  tone = "brand",
  brand,
  columns,
  social = [],
  legal,
  policies = [],
  linkAs: LinkComponent = "a",
  pattern,
  hasDockClearance = false,
  headingLevel = 2,
  className,
  ...props
}: SiteFooterProps) {
  const slots = siteFooter({ tone, hasDockClearance });
  const density = pattern ?? DEFAULT_PATTERN[tone];
  const heading = headingTag(headingLevel);
  const hasBrandBlock = brand !== undefined || social.length > 0;
  const hasLegalBar = legal !== undefined || policies.length > 0;
  return (
    <footer data-surface={tone} className={slots.root({ className })} {...props}>
      {density === "none" ? null : (
        <PatternField
          aria-hidden
          tone={tone}
          tile={80}
          density={density}
          className={slots.pattern()}
        />
      )}
      <div className={slots.grid()}>
        {hasBrandBlock ? (
          <div className={slots.brand()}>
            {brand}
            {social.length > 0 ? (
              <ul className={slots.social()}>
                {social.map((link) => (
                  <li key={link.network}>
                    <IconButton
                      asChild
                      icon={SOCIAL_GLYPH[link.network]}
                      label={`${link.label} (Opens in a new tab)`}
                      variant="secondary"
                    >
                      <a
                        href={link.href}
                        aria-label={`${link.label} (Opens in a new tab)`}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    </IconButton>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
        {columns.map((column) => {
          const Column = column.items.some((item) => item.href !== undefined) ? "nav" : "div";
          return (
            <Column
              key={column.heading}
              aria-label={Column === "nav" ? column.heading : undefined}
              className={slots.column()}
            >
              <Text as={heading} variant="overline" tone="brand">
                {column.heading}
              </Text>
              <ul className={slots.items()}>
                {column.items.map((item, index) => {
                  const icon = item.icon ? (
                    <Icon icon={item.icon} size="sm" className={slots.itemIcon()} />
                  ) : null;
                  return (
                    <li key={index}>
                      {item.href === undefined ? (
                        <span className={slots.item()}>
                          {icon}
                          {item.label}
                        </span>
                      ) : (
                        <LinkComponent href={item.href} className={slots.link()}>
                          {icon}
                          {item.label}
                        </LinkComponent>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Column>
          );
        })}
      </div>
      {hasLegalBar ? (
        <div className={slots.legal()}>
          <div className={slots.legalBar()}>
            {legal === undefined ? null : <div className={slots.legalText()}>{legal}</div>}
            {policies.length > 0 ? (
              <ul className={slots.policies()}>
                {policies.map((policy) => (
                  <li key={policy.href}>
                    <LinkComponent href={policy.href} className={slots.policyLink()}>
                      {policy.label}
                    </LinkComponent>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}
    </footer>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- site-footer 2>&1 | tail -8`
Expected: PASS (12 tests).

- [ ] **Step 6: Stories (card parity with `SiteFooter.card.html` + handoff `PPFooter`)**

`packages/ui/src/organisms/site-footer/site-footer.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { CreditCard, Mail, MessageCircle, Phone } from "lucide-react";

import { Badge } from "../../atoms/badge/badge";
import { DietMark } from "../../atoms/diet-mark/diet-mark";
import { Logo } from "../../atoms/logo/logo";
import { Text } from "../../atoms/text/text";
import { BRAND, VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { type FooterColumn, type FooterSocialLink, SiteFooter } from "./site-footer";

/** The design system card's columns (its sample information architecture). */
const DS_COLUMNS: FooterColumn[] = [
  {
    heading: "Eat",
    items: [
      { label: "Full Menu", href: "#menu" },
      { label: "Small Plates", href: "#small-plates" },
      { label: "Chai & Coffee", href: "#chai" },
      { label: "Sweets", href: "#sweets" },
    ],
  },
  {
    heading: "Visit",
    items: [
      { label: "Outlets", href: "#outlets" },
      { label: "Book a Table", href: "#book" },
      { label: "Private Dining", href: "#private-dining" },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: "Our Story", href: "#about" },
      { label: "Careers", href: "#careers" },
    ],
  },
];

/** The handoff footer's columns, with the brand facts from story-fixtures. */
const HANDOFF_COLUMNS: FooterColumn[] = [
  {
    heading: "Eat with us",
    items: [
      { label: "Homely Meals", href: "#homely-meals" },
      { label: "This week’s menu", href: "#this-week" },
      { label: "Catering & Bulk Orders", href: "#catering" },
      { label: "Office & PG Lunch", href: "#office-lunch" },
      { label: "Restaurant Menu", href: "#menu" },
    ],
  },
  {
    heading: "Talk to us",
    items: [
      { label: `WhatsApp ${BRAND.phoneDisplay}`, href: BRAND.whatsappHref, icon: MessageCircle },
      { label: `Call ${BRAND.phoneDisplay}`, href: BRAND.phoneHref, icon: Phone },
      { label: BRAND.email, href: BRAND.emailHref, icon: Mail },
      { label: "About us", href: "#about" },
      { label: "Contact & directions", href: "#contact" },
    ],
  },
  {
    heading: "Kitchen & restaurant",
    items: [
      { label: BRAND.address },
      { label: BRAND.hours },
      { label: BRAND.payments, icon: CreditCard },
      { label: `Instagram ${BRAND.instagramHandle}`, href: BRAND.instagramHref },
    ],
  },
];

const SOCIAL: FooterSocialLink[] = [
  { network: "instagram", href: BRAND.instagramHref, label: "Pink Paprikaa on Instagram" },
  { network: "youtube", href: BRAND.youtubeHref, label: "Pink Paprikaa on YouTube" },
  { network: "linkedin", href: BRAND.linkedinHref, label: "Pink Paprikaa on LinkedIn" },
];

const meta = {
  title: "Organisms/SiteFooter",
  component: SiteFooter,
  args: {
    tone: "brand",
    columns: DS_COLUMNS,
    brand: (
      <>
        <Logo tone="white" className="w-65" />
        <Text variant="body-sm" tone="muted">
          Chai at 8am, chilli paneer at midnight. One kitchen in Sector 57, Gurgaon.
        </Text>
        <div className="flex flex-col gap-1">
          <Text as="span" variant="body-sm">
            {BRAND.website}
          </Text>
          <Text as="span" variant="body-sm">
            {BRAND.phoneDisplay}
          </Text>
          <Text as="span" variant="body-sm">
            {BRAND.email}
          </Text>
        </div>
      </>
    ),
    social: SOCIAL,
    legal: (
      <>
        <span>{BRAND.copyright}</span>
        <span>{BRAND.fssai}</span>
      </>
    ),
    policies: [
      { label: "Privacy", href: "#privacy" },
      { label: "Terms", href: "#terms" },
      { label: "Refunds", href: "#refunds" },
    ],
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The site footer — a flooded field (pink in the design system, ink with the faint diamond in the handoff), brand block, link columns, social links and the legal bar. It renders exactly what it is given: the FSSAI licence line (legally required on Indian food sites), GSTIN and © come from the app's brand facts. Columns auto-fit and collapse to one on mobile. Pass `hasDockClearance` on pages with an ActionDock.",
      },
    },
  },
} satisfies Meta<typeof SiteFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row: the full design-system footer (brand tone). */
export const DesignSystemPink: Story = {};

/** Handoff PPFooter — ink, faint diamond, contact rows with icons, dock clearance. */
export const HandoffInk: Story = {
  args: {
    tone: "ink",
    columns: HANDOFF_COLUMNS,
    brand: (
      <>
        <Logo tone="white" className="w-50" />
        <Badge tone="success">
          <DietMark size="sm" />
          100% Pure Veg Kitchen
        </Badge>
        <Text as="span" variant="mono" tone="muted">
          {BRAND.fssai}
        </Text>
      </>
    ),
    social: [],
    legal: (
      <>
        <span>{BRAND.copyright}</span>
        <span>{BRAND.gstin}</span>
      </>
    ),
    policies: [
      { label: "Privacy Policy", href: "#privacy" },
      { label: "Terms of Service", href: "#terms" },
      { label: "Refund & Cancellation", href: "#refunds" },
      { label: "Delivery Policy", href: "#delivery" },
    ],
    hasDockClearance: true,
  },
};

/** Only columns given — nothing else appears (no default facts). */
export const ColumnsOnly: Story = {
  args: {
    brand: undefined,
    social: [],
    legal: undefined,
    policies: [],
    columns: HANDOFF_COLUMNS.slice(0, 1),
  },
};

/** Four link columns still fit; a fifth belongs on a page, not in the footer. */
export const FourColumns: Story = {
  args: {
    columns: [
      ...DS_COLUMNS,
      {
        heading: "Help",
        items: [
          { label: "Contact & directions", href: "#contact" },
          { label: "Delivery Policy", href: "#delivery" },
        ],
      },
    ],
  },
};

export const Mobile: Story = { ...HandoffInk, globals: VIEWPORT_360 };
export const Tablet: Story = { ...HandoffInk, globals: VIEWPORT_768 };
export const Desktop: Story = { ...HandoffInk, globals: VIEWPORT_1280 };
```

- [ ] **Step 7: Export**

```ts
export {
  type FooterColumn,
  type FooterItem,
  type FooterPolicy,
  type FooterSocialLink,
  SiteFooter,
  type SiteFooterProps,
} from "./organisms/site-footer/site-footer";
```

- [ ] **Step 8: Format, gate, commit**

```bash
pnpm exec prettier --write packages/ui/src/organisms/site-footer packages/design-tokens/tokens/component/site-footer.json packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
git add packages/design-tokens/tokens/component/site-footer.json packages/ui/src/organisms/site-footer packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): add the SiteFooter organism

Pink or ink footer with brand block, link columns as labelled navs (plain
lines stay plain), social links and the legal bar, all rendered through
linkAs. It carries no company facts: the test proves a footer given only a
column prints only that column — the August port's fake FSSAI default
cannot come back. hasDockClearance pads it clear of the ActionDock.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 9: ActionDock

**Dev reference:** none (handoff component)

**Files:**

- Create: `packages/design-tokens/tokens/component/action-dock.json`
- Create: `packages/ui/src/organisms/action-dock/action-dock.tsx`, `action-dock.test.tsx`, `action-dock.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `Button` / `IconButton` (`asChild`), `IconComponent`, `componentVariants`; test and stories: `SiteFooter` (Task 8).
- Produces: `ActionDock`, `ActionDockProps`, `DockAction`.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/action-dock.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "action-dock-bottom": {
      "$value": "calc(10px + env(safe-area-inset-bottom, 0px))",
      "$description": "Mobile bar bottom padding: 10px plus the iOS home-indicator inset (handoff). Needs viewport-fit=cover in the app's viewport meta."
    },
    "action-dock-float": {
      "$value": "calc(24px + env(safe-area-inset-bottom, 0px))",
      "$description": "The floating pill's offset from the viewport bottom at md and up."
    }
  }
}
```

Append to `SPACING`:

```ts
  "action-dock-bottom",
  "action-dock-float",
```

- [ ] **Step 2: Write the failing test**

`packages/ui/src/organisms/action-dock/action-dock.test.tsx`:

```tsx
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { render, screen } from "@testing-library/react";
import { MessageCircle, Phone } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { SiteFooter } from "../site-footer/site-footer";
import { ActionDock, type DockAction } from "./action-dock";

// R15: a path from import.meta.dirname — Vite rewrites `new URL(…, import.meta.url)` under jsdom.
const theme = readFileSync(
  join(import.meta.dirname, "../../../../design-tokens/dist/theme.css"),
  "utf8"
);

const PRIMARY: DockAction = {
  label: "WhatsApp us",
  href: "https://wa.me/919090704001",
  icon: MessageCircle,
};
const SECONDARY: DockAction = { label: "Call", href: "tel:+919090704001", icon: Phone };

const dockOf = (link: HTMLElement) => link.closest('[data-surface="light"]');

describe("ActionDock", () => {
  it("offers the primary action as a labelled link", () => {
    render(<ActionDock primary={PRIMARY} secondary={SECONDARY} />);
    expect(screen.getByRole("link", { name: "WhatsApp us" })).toHaveAttribute("href", PRIMARY.href);
  });

  it("offers the secondary action as an icon link on phones only", () => {
    render(<ActionDock primary={PRIMARY} secondary={SECONDARY} />);
    const call = screen.getByRole("link", { name: "Call" });
    expect(call).toHaveAttribute("href", SECONDARY.href);
    expect(call).toHaveClass("md:hidden");
  });

  it("renders only the primary action when there is no secondary", () => {
    render(<ActionDock primary={PRIMARY} />);
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("pins to the viewport bottom on the dock layer, above the header and below overlays", () => {
    render(<ActionDock primary={PRIMARY} />);
    const dock = dockOf(screen.getByRole("link", { name: "WhatsApp us" }));
    expect(dock).toHaveClass("fixed", "bottom-0", "z-dock");
    expect(dock).toHaveClass("md:right-6", "md:inset-x-auto");
  });

  it("pads for the iOS home indicator on phones and floats clear of it from md", () => {
    render(<ActionDock primary={PRIMARY} />);
    const dock = dockOf(screen.getByRole("link", { name: "WhatsApp us" }));
    expect(dock).toHaveClass("pb-action-dock-bottom", "md:bottom-action-dock-float");
    expect(theme).toContain(
      "--spacing-action-dock-bottom: calc(10px + env(safe-area-inset-bottom, 0px));"
    );
    expect(theme).toContain(
      "--spacing-action-dock-float: calc(24px + env(safe-area-inset-bottom, 0px));"
    );
  });

  it("never covers the footer's last links: the footer pads clear of the dock", () => {
    render(
      <>
        <SiteFooter
          columns={[
            { heading: "Eat with us", items: [{ label: "Homely Meals", href: "#homely" }] },
          ]}
          policies={[{ label: "Privacy Policy", href: "#privacy" }]}
          hasDockClearance
        />
        <ActionDock primary={PRIMARY} secondary={SECONDARY} />
      </>
    );
    expect(screen.getByRole("contentinfo")).toHaveClass("pb-site-footer-dock-clearance");
    // 110px + inset clears the tallest dock: phone bar 10 + 48 + 10 (+ inset), desktop pill 24 + 54 (+ inset).
    expect(theme).toContain(
      "--spacing-site-footer-dock-clearance: calc(110px + env(safe-area-inset-bottom, 0px));"
    );
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<ActionDock primary={PRIMARY} secondary={SECONDARY} />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- action-dock 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./action-dock`.

- [ ] **Step 4: Implement**

`packages/ui/src/organisms/action-dock/action-dock.tsx`:

```tsx
import type { ComponentProps } from "react";

import type { IconComponent } from "../../atoms/icon/icon";

import { Button } from "../../atoms/button/button";
import { IconButton } from "../../atoms/icon-button/icon-button";
import { componentVariants } from "../../lib/component-variants";

export interface DockAction {
  label: string;
  /** A `https://wa.me/…` or `tel:` link — the app builds it. */
  href: string;
  icon: IconComponent;
}

const actionDock = componentVariants({
  slots: {
    root: "pb-action-dock-bottom md:bottom-action-dock-float fixed inset-x-0 bottom-0 z-dock flex gap-2 border-t border-border-subtle bg-surface-card px-3 pt-2.5 shadow-4 md:inset-x-auto md:right-6 md:border-0 md:bg-transparent md:p-0 md:shadow-none",
    secondary: "md:hidden",
    primary: "min-w-0 flex-1 shadow-brand md:flex-none",
  },
});

export interface ActionDockProps extends ComponentProps<"div"> {
  primary: DockAction;
  /** Phones only, as an icon beside the primary pill (the handoff's Call). */
  secondary?: DockAction | undefined;
}

/**
 * The page's always-there action. Below md: a white bar fixed to the bottom with the secondary
 * icon and the primary pill, padded for the iOS home indicator. From md: the primary pill alone,
 * floating bottom-right. Pair it with `SiteFooter hasDockClearance` so it never covers the footer.
 */
export function ActionDock({ primary, secondary, className, ...props }: ActionDockProps) {
  const slots = actionDock();
  return (
    <div data-surface="light" className={slots.root({ className })} {...props}>
      {secondary ? (
        <IconButton
          asChild
          icon={secondary.icon}
          label={secondary.label}
          variant="secondary"
          size="lg"
          className={slots.secondary()}
        >
          <a href={secondary.href} aria-label={secondary.label} />
        </IconButton>
      ) : null}
      <Button asChild size="lg" icon={primary.icon} className={slots.primary()}>
        <a href={primary.href}>{primary.label}</a>
      </Button>
    </div>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- action-dock 2>&1 | tail -8`
Expected: PASS (7 tests).

- [ ] **Step 6: Stories (handoff PPFooter's mobile bar and desktop pill)**

Each story renders in its own iframe (the dock is `position: fixed`; inline docs would stack every dock at the bottom of one page).

`packages/ui/src/organisms/action-dock/action-dock.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MessageCircle, Phone } from "lucide-react";

import { SiteFooter } from "../site-footer/site-footer";
import { BRAND, VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { ActionDock } from "./action-dock";

const meta = {
  title: "Organisms/ActionDock",
  component: ActionDock,
  args: {
    primary: { label: "WhatsApp us", href: BRAND.whatsappHref, icon: MessageCircle },
    secondary: { label: "Call", href: BRAND.phoneHref, icon: Phone },
  },
  decorators: [
    (Story) => (
      <>
        <div className="container-page h-200 py-10">
          <div className="h-full rounded-lg bg-surface-page-alt" />
        </div>
        <SiteFooter
          tone="ink"
          hasDockClearance
          columns={[
            {
              heading: "Eat with us",
              items: [
                { label: "Homely Meals", href: "#homely-meals" },
                { label: "Catering & Bulk Orders", href: "#catering" },
              ],
            },
          ]}
          legal={<span>{BRAND.copyright}</span>}
          policies={[
            { label: "Privacy Policy", href: "#privacy" },
            { label: "Refund & Cancellation", href: "#refunds" },
          ]}
        />
        <Story />
      </>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { inline: false, height: "560px" },
      description: {
        component:
          "The handoff's always-there WhatsApp action. Below md: a white bar fixed to the bottom — Call icon + WhatsApp pill — padded for the iOS home indicator. From md: the WhatsApp pill alone, floating bottom-right. Scroll to the bottom: with `SiteFooter hasDockClearance` the dock never covers the legal links.",
      },
    },
  },
} satisfies Meta<typeof ActionDock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Handoff mobile bar. */
export const Mobile: Story = { globals: VIEWPORT_360 };

export const Tablet: Story = { globals: VIEWPORT_768 };

/** Handoff desktop floating pill. */
export const Desktop: Story = { globals: VIEWPORT_1280 };

export const PrimaryOnly: Story = { args: { secondary: undefined }, globals: VIEWPORT_360 };
```

- [ ] **Step 7: Export**

```ts
export {
  ActionDock,
  type ActionDockProps,
  type DockAction,
} from "./organisms/action-dock/action-dock";
```

- [ ] **Step 8: Format, gate, commit**

```bash
pnpm exec prettier --write packages/ui/src/organisms/action-dock packages/design-tokens/tokens/component/action-dock.json packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
git add packages/design-tokens/tokens/component/action-dock.json packages/ui/src/organisms/action-dock packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): add the ActionDock organism

The handoff's fixed WhatsApp action as one element restyled by CSS: a white
bottom bar with the call icon on phones, a floating pill from md. Both
offsets include the iOS safe-area inset, and the test pins that
SiteFooter's dock clearance keeps the legal links uncovered.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 10: TabBar

**Dev reference:** `git show dev:packages/ui/src/organisms/tab-bar/tab-bar.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                         | Ruling  | Where / clause                                                                                     |
| ---------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------- |
| One control per destination in a named `nav`                     | ALREADY | test "is a navigation landmark named Primary by default"                                           |
| Five destinations                                                | ADD     | test "carries five destinations too"                                                               |
| The destination in view is `aria-current="page"`                 | ALREADY | test "marks the current destination…"                                                              |
| Uncontrolled: starts on the first / `defaultValue`, moves itself | DROP    | contract §7 `value: string` (required) + D6 — server-safe, no state; stories hold state in `Frame` |
| Controlled: reports the tap, does not move itself                | ADD     | the `onValueChange` test asserts Home stays current                                                |
| Count announced with the label; singular/plural wording          | ALREADY | "Cart (2)" — no pluralised copy to own (D9)                                                        |
| The 64px bar                                                     | ALREADY | test "sits in the fixed 64px bar height"                                                           |
| A long label truncates; tabs `min-w-0` so five fit at 360px      | ADD     | `label` slot + test "keeps a long label on one line…"                                              |
| Press feedback (`active:scale`)                                  | ADD     | `active:press-scale` on the control (CSS only)                                                     |
| 44px hit target                                                  | ALREADY | full-height 64px controls                                                                          |
| Merges a caller `className`                                      | ADD     | test "merges a caller className over its own"                                                      |
| axe                                                              | ALREADY | test "has no accessibility violations"                                                             |
| Stories Default · FourDestinations · FiveDestinations            | ALREADY | Playground · FourTabsWithCount · FiveTabs                                                          |
| Story EachDestinationActive (each bar self-named)                | ADD     | `EachDestinationActive`                                                                            |
| Story Smallest (five at 360px)                                   | ADD     | `Mobile`                                                                                           |

Implementer: copy this table into your report, extended with anything the plan missed.

**Files:**

- Create: `packages/design-tokens/tokens/component/tab-bar.json`
- Create: `packages/ui/src/organisms/tab-bar/tab-bar.tsx`, `tab-bar.test.tsx`, `tab-bar.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`, `TEXT`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `Icon`/`IconComponent`, `LinkAs`/`LinkAsProps`, `componentVariants`; the `h-tabbar` token (Plan 1, 64px).
- Produces: `TabBar`, `TabBarProps`, `TabBarItem`.

Server-safe and isomorphic: link tabs (items with `href`) render from a server parent; button tabs need `onValueChange`, which only a client parent can pass — the handler is created only when it is given, so a server render never attaches one.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/tab-bar.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "tab-bar-count": {
      "$value": "16px",
      "$description": "Count pill height and minimum width (design system TabBar).",
      "$extensions": { "pink-paprikaa": { "utility": ["h", "min-w"] } }
    }
  },
  "text": {
    "$type": "typography",
    "tab-bar-label": {
      "$value": { "fontSize": "11px", "lineHeight": 1.2, "fontWeight": "{font-weight.medium}" },
      "$description": "Tab label; bold when active."
    },
    "tab-bar-count": {
      "$value": { "fontSize": "10px", "lineHeight": 1, "fontWeight": "{font-weight.bold}" }
    }
  }
}
```

Append to `SPACING`:

```ts
  "tab-bar-count",
```

Append to `TEXT`:

```ts
  "tab-bar-label",
  "tab-bar-count",
```

- [ ] **Step 2: Write the failing test**

`packages/ui/src/organisms/tab-bar/tab-bar.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { House, Receipt, ShoppingBag, User, Utensils } from "lucide-react";

import type { LinkAsProps } from "../../lib/link-as";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { TabBar, type TabBarItem } from "./tab-bar";

const ITEMS: TabBarItem[] = [
  { value: "home", label: "Home", icon: House },
  { value: "menu", label: "Menu", icon: Utensils },
  { value: "cart", label: "Cart", icon: ShoppingBag, count: 2 },
  { value: "you", label: "You", icon: User },
];

function RouterLink({ href, className, children, ...props }: LinkAsProps) {
  return (
    <a href={href} className={className} data-router-link="" {...props}>
      {children}
    </a>
  );
}

describe("TabBar", () => {
  it("is a navigation landmark named Primary by default", () => {
    render(<TabBar items={ITEMS} value="home" />);
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });

  it("carries five destinations too", () => {
    render(
      <TabBar
        items={[...ITEMS, { value: "orders", label: "Orders", icon: Receipt }]}
        value="home"
      />
    );
    expect(screen.getAllByRole("button")).toHaveLength(5);
  });

  it("marks the current destination with aria-current=page, in the brand colour", () => {
    render(<TabBar items={ITEMS} value="menu" />);
    const menu = screen.getByRole("button", { name: "Menu" });
    expect(menu).toHaveAttribute("aria-current", "page");
    expect(menu).toHaveClass("text-text-brand", "font-bold");
    expect(screen.getByRole("button", { name: "Home" })).not.toHaveAttribute("aria-current");
  });

  it("reports the chosen destination when a button tab is pressed — by pointer or keyboard", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TabBar items={ITEMS} value="home" onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Menu" }));
    expect(onValueChange).toHaveBeenLastCalledWith("menu");
    screen.getByRole("button", { name: "You" }).focus();
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("you");
    // Controlled: the bar reports the tap but only `value` moves it.
    expect(screen.getByRole("button", { name: "Home" })).toHaveAttribute("aria-current", "page");
  });

  it("keeps a long label on one line, truncated, so five tabs fit at 360px", () => {
    render(
      <TabBar items={[{ value: "orders", label: "Order history", icon: Receipt }]} value="orders" />
    );
    expect(screen.getByText("Order history")).toHaveClass("max-w-full", "truncate");
  });

  it("merges a caller className over its own", () => {
    render(<TabBar items={ITEMS} value="home" className="bg-surface-sunken" />);
    expect(screen.getByRole("navigation")).toHaveClass("bg-surface-sunken");
    expect(screen.getByRole("navigation")).not.toHaveClass("bg-surface-card");
  });

  it("announces a count with its label and hides the visual pill", () => {
    render(<TabBar items={ITEMS} value="home" />);
    const cart = screen.getByRole("button", { name: "Cart (2)" });
    const pill = cart.querySelector('[aria-hidden="true"].rounded-pill');
    expect(pill).toHaveTextContent("2");
  });

  it("renders link tabs through linkAs when items have an href", () => {
    render(
      <TabBar
        items={ITEMS.map((item) => ({ ...item, href: `#${item.value}` }))}
        value="cart"
        linkAs={RouterLink}
      />
    );
    const cart = screen.getByRole("link", { name: "Cart (2)" });
    expect(cart).toHaveAttribute("href", "#cart");
    expect(cart).toHaveAttribute("aria-current", "page");
    expect(cart).toHaveAttribute("data-router-link");
  });

  it("sits in the fixed 64px bar height", () => {
    render(<TabBar items={ITEMS} value="home" />);
    expect(screen.getByRole("navigation")).toHaveClass("h-tabbar");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<TabBar items={ITEMS} value="cart" />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- tab-bar 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./tab-bar`.

- [ ] **Step 4: Implement**

`packages/ui/src/organisms/tab-bar/tab-bar.tsx`:

```tsx
import type { ComponentProps } from "react";

import type { LinkAs } from "../../lib/link-as";

import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";

export interface TabBarItem {
  value: string;
  label: string;
  icon: IconComponent;
  /** Badge count, e.g. cart items; 0 or omitted hides it. */
  count?: number | undefined;
  /** Makes the tab a link (rendered through `linkAs`); without it the tab is a button. */
  href?: string | undefined;
}

const tabBar = componentVariants({
  slots: {
    root: "h-tabbar border-t border-border-subtle bg-surface-card",
    list: "flex h-full",
    item: "flex min-w-0 flex-1",
    control:
      "text-tab-bar-label flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 font-display text-text-subtle no-underline transition-colors duration-fast ease-out hover:text-text-heading active:press-scale",
    glyph: "relative inline-flex",
    label: "max-w-full truncate",
    count:
      "h-tab-bar-count min-w-tab-bar-count text-tab-bar-count absolute -top-1 -right-2 grid place-items-center rounded-pill bg-surface-brand px-1 font-display text-text-on-brand",
  },
  variants: {
    isActive: { true: { control: "font-bold text-text-brand hover:text-text-brand" } },
  },
});

export interface TabBarProps extends ComponentProps<"nav"> {
  /** Four or five destinations, never more. */
  items: TabBarItem[];
  value: string;
  /** Called by button tabs. Link tabs navigate instead. Only a client parent can pass it. */
  onValueChange?: ((value: string) => void) | undefined;
  linkAs?: LinkAs | undefined;
  /** The landmark's name. */
  label?: string | undefined;
}

/**
 * The app's fixed 64px bottom navigation. The active destination is brand pink with a bold label;
 * a count renders as a pink pill on the icon and is read out with the label ("Cart (2)").
 */
export function TabBar({
  items,
  value,
  onValueChange,
  linkAs: LinkComponent = "a",
  label = "Primary",
  className,
  ...props
}: TabBarProps) {
  const slots = tabBar();
  return (
    <nav aria-label={label} data-surface="light" className={slots.root({ className })} {...props}>
      <ul className={slots.list()}>
        {items.map((item) => {
          const isActive = item.value === value;
          const control = slots.control({ isActive });
          const hasCount = item.count !== undefined && item.count > 0;
          const content = (
            <>
              <span className={slots.glyph()}>
                <Icon icon={item.icon} size="lg" />
                {hasCount ? (
                  <span aria-hidden className={slots.count()}>
                    {item.count}
                  </span>
                ) : null}
              </span>
              <span className={slots.label()}>{item.label}</span>
              {hasCount ? <span className="sr-only"> ({item.count})</span> : null}
            </>
          );
          return (
            <li key={item.value} className={slots.item()}>
              {item.href === undefined ? (
                <button
                  type="button"
                  aria-current={isActive ? "page" : undefined}
                  className={control}
                  onClick={
                    onValueChange === undefined
                      ? undefined
                      : () => {
                          onValueChange(item.value);
                        }
                  }
                >
                  {content}
                </button>
              ) : (
                <LinkComponent
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={control}
                >
                  {content}
                </LinkComponent>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- tab-bar 2>&1 | tail -8`
Expected: PASS (10 tests).

- [ ] **Step 6: Stories (card parity with `TabBar.card.html`)**

`packages/ui/src/organisms/tab-bar/tab-bar.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { House, Receipt, ShoppingBag, User, Utensils } from "lucide-react";
import { useState } from "react";
import { expect } from "storybook/test";

import { VIEWPORT_360 } from "../story-fixtures";
import { TabBar, type TabBarItem } from "./tab-bar";

const FOUR: TabBarItem[] = [
  { value: "home", label: "Home", icon: House },
  { value: "menu", label: "Menu", icon: Utensils },
  { value: "cart", label: "Cart", icon: ShoppingBag, count: 2 },
  { value: "you", label: "You", icon: User },
];

const FIVE: TabBarItem[] = [
  { value: "home", label: "Home", icon: House },
  { value: "menu", label: "Menu", icon: Utensils },
  { value: "cart", label: "Cart", icon: ShoppingBag },
  { value: "orders", label: "Orders", icon: Receipt },
  { value: "you", label: "You", icon: User },
];

/** A phone-width frame, as on the card. */
function Frame({ items, initial }: { items: TabBarItem[]; initial: string }) {
  const [value, setValue] = useState(initial);
  return (
    <div className="w-97.5 overflow-hidden rounded-lg border border-border-subtle">
      <TabBar items={items} value={value} onValueChange={setValue} />
    </div>
  );
}

const meta = {
  title: "Organisms/TabBar",
  component: TabBar,
  args: { items: FOUR, value: "menu" },
  parameters: {
    docs: {
      description: {
        component:
          "The app's fixed bottom navigation — 64px, four or five destinations, never more. The active destination is pink with a bold label; counts render as a pink pill on the icon and are read with the label. Items with `href` are links (through `linkAs`); otherwise buttons that call `onValueChange`.",
      },
    },
  },
} satisfies Meta<typeof TabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row: 4 tabs + count. */
export const FourTabsWithCount: Story = {
  render: () => <Frame items={FOUR} initial="menu" />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Cart (2)" }));
    await expect(canvas.getByRole("button", { name: "Cart (2)" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    await expect(canvas.getByRole("button", { name: "Menu" })).not.toHaveAttribute("aria-current");
  },
};

/** Card row: 5 tabs. */
export const FiveTabs: Story = { render: () => <Frame items={FIVE} initial="home" /> };

export const AsLinks: Story = {
  args: { items: FOUR.map((item) => ({ ...item, href: `#${item.value}` })), value: "home" },
  render: (args) => (
    <div className="w-97.5 overflow-hidden rounded-lg border border-border-subtle">
      <TabBar {...args} />
    </div>
  ),
};

/**
 * Each destination active in turn, for comparing the active treatment at a glance. Four bars are
 * four navigation landmarks, so each names itself — four called "Primary" could not be told apart.
 */
export const EachDestinationActive: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {FOUR.map((item) => (
        <div
          key={item.value}
          className="w-97.5 overflow-hidden rounded-lg border border-border-subtle"
        >
          <TabBar items={FOUR} value={item.value} label={`Primary, ${item.label} in view`} />
        </div>
      ))}
    </div>
  ),
};

/** Five tabs across the smallest supported viewport (360px): nothing wraps. */
export const Mobile: Story = {
  globals: VIEWPORT_360,
  parameters: { layout: "fullscreen" },
  render: () => <TabBar items={FIVE} value="home" />,
};
```

- [ ] **Step 7: Export**

```ts
export { TabBar, type TabBarItem, type TabBarProps } from "./organisms/tab-bar/tab-bar";
```

- [ ] **Step 8: Format, gate, commit**

```bash
pnpm exec prettier --write packages/ui/src/organisms/tab-bar packages/design-tokens/tokens/component/tab-bar.json packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
git add packages/design-tokens/tokens/component/tab-bar.json packages/ui/src/organisms/tab-bar packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): add the TabBar organism

The app's 64px bottom navigation as a labelled nav: link tabs through
linkAs or button tabs that report onValueChange, the current one marked
aria-current in brand pink, counts shown as a pill and read with the label.
Labels use the passing ink-600 and pink-600 text tokens.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 11: Dialog

**Dev reference:** `git show dev:packages/ui/src/organisms/dialog/dialog.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                     | Ruling  | Where / clause                                                                                      |
| ------------------------------------------------------------ | ------- | --------------------------------------------------------------------------------------------------- |
| Closed until the trigger is used                             | ALREADY | test "opens from its trigger…"                                                                      |
| Named by its title; described by its description             | ALREADY | same test                                                                                           |
| Escape closes and reports `onOpenChange(false)`              | ALREADY | tests "closes on Escape…", "reports open changes…"                                                  |
| The close glyph closes                                       | ALREADY | test "closes from its labelled close button"                                                        |
| `hasCloseButton={false}` — a decision that must be answered  | ADD     | contract delta 4 (R110): hides the close button only; test "hides only the close button…"           |
| Focus moves into the dialog when it opens                    | ADD     | test "moves focus into the dialog when it opens"                                                    |
| Footer actions render and work                               | ALREADY | test "renders the footer actions"                                                                   |
| Controlled open state holds                                  | ALREADY | test "reports open changes and stays open when controlled"                                          |
| Sheet: top corners only, plus a grab handle                  | ADD     | the sheet test also asserts no `rounded-xl`                                                         |
| Three widths                                                 | ALREADY | `it.each` sizes (token widths, D4)                                                                  |
| `position="container"` anchors inside a phone frame          | ALREADY | `portalContainer` + the frame's `contain-layout` (AppShell, Plan 2c); story `InsideAPhoneFrame` ADD |
| A scrim over everything behind it                            | ADD     | test "lays the ink scrim over the page behind it"                                                   |
| Merges a caller `className`                                  | ADD     | contract delta 5 (R110): onto the panel; test "merges a caller className onto the panel"            |
| axe                                                          | ALREADY | test "has no accessibility violations while open"                                                   |
| The body scrolls; header and footer never leave the screen   | ADD     | `body` slot `min-h-0 flex-1 overflow-y-auto`, `shrink-0` header/footer, test "scrolls its body…"    |
| Footer wraps at 360px                                        | ALREADY | `flex-wrap`                                                                                         |
| `aria-describedby={undefined}` opt-out                       | ALREADY | Radix 1.1.23 omits it without a Description, no warning (Interfaces)                                |
| `isOpen` / `isDefaultOpen` names                             | DROP    | spec §8.2 — `open` / `defaultOpen` / `onOpenChange`                                                 |
| Stories Default · Sheet · WithDescription · WithForm · Sizes | ALREADY | Playground · Sheet · Large · Playground (`BOOKING_FORM`) · CentredModal/Playground/Large            |
| Story MustBeAnswered                                         | ADD     | `MustBeAnswered` (contract delta 4) — controlled, own footer actions, `play` (Escape, scrim click)  |
| Story InsideAPhoneFrame                                      | ADD     | `InsideAPhoneFrame`                                                                                 |
| Story Smallest                                               | ADD     | `Mobile`                                                                                            |

Implementer: copy this table into your report, extended with anything the plan missed.

**Files:**

- Create: `packages/design-tokens/tokens/component/dialog.json`
- Create: `packages/ui/src/organisms/dialog/dialog.tsx` (client), `dialog.test.tsx`, `dialog.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`, `TEXT`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: Radix `Dialog` from `radix-ui` (verified in `@radix-ui/react-dialog@1.1.23`: `Title` names the dialog; `aria-describedby` is set only when a `Description` is rendered and no console warning is emitted without one; the scroll lock (`react-remove-scroll`, which sets `body[data-scroll-locked]`) lives on `Overlay`, so the overlay must render; `Content` may be nested inside `Overlay`; `Portal container` accepts `Element | DocumentFragment | null`, falling back to `document.body`), `IconButton`, `componentVariants`; stories: `Button`, `Field`, `Input`, `Select`.
- Produces: `Dialog`, `DialogProps`.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/dialog.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "dialog-sm": {
      "$value": "400px",
      "$extensions": { "pink-paprikaa": { "utility": ["max-w"] } }
    },
    "dialog-md": {
      "$value": "460px",
      "$description": "Design system Dialog default width.",
      "$extensions": { "pink-paprikaa": { "utility": ["max-w"] } }
    },
    "dialog-lg": {
      "$value": "640px",
      "$extensions": { "pink-paprikaa": { "utility": ["max-w"] } }
    }
  },
  "text": {
    "$type": "typography",
    "dialog-title": {
      "$value": {
        "fontSize": "22px",
        "lineHeight": 1.25,
        "letterSpacing": "-0.01em",
        "fontWeight": "{font-weight.bold}"
      }
    },
    "dialog-body": {
      "$value": { "fontSize": "15px", "lineHeight": 1.6, "fontWeight": "{font-weight.regular}" }
    }
  }
}
```

Append to `SPACING`:

```ts
  "dialog-sm",
  "dialog-md",
  "dialog-lg",
```

Append to `TEXT`:

```ts
  "dialog-title",
  "dialog-body",
```

- [ ] **Step 2: Write the failing test**

`packages/ui/src/organisms/dialog/dialog.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Dialog } from "./dialog";

const TRIGGER = <button type="button">Book a table</button>;

describe("Dialog", () => {
  it("opens from its trigger, named by its title and described by its description", async () => {
    const user = userEvent.setup();
    render(
      <Dialog trigger={TRIGGER} title="Book a table" description="We hold it for 15 minutes.">
        Pick your outlet.
      </Dialog>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Book a table" }));
    const dialog = screen.getByRole("dialog", { name: "Book a table" });
    expect(dialog).toHaveAccessibleDescription("We hold it for 15 minutes.");
    expect(within(dialog).getByText("Pick your outlet.")).toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<Dialog trigger={TRIGGER} title="Book a table" />);
    const trigger = screen.getByRole("button", { name: "Book a table" });
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("moves focus into the dialog when it opens", async () => {
    const user = userEvent.setup();
    render(<Dialog trigger={TRIGGER} title="Book a table" />);
    await user.click(screen.getByRole("button", { name: "Book a table" }));
    expect(screen.getByRole("dialog").contains(document.activeElement)).toBe(true);
  });

  it("closes from its labelled close button", async () => {
    const user = userEvent.setup();
    render(<Dialog trigger={TRIGGER} title="Book a table" />);
    await user.click(screen.getByRole("button", { name: "Book a table" }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("reports open changes and stays open when controlled", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Dialog open onOpenChange={onOpenChange} title="Remove this item?">
        Chilli Paneer will come off your order.
      </Dialog>
    );
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("dialog", { name: "Remove this item?" })).toBeInTheDocument();
  });

  it("hides only the close button with hasCloseButton={false}; Escape and the scrim still ask to close", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Dialog
        open
        onOpenChange={onOpenChange}
        hasCloseButton={false}
        title="Remove this item?"
        footer={<button type="button">Keep it</button>}
      >
        Chilli Paneer will come off your order.
      </Dialog>
    );
    const dialog = screen.getByRole("dialog", { name: "Remove this item?" });
    expect(within(dialog).queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Keep it" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    onOpenChange.mockClear();
    // A click outside the panel lands on the scrim: it asks too, and the controlled dialog stays.
    const scrim = document.querySelector<HTMLElement>(".bg-surface-overlay");
    if (scrim === null) throw new Error("no scrim");
    await user.click(scrim);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("dialog", { name: "Remove this item?" })).toBeInTheDocument();
  });

  it("merges a caller className onto the panel", () => {
    render(<Dialog defaultOpen title="Book a table" className="shadow-2" />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveClass("shadow-2");
    expect(dialog).not.toHaveClass("shadow-4");
  });

  it("locks page scroll while open", async () => {
    const user = userEvent.setup();
    render(<Dialog trigger={TRIGGER} title="Book a table" />);
    await user.click(screen.getByRole("button", { name: "Book a table" }));
    expect(document.body).toHaveAttribute("data-scroll-locked");
    await user.keyboard("{Escape}");
    expect(document.body).not.toHaveAttribute("data-scroll-locked");
  });

  it("lays the ink scrim over the page behind it", () => {
    render(<Dialog defaultOpen title="Book a table" />);
    expect(document.querySelector(".bg-surface-overlay")).toBeInTheDocument();
  });

  it("renders the sheet with a grab handle and top-only corners", () => {
    render(<Dialog defaultOpen variant="sheet" title="Remove this item?" />);
    const sheet = screen.getByRole("dialog");
    expect(sheet).toHaveClass("rounded-t-xl");
    expect(sheet).not.toHaveClass("rounded-xl");
    expect(sheet.querySelector('[aria-hidden="true"] .rounded-pill')).toBeInTheDocument();
  });

  it("scrolls its body, never the header or footer, so the actions stay on screen", () => {
    render(
      <Dialog
        defaultOpen
        title="Book a table"
        footer={<button type="button">Hold my table</button>}
      >
        Pick your outlet.
      </Dialog>
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveClass("overflow-hidden");
    expect(within(dialog).getByText("Pick your outlet.")).toHaveClass(
      "min-h-0",
      "flex-1",
      "overflow-y-auto"
    );
    expect(within(dialog).getByRole("button", { name: "Hold my table" }).parentElement).toHaveClass(
      "shrink-0"
    );
  });

  it.each([
    ["sm", "max-w-dialog-sm"],
    ["md", "max-w-dialog-md"],
    ["lg", "max-w-dialog-lg"],
  ] as const)("sizes the modal %s", (size, widthClass) => {
    render(<Dialog defaultOpen size={size} title="Book a table" />);
    expect(screen.getByRole("dialog")).toHaveClass(widthClass);
  });

  it("renders the footer actions", () => {
    render(
      <Dialog
        defaultOpen
        title="Remove this item?"
        footer={<button type="button">Remove</button>}
      />
    );
    expect(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Remove" })
    ).toBeInTheDocument();
  });

  it("portals into the given container instead of the page body", () => {
    const frame = document.createElement("div");
    document.body.append(frame);
    render(<Dialog defaultOpen title="Remove this item?" portalContainer={frame} />);
    expect(frame).toContainElement(screen.getByRole("dialog"));
    frame.remove();
  });

  it("has no accessibility violations while open", async () => {
    render(
      <Dialog
        defaultOpen
        title="Book a table"
        description="We hold it for 15 minutes."
        footer={<button type="button">Hold my table</button>}
      >
        Pick your outlet.
      </Dialog>
    );
    // Scoped to the dialog: Radix hides the rest of the page (aria-hidden) while focus is trapped.
    await expectNoA11yViolations(screen.getByRole("dialog"));
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- organisms/dialog 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./dialog`.

- [ ] **Step 4: Implement**

`packages/ui/src/organisms/dialog/dialog.tsx`:

```tsx
"use client";

import type { ReactElement, ReactNode } from "react";

import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { IconButton } from "../../atoms/icon-button/icon-button";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { isShown } from "../../lib/is-shown";

const dialog = componentVariants({
  slots: {
    overlay: "fixed inset-0 z-overlay flex bg-surface-overlay",
    // Only the body scrolls: the title, the close button and the footer's actions stay on screen.
    content:
      "flex max-h-full w-full animate-sheet-in flex-col overflow-hidden bg-surface-card shadow-4",
    handle: "flex shrink-0 justify-center pt-2.5",
    handleBar: "h-1 w-10 rounded-pill bg-ink-300",
    header: "flex shrink-0 items-start justify-between gap-4 px-6 pt-5",
    title: "text-dialog-title font-display text-text-heading",
    description: "shrink-0 px-6 pt-1 text-body-sm text-text-muted",
    body: "text-dialog-body min-h-0 flex-1 overflow-y-auto px-6 pt-3 pb-5 text-text-body",
    footer: "flex shrink-0 flex-wrap justify-end gap-2.5 px-6 pb-6",
  },
  variants: {
    variant: {
      modal: { overlay: "items-center justify-center p-6", content: "rounded-xl" },
      sheet: { overlay: "items-end", content: "rounded-t-xl" },
    },
    size: { sm: {}, md: {}, lg: {} },
  },
  compoundVariants: [
    { variant: "modal", size: "sm", class: { content: "max-w-dialog-sm" } },
    { variant: "modal", size: "md", class: { content: "max-w-dialog-md" } },
    { variant: "modal", size: "lg", class: { content: "max-w-dialog-lg" } },
  ],
  defaultVariants: { variant: "modal", size: "md" },
});

export interface DialogProps
  extends
    Pick<DialogPrimitive.DialogProps, "open" | "defaultOpen" | "onOpenChange">,
    Pick<VariantProps<typeof dialog>, "variant" | "size"> {
  /** The element that opens the dialog, e.g. a Button. */
  trigger?: ReactElement | undefined;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Buttons, right-aligned. */
  footer?: ReactNode;
  closeLabel?: string | undefined;
  /**
   * `false` hides the close button only. Escape and the scrim still ask to close through
   * `onOpenChange` — a decision that must be answered is controlled, keeps itself open, and gives
   * its own action buttons in `footer`.
   */
  hasCloseButton?: boolean | undefined;
  /** Portal target; default `document.body`. Pass a positioned frame (AppShell's overlay slot) to keep the dialog inside it. */
  portalContainer?: HTMLElement | null | undefined;
  /** Merged onto the panel (the element with `role="dialog"`). */
  className?: string | undefined;
}

/**
 * A decision that must be made now: a centred modal (24px radius, `--shadow-4`, 56% ink scrim),
 * or a bottom sheet with a grab handle — the app default. Radix Dialog: focus is trapped, Escape
 * and the scrim close it, focus returns to the trigger, the page behind cannot scroll.
 */
export function Dialog({
  trigger,
  title,
  description,
  children,
  footer,
  variant = "modal",
  size = "md",
  closeLabel = "Close",
  hasCloseButton = true,
  portalContainer = null,
  className,
  ...root
}: DialogProps) {
  const slots = dialog({ variant, size });
  return (
    <DialogPrimitive.Root {...root}>
      {trigger ? <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger> : null}
      <DialogPrimitive.Portal container={portalContainer}>
        <DialogPrimitive.Overlay className={slots.overlay()}>
          <DialogPrimitive.Content data-surface="light" className={slots.content({ className })}>
            {variant === "sheet" ? (
              <div aria-hidden className={slots.handle()}>
                <span className={slots.handleBar()} />
              </div>
            ) : null}
            <div className={slots.header()}>
              <DialogPrimitive.Title className={slots.title()}>{title}</DialogPrimitive.Title>
              {hasCloseButton ? (
                <DialogPrimitive.Close asChild>
                  <IconButton icon={X} label={closeLabel} size="sm" variant="ghost" />
                </DialogPrimitive.Close>
              ) : null}
            </div>
            {isShown(description) ? (
              <DialogPrimitive.Description className={slots.description()}>
                {description}
              </DialogPrimitive.Description>
            ) : null}
            {isShown(children) ? <div className={slots.body()}>{children}</div> : null}
            {isShown(footer) ? <div className={slots.footer()}>{footer}</div> : null}
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- organisms/dialog 2>&1 | tail -8`
Expected: PASS (17 tests).

- [ ] **Step 6: Stories (card parity with `Dialog.card.html`)**

Stories that render open set `a11y` to skip `aria-hidden-focus` only: Radix marks the rest of the page `aria-hidden` while it traps focus inside the dialog, which that rule reports although the hidden content cannot receive focus. Every other rule still runs. Each story renders in its own iframe so open dialogs do not stack on the docs page.

`packages/ui/src/organisms/dialog/dialog.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Phone } from "lucide-react";
import { useState } from "react";
import { expect, screen, waitFor, within } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { Input } from "../../atoms/input/input";
import { Select } from "../../atoms/select/select";
import { Field } from "../../molecules/field/field";
import { VIEWPORT_360 } from "../story-fixtures";
import { Dialog, type DialogProps } from "./dialog";

/** Radix hides the page behind an open dialog while trapping focus; that rule misreads it. */
const OPEN_DIALOG_A11Y = {
  a11y: { config: { rules: [{ id: "aria-hidden-focus", enabled: false }] } },
};

const BOOKING_FORM = (
  <div className="grid gap-3">
    <Field label="Outlet">
      {(control) => (
        <Select {...control} options={[{ value: "sector-57", label: "Sector 57, Gurgaon" }]} />
      )}
    </Field>
    <Field label="Mobile number">
      {(control) => <Input {...control} type="tel" icon={Phone} placeholder="98765 43210" />}
    </Field>
  </div>
);

const meta = {
  title: "Organisms/Dialog",
  component: Dialog,
  args: {
    trigger: <Button>Book a table</Button>,
    title: "Book a table",
    children: BOOKING_FORM,
    footer: (
      <>
        <Button variant="ghost" size="sm">
          Cancel
        </Button>
        <Button size="sm">Hold My Table</Button>
      </>
    ),
  },
  parameters: {
    docs: {
      story: { inline: false, height: "480px" },
      description: {
        component:
          'A decision that must be made now. `variant="modal"` is centred (24px radius, shadow-4, 56% ink scrim); `variant="sheet"` is the app\'s bottom sheet with a grab handle and top corners only. Focus is trapped, Escape and the scrim close it, focus returns to the trigger, the page cannot scroll. `portalContainer` renders it inside a positioned frame (AppShell\'s overlay slot) instead of the page body.',
      },
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row: centred modal. */
export const CentredModal: Story = {
  args: { defaultOpen: true, size: "sm" },
  parameters: OPEN_DIALOG_A11Y,
};

/** Card row: sheet. */
export const Sheet: Story = {
  args: {
    defaultOpen: true,
    variant: "sheet",
    title: "Remove this item?",
    children: "Chilli Paneer will come off your order.",
    footer: (
      <>
        <Button variant="ghost" size="sm">
          Keep It
        </Button>
        <Button size="sm">Remove</Button>
      </>
    ),
  },
  parameters: OPEN_DIALOG_A11Y,
};

export const Large: Story = {
  args: { defaultOpen: true, size: "lg", description: "We hold a table for 15 minutes." },
  parameters: OPEN_DIALOG_A11Y,
};

/** Keyboard: open from the trigger, Escape closes, focus returns. */
export const KeyboardFlow: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Book a table" });
    await userEvent.click(trigger);
    await expect(await screen.findByRole("dialog", { name: "Book a table" })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

/**
 * A decision that must be answered: no close button, and the caller keeps the dialog open when
 * Escape or the scrim ask to close (it passes no `onOpenChange`), so the footer's buttons are the
 * only way out.
 */
function MustBeAnsweredDialog(args: DialogProps) {
  const [open, setOpen] = useState(true);
  return (
    <Dialog
      {...args}
      open={open}
      hasCloseButton={false}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Keep It
          </Button>
          <Button size="sm" onClick={() => setOpen(false)}>
            Remove
          </Button>
        </>
      }
    />
  );
}

export const MustBeAnswered: Story = {
  args: {
    trigger: undefined,
    title: "Remove this item?",
    children: "Chilli Paneer will come off your order.",
  },
  parameters: OPEN_DIALOG_A11Y,
  render: (args) => <MustBeAnsweredDialog {...args} />,
  play: async ({ userEvent }) => {
    const dialog = await screen.findByRole("dialog", { name: "Remove this item?" });
    await expect(within(dialog).queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await expect(screen.getByRole("dialog", { name: "Remove this item?" })).toBeVisible();
    // A click outside the panel lands on the scrim; it cannot close the dialog either.
    const scrim = document.querySelector<HTMLElement>(".bg-surface-overlay");
    if (scrim === null) throw new Error("no scrim");
    await userEvent.click(scrim);
    await expect(screen.getByRole("dialog", { name: "Remove this item?" })).toBeVisible();
    await userEvent.click(within(dialog).getByRole("button", { name: "Keep It" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  },
};

/**
 * The sheet inside a phone frame: the frame is `portalContainer`, and its `contain-layout` (as
 * AppShell's frame has) makes it the containing block for the fixed scrim, so the sheet anchors to
 * the frame, not the viewport.
 */
function FramedSheet(args: DialogProps) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setFrame}
      className="relative h-165 w-90 overflow-hidden rounded-lg border border-border-subtle bg-surface-page-alt contain-layout"
    >
      {frame === null ? null : <Dialog {...args} portalContainer={frame} />}
    </div>
  );
}

export const InsideAPhoneFrame: Story = {
  args: {
    defaultOpen: true,
    variant: "sheet",
    title: "Remove this item?",
    children: "Chilli Paneer will come off your order.",
    footer: (
      <>
        <Button variant="ghost" size="sm">
          Keep It
        </Button>
        <Button size="sm">Remove</Button>
      </>
    ),
  },
  parameters: OPEN_DIALOG_A11Y,
  render: (args) => <FramedSheet {...args} />,
};

/** The smallest supported viewport: the modal keeps its gutter on both sides. */
export const Mobile: Story = {
  args: { defaultOpen: true },
  globals: VIEWPORT_360,
  parameters: OPEN_DIALOG_A11Y,
};
```

- [ ] **Step 7: Export**

```ts
export { Dialog, type DialogProps } from "./organisms/dialog/dialog";
```

- [ ] **Step 8: Format, gate, commit**

```bash
pnpm exec prettier --write packages/ui/src/organisms/dialog packages/design-tokens/tokens/component/dialog.json packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
git add packages/design-tokens/tokens/component/dialog.json packages/ui/src/organisms/dialog packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): add the Dialog organism

Radix Dialog as the design system's modal and bottom sheet: title-named,
optionally described, focus-trapped, closed by Escape, the scrim or a named
close button, with focus returned and page scroll locked. Sizes come from
component tokens; portalContainer keeps it inside a phone frame.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 12: SiteHeader

**Dev reference:** `git show dev:packages/ui/src/organisms/site-header/site-header.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                 | Ruling  | Where / clause                                                                                               |
| ------------------------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------ |
| The `banner` landmark with the lockup                                    | ALREADY | tests "is the banner landmark…", "links the logo home…"                                                      |
| Rail links in a named `nav`                                              | ALREADY | test "links the logo home and lists the nav links…"                                                          |
| A custom `navLabel` keeps two mastheads on one page distinct             | ADD     | test "names its navigation from navLabel…"                                                                   |
| Fixed 72px height                                                        | DROP    | C1 — 88 default / 64 compact (tested)                                                                        |
| `onOrder` / `onBook` / `onSearch` / `onCart` and the built-in buttons    | DROP    | spec §8.1 — slots, not callbacks (`actions`, `compactActions`, `drawerActions`)                              |
| Cart count in the button's name, printed on the glyph, hidden at 0       | ALREADY | IconButton `count` (Plan 2a) in the actions slot (`ScrolledWithCart`)                                        |
| Glass and hairline once scrolled                                         | ALREADY | test "turns the bar to glass…" (`data-scrolled:bg-surface-glass`, `data-scrolled:border-border-subtle`)      |
| `isScrolled` as a prop                                                   | DROP    | spec §9.3 + Controller amendment — glass on scroll is a client leaf; its server snapshot keeps SSR identical |
| The sheet opens, lists every link, closes from its close button          | ADD     | test "opens the drawer from the keyboard, hides the bar's own links behind it…"                              |
| The rail behind the open sheet leaves the accessibility tree             | ADD     | same test (one "Catering" link, not two)                                                                     |
| Following a sheet link closes it                                         | ALREADY | test "the drawer traps focus…"                                                                               |
| Opens from the keyboard                                                  | ADD     | same new test (`Enter` on the menu button)                                                                   |
| Merges a caller `className`                                              | ADD     | test "merges a caller className over its own"                                                                |
| axe                                                                      | ALREADY | test "has no accessibility violations, closed or with the drawer open"                                       |
| Sheet description "Every page on the Pink Paprikaa site."                | DROP    | D9                                                                                                           |
| Search moves into the sheet below md; "Book a Table" gives way first     | DROP    | spec §8.1 — the app places its actions through the three action slots                                        |
| Default links                                                            | DROP    | D9                                                                                                           |
| Stories Default · Scrolled · WithCart · ShortRail · Smallest · InContext | ALREADY | Rest · ScrolledWithCart · ScrolledWithCart · HandoffCompact · Mobile · the decorator's `<main>`              |
| Story CartCounts (0 / 1 / 12, each masthead self-named)                  | ADD     | `CartCounts`                                                                                                 |

Implementer: copy this table into your report, extended with anything the plan missed.

**Files:**

- Create: `packages/design-tokens/tokens/component/site-header.json`
- Modify: `packages/design-tokens/contrast-pairs.json` (text on the glass bar)
- Create: `packages/ui/src/organisms/site-header/site-header.tsx`, `site-header-bar.tsx` (client leaf: glass on scroll), `site-header-drawer.tsx` (client leaf: menu drawer), `site-header.test.tsx`, `site-header.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`, `TEXT`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `Icon`, `IconButton`, `Logo`, Radix `Dialog` (see Task 11 for the verified behaviour), `LinkAs`, `componentVariants`; tokens `--spacing-header` (88), `--spacing-header-compact` (64), `--color-surface-glass`, `--blur-glass`, `--z-header`, `--z-overlay`; stories: `AnnouncementBar`, `Badge`, `Button`, `DietMark`.
- Produces: `SiteHeader`, `SiteHeaderProps`, `NavLink`. The two leaves are internal (not exported).

The responsive rule, all CSS at token breakpoints (readme §3.10 — no `window.innerWidth`): the inline nav shows from `lg`; between `lg` and `xl` only the first three links stay (the rest are `display: none`, never clipped); at `xl` every link shows. The menu button shows wherever a link is hidden — below `lg` always, and below `xl` too when there are more than three links — so every destination stays reachable. `actions` show from `lg`, `compactActions` below it.

- [ ] **Step 1: Component tokens and the glass contrast pair**

`packages/design-tokens/tokens/component/site-header.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "site-header-logo": {
      "$value": "114px",
      "$description": "Lockup width at the design system header's 60px logo height (lockup viewBox 361.88 × 190.13).",
      "$extensions": { "pink-paprikaa": { "utility": ["w"] } }
    },
    "site-header-logo-compact": {
      "$value": "76px",
      "$description": "Lockup width at the handoff header's 40px logo height.",
      "$extensions": { "pink-paprikaa": { "utility": ["w"] } }
    }
  },
  "text": {
    "$type": "typography",
    "site-header-link": {
      "$value": { "fontSize": "15px", "lineHeight": 1.2, "fontWeight": "{font-weight.semibold}" },
      "$description": "Header nav link (handoff PPHeader: Poppins 600 15px)."
    }
  }
}
```

Append to `SPACING`:

```ts
  "site-header-logo",
  "site-header-logo-compact",
```

Append to `TEXT`:

```ts
  "site-header-link",
```

In `packages/design-tokens/contrast-pairs.json`, append to `groups`:

```json
{
  "id": "site-header-glass",
  "surface": null,
  "foregrounds": ["color-text-heading", "color-text-brand", "color-text-link"],
  "backgrounds": ["color-surface-glass"],
  "backdrop": "color-surface-page-alt",
  "min": 4.5
}
```

(The scrolled header is 72% white over whatever is behind it; the pink-50 hero tint is the darkest page ground the header scrolls over.)

Run: `pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -6`
Expected: PASS, including `contrast group site-header-glass`.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/organisms/site-header/site-header.test.tsx`:

```tsx
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { LinkAsProps } from "../../lib/link-as";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { type NavLink, SiteHeader } from "./site-header";

const LINKS: NavLink[] = [
  { label: "Homely Meals", href: "#homely-meals", isActive: true },
  { label: "Catering", href: "#catering" },
  { label: "Menu", href: "#menu" },
];

const LONG_LINKS: NavLink[] = [
  { label: "Homely Meals subscriptions", href: "#homely-meals" },
  { label: "Catering and bulk orders", href: "#catering" },
  { label: "The restaurant menu", href: "#menu" },
  { label: "Office and PG lunch", href: "#office-lunch" },
  { label: "About our kitchen", href: "#about" },
  { label: "Contact and directions", href: "#contact" },
];

const DRAWER_LINKS: NavLink[] = [
  { label: "Home", href: "#home" },
  ...LINKS,
  { label: "Contact", href: "#contact" },
];

const glassBar = () =>
  screen.getByRole("banner").querySelector('[class~="data-scrolled:bg-surface-glass"]');

function RouterLink({ href, className, children, ...props }: LinkAsProps) {
  return (
    <a href={href} className={className} data-router-link="" {...props}>
      {children}
    </a>
  );
}

afterEach(() => {
  Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
});

describe("SiteHeader", () => {
  it("is the banner landmark and starts with a skip link to the main content", async () => {
    const user = userEvent.setup();
    render(<SiteHeader homeHref="#home" links={LINKS} />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    await user.tab();
    const skip = screen.getByRole("link", { name: "Skip to content" });
    expect(skip).toHaveFocus();
    expect(skip).toHaveAttribute("href", "#main");
  });

  it("links the logo home and lists the nav links, the active one marked as the current page", () => {
    render(<SiteHeader homeHref="#home" links={LINKS} />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getAllByRole("link")).toHaveLength(3);
    expect(within(nav).getByRole("link", { name: "Homely Meals" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(within(nav).getByRole("link", { name: "Catering" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("img", { name: /Pink Paprikaa/ }).closest("a")).toHaveAttribute(
      "href",
      "#home"
    );
  });

  it("names its navigation from navLabel, so two mastheads on one page stay distinct", () => {
    render(<SiteHeader homeHref="#home" links={LINKS} navLabel="Main, catering" />);
    expect(screen.getByRole("navigation", { name: "Main, catering" })).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Main" })).not.toBeInTheDocument();
  });

  it("keeps three links inline below xl, never wrapping, and moves the rest into the drawer", async () => {
    const user = userEvent.setup();
    render(<SiteHeader homeHref="#home" links={LONG_LINKS} />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    const items = within(nav).getAllByRole("listitem");
    for (const item of items.slice(0, 3)) expect(item).not.toHaveClass("hidden");
    for (const item of items.slice(3)) expect(item).toHaveClass("hidden", "xl:block");
    for (const link of within(nav).getAllByRole("link")) {
      expect(link).toHaveClass("whitespace-nowrap");
    }
    expect(within(nav).getByRole("list")).toHaveClass("flex-nowrap");
    const menuButton = screen.getByRole("button", { name: "Menu" });
    expect(menuButton).toHaveClass("xl:hidden");
    await user.click(menuButton);
    const drawer = screen.getByRole("dialog", { name: "Menu" });
    for (const { label } of LONG_LINKS) {
      expect(within(drawer).getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("hides the menu button from lg when every link fits inline", () => {
    render(<SiteHeader homeHref="#home" links={LINKS} />);
    expect(screen.getByRole("button", { name: "Menu" })).toHaveClass("lg:hidden");
  });

  it("the drawer traps focus, locks the page, closes on Escape and on any link, and returns focus", async () => {
    const user = userEvent.setup();
    render(
      <SiteHeader
        homeHref="#home"
        links={LINKS}
        drawerLinks={DRAWER_LINKS}
        drawerActions={<a href="#order">Order online</a>}
      />
    );
    const menuButton = screen.getByRole("button", { name: "Menu" });
    await user.click(menuButton);
    const drawer = screen.getByRole("dialog", { name: "Menu" });
    expect(within(drawer).getAllByRole("link")).toHaveLength(DRAWER_LINKS.length + 1);
    expect(document.body).toHaveAttribute("data-scroll-locked");

    const stops = DRAWER_LINKS.length + 2;
    for (let step = 0; step < stops + 2; step += 1) {
      await user.tab();
      expect(drawer.contains(document.activeElement)).toBe(true);
    }

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(menuButton).toHaveFocus();
    expect(document.body).not.toHaveAttribute("data-scroll-locked");

    await user.click(menuButton);
    await user.click(within(screen.getByRole("dialog")).getByRole("link", { name: "Catering" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the drawer from the keyboard, hides the bar's own links behind it, and closes from its close button", async () => {
    const user = userEvent.setup();
    render(<SiteHeader homeHref="#home" links={LINKS} />);
    screen.getByRole("button", { name: "Menu" }).focus();
    await user.keyboard("{Enter}");
    const drawer = screen.getByRole("dialog", { name: "Menu" });
    // Radix hides the rest of the page while the drawer is open: one "Catering" link, not two.
    expect(screen.getAllByRole("link", { name: "Catering" })).toHaveLength(1);
    await user.click(within(drawer).getByRole("button", { name: "Close menu" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("turns the bar to glass once the page scrolls past 24px, and back at the top", () => {
    render(<SiteHeader homeHref="#home" links={LINKS} />);
    expect(glassBar()).not.toHaveAttribute("data-scrolled");
    Object.defineProperty(window, "scrollY", { configurable: true, value: 120 });
    fireEvent.scroll(window);
    expect(glassBar()).toHaveAttribute("data-scrolled");
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
    fireEvent.scroll(window);
    expect(glassBar()).not.toHaveAttribute("data-scrolled");
  });

  it("is 88px by default and 64px compact, sizing the default lockup to match", () => {
    const { rerender } = render(<SiteHeader homeHref="#home" links={LINKS} />);
    const row = () => glassBar()?.firstElementChild;
    expect(row()).toHaveClass("h-header");
    expect(screen.getByRole("img", { name: /Pink Paprikaa/ })).toHaveClass("w-site-header-logo");
    rerender(<SiteHeader homeHref="#home" links={LINKS} size="compact" />);
    expect(row()).toHaveClass("h-header-compact");
    expect(screen.getByRole("img", { name: /Pink Paprikaa/ })).toHaveClass(
      "w-site-header-logo-compact"
    );
  });

  it("places the announcement above the bar and the badge beside the logo", () => {
    render(
      <SiteHeader
        homeHref="#home"
        links={LINKS}
        announcement={<p>Launch price closes soon</p>}
        badge={<span>Pure Veg</span>}
      />
    );
    const announcement = screen.getByText("Launch price closes soon");
    const bar = glassBar();
    expect(bar).not.toBeNull();
    expect(bar?.contains(announcement)).toBe(false);
    expect(bar).toContainElement(screen.getByText("Pure Veg"));
  });

  it("shows actions from lg and compact actions below it", () => {
    render(
      <SiteHeader
        homeHref="#home"
        links={LINKS}
        actions={<a href="#order">Order online</a>}
        compactActions={<a href="#wa">WhatsApp us</a>}
      />
    );
    expect(screen.getByRole("link", { name: "Order online" }).parentElement).toHaveClass(
      "hidden",
      "lg:flex"
    );
    expect(screen.getByRole("link", { name: "WhatsApp us" }).parentElement).toHaveClass(
      "lg:hidden"
    );
  });

  it("renders the home and nav links through linkAs", () => {
    render(<SiteHeader homeHref="#home" links={LINKS} linkAs={RouterLink} />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getByRole("link", { name: "Catering" })).toHaveAttribute("data-router-link");
    expect(within(nav).getByRole("link", { name: "Homely Meals" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("portals the drawer into the given container", async () => {
    const user = userEvent.setup();
    const frame = document.createElement("div");
    document.body.append(frame);
    render(<SiteHeader homeHref="#home" links={LINKS} portalContainer={frame} />);
    await user.click(screen.getByRole("button", { name: "Menu" }));
    expect(frame).toContainElement(screen.getByRole("dialog", { name: "Menu" }));
    frame.remove();
  });

  it("merges a caller className over its own", () => {
    render(<SiteHeader homeHref="#home" links={LINKS} className="top-8" />);
    expect(screen.getByRole("banner")).toHaveClass("sticky", "top-8");
    expect(screen.getByRole("banner")).not.toHaveClass("top-0");
  });

  it("has no accessibility violations, closed or with the drawer open", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <SiteHeader homeHref="#home" links={LINKS} actions={<a href="#order">Order online</a>} />
    );
    await expectNoA11yViolations(container);
    await user.click(screen.getByRole("button", { name: "Menu" }));
    await expectNoA11yViolations(screen.getByRole("dialog"));
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- site-header 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./site-header`.

- [ ] **Step 4: Implement the glass bar leaf**

`packages/ui/src/organisms/site-header/site-header-bar.tsx`:

```tsx
"use client";

import { type ReactNode, useSyncExternalStore } from "react";

/** The page has scrolled this far before the header turns to glass (design system: `y > 24`). */
const GLASS_SCROLL_THRESHOLD = 24;

function subscribeToScroll(onChange: () => void): () => void {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => {
    window.removeEventListener("scroll", onChange);
  };
}

const isPastThreshold = (): boolean => window.scrollY > GLASS_SCROLL_THRESHOLD;
const isPastThresholdOnServer = (): boolean => false;

export interface SiteHeaderBarProps {
  className: string;
  children: ReactNode;
}

/**
 * The header row's client corner: solid at rest, `data-scrolled` (glass + blur, CSS) once the
 * page scrolls under it (readme §3.3, §3.9). Its children are server-rendered.
 */
export function SiteHeaderBar({ className, children }: SiteHeaderBarProps) {
  const isScrolled = useSyncExternalStore(
    subscribeToScroll,
    isPastThreshold,
    isPastThresholdOnServer
  );
  return (
    <div data-scrolled={isScrolled ? "" : undefined} className={className}>
      {children}
    </div>
  );
}
```

- [ ] **Step 5: Implement the drawer leaf**

`packages/ui/src/organisms/site-header/site-header-drawer.tsx`:

```tsx
"use client";

import { Menu, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { type MouseEvent, type ReactNode, useState } from "react";

import { IconButton } from "../../atoms/icon-button/icon-button";
import { componentVariants } from "../../lib/component-variants";

const drawer = componentVariants({
  slots: {
    overlay: "fixed inset-0 z-overlay bg-surface-overlay",
    content:
      "fixed inset-x-0 top-0 z-overlay flex max-h-dvh animate-sheet-in flex-col overflow-y-auto bg-surface-card shadow-4",
    bar: "container-page flex h-header-compact shrink-0 items-center justify-end",
    body: "container-page flex flex-col gap-4 pb-5",
  },
});

export interface SiteHeaderDrawerProps {
  /** Names the menu button and the drawer. */
  menuLabel: string;
  closeLabel: string;
  /** Visibility classes for the menu button (the organism decides the breakpoints). */
  triggerClassName: string;
  portalContainer: HTMLElement | null;
  /** The drawer's nav and actions, rendered by the server organism. */
  children: ReactNode;
}

/**
 * The header's menu: a Radix Dialog sheet from the top. Focus is trapped, Escape closes it, focus
 * returns to the menu button, the page behind cannot scroll, and following any link closes it.
 */
export function SiteHeaderDrawer({
  menuLabel,
  closeLabel,
  triggerClassName,
  portalContainer,
  children,
}: SiteHeaderDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const slots = drawer();

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest("a[href]") !== null) {
      setIsOpen(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <IconButton
          icon={Menu}
          label={menuLabel}
          variant="secondary"
          className={triggerClassName}
        />
      </Dialog.Trigger>
      <Dialog.Portal container={portalContainer}>
        <Dialog.Overlay className={slots.overlay()} />
        <Dialog.Content data-surface="light" className={slots.content()} onClick={handleClick}>
          <Dialog.Title className="sr-only">{menuLabel}</Dialog.Title>
          <div className={slots.bar()}>
            <Dialog.Close asChild>
              <IconButton icon={X} label={closeLabel} variant="secondary" />
            </Dialog.Close>
          </div>
          <div className={slots.body()}>{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

- [ ] **Step 6: Implement the organism**

`packages/ui/src/organisms/site-header/site-header.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { ChevronRight } from "lucide-react";

import type { LinkAs } from "../../lib/link-as";

import { Icon } from "../../atoms/icon/icon";
import { Logo } from "../../atoms/logo/logo";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { SiteHeaderBar } from "./site-header-bar";
import { SiteHeaderDrawer } from "./site-header-drawer";

export interface NavLink {
  label: string;
  href: string;
  isActive?: boolean | undefined;
}

/** Between lg and xl the inline nav keeps its first three links; the rest wait for xl (readme §3.10). */
const INLINE_LINKS_BELOW_XL = 3;

const siteHeader = componentVariants({
  slots: {
    root: "sticky top-0 z-header",
    skipLink:
      "sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-overlay focus:rounded-pill focus:bg-surface-card focus:px-4 focus:py-2 focus:font-display focus:font-bold focus:text-text-link focus:shadow-3",
    bar: "border-b border-transparent bg-surface-card transition-colors duration-base ease-out data-scrolled:border-border-subtle data-scrolled:bg-surface-glass data-scrolled:backdrop-blur-glass",
    row: "container-page flex items-center gap-5",
    home: "flex shrink-0 items-center",
    logo: "h-auto",
    badge: "flex shrink-0 items-center",
    nav: "ml-3 hidden lg:block",
    navList: "flex flex-nowrap items-center gap-6",
    navItem: "shrink-0",
    navLink:
      "text-site-header-link inline-flex border-b-2 border-transparent py-1.5 font-display whitespace-nowrap text-text-heading no-underline transition-colors duration-fast ease-out hover:text-text-brand",
    spacer: "flex-1",
    actions: "hidden shrink-0 items-center gap-2 lg:flex",
    compactActions: "flex shrink-0 items-center gap-2 lg:hidden",
    menuButton: "shrink-0",
    drawerList: "flex flex-col",
    drawerLink:
      "flex items-center justify-between border-b border-border-subtle py-3.5 font-display text-body-lg font-semibold text-text-heading no-underline",
    drawerChevron: "text-text-muted",
    drawerActions: "grid grid-cols-2 gap-2",
  },
  variants: {
    size: {
      default: { row: "h-header", logo: "w-site-header-logo" },
      compact: { row: "h-header-compact", logo: "w-site-header-logo-compact" },
    },
    isActive: {
      true: { navLink: "border-border-brand text-text-brand", drawerLink: "text-text-brand" },
    },
    isHiddenBelowXl: { true: { navItem: "hidden xl:block" } },
    hasHiddenLinks: { true: { menuButton: "xl:hidden" }, false: { menuButton: "lg:hidden" } },
  },
  defaultVariants: { size: "default" },
});

export interface SiteHeaderProps
  extends ComponentProps<"header">, Pick<VariantProps<typeof siteHeader>, "size"> {
  homeHref: string;
  /** Inline nav links. Three show between lg and xl, all from xl (the rest are in the drawer). */
  links: NavLink[];
  /** The drawer's links; defaults to `links` (the handoff drawer lists more destinations). */
  drawerLinks?: NavLink[] | undefined;
  /** Replaces the default lockup. Size it yourself (`className="w-…"`). */
  logo?: ReactNode;
  /** From lg: "Order online" + "WhatsApp us" — `<Button asChild size="sm"><a …/></Button>`. */
  actions?: ReactNode;
  /** In the drawer, under its links: the same actions, full width. */
  drawerActions?: ReactNode;
  /** Below lg, beside the menu button: e.g. a WhatsApp IconButton. */
  compactActions?: ReactNode;
  /** Above the bar, e.g. the launch AnnouncementBar with its Countdown. */
  announcement?: ReactNode;
  /** Beside the logo, e.g. the Pure Veg badge. */
  badge?: ReactNode;
  skipLinkHref?: string | undefined;
  skipLinkLabel?: string | undefined;
  linkAs?: LinkAs | undefined;
  navLabel?: string | undefined;
  menuLabel?: string | undefined;
  closeMenuLabel?: string | undefined;
  /** Where the drawer portals (default `document.body`); for page frames in kits — client callers only. */
  portalContainer?: HTMLElement | null | undefined;
}

/**
 * The website masthead: sticky, solid at rest and glass once the page scrolls under it. The
 * nav shortens by CSS at the token breakpoints instead of wrapping or clipping, and the menu
 * drawer holds every destination whenever the bar cannot. Server-rendered; only the glass bar
 * and the drawer are client leaves.
 */
export function SiteHeader({
  homeHref,
  links,
  drawerLinks = links,
  logo,
  actions,
  drawerActions,
  compactActions,
  announcement,
  badge,
  size,
  skipLinkHref = "#main",
  skipLinkLabel = "Skip to content",
  linkAs: LinkComponent = "a",
  navLabel = "Main",
  menuLabel = "Menu",
  closeMenuLabel = "Close menu",
  portalContainer = null,
  className,
  ...props
}: SiteHeaderProps) {
  const slots = siteHeader({ size });
  const hasHiddenLinks = links.length > INLINE_LINKS_BELOW_XL;
  const hasDrawer = drawerLinks.length > 0 || drawerActions !== undefined;
  return (
    <header className={slots.root({ className })} {...props}>
      <a href={skipLinkHref} className={slots.skipLink()}>
        {skipLinkLabel}
      </a>
      {announcement}
      <SiteHeaderBar className={slots.bar()}>
        <div className={slots.row()}>
          <LinkComponent href={homeHref} className={slots.home()}>
            {logo ?? <Logo className={slots.logo()} />}
          </LinkComponent>
          {badge ? <div className={slots.badge()}>{badge}</div> : null}
          {links.length > 0 ? (
            <nav aria-label={navLabel} className={slots.nav()}>
              <ul className={slots.navList()}>
                {links.map((link, index) => (
                  <li
                    key={link.href}
                    className={slots.navItem({ isHiddenBelowXl: index >= INLINE_LINKS_BELOW_XL })}
                  >
                    <LinkComponent
                      href={link.href}
                      aria-current={link.isActive === true ? "page" : undefined}
                      className={slots.navLink({ isActive: link.isActive === true })}
                    >
                      {link.label}
                    </LinkComponent>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
          <div className={slots.spacer()} />
          {actions ? <div className={slots.actions()}>{actions}</div> : null}
          {compactActions ? <div className={slots.compactActions()}>{compactActions}</div> : null}
          {hasDrawer ? (
            <SiteHeaderDrawer
              menuLabel={menuLabel}
              closeLabel={closeMenuLabel}
              triggerClassName={slots.menuButton({ hasHiddenLinks })}
              portalContainer={portalContainer}
            >
              <nav aria-label={navLabel}>
                <ul className={slots.drawerList()}>
                  {drawerLinks.map((link) => (
                    <li key={link.href}>
                      <LinkComponent
                        href={link.href}
                        aria-current={link.isActive === true ? "page" : undefined}
                        className={slots.drawerLink({ isActive: link.isActive === true })}
                      >
                        {link.label}
                        <Icon icon={ChevronRight} size="sm" className={slots.drawerChevron()} />
                      </LinkComponent>
                    </li>
                  ))}
                </ul>
              </nav>
              {drawerActions ? <div className={slots.drawerActions()}>{drawerActions}</div> : null}
            </SiteHeaderDrawer>
          ) : null}
        </div>
      </SiteHeaderBar>
    </header>
  );
}
```

- [ ] **Step 7: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- site-header 2>&1 | tail -8`
Expected: PASS (15 tests). If the focus-trap loop fails on a Radix focus guard (`data-radix-focus-guard`), check the guard is outside the dialog and that FocusScope moved focus back — never loosen the assertion.

- [ ] **Step 8: Stories (card parity with `SiteHeader.card.html` + handoff `PPHeader`)**

`packages/ui/src/organisms/site-header/site-header.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MessageCircle, Search, ShoppingBag } from "lucide-react";
import { expect, screen, waitFor } from "storybook/test";

import { Badge } from "../../atoms/badge/badge";
import { Button } from "../../atoms/button/button";
import { DietMark } from "../../atoms/diet-mark/diet-mark";
import { IconButton } from "../../atoms/icon-button/icon-button";
import { AnnouncementBar } from "../../molecules/announcement-bar/announcement-bar";
import { BRAND, VIEWPORT_1024, VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { type NavLink, SiteHeader } from "./site-header";

/** The handoff launch offer ends 2026-10-31; stories keep a live countdown 30 days out. */
const LAUNCH_ENDS = new Date(Date.now() + 30 * 86_400_000).toISOString();

const DS_LINKS: NavLink[] = [
  { label: "Menu", href: "#menu" },
  { label: "Our Story", href: "#about" },
  { label: "Outlets", href: "#outlets" },
  { label: "Franchise", href: "#franchise" },
  { label: "Careers", href: "#careers" },
];

const HANDOFF_LINKS: NavLink[] = [
  { label: "Homely Meals", href: "#homely-meals", isActive: true },
  { label: "Catering", href: "#catering" },
  { label: "Menu", href: "#menu" },
  { label: "About", href: "#about" },
];

const HANDOFF_DRAWER_LINKS: NavLink[] = [
  { label: "Home", href: "#home" },
  { label: "Homely Meals", href: "#homely-meals", isActive: true },
  { label: "This week’s menu", href: "#this-week" },
  { label: "Catering", href: "#catering" },
  { label: "Office & PG Lunch", href: "#office-lunch" },
  { label: "Menu", href: "#menu" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const LONG_LINKS: NavLink[] = [
  { label: "Homely Meals subscriptions", href: "#homely-meals" },
  { label: "Catering and bulk orders", href: "#catering" },
  { label: "The restaurant menu", href: "#menu" },
  { label: "Office and PG lunch", href: "#office-lunch" },
  { label: "About our kitchen", href: "#about" },
  { label: "Contact and directions", href: "#contact" },
];

const handoffButtons = (size: "sm" | "md", isFullWidth: boolean) => (
  <>
    <Button asChild variant="secondary" size={size} icon={ShoppingBag} isFullWidth={isFullWidth}>
      <a href={BRAND.orderOnlineHref}>Order online</a>
    </Button>
    <Button asChild size={size} icon={MessageCircle} isFullWidth={isFullWidth}>
      <a href={BRAND.whatsappHref}>WhatsApp us</a>
    </Button>
  </>
);

const dsActions = (cartCount: number) => (
  <>
    <IconButton icon={Search} label="Search the menu" />
    <IconButton icon={ShoppingBag} label="Your order" count={cartCount} />
    <Button variant="secondary" size="sm">
      Book a Table
    </Button>
    <Button size="sm" icon={ShoppingBag}>
      Order Now
    </Button>
  </>
);

const HANDOFF = {
  size: "compact",
  links: HANDOFF_LINKS,
  drawerLinks: HANDOFF_DRAWER_LINKS,
  announcement: (
    <AnnouncementBar href="#homely-meals" endsAt={LAUNCH_ENDS}>
      Launch price: <strong>Classic at ₹130 a meal</strong> for the first 50 subscribers · closes in
    </AnnouncementBar>
  ),
  badge: (
    <Badge tone="success">
      <DietMark size="sm" />
      Pure Veg
    </Badge>
  ),
  actions: handoffButtons("sm", false),
  drawerActions: handoffButtons("md", true),
  compactActions: (
    <IconButton asChild icon={MessageCircle} label="WhatsApp us" variant="primary">
      <a href={BRAND.whatsappHref} aria-label="WhatsApp us" />
    </IconButton>
  ),
} as const;

const meta = {
  title: "Organisms/SiteHeader",
  component: SiteHeader,
  args: { homeHref: "#home", ...HANDOFF },
  decorators: [
    (Story) => (
      <>
        <Story />
        <main id="main" className="container-page py-10">
          <div className="h-400 rounded-lg bg-surface-page-alt" />
        </main>
      </>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { inline: false, height: "420px" },
      description: {
        component:
          'The website masthead — sticky, solid at rest and glass once scrolled past 24px. `size="default"` is the design system\'s 88px bar; `size="compact"` the handoff\'s 64px row under the launch AnnouncementBar. The nav never wraps or clips: from lg it shows inline, between lg and xl only its first three links, and the menu drawer (a focus-trapped sheet) carries every destination whenever the bar cannot. Never add a third CTA.',
      },
    },
  },
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row: "rest" — the design system's 88px header. */
export const Rest: Story = {
  args: {
    size: "default",
    links: DS_LINKS,
    drawerLinks: DS_LINKS,
    announcement: undefined,
    badge: undefined,
    actions: dsActions(0),
    drawerActions: undefined,
    compactActions: <IconButton icon={ShoppingBag} label="Your order" />,
  },
};

/** Card row: "scrolled + cart" — glass over the tinted page, cart count 2. */
export const ScrolledWithCart: Story = {
  args: {
    ...Rest.args,
    actions: dsActions(2),
    compactActions: <IconButton icon={ShoppingBag} label="Your order" count={2} />,
  },
  play: async ({ canvas, canvasElement }) => {
    canvasElement.ownerDocument.defaultView?.scrollTo(0, 240);
    const bar = canvas
      .getByRole("banner")
      .querySelector('[class~="data-scrolled:bg-surface-glass"]');
    await waitFor(() => expect(bar).toHaveAttribute("data-scrolled"));
  },
};

/**
 * Cart counts 0, 1 and 12 on the design-system header. A document holds one `banner` and no two
 * landmarks may share a name, so each specimen sits in its own named `section` (a `header` inside
 * a `section` is not a banner) and names its own nav.
 */
export const CartCounts: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      {[0, 1, 12].map((count) => (
        <section key={count} aria-label={`Cart with ${String(count)} items`}>
          <SiteHeader
            {...args}
            size="default"
            links={DS_LINKS}
            drawerLinks={DS_LINKS}
            announcement={undefined}
            badge={undefined}
            actions={dsActions(count)}
            drawerActions={undefined}
            compactActions={<IconButton icon={ShoppingBag} label="Your order" count={count} />}
            navLabel={`Main, cart with ${String(count)} items`}
          />
        </section>
      ))}
    </div>
  ),
};

/** Handoff PPHeader — launch bar, Pure Veg chip, four links, two actions. */
export const HandoffCompact: Story = {};

/** Six long links at 1024px: three inline, the menu button carries the rest. */
export const LongLinksAtLg: Story = {
  args: { links: LONG_LINKS, drawerLinks: LONG_LINKS },
  globals: VIEWPORT_1024,
};

/** The drawer by keyboard: open, Escape, focus back on the menu button. */
export const DrawerKeyboard: Story = {
  globals: VIEWPORT_360,
  play: async ({ canvas, userEvent }) => {
    const menuButton = canvas.getByRole("button", { name: "Menu" });
    await userEvent.click(menuButton);
    const drawer = await screen.findByRole("dialog", { name: "Menu" });
    await expect(drawer).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(menuButton).toHaveFocus();
  },
};

export const Mobile: Story = { globals: VIEWPORT_360 };
export const Tablet: Story = { globals: VIEWPORT_768 };
export const Desktop: Story = { globals: VIEWPORT_1280 };
```

- [ ] **Step 9: Export**

```ts
export {
  type NavLink,
  SiteHeader,
  type SiteHeaderProps,
} from "./organisms/site-header/site-header";
```

- [ ] **Step 10: Format, gate, commit**

```bash
pnpm exec prettier --write packages/ui/src/organisms/site-header packages/design-tokens/tokens/component/site-header.json packages/design-tokens/contrast-pairs.json packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
git add packages/design-tokens/tokens/component/site-header.json packages/design-tokens/contrast-pairs.json packages/ui/src/organisms/site-header packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): add the SiteHeader organism

Sticky masthead at the design system's 88px or the handoff's 64px, with a
skip link, announcement and badge slots, and a nav that shortens by CSS at
the token breakpoints instead of wrapping or clipping. Two client leaves
keep the rest server-rendered: the bar turns to glass past 24px via
useSyncExternalStore, and the menu drawer is a Radix sheet that traps
focus, locks the page, closes on Escape or any link and returns focus.
Adds the glass-bar text pairs to the contrast policy.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 13: ReviewCarousel

**Dev reference:** none (handoff component)

**Files:**

- Create: `packages/design-tokens/tokens/component/review-carousel.json`
- Modify: `packages/ui/eslint.config.mjs` (a scrollable region may take focus — skip if Task 0 found it configured)
- Create: `packages/ui/src/organisms/review-carousel/review-carousel.tsx`, `review-carousel-track.tsx` (client leaf), `review-carousel.test.tsx`, `review-carousel.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `IconButton`, `Link`, `Text`, `ReviewCard`/`ReviewCardProps`, `componentVariants`, `headingTag`; stories: `Button`, `Card`, `Icon`, `Logo`.
- Produces: `ReviewCarousel`, `ReviewCarouselProps`. The track leaf is internal.

- [ ] **Step 1: Let a scrollable region take keyboard focus (lint)**

`jsx-a11y/no-noninteractive-tabindex` (recommended config) allows `tabIndex` only on `tabpanel`. A horizontally scrolling track must be focusable so keyboard users can scroll it with the arrow keys (WCAG 2.1.1; axe `scrollable-region-focusable`). In `packages/ui/eslint.config.mjs`, add a block after the `settings` block:

```js
  {
    // A scrolling region (ReviewCarousel's track, a Table scroll wrapper) must take keyboard
    // focus so it can be scrolled with the arrow keys — WCAG 2.1.1, axe
    // `scrollable-region-focusable`. `region` joins the rule's default `tabpanel` exception.
    files: ["src/**/*.tsx"],
    rules: {
      "jsx-a11y/no-noninteractive-tabindex": [
        "error",
        { tags: [], roles: ["tabpanel", "region"], allowExpressionValues: true },
      ],
    },
  },
```

- [ ] **Step 2: Component token**

`packages/design-tokens/tokens/component/review-carousel.json`:

```json
{
  "grid-auto-columns": {
    "$type": "gridTemplate",
    "review-carousel": {
      "$value": "minmax(min(320px, 85%), 1fr)",
      "$description": "Review cards at least 320px (85% on phones, so the next card peeks) and stretching to fill when few (handoff GoogleReviews)."
    }
  }
}
```

(Tailwind's `auto-cols-*` reads the `--grid-auto-columns-*` namespace, so `auto-cols-review-carousel` is a named utility.)

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && rtk proxy grep -n "review-carousel" packages/design-tokens/dist/theme.css`
Expected: `--grid-auto-columns-review-carousel: minmax(min(320px, 85%), 1fr);` and no Style Dictionary warning (the `gridTemplate` type drives no transform — the platform uses only `attribute/cti` and `name/kebab`).

- [ ] **Step 3: Write the failing test**

`packages/ui/src/organisms/review-carousel/review-carousel.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { GOOGLE_REVIEWS } from "../story-fixtures";
import { ReviewCarousel } from "./review-carousel";

const HEADING = "Gurgaon eats with us every day.";
const scrollBy = vi.fn();

/** jsdom has no layout: give the track a size and a scroll position, then tell it it scrolled. */
function layOut(track: HTMLElement, { scrollLeft }: { scrollLeft: number }) {
  Object.defineProperties(track, {
    scrollWidth: { configurable: true, value: 3000 },
    clientWidth: { configurable: true, value: 1000 },
    scrollLeft: { configurable: true, writable: true, value: scrollLeft },
  });
  fireEvent.scroll(track);
}

beforeEach(() => {
  scrollBy.mockClear();
  Object.defineProperty(HTMLElement.prototype, "scrollBy", {
    configurable: true,
    writable: true,
    value: scrollBy,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("ReviewCarousel", () => {
  it("heads the carousel with its eyebrow and a level-2 heading", () => {
    render(
      <ReviewCarousel
        eyebrow="Verified Google reviews"
        heading={HEADING}
        reviews={GOOGLE_REVIEWS}
      />
    );
    expect(screen.getByRole("heading", { level: 2, name: HEADING })).toBeInTheDocument();
    expect(screen.getByText("Verified Google reviews")).toBeInTheDocument();
  });

  it("makes the track a keyboard-focusable region named by the heading", () => {
    render(<ReviewCarousel heading={HEADING} reviews={GOOGLE_REVIEWS} />);
    const track = screen.getByRole("region", { name: HEADING });
    expect(track).toHaveAttribute("tabindex", "0");
    expect(track.querySelectorAll("figure")).toHaveLength(GOOGLE_REVIEWS.length);
  });

  it("disables previous at the start and next at the end, keeping both focusable", () => {
    render(<ReviewCarousel heading={HEADING} reviews={GOOGLE_REVIEWS} />);
    const track = screen.getByRole("region", { name: HEADING });
    const previous = screen.getByRole("button", { name: "Previous reviews" });
    const next = screen.getByRole("button", { name: "Next reviews" });

    layOut(track, { scrollLeft: 0 });
    expect(previous).toHaveAttribute("aria-disabled", "true");
    expect(next).toHaveAttribute("aria-disabled", "false");

    layOut(track, { scrollLeft: 900 });
    expect(previous).toHaveAttribute("aria-disabled", "false");
    expect(next).toHaveAttribute("aria-disabled", "false");

    layOut(track, { scrollLeft: 2000 });
    expect(next).toHaveAttribute("aria-disabled", "true");
    expect(next).not.toBeDisabled();
  });

  it("pages by 90% of the visible width from the keyboard, and not past an end", async () => {
    const user = userEvent.setup();
    render(<ReviewCarousel heading={HEADING} reviews={GOOGLE_REVIEWS} />);
    const track = screen.getByRole("region", { name: HEADING });
    layOut(track, { scrollLeft: 0 });

    screen.getByRole("button", { name: "Next reviews" }).focus();
    await user.keyboard("{Enter}");
    expect(scrollBy).toHaveBeenCalledWith({ left: 900 });

    scrollBy.mockClear();
    await user.click(screen.getByRole("button", { name: "Previous reviews" }));
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it("honours reduced motion: smooth scrolling is CSS under motion-safe, never forced by script", async () => {
    const user = userEvent.setup();
    render(<ReviewCarousel heading={HEADING} reviews={GOOGLE_REVIEWS} />);
    const track = screen.getByRole("region", { name: HEADING });
    expect(track).toHaveClass("motion-safe:scroll-smooth");
    expect(track).not.toHaveClass("scroll-smooth");
    layOut(track, { scrollLeft: 0 });
    await user.click(screen.getByRole("button", { name: "Next reviews" }));
    expect(scrollBy.mock.calls[0]?.[0]).not.toHaveProperty("behavior");
  });

  it("never auto-advances", () => {
    vi.useFakeTimers();
    render(<ReviewCarousel heading={HEADING} reviews={GOOGLE_REVIEWS} />);
    vi.advanceTimersByTime(60_000);
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it("shows no controls for one review", () => {
    render(<ReviewCarousel heading={HEADING} reviews={GOOGLE_REVIEWS.slice(0, 1)} />);
    expect(screen.getByRole("region", { name: HEADING })).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders the empty state and no track when there are no reviews", () => {
    render(
      <ReviewCarousel
        heading={HEADING}
        reviews={[]}
        emptyState={<p>Read our reviews on Google</p>}
      />
    );
    expect(screen.getByText("Read our reviews on Google")).toBeInTheDocument();
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("links to all the reviews, opening an external link in a new tab", () => {
    render(
      <ReviewCarousel
        heading={HEADING}
        reviews={GOOGLE_REVIEWS}
        footerLink={{
          label: "Read all our reviews on Google",
          href: "https://maps.google.com/?q=Pink+Paprikaa",
          isExternal: true,
        }}
      />
    );
    const link = screen.getByRole("link", { name: /Read all our reviews on Google/ });
    expect(link).toHaveAttribute("href", "https://maps.google.com/?q=Pink+Paprikaa");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <ReviewCarousel
        eyebrow="Verified Google reviews"
        heading={HEADING}
        reviews={GOOGLE_REVIEWS}
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 4: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- review-carousel 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./review-carousel`.

- [ ] **Step 5: Implement the track leaf**

`packages/ui/src/organisms/review-carousel/review-carousel-track.tsx`:

```tsx
"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { type ReactNode, useCallback, useState, useSyncExternalStore } from "react";

import { IconButton } from "../../atoms/icon-button/icon-button";
import { componentVariants } from "../../lib/component-variants";

/** One press moves 90% of the visible width, so a sliver of the last card stays for context (handoff). */
const PAGE_FRACTION = 0.9;
/** Sub-pixel scroll positions still count as "at the edge". */
const EDGE_TOLERANCE = 1;

type TrackPosition = "none" | "start" | "middle" | "end";

function positionOf(track: HTMLElement): TrackPosition {
  const maxScroll = track.scrollWidth - track.clientWidth;
  if (maxScroll <= EDGE_TOLERANCE) return "none";
  if (track.scrollLeft <= EDGE_TOLERANCE) return "start";
  if (track.scrollLeft >= maxScroll - EDGE_TOLERANCE) return "end";
  return "middle";
}

const serverPosition = (): TrackPosition => "start";

const carouselTrack = componentVariants({
  slots: {
    header: "flex flex-wrap items-end justify-between gap-5",
    controls: "flex shrink-0 items-center gap-2",
    track:
      "auto-cols-review-carousel grid snap-x snap-mandatory grid-flow-col gap-5 overflow-x-auto overscroll-x-contain px-1 pt-1 pb-4 *:min-w-0 *:snap-start motion-safe:scroll-smooth",
  },
});

export interface ReviewCarouselTrackProps {
  /** Eyebrow and heading, rendered by the server organism. */
  header: ReactNode;
  /** Id of the heading that names the track region. */
  labelledBy: string;
  previousLabel: string;
  nextLabel: string;
  hasControls: boolean;
  /** The ReviewCards, rendered by the server organism. */
  children: ReactNode;
}

/**
 * The carousel's client corner: a scroll-snap track that is a focusable region (arrow keys scroll
 * it natively) and previous/next buttons that page it. The buttons are `aria-disabled` at the
 * ends, so a keyboard user's focus stays put. Nothing auto-advances; smoothness is `motion-safe:`
 * CSS, so reduced motion jumps instead of gliding.
 */
export function ReviewCarouselTrack({
  header,
  labelledBy,
  previousLabel,
  nextLabel,
  hasControls,
  children,
}: ReviewCarouselTrackProps) {
  const [track, setTrack] = useState<HTMLDivElement | null>(null);

  const subscribe = useCallback(
    (onChange: () => void) => {
      if (track === null) return () => undefined;
      track.addEventListener("scroll", onChange, { passive: true });
      const resize = new ResizeObserver(onChange);
      resize.observe(track);
      return () => {
        track.removeEventListener("scroll", onChange);
        resize.disconnect();
      };
    },
    [track]
  );
  const position = useSyncExternalStore(
    subscribe,
    () => (track === null ? "start" : positionOf(track)),
    serverPosition
  );

  const canGoPrevious = position === "middle" || position === "end";
  const canGoNext = position === "start" || position === "middle";
  const slots = carouselTrack();

  const page = (direction: -1 | 1, isEnabled: boolean) => {
    if (!isEnabled || track === null) return;
    track.scrollBy({ left: direction * track.clientWidth * PAGE_FRACTION });
  };

  return (
    <>
      <div className={slots.header()}>
        {header}
        {hasControls ? (
          <div className={slots.controls()}>
            <IconButton
              icon={ArrowLeft}
              label={previousLabel}
              variant="secondary"
              size="lg"
              aria-disabled={!canGoPrevious}
              onClick={() => {
                page(-1, canGoPrevious);
              }}
            />
            <IconButton
              icon={ArrowRight}
              label={nextLabel}
              variant="primary"
              size="lg"
              aria-disabled={!canGoNext}
              onClick={() => {
                page(1, canGoNext);
              }}
            />
          </div>
        ) : null}
      </div>
      <div
        ref={setTrack}
        role="region"
        aria-labelledby={labelledBy}
        tabIndex={0}
        className={slots.track()}
      >
        {children}
      </div>
    </>
  );
}
```

- [ ] **Step 6: Implement the organism**

`packages/ui/src/organisms/review-carousel/review-carousel.tsx`:

```tsx
import { type ComponentProps, type ReactNode, useId } from "react";

import { Link } from "../../atoms/link/link";
import { Text } from "../../atoms/text/text";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { ReviewCard, type ReviewCardProps } from "../../molecules/review-card/review-card";
import { ReviewCarouselTrack } from "./review-carousel-track";

const reviewCarousel = componentVariants({
  slots: {
    root: "section-y",
    inner: "container-page flex flex-col gap-8",
    titles: "flex min-w-0 flex-col gap-3",
    eyebrow: "flex items-center gap-2",
    footer: "self-start",
  },
});

export interface ReviewCarouselProps extends Omit<ComponentProps<"section">, "title"> {
  /** e.g. `<><Icon icon={BadgeCheck} size="sm" />4.6 on Google · 120 verified reviews</>`. */
  eyebrow?: ReactNode;
  heading: ReactNode;
  /** Real, verified reviews only. */
  reviews: ReviewCardProps[];
  footerLink?: { label: string; href: string; isExternal?: boolean | undefined } | undefined;
  /** Shown in place of the track when there are no reviews. */
  emptyState?: ReactNode;
  headingLevel?: HeadingLevel | undefined;
  previousLabel?: string | undefined;
  nextLabel?: string | undefined;
}

/**
 * Guest reviews in a horizontal scroll-snap track (handoff GoogleReviews): a focusable region
 * named by the heading, previous/next paging from the header row, an empty state when there
 * are none, and a link to all of them. Server-rendered; the track and controls are a client leaf.
 */
export function ReviewCarousel({
  eyebrow,
  heading,
  reviews,
  footerLink,
  emptyState,
  headingLevel = 2,
  previousLabel = "Previous reviews",
  nextLabel = "Next reviews",
  className,
  ...props
}: ReviewCarouselProps) {
  const headingId = useId();
  const slots = reviewCarousel();
  const titles = (
    <div className={slots.titles()}>
      {eyebrow ? (
        <Text variant="overline" tone="brand" className={slots.eyebrow()}>
          {eyebrow}
        </Text>
      ) : null}
      <Text as={headingTag(headingLevel)} id={headingId} variant="display-2" isFluid isBalanced>
        {heading}
      </Text>
    </div>
  );
  return (
    <section className={slots.root({ className })} {...props}>
      <div className={slots.inner()}>
        {reviews.length === 0 ? (
          <>
            {titles}
            {emptyState}
          </>
        ) : (
          <ReviewCarouselTrack
            header={titles}
            labelledBy={headingId}
            previousLabel={previousLabel}
            nextLabel={nextLabel}
            hasControls={reviews.length > 1}
          >
            {reviews.map((review, index) => (
              <ReviewCard key={index} {...review} />
            ))}
          </ReviewCarouselTrack>
        )}
        {footerLink ? (
          <Link
            href={footerLink.href}
            isExternal={footerLink.isExternal}
            className={slots.footer()}
          >
            {footerLink.label}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- review-carousel 2>&1 | tail -8`
Expected: PASS (10 tests).

- [ ] **Step 8: Stories (handoff `GoogleReviews`)**

`packages/ui/src/organisms/review-carousel/review-carousel.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { expect, waitFor } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { Card } from "../../atoms/card/card";
import { Icon } from "../../atoms/icon/icon";
import { Logo } from "../../atoms/logo/logo";
import { Text } from "../../atoms/text/text";
import {
  BRAND,
  GOOGLE_REVIEWS,
  VIEWPORT_1280,
  VIEWPORT_360,
  VIEWPORT_768,
} from "../story-fixtures";
import { ReviewCarousel } from "./review-carousel";

const HEADING = "Gurgaon eats with us every day.";

/** The handoff's review cards carry no avatar (ReviewCard `hasAvatar`, Plan 3b). */
const HANDOFF_REVIEWS = GOOGLE_REVIEWS.map((review) => ({ ...review, hasAvatar: false }));

/** The handoff's no-reviews card — page content, composed here for the story. */
const EMPTY = (
  <Card>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        <Logo variant="symbol" tone="badge" isDecorative className="w-12" />
        <div className="flex min-w-0 flex-col gap-1">
          <Text as="span" weight="bold" className="font-display">
            Read what our guests say on Google
          </Text>
          <Text as="span" variant="body-sm" tone="muted">
            Every review there is from a real Pink Paprikaa guest.
          </Text>
        </div>
      </div>
      <Button asChild iconAfter={ArrowUpRight}>
        <a href={BRAND.directionsHref} target="_blank" rel="noopener noreferrer">
          Open Google reviews
          <span className="sr-only"> Opens in a new tab</span>
        </a>
      </Button>
    </div>
  </Card>
);

const meta = {
  title: "Organisms/ReviewCarousel",
  component: ReviewCarousel,
  args: {
    eyebrow: (
      <>
        <Icon icon={BadgeCheck} size="sm" />
        Verified Google reviews
      </>
    ),
    heading: HEADING,
    reviews: HANDOFF_REVIEWS,
    footerLink: {
      label: "Read all our reviews on Google",
      href: BRAND.directionsHref,
      isExternal: true,
    },
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Verified guest reviews in a horizontal scroll-snap track (the handoff's GoogleReviews). The track is a focusable region — arrow keys scroll it; previous/next page it by 90% of its width and are aria-disabled at the ends. Nothing auto-advances; with reduced motion it jumps instead of gliding. One review shows no controls; none shows the `emptyState`.",
      },
    },
  },
} satisfies Meta<typeof ReviewCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Handoff Home — four verified reviews. */
export const HandoffHome: Story = {};

/** Handoff Office — the tinted section behind it. */
export const HandoffOnTint: Story = {
  args: { heading: "Teams that stopped ordering in.", className: "bg-surface-page-alt" },
};

export const OneReview: Story = { args: { reviews: HANDOFF_REVIEWS.slice(0, 1) } };

/** Handoff empty state — no verified reviews yet. */
export const Empty: Story = { args: { reviews: [], emptyState: EMPTY } };

/** Paging by keyboard at phone width. */
export const Paging: Story = {
  globals: VIEWPORT_360,
  play: async ({ canvas, userEvent }) => {
    const track = canvas.getByRole("region", { name: HEADING });
    const next = canvas.getByRole("button", { name: "Next reviews" });
    next.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(track.scrollLeft).toBeGreaterThan(0));
    await expect(canvas.getByRole("button", { name: "Previous reviews" })).toHaveAttribute(
      "aria-disabled",
      "false"
    );
  },
};

export const Mobile: Story = { globals: VIEWPORT_360 };
export const Tablet: Story = { globals: VIEWPORT_768 };
export const Desktop: Story = { globals: VIEWPORT_1280 };
```

- [ ] **Step 9: Export**

```ts
export {
  ReviewCarousel,
  type ReviewCarouselProps,
} from "./organisms/review-carousel/review-carousel";
```

- [ ] **Step 10: Format, gate, commit**

```bash
pnpm exec prettier --write packages/ui/src/organisms/review-carousel packages/design-tokens/tokens/component/review-carousel.json packages/ui/eslint.config.mjs packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
git add packages/design-tokens/tokens/component/review-carousel.json packages/ui/eslint.config.mjs packages/ui/src/organisms/review-carousel packages/ui/src/index.ts
git commit -m "feat(ui): add the ReviewCarousel organism

The handoff's Google reviews as a scroll-snap track that is a focusable
region named by its heading, paged by previous/next buttons that stay
focusable (aria-disabled) at the ends. No auto-advance; smooth scrolling is
motion-safe CSS; one review drops the controls, none shows the empty state.
Lint now lets a scrolling region take focus, as WCAG 2.1.1 requires.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 14: MenuList

**Dev reference:** `git show dev:packages/ui/src/organisms/menu-list/menu-list.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                      | Ruling         | Where / clause                                                                                                                             |
| ----------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Section header when titled                                                    | ALREADY        | test "heads the section with overline, a level-2 title and the action"                                                                     |
| No header at all without a title                                              | ALREADY        | test "renders only the filters when there is no title"                                                                                     |
| One pill per category, behind "All"                                           | ALREADY        | test "offers All first…"                                                                                                                   |
| The note pinned beside the pills                                              | ADD            | test "pins the note beside the filters" (its default copy: DROP, D9)                                                                       |
| First four dishes as cards, the rest as rows                                  | ALREADY        | test "shows the first gridCount dishes as cards…"                                                                                          |
| A caller's smaller `gridCount`                                                | ADD            | test "honours a smaller gridCount and drops the overflow…"                                                                                 |
| Rows only in `list`                                                           | ALREADY        | test "shows every dish as a row in the list variant"                                                                                       |
| No overflow divider when every dish fits                                      | ADD            | same new test (`gridCount={10}`)                                                                                                           |
| Filtering by pill; the chosen pill marked                                     | ALREADY        | tests "filters to a category…", "offers All first…" (`aria-checked`)                                                                       |
| `defaultCategory`                                                             | ADD            | contract delta 6 (R110): a string seeding the client leaf, All when not on offer; tests "opens on defaultCategory", "falls back to All…"   |
| Controlled `category` + `onCategoryChange`                                    | DROP           | D6 — the filter is a client leaf under a server organism, which cannot pass it a function (Contract deviations); contract §7 lists neither |
| `onAdd`; no Add control without it                                            | DROP / ALREADY | spec §9.2 — the `action` slot replaces `onAdd`: `renderItemAction` (tested); none given, no action                                         |
| Empty-state copy built in                                                     | DROP           | D9 — `emptyState` slot (tested)                                                                                                            |
| Auto-fit grid survives 360px                                                  | ALREADY        | `autogrid`                                                                                                                                 |
| Merges a caller `className`                                                   | ADD            | test "merges a caller className"                                                                                                           |
| axe                                                                           | ALREADY        | test "has no accessibility violations"                                                                                                     |
| `lede` under the heading                                                      | ADD            | contract delta 7 (R110): to SectionHeader; test "renders the lede under the heading"                                                       |
| `diet` per dish                                                               | DROP           | C10                                                                                                                                        |
| `href` per dish                                                               | ALREADY        | `getItemHref`                                                                                                                              |
| Stories Default · WithAction · ListVariant · WithoutHeader · Empty · Smallest | ALREADY        | GridWebsite · Playground (`action` arg) · ListApp · ListApp · EmptyCategory · Mobile                                                       |
| Stories GridOnly · SmallGrid                                                  | ADD            | `GridOnly`, `SmallGrid`                                                                                                                    |
| Stories PreselectedCategory · WithLede                                        | ADD            | `PreselectedCategory` · `WithLede` (contract deltas 6, 7)                                                                                  |

Implementer: copy this table into your report, extended with anything the plan missed.

**Files:**

- Create: `packages/ui/src/organisms/menu-list/menu-list.tsx`, `menu-list-filter.tsx` (client leaf), `menu-list.test.tsx`, `menu-list.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `Divider`, `SectionHeader`, `MenuItemCard`, `MenuItemRow`/`MenuItemImage`, `FilterBar`/`FilterOption`, `LinkAs`, `componentVariants`, `HeadingLevel`; the `autogrid` utility (the card's 240px minimum snaps to 260, spec §15.2); stories: `Button`, `EmptyState`, `IconButton`.
- Produces: `MenuList`, `MenuListProps`, `MenuListItem`. The filter leaf is internal.

The server organism renders one panel per filter option (All + each category) — cards for the first `gridCount` dishes and rows for the rest — calling `renderItemAction` and `getItemHref` on the server. The client leaf holds only the chosen option and shows that option's panel. No component tokens: rhythm `section-y`, width `container-page`, grid `autogrid`.

- [ ] **Step 1: Write the failing test**

`packages/ui/src/organisms/menu-list/menu-list.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { LinkAsProps } from "../../lib/link-as";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { MenuList, type MenuListItem } from "./menu-list";

const MENU: MenuListItem[] = [
  {
    id: "chilli-paneer",
    name: "Paprikaa Chilli Paneer",
    price: 280,
    spice: 3,
    category: "Small Plates",
    badge: "Bestseller",
  },
  {
    id: "keema-pav",
    name: "Mushroom Keema Pav",
    price: 340,
    was: 380,
    spice: 2,
    category: "Small Plates",
  },
  {
    id: "cold-brew",
    name: "Masala Cold Brew",
    price: 220,
    spice: 1,
    category: "Chai & Coffee",
    badge: "New",
  },
  { id: "kulhad-chai", name: "Kulhad Chai", price: 90, spice: 1, category: "Chai & Coffee" },
  { id: "toastie", name: "Bombay Toastie", price: 240, spice: 2, category: "All Day" },
  { id: "kulfi", name: "Gulkand Kulfi", price: 180, spice: 1, category: "Sweets" },
];

/** FilterBar is a Radix ToggleGroup: single-select options are radios. */
const option = (name: string) => screen.getByRole("radio", { name });

const namesIn = (element: HTMLElement) =>
  within(element)
    .getAllByRole("article")
    .map((article) => within(article).getByRole("heading").textContent);

function RouterLink({ href, className, children }: LinkAsProps) {
  return (
    <a href={href} className={className} data-router-link="">
      {children}
    </a>
  );
}

describe("MenuList", () => {
  it("heads the section with overline, a level-2 title and the action", () => {
    render(
      <MenuList
        items={MENU}
        overline="The Menu"
        title="Most ordered this week"
        action={<a href="#menu">See Full Menu</a>}
      />
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "Most ordered this week" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See Full Menu" })).toBeInTheDocument();
  });

  it("renders the lede under the heading", () => {
    render(
      <MenuList
        items={MENU}
        title="Most ordered this week"
        lede="Cooked to order in one pure-veg kitchen."
      />
    );
    expect(screen.getByText("Cooked to order in one pure-veg kitchen.")).toBeInTheDocument();
  });

  it("renders only the filters when there is no title", () => {
    render(<MenuList items={MENU} variant="list" />);
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Filter the menu" })).toBeInTheDocument();
  });

  it("offers All first, then every category in the order the dishes bring them", () => {
    render(<MenuList items={MENU} />);
    const names = within(screen.getByRole("radiogroup"))
      .getAllByRole("radio")
      .map((radio) => radio.textContent);
    expect(names).toEqual(["All", "Small Plates", "Chai & Coffee", "All Day", "Sweets"]);
    expect(option("All")).toHaveAttribute("aria-checked", "true");
  });

  it("follows an explicit category list for order and subset", () => {
    render(<MenuList items={MENU} categories={["Sweets", "Small Plates"]} />);
    const names = within(screen.getByRole("radiogroup"))
      .getAllByRole("radio")
      .map((radio) => radio.textContent);
    expect(names).toEqual(["All", "Sweets", "Small Plates"]);
  });

  it("pins the note beside the filters", () => {
    render(<MenuList items={MENU} note="100% Vegetarian" />);
    expect(screen.getByText("100% Vegetarian")).toBeInTheDocument();
  });

  it("shows the first gridCount dishes as cards and the rest as rows under the overflow label", () => {
    const { container } = render(
      <MenuList items={MENU} gridCount={4} overflowLabel="Also on the menu" />
    );
    expect(container.querySelector("ul.autogrid")?.querySelectorAll("article")).toHaveLength(4);
    expect(screen.getAllByRole("article")).toHaveLength(MENU.length);
    expect(screen.getByText("Also on the menu")).toBeInTheDocument();
  });

  it("honours a smaller gridCount and drops the overflow when every dish fits", () => {
    const { container, rerender } = render(
      <MenuList items={MENU} gridCount={2} overflowLabel="Also on the menu" />
    );
    expect(container.querySelector("ul.autogrid")?.querySelectorAll("article")).toHaveLength(2);
    rerender(<MenuList items={MENU} gridCount={10} overflowLabel="Also on the menu" />);
    expect(container.querySelector("ul.autogrid")?.querySelectorAll("article")).toHaveLength(
      MENU.length
    );
    expect(screen.queryByText("Also on the menu")).not.toBeInTheDocument();
  });

  it("shows every dish as a row in the list variant", () => {
    const { container } = render(<MenuList items={MENU} variant="list" />);
    expect(screen.getAllByRole("article")).toHaveLength(MENU.length);
    expect(container.querySelector("ul.autogrid")).toBeNull();
    expect(screen.queryByText("Also on the menu")).not.toBeInTheDocument();
  });

  it("filters to a category by pointer and by keyboard", async () => {
    const user = userEvent.setup();
    const { container } = render(<MenuList items={MENU} variant="list" />);
    await user.click(option("Chai & Coffee"));
    expect(namesIn(container)).toEqual(["Masala Cold Brew", "Kulhad Chai"]);

    await user.keyboard("{ArrowRight}");
    await user.keyboard(" ");
    expect(option("All Day")).toHaveAttribute("aria-checked", "true");
    expect(namesIn(container)).toEqual(["Bombay Toastie"]);
  });

  it("opens on defaultCategory", () => {
    const { container } = render(<MenuList items={MENU} variant="list" defaultCategory="Sweets" />);
    expect(option("Sweets")).toHaveAttribute("aria-checked", "true");
    expect(namesIn(container)).toEqual(["Gulkand Kulfi"]);
  });

  it("falls back to All when defaultCategory is not on offer", () => {
    const { container } = render(<MenuList items={MENU} variant="list" defaultCategory="Thalis" />);
    expect(option("All")).toHaveAttribute("aria-checked", "true");
    expect(namesIn(container)).toHaveLength(MENU.length);
  });

  it("keeps the current category when the chosen option is pressed again", async () => {
    const user = userEvent.setup();
    const { container } = render(<MenuList items={MENU} variant="list" />);
    await user.click(option("Sweets"));
    await user.click(option("Sweets"));
    expect(namesIn(container)).toEqual(["Gulkand Kulfi"]);
  });

  it("puts each dish's action from renderItemAction on its card or row", () => {
    render(
      <MenuList
        items={MENU}
        renderItemAction={(item) => <button type="button">{`Add ${item.name}`}</button>}
      />
    );
    expect(screen.getByRole("button", { name: "Add Paprikaa Chilli Paneer" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Gulkand Kulfi" })).toBeInTheDocument();
  });

  it("links cards through linkAs with getItemHref", () => {
    render(
      <MenuList items={MENU} getItemHref={(item) => `#dish-${item.id}`} linkAs={RouterLink} />
    );
    const link = screen
      .getAllByRole("link")
      .find((candidate) => candidate.getAttribute("href") === "#dish-chilli-paneer");
    expect(link).toHaveAttribute("data-router-link");
  });

  it("shows the empty state for a category with no dishes", async () => {
    const user = userEvent.setup();
    render(
      <MenuList
        items={MENU}
        categories={["Small Plates", "Thalis"]}
        emptyState={<p>Nothing matches that yet.</p>}
      />
    );
    await user.click(option("Thalis"));
    expect(screen.getByText("Nothing matches that yet.")).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });

  it("merges a caller className", () => {
    const { container } = render(<MenuList items={MENU} className="bg-surface-page-alt" />);
    expect(container.firstElementChild).toHaveClass("section-y", "bg-surface-page-alt");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <MenuList
        items={MENU}
        overline="The Menu"
        title="Most ordered this week"
        note="100% Vegetarian"
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- menu-list 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./menu-list`.

- [ ] **Step 3: Implement the filter leaf**

`packages/ui/src/organisms/menu-list/menu-list-filter.tsx`:

```tsx
"use client";

import { type ReactNode, useState } from "react";

import { FilterBar, type FilterOption } from "../../molecules/filter-bar/filter-bar";

export interface MenuListPanel {
  value: string;
  /** The dishes for this option, rendered by the server organism. */
  content: ReactNode;
}

export interface MenuListFilterProps {
  label: string;
  options: FilterOption[];
  /** The option chosen on arrival; one of `options`. */
  defaultValue: string;
  panels: MenuListPanel[];
  note?: ReactNode;
  className?: string | undefined;
}

/**
 * MenuList's client corner: it holds the chosen option and shows that option's pre-rendered
 * panel. (FilterBar already ignores Radix's `""` when the chosen option is pressed again.)
 */
export function MenuListFilter({
  label,
  options,
  defaultValue,
  panels,
  note,
  className,
}: MenuListFilterProps) {
  const [value, setValue] = useState(defaultValue);
  const panel = panels.find((candidate) => candidate.value === value);
  return (
    <div className={className}>
      <FilterBar
        label={label}
        options={options}
        value={value}
        onValueChange={setValue}
        isWrapping
        note={note}
      />
      {panel?.content}
    </div>
  );
}
```

- [ ] **Step 4: Implement the organism**

`packages/ui/src/organisms/menu-list/menu-list.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import type { HeadingLevel } from "../../lib/heading";
import type { LinkAs } from "../../lib/link-as";

import { Divider } from "../../atoms/divider/divider";
import { componentVariants } from "../../lib/component-variants";
import { MenuItemCard } from "../../molecules/menu-item-card/menu-item-card";
import { type MenuItemImage, MenuItemRow } from "../../molecules/menu-item-row/menu-item-row";
import { SectionHeader } from "../../molecules/section-header/section-header";
import { MenuListFilter } from "./menu-list-filter";

export interface MenuListItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string | undefined;
  spice?: 1 | 2 | 3 | 4 | undefined;
  badge?: string | undefined;
  was?: number | undefined;
  image?: MenuItemImage | undefined;
  /** Placeholder label while the photo is missing. */
  imageLabel?: string | undefined;
}

/** How many dishes show as cards before the grid variant hands over to rows (design system). */
const DEFAULT_GRID_COUNT = 4;

/** Dish headings sit one level below the section title. */
const CHILD_LEVEL: Readonly<Record<HeadingLevel, HeadingLevel>> = {
  1: 2,
  2: 3,
  3: 4,
  4: 5,
  5: 6,
  6: 6,
};

const menuList = componentVariants({
  slots: {
    root: "section-y",
    inner: "container-page",
    filter: "flex flex-col",
    cards: "mt-8 autogrid",
    card: "flex",
    cardBody: "flex-1",
    overflow: "",
    rows: "",
    empty: "mt-6",
  },
  variants: {
    variant: {
      grid: { overflow: "mt-12", rows: "mt-2" },
      list: { overflow: "mt-5" },
    },
    hasHeader: { true: { filter: "mt-7" } },
  },
  defaultVariants: { variant: "grid", hasHeader: true },
});

/** A dish's display props — the list's own fields (id, category) stay out of the card's DOM. */
function dishOf({ id: _id, category: _category, ...dish }: MenuListItem) {
  return dish;
}

export interface MenuListProps extends Omit<ComponentProps<"section">, "title"> {
  items: MenuListItem[];
  /** Filter order and subset; defaults to every category in the dishes, in order. "All" is always first. */
  categories?: string[] | undefined;
  allLabel?: string | undefined;
  /** The category chosen on arrival; "All" when omitted or not on offer. */
  defaultCategory?: string | undefined;
  /** Accessible name of the filter group. */
  filterLabel?: string | undefined;
  overline?: ReactNode;
  /** Omit (or pass null) for filters with no section header — the app pattern. */
  title?: ReactNode | null | undefined;
  /** One sentence under the heading (shown only with a `title`). */
  lede?: ReactNode;
  action?: ReactNode;
  /** `grid` = cards then an overflow list (website) · `list` = rows only (app). */
  variant?: "grid" | "list" | undefined;
  /** How many dishes show as cards before rows take over. */
  gridCount?: number | undefined;
  /** Statement badge in the filter bar, e.g. "100% Vegetarian". */
  note?: ReactNode;
  /** Divider label above the overflow rows, e.g. "Also on the menu". */
  overflowLabel?: string | undefined;
  /** Shown for a category with no dishes. */
  emptyState?: ReactNode;
  /** Runs on the server with the organism: the dish's add/order control. */
  renderItemAction?: ((item: MenuListItem) => ReactNode) | undefined;
  /** Runs on the server with the organism: makes each card a link. */
  getItemHref?: ((item: MenuListItem) => string) | undefined;
  linkAs?: LinkAs | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/**
 * The filterable menu section — use it rather than assembling cards by hand. Every dish is
 * rendered on the server, once per filter option; only the chosen option is client state.
 */
export function MenuList({
  items,
  categories,
  allLabel = "All",
  defaultCategory,
  filterLabel = "Filter the menu",
  overline,
  title,
  lede,
  action,
  variant = "grid",
  gridCount = DEFAULT_GRID_COUNT,
  note,
  overflowLabel,
  emptyState,
  renderItemAction,
  getItemHref,
  linkAs = "a",
  headingLevel = 2,
  className,
  ...props
}: MenuListProps) {
  const hasHeader = title !== undefined && title !== null;
  const slots = menuList({ variant, hasHeader });
  const itemLevel = CHILD_LEVEL[headingLevel];
  const categoryNames = (categories ?? [...new Set(items.map((item) => item.category))]).filter(
    (name) => name !== allLabel
  );
  const options = [allLabel, ...categoryNames].map((name) => ({ value: name, label: name }));
  const initial =
    defaultCategory !== undefined && categoryNames.includes(defaultCategory)
      ? defaultCategory
      : allLabel;

  const panelFor = (dishes: MenuListItem[]): ReactNode => {
    if (dishes.length === 0) {
      return emptyState ? <div className={slots.empty()}>{emptyState}</div> : null;
    }
    const cardDishes = variant === "grid" ? dishes.slice(0, gridCount) : [];
    const rowDishes = variant === "grid" ? dishes.slice(gridCount) : dishes;
    return (
      <>
        {cardDishes.length > 0 ? (
          <ul className={slots.cards()}>
            {cardDishes.map((item) => (
              <li key={item.id} className={slots.card()}>
                <MenuItemCard
                  {...dishOf(item)}
                  action={renderItemAction?.(item)}
                  href={getItemHref?.(item)}
                  linkAs={linkAs}
                  headingLevel={itemLevel}
                  className={slots.cardBody()}
                />
              </li>
            ))}
          </ul>
        ) : null}
        {rowDishes.length > 0 ? (
          <div className={slots.overflow()}>
            {variant === "grid" ? <Divider label={overflowLabel} /> : null}
            <ul className={slots.rows()}>
              {rowDishes.map((item, index) => (
                <li key={item.id}>
                  <MenuItemRow
                    {...dishOf(item)}
                    action={renderItemAction?.(item)}
                    hasDivider={index < rowDishes.length - 1}
                    headingLevel={itemLevel}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </>
    );
  };

  const panels = options.map(({ value }) => ({
    value,
    content: panelFor(value === allLabel ? items : items.filter((item) => item.category === value)),
  }));

  return (
    <section className={slots.root({ className })} {...props}>
      <div className={slots.inner()}>
        {hasHeader ? (
          <SectionHeader
            overline={overline}
            title={title}
            lede={lede}
            action={action}
            headingLevel={headingLevel}
          />
        ) : null}
        <MenuListFilter
          label={filterLabel}
          options={options}
          panels={panels}
          defaultValue={initial}
          note={note}
          className={slots.filter()}
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- menu-list 2>&1 | tail -8`
Expected: PASS (18 tests). If the keyboard test fails because FilterBar's roving focus starts elsewhere, read `molecules/filter-bar/filter-bar.tsx` and adjust only the key sequence — the assertion (arrowing to the next option and pressing Space selects it) stays.

- [ ] **Step 6: Stories (card parity with `MenuList.card.html`)**

`packages/ui/src/organisms/menu-list/menu-list.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowRight, Plus } from "lucide-react";
import { expect } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { IconButton } from "../../atoms/icon-button/icon-button";
import { EmptyState } from "../../molecules/empty-state/empty-state";
import { VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { MenuList, type MenuListItem } from "./menu-list";

/** The design system card's dishes. */
const MENU: MenuListItem[] = [
  {
    id: "chilli-paneer",
    name: "Paprikaa Chilli Paneer",
    price: 280,
    spice: 3,
    category: "Small Plates",
    badge: "Bestseller",
    description: "Amritsari paneer, burnt chilli mayo, potato brioche.",
    imageLabel: "Dish photo",
  },
  {
    id: "keema-pav",
    name: "Mushroom Keema Pav",
    price: 340,
    was: 380,
    spice: 2,
    category: "Small Plates",
    description: "Slow-cooked mushroom keema, buttered pav, pickled onion.",
    imageLabel: "Dish photo",
  },
  {
    id: "cold-brew",
    name: "Masala Cold Brew",
    price: 220,
    spice: 1,
    category: "Chai & Coffee",
    badge: "New",
    description: "Cold brew, jaggery, cardamom.",
    imageLabel: "Dish photo",
  },
  {
    id: "kulhad-chai",
    name: "Kulhad Chai",
    price: 90,
    spice: 1,
    category: "Chai & Coffee",
    description: "Assam leaf, ginger, clay cup.",
    imageLabel: "Dish photo",
  },
  {
    id: "toastie",
    name: "Bombay Toastie",
    price: 240,
    spice: 2,
    category: "All Day",
    description: "Green chutney, potato, coal-grilled.",
    imageLabel: "Dish photo",
  },
  {
    id: "kulfi",
    name: "Gulkand Kulfi",
    price: 180,
    spice: 1,
    category: "Sweets",
    description: "Rose petal preserve, pistachio, saffron.",
    imageLabel: "Dish photo",
  },
];

const addAction = (item: MenuListItem) => (
  <IconButton icon={Plus} label={`Add ${item.name}`} variant="primary" size="sm" />
);

const meta = {
  title: "Organisms/MenuList",
  component: MenuList,
  args: {
    items: MENU,
    overline: "The Menu",
    title: "Most ordered this week",
    note: "100% Vegetarian",
    overflowLabel: "Also on the menu",
    gridCount: 4,
    renderItemAction: addAction,
    action: (
      <Button asChild variant="ghost" size="sm" iconAfter={ArrowRight}>
        <a href="#menu">See Full Menu</a>
      </Button>
    ),
    emptyState: (
      <EmptyState variant="symbol" title="Nothing matches that yet." body="Try another category." />
    ),
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          'The whole menu section, filters included — use this rather than assembling cards by hand. `variant="grid"` is the website (cards, then an overflow list); `variant="list"` is the app (rows only). Filters derive from each dish\'s category; "All" is always first. Every dish is server-rendered; only the chosen category is client state.',
      },
    },
  },
} satisfies Meta<typeof MenuList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row: `variant="grid"` (website). */
export const GridWebsite: Story = {};

/** Card row: `variant="list"` (app), no section header. */
export const ListApp: Story = { args: { variant: "list", title: null } };

/** Every dish in the grid: the overflow list and its divider disappear. */
export const GridOnly: Story = { args: { gridCount: 6 } };

/** Two cards and a long overflow list — the shape a big menu takes. */
export const SmallGrid: Story = { args: { gridCount: 2 } };

/** Filter by pointer: Chai & Coffee shows its two dishes. */
export const FilterByCategory: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Chai & Coffee" }));
    await expect(canvas.getAllByRole("article")).toHaveLength(2);
    await expect(canvas.getByRole("radio", { name: "Chai & Coffee" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
  },
};

/** A page linked from "Chai & Coffee" opens on that category. */
export const PreselectedCategory: Story = {
  args: { defaultCategory: "Chai & Coffee" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("radio", { name: "Chai & Coffee" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    await expect(canvas.getAllByRole("article")).toHaveLength(2);
  },
};

export const WithLede: Story = { args: { lede: "Cooked to order in one pure-veg kitchen." } };

/** A category with no dishes shows the empty state. */
export const EmptyCategory: Story = {
  args: { categories: ["Small Plates", "Thalis"] },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Thalis" }));
    await expect(canvas.getByText("Nothing matches that yet.")).toBeVisible();
  },
};

export const Mobile: Story = { globals: VIEWPORT_360 };
export const Tablet: Story = { globals: VIEWPORT_768 };
export const Desktop: Story = { globals: VIEWPORT_1280 };
```

- [ ] **Step 7: Export**

```ts
export { MenuList, type MenuListItem, type MenuListProps } from "./organisms/menu-list/menu-list";
```

- [ ] **Step 8: Format, gate, commit**

```bash
pnpm exec prettier --write packages/ui/src/organisms/menu-list packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
git add packages/ui/src/organisms/menu-list packages/ui/src/index.ts
git commit -m "feat(ui): add the MenuList organism

The filterable menu section: a section header, a FilterBar with All plus
each category, and per-category panels of cards and overflow rows (grid) or
rows only (list). Dishes, their actions and links render on the server; a
tiny client leaf holds only the chosen category.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 15: CartPanel

**Dev reference:** `git show dev:packages/ui/src/organisms/cart-panel/cart-panel.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                               | Ruling  | Where / clause                                                                                                                                    |
| -------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| A Radix side sheet: `trigger`, open state, Escape, close glyph, `position="container"` | DROP    | D1 + spec §9.3 / contract §7 — the design system's CartPanel is a panel; an app that wants a sheet wraps it in `Dialog variant="sheet"` (Task 11) |
| Every line with its dish and options                                                   | ALREADY | test "lists every line with its name, note, unit price and the veg mark"                                                                          |
| Each line priced at its quantity (₹560 for 2 × ₹280)                                   | DROP    | D2 — the design system's `CartPanel.jsx` prints the unit price (`PriceTag amount={l.price}`)                                                      |
| GST added to the subtotal, the total paid                                              | ALREADY | `cart-totals.spec.ts` + test "totals through PriceSummary…"                                                                                       |
| A different GST rate, shown                                                            | ALREADY | test "takes its GST rate and summary labels from props"                                                                                           |
| A quantity change for the right line; stepping to 0 removes it                         | ALREADY | test "reports a quantity change for the right line"                                                                                               |
| `onPlaceOrder` / `onBrowse`                                                            | DROP    | spec §8.1 — `placeAction` / `browseAction` slots                                                                                                  |
| Its own empty state instead of an empty list                                           | ALREADY | test "renders its own empty state…"                                                                                                               |
| No pay bar on the empty cart                                                           | ADD     | the empty-state test passes a `placeAction` and asserts it is absent                                                                              |
| The fulfilment line; dropped when blank                                                | ALREADY | `meta ? …`                                                                                                                                        |
| A long dish name and its options truncate, so the stepper keeps its place              | ADD     | `name`/`nameText`/`note` slots + test "keeps a long dish name and its options on one line…"                                                       |
| The pay bar never scrolls away                                                         | ALREADY | bar outside the scrolling body                                                                                                                    |
| Stepper buttons named per dish                                                         | ALREADY | QuantityStepper `label` (Plan 3a)                                                                                                                 |
| Built-in kitchen-note Input; fixed labels and copy                                     | DROP    | D9 — `noteField`, the label props, `note`                                                                                                         |
| `diet: "egg"`                                                                          | DROP    | C10                                                                                                                                               |
| Merges a caller `className`                                                            | ADD     | test "merges a caller className"                                                                                                                  |
| axe                                                                                    | ALREADY | test "has no accessibility violations"                                                                                                            |
| Stories Filled · Empty                                                                 | ALREADY | Filled · Empty                                                                                                                                    |
| Story Default (a trigger-opened sheet)                                                 | DROP    | not a dialog (row 1)                                                                                                                              |
| Stories OneLine · DineIn · Smallest                                                    | ADD     | `OneLine`, `DineIn`, `Mobile`                                                                                                                     |

Implementer: copy this table into your report, extended with anything the plan missed.

**Files:**

- Create: `packages/design-tokens/tokens/component/cart-panel.json`
- Create: `packages/ui/src/organisms/cart-panel/cart-totals.ts`, `cart-totals.spec.ts`, `cart-panel.tsx` (client), `cart-panel.test.tsx`, `cart-panel.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `Card`, `DietMark`, `Icon`, `PriceTag`, `Text`, `EmptyState`, `PriceSummary`, `QuantityStepper` (Plan 3a: a `group` named by `label`, then "Remove …" button, the count, "Add …" button), `componentVariants`, `headingTag`; stories: `Button`, `Input`, `formatRupees`.
- Produces: `CartPanel`, `CartPanelProps` (client); `cartTotals`, `CartTotals`, `CartLine` from the pure `cart-totals.ts` (not a client module, so server code can import it).

- [ ] **Step 1: Component token**

`packages/design-tokens/tokens/component/cart-panel.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "cart-panel-thumb": {
      "$value": "56px",
      "$description": "The dish tile beside each cart line (design system CartPanel).",
      "$extensions": { "pink-paprikaa": { "utility": ["size"] } }
    }
  }
}
```

Append to `SPACING`:

```ts
  "cart-panel-thumb",
```

- [ ] **Step 2: Write the failing tests**

`packages/ui/src/organisms/cart-panel/cart-totals.spec.ts`:

```ts
import { type CartLine, cartTotals } from "./cart-totals";

const line = (price: number, quantity: number): CartLine => ({
  id: `${String(price)}-${String(quantity)}`,
  name: "Dish",
  price,
  quantity,
});

describe("cartTotals", () => {
  it.each([
    { lines: [], rate: 0.05, expected: { subtotal: 0, tax: 0, total: 0 } },
    {
      lines: [line(280, 2), line(220, 1), line(180, 1)],
      rate: 0.05,
      expected: { subtotal: 960, tax: 48, total: 1008 },
    },
    {
      lines: [line(280, 2), line(220, 2), line(180, 1)],
      rate: 0.05,
      expected: { subtotal: 1180, tax: 59, total: 1239 },
    },
    { lines: [line(1010, 1)], rate: 0.05, expected: { subtotal: 1010, tax: 51, total: 1061 } },
    { lines: [line(999, 3)], rate: 0, expected: { subtotal: 2997, tax: 0, total: 2997 } },
  ])("totals $lines.length lines at $rate GST", ({ lines, rate, expected }) => {
    expect(cartTotals(lines, rate)).toEqual(expected);
  });
});
```

`packages/ui/src/organisms/cart-panel/cart-panel.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { CartPanel } from "./cart-panel";
import type { CartLine } from "./cart-totals";

const LINES: CartLine[] = [
  {
    id: "chilli-paneer",
    name: "Paprikaa Chilli Paneer",
    price: 280,
    quantity: 2,
    note: "Sharing · Hot",
  },
  { id: "cold-brew", name: "Masala Cold Brew", price: 220, quantity: 1, note: "Regular" },
  { id: "kulfi", name: "Gulkand Kulfi", price: 180, quantity: 1 },
];

const lineItem = (name: string) => {
  const item = screen
    .getAllByRole("listitem")
    .find((candidate) => within(candidate).queryByText(name) !== null);
  if (item === undefined) throw new Error(`no cart line for ${name}`);
  return item;
};

describe("CartPanel", () => {
  it("is a region named by its title, with the fulfilment line under it", () => {
    render(<CartPanel lines={LINES} title="Your order" meta="Pickup · Sector 57 · 12 min" />);
    expect(screen.getByRole("region", { name: "Your order" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Your order" })).toBeInTheDocument();
    expect(screen.getByText("Pickup · Sector 57 · 12 min")).toBeInTheDocument();
  });

  it("lists every line with its name, note, unit price and the veg mark", () => {
    render(<CartPanel lines={LINES} title="Your order" />);
    const paneer = lineItem("Paprikaa Chilli Paneer");
    expect(within(paneer).getByText("Sharing · Hot")).toBeInTheDocument();
    expect(within(paneer).getByText("₹280")).toBeInTheDocument();
    expect(within(paneer).getByRole("img", { name: "Vegetarian" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("reports a quantity change for the right line", async () => {
    const user = userEvent.setup();
    const onQuantityChange = vi.fn();
    render(<CartPanel lines={LINES} onQuantityChange={onQuantityChange} />);
    const stepper = within(lineItem("Masala Cold Brew")).getByRole("group", {
      name: "Masala Cold Brew",
    });
    const buttons = within(stepper).getAllByRole("button");
    await user.click(buttons[buttons.length - 1] ?? stepper);
    expect(onQuantityChange).toHaveBeenCalledWith("cold-brew", 2);
    await user.click(buttons[0] ?? stepper);
    expect(onQuantityChange).toHaveBeenLastCalledWith("cold-brew", 0);
  });

  it("totals through PriceSummary: subtotal, GST at the rate, total", () => {
    render(<CartPanel lines={LINES} note="Inclusive of all taxes." />);
    expect(screen.getByText("Subtotal")).toBeInTheDocument();
    expect(screen.getByText("₹960")).toBeInTheDocument();
    expect(screen.getByText("GST (5%)")).toBeInTheDocument();
    expect(screen.getByText("₹48")).toBeInTheDocument();
    expect(screen.getByText("₹1,008")).toBeInTheDocument();
    expect(screen.getByText("Inclusive of all taxes.")).toBeInTheDocument();
  });

  it("takes its GST rate and summary labels from props", () => {
    render(
      <CartPanel
        lines={LINES}
        gstRate={0.18}
        subtotalLabel="Items"
        taxLabel="Tax"
        totalLabel="To pay"
      />
    );
    expect(screen.getByText("Items")).toBeInTheDocument();
    expect(screen.getByText("Tax (18%)")).toBeInTheDocument();
    expect(screen.getByText("To pay")).toBeInTheDocument();
  });

  it("renders the note field and the place action", () => {
    render(
      <CartPanel
        lines={LINES}
        noteField={<input aria-label="Notes for the kitchen" />}
        placeAction={<button type="button">Pay ₹1,008</button>}
      />
    );
    expect(screen.getByRole("textbox", { name: "Notes for the kitchen" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pay ₹1,008" })).toBeInTheDocument();
  });

  it("renders its own empty state with the given copy and the browse action — and no pay bar", () => {
    render(
      <CartPanel
        lines={[]}
        title="Your order"
        emptyTitle="Nothing here yet."
        emptyBody="Let's fix that."
        browseAction={<a href="#menu">Browse the Menu</a>}
        placeAction={<button type="button">Pay ₹0</button>}
      />
    );
    expect(screen.getByRole("heading", { name: "Nothing here yet." })).toBeInTheDocument();
    expect(screen.getByText("Let's fix that.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse the Menu" })).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Pay/ })).not.toBeInTheDocument();
  });

  it("keeps a long dish name and its options on one line each, so the stepper keeps its place", () => {
    render(<CartPanel lines={LINES} />);
    expect(screen.getByText("Paprikaa Chilli Paneer")).toHaveClass("truncate");
    expect(screen.getByText("Sharing · Hot")).toHaveClass("truncate");
  });

  it("merges a caller className", () => {
    const { container } = render(<CartPanel lines={LINES} className="bg-surface-page" />);
    expect(container.firstElementChild).toHaveClass("flex", "bg-surface-page");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <CartPanel
        lines={LINES}
        title="Your order"
        meta="Pickup · Sector 57"
        placeAction={<button type="button">Pay ₹1,008</button>}
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run them to verify they fail**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- cart- 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./cart-totals` and `./cart-panel`.

- [ ] **Step 4: Implement the totals**

`packages/ui/src/organisms/cart-panel/cart-totals.ts`:

```ts
export interface CartLine {
  id: string;
  name: string;
  /** Unit price in whole rupees. */
  price: number;
  quantity: number;
  /** Chosen options, e.g. "Sharing · Extra Hot". */
  note?: string | undefined;
}

export interface CartTotals {
  subtotal: number;
  tax: number;
  total: number;
}

/**
 * The cart's money: subtotal, GST rounded to the rupee, and the total. CartPanel renders these
 * numbers; the app calls the same function to label its pay button, so the two never disagree.
 * Pure and outside the client module, so server code can import it too.
 */
export function cartTotals(lines: readonly CartLine[], gstRate: number): CartTotals {
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const tax = Math.round(subtotal * gstRate);
  return { subtotal, tax, total: subtotal + tax };
}
```

- [ ] **Step 5: Implement the panel**

`packages/ui/src/organisms/cart-panel/cart-panel.tsx`:

```tsx
"use client";

import { MapPin } from "lucide-react";
import { type ComponentProps, type ReactNode, useId } from "react";

import { Card } from "../../atoms/card/card";
import { DietMark } from "../../atoms/diet-mark/diet-mark";
import { Icon } from "../../atoms/icon/icon";
import { PriceTag } from "../../atoms/price-tag/price-tag";
import { Text } from "../../atoms/text/text";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { EmptyState } from "../../molecules/empty-state/empty-state";
import { PriceSummary } from "../../molecules/price-summary/price-summary";
import { QuantityStepper } from "../../molecules/quantity-stepper/quantity-stepper";
import { type CartLine, cartTotals } from "./cart-totals";

/** Restaurant service GST (brand.js billing.gstRate). */
const DEFAULT_GST_RATE = 0.05;
const PERCENT = new Intl.NumberFormat("en-IN", { style: "percent", maximumFractionDigits: 2 });

const cartPanel = componentVariants({
  slots: {
    root: "flex min-h-0 flex-1 flex-col",
    header: "px-5 pt-1 pb-3",
    meta: "mt-1.5 flex items-center gap-2 text-text-muted",
    body: "min-h-0 flex-1 overflow-y-auto px-5",
    line: "flex items-center gap-3.5 border-b border-border-subtle py-4",
    thumb: "size-cart-panel-thumb shrink-0 rounded-md bg-surface-brand-soft",
    info: "flex min-w-0 flex-1 flex-col",
    // A long dish name or option line truncates rather than pushing the stepper off the line.
    name: "flex min-w-0 items-center gap-2",
    nameText: "min-w-0 truncate font-display",
    note: "mt-0.5 truncate",
    price: "mt-1.5",
    noteField: "mt-4.5",
    summary: "pt-4.5 pb-5",
    bar: "border-t border-border-subtle bg-surface-card px-5 pt-3 pb-3.5",
    empty: "grid flex-1 place-items-center p-8",
  },
});

export interface CartPanelProps extends Omit<ComponentProps<"section">, "title"> {
  lines: CartLine[];
  title?: ReactNode;
  /** The fulfilment line under the title, e.g. "Pickup · Sector 57 · 12 min". */
  meta?: ReactNode;
  gstRate?: number | undefined;
  /** Quantity 0 means remove the line — the app owns the cart state. */
  onQuantityChange?: ((id: string, quantity: number) => void) | undefined;
  /** The pay button — label it with `cartTotals(lines, gstRate).total`. */
  placeAction?: ReactNode;
  /** The empty state's action, e.g. "Browse the Menu". */
  browseAction?: ReactNode;
  /** The empty state's title, e.g. "Nothing here yet." */
  emptyTitle?: ReactNode;
  emptyBody?: ReactNode;
  /** A kitchen-notes field (an Input), set on a quiet card above the totals. */
  noteField?: ReactNode;
  subtotalLabel?: string | undefined;
  taxLabel?: string | undefined;
  totalLabel?: string | undefined;
  /** Under the total, e.g. "Inclusive of all taxes." */
  note?: ReactNode;
  headingLevel?: HeadingLevel | undefined;
}

/**
 * The cart, whole: lines with quantity steppers, an optional kitchen note, totals through
 * PriceSummary (so money formatting stays correct) and a pay bar. Renders its own empty state.
 */
export function CartPanel({
  lines,
  title,
  meta,
  gstRate = DEFAULT_GST_RATE,
  onQuantityChange,
  placeAction,
  browseAction,
  emptyTitle,
  emptyBody,
  noteField,
  subtotalLabel = "Subtotal",
  taxLabel = "GST",
  totalLabel = "Total",
  note,
  headingLevel = 2,
  className,
  ...props
}: CartPanelProps) {
  const titleId = useId();
  const slots = cartPanel();

  if (lines.length === 0) {
    return (
      <section className={slots.root({ className })} {...props}>
        <div className={slots.empty()}>
          {emptyTitle === undefined ? (
            browseAction
          ) : (
            <EmptyState
              variant="symbol"
              title={emptyTitle}
              body={emptyBody}
              action={browseAction}
              headingLevel={headingLevel}
            />
          )}
        </div>
      </section>
    );
  }

  const { subtotal, tax, total } = cartTotals(lines, gstRate);
  const hasTitle = title !== undefined && title !== null;
  return (
    <section
      aria-labelledby={hasTitle ? titleId : undefined}
      className={slots.root({ className })}
      {...props}
    >
      {hasTitle || meta ? (
        <div className={slots.header()}>
          {hasTitle ? (
            <Text as={headingTag(headingLevel)} id={titleId} variant="h3">
              {title}
            </Text>
          ) : null}
          {meta ? (
            <div className={slots.meta()}>
              <Icon icon={MapPin} size="sm" />
              <Text as="span" variant="body-sm" tone="muted">
                {meta}
              </Text>
            </div>
          ) : null}
        </div>
      ) : null}
      <div className={slots.body()}>
        <ul>
          {lines.map((line) => (
            <li key={line.id} className={slots.line()}>
              <span aria-hidden className={slots.thumb()} />
              <div className={slots.info()}>
                <span className={slots.name()}>
                  <DietMark size="sm" />
                  <Text as="span" variant="body-sm" weight="bold" className={slots.nameText()}>
                    {line.name}
                  </Text>
                </span>
                {line.note ? (
                  <Text as="span" variant="caption" tone="subtle" className={slots.note()}>
                    {line.note}
                  </Text>
                ) : null}
                <PriceTag amount={line.price} size="sm" className={slots.price()} />
              </div>
              <QuantityStepper
                label={line.name}
                value={line.quantity}
                min={0}
                size="sm"
                onValueChange={(quantity) => {
                  onQuantityChange?.(line.id, quantity);
                }}
              />
            </li>
          ))}
        </ul>
        {noteField ? (
          <Card variant="quiet" padding="sm" className={slots.noteField()}>
            {noteField}
          </Card>
        ) : null}
        <PriceSummary
          className={slots.summary()}
          lines={[
            { label: subtotalLabel, amount: subtotal },
            { label: `${taxLabel} (${PERCENT.format(gstRate)})`, amount: tax },
          ]}
          total={total}
          totalLabel={totalLabel}
          note={note}
        />
      </div>
      {placeAction ? <div className={slots.bar()}>{placeAction}</div> : null}
    </section>
  );
}
```

- [ ] **Step 6: Run them to verify they pass**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- cart- 2>&1 | tail -8`
Expected: PASS (5 + 10 tests).

- [ ] **Step 7: Stories (card parity with `CartPanel.card.html`)**

`packages/ui/src/organisms/cart-panel/cart-panel.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { formatRupees } from "@pink-paprikaa-web/utils";
import { ArrowRight, Pencil } from "lucide-react";
import { useState } from "react";
import { expect, within } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { Input } from "../../atoms/input/input";
import { VIEWPORT_360 } from "../story-fixtures";
import { CartPanel } from "./cart-panel";
import { type CartLine, cartTotals } from "./cart-totals";

const GST_RATE = 0.05;

/** The design system card's cart. */
const LINES: CartLine[] = [
  {
    id: "chilli-paneer",
    name: "Paprikaa Chilli Paneer",
    price: 280,
    quantity: 2,
    note: "Sharing · Hot",
  },
  { id: "cold-brew", name: "Masala Cold Brew", price: 220, quantity: 1, note: "Regular" },
  { id: "kulfi", name: "Gulkand Kulfi", price: 180, quantity: 1, note: "Regular" },
];

const FRAME = "flex h-165 flex-col overflow-hidden rounded-lg border border-border-subtle";

const BROWSE = <Button>Browse the Menu</Button>;

/** A working cart: quantity 0 removes the line; the pay button uses the same totals. */
function WorkingCart() {
  const [lines, setLines] = useState(LINES);
  const { total } = cartTotals(lines, GST_RATE);
  return (
    <div className={`${FRAME} w-90`}>
      <CartPanel
        lines={lines}
        title="Your order"
        meta="Pickup · Sector 57 · 12 min"
        gstRate={GST_RATE}
        onQuantityChange={(id, quantity) => {
          setLines((current) =>
            quantity <= 0
              ? current.filter((line) => line.id !== id)
              : current.map((line) => (line.id === id ? { ...line, quantity } : line))
          );
        }}
        noteField={
          <Input
            aria-label="Notes for the kitchen"
            placeholder="Any notes for the kitchen?"
            icon={Pencil}
          />
        }
        note="Inclusive of all taxes."
        placeAction={
          <Button isFullWidth size="lg" iconAfter={ArrowRight}>
            {`Pay ${formatRupees(total)}`}
          </Button>
        }
        emptyTitle="Nothing here yet."
        emptyBody="Let's fix that."
        browseAction={BROWSE}
      />
    </div>
  );
}

const meta = {
  title: "Organisms/CartPanel",
  component: CartPanel,
  args: { lines: LINES, title: "Your order", meta: "Pickup · Sector 57 · 12 min" },
  parameters: {
    docs: {
      description: {
        component:
          "The cart, whole. Renders its own empty state. Quantity down to 0 removes the line (the app owns the state and gets `onQuantityChange`). Totals go through PriceSummary so money formatting stays correct; label the pay button with `cartTotals(lines, gstRate).total` so it always matches.",
      },
    },
  },
} satisfies Meta<typeof CartPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div className={`${FRAME} w-90`}>
      <CartPanel {...args} />
    </div>
  ),
};

/** Card row: the filled cart — change a quantity, the total follows. */
export const Filled: Story = {
  render: () => <WorkingCart />,
  play: async ({ canvas, userEvent }) => {
    const stepper = canvas.getByRole("group", { name: "Masala Cold Brew" });
    const buttons = within(stepper).getAllByRole("button");
    const add = buttons[buttons.length - 1];
    if (add === undefined) throw new Error("the stepper has no add button");
    await userEvent.click(add);
    await expect(canvas.getByRole("button", { name: "Pay ₹1,239" })).toBeInTheDocument();
  },
};

/** Card row: the empty state. */
export const Empty: Story = {
  args: {
    lines: [],
    emptyTitle: "Nothing here yet.",
    emptyBody: "Let's fix that.",
    browseAction: BROWSE,
  },
  render: (args) => (
    <div className={`${FRAME} w-75`}>
      <CartPanel {...args} />
    </div>
  ),
};

/** A single line, so the summary and the pay bar read against a short list. */
export const OneLine: Story = {
  args: { lines: LINES.slice(0, 1) },
  render: (args) => (
    <div className={`${FRAME} w-90`}>
      <CartPanel {...args} />
    </div>
  ),
};

/** Dine-in swaps the fulfilment line; everything else is the same panel. */
export const DineIn: Story = {
  args: { meta: "Dine-in · Table 4 · Sector 57" },
  render: (args) => (
    <div className={`${FRAME} w-90`}>
      <CartPanel {...args} />
    </div>
  ),
};

/** The smallest supported viewport: the panel runs full width and nothing truncates badly. */
export const Mobile: Story = {
  globals: VIEWPORT_360,
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <div className="flex h-165 flex-col">
      <CartPanel {...args} />
    </div>
  ),
};
```

- [ ] **Step 8: Export**

```ts
export { CartPanel, type CartPanelProps } from "./organisms/cart-panel/cart-panel";
export { type CartLine, cartTotals, type CartTotals } from "./organisms/cart-panel/cart-totals";
```

- [ ] **Step 9: Format, gate, commit**

```bash
pnpm exec prettier --write packages/ui/src/organisms/cart-panel packages/design-tokens/tokens/component/cart-panel.json packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
git add packages/design-tokens/tokens/component/cart-panel.json packages/ui/src/organisms/cart-panel packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): add the CartPanel organism

The whole cart as a client component: lines with the veg mark, note, unit
price and a quantity stepper that reports changes up, an optional kitchen
note, totals through PriceSummary and a pay bar, and its own symbol empty
state with the app's copy. The money maths is a pure cartTotals export the
app reuses to label the pay button.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 16: Replace the layout-story stand-ins, then the tier parity review

**Files:**

- Modify: `packages/ui/src/layouts/app-shell/app-shell.stories.tsx`, `packages/ui/src/layouts/post-frame/post-frame.stories.tsx`, and any other file `grep` finds in Step 1
- Modify (only for fixes found in review): the organism files of Tasks 1–15
- Read: `zip-files/Pink Paprikaa Design System/components/organisms/*.card.html`, `zip-files/pink-paprikaa-handoff/design/{PPHeader,PPFooter,GoogleReviews,FaqBlock,PlanCalculator,DawatCalculator,OfficeLunch,Home,Catering}.dc.html`

**Interfaces:**

- Consumes: every organism of this plan; FilterBar, MenuItemRow, LoyaltyCard, LogoLockup, OfferSeal (Plan 3b); AppShell (forwards `ref` to the frame) and PostFrame (Plan 2c).
- Produces: layout stories built from the real components; a parity record (fixed or listed with reasons) in the commit body.

- [ ] **Step 1: Find every stand-in Plan 2c left for this plan**

Run: `rtk proxy grep -rn "Stand-in\|stand-in\|stand-ins" packages/ui/src/layouts`
Expected: the AppShell stand-ins (`DemoTabBar`, `DemoMenuScreen`, `DemoSheet`, and the docs sentence naming them) and the PostFrame boards' `Logo` lockups in place of LogoLockup and the missing OfferSeal. Any further hit (a Stack or Cluster demo) is replaced by the real component the same way, using the mapping: tab bar → `TabBar`, sheet → `Dialog variant="sheet"` with `portalContainer`, category chips → `FilterBar`, dish cards → `MenuItemRow`, loyalty → `LoyaltyCard`, lockup → `LogoLockup`, seal → `OfferSeal`.

- [ ] **Step 2: AppShell stories — real TabBar, menu screen and sheet**

In `packages/ui/src/layouts/app-shell/app-shell.stories.tsx`, delete `TABS`, `DemoTabBar`, `DemoMenuScreen` and `DemoSheet` (keep `DemoHomeScreen`, which is a pink-header screen built from atoms, not a stand-in), and add:

```tsx
import { House, Plus, ShoppingBag, User, Utensils } from "lucide-react";
import { useState } from "react";

import { IconButton } from "../../atoms/icon-button/icon-button";
import { FilterBar } from "../../molecules/filter-bar/filter-bar";
import { LoyaltyCard } from "../../molecules/loyalty-card/loyalty-card";
import { MenuItemRow } from "../../molecules/menu-item-row/menu-item-row";
import { Dialog } from "../../organisms/dialog/dialog";
import { TabBar, type TabBarItem } from "../../organisms/tab-bar/tab-bar";

const TABS: TabBarItem[] = [
  { value: "home", label: "Home", icon: House, href: "#home" },
  { value: "menu", label: "Menu", icon: Utensils, href: "#menu" },
  { value: "cart", label: "Cart", icon: ShoppingBag, href: "#cart", count: 2 },
  { value: "you", label: "You", icon: User, href: "#you" },
];

const CATEGORIES = ["All", "Small Plates", "All Day", "Sweets"].map((label) => ({
  value: label,
  label,
}));

function AppTabBar({ current }: { current: string }) {
  return <TabBar items={TABS} value={current} />;
}

/** The app's menu screen, as on the card: filters, the loyalty card, dish rows. */
function MenuScreen() {
  return (
    <Stack space={4} className="px-5 pt-2 pb-5">
      <Text as="h1" variant="h3">
        Menu
      </Text>
      <FilterBar label="Menu category" options={CATEGORIES} />
      <LoyaltyCard visits={6} goal={10} reward="chai" />
      <div>
        <MenuItemRow
          name="Paprikaa Chilli Paneer"
          description="Amritsari paneer, burnt chilli mayo."
          price={280}
          spice={3}
          hasDivider
          headingLevel={2}
          action={
            <IconButton
              icon={Plus}
              label="Add Paprikaa Chilli Paneer"
              variant="primary"
              size="sm"
            />
          }
        />
        <MenuItemRow
          name="Masala Cold Brew"
          description="Cold brew, jaggery, cardamom."
          price={220}
          spice={1}
          headingLevel={2}
          action={
            <IconButton icon={Plus} label="Add Masala Cold Brew" variant="primary" size="sm" />
          }
        />
      </div>
    </Stack>
  );
}

/** The card's "with overlay sheet" frame: the real Dialog sheet, portalled into the phone. */
function SheetInFrame() {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <AppShell ref={setFrame} statusTone="ink" tabBar={<AppTabBar current="menu" />}>
      <MenuScreen />
      {frame === null ? null : (
        <Dialog
          defaultOpen
          variant="sheet"
          title="Remove this item?"
          portalContainer={frame}
          footer={
            <>
              <Button variant="ghost" size="sm">
                Keep It
              </Button>
              <Button size="sm">Remove</Button>
            </>
          }
        >
          Chilli Paneer will come off your order.
        </Dialog>
      )}
    </AppShell>
  );
}
```

Then point the stories at them: `meta.args` → `tabBar: <AppTabBar current="menu" />, children: <MenuScreen />`; `WithOverlaySheet` → `{ name: "with overlay sheet", render: () => <SheetInFrame />, parameters: { a11y: { config: { rules: [{ id: "aria-hidden-focus", enabled: false }] } } } }` (Radix hides the rest of the frame while it traps focus in the sheet — Task 11); in `StatusTones` use `<AppTabBar current="menu" />` and `<AppTabBar current="home" />` with `<MenuScreen />`. In the docs description, replace the sentence "The tab bar, menu screen and sheet here are temporary stand-ins; Plan 4's final task replaces them with TabBar, Dialog and the Plan 3b molecules." with "The tab bar is TabBar, the sheet is Dialog (`variant=\"sheet\"`, portalled into the frame), the screen uses FilterBar, LoyaltyCard and MenuItemRow." Merge the new imports into the file's import block and drop any that became unused (`Card`, `Tag`, `Icon`).

- [ ] **Step 3: PostFrame stories — LogoLockup and the OfferSeal**

In `packages/ui/src/layouts/post-frame/post-frame.stories.tsx`:

- add `import { LogoLockup } from "../../molecules/logo-lockup/logo-lockup";` and `import { OfferSeal } from "../../molecules/offer-seal/offer-seal";`;
- in `OfferBoard`, replace `<Logo tone="white" className="w-65" />` with `<LogoLockup tone="white" size="lg" />` and add, as the last child of the `relative` board div, `<OfferSeal value="50%" label="Off" size="lg" tone="light" corner="top-right" bleed="none" />` (the card's "50% OfferSeal"; `lg` is the 260px seal for 1080 canvases);
- in `StatementBoard`, replace `<Logo tone="white" className="w-60" />` with `<LogoLockup tone="white" size="md" />`;
- remove the `Logo` import if nothing else uses it, and delete the docs/comment lines saying the boards sign with the `Logo` lockup and omit the seal.

- [ ] **Step 4: Gate the layout stories**

```bash
pnpm exec prettier --write packages/ui/src/layouts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build \
  && pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache 2>&1 | tail -12
rtk proxy grep -rn "Stand-in\|stand-in" packages/ui/src/layouts
```

Expected: green; the grep prints nothing.

- [ ] **Step 5: Serve the sources and Storybook side by side**

Run each in the background (Bash `run_in_background`), from the repo root:

```bash
pnpm nx run @pink-paprikaa-web/storybook:build && python3 -m http.server 6006 --directory apps/storybook/storybook-static
python3 -m http.server 4100 --directory "zip-files/Pink Paprikaa Design System"
python3 -m http.server 4200 --directory zip-files/pink-paprikaa-handoff/design
```

(The design-system cards load React from unpkg, so the browser needs network access; the handoff pages load their bundle from `design/_ds/`.)

- [ ] **Step 6: Screenshot every pair at 360 and 1280**

With the Chrome DevTools MCP (`new_page`, `resize_page`, `navigate_page`, `take_screenshot`), or Playwright, capture each source and each story at 360×900 and 1280×900 into `/tmp/pp-parity/<organism>-<width>-{source,story}.png` (not committed). A story URL is `http://localhost:6006/iframe.html?id=<story-id>&viewMode=story` (the viewport is the window size here; the `globals` of the viewport stories do not apply to a bare iframe).

| Organism             | Source                                                                                                           | Story ids (`organisms-<name>--<story>`)                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| SiteHeader           | `:4100/components/organisms/SiteHeader.card.html` · `:4200/PPHeader.dc.html`                                     | `organisms-siteheader--rest`, `--scrolled-with-cart`, `--handoff-compact`                                            |
| SiteFooter           | `:4100/…/SiteFooter.card.html` · `:4200/PPFooter.dc.html`                                                        | `organisms-sitefooter--design-system-pink`, `--handoff-ink`                                                          |
| HeroBanner           | `:4100/…/HeroBanner.card.html` · `:4200/Home.dc.html`, `Catering.dc.html`, `OfficeLunch.dc.html` (first section) | `organisms-herobanner--brand-split`, `--soft-centred`, `--handoff-home`, `--handoff-catering`, `--handoff-office`    |
| MenuList             | `:4100/…/MenuList.card.html`                                                                                     | `organisms-menulist--grid-website`, `--list-app`                                                                     |
| CtaBand              | `:4100/…/CtaBand.card.html` · `:4200/Home.dc.html` (office strip), `Catering.dc.html` (taste first)              | `organisms-ctaband--ink-split`, `--brand-centred`, `--soft-split`, `--handoff-office-strip`, `--handoff-taste-first` |
| StatBand             | `:4100/…/StatBand.card.html`                                                                                     | `organisms-statband--soft`, `--brand`                                                                                |
| TestimonialWall      | `:4100/…/TestimonialWall.card.html`                                                                              | `organisms-testimonialwall--default`                                                                                 |
| FaqSection           | `:4100/…/FaqSection.card.html` · `:4200/FaqBlock.dc.html`                                                        | `organisms-faqsection--default`, `--handoff-with-aside`                                                              |
| TabBar               | `:4100/…/TabBar.card.html`                                                                                       | `organisms-tabbar--four-tabs-with-count`, `--five-tabs`                                                              |
| Dialog               | `:4100/…/Dialog.card.html`                                                                                       | `organisms-dialog--centred-modal`, `--sheet`                                                                         |
| CartPanel            | `:4100/…/CartPanel.card.html`                                                                                    | `organisms-cartpanel--filled`, `--empty`                                                                             |
| OrderTracker         | `:4100/…/OrderTracker.card.html`                                                                                 | `organisms-ordertracker--order-in`, `--ready`                                                                        |
| ReviewCarousel       | `:4200/GoogleReviews.dc.html`                                                                                    | `organisms-reviewcarousel--handoff-home`, `--empty`                                                                  |
| ActionDock           | `:4200/PPFooter.dc.html` (bottom bar / floating pill)                                                            | `organisms-actiondock--mobile`, `--desktop`                                                                          |
| QuotePanel           | `:4200/PlanCalculator.dc.html`, `DawatCalculator.dc.html`, `OfficeLunch.dc.html` (quote section)                 | `organisms-quotepanel--handoff-plan`, `--handoff-dawat`, `--handoff-office`                                          |
| AppShell · PostFrame | `:4100/components/layouts/AppShell.card.html`, `PostFrame.card.html`                                             | `layouts-appshell--with-tab-bar`, `--with-overlay-sheet`; `layouts-postframe--post`                                  |

Compare layout, spacing rhythm, type ramp, colours, radii, shadows and states. Expected, deliberate differences — list them, do not "fix" them: text colours re-pointed for AA (§5.3: pink-500 text → pink-600, ink-500 → ink-600, overlines on brand white instead of pink-300); copy replaced where the card's sample copy is untrue of the brand (StatBand's "6 outlets / 4.6 rating", FaqSection's egg answer, TestimonialWall's invented guests); the header's nav switching to the drawer below 1024px (the card drops links with no drawer); grid minimums snapped to the `autogrid` scale (§15.2); focus rings, skip link and dock clearance the sources lack; font rasterisation.

- [ ] **Step 7: Fix or list**

Fix every other difference in the owning organism (a token first if a value is missing) and rerun that task's test. Then run the cold gate:

```bash
pnpm nx format:check && pnpm nx sync:check \
  && pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build \
  && pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache 2>&1 | tail -15 \
  && pnpm guard:founder
```

Expected: every task green, story tests pass (a11y enforced, play functions run), guard clean.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/layouts packages/ui/src/organisms packages/design-tokens/tokens/component
git commit -m "test(ui): organism tier parity review and real layout-story components

AppShell and PostFrame stories now compose the real TabBar, Dialog sheet
(portalled into the frame), FilterBar, LoyaltyCard, MenuItemRow, LogoLockup
and OfferSeal in place of Plan 2c's stand-ins.

Parity against the design-system cards and handoff components at 360 and
1280. Fixed: <one line per fix>. Deliberate differences: <one line each,
with its reason>.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

If the review found fixes in organism code, use `fix(ui): …` as the type instead of `test(ui): …`.

## Controller amendments (2026-09-27)

- **SiteHeader drawer below `lg`** (nav from `lg`, three links `lg`–`xl`) — accepted; it matches the handoff PPHeader (`wide = w >= 1024`). Spec §9.3's "drawer below md" is corrected in Plan 5 Task 14.
- **Glass on scroll** (design system) — accepted.
- **Review fixture with the one-`a` misspelling** — elide the misspelled words with "[…]" exactly as Plan 5's `fixtures.ts` does (ruling R17), so every story and kit shows the same quote.
- **Plan 5 reconciliation** — Plan 5 Task 0 picks up this plan's deviations (CartPanel `emptyTitle`/`emptyBody`/`noteField`, OrderTracker `badge`/`codeLabel`/`paymentLabel`, MenuList labels, SiteHeader `compactActions`/`drawerLinks`/`portalContainer`, `pattern` enum) from the built code.
