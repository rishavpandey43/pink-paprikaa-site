# Authoring components in `@pink-paprikaa-web/ui`

The binding contract for every component in this package. It is narrower than the engineering
handbook on purpose: the handbook says how code is written across the workspace, this says how a
design-system component is written here. Where a design reference in
`design_handoff_pink_paprikaa_ds/` and this file disagree, **this file wins** — the references are
browser prototypes (inline styles, raw `var()`, no types, no tests), not a target to copy.

Read `src/atoms/button/button.tsx`, `src/atoms/text/text.tsx` and `src/atoms/icon/icon.tsx` first.
They are the canonical shapes; everything below is the rule they encode.

---

## 1. The file trio

```
src/<layer>/<name>/            # layer ∈ atoms | molecules | organisms | templates
  <name>.tsx                   # the component — one primary export, named
  <name>.test.tsx              # behaviour + a11y (mandatory)
  <name>.stories.tsx           # every variant (mandatory)
```

`<name>` is kebab-case and matches the component: `menu-item-card/menu-item-card.tsx` exports
`MenuItemCard`. No `index.ts` inside a component folder — the package barrel `src/index.ts` is the
only re-export point.

## 2. The component shape

```tsx
import { componentVariants, type VariantProps } from "../../lib/component-variants";

const badge = componentVariants({
  base: "inline-flex items-center rounded-6 font-display",
  variants: {
    tone: { brand: "bg-brand-soft text-text-brand", neutral: "bg-surface-sunken text-text-body" },
    size: { sm: "h-7 px-2 text-caption", md: "h-9 px-3 text-body2" },
  },
  defaultVariants: { tone: "brand", size: "md" },
});

export interface BadgeProps extends ComponentPropsWithoutRef<"span">, VariantProps<typeof badge> {
  /** Every public prop carries a sentence saying when to reach for it. */
  icon?: LucideIcon;
}

export function Badge({ className, tone, size, icon, children, ...props }: BadgeProps) {
  return (
    <span className={badge({ tone, size, className })} {...props}>
      {children}
    </span>
  );
}
```

Non-negotiable:

- **`componentVariants` owns every class decision.** No conditional string concatenation, no
  `clsx`, no inline `style` for anything a token can express. Import it from
  `../../lib/component-variants` — never `tv` from `tailwind-variants` (that instance merges
  against stock Tailwind scales and silently drops our token classes).
- **Named exports, function declarations.** No default exports, no `React.FC`.
- **No `forwardRef`.** React 19 passes `ref` as a plain prop; add `ref?: Ref<HTMLElement>` to the
  props type only when a consumer genuinely needs the node.
- **Extend the native element props** (`ComponentPropsWithoutRef<"button">`), spread them last, and
  let `className` merge through the variant call. A caller must always be able to override.
- **Multi-part components use `slots`** (the reason `tailwind-variants` was chosen).
- **Behaviour is Radix, never hand-rolled.** Dialog, tabs, accordion, tooltip, switch, checkbox,
  radio, select, popover, progress, separator, avatar — `import { Dialog } from "radix-ui"` and
  style the parts. Hand-rolling focus traps or keyboard handling fails the a11y gate.
- **`"use client"`** goes on the smallest leaf that owns interactivity — any component with
  `useState`, an event handler, or a Radix behavioural primitive. Static presentation gets none.
- **Props types are exported** beside the component and named `<Name>Props`.
- **Booleans read as questions**: `isLoading`, `hasDivider`, `canOrder` — lint enforces the prefix.
- Files stay under 500 lines (lint warns). A component past it wants splitting.

## 2b. The prop vocabulary — identical props, predictable API

A design system is only predictable if the same idea has the same prop name everywhere. Reach for
these names in this order; **do not invent a new one** for an idea already covered.

| Prop      | Means                                                                 | Values                                                              |
| --------- | --------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `variant` | **The primary appearance axis.** Always the first prop to reach for.  | Component-specific: `primary` `secondary` `ghost` `brand` `muted` … |
| `size`    | The size step                                                         | `xs` `sm` `md` `lg` `xl` — a subset is fine                         |
| `tone`    | A semantic **colour** axis that is genuinely independent of `variant` | `brand` `muted` `subtle` `danger` `onBrand` `inverse` `current`     |
| `status`  | The shared **form validation** system, and nothing else               | `default` `error` `success` `warning` `loading`                     |
| `align`   | Text or content alignment                                             | `left` `center` `right`                                             |

**`variant` is the default choice.** A component with one appearance axis calls it `variant` —
never `mark`, `shape`, `state`, `frame`, `format`, `type` or `layout`. `tone` is a _second_ axis,
legal only when a component has both (`Text` has `variant` for the ramp step **and** `tone` for
colour). `status` is reserved for form controls sharing `Field`'s system.

