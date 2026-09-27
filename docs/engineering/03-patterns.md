# 03 — Canonical Patterns

Copy these shapes. Each is the **one** way its problem is solved here; deviations go through the
decision log first. Excerpts are canonical — if the codebase outgrows one, update it in the same
PR (trust the code, fix the doc).

## 1. Component (the base form)

This is the real `Icon` atom (`packages/ui/src/atoms/icon/icon.tsx`), condensed. The `STROKE_WIDTH`
map and the `IconComponent` type are omitted. Plan 5 replaces this excerpt with the real Button once
Button exists, because Button shows `asChild` and slots.

```tsx
import type { ComponentProps } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";

const icon = componentVariants({
  base: "inline-flex shrink-0 items-center justify-center leading-none",
  variants: {
    size: {
      xs: "size-icon-xs",
      sm: "size-icon-sm",
      md: "size-icon-md",
      lg: "size-icon-lg",
      xl: "size-icon-xl",
    },
  },
  defaultVariants: { size: "md" },
});

export interface IconProps
  extends Omit<ComponentProps<"span">, "children">, VariantProps<typeof icon> {
  icon: IconComponent;
  /** Accessible name. Omit for a decorative icon (then it is hidden from assistive tech). */
  label?: string;
}

/** A Lucide-style glyph in the system's sizes, painted with `currentColor`. */
export function Icon({ icon: Glyph, size = "md", label, className, ...props }: IconProps) {
  return (
    <span
      className={icon({ size, className })}
      role={label === undefined ? undefined : "img"}
      aria-label={label}
      aria-hidden={label === undefined ? true : undefined}
      {...props}
    >
      <Glyph size="100%" strokeWidth={STROKE_WIDTH[size]} aria-hidden focusable="false" />
    </span>
  );
}
```

Encoded rules. All are CONVENTION unless marked. The full contract is
[`packages/ui/AUTHORING.md`](../../packages/ui/AUTHORING.md).

- **`componentVariants()` owns every class decision.** No conditional string concatenation in JSX.
  **Never import the bare `tv`** from `tailwind-variants` (LAW-in-practice). The bare instance merges
  against Tailwind's stock scales and silently deletes token classes: `text-h1` is read as a colour
  and disappears next to `text-text-muted`. `packages/ui/src/lib/component-variants.ts` is the
  configured instance. Its spec asserts every scale list against the token build. Multi-part
  components use `componentVariants()` **slots**.
- **Only token-backed named utilities** (LAW). Three rules enforce this:
  `tailwindcss/no-arbitrary-value` bans `h-[13px]`, `tailwindcss/no-custom-classname` bans a class
  the stylesheet does not define, and `pink-paprikaa/no-arbitrary-shorthand` bans the `(--x)`
  shorthand (`h-(--button-h-sm)`) and `[prop:value]`. A value the system lacks becomes a component
  token, placed in its Tailwind namespace (`spacing.icon-md` → `size-icon-md`). Motion and stacking
  use the stylesheet's named utilities (`duration-fast`, `z-header`).
- **Surfaces come from `data-surface`, never from an `on` prop.** A component that paints a field
  sets `data-surface` itself. Text colour follows the surface.
- Extend the native element's props, spread them last, and merge `className` through the variant
  function (`icon({ size, className })`).
- **Optional props are `?: T | undefined`** (ruling R13), because `exactOptionalPropertyTypes` is on
  and compositions forward values that may be `undefined`. `Icon` predates the ruling. New code
  follows it.
- **`asChild` uses Radix Slot** (`import { Slot } from "radix-ui"`, rendered as `<Slot.Root>`), on
  the components spec §9 marks "Slot". Classes go on the component, never on the slotted child:
  Slot joins class names without tailwind-merge.
- **Lists of links take `linkAs`** (default `"a"`), so an app can pass `next/link`. The system never
  imports a router.
- **Field wiring is a render prop**: `children: (control) => ReactNode` receives the id, the
  `aria-describedby`, `aria-invalid` and `required`. It is RSC-safe and needs no context.
- **Native elements first**: `<select>`, `<input type="range|date|checkbox|radio">`,
  `<details name>`. Use Radix only where the platform has no accessible primitive (Dialog, Tabs,
  Tooltip, Toast, ToggleGroup).
- **Server-first**: `"use client"` goes only in a file that owns state, effects or browser APIs, as
  a small client leaf beside a static component (§3).
- `ref` is a plain prop (React 19), so there is **no `forwardRef`** (R-03: the reference codebase's
  `forwardRef` wrappers are obsolete boilerplate on this React version).
- **Named exports and function declarations. No default exports** (R-02), except Next.js framework
  contracts (`page.tsx`, `layout.tsx`, config files).
- No boolean render forks. When `{isX ? <A/> : <B/>}` spans whole render paths, that is two
  components or a variant.
- **Tests that read files** join paths with `join(import.meta.dirname, …)`, never
  `new URL(…, import.meta.url)` (ruling R15). Vite rewrites the `URL` form into an asset URL under
  jsdom.

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
