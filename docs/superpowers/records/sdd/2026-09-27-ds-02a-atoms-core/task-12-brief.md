### Task 12: Badge

**Dev reference:** `git show dev:packages/ui/src/atoms/badge/badge.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                               | Ruling  | Where / reason                                                 |
| ---------------------------------------------------------------------- | ------- | -------------------------------------------------------------- |
| `rounded-6`, `bg-brand-soft`, status colours as text (`text-status-*`) | DROP    | D4; spec §5.3 (status text uses the AA `text-text-*` tokens)   |
| `brand` is a fixed pink                                                | ALREADY | the surface-aware `badge-brand-*` pair (white on a pink field) |
| Tests: caps, not a control, seven tones, soft default, axe             | ALREADY | Step 2                                                         |
| Test: the glyph is decorative (one svg, `aria-hidden`)                 | ADD     | Step 2                                                         |
| Test: caller className replaces the radius                             | ADD     | Step 2                                                         |
| Stories `Default`, `Tones`, `StatusTones`, `WithIcons`                 | ALREADY | `Playground`, `Tones`, `StatusTones`, `WithIcon`               |
| Story `OnAMenuCard`                                                    | ADD     | Step 6                                                         |

Implementer: copy this table into your report, extended with anything the plan missed.

Source: `components/atoms/Badge.{jsx,d.ts,card.html,prompt.md}`. Visuals: a non-interactive pill with 4px × 10px padding, a 5px gap to a 12px glyph, and overline type (Poppins 700, 11.5px, +0.14em, line height 1.2, capitals), no wrap. Tones:

| Tone      | Fill          | Text            |
| --------- | ------------- | --------------- |
| `brand`   | pink-500      | white           |
| `soft`    | pink-100      | pink-700        |
| `ink`     | ink-900       | white           |
| `success` | mint-soft     | mint-strong     |
| `warning` | turmeric-soft | turmeric-strong |
| `danger`  | danger-soft   | danger          |
| `neutral` | ink-100       | ink-700         |

`brand` would vanish on a pink field, so there it flips to white with pink-600 text (one surface skin).

**Files:**

- Create: `packages/design-tokens/tokens/component/badge.json`
- Modify: `tokens/surface/brand.json`, `tokens/surface/light.json`, `packages/design-tokens/contrast-pairs.json`
- Create: `packages/ui/src/atoms/badge/badge.tsx`, `badge.test.tsx`, `badge.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `Icon`, `IconComponent`; `text-overline`; `text-text-{success,warning,danger}`, `bg-status-*-soft`; `OnSurfaces`.
- Produces: `Badge`, `interface BadgeProps extends ComponentProps<"span">` (contracts §2); tokens `spacing-badge-icon`, `color-badge-brand-{bg,fg}`.

- [ ] **Step 1: Component tokens, surface skin, contrast pairs**

`packages/design-tokens/tokens/component/badge.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "badge-icon": { "$value": "12px", "$description": "The Badge glyph." }
  },
  "color": {
    "$type": "color",
    "badge": {
      "brand": {
        "bg": { "$value": "{color.surface.brand}", "$description": "White on a pink field." },
        "fg": { "$value": "{color.text.on-brand}", "$description": "Pink-600 on a pink field." }
      }
    }
  }
}
```

`tokens/surface/brand.json`: inside `surface-brand.color`, add:

```json
"badge": {
  "brand": {
    "bg": { "$value": "{color.ink.000}" },
    "fg": { "$value": "{color.pink.600}" }
  }
}
```

`tokens/surface/light.json`: inside `surface-light.color`, add:

```json
"badge": {
  "brand": {
    "bg": { "$value": "{color.surface.brand}" },
    "fg": { "$value": "{color.text.on-brand}" }
  }
}
```

`packages/design-tokens/contrast-pairs.json`: append to `groups`:

```json
{
  "id": "badge",
  "surface": null,
  "pairs": [
    ["color-pink-700", "color-pink-100"],
    ["color-ink-000", "color-ink-900"],
    ["color-ink-700", "color-ink-100"],
    ["color-text-success", "color-status-success-soft"],
    ["color-text-warning", "color-status-warning-soft"],
    ["color-text-danger", "color-status-danger-soft"]
  ],
  "min": 4.5
},
{
  "id": "badge-brand",
  "surface": null,
  "pairs": [["color-badge-brand-fg", "color-badge-brand-bg"]],
  "min": 3,
  "exception": "brand-fill"
},
{
  "id": "badge-brand-on-brand",
  "surface": "brand",
  "pairs": [["color-badge-brand-fg", "color-badge-brand-bg"]],
  "min": 4.5
}
```

