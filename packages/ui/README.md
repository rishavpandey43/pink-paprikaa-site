# @pink-paprikaa-web/ui

The Pink Paprikaa design system: token-driven React 19 components (atoms → molecules → organisms →
layouts), server-first, styled only with the token classes that `@pink-paprikaa-web/design-tokens`
emits into Tailwind v4.

**Writing a component?** Start with [`AUTHORING.md`](AUTHORING.md). It is the binding contract:
sources, file set, canonical shape, tokens, surfaces, tests, stories and gates.

## Consuming it

The package ships TypeScript source: `exports` point at `src/index.ts` and `src/styles.css`, and
nothing is prebuilt. A consumer needs two things.

1. **Two CSS imports**, in its Tailwind entry, in this order:

   ```css
   @import "tailwindcss";
   @import "@pink-paprikaa-web/ui/styles.css";
   ```

   `styles.css` brings the tokens (`theme.css`), the surface remaps (`surfaces.css`), the base
   layer, the named utilities, the animations and the brand symbol mask. It scans its own sources,
   so a consumer never adds an `@source` for the library. `apps/storybook/.storybook/styles.css`
   is the working example.

2. **In a Next.js app**, add `transpilePackages: ["@pink-paprikaa-web/ui"]` to `next.config`, so
   Next compiles the package's TypeScript. No app consumes the library yet; the web app adds it in
   step 2 of the rewrite.

Then import by name from the one barrel:

```tsx
import { Icon, Logo } from "@pink-paprikaa-web/ui";
```

## Commands

```bash
pnpm nx test ui                  # Vitest + Testing Library + axe (jsdom)
pnpm nx lint ui                  # token-only classes, atomic layering, naming
pnpm nx typecheck ui
pnpm nx run ui:brand-artwork     # regenerate src/lib/brand-artwork.{ts,css} from src/assets/brand
pnpm nx run storybook:serve      # the stories, on localhost:6006
pnpm nx test storybook           # every story as a test in Chromium
```

Stories live here, next to their components. Storybook itself is its own app, `apps/storybook`,
whose `stories` globs reach into this package.

`tailwind.css` at this package's root is not bundled by anything. It exists so that ESLint's
`tailwindcss.cssConfigPath` and Prettier's `tailwindStylesheet` have a real stylesheet to read the
theme from.
