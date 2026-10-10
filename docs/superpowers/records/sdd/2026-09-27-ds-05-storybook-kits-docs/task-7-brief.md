### Task 7: The Layout group

Sources: `guidelines/{breakpoints,autogrid,radii,borders,elevation,card-anatomy}.card.html`, readme §3.5, §3.6, §3.10, §3.11, spec §6.5 (utility-class map).

**Files:**

- Create: `apps/storybook/src/foundations/layout/{layout.stories.tsx,breakpoints.mdx,autogrid.mdx,radii.mdx,borders.mdx,elevation.mdx,card-anatomy.mdx,utility-classes.mdx}`

**Dev reference:** `git show dev:packages/ui/src/docs/space-shape-motion.mdx` (§ Breakpoints, § Radius, § Elevation, "Cards"); `git show dev:packages/ui/src/docs/voice-and-accessibility.mdx` (focus)

**Dev parity:**

| Dev item                                                                                     | Ruling  | Where / spec clause                                                             |
| -------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------- |
| Breakpoints `sm` 480 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1440                         | ALREADY | `Breakpoints` (read from `breakpoint-*`)                                        |
| Every design survives 360px — the floor, checked in the `360 — smallest supported` viewport  | ALREADY | `breakpoints.mdx`; `floor360` viewport (Plan 1); kits test at 360               |
| Radius per job (chips, small controls, inputs/thumbnails, cards, sheets/modals, pill)        | ALREADY | `radii.mdx` + radius token descriptions                                         |
| "Geometric, so nothing is blobby"                                                            | ALREADY | `radii.mdx`                                                                     |
| Shadows warm-ink tinted, sparing; `shadow-brand` only for the primary CTA and floating cart  | ALREADY | `elevation.mdx` + shadow token descriptions                                     |
| Card: white, card radius, 1px subtle border, shadow-1; hover lifts 2px to shadow-3           | ALREADY | `CardAnatomy` + `card-anatomy.mdx` (`isInteractive`)                            |
| Feature card: soft fill, no border, no shadow, bigger radius; menu rows are rules, not cards | ALREADY | `card-anatomy.mdx`                                                              |
| No card ever has a coloured left border                                                      | ALREADY | `borders.mdx`, `card-anatomy.mdx`                                               |
| Focus ring painted by the base layer, 2px pink, 2px offset                                   | ALREADY | `borders.mdx` (fields: the 3px outer `shadow-focus-ring`, spec §5.5 as amended) |
| `rounded-1`…`rounded-6`, `shadow-elevation1`…`4`                                             | DROP    | D4 (`radius-xs`…`pill`, `shadow-1`…`4`)                                         |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `RadiusScale`, `ShadowLadder`, `TokenTable`, `SpecimenRow`, `tokensWithPrefix`, `formatValue`, `token` (docs-kit); `AutoGrid`, `Badge`, `Card`, `ImageSlot` (ui).
- Produces: `Layout/Specimens` → `Breakpoints`, `AutoGridCards`, `AutoGridTokens`, `Radii`, `Borders`, `BorderTokens`, `DepthLadder`, `CardAnatomy`, `UtilityClasses`; seven pages under `Layout/`.

- [ ] **Step 1: The Layout specimens**