(Measured: 5.66, 18.39, 10.17, 5.57, 5.19, 4.60; white on pink 4.04; pink-600 on white 5.18.)

In `component-variants.ts`, append to `SPACING`: `"badge-icon",`.

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -6` → PASS.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/badge/badge.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { Flame } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Badge } from "./badge";

describe("Badge", () => {
  it("is a soft, uppercase, non-interactive pill by default", () => {
    render(<Badge>New</Badge>);
    const badge = screen.getByText("New").parentElement;
    expect(badge?.tagName).toBe("SPAN");
    expect(badge).toHaveClass(
      "bg-pink-100",
      "text-pink-700",
      "font-display",
      "text-overline",
      "uppercase",
      "rounded-pill",
      "px-2.5",
      "py-1",
      "gap-1.25"
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it.each([
    ["brand", "bg-badge-brand-bg", "text-badge-brand-fg"],
    ["soft", "bg-pink-100", "text-pink-700"],
    ["ink", "bg-ink-900", "text-ink-000"],
    ["success", "bg-status-success-soft", "text-text-success"],
    ["warning", "bg-status-warning-soft", "text-text-warning"],
    ["danger", "bg-status-danger-soft", "text-text-danger"],
    ["neutral", "bg-ink-100", "text-ink-700"],
  ] as const)("paints the %s tone with %s and %s", (tone, fill, text) => {
    render(<Badge tone={tone}>Bestseller</Badge>);
    expect(screen.getByText("Bestseller").parentElement).toHaveClass(fill, text);
  });

  it("draws a 12px glyph at the heavy 2px stroke", () => {
    render(<Badge icon={Flame}>Hot</Badge>);
    const glyph = screen.getByText("Hot").parentElement?.firstElementChild;
    expect(glyph).toHaveClass("size-badge-icon");
    expect(glyph).not.toHaveClass("size-icon-xs");
    expect(glyph?.querySelector("svg")).toHaveAttribute("stroke-width", "2");
  });

  it("never wraps — a long label truncates inside the pill (Review Focus 1)", () => {
    render(<Badge>Launch price for the first month</Badge>);
    const label = screen.getByText("Launch price for the first month");
    expect(label).toHaveClass("min-w-0", "truncate");
    expect(label.parentElement).toHaveClass("whitespace-nowrap", "max-w-full", "shrink-0");
  });

  it("merges a consumer className and forwards native props", () => {
    render(
      <Badge className="ml-1" id="pick">
        Pick
      </Badge>
    );
    const badge = screen.getByText("Pick").parentElement;
    expect(badge).toHaveClass("ml-1", "px-2.5");
    expect(badge).toHaveAttribute("id", "pick");
  });

  it("keeps its glyph decorative, so only the label is read", () => {
    render(<Badge icon={Flame}>Hot</Badge>);
    const glyphs = screen.getByText("Hot").parentElement?.querySelectorAll("svg");
    expect(glyphs).toHaveLength(1);
    expect(glyphs?.[0]).toHaveAttribute("aria-hidden", "true");
  });

  it("lets a consumer className replace its radius", () => {
    render(<Badge className="rounded-md">Pick</Badge>);
    const badge = screen.getByText("Pick").parentElement;
    expect(badge).toHaveClass("rounded-md");
    expect(badge).not.toHaveClass("rounded-pill");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Badge tone="brand">Bestseller</Badge>
        <Badge tone="success" icon={Flame}>
          100% Veg
        </Badge>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: FAIL — `Failed to resolve import "./badge"`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/badge/badge.tsx`:

