# 03 — Canonical Patterns

Copy these shapes. Each is the **one** way its problem is solved here; deviations go through the
decision log first. Excerpts are canonical — if the codebase outgrows one, update it in the same
PR (trust the code, fix the doc).

## 1. Component (the base form)

The reference shape is the real Button, `packages/ui/src/atoms/button/button.tsx`, copied here
verbatim when the design system was completed (2026-09-27). If that file changes shape, this
excerpt changes in the same PR.

```tsx
import type { ComponentProps, ElementType } from "react";

import { LoaderCircle } from "lucide-react";
import { Slot } from "radix-ui";

import { componentVariants } from "../../lib/component-variants";
import { controlStates } from "../../lib/control-states";
import { Icon, type IconComponent } from "../icon/icon";

export interface ButtonProps extends ComponentProps<"button"> {
  /** primary = flooded pink · secondary = pink outline · ghost = text only · inverse = ink. */
  variant?: "primary" | "secondary" | "ghost" | "inverse" | undefined;
  size?: "sm" | "md" | "lg" | undefined;
  /** Glyph before the label — names the action. */
  icon?: IconComponent | undefined;
  /** Glyph after the label — onward motion (arrow-right, arrow-up-right, chevron-down). */
  iconAfter?: IconComponent | undefined;
  isFullWidth?: boolean | undefined;
  /** Swaps the leading glyph for a spinner, sets `aria-busy` and blocks presses. */
  isLoading?: boolean | undefined;
  /** Render the single child (`<a href>`, `next/link`) with Button styling. */
  asChild?: boolean | undefined;
}

/**
 * The Button's classes. Exported so a Radix trigger can look like a Button:
 * `buttonVariants({ variant: "secondary" }).root()`.
 *
 * `primary`, `secondary` and the hover tint paint with surface-aware tokens (`surface/*.json`),
 * so on a pink field primary turns white and secondary a white outline with no prop; ghost and
 * secondary text use the semantic link colour, which flips too. `inverse` is solid ink everywhere.
 */
export const buttonVariants = componentVariants({
  slots: {
    root: [
      controlStates(),
      "inline-flex max-w-full shrink-0 items-center justify-center rounded-pill font-display whitespace-nowrap active:press-scale",
    ],
    label: "min-w-0 truncate",
    loader: "animate-rotate",
  },
  variants: {
    variant: {
      primary: {
        root: "bg-button-primary-bg text-button-primary-fg shadow-button-primary hover:bg-button-primary-bg-hover active:bg-button-primary-bg-active",
      },
      secondary: {
        root: "border-2 border-button-secondary-border bg-button-secondary-bg text-text-link hover:bg-button-hover-tint",
      },
      ghost: { root: "bg-transparent text-text-link hover:bg-button-hover-tint" },
      inverse: { root: "bg-ink-900 text-ink-000 shadow-2" },
    },
    size: {
      sm: { root: "h-button-h-sm min-w-button-h-sm gap-1.5 px-3.5 text-button-sm" },
      md: { root: "h-button-h-md min-w-button-h-md gap-2 px-5 text-button-md" },
      lg: { root: "h-button-h-lg min-w-button-h-lg gap-2 px-7 text-button-lg" },
    },
    isFullWidth: { true: { root: "flex w-full" } },
  },
  defaultVariants: { variant: "primary", size: "md", isFullWidth: false },
});

/** Glyph 16px at sm, 20px at md and lg; the loader 20px, 24px at lg (design system Button.jsx). */
const GLYPH_SIZE = { sm: "sm", md: "md", lg: "md" } as const;
const LOADER_SIZE = { sm: "md", md: "md", lg: "lg" } as const;