**Booleans are always `is` / `has` prefixed** — `isFullWidth`, `isFluid`, `hasDivider`. Never a bare
`fullWidth`, `nowrap` or `scroll`. The same idea keeps the same name across components: it is
`isFullWidth` everywhere, not `fullWidth` in one place and `isFullWidth` in another.

**Every variant gets a `defaultVariants` entry.** A component must render correctly with no props at
all — `<Spinner />`, `<Button>Order Now</Button>`, `<Text>…</Text>`. A variant with no default is a
component that can render unstyled, and it makes the Storybook control show a blank.

`component-props.spec.ts` enforces all three rules, so a deviation fails the suite rather than
reaching review.

## 3. The class contract — verified, not assumed

`packages/design-tokens` **clears the stock Tailwind scales it replaces** (`--color-*`, `--text-*`,
`--font-*`, `--tracking-*`, `--leading-*`, `--radius-*`, `--shadow-*`, `--ease-*`, `--breakpoint-*`
are all reset to `initial` before our tokens are emitted). So `rounded-lg`, `text-sm`, `bg-red-500`,
`shadow-md`, `font-sans` and `tracking-tight` **do not exist** — they compile to nothing and the
element silently loses that style. Only the classes below are real.

### Colour — `--color-<name>` → `bg-<name>` `text-<name>` `border-<name>` `ring-<name>` `fill-<name>`

| Family     | Names                                                                                                                                                      |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brand      | `brand-primary` `brand-primary-hover` `brand-primary-active` `brand-soft` `brand-tint`                                                                     |
| Surface    | `surface-page` `surface-page-alt` `surface-card` `surface-sunken` `surface-brand` `surface-brand-soft` `surface-inverse` `surface-overlay` `surface-glass` |
| Text       | `text-heading` `text-body` `text-muted` `text-subtle` `text-brand` `text-on-brand` `text-on-inverse` `text-link` `text-link-hover`                         |
| Border     | `border-subtle` `border-default` `border-strong` `border-brand` `border-brand-soft`                                                                        |
| Status     | `status-success` `status-warning` `status-danger` `status-info` (+ each `-soft`)                                                                           |
| Heat       | `heat-1` `heat-2` `heat-3` `heat-4`                                                                                                                        |
| Primitives | `pink-50…800` `ink-0…900` `turmeric` `tandoor` `mint` `kesar` `danger` (+ `-soft`) `overlay-ink` `glass-white`                                             |

**The families repeat in the class name** — that is correct, not a typo:
`text-text-heading` (heading colour), `bg-surface-page`, `border-border-subtle`,
`bg-status-danger-soft`. `text-heading` does not exist.

Prefer semantic over primitive: `bg-brand-primary`, not `bg-pink-500`.

### Type — `text-<step>` is a **size**, not a colour

`display1` `display2` `h1` `h2` `h3` `subtitle1` `subtitle2` `body1` `body2` `caption` `overline`
`mono`, plus fluid twins `display1-fluid` `display2-fluid` `h1-fluid` `h2-fluid` `h3-fluid`
`subtitle1-fluid` `body1-fluid`, plus canvas sizes `canvas-hero` `canvas-h1` `canvas-h2`
`canvas-body` `canvas-caption` `canvas-overline`.

