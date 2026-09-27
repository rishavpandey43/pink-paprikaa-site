# Design System — Plan 3a of 5: Molecules (system)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The eighteen system molecules of the design system — Field, SearchField, QuantityStepper, OtpInput, SlotPicker, Alert, Toast (+ ToastProvider), Snackbar, EmptyState, Tabs, Breadcrumb, Pagination, SectionHeader, Stat, Accordion, ListRow, PriceSummary, StepTracker — each with its component tokens, behaviour + axe tests, card-parity stories and a public export, then a tier parity review against the design-system cards.

**Architecture:** Every molecule lives in `packages/ui/src/molecules/<kebab>/` and composes only atoms (`Icon`, `PriceTag`), `lib/*` internals and packages — never another molecule. Twelve are server-safe; SearchField, QuantityStepper, OtpInput, Tabs, Toast/ToastProvider and Snackbar are client components, and Alert's dismiss button is a client leaf. This plan adds two internals, each owning a rule every control must share: `lib/use-controllable-state.ts` (controlled + uncontrolled values, change reported synchronously and only on a real change) and `lib/field-message.tsx` (the hint, or the status glyph + message, under the id a control references). Everything else is reused from the lower tiers, not redrawn: Plan 2b's field box (`FieldControl` / `fieldControlVariants`) under SearchField and the OTP cells, `joinIds` and `fakeRegister`; Plan 2a's `SymbolMark` (the shared `mask-symbol` CSS mask, ruling R19), `OnSurfaces` and `transition-control`. Behaviour comes from the platform first — native radios (SlotPicker), `<details name>` with a `::details-content` height transition as progressive enhancement (Accordion), one `<input autocomplete="one-time-code">` behind decorative cells (OtpInput) — and from Radix only where the platform has no primitive (Tabs, Toast, Slot). Styling is token classes through `componentVariants` slots: fixed component dimensions and off-ramp type sizes are component tokens (`tokens/component/<name>.json`), paddings and gaps use the 4px multiplier, the skins that must flip on a pink or ink field (Breadcrumb chevron, PriceSummary discount, StepTracker bar) are component tokens overridden in `surface/{brand,ink}.json` and restored in `surface/light.json`, and every white-filled part (search box, OTP cells, slots, stepper, segmented rail, pagination pills, Alert) is a light island (`data-surface="light"`).

**Tech Stack:** Nx 23 · pnpm 10 · TypeScript 6 · React 19.2 · Tailwind 4.3 · tailwind-variants 3.3 · radix-ui 1.6.7 (`Tabs`, `Toast`, `Slot` incl. `Slot.Slottable`) · lucide-react 1.30 · `@pink-paprikaa-web/utils` (`formatRupees`) · Vitest 4 + Testing Library 16 + user-event 14 + axe-core 4.13 · Storybook 10.5 (`@storybook/react-vite`, `storybook/test`, addon-vitest).

**Spec:** `docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md` — §5 (contrast policy, §5.5 non-contrast rules), §6 (tokens), §8 (component rules, §8.2 prop translation), §9.2 (molecules table), §10.2 (stories), §11.1 (definition of done), D17 (react-hook-form compatibility).

**Contracts:** `docs/superpowers/plans/2026-09-27-ds-00-contracts.md` — implements **§5** exactly (except the deviations below); consumes §1 (`componentVariants`, `Icon`/`IconComponent`, `lib/heading.ts`, `lib/link-as.ts`, `lib/field-status.ts`), §2–§3 atoms. Design-system sources per component: `zip-files/Pink Paprikaa Design System/components/molecules/<Name>.{jsx,d.ts,card.html,prompt.md}`.

