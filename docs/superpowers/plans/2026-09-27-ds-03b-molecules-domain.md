# Design System — Plan 3b of 5: Molecules (domain, marketing, handoff patterns)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the 20 molecules that carry the restaurant's domain and marketing language — the nine design-system molecules (MenuItemRow, MenuItemCard, OutletCard, ReviewCard, LoyaltyCard, FilterBar, LogoLockup, OfferSeal, CouponTicket) and the eleven handoff-derived patterns (ChoiceCardGroup, CheckCard, ChipGroup, KeyValueList, Steps, FeatureItem, PricingCard, LinkCard, StickyActionBar, AnnouncementBar, Table) — each with component tokens, a behaviour + axe test, card-parity stories and a public export.

**Architecture:** Every molecule is a React 19 function component in `packages/ui/src/molecules/<kebab>/<kebab>.tsx`, composed only from atoms, `lib/*` and packages. Classes come from one `componentVariants` slots table per component (token utilities only); any value off the base scales becomes a component token in `packages/design-tokens/tokens/component/<name>.json` first. Server-first: only FilterBar and ChipGroup (Radix ToggleGroup) are client components; CouponTicket and AnnouncementBar are server components with one tiny client leaf each. Native inputs (ChoiceCardGroup, CheckCard) stay `react-hook-form` `register()`-compatible; value controls (ChipGroup, FilterBar) expose `value` / `onValueChange` / `name` / `onBlur` for `<Controller>`.

**Tech Stack:** Nx 23 · pnpm 10 · React 19.2 · TypeScript 6 · Tailwind 4.3 · tailwind-variants 3.3 / tailwind-merge 3.6 · radix-ui 1.6.7 (`ToggleGroup`, `Slot`) · lucide-react 1.30 · Vitest 4 + Testing Library + user-event 14 + axe-core · Storybook 10.5 (`storybook/test`).

**Spec:** `docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md` — §4 (C10 pure veg), §5 (contrast balance), §6 (tokens), §8 (rules, §8.2 prop translation), §9.2 (the rows for these 20), §9.5, §10.2 (stories), §11.1 (definition of done), D17 (react-hook-form).

**Contracts:** `docs/superpowers/plans/2026-09-27-ds-00-contracts.md` — this plan **implements §6** and **consumes §1–§5**. Every departure is listed in "Contract deviations" below with its reason.

**Depends on:** Plan 1 (foundation: tokens, `componentVariants`, `styles.css` utilities, `expectNoA11yViolations`, Icon, Logo, `formatRupees`), Plan 2a (atoms incl. `Tag`/`tagVariants`, `Button`, `Card`, `Badge`, `Link`, `ImageSlot`, `Avatar`, `StatusDot`; `lib/heading.ts`, `lib/link-as.ts`), Plan 2b (atoms incl. `DietMark`, `SpiceLevel`, `PriceTag`, `Rating`, `ProgressBar`, `Countdown`, `Checkbox`), Plan 2c (layouts incl. the AutoGrid `min` scale), Plan 3a (molecules; `molecules/` folder conventions). All five must be merged before Task 0.

## Global Constraints

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

**Tier rules for this plan (molecules):**

- A molecule imports only `../../atoms/<name>/<name>`, `../../lib/<name>`, and packages (`react`, `radix-ui`, `lucide-react`, `@pink-paprikaa-web/utils`). **Never `layouts/` or `organisms/` — not even `import type`** (core `no-restricted-imports` flags type imports too). The one same-tier import is the shared `MenuItemImage` type from `../menu-item-row/menu-item-row` (contract §6 declares it there).
- **Every dish is vegetarian.** MenuItemRow and MenuItemCard always render `DietMark` and have **no `diet` prop** (spec C10); a test pins that `diet` does not compile.
- **Prices render through `PriceTag` or `formatRupees`** (`@pink-paprikaa-web/utils`) — never a hand-built `"₹" + n`. Story fixtures format with `formatRupees` too.
- **No hard-coded copy** — content arrives as props. The only strings inside components are the documented defaults listed in each task's Interfaces (placeholder labels, status words, accessible text such as the visually hidden "Was").
- **Surfaces are CSS, never props** (D5). A component that paints its own field sets `data-surface` itself (white cards → `light`). Surface-dependent component tokens are overridden in `tokens/surface/<surface>.json` **and restored in `tokens/surface/light.json`** (the design-tokens `theme.spec.ts` fails otherwise).
- Body copy snaps to the type ramp: `text-body` 16px, `text-body-sm` 14px, `text-caption` 12.5px (the handoff's 13/15px running text maps to the nearest step). Titles, prices and display numbers that sit off the ramp get component typography tokens.
- **Reuse Plan 2a / 2b internals, never re-draw them:** `OnSurfaces` (`lib/story-surfaces.tsx`) for every `OnSurfaces` story; `tagVariants` (whose root carries `controlStates`) for ToggleGroup items; the `transition-control` utility for selectable cards; `fakeRegister(name)` (`vitest.setup.ts`) to prove `{...register("field")}` reaches a native control.
- **Measures:** `max-w-text-measure-prose` (64ch) and `max-w-text-measure-narrow` (44ch) — never Tailwind's static `max-w-prose`, which is 65ch and shadows the token.
- **Slot:** `const Component: ElementType = asChild ? Slot.Root : "a"`; classes go on the component, never on the slotted child (Slot joins child classes without tailwind-merge).
- **Tests never read files.** If one ever must, build the path with `join(import.meta.dirname, "…")` from `node:path` — never `new URL("…", import.meta.url)`, which Vite rewrites to an `http://localhost` URL under jsdom (ruling R15).
- **Client boundary:** `"use client"` appears only in `filter-bar.tsx`, `chip-group.tsx`, `coupon-copy-button.tsx` and `announcement-expiry.tsx`. Everything else is server-safe: no hooks except `useId`, and an event handler is attached only when the consumer supplied one.
- Six lint/runtime facts that break naive code here — design them in, do not discover them in the gate:
  1. `exactOptionalPropertyTypes` is on, and **ruling R13** applies: every optional custom prop is declared `name?: T | undefined` (as React's DOM props are), so a molecule forwards a possibly-`undefined` value straight to an atom (`was={was}`). The two places that still need a conditional spread are a `componentVariants` call (`{...(keyWidth === undefined ? {} : { keyWidth })}`) and a Radix prop declared without `| undefined` (ToggleGroup's `disabled` — give it a defaulted boolean).
  2. `@typescript-eslint/no-confusing-void-expression`: event handlers use block bodies — `() => { setOpen(true); }`, never `() => setOpen(true)`.
  3. `@typescript-eslint/restrict-template-expressions`: numbers in template literals go through `String(n)`.
  4. `react-hooks` (compiler rules): no `setState` synchronously inside an effect body, no `Date.now()` in the component body.
  5. The base layer gives every `<p>` `margin-bottom: 16px` and `max-width: 64ch` (Plan 1 `styles.css`). Every `<p>` in a molecule sets `m-0` (or its own margins) and `max-w-none` / its own measure.
  6. `perfectionist/sort-imports` and `sort-named-imports` are auto-fixable — run `pnpm nx lint @pink-paprikaa-web/ui --fix` before the gate; `prettier --write` sorts Tailwind classes (D18).

## Review Focus

The five ways these molecules fail real guests. Each is pinned by a test in its owning task — the reviewer checks the test exists and would fail against the naive implementation.

1. **ChipGroup `maxSelected`** (starter "pick 3") — a keyboard user must never be able to exceed the limit, and the chips that became unavailable must say why (focusable `aria-disabled` chips + a live status line the group is described by). Owned by **Task 12**: test _"never lets a keyboard user pick more than maxSelected, and says why the rest are unavailable"_.
2. **AnnouncementBar after `endsAt`** — the handoff's launch strip never disappears. Ours renders **nothing** after expiry (no empty padded strip pushing the header down), including when it expires while the page is open. Owned by **Task 19**: tests _"renders nothing once endsAt has passed"_ and _"disappears the moment it expires while the page is open"_, story `Expired` play.
3. **Table at 360px** — the price matrix must scroll horizontally inside a visible, **keyboard-focusable, named** scroll region, with header cells still associated (`th scope`), never squashing columns or scrolling the page. Owned by **Task 20**: test _"wraps a wide table in a named, focusable scroll region"_ and story `ScrollsAt360` play (real layout in Chromium).
4. **PricingCard with a very long plate name** — the name wraps inside the card; the tag wraps below it; nothing overflows the card at 360px. Owned by **Task 16**: test _"lets a very long plate name wrap instead of widening the card"_ and story `LongName` play (measures overflow in Chromium).
5. **OfferSeal bled off a corner** — the counter-rotated value reaches 0.32 × side from the centre, so bleed beyond 0.18 × side clips the most important thing on the board. Ours can only bleed 1/12 or 1/6 of the side (≤ 0.18 by construction). Owned by **Task 8**: test _"never bleeds a corner further than 0.18 × its side"_ and story `BleedOffCorner` play (the value's box stays inside the frame).

## Contract deviations

Recorded against `2026-09-27-ds-00-contracts.md` §6. Additive unless stated.

| #   | Component       | Contract                                                                                  | This plan                                                                                                                                                                                                                                                                                       | Why                                                                                                                                                                                                                                                                                                 |
| --- | --------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | ChoiceCardGroup | `min?: AutoGridMin` (type from layouts); fieldset props incl. `ref`, `onChange`, `onBlur` | `min?: ChoiceGridMin` — the same six-step union restated locally; `ref?: Ref<HTMLInputElement>`, `onChange?: ChangeEventHandler<HTMLInputElement>` and `onBlur?: FocusEventHandler<HTMLInputElement>` are attached to **every radio**; adds `layout?: "tile" \| "row"` (= `"tile"`).            | A molecule may not import layouts, even a type. RHF's `register()` must see each radio (focus-on-error, reset), which a fieldset ref cannot give. The handoff has two card anatomies: stacked tiles (plates, lengths) and full-width rows with the price at the end (trial, services, decide list). |
| 2   | Table           | `highlightColumn?: number` on `Table`                                                     | `isHighlighted?: boolean` on `TableHeaderCell` and `TableCell`; `minWidth` defaults to `"none"`; `className` lands on the scroll frame; `TableHeaderCell scope="row"` renders as a row header.                                                                                                  | A column index needs React context (not server-safe) or nth-child selectors (arbitrary variants). The consumer already maps cells by index, so marking the cell is explicit and zero-JS. The price matrix also highlights a single cell, not a column.                                              |
| 3   | PricingCard     | `tag?: ReactNode`                                                                         | adds `badge?: ReactNode` — a marker centred on the card's top edge ("Our recommendation"); `tag` sits beside the name.                                                                                                                                                                          | The handoff uses both placements (Home: inline tag; Homely Meals: floating badge). Two slots with fixed placements beat one slot with a placement switch.                                                                                                                                           |
| 4   | KeyValueList    | `density`, `keyWidth`, `hasDividers`                                                      | adds `emphasis?: "value" \| "key"` (= `"value"`). Without `keyWidth` the row is a split row (key at the start, value at the end).                                                                                                                                                               | "Your box" mutes the key; the booking rules and customisations lead with a strong key. The price lists align values to the end.                                                                                                                                                                     |
| 5   | ChipGroup       | `name`, `disabled`, union by `type`                                                       | adds `onBlur?: () => void` and, for `type="multiple"`, `getLimitMessage?: (selected, max) => string`; a single group never deselects; chips blocked by `maxSelected` are focusable `aria-disabled`, not natively disabled; `name` renders hidden inputs.                                        | D17 requires `onBlur` for `<Controller>`. The limit must be announced (Review Focus 1). A single chip group is a required choice (Lunch / Dinner / Both).                                                                                                                                           |
| 6   | FilterBar       | —                                                                                         | pressing the selected filter keeps it selected.                                                                                                                                                                                                                                                 | Design system: "Exactly one option is selected at a time." Radix single groups clear on a second press.                                                                                                                                                                                             |
| 7   | OfferSeal       | `size` `sm \| md \| lg \| xl` with "xl = 156px handoff hero"; `bleed` clamped at runtime  | `sm` 110px (design-system card, display ads) · `md` 156px (handoff hero) · `lg` 260px (design-system default) · `xl` 360px (feed post); bleed `sm` = 1/12 and `md` = 1/6 of the side, fixed by the type; label and note keep the full tone colour (no 85%/70% opacity); `label` has no default. | Sizes must ascend and cover the real usages (kit 110/360, handoff 156, DS 260). An enum bleed makes the 0.18 clamp a compile-time guarantee. 70% opacity drops the note below AA.                                                                                                                   |
| 8   | CouponTicket    | `notch?: "page" \| "tint" \| "sunken"`                                                    | adds `"brand"`; adds `codeLabel` (= "Use code"), `copyHint` (= "Tap to copy"), `copiedLabel` (= "Copied"); a refused clipboard write selects the code instead of claiming "Copied".                                                                                                             | The marketing kit puts a light ticket on a pink field (`notchColor: var(--pink-500)`). Copy arrives as props (D9). The design system reports success even when the copy failed.                                                                                                                     |
| 9   | AnnouncementBar | "C (expiry)"                                                                              | The bar is a **server** component; only `announcement-expiry.tsx` (the expiry gate) is a client leaf.                                                                                                                                                                                           | Keeps `linkAs={NextLink}` usable from a server layout and ships ~20 lines of JS instead of the whole bar.                                                                                                                                                                                           |
| 10  | ReviewCard      | `isVerified` ("Verified on Google" chip)                                                  | adds `verifiedLabel?: string` (= "Verified on Google") and `hasAvatar?: boolean` (= `true`).                                                                                                                                                                                                    | No copy inside the system (D9). The handoff's Google reviews carry no avatar; the design-system card does.                                                                                                                                                                                          |
| 11  | LoyaltyCard     | `visits`, `goal`, `reward`, `variant`                                                     | adds `headline?: ReactNode`; the generated sentence ("3 more visits and chai is on us.") is the documented default; invalid `goal`/`visits` throw `RangeError`.                                                                                                                                 | Design-system behaviour kept (pluralisation is the component's job) while letting content override it.                                                                                                                                                                                              |
| 12  | LogoLockup      | `size` enum                                                                               | `sm` 200 · `md` 240 · `lg` 280 · `xl` 360 px wide; clear-space padding = width ÷ 6 (the "P" height, calibrated in Task 7); default `tone="white"` (design system).                                                                                                                              | Widths are the kits' real sizes snapped to the 4px scale; 200 is the lockup minimum.                                                                                                                                                                                                                |
| 13  | MenuItemCard    | "floating `action` slot; `asChild`/`href`"                                                | `href` + `linkAs` make the **name** a stretched link covering the card; the card lifts only when it is a link; no `asChild`.                                                                                                                                                                    | A card that is a link and also holds an Add button would nest interactive elements; the stretched link keeps them siblings. A lift on a non-link promises a click that does nothing.                                                                                                                |
| 14  | FeatureItem     | Source list includes "Home trust cards"                                                   | The Home trust cards are not a FeatureItem usage: they are three bespoke cards (a DietMark, a mono licence number, a link) composed in the web app from `Card` + `Icon`.                                                                                                                        | Their marks and layout (icon above title, no tile) differ from the tile pattern; promoting them would need a second anatomy for one section.                                                                                                                                                        |
| 15  | KeyValueList    | Source list includes "Contact rows"                                                       | Contact rows are `ListRow` (Plan 3a: icon + title, link rows via `asChild`).                                                                                                                                                                                                                    | An address or a phone number is not a term/definition pair; the rows are links.                                                                                                                                                                                                                     |
| 16  | (tokens)        | —                                                                                         | New semantic token `shadow.selected` (`inset 0 0 0 1px` brand pink) shared by ChoiceCardGroup and CheckCard.                                                                                                                                                                                    | "Selected" doubles a 1px brand border to 2px without moving layout; it is one state treatment for every selectable card, so it is semantic, not per component.                                                                                                                                      |
| 17  | OutletCard      | no `href`                                                                                 | adds `href?: string \| undefined` and `linkAs?: LinkAs \| undefined`: the name becomes a stretched link over the card, which lifts only then; the `action` sits above the link (`z-raised`).                                                                                                    | Spec §9.2's OutletCard row lists `href` (§8.2: navigation `onClick` → `href`); dev parity (contracts §0.0) — the dev OutletCard is a linkable card. Same anatomy as MenuItemCard (deviation 13).                                                                                                    |
| 18  | LogoLockup      | `tone`, `size`, `hasTagline`, `align`                                                     | adds `isDecorative?: boolean \| undefined` (= `false`), passed to `Logo`.                                                                                                                                                                                                                       | Dev parity (contracts §0.0): artwork that already names the brand in nearby text must not announce it twice. `LogoLockupProps` extends `div` props, whose `title` is the HTML attribute, so the switch is a boolean.                                                                                |

**Cross-plan notes (for the controller).** (1) OfferSeal's `xl` is the 360px feed-post seal, which is what Plan 5's marketing kit passes (`size="xl"`, `bleed="md"`); Plan 4's HeroBanner Home story passes `size="xl"` for the 156px hero seal and should pass `size="md"`. (2) ChoiceCardGroup lives in `molecules/choice-card-group/choice-card-group.tsx` (file named after its export); Plan 5 Task 0's audit item A1 names `molecules/choice-card/`. (3) QuotePanel (Plan 4) renders its own money rows typed with `KeyValueItem` — the type is exported here unchanged.

---

## File map (this plan)

```
packages/design-tokens/
  tokens/component/{menu-item,offer-seal,coupon-ticket,choice-card,table,steps,feature-item,pricing-card,link-card,sticky-action-bar}.json   C
  tokens/semantic/shadow.json                        M  (shadow.selected — Task 10)
  tokens/surface/{ink,light}.json                    M  (feature-item tile — Task 15)
  contrast-pairs.json                                M  (Tasks 8, 10, 20)
packages/ui/src/
  lib/component-variants.ts                          M  (TEXT / SPACING / SHADOW / RADIUS lists)
  molecules/menu-item-row/menu-item-row.{tsx,test.tsx,stories.tsx}        C
  molecules/menu-item-card/menu-item-card.{tsx,test.tsx,stories.tsx}     C
  molecules/outlet-card/outlet-card.{tsx,test.tsx,stories.tsx}           C
  molecules/review-card/review-card.{tsx,test.tsx,stories.tsx}           C
  molecules/loyalty-card/loyalty-card.{tsx,test.tsx,stories.tsx}         C
  molecules/filter-bar/filter-bar.{tsx,test.tsx,stories.tsx}             C
  molecules/logo-lockup/logo-lockup.{tsx,test.tsx,stories.tsx}           C
  molecules/offer-seal/offer-seal.{tsx,test.tsx,stories.tsx}             C
  molecules/coupon-ticket/{coupon-ticket,coupon-copy-button}.tsx, coupon-ticket.{test,stories}.tsx   C
  molecules/choice-card-group/choice-card-group.{tsx,test.tsx,stories.tsx}   C
  molecules/check-card/check-card.{tsx,test.tsx,stories.tsx}             C
  molecules/chip-group/chip-group.{tsx,test.tsx,stories.tsx}             C
  molecules/key-value-list/key-value-list.{tsx,test.tsx,stories.tsx}     C
  molecules/steps/steps.{tsx,test.tsx,stories.tsx}                       C
  molecules/feature-item/feature-item.{tsx,test.tsx,stories.tsx}         C
  molecules/pricing-card/pricing-card.{tsx,test.tsx,stories.tsx}         C
  molecules/link-card/link-card.{tsx,test.tsx,stories.tsx}               C
  molecules/sticky-action-bar/sticky-action-bar.{tsx,test.tsx,stories.tsx}   C
  molecules/announcement-bar/{announcement-bar,announcement-expiry}.tsx, announcement-bar.{test,stories}.tsx   C
  molecules/table/table.{tsx,test.tsx,stories.tsx}                       C
  index.ts                                           M  (one export block per task)
```

## The per-task gate

Every component task ends with this exact sequence (the `<paths>` are the files the task created or changed):

```bash
pnpm exec prettier --write <paths>
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache --outputStyle=static
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: every target succeeds; the ui test summary includes the new test file with 0 failures; Storybook builds with the new `Molecules/<Name>` stories. Tasks that own a Review Focus item also run their story tests in Chromium (`pnpm nx test @pink-paprikaa-web/storybook -- <kebab-name>`). Paste the summary lines in the report.

---

### Task 0: Reconcile with the code as built

Plans 2a, 2b, 2c and 3a were written in parallel against the contracts and executed before this one. Before any component is written, confirm every interface this plan consumes exists exactly as the code below assumes, and patch the later tasks to reality. **This task changes no files and has no commit**; its report is the patch list the controller applies when dispatching Tasks 1–21.

**Files:** none (read-only).

**Interfaces:**

- Consumes (must exist): `componentVariants` and the scale lists `TEXT`, `SPACING`, `SHADOW`, `RADIUS` in `lib/component-variants.ts`; `headingTag`, `type HeadingLevel` (`lib/heading.ts`), `type LinkAs`, `type LinkAsProps` (`lib/link-as.ts`), `OnSurfaces` (`lib/story-surfaces.tsx`), `controlStates` (`lib/control-states.ts`) and the `transition-control` utility — all Plan 2a Task 1; atoms `Avatar`, `Badge`, `Button`, `Card`, `Icon` (+ `type IconComponent`), `IconButton`, `ImageSlot`, `Link`, `Logo`, `StatusDot`, `Tag` + `tagVariants` (Plan 2a), `Countdown`, `DietMark`, `PriceTag`, `ProgressBar`, `Rating`, `SpiceLevel` (Plan 2b); the `autogrid-min-<step>` utility (Plan 2c Task 5); `expectNoA11yViolations` and `fakeRegister` in `packages/ui/vitest.setup.ts`.
- Produces: a written list of mismatches and the exact patch for each affected task.

- [ ] **Step 1: Confirm the dependency plans landed**

Run:

```bash
git log --oneline | head -80
ls packages/ui/src/atoms packages/ui/src/layouts packages/ui/src/molecules packages/ui/src/lib
```

Expected: the commits of Plans 1, 2a, 2b, 2c and 3a; the atom folders above; `lib/heading.ts`, `lib/link-as.ts`, `lib/story-surfaces.tsx`, `lib/control-states.ts`, `lib/symbol-mark.tsx`, `lib/field-status.ts`, `lib/space.ts`. If any is missing, **stop** and report — this plan cannot start.

- [ ] **Step 2: Read every consumed signature**

Run:

```bash
rtk proxy grep -n "^export" packages/ui/src/lib/{component-variants,heading,link-as,control-states}.ts packages/ui/src/lib/story-surfaces.tsx
for a in avatar badge button card countdown diet-mark icon icon-button image-slot link logo price-tag progress-bar rating spice-level status-dot tag; do
  echo "=== $a"; sed -n '/^export/,/^}/p' packages/ui/src/atoms/$a/$a.tsx | head -90
done
rtk proxy grep -n "autogrid-min\|transition-control" packages/ui/src/styles.css
rtk proxy grep -n "export function fakeRegister" packages/ui/vitest.setup.ts
```

Compare each against contracts §1–§4 and the facts below. Record every difference (a renamed prop, a missing variant, a different default).

- [ ] **Step 3: Check the facts this plan's code relies on**

Each was read from the finished Plans 2a / 2b / 2c; confirm it against the code. Write one line per fact: **holds** or **differs → patch**.

| #   | Fact assumed by the code below (source)                                                                                                                                                                                                                                                                                                                                                                      | Patch if it differs                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| a   | `tagVariants` (2a Task 8) is a slots instance: slots `root` (which already includes `controlStates()`, so `aria-disabled` gets the grey look and `pointer-events: none`) and `label` (`min-w-0 truncate`); variants `tone`, `isSelected`, `isInteractive`. FilterBar and ChipGroup call `tagVariants({ isSelected, isInteractive: true })`, render `<Icon size="sm">` then `<span className={tag.label()}>`. | Use the real slot/variant names. Never nest the `Tag` component inside a ToggleGroup item.                                      |
| b   | `Card` (2a Task 9): `padding` sm = `p-4` (16px), md = `p-5` (20px); root has `overflow-hidden`; `default`/`quiet` set `data-surface="light"`, `feature` → `soft`; `asChild` via `Slot.Root`.                                                                                                                                                                                                                 | Pick the step whose px is 16 (LoyaltyCard) / 20 (ReviewCard).                                                                   |
| c   | `autogrid-min-<step>` (2c Task 5) sets **only** `grid-template-columns` from `--spacing-grid-min-<step>`, so ChoiceCardGroup's `gap-2` stands; Steps' rule grid uses `grid gap-4 autogrid-min-md`.                                                                                                                                                                                                           | Use the real utility name.                                                                                                      |
| d   | `Rating` (2b Task 11): `size` sm 12 / md 16 / lg 24 with 16px the default; `variant` `"diamond" \| "symbol"`; named "5 out of 5".                                                                                                                                                                                                                                                                            | Pass the 16px step in Task 4; adjust the test's name.                                                                           |
| e   | `SpiceLevel` sm = 12px, `role="img"` named "Spice level 3 of 4"; `DietMark` sm = 14px, `role="img"` named "Vegetarian"; `ProgressBar` sm = 6px and prints its `label` unless `isLabelHidden`; `PriceTag` renders the struck `was` inside its root and **throws when `was` is not above `amount`** (every fixture here keeps `was` higher).                                                                   | Adjust the test assertions (tests assert text content, never markup).                                                           |
| f   | `ImageSlot` (2a Task 11): the placeholder is `role="img"` named by `label` with the label also visible; the image branch is an `<img alt>`; `className` merges onto the root.                                                                                                                                                                                                                                | Adjust MenuItemRow / MenuItemCard / OutletCard tests.                                                                           |
| g   | `Avatar` (2a Task 14) with `name` is `role="img"` showing two initials ("VK") and spreads `aria-hidden` onto its root.                                                                                                                                                                                                                                                                                       | Adjust Task 4's initials assertion.                                                                                             |
| h   | `Countdown` (2b) renders `<time dateTime={endsAt}>` in its own mono pill and accepts `toISOString()`'s `Z` as the offset (the stories and tests build `endsAt` that way).                                                                                                                                                                                                                                    | If `Z` is rejected, build `endsAt` with an explicit `+05:30` offset in Task 19's tests and stories.                             |
| i   | `Link` (2a Task 3): `size="sm"` and `isExternal` (target `_blank`, safe rel, arrow glyph).                                                                                                                                                                                                                                                                                                                   | Adjust ReviewCard.                                                                                                              |
| j   | **R13** — every optional atom prop is declared `?: T \| undefined`, so `was={was}`, `src={avatar}`, `label={countdownLabel}` compile under `exactOptionalPropertyTypes`.                                                                                                                                                                                                                                     | For any atom prop that still lacks `\| undefined`, write `{...(x === undefined ? {} : { x })}` at that call site and report it. |
| k   | `OnSurfaces({ children })` (2a Task 1) renders its children on page / alt / brand / ink / soft in a `flex flex-wrap` row per ground; `fakeRegister(name)` (2b Task 1) returns `{ name, onChange, onBlur, ref }` as `vi.fn()` spies.                                                                                                                                                                          | Use the real names.                                                                                                             |
| l   | Dev parity tables present on every ported-component task (contracts §0.0): Tasks 1–9 each carry a `**Dev reference:**` line and a `**Dev parity:**` table; Tasks 10–20 carry `**Dev reference:** none (handoff component)`.                                                                                                                                                                                  | Stop and report the task that lacks one; the controller adds it before dispatch.                                                |

- [ ] **Step 4: Confirm the baseline is green**

Run the per-task gate command (without the prettier and `--fix` lines). Expected: green. If it is red before this plan starts, stop and report the failing target.

- [ ] **Step 5: Report**

Report: the Step 3 table filled in, every Step 2 difference, and for each the task number and the exact replacement text. The controller applies them to the task texts before dispatch.

---

### Task 1: MenuItemRow

**Files:**

- Create: `packages/design-tokens/tokens/component/menu-item.json`
- Create: `packages/ui/src/molecules/menu-item-row/menu-item-row.tsx`, `menu-item-row.test.tsx`, `menu-item-row.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`), `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/menu-item-row/menu-item-row.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                    | Ruling  | Where, or the spec clause                                                                             |
| --------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| Dish name is a heading; price printed                                       | ALREADY | tests "names the dish…", "prints the price…"                                                          |
| `nameAs` picks the name element (incl. `"p"`)                               | ALREADY | `headingLevel` (spec §8.1 "Titled components take `headingLevel`"; contract §6 has no `nameAs`)       |
| `was` struck through (`<s>`)                                                | ALREADY | PriceTag owns the `<s>` (Plan 2b PriceTag test); this test asserts both prices                        |
| `diet` prop, veg default, `egg` mark; `DietMarks` story                     | DROP    | C10 (pure veg, no `diet` prop) — test "takes no diet prop" pins it                                    |
| Heat named for assistive tech                                               | ALREADY | test "shows the heat…" ("Spice level 3 of 4")                                                         |
| No heat scale on a dish without heat                                        | ADD     | test "renders no heat scale on a dish without heat"                                                   |
| Devanagari name `lang="hi"`; badge                                          | ALREADY | tests "marks the Devanagari…", "shows the heat, the badge…"                                           |
| `onAdd` → built-in Add button                                               | DROP    | spec §9.2 MenuItemRow: "`action` slot (replaces `onAdd`)"                                             |
| Add button's accessible name carries the dish ("Add Masala Fries")          | ADD     | `action` JSDoc; stories' `addButton(name)` sets `aria-label`; cross-plan: MenuList `renderItemAction` |
| No control on a menu that cannot take orders                                | ADD     | test "renders no control when the menu cannot take orders"                                            |
| Labelled placeholder until a photo; photo with its alt                      | ALREADY | test "labels the photo placeholder…"                                                                  |
| Hairline divider on / off                                                   | ALREADY | test "draws the hairline divider…"                                                                    |
| Caller `className` replaces the row's own padding                           | ADD     | test "lets a caller className replace its own padding"                                                |
| axe on the fullest state                                                    | ALREADY | last test                                                                                             |
| Thumbnail 80px at 360, 104px from `sm`                                      | ADD     | `thumbnail: "size-20 shrink-0 sm:size-26"`                                                            |
| `min-w-0` so a long name wraps instead of pushing the thumbnail off-screen  | ALREADY | `body: "min-w-0 flex-1"`, header `flex-wrap`; `Narrow` story play                                     |
| Stories `Default`, `WithDevanagariName`, `Discounted`                       | ALREADY | `Playground` / `Full`, `Devanagari`, `Discount`                                                       |
| Stories `AsAMenuSection`, `SpiceLevels`, `WithCustomAction`, `Narrow` (360) | ADD     | stories `AsAMenuSection`, `SpiceLevels`, `InCart`, `Narrow`                                           |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Badge` (`tone="soft"`), `DietMark` (`size="sm"`), `ImageSlot`, `PriceTag` (`size="sm"`), `SpiceLevel` (`size="sm"`), `headingTag`/`HeadingLevel`, `componentVariants`.
- Produces: `MenuItemRow`, `type MenuItemRowProps`, `type MenuItemImage` (contract §6). Documented default: `imageLabel = "Dish photo"`. No `diet` prop.

- [ ] **Step 1: Component tokens**

Create `packages/design-tokens/tokens/component/menu-item.json` (shared by MenuItemRow and MenuItemCard — one dish, two layouts):

```json
{
  "text": {
    "$type": "typography",
    "menu-item-name": {
      "$value": {
        "fontSize": "17px",
        "lineHeight": 1.3,
        "letterSpacing": "-0.005em",
        "fontWeight": "{font-weight.bold}"
      },
      "$description": "Dish name in MenuItemRow and MenuItemCard (design system 17 / 16.5px)."
    },
    "menu-item-devanagari": {
      "$value": { "fontSize": "15px", "lineHeight": 1.3, "fontWeight": "{font-weight.semibold}" },
      "$description": "Devanagari dish name set beside the Latin one."
    }
  }
}
```

In `packages/ui/src/lib/component-variants.ts`, append to `TEXT`: `"menu-item-name", "menu-item-devanagari",`.

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && rtk proxy grep -n "menu-item" packages/design-tokens/dist/theme.css`
Expected: `--text-menu-item-name: 17px;` with its three sub-properties, and `--text-menu-item-devanagari: 15px;`.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/menu-item-row/menu-item-row.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { MenuItemRow } from "./menu-item-row";

describe("MenuItemRow", () => {
  it("names the dish as a level-3 heading and always shows the vegetarian mark", () => {
    render(<MenuItemRow name="Paprikaa Chilli Paneer" price={280} />);
    expect(
      screen.getByRole("heading", { level: 3, name: "Paprikaa Chilli Paneer" })
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Vegetarian" })).toBeInTheDocument();
  });

  it("takes no diet prop — every dish on the menu is vegetarian", () => {
    // @ts-expect-error — the kitchen is egg-free (spec C10): a diet prop must never compile.
    render(<MenuItemRow name="Gulkand Kulfi" price={180} diet="egg" />);
    expect(screen.getByRole("img", { name: "Vegetarian" })).toBeInTheDocument();
  });

  it("prints the price the brand way and keeps the struck-through old price", () => {
    render(<MenuItemRow name="Mushroom Keema Pav" price={340} was={380} />);
    const row = screen.getByRole("article");
    expect(row).toHaveTextContent("₹340");
    expect(row).toHaveTextContent("₹380");
  });

  it("marks the Devanagari name as Hindi so screen readers pronounce it", () => {
    render(<MenuItemRow name="Gulkand Kulfi" nameDevanagari="कुल्फी" price={180} />);
    expect(screen.getByText("कुल्फी")).toHaveAttribute("lang", "hi");
  });

  it("shows the heat, the badge and the description when given", () => {
    render(
      <MenuItemRow
        name="Paprikaa Chilli Paneer"
        price={280}
        spice={3}
        badge="Bestseller"
        description="Amritsari paneer, burnt chilli mayo, potato brioche."
      />
    );
    expect(screen.getByRole("img", { name: "Spice level 3 of 4" })).toBeInTheDocument();
    expect(screen.getByText("Bestseller")).toBeInTheDocument();
    expect(
      screen.getByText("Amritsari paneer, burnt chilli mayo, potato brioche.")
    ).toBeInTheDocument();
  });

  it("renders no heat scale on a dish without heat", () => {
    render(<MenuItemRow name="Kulhad Chai" price={90} />);
    expect(screen.queryByRole("img", { name: /Spice level/ })).not.toBeInTheDocument();
  });

  it("labels the photo placeholder until photography exists, then shows the photo", () => {
    const { rerender } = render(<MenuItemRow name="Kulhad Chai" price={90} />);
    expect(screen.getByText("Dish photo")).toBeInTheDocument();
    rerender(
      <MenuItemRow
        name="Kulhad Chai"
        price={90}
        image={{
          src: "/menu/kulhad-chai.avif",
          alt: "Kulhad chai in a clay cup",
          width: 208,
          height: 208,
        }}
      />
    );
    expect(screen.getByRole("img", { name: "Kulhad chai in a clay cup" })).toHaveAttribute(
      "src",
      "/menu/kulhad-chai.avif"
    );
  });

  it("renders the action slot — the row never owns cart state", () => {
    render(
      <MenuItemRow name="Kulhad Chai" price={90} action={<button type="button">Add</button>} />
    );
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("renders no control when the menu cannot take orders", () => {
    render(<MenuItemRow name="Kulhad Chai" price={90} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("draws the hairline divider by default and drops it on request", () => {
    const { rerender } = render(<MenuItemRow name="Kulhad Chai" price={90} />);
    expect(screen.getByRole("article")).toHaveClass("border-b");
    rerender(<MenuItemRow name="Kulhad Chai" price={90} hasDivider={false} />);
    expect(screen.getByRole("article")).not.toHaveClass("border-b");
  });

  it("uses the heading level the page needs", () => {
    render(<MenuItemRow name="Kulhad Chai" price={90} headingLevel={4} />);
    expect(screen.getByRole("heading", { level: 4, name: "Kulhad Chai" })).toBeInTheDocument();
  });

  it("lets a caller className replace its own padding", () => {
    render(<MenuItemRow name="Kulhad Chai" price={90} className="py-2" />);
    expect(screen.getByRole("article")).toHaveClass("py-2");
    expect(screen.getByRole("article")).not.toHaveClass("py-5");
  });

  it("has no accessibility violations in its fullest state", async () => {
    const { container } = render(
      <MenuItemRow
        name="Paprikaa Chilli Paneer"
        nameDevanagari="पनीर"
        price={280}
        was={320}
        spice={3}
        badge="Bestseller"
        description="Amritsari paneer, burnt chilli mayo, potato brioche."
        action={<button type="button">Add</button>}
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- menu-item-row 2>&1 | tail -8`
Expected: FAIL — `Failed to resolve import "./menu-item-row"`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/menu-item-row/menu-item-row.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { Badge } from "../../atoms/badge/badge";
import { DietMark } from "../../atoms/diet-mark/diet-mark";
import { ImageSlot } from "../../atoms/image-slot/image-slot";
import { PriceTag } from "../../atoms/price-tag/price-tag";
import { SpiceLevel } from "../../atoms/spice-level/spice-level";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";

/** A dish photograph from the image pipeline. Omit it and a labelled placeholder shows instead. */
export interface MenuItemImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

const menuItemRow = componentVariants({
  slots: {
    root: "flex items-start gap-5 py-5",
    body: "min-w-0 flex-1",
    header: "flex flex-wrap items-center gap-2",
    name: "font-display text-menu-item-name text-text-heading",
    nameDevanagari: "font-devanagari text-menu-item-devanagari text-text-brand",
    meta: "mt-2 flex items-center gap-3.5",
    description: "mt-2 mb-0 max-w-text-measure-narrow text-body-sm text-text-muted",
    action: "mt-3.5",
    // 80px at 360px, 104px (the design system's size) from `sm` up — the row holds its shape at both.
    thumbnail: "size-20 shrink-0 sm:size-26",
  },
  variants: {
    hasDivider: { true: { root: "border-b border-border-subtle" }, false: {} },
  },
});

export interface MenuItemRowProps extends ComponentProps<"article"> {
  name: string;
  /** Devanagari dish name, set beside the Latin one (`कुल्फी`). */
  nameDevanagari?: string | undefined;
  /** Ingredient-led, 14 words at most. */
  description?: string | undefined;
  price: number;
  was?: number | undefined;
  spice?: 1 | 2 | 3 | 4 | undefined;
  /** Short marker, e.g. "Bestseller" (rendered uppercase by Badge). */
  badge?: string | undefined;
  image?: MenuItemImage | undefined;
  /** What photograph belongs in the placeholder. Default "Dish photo". */
  imageLabel?: string | undefined;
  /**
   * The Add button or a QuantityStepper — the row never owns cart state. Name it with the dish
   * (`aria-label="Add Masala Fries"`), so a menu is not a list of controls all called "Add".
   */
  action?: ReactNode | undefined;
  hasDivider?: boolean | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/**
 * The menu list row: no card, a `border-subtle` hairline between items, the thumbnail on the
 * right. Every dish is vegetarian, so the DietMark always shows and there is no `diet` prop.
 */
export function MenuItemRow({
  name,
  nameDevanagari,
  description,
  price,
  was,
  spice,
  badge,
  image,
  imageLabel = "Dish photo",
  action,
  hasDivider = true,
  headingLevel = 3,
  className,
  ...props
}: MenuItemRowProps) {
  const styles = menuItemRow({ hasDivider });
  const Heading = headingTag(headingLevel);

  return (
    <article className={styles.root({ className })} {...props}>
      <div className={styles.body()}>
        <div className={styles.header()}>
          <DietMark size="sm" />
          <Heading className={styles.name()}>{name}</Heading>
          {nameDevanagari ? (
            <span lang="hi" className={styles.nameDevanagari()}>
              {nameDevanagari}
            </span>
          ) : null}
          {badge ? <Badge tone="soft">{badge}</Badge> : null}
        </div>
        <div className={styles.meta()}>
          <PriceTag amount={price} was={was} size="sm" />
          {spice === undefined ? null : <SpiceLevel level={spice} size="sm" />}
        </div>
        {description ? <p className={styles.description()}>{description}</p> : null}
        {action ? <div className={styles.action()}>{action}</div> : null}
      </div>
      <ImageSlot
        ratio="square"
        radius="md"
        className={styles.thumbnail()}
        {...(image ?? { label: imageLabel })}
      />
    </article>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- menu-item-row 2>&1 | tail -8`
Expected: PASS (13 tests). The `@ts-expect-error` line must be _used_: `pnpm nx typecheck @pink-paprikaa-web/ui --skip-nx-cache` passes (an unused directive would fail it).

- [ ] **Step 6: Stories — every row of `MenuItemRow.card.html`, plus Playground and OnSurfaces**

`packages/ui/src/molecules/menu-item-row/menu-item-row.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Plus } from "lucide-react";
import { expect } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { OnSurfaces } from "../../lib/story-surfaces";
import { MenuItemRow } from "./menu-item-row";

/** The dish is folded into the name, so a menu is not a list of controls all called "Add". */
const addButton = (name: string) => (
  <Button size="sm" variant="secondary" icon={Plus} aria-label={`Add ${name}`}>
    Add
  </Button>
);

const meta = {
  title: "Molecules/MenuItemRow",
  component: MenuItemRow,
  args: {
    name: "Paprikaa Chilli Paneer",
    price: 280,
    spice: 3,
    badge: "Bestseller",
    description: "Amritsari paneer, burnt chilli mayo, potato brioche.",
    action: addButton("Paprikaa Chilli Paneer"),
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-article">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The menu list row — no card, just a `border-subtle` hairline between items. Every dish is vegetarian, so the DietMark always shows (there is no `diet` prop). Omit `image` and a labelled light-pink placeholder appears — no supplied photography exists yet. `action` takes the Add button (or a QuantityStepper); the row never owns cart state. Use `MenuItemCard` for grids and rails instead.",
      },
    },
  },
} satisfies Meta<typeof MenuItemRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "full": badge, heat, description and the Add button. */
export const Full: Story = {};

/** Card row "discount": `was` strikes the old price. */
export const Discount: Story = {
  args: {
    name: "Mushroom Keema Pav",
    price: 340,
    was: 380,
    spice: 2,
    description: "Slow-cooked mushroom keema, buttered pav, pickled onion.",
    action: addButton("Mushroom Keema Pav"),
  },
};

/** Card row "devanagari" (the design system's egg variant is not built — spec C10). */
export const Devanagari: Story = {
  args: {
    name: "Gulkand Kulfi",
    nameDevanagari: "कुल्फी",
    price: 180,
    spice: 1,
    description: "Rose petal preserve, pistachio, saffron.",
    action: addButton("Gulkand Kulfi"),
  },
};

/** Card row "minimal": `hasDivider={false}`, no action. */
export const Minimal: Story = {
  args: { name: "Kulhad Chai", price: 90, hasDivider: false, action: undefined, badge: undefined },
};

/** A real section: one hairline between rows, and the last row drops its rule. */
export const AsAMenuSection: Story = {
  render: () => (
    <div>
      <MenuItemRow
        name="Paprikaa Chilli Paneer"
        nameDevanagari="पनीर"
        price={280}
        spice={3}
        badge="Bestseller"
        description="Amritsari paneer, burnt chilli mayo, potato brioche."
        action={addButton("Paprikaa Chilli Paneer")}
      />
      <MenuItemRow
        name="Masala Fries"
        price={190}
        was={240}
        spice={4}
        description="Masala fries, amchur, curry-leaf salt."
        action={addButton("Masala Fries")}
      />
      <MenuItemRow
        name="Kulhad Chai"
        price={90}
        description="Assam leaf, ginger, clay cup."
        action={addButton("Kulhad Chai")}
        hasDivider={false}
      />
    </div>
  ),
};

/** The four heat steps, each named ("Spice level 2 of 4") rather than left to colour. */
export const SpiceLevels: Story = {
  render: () => (
    <div>
      <MenuItemRow name="Steamed Momos" price={150} spice={1} />
      <MenuItemRow name="Honey Chilli Potato" price={220} spice={2} />
      <MenuItemRow name="Paprikaa Chilli Paneer" price={280} spice={3} />
      <MenuItemRow name="Masala Fries" price={190} spice={4} hasDivider={false} />
    </div>
  ),
};

/** Once the dish is in the cart the page swaps the action; the row never owns cart state. */
export const InCart: Story = {
  args: {
    action: (
      <Button size="sm" variant="ghost">
        In cart · 2
      </Button>
    ),
  },
};

/** 360px: the thumbnail steps down to 80px and a long name wraps instead of widening the row. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
  args: {
    name: "Paprikaa Chilli Paneer With Burnt Garlic",
    nameDevanagari: "पनीर",
    was: 320,
    hasDivider: false,
  },
  decorators: [
    (Story) => (
      <div className="w-90">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas }) => {
    const row = canvas.getByRole("article");
    await expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth);
  },
};

export const OnSurfaces: Story = {
  render: (args) => (
    <OnSurfaces>
      <div className="min-w-0 flex-1">
        <MenuItemRow {...args} hasDivider={false} />
      </div>
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export {
  type MenuItemImage,
  MenuItemRow,
  type MenuItemRowProps,
} from "./molecules/menu-item-row/menu-item-row";
```

- [ ] **Step 8: Gate** — the per-task gate with `<paths>` = `packages/design-tokens/tokens/component/menu-item.json packages/ui/src/molecules/menu-item-row packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/design-tokens/tokens/component/menu-item.json packages/ui/src/molecules/menu-item-row packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): MenuItemRow molecule

The menu list row: dish name, optional Devanagari name (lang=hi), price,
heat, badge, description and an action slot, with a labelled photo
placeholder until photography exists. Every dish is vegetarian, so the
DietMark always shows and there is no diet prop — a test pins that it
does not compile.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 2: MenuItemCard

**Files:**

- Create: `packages/ui/src/molecules/menu-item-card/menu-item-card.tsx`, `menu-item-card.test.tsx`, `menu-item-card.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/menu-item-card/menu-item-card.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                      | Ruling  | Where, or the spec clause                                                                            |
| ----------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------- |
| Dish name is a heading; price printed; `was` struck                           | ALREADY | tests "names the dish…", "prints the price…"; PriceTag owns the `<s>` (Plan 2b)                      |
| `nameAs` picks the name element                                               | ALREADY | `headingLevel` (spec §8.1)                                                                           |
| Lifts on hover only when it is a link                                         | ADD     | test "lifts only when it is a link" (Card's `hover:lift`)                                            |
| Old class asserts `rounded-4`, `shadow-elevation1`, `hover:shadow-elevation3` | DROP    | D4 (token names mirror the design system: `rounded-lg`, `shadow-1`, `shadow-3`)                      |
| One real stretched link (`after:inset-0`), not a click handler on the card    | ADD     | assertion in test "makes the name a link that covers the card"                                       |
| Plain card, no link, without `href`                                           | ADD     | test "lifts only when it is a link"                                                                  |
| `diet` / `egg` mark; `DietMarks` story                                        | DROP    | C10                                                                                                  |
| Heat named; badge over the photo                                              | ALREADY | test "shows the badge, the heat…"                                                                    |
| `onAdd` floating button                                                       | DROP    | spec §9.2 MenuItemCard: floating `action` slot                                                       |
| Floating add named after the dish ("Add Masala Cold Brew")                    | ALREADY | stories' `addAction(name)`; test "keeps the floating action a sibling…"                              |
| No add button on a card that cannot take an order                             | ADD     | test "draws no action on a card that cannot take an order"                                           |
| Labelled placeholder                                                          | ALREADY | test "labels the 4:3 photo placeholder…"                                                             |
| Photograph with its alt once supplied                                         | ADD     | test "shows the photograph once one is supplied"                                                     |
| Caller `className` replaces the card radius                                   | ADD     | test "lets a caller className replace the card radius"                                               |
| axe                                                                           | ALREADY | last test                                                                                            |
| Description clamped to two lines                                              | ADD     | `description` slot `line-clamp-2`; asserted in "shows the badge, the heat…"                          |
| `h-full` + price row pinned to the bottom so a grid of cards lines up         | ADD     | body `flex flex-1 flex-col`, footer `mt-auto`; story `InAGrid`                                       |
| `min-w-0` on the name so a long name wraps                                    | ALREADY | `name` slot; story `Narrow` play                                                                     |
| Stories `Default`, `Variants`                                                 | ALREADY | `Playground`, `Variants`                                                                             |
| Stories `InAGrid`, `Narrow` (360)                                             | ADD     | stories `InAGrid`, `Narrow` (the width decorator moves off `meta` so a grid can render — see Step 6) |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Badge` (`tone="brand"`), `Card` (`asChild`, `padding="none"`, `isInteractive`), `DietMark`, `ImageSlot` (`ratio="4:3"`), `PriceTag`, `SpiceLevel`, `headingTag`, `type LinkAs`, `type MenuItemImage` (Task 1), the `menu-item-name` token (Task 1).
- Produces: `MenuItemCard`, `type MenuItemCardProps` (contract §6). Documented default: `imageLabel = "Dish photo"`. No `diet` prop.

- [ ] **Step 1: Tokens** — none new: the name reuses `text-menu-item-name` (Task 1); offsets are scale steps (`-bottom-4.5` = 18px, `right-3.5` = 14px, `p-4.5` = 18px).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/menu-item-card/menu-item-card.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import type { LinkAsProps } from "../../lib/link-as";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { MenuItemCard } from "./menu-item-card";

function RouterLink(props: LinkAsProps) {
  return <a data-router="" {...props} />;
}

describe("MenuItemCard", () => {
  it("names the dish as a heading and always shows the vegetarian mark", () => {
    render(<MenuItemCard name="Masala Cold Brew" price={220} />);
    expect(screen.getByRole("heading", { level: 3, name: "Masala Cold Brew" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Vegetarian" })).toBeInTheDocument();
  });

  it("takes no diet prop — every dish on the menu is vegetarian", () => {
    // @ts-expect-error — the kitchen is egg-free (spec C10): a diet prop must never compile.
    render(<MenuItemCard name="Masala Fries" price={190} diet="egg" />);
    expect(screen.getByRole("img", { name: "Vegetarian" })).toBeInTheDocument();
  });

  it("prints the price and the struck-through old price", () => {
    render(<MenuItemCard name="Masala Fries" price={190} was={240} />);
    const card = screen.getByRole("article");
    expect(card).toHaveTextContent("₹190");
    expect(card).toHaveTextContent("₹240");
  });

  it("shows the badge, the heat and the description when given", () => {
    render(
      <MenuItemCard
        name="Masala Cold Brew"
        price={220}
        spice={1}
        badge="New"
        description="Cold brew, jaggery, cardamom."
      />
    );
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Spice level 1 of 4" })).toBeInTheDocument();
    // Ingredient-led, 14 words at most — the card clamps it so a grid keeps one rhythm.
    expect(screen.getByText("Cold brew, jaggery, cardamom.")).toHaveClass("line-clamp-2");
  });

  it("labels the 4:3 photo placeholder until photography exists", () => {
    render(<MenuItemCard name="Kulhad Chai" price={90} />);
    expect(screen.getByText("Dish photo")).toBeInTheDocument();
  });

  it("shows the photograph once one is supplied", () => {
    render(
      <MenuItemCard
        name="Kulhad Chai"
        price={90}
        image={{
          src: "/menu/kulhad-chai.avif",
          alt: "Kulhad chai in a clay cup",
          width: 420,
          height: 315,
        }}
      />
    );
    expect(screen.getByRole("img", { name: "Kulhad chai in a clay cup" })).toHaveAttribute(
      "src",
      "/menu/kulhad-chai.avif"
    );
    expect(screen.queryByText("Dish photo")).not.toBeInTheDocument();
  });

  it("draws no action on a card that cannot take an order", () => {
    render(<MenuItemCard name="Kulhad Chai" price={90} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("makes the name a link that covers the card when given an href", () => {
    render(<MenuItemCard name="Kulhad Chai" price={90} href="/menu/kulhad-chai" />);
    const link = screen.getByRole("link", { name: "Kulhad Chai" });
    expect(link).toHaveAttribute("href", "/menu/kulhad-chai");
    // One real, focusable link stretched over the card — never a click handler on the card.
    expect(link).toHaveClass("after:inset-0");
  });

  it("lifts only when it is a link — a lift on a plain card promises a click that does nothing", () => {
    const { rerender } = render(<MenuItemCard name="Kulhad Chai" price={90} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByRole("article")).not.toHaveClass("hover:lift");
    rerender(<MenuItemCard name="Kulhad Chai" price={90} href="/menu/kulhad-chai" />);
    expect(screen.getByRole("article")).toHaveClass("hover:lift");
  });

  it("lets a caller className replace the card radius", () => {
    render(<MenuItemCard name="Kulhad Chai" price={90} className="rounded-md" />);
    expect(screen.getByRole("article")).toHaveClass("rounded-md");
    expect(screen.getByRole("article")).not.toHaveClass("rounded-lg");
  });

  it("renders the link through the app's router link when given one", () => {
    render(
      <MenuItemCard name="Kulhad Chai" price={90} href="/menu/kulhad-chai" linkAs={RouterLink} />
    );
    expect(screen.getByRole("link", { name: "Kulhad Chai" })).toHaveAttribute("data-router");
  });

  it("keeps the floating action a sibling of the link, never nested inside it", () => {
    render(
      <MenuItemCard
        name="Masala Cold Brew"
        price={220}
        href="/menu/masala-cold-brew"
        action={
          <button type="button" aria-label="Add Masala Cold Brew">
            +
          </button>
        }
      />
    );
    const link = screen.getByRole("link", { name: "Masala Cold Brew" });
    expect(link).not.toContainElement(screen.getByRole("button", { name: "Add Masala Cold Brew" }));
  });

  it("has no accessibility violations as a link with an action", async () => {
    const { container } = render(
      <MenuItemCard
        name="Masala Cold Brew"
        price={220}
        spice={1}
        badge="New"
        description="Cold brew, jaggery, cardamom."
        href="/menu/masala-cold-brew"
        action={
          <button type="button" aria-label="Add Masala Cold Brew">
            +
          </button>
        }
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- menu-item-card 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./menu-item-card`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/menu-item-card/menu-item-card.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import type { LinkAs } from "../../lib/link-as";
import type { MenuItemImage } from "../menu-item-row/menu-item-row";

import { Badge } from "../../atoms/badge/badge";
import { Card } from "../../atoms/card/card";
import { DietMark } from "../../atoms/diet-mark/diet-mark";
import { ImageSlot } from "../../atoms/image-slot/image-slot";
import { PriceTag } from "../../atoms/price-tag/price-tag";
import { SpiceLevel } from "../../atoms/spice-level/spice-level";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";

const menuItemCard = componentVariants({
  slots: {
    root: "relative flex h-full flex-col",
    media: "relative",
    badge: "absolute top-3 left-3",
    // Above the stretched link's overlay, so the Add button stays its own target.
    action: "absolute right-3.5 -bottom-4.5 z-raised",
    // flex-1 + the footer's mt-auto pin the price row to the bottom, so a grid of cards lines up.
    body: "flex flex-1 flex-col gap-2 p-4.5",
    header: "flex items-center gap-2",
    name: "min-w-0 font-display text-menu-item-name text-text-heading",
    // Stretched link: the ::after covers the whole card, so the card clicks through to the dish.
    link: "text-inherit no-underline after:absolute after:inset-0",
    description: "m-0 line-clamp-2 max-w-none text-body-sm text-text-muted",
    footer: "mt-auto flex items-center justify-between gap-2.5 pt-0.5",
  },
});

export interface MenuItemCardProps extends ComponentProps<"article"> {
  name: string;
  description?: string | undefined;
  price: number;
  was?: number | undefined;
  spice?: 1 | 2 | 3 | 4 | undefined;
  badge?: string | undefined;
  image?: MenuItemImage | undefined;
  /** What photograph belongs in the placeholder. Default "Dish photo". */
  imageLabel?: string | undefined;
  /** The floating add button (IconButton, `shadow-brand`). */
  action?: ReactNode | undefined;
  /** Makes the dish name a link that covers the card. */
  href?: string | undefined;
  linkAs?: LinkAs | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/**
 * Image-first dish card for grids and rails: a 4:3 photo with an overlapping floating action,
 * then the DietMark, the name, the price and the heat. With `href` the card is a link and lifts
 * on hover; the action stays a separate button.
 */
export function MenuItemCard({
  name,
  description,
  price,
  was,
  spice,
  badge,
  image,
  imageLabel = "Dish photo",
  action,
  href,
  linkAs: LinkComponent = "a",
  headingLevel = 3,
  className,
  ...props
}: MenuItemCardProps) {
  const styles = menuItemCard();
  const Heading = headingTag(headingLevel);

  return (
    <Card
      asChild
      padding="none"
      isInteractive={href !== undefined}
      className={styles.root({ className })}
    >
      <article {...props}>
        <div className={styles.media()}>
          <ImageSlot ratio="4:3" radius="none" {...(image ?? { label: imageLabel })} />
          {badge ? (
            <Badge tone="brand" className={styles.badge()}>
              {badge}
            </Badge>
          ) : null}
          {action ? <div className={styles.action()}>{action}</div> : null}
        </div>
        <div className={styles.body()}>
          <div className={styles.header()}>
            <DietMark size="sm" />
            <Heading className={styles.name()}>
              {href === undefined ? (
                name
              ) : (
                <LinkComponent href={href} className={styles.link()}>
                  {name}
                </LinkComponent>
              )}
            </Heading>
          </div>
          {description ? <p className={styles.description()}>{description}</p> : null}
          <div className={styles.footer()}>
            <PriceTag amount={price} was={was} />
            {spice === undefined ? null : <SpiceLevel level={spice} size="sm" />}
          </div>
        </div>
      </article>
    </Card>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- menu-item-card 2>&1 | tail -8`
Expected: PASS (13 tests).

- [ ] **Step 6: Stories — the `MenuItemCard.card.html` "variants" row (three 210px cards), plus Playground, AsLink, InAGrid and Narrow**

`packages/ui/src/molecules/menu-item-card/menu-item-card.stories.tsx`:

```tsx
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

import { Plus } from "lucide-react";
import { expect } from "storybook/test";

import { IconButton } from "../../atoms/icon-button/icon-button";
import { MenuItemCard } from "./menu-item-card";

/**
 * One card at the design system's 210px. A story decorator, not a `meta` one: Storybook
 * concatenates story and meta decorators (`decorators: []` on a story removes nothing), so a
 * meta-level width would squeeze the grid stories too.
 */
const cardWidth: Decorator = (Story) => (
  <div className="w-52.5">
    <Story />
  </div>
);

const addAction = (name: string) => (
  <IconButton
    icon={Plus}
    label={`Add ${name}`}
    variant="primary"
    size="lg"
    className="shadow-brand"
  />
);

const meta = {
  title: "Molecules/MenuItemCard",
  component: MenuItemCard,
  args: {
    name: "Masala Cold Brew",
    price: 220,
    spice: 1,
    badge: "New",
    description: "Cold brew, jaggery, cardamom.",
    action: addAction("Masala Cold Brew"),
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Dish card for grids and horizontal rails — the website\'s "Most Ordered" and the app home. A 4:3 image on top with an overlapping floating `+` (pink, `shadow-brand`), then DietMark + name + price. Every dish is vegetarian (no `diet` prop). Give it `href` and the name becomes a link covering the card, which then lifts −2px on hover; the action stays its own button.',
      },
    },
  },
} satisfies Meta<typeof MenuItemCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { decorators: [cardWidth] };

/** Card row "variants": badge + add, discount + add, no action. */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3.5">
      <div className="w-52.5">
        <MenuItemCard
          name="Masala Cold Brew"
          price={220}
          spice={1}
          badge="New"
          description="Cold brew, jaggery, cardamom."
          action={addAction("Masala Cold Brew")}
        />
      </div>
      <div className="w-52.5">
        <MenuItemCard
          name="Masala Fries"
          price={190}
          was={240}
          spice={4}
          description="Masala fries, amchur, curry-leaf salt."
          action={addAction("Masala Fries")}
        />
      </div>
      <div className="w-52.5">
        <MenuItemCard
          name="Kulhad Chai"
          price={90}
          spice={1}
          description="Assam leaf, ginger, clay cup."
        />
      </div>
    </div>
  ),
};

/** `href`: the whole card is a link to the dish; the add button stays separate. */
export const AsLink: Story = {
  args: { href: "#masala-cold-brew" },
  decorators: [cardWidth],
};

/** Uneven descriptions still line up: the price row is pinned to the bottom of every card. */
export const InAGrid: Story = {
  render: () => (
    <div className="grid max-w-content grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MenuItemCard
        name="Paprikaa Chilli Paneer"
        price={280}
        spice={3}
        badge="Bestseller"
        description="Amritsari paneer, burnt chilli mayo, potato brioche, house pickle."
        href="#paprikaa-chilli-paneer"
        action={addAction("Paprikaa Chilli Paneer")}
      />
      <MenuItemCard
        name="Kulhad Chai"
        price={90}
        description="Assam leaf, ginger."
        href="#kulhad-chai"
        action={addAction("Kulhad Chai")}
      />
      <MenuItemCard
        name="Masala Cold Brew"
        price={220}
        spice={1}
        description="Cold brew, jaggery, cardamom."
        href="#masala-cold-brew"
        action={addAction("Masala Cold Brew")}
      />
      <MenuItemCard
        name="Masala Fries"
        price={190}
        was={240}
        spice={4}
        description="Masala fries, amchur, curry-leaf salt."
        href="#masala-fries"
        action={addAction("Masala Fries")}
      />
    </div>
  ),
};

/** 360px: a long dish name wraps inside the card instead of pushing the price out of it. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
  args: {
    name: "Paprikaa Chilli Paneer With Burnt Garlic",
    price: 280,
    was: 320,
    badge: "Bestseller",
    href: "#paprikaa-chilli-paneer",
    action: addAction("Paprikaa Chilli Paneer With Burnt Garlic"),
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas }) => {
    const card = canvas.getByRole("article");
    await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
  },
};
```

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export { MenuItemCard, type MenuItemCardProps } from "./molecules/menu-item-card/menu-item-card";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/ui/src/molecules/menu-item-card packages/ui/src/index.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/molecules/menu-item-card packages/ui/src/index.ts
git commit -m "feat(ui): MenuItemCard molecule

Image-first dish card with a floating action slot. With href the dish
name becomes a stretched link covering the card, so the add button is
never nested inside a link; the card lifts only when it is a link.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 3: OutletCard

**Files:**

- Create: `packages/ui/src/molecules/outlet-card/outlet-card.tsx`, `outlet-card.test.tsx`, `outlet-card.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/outlet-card/outlet-card.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                          | Ruling  | Where, or the spec clause                                                                                  |
| ----------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| Outlet name is a heading; city, address, hours printed            | ALREADY | tests "names the outlet…", "puts the address in an address element…"                                       |
| `nameAs` picks the name element                                   | ALREADY | `headingLevel`; ADD test "uses the heading level the page needs"                                           |
| Status in words for open / busy / closed; `statusLabel` overrides | ALREADY | `it.each` status test, "lets the page override the status words"                                           |
| `href` → one stretched link over the card (`after:inset-0`)       | ADD     | `href` + `linkAs` props (deviation 17; spec §9.2 row lists `href`, §8.2 `onClick` → `href`)                |
| Hover lift only when the card is a link                           | ADD     | `isInteractive={href !== undefined}`; test "becomes one stretched link that lifts only when given an href" |
| Secondary action stays clickable above the stretched link         | ADD     | `action` slot `relative z-raised`; test "keeps the action outside the stretched link…"                     |
| Labelled 16:9 placeholder; `hasImage={false}` drops it            | ALREADY | test "shows the labelled 16:9 placeholder…"                                                                |
| Photograph with its alt once supplied                             | ADD     | test "shows the outlet photograph once one is supplied"                                                    |
| Caller `className` replaces the card radius                       | ADD     | test "lets a caller className replace the card radius"                                                     |
| axe                                                               | ALREADY | last test (now with `href`)                                                                                |
| `h-full` so a locator row of cards shares one height              | ADD     | root `relative flex h-full flex-col`                                                                       |
| Header wraps so the status drops under a long name at 360         | ALREADY | `top` slot `flex-wrap`; story `Narrow` play                                                                |
| `StatusDot size="sm"`                                             | DROP    | D2 — the design-system `OutletCard.jsx` renders StatusDot at its default size                              |
| Stories `Default`, `WithImage`, `CompactWithAction`               | ALREADY | `Playground`, `WithImage`, `WithoutImage`                                                                  |
| Stories `StatusStates`, `CustomStatusLine`, `Narrow` (360)        | ADD     | stories `StatusStates`, `CustomStatusLine`, `Narrow`                                                       |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Card` (`isInteractive`), `ImageSlot` (`ratio="16:9"`), `Icon`, `StatusDot` (`tone="open" | "busy" | "closed"`), `headingTag`, `type LinkAs`, `type MenuItemImage`.
- Produces: `OutletCard`, `type OutletCardProps` (contract §6 + deviation 17: `href`, `linkAs`). Documented defaults: `status = "open"`; status words "Open now" / "Busy" / "Closed" (`statusLabel` overrides); `imageLabel = "Outlet interior 16:9"`; `hasImage = true`.

- [ ] **Step 1: Tokens** — none new (`text-h4`, `text-overline`, `p-4.5`, `gap-2.5` are all on the scales).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/outlet-card/outlet-card.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { OutletCard } from "./outlet-card";

const ADDRESS = "Booth No. 67P, HSVP Market (MKM Market), Sector 57";

describe("OutletCard", () => {
  it("names the outlet as a heading under its city", () => {
    render(<OutletCard city="Gurgaon" name="Sector 57" />);
    expect(screen.getByRole("heading", { level: 3, name: "Sector 57" })).toBeInTheDocument();
    expect(screen.getByText("Gurgaon")).toBeInTheDocument();
  });

  it.each([
    ["open", "Open now"],
    ["busy", "Busy"],
    ["closed", "Closed"],
  ] as const)("says %s in words, never by colour alone", (status, word) => {
    render(<OutletCard name="Sector 57" status={status} />);
    expect(screen.getByText(word)).toBeInTheDocument();
  });

  it("lets the page override the status words", () => {
    render(<OutletCard name="Sector 57" status="closed" statusLabel="Opens at 8am" />);
    expect(screen.getByText("Opens at 8am")).toBeInTheDocument();
  });

  it("puts the address in an address element and shows the hours", () => {
    const { container } = render(
      <OutletCard name="Sector 57" address={ADDRESS} hours="8am – 11:30pm" />
    );
    expect(container.querySelector("address")).toHaveTextContent(ADDRESS);
    expect(screen.getByText("8am – 11:30pm")).toBeInTheDocument();
  });

  it("shows the labelled 16:9 placeholder by default and drops the image for the list form", () => {
    const { rerender } = render(<OutletCard name="Sector 57" />);
    expect(screen.getByText("Outlet interior 16:9")).toBeInTheDocument();
    rerender(<OutletCard name="Sector 57" hasImage={false} />);
    expect(screen.queryByText("Outlet interior 16:9")).not.toBeInTheDocument();
  });

  it("renders the action slot", () => {
    render(<OutletCard name="Sector 57" action={<a href="https://maps.example">Directions</a>} />);
    expect(screen.getByRole("link", { name: "Directions" })).toBeInTheDocument();
  });

  it("uses the heading level the page needs", () => {
    render(<OutletCard name="Sector 57" headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2, name: "Sector 57" })).toBeInTheDocument();
  });

  it("shows the outlet photograph once one is supplied", () => {
    render(
      <OutletCard
        name="Sector 57"
        image={{
          src: "/outlets/sector-57.avif",
          alt: "The dine-in room at Sector 57",
          width: 640,
          height: 360,
        }}
      />
    );
    expect(screen.getByRole("img", { name: "The dine-in room at Sector 57" })).toHaveAttribute(
      "src",
      "/outlets/sector-57.avif"
    );
  });

  it("becomes one stretched link that lifts only when given an href", () => {
    const { rerender } = render(<OutletCard name="Sector 57" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByRole("article")).not.toHaveClass("hover:lift");
    rerender(<OutletCard name="Sector 57" href="/outlets/sector-57" />);
    const link = screen.getByRole("link", { name: "Sector 57" });
    expect(link).toHaveAttribute("href", "/outlets/sector-57");
    expect(link).toHaveClass("after:inset-0");
    expect(screen.getByRole("article")).toHaveClass("hover:lift");
  });

  it("keeps the action outside the stretched link, raised above its overlay", () => {
    render(
      <OutletCard
        name="Sector 57"
        href="/outlets/sector-57"
        action={<a href="https://maps.example">Directions</a>}
      />
    );
    const directions = screen.getByRole("link", { name: "Directions" });
    expect(screen.getByRole("link", { name: "Sector 57" })).not.toContainElement(directions);
    expect(directions.parentElement).toHaveClass("z-raised");
  });

  it("lets a caller className replace the card radius", () => {
    render(<OutletCard name="Sector 57" className="rounded-md" />);
    expect(screen.getByRole("article")).toHaveClass("rounded-md");
    expect(screen.getByRole("article")).not.toHaveClass("rounded-lg");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <OutletCard
        city="Gurgaon"
        name="Sector 57"
        address={ADDRESS}
        hours="8am – 11:30pm"
        href="/outlets/sector-57"
        action={<a href="https://maps.example">Directions</a>}
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- outlet-card 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./outlet-card`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/outlet-card/outlet-card.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import type { LinkAs } from "../../lib/link-as";
import type { MenuItemImage } from "../menu-item-row/menu-item-row";

import { Clock, MapPin } from "lucide-react";

import { Card } from "../../atoms/card/card";
import { Icon } from "../../atoms/icon/icon";
import { ImageSlot } from "../../atoms/image-slot/image-slot";
import { StatusDot } from "../../atoms/status-dot/status-dot";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";

type OutletStatus = "open" | "busy" | "closed";

/** Status in plain words (design-system OutletCard); `statusLabel` overrides. */
const STATUS_WORD: Readonly<Record<OutletStatus, string>> = {
  open: "Open now",
  busy: "Busy",
  closed: "Closed",
};

const outletCard = componentVariants({
  slots: {
    // relative anchors the stretched link; h-full lets a locator row of cards share one height.
    root: "relative flex h-full flex-col",
    body: "grid gap-2.5 p-4.5",
    top: "flex flex-wrap items-start justify-between gap-3",
    titles: "min-w-0",
    city: "m-0 max-w-none font-display text-overline text-text-brand uppercase",
    name: "mt-1 font-display text-h4 text-text-heading",
    // Stretched link: the ::after covers the whole card, so the card clicks through to the outlet.
    link: "text-inherit no-underline after:absolute after:inset-0",
    detail: "m-0 flex max-w-none items-start gap-2 text-body-sm text-text-muted not-italic",
    detailIcon: "mt-0.5",
    // Above the stretched link's overlay, so Directions stays its own target.
    action: "relative z-raised mt-1",
  },
});

export interface OutletCardProps extends ComponentProps<"article"> {
  name: string;
  city?: string | undefined;
  address?: string | undefined;
  /** 12-hour lowercase with an en dash: "8am – 11:30pm". */
  hours?: string | undefined;
  status?: OutletStatus | undefined;
  /** Replaces the status word ("Open now" / "Busy" / "Closed"). */
  statusLabel?: string | undefined;
  image?: MenuItemImage | undefined;
  imageLabel?: string | undefined;
  /** `false` gives the compact list form without imagery. */
  hasImage?: boolean | undefined;
  action?: ReactNode | undefined;
  /** The outlet's page. The name becomes a link covering the card, which then lifts on hover. */
  href?: string | undefined;
  linkAs?: LinkAs | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/** One café location — the website locator and the app outlet picker. Status is a StatusDot. */
export function OutletCard({
  name,
  city,
  address,
  hours,
  status = "open",
  statusLabel,
  image,
  imageLabel = "Outlet interior 16:9",
  hasImage = true,
  action,
  href,
  linkAs: LinkComponent = "a",
  headingLevel = 3,
  className,
  ...props
}: OutletCardProps) {
  const styles = outletCard();
  const Heading = headingTag(headingLevel);

  return (
    <Card
      asChild
      padding="none"
      isInteractive={href !== undefined}
      className={styles.root({ className })}
    >
      <article {...props}>
        {hasImage ? (
          <ImageSlot ratio="16:9" radius="none" {...(image ?? { label: imageLabel })} />
        ) : null}
        <div className={styles.body()}>
          <div className={styles.top()}>
            <div className={styles.titles()}>
              {city ? <p className={styles.city()}>{city}</p> : null}
              <Heading className={styles.name()}>
                {href === undefined ? (
                  name
                ) : (
                  <LinkComponent href={href} className={styles.link()}>
                    {name}
                  </LinkComponent>
                )}
              </Heading>
            </div>
            <StatusDot tone={status} label={statusLabel ?? STATUS_WORD[status]} />
          </div>
          {address ? (
            <address className={styles.detail()}>
              <Icon icon={MapPin} size="sm" className={styles.detailIcon()} />
              {address}
            </address>
          ) : null}
          {hours ? (
            <p className={styles.detail()}>
              <Icon icon={Clock} size="sm" className={styles.detailIcon()} />
              {hours}
            </p>
          ) : null}
          {action ? <div className={styles.action()}>{action}</div> : null}
        </div>
      </article>
    </Card>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- outlet-card 2>&1 | tail -8`
Expected: PASS (14 tests).

- [ ] **Step 6: Stories — `OutletCard.card.html` rows "with image" (open + closed) and `image={false}` (busy + Directions), with the real outlet facts (spec C6)**

`packages/ui/src/molecules/outlet-card/outlet-card.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowUpRight } from "lucide-react";
import { expect } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { OutletCard } from "./outlet-card";

const ADDRESS = "Booth No. 67P, HSVP Market (MKM Market), Sector 57";
const HOURS = "8am – 11:30pm";

const meta = {
  title: "Molecules/OutletCard",
  component: OutletCard,
  args: { city: "Gurgaon", name: "Sector 57", address: ADDRESS, hours: HOURS },
  decorators: [
    (Story) => (
      <div className="w-full max-w-article">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "One café location — the website locator and the app outlet picker. Pass `hasImage={false}` for the compact list variant. Status is a StatusDot with a word, never a coloured pill. Pass `href` and the whole card becomes one real link that lifts on hover; the `action` stays its own control above it.",
      },
    },
  },
} satisfies Meta<typeof OutletCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "with image": open and closed side by side. */
export const WithImage: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-3.5">
      <OutletCard {...args} />
      <OutletCard {...args} status="closed" />
    </div>
  ),
};

/** Card row `hasImage={false}`: the list form, busy, with a Directions action. */
export const WithoutImage: Story = {
  args: {
    hasImage: false,
    status: "busy",
    action: (
      <Button asChild size="sm" variant="ghost" iconAfter={ArrowUpRight}>
        <a href="https://maps.google.com/?q=Pink+Paprikaa+Sector+57+Gurgaon">Directions</a>
      </Button>
    ),
  },
};

/** The three trading states, each in words — colour never carries it alone. */
export const StatusStates: Story = {
  render: (args) => (
    <div className="grid gap-3.5 md:grid-cols-3">
      <OutletCard {...args} hasImage={false} status="open" />
      <OutletCard {...args} hasImage={false} status="busy" />
      <OutletCard {...args} hasImage={false} status="closed" />
    </div>
  ),
};

/** `statusLabel` when "Open now" is not specific enough. */
export const CustomStatusLine: Story = {
  args: { hasImage: false, statusLabel: "Open till 11:30pm" },
};

/** 360px, linked: the status drops under a long name instead of squeezing it. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
  args: { href: "#sector-57", name: "Sector 57 · MKM Market", statusLabel: "Open till 11:30pm" },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas }) => {
    const card = canvas.getByRole("article");
    await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
  },
};
```

- [ ] **Step 7: Export**

```ts
export { OutletCard, type OutletCardProps } from "./molecules/outlet-card/outlet-card";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/ui/src/molecules/outlet-card packages/ui/src/index.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/molecules/outlet-card packages/ui/src/index.ts
git commit -m "feat(ui): OutletCard molecule

A café location with its city, status in words, address (in an address
element), hours and an action slot; hasImage={false} gives the compact
list form.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 4: ReviewCard

**Files:**

- Create: `packages/ui/src/molecules/review-card/review-card.tsx`, `review-card.test.tsx`, `review-card.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/review-card/review-card.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                            | Ruling  | Where, or the spec clause                                                                                    |
| ------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| Quote inside the component's own curly quotes, in a `<blockquote>`  | ALREADY | test "quotes the guest in curly quotes…"                                                                     |
| Attribution: name and meta                                          | ALREADY | same test (`figcaption`)                                                                                     |
| Initials stand in for a missing photo                               | ALREADY | test "drops the avatar when asked…" ("VK")                                                                   |
| No meta line and no score when neither is given                     | ADD     | test "omits the score and the meta line when neither is given"                                               |
| Score named for assistive tech                                      | ALREADY | test "shows the score…" ("5 out of 5")                                                                       |
| `default` on the white card                                         | ADD     | test "sits on a white light-island card by default"                                                          |
| `brand` on the light-pink feature card, name/quote in the pink ramp | ALREADY | test "uses the light-pink feature treatment…" (the soft surface remaps heading → pink-800)                   |
| `mark="symbol"` drops the diamond                                   | ALREADY | Rating owns the glyph (Plan 2b Rating test); story `SymbolMark`                                              |
| Old class asserts `bg-surface-card`, `rounded-4`                    | DROP    | D4 / D5 — surfaces are asserted as `data-surface`                                                            |
| `Rating hasValueLabel={false}`                                      | DROP    | D2 — the design-system `ReviewCard.jsx` shows the value                                                      |
| Caller `className` replaces the card radius                         | ADD     | test "lets a caller className replace the card radius"                                                       |
| axe on both variants and both marks                                 | ADD     | last test renders a `brand` + `symbol` card too                                                              |
| Stories `Default`, `Variants`, `SymbolMark`, `LongQuote`            | ALREADY | `Playground` / `Default` (Raj's long review), `Brand`, `SymbolMark`                                          |
| Story `WithoutScore`                                                | ADD     | story `WithoutScore`                                                                                         |
| Story `PartialScore` (4.5 on an invented review)                    | DROP    | spec §10.1 — only the four real Google reviews, never fabricated; Rating's own stories show halves (Plan 2b) |
| Story `Wall` (three across)                                         | ALREADY | TestimonialWall organism (Plan 4) owns the wall                                                              |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Card` (`asChild`; `default` → `data-surface="light"`, `feature` → `data-surface="soft"`), `Rating` (`variant="diamond" | "symbol"`), `Avatar` (`size="sm"`), `Badge` (`tone="success"`), `Link` (`size="sm"`, `isExternal`).
- Produces: `ReviewCard`, `type ReviewCardProps` (contract §6 + deviation 10). Documented defaults: `variant = "default"`, `mark = "diamond"`, `verifiedLabel = "Verified on Google"`, `hasAvatar = true`. The component adds the curly quotes.

- [ ] **Step 1: Tokens** — none new.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/review-card/review-card.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { ReviewCard } from "./review-card";

const REVIEW = {
  name: "Vikas Kumar",
  meta: "Restaurant · Google review",
  quote: "Very nice and economical food or very tasty food as home",
} as const;

describe("ReviewCard", () => {
  it("quotes the guest in curly quotes inside a blockquote, attributed in the caption", () => {
    const { container } = render(<ReviewCard {...REVIEW} />);
    expect(container.querySelector("blockquote")).toHaveTextContent(`“${REVIEW.quote}”`);
    expect(container.querySelector("figcaption")).toHaveTextContent(REVIEW.name);
    expect(container.querySelector("figcaption")).toHaveTextContent(REVIEW.meta);
  });

  it("shows the score when given one", () => {
    render(<ReviewCard {...REVIEW} rating={5} />);
    expect(screen.getByRole("img", { name: "5 out of 5" })).toBeInTheDocument();
  });

  it("sits on a white light-island card by default", () => {
    const { container } = render(<ReviewCard {...REVIEW} />);
    expect(container.firstElementChild).toHaveAttribute("data-surface", "light");
  });

  it("omits the score and the meta line when neither is given", () => {
    const { container } = render(<ReviewCard name={REVIEW.name} quote={REVIEW.quote} />);
    expect(screen.queryByRole("img", { name: /out of 5/ })).not.toBeInTheDocument();
    expect(container.querySelector("figcaption")).not.toHaveTextContent(REVIEW.meta);
  });

  it("lets a caller className replace the card radius", () => {
    const { container } = render(<ReviewCard {...REVIEW} className="rounded-md" />);
    expect(container.firstElementChild).toHaveClass("rounded-md");
    expect(container.firstElementChild).not.toHaveClass("rounded-lg");
  });

  it("uses the light-pink feature treatment for the brand variant", () => {
    const { container } = render(<ReviewCard {...REVIEW} variant="brand" />);
    expect(container.firstElementChild).toHaveAttribute("data-surface", "soft");
  });

  it("marks a verified review with a chip whose words the page can change", () => {
    const { rerender } = render(<ReviewCard {...REVIEW} isVerified />);
    expect(screen.getByText("Verified on Google")).toBeInTheDocument();
    rerender(<ReviewCard {...REVIEW} isVerified verifiedLabel="Verified guest" />);
    expect(screen.getByText("Verified guest")).toBeInTheDocument();
  });

  it("links to the review at its source, in a new tab", () => {
    render(
      <ReviewCard
        {...REVIEW}
        source={{ label: "View on Google", href: "https://maps.app.goo.gl/32n6SYDUMejsa3NeA" }}
      />
    );
    expect(screen.getByRole("link", { name: /View on Google/ })).toHaveAttribute(
      "target",
      "_blank"
    );
  });

  it("drops the avatar when asked (the handoff's Google reviews)", () => {
    const { container, rerender } = render(<ReviewCard {...REVIEW} />);
    expect(container.querySelector("figcaption")).toHaveTextContent("VK");
    rerender(<ReviewCard {...REVIEW} hasAvatar={false} />);
    expect(container.querySelector("figcaption")).not.toHaveTextContent("VK");
  });

  it("has no accessibility violations with every part shown, on both treatments", async () => {
    const { container } = render(
      <>
        <ReviewCard
          {...REVIEW}
          rating={5}
          isVerified
          source={{ label: "View on Google", href: "https://maps.app.goo.gl/32n6SYDUMejsa3NeA" }}
        />
        <ReviewCard {...REVIEW} rating={4} variant="brand" mark="symbol" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

(Avatar renders two initials, "VK" for "Vikas Kumar" — Task 0 fact g.)

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- review-card 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./review-card`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/review-card/review-card.tsx`:

```tsx
import type { ComponentProps } from "react";

import { BadgeCheck } from "lucide-react";

import { Avatar } from "../../atoms/avatar/avatar";
import { Badge } from "../../atoms/badge/badge";
import { Card } from "../../atoms/card/card";
import { Link } from "../../atoms/link/link";
import { Rating } from "../../atoms/rating/rating";
import { componentVariants } from "../../lib/component-variants";

const reviewCard = componentVariants({
  slots: {
    root: "flex flex-col gap-3.5",
    header: "flex flex-wrap items-center justify-between gap-3",
    quote: "m-0",
    quoteText: "m-0 max-w-text-measure-narrow text-body",
    footer: "flex items-center gap-2.5",
    person: "grid min-w-0 flex-1",
    name: "text-body-sm font-medium text-text-heading",
    meta: "text-caption",
    source: "shrink-0",
  },
  variants: {
    variant: {
      default: { quoteText: "text-text-body", meta: "text-text-subtle" },
      // Feature card (soft surface): heading → pink-800, brand → pink-700.
      brand: { quoteText: "text-text-heading", meta: "text-text-brand" },
    },
  },
});

export interface ReviewCardProps extends ComponentProps<"figure"> {
  name: string;
  /** Outlet and date, or the source: "Restaurant · Google review". */
  meta?: string | undefined;
  /** The review text without quote marks — the component adds them. Real guest copy only. */
  quote: string;
  rating?: number | undefined;
  /** Avatar image URL; without it the Avatar shows initials. */
  avatar?: string | undefined;
  variant?: "default" | "brand" | undefined;
  /** Score glyph: brand diamonds carrying the mark, or the bare mark. */
  mark?: "diamond" | "symbol" | undefined;
  isVerified?: boolean | undefined;
  /** Words on the verified chip. Default "Verified on Google". */
  verifiedLabel?: string | undefined;
  /** Link to the review where it was published. */
  source?: { label: string; href: string } | undefined;
  hasAvatar?: boolean | undefined;
}

/** A real guest review. Never invented copy: the fixtures are the verified Google reviews. */
export function ReviewCard({
  name,
  meta,
  quote,
  rating,
  avatar,
  variant = "default",
  mark = "diamond",
  isVerified = false,
  verifiedLabel = "Verified on Google",
  source,
  hasAvatar = true,
  className,
  ...props
}: ReviewCardProps) {
  const styles = reviewCard({ variant });
  const hasHeader = rating !== undefined || isVerified;

  return (
    <Card
      asChild
      variant={variant === "brand" ? "feature" : "default"}
      padding="md"
      className={styles.root({ className })}
    >
      <figure {...props}>
        {hasHeader ? (
          <div className={styles.header()}>
            {rating === undefined ? null : <Rating value={rating} variant={mark} />}
            {isVerified ? (
              <Badge tone="success" icon={BadgeCheck}>
                {verifiedLabel}
              </Badge>
            ) : null}
          </div>
        ) : null}
        <blockquote className={styles.quote()}>
          <p className={styles.quoteText()}>{`“${quote}”`}</p>
        </blockquote>
        <figcaption className={styles.footer()}>
          {hasAvatar ? <Avatar name={name} src={avatar} size="sm" aria-hidden /> : null}
          <span className={styles.person()}>
            <span className={styles.name()}>{name}</span>
            {meta ? <span className={styles.meta()}>{meta}</span> : null}
          </span>
          {source ? (
            <Link href={source.href} size="sm" isExternal className={styles.source()}>
              {source.label}
            </Link>
          ) : null}
        </figcaption>
      </figure>
    </Card>
  );
}
```

(The Avatar is `aria-hidden`: the name is written beside it, so announcing the initials too would say it twice.)

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- review-card 2>&1 | tail -8`
Expected: PASS (10 tests).

- [ ] **Step 6: Stories — every `ReviewCard.card.html` row, bound to the four real Google reviews (`rates.js` → `google.reviews`; the card's invented names are replaced, spec §10.1), plus the handoff GoogleReviews treatment**

`packages/ui/src/molecules/review-card/review-card.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ReviewCard } from "./review-card";

/** The four verified Google reviews from the handoff (`rates.js`), verbatim. */
const GOOGLE_REVIEWS = [
  {
    name: "Raj Chrome",
    meta: "Restaurant · Google review",
    rating: 5,
    quote:
      "I ordered Mahararaja Thali, steamed Momos and other few extras for the first time. The experience and taste was great😋 A1. Restaurant customer support over phone were well spoken. I will recommend this to my friends. Looking forward to order more […]. Packing was great👌Hatts of Team",
    href: "https://maps.app.goo.gl/uGhWvzmZW7To5etbA",
  },
  {
    name: "Vikas Kumar",
    meta: "Restaurant · Google review",
    rating: 5,
    quote: "Very nice and economical food or very tasty food as home",
    href: "https://maps.app.goo.gl/32n6SYDUMejsa3NeA",
  },
  {
    name: "Abhishek Aggarwal",
    meta: "Restaurant · Google review",
    rating: 4,
    quote: "Good place for indian main course at reasonable price in gurgaon sector 57",
    href: "https://maps.app.goo.gl/GB38hi9T2G2UfQdG9",
  },
  {
    name: "Shrideep Chatterjee",
    meta: "Restaurant · Google review",
    rating: 4,
    quote: "Had Honey chili potato and it was good 👍",
    href: "https://maps.app.goo.gl/s1ghZv4qg3f773Gn8",
  },
] as const;

const [raj, vikas, abhishek, shrideep] = GOOGLE_REVIEWS;

const meta = {
  title: "Molecules/ReviewCard",
  component: ReviewCard,
  args: { name: vikas.name, meta: vikas.meta, quote: vikas.quote, rating: vikas.rating },
  decorators: [
    (Story) => (
      <div className="w-full max-w-article">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Guest quotes on the website and in social proof bands. The score renders as brand diamonds carrying the mark; `mark="symbol"` drops the diamond for the bare mark. Never invent reviews — these must be real guest copy (the fixtures are the four verified Google reviews). `variant="brand"` is the light-pink treatment in a testimonial wall. The handoff\'s Google cards add `isVerified`, `source` and `hasAvatar={false}`.',
      },
    },
  },
} satisfies Meta<typeof ReviewCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "default": two cards side by side. */
export const Default: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-3.5">
      <ReviewCard name={raj.name} meta={raj.meta} quote={raj.quote} rating={raj.rating} />
      <ReviewCard name={vikas.name} meta={vikas.meta} quote={vikas.quote} rating={vikas.rating} />
    </div>
  ),
};

/** Card row `variant="brand"`. */
export const Brand: Story = {
  args: {
    variant: "brand",
    name: abhishek.name,
    meta: abhishek.meta,
    quote: abhishek.quote,
    rating: abhishek.rating,
  },
};

/** Card row "symbol": the bare mark instead of diamonds. */
export const SymbolMark: Story = {
  args: {
    mark: "symbol",
    name: shrideep.name,
    meta: shrideep.meta,
    quote: shrideep.quote,
    rating: shrideep.rating,
  },
};

/** The handoff GoogleReviews card: verified chip, source link, no avatar, bare mark. */
export const GoogleReview: Story = {
  args: {
    mark: "symbol",
    isVerified: true,
    hasAvatar: false,
    source: { label: "View on Google", href: vikas.href },
  },
};

/** No `rating`: the quote carries the card on its own. */
export const WithoutScore: Story = { args: { rating: undefined } };
```

- [ ] **Step 7: Export**

```ts
export { ReviewCard, type ReviewCardProps } from "./molecules/review-card/review-card";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/ui/src/molecules/review-card packages/ui/src/index.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/molecules/review-card packages/ui/src/index.ts
git commit -m "feat(ui): ReviewCard molecule

A real guest review as figure/blockquote/figcaption with score, avatar,
the brand (feature) treatment and the handoff's verified chip and source
link. Stories bind the four verified Google reviews verbatim.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 5: LoyaltyCard

**Files:**

- Create: `packages/ui/src/molecules/loyalty-card/loyalty-card.tsx`, `loyalty-card.test.tsx`, `loyalty-card.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/loyalty-card/loyalty-card.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                     | Ruling  | Where, or the spec clause                                                                               |
| ------------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------- |
| Generated sentence: many / one / none left                   | ALREADY | `it.each` "reads naturally at %i of %i visits"                                                          |
| Reads naturally with an article-first reward ("a kulfi")     | ADD     | test "reads naturally with an article-first reward"                                                     |
| One stamp per goal visit (segmented, never a percentage)     | ALREADY | test "shows the stamps as a segmented progress bar" (`aria-valuemax` = goal); ProgressBar owns segments |
| Track named for AT without printing a caption                | ADD     | same test: the "3 of 6 visits" name is `sr-only`                                                        |
| Stale count clamps to the goal                               | ALREADY | test "never shows more stamps than the goal"                                                            |
| Negative count clamps to zero                                | ALREADY | throws `RangeError` instead (deviation 11) — test "rejects an impossible count…"                        |
| Content defaults `goal = 6`, `reward = "chai"`, `visits = 0` | DROP    | D9 (no content inside the system); contract §6 makes them required                                      |
| `feature` skin on the light-pink card                        | ADD     | test "sits on the light-pink feature card by default" (`data-surface="soft"`)                           |
| `brand` skin flips the ink and the stamps                    | ALREADY | test "floods pink for the brand variant"                                                                |
| Brand symbol hidden from assistive tech                      | ADD     | test "hides the brand symbol from assistive tech…"                                                      |
| Caller `className` replaces the card radius                  | ADD     | test "lets a caller className replace the card radius"                                                  |
| axe on in-progress, complete and brand                       | ADD     | last test renders all three                                                                             |
| `min-w-0` so a long reward shrinks the copy column           | ALREADY | `body` slot; story `LongReward`                                                                         |
| Stories `Default`, `Progress`, `OnBrand`, `Skins`            | ALREADY | `Playground`, `InProgress` / `OneLeft` / `Complete`, `Brand`                                            |
| Stories `Empty`, `LongReward`                                | ADD     | stories `Empty`, `LongReward`                                                                           |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Card` (`variant="feature" | "brand"`, `padding="sm"`), `Logo` (`variant="symbol"`, `isDecorative`), `ProgressBar` (`segments`, `tone="brand" | "inverse"`, `size="sm"` = 6px, `label` + `isLabelHidden` — Plan 2b deviation 3: the name stays, the words are not printed).
- Produces: `LoyaltyCard`, `type LoyaltyCardProps` (contract §6 + deviation 11). Documented defaults: `variant = "feature"`; headline "N more visit(s) and {reward} is on us." / "Your {reward} is on us."; progress label "N of M visits". Throws `RangeError` when `goal` is not a whole number ≥ 1 or `visits` not a whole number ≥ 0.

- [ ] **Step 1: Tokens** — none new (`w-8.5` = the design system's 34px mark).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/loyalty-card/loyalty-card.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { LoyaltyCard } from "./loyalty-card";

describe("LoyaltyCard", () => {
  it.each([
    [3, 6, "3 more visits and chai is on us."],
    [5, 6, "1 more visit and chai is on us."],
    [6, 6, "Your chai is on us."],
  ])("reads naturally at %i of %i visits", (visits, goal, headline) => {
    render(<LoyaltyCard visits={visits} goal={goal} reward="chai" />);
    expect(screen.getByText(headline)).toBeInTheDocument();
  });

  it("reads naturally with an article-first reward", () => {
    render(<LoyaltyCard visits={2} goal={6} reward="a kulfi" />);
    expect(screen.getByText("4 more visits and a kulfi is on us.")).toBeInTheDocument();
  });

  it("lets the page replace the generated headline", () => {
    render(<LoyaltyCard visits={2} goal={6} reward="a kulfi" headline="Two down, four to go." />);
    expect(screen.getByText("Two down, four to go.")).toBeInTheDocument();
  });

  it("shows the stamps as a segmented progress bar", () => {
    render(<LoyaltyCard visits={3} goal={6} reward="chai" />);
    const stamps = screen.getByRole("progressbar", { name: "3 of 6 visits" });
    expect(stamps).toHaveAttribute("aria-valuenow", "3");
    expect(stamps).toHaveAttribute("aria-valuemax", "6");
    // The name is announced, never printed: the sentence above already says it.
    expect(screen.getByText("3 of 6 visits")).toHaveClass("sr-only");
  });

  it("never shows more stamps than the goal", () => {
    render(<LoyaltyCard visits={9} goal={6} reward="chai" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "6");
    expect(screen.getByText("Your chai is on us.")).toBeInTheDocument();
  });

  it("sits on the light-pink feature card by default", () => {
    const { container } = render(<LoyaltyCard visits={3} goal={6} reward="chai" />);
    expect(container.firstElementChild).toHaveAttribute("data-surface", "soft");
  });

  it("hides the brand symbol from assistive tech — the sentence carries the meaning", () => {
    const { container } = render(<LoyaltyCard visits={3} goal={6} reward="chai" />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("lets a caller className replace the card radius", () => {
    const { container } = render(
      <LoyaltyCard visits={3} goal={6} reward="chai" className="rounded-lg" />
    );
    expect(container.firstElementChild).toHaveClass("rounded-lg");
    expect(container.firstElementChild).not.toHaveClass("rounded-xl");
  });

  it("floods pink for the brand variant", () => {
    const { container } = render(
      <LoyaltyCard visits={2} goal={6} reward="a kulfi" variant="brand" />
    );
    expect(container.firstElementChild).toHaveAttribute("data-surface", "brand");
  });

  it.each([[{ visits: 1, goal: 0 }], [{ visits: 1, goal: 2.5 }], [{ visits: -1, goal: 6 }]])(
    "rejects an impossible count %o instead of drawing nonsense",
    (counts) => {
      // A server component is a plain function: call it to see the throw without a React error boundary.
      expect(() => LoyaltyCard({ ...counts, reward: "chai" })).toThrow(RangeError);
    }
  );

  it("has no accessibility violations in progress, complete and on brand", async () => {
    const { container } = render(
      <>
        <LoyaltyCard visits={3} goal={6} reward="chai" />
        <LoyaltyCard visits={6} goal={6} reward="chai" />
        <LoyaltyCard visits={2} goal={6} reward="a kulfi" variant="brand" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- loyalty-card 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./loyalty-card`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/loyalty-card/loyalty-card.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { Card } from "../../atoms/card/card";
import { Logo } from "../../atoms/logo/logo";
import { ProgressBar } from "../../atoms/progress-bar/progress-bar";
import { componentVariants } from "../../lib/component-variants";

const loyaltyCard = componentVariants({
  slots: {
    root: "flex items-center gap-3.5",
    mark: "w-8.5 shrink-0",
    body: "grid min-w-0 flex-1 gap-2",
    headline: "m-0 max-w-none font-display text-body-sm font-bold text-text-heading",
  },
});

export interface LoyaltyCardProps extends ComponentProps<"div"> {
  visits: number;
  goal: number;
  /** What the guest earns, lowercase: "chai", "a kulfi". */
  reward: string;
  variant?: "feature" | "brand" | undefined;
  /** Replaces the generated sentence. */
  headline?: ReactNode | undefined;
}

function assertCount(value: number, minimum: number, name: string): void {
  if (!Number.isInteger(value) || value < minimum) {
    throw new RangeError(
      `LoyaltyCard: ${name} must be a whole number ≥ ${String(minimum)}, got ${String(value)}`
    );
  }
}

/** Design-system copy: reads naturally at many, one and zero visits left. */
function defaultHeadline(remaining: number, reward: string): string {
  if (remaining === 0) return `Your ${reward} is on us.`;
  const visits = remaining === 1 ? "visit" : "visits";
  return `${String(remaining)} more ${visits} and ${reward} is on us.`;
}

/** The loyalty stamp card on the app home and account screen. Segmented progress only. */
export function LoyaltyCard({
  visits,
  goal,
  reward,
  variant = "feature",
  headline,
  className,
  ...props
}: LoyaltyCardProps) {
  assertCount(goal, 1, "goal");
  assertCount(visits, 0, "visits");
  const stamped = Math.min(visits, goal);
  const isBrand = variant === "brand";
  const styles = loyaltyCard();

  return (
    <Card variant={variant} padding="sm" className={styles.root({ className })} {...props}>
      <Logo
        variant="symbol"
        tone={isBrand ? "white" : "pink"}
        isDecorative
        className={styles.mark()}
      />
      <div className={styles.body()}>
        <p className={styles.headline()}>{headline ?? defaultHeadline(goal - stamped, reward)}</p>
        <ProgressBar
          value={stamped}
          max={goal}
          segments={goal}
          label={`${String(stamped)} of ${String(goal)} visits`}
          isLabelHidden
          tone={isBrand ? "inverse" : "brand"}
          size="sm"
        />
      </div>
    </Card>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- loyalty-card 2>&1 | tail -8`
Expected: PASS (15 tests).

- [ ] **Step 6: Stories — the four `LoyaltyCard.card.html` rows**

`packages/ui/src/molecules/loyalty-card/loyalty-card.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { LoyaltyCard } from "./loyalty-card";

const meta = {
  title: "Molecules/LoyaltyCard",
  component: LoyaltyCard,
  args: { visits: 3, goal: 6, reward: "chai" },
  decorators: [
    (Story) => (
      <div className="w-full max-w-text-measure-prose">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The loyalty stamp card on the app home and account screen. The sentence is generated so it always reads naturally at many, one and zero visits left (`headline` replaces it). Segmented ProgressBar only — never a percentage bar here.",
      },
    },
  },
} satisfies Meta<typeof LoyaltyCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "in progress". */
export const InProgress: Story = {};

/** Card row "one left" — the copy adapts. */
export const OneLeft: Story = { args: { visits: 5 } };

/** Card row "complete". */
export const Complete: Story = { args: { visits: 6 } };

/** Card row `variant="brand"`. */
export const Brand: Story = { args: { variant: "brand", visits: 2, reward: "a kulfi" } };

/** Nothing earned yet: every stamp empty, and the sentence still reads plainly. */
export const Empty: Story = { args: { visits: 0 } };

/** A longer reward shrinks the copy column instead of pushing the stamps off the card. */
export const LongReward: Story = { args: { visits: 4, goal: 8, reward: "a gulkand kulfi" } };
```

- [ ] **Step 7: Export**

```ts
export { LoyaltyCard, type LoyaltyCardProps } from "./molecules/loyalty-card/loyalty-card";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/ui/src/molecules/loyalty-card packages/ui/src/index.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/molecules/loyalty-card packages/ui/src/index.ts
git commit -m "feat(ui): LoyaltyCard molecule

Stamp card with segmented progress and the design system's generated
sentence (many / one / zero left), overridable by headline. Impossible
counts throw instead of drawing nonsense.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 6: FilterBar

**Files:**

- Create: `packages/ui/src/molecules/filter-bar/filter-bar.tsx`, `filter-bar.test.tsx`, `filter-bar.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/filter-bar/filter-bar.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                                 | Ruling  | Where, or the spec clause                                                                                        |
| ---------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------- |
| One pill per category inside a named group                                               | ALREADY | named `radiogroup` of `radio` items (test "is a named radio group…")                                             |
| Default group name "Filter by category"                                                  | ALREADY | `label` is required (contract §6) — no copy default (D9)                                                         |
| Exactly one pill selected; the pressed value is reported                                 | ALREADY | tests "chooses a filter…", "keeps exactly one filter chosen…"                                                    |
| An option's value is separate from its label                                             | ALREADY | options are `{ value, label }` (test reports `"sweets"` for "Sweets")                                            |
| Bare-string options                                                                      | DROP    | spec §8.2 — object lists only (`{ value, label }`)                                                               |
| Scrolls on one line by default, wraps with `isWrapping`                                  | ALREADY | test "scrolls on one line by default…"                                                                           |
| The statement badge is not a filter                                                      | ADD     | assertion in "pins the statement badge…": still one radio per option                                             |
| Trailing control pinned at the end, never squeezed                                       | ADD     | `trailing` wrapper slot `shrink-0` (the badge already has it)                                                    |
| Without a handler, a press changes nothing                                               | ALREADY | superseded: uncontrolled by default (`defaultValue`), controlled via `value` (test "follows a controlled value") |
| Caller `className` replaces its own gap                                                  | ADD     | test "lets a caller className replace its own gap"                                                               |
| axe with note, trailing and icons                                                        | ALREADY | last test                                                                                                        |
| Stories `Default`, `Wrapping`, `WithStatement`, `Scrolling`, `WithIcons`, `Narrow` (360) | ALREADY | `Playground`, `Wrap` (with the note), `Scroll` (`w-90` = 360px), `Icons`                                         |
| Story `WithTrailingControl`                                                              | ADD     | story `WithTrailing`                                                                                             |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `ToggleGroup` from `radix-ui` (verified in `packages/ui/node_modules/radix-ui` → `@radix-ui/react-toggle-group`: `type="single"` renders `role="radiogroup"` with items `role="radio"` + `aria-checked`, roving focus on by default, and calls `onValueChange("")` when the pressed item is pressed again), `tagVariants`, `Icon`, `Badge` (`tone="success"`, `icon={Leaf}`).
- Produces: `FilterBar`, `type FilterBarProps`, `type FilterOption` (contract §6 + deviation 6). **Client component.** Uncontrolled default: the first option. RHF: `value` / `onValueChange` for `<Controller>`.

- [ ] **Step 1: Tokens** — none new (the chips are Tag skins; `gap-2.5` = the design system's 10px).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/filter-bar/filter-bar.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Clock, Flame } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { FilterBar } from "./filter-bar";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "small-plates", label: "Small Plates" },
  { value: "all-day", label: "All Day" },
  { value: "sweets", label: "Sweets" },
];

describe("FilterBar", () => {
  it("is a named radio group with the first option chosen by default", () => {
    render(<FilterBar label="Menu category" options={CATEGORIES} />);
    expect(screen.getByRole("radiogroup", { name: "Menu category" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "All" })).toHaveAttribute("aria-checked", "true");
  });

  it("chooses a filter on click and reports it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<FilterBar label="Menu category" options={CATEGORIES} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("radio", { name: "Sweets" }));
    expect(screen.getByRole("radio", { name: "Sweets" })).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).toHaveBeenLastCalledWith("sweets");
  });

  it("keeps exactly one filter chosen when the chosen one is pressed again", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <FilterBar
        label="Menu category"
        options={CATEGORIES}
        defaultValue="sweets"
        onValueChange={onValueChange}
      />
    );
    await user.click(screen.getByRole("radio", { name: "Sweets" }));
    expect(screen.getByRole("radio", { name: "Sweets" })).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("moves with the arrow keys and chooses with Space", async () => {
    const user = userEvent.setup();
    render(<FilterBar label="Menu category" options={CATEGORIES} />);
    await user.tab();
    expect(screen.getByRole("radio", { name: "All" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Small Plates" })).toHaveFocus();
    await user.keyboard(" ");
    expect(screen.getByRole("radio", { name: "Small Plates" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
  });

  it("follows a controlled value", () => {
    const { rerender } = render(
      <FilterBar label="Menu category" options={CATEGORIES} value="all-day" />
    );
    expect(screen.getByRole("radio", { name: "All Day" })).toHaveAttribute("aria-checked", "true");
    rerender(<FilterBar label="Menu category" options={CATEGORIES} value="sweets" />);
    expect(screen.getByRole("radio", { name: "Sweets" })).toHaveAttribute("aria-checked", "true");
  });

  it("scrolls on one line by default and wraps on request", () => {
    const { container, rerender } = render(
      <FilterBar label="Menu category" options={CATEGORIES} />
    );
    expect(container.firstElementChild).toHaveClass("overflow-x-auto", "flex-nowrap");
    rerender(<FilterBar label="Menu category" options={CATEGORIES} isWrapping />);
    expect(container.firstElementChild).toHaveClass("flex-wrap");
  });

  it("pins the statement badge and the trailing slot after the filters", () => {
    render(
      <FilterBar
        label="Menu category"
        options={CATEGORIES}
        note="100% Vegetarian"
        trailing={<button type="button">Search</button>}
      />
    );
    expect(screen.getByText("100% Vegetarian")).toBeInTheDocument();
    // A standing statement, never a filter: still exactly one radio per option.
    expect(screen.getAllByRole("radio")).toHaveLength(CATEGORIES.length);
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
  });

  it("lets a caller className replace its own gap", () => {
    const { container } = render(
      <FilterBar label="Menu category" options={CATEGORIES} className="gap-1" />
    );
    expect(container.firstElementChild).toHaveClass("gap-1");
    expect(container.firstElementChild).not.toHaveClass("gap-2.5");
  });

  it("has no accessibility violations with icons, note and trailing", async () => {
    const { container } = render(
      <FilterBar
        label="Dietary and speed filters"
        options={[
          { value: "spicy", label: "Hot", icon: Flame },
          { value: "quick", label: "Under 15 min", icon: Clock },
        ]}
        note="100% Vegetarian"
        isWrapping
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- filter-bar 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./filter-bar`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/filter-bar/filter-bar.tsx`:

```tsx
"use client";

import { Leaf } from "lucide-react";
import { ToggleGroup } from "radix-ui";
import { type ReactNode, useState } from "react";

import { Badge } from "../../atoms/badge/badge";
import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { tagVariants } from "../../atoms/tag/tag";
import { componentVariants } from "../../lib/component-variants";

export interface FilterOption {
  value: string;
  label: string;
  icon?: IconComponent | undefined;
}

export interface FilterBarProps {
  /** Accessible name of the radio group, e.g. "Menu category". */
  label: string;
  options: FilterOption[];
  value?: string | undefined;
  /** Uncontrolled starting filter. Default: the first option. */
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  /** Wrap onto more rows (the website) instead of scrolling on one line (the app). */
  isWrapping?: boolean | undefined;
  /** A static statement pinned after the filters, e.g. "100% Vegetarian". */
  note?: ReactNode | undefined;
  trailing?: ReactNode | undefined;
  className?: string | undefined;
}

const filterBar = componentVariants({
  slots: {
    root: "flex items-center gap-2.5",
    group: "flex gap-2.5",
    // Neither the statement badge nor the trailing control is squeezed by a long rail.
    note: "shrink-0",
    trailing: "shrink-0",
  },
  variants: {
    isWrapping: {
      true: { root: "flex-wrap", group: "flex-wrap" },
      false: { root: "flex-nowrap overflow-x-auto pb-1", group: "flex-nowrap" },
    },
  },
});

/** Menu category rail. Exactly one filter is chosen at a time; the rail scrolls unless it wraps. */
export function FilterBar({
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  isWrapping = false,
  note,
  trailing,
  className,
}: FilterBarProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(
    defaultValue ?? options[0]?.value ?? ""
  );
  const selected = value ?? uncontrolledValue;
  const styles = filterBar({ isWrapping });

  const handleValueChange = (next: string) => {
    // Radix clears a single group when the chosen item is pressed again; a filter always has one.
    if (next === "") return;
    setUncontrolledValue(next);
    onValueChange?.(next);
  };

  return (
    <div className={styles.root({ className })}>
      <ToggleGroup.Root
        type="single"
        aria-label={label}
        value={selected}
        onValueChange={handleValueChange}
        className={styles.group()}
      >
        {options.map((option) => {
          const tag = tagVariants({ isSelected: option.value === selected, isInteractive: true });
          return (
            <ToggleGroup.Item key={option.value} value={option.value} className={tag.root()}>
              {option.icon === undefined ? null : <Icon icon={option.icon} size="sm" />}
              <span className={tag.label()}>{option.label}</span>
            </ToggleGroup.Item>
          );
        })}
      </ToggleGroup.Root>
      {note ? (
        <Badge tone="success" icon={Leaf} className={styles.note()}>
          {note}
        </Badge>
      ) : null}
      {trailing ? <div className={styles.trailing()}>{trailing}</div> : null}
    </div>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- filter-bar 2>&1 | tail -8`
Expected: PASS (9 tests).

- [ ] **Step 6: Stories — `FilterBar.card.html` rows "wrap" (website), "scroll" (app), "icons", plus Playground, OnSurfaces and a keyboard `play`**

`packages/ui/src/molecules/filter-bar/filter-bar.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Clock, Flame, Leaf, Search } from "lucide-react";
import { expect } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { OnSurfaces } from "../../lib/story-surfaces";
import { FilterBar } from "./filter-bar";

const WEBSITE = [
  { value: "all", label: "All" },
  { value: "small-plates", label: "Small Plates" },
  { value: "all-day", label: "All Day" },
  { value: "chai-coffee", label: "Chai & Coffee" },
  { value: "sweets", label: "Sweets" },
];

const meta = {
  title: "Molecules/FilterBar",
  component: FilterBar,
  args: { label: "Menu category", options: WEBSITE, note: "100% Vegetarian", isWrapping: true },
  decorators: [
    (Story) => (
      <div className="w-full max-w-article">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Menu category rail on both the website and the app. Scrolls horizontally by default (the app pattern); pass `isWrapping` for the website. Exactly one option is selected at a time — pressing the chosen filter keeps it. Radix ToggleGroup items styled with the Tag skin; arrow keys move, Space/Enter choose.",
      },
    },
  },
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "wrap" — the website, with the statement badge. */
export const Wrap: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Sweets" }));
    await expect(canvas.getByRole("radio", { name: "Sweets" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    await userEvent.keyboard("{ArrowLeft} ");
    await expect(canvas.getByRole("radio", { name: "Chai & Coffee" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
  },
};

/** Card row "scroll" — the app rail, one line. */
export const Scroll: Story = {
  args: {
    isWrapping: false,
    note: undefined,
    options: [...WEBSITE, { value: "bar", label: "Bar" }],
  },
  decorators: [
    (Story) => (
      <div className="w-90">
        <Story />
      </div>
    ),
  ],
};

/** Card row "icons". */
export const Icons: Story = {
  args: {
    label: "Dietary and speed filters",
    note: undefined,
    defaultValue: "jain",
    options: [
      { value: "jain", label: "Jain", icon: Leaf },
      { value: "spicy", label: "Hot", icon: Flame },
      { value: "quick", label: "Under 15 min", icon: Clock },
    ],
  },
};

/** `trailing`: a control pinned to the end of the rail, never squeezed by it. */
export const WithTrailing: Story = {
  args: {
    trailing: (
      <Button size="sm" variant="ghost" icon={Search}>
        Search
      </Button>
    ),
  },
};

export const OnSurfaces: Story = {
  render: (args) => (
    <OnSurfaces>
      <div className="min-w-0 flex-1">
        <FilterBar {...args} />
      </div>
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export {
  FilterBar,
  type FilterBarProps,
  type FilterOption,
} from "./molecules/filter-bar/filter-bar";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/ui/src/molecules/filter-bar packages/ui/src/index.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/molecules/filter-bar packages/ui/src/index.ts
git commit -m "feat(ui): FilterBar molecule

Category rail on Radix ToggleGroup (radiogroup semantics, roving focus)
styled with the Tag skin, never a nested Tag button. Exactly one filter
stays chosen; scrolls on one line or wraps; statement badge and
trailing slot.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 7: LogoLockup

**Files:**

- Create: `packages/ui/src/molecules/logo-lockup/logo-lockup.tsx`, `logo-lockup.test.tsx`, `logo-lockup.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/logo-lockup/logo-lockup.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                | Ruling  | Where, or the spec clause                                                                         |
| ----------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------- |
| Mark named for assistive tech                                           | ALREADY | test "signs the artwork…" (Logo's default title)                                                  |
| Tagline set once, beside the wordmark as text                           | ALREADY | the tagline is drawn into the lockup artwork (spec §7.1), so it scales with the mark              |
| `tagline` override; story `AlternateTagline`                            | DROP    | spec §7.1 / §9.2 — the tagline is supplied artwork, not copy; contract §6 has no `tagline`        |
| `hasTagline={false}` → bare wordmark                                    | ALREADY | test "drops to the wordmark…"                                                                     |
| `label=""` hides the mark when the artwork already names the brand      | ADD     | `isDecorative` (deviation 18); test "hides the logo from assistive tech…"                         |
| Mark re-heighted per size; 140px wordmark floor                         | ALREADY | widths 200 / 240 / 280 / 360 (deviation 12); 200 is the lockup minimum                            |
| Clear space per size                                                    | ALREADY | `it.each` size test (`p-8` … `p-15`)                                                              |
| `hasClearSpace={false}` when the parent already reserves it             | ALREADY | `className="p-0"` replaces the padding (merge); test "drops its clear space…"; story `ClearSpace` |
| `white` tone; `align="center"`                                          | ALREADY | tests "signs the artwork…", "centres the signature…"                                              |
| Default tone `brand`                                                    | DROP    | D2 — the design system's default is `white` (deviation 12)                                        |
| Caller `className` merges                                               | ADD     | test "drops its clear space…" (`p-0` replaces `p-10`)                                             |
| axe on pink, white-centred-lg and decorative wordmark                   | ADD     | last test renders all three                                                                       |
| Stories `Default`, `Sizes`, `OnBrand`, `CentredOnInk`, `WithoutTagline` | ALREADY | `Playground` / `Pink`, `Sizes`, `White`, `Centred`, `Wordmark`                                    |
| Story `ClearSpace`                                                      | ADD     | story `ClearSpace`                                                                                |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Logo` (`variant="lockup" | "wordmark"`, `tone`, `isDecorative`, width via `className` — Plan 1 Task 7 proves a consumer width class replaces `w-logo-lockup`).
- Produces: `LogoLockup`, `type LogoLockupProps` (contract §6 + deviations 12 and 18). Defaults: `tone = "white"`, `size = "md"`, `hasTagline = true`, `align = "start"`, `isDecorative = false`.

- [ ] **Step 1: Tokens** — none new. Widths and clear space are 4px-scale steps:

| `size` | width (kits)        | class  | clear space ≈ width ÷ 6 | class  |
| ------ | ------------------- | ------ | ----------------------- | ------ |
| `sm`   | 200 (the minimum)   | `w-50` | 33 → 32                 | `p-8`  |
| `md`   | 240 (Logo default)  | `w-60` | 40                      | `p-10` |
| `lg`   | 280 (feed/ad kits)  | `w-70` | 47 → 48                 | `p-12` |
| `xl`   | 360 (wide canvases) | `w-90` | 60                      | `p-15` |

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/logo-lockup/logo-lockup.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { LogoLockup } from "./logo-lockup";

describe("LogoLockup", () => {
  it("signs the artwork with the white lockup, tagline included, by default", () => {
    render(<LogoLockup />);
    const logo = screen.getByRole("img", { name: "Pink Paprikaa — India's First Desi Urban Café" });
    expect(logo).toHaveClass("text-ink-000", "w-60");
  });

  it("drops to the wordmark when the tagline cannot read", () => {
    render(<LogoLockup hasTagline={false} />);
    expect(screen.getByRole("img", { name: "Pink Paprikaa" })).toBeInTheDocument();
  });

  it.each([
    ["sm", "w-50", "p-8"],
    ["md", "w-60", "p-10"],
    ["lg", "w-70", "p-12"],
    ["xl", "w-90", "p-15"],
  ] as const)("at size %s is %s wide with %s of clear space", (size, width, padding) => {
    const { container } = render(<LogoLockup size={size} />);
    expect(container.firstElementChild).toHaveClass(padding);
    expect(screen.getByRole("img")).toHaveClass(width);
  });

  it("paints the pink tone on light artwork", () => {
    render(<LogoLockup tone="pink" />);
    expect(screen.getByRole("img")).toHaveClass("text-pink-500");
  });

  it("centres the signature when asked", () => {
    const { container } = render(<LogoLockup align="center" />);
    expect(container.firstElementChild).toHaveClass("justify-items-center");
  });

  it("hides the logo from assistive tech when the artwork already names the brand", () => {
    render(<LogoLockup isDecorative />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("drops its clear space when the parent already reserves it", () => {
    const { container } = render(<LogoLockup className="p-0" />);
    expect(container.firstElementChild).toHaveClass("p-0");
    expect(container.firstElementChild).not.toHaveClass("p-10");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <LogoLockup tone="pink" />
        <LogoLockup tone="white" align="center" size="lg" />
        <LogoLockup tone="pink" size="sm" hasTagline={false} isDecorative />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- logo-lockup 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./logo-lockup`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/logo-lockup/logo-lockup.tsx`:

```tsx
import type { ComponentProps } from "react";

import { Logo } from "../../atoms/logo/logo";
import { componentVariants } from "../../lib/component-variants";

const logoLockup = componentVariants({
  slots: { root: "grid", logo: "" },
  variants: {
    // Clear space around the logo = the height of its "P" ≈ one sixth of the lockup's width.
    size: {
      sm: { root: "p-8", logo: "w-50" },
      md: { root: "p-10", logo: "w-60" },
      lg: { root: "p-12", logo: "w-70" },
      xl: { root: "p-15", logo: "w-90" },
    },
    align: {
      start: { root: "justify-items-start" },
      center: { root: "justify-items-center" },
    },
  },
});

export interface LogoLockupProps extends ComponentProps<"div"> {
  /** `white` on pink, ink or photography; `pink` on light artwork; `badge` on its own plate. */
  tone?: "pink" | "white" | "badge" | undefined;
  /** Lockup width: 200 / 240 / 280 / 360px. Never below 200 with the tagline. */
  size?: "sm" | "md" | "lg" | "xl" | undefined;
  /** `false` drops to the wordmark — only where the tagline cannot read. */
  hasTagline?: boolean | undefined;
  align?: "start" | "center" | undefined;
  /** Hide the logo from assistive tech when the artwork already names the brand in text nearby. */
  isDecorative?: boolean | undefined;
}

/**
 * The signature that closes a piece of marketing artwork. The tagline is part of the supplied
 * artwork, so it scales with the mark and can never drift out of sync.
 */
export function LogoLockup({
  tone = "white",
  size = "md",
  hasTagline = true,
  align = "start",
  isDecorative = false,
  className,
  ...props
}: LogoLockupProps) {
  const styles = logoLockup({ size, align });
  return (
    <div className={styles.root({ className })} {...props}>
      <Logo
        variant={hasTagline ? "lockup" : "wordmark"}
        tone={tone}
        isDecorative={isDecorative}
        className={styles.logo()}
      />
    </div>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- logo-lockup 2>&1 | tail -8`
Expected: PASS (11 tests).

- [ ] **Step 6: Stories — `LogoLockup.card.html` rows pink / white on brand / centred on ink / `hasTagline={false}`, plus Sizes**

`packages/ui/src/molecules/logo-lockup/logo-lockup.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { LogoLockup } from "./logo-lockup";

const meta = {
  title: "Molecules/LogoLockup",
  component: LogoLockup,
  args: { tone: "pink", size: "sm" },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'The signature that closes a piece of marketing artwork — a post, a story, an ad. The tagline is part of the supplied logo artwork, so it scales with the mark and can never drift out of sync. Keep the lockup at 200px or wider; below that pass `hasTagline={false}` for the wordmark. On a coloured field use `tone="white"`; on light artwork `tone="pink"`. The padding is the brand\'s clear space (the height of the "P"); pass `className="p-0"` only where the parent already reserves it (a PostFrame\'s canvas pad). `isDecorative` hides the logo from assistive tech when the artwork names the brand in text nearby.',
      },
    },
  },
} satisfies Meta<typeof LogoLockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "pink". */
export const Pink: Story = {};

/** Card row "white", on the brand field. */
export const White: Story = {
  args: { tone: "white" },
  render: (args) => (
    <div data-surface="brand" className="rounded-lg bg-surface-brand">
      <LogoLockup {...args} />
    </div>
  ),
};

/** Card row "centred", on ink (the card's 180px snaps to the 200px minimum). */
export const Centred: Story = {
  args: { tone: "white", align: "center" },
  render: (args) => (
    <div data-surface="ink" className="w-full rounded-lg bg-surface-inverse">
      <LogoLockup {...args} />
    </div>
  ),
};

/** Card row `hasTagline={false}` — the wordmark. */
export const Wordmark: Story = { args: { hasTagline: false } };

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-end gap-6">
      {(["sm", "md", "lg", "xl"] as const).map((size) => (
        <div key={size} className="grid justify-items-start gap-2">
          <LogoLockup
            {...args}
            size={size}
            className="border border-dashed border-border-default"
          />
          <span className="font-mono text-mono text-text-muted">{size}</span>
        </div>
      ))}
    </div>
  ),
};

/** The clear space made visible, then dropped with `className="p-0"` where the parent reserves it. */
export const ClearSpace: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-start gap-4">
      <div className="rounded-lg bg-surface-page-alt">
        <LogoLockup {...args} />
      </div>
      <div className="rounded-lg bg-surface-page-alt">
        <LogoLockup {...args} className="p-0" />
      </div>
    </div>
  ),
};
```

- [ ] **Step 7: Calibrate the clear space against the artwork**

Run `pnpm nx run @pink-paprikaa-web/storybook:serve`, open `Molecules/LogoLockup` → `Sizes`, and with DevTools measure the rendered height of the lockup's "P" (cap top to baseline) at `md`. If it is not within 10% of 40px (width ÷ 6), replace the four padding classes with the nearest 4px steps for the measured ratio (e.g. ÷ 5 → `p-10 / p-12 / p-14 / p-18`) in both the component and the test, and record the measurement in the commit body.

- [ ] **Step 8: Export**

```ts
export { LogoLockup, type LogoLockupProps } from "./molecules/logo-lockup/logo-lockup";
```

- [ ] **Step 9: Gate** — `<paths>` = `packages/ui/src/molecules/logo-lockup packages/ui/src/index.ts`.

- [ ] **Step 10: Commit**

```bash
git add packages/ui/src/molecules/logo-lockup packages/ui/src/index.ts
git commit -m "feat(ui): LogoLockup molecule

Canvas signature: the lockup artwork (tagline drawn in) at 200/240/280/
360px with the brand's clear space as padding, the wordmark below the
tagline's legible size.

<paste the P-height measurement from Step 7>

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 8: OfferSeal

**Files:**

- Create: `packages/design-tokens/tokens/component/offer-seal.json`
- Create: `packages/ui/src/molecules/offer-seal/offer-seal.tsx`, `offer-seal.test.tsx`, `offer-seal.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`, `SPACING`, `RADIUS`), `packages/design-tokens/contrast-pairs.json`, `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/offer-seal/offer-seal.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                               | Ruling  | Where, or the spec clause                                                                     |
| ---------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------- |
| Value, label and note printed                                          | ALREADY | test "reads as the value, the label and the note"                                             |
| The value alone when there is nothing else to say                      | ADD     | test "renders the value alone…"                                                               |
| A rupee value printed as written (`₹99`)                               | ALREADY | story `Values` (`formatRupees(99)`); axe test uses `₹130`                                     |
| Rotated diamond, text counter-rotated upright                          | ALREADY | test "is a rotated diamond…"                                                                  |
| Three flat fills, never a gradient                                     | ADD     | `not.toMatch(/gradient/)` in the tone test                                                    |
| Old classes `bg-brand-primary`, `shadow-elevation3`, `rounded-5`       | DROP    | D4 (design-system token names)                                                                |
| Fixed side per size (128 / 192 / 280)                                  | ALREADY | `size` sm 110 · md 156 · lg 260 · xl 360 (deviation 7); test "scales the whole seal…"         |
| Sits in flow until a corner is asked for                               | ALREADY | test "sits in flow when it does not bleed"                                                    |
| Hangs off each corner by a clamped offset (18% self translate)         | ALREADY | `corner` × `bleed` enum ≤ 0.18 (Review Focus 5); the arbitrary `-translate-x-[18%]` is banned |
| Caller `className` replaces its own shadow                             | ADD     | test "lets a caller className replace its own shadow"                                         |
| axe on three tones and sizes                                           | ADD     | last test renders all three                                                                   |
| Stories `Default`, `Tones`, `Sizes`, `Values`, `WithNote`, `OnACorner` | ALREADY | `Playground`, `Tones`, `Sizes`, `Values` (third seal has the note), `BleedOffCorner`          |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `componentVariants`; Tailwind v4 fraction translates (`translate-x-1/12`, `-translate-y-1/6` — verified: `supportsFractions` in `tailwindcss@4.3.3/dist/lib.js` accepts any positive-integer fraction).
- Produces: `OfferSeal`, `type OfferSealProps` (contract §6 + deviation 7). Defaults: `size = "lg"`, `tone = "light"`, `bleed = "none"`, `corner = "top-right"`. With `bleed="none"` the seal sits in flow (the parent places it); with `sm`/`md` it is absolutely placed on `corner`.

- [ ] **Step 1: Component tokens — the whole seal scales from one font size**

Every seal dimension is in `em` of the seal's own font size, so a `size` step sets one font size and the side, radius and type all follow (the design system scales everything from `size`).

Create `packages/design-tokens/tokens/component/offer-seal.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "offer-seal": {
      "$value": "10em",
      "$description": "Seal side, in em of the seal's own font size (sm 11px → 110px … xl 36px → 360px)."
    }
  },
  "radius": {
    "$type": "dimension",
    "offer-seal": {
      "$value": "1.4em",
      "$description": "0.14 × the side (design-system OfferSeal)."
    }
  },
  "text": {
    "$type": "typography",
    "offer-seal-sm": {
      "$value": { "fontSize": "11px" },
      "$description": "Side 110px — the design-system card and the display-ad kits."
    },
    "offer-seal-md": {
      "$value": { "fontSize": "15.6px" },
      "$description": "Side 156px — the handoff hero seal."
    },
    "offer-seal-lg": {
      "$value": { "fontSize": "26px" },
      "$description": "Side 260px — the design-system default for 1080px canvases."
    },
    "offer-seal-xl": {
      "$value": { "fontSize": "36px" },
      "$description": "Side 360px — the feed-post kit."
    },
    "offer-seal-value": {
      "$value": {
        "fontSize": "3em",
        "lineHeight": 1,
        "letterSpacing": "-0.03em",
        "fontWeight": "{font-weight.black}"
      },
      "$description": "The number, 0.3 × side."
    },
    "offer-seal-label": {
      "$value": {
        "fontSize": "1em",
        "lineHeight": 1.2,
        "letterSpacing": "0.14em",
        "fontWeight": "{font-weight.bold}"
      },
      "$description": "The uppercase word under the number, 0.1 × side."
    },
    "offer-seal-note": {
      "$value": { "fontSize": "0.65em", "lineHeight": 1.3, "fontWeight": "{font-weight.regular}" },
      "$description": "The small note, 0.065 × side."
    }
  }
}
```

In `packages/ui/src/lib/component-variants.ts` append: to `TEXT` `"offer-seal-sm", "offer-seal-md", "offer-seal-lg", "offer-seal-xl", "offer-seal-value", "offer-seal-label", "offer-seal-note",`; to `SPACING` `"offer-seal",`; to `RADIUS` `"offer-seal",`.

Append to `groups` in `packages/design-tokens/contrast-pairs.json`:

```json
{
  "id": "offer-seal",
  "surface": null,
  "pairs": [
    ["color-pink-600", "color-ink-000"],
    ["color-ink-900", "color-turmeric"]
  ],
  "min": 4.5
},
{
  "id": "offer-seal-brand",
  "surface": null,
  "pairs": [["color-ink-000", "color-pink-500"]],
  "min": 3,
  "exception": "brand-fill"
}
```

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -6`
Expected: PASS; `theme.css` has `--spacing-offer-seal: 10em;`, `--radius-offer-seal: 1.4em;`, `--text-offer-seal-value: 3em;` with its sub-properties.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/offer-seal/offer-seal.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { OfferSeal } from "./offer-seal";

const CORNERS = ["top-right", "top-left", "bottom-right", "bottom-left"] as const;

/** The seal's outward offset per axis, read from its `translate-{x,y}-a/b` classes. */
function bleedFractions(seal: Element | null): number[] {
  const classes = seal?.getAttribute("class") ?? "";
  return [...classes.matchAll(/translate-[xy]-(\d+)\/(\d+)/g)].map(
    (match) => Number(match[1]) / Number(match[2])
  );
}

describe("OfferSeal", () => {
  it("reads as the value, the label and the note", () => {
    render(<OfferSeal value="50%" label="Off" note="till 11:30pm" />);
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("Off")).toBeInTheDocument();
    expect(screen.getByText("till 11:30pm")).toBeInTheDocument();
  });

  it("renders the value alone when there is nothing else to say", () => {
    const { container } = render(<OfferSeal value="1+1" />);
    expect(container.firstElementChild).toHaveTextContent(/^1\+1$/);
  });

  it("is a rotated diamond, never a circle, with the text counter-rotated upright", () => {
    const { container } = render(<OfferSeal value="1+1" label="Free" />);
    expect(container.firstElementChild).toHaveClass("rotate-45", "rounded-offer-seal");
    expect(screen.getByText("1+1").parentElement).toHaveClass("-rotate-45");
  });

  it.each([
    ["sm", "text-offer-seal-sm"],
    ["md", "text-offer-seal-md"],
    ["lg", "text-offer-seal-lg"],
    ["xl", "text-offer-seal-xl"],
  ] as const)("scales the whole seal from one size step (%s)", (size, sizeClass) => {
    const { container } = render(<OfferSeal value="50%" size={size} />);
    expect(container.firstElementChild).toHaveClass(sizeClass, "size-offer-seal");
  });

  it.each([
    ["light", "bg-ink-000", "text-pink-600"],
    ["brand", "bg-pink-500", "text-ink-000"],
    ["turmeric", "bg-turmeric", "text-ink-900"],
  ] as const)("paints the %s tone", (tone, background, text) => {
    const { container } = render(<OfferSeal value="50%" tone={tone} />);
    expect(container.firstElementChild).toHaveClass(background, text);
    // One flat fill — never a gradient, never a starburst.
    expect(container.firstElementChild?.getAttribute("class")).not.toMatch(/gradient/);
  });

  it("sits in flow when it does not bleed", () => {
    const { container } = render(<OfferSeal value="50%" />);
    expect(container.firstElementChild).not.toHaveClass("absolute");
    expect(bleedFractions(container.firstElementChild)).toEqual([]);
  });

  it.each(CORNERS)(
    "never bleeds a corner further than 0.18 × its side (%s) — the value reaches 0.32 × side from the centre",
    (corner) => {
      for (const bleed of ["sm", "md"] as const) {
        const { container, unmount } = render(
          <OfferSeal value="50%" label="Off" corner={corner} bleed={bleed} />
        );
        const fractions = bleedFractions(container.firstElementChild);
        expect(container.firstElementChild).toHaveClass("absolute");
        expect(fractions).toHaveLength(2);
        for (const fraction of fractions) expect(fraction).toBeLessThanOrEqual(0.18);
        unmount();
      }
    }
  );

  it("lets a caller className replace its own shadow", () => {
    const { container } = render(<OfferSeal value="50%" className="shadow-2" />);
    expect(container.firstElementChild).toHaveClass("shadow-2");
    expect(container.firstElementChild).not.toHaveClass("shadow-3");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <OfferSeal value="₹130" label="Launch" tone="brand" size="md" />
        <OfferSeal value="50%" label="Off" note="till 11:30pm" tone="light" size="lg" />
        <OfferSeal value="1+1" label="Free" tone="turmeric" size="sm" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- offer-seal 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./offer-seal`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/offer-seal/offer-seal.tsx`:

```tsx
import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";

const offerSeal = componentVariants({
  slots: {
    root: "size-offer-seal rounded-offer-seal grid shrink-0 rotate-45 place-items-center shadow-3",
    content: "grid -rotate-45 gap-0.5 text-center",
    value: "text-offer-seal-value font-display",
    label: "text-offer-seal-label font-display uppercase",
    note: "text-offer-seal-note font-body",
  },
  variants: {
    size: {
      sm: { root: "text-offer-seal-sm" },
      md: { root: "text-offer-seal-md" },
      lg: { root: "text-offer-seal-lg" },
      xl: { root: "text-offer-seal-xl" },
    },
    tone: {
      light: { root: "bg-ink-000 text-pink-600" },
      brand: { root: "bg-pink-500 text-ink-000" },
      turmeric: { root: "bg-turmeric text-ink-900" },
    },
    bleed: { none: {}, sm: { root: "absolute" }, md: { root: "absolute" } },
    corner: { "top-right": {}, "top-left": {}, "bottom-right": {}, "bottom-left": {} },
  },
  // Bleed is a fraction of the seal's own side. The counter-rotated value reaches 0.32 × side from
  // the centre, so an offset past 0.18 × side clips it (design-system readme §4b): the only steps
  // are 1/12 and 1/6, which is the design system's clamp made a compile-time guarantee.
  compoundVariants: [
    {
      bleed: "sm",
      corner: "top-right",
      class: { root: "top-0 right-0 translate-x-1/12 -translate-y-1/12" },
    },
    {
      bleed: "sm",
      corner: "top-left",
      class: { root: "top-0 left-0 -translate-x-1/12 -translate-y-1/12" },
    },
    {
      bleed: "sm",
      corner: "bottom-right",
      class: { root: "right-0 bottom-0 translate-x-1/12 translate-y-1/12" },
    },
    {
      bleed: "sm",
      corner: "bottom-left",
      class: { root: "bottom-0 left-0 -translate-x-1/12 translate-y-1/12" },
    },
    {
      bleed: "md",
      corner: "top-right",
      class: { root: "top-0 right-0 translate-x-1/6 -translate-y-1/6" },
    },
    {
      bleed: "md",
      corner: "top-left",
      class: { root: "top-0 left-0 -translate-x-1/6 -translate-y-1/6" },
    },
    {
      bleed: "md",
      corner: "bottom-right",
      class: { root: "right-0 bottom-0 translate-x-1/6 translate-y-1/6" },
    },
    {
      bleed: "md",
      corner: "bottom-left",
      class: { root: "bottom-0 left-0 -translate-x-1/6 translate-y-1/6" },
    },
  ],
});

export interface OfferSealProps extends ComponentProps<"div"> {
  /** The number — "50%", "₹99" (format with formatRupees), "1+1". */
  value: string;
  /** Short word under it, e.g. "Off" (rendered uppercase). */
  label?: string | undefined;
  note?: string | undefined;
  /** Side: sm 110 · md 156 (handoff hero) · lg 260 (1080 canvases) · xl 360px. */
  size?: "sm" | "md" | "lg" | "xl" | undefined;
  tone?: "light" | "brand" | "turmeric" | undefined;
  /** Where the seal hangs off its container when it bleeds. */
  corner?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | undefined;
  /** How far past the corner: 1/12 or 1/6 of the side. The container needs `relative`. */
  bleed?: "none" | "sm" | "md" | undefined;
}

/** Offer badge for posts, stories and banners — a rotated brand diamond, never a starburst. */
export function OfferSeal({
  value,
  label,
  note,
  size = "lg",
  tone = "light",
  corner = "top-right",
  bleed = "none",
  className,
  ...props
}: OfferSealProps) {
  const styles = offerSeal({ size, tone, corner, bleed });
  return (
    <div className={styles.root({ className })} {...props}>
      <div className={styles.content()}>
        <span className={styles.value()}>{value}</span>
        {label ? <span className={styles.label()}>{label}</span> : null}
        {note ? <span className={styles.note()}>{note}</span> : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- offer-seal 2>&1 | tail -8`
Expected: PASS (17 tests).

- [ ] **Step 6: Stories — `OfferSeal.card.html` rows "tone" and "value", the handoff hero seal, sizes, and the bleed geometry check**

`packages/ui/src/molecules/offer-seal/offer-seal.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { OfferSeal } from "./offer-seal";

const CORNERS = ["top-right", "top-left", "bottom-right", "bottom-left"] as const;

const meta = {
  title: "Molecules/OfferSeal",
  component: OfferSeal,
  args: { value: "50%", label: "Off", size: "sm" },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Offer badge for posts, stories and banners — a rotated brand diamond, never a circular starburst. One per artboard. Use `bleed` (with `corner`) to hang it off the canvas edge: the only offsets are 1/12 and 1/6 of the side, because the number reaches ~0.32 × side from the centre and must never be clipped. Text counter-rotates so it stays upright. The container needs `relative` (and `overflow-hidden` for a canvas).",
      },
    },
  },
} satisfies Meta<typeof OfferSeal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "tone". */
export const Tones: Story = {
  render: (args) => (
    <div className="flex items-center gap-7.5 py-4.5">
      <OfferSeal {...args} tone="light" />
      <OfferSeal {...args} tone="brand" />
      <OfferSeal {...args} tone="turmeric" />
    </div>
  ),
};

/** Card row "value". */
export const Values: Story = {
  render: (args) => (
    <div className="flex items-center gap-7.5 py-4.5">
      <OfferSeal {...args} value={formatRupees(99)} label="Only" />
      <OfferSeal {...args} value="1+1" label="Free" />
      <OfferSeal {...args} value="50%" label="Off" note="till 11:30pm" />
    </div>
  ),
};

/** The handoff hero seal (Home): 156px, brand, launch price. */
export const HandoffHero: Story = {
  args: { size: "md", tone: "brand", value: formatRupees(130), label: "Launch" },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-16 p-10">
      {(["sm", "md", "lg", "xl"] as const).map((size) => (
        <OfferSeal key={size} {...args} size={size} />
      ))}
    </div>
  ),
};

/** Every corner bled the maximum on a 400px board: the value must stay fully on the board. */
export const BleedOffCorner: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-6">
      {CORNERS.map((corner) => (
        <div
          key={corner}
          data-testid={`board-${corner}`}
          data-surface="brand"
          className="relative h-100 w-100 overflow-hidden rounded-lg bg-surface-brand"
        >
          <OfferSeal {...args} size="lg" corner={corner} bleed="md" />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    for (const corner of CORNERS) {
      const board = canvas.getByTestId(`board-${corner}`).getBoundingClientRect();
      const [valueNode] = canvas
        .getAllByText("50%")
        .filter((node) => canvas.getByTestId(`board-${corner}`).contains(node));
      const value = valueNode?.getBoundingClientRect();
      await expect(value).toBeDefined();
      if (value === undefined) return;
      await expect(value.top).toBeGreaterThanOrEqual(board.top);
      await expect(value.left).toBeGreaterThanOrEqual(board.left);
      await expect(value.right).toBeLessThanOrEqual(board.right);
      await expect(value.bottom).toBeLessThanOrEqual(board.bottom);
    }
  },
};
```

- [ ] **Step 7: Export**

```ts
export { OfferSeal, type OfferSealProps } from "./molecules/offer-seal/offer-seal";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/design-tokens/tokens/component/offer-seal.json packages/design-tokens/contrast-pairs.json packages/ui/src/molecules/offer-seal packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts`; then run the geometry check in Chromium:

```bash
pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache -- offer-seal 2>&1 | tail -10
```

Expected: the OfferSeal stories pass, including `BleedOffCorner`'s play.

- [ ] **Step 9: Commit**

```bash
git add packages/design-tokens/tokens/component/offer-seal.json packages/design-tokens/contrast-pairs.json packages/ui/src/molecules/offer-seal packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): OfferSeal molecule

The brand's rotated-diamond offer badge. Every dimension is in em of one
size token, so sm/md/lg/xl (110/156/260/360px) scale the whole seal.
Bleed is an enum of 1/12 or 1/6 of the side, so the 0.18 x side clamp
that keeps the value on the board is guaranteed by the type; a story
play checks the geometry in Chromium. Label and note keep full colour
for AA.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 9: CouponTicket

**Files:**

- Create: `packages/design-tokens/tokens/component/coupon-ticket.json`
- Create: `packages/ui/src/molecules/coupon-ticket/coupon-ticket.tsx`, `coupon-copy-button.tsx`, `coupon-ticket.test.tsx`, `coupon-ticket.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`, `SPACING`), `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/coupon-ticket/coupon-ticket.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                      | Ruling  | Where, or the spec clause                                                                                               |
| ----------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------- |
| Code, headline and terms printed                                              | ALREADY | test "shows the headline, the terms, the code and the logo"                                                             |
| `terms` optional; story `WithoutTerms`                                        | DROP    | contract §6 `terms: string` (required); the design system: "always state the expiry"                                    |
| Stub is a copy button named by its code                                       | ALREADY | the button's name is its content, "Use code PAPRIKAA50 Tap to copy"                                                     |
| Writes the code to the clipboard; `onCopy(code)`                              | ALREADY | test "copies the code from the stub…"                                                                                   |
| Copied flash on the stub, announced to screen readers                         | ADD     | the hint is already `aria-live="polite"`; the copy test now asserts the announcement                                    |
| Reachable and operable from the keyboard                                      | ADD     | test "copies from the keyboard"                                                                                         |
| Nothing tappable and no "Tap to copy" on print artwork                        | ADD     | assertion in "is plain artwork when not copyable"                                                                       |
| A refused / missing clipboard still flashes "Copied"                          | DROP    | superseded by deviation 8 — a refused copy selects the code instead (test "never claims a copy…")                       |
| Brand / light skins                                                           | ALREADY | `it.each` surface test                                                                                                  |
| Headline steps with `size`                                                    | ADD     | test "sets the headline at artwork size for lg"                                                                         |
| Stacks below `sm`, splits from `sm` (a 360px stub is too narrow for the code) | ADD     | `md` root `flex-col sm:flex-row` with a horizontal perforation below `sm`; `lg` (artwork) always splits; test "stacks…" |
| Notches match the ground behind the ticket                                    | ALREADY | test "colours the punched notches…"                                                                                     |
| Press = scale on the copy stub                                                | ADD     | `isCopyable` stub `transition-control active:press-scale`                                                               |
| Diamond `PatternField` behind the stub                                        | DROP    | D2 — the design-system `CouponTicket.jsx` stub is a flat fill                                                           |
| Logo hidden (`label=""`)                                                      | ALREADY | the plan names the logo (test asserts `img` "Pink Paprikaa…") — artwork sign-off                                        |
| Caller `className` replaces the ticket radius                                 | ADD     | test "lets a caller className replace the ticket radius"                                                                |
| axe on brand-copyable and light-print                                         | ADD     | last test renders both                                                                                                  |
| Stories `Default`, `Tones`, `CanvasSize`, `ForPrint`                          | ALREADY | `Playground` / `Brand`, `Light`, `OnPinkArtwork` (lg, not copyable)                                                     |
| Stories `OnATintedPage`, `LongCode`                                           | ADD     | stories `OnTintedPage`, `LongCode`; plus `Narrow` (360, stacked)                                                        |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Logo` (`tone="white" | "pink"`, height via `h-10 w-auto`), `Icon` (`Copy`, `Check`), semantic surface tokens (brand tone sets `data-surface="brand"`, light sets `light`).
- Produces: `CouponTicket`, `type CouponTicketProps` (contract §6 + deviation 8). `coupon-copy-button.tsx` is the client leaf (not exported from the barrel). Defaults: `tone = "brand"`, `size = "md"`, `notch = "page"`, `isCopyable = true`, `codeLabel = "Use code"`, `copyHint = "Tap to copy"`, `copiedLabel = "Copied"`. `onCopy(code)` fires only after the clipboard accepted the code.

- [ ] **Step 1: Component tokens**

Two sizes replace the design system's width-proportional type: `md` (560px — screens, the card preview) and `lg` (900px — artwork). The design system's `md` terms (0.019 × 560 = 10.6px) are floored to the ramp's 14px so the terms stay legible on screens.

Create `packages/design-tokens/tokens/component/coupon-ticket.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "coupon-ticket-md": { "$value": "560px", "$description": "Ticket width on screens." },
    "coupon-ticket-lg": { "$value": "900px", "$description": "Ticket width on artwork." },
    "coupon-ticket-stub-md": { "$value": "168px", "$description": "Code stub, 0.3 × 560." },
    "coupon-ticket-stub-lg": { "$value": "270px", "$description": "Code stub, 0.3 × 900." },
    "coupon-ticket-notch": { "$value": "34px", "$description": "Punched perforation notch." }
  },
  "text": {
    "$type": "typography",
    "coupon-ticket-headline-md": {
      "$value": {
        "fontSize": "30px",
        "lineHeight": 1.05,
        "letterSpacing": "-0.025em",
        "fontWeight": "{font-weight.black}"
      }
    },
    "coupon-ticket-headline-lg": {
      "$value": {
        "fontSize": "50px",
        "lineHeight": 1.05,
        "letterSpacing": "-0.025em",
        "fontWeight": "{font-weight.black}"
      }
    },
    "coupon-ticket-code-md": {
      "$value": {
        "fontSize": "18px",
        "lineHeight": 1.2,
        "letterSpacing": "0.04em",
        "fontWeight": "{font-weight.bold}"
      }
    },
    "coupon-ticket-code-lg": {
      "$value": {
        "fontSize": "29px",
        "lineHeight": 1.2,
        "letterSpacing": "0.04em",
        "fontWeight": "{font-weight.bold}"
      }
    },
    "coupon-ticket-stub-label-lg": {
      "$value": {
        "fontSize": "14px",
        "lineHeight": 1.2,
        "letterSpacing": "0.14em",
        "fontWeight": "{font-weight.bold}"
      },
      "$description": "Stub label at artwork size; md uses the overline step."
    }
  }
}
```

In `component-variants.ts` append to `TEXT` `"coupon-ticket-headline-md", "coupon-ticket-headline-lg", "coupon-ticket-code-md", "coupon-ticket-code-lg", "coupon-ticket-stub-label-lg",` and to `SPACING` `"coupon-ticket-md", "coupon-ticket-lg", "coupon-ticket-stub-md", "coupon-ticket-stub-lg", "coupon-ticket-notch",`. No new contrast pair: the brand tone paints semantic tokens on the brand surface and its `surface-card` stub (declared in `brand-surface` / `brand-card`); the light tone paints them on `surface-card` and `surface-page-alt` (declared in `light-text`).

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache`
Expected: success; `--spacing-coupon-ticket-notch: 34px;` in `theme.css`.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/coupon-ticket/coupon-ticket.test.tsx`:

```tsx
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { CouponTicket } from "./coupon-ticket";

const TICKET = {
  code: "PAPRIKAA50",
  headline: "50% off your first order",
  terms: "One use per guest. Dine-in and pickup. Till 30 Sep.",
} as const;

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("CouponTicket", () => {
  it("shows the headline, the terms, the code and the logo", () => {
    render(<CouponTicket {...TICKET} />);
    expect(screen.getByText(TICKET.headline)).toBeInTheDocument();
    expect(screen.getByText(TICKET.terms)).toBeInTheDocument();
    expect(screen.getByText(TICKET.code)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Pink Paprikaa/ })).toBeInTheDocument();
  });

  it("copies the code from the stub, confirms it, and reports the copied code", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    render(<CouponTicket {...TICKET} onCopy={onCopy} />);
    await user.click(screen.getByRole("button", { name: /Use code PAPRIKAA50/ }));
    expect(await navigator.clipboard.readText()).toBe(TICKET.code);
    expect(onCopy).toHaveBeenCalledWith(TICKET.code);
    expect(screen.getAllByText("Copied")).not.toHaveLength(0);
    // The flash is visual; the live hint is what a screen reader hears.
    expect(
      screen.getAllByText("Copied").some((node) => node.getAttribute("aria-live") === "polite")
    ).toBe(true);
  });

  it("copies from the keyboard", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    render(<CouponTicket {...TICKET} onCopy={onCopy} />);
    await user.tab();
    expect(screen.getByRole("button", { name: /Use code/ })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(await screen.findAllByText("Copied")).not.toHaveLength(0);
    expect(onCopy).toHaveBeenCalledWith(TICKET.code);
  });

  it("returns to its hint once the confirmation has been seen", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
    render(<CouponTicket {...TICKET} />);
    await user.click(screen.getByRole("button", { name: /Use code/ }));
    expect(screen.getAllByText("Copied")).not.toHaveLength(0);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText("Tap to copy")).toBeInTheDocument();
  });

  it("never claims a copy the browser refused — it selects the code to copy by hand", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"));
    const onCopy = vi.fn();
    render(<CouponTicket {...TICKET} onCopy={onCopy} />);
    await user.click(screen.getByRole("button", { name: /Use code/ }));
    expect(onCopy).not.toHaveBeenCalled();
    expect(screen.queryByText("Copied")).not.toBeInTheDocument();
    expect(window.getSelection()?.toString()).toBe(TICKET.code);
  });

  it("is plain artwork when not copyable — nothing to tap", () => {
    render(<CouponTicket {...TICKET} isCopyable={false} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByText("Tap to copy")).not.toBeInTheDocument();
    expect(screen.getByText(TICKET.code)).toBeInTheDocument();
  });

  it("takes its stub words from props", () => {
    render(<CouponTicket {...TICKET} codeLabel="Code" copyHint="Copy" />);
    expect(screen.getByRole("button", { name: /Code PAPRIKAA50 Copy/ })).toBeInTheDocument();
  });

  it.each([
    ["brand", "brand"],
    ["light", "light"],
  ] as const)("sets the %s surface so its text follows the field", (tone, surface) => {
    const { container } = render(<CouponTicket {...TICKET} tone={tone} />);
    expect(container.firstElementChild).toHaveAttribute("data-surface", surface);
  });

  it("colours the punched notches to match the ground behind the ticket", () => {
    const { container } = render(<CouponTicket {...TICKET} notch="brand" />);
    const notches = container.querySelectorAll('[aria-hidden="true"] > .rounded-pill');
    expect(notches).toHaveLength(2);
    for (const notch of notches) expect(notch).toHaveClass("bg-surface-brand");
  });

  it("sets the headline at artwork size for lg", () => {
    render(<CouponTicket {...TICKET} size="lg" />);
    expect(screen.getByText(TICKET.headline)).toHaveClass("text-coupon-ticket-headline-lg");
  });

  it("stacks at phone width and splits from sm; artwork (lg) always splits", () => {
    const { container, rerender } = render(<CouponTicket {...TICKET} />);
    expect(container.firstElementChild).toHaveClass("flex-col", "sm:flex-row");
    rerender(<CouponTicket {...TICKET} size="lg" />);
    expect(container.firstElementChild).not.toHaveClass("flex-col");
  });

  it("lets a caller className replace the ticket radius", () => {
    const { container } = render(<CouponTicket {...TICKET} className="rounded-lg" />);
    expect(container.firstElementChild).toHaveClass("rounded-lg");
    expect(container.firstElementChild).not.toHaveClass("rounded-xl");
  });

  it("has no accessibility violations, copyable and as print artwork", async () => {
    const { container } = render(
      <>
        <CouponTicket {...TICKET} />
        <CouponTicket
          code="CHAI20"
          headline="20% off all chai, all week"
          terms="Dine-in only. Till 30 Sep."
          tone="light"
          isCopyable={false}
        />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

(user-event 14 installs a working `navigator.clipboard` for every `userEvent.setup()`; `readText()` reads back what the component wrote.)

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- coupon-ticket 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./coupon-ticket`.

- [ ] **Step 4: Implement the client leaf**

`packages/ui/src/molecules/coupon-ticket/coupon-copy-button.tsx`:

```tsx
"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Icon } from "../../atoms/icon/icon";

/** How long the stub reads "Copied" before returning to its hint. */
const COPIED_FLASH_MS = 1800;

/** Class names computed by the server CouponTicket, so the leaf holds behaviour only. */
export interface CouponStubClassNames {
  root: string;
  inner: string;
  label: string;
  code: string;
  hint: string;
}

export interface CouponCopyButtonProps {
  code: string;
  codeLabel: string;
  copyHint: string;
  copiedLabel: string;
  classNames: CouponStubClassNames;
  onCopy?: ((code: string) => void) | undefined;
}

/** The ticket's code stub as a copy button. Pair `onCopy` with a Snackbar for the confirmation. */
export function CouponCopyButton({
  code,
  codeLabel,
  copyHint,
  copiedLabel,
  classNames,
  onCopy,
}: CouponCopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const codeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isCopied) return undefined;
    const timer = setTimeout(() => {
      setIsCopied(false);
    }, COPIED_FLASH_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [isCopied]);

  /** Recovery when the browser refuses the copy: leave the code selected to copy by hand. */
  const selectCode = () => {
    const node = codeRef.current;
    const selection = window.getSelection();
    if (node === null || selection === null) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const handleClick = () => {
    // Insecure origins expose no clipboard at all.
    if (!("clipboard" in navigator)) {
      selectCode();
      return;
    }
    navigator.clipboard.writeText(code).then(
      () => {
        setIsCopied(true);
        onCopy?.(code);
      },
      () => {
        selectCode();
      }
    );
  };

  return (
    <button type="button" onClick={handleClick} className={classNames.root}>
      <span className={classNames.inner}>
        <span className={classNames.label}>{isCopied ? copiedLabel : codeLabel}</span>
        <span ref={codeRef} className={classNames.code}>
          {code}
        </span>
        <span aria-live="polite" className={classNames.hint}>
          <Icon icon={isCopied ? Check : Copy} size="xs" />
          {isCopied ? copiedLabel : copyHint}
        </span>
      </span>
    </button>
  );
}
```

- [ ] **Step 5: Implement the ticket**

`packages/ui/src/molecules/coupon-ticket/coupon-ticket.tsx`:

```tsx
import type { ComponentProps } from "react";

import { Logo } from "../../atoms/logo/logo";
import { componentVariants } from "../../lib/component-variants";
import { CouponCopyButton } from "./coupon-copy-button";

const couponTicket = componentVariants({
  slots: {
    root: "relative flex w-full items-stretch overflow-hidden rounded-xl text-text-heading shadow-3",
    main: "min-w-0 flex-1",
    logo: "w-auto",
    headline: "mb-0 max-w-none font-display text-balance",
    terms: "mb-0 max-w-text-measure-narrow text-text-muted",
    // The perforation sits exactly between main and stub, whatever the ticket's width. Split, it is
    // a zero-width column with notches on the top and bottom edges; stacked (md below `sm`), a
    // zero-height row with notches on the two side edges. The size variants set which.
    perforation: "relative shrink-0",
    rule: "absolute border-dashed border-border-default",
    notchStart:
      "size-coupon-ticket-notch absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-pill",
    notchEnd: "size-coupon-ticket-notch absolute rounded-pill",
    stub: "grid shrink-0 place-items-center p-5 text-center",
    stubInner: "grid justify-items-center gap-2",
    stubLabel: "font-display text-text-muted uppercase",
    code: "font-mono wrap-anywhere text-text-brand",
    hint: "inline-flex items-center gap-1.5 text-text-muted",
  },
  variants: {
    tone: {
      brand: { root: "bg-surface-brand", stub: "bg-surface-card" },
      light: { root: "border border-border-default bg-surface-card", stub: "bg-surface-page-alt" },
    },
    size: {
      md: {
        // Stacked below `sm`: split at 360px the stub would be too narrow for a mono code.
        root: "max-w-coupon-ticket-md flex-col sm:flex-row",
        perforation: "h-0 sm:h-auto sm:w-0",
        rule: "inset-x-4.5 -top-px border-t-2 sm:inset-x-auto sm:inset-y-4.5 sm:-left-px sm:border-t-0 sm:border-l-2",
        notchEnd:
          "top-0 right-0 translate-x-1/2 -translate-y-1/2 sm:top-auto sm:right-auto sm:bottom-0 sm:left-0 sm:-translate-x-1/2 sm:translate-y-1/2",
        main: "p-6",
        logo: "h-10",
        headline: "text-coupon-ticket-headline-md mt-4",
        terms: "mt-3 text-body-sm",
        stub: "sm:w-coupon-ticket-stub-md",
        stubLabel: "text-overline",
        code: "text-coupon-ticket-code-md",
        hint: "text-caption",
      },
      lg: {
        // Artwork is scaled, never reflowed: always split, whatever the viewport.
        root: "max-w-coupon-ticket-lg",
        perforation: "w-0",
        rule: "inset-y-4.5 -left-px border-l-2",
        notchEnd: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
        main: "p-10",
        logo: "h-17",
        headline: "text-coupon-ticket-headline-lg mt-7",
        terms: "mt-5 text-body-lg",
        stub: "w-coupon-ticket-stub-lg",
        stubLabel: "text-coupon-ticket-stub-label-lg",
        code: "text-coupon-ticket-code-lg",
        hint: "text-body-sm",
      },
    },
    notch: {
      page: { notchStart: "bg-surface-page", notchEnd: "bg-surface-page" },
      tint: { notchStart: "bg-surface-page-alt", notchEnd: "bg-surface-page-alt" },
      sunken: { notchStart: "bg-surface-sunken", notchEnd: "bg-surface-sunken" },
      brand: { notchStart: "bg-surface-brand", notchEnd: "bg-surface-brand" },
    },
    // Press = the system's scale (Button's treatment).
    isCopyable: {
      true: { stub: "cursor-pointer transition-control active:press-scale" },
      false: {},
    },
  },
});

export interface CouponTicketProps extends ComponentProps<"div"> {
  /** Uppercase promo code, set in Space Mono. */
  code: string;
  /** Eight words at most. */
  headline: string;
  /** Full sentences; always state the expiry. */
  terms: string;
  tone?: "brand" | "light" | undefined;
  /** md = 560px (screens), lg = 900px (artwork). The ticket never exceeds its container. */
  size?: "md" | "lg" | undefined;
  /** Colour of the punched notches — match the ground behind the ticket. */
  notch?: "page" | "tint" | "sunken" | "brand" | undefined;
  /** The stub copies the code. `false` for print and PostFrame artboards. */
  isCopyable?: boolean | undefined;
  /** Fires with the code once the clipboard accepted it — pair it with a Snackbar. */
  onCopy?: ((code: string) => void) | undefined;
  codeLabel?: string | undefined;
  copyHint?: string | undefined;
  copiedLabel?: string | undefined;
}

/** Perforated voucher for stories, DMs, table cards and print handouts. */
export function CouponTicket({
  code,
  headline,
  terms,
  tone = "brand",
  size = "md",
  notch = "page",
  isCopyable = true,
  onCopy,
  codeLabel = "Use code",
  copyHint = "Tap to copy",
  copiedLabel = "Copied",
  className,
  ...props
}: CouponTicketProps) {
  const styles = couponTicket({ tone, size, notch, isCopyable });

  return (
    <div data-surface={tone} className={styles.root({ className })} {...props}>
      <div className={styles.main()}>
        <Logo tone={tone === "brand" ? "white" : "pink"} className={styles.logo()} />
        <p className={styles.headline()}>{headline}</p>
        <p className={styles.terms()}>{terms}</p>
      </div>
      <div aria-hidden="true" className={styles.perforation()}>
        <span className={styles.rule()} />
        <span className={styles.notchStart()} />
        <span className={styles.notchEnd()} />
      </div>
      {isCopyable ? (
        <CouponCopyButton
          code={code}
          codeLabel={codeLabel}
          copyHint={copyHint}
          copiedLabel={copiedLabel}
          classNames={{
            root: styles.stub(),
            inner: styles.stubInner(),
            label: styles.stubLabel(),
            code: styles.code(),
            hint: styles.hint(),
          }}
          onCopy={onCopy}
        />
      ) : (
        <div className={styles.stub()}>
          <div className={styles.stubInner()}>
            <span className={styles.stubLabel()}>{codeLabel}</span>
            <span className={styles.code()}>{code}</span>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- coupon-ticket 2>&1 | tail -8`
Expected: PASS (14 tests).

- [ ] **Step 7: Stories — `CouponTicket.card.html` rows "brand" and "light", the marketing-kit ticket on pink, and a copy `play`**

`packages/ui/src/molecules/coupon-ticket/coupon-ticket.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn } from "storybook/test";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { CouponTicket } from "./coupon-ticket";

const meta = {
  title: "Molecules/CouponTicket",
  component: CouponTicket,
  args: {
    code: "PAPRIKAA50",
    headline: "50% off your first order",
    terms: "One use per guest. Dine-in and pickup. Till 30 Sep.",
    onCopy: fn(),
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Voucher artwork for stories, DMs, table cards and print handouts. The code stub copies to the clipboard on tap; always pair `onCopy` with a Snackbar — the stub\'s own "Copied" flash is reinforcement, not the confirmation. If the browser refuses the copy, the code is selected so it can be copied by hand. Pass `isCopyable={false}` on print artwork and inside PostFrame artboards. `notch` colours the punched notches to match the ground behind the ticket.',
      },
    },
  },
} satisfies Meta<typeof CouponTicket>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "brand". */
export const Brand: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /Use code PAPRIKAA50/ }));
    await expect(args.onCopy).toHaveBeenCalledWith("PAPRIKAA50");
  },
};

/** Card row "light". */
export const Light: Story = {
  args: {
    tone: "light",
    code: "CHAI20",
    headline: "20% off all chai, all week",
    terms: "Dine-in only. Till 30 Sep.",
  },
};

/** The marketing kit's ticket: artwork size, light, on a pink field, not tappable. */
export const OnPinkArtwork: Story = {
  args: { tone: "light", size: "lg", notch: "brand", isCopyable: false },
  render: (args) => (
    <div data-surface="brand" className="rounded-xl bg-surface-brand p-10">
      <CouponTicket {...args} />
    </div>
  ),
};

/** The notches are punched holes: on a tinted page `notch="tint"` keeps them from reading as blobs. */
export const OnTintedPage: Story = {
  args: { tone: "light", notch: "tint" },
  render: (args) => (
    <div className="bg-surface-page-alt p-8">
      <CouponTicket {...args} />
    </div>
  ),
};

/** A long code wraps inside the stub instead of widening the ticket. */
export const LongCode: Story = {
  args: { code: "PAPRIKAAFIRSTORDER", headline: `${formatRupees(150)} off your first order` },
};

/** 360px: `md` stacks, the perforation runs across and the notches sit on the side edges. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
  play: async ({ canvasElement }) => {
    const ticket = canvasElement.querySelector("[data-surface]");
    await expect(ticket).not.toBeNull();
    if (ticket === null) return;
    await expect(ticket.scrollWidth).toBeLessThanOrEqual(ticket.clientWidth);
  },
};
```

- [ ] **Step 8: Export**

```ts
export { CouponTicket, type CouponTicketProps } from "./molecules/coupon-ticket/coupon-ticket";
```

- [ ] **Step 9: Gate** — `<paths>` = `packages/design-tokens/tokens/component/coupon-ticket.json packages/ui/src/molecules/coupon-ticket packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts`.

- [ ] **Step 10: Commit**

```bash
git add packages/design-tokens/tokens/component/coupon-ticket.json packages/ui/src/molecules/coupon-ticket packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): CouponTicket molecule

Perforated voucher (brand/light, screen/artwork sizes) whose notches sit
on the perforation at any width. The copy stub is the only client code:
onCopy fires only after the clipboard accepted the code, and a refused
copy leaves the code selected instead of flashing a false Copied.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 10: ChoiceCardGroup

**Files:**

- Create: `packages/design-tokens/tokens/component/choice-card.json`
- Modify: `packages/design-tokens/tokens/semantic/shadow.json` (`shadow.selected`), `packages/design-tokens/contrast-pairs.json`, `packages/ui/src/lib/component-variants.ts` (`TEXT`, `SHADOW`)
- Create: `packages/ui/src/molecules/choice-card-group/choice-card-group.tsx`, `choice-card-group.test.tsx`, `choice-card-group.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** none (handoff component)

**Interfaces:**

- Consumes: native `<fieldset>` / `<input type="radio">`; Plan 2c's `autogrid-min-<step>` utility (it sets only `grid-template-columns`, so the list's own `gap-2` — the handoff's 8px — stands); `transition-control` (Plan 2a); `useId`; `fakeRegister` (Plan 2b, tests).
- Produces: `ChoiceCardGroup`, `type ChoiceCardGroupProps`, `type ChoiceOption`, `type ChoiceGridMin` (contract §6 + deviation 1). Server-safe. Defaults: `min = "xs"`, `layout = "tile"`, `tone = "light"`, `isLegendHidden = false`. RHF: `{...register("plate")}` spreads `name`, `onChange`, `onBlur`, `ref` straight onto every radio. Documented accessible default: the visually hidden word "Was" before a struck price.

- [ ] **Step 1: Tokens and contrast pairs**

Append to `packages/design-tokens/tokens/semantic/shadow.json` inside `shadow`:

```json
"selected": {
  "$value": "inset 0 0 0 1px {color.pink.500}",
  "$description": "A selected card: doubles its 1px brand border to 2px without moving the layout (ChoiceCardGroup, CheckCard)."
}
```

Create `packages/design-tokens/tokens/component/choice-card.json`:

```json
{
  "text": {
    "$type": "typography",
    "choice-card-title": {
      "$value": { "fontSize": "15px", "lineHeight": 1.3, "fontWeight": "{font-weight.bold}" },
      "$description": "Choice card title and calculator step labels (handoff 15px Poppins 700)."
    }
  },
  "shadow": {
    "$type": "shadow",
    "choice-card-radio": {
      "$value": "inset 0 0 0 3px {color.ink.000}",
      "$description": "The white ring inside a checked radio on the brand-surface card."
    }
  }
}
```

In `component-variants.ts` append to `TEXT` `"choice-card-title",` and to `SHADOW` `"selected", "choice-card-radio",`.

Append to `groups` in `contrast-pairs.json`:

```json
{
  "id": "choice-card-selected",
  "surface": null,
  "pairs": [["color-pink-700", "color-pink-50"]],
  "min": 4.5
},
{
  "id": "choice-card-on-brand",
  "surface": null,
  "pairs": [["color-text-heading", "color-white-alpha-92"]],
  "backdrop": "color-surface-brand",
  "min": 4.5
}
```

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -6`
Expected: PASS (pink-700 on pink-50 ≈ 6.7:1; ink-900 on 92% white over the brand pink ≈ 16:1).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/choice-card-group/choice-card-group.test.tsx`:

```tsx
import type { ChangeEvent } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { expectNoA11yViolations, fakeRegister } from "../../../vitest.setup";
import { ChoiceCardGroup, type ChoiceOption } from "./choice-card-group";

const PLATES: ChoiceOption[] = [
  {
    value: "everyday",
    title: "Everyday",
    price: formatRupees(120),
    description: "Home-style basics, kept simple.",
  },
  {
    value: "classic",
    title: "Classic",
    price: formatRupees(130),
    was: formatRupees(140),
    badge: <span>Pick</span>,
    description: "The full Pink Paprikaa menu. Our recommendation.",
  },
  {
    value: "signature",
    title: "Signature",
    price: formatRupees(200),
    description: "A different plate, every single day.",
  },
];

describe("ChoiceCardGroup", () => {
  it("is a fieldset named by its legend, with one radio per option", () => {
    render(<ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} />);
    expect(screen.getByRole("group", { name: "Your plate" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("names each radio by its title and price, and describes it with its blurb", () => {
    render(<ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} />);
    const classic = screen.getByRole("radio", { name: "Classic ₹130 Was ₹140" });
    expect(classic).toHaveAccessibleDescription("The full Pink Paprikaa menu. Our recommendation.");
  });

  it("starts on the default choice and reports a new one as a value and a native event", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onChange = vi.fn<(event: ChangeEvent<HTMLInputElement>) => void>();
    render(
      <ChoiceCardGroup
        name="plate"
        legend="Your plate"
        options={PLATES}
        defaultValue="classic"
        onValueChange={onValueChange}
        onChange={onChange}
      />
    );
    expect(screen.getByRole("radio", { name: /Classic/ })).toBeChecked();
    await user.click(screen.getByRole("radio", { name: /Signature/ }));
    expect(onValueChange).toHaveBeenLastCalledWith("signature");
    const [event] = onChange.mock.lastCall ?? [];
    expect(event?.target.name).toBe("plate");
    expect(event?.target.value).toBe("signature");
  });

  it("moves the choice with the arrow keys, like any radio group", async () => {
    const user = userEvent.setup();
    render(
      <ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} defaultValue="everyday" />
    );
    await user.click(screen.getByRole("radio", { name: /Everyday/ }));
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: /Classic/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: /Classic/ })).toHaveFocus();
  });

  it("submits the chosen value with its form, under its name", async () => {
    const user = userEvent.setup();
    render(
      <form aria-label="Plan">
        <ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} />
      </form>
    );
    await user.click(screen.getByRole("radio", { name: /Signature/ }));
    const form = screen.getByRole("form", { name: "Plan" });
    expect(form instanceof HTMLFormElement && new FormData(form).get("plate")).toBe("signature");
  });

  it("takes react-hook-form's register() unmodified — every radio gets the ref and the events", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("plate");
    render(<ChoiceCardGroup legend="Your plate" options={PLATES} {...field} />);
    for (const radio of screen.getAllByRole("radio")) {
      expect(field.ref).toHaveBeenCalledWith(radio);
      expect(radio).toHaveAttribute("name", "plate");
    }
    await user.click(screen.getByRole("radio", { name: /Signature/ }));
    expect(field.onChange).toHaveBeenCalledOnce();
    await user.tab();
    expect(field.onBlur).toHaveBeenCalled();
  });

  it("follows a controlled value", () => {
    const { rerender } = render(
      <ChoiceCardGroup
        name="plate"
        legend="Your plate"
        options={PLATES}
        value="everyday"
        onValueChange={vi.fn()}
      />
    );
    expect(screen.getByRole("radio", { name: /Everyday/ })).toBeChecked();
    rerender(
      <ChoiceCardGroup
        name="plate"
        legend="Your plate"
        options={PLATES}
        value="signature"
        onValueChange={vi.fn()}
      />
    );
    expect(screen.getByRole("radio", { name: /Signature/ })).toBeChecked();
  });

  it("disables one option, or the whole group through the fieldset", () => {
    const { rerender } = render(
      <ChoiceCardGroup
        name="plate"
        legend="Your plate"
        options={PLATES.map((option) => ({ ...option, isDisabled: option.value === "signature" }))}
      />
    );
    expect(screen.getByRole("radio", { name: /Signature/ })).toBeDisabled();
    expect(screen.getByRole("radio", { name: /Classic/ })).toBeEnabled();
    rerender(<ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} disabled />);
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
  });

  it("hides the native radio on light cards and draws a real one on the brand surface", () => {
    const { rerender } = render(
      <ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} />
    );
    expect(screen.getByRole("radio", { name: /Classic/ })).toHaveClass("sr-only");
    rerender(<ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} tone="on-brand" />);
    expect(screen.getByRole("radio", { name: /Classic/ })).not.toHaveClass("sr-only");
    expect(screen.getByRole("radio", { name: /Classic/ })).toHaveClass("appearance-none");
  });

  it("puts the price under the title on tiles and at the end of rows", () => {
    const { rerender } = render(
      <ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} />
    );
    const card = () => screen.getByRole("radio", { name: /Classic/ }).closest("label");
    expect(card()?.lastElementChild).not.toHaveTextContent("₹130");
    rerender(<ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} layout="row" />);
    expect(card()?.lastElementChild).toHaveTextContent("₹130");
  });

  it("keeps the group named when the legend is hidden visually", () => {
    render(<ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} isLegendHidden />);
    expect(screen.getByRole("group", { name: "Your plate" })).toBeInTheDocument();
    expect(screen.getByText("Your plate")).toHaveClass("sr-only");
  });

  it.each(["light", "on-brand"] as const)("has no accessibility violations (%s)", async (tone) => {
    const { container } = render(
      <ChoiceCardGroup
        name="plate"
        legend="Your plate"
        options={PLATES}
        tone={tone}
        defaultValue="classic"
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- choice-card-group 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./choice-card-group`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/choice-card-group/choice-card-group.tsx`:

```tsx
import {
  type ChangeEvent,
  type ComponentProps,
  type FocusEventHandler,
  type ReactNode,
  type Ref,
  useId,
} from "react";

import { componentVariants } from "../../lib/component-variants";

/**
 * A grid minimum on the AutoGrid scale (xs 140 · sm 200 · md 260 · lg 320 · xl 380 · 2xl 420px).
 * Restated here because a molecule may not import from layouts, not even a type.
 */
export type ChoiceGridMin = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export interface ChoiceOption {
  value: string;
  title: ReactNode;
  /** Formatted with formatRupees, or words ("Included", "Quoted · 25+ guests"). */
  price?: ReactNode | undefined;
  was?: ReactNode | undefined;
  description?: ReactNode | undefined;
  /** A Badge beside the title, e.g. "Pick". */
  badge?: ReactNode | undefined;
  /** A line under the description, e.g. an offer Badge. */
  meta?: ReactNode | undefined;
  isDisabled?: boolean | undefined;
}

export interface ChoiceCardGroupProps extends Omit<
  ComponentProps<"fieldset">,
  "defaultValue" | "onBlur" | "onChange" | "ref"
> {
  name: string;
  legend: ReactNode;
  isLegendHidden?: boolean | undefined;
  options: ChoiceOption[];
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  /** Native change event of the chosen radio — react-hook-form's `register()` handler. */
  onChange?: ((event: ChangeEvent<HTMLInputElement>) => void) | undefined;
  onBlur?: FocusEventHandler<HTMLInputElement> | undefined;
  /** Given to every radio, so `register()` sees each one. */
  ref?: Ref<HTMLInputElement> | undefined;
  /** Tile width floor for the grid (tiles only). */
  min?: ChoiceGridMin | undefined;
  /** `tile`: stacked cards in a grid, price under the title. `row`: full-width rows, price at the end. */
  layout?: "tile" | "row" | undefined;
  /** `on-brand`: white cards with a visible radio, for a pink field (the Home trial selector). */
  tone?: "light" | "on-brand" | undefined;
}

const choiceCardGroup = componentVariants({
  slots: {
    root: "min-w-0",
    legend: "text-choice-card-title mb-2.5 font-display text-text-heading",
    list: "grid gap-2",
    card: "relative flex min-h-16 cursor-pointer rounded-md p-3 text-left transition-control has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus has-disabled:cursor-not-allowed has-disabled:border-border-subtle has-disabled:bg-ink-200 has-disabled:text-ink-400",
    input: "",
    body: "flex min-w-0 flex-1 flex-col items-start gap-1",
    head: "flex w-full flex-wrap items-center justify-between gap-1.5",
    title: "text-choice-card-title font-display",
    price:
      "flex flex-wrap items-baseline gap-1.5 font-display text-h4 font-black whitespace-nowrap",
    was: "font-body text-body-sm font-regular",
    description: "text-caption",
  },
  variants: {
    layout: {
      tile: { card: "flex-col items-start gap-1" },
      row: { card: "items-center gap-3", price: "shrink-0" },
    },
    tone: {
      light: {
        // 1px border + the inset `selected` shadow = a 2px border that never shifts the layout.
        card: "has-checked:shadow-selected border border-border-default bg-surface-card text-text-heading has-checked:border-border-brand has-checked:bg-pink-50 has-checked:text-pink-700",
        input: "sr-only",
      },
      "on-brand": {
        card: "border-2 border-transparent bg-white-alpha-92 text-text-heading has-checked:border-ink-900 has-checked:bg-ink-000",
        input:
          "checked:shadow-choice-card-radio size-4.5 shrink-0 cursor-pointer appearance-none rounded-pill border-2 border-ink-600 bg-ink-000 checked:border-pink-600 checked:bg-pink-600 focus-visible:outline-none",
      },
    },
    min: {
      xs: { list: "autogrid-min-xs" },
      sm: { list: "autogrid-min-sm" },
      md: { list: "autogrid-min-md" },
      lg: { list: "autogrid-min-lg" },
      xl: { list: "autogrid-min-xl" },
      "2xl": { list: "autogrid-min-2xl" },
    },
    isLegendHidden: { true: { legend: "sr-only" }, false: {} },
  },
});

/**
 * A card-style single choice (plates, plan lengths, dawats, platters, service, the trial, the
 * decide list). Native radios in a fieldset: keyboard, forms and `register()` work unmodified.
 */
export function ChoiceCardGroup({
  name,
  legend,
  isLegendHidden = false,
  options,
  value,
  defaultValue,
  onValueChange,
  onChange,
  onBlur,
  ref,
  min = "xs",
  layout = "tile",
  tone = "light",
  className,
  ...props
}: ChoiceCardGroupProps) {
  const baseId = useId();
  const styles = choiceCardGroup({
    layout,
    tone,
    isLegendHidden,
    ...(layout === "tile" ? { min } : {}),
  });
  // Attached only when the consumer listens, so a server render carries no handler.
  const handleChange =
    onChange === undefined && onValueChange === undefined
      ? undefined
      : (event: ChangeEvent<HTMLInputElement>) => {
          onChange?.(event);
          onValueChange?.(event.target.value);
        };

  return (
    <fieldset className={styles.root({ className })} {...props}>
      <legend className={styles.legend()}>{legend}</legend>
      <div className={styles.list()}>
        {options.map((option, index) => {
          const id = `${baseId}-${String(index)}`;
          const price =
            option.price === undefined ? null : (
              <span id={`${id}-price`} className={styles.price()}>
                {option.price}
                {option.was === undefined ? null : (
                  <s className={styles.was()}>
                    <span className="sr-only">Was </span>
                    {option.was}
                  </s>
                )}
              </span>
            );
          return (
            <label key={option.value} data-surface="light" className={styles.card()}>
              <input
                type="radio"
                name={name}
                value={option.value}
                disabled={option.isDisabled}
                ref={ref}
                onBlur={onBlur}
                onChange={handleChange}
                aria-labelledby={price === null ? `${id}-title` : `${id}-title ${id}-price`}
                aria-describedby={
                  option.description === undefined ? undefined : `${id}-description`
                }
                className={styles.input()}
                {...(value === undefined
                  ? { defaultChecked: option.value === defaultValue }
                  : { checked: option.value === value })}
              />
              <span className={styles.body()}>
                <span className={styles.head()}>
                  <span id={`${id}-title`} className={styles.title()}>
                    {option.title}
                  </span>
                  {option.badge}
                </span>
                {layout === "tile" ? price : null}
                {option.description === undefined ? null : (
                  <span id={`${id}-description`} className={styles.description()}>
                    {option.description}
                  </span>
                )}
                {option.meta}
              </span>
              {layout === "row" ? price : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- choice-card-group 2>&1 | tail -8`
Expected: PASS (13 tests).

- [ ] **Step 6: Stories — every handoff usage, with the handoff's copy and `rates.js` prices**

`packages/ui/src/molecules/choice-card-group/choice-card-group.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Star } from "lucide-react";
import { expect } from "storybook/test";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { Badge } from "../../atoms/badge/badge";
import { ChoiceCardGroup, type ChoiceOption } from "./choice-card-group";

/** PlanCalculator "1. Your plate" — Classic at its launch price. */
const PLATES: ChoiceOption[] = [
  {
    value: "everyday",
    title: "Everyday",
    price: formatRupees(120),
    description: "Home-style basics, kept simple.",
  },
  {
    value: "classic",
    title: "Classic",
    price: formatRupees(130),
    was: formatRupees(140),
    badge: <Badge tone="brand">Pick</Badge>,
    description: "The full Pink Paprikaa menu. Our recommendation.",
  },
  {
    value: "signature",
    title: "Signature",
    price: formatRupees(200),
    description: "A different plate, every single day.",
  },
];

const meta = {
  title: "Molecules/ChoiceCardGroup",
  component: ChoiceCardGroup,
  args: { name: "plate", legend: "1. Your plate", options: PLATES, defaultValue: "classic" },
  decorators: [
    (Story) => (
      <div className="w-full max-w-article">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Card-style single choice from the handoff calculators: native radios in a fieldset, so arrow keys, forms and react-hook-form\'s `register()` work unmodified (`ref`, `onChange`, `onBlur` reach every radio). `layout="tile"` stacks cards in an AutoGrid (`min`); `layout="row"` gives full-width rows with the price at the end. `tone="on-brand"` is the Home trial selector: white cards with a visible radio on a pink field. Prices arrive formatted (`formatRupees`) or as words.',
      },
    },
  },
} satisfies Meta<typeof ChoiceCardGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** PlanCalculator — plate cards. */
export const Plates: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: /Signature/ }));
    await expect(canvas.getByRole("radio", { name: /Signature/ })).toBeChecked();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("radio", { name: /Classic/ })).toBeChecked();
  },
};

/** PlanCalculator "3. How many meals" — the free-meal offer as meta. */
export const PlanLengths: Story = {
  args: {
    name: "length",
    legend: "3. How many meals",
    defaultValue: "weekday",
    options: [
      { value: "trial", title: "Trial", description: "5 meals · any days within a week" },
      {
        value: "weekday",
        title: "Weekday plan",
        description: "24 meals · Mon–Sat",
        meta: <Badge tone="success">Offer: +1 free / month</Badge>,
      },
      {
        value: "full",
        title: "Full month",
        description: "30 meals · every day",
        meta: <Badge tone="success">Offer: +1 free / month</Badge>,
      },
    ],
  },
};

/** DawatCalculator "2. Dawat". */
export const Dawats: Story = {
  args: {
    name: "dawat",
    legend: "2. Dawat",
    defaultValue: "signature",
    options: [
      { value: "classic", title: "Classic", price: formatRupees(149), description: "a head" },
      {
        value: "signature",
        title: "Signature",
        price: formatRupees(199),
        description: "a head · most ordered",
      },
      { value: "maharaja", title: "Maharaja", price: formatRupees(269), description: "a head" },
      {
        value: "royal",
        title: "Royal",
        price: formatRupees(549),
        description: "a head · 50+ guests",
      },
    ],
  },
};

/** DawatCalculator "4. Platter" — 200px tiles. */
export const Platters: Story = {
  args: {
    name: "platter",
    legend: "4. Platter",
    min: "sm",
    defaultValue: "",
    options: [
      { value: "", title: "No platter" },
      {
        value: "snClassic",
        title: "Classic Snacks Platter",
        price: formatRupees(99),
        description: "2 Samosa · 1 Dal Kachori · 1 Bread Pakoda · Jal Jeera or Chaas",
      },
      {
        value: "snChaat",
        title: "Chaat Snacks Platter",
        price: formatRupees(119),
        description: "Samosa Chole · Masala Papad · Pyaaz Kachori · Jal Jeera or Chaas",
      },
      {
        value: "snSandwich",
        title: "Sandwich Snacks Platter",
        price: formatRupees(129),
        description: "Veg Grilled Sandwich · Bread Pakoda · Jal Jeera or Chaas",
      },
      {
        value: "moVeg",
        title: "Veg Momos Platter",
        price: formatRupees(149),
        description: "6 a head: 2 Steamed + 2 Pan-Fried + 2 Kurkure",
      },
      {
        value: "moPaneer",
        title: "Paneer Momos Platter",
        price: formatRupees(179),
        description: "6 a head: 2 Steamed + 2 Pan-Fried + 2 Kurkure",
      },
    ],
  },
};

/** DawatCalculator "7. How you want it served" — rows. */
export const Service: Story = {
  args: {
    name: "service",
    legend: "7. How you want it served",
    layout: "row",
    defaultValue: "delivered",
    options: [
      {
        value: "delivered",
        title: "Delivered",
        price: "Included",
        description: "Sealed insulated trays. Free up to 8 km, beyond billed at actual.",
      },
      {
        value: "disposables",
        title: "Delivered with disposables",
        price: `+${formatRupees(25)} a head`,
        description: "Plus plates, spoons, napkins and serving spoons.",
      },
      {
        value: "setup",
        title: "Full setup and service",
        price: "Quoted · 25+ guests",
        description:
          "Buffet tables, chafing dishes, serving staff, cleanup. Quoted for your venue.",
      },
    ],
  },
};

/** Home "Taste it first." — the trial selector on the brand field, 5-meal totals at the end. */
export const TrialOnBrand: Story = {
  args: {
    name: "trial",
    legend: "Trial plate",
    isLegendHidden: true,
    layout: "row",
    tone: "on-brand",
    defaultValue: "classic",
    options: [
      {
        value: "everyday",
        title: "Everyday",
        description: `${formatRupees(120)} a meal`,
        price: formatRupees(600),
      },
      {
        value: "classic",
        title: "Classic",
        badge: (
          <Badge tone="brand" icon={Star}>
            Recommended
          </Badge>
        ),
        description: `${formatRupees(130)} a meal · launch price (was ${formatRupees(140)})`,
        price: formatRupees(650),
      },
      {
        value: "signature",
        title: "Signature",
        description: `${formatRupees(200)} a meal`,
        price: formatRupees(1000),
      },
    ],
  },
  render: (args) => (
    <div data-surface="brand" className="rounded-xl bg-surface-brand p-7">
      <ChoiceCardGroup {...args} />
    </div>
  ),
};

/** HomelyMeals "30 seconds to decide" — question rows. */
export const DecideList: Story = {
  args: {
    name: "decide",
    legend: "Not sure which one?",
    isLegendHidden: true,
    layout: "row",
    defaultValue: "full",
    options: [
      { value: "taste", title: "“I want to taste it first”" },
      { value: "full", title: "“I want the full Pink Paprikaa experience”" },
      { value: "basics", title: "“I just want the basics, kept simple”" },
      { value: "spoiled", title: "“I want to feel a little spoiled every day”" },
      { value: "both", title: "“I don’t want to think about lunch or dinner”" },
      { value: "household", title: "“Two or more of us live together”" },
      { value: "group", title: "“I’m ordering for a PG, hostel or office”" },
    ],
  },
};
```

- [ ] **Step 7: Export**

```ts
export {
  ChoiceCardGroup,
  type ChoiceCardGroupProps,
  type ChoiceGridMin,
  type ChoiceOption,
} from "./molecules/choice-card-group/choice-card-group";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/design-tokens/tokens/component/choice-card.json packages/design-tokens/tokens/semantic/shadow.json packages/design-tokens/contrast-pairs.json packages/ui/src/molecules/choice-card-group packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/design-tokens/tokens/component/choice-card.json packages/design-tokens/tokens/semantic/shadow.json packages/design-tokens/contrast-pairs.json packages/ui/src/molecules/choice-card-group packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): ChoiceCardGroup molecule

Card-style single choice from the handoff calculators on native radios
in a fieldset: tiles in an AutoGrid or full-width rows, a real radio on
the brand-surface trial selector. ref/onChange/onBlur reach every radio,
so react-hook-form's register() works unmodified. Adds the semantic
shadow.selected (a 2px selected border that never shifts layout).

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 11: CheckCard

**Files:**

- Create: `packages/ui/src/molecules/check-card/check-card.tsx`, `check-card.test.tsx`, `check-card.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** none (handoff component)

**Interfaces:**

- Consumes: native `<input type="checkbox">`; `Icon` (`Check`); `shadow-selected` (Task 10); `transition-control` (Plan 2a); `useId`; `fakeRegister` (Plan 2b, tests).
- Produces: `CheckCard`, `type CheckCardProps` (contract §6). Server-safe. Every native input prop (`name`, `checked`, `defaultChecked`, `onChange`, `onBlur`, `ref`, `disabled`, `value`) goes to the checkbox, so `{...register("upfront")}` works; `className` goes to the card.

- [ ] **Step 1: Tokens** — none new: the tick box is `size-5.5` (22px) with `rounded-sm` (6px), the card `min-h-13` (52px), `shadow-selected` from Task 10.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/check-card/check-card.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations, fakeRegister } from "../../../vitest.setup";
import { CheckCard } from "./check-card";

const UPFRONT = {
  title: "Pay 3 months upfront",
  description: "Classic at ₹125 a meal, locked for 3 cycles",
} as const;

describe("CheckCard", () => {
  it("is a checkbox named by its title and described by its detail", () => {
    render(<CheckCard {...UPFRONT} />);
    const checkbox = screen.getByRole("checkbox", { name: UPFRONT.title });
    expect(checkbox).toHaveAccessibleDescription(UPFRONT.description);
  });

  it("toggles by click and by Space, with the native change event", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CheckCard {...UPFRONT} onChange={onChange} />);
    const checkbox = screen.getByRole("checkbox", { name: UPFRONT.title });
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    await user.keyboard(" ");
    expect(checkbox).not.toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("toggles when the card's words are clicked, not just the box", async () => {
    const user = userEvent.setup();
    render(<CheckCard {...UPFRONT} />);
    await user.click(screen.getByText(UPFRONT.description));
    expect(screen.getByRole("checkbox", { name: UPFRONT.title })).toBeChecked();
  });

  it("submits with its form under its name", async () => {
    const user = userEvent.setup();
    render(
      <form aria-label="Plan">
        <CheckCard {...UPFRONT} name="upfront" />
      </form>
    );
    await user.click(screen.getByRole("checkbox"));
    const form = screen.getByRole("form", { name: "Plan" });
    expect(form instanceof HTMLFormElement && new FormData(form).get("upfront")).toBe("on");
  });

  it("takes react-hook-form's register() unmodified", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("upfront");
    render(<CheckCard {...UPFRONT} {...field} />);
    const checkbox = screen.getByRole("checkbox", { name: UPFRONT.title });
    expect(field.ref).toHaveBeenCalledWith(checkbox);
    expect(checkbox).toHaveAttribute("name", "upfront");
    await user.click(checkbox);
    expect(field.onChange).toHaveBeenCalledOnce();
    await user.tab();
    expect(field.onBlur).toHaveBeenCalledOnce();
  });

  it("stays a light island on dark fields and can be disabled", () => {
    const { container } = render(<CheckCard {...UPFRONT} disabled />);
    expect(container.firstElementChild).toHaveAttribute("data-surface", "light");
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  it("has no accessibility violations when checked", async () => {
    const { container } = render(<CheckCard {...UPFRONT} defaultChecked />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- check-card 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./check-card`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/check-card/check-card.tsx`:

```tsx
import { type ComponentProps, type ReactNode, useId } from "react";

import { Check } from "lucide-react";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";

const checkCard = componentVariants({
  slots: {
    root: "has-checked:shadow-selected flex min-h-13 cursor-pointer items-center gap-3 rounded-md border border-border-default bg-surface-card px-3.5 py-3 text-text-heading transition-control has-checked:border-border-brand has-checked:bg-pink-50 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus has-disabled:cursor-not-allowed has-disabled:border-border-subtle has-disabled:bg-ink-200 has-disabled:text-ink-400",
    // The native checkbox, restyled, with the tick stacked on it in the same grid cell.
    box: "grid shrink-0 place-items-center",
    input:
      "peer col-start-1 row-start-1 size-5.5 cursor-pointer appearance-none rounded-sm border-2 border-border-brand bg-ink-000 checked:bg-pink-500 focus-visible:outline-none disabled:cursor-not-allowed",
    tick: "pointer-events-none col-start-1 row-start-1 hidden text-ink-000 peer-checked:inline-flex",
    body: "flex min-w-0 flex-col items-start gap-0.5 text-left",
    title: "font-display text-body-sm font-bold",
    description: "text-caption",
  },
});

export interface CheckCardProps extends Omit<ComponentProps<"input">, "size" | "title" | "type"> {
  title: ReactNode;
  description?: ReactNode | undefined;
}

/** A card-sized toggle with a tick box (Pay 3 months upfront, No onion no garlic). */
export function CheckCard({ title, description, className, id, ...props }: CheckCardProps) {
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const styles = checkCard();

  return (
    <label data-surface="light" className={styles.root({ className })}>
      <span className={styles.box()}>
        <input
          type="checkbox"
          id={baseId}
          aria-labelledby={`${baseId}-title`}
          aria-describedby={description ? `${baseId}-description` : undefined}
          className={styles.input()}
          {...props}
        />
        <Icon icon={Check} size="xs" className={styles.tick()} />
      </span>
      <span className={styles.body()}>
        <span id={`${baseId}-title`} className={styles.title()}>
          {title}
        </span>
        {description ? (
          <span id={`${baseId}-description`} className={styles.description()}>
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- check-card 2>&1 | tail -8`
Expected: PASS (7 tests).

- [ ] **Step 6: Stories — both handoff usages (PlanCalculator), checked and disabled states**

`packages/ui/src/molecules/check-card/check-card.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { CheckCard } from "./check-card";

const meta = {
  title: "Molecules/CheckCard",
  component: CheckCard,
  args: {
    title: "Pay 3 months upfront",
    description: `Classic at ${formatRupees(125)} a meal, locked for 3 cycles`,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-text-measure-prose">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'A card-sized toggle with a tick box, from the handoff PlanCalculator. A native checkbox: every input prop goes to it, so `{...register("upfront")}` works unmodified. The whole card is the label.',
      },
    },
  },
} satisfies Meta<typeof CheckCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvas, userEvent }) => {
    const checkbox = canvas.getByRole("checkbox", { name: "Pay 3 months upfront" });
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await userEvent.keyboard(" ");
    await expect(checkbox).not.toBeChecked();
  },
};

/** PlanCalculator "3. How many meals" — upfront, checked. */
export const Upfront: Story = { args: { defaultChecked: true } };

/** PlanCalculator "5. Make it yours" — no onion, no garlic. */
export const NoOnionGarlic: Story = {
  args: {
    title: `No onion, no garlic · +${formatRupees(30)} a meal`,
    description: "Cooked in a separate pan, off the main batch",
  },
};

export const Disabled: Story = { args: { disabled: true } };
```

- [ ] **Step 7: Export**

```ts
export { CheckCard, type CheckCardProps } from "./molecules/check-card/check-card";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/ui/src/molecules/check-card packages/ui/src/index.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/molecules/check-card packages/ui/src/index.ts
git commit -m "feat(ui): CheckCard molecule

Card-sized toggle on a restyled native checkbox (the handoff's upfront
and no-onion-garlic options). Native props go to the input, so
react-hook-form's register() works unmodified.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 12: ChipGroup

**Files:**

- Create: `packages/ui/src/molecules/chip-group/chip-group.tsx`, `chip-group.test.tsx`, `chip-group.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** none (handoff component)

**Interfaces:**

- Consumes: `ToggleGroup` from `radix-ui` (verified: `type="single"` → `role="radiogroup"` + items `role="radio"`/`aria-checked`, clears on a second press; `type="multiple"` → `role="toolbar"` + items `aria-pressed`; items with `disabled` get the native attribute and leave the roving order; the group's own `disabled?: boolean` is declared without `| undefined`, so it is always passed a boolean), `tagVariants`, `Icon`, `useId`.
- Produces: `ChipGroup`, `type ChipGroupProps`, `type ChipOption`, `type SingleChipGroupProps`, `type MultipleChipGroupProps` (contract §6 + deviation 5). **Client component.** Defaults: `variant = "chips"`, `disabled = false`, limit message `"N of M chosen."` / `"M of M chosen. Remove one to choose another."`. RHF `<Controller>`: `value`, `onValueChange`, `onBlur`, `name`.

- [ ] **Step 1: Tokens** — none new (Tag skins; the segmented track is `rounded-pill border bg-surface-card p-1 gap-1`).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/chip-group/chip-group.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { ChipGroup } from "./chip-group";

const MEALS = [
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "both", label: "Lunch + Dinner" },
];

const STARTERS = [
  { value: "chilli-potato", label: "Chilli Potato" },
  { value: "honey-chilli-potato", label: "Honey Chilli Potato" },
  { value: "veg-manchurian", label: "Veg Manchurian" },
];

describe("ChipGroup", () => {
  it("as a single group is a named radio group that always keeps its one choice", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ChipGroup type="single" label="Which meals" options={MEALS} onValueChange={onValueChange} />
    );
    expect(screen.getByRole("radiogroup", { name: "Which meals" })).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Dinner" }));
    await user.click(screen.getByRole("radio", { name: "Dinner" }));
    expect(screen.getByRole("radio", { name: "Dinner" })).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("dinner");
  });

  it("as a multiple group is a toolbar of toggle buttons", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ChipGroup
        type="multiple"
        label="Starters"
        options={STARTERS}
        onValueChange={onValueChange}
      />
    );
    expect(screen.getByRole("toolbar", { name: "Starters" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Chilli Potato" }));
    await user.click(screen.getByRole("button", { name: "Veg Manchurian" }));
    expect(screen.getByRole("button", { name: "Chilli Potato" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(onValueChange).toHaveBeenLastCalledWith(["chilli-potato", "veg-manchurian"]);
  });

  it("never lets a keyboard user pick more than maxSelected, and says why the rest are unavailable", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ChipGroup
        type="multiple"
        label="Starters"
        options={STARTERS}
        maxSelected={2}
        onValueChange={onValueChange}
      />
    );
    await user.tab();
    await user.keyboard(" ");
    await user.keyboard("{ArrowRight} ");
    await user.keyboard("{ArrowRight}");
    const blocked = screen.getByRole("button", { name: "Veg Manchurian" });
    expect(blocked).toHaveFocus();
    expect(blocked).toHaveAttribute("aria-disabled", "true");
    await user.keyboard(" ");
    await user.keyboard("{Enter}");
    expect(blocked).toHaveAttribute("aria-pressed", "false");
    expect(onValueChange).toHaveBeenLastCalledWith(["chilli-potato", "honey-chilli-potato"]);
    expect(screen.getByRole("toolbar", { name: "Starters" })).toHaveAccessibleDescription(
      "2 of 2 chosen. Remove one to choose another."
    );
    expect(screen.getByText("2 of 2 chosen. Remove one to choose another.")).toHaveAttribute(
      "aria-live",
      "polite"
    );
  });

  it("frees the other chips as soon as one is removed", async () => {
    const user = userEvent.setup();
    render(
      <ChipGroup
        type="multiple"
        label="Starters"
        options={STARTERS}
        maxSelected={2}
        defaultValue={["chilli-potato", "honey-chilli-potato"]}
      />
    );
    expect(screen.getByRole("button", { name: "Veg Manchurian" })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    await user.click(screen.getByRole("button", { name: "Chilli Potato" }));
    expect(screen.getByRole("button", { name: "Veg Manchurian" })).not.toHaveAttribute(
      "aria-disabled"
    );
    expect(screen.getByText("1 of 2 chosen.")).toBeInTheDocument();
  });

  it("lets the page word the limit", () => {
    render(
      <ChipGroup
        type="multiple"
        label="Starters"
        options={STARTERS}
        maxSelected={3}
        getLimitMessage={(selected, max) => `Pick ${String(max)} · ${String(selected)} picked`}
      />
    );
    expect(screen.getByText("Pick 3 · 0 picked")).toBeInTheDocument();
  });

  it("rejects a limit that could never be met", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() =>
      render(<ChipGroup type="multiple" label="Starters" options={STARTERS} maxSelected={0} />)
    ).toThrow(RangeError);
    vi.restoreAllMocks();
  });

  it("submits its values with a form under its name", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ChipGroup type="multiple" label="Starters" name="starters" options={STARTERS} />
    );
    await user.click(screen.getByRole("button", { name: "Chilli Potato" }));
    await user.click(screen.getByRole("button", { name: "Veg Manchurian" }));
    const values = [
      ...container.querySelectorAll<HTMLInputElement>('input[type="hidden"][name="starters"]'),
    ].map((input) => input.value);
    expect(values).toEqual(["chilli-potato", "veg-manchurian"]);
  });

  it("reports blur only when focus leaves the whole group", async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    render(
      <>
        <ChipGroup type="single" label="Which meals" options={MEALS} onBlur={onBlur} />
        <button type="button">Next step</button>
      </>
    );
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(onBlur).not.toHaveBeenCalled();
    await user.tab();
    expect(screen.getByRole("button", { name: "Next step" })).toHaveFocus();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("draws the segmented pill track, with unchosen options unfilled", () => {
    render(
      <ChipGroup
        type="single"
        variant="segmented"
        label="Meals per day"
        defaultValue="one"
        options={[
          { value: "one", label: "Lunch or dinner" },
          { value: "both", label: "Lunch + dinner" },
        ]}
      />
    );
    expect(screen.getByRole("radiogroup")).toHaveClass("rounded-pill");
    expect(screen.getByRole("radio", { name: "Lunch + dinner" })).toHaveClass("bg-transparent");
    expect(screen.getByRole("radio", { name: "Lunch or dinner" })).not.toHaveClass(
      "bg-transparent"
    );
  });

  it("disables one chip, or the whole group", () => {
    const { rerender } = render(
      <ChipGroup
        type="single"
        label="Which meals"
        options={MEALS.map((meal) => ({ ...meal, isDisabled: meal.value === "both" }))}
      />
    );
    expect(screen.getByRole("radio", { name: "Lunch + Dinner" })).toBeDisabled();
    rerender(<ChipGroup type="single" label="Which meals" options={MEALS} disabled />);
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
  });

  it.each([
    [
      "single",
      <ChipGroup
        key="single"
        type="single"
        label="Which meals"
        options={MEALS}
        defaultValue="lunch"
      />,
    ],
    [
      "multiple with a limit",
      <ChipGroup
        key="multiple"
        type="multiple"
        label="Starters"
        options={STARTERS}
        maxSelected={2}
        defaultValue={["chilli-potato", "veg-manchurian"]}
      />,
    ],
  ])("has no accessibility violations (%s)", async (_, element) => {
    const { container } = render(element);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- chip-group 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./chip-group`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/chip-group/chip-group.tsx`:

```tsx
"use client";

import { ToggleGroup } from "radix-ui";
import { type FocusEvent, type ReactNode, useId, useState } from "react";

import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { tagVariants } from "../../atoms/tag/tag";
import { componentVariants } from "../../lib/component-variants";

export interface ChipOption {
  value: string;
  label: ReactNode;
  icon?: IconComponent | undefined;
  isDisabled?: boolean | undefined;
}

type ChipGroupVariant = "chips" | "segmented";

interface ChipGroupBaseProps {
  /** Accessible name of the group — the visible step heading usually says the same. */
  label: string;
  options: ChipOption[];
  /** `chips`: wrapping Tag pills. `segmented`: a pill track switching one value (no panels). */
  variant?: ChipGroupVariant | undefined;
  className?: string | undefined;
  /** Renders hidden inputs, so the choice submits with a plain form. */
  name?: string | undefined;
  disabled?: boolean | undefined;
  /** Fires when focus leaves the group — react-hook-form's `field.onBlur`. */
  onBlur?: (() => void) | undefined;
}

export interface SingleChipGroupProps extends ChipGroupBaseProps {
  type: "single";
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
}

export interface MultipleChipGroupProps extends ChipGroupBaseProps {
  type: "multiple";
  value?: string[] | undefined;
  defaultValue?: string[] | undefined;
  onValueChange?: ((value: string[]) => void) | undefined;
  /** At most this many; the rest become unavailable (focusable, and the reason is announced). */
  maxSelected?: number | undefined;
  /** The status line under a limit. Default "2 of 3 chosen." / "3 of 3 chosen. Remove one to …". */
  getLimitMessage?: ((selected: number, max: number) => string) | undefined;
}

export type ChipGroupProps = SingleChipGroupProps | MultipleChipGroupProps;

const chipGroup = componentVariants({
  slots: {
    root: "flex flex-col gap-2",
    group: "flex flex-wrap gap-2",
    status: "m-0 max-w-none text-caption text-text-muted",
  },
  variants: {
    variant: {
      chips: {},
      segmented: {
        group:
          "w-fit flex-nowrap gap-1 rounded-pill border border-border-subtle bg-surface-card p-1",
      },
    },
  },
});

/**
 * Per-chip additions on top of the Tag skin. The Tag root already carries `controlStates`, so a chip
 * blocked by `maxSelected` (`aria-disabled`, still focusable) gets the grey disabled look and no
 * pointer events for free.
 */
const chipItem = componentVariants({
  variants: {
    // Unchosen segmented options shed the chip's outline and fill (the handoff's pill rail).
    isIdleSegment: { true: "border-transparent bg-transparent text-text-brand", false: "" },
  },
});

function defaultLimitMessage(selected: number, max: number): string {
  return selected >= max
    ? `${String(max)} of ${String(max)} chosen. Remove one to choose another.`
    : `${String(selected)} of ${String(max)} chosen.`;
}

/** Calls `onBlur` only when focus leaves the whole group, not when it moves between chips. */
function blurLeavingGroup(onBlur: () => void) {
  return (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    onBlur();
  };
}

function HiddenValues({ name, values }: { name: string | undefined; values: readonly string[] }) {
  if (name === undefined) return null;
  return values.map((item) => <input key={item} type="hidden" name={name} value={item} />);
}

interface ChipItemsProps {
  options: ChipOption[];
  selected: readonly string[];
  variant: ChipGroupVariant;
  isLimitReached?: boolean | undefined;
}

/** ToggleGroup items wearing the Tag skin — never a Tag button nested inside an item. */
function ChipItems({ options, selected, variant, isLimitReached = false }: ChipItemsProps) {
  return options.map((option) => {
    const isSelected = selected.includes(option.value);
    const tag = tagVariants({ isSelected, isInteractive: true });
    return (
      <ToggleGroup.Item
        key={option.value}
        value={option.value}
        disabled={option.isDisabled}
        aria-disabled={isLimitReached && !isSelected ? true : undefined}
        className={tag.root({
          className: chipItem({ isIdleSegment: variant === "segmented" && !isSelected }),
        })}
      >
        {option.icon === undefined ? null : <Icon icon={option.icon} size="sm" />}
        <span className={tag.label()}>{option.label}</span>
      </ToggleGroup.Item>
    );
  });
}

function SingleChipGroup({
  label,
  options,
  variant = "chips",
  className,
  name,
  disabled = false,
  onBlur,
  value,
  defaultValue,
  onValueChange,
}: SingleChipGroupProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "");
  const selected = value ?? uncontrolledValue;
  const values = selected === "" ? [] : [selected];
  const styles = chipGroup({ variant });

  const handleValueChange = (next: string) => {
    // A single group is a required choice: Radix clears it when the chosen chip is pressed again.
    if (next === "") return;
    setUncontrolledValue(next);
    onValueChange?.(next);
  };

  return (
    <div
      className={styles.root({ className })}
      onBlur={onBlur === undefined ? undefined : blurLeavingGroup(onBlur)}
    >
      <ToggleGroup.Root
        type="single"
        aria-label={label}
        value={selected}
        onValueChange={handleValueChange}
        disabled={disabled}
        className={styles.group()}
      >
        <ChipItems options={options} selected={values} variant={variant} />
      </ToggleGroup.Root>
      <HiddenValues name={name} values={values} />
    </div>
  );
}

function MultipleChipGroup({
  label,
  options,
  variant = "chips",
  className,
  name,
  disabled = false,
  onBlur,
  value,
  defaultValue,
  onValueChange,
  maxSelected,
  getLimitMessage = defaultLimitMessage,
}: MultipleChipGroupProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? []);
  const statusId = useId();
  if (maxSelected !== undefined && (!Number.isInteger(maxSelected) || maxSelected < 1)) {
    throw new RangeError(
      `ChipGroup: maxSelected must be a whole number ≥ 1, got ${String(maxSelected)}`
    );
  }
  const selected = value ?? uncontrolledValue;
  const isLimitReached = maxSelected !== undefined && selected.length >= maxSelected;
  const styles = chipGroup({ variant });

  const handleValueChange = (next: string[]) => {
    // A chip blocked by the limit was pressed: the selection stays as it is.
    if (maxSelected !== undefined && next.length > maxSelected) return;
    setUncontrolledValue(next);
    onValueChange?.(next);
  };

  return (
    <div
      className={styles.root({ className })}
      onBlur={onBlur === undefined ? undefined : blurLeavingGroup(onBlur)}
    >
      {maxSelected === undefined ? null : (
        <p id={statusId} aria-live="polite" className={styles.status()}>
          {getLimitMessage(selected.length, maxSelected)}
        </p>
      )}
      <ToggleGroup.Root
        type="multiple"
        aria-label={label}
        aria-describedby={maxSelected === undefined ? undefined : statusId}
        value={selected}
        onValueChange={handleValueChange}
        disabled={disabled}
        className={styles.group()}
      >
        <ChipItems
          options={options}
          selected={selected}
          variant={variant}
          isLimitReached={isLimitReached}
        />
      </ToggleGroup.Root>
      <HiddenValues name={name} values={selected} />
    </div>
  );
}

/**
 * Tag-based single or multiple selection for the calculators (meals, breads, spice, add-ons,
 * starter picks) and the segmented value switch. Radix ToggleGroup: roving focus, arrows move,
 * Space/Enter choose.
 */
export function ChipGroup(props: ChipGroupProps) {
  return props.type === "single" ? (
    <SingleChipGroup {...props} />
  ) : (
    <MultipleChipGroup {...props} />
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- chip-group 2>&1 | tail -8`
Expected: PASS (12 tests).

- [ ] **Step 6: Stories — every calculator group, the starter limit, the segmented switches, OnSurfaces and keyboard `play`**

`packages/ui/src/molecules/chip-group/chip-group.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { OnSurfaces } from "../../lib/story-surfaces";
import { ChipGroup } from "./chip-group";

/** PlanCalculator "6. Standing add-ons" (`rates.js` → homely.addons). */
const ADD_ONS = [
  ["paneer", "Upgrade sabji to paneer gravy", 40],
  ["makhani", "Upgrade dal to Dal Makhani", 30],
  ["sabji", "Extra sabji (150–180g)", 35],
  ["dal", "Extra dal (150–180ml)", 25],
  ["raita", "Boondi or Kheera Raita", 25],
  ["lassi", "Sweet Lassi (250ml)", 49],
  ["kheer", "Rice Kheer", 39],
  ["gj", "Gulab Jamun (1pc)", 15],
  ["chaas", "Masala Chaas (200ml)", 39],
  ["papad", "Roasted Papad", 20],
  ["roti", "2 extra Tawa Roti", 30],
] as const;

/** DawatCalculator "3. Starters" — the Veg Starter Combo, pick any 3. */
const VEG_STARTERS = [
  "Chilli Potato",
  "Honey Chilli Potato",
  "Veg Manchurian",
  "Veg Hakka Noodles",
  "Veg Chowmein",
  "Veg Spring Roll",
  "Hara Bhara Kebab",
].map((item) => ({ value: item, label: item }));

const meta = {
  title: "Molecules/ChipGroup",
  component: ChipGroup,
  args: {
    type: "single",
    label: "Which meals",
    defaultValue: "lunch",
    options: [
      { value: "lunch", label: "Lunch" },
      { value: "dinner", label: "Dinner" },
      { value: "both", label: "Lunch + Dinner" },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-article">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Tag-based selection from the handoff calculators on Radix ToggleGroup (never a Tag button nested in an item). `type="single"` is a required choice (it never clears); `type="multiple"` toggles, and `maxSelected` makes the rest unavailable — still focusable, with a live status line saying why. `variant="segmented"` is the pill-track value switch (Lunch / Both) without panels; use Tabs when panels change. For react-hook-form use `<Controller>` with `value`, `onValueChange`, `onBlur` and `name`.',
      },
    },
  },
} satisfies Meta<typeof ChipGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** PlanCalculator "2. Which meals". */
export const WhichMeals: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Dinner" }));
    await expect(canvas.getByRole("radio", { name: "Dinner" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    await userEvent.keyboard("{ArrowRight} ");
    await expect(canvas.getByRole("radio", { name: "Lunch + Dinner" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
  },
};

/** PlanCalculator "5. Make it yours" — bread and spice. */
export const MakeItYours: Story = {
  render: () => (
    <div className="grid gap-3">
      <ChipGroup
        type="single"
        label="Rice and roti"
        defaultValue="both"
        options={[
          { value: "both", label: "Rice + roti" },
          { value: "rice", label: "Rice only (300g)" },
          { value: "roti", label: "Roti only (+2 roti)" },
        ]}
      />
      <ChipGroup
        type="single"
        label="Spice"
        defaultValue="regular"
        options={[
          { value: "regular", label: "Regular spice" },
          { value: "less", label: "Less spicy" },
          { value: "none", label: "No chilli" },
        ]}
      />
    </div>
  ),
};

/** PlanCalculator "6. Standing add-ons" — multiple. */
export const StandingAddOns: Story = {
  args: {
    type: "multiple",
    label: "Standing add-ons",
    defaultValue: ["lassi"],
    options: ADD_ONS.map(([value, name, price]) => ({
      value,
      label: `${name} +${formatRupees(price)}`,
    })),
  },
};

/** DawatCalculator starter picks — any 3, the rest unavailable once 3 are chosen. */
export const StarterPicks: Story = {
  args: {
    type: "multiple",
    label: "Veg starters",
    maxSelected: 3,
    options: VEG_STARTERS,
    getLimitMessage: (selected, max) => `Pick ${String(max)} · ${String(selected)} picked`,
  },
  play: async ({ canvas, userEvent }) => {
    for (const name of ["Chilli Potato", "Veg Manchurian", "Veg Spring Roll"]) {
      await userEvent.click(canvas.getByRole("button", { name }));
    }
    const blocked = canvas.getByRole("button", { name: "Hara Bhara Kebab" });
    await expect(blocked).toHaveAttribute("aria-disabled", "true");
    // Blocked chips take no pointer events (controlStates); the keyboard is the path to prove.
    blocked.focus();
    await userEvent.keyboard(" ");
    await expect(blocked).toHaveAttribute("aria-pressed", "false");
    await expect(canvas.getByText("Pick 3 · 3 picked")).toBeInTheDocument();
  },
};

/** HomelyMeals price list switch — segmented. */
export const Segmented: Story = {
  args: {
    type: "single",
    variant: "segmented",
    label: "Meals per day",
    defaultValue: "one",
    options: [
      { value: "one", label: "Lunch or dinner" },
      { value: "both", label: "Lunch + dinner" },
    ],
  },
};

/** OfficeLunch "Plate" — chips on the ink section. */
export const OnInk: Story = {
  args: {
    type: "single",
    label: "Plate",
    defaultValue: "everyday",
    options: [
      { value: "everyday", label: `Everyday · ${formatRupees(99)}` },
      { value: "classic", label: `Classic · ${formatRupees(119)}` },
    ],
  },
  render: (args) => (
    <div data-surface="ink" className="rounded-lg bg-surface-inverse p-6">
      <ChipGroup {...args} />
    </div>
  ),
};

export const OnSurfaces: Story = {
  render: (args) => (
    <OnSurfaces>
      <div className="grid min-w-0 flex-1 gap-3">
        <ChipGroup {...args} />
        <ChipGroup {...args} variant="segmented" />
      </div>
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export {
  ChipGroup,
  type ChipGroupProps,
  type ChipOption,
  type MultipleChipGroupProps,
  type SingleChipGroupProps,
} from "./molecules/chip-group/chip-group";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/ui/src/molecules/chip-group packages/ui/src/index.ts`; then the limit in Chromium:

```bash
pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache -- chip-group 2>&1 | tail -10
```

Expected: every ChipGroup story passes, including `StarterPicks`' play.

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/molecules/chip-group packages/ui/src/index.ts
git commit -m "feat(ui): ChipGroup molecule

Tag-skinned Radix ToggleGroup for the calculators: a single group is a
required choice that never clears; a multiple group honours maxSelected
by making the rest focusable-but-unavailable, with a live status line
the group is described by, so no keyboard path can exceed the limit.
Segmented pill-track variant; value/onValueChange/onBlur/name for RHF.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 13: KeyValueList

**Files:**

- Create: `packages/ui/src/molecules/key-value-list/key-value-list.tsx`, `key-value-list.test.tsx`, `key-value-list.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** none (handoff component)

**Interfaces:**

- Consumes: `componentVariants` only (semantic text/border tokens, so it follows any surface).
- Produces: `KeyValueList`, `type KeyValueListProps`, `type KeyValueItem` (contract §6 + deviation 4). `KeyValueItem` is also consumed by QuotePanel (Plan 4, `lines?: KeyValueItem[]`). Defaults: `density = "default"`, `hasDividers = true`, `emphasis = "value"`; without `keyWidth` the row is a split row.

- [ ] **Step 1: Tokens** — none new: key columns are `w-22` (88px, the calculator's "Your box") and `w-30` (120px, the booking rules / box compare); rows `py-2` / `py-3`.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/key-value-list/key-value-list.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { KeyValueList } from "./key-value-list";

const BOX = [
  { key: "Dal", value: "1, from 8 dals incl. Rajma, Chole, Dal Makhani" },
  { key: "Rice", value: "200g · jeera rice Tue & Wed" },
  { key: "Add-on", value: "Sweet Lassi (250ml)", isEmphasised: true },
];

describe("KeyValueList", () => {
  it("is a description list of term and definition pairs", () => {
    render(<KeyValueList items={BOX} />);
    expect(screen.getAllByRole("term").map((term) => term.textContent)).toEqual([
      "Dal",
      "Rice",
      "Add-on",
    ]);
    expect(screen.getAllByRole("definition")).toHaveLength(3);
  });

  it.each([
    ["sm", "w-22"],
    ["md", "w-30"],
  ] as const)("gives the key a fixed %s column", (keyWidth, widthClass) => {
    render(<KeyValueList items={BOX} keyWidth={keyWidth} />);
    expect(screen.getAllByRole("term")[0]).toHaveClass(widthClass, "shrink-0");
    expect(screen.getAllByRole("definition")[0]).toHaveClass("flex-1");
  });

  it("sets key and value at either end of the row without a key width", () => {
    render(<KeyValueList items={BOX} />);
    const [firstValue] = screen.getAllByRole("definition");
    expect(firstValue).toHaveClass("text-end");
    expect(firstValue?.parentElement).toHaveClass("justify-between", "flex-wrap");
  });

  it("mutes the key and leads with the value by default, or leads with the key", () => {
    const { rerender } = render(<KeyValueList items={BOX} />);
    expect(screen.getAllByRole("term")[0]).toHaveClass("text-text-muted");
    expect(screen.getAllByRole("definition")[0]).toHaveClass("text-text-heading");
    rerender(<KeyValueList items={BOX} emphasis="key" />);
    expect(screen.getAllByRole("term")[0]).toHaveClass("font-bold", "text-text-heading");
    expect(screen.getAllByRole("definition")[0]).toHaveClass("text-text-muted");
  });

  it("picks out an emphasised value in the brand colour", () => {
    render(<KeyValueList items={BOX} />);
    const values = screen.getAllByRole("definition");
    expect(values[2]).toHaveClass("font-semibold", "text-text-brand");
    expect(values[0]).not.toHaveClass("text-text-brand");
  });

  it("rules every row by default and drops the rules on request", () => {
    const { rerender } = render(<KeyValueList items={BOX} />);
    expect(screen.getAllByRole("term")[0]?.parentElement).toHaveClass("border-t");
    rerender(<KeyValueList items={BOX} hasDividers={false} />);
    expect(screen.getAllByRole("term")[0]?.parentElement).not.toHaveClass("border-t");
  });

  it("tightens the rows when compact", () => {
    const { rerender } = render(<KeyValueList items={BOX} />);
    expect(screen.getAllByRole("term")[0]?.parentElement).toHaveClass("py-3");
    rerender(<KeyValueList items={BOX} density="compact" />);
    expect(screen.getAllByRole("term")[0]?.parentElement).toHaveClass("py-2");
  });

  it("takes any content as a value", () => {
    render(<KeyValueList items={[{ key: "Status", value: <strong>Confirmed</strong> }]} />);
    expect(screen.getByRole("definition")).toContainElement(screen.getByText("Confirmed"));
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<KeyValueList items={BOX} keyWidth="sm" density="compact" />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- key-value-list 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./key-value-list`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/key-value-list/key-value-list.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { componentVariants } from "../../lib/component-variants";

export interface KeyValueItem {
  key: ReactNode;
  value: ReactNode;
  /** Picks the value out in the brand colour (a changed or added item). */
  isEmphasised?: boolean | undefined;
}

export interface KeyValueListProps extends ComponentProps<"dl"> {
  items: KeyValueItem[];
  density?: "compact" | "default" | undefined;
  /** A fixed key column (88 / 120px). Without it, key and value sit at either end of the row. */
  keyWidth?: "sm" | "md" | undefined;
  hasDividers?: boolean | undefined;
  /** `value`: muted key, strong value. `key`: strong key, muted value. */
  emphasis?: "value" | "key" | undefined;
}

const keyValueList = componentVariants({
  slots: {
    root: "m-0 text-body-sm",
    row: "flex gap-x-3 gap-y-1",
    key: "m-0",
    value: "m-0 min-w-0",
  },
  variants: {
    density: { compact: { row: "py-2" }, default: { row: "py-3" } },
    keyWidth: { sm: { key: "w-22 shrink-0" }, md: { key: "w-30 shrink-0" } },
    isSplit: {
      true: { row: "flex-wrap justify-between", value: "text-end" },
      false: { value: "flex-1" },
    },
    hasDividers: { true: { row: "border-t border-border-subtle" }, false: {} },
    emphasis: {
      value: { key: "text-text-muted", value: "text-text-heading" },
      key: { key: "font-display font-bold text-text-heading", value: "text-text-muted" },
    },
    isEmphasised: { true: { value: "font-semibold text-text-brand" }, false: {} },
  },
});

/**
 * Label/value rows as a `<dl>`: the calculator's "Your box", booking rules, customisations,
 * price lists and quote lines. Semantic tokens only, so it reads on any surface.
 */
export function KeyValueList({
  items,
  density = "default",
  keyWidth,
  hasDividers = true,
  emphasis = "value",
  className,
  ...props
}: KeyValueListProps) {
  const styles = keyValueList({
    density,
    hasDividers,
    emphasis,
    isSplit: keyWidth === undefined,
    ...(keyWidth === undefined ? {} : { keyWidth }),
  });

  return (
    <dl className={styles.root({ className })} {...props}>
      {items.map((item, index) => (
        <div key={index} className={styles.row()}>
          <dt className={styles.key()}>{item.key}</dt>
          <dd className={styles.value({ isEmphasised: item.isEmphasised === true })}>
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- key-value-list 2>&1 | tail -8`
Expected: PASS (10 tests).

- [ ] **Step 6: Stories — "Your box", booking rules, customisations, add-on prices, quote lines, OnSurfaces**

`packages/ui/src/molecules/key-value-list/key-value-list.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { OnSurfaces } from "../../lib/story-surfaces";
import { KeyValueList } from "./key-value-list";

/** PlanCalculator "Your box" for Classic (`rates.js` → homely.plates[1].box). */
const YOUR_BOX = [
  { key: "Dal", value: "1, from 8 dals incl. Rajma, Chole, Dal Makhani" },
  { key: "Sabji", value: "1, from 18 sabjis incl. Mix Veg, Kofta, Gatte" },
  { key: "Rice", value: "200g · jeera rice Tue & Wed" },
  { key: "Roti", value: "3 fresh tawa roti" },
  { key: "Salad", value: "Salad + chutney" },
  { key: "Raita", value: "3× a week, incl. biryani day" },
  { key: "Paneer", value: "Mon lunch · Wed dinner — restaurant-style" },
  { key: "Dessert", value: "Biryani day only" },
  {
    key: "Biryani",
    value: "Veg Dum Biryani, Fri lunch · Tue dinner — with Salan, Raita, Gulab Jamun",
  },
  { key: "Add-on", value: "Sweet Lassi (250ml)", isEmphasised: true },
];

const meta = {
  title: "Molecules/KeyValueList",
  component: KeyValueList,
  args: { items: YOUR_BOX, keyWidth: "sm", density: "compact" },
  decorators: [
    (Story) => (
      <div className="w-full max-w-text-measure-prose">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Label/value rows as a `<dl>` — the calculator\'s "Your box", the catering booking rules, the customisation list, price lists and quote lines. `keyWidth` fixes a key column; without it key and value sit at either end of the row. `emphasis="key"` leads with the key; `isEmphasised` picks out a changed or added value. Semantic tokens only, so it reads on any surface.',
      },
    },
  },
} satisfies Meta<typeof KeyValueList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** PlanCalculator "Your box". */
export const YourBox: Story = {};

/** Catering "How to book" rules panel — strong keys on the ink section. */
export const BookingRules: Story = {
  args: {
    keyWidth: "md",
    density: "default",
    emphasis: "key",
    items: [
      {
        key: "Minimum",
        value: "15 guests for a Dawat · 50 pieces for snacks · 25 guests for setup and service",
      },
      { key: "Notice", value: "24 hours up to 50 guests · 48 hours above 50" },
      { key: "Advance", value: "50% to confirm the date, balance on delivery" },
      { key: "GST", value: "Prices exclude GST, charged at 5%" },
      { key: "Changes", value: "Menu and headcount free up to 24 hours before" },
      { key: "Trial Dawat", value: "Normal per-head rate, credited in full when you confirm" },
    ],
  },
  render: (args) => (
    <div data-surface="ink" className="rounded-xl bg-surface-inverse p-6">
      <div className="rounded-xl bg-surface-card px-6 py-1">
        <KeyValueList {...args} />
      </div>
    </div>
  ),
};

/** HomelyMeals "Make it yours" — split rows. */
export const Customisations: Story = {
  args: {
    keyWidth: undefined,
    density: "default",
    emphasis: "key",
    items: [
      { key: "Rice only, no roti", value: "Rice raised to 300g" },
      { key: "Roti only, no rice", value: "2 extra roti" },
      { key: "Less spicy, or no chilli", value: "Same food, cooked mild" },
      { key: "Skip a single meal", value: "No charge for that meal" },
      { key: "No onion, no garlic", value: `${formatRupees(30)} a meal · separate pan` },
    ],
  },
};

/** Catering "Upgrades, per head" — a price list. */
export const UpgradePrices: Story = {
  args: {
    keyWidth: undefined,
    density: "default",
    items: [
      { key: "Paneer gravy instead of Mix Veg", value: `+${formatRupees(25)}` },
      { key: "Dal Makhani instead of Dal Fry", value: `+${formatRupees(25)}` },
      { key: "Jeera Rice instead of Steamed Rice", value: `+${formatRupees(20)}` },
      { key: "Lachha Paratha in place of one roti", value: `+${formatRupees(25)}` },
      { key: "Gulab Jamun, 2 pc instead of 1", value: `+${formatRupees(15)}` },
    ],
  },
};

/** PlanCalculator quote lines on the brand panel (Classic launch price, Weekday plan). */
export const QuoteLines: Story = {
  args: {
    keyWidth: undefined,
    items: [
      { key: `${formatRupees(130)} × 24 meals`, value: formatRupees(3120) },
      { key: "Offer: free meals (1)", value: formatRupees(0) },
      { key: "GST 5%", value: formatRupees(156) },
      { key: "Meals delivered", value: "25" },
    ],
  },
  render: (args) => (
    <div data-surface="brand" className="rounded-xl bg-surface-brand p-6">
      <KeyValueList {...args} />
    </div>
  ),
};

export const OnSurfaces: Story = {
  render: (args) => (
    <OnSurfaces>
      <div className="min-w-0 flex-1">
        <KeyValueList {...args} />
      </div>
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export {
  type KeyValueItem,
  KeyValueList,
  type KeyValueListProps,
} from "./molecules/key-value-list/key-value-list";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/ui/src/molecules/key-value-list packages/ui/src/index.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/molecules/key-value-list packages/ui/src/index.ts
git commit -m "feat(ui): KeyValueList molecule

Label/value rows as a real <dl> for the handoff's box contents, booking
rules, customisations, price lists and quote lines: fixed key column or
split row, muted-key or strong-key emphasis, an emphasised value, and
semantic tokens so it reads on every surface.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 14: Steps

**Files:**

- Create: `packages/design-tokens/tokens/component/steps.json`
- Create: `packages/ui/src/molecules/steps/steps.tsx`, `steps.test.tsx`, `steps.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`), `packages/ui/src/index.ts`

**Dev reference:** none (handoff component)

**Interfaces:**

- Consumes: `headingTag`; Plan 2c's `autogrid-min-md` utility (260px tracks; the handoff's 240 snaps up) for the `rule` variant; semantic tokens (`bg-surface-brand` + `text-text-on-brand` disc; `border-border-brand` rule; `text-text-brand` numbers).
- Produces: `Steps`, `type StepsProps`, `type StepsItem` (contract §6). Defaults: `variant = "circle"`, `headingLevel = 3`. Numbers are content (visible and read), not decoration: "1" in a disc, "01" over a rule.

- [ ] **Step 1: Component tokens**

Create `packages/design-tokens/tokens/component/steps.json`:

```json
{
  "text": {
    "$type": "typography",
    "steps-title": {
      "$value": { "fontSize": "17px", "lineHeight": 1.3, "fontWeight": "{font-weight.bold}" },
      "$description": "Step title (handoff 17–18px Poppins 700)."
    }
  }
}
```

Append `"steps-title",` to `TEXT`. Run `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache`.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/steps/steps.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Steps } from "./steps";

const HOW_IT_WORKS = [
  { title: "Pick on the site", description: "Choose a plan or a Dawat. The price is right there." },
  {
    title: "Confirm on WhatsApp",
    description: "Your choices arrive pre-written. We reply and lock it in.",
  },
  { title: "We cook and deliver" },
];

describe("Steps", () => {
  it("is an ordered list with one item per step", () => {
    render(<Steps items={HOW_IT_WORKS} />);
    expect(within(screen.getByRole("list")).getAllByRole("listitem")).toHaveLength(3);
  });

  it("titles each step as a level-3 heading by default", () => {
    render(<Steps items={HOW_IT_WORKS} />);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Pick on the site",
      "Confirm on WhatsApp",
      "We cook and deliver",
    ]);
  });

  it("uses the heading level the page needs", () => {
    render(<Steps items={HOW_IT_WORKS} headingLevel={4} />);
    expect(screen.getAllByRole("heading", { level: 4 })).toHaveLength(3);
  });

  it("numbers circle steps 1, 2, 3 in pink discs", () => {
    render(<Steps items={HOW_IT_WORKS} />);
    const marker = screen.getByText("1");
    expect(marker).toHaveClass("rounded-pill", "bg-surface-brand");
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("numbers rule steps 01, 02, 03 under a brand rule", () => {
    render(<Steps items={HOW_IT_WORKS} variant="rule" />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")[0]).toHaveClass("border-t-3", "border-border-brand");
  });

  it("shows a description only where one is given", () => {
    render(<Steps items={HOW_IT_WORKS} />);
    const [, , last] = screen.getAllByRole("listitem");
    expect(
      screen.getByText("Choose a plan or a Dawat. The price is right there.")
    ).toBeInTheDocument();
    expect(last?.querySelector("p")).toBeNull();
  });

  it.each(["circle", "rule"] as const)("has no accessibility violations (%s)", async (variant) => {
    const { container } = render(<Steps items={HOW_IT_WORKS} variant={variant} />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- steps 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./steps`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/steps/steps.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";

export interface StepsItem {
  title: ReactNode;
  description?: ReactNode | undefined;
}

export interface StepsProps extends ComponentProps<"ol"> {
  items: StepsItem[];
  /** `circle`: a pink disc per step, stacked. `rule`: a brand top rule and "01", in a grid. */
  variant?: "circle" | "rule" | undefined;
  headingLevel?: HeadingLevel | undefined;
}

type StepsVariant = NonNullable<StepsProps["variant"]>;

/** How each variant writes a step's number. */
const STEP_NUMBER: Readonly<Record<StepsVariant, (step: number) => string>> = {
  circle: (step) => String(step),
  rule: (step) => String(step).padStart(2, "0"),
};

const steps = componentVariants({
  slots: {
    root: "m-0",
    item: "",
    marker: "font-display font-black",
    body: "flex min-w-0 flex-col gap-1",
    title: "text-steps-title font-display text-text-heading",
    description: "m-0 max-w-none text-body text-text-body",
  },
  variants: {
    variant: {
      circle: {
        root: "flex flex-col gap-5",
        item: "flex items-start gap-3.5",
        marker:
          "grid size-11 shrink-0 place-items-center rounded-pill bg-surface-brand text-body text-text-on-brand",
      },
      rule: {
        root: "grid autogrid-min-md gap-4",
        item: "flex flex-col gap-2 border-t-3 border-border-brand pt-4",
        marker: "text-h2 leading-none text-text-brand",
      },
    },
  },
});

/** Numbered steps: Home "How it works", Catering "How to book", Homely Meals "Starting takes one message". */
export function Steps({
  items,
  variant = "circle",
  headingLevel = 3,
  className,
  ...props
}: StepsProps) {
  const styles = steps({ variant });
  const Heading = headingTag(headingLevel);

  return (
    <ol className={styles.root({ className })} {...props}>
      {items.map((item, index) => (
        <li key={index} className={styles.item()}>
          <span className={styles.marker()}>{STEP_NUMBER[variant](index + 1)}</span>
          <div className={styles.body()}>
            <Heading className={styles.title()}>{item.title}</Heading>
            {item.description ? <p className={styles.description()}>{item.description}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- steps 2>&1 | tail -8`
Expected: PASS (8 tests).

- [ ] **Step 6: Stories — the three handoff sections with their copy, OnSurfaces**

`packages/ui/src/molecules/steps/steps.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Steps } from "./steps";

/** Home "How it works". */
const HOW_IT_WORKS = [
  { title: "Pick on the site", description: "Choose a plan or a Dawat. The price is right there." },
  {
    title: "Confirm on WhatsApp",
    description: "Your choices arrive pre-written. We reply and lock it in.",
  },
  {
    title: "We cook and deliver",
    description: "Cooked that morning in our Sector 57 kitchen, delivered to your door.",
  },
];

const meta = {
  title: "Molecules/Steps",
  component: Steps,
  args: { items: HOW_IT_WORKS },
  decorators: [
    (Story) => (
      <div className="w-full max-w-article">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Numbered steps as an `<ol>`. `variant="circle"` stacks steps beside a 44px pink disc (Home, Catering); `variant="rule"` lays them out in a grid under a 3px brand rule with a large "01" (Homely Meals). Semantic tokens: titles and descriptions follow the surface.',
      },
    },
  },
} satisfies Meta<typeof Steps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Home "How it works" — circle, on the ink section. */
export const HowItWorks: Story = {
  render: (args) => (
    <div data-surface="ink" className="rounded-xl bg-surface-inverse p-8">
      <Steps {...args} />
    </div>
  ),
};

/** Catering "Three steps and it's done." — circle, on ink. */
export const HowToBook: Story = {
  args: {
    items: [
      {
        title: "Send us a message",
        description:
          "Date, rough headcount and the Dawat you like. A WhatsApp line is enough — or send it from the builder.",
      },
      {
        title: "We confirm within the hour",
        description:
          "Final price, delivery slot, and anything we’d change. Ask for a trial Dawat here.",
      },
      {
        title: "Pay 50% to hold the date",
        description: "Balance on delivery. Menu changes stay free up to 24 hours before.",
      },
    ],
  },
  render: HowItWorks.render,
};

/** Homely Meals "Starting takes one message." — rule variant. */
export const StartingTakesOneMessage: Story = {
  args: {
    variant: "rule",
    items: [
      {
        title: "WhatsApp us",
        description:
          "Your area and the plan you’re leaning toward. Or send it straight from the builder.",
      },
      {
        title: "Start with a trial",
        description: `5 meals on any days within a week. Classic ${formatRupees(650)}, Everyday ${formatRupees(600)}.`,
      },
      {
        title: "Pick your plan",
        description:
          "Weekday (24) or Full month (30). Runs from your start date. Weekdays only? Skip Saturdays free. Cancel with 7 days’ notice.",
      },
    ],
  },
};

export const OnSurfaces: Story = {
  render: (args) => (
    <OnSurfaces>
      <div className="grid min-w-0 flex-1 gap-8">
        <Steps {...args} variant="circle" />
        <Steps {...args} variant="rule" />
      </div>
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { Steps, type StepsItem, type StepsProps } from "./molecules/steps/steps";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/design-tokens/tokens/component/steps.json packages/ui/src/molecules/steps packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/design-tokens/tokens/component/steps.json packages/ui/src/molecules/steps packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): Steps molecule

Numbered steps as an ordered list: pink discs stacked (Home, Catering)
or a brand rule with 01/02/03 in a grid (Homely Meals). Titles are
headings at the page's level; semantic tokens follow every surface.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 15: FeatureItem

**Files:**

- Create: `packages/design-tokens/tokens/component/feature-item.json`
- Modify: `packages/design-tokens/tokens/surface/ink.json`, `packages/design-tokens/tokens/surface/light.json`, `packages/ui/src/lib/component-variants.ts` (`TEXT`)
- Create: `packages/ui/src/molecules/feature-item/feature-item.tsx`, `feature-item.test.tsx`, `feature-item.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** none (handoff component)

**Interfaces:**

- Consumes: `Icon` (`size="md"`, 20px, decorative), `headingTag`.
- Produces: `FeatureItem`, `type FeatureItemProps` (contract §6; deviation 14 on the trust cards). Defaults: `size = "md"`, `headingLevel = 3`. Surface-aware tile: pink-100 / pink-600 on light, ink-800 / pink-300 on ink (component tokens remapped by the ink surface).

- [ ] **Step 1: Component tokens — the tile skin follows the surface**

Create `packages/design-tokens/tokens/component/feature-item.json`:

```json
{
  "color": {
    "$type": "color",
    "feature-item-tile": {
      "$value": "{color.pink.100}",
      "$description": "Icon tile fill; ink-800 on the ink surface."
    },
    "feature-item-icon": {
      "$value": "{color.pink.600}",
      "$description": "Icon colour in the tile; pink-300 on the ink surface."
    }
  },
  "text": {
    "$type": "typography",
    "feature-item-title-md": {
      "$value": { "fontSize": "17px", "lineHeight": 1.3, "fontWeight": "{font-weight.bold}" },
      "$description": "Catering \"Why us\"."
    },
    "feature-item-title-sm": {
      "$value": { "fontSize": "16px", "lineHeight": 1.35, "fontWeight": "{font-weight.bold}" },
      "$description": "Office perks, Homely Meals \"What you get\"."
    }
  }
}
```

In `packages/design-tokens/tokens/surface/ink.json`, add inside `surface-ink` → `color`:

```json
"feature-item-tile": { "$value": "{color.ink.800}" },
"feature-item-icon": { "$value": "{color.pink.300}" }
```

In `packages/design-tokens/tokens/surface/light.json`, add inside `surface-light` → `color` (the light island restores every override — `theme.spec.ts` asserts it):

```json
"feature-item-tile": { "$value": "{color.pink.100}" },
"feature-item-icon": { "$value": "{color.pink.600}" }
```

Append `"feature-item-title-md", "feature-item-title-sm",` to `TEXT`. The icon is a graphic (WCAG 1.4.11, 3:1 — pink-600 on pink-100 is 4.08, pink-300 on ink-800 7.05), not text, so no contrast-policy pair is added; the title and description use `text-heading` / `text-muted`, already declared on every surface.

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -6 && rtk proxy grep -n "feature-item" packages/design-tokens/dist/surfaces.css`
Expected: PASS; `surfaces.css` shows `--color-feature-item-tile: var(--color-ink-800);` in the ink block and `var(--color-pink-100)` in the light block.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/feature-item/feature-item.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { Store } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { FeatureItem } from "./feature-item";

const WHY = {
  icon: Store,
  title: "We are a restaurant, not a contractor",
  description:
    "Come and eat here before you book. What you taste at our table is exactly what reaches yours.",
} as const;

describe("FeatureItem", () => {
  it("titles the feature as a level-3 heading beside its description", () => {
    render(<FeatureItem {...WHY} />);
    expect(screen.getByRole("heading", { level: 3, name: WHY.title })).toBeInTheDocument();
    expect(screen.getByText(WHY.description)).toBeInTheDocument();
  });

  it("puts the icon in a surface-aware tile, hidden from assistive tech", () => {
    const { container } = render(<FeatureItem {...WHY} />);
    const tile = container.querySelector("svg")?.closest(".rounded-md");
    expect(tile).toHaveClass("bg-feature-item-tile", "text-feature-item-icon");
    expect(container.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
  });

  it.each([
    ["md", "size-11", "text-feature-item-title-md", "text-body"],
    ["sm", "size-10", "text-feature-item-title-sm", "text-body-sm"],
  ] as const)("at size %s uses a %s tile", (size, tileClass, titleClass, descriptionClass) => {
    const { container } = render(<FeatureItem {...WHY} size={size} />);
    expect(container.querySelector("svg")?.closest(".rounded-md")).toHaveClass(tileClass);
    expect(screen.getByRole("heading")).toHaveClass(titleClass);
    expect(screen.getByText(WHY.description)).toHaveClass(descriptionClass);
  });

  it("uses the heading level the page needs", () => {
    render(<FeatureItem {...WHY} headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<FeatureItem {...WHY} />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- feature-item 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./feature-item`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/feature-item/feature-item.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";

export interface FeatureItemProps extends Omit<ComponentProps<"div">, "title"> {
  icon: IconComponent;
  title: ReactNode;
  description?: ReactNode | undefined;
  /** md: 44px tile, 17px title (Catering "Why us"). sm: 40px tile, 16px title (perks, "What you get"). */
  size?: "sm" | "md" | undefined;
  headingLevel?: HeadingLevel | undefined;
}

const featureItem = componentVariants({
  slots: {
    root: "flex items-start gap-3.5",
    tile: "bg-feature-item-tile text-feature-item-icon grid shrink-0 place-items-center rounded-md",
    body: "flex min-w-0 flex-col gap-1",
    title: "font-display text-text-heading",
    description: "m-0 max-w-none text-text-muted",
  },
  variants: {
    size: {
      md: { tile: "size-11", title: "text-feature-item-title-md", description: "text-body" },
      sm: { tile: "size-10", title: "text-feature-item-title-sm", description: "text-body-sm" },
    },
  },
});

/** An icon tile, a title and a line — "Why people call us back", office perks, "What you get". */
export function FeatureItem({
  icon,
  title,
  description,
  size = "md",
  headingLevel = 3,
  className,
  ...props
}: FeatureItemProps) {
  const styles = featureItem({ size });
  const Heading = headingTag(headingLevel);

  return (
    <div className={styles.root({ className })} {...props}>
      <span className={styles.tile()}>
        <Icon icon={icon} size="md" />
      </span>
      <div className={styles.body()}>
        <Heading className={styles.title()}>{title}</Heading>
        {description ? <p className={styles.description()}>{description}</p> : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- feature-item 2>&1 | tail -8`
Expected: PASS (6 tests).

- [ ] **Step 6: Stories — Catering "Why us", Office perks, Homely Meals "What you get" (ink), OnSurfaces**

`packages/ui/src/molecules/feature-item/feature-item.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  CirclePause,
  CreditCard,
  Flame,
  Gift,
  Lock,
  PartyPopper,
  Pencil,
  Presentation,
  Receipt,
  RefreshCw,
  Soup,
  Store,
  Truck,
  Users,
} from "lucide-react";

import { OnSurfaces } from "../../lib/story-surfaces";
import { FeatureItem } from "./feature-item";

/** Catering "Why people call us back." (`rates.js` → catering.why). */
const WHY_US = [
  {
    icon: Store,
    title: "We are a restaurant, not a contractor",
    description:
      "Come and eat here before you book. What you taste at our table is exactly what reaches yours.",
  },
  {
    icon: Flame,
    title: "Cooked the same day, for you",
    description:
      "Gravies, breads and starters are made for your order on the morning of. Nothing is reheated.",
  },
  {
    icon: Receipt,
    title: "One price per head, and that is it",
    description:
      "Food, packing and delivery are inside the number we quote. No fuel line, no service line.",
  },
  {
    icon: Pencil,
    title: "Your menu, not ours",
    description: "Swap any gravy, dal, rice or starter. Tell us what your family actually eats.",
  },
  {
    icon: Truck,
    title: "The transport is our problem",
    description:
      "We book the vehicle ourselves, in insulated trays, so food arrives hot and in one piece.",
  },
  {
    icon: Users,
    title: "Staff and setup, if you want it",
    description:
      "Buffet tables, chafing dishes, serving staff for the evening, and we clear up afterwards.",
  },
];

const meta = {
  title: "Molecules/FeatureItem",
  component: FeatureItem,
  args: {
    icon: Store,
    title: "We are a restaurant, not a contractor",
    description:
      "Come and eat here before you book. What you taste at our table is exactly what reaches yours.",
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'An icon tile, a title and a line. The tile follows the surface: pink-100 with a pink-600 icon on light grounds, ink-800 with a pink-300 icon on ink. `size="md"` (44px tile) for Catering "Why us"; `size="sm"` (40px) for the office perks and Homely Meals "What you get".',
      },
    },
  },
} satisfies Meta<typeof FeatureItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Catering "Why us" — md, in a grid. */
export const WhyUs: Story = {
  render: () => (
    <div className="grid max-w-content grid-cols-1 gap-x-9 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
      {WHY_US.map((item) => (
        <FeatureItem key={item.title} {...item} />
      ))}
    </div>
  ),
};

/** Office & PG lunch perks — sm. */
export const OfficePerks: Story = {
  render: () => (
    <div className="grid max-w-content grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
      {[
        {
          icon: Receipt,
          title: "One GST invoice a month",
          description: "No daily bills. Input credit ready.",
        },
        {
          icon: CreditCard,
          title: "Pluxee (Sodexo) accepted",
          description: "Employees can pay with their Pluxee meal card, UPI or card.",
        },
        {
          icon: Truck,
          title: "Free delivery anywhere in Gurgaon",
          description: "Fixed slot: lunch 12:00–1:30pm, dinner 7:30–9:00pm.",
        },
        {
          icon: Users,
          title: "Change headcount daily",
          description: "Update numbers by 9pm the night before.",
        },
        {
          icon: Presentation,
          title: "We come and present",
          description: "Free tasting for your group before you sign anything.",
        },
      ].map((item) => (
        <FeatureItem key={item.title} size="sm" {...item} />
      ))}
    </div>
  ),
};

/** Homely Meals "What ₹130 a meal gets you" — sm, on the ink section. */
export const WhatYouGet: Story = {
  render: () => (
    <div data-surface="ink" className="rounded-xl bg-surface-inverse p-8">
      <div className="grid max-w-content grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            icon: Soup,
            title: "A full meal from a restaurant kitchen",
            description: "Dal, sabji, rice, 3 tawa roti, salad and chutney, cooked the same day.",
          },
          {
            icon: RefreshCw,
            title: "30 dishes on rotation",
            description: "The same sabji never comes back within 8 meals.",
          },
          {
            icon: PartyPopper,
            title: "Biryani every week, no extra charge",
            description:
              "Veg Dum Biryani, Mirchi ka Salan, Raita and a Gulab Jamun: Friday lunch, Tuesday dinner.",
          },
          {
            icon: Gift,
            title: "Limited offer: 1 meal free a month",
            description:
              "Weekday plan: 25 meals for the price of 24. Full month: 31 for 30. Till 31 Oct.",
          },
          {
            icon: Lock,
            title: "Your price is locked",
            description: "Join at ₹130 and it stays ₹130 while you stay subscribed.",
          },
          {
            icon: CirclePause,
            title: "Free skips and pauses",
            description: "Skipped meals aren’t charged; your plan simply runs longer.",
          },
          {
            icon: Truck,
            title: "Free delivery within 3 km",
            description: "No packaging fee, no delivery fee, no platform fee.",
          },
        ].map((item) => (
          <FeatureItem key={item.title} size="sm" {...item} />
        ))}
      </div>
    </div>
  ),
};

export const OnSurfaces: Story = {
  render: (args) => (
    <OnSurfaces>
      <FeatureItem {...args} className="min-w-0 flex-1" />
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { FeatureItem, type FeatureItemProps } from "./molecules/feature-item/feature-item";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/design-tokens/tokens/component/feature-item.json packages/design-tokens/tokens/surface/ink.json packages/design-tokens/tokens/surface/light.json packages/ui/src/molecules/feature-item packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/design-tokens/tokens/component/feature-item.json packages/design-tokens/tokens/surface/ink.json packages/design-tokens/tokens/surface/light.json packages/ui/src/molecules/feature-item packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): FeatureItem molecule

Icon tile + title + line for Catering's why-us, the office perks and
Homely Meals' what-you-get. The tile skin is a component token the ink
surface remaps (ink-800 / pink-300) and the light island restores.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 16: PricingCard

**Files:**

- Create: `packages/design-tokens/tokens/component/pricing-card.json`
- Create: `packages/ui/src/molecules/pricing-card/pricing-card.tsx`, `pricing-card.test.tsx`, `pricing-card.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`, `SPACING`), `packages/ui/src/index.ts`

**Dev reference:** none (handoff component)

**Interfaces:**

- Consumes: `formatRupees` (`@pink-paprikaa-web/utils`), `Icon` (`Check`), `headingTag`; semantic surface tokens (the card sets `data-surface`: `default`/`featured` → `light`, `flooded` → `brand`).
- Produces: `PricingCard`, `type PricingCardProps` (contract §6 + deviation 3). Defaults: `variant = "default"`, `headingLevel = 3`. Documented accessible default: the visually hidden "Was" before the struck price.

The handoff draws this card four ways (Home 20px padding / 40px price; Homely Meals fluid padding / 48px price; Catering 14px padding / 34px price; Office 24px / 44px). The system normalises to one card: `rounded-xl`, fluid padding 20→28px, fluid price 36→48px, the name on `text-h4` black. The per-page differences are listed in the Task 21 parity notes.

- [ ] **Step 1: Component tokens**

Create `packages/design-tokens/tokens/component/pricing-card.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "pricing-card-pad": {
      "$value": "clamp(20px, 3vw, 28px)",
      "$description": "Card padding (handoff Homely Meals plates)."
    }
  },
  "text": {
    "$type": "typography",
    "pricing-card-price": {
      "$value": {
        "fontSize": "clamp(36px, 4.4vw, 48px)",
        "lineHeight": 1,
        "letterSpacing": "-0.03em",
        "fontWeight": "{font-weight.black}"
      },
      "$description": "The per-unit price; the handoff's 34–48px range, fluid."
    }
  }
}
```

Append `"pricing-card-price",` to `TEXT` and `"pricing-card-pad",` to `SPACING`. Run `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache`.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/pricing-card/pricing-card.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { PricingCard } from "./pricing-card";

const CLASSIC = {
  name: "Classic",
  price: 130,
  was: 140,
  unit: "a meal",
  blurb: "The full Pink Paprikaa menu. Our recommendation.",
  points: [
    "30 dishes: Rajma, Chole, Dal Makhani, Kofta, Gatte",
    "Raita three times a week",
    "Weekly biryani + Gulab Jamun",
  ],
} as const;

describe("PricingCard", () => {
  it("names the plate as a heading and prints the price per unit the brand way", () => {
    render(<PricingCard {...CLASSIC} points={[...CLASSIC.points]} />);
    expect(screen.getByRole("heading", { level: 3, name: "Classic" })).toBeInTheDocument();
    expect(screen.getByRole("article")).toHaveTextContent("₹130");
    expect(screen.getByRole("article")).toHaveTextContent("a meal");
  });

  it("strikes the regular price and announces it as the old one", () => {
    const { container } = render(<PricingCard {...CLASSIC} points={[...CLASSIC.points]} />);
    expect(container.querySelector("s")).toHaveTextContent("Was ₹140");
  });

  it("lists what the plate includes, each with a tick", () => {
    render(<PricingCard {...CLASSIC} points={[...CLASSIC.points]} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    for (const item of items) expect(item.querySelector("svg")).not.toBeNull();
  });

  it.each([
    ["default", "light"],
    ["featured", "light"],
    ["flooded", "brand"],
  ] as const)("sets the %s card's surface to %s", (variant, surface) => {
    render(<PricingCard {...CLASSIC} points={[...CLASSIC.points]} variant={variant} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-surface", surface);
  });

  it("centres the badge on the top edge and sets the tag beside the name", () => {
    render(
      <PricingCard
        {...CLASSIC}
        points={[...CLASSIC.points]}
        badge={<span>Our recommendation</span>}
        tag={<span>Launch price</span>}
      />
    );
    expect(screen.getByText("Our recommendation").parentElement).toHaveClass(
      "absolute",
      "-top-3",
      "left-1/2"
    );
    expect(screen.getByRole("heading", { name: "Classic" }).parentElement).toContainElement(
      screen.getByText("Launch price")
    );
  });

  it("puts the footnote and the action together at the foot of the card", () => {
    render(
      <PricingCard
        {...CLASSIC}
        points={[...CLASSIC.points]}
        footnote="Weekday plan: ₹3,120 · 24 meals"
        action={<a href="#builder">Build with Classic</a>}
      />
    );
    const footer = screen.getByText("Weekday plan: ₹3,120 · 24 meals").parentElement;
    expect(footer).toHaveClass("mt-auto");
    expect(footer).toContainElement(screen.getByRole("link", { name: "Build with Classic" }));
  });

  it("shows the media slot above the name", () => {
    render(
      <PricingCard {...CLASSIC} points={[...CLASSIC.points]} media={<div data-testid="photo" />} />
    );
    expect(screen.getByRole("article").firstElementChild).toContainElement(
      screen.getByTestId("photo")
    );
  });

  it("lets a very long plate name wrap instead of widening the card", () => {
    render(
      <PricingCard
        {...CLASSIC}
        points={[...CLASSIC.points]}
        name="Classic-with-Dal-Makhani-Jeera-Rice-and-Gulab-Jamun-every-single-day"
        tag={<span>Launch price</span>}
      />
    );
    const name = screen.getByRole("heading");
    expect(name).toHaveClass("min-w-0", "wrap-anywhere");
    expect(name.parentElement).toHaveClass("flex-wrap");
  });

  it("has no accessibility violations flooded with every part", async () => {
    const { container } = render(
      <PricingCard
        {...CLASSIC}
        points={[...CLASSIC.points]}
        variant="flooded"
        badge={<span>Our recommendation</span>}
        footnote="Weekday plan: ₹3,120 · 24 meals"
        action={<a href="#builder">Build with Classic</a>}
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- pricing-card 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./pricing-card`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/pricing-card/pricing-card.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { Check } from "lucide-react";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";

type PricingCardVariant = "default" | "featured" | "flooded";

/** White cards are light islands; the flooded card is a brand field. */
const SURFACE_OF: Readonly<Record<PricingCardVariant, "light" | "brand">> = {
  default: "light",
  featured: "light",
  flooded: "brand",
};

const pricingCard = componentVariants({
  slots: {
    root: "p-pricing-card-pad relative flex h-full flex-col gap-3.5 rounded-xl",
    badge: "absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap",
    header: "flex flex-wrap items-center justify-between gap-2",
    // A long name wraps (anywhere, if it must) rather than widening the card.
    name: "min-w-0 font-display text-h4 font-black wrap-anywhere text-text-heading",
    priceRow: "m-0 flex max-w-none flex-wrap items-baseline gap-x-2 gap-y-1",
    price: "text-pricing-card-price font-display text-text-heading",
    unit: "text-body-sm text-text-muted",
    was: "text-body text-text-muted",
    blurb: "m-0 max-w-none text-body-sm text-text-body",
    points: "m-0 flex flex-1 flex-col",
    point:
      "flex items-start gap-2.5 border-t border-border-subtle py-2 text-body-sm text-text-body",
    pointIcon: "mt-0.5 text-text-brand",
    footer: "mt-auto flex flex-col gap-3.5",
    footnote: "m-0 max-w-none text-caption text-text-muted",
  },
  variants: {
    variant: {
      default: { root: "border border-border-subtle bg-surface-card shadow-1" },
      featured: { root: "border-2 border-border-brand bg-surface-card shadow-3" },
      flooded: { root: "bg-surface-brand shadow-4" },
    },
  },
});

export interface PricingCardProps extends Omit<ComponentProps<"article">, "title"> {
  name: ReactNode;
  /** A chip beside the name, e.g. "Launch price". */
  tag?: ReactNode | undefined;
  /** A marker centred on the card's top edge, e.g. "Our recommendation". */
  badge?: ReactNode | undefined;
  price: number;
  /** "a meal", "a head", "/head". */
  unit: string;
  was?: number | undefined;
  blurb?: ReactNode | undefined;
  /** What the plate includes; each gets a tick. */
  points?: ReactNode[] | undefined;
  footnote?: ReactNode | undefined;
  action?: ReactNode | undefined;
  /** An ImageSlot above the name (Catering dawats). */
  media?: ReactNode | undefined;
  variant?: PricingCardVariant | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/** A plate, dawat or office plan with its price per unit — Home, Homely Meals, Catering, Office. */
export function PricingCard({
  name,
  tag,
  badge,
  price,
  unit,
  was,
  blurb,
  points,
  footnote,
  action,
  media,
  variant = "default",
  headingLevel = 3,
  className,
  ...props
}: PricingCardProps) {
  const styles = pricingCard({ variant });
  const Heading = headingTag(headingLevel);

  return (
    <article data-surface={SURFACE_OF[variant]} className={styles.root({ className })} {...props}>
      {badge ? <div className={styles.badge()}>{badge}</div> : null}
      {media}
      <div className={styles.header()}>
        <Heading className={styles.name()}>{name}</Heading>
        {tag}
      </div>
      <p className={styles.priceRow()}>
        <span className={styles.price()}>{formatRupees(price)}</span>
        <span className={styles.unit()}>{unit}</span>
        {was === undefined ? null : (
          <s className={styles.was()}>
            <span className="sr-only">Was </span>
            {formatRupees(was)}
          </s>
        )}
      </p>
      {blurb ? <p className={styles.blurb()}>{blurb}</p> : null}
      {points && points.length > 0 ? (
        <ul className={styles.points()}>
          {points.map((point, index) => (
            <li key={index} className={styles.point()}>
              <Icon icon={Check} size="sm" className={styles.pointIcon()} />
              {point}
            </li>
          ))}
        </ul>
      ) : null}
      {footnote || action ? (
        <div className={styles.footer()}>
          {footnote ? <p className={styles.footnote()}>{footnote}</p> : null}
          {action}
        </div>
      ) : null}
    </article>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- pricing-card 2>&1 | tail -8`
Expected: PASS (11 tests).

- [ ] **Step 6: Stories — Home plates, Homely Meals plates (flooded), Catering dawats (media), Office plates, the long-name check**

`packages/ui/src/molecules/pricing-card/pricing-card.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowRight, Star } from "lucide-react";
import { expect } from "storybook/test";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { Badge } from "../../atoms/badge/badge";
import { Button } from "../../atoms/button/button";
import { ImageSlot } from "../../atoms/image-slot/image-slot";
import { PricingCard } from "./pricing-card";

/** `rates.js` → homely.plates (Classic at its launch price). */
const PLATE_POINTS = {
  everyday: [
    "4 home dals, 7 seasonal sabjis",
    "2 fresh tawa roti + steamed rice",
    "Home-style paneer once a week",
    "Biryani once a week, with raita",
  ],
  classic: [
    "30 dishes: Rajma, Chole, Dal Makhani, Kofta, Gatte",
    "3 fresh tawa roti + rice, jeera rice Tue & Wed",
    "Raita three times a week",
    "Weekly biryani + Gulab Jamun",
    "Restaurant-style paneer once a week",
  ],
  signature: [
    "Everything in Classic",
    "Restaurant-style paneer gravy every day",
    "Dessert and papad daily",
    "Soup twice a week",
    "Raita every day",
  ],
} as const;

const build = (plate: string, variant: "secondary" | "inverse" = "secondary") => (
  <Button variant={variant} size="md" isFullWidth iconAfter={ArrowRight}>
    Build with {plate}
  </Button>
);

const meta = {
  title: "Molecules/PricingCard",
  component: PricingCard,
  args: {
    name: "Classic",
    price: 130,
    was: 140,
    unit: "a meal",
    blurb: "The full Pink Paprikaa menu. Our recommendation.",
    points: [...PLATE_POINTS.classic],
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-text-measure-prose">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'A plate, dawat or office plan with its price per unit. `variant="featured"` adds the 2px brand border (Home\'s recommended plate); `variant="flooded"` floods pink and sets the brand surface (Homely Meals, Catering). `tag` sits beside the name; `badge` is centred on the top edge; `media` goes above the name; `points` get a tick each; the footnote and action pin to the bottom so cards in a row line up. Prices are numbers, formatted by the card.',
      },
    },
  },
} satisfies Meta<typeof PricingCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Home "Three plates. Pick yours." */
export const HomePlates: Story = {
  decorators: [],
  render: () => (
    <div className="grid max-w-content grid-cols-1 gap-4 md:grid-cols-3">
      <PricingCard
        name="Everyday"
        price={120}
        unit="a meal"
        blurb={PLATE_POINTS.everyday.join(" · ")}
      />
      <PricingCard
        variant="featured"
        name="Classic"
        tag={<Badge tone="brand">Launch price</Badge>}
        price={130}
        unit="a meal"
        blurb={PLATE_POINTS.classic.join(" · ")}
      />
      <PricingCard
        name="Signature"
        price={200}
        unit="a meal"
        blurb={PLATE_POINTS.signature.join(" · ")}
      />
    </div>
  ),
};

/** Homely Meals "You pay per meal." — the flooded recommendation. */
export const HomelyPlates: Story = {
  decorators: [],
  render: () => (
    <div className="grid max-w-content grid-cols-1 gap-4 pt-4 md:grid-cols-3">
      <PricingCard
        name="Everyday"
        price={120}
        unit="a meal"
        blurb="Home-style basics, kept simple."
        points={[...PLATE_POINTS.everyday]}
        footnote={`Weekday plan: ${formatRupees(120 * 24)} · 24 meals`}
        action={build("Everyday")}
      />
      <PricingCard
        variant="flooded"
        badge={
          <Badge tone="ink" icon={Star}>
            Our recommendation
          </Badge>
        }
        name="Classic"
        price={130}
        was={140}
        unit="a meal"
        blurb="The full Pink Paprikaa menu. Our recommendation."
        points={[...PLATE_POINTS.classic]}
        footnote={`Weekday plan: ${formatRupees(130 * 24)} · 24 meals`}
        action={build("Classic", "inverse")}
      />
      <PricingCard
        name="Signature"
        price={200}
        unit="a meal"
        blurb="A different plate, every single day."
        points={[...PLATE_POINTS.signature]}
        footnote={`Weekday plan: ${formatRupees(200 * 24)} · 24 meals`}
        action={build("Signature")}
      />
    </div>
  ),
};

/** Catering "Dawat packages" — media, per head (`rates.js` → catering.dawats). */
export const CateringDawats: Story = {
  decorators: [],
  render: () => (
    <div className="grid max-w-content grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-4">
      {[
        {
          name: "Classic Dawat",
          price: 149,
          blurb: "Honest, homely food, and plenty of it.",
          points: [
            "Mix Veg — seasonal, light homely masala",
            "Dal Fry — jeera and hing tadka",
            "4 Butter Tandoori Roti",
            "Steamed Rice",
            "Boondi Raita",
            "Sirka Pyaaz",
            "Mint Chutney",
            "Roasted Papad (2 pc)",
          ],
          bestFor: "Office lunches, pooja prasad, small family gatherings, staff meals",
        },
        {
          name: "Signature Dawat",
          price: 199,
          tag: <Badge tone="soft">Most ordered</Badge>,
          isFlooded: true,
          blurb: "The one we would put in front of our own family.",
          points: [
            "Paneer gravy — Do Pyaza, Matar or Kadhai",
            "Mix Veg",
            "Dal Fry",
            "4 Butter Tandoori Roti",
            "Steamed Rice",
            "Boondi Raita",
            "Kachumber Salad",
            "Mint Chutney",
            "Roasted Papad (2 pc)",
            "Gulab Jamun (1 pc)",
          ],
          bestFor: "Birthdays, family functions, client lunches, house parties",
        },
        {
          name: "Maharaja Dawat",
          price: 269,
          blurb: "For the days that deserve a proper table.",
          points: [
            "Premium paneer — Butter Masala, Lababdar or Tawa",
            "Mix Veg",
            "Dal Makhani — slow-cooked overnight",
            "3 Butter Tandoori Roti + 1 Lachha Paratha",
            "Jeera Rice",
            "Mix Veg Raita",
            "Kachumber Salad",
            "Mint Chutney",
            "Roasted Papad (2 pc)",
            "Gulab Jamun (2 pc)",
          ],
          bestFor: "Anniversaries, engagements, festivals",
        },
        {
          name: "Royal Dawat",
          price: 549,
          tag: <Badge tone="ink">50+ guests</Badge>,
          blurb: "The full evening, course by course. 50 guests and above.",
          points: [
            "Soup — Manchow, Tomato or Sweet Corn",
            "4 starters — Chilli Potato, Veg Manchurian, Hakka Noodles, Tandoori Veg Seekh",
            "Premium paneer gravy + Soya Chaap",
            "Mix Veg · Dal Makhani",
            "3 Butter Tandoori Roti + 1 Lachha Paratha",
            "Veg Dum Biryani with Mirchi ka Salan",
            "Boondi Raita · Kachumber · Chutney · Papad",
            "Gulab Jamun (2 pc) + Rice Kheer",
            "Shikanji",
          ],
          bestFor: "Large corporate events, big family functions, milestones",
        },
      ].map(({ name, price, tag, isFlooded, blurb, points, bestFor }) => (
        <PricingCard
          key={name}
          variant={isFlooded === true ? "flooded" : "default"}
          media={<ImageSlot ratio="16:10" radius="md" label={`PHOTO: ${name} plated`} />}
          name={name}
          tag={tag}
          price={price}
          unit="a head"
          blurb={blurb}
          points={points}
          footnote={
            <>
              <strong>Best for</strong> — {bestFor}
            </>
          }
          action={
            <Button
              variant={isFlooded === true ? "inverse" : "secondary"}
              size="md"
              isFullWidth
              iconAfter={ArrowRight}
            >
              Build this Dawat
            </Button>
          }
        />
      ))}
    </div>
  ),
};

/** Office & PG lunch "Two plates" (`rates.js` → office.plates). */
export const OfficePlates: Story = {
  decorators: [],
  render: () => (
    <div className="grid max-w-content grid-cols-1 gap-4 md:grid-cols-2">
      <PricingCard
        name="Everyday"
        price={99}
        unit="a meal"
        blurb="4 home dals, 7 seasonal sabjis, 2 roti, rice, salad. Home-style paneer and biryani once a week."
      />
      <PricingCard
        name="Classic"
        price={119}
        unit="a meal"
        blurb="The full 30-dish menu, 3 roti, jeera rice twice a week, weekly biryani."
      />
    </div>
  ),
};

/** A very long plate name at 360px: it wraps inside the card; nothing overflows. */
export const LongName: Story = {
  args: {
    name: "Classic-with-Dal-Makhani-Jeera-Rice-and-Gulab-Jamun-every-single-day",
    tag: <Badge tone="brand">Launch price</Badge>,
    variant: "featured",
  },
  decorators: [
    (Story) => (
      <div className="w-90">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas }) => {
    const card = canvas.getByRole("article");
    const name = canvas.getByRole("heading");
    await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
    await expect(name.getBoundingClientRect().right).toBeLessThanOrEqual(
      card.getBoundingClientRect().right
    );
  },
};
```

- [ ] **Step 7: Export**

```ts
export { PricingCard, type PricingCardProps } from "./molecules/pricing-card/pricing-card";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/design-tokens/tokens/component/pricing-card.json packages/ui/src/molecules/pricing-card packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts`; then the long-name check in Chromium:

```bash
pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache -- pricing-card 2>&1 | tail -10
```

Expected: every PricingCard story passes, including `LongName`'s play.

- [ ] **Step 9: Commit**

```bash
git add packages/design-tokens/tokens/component/pricing-card.json packages/ui/src/molecules/pricing-card packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): PricingCard molecule

One pricing card for the handoff's plates, dawats and office plans:
default, featured (2px brand border) and flooded (brand surface), with
tag, top-edge badge, media, ticked points and a footer that pins to the
bottom. Long names wrap inside the card; a story play measures it at
360px in Chromium.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 17: LinkCard

**Files:**

- Create: `packages/design-tokens/tokens/component/link-card.json`
- Create: `packages/ui/src/molecules/link-card/link-card.tsx`, `link-card.test.tsx`, `link-card.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`), `packages/ui/src/index.ts`

**Dev reference:** none (handoff component)

**Interfaces:**

- Consumes: `Slot` from `radix-ui`, used the way Plan 2a does (verified in `@radix-ui/react-slot`): `const Component: ElementType = asChild ? Slot.Root : "a"`, and `<Slot.Slottable child={children}>{() => content}</Slot.Slottable>` replaces the child's children with the card's media and text, so they land **inside** the consumer's link element. Classes go on the component, never on the slotted child (Slot joins child classes without tailwind-merge). `Icon` (`ArrowRight`, `xs`), `headingTag`; the `lift` utility (Plan 1).
- Produces: `LinkCard`, `type LinkCardProps` (contract §6). Defaults: `layout = "row"`, `tone = "default"`, `headingLevel = 3`. Sets `data-surface` from `tone` (`default` → `light`). With `asChild`, `children` is the link element (e.g. `<NextLink href="/homely-meals" />`); without it, `children` is not rendered — content comes from props.

- [ ] **Step 1: Component tokens**

Create `packages/design-tokens/tokens/component/link-card.json`:

```json
{
  "text": {
    "$type": "typography",
    "link-card-title": {
      "$value": {
        "fontSize": "18px",
        "lineHeight": 1.3,
        "letterSpacing": "-0.005em",
        "fontWeight": "{font-weight.bold}"
      },
      "$description": "Row layout title (Home \"doors\")."
    },
    "link-card-title-lg": {
      "$value": {
        "fontSize": "22px",
        "lineHeight": 1.2,
        "letterSpacing": "-0.01em",
        "fontWeight": "{font-weight.black}"
      },
      "$description": "Stack layout title (About CTA cards)."
    }
  }
}
```

Append `"link-card-title", "link-card-title-lg",` to `TEXT`. Run `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache`.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/link-card/link-card.test.tsx`:

```tsx
import type { ComponentProps } from "react";

import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { LinkCard } from "./link-card";

/** Stands in for next/link: the card must render into it, not around it. */
function RouterLink(props: ComponentProps<"a">) {
  return <a data-router="" {...props} />;
}

const DOOR = {
  href: "/homely-meals",
  title: "Homely Meals",
  description: "Daily veg meals from ₹120",
  cta: "See plans",
} as const;

describe("LinkCard", () => {
  it("is one link carrying its title, description and call to action", () => {
    render(<LinkCard {...DOOR} />);
    const link = screen.getByRole("link", { name: /Homely Meals/ });
    expect(link).toHaveAttribute("href", "/homely-meals");
    expect(link).toHaveTextContent("Daily veg meals from ₹120");
    expect(link).toHaveTextContent("See plans");
  });

  it("titles the card as a level-3 heading inside the link", () => {
    render(<LinkCard {...DOOR} />);
    expect(screen.getByRole("link")).toContainElement(
      screen.getByRole("heading", { level: 3, name: "Homely Meals" })
    );
  });

  it.each([
    ["default", "light"],
    ["brand", "brand"],
    ["ink", "ink"],
    ["soft", "soft"],
  ] as const)("sets the %s tone's surface to %s", (tone, surface) => {
    render(<LinkCard {...DOOR} tone={tone} />);
    expect(screen.getByRole("link")).toHaveAttribute("data-surface", surface);
  });

  it("puts 88px media beside the text in a row, and full-width media above it in a stack", () => {
    const { rerender } = render(<LinkCard {...DOOR} media={<div data-testid="photo" />} />);
    expect(screen.getByTestId("photo").parentElement).toHaveClass("size-22");
    rerender(<LinkCard {...DOOR} layout="stack" media={<div data-testid="photo" />} />);
    expect(screen.getByTestId("photo").parentElement).toHaveClass("w-full");
  });

  it("renders into the app's router link with asChild", () => {
    render(
      <LinkCard asChild title="Homely Meals">
        <RouterLink href="/homely-meals" />
      </LinkCard>
    );
    const link = screen.getByRole("link", { name: "Homely Meals" });
    expect(link).toHaveAttribute("data-router");
    expect(link).toHaveAttribute("data-surface", "light");
  });

  it("draws the arrow only when there is a call to action", () => {
    const { container, rerender } = render(<LinkCard href="/menu" title="Restaurant Menu" />);
    expect(container.querySelector("svg")).toBeNull();
    rerender(<LinkCard href="/menu" title="Restaurant Menu" cta="Open menu" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<LinkCard {...DOOR} media={<span>Box</span>} />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- link-card 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./link-card`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/link-card/link-card.tsx`:

```tsx
import type { ComponentProps, ElementType, ReactNode } from "react";

import { ArrowRight } from "lucide-react";
import { Slot } from "radix-ui";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";

type LinkCardTone = "default" | "brand" | "ink" | "soft";

const SURFACE_OF: Readonly<Record<LinkCardTone, "light" | "brand" | "ink" | "soft">> = {
  default: "light",
  brand: "brand",
  ink: "ink",
  soft: "soft",
};

const linkCard = componentVariants({
  slots: {
    root: "flex text-inherit no-underline transition duration-fast motion-safe:hover:lift",
    media: "shrink-0",
    body: "flex min-w-0 flex-col",
    title: "font-display text-text-heading",
    description: "m-0 max-w-none",
    cta: "inline-flex items-center gap-1 font-display text-body-sm font-bold text-text-brand",
  },
  variants: {
    layout: {
      row: {
        root: "items-center gap-3.5 rounded-lg p-3",
        media: "size-22",
        body: "gap-1",
        title: "text-link-card-title",
        description: "text-body-sm text-text-muted",
      },
      stack: {
        root: "flex-col gap-3 rounded-xl p-7",
        media: "w-full",
        body: "gap-1.5",
        title: "text-link-card-title-lg",
        description: "text-body text-text-body",
      },
    },
    tone: {
      default: { root: "border border-border-subtle bg-surface-card shadow-1 hover:shadow-3" },
      brand: { root: "bg-surface-brand" },
      ink: { root: "bg-surface-inverse" },
      soft: { root: "bg-surface-brand-soft" },
    },
  },
});

export interface LinkCardProps extends Omit<ComponentProps<"a">, "title"> {
  title: ReactNode;
  description?: ReactNode | undefined;
  /** Link words under the text, followed by an arrow ("See plans"). */
  cta?: string | undefined;
  /** An ImageSlot: 88px square in a row, full width in a stack. */
  media?: ReactNode | undefined;
  layout?: "row" | "stack" | undefined;
  tone?: LinkCardTone | undefined;
  /** Render into the child link element (next/link, an external anchor) instead of an `<a>`. */
  asChild?: boolean | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/** A whole-card link: Home's three "doors" (row) and About's CTA cards (stack, tones). */
export function LinkCard({
  title,
  description,
  cta,
  media,
  layout = "row",
  tone = "default",
  asChild = false,
  headingLevel = 3,
  className,
  children,
  ...props
}: LinkCardProps) {
  const styles = linkCard({ layout, tone });
  const Heading = headingTag(headingLevel);
  const Component: ElementType = asChild ? Slot.Root : "a";
  const content = (
    <>
      {media ? <div className={styles.media()}>{media}</div> : null}
      <div className={styles.body()}>
        <Heading className={styles.title()}>{title}</Heading>
        {description ? <p className={styles.description()}>{description}</p> : null}
        {cta ? (
          <span className={styles.cta()}>
            {cta}
            <Icon icon={ArrowRight} size="xs" />
          </span>
        ) : null}
      </div>
    </>
  );

  return (
    <Component data-surface={SURFACE_OF[tone]} className={styles.root({ className })} {...props}>
      {asChild ? <Slot.Slottable child={children}>{() => content}</Slot.Slottable> : content}
    </Component>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- link-card 2>&1 | tail -8`
Expected: PASS (10 tests).

- [ ] **Step 6: Stories — Home "doors" (row), About CTA cards (stack in three tones), asChild**

`packages/ui/src/molecules/link-card/link-card.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { ImageSlot } from "../../atoms/image-slot/image-slot";
import { LinkCard } from "./link-card";

/** Stands in for the app's router link in the asChild story. */
function RouterLink(props: ComponentProps<"a">) {
  return <a data-router="" {...props} />;
}

const meta = {
  title: "Molecules/LinkCard",
  component: LinkCard,
  args: {
    href: "#homely-meals",
    title: "Homely Meals",
    description: `Daily veg meals from ${formatRupees(120)}`,
    cta: "See plans",
    media: <ImageSlot ratio="square" radius="md" label="Box" />,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-text-measure-prose">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'A whole-card link. `layout="row"` puts 88px media beside the text (Home\'s "One kitchen, three ways to eat" doors); `layout="stack"` is the About page\'s CTA card in `brand`, `ink` or `soft`. It lifts on hover (reduced motion: no lift). Use `asChild` to render into `next/link` or an external anchor; the card\'s content lands inside it.',
      },
    },
  },
} satisfies Meta<typeof LinkCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Home "One kitchen, three ways to eat". */
export const HomeDoors: Story = {
  decorators: [],
  render: () => (
    <div className="grid max-w-content grid-cols-1 gap-4 md:grid-cols-3">
      <LinkCard
        href="#homely-meals"
        title="Homely Meals"
        description={`Daily veg meals from ${formatRupees(120)}`}
        cta="See plans"
        media={<ImageSlot ratio="square" radius="md" label="Box" />}
      />
      <LinkCard
        href="#catering"
        title="Catering & Bulk Orders"
        description={`Dawats from ${formatRupees(149)} a head · snacks from ${formatRupees(99)}`}
        cta="See Dawats"
        media={<ImageSlot ratio="square" radius="md" label="Buffet" />}
      />
      <LinkCard
        href="#menu"
        title="Restaurant Menu"
        description="Dine in or order online"
        cta="Open menu"
        media={<ImageSlot ratio="square" radius="md" label="Dish" />}
      />
    </div>
  ),
};

/** About page CTA cards — stack, brand / ink / soft. */
export const AboutCtas: Story = {
  decorators: [],
  render: () => (
    <div className="grid max-w-content grid-cols-1 gap-4 md:grid-cols-3">
      <LinkCard
        layout="stack"
        tone="brand"
        href="#homely-meals"
        title="Homely Meals"
        description="Eat from our kitchen every day"
      />
      <LinkCard
        layout="stack"
        tone="ink"
        href="#catering"
        title="Dawat catering"
        description="For your next occasion"
      />
      <LinkCard
        layout="stack"
        tone="soft"
        href="#contact"
        title="Visit us"
        description="MKM Market, Sector 57"
      />
    </div>
  ),
};

/** `asChild`: the card renders into the consumer's link element. */
export const AsChild: Story = {
  args: { asChild: true, href: undefined, children: <RouterLink href="#homely-meals" /> },
};
```

- [ ] **Step 7: Export**

```ts
export { LinkCard, type LinkCardProps } from "./molecules/link-card/link-card";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/design-tokens/tokens/component/link-card.json packages/ui/src/molecules/link-card packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/design-tokens/tokens/component/link-card.json packages/ui/src/molecules/link-card packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): LinkCard molecule

Whole-card link for Home's doors (row, 88px media) and About's CTA cards
(stack in brand/ink/soft, each setting its surface). asChild renders the
card into next/link or an external anchor via Radix Slottable, so the
content lands inside the consumer's link.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 18: StickyActionBar

**Files:**

- Create: `packages/design-tokens/tokens/component/sticky-action-bar.json`
- Create: `packages/ui/src/molecules/sticky-action-bar/sticky-action-bar.tsx`, `sticky-action-bar.test.tsx`, `sticky-action-bar.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`), `packages/ui/src/index.ts`

**Dev reference:** none (handoff component)

**Interfaces:**

- Consumes: `--spacing-dock-clearance` (Plan 1: 84px, the handoff's `bottom: 84px`), the `z-raised` utility (the handoff's `z-index: 5`), the ink surface.
- Produces: `StickyActionBar`, `type StickyActionBarProps` (contract §6). Default `hideFrom = "lg"` (the calculators go two-column above it). Sets `data-surface="ink"`.

- [ ] **Step 1: Component tokens**

Create `packages/design-tokens/tokens/component/sticky-action-bar.json`:

```json
{
  "text": {
    "$type": "typography",
    "sticky-action-bar-amount": {
      "$value": { "fontSize": "18px", "lineHeight": 1.2, "fontWeight": "{font-weight.black}" },
      "$description": "The running total in the calculators' sticky pill."
    }
  }
}
```

Append `"sticky-action-bar-amount",` to `TEXT`. Run `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache`.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/sticky-action-bar/sticky-action-bar.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { StickyActionBar } from "./sticky-action-bar";

const BAR = {
  amount: "₹3,276",
  caption: "₹130/meal · Classic · Weekday plan · Lunch",
  action: <a href="#send">Send plan</a>,
} as const;

describe("StickyActionBar", () => {
  it("shows the amount, the caption and the action", () => {
    render(<StickyActionBar {...BAR} />);
    expect(screen.getByText("₹3,276")).toBeInTheDocument();
    expect(screen.getByText(BAR.caption)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Send plan" })).toBeInTheDocument();
  });

  it("is an ink pill on every surface", () => {
    const { container } = render(<StickyActionBar {...BAR} />);
    expect(container.firstElementChild).toHaveAttribute("data-surface", "ink");
    expect(container.firstElementChild).toHaveClass("rounded-pill", "bg-surface-inverse");
  });

  it("sticks just above the mobile action dock", () => {
    const { container } = render(<StickyActionBar {...BAR} />);
    expect(container.firstElementChild).toHaveClass("sticky", "bottom-dock-clearance", "z-raised");
  });

  it("hides from the two-column breakpoint by default, or never", () => {
    const { container, rerender } = render(<StickyActionBar {...BAR} />);
    expect(container.firstElementChild).toHaveClass("lg:hidden");
    rerender(<StickyActionBar {...BAR} hideFrom="never" />);
    expect(container.firstElementChild).not.toHaveClass("lg:hidden");
  });

  it("truncates a long caption instead of wrapping the pill", () => {
    render(<StickyActionBar {...BAR} />);
    expect(screen.getByText(BAR.caption)).toHaveClass("truncate");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<StickyActionBar {...BAR} />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- sticky-action-bar 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./sticky-action-bar`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/sticky-action-bar/sticky-action-bar.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { componentVariants } from "../../lib/component-variants";

const stickyActionBar = componentVariants({
  slots: {
    root: "sticky bottom-dock-clearance z-raised mt-3 flex items-center justify-between gap-3 rounded-pill bg-surface-inverse py-2 pr-2 pl-5 text-text-body shadow-4",
    summary: "flex min-w-0 flex-col",
    amount: "text-sticky-action-bar-amount font-display text-text-heading",
    caption: "truncate text-caption text-text-muted",
    action: "shrink-0",
  },
  variants: {
    hideFrom: { lg: { root: "lg:hidden" }, never: {} },
  },
});

export interface StickyActionBarProps extends ComponentProps<"div"> {
  /** The running total, formatted. */
  amount: ReactNode;
  /** One line under it; truncates rather than wrapping. */
  caption?: ReactNode | undefined;
  /** The primary action (a Button). */
  action: ReactNode;
  /** `lg`: hidden once the calculator is two-column. `never`: always shown. */
  hideFrom?: "lg" | "never" | undefined;
}

/** The calculators' ink pill: total, a caption and the send action, stuck above the mobile dock. */
export function StickyActionBar({
  amount,
  caption,
  action,
  hideFrom = "lg",
  className,
  ...props
}: StickyActionBarProps) {
  const styles = stickyActionBar({ hideFrom });
  return (
    <div data-surface="ink" className={styles.root({ className })} {...props}>
      <div className={styles.summary()}>
        <span className={styles.amount()}>{amount}</span>
        {caption ? <span className={styles.caption()}>{caption}</span> : null}
      </div>
      <div className={styles.action()}>{action}</div>
    </div>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- sticky-action-bar 2>&1 | tail -8`
Expected: PASS (6 tests).

- [ ] **Step 6: Stories — the Plan and Dawat calculator bars, and the bar sticking in a scrolling page**

`packages/ui/src/molecules/sticky-action-bar/sticky-action-bar.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { Button } from "../../atoms/button/button";
import { StickyActionBar } from "./sticky-action-bar";

/** Classic, launch price, Weekday plan, lunch: 24 × ₹130 + 5% GST. */
const PLAN_TOTAL = 24 * 130 + Math.round(24 * 130 * 0.05);
/** Signature Dawat for 30 guests + 5% GST. */
const DAWAT_TOTAL = 30 * 199 + Math.round(30 * 199 * 0.05);

const meta = {
  title: "Molecules/StickyActionBar",
  component: StickyActionBar,
  args: {
    amount: formatRupees(PLAN_TOTAL),
    caption: `${formatRupees(130)}/meal · Classic · Weekday plan · Lunch`,
    action: <Button size="md">Send plan</Button>,
    hideFrom: "never",
  },
  decorators: [
    (Story) => (
      <div className="w-90">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'The calculators\' ink pill: the running total, one caption line and the send action. `position: sticky` at `--spacing-dock-clearance` above the viewport bottom, so the mobile ActionDock never covers it. Hidden from `lg` up (`hideFrom="lg"`, default), where the quote panel sits beside the form.',
      },
    },
  },
} satisfies Meta<typeof StickyActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** PlanCalculator bar. */
export const PlanCalculator: Story = {};

/** DawatCalculator bar. */
export const DawatCalculator: Story = {
  args: {
    amount: formatRupees(DAWAT_TOTAL),
    caption: `${formatRupees(DAWAT_TOTAL / 30)}/head · 30 guests`,
    action: <Button size="md">Check date</Button>,
  },
};

/** The bar sticks at the dock clearance while the form scrolls under it. */
export const InAScrollingPage: Story = {
  render: (args) => (
    <div className="h-100 overflow-y-auto rounded-lg border border-border-subtle">
      <div className="grid h-250 content-start gap-3 p-4">
        {[
          "1. Your plate",
          "2. Which meals",
          "3. How many meals",
          "4. People at one address",
          "5. Make it yours",
        ].map((step) => (
          <p key={step} className="m-0 font-display text-body font-bold text-text-heading">
            {step}
          </p>
        ))}
      </div>
      <StickyActionBar {...args} />
    </div>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export {
  StickyActionBar,
  type StickyActionBarProps,
} from "./molecules/sticky-action-bar/sticky-action-bar";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/design-tokens/tokens/component/sticky-action-bar.json packages/ui/src/molecules/sticky-action-bar packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/design-tokens/tokens/component/sticky-action-bar.json packages/ui/src/molecules/sticky-action-bar packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): StickyActionBar molecule

The calculators' ink pill (total, caption, action), sticky at the dock
clearance so the mobile ActionDock never covers it, hidden once the
calculator is two-column.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 19: AnnouncementBar

**Files:**

- Create: `packages/ui/src/molecules/announcement-bar/announcement-bar.tsx`, `announcement-expiry.tsx`, `announcement-bar.test.tsx`, `announcement-bar.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** none (handoff component)

**Interfaces:**

- Consumes: `Countdown` (`endsAt`, `label`; renders `<time>` in its mono pill), `type LinkAs`; React's `useSyncExternalStore` (server snapshot on the server and during hydration, the live snapshot afterwards — no hydration mismatch, no `setState` in an effect).
- Produces: `AnnouncementBar`, `type AnnouncementBarProps` (contract §6 + deviation 9). Server component; `announcement-expiry.tsx` is the client leaf (not exported from the barrel). Throws `RangeError` for an `endsAt` that is not a date. The handoff strip's gap: it never disappeared after the offer ended — this one renders **nothing** after `endsAt`, including when it passes while the page is open.

- [ ] **Step 1: Tokens** — none new (`bg-surface-brand` strip, `text-caption`, `px-4 py-2`).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/announcement-bar/announcement-bar.test.tsx`:

```tsx
import { act, render, screen } from "@testing-library/react";

import type { LinkAsProps } from "../../lib/link-as";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { AnnouncementBar } from "./announcement-bar";

const DAY_MS = 86_400_000;
const inDays = (days: number) => new Date(Date.now() + days * DAY_MS).toISOString();

function RouterLink(props: LinkAsProps) {
  return <a data-router="" {...props} />;
}

afterEach(() => {
  vi.useRealTimers();
});

describe("AnnouncementBar", () => {
  it("shows its message on the brand strip", () => {
    const { container } = render(
      <AnnouncementBar>Launch price: Classic at ₹130 a meal</AnnouncementBar>
    );
    expect(screen.getByText("Launch price: Classic at ₹130 a meal")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("data-surface", "brand");
  });

  it("makes the whole strip one link when given an href", () => {
    render(
      <AnnouncementBar href="/homely-meals">Launch price: Classic at ₹130 a meal</AnnouncementBar>
    );
    expect(screen.getByRole("link", { name: /Launch price/ })).toHaveAttribute(
      "href",
      "/homely-meals"
    );
  });

  it("renders the link through the app's router link", () => {
    render(
      <AnnouncementBar href="/homely-meals" linkAs={RouterLink}>
        Launch price
      </AnnouncementBar>
    );
    expect(screen.getByRole("link", { name: /Launch price/ })).toHaveAttribute("data-router");
  });

  it("counts down to endsAt", () => {
    const endsAt = inDays(3);
    const { container } = render(<AnnouncementBar endsAt={endsAt}>Launch price</AnnouncementBar>);
    expect(container.querySelector("time")).toHaveAttribute("datetime", endsAt);
  });

  it("stays up, with no countdown, when there is no endsAt", () => {
    const { container } = render(<AnnouncementBar>Launch price</AnnouncementBar>);
    expect(container.querySelector("time")).toBeNull();
    expect(screen.getByText("Launch price")).toBeInTheDocument();
  });

  it("renders nothing once endsAt has passed — no empty strip left above the header", () => {
    const { container } = render(
      <AnnouncementBar endsAt="2025-01-01T00:00:00+05:30" href="/homely-meals">
        Launch price
      </AnnouncementBar>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("disappears the moment it expires while the page is open", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-31T23:59:58+05:30"));
    const { container } = render(
      <AnnouncementBar endsAt="2026-10-31T23:59:59+05:30">Launch price</AnnouncementBar>
    );
    expect(screen.getByText("Launch price")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(container).toBeEmptyDOMElement();
  });

  it("rejects an endsAt it cannot read instead of never expiring", () => {
    // A server component is a plain function: call it to see the throw directly.
    expect(() => AnnouncementBar({ endsAt: "end of October", children: "Launch price" })).toThrow(
      RangeError
    );
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <AnnouncementBar
        href="/homely-meals"
        endsAt={inDays(3)}
        countdownLabel="Launch price closes in"
      >
        Launch price: Classic at ₹130 a meal · closes in
      </AnnouncementBar>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- announcement-bar 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./announcement-bar`.

- [ ] **Step 4: Implement the client expiry gate**

`packages/ui/src/molecules/announcement-bar/announcement-expiry.tsx`:

```tsx
"use client";

import { type ReactNode, useCallback, useSyncExternalStore } from "react";

/** setTimeout's ceiling (~24.8 days). A longer wait re-arms until the moment arrives. */
const MAX_TIMEOUT_MS = 2_147_483_647;

function hasPassed(endsAtMs: number): boolean {
  return Date.now() >= endsAtMs;
}

/** Calls `onPass` once `endsAtMs` has passed, however far away it is. */
function subscribeUntil(endsAtMs: number, onPass: () => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const wait = () => {
    const remaining = endsAtMs - Date.now();
    if (remaining <= 0) {
      onPass();
      return;
    }
    timer = setTimeout(wait, Math.min(remaining, MAX_TIMEOUT_MS));
  };
  wait();
  return () => {
    clearTimeout(timer);
  };
}

/** The server (and hydration) always renders the announcement; the client then decides. */
const getServerSnapshot = () => false;

export interface AnnouncementExpiryProps {
  /** Epoch milliseconds. */
  endsAt: number;
  children: ReactNode;
}

/**
 * Renders its children until `endsAt`, then nothing. Re-checked on the client, so a static page
 * served after the date still hides it (spec §16: time-bound content is never checked only at build).
 */
export function AnnouncementExpiry({ endsAt, children }: AnnouncementExpiryProps) {
  const subscribe = useCallback((onPass: () => void) => subscribeUntil(endsAt, onPass), [endsAt]);
  const getSnapshot = useCallback(() => hasPassed(endsAt), [endsAt]);
  const hasEnded = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return hasEnded ? null : children;
}
```

- [ ] **Step 5: Implement the bar**

`packages/ui/src/molecules/announcement-bar/announcement-bar.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import type { LinkAs } from "../../lib/link-as";

import { Countdown } from "../../atoms/countdown/countdown";
import { componentVariants } from "../../lib/component-variants";
import { AnnouncementExpiry } from "./announcement-expiry";

const announcementBar = componentVariants({
  slots: {
    root: "bg-surface-brand text-text-body",
    content: "flex flex-wrap items-center justify-center gap-2 px-4 py-2 text-center text-caption",
    link: "text-inherit no-underline hover:underline",
  },
});

export interface AnnouncementBarProps extends Omit<ComponentProps<"div">, "children"> {
  /** The message. Bold the offer with `<strong>`. */
  children: ReactNode;
  /** Makes the whole strip one link. */
  href?: string | undefined;
  /** ISO 8601 with an offset. Shows a countdown, and the bar renders nothing once it passes. */
  endsAt?: string | undefined;
  /** Accessible prefix for the countdown, e.g. "Launch price closes in". */
  countdownLabel?: string | undefined;
  linkAs?: LinkAs | undefined;
}

function toEpochMs(endsAt: string): number {
  const time = Date.parse(endsAt);
  if (Number.isNaN(time)) {
    throw new RangeError(
      `AnnouncementBar: endsAt "${endsAt}" is not a date — use ISO 8601 with an offset`
    );
  }
  return time;
}

/** The brand launch strip above the site header, optionally counting down to its end. */
export function AnnouncementBar({
  children,
  href,
  endsAt,
  countdownLabel,
  linkAs: LinkComponent = "a",
  className,
  ...props
}: AnnouncementBarProps) {
  const styles = announcementBar();
  const content = (
    <>
      <span>{children}</span>
      {endsAt === undefined ? null : <Countdown endsAt={endsAt} label={countdownLabel} />}
    </>
  );
  const bar = (
    <div data-surface="brand" className={styles.root({ className })} {...props}>
      {href === undefined ? (
        <div className={styles.content()}>{content}</div>
      ) : (
        <LinkComponent href={href} className={styles.content({ className: styles.link() })}>
          {content}
        </LinkComponent>
      )}
    </div>
  );

  if (endsAt === undefined) return bar;
  return <AnnouncementExpiry endsAt={toEpochMs(endsAt)}>{bar}</AnnouncementExpiry>;
}
```

- [ ] **Step 6: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- announcement-bar 2>&1 | tail -8`
Expected: PASS (9 tests).

- [ ] **Step 7: Stories — the handoff launch strip, no countdown, and the expired strip (with its no-gap check)**

Stories use an `endsAt` relative to now, so the launch story never expires in the catalogue.

`packages/ui/src/molecules/announcement-bar/announcement-bar.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { AnnouncementBar } from "./announcement-bar";

const IN_THREE_DAYS = new Date(Date.now() + 3 * 86_400_000).toISOString();

const LAUNCH_COPY = (
  <>
    Launch price: <strong>Classic at {formatRupees(130)} a meal</strong> for the first 50
    subscribers · closes in
  </>
);

const meta = {
  title: "Molecules/AnnouncementBar",
  component: AnnouncementBar,
  args: {
    children: LAUNCH_COPY,
    href: "#homely-meals",
    endsAt: IN_THREE_DAYS,
    countdownLabel: "Launch price closes in",
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The brand strip above the site header (the handoff's launch price bar). `href` makes the whole strip one link; `endsAt` adds the Countdown and — unlike the handoff — removes the bar entirely once the moment passes, re-checked on the client so a cached static page never shows an expired offer. Only the expiry gate ships JavaScript; the bar itself is server-rendered.",
      },
    },
  },
} satisfies Meta<typeof AnnouncementBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** PPHeader launch strip. */
export const LaunchPrice: Story = {};

export const WithoutCountdown: Story = { args: { endsAt: undefined } };

/** After `endsAt`: nothing is rendered, and the header row moves up to the top. */
export const Expired: Story = {
  args: { endsAt: "2025-01-01T00:00:00+05:30" },
  render: (args) => (
    <div data-testid="page-top" className="grid">
      <AnnouncementBar {...args} />
      <div data-testid="header-row" className="h-header-compact border-b border-border-subtle px-4">
        Header row
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.queryByText(/Launch price/)).toBeNull();
    const top = canvas.getByTestId("page-top").getBoundingClientRect().top;
    await expect(canvas.getByTestId("header-row").getBoundingClientRect().top).toBe(top);
  },
};
```

- [ ] **Step 8: Export**

```ts
export {
  AnnouncementBar,
  type AnnouncementBarProps,
} from "./molecules/announcement-bar/announcement-bar";
```

- [ ] **Step 9: Gate** — `<paths>` = `packages/ui/src/molecules/announcement-bar packages/ui/src/index.ts`; then the expiry in Chromium:

```bash
pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache -- announcement-bar 2>&1 | tail -10
```

Expected: every AnnouncementBar story passes, including `Expired`'s play.

- [ ] **Step 10: Commit**

```bash
git add packages/ui/src/molecules/announcement-bar packages/ui/src/index.ts
git commit -m "feat(ui): AnnouncementBar molecule

The brand launch strip with an optional countdown. Unlike the handoff's,
it renders nothing once endsAt has passed — including when it expires
while the page is open — via a tiny client gate on useSyncExternalStore,
so the bar stays server-rendered and linkAs works from a server layout.
An unreadable endsAt throws instead of never expiring.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 20: Table

**Files:**

- Create: `packages/design-tokens/tokens/component/table.json`
- Modify: `packages/design-tokens/contrast-pairs.json`, `packages/ui/src/lib/component-variants.ts` (`TEXT`, `SPACING`)
- Create: `packages/ui/src/molecules/table/table.tsx`, `table.test.tsx`, `table.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** none (handoff component)

**Interfaces:**

- Consumes: `useId`; semantic tokens (the frame is a light island: `data-surface="light"`).
- Produces (one file, compound): `Table`, `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell`, `TableCell` and `type TableProps`, `TableHeadProps`, `TableBodyProps`, `TableRowProps`, `TableHeaderCellProps`, `TableCellProps` (contract §6 + deviation 2). Server-safe. Defaults: `isCaptionVisible = false`, `minWidth = "none"`, `TableHeaderCell scope = "col"`. With a `minWidth`, the frame is a named (`aria-labelledby` the caption), focusable (`tabIndex=0`) `role="region"` that scrolls horizontally.

- [ ] **Step 1: Component tokens and contrast pairs**

Create `packages/design-tokens/tokens/component/table.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "table-sm": { "$value": "460px", "$description": "Min width: offers / glance tables." },
    "table-md": { "$value": "620px", "$description": "Min width: the price matrix." },
    "table-lg": { "$value": "720px", "$description": "Min width: the box comparison." }
  },
  "text": {
    "$type": "typography",
    "table-head": {
      "$value": { "fontSize": "13px", "lineHeight": 1.3, "fontWeight": "{font-weight.bold}" },
      "$description": "Column headers (handoff 12–14px Poppins 700)."
    }
  }
}
```

Append `"table-head",` to `TEXT` and `"table-sm", "table-md", "table-lg",` to `SPACING`.

Append to `groups` in `contrast-pairs.json`:

```json
{
  "id": "table-head",
  "surface": null,
  "pairs": [
    ["color-text-heading", "color-surface-brand-soft"],
    ["color-pink-700", "color-surface-brand-soft"]
  ],
  "min": 4.5
}
```

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -6`
Expected: PASS (ink-900 on pink-100 ≈ 14.5:1; pink-700 on pink-100 5.66:1).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/table/table.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  type TableProps,
} from "./table";

function PriceList(props: Partial<TableProps>) {
  return (
    <Table caption="Homely Meals price list" minWidth="md" {...props}>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Plate</TableHeaderCell>
          <TableHeaderCell>Trial</TableHeaderCell>
          <TableHeaderCell isHighlighted>Weekday plan</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableHeaderCell scope="row">Classic</TableHeaderCell>
          <TableCell>₹650</TableCell>
          <TableCell isHighlighted>
            <button type="button">₹3,120</button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

describe("Table", () => {
  it("is a semantic table named by its caption", () => {
    render(<PriceList />);
    expect(screen.getByRole("table", { name: "Homely Meals price list" })).toBeInTheDocument();
  });

  it("wraps a wide table in a named, focusable scroll region", () => {
    render(<PriceList />);
    const region = screen.getByRole("region", { name: "Homely Meals price list" });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(region).toHaveClass("overflow-x-auto");
    expect(within(region).getByRole("table")).toHaveClass("min-w-table-md");
  });

  it("adds no scroll region or extra tab stop when the table never needs to scroll", () => {
    render(<PriceList minWidth="none" />);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(screen.getByRole("table").parentElement).not.toHaveAttribute("tabindex");
  });

  it("keeps header association: column headers and row headers", () => {
    render(<PriceList />);
    expect(screen.getAllByRole("columnheader").map((cell) => cell.getAttribute("scope"))).toEqual([
      "col",
      "col",
      "col",
    ]);
    expect(screen.getByRole("rowheader", { name: "Classic" })).toHaveAttribute("scope", "row");
  });

  it("highlights the chosen column cell by cell", () => {
    render(<PriceList />);
    expect(screen.getByRole("columnheader", { name: "Weekday plan" })).toHaveClass("text-pink-700");
    expect(screen.getByRole("button", { name: "₹3,120" }).closest("td")).toHaveClass(
      "font-semibold"
    );
    expect(screen.getByRole("cell", { name: "₹650" })).not.toHaveClass("font-semibold");
  });

  it("reaches the scroll region, then the interactive cells, by keyboard", async () => {
    const user = userEvent.setup();
    render(<PriceList />);
    await user.tab();
    expect(screen.getByRole("region")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "₹3,120" })).toHaveFocus();
  });

  it("hides the caption visually by default and shows it on request", () => {
    const { rerender } = render(<PriceList />);
    expect(screen.getByText("Homely Meals price list")).toHaveClass("sr-only");
    rerender(<PriceList isCaptionVisible />);
    expect(screen.getByText("Homely Meals price list")).not.toHaveClass("sr-only");
  });

  it("is a light island even on dark sections", () => {
    render(<PriceList />);
    expect(screen.getByRole("region")).toHaveAttribute("data-surface", "light");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<PriceList />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- table 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./table`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/table/table.tsx`:

```tsx
import { type ComponentProps, type ReactNode, useId } from "react";

import { componentVariants } from "../../lib/component-variants";

const table = componentVariants({
  slots: {
    frame: "overflow-x-auto rounded-xl border border-border-subtle bg-surface-card shadow-1",
    table: "w-full border-collapse text-left text-body-sm text-text-body",
    caption: "px-5 pt-4 pb-2 text-left font-display text-body font-bold text-text-heading",
  },
  variants: {
    minWidth: {
      none: {},
      sm: { table: "min-w-table-sm" },
      md: { table: "min-w-table-md" },
      lg: { table: "min-w-table-lg" },
    },
    isCaptionVisible: { true: {}, false: { caption: "sr-only" } },
  },
});

const tableHead = componentVariants({
  base: "border-b border-border-subtle bg-surface-brand-soft",
});
const tableBody = componentVariants({ base: "divide-y divide-border-subtle" });

const tableHeaderCell = componentVariants({
  base: "px-3 first:pl-5 last:pr-5",
  variants: {
    isRowHeader: {
      false: "text-table-head py-3.5 align-bottom font-display text-text-heading",
      true: "py-3 align-top font-display font-bold text-text-heading",
    },
    isHighlighted: { true: "", false: "" },
  },
  compoundVariants: [{ isRowHeader: false, isHighlighted: true, class: "text-pink-700" }],
});

const tableCell = componentVariants({
  base: "px-3 py-3 align-top first:pl-5 last:pr-5",
  variants: { isHighlighted: { true: "font-semibold text-text-heading", false: "" } },
});

export interface TableProps extends ComponentProps<"table"> {
  /** Names the table (and its scroll region). Visually hidden unless `isCaptionVisible`. */
  caption: ReactNode;
  isCaptionVisible?: boolean | undefined;
  /** Below this width the table scrolls sideways inside its frame (460 / 620 / 720px). */
  minWidth?: "none" | "sm" | "md" | "lg" | undefined;
}

export type TableHeadProps = ComponentProps<"thead">;
export type TableBodyProps = ComponentProps<"tbody">;
export type TableRowProps = ComponentProps<"tr">;

export interface TableHeaderCellProps extends ComponentProps<"th"> {
  /** Marks the recommended column (its header turns brand). */
  isHighlighted?: boolean | undefined;
}

export interface TableCellProps extends ComponentProps<"td"> {
  /** Marks a cell of the recommended column. */
  isHighlighted?: boolean | undefined;
}

/**
 * A semantic table in a white frame (the handoff's price matrix, box comparison, offers and glance
 * tables — div grids there). `className` styles the frame. With a `minWidth`, a narrow screen
 * scrolls the table inside a named, keyboard-focusable region instead of squashing its columns.
 */
export function Table({
  caption,
  isCaptionVisible = false,
  minWidth = "none",
  className,
  children,
  ...props
}: TableProps) {
  const captionId = useId();
  const styles = table({ minWidth, isCaptionVisible });
  const isScrollable = minWidth !== "none";

  return (
    <div
      data-surface="light"
      role={isScrollable ? "region" : undefined}
      aria-labelledby={isScrollable ? captionId : undefined}
      tabIndex={isScrollable ? 0 : undefined}
      className={styles.frame({ className })}
    >
      <table className={styles.table()} {...props}>
        <caption id={captionId} className={styles.caption()}>
          {caption}
        </caption>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ className, ...props }: TableHeadProps) {
  return <thead className={tableHead({ className })} {...props} />;
}

export function TableBody({ className, ...props }: TableBodyProps) {
  return <tbody className={tableBody({ className })} {...props} />;
}

export function TableRow(props: TableRowProps) {
  return <tr {...props} />;
}

/** `scope="col"` by default; `scope="row"` for the first cell of a body row. */
export function TableHeaderCell({
  scope = "col",
  isHighlighted = false,
  className,
  ...props
}: TableHeaderCellProps) {
  const isRowHeader = scope === "row" || scope === "rowgroup";
  return (
    <th
      scope={scope}
      className={tableHeaderCell({ isRowHeader, isHighlighted, className })}
      {...props}
    />
  );
}

export function TableCell({ isHighlighted = false, className, ...props }: TableCellProps) {
  return <td className={tableCell({ isHighlighted, className })} {...props} />;
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- table 2>&1 | tail -8`
Expected: PASS (9 tests).

- [ ] **Step 6: Stories — the five handoff tables with `rates.js` data, and the 360px scroll check**

`packages/ui/src/molecules/table/table.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "./table";

const LENGTHS = [
  { label: "Trial", sub: "5 meals · any days within a week", meals: 5, note: "5 meals, any days" },
  { label: "Weekday plan", sub: "24 meals · Mon–Sat", meals: 24, note: "24 meals · offer +1 free" },
  { label: "Full month", sub: "30 meals · every day", meals: 30, note: "30 meals · offer +1 free" },
] as const;

/** `rates.js` → homely.plates at today's per-meal price (Classic at its launch price). */
const PLATES = [
  { name: "Everyday", perMeal: 120, per: `${formatRupees(120)} a meal` },
  {
    name: "Classic",
    perMeal: 130,
    per: `${formatRupees(130)} a meal · launch price`,
    isRecommended: true,
  },
  { name: "Signature", perMeal: 200, per: `${formatRupees(200)} a meal` },
] as const;

/** A price cell that loads the builder: a real button, highlighted on the recommended plan. */
function PriceButton({
  amount,
  note,
  isHighlighted,
}: {
  amount: number;
  note: string;
  isHighlighted: boolean;
}) {
  return (
    <button
      type="button"
      className={
        isHighlighted
          ? "shadow-selected flex min-h-13 w-full flex-col items-start gap-0.5 rounded-md border border-border-brand bg-pink-50 px-3 py-2.5 text-left"
          : "flex min-h-13 w-full flex-col items-start gap-0.5 rounded-md border border-transparent px-3 py-2.5 text-left hover:bg-surface-page-alt"
      }
    >
      <span className="font-display text-body-lg font-black text-text-heading">
        {formatRupees(amount)}
      </span>
      <span className="text-caption text-text-muted">{note}</span>
    </button>
  );
}

function PriceMatrix() {
  return (
    <Table caption="Homely Meals price list" minWidth="md">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Plate</TableHeaderCell>
          {LENGTHS.map((length) => (
            <TableHeaderCell key={length.label}>
              {length.label}
              <span className="block font-body text-caption font-regular text-text-muted">
                {length.sub}
              </span>
            </TableHeaderCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {PLATES.map((plate) => (
          <TableRow key={plate.name}>
            <TableHeaderCell scope="row">
              {plate.name}
              <span className="block font-body text-caption font-regular text-text-muted">
                {plate.per}
              </span>
            </TableHeaderCell>
            {LENGTHS.map((length) => {
              const isHighlighted = "isRecommended" in plate && length.label === "Weekday plan";
              return (
                <TableCell key={length.label} isHighlighted={isHighlighted}>
                  <PriceButton
                    amount={plate.perMeal * length.meals}
                    note={length.note}
                    isHighlighted={isHighlighted}
                  />
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

const meta = {
  title: "Molecules/Table",
  component: Table,
  args: { caption: "Homely Meals price list", minWidth: "md" },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'A semantic `<table>` for the handoff\'s price matrix, box comparison, offers, catering glance and plan-vs-app tables (div grids in the handoff). Compose `TableHead` / `TableBody` / `TableRow` / `TableHeaderCell` (`scope="col"`, or `"row"` for row headers) / `TableCell`. `minWidth` makes a narrow screen scroll the table inside a named, keyboard-focusable region. `isHighlighted` on the cells marks the recommended column. The caption names the table and is visually hidden unless `isCaptionVisible`.',
      },
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Homely Meals "The full price list" — interactive price cells. */
export const PriceList: Story = { render: () => <PriceMatrix /> };

/** The matrix at 360px: it scrolls inside its region; headers stay associated. */
export const ScrollsAt360: Story = {
  render: () => (
    <div className="w-90">
      <PriceMatrix />
    </div>
  ),
  play: async ({ canvas }) => {
    const region = canvas.getByRole("region", { name: "Homely Meals price list" });
    await expect(region.scrollWidth).toBeGreaterThan(region.clientWidth);
    region.focus();
    await expect(region).toHaveFocus();
    await expect(canvas.getAllByRole("columnheader")).toHaveLength(4);
    await expect(canvas.getAllByRole("rowheader")).toHaveLength(3);
  },
};

/** Catering "At a glance" (`rates.js` → catering.glance), Signature highlighted. */
export const CateringGlance: Story = {
  render: () => (
    <Table caption="Dawats at a glance" minWidth="sm">
      <TableHead>
        <TableRow>
          <TableHeaderCell>At a glance</TableHeaderCell>
          <TableHeaderCell>Classic {formatRupees(149)}</TableHeaderCell>
          <TableHeaderCell isHighlighted>Signature {formatRupees(199)}</TableHeaderCell>
          <TableHeaderCell>Maharaja {formatRupees(269)}</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {[
          ["Sabji", "Mix Veg", "Mix Veg + Paneer", "Mix Veg + premium Paneer"],
          ["Dal", "Dal Fry", "Dal Fry", "Dal Makhani"],
          ["Bread", "4 Tandoori Roti", "4 Tandoori Roti", "3 Roti + Lachha Paratha"],
          ["Rice", "Steamed", "Steamed", "Jeera Rice"],
          ["Raita", "Boondi Raita", "Boondi Raita", "Mix Veg Raita"],
          ["Salad", "Sirka Pyaaz", "Kachumber", "Kachumber"],
          ["Sweet", "—", "Gulab Jamun 1 pc", "Gulab Jamun 2 pc"],
        ].map(([course, classic, signature, maharaja]) => (
          <TableRow key={course}>
            <TableHeaderCell scope="row">{course}</TableHeaderCell>
            <TableCell>{classic}</TableCell>
            <TableCell isHighlighted>{signature}</TableCell>
            <TableCell>{maharaja}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** Homely Meals "Plate by plate, side by side." — the box comparison, Classic highlighted. */
export const BoxCompare: Story = {
  render: () => (
    <Table caption="What is in each box" minWidth="lg">
      <TableHead>
        <TableRow>
          <TableHeaderCell>
            <span className="sr-only">Item</span>
          </TableHeaderCell>
          <TableHeaderCell>Everyday · {formatRupees(120)}</TableHeaderCell>
          <TableHeaderCell isHighlighted>Classic · {formatRupees(130)}</TableHeaderCell>
          <TableHeaderCell>Signature · {formatRupees(200)}</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {[
          [
            "Dal",
            "1, from 4 home dals",
            "1, from 8 dals incl. Rajma, Chole, Dal Makhani",
            "1, rotating — lighter, the gravy carries the plate",
          ],
          [
            "Sabji",
            "1, from 7 seasonal home sabjis",
            "1, from 18 sabjis incl. Mix Veg, Kofta, Gatte",
            "Seasonal sabji + restaurant paneer gravy daily",
          ],
          ["Rice", "200g steamed", "200g · jeera rice Tue/Wed", "200g · jeera rice Tue/Wed"],
          ["Roti", "2 fresh tawa roti", "3 fresh tawa roti", "3 fresh tawa roti"],
          ["Salad & chutney", "Yes", "Yes", "Yes"],
          ["Raita", "Twice a week, one with biryani", "3× a week, incl. biryani day", "Every day"],
          [
            "Paneer day",
            "Mon lunch · Wed dinner — home-style Matar Paneer",
            "Mon lunch · Wed dinner — restaurant-style",
            "Every day, bigger portion",
          ],
          ["Soup", "—", "—", "Twice a week"],
          ["Dessert & papad", "—", "Biryani day only", "Every day"],
          [
            "Biryani day",
            "Fri lunch · Tue dinner — with Salan + Raita",
            "Fri lunch · Tue dinner — with Salan, Raita, Gulab Jamun",
            "Fri lunch · Tue dinner — with Salan, Raita, Gulab Jamun",
          ],
        ].map(([row, everyday, classic, signature]) => (
          <TableRow key={row}>
            <TableHeaderCell scope="row">{row}</TableHeaderCell>
            <TableCell>{everyday}</TableCell>
            <TableCell isHighlighted>{classic}</TableCell>
            <TableCell>{signature}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** Homely Meals "Live together? Eat for less." — offers, mono figures. */
export const Offers: Story = {
  render: () => (
    <Table caption="Pay less per meal" minWidth="sm">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Offer</TableHeaderCell>
          <TableHeaderCell>Classic</TableHeaderCell>
          <TableHeaderCell>Signature</TableHeaderCell>
          <TableHeaderCell>Weekday plan</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {[
          ["Regular price", formatRupees(140), formatRupees(200), `Classic ${formatRupees(3360)}`],
          ["Launch price · first 50", formatRupees(130), "—", `Classic ${formatRupees(3120)}`],
          [
            "2 people at one address",
            `${formatRupees(130)} each`,
            `${formatRupees(185)} each`,
            `Classic ${formatRupees(3120)} each`,
          ],
          ["Pay 3 months upfront", formatRupees(125), "—", `72 meals ${formatRupees(9000)}`],
          [
            "3–7 people at one address",
            `${formatRupees(125)} each`,
            `${formatRupees(180)} each`,
            `Classic ${formatRupees(3000)} each`,
          ],
          [
            "8–10 people (11–19 too)",
            `${formatRupees(120)} each`,
            `${formatRupees(170)} each`,
            `Classic ${formatRupees(2880)} each`,
          ],
          [
            "20+ · PG, hostel, office",
            `${formatRupees(119)} each`,
            "—",
            `Everyday ${formatRupees(99)} · ${formatRupees(2376)} each`,
          ],
        ].map(([offer, classic, signature, example]) => (
          <TableRow key={offer}>
            <TableHeaderCell scope="row">{offer}</TableHeaderCell>
            <TableCell className="font-mono">{classic}</TableCell>
            <TableCell className="font-mono">{signature}</TableCell>
            <TableCell className="font-mono text-text-muted">{example}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** Homely Meals "Decide once, for the whole month." — narrow enough not to scroll. */
export const PlanVsApp: Story = {
  render: () => (
    <Table caption="A plan against a food app" minWidth="none">
      <TableHead>
        <TableRow>
          <TableHeaderCell>
            <span className="sr-only">Question</span>
          </TableHeaderCell>
          <TableHeaderCell isHighlighted>Pink Paprikaa plan</TableHeaderCell>
          <TableHeaderCell>Food app, daily</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {[
          [
            "One meal costs",
            `${formatRupees(120)}–${formatRupees(200)}, fixed for your plan`,
            `${formatRupees(250)}–${formatRupees(350)} after delivery, packaging, fees`,
          ],
          ["Who cooks it", "One kitchen, every day", "A different restaurant each time"],
          ["What you do daily", "Nothing — it just arrives", "Open, browse, decide, pay"],
          [
            "Consistency",
            "Same quality, same hygiene, same hands",
            "Changes with whoever you pick",
          ],
          ["Variety", "Planned through the month", "Random, based on what looks good"],
          ["Delivery", "Fixed slot, no ordering", "Depends on restaurant and rider"],
        ].map(([question, plan, app]) => (
          <TableRow key={question}>
            <TableHeaderCell scope="row">{question}</TableHeaderCell>
            <TableCell isHighlighted>{plan}</TableCell>
            <TableCell className="text-text-muted">{app}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const CaptionVisible: Story = {
  render: () => (
    <Table caption="Upgrades, per head" isCaptionVisible>
      <TableBody>
        <TableRow>
          <TableHeaderCell scope="row">Paneer gravy instead of Mix Veg</TableHeaderCell>
          <TableCell className="font-mono">+{formatRupees(25)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
```

(Ranges use `formatRupees` twice joined by an en dash — the same output as `formatRupeeRange`; use `formatRupeeRange(120, 200)` if Task 0 shows it exported, which Plan 1 does.)

- [ ] **Step 7: Export**

```ts
export {
  Table,
  TableBody,
  type TableBodyProps,
  TableCell,
  type TableCellProps,
  TableHead,
  TableHeaderCell,
  type TableHeaderCellProps,
  type TableHeadProps,
  type TableProps,
  TableRow,
  type TableRowProps,
} from "./molecules/table/table";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/design-tokens/tokens/component/table.json packages/design-tokens/contrast-pairs.json packages/ui/src/molecules/table packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts`; then the 360px check in Chromium:

```bash
pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache -- table 2>&1 | tail -10
```

Expected: every Table story passes, including `ScrollsAt360`'s play.

- [ ] **Step 9: Commit**

```bash
git add packages/design-tokens/tokens/component/table.json packages/design-tokens/contrast-pairs.json packages/ui/src/molecules/table packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): Table molecule

Compound semantic table replacing the handoff's div grids (price matrix,
box comparison, offers, catering glance, plan vs app): caption-named,
th scope col/row, a highlighted column marked cell by cell, and a
minWidth that turns the frame into a named, focusable scroll region so
360px scrolls the table instead of squashing it.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 21: Tier parity review (spec §11.4)

**Files:**

- Modify: only files of Tasks 1–20 where the review finds a real defect.
- Screenshots go to `/tmp/pp-parity-3b/` — review evidence, never committed.

**Interfaces:**

- Consumes: every story from Tasks 1–20; the design-system cards (`zip-files/Pink Paprikaa Design System/components/molecules/*.card.html`) and the handoff pages (`zip-files/pink-paprikaa-handoff/design/*.dc.html`).
- Produces: a difference list (fixed, or accepted with a reason) in the commit body; a green `storybook:test`.

- [ ] **Step 1: Serve the three sources**

Run each in the background (Bash `run_in_background`), then check each URL answers:

```bash
pnpm exec serve "zip-files/Pink Paprikaa Design System" -l 5050
pnpm exec serve zip-files/pink-paprikaa-handoff/design -l 5051
pnpm nx run @pink-paprikaa-web/storybook:serve
```

The design-system cards load React and Babel from unpkg; if the sandbox blocks the network, rerun that `serve` with the sandbox disabled. Story iframe URLs are `http://localhost:6006/iframe.html?id=<story-id>&viewMode=story`, where the id is the title and export name in kebab-case (`Molecules/Table` → `ScrollsAt360` = `molecules-table--scrolls-at-360`).

- [ ] **Step 2: Screenshot every pair at 360 and 1280**

With the Chrome DevTools MCP (`new_page`, `resize_page` to 360×900 then 1280×900, `take_screenshot`) — or a throwaway Playwright script outside the repo — capture each pair side by side into `/tmp/pp-parity-3b/<component>-<width>-{source,story}.png`:

| Component       | Source                                                                                                                      | Story ids                                                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| MenuItemRow     | `:5050/components/molecules/MenuItemRow.card.html`                                                                          | `molecules-menuitemrow--full`, `--discount`, `--devanagari`, `--minimal`                                                          |
| MenuItemCard    | `:5050/components/molecules/MenuItemCard.card.html`                                                                         | `molecules-menuitemcard--variants`                                                                                                |
| OutletCard      | `:5050/components/molecules/OutletCard.card.html`                                                                           | `molecules-outletcard--with-image`, `--without-image`                                                                             |
| ReviewCard      | `:5050/components/molecules/ReviewCard.card.html`; `:5051/GoogleReviews.dc.html`                                            | `molecules-reviewcard--default`, `--brand`, `--symbol-mark`, `--google-review`                                                    |
| LoyaltyCard     | `:5050/components/molecules/LoyaltyCard.card.html`                                                                          | `molecules-loyaltycard--in-progress`, `--one-left`, `--complete`, `--brand`                                                       |
| FilterBar       | `:5050/components/molecules/FilterBar.card.html`                                                                            | `molecules-filterbar--wrap`, `--scroll`, `--icons`                                                                                |
| LogoLockup      | `:5050/components/molecules/LogoLockup.card.html`                                                                           | `molecules-logolockup--pink`, `--white`, `--centred`, `--wordmark`                                                                |
| OfferSeal       | `:5050/components/molecules/OfferSeal.card.html`; `:5051/Home.dc.html` (hero)                                               | `molecules-offerseal--tones`, `--values`, `--handoff-hero`, `--bleed-off-corner`                                                  |
| CouponTicket    | `:5050/components/molecules/CouponTicket.card.html`                                                                         | `molecules-couponticket--brand`, `--light`, `--on-pink-artwork`                                                                   |
| ChoiceCardGroup | `:5051/PlanCalculator.dc.html`, `DawatCalculator.dc.html`, `Home.dc.html` (trial), `HomelyMeals.dc.html` (decide)           | `molecules-choicecardgroup--plates`, `--plan-lengths`, `--dawats`, `--platters`, `--service`, `--trial-on-brand`, `--decide-list` |
| CheckCard       | `:5051/PlanCalculator.dc.html`                                                                                              | `molecules-checkcard--upfront`, `--no-onion-garlic`                                                                               |
| ChipGroup       | `:5051/PlanCalculator.dc.html`, `DawatCalculator.dc.html`, `HomelyMeals.dc.html` (price-list switch), `OfficeLunch.dc.html` | `molecules-chipgroup--which-meals`, `--make-it-yours`, `--standing-add-ons`, `--starter-picks`, `--segmented`, `--on-ink`         |
| KeyValueList    | `:5051/PlanCalculator.dc.html` (Your box), `Catering.dc.html` (rules), `HomelyMeals.dc.html` (customise)                    | `molecules-keyvaluelist--your-box`, `--booking-rules`, `--customisations`, `--upgrade-prices`, `--quote-lines`                    |
| Steps           | `:5051/Home.dc.html`, `Catering.dc.html`, `HomelyMeals.dc.html`                                                             | `molecules-steps--how-it-works`, `--how-to-book`, `--starting-takes-one-message`                                                  |
| FeatureItem     | `:5051/Catering.dc.html`, `OfficeLunch.dc.html`, `HomelyMeals.dc.html`                                                      | `molecules-featureitem--why-us`, `--office-perks`, `--what-you-get`                                                               |
| PricingCard     | `:5051/Home.dc.html`, `HomelyMeals.dc.html`, `Catering.dc.html`, `OfficeLunch.dc.html`                                      | `molecules-pricingcard--home-plates`, `--homely-plates`, `--catering-dawats`, `--office-plates`, `--long-name`                    |
| LinkCard        | `:5051/Home.dc.html` (doors), `About.dc.html` (CTAs)                                                                        | `molecules-linkcard--home-doors`, `--about-ctas`                                                                                  |
| StickyActionBar | `:5051/PlanCalculator.dc.html`, `DawatCalculator.dc.html` (at 360)                                                          | `molecules-stickyactionbar--plan-calculator`, `--dawat-calculator`                                                                |
| AnnouncementBar | `:5051/PPHeader.dc.html`                                                                                                    | `molecules-announcementbar--launch-price`, `--expired`                                                                            |
| Table           | `:5051/HomelyMeals.dc.html` (price list, box, offers, vs app), `Catering.dc.html` (glance)                                  | `molecules-table--price-list`, `--scrolls-at-360`, `--box-compare`, `--offers`, `--plan-vs-app`, `--catering-glance`              |

- [ ] **Step 3: Compare and act**

For each pair, compare spacing, type size and weight, colour, radius, shadow, alignment, wrapping and the 360px behaviour. A difference is either **fixed** (edit the owning task's files and rerun that task's gate) or **accepted** with a one-line reason. These are expected and accepted up front — confirm each is the only difference of its kind:

| Accepted difference                                                                                     | Reason                                                                         |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Font rasterisation                                                                                      | Self-hosted Fontsource vs Google Fonts (spec §11.4).                           |
| Handoff 13 / 15px running text renders at 12.5 / 14 / 16px                                              | Body copy snaps to the ramp (tier rules).                                      |
| PricingCard: one card (`rounded-xl`, 20→28px padding, 36→48px price, `h4` black name) on all four pages | The handoff drew it four ways; the system has one (Task 16).                   |
| PricingCard: Catering's "Most ordered" tag sits beside the name, not over the photo; no hover lift      | Fixed slot placement; a lift on a non-link promises a click that does nothing. |
| ChoiceCardGroup: price 20px (handoff 22px on plates); tile min height 64px (plates 72px)                | One card anatomy for plates, lengths and dawats.                               |
| FeatureItem: Office perks tile 40px (handoff 44px)                                                      | `size="sm"` pairs a 40px tile with the 16px title.                             |
| Steps rule grid tracks 260px (handoff 240px)                                                            | AutoGrid scale step (spec §15.2).                                              |
| OfferSeal label and note at full tone colour (design system 85% / 70% opacity)                          | 70% opacity drops the note below AA.                                           |
| CouponTicket `md`: terms 14px, stub label 11.5px (design system 10.6 / 9px at 560px)                    | Legible on screens; `lg` keeps the artwork proportions.                        |
| ReviewCard (Google): no rule above the footer; the verified chip is an uppercase Badge                  | One ReviewCard anatomy; Badge is the system's chip.                            |
| MenuItemCard lifts only when it is a link                                                               | Affordance honesty (deviation 13).                                             |
| LinkCard CTA and brand text in pink-600, not pink-500                                                   | pink-500 text measures 4.04:1 (spec §5.3).                                     |
| ChipGroup `segmented`: unchosen options are unfilled inside the track                                   | The handoff's own `seg()` style; its rendered Tags ignored it.                 |
| KeyValueList booking-rules key column 120px (handoff 110px)                                             | `keyWidth="md"` step.                                                          |
| AnnouncementBar 8px vertical padding, 12.5px text (handoff 7px / 13px)                                  | Scale and ramp steps.                                                          |

- [ ] **Step 4: Run the whole Storybook suite and the gauntlet**

```bash
pnpm nx format:check && pnpm nx sync:check
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache
pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache 2>&1 | tail -20
```

Expected: all green; the Storybook suite runs every Molecules story from this plan in Chromium (a11y enforced), including the five Review Focus plays (`BleedOffCorner`, `StarterPicks`, `LongName`, `Expired`, `ScrollsAt360`).

- [ ] **Step 5: Commit**

If Step 3 changed files, stage exactly those; otherwise the commit is empty and carries the record:

```bash
git add packages/ui packages/design-tokens
git commit --allow-empty -m "test(ui): parity review of the domain and handoff molecules

Every Plan 3b story compared with its design-system card or handoff page
at 360 and 1280px (spec §11.4).

Fixed:
<one line per fix: component — what changed>

Accepted:
<one line per accepted difference: component — difference — reason>

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

## Controller amendments (2026-09-27)

- **OfferSeal size scale is final as written here** (sm 110 · md 156 · lg 260 · xl 360). Plan 4's hero seal uses `md` (156px).
- **PricingCard normalised to one design** across the four handoff pages — accepted; a size variant is a step-2 (web app) decision if a page needs one.
- **AnnouncementBar expiry flash** (a cached page after `endsAt` shows the bar until hydration) — accepted for the design system; the web app schedules a rebuild at the offer end so no cached page shifts layout (recorded for the step-2 spec).
- **Path:** ChoiceCardGroup lives in `molecules/choice-card-group/`.
