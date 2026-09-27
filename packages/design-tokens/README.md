# Design Tokens

The single source of every visual value in the Pink Paprikaa design system — colour, type, space,
shape, elevation, motion, layout. Tokens are authored in [DTCG](https://tr.designtokens.org/format/)
JSON and compiled by Style Dictionary 5 into CSS that Tailwind v4 and the component library read.

**The one-hex rule.** The brand pink `#EE2C68` exists once in the workspace: `color.pink.500` in
`tokens/primitive/color.json`. Everything else references the token. `pink-paprikaa/no-raw-hex`
fails lint on a literal hex in source, and `theme.spec.ts` scans every token source file (all four
tiers) and fails if the hex is written more than once.

## Tiers (`tokens/`)

| Folder       | Tier      | What lives there                                                                                                                                                                                                                         |
| ------------ | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `primitive/` | Primitive | Raw values — the only place a colour literal may exist. Colour ramps, type, space, radius, shadow, motion, breakpoints, canvas, pattern, z-index.                                                                                        |
| `semantic/`  | Semantic  | Roles that reference primitives: `color.surface.*`, `color.text.*`, `color.border.*`, `color.status.*`, `color.heat.*`, the focus ring (a composite: its `3px` spread is a literal, its colour a reference).                             |
| `component/` | Component | One file per component for values that are not a step of a base scale: `icon.json` (`size-icon-*`), `logo.json` (`w-logo-*`). A dimension may be a px literal here (`"14px"`); a colour always references a primitive or semantic token. |
| `surface/`   | Surface   | `brand`, `ink`, `soft`, `light`: overrides of semantic and component tokens for a scope.                                                                                                                                                 |

Every leaf is `{ "$value": … }`; `$type` is set on the group and inherited. Values are CSS-ready
strings; typography is the one composite (`fontSize`, `lineHeight`, `letterSpacing`, `fontWeight`).

## Outputs (`dist/`, generated, gitignored)

| File           | Content                                                                                                                                                                                             | Consumer                          |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `theme.css`    | One `@theme static { … }` block: `--<ns>-*: initial` resets for every Tailwind namespace the system owns, then every primitive, semantic and component token. Pure aliases stay `var()` references. | `packages/ui/src/styles.css`      |
| `surfaces.css` | `[data-surface="…"], .pp-on-… { … }` blocks that redefine semantic tokens for each surface.                                                                                                         | `packages/ui/src/styles.css`      |
| `tokens.json`  | Flat catalogue: `{ name, cssVar, path, value, reference, type, tier, surface, description }`.                                                                                                       | Storybook foundation pages; tests |

Package exports: `./theme.css`, `./surfaces.css`, `./tokens.json`, and `./contrast` (the WCAG maths:
`parseColor`, `composite`, `relativeLuminance`, `contrastRatio`).

The namespace resets delete Tailwind's stock scales, so a class outside the system (`bg-red-500`,
Tailwind's 8px `rounded-lg`, `shadow-md`) compiles to nothing instead of rendering a near-miss.
`static` keeps tokens that no scanned class references — surfaces and component CSS read them
through `var()`. `spacing` is not reset: its multiplier is set to the system's 4px unit.

## Name mapping

A token's CSS name is its path joined by `-`: `color.text.muted` → `--color-text-muted` →
`text-text-muted`. Two exceptions:

- `spacing.unit` → `--spacing` (Tailwind's multiplier; `p-6` = 24px, no per-step variables).
- A typography composite → `--text-<step>` plus `--text-<step>--line-height`,
  `--text-<step>--letter-spacing` and `--text-<step>--font-weight`, so `text-h2` sets all four.

| Design system                                            | CSS custom property                                                          | Utility                              |
| -------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------ |
| `--pink-50 … --pink-800`                                 | `--color-pink-50 … -800`                                                     | `bg-pink-500`                        |
| `--ink-000 … --ink-900`                                  | `--color-ink-000 … -900`                                                     | `bg-ink-900`                         |
| `--turmeric(-soft)` (tandoor, mint, kesar alike)         | `--color-turmeric(-soft)`; plus `-strong` text shades                        | `bg-mint-soft`, `text-mint-strong`   |
| `--surface-*`, `--text-*`, `--border-*` colours          | `--color-surface-*`, `--color-text-*`, `--color-border-*`                    | `bg-surface-card`, `text-text-muted` |
| `--brand-hover/active`, `--status-*`, `--heat-1…4`       | `--color-brand-*`, `--color-status-*`, `--color-heat-*`                      | `hover:bg-brand-hover`               |
| `--focus-ring(-inverse)`                                 | `--shadow-focus-ring(-inverse)`                                              | `focus-visible:shadow-focus-ring`    |
| `--font-*`, `--weight-*`                                 | `--font-*`, `--font-weight-*`                                                | `font-display`, `font-black`         |
| `--fs-X`, `--lh-X`, `--ls-X`                             | `--text-X` + sub-properties (and `-fluid` twins)                             | `text-h2`, `text-h1-fluid`           |
| `--space-N`                                              | `--spacing: 4px`                                                             | `p-6`, `gap-1.5`                     |
| `--gutter-*`, `--section-y-*`, `--header-h`, `--hit-min` | `--spacing-gutter`, `--spacing-section`, `--spacing-header`, `--spacing-hit` | `px-gutter`, `min-h-hit`             |
| `--container-max`, `--measure-prose`                     | `--container-content`, `--container-prose`                                   | `max-w-content`                      |
| `--bp-*`, `--radius-*`, `--shadow-*`                     | `--breakpoint-*`, `--radius-*`, `--shadow-*`                                 | `md:`, `rounded-lg`, `shadow-3`      |
| `--dur-*`, `--ease-*`, `--press-scale`                   | `--duration-*`, `--ease-*`, `--motion-*`                                     | `ease-pop`                           |
| `--scrim-*`, `--blur-glass`                              | `--effect-scrim-*`, `--blur-glass`                                           | `backdrop-blur-glass`                |
| canvas, pattern, stacking                                | `--canvas-*`, `--pattern-*`, `--z-*`                                         | component tokens                     |

`text-text-muted` (colour) versus `text-body` (size) is deliberate: the design system's `--text-*`
colours collide with Tailwind's `--text-*` font sizes, and the `color-` prefix keeps both traceable.

## Surfaces

Put `data-surface="brand"` (or the class `.pp-on-brand`) on a section and every semantic token
inside it retargets: text turns white, borders turn translucent white, the focus ring inverts. The
four surfaces are `brand`, `ink`, `soft` and `light`. Each block also sets
`color: var(--color-text-body)` so inherited text follows.

Only semantic and component tokens are overridden, never primitives. A custom property resolves
where it is declared, so `--color-text-body: var(--color-ink-800)` declared on `:root` is already
resolved by the time a surface redefines `--color-ink-800`; redefining the semantic token on the
surface element is what cascades.

`light` is the **light island**: it restores every token the other surfaces override, to its exact
base value, so a white card inside a pink panel inside an ink section shows dark text again.
`theme.spec.ts` enforces that — a new override on `brand`, `ink` or `soft` fails the build until
`surface/light.json` restores it.

## Contrast policy

`contrast-pairs.json` lists every text/background pair the components paint, in groups: a surface
(or `null` for the page), foregrounds × backgrounds or explicit pairs, an optional translucent
`backdrop`, and a minimum ratio. `policy.spec.ts` resolves each token on its surface from
`dist/tokens.json` and measures it with the WCAG 2.x formula.

- The minimum is **4.5:1** (WCAG AA).
- The single exception is `"brand-fill"`: white on the brand pink measures 4.04:1 and is held to
  the **AA-large floor, 3:1**. The policy test rejects any other group below 4.5, and any
  brand-fill group whose ground is not the brand pink.
- To add a pair, add it to a group (or a new group) and run the tests. A component that paints a
  new pair is not done until its pair is here.

**Change text tokens, never fills.** When a pair fails, move the text token to a passing ramp step
(as `color.text.brand` moved from pink-500 to pink-600). The brand fills are the brand; a fill
never moves to satisfy a ratio.

## Commands

```bash
pnpm nx build @pink-paprikaa-web/design-tokens   # style-dictionary build → dist/
pnpm nx test @pink-paprikaa-web/design-tokens    # builds first, then contrast, policy, theme suites
```
