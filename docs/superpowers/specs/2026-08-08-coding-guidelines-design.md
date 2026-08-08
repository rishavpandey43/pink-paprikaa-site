# Pink Paprikaa — Coding Guidelines & Architecture

**Date:** 2026-08-08
**Status:** Superseded — expanded into [`docs/engineering/`](../../engineering/README.md)
(2026-08-08, same day). This document remains as the dated decision record; the handbook is
authoritative and is where amendments land.
**Scope:** How code is written in this workspace — patterns, structure, state, naming, constants,
testing. Applies to every phase from 1 onward.
**Companions:** the [architecture spec](./2026-08-07-boilerplate-architecture-design.md) owns
tooling and workspace mechanics; the [product spec](./2026-08-07-pink-paprikaa-site-redesign-design.md)
owns content and behaviour. This document owns the shape of the code itself.

A rule that matters is wired to a gate (lint, typecheck, CI). A rule that cannot be wired is
written here with its rationale, because unwritten conventions die at the second contributor —
human or agent.

---

## 1. Principles, in priority order

1. **KISS beats cleverness.** This is a restaurant marketing site: static export, no server, no
   runtime cost. Every abstraction must justify itself against "a `<div>` with token classes
   would have done". When two designs tie, ship the one with less indirection.
2. **YAGNI, enforced by phases.** Build what the current phase's spec names — nothing
   speculative. The phase roadmap (§15, architecture spec) is the backlog; "we might need it"
   is not.
3. **Predictability over preference.** Same problem → same shape, every time. The decision
   trees in §3 and §6 exist so nobody (person or agent) re-decides where things go.
4. **SOLID, translated to React** (see §4 for the concrete forms):
   - **S**ingle responsibility — one component renders one thing; one hook manages one concern;
     one file exports one primary thing.
   - **O**pen/closed — extend components through composition, `children`, and `tv()` variants,
     never by adding boolean props that fork render paths.
   - **L**iskov — every variant of a component honours the same contract; `<Button intent="secondary">`
     is substitutable wherever `<Button>` is.
   - **I**nterface segregation — small prop interfaces. A component that needs 3 fields takes
     3 props (or one typed object from `content`), not a kitchen-sink `data` blob.
   - **D**ependency inversion — components depend on tokens and `content` types, never on
     concrete data files, fetch calls, or sibling apps. (The dependency direction is
     lint-enforced by the boundary matrix.)
5. **The gates are the definition of done.** `pnpm verify`, e2e, Lighthouse budgets, the
   founder-name guard. Code that needs a gate weakened is wrong, not the gate.

---

## 2. The layer map (where does code live?)

Enforced by `@nx/enforce-module-boundaries` — these are lint errors, not conventions:

| Layer                    | Holds                                                    | May import                                       |
| ------------------------ | -------------------------------------------------------- | ------------------------------------------------ |
| `apps/web`, `apps/blog`  | Routes, pages, app-level composition. **Thin.**          | `ui`, `content`, `seo`, `utils`, `design-tokens` |
| `packages/ui`            | Presentational components (atomic layers), Storybook     | `ui` (upward only), `utils`, `design-tokens`     |
| `packages/content`       | Zod schemas + typed site data (the single content truth) | `utils`                                          |
| `packages/seo`           | JSON-LD builders, metadata helpers                       | `content` types, `utils`                         |
| `packages/utils`         | Framework-agnostic pure functions                        | `utils`                                          |
| `packages/design-tokens` | Token source → generated theme. **Imports nothing.**     | —                                                |

**Decision tree for new code:**

1. Is it a visual building block reusable across pages? → `packages/ui`, in its atomic layer (§4).
2. Is it business data or its schema (menu, offers, hours, NAP)? → `packages/content`.
3. Is it a pure function with no React and no framework? → `packages/utils`.
4. Is it SEO/structured-data shaped? → `packages/seo`.
5. Is it a colour/spacing/font decision? → a token in `packages/design-tokens`, never a literal.
6. Everything else — routes, page composition, app-specific hooks and one-off sections — stays
   in the app that owns it. **When in doubt, start in the app.** Promote to a package only when
   a second real consumer appears (that is the reuse test — not "might be reused").

---

## 3. Component architecture

### 3.1 Atomic layers (lint-enforced upward-only imports)

