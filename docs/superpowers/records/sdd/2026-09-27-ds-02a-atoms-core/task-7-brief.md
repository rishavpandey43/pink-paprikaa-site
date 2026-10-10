### Task 7: IconButton

**Dev reference:** `git show dev:packages/ui/src/atoms/icon-button/icon-button.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                                                                          | Ruling  | Where / reason                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| `on="brand"` compound skins                                                                                                       | DROP    | D5 — primary and ghost follow the surface (Step 1 tokens)                                                    |
| Two-element hit target (a 44px `min-h`/`min-w` button around the drawn circle)                                                    | ALREADY | a transparent `::before` pads sm/md to 44px; lg is 48px                                                      |
| Secondary on semantic `text-text-link` / `border-border-default`                                                                  | ALREADY | a filled skin uses fixed primitives (atom-tier rule "Skins on surfaces")                                     |
| Glass carries `shadow-elevation2` and hovers to card white                                                                        | DROP    | `IconButton.jsx` gives glass no hover; the card passes the shadow (`className="shadow-2"`, `Variants` story) |
| `size-8/10/12`, `rounded-6`, `(--layout-hit-min)`                                                                                 | DROP    | D4; `icon-button-*` tokens                                                                                   |
| Tests: name from `label`, 44px target, `onClick`, disabled blocks, variants, sizes, grey disabled fill, one decorative glyph, axe | ALREADY | Step 2                                                                                                       |
| Test: caller className replaces the radius                                                                                        | ADD     | Step 2                                                                                                       |
| Stories `Default`, `Variants`, `Sizes`, `OnBrand`                                                                                 | ALREADY | `Playground`, `Variants`, `Sizes`, `OnBrand` + `OnSurfaces`                                                  |
| Story `OverPhotography` (glass on a dark ground)                                                                                  | ADD     | Step 6                                                                                                       |
| Story `States` (a disabled secondary too)                                                                                         | ADD     | Step 6 `Disabled` renders primary and secondary                                                              |

Implementer: copy this table into your report, extended with anything the plan missed.

Source: `components/atoms/IconButton.{jsx,d.ts,card.html,prompt.md}`; the count bubble is from `organisms/SiteHeader.jsx`.

**Visuals:**

- Circles of 32 / 40 / 48px with 16 / 20 / 24px glyphs.
- `ghost` (default): transparent, ink-700, hover pink-50.
- `primary`: pink-500, white.
- `secondary`: white, pink-600, 1px border-default.
- `glass`: `--surface-glass` + `--blur-glass`, ink-900.
- Count bubble: 18px pill at −2px/−2px, pink-500 fill, white Poppins 700 at 10.5px, 5px side padding.

**Deliberate differences from the zip:**

- Disabled is the grey fill (readme §3.8), not the zip's 45% opacity.
- `primary` reuses Button's primary tokens, so it turns white on a pink field (the zip left it pink-on-pink).
- sm and md keep a 44px touch target through a transparent `::before` (spec §9.1).

**Files:**

- Create: `packages/design-tokens/tokens/component/icon-button.json`
- Modify: `tokens/surface/brand.json`, `tokens/surface/ink.json`, `tokens/surface/light.json`, `packages/design-tokens/contrast-pairs.json`
- Create: `packages/ui/src/atoms/icon-button/icon-button.tsx`, `icon-button.test.tsx`, `icon-button.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`, `TEXT`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `Icon`, `IconComponent`, `controlStates`, `Slot`; Button's `color-button-primary-{bg,bg-hover,bg-active,fg}` and `color-button-hover-tint` (Task 6); `OnSurfaces`.
- Produces: `IconButton`, `interface IconButtonProps extends Omit<ComponentProps<"button">, "children" | "aria-label">` with `children?: ReactElement` (contract deviation 1); tokens `spacing-icon-button-{sm,md,lg,count}`, `text-icon-button-count`, `color-icon-button-ghost-fg`.

- [ ] **Step 1: Component tokens, surface skins, contrast pairs**

`packages/design-tokens/tokens/component/icon-button.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "icon-button-sm": {
      "$value": "32px",
      "$description": "Drawn size; a ::before keeps the 44px hit area."
    },
    "icon-button-md": {
      "$value": "40px",
      "$description": "Drawn size; a ::before keeps the 44px hit area."
    },
    "icon-button-lg": { "$value": "48px", "$description": "The app size (touch surfaces)." },
    "icon-button-count": {
      "$value": "18px",
      "$description": "Cart-count bubble height and minimum width."
    }
  },
  "text": {
    "$type": "typography",
    "icon-button-count": {
      "$value": { "fontSize": "10.5px", "lineHeight": 1, "fontWeight": "{font-weight.bold}" }
    }
  },
  "color": {
    "$type": "color",
    "icon-button": {
      "ghost": {
        "fg": {
          "$value": "{color.ink.700}",
          "$description": "Ghost glyph; white on pink and ink fields."
        }
      }
    }
  }
}
```

`tokens/surface/brand.json` and `tokens/surface/ink.json`: inside `surface-<name>.color`, add:

```json
"icon-button": { "ghost": { "fg": { "$value": "{color.ink.000}" } } }
```

`tokens/surface/light.json`: inside `surface-light.color`, add:

```json
"icon-button": { "ghost": { "fg": { "$value": "{color.ink.700}" } } }
```

`packages/design-tokens/contrast-pairs.json`: append to `groups`:

```json
{
  "id": "icon-button",
  "surface": null,
  "pairs": [
    ["color-icon-button-ghost-fg", "color-surface-page"],
    ["color-icon-button-ghost-fg", "color-button-hover-tint"],
    ["color-pink-600", "color-ink-000"],
    ["color-pink-600", "color-pink-50"],
    ["color-ink-900", "color-surface-glass"]
  ],
  "min": 4.5
},
{
  "id": "icon-button-count",
  "surface": null,
  "pairs": [["color-ink-000", "color-pink-500"]],
  "min": 3,
  "exception": "brand-fill"
},
{
  "id": "icon-button-on-soft",
  "surface": "soft",
  "pairs": [["color-icon-button-ghost-fg", "color-surface-brand-soft"]],
  "min": 4.5
},
{
  "id": "icon-button-on-ink",
  "surface": "ink",
  "pairs": [["color-icon-button-ghost-fg", "color-surface-inverse"]],
  "min": 4.5
},
{
  "id": "icon-button-on-brand",
  "surface": "brand",
  "pairs": [["color-icon-button-ghost-fg", "color-surface-brand"]],
  "min": 3,
  "exception": "brand-fill"
}
```

(Glass is measured over white. Over photography the scrim, not a token pair, owns legibility: readme §3.9.)

In `component-variants.ts`, append to `SPACING`: `"icon-button-sm", "icon-button-md", "icon-button-lg", "icon-button-count",`; to `TEXT`: `"icon-button-count",`.

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -6` → PASS.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/icon-button/icon-button.test.tsx`:

```tsx
import type { ComponentProps } from "react";

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Heart, ShoppingBag } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { IconButton } from "./icon-button";