```tsx
import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";
import { Icon, type IconComponent } from "../icon/icon";

export interface BadgeProps extends ComponentProps<"span"> {
  tone?: "brand" | "soft" | "ink" | "success" | "warning" | "danger" | "neutral";
  /** Optional 12px glyph. */
  icon?: IconComponent;
}

const badge = componentVariants({
  slots: {
    root: "inline-flex max-w-full shrink-0 items-center gap-1.25 rounded-pill px-2.5 py-1 font-display text-overline whitespace-nowrap uppercase",
    icon: "size-badge-icon",
    label: "min-w-0 truncate",
  },
  variants: {
    tone: {
      // Brand is the one surface-aware skin: white with pink text on a pink field.
      brand: { root: "bg-badge-brand-bg text-badge-brand-fg" },
      soft: { root: "bg-pink-100 text-pink-700" },
      ink: { root: "bg-ink-900 text-ink-000" },
      success: { root: "bg-status-success-soft text-text-success" },
      warning: { root: "bg-status-warning-soft text-text-warning" },
      danger: { root: "bg-status-danger-soft text-text-danger" },
      neutral: { root: "bg-ink-100 text-ink-700" },
    },
  },
  defaultVariants: { tone: "soft" },
});

/** Small uppercase status marker. Reads as a label, never as a button. */
export function Badge({ tone, icon, className, children, ...props }: BadgeProps) {
  const slots = badge({ tone });
  return (
    <span className={slots.root({ className })} {...props}>
      {icon ? <Icon icon={icon} size="xs" className={slots.icon()} /> : null}
      <span className={slots.label()}>{children}</span>
    </span>
  );
}
```

(`size="xs"` picks the 2px stroke the design system uses at small sizes; `size-badge-icon` sets the 12px box, replacing `size-icon-xs` in the merge.)

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: PASS.

- [ ] **Step 6: Stories**

Card rows (`Badge.card.html`): `tone` (brand Bestseller, soft New, ink Tonight Only, neutral Veg), `status tones` (success Confirmed, warning Kitchen Busy, danger Sold Out), `icon` (soft flame Hot, success leaf 100% Veg, brand star Chef Pick). Extras: `OnSurfaces`, `OnAMenuCard` (dev parity).

`packages/ui/src/atoms/badge/badge.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Flame, Leaf, Star } from "lucide-react";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Badge } from "./badge";

const meta = {
  title: "Atoms/Badge",
  component: Badge,
  args: { children: "Bestseller", tone: "brand" },
  argTypes: { icon: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          "Uppercase status marker for menu items, orders and cards — non-interactive. Always ALL CAPS and two words maximum. For a filterable, tappable pill use `Tag` instead. The `brand` tone turns white on a pink field so it never vanishes; the other tones carry their own fills and read on any surface.",
      },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tones: Story = {
  name: "tone",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge tone="brand">Bestseller</Badge>
      <Badge tone="soft">New</Badge>
      <Badge tone="ink">Tonight Only</Badge>
      <Badge tone="neutral">Veg</Badge>
    </div>
  ),
};

export const StatusTones: Story = {
  name: 'tone="success" · "warning" · "danger"',
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge tone="success">Confirmed</Badge>
      <Badge tone="warning">Kitchen Busy</Badge>
      <Badge tone="danger">Sold Out</Badge>
    </div>
  ),
};

export const WithIcon: Story = {
  name: "icon",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge tone="soft" icon={Flame}>
        Hot
      </Badge>
      <Badge tone="success" icon={Leaf}>
        100% Veg
      </Badge>
      <Badge tone="brand" icon={Star}>
        Chef Pick
      </Badge>
    </div>
  ),
};

/** In context: the markers on a menu card, above the dish name. */
export const OnAMenuCard: Story = {
  name: "in context: on a menu card",
  render: () => (
    <div className="grid max-w-72 gap-2 rounded-lg bg-surface-card p-4 shadow-1">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="brand">Bestseller</Badge>
        <Badge tone="soft" icon={Flame}>
          Hot
        </Badge>
      </div>
      <h4 className="m-0">Paneer Tikka Masala</h4>
      <p className="m-0 font-body text-body-sm text-text-muted">₹280</p>
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Badge tone="brand">Bestseller</Badge>
      <Badge tone="soft">New</Badge>
      <Badge tone="ink">Signature</Badge>
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { Badge, type BadgeProps } from "./atoms/badge/badge";
```

- [ ] **Step 8: Gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/badge packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens packages/design-tokens/contrast-pairs.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: green; Storybook builds.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the Badge atom, seven tones of uppercase status marker

Status tones use the AA text tokens on their soft fills; the brand tone turns
white on a pink field through a surface token so it never vanishes. Labels
never wrap and truncate inside the pill.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