| Layer       | Definition                                           | This site, concretely                                      |
| ----------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| `atoms`     | One HTML concept, styled                             | `Button`, `Text`, `Badge`, `Icon`, `Spinner`               |
| `molecules` | 2–4 atoms with one tight purpose                     | `PriceTag`, `Card`, `FormField`, `NavItem`                 |
| `organisms` | A self-contained page section                        | `Header`, `Footer`, `MenuSection`, `OfferStrip`, `Gallery` |
| `templates` | Page skeletons; accept content as props, own no data | `PageShell`, `MenuLayout`, `ArticleLayout`                 |

Pages are **not** in the design system — apps bind real `content` data to templates. An atom
importing a molecule is a lint error (`atomic-layering`); if you feel the need, the component is
in the wrong layer.

### 3.2 One component, one directory

```
packages/ui/src/atoms/button/
  button.tsx          # the component (one exported component per file)
  button.test.tsx     # behaviour + axe
  button.stories.tsx  # every variant
```

Files kebab-case; components PascalCase; export through `packages/ui/src/index.ts`. No `index.ts`
barrels inside layer directories — one flat public barrel keeps import paths boring and tree-shaking
honest.

### 3.3 The component pattern (canonical form)

```tsx
import { tv, type VariantProps } from "tailwind-variants";

const button = tv({
  base: "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  variants: {
    intent: {
      primary: "bg-brand-primary text-surface hover:bg-brand-primary-hover",
      secondary: "border border-brand-primary text-brand-primary",
    },
    size: { sm: "h-8 px-3 text-sm", md: "h-10 px-4", lg: "h-12 px-6 text-lg" },
  },
  defaultVariants: { intent: "primary", size: "md" },
});

export type ButtonProps = React.ComponentPropsWithoutRef<"button"> & VariantProps<typeof button>;

export function Button({ className, intent, size, ...props }: ButtonProps) {
  return <button className={button({ intent, size, className })} {...props} />;
}
```

The rules this example encodes:

- **`tv()` owns all class logic.** No conditional string concatenation, no `clsx` chains in JSX.
  Variants are the open/closed mechanism: a new look is a new variant value, not a new boolean.
- **Extend native props** (`ComponentPropsWithoutRef<"element">`) and spread them last, so
  consumers keep `onClick`, `aria-*`, `data-*` for free. `className` merges through `tv()` —
  consumer overrides win (tailwind-merge inside `tv`).
- **`ref` is a normal prop** (React 19) — no `forwardRef` wrappers.
- **Function declarations, named exports.** No default exports anywhere (predictable imports,
  better rename refactors). The single exception: Next.js files with framework contracts
  (`page.tsx`, `layout.tsx`, config files).
- **No boolean render forks.** `{isCompact ? <A/> : <B/>}` inside one component means it is two
  components (or one variant).
- **Behavioural complexity goes to Radix** (dialogs, menus, tabs, accordions) — never hand-roll
  focus traps, ARIA wiring, or keyboard handling.

### 3.4 Server vs client components (static export)

Everything renders at **build time**. Default is a Server Component — zero JS shipped. Add
`"use client"` only for interactivity (state, effects, event handlers), and put the directive on
the **smallest leaf that needs it** — an interactive `OfferStripDismiss` button inside a static
`OfferStrip`, not the whole organism. A page-level `"use client"` is a review flag.

Framework guards that follow from `output: "export"`: no server actions, no runtime `fetch` in
RSC, no `next/image` optimisation (the image pipeline + `<Picture>` owns that, Phase 3), and
`next/link` for internal navigation / plain `<a target="_blank" rel="noreferrer">` for external
(Petpooja ordering — product spec §11).

---

## 4. State management

**Decision: no state library.** Not Redux, not Zustand, not Jotai, not React Query. A static
restaurant site has no server cache and near-zero shared mutable state; a store would be pure
ceremony. This is a KISS decision with a revisit criterion, not a taboo.

**The escalation ladder — take the first rung that works:**

1. **Derive it.** If it can be computed from props/existing state during render, compute it.
   No `useState` + `useEffect` mirror of things React already knows — that pattern is banned.
2. **`useState` in the leaf** that owns the interaction (mobile-nav open, lightbox index).
3. **Lift** to the nearest common parent when two siblings genuinely share it.
4. **URL state** (`useSearchParams` / route segments) for anything shareable or back-button
   relevant: menu category filters, gallery deep links. If a user could want to share the view,
   it belongs in the URL.
5. **`localStorage`** only for cross-visit persistence the product spec names (offer-strip
   dismissal, keyed by offer-set hash — product spec §4.2). Always behind a small hook
   (`useOfferDismissal`), never inline `window.localStorage` in components; guard for SSR/build.
6. **Context** only for genuinely global, rarely-changing values consumed by 3+ unrelated
   components. Today that count is zero.

