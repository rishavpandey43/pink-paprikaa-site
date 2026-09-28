# Authoring contract — `@pink-paprikaa-web/ui`

This contract binds every component in this package. Read it before you write one. It sets how a
component is written. What it must do comes from the spec
(`docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md`, §8–§11). Every cross-plan
name, prop and type is fixed by the contracts file
(`docs/superpowers/plans/2026-09-27-ds-00-contracts.md`). Examples come from the real `Icon` and
`Logo`.

**LAW** means a gate fails. Everything else is CONVENTION, checked in review.

## 1. Sources: read these first

For a component `<Name>` in tier `<tier>` (`atoms`, `molecules`, `organisms`, `layouts`), read all
four files in `zip-files/Pink Paprikaa Design System/components/<tier>/`:

| File               | Gives you                                                                                                      |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| `<Name>.d.ts`      | The props contract, translated per §4 below                                                                    |
| `<Name>.jsx`       | Reference behaviour only. Never copy it: it has inline styles, JS hover, `window` checks and icons from a CDN. |
| `<Name>.card.html` | Every variant, size, tone and state. The stories must reproduce each row (§11).                                |
| `<Name>.prompt.md` | Usage guidance. It becomes the story's docs description.                                                       |

Then read the component's row in spec §9 and its entry in the contracts file. If the contract
contradicts the design-system files, record it in your plan's "Contract deviations". Never deviate
silently.

## 2. File set and placement

```
packages/ui/src/<layer>/<kebab-name>/
  <kebab-name>.tsx           the component (one primary export)
  <kebab-name>.test.tsx      behaviour + axe
  <kebab-name>.stories.tsx   card parity
```

- **Layers** run `atoms → molecules → organisms → layouts`. The lint (LAW,
  `tools/eslint-config/atomic-layering.js`) bans every file in a layer (component, test or story)
  from importing a layer above it, and from importing the package barrel by any spelling (`..`,
  `../..`, `../../`, `../../index`, `../../index.ts`): import the component's own file instead.
- **Atoms.** The lint (LAW) also bans an atom file from importing any atom but Icon, directly
  (`../text/text`) or by the roundabout path (`../../atoms/text/text`). Anything else passes, so
  `../../lib/*`, `../../assets/*`, `../../styles.css` and `../../../vitest.setup` all lint clean
  (`tools/eslint-config/atomic-layering.test.mjs` pins each case). The CONVENTION is narrower: an
  atom imports only `../icon/*`, `../../lib/*`, `../../../vitest.setup`, its own folder and
  packages. A story never composes another atom: it uses plain elements with token classes.
- **`src/lib/`** holds library internals. It is not a layer. Today it has the variant builder
  (`component-variants.ts`), the brand artwork (`brand-artwork.ts`, `brand-artwork.css`) and the
  reveal observer (`reveal-observer.tsx`).
- File names are kebab-case, with one primary export per file. Compound parts (`Table*`) may share
  a file. `src/index.ts` is the package's only barrel (§12).

## 3. Canonical shape

`src/atoms/icon/icon.tsx`, condensed:

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
  label?: string | undefined;
}

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

- **`componentVariants` only. Never the bare `tv`** from `tailwind-variants`. The configured
  builder teaches tailwind-merge the token scales. Without it, `text-h1` next to `text-text-muted`
  is read as two colours and one is deleted (`component-variants.spec.ts` pins this). Multi-part
  components use `slots`.
- **Native props:** extend `ComponentProps<"el">`, with `Omit` for keys you replace. Spread
  `...props` last on the root. Pass `className` into the variant function
  (`icon({ size, className })`), so a consumer's class replaces yours. Never concatenate class
  strings.
- **React 19:** `ref` is a prop, so no `forwardRef`. Use named function exports. No default
  exports (LAW).
- **Optional props are `?: T | undefined`** (ruling R13). Where the contracts file or a
  design-system `.d.ts` writes `label?: string`, implement it as `label?: string | undefined`.
  `exactOptionalPropertyTypes` is on, and a composition must be able to forward a value that may be
  `undefined`. Every optional prop in the package follows R13. The one exception is
  `IconComponent`'s `size`: it mirrors lucide-react's own `size?: string | number`, and widening it
  would stop every lucide icon being assignable to it.
- **Booleans** read as questions: `is*`, `has*`, `should*`, `can*`. For variables this is LAW
  (naming-convention at `error`). For props it is the §4 table.
