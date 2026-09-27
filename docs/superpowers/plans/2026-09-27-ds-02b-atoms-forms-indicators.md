# Design System — Plan 2b of 5: Atoms (forms, indicators, menu primitives)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the fifteen remaining atoms — Input, Select, Checkbox, Radio + RadioGroup, Switch, Slider, Rating, ProgressBar, Spinner, Skeleton, Tooltip, DietMark, SpiceLevel, PriceTag, Countdown — each with component tokens, a behaviour + axe test, card-parity stories and an export, plus the shared `lib/field-status.ts` every later form component speaks.

**Architecture:** Three small shared internals keep the atoms thin and identical where the design system says they are identical: `lib/field-control.tsx` (the one field box Input and Select — and later SearchField — render inside), `lib/choice-control.tsx` (the one label row Checkbox, Radio and Switch render inside; all state styling is CSS off the native input, so the controls stay server-safe and `register()`-compatible), and `lib/brand-diamond.tsx` (the rotated square carrying the brand mark, for Rating and SpiceLevel). Every mark this plan draws — in a diamond, in the Spinner, in a loading field — is Plan 2a's `SymbolMark` (inline SVG in `currentColor`); stories use Plan 2a's `OnSurfaces`. Only Tooltip (Radix) and Countdown (clock) are client components.

**Tech Stack:** React 19.2 (server-first, `ref` as a prop) · TypeScript 6 · Tailwind 4.3 (token utilities only) · tailwind-variants 3.3 via `componentVariants` · radix-ui 1.6.7 (`Tooltip` only) · lucide-react 1.30 · `@pink-paprikaa-web/utils` (`formatRupees`, `formatRupeeRange`, `formatCount`) · Vitest 4 + Testing Library + user-event 14 + axe-core · Storybook 10.5 (`storybook/test` play functions).

**Spec:** `docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md` — §4 (C10 veg only), §5 (contrast policy, §5.5 a11y), §6 (tokens), §8 (component rules, §8.2 prop translation), §9.1 (atom rows), §10.2 (stories), §11.1 (definition of done), D17 (react-hook-form by contract).

**Contracts:** `docs/superpowers/plans/2026-09-27-ds-00-contracts.md` §1 (`lib/field-status.ts`) and §3 (every atom here) — binding. Deviations are listed below, each with its reason.

**Depends on:** Plan 1 (`2026-09-27-ds-01-foundation.md`: tokens, `componentVariants`, `styles.css` utilities, `Icon`, `ARTWORK`, `expectNoA11yViolations`, the formatters) and Plan 2a (`2026-09-27-ds-02a-atoms-core.md`, executed before this plan). From 2a this plan consumes only its **internal library** — `lib/symbol-mark.tsx` (`SymbolMark`), `lib/story-surfaces.tsx` (`OnSurfaces`), the `transition-control` utility, the `text-measure-prose` spacing token and the naming-convention escape for quoted keys — never its atoms (an atom may import only `Icon`). It edits the same `component-variants.ts` lists, `contrast-pairs.json` and `index.ts`.

## Global Constraints

Plan 1's list, verbatim:

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
- Commits: Conventional Commits, author with `git commit -m` (commitlint runs in the `commit-msg` hook). Allowed scopes: `web blog storybook ui tokens content seo utils tools ci deps`. Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. **Never `--no-verify`**, never `eslint-disable` a LAW rule.
- Verify APIs against the **installed** package (`node_modules/<pkg>`), never memory.
- A task is done only when its gate command output is green and pasted in the report.

Tier rules for this plan:

- **An atom imports only `../icon/icon`, `../../lib/*` and packages** — never another atom, and that includes its stories (the atomic-layering lint covers `*.stories.tsx`). Where a design-system card shows an `IconButton` or `Button` as a trigger or trailing slot, the story uses a plain `<button>`; the parity review lists it.
- **Dimensions (same rule as Plan 2a):** sizes the design system names for a component — control heights, box and glyph sizes, label type, off-scale radii, focus-ring shadows — are component tokens in `tokens/component/<name>.json`, in the Tailwind namespace of their type (`spacing` for sizes, `text` typography composites for font sizes, `shadow`, `radius`). Paddings, gaps and offsets use quarter steps of the 4px `--spacing` multiplier (`px-3.5`, `gap-2.5`, `gap-1.25`, `top-0.75`, `translate-x-4.5`). Stock numeric utilities whose number _is_ the design value are allowed: `border`, `border-2`, `border-6`, `outline-2`, `opacity-<n>`, `rotate-45`, fraction sizes (`size-4/5`).
- **Props (Plan 2a rule + ruling R13):** public `…Props` interfaces spell every union out, exactly as in the contract — never `extends VariantProps<…>` (Storybook's docgen drops types declared in `node_modules`). **Every optional custom prop is declared `name?: T | undefined`**, matching React's DOM prop types, so a molecule can forward a possibly-undefined value under `exactOptionalPropertyTypes`.
- **Never `max-w-prose`:** Tailwind 4.3's static `max-w-prose` (65ch) shadows `--container-prose`. Use Plan 2a's `max-w-text-measure-prose` (64ch) for a prose measure.
- **Slot:** Tooltip's `Trigger asChild` slots onto the consumer's element; the system never adds classes to a slotted child (Slot joins child classes without tailwind-merge).
- **The only inline `style`** is data-driven geometry a class cannot express: Rating's partial fill (`clip-path`) and ProgressBar's width — a computed percentage, never a design value.
- **Every new token name goes into its list in `packages/ui/src/lib/component-variants.ts`** (`SPACING`, `TEXT`, `SHADOW`, `RADIUS`). There is no colour list (tailwind-merge treats every `bg-*`/`text-*` colour alike). `component-variants.spec.ts` fails the gate if a name is missing.
- **Native-backed form controls** (Input, Select, Checkbox, Radio, Switch, Slider): `className` styles the visible box or row; **every other prop — including `register()`'s `ref`, `name`, `onChange`, `onBlur` — lands on the native element**. Checked, disabled and invalid styling is CSS off the native element (`group-has-*`, `has-disabled:`), so controlled, uncontrolled and RHF usage all work without state.
- **Server-safe unless stated:** no hooks except `useId`, no handlers created inside. `"use client"` appears only in `tooltip.tsx` and `countdown.tsx`.
- **A spec that reads a file** builds its path with `join(import.meta.dirname, "…")` from `node:path`, never `new URL("…", import.meta.url)` — Vite rewrites the latter to an `http://localhost` URL under Vitest's jsdom environment (ruling R15). No test in this plan reads a file; the rule stands for any added later.
- **Stories** import `OnSurfaces` from `../../lib/story-surfaces` (Plan 2a) and export the story as `OnSurfacesStory` with `name: "OnSurfaces"` (the helper owns the bare name). A surface-aware component — its text or its light island follows `data-surface` — gets one.
- **Impossible input throws `RangeError`** at render (a Rating above its max, a struck price that is not higher, a backwards range, an end time without an offset, a non-finite progress value). On a static export that fails the build — a page never renders a misleading number.
- **Imports** follow `perfectionist/sort-imports` groups: `import type` from packages → package values → `import type` from relatives → relative values, one blank line between groups. lint-staged runs `eslint --fix` and Prettier on commit; each gate step runs Prettier first (it also sorts classes — a reordered class list after formatting is expected).

## Review Focus

1. **`register()` must reach the native element** of Input (and its textarea), Select, Checkbox, Radio, Switch and Slider — `ref`, `name`, `onChange`, `onBlur` — or react-hook-form silently loses fields. Pinned in each of those tasks by spreading `fakeRegister(name)` (Task 1: the exact `{ name, onChange, onBlur, ref }` shape `register()` returns) and asserting the ref receives the native element and the events fire. RHF itself is not a `ui` dependency (spec D17).
2. **A long option label in Select at 360px** must never widen its box or the page. Pinned in Task 3 twice: a unit test asserts the select overlays its box (`absolute inset-0 size-full truncate`, box `w-full min-w-0`), and the `long option label at 360px` story's `play` measures the box against a 360px frame in real Chromium (`storybook:test`).
3. **Countdown across SSR and expiry** — the server HTML holds a stable placeholder, hydration reports no mismatch, it ticks only after mount, swaps to `fallback` the second the offer ends, renders nothing by default after expiry, clears its interval on unmount, and rejects an end time without an offset. Pinned in Task 16.
4. **PriceTag with `was` ≤ the price, or `to` < `amount`** — both would print a misleading discount or a backwards range. Pinned in Task 14: each throws `RangeError`.
5. **Rating half values and 0** — 4.5 clips the fifth diamond at exactly 50% in screen space, 4.3 at 30%, 0 draws no fill yet still names "0 out of 5", and a score outside `0…max` throws. Pinned in Task 11.

## Contract deviations

Contract changes (all additive; nothing the contract declares is removed or renamed):

| #   | Contract item        | Change                                                        | Reason                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --- | -------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `SelectProps`        | adds `readOnly?: boolean \| undefined`                        | Spec §9.1 lists readOnly for Select, `Select.card.html` has a "readOnly / disabled" row, and `guidelines/form-states.card.html` gives read-only to "Input, Select". A native `<select>` has no `readonly`, so the prop renders it `disabled` (not submitted) with the sunken fill and lock glyph. Named `readOnly` (not `isReadOnly`) so Select and Input take the same prop.                                          |
| 2   | `RadioGroupProps`    | adds `message?: ReactNode`                                    | A `Field` cannot label a `<fieldset>`, so a group's status needs its own message — spec §5.5 forbids a status by colour alone. Rendered under the options with the status glyph and wired as the group's `aria-describedby`.                                                                                                                                                                                           |
| 3   | `ProgressBarProps`   | adds `isLabelHidden?: boolean \| undefined`                   | `label` is required (it is the progressbar's name), but `ProgressBar.card.html` rows "continuous", "tone" and "inverse" show bars without a visible label. Hides it visually, keeps the name. Same pattern as the contract's `RadioGroup.isLegendHidden`.                                                                                                                                                              |
| 4   | `SwitchProps`        | adds `isLabelHidden?: boolean \| undefined`                   | The app kit puts a bare `Switch` in a `ListRow` whose title already labels it; a required visible label would print twice.                                                                                                                                                                                                                                                                                             |
| 5   | `FIELD_STATUS_ICON`  | warning → `TriangleAlert` (not `AlertTriangle`/`CircleAlert`) | The contract says "match Field.jsx": it draws `triangle-alert`. `TriangleAlert` is lucide-react 1.30's name for it (`AlertTriangle` is the deprecated alias).                                                                                                                                                                                                                                                          |
| 6   | `PriceTagProps.size` | adds `"canvas"` (controller ruling)                           | The readme: "Prices on artwork use PriceTag scaled up"; Plan 5's Marketing kit prints prices on 1080px artboards. `canvas` is 56px — the price on `ui_kits/marketing/FeedArtboards.jsx` DishLaunchPost, under a canvas-h1 headline (the canvas scale has no 56 step; the carousel's 44px price is one `className` away). The struck price and a range follow proportionally because they are `em`-relative to the tag. |

Additions outside the contract (internal to `packages/ui`, not exported from `index.ts` unless stated):

- `lib/field-control.tsx` — `FieldControl`, `FieldControlProps`, `fieldControlVariants`: the shared field box. Plan 3a's SearchField and OtpInput can render inside it instead of re-drawing the chrome.
- `lib/choice-control.tsx` — `ChoiceControl`, `choiceVariants`, `joinIds`: the shared checkbox/radio/switch row.
- `lib/brand-diamond.tsx` — `BrandDiamond`: the rotated square with Plan 2a's `SymbolMark` inside.
- `fakeRegister(name)` in `vitest.setup.ts` beside `expectNoA11yViolations`.
- Reused from Plan 2a, not re-created: `SymbolMark`, `OnSurfaces`, `transition-control`, `text-measure-prose`.
- Tokens: `--z-tooltip: 90` and the `z-tooltip` utility; primitive `--color-white-alpha-28` (the design system's inverse progress track, `rgba(255,255,255,.28)`).
- `index.ts` also exports `type FieldStatus` (contract §0: "any exported helper" type consumers need to type a `status` prop).

Decisions the contract left open (enum values for the design system's numeric `size` props, chosen from the cards and the real call sites):

| Atom        | `size`                            | Source                                                                                                                        |
| ----------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Rating      | sm 12 · md 16 · lg 24 px diamonds | `Rating.card.html` "size" row (12/16/24); ReviewCard uses 16                                                                  |
| SpiceLevel  | sm 12 · md 14 · lg 20             | card shows 10/14/20, but MenuItemRow and MenuItemCard both use 12 — the product call site wins; the parity review lists 10→12 |
| DietMark    | sm 14 · md 16 · lg 20             | menu rows/cards use 13–15, default 16; card's 26px sample is listed in the parity review                                      |
| Spinner     | sm 24 · md 36 · lg 52             | `Spinner.card.html` "size" row                                                                                                |
| ProgressBar | sm 6 · md 8 px bar                | LoyaltyCard uses 6; default 8                                                                                                 |

Reconciliations with the design system's prototype `.jsx` (the readme and guidelines win over prototype code):

- Disabled Checkbox, Radio and Switch use real fills (`ink-200`), not `opacity: .5` — readme §3.8 "Not just reduced opacity"; `form-states.card.html` "a real fill, never opacity".
- Select's text clears a leading icon at 44px (Input's inset) instead of Select.jsx's 42px — one field chrome for both; 2px.
- A read-only Select shows the lock glyph (form-states guideline), where Select.jsx kept the chevron.
- Spec §9.1 mentions `onCheckedChange`/`onValueChange` for Checkbox and Slider; the contract (and D17) keep them native (`checked`/`onChange`, `value`/`onChange`) so `register()` works unmodified. The contract wins; no callback props are added.

---

## File map (this plan)

```
packages/design-tokens/
  tokens/component/{field,control,choice,switch,spinner,progress-bar,brand-diamond,rating,diet-mark,price-tag}.json  C
  tokens/primitive/color.json                      M  white-alpha-28 (Task 10)
  tokens/primitive/z-index.json                    M  tooltip (Task 15)
  contrast-pairs.json                              M  inverse text on the brand fill (Task 14)
packages/ui/
  vitest.setup.ts                                  M  fakeRegister
  src/styles.css                                   M  z-tooltip utility (Task 15)
  src/index.ts                                     M  one export line per task
  src/lib/{field-status.ts,field-status.spec.ts}   C
  src/lib/{field-control.tsx,choice-control.tsx,brand-diamond.tsx}  C
  src/lib/component-variants.ts                    M  token names
  src/atoms/{input,select,checkbox,radio,switch,slider,spinner,skeleton,progress-bar,rating,spice-level,diet-mark,price-tag,tooltip,countdown}/
    <name>.tsx · <name>.test.tsx · <name>.stories.tsx   C
```

**The gate** (every task's step 8; referred to below as "the gate"):

```bash
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
```

---

### Task 0: Reconcile with the code as built

Plans 1 and 2a are executed before this one. Before writing anything, prove every interface this plan consumes exists as declared; where it does not, patch the affected later tasks of **this file** to reality first.

**Files:**

- Modify (only if a check fails): this plan.

**Interfaces:**

- Consumes: Plan 1 Task 2 tokens, Task 3 formatters, Task 5 `styles.css` + `componentVariants` + `vitest.setup.ts`, Task 7 `Icon` + `brand-artwork.ts`; Plan 2a Task 1 `SymbolMark`, `OnSurfaces`, `transition-control`, the quoted-key naming escape, and Task 2's `text-measure-prose` token; Plan 2a's edits to the shared files.
- Produces: a green baseline and a plan that matches the code.

- [ ] **Step 1: Plan 1 and Plan 2a exports**

Run:

```bash
rtk proxy grep -n "^export" packages/ui/src/lib/component-variants.ts packages/ui/src/lib/brand-artwork.ts packages/ui/src/lib/symbol-mark.tsx packages/ui/src/lib/story-surfaces.tsx packages/ui/src/atoms/icon/icon.tsx packages/ui/vitest.setup.ts packages/utils/src/index.ts
grep -n '"@pink-paprikaa-web/utils"\|"radix-ui"\|"lucide-react"' packages/ui/package.json
rtk proxy grep -n "requiresQuotes" tools/eslint-config/rules/naming-convention.js
```

Expected: `componentVariants`, `type VariantProps` (re-export), `twMergeConfig`; `ARTWORK`, `SYMBOL_DATA_URI_WHITE`; `type SymbolMarkProps`, `function SymbolMark` (inline SVG, `fill="currentColor"`, `aria-hidden`, spreads `className` and `style`); `function OnSurfaces({ children }: { children: ReactNode })`; `type IconComponent`, `interface IconProps`, `function Icon`; `async function expectNoA11yViolations`; `formatCount, formatRupeeRange, formatRupees`; all three dependencies; the `requiresQuotes` escape.

- [ ] **Step 2: Every token and utility this plan consumes is in the build**

Run:

```bash
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache > /dev/null && node -e '
const catalogue = require("./packages/design-tokens/dist/tokens.json");
const have = new Set(catalogue.filter((e) => e.surface === null).map((e) => e.name));
const need = [
  "color-pink-50", "color-pink-100", "color-pink-200", "color-pink-500", "color-ink-000",
  "color-ink-100", "color-ink-200", "color-ink-300", "color-ink-400", "color-ink-500",
  "color-ink-900", "color-mint", "color-veg", "color-heat-1", "color-heat-2", "color-heat-3",
  "color-heat-4", "color-focus", "color-status-danger", "color-status-danger-soft",
  "color-status-success", "color-status-success-soft", "color-status-warning",
  "color-status-warning-soft", "color-text-body", "color-text-heading", "color-text-muted",
  "color-text-subtle", "color-text-brand", "color-text-link", "color-text-on-inverse",
  "color-text-danger", "color-text-success", "color-text-warning", "color-surface-page",
  "color-surface-page-alt", "color-surface-card", "color-surface-sunken", "color-surface-brand",
  "color-surface-brand-soft", "color-surface-inverse", "color-border-default",
  "color-border-subtle", "color-border-brand", "shadow-1", "shadow-2", "shadow-focus-ring",
  "radius-sm", "radius-md", "radius-lg", "radius-pill", "text-body-sm", "text-caption",
  "text-overline", "text-mono", "text-h3", "text-h4", "text-canvas-h2", "font-body",
  "font-display", "font-mono", "font-weight-regular", "font-weight-medium", "font-weight-bold",
  "font-weight-black", "spacing-icon-xs", "spacing-icon-sm", "spacing-icon-md",
  "spacing-text-measure-prose", "z-toast",
];
const missing = need.filter((name) => !have.has(name));
console.log(missing.length === 0 ? "all consumed tokens present" : "MISSING: " + missing.join(", "));'
rtk proxy grep -n "@utility transition-control\|@utility duration-fast\|@utility duration-base\|@utility duration-slow\|@utility z-toast\|--animate-mark-pulse\|--animate-skeleton" packages/ui/src/styles.css
```

Expected: `all consumed tokens present`; the grep lists every utility and both animations.

- [ ] **Step 3: What Plan 2a changed in the shared files**

Run:

```bash
ls packages/ui/src/lib packages/ui/src/atoms packages/design-tokens/tokens/component
rtk proxy grep -n "color-text-on-inverse" packages/design-tokens/contrast-pairs.json
sed -n '/^const SPACING/,/^];/p;/^const TEXT/,/^];/p;/^const SHADOW/,/^];/p;/^const RADIUS/,/^];/p' packages/ui/src/lib/component-variants.ts
cat packages/ui/src/index.ts
```

Apply, then note each decision in the report:

- If `contrast-pairs.json` already pairs `color-text-on-inverse` with `color-surface-brand`, delete Task 14's contrast step.
- If a token name this plan adds already exists in a list (a Plan 2a collision), prefix this plan's token with its component name in every task that uses it — never let one token carry two meanings.
- Plan 2a's StatusDot owns `radius-status-dot` (2px); this plan's `radius-brand-diamond` is the same corner for the diamonds Rating and SpiceLevel draw. Keep both (one meaning each) and record it in the report for a later consolidation.
- Append this plan's export lines where Plan 2a's `index.ts` convention puts them (grouped by tier, sorted by path).

- [ ] **Step 4: Probe the class vocabulary this plan relies on**

Create `packages/ui/src/atoms/probe/probe.tsx`:

```tsx
export function Probe() {
  return (
    <label className="group/choice relative has-disabled:text-ink-400">
      Probe
      <input className="peer sr-only" type="checkbox" />
      <span className="order-last ms-auto size-3/4 size-6/7 max-w-none translate-x-4.5 -rotate-45 rotate-45 appearance-none truncate border-6 ps-11 pe-11 font-regular accent-pink-500 opacity-85 group-has-checked/choice:bg-pink-500 group-has-focus-visible/choice:outline-2 group-has-checked/choice:group-has-disabled/choice:text-ink-400 group-has-aria-invalid/choice:border-status-danger placeholder:text-text-subtle read-only:cursor-default in-aria-invalid:border-status-danger motion-safe:animate-mark-pulse starting:opacity-0" />
    </label>
  );
}
```

Run: `pnpm nx lint @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -15`
Expected: no `tailwindcss/*` error for the probe. If one class is rejected, find its Tailwind 4.3 spelling (`node_modules/tailwindcss/dist/lib.d.ts`, or compile a one-line candidate), then patch every task below that uses it. Then remove the probe: `rm -r packages/ui/src/atoms/probe && git status --short` (nothing from the probe remains).

- [ ] **Step 5: Baseline gate**

Run the gate. Expected: green — so any later red is this plan's.

- [ ] **Step 6: Commit only if this plan was patched**

```bash
git add docs/superpowers/plans/2026-09-27-ds-02b-atoms-forms-indicators.md
git commit -m "docs: reconcile plan 2b with the code plans 1 and 2a produced

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 1: Shared form status and a register() double

**Files:**

- Create: `packages/ui/src/lib/field-status.ts`, `packages/ui/src/lib/field-status.spec.ts`
- Modify: `packages/ui/vitest.setup.ts`, `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `IconComponent` (`atoms/icon/icon`), Vitest's `vi`.
- Produces: `type FieldStatus = "default" | "error" | "success" | "warning"` and `FIELD_STATUS_ICON: Readonly<Record<"error" | "success" | "warning", IconComponent>>` (contract §1); `fakeRegister(name: string): { name; onChange; onBlur; ref }` (all `vi.fn()`); `export type { FieldStatus }` from the barrel.

- [ ] **Step 1: Tokens**

None — this task adds no visual value, so no token, list or contrast pair.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/lib/field-status.spec.ts`:

```ts
import { CircleAlert, CircleCheck, TriangleAlert } from "lucide-react";

import { FIELD_STATUS_ICON } from "./field-status";

describe("FIELD_STATUS_ICON", () => {
  it("draws each status with the design system's Field glyph", () => {
    expect(FIELD_STATUS_ICON).toEqual({
      error: CircleAlert,
      success: CircleCheck,
      warning: TriangleAlert,
    });
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './field-status'`.

- [ ] **Step 4: Implement**

`packages/ui/src/lib/field-status.ts`:

```ts
import { CircleAlert, CircleCheck, TriangleAlert } from "lucide-react";

import type { IconComponent } from "../atoms/icon/icon";

/**
 * The one form status system (design system readme §3.8). Every field, choice group and Field
 * speaks it. A status is never shown by colour alone: it always comes with its glyph and a
 * message (spec §5.5).
 */
export type FieldStatus = "default" | "error" | "success" | "warning";

/** The glyph each status draws — the design system's Field.jsx: circle-alert, circle-check, triangle-alert. */
export const FIELD_STATUS_ICON: Readonly<Record<Exclude<FieldStatus, "default">, IconComponent>> = {
  error: CircleAlert,
  success: CircleCheck,
  warning: TriangleAlert,
};
```

In `packages/ui/vitest.setup.ts`, change `import { expect } from "vitest";` to `import { expect, vi } from "vitest";` and add after `expectNoA11yViolations`:

```ts
/**
 * What react-hook-form's `register(name)` returns — `{ name, onChange, onBlur, ref }` — as spies.
 * Spread it onto a native-backed control to prove `{...register("field")}` works (spec D17)
 * without making react-hook-form a dependency of the library.
 */
export function fakeRegister(name: string) {
  return { name, onChange: vi.fn(), onBlur: vi.fn(), ref: vi.fn() };
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 6: Stories**

None — no component.

- [ ] **Step 7: Export**

Add to `packages/ui/src/index.ts`:

```ts
export type { FieldStatus } from "./lib/field-status";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/lib/field-status.ts packages/ui/src/lib/field-status.spec.ts packages/ui/vitest.setup.ts packages/ui/src/index.ts
```

Then run the gate. Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui
git commit -m "feat(ui): add the shared form status and a register() test double

FIELD_STATUS_ICON is the one status glyph map every field, group and Field
uses (circle-alert, circle-check, triangle-alert, as the design system's
Field.jsx draws them). fakeRegister mirrors what react-hook-form's
register() returns, so control tests prove RHF compatibility without the
library depending on it.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Input — and the shared field box

**Files:**

- Create: `packages/design-tokens/tokens/component/field.json`, `packages/design-tokens/tokens/component/control.json`
- Create: `packages/ui/src/lib/field-control.tsx`
- Create: `packages/ui/src/atoms/input/input.tsx`, `input.test.tsx`, `input.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts`, `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `FieldStatus`, `FIELD_STATUS_ICON`, `fakeRegister` (Task 1); `SymbolMark`, `OnSurfaces`, `transition-control` (Plan 2a); `Icon`, `IconComponent`; `componentVariants`; `expectNoA11yViolations`.
- Produces: `Input`, `InputProps` exactly as contract §3; `FieldControl`, `FieldControlProps`, `fieldControlVariants` (`lib/field-control.tsx`: `children: (controlClassName: string) => ReactNode`, props `size`, `status`, `control: "input" | "select"`, `icon`, `suffix`, `trailing`, `isLoading`, `isReadOnly`, `isMultiline`, `affordance`, `className`) — Select uses it in Task 3.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/field.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "field-sm": { "$value": "40px", "$description": "Field height, size sm." },
    "field-md": {
      "$value": "48px",
      "$description": "Field height, size md — the system's field (readme §3.10)."
    },
    "field-lg": { "$value": "56px", "$description": "Field height, size lg." },
    "field-spinner": {
      "$value": "18px",
      "$description": "The pulsing mark while a field validates."
    }
  },
  "text": {
    "$type": "typography",
    "field-suffix": {
      "$value": { "fontSize": "12px" },
      "$description": "A field's trailing unit or count, set in Space Mono."
    }
  },
  "shadow": {
    "$type": "shadow",
    "field-ring-danger": {
      "$value": "0 0 0 3px {color.status.danger-soft}",
      "$description": "Focus ring of a field in error."
    },
    "field-ring-success": {
      "$value": "0 0 0 3px {color.status.success-soft}",
      "$description": "Focus ring of a field in success."
    },
    "field-ring-warning": {
      "$value": "0 0 0 3px {color.status.warning-soft}",
      "$description": "Focus ring of a field in warning."
    }
  }
}
```

`packages/design-tokens/tokens/component/control.json`:

```json
{
  "text": {
    "$type": "typography",
    "control": {
      "$value": { "fontSize": "15px" },
      "$description": "Text in a md or lg field, and the label of a checkbox, radio or switch."
    }
  }
}
```

In `packages/ui/src/lib/component-variants.ts` append to `SPACING`: `"field-sm", "field-md", "field-lg", "field-spinner"`; to `TEXT`: `"control", "field-suffix"`; to `SHADOW`: `"field-ring-danger", "field-ring-success", "field-ring-warning"`.

The box's paddings and gaps are quarter steps: 14px inline padding `px-3.5`, 10px between icon, text and glyphs `gap-2.5`, and Select's 44px text inset that clears a leading icon (14 + 20 + 10) `ps-11` / `pe-11`.

Contrast: no new pair. A field paints `text-text-body`, `text-text-subtle` (placeholder, suffix) on `bg-surface-card` / `bg-surface-sunken` inside its own light island — already in the `light-text` group. Disabled text (`ink-400` on `ink-100`) is exempt (WCAG 1.4.3).

Run `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache` and confirm `dist/theme.css` contains `--spacing-field-md: 48px;`, `--text-control: 15px;` and `--shadow-field-ring-danger: 0 0 0 3px #FCE9E9;`.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/input/input.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Phone } from "lucide-react";

import { expectNoA11yViolations, fakeRegister } from "../../../vitest.setup";
import { ARTWORK } from "../../lib/brand-artwork";
import { Input } from "./input";

/** The brand mark (Plan 2a's SymbolMark) is the only SVG drawn with the symbol's viewBox. */
const markIn = (root: HTMLElement) =>
  root.querySelector(`svg[viewBox="${ARTWORK.symbol.viewBox}"]`);

describe("Input", () => {
  it("is a md text field on its own light island by default", () => {
    render(<Input aria-label="Full name" />);
    const box = screen.getByRole("textbox", { name: "Full name" }).parentElement;
    expect(box).toHaveAttribute("data-surface", "light");
    expect(box).toHaveClass("h-field-md", "text-control", "border", "border-border-default");
  });

  it.each([
    ["sm", "h-field-sm", "text-body-sm"],
    ["md", "h-field-md", "text-control"],
    ["lg", "h-field-lg", "text-control"],
  ] as const)("renders size %s at %s with %s text", (size, height, text) => {
    render(<Input aria-label="Guests" size={size} />);
    expect(screen.getByRole("textbox").parentElement).toHaveClass(height, text);
  });

  it("takes react-hook-form's register(): ref, name, onChange and onBlur reach the native input", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("mobile");
    render(<Input aria-label="Mobile number" {...field} />);
    const input = screen.getByRole("textbox", { name: "Mobile number" });

    expect(field.ref).toHaveBeenCalledWith(input);
    expect(input).toHaveAttribute("name", "mobile");
    await user.type(input, "98");
    expect(field.onChange).toHaveBeenCalledTimes(2);
    await user.tab();
    expect(field.onBlur).toHaveBeenCalledTimes(1);
  });

  it("puts Field's wiring and native attributes on the input, and className on the box", () => {
    render(
      <Input
        id="mobile"
        aria-describedby="mobile-hint"
        type="tel"
        required
        placeholder="98765 43210"
        className="w-60"
      />
    );
    const input = screen.getByPlaceholderText("98765 43210");
    expect(input).toHaveAttribute("id", "mobile");
    expect(input).toHaveAttribute("aria-describedby", "mobile-hint");
    expect(input).toHaveAttribute("type", "tel");
    expect(input).toBeRequired();
    expect(input).not.toHaveClass("w-60");
    expect(input.parentElement).toHaveClass("w-60");
    expect(input.parentElement).not.toHaveClass("w-full");
  });

  it.each([
    ["error", "border-status-danger", ".lucide-circle-alert"],
    ["success", "border-status-success", ".lucide-circle-check"],
    ["warning", "border-status-warning", ".lucide-triangle-alert"],
  ] as const)(
    "shows %s with a 2px border and its glyph — never by colour alone",
    (status, border, glyph) => {
      const { container } = render(<Input aria-label="Promo code" status={status} />);
      expect(screen.getByRole("textbox").parentElement).toHaveClass("border-2", border);
      expect(container.querySelector(glyph)).toBeInTheDocument();
    }
  );

  it("marks only an error invalid for assistive tech", () => {
    render(
      <>
        <Input aria-label="Card" status="error" />
        <Input aria-label="Promo code" status="success" />
      </>
    );
    expect(screen.getByRole("textbox", { name: "Card" })).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("textbox", { name: "Promo code" })).not.toHaveAttribute("aria-invalid");
  });

  it("locks a read-only field with a sunken fill and a lock, still focusable and readable", async () => {
    const user = userEvent.setup();
    const { container } = render(<Input aria-label="Outlet" defaultValue="Sector 57" readOnly />);
    const input = screen.getByRole("textbox", { name: "Outlet" });
    expect(input.parentElement).toHaveClass("bg-surface-sunken");
    expect(container.querySelector(".lucide-lock")).toBeInTheDocument();
    await user.tab();
    expect(input).toHaveFocus();
    expect(input).toHaveValue("Sector 57");
  });

  it("lets a status glyph win over the lock", () => {
    const { container } = render(<Input aria-label="Outlet" readOnly status="warning" />);
    expect(container.querySelector(".lucide-triangle-alert")).toBeInTheDocument();
    expect(container.querySelector(".lucide-lock")).not.toBeInTheDocument();
  });

  it("pulses the brand mark in place of the glyph while loading, and reports busy", () => {
    const { container } = render(<Input aria-label="Promo code" status="error" isLoading />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-busy", "true");
    expect(markIn(container)).toHaveClass(
      "size-field-spinner",
      "text-pink-500",
      "motion-safe:animate-mark-pulse"
    );
    expect(container.querySelector(".lucide-circle-alert")).not.toBeInTheDocument();
  });

  it("disables through the native attribute, painted with a real fill (never opacity)", () => {
    render(<Input aria-label="Delivery address" disabled />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
    expect(input.parentElement).toHaveClass("has-disabled:bg-ink-100", "has-disabled:text-ink-400");
  });

  it("renders a leading icon, a mono suffix and a trailing slot", () => {
    const { container } = render(
      <Input
        aria-label="Table size"
        icon={Phone}
        suffix="guests"
        trailing={<button type="button">Check</button>}
      />
    );
    expect(container.querySelector(".lucide-phone")).toBeInTheDocument();
    expect(screen.getByText("guests")).toHaveClass("font-mono", "text-field-suffix");
    expect(screen.getByRole("button", { name: "Check" })).toBeInTheDocument();
  });

  it("becomes a vertically resizable textarea, four rows by default", () => {
    render(<Input aria-label="Notes for the kitchen" isMultiline />);
    const textarea = screen.getByRole("textbox", { name: "Notes for the kitchen" });
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveAttribute("rows", "4");
    expect(textarea).toHaveClass("resize-y");
    expect(textarea.parentElement).toHaveClass("h-auto", "items-start");
  });

  it("takes register() on the textarea too", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("notes");
    render(<Input aria-label="Notes" isMultiline rows={3} {...field} />);
    const textarea = screen.getByRole("textbox", { name: "Notes" });
    expect(field.ref).toHaveBeenCalledWith(textarea);
    expect(textarea).toHaveAttribute("rows", "3");
    await user.type(textarea, "x");
    expect(field.onChange).toHaveBeenCalledTimes(1);
  });

  it("has no accessibility violations in its richest state", async () => {
    const { container } = render(
      <Input aria-label="Mobile number" icon={Phone} status="error" suffix="+91" isLoading />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './input'`.

- [ ] **Step 4: Implement**

`packages/ui/src/lib/field-control.tsx`:

```tsx
import type { ReactNode } from "react";

import { Lock } from "lucide-react";

import { Icon, type IconComponent } from "../atoms/icon/icon";
import { componentVariants } from "./component-variants";
import { FIELD_STATUS_ICON, type FieldStatus } from "./field-status";
import { SymbolMark } from "./symbol-mark";

/**
 * The one field box (readme §3.8, guidelines/form-states.card.html). Input and Select render their
 * native control inside it — and SearchField can — so heights, radius, the status border, the focus
 * ring, the disabled and read-only fills and the trailing glyph are shared by construction.
 *
 * Disabled is styled off the native element (`has-disabled:`), so a disabled `<fieldset>` greys
 * its fields too. Read-only cannot be (`:read-only` matches every non-editable element), so it
 * is a variant.
 */
export const fieldControlVariants = componentVariants({
  slots: {
    root: [
      "group/field transition-control relative flex w-full min-w-0 items-center gap-2.5 rounded-md border border-border-default bg-surface-card px-3.5 font-body text-text-body",
      "has-disabled:cursor-not-allowed has-disabled:border-border-subtle has-disabled:bg-ink-100 has-disabled:text-ink-400",
    ],
    icon: "text-ink-500 group-has-disabled/field:text-ink-400",
    control: "bg-transparent outline-none disabled:cursor-not-allowed",
    glyph: "ms-auto",
    spinner: "size-field-spinner ms-auto shrink-0 text-pink-500 motion-safe:animate-mark-pulse",
    suffix: "text-field-suffix shrink-0 font-mono text-text-subtle",
  },
  variants: {
    size: {
      sm: { root: "h-field-sm text-body-sm" },
      md: { root: "h-field-md text-control" },
      lg: { root: "h-field-lg text-control" },
    },
    control: {
      input: {
        control:
          "min-w-0 flex-1 self-stretch placeholder:text-text-subtle read-only:cursor-default",
      },
      select: {
        // Overlays the whole box, so a click anywhere opens it and a long option label can
        // never widen the layout — it truncates inside the box.
        control:
          "absolute inset-0 size-full cursor-pointer appearance-none truncate rounded-md ps-3.5 pe-11",
      },
    },
    isMultiline: { true: { root: "h-auto items-start py-3", control: "resize-y" } },
    isReadOnly: { true: { root: "bg-surface-sunken" } },
    hasIcon: { true: "" },
    status: {
      default: {
        root: "focus-within:border-2 focus-within:border-border-brand focus-within:shadow-focus-ring",
        icon: "group-focus-within/field:text-pink-500",
        glyph: "text-ink-500 group-has-disabled/field:text-ink-400",
      },
      error: {
        root: "focus-within:shadow-field-ring-danger border-2 border-status-danger",
        icon: "text-status-danger",
        glyph: "text-status-danger",
      },
      success: {
        root: "focus-within:shadow-field-ring-success border-2 border-status-success",
        icon: "text-status-success",
        glyph: "text-status-success",
      },
      warning: {
        root: "focus-within:shadow-field-ring-warning border-2 border-status-warning",
        icon: "text-status-warning",
        glyph: "text-status-warning",
      },
    },
  },
  compoundVariants: [
    // A select's text clears a leading icon: 14px inset + 20px icon + 10px gap.
    { control: "select", hasIcon: true, class: { control: "ps-11" } },
    { status: "default", isReadOnly: true, class: { glyph: "text-ink-400" } },
  ],
  defaultVariants: {
    size: "md",
    control: "input",
    isMultiline: false,
    isReadOnly: false,
    hasIcon: false,
    status: "default",
  },
});

interface TrailingGlyph {
  icon: IconComponent;
  size: "sm" | "md";
}

/** One precedence for every field: a status beats the lock, the lock beats a resting affordance. */
function trailingGlyph(
  status: FieldStatus,
  isReadOnly: boolean,
  affordance: IconComponent | undefined
): TrailingGlyph | undefined {
  if (status !== "default") return { icon: FIELD_STATUS_ICON[status], size: "md" };
  if (isReadOnly) return { icon: Lock, size: "sm" };
  return affordance === undefined ? undefined : { icon: affordance, size: "md" };
}

export interface FieldControlProps {
  size?: "sm" | "md" | "lg" | undefined;
  status?: FieldStatus | undefined;
  /** The native control inside: an input/textarea in the flow, or a select overlaying the box. */
  control?: "input" | "select" | undefined;
  icon?: IconComponent | undefined;
  suffix?: string | undefined;
  trailing?: ReactNode;
  /** Pulses the brand mark in place of the trailing glyph. */
  isLoading?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  isMultiline?: boolean | undefined;
  /** A resting trailing glyph (Select's chevron); a status, the lock or the loading mark replace it. */
  affordance?: IconComponent | undefined;
  className?: string | undefined;
  /** Renders the native control, given the class the box assigns it. */
  children: (controlClassName: string) => ReactNode;
}

/**
 * Sets `data-surface="light"`: a white field inside a pink or ink section restores the light tokens
 * (spec §3.2.3), so its text and its focus ring are never the dark surface's.
 */
export function FieldControl({
  size = "md",
  status = "default",
  control = "input",
  icon,
  suffix,
  trailing,
  isLoading = false,
  isReadOnly = false,
  isMultiline = false,
  affordance,
  className,
  children,
}: FieldControlProps) {
  const styles = fieldControlVariants({
    size,
    status,
    control,
    isMultiline,
    isReadOnly,
    hasIcon: icon !== undefined,
  });
  const glyph = isLoading ? undefined : trailingGlyph(status, isReadOnly, affordance);

  return (
    <div data-surface="light" className={styles.root({ className })}>
      {icon === undefined ? null : <Icon icon={icon} size="md" className={styles.icon()} />}
      {children(styles.control())}
      {isLoading ? <SymbolMark className={styles.spinner()} /> : null}
      {glyph === undefined ? null : (
        <Icon icon={glyph.icon} size={glyph.size} className={styles.glyph()} />
      )}
      {suffix === undefined ? null : <span className={styles.suffix()}>{suffix}</span>}
      {trailing}
    </div>
  );
}
```

`packages/ui/src/atoms/input/input.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import type { FieldStatus } from "../../lib/field-status";
import type { IconComponent } from "../icon/icon";

import { FieldControl } from "../../lib/field-control";

interface InputOwnProps {
  size?: "sm" | "md" | "lg" | undefined;
  /** A status raises the border to 2px, tints the icon and shows its glyph. Field shows the message. */
  status?: FieldStatus | undefined;
  /** Leading icon: the status colour, or pink while focused. */
  icon?: IconComponent | undefined;
  /** Trailing static text — a unit or a count — in Space Mono. */
  suffix?: string | undefined;
  /** Trailing element, e.g. a small button. */
  trailing?: ReactNode;
  /** Pulses the brand mark in place of the trailing glyph while the value is checked. */
  isLoading?: boolean | undefined;
}

/**
 * The text field (spec §9.1): one line, or a textarea with `isMultiline`. `readOnly` gives the
 * sunken fill and a lock; `status="error"` sets `aria-invalid`. Label, hint and message are Field's.
 * `className` styles the box; every other prop — `register()` included — lands on the native control.
 */
export type InputProps = InputOwnProps &
  (
    | ({ isMultiline?: false | undefined } & Omit<ComponentProps<"input">, "size">)
    | ({ isMultiline: true; rows?: number | undefined } & ComponentProps<"textarea">)
  );

export function Input({
  size = "md",
  status = "default",
  icon,
  suffix,
  trailing,
  isLoading = false,
  className,
  ...control
}: InputProps) {
  const box = {
    size,
    status,
    icon,
    suffix,
    trailing,
    isLoading,
    className,
    isReadOnly: control.readOnly === true,
  };
  const state = {
    "aria-invalid": status === "error" ? true : undefined,
    "aria-busy": isLoading ? true : undefined,
  };

  if (control.isMultiline === true) {
    const { isMultiline, rows = 4, ...textarea } = control;
    return (
      <FieldControl {...box} isMultiline={isMultiline}>
        {(controlClassName) => (
          <textarea rows={rows} className={controlClassName} {...state} {...textarea} />
        )}
      </FieldControl>
    );
  }

  const { isMultiline = false, ...input } = control;
  return (
    <FieldControl {...box} isMultiline={isMultiline}>
      {(controlClassName) => <input className={controlClassName} {...state} {...input} />}
    </FieldControl>
  );
}
```

(`isMultiline` is destructured in each branch so it never reaches the DOM; the union narrows on `control.isMultiline`, which is why the narrowing happens before the destructure.)

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS (and `component-variants.spec.ts` still passes — the new names are listed).

- [ ] **Step 6: Stories (card parity with `Input.card.html`; docs from `Input.prompt.md`)**

`packages/ui/src/atoms/input/input.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { CreditCard, Phone } from "lucide-react";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Input } from "./input";

const meta = {
  title: "Atoms/Input",
  component: Input,
  args: { "aria-label": "Full name", placeholder: "Your full name" },
  render: (args) => (
    <div className="max-w-text-measure-prose w-full">
      <Input {...args} />
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Single-line or multiline text field — 48px tall (40 sm / 56 lg), 10px radius, 2px status border. States: rest, hover, focus (2px pink + ring), filled, `disabled`, `readOnly` (sunken fill + lock), `isLoading` (the pulsing mark), and `status` error / success / warning — a status raises the border to 2px, tints the leading icon and shows its glyph on the right. The label, hint and status message belong to **Field** (Molecules/Field), where the message replaces the hint; labels are sentence case and error copy says what to do next, never a code. `className` sizes the box; every other prop, `register()` included, lands on the native input.",
      },
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Rest: Story = { name: "rest" };

export const FilledWithIcon: Story = {
  name: "filled + icon",
  args: { "aria-label": "Mobile number", icon: Phone, type: "tel", defaultValue: "98765 43210" },
};

export const StatusError: Story = {
  name: "error",
  args: { "aria-label": "Card", icon: CreditCard, defaultValue: "4242 4242", status: "error" },
};

export const StatusSuccess: Story = {
  name: "success",
  args: { "aria-label": "Promo code", defaultValue: "PAPRIKAA50", status: "success" },
};

export const StatusWarning: Story = {
  name: "warning",
  args: { "aria-label": "Pickup time", defaultValue: "11:25pm", status: "warning" },
};

export const Loading: Story = {
  name: "loading",
  args: { "aria-label": "Promo code", defaultValue: "CHAI20", isLoading: true },
};

export const ReadOnly: Story = {
  name: "readOnly",
  args: { "aria-label": "Outlet", defaultValue: "Sector 57", readOnly: true },
};

export const Disabled: Story = {
  name: "disabled",
  args: {
    "aria-label": "Delivery address",
    placeholder: "Delivery starts in 2027",
    disabled: true,
  },
};

export const SuffixAndTrailing: Story = {
  name: "suffix / trailing",
  args: {
    "aria-label": "Table size",
    suffix: "guests",
    placeholder: "4",
    trailing: (
      <button
        type="button"
        className="shrink-0 rounded-pill px-3 py-1 font-display text-body-sm font-bold text-text-link hover:bg-pink-50"
      >
        Check
      </button>
    ),
  },
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="max-w-text-measure-prose grid w-full gap-3">
      <Input aria-label="Small" size="sm" placeholder="sm — 40px" />
      <Input aria-label="Medium" size="md" placeholder="md — 48px" />
      <Input aria-label="Large" size="lg" placeholder="lg — 56px" />
    </div>
  ),
};

export const Multiline: Story = {
  name: "multiline",
  args: {
    "aria-label": "Any notes for the kitchen?",
    isMultiline: true,
    rows: 3,
    placeholder: "No onion, extra hot.",
  },
};

/** A field is its own light island: white, dark text and a light focus ring on every ground. */
export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Input aria-label="Mobile number" icon={Phone} placeholder="98765 43210" />
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

Add to `packages/ui/src/index.ts`:

```ts
export { Input, type InputProps } from "./atoms/input/input";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/input packages/ui/src/lib/field-control.tsx packages/ui/src/lib/component-variants.ts packages/design-tokens/tokens/component
```

Then run the gate. Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the Input atom on a shared field box

FieldControl is the one field chrome (heights, radius, 2px status border,
focus ring, disabled and read-only fills, one trailing-glyph precedence)
that Input renders its native input or textarea inside, and Select will.
Every prop but className lands on the native control, so register() works
unmodified; the box sets data-surface=light so a field on pink or ink keeps
its own tokens.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Select

**Files:**

- Create: `packages/ui/src/atoms/select/select.tsx`, `select.test.tsx`, `select.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `FieldControl` (Task 2), `FieldStatus`, `IconComponent`, `fakeRegister`, `OnSurfaces` (Plan 2a).
- Produces: `Select`, `SelectProps`, `SelectOption` as contract §3, plus `readOnly?: boolean` (deviation 1).

- [ ] **Step 1: Component tokens**

None new: Select sits in Task 2's field box (`field.json`, `control.json`). No new list names, no new contrast pair.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/select/select.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Users } from "lucide-react";

import { expectNoA11yViolations, fakeRegister } from "../../../vitest.setup";
import { Select } from "./select";

const SLOTS = [
  { value: "19:30", label: "7:30pm" },
  { value: "20:00", label: "8:00pm" },
  { value: "20:30", label: "8:30pm", isDisabled: true },
];

describe("Select", () => {
  it("is a native select inside Input's field box", () => {
    render(<Select aria-label="Pickup time" options={SLOTS} />);
    const select = screen.getByRole("combobox", { name: "Pickup time" });
    expect(select.tagName).toBe("SELECT");
    expect(select.parentElement).toHaveAttribute("data-surface", "light");
    expect(select.parentElement).toHaveClass("h-field-md", "rounded-md", "border-border-default");
    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
      "7:30pm",
      "8:00pm",
      "8:30pm",
    ]);
    expect(screen.getByRole("option", { name: "8:30pm" })).toBeDisabled();
  });

  it("starts on a disabled placeholder until the guest chooses", () => {
    render(<Select aria-label="Guests" placeholder="Choose a size" options={SLOTS} />);
    expect(screen.getByRole("option", { name: "Choose a size" })).toBeDisabled();
    expect(screen.getByRole("combobox")).toHaveValue("");
  });

  it("keeps a given value over the placeholder", () => {
    render(
      <Select
        aria-label="Pickup time"
        placeholder="Choose a slot"
        defaultValue="20:00"
        options={SLOTS}
      />
    );
    expect(screen.getByRole("combobox")).toHaveValue("20:00");
  });

  it("takes react-hook-form's register(): ref, name, onChange and onBlur reach the native select", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("slot");
    render(<Select aria-label="Pickup time" options={SLOTS} {...field} />);
    const select = screen.getByRole("combobox", { name: "Pickup time" });

    expect(field.ref).toHaveBeenCalledWith(select);
    expect(select).toHaveAttribute("name", "slot");
    await user.tab();
    expect(select).toHaveFocus();
    await user.selectOptions(select, "8:00pm");
    expect(field.onChange).toHaveBeenCalledTimes(1);
    expect(select).toHaveValue("20:00");
    await user.tab();
    expect(field.onBlur).toHaveBeenCalledTimes(1);
  });

  it("rests with a chevron", () => {
    const { container } = render(<Select aria-label="Outlet" options={SLOTS} />);
    expect(container.querySelector(".lucide-chevron-down")).toBeInTheDocument();
  });

  it.each([
    ["error", "border-status-danger", ".lucide-circle-alert"],
    ["success", "border-status-success", ".lucide-circle-check"],
    ["warning", "border-status-warning", ".lucide-triangle-alert"],
  ] as const)("shows %s with its glyph in place of the chevron", (status, border, glyph) => {
    const { container } = render(<Select aria-label="Outlet" status={status} options={SLOTS} />);
    expect(screen.getByRole("combobox").parentElement).toHaveClass("border-2", border);
    expect(container.querySelector(glyph)).toBeInTheDocument();
    expect(container.querySelector(".lucide-chevron-down")).not.toBeInTheDocument();
  });

  it("marks only an error invalid", () => {
    render(<Select aria-label="Pickup time" status="error" options={SLOTS} />);
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
  });

  it("locks when read-only: sunken fill, a lock, and the value cannot change", () => {
    const { container } = render(
      <Select aria-label="Outlet" readOnly defaultValue="20:00" options={SLOTS} />
    );
    const select = screen.getByRole("combobox");
    expect(select).toBeDisabled();
    expect(select).toHaveValue("20:00");
    expect(select.parentElement).toHaveClass("bg-surface-sunken");
    expect(container.querySelector(".lucide-lock")).toBeInTheDocument();
    expect(container.querySelector(".lucide-chevron-down")).not.toBeInTheDocument();
  });

  it("clears a leading icon with its text inset", () => {
    const { container } = render(<Select aria-label="Guests" icon={Users} options={SLOTS} />);
    expect(container.querySelector(".lucide-users")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveClass("ps-11");
    expect(screen.getByRole("combobox")).not.toHaveClass("ps-3.5");
  });

  it("never lets a long option label widen its box: it overlays the box and truncates", () => {
    render(
      <Select
        aria-label="Outlet"
        options={[
          {
            value: "57",
            label: "Sector 57, HSVP Market (MKM Market), Gurgaon 122003 — the pickup counter",
          },
        ]}
      />
    );
    const select = screen.getByRole("combobox");
    expect(select).toHaveClass("absolute", "inset-0", "size-full", "truncate");
    expect(select.parentElement).toHaveClass("w-full", "min-w-0");
  });

  it("has no accessibility violations with an icon, a placeholder and an error", async () => {
    const { container } = render(
      <Select
        aria-label="Guests"
        icon={Users}
        placeholder="Choose a size"
        status="error"
        options={SLOTS}
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './select'`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/select/select.tsx`:

```tsx
import type { ComponentProps } from "react";

import { ChevronDown } from "lucide-react";

import type { FieldStatus } from "../../lib/field-status";
import type { IconComponent } from "../icon/icon";

import { FieldControl } from "../../lib/field-control";

export interface SelectOption {
  value: string;
  label: string;
  isDisabled?: boolean | undefined;
}

export interface SelectProps extends Omit<ComponentProps<"select">, "size" | "children"> {
  options: SelectOption[];
  /** A disabled first option, shown until something is chosen. */
  placeholder?: string | undefined;
  size?: "sm" | "md" | "lg" | undefined;
  /** The status glyph replaces the chevron; Field shows the message. */
  status?: FieldStatus | undefined;
  icon?: IconComponent | undefined;
  /**
   * Locked but readable: sunken fill and a lock. A native select cannot be read-only, so it is
   * rendered disabled — and, like any disabled control, not submitted.
   */
  readOnly?: boolean | undefined;
}

/**
 * The platform `<select>` in Input's field box (spec D7): same heights, radius, status colours and
 * glyphs. For short, known lists — outlet, table size, pickup slot. `className` styles the box;
 * every other prop, `register()` included, lands on the native select.
 */
export function Select({
  options,
  placeholder,
  size = "md",
  status = "default",
  icon,
  readOnly = false,
  disabled,
  value,
  defaultValue,
  className,
  ...props
}: SelectProps) {
  const initialValue =
    value === undefined && defaultValue === undefined && placeholder !== undefined
      ? ""
      : defaultValue;

  return (
    <FieldControl
      control="select"
      size={size}
      status={status}
      icon={icon}
      isReadOnly={readOnly}
      affordance={ChevronDown}
      className={className}
    >
      {(controlClassName) => (
        <select
          className={controlClassName}
          value={value}
          defaultValue={initialValue}
          disabled={disabled === true || readOnly}
          aria-invalid={status === "error" ? true : undefined}
          {...props}
        >
          {placeholder === undefined ? null : (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.isDisabled}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FieldControl>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 6: Stories (card parity with `Select.card.html`; docs from `Select.prompt.md`)**

`packages/ui/src/atoms/select/select.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Users } from "lucide-react";
import { expect } from "storybook/test";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Select } from "./select";

const OUTLETS = [{ value: "sector-57", label: "Sector 57, Gurgaon" }];
const GUESTS = [
  { value: "2", label: "2 guests" },
  { value: "4", label: "4 guests" },
  { value: "6", label: "6 guests" },
];
const SLOTS = [
  { value: "19:30", label: "7:30pm" },
  { value: "20:00", label: "8:00pm" },
];

const meta = {
  title: "Atoms/Select",
  component: Select,
  args: { "aria-label": "Pick your outlet", options: OUTLETS },
  render: (args) => (
    <div className="max-w-text-measure-prose w-full">
      <Select {...args} />
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Dropdown for short, known lists — outlet, table size, pickup slot. Matches Input exactly: the same heights, radius, status colours and glyphs (the status glyph replaces the chevron), `disabled`, and `readOnly` (sunken fill + lock). It is the platform's `<select>`, so phones get their own picker. For more than ~12 options use a searchable list instead. Label and message belong to Field.",
      },
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Rest: Story = { name: "rest", args: { defaultValue: "sector-57" } };

export const PlaceholderAndIcon: Story = {
  name: "placeholder + icon",
  args: { "aria-label": "Guests", icon: Users, placeholder: "Choose a size", options: GUESTS },
};

export const StatusError: Story = {
  name: "error",
  args: { "aria-label": "Time", placeholder: "Choose a slot", status: "error", options: SLOTS },
};

export const StatusSuccess: Story = {
  name: "success",
  args: { "aria-label": "Outlet", status: "success" },
};

export const StatusWarning: Story = {
  name: "warning",
  args: { "aria-label": "Outlet", status: "warning" },
};

export const ReadOnlyAndDisabled: Story = {
  name: "readOnly / disabled",
  render: () => (
    <div className="max-w-text-measure-prose grid w-full gap-3">
      <Select aria-label="Outlet" readOnly options={OUTLETS} />
      <Select
        aria-label="Delivery slot"
        disabled
        options={[{ value: "none", label: "Not available yet" }]}
      />
    </div>
  ),
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="max-w-text-measure-prose grid w-full gap-3">
      <Select aria-label="Outlet, small" size="sm" options={OUTLETS} />
      <Select aria-label="Outlet, large" size="lg" options={OUTLETS} />
    </div>
  ),
};

/** Review focus 2: a long label truncates inside the box; the box never outgrows a 360px phone. */
export const LongLabelAt360: Story = {
  name: "long option label at 360px",
  args: {
    "aria-label": "Pick your outlet",
    options: [
      {
        value: "57",
        label: "Sector 57, HSVP Market (MKM Market), Gurgaon 122003 — the pickup counter",
      },
    ],
  },
  render: (args) => (
    <div data-testid="frame" className="w-90">
      <Select {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const frame = canvas.getByTestId("frame");
    const box = canvas.getByRole("combobox", { name: "Pick your outlet" }).parentElement;
    await expect(box?.getBoundingClientRect().width).toBeLessThanOrEqual(
      frame.getBoundingClientRect().width
    );
    await expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth);
  },
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Select aria-label="Guests" icon={Users} placeholder="Choose a size" options={GUESTS} />
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { Select, type SelectOption, type SelectProps } from "./atoms/select/select";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/select
```

Run the gate, then the story tests (this task adds a `play`): `pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache 2>&1 | tail -10`. Expected: both green; `Atoms/Select › long option label at 360px` passes.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui
git commit -m "feat(ui): add the Select atom in Input's field box

A native select overlaying the shared field box: a click anywhere opens it,
a long option label truncates instead of widening the layout (measured at
360px by a story play), and the status glyph replaces the chevron. readOnly
renders the lock and the sunken fill; a native select cannot be read-only,
so it is disabled.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Checkbox — and the shared choice row

**Files:**

- Create: `packages/design-tokens/tokens/component/choice.json`
- Modify: `packages/design-tokens/tokens/component/control.json`
- Create: `packages/ui/src/lib/choice-control.tsx`
- Create: `packages/ui/src/atoms/checkbox/checkbox.tsx`, `checkbox.test.tsx`, `checkbox.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts`, `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `formatRupees` (`@pink-paprikaa-web/utils`), `Icon`, `componentVariants`, `fakeRegister`; `transition-control`, `OnSurfaces` (Plan 2a).
- Produces: `Checkbox`, `CheckboxProps` as contract §3; `ChoiceControl`, `ChoiceControlProps`, `choiceVariants`, `joinIds(...ids)` (`lib/choice-control.tsx` — Radio and Switch use them in Tasks 5–6: props `type: "checkbox" | "radio"`, `control: ReactNode`, `label`, `description`, `price: string` (pre-formatted), `isInvalid`, `placement: "start" | "end"`, `isLabelHidden`, plus every native input prop).

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/choice.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "choice-box": { "$value": "22px", "$description": "The drawn box of a checkbox or a radio." }
  }
}
```

`packages/design-tokens/tokens/component/control.json` (full file after the change):

```json
{
  "text": {
    "$type": "typography",
    "control": {
      "$value": { "fontSize": "15px" },
      "$description": "Text in a md or lg field, and the label of a checkbox, radio or switch."
    },
    "control-description": {
      "$value": { "fontSize": "13px" },
      "$description": "The secondary line under a checkbox, radio or switch label."
    }
  }
}
```

In `component-variants.ts` append to `SPACING`: `"choice-box"`; to `TEXT`: `"control-description"`. Gaps are quarter steps: 12px control-to-text `gap-3`, 14px text-to-trailing-control (Switch) `gap-3.5`, 2px label-to-description `gap-0.5`.

Contrast: no new pair — labels paint `text-text-body`, descriptions `text-text-muted`, prices `text-text-heading`, all already asserted on every surface group (light, soft, ink, brand).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/checkbox/checkbox.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations, fakeRegister } from "../../../vitest.setup";
import { Checkbox } from "./checkbox";

/** The drawn box: the input's next sibling is the decorative control slot, the box sits inside. */
const boxOf = (input: HTMLElement) => input.nextElementSibling?.firstElementChild;

describe("Checkbox", () => {
  it("is a native checkbox named by its label, toggled by clicking the row", async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Masala fries on the side" />);
    const checkbox = screen.getByRole("checkbox", { name: "Masala fries on the side" });
    expect(checkbox).not.toBeChecked();
    await user.click(screen.getByText("Masala fries on the side"));
    expect(checkbox).toBeChecked();
  });

  it("toggles with the space bar and rings its box on keyboard focus", async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Order updates by SMS" />);
    await user.tab();
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveFocus();
    await user.keyboard(" ");
    expect(checkbox).toBeChecked();
    expect(boxOf(checkbox)).toHaveClass("group-has-focus-visible/choice:outline-2");
  });

  it("draws the checked state as a pink box with a white tick (CSS off the native state)", () => {
    render(<Checkbox label="Extra burnt chilli mayo" defaultChecked />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
    expect(boxOf(checkbox)).toHaveClass(
      "group-has-checked/choice:bg-pink-500",
      "group-has-checked/choice:text-ink-000"
    );
    expect(boxOf(checkbox)?.querySelector(".lucide-check")).toBeInTheDocument();
  });

  it("prints an add-on price as +₹ and includes it in the accessible name", () => {
    render(<Checkbox label="Extra burnt chilli mayo" price={40} />);
    expect(
      screen.getByRole("checkbox", { name: "Extra burnt chilli mayo +₹40" })
    ).toBeInTheDocument();
    expect(screen.getByText("+₹40")).toHaveClass("font-display", "font-bold");
  });

  it("announces the description as a description, not as part of the name", () => {
    render(
      <Checkbox label="Make it a meal" description="Adds fries and a kulhad chai." price={120} />
    );
    const checkbox = screen.getByRole("checkbox", { name: "Make it a meal +₹120" });
    expect(checkbox).toHaveAccessibleDescription("Adds fries and a kulhad chai.");
  });

  it("keeps Field's aria-describedby next to its own description", () => {
    render(
      <Checkbox
        label="I agree to the terms"
        description="Read them first."
        aria-describedby="terms-error"
      />
    );
    const ids = screen.getByRole("checkbox").getAttribute("aria-describedby")?.split(" ");
    expect(ids).toHaveLength(2);
    expect(ids).toContain("terms-error");
  });

  it("marks itself invalid and paints the box as an error", () => {
    render(<Checkbox label="I agree to the terms" isInvalid />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(boxOf(checkbox)).toHaveClass("group-has-aria-invalid/choice:border-status-danger");
  });

  it("takes react-hook-form's register(): ref, name, onChange and onBlur reach the native input", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("mayo");
    render(<Checkbox label="Extra burnt chilli mayo" {...field} />);
    const checkbox = screen.getByRole("checkbox");

    expect(field.ref).toHaveBeenCalledWith(checkbox);
    expect(checkbox).toHaveAttribute("name", "mayo");
    await user.click(checkbox);
    expect(field.onChange).toHaveBeenCalledTimes(1);
    await user.tab();
    expect(field.onBlur).toHaveBeenCalledTimes(1);
  });

  it("disables the whole row with a real fill, never opacity", () => {
    render(<Checkbox label="Truffle oil" description="Sold out today." disabled />);
    const checkbox = screen.getByRole("checkbox", { name: "Truffle oil" });
    expect(checkbox).toBeDisabled();
    expect(checkbox.closest("label")).toHaveClass(
      "has-disabled:cursor-not-allowed",
      "has-disabled:text-ink-400"
    );
    expect(boxOf(checkbox)).toHaveClass("group-has-disabled/choice:bg-ink-200");
  });

  it("puts className on the row, not the input", () => {
    render(<Checkbox label="Extra mayo" className="w-full" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toHaveClass("w-full");
    expect(checkbox.closest("label")).toHaveClass("w-full");
  });

  it("has no accessibility violations checked, priced, described and invalid", async () => {
    const { container } = render(
      <Checkbox
        label="Make it a meal"
        description="Adds fries and a kulhad chai."
        price={120}
        defaultChecked
        isInvalid
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './checkbox'`.

- [ ] **Step 4: Implement**

`packages/ui/src/lib/choice-control.tsx`:

```tsx
import { type ComponentProps, type ReactNode, useId } from "react";

import { componentVariants } from "./component-variants";

/**
 * The one choice row — Checkbox, Radio and Switch. A <label> holds a visually hidden native input,
 * the drawn control, the label, an optional description and an optional price. Every state is CSS
 * off that input (`group-has-checked/choice:`, `group-has-focus-visible/choice:`,
 * `group-has-disabled/choice:`, `group-has-aria-invalid/choice:`), so the controls stay server
 * components and work controlled, uncontrolled or through react-hook-form alike.
 */
export const choiceVariants = componentVariants({
  slots: {
    root: "group/choice relative flex cursor-pointer font-body text-text-body has-disabled:cursor-not-allowed has-disabled:text-ink-400",
    input: "sr-only",
    control: "flex shrink-0",
    text: "text-control flex min-w-0 flex-1 flex-col gap-0.5 font-medium",
    description:
      "text-control-description font-regular text-text-muted group-has-disabled/choice:text-ink-400",
    price:
      "shrink-0 font-display text-body-sm font-bold text-text-heading group-has-disabled/choice:text-ink-400",
  },
  variants: {
    /** Where the drawn control sits: before the text (checkbox, radio) or after it (switch). */
    placement: {
      start: { root: "items-start gap-3", control: "mt-px" },
      end: { root: "items-center gap-3.5", control: "order-last" },
    },
    isLabelHidden: { true: { text: "sr-only" } },
  },
  defaultVariants: { placement: "start", isLabelHidden: false },
});

/** A space-separated id list for `aria-describedby`, or undefined when there is none. */
export function joinIds(...ids: (string | undefined)[]): string | undefined {
  const joined = ids.filter((id) => id !== undefined && id !== "").join(" ");
  return joined === "" ? undefined : joined;
}

export interface ChoiceControlProps extends Omit<ComponentProps<"input">, "size" | "type"> {
  type: "checkbox" | "radio";
  /** The drawn box, ring or track. Decorative: the native input carries every semantic. */
  control: ReactNode;
  label: ReactNode;
  /** Announced as the input's description and kept out of its name. */
  description?: ReactNode;
  /** Already formatted ("+₹60", "₹280"); part of the accessible name. */
  price?: string | undefined;
  /** Sets `aria-invalid`; the box turns red through CSS. */
  isInvalid?: boolean | undefined;
  /** Where the drawn control sits: before the text (checkbox, radio) or after it (switch). */
  placement?: "start" | "end" | undefined;
  /** Hides the text visually; it stays the accessible name. */
  isLabelHidden?: boolean | undefined;
}

/** `className` styles the row; every other prop lands on the native input. */
export function ChoiceControl({
  type,
  control,
  label,
  description,
  price,
  isInvalid = false,
  placement,
  isLabelHidden,
  className,
  "aria-describedby": describedBy,
  ...props
}: ChoiceControlProps) {
  const descriptionId = useId();
  const styles = choiceVariants({ placement, isLabelHidden });

  return (
    <label className={styles.root({ className })}>
      <input
        type={type}
        className={styles.input()}
        aria-invalid={isInvalid ? true : undefined}
        aria-describedby={joinIds(
          description === undefined ? undefined : descriptionId,
          describedBy
        )}
        {...props}
      />
      <span aria-hidden="true" className={styles.control()}>
        {control}
      </span>
      <span className={styles.text()}>
        {label}
        {description === undefined ? null : (
          // aria-hidden keeps the description out of the label's name; the input's
          // aria-describedby still announces it (a referenced node is read even when hidden).
          <span id={descriptionId} aria-hidden="true" className={styles.description()}>
            {description}
          </span>
        )}
      </span>
      {price === undefined ? null : (
        <>
          {" "}
          <span className={styles.price()}>{price}</span>
        </>
      )}
    </label>
  );
}
```

(The `{" "}` before the price is what makes the accessible name "Extra mayo +₹40" rather than "Extra mayo+₹40"; a whitespace-only text node in a flex row is not rendered.)

`packages/ui/src/atoms/checkbox/checkbox.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { Check } from "lucide-react";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { ChoiceControl } from "../../lib/choice-control";
import { componentVariants } from "../../lib/component-variants";
import { Icon } from "../icon/icon";

/** 22px, 6px radius, 2px border; checked is pink with a white 14px tick. */
const box = componentVariants({
  base: [
    "size-choice-box transition-control grid place-items-center rounded-sm border-2 border-border-default bg-ink-000 text-transparent",
    "group-has-checked/choice:border-pink-500 group-has-checked/choice:bg-pink-500 group-has-checked/choice:text-ink-000",
    "group-has-focus-visible/choice:outline-2 group-has-focus-visible/choice:outline-offset-2 group-has-focus-visible/choice:outline-focus",
    "group-has-disabled/choice:border-ink-200 group-has-disabled/choice:bg-ink-200 group-has-checked/choice:group-has-disabled/choice:text-ink-400",
    "group-has-aria-invalid/choice:border-status-danger",
  ],
});

export interface CheckboxProps extends Omit<ComponentProps<"input">, "type" | "size"> {
  label: ReactNode;
  /** Secondary line under the label, announced as the description. */
  description?: ReactNode;
  /** Add-on price in whole rupees; renders as "+₹60". */
  price?: number | undefined;
  /** Paints the box as an error and sets `aria-invalid`. Field shows what to do next. */
  isInvalid?: boolean | undefined;
}

/** Multi-select choice — menu add-ons, dietary preferences, consent. */
export function Checkbox({ price, ...props }: CheckboxProps) {
  return (
    <ChoiceControl
      type="checkbox"
      control={
        <span className={box()}>
          <Icon icon={Check} size="xs" />
        </span>
      }
      price={price === undefined ? undefined : `+${formatRupees(price)}`}
      {...props}
    />
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 6: Stories (card parity with `Checkbox.card.html`; docs from `Checkbox.prompt.md`)**

`packages/ui/src/atoms/checkbox/checkbox.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Checkbox } from "./checkbox";

const meta = {
  title: "Atoms/Checkbox",
  component: Checkbox,
  args: { label: "Extra burnt chilli mayo" },
  parameters: {
    docs: {
      description: {
        component:
          "Multi-select choice — menu add-ons, dietary preferences, consent. Pass `price` for add-ons; it right-aligns as `+₹40` in Poppins 700 and is part of the accessible name. `description` is announced as the description. `isInvalid` paints the box red and sets `aria-invalid`; the message that says what to do next belongs to Field. Disabled is a real fill, never opacity. Use Radio when exactly one option must be chosen.",
      },
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { args: { price: 40 } };

export const CheckedAndUnchecked: Story = {
  name: "checked / not",
  render: () => (
    <div className="grid gap-3">
      <Checkbox label="Extra burnt chilli mayo" defaultChecked />
      <Checkbox label="Masala fries on the side" />
    </div>
  ),
};

export const Price: Story = { name: "price", args: { price: 40, defaultChecked: true } };

export const Description: Story = {
  name: "description",
  args: {
    label: "Make it a meal",
    description: "Adds fries and a kulhad chai.",
    price: 120,
  },
};

export const Invalid: Story = {
  name: "error",
  args: { label: "I agree to the terms", isInvalid: true },
};

export const Disabled: Story = {
  name: "disabled",
  args: { label: "Truffle oil", description: "Sold out today.", disabled: true },
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Checkbox
        label="Make it a meal"
        description="Adds fries and a kulhad chai."
        price={120}
        defaultChecked
      />
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { Checkbox, type CheckboxProps } from "./atoms/checkbox/checkbox";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/checkbox packages/ui/src/lib/choice-control.tsx packages/design-tokens/tokens/component
```

Run the gate. Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the Checkbox atom on a shared choice row

ChoiceControl is the one label row Checkbox, Radio and Switch share: a
hidden native input, the drawn control, label, description and price.
Checked, focus, disabled and invalid are CSS off the native input, so the
controls stay server components and register() works unmodified. The
description is announced as a description, not folded into the name.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Radio and RadioGroup

**Files:**

- Create: `packages/ui/src/atoms/radio/radio.tsx`, `radio.test.tsx`, `radio.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `ChoiceControl`, `joinIds` (Task 4); `FIELD_STATUS_ICON`, `FieldStatus`; `formatRupees`; `Icon`; `OnSurfaces` (Plan 2a).
- Produces: `Radio`, `RadioProps`, `RadioGroup`, `RadioGroupProps` as contract §3, plus `RadioGroupProps.message` (deviation 2). `RadioGroup` renders `<fieldset role="radiogroup">` + `<legend>`; `status="error"` sets `aria-invalid` on the group and every radio's ring turns red through `in-aria-invalid:`; a `disabled` group disables every radio natively.

- [ ] **Step 1: Component tokens**

None new: the ring reuses `choice-box`; `border-6` is the design system's 6px checked ring. The group message paints `text-text-danger` / `-success` / `-warning` / `-subtle` on light grounds — already in the `light-text` contrast group. No list names.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/radio/radio.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations, fakeRegister } from "../../../vitest.setup";
import { Radio, RadioGroup, type RadioGroupProps } from "./radio";

const ringOf = (input: HTMLElement) => input.nextElementSibling?.firstElementChild;

/** The card's "group" row as a fixture: the legend and options are fixed, the rest is the test's. */
function Portion(props: Omit<RadioGroupProps, "legend" | "children">) {
  return (
    <RadioGroup legend="Portion" {...props}>
      <Radio name="size" value="regular" label="Regular" price={280} defaultChecked />
      <Radio name="size" value="sharing" label="Sharing" price={440} description="Feeds two." />
    </RadioGroup>
  );
}

describe("Radio", () => {
  it("is a native radio named by its label and absolute price", () => {
    render(<Radio name="size" value="regular" label="Regular" price={280} />);
    expect(screen.getByRole("radio", { name: "Regular ₹280" })).toBeInTheDocument();
  });

  it("draws checked as a 6px pink ring, not a filled dot", () => {
    render(<Radio name="heat" value="hot" label="Hot" defaultChecked />);
    expect(ringOf(screen.getByRole("radio"))).toHaveClass(
      "group-has-checked/choice:border-6",
      "group-has-checked/choice:border-pink-500"
    );
  });

  it("describes an option with its description", () => {
    render(<Portion />);
    expect(screen.getByRole("radio", { name: "Sharing ₹440" })).toHaveAccessibleDescription(
      "Feeds two."
    );
  });

  it("moves the choice with the arrow keys, as native radios do", async () => {
    const user = userEvent.setup();
    render(<Portion />);
    await user.tab();
    expect(screen.getByRole("radio", { name: "Regular ₹280" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "Sharing ₹440" })).toBeChecked();
  });

  it("takes react-hook-form's register() on every option of the field", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("size");
    render(
      <RadioGroup legend="Portion">
        <Radio value="regular" label="Regular" {...field} />
        <Radio value="sharing" label="Sharing" {...field} />
      </RadioGroup>
    );
    const [regular, sharing] = screen.getAllByRole("radio");

    expect(field.ref).toHaveBeenCalledWith(regular);
    expect(field.ref).toHaveBeenCalledWith(sharing);
    expect(sharing).toHaveAttribute("name", "size");
    await user.click(screen.getByText("Sharing"));
    expect(field.onChange).toHaveBeenCalledTimes(1);
    await user.tab();
    expect(field.onBlur).toHaveBeenCalledTimes(1);
  });
});

describe("RadioGroup", () => {
  it("is a radiogroup named by its legend", () => {
    render(<Portion />);
    expect(screen.getByRole("radiogroup", { name: "Portion" })).toBeInTheDocument();
  });

  it("can hide the legend visually and keep the name", () => {
    render(<Portion isLegendHidden />);
    expect(screen.getByText("Portion")).toHaveClass("sr-only");
    expect(screen.getByRole("radiogroup", { name: "Portion" })).toBeInTheDocument();
  });

  it.each([
    ["vertical", "flex-col"],
    ["horizontal", "flex-row"],
  ] as const)("lays options out %s", (orientation, layout) => {
    render(<Portion orientation={orientation} />);
    expect(
      screen.getByRole("radio", { name: "Regular ₹280" }).closest("label")?.parentElement
    ).toHaveClass(layout);
  });

  it("carries an error for the whole group: aria-invalid, red rings, glyph and message", () => {
    const { container } = render(<Portion status="error" message="Pick a portion to continue." />);
    const group = screen.getByRole("radiogroup", { name: "Portion" });
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAccessibleDescription("Pick a portion to continue.");
    expect(container.querySelector(".lucide-circle-alert")).toBeInTheDocument();
    expect(ringOf(screen.getByRole("radio", { name: "Regular ₹280" }))).toHaveClass(
      "in-aria-invalid:border-status-danger"
    );
  });

  it("shows a message without a status as a plain hint", () => {
    const { container } = render(<Portion message="Both come with rice." />);
    expect(screen.getByRole("radiogroup")).not.toHaveAttribute("aria-invalid");
    expect(screen.getByText("Both come with rice.")).toHaveClass("text-text-subtle");
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("disables every option at once through the fieldset", () => {
    render(<Portion disabled />);
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
  });

  it("has no accessibility violations with an error and a message", async () => {
    const { container } = render(<Portion status="error" message="Pick a portion to continue." />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './radio'`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/radio/radio.tsx`:

```tsx
import { type ComponentProps, type ReactNode, useId } from "react";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { ChoiceControl, joinIds } from "../../lib/choice-control";
import { componentVariants } from "../../lib/component-variants";
import { FIELD_STATUS_ICON, type FieldStatus } from "../../lib/field-status";
import { Icon } from "../icon/icon";

/** 22px circle; checked is a 6px pink ring around a white centre — never a filled dot. */
const ring = componentVariants({
  base: [
    "size-choice-box rounded-pill border-2 border-border-default bg-ink-000 transition-all duration-fast ease-out",
    "group-has-checked/choice:border-6 group-has-checked/choice:border-pink-500",
    "group-has-focus-visible/choice:outline-2 group-has-focus-visible/choice:outline-offset-2 group-has-focus-visible/choice:outline-focus",
    "group-has-disabled/choice:border-ink-200 group-has-disabled/choice:bg-ink-200 group-has-checked/choice:group-has-disabled/choice:border-ink-400",
    "group-has-aria-invalid/choice:border-status-danger in-aria-invalid:border-status-danger",
  ],
});

const radioGroup = componentVariants({
  slots: {
    root: "min-w-0",
    legend: "mb-3 font-body text-body-sm font-medium text-text-body",
    options: "flex gap-3",
    message: "mt-2 mb-0 flex max-w-none items-center gap-1.5 font-body text-caption",
  },
  variants: {
    orientation: {
      vertical: { options: "flex-col" },
      horizontal: { options: "flex-row flex-wrap gap-x-6" },
    },
    status: {
      default: { message: "text-text-subtle" },
      error: { message: "text-text-danger" },
      success: { message: "text-text-success" },
      warning: { message: "text-text-warning" },
    },
    isLegendHidden: { true: { legend: "sr-only" } },
  },
  defaultVariants: { orientation: "vertical", status: "default", isLegendHidden: false },
});

export interface RadioProps extends Omit<ComponentProps<"input">, "type" | "size"> {
  label: ReactNode;
  description?: ReactNode;
  /** Absolute price of this option in whole rupees; renders as "₹280". */
  price?: number | undefined;
  isInvalid?: boolean | undefined;
}

/** Exactly-one choice — portion size, spice level, payment method. Give a group one shared `name`. */
export function Radio({ price, ...props }: RadioProps) {
  return (
    <ChoiceControl
      type="radio"
      control={<span className={ring()} />}
      price={price === undefined ? undefined : formatRupees(price)}
      {...props}
    />
  );
}

export interface RadioGroupProps extends ComponentProps<"fieldset"> {
  legend: ReactNode;
  isLegendHidden?: boolean | undefined;
  orientation?: "vertical" | "horizontal" | undefined;
  /** `error` marks the group invalid and turns every ring red. */
  status?: FieldStatus | undefined;
  /** Shown under the options with the status glyph, and read as the group's description. */
  message?: ReactNode;
}

/** A `<fieldset>` + `<legend>` around Radios, exposed as a radiogroup. */
export function RadioGroup({
  legend,
  isLegendHidden = false,
  orientation = "vertical",
  status = "default",
  message,
  className,
  children,
  "aria-describedby": describedBy,
  ...props
}: RadioGroupProps) {
  const messageId = useId();
  const styles = radioGroup({ orientation, status, isLegendHidden });
  const statusIcon = status === "default" ? undefined : FIELD_STATUS_ICON[status];

  return (
    <fieldset
      role="radiogroup"
      aria-invalid={status === "error" ? true : undefined}
      aria-describedby={joinIds(message === undefined ? undefined : messageId, describedBy)}
      className={styles.root({ className })}
      {...props}
    >
      <legend className={styles.legend()}>{legend}</legend>
      <div className={styles.options()}>{children}</div>
      {message === undefined ? null : (
        <p id={messageId} className={styles.message()}>
          {statusIcon === undefined ? null : <Icon icon={statusIcon} size="xs" />}
          {message}
        </p>
      )}
    </fieldset>
  );
}
```

(`role="radiogroup"` on a fieldset is allowed by ARIA in HTML and by jsx-a11y's recommended mapping; it is what lets `aria-invalid` sit on the group.)

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 6: Stories (card parity with `Radio.card.html`; docs from `Radio.prompt.md`)**

`packages/ui/src/atoms/radio/radio.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Radio, RadioGroup } from "./radio";

const meta = {
  title: "Atoms/Radio",
  component: Radio,
  subcomponents: { RadioGroup },
  args: { name: "playground", value: "regular", label: "Regular", price: 280 },
  parameters: {
    docs: {
      description: {
        component:
          "Exactly-one choice — portion size, spice level, payment method. Put radios in a **RadioGroup** (a `fieldset` + `legend`, 12px apart) and always give them a shared `name`. The dot is drawn as a 6px pink ring — do not swap in a filled circle. `price` is the option's absolute price. A group `status` marks every ring and reads its `message` as the group's description; a disabled group disables every option.",
      },
    },
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Group: Story = {
  name: "group",
  render: () => (
    <RadioGroup legend="Portion" isLegendHidden>
      <Radio name="size" value="regular" label="Regular" price={280} defaultChecked />
      <Radio name="size" value="sharing" label="Sharing" price={440} description="Feeds two." />
    </RadioGroup>
  ),
};

export const NoPrice: Story = {
  name: "no price",
  render: () => (
    <RadioGroup legend="Spice" isLegendHidden>
      <Radio name="heat" value="hot" label="Hot" defaultChecked />
      <Radio name="heat" value="extra-hot" label="Extra Hot" />
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  name: "disabled",
  render: () => (
    <Radio
      name="platter"
      value="family"
      label="Family platter"
      description="Weekends only."
      disabled
    />
  ),
};

export const GroupError: Story = {
  name: "group status + message",
  render: () => (
    <RadioGroup legend="Portion" status="error" message="Pick a portion to continue.">
      <Radio name="portion" value="regular" label="Regular" price={280} />
      <Radio name="portion" value="sharing" label="Sharing" price={440} />
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  name: "orientation horizontal",
  render: () => (
    <RadioGroup legend="Spice" orientation="horizontal">
      <Radio name="spice-row" value="mild" label="Mild" defaultChecked />
      <Radio name="spice-row" value="medium" label="Medium" />
      <Radio name="spice-row" value="hot" label="Hot" />
    </RadioGroup>
  ),
};

/** Unnamed radios, so each of the five grounds keeps its own checked option. */
export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Radio value="regular" label="Regular" price={280} defaultChecked />
      <Radio value="sharing" label="Sharing" price={440} />
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { Radio, RadioGroup, type RadioGroupProps, type RadioProps } from "./atoms/radio/radio";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/radio
```

Run the gate. Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui
git commit -m "feat(ui): add the Radio and RadioGroup atoms

Radio is the shared choice row with the design system's 6px ring and an
absolute price. RadioGroup is a fieldset exposed as a radiogroup, so a
group error sets aria-invalid once and every ring turns red through CSS; its
message carries the status glyph and is read as the group's description.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Switch

**Files:**

- Create: `packages/design-tokens/tokens/component/switch.json`
- Create: `packages/ui/src/atoms/switch/switch.tsx`, `switch.test.tsx`, `switch.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts`, `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `ChoiceControl` (placement `end`, `isLabelHidden`), `componentVariants`, `fakeRegister`, `OnSurfaces` (Plan 2a).
- Produces: `Switch`, `SwitchProps` as contract §3, plus `isLabelHidden?: boolean` (deviation 4). A native `<input type="checkbox" role="switch">`.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/switch.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "switch-width": { "$value": "46px", "$description": "Track width." },
    "switch-height": { "$value": "28px", "$description": "Track height." },
    "switch-knob": { "$value": "22px" }
  }
}
```

Append to `SPACING`: `"switch-width", "switch-height", "switch-knob"`. The knob's offsets are quarter steps: 3px inset `top-0.75 left-0.75`, 18px slide (46 − 22 − 2 × 3) `translate-x-4.5`. No new contrast pair (label and description as Task 4).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/switch/switch.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations, fakeRegister } from "../../../vitest.setup";
import { Switch } from "./switch";

const trackOf = (input: HTMLElement) => input.nextElementSibling?.firstElementChild;

describe("Switch", () => {
  it("is a native checkbox with role switch, named by its label", () => {
    render(<Switch label="Order updates" />);
    const toggle = screen.getByRole("switch", { name: "Order updates" });
    expect(toggle).toHaveAttribute("type", "checkbox");
    expect(toggle).not.toBeChecked();
  });

  it("sets the label first and the track last, so a column of switches aligns", () => {
    render(<Switch label="Order updates" />);
    const toggle = screen.getByRole("switch");
    expect(toggle.closest("label")).toHaveClass("items-center", "gap-3.5");
    expect(toggle.nextElementSibling).toHaveClass("order-last");
  });

  it("toggles on click and on the space bar", async () => {
    const user = userEvent.setup();
    render(<Switch label="Marketing texts" />);
    const toggle = screen.getByRole("switch");
    await user.click(screen.getByText("Marketing texts"));
    expect(toggle).toBeChecked();
    await user.keyboard(" ");
    expect(toggle).not.toBeChecked();
  });

  it("fills the track and slides the knob when on — CSS off the native state", () => {
    render(<Switch label="Order updates" defaultChecked />);
    const track = trackOf(screen.getByRole("switch"));
    expect(track).toHaveClass("group-has-checked/choice:bg-pink-500", "w-switch-width");
    expect(track?.firstElementChild).toHaveClass("group-has-checked/choice:translate-x-4.5");
  });

  it("announces its description", () => {
    render(<Switch label="Jain preferences" description="Hides onion and garlic." />);
    expect(screen.getByRole("switch", { name: "Jain preferences" })).toHaveAccessibleDescription(
      "Hides onion and garlic."
    );
  });

  it("can hide its label visually and keep it as the name", () => {
    render(<Switch label="Order updates" isLabelHidden />);
    expect(screen.getByRole("switch", { name: "Order updates" })).toBeInTheDocument();
    expect(screen.getByText("Order updates")).toHaveClass("sr-only");
  });

  it("takes react-hook-form's register(): ref, name, onChange and onBlur reach the native input", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("alerts");
    render(<Switch label="Order updates" {...field} />);
    const toggle = screen.getByRole("switch");

    expect(field.ref).toHaveBeenCalledWith(toggle);
    expect(toggle).toHaveAttribute("name", "alerts");
    await user.click(toggle);
    expect(field.onChange).toHaveBeenCalledTimes(1);
    await user.tab();
    expect(field.onBlur).toHaveBeenCalledTimes(1);
  });

  it("disables with a real fill", () => {
    render(<Switch label="Delivery updates" description="Delivery starts in 2027." disabled />);
    const toggle = screen.getByRole("switch");
    expect(toggle).toBeDisabled();
    expect(trackOf(toggle)).toHaveClass("group-has-disabled/choice:bg-ink-200");
  });

  it("has no accessibility violations on, described", async () => {
    const { container } = render(
      <Switch label="Jain preferences" description="Hides onion and garlic." defaultChecked />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './switch'`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/switch/switch.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { ChoiceControl } from "../../lib/choice-control";
import { componentVariants } from "../../lib/component-variants";

/** 46×28 track, 22px knob, 220ms slide; pink when on. */
const toggle = componentVariants({
  slots: {
    track: [
      "h-switch-height w-switch-width relative flex rounded-pill bg-ink-300 transition-colors duration-base ease-out",
      "group-has-checked/choice:bg-pink-500",
      "group-has-focus-visible/choice:outline-2 group-has-focus-visible/choice:outline-offset-2 group-has-focus-visible/choice:outline-focus",
      "group-has-disabled/choice:bg-ink-200",
    ],
    knob: "size-switch-knob absolute top-0.75 left-0.75 rounded-pill bg-ink-000 shadow-1 transition-transform duration-base ease-out group-has-checked/choice:translate-x-4.5",
  },
});

export interface SwitchProps extends Omit<ComponentProps<"input">, "type" | "size"> {
  label: ReactNode;
  description?: ReactNode;
  /** Hides the label visually — it stays the accessible name — for a row that already labels it. */
  isLabelHidden?: boolean | undefined;
}

/** Instant-effect toggle for settings; never inside a save-on-submit form. */
export function Switch(props: SwitchProps) {
  const styles = toggle();
  return (
    <ChoiceControl
      type="checkbox"
      role="switch"
      placement="end"
      control={
        <span className={styles.track()}>
          <span className={styles.knob()} />
        </span>
      }
      {...props}
    />
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 6: Stories (card parity with `Switch.card.html`; docs from `Switch.prompt.md`)**

`packages/ui/src/atoms/switch/switch.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Switch } from "./switch";

const meta = {
  title: "Atoms/Switch",
  component: Switch,
  args: { label: "Order updates" },
  render: (args) => (
    <div className="max-w-text-measure-prose w-full">
      <Switch {...args} />
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Toggle for settings that take effect immediately — never inside a save-on-submit form. The label sits left and the control right, so a column of switches aligns. 46×28 track, 22px knob, 220ms slide. `isLabelHidden` keeps the label as the accessible name when the row around it already shows one.",
      },
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const OnAndOff: Story = {
  name: "on / off",
  render: () => (
    <div className="max-w-text-measure-prose grid w-full gap-4">
      <Switch label="Order updates" defaultChecked />
      <Switch label="Marketing texts" />
    </div>
  ),
};

export const Description: Story = {
  name: "description",
  args: { label: "Jain preferences", description: "Hides onion and garlic.", defaultChecked: true },
};

export const Disabled: Story = {
  name: "disabled",
  args: { label: "Delivery updates", description: "Delivery starts in 2027.", disabled: true },
};

export const LabelHidden: Story = {
  name: "isLabelHidden",
  args: { label: "Order updates", isLabelHidden: true, defaultChecked: true },
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Switch label="Jain preferences" description="Hides onion and garlic." defaultChecked />
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { Switch, type SwitchProps } from "./atoms/switch/switch";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/switch packages/design-tokens/tokens/component/switch.json
```

Run the gate. Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the Switch atom

A native checkbox with role=switch on the shared choice row, control last
so a column of switches aligns. The track fills and the knob slides through
CSS off the native state; isLabelHidden keeps the name for a switch inside
a row that already labels it.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Slider (handoff)

Derived from the handoff calculators, which have no design-system card: `DawatCalculator.dc.html` (guests, `min 15 max 300 step 5`, white card) and `OfficeLunch.dc.html` (meals a day, `min 20 max 300 step 5`, ink section). Both are `<input type="range">`, full width, 32px tall, `accent-color: var(--pink-500)`, named by `aria-label`.

**Files:**

- Create: `packages/ui/src/atoms/slider/slider.tsx`, `slider.test.tsx`, `slider.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `componentVariants`, `fakeRegister`.
- Produces: `Slider`, `SliderProps` exactly as contract §3 (`extends Omit<ComponentProps<"input">, "type"> { label: string }`, `label` → `aria-label`).

- [ ] **Step 1: Component tokens**

None: 32px is `h-8` (scale step 8), the accent is `accent-pink-500`. No list names, no contrast pair (no text).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/slider/slider.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations, fakeRegister } from "../../../vitest.setup";
import { Slider } from "./slider";

describe("Slider", () => {
  it("is a native range named by its label", () => {
    render(<Slider label="Guests" min={15} max={300} step={5} defaultValue={60} />);
    const slider = screen.getByRole("slider", { name: "Guests" });
    expect(slider).toHaveAttribute("type", "range");
    expect(slider).toHaveAttribute("min", "15");
    expect(slider).toHaveAttribute("max", "300");
    expect(slider).toHaveAttribute("step", "5");
    expect(slider).toHaveValue("60");
  });

  it("is full width, 32px tall and brand-accented", () => {
    render(<Slider label="Guests" />);
    expect(screen.getByRole("slider")).toHaveClass("w-full", "h-8", "accent-pink-500");
  });

  it("takes react-hook-form's register(): ref, name, onChange and onBlur reach the native range", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("guests");
    render(<Slider label="Guests" min={15} max={300} step={5} {...field} />);
    const slider = screen.getByRole("slider");

    expect(field.ref).toHaveBeenCalledWith(slider);
    expect(slider).toHaveAttribute("name", "guests");
    fireEvent.change(slider, { target: { value: "120" } });
    expect(field.onChange).toHaveBeenCalledTimes(1);
    await user.tab();
    expect(slider).toHaveFocus();
    await user.tab();
    expect(field.onBlur).toHaveBeenCalledTimes(1);
  });

  it("merges a consumer className", () => {
    render(<Slider label="Meals a day" className="max-w-text-measure-prose" />);
    expect(screen.getByRole("slider")).toHaveClass("max-w-text-measure-prose", "w-full");
  });

  it("disables natively", () => {
    render(<Slider label="Guests" disabled />);
    expect(screen.getByRole("slider")).toBeDisabled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Slider label="Guests" min={15} max={300} defaultValue={60} />);
    await expectNoA11yViolations(container);
  });
});
```

(Arrow-key stepping is the platform's — a native range — so it is not re-tested here; jsdom and synthetic key events cannot drive it.)

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './slider'`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/slider/slider.tsx`:

```tsx
import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";

/** The handoff's range: full width, 32px tall, brand accent (DawatCalculator, OfficeLunch). */
const slider = componentVariants({
  base: "h-8 w-full cursor-pointer accent-pink-500 disabled:cursor-not-allowed",
});

export interface SliderProps extends Omit<ComponentProps<"input">, "type"> {
  /** Accessible name. Show the value beside it (a number or a QuantityStepper). */
  label: string;
}

/** A native `<input type="range">` (spec D7): keyboard, touch and `register()` come with it. */
export function Slider({ label, className, ...props }: SliderProps) {
  return <input type="range" aria-label={label} className={slider({ className })} {...props} />;
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 6: Stories (parity with the two handoff call sites)**

`packages/ui/src/atoms/slider/slider.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Slider } from "./slider";

const meta = {
  title: "Atoms/Slider",
  component: Slider,
  args: { label: "Guests", min: 15, max: 300, step: 5, defaultValue: 60 },
  render: (args) => (
    <div className="max-w-text-measure-prose w-full">
      <Slider {...args} />
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "From the handoff calculators: a native range for a number picked by feel — guests for a Dawat, meals a day for an office. Full width, 32px tall, the brand pink as its accent. Always show the value next to it (the number, or a QuantityStepper for exact entry); `label` names it for assistive tech. Keyboard and touch are the platform's.",
      },
    },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** DawatCalculator.dc.html — the guests range inside the white calculator card. */
export const DawatGuests: Story = {
  name: "dawat guests (white card)",
  render: (args) => (
    <div className="max-w-text-measure-prose grid w-full gap-2.5 rounded-lg border border-border-subtle bg-surface-card p-6 shadow-1">
      <span className="font-display text-body-sm font-bold text-text-heading">1. Guests</span>
      <Slider {...args} />
      <span className="font-body text-caption text-text-muted">
        Minimum 15 guests · Royal Dawat from 50
      </span>
    </div>
  ),
};

/** OfficeLunch.dc.html — the meals-a-day range on the ink cost section. */
export const OfficeMealsOnInk: Story = {
  name: "office meals a day (ink section)",
  args: { label: "Meals a day", min: 20, max: 300, step: 5, defaultValue: 40 },
  render: (args) => (
    <div
      data-surface="ink"
      className="max-w-text-measure-prose grid w-full gap-2 rounded-lg bg-surface-inverse p-6"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display font-bold text-text-heading">Meals a day</span>
        <span className="font-display text-h3 font-black text-text-brand">40</span>
      </div>
      <Slider {...args} />
    </div>
  ),
};

export const Disabled: Story = { name: "disabled", args: { disabled: true } };
```

- [ ] **Step 7: Export**

```ts
export { Slider, type SliderProps } from "./atoms/slider/slider";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/slider
```

Run the gate. Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui
git commit -m "feat(ui): add the Slider atom from the handoff calculators

The Dawat guests and office meals-a-day range, promoted into the system: a
native range, full width, 32px, brand accent, named by label. Native props
pass straight through, so register() works and keyboard and touch are the
platform's.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Spinner

**Files:**

- Create: `packages/design-tokens/tokens/component/spinner.json`
- Create: `packages/ui/src/atoms/spinner/spinner.tsx`, `spinner.test.tsx`, `spinner.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts`, `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `SymbolMark` (Plan 2a — inline SVG in `currentColor`, so the tone is a `text-*` class), `animate-mark-pulse` (Plan 1), `componentVariants`.
- Produces: `Spinner`, `SpinnerProps` as contract §3 (`role="status"`, `label` default "Loading", size sm/md/lg = 24/36/52, tone brand/ink/inverse).

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/spinner.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "spinner-sm": { "$value": "24px" },
    "spinner-md": { "$value": "36px", "$description": "The default loader." },
    "spinner-lg": { "$value": "52px", "$description": "A full-page load." }
  }
}
```

Append to `SPACING`: `"spinner-sm", "spinner-md", "spinner-lg"`. No contrast pair (no text; the mark is decorative).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/spinner/spinner.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { ARTWORK } from "../../lib/brand-artwork";
import { Spinner } from "./spinner";

const markIn = (root: HTMLElement) =>
  root.querySelector(`svg[viewBox="${ARTWORK.symbol.viewBox}"]`);

describe("Spinner", () => {
  it("is a status named Loading by default", () => {
    render(<Spinner />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it("takes its own label", () => {
    render(<Spinner label="Finding your outlet" />);
    expect(screen.getByRole("status", { name: "Finding your outlet" })).toBeInTheDocument();
  });

  it("draws the brand mark, pulsing only when motion is allowed", () => {
    const { container } = render(<Spinner />);
    const mark = markIn(container);
    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(mark).toHaveClass("motion-safe:animate-mark-pulse");
  });

  it.each([
    ["sm", "size-spinner-sm"],
    ["md", "size-spinner-md"],
    ["lg", "size-spinner-lg"],
  ] as const)("renders size %s at %s", (size, sizeClass) => {
    const { container } = render(<Spinner size={size} />);
    expect(markIn(container)).toHaveClass(sizeClass);
  });

  it.each([
    ["brand", "text-pink-500"],
    ["ink", "text-ink-900"],
    ["inverse", "text-ink-000"],
  ] as const)("paints tone %s with %s", (tone, colour) => {
    const { container } = render(<Spinner tone={tone} />);
    expect(markIn(container)).toHaveClass(colour);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Spinner label="Loading the menu" />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './spinner'`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/spinner/spinner.tsx`:

```tsx
import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";
import { SymbolMark } from "../../lib/symbol-mark";

/** The loader is the bare brand mark, pulsing at 1.2s — never a gradient ring (readme §3.8). */
const spinner = componentVariants({
  slots: {
    root: "inline-flex",
    mark: "block shrink-0 motion-safe:animate-mark-pulse",
  },
  variants: {
    size: {
      sm: { mark: "size-spinner-sm" },
      md: { mark: "size-spinner-md" },
      lg: { mark: "size-spinner-lg" },
    },
    tone: {
      brand: { mark: "text-pink-500" },
      ink: { mark: "text-ink-900" },
      inverse: { mark: "text-ink-000" },
    },
  },
  defaultVariants: { size: "md", tone: "brand" },
});

export interface SpinnerProps extends ComponentProps<"span"> {
  size?: "sm" | "md" | "lg" | undefined;
  /** `inverse` is the white mark, for pink or ink panels. */
  tone?: "brand" | "ink" | "inverse" | undefined;
  /** The status announced to assistive tech. = "Loading" */
  label?: string | undefined;
}

/** Whole-view loading. For content with a known shape, Skeleton is the better default. */
export function Spinner({
  size = "md",
  tone = "brand",
  label = "Loading",
  className,
  ...props
}: SpinnerProps) {
  const styles = spinner({ size, tone });
  return (
    <span role="status" aria-label={label} className={styles.root({ className })} {...props}>
      <SymbolMark className={styles.mark()} />
    </span>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 6: Stories (card parity with `Spinner.card.html`; docs from `Spinner.prompt.md`)**

`packages/ui/src/atoms/spinner/spinner.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Spinner } from "./spinner";

const meta = {
  title: "Atoms/Spinner",
  component: Spinner,
  parameters: {
    docs: {
      description: {
        component:
          'Whole-view loading state — the brand mark, pulsing. `md` (36px) by default; `lg` (52px) for a full-page load. `tone="inverse"` paints the white mark on pink or ink. With reduced motion the mark stays still. For content with a known shape use Skeleton instead — it is the better default.',
      },
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner size="sm" label="Loading, small" />
      <Spinner size="md" label="Loading, medium" />
      <Spinner size="lg" label="Loading, large" />
    </div>
  ),
};

export const Tones: Story = {
  name: "tone",
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner tone="brand" label="Loading, brand" />
      <Spinner tone="ink" label="Loading, ink" />
    </div>
  ),
};

export const Inverse: Story = {
  name: "inverse",
  render: () => (
    <div data-surface="brand" className="rounded-lg bg-surface-brand p-4">
      <Spinner tone="inverse" />
    </div>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { Spinner, type SpinnerProps } from "./atoms/spinner/spinner";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/spinner packages/design-tokens/tokens/component/spinner.json
```

Run the gate. Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the Spinner atom — the pulsing brand mark

The loader is the shared SymbolMark in three sizes and three tones, a
status named Loading by default, still under reduced motion.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Skeleton

**Files:**

- Create: `packages/ui/src/atoms/skeleton/skeleton.tsx`, `skeleton.test.tsx`, `skeleton.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `animate-skeleton` (Plan 1), `componentVariants`.
- Produces: `Skeleton`, `SkeletonProps` as contract §3 (variant block/circle/text, `lines` 1–6, default 3; sized by `className`; `aria-hidden`).

- [ ] **Step 1: Component tokens**

None: 16px lines are `h-4`, the 8px line gap `gap-2`, the circle `size-10`, the fill `bg-pink-100` — all on the scale. No list names, no contrast pair.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/skeleton/skeleton.test.tsx`:

```tsx
import { render } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Skeleton } from "./skeleton";

const WIDTHS = ["w-full", "w-11/12", "w-2/3", "w-5/6"];
const widthOf = (element: Element) => WIDTHS.find((width) => element.classList.contains(width));

describe("Skeleton", () => {
  it("is hidden from assistive tech — the container announces loading, not the placeholder", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("is a 16px light-pink block by default, pulsing only when motion is allowed", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild).toHaveClass(
      "h-4",
      "w-full",
      "rounded-sm",
      "bg-pink-100",
      "motion-safe:animate-skeleton"
    );
  });

  it("is sized and shaped by className", () => {
    const { container } = render(<Skeleton className="h-18 rounded-lg" />);
    expect(container.firstElementChild).toHaveClass("h-18", "rounded-lg");
    expect(container.firstElementChild).not.toHaveClass("h-4", "rounded-sm");
  });

  it("draws a circle", () => {
    const { container } = render(<Skeleton variant="circle" className="size-8" />);
    expect(container.firstElementChild).toHaveClass("rounded-pill", "size-8");
  });

  it("draws three text lines by default", () => {
    const { container } = render(<Skeleton variant="text" />);
    expect(container.firstElementChild?.children).toHaveLength(3);
  });

  it("varies the line widths, cycling, so a paragraph never reads as a grid of bars", () => {
    const { container } = render(<Skeleton variant="text" lines={6} />);
    const lines = [...(container.firstElementChild?.children ?? [])];
    expect(lines.map(widthOf)).toEqual([
      "w-full",
      "w-11/12",
      "w-2/3",
      "w-5/6",
      "w-full",
      "w-11/12",
    ]);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Skeleton variant="text" lines={3} />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './skeleton'`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/skeleton/skeleton.tsx`:

```tsx
import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";

/** The design system's line widths (100 / 92 / 68 / 84%) on Tailwind's fraction steps, cycling. */
const LINE_WIDTHS = ["w-full", "w-11/12", "w-2/3", "w-5/6"] as const;

/** Light-pink placeholders — never grey, never a gradient (readme §3.8). */
const skeleton = componentVariants({
  slots: {
    root: "",
    line: "block h-4 rounded-sm bg-pink-100 motion-safe:animate-skeleton",
  },
  variants: {
    variant: {
      block: { root: "block h-4 w-full rounded-sm bg-pink-100 motion-safe:animate-skeleton" },
      circle: { root: "block size-10 rounded-pill bg-pink-100 motion-safe:animate-skeleton" },
      text: { root: "grid gap-2" },
    },
  },
  defaultVariants: { variant: "block" },
});

export interface SkeletonProps extends ComponentProps<"div"> {
  /** = "block" */
  variant?: "text" | "block" | "circle" | undefined;
  /** Number of text lines (variant `text`). = 3 */
  lines?: 1 | 2 | 3 | 4 | 5 | 6 | undefined;
}

/** Loading placeholder, sized with `className` (`h-18 rounded-lg`, `size-8`). */
export function Skeleton({ variant = "block", lines = 3, className, ...props }: SkeletonProps) {
  const styles = skeleton({ variant });
  return (
    <div aria-hidden="true" className={styles.root({ className })} {...props}>
      {variant === "text"
        ? Array.from({ length: lines }, (_, index) => (
            <div
              key={index}
              className={styles.line({ className: LINE_WIDTHS[index % LINE_WIDTHS.length] })}
            />
          ))
        : null}
    </div>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 6: Stories (card parity with `Skeleton.card.html`; docs from `Skeleton.prompt.md`)**

`packages/ui/src/atoms/skeleton/skeleton.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Skeleton } from "./skeleton";

const meta = {
  title: "Atoms/Skeleton",
  component: Skeleton,
  render: (args) => (
    <div className="max-w-text-measure-prose w-full">
      <Skeleton {...args} />
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Loading placeholder — light-pink blocks, never grey, never a gradient spinner. Size and shape it with `className` (`h-18 rounded-lg`); `variant="text"` draws `lines` of varied width; `variant="circle"` for avatars and chips. It is hidden from assistive tech — mark the loading region `aria-busy` instead. For whole-page loads use the pulsing Spinner.',
      },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Block: Story = { name: "block", args: { className: "h-18 rounded-lg" } };

export const Lines: Story = { name: "lines", args: { variant: "text", lines: 3 } };

export const Circle: Story = {
  name: "circle",
  render: () => (
    <div className="flex items-center gap-3">
      <Skeleton variant="circle" />
      <Skeleton variant="circle" className="size-8" />
    </div>
  ),
};

export const CardShape: Story = {
  name: "card shape",
  render: () => (
    <div className="max-w-text-measure-prose flex w-full gap-3">
      <Skeleton className="h-17 w-23 shrink-0 rounded-md" />
      <Skeleton variant="text" lines={3} className="flex-1" />
    </div>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { Skeleton, type SkeletonProps } from "./atoms/skeleton/skeleton";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/skeleton
```

Run the gate. Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui
git commit -m "feat(ui): add the Skeleton atom

Light-pink block, circle and text placeholders whose lines vary in width,
sized by className, hidden from assistive tech, still under reduced motion.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: ProgressBar

**Files:**

- Create: `packages/design-tokens/tokens/component/progress-bar.json`
- Modify: `packages/design-tokens/tokens/primitive/color.json`
- Create: `packages/ui/src/atoms/progress-bar/progress-bar.tsx`, `progress-bar.test.tsx`, `progress-bar.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts`, `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `componentVariants`, `useId`.
- Produces: `ProgressBar`, `ProgressBarProps` as contract §3, plus `isLabelHidden?: boolean` (deviation 3). `role="progressbar"` named by the label (`aria-labelledby`); with `segments`, `value` counts stamps, the max is `segments` and `aria-valuetext` reads "3 of 6"; values clamp into `0…max`; a non-finite value or a max ≤ 0 throws `RangeError`.

- [ ] **Step 1: Component tokens**

In `packages/design-tokens/tokens/primitive/color.json`, inside `color.white-alpha`, insert between `"25"` and `"30"`:

```json
      "28": {
        "$value": "rgba(255, 255, 255, 0.28)",
        "$description": "The inverse progress track (design system ProgressBar)."
      },
```

`packages/design-tokens/tokens/component/progress-bar.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "progress-sm": { "$value": "6px", "$description": "Bar height inside a LoyaltyCard." },
    "progress-md": { "$value": "8px", "$description": "The default bar height." }
  },
  "text": {
    "$type": "typography",
    "progress-label": { "$value": { "fontSize": "13.5px" } }
  }
}
```

Append to `SPACING`: `"progress-sm", "progress-md"`; to `TEXT`: `"progress-label"`. The 5px gap between stamps is the quarter step `gap-1.25`.

Contrast: no new pair. The label paints `text-text-muted`, asserted on light, soft, ink and brand grounds (on brand it is `white-alpha-92`, which replaces the design system's `rgba(255,255,255,.8)` inverse label — spec §3.2.2).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/progress-bar/progress-bar.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { ProgressBar } from "./progress-bar";

describe("ProgressBar", () => {
  it("shows loyalty stamps: one segment per stamp, the earned ones filled", () => {
    render(<ProgressBar label="3 more visits and chai's on us" segments={6} value={3} />);
    const bar = screen.getByRole("progressbar", { name: "3 more visits and chai's on us" });
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "6");
    expect(bar).toHaveAttribute("aria-valuenow", "3");
    expect(bar).toHaveAttribute("aria-valuetext", "3 of 6");
    expect(bar.children).toHaveLength(6);
    expect([...bar.children].filter((segment) => segment.childElementCount > 0)).toHaveLength(3);
  });

  it("fills a continuous bar to the value's share of max", () => {
    render(<ProgressBar label="Checkout" value={70} />);
    const bar = screen.getByRole("progressbar", { name: "Checkout" });
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(bar).toHaveAttribute("aria-valuenow", "70");
    expect(bar).not.toHaveAttribute("aria-valuetext");
    expect(bar.querySelector("[style]")).toHaveAttribute("style", "width: 70%;");
  });

  it.each([
    [140, "100", "width: 100%;"],
    [-20, "0", "width: 0%;"],
  ])("clamps %d into the track", (value, now, width) => {
    render(<ProgressBar label="Checkout" value={value} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", now);
    expect(bar.querySelector("[style]")).toHaveAttribute("style", width);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects the value %d it cannot draw",
    (value) => {
      expect(() => renderToString(<ProgressBar label="Checkout" value={value} />)).toThrow(
        RangeError
      );
    }
  );

  it("rejects a max it cannot divide by", () => {
    expect(() => renderToString(<ProgressBar label="Checkout" value={0} max={0} />)).toThrow(
      RangeError
    );
  });

  it("can hide its label visually and keep the name", () => {
    render(<ProgressBar label="Upload" value={45} isLabelHidden />);
    expect(screen.getByText("Upload")).toHaveClass("sr-only");
    expect(screen.getByRole("progressbar", { name: "Upload" })).toBeInTheDocument();
  });

  it.each([
    ["brand", "bg-pink-200", "bg-pink-500"],
    ["mint", "bg-pink-200", "bg-mint"],
    ["inverse", "bg-white-alpha-28", "bg-ink-000"],
  ] as const)("paints tone %s: %s track, %s fill", (tone, track, fill) => {
    render(<ProgressBar label="Visits" segments={2} value={1} tone={tone} />);
    const [earned] = screen.getByRole("progressbar").children;
    expect(earned).toHaveClass(track);
    expect(earned?.firstElementChild).toHaveClass(fill);
  });

  it.each([
    ["sm", "h-progress-sm"],
    ["md", "h-progress-md"],
  ] as const)("renders size %s at %s", (size, height) => {
    render(<ProgressBar label="Visits" value={1} size={size} />);
    expect(screen.getByRole("progressbar")).toHaveClass(height);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <ProgressBar label="3 more visits and chai's on us" segments={6} value={3} />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './progress-bar'`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/progress-bar/progress-bar.tsx`:

```tsx
import { type ComponentProps, useId } from "react";

import { componentVariants } from "../../lib/component-variants";

/**
 * A continuous bar is one track segment holding a fill; a stamp bar is N segments, the earned
 * ones holding a full fill. One shape, one set of tone colours, both modes.
 */
const progressBar = componentVariants({
  slots: {
    root: "grid gap-2",
    label: "text-progress-label font-body text-text-muted",
    track: "flex w-full gap-1.25",
    segment: "flex-1 overflow-hidden rounded-pill",
    bar: "block h-full rounded-pill transition-all duration-slow ease-out",
    stamp:
      "block size-full rounded-pill transition-opacity duration-base ease-out starting:opacity-0",
  },
  variants: {
    tone: {
      brand: { segment: "bg-pink-200", bar: "bg-pink-500", stamp: "bg-pink-500" },
      mint: { segment: "bg-pink-200", bar: "bg-mint", stamp: "bg-mint" },
      inverse: { segment: "bg-white-alpha-28", bar: "bg-ink-000", stamp: "bg-ink-000" },
    },
    size: {
      sm: { track: "h-progress-sm" },
      md: { track: "h-progress-md" },
    },
    isLabelHidden: { true: { label: "sr-only" } },
  },
  defaultVariants: { tone: "brand", size: "md", isLabelHidden: false },
});

export interface ProgressBarProps extends ComponentProps<"div"> {
  /** Progress so far — or, with `segments`, the number of stamps earned. */
  value: number;
  /** = 100. Ignored with `segments`. */
  max?: number | undefined;
  /** Draw N discrete stamps (the loyalty pattern) instead of a continuous bar. */
  segments?: number | undefined;
  /** The progressbar's accessible name; visible unless `isLabelHidden`. */
  label: string;
  /** `inverse` on pink or ink panels. = "brand" */
  tone?: "brand" | "mint" | "inverse" | undefined;
  /** sm 6px (inside a LoyaltyCard) · md 8px. = "md" */
  size?: "sm" | "md" | undefined;
  /** Hides the label visually; it stays the accessible name. */
  isLabelHidden?: boolean | undefined;
}

/** Loyalty stamps and checkout/upload progress: pink-200 track, pink-500 fill. */
export function ProgressBar({
  value,
  max = 100,
  segments,
  label,
  tone,
  size,
  isLabelHidden,
  className,
  ...props
}: ProgressBarProps) {
  const labelId = useId();
  const total = segments ?? max;
  if (!Number.isFinite(value) || !(total > 0)) {
    throw new RangeError(
      `ProgressBar: needs a finite value and a max above 0, got ${String(value)} of ${String(total)}`
    );
  }
  const current = Math.min(Math.max(value, 0), total);
  const styles = progressBar({ tone, size, isLabelHidden });

  return (
    <div className={styles.root({ className })} {...props}>
      <span id={labelId} className={styles.label()}>
        {label}
      </span>
      <div
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-valuetext={
          segments === undefined ? undefined : `${String(current)} of ${String(segments)}`
        }
        className={styles.track()}
      >
        {segments === undefined ? (
          <span className={styles.segment()}>
            <span
              className={styles.bar()}
              style={{ width: `${String((current / total) * 100)}%` }}
            />
          </span>
        ) : (
          Array.from({ length: segments }, (_, index) => (
            <span key={index} className={styles.segment()}>
              {index < current ? <span className={styles.stamp()} /> : null}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 6: Stories (card parity with `ProgressBar.card.html`; docs from `ProgressBar.prompt.md`)**

`packages/ui/src/atoms/progress-bar/progress-bar.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProgressBar } from "./progress-bar";

const meta = {
  title: "Atoms/ProgressBar",
  component: ProgressBar,
  args: { label: "3 more visits and chai's on us", value: 3 },
  render: (args) => (
    <div className="max-w-text-measure-prose w-full">
      <ProgressBar {...args} />
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Loyalty stamps and order progress. Segmented is the loyalty pattern (`segments` + `value` = stamps earned); continuous is for checkout steps and uploads. `pink-200` track, `pink-500` fill; `tone="inverse"` on pink or ink panels, `tone="mint"` for a finished-feeling task. `label` always names the bar; `isLabelHidden` keeps it off screen.',
      },
    },
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { args: { segments: 6 } };

export const Segments: Story = { name: "segments", args: { segments: 6 } };

export const Continuous: Story = {
  name: "continuous",
  args: { label: "Checkout", value: 70, isLabelHidden: true },
};

export const ToneMint: Story = {
  name: "tone",
  args: { label: "Upload", value: 45, tone: "mint", isLabelHidden: true },
};

export const Inverse: Story = {
  name: "inverse",
  render: () => (
    <div
      data-surface="brand"
      className="max-w-text-measure-prose w-full rounded-lg bg-surface-brand p-4"
    >
      <ProgressBar label="4 of 6 visits" segments={6} value={4} tone="inverse" isLabelHidden />
    </div>
  ),
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="max-w-text-measure-prose grid w-full gap-4">
      <ProgressBar label="Loyalty card, sm" segments={6} value={3} size="sm" />
      <ProgressBar label="Loyalty card, md" segments={6} value={3} size="md" />
    </div>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { ProgressBar, type ProgressBarProps } from "./atoms/progress-bar/progress-bar";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/progress-bar packages/design-tokens/tokens
```

Run the gate. Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the ProgressBar atom — loyalty stamps and continuous progress

One segment shape serves both modes: a continuous bar is one segment with a
width-driven fill, a stamp bar is N segments with the earned ones filled.
Named by its label, clamped into range, and a value it cannot draw throws.
Adds white-alpha-28, the design system's inverse track.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Rating — and the shared brand diamond

**Files:**

- Create: `packages/design-tokens/tokens/component/brand-diamond.json`, `packages/design-tokens/tokens/component/rating.json`
- Create: `packages/ui/src/lib/brand-diamond.tsx`
- Create: `packages/ui/src/atoms/rating/rating.tsx`, `rating.test.tsx`, `rating.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts`, `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `SymbolMark` (Plan 2a), `formatCount` (`@pink-paprikaa-web/utils`), `componentVariants`.
- Produces: `Rating`, `RatingProps` as contract §3 (`role="img"` on the root, named "4.6 out of 5" — with a count, "4.6 out of 5, 2,184 reviews"); `BrandDiamond`, `BrandDiamondProps`, `BrandDiamondSize = "12px" | "14px" | "16px" | "20px" | "24px"`, `brandDiamondVariants` (`lib/brand-diamond.tsx`: `size`, `fill: "empty" | "brand" | "heat-1" … "heat-4"`) — SpiceLevel uses it in Task 12.

The geometry, from `Rating.jsx`: a square rotated 45° has a bounding box of `size × √2`. Each unit here _is_ that box, with the diamond centred inside, so units 4px apart (`gap-1`) put the diamond tips 4px apart — the jsx's `gap: size × 0.4142 + 4` — and a partial fill clipped across the unrotated box fills exactly that fraction of the diamond's width, in screen space.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/brand-diamond.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "brand-diamond-12": { "$value": "12px", "$description": "Rating sm, SpiceLevel sm." },
    "brand-diamond-14": { "$value": "14px", "$description": "SpiceLevel md." },
    "brand-diamond-16": { "$value": "16px", "$description": "Rating md." },
    "brand-diamond-20": { "$value": "20px", "$description": "SpiceLevel lg." },
    "brand-diamond-24": { "$value": "24px", "$description": "Rating lg." },
    "brand-diamond-box-12": {
      "$value": "calc(12px * 1.4142)",
      "$description": "Bounding box of a 12px diamond rotated 45°."
    },
    "brand-diamond-box-14": { "$value": "calc(14px * 1.4142)" },
    "brand-diamond-box-16": { "$value": "calc(16px * 1.4142)" },
    "brand-diamond-box-20": { "$value": "calc(20px * 1.4142)" },
    "brand-diamond-box-24": { "$value": "calc(24px * 1.4142)" }
  },
  "radius": {
    "$type": "dimension",
    "brand-diamond": { "$value": "2px", "$description": "The diamond's softened corners." }
  }
}
```

`packages/design-tokens/tokens/component/rating.json`:

```json
{
  "text": {
    "$type": "typography",
    "rating-value": {
      "$value": { "fontSize": "13.5px" },
      "$description": "The score, Poppins 700."
    },
    "rating-count": { "$value": { "fontSize": "13px" }, "$description": "The review count." }
  }
}
```

Append to `SPACING`: `"brand-diamond-12", "brand-diamond-14", "brand-diamond-16", "brand-diamond-20", "brand-diamond-24", "brand-diamond-box-12", "brand-diamond-box-14", "brand-diamond-box-16", "brand-diamond-box-20", "brand-diamond-box-24"`; to `TEXT`: `"rating-value", "rating-count"`; to `RADIUS`: `"brand-diamond"`.

The mark's scale inside a diamond (Rating.jsx: 86% under 14px, 80% to 19px, 74% from 20px) is a fraction size — `size-6/7` (85.7%), `size-4/5` (as Plan 2a's StatusDot), `size-3/4` (75%) — within 0.3px at every size. The 3px gap between bare marks (variant `symbol`) is the quarter step `gap-0.75`.

Contrast: no new pair — the score is `text-text-heading`, the count `text-text-subtle`, both asserted on every ground.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/rating/rating.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Rating } from "./rating";

/** Diamonds by fill: every unit has an empty base; filled (or partly filled) ones add a pink layer. */
const filled = (container: HTMLElement) => container.querySelectorAll(".rotate-45.bg-pink-500");
const empty = (container: HTMLElement) => container.querySelectorAll(".rotate-45.bg-ink-200");
const clips = (container: HTMLElement) =>
  [...container.querySelectorAll("[style]")].map((element) => element.getAttribute("style"));

describe("Rating", () => {
  it("is one image named with the score", () => {
    render(<Rating value={4.6} />);
    expect(screen.getByRole("img", { name: "4.6 out of 5" })).toBeInTheDocument();
  });

  it("adds the review count to the name and prints it with Indian grouping", () => {
    render(<Rating value={4.6} count={2184} />);
    expect(screen.getByRole("img", { name: "4.6 out of 5, 2,184 reviews" })).toBeInTheDocument();
    expect(screen.getByText("(2,184)")).toHaveClass("text-rating-count", "text-text-subtle");
  });

  it("shows the score to one decimal, or hides it", () => {
    const { rerender } = render(<Rating value={5} />);
    expect(screen.getByText("5.0")).toHaveClass("font-display", "font-bold");
    rerender(<Rating value={5} hasValue={false} />);
    expect(screen.queryByText("5.0")).not.toBeInTheDocument();
  });

  it("fills whole diamonds solid and clips a half one at exactly 50%, in screen space", () => {
    const { container } = render(<Rating value={4.5} />);
    expect(empty(container)).toHaveLength(5);
    expect(filled(container)).toHaveLength(5);
    expect(clips(container)).toEqual(["clip-path: inset(0 50% 0 0);"]);
  });

  it("fills 30% of the fifth diamond for 4.3", () => {
    const { container } = render(<Rating value={4.3} />);
    expect(clips(container)).toEqual(["clip-path: inset(0 70% 0 0);"]);
  });

  it("draws no fill at all for 0, and still names the score", () => {
    const { container } = render(<Rating value={0} />);
    expect(screen.getByRole("img", { name: "0 out of 5" })).toBeInTheDocument();
    expect(screen.getByText("0.0")).toBeInTheDocument();
    expect(filled(container)).toHaveLength(0);
    expect(empty(container)).toHaveLength(5);
  });

  it.each([-0.5, 5.5, Number.NaN])("rejects the impossible score %d", (value) => {
    expect(() => renderToString(<Rating value={value} />)).toThrow(RangeError);
  });

  it("rejects a max that is not a whole number of at least 1", () => {
    expect(() => renderToString(<Rating value={1} max={2.5} />)).toThrow(RangeError);
    expect(() => renderToString(<Rating value={0} max={0} />)).toThrow(RangeError);
  });

  it("honours another max", () => {
    const { container } = render(<Rating value={2} max={3} />);
    expect(screen.getByRole("img", { name: "2 out of 3" })).toBeInTheDocument();
    expect(empty(container)).toHaveLength(3);
  });

  it.each([
    ["sm", "size-brand-diamond-12", "size-brand-diamond-box-12"],
    ["md", "size-brand-diamond-16", "size-brand-diamond-box-16"],
    ["lg", "size-brand-diamond-24", "size-brand-diamond-box-24"],
  ] as const)("draws size %s diamonds at %s in a %s box", (size, diamond, box) => {
    const { container } = render(<Rating value={3} size={size} />);
    expect(container.querySelectorAll(`.${diamond}`)).toHaveLength(5 + 3);
    expect(container.querySelectorAll(`.${box}`)).toHaveLength(5 + 3);
  });

  it("puts a white mark on a filled diamond and a pink one on an empty diamond", () => {
    const { container } = render(<Rating value={1} max={2} />);
    expect(container.querySelector(".bg-pink-500 > svg")).toHaveClass("text-ink-000", "size-4/5");
    expect(container.querySelector(".bg-ink-200 > svg")).toHaveClass("text-pink-500");
  });

  it("raises the mark's opacity on small diamonds so it still resolves", () => {
    const { container, rerender } = render(<Rating value={1} max={2} size="sm" />);
    expect(container.querySelector(".bg-pink-500 > svg")).toHaveClass("opacity-85", "size-6/7");
    expect(container.querySelector(".bg-ink-200 > svg")).toHaveClass("opacity-80");
    rerender(<Rating value={1} max={2} size="lg" />);
    expect(container.querySelector(".bg-pink-500 > svg")).toHaveClass("opacity-50", "size-3/4");
  });

  it("swaps the diamonds for the bare brand mark with variant symbol", () => {
    const { container } = render(<Rating value={4.5} variant="symbol" />);
    expect(container.querySelectorAll(".rotate-45")).toHaveLength(0);
    expect(container.querySelectorAll("svg.opacity-22")).toHaveLength(5);
    expect(clips(container)).toEqual(["clip-path: inset(0 50% 0 0);"]);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Rating value={4.6} count={2184} />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './rating'`.

- [ ] **Step 4: Implement**

`packages/ui/src/lib/brand-diamond.tsx`:

```tsx
import { componentVariants } from "./component-variants";
import { SymbolMark } from "./symbol-mark";

/**
 * The brand's small diamond (readme §3.4): a square turned 45° carrying the mark — white on a
 * coloured fill, pink on the empty ink-200 fill so it never blends away. Drawn inside its bounding
 * box, so units spaced 4px apart put the tips 4px apart, and a clip across the (unrotated) box
 * fills an exact fraction of the diamond's width. Small diamonds get a bigger, stronger mark
 * (Rating.jsx / SpiceLevel.jsx `markScale`, `markAlpha`).
 */
export const brandDiamondVariants = componentVariants({
  slots: {
    unit: "relative grid shrink-0 place-items-center",
    diamond: "rounded-brand-diamond grid rotate-45 place-items-center overflow-hidden",
    mark: "-rotate-45",
  },
  variants: {
    size: {
      "12px": {
        unit: "size-brand-diamond-box-12",
        diamond: "size-brand-diamond-12",
        mark: "size-6/7",
      },
      "14px": {
        unit: "size-brand-diamond-box-14",
        diamond: "size-brand-diamond-14",
        mark: "size-4/5",
      },
      "16px": {
        unit: "size-brand-diamond-box-16",
        diamond: "size-brand-diamond-16",
        mark: "size-4/5",
      },
      "20px": {
        unit: "size-brand-diamond-box-20",
        diamond: "size-brand-diamond-20",
        mark: "size-3/4",
      },
      "24px": {
        unit: "size-brand-diamond-box-24",
        diamond: "size-brand-diamond-24",
        mark: "size-3/4",
      },
    },
    fill: {
      empty: { diamond: "bg-ink-200", mark: "text-pink-500" },
      brand: { diamond: "bg-pink-500", mark: "text-ink-000" },
      "heat-1": { diamond: "bg-heat-1", mark: "text-ink-000" },
      "heat-2": { diamond: "bg-heat-2", mark: "text-ink-000" },
      "heat-3": { diamond: "bg-heat-3", mark: "text-ink-000" },
      "heat-4": { diamond: "bg-heat-4", mark: "text-ink-000" },
    },
  },
  compoundVariants: [
    { size: "12px", fill: "empty", class: { mark: "opacity-80" } },
    {
      size: "12px",
      fill: ["brand", "heat-1", "heat-2", "heat-3", "heat-4"],
      class: { mark: "opacity-85" },
    },
    { size: ["14px", "16px"], fill: "empty", class: { mark: "opacity-62" } },
    {
      size: ["14px", "16px"],
      fill: ["brand", "heat-1", "heat-2", "heat-3", "heat-4"],
      class: { mark: "opacity-66" },
    },
    { size: ["20px", "24px"], class: { mark: "opacity-50" } },
  ],
  defaultVariants: { size: "16px", fill: "empty" },
});

export type BrandDiamondSize = "12px" | "14px" | "16px" | "20px" | "24px";

export interface BrandDiamondProps {
  size?: BrandDiamondSize | undefined;
  fill?: "empty" | "brand" | "heat-1" | "heat-2" | "heat-3" | "heat-4" | undefined;
  className?: string | undefined;
}

/** Decorative: the component that owns a row of diamonds names the whole row. */
export function BrandDiamond({ size, fill, className }: BrandDiamondProps) {
  const styles = brandDiamondVariants({ size, fill });
  return (
    <span aria-hidden="true" className={styles.unit({ className })}>
      <span className={styles.diamond()}>
        <SymbolMark className={styles.mark()} />
      </span>
    </span>
  );
}
```

`packages/ui/src/atoms/rating/rating.tsx`:

```tsx
import type { ComponentProps } from "react";

import { formatCount } from "@pink-paprikaa-web/utils";

import { BrandDiamond, type BrandDiamondSize } from "../../lib/brand-diamond";
import { componentVariants } from "../../lib/component-variants";
import { SymbolMark } from "../../lib/symbol-mark";

type RatingSize = "sm" | "md" | "lg";

/** Rating.card.html's sizes, as diamond edge lengths. */
const DIAMOND_SIZE: Readonly<Record<RatingSize, BrandDiamondSize>> = {
  sm: "12px",
  md: "16px",
  lg: "24px",
};

const rating = componentVariants({
  slots: {
    root: "inline-flex items-center gap-2",
    units: "inline-flex items-center",
    value: "text-rating-value font-display font-bold text-text-heading",
    count: "text-rating-count font-body text-text-subtle",
  },
  variants: {
    variant: {
      diamond: { units: "gap-1" },
      symbol: { units: "gap-0.75" },
    },
  },
  defaultVariants: { variant: "diamond" },
});

const symbolUnit = componentVariants({
  slots: {
    unit: "relative shrink-0",
    track: "absolute inset-0 size-full text-pink-500 opacity-22",
    fill: "absolute inset-0 size-full text-pink-500",
  },
  variants: {
    size: {
      sm: { unit: "size-brand-diamond-12" },
      md: { unit: "size-brand-diamond-16" },
      lg: { unit: "size-brand-diamond-24" },
    },
  },
  defaultVariants: { size: "md" },
});

/** Clips a fill layer to `fraction` of its unrotated box, left to right — screen space. */
function clipTo(fraction: number) {
  if (fraction >= 1) return undefined;
  const hidden = Math.round((1 - fraction) * 1000) / 10;
  return { clipPath: `inset(0 ${String(hidden)}% 0 0)` };
}

interface UnitProps {
  /** 0…1: how much of this unit is filled. */
  fill: number;
  size: RatingSize;
}

function DiamondUnit({ fill, size }: UnitProps) {
  return (
    <span className="relative grid shrink-0">
      <BrandDiamond size={DIAMOND_SIZE[size]} fill="empty" />
      {fill > 0 ? (
        <span className="absolute inset-0" style={clipTo(fill)}>
          <BrandDiamond size={DIAMOND_SIZE[size]} fill="brand" />
        </span>
      ) : null}
    </span>
  );
}

function SymbolUnit({ fill, size }: UnitProps) {
  const styles = symbolUnit({ size });
  return (
    <span className={styles.unit()}>
      <SymbolMark className={styles.track()} />
      {fill > 0 ? <SymbolMark className={styles.fill()} style={clipTo(fill)} /> : null}
    </span>
  );
}

export interface RatingProps extends ComponentProps<"span"> {
  /** 0…max; any fraction (4.3 fills 30% of the fifth diamond). */
  value: number;
  /** = 5 */
  max?: number | undefined;
  /** Review count, shown in brackets with Indian digit grouping and read in the name. */
  count?: number | undefined;
  /** sm 12 · md 16 · lg 24px diamonds. = "md" */
  size?: RatingSize | undefined;
  /** `symbol` swaps the diamond for the bare brand mark (ReviewCard, marketing artwork). */
  variant?: "diamond" | "symbol" | undefined;
  /** = true: show the score to one decimal. */
  hasValue?: boolean | undefined;
}

/** Review score: brand diamonds, not stars. One image, named with the score (and the count). */
export function Rating({
  value,
  max = 5,
  count,
  size = "md",
  variant = "diamond",
  hasValue = true,
  className,
  ...props
}: RatingProps) {
  if (!Number.isInteger(max) || max < 1 || !Number.isFinite(value) || value < 0 || value > max) {
    throw new RangeError(
      `Rating: value must be between 0 and a whole max of at least 1, got ${String(value)} of ${String(max)}`
    );
  }
  const styles = rating({ variant });
  const score = `${String(value)} out of ${String(max)}`;
  const name = count === undefined ? score : `${score}, ${formatCount(count)} reviews`;

  return (
    <span role="img" aria-label={name} className={styles.root({ className })} {...props}>
      <span className={styles.units()}>
        {Array.from({ length: max }, (_, index) => {
          const fill = Math.min(Math.max(value - index, 0), 1);
          return variant === "symbol" ? (
            <SymbolUnit key={index} fill={fill} size={size} />
          ) : (
            <DiamondUnit key={index} fill={fill} size={size} />
          );
        })}
      </span>
      {hasValue ? <span className={styles.value()}>{value.toFixed(1)}</span> : null}
      {count === undefined ? null : <span className={styles.count()}>({formatCount(count)})</span>}
    </span>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 6: Stories (card parity with `Rating.card.html`; docs from `Rating.prompt.md`)**

`packages/ui/src/atoms/rating/rating.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Rating } from "./rating";

const meta = {
  title: "Atoms/Rating",
  component: Rating,
  args: { value: 4.6 },
  parameters: {
    docs: {
      description: {
        component:
          'Review score for outlet cards and social proof. Diamonds, not stars — the brand shape; `variant="symbol"` swaps in the bare brand mark, the treatment used in ReviewCard and on marketing artwork. Partial scores fill by real percentage: the fill clips in screen space across the diamond\'s bounding box, so 4.3 fills exactly 30% of the fifth diamond. `md` (16px) is the default; below it the embedded mark stops reading, so its opacity steps up. It is one image named "4.6 out of 5" (with `count`, "…, 2,184 reviews").',
      },
    },
  },
} satisfies Meta<typeof Rating>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Values: Story = {
  name: "value",
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <Rating value={5} />
      <Rating value={4.6} />
      <Rating value={4.3} />
      <Rating value={2.5} />
    </div>
  ),
};

export const Symbol: Story = {
  name: "symbol",
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <Rating value={5} variant="symbol" />
      <Rating value={4.6} variant="symbol" />
    </div>
  ),
};

export const Count: Story = {
  name: "count",
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <Rating value={4.6} count={2184} />
      <Rating value={4.8} variant="symbol" count={912} />
    </div>
  ),
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <Rating value={4.3} size="sm" />
      <Rating value={4.3} size="md" />
      <Rating value={4.3} size="lg" />
    </div>
  ),
};

export const PartialFill: Story = {
  name: "partial fill",
  render: () => (
    <div className="flex flex-wrap items-center gap-10">
      <Rating value={4.1} size="lg" />
      <Rating value={4.5} size="lg" />
      <Rating value={4.9} size="lg" />
    </div>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { Rating, type RatingProps } from "./atoms/rating/rating";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/rating packages/ui/src/lib/brand-diamond.tsx packages/design-tokens/tokens/component
```

Run the gate. Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the Rating atom on a shared brand diamond

BrandDiamond is the rotated square carrying the shared SymbolMark, drawn in
its bounding box so a 4px gap puts the tips 4px apart and a clip across the
box fills an exact fraction in screen space (4.3 fills 30% of the fifth
diamond). Rating is one image named with the score and count; an impossible
score throws.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: SpiceLevel

**Files:**

- Create: `packages/ui/src/atoms/spice-level/spice-level.tsx`, `spice-level.test.tsx`, `spice-level.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `BrandDiamond` (Task 11), `componentVariants`, `OnSurfaces` (Plan 2a).
- Produces: `SpiceLevel`, `SpiceLevelProps` as contract §3 (`role="img"` "Spice level 3 of 4"; `hasLabel` shows Mild / Medium / Hot / Extra Hot; size sm/md/lg = 12/14/20px diamonds).

- [ ] **Step 1: Component tokens**

None new: diamonds reuse `brand-diamond.json` (12, 14, 20), the label is `text-overline`. The label paints `text-text-muted` — asserted on every ground. No list names.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/spice-level/spice-level.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { SpiceLevel } from "./spice-level";

describe("SpiceLevel", () => {
  it("is one image named with the level", () => {
    render(<SpiceLevel level={3} />);
    expect(screen.getByRole("img", { name: "Spice level 3 of 4" })).toBeInTheDocument();
  });

  it("fills the first diamonds with the level's heat colour and leaves the rest ink-200", () => {
    const { container } = render(<SpiceLevel level={3} />);
    expect(container.querySelectorAll(".rotate-45.bg-heat-3")).toHaveLength(3);
    expect(container.querySelectorAll(".rotate-45.bg-ink-200")).toHaveLength(1);
  });

  it.each([
    [1, "bg-heat-1"],
    [2, "bg-heat-2"],
    [4, "bg-heat-4"],
  ] as const)("colours level %d with %s — the heat ramp, mint to pink", (level, heat) => {
    const { container } = render(<SpiceLevel level={level} />);
    expect(container.querySelectorAll(`.rotate-45.${heat}`)).toHaveLength(level);
  });

  it.each([
    [1, "Mild"],
    [2, "Medium"],
    [3, "Hot"],
    [4, "Extra Hot"],
  ] as const)("names level %d %s with hasLabel, as an uppercase overline", (level, label) => {
    render(<SpiceLevel level={level} hasLabel />);
    expect(screen.getByText(label)).toHaveClass("uppercase", "text-overline", "text-text-muted");
  });

  it("shows no label by default", () => {
    render(<SpiceLevel level={2} />);
    expect(screen.queryByText("Medium")).not.toBeInTheDocument();
  });

  it.each([
    ["sm", "size-brand-diamond-12"],
    ["md", "size-brand-diamond-14"],
    ["lg", "size-brand-diamond-20"],
  ] as const)("draws size %s diamonds at %s", (size, diamond) => {
    const { container } = render(<SpiceLevel level={2} size={size} />);
    expect(container.querySelectorAll(`.${diamond}`)).toHaveLength(4);
  });

  it("carries a white mark on a filled diamond and a pink one on an empty diamond", () => {
    const { container } = render(<SpiceLevel level={1} />);
    expect(container.querySelector(".bg-heat-1 > svg")).toHaveClass("text-ink-000");
    expect(container.querySelector(".bg-ink-200 > svg")).toHaveClass("text-pink-500");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<SpiceLevel level={4} hasLabel />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './spice-level'`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/spice-level/spice-level.tsx`:

```tsx
import type { ComponentProps } from "react";

import { BrandDiamond, type BrandDiamondSize } from "../../lib/brand-diamond";
import { componentVariants } from "../../lib/component-variants";

type Level = 1 | 2 | 3 | 4;
type SpiceSize = "sm" | "md" | "lg";

/** Plain heat names a guest already knows (readme §2: controls never carry a word to decode). */
const SPICE_LABEL: Readonly<Record<Level, string>> = {
  1: "Mild",
  2: "Medium",
  3: "Hot",
  4: "Extra Hot",
};

/** Filled diamonds take the heat colour of the level: mint → turmeric → tandoor → pink. */
const HEAT_FILL = { 1: "heat-1", 2: "heat-2", 3: "heat-3", 4: "heat-4" } as const;

/** sm is the menu size (MenuItemRow, MenuItemCard); md the design system's default. */
const DIAMOND_SIZE: Readonly<Record<SpiceSize, BrandDiamondSize>> = {
  sm: "12px",
  md: "14px",
  lg: "20px",
};

const spiceLevel = componentVariants({
  slots: {
    root: "inline-flex items-center gap-2",
    diamonds: "inline-flex items-center gap-1",
    label: "font-display text-overline text-text-muted uppercase",
  },
});

export interface SpiceLevelProps extends ComponentProps<"span"> {
  level: Level;
  /** = 4 */
  max?: 4 | undefined;
  /** Show Mild / Medium / Hot / Extra Hot beside the diamonds. */
  hasLabel?: boolean | undefined;
  /** sm 12 · md 14 · lg 20px diamonds. = "md" */
  size?: SpiceSize | undefined;
}

/** Heat from the brand's diamond motif — the sanctioned alternative to a chilli emoji. */
export function SpiceLevel({
  level,
  max = 4,
  hasLabel = false,
  size = "md",
  className,
  ...props
}: SpiceLevelProps) {
  const styles = spiceLevel();
  return (
    <span
      role="img"
      aria-label={`Spice level ${String(level)} of ${String(max)}`}
      className={styles.root({ className })}
      {...props}
    >
      <span className={styles.diamonds()}>
        {Array.from({ length: max }, (_, index) => (
          <BrandDiamond
            key={index}
            size={DIAMOND_SIZE[size]}
            fill={index < level ? HEAT_FILL[level] : "empty"}
          />
        ))}
      </span>
      {hasLabel ? <span className={styles.label()}>{SPICE_LABEL[level]}</span> : null}
    </span>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 6: Stories (card parity with `SpiceLevel.card.html`; docs from `SpiceLevel.prompt.md`)**

`packages/ui/src/atoms/spice-level/spice-level.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { SpiceLevel } from "./spice-level";

const LEVELS = [1, 2, 3, 4] as const;

const meta = {
  title: "Atoms/SpiceLevel",
  component: SpiceLevel,
  args: { level: 3 },
  parameters: {
    docs: {
      description: {
        component:
          'Heat indicator built from the brand\'s diamond motif — never a chilli emoji. Filled diamonds take the heat colour of the level (mint → turmeric → tandoor → pink); the rest sit in ink-200, each carrying the brand mark. `hasLabel` adds the plain name: Mild, Medium, Hot, Extra Hot. `sm` (12px) is the menu size, `md` (14px) the default. One image, named "Spice level 3 of 4".',
      },
    },
  },
} satisfies Meta<typeof SpiceLevel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Levels: Story = {
  name: "level",
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      {LEVELS.map((level) => (
        <SpiceLevel key={level} level={level} />
      ))}
    </div>
  ),
};

export const WithLabel: Story = {
  name: "hasLabel",
  render: () => (
    <div className="grid gap-3">
      {LEVELS.map((level) => (
        <SpiceLevel key={level} level={level} hasLabel />
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <SpiceLevel level={3} size="sm" />
      <SpiceLevel level={3} size="md" />
      <SpiceLevel level={3} size="lg" />
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <SpiceLevel level={3} hasLabel />
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { SpiceLevel, type SpiceLevelProps } from "./atoms/spice-level/spice-level";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/spice-level
```

Run the gate. Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui
git commit -m "feat(ui): add the SpiceLevel atom

Four brand diamonds on the heat ramp, the filled ones in the level's colour
with a white mark, the rest ink-200 with a pink one; an optional plain label
(Mild to Extra Hot). One image named with the level.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: DietMark (veg only)

The kitchen is pure veg — not even egg (spec C10, owner 2026-09-27). The design system's `type="egg"` variant is **not built**; `DietMark.card.html`'s "egg" row has no story, and the docs say why.

**Files:**

- Create: `packages/design-tokens/tokens/component/diet-mark.json`
- Create: `packages/ui/src/atoms/diet-mark/diet-mark.tsx`, `diet-mark.test.tsx`, `diet-mark.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts`, `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `componentVariants`, `--color-veg`.
- Produces: `DietMark`, `DietMarkProps` as contract §3 (`role="img"`, `label` default "Vegetarian", size sm/md/lg = 14/16/20px).

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/diet-mark.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "diet-mark-sm": {
      "$value": "14px",
      "$description": "Beside a dish name in a menu row or card."
    },
    "diet-mark-md": { "$value": "16px", "$description": "The default mark." },
    "diet-mark-lg": { "$value": "20px" }
  }
}
```

Append to `SPACING`: `"diet-mark-sm", "diet-mark-md", "diet-mark-lg"`. No contrast pair (a non-text mark; `veg` on white is 5.4:1 regardless).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/diet-mark/diet-mark.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { DietMark } from "./diet-mark";

describe("DietMark", () => {
  it("is an image named Vegetarian", () => {
    render(<DietMark />);
    expect(screen.getByRole("img", { name: "Vegetarian" })).toBeInTheDocument();
  });

  it("draws the statutory square and dot in the veg green", () => {
    const { container } = render(<DietMark />);
    expect(screen.getByRole("img")).toHaveClass("text-veg");
    expect(container.querySelector("rect")).toHaveAttribute("stroke", "currentColor");
    expect(container.querySelector("rect")).toHaveAttribute("fill", "none");
    expect(container.querySelector("circle")).toHaveAttribute("fill", "currentColor");
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it.each([
    ["sm", "size-diet-mark-sm"],
    ["md", "size-diet-mark-md"],
    ["lg", "size-diet-mark-lg"],
  ] as const)("renders size %s at %s", (size, sizeClass) => {
    render(<DietMark size={size} />);
    expect(screen.getByRole("img")).toHaveClass(sizeClass);
  });

  it("takes another label", () => {
    render(<DietMark label="Pure vegetarian" />);
    expect(screen.getByRole("img", { name: "Pure vegetarian" })).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<DietMark />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './diet-mark'`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/diet-mark/diet-mark.tsx`:

```tsx
import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";

const dietMark = componentVariants({
  base: "inline-flex shrink-0 text-veg",
  variants: {
    size: { sm: "size-diet-mark-sm", md: "size-diet-mark-md", lg: "size-diet-mark-lg" },
  },
  defaultVariants: { size: "md" },
});

export interface DietMarkProps extends ComponentProps<"span"> {
  /** sm 14px (beside a dish name) · md 16px · lg 20px. = "md" */
  size?: "sm" | "md" | "lg" | undefined;
  /** = "Vegetarian" */
  label?: string | undefined;
}

/**
 * The statutory Indian vegetarian mark: a green square outline with a green dot at half its size.
 * The only diet mark in this system — the kitchen is pure veg, not even egg (spec C10). The
 * outline keeps a 1.5px stroke at every size (non-scaling stroke), as the design system's border.
 */
export function DietMark({
  size = "md",
  label = "Vegetarian",
  className,
  ...props
}: DietMarkProps) {
  return (
    <span role="img" aria-label={label} className={dietMark({ size, className })} {...props}>
      <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className="size-full">
        <rect
          x="0.75"
          y="0.75"
          width="14.5"
          height="14.5"
          rx="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx="8" cy="8" r="4" fill="currentColor" />
      </svg>
    </span>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 6: Stories (card parity with `DietMark.card.html`, egg row excluded; docs from `DietMark.prompt.md`)**

`packages/ui/src/atoms/diet-mark/diet-mark.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { DietMark } from "./diet-mark";

const meta = {
  title: "Atoms/DietMark",
  component: DietMark,
  parameters: {
    docs: {
      description: {
        component:
          "The statutory Indian vegetarian mark — a green square and dot. Every menu item on every surface carries one. Pink Paprikaa is a pure-veg kitchen, not even egg, so this is the only diet mark in the system: the design system's egg variant is not built (spec C10) and no non-veg mark may be added. Never substitute an emoji or a coloured pill. `sm` (14px) sits beside a dish name.",
      },
    },
  },
} satisfies Meta<typeof DietMark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Veg: Story = {
  name: "veg",
  render: () => (
    <div className="flex items-center gap-4">
      <DietMark size="sm" />
      <DietMark size="md" />
      <DietMark size="lg" />
    </div>
  ),
};

export const InContext: Story = {
  name: "in context",
  render: () => (
    <span className="flex items-center gap-2">
      <DietMark size="sm" />
      <span className="font-display text-h4 text-text-heading">Paprikaa Chilli Paneer</span>
    </span>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { DietMark, type DietMarkProps } from "./atoms/diet-mark/diet-mark";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/diet-mark packages/design-tokens/tokens/component/diet-mark.json
```

Run the gate. Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the DietMark atom — the veg mark only

The statutory green square and dot, drawn once as an SVG with a
non-scaling stroke, named Vegetarian. The design system's egg variant is
not built: the kitchen is pure veg, not even egg.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 14: PriceTag

**Files:**

- Create: `packages/design-tokens/tokens/component/price-tag.json`
- Modify: `packages/design-tokens/contrast-pairs.json`
- Create: `packages/ui/src/atoms/price-tag/price-tag.tsx`, `price-tag.test.tsx`, `price-tag.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts`, `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `formatRupees`, `formatRupeeRange` (`@pink-paprikaa-web/utils`; the range already throws on a backwards range), `componentVariants`, `OnSurfaces` (Plan 2a).
- Produces: `PriceTag`, `PriceTagProps` as contract §3. `was` must be higher than the price it strikes (`to ?? amount`) or it throws `RangeError`. The size lives on the root (`text-price-*`) and the amount and struck price are `em`-relative, so a consumer class (`text-canvas-h2` on an artboard) scales the whole tag.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/price-tag.json`:

```json
{
  "text": {
    "$type": "typography",
    "price-sm": { "$value": { "fontSize": "14px" } },
    "price-md": { "$value": { "fontSize": "17px" }, "$description": "The default price." },
    "price-lg": { "$value": { "fontSize": "22px" } },
    "price-canvas": {
      "$value": { "fontSize": "56px" },
      "$description": "A price on a 1080px artboard (FeedArtboards DishLaunchPost), under a canvas-h1 headline."
    },
    "price-amount": {
      "$value": { "fontSize": "1em", "letterSpacing": "-0.01em" },
      "$description": "The amount, relative to the tag's size, so one class on the tag scales the whole price."
    },
    "price-was": {
      "$value": { "fontSize": "0.78em" },
      "$description": "The struck original: 78% of the amount."
    }
  }
}
```

Append to `TEXT`: `"price-sm", "price-md", "price-lg", "price-canvas", "price-amount", "price-was"`.

Contrast — `tone="inverse"` paints `text-text-on-inverse` (white) on the brand pink as well as on ink. Append to `packages/design-tokens/contrast-pairs.json` → `groups`:

```json
{
  "id": "inverse-text-on-brand-fill",
  "surface": null,
  "pairs": [["color-text-on-inverse", "color-surface-brand"]],
  "min": 3,
  "exception": "brand-fill"
}
```

(White on the brand fill is the one declared exception, held at the AA-large floor; the policy spec asserts the ground is the brand pink.)

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/price-tag/price-tag.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { PriceTag } from "./price-tag";

describe("PriceTag", () => {
  it.each([
    [280, "₹280"],
    [1240, "₹1,240"],
    [90, "₹90"],
  ])("prints %d as %s — rupee sign, no space, no decimals, Indian grouping", (amount, text) => {
    render(<PriceTag amount={amount} />);
    expect(screen.getByText(text)).toHaveClass("font-display", "font-bold", "text-price-amount");
  });

  it("strikes the original price and says 'was' to assistive tech", () => {
    render(<PriceTag amount={240} was={320} />);
    const struck = screen.getByText("₹320");
    expect(struck.tagName).toBe("S");
    expect(struck).toHaveTextContent("was ₹320");
    expect(screen.getByText("was")).toHaveClass("sr-only");
    expect(struck).toHaveClass("text-price-was", "text-text-subtle");
  });

  it("joins a range with an en dash and no spaces", () => {
    render(<PriceTag amount={180} to={320} />);
    expect(screen.getByText("₹180–₹320")).toBeInTheDocument();
  });

  it.each([
    [320, 240],
    [240, 240],
  ])("refuses a struck price that is not higher (amount %d, was %d)", (amount, was) => {
    expect(() => renderToString(<PriceTag amount={amount} was={was} />)).toThrow(RangeError);
  });

  it("refuses a struck price below the top of a range", () => {
    expect(() => renderToString(<PriceTag amount={180} to={320} was={300} />)).toThrow(RangeError);
  });

  it("refuses a range that runs backwards", () => {
    expect(() => renderToString(<PriceTag amount={320} to={180} />)).toThrow(RangeError);
  });

  it.each([
    ["sm", "text-price-sm"],
    ["md", "text-price-md"],
    ["lg", "text-price-lg"],
    ["canvas", "text-price-canvas"],
  ] as const)("sets size %s with %s on the tag", (size, sizeClass) => {
    render(<PriceTag amount={280} size={size} />);
    expect(screen.getByText("₹280").parentElement).toHaveClass(sizeClass);
  });

  it("scales the struck price with the canvas size, since it is relative to the tag", () => {
    render(<PriceTag amount={220} was={280} size="canvas" />);
    expect(screen.getByText("₹220").parentElement).toHaveClass("text-price-canvas");
    expect(screen.getByText("₹280")).toHaveClass("text-price-was");
    expect(screen.getByText("₹220")).toHaveClass("text-price-amount");
  });

  it.each([
    ["ink", "text-text-heading"],
    ["brand", "text-text-brand"],
    ["inverse", "text-text-on-inverse"],
  ] as const)("paints tone %s with %s", (tone, colour) => {
    render(<PriceTag amount={280} tone={tone} />);
    expect(screen.getByText("₹280")).toHaveClass(colour);
  });

  it("scales as a whole with one consumer class — the struck price follows", () => {
    render(<PriceTag amount={280} was={320} className="text-canvas-h2" />);
    const tag = screen.getByText("₹280").parentElement;
    expect(tag).toHaveClass("text-canvas-h2");
    expect(tag).not.toHaveClass("text-price-md");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<PriceTag amount={240} was={320} />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './price-tag'`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/price-tag/price-tag.tsx`:

```tsx
import type { ComponentProps } from "react";

import { formatRupeeRange, formatRupees } from "@pink-paprikaa-web/utils";

import { componentVariants } from "../../lib/component-variants";

/** Size on the tag, amount and struck price in em — one class scales the whole price. */
const priceTag = componentVariants({
  slots: {
    root: "inline-flex items-baseline gap-2",
    amount: "text-price-amount font-display font-bold",
    was: "text-price-was font-body text-text-subtle",
  },
  variants: {
    size: {
      sm: { root: "text-price-sm" },
      md: { root: "text-price-md" },
      lg: { root: "text-price-lg" },
      canvas: { root: "text-price-canvas" },
    },
    tone: {
      ink: { amount: "text-text-heading" },
      brand: { amount: "text-text-brand" },
      inverse: { amount: "text-text-on-inverse" },
    },
  },
  defaultVariants: { size: "md", tone: "ink" },
});

export interface PriceTagProps extends ComponentProps<"span"> {
  /** Whole rupees. */
  amount: number;
  /** The original price, struck through. Must be higher than the price it replaces. */
  was?: number | undefined;
  /** Upper bound: renders "₹180–₹320". Must not be below `amount`. */
  to?: number | undefined;
  /** sm 14 · md 17 · lg 22px · canvas 56px (1080px artboards); a text class also scales the tag. = "md" */
  size?: "sm" | "md" | "lg" | "canvas" | undefined;
  /** `inverse` on pink or ink panels (`ink` already follows the surface). = "ink" */
  tone?: "ink" | "brand" | "inverse" | undefined;
}

/**
 * The only correct way to print a price: `₹` with no space, no decimals, Indian grouping, an
 * en-dash range, the original struck through. A struck price that is not higher, or a range that
 * runs backwards, would mislead a guest — both throw instead of rendering.
 */
export function PriceTag({
  amount,
  was,
  to,
  size = "md",
  tone = "ink",
  className,
  ...props
}: PriceTagProps) {
  const price = to ?? amount;
  if (was !== undefined && was <= price) {
    throw new RangeError(
      `PriceTag: was (${String(was)}) must be more than the price it strikes through (${String(price)})`
    );
  }
  const styles = priceTag({ size, tone });

  return (
    <span className={styles.root({ className })} {...props}>
      <span className={styles.amount()}>
        {to === undefined ? formatRupees(amount) : formatRupeeRange(amount, to)}
      </span>
      {was === undefined ? null : (
        <s className={styles.was()}>
          <span className="sr-only">was </span>
          {formatRupees(was)}
        </s>
      )}
    </span>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/design-tokens @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -10` (use `pnpm nx run-many -t test -p …` if `nx test` rejects two projects)
Expected: PASS, including the contrast policy suite's new `inverse-text-on-brand-fill` group.

- [ ] **Step 6: Stories (card parity with `PriceTag.card.html`; docs from `PriceTag.prompt.md`)**

`packages/ui/src/atoms/price-tag/price-tag.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { PriceTag } from "./price-tag";

const meta = {
  title: "Atoms/PriceTag",
  component: PriceTag,
  args: { amount: 280 },
  parameters: {
    docs: {
      description: {
        component:
          'The only correct way to render a price: `₹` with no space, no decimals on whole rupees, Indian digit grouping, an en-dash range (`to`), the original struck through (`was`). `tone="inverse"` on pink or ink panels — though `ink` already follows the surface. `size="canvas"` (56px) prints a price on a 1080px artboard. Never hand-write a price string. A struck price must be higher than the price, and a range must run upwards: anything else throws. The size sits on the tag and the parts are relative to it, so one text class also scales the whole price.',
      },
    },
  },
} satisfies Meta<typeof PriceTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Amounts: Story = {
  name: "amount",
  render: () => (
    <div className="flex flex-wrap items-baseline gap-6">
      <PriceTag amount={280} />
      <PriceTag amount={1240} />
      <PriceTag amount={90} />
    </div>
  ),
};

export const Was: Story = { name: "was", args: { amount: 240, was: 320 } };

export const Range: Story = { name: "to", args: { amount: 180, to: 320 } };

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-wrap items-baseline gap-6">
      <PriceTag amount={280} size="sm" />
      <PriceTag amount={280} size="md" />
      <PriceTag amount={280} size="lg" />
    </div>
  ),
};

export const Inverse: Story = {
  name: "tone",
  render: () => (
    <div data-surface="brand" className="rounded-lg bg-surface-brand p-4">
      <PriceTag amount={280} tone="inverse" size="lg" />
    </div>
  ),
};

/** FeedArtboards.jsx DishLaunchPost: the price on a 1080px board. View at the xl viewport. */
export const Canvas: Story = {
  name: "size canvas (artwork)",
  render: () => (
    <div className="flex flex-wrap items-baseline gap-10">
      <PriceTag amount={220} size="canvas" />
      <PriceTag amount={220} was={280} size="canvas" />
      <PriceTag amount={180} to={320} size="canvas" />
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <PriceTag amount={240} was={320} />
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { PriceTag, type PriceTagProps } from "./atoms/price-tag/price-tag";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/price-tag packages/design-tokens/tokens/component/price-tag.json packages/design-tokens/contrast-pairs.json
```

Run the gate. Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the PriceTag atom

Rupees the brand way through the shared formatters: amount, en-dash range,
struck original read as 'was'. A struck price that is not higher, or a
backwards range, throws rather than mislead a guest. Sizes sit on the tag
and the parts are em-relative, so the canvas size (56px, the artboard
price) and any text class scale the whole price. Adds the white-on-brand-
fill pair for the inverse tone.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 15: Tooltip (client — Radix Tooltip)

**Files:**

- Modify: `packages/design-tokens/tokens/primitive/z-index.json`, `packages/ui/src/styles.css`
- Create: `packages/ui/src/atoms/tooltip/tooltip.tsx`, `tooltip.test.tsx`, `tooltip.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts`, `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `Tooltip` namespace from the `radix-ui` meta package (`Provider`, `Root`, `Trigger`, `Portal`, `Content` — verified in `packages/ui/node_modules/radix-ui/dist/index.d.ts` → `@radix-ui/react-tooltip` 1.2.16), `componentVariants`, `Icon` (stories).
- Produces: `Tooltip`, `TooltipProps` exactly as contract §3 (`label`, `side` = top, `children: ReactElement`; provider included). `children` must forward props and `ref` to a focusable element (Button, IconButton, a native button) — Radix's `Trigger asChild` merges its handlers and `aria-describedby` onto it. New token `--z-tooltip: 90` and utility `z-tooltip`.

- [ ] **Step 1: Component tokens**

No component token: the pill's `6px 10px` padding is `py-1.5 px-2.5`, its type `text-caption`. The new value is a stacking level — `packages/design-tokens/tokens/primitive/z-index.json` (full file after the change):

```json
{
  "z": {
    "$type": "number",
    "raised": { "$value": 5 },
    "sticky": { "$value": 10 },
    "header": { "$value": 50 },
    "dock": { "$value": 60 },
    "overlay": { "$value": 70 },
    "toast": { "$value": 80 },
    "tooltip": {
      "$value": 90,
      "$description": "Above dialogs and toasts: a hint never hides behind what it explains."
    }
  }
}
```

In `packages/ui/src/styles.css`, after `@utility z-toast { … }`, add:

```css
@utility z-tooltip {
  z-index: var(--z-tooltip);
}
```

No list names (z levels are `@utility` classes, not a Tailwind namespace). Contrast: no new pair — `text-text-on-inverse` on `bg-surface-inverse` is the existing `on-inverse` group (the content portals to `<body>`, a light-surface context, so the pair never shifts).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/tooltip/tooltip.test.tsx`:

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Tooltip } from "./tooltip";

/** Radix renders the label twice: visibly, and inside the content as a hidden role="tooltip". */
function contentOf(tooltip: HTMLElement): HTMLElement {
  const content = tooltip.parentElement;
  if (content === null) throw new Error("the tooltip has no content element");
  return content;
}

function renderDairy() {
  return render(
    <Tooltip label="Contains dairy">
      <button type="button">Dairy</button>
    </Tooltip>
  );
}

describe("Tooltip", () => {
  it("stays closed until its trigger is focused, then describes the trigger", async () => {
    const user = userEvent.setup();
    renderDairy();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    await user.tab();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Contains dairy");
    expect(screen.getByRole("button", { name: "Dairy" })).toHaveAccessibleDescription(
      "Contains dairy"
    );
  });

  it("opens on hover", async () => {
    const user = userEvent.setup();
    renderDairy();
    await user.hover(screen.getByRole("button", { name: "Dairy" }));
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Contains dairy");
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    renderDairy();
    await user.tab();
    await screen.findByRole("tooltip");
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });

  it("is an ink pill stacked above dialogs and toasts", async () => {
    const user = userEvent.setup();
    renderDairy();
    await user.tab();
    expect(contentOf(await screen.findByRole("tooltip"))).toHaveClass(
      "z-tooltip",
      "rounded-sm",
      "bg-surface-inverse",
      "text-text-on-inverse",
      "text-caption",
      "shadow-2"
    );
  });

  it.each(["top", "bottom", "left", "right"] as const)(
    "opens with side %s (placement itself is checked in the browser, story Sides)",
    async (side) => {
      const user = userEvent.setup();
      render(
        <Tooltip label="Share" side={side}>
          <button type="button">Share</button>
        </Tooltip>
      );
      await user.tab();
      expect(await screen.findByRole("tooltip")).toHaveTextContent("Share");
    }
  );

  it("keeps the trigger's own name and handlers", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Tooltip label="Pickup only for now">
        <button type="button" onClick={onClick}>
          Delivery
        </button>
      </Tooltip>
    );
    await user.click(screen.getByRole("button", { name: "Delivery" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("has no accessibility violations while open", async () => {
    const user = userEvent.setup();
    const { container } = renderDairy();
    await user.tab();
    const tooltip = await screen.findByRole("tooltip");
    await expectNoA11yViolations(container);
    await expectNoA11yViolations(contentOf(tooltip));
  });
});
```

(jsdom lays nothing out, so Radix's collision handling may flip a side there; the `Sides` story's `play` asserts real placement in Chromium.)

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './tooltip'`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/tooltip/tooltip.tsx`:

```tsx
"use client";

import type { ReactElement } from "react";

import { Tooltip as TooltipPrimitive } from "radix-ui";

import { componentVariants } from "../../lib/component-variants";

/** Tooltip.jsx shows the hint the moment the pointer arrives — no hover-intent delay. */
const OPEN_DELAY_MS = 0;
/** 8px from the trigger (Tooltip.jsx `calc(100% + 8px)`). Radix takes the offset in px. */
const SIDE_OFFSET_PX = 8;

/** Ink pill, 12.5px, 6px radius, no arrow; fades in over 140ms (instantly with reduced motion). */
const tooltip = componentVariants({
  base: "z-tooltip rounded-sm bg-surface-inverse px-2.5 py-1.5 font-body text-caption whitespace-nowrap text-text-on-inverse shadow-2 transition-opacity duration-fast ease-out starting:opacity-0",
});

export interface TooltipProps {
  /** Short hint, no full stop — never essential copy. */
  label: string;
  /** = "top" */
  side?: "top" | "bottom" | "left" | "right" | undefined;
  /** One focusable element that forwards props and ref (Button, IconButton, a native button). */
  children: ReactElement;
}

/** Names an icon-only control or explains a mark. Opens on hover and focus, closes on Escape. */
export function Tooltip({ label, side = "top", children }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={OPEN_DELAY_MS}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content side={side} sideOffset={SIDE_OFFSET_PX} className={tooltip()}>
            {label}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 6: Stories (card parity with `Tooltip.card.html`; docs from `Tooltip.prompt.md`; `play` for the client component)**

`packages/ui/src/atoms/tooltip/tooltip.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";

import { Heart, Info, Milk, Share2 } from "lucide-react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Icon, type IconComponent } from "../icon/icon";
import { Tooltip } from "./tooltip";

interface TriggerProps extends ComponentProps<"button"> {
  icon: IconComponent;
  label: string;
}

/** Story-only stand-in for IconButton (an atom may not import another atom). Forwards every prop. */
function Trigger({ icon, label, ...props }: TriggerProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex size-11 items-center justify-center rounded-pill border border-border-default bg-surface-card text-text-heading hover:bg-pink-50"
      {...props}
    >
      <Icon icon={icon} size="md" />
    </button>
  );
}

const meta = {
  title: "Atoms/Tooltip",
  component: Tooltip,
  args: { label: "Contains dairy", side: "top", children: <Trigger icon={Milk} label="Dairy" /> },
  parameters: {
    docs: {
      description: {
        component:
          "Names an icon-only control or explains a mark; never holds essential copy. Ink pill, 12.5px, no arrow, 140ms fade; max ~5 words, no full stop. Opens on hover and on keyboard focus, closes on Escape, and becomes the trigger's accessible description. The child must forward props and ref to a focusable element — Button, IconButton or a native button. Client component (Radix Tooltip, provider included).",
      },
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvas, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Dairy" });

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await expect(await page.findByRole("tooltip")).toHaveTextContent("Contains dairy");
    await expect(trigger).toHaveAccessibleDescription("Contains dairy");

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("tooltip")).not.toBeInTheDocument());

    await userEvent.hover(trigger);
    await expect(await page.findByRole("tooltip")).toHaveTextContent("Contains dairy");
  },
};

const SIDES = [
  { side: "top", label: "Contains dairy", name: "Dairy", icon: Milk },
  { side: "bottom", label: "Save for later", name: "Save", icon: Heart },
  { side: "left", label: "Share", name: "Share", icon: Share2 },
  { side: "right", label: "Ground this morning", name: "Info", icon: Info },
] as const;

export const Sides: Story = {
  name: "side",
  render: () => (
    <div className="flex items-center gap-8 p-16">
      {SIDES.map(({ side, label, name, icon }) => (
        <Tooltip key={side} label={label} side={side}>
          <Trigger icon={icon} label={name} />
        </Tooltip>
      ))}
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    for (const { side, name } of SIDES) {
      await userEvent.tab();
      await expect(canvas.getByRole("button", { name })).toHaveFocus();
      const tooltip = await page.findByRole("tooltip");
      await expect(tooltip.parentElement).toHaveAttribute("data-side", side);
    }
  },
};

export const OnAButton: Story = {
  name: "on a button",
  args: {
    label: "Pickup only for now",
    children: (
      <button
        type="button"
        className="inline-flex h-9 items-center rounded-pill border-2 border-border-brand px-4 font-display text-body-sm font-bold text-text-brand"
      >
        Delivery
      </button>
    ),
  },
};
```

- [ ] **Step 7: Export**

```ts
export { Tooltip, type TooltipProps } from "./atoms/tooltip/tooltip";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/tooltip packages/ui/src/styles.css packages/design-tokens/tokens/primitive/z-index.json
```

Run the gate, then `pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache 2>&1 | tail -10`. Expected: green; `Atoms/Tooltip › Playground` and `› side` pass in Chromium.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the Tooltip atom on Radix Tooltip

The design system's ink pill on four sides, opening on hover and keyboard
focus, closing on Escape, and describing its trigger. It stacks on a new
z-tooltip level above dialogs and toasts and fades in with @starting-style,
so no animation library is involved.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 16: Countdown (client — handoff)

Derived from `zip-files/pink-paprikaa-handoff/design/PPHeader.dc.html`, which has no design-system card: the launch bar's pill is `font-mono`, bold, `ink-900` fill, white text, `1px 8px` padding, pill radius, `nowrap`, ticking every second (`setInterval(…, 1000)`) and formatted `` `${d}d ${hh}h ${mm}m ${ss}s` `` with hours, minutes and seconds padded to two digits. The handoff shows `0d 00h 00m 00s` forever after the deadline; spec §9.1 and §16 require the offer to disappear instead.

**Files:**

- Create: `packages/ui/src/atoms/countdown/countdown.tsx`, `countdown.test.tsx`, `countdown.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: React 19 `useSyncExternalStore`, `componentVariants`.
- Produces: `Countdown`, `CountdownProps` exactly as contract §3 (`endsAt` ISO with offset, `fallback` = null, `label` accessible prefix; renders `<time dateTime={endsAt}>`). The server snapshot is `null`, so SSR and the hydration pass render the stable placeholder `--d --h --m --s`; the clock subscribes (one 1s interval) only after mount and unsubscribes on unmount; the second the offer ends it renders `fallback`. An `endsAt` without an offset throws `RangeError` (server and browser would read it in different time zones).

- [ ] **Step 1: Component tokens**

None: the pill is `rounded-pill bg-surface-inverse px-2 py-px font-mono text-mono font-bold text-text-on-inverse` — `px-2` is 8px, `py-px` 1px, `text-mono` the handoff's 13px. Contrast: the existing `on-inverse` pair. No list names.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/countdown/countdown.test.tsx`:

```tsx
import { act, render, screen } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Countdown } from "./countdown";

const ENDS_AT = "2026-10-31T23:59:59+05:30";
/** One day and five seconds before ENDS_AT. */
const NOW = new Date("2026-10-30T23:59:54+05:30");

beforeEach(() => {
  // Only the clock is faked: React's scheduler and axe keep their real timers.
  vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Countdown", () => {
  it("renders a stable placeholder on the server — no time-dependent digits in the HTML", () => {
    const html = renderToString(<Countdown endsAt={ENDS_AT} label="Offer closes in" />);
    expect(html).toMatch(/datetime="2026-10-31T23:59:59\+05:30"/i);
    expect(html).toContain("--d --h --m --s");
    expect(html).not.toMatch(/\d+d \d{2}h/);
  });

  it("hydrates without a mismatch, then shows the real time left", async () => {
    const element = <Countdown endsAt={ENDS_AT} label="Offer closes in" />;
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    const onRecoverableError = vi.fn();

    const root = await act(() => hydrateRoot(container, element, { onRecoverableError }));

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container).toHaveTextContent("Offer closes in 1d 00h 00m 05s");
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("ticks once a second after mount", () => {
    render(<Countdown endsAt={ENDS_AT} />);
    const time = screen.getByText("1d 00h 00m 05s");
    expect(time.tagName).toBe("TIME");
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(time).toHaveTextContent("1d 00h 00m 04s");
  });

  it("swaps to the fallback the second the offer ends", () => {
    vi.setSystemTime(new Date("2026-10-31T23:59:57+05:30"));
    render(<Countdown endsAt={ENDS_AT} fallback={<span>Offer closed</span>} />);
    expect(screen.getByText("0d 00h 00m 02s")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("0d 00h 00m 01s")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("Offer closed")).toBeInTheDocument();
    expect(document.querySelector("time")).not.toBeInTheDocument();
  });

  it("renders nothing by default once ended — a cached page never shows an expired offer", () => {
    vi.setSystemTime(new Date("2026-11-01T00:00:00+05:30"));
    const { container } = render(<Countdown endsAt={ENDS_AT} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("runs one interval while mounted and clears it on unmount", () => {
    const { unmount } = render(<Countdown endsAt={ENDS_AT} />);
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("reads its label before the time, for assistive tech only", () => {
    render(<Countdown endsAt={ENDS_AT} label="Offer closes in" />);
    const time = document.querySelector("time");
    expect(screen.getByText("Offer closes in")).toHaveClass("sr-only");
    expect(time).toHaveTextContent("Offer closes in 1d 00h 00m 05s");
    expect(time).toHaveAttribute("datetime", ENDS_AT);
  });

  it("is the handoff's mono ink pill", () => {
    render(<Countdown endsAt={ENDS_AT} />);
    expect(screen.getByText("1d 00h 00m 05s")).toHaveClass(
      "rounded-pill",
      "bg-surface-inverse",
      "font-mono",
      "font-bold",
      "text-text-on-inverse"
    );
  });

  it.each(["2026-10-31T23:59:59", "31 October 2026", ""])(
    "rejects %j — an end time needs an ISO offset",
    (endsAt) => {
      expect(() => renderToString(<Countdown endsAt={endsAt} />)).toThrow(RangeError);
    }
  );

  it("has no accessibility violations", async () => {
    const { container } = render(<Countdown endsAt={ENDS_AT} label="Offer closes in" />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './countdown'`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/countdown/countdown.tsx`:

```tsx
"use client";

import { type ComponentProps, type ReactNode, useSyncExternalStore } from "react";

import { componentVariants } from "../../lib/component-variants";

const SECOND_MS = 1000;
/** What the server and the hydration pass render: a reading's shape without time-dependent digits. */
const PLACEHOLDER = "--d --h --m --s";
/** An ISO date-time must carry its offset, or server and browser would read it in different zones. */
const ISO_WITH_OFFSET = /(?:Z|[+-]\d{2}:\d{2})$/;

/** The handoff launch bar's pill (PPHeader.dc.html). */
const countdown = componentVariants({
  base: "inline-flex rounded-pill bg-surface-inverse px-2 py-px font-mono text-mono font-bold whitespace-nowrap text-text-on-inverse",
});

/** The clock is an external store: one 1s interval per mounted countdown, cleared on unmount. */
function subscribeToClock(onTick: () => void): () => void {
  const timer = setInterval(onTick, SECOND_MS);
  return () => {
    clearInterval(timer);
  };
}

/** Whole seconds, so the snapshot only changes once a second. */
function readClock(): number {
  return Math.floor(Date.now() / SECOND_MS);
}

/** The server has no "now" worth rendering: null means "not mounted yet". */
function readServerClock(): null {
  return null;
}

function parseEndsAt(endsAt: string): number {
  const endsMs = Date.parse(endsAt);
  if (!ISO_WITH_OFFSET.test(endsAt) || Number.isNaN(endsMs)) {
    throw new RangeError(
      `Countdown: endsAt must be an ISO date-time with an offset, got "${endsAt}"`
    );
  }
  return endsMs;
}

const pad = (value: number) => String(value).padStart(2, "0");

/** `12d 04h 05m 09s` — the handoff's launch-offer format. */
function formatRemaining(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${String(days)}d ${pad(hours)}h ${pad(minutes)}m ${pad(totalSeconds % 60)}s`;
}

export interface CountdownProps extends Omit<ComponentProps<"time">, "children" | "dateTime"> {
  /** ISO 8601 with an offset, e.g. "2026-10-31T23:59:59+05:30". */
  endsAt: string;
  /** Rendered once `endsAt` has passed. = null (nothing). */
  fallback?: ReactNode;
  /** Read before the time by assistive tech only, e.g. "Offer closes in". */
  label?: string | undefined;
}

/**
 * Time left on an offer, ticking every second. Server-rendered HTML carries a placeholder, so there
 * is no hydration mismatch and no stale time in a static page; the live reading starts on mount.
 */
export function Countdown({ endsAt, fallback = null, label, className, ...props }: CountdownProps) {
  const endsMs = parseEndsAt(endsAt);
  const nowSecond = useSyncExternalStore<number | null>(
    subscribeToClock,
    readClock,
    readServerClock
  );
  const remaining =
    nowSecond === null ? null : Math.max(0, Math.ceil(endsMs / SECOND_MS - nowSecond));

  if (remaining === 0) return fallback;

  return (
    <time dateTime={endsAt} className={countdown({ className })} {...props}>
      {label === undefined ? null : <span className="sr-only">{`${label} `}</span>}
      {remaining === null ? (
        <span aria-hidden="true">{PLACEHOLDER}</span>
      ) : (
        formatRemaining(remaining)
      )}
    </time>
  );
}
```

(`remaining` is computed from whole seconds: with a whole-second `endsAt` — every ISO time the content uses — it is exact, and it reaches 0 at the deadline, never a second early.)

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS — including the hydration test with no recoverable error.

- [ ] **Step 6: Stories (parity with the handoff launch bar; `play` for the client component)**

`packages/ui/src/atoms/countdown/countdown.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, waitFor } from "storybook/test";

import { Countdown } from "./countdown";

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
/** Computed when the stories load, so the countdown is always live in Storybook. */
const IN_FIVE_DAYS = new Date(Date.now() + 5 * DAY_MS + 7 * HOUR_MS).toISOString();
const LAST_YEAR = "2025-10-31T23:59:59+05:30";
const READING = /^\d+d \d{2}h \d{2}m \d{2}s$/;

const meta = {
  title: "Atoms/Countdown",
  component: Countdown,
  args: { endsAt: IN_FIVE_DAYS },
  parameters: {
    docs: {
      description: {
        component:
          'From the handoff\'s launch bar: the time left on an offer as `Nd HHh MMm SSs` in a mono ink pill, ticking every second. `endsAt` is ISO 8601 with an offset ("2026-10-31T23:59:59+05:30"). The server renders a stable placeholder, so there is no hydration mismatch and a static page never bakes in a stale time; once `endsAt` passes it renders `fallback` — nothing by default — so an expired offer disappears even from a cached page. `label` is read before the time by assistive tech only. Client component.',
      },
    },
  },
} satisfies Meta<typeof Countdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { label: "Offer closes in" },
  play: async ({ canvas }) => {
    const time = canvas.getByText(READING);
    await expect(time.tagName).toBe("TIME");
    await expect(time).toHaveAttribute("datetime", IN_FIVE_DAYS);
    const first = time.textContent;
    await waitFor(() => expect(time.textContent).not.toBe(first), { timeout: 2500 });
  },
};

/** PPHeader.dc.html — the launch bar the countdown was drawn for. */
export const InLaunchBar: Story = {
  name: "in the launch bar (handoff)",
  render: (args) => (
    <p
      data-surface="brand"
      className="m-0 flex max-w-none flex-wrap items-center justify-center gap-2 bg-surface-brand px-4 py-1.5 text-center font-body text-body-sm"
    >
      <span>
        Launch price: <strong>Classic at ₹130 a meal</strong> for the first 50 subscribers · closes
        in
      </span>
      <Countdown {...args} />
    </p>
  ),
};

export const Ended: Story = {
  name: "after endsAt: fallback",
  args: {
    endsAt: LAST_YEAR,
    fallback: (
      <span className="font-body text-body-sm text-text-muted">This offer has closed.</span>
    ),
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText("This offer has closed.")).toBeVisible();
    await expect(canvasElement.querySelector("time")).toBeNull();
  },
};

export const EndedRendersNothing: Story = {
  name: "after endsAt: nothing by default",
  args: { endsAt: LAST_YEAR },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("time")).toBeNull();
  },
};
```

- [ ] **Step 7: Export**

```ts
export { Countdown, type CountdownProps } from "./atoms/countdown/countdown";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/countdown
```

Run the gate, then `pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache 2>&1 | tail -10`. Expected: green; the `Atoms/Countdown` plays pass (the Playground one waits for a real tick).

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui
git commit -m "feat(ui): add the Countdown atom from the handoff header

The launch bar's mono ink pill, ticking once a second through
useSyncExternalStore: the server snapshot is a placeholder, so hydration
never mismatches and a static page never bakes in a stale time. It renders
the fallback (nothing by default) the second the offer ends, clears its
interval on unmount, and rejects an end time without an offset.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 17: Tier parity review (spec §11.4)

Side-by-side screenshots of every design-system card (and, for Slider and Countdown, the handoff pages they came from) against the matching Storybook docs page, at 360 and 1280. Fix what differs; list with a reason what stays different.

**Files:**

- Create (then delete, never committed): `apps/storybook/parity.tmp.mjs`
- Modify: whichever component or story a difference points at

**Interfaces:**

- Consumes: every story in `Atoms/*` from this plan; `serve` (root devDependency) and `playwright` (Storybook app devDependency, Chromium installed by Plan 1 Task 1).
- Produces: screenshots in `/tmp/parity-2b/`, fixes, and the list of accepted differences.

- [ ] **Step 1: Serve both sides**

Run each in the background (e.g. `run_in_background`):

```bash
pnpm exec serve -l 4800 zip-files
pnpm nx run @pink-paprikaa-web/storybook:serve
```

Wait until `http://localhost:4800/Pink%20Paprikaa%20Design%20System/components/atoms/Input.card.html` and `http://localhost:6006` both answer. The cards load React from unpkg; if the sandbox blocks the network, rerun with the sandbox disabled.

- [ ] **Step 2: Screenshot every pair at 360 and 1280**

`apps/storybook/parity.tmp.mjs`:

```js
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const CARDS = "http://localhost:4800/Pink%20Paprikaa%20Design%20System/components/atoms";
const HANDOFF = "http://localhost:4800/pink-paprikaa-handoff/design";
const DOCS = "http://localhost:6006/iframe.html?viewMode=docs&id=";
const OUT = "/tmp/parity-2b";

/** [name, reference page, Storybook docs id] */
const PAIRS = [
  ["input", `${CARDS}/Input.card.html`, "atoms-input--docs"],
  ["select", `${CARDS}/Select.card.html`, "atoms-select--docs"],
  ["checkbox", `${CARDS}/Checkbox.card.html`, "atoms-checkbox--docs"],
  ["radio", `${CARDS}/Radio.card.html`, "atoms-radio--docs"],
  ["switch", `${CARDS}/Switch.card.html`, "atoms-switch--docs"],
  ["slider", `${HANDOFF}/DawatCalculator.dc.html`, "atoms-slider--docs"],
  ["spinner", `${CARDS}/Spinner.card.html`, "atoms-spinner--docs"],
  ["skeleton", `${CARDS}/Skeleton.card.html`, "atoms-skeleton--docs"],
  ["progress-bar", `${CARDS}/ProgressBar.card.html`, "atoms-progressbar--docs"],
  ["rating", `${CARDS}/Rating.card.html`, "atoms-rating--docs"],
  ["spice-level", `${CARDS}/SpiceLevel.card.html`, "atoms-spicelevel--docs"],
  ["diet-mark", `${CARDS}/DietMark.card.html`, "atoms-dietmark--docs"],
  ["price-tag", `${CARDS}/PriceTag.card.html`, "atoms-pricetag--docs"],
  ["tooltip", `${CARDS}/Tooltip.card.html`, "atoms-tooltip--docs"],
  ["countdown", `${HANDOFF}/PPHeader.dc.html`, "atoms-countdown--docs"],
];

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
for (const width of [360, 1280]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const [name, reference, docsId] of PAIRS) {
    for (const [side, url] of [
      ["card", reference],
      ["story", `${DOCS}${docsId}`],
    ]) {
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: `${OUT}/${name}-${String(width)}-${side}.png`,
        fullPage: true,
      });
    }
  }
  await page.close();
}
await browser.close();
console.log(`parity screenshots written to ${OUT}`);
```

Run: `node apps/storybook/parity.tmp.mjs`
Expected: 60 PNGs in `/tmp/parity-2b/`. (If a docs id 404s, read the real id from Storybook's sidebar URL and correct the list.)

- [ ] **Step 3: Compare each pair and act**

Open each `<name>-<width>-card.png` beside `<name>-<width>-story.png` (the Read tool shows images). For every difference: if it is a defect, fix the component or story (token first if it is a value), rerun its task's gate, and re-shoot that pair. Otherwise add it to the accepted list with its reason. The accepted list starts as:

- Label, hint and status message rows (Input, Select, Checkbox): owned by Field (Molecules/Field, Plan 3a) — spec §8.2.
- `IconButton` / `Button` triggers and slots (Tooltip, Input trailing): native stand-ins in atom stories (atoms may not import atoms).
- SpiceLevel `sm` is 12px (card's smallest sample is 10px): the menu call sites use 12.
- DietMark `lg` is 20px (card samples 26px) and there is no egg row: spec C10, pure veg.
- Select text clears a leading icon at 44px, not 42px: one field chrome with Input.
- Disabled Checkbox, Radio, Switch use real fills, not 50% opacity: readme §3.8.
- A read-only Select shows the lock, not the chevron: form-states guideline.
- Font rasterisation and the cards' 128px row-label column.

- [ ] **Step 4: Story tests and the gate, cold**

```bash
rm apps/storybook/parity.tmp.mjs
pnpm nx format:check && pnpm nx sync:check
```

Then run the gate and `pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache 2>&1 | tail -15`. Expected: all green — every Atoms story passes axe in Chromium, and the Select, Tooltip and Countdown plays pass. `git status --short` shows no stray file.

- [ ] **Step 5: Commit (only if Step 3 changed files)**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "fix(ui): align the forms, indicators and menu atoms with their cards

Side-by-side review at 360 and 1280 against the design-system cards and
the handoff pages (spec §11.4). Accepted differences, each by decision:
<paste the final accepted list, one line each>

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

If nothing changed, paste the accepted list in the task report instead.

## Controller amendments — ruling R19 and 2b rulings (2026-09-27)

- **R19 — the symbol is one shared CSS mask, never inline SVG per instance.** Plan 1 Task 7 generates `packages/ui/src/lib/brand-artwork.css` (imported by `styles.css`) defining `--pp-symbol-mask` once and the utility `mask-symbol` (`background-color: currentColor` + the mask). `SymbolMark` (Plan 2a Task 1) is therefore `<span aria-hidden="true" className={…"mask-symbol"…} />` sized by className — no path data in the HTML. Its test asserts the class and `aria-hidden`, and that the rendered HTML contains no `<path`. PatternField uses `mask-image: var(--pp-symbol-mask)` (a class or `style={{ maskImage: "var(--pp-symbol-mask)" }}`) instead of inlining `SYMBOL_DATA_URI_WHITE` per instance. Reason: a 20-dish menu with spice levels would otherwise carry ~80 copies of ~5 KB path data (page budget ≤1 MB). Plan 2b's Rating/SpiceLevel/Spinner and `lib/brand-diamond.tsx` build on this `SymbolMark`.
- **One diamond corner token:** `radius.diamond` (2px) is created once, in Plan 2a (StatusDot's task), and used as `rounded-diamond` by StatusDot and by Plan 2b's `lib/brand-diamond.tsx`; drop `radius-status-dot` / `radius-brand-diamond`.
- **Tooltip** opens with `delayDuration={0}` as designed — accepted.
- **No on-brand variants** for Checkbox/Radio/Switch/Slider (none designed) — YAGNI, accepted.
- **Read-only Select** renders disabled for the visual, **plus a hidden `<input type="hidden" name={name} value={value}>`** so the value is still submitted (react-hook-form reads it) — add a test.
- **R21 — field text is 16px.** `lib/field-control.tsx` renders the control value at `text-body` (16px) for every size (sm/md/lg change height and padding only): iOS Safari zooms on focus below 16px, and the handoff fields use `font-size:16px`. Add a test asserting the value text class.