/** The brand's action button — pill, Poppins 700, Title Case label. */
export function Button({
  variant,
  size = "md",
  icon,
  iconAfter,
  isFullWidth = false,
  isLoading = false,
  asChild = false,
  disabled = false,
  type = "button",
  className,
  children,
  ...props
}: ButtonProps) {
  const slots = buttonVariants({ variant, size, isFullWidth });
  const Component: ElementType = asChild ? Slot.Root : "button";
  // A slotted <a> must not get `type` or `disabled`; it says so with aria-disabled instead.
  const state = asChild
    ? { "aria-disabled": disabled || isLoading || undefined }
    : { type, disabled: disabled || isLoading };
  const leading = isLoading ? LoaderCircle : icon;
  return (
    <Component
      className={slots.root({ className })}
      aria-busy={isLoading || undefined}
      {...state}
      {...props}
    >
      {leading ? (
        <Icon
          icon={leading}
          size={isLoading ? LOADER_SIZE[size] : GLYPH_SIZE[size]}
          className={isLoading ? slots.loader() : undefined}
        />
      ) : null}
      <Slot.Slottable child={children}>
        {(label) => <span className={slots.label()}>{label}</span>}
      </Slot.Slottable>
      {iconAfter ? <Icon icon={iconAfter} size={GLYPH_SIZE[size]} /> : null}
    </Component>
  );
}
```

Encoded rules — all CONVENTION unless marked:

- `componentVariants()` owns every class decision; no conditional string concatenation in JSX.
  **Never import `tv` from `tailwind-variants` directly** (LAW-in-practice): the bare instance
  merges against stock Tailwind scales and silently deletes token classes — `text-h1` is read as a
  colour and disappears next to `text-text-muted`. `packages/ui/src/lib/component-variants.ts` is
  the configured instance, and its spec asserts the scale lists against the generated tokens.
- **Only token classes exist** (LAW: `tailwindcss/no-arbitrary-value`, `tailwindcss/no-custom-classname`,
  `pink-paprikaa/no-raw-hex`, `pink-paprikaa/no-arbitrary-shorthand`). `packages/design-tokens`
  clears the stock scales it replaces, so `rounded-lg` is the system's 16px, and `shadow-md`,
  `bg-red-500` or `max-w-prose` compile to nothing or to the wrong thing. A value the scales lack
  becomes a token first — component tokens live in `packages/design-tokens/tokens/component/<name>.json`
  (`packages/ui/AUTHORING.md`).
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
  TabBar items take `asChild` (Radix `Slot.Root`), so the app passes `next/link`, a `wa.me` link or `tel:`
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
- **Tests that read files** join paths with `join(import.meta.dirname, …)`, never
  `new URL(…, import.meta.url)` (ruling R15).

## 2. Component file set

```
packages/ui/src/<layer>/<name>/
  <name>.tsx           # the component (one primary export)
  <name>.test.tsx      # behaviour + axe (mandatory pair)
  <name>.stories.tsx   # every variant (mandatory in ui)
```

The axe assertion is `await expectNoA11yViolations(container)` from `packages/ui/vitest.setup.ts`
— a helper rather than a `toHaveNoViolations()` matcher, because Vitest declares
`interface Matchers<T = any>` and augmenting it would force an `any` into the package's types.

App feature components: same trio minus stories (stories only for `packages/ui`).

## 3. Client islands

`"use client"` on the **smallest leaf** that needs interactivity. A static organism with one
interactive corner = static organism + tiny client child. Page-level `"use client"` is a review
reject. Everything else renders at build time and ships no JS.

## 4. Transformer (pure wire/URL ↔ view mapping) — adopted from reference (R-10)

The best pattern in the reference codebase, kept almost verbatim: a **pure function with
explicit input and output types** that turns raw data (URL params, content JSON, CSV rows) into
exactly what the view needs. It is the testable seam between data and render.

```ts
// apps/web/src/features/menu/menu-transformer.ts — shape
import type { Menu, MenuItem } from "@pink-paprikaa-web/content";

export interface MenuFilterParams {
  category?: string;
  tag?: string;
}
export interface MenuView {
  categories: { slug: string; name: string; items: MenuItem[] }[];
  activeCategory: string | null;
}

export function toMenuView(menu: Menu, params: MenuFilterParams): MenuView {
  // pure: no fetch, no state, no Date.now() — same input, same output
  …
}
```

Rules: pure (deterministic, side-effect-free); both types exported; unit-tested with plain
Vitest; lives in the feature as `<feature>-transformer.ts`. Components never do this work
inline.

## 5. Constants-as-data — adopted from reference (R-11)

Static configuration expressed as typed data that generic code consumes — no logic inside:

```ts
// apps/web/src/features/menu/menu-constants.ts — shape
import type { MenuItem } from "@pink-paprikaa-web/content";