- **Variant props** come from `VariantProps<typeof x>` (as in `Icon` and `Logo`), or are spelled
  out as a union where the contract does so. Both reach the Storybook props table: the built
  `Icon` table lists `icon`, `label` and `size`.
- **`asChild`** goes on the components whose spec row says "Slot". Import it with
  `import { Slot } from "radix-ui"` and write
  `const Component: ElementType = asChild ? Slot.Root : "button"`. Pass injected glyphs through
  `<Slot.Slottable child={children}>{(content) => …}</Slot.Slottable>`
  (`@radix-ui/react-slot` 1.3.3). Slot merges every prop onto the child (child values win,
  handlers chain, `style` and `className` combine), so when `asChild` is set, do not pass `type` or
  `disabled`: an `<a>` has neither. Use `aria-disabled` there.
- **Slot class rule:** put classes on the component, never on the slotted child. Slot joins the
  child's `className` onto yours with a plain space, not tailwind-merge. So
  `<Card asChild><a className="rounded-xl">` would ship both radii. Write
  `<Button asChild className="…"><a href="…" /></Button>`.
- **Link lists:** a component that renders a list of links takes `linkAs?: LinkAs`, default `"a"`,
  so an app can pass `next/link`. The type is contracts §1 `lib/link-as.ts`, created by Plan 2a
  Task 1.
- **Field wiring uses a render prop.** `Field`'s `children` is `(control) => ReactNode` and receives
  `{ id, "aria-describedby", "aria-invalid", required }`. It is RSC-safe and needs no context (spec
  §9.2; lands in Plan 3a).
- **Native elements first** (D7): `<select>`, `<input type="range|date|checkbox|radio">`,
  `<details name>`. Use Radix only for Dialog/Sheet, Tabs, Tooltip, Toast and ToggleGroup, plus
  Slot.
- Titled components take `headingLevel`. Organisms take `ReactNode` slots (`actions`, `media`, …),
  never navigation callbacks. No boolean render forks: two render paths are two components or a
  variant.

## 4. Translating a design-system `.d.ts` (spec §8.2, verbatim)

| Design system prop pattern                                                                                                                                                                                                                                                                     | This system                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `icon?: string` (Lucide name)                                                                                                                                                                                                                                                                  | `icon?: IconComponent` (a `lucide-react` icon or a brand glyph)                                                                                                                                                                                                                                                                                                    |
| `style?: CSSProperties`                                                                                                                                                                                                                                                                        | `className?: string` (+ native props)                                                                                                                                                                                                                                                                                                                              |
| `on?: "light" \| "brand"`                                                                                                                                                                                                                                                                      | removed — surface-aware via `data-surface` (D5)                                                                                                                                                                                                                                                                                                                    |
| `base?: string` (asset folder)                                                                                                                                                                                                                                                                 | removed — artwork is inlined (7.1)                                                                                                                                                                                                                                                                                                                                 |
| boolean `fullWidth`, `loading`, `selected`, `interactive`, `pulse`, `ring`, `divider`, `chevron`, `danger`, `nowrap`, `scroll`, `bleed`, `bare`, `fit`, `safeArea`, `showLabel`, `showValue`, `multiple`, `copyable`, `wrap`, `circle`, `symbol`, `fluid`, `multiline`, `optional`, `required` | `isFullWidth`, `isLoading`, `isSelected`, `isInteractive`, `isPulsing`, `hasRing`, `hasDivider`, `hasChevron`, `isDanger`, `isNowrap`, `isScrollable`, `isBleed`, `isBare`, `isFit`, `hasSafeArea`, `hasLabel`, `hasValue`, `isMultiple`, `isCopyable`, `isWrapping`, `variant="circle"`, `variant="symbol"`, `isFluid`, `isMultiline`, `isOptional`, `isRequired` |
| numeric px `size`/`width`/`height`/`min`/`padding`/`tile`                                                                                                                                                                                                                                      | token-backed enums (e.g. `size: "sm" \| "md" \| "lg"`, AutoGrid `min: "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl"`) — values in the component's token file                                                                                                                                                                                                       |
| free CSS strings (`radius`, `tone` colour, `measure`, `space`)                                                                                                                                                                                                                                 | token enums only                                                                                                                                                                                                                                                                                                                                                   |
| `onClick` used for navigation                                                                                                                                                                                                                                                                  | `href` / `asChild`                                                                                                                                                                                                                                                                                                                                                 |
| `onChange(value)`                                                                                                                                                                                                                                                                              | `onValueChange(value)`                                                                                                                                                                                                                                                                                                                                             |
| `open` + `onClose`                                                                                                                                                                                                                                                                             | `open` / `defaultOpen` / `onOpenChange`                                                                                                                                                                                                                                                                                                                            |
| `error?: boolean \| string` on controls                                                                                                                                                                                                                                                        | control: `status` + `aria-invalid`; message rendered by `Field`                                                                                                                                                                                                                                                                                                    |
| string-or-object option lists                                                                                                                                                                                                                                                                  | object lists only (`{ value, label }`) — strings are not control flow                                                                                                                                                                                                                                                                                              |

