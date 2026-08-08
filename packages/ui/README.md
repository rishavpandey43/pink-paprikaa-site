# @pink-paprikaa-web/ui

This library was generated with [Nx](https://nx.dev).

## Running unit tests

Run `nx test @pink-paprikaa-web/ui` to execute the unit tests via [Vitest](https://vitest.dev/).

## Viewing the components

Stories live here, next to their components — Storybook itself does not. It is its own app at
`apps/storybook`, which points its `stories` globs back into this package:

```bash
pnpm nx run storybook:serve        # dev server
pnpm nx run storybook:build  # static build
```

`tailwind.css` at this package's root is not bundled by anything. It exists so ESLint's
`tailwindcss.cssConfigPath` has a real stylesheet to resolve; the Tailwind entry Storybook actually
builds is `apps/storybook/.storybook/styles.css`.