**Depends on:** Plan 1 (foundation, incl. the `mask-symbol` utility), Plan 2a (`docs/superpowers/plans/2026-09-27-ds-02a-atoms-core.md`: `Button`, `Badge`, `lib/heading.ts`, `lib/link-as.ts`, `lib/symbol-mark.tsx`, `lib/story-surfaces.tsx`, `transition-control`), Plan 2b (`…-ds-02b-atoms-forms-indicators.md`: `Input`, `Select`, `Switch`, `PriceTag`, `lib/field-status.ts`, `lib/field-control.tsx`, `lib/choice-control.tsx`, `fakeRegister`), Plan 2c (`…-ds-02c-layouts.md` — not imported; AppShell's frame is where the App kit mounts `<ToastProvider isContained>`). All merged before Task 0, which verifies each against the working tree.

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

**Tier rules (this plan):**

- **Molecules import only** `../../atoms/*`, `../../lib/*`, `react`, `radix-ui`, `lucide-react` and `@pink-paprikaa-web/utils` — never another molecule, organism or layout. This holds for tests and stories too (their surface panels come from Plan 2a's `OnSurfaces`, not `Section`).
- **Reuse before building:** the field box is Plan 2b's `FieldControl` / `fieldControlVariants`; ids merge with Plan 2b's `joinIds`; RHF doubles are Plan 2b's `fakeRegister`; the brand symbol is Plan 2a's `SymbolMark` — one shared `mask-symbol` CSS mask, never inline SVG per instance (ruling R19); pill transitions are Plan 2a's `transition-control`.
- `"use client"` only in the files the contract marks **C** (and `alert-dismiss.tsx`), always as the file's first line.
- Value-based controls read and write their value through `useControllableState` — never a second `useState` mirror — and expose `name`, `onBlur` and (where they own an input) `ref` for react-hook-form's `<Controller>`.
- Controls reference a message only when it renders: `hasFieldMessage(…)` decides, `FieldMessage` renders, `joinIds(…)` merges a consumer's own `aria-describedby`.
- Lists of links take `linkAs?: LinkAs` (default `"a"`); titled components take `headingLevel` and render `headingTag(headingLevel)`.
- **Props:** every optional custom prop is declared `name?: T | undefined` (ruling R13), and a public `…Props` spells each variant union out — never `extends VariantProps<…>` (Storybook's docgen drops types declared in `node_modules`, Plan 2a). Library types without `| undefined` (Radix props) get a conditional spread: `{...(duration === undefined ? {} : { duration })}`.
- **`asChild`** follows Plan 2a: `const Row: ElementType = asChild ? Slot.Root : "div"`, content through `<Slot.Slottable child={children}>{(content) => …}</Slot.Slottable>`, and classes go on the component, never on the slotted child (Slot joins them without tailwind-merge).
- **Dimensions:** a fixed component dimension (height, width, cell or marker size, measure) that is a design-system spacing step (`1…12, 14, 16, 18, 20, 24, 32`, half steps `0.5`, `1.5`) uses the scale (`h-12` = 48px); any other becomes a component token in `spacing` (`size-step-tracker-marker`). Paddings, gaps, margins and offsets use the 4px multiplier and may use quarter steps (`py-3.25` = 13px, `mt-0.75` = 3px). Never Tailwind's static `max-w-prose` (65ch): measures are `max-w-text-measure-prose` / `max-w-text-measure-narrow` or a component token.
- **Type:** a size on the ramp uses the ramp class (`text-body-sm`); any other becomes a `text` typography token with its line height (`text-accordion-question`). Line heights mirror the design system: explicit where the `.jsx` sets one, `1.6` where it inherits the body, `1.4` for text inside a `<button>` (Poppins' normal line height).
- typescript-eslint `strictTypeChecked` is on: event-handler arrows use braces (`() => { set(x); }` — `no-confusing-void-expression`), numbers in template strings go through `String(n)`, no empty functions (`vi.fn()` in tests, `fn()` in stories), no non-null assertions.
- No test in this plan reads a file; one that must builds its path with `join(import.meta.dirname, "…")`, never `new URL("…", import.meta.url)` (ruling R15).
- Run `pnpm exec eslint --fix <files> && pnpm exec prettier --write <files>` before each gate: perfectionist owns import order, `prettier-plugin-tailwindcss` owns class order — the code below is correct but not necessarily in their order.

## Review Focus

1. **OtpInput with a real SMS code** — pasting a formatted code (`48-21 93`), a code longer than the field, letters, and Backspace across filled cells must leave exactly the digits, in order, with no `maxLength` truncating a paste before the digits are extracted — owned by Task 5.
2. **QuantityStepper typed entry** — a typed `5000` on a 15–2000 stepper, a typed `3`, an off-step `17` with `step={5}`, an emptied field and Escape must commit `2000`, `15`, `15`, the previous value and the previous value respectively — owned by Task 4.
3. **Field with react-hook-form** — a `register()` result (Plan 2b's `fakeRegister`) spread after the render-prop wiring (`{...control} {...register("phone")}`) must keep `aria-describedby`, `aria-invalid` and `required` while the registered `name`, `onChange`, `onBlur` and `ref` all reach the input; and Field must hand over only the keys that apply, so an `undefined` never overrides a control's own `aria-invalid` — owned by Task 2.
4. **Accordion answers stay in the page** — closed answers must remain in the DOM (find-in-page, search engines), all items of a single-open accordion share one `name`, and a multiple accordion carries none — owned by Task 16 (jsdom contract) and its story `play` (real exclusivity in Chromium).
5. **Toast on a server-rendered page** — `renderToString` → `hydrateRoot` of a provider with an open toast must hydrate with no recoverable error and no console error, then show the toast — owned by Task 8.

## Contract deviations

Recorded against `2026-09-27-ds-00-contracts.md` §5. Every one is additive or a removal the spec's own decisions require; consumers written against the contract get a type error at the exact line, never silent drift.

| #   | Component                             | Contract                                                      | This plan                                                                                                                                                                                                                                              | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --- | ------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | SlotPicker                            | no message, legend always visible                             | **+ `message?: ReactNode`**, **+ `isLegendHidden?: boolean`**                                                                                                                                                                                          | The design-system `SlotPicker.d.ts` carries its error text (`error?: boolean \| string`) and the card shows "Pick a slot to continue."; a fieldset cannot sit inside `Field` (a `<label>` cannot name a group). Plan 2b's RadioGroup adds the same `message` for the same reason. The card's `columns={3}` row has no visible label; RadioGroup and ChoiceCardGroup already use `isLegendHidden`.                                                                                                                                                                                 |
| 2   | QuantityStepper                       | no `ref`                                                      | **+ `ref?: Ref<HTMLInputElement>`**                                                                                                                                                                                                                    | Spec §11.2's RHF story asserts focus-on-error across QuantityStepper (Controller); Controller needs a focusable ref. The count is a real `<input role="spinbutton">` (typed entry, spec §9.2).                                                                                                                                                                                                                                                                                                                                                                                    |
| 3   | OtpInput                              | no `ref`, no `onBlur`                                         | **+ `ref`**, **+ `onBlur?: () => void`**                                                                                                                                                                                                               | Contract §0: value-based controls expose `name` + `onBlur` for Controller; `ref` for focus-on-error. Implemented as one input with decorative cells, not one input per digit.                                                                                                                                                                                                                                                                                                                                                                                                     |
| 4   | Toast, Snackbar                       | no `className`                                                | **+ `className?: string`** (Toast: the pill; Snackbar: the bar)                                                                                                                                                                                        | Every other molecule contract takes `className`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 4a  | ToastProvider, Snackbar               | viewport placement fixed by the component                     | **+ `isContained?: boolean`** — ToastProvider default `false` (page edge, above the mobile dock), Snackbar default `true` (design system: absolute inside the nearest positioned ancestor)                                                             | Controller ruling 2026-09-27: the App kit shows toasts inside AppShell's phone frame (its `position: relative` overlay slot), not at the page edge. Radix renders one `Viewport` per `Provider`, wherever the provider sits, so one boolean switches its positioning and the App kit renders `<ToastProvider isContained>` inside the overlay slot (Plan 5 assumed the name `isContained`; no `portalContainer` on Toast is needed). A separately exported viewport was rejected: a provider that also renders a default viewport would register two, and the last-attached wins. |
| 5   | Toast                                 | `defaultOpen` default unstated                                | `defaultOpen` **= true**                                                                                                                                                                                                                               | Radix Toast's own default: rendering a toast shows it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 6   | Snackbar                              | —                                                             | always renders its dismiss button                                                                                                                                                                                                                      | The design system defines Snackbar as "a squared bar with a text action and a dismiss"; the card's tone rows lack it only because the static demo passed no `onClose`.                                                                                                                                                                                                                                                                                                                                                                                                            |
| 7   | Breadcrumb, PriceSummary, StepTracker | `tone?: "light" \| "inverse"`                                 | **removed**                                                                                                                                                                                                                                            | Spec D5: "Surfaces are CSS, not props." All three read semantic tokens plus the component tokens overridden per surface; place them inside a `data-surface="ink"\|"brand"` field. A `tone` would be a second source of truth that can contradict the surface. (Spec §9.2 lists `tone` for PriceSummary and StepTracker; D5 supersedes it.)                                                                                                                                                                                                                                        |
| 8   | EmptyState                            | `extends ComponentProps<"div">` with `title: ReactNode`       | `extends Omit<ComponentProps<"div">, "title">`                                                                                                                                                                                                         | The native `title` is a `string` attribute; the interface cannot extend it with `ReactNode`. Same for SectionHeader/ListRow, which the contract already omits.                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 9   | Field                                 | `id?: string` beside the div props                            | `id` names **the control**; the wrapper takes no id                                                                                                                                                                                                    | The only useful id on a field is the control's (error-summary anchors, labels).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 10  | SearchField                           | —                                                             | renders inside Plan 2b's field box (`FieldControl`), made a pill with a 16px inset; the status glyph shows inside the box and loading is the pulsing brand mark; the clear button shows whenever there is a value (design system: only with `onClear`) | One field chrome for every control. Uncontrolled use needs the clear button; `onClear` is a notification.                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 11  | Alert                                 | —                                                             | every tone is a light island on every surface; new `neutral` tone (handoff `pg-hint`); `danger` uses `role="alert"`, the rest `role="status"`                                                                                                          | The handoff's translucent Dawat warning on ink becomes the standard warning panel (open question 1). An opaque tinted panel keeps its action slot and links on light skins wherever it sits.                                                                                                                                                                                                                                                                                                                                                                                      |
| 12  | Toast / Snackbar `success`            | fill `--status-success` (mint)                                | fill `--color-mint-strong` via `toast-success-bg` / `snackbar-success-bg`                                                                                                                                                                              | White on mint measures 3.16:1 and the contrast policy allows below 4.5 only for the brand fill (spec §5.4).                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 13  | Pagination                            | —                                                             | renders nothing when `pages < 2`; Previous at page 1 and Next at the last page are inert placeholders, not links                                                                                                                                       | A one-page list has nothing to paginate; a link to the current page is noise.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 14  | EmptyState                            | `headingLevel` default unstated                               | `= 3`                                                                                                                                                                                                                                                  | An empty state sits inside a section that owns the `h2`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 15  | Accessible defaults                   | only `Pagination.label`, `PriceSummary.totalLabel` documented | the fixed strings in the table below                                                                                                                                                                                                                   | English-only site; each string is an accessible name the design system already specifies. Making them props waits for a second locale.                                                                                                                                                                                                                                                                                                                                                                                                                                            |

**Accessible default strings (fixed, English):**

| Component       | String                                                                           | Where                                                              |
| --------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Field           | `optional`                                                                       | visible marker inside the label                                    |
| SearchField     | `Clear search`                                                                   | clear button name                                                  |
| QuantityStepper | `Remove one` / `Add one` (`step` 1), `Remove 5` / `Add 5` (`step` 5)             | − / + button names                                                 |
| Alert, Snackbar | `Dismiss`                                                                        | dismiss button name                                                |
| ToastProvider   | `Notification` (per toast, overridable via `label`), region `Notifications (F8)` | Radix defaults                                                     |
| Snackbar        | region `Messages`                                                                | its own viewport (no hotkey, so it never fights the provider's F8) |
| Breadcrumb      | `Breadcrumb` (overridable via `aria-label`)                                      | nav name                                                           |
| Pagination      | `Pagination` (`label`), `Previous page`, `Next page`, `Page N`                   | nav, arrow and page link names                                     |
| PriceSummary    | `Total` (`totalLabel`)                                                           | total term                                                         |
| StepTracker     | `Done` / `In progress` / `Not started yet`                                       | visually hidden state text per step (dev parity)                   |

**Open questions for the owner (defaults applied, nothing blocks):**

1. **Alert on dark fields** — applied: opaque light island (standard warning panel on ink). Alternative: the handoff's translucent tint (`rgba(242,178,51,.14)` + white text) for all six tones, which needs four alpha primitives and 24 surface overrides.
2. **Status message colours on dark fields** — Plan 1's surfaces remap `text-subtle` but not `text-success/warning/danger`, so a Field/OtpInput/SlotPicker status message on an ink or brand field would fail contrast. No current page puts a form control on a dark field; if one appears, those three text tokens need ink/brand overrides in `surface/*.json`.
3. **Toast/Snackbar success fill** — applied: strong mint (policy-compliant). Confirm the darker green reads right next to the brand pink toasts.
4. **Field text size** — the system's field text is 15px (Plan 2b `text-control`, the design system's value); iOS Safari zooms the page into any focused input under 16px. SearchField follows the system; raising `text-control` to 16px would fix every field at once.

**Controller rulings applied:** R13 (optional props accept `undefined`), R15 (file paths in tests), R19 (one shared symbol mask), the slot class rule, reuse of Plan 2a/2b internals, `max-w-text-measure-*` over `max-w-prose`, and the placeable toast viewport (`isContained`, deviation 4a).

## File map (this plan)

```
packages/design-tokens/
  tokens/component/{field-layout,quantity-stepper,otp-input,slot-picker,alert,toast,snackbar,empty-state,
                    tabs,breadcrumb,section-header,stat,accordion,price-summary,step-tracker}.json   C
  tokens/surface/{brand,ink,light}.json           M  (breadcrumb, price-summary, step-tracker skins)
  contrast-pairs.json                             M  (one group per component that paints a new pair)
packages/ui/src/
  lib/{use-controllable-state.ts,use-controllable-state.test.tsx,assign-ref.ts,assign-ref.spec.ts,
       field-message.tsx,field-message.test.tsx,notification.ts}                                  C
  lib/component-variants.ts                       M  (SPACING and TEXT lists)
  styles.css                                      M  (@utility search-reset, details-content-motion)
  molecules/field/{field.tsx,field.test.tsx,field.stories.tsx}                                    C
  molecules/search-field/{search-field.tsx,search-field.test.tsx,search-field.stories.tsx}        C
  molecules/quantity-stepper/{quantity-stepper.tsx,…test.tsx,…stories.tsx}                        C
  molecules/otp-input/{otp-input.tsx,…test.tsx,…stories.tsx}                                      C
  molecules/slot-picker/{slot-picker.tsx,…test.tsx,…stories.tsx}                                  C
  molecules/alert/{alert.tsx,alert-dismiss.tsx,alert.test.tsx,alert.stories.tsx}                  C
  molecules/toast/{toast.tsx,toast.test.tsx,toast.stories.tsx}                                    C
  molecules/snackbar/{snackbar.tsx,…test.tsx,…stories.tsx}                                        C
  molecules/empty-state/{empty-state.tsx,…test.tsx,…stories.tsx}                                  C
  molecules/tabs/{tabs.tsx,tabs.test.tsx,tabs.stories.tsx}                                        C
  molecules/breadcrumb/{breadcrumb.tsx,…test.tsx,…stories.tsx}                                    C
  molecules/pagination/{pagination.tsx,…test.tsx,…stories.tsx}                                    C
  molecules/section-header/{section-header.tsx,…test.tsx,…stories.tsx}                            C
  molecules/stat/{stat.tsx,stat.test.tsx,stat.stories.tsx}                                        C
  molecules/accordion/{accordion.tsx,…test.tsx,…stories.tsx}                                      C
  molecules/list-row/{list-row.tsx,…test.tsx,…stories.tsx}                                        C
  molecules/price-summary/{price-summary.tsx,…test.tsx,…stories.tsx}                              C
  molecules/step-tracker/{step-tracker.tsx,…test.tsx,…stories.tsx}                                C
  index.ts                                        M  (one export line per molecule)
```

---

### Task 0: Reconcile with the code as built

Plans 1, 2a, 2b and 2c were written in parallel with this one and executed before it. This task proves every interface this plan consumes exists exactly as the code below uses it, and patches the later tasks of **this file** where reality differs — before any molecule is written.

**Files:**

- Modify (only if a check fails): this plan; `packages/ui/src/atoms/input/input.tsx` (+ its test)

**Interfaces:**

- Consumes: everything listed in the Contracts and Depends-on lines above.
- Produces: a green baseline and a "Reconciliation notes" list appended under this task.

- [ ] **Step 1: Baseline is green**

Run:

```bash
git log --oneline | head -60
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static 2>&1 | tail -15 \
  && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -5
```

Expected: the Plan 1, 2a, 2b and 2c commits are in the log and every target is green. If anything is red, stop: an earlier plan is unfinished.

- [ ] **Step 2: The library internals this plan reuses exist with the declared shapes**

Run:

```bash
cd packages/ui
rtk proxy grep -n -E "^export (function|const|type|interface) " \
  src/lib/component-variants.ts src/lib/heading.ts src/lib/link-as.ts src/lib/field-status.ts \
  src/lib/field-control.tsx src/lib/choice-control.tsx src/lib/symbol-mark.tsx src/lib/story-surfaces.tsx
rtk proxy grep -n -E "aria-current|export function fakeRegister" src/lib/link-as.ts vitest.setup.ts
rtk proxy grep -rn -E "@utility mask-symbol|--pp-symbol-mask" src/lib/*.css
rtk proxy grep -n -E "@utility (transition-control|z-toast|duration-fast|duration-base|press-scale)|--animate-(toast-pop|sheet-in):" src/styles.css
rtk proxy grep -n -E "^const (TEXT|SPACING) = " src/lib/component-variants.ts
cd ../..
```

Expected, and where each is used:

| Internal                                                                                                                                                                                                                                                                             | Shape relied on                                     | Used by                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `componentVariants`, `TEXT`, `SPACING`                                                                                                                                                                                                                                               | Plan 1                                              | every task                                                                                              |
| `HeadingLevel`, `headingTag`                                                                                                                                                                                                                                                         | Plan 2a                                             | EmptyState, SectionHeader                                                                               |
| `LinkAs`, `LinkAsProps` with `"aria-current"?: "page" \| "step" \| "true" \| undefined` (ruling R13)                                                                                                                                                                                 | Plan 2a                                             | Breadcrumb, Pagination — if the `\| undefined` is missing, Task 13 spreads `aria-current` conditionally |
| `FieldStatus`, `FIELD_STATUS_ICON` (`error` → CircleAlert, `success` → CircleCheck, `warning` → TriangleAlert)                                                                                                                                                                       | Plan 2b                                             | Task 1 `FieldMessage`                                                                                   |
| `FieldControl({ size, status, icon, isLoading, isReadOnly, trailing, className, children: (controlClassName) => … })` — sets `data-surface="light"`, draws the status glyph and the pulsing loading mark; `fieldControlVariants({ size, status }).root(…)` — the same box as classes | Plan 2b `lib/field-control.tsx`                     | SearchField (component), OtpInput (cells, via the variants)                                             |
| `joinIds(...ids)`                                                                                                                                                                                                                                                                    | Plan 2b `lib/choice-control.tsx`                    | SearchField, SlotPicker                                                                                 |
| `OnSurfaces({ children })`                                                                                                                                                                                                                                                           | Plan 2a `lib/story-surfaces.tsx`                    | every `Surfaces`/`OnSurfaces` story                                                                     |
| `SymbolMark({ className })` → `<span aria-hidden="true" class="mask-symbol …">`, painted in `currentColor`, sized by class — ruling R19 (one shared CSS mask, no path data per instance)                                                                                             | Plan 2a `lib/symbol-mark.tsx`, Plan 1 `mask-symbol` | EmptyState, StepTracker                                                                                 |
| `transition-control` utility                                                                                                                                                                                                                                                         | Plan 2a                                             | QuantityStepper                                                                                         |
| `fakeRegister(name)` → `{ name, onChange, onBlur, ref }` spies                                                                                                                                                                                                                       | Plan 2b `vitest.setup.ts`                           | Field                                                                                                   |

(Plan 2b also exports an internal `FieldControlProps` from `lib/field-control.tsx`; this plan's public `FieldControlProps` lives in `molecules/field/field.tsx`. No file imports both, so the names never meet.)

- [ ] **Step 3: The atoms this plan composes behave as the code below assumes**

Read each file and tick the row, or patch the named task:

| Atom file (`packages/ui/src/atoms/…`)  | This plan relies on                                                                                                                                                                                                                           | If different, patch                                                                                                                                                                                                  |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `icon/icon.tsx`                        | `Icon({ icon, size: "xs"…"xl", label?, className })`; `className` merges through `componentVariants` (so `size-10`, `size-3` override the size class); unlabelled icons are `aria-hidden`; lucide adds `lucide-<name>` classes to the `<svg>` | every task                                                                                                                                                                                                           |
| `price-tag/price-tag.tsx`              | the default `ink` tone paints the amount `text-text-heading` (follows the surface)                                                                                                                                                            | Task 18: if not, pass the total `className="text-text-heading"`                                                                                                                                                      |
| `input/input.tsx`                      | spreads `id`, `aria-describedby`, `aria-invalid`, `required`, `name`, `onChange`, `onBlur`, `ref` onto the `<input>`; a passed `aria-invalid` survives when `status` is `default`                                                             | if `status` overwrites a passed `aria-invalid`, change Input to `aria-invalid={props["aria-invalid"] ?? (status === "error" ? true : undefined)}` with a test, commit `fix(ui): input keeps a caller's aria-invalid` |
| `select/select.tsx`                    | `Select({ options, placeholder, status, defaultValue })`                                                                                                                                                                                      | Task 2 stories                                                                                                                                                                                                       |
| `switch/switch.tsx`                    | `Switch({ label, isLabelHidden, defaultChecked })`                                                                                                                                                                                            | Task 17 stories                                                                                                                                                                                                      |
| `badge/badge.tsx`, `button/button.tsx` | `Badge({ tone: "soft" })`; `Button({ variant: "ghost" \| "primary" \| "secondary", size: "sm", iconAfter })`                                                                                                                                  | stories                                                                                                                                                                                                              |

- [ ] **Step 4: Every token the code below names exists**

Run:

```bash
node -e '
const t = require("./packages/design-tokens/dist/tokens.json");
const names = new Set(t.filter((e) => e.surface === null).map((e) => e.name));
const need = ["color-text-body","color-text-heading","color-text-muted","color-text-subtle","color-text-brand",
  "color-text-on-brand","color-text-on-inverse","color-text-success","color-text-warning","color-text-danger",
  "color-text-info","color-surface-page","color-surface-page-alt","color-surface-card","color-surface-sunken",
  "color-surface-brand","color-surface-brand-soft","color-surface-inverse","color-border-subtle",
  "color-border-default","color-border-brand","color-border-brand-soft","color-brand-hover","color-status-success",
  "color-status-success-soft","color-status-warning","color-status-warning-soft","color-status-danger",
  "color-status-danger-soft","color-status-info","color-status-info-soft","color-mint-strong","color-pink-300",
  "color-pink-500","color-pink-700","color-pink-800","color-ink-000","color-ink-200","color-ink-400",
  "color-ink-700","color-white-alpha-25","color-white-alpha-50","color-white-alpha-70","color-focus","shadow-3",
  "shadow-focus-ring","spacing-hit","spacing-dock-clearance","spacing-text-measure-narrow","radius-xs",
  "radius-sm","radius-md","radius-lg","radius-xl","radius-pill","text-h2-fluid","text-h3","text-h4",
  "text-body-lg","text-body","text-body-sm","text-caption","text-overline","text-mono","font-weight-bold",
  "font-weight-black"];
const missing = need.filter((n) => !names.has(n));
console.log(missing.length ? "MISSING: " + missing.join(", ") : "all tokens present");
for (const f of ["brand", "ink", "light"]) {
  const j = require(`./packages/design-tokens/tokens/surface/${f}.json`);
  const root = Object.keys(j)[0];
  console.log(f, root, Object.keys(j[root]));
}
'
```

Expected: `all tokens present`, and each surface file prints `surface-<name>` with a `color` group (this plan adds component skins inside it). A missing name means an earlier plan renamed it: patch every occurrence in this file.

- [ ] **Step 5: Lint escapes the contract types need**

`FieldControlProps` declares the quoted property `"aria-describedby"`. Run:

```bash
rtk proxy grep -n -A3 "requiresQuotes" tools/eslint-config/rules/naming-convention.js
```

Expected: Plan 2a's `typeProperty` + `requiresQuotes` escape. If it is missing, stop — Plan 2a Task 1 is unfinished.

- [ ] **Step 6: Story tooling**

Run:

```bash
node -e "console.log(require.resolve('storybook/test', { paths: ['packages/ui'] }))"
rtk proxy grep -rln "storybook/test" packages/ui/src | head -3
rtk proxy grep -n -E "viewports|mobile1|defaultViewport" apps/storybook/.storybook/preview.tsx | head -5
```

Expected: `storybook/test` resolves (root devDependency) and earlier stories already import it; note the id of the 360px viewport (Task 12's `Long` story uses `mobile1`).

- [ ] **Step 7: Dev parity tables present on every ported-component task**

Contracts §0.0: every molecule here is ported from `dev`. Run:

```bash
rtk proxy grep -n -E "^### Task|^\*\*Dev (reference|parity)" docs/superpowers/plans/2026-09-27-ds-03a-molecules-system.md
```

Expected: Tasks 2–19 each carry a `**Dev reference:**` line and a `**Dev parity:**` table (Task 1 carries the `FieldMessage` table). A missing one means the task was edited after the dev-parity audit — restore it from `.superpowers/sdd/dev-parity/03a-audit.md` before executing. Rows ruled `DELTA` wait on the controller's contract ruling: implement them only if the contracts file has gained the prop.

- [ ] **Step 8: Record and commit the reconciliation**

Append a `**Reconciliation notes:**` list under this task (one line per patch made, or "none"). If this file changed, commit it:

```bash
git add docs/superpowers/plans/2026-09-27-ds-03a-molecules-system.md
git commit -m "docs: reconcile plan 3a with the code as built

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 1: Shared internals — controllable state, field message, ref hand-off

**Files:**

- Create: `packages/ui/src/lib/use-controllable-state.ts`, `packages/ui/src/lib/use-controllable-state.test.tsx`
- Create: `packages/ui/src/lib/assign-ref.ts`, `packages/ui/src/lib/assign-ref.spec.ts`
- Create: `packages/ui/src/lib/field-message.tsx`, `packages/ui/src/lib/field-message.test.tsx`

**Dev reference:** `FieldMessage` lives in `git show dev:packages/ui/src/molecules/field/field.{tsx,test.tsx}`; `useControllableState` and `assignRef` have no dev counterpart (dev's molecules each kept their own `useState`).

**Dev parity (FieldMessage):**

| Dev item                                                                        | Ruling  | Where / why                                                                                   |
| ------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------- |
| error message is `role="alert"` (announced without focus)                       | ADD     | `FieldMessage` + test "announces an error message…"                                           |
| a `message` on the `default` status still shows, neutral, no glyph, over a hint | ADD     | `FieldMessage` / `hasFieldMessage` + test "shows a message on the default status…"            |
| renders nothing without hint or message                                         | ALREADY | test "renders nothing without a hint or a status message"                                     |
| per-status colour + glyph; message replaces hint                                | ALREADY | `it.each` status test                                                                         |
| `loading` status → Spinner beside the message; `disabled`/`readOnly` statuses   | DROP    | contracts §1 `FieldStatus` has four values; modes are control props (spec §8.2, Input/Select) |
| exported `FIELD_STATUS_TONE` map                                                | DROP    | contracts §1 exports only `FieldStatus` + `FIELD_STATUS_ICON`; tone lives in the variant      |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `componentVariants` (Plan 1), `Icon` (Plan 1), `FieldStatus` / `FIELD_STATUS_ICON` (Plan 2b).
- Produces (internal, never exported from `src/index.ts`):
  - `useControllableState<T>({ value: T | undefined; defaultValue: T; onChange?: ((value: T) => void) | undefined }): readonly [T, (next: T) => void]`
  - `assignRef<T>(ref: Ref<T> | undefined, node: T | null): void`
  - `FieldMessage({ id, status?, message?, hint?, className? })` and `hasFieldMessage({ status?, message?, hint? }): boolean`

Why these exist (handbook 03 §7 — a hook earns existence by owning a rule): `useControllableState` owns _a controlled value is never copied into state, and a change is reported once, synchronously, only when it is real_ for six molecules; `FieldMessage` owns _a status always shows its glyph and words, and replaces the hint_ (spec §3.8) for four. Radix ships a `useControllableState` in `radix-ui/internal`, but that entry point is not a public API and its uncontrolled callback fires from an effect, one render late. Everything else these molecules share already exists in the lower tiers and is reused, not redrawn (Task 0 Step 2).

- [ ] **Step 1: Write the failing tests**

`packages/ui/src/lib/use-controllable-state.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useControllableState } from "./use-controllable-state";

interface HarnessProps {
  value?: string | undefined;
  defaultValue?: string | undefined;
  onChange?: ((value: string) => void) | undefined;
}

/** One value, two buttons: one flips it, one sets it to what it already is. */
function Harness({ value, defaultValue = "off", onChange }: HarnessProps) {
  const [current, setCurrent] = useControllableState({ value, defaultValue, onChange });
  return (
    <>
      <output>{current}</output>
      <button
        type="button"
        onClick={() => {
          setCurrent(current === "off" ? "on" : "off");
        }}
      >
        Flip
      </button>
      <button
        type="button"
        onClick={() => {
          setCurrent(current);
        }}
      >
        Keep
      </button>
    </>
  );
}

describe("useControllableState", () => {
  it("keeps its own value when uncontrolled, starting from defaultValue", async () => {
    const user = userEvent.setup();
    render(<Harness defaultValue="on" />);
    expect(screen.getByRole("status")).toHaveTextContent("on");
    await user.click(screen.getByRole("button", { name: "Flip" }));
    expect(screen.getByRole("status")).toHaveTextContent("off");
  });

  it("reports every change when uncontrolled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Flip" }));
    await user.click(screen.getByRole("button", { name: "Flip" }));
    expect(onChange.mock.calls).toEqual([["on"], ["off"]]);
  });

  it("only reports when controlled — the caller's value wins until it changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<Harness value="off" onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Flip" }));
    expect(onChange).toHaveBeenCalledWith("on");
    expect(screen.getByRole("status")).toHaveTextContent("off");
    rerender(<Harness value="on" onChange={onChange} />);
    expect(screen.getByRole("status")).toHaveTextContent("on");
  });

  it.each([
    ["uncontrolled", undefined],
    ["controlled", "off"],
  ] as const)("never reports a set to the value it already holds (%s)", async (_mode, value) => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness value={value} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Keep" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
```

`packages/ui/src/lib/assign-ref.spec.ts`:

```ts
import { createRef } from "react";

import { assignRef } from "./assign-ref";

describe("assignRef", () => {
  it("calls a callback ref with the node", () => {
    const ref = vi.fn();
    const node = document.createElement("input");
    assignRef(ref, node);
    expect(ref).toHaveBeenCalledWith(node);
  });

  it("sets an object ref's current", () => {
    const ref = createRef<HTMLInputElement>();
    const node = document.createElement("input");
    assignRef(ref, node);
    expect(ref.current).toBe(node);
  });

  it("does nothing without a ref", () => {
    expect(() => {
      assignRef(undefined, null);
    }).not.toThrow();
  });
});
```

`packages/ui/src/lib/field-message.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { FieldMessage, hasFieldMessage } from "./field-message";

describe("FieldMessage", () => {
  it("renders nothing without a hint or a status message", () => {
    const { container } = render(<FieldMessage id="m" />);
    expect(container).toBeEmptyDOMElement();
    expect(hasFieldMessage({})).toBe(false);
  });

  it("renders the hint, muted, under the id a control references", () => {
    render(<FieldMessage id="m" hint="You can change this later." />);
    const hint = screen.getByText("You can change this later.");
    expect(hint).toHaveAttribute("id", "m");
    expect(hint).toHaveClass("text-text-subtle");
    expect(hasFieldMessage({ hint: "You can change this later." })).toBe(true);
  });

  it.each([
    ["error", "text-text-danger"],
    ["success", "text-text-success"],
    ["warning", "text-text-warning"],
  ] as const)("replaces the hint with the %s message and its glyph", (status, colour) => {
    const { container } = render(
      <FieldMessage id="m" status={status} message="Pick a heat level." hint="Hint." />
    );
    expect(screen.queryByText("Hint.")).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass(colour);
    expect(container.firstElementChild).toHaveAttribute("id", "m");
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("announces an error message without waiting for focus; success and warning stay polite", () => {
    const { rerender } = render(
      <FieldMessage id="m" status="error" message="That code has expired." />
    );
    expect(screen.getByRole("alert")).toHaveTextContent("That code has expired.");
    rerender(<FieldMessage id="m" status="success" message="PAPRIKAA50 applied." />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows a message on the default status in the neutral tone, without a glyph, over the hint", () => {
    const { container } = render(
      <FieldMessage id="m" message="Two slots left at 7:30pm." hint="Hint." />
    );
    expect(screen.getByText("Two slots left at 7:30pm.")).toHaveClass("text-text-subtle");
    expect(screen.queryByText("Hint.")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeInTheDocument();
    expect(hasFieldMessage({ message: "Two slots left at 7:30pm." })).toBe(true);
  });

  it("falls back to the hint when a status has no message — never a colour without words", () => {
    render(<FieldMessage id="m" status="error" hint="You can change this later." />);
    expect(screen.getByText("You can change this later.")).toHaveClass("text-text-subtle");
    expect(hasFieldMessage({ status: "error" })).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/lib 2>&1 | tail -12`
Expected: FAIL — cannot resolve `./use-controllable-state`, `./assign-ref`, `./field-message`.

- [ ] **Step 3: Implement**

`packages/ui/src/lib/use-controllable-state.ts`:

```ts
import { useState } from "react";

export interface ControllableStateOptions<T> {
  /** The caller's value. Defined = controlled: the caller owns it and the setter only reports. */
  value: T | undefined;
  /** The starting value when uncontrolled. */
  defaultValue: T;
  /** Called with every new value, controlled or not — never for a set to the current value. */
  onChange?: ((value: T) => void) | undefined;
}

/**
 * One value, controlled or uncontrolled — the Radix convention every value-based molecule follows
 * (`value` / `defaultValue` / `onValueChange`, spec §8.1). The rule it owns: a controlled value is
 * never copied into local state, an uncontrolled one is, and the change is reported synchronously,
 * once, only when the value actually changes.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: ControllableStateOptions<T>): readonly [T, (next: T) => void] {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : uncontrolled;

  function setValue(next: T): void {
    if (Object.is(next, current)) return;
    if (!isControlled) setUncontrolled(next);
    onChange?.(next);
  }

  return [current, setValue] as const;
}
```

`packages/ui/src/lib/assign-ref.ts`:

```ts
import type { Ref } from "react";

/**
 * Hands `node` to a consumer's ref, callback or object. For a component that keeps a ref of its
 * own and must still forward the caller's (React 19: `ref` is a plain prop) — SearchField returns
 * focus to its input, and react-hook-form's Controller focuses the same input on error.
 */
export function assignRef<T>(ref: Ref<T> | undefined, node: T | null): void {
  if (typeof ref === "function") {
    ref(node);
  } else if (ref !== null && ref !== undefined) {
    ref.current = node;
  }
}
```

`packages/ui/src/lib/field-message.tsx`:

```tsx
import type { ReactNode } from "react";

import { Icon } from "../atoms/icon/icon";
import { componentVariants } from "./component-variants";
import { FIELD_STATUS_ICON, type FieldStatus } from "./field-status";

const fieldMessage = componentVariants({
  base: "m-0 flex min-w-0 items-start gap-1.5 text-caption",
  variants: {
    status: {
      default: "text-text-subtle",
      error: "text-text-danger",
      success: "text-text-success",
      warning: "text-text-warning",
    },
  },
  defaultVariants: { status: "default" },
});

export interface FieldMessageContent {
  status?: FieldStatus | undefined;
  message?: ReactNode;
  hint?: ReactNode;
}

export interface FieldMessageProps extends FieldMessageContent {
  /** The id the control lists in `aria-describedby`. */
  id: string;
  className?: string | undefined;
}

function isShown(node: ReactNode): boolean {
  return node !== undefined && node !== null && node !== false && node !== "";
}

/** True when `FieldMessage` renders a line — a control references its id only then. */
export function hasFieldMessage({ message, hint }: FieldMessageContent): boolean {
  return isShown(message) || isShown(hint);
}

/**
 * The line under a control — one system for every control (spec §3.8): a status (error, success,
 * warning) shows its glyph and its message in the status colour and replaces the hint; an error
 * is `role="alert"`, so it is announced without waiting for focus (dev parity). Otherwise the
 * message (or else the hint) shows, muted. A status without a message keeps the hint: never a
 * colour without words.
 */
export function FieldMessage({
  id,
  status = "default",
  message,
  hint,
  className,
}: FieldMessageProps) {
  if (status !== "default" && isShown(message)) {
    return (
      <p
        id={id}
        role={status === "error" ? "alert" : undefined}
        className={fieldMessage({ status, className })}
      >
        <Icon icon={FIELD_STATUS_ICON[status]} size="xs" className="mt-px" />
        <span className="min-w-0">{message}</span>
      </p>
    );
  }
  const text = isShown(message) ? message : hint;
  if (isShown(text)) {
    return (
      <p id={id} className={fieldMessage({ className })}>
        {text}
      </p>
    );
  }
  return null;
}
```

- [ ] **Step 4: Run to verify they pass**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/lib 2>&1 | tail -12`
Expected: PASS (the three new files plus the existing lib suites).

- [ ] **Step 5: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/lib && pnpm exec prettier --write packages/ui/src/lib
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 6: Commit**

```bash
git add -A packages/ui
git commit -m "feat(ui): shared internals for the molecules

useControllableState owns controlled/uncontrolled values for every
value-based molecule (reports once, synchronously, only on a real change);
FieldMessage owns the hint-or-status line under every control; assignRef
forwards a consumer's ref beside a component's own.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 2: Field

Design-system sources: `components/molecules/Field.{jsx,d.ts,card.html,prompt.md}`. Card rows: stack + hint · required · error · success · `layout="side"` (translated to `orientation="side"`).

**Files:**

- Create: `packages/design-tokens/tokens/component/field-layout.json`
- Create: `packages/ui/src/molecules/field/field.tsx`, `field.test.tsx`, `field.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/field/field.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                               | Ruling  | Where / why                                                                                                       |
| -------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| `side` splits into two columns from 480px (`sm`) only; stacks on a 360px screen        | ADD     | `side` variant `sm:grid-cols-field-side` / `sm:pt-3.25` + side test                                               |
| label mutes while the control is disabled (`status="disabled"` on dev)                 | ADD     | CSS, no prop: `group/form-field` + `group-has-disabled/form-field:text-text-subtle` + test + `ControlModes` story |
| required marker is brand-coloured                                                      | ADD     | class assertion in the required test                                                                              |
| caller `className` replaces the root gap                                               | ADD     | test "merges a caller className…"                                                                                 |
| story states readOnly / loading / disabled / multiline notes                           | ADD     | `ControlModes` story (the modes are the control's props)                                                          |
| error message `role="alert"`; message on `default` status shown neutral                | ADD     | Task 1 `FieldMessage`                                                                                             |
| `status` values `loading` / `disabled` / `readOnly` (+ loading-diamond message)        | DROP    | contracts §1 `FieldStatus` has four values; modes are control props (spec §8.2)                                   |
| label as plain text when no `htmlFor`; `AroundABareControl` story (Field around chips) | DROP    | spec §9.2 render-prop wiring always labels one control; groups carry their own legend + message (deviation 1)     |
| `side` collapses to `stack` without a label                                            | ALREADY | `label` is required by type                                                                                       |
| `layout` / `htmlFor` props                                                             | ALREADY | renamed `orientation` / `id` (contracts §5, deviation 9)                                                          |
| hint; message replaces hint; per-status colour + one glyph; optional; hidden `*`       | ALREADY | tests "describes…", "replaces the hint…", `it.each` success/warning, "marks an optional…", "marks a required…"    |
| message id the control points at                                                       | ALREADY | wired automatically by the render prop (`aria-describedby`)                                                       |
| axe over required, error, side + optional                                              | ALREADY | axe test (rest + error)                                                                                           |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `FieldMessage`, `hasFieldMessage` (Task 1); `FieldStatus` (Plan 2b); `fakeRegister` (Plan 2b, `vitest.setup.ts`); `Input`, `Select` (Plan 2b, tests and stories only).
- Produces: `Field`, `FieldProps`, `FieldControlProps` — contract §5 (`id` names the control, deviation 9). Render prop: `children(control)` receives `{ id }` plus `"aria-describedby"`, `"aria-invalid": true` and `required: true` **only when each applies** — a key that does not apply is absent, never `undefined`, so a control that spreads the caller's props after its own (`{...own, ...props}`) never loses its own `aria-invalid` to Field's silence.

- [ ] **Step 1: Component token**

`packages/design-tokens/tokens/component/field-layout.json` (Plan 2b's `field.json` holds the field box; this file holds the Field molecule's layout):

```json
{
  "grid-template-columns": {
    "field-side": {
      "$value": "minmax(0, 160px) minmax(0, 1fr)",
      "$description": "Field orientation=\"side\": the design system's 160px label column beside the control. Utility: grid-cols-field-side."
    }
  }
}
```

(`grid-template-columns` is a Tailwind v4 theme namespace — `grid-cols-*` reads `--grid-template-columns-*` — and not one of the scale lists `component-variants.ts` declares, so no list changes.)

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && rtk proxy grep -n "grid-template-columns-field-side" packages/design-tokens/dist/theme.css`
Expected: `--grid-template-columns-field-side: minmax(0, 160px) minmax(0, 1fr);`

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/field/field.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations, fakeRegister } from "../../../vitest.setup";
import { Input } from "../../atoms/input/input";
import { Field, type FieldControlProps } from "./field";

function renderInput(control: FieldControlProps) {
  return <input {...control} />;
}

describe("Field", () => {
  it("labels the control and hands it only the keys that apply", () => {
    const children = vi.fn(renderInput);
    render(<Field label="Mobile number">{children}</Field>);
    const input = screen.getByRole("textbox", { name: "Mobile number" });
    // Keys, not values: `toHaveBeenCalledWith` would treat an `undefined` key as absent.
    expect(Object.keys(children.mock.calls[0]?.[0] ?? {})).toEqual(["id"]);
    expect(children.mock.calls[0]?.[0].id).toBe(input.id);
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toBeRequired();
  });

  it("describes the control with its hint", () => {
    render(
      <Field label="Outlet" hint="Pickup only for now.">
        {renderInput}
      </Field>
    );
    expect(screen.getByRole("textbox", { name: "Outlet" })).toHaveAccessibleDescription(
      "Pickup only for now."
    );
  });

  it("replaces the hint with the error message, marks the control invalid and shows the glyph", () => {
    const { container } = render(
      <Field
        label="How spicy?"
        hint="You can change this later."
        status="error"
        message="Pick a heat level."
      >
        {renderInput}
      </Field>
    );
    const input = screen.getByRole("textbox", { name: "How spicy?" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Pick a heat level.");
    expect(screen.queryByText("You can change this later.")).not.toBeInTheDocument();
    expect(container.querySelector("p svg")).toBeInTheDocument();
  });

  it.each(["success", "warning"] as const)(
    "shows a %s message without marking the control invalid",
    (status) => {
      render(
        <Field label="Promo code" status={status} message="PAPRIKAA50 applied.">
          {renderInput}
        </Field>
      );
      const input = screen.getByRole("textbox", { name: "Promo code" });
      expect(input).not.toHaveAttribute("aria-invalid");
      expect(input).toHaveAccessibleDescription("PAPRIKAA50 applied.");
    }
  );

  it("keeps the hint when a status has no message — never a colour without words", () => {
    render(
      <Field label="Outlet" hint="Pickup only for now." status="error">
        {renderInput}
      </Field>
    );
    expect(screen.getByRole("textbox", { name: "Outlet" })).toHaveAccessibleDescription(
      "Pickup only for now."
    );
  });

  it("marks a required control without reading the star aloud", () => {
    render(
      <Field label="Mobile number" isRequired>
        {renderInput}
      </Field>
    );
    expect(screen.getByRole("textbox", { name: "Mobile number" })).toBeRequired();
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("*")).toHaveClass("text-text-brand");
  });

  it("marks an optional control in its label", () => {
    render(
      <Field label="Promo code" isOptional>
        {renderInput}
      </Field>
    );
    expect(screen.getByRole("textbox", { name: "Promo code optional" })).not.toBeRequired();
  });

  it("gives the control the id it is asked for", () => {
    render(
      <Field label="Outlet" id="outlet">
        {renderInput}
      </Field>
    );
    expect(screen.getByRole("textbox", { name: "Outlet" })).toHaveAttribute("id", "outlet");
  });

  it("puts the label in a column beside the control from 480px up when orientation is side", () => {
    const { container } = render(
      <Field label="Outlet" orientation="side">
        {renderInput}
      </Field>
    );
    // Below `sm` it stacks: a 160px label column leaves a 360px screen's control too narrow.
    expect(container.firstElementChild).toHaveClass("sm:grid-cols-field-side");
    expect(container.firstElementChild).not.toHaveClass("grid-cols-field-side");
    expect(screen.getByText("Outlet").closest("label")).toHaveClass("sm:pt-3.25");
  });

  it("mutes the label while the control it labels is disabled", () => {
    const { container } = render(
      <Field label="Pickup time">{(control) => <input {...control} disabled />}</Field>
    );
    // jsdom cannot evaluate `:has()`; the class is the contract, the story shows the effect.
    expect(container.firstElementChild).toHaveClass("group/form-field");
    expect(screen.getByText("Pickup time").closest("label")).toHaveClass(
      "group-has-disabled/form-field:text-text-subtle"
    );
  });

  it("merges a caller className over its own gap", () => {
    const { container } = render(
      <Field label="Outlet" className="gap-6">
        {renderInput}
      </Field>
    );
    expect(container.firstElementChild).toHaveClass("gap-6");
    expect(container.firstElementChild).not.toHaveClass("gap-1.5");
  });

  it("keeps its wiring when a react-hook-form register() result is spread after it", async () => {
    const user = userEvent.setup();
    const registered = fakeRegister("phone");
    render(
      <Field label="Mobile number" status="error" message="Enter a 10-digit number." isRequired>
        {(control) => <Input {...control} {...registered} status="error" />}
      </Field>
    );
    const input = screen.getByRole("textbox", { name: "Mobile number" });
    expect(input).toHaveAttribute("name", "phone");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Enter a 10-digit number.");
    expect(input).toBeRequired();
    expect(registered.ref).toHaveBeenCalledWith(input);
    await user.type(input, "9");
    await user.tab();
    expect(registered.onChange).toHaveBeenCalled();
    expect(registered.onBlur).toHaveBeenCalled();
  });

  it("has no accessibility violations at rest or in error", async () => {
    const { container } = render(
      <>
        <Field label="Outlet" hint="Pickup only for now.">
          {renderInput}
        </Field>
        <Field label="How spicy?" status="error" message="Pick a heat level." isRequired>
          {renderInput}
        </Field>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/field 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./field`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/field/field.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { useId } from "react";

import type { FieldStatus } from "../../lib/field-status";

import { componentVariants } from "../../lib/component-variants";
import { FieldMessage, hasFieldMessage } from "../../lib/field-message";

const field = componentVariants({
  slots: {
    // `group/form-field` + `group-has-disabled/form-field:` mute the label while the control is
    // disabled (dev parity) — CSS, no prop. Named apart from Plan 2b's `group/field` (the box).
    root: "group/form-field grid min-w-0",
    label:
      "flex items-baseline gap-1.5 text-body-sm font-medium text-text-body group-has-disabled/form-field:text-text-subtle",
    required: "text-text-brand",
    optional: "font-normal text-caption text-text-subtle",
    control: "grid min-w-0 gap-1.5",
  },
  variants: {
    orientation: {
      stack: { root: "gap-1.5" },
      // Two columns from `sm` (480px) up only; below it the field stacks (dev parity).
      side: {
        root: "sm:grid-cols-field-side gap-1.5 sm:items-start sm:gap-4",
        label: "sm:pt-3.25",
      },
    },
  },
  defaultVariants: { orientation: "stack" },
});

/** What `children` receives: spread it onto the one control the field labels. */
export interface FieldControlProps {
  id: string;
  "aria-describedby"?: string | undefined;
  "aria-invalid"?: true | undefined;
  required?: true | undefined;
}

export interface FieldProps extends Omit<ComponentProps<"div">, "children" | "id"> {
  label: ReactNode;
  /** Helper text under the control. Replaced by `message` while a status is set. */
  hint?: ReactNode;
  status?: FieldStatus | undefined;
  /** The status message — react-hook-form's `fieldState.error?.message`, for instance. */
  message?: ReactNode;
  isRequired?: boolean | undefined;
  /** Mark the optional fields rather than starring the required ones. */
  isOptional?: boolean | undefined;
  /** `stack` puts the label above; `side` gives it a 160px column from 480px up (stacks below). */
  orientation?: "stack" | "side" | undefined;
  /** The control's id (default: generated). The wrapper itself takes no id. */
  id?: string | undefined;
  children: (control: FieldControlProps) => ReactNode;
}

/**
 * Label, control and hint or status message, wired by render prop (spec §9.2): `children`
 * receives the ids and flags to spread onto the control, so the field works in a server
 * component and with react-hook-form's `register()` spread after it.
 */
export function Field({
  label,
  hint,
  status = "default",
  message,
  isRequired = false,
  isOptional = false,
  orientation = "stack",
  id,
  className,
  children,
  ...props
}: FieldProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const messageId = `${controlId}-message`;
  const styles = field({ orientation });

  // Only the keys that apply: an absent key cannot override a control's own attribute.
  const control: FieldControlProps = { id: controlId };
  if (hasFieldMessage({ status, message, hint })) control["aria-describedby"] = messageId;
  if (status === "error") control["aria-invalid"] = true;
  if (isRequired) control.required = true;

  return (
    <div className={styles.root({ className })} {...props}>
      <label htmlFor={controlId} className={styles.label()}>
        <span>{label}</span>
        {isRequired ? (
          <span aria-hidden="true" className={styles.required()}>
            *
          </span>
        ) : null}
        {isOptional ? (
          <>
            {" "}
            <span className={styles.optional()}>optional</span>
          </>
        ) : null}
      </label>
      <div className={styles.control()}>
        {children(control)}
        <FieldMessage id={messageId} status={status} message={message} hint={hint} />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/field 2>&1 | tail -8`
Expected: PASS (13 tests). If the react-hook-form test fails on `aria-invalid`, Task 0 Step 3's Input row was skipped — fix Input, not the test.

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/field/field.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Phone } from "lucide-react";

import { Input } from "../../atoms/input/input";
import { Select } from "../../atoms/select/select";
import { Field } from "./field";

const HEAT_LEVELS = [
  { value: "1", label: "Mild" },
  { value: "2", label: "Medium" },
  { value: "3", label: "Hot" },
  { value: "4", label: "Extra Hot" },
];

const meta = {
  title: "Molecules/Field",
  component: Field,
  args: {
    label: "Mobile number",
    children: (control) => <Input {...control} type="tel" icon={Phone} placeholder="98765 43210" />,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Label, bare control and hint or status message. Wrap any control that does not carry its own label — Input, Select, a custom widget. The control is wired by render prop: `children` receives `{ id, aria-describedby, aria-invalid, required }` (each only when it applies) to spread onto it, so Field works in server components and with react-hook-form's `register()` spread after it. A status (`error`, `success`, `warning`) shows its glyph and replaces the hint with `message` — never a status colour without words; pass the same `status` to the control for its border. Mark the *optional* fields rather than starring the required ones. Group controls (SlotPicker, RadioGroup) carry their own legend and message; do not wrap them.",
      },
    },
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "stack + hint". */
export const StackWithHint: Story = {
  args: {
    label: "How spicy?",
    hint: "You can change this later.",
    children: (control) => <Select {...control} options={HEAT_LEVELS} defaultValue="3" />,
  },
};

/** Card row "required" — `isRequired`. */
export const Required: Story = {
  args: {
    label: "Mobile number",
    isRequired: true,
    children: (control) => <Input {...control} type="tel" icon={Phone} placeholder="98765 43210" />,
  },
};

/** Card row "error" — `status="error"` + `message`. */
export const WithError: Story = {
  args: {
    label: "How spicy?",
    status: "error",
    message: "Pick a heat level.",
    children: (control) => (
      <Select
        {...control}
        options={HEAT_LEVELS}
        placeholder="Pick one"
        status="error"
        defaultValue=""
      />
    ),
  },
};

/** Card row "success" — `status="success"` + `message`. */
export const WithSuccess: Story = {
  args: {
    label: "Promo code",
    status: "success",
    message: "PAPRIKAA50 applied.",
    children: (control) => <Input {...control} defaultValue="PAPRIKAA50" status="success" />,
  },
};

/** Warning — the handoff Dawat calculator's guest rule. */
export const WithWarning: Story = {
  args: {
    label: "Guests",
    status: "warning",
    message: "Full setup and service starts at 50 guests.",
    children: (control) => <Input {...control} type="number" defaultValue="30" status="warning" />,
  },
};

/** `isOptional` — the design system's preferred marker. */
export const Optional: Story = {
  args: {
    label: "Promo code",
    isOptional: true,
    children: (control) => <Input {...control} placeholder="PAPRIKAA50" />,
  },
};

/** Card row `layout="side"` — `orientation="side"`: a 160px label column from 480px up; it stacks below. */
export const Side: Story = {
  args: {
    label: "Outlet",
    orientation: "side",
    hint: "Pickup only for now.",
    children: (control) => <Input {...control} defaultValue="Sector 57" />,
  },
};

/** Dev parity: the control's own modes inside a Field — read-only, loading, disabled (label mutes). */
export const ControlModes: Story = {
  render: () => (
    <div className="flex max-w-120 flex-col gap-6">
      <Field label="Outlet" hint="Pickup only for now.">
        {(control) => <Input {...control} defaultValue="Sector 57" readOnly />}
      </Field>
      <Field label="Promo code" hint="Checking that code.">
        {(control) => <Input {...control} defaultValue="PAPRIKAA50" isLoading />}
      </Field>
      <Field label="Table size" hint="Table booking opens at 11am.">
        {(control) => <Input {...control} disabled placeholder="Choose a table size" />}
      </Field>
      <Field label="Notes for the kitchen" isOptional>
        {(control) => <Input {...control} isMultiline rows={3} placeholder="Less oil, no onion" />}
      </Field>
    </div>
  ),
};
```

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export { Field, type FieldControlProps, type FieldProps } from "./molecules/field/field";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/field packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/field packages/ui/src/index.ts packages/design-tokens/tokens/component/field-layout.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): Field molecule wired by render prop

Label, hint and status message around any bare control. The render prop
hands the control its id and only the aria-describedby, aria-invalid and
required that apply, so Field is RSC-safe and a react-hook-form register()
spread keeps them.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 3: SearchField (client)

Design-system sources: `components/molecules/SearchField.*`. Card rows: empty · with value · loading · no results · disabled · `size="sm"`.

SearchField renders inside Plan 2b's `FieldControl` — the one field box every control shares (heights, status border, focus ring, disabled and read-only fills, the status glyph and the pulsing loading mark) — made pill-shaped with the design system's 16px inset. It adds only what a search box has that a field does not: the clear button and the controlled query.

**Files:**

- Create: `packages/ui/src/molecules/search-field/search-field.tsx`, `search-field.test.tsx`, `search-field.stories.tsx`
- Modify: `packages/ui/src/styles.css` (`@utility search-reset`), `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/search-field/search-field.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                    | Ruling  | Where / why                                                                                            |
| --------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| clear button hit area 40px (`min-h-10 min-w-10`)                            | ADD     | `clear` slot `relative before:absolute before:-inset-2` (24px glyph, 40px hit) + assertion             |
| fixed heights per size (40 / 48)                                            | ADD     | `it.each` size test (`h-field-sm` / `h-field-md`, Plan 2b)                                             |
| status raises the border to 2px and hangs a trailing glyph                  | ADD     | assertions in the status test (drawn by Plan 2b's `FieldControl`)                                      |
| disabled takes no typing, grey fill, never opacity                          | ADD     | disabled test                                                                                          |
| loading shows the pulsing diamond                                           | ADD     | assertion in the loading test                                                                          |
| read-only hides the clear button                                            | ADD     | test "never offers to clear a read-only box"                                                           |
| caller `className` merges                                                   | ADD     | test "merges a caller className…"                                                                      |
| axe over a disabled `sm` box                                                | ADD     | axe test                                                                                               |
| stories: success / error / read-only statuses; `Narrow` (w-80, long query)  | ADD     | `Statuses`, `Narrow` stories                                                                           |
| `clearLabel` override (default "Clear Search")                              | DELTA   | not in contracts §5; fixed "Clear search" per deviation 15 — proposed contract delta, see the 3a audit |
| default `label` "Search the menu" and dish placeholder                      | DROP    | spec D9 (no content defaults); contracts §5 makes `label` required                                     |
| `status` `loading` / `disabled` / `readOnly`                                | DROP    | contracts §1 `FieldStatus`; `isLoading`, `disabled`, `readOnly` props cover them                       |
| separate `message` prop beside `hint`                                       | DROP    | contracts §5 SearchField has one `hint` line that becomes the status message                           |
| native `onChange` as the value API                                          | ALREADY | `onValueChange` (spec §8.2, D17)                                                                       |
| clear only with a query; `onClear` called; hidden while loading             | ALREADY | tests "offers a clear button only…", "clears, reports…", "is busy…" (shows without `onClear`, dev. 10) |
| `aria-invalid` only on error; hint replaced; describedby → the showing line | ALREADY | status and describedby tests                                                                           |
| glass turns brand on focus                                                  | ALREADY | Plan 2b `FieldControl` (`group-focus-within/field:text-pink-500`)                                      |
| `Default`, `Interactive`, `Sizes` stories                                   | ALREADY | `Playground`, `WithValue` (play), `Small`                                                              |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `useControllableState`, `assignRef`, `FieldMessage`, `hasFieldMessage` (Task 1); `FieldControl` (`lib/field-control.tsx`), `joinIds` (`lib/choice-control.tsx`) — both Plan 2b; `Icon`.
- Produces: `SearchField`, `SearchFieldProps` — contract §5 (deviation 10). Native input props (`name`, `onBlur`, `ref`, `placeholder`, `disabled`, `readOnly`, `aria-describedby`) reach the `<input type="search">`; a caller's `aria-describedby` is kept beside the hint's id.

- [ ] **Step 1: No new tokens — one named utility**

Heights are Plan 2b's field tokens (`sm` 40, `md` 48 — the design system's SearchField sizes); the clear button is `size-6` (24px, WCAG 2.5.8). Native search inputs draw their own clear button and decorations, which would double SearchField's. Append to `packages/ui/src/styles.css`, after the `z-toast` utility:

```css
/* A search input without the browser's own clear button and decorations (SearchField draws its own). */
@utility search-reset {
  appearance: none;

  &::-webkit-search-decoration,
  &::-webkit-search-cancel-button,
  &::-webkit-search-results-button,
  &::-webkit-search-results-decoration {
    appearance: none;
  }
}
```

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/search-field/search-field.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { SearchField } from "./search-field";

describe("SearchField", () => {
  it("is a named, empty search box in a pill-shaped light field", () => {
    render(<SearchField label="Search the menu" />);
    const box = screen.getByRole("searchbox", { name: "Search the menu" });
    expect(box).toHaveValue("");
    expect(box.parentElement).toHaveClass("rounded-pill", "px-4");
    expect(box.parentElement).toHaveAttribute("data-surface", "light");
  });

  it.each([
    ["sm", "h-field-sm"],
    ["md", "h-field-md"],
  ] as const)("renders the %s size at its fixed height", (size, height) => {
    render(<SearchField label="Search the menu" size={size} />);
    expect(screen.getByRole("searchbox").parentElement).toHaveClass(height);
  });

  it("keeps and reports what is typed when uncontrolled", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<SearchField label="Search the menu" onValueChange={onValueChange} />);
    await user.type(screen.getByRole("searchbox"), "paneer");
    expect(screen.getByRole("searchbox")).toHaveValue("paneer");
    expect(onValueChange).toHaveBeenLastCalledWith("paneer");
  });

  it("shows the caller's value when controlled and only reports keystrokes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<SearchField label="Search the menu" value="chai" onValueChange={onValueChange} />);
    await user.type(screen.getByRole("searchbox"), "s");
    expect(onValueChange).toHaveBeenCalledWith("chais");
    expect(screen.getByRole("searchbox")).toHaveValue("chai");
  });

  it("offers a clear button only when there is something to clear", async () => {
    const user = userEvent.setup();
    render(<SearchField label="Search the menu" />);
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
    await user.type(screen.getByRole("searchbox"), "kulfi");
    const clear = screen.getByRole("button", { name: "Clear search" });
    // A 24px glyph button with a 40px hit area (dev parity; spec §5.5 floor is 24px).
    expect(clear).toHaveClass("size-6", "before:-inset-2");
  });

  it("clears, reports, notifies onClear and puts focus back in the box", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onClear = vi.fn();
    render(
      <SearchField
        label="Search the menu"
        defaultValue="paneer"
        onValueChange={onValueChange}
        onClear={onClear}
      />
    );
    await user.click(screen.getByRole("button", { name: "Clear search" }));
    const box = screen.getByRole("searchbox");
    expect(box).toHaveValue("");
    expect(box).toHaveFocus();
    expect(onValueChange).toHaveBeenCalledWith("");
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
  });

  it("is busy, pulses the brand mark and offers no clear button while results load", () => {
    const { container } = render(
      <SearchField label="Search the menu" defaultValue="kulfi" isLoading />
    );
    expect(screen.getByRole("searchbox")).toHaveAttribute("aria-busy", "true");
    expect(container.querySelector('[class*="animate-mark-pulse"]')).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
  });

  it("turns the hint into a status message with its glyph, and marks an error invalid", () => {
    const { container, rerender } = render(
      <SearchField
        label="Search the menu"
        defaultValue="pizza"
        status="warning"
        hint="Nothing matches that. Try another dish."
      />
    );
    const box = screen.getByRole("searchbox");
    expect(box).toHaveAccessibleDescription("Nothing matches that. Try another dish.");
    expect(box).not.toHaveAttribute("aria-invalid");
    expect(container.querySelectorAll("p svg")).toHaveLength(1);
    // The box raises its border to 2px and hangs the status glyph: glass, glyph and clear X.
    expect(box.parentElement).toHaveClass("border-2", "border-status-warning");
    expect(box.parentElement?.querySelectorAll("svg")).toHaveLength(3);
    rerender(
      <SearchField
        label="Search the menu"
        defaultValue="pizza"
        status="error"
        hint="Search is down. Try again."
      />
    );
    expect(screen.getByRole("searchbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("keeps a caller's own aria-describedby beside the hint", () => {
    render(
      <>
        <p id="scope">Searches the Sector 57 menu.</p>
        <SearchField label="Search the menu" aria-describedby="scope" hint="Try a dish name." />
      </>
    );
    expect(screen.getByRole("searchbox")).toHaveAccessibleDescription(
      "Searches the Sector 57 menu. Try a dish name."
    );
  });

  it("takes no typing and never offers to clear a disabled box, greyed by a fill, not opacity", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SearchField
        label="Search the menu"
        defaultValue="chai"
        disabled
        onValueChange={onValueChange}
      />
    );
    const box = screen.getByRole("searchbox");
    await user.type(box, "paneer");
    expect(box).toBeDisabled();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(box.parentElement?.className).not.toMatch(/opacity-/);
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
  });

  it("never offers to clear a read-only box", () => {
    render(<SearchField label="Search the menu" defaultValue="chai" readOnly />);
    expect(screen.getByRole("searchbox")).toHaveAttribute("readonly");
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
  });

  it("merges a caller className over its own gap", () => {
    const { container } = render(<SearchField label="Search the menu" className="gap-4" />);
    expect(container.firstElementChild).toHaveClass("gap-4");
    expect(container.firstElementChild).not.toHaveClass("gap-1.5");
  });

  it("forwards ref, name and onBlur for react-hook-form's Controller", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLInputElement>();
    const onBlur = vi.fn();
    render(<SearchField label="Search the menu" name="q" ref={ref} onBlur={onBlur} />);
    const box = screen.getByRole("searchbox");
    expect(ref.current).toBe(box);
    expect(box).toHaveAttribute("name", "q");
    await user.click(box);
    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("has no accessibility violations empty or with a value and a hint", async () => {
    const { container } = render(
      <>
        <SearchField label="Search the menu" />
        <SearchField
          label="Search outlets"
          size="sm"
          defaultValue="pizza"
          status="warning"
          hint="Nothing matches that."
        />
        <SearchField label="Search unavailable" size="sm" disabled />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/search-field 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./search-field`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/search-field/search-field.tsx`:

```tsx
"use client";

import type { ComponentProps, ReactNode } from "react";

import { Search, X } from "lucide-react";
import { useId, useRef } from "react";

import type { FieldStatus } from "../../lib/field-status";

import { Icon } from "../../atoms/icon/icon";
import { assignRef } from "../../lib/assign-ref";
import { joinIds } from "../../lib/choice-control";
import { componentVariants } from "../../lib/component-variants";
import { FieldControl } from "../../lib/field-control";
import { FieldMessage, hasFieldMessage } from "../../lib/field-message";
import { useControllableState } from "../../lib/use-controllable-state";

const searchField = componentVariants({
  slots: {
    root: "grid min-w-0 gap-1.5",
    /** The design system's search box is a pill with a 16px inset, not the 10px-radius field. */
    box: "rounded-pill px-4",
    input: "search-reset",
    // 24px to see, 40px to hit (`before:-inset-2`, dev parity): the pseudo-element takes the tap.
    clear:
      "relative grid size-6 shrink-0 place-items-center rounded-pill text-text-subtle transition-colors duration-fast ease-out before:absolute before:-inset-2 hover:text-text-heading",
    message: "px-4",
  },
});

export interface SearchFieldProps extends Omit<
  ComponentProps<"input">,
  "size" | "type" | "value" | "defaultValue" | "onChange"
> {
  /** Accessible name of the search box, e.g. "Search the menu". */
  label: string;
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  /** Called after the clear button empties the box. */
  onClear?: (() => void) | undefined;
  size?: "sm" | "md" | undefined;
  /** Border and glyph colour; the hint becomes the status message. */
  status?: FieldStatus | undefined;
  /** Pulses the brand mark while results load (hides the clear button). */
  isLoading?: boolean | undefined;
  /** One short line under the field, e.g. "Nothing matches that. Try another dish." */
  hint?: ReactNode;
}

/** The pill search box the site and the app share. Placeholder names real dishes, never "Search…". */
export function SearchField({
  label,
  value,
  defaultValue,
  onValueChange,
  onClear,
  size = "md",
  status = "default",
  isLoading = false,
  hint,
  disabled,
  readOnly,
  className,
  ref,
  "aria-describedby": describedBy,
  ...props
}: SearchFieldProps) {
  const [query, setQuery] = useControllableState({
    value,
    defaultValue: defaultValue ?? "",
    onChange: onValueChange,
  });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messageId = `${useId()}-message`;
  const hasMessage = hasFieldMessage({ status, message: hint, hint });
  const canClear = query !== "" && !isLoading && disabled !== true && readOnly !== true;
  const styles = searchField();

  function handleClear(): void {
    setQuery("");
    onClear?.();
    inputRef.current?.focus();
  }

  return (
    <div className={styles.root({ className })}>
      <FieldControl
        size={size}
        status={status}
        icon={Search}
        isLoading={isLoading}
        isReadOnly={readOnly === true}
        trailing={
          canClear ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={handleClear}
              className={styles.clear()}
            >
              <Icon icon={X} size="sm" />
            </button>
          ) : null
        }
        className={styles.box()}
      >
        {(controlClassName) => (
          <input
            {...props}
            ref={(node) => {
              inputRef.current = node;
              assignRef(ref, node);
            }}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.currentTarget.value);
            }}
            disabled={disabled}
            readOnly={readOnly}
            aria-label={label}
            aria-describedby={joinIds(describedBy, hasMessage ? messageId : undefined)}
            aria-invalid={status === "error" ? true : undefined}
            aria-busy={isLoading ? true : undefined}
            className={styles.input({ className: controlClassName })}
          />
        )}
      </FieldControl>
      <FieldMessage
        id={messageId}
        status={status}
        message={hint}
        hint={hint}
        className={styles.message()}
      />
    </div>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/search-field 2>&1 | tail -8`
Expected: PASS (14 tests).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/search-field/search-field.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn } from "storybook/test";

import { SearchField } from "./search-field";

const meta = {
  title: "Molecules/SearchField",
  component: SearchField,
  args: {
    label: "Search the menu",
    placeholder: "Search chai, paneer, kulfi…",
    onValueChange: fn(),
    onClear: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          'Menu search — pill-shaped, unlike the 10px-radius Input, on the same field box (status border, focus ring, loading mark). Controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`); the clear button appears whenever there is text, empties the box, calls `onClear` and returns focus to the input. Always full-width in its container with `min-width: 0`, so it never pushes a flex row wider. The placeholder names real dishes, not "Search…". `hint` sits under the field; with a `status` it becomes the status message with its glyph.',
      },
    },
  },
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "empty". */
export const Playground: Story = {};

/** Card row "with value" — type, then clear. */
export const WithValue: Story = {
  args: { defaultValue: "paneer" },
  play: async ({ args, canvas, userEvent }) => {
    const box = canvas.getByRole("searchbox", { name: "Search the menu" });
    await userEvent.type(box, " tikka");
    await expect(box).toHaveValue("paneer tikka");
    await userEvent.click(canvas.getByRole("button", { name: "Clear search" }));
    await expect(box).toHaveValue("");
    await expect(box).toHaveFocus();
    await expect(args.onClear).toHaveBeenCalledTimes(1);
  },
};

/** Card row "loading" — `isLoading`. */
export const Loading: Story = { args: { defaultValue: "kulfi", isLoading: true } };

/** Card row "no results" — `status="warning"` + `hint`. */
export const NoResults: Story = {
  args: {
    defaultValue: "pizza",
    status: "warning",
    hint: "Nothing matches that. Try another dish.",
  },
};

/** Card row "disabled". */
export const Disabled: Story = { args: { disabled: true, placeholder: "Search unavailable" } };

/** Card row `size="sm"`. */
export const Small: Story = {
  args: { size: "sm", label: "Search outlets", placeholder: "Search outlets" },
};

/** Dev parity: every status carries a sentence — success, error and read-only beside the card's warning. */
export const Statuses: Story = {
  render: (args) => (
    <div className="flex max-w-120 flex-col gap-5">
      <SearchField {...args} defaultValue="kulfi" status="success" hint="Showing 6 matches." />
      <SearchField
        {...args}
        defaultValue="chai"
        status="error"
        hint="Search is down for a moment."
      />
      <SearchField
        {...args}
        defaultValue="paneer"
        readOnly
        hint="Filtered by the outlet you picked."
      />
    </div>
  ),
};

/** Dev parity: the narrowest supported width — the pill keeps its height and a long query scrolls inside it. */
export const Narrow: Story = {
  args: { defaultValue: "paneer butter masala with extra gravy", hint: "34 dishes match." },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};
```

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export { SearchField, type SearchFieldProps } from "./molecules/search-field/search-field";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/search-field packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/search-field packages/ui/src/index.ts packages/ui/src/styles.css
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green (the styles spec still finds no literal colour).

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui
git commit -m "feat(ui): SearchField molecule on the shared field box

Pill-shaped FieldControl with a controlled query, a clear button that
returns focus to the input, the pulsing loading mark and a status hint.
Ref, name and onBlur reach the input for react-hook-form.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 4: QuantityStepper (client)

Design-system sources: `components/molecules/QuantityStepper.*`; handoff `PlanCalculator.dc.html` (people 1–40) and `DawatCalculator.dc.html` (guests 15–2000). Card rows: size (md + sm) · at min · `min={0}` · at max.

**Files:**

- Create: `packages/design-tokens/tokens/component/quantity-stepper.json`
- Create: `packages/ui/src/molecules/quantity-stepper/quantity-stepper.tsx`, `quantity-stepper.test.tsx`, `quantity-stepper.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/quantity-stepper/quantity-stepper.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                 | Ruling  | Where / why                                                                                                    |
| ------------------------------------------------------------------------ | ------- | -------------------------------------------------------------------------------------------------------------- |
| count announced as it changes (`aria-live="polite"`)                     | ADD     | `role="status"` `sr-only` region, filled after a button press, cleared when the spin button takes focus + test |
| `min={0}` reaches zero (removes the line)                                | ADD     | test "reaches zero…"                                                                                           |
| fixed size per `size`                                                    | ADD     | `it.each` size test (`size-8` / `size-10`)                                                                     |
| end-of-range button is a real grey glyph, never opacity                  | ADD     | test "greys a button…"                                                                                         |
| caller `className` merges                                                | ADD     | test "merges a caller className…"                                                                              |
| `InACartRow` story                                                       | ADD     | `InACartRow` story                                                                                             |
| `decrementLabel` / `incrementLabel` overrides (name the dish)            | DELTA   | not in contracts §5; fixed names per deviation 15 — proposed contract delta, see the 3a audit                  |
| default `label` "Quantity"                                               | DROP    | spec D9; contracts §5 makes `label` required                                                                   |
| `max` default 20                                                         | DROP    | contracts §5 gives defaults for `min` (0) and `step` (1) only; calculators pass their own `max`                |
| 36 / 44px buttons (dev's hit-target bump)                                | DROP    | spec D2: the design system's `QuantityStepper.jsx` sizes are 32 / 40; §5.5 floor ≥24px holds                   |
| native `<div>` props spread on the root                                  | DROP    | contracts §5 `QuantityStepperProps` takes `className` only                                                     |
| `onChange(value)`                                                        | ALREADY | `onValueChange` (spec §8.2)                                                                                    |
| named group; counts up/down; controlled; stops + disables at min and max | ALREADY | tests "is a named spin button…", "steps up and down…", "reports but keeps…", "disables − at the minimum…"      |
| `Sizes`, `AtTheEndsOfTheRange` stories                                   | ALREADY | `Sizes`, `AtMin`, `MinZero`, `AtMax`                                                                           |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `useControllableState` (Task 1); `Icon`; the `transition-control` utility (Plan 2a).
- Produces: `QuantityStepper`, `QuantityStepperProps` — contract §5 + `ref` (deviation 2). The count is `<input role="spinbutton">`: typed entry commits on blur or Enter, snapped to `step` from `min` and clamped to `[min, max]`; ArrowUp/Down step, Home/End jump; Escape or an emptied entry restores the value.

- [ ] **Step 1: Component token**

`packages/design-tokens/tokens/component/quantity-stepper.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "quantity-stepper-count": {
      "$value": "22px",
      "$description": "Minimum width of the count between − and +. A longer count widens with its digits (the input's size attribute)."
    }
  }
}
```

In `packages/ui/src/lib/component-variants.ts`, append `"quantity-stepper-count"` to `SPACING`. Rebuild tokens; the variant spec must pass:

```bash
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/lib/component-variants 2>&1 | tail -5
```

(Button sizes are design-system steps: `size-10` = 40, `size-8` = 32. The count's heading colour on the pink-50 pill is already in Plan 1's `light-text` group.)

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/quantity-stepper/quantity-stepper.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { QuantityStepper } from "./quantity-stepper";

const DAWAT = { min: 15, max: 2000, step: 5 } as const;

describe("QuantityStepper", () => {
  it("is a named spin button inside a named group, with its range", () => {
    render(<QuantityStepper label="Guests" defaultValue={50} {...DAWAT} />);
    const input = screen.getByRole("spinbutton", { name: "Guests" });
    expect(input).toHaveValue("50");
    expect(input).toHaveAttribute("aria-valuenow", "50");
    expect(input).toHaveAttribute("aria-valuemin", "15");
    expect(input).toHaveAttribute("aria-valuemax", "2000");
    expect(screen.getByRole("group", { name: "Guests" })).toBeInTheDocument();
  });

  it("starts at min when no value is given", () => {
    render(<QuantityStepper label="Plates" min={1} />);
    expect(screen.getByRole("spinbutton", { name: "Plates" })).toHaveValue("1");
  });

  it("steps up and down by one and reports each value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <QuantityStepper label="Plates" defaultValue={2} min={1} onValueChange={onValueChange} />
    );
    await user.click(screen.getByRole("button", { name: "Add one" }));
    expect(screen.getByRole("spinbutton")).toHaveValue("3");
    await user.click(screen.getByRole("button", { name: "Remove one" }));
    await user.click(screen.getByRole("button", { name: "Remove one" }));
    expect(screen.getByRole("spinbutton")).toHaveValue("1");
    expect(onValueChange.mock.calls).toEqual([[3], [2], [1]]);
  });

  it("announces the count after a button press (focus stays on the button)", async () => {
    const user = userEvent.setup();
    render(<QuantityStepper label="Plates" defaultValue={2} min={1} />);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    await user.click(screen.getByRole("button", { name: "Add one" }));
    expect(screen.getByRole("status")).toHaveTextContent("3");
    // Typing or arrowing in the spin button announces itself; the region steps aside.
    await user.click(screen.getByRole("spinbutton"));
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("reaches zero when zero removes the line item (min defaults to 0)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<QuantityStepper label="Plates" value={1} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Remove one" }));
    expect(onValueChange).toHaveBeenCalledWith(0);
  });

  it.each([
    ["sm", "size-8"],
    ["md", "size-10"],
  ] as const)("renders the %s buttons at their fixed size", (size, expected) => {
    render(<QuantityStepper label="Plates" size={size} />);
    expect(screen.getByRole("button", { name: "Add one" })).toHaveClass(expected);
  });

  it("greys a button at the end of the range with a real colour, never opacity", () => {
    render(<QuantityStepper label="Plates" value={1} min={1} onValueChange={vi.fn()} />);
    const minus = screen.getByRole("button", { name: "Remove one" });
    expect(minus).toHaveClass("disabled:text-ink-400");
    expect(minus.className).not.toMatch(/opacity-/);
  });

  it("merges a caller className over its own", () => {
    render(<QuantityStepper label="Plates" className="rounded-md" />);
    const group = screen.getByRole("group", { name: "Plates" });
    expect(group).toHaveClass("rounded-md");
    expect(group).not.toHaveClass("rounded-pill");
  });

  it("names its buttons by the step they take", async () => {
    const user = userEvent.setup();
    render(<QuantityStepper label="Guests" defaultValue={50} {...DAWAT} />);
    await user.click(screen.getByRole("button", { name: "Add 5" }));
    expect(screen.getByRole("spinbutton")).toHaveValue("55");
    expect(screen.getByRole("button", { name: "Remove 5" })).toBeEnabled();
  });

  it("disables − at the minimum and + at the maximum", () => {
    const { rerender } = render(
      <QuantityStepper label="Plates" value={1} min={1} max={5} onValueChange={vi.fn()} />
    );
    expect(screen.getByRole("button", { name: "Remove one" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Add one" })).toBeEnabled();
    rerender(<QuantityStepper label="Plates" value={5} min={1} max={5} onValueChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Add one" })).toBeDisabled();
  });

  it("reports but keeps the caller's value when controlled", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<QuantityStepper label="Plates" value={2} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Add one" }));
    expect(onValueChange).toHaveBeenCalledWith(3);
    expect(screen.getByRole("spinbutton")).toHaveValue("2");
  });

  it.each([
    ["350", "350"],
    ["5000", "2000"],
    ["3", "15"],
    ["17", "15"],
    ["18", "20"],
  ])("commits a typed %s as %s on blur (15–2000 guests, step 5)", async (typed, committed) => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <QuantityStepper label="Guests" defaultValue={50} {...DAWAT} onValueChange={onValueChange} />
    );
    const input = screen.getByRole("spinbutton", { name: "Guests" });
    await user.clear(input);
    await user.type(input, typed);
    await user.tab();
    expect(input).toHaveValue(committed);
    expect(onValueChange).toHaveBeenLastCalledWith(Number(committed));
  });

  it("keeps only digits while typing", async () => {
    const user = userEvent.setup();
    render(<QuantityStepper label="Guests" defaultValue={50} {...DAWAT} />);
    const input = screen.getByRole("spinbutton");
    await user.clear(input);
    await user.type(input, "4a2-");
    expect(input).toHaveValue("42");
  });

  it("restores the value when the entry is emptied or escaped", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<QuantityStepper label="Plates" defaultValue={4} onValueChange={onValueChange} />);
    const input = screen.getByRole("spinbutton");
    await user.clear(input);
    await user.tab();
    expect(input).toHaveValue("4");
    await user.type(input, "9");
    expect(input).toHaveValue("49");
    await user.keyboard("{Escape}");
    expect(input).toHaveValue("4");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("commits a typed value on Enter", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <QuantityStepper label="Guests" defaultValue={50} {...DAWAT} onValueChange={onValueChange} />
    );
    const input = screen.getByRole("spinbutton");
    await user.clear(input);
    await user.type(input, "120{Enter}");
    expect(onValueChange).toHaveBeenCalledWith(120);
    expect(input).toHaveFocus();
  });

  it("steps with the arrow keys and jumps with Home and End", async () => {
    const user = userEvent.setup();
    render(<QuantityStepper label="Guests" defaultValue={50} {...DAWAT} />);
    const input = screen.getByRole("spinbutton");
    await user.click(input);
    await user.keyboard("{ArrowUp}");
    expect(input).toHaveValue("55");
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(input).toHaveValue("45");
    await user.keyboard("{Home}");
    expect(input).toHaveValue("15");
    await user.keyboard("{End}");
    expect(input).toHaveValue("2000");
  });

  it("gives react-hook-form's Controller a name, onBlur and a focusable ref", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLInputElement>();
    const onBlur = vi.fn();
    render(
      <QuantityStepper
        label="Guests"
        name="guests"
        ref={ref}
        onBlur={onBlur}
        defaultValue={20}
        {...DAWAT}
      />
    );
    const input = screen.getByRole("spinbutton");
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute("name", "guests");
    await user.click(input);
    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("disables the buttons and the field when disabled", () => {
    render(<QuantityStepper label="Plates" defaultValue={2} disabled />);
    expect(screen.getByRole("spinbutton")).toBeDisabled();
    for (const button of screen.getAllByRole("button")) expect(button).toBeDisabled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <QuantityStepper label="Plates" defaultValue={1} min={1} />
        <QuantityStepper label="Guests" size="sm" defaultValue={50} {...DAWAT} />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/quantity-stepper 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./quantity-stepper`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/quantity-stepper/quantity-stepper.tsx`:

```tsx
"use client";

import type { KeyboardEvent, Ref } from "react";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import { useControllableState } from "../../lib/use-controllable-state";

const quantityStepper = componentVariants({
  slots: {
    root: "inline-flex items-center rounded-pill border border-border-brand-soft bg-surface-page-alt",
    button:
      "grid shrink-0 place-items-center rounded-pill text-text-brand transition-control not-disabled:hover:bg-surface-brand-soft not-disabled:active:press-scale disabled:cursor-not-allowed disabled:text-ink-400",
    count:
      "min-w-quantity-stepper-count rounded-xs border-0 bg-transparent p-0 text-center font-display font-bold text-text-heading tabular-nums disabled:text-ink-400",
  },
  variants: {
    size: {
      sm: { button: "size-8", count: "text-body-sm" },
      md: { button: "size-10", count: "text-body" },
    },
  },
  defaultVariants: { size: "md" },
});

export interface QuantityStepperProps {
  /** Accessible name of the stepper and its number field, e.g. "Guests". */
  label: string;
  value?: number | undefined;
  defaultValue?: number | undefined;
  onValueChange?: ((value: number) => void) | undefined;
  onBlur?: (() => void) | undefined;
  /** Lowest value (default 0 — reaching it removes a cart line; use 1 where it should not). */
  min?: number | undefined;
  max?: number | undefined;
  step?: number | undefined;
  size?: "sm" | "md" | undefined;
  name?: string | undefined;
  disabled?: boolean | undefined;
  className?: string | undefined;
  /** The number field — react-hook-form's Controller focuses it on error. */
  ref?: Ref<HTMLInputElement> | undefined;
}

interface Bounds {
  min: number;
  max: number | undefined;
  step: number;
}

/** Snap to the nearest step counted from `min`, then keep inside `[min, max]`. */
function toAllowed(raw: number, { min, max, step }: Bounds): number {
  const snapped = min + Math.round((raw - min) / step) * step;
  const highest = max === undefined ? snapped : max - ((max - min) % step);
  return Math.max(min, Math.min(snapped, highest));
}

/** −/+ quantity with typed entry: cart rows, item detail, calculator guest counts. */
export function QuantityStepper({
  label,
  value,
  defaultValue,
  onValueChange,
  onBlur,
  min = 0,
  max,
  step = 1,
  size = "md",
  name,
  disabled = false,
  className,
  ref,
}: QuantityStepperProps) {
  const bounds: Bounds = { min, max, step };
  const [quantity, setQuantity] = useControllableState({
    value,
    defaultValue: defaultValue ?? min,
    onChange: onValueChange,
  });
  const [draft, setDraft] = useState<string | null>(null);
  // A button press keeps focus on the button, so the new count is announced (dev parity); the
  // spin button speaks for itself once focused, so focusing it clears the region.
  const [hasStepped, setHasStepped] = useState(false);
  const styles = quantityStepper({ size });
  const stepName = step === 1 ? "one" : String(step);

  /** What the field stands for right now: a typed draft that parses, else the value. */
  function settled(): number {
    return draft === null || draft === "" ? quantity : toAllowed(Number(draft), bounds);
  }

  function commit(next: number): void {
    setDraft(null);
    setQuantity(toAllowed(next, bounds));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        commit(settled() + step);
        break;
      case "ArrowDown":
        event.preventDefault();
        commit(settled() - step);
        break;
      case "Home":
        event.preventDefault();
        commit(min);
        break;
      case "End":
        if (max !== undefined) {
          event.preventDefault();
          commit(max);
        }
        break;
      case "Enter":
        // First Enter commits the typed value; the next one is free to submit the form.
        if (draft !== null) {
          event.preventDefault();
          commit(settled());
        }
        break;
      case "Escape":
        setDraft(null);
        break;
      default:
        break;
    }
  }

  function handleBlur(): void {
    if (draft !== null) commit(settled());
    onBlur?.();
  }

  function stepBy(delta: number): void {
    commit(settled() + delta);
    setHasStepped(true);
  }

  return (
    <div
      role="group"
      aria-label={label}
      data-surface="light"
      className={styles.root({ className })}
    >
      <button
        type="button"
        aria-label={`Remove ${stepName}`}
        disabled={disabled || quantity <= min}
        onClick={() => {
          stepBy(-step);
        }}
        className={styles.button()}
      >
        <Icon icon={Minus} size={size} />
      </button>
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        role="spinbutton"
        aria-label={label}
        aria-valuenow={quantity}
        aria-valuemin={min}
        aria-valuemax={max}
        name={name}
        size={Math.max(2, String(max ?? quantity).length)}
        value={draft ?? String(quantity)}
        disabled={disabled}
        onChange={(event) => {
          setDraft(event.currentTarget.value.replace(/\D/g, ""));
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setHasStepped(false);
        }}
        onBlur={handleBlur}
        className={styles.count()}
      />
      <button
        type="button"
        aria-label={`Add ${stepName}`}
        disabled={disabled || (max !== undefined && quantity >= max)}
        onClick={() => {
          stepBy(step);
        }}
        className={styles.button()}
      >
        <Icon icon={Plus} size={size} />
      </button>
      <span role="status" className="sr-only">
        {hasStepped ? String(quantity) : null}
      </span>
    </div>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/quantity-stepper 2>&1 | tail -8`
Expected: PASS (24 tests, the typed-entry and size tables included).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/quantity-stepper/quantity-stepper.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn } from "storybook/test";

import { QuantityStepper } from "./quantity-stepper";

const meta = {
  title: "Molecules/QuantityStepper",
  component: QuantityStepper,
  args: { label: "Quantity", defaultValue: 2, min: 1, onValueChange: fn() },
  parameters: {
    docs: {
      description: {
        component:
          "Quantity control for cart rows, item detail, add-ons and calculator guest counts. Pill on pink-50 with a pink-200 hairline; the count is Poppins 700 and can be typed — a typed value commits on blur or Enter, snapped to `step` and clamped to `min`/`max`; ArrowUp/Down step, Home/End jump, Escape restores. Use `min={0}` where reaching zero removes the line item, `min={1}` where it shouldn't. Controlled (`value` + `onValueChange`) or uncontrolled; `name`, `onBlur` and `ref` plug into react-hook-form's Controller.",
      },
    },
  },
} satisfies Meta<typeof QuantityStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add one" }));
    await expect(canvas.getByRole("spinbutton", { name: "Quantity" })).toHaveValue("3");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(3);
  },
};

/** Card row "size" — md and sm. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <QuantityStepper {...args} />
      <QuantityStepper {...args} size="sm" />
    </div>
  ),
};

/** Card row "at min" — minus disabled. */
export const AtMin: Story = { args: { defaultValue: 1, min: 1 } };

/** Card row `min={0}` — zero removes the line. */
export const MinZero: Story = { args: { defaultValue: 0, min: 0 } };

/** Card row "at max". */
export const AtMax: Story = { args: { defaultValue: 5, min: 0, max: 5 } };

/** Dev parity: in a cart row — the stepper holds its width while the dish name takes the rest. */
export const InACartRow: Story = {
  args: { label: "Paneer Butter Masala quantity" },
  render: (args) => (
    <div className="flex w-full max-w-120 items-center gap-4 rounded-lg bg-surface-card p-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="font-display text-body font-bold text-text-heading">
          Paneer Butter Masala
        </span>
        <span className="text-body-sm text-text-muted">Medium · ₹280</span>
      </div>
      <QuantityStepper {...args} className="ms-auto" />
    </div>
  ),
};

/** Handoff Dawat calculator: 15–2000 guests in fives — a typed 5000 settles at 2000. */
export const TypedGuests: Story = {
  args: { label: "Guests", defaultValue: 50, min: 15, max: 2000, step: 5 },
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("spinbutton", { name: "Guests" });
    await userEvent.clear(input);
    await userEvent.type(input, "5000");
    await userEvent.tab();
    await expect(input).toHaveValue("2000");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(2000);
  },
};
```

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export {
  QuantityStepper,
  type QuantityStepperProps,
} from "./molecules/quantity-stepper/quantity-stepper";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/quantity-stepper packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/quantity-stepper packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/quantity-stepper.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): QuantityStepper molecule with typed entry

−/+ pill whose count is a spin button: a typed value commits on blur or
Enter, snapped to step and clamped to min/max, so a typed 5000 on the Dawat
guest count settles at 2000. Name, onBlur and ref serve react-hook-form.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 5: OtpInput (client)

Design-system sources: `components/molecules/OtpInput.*`. Card rows: partial · complete · success · error · disabled.

One `<input autocomplete="one-time-code" inputmode="numeric">` sits transparently over `length` decorative cells (`aria-hidden`). The platform then does the hard parts: iOS/Android SMS autofill, paste, Backspace, selection — and a screen reader meets one labelled field, not six. `onChange` strips non-digits **before** truncating to `length`, and the input has no `maxLength`, so a pasted `48-21 93` is never cut to `48-21 ` first.

**Files:**

- Create: `packages/design-tokens/tokens/component/otp-input.json`
- Create: `packages/ui/src/molecules/otp-input/otp-input.tsx`, `otp-input.test.tsx`, `otp-input.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`), `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/otp-input/otp-input.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                 | Ruling  | Where / why                                                                                                          |
| ------------------------------------------------------------------------ | ------- | -------------------------------------------------------------------------------------------------------------------- |
| filled cell takes the 2px brand border; empty stays thin                 | ADD     | test "gives a filled cell the brand border…"                                                                         |
| a status border outranks the filled border                               | ADD     | same test (the compound only paints brand on `default`)                                                              |
| `hint` line under the cells ("The code lasts 10 minutes.")               | ADD     | via `message` on the default status (Task 1 `FieldMessage`) + test + `WithHint` story; no `hint` prop (contracts §5) |
| disabled takes no typing; grey fill, never opacity                       | ADD     | disabled test                                                                                                        |
| caller `className` merges                                                | ADD     | test "merges a caller className…"                                                                                    |
| axe over a disabled code                                                 | ADD     | axe test                                                                                                             |
| `Narrow` story (six cells wrap at 360px)                                 | ADD     | `Narrow` story                                                                                                       |
| error message announced (`role="alert"`)                                 | ADD     | Task 1 `FieldMessage`                                                                                                |
| default `label` "One-time code"                                          | DROP    | spec D9; contracts §5 makes `label` required                                                                         |
| `status` `readOnly` / `disabled` / `loading` (+ loading story)           | DROP    | contracts §1 `FieldStatus`; contracts §5 has `disabled` only                                                         |
| one input per digit, "Digit N of M" names, ArrowLeft/Right between cells | DROP    | deviation 3: one `one-time-code` input behind decorative cells — one labelled field, caret moves natively            |
| native `<div>` props on the root                                         | DROP    | contracts §5 `OtpInputProps` takes `className` only                                                                  |
| `onChange(code)`                                                         | ALREADY | `onValueChange` (spec §8.2)                                                                                          |
| 6 / 4 cells; one digit per cell; whole code reported; uncontrolled       | ALREADY | tests "is one labelled code field…", "fills the cells…", "renders four cells…", "shows the caller's code…"           |
| paste spills across cells; non-digits ignored; Backspace walks back      | ALREADY | paste, letters and Backspace tests (Review Focus 1)                                                                  |
| `aria-invalid` only on error; describedby → the showing line             | ALREADY | status test                                                                                                          |
| `Default`, `FourDigits`, `PartlyEntered`, `Statuses` stories             | ALREADY | `Playground`, `Complete`, `Partial`, `Verified` / `Expired` / `Disabled`                                             |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `useControllableState`, `FieldMessage`, `hasFieldMessage` (Task 1); `fieldControlVariants` (Plan 2b — each cell is the shared field box at `size="lg"`, 56px tall, so status borders, radius, fill and transitions match every other field).
- Produces: `OtpInput`, `OtpInputProps` — contract §5 + `ref`, `onBlur` (deviation 3). Cells expose `data-state="empty" | "filled" | "active"`.

- [ ] **Step 1: Component token**

`packages/design-tokens/tokens/component/otp-input.json`:

```json
{
  "text": {
    "$type": "typography",
    "otp-digit": {
      "$value": { "fontSize": "20px", "lineHeight": 1 },
      "$description": "OtpInput cell digit, set in Space Mono (font-mono)."
    }
  }
}
```

Append `"otp-digit"` to `TEXT` in `packages/ui/src/lib/component-variants.ts`. Cells are the field box at `size="lg"` (`h-field-lg`, 56px) narrowed to `w-12` (48px, a spacing step). Rebuild tokens and run the variant spec (as in Task 4 Step 1).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/otp-input/otp-input.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { OtpInput } from "./otp-input";

function cells(container: HTMLElement): Element[] {
  return [...container.querySelectorAll("[data-state]")];
}

function cellDigits(container: HTMLElement): string[] {
  return cells(container).map((cell) => cell.textContent ?? "");
}

describe("OtpInput", () => {
  it("is one labelled code field that phones can autofill", () => {
    const { container } = render(<OtpInput label="Login code" />);
    const input = screen.getByRole("textbox", { name: "Login code" });
    expect(input).toHaveAttribute("autocomplete", "one-time-code");
    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(input).not.toHaveAttribute("maxlength");
    expect(cellDigits(container)).toEqual(["", "", "", "", "", ""]);
  });

  it("fills the cells in order as digits are typed, and reports the code", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(<OtpInput label="Login code" onValueChange={onValueChange} />);
    await user.type(screen.getByRole("textbox"), "482");
    expect(cellDigits(container)).toEqual(["4", "8", "2", "", "", ""]);
    expect(onValueChange).toHaveBeenLastCalledWith("482");
  });

  it("fills every cell from a pasted code, ignoring spaces and dashes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(<OtpInput label="Login code" onValueChange={onValueChange} />);
    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.paste("48-21 93");
    expect(input).toHaveValue("482193");
    expect(cellDigits(container)).toEqual(["4", "8", "2", "1", "9", "3"]);
    expect(onValueChange).toHaveBeenLastCalledWith("482193");
  });

  it("drops digits past the code length from a paste", async () => {
    const user = userEvent.setup();
    render(<OtpInput label="Login code" length={4} />);
    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.paste("4821 93");
    expect(input).toHaveValue("4821");
  });

  it("ignores letters and symbols typed into the field", async () => {
    const user = userEvent.setup();
    render(<OtpInput label="Login code" />);
    const input = screen.getByRole("textbox");
    await user.type(input, "4a8$");
    expect(input).toHaveValue("48");
  });

  it("deletes back across the cells with Backspace", async () => {
    const user = userEvent.setup();
    const { container } = render(<OtpInput label="Login code" length={4} />);
    await user.type(screen.getByRole("textbox"), "4821{Backspace}{Backspace}");
    expect(cellDigits(container)).toEqual(["4", "8", "", ""]);
  });

  it("marks the next empty cell active only while the field has focus", async () => {
    const user = userEvent.setup();
    const { container } = render(<OtpInput label="Login code" length={4} />);
    await user.type(screen.getByRole("textbox"), "48");
    expect(cells(container).map((cell) => cell.getAttribute("data-state"))).toEqual([
      "filled",
      "filled",
      "active",
      "empty",
    ]);
    await user.tab();
    expect(cells(container).map((cell) => cell.getAttribute("data-state"))).toEqual([
      "filled",
      "filled",
      "empty",
      "empty",
    ]);
  });

  it("shows the caller's code when controlled and only reports input", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<OtpInput label="Login code" value="12" onValueChange={onValueChange} />);
    await user.type(screen.getByRole("textbox"), "3");
    expect(onValueChange).toHaveBeenCalledWith("123");
    expect(screen.getByRole("textbox")).toHaveValue("12");
  });

  it("describes the field with its status message and marks only an error invalid", () => {
    const { rerender } = render(
      <OtpInput
        label="Login code"
        length={4}
        defaultValue="1234"
        status="error"
        message="That code has expired. Send a new one?"
      />
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("That code has expired. Send a new one?");
    rerender(
      <OtpInput
        label="Login code"
        length={4}
        defaultValue="4821"
        status="success"
        message="Verified. Signing you in."
      />
    );
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
    expect(screen.getByRole("textbox")).toHaveAccessibleDescription("Verified. Signing you in.");
  });

  it("renders four cells for a four-digit code", () => {
    const { container } = render(<OtpInput label="Login code" length={4} />);
    expect(cells(container)).toHaveLength(4);
  });

  it("gives a filled cell the brand border, and lets a status outrank it", () => {
    const { container, rerender } = render(
      <OtpInput label="Login code" length={4} defaultValue="4" />
    );
    const [first, second] = cells(container);
    expect(first).toHaveClass("border-2", "border-border-brand");
    expect(second).not.toHaveClass("border-border-brand");
    // The whole code is wrong, not one cell: the status colour wins over the filled border.
    rerender(
      <OtpInput
        label="Login code"
        length={4}
        defaultValue="4"
        status="error"
        message="That code has expired."
      />
    );
    expect(cells(container)[0]).toHaveClass("border-status-danger");
    expect(cells(container)[0]).not.toHaveClass("border-border-brand");
  });

  it("shows a hint as its message on the default status, describing the field politely", () => {
    render(<OtpInput label="Login code" message="The code lasts 10 minutes." />);
    expect(screen.getByRole("textbox")).toHaveAccessibleDescription("The code lasts 10 minutes.");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("merges a caller className over its own gap", () => {
    const { container } = render(<OtpInput label="Login code" className="gap-6" />);
    expect(container.firstElementChild).toHaveClass("gap-6");
    expect(container.firstElementChild).not.toHaveClass("gap-2");
  });

  it("gives react-hook-form's Controller a name, onBlur and a focusable ref", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLInputElement>();
    const onBlur = vi.fn();
    render(<OtpInput label="Login code" name="otp" ref={ref} onBlur={onBlur} />);
    const input = screen.getByRole("textbox");
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute("name", "otp");
    await user.click(input);
    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("takes no typing and greys every cell with a fill, never opacity, when disabled", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <OtpInput
        label="Login code"
        length={4}
        defaultValue="48"
        disabled
        onValueChange={onValueChange}
      />
    );
    const input = screen.getByRole("textbox");
    await user.type(input, "2");
    expect(input).toBeDisabled();
    expect(onValueChange).not.toHaveBeenCalled();
    for (const cell of cells(container)) {
      expect(cell).toHaveClass("bg-ink-100");
      expect(cell.className).not.toMatch(/opacity-/);
    }
  });

  it("has no accessibility violations empty or in error", async () => {
    const { container } = render(
      <>
        <OtpInput label="Login code" />
        <OtpInput
          label="Confirm code"
          length={4}
          defaultValue="1234"
          status="error"
          message="That code has expired. Send a new one?"
        />
        <OtpInput label="Expired code" length={4} defaultValue="48" disabled />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/otp-input 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./otp-input`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/otp-input/otp-input.tsx`:

```tsx
"use client";

import type { ReactNode, Ref } from "react";

import { useId, useState } from "react";

import type { FieldStatus } from "../../lib/field-status";

import { componentVariants } from "../../lib/component-variants";
import { fieldControlVariants } from "../../lib/field-control";
import { FieldMessage, hasFieldMessage } from "../../lib/field-message";
import { useControllableState } from "../../lib/use-controllable-state";

const otpInput = componentVariants({
  slots: {
    root: "grid gap-2",
    field: "relative w-fit max-w-full",
    cells: "flex flex-wrap gap-2.5",
    /** Layered over the shared field box (Plan 2b): a 48×56 cell with a centred mono digit. */
    cell: "text-otp-digit w-12 justify-center px-0 font-mono text-text-heading",
    input:
      "absolute inset-0 size-full cursor-text appearance-none border-0 bg-transparent p-0 text-body text-transparent caret-transparent outline-hidden selection:bg-transparent disabled:cursor-not-allowed",
  },
  variants: {
    state: {
      empty: {},
      filled: { cell: "border-2" },
      active: { cell: "border-2 shadow-focus-ring" },
    },
    // The box's status borders come from fieldControlVariants; this only gates the compound below.
    status: { default: {}, error: {}, success: {}, warning: {} },
    isDisabled: { true: { cell: "bg-ink-100 text-ink-400" } },
  },
  compoundVariants: [
    { status: "default", state: ["filled", "active"], class: { cell: "border-border-brand" } },
  ],
  defaultVariants: { state: "empty", status: "default", isDisabled: false },
});

type CellState = "empty" | "filled" | "active";

export interface OtpInputProps {
  /** Accessible name of the code field, e.g. "Login code". */
  label: string;
  length?: 4 | 6 | undefined;
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  onBlur?: (() => void) | undefined;
  status?: FieldStatus | undefined;
  /**
   * The line under the cells: on the default status a neutral hint ("The code lasts 10
   * minutes."), with a status its message and glyph ("Verified. Signing you in.").
   */
  message?: ReactNode;
  disabled?: boolean | undefined;
  name?: string | undefined;
  className?: string | undefined;
  /** The code field — react-hook-form's Controller focuses it on error. */
  ref?: Ref<HTMLInputElement> | undefined;
}

/**
 * The mobile-OTP code — the app's only sign-in. One real input behind decorative cells: SMS
 * autofill, paste, Backspace and selection are the platform's, and assistive tech meets one field.
 * Filled cells take a 2px pink border; the cells wrap to a second row rather than overflow at 360px.
 */
export function OtpInput({
  label,
  length = 6,
  value,
  defaultValue,
  onValueChange,
  onBlur,
  status = "default",
  message,
  disabled = false,
  name,
  className,
  ref,
}: OtpInputProps) {
  const [code, setCode] = useControllableState({
    value,
    defaultValue: defaultValue ?? "",
    onChange: onValueChange,
  });
  const [isFocused, setIsFocused] = useState(false);
  const messageId = `${useId()}-message`;
  const styles = otpInput({ status, isDisabled: disabled });
  const box = fieldControlVariants({ size: "lg", status });
  const activeIndex = isFocused ? Math.min(code.length, length - 1) : -1;

  function stateOf(index: number): CellState {
    if (index === activeIndex) return "active";
    return index < code.length ? "filled" : "empty";
  }

  return (
    <div className={styles.root({ className })}>
      <div className={styles.field()}>
        <div aria-hidden="true" data-surface="light" className={styles.cells()}>
          {Array.from({ length }, (_, index) => {
            const state = stateOf(index);
            return (
              <span
                key={index}
                data-state={state}
                className={box.root({ className: styles.cell({ state }) })}
              >
                {code[index]}
              </span>
            );
          })}
        </div>
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          aria-label={label}
          aria-describedby={hasFieldMessage({ status, message }) ? messageId : undefined}
          aria-invalid={status === "error" ? true : undefined}
          name={name}
          value={code}
          disabled={disabled}
          onChange={(event) => {
            setCode(event.currentTarget.value.replace(/\D/g, "").slice(0, length));
          }}
          onFocus={() => {
            setIsFocused(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          className={styles.input()}
        />
      </div>
      <FieldMessage id={messageId} status={status} message={message} />
    </div>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/otp-input 2>&1 | tail -8`
Expected: PASS (16 tests).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/otp-input/otp-input.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn } from "storybook/test";

import { OtpInput } from "./otp-input";

const meta = {
  title: "Molecules/OtpInput",
  component: OtpInput,
  args: { label: "Login code", onValueChange: fn() },
  parameters: {
    docs: {
      description: {
        component:
          'Mobile-OTP login code — the app\'s only sign-in method. 48×56 cells, Space Mono digits; filled cells take a 2px pink border, the next cell shows the focus ring. It is one real input (`autocomplete="one-time-code"`) behind the cells, so SMS autofill, paste (spaces and dashes are dropped) and Backspace just work. Wraps to a second row rather than overflowing on a 360px screen. `status` + `message` for verified/expired.',
      },
    },
  },
} satisfies Meta<typeof OtpInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Paste a formatted code: every cell fills with digits only. */
export const Playground: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Login code" });
    await userEvent.click(input);
    await userEvent.paste("48-21 93");
    await expect(input).toHaveValue("482193");
    await userEvent.keyboard("{Backspace}");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("48219");
  },
};

/** Card row "partial". */
export const Partial: Story = { args: { defaultValue: "482" } };

/** Card row "complete" — `length={4}`. */
export const Complete: Story = { args: { length: 4, defaultValue: "4821" } };

/** Card row "success". */
export const Verified: Story = {
  args: {
    length: 4,
    defaultValue: "4821",
    status: "success",
    message: "Verified. Signing you in.",
  },
};

/** Card row "error". */
export const Expired: Story = {
  args: {
    length: 4,
    defaultValue: "1234",
    status: "error",
    message: "That code has expired. Send a new one?",
  },
};

/** Card row "disabled". */
export const Disabled: Story = { args: { length: 4, defaultValue: "48", disabled: true } };

/** Dev parity: a neutral hint under the cells — `message` on the default status. */
export const WithHint: Story = { args: { length: 4, message: "The code lasts 10 minutes." } };

/** Dev parity: a 360px screen less its gutters (320px) — six cells wrap to a second row, never overflow. */
export const Narrow: Story = {
  args: { defaultValue: "4821" },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};
```

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export { OtpInput, type OtpInputProps } from "./molecules/otp-input/otp-input";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/otp-input packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/otp-input packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/otp-input.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): OtpInput molecule on a single one-time-code input

One real input behind decorative cells, so SMS autofill, paste and
Backspace are the platform's. Digits are extracted before the code is cut
to length: a pasted 48-21 93 fills all six cells.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 6: SlotPicker (native radios, server-safe)

Design-system sources: `components/molecules/SlotPicker.*`. Card rows: auto-fit · error · disabled · `columns={3}`.

**Files:**

- Create: `packages/design-tokens/tokens/component/slot-picker.json`
- Create: `packages/ui/src/molecules/slot-picker/slot-picker.tsx`, `slot-picker.test.tsx`, `slot-picker.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`), `packages/design-tokens/contrast-pairs.json`, `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/slot-picker/slot-picker.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                  | Ruling  | Where / why                                                                                           |
| ------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| arrow keys move between slots (and skip sold-out)                         | ADD     | test "moves between slots with the arrow keys…" (native radio group behaviour)                        |
| clicking a sold-out slot reports nothing; disabled is a fill, not opacity | ADD     | sold-out test                                                                                         |
| label mutes when the group is disabled                                    | ADD     | `group/slot-picker` + legend `group-disabled/slot-picker:text-text-subtle` + disabled test            |
| success / warning paint the slot border (dev: all three statuses)         | ADD     | `status` variant + `it.each` border test                                                              |
| invalid only on error; error announced (`role="alert"`)                   | ADD     | test "marks the slots invalid only on the error status" + alert assertion (Task 1 `FieldMessage`)     |
| `hint` line under the grid                                                | ADD     | via `message` on the default status (Task 1) + test + `Statuses` story; no `hint` prop (contracts §5) |
| caller `className` merges                                                 | ADD     | test "merges a caller className…"                                                                     |
| axe over a disabled group                                                 | ADD     | axe test                                                                                              |
| `Statuses` and `Narrow` stories                                           | ADD     | `Statuses`, `Narrow` stories                                                                          |
| bare-string slots (`"7:30pm"`)                                            | DROP    | spec §8.2: object lists only                                                                          |
| Radix RadioGroup (`role="radiogroup"`, roving focus)                      | DROP    | spec D7 / §9.2: native radios in a `<fieldset>`                                                       |
| `status` `disabled` / `readOnly` / `loading`                              | DROP    | contracts §1 `FieldStatus`; the native `disabled` prop covers disabled                                |
| `InsideAField` story                                                      | DROP    | deviation 1: a fieldset cannot sit inside `Field` (a `<label>` cannot name a group)                   |
| optional visible `label`                                                  | ALREADY | required `legend` + `isLegendHidden` (deviation 1)                                                    |
| name "ASAP, 12 min"                                                       | ALREADY | named "ASAP", described "12 min"                                                                      |
| chosen slot; reports pick; uncontrolled; group disabled; columns/auto-fit | ALREADY | tests "starts at defaultValue…", "reports the picked slot…", "disables every slot…", "lays slots…"    |
| `Default`, `FixedColumns`, `SoldOut` stories                              | ALREADY | `Playground` (sold-out 9:00pm included), `Columns`                                                    |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `FieldMessage`, `hasFieldMessage` (Task 1); `joinIds` (Plan 2b, `lib/choice-control.tsx`).
- Produces: `SlotPicker`, `SlotPickerProps`, `SlotOption` — contract §5 + `message`, `isLegendHidden` (deviation 1). A `<fieldset>` of real radios sharing `name`: selection styling is CSS (`has-checked:`), so a server-rendered picker with `defaultValue` works with no JavaScript and posts in a native form. The change handler exists only when `onValueChange` is given (i.e. inside a client tree); react-hook-form binds it with `<Controller>` (`value`, `onValueChange`, `name`, `onBlur` on the fieldset).

- [ ] **Step 1: Component tokens and contrast pairs**

`packages/design-tokens/tokens/component/slot-picker.json`:

```json
{
  "grid-template-columns": {
    "slot-picker": {
      "$value": "repeat(auto-fit, minmax(min(96px, 100%), 1fr))",
      "$description": "SlotPicker without columns: auto-fit at the design system's 96px minimum, never a bare 1fr. Utility: grid-cols-slot-picker."
    }
  },
  "text": {
    "$type": "typography",
    "slot-picker-note": {
      "$value": { "fontSize": "11.5px", "lineHeight": 1.3 },
      "$description": "The small line under a slot label, e.g. \"12 min\" (DM Sans 400)."
    }
  }
}
```

Append `"slot-picker-note"` to `TEXT` in `component-variants.ts`. Append to `groups` in `packages/design-tokens/contrast-pairs.json`:

```json
{
  "id": "slot-picker",
  "surface": null,
  "pairs": [
    ["color-ink-700", "color-surface-card"],
    ["color-pink-700", "color-surface-page-alt"],
    ["color-text-subtle", "color-surface-page-alt"]
  ],
  "min": 4.5
}
```

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -6`
Expected: PASS (ink-700 on white ≈ 11.2, pink-700 on pink-50 ≈ 6.2, ink-600 on pink-50 ≈ 6.0).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/slot-picker/slot-picker.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { type SlotOption, SlotPicker } from "./slot-picker";

const SLOTS: SlotOption[] = [
  { value: "asap", label: "ASAP", note: "12 min" },
  { value: "7:30pm", label: "7:30pm" },
  { value: "8:00pm", label: "8:00pm" },
  { value: "8:30pm", label: "8:30pm" },
  { value: "9pm", label: "9:00pm", isDisabled: true },
];

describe("SlotPicker", () => {
  it("is a named group of radios sharing one name", () => {
    render(<SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} />);
    const radios = within(screen.getByRole("group", { name: "Pickup time" })).getAllByRole("radio");
    expect(radios).toHaveLength(5);
    for (const radio of radios) expect(radio).toHaveAttribute("name", "pickup");
  });

  it("names each slot by its label and describes it with its note", () => {
    render(<SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} />);
    expect(screen.getByRole("radio", { name: "ASAP" })).toHaveAccessibleDescription("12 min");
  });

  it("starts at defaultValue and moves with a click when uncontrolled", async () => {
    const user = userEvent.setup();
    render(<SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} defaultValue="7:30pm" />);
    expect(screen.getByRole("radio", { name: "7:30pm" })).toBeChecked();
    await user.click(screen.getByText("8:00pm"));
    expect(screen.getByRole("radio", { name: "8:00pm" })).toBeChecked();
  });

  it("reports the picked slot and follows the caller when controlled", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <SlotPicker
        name="pickup"
        legend="Pickup time"
        slots={SLOTS}
        value="7:30pm"
        onValueChange={onValueChange}
      />
    );
    await user.click(screen.getByText("8:30pm"));
    expect(onValueChange).toHaveBeenCalledWith("8:30pm");
    expect(screen.getByRole("radio", { name: "7:30pm" })).toBeChecked();
    rerender(
      <SlotPicker
        name="pickup"
        legend="Pickup time"
        slots={SLOTS}
        value="8:30pm"
        onValueChange={onValueChange}
      />
    );
    expect(screen.getByRole("radio", { name: "8:30pm" })).toBeChecked();
  });

  it("picks from the keyboard", async () => {
    const user = userEvent.setup();
    render(<SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} />);
    await user.tab();
    await user.keyboard(" ");
    expect(screen.getByRole("radio", { name: "ASAP" })).toBeChecked();
  });

  it("moves between slots with the arrow keys, skipping a sold-out one", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SlotPicker
        name="pickup"
        legend="Pickup time"
        slots={SLOTS}
        defaultValue="8:30pm"
        onValueChange={onValueChange}
      />
    );
    await user.click(screen.getByRole("radio", { name: "8:30pm" }));
    await user.keyboard("{ArrowRight}");
    // 9:00pm is sold out, so the native group wraps round to the first slot.
    expect(screen.getByRole("radio", { name: "ASAP" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "ASAP" })).toBeChecked();
    expect(onValueChange).toHaveBeenLastCalledWith("asap");
  });

  it("strikes through and disables a sold-out slot — never hides it, never fades it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} onValueChange={onValueChange} />
    );
    const soldOut = screen.getByRole("radio", { name: "9:00pm" });
    expect(soldOut).toBeDisabled();
    expect(soldOut.closest("label")).toHaveClass("line-through");
    expect(soldOut.closest("label")?.className).not.toMatch(/opacity-/);
    await user.click(screen.getByText("9:00pm"));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("disables every slot and mutes the legend when the group is disabled", () => {
    render(<SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} disabled />);
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
    // jsdom cannot evaluate `:disabled` on the fieldset for styling; the class is the contract.
    expect(screen.getByText("Pickup time")).toHaveClass(
      "group-disabled/slot-picker:text-text-subtle"
    );
  });

  it.each([
    ["error", "border-status-danger"],
    ["success", "border-status-success"],
    ["warning", "border-status-warning"],
  ] as const)("paints the slots with the %s border", (status, border) => {
    render(
      <SlotPicker
        name="pickup"
        legend="Pickup time"
        slots={SLOTS}
        status={status}
        message="Pick a slot to continue."
      />
    );
    expect(screen.getByRole("radio", { name: "7:30pm" }).closest("label")).toHaveClass(border);
  });

  it("shows a hint as its message on the default status, describing the group politely", () => {
    render(
      <SlotPicker
        name="pickup"
        legend="Pickup time"
        slots={SLOTS}
        message="Slots open 30 minutes ahead."
      />
    );
    expect(screen.getByRole("group", { name: "Pickup time" })).toHaveAccessibleDescription(
      "Slots open 30 minutes ahead."
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("merges a caller className over its own gap", () => {
    render(<SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} className="gap-6" />);
    const group = screen.getByRole("group", { name: "Pickup time" });
    expect(group).toHaveClass("gap-6");
    expect(group).not.toHaveClass("gap-2.5");
  });

  it("describes the group with its error message and marks the slots invalid", () => {
    render(
      <SlotPicker
        name="pickup"
        legend="Pickup time"
        slots={SLOTS}
        status="error"
        message="Pick a slot to continue."
      />
    );
    expect(screen.getByRole("group", { name: "Pickup time" })).toHaveAccessibleDescription(
      "Pick a slot to continue."
    );
    expect(screen.getByRole("radio", { name: "ASAP" })).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Pick a slot to continue.");
  });

  it("marks the slots invalid only on the error status", () => {
    render(
      <SlotPicker
        name="pickup"
        legend="Pickup time"
        slots={SLOTS}
        status="warning"
        message="That slot is nearly full."
      />
    );
    expect(screen.getByRole("radio", { name: "ASAP" })).not.toHaveAttribute("aria-invalid");
  });

  it("lays slots in fixed columns, or auto-fits them without columns", () => {
    const { container, rerender } = render(
      <SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} columns={3} />
    );
    expect(container.querySelector(".grid-cols-3")).toBeInTheDocument();
    rerender(<SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} />);
    expect(container.querySelector(".grid-cols-slot-picker")).toBeInTheDocument();
  });

  it("keeps the group named when its legend is visually hidden", () => {
    render(<SlotPicker name="guests" legend="Guests" slots={SLOTS} isLegendHidden />);
    expect(screen.getByRole("group", { name: "Guests" })).toBeInTheDocument();
    expect(screen.getByText("Guests")).toHaveClass("sr-only");
  });

  it("has no accessibility violations at rest or in error", async () => {
    const { container } = render(
      <>
        <SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} defaultValue="7:30pm" />
        <SlotPicker
          name="table"
          legend="Table time"
          slots={SLOTS}
          status="error"
          message="Pick a slot to continue."
        />
        <SlotPicker
          name="booking"
          legend="Booking time"
          slots={SLOTS}
          disabled
          message="Table booking opens at 11am."
        />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/slot-picker 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./slot-picker`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/slot-picker/slot-picker.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { useId } from "react";

import type { FieldStatus } from "../../lib/field-status";

import { joinIds } from "../../lib/choice-control";
import { componentVariants } from "../../lib/component-variants";
import { FieldMessage, hasFieldMessage } from "../../lib/field-message";

const slotPicker = componentVariants({
  slots: {
    // `group/slot-picker` lets the legend mute while the fieldset is disabled (dev parity).
    root: "group/slot-picker m-0 grid min-w-0 gap-2.5 border-0 p-0",
    legend:
      "mb-2.5 p-0 text-body-sm font-medium text-text-body group-disabled/slot-picker:text-text-subtle",
    grid: "grid gap-2.5",
    slot: "grid min-h-hit min-w-0 cursor-pointer place-items-center gap-0.5 rounded-md border border-border-default bg-surface-card px-2.5 py-2 text-center font-display text-body-sm font-bold text-ink-700 transition-colors duration-fast ease-out has-checked:border-2 has-checked:border-border-brand has-checked:bg-surface-page-alt has-checked:text-pink-700 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus has-disabled:cursor-not-allowed has-disabled:bg-surface-sunken has-disabled:text-ink-400",
    input: "sr-only",
    note: "text-slot-picker-note font-normal font-body text-text-subtle",
  },
  variants: {
    status: {
      default: {},
      error: { slot: "border-status-danger" },
      // The design system draws only the error border; dev parity paints all three statuses.
      success: { slot: "border-status-success" },
      warning: { slot: "border-status-warning" },
    },
    isSoldOut: { true: { slot: "line-through" } },
    isLegendHidden: { true: { legend: "sr-only" } },
  },
  defaultVariants: { status: "default", isSoldOut: false, isLegendHidden: false },
});

/** Full literal classes, so Tailwind finds them. `undefined` columns auto-fit instead. */
const COLUMN_CLASS = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
} as const;

export interface SlotOption {
  value: string;
  label: string;
  /** A second line, e.g. "12 min". */
  note?: string | undefined;
  /** Sold out: struck through, not hidden. */
  isDisabled?: boolean | undefined;
}

export interface SlotPickerProps extends Omit<
  ComponentProps<"fieldset">,
  "onChange" | "defaultValue"
> {
  /** The radios' shared name — what a native form posts. */
  name: string;
  legend: ReactNode;
  isLegendHidden?: boolean | undefined;
  slots: SlotOption[];
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  /** Fixed column count; omit to auto-fit at a 96px minimum. */
  columns?: keyof typeof COLUMN_CLASS | undefined;
  status?: FieldStatus | undefined;
  /**
   * The line under the slots: on the default status a neutral hint ("Slots open 30 minutes
   * ahead."), with a status its message and glyph ("Pick a slot to continue.").
   */
  message?: ReactNode;
}

/** Pickup and table-booking time slots: a grid of real radios that reflows at any width. */
export function SlotPicker({
  name,
  legend,
  isLegendHidden = false,
  slots,
  value,
  defaultValue,
  onValueChange,
  columns,
  status = "default",
  message,
  className,
  "aria-describedby": describedBy,
  ...props
}: SlotPickerProps) {
  const baseId = useId();
  const messageId = `${baseId}-message`;
  const isControlled = value !== undefined;
  const styles = slotPicker({ status, isLegendHidden });

  return (
    <fieldset
      {...props}
      aria-describedby={joinIds(
        describedBy,
        hasFieldMessage({ status, message }) ? messageId : undefined
      )}
      className={styles.root({ className })}
    >
      <legend className={styles.legend()}>{legend}</legend>
      <div
        className={styles.grid({
          className: columns === undefined ? "grid-cols-slot-picker" : COLUMN_CLASS[columns],
        })}
      >
        {slots.map((slot, index) => {
          const labelId = `${baseId}-slot-${String(index)}`;
          const noteId = `${baseId}-note-${String(index)}`;
          return (
            <label
              key={slot.value}
              data-surface="light"
              className={styles.slot({ isSoldOut: slot.isDisabled === true })}
            >
              <input
                type="radio"
                name={name}
                value={slot.value}
                disabled={slot.isDisabled}
                aria-labelledby={labelId}
                aria-describedby={slot.note === undefined ? undefined : noteId}
                aria-invalid={status === "error" ? true : undefined}
                {...(isControlled
                  ? { checked: value === slot.value }
                  : { defaultChecked: defaultValue === slot.value })}
                onChange={
                  onValueChange === undefined
                    ? undefined
                    : (event) => {
                        onValueChange(event.currentTarget.value);
                      }
                }
                className={styles.input()}
              />
              <span id={labelId}>{slot.label}</span>
              {slot.note === undefined ? null : (
                <span id={noteId} className={styles.note()}>
                  {slot.note}
                </span>
              )}
            </label>
          );
        })}
      </div>
      <FieldMessage id={messageId} status={status} message={message} />
    </fieldset>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/slot-picker 2>&1 | tail -8`
Expected: PASS (16 tests).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/slot-picker/slot-picker.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn } from "storybook/test";

import { type SlotOption, SlotPicker } from "./slot-picker";

const PICKUP: SlotOption[] = [
  { value: "asap", label: "ASAP", note: "12 min" },
  { value: "7:30pm", label: "7:30pm" },
  { value: "8:00pm", label: "8:00pm" },
  { value: "8:30pm", label: "8:30pm" },
  { value: "9pm", label: "9:00pm", isDisabled: true },
];

const meta = {
  title: "Molecules/SlotPicker",
  component: SlotPicker,
  args: { name: "pickup", legend: "Pickup time", slots: PICKUP },
  parameters: {
    docs: {
      description: {
        component:
          'Pickup and table-booking time slots — a fieldset of real radios, so it works server-rendered, posts in a native form and keeps arrow-key selection. Auto-fit grid at a 96px minimum, so it reflows on any width; `columns` fixes the count. Sold-out slots (`isDisabled`) are struck through, not hidden. `status` + `message` for "Pick a slot to continue." 44px minimum hit height. Controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`); react-hook-form binds it with `<Controller>`.',
      },
    },
  },
} satisfies Meta<typeof SlotPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "auto-fit". */
export const Playground: Story = {
  args: { defaultValue: "7:30pm", onValueChange: fn() },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByText("8:00pm"));
    await expect(canvas.getByRole("radio", { name: "8:00pm" })).toBeChecked();
    await expect(args.onValueChange).toHaveBeenCalledWith("8:00pm");
  },
};

