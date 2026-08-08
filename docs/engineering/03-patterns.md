# 03 — Canonical Patterns

Copy these shapes. Each is the **one** way its problem is solved here; deviations go through the
decision log first. Excerpts are canonical — if the codebase outgrows one, update it in the same
PR (trust the code, fix the doc).

## 1. Component (the base form)

```tsx
// packages/ui/src/atoms/button/button.tsx — the reference shape
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

Encoded rules — all CONVENTION unless marked:

- `tv()` owns every class decision; no conditional string concatenation in JSX.
- Extend native element props; spread last; `className` merges through `tv()`.
- `ref` is a plain prop (React 19) — **no `forwardRef`** (R-03: the reference codebase's
  `forwardRef` wrappers are obsolete boilerplate on this React version).
- **Named exports, function declarations. No default exports** (R-02) — except Next.js
  framework contracts (`page.tsx`, `layout.tsx`, config files).
- No boolean render forks — `{isX ? <A/> : <B/>}` spanning whole render paths means two
  components or a variant.
- Behavioural complexity (dialog, menu, tabs, focus, keyboard) → Radix primitives, never
  hand-rolled (LAW-in-practice: a11y gates will fail you anyway).
- Multi-part components use `tv()` **slots** (the reason tailwind-variants was chosen over CVA).

## 2. Component file set

```
packages/ui/src/<layer>/<name>/
  <name>.tsx           # the component (one primary export)
  <name>.test.tsx      # behaviour + axe (mandatory pair)
  <name>.stories.tsx   # every variant (mandatory in ui)
```

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