Create `apps/storybook/src/foundations/layout/layout.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AutoGrid, Badge, Card, ImageSlot } from "@pink-paprikaa-web/ui";

import { formatValue, token, tokensWithPrefix } from "../../docs-kit/catalogue";
import { RadiusScale } from "../../docs-kit/radius-scale";
import { ShadowLadder } from "../../docs-kit/shadow-ladder";
import { SpecimenRow } from "../../docs-kit/specimen";
import { TokenTable } from "../../docs-kit/token-table";

/** Live visuals for the Layout pages. Hidden from the sidebar; rendered by the MDX; run by storybook:test. */
const meta = {
  title: "Layout/Specimens",
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Column counts per breakpoint — a design-system rule (readme §3.10), not a token. */
const COLUMNS: Readonly<Record<string, string>> = {
  "breakpoint-sm": "1 col",
  "breakpoint-md": "2 col",
  "breakpoint-lg": "3 col",
  "breakpoint-xl": "4 col",
  "breakpoint-2xl": "4 col · capped by the content container",
};
const BAR_FILL = ["bg-pink-300", "bg-pink-400", "bg-pink-500", "bg-pink-600", "bg-pink-700"];

function Cell({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-pink-200 bg-pink-50 p-3.5">
      <div className="h-8.5 rounded-md bg-pink-100" />
      <span className="mt-2.5 block font-mono text-mono text-text-muted">{label}</span>
    </div>
  );
}

export const Breakpoints: Story = {
  render: () => (
    <ol aria-label="Breakpoints" className="flex items-end gap-2.5">
      {tokensWithPrefix("breakpoint-").map((entry, index) => (
        <li
          key={entry.name}
          className="flex min-w-0 flex-col gap-1"
          style={{ flexGrow: index + 2 }}
        >
          <span
            aria-hidden
            className={`rounded-t-sm ${BAR_FILL[index] ?? "bg-pink-700"}`}
            style={{ height: `calc(var(${token("spacing").cssVar}) * ${String(11 + index * 4)})` }}
          />
          <span className="font-mono text-mono text-text-heading">{entry.cssVar}</span>
          <span className="font-mono text-mono text-text-muted">{formatValue(entry.value)}</span>
          <span className="font-mono text-mono text-text-brand">{COLUMNS[entry.name] ?? ""}</span>
        </li>
      ))}
    </ol>
  ),
};

export const AutoGridCards: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <SpecimenRow label='AutoGrid — min="md" (the default)'>
        <AutoGrid className="w-full">
          {["card 1", "card 2", "card 3", "card 4"].map((label) => (
            <Cell key={label} label={label} />
          ))}
        </AutoGrid>
      </SpecimenRow>
      <SpecimenRow label='AutoGrid — min="xs"'>
        <AutoGrid min="xs" className="w-full">
          {["card 1", "card 2", "card 3", "card 4", "card 5", "card 6"].map((label) => (
            <Cell key={label} label={label} />
          ))}
        </AutoGrid>
      </SpecimenRow>
    </div>
  ),
};

export const AutoGridTokens: Story = {
  render: () => (
    <TokenTable
      caption="Grid tokens"
      selection={{ names: ["spacing-card-min", "spacing-card-min-wide", "spacing-grid-gap"] }}
    />
  ),
};

export const Radii: Story = { render: () => <RadiusScale /> };

export const Borders: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3.5">
      <span
        className="flex h-12 w-38 items-center justify-center rounded-md border-solid border-border-subtle font-mono text-mono text-text-muted"
        style={{ borderWidth: `var(${token("border-width-default").cssVar})` }}
      >
        border-subtle
      </span>
      <span
        className="flex h-12 w-38 items-center justify-center rounded-md border-solid border-border-default font-mono text-mono text-text-muted"
        style={{ borderWidth: `var(${token("border-width-default").cssVar})` }}
      >
        border-default
      </span>
      <span
        className="flex h-12 w-38 items-center justify-center rounded-md border-solid border-border-brand font-mono text-mono text-text-muted shadow-focus-ring"
        style={{ borderWidth: `var(${token("border-width-strong").cssVar})` }}
      >
        focus · strong + ring
      </span>
      <span
        className="flex h-12 w-38 items-center justify-center rounded-md border-solid border-border-strong font-mono text-mono text-text-muted"
        style={{ borderWidth: `var(${token("border-width-strong").cssVar})` }}
      >
        border-strong
      </span>
    </div>
  ),
};

export const BorderTokens: Story = {
  render: () => (
    <TokenTable
      caption="Border widths, colours and focus"
      selection={{
        names: [
          "border-width-default",
          "border-width-strong",
          "color-border-subtle",
          "color-border-default",
          "color-border-strong",
          "color-border-brand",
          "color-focus",
          "shadow-focus-ring",
        ],
      }}
    />
  ),
};

export const DepthLadder: Story = {
  render: () => (
    <ShadowLadder names={["shadow-1", "shadow-2", "shadow-3", "shadow-4", "shadow-brand"]} />
  ),
};

export const CardAnatomy: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="flex flex-col gap-2">
        <span className="font-display text-h4 text-text-heading">default</span>
        <span className="font-mono text-mono text-text-muted">
          surface-card · radius-lg · border-subtle · shadow-1
        </span>
      </Card>
      <Card variant="feature" className="flex flex-col gap-2">
        <span className="font-display text-h4 text-text-heading">feature</span>
        <span className="font-mono text-mono text-text-muted">
          brand-soft · radius-xl · no border · no shadow
        </span>
      </Card>
      <Card variant="quiet" className="flex flex-col gap-2">
        <span className="font-display text-h4 text-text-heading">quiet</span>
        <span className="font-mono text-mono text-text-muted">
          sunken · radius-lg · no border · no shadow
        </span>
      </Card>
      <Card isInteractive className="flex flex-col gap-2">
        <span className="font-display text-h4 text-text-heading">isInteractive</span>
        <span className="font-mono text-mono text-text-muted">hover: lift-y → shadow-3</span>
      </Card>
      <Card variant="brand" className="flex flex-col gap-2">
        <span className="font-display text-h4 text-text-heading">brand</span>
        <span className="font-mono text-mono text-text-muted">
          surface-brand · sets data-surface
        </span>
      </Card>
      <Card variant="ink" className="flex flex-col gap-2">
        <span className="font-display text-h4 text-text-heading">ink</span>
        <span className="font-mono text-mono text-text-muted">
          surface-inverse · sets data-surface
        </span>
      </Card>
    </div>
  ),
};

export const UtilityClasses: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <SpecimenRow label="container-page">
        <div className="container-page rounded-md border border-dashed border-border-brand py-3">
          <span className="font-mono text-mono text-text-muted">content width, fluid gutter</span>
        </div>
      </SpecimenRow>
      <SpecimenRow label="section-y">
        <div className="w-full rounded-md bg-surface-page-alt px-4 section-y">
          <span className="font-mono text-mono text-text-muted">fluid section rhythm</span>
        </div>
      </SpecimenRow>
      <SpecimenRow label="autogrid · autogrid-wide">
        <div className="autogrid w-full">
          <Cell label="autogrid" />
          <Cell label="autogrid" />
          <Cell label="autogrid" />
        </div>
        <div className="autogrid-wide w-full">
          <Cell label="autogrid-wide" />
          <Cell label="autogrid-wide" />
        </div>
      </SpecimenRow>
      <SpecimenRow label="cluster">
        <div className="cluster">
          <Badge>Bestseller</Badge>
          <Badge tone="success">Pure veg</Badge>
          <Badge tone="warning">Extra Hot</Badge>
        </div>
      </SpecimenRow>
      <SpecimenRow label="line-clamp-2 · text-h1-fluid">
        <span className="line-clamp-2 max-w-60 text-body-sm text-text-body">
          Amritsari paneer, burnt chilli mayo, potato brioche, masala fries on the side, and a
          pickle that argues back.
        </span>
        <span className="font-display text-h1-fluid text-text-heading">Most ordered this week</span>
      </SpecimenRow>
      <SpecimenRow label="scrim-bottom — the only gradient, over photography">
        <div className="relative w-60 overflow-hidden rounded-lg">
          <ImageSlot ratio="4:3" radius="none" label="Dish photo 4:3" />
          <div className="absolute inset-0 scrim-bottom" />
        </div>
      </SpecimenRow>
    </div>
  ),
};
```

