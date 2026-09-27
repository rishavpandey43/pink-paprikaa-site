# Pink Paprikaa Design System — Production Rewrite

**Date:** 2026-09-27
**Status:** Draft — awaiting owner review
**Branch:** `feat/design-system` (off `dev`)
**Phase:** Architecture-spec Phase 1 ("design tokens populated + full component library"). This is
**step 1 of 2**: the design system, complete and live in Storybook. The web app (the handoff's 9
pages, `rates.ts`, calculators, SEO) is step 2 and gets its own spec once this one ships.
**Replaces:** everything under `packages/design-tokens/tokens/`, `packages/design-tokens/sd.config.mjs`,
`packages/ui/src/`, `packages/ui/AUTHORING.md` (the August port of an older design-system version).
**Amends:** architecture spec §8 (design system) and §15 (roadmap), handbook 02/03/04/06/09.

---

## 1. Outcome

A production-grade, token-driven React design system for Pink Paprikaa that reproduces the supplied
design system **completely and faithfully**, rewritten from scratch on this workspace's stack, and
viewable in Storybook with every foundation, every component in every variant/state, and the
reference UI-kit pages.

**Done means all of the following, with evidence:**

1. Every token in the design-system folder exists in `packages/design-tokens` (plus the handoff
   refinements in §3.2), emitted into Tailwind v4 and consumed by name — no literal values in
   components.
2. All **74 design-system components** plus the **16 handoff-derived components** (§9) exist in
   `packages/ui`, each with component + test (behaviour + axe) + stories covering every variant,
   size, tone and state shown on its design-system `.card.html`.
3. Storybook reproduces the design system's 13 tab groups (§10): foundations as docs pages, one
   story file per component, and the Website / App / Marketing reference kits as page stories.
4. Each component story is visually checked side-by-side against its design-system card (§11.4).
5. `pnpm verify:all` green cold, `nx format:check` + `nx sync:check` green, `storybook:build` and
   `storybook:test` green, contrast policy test green, founder guard green over the Storybook build.
6. Handbook, AUTHORING contract, decision log and architecture spec §15 updated in the same branch.

**Explicitly out of scope (step 2 — web app spec):** the 9 handoff routes, `rates.ts`, Plan/Dawat/
Office calculator logic, WhatsApp link builders, page-specific compositions (day-menu cards,
delivery-zone checker, help card), SEO/JSON-LD, `next/font` wiring in apps, image-pipeline wiring
into the web app, Lighthouse page budgets, Netlify. Storybook is **local + static build** only
(owner decision, 2026-09-27); public hosting waits for the Phase 6 cutover.

---

## 2. Sources of truth

| Rank | Source                                                                                        | Role                                                                                                                                                                                                           |
| ---- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `zip-files/Pink Paprikaa Design System/` (= `zip-files/pink-paprikaa-handoff/design-system/`) | **The design system.** `readme.md` (rules), `tokens/*.css`, `guidelines/*.card.html`, `components/**` (`.d.ts` contract, `.card.html` variants, `.prompt.md` usage), `assets/*.svg`, `brand.js`, `ui_kits/**`. |
| 2    | `zip-files/pink-paprikaa-handoff/design/` (`ds-base.js`, `*.dc.html`)                         | **What the product actually uses.** Refinements to the system (§3.2) and repeated patterns promoted into the system (§9.5). Newer than rank 1 where they overlap.                                              |
| 3    | This repo's handbook (`docs/engineering/`) + architecture spec                                | **How code is written** — patterns, naming, layering, gates.                                                                                                                                                   |

Facts verified 2026-09-27: the handoff's `design-system/` is **byte-identical** to the design-system
zip (components, tokens, styles, brand facts, readme; the zip additionally has
`tokens/brand.module.js`, an ESM twin of `brand.js`). The handoff's `design/_ds/` bundle, manifest
and adherence file are identical too. There is one design system, not two.

**Not a source:** `zip-files/Pink Paprikaa Design System/Pink Paprikaa Website.html` is a stale
early bundle (non-linear spacing scale, 72px header, no surfaces, placeholder outlets in Mumbai,
fake FSSAI number). It is ignored. `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json`,
`components/_story.*`, `uploads/`, `thumbnail.html`, `templates/**/support.js` are tooling of the
design tool, not design input.

**Reference code is reference only.** The zip's `.jsx` files are prototypes: inline style objects,
JS-state hover/press, `window.innerWidth` responsiveness (hydration-unsafe), icons fetched at runtime
from `unpkg.com`, `window.PP_BRAND` globals. Nothing is copied from them; each is re-implemented to
this spec. Their `.d.ts` files define the **props contract**, translated per §8.2.

**Superseded:** the August product spec (`2026-08-07-pink-paprikaa-site-redesign-design.md`) is
stale (owner, 2026-09-27). Where it conflicts with the design system or handoff, it loses. The few
parts that do not conflict and still earn their keep are carried forward in §16.

---

## 3. Decisions

### 3.1 Locked

| #   | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Rationale                                                                                                                                                                                                           |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **Full rewrite** of `packages/design-tokens` and `packages/ui`. Package names, Nx tags, and workspace tooling stay.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Owner directive. The August port tracked an older design-system version (no surfaces, no lockup, no brand facts, 72px header).                                                                                      |
| D2  | **Scope = the design-system folder, 100%** (every token, foundation, asset, component, kit) **+ handoff refinements and repeated patterns** (§3.2, §9.5).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Owner directive: "complete design system end to end … as per design system folder"; "if handoff has something missing, add it".                                                                                     |
| D3  | **Brand fills stay `#EE2C68`** everywhere the system puts them (buttons, badges, flooded panels). Contrast is balanced, not traded for brand: all _text_ colours meet AA; white-on-brand-pink is the single declared exception at the AA-large floor (§5).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Owner: "can't change our brand theme … okay with creating balance." Supersedes the earlier "tuned pink" answer.                                                                                                     |
| D4  | **Token names mirror the design system 1:1**, translated only into Tailwind v4 namespaces (§6.3). `--radius-lg` stays `rounded-lg`; `--fs-h4` becomes `text-h4`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Traceability: a designer's token name finds the code class without a lookup table. The August port's renames (`subtitle1`, `radius-4`) are dropped.                                                                 |
| D5  | **Surfaces are CSS, not props.** `data-surface="brand"\|"ink"\|"soft"\|"light"` remaps semantic tokens (text, links, borders, focus, and component tokens such as button skins). No component takes an `on="brand"` prop.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | The design system's own rule: "Text colour follows the surface, never the component." Also removes a prop from ~15 components.                                                                                      |
| D6  | **Server-first components.** No `"use client"` unless the component owns state, effects, or browser APIs. Hover/press/focus are CSS.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Next.js static export; the web app ships HTML, not JS, for anything static.                                                                                                                                         |
| D7  | **Native platform before libraries**: `<select>`, `<input type="range\|date\|checkbox\|radio">`, `<details name>` (accordion). Radix (the installed `radix-ui` meta-package) only where the platform has no accessible primitive: **Dialog/Sheet, Tabs, Tooltip, Toast, ToggleGroup**, plus **Slot** for `asChild`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Least JS, best mobile UX, free a11y semantics. Handbook "Radix, never hand-rolled" still holds — native is not hand-rolled.                                                                                         |
| D8  | **`asChild` composition** (Radix `Slot`) on Button, IconButton, Link, Card, LinkCard, ListRow, TabBar items.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Lets the app pass `next/link`, `<a href="https://wa.me/…">`, `tel:` without the system knowing about routers or WhatsApp.                                                                                           |
| D9  | **No content inside the system.** Copy, links, brand facts, and prices arrive as props. Stories bind fixtures; the Brand → Company details page and the kits bind the real brand facts from `packages/content`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | The August port shipped a fake FSSAI number as a footer default. Never again.                                                                                                                                       |
| D10 | **Icons: `lucide-react`** (installed, tree-shaken, RSC-safe), passed as components (`icon={MessageCircle}`), never strings. Brand glyphs lucide 1.x removed (Instagram, YouTube, LinkedIn) ship as three local SVG components (Simple Icons paths, CC0).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | No runtime CDN (the zip fetched from unpkg). Verified: `lucide-react@1.30.0` exports no `Instagram`/`Youtube`/`Linkedin`.                                                                                           |
| D11 | **Fonts self-hosted.** Poppins 400–800 (+600 italic) with the **Devanagari** subset, DM Sans 400/500/700 (+400 italic), Space Mono 400/700 — via `@fontsource/*` in Storybook now; `next/font` in apps at step 2. Font tokens reference `var(--font-poppins, "Poppins")` so both loaders work.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | No Google Fonts CDN (privacy, LCP). Families and weights exactly as `tokens/fonts.css`.                                                                                                                             |
| D12 | **Brand facts** (`brand.js`) become a Zod-validated typed module in `packages/content` (§7.3). The design system never imports it (boundary LAW); Storybook app pages do.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Single source of every legal/contact fact, validated at build.                                                                                                                                                      |
| D13 | **Storybook = the design system's "Design System tab".** 13 groups in the design system's order; foundations are MDX docs; kits are page stories in `apps/storybook`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Owner: "live in Storybook as per design system folder."                                                                                                                                                             |
| D14 | **Layer folder renamed `templates/` → `layouts/`**, matching the design system's tier name; atomic-layering lint updated. Atoms may import only `atoms/icon` (design-system rule, now LAW).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 1:1 traceability; the design system's tier rule becomes a gate.                                                                                                                                                     |
| D15 | **CSS first for motion; `motion` (formerly Framer Motion) only where CSS cannot do the job.** Token durations/easings; `motion-safe:`/`motion-reduce:` variants; Radix `data-state` enter/exit keyframes; `::details-content` height transition; native smooth scroll-snap; IntersectionObserver + CSS for reveal. Audit of all 90 components found **no case CSS cannot express**, so `motion` is **not installed** this phase. Adding it requires a decision-log entry naming the component and the CSS limit hit (e.g. layout/shared-element animation, interruptible gesture physics).                                                                                                                                                                                                          | Owner directive 2026-09-27 ("only if CSS animations can't do the job"). Brand motion is short and matter-of-fact; zero JS for motion keeps every static component server-rendered.                                  |
| D16 | **Storybook: local + static build.** `pnpm nx run storybook:serve` (6006) and `storybook:build` artifact. No hosting this phase.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Owner decision 2026-09-27.                                                                                                                                                                                          |
| D17 | **Forms: `react-hook-form` + Zod** (`@hookform/resolvers/zod`). The design system stays form-library-agnostic but is **RHF-compatible by contract**: native-backed controls (Input, Select, Checkbox, Radio, Switch, Slider, ChoiceCardGroup, CheckCard, SlotPicker) spread native props incl. `ref`/`name`/`onChange`/`onBlur`, so `{...register("field")}` works unmodified; value-based controls (QuantityStepper, ChipGroup, FilterBar, OtpInput, SearchField, Tabs) expose `value`/`onValueChange`/`onBlur`/`name` for `<Controller>`; `Field` renders `fieldState.error.message` via `status`/`message`. Proven by a Storybook story (Molecules/Field → "React Hook Form + Zod") in `apps/storybook`, which owns the RHF/Zod devDependencies. The web app adopts RHF for its forms in step 2. | Owner directive 2026-09-27. Zod is already the content-validation standard (principle 5); one schema drives validation and types. Keeping RHF out of `packages/ui` deps means the system never dictates form state. |
| D18 | **`prettier-plugin-tailwindcss`** for deterministic class order (drift-ledger item), configured with `tailwindStylesheet: "./packages/ui/src/styles.css"` and `tailwindFunctions: ["componentVariants"]` so classes inside variant definitions sort too. ESLint's `tailwindcss/classnames-order` is **turned off** (the two would fight); Prettier owns order, ESLint owns validity.                                                                                                                                                                                                                                                                                                                                                                                                                | Owner directive 2026-09-27; architecture spec §7 already specified it.                                                                                                                                              |