/** Card row "error". */
export const WithError: Story = { args: { status: "error", message: "Pick a slot to continue." } };

/** Card row "disabled". */
export const Disabled: Story = { args: { disabled: true } };

/** Card row `columns={3}` — the card shows no label, so the legend is visually hidden. */
export const Columns: Story = {
  args: {
    name: "guests",
    legend: "Guests",
    isLegendHidden: true,
    columns: 3,
    defaultValue: "2",
    slots: [
      { value: "2", label: "2 guests" },
      { value: "4", label: "4 guests" },
      { value: "6", label: "6 guests" },
    ],
  },
};

/** Dev parity: every status carries a sentence — hint, warning and success beside the card's error. */
export const Statuses: Story = {
  render: (args) => (
    <div className="flex max-w-120 flex-col gap-6">
      <SlotPicker {...args} name="pickup-hint" message="Slots open 30 minutes ahead." />
      <SlotPicker
        {...args}
        name="pickup-warning"
        status="warning"
        message="That slot is nearly full."
      />
      <SlotPicker
        {...args}
        name="pickup-success"
        status="success"
        defaultValue="7:30pm"
        message="Held for you until 7:15pm."
      />
    </div>
  ),
};

/** Dev parity: the narrowest supported width — the grid reflows instead of overflowing. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};
```

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export {
  type SlotOption,
  SlotPicker,
  type SlotPickerProps,
} from "./molecules/slot-picker/slot-picker";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/slot-picker packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/slot-picker packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/slot-picker.json packages/design-tokens/contrast-pairs.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): SlotPicker molecule on native radios

A fieldset of real radios styled by has-checked, so a server-rendered
picker selects and posts with no JavaScript. Sold-out slots are struck
through, not hidden; a status shows its message under the grid.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 7: Alert (+ client dismiss leaf)

Design-system sources: `components/molecules/Alert.*`; handoff `PlanCalculator.dc.html` (nudge → `brand`, PG hint → `neutral`), `DawatCalculator.dc.html` (warnings on ink → `warning`, a light island). Card rows: tone (info, success) · warning, danger · brand + action · dismissible.

**Files:**

- Create: `packages/design-tokens/tokens/component/alert.json`
- Create: `packages/ui/src/molecules/alert/alert.tsx`, `alert-dismiss.tsx`, `alert.test.tsx`, `alert.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`), `packages/design-tokens/contrast-pairs.json`, `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/alert/alert.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                | Ruling  | Where / why                                                                                            |
| ----------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| each tone fills its soft ground                                         | ADD     | fill column in the tone `it.each`                                                                      |
| full 1px border, never a coloured left edge                             | ADD     | test "carries a full border…"                                                                          |
| dismiss hit area ≥ 36px (dev: IconButton `sm`)                          | ADD     | `AlertDismiss` `relative before:absolute before:-inset-2` (24px glyph, 40px hit) + assertion           |
| caller `className` merges                                               | ADD     | test "merges a caller className…"                                                                      |
| `Narrow` story (360px, title + dismiss wrap)                            | ADD     | `Narrow` story                                                                                         |
| `role="status"` for every tone                                          | ALREADY | `status` for all but `danger`, which is `alert` (deviation 11 — better)                                |
| title above message; flush one-liner without title; one action; dismiss | ALREADY | tests "is a polite status…", "renders its action slot…", "offers a dismiss button only…"               |
| glyph not overridable ("the tone is the mark")                          | DROP    | contracts §5 `AlertProps.icon` (the handoff PG hint uses its own glyph)                                |
| warning glyph in tandoor, body text heading-coloured                    | DROP    | spec D4 / §5.3: the tone's `text-text-*` token paints glyph and text (turmeric-strong passes AA)       |
| `Tones`, `WithAction`, `MessageOnly`, `Dismissible` stories             | ALREADY | `InfoAndSuccess`, `WarningAndDanger`, `BrandWithAction`, `Nudge` / `Neutral` (no title), `Dismissible` |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Icon`; `Button`, `OnSurfaces` (Plan 2a, stories).
- Produces: `Alert`, `AlertProps` — contract §5 (deviation 11). `alert.tsx` is server-safe; `alert-dismiss.tsx` (`"use client"`) is the dismiss button, rendered only when `onDismiss` is given.

- [ ] **Step 1: Component token and contrast pair**

`packages/design-tokens/tokens/component/alert.json`:

```json
{
  "text": {
    "$type": "typography",
    "alert-title": {
      "$value": {
        "fontSize": "15px",
        "lineHeight": 1.6,
        "letterSpacing": "-0.005em",
        "fontWeight": "{font-weight.bold}"
      },
      "$description": "Alert title (Poppins 700)."
    }
  }
}
```

Append `"alert-title"` to `TEXT`. The four status tones reuse Plan 1's `status-on-soft` pairs and `neutral` reuses `light-text` (heading on sunken); the brand tone paints a new pair — append to `contrast-pairs.json` → `groups`:

```json
{
  "id": "alert",
  "surface": null,
  "pairs": [["color-pink-800", "color-surface-brand-soft"]],
  "min": 4.5
}
```

Rebuild and run the token tests (as in Task 6 Step 1). Expected: PASS (≈ 8.4).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/alert/alert.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Building2 } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Alert } from "./alert";

describe("Alert", () => {
  it("is a polite status message with its title and body", () => {
    render(<Alert title="Kitchen is busy">Pickup is running 25 minutes today.</Alert>);
    const alert = screen.getByRole("status");
    expect(alert).toHaveTextContent("Kitchen is busy");
    expect(alert).toHaveTextContent("Pickup is running 25 minutes today.");
  });

  it("interrupts for danger", () => {
    render(
      <Alert tone="danger" title="That card didn't go through">
        Try another card or pay by UPI.
      </Alert>
    );
    expect(screen.getByRole("alert")).toHaveTextContent("That card didn't go through");
  });

  it.each([
    ["info", "lucide-info", "text-text-info", "bg-status-info-soft"],
    ["success", "lucide-check", "text-text-success", "bg-status-success-soft"],
    ["warning", "lucide-triangle-alert", "text-text-warning", "bg-status-warning-soft"],
    ["danger", "lucide-circle-alert", "text-text-danger", "bg-status-danger-soft"],
    ["brand", "lucide-megaphone", "text-pink-800", "bg-surface-brand-soft"],
    ["neutral", "lucide-info", "text-text-heading", "bg-surface-sunken"],
  ] as const)("paints the %s tone with its glyph and soft ground", (tone, glyph, colour, fill) => {
    const { container } = render(<Alert tone={tone}>Message.</Alert>);
    expect(container.firstElementChild).toHaveClass(colour, fill);
    expect(container.querySelector(`svg.${glyph}`)).toBeInTheDocument();
  });

  it("carries a full border rather than a coloured left edge", () => {
    const { container } = render(<Alert tone="danger">Try another card or pay by UPI.</Alert>);
    expect(container.firstElementChild).toHaveClass("border", "border-status-danger");
    expect(container.firstElementChild).not.toHaveClass("border-l-4");
  });

  it("merges a caller className over its own radius", () => {
    const { container } = render(<Alert className="rounded-lg">We now take UPI.</Alert>);
    expect(container.firstElementChild).toHaveClass("rounded-lg");
    expect(container.firstElementChild).not.toHaveClass("rounded-md");
  });

  it("takes a glyph of its own", () => {
    const { container } = render(
      <Alert tone="neutral" icon={Building2}>
        Ordering for a PG, hostel or office of 20+? Talk to us about group pricing.
      </Alert>
    );
    expect(container.querySelector("svg.lucide-building-2")).toBeInTheDocument();
  });

  it("renders its action slot under the message", () => {
    render(
      <Alert
        tone="brand"
        title="New in Sector 57"
        action={<button type="button">See the Menu</button>}
      >
        Doors open Friday, 8am.
      </Alert>
    );
    expect(screen.getByRole("button", { name: "See the Menu" })).toBeInTheDocument();
  });

  it("offers a dismiss button only when onDismiss is given", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    const { rerender } = render(<Alert>We now take UPI at every counter.</Alert>);
    expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
    rerender(<Alert onDismiss={onDismiss}>We now take UPI at every counter.</Alert>);
    const dismiss = screen.getByRole("button", { name: "Dismiss" });
    // A 24px glyph button with a 40px hit area (dev parity; spec §5.5 floor is 24px).
    expect(dismiss).toHaveClass("size-6", "before:-inset-2");
    await user.click(dismiss);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("is a light island, so its action and links keep light skins on a dark field", () => {
    const { container } = render(
      <Alert tone="warning">Full setup and service starts at 50 guests.</Alert>
    );
    expect(container.firstElementChild).toHaveAttribute("data-surface", "light");
  });

  it("has no accessibility violations with a title, an action and a dismiss", async () => {
    const { container } = render(
      <Alert
        tone="brand"
        title="New in Sector 57"
        action={<button type="button">See the Menu</button>}
        onDismiss={vi.fn()}
      >
        Doors open Friday, 8am.
      </Alert>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/alert 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./alert`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/alert/alert-dismiss.tsx`:

```tsx
"use client";

import { X } from "lucide-react";

import { Icon } from "../../atoms/icon/icon";

export interface AlertDismissProps {
  onDismiss: () => void;
}

/** Alert's dismiss button — the one interactive corner of an otherwise static molecule. */
export function AlertDismiss({ onDismiss }: AlertDismissProps) {
  return (
    <button
      type="button"
      aria-label="Dismiss"
      onClick={onDismiss}
      // 24px to see, 40px to hit (`before:-inset-2`, dev parity): the pseudo-element takes the tap.
      className="relative grid size-6 shrink-0 place-items-center rounded-pill text-current transition-opacity duration-fast ease-out before:absolute before:-inset-2 hover:opacity-70"
    >
      <Icon icon={X} size="sm" />
    </button>
  );
}
```

`packages/ui/src/molecules/alert/alert.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { Check, CircleAlert, Info, Megaphone, TriangleAlert } from "lucide-react";