Every other prop keeps its design-system name and meaning.

## 5. Tokens first

A value the token build does not have becomes a **component token** before any component uses it,
in `packages/design-tokens/tokens/component/<name>.json`. File it under the Tailwind namespace of
its kind, so it compiles to a named utility:

| Kind                                                                  | Top-level key | Utility                                          | In the tree                                           |
| --------------------------------------------------------------------- | ------------- | ------------------------------------------------ | ----------------------------------------------------- |
| Size (control height, glyph box, width)                               | `spacing`     | `h-button-h-md`, `size-icon-md`, `w-logo-lockup` | `icon.json` → `size-icon-*`; `logo.json` → `w-logo-*` |
| Font size (typography composite: size, line height, tracking, weight) | `text`        | `text-button-md` (sets all four)                 | —                                                     |
| Colour                                                                | `color`       | `bg-button-primary-bg`, `text-button-primary-fg` | —                                                     |
| Radius                                                                | `radius`      | `rounded-<name>`                                 | —                                                     |
| Shadow                                                                | `shadow`      | `shadow-<name>`                                  | —                                                     |

The names in the "Utility" column are illustrations, apart from the `icon` and `logo` ones, which
exist. Paddings and gaps use the 4px `--spacing` steps (`p-6`, `gap-1.5`). Only a value off that
scale becomes a token.

- A **dimension** may be a literal in its component file (`"14px"` in `icon.json`). A **colour**
  always references a primitive or semantic token (`{color.pink.600}`). A new colour starts life as
  a primitive in `tokens/primitive/color.json`. The brand hex exists once, in that file (LAW,
  `theme.spec.ts`).
- A **typography** component token must be a full composite with `"$type": "typography"` (on the
  token or its group). `declarations()` in `sd.config.mjs` emits the `--line-height`,
  `--letter-spacing` and `--font-weight` sub-properties only for that type. An alias such as
  `{text.body}` emits the size only.

  ```json
  {
    "text": {
      "$type": "typography",
      "button-md": {
        "$value": {
          "fontSize": "15px",
          "lineHeight": 1,
          "letterSpacing": "0",
          "fontWeight": "{font-weight.semibold}"
        }
      }
    }
  }
  ```

- **Register every new name** in the matching list in `src/lib/component-variants.ts`: `SPACING`,
  `TEXT`, `RADIUS`, `SHADOW` and the rest. `component-variants.spec.ts` asserts that each list
  equals the token build, so a missing name fails `ui:test` (LAW). Colours have no list, because
  tailwind-merge reads any unlisted `bg-*`/`text-*` value as a colour. An **unlisted font size** is
  the dangerous case: `text-button-md` is taken for a colour and deleted beside `text-text-body`.
- **Surface overrides:** a token that changes on a surface is overridden in
  `tokens/surface/{brand,ink,soft}.json`. It must also be restored in `tokens/surface/light.json`
  to its exact base value, so a white card inside a pink field shows dark text again (LAW,
  `theme.spec.ts`, "restores, on a light island…"). The build then emits every other surface as
  the light block plus its own overrides, so a soft card nested in a brand field gets base body
  text and focus, not brand's (`theme.spec.ts`, "declares, on every surface…").
- **Pitfall: an aliased component colour does not follow surfaces.** A component token written as a
  semantic alias (`"$value": "{color.text.link}"`) compiles to
  `--color-<name>: var(--color-text-link)` in `theme.css`, which Tailwind emits on `:root`. A custom
  property resolves where it is declared, so the component token keeps the root's link colour inside
  `data-surface="brand"`. If it must change on a surface, override the component token itself in
  `tokens/surface/{brand,ink,soft}.json` and restore it in `light.json`. The contrast gate catches a
  miss only if that pair is listed in `contrast-pairs.json`.