- [ ] **Step 2: The Layout pages**

Create `apps/storybook/src/foundations/layout/breakpoints.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./layout.stories";

<Meta title="Layout/Breakpoints" />

{/* source: guidelines/breakpoints.card.html */}

# Breakpoints

Five breakpoints and the column count at each. Every design must survive **360px** on the low end.

<Canvas of={Specimens.Breakpoints} meta={Specimens} sourceState="none" />

- **Never a bare `1fr` track.** Always `minmax(0, 1fr)`, or `AutoGrid` — `1fr` carries a
  min-content floor, and a long uppercase label silently widens the track and overflows the row.
- **Nothing clips text.** Buttons, tags and pills never wrap and never shrink; anything that could
  run long uses `text-wrap: pretty` (prose), `text-wrap: balance` (headlines) or `line-clamp-*`. A
  nav shortens its link list at narrower widths rather than clipping a word.
- **Flex rows that hold text carry `min-w-0`**, and any row that can run out of space wraps with a
  `gap` — never per-child margins.
- **Fixed-height controls never wrap** — buttons, fields, tags — and every touch target is at least
  the hit token (`--spacing-hit`).
- **Images always sit in an aspect-ratio box**, so a missing photo cannot collapse a layout.
```

Create `apps/storybook/src/foundations/layout/autogrid.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./layout.stories";

<Meta title="Layout/AutoGrid" />

{/* source: guidelines/autogrid.card.html */}

# Auto grid

`repeat(auto-fit, minmax(min(<minimum>, 100%), 1fr))` — the grid collapses a column instead of
clipping a card.

<Canvas of={Specimens.AutoGridCards} meta={Specimens} sourceState="none" />

`AutoGrid min` picks the track minimum from its component tokens (`xs` to `2xl`); `columns` fixes
a count instead. Every track is `minmax(0, 1fr)`, so a long label wraps instead of widening its
track. Menus and card grids are honest grids with `gap` — never masonry.

<Canvas of={Specimens.AutoGridTokens} meta={Specimens} sourceState="none" />
```

Create `apps/storybook/src/foundations/layout/radii.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./layout.stories";

<Meta title="Layout/Radii" />

{/* source: guidelines/radii.card.html */}

# Corner radii

Geometric, never blobby — the brand's forms are circles and straight lines.

<Canvas of={Specimens.Radii} meta={Specimens} sourceState="none" />

Chips and buttons are `pill`; cards `lg`; sheets and modals `xl` (top corners only on a bottom
sheet); inputs and thumbnails `md`; avatars are circles. Images carry the radius of the card they
sit in, except when full-bleed.
```