**Revisit criterion:** if a future phase produces real client-side server-state (auth, carts —
explicitly out of scope for v1) the decision reopens _in a spec update_, not in a PR that
sneaks a store in.

Effects (`useEffect`) are for synchronising with the outside world (DOM APIs, timers,
`localStorage`) — never for data transformation, never as a substitute for derived values, and
every one carries a correct dependency array (`react-hooks` preset enforces).

---

## 5. Custom hooks

- Live next to their consumer: app-specific hooks in `apps/<app>/src/hooks/`, design-system
  hooks beside the component that needs them. Promote to `packages/ui` only on the second
  consumer.
- Named `useThing`; one concern per hook; return an object for 3+ values, a tuple for a
  `[value, setter]` pair — mirror React's own shapes.
- A hook that only wraps one `useState` is not a hook, it's indirection — inline it. A hook
  earns existence by encapsulating a _rule_ (e.g. `useOfferDismissal` hides the hash-keyed
  24-hour `localStorage` contract).

---

## 6. Constants, config and data

**Decision tree — a value exists in exactly one home:**

| Kind of value                    | Home                                  | Example                               |
| -------------------------------- | ------------------------------------- | ------------------------------------- |
| Visual (colour, spacing, radius) | `packages/design-tokens` token source | `color.brand.primary`                 |
| Business data & copy             | `packages/content` (Zod-validated)    | menu items, hours, NAP, GSTIN, offers |
| Structured-data vocabulary       | `packages/seo` builders               | `priceRange: "₹₹"`                    |
| Routes                           | `apps/<app>/src/constants/routes.ts`  | `ROUTES.menu("china-town")`           |
| Behavioural magic numbers        | `const` at top of the owning module   | `OFFER_DISMISS_TTL_HOURS = 24`        |
| Build/deploy configuration       | env vars                              | `NEXT_PUBLIC_SITE_URL`                |

Rules:

- **No magic values in JSX.** A number or string literal with meaning gets a named `const` at
  module top (or the appropriate home above). `UPPER_SNAKE_CASE` for primitives, `as const`
  objects for grouped values:

  ```ts
  export const ROUTES = {
    home: "/",
    menu: (category?: string) => (category ? `/menu/${category}` : "/menu"),
    corporate: "/corporate",
  } as const;
  ```

- **No TypeScript `enum`.** Use `as const` objects + union types (`keyof typeof`) — erasable,
  tree-shakeable, and consistent with the content schemas' `z.enum` output.
- **Env vars:** only `NEXT_PUBLIC_*` exist (no server). Every var is listed in `.env.example`
  with a comment, read in **one** module (`src/env.ts`) that validates presence — components
  import from there, never `process.env` inline.
- **Copy lives in `content`, not components.** Phase 2 onward, user-facing strings come from
  the typed content layer. Hard rules ride on this: `Pink Paprikaa` spelling and the
  founder-name ban are gate-checked over built output either way.

---

## 7. TypeScript rules of engagement

Strictness is already maximal (`strict`, `noUncheckedIndexedAccess`,
`exactOptionalPropertyTypes`, `strictTypeChecked` lint). On top of that:

- **`any` is banned; `unknown` is a doorway.** External data enters as `unknown` and crosses
  into the app through a Zod schema (`packages/content` pattern). `z.infer<>` is the only way
  types and validation stay one thing.
- **`interface` for object shapes** (stylistic preset enforces); `type` for unions,
  intersections, and function signatures. Never `I`-prefixed (naming rule enforces).
- **Discriminated unions over optional-field soup.** An offer that is either time-windowed or
  not is `{ kind: "timed"; window: … } | { kind: "all-day" }`, not four optionals whose valid
  combinations live in someone's head.
- **Narrow at the boundary, trust inside.** Once data passes its schema, downstream code takes
  the typed value — no re-checking, no defensive `?.` chains on data the type says exists.
- **Return types on exported functions.** Inference is fine inside a module; the public surface
  is explicit.
- **Naming is enforced** (`naming-convention`, warn → error after Phase 1): booleans read as
  questions (`isOpen`, `hasVariants`, `canOrder`), `snake_case` only on API-payload type
  properties, handlers are `handleX` internally and `onX` as props.

---

## 8. Testing philosophy

The gates already run Vitest + Testing Library + `vitest-axe`, Playwright + axe, and Lighthouse.
How to write the tests they run:

- **Test behaviour, not implementation.** Query by role/label (`getByRole("button", { name: "Order Now" })`),
  never by class or test-id (a test-id is a last resort and a smell). Asserting on `tv()`
  internals or state variables is banned — restyling must not break tests.
