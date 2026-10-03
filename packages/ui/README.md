# @pink-paprikaa-web/ui

The Pink Paprikaa design system: 90 React 19 components — 30 atoms, 38 molecules, 15 organisms
(including CartPanel), 7 layouts — token-driven and server-first. How to author one:
[`AUTHORING.md`](AUTHORING.md) (binding).

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