`leading-<step>` and `tracking-<step>` use the same names. Font family: `font-display` `font-body`
`font-mono` `font-devanagari`. Weight uses Tailwind's own: `font-normal` (400) `font-medium` (500)
`font-semibold` (600) `font-bold` (700) `font-extrabold` (800 — the brand's "black").

**Do not hand-build type.** Use the `Text` atom. Reach for raw type classes only inside a component
that cannot nest `Text` (a `<button>` label, a `<input>`).

### Space, radius, shadow, motion

- Spacing: `p-*` `m-*` `gap-*` `size-*` on the 4px scale where the number **is** the multiple —
  `p-6` is 24px. Half steps: `gap-0-5` (2px), `gap-1-5` (6px).
- Radius: `rounded-1` (4px) `rounded-2` (6) `rounded-3` (10) `rounded-4` (16) `rounded-5` (24)
  `rounded-6` (999, the pill). Chips and buttons pill, cards `rounded-4`, sheets/modals `rounded-5`,
  inputs and thumbnails `rounded-3`.
- Shadow: `shadow-elevation1…4`, `shadow-brand` (the pink glow — primary CTA and floating cart
  button only), `shadow-inset`, `shadow-focus-ring`, `shadow-focus-ring-inverse`.
- Easing: `ease-out` (entering) `ease-in-out` (moving) `ease-entrance` (sheets) `ease-pop`
  (add-to-cart and reward confirmations **only**).
- Animation: `animate-pp-spin` `animate-pp-pulse` `animate-pp-shimmer` `animate-pp-rise`
  `animate-pp-fade`.

### Tokens with no Tailwind namespace → `utility-(--token)`

`--button-h-*` `--button-px-*` `--field-h` `--field-radius` `--card-*` `--layout-*` `--canvas-*`
`--duration-*` `--motion-*` `--measure-*` `--stroke-*` `--effect-*` have no namespace, so they are
used through Tailwind's var syntax:

```
h-(--button-h-md)   px-(--button-px-lg)   h-(--field-h)   min-h-(--layout-hit-min)
max-w-(--layout-container-max)   max-w-(--measure-prose)   duration-(--duration-fast)
active:scale-(--motion-press-scale)   w-(--canvas-post-w)
```

**Never write a raw hex.** `pink-paprikaa/no-raw-hex` is an error and the brand hex lives in exactly
one file in this workspace.

## 4. The state contract — every interactive component

| State    | Treatment                                                                                                                                                  |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hover    | Darken one step (`hover:bg-brand-primary-hover`); on white, tint (`hover:bg-brand-tint`). Never fade.                                                      |
| Press    | `active:scale-(--motion-press-scale)` **and** a darkening, together, at `duration-(--duration-instant)`                                                    |
| Focus    | Inherited from the base layer (2px pink, 2px offset). Fields add `focus:shadow-focus-ring`.                                                                |
| Disabled | `disabled:bg-(--button-bg-disabled) disabled:text-(--button-fg-disabled) disabled:cursor-not-allowed`, no shadow — a real grey fill, **never** `opacity-*` |
| Loading  | The `Spinner` atom (pulsing diamond) or a `bg-brand-soft` `Skeleton`. No gradient spinners.                                                                |

Guard hover/press with `not-disabled:` so a disabled control stays inert.

## 5. The responsive contract — every component

- **Every design must survive 360px.** Check the `360 — smallest supported` viewport in Storybook.
- Fixed-height controls never wrap: buttons 36/44/54, fields 48, tags 38; hit target ≥ 44px.
- Any flex row holding text carries `min-w-0`; rows that can run out of room use `flex-wrap` and
  `gap` — never per-child margins.
- Images sit in an `aspect-*` box so a missing photo cannot collapse the layout.
- Grids: `grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))]`. A bare `1fr` track is a bug —
  it has a min-content floor and a long uppercase label overflows the row.
- Type is fluid in layouts (`<Text fluid>`), fixed in specimens and on canvases.

## 6. Tests (`<name>.test.tsx`)

Testing Library + `userEvent`, queried by role and accessible name — never by class or test id.
Cover, at minimum:

1. It renders its default and each **variant**'s observable difference.
2. Each **behaviour**: click, keyboard, controlled/uncontrolled, disabled does nothing.
3. Its **accessible contract**: role, name, `aria-*` wiring, focus movement.
4. `className` **merges** (caller's class wins over the component's default).
5. Accessibility, always last:

```tsx
import { expectNoA11yViolations } from "../../../vitest.setup";

it("has no accessibility violations", async () => {
  const { container } = render(<Thing />);
  await expectNoA11yViolations(container);
});
```

## 7. Stories (`<name>.stories.tsx`)

```tsx
const meta = {
  title: "Atoms/Badge", // Atoms | Molecules | Organisms | Templates + the component name
  component: Badge,
  args: { children: "Bestseller" },
  parameters: { docs: { description: { component: "When to reach for it, in two sentences." } } },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Tones: Story = { render: (args) => /* every tone side by side */ };
```

One story per variant axis plus a realistic in-context story. Use the matching `.card.html` in the
design reference as the checklist of what to show. Autodocs is on globally — a doc comment on a prop
becomes its row in the props table, so write them. Stories on a pink or ink ground set
`globals: { backgrounds: { value: "brand" } }`.

## 8. Layering (lint-enforced — `no-restricted-imports`)

`atoms → molecules → organisms → templates`, imports only ever go **downward**: a molecule may
import atoms, an organism may import molecules and atoms, templates carry spacing and width only and
import nothing visual. An atom may import another atom (`Button` uses `Icon` and `Spinner`), but
keep it to genuine primitives.

## 9. Copy rules — these are content bugs, not style preferences

- **`Pink Paprikaa`**, two `a`s, everywhere including comments and fixtures.
- **No founder name, no engineering framing, anywhere** — markup, alt text, comments, story copy.
- `₹` with no space and no decimals on whole rupees: `₹240`. Ranges use an en dash: `₹180–₹320`.
  Times are 12-hour lowercase: `8am – 11:30pm`.
- Title Case for buttons and claims; sentence case for body and form labels; ALL CAPS only for
  overlines and heat labels.
- **No emoji, ever** — including 🌶 for spice. That is what `SpiceLevel` is for.
- Never "artisanal", "curated", "experience" (noun), "elevated", "journey", "authentic".
- Being pure veg is stated once, plainly: "100% vegetarian kitchen."

## 10. Done means

```bash
pnpm nx run-many -t typecheck lint test -p ui
pnpm nx run storybook:build
```

all green, with the component exported from `src/index.ts`.