import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import { AlertDismiss } from "./alert-dismiss";

const alert = componentVariants({
  slots: {
    root: "flex items-start gap-3 rounded-md border px-4 py-3.5",
    icon: "mt-px",
    body: "min-w-0 flex-1",
    title: "text-alert-title m-0 font-display",
    content: "text-body-sm text-pretty",
    action: "mt-2.5",
  },
  variants: {
    tone: {
      info: { root: "border-status-info bg-status-info-soft text-text-info" },
      success: { root: "border-status-success bg-status-success-soft text-text-success" },
      warning: { root: "border-status-warning bg-status-warning-soft text-text-warning" },
      danger: { root: "border-status-danger bg-status-danger-soft text-text-danger" },
      brand: { root: "border-border-brand bg-surface-brand-soft text-pink-800" },
      neutral: {
        root: "border-border-subtle bg-surface-sunken text-text-heading",
        icon: "text-text-brand",
      },
    },
    hasTitle: { true: { content: "mt-0.75" } },
  },
  defaultVariants: { tone: "info", hasTitle: false },
});

type AlertTone = NonNullable<AlertProps["tone"]>;

const TONE_ICON: Readonly<Record<AlertTone, IconComponent>> = {
  info: Info,
  success: Check,
  warning: TriangleAlert,
  danger: CircleAlert,
  brand: Megaphone,
  neutral: Info,
};

export interface AlertProps extends Omit<ComponentProps<"div">, "title"> {
  tone?: "info" | "success" | "warning" | "danger" | "brand" | "neutral" | undefined;
  title?: ReactNode;
  /** Usually one small ghost Button. */
  action?: ReactNode;
  /** Shows the dismiss button. */
  onDismiss?: (() => void) | undefined;
  /** Replaces the tone's glyph (the handoff's PG hint uses Building2). */
  icon?: IconComponent | undefined;
}

/**
 * Persistent inline message — kitchen delays, closed outlets, payment problems, calculator nudges.
 * Soft tint with a matching full 1px border (never a coloured left border only). A light island on
 * any surface. Use Toast for transient confirmations instead.
 */
export function Alert({
  tone = "info",
  title,
  action,
  onDismiss,
  icon,
  className,
  children,
  ...props
}: AlertProps) {
  const hasTitle = title !== undefined && title !== null;
  const styles = alert({ tone, hasTitle });

  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      data-surface="light"
      className={styles.root({ className })}
      {...props}
    >
      <Icon icon={icon ?? TONE_ICON[tone]} size="md" className={styles.icon()} />
      <div className={styles.body()}>
        {hasTitle ? <p className={styles.title()}>{title}</p> : null}
        {children === undefined || children === null ? null : (
          <div className={styles.content()}>{children}</div>
        )}
        {action === undefined ? null : <div className={styles.action()}>{action}</div>}
      </div>
      {onDismiss === undefined ? null : <AlertDismiss onDismiss={onDismiss} />}
    </div>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/alert 2>&1 | tail -8`
Expected: PASS (14 tests).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/alert/alert.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Building2, TrendingDown } from "lucide-react";
import { expect, fn } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { OnSurfaces } from "../../lib/story-surfaces";
import { Alert } from "./alert";

const meta = {
  title: "Molecules/Alert",
  component: Alert,
  args: {
    tone: "warning",
    title: "Kitchen is busy",
    children: "Pickup is running 25 minutes today.",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Persistent inline message — kitchen delays, closed outlets, payment problems, calculator nudges. Soft tint fill with a matching **full** 1px border, never a coloured left border only. Tones: info, success, warning, danger (announced as an alert), brand, and neutral (the handoff's quiet hint). `action` takes one small Button; `onDismiss` adds a dismiss button. An Alert is a light island: on a pink or ink field it stays a tinted panel with light-skinned actions. Use Toast for transient confirmations instead.",
      },
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "tone" — info and success. */
export const InfoAndSuccess: Story = {
  render: () => (
    <div className="grid gap-3">
      <Alert tone="info" title="Pickup only">
        Delivery starts in 2027.
      </Alert>
      <Alert tone="success" title="Order confirmed">
        Kitchen has it. Counter 2.
      </Alert>
    </div>
  ),
};

/** Card row "warning danger". */
export const WarningAndDanger: Story = {
  render: () => (
    <div className="grid gap-3">
      <Alert tone="warning" title="Kitchen is busy">
        Pickup is running 25 minutes today.
      </Alert>
      <Alert tone="danger" title="That card didn't go through">
        Try another card or pay by UPI.
      </Alert>
    </div>
  ),
};

/** Card row "brand + action". */
export const BrandWithAction: Story = {
  args: {
    tone: "brand",
    title: "New in Sector 57",
    children: "Doors open Friday, 8am.",
    action: <Button size="sm">See the Menu</Button>,
  },
};

/** Card row "dismissible". */
export const Dismissible: Story = {
  args: {
    tone: "info",
    title: undefined,
    children: "We now take UPI at every counter.",
    onDismiss: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Dismiss" }));
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
  },
};

/** Handoff Plan calculator nudge — `tone="brand"`, own glyph, no title. */
export const Nudge: Story = {
  args: {
    tone: "brand",
    title: undefined,
    icon: TrendingDown,
    children: "Add 2 more people and every meal drops to ₹120.",
  },
};

/** Handoff Plan calculator PG hint — `tone="neutral"`. */
export const Neutral: Story = {
  args: {
    tone: "neutral",
    title: undefined,
    icon: Building2,
    children: "Ordering for a PG, hostel or office of 20+? Talk to us about group pricing.",
  },
};

/** Dev parity: 360px, the floor — title, message and dismiss wrap; the glyphs hold their size. */
export const Narrow: Story = {
  args: {
    tone: "danger",
    title: "That card didn't go through",
    children: "Try another card or pay by UPI at the counter.",
    onDismiss: fn(),
  },
  decorators: [
    (Story) => (
      <div className="max-w-90">
        <Story />
      </div>
    ),
  ],
};

/** Handoff Dawat calculator warning on the ink quote panel — a light island on every surface. */
export const OnSurfaces: Story = {
  args: { title: undefined, children: "Full setup and service starts at 50 guests." },
  render: (args) => (
    <OnSurfaces>
      <Alert {...args} />
    </OnSurfaces>
  ),
};
```

(`title: undefined` in a story's args is allowed: Storybook args are `Partial<AlertProps>`, whose `title` is `ReactNode`, which includes `undefined`.)

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export { Alert, type AlertProps } from "./molecules/alert/alert";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/alert packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/alert packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/alert.json packages/design-tokens/contrast-pairs.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): Alert molecule with a client dismiss leaf

Six tones (the handoff adds neutral), title, action slot and an optional
dismiss button in its own client file. Danger interrupts as an alert; the
panel is a light island so its action keeps light skins on pink or ink.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 8: Toast + ToastProvider (client, Radix Toast)

Design-system sources: `components/molecules/Toast.*`; UI kits `ui_kits/website/index.html` (page toast) and `ui_kits/app/index.html` (toast inside the phone frame). Card rows: tone (brand + action, ink) · status (success, danger) · pop.

**Files:**

- Create: `packages/design-tokens/tokens/component/toast.json`
- Create: `packages/ui/src/lib/notification.ts` (shared with Snackbar, Task 9)
- Create: `packages/ui/src/molecules/toast/toast.tsx`, `toast.test.tsx`, `toast.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`), `packages/design-tokens/contrast-pairs.json`, `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/toast/toast.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                           | Ruling  | Where / why                                                                                                           |
| ------------------------------------------------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------- |
| confirmation announced politely, failure assertively               | ADD     | Radix `type={tone === "danger" ? "foreground" : "background"}` + announcer `it.each` (Radix default: all assertive)   |
| action has a 44px hit target and press feedback                    | ADD     | `action` slot `-my-3 inline-flex min-h-hit … active:press-scale` + assertion                                          |
| caller `className` merges                                          | ADD     | test "merges a caller className…"                                                                                     |
| danger toast with an action (`Retry`); `CustomGlyph` story         | ADD     | `Status` story action, `CustomGlyph` story                                                                            |
| every toast rises in (`animate-pp-rise`), pop only swaps the curve | DROP    | spec D2: the design system's `Toast.jsx` animates only `pop` (`pp-toast-pop`); §8.1 reserves the entrance for `isPop` |
| `action` string + `onAction`                                       | ALREADY | contracts §5 `action: { label, altText, onClick }` (Radix `altText` for screen readers)                               |
| four tone fills; brand white on pink; one glyph, overridable; pill | ALREADY | tone `it.each`, "takes a glyph of its own"                                                                            |
| no action without a handler                                        | ALREADY | the action object carries its handler by type                                                                         |
| `InContext` story (bottom-centre above the tab bar, 360px)         | ALREADY | `Contained` story (`isContained`, deviation 4a) + the page-edge viewport test                                         |
| `Default`, `Tones`, `WithAction`, `Pop` stories                    | ALREADY | `Playground`, `Tones`, `Status`, `Pop`, `AddToOrder`                                                                  |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `useControllableState` (Task 1); `Icon`; `radix-ui` → `Toast` (`Provider`, `Viewport`, `Root`, `Description`, `Action` — verified in `@radix-ui/react-toast` 1.2.23: the root is an `<li>` portalled into the viewport `<ol>`, the viewport sits in a `role="region"` labelled `Notifications (F8)`, a toast renders nothing until the viewport has mounted).
- Produces: `ToastProvider`, `ToastProviderProps`, `Toast`, `ToastProps` — contract §5 + `className`, `isContained` (deviations 4, 4a, 5, 12); internal `lib/notification.ts` (`NotificationTone`, `NotificationProps`, `NOTIFICATION_ICON`, `NOTIFICATION_SURFACE`).

- [ ] **Step 1: Component tokens and contrast pairs**

`packages/design-tokens/tokens/component/toast.json`:

```json
{
  "color": {
    "$type": "color",
    "toast-success-bg": {
      "$value": "{color.mint-strong}",
      "$description": "Success toast fill. White on the design system's mint measures 3.16:1; on the strong mint it measures 6.36:1."
    }
  },
  "text": {
    "$type": "typography",
    "toast": {
      "$value": { "fontSize": "14.5px", "lineHeight": 1.6 },
      "$description": "Toast message (DM Sans 500)."
    },
    "toast-action": {
      "$value": { "fontSize": "13px", "lineHeight": 1.4, "letterSpacing": "0.04em" },
      "$description": "Toast action label (Poppins 700, uppercase)."
    }
  }
}
```

Append `"toast"` and `"toast-action"` to `TEXT`. Toasts set `data-surface` (brand → `brand`, the rest → `ink`), so their text is `text-text-body` = white. Brand and ink are covered by Plan 1's surface groups; append to `contrast-pairs.json` → `groups`:

```json
{
  "id": "toast",
  "surface": "ink",
  "pairs": [
    ["color-text-body", "color-toast-success-bg"],
    ["color-text-body", "color-status-danger"]
  ],
  "min": 4.5
}
```

Rebuild and run the token tests. Expected: PASS (≈ 6.36 and 5.38).

- [ ] **Step 2: The shared notification vocabulary**

`packages/ui/src/lib/notification.ts`:

```ts
import type { ReactNode } from "react";

import { Check, Info, TriangleAlert } from "lucide-react";

import type { IconComponent } from "../atoms/icon/icon";

export type NotificationTone = "brand" | "ink" | "success" | "danger";

export interface NotificationAction {
  label: string;
  /** How a screen-reader user can do the same thing, e.g. "View your cart" (Radix `altText`). */
  altText: string;
  onClick: () => void;
}

/** What Toast and Snackbar share (contract §5: `SnackbarProps extends Omit<ToastProps, "isPop">`). */
export interface NotificationProps {
  open?: boolean | undefined;
  /** Shown on mount unless `false` (Radix default). */
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  tone?: NotificationTone | undefined;
  /** Replaces the tone's glyph. */
  icon?: IconComponent | undefined;
  action?: NotificationAction | undefined;
  /** Time on screen, ms. `Infinity` keeps it until dismissed. */
  duration?: number | undefined;
  className?: string | undefined;
  /** One short sentence, no exclamation mark. */
  children: ReactNode;
}

export const NOTIFICATION_ICON: Readonly<Record<NotificationTone, IconComponent>> = {
  brand: Check,
  ink: Info,
  success: Check,
  danger: TriangleAlert,
};

/** A brand notification is a brand field; the rest are dark fields. On both, text and focus turn white. */
export const NOTIFICATION_SURFACE: Readonly<Record<NotificationTone, "brand" | "ink">> = {
  brand: "brand",
  ink: "ink",
  success: "ink",
  danger: "ink",
};
```

- [ ] **Step 3: Write the failing test**

`packages/ui/src/molecules/toast/toast.test.tsx`:

```tsx
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Heart } from "lucide-react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Toast, ToastProvider } from "./toast";

const VIEW_CART = { label: "View Cart", altText: "View your cart" } as const;

function notifications(): HTMLElement {
  return screen.getByRole("region", { name: "Notifications (F8)" });
}

