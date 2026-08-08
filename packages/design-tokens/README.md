# Design Tokens

**Status: complete.** The full system landed in Phase 1 — 250-odd tokens across primitive,
semantic and component tiers, every value a final design decision. The two-colour Phase 0 seed is
gone, along with its `color.surface` / `color.ink` singletons (surfaces are a family of nine, ink a
ten-step warm ramp).

The single source of truth for the Pink Paprikaa brand palette, and the **only** place the brand
hex `#EE2C68` may exist in this workspace (see `pink-paprikaa/no-raw-hex` in
`@pink-paprikaa-web/eslint-config`). Tokens are authored in
[DTCG](https://tr.designtokens.org/format/) JSON (`$type` / `$value`) across three tiers and
compiled by [Style Dictionary](https://styledictionary.com) into build artifacts other packages
consume.

## Token tiers (`tokens/`)

| File                        | Tier      | Contents                                                                   |
| --------------------------- | --------- | -------------------------------------------------------------------------- |
| `color.primitive.json`      | Primitive | Pink 50–800, warm ink 0–900, four spice accents, danger, overlay/glass     |
| `color.semantic.json`       | Semantic  | `brand.*` `surface.*` `text.*` `border.*` `status.*` `heat.*`              |
| `typography.primitive.json` | Primitive | 4 families, 5 weights, the 12-step ramp + 7 fluid twins, leading, tracking |
| `spacing.primitive.json`    | Primitive | The 4px scale (step N = N × 4px) + `layout.*`                              |
| `elevation.primitive.json`  | Primitive | 6 radii, 2 strokes, 4 elevations + brand/inset/focus shadows, blur/scrim   |
| `motion.primitive.json`     | Primitive | 5 durations, 4 easings, press-scale, lift                                  |
| `breakpoint.primitive.json` | Primitive | 480 / 768 / 1024 / 1280 / 1440                                             |
| `canvas.primitive.json`     | Primitive | The 7 marketing artboard sizes, safe margins, canvas type scale            |
| `button.component.json`     | Component | Button fills, heights, padding, radius                                     |
| `field.component.json`      | Component | Input height, radius, all 5 border states                                  |
| `card.component.json`       | Component | Card fills, radii, rest/hover shadows                                      |

The type ramp is `display1` `display2` `h1` `h2` `h3` `subtitle1` `subtitle2` `body1` `body2`
`caption` `overline` `mono`; radii are numbered `1`–`6` (4/6/10/16/24/pill); shadows are
`elevation1`–`elevation4` plus the role shadows.

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

### The namespace reset

`theme.css` opens by clearing every Tailwind namespace this package replaces:

```css
@theme static {
  --color-*: initial;
  --text-*: initial;
  --font-*: initial;
  --tracking-*: initial;
  --leading-*: initial;
  --radius-*: initial;
  --shadow-*: initial;
  --ease-*: initial;
  --breakpoint-*: initial;
  /* … then every token … */
}
```

Without it, Tailwind's stock scale survives alongside ours and a wrong class silently renders the
wrong brand value instead of failing — `rounded-lg` would resolve to Tailwind's 8px rather than the
brand's 16px (`--radius-4`), and `text-lg` / `bg-red-500` would keep working despite being outside
the system. Clearing the namespace turns each into a class that does not compile, which is the
point: the design system becomes the only source of colour, type, radius, shadow and easing.

`spacing` is deliberately **not** cleared — Tailwind's `--spacing` multiplier is a 4px step,
identical to this system's scale, so the numeric utilities agree with the tokens.

`dist/` is generated and gitignored (covered by the workspace's root `dist` ignore pattern) — never
edit it or commit it.

## Package exports

```js
"@pink-paprikaa-web/design-tokens/theme.css"; // -> dist/theme.css
"@pink-paprikaa-web/design-tokens/tokens.json"; // -> dist/tokens.json
```

## Style Dictionary config notes (`sd.config.mjs`)

Two custom formats are registered: `css/tailwind-theme` (the `@theme static { ... }` block) and
`typescript/tokens-const` (the typed const). The built-in `json/flat` format is used as-is for
`tokens.json`. `static` (not plain `@theme`) is deliberate: Tailwind v4 tree-shakes any theme
variable it doesn't see referenced by a scanned utility class, which would silently drop tokens
that exist only for direct `var(--...)` consumption — confirmed by Storybook (`packages/ui`),
the first real Tailwind consumer of this file, emitting an empty theme block without it.

All three platforms use `transforms: ["attribute/cti", "name/kebab"]` — **not** the `css`/`js`
built-in `transformGroup`s. Both of those groups include a color value transform (`color/css` /
`color/hex`) that pipes every color through `tinycolor2`, which lower-cases hex strings
(`#EE2C68` → `#ee2c68`) and mutates `$value` in place. That breaks the literal-case contract
required of `dist/theme.css` (`--color-brand-primary: #EE2C68`, uppercase, exactly as authored).
`attribute/cti` + `name/kebab` give every platform consistent, collision-free kebab-case naming
without touching token values, so each format's `t.$value ?? t.value` fallback always resolves to
the value exactly as written in `tokens/*.json`.
