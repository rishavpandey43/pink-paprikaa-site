### Task 4: PatternField

> **CONTROLLER DELTA (routed from batch A review):** the nine `pattern-tile-*` / `pattern-opacity-*` utilities this task's Step 1 describes were already added to `packages/ui/src/styles.css` in Task 1 (overlay item 8 required them there so the merge test could exist). **Skip Step 1** — do not re-add them; a duplicate `@utility` block is a defect. Start this task from its Step 2 onward, importing the existing utilities.

**Dev reference:** `git show dev:packages/ui/src/atoms/pattern-field/pattern-field.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                            | Ruling  | Where / reason                                                                      |
| ----------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------- |
| `tile` as a free number; an SVG `<pattern>` per instance with `useId` ids           | DROP    | spec §8.2 (numeric px → token enum); R19 (one shared CSS mask, no per-instance SVG) |
| `"use client"`                                                                      | DROP    | D6 — the mask needs no hook, so the field stays server-safe                         |
| `light` on `bg-surface-card`; `rounded-4/5`                                         | DROP    | `PatternField.jsx` (the page ground); D4 radius names                               |
| Texture colour from tokens, ≤12% per tone, `aria-hidden`, content above the texture | ALREADY | Step 2 tone, density, decorative and stacking tests                                 |
| Radii `none`/`md`/`lg`                                                              | ALREADY | Step 2 radius test (plus `xl`)                                                      |
| `isolate` on the root, so the texture's stacking context stays inside the panel     | ADD     | Step 4 `root` slot; Step 2 first test                                               |
| Test: every instance has its own paint server                                       | ALREADY | nothing to collide: the tile is one CSS custom property (R19)                       |
| Test: caller className replaces the radius                                          | ADD     | Step 2                                                                              |
| Stories `Default`, `Tones`, `TileSizes`                                             | ALREADY | `Playground`/`Brand`, the four tone stories, `Tiles`                                |
| Story `FullBleedBand` (edge to edge, no radius)                                     | ADD     | Step 6                                                                              |

Implementer: copy this table into your report, extended with anything the plan missed.

Source: `components/atoms/PatternField.{jsx,d.ts,card.html,prompt.md}`, readme §3.4, spec §7.2 and C7. The field is a flooded colour with the diamond symbol tiled over it. The zip loads `symbol-white.svg` or `symbol-pink.svg`; here one tile does both jobs. Plan 1's white-symbol data URI is used as a CSS **mask** over a tone-coloured layer, so the same tile paints white on brand/ink and pink on soft/light with no second asset and no literal colour. Opacity: 8% on dark fields, 9% on light ones, 4% for `density="faint"` (the handoff's ink sections).

**Files:**

- Modify: `packages/ui/src/styles.css` (tile and opacity utilities)
- Create: `packages/ui/src/atoms/pattern-field/pattern-field.tsx`, `pattern-field.test.tsx`, `pattern-field.stories.tsx`
- Modify: `packages/ui/src/index.ts`
- Tokens: none new. Tiles (`--pattern-tile-*`) and opacities (`--pattern-opacity-*`) are Plan 1 primitives. `contrast-pairs.json`: unchanged, because text on each field is covered by Plan 1's semantic surface groups.

**Interfaces:**

- Consumes: the CSS custom property `--pp-symbol-mask` (`lib/brand-artwork.css`, R19/R25), `Slot`, `componentVariants`; `bg-surface-{brand,inverse,brand-soft,page}`.
- Produces: `PatternField`, `interface PatternFieldProps extends ComponentProps<"div">` (contracts §2); utilities `pattern-tile-{56,64,72,80,86,96}`, `pattern-opacity-{default,light,faint}`.

- [ ] **Step 1: Named utilities for the tile tokens**

Tailwind has no token-backed `mask-size` or pattern-opacity utility (the only forms are arbitrary). Append to `packages/ui/src/styles.css`, after `transition-control`:

```css
/* PatternField (spec §7.2): the tile image is the white symbol as a mask, set by the component;
   these carry the token-backed tile size and opacity. */
@utility pattern-tile-56 {
  mask-size: var(--pattern-tile-56);
}

@utility pattern-tile-64 {
  mask-size: var(--pattern-tile-64);
}

@utility pattern-tile-72 {
  mask-size: var(--pattern-tile-72);
}