- **New text/background pairs** go in `packages/design-tokens/contrast-pairs.json`. Each group has a
  `surface`, either `foregrounds` × `backgrounds` or explicit `pairs`, an optional `backdrop`, and
  `min: 4.5`. `min: 3` is allowed only with `exception: "brand-fill"` (white on the brand pink).
  `policy.spec.ts` measures every pair (LAW). A component that paints a new pair is not done until
  the pair is listed.
- Rebuild with `pnpm nx build design-tokens` and find your `--…` property in `dist/theme.css`.

## 6. No arbitrary values; named utilities; the brand mark

- **Only token-backed utilities** (LAW, `pnpm nx lint ui`). Four rules enforce it:
  - `tailwindcss/no-arbitrary-value` rejects `h-[13px]` and `bg-[#…]`.
  - `tailwindcss/no-custom-classname` rejects any class the stylesheet does not define. The token
    build clears Tailwind's stock scales, so `text-sm`, `shadow-md` and `bg-red-500` are rejected
    too.
  - `pink-paprikaa/no-arbitrary-shorthand` rejects `w-(--x)`, `text-(length:--fs)` and
    `[mask-type:alpha]`.
  - `pink-paprikaa/no-raw-hex` rejects any hex literal.
- **In `compoundVariants` and `compoundSlots`, write classes under `class`, never `className`.**
  The tailwindcss plugin lists both keys in its default `ignoredKeys`. Inside them it checks only
  the `class` property, so `className: "h-[13px] bg-red-500"` there passes lint (probed).
- **Named utilities** (`src/styles.css`) cover what Tailwind has no token utility for:
  - motion: `duration-instant|fast|base|slow|page`, `active:press-scale`, `hover:lift`,
    `transition-control` (pill controls)
  - pattern: `pattern-tile-56|64|72|80|86|96`, `pattern-opacity-default|light|faint`
  - stacking: `z-raised|sticky|header|dock|overlay|toast|tooltip`
  - layout: `container-page`, `section-y`, `autogrid`, `autogrid-wide`, `cluster`
  - imagery: `scrim-bottom`, `scrim-top`
  - animation: `animate-skeleton|mark-pulse|spin-pulse|dot-pulse|rotate|sheet-in|toast-pop`
  - easing is a token namespace: `ease-out`, `ease-in-out`, `ease-entrance`, `ease-pop`
- **Class order** belongs to Prettier (`prettier-plugin-tailwindcss`), including inside
  `componentVariants(…)`. Do not hand-sort. Run `pnpm exec prettier --write <your files>` before
  the gates.
- **Never `max-w-prose`.** Tailwind's built-in `max-w-prose` is a static `65ch` and wins over the
  system's `--container-prose` (`64ch`), so it lints clean and renders the wrong measure (compiled
  against `tailwindcss@4.3.3`). Use `max-w-text-measure-prose`, the `text-measure-prose` spacing
  token over `--container-prose`, which Plan 2a Task 2 adds.
- **Field text is 16px** (ruling R21). Text-entry controls render their value at `text-body`
  (16px), because iOS zooms the page when a focused field is smaller.
- **The brand symbol** is painted only by the `mask-symbol` utility or `var(--pp-symbol-mask)`.
  Both are defined once, in `src/lib/brand-artwork.css`. Never inline the symbol's SVG per instance
  (rulings R19/R25): the symbol's markup is ~3.5 KB, and it would ship once per diamond on a menu
  page.
- **Logo is sized with classes only.** `LogoProps` omits `width` and `height` (and `children` and
  `dangerouslySetInnerHTML`: the root renders the artwork). Its defaults are `w-logo-*`. A
  consumer passes `className="w-50"`, or `className="h-12 w-auto"` in a header. Each instance gets
  its own ids (`useId`), so two logos never share a `clip-path`.
- **The artwork is generated.** `pnpm nx run ui:brand-artwork` compiles `src/assets/brand/*-pink.svg`
  into `src/lib/brand-artwork.{ts,css}` (svgo, path precision 2). Never hand-edit the outputs.
  Regenerate them, run `pnpm exec prettier --write packages/ui/src/lib/brand-artwork.*` (the
  generator writes unformatted output), and commit.

## 7. Surfaces

- **Never add an `on` prop.** A surface is CSS: `data-surface="brand|ink|soft|light"` remaps the
  semantic and component tokens inside it (`packages/design-tokens/dist/surfaces.css`). Text colour
  follows the surface, never the component. `Icon`'s `OnInk` story shows this: the icons turn
  white with no prop.