Create `apps/storybook/src/foundations/layout/borders.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./layout.stories";

<Meta title="Layout/Borders" />

{/* source: guidelines/borders.card.html */}

# Borders & focus

The default border width for rules and controls, the strong width on focus and selection, and the
pink focus ring.

<Canvas of={Specimens.Borders} meta={Specimens} sourceState="none" />

Inputs rest on `border-default`, and on focus take the strong width in `border-brand` plus the
3px focus ring (`shadow-focus-ring`, an outer spread). Everything else keyboard-focusable gets a 2px outline in
`--color-focus` with a 2px offset — white on pink and ink. No card ever gets a coloured left border.

<Canvas of={Specimens.BorderTokens} meta={Specimens} sourceState="none" />
```

Create `apps/storybook/src/foundations/layout/elevation.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./layout.stories";

<Meta title="Layout/Elevation" />

{/* source: guidelines/elevation.card.html */}

# Elevation — the depth ladder

Warm-ink tinted, used sparingly, picked by _meaning_ rather than taste. `shadow-brand`, the pink
glow, is reserved for the primary CTA and the floating add button.

<Canvas of={Specimens.DepthLadder} meta={Specimens} sourceState="none" />

The ladder's first step is **none**: flat panels, feature and quiet cards, and menu rows carry no
shadow at all. Transparency and blur appear in exactly three places — the scrolled site header,
the modal and sheet scrim, and the legibility scrim over photography — never on cards and never as
decoration.
```

Create `apps/storybook/src/foundations/layout/card-anatomy.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./layout.stories";

<Meta title="Layout/Card anatomy" />

{/* source: guidelines/card-anatomy.card.html */}

# Card anatomy

`default`, `feature` and `quiet` — fill, radius, border and shadow per variant — plus the two
flooded variants that set their own surface.

<Canvas of={Specimens.CardAnatomy} meta={Specimens} sourceState="none" />

- **Default:** the card fill, `radius-lg`, a `border-subtle` rule and `shadow-1`; with
  `isInteractive` it lifts on hover to `shadow-3`.
- **Feature:** the soft pink fill, `radius-xl`, no border, no shadow.
- **Menu row:** no card at all — a `border-subtle` rule between rows.
- **No card ever gets a coloured left border.** Media cards use `padding="none"` and put the radius
  on the image corners only.
```

Create `apps/storybook/src/foundations/layout/utility-classes.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./layout.stories";

<Meta title="Layout/Utility classes" />

{/* source: spec §6.5 — the design system's utility classes */}

# Utility classes

The design system's `.pp-*` classes are Tailwind utilities here (or built-ins). Each is used live
below, so a renamed utility fails lint on this page's specimen.

| Design system                                         | This system                                                               |
| ----------------------------------------------------- | ------------------------------------------------------------------------- |
| `.pp-container`                                       | `container-page`, or the `Container` layout                               |
| `.pp-section`                                         | `section-y`, or the `Section` layout                                      |
| `.pp-autogrid` · `.pp-autogrid-wide`                  | `autogrid` · `autogrid-wide`, or `AutoGrid`                               |
| `.pp-cluster`                                         | `cluster`, or `Cluster`                                                   |
| `.pp-clamp-2` · `.pp-clamp-3`                         | `line-clamp-2` · `line-clamp-3` (Tailwind built-ins)                      |
| `.pp-fluid-display-1` … `.pp-fluid-h3`                | `text-display-1-fluid` … `text-h3-fluid`                                  |
| `.pp-display-2` · `.pp-overline` · `.pp-mono`         | `text-display-2` · `text-overline` · `text-mono` (+ a font)               |
| `--scrim-bottom` · `--scrim-top`                      | `scrim-bottom` · `scrim-top`                                              |
| `.pp-on-brand` · `.pp-on-ink` · `.pp-on-soft`         | `data-surface="brand"` … (the classes still work)                         |
| `--dur-*` · `--ease-*` · `--press-scale` · `--lift-y` | `duration-fast` … · `ease-out` … · `press-scale` · `lift`                 |
| stacking                                              | `z-raised` · `z-sticky` · `z-header` · `z-dock` · `z-overlay` · `z-toast` |

<Canvas of={Specimens.UtilityClasses} meta={Specimens} sourceState="none" />
```

- [ ] **Step 3: Gate and commit**

```bash
pnpm nx lint @pink-paprikaa-web/storybook --fix 2>&1 | tail -5
pnpm nx run-many -t typecheck lint -p @pink-paprikaa-web/storybook --skip-nx-cache --outputStyle=static 2>&1 | tail -8
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- layout.stories 2>&1 | tail -12
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -4
pnpm nx format:check
git add apps/storybook/src/foundations/layout
git commit -m "feat(storybook): the Layout foundation pages and the utility-class map

Breakpoints, AutoGrid, Radii, Borders, Elevation and Card anatomy from the
design system's cards, and the map from its .pp-* classes to this system's
utilities — each utility used live so a rename fails lint.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