@utility pattern-tile-80 {
  mask-size: var(--pattern-tile-80);
}

@utility pattern-tile-86 {
  mask-size: var(--pattern-tile-86);
}

@utility pattern-tile-96 {
  mask-size: var(--pattern-tile-96);
}

@utility pattern-opacity-default {
  opacity: var(--pattern-opacity-default);
}

@utility pattern-opacity-light {
  opacity: var(--pattern-opacity-light);
}

@utility pattern-opacity-faint {
  opacity: var(--pattern-opacity-faint);
}
```

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/pattern-field/pattern-field.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { PatternField } from "./pattern-field";

describe("PatternField", () => {
  it("floods the brand pink by default and makes its content a brand surface", () => {
    const { container } = render(
      <PatternField>
        <h2>Flooded field</h2>
      </PatternField>
    );
    const field = container.firstElementChild;
    expect(field).toHaveAttribute("data-surface", "brand");
    expect(field).toHaveClass("relative", "isolate", "overflow-hidden", "bg-surface-brand");
  });

  it.each([
    ["brand", "bg-surface-brand", "bg-ink-000"],
    ["ink", "bg-surface-inverse", "bg-ink-000"],
    ["soft", "bg-surface-brand-soft", "bg-pink-500"],
    ["light", "bg-surface-page", "bg-pink-500"],
  ] as const)("tone %s sets data-surface, the %s field and a %s mark", (tone, field, mark) => {
    const { container } = render(<PatternField tone={tone}>Field</PatternField>);
    const root = container.firstElementChild;
    expect(root).toHaveAttribute("data-surface", tone);
    expect(root).toHaveClass(field);
    expect(root?.firstElementChild).toHaveClass(mark);
  });

  it("tiles the symbol at 64px by default and at any tile token", () => {
    const { container, rerender } = render(<PatternField>Field</PatternField>);
    expect(container.firstElementChild?.firstElementChild).toHaveClass("pattern-tile-64");
    rerender(<PatternField tile={96}>Field</PatternField>);
    expect(container.firstElementChild?.firstElementChild).toHaveClass("pattern-tile-96");
  });

  it.each([
    ["brand", "pattern-opacity-default"],
    ["ink", "pattern-opacity-default"],
    ["soft", "pattern-opacity-light"],
    ["light", "pattern-opacity-light"],
  ] as const)("uses the %s field's default density (%s) and only that one", (tone, opacity) => {
    const { container } = render(<PatternField tone={tone}>Field</PatternField>);
    const pattern = container.firstElementChild?.firstElementChild;
    expect(pattern).toHaveClass(opacity);
    expect(pattern?.className.match(/pattern-opacity-/g)).toHaveLength(1);
  });

  it("whispers at 4% when density is faint", () => {
    const { container } = render(
      <PatternField tone="ink" density="faint">
        Field
      </PatternField>
    );
    const pattern = container.firstElementChild?.firstElementChild;
    expect(pattern).toHaveClass("pattern-opacity-faint");
    expect(pattern?.className.match(/pattern-opacity-/g)).toHaveLength(1);
  });

  it("keeps the pattern decorative and out of the pointer's way", () => {
    const { container } = render(<PatternField>Field</PatternField>);
    const pattern = container.firstElementChild?.firstElementChild;
    expect(pattern).toHaveAttribute("aria-hidden", "true");
    expect(pattern).toHaveClass("pointer-events-none", "absolute", "inset-0");
  });

  it("paints the tile through the white symbol mask, rendered on the server", () => {
    const html = renderToStaticMarkup(<PatternField tone="ink">Statement</PatternField>);
    expect(html).toContain('data-surface="ink"');
    expect(html).toContain("mask-image:var(--pp-symbol-mask)");
  });

  it("stacks its content above the pattern", () => {
    render(
      <PatternField>
        <h2>Flooded field</h2>
      </PatternField>
    );
    expect(screen.getByRole("heading").parentElement).toHaveClass("relative", "h-full");
  });

  it.each([
    ["none", "rounded-none"],
    ["md", "rounded-md"],
    ["lg", "rounded-lg"],
    ["xl", "rounded-xl"],
  ] as const)("rounds %s with %s", (radius, radiusClass) => {
    const { container } = render(<PatternField radius={radius}>Field</PatternField>);
    expect(container.firstElementChild).toHaveClass(radiusClass);
  });

  it("patterns an existing element through asChild", () => {
    render(
      <PatternField asChild tone="ink">
        <section aria-label="Delivery zones">
          <h2>Delivery zones</h2>
        </section>
      </PatternField>
    );
    const section = screen.getByRole("region", { name: "Delivery zones" });
    expect(section).toHaveAttribute("data-surface", "ink");
    expect(section).toHaveClass("bg-surface-inverse");
    expect(section.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(within(section).getByRole("heading", { name: "Delivery zones" })).toBeInTheDocument();
  });

  it("merges a consumer className and forwards native props", () => {
    const { container } = render(
      <PatternField className="p-10" id="offer">
        Field
      </PatternField>
    );
    expect(container.firstElementChild).toHaveClass("p-10", "bg-surface-brand");
    expect(container.firstElementChild).toHaveAttribute("id", "offer");
  });

  it("lets a consumer className replace its radius", () => {
    const { container } = render(
      <PatternField radius="md" className="rounded-xl">
        Field
      </PatternField>
    );
    expect(container.firstElementChild).toHaveClass("rounded-xl");
    expect(container.firstElementChild).not.toHaveClass("rounded-md");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <PatternField tone="brand">
        <h2>Tonight only</h2>
        <p>Chai at 8am, chilli paneer at midnight.</p>
      </PatternField>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: FAIL — `Failed to resolve import "./pattern-field"`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/pattern-field/pattern-field.tsx`:

```tsx
import type { ComponentProps, ElementType } from "react";

import { Slot } from "radix-ui";

import { componentVariants } from "../../lib/component-variants";

export interface PatternFieldProps extends ComponentProps<"div"> {
  /** The field colour; also its `data-surface`, so everything inside follows it. */
  tone?: "brand" | "ink" | "soft" | "light";
  /** Tile size in px — 96 on a 1080 canvas, 56–72 on screen. */
  tile?: 56 | 64 | 72 | 80 | 86 | 96;
  /** default = 8% on brand/ink, 9% on soft/light · faint = 4% (the handoff's ink sections). */
  density?: "default" | "faint";
  radius?: "none" | "md" | "lg" | "xl";
  /** Pattern an existing element (e.g. a `<section>`) instead of rendering a `<div>`. */
  asChild?: boolean;
}

/** One white symbol tile, used as a mask: the colour painted through it comes from the tone. */
const PATTERN_MASK = { maskImage: "var(--pp-symbol-mask)" } as const;

const patternField = componentVariants({
  slots: {
    // `isolate`: the texture's stacking context stays inside the panel, so an overlapping card
    // cannot slide underneath it.
    root: "relative isolate overflow-hidden",
    pattern: "pointer-events-none absolute inset-0",
    content: "relative h-full",
  },
  variants: {
    tone: {
      brand: { root: "bg-surface-brand", pattern: "bg-ink-000" },
      ink: { root: "bg-surface-inverse", pattern: "bg-ink-000" },
      soft: { root: "bg-surface-brand-soft", pattern: "bg-pink-500" },
      light: { root: "bg-surface-page", pattern: "bg-pink-500" },
    },
    tile: {
      56: { pattern: "pattern-tile-56" },
      64: { pattern: "pattern-tile-64" },
      72: { pattern: "pattern-tile-72" },
      80: { pattern: "pattern-tile-80" },
      86: { pattern: "pattern-tile-86" },
      96: { pattern: "pattern-tile-96" },
    },
    density: { default: {}, faint: { pattern: "pattern-opacity-faint" } },
    radius: {
      none: { root: "rounded-none" },
      md: { root: "rounded-md" },
      lg: { root: "rounded-lg" },
      xl: { root: "rounded-xl" },
    },
  },
  // Exactly one opacity class per field: tailwind-merge cannot resolve two custom utilities.
  compoundVariants: [
    { tone: ["brand", "ink"], density: "default", class: { pattern: "pattern-opacity-default" } },
    { tone: ["soft", "light"], density: "default", class: { pattern: "pattern-opacity-light" } },
  ],
  defaultVariants: { tone: "brand", tile: 64, density: "default", radius: "none" },
});

/** The brand's only texture: the diamond symbol tiled at low opacity over a flooded field. */
export function PatternField({
  tone = "brand",
  tile,
  density,
  radius,
  asChild = false,
  className,
  children,
  ...props
}: PatternFieldProps) {
  const slots = patternField({ tone, tile, density, radius });
  const Component: ElementType = asChild ? Slot.Root : "div";
  return (
    <Component data-surface={tone} className={slots.root({ className })} {...props}>
      <span aria-hidden className={slots.pattern()} style={PATTERN_MASK} />
      <Slot.Slottable child={children}>
        {(content) => <div className={slots.content()}>{content}</div>}
      </Slot.Slottable>
    </Component>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: PASS.

- [ ] **Step 6: Stories**

Card rows (`PatternField.card.html`, all at tile 64 with radius lg): `brand`, `ink`, `soft`. Extras: `light`, `density="faint"`, `tile`, `asChild`, `FullBleedBand` (dev parity).

`packages/ui/src/atoms/pattern-field/pattern-field.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { PatternField } from "./pattern-field";