function RouterLink({ children, ...props }: ComponentProps<"a">) {
  return (
    <a data-router="" {...props}>
      {children}
    </a>
  );
}

describe("IconButton", () => {
  it("is a button of type button named by its label; the glyph is decorative", () => {
    render(<IconButton icon={Heart} label="Save" />);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("type", "button");
    expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("cannot be written without a name (Review Focus 2)", () => {
    // @ts-expect-error — an icon-only control without `label` must not compile (spec §5.5)
    render(<IconButton icon={Heart} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("reads the cart count out with its label and draws the bubble (Review Focus 2)", () => {
    render(<IconButton icon={ShoppingBag} label="Your order" count={3} />);
    const button = screen.getByRole("button", { name: "Your order (3)" });
    const bubble = within(button).getByText("3");
    expect(bubble).toHaveAttribute("aria-hidden", "true");
    expect(bubble).toHaveClass(
      "absolute",
      "h-icon-button-count",
      "min-w-icon-button-count",
      "text-icon-button-count"
    );
  });

  it.each([0, undefined])("draws no bubble for a count of %s", (count) => {
    render(
      <IconButton
        icon={ShoppingBag}
        label="Your order"
        {...(count === undefined ? {} : { count })}
      />
    );
    const button = screen.getByRole("button", { name: "Your order" });
    expect(button.querySelector(".absolute")).toBeNull();
  });

  it.each([
    ["ghost", "bg-transparent", "text-icon-button-ghost-fg"],
    ["primary", "bg-button-primary-bg", "text-button-primary-fg"],
    ["secondary", "bg-ink-000", "text-pink-600"],
    ["glass", "bg-surface-glass", "backdrop-blur-glass"],
  ] as const)("paints the %s variant with %s and %s", (variant, fill, detail) => {
    render(<IconButton icon={Heart} label="Save" variant={variant} />);
    expect(screen.getByRole("button")).toHaveClass(fill, detail);
  });

  it("is ghost by default and tints on hover with the shared, surface-aware tint", () => {
    render(<IconButton icon={Heart} label="Save" />);
    expect(screen.getByRole("button")).toHaveClass("bg-transparent", "hover:bg-button-hover-tint");
  });

  it.each([
    ["sm", "size-icon-button-sm", "size-icon-sm", "before:-inset-1.5"],
    ["md", "size-icon-button-md", "size-icon-md", "before:-inset-0.5"],
  ] as const)(
    "draws %s at %s with a %s glyph and pads the hit area to 44px (%s)",
    (size, box, glyph, hitArea) => {
      render(<IconButton icon={Heart} label="Save" size={size} />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("relative", box, "before:absolute", hitArea);
      expect(button.firstElementChild).toHaveClass(glyph);
    }
  );

  it("draws lg at 48px with a 24px glyph and needs no hit-area pad", () => {
    render(<IconButton icon={Heart} label="Save" size="lg" />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("size-icon-button-lg");
    expect(button.className).not.toMatch(/before:/);
    expect(button.firstElementChild).toHaveClass("size-icon-lg");
  });

  it("fires from the pointer and the keyboard", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<IconButton icon={Heart} label="Save" onClick={onClick} />);
    await user.click(screen.getByRole("button"));
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("uses the grey disabled fill and blocks presses", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<IconButton icon={Heart} label="Save" variant="primary" disabled onClick={onClick} />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:bg-ink-200", "disabled:text-ink-400");
    expect(button.className).not.toMatch(/opacity/);
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders a router link through asChild with the glyph and the name, never a button type (Review Focus 3)", () => {
    render(
      <IconButton asChild icon={ShoppingBag} label="Your order" count={2}>
        <RouterLink href="/cart" />
      </IconButton>
    );
    const link = screen.getByRole("link", { name: "Your order (2)" });
    expect(link).toHaveAttribute("href", "/cart");
    expect(link).toHaveAttribute("data-router");
    expect(link).not.toHaveAttribute("type");
    expect(link.querySelector(".lucide-shopping-bag")).not.toBeNull();
  });

  it("lets a consumer className replace its radius", () => {
    render(<IconButton icon={Heart} label="Save" className="rounded-md" />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("rounded-md");
    expect(button).not.toHaveClass("rounded-pill");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <IconButton icon={Heart} label="Save" />
        <IconButton icon={ShoppingBag} label="Your order" count={3} variant="primary" />
        <IconButton icon={Heart} label="Save" disabled />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: FAIL — `Failed to resolve import "./icon-button"`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/icon-button/icon-button.tsx`:

```tsx
import type { ComponentProps, ElementType, ReactElement } from "react";

import { Slot } from "radix-ui";

import { componentVariants } from "../../lib/component-variants";
import { controlStates } from "../../lib/control-states";
import { Icon, type IconComponent } from "../icon/icon";

export interface IconButtonProps extends Omit<ComponentProps<"button">, "children" | "aria-label"> {
  icon: IconComponent;
  /** The accessible name — required: an icon-only control has no other (spec §5.5). */
  label: string;
  /** ghost (default) · primary · secondary · glass (over photography). */
  variant?: "primary" | "secondary" | "ghost" | "glass";
  /** Drawn at 32 / 40 / 48px; sm and md keep a 44px touch target. */
  size?: "sm" | "md" | "lg";
  /** Cart-style count bubble, read out with the label ("Your order (3)"). Hidden at 0. */
  count?: number;
  /** Render as the single child element (e.g. `<Link href="/cart" />`); the glyph replaces its content. */
  asChild?: boolean;
  /** Only with `asChild`: the element to render as. */
  children?: ReactElement;
}

const iconButton = componentVariants({
  slots: {
    root: [
      controlStates(),
      "relative inline-flex shrink-0 items-center justify-center rounded-pill active:press-scale",
    ],
    count:
      "h-icon-button-count min-w-icon-button-count text-icon-button-count pointer-events-none absolute -top-0.5 -right-0.5 grid place-items-center rounded-pill bg-pink-500 px-1.25 font-display text-ink-000",
  },
  variants: {
    variant: {
      // Primary shares Button's surface-aware primary skin: white on a pink field.
      primary: {
        root: "bg-button-primary-bg text-button-primary-fg hover:bg-button-primary-bg-hover active:bg-button-primary-bg-active",
      },
      secondary: { root: "border border-ink-300 bg-ink-000 text-pink-600 hover:bg-pink-50" },
      ghost: { root: "text-icon-button-ghost-fg hover:bg-button-hover-tint bg-transparent" },
      glass: { root: "bg-surface-glass text-ink-900 backdrop-blur-glass" },
    },
    size: {
      // A transparent ::before pads the drawn circle out to the 44px touch target.
      sm: { root: "size-icon-button-sm before:absolute before:-inset-1.5" },
      md: { root: "size-icon-button-md before:absolute before:-inset-0.5" },
      lg: { root: "size-icon-button-lg" },
    },
  },
  defaultVariants: { variant: "ghost", size: "md" },
});

/** Circular, icon-only button for toolbars, card overlays and app headers. */
export function IconButton({
  icon,
  label,
  variant,
  size = "md",
  count,
  asChild = false,
  disabled = false,
  type = "button",
  className,
  children,
  ...props
}: IconButtonProps) {
  const slots = iconButton({ variant, size });
  const Component: ElementType = asChild ? Slot.Root : "button";
  const hasCount = count !== undefined && count > 0;
  const state = asChild ? { "aria-disabled": disabled || undefined } : { type, disabled };
  return (
    <Component
      className={slots.root({ className })}
      aria-label={hasCount ? `${label} (${String(count)})` : label}
      {...state}
      {...props}
    >
      <Slot.Slottable child={children}>{() => <Icon icon={icon} size={size} />}</Slot.Slottable>
      {hasCount ? (
        <span aria-hidden className={slots.count()}>
          {String(count)}
        </span>
      ) : null}
    </Component>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: PASS.

- [ ] **Step 6: Stories**

Card rows (`IconButton.card.html`): `variant` (ghost, primary, secondary, glass with `shadow-2`), `size`, `on="brand"` (→ a brand surface), `disabled`. Extras:

- `count`, from SiteHeader.
- `OverPhotography`: glass on a dark ground (dev parity); `disabled` shows primary and secondary.
- `IconOnly`: the Button card's "icon-only" row.
- `OnSurfaces`.
- `asChild`.

`packages/ui/src/atoms/icon-button/icon-button.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";

import { ArrowLeft, Heart, Plus, Search, Share2, ShoppingBag } from "lucide-react";

import { OnSurfaces } from "../../lib/story-surfaces";
import { IconButton } from "./icon-button";

function DemoRouterLink({ children, ...props }: ComponentProps<"a">) {
  return (
    <a data-router="" {...props}>
      {children}
    </a>
  );
}

const meta = {
  title: "Atoms/IconButton",
  component: IconButton,
  args: { icon: Heart, label: "Save", variant: "ghost", size: "md" },
  argTypes: { icon: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          'Circular icon-only button for toolbars, card overlays and app headers. Always pass `label` — it is the accessible name, and the type system requires it. `glass` is for buttons floating over food photography (translucent white + blur). sm and md draw at 32/40px but keep a 44px touch target; use `size="lg"` in the app. `count` draws the cart bubble and is read out with the label. On a pink field the ghost glyph turns white and primary turns white-on-pink, with no prop.',
      },
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  name: "variant",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton icon={Heart} label="Save" variant="ghost" />
      <IconButton icon={Plus} label="Add" variant="primary" />
      <IconButton icon={Search} label="Search" variant="secondary" />
      <IconButton icon={ArrowLeft} label="Back" variant="glass" className="shadow-2" />
    </div>
  ),
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton icon={Plus} label="Add" variant="primary" size="sm" />
      <IconButton icon={Plus} label="Add" variant="primary" size="md" />
      <IconButton icon={Plus} label="Add" variant="primary" size="lg" />
    </div>
  ),
};

export const OnBrand: Story = {
  name: "on a brand surface",
  render: () => (
    <div
      data-surface="brand"
      className="flex flex-wrap items-center gap-3 rounded-lg bg-surface-brand p-3.5"
    >
      <IconButton icon={Heart} label="Save" />
      <IconButton icon={Share2} label="Share" />
    </div>
  ),
};

export const Disabled: Story = {
  name: "disabled",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton icon={Plus} label="Add" variant="primary" disabled />
      <IconButton icon={Search} label="Search" variant="secondary" disabled />
    </div>
  ),
};

/** `glass` is the treatment for buttons floating over food photography (a dark stand-in here). */
export const OverPhotography: Story = {
  name: 'variant="glass" over a dark photo',
  render: () => (
    <div className="flex flex-wrap items-center gap-3 rounded-lg bg-surface-inverse p-6">
      <IconButton icon={ArrowLeft} label="Back" variant="glass" />
      <IconButton icon={Heart} label="Save" variant="glass" />
      <IconButton icon={Share2} label="Share" variant="glass" />
    </div>
  ),
};

export const Count: Story = {
  name: "count",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton icon={ShoppingBag} label="Your order" count={3} />
      <IconButton icon={ShoppingBag} label="Your order" count={12} />
    </div>
  ),
};

export const IconOnly: Story = {
  name: "icon-only (not a Button)",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton icon={ShoppingBag} label="Your order" variant="primary" size="lg" />
      <IconButton icon={Search} label="Search" variant="secondary" />
      <IconButton icon={Heart} label="Save" variant="ghost" />
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <IconButton icon={Heart} label="Save" />
      <IconButton icon={Plus} label="Add" variant="primary" />
      <IconButton icon={Search} label="Search" variant="secondary" />
    </OnSurfaces>
  ),
};

export const AsChild: Story = {
  name: "asChild (a link)",
  render: () => (
    <IconButton asChild icon={ShoppingBag} label="Your order" count={2}>
      <DemoRouterLink href="/cart" />
    </IconButton>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { IconButton, type IconButtonProps } from "./atoms/icon-button/icon-button";
```

- [ ] **Step 8: Gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/icon-button packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens packages/design-tokens/contrast-pairs.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: green; Storybook builds.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the IconButton atom with a required name and a 44px target

Four variants and three sizes; sm and md pad their hit area to 44px with a
transparent ::before. The label is required by type and the cart count joins
the accessible name. Primary and the hover tint reuse Button's surface tokens;
the ghost glyph turns white on pink and ink. Disabled is the grey fill.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