export const MENU_TAG_LABELS: Record<MenuItem["tags"][number], string> = {
  bestseller: "Bestseller",
  "chef-special": "Chef's Special",
  spicy: "Spicy",
} as const;

export const MENU_PAGE_SIZE = 24;
```

Keys typed from schema unions (never free strings — principle 6); `UPPER_SNAKE` primitives,
`as const` objects; file named `<feature>-constants.ts`.

## 6. State — the ladder (decision, not preference)

Take the **first** rung that works; each rung must be justified against the one above it:

1. **Derive during render** — banned pattern: `useState`+`useEffect` mirroring computable data.
2. **`useState` in the leaf** that owns the interaction.
3. **Lift** to the nearest common parent when siblings truly share it.
4. **URL** (`useSearchParams`/segments) for anything shareable/back-buttonable.
5. **`localStorage` behind a named hook** (see §7) for cross-visit persistence the product spec
   names. Never inline `window.localStorage` in components.
6. **Context** for global, rarely-changing values with 3+ unrelated consumers. Current count: 0.

**No state library** (R-05). If one is ever justified (v2 auth/cart), the decision reopens in
the decision log, and the reference implementation standard is already set: typed
state/actions split, devtools-labelled actions, `initialState` + `resetState` — the discipline
survives even though the library was rejected.

## 7. Hook patterns

```ts
// the localStorage rule-hook shape (rung 5)
export function useOfferDismissal(offerSetHash: string) {
  // encapsulates: storage key scheme, 24h TTL, SSR/build guard
  …
  return { isDismissed, dismiss } as const;
}
```

- A hook earns existence by owning a **rule**, not by wrapping one `useState`.
- Return an object for 3+ values; a tuple for `[value, setter]` pairs.
- **Engine + thin adapters** (R-12, adopted): when several call-sites share heavy logic that
  differs only in configuration, one generic engine hook + named thin wrappers per use-case.
  Consumers import the wrapper, never the engine.
- Table column defs (Phase 2 menu admin tables, if any): co-located `use-<listing>-columns.tsx`
  returning memoised typed `ColumnDef[]` (R-13) — noted for when a table exists; do not build
  table infrastructure before then (YAGNI).

## 8. Content boundary (the Zod pattern)

```ts
// packages/content/src/index.ts — the shape that guards every consumer
import rawSite from "./data/site.json";
import { siteSchema } from "./schemas";

export const site = siteSchema.parse(rawSite); // build fails on violation
export type Site = z.infer<typeof siteSchema>;
```

One parse at the boundary; typed exports; schemas and types are the same artifact. Every new
content kind repeats exactly this shape ([08-recipes §4](08-recipes.md)).

## 9. Error handling (the standard, full strength)

The universal rules — these never relax:

- **Errors are handled at the boundary that can act on them**, exactly once. No swallowing
  (empty `catch`), no log-and-rethrow chains, no `catch` that turns a failure into a silent
  default.
- **Fail at build what can fail at build.** Every error class moved from runtime to build time
  (schema parse, content integrity, broken links, type errors) is an error users can never see.
  This is the strongest error-handling move available and this stack maximises it.
- **Every runtime failure surface has an owner:** user-visible fallback (`error.tsx`,
  `not-found.tsx` per app), a recovery path where one exists, and observability where operations
  need it.
- **Expected failures are values, not exceptions** — discriminated results
  (`{ ok: true, … } | { ok: false, error }`) for operations where failure is a normal outcome
  (form submission, parsing user input); exceptions only for the genuinely exceptional.

**This repo's current binding:** the runtime surface is deliberately small (static export), so
the full weight sits on build-time failure + the Next error contracts. The moment interactive
surfaces land (Phase 2 forms), their error pattern (result types, user feedback component,
retry policy) is added HERE before the first form merges — not improvised per form.