function Inner({ caption }: { caption: string }) {
  return (
    <div className="p-4">
      <h4 className="m-0">Flooded field</h4>
      <p className="m-0 font-body text-caption">{caption}</p>
    </div>
  );
}

const meta = {
  title: "Atoms/PatternField",
  component: PatternField,
  args: {
    tone: "brand",
    tile: 64,
    radius: "lg",
    children: <Inner caption="tile 64 · density default" />,
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Flooded brand panel with the diamond symbol tiled behind it — the brand's single texture. It sets `data-surface` to its tone, so headings, copy and links inside follow the field with no colour props. `tile` is 96 on a 1080 canvas, 56–72 on screen; `density=\"faint\"` (4%) is the handoff's whisper for ink sections. The pattern is a whisper, never a graphic element: no noise, grain or gradients alongside it. `asChild` patterns your own `<section>`.",
      },
    },
  },
} satisfies Meta<typeof PatternField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Brand: Story = { name: 'tone="brand"', args: { tone: "brand" } };

export const Ink: Story = { name: 'tone="ink"', args: { tone: "ink" } };

export const Soft: Story = { name: 'tone="soft"', args: { tone: "soft" } };

export const Light: Story = {
  name: 'tone="light"',
  args: { tone: "light", className: "border border-border-subtle" },
};

export const Faint: Story = {
  name: 'density="faint"',
  args: { tone: "ink", tile: 80, density: "faint", children: <Inner caption="tile 80 · faint" /> },
};

export const Tiles: Story = {
  name: "tile",
  render: () => (
    <div className="grid grid-cols-3 gap-3">
      {([56, 64, 72, 80, 86, 96] as const).map((tile) => (
        <PatternField key={tile} tone="brand" tile={tile} radius="lg" className="h-40">
          <Inner caption={`tile ${String(tile)}`} />
        </PatternField>
      ))}
    </div>
  ),
};

export const AsChild: Story = {
  name: "asChild (section)",
  render: () => (
    <PatternField asChild tone="ink" density="faint" tile={80} radius="xl" className="p-8">
      <section aria-label="Delivery zones">
        <h2 className="m-0">Delivery zones</h2>
        <p className="m-0 font-body text-body">Free within 3 km of Sector 57.</p>
      </section>
    </PatternField>
  ),
};

/** A full-bleed section band: no radius, edge to edge. */
export const FullBleedBand: Story = {
  name: 'full-bleed band (radius="none")',
  parameters: { layout: "fullscreen" },
  render: () => (
    <PatternField tone="ink" radius="none">
      <div className="container-page section-y">
        <h2 className="m-0 text-balance">Momos, chaat and North Indian plates from ₹180–₹320</h2>
      </div>
    </PatternField>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { PatternField, type PatternFieldProps } from "./atoms/pattern-field/pattern-field";
```

- [ ] **Step 8: Gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/pattern-field packages/ui/src/styles.css packages/ui/src/index.ts
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: green (`styles.spec.ts` confirms the new utilities hold no literal colour); Storybook builds.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui
git commit -m "feat(ui): add the PatternField atom, the tiled diamond texture

One white symbol tile is used as a mask over a tone colour, so the pattern
paints white on pink and ink and pink on soft and light, server-rendered with
no second asset. Tile size and opacity are named utilities over the tokens;
the field sets data-surface so its content follows it.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