- **Per layer:** `utils`/`content`/`seo` get plain unit tests (schemas: valid + invalid + edge
  per field that carries a rule, e.g. empty-alt rejection); `ui` components get render +
  interaction + **axe** (every component test file includes one `expect(await axe(container))`);
  apps get e2e user journeys (find menu, tap Order Now, no founder names) — not unit tests.
- **Colocated** (`button.test.tsx` beside `button.tsx`); e2e in the `*-e2e` projects.
- **No mocks of our own code.** Mock only true externals (time, `localStorage`, network — of
  which this site has almost none). If a component is hard to test without mocking a sibling,
  the composition is wrong.
- Deterministic and pristine: no time-dependent flakiness (inject dates), no console noise left
  behind — warnings in test output are review findings.

---

## 9. Imports & file hygiene (enforced, for reference)

- Order is auto-fixed on save: builtins → external → internal (`@pink-paprikaa-web/*`, `@/*`) →
  relative, one blank line between groups (`perfectionist`).
- **Cross-package: scope imports only** (`@pink-paprikaa-web/ui`). **In-app absolute: `@/`**
  (`@/components/hero`). **Relative: only within a module's own directory.** Deep-importing
  another package's internals (`@pink-paprikaa-web/ui/src/…`) is a boundary violation.
- One primary export per file; file named after it (kebab-case). 500-line warning is a prompt
  to split by responsibility, not to silence.

---

## 10. Predictability checklist (before any PR)

1. Does this code live where §2's tree says it lives?
2. Does an existing pattern (component form §3.3, hook rules §5, constant home §6) already
   solve it? If deviating — is the deviation written down here, with a reason?
3. Is every visual literal a token, every business value in `content`, every magic number named?
4. Ladder check (§4): is state on the lowest rung that works?
5. `pnpm verify` green, new components have stories + axe test, e2e updated if a journey changed.
6. Would a fresh session, reading only the specs and this document, have produced roughly this
   shape? If not, either the code or this document is wrong — fix whichever it is.

---

## 11. What we deliberately do NOT do (and when to reconsider)

| Not doing                                           | Because                              | Reconsider when                       |
| --------------------------------------------------- | ------------------------------------ | ------------------------------------- |
| State library                                       | No shared mutable state exists       | v2 scope adds auth/cart (out of v1)   |
| Data-fetching library                               | All data is build-time               | A runtime API appears (none planned)  |
| CSS-in-JS / styled-components                       | Tailwind v4 + tokens is the system   | Never for this stack                  |
| i18n framework                                      | Single-language site                 | Product spec adds a locale            |
| Barrel files per directory                          | Import-path noise, tree-shaking risk | Never — one public barrel per package |
| Class components / HOCs                             | Hooks + composition cover every case | Never                                 |
| `useEffect` data massaging                          | Derive during render                 | Never — that's the rule itself        |
| Micro-abstraction (`<Spacer>`, `renderX()` helpers) | Indirection without reuse            | A second real consumer exists         |

---

## 12. Enforcement map

| Rule                                     | Enforced by                                                                                           |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Layer/dependency direction               | `@nx/enforce-module-boundaries` (lint, error)                                                         |
| Atomic upward-only imports               | `atomic-layering` zones (lint, error)                                                                 |
| No raw hex / token discipline            | `pink-paprikaa/no-raw-hex` (lint, error)                                                              |
| Import order & grouping                  | `perfectionist` + on-save fix                                                                         |
| Naming (booleans, interfaces, cases)     | `@typescript-eslint/naming-convention` (warn → error post-Phase 1)                                    |
| `any`, unsafe patterns, type strictness  | `strictTypeChecked` + compiler flags                                                                  |
| Interface-for-objects, style consistency | `stylisticTypeChecked`                                                                                |
| No console, eqeqeq, max-lines, fragments | curated rules (lint)                                                                                  |
| A11y                                     | `jsx-a11y` (lint) + `vitest-axe` + Playwright axe + Lighthouse a11y = 100                             |
| Founder-name ban / spelling              | CI guard over built output + review                                                                   |
| Performance & byte budgets               | Lighthouse CI (§12 architecture spec)                                                                 |
| Everything in §3–§8 not listed above     | This document + code review. If a pattern keeps being violated, wire a rule and add it to this table. |

**Maintenance:** this is a living spec. A decision that changes gets edited here (with the old
choice moved to §11 or a dated note) in the same PR that changes the code — never a drive-by
divergence.