describe("Toast", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows its message in the notifications region", () => {
    render(
      <ToastProvider>
        <Toast>Added to your order.</Toast>
      </ToastProvider>
    );
    expect(within(notifications()).getByText("Added to your order.")).toBeInTheDocument();
  });

  it.each([
    ["brand", "brand", "bg-surface-brand", "lucide-check"],
    ["ink", "ink", "bg-surface-inverse", "lucide-info"],
    ["success", "ink", "bg-toast-success-bg", "lucide-check"],
    ["danger", "ink", "bg-status-danger", "lucide-triangle-alert"],
  ] as const)("paints the %s tone as a %s field with its glyph", (tone, surface, fill, glyph) => {
    render(
      <ToastProvider>
        <Toast tone={tone}>Order confirmed.</Toast>
      </ToastProvider>
    );
    const item = within(notifications()).getByRole("listitem");
    expect(item).toHaveAttribute("data-surface", surface);
    expect(item).toHaveClass(fill);
    expect(item.querySelector(`svg.${glyph}`)).toBeInTheDocument();
  });

  it("takes a glyph of its own", () => {
    render(
      <ToastProvider>
        <Toast icon={Heart}>Saved to favourites.</Toast>
      </ToastProvider>
    );
    expect(
      within(notifications()).getByRole("listitem").querySelector("svg.lucide-heart")
    ).toBeInTheDocument();
  });

  it.each([
    ["brand", "polite"],
    ["ink", "polite"],
    ["success", "polite"],
    ["danger", "assertive"],
  ] as const)(
    "announces a %s toast %sly — a failure interrupts, a confirmation waits",
    (tone, politeness) => {
      render(
        <ToastProvider>
          <Toast tone={tone}>Order update.</Toast>
        </ToastProvider>
      );
      // Radix portals its announcer into the body: `type` "background" → polite, "foreground" → assertive.
      expect(
        document.body.querySelector(`[role="status"][aria-live="${politeness}"]`)
      ).toBeInTheDocument();
    }
  );

  it("merges a caller className over the pill", () => {
    render(
      <ToastProvider>
        <Toast className="rounded-lg">Added to your order.</Toast>
      </ToastProvider>
    );
    const item = within(notifications()).getByRole("listitem");
    expect(item).toHaveClass("rounded-lg");
    expect(item).not.toHaveClass("rounded-pill");
  });

  it("runs its action, then closes and reports it", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ToastProvider>
        <Toast tone="brand" onOpenChange={onOpenChange} action={{ ...VIEW_CART, onClick }}>
          Added to your order.
        </Toast>
      </ToastProvider>
    );
    const viewCart = screen.getByRole("button", { name: "View Cart" });
    // A 44px hit height inside the pill (dev parity), its margin pulled back into the padding.
    expect(viewCart).toHaveClass("min-h-hit", "-my-3");
    await user.click(viewCart);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(within(notifications()).queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("plays the pop entrance only when asked", () => {
    const { rerender } = render(
      <ToastProvider>
        <Toast>Table held.</Toast>
      </ToastProvider>
    );
    expect(within(notifications()).getByRole("listitem")).not.toHaveClass("animate-toast-pop");
    rerender(
      <ToastProvider>
        <Toast isPop>Chilli Paneer added.</Toast>
      </ToastProvider>
    );
    expect(within(notifications()).getByRole("listitem")).toHaveClass("animate-toast-pop");
  });

  it("follows open when controlled", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <ToastProvider>
        <Toast open={false} onOpenChange={onOpenChange}>
          Table held.
        </Toast>
      </ToastProvider>
    );
    expect(within(notifications()).queryByRole("listitem")).not.toBeInTheDocument();
    rerender(
      <ToastProvider>
        <Toast open onOpenChange={onOpenChange}>
          Table held.
        </Toast>
      </ToastProvider>
    );
    expect(within(notifications()).getByText("Table held.")).toBeInTheDocument();
  });

  it("closes itself after its duration and reports it", () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    render(
      <ToastProvider duration={3000}>
        <Toast onOpenChange={onOpenChange}>Table held.</Toast>
      </ToastProvider>
    );
    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(onOpenChange).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <ToastProvider>
        <Toast onOpenChange={onOpenChange}>Table held.</Toast>
      </ToastProvider>
    );
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("puts its viewport at the page edge by default, or inside the nearest positioned box", () => {
    const { rerender } = render(
      <ToastProvider>
        <Toast>Added.</Toast>
      </ToastProvider>
    );
    expect(within(notifications()).getByRole("list")).toHaveClass("fixed", "bottom-dock-clearance");
    rerender(
      <ToastProvider isContained>
        <Toast>Added.</Toast>
      </ToastProvider>
    );
    const list = within(notifications()).getByRole("list");
    expect(list).toHaveClass("absolute", "bottom-4");
    expect(list).not.toHaveClass("fixed");
  });

  it("hydrates a server-rendered page with no mismatch, then shows the toast", async () => {
    const tree = (
      <ToastProvider>
        <Toast defaultOpen duration={Infinity}>
          Added to your order.
        </Toast>
      </ToastProvider>
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(tree);
    document.body.append(container);
    const onRecoverableError = vi.fn();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const root = await act(() => hydrateRoot(container, tree, { onRecoverableError }));

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    expect(within(container).getByText("Added to your order.")).toBeInTheDocument();
    act(() => {
      root.unmount();
    });
    consoleError.mockRestore();
    container.remove();
  });

  it("has no accessibility violations with an action", async () => {
    const { container } = render(
      <ToastProvider>
        <Toast tone="brand" isPop action={{ ...VIEW_CART, onClick: vi.fn() }}>
          Chilli Paneer added.
        </Toast>
      </ToastProvider>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 4: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/toast 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./toast`.

- [ ] **Step 5: Implement**

`packages/ui/src/molecules/toast/toast.tsx`:

```tsx
"use client";

import type { ReactNode } from "react";

import { Toast as RadixToast } from "radix-ui";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import {
  NOTIFICATION_ICON,
  NOTIFICATION_SURFACE,
  type NotificationProps,
} from "../../lib/notification";
import { useControllableState } from "../../lib/use-controllable-state";

/** Radix Toast's own default time on screen. */
const TOAST_DURATION = 5000;

const toastViewport = componentVariants({
  base: "pointer-events-none z-toast m-0 flex list-none flex-col items-center gap-2 p-0",
  variants: {
    isContained: {
      /** The page edge, clear of the mobile action dock; 32px up from md. */
      false: "fixed inset-x-4 bottom-dock-clearance md:bottom-8",
      /** Inside the nearest positioned ancestor, e.g. AppShell's overlay slot. */
      true: "absolute inset-x-4 bottom-4",
    },
  },
  defaultVariants: { isContained: false },
});

const toast = componentVariants({
  slots: {
    root: "pointer-events-auto inline-flex max-w-full items-center gap-3 rounded-pill px-4 py-3 text-text-body shadow-3",
    message: "text-toast min-w-0 font-body font-medium text-pretty",
    // `min-h-hit` + `-my-3`: a 44px target that does not grow the pill (dev parity).
    action:
      "text-toast-action -my-3 inline-flex min-h-hit shrink-0 items-center rounded-xs px-0.5 font-display font-bold text-current uppercase active:press-scale",
  },
  variants: {
    tone: {
      brand: { root: "bg-surface-brand" },
      ink: { root: "bg-surface-inverse" },
      success: { root: "bg-toast-success-bg" },
      danger: { root: "bg-status-danger" },
    },
    isPop: { true: { root: "animate-toast-pop" } },
  },
  defaultVariants: { tone: "ink", isPop: false },
});

export interface ToastProviderProps {
  children: ReactNode;
  /** Default time on screen for every toast, ms. */
  duration?: number | undefined;
  /** Announced before each toast. */
  label?: string | undefined;
  /** Put the viewport inside the nearest positioned ancestor instead of at the page edge. */
  isContained?: boolean | undefined;
}

/**
 * Mount once: at the app root for page toasts (bottom-centre, above the mobile dock), or inside a
 * positioned frame such as AppShell's overlay slot with `isContained`. Every Toast rendered inside
 * it appears in its viewport.
 */
export function ToastProvider({
  children,
  duration = TOAST_DURATION,
  label = "Notification",
  isContained = false,
}: ToastProviderProps) {
  return (
    <RadixToast.Provider duration={duration} label={label} swipeDirection="down">
      {children}
      <RadixToast.Viewport className={toastViewport({ isContained })} />
    </RadixToast.Provider>
  );
}

export interface ToastProps extends NotificationProps {
  /** The single-overshoot entrance — add-to-cart and reward confirmations only. */
  isPop?: boolean | undefined;
}

/** Transient pill confirmation, no dismiss. Use Snackbar when the guest may want to undo. */
export function Toast({
  open,
  defaultOpen,
  onOpenChange,
  tone = "ink",
  icon,
  action,
  isPop = false,
  duration,
  className,
  children,
}: ToastProps) {
  const [isOpen, setIsOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen ?? true,
    onChange: onOpenChange,
  });
  const styles = toast({ tone, isPop });

  return (
    <RadixToast.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      // Severity picks the politeness (dev parity): a failure interrupts, a confirmation waits.
      type={tone === "danger" ? "foreground" : "background"}
      {...(duration === undefined ? {} : { duration })}
      data-surface={NOTIFICATION_SURFACE[tone]}
      className={styles.root({ className })}
    >
      <Icon icon={icon ?? NOTIFICATION_ICON[tone]} size="md" />
      <RadixToast.Description className={styles.message()}>{children}</RadixToast.Description>
      {action === undefined ? null : (
        <RadixToast.Action
          altText={action.altText}
          onClick={action.onClick}
          className={styles.action()}
        >
          {action.label}
        </RadixToast.Action>
      )}
    </RadixToast.Root>
  );
}
```

- [ ] **Step 6: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/toast 2>&1 | tail -8`
Expected: PASS (15 tests, the hydration test included). If the hydration test logs a mismatch, the cause is render-time state that differs between server and client — never silence `console.error`; find the value (e.g. a `typeof window` branch) and move it into an effect.

- [ ] **Step 7: Stories**

`packages/ui/src/molecules/toast/toast.stories.tsx` (no shared decorator: each story mounts its own provider, so the "contained" story never has two regions with the same name):

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Gift } from "lucide-react";
import { useState } from "react";
import { expect, fn } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { Toast, ToastProvider } from "./toast";

const VIEW_CART = { label: "View Cart", altText: "View your cart", onClick: fn() };

const meta = {
  title: "Molecules/Toast",
  component: Toast,
  args: { tone: "brand", duration: Infinity, action: VIEW_CART, children: "Added to your order." },
  render: (args) => (
    <ToastProvider>
      <Toast {...args} />
    </ToastProvider>
  ),
  parameters: {
    docs: {
      description: {
        component:
          "Transient pill confirmation, bottom-centre above the tab bar or dock. Mount one `ToastProvider` (at the app root, or `isContained` inside a positioned frame such as AppShell's overlay slot); every Toast inside it appears in its viewport. `isPop` is the only sanctioned overshoot in the system — reserve it for add-to-cart and reward confirmations. Copy is one short sentence, no exclamation mark. The optional action is an uppercase text button (`{ label, altText, onClick }`); there is no dismiss — use Snackbar for things the guest may want to reverse. Never show both at once.",
      },
      story: { inline: false, iframeHeight: "240px" },
    },
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "tone" — brand with its action, ink. */
export const Tones: Story = {
  render: () => (
    <ToastProvider>
      <Toast tone="brand" duration={Infinity} action={VIEW_CART}>
        Added to your order.
      </Toast>
      <Toast tone="ink" duration={Infinity}>
        Table held for 10 minutes.
      </Toast>
    </ToastProvider>
  ),
};

/** Card row "status" — success, danger. */
export const Status: Story = {
  render: () => (
    <ToastProvider>
      <Toast tone="success" duration={Infinity}>
        Order confirmed.
      </Toast>
      <Toast
        tone="danger"
        duration={Infinity}
        action={{ label: "Retry", altText: "Try the payment again", onClick: fn() }}
      >
        That card didn&apos;t go through.
      </Toast>
    </ToastProvider>
  ),
};

/** Card row "pop" — add-to-cart only. */
export const Pop: Story = { args: { isPop: true, children: "Chilli Paneer added." } };

/** Dev parity: `icon` overrides the tone's glyph. */
export const CustomGlyph: Story = {
  args: { icon: Gift, action: undefined, children: "You earned a free masala chai." },
};

function AddToOrderDemo() {
  const [added, setAdded] = useState(0);
  return (
    <ToastProvider>
      <Button
        onClick={() => {
          setAdded((count) => count + 1);
        }}
      >
        Add Chilli Paneer
      </Button>
      {added === 0 ? null : (
        <Toast key={added} tone="brand" isPop duration={4000} action={VIEW_CART}>
          Chilli Paneer added.
        </Toast>
      )}
    </ToastProvider>
  );
}

/** The real flow: each add pops a fresh toast. */
export const AddToOrder: Story = {
  render: () => <AddToOrderDemo />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add Chilli Paneer" }));
    await expect(await canvas.findByText("Chilli Paneer added.")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "View Cart" }));
    await expect(VIEW_CART.onClick).toHaveBeenCalled();
  },
};

/** `isContained` — the App kit's toast inside the phone frame (a positioned box here). */
export const Contained: Story = {
  render: (args) => (
    <div className="relative h-60 overflow-hidden rounded-xl border border-border-subtle bg-surface-page-alt">
      <ToastProvider isContained>
        <Toast {...args} />
      </ToastProvider>
    </div>
  ),
};
```

- [ ] **Step 8: Export**

Append to `packages/ui/src/index.ts`:

```ts
export {
  Toast,
  type ToastProps,
  ToastProvider,
  type ToastProviderProps,
} from "./molecules/toast/toast";
```

- [ ] **Step 9: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/toast packages/ui/src/lib packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/toast packages/ui/src/lib packages/ui/src/index.ts packages/design-tokens/tokens/component/toast.json packages/design-tokens/contrast-pairs.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 10: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): Toast and ToastProvider on Radix Toast

Pill confirmations in four tones with an optional text action and the
ease-pop entrance for add-to-cart. The provider's viewport is fixed to
the page edge or contained in a positioned frame (the App kit's phone).
Success fills with the strong mint: white on mint fails the policy.
A server-rendered page hydrates the provider without a mismatch.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 9: Snackbar (client, Radix Toast)

Design-system sources: `components/molecules/Snackbar.*`. Card rows: tones (ink, success, danger + Retry) · undo + dismiss · live copy.

A Snackbar owns its own Radix provider and viewport, mounted **only while open** (the design system's `if (!open) return null`): an idle Snackbar leaves no empty landmark behind, and the viewport has no hotkey, so it never competes with the app's `ToastProvider` for F8. Radix Toast still supplies the timer, swipe-to-dismiss, Escape, pause-on-hover and the announcement.

**Files:**

- Create: `packages/design-tokens/tokens/component/snackbar.json`
- Create: `packages/ui/src/molecules/snackbar/snackbar.tsx`, `snackbar.test.tsx`, `snackbar.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`, `TEXT`), `packages/design-tokens/contrast-pairs.json`, `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/snackbar/snackbar.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                             | Ruling  | Where / why                                                                                 |
| -------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------- |
| confirmation announced politely, failure assertively                 | ADD     | Radix `type` by tone + announcer `it.each` (as Toast)                                       |
| action 44px hit target + press feedback; dismiss hit ≥ 36px          | ADD     | `action` `-my-3 min-h-hit … active:press-scale`; `dismiss` `before:-inset-2` (40px) + test  |
| caller `className` merges                                            | ADD     | test "merges a caller className over the bar" (on the bar, not the anchor)                  |
| stories: brand tone, `top-center` / `bottom-right` anchors, `Narrow` | ADD     | `Brand`, `TopCenter`, `BottomRight`, `Narrow` stories                                       |
| dismiss only when `onClose` is given                                 | DROP    | deviation 6: the design system defines Snackbar as a bar "with a text action and a dismiss" |
| `duration={0}` keeps the bar up                                      | ALREADY | `duration={Infinity}` (Radix) — test "stays until dismissed…"                               |
| `isOpen` / `onClose` / `onAction`                                    | ALREADY | `open` / `onOpenChange` (spec §8.2), `action: { label, altText, onClick }` (contracts §5)   |
| renders nothing closed; four tone fills; brand white; five positions | ALREADY | tests "leaves nothing behind…", tone and position `it.each`                                 |
| auto-hide after 3.2s; dismiss/action close and report                | ALREADY | tests "hides itself after 3.2 seconds…", "closes from its dismiss…", "runs its action…"     |
| `Default`, `Tones` (danger + Retry), `UndoAndDismiss` stories        | ALREADY | `Playground`, `Success`, `DangerWithRetry`, `UndoAndDismiss`, `LiveCopy`, `TopRight`        |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `useControllableState` (Task 1); `NotificationProps`, `NOTIFICATION_ICON`, `NOTIFICATION_SURFACE` (Task 8); `Icon`; `Button` (stories).
- Produces: `Snackbar`, `SnackbarProps` — contract §5 + `isContained`, `className` (deviations 4, 4a, 6, 12). Default `duration` 3200ms, `position` `"bottom-center"`, `isContained` `true`.

- [ ] **Step 1: Component tokens and contrast pairs**

`packages/design-tokens/tokens/component/snackbar.json`:

```json
{
  "color": {
    "$type": "color",
    "snackbar-success-bg": {
      "$value": "{color.mint-strong}",
      "$description": "Success snackbar fill — white on the design system's mint fails AA (3.16:1)."
    }
  },
  "spacing": {
    "$type": "dimension",
    "snackbar": { "$value": "420px", "$description": "Snackbar bar maximum width." }
  },
  "text": {
    "$type": "typography",
    "snackbar": {
      "$value": { "fontSize": "14.5px", "lineHeight": 1.4 },
      "$description": "Snackbar message (DM Sans 500)."
    },
    "snackbar-action": {
      "$value": { "fontSize": "12.5px", "lineHeight": 1.4, "letterSpacing": "0.06em" },
      "$description": "Snackbar text action (Poppins 700, uppercase)."
    }
  }
}
```

Append `"snackbar"` to `SPACING`, and `"snackbar"`, `"snackbar-action"` to `TEXT`. Append to `contrast-pairs.json` → `groups` (the ink action is `text-text-brand`, pink-300 on ink, already in Plan 1's `ink-surface` group):

```json
{
  "id": "snackbar",
  "surface": "ink",
  "pairs": [
    ["color-text-body", "color-snackbar-success-bg"],
    ["color-text-body", "color-status-danger"]
  ],
  "min": 4.5
}
```

Rebuild and run the token tests. Expected: PASS.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/snackbar/snackbar.test.tsx`:

```tsx
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Snackbar } from "./snackbar";

const UNDO = { label: "Undo", altText: "Undo removing Chilli Paneer" } as const;

function messages(): HTMLElement {
  return screen.getByRole("region", { name: "Messages" });
}

describe("Snackbar", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows its message with a dismiss button", () => {
    render(<Snackbar>Table held for 10 minutes.</Snackbar>);
    expect(within(messages()).getByText("Table held for 10 minutes.")).toBeInTheDocument();
    expect(within(messages()).getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
  });

  it("leaves nothing behind while closed", () => {
    render(
      <Snackbar open={false} onOpenChange={vi.fn()}>
        Code copied.
      </Snackbar>
    );
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("anchors inside the nearest positioned box by default, or to the window", () => {
    const { rerender } = render(<Snackbar>Code copied.</Snackbar>);
    expect(within(messages()).getByRole("list")).toHaveClass(
      "absolute",
      "bottom-6",
      "justify-center"
    );
    rerender(<Snackbar isContained={false}>Code copied.</Snackbar>);
    const list = within(messages()).getByRole("list");
    expect(list).toHaveClass("fixed", "bottom-dock-clearance");
    expect(list).not.toHaveClass("absolute");
  });

  it.each([
    ["bottom-left", ["bottom-6", "justify-start"]],
    ["bottom-right", ["bottom-6", "justify-end"]],
    ["top-center", ["top-6", "justify-center"]],
    ["top-right", ["top-6", "justify-end"]],
  ] as const)("sits at %s", (position, classes) => {
    render(<Snackbar position={position}>Code copied.</Snackbar>);
    expect(within(messages()).getByRole("list")).toHaveClass(...classes);
  });

  it.each([
    ["ink", "ink", "bg-surface-inverse", "text-text-brand"],
    ["brand", "brand", "bg-surface-brand", "text-text-body"],
    ["success", "ink", "bg-snackbar-success-bg", "text-text-body"],
    ["danger", "ink", "bg-status-danger", "text-text-body"],
  ] as const)("paints the %s tone and its action", (tone, surface, fill, actionColour) => {
    render(
      <Snackbar tone={tone} action={{ ...UNDO, onClick: vi.fn() }}>
        Chilli Paneer removed.
      </Snackbar>
    );
    const bar = within(messages()).getByRole("listitem");
    expect(bar).toHaveAttribute("data-surface", surface);
    expect(bar).toHaveClass(fill);
    expect(within(bar).getByRole("button", { name: "Undo" })).toHaveClass(actionColour);
  });

  it.each([
    ["ink", "polite"],
    ["success", "polite"],
    ["danger", "assertive"],
  ] as const)(
    "announces a %s bar %sly — a failure interrupts, a confirmation waits",
    (tone, politeness) => {
      render(<Snackbar tone={tone}>Code copied.</Snackbar>);
      expect(
        document.body.querySelector(`[role="status"][aria-live="${politeness}"]`)
      ).toBeInTheDocument();
    }
  );

  it("gives the action a 44px hit height and the dismiss a 40px one, without growing the bar", () => {
    render(<Snackbar action={{ ...UNDO, onClick: vi.fn() }}>Chilli Paneer removed.</Snackbar>);
    expect(screen.getByRole("button", { name: "Undo" })).toHaveClass("min-h-hit", "-my-3");
    expect(screen.getByRole("button", { name: "Dismiss" })).toHaveClass(
      "size-6",
      "before:-inset-2"
    );
  });

  it("merges a caller className over the bar", () => {
    render(<Snackbar className="rounded-lg">Code copied.</Snackbar>);
    const bar = within(messages()).getByRole("listitem");
    expect(bar).toHaveClass("rounded-lg");
    expect(bar).not.toHaveClass("rounded-md");
  });

  it("runs its action, then closes and reports it", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Snackbar action={{ ...UNDO, onClick }} onOpenChange={onOpenChange}>
        Chilli Paneer removed.
      </Snackbar>
    );
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByText("Chilli Paneer removed.")).not.toBeInTheDocument();
  });

  it("closes from its dismiss button and reports it", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Snackbar onOpenChange={onOpenChange}>Code copied.</Snackbar>);
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("hides itself after 3.2 seconds by default", () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    render(<Snackbar onOpenChange={onOpenChange}>Code copied.</Snackbar>);
    act(() => {
      vi.advanceTimersByTime(3199);
    });
    expect(onOpenChange).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("stays until dismissed with an infinite duration", () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    render(
      <Snackbar duration={Infinity} onOpenChange={onOpenChange}>
        Code copied.
      </Snackbar>
    );
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("follows open when controlled", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Snackbar open={false} onOpenChange={onOpenChange}>
        Code copied.
      </Snackbar>
    );
    expect(screen.queryByText("Code copied.")).not.toBeInTheDocument();
    rerender(
      <Snackbar open onOpenChange={onOpenChange}>
        Code copied.
      </Snackbar>
    );
    expect(within(messages()).getByText("Code copied.")).toBeInTheDocument();
  });

  it("has no accessibility violations with an action and a dismiss", async () => {
    const { container } = render(
      <div className="relative">
        <Snackbar action={{ ...UNDO, onClick: vi.fn() }}>Chilli Paneer removed.</Snackbar>
      </div>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/snackbar 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./snackbar`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/snackbar/snackbar.tsx`:

```tsx
"use client";

import { X } from "lucide-react";
import { Toast as RadixToast } from "radix-ui";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import {
  NOTIFICATION_ICON,
  NOTIFICATION_SURFACE,
  type NotificationProps,
} from "../../lib/notification";
import { useControllableState } from "../../lib/use-controllable-state";

/** The design system's auto-hide delay. */
const SNACKBAR_DURATION = 3200;

/** No F8 hotkey: the app's ToastProvider owns it. */
const NO_HOTKEY: string[] = [];

const snackbar = componentVariants({
  slots: {
    anchor: "pointer-events-none inset-x-6 z-toast m-0 flex list-none p-0",
    root: "max-w-snackbar pointer-events-auto flex w-full min-w-0 animate-sheet-in items-center gap-3 rounded-md py-3.25 pr-3.5 pl-4 text-text-body shadow-3",
    message: "text-snackbar min-w-0 flex-1 font-body font-medium text-pretty",
    // Hit areas (dev parity): the action is 44px tall (`min-h-hit`, margin pulled into the 13px
    // padding by `-my-3`); the 24px dismiss takes taps over 40px through `before:-inset-2`.
    action:
      "text-snackbar-action -my-3 inline-flex min-h-hit shrink-0 items-center rounded-xs px-1.5 font-display font-bold uppercase active:press-scale",
    dismiss:
      "relative grid size-6 shrink-0 place-items-center rounded-pill text-current opacity-70 transition-opacity duration-fast ease-out before:absolute before:-inset-2 hover:opacity-100",
  },
  variants: {
    isContained: {
      /** Inside the nearest positioned ancestor (AppShell, or a `relative` wrapper). */
      true: { anchor: "absolute" },
      /** The window edge. */
      false: { anchor: "fixed" },
    },
    position: {
      "bottom-center": { anchor: "bottom-6 justify-center" },
      "bottom-left": { anchor: "bottom-6 justify-start" },
      "bottom-right": { anchor: "bottom-6 justify-end" },
      "top-center": { anchor: "top-6 justify-center" },
      "top-right": { anchor: "top-6 justify-end" },
    },
    tone: {
      ink: { root: "bg-surface-inverse", action: "text-text-brand" },
      brand: { root: "bg-surface-brand", action: "text-text-body" },
      success: { root: "bg-snackbar-success-bg", action: "text-text-body" },
      danger: { root: "bg-status-danger", action: "text-text-body" },
    },
  },
  compoundVariants: [
    {
      isContained: false,
      position: ["bottom-center", "bottom-left", "bottom-right"],
      class: { anchor: "bottom-dock-clearance md:bottom-6" },
    },
  ],
  defaultVariants: { isContained: true, position: "bottom-center", tone: "ink" },
});

type SnackbarPosition =
  "bottom-center" | "bottom-left" | "bottom-right" | "top-center" | "top-right";

/** Swipe towards the edge the bar is anchored to. */
const SWIPE_DIRECTION: Readonly<Record<SnackbarPosition, "up" | "down">> = {
  "bottom-center": "down",
  "bottom-left": "down",
  "bottom-right": "down",
  "top-center": "up",
  "top-right": "up",
};

/** Toast's props minus `isPop` (contract §5), plus where the bar sits. */
export interface SnackbarProps extends NotificationProps {
  position?: SnackbarPosition | undefined;
  /** Anchor to the nearest positioned ancestor (default); `false` pins the bar to the window edge. */
  isContained?: boolean | undefined;
}

/**
 * Anchored confirmation bar for a completed action that may need an escape hatch — copying a code,
 * undoing a removal, retrying a failure. A squared bar with an optional text action and a dismiss;
 * auto-hides after 3.2s. Never show a Snackbar and a Toast at once.
 */
export function Snackbar({
  open,
  defaultOpen,
  onOpenChange,
  tone = "ink",
  icon,
  action,
  duration = SNACKBAR_DURATION,
  position = "bottom-center",
  isContained = true,
  className,
  children,
}: SnackbarProps) {
  const [isOpen, setIsOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen ?? true,
    onChange: onOpenChange,
  });
  const styles = snackbar({ tone, position, isContained });

  if (!isOpen) return null;

  return (
    <RadixToast.Provider duration={duration} swipeDirection={SWIPE_DIRECTION[position]}>
      <RadixToast.Root
        open={isOpen}
        onOpenChange={setIsOpen}
        // Severity picks the politeness (dev parity): a failure interrupts, a confirmation waits.
        type={tone === "danger" ? "foreground" : "background"}
        data-surface={NOTIFICATION_SURFACE[tone]}
        className={styles.root({ className })}
      >
        <Icon icon={icon ?? NOTIFICATION_ICON[tone]} size="md" />
        <RadixToast.Description className={styles.message()}>{children}</RadixToast.Description>
        {action === undefined ? null : (
          <RadixToast.Action
            altText={action.altText}
            onClick={action.onClick}
            className={styles.action()}
          >
            {action.label}
          </RadixToast.Action>
        )}
        <RadixToast.Close aria-label="Dismiss" className={styles.dismiss()}>
          <Icon icon={X} size="sm" />
        </RadixToast.Close>
      </RadixToast.Root>
      <RadixToast.Viewport label="Messages" hotkey={NO_HOTKEY} className={styles.anchor()} />
    </RadixToast.Provider>
  );
}
```

(The early `return null` comes after every hook call, so the rules of hooks hold.)

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/snackbar 2>&1 | tail -8`
Expected: PASS (21 tests).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/snackbar/snackbar.stories.tsx` (one open Snackbar per story: two open at once would be two `Messages` landmarks, which the design system never shows):

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { useState } from "react";
import { expect, fn } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { Snackbar } from "./snackbar";

const meta = {
  title: "Molecules/Snackbar",
  component: Snackbar,
  args: { duration: Infinity, children: "Table held for 10 minutes.", onOpenChange: fn() },
  render: (args) => (
    <div className="relative h-28 rounded-lg border border-border-subtle bg-surface-page-alt">
      <Snackbar {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        component:
          "Anchored confirmation bar for a completed action that may need an escape hatch — copying a code, undoing a removal, retrying a failure. **Snackbar vs Toast:** Snackbar is a squared bar with a text action and a dismiss, for things the guest may want to reverse or act on; Toast is a pill with no dismiss, for pure confirmations like add-to-cart. Never show both at once. By default it anchors to the nearest positioned ancestor — inside AppShell that is the phone frame; on a web page give the wrapper `position: relative`, or pass `isContained={false}` to pin it to the window. Auto-hides after 3.2s (`duration={Infinity}` keeps it).",
      },
    },
  },
} satisfies Meta<typeof Snackbar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "tones" — ink. */
export const Playground: Story = {};

/** Card row "tones" — success. */
export const Success: Story = {
  args: { tone: "success", children: "Code copied. Paste it at checkout." },
};

/** Card row "tones" — danger with Retry. */
export const DangerWithRetry: Story = {
  args: {
    tone: "danger",
    children: "That card didn't go through.",
    action: { label: "Retry", altText: "Retry the payment", onClick: fn() },
  },
};

/** Card row "undo + dismiss". */
export const UndoAndDismiss: Story = {
  args: {
    children: "Chilli Paneer removed.",
    action: { label: "Undo", altText: "Undo removing Chilli Paneer", onClick: fn() },
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Dismiss" }));
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
    await expect(canvas.queryByText("Chilli Paneer removed.")).not.toBeInTheDocument();
  },
};

function LiveCopyDemo() {
  const [isCopied, setIsCopied] = useState(false);
  return (
    <div className="relative grid h-40 place-items-start rounded-lg border border-border-subtle p-4">
      <Button
        variant="secondary"
        onClick={() => {
          setIsCopied(true);
        }}
      >
        Copy PAPRIKAA50
      </Button>
      <Snackbar tone="success" position="bottom-left" open={isCopied} onOpenChange={setIsCopied}>
        Code copied. Paste it at checkout.
      </Snackbar>
    </div>
  );
}

/** Card row "live copy" — the code-copied flow (a Button stands in for the coupon stub). */
export const LiveCopy: Story = {
  render: () => <LiveCopyDemo />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Copy PAPRIKAA50" }));
    await expect(await canvas.findByText("Code copied. Paste it at checkout.")).toBeInTheDocument();
  },
};

/** `position="top-right"`. */
export const TopRight: Story = { args: { position: "top-right", children: "Order updated." } };

/** Dev parity: the other anchors, one open bar per story. */
export const TopCenter: Story = { args: { position: "top-center", children: "Order updated." } };

export const BottomRight: Story = {
  args: { position: "bottom-right", children: "Order updated." },
};

/** Dev parity: the brand tone. */
export const Brand: Story = { args: { tone: "brand", children: "Added to your order." } };

/** Dev parity: 360px is the floor — the bar caps at 420px and shrinks with the 24px gutter. */
export const Narrow: Story = {
  args: {
    children: "Chilli Paneer removed from your order.",
    action: { label: "Undo", altText: "Undo removing Chilli Paneer", onClick: fn() },
  },
  render: (args) => (
    <div className="relative h-28 max-w-90 rounded-lg border border-border-subtle bg-surface-page-alt">
      <Snackbar {...args} />
    </div>
  ),
};
```

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export { Snackbar, type SnackbarProps } from "./molecules/snackbar/snackbar";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/snackbar packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/snackbar packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/snackbar.json packages/design-tokens/contrast-pairs.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): Snackbar molecule on Radix Toast

Squared bar with a text action and a dismiss, auto-hiding after 3.2s,
anchored to its positioned ancestor (or the window) at five positions.
Its provider mounts only while open, so an idle snackbar leaves no empty
landmark and never takes the app's F8 hotkey.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 10: EmptyState

Design-system sources: `components/molecules/EmptyState.*`. Card rows: symbol · icon · `size="lg"`.

**Files:**

- Create: `packages/design-tokens/tokens/component/empty-state.json`
- Create: `packages/ui/src/molecules/empty-state/empty-state.tsx`, `empty-state.test.tsx`, `empty-state.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/empty-state/empty-state.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                   | Ruling  | Where / why                                                                       |
| ---------------------------------------------------------- | ------- | --------------------------------------------------------------------------------- |
| glyph drawn at 32px in pink-300                            | ADD     | assertions in the glyph test                                                      |
| `md` padding (`py-10`) as well as `lg`                     | ADD     | size test                                                                         |
| caller `className` merges                                  | ADD     | test "merges a caller className…"                                                 |
| `InCart` story (inside a cart panel, one action)           | ADD     | `InCart` story                                                                    |
| default title "Nothing here yet." / body "Let's fix that." | DROP    | spec D9 (no content defaults); contracts §5 makes `title` required                |
| `hasSymbol` boolean                                        | ALREADY | `variant="symbol"` (spec §8.2, contracts §5)                                      |
| title as a `<p>`                                           | ALREADY | a real heading at `headingLevel` (default 3, deviation 14)                        |
| caller copy; symbol hidden from AT; one action; axe        | ALREADY | tests "titles itself…", "shows the brand diamond…", "renders its one action", axe |
| `Default`, `Symbol`, `WithIcon`, `Sizes` stories           | ALREADY | `Playground` (symbol + action), `WithIcon`, `Large`                               |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Icon`; `SymbolMark` (Plan 2a, `lib/symbol-mark.tsx` — the brand symbol as the shared `mask-symbol` CSS mask in `currentColor`, always decorative; ruling R19); `headingTag` / `HeadingLevel`; `Button` (stories).
- Produces: `EmptyState`, `EmptyStateProps` — contract §5 (deviations 8, 14). No default copy: `title` is required (spec D9).

- [ ] **Step 1: Component token**

`packages/design-tokens/tokens/component/empty-state.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "empty-state-symbol-lg": {
      "$value": "52px",
      "$description": "EmptyState size=\"lg\" brand symbol box (md is 40px, a spacing step)."
    }
  }
}
```

Append `"empty-state-symbol-lg"` to `SPACING`. Rebuild tokens and run the variant spec.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/empty-state/empty-state.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { Search } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("titles itself with a level-3 heading by default and says what to do next", () => {
    render(<EmptyState title="Nothing here yet." body="Let's fix that." />);
    expect(
      screen.getByRole("heading", { level: 3, name: "Nothing here yet." })
    ).toBeInTheDocument();
    expect(screen.getByText("Let's fix that.")).toHaveClass(
      "text-text-muted",
      "max-w-text-measure-narrow"
    );
  });

  it("takes the heading level its page needs", () => {
    render(<EmptyState title="No orders yet." headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2, name: "No orders yet." })).toBeInTheDocument();
  });

  it("shows the utensils glyph by default, or the glyph it is given, at 32px in pink-300", () => {
    const { container, rerender } = render(<EmptyState title="Nothing here yet." />);
    expect(container.querySelector("svg.lucide-utensils")).toBeInTheDocument();
    rerender(<EmptyState title="Nothing matches that yet." icon={Search} />);
    const glyph = container.querySelector("svg.lucide-search");
    expect(glyph).toBeInTheDocument();
    expect(glyph?.parentElement).toHaveClass("size-icon-xl", "text-pink-300");
  });

  it("shows the brand diamond, hidden from assistive tech, for the symbol variant", () => {
    const { container } = render(<EmptyState title="Nothing here yet." variant="symbol" />);
    expect(container.querySelector("svg")).not.toBeInTheDocument();
    const symbol = container.querySelector(".mask-symbol");
    expect(symbol).toHaveAttribute("aria-hidden", "true");
    expect(symbol).toHaveClass("text-pink-500", "size-10");
    expect(container.innerHTML).not.toContain("<path");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders its one action", () => {
    render(<EmptyState title="Nothing here yet." action={<a href="/menu">Browse the Menu</a>} />);
    expect(screen.getByRole("link", { name: "Browse the Menu" })).toBeInTheDocument();
  });

  it("merges a caller className over its padding", () => {
    const { container } = render(<EmptyState title="Nothing here yet." className="py-2" />);
    expect(container.firstElementChild).toHaveClass("py-2");
    expect(container.firstElementChild).not.toHaveClass("py-10");
  });

  it("grows for size lg", () => {
    const { container, rerender } = render(<EmptyState title="No orders yet." variant="symbol" />);
    expect(container.firstElementChild).toHaveClass("py-10");
    rerender(<EmptyState title="No orders yet." size="lg" variant="symbol" />);
    expect(container.firstElementChild).toHaveClass("py-16");
    expect(screen.getByRole("heading")).toHaveClass("text-h3");
    expect(container.querySelector(".mask-symbol")).toHaveClass("size-empty-state-symbol-lg");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <EmptyState
        variant="symbol"
        title="Nothing here yet."
        body="Let's fix that."
        action={<a href="/menu">Browse the Menu</a>}
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/empty-state 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./empty-state`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/empty-state/empty-state.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { Utensils } from "lucide-react";

import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { SymbolMark } from "../../lib/symbol-mark";

const emptyState = componentVariants({
  slots: {
    root: "grid justify-items-center gap-2.5 text-center",
    symbol: "mb-1 text-pink-500 opacity-85",
    icon: "mb-1 text-pink-300",
    title: "m-0 font-display text-text-heading",
    body: "m-0 max-w-text-measure-narrow text-body-sm text-text-muted",
    action: "mt-2",
  },
  variants: {
    size: {
      md: { root: "px-5 py-10", symbol: "size-10", title: "text-h4" },
      lg: {
        root: "px-6 py-16",
        symbol: "size-empty-state-symbol-lg",
        icon: "size-10",
        title: "text-h3",
      },
    },
  },
  defaultVariants: { size: "md" },
});