- **A component that paints a field sets `data-surface` itself.** The spec §8.1 list: Card, Section,
  PatternField, SiteFooter, CtaBand, StatBand, HeroBanner, QuotePanel, PostFrame and flooded
  PricingCard. A white-filled component (Card `default`, form controls) sets `data-surface="light"`.
  That is the light island.

**Skins on surfaces.** A skin with its own fill (white Tag, inverse Button, soft Badge) uses fixed
primitives, so it looks the same on every field. A transparent or text-only skin (ghost, link,
divider, outline) paints with semantic tokens, which follow `data-surface` for free. Only a flip no
semantic token describes (primary Button on pink → white) gets a component colour token, overridden
in `surface/{brand,ink}.json` and restored in `surface/light.json`. A component token never aliases a
semantic token a surface overrides — the alias resolves once, at `:root`
(`packages/design-tokens/src/surface-aliases.spec.ts` fails the build).

## 8. Server-first

- Add `"use client"` only to a file that owns state, effects, refs or browser APIs. Keep that file
  as small as possible: a static component plus a tiny client leaf file. `RevealObserver` is the
  only client file today. `Logo` calls `useId` and stays a server component.
- Hover, press and focus are CSS. No `window` or `document` during render. Responsiveness comes
  from media or container queries on the token breakpoints.

## 9. Accessibility checklist (spec §5.5)

- [ ] Semantic HTML first. Use a native element when one exists.
- [ ] Keyboard-operable, with visible focus. The base layer draws a 2px `--color-focus` outline at
      a 2px offset. Fields use the 3px focus ring (`shadow-focus-ring`).
- [ ] Touch targets are at least 44px (`min-h-hit`), except the system's 36/38px controls, which
      are still at least 24px.
- [ ] Accessible names are required by type (`IconButton.label: string`). A glyph is either named
      (`Icon` `label` → `role="img"`) or hidden (`aria-hidden`).
- [ ] Status is never shown by colour alone: pair it with a message and a glyph.
- [ ] Reduced motion is handled globally in the base layer. A fade always pairs with an 8–12px
      translate.
- [ ] Titled components take `headingLevel`.
- [ ] Contrast is owned by the token policy (§5). axe `color-contrast` is off in tests and stories.

## 10. Tests

- Put `<name>.test.tsx` beside the component. Use Testing Library and query by role and label.
  Test each variant's observable effect. If a variant's only effect is a token class (`Icon`
  `size` → `size-icon-*`), assert that class. Cover the keyboard paths of interactive components
  with `@testing-library/user-event`.
- End with `await expectNoA11yViolations(container)`, imported from `../../../vitest.setup`, on the
  default state and on the most complex one. It runs every axe rule except `color-contrast`.
- **File paths:** use `join(import.meta.dirname, …)`, never `new URL(…, import.meta.url)`
  (ruling R15). Under jsdom, Vite rewrites the `URL` form into an `http://localhost` asset URL.
- `vitest.setup.ts` stubs `IntersectionObserver`, `ResizeObserver` and `matchMedia` where jsdom
  lacks them. A test that drives one replaces it.

## 11. Stories

- Put `<name>.stories.tsx` beside the component. Use `title: "<Tier>/<Name>"` (`"Atoms/Icon"`) and
  `satisfies Meta<typeof X>`.
- **Card parity:** each `.card.html` row gets a story. Label every specimen with the prop that
  produces it (`Logo`'s `Specimen` cells), and name the row in a doc comment.
- A **`Playground`** story, driven by controls.
- An **`OnSurfaces`** story for surface-aware components: page, alt, brand, ink, soft.
- **`play` functions** for client components, covering keyboard and pointer.
- The **docs description** is the `.prompt.md`, in `parameters.docs.description.component`. Keep
  it verbatim where it is guidance; adjust it where §4 renamed a prop.
- `pnpm nx test storybook` runs every story in Chromium. An axe violation fails the story, except
  `color-contrast`. Story-only classes are fine: the library stylesheet does not scan stories, and
  Storybook scans them itself (`apps/storybook/.storybook/styles.css`).

## 12. Export, then the gates

- Export the component, its `Props` type and any exported helper by name from `src/index.ts`. Use
  named re-exports only.
- A component is done when these pass, with the output pasted:

```bash
pnpm exec prettier --write <your files>
pnpm nx test ui && pnpm nx lint ui && pnpm nx run storybook:build
pnpm nx test storybook        # every story in Chromium: render, play, axe
pnpm nx test design-tokens    # when you touched tokens or contrast-pairs.json
pnpm verify
```
