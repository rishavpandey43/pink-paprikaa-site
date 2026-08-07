# Design Tokens

The single source of truth for the Pink Paprikaa brand palette, and the **only** place the brand
hex `#EE2C68` may exist in this workspace (see `pink-paprikaa/no-raw-hex` in
`@pink-paprikaa-web/eslint-config`). Tokens are authored in
[DTCG](https://tr.designtokens.org/format/) JSON (`$type` / `$value`) across three tiers and
compiled by [Style Dictionary](https://styledictionary.com) into build artifacts other packages
consume.

## Token tiers (`tokens/`)

| File                    | Tier      | Contents                                                                                   |
| ----------------------- | --------- | ------------------------------------------------------------------------------------------ |
| `color.primitive.json`  | Primitive | Raw palette values (`color.pink.500`, etc.) — the only file with a literal hex             |
| `color.semantic.json`   | Semantic  | Brand/UI roles that alias primitives (`color.brand.primary`, `color.surface`, `color.ink`) |
| `button.component.json` | Component | Button-specific roles that alias semantic tokens                                           |

## Build

```bash
pnpm nx build design-tokens
```

Runs `style-dictionary build --config sd.config.mjs`, cached by Nx (`inputs`: `tokens/**/*` +
`sd.config.mjs`; `outputs`: `dist/`). Produces:

- **`dist/theme.css`** — a Tailwind v4 `@theme` block. CSS custom property names are a contract
  consumed by later tasks' Tailwind utilities: `--color-brand-primary` → `bg-brand-primary`,
  `--color-brand-primary-hover` → `hover:bg-brand-primary-hover`, `--color-surface` →
  `text-surface`, `--color-ink` → `text-ink`.
- **`dist/tokens.ts`** — a typed `tokens` const (kebab-case keys) for use in TS/JS.
- **`dist/tokens.json`** — the flat token map as plain JSON.

`dist/` is generated and gitignored (covered by the workspace's root `dist` ignore pattern) — never
edit it or commit it.

## Package exports

```js
"@pink-paprikaa-web/design-tokens/theme.css"; // -> dist/theme.css
"@pink-paprikaa-web/design-tokens/tokens.json"; // -> dist/tokens.json
```

## Style Dictionary config notes (`sd.config.mjs`)

Two custom formats are registered: `css/tailwind-theme` (the `@theme` block) and
`typescript/tokens-const` (the typed const). The built-in `json/flat` format is used as-is for
`tokens.json`.

All three platforms use `transforms: ["attribute/cti", "name/kebab"]` — **not** the `css`/`js`
built-in `transformGroup`s. Both of those groups include a color value transform (`color/css` /
`color/hex`) that pipes every color through `tinycolor2`, which lower-cases hex strings
(`#EE2C68` → `#ee2c68`) and mutates `$value` in place. That breaks the literal-case contract
required of `dist/theme.css` (`--color-brand-primary: #EE2C68`, uppercase, exactly as authored).
`attribute/cti` + `name/kebab` give every platform consistent, collision-free kebab-case naming
without touching token values, so each format's `t.$value ?? t.value` fallback always resolves to
the value exactly as written in `tokens/*.json`.