export interface EmptyStateProps extends Omit<ComponentProps<"div">, "title"> {
  /** Short and plain: "Nothing here yet." */
  title: ReactNode;
  /** One line that says what to do next. */
  body?: ReactNode;
  /** Lucide glyph for the icon variant (default Utensils). */
  icon?: IconComponent | undefined;
  /** `symbol` uses the brand diamond instead of a glyph — the warmer option. */
  variant?: "icon" | "symbol" | undefined;
  /** Exactly one action, usually a Button — never two. */
  action?: ReactNode;
  size?: "md" | "lg" | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/** Empty cart, no search results, no orders yet. Always says what to do next; never apologetic. */
export function EmptyState({
  title,
  body,
  icon = Utensils,
  variant = "icon",
  action,
  size = "md",
  headingLevel = 3,
  className,
  ...props
}: EmptyStateProps) {
  const Heading = headingTag(headingLevel);
  const styles = emptyState({ size });

  return (
    <div className={styles.root({ className })} {...props}>
      {variant === "symbol" ? (
        <SymbolMark className={styles.symbol()} />
      ) : (
        <Icon icon={icon} size="xl" className={styles.icon()} />
      )}
      <Heading className={styles.title()}>{title}</Heading>
      {body === undefined || body === null ? null : <p className={styles.body()}>{body}</p>}
      {action === undefined || action === null ? null : (
        <div className={styles.action()}>{action}</div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/empty-state 2>&1 | tail -8`
Expected: PASS (8 tests).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/empty-state/empty-state.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Search, ShoppingBag } from "lucide-react";

import { Button } from "../../atoms/button/button";
import { EmptyState } from "./empty-state";

const meta = {
  title: "Molecules/EmptyState",
  component: EmptyState,
  args: {
    variant: "symbol",
    title: "Nothing here yet.",
    body: "Let's fix that.",
    action: <Button>Browse the Menu</Button>,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Empty cart, no search results, no orders yet. Copy is two short sentences and never apologetic — the title says what is missing, the body what to do next. Exactly one action, never two. `variant="symbol"` uses the brand diamond (the warmer option); otherwise a Lucide glyph (default Utensils). `headingLevel` (default 3) fits the page\'s outline.',
      },
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "symbol". */
export const Playground: Story = {};

/** Card row "icon". */
export const WithIcon: Story = {
  args: {
    variant: "icon",
    icon: Search,
    title: "Nothing matches that yet.",
    body: "Try another category.",
    action: undefined,
  },
};

/** Card row `size="lg"`. */
export const Large: Story = {
  args: {
    size: "lg",
    title: "No orders yet.",
    body: "Your first order will show up here.",
    action: undefined,
  },
};

/** Dev parity: in place — inside a cart panel, with the single action that fills it. */
export const InCart: Story = {
  args: {
    title: "Your cart is empty.",
    body: "Add something from the menu and it will show up here.",
    action: <Button icon={ShoppingBag}>Browse the Menu</Button>,
  },
  render: (args) => (
    <div className="max-w-90 rounded-lg border border-border-subtle bg-surface-card">
      <EmptyState {...args} />
    </div>
  ),
};
```

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export { EmptyState, type EmptyStateProps } from "./molecules/empty-state/empty-state";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/empty-state packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/empty-state packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/empty-state.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): EmptyState molecule

Brand diamond or Lucide glyph, a titled heading at the page's level, one
line of what to do next and a single action. No default copy.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 11: Tabs (client, Radix Tabs)

Design-system sources: `components/molecules/Tabs.*` (underline); handoff `ThisWeek.dc.html`, `HomelyMeals.dc.html`, `Catering.dc.html` (segmented pill rail: white, 1px `--border-subtle`, 4px padding, 44px pink-500 active pill, pink-700 idle). Card rows: default (four items) · two items.

**Files:**

- Create: `packages/design-tokens/tokens/component/tabs.json`
- Create: `packages/ui/src/molecules/tabs/tabs.tsx`, `tabs.test.tsx`, `tabs.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`), `packages/design-tokens/contrast-pairs.json`, `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/tabs/tabs.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                               | Ruling  | Where / why                                                                                                      |
| ---------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------- |
| underline trigger has a 44px hit height                                | ADD     | `min-h-hit` on the underline trigger (spec §5.5) + assertion                                                     |
| active tab underlined in brand pink                                    | ADD     | assertion `aria-selected:after:bg-border-brand`                                                                  |
| leading glyph beside a tab label                                       | ADD     | trigger `inline-flex items-center gap-2`; the glyph rides in the ReactNode `label` + test + `WithIcons` story    |
| caller `className` merges                                              | ADD     | test "merges a caller className…"                                                                                |
| `Narrow` story (360px)                                                 | ADD     | `Narrow` story                                                                                                   |
| per-tab `isDisabled` (inert "off today" section)                       | DELTA   | contracts §5 `TabItem` is `{ value, label, content }` — proposed contract delta, see the 3a audit                |
| `isFullWidth` (equal shares across a card)                             | DELTA   | not in contracts §5 `TabsProps` — proposed contract delta, see the 3a audit                                      |
| underline row scrolls sideways instead of wrapping                     | ALREADY | the row wraps (`flex-wrap gap-y-3`): never clips or overflows at 360px — covered differently (see audit concern) |
| `icon?: LucideIcon` on `TabItem`                                       | ALREADY | `label: ReactNode` carries the glyph (contracts §5)                                                              |
| optional `label`                                                       | ALREADY | `label: string` required (contracts §5) — an unnamed tab list is an a11y gap                                     |
| named list; first tab default; defaultValue; click; arrows; controlled | ALREADY | tests "is a named tab list…", "starts at defaultValue", "selects a tab…", "moves and selects…", "reports but…"   |
| `Default`, `TwoSections` stories                                       | ALREADY | `Playground`, `TwoItems`                                                                                         |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `useControllableState` (Task 1); `radix-ui` → `Tabs` (`Root`, `List`, `Trigger`, `Content` — verified in `@radix-ui/react-tabs` 1.1.21: triggers carry `aria-selected` and `data-state`, activate on mouse-down and on focus (automatic), arrows/Home/End rove; `Content` spreads its props after `hidden`, so `forceMount` + our own `hidden` keeps every panel mounted).
- Produces: `Tabs`, `TabsProps`, `TabItem` — contract §5. Every panel is in the server HTML (inactive ones `hidden`), so an inactive menu section is still indexed and every trigger's `aria-controls` resolves.

- [ ] **Step 1: Component tokens and contrast pair**

`packages/design-tokens/tokens/component/tabs.json`:

```json
{
  "color": {
    "$type": "color",
    "tabs-segmented-fg": {
      "$value": "{color.pink.700}",
      "$description": "Idle label on the handoff's segmented tab rail (white fill)."
    }
  },
  "text": {
    "$type": "typography",
    "tabs-label": {
      "$value": {
        "fontSize": "15px",
        "lineHeight": 1.4,
        "letterSpacing": "-0.005em",
        "fontWeight": "{font-weight.bold}"
      },
      "$description": "Underline tab label (Poppins 700)."
    }
  }
}
```

Append `"tabs-label"` to `TEXT`. Append to `contrast-pairs.json` → `groups` (the rail is a light island; the active pill is Plan 1's `on-brand-fill` pair):

```json
{
  "id": "tabs",
  "surface": null,
  "pairs": [["color-tabs-segmented-fg", "color-surface-card"]],
  "min": 4.5
}
```

Rebuild and run the token tests. Expected: PASS (pink-700 on white ≈ 7.0).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/tabs/tabs.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Soup } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Icon } from "../../atoms/icon/icon";
import { type TabItem, Tabs } from "./tabs";

const MENU: TabItem[] = [
  { value: "all-day", label: "All Day", content: <p>The all-day menu.</p> },
  { value: "breakfast", label: "Breakfast", content: <p>The breakfast menu.</p> },
  { value: "bar", label: "Bar", content: <p>The bar menu.</p> },
];

describe("Tabs", () => {
  it("is a named tab list whose first tab is selected by default", () => {
    render(<Tabs label="Menu sections" items={MENU} />);
    expect(screen.getByRole("tablist", { name: "Menu sections" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "All Day" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "All Day" })).toHaveTextContent(
      "The all-day menu."
    );
  });

  it("keeps every panel in the page and hides the inactive ones", () => {
    render(<Tabs label="Menu sections" items={MENU} />);
    expect(screen.getByText("The breakfast menu.")).not.toBeVisible();
    expect(screen.getByText("The all-day menu.")).toBeVisible();
  });

  it("starts at defaultValue", () => {
    render(<Tabs label="Menu sections" items={MENU} defaultValue="bar" />);
    expect(screen.getByRole("tab", { name: "Bar" })).toHaveAttribute("aria-selected", "true");
  });

  it("selects a tab on click and reports it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Tabs label="Menu sections" items={MENU} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("tab", { name: "Breakfast" }));
    expect(screen.getByRole("tab", { name: "Breakfast" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("The breakfast menu.")).toBeVisible();
    expect(onValueChange).toHaveBeenCalledWith("breakfast");
  });

  it("moves and selects with the arrow keys, Home and End", async () => {
    const user = userEvent.setup();
    render(<Tabs label="Menu sections" items={MENU} />);
    await user.click(screen.getByRole("tab", { name: "All Day" }));
    await user.keyboard("{ArrowRight}");
    const breakfast = screen.getByRole("tab", { name: "Breakfast" });
    expect(breakfast).toHaveFocus();
    expect(breakfast).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Bar" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "All Day" })).toHaveFocus();
  });

  it("reports but keeps the caller's tab when controlled", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Tabs label="Menu sections" items={MENU} value="all-day" onValueChange={onValueChange} />
    );
    await user.click(screen.getByRole("tab", { name: "Breakfast" }));
    expect(onValueChange).toHaveBeenCalledWith("breakfast");
    expect(screen.getByRole("tab", { name: "All Day" })).toHaveAttribute("aria-selected", "true");
  });

  it("draws the underline rail by default and the segmented rail as a light island of pills", () => {
    const { rerender } = render(<Tabs label="Menu sections" items={MENU} />);
    expect(screen.getByRole("tablist")).toHaveClass("border-b");
    // A 44px target (spec §5.5, dev parity) with the 3px pink underline under the active tab.
    expect(screen.getByRole("tab", { name: "All Day" })).toHaveClass(
      "min-h-hit",
      "aria-selected:after:bg-border-brand"
    );
    rerender(<Tabs label="Menu sections" items={MENU} variant="segmented" />);
    const rail = screen.getByRole("tablist");
    expect(rail).toHaveAttribute("data-surface", "light");
    expect(rail).toHaveClass("rounded-pill");
    expect(screen.getByRole("tab", { name: "All Day" })).toHaveClass("min-h-hit");
  });

  it("lays a glyph passed in the label beside its text", () => {
    render(
      <Tabs
        label="Menu sections"
        items={[
          {
            value: "all-day",
            label: (
              <>
                <Icon icon={Soup} size="sm" />
                All Day
              </>
            ),
            content: <p>The all-day menu.</p>,
          },
          ...MENU.slice(1),
        ]}
      />
    );
    const tab = screen.getByRole("tab", { name: "All Day" });
    expect(tab).toHaveClass("inline-flex", "gap-2");
    expect(tab.querySelector("svg.lucide-soup")).toBeInTheDocument();
  });

  it("merges a caller className over its own gap", () => {
    const { container } = render(<Tabs label="Menu sections" items={MENU} className="gap-2" />);
    expect(container.firstElementChild).toHaveClass("gap-2");
    expect(container.firstElementChild).not.toHaveClass("gap-6");
  });

  it("has no accessibility violations in either variant", async () => {
    const { container } = render(
      <>
        <Tabs label="Menu sections" items={MENU} />
        <Tabs
          label="This week"
          variant="segmented"
          items={[
            { value: "classic", label: "Classic & Signature", content: <p>Classic.</p> },
            { value: "everyday", label: "Everyday", content: <p>Everyday.</p> },
          ]}
        />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/tabs 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./tabs`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/tabs/tabs.tsx`:

```tsx
"use client";

import type { ReactNode } from "react";

import { Tabs as RadixTabs } from "radix-ui";

import { componentVariants } from "../../lib/component-variants";
import { useControllableState } from "../../lib/use-controllable-state";

const tabs = componentVariants({
  slots: {
    root: "grid min-w-0 gap-6",
    list: "flex min-w-0",
    // `inline-flex gap-2`: a glyph passed in a ReactNode `label` sits beside its text (dev parity).
    trigger:
      "inline-flex shrink-0 items-center justify-center gap-2 font-display font-bold whitespace-nowrap transition-colors duration-fast ease-out",
    panel: "min-w-0",
  },
  variants: {
    variant: {
      underline: {
        list: "flex-wrap gap-x-7 gap-y-3 border-b border-border-subtle",
        trigger:
          "text-tabs-label relative min-h-hit pb-3 text-text-subtle after:absolute after:inset-x-0 after:-bottom-px after:h-0.75 after:rounded-t-xs after:transition-colors after:duration-base after:ease-out hover:text-text-heading aria-selected:text-text-heading aria-selected:after:bg-border-brand",
      },
      segmented: {
        list: "flex-wrap gap-1 justify-self-start rounded-pill border border-border-subtle bg-surface-card p-1",
        trigger:
          "text-tabs-segmented-fg min-h-hit rounded-pill px-4 py-2.5 text-body-sm hover:bg-surface-page-alt aria-selected:bg-surface-brand aria-selected:text-text-on-brand aria-selected:hover:bg-brand-hover",
      },
    },
  },
  defaultVariants: { variant: "underline" },
});

export interface TabItem {
  value: string;
  label: ReactNode;
  content: ReactNode;
}

export interface TabsProps {
  /** Accessible name of the tab list, e.g. "Menu sections". */
  label: string;
  items: TabItem[];
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  /** `underline` (design system) or the handoff's `segmented` pill rail. */
  variant?: "underline" | "segmented" | undefined;
  className?: string | undefined;
}

/**
 * Switch sections inside one page. `underline` (design system): Poppins 700 with a 3px pink bar
 * under the active tab. `segmented` (handoff): a white pill rail with a pink active pill. For
 * filtering a list use FilterBar; for app navigation use TabBar.
 */
export function Tabs({
  label,
  items,
  value,
  defaultValue,
  onValueChange,
  variant,
  className,
}: TabsProps) {
  const [selected, setSelected] = useControllableState({
    value,
    defaultValue: defaultValue ?? items[0]?.value ?? "",
    onChange: onValueChange,
  });
  const styles = tabs({ variant });

  return (
    <RadixTabs.Root
      value={selected}
      onValueChange={setSelected}
      className={styles.root({ className })}
    >
      <RadixTabs.List
        aria-label={label}
        data-surface={variant === "segmented" ? "light" : undefined}
        className={styles.list()}
      >
        {items.map((item) => (
          <RadixTabs.Trigger key={item.value} value={item.value} className={styles.trigger()}>
            {item.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {items.map((item) => (
        <RadixTabs.Content
          key={item.value}
          value={item.value}
          forceMount
          hidden={item.value !== selected}
          className={styles.panel()}
        >
          {item.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/tabs 2>&1 | tail -8`
Expected: PASS (10 tests).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/tabs/tabs.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Croissant, IceCreamCone, Soup } from "lucide-react";
import { expect, fn } from "storybook/test";

import { Icon } from "../../atoms/icon/icon";
import { type TabItem, Tabs } from "./tabs";

function panel(text: string) {
  return <p className="m-0 text-body-sm text-text-muted">{text}</p>;
}

const MENU: TabItem[] = [
  { value: "all-day", label: "All Day", content: panel("All-day plates, 8am – 11:30pm.") },
  { value: "breakfast", label: "Breakfast", content: panel("Breakfast plates.") },
  { value: "bar", label: "Bar", content: panel("Chai, coffee and coolers.") },
  { value: "sweets", label: "Sweets", content: panel("Kulfi, halwa and bakes.") },
];

const meta = {
  title: "Molecules/Tabs",
  component: Tabs,
  args: { label: "Menu sections", items: MENU, onValueChange: fn() },
  parameters: {
    docs: {
      description: {
        component:
          "Tabs switch sections inside one page. `underline` (the design system): Poppins 700, a 3px pink bar under the active tab. `segmented` (the handoff's pill rail on This Week, Homely Meals and Catering): a white rail with a pink active pill, 44px tall. Arrow keys move between tabs and select as they go; Home/End jump. Every panel stays in the page (inactive ones hidden), so search engines index the whole menu. For filtering a list use FilterBar; for app-level navigation use TabBar.",
      },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "default". */
export const Playground: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Breakfast" }));
    await expect(args.onValueChange).toHaveBeenCalledWith("breakfast");
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", { name: "Bar" })).toHaveFocus();
    await expect(canvas.getByText("Chai, coffee and coolers.")).toBeVisible();
  },
};

/** Card row "two items". */
export const TwoItems: Story = {
  args: {
    label: "Feed",
    items: [
      { value: "feed", label: "Feed", content: panel("Posts.") },
      { value: "stories", label: "Stories", content: panel("Stories.") },
    ],
  },
};

/** Handoff This Week rail — `variant="segmented"`. */
export const Segmented: Story = {
  args: {
    label: "This week's menu",
    variant: "segmented",
    items: [
      { value: "classic", label: "Classic & Signature", content: panel("The classic week.") },
      { value: "everyday", label: "Everyday", content: panel("The everyday week.") },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Everyday" }));
    await expect(canvas.getByRole("tab", { name: "Everyday" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  },
};

/** Dev parity: a glyph before each label — pass it inside the ReactNode `label`. */
export const WithIcons: Story = {
  args: {
    items: [
      {
        value: "all-day",
        label: (
          <>
            <Icon icon={Soup} size="sm" />
            All Day
          </>
        ),
        content: panel("All-day plates, 8am – 11:30pm."),
      },
      {
        value: "breakfast",
        label: (
          <>
            <Icon icon={Croissant} size="sm" />
            Breakfast
          </>
        ),
        content: panel("Breakfast plates."),
      },
      {
        value: "sweets",
        label: (
          <>
            <Icon icon={IceCreamCone} size="sm" />
            Sweets
          </>
        ),
        content: panel("Kulfi, halwa and bakes."),
      },
    ],
  },
};

/** Dev parity: the smallest supported width (320px of content) — the rail wraps, it never clips. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-full max-w-80">
        <Story />
      </div>
    ),
  ],
};
```

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export { type TabItem, Tabs, type TabsProps } from "./molecules/tabs/tabs";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/tabs packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/tabs packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/tabs.json packages/design-tokens/contrast-pairs.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): Tabs molecule on Radix Tabs

Underline tabs from the design system and the handoff's segmented pill
rail. Every panel stays mounted (inactive ones hidden), so the whole menu
is in the server HTML and every aria-controls resolves.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 12: Breadcrumb

Design-system sources: `components/molecules/Breadcrumb.*`. Card rows: 3 levels · 2 levels · long (wraps, never clips).

**Files:**

- Create: `packages/design-tokens/tokens/component/breadcrumb.json`
- Create: `packages/ui/src/molecules/breadcrumb/breadcrumb.tsx`, `breadcrumb.test.tsx`, `breadcrumb.stories.tsx`
- Modify: `packages/design-tokens/tokens/surface/{brand,ink,light}.json`, `packages/ui/src/lib/component-variants.ts` (`TEXT`), `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/breadcrumb/breadcrumb.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                               | Ruling  | Where / why                                                                                   |
| ---------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------- |
| caller `className` merges with its own                                 | ADD     | test "merges a caller className…"                                                             |
| `UnlinkedLevel` story                                                  | ADD     | `UnlinkedLevel` story                                                                         |
| `tone="inverse"` (white trail on brand / ink)                          | DROP    | spec D5, deviation 7 — the chevron is a surface-overridden token; `OnSurfaces` story shows it |
| `label` prop for the landmark name                                     | ALREADY | native `aria-label` (default "Breadcrumb", deviation 15)                                      |
| named nav + `<ol>`; links all but current; last current even with href | ALREADY | tests "is a named navigation landmark…", "links every crumb…", "marks the last crumb…"        |
| mid crumb without href is text; chevrons between, none after the last  | ALREADY | tests "writes a middle crumb…", "separates crumbs…"                                           |
| `Default`, `TwoLevels`, `LongTrail`, `OnBrand`, `Narrow` stories       | ALREADY | `Playground`, `TwoLevels`, `Long` (360px viewport), `OnSurfaces`                              |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Icon`; `LinkAs`, `LinkAsProps` (Plan 2a); `OnSurfaces` (Plan 2a, stories).
- Produces: `Breadcrumb`, `BreadcrumbProps`, `BreadcrumbItem` — contract §5 without `tone` (deviation 7). `<nav aria-label="Breadcrumb"><ol>`; the last item is the current page (`aria-current="page"`, never a link); a middle item without `href` is plain text, never `href="#"`.

- [ ] **Step 1: Component tokens and the surface skin**

`packages/design-tokens/tokens/component/breadcrumb.json`:

```json
{
  "color": {
    "$type": "color",
    "breadcrumb-chevron": {
      "$value": "{color.ink.400}",
      "$description": "Decorative chevron between crumbs; white at 50% on brand and ink fields."
    }
  },
  "text": {
    "$type": "typography",
    "breadcrumb": {
      "$value": { "fontSize": "13.5px", "lineHeight": 1.6 },
      "$description": "Breadcrumb links and current page (DM Sans)."
    }
  }
}
```

Add, inside `surface-brand` → `color` of `tokens/surface/brand.json` **and** inside `surface-ink` → `color` of `tokens/surface/ink.json`:

```json
"breadcrumb-chevron": { "$value": "{color.white-alpha.50}" }
```

and inside `surface-light` → `color` of `tokens/surface/light.json` (the light island restores it):

```json
"breadcrumb-chevron": { "$value": "{color.ink.400}" }
```

Append `"breadcrumb"` to `TEXT`. Rebuild and run the token tests (`theme.spec`'s light-restore test covers the new override). Text colours are semantic (`text-muted`, `text-heading`), already in Plan 1's groups on every surface; the chevron is decorative.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/breadcrumb/breadcrumb.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";

import type { LinkAsProps } from "../../lib/link-as";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Breadcrumb, type BreadcrumbItem } from "./breadcrumb";

const MENU_TRAIL: BreadcrumbItem[] = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Small Plates" },
];

function RouterLink({ href, className, children }: LinkAsProps) {
  return (
    <a href={href} className={className} data-router="">
      {children}
    </a>
  );
}

describe("Breadcrumb", () => {
  it("is a named navigation landmark with an ordered trail", () => {
    render(<Breadcrumb items={MENU_TRAIL} />);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(nav).getAllByRole("listitem")).toHaveLength(3);
  });

  it("links every crumb but the current page, which it marks", () => {
    render(<Breadcrumb items={MENU_TRAIL} />);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Menu" })).toHaveAttribute("href", "/menu");
    expect(screen.queryByRole("link", { name: "Small Plates" })).not.toBeInTheDocument();
    expect(screen.getByText("Small Plates")).toHaveAttribute("aria-current", "page");
  });

  it("marks the last crumb current even when it has an href", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Outlets", href: "/outlets" },
        ]}
      />
    );
    expect(screen.queryByRole("link", { name: "Outlets" })).not.toBeInTheDocument();
    expect(screen.getByText("Outlets")).toHaveAttribute("aria-current", "page");
  });

  it("writes a middle crumb without an href as plain text, never a dead link", () => {
    render(
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Company" }, { label: "Franchise" }]}
      />
    );
    expect(screen.queryByRole("link", { name: "Company" })).not.toBeInTheDocument();
    expect(screen.getByText("Company")).not.toHaveAttribute("aria-current");
  });

  it("separates crumbs with chevrons hidden from assistive tech", () => {
    const { container } = render(<Breadcrumb items={MENU_TRAIL} />);
    const chevrons = container.querySelectorAll("svg.lucide-chevron-right");
    expect(chevrons).toHaveLength(2);
    for (const chevron of chevrons) expect(chevron.closest("[aria-hidden='true']")).not.toBeNull();
  });

  it("renders links through linkAs, so an app can pass its router link", () => {
    const { container } = render(<Breadcrumb items={MENU_TRAIL} linkAs={RouterLink} />);
    expect(container.querySelectorAll("a[data-router]")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Menu" })).toHaveClass("text-text-muted");
  });

  it("takes another name for its landmark", () => {
    render(<Breadcrumb items={MENU_TRAIL} aria-label="You are here" />);
    expect(screen.getByRole("navigation", { name: "You are here" })).toBeInTheDocument();
  });

  it("merges a caller className and keeps its own", () => {
    render(<Breadcrumb items={MENU_TRAIL} className="max-w-96" />);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toHaveClass("max-w-96", "min-w-0");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Breadcrumb items={MENU_TRAIL} />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/breadcrumb 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./breadcrumb`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/breadcrumb/breadcrumb.tsx`:

```tsx
import type { ComponentProps } from "react";

import { ChevronRight } from "lucide-react";

import type { LinkAs } from "../../lib/link-as";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";

const breadcrumb = componentVariants({
  slots: {
    root: "min-w-0",
    list: "m-0 flex list-none flex-wrap items-center gap-2 p-0",
    item: "flex min-w-0 items-center gap-2",
    link: "text-breadcrumb text-text-muted no-underline transition-colors duration-fast ease-out hover:text-text-heading hover:underline",
    text: "text-breadcrumb text-text-muted",
    current: "text-breadcrumb font-medium text-text-heading",
    chevron: "text-breadcrumb-chevron",
  },
});

export interface BreadcrumbItem {
  label: string;
  /** Omit for plain text; the last item is always the current page. */
  href?: string | undefined;
}

export interface BreadcrumbProps extends ComponentProps<"nav"> {
  items: BreadcrumbItem[];
  /** The link component for each crumb (default `"a"`; pass `next/link` in an app). */
  linkAs?: LinkAs | undefined;
}

/**
 * Path trail for website sub-pages (menu category, outlet, careers) — not used in the app.
 * Chevron separators, muted links, the current page in heading ink at 500 weight. Follows the
 * surface: on pink or ink fields every colour turns light.
 */
export function Breadcrumb({
  items,
  linkAs: LinkComponent = "a",
  "aria-label": ariaLabel = "Breadcrumb",
  className,
  ...props
}: BreadcrumbProps) {
  const styles = breadcrumb();
  const lastIndex = items.length - 1;

  return (
    <nav aria-label={ariaLabel} className={styles.root({ className })} {...props}>
      <ol className={styles.list()}>
        {items.map((item, index) => {
          const isCurrent = index === lastIndex;
          let crumb;
          if (isCurrent) {
            crumb = (
              <span aria-current="page" className={styles.current()}>
                {item.label}
              </span>
            );
          } else if (item.href === undefined) {
            crumb = <span className={styles.text()}>{item.label}</span>;
          } else {
            crumb = (
              <LinkComponent href={item.href} className={styles.link()}>
                {item.label}
              </LinkComponent>
            );
          }
          return (
            <li key={`${String(index)}-${item.label}`} className={styles.item()}>
              {crumb}
              {isCurrent ? null : (
                <Icon icon={ChevronRight} size="xs" className={styles.chevron()} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/breadcrumb 2>&1 | tail -8`
Expected: PASS (9 tests).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/breadcrumb/breadcrumb.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Breadcrumb } from "./breadcrumb";

const meta = {
  title: "Molecules/Breadcrumb",
  component: Breadcrumb,
  args: {
    items: [{ label: "Home", href: "#" }, { label: "Menu", href: "#" }, { label: "Small Plates" }],
  },
  parameters: {
    docs: {
      description: {
        component:
          'Path trail for website sub-pages (menu category, outlet, careers). Not used in the app. Chevron separators, muted links, current page in heading ink at 500 weight (`aria-current="page"`, never a link). Wraps, never clips. `linkAs` renders each crumb with the app\'s router link. On a pink or ink field it follows the surface — no `tone` prop.',
      },
    },
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "3 levels". */
export const Playground: Story = {};

/** Card row "2 levels". */
export const TwoLevels: Story = {
  args: { items: [{ label: "Home", href: "#" }, { label: "Outlets" }] },
};

/** Card row "long" — wraps, never clips. */
export const Long: Story = {
  args: {
    items: [
      { label: "Home", href: "#" },
      { label: "Company", href: "#" },
      { label: "Franchise", href: "#" },
      { label: "Apply for a 2027 city" },
    ],
  },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

/** Dev parity: a grouping level with no page of its own stays plain text. */
export const UnlinkedLevel: Story = {
  args: { items: [{ label: "Home", href: "#" }, { label: "Company" }, { label: "Press" }] },
};

export const OnSurfaces: Story = {
  render: (args) => (
    <OnSurfaces>
      <Breadcrumb {...args} />
    </OnSurfaces>
  ),
};
```

(If Task 0 found Plan 1's viewport ids differ from `mobile1`, use the 360px id from `apps/storybook/.storybook/preview.tsx`.)

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export {
  Breadcrumb,
  type BreadcrumbItem,
  type BreadcrumbProps,
} from "./molecules/breadcrumb/breadcrumb";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/breadcrumb packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/breadcrumb packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/breadcrumb.json packages/design-tokens/tokens/surface
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): Breadcrumb molecule

Ordered trail in a named nav; the last crumb is the current page, a crumb
without href is text, never a dead link. Router links via linkAs. The
chevron is a surface-aware component token, so there is no tone prop.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 13: Pagination

Design-system sources: `components/molecules/Pagination.*`. Card rows: many pages (4 of 12) · first page (1 of 5) · 3 pages (2 of 3).

**Files:**

- Create: `packages/ui/src/molecules/pagination/pagination.tsx`, `pagination.test.tsx`, `pagination.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/pagination/pagination.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                               | Ruling  | Where / why                                                                                                   |
| ---------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| the pages are an ordered list (`<ol>`)                                 | ADD     | `<ol>` (was `<ul>`) + landmark test                                                                           |
| caller `className` merges with its own                                 | ADD     | test "merges a caller className…"                                                                             |
| `ManyPages` (6 of 24) and `Narrow` stories                             | ADD     | `ManyPages`, `Narrow` stories                                                                                 |
| `onPageChange(page, event)` for a client router                        | DROP    | contracts §5 "links, not callbacks", spec §8.2 (`onClick` for navigation → `href`); `linkAs` takes the router |
| a single page still renders (layout does not jump); `SinglePage` story | DROP    | deviation 13: `pages < 2` renders nothing — a plan ruling, not a spec clause (see audit concern)              |
| 44px pills (`h-11 min-w-11`)                                           | DROP    | spec D2: the design system's `Pagination.jsx` pills are 40px; §5.5 floor ≥24px holds                          |
| optional `page` / `pages` (default 1)                                  | ALREADY | required by contracts §5                                                                                      |
| real links; current flooded + `aria-current`; ±1 collapse; clamp       | ALREADY | tests "links each page…", "shows the first, the last…", "keeps an out-of-range page…"                         |
| no previous on page 1, no next on the last (inert spans)               | ALREADY | test "has no previous link…"                                                                                  |
| Enter on Next follows it                                               | ALREADY | native `<a href>` (no callback to observe)                                                                    |
| `Default`, `FirstPage`, `LastPage`, `ThreePages` stories               | ALREADY | `Playground`, `FirstPage`, `LastPage`, `ThreePages`                                                           |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Icon`; `LinkAs`, `LinkAsProps` (Plan 2a).
- Produces: `Pagination`, `PaginationProps` — contract §5 (deviation 13). Links, not callbacks: `getPageHref(page)` builds each href. Pages shown: the first, the last and one either side of the current page; each hidden run collapses to one `…`.

- [ ] **Step 1: No new tokens**

Pills are `h-10 min-w-10` (40px, a spacing step), labels `text-body-sm` Poppins 700. The idle label `ink-700` on white is added to the contrast policy by Task 6; the current pill is Plan 1's `on-brand-fill` pair. The list is a light island so the pills stay white on any field.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/pagination/pagination.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";

import type { LinkAsProps } from "../../lib/link-as";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Pagination } from "./pagination";

const hrefFor = (page: number) => `/press?page=${String(page)}`;

function pageNames(): string[] {
  return within(screen.getByRole("navigation"))
    .getAllByRole("link")
    .map((link) => link.textContent ?? "");
}

function RouterLink({ href, className, children, "aria-current": ariaCurrent }: LinkAsProps) {
  return (
    <a href={href} className={className} aria-current={ariaCurrent} data-router="">
      {children}
    </a>
  );
}

describe("Pagination", () => {
  it("is a navigation landmark named Pagination, holding an ordered list", () => {
    const { container } = render(<Pagination page={4} pages={12} getPageHref={hrefFor} />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(container.querySelector("nav > ol")).toBeInTheDocument();
  });

  it("merges a caller className and keeps its own", () => {
    render(<Pagination page={1} pages={3} getPageHref={hrefFor} className="max-w-96" />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toHaveClass(
      "max-w-96",
      "min-w-0"
    );
  });

  it("shows the first, the last and one either side of the current page, with gaps between", () => {
    const { container } = render(<Pagination page={4} pages={12} getPageHref={hrefFor} />);
    expect(pageNames()).toEqual([
      "Previous page",
      "Page 1",
      "Page 3",
      "Page 4",
      "Page 5",
      "Page 12",
      "Next page",
    ]);
    expect(container.querySelectorAll("li[aria-hidden='true']")).toHaveLength(2);
  });

  it("links each page by the href it is given and marks the current one", () => {
    render(<Pagination page={4} pages={12} getPageHref={hrefFor} />);
    expect(screen.getByRole("link", { name: "Page 5" })).toHaveAttribute("href", "/press?page=5");
    const current = screen.getByRole("link", { name: "Page 4" });
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current).toHaveClass("bg-surface-brand");
    expect(screen.getByRole("link", { name: "Previous page" })).toHaveAttribute(
      "href",
      "/press?page=3"
    );
    expect(screen.getByRole("link", { name: "Next page" })).toHaveAttribute(
      "href",
      "/press?page=5"
    );
  });

  it("has no previous link on the first page and no next link on the last", () => {
    const { rerender } = render(<Pagination page={1} pages={5} getPageHref={hrefFor} />);
    expect(screen.queryByRole("link", { name: "Previous page" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Next page" })).toBeInTheDocument();
    rerender(<Pagination page={5} pages={5} getPageHref={hrefFor} />);
    expect(screen.queryByRole("link", { name: "Next page" })).not.toBeInTheDocument();
  });

  it("shows every page when there are three", () => {
    render(<Pagination page={2} pages={3} getPageHref={hrefFor} />);
    expect(pageNames()).toEqual(["Previous page", "Page 1", "Page 2", "Page 3", "Next page"]);
  });

  it("keeps an out-of-range page inside the list", () => {
    render(<Pagination page={40} pages={12} getPageHref={hrefFor} />);
    expect(screen.getByRole("link", { name: "Page 12" })).toHaveAttribute("aria-current", "page");
  });

  it("renders nothing for a single page", () => {
    const { container } = render(<Pagination page={1} pages={1} getPageHref={hrefFor} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders page links through linkAs", () => {
    const { container } = render(
      <Pagination page={2} pages={3} getPageHref={hrefFor} linkAs={RouterLink} />
    );
    expect(container.querySelectorAll("a[data-router]")).toHaveLength(5);
    expect(screen.getByRole("link", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Pagination page={4} pages={12} getPageHref={hrefFor} />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/pagination 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./pagination`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/pagination/pagination.tsx`:

```tsx
import type { ComponentProps } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import type { LinkAs } from "../../lib/link-as";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";

const pagination = componentVariants({
  slots: {
    root: "min-w-0",
    list: "m-0 flex list-none flex-wrap items-center gap-2 p-0",
    item: "grid h-10 min-w-10 place-items-center rounded-pill px-2.5 font-display text-body-sm font-bold no-underline",
  },
  variants: {
    state: {
      idle: {
        item: "border border-border-default bg-surface-card text-ink-700 transition-colors duration-fast ease-out hover:bg-surface-page-alt",
      },
      current: { item: "bg-surface-brand text-text-on-brand" },
      gap: { item: "text-ink-400" },
      inert: { item: "border border-border-subtle bg-surface-card text-ink-400" },
    },
  },
  defaultVariants: { state: "idle" },
});

type PageSlot = number | "gap";

/** The first, the last and one either side of `page`; each hidden run becomes one gap. */
function pageSlots(page: number, pages: number): PageSlot[] {
  const slots: PageSlot[] = [];
  for (let candidate = 1; candidate <= pages; candidate += 1) {
    if (candidate === 1 || candidate === pages || Math.abs(candidate - page) <= 1) {
      slots.push(candidate);
    } else if (slots.at(-1) !== "gap") {
      slots.push("gap");
    }
  }
  return slots;
}

export interface PaginationProps extends ComponentProps<"nav"> {
  page: number;
  pages: number;
  /** The href of a page — paging is navigation, not a callback. */
  getPageHref: (page: number) => string;
  /** The link component (default `"a"`; pass `next/link` in an app). */
  linkAs?: LinkAs | undefined;
  /** The landmark's name. */
  label?: string | undefined;
}

/** Paging for press, blog and careers listings. Wraps rather than overflowing on mobile. */
export function Pagination({
  page,
  pages,
  getPageHref,
  linkAs: LinkComponent = "a",
  label = "Pagination",
  className,
  ...props
}: PaginationProps) {
  if (pages < 2) return null;

  const current = Math.min(Math.max(1, Math.round(page)), pages);
  const styles = pagination();

  return (
    <nav aria-label={label} className={styles.root({ className })} {...props}>
      {/* An ordered list: the pages are a sequence (dev parity). */}
      <ol data-surface="light" className={styles.list()}>
        {current > 1 ? (
          <li>
            <LinkComponent href={getPageHref(current - 1)} className={styles.item()}>
              <Icon icon={ChevronLeft} size="sm" label="Previous page" />
            </LinkComponent>
          </li>
        ) : (
          <li aria-hidden="true">
            <span className={styles.item({ state: "inert" })}>
              <Icon icon={ChevronLeft} size="sm" />
            </span>
          </li>
        )}
        {pageSlots(current, pages).map((slot, index) =>
          slot === "gap" ? (
            <li key={`gap-${String(index)}`} aria-hidden="true">
              <span className={styles.item({ state: "gap" })}>…</span>
            </li>
          ) : (
            <li key={slot}>
              <LinkComponent
                href={getPageHref(slot)}
                className={styles.item({ state: slot === current ? "current" : "idle" })}
                aria-current={slot === current ? "page" : undefined}
              >
                <span className="sr-only">Page </span>
                {slot}
              </LinkComponent>
            </li>
          )
        )}
        {current < pages ? (
          <li>
            <LinkComponent href={getPageHref(current + 1)} className={styles.item()}>
              <Icon icon={ChevronRight} size="sm" label="Next page" />
            </LinkComponent>
          </li>
        ) : (
          <li aria-hidden="true">
            <span className={styles.item({ state: "inert" })}>
              <Icon icon={ChevronRight} size="sm" />
            </span>
          </li>
        )}
      </ol>
    </nav>
  );
}
```

(`LinkAsProps["aria-current"]` accepts `undefined` — ruling R13. If Task 0 found it does not, spread it conditionally instead: `{...(slot === current ? { "aria-current": "page" as const } : {})}`.)

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/pagination 2>&1 | tail -8`
Expected: PASS (10 tests).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/pagination/pagination.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Pagination } from "./pagination";

const meta = {
  title: "Molecules/Pagination",
  component: Pagination,
  args: { page: 4, pages: 12, getPageHref: (page) => `#page-${String(page)}` },
  parameters: {
    docs: {
      description: {
        component:
          "Paging for press, blog and careers listings — real links (`getPageHref`), so every page is crawlable and back-button friendly. The current page is a flooded pink pill; the rest are white with a 1px border. Gaps appear past ±1 of the current page. Previous/Next disappear into inert placeholders at the ends; a single page renders nothing. Wraps rather than overflowing on mobile. `linkAs` renders the app's router link.",
      },
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "many pages". */
export const Playground: Story = {};

/** Card row "first page". */
export const FirstPage: Story = { args: { page: 1, pages: 5 } };

/** Card row "3 pages". */
export const ThreePages: Story = { args: { page: 2, pages: 3 } };

/** The last page — Next is inert. */
export const LastPage: Story = { args: { page: 12, pages: 12 } };

/** Dev parity: deep in a long listing — both runs collapse to a gap. */
export const ManyPages: Story = { args: { page: 6, pages: 24 } };

/** Dev parity: the smallest supported width — the row wraps onto two lines. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-full max-w-80">
        <Story />
      </div>
    ),
  ],
};
```

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export { Pagination, type PaginationProps } from "./molecules/pagination/pagination";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/pagination packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/pagination packages/ui/src/index.ts
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui
git commit -m "feat(ui): Pagination molecule with real links

First, last and one either side of the current page, gaps between; every
page is a link from getPageHref, the current one marked aria-current.
Nothing renders for a single page.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 14: SectionHeader

Design-system sources: `components/molecules/SectionHeader.*`; handoff (every page section; `on="brand"` on pink and ink sections becomes a surface). Card rows: with action · lede · centred · `on="brand"`.

**Files:**

- Create: `packages/design-tokens/tokens/component/section-header.json`
- Create: `packages/ui/src/molecules/section-header/section-header.tsx`, `section-header.test.tsx`, `section-header.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/section-header/section-header.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                          | Ruling  | Where / why                                                                               |
| ----------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------- |
| every heading level 1, 3–6 renders, keeping the h2 look           | ADD     | `it.each` level test                                                                      |
| overline and lede omitted when not given (no stray top margin)    | ADD     | test "omits the overline and the lede…"                                                   |
| caller `className` merges                                         | ADD     | test "merges a caller className…"                                                         |
| `HeadingLevels` and `Narrow` (360px, action wraps) stories        | ADD     | `HeadingLevels`, `Narrow` stories                                                         |
| `on="brand"` (eyebrow, heading, lede to white)                    | DROP    | spec D5 — semantic text tokens follow the surface; `OnBrand` / `Surfaces` stories show it |
| lede at a fluid body step (`text-body1-fluid`)                    | DROP    | spec D4 / D2: the design system's lede is `--fs-body-lg` (`text-body-lg`)                 |
| default level 2 at the fluid h2 step; overline + lede; action     | ALREADY | tests "titles a section…", "sets the overline…", "renders its action…"                    |
| action dropped and prose centred when `align="center"`            | ALREADY | test "drops the action when centred"                                                      |
| `Default`, `WithAction`, `WithLede`, `Centred`, `OnBrand` stories | ALREADY | `Playground`, `WithLede`, `Centred`, `OnBrand`, `Surfaces`                                |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `headingTag` / `HeadingLevel`; `Button` (stories); `OnSurfaces` (Plan 2a, stories).
- Produces: `SectionHeader`, `SectionHeaderProps` — contract §5. No `on` prop (spec D5): the overline, heading and lede are semantic text tokens and turn light on a pink or ink field. The action is dropped when centred (design system: "Ignored when centred").

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/section-header.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "section-header-measure": {
      "$value": "48ch",
      "$description": "Width of the overline, title and lede when the header is start-aligned."
    },
    "section-header-measure-centered": {
      "$value": "56ch",
      "$description": "Width of the overline, title and lede when the header is centred."
    }
  }
}
```

Append `"section-header-measure"`, `"section-header-measure-centered"` to `SPACING`. Rebuild tokens and run the variant spec.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/section-header/section-header.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { SectionHeader } from "./section-header";

describe("SectionHeader", () => {
  it("titles a section with a fluid level-2 heading by default", () => {
    render(<SectionHeader title="Most ordered this week" />);
    expect(screen.getByRole("heading", { level: 2, name: "Most ordered this week" })).toHaveClass(
      "text-h2-fluid"
    );
  });

  it.each([1, 3, 4, 5, 6] as const)(
    "takes heading level %i when its page needs it, keeping the look",
    (level) => {
      render(<SectionHeader title="Starters, platters and snacks." headingLevel={level} />);
      expect(screen.getByRole("heading", { level })).toHaveClass("text-h2-fluid");
    }
  );

  it("omits the overline and the lede when they are not given", () => {
    const { container } = render(<SectionHeader title="Most ordered this week" />);
    expect(container.querySelectorAll("p")).toHaveLength(0);
    expect(screen.getByRole("heading")).not.toHaveClass("mt-2.5");
  });

  it("merges a caller className over its own gap", () => {
    const { container } = render(
      <SectionHeader title="Most ordered this week" className="gap-2" />
    );
    expect(container.firstElementChild).toHaveClass("gap-2");
    expect(container.firstElementChild).not.toHaveClass("gap-6");
  });

  it("sets the overline right above the title and the lede below it", () => {
    render(
      <SectionHeader
        overline="Our Story"
        title="A cafe that tastes like where it's from"
        lede="We started in one Gurgaon market with a chai counter and a grinder."
      />
    );
    const heading = screen.getByRole("heading");
    expect(screen.getByText("Our Story").nextElementSibling).toBe(heading);
    expect(heading.nextElementSibling).toHaveTextContent(/chai counter/);
    expect(screen.getByText("Our Story")).toHaveClass("uppercase", "text-text-brand");
  });

  it("renders its action beside the title when start-aligned", () => {
    render(<SectionHeader title="Most ordered this week" action={<a href="/menu">See All</a>} />);
    expect(screen.getByRole("link", { name: "See All" })).toBeInTheDocument();
  });

  it("drops the action when centred", () => {
    const { container } = render(
      <SectionHeader
        align="center"
        title="Find a Paprikaa"
        action={<a href="/outlets">See All</a>}
      />
    );
    expect(screen.queryByRole("link", { name: "See All" })).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass("text-center");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <SectionHeader
        overline="The Menu"
        title="Most ordered this week"
        lede="What Sector 57 ordered most."
        action={<a href="/menu">See All</a>}
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/section-header 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./section-header`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/section-header/section-header.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";

const sectionHeader = componentVariants({
  slots: {
    root: "flex flex-wrap items-end gap-6",
    copy: "min-w-0",
    overline: "m-0 font-display text-overline text-text-brand uppercase",
    title: "m-0 font-display text-h2-fluid text-pretty text-text-heading",
    lede: "m-0 mt-3 text-body-lg text-text-muted",
    action: "shrink-0",
  },
  variants: {
    align: {
      start: { root: "justify-between text-start", copy: "max-w-section-header-measure" },
      center: {
        root: "justify-center text-center",
        copy: "max-w-section-header-measure-centered mx-auto",
      },
    },
    hasOverline: { true: { title: "mt-2.5" } },
  },
  defaultVariants: { align: "start", hasOverline: false },
});

function isShown(node: ReactNode): boolean {
  return node !== undefined && node !== null && node !== false;
}

export interface SectionHeaderProps extends Omit<ComponentProps<"div">, "title"> {
  /** Uppercase eyebrow. */
  overline?: ReactNode;
  title: ReactNode;
  headingLevel?: HeadingLevel | undefined;
  /** One sentence, at most about 20 words. */
  lede?: ReactNode;
  /** Trailing element, usually a ghost Button. Not rendered when centred. */
  action?: ReactNode;
  align?: "start" | "center" | undefined;
}

/** The standard section opener — every page section starts with one. */
export function SectionHeader({
  overline,
  title,
  headingLevel = 2,
  lede,
  action,
  align = "start",
  className,
  ...props
}: SectionHeaderProps) {
  const Heading = headingTag(headingLevel);
  const hasOverline = isShown(overline);
  const styles = sectionHeader({ align, hasOverline });

  return (
    <div className={styles.root({ className })} {...props}>
      <div className={styles.copy()}>
        {hasOverline ? <p className={styles.overline()}>{overline}</p> : null}
        <Heading className={styles.title()}>{title}</Heading>
        {isShown(lede) ? <p className={styles.lede()}>{lede}</p> : null}
      </div>
      {isShown(action) && align === "start" ? (
        <div className={styles.action()}>{action}</div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/section-header 2>&1 | tail -8`
Expected: PASS (12 tests, the heading-level table included).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/section-header/section-header.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowRight } from "lucide-react";

import { Button } from "../../atoms/button/button";
import { OnSurfaces } from "../../lib/story-surfaces";
import { SectionHeader } from "./section-header";

const meta = {
  title: "Molecules/SectionHeader",
  component: SectionHeader,
  args: {
    overline: "The Menu",
    title: "Most ordered this week",
    action: (
      <Button variant="ghost" size="sm" iconAfter={ArrowRight}>
        See All
      </Button>
    ),
  },
  parameters: {
    docs: {
      description: {
        component:
          "The standard section opener — every page section starts with one. Uppercase overline, a fluid `h2-fluid` heading (so it never overflows on mobile), an optional one-sentence lede and a trailing action (usually a ghost Button; not rendered when centred). `headingLevel` (default 2) sets the element, never the look. On a pink or ink section it follows the surface — there is no `on` prop.",
      },
    },
  },
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "with action". */
export const Playground: Story = {};

/** Card row "lede". */
export const WithLede: Story = {
  args: {
    overline: "Our Story",
    title: "A cafe that tastes like where it's from",
    lede: "We started in one Gurgaon market with a chai counter and a grinder.",
    action: undefined,
  },
};

/** Card row "centred". */
export const Centred: Story = {
  args: { align: "center", overline: "Outlets", title: "Find a Paprikaa", action: undefined },
};

/** Card row `on="brand"` — now a brand surface. */
export const OnBrand: Story = {
  args: { overline: "Franchise", title: "Bring us to your city", action: undefined },
  render: (args) => (
    <div data-surface="brand" className="rounded-lg bg-surface-brand p-6">
      <SectionHeader {...args} />
    </div>
  ),
};

export const Surfaces: Story = {
  args: { lede: "What Sector 57 ordered most." },
  render: (args) => (
    <OnSurfaces>
      <SectionHeader {...args} />
    </OnSurfaces>
  ),
};

/** Dev parity: the outline changes, the type step never does — no skipping from h1 to h3. */
export const HeadingLevels: Story = {
  render: (args) => (
    <div className="grid gap-10">
      <SectionHeader {...args} headingLevel={2} title="Rendered as an h2" />
      <SectionHeader {...args} headingLevel={3} title="Rendered as an h3" />
      <SectionHeader {...args} headingLevel={4} title="Rendered as an h4" />
    </div>
  ),
};

/** Dev parity: at 360px the action wraps under the heading rather than squeezing it. */
export const Narrow: Story = {
  args: { lede: "One kitchen, one grinder and a menu that changes with the season." },
  decorators: [
    (Story) => (
      <div className="w-full max-w-80">
        <Story />
      </div>
    ),
  ],
};
```

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export { SectionHeader, type SectionHeaderProps } from "./molecules/section-header/section-header";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/section-header packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/section-header packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/section-header.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): SectionHeader molecule

Overline, fluid heading at any level, lede and a trailing action that is
dropped when centred. Semantic text tokens follow the surface, so the
design system's on=\"brand\" prop is not needed.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 15: Stat

Design-system sources: `components/molecules/Stat.*`; organism `StatBand.jsx` (passes `tone="inverse"` on dark bands, `"brand"` on light). Card rows: default (two stats) · icon + brand · inverse + center.

**Files:**

- Create: `packages/design-tokens/tokens/component/stat.json`
- Create: `packages/ui/src/molecules/stat/stat.tsx`, `stat.test.tsx`, `stat.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`), `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/stat/stat.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                           | Ruling  | Where / why                                                                               |
| ------------------------------------------------------------------ | ------- | ----------------------------------------------------------------------------------------- |
| no sub line and no glyph unless given                              | ADD     | test "renders no sub line and no glyph…"                                                  |
| caller `className` merges                                          | ADD     | test "merges a caller className…"                                                         |
| `WithSub`, `Row` (three across) and `Narrow` stories               | ADD     | `WithSub`, `Row`, `Narrow` stories                                                        |
| inverse label / sub at 85% / 65% white (`text-text-on-inverse/85`) | DROP    | spec D5 / §3.2.2: label and sub are semantic text that the ink surface remaps (.92 / .85) |
| number fluid (`text-h1-fluid`, extrabold)                          | ALREADY | `text-stat-value` fluid clamp at font-weight black (design system `Stat.jsx`)             |
| label and value; three tones; centre; decorative glyph             | ALREADY | tests "reads number, label and sub…", tone `it.each`, "centres…", glyph `it.each`         |
| `Default`, `WithIcon`, `Tones`, `OnInk`, `Centred` stories         | ALREADY | `Playground`, `Default`, `IconBrand`, `InverseCentre`                                     |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Icon`.
- Produces: `Stat`, `StatProps` — contract §5. `tone` colours the number only (`ink` → heading, `brand` → brand text, `inverse` → white); the label and sub are semantic text and follow the surface.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/stat.json`:

```json
{
  "text": {
    "$type": "typography",
    "stat-value": {
      "$value": {
        "fontSize": "clamp(30px, 3.4vw, 42px)",
        "lineHeight": 1.02,
        "letterSpacing": "-0.025em",
        "fontWeight": "{font-weight.black}"
      },
      "$description": "The big number — fluid, so it never overflows a narrow column (Poppins 800)."
    },
    "stat-label": {
      "$value": { "fontSize": "15px", "lineHeight": 1.6 },
      "$description": "The one line under the number (DM Sans 500)."
    },
    "stat-sub": {
      "$value": { "fontSize": "13px", "lineHeight": 1.6 },
      "$description": "Optional fine print under the label."
    }
  }
}
```

Append `"stat-value"`, `"stat-label"`, `"stat-sub"` to `TEXT`. Rebuild tokens and run the variant spec. (No new pair: `text-heading`, `text-brand`, `text-body`, `text-subtle` and `text-on-inverse` are already measured on every surface by Plan 1.)

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/stat/stat.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { Heart } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Stat } from "./stat";

describe("Stat", () => {
  it("reads number, label and sub in that order", () => {
    const { container } = render(
      <Stat value="18" label="spices ground in-house, daily" sub="Every morning at Sector 57" />
    );
    expect(container.firstElementChild).toHaveTextContent(
      "18spices ground in-house, dailyEvery morning at Sector 57"
    );
    expect(screen.getByText("18")).toHaveClass("text-stat-value");
  });

  it.each([
    ["ink", "text-text-heading"],
    ["brand", "text-text-brand"],
    ["inverse", "text-text-on-inverse"],
  ] as const)("colours the number for tone %s", (tone, colour) => {
    render(<Stat value="4.6" label="average guest rating" tone={tone} />);
    expect(screen.getByText("4.6")).toHaveClass(colour);
  });

  it("keeps the label and sub on semantic text, so they follow the surface", () => {
    render(<Stat value="2025" label="the year we started" sub="Sector 57" tone="inverse" />);
    expect(screen.getByText("the year we started")).toHaveClass("text-text-body");
    expect(screen.getByText("Sector 57")).toHaveClass("text-text-subtle");
  });

  it.each([
    ["ink", "text-pink-500"],
    ["inverse", "text-white-alpha-70"],
  ] as const)("draws a decorative %s-tone glyph above the number", (tone, colour) => {
    const { container } = render(
      <Stat value="4.6" label="average guest rating" icon={Heart} tone={tone} />
    );
    const glyph = container.querySelector("svg.lucide-heart")?.parentElement;
    expect(glyph).toHaveAttribute("aria-hidden", "true");
    expect(glyph).toHaveClass(colour);
  });

  it("centres everything for align center", () => {
    const { container } = render(<Stat value="6" label="outlets" align="center" />);
    expect(container.firstElementChild).toHaveClass("justify-items-center", "text-center");
  });

  it("renders no sub line and no glyph unless given", () => {
    const { container } = render(<Stat value="6" label="outlets" />);
    expect(container.firstElementChild?.children).toHaveLength(2);
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("merges a caller className over its own gap", () => {
    const { container } = render(<Stat value="6" label="outlets" className="gap-4" />);
    expect(container.firstElementChild).toHaveClass("gap-4");
    expect(container.firstElementChild).not.toHaveClass("gap-1");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Stat value="4.6" label="average guest rating" icon={Heart} tone="brand" />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/stat 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./stat`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/stat/stat.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";

const stat = componentVariants({
  slots: {
    root: "grid gap-1",
    icon: "mb-1",
    value: "text-stat-value font-display",
    label: "text-stat-label font-body font-medium text-text-body",
    sub: "text-stat-sub text-text-subtle",
  },
  variants: {
    tone: {
      ink: { icon: "text-pink-500", value: "text-text-heading" },
      brand: { icon: "text-pink-500", value: "text-text-brand" },
      inverse: { icon: "text-white-alpha-70", value: "text-text-on-inverse" },
    },
    align: {
      start: { root: "justify-items-start text-start" },
      center: { root: "justify-items-center text-center" },
    },
  },
  defaultVariants: { tone: "ink", align: "start" },
});

export interface StatProps extends ComponentProps<"div"> {
  value: ReactNode;
  /** One short line, sentence case, no full stop. */
  label: ReactNode;
  sub?: ReactNode;
  icon?: IconComponent | undefined;
  /** Colours the number: heading ink, brand pink, or white on a dark band. */
  tone?: "ink" | "brand" | "inverse" | undefined;
  align?: "start" | "center" | undefined;
}

/** A single big fact — outlet counts, spices ground, years open. At most 3–4 in a row; never invent numbers. */
export function Stat({
  value,
  label,
  sub,
  icon,
  tone = "ink",
  align = "start",
  className,
  ...props
}: StatProps) {
  const styles = stat({ tone, align });

  return (
    <div className={styles.root({ className })} {...props}>
      {icon === undefined ? null : <Icon icon={icon} size="lg" className={styles.icon()} />}
      <span className={styles.value()}>{value}</span>
      <span className={styles.label()}>{label}</span>
      {sub === undefined || sub === null ? null : <span className={styles.sub()}>{sub}</span>}
    </div>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/stat 2>&1 | tail -8`
Expected: PASS (11 tests).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/stat/stat.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Heart } from "lucide-react";

import { Stat } from "./stat";

const meta = {
  title: "Molecules/Stat",
  component: Stat,
  args: { value: "18", label: "spices ground in-house, daily" },
  parameters: {
    docs: {
      description: {
        component:
          "A single big fact — outlet counts, spices ground, years open. The number is fluid-clamped Poppins 800, so it never overflows a narrow column; `tone` colours it (ink, brand, or white `inverse` on a dark band) while the label and sub follow the surface. Use at most 3–4 in a row and never invent numbers.",
      },
    },
  },
} satisfies Meta<typeof Stat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "default". */
export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-10">
      <Stat value="18" label="spices ground in-house, daily" />
      <Stat value="100%" label="vegetarian kitchen" />
    </div>
  ),
};

/** Card row "icon + brand". */
export const IconBrand: Story = {
  args: { value: "4.6", label: "average guest rating", icon: Heart, tone: "brand" },
};

/** Card row "inverse + center", on an ink field. */
export const InverseCentre: Story = {
  args: { value: "2025", label: "the year we started", tone: "inverse", align: "center" },
  render: (args) => (
    <div data-surface="ink" className="rounded-lg bg-surface-inverse p-6">
      <Stat {...args} />
    </div>
  ),
};

/** Dev parity: the sub line carries the detail behind the number. */
export const WithSub: Story = {
  args: { value: "100%", label: "vegetarian kitchen", sub: "No meat, no egg, ever." },
};

/** Dev parity: three across, the most a row should carry; one column each below 480px. */
export const Row: Story = {
  render: () => (
    <div className="grid gap-8 sm:grid-cols-3">
      <Stat value="100%" label="vegetarian kitchen" />
      <Stat value="18" label="spices ground in-house, daily" />
      <Stat value="2025" label="the year we started" />
    </div>
  ),
};

/** Dev parity: at 360px the fluid number steps down rather than pushing the column open. */
export const Narrow: Story = {
  args: { value: "4.6", label: "average guest rating", sub: "Across every ordering channel" },
  decorators: [
    (Story) => (
      <div className="w-full max-w-80">
        <Story />
      </div>
    ),
  ],
};
```

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export { Stat, type StatProps } from "./molecules/stat/stat";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/stat packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/stat packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/stat.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): Stat molecule

A fluid Poppins 800 number with one line under it; tone colours the number
only, so the label and sub follow whatever surface the band sets.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 16: Accordion (native `<details name>`, server-safe)

Design-system sources: `components/molecules/Accordion.*`; handoff `FaqBlock.dc.html` (single-open, first item open, chevron rotates, height animates). Card rows: single (first open) · multiple (two open).

The platform does everything: `<details>` in one `name` group is an exclusive accordion (Chromium 120, Safari 17.2, Firefox 130 — older browsers degrade to multi-open, spec §15.3), `<summary>` is the keyboard-operable disclosure, closed answers stay in the DOM (find-in-page opens them; search engines read them), and zero JavaScript ships. The height animates through `::details-content` + `interpolate-size` where supported (Chromium 131+) and opens instantly elsewhere.

**Files:**

- Create: `packages/design-tokens/tokens/component/accordion.json`
- Create: `packages/ui/src/molecules/accordion/accordion.tsx`, `accordion.test.tsx`, `accordion.stories.tsx`
- Modify: `packages/ui/src/styles.css` (`@utility details-content-motion`), `packages/ui/src/lib/component-variants.ts` (`SPACING`, `TEXT`), `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/accordion/accordion.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                   | Ruling  | Where / why                                                                                                                        |
| -------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| clicking a question reveals its answer; a second click hides it            | ADD     | test "reveals an answer when its question is clicked…" (jsdom toggles `<details>` on summary activation)                           |
| keyboard toggling                                                          | ADD     | `Playground` play presses Enter on the focused summary (real Chromium)                                                             |
| caller `className` merges                                                  | ADD     | test "merges a caller className…"                                                                                                  |
| `Narrow` story                                                             | ADD     | `Narrow` story                                                                                                                     |
| per-item `isDisabled` (inert row "not live yet") + `WithDisabledRow` story | DELTA   | contracts §5 `AccordionItem` is `{ value, question, answer }`; a native `<details>` cannot be disabled — proposed delta, see audit |
| questions rendered as h2–h4 headings (`headingLevel`) + story              | DROP    | spec D7 / §3.3: native `<summary>` — its children are presentational, so a heading inside loses its role; not in contracts §5      |
| Radix roving focus (ArrowDown between questions)                           | DROP    | spec §3.3 rejects Radix Accordion for `<details name>`; summaries are in the Tab order                                             |
| all collapsed by default; `value` defaults to the question                 | DROP    | contracts §5: `defaultOpen = [items[0].value]`, `value` required                                                                   |
| egg-containing bakes in the FAQ fixture                                    | DROP    | spec C10: pure veg, no egg                                                                                                         |
| one open at a time; `isMultiple`; `defaultOpen`                            | ALREADY | shared `name` tests + `Playground` play (real exclusivity), `isMultiple` and `defaultOpen` tests                                   |
| open question brand pink; chevron rotates                                  | ALREADY | `group-open:text-text-brand`, chevron test                                                                                         |
| `Default`, `FirstOpen`, `Multiple` stories                                 | ALREADY | `Playground` (first open), `Multiple`, `Surfaces`                                                                                  |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Icon`; `OnSurfaces` (Plan 2a, stories).
- Produces: `Accordion`, `AccordionProps`, `AccordionItem` — contract §5. Single-open by default (every `<details>` shares `name`, default a `useId()`), `isMultiple` omits `name`, `defaultOpen` defaults to the first item.

- [ ] **Step 1: Component tokens and the motion utility**

`packages/design-tokens/tokens/component/accordion.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "accordion-answer-measure": {
      "$value": "62ch",
      "$description": "Answer line length."
    }
  },
  "text": {
    "$type": "typography",
    "accordion-question": {
      "$value": {
        "fontSize": "16.5px",
        "lineHeight": 1.4,
        "letterSpacing": "-0.005em",
        "fontWeight": "{font-weight.bold}"
      },
      "$description": "Accordion question (Poppins 700)."
    },
    "accordion-answer": {
      "$value": { "fontSize": "15px", "lineHeight": 1.6 },
      "$description": "Accordion answer (DM Sans)."
    }
  }
}
```

Append `"accordion-answer-measure"` to `SPACING` and `"accordion-question"`, `"accordion-answer"` to `TEXT`. Append to `packages/ui/src/styles.css`, after the `search-reset` utility:

```css
/*
 * Accordion answers: the <details> content animates its height where the browser supports
 * ::details-content and interpolate-size (Chromium 131+) and opens instantly elsewhere. The answer
 * stays in the DOM either way, so find-in-page and search engines see every one.
 */
@utility details-content-motion {
  interpolate-size: allow-keywords;

  &::details-content {
    block-size: 0;
    overflow-y: clip;
    transition:
      block-size var(--duration-base) var(--ease-out),
      content-visibility var(--duration-base) var(--ease-out) allow-discrete;
  }

  &[open]::details-content {
    block-size: auto;
  }
}
```

Rebuild tokens and run the variant spec.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/accordion/accordion.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Accordion, type AccordionItem } from "./accordion";

const FAQ: AccordionItem[] = [
  {
    value: "veg",
    question: "Is everything vegetarian?",
    answer: "Yes. The whole kitchen is pure vegetarian — no meat, no egg.",
  },
  {
    value: "delivery",
    question: "Do you deliver?",
    answer: "Pickup only for now. Delivery starts in 2027.",
  },
  {
    value: "booking",
    question: "Can I book a table?",
    answer: "Yes, up to 6 guests online. Larger groups, give us a call.",
  },
];

function detailsOf(container: HTMLElement): HTMLDetailsElement[] {
  return [...container.querySelectorAll("details")];
}

describe("Accordion", () => {
  it("renders each item as a native disclosure with its question as the summary", () => {
    const { container } = render(<Accordion items={FAQ} />);
    const details = detailsOf(container);
    expect(details).toHaveLength(3);
    expect(details[0]?.querySelector("summary")).toHaveTextContent("Is everything vegetarian?");
  });

  it("keeps every answer in the page, open or closed — find-in-page and search engines see them all", () => {
    render(<Accordion items={FAQ} />);
    for (const item of FAQ) {
      const answer = screen.getByText(item.answer as string);
      expect(answer).toBeInTheDocument();
      expect(answer).not.toHaveAttribute("hidden");
      expect(answer.closest("[hidden]")).toBeNull();
    }
  });

  it("opens the first item by default and nothing else", () => {
    const { container } = render(<Accordion items={FAQ} />);
    expect(detailsOf(container).map((d) => d.open)).toEqual([true, false, false]);
  });

  it("reveals an answer when its question is clicked, and hides it on a second click", async () => {
    const user = userEvent.setup();
    const { container } = render(<Accordion items={FAQ} defaultOpen={[]} />);
    const delivery = detailsOf(container)[1];
    await user.click(screen.getByText("Do you deliver?"));
    expect(delivery?.open).toBe(true);
    await user.click(screen.getByText("Do you deliver?"));
    expect(delivery?.open).toBe(false);
  });

  it("merges a caller className over its own top rule", () => {
    const { container } = render(<Accordion items={FAQ} className="border-t-0" />);
    expect(container.firstElementChild).toHaveClass("border-t-0");
    expect(container.firstElementChild).not.toHaveClass("border-t");
  });

  it("opens the items it is told to, or none", () => {
    const { container, rerender } = render(<Accordion items={FAQ} defaultOpen={["booking"]} />);
    expect(detailsOf(container).map((d) => d.open)).toEqual([false, false, true]);
    rerender(<Accordion items={FAQ} defaultOpen={[]} />);
    expect(detailsOf(container).map((d) => d.open)).toEqual([false, false, false]);
  });

  it("groups single-open items under one shared name", () => {
    const { container } = render(<Accordion items={FAQ} />);
    const names = new Set(detailsOf(container).map((d) => d.getAttribute("name")));
    expect(names.size).toBe(1);
    expect([...names][0]).toBeTruthy();
  });

  it("uses the name it is given, so two accordions never share a group", () => {
    const { container } = render(<Accordion items={FAQ} name="faq-home" />);
    for (const details of detailsOf(container)) expect(details).toHaveAttribute("name", "faq-home");
  });

  it("leaves items independent when isMultiple", () => {
    const { container } = render(
      <Accordion items={FAQ} isMultiple defaultOpen={["veg", "delivery"]} />
    );
    for (const details of detailsOf(container)) expect(details).not.toHaveAttribute("name");
    expect(detailsOf(container).map((d) => d.open)).toEqual([true, true, false]);
  });

  it("draws a decorative chevron that turns when its item opens", () => {
    const { container } = render(<Accordion items={FAQ} />);
    const chevron = container.querySelector("summary svg.lucide-chevron-down")?.parentElement;
    expect(chevron).toHaveAttribute("aria-hidden", "true");
    expect(chevron).toHaveClass("group-open:rotate-180");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Accordion items={FAQ} />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/accordion 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./accordion`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/accordion/accordion.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { ChevronDown } from "lucide-react";
import { useId } from "react";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";

const accordion = componentVariants({
  slots: {
    root: "border-t border-border-subtle",
    item: "group details-content-motion border-b border-border-subtle",
    summary:
      "text-accordion-question flex cursor-pointer list-none items-center justify-between gap-4 py-4.5 font-display text-text-heading transition-colors duration-fast ease-out group-open:text-text-brand marker:hidden hover:text-text-brand",
    question: "min-w-0",
    chevron: "transition-transform duration-base ease-out group-open:rotate-180",
    answer:
      "max-w-accordion-answer-measure text-accordion-answer pb-4.5 text-pretty text-text-muted",
  },
});

export interface AccordionItem {
  /** Stable key, and what `defaultOpen` names. */
  value: string;
  question: ReactNode;
  answer: ReactNode;
}

export interface AccordionProps extends ComponentProps<"div"> {
  items: AccordionItem[];
  /** Let several answers stay open at once. */
  isMultiple?: boolean | undefined;
  /** Items open on load (default: the first). */
  defaultOpen?: string[] | undefined;
  /** The single-open group's name (default: generated). Two accordions never share one. */
  name?: string | undefined;
}

/**
 * FAQ, allergen and franchise-detail disclosure. Hairline-separated rows, no card; the chevron turns
 * 180° and the active question turns brand. One answer open at a time unless `isMultiple`.
 */
export function Accordion({
  items,
  isMultiple = false,
  defaultOpen,
  name,
  className,
  ...props
}: AccordionProps) {
  const generatedName = useId();
  const groupName = isMultiple ? undefined : (name ?? generatedName);
  const openValues = new Set(defaultOpen ?? items.slice(0, 1).map((item) => item.value));
  const styles = accordion();

  return (
    <div className={styles.root({ className })} {...props}>
      {items.map((item) => (
        <details
          key={item.value}
          name={groupName}
          open={openValues.has(item.value)}
          className={styles.item()}
        >
          <summary className={styles.summary()}>
            <span className={styles.question()}>{item.question}</span>
            <Icon icon={ChevronDown} size="md" className={styles.chevron()} />
          </summary>
          <div className={styles.answer()}>{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/accordion 2>&1 | tail -8`
Expected: PASS (11 tests).

- [ ] **Step 6: Stories — the `play` proves real exclusivity in Chromium, which jsdom cannot**

`packages/ui/src/molecules/accordion/accordion.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Accordion, type AccordionItem } from "./accordion";

const FAQ: AccordionItem[] = [
  {
    value: "veg",
    question: "Is everything vegetarian?",
    answer: "Yes. The whole kitchen is pure vegetarian — no meat, no egg.",
  },
  {
    value: "delivery",
    question: "Do you deliver?",
    answer: "Pickup only for now. Delivery starts in 2027.",
  },
  {
    value: "booking",
    question: "Can I book a table?",
    answer: "Yes, up to 6 guests online. Larger groups, give us a call.",
  },
];

const meta = {
  title: "Molecules/Accordion",
  component: Accordion,
  args: { items: FAQ },
  parameters: {
    docs: {
      description: {
        component:
          "FAQ, allergen and franchise-detail disclosure, on native `<details name>`: one answer open at a time (`isMultiple` lifts that), the first open by default, zero JavaScript. Hairline-separated rows, no card; the chevron rotates 180° and the active question turns brand; the height animates where the browser supports `::details-content`. Every answer stays in the page, so find-in-page and search engines see them all.",
      },
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "single" — opening one closes the other (the `name` group, in a real browser). */
export const Playground: Story = {
  play: async ({ canvas, userEvent }) => {
    const first = canvas.getByText("Is everything vegetarian?").closest("details");
    const second = canvas.getByText("Do you deliver?").closest("details");
    await expect(first).toHaveAttribute("open");
    await userEvent.click(canvas.getByText("Do you deliver?"));
    await expect(second).toHaveAttribute("open");
    await expect(first).not.toHaveAttribute("open");
    // Keyboard (dev parity): the focused summary toggles on Enter, natively.
    await userEvent.keyboard("{Enter}");
    await expect(second).not.toHaveAttribute("open");
  },
};

/** Card row "multiple" — `isMultiple`, both open. */
export const Multiple: Story = {
  args: { items: FAQ.slice(0, 2), isMultiple: true, defaultOpen: ["veg", "delivery"] },
};

export const Surfaces: Story = {
  render: (args) => (
    <OnSurfaces>
      <Accordion {...args} className="w-full" />
    </OnSurfaces>
  ),
};

/** Dev parity: the smallest supported width — long questions wrap, the chevron never moves. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-full max-w-80">
        <Story />
      </div>
    ),
  ],
};
```

(The `Surfaces` story renders five accordions; each gets its own generated `name`, so opening one never closes another's item — worth a manual click in the parity review.)

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export {
  Accordion,
  type AccordionItem,
  type AccordionProps,
} from "./molecules/accordion/accordion";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/accordion packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/accordion packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/ui/src/styles.css packages/design-tokens/tokens/component/accordion.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green. If Tailwind rejects the nested `&::details-content` inside `@utility`, the build error names the line: keep the utility with only `interpolate-size`, and move the two pseudo-element rules into `@layer components { .details-content-motion::details-content { … } .details-content-motion[open]::details-content { … } }` directly below it (the utility keeps the class known to the linter).

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): Accordion molecule on native details

One name group per accordion gives single-open with zero JavaScript; every
answer stays in the DOM for find-in-page and search engines. The height
animates through ::details-content where supported and snaps elsewhere.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 17: ListRow (Slot)

Design-system sources: `components/molecules/ListRow.*`; UI kit `ui_kits/app/Screens.jsx` (account list). Card rows: value + chevron · trailing control · description · trailing badge · danger.

**Files:**

- Create: `packages/ui/src/molecules/list-row/list-row.tsx`, `list-row.test.tsx`, `list-row.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/list-row/list-row.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                                       | Ruling  | Where / why                                                                                   |
| ---------------------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------- |
| a static row carries no button semantics                                                       | ADD     | assertion in "shows its title…"                                                               |
| Space as well as Enter operates an action row                                                  | ADD     | asChild-button test                                                                           |
| chevron only when asked                                                                        | ADD     | chevron test                                                                                  |
| press feedback on an interactive row (`active:scale`)                                          | ADD     | `isInteractive` row `active:press-scale` + assertion                                          |
| caller `className` merges                                                                      | ADD     | test "merges a caller className…"                                                             |
| axe over a danger action row                                                                   | ADD     | axe test                                                                                      |
| `Narrow` story                                                                                 | ADD     | `Narrow` story                                                                                |
| `onClick` turns the row into a `<button>`                                                      | ALREADY | `asChild` + `<button>` / `<a>` / `next/link` (spec D8, contracts §5)                          |
| description clamps to 2; value; trailing; leading over icon; danger                            | ALREADY | tests "shows its title…", "puts a leading element…", "renders a trailing control…", "paints…" |
| hairline, none on the last row; 44px hit                                                       | ALREADY | divider test; `min-h-hit` in the asChild-link test                                            |
| `Default`, `WithValueAndChevron`, `WithDescription`, `WithTrailing`, `Danger`, `Group` stories | ALREADY | `Playground`, `WithDescription`, `TrailingBadge`, `TrailingControl`, `Danger`, `AccountList`  |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Icon`; `radix-ui` → `Slot` (`Slot.Root`, `Slot.Slottable` with the `child` render form — verified in `@radix-ui/react-slot` 1.3.3); `Switch`, `Badge` (stories).
- Produces: `ListRow`, `ListRowProps` — contract §5. A hairline-separated row; with `asChild` the row's content is rendered **into** the consumer's `<a>`, `next/link` or `<button>` (Plan 2a's Slottable pattern), which also gets the row's classes and hover tint. All inner wrappers are `<span>`, so the result is valid inside an anchor or a button. A row with a trailing control stays a `<div>` (a control inside a link is invalid).

- [ ] **Step 1: No new tokens**

`min-h-hit` (44px), `px-3 py-3.5`, `gap-3.5`, glyph sizes `lg`/`md` and `text-body-sm` / `text-caption` are all existing tokens; the colours are semantic (`text-heading`, `text-muted`, `text-subtle`, `text-danger`) plus the chevron's decorative `ink-400`.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/list-row/list-row.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Bell, LogOut, MapPin } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { ListRow } from "./list-row";

describe("ListRow", () => {
  it("shows its title, description and value", () => {
    render(
      <ListRow
        icon={MapPin}
        title="Default outlet"
        description="Where your pickups go."
        value="Sector 57"
      />
    );
    expect(screen.getByText("Default outlet")).toHaveClass("text-text-heading");
    expect(screen.getByText("Where your pickups go.")).toHaveClass("line-clamp-2");
    expect(screen.getByText("Sector 57")).toHaveClass("text-text-muted");
    // A static row is only text: no button or link semantics.
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("draws its glyph and chevron decoratively, and the chevron only when asked", () => {
    const { container, rerender } = render(<ListRow icon={MapPin} title="Default outlet" />);
    expect(container.querySelector("svg.lucide-chevron-right")).not.toBeInTheDocument();
    rerender(<ListRow icon={MapPin} title="Default outlet" hasChevron />);
    for (const glyph of container.querySelectorAll("svg")) {
      expect(glyph.closest("[aria-hidden='true']")).not.toBeNull();
    }
    expect(container.querySelector("svg.lucide-chevron-right")).toBeInTheDocument();
  });

  it("puts a leading element in place of the glyph", () => {
    const { container } = render(
      <ListRow icon={MapPin} leading={<span data-leading="">SP</span>} title="Sector 57" />
    );
    expect(container.querySelector("[data-leading]")).toBeInTheDocument();
    expect(container.querySelector("svg.lucide-map-pin")).not.toBeInTheDocument();
  });

  it("renders a trailing control, such as a switch", () => {
    render(
      <ListRow
        icon={Bell}
        title="Order updates"
        trailing={<input type="checkbox" role="switch" aria-label="Order updates" />}
      />
    );
    expect(screen.getByRole("switch", { name: "Order updates" })).toBeInTheDocument();
  });

  it("separates rows with a hairline unless hasDivider is false", () => {
    const { container, rerender } = render(<ListRow title="Loyalty" />);
    expect(container.firstElementChild).toHaveClass("border-b");
    rerender(<ListRow title="Loyalty" hasDivider={false} />);
    expect(container.firstElementChild).not.toHaveClass("border-b");
  });

  it("paints a destructive row in the danger colour", () => {
    render(<ListRow icon={LogOut} title="Delete my account" isDanger />);
    expect(screen.getByText("Delete my account")).toHaveClass("text-text-danger");
  });

  it("renders into a link with asChild, keeping its layout and hover", () => {
    render(
      <ListRow asChild icon={MapPin} title="Default outlet" value="Sector 57" hasChevron>
        <a href="/account/outlet" />
      </ListRow>
    );
    const link = screen.getByRole("link", { name: /Default outlet/ });
    expect(link).toHaveAttribute("href", "/account/outlet");
    expect(link).toHaveClass("min-h-hit", "hover:bg-surface-page-alt");
    expect(link).toHaveTextContent("Default outletSector 57");
  });

  it("renders into a button with asChild, so an action row is keyboard-operable", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <ListRow asChild icon={LogOut} title="Sign out" isDanger hasDivider={false}>
        <button type="button" onClick={onClick} />
      </ListRow>
    );
    await user.tab();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("button", { name: "Sign out" })).toHaveClass(
      "w-full",
      "text-start",
      "active:press-scale"
    );
  });

  it("merges a caller className over its own", () => {
    const { container } = render(<ListRow title="Loyalty" className="mx-0" />);
    expect(container.firstElementChild).toHaveClass("mx-0");
    expect(container.firstElementChild).not.toHaveClass("-mx-3");
  });

  it("has no accessibility violations as a static row and as a link", async () => {
    const { container } = render(
      <>
        <ListRow icon={Bell} title="Order updates" description="Texts when your food is ready." />
        <ListRow asChild icon={MapPin} title="Default outlet" value="Sector 57" hasChevron>
          <a href="/account/outlet" />
        </ListRow>
        <ListRow asChild icon={LogOut} title="Delete my account" isDanger hasDivider={false}>
          <button type="button" onClick={vi.fn()} />
        </ListRow>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/list-row 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./list-row`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/list-row/list-row.tsx`:

```tsx
import type { ComponentProps, ElementType, ReactNode } from "react";

import { ChevronRight } from "lucide-react";
import { Slot } from "radix-ui";

import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";

const listRow = componentVariants({
  slots: {
    root: "-mx-3",
    row: "flex min-h-hit w-full min-w-0 items-center gap-3.5 rounded-sm px-3 py-3.5 text-start",
    icon: "text-text-muted",
    body: "grid min-w-0 flex-1 gap-0.5",
    title: "text-body-sm font-medium text-text-heading",
    description: "line-clamp-2 text-caption text-text-subtle",
    value: "shrink-0 text-body-sm text-text-muted",
    chevron: "text-ink-400",
  },
  variants: {
    hasDivider: { true: { root: "border-b border-border-subtle" } },
    isDanger: { true: { icon: "text-text-danger", title: "text-text-danger" } },
    isInteractive: {
      true: {
        // Hover tint and press feedback (dev parity) on a row rendered into a link or button.
        row: "cursor-pointer no-underline transition-colors duration-fast ease-out hover:bg-surface-page-alt active:press-scale",
      },
    },
  },
  defaultVariants: { hasDivider: true, isDanger: false, isInteractive: false },
});

export interface ListRowProps extends Omit<ComponentProps<"div">, "title"> {
  title: ReactNode;
  description?: ReactNode;
  /** Replaces the glyph, e.g. an Avatar. */
  leading?: ReactNode;
  icon?: IconComponent | undefined;
  /** Right-aligned muted value, e.g. "Sector 57". */
  value?: ReactNode;
  /** Right-aligned control, e.g. a Switch. Never combine with `asChild`. */
  trailing?: ReactNode;
  hasChevron?: boolean | undefined;
  hasDivider?: boolean | undefined;
  /** A destructive row — "Delete my account". */
  isDanger?: boolean | undefined;
  /** Render the row into its single child — an `<a>`, `next/link` or `<button>`. */
  asChild?: boolean | undefined;
}

/**
 * Settings, account and detail rows. Hairline separated — never a stack of cards — and at least
 * 44px tall. With `asChild` the whole row is the link or button, hover-tinted.
 */
export function ListRow({
  title,
  description,
  leading,
  icon,
  value,
  trailing,
  hasChevron = false,
  hasDivider = true,
  isDanger = false,
  asChild = false,
  className,
  children,
  ...props
}: ListRowProps) {
  const Row: ElementType = asChild ? Slot.Root : "div";
  const styles = listRow({ hasDivider, isDanger, isInteractive: asChild });
  const glyph =
    icon === undefined ? null : <Icon icon={icon} size="lg" className={styles.icon()} />;

  return (
    <div className={styles.root({ className })} {...props}>
      <Row className={styles.row()}>
        <Slot.Slottable child={children}>
          {(content) => (
            <>
              {leading ?? glyph}
              <span className={styles.body()}>
                <span className={styles.title()}>{title}</span>
                {description === undefined || description === null ? null : (
                  <span className={styles.description()}>{description}</span>
                )}
              </span>
              {value === undefined || value === null ? null : (
                <span className={styles.value()}>{value}</span>
              )}
              {trailing}
              {hasChevron ? (
                <Icon icon={ChevronRight} size="md" className={styles.chevron()} />
              ) : null}
              {content}
            </>
          )}
        </Slot.Slottable>
      </Row>
    </div>
  );
}
```

(Without `asChild` the row is a `<div>` and `Slottable` simply calls the render function; with it, `Slot.Root` renders the child element with the row's classes and this content inside it. `leading ?? glyph` treats only `undefined`/`null` as "no leading".)

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/list-row 2>&1 | tail -8`
Expected: PASS (10 tests).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/list-row/list-row.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Bell, CreditCard, Gift, LogOut, MapPin, Receipt, Trash2 } from "lucide-react";
import { expect, fn } from "storybook/test";

import { Badge } from "../../atoms/badge/badge";
import { Switch } from "../../atoms/switch/switch";
import { ListRow } from "./list-row";

const meta = {
  title: "Molecules/ListRow",
  component: ListRow,
  args: { icon: MapPin, title: "Default outlet", value: "Sector 57", hasChevron: true },
  render: (args) => (
    <ListRow {...args} asChild>
      <a href="#outlet" />
    </ListRow>
  ),
  parameters: {
    docs: {
      description: {
        component:
          "Settings, account and detail rows in the app. Rows are hairline separated — never a stack of cards — and at least 44px tall. `asChild` renders the whole row into a link or button (it gets the classes and the pink-50 hover); a row with a `trailing` control (Switch) stays a plain row. `isDanger` for destructive rows. The glyph, value and chevron follow the surface.",
      },
    },
  },
} satisfies Meta<typeof ListRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "value + chevron" — a link row. */
export const Playground: Story = {};

/** Card row "trailing control". */
export const TrailingControl: Story = {
  args: { icon: Bell, title: "Order updates", value: undefined, hasChevron: false },
  render: (args) => (
    <ListRow {...args} trailing={<Switch label="Order updates" isLabelHidden defaultChecked />} />
  ),
};

/** Card row "description". */
export const WithDescription: Story = {
  args: {
    icon: CreditCard,
    title: "Payment methods",
    description: "UPI, cards and Paprikaa credit.",
    value: undefined,
  },
};

/** Card row "trailing badge". */
export const TrailingBadge: Story = {
  args: { icon: Gift, title: "Loyalty", value: undefined },
  render: (args) => (
    <ListRow {...args} trailing={<Badge tone="soft">4 of 6</Badge>} asChild>
      <a href="#loyalty" />
    </ListRow>
  ),
};

/** Card row "danger" — an action row rendered into a button. */
export const Danger: Story = {
  args: {
    icon: Trash2,
    title: "Delete my account",
    value: undefined,
    isDanger: true,
    hasDivider: false,
  },
  render: (args) => (
    <ListRow {...args} asChild>
      <button type="button" onClick={fn()} />
    </ListRow>
  ),
  play: async ({ canvas, userEvent }) => {
    const row = canvas.getByRole("button", { name: /Delete my account/ });
    await userEvent.tab();
    await expect(row).toHaveFocus();
  },
};

/** The app kit's account list. */
export const AccountList: Story = {
  render: () => (
    <div className="grid">
      <ListRow asChild icon={MapPin} title="Default outlet" value="Sector 57" hasChevron>
        <a href="#outlet" />
      </ListRow>
      <ListRow
        asChild
        icon={Receipt}
        title="Order history"
        description="Your past orders"
        hasChevron
      >
        <a href="#orders" />
      </ListRow>
      <ListRow asChild icon={CreditCard} title="Payment methods" value="UPI" hasChevron>
        <a href="#payments" />
      </ListRow>
      <ListRow
        icon={Bell}
        title="Order updates"
        trailing={<Switch label="Order updates" isLabelHidden defaultChecked />}
      />
      <ListRow asChild icon={LogOut} title="Sign out" isDanger hasDivider={false}>
        <button type="button" onClick={fn()} />
      </ListRow>
    </div>
  ),
};

/** Dev parity: at 360px the description clamps and the value keeps its place. */
export const Narrow: Story = {
  args: {
    title: "Default outlet for pickup orders",
    description: "MKM Market, Sector 57, Gurgaon.",
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-80">
        <Story />
      </div>
    ),
  ],
};
```

(`Switch` takes `isLabelHidden` — Plan 2b deviation 4 — so the row's title stays the only visible label while the switch keeps its name.)

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export { ListRow, type ListRowProps } from "./molecules/list-row/list-row";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/list-row packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/list-row packages/ui/src/index.ts
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui
git commit -m "feat(ui): ListRow molecule with asChild

Hairline-separated settings and detail rows. asChild renders the row's
glyph, text, value and chevron into the consumer's link or button, which
takes the row's classes and hover; inner wrappers are spans, so the markup
stays valid inside either.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 18: PriceSummary

Design-system sources: `components/molecules/PriceSummary.*`; organism `CartPanel.jsx`. Card rows: simple · discount · inverse (on ink).

**Files:**

- Create: `packages/design-tokens/tokens/component/price-summary.json`
- Create: `packages/ui/src/molecules/price-summary/price-summary.tsx`, `price-summary.test.tsx`, `price-summary.stories.tsx`
- Modify: `packages/design-tokens/tokens/surface/{brand,ink,light}.json`, `packages/design-tokens/contrast-pairs.json`, `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/price-summary/price-summary.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                   | Ruling  | Where / why                                                                                               |
| -------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| Indian digit grouping (`₹1,20,000`)                                        | ADD     | test "groups digits the Indian way"                                                                       |
| a total with no lines; note only when given                                | ADD     | test "renders a total with no lines…" (`lines={[]}`) + `TotalOnly` story                                  |
| caller `className` merges                                                  | ADD     | test "merges a caller className…"                                                                         |
| `WithStrongLine`, `Receipt` (renamed total + fine print), `Narrow` stories | ADD     | `WithStrongLine`, `Receipt`, `Narrow` stories                                                             |
| figures in Space Mono so digits line up                                    | ALREADY | `tabular-nums` + assertion; the design system's `PriceSummary.jsx` sets amounts in body-sm, not mono (D2) |
| `tone="inverse"` (75% / 90% white lines, soft-mint saving on ink)          | DROP    | spec D5, deviation 7 — lines follow the surface; the discount is a surface-overridden token               |
| `lines` optional (default `[]`)                                            | DROP    | contracts §5 `lines: PriceLine[]` is required; `[]` is covered                                            |
| rupee sign, no space, no decimals; discount minus in mint; strong line     | ALREADY | tests "lists each line…", "prints a discount…", "emphasises a strong line"                                |
| total label renamed; fine print                                            | ALREADY | test "takes another total label and a note"                                                               |
| `Default`, `WithDiscount`, `OnInk` stories                                 | ALREADY | `Playground`, `WithDiscount`, `OnInk`, `Surfaces`                                                         |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `formatRupees` (`@pink-paprikaa-web/utils`); `PriceTag` (Plan 2b — its default `ink` tone paints `text-text-heading`, so the total follows the surface); `OnSurfaces` (Plan 2a, stories).
- Produces: `PriceSummary`, `PriceSummaryProps`, `PriceLine` — contract §5 without `tone` (deviation 7). A `<dl>`: every line is a `<div>` of `<dt>` + `<dd>`, the total is the last group. Discounts print with a true minus (`−₹100`), never a hand-typed hyphen.

- [ ] **Step 1: Component token, surface skin and contrast pairs**

`packages/design-tokens/tokens/component/price-summary.json`:

```json
{
  "color": {
    "$type": "color",
    "price-summary-discount": {
      "$value": "{color.mint-strong}",
      "$description": "A discount line's amount. White on brand and ink fields, where the minus sign carries the meaning."
    }
  }
}
```

(It aliases the primitive, not `text-success`: Plan 2a's `surface-aliases.spec.ts` forbids aliasing a semantic token a surface may override.)

Inside `surface-brand` → `color` (`tokens/surface/brand.json`) and `surface-ink` → `color` (`tokens/surface/ink.json`) add:

```json
"price-summary-discount": { "$value": "{color.ink.000}" }
```

Inside `surface-light` → `color` (`tokens/surface/light.json`) add:

```json
"price-summary-discount": { "$value": "{color.mint-strong}" }
```

Append to `contrast-pairs.json` → `groups`:

```json
{
  "id": "price-summary",
  "surface": null,
  "foregrounds": ["color-price-summary-discount"],
  "backgrounds": [
    "color-surface-page",
    "color-surface-page-alt",
    "color-surface-card",
    "color-surface-brand-soft"
  ],
  "min": 4.5
},
{
  "id": "price-summary-ink",
  "surface": "ink",
  "pairs": [["color-price-summary-discount", "color-surface-inverse"]],
  "min": 4.5
},
{
  "id": "price-summary-brand",
  "surface": "brand",
  "pairs": [["color-price-summary-discount", "color-surface-brand"]],
  "min": 3,
  "exception": "brand-fill"
}
```

Rebuild and run the token tests (policy, light-restore and surface-alias suites). Expected: PASS (≈ 6.4 / 6.0 / 6.4 / 5.0 on light grounds; 18.4 on ink; 4.04 on the brand fill).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/price-summary/price-summary.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { type PriceLine, PriceSummary } from "./price-summary";

const LINES: PriceLine[] = [
  { label: "Subtotal", amount: 1180 },
  { label: "GST (5%)", amount: 59 },
  { label: "First order", amount: 100, isDiscount: true },
];

describe("PriceSummary", () => {
  it("lists each line as a term and its amount, formatted the brand way", () => {
    render(<PriceSummary lines={LINES} total={1139} />);
    const terms = screen.getAllByRole("term").map((term) => term.textContent);
    const amounts = screen.getAllByRole("definition").map((amount) => amount.textContent);
    expect(terms).toEqual(["Subtotal", "GST (5%)", "First order", "Total"]);
    expect(amounts.slice(0, 3)).toEqual(["₹1,180", "₹59", "−₹100"]);
    // Tabular figures, so the column's digits line up.
    expect(screen.getByText("₹1,180")).toHaveClass("tabular-nums");
  });

  it("groups digits the Indian way", () => {
    render(<PriceSummary lines={[{ label: "Subtotal", amount: 120000 }]} total={126000} />);
    expect(screen.getByText("₹1,20,000")).toBeInTheDocument();
  });

  it("renders a total with no lines, and a note only when given", () => {
    const { rerender } = render(<PriceSummary lines={[]} total={280} />);
    expect(screen.getAllByRole("term").map((term) => term.textContent)).toEqual(["Total"]);
    expect(screen.queryByText("Inclusive of all taxes.")).not.toBeInTheDocument();
    rerender(<PriceSummary lines={[]} total={280} note="Inclusive of all taxes." />);
    expect(screen.getByText("Inclusive of all taxes.")).toBeInTheDocument();
  });

  it("merges a caller className over its own gap", () => {
    const { container } = render(<PriceSummary lines={LINES} total={1139} className="gap-4" />);
    expect(container.firstElementChild).toHaveClass("gap-4");
    expect(container.firstElementChild).not.toHaveClass("gap-2");
  });

  it("prints a discount with a true minus in the discount colour, whatever sign it is given", () => {
    render(
      <PriceSummary lines={[{ label: "First order", amount: -100, isDiscount: true }]} total={0} />
    );
    const amount = screen.getByText("−₹100");
    expect(amount).toHaveClass("text-price-summary-discount");
  });

  it("emphasises a strong line", () => {
    render(<PriceSummary lines={[{ label: "Plates", amount: 960, isStrong: true }]} total={960} />);
    expect(screen.getByText("Plates")).toHaveClass("text-text-heading");
    expect(screen.getByText("₹960", { selector: "dd" })).toHaveClass("font-medium");
  });

  it("closes with the total, under a hairline, in a large price", () => {
    render(<PriceSummary lines={LINES} total={1139} />);
    const totalGroup = screen.getByText("Total").parentElement;
    expect(totalGroup).toHaveClass("border-t");
    expect(within(totalGroup as HTMLElement).getByText("₹1,139")).toBeInTheDocument();
  });

  it("takes another total label and a note", () => {
    render(
      <PriceSummary lines={LINES} total={1139} totalLabel="To pay" note="Inclusive of all taxes." />
    );
    expect(screen.getByText("To pay")).toBeInTheDocument();
    expect(screen.getByText("Inclusive of all taxes.")).toHaveClass("text-text-subtle");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <PriceSummary lines={LINES} total={1139} note="Inclusive of all taxes." />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/price-summary 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./price-summary`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/price-summary/price-summary.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { PriceTag } from "../../atoms/price-tag/price-tag";
import { componentVariants } from "../../lib/component-variants";

const priceSummary = componentVariants({
  slots: {
    root: "grid gap-2",
    list: "m-0 grid gap-2",
    line: "flex justify-between gap-4 text-body-sm",
    label: "text-text-muted",
    amount: "m-0 text-text-body tabular-nums",
    totalLine: "mt-1 flex items-center justify-between gap-4 border-t border-border-subtle pt-3",
    totalLabel: "font-display text-h4 text-text-heading",
    total: "m-0",
    note: "m-0 text-caption text-text-subtle",
  },
  variants: {
    isStrong: { true: { label: "text-text-heading", amount: "font-medium" } },
    isDiscount: { true: { amount: "text-price-summary-discount" } },
  },
  defaultVariants: { isStrong: false, isDiscount: false },
});

export interface PriceLine {
  label: ReactNode;
  /** Whole rupees. */
  amount: number;
  /** Prints with a leading minus in the discount colour (the sign given is ignored). */
  isDiscount?: boolean | undefined;
  isStrong?: boolean | undefined;
}

export interface PriceSummaryProps extends ComponentProps<"div"> {
  lines: PriceLine[];
  /** Whole rupees. */
  total: number;
  totalLabel?: string | undefined;
  /** Fine print under the total, e.g. "Inclusive of all taxes." */
  note?: ReactNode;
}

/**
 * Cart totals, checkout summary, order receipts — and, with PriceTag, the only correct source of a
 * rupee amount. Follows the surface: on an ink or pink field every line turns light.
 */
export function PriceSummary({
  lines,
  total,
  totalLabel = "Total",
  note,
  className,
  ...props
}: PriceSummaryProps) {
  const styles = priceSummary();

  return (
    <div className={styles.root({ className })} {...props}>
      <dl className={styles.list()}>
        {lines.map((line, index) => {
          const isDiscount = line.isDiscount === true;
          const isStrong = line.isStrong === true;
          return (
            <div key={index} className={styles.line()}>
              <dt className={styles.label({ isStrong })}>{line.label}</dt>
              <dd className={styles.amount({ isStrong, isDiscount })}>
                {formatRupees(isDiscount ? -Math.abs(line.amount) : line.amount)}
              </dd>
            </div>
          );
        })}
        <div className={styles.totalLine()}>
          <dt className={styles.totalLabel()}>{totalLabel}</dt>
          <dd className={styles.total()}>
            <PriceTag amount={total} size="lg" />
          </dd>
        </div>
      </dl>
      {note === undefined || note === null ? null : <p className={styles.note()}>{note}</p>}
    </div>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/price-summary 2>&1 | tail -8`
Expected: PASS (9 tests).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/price-summary/price-summary.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { PriceSummary } from "./price-summary";

const SUBTOTAL_AND_GST = [
  { label: "Subtotal", amount: 1180 },
  { label: "GST (5%)", amount: 59 },
];

const meta = {
  title: "Molecules/PriceSummary",
  component: PriceSummary,
  args: { lines: SUBTOTAL_AND_GST, total: 1239 },
  parameters: {
    docs: {
      description: {
        component:
          "Cart totals, checkout summary and order receipts, as a definition list. Never hand-format a rupee amount — this component and PriceTag are the only correct sources: `₹` with no space, Indian grouping, discounts with a true minus in mint. On an ink or pink field it follows the surface (no `tone` prop): every line turns light and the discount turns white, the minus carrying its meaning.",
      },
    },
  },
} satisfies Meta<typeof PriceSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "simple". */
export const Playground: Story = {};

/** Card row "discount". */
export const WithDiscount: Story = {
  args: {
    total: 1139,
    note: "Inclusive of all taxes.",
    lines: [...SUBTOTAL_AND_GST, { label: "First order", amount: 100, isDiscount: true }],
  },
};

/** Card row "inverse" — on an ink field. */
export const OnInk: Story = {
  render: (args) => (
    <div data-surface="ink" className="rounded-lg bg-surface-inverse p-6">
      <PriceSummary {...args} />
    </div>
  ),
};

export const Surfaces: Story = {
  args: {
    total: 1139,
    lines: [...SUBTOTAL_AND_GST, { label: "First order", amount: 100, isDiscount: true }],
  },
  render: (args) => (
    <OnSurfaces>
      <PriceSummary {...args} className="w-full" />
    </OnSurfaces>
  ),
};

/** Dev parity: `isStrong` pulls a running subtotal up to heading weight above the taxes. */
export const WithStrongLine: Story = {
  args: {
    total: 1239,
    lines: [
      { label: "Two thalis", amount: 560 },
      { label: "Paneer tikka masala", amount: 320 },
      { label: "Chilli garlic momos", amount: 300 },
      { label: "Items", amount: 1180, isStrong: true },
      { label: "GST (5%)", amount: 59 },
    ],
  },
};

/** Dev parity: the receipt shape — a renamed total and the fine print under it. */
export const Receipt: Story = {
  args: { totalLabel: "Amount paid", note: "Inclusive of all taxes. Paid by UPI." },
};

/** Dev parity: a total with no lines — the smallest useful summary. */
export const TotalOnly: Story = {
  args: { lines: [], total: 280, note: "Inclusive of all taxes." },
};

/** Dev parity: at 360px the label gives way first; the amount never wraps. */
export const Narrow: Story = {
  args: {
    total: 1139,
    lines: [
      { label: "Subtotal before the counter discount", amount: 1180 },
      { label: "GST (5%)", amount: 59 },
      { label: "First order", amount: 100, isDiscount: true },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-80">
        <Story />
      </div>
    ),
  ],
};
```

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export {
  type PriceLine,
  PriceSummary,
  type PriceSummaryProps,
} from "./molecules/price-summary/price-summary";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/price-summary packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/price-summary packages/ui/src/index.ts packages/design-tokens/tokens packages/design-tokens/contrast-pairs.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): PriceSummary molecule

Money lines as a definition list, formatted by formatRupees, discounts
with a true minus, the total as a large PriceTag under a hairline. The
discount colour is a surface component token, so there is no tone prop.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 19: StepTracker

Design-system sources: `components/molecules/StepTracker.*`; organism `OrderTracker.jsx`. Card rows: vertical (order tracking, current 1) · horizontal (checkout, current 1) · inverse (horizontal on pink, current 2).

**Files:**

- Create: `packages/design-tokens/tokens/component/step-tracker.json`
- Create: `packages/ui/src/molecules/step-tracker/step-tracker.tsx`, `step-tracker.test.tsx`, `step-tracker.stories.tsx`
- Modify: `packages/design-tokens/tokens/surface/{brand,ink,light}.json`, `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/step-tracker/step-tracker.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                                      | Ruling  | Where / why                                                                                           |
| --------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| each step's state spelled out for screen readers ("Done" / "In progress" / "Not started yet") | ADD     | `sr-only` `STATE_TEXT` per step + test; strings added to the accessible-defaults table (deviation 15) |
| nothing started (`current={-1}`) → all upcoming                                               | ADD     | test "leaves every step upcoming…" + `NotStarted` story                                               |
| the list takes an accessible name                                                             | ADD     | native `aria-label` asserted in the state-text test (dev: `label` default "Progress")                 |
| caller `className` merges                                                                     | ADD     | test "merges a caller className…"                                                                     |
| vertical tracker on a brand field; `Narrow` story                                             | ADD     | `VerticalSurfaces`, `Narrow` stories                                                                  |
| `tone="inverse"` (white markers and bars on brand)                                            | DROP    | spec D5, deviation 7 — the bar is a surface-overridden token; markers keep their own fills            |
| bare-string steps (`["Cart", "Details"]`)                                                     | DROP    | spec §8.2: object lists only                                                                          |
| `label` prop default "Progress"                                                               | DROP    | spec D9 / deviation 15: no default copy; the native `aria-label` names it when a page needs it        |
| named `<ol>`; `aria-current="step"`; notes vertical only; check on done                       | ALREADY | tests "is an ordered list…", "draws a diamond per step…", "shows the notes…", "draws the horizontal…" |
| flood up to the current step                                                                  | ALREADY | `data-state` + state variants                                                                         |
| `Default`, `Complete`, `Horizontal`, `OnBrand`, `HorizontalOnBrand` stories                   | ALREADY | `Playground`, `Complete`, `Horizontal`, `OnBrand` (horizontal on pink), `Surfaces`                    |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Icon`; `SymbolMark` (Plan 2a — the shared `mask-symbol` CSS mask, ruling R19); `OnSurfaces` (Plan 2a, stories).
- Produces: `StepTracker`, `StepTrackerProps`, `TrackerStep` — contract §5 without `tone` (deviation 7). An `<ol>`; earlier steps are complete, `current` carries `aria-current="step"`; every step exposes `data-state="complete" | "current" | "upcoming"`. Vertical markers are brand diamonds (a filled diamond has its own fill, so it uses fixed primitives and looks the same on every field — Plan 2a's skin rule); the horizontal bar has no fill of its own to hide behind, so its colours are component tokens that flip on pink and ink (on the design system's own pink card row, pink segments on the pink field vanished).

- [ ] **Step 1: Component tokens and the surface skin**

`packages/design-tokens/tokens/component/step-tracker.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "step-tracker-marker": {
      "$value": "22px",
      "$description": "Vertical StepTracker marker: a 22px square turned 45°."
    },
    "step-tracker-mark": {
      "$value": "16px",
      "$description": "The brand mark inside a marker (74% of the marker)."
    }
  },
  "color": {
    "$type": "color",
    "step-tracker-bar-on": {
      "$value": "{color.pink.500}",
      "$description": "Horizontal StepTracker: a reached segment. White on a pink field."
    },
    "step-tracker-bar-off": {
      "$value": "{color.ink.200}",
      "$description": "Horizontal StepTracker: a segment still to come. White at 25% on pink and ink fields."
    }
  }
}
```

Inside `surface-brand` → `color` (`tokens/surface/brand.json`) add:

```json
"step-tracker-bar-on": { "$value": "{color.ink.000}" },
"step-tracker-bar-off": { "$value": "{color.white-alpha.25}" }
```

Inside `surface-ink` → `color` (`tokens/surface/ink.json`) add:

```json
"step-tracker-bar-off": { "$value": "{color.white-alpha.25}" }
```

Inside `surface-light` → `color` (`tokens/surface/light.json`) add:

```json
"step-tracker-bar-on": { "$value": "{color.pink.500}" },
"step-tracker-bar-off": { "$value": "{color.ink.200}" }
```

Append `"step-tracker-marker"`, `"step-tracker-mark"` to `SPACING`. Rebuild and run the token tests (light-restore and surface-alias suites cover the new overrides). No contrast pair: the bars and markers are graphics next to labelled text, and the labels are semantic text already measured on every surface.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/step-tracker/step-tracker.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { StepTracker, type TrackerStep } from "./step-tracker";

const ORDER: TrackerStep[] = [
  { label: "Order in", note: "Kitchen's on it." },
  { label: "On the tandoor", note: "Chilli paneer is charring." },
  { label: "Ready for pickup", note: "Counter 2, ask for Paprikaa." },
];

const CHECKOUT: TrackerStep[] = [
  { label: "Cart" },
  { label: "Details" },
  { label: "Pay" },
  { label: "Done" },
];

function states(): (string | null)[] {
  return screen.getAllByRole("listitem").map((step) => step.getAttribute("data-state"));
}

describe("StepTracker", () => {
  it("is an ordered list whose current step is marked for assistive tech", () => {
    render(<StepTracker steps={ORDER} current={1} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("On the tandoor").closest("li")).toHaveAttribute(
      "aria-current",
      "step"
    );
    expect(states()).toEqual(["complete", "current", "upcoming"]);
  });

  it("completes every step when current is past the last", () => {
    render(<StepTracker steps={ORDER} current={3} />);
    expect(states()).toEqual(["complete", "complete", "complete"]);
    expect(screen.queryByRole("listitem", { current: "step" })).not.toBeInTheDocument();
  });

  it("leaves every step upcoming when nothing has started", () => {
    render(<StepTracker steps={ORDER} current={-1} />);
    expect(states()).toEqual(["upcoming", "upcoming", "upcoming"]);
    expect(screen.getAllByText("Not started yet")).toHaveLength(3);
  });

  it("spells each step's state out for assistive tech — never by colour alone", () => {
    render(<StepTracker steps={ORDER} current={1} aria-label="Order progress" />);
    expect(screen.getByRole("list", { name: "Order progress" })).toBeInTheDocument();
    expect(screen.getByText("Done")).toHaveClass("sr-only");
    expect(screen.getByText("In progress")).toHaveClass("sr-only");
    expect(screen.getByText("Not started yet")).toHaveClass("sr-only");
    expect(screen.getByText("On the tandoor").closest("li")).toHaveTextContent(
      "In progressOn the tandoor"
    );
  });

  it("merges a caller className over its own gap", () => {
    render(<StepTracker steps={ORDER} current={0} className="gap-8" />);
    const list = screen.getByRole("list");
    expect(list).toHaveClass("gap-8");
    expect(list).not.toHaveClass("gap-3.5");
  });

  it("draws a diamond per step with a check on the completed ones, all decorative", () => {
    const { container } = render(<StepTracker steps={ORDER} current={2} />);
    expect(container.querySelectorAll(".mask-symbol")).toHaveLength(3);
    expect(container.querySelectorAll("svg.lucide-check")).toHaveLength(2);
    for (const marker of container.querySelectorAll("li > span:first-child")) {
      expect(marker).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("shows the notes in the vertical layout", () => {
    render(<StepTracker steps={ORDER} current={1} />);
    expect(screen.getByText("Chilli paneer is charring.")).toHaveClass("text-text-muted");
  });

  it("draws the horizontal layout as a segmented bar without notes", () => {
    const { container } = render(
      <StepTracker
        steps={[{ label: "Cart", note: "2 items" }, ...CHECKOUT.slice(1)]}
        current={1}
        orientation="horizontal"
      />
    );
    expect(container.firstElementChild).toHaveClass("flex");
    expect(container.querySelectorAll(".bg-step-tracker-bar-on")).toHaveLength(2);
    expect(container.querySelectorAll(".bg-step-tracker-bar-off")).toHaveLength(2);
    expect(screen.queryByText("2 items")).not.toBeInTheDocument();
  });

  it("sets reached labels in heading ink, the current one bold, the rest subtle", () => {
    render(<StepTracker steps={CHECKOUT} current={1} orientation="horizontal" />);
    expect(screen.getByText("Cart")).toHaveClass("text-text-heading", "font-medium");
    expect(screen.getByText("Details")).toHaveClass("text-text-heading", "font-bold");
    expect(screen.getByText("Pay")).toHaveClass("text-text-subtle");
  });

  it("has no accessibility violations in either orientation", async () => {
    const { container } = render(
      <>
        <StepTracker steps={ORDER} current={1} />
        <StepTracker steps={CHECKOUT} current={1} orientation="horizontal" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/step-tracker 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./step-tracker`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/step-tracker/step-tracker.tsx`:

```tsx
import type { ComponentProps } from "react";

import { Check } from "lucide-react";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import { SymbolMark } from "../../lib/symbol-mark";

type StepState = "complete" | "current" | "upcoming";

const stepTracker = componentVariants({
  slots: {
    root: "m-0 list-none p-0",
    step: "flex min-w-0",
    marker: "size-step-tracker-marker relative mt-0.5 shrink-0",
    diamond: "absolute inset-0 grid rotate-45 place-items-center overflow-hidden rounded-xs",
    mark: "size-step-tracker-mark -rotate-45 opacity-50",
    check: "absolute inset-0 grid place-items-center text-ink-000",
    bar: "h-1.25 rounded-pill transition-colors duration-base ease-out",
    copy: "grid min-w-0",
    label: "font-display",
    note: "text-caption text-text-muted",
  },
  variants: {
    orientation: {
      vertical: { root: "grid gap-3.5", step: "gap-3.5", label: "text-body-sm" },
      horizontal: { root: "flex gap-2", step: "flex-1 flex-col gap-2", label: "text-caption" },
    },
    state: {
      complete: {
        diamond: "bg-pink-500",
        mark: "text-ink-000",
        bar: "bg-step-tracker-bar-on",
        label: "font-medium text-text-heading",
      },
      current: {
        diamond: "bg-pink-500",
        mark: "text-ink-000",
        bar: "bg-step-tracker-bar-on",
        label: "font-bold text-text-heading",
      },
      upcoming: {
        diamond: "bg-ink-200",
        mark: "text-pink-500",
        bar: "bg-step-tracker-bar-off",
        label: "font-medium text-text-subtle",
      },
    },
  },
  defaultVariants: { orientation: "vertical", state: "upcoming" },
});

function stateOf(index: number, current: number): StepState {
  if (index < current) return "complete";
  return index === current ? "current" : "upcoming";
}

/** What a screen reader hears before each step's label (dev parity: state never by colour alone). */
const STATE_TEXT: Readonly<Record<StepState, string>> = {
  complete: "Done",
  current: "In progress",
  upcoming: "Not started yet",
};

export interface TrackerStep {
  label: string;
  /** Vertical only: one line of brand voice, e.g. "Chilli paneer is charring." */
  note?: string | undefined;
}

export interface StepTrackerProps extends ComponentProps<"ol"> {
  steps: TrackerStep[];
  /** Index of the current step; earlier steps are complete. */
  current: number;
  /** `vertical` for order tracking, `horizontal` for checkout progress. */
  orientation?: "vertical" | "horizontal" | undefined;
}

/**
 * Progress through named steps. Vertical: brand diamonds, checked when complete. Horizontal: a
 * segmented bar. Step copy is the brand voice, not system status text.
 */
export function StepTracker({
  steps,
  current,
  orientation = "vertical",
  className,
  ...props
}: StepTrackerProps) {
  const isVertical = orientation === "vertical";
  const styles = stepTracker({ orientation });

  return (
    <ol className={styles.root({ className })} {...props}>
      {steps.map((step, index) => {
        const state = stateOf(index, current);
        return (
          <li
            key={index}
            data-state={state}
            aria-current={state === "current" ? "step" : undefined}
            className={styles.step()}
          >
            {isVertical ? (
              <span aria-hidden="true" className={styles.marker()}>
                <span className={styles.diamond({ state })}>
                  <SymbolMark className={styles.mark({ state })} />
                </span>
                {state === "complete" ? (
                  <span className={styles.check()}>
                    <Icon icon={Check} size="xs" className="size-3" />
                  </span>
                ) : null}
              </span>
            ) : (
              <span aria-hidden="true" className={styles.bar({ state })} />
            )}
            <span className="sr-only">{STATE_TEXT[state]}</span>
            <span className={styles.copy()}>
              <span className={styles.label({ state })}>{step.label}</span>
              {isVertical && step.note !== undefined ? (
                <span className={styles.note()}>{step.note}</span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/step-tracker 2>&1 | tail -8`
Expected: PASS (10 tests).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/step-tracker/step-tracker.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { StepTracker, type TrackerStep } from "./step-tracker";

const ORDER: TrackerStep[] = [
  { label: "Order in", note: "Kitchen's on it." },
  { label: "On the tandoor", note: "Chilli paneer is charring." },
  { label: "Ready for pickup", note: "Counter 2, ask for Paprikaa." },
];

const CHECKOUT: TrackerStep[] = [
  { label: "Cart" },
  { label: "Details" },
  { label: "Pay" },
  { label: "Done" },
];

const meta = {
  title: "Molecules/StepTracker",
  component: StepTracker,
  args: { steps: ORDER, current: 1 },
  parameters: {
    docs: {
      description: {
        component:
          'Order tracking and multi-step checkout. Vertical markers are brand diamonds with a check when complete; horizontal renders as a segmented bar. The current step carries `aria-current="step"`. Step copy is the brand voice, not system status text. On a pink or ink field it follows the surface — the bar turns white — so there is no `tone` prop.',
      },
    },
  },
} satisfies Meta<typeof StepTracker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "vertical". */
export const Playground: Story = {};

/** Card row "horizontal". */
export const Horizontal: Story = {
  args: { steps: CHECKOUT, current: 1, orientation: "horizontal" },
};

/** Card row "inverse" — horizontal on a pink field. */
export const OnBrand: Story = {
  args: { steps: CHECKOUT, current: 2, orientation: "horizontal" },
  render: (args) => (
    <div data-surface="brand" className="rounded-lg bg-surface-brand p-6">
      <StepTracker {...args} />
    </div>
  ),
};

/** Every step complete. */
export const Complete: Story = { args: { current: 3 } };

export const Surfaces: Story = {
  args: { steps: CHECKOUT, current: 2, orientation: "horizontal" },
  render: (args) => (
    <OnSurfaces>
      <StepTracker {...args} className="w-full" />
    </OnSurfaces>
  ),
};

/** Dev parity: nothing has started yet — every diamond stays grey. */
export const NotStarted: Story = { args: { current: -1 } };

/** Dev parity: the vertical markers on every field — filled diamonds keep their own colours. */
export const VerticalSurfaces: Story = {
  render: (args) => (
    <OnSurfaces>
      <StepTracker {...args} />
    </OnSurfaces>
  ),
};

/** Dev parity: the smallest supported width — labels wrap, the diamonds hold their column. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-full max-w-80">
        <Story />
      </div>
    ),
  ],
};
```

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export {
  StepTracker,
  type StepTrackerProps,
  type TrackerStep,
} from "./molecules/step-tracker/step-tracker";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/step-tracker packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/step-tracker packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): StepTracker molecule

Vertical brand-diamond markers (checked when complete) or a segmented
horizontal bar, in an ordered list with aria-current on the current step.
The bar's colours flip on pink and ink fields, which the design system's
own pink row lost; there is no tone prop.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 20: Tier parity review (spec §11.4) and the story test run

Every molecule's stories side by side with its design-system card, at 360 and 1280. Differences are fixed, or listed with a reason. Then the whole story suite runs in Chromium (play functions, a11y).

**Files:**

- Modify: any `packages/ui/src/molecules/**` or `packages/design-tokens/tokens/component/*.json` the review corrects
- Evidence (not committed): `tmp/parity/molecules-system/*.png` (`tmp/` is gitignored)

**Interfaces:**

- Consumes: every story from Tasks 2–19; the cards under `zip-files/Pink Paprikaa Design System/components/molecules/`.
- Produces: the parity list in the commit body; a green `storybook:test`.

- [ ] **Step 1: Serve both sides**

Run in two background shells:

```bash
pnpm exec serve "zip-files/Pink Paprikaa Design System" -l 5055
pnpm nx run @pink-paprikaa-web/storybook:serve
```

The cards load React and Babel from unpkg, so the machine needs network (rerun the serve with the sandbox disabled if it is blocked).

- [ ] **Step 2: Screenshot every pair at 360 and 1280**

For each molecule, with Chrome DevTools MCP (`new_page`, `resize_page` to 360×900 then 1280×900, `take_screenshot`) or a Playwright script, capture:

- card: `http://localhost:5055/components/molecules/<Name>.card.html`
- stories: `http://localhost:6006/iframe.html?id=molecules-<kebab-name>--<story>&viewMode=story`, one per card row

| Molecule        | Card              | Stories                                                                                                         |
| --------------- | ----------------- | --------------------------------------------------------------------------------------------------------------- |
| Field           | `Field`           | `playground`, `stack-with-hint`, `required`, `with-error`, `with-success`, `with-warning`, `optional`, `side`   |
| SearchField     | `SearchField`     | `playground`, `with-value`, `loading`, `no-results`, `disabled`, `small`                                        |
| QuantityStepper | `QuantityStepper` | `sizes`, `at-min`, `min-zero`, `at-max`, `typed-guests`                                                         |
| OtpInput        | `OtpInput`        | `partial`, `complete`, `verified`, `expired`, `disabled`                                                        |
| SlotPicker      | `SlotPicker`      | `playground`, `with-error`, `disabled`, `columns`                                                               |
| Alert           | `Alert`           | `info-and-success`, `warning-and-danger`, `brand-with-action`, `dismissible`, `nudge`, `neutral`, `on-surfaces` |
| Toast           | `Toast`           | `tones`, `status`, `pop`, `contained`                                                                           |
| Snackbar        | `Snackbar`        | `playground`, `success`, `danger-with-retry`, `undo-and-dismiss`, `live-copy`                                   |
| EmptyState      | `EmptyState`      | `playground`, `with-icon`, `large`                                                                              |
| Tabs            | `Tabs`            | `playground`, `two-items`, `segmented` (handoff: compare with `design/ThisWeek.dc.html`)                        |
| Breadcrumb      | `Breadcrumb`      | `playground`, `two-levels`, `long`, `on-surfaces`                                                               |
| Pagination      | `Pagination`      | `playground`, `first-page`, `three-pages`, `last-page`                                                          |
| SectionHeader   | `SectionHeader`   | `playground`, `with-lede`, `centred`, `on-brand`, `surfaces`                                                    |
| Stat            | `Stat`            | `default`, `icon-brand`, `inverse-centre`                                                                       |
| Accordion       | `Accordion`       | `playground`, `multiple`, `surfaces` (handoff: `design/FaqBlock.dc.html`)                                       |
| ListRow         | `ListRow`         | `playground`, `trailing-control`, `with-description`, `trailing-badge`, `danger`, `account-list`                |
| PriceSummary    | `PriceSummary`    | `playground`, `with-discount`, `on-ink`, `surfaces`                                                             |
| StepTracker     | `StepTracker`     | `playground`, `horizontal`, `on-brand`, `complete`, `surfaces`                                                  |

Save as `tmp/parity/molecules-system/<kebab-name>-<width>-{card,story}.png`.

- [ ] **Step 3: Compare, then fix or list**

For each pair check: sizes and paddings, radii, borders and their width in each state, type (family, size, weight, tracking), colours on each surface, glyph size and stroke, wrapping at 360. A difference that is not in the expected list below is a bug: fix it in the component or its token file (token first; add a unit test when it is behaviour, not pixels), rerun that component's tests, and re-screenshot.

Expected differences (reasons already recorded — list them, do not "fix" them):

- Every card: font rasterisation.
- Field: `stack + hint` and `error` rows use a Select where the card wraps a SlotPicker (a fieldset carries its own legend and message — deviation 1).
- SearchField: the status glyph also shows inside the box (the system's one field chrome, Plan 2b `FieldControl`); loading is the pulsing mark, not the card's ring spinner; text is 15px `text-control`.
- QuantityStepper: the count is an input; its width follows its digits (22px minimum).
- OtpInput: identical cells; one input behind them (not visible).
- Snackbar: tone rows show the dismiss button (deviation 6); the inset is fixed at 24px (the card passes `inset={0}`).
- Toast / Snackbar success: the fill is the strong mint (deviation 12).
- Alert: the Dawat warning on ink is the opaque warning panel, not the handoff's translucent tint (deviation 11, open question 1).
- Tabs underline: the underline may sit on (not over) the hairline where the tablist wraps; triggers are 44px tall (spec §5.5 target, dev parity), so the row is taller than the card's ~33px.
- Field `side`: stacks below 480px (dev parity) — the 360px screenshot shows the label above the control.
- Pagination: Previous/Next at the ends are inert placeholders, not dead buttons (deviation 13).
- StepTracker: the check glyph is 12px as drawn; on the pink row the reached segments are white (they were invisible pink-on-pink).
- EmptyState `lg`: body copy changed from the card's "Your first one is on us." (an offer the brand has not made).

- [ ] **Step 4: Run the whole story suite in Chromium**

```bash
pnpm exec playwright install chromium
pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache 2>&1 | tail -20
```

Expected: every story passes — every `play` (SearchField, QuantityStepper, OtpInput, SlotPicker, Alert, Toast, Snackbar, Tabs, ListRow, Accordion's real `<details name>` exclusivity) and the a11y check on every story. A failing a11y rule is fixed in the component, never disabled.

- [ ] **Step 5: Final gate**

```bash
pnpm nx format:check && pnpm nx sync:check
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 6: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "fix(ui): molecule parity with the design-system cards

Side-by-side review of the eighteen system molecules against their cards
at 360 and 1280; storybook:test green in Chromium.

Fixed:
<one line per fix, or \"none\">

Expected differences:
<paste the Step 3 list, one line each>

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

(If the review changed nothing, commit nothing and paste the list into the report instead.)

## Controller amendments (2026-09-27)

- **Alert on dark sections** stays an opaque tinted panel — accepted (no new tokens).
- **Status message colours on ink/brand** are not remapped — accepted; no page places status text on a dark field. Revisit with a contrast pair if one ever does.
- **Darker mint success fill** (white on mint fails the policy) — accepted.
- **Field text is 16px** (ruling R21): every text-entry control (Input, Select, SearchField, OtpInput cells, textarea) renders its value at `text-body` (16px) — iOS Safari zooms the page on focus below 16px, and the handoff's own fields use 16px. Plan 2b's `lib/field-control.tsx` owns this; molecules inherit it.