### 3.2 Handoff refinements adopted into the system (from `handoff/design/ds-base.js`)

1. `--text-subtle` → `ink-600` globally (ink-500 measures 3.79:1 on white — fails AA).
2. Inside `brand`/`ink` surfaces: `--text-body: #fff`, `--text-muted: rgba(255,255,255,.92)`,
   `--text-subtle: rgba(255,255,255,.85)` (replaces the design system's .90/.76/.62).
3. **Light island:** a white surface nested inside a dark one restores the light tokens. The handoff
   does this with an attribute-selector hack on inline `background:#fff`; the system does it with
   `data-surface="light"`, set automatically by every white-filled component (Card `default`,
   form controls, QuotePanel `light`).
4. **Section reveal motion:** sections below the fold fade + rise 12px into view once
   (340ms, `--ease-out`, IntersectionObserver `rootMargin: 0px 0px -8% 0px`); reduced motion keeps the
   fade only; print always visible; never applied above the fold (no LCP/CLS cost). Shipped as CSS
   (`[data-pp-reveal]`) + a tiny client `RevealObserver` (§9.6).

### 3.3 Rejected alternatives

| Rejected                              | Why                                                                                                                                           | Reconsider when                                    |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Evolve the August `packages/ui`       | Owner directive to rewrite; it tracks an older system version and its API assumptions (callbacks, `on` props, numbered radii) fight D4/D5/D8. | —                                                  |
| Port the zip `.jsx` files             | Prototype code (inline styles, runtime CDN icons, window-width JS).                                                                           | Never.                                             |
| Radix Accordion                       | `<details name="…">` gives exclusive-open accordions with zero JS, find-in-page, and SEO-visible answers.                                     | A requirement native `<details>` cannot meet.      |
| Radix Select                          | The design system specifies a native `<select>` (and it is the better mobile control).                                                        | A searchable/multi select is designed.             |
| "Tuned" accessible pink `#E2225C`     | Owner: brand theme cannot change (D3).                                                                                                        | Owner reverses D3.                                 |
| Installing `motion` now               | D15: no component needs it; installing unused runtime JS is cost without benefit.                                                             | A component hits a documented CSS limit (D15).     |
| Form library inside `packages/ui`     | D17: compatibility by contract is enough; a hard dep would force RHF on every consumer.                                                       | A system-level form component needs RHF internals. |
| `tokens.ts` output                    | No JS consumer. Storybook docs read `tokens.json`.                                                                                            | First runtime JS consumer of a token value.        |
| Visual-regression service (Chromatic) | No account/token; parity is reviewed side-by-side (§11.4).                                                                                    | Owner provides a Chromatic project token.          |

---

## 4. Conflicts found and how they are resolved

Everything below was found by reading the sources; each resolution is applied unless the owner
overrides it during review. **Bold = owner please confirm.**

| #   | Conflict                                                                                                                                                                       | Resolution                                                                                                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Header height: token `--header-h: 88px` vs `SiteHeader.prompt.md` "72px" vs handoff header (64px row + launch bar)                                                             | Token 88 is the system default (`SiteHeader` `size="default"`); add `--header-h-compact: 64px` (`size="compact"`) for the handoff header.                                                                                        |
| C2  | readme §3.4 "`--radius-md` (12px…)" vs token `--radius-md: 10px`                                                                                                               | Token (10px) wins; readme typo.                                                                                                                                                                                                  |
| C3  | **`brand.js` `est: 2019` vs `HeroBanner.d.ts`/website kit "Est. 2025"** (CIN `U56101HR2025…` also encodes 2025)                                                                | `est: 2025`. **Owner confirm.**                                                                                                                                                                                                  |
| C4  | readme "24 molecules" vs 27 listed/present                                                                                                                                     | 27.                                                                                                                                                                                                                              |
| C5  | Pink logo SVGs fill `#ee2d68` vs brand `#ee2c68`                                                                                                                               | Artwork recoloured through `currentColor` → `--color-pink-500`. The raw hex exists once, in tokens.                                                                                                                              |
| C6  | Address "HSVP Market" (`brand.js`) vs "MKM Market" (repo docs, handoff copy)                                                                                                   | `Booth No. 67P, HSVP Market (MKM Market), Sector 57, Gurgaon 122003` (the handoff `rates.js` form, which reconciles both).                                                                                                       |
| C7  | Pattern opacity: readme "6–10%", handoff README "4%", component default .08, handoff pages pass .04 on ink only                                                                | `PatternField` `density`: `default` = .08 dark / .09 light (component contract), `faint` = .04 (handoff ink sections).                                                                                                           |
| C8  | Gutters/section rhythm: DS `clamp(20px,4vw,40px)` / `clamp(56px,7vw,96px)` vs handoff `clamp(16px,4vw,40px)` / `clamp(48px,8vw,96px)`                                          | Handoff values (newer, used on every page). Difference ≤4px gutter at 360px.                                                                                                                                                     |
| C9  | `Button variant="inverse"` on a brand surface renders as a white outline in the zip code, though the readme defines inverse as "ink" and the handoff clearly intends solid ink | Inverse stays solid ink on every surface; only `primary` (→ white) and `secondary`/`ghost` (→ white outline/text) remap on brand.                                                                                                |
| C10 | **`DietMark variant="egg"` ("the few egg-containing bakes") vs handoff About copy "never cooked meat or egg"** (README calls that copy a placeholder)                          | Build both variants per the system; usage decided by content in step 2. **Owner confirm whether egg exists.**                                                                                                                    |
| C11 | Logo tagline "India's First Desi Urban Café" (lockup) vs the August product spec's ban on unverifiable superlatives                                                            | **Resolved by owner 2026-09-27: the latest material wins; the August spec is stale.** Lockup (with tagline) is the default everywhere, as the design system and handoff specify; wordmark is still built for units under ~120px. |
| C12 | Lockup minimum width 200px (readme) vs handoff header using the lockup at 40px height (~76px wide)                                                                             | The system documents the rule on Brand → Logo; it is guidance, not enforced in code. Step 2 picks the header artwork.                                                                                                            |
| C13 | DS text colours that fail AA on their grounds (measured, §5.2)                                                                                                                 | Re-pointed to passing ramp steps (§5.3). No fill colour changes.                                                                                                                                                                 |
| C14 | `StatusDot tone="success"` used by the handoff FaqBlock; not in the contract                                                                                                   | Not added; the handoff intent ("a real person replies") is `tone="open"`.                                                                                                                                                        |
| C15 | `brand.js` social: Instagram, YouTube, LinkedIn; handoff footer shows Instagram only                                                                                           | Brand facts keep all three; the footer renders what it is given.                                                                                                                                                                 |
| C16 | `brand.js` outlet `hours`/`maps` and billing bank fields are `"TODO"`                                                                                                          | Modelled as `null` (not the string "TODO"); Brand → Company details lists every `null` as "Owner to supply".                                                                                                                     |

---

## 5. Accessibility — the balance policy

### 5.1 Principle

WCAG 2.2 AA everywhere **except** the one pairing the brand cannot give up — white text on the
brand fill `#EE2C68` — which is held to the **AA-large floor (3:1)** and declared, tested and
documented as the sole exception. Everything else about accessibility (semantics, names, keyboard,
focus, targets, motion) is uncompromised and gated.

### 5.2 Measured (sRGB WCAG formula, 2026-09-27)

| Pair                                                | Ratio              | Verdict                                                  |
| --------------------------------------------------- | ------------------ | -------------------------------------------------------- |
| white on pink-500 `#EE2C68` (brand fill)            | 4.04               | **Exception** — passes AA-large (≥3.0)                   |
| pink-500 text on white                              | 4.04               | fails — re-pointed (5.3)                                 |
| pink-600 `#D21E55` text on white / on pink-50       | 5.18 / 4.85        | AA                                                       |
| pink-600 on pink-100                                | 4.08               | fails — re-pointed to pink-700 (5.66)                    |
| ink-600 on white / pink-50 / ink-100                | 6.43 / 6.03 / 5.85 | AA                                                       |
| ink-500 on white (DS `--text-subtle`)               | 3.79               | fails — re-pointed to ink-600                            |
| pink-400 on pink-100 (image placeholder label)      | 2.53               | fails — re-pointed to pink-700                           |
| pink-700 on pink-200 (strong placeholder)           | 4.48               | fails — re-pointed to pink-800                           |
| mint `#2FA37C` text on white                        | 3.16               | fails — success text uses `mint-strong` `#1D6E52` (6.17) |
| turmeric on white                                   | 1.88               | never used as text on light                              |
| white on ink-900 / 76% / 62%                        | 18.4 / 10.8 / 7.5  | AA                                                       |
| pink-300 on ink-900 / ink-800                       | 8.18 / 7.05        | AA                                                       |
| `#1D6E52` on mint-soft · `#7A5510` on turmeric-soft | 5.40 · 5.98        | AA                                                       |
| ink-400 on ink-200 (disabled)                       | 1.80               | exempt (WCAG 1.4.3 excludes disabled controls)           |

### 5.3 Token re-pointing (text only — no fill changes)

| Token (light surface)                   | Design system     | This system                                             | Why                                   |
| --------------------------------------- | ----------------- | ------------------------------------------------------- | ------------------------------------- |
| `--color-text-brand`                    | pink-500          | pink-600                                                | 4.04 → 5.18                           |
| `--color-text-subtle`                   | ink-500           | ink-600                                                 | handoff §3.2.1                        |
| soft surface `--color-text-brand`       | pink-600          | pink-700                                                | 4.08 → 5.66                           |
| brand surface `--color-text-brand`      | pink-100          | ink-000                                                 | pink-100 on brand fails even AA-large |
| brand/ink `--color-text-muted`/`subtle` | .76/.62           | .92/.85                                                 | handoff §3.2.2; ≥3.0 on brand         |
| placeholder label (soft/strong)         | pink-400/pink-700 | pink-700/pink-800                                       | 2.53/4.48 → pass                      |
| success text                            | mint              | mint-strong `#1D6E52` (new primitive, from handoff)     | 3.16 → 6.17                           |
| warning text on soft                    | —                 | turmeric-strong `#7A5510` (new primitive, from handoff) | 5.98                                  |

### 5.4 Gates

- **Contrast policy test (LAW, new):** `packages/design-tokens` runs a Vitest suite over the built
  token set. A declared pair list (`tokens/contrast-pairs.json`: foreground token, background token,
  surface, required ratio) asserts every semantic text/background pair the components use: ≥4.5, or
  ≥3.0 for pairs tagged `exception: "brand-fill"`. Adding a component that paints a new pair means
  adding the pair; a failing ratio fails the build.
- **axe in every component test and every story (LAW):** all rules enforced **except
  `color-contrast`**, which axe cannot scope to a single declared exception; the token contrast test
  replaces it. (This replaces today's undocumented blanket-OFF in `apps/storybook/.storybook/preview.tsx`.)
- Step 2 carries the same policy into Lighthouse (per-audit assertion: `color-contrast` warn, all
  other a11y audits error) — recorded here, implemented with the web app.

### 5.5 Non-contrast requirements (all components)

Semantic HTML first; every interactive element keyboard-operable with visible focus
(2px `pink-500` outline, 2px offset; fields use the inset focus ring); touch targets ≥44px
(`--hit-min`) except where the system specifies 36/38px controls (still ≥24px, WCAG 2.5.8 AA);
accessible names required by the type system (e.g. `IconButton.label: string` is not optional);
status never by colour alone (message + glyph); `prefers-reduced-motion` honoured globally;
headings levels configurable (`headingLevel`) on every titled component.

---

## 6. Token architecture — `packages/design-tokens`

### 6.1 Source files (W3C DTCG JSON)

```
packages/design-tokens/
├── tokens/
│   ├── primitive/     color · typography · spacing · radius · border · shadow · effect ·
│   │                  motion · breakpoint · layout · canvas · pattern · z-index
│   ├── semantic/      color (surface · text · border · interaction · status · heat · action)
│   ├── surface/       brand · ink · soft · light   (overrides of semantic + component tokens)
│   ├── component/     one file per component with its own dimensions (button, icon-button, tag,
│   │                  badge, field, card, image-slot, logo, … — see 6.4)
│   └── contrast-pairs.json
├── sd.config.mjs      Style Dictionary 5 (installed 5.5.1)
├── src/contrast.spec.ts
└── dist/  (generated, gitignored)  theme.css · surfaces.css · tokens.json
```

Tiers: **primitive** (raw values — the only place a hex or px literal may exist) → **semantic**
(references primitives) → **component** (references semantic/primitive). **Surface** files redefine
semantic and component tokens for a scope.

### 6.2 Outputs

| File                | Content                                                                                                                                                                                                                                                                                                                                                                             | Consumer                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `dist/theme.css`    | One Tailwind v4 `@theme static { … }` block. Starts with `--<namespace>-*: initial;` resets for every namespace the system replaces (color, font, font-weight, text, leading, tracking, radius, shadow, blur, ease, breakpoint, container), then every primitive, semantic and component token. Semantic tokens use `outputReferences` (`--color-text-body: var(--color-ink-800)`). | `packages/ui/src/styles.css`              |
| `dist/surfaces.css` | `[data-surface="brand"], .pp-on-brand { … }` etc. for brand, ink, soft, light, overriding **semantic + component** custom properties (never primitives — custom properties resolve where declared, so only overriding the semantic layer cascades correctly).                                                                                                                       | `packages/ui/src/styles.css`              |
| `dist/tokens.json`  | Flat resolved catalogue (name, value, type, tier, description).                                                                                                                                                                                                                                                                                                                     | Storybook foundation pages; contrast test |

`package.json` exports: `./theme.css`, `./surfaces.css`, `./tokens.json`. Nx target `build` stays
cached on `tokens/**` + `sd.config.mjs`; new `test` target runs the contrast suite.

`@theme` (not `@theme inline`): utilities must read `var(--color-…)` at use-site so surface
overrides apply.

### 6.3 Name mapping (design system → token → utility)

| Design system                                                                    | CSS custom property                                                                                                                                                                                                            | Utility                                    |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| `--pink-50 … --pink-800`                                                         | `--color-pink-50 … -800`                                                                                                                                                                                                       | `bg-pink-500`, `text-pink-600`             |
| `--ink-000 … --ink-900`                                                          | `--color-ink-000 … -900`                                                                                                                                                                                                       | `bg-ink-900`                               |
| `--turmeric`, `--turmeric-soft` (tandoor, mint, kesar alike)                     | `--color-turmeric`, `--color-turmeric-soft`                                                                                                                                                                                    | `bg-mint-soft`                             |
| new: mint-strong, turmeric-strong, veg (`#1a7a3c`, DietMark), danger/danger-soft | `--color-mint-strong`, `--color-turmeric-strong`, `--color-veg`, `--color-danger`, `--color-danger-soft`                                                                                                                       | `text-mint-strong`                         |
| `--surface-*`                                                                    | `--color-surface-*`                                                                                                                                                                                                            | `bg-surface-card`                          |
| `--text-*` (colours)                                                             | `--color-text-*`                                                                                                                                                                                                               | `text-text-muted`                          |
| `--border-*` (colours)                                                           | `--color-border-*`                                                                                                                                                                                                             | `border-border-subtle`                     |
| `--brand-hover`, `--brand-active`                                                | `--color-brand-hover`, `--color-brand-active`                                                                                                                                                                                  | `hover:bg-brand-hover`                     |
| `--status-*`, `--heat-1…4`                                                       | `--color-status-*`, `--color-heat-1…4`                                                                                                                                                                                         | `bg-status-success-soft`                   |
| `--focus-ring`, `--focus-ring-inverse`                                           | `--shadow-focus-ring`, `--shadow-focus-ring-inverse`                                                                                                                                                                           | `focus-visible:shadow-focus-ring`          |
| `--font-display/body/devanagari/mono`                                            | `--font-display` = `var(--font-poppins, "Poppins"), "Segoe UI", system-ui, sans-serif` (etc.)                                                                                                                                  | `font-display`                             |
| `--weight-regular … black` (400…800)                                             | `--font-weight-regular … black`                                                                                                                                                                                                | `font-bold`, `font-black` (=800)           |
| `--fs-X`, `--lh-X`, `--ls-X` (display-1 … mono)                                  | `--text-X` + `--text-X--line-height`, `--text-X--letter-spacing`, `--text-X--font-weight`                                                                                                                                      | `text-h2` (size+lh+ls+weight in one class) |
| `--fs-X-fluid`                                                                   | `--text-X-fluid` (+ same sub-properties)                                                                                                                                                                                       | `text-h1-fluid`                            |
| `--fs-canvas-*`                                                                  | `--text-canvas-*`                                                                                                                                                                                                              | `text-canvas-hero`                         |
| `--space-N` (N×4px, incl. 0-5, 1-5)                                              | `--spacing: 4px` (Tailwind multiplier) — no per-step variables                                                                                                                                                                 | `p-6` (=24px), `gap-1.5` (=6px)            |
| `--container-max` / `--container-wide`                                           | `--container-content: 1200px` / `--container-wide: 1440px`; new from handoff `--container-narrow: 960px`, `--container-article: 760px`; `--measure-prose/narrow` → `--container-prose: 64ch`, `--container-prose-narrow: 44ch` | `max-w-content`                            |
| `--gutter-*`, `--section-y-*`, `--gap-grid`                                      | `--spacing-gutter` (fluid), `--spacing-section` (fluid), `--spacing-grid-gap` + the fixed mobile/desktop values                                                                                                                | `px-gutter`, `py-section`, `gap-grid-gap`  |
| `--header-h`, `--tabbar-h`, `--hit-min`, `--card-min(-wide)`                     | `--spacing-header`, `--spacing-header-compact` (new, 64px), `--spacing-tabbar`, `--spacing-hit`, `--spacing-card-min(-wide)`                                                                                                   | `h-header`, `min-h-hit`                    |
| `--bp-sm … --bp-2xl`                                                             | `--breakpoint-sm: 480px … --breakpoint-2xl: 1440px`                                                                                                                                                                            | `md:` (768) etc.                           |
| `--radius-xs/sm/md/lg/xl/pill`                                                   | `--radius-xs … --radius-pill`                                                                                                                                                                                                  | `rounded-lg` (=16px)                       |
| `--border-width(-strong)`                                                        | `--border-width`, `--border-width-strong` (component-token inputs)                                                                                                                                                             | `border`, `border-2`                       |
| `--shadow-1…4`, `--shadow-brand`, `--shadow-inset`                               | same names                                                                                                                                                                                                                     | `shadow-3`, `shadow-brand`                 |
| `--blur-glass`                                                                   | `--blur-glass: 14px`                                                                                                                                                                                                           | `backdrop-blur-glass`                      |
| `--scrim-bottom/top`                                                             | `--effect-scrim-bottom/top` (gradient values)                                                                                                                                                                                  | `@utility scrim-bottom` (§6.5)             |
| `--dur-*`                                                                        | `--duration-instant/fast/base/slow/page`                                                                                                                                                                                       | `duration-(--duration-fast)`               |
| `--ease-out/in-out/entrance/pop`                                                 | `--ease-out … --ease-pop` (namespace reset first)                                                                                                                                                                              | `ease-out`, `ease-pop`                     |
| `--press-scale`, `--lift-y`                                                      | `--motion-press-scale`, `--motion-lift-y`                                                                                                                                                                                      | `active:scale-(--motion-press-scale)`      |
| `--canvas-*-w/h`, `--canvas-pad(-tight)`, `--story-safe-*`                       | same names under `--canvas-*`                                                                                                                                                                                                  | component tokens of PostFrame              |
| new: pattern opacities & tiles                                                   | `--pattern-opacity-default: .08`, `--pattern-opacity-light: .09`, `--pattern-opacity-faint: .04`; `--pattern-tile-56/64/72/80/86/96`                                                                                           | PatternField                               |
| new: stacking                                                                    | `--z-raised: 5`, `--z-sticky: 10`, `--z-header: 50`, `--z-dock: 60`, `--z-overlay: 70`, `--z-toast: 80`                                                                                                                        | `z-(--z-header)`                           |
| new: dock clearance                                                              | `--spacing-dock-clearance: 84px` (handoff sticky bar offset above the mobile dock)                                                                                                                                             | StickyActionBar                            |

`text-text-muted` (colour) vs `text-body` (size) is deliberate: the design system's `--text-*`
colour family and Tailwind's `--text-*` font-size namespace collide, and the `color-` prefix is
what keeps both traceable. `eslint-plugin-tailwindcss` `no-custom-classname` (§11.2) catches any
class that resolves to nothing.

### 6.4 Component tokens

Any dimension the design system specifies for a component that is not a step of the base scales
(e.g. Button heights 36/44/54, label sizes 13/15/17px, Tag height 38, Badge 11.5px/+.14em, fields
48px, image-placeholder label 10.5px/+.12em, Logo default widths 240/180/40) becomes a
**component token** in `tokens/component/<name>.json`. Component tokens are how the system stays
pixel-faithful without a single literal in `packages/ui`. Surface-dependent component skins (Button,
IconButton, Tag, Link, Divider, Badge on brand) are component tokens redefined in `surface/*.json`
— that is the mechanism behind D5.

### 6.5 Base layer & utilities — `packages/ui/src/styles.css`

The single CSS entry consumers import (design system's `styles.css` equivalent):

```css
@import "@pink-paprikaa-web/design-tokens/theme.css";
@import "@pink-paprikaa-web/design-tokens/surfaces.css";
@source "./"; /* the library scans itself — consumers never add @source */
/* @layer base: box-sizing; body (font-body, text-body, text-text-body, bg-surface-page,
   antialiased); h1–h4 (font-display, ramp, text-text-heading); p (text-wrap: pretty,
   max-w-prose); a (text-link, pink-200 1.5px underline, 3px offset, hover); :focus-visible ring;
   img/svg/video max-width; reduced-motion collapse; print reveal override.
   @utility: container-page (pp-container), section-y (pp-section), autogrid(-wide), cluster,
   scrim-bottom, scrim-top, pattern tile helpers.
   @keyframes: pp-toast-pop, pp-skeleton, pp-spin-pulse, pp-dot-pulse, pp-rotate, pp-sheet-in,
   pp-mark-pulse (the design system's seven), plus pp-reveal. */
```

Consumer contract (Storybook now, apps in step 2):

```css
@import "tailwindcss";
@import "@pink-paprikaa-web/ui/styles.css";
```

`.pp-on-brand/.pp-on-ink/.pp-on-soft` classes are emitted alongside `data-surface` (design system
parity, for raw HTML in MDX). Utility-class names from the design system (`.pp-autogrid`, `.pp-clamp-2`,
`.pp-fluid-h1`) are provided as Tailwind utilities or map to built-ins (`line-clamp-2`,
`text-h1-fluid`); the mapping is documented on the Layout foundation page.

---

## 7. Assets, fonts, brand facts

### 7.1 Logo artwork

The nine `assets/*.svg` (lockup / wordmark / symbol × pink / white / badge) are optimised with the
installed `svgo` and compiled into path data in `packages/ui/src/atoms/logo/logo-artwork.ts`
(no runtime asset fetch, no `base` prop). Pink/white artwork is one path set painted with
`currentColor`; `badge` wraps it in a square `--color-pink-500` plate at the design system's fixed
insets (symbol 60%, lockup 76%). ViewBoxes are taken verbatim from the source files. The original
SVGs are copied to `packages/ui/src/assets/brand/` as the traceable source (and for favicon
generation in step 2).

### 7.2 Symbol & pattern

The diamond symbol (white) is the pattern tile and the loader; `PatternField` renders it as a CSS
`background-image` (data URI generated at build from the same artwork) — server-rendered, no
`useId`. `Spinner`, `StatusDot`, `Rating`, `SpiceLevel` and `Divider variant="diamond"` draw the
mark from the same path data.

### 7.3 Brand facts — `packages/content/src/brand/`

- `brand-schema.ts` — Zod schema: `name` (literal `"Pink Paprikaa"` — the two-`a` rule as a type),
  `nameDevanagari`, `tagline`, `statement`, `vegStatement`, `established` (year), `legal` (entity,
  15-char GSTIN regex, 14-digit FSSAI, CIN, PAN, registered address), `contact` (E.164 phone,
  display phone, WhatsApp, emails, site URL), `social[]` (`network` enum, handle, URL), `hours`,
  `outlets[]` (nullable `hours`/`mapsUrl`), `billing` (GST rate + split, currency, invoice prefix,
  nullable bank fields).
- `brand.ts` — the data (from `brand.js`, with C3/C6/C16 applied), parsed once at the boundary:
  `export const brand = brandSchema.parse(rawBrand)`.
- `brand-lines.ts` — pure `toBrandLines(brand, year)` for the derived strings (`copyright`,
  `fssai`, `gstin`, `cin`, `contactShort`, `footerPolicies`); the caller passes the year (build time).
- Tests: valid fixture + one invalid fixture per rule-bearing field; no founder names (hard rule 2)
  — asserted.

`packages/ui` never imports this (boundary LAW). `apps/storybook` does.

### 7.4 Formatting helpers — `packages/utils`

Replace the placeholder with the helpers components need: `formatRupees(amount)` → `₹1,19,952`
(`en-IN` grouping, `₹` with no space, rounded, no decimals), `formatRupeeRange(from, to)` →
`₹180–₹320` (en dash), `formatCount(n)` (`en-IN`). Pure, table-tested. `PriceTag`, `Rating`,
`PriceSummary`, `CartPanel` use them.

### 7.5 Fonts (D11)

`apps/storybook` adds `@fontsource/poppins` (subsets latin + devanagari; 400, 500, 600, 700, 800,
600-italic), `@fontsource/dm-sans` (400, 500, 700, 400-italic), `@fontsource/space-mono` (400, 700),
imported in `.storybook/preview.tsx`. `packages/ui` loads no fonts.

---

## 8. Component architecture — `packages/ui`

### 8.1 Canonical shape

```tsx
// packages/ui/src/atoms/button/button.tsx
import { Slot } from "radix-ui";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { Icon, type IconComponent } from "../icon/icon";

const button = componentVariants({
  slots: { root: "…token classes…", icon: "…" },
  variants: { variant: { primary: { root: "bg-(--button-primary-bg) text-(--button-primary-fg) …" } /* … */ },
              size: { sm: { root: "h-(--button-h-sm) px-(--button-px-sm) text-(length:--button-fs-sm)" } /* … */ } },
  defaultVariants: { variant: "primary", size: "md" },
});

export interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof button> {
  asChild?: boolean;
  icon?: IconComponent;
  iconAfter?: IconComponent;
  isFullWidth?: boolean;
  isLoading?: boolean;
}

export function Button({ asChild = false, variant, size, icon, iconAfter, isFullWidth, isLoading,
  className, children, type = "button", ...props }: ButtonProps) { … }
```

Rules (CONVENTION unless marked LAW):

- React 19: `ref` is a prop; **no `forwardRef`** (R-03). Named function exports; **no default
  exports** (R-02). One primary export per file; compound components (`Table*`, `Tabs*`) may export
  their parts from the same file.
- Props extend the native element (`React.ComponentProps<"…">`), spread last, `className` merged
  through `componentVariants` (the configured `tailwind-variants` instance — **never bare `tv`**,
  LAW-in-practice, R: `text-h1` vs `text-text-muted` merge bug).
- **Only token classes** (LAW: `no-arbitrary-value`, `no-custom-classname`, `no-raw-hex`).
  Component-specific values come from component tokens via `(--token)` references.
- Variants are `as const` unions (`variant`, `size`, `tone`, `density`); booleans are `is*/has*`
  (LAW: naming-convention promoted to `error`).
- Controlled + uncontrolled inputs follow the Radix convention: `value` / `defaultValue` /
  `onValueChange` (and `checked` / `defaultChecked` / `onCheckedChange`, `open` / `defaultOpen` /
  `onOpenChange`).
- **Slots over booleans:** organisms take `actions`, `media`, `aside`, `announcement`, `badge`,
  `footer` as `ReactNode`; never `onOrder`/`onCart` callbacks for navigation.
- Titled components take `headingLevel?: 1 | 2 | 3 | 4` (default per component).
- Surfaces: components that paint a field (`Card` brand/ink/feature/default, `Section`,
  `PatternField`, `SiteFooter`, `CtaBand`, `StatBand`, `HeroBanner`, `QuotePanel`, `PostFrame`,
  `PricingCard` flooded) set `data-surface` themselves.
- **Client boundary:** `"use client"` only in files that use state/effects/refs/browser APIs. A
  static organism with one interactive corner = static organism + a tiny client leaf file.
- No `window`/`document` access during render; responsiveness is CSS (media queries on token
  breakpoints; container queries where a component must respond to its own width).
- Motion via tokens and `motion-safe:`; fades always pair with an 8–12px translate; `ease-pop`
  only on add-to-cart/reward confirmations (Toast `isPop`).

### 8.2 Translating a design-system `.d.ts` into a props contract

| Design system prop pattern                                                                                                                                                                                                                                                                     | This system                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `icon?: string` (Lucide name)                                                                                                                                                                                                                                                                  | `icon?: IconComponent` (a `lucide-react` icon or a brand glyph)                                                                                                                                                                                                                                                                                                    |
| `style?: CSSProperties`                                                                                                                                                                                                                                                                        | `className?: string` (+ native props)                                                                                                                                                                                                                                                                                                                              |
| `on?: "light" \| "brand"`                                                                                                                                                                                                                                                                      | removed — surface-aware via `data-surface` (D5)                                                                                                                                                                                                                                                                                                                    |
| `base?: string` (asset folder)                                                                                                                                                                                                                                                                 | removed — artwork is inlined (7.1)                                                                                                                                                                                                                                                                                                                                 |
| boolean `fullWidth`, `loading`, `selected`, `interactive`, `pulse`, `ring`, `divider`, `chevron`, `danger`, `nowrap`, `scroll`, `bleed`, `bare`, `fit`, `safeArea`, `showLabel`, `showValue`, `multiple`, `copyable`, `wrap`, `circle`, `symbol`, `fluid`, `multiline`, `optional`, `required` | `isFullWidth`, `isLoading`, `isSelected`, `isInteractive`, `isPulsing`, `hasRing`, `hasDivider`, `hasChevron`, `isDanger`, `isNowrap`, `isScrollable`, `isBleed`, `isBare`, `isFit`, `hasSafeArea`, `hasLabel`, `hasValue`, `isMultiple`, `isCopyable`, `isWrapping`, `variant="circle"`, `variant="symbol"`, `isFluid`, `isMultiline`, `isOptional`, `isRequired` |
| numeric px `size`/`width`/`height`/`min`/`padding`/`tile`                                                                                                                                                                                                                                      | token-backed enums (e.g. `size: "sm" \| "md" \| "lg"`, AutoGrid `min: "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl"`) — values in the component's token file                                                                                                                                                                                                       |
| free CSS strings (`radius`, `tone` colour, `measure`, `space`)                                                                                                                                                                                                                                 | token enums only                                                                                                                                                                                                                                                                                                                                                   |
| `onClick` used for navigation                                                                                                                                                                                                                                                                  | `href` / `asChild`                                                                                                                                                                                                                                                                                                                                                 |
| `onChange(value)`                                                                                                                                                                                                                                                                              | `onValueChange(value)`                                                                                                                                                                                                                                                                                                                                             |
| `open` + `onClose`                                                                                                                                                                                                                                                                             | `open` / `defaultOpen` / `onOpenChange`                                                                                                                                                                                                                                                                                                                            |
| `error?: boolean \| string` on controls                                                                                                                                                                                                                                                        | control: `status` + `aria-invalid`; message rendered by `Field`                                                                                                                                                                                                                                                                                                    |
| string-or-object option lists                                                                                                                                                                                                                                                                  | object lists only (`{ value, label }`) — strings are not control flow                                                                                                                                                                                                                                                                                              |

Every other prop keeps its design-system name and meaning.

### 8.3 Library internals

- `lib/component-variants.ts` — `createTV` with `twMergeConfig` extended with the system's custom
  scales (derived from `tokens.json`, not hand-listed); spec asserts the scale lists match the build.
- `lib/cn.ts` — only if a component needs class merging outside a variant (expected: none).
- `vitest.setup.ts` — Testing Library + `expectNoA11yViolations(container)` (axe with
  `color-contrast` disabled per §5.4), `matchMedia`/`IntersectionObserver`/`ResizeObserver` stubs.
- `lib/reveal-observer.tsx` (client) — §3.2.4.

### 8.4 Package surface

```jsonc
// packages/ui/package.json
"exports": {
  ".": "./src/index.ts",
  "./styles.css": "./src/styles.css",
  "./package.json": "./package.json"
},
"sideEffects": ["**/*.css"]
```

One public barrel (`src/index.ts`, named re-exports only). Apps in step 2 add
`transpilePackages: ["@pink-paprikaa-web/ui"]`. Deps: `radix-ui`, `lucide-react`,
`tailwind-variants`, `tailwind-merge` (installed), `@pink-paprikaa-web/design-tokens`,
`@pink-paprikaa-web/utils`.

---

## 9. Component inventory — 90 components

Legend: **C** = client component (`"use client"`), otherwise server-safe. **Tech** = behaviour
source. Every row's contract = the design system `.d.ts` translated per §8.2, plus the notes.

### 9.1 Atoms (30)

| Component                 | Tech                  | Contract notes (beyond §8.2)                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Text                      | —                     | `variant`: display-1, display-2, h1–h4, body-lg, body, body-sm, caption, overline, mono; `tone`: heading, body, muted, subtle, brand, inverse, on-brand, danger (token-only; no free colours); `weight` limited to the ramp's weights; `as`; `align`; `isFluid`; `lineClamp` 1–6; `measure` prose/narrow; `isBalanced` (`text-wrap: balance`). Display tones default to heading. |
| Link                      | Slot                  | variants default/subtle/inverse/quiet; size; icon/iconAfter; `isExternal` (target+rel+arrow glyph); `asChild`.                                                                                                                                                                                                                                                                   |
| Logo                      | —                     | variant lockup/wordmark/symbol; tone `pink`/`white`/`badge`; sized by `className` height/width; `title` default "Pink Paprikaa", `isDecorative`.                                                                                                                                                                                                                                 |
| Icon                      | lucide-react          | `icon: IconComponent`; size xs 14 / sm 16 / md 20 / lg 24 / xl 32; stroke 2 at ≤16px else 1.75; `label` → `role="img"`, otherwise `aria-hidden`. Exports `InstagramGlyph`, `YoutubeGlyph`, `LinkedinGlyph`.                                                                                                                                                                      |
| PatternField              | —                     | tone brand/ink/soft/light; `tile` 56/64/72/80/86/96; `density` default/faint (C7); radius enum; sets `data-surface`.                                                                                                                                                                                                                                                             |
| SocialHeadline            | —                     | size hero/h1/h2/body/caption/overline (canvas ramp); align; `measure`.                                                                                                                                                                                                                                                                                                           |
| Button                    | Slot                  | variant primary/secondary/ghost/inverse; size sm/md/lg; icon/iconAfter; `isFullWidth`; `isLoading` (loader glyph, `aria-busy`, disabled); `asChild`; press = CSS scale + darken; surface skins per C9.                                                                                                                                                                           |
| IconButton                | Slot                  | `icon`, `label` (required); variant primary/secondary/ghost/glass; size sm/md/lg (≥44 hit area); `count` badge (DS SiteHeader cart); `asChild`.                                                                                                                                                                                                                                  |
| Tag                       | —                     | `isSelected` (→ `aria-pressed` when interactive); icon; disabled; renders `<button>` with `onClick`, `<span>` without; static `tone` default/success/brand (handoff zone chips).                                                                                                                                                                                                 |
| Card                      | Slot                  | variant default/feature/brand/ink/quiet; `padding` none/sm/md/lg; `isInteractive` (−2px lift → shadow-3); `asChild`; sets `data-surface` (default → light).                                                                                                                                                                                                                      |
| Divider                   | —                     | variant line/diamond; `label` (centred overline); `<hr>`/`role="separator"`; surface-aware.                                                                                                                                                                                                                                                                                      |
| ImageSlot                 | —                     | `ratio` square/4:3/3:4/4:5/16:9/16:10/wide(21:9); `radius` none/md/lg/xl; `tone` soft/strong/ink; `isFill`. Discriminated union: `{ src, alt, width, height, sizes?, srcSet?, loading?, fetchPriority? }` **or** `{ label }` placeholder; `children` accepts a `<picture>` (image pipeline, step 2).                                                                             |
| Input                     | native                | bare control: types text/tel/email/number/search/date + `isMultiline` (textarea, `rows`); size sm/md/lg; `status`; leading `icon`; `suffix`; `trailing` slot; `readOnly` (sunken + lock glyph); `isLoading` (trailing spinner). Label/hint/message via `Field`.                                                                                                                  |
| Select                    | native                | `options: {value,label,isDisabled?}[]`; `placeholder`; `status`; icon; size; readOnly.                                                                                                                                                                                                                                                                                           |
| Checkbox                  | native                | `label`, `description`, `price` (`+₹60`), checked/defaultChecked/onCheckedChange, disabled, `isInvalid`.                                                                                                                                                                                                                                                                         |
| Radio                     | native                | same as Checkbox; `price` absolute; `name`/`value`. `RadioGroup` = `fieldset` + `legend` wrapper in the same file.                                                                                                                                                                                                                                                               |
| Switch                    | native                | `<input type="checkbox" role="switch">`; label, description.                                                                                                                                                                                                                                                                                                                     |
| Badge                     | —                     | tone brand/soft/ink/success/warning/danger/neutral; 12px icon.                                                                                                                                                                                                                                                                                                                   |
| StatusDot                 | —                     | tone open/busy/closed/live/danger; `label`; `isPulsing` (live only); size sm/md; mark inside the diamond.                                                                                                                                                                                                                                                                        |
| Avatar                    | —                     | name (initials + title), src, size xs–xl, icon, `hasRing`.                                                                                                                                                                                                                                                                                                                       |
| Rating                    | —                     | value (halves), max, `count` (`formatCount`), size sm/md/lg, variant diamond/symbol, `hasValue`; `role="img"` + label "4.5 out of 5".                                                                                                                                                                                                                                            |
| ProgressBar               | —                     | value/max; `segments` (stamps); label; tone brand/mint/inverse; size.                                                                                                                                                                                                                                                                                                            |
| Spinner                   | —                     | size sm/md/lg; tone brand/ink/inverse; `label` (`role="status"`); pulsing mark (`pp-mark-pulse`).                                                                                                                                                                                                                                                                                |
| Skeleton                  | —                     | variant text/block/circle; `lines` 1–6 (varied widths); sized by `className`.                                                                                                                                                                                                                                                                                                    |
| Tooltip                   | Radix Tooltip · **C** | `label`, `side`; provider included.                                                                                                                                                                                                                                                                                                                                              |
| DietMark                  | —                     | variant veg/egg (C10); size sm/md/lg; `role="img"` "Vegetarian"/"Contains egg".                                                                                                                                                                                                                                                                                                  |
| SpiceLevel                | —                     | level 1–4; max; `hasLabel` (Mild/Medium/Hot/Extra Hot); size; `role="img"` "Spice level 3 of 4".                                                                                                                                                                                                                                                                                 |
| PriceTag                  | utils                 | `amount`, `was` (struck), `to` (range); size; tone ink/brand/inverse.                                                                                                                                                                                                                                                                                                            |
| **Slider** _(handoff)_    | native range          | value/defaultValue/onValueChange, min/max/step, `label` (aria); brand accent; used by Dawat guests and Office heads.                                                                                                                                                                                                                                                             |
| **Countdown** _(handoff)_ | **C**                 | `endsAt` (ISO with offset); renders `Nd HHh MMm SSs` (mono pill); renders `fallback` (default nothing) once ended; ticks 1s; SSR renders a stable placeholder to avoid hydration mismatch.                                                                                                                                                                                       |

### 9.2 Molecules (38)

| Component                                      | Tech                      | Contract notes                                                                                                                                                                                                                                                                                                   |
| ---------------------------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Field                                          | —                         | label, hint, `status` + `message` (error/success/warning: 2px border, glyph, message replaces hint), `isRequired`/`isOptional`, `orientation` stack/side. **Wiring by render prop**: `children: (control) => ReactNode` receives `{ id, "aria-describedby", "aria-invalid", required }` — RSC-safe (no context). |
| SearchField                                    | **C**                     | value/defaultValue/onValueChange, placeholder, size, status, `isLoading`, hint, clear button (`onClear`).                                                                                                                                                                                                        |
| QuantityStepper                                | **C**                     | value/defaultValue/onValueChange, min/max/step, size sm/md, `label`; `−`/`+` buttons with names; typed entry clamps.                                                                                                                                                                                             |
| OtpInput                                       | **C**                     | length 4/6, value/onValueChange, status + message, disabled; `inputmode="numeric"`, `autocomplete="one-time-code"`, paste fills all.                                                                                                                                                                             |
| SlotPicker                                     | native radio              | slots `{value,label,note?,isDisabled?}[]`, value/onValueChange, label, columns 2–6 or auto, status, disabled.                                                                                                                                                                                                    |
| Alert                                          | —                         | tone info/success/warning/danger/brand/**neutral** (handoff pg-hint); title; action slot; dismiss button = client leaf when `onDismiss` given.                                                                                                                                                                   |
| Toast                                          | Radix Toast · **C**       | tone brand/ink/success/danger; icon; action; `isPop` (`ease-pop` entrance); `ToastProvider` + viewport.                                                                                                                                                                                                          |
| Snackbar                                       | Radix Toast · **C**       | open/onOpenChange; tone; icon; action; auto-hide `duration`; `position` five anchors.                                                                                                                                                                                                                            |
| EmptyState                                     | —                         | title, body, icon or `variant="symbol"`, action slot, size md/lg.                                                                                                                                                                                                                                                |
| Tabs                                           | Radix Tabs · **C**        | `items: {value,label,content}[]`, value/defaultValue/onValueChange; variant `underline` (design system) / `segmented` (handoff pill rail).                                                                                                                                                                       |
| Breadcrumb                                     | —                         | items `{label, href?}`; `<nav aria-label="Breadcrumb">`, `aria-current="page"`; `renderLink` via `asChild` pattern.                                                                                                                                                                                              |
| Pagination                                     | —                         | page, pages, `getPageHref(page)` (links, not callbacks); prev/next; `aria-current`.                                                                                                                                                                                                                              |
| SectionHeader                                  | —                         | overline, title, `headingLevel` (default 2), lede, action, align start/center.                                                                                                                                                                                                                                   |
| Stat                                           | —                         | value, label, sub, icon, tone ink/brand/inverse, align.                                                                                                                                                                                                                                                          |
| Accordion                                      | native `<details name>`   | items `{value, question, answer}`; `isMultiple` (omits `name`); `defaultOpen`; single-open by default; chevron rotates; `::details-content` height transition as progressive enhancement.                                                                                                                        |
| ListRow                                        | Slot                      | title, description, leading/icon, value, trailing, `hasChevron`, `hasDivider`, `isDanger`, `asChild`/`href`.                                                                                                                                                                                                     |
| PriceSummary                                   | utils                     | lines `{label, amount, isDiscount?, isStrong?}`, total, totalLabel, note, tone light/inverse; `<dl>` semantics.                                                                                                                                                                                                  |
| StepTracker                                    | —                         | steps `{label, note?}`, current, orientation vertical/horizontal, tone; `<ol>` + `aria-current="step"`.                                                                                                                                                                                                          |
| MenuItemRow                                    | —                         | name, nameDevanagari, description, price/was, diet, spice, badge, image/imageLabel, `action` slot (replaces `onAdd`), `hasDivider`.                                                                                                                                                                              |
| MenuItemCard                                   | —                         | same data; image-first 4:3; floating `action` slot; `asChild`/`href`.                                                                                                                                                                                                                                            |
| OutletCard                                     | —                         | name, city, address, hours, status/statusLabel, image or `hasImage={false}`, action slot, `href`.                                                                                                                                                                                                                |
| ReviewCard                                     | —                         | name, meta, quote (quotes added), rating, avatar, variant default/brand, `mark` diamond/symbol; handoff additions `isVerified` ("Verified on Google" chip) and `source` `{label, href}` ("View on Google").                                                                                                      |
| LoyaltyCard                                    | —                         | visits, goal, reward, variant feature/brand.                                                                                                                                                                                                                                                                     |
| FilterBar                                      | Radix ToggleGroup · **C** | options `{value,label,icon?}[]`, value/onValueChange, `isWrapping`, `note` badge, trailing slot; mobile scroll rail.                                                                                                                                                                                             |
| LogoLockup                                     | —                         | tone pink/white/badge; size (canvas sizes ≥200 via tokens); `hasTagline`; align start/center; clear-space padding = P-height.                                                                                                                                                                                    |
| OfferSeal                                      | —                         | value, label, note, size sm/md/lg (+ 156px handoff hero size), tone light/brand/turmeric, `position` corner + bleed (clamped to 0.18×size per the design system).                                                                                                                                                |
| CouponTicket                                   | —/**C** leaf              | code, headline, terms, tone brand/light, size md/lg, `notch` surface page/tint/sunken, `isCopyable` + `onCopy` (clipboard in a client leaf).                                                                                                                                                                     |
| **ChoiceCard** + `ChoiceCardGroup` _(handoff)_ | native radio              | card-style single choice: title, price/was, description, badge (e.g. "Pick"), meta; `fieldset`/`legend`; grid `min`; surface-aware (brand-surface variant for the trial selector).                                                                                                                               |
| **CheckCard** _(handoff)_                      | native checkbox           | card toggle with tick box: title, description (upfront, no onion-garlic).                                                                                                                                                                                                                                        |
| **ChipGroup** _(handoff)_                      | Radix ToggleGroup · **C** | Tag-based single/multiple selection; `maxSelected` (starter picks) disables the rest; variant `chips` / `segmented` (value switch without panels, e.g. Lunch / Both).                                                                                                                                            |
| **KeyValueList** _(handoff)_                   | —                         | `<dl>` rows: key, value (ReactNode, may hold a Badge), density, dividers, key column width sm/md.                                                                                                                                                                                                                |
| **Steps** _(handoff)_                          | —                         | `<ol>` numbered steps `{title, description}`; variant `circle` (44px pink disc) / `rule` (3px top rule + "01"); surface-aware.                                                                                                                                                                                   |
| **FeatureItem** _(handoff)_                    | —                         | icon tile (44 light: pink-100/pink-600; 40 dark: ink-800/pink-300) + title + description; size sm/md.                                                                                                                                                                                                            |
| **PricingCard** _(handoff)_                    | —                         | name, tag, price + unit ("a meal"/"a head"), was, blurb, points (check list), footnote, action slot, media slot; variant `default` / `featured` (2px pink border) / `flooded` (brand, sets `data-surface`).                                                                                                      |
| **LinkCard** _(handoff)_                       | Slot                      | media (ImageSlot), title, description, cta label + arrow; layout `row` (88px media) / `stack`; tone default/brand/ink/soft; `asChild`/`href`; hover lift.                                                                                                                                                        |
| **StickyActionBar** _(handoff)_                | —                         | ink pill: amount, caption, action slot; `position: sticky; bottom: var(--spacing-dock-clearance)`; shown below the two-column breakpoint only.                                                                                                                                                                   |
| **AnnouncementBar** _(handoff)_                | **C** (expiry)            | brand strip: message (ReactNode), optional `Countdown`, `href`; `endsAt` → renders nothing after expiry (the handoff forgot to hide it).                                                                                                                                                                         |
| **Table** _(handoff)_                          | —                         | semantic `<table>` parts (`Table`, `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell`, `TableCell`), scroll wrapper with `minWidth` token, `caption` (visually hidden by default), header tone soft, `highlightColumn`, cells accept interactive children. Replaces the handoff's div grids.                |

### 9.3 Organisms (15)

| Component                                    | Tech                                 | Contract notes                                                                                                                                                                                                                                                                                           |
| -------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SiteHeader                                   | Radix Dialog (drawer) · **C** leaves | `logo` slot/`homeHref`; `links: {label, href, isActive?}[]`; `actions` slot; `announcement` slot (AnnouncementBar); `badge` slot (Pure Veg chip); `size` default 88 / compact 64 (C1); glass on scroll (client leaf); nav shortens at xl → lg → md via CSS, drawer below md.                             |
| SiteFooter                                   | —                                    | tone brand (design system) / ink (handoff); `brand` slot (logo, veg chip, licence); `columns: {heading, items: ({label, href} \| {label, icon?, href?})[]}[]`; `social`; `legal` slot; `policies`; semantic `<footer>`, columns in `<nav aria-label>` with list markup, headings not `<p>`. No defaults. |
| HeroBanner                                   | —                                    | overline/`badges` slot, title (`headingLevel` default 1), body, actions, meta (diamond-separated), `media` slot (ImageSlot + overlays such as OfferSeal), tone brand/ink/soft/**alt** (handoff pink-50), layout split/center.                                                                            |
| MenuList                                     | **C** (filter)                       | items, categories, overline, title, action, variant grid/list, gridCount, note, `renderItemAction`, `getItemHref`.                                                                                                                                                                                       |
| CtaBand                                      | —                                    | overline, title, body, action slot, tone ink/brand/soft, align split/center, pattern.                                                                                                                                                                                                                    |
| StatBand                                     | —                                    | 3–4 stats, tone soft/brand/ink.                                                                                                                                                                                                                                                                          |
| TestimonialWall                              | —                                    | overline, title, reviews, variant default/brand.                                                                                                                                                                                                                                                         |
| FaqSection                                   | native accordion                     | overline, title, lede, items, `isMultiple`, **`aside` slot** (handoff help card, sticky beside the list at ≥lg), `headingLevel`.                                                                                                                                                                         |
| TabBar                                       | Slot                                 | items `{value,label,icon,count?,href?}`, value/onValueChange or links; fixed 64px (`--spacing-tabbar`).                                                                                                                                                                                                  |
| Dialog                                       | Radix Dialog · **C**                 | open/defaultOpen/onOpenChange, trigger slot, title, description, footer, variant modal/sheet (grab handle, top radii only), size sm/md/lg.                                                                                                                                                               |
| CartPanel                                    | **C**                                | lines, title, meta, gstRate, `onQuantityChange`, place/browse action slots; composes QuantityStepper + PriceSummary.                                                                                                                                                                                     |
| OrderTracker                                 | —                                    | steps, current, code (mono), outlet, total, payment, action slot; variant flush/card.                                                                                                                                                                                                                    |
| **ReviewCarousel** _(handoff GoogleReviews)_ | **C** leaf (controls)                | eyebrow, heading, reviews (ReviewCard), scroll-snap track (`role="region"`, label, focusable), prev/next buttons (disabled at ends), empty state, footer link. No auto-advance (matches handoff).                                                                                                        |
| **ActionDock** _(handoff)_                   | —                                    | mobile (<md): fixed bottom bar, secondary icon action + primary pill, safe-area padding; ≥md: floating pill bottom-right; `primary`/`secondary` `{label, href, icon}`; `z-(--z-dock)`.                                                                                                                   |
| **QuotePanel** _(handoff)_                   | —                                    | tone brand (pattern) / ink / light; overline title, `badge`, big `amount` + unit, `was`, lines (PriceSummary), total, note, alerts slot, action slot, footnote.                                                                                                                                          |

### 9.4 Layouts (7)

| Component | Contract notes                                                                                                                                                                                                                   |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Container | size content (1200) / wide (1440) / narrow (960, handoff) / article (760, handoff) / prose (64ch) / full; `isBleed`; `as`.                                                                                                       |
| Section   | tone page/alt/sunken/soft/brand/ink (sets `data-surface`); `pattern` density; size (Container passthrough); space none/tight/default/loose (fluid); `isBare`; `as` (default `section`).                                          |
| Stack     | space (scale steps incl. 0.5/1.5); align; justify; `isDivided`; `as`.                                                                                                                                                            |
| Cluster   | space; align; justify; `isNowrap`; `isScrollable` (mobile rail); `as`.                                                                                                                                                           |
| AutoGrid  | `min` xs 140 / sm 200 / md 260 / lg 320 / xl 380 / 2xl 420 (tokens; handoff values snap to the nearest step); `columns` 1–6 fixed; `gap` token; `as`; always `minmax(0,1fr)`.                                                    |
| AppShell  | 390×844 phone frame (sizes enum); statusTone ink/light; time; `tabBar` and `overlay` slots.                                                                                                                                      |
| PostFrame | format post/portrait/story/landscape/wide/mpu/leaderboard (canvas tokens); `scale` or `isFit` (client ResizeObserver leaf); surface tone; padding default canvas pad; `hasSafeArea`; exports `POST_FORMATS` derived from tokens. |

### 9.5 Why the 16 handoff-derived components are in the system

Each is presentational, content-agnostic, and appears on ≥2 handoff surfaces (or is an organism the
design system implies but never drew): ChoiceCard (plates, lengths, dawats, platters, services,
trial, decide list), CheckCard (2), ChipGroup (≥8 calculator groups + segmented toggles), Slider (2),
Countdown/AnnouncementBar (every page header), KeyValueList (box, rules, contact, customs, quote
lines), Steps (3 pages), FeatureItem (4 sections), PricingCard (plates ×3 pages, dawats, office),
LinkCard (Home doors, About CTAs), StickyActionBar (2 calculators), Table (5 tables), QuotePanel (3
calculators), ReviewCarousel (4 pages), ActionDock (every page). Page-specific compositions (day
menu card, delivery-zone checker, FAQ help-card content, calculators' logic) stay in the web app
(promotion ladder, handbook 02 §3).

### 9.6 Non-component exports

`RevealObserver` (client, §3.2.4) · `InstagramGlyph`/`YoutubeGlyph`/`LinkedinGlyph` · `POST_FORMATS` ·
types (`IconComponent`, variant unions) · `styles.css`.

---

## 10. Storybook — the Design System tab

### 10.1 Structure (sidebar order = the design system's tab groups)

| Group                                   | Contents (source → page)                                                                                                                                                                                                                                            | Lives in                   |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Introduction                            | What the system is, how to consume it (§6.5 contract), rules for authors                                                                                                                                                                                            | `apps/storybook/src/docs/` |
| Brand                                   | Logo (`brand-logo`, `brand-wordmark`, `brand-symbol`, `mark-legibility`), Pattern (`brand-pattern`, `diamond-motif`), **Company details** (`brand-company`, bound to `packages/content` brand, nulls flagged), Voice & content (readme §2), Iconography (readme §4) | `apps/storybook`           |
| Colors                                  | Primary, Ink, Accents, Heat, Semantic, Surfaces (live `data-surface` demos), Status, **Contrast** (matrix computed from `tokens.json` with pass / declared exception)                                                                                               | `apps/storybook`           |
| Type                                    | Display, Headings, Body, Overline & Mono, Devanagari, Fluid                                                                                                                                                                                                         | `apps/storybook`           |
| Spacing                                 | Scale, Layout rhythm                                                                                                                                                                                                                                                | `apps/storybook`           |
| Layout                                  | Breakpoints, AutoGrid, Radii, Borders, Elevation (depth ladder), Card anatomy, utility-class map                                                                                                                                                                    | `apps/storybook`           |
| Motion                                  | Motion, States, Form states, Section reveal                                                                                                                                                                                                                         | `apps/storybook`           |
| Marketing                               | Canvas formats, Canvas type, + the marketing kit artboards (Feed: OfferPost, DishLaunchPost, StatementPost, CarouselSlide; Ads: OfferStory, DishStory, LinkBanner, Leaderboard, Mpu)                                                                                | `apps/storybook`           |
| Atoms / Molecules / Organisms / Layouts | One story file per component (§10.2)                                                                                                                                                                                                                                | `packages/ui/src/**`       |
| Website                                 | The website kit page (`ui_kits/website`: header, hero, menu, story, stats, reviews, outlets, FAQ, CTA, footer + toast and book-a-table dialog)                                                                                                                      | `apps/storybook`           |
| App                                     | The app kit screens at 390×844 (Home, Menu, Item sheet, Cart, Tracking, Account)                                                                                                                                                                                    | `apps/storybook`           |

The 33 `guidelines/*.card.html` all map to a page above (Brand 7, Colors 7, Type 6, Spacing 2,
Layout 6, Motion 3, Marketing 2); none is dropped. Foundation pages read
values from `@pink-paprikaa-web/design-tokens/tokens.json` — never retyped. Docs-only helpers
(Swatch, TypeSpecimen, TokenTable, ContrastMatrix) live in `apps/storybook`, not in the system.

**Kit copy rule:** kits keep the design system's layouts, but bind **real** facts (brand module) and
**real** reviews (the four verified Google reviews from the handoff) — no fabricated testimonials
(the website kit's "Aditi Rao / Kabir Shah / Meera Iyer" are invented and are replaced). Kit pages
are badged "Reference kit — not production copy".

### 10.2 Component stories

- **Card parity:** each component's stories reproduce every row of its design-system `.card.html`
  (variant × size × tone × state), labelled with the prop that produces it, plus a `Playground`
  story with controls.
- **Docs:** the `.prompt.md` usage note becomes the component's docs description (verbatim where it
  is guidance; adjusted where §8.2 renamed a prop). Props tables from `react-docgen-typescript`.
- **Surfaces:** components with surface-aware skins get a `OnSurfaces` story (page, alt, brand, ink,
  soft).
- **Interaction:** every client component gets `play` functions (keyboard + pointer) run by
  `@storybook/addon-vitest`.
- Viewports: the existing 360 / 480 / 768 / 1024 / 1280 / 1440 set; backgrounds are token references.

### 10.3 Configuration changes

`apps/storybook/.storybook/main.ts` stories globs add `../src/**/*.mdx` and `../src/**/*.stories.tsx`;
`preview.tsx` imports fonts (7.5) and `./styles.css` (the §6.5 consumer contract), sets
`options.storySort` to the group order above, and replaces the blanket `color-contrast` OFF comment
with the §5.4 policy. `apps/storybook/package.json` adds `@pink-paprikaa-web/content` and
`@pink-paprikaa-web/design-tokens` deps.

---

## 11. Quality gates

### 11.1 Per component (definition of done for each)

1. `<name>.tsx` in the correct layer; canonical shape (§8.1).
2. `<name>.test.tsx`: renders; each variant's observable behaviour asserted by role/label; keyboard
   paths for interactive ones; `expectNoA11yViolations` on the default and the most complex state.
3. `<name>.stories.tsx`: card parity (§10.2).
4. Exported from `src/index.ts`; any new visual value added as a token first.
5. Gate: `pnpm nx test ui && pnpm nx lint ui && pnpm nx run storybook:build`.

### 11.2 New or tightened gates (each probe-verified at introduction — handbook 06 §4)

| Gate                                                                                                                                                                                                                                                                  | Where                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Contrast policy test (§5.4)                                                                                                                                                                                                                                           | `design-tokens:test`                           |
| `tailwindcss/no-arbitrary-value: error` (bans `text-[13px]`, `bg-[#…]`)                                                                                                                                                                                               | `packages/ui` lint                             |
| `tailwindcss/no-custom-classname: error` against `src/styles.css`                                                                                                                                                                                                     | `packages/ui` lint                             |
| atomic-layering: `templates` → `layouts`; atoms may import only `atoms/icon` + `lib`                                                                                                                                                                                  | `tools/eslint-config`                          |
| naming-convention `warn` → `error` (drift ledger P-08)                                                                                                                                                                                                                | `tools/eslint-config`                          |
| No hex/rgb literals in `packages/ui/src/**/*.css` (spec test)                                                                                                                                                                                                         | `ui:test`                                      |
| Founder guard also scans `apps/storybook/storybook-static`                                                                                                                                                                                                            | `scripts/check-founder-names.mjs`, CI `guards` |
| Brand facts schema: two-`a` literal, GSTIN/FSSAI formats                                                                                                                                                                                                              | `content:test`                                 |
| `prettier-plugin-tailwindcss` class order (D18); `tailwindcss/classnames-order` off                                                                                                                                                                                   | `nx format:check`, lint-staged                 |
| RHF compatibility: the "React Hook Form + Zod" story's `play` submits invalid then valid input and asserts messages, focus-on-error and submitted values across Input, Select, Checkbox, Radio, ChoiceCardGroup, QuantityStepper (Controller), ChipGroup (Controller) | `storybook:test`                               |

### 11.3 Repo baseline repairs (today red, required for "done")

1. `.prettierignore` += `zip-files/` (482 unformatted files make `format:check` fail today).
2. CI `verify` job installs Playwright Chromium before `storybook:test` runs.
3. `blog:lint` on a fresh checkout (`.content-collections/generated` missing) — make lint depend on
   the generation step, so CI's first run is green.

### 11.4 Visual parity review

For each tier, the design-system cards are served locally (`npx serve` over the zip folder) and
screenshotted next to the matching Storybook stories at 360 and 1280. Differences are either fixed
or listed with a reason in the tier's PR notes (expected: font rasterisation only). This is review
evidence, not an automated pixel gate.

### 11.5 Final gauntlet

`/pre-merge` (handbook 08 §9) cold: `format:check`, `sync:check`, `verify:all --skip-nx-cache`,
`storybook:build`, `storybook:test`, `design-tokens:test`, founder guard, frozen-lockfile install.

---

## 12. Repository changes

**Delete:** `packages/ui/src/{atoms,molecules,organisms,templates,docs,lib,assets}/**`,
`packages/ui/src/styles.css`, `packages/ui/src/index.*`, `packages/ui/.babelrc`,
`packages/design-tokens/tokens/*.json`, `packages/content/src/lib/content*` and
`packages/utils/src/lib/utils*` placeholders.

**Create/replace:** everything in §6–§10; `packages/ui/AUTHORING.md` rewritten as the binding
contract (§8 condensed + token rules + story rules); `apps/storybook/src/**` (foundations, kits,
docs helpers); `apps/storybook/README.md` (the a11y section rewritten to §5).

**Dependencies added (via `pnpm add`, never hand-typed):** `prettier-plugin-tailwindcss` (root, dev);
`zod` (`packages/content`); `@fontsource/poppins`, `@fontsource/dm-sans`, `@fontsource/space-mono`,
`react-hook-form`, `@hookform/resolvers`, `zod` (`apps/storybook`, dev). **Not added:** `motion` (D15).

**Edit:** `tools/eslint-config/{atomic-layering,base,react}.js` (§11.2); `.prettierrc` (plugin +
`tailwindStylesheet` + `tailwindFunctions`, D18); `.prettierignore`;
`.github/workflows/ci.yml` (§11.3); `scripts/check-founder-names.mjs` + root `guard:founder`
script path list; `.claude/commands/new-component.md` (fix the stale `axe` call and `tv()` wording;
add card-parity + token-first steps); handbook 02 (layouts tier, `lib/`), 03 (canonical excerpt =
§8.1, surfaces, `asChild`, render-prop Field, native-first), 04 (prop translation table), 06 (gate
registry), 09 (decision log D1–D18 + drift-ledger closures); architecture spec §8 amendment + §15
Phase 1 progress row; `CLAUDE.md` current-state facts (branch `dev`/`feat/design-system`, `origin`
is configured, `main` holds the live site — the "no remote / feat/phase-0-foundation" text is stale).

**Untouched:** apps `web`/`blog` source (step 2), `packages/seo`, `tools/image-pipeline`,
`tools/typescript-config`, `zip-files/` (reference material, read-only).

---

## 13. Delivery sequence (for the implementation plan)

Each stage ends green (`pnpm verify`) and is committed separately.

1. **Baseline** — §11.3 repairs; delete the old system; stub `ui`/`design-tokens` so the workspace
   still builds.
2. **Tokens** — primitive → semantic → surface → component token files; `sd.config.mjs`;
   `theme.css`/`surfaces.css`/`tokens.json`; contrast policy test (probe: a failing pair).
3. **Library core** — `styles.css` base layer/utilities/keyframes; `componentVariants`; test setup;
   lint gate changes (each probed); `prettier-plugin-tailwindcss` (D18) + one repo-wide format pass
   committed alone; fonts + consumer contract proven in Storybook.
4. **Utils + brand facts** — formatters; brand schema/data/lines + tests.
5. **Brand assets** — logo artwork, symbol/pattern data URI, brand glyphs.
6. **Atoms** (30) → 7. **Layouts** (7, needed by later stories) → 8. **Molecules** (38) → 9. **Organisms** (15) — each component per §11.1, grouped into reviewable batches; tier parity
   review (§11.4) at the end of each tier.
7. **Foundations docs** — the 13-group Storybook IA, all 33 guideline pages, Contrast page.
8. **Kits + form pattern** — Website, App, Marketing page stories; the React Hook Form + Zod story (D17).
9. **Docs & gauntlet** — AUTHORING, handbook, decision log, architecture §15, CLAUDE.md; `/pre-merge`.

---

## 14. Owner inputs outstanding

| Item                                    | Blocks                                                         |
| --------------------------------------- | -------------------------------------------------------------- |
| C3 founding year (2025?)                | Brand facts `established`                                      |
| C10 do egg-containing items exist?      | Content use of `DietMark egg`                                  |
| Outlet hours/maps URL; bank/UPI details | Company details page completeness (shown as "Owner to supply") |
| YouTube / LinkedIn URLs confirmed live  | Footer social in step 2                                        |
| Photography                             | Step 2 (placeholders labelled per slot until then)             |

---

## 15. Risks & known costs

1. **Size.** 90 components × (component + test + stories) plus 33 foundation pages is the largest
   single phase so far; the plan batches it by tier with per-batch review so failures stay local.
2. **Pixel parity vs token discipline.** A few handoff grid minimums snap to the AutoGrid scale
   (≤20px track difference → column-change points move by ≤60px viewport). Accepted and documented.
3. **`<details name>` exclusivity** degrades to multi-open on browsers older than Chrome 120 /
   Safari 17.2 / Firefox 130 — acceptable (content still reachable).
4. **Contrast exception** is a conscious AA deviation for one pair; it is visible (Contrast page),
   tested (never below 3.0), and reversible by one token change if the owner revisits D3.
5. **Tailwind v4 CSS-import resolution** of `@pink-paprikaa-web/ui/styles.css` (with nested
   `@import`/`@source`) is proven in Storybook in stage 3 before any component depends on it.

---

## 16. Carried forward from the (superseded) August product spec

Only what does not conflict with the latest material and still has value. Everything else in that
spec — its route list (`/offers`, `/corporate`, `/gallery`, `/blog`, 11 `/menu/[category]` pages),
offer strip, three-kitchen hours table, superlative ban, emoji-in-CTA allowance — is dropped.

**Applies to this design system (step 1):**

| Item                                                                                                          | Where it lands                                                     |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Founder-identity ban (conflict-of-interest; already a CI guard)                                               | Brand facts test (§7.3) + guard over the Storybook build (§11.2)   |
| Baseline a11y list: skip link, one `h1` per page, real `<label>`s, keyboard-operable controls, reduced motion | §5.5 (SiteHeader gets a skip-link slot; `headingLevel` everywhere) |

**Handed to the web-app spec (step 2) — recorded so they are not lost:**

| Item                                                                                                                                                                                                                                               | Why it still matters                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Real restaurant menu**: 207 dishes, 11 categories, 37 with Half/Full or filling variations, highlights (Best Seller 34, Chef Special 16, Spicy 14) — `…/Sales & Menu Engineering/menu/parsed/new-offline-menu.csv` (iCloud)                      | The handoff `/menu` is sample data ("real menu to come"); the real data already exists. Needs a one-off typed transform and `MenuItemRow` price variations. |
| Dine-in price note ("delivery apps price differently")                                                                                                                                                                                             | Menu prices are dine-in; online prices differ.                                                                                                              |
| **Petpooja cannot be iframed** (`X-Frame-Options: SAMEORIGIN`, tested); order links open in a new tab; `pinkpaprikaa.petpooja.com/orders/menu` returns HTTP 500 — never link it                                                                    | Handoff's `links.orderOnline` is a TODO; the working target is `order.pinkpaprikaa.com` (301 to Petpooja).                                                  |
| Redirects: the two Petpooja subdomain 301s (already in `apps/web/public/_redirects`) + old-URL 301s `/index.html`→`/`, `/about.html`→`/about`, `/menu.html`→`/menu`, `/contact.html`→`/contact`, `/policies.html`→**`/legal`**                     | Preserves existing rankings on the live site's URLs.                                                                                                        |
| Structured data: `Restaurant`/`LocalBusiness` (+ FSSAI), `Menu`/`MenuSection`/`MenuItem` with `suitableForDiet: VegetarianDiet`, `FAQPage`, `BreadcrumbList`, `Organization`; generated sitemap + robots; route-derived canonicals; owned OG image | Handoff asks for JSON-LD but hard-codes it; generate it from the same data that renders the page.                                                           |
| Performance budgets (already LAW in `.lighthouserc.json`) + image rules: ≤200 KB per image, AVIF/WebP ladder, explicit width/height, lazy below the fold, `fetchpriority="high"` on the hero only                                                  | Handoff photos are 2.2–6.4 MB PNGs (`boxes-packed.png`, `classic-thali.png`); the pipeline exists (`tools/image-pipeline`).                                 |
| Time-bound content re-checked in the client, never only at build                                                                                                                                                                                   | The handoff's launch banner, seal and offer copy never disappear after `2026-10-31`; a static page cached past expiry must hide them.                       |
| Map iframe mounts only when scrolled into view                                                                                                                                                                                                     | Heaviest third-party request on Contact.                                                                                                                    |
| Content-integrity gate: schema violation, empty alt text, broken internal link or missing asset fails the build                                                                                                                                    | Deferred Phase-0 gate; the web app is where content lands.                                                                                                  |
| Policies "last updated" from a real date, not a hand-typed string                                                                                                                                                                                  | Legal page.                                                                                                                                                 |
| Meta Pixel (already installed, two gates — `docs/analytics/meta-pixel.md`) + `Contact` events on WhatsApp clicks carrying the page tag                                                                                                             | The handoff asks for "analytics events on WhatsApp clicks (carry the page tag)"; the Pixel is the existing channel.                                         |
| Capture the Google Business Profile trailing-28-day direction-request baseline before cutover                                                                                                                                                      | The only success metric that cannot be measured after the fact.                                                                                             |
