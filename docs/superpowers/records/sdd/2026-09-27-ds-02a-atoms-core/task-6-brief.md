### Task 6: Button

**Dev reference:** `git show dev:packages/ui/src/atoms/button/button.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                                                                                                             | Ruling  | Where / reason                                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `on="brand"` compound skins                                                                                                                                          | DROP    | D5 — surface tokens flip primary, secondary and ghost (Step 1)                                                                                 |
| Loader is the pulsing brand diamond (`Spinner`)                                                                                                                      | DROP    | D14 (an atom imports only `atoms/icon`); spec §9.1 (loader glyph)                                                                              |
| `rounded-6`, `shadow-elevation2`, `h-(--button-h-*)`, `text-body1`                                                                                                   | DROP    | D4; AUTHORING §6                                                                                                                               |
| `not-disabled:` guards on hover and press                                                                                                                            | ALREADY | `controlStates`' `disabled:`/`aria-disabled:` classes sort after `hover:`/`active:`, and `aria-disabled:pointer-events-none` stops a busy link |
| Tests: `type="button"`, `onClick`, variants, sizes, the on-brand flip, two glyphs, loading keeps the label and disables, grey disabled fill, className override, axe | ALREADY | Step 2; the flip is proved in the `NestedSurfaces` play                                                                                        |
| Test: a disabled button does not call `onClick`                                                                                                                      | ADD     | Step 2                                                                                                                                         |
| Stories `Default`, `Variants`, `Sizes`, `WithIcons`, `OnBrand` (with ghost), `States`, `FullWidth`                                                                   | ALREADY | `Playground`, the card-row stories, `OnSurfaces` (ghost on brand), `Loading` + `Disabled`, `FullWidth`                                         |

Implementer: copy this table into your report, extended with anything the plan missed.

Source: `components/atoms/Button.{jsx,d.ts,card.html,prompt.md}`, readme §3.8, spec C9 and D8.

**Visuals** (every px from `Button.jsx`):

- Pill, Poppins 700, tracking −0.005em, line height 1, no wrap.
- Heights (and minimum widths) 36 / 44 / 54, padding 14 / 20 / 28px, gap 6 / 8 / 8, label 13 / 15 / 17px.
- `primary`: pink-500 fill, white, `--shadow-brand`.
- `secondary`: white fill, pink-600, 2px pink-500 border.
- `ghost`: transparent, pink-600.
- `inverse`: ink-900 fill, white, `--shadow-2`.
- Glyphs are 16px at sm and 20px at md/lg. The loader is 20px, or 24px at lg.
- Disabled: ink-200 fill, ink-400 text, no border, no shadow.

**States** (readme §3.8, all CSS):

- Hover darkens primary to `--brand-hover` and tints secondary/ghost to pink-50.
- Press is the 0.97 scale in 80ms, plus `--brand-active` on primary.

**On a pink field** (the zip's `on="brand"`, now surface-driven):

- primary → white fill, pink-600 text, `--shadow-2`.
- secondary → transparent, white text, 2px white-70% border.
- ghost → white text.
- inverse → stays solid ink (C9).

The handoff also passes `on="brand"` to secondary buttons **on ink** sections, so the secondary skin flips on ink too, while primary on ink stays pink.

**Files:**

- Create: `packages/design-tokens/tokens/component/button.json`
- Modify: `packages/design-tokens/tokens/primitive/color.json`, `tokens/surface/brand.json`, `tokens/surface/ink.json`, `tokens/surface/light.json`, `packages/design-tokens/contrast-pairs.json`
- Create: `packages/ui/src/atoms/button/button.tsx`, `button.test.tsx`, `button.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`, `TEXT`, `SHADOW`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `Icon`, `IconComponent`; `controlStates` (`lib/control-states`); `Slot`; `LoaderCircle` from `lucide-react`; `text-text-link`; `active:press-scale`; `animate-rotate`; `OnSurfaces` (stories).
- Produces: `Button`, `interface ButtonProps extends ComponentProps<"button">` (contracts §2), `buttonVariants` (slots `root`, `label`, `loader`; variants `variant`, `size`, `isFullWidth`), shared by any Radix trigger that must look like a Button: `buttonVariants({ variant: "secondary" }).root()`. Tokens `spacing-button-h-{sm,md,lg}`, `text-button-{sm,md,lg}`, `color-button-primary-{bg,bg-hover,bg-active,fg}`, `color-button-secondary-{bg,border}`, `color-button-hover-tint`, `shadow-button-primary`, primitive `color-white-alpha-16`. **IconButton (Task 7) reuses `button-primary-*` and `button-hover-tint`.**

- [ ] **Step 1: Component tokens, surface skins, contrast pairs**

In `tokens/primitive/color.json`, inside `color.white-alpha`, add (keys ascending):

```json
"16": { "$value": "rgba(255, 255, 255, 0.16)" },
```

`packages/design-tokens/tokens/component/button.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "button-h-sm": { "$value": "36px", "$description": "Button sm height and minimum width." },
    "button-h-md": {
      "$value": "44px",
      "$description": "Button md height — the touch-target minimum."
    },
    "button-h-lg": { "$value": "54px", "$description": "Button lg height and minimum width." }
  },
  "text": {
    "$type": "typography",
    "button-sm": {
      "$value": {
        "fontSize": "13px",
        "lineHeight": 1,
        "letterSpacing": "-0.005em",
        "fontWeight": "{font-weight.bold}"
      }
    },
    "button-md": {
      "$value": {
        "fontSize": "15px",
        "lineHeight": 1,
        "letterSpacing": "-0.005em",
        "fontWeight": "{font-weight.bold}"
      }
    },
    "button-lg": {
      "$value": {
        "fontSize": "17px",
        "lineHeight": 1,
        "letterSpacing": "-0.005em",
        "fontWeight": "{font-weight.bold}"
      }
    }
  },
  "color": {
    "$type": "color",
    "button": {
      "primary": {
        "bg": { "$value": "{color.surface.brand}" },
        "bg-hover": { "$value": "{color.brand.hover}" },
        "bg-active": { "$value": "{color.brand.active}" },
        "fg": { "$value": "{color.text.on-brand}" }
      },
      "secondary": {
        "bg": { "$value": "{color.ink.000}" },
        "border": { "$value": "{color.pink.500}" }
      },
      "hover-tint": {
        "$value": "{color.pink.50}",
        "$description": "Hover fill of secondary and ghost Buttons and ghost IconButtons."
      }
    }
  },
  "shadow": {
    "$type": "shadow",
    "button-primary": {
      "$value": "{shadow.brand}",
      "$description": "The brand glow — primary CTAs only; shadow-2 on a pink field."
    }
  }
}
```

`tokens/surface/brand.json`: inside `surface-brand.color`, add:

```json
"button": {
  "primary": {
    "bg": { "$value": "{color.ink.000}" },
    "bg-hover": { "$value": "{color.pink.50}" },
    "bg-active": { "$value": "{color.ink.100}" },
    "fg": { "$value": "{color.pink.600}" }
  },
  "secondary": {
    "bg": { "$value": "transparent" },
    "border": { "$value": "{color.white-alpha.70}" }
  },
  "hover-tint": { "$value": "{color.white-alpha.16}" }
}
```

and inside `surface-brand.shadow`, add `"button-primary": { "$value": "{shadow.2}" }`.

(The pressed white button darkens to ink-100: pink-600 on it measures 4.70. Pink-100 would be the obvious "darker" step, but it measures 4.08 and fails.)

`tokens/surface/ink.json`: inside `surface-ink.color`, add (primary stays pink on ink):

```json
"button": {
  "secondary": {
    "bg": { "$value": "transparent" },
    "border": { "$value": "{color.white-alpha.70}" }
  },
  "hover-tint": { "$value": "{color.white-alpha.16}" }
}
```

`tokens/surface/light.json`: inside `surface-light.color`, add:

```json
"button": {
  "primary": {
    "bg": { "$value": "{color.surface.brand}" },
    "bg-hover": { "$value": "{color.brand.hover}" },
    "bg-active": { "$value": "{color.brand.active}" },
    "fg": { "$value": "{color.text.on-brand}" }
  },
  "secondary": {
    "bg": { "$value": "{color.ink.000}" },
    "border": { "$value": "{color.pink.500}" }
  },
  "hover-tint": { "$value": "{color.pink.50}" }
}
```

and inside `surface-light.shadow`, add `"button-primary": { "$value": "{shadow.brand}" }`.

`packages/design-tokens/contrast-pairs.json`: append to `groups`:

```json
{
  "id": "button",
  "surface": null,
  "pairs": [
    ["color-button-primary-fg", "color-button-primary-bg-hover"],
    ["color-button-primary-fg", "color-button-primary-bg-active"],
    ["color-text-link", "color-button-secondary-bg"],
    ["color-text-link", "color-button-hover-tint"],
    ["color-ink-000", "color-ink-900"]
  ],
  "min": 4.5
},
{
  "id": "button-primary-fill",
  "surface": null,
  "pairs": [["color-button-primary-fg", "color-button-primary-bg"]],
  "min": 3,
  "exception": "brand-fill"
},
{
  "id": "button-on-soft",
  "surface": "soft",
  "pairs": [
    ["color-text-link", "color-button-secondary-bg"],
    ["color-text-link", "color-button-hover-tint"]
  ],
  "min": 4.5
},
{
  "id": "button-on-brand",
  "surface": "brand",
  "pairs": [
    ["color-button-primary-fg", "color-button-primary-bg"],
    ["color-button-primary-fg", "color-button-primary-bg-hover"],
    ["color-button-primary-fg", "color-button-primary-bg-active"]
  ],
  "min": 4.5
},
{
  "id": "button-tint-on-brand",
  "surface": "brand",
  "pairs": [["color-text-link", "color-button-hover-tint"]],
  "backdrop": "color-surface-brand",
  "min": 3,
  "exception": "brand-fill"
},
{
  "id": "button-tint-on-ink",
  "surface": "ink",
  "pairs": [["color-text-link", "color-button-hover-tint"]],
  "backdrop": "color-surface-inverse",
  "min": 4.5
}
```

(Measured: white on pink-600 5.18, on pink-700 7.19; pink-600 on white 5.18, on pink-50 4.85; pink-700 on white 7.19; white on ink-900 18.39; white on pink 4.04; pink-600 on ink-100 4.70; white on a 16% white tint over pink 3.43, over ink 11.43.)

In `component-variants.ts`, append to `SPACING`: `"button-h-sm", "button-h-md", "button-h-lg",`; to `TEXT`: `"button-sm", "button-md", "button-lg",`; to `SHADOW`: `"button-primary",`.

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -6`
Expected: PASS. Contrast groups, light restore (every brand/ink button override appears in the light block with its base value) and the alias guard (`color-button-primary-bg → color.surface.brand` is not overridden anywhere) all hold.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/button/button.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ArrowRight, ShoppingBag } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Button } from "./button";

describe("Button", () => {
  it("is a native button of type button, named by its label", () => {
    render(<Button>Order Now</Button>);
    expect(screen.getByRole("button", { name: "Order Now" })).toHaveAttribute("type", "button");
  });

  it("keeps a submit type when asked", () => {
    render(<Button type="submit">Pay ₹1,240</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("fires from the pointer and from Enter and Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Order Now</Button>);
    await user.click(screen.getByRole("button", { name: "Order Now" }));
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it.each([
    ["primary", "bg-button-primary-bg", "text-button-primary-fg"],
    ["secondary", "bg-button-secondary-bg", "text-text-link"],
    ["ghost", "bg-transparent", "text-text-link"],
    ["inverse", "bg-ink-900", "text-ink-000"],
  ] as const)("paints the %s variant with %s and %s", (variant, fill, text) => {
    render(<Button variant={variant}>Order</Button>);
    expect(screen.getByRole("button")).toHaveClass(fill, text);
  });

  it("paints every skin that must flip on a pink or ink field with a surface-following token", () => {
    render(
      <>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
      </>
    );
    expect(screen.getByRole("button", { name: "Primary" })).toHaveClass(
      "shadow-button-primary",
      "hover:bg-button-primary-bg-hover",
      "active:bg-button-primary-bg-active"
    );
    expect(screen.getByRole("button", { name: "Secondary" })).toHaveClass(
      "border-2",
      "border-button-secondary-border",
      "hover:bg-button-hover-tint"
    );
    expect(screen.getByRole("button", { name: "Ghost" })).toHaveClass("hover:bg-button-hover-tint");
  });

  it("keeps inverse solid ink on every surface (spec C9)", () => {
    render(<Button variant="inverse">Book</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-ink-900", "text-ink-000", "shadow-2");
    expect(button.className).not.toMatch(/(bg|shadow|border)-button-/);
  });

  it.each([
    ["sm", "h-button-h-sm", "min-w-button-h-sm", "px-3.5", "text-button-sm"],
    ["md", "h-button-h-md", "min-w-button-h-md", "px-5", "text-button-md"],
    ["lg", "h-button-h-lg", "min-w-button-h-lg", "px-7", "text-button-lg"],
  ] as const)("sizes %s with %s, %s, %s and %s", (size, height, minWidth, padding, label) => {
    render(<Button size={size}>Order</Button>);
    expect(screen.getByRole("button")).toHaveClass(
      height,
      minWidth,
      padding,
      label,
      "font-display"
    );
  });

  it.each([
    ["sm", "size-icon-sm"],
    ["md", "size-icon-md"],
    ["lg", "size-icon-md"],
  ] as const)("draws %s glyphs at %s, leading and trailing the label", (size, glyph) => {
    render(
      <Button size={size} icon={ShoppingBag} iconAfter={ArrowRight}>
        Order
      </Button>
    );
    const [leading, label, trailing] = [...screen.getByRole("button").children];
    expect(leading).toHaveClass(glyph);
    expect(label).toHaveTextContent("Order");
    expect(trailing).toHaveClass(glyph);
  });

  it("keeps its glyphs decorative, so the label alone names it", () => {
    render(
      <Button icon={ShoppingBag} iconAfter={ArrowRight}>
        Order Now
      </Button>
    );
    const button = screen.getByRole("button", { name: "Order Now" });
    for (const glyph of button.querySelectorAll("svg")) {
      expect(glyph).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("while loading, swaps the leading glyph for a spinning loader, reports busy and blocks presses", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button icon={ShoppingBag} isLoading onClick={onClick}>
        Placing order
      </Button>
    );
    const button = screen.getByRole("button", { name: "Placing order" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();
    expect(button.querySelector(".lucide-loader-circle")).not.toBeNull();
    expect(button.querySelector(".lucide-shopping-bag")).toBeNull();
    expect(button.firstElementChild).toHaveClass("animate-rotate");
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it.each([
    ["sm", "size-icon-md"],
    ["md", "size-icon-md"],
    ["lg", "size-icon-lg"],
  ] as const)("sizes the %s loader at %s", (size, glyph) => {
    render(
      <Button size={size} isLoading>
        Checking code
      </Button>
    );
    expect(screen.getByRole("button").firstElementChild).toHaveClass(glyph);
  });

  it("uses a real grey fill when disabled, never an opacity fade", () => {
    render(<Button disabled>Sold Out</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass(
      "disabled:bg-ink-200",
      "disabled:text-ink-400",
      "disabled:shadow-none",
      "disabled:cursor-not-allowed"
    );
    expect(button.className).not.toMatch(/opacity/);
  });

  it("does not fire while disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Sold Out
      </Button>
    );
    await user.click(screen.getByRole("button", { name: "Sold Out" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("presses with the brand scale and the control transition", () => {
    render(<Button>Order</Button>);
    expect(screen.getByRole("button")).toHaveClass("active:press-scale", "transition-control");
  });

  it("fills its container when isFullWidth", () => {
    render(<Button isFullWidth>Pay ₹1,240</Button>);
    expect(screen.getByRole("button")).toHaveClass("flex", "w-full");
    expect(screen.getByRole("button")).not.toHaveClass("inline-flex");
  });

  it("never wraps or overflows its container — a long label truncates inside the pill (Review Focus 1)", () => {
    const label = "Order the full Sunday thali for the whole family";
    render(<Button icon={ShoppingBag}>{label}</Button>);
    const button = screen.getByRole("button", { name: label });
    expect(button).toHaveClass("whitespace-nowrap", "max-w-full", "shrink-0");
    expect(screen.getByText(label)).toHaveClass("min-w-0", "truncate");
    expect(button.firstElementChild).toHaveClass("shrink-0");
  });

  describe("asChild (Review Focus 3)", () => {
    it("renders the child anchor with Button styling, glyphs and label — and no button-only attributes", () => {
      render(
        <Button asChild variant="secondary" icon={ShoppingBag} className="mt-2">
          <a href="https://wa.me/919090704001">Order on WhatsApp</a>
        </Button>
      );
      const link = screen.getByRole("link", { name: "Order on WhatsApp" });
      expect(link).toHaveAttribute("href", "https://wa.me/919090704001");
      expect(link).not.toHaveAttribute("type");
      expect(link).not.toHaveAttribute("disabled");
      expect(link).toHaveClass("bg-button-secondary-bg", "mt-2");
      expect(link.querySelector(".lucide-shopping-bag")).not.toBeNull();
      expect(screen.getByText("Order on WhatsApp")).toHaveClass("truncate");
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("marks a loading link busy and disabled for assistive tech, and stops the pointer", () => {
      render(
        <Button asChild isLoading>
          <a href="/order">Placing order</a>
        </Button>
      );
      const link = screen.getByRole("link", { name: "Placing order" });
      expect(link).toHaveAttribute("aria-busy", "true");
      expect(link).toHaveAttribute("aria-disabled", "true");
      expect(link).toHaveClass("aria-disabled:pointer-events-none");
    });
  });

  it("lets a consumer className override its own", () => {
    render(<Button className="px-9">Order</Button>);
    expect(screen.getByRole("button")).toHaveClass("px-9");
    expect(screen.getByRole("button")).not.toHaveClass("px-5");
  });

  it("has no accessibility violations in its default, loading, disabled and link forms", async () => {
    const { container } = render(
      <>
        <Button icon={ShoppingBag}>Order Now</Button>
        <Button isLoading>Placing order</Button>
        <Button disabled>Sold Out</Button>
        <Button asChild iconAfter={ArrowRight}>
          <a href="/menu">Full Menu</a>
        </Button>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: FAIL — `Failed to resolve import "./button"`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/button/button.tsx`:

```tsx
import type { ComponentProps, ElementType } from "react";

import { LoaderCircle } from "lucide-react";
import { Slot } from "radix-ui";

import { componentVariants } from "../../lib/component-variants";
import { controlStates } from "../../lib/control-states";
import { Icon, type IconComponent } from "../icon/icon";

export interface ButtonProps extends ComponentProps<"button"> {
  /** primary = flooded pink · secondary = pink outline · ghost = text only · inverse = ink. */
  variant?: "primary" | "secondary" | "ghost" | "inverse";
  size?: "sm" | "md" | "lg";
  /** Glyph before the label — names the action. */
  icon?: IconComponent;
  /** Glyph after the label — onward motion (arrow-right, arrow-up-right, chevron-down). */
  iconAfter?: IconComponent;
  isFullWidth?: boolean;
  /** Swaps the leading glyph for a spinner, sets `aria-busy` and blocks presses. */
  isLoading?: boolean;
  /** Render the single child (`<a href>`, `next/link`) with Button styling. */
  asChild?: boolean;
}

/**
 * The Button's classes. Exported so a Radix trigger can look like a Button:
 * `buttonVariants({ variant: "secondary" }).root()`.
 *
 * `primary`, `secondary` and the hover tint paint with surface-aware tokens (`surface/*.json`),
 * so on a pink field primary turns white and secondary a white outline with no prop; ghost and
 * secondary text use the semantic link colour, which flips too. `inverse` is solid ink everywhere.
 */
export const buttonVariants = componentVariants({
  slots: {
    root: [
      controlStates(),
      "inline-flex max-w-full shrink-0 items-center justify-center rounded-pill font-display whitespace-nowrap active:press-scale",
    ],
    label: "min-w-0 truncate",
    loader: "animate-rotate",
  },
  variants: {
    variant: {
      primary: {
        root: "bg-button-primary-bg text-button-primary-fg shadow-button-primary hover:bg-button-primary-bg-hover active:bg-button-primary-bg-active",
      },
      secondary: {
        root: "border-button-secondary-border bg-button-secondary-bg hover:bg-button-hover-tint border-2 text-text-link",
      },
      ghost: { root: "hover:bg-button-hover-tint bg-transparent text-text-link" },
      inverse: { root: "bg-ink-900 text-ink-000 shadow-2" },
    },
    size: {
      sm: { root: "h-button-h-sm min-w-button-h-sm text-button-sm gap-1.5 px-3.5" },
      md: { root: "h-button-h-md min-w-button-h-md text-button-md gap-2 px-5" },
      lg: { root: "h-button-h-lg min-w-button-h-lg text-button-lg gap-2 px-7" },
    },
    isFullWidth: { true: { root: "flex w-full" } },
  },
  defaultVariants: { variant: "primary", size: "md", isFullWidth: false },
});

/** Glyph 16px at sm, 20px at md and lg; the loader 20px, 24px at lg (design system Button.jsx). */
const GLYPH_SIZE = { sm: "sm", md: "md", lg: "md" } as const;
const LOADER_SIZE = { sm: "md", md: "md", lg: "lg" } as const;

/** The brand's action button — pill, Poppins 700, Title Case label. */
export function Button({
  variant,
  size = "md",
  icon,
  iconAfter,
  isFullWidth = false,
  isLoading = false,
  asChild = false,
  disabled = false,
  type = "button",
  className,
  children,
  ...props
}: ButtonProps) {
  const slots = buttonVariants({ variant, size, isFullWidth });
  const Component: ElementType = asChild ? Slot.Root : "button";
  // A slotted <a> must not get `type` or `disabled`; it says so with aria-disabled instead.
  const state = asChild
    ? { "aria-disabled": disabled || isLoading || undefined }
    : { type, disabled: disabled || isLoading };
  const leading = isLoading ? LoaderCircle : icon;
  return (
    <Component
      className={slots.root({ className })}
      aria-busy={isLoading || undefined}
      {...state}
      {...props}
    >
      {leading ? (
        <Icon
          icon={leading}
          size={isLoading ? LOADER_SIZE[size] : GLYPH_SIZE[size]}
          className={isLoading ? slots.loader() : undefined}
        />
      ) : null}
      <Slot.Slottable child={children}>
        {(label) => <span className={slots.label()}>{label}</span>}
      </Slot.Slottable>
      {iconAfter ? <Icon icon={iconAfter} size={GLYPH_SIZE[size]} /> : null}
    </Component>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: PASS.

- [ ] **Step 6: Stories**

Card rows (`Button.card.html`), one story each: `variant`, `size`, `icon`, `iconAfter`, `both`, `icon × size`, `iconAfter × size`, `icon on brand`, `loading` (→ `isLoading`), `disabled`, `fullWidth` (→ `isFullWidth`). The card's `icon-only` row lives in `Atoms/IconButton` (story `IconOnly`, Task 7), because an atom's story may not import another atom. Extras:

- `OnSurfaces`.
- `NestedSurfaces`: Review Focus 5, `play` reads computed backgrounds.
- `asChild`.
- `LongLabel`: Review Focus 1, `play` measures layout.

`packages/ui/src/atoms/button/button.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  ChevronDown,
  MapPin,
  MessageCircle,
  Search,
  ShoppingBag,
} from "lucide-react";
import { expect, within } from "storybook/test";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Button } from "./button";

const meta = {
  title: "Atoms/Button",
  component: Button,
  args: { children: "Order Now", variant: "primary", size: "md" },
  argTypes: { icon: { control: false }, iconAfter: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          "The brand's action button — pill, Poppins 700, Title Case; use `primary` once per view. Variants: `primary` (flooded pink + the brand glow), `secondary` (2px pink outline on white), `ghost` (text only), `inverse` (ink). On a flooded pink field the skins follow the surface — primary flips to white-on-pink, secondary and ghost to white — with no prop to pass; inverse stays ink. Press = 0.97 scale + darken; disabled is a real grey fill, not opacity. Leading icons name the action (bag, pin, search); trailing icons mean onward motion (arrow-right to navigate, arrow-up-right to leave the site, chevron-down for a picker). Labels never wrap. Icon-only? Use `IconButton`. `asChild` renders an `<a>` or `next/link` as a Button.",
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  name: "variant",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Order Now</Button>
      <Button variant="secondary">See Menu</Button>
      <Button variant="ghost">Find Us</Button>
      <Button variant="inverse">Book</Button>
    </div>
  ),
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const LeadingIcon: Story = {
  name: "icon",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button icon={ShoppingBag}>Order Now</Button>
      <Button variant="secondary" icon={MapPin}>
        Directions
      </Button>
      <Button variant="ghost" icon={Search}>
        Search Menu
      </Button>
    </div>
  ),
};

export const TrailingIcon: Story = {
  name: "iconAfter",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button iconAfter={ArrowRight}>Full Menu</Button>
      <Button variant="secondary" iconAfter={ArrowRight}>
        Our Story
      </Button>
      <Button variant="ghost" iconAfter={ArrowUpRight}>
        Zomato
      </Button>
    </div>
  ),
};

export const BothIcons: Story = {
  name: "icon + iconAfter",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button icon={MapPin} iconAfter={ArrowUpRight}>
        Directions
      </Button>
      <Button variant="secondary" icon={Calendar} iconAfter={ChevronDown}>
        Pick a Date
      </Button>
    </div>
  ),
};

export const IconBySize: Story = {
  name: "icon × size",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm" icon={ShoppingBag}>
        Small
      </Button>
      <Button size="md" icon={ShoppingBag}>
        Medium
      </Button>
      <Button size="lg" icon={ShoppingBag}>
        Large
      </Button>
    </div>
  ),
};

export const IconAfterBySize: Story = {
  name: "iconAfter × size",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm" variant="secondary" iconAfter={ArrowRight}>
        Small
      </Button>
      <Button size="md" variant="secondary" iconAfter={ArrowRight}>
        Medium
      </Button>
      <Button size="lg" variant="secondary" iconAfter={ArrowRight}>
        Large
      </Button>
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
      <Button icon={ShoppingBag}>Order Now</Button>
      <Button variant="secondary" iconAfter={ArrowRight}>
        Our Story
      </Button>
      <Button variant="inverse" icon={MessageCircle}>
        Chat on WhatsApp
      </Button>
    </div>
  ),
};

export const Loading: Story = {
  name: "isLoading",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button isLoading icon={ShoppingBag}>
        Placing order
      </Button>
      <Button variant="secondary" isLoading>
        Checking code
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  name: "disabled",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button disabled icon={ShoppingBag}>
        Sold Out
      </Button>
      <Button variant="secondary" disabled iconAfter={ArrowRight}>
        Closed
      </Button>
    </div>
  ),
};

export const FullWidth: Story = {
  name: "isFullWidth",
  render: () => (
    <div className="grid w-90 gap-2.5">
      <Button isFullWidth size="lg" icon={ShoppingBag}>
        Pay ₹1,240
      </Button>
      <Button isFullWidth variant="secondary" iconAfter={ArrowRight}>
        See the Full Menu
      </Button>
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Button>Order Now</Button>
      <Button variant="secondary">See Menu</Button>
      <Button variant="ghost">Find Us</Button>
      <Button variant="inverse">Book</Button>
    </OnSurfaces>
  ),
};

export const NestedSurfaces: Story = {
  name: "nested surfaces (light island)",
  render: () => (
    <div data-surface="brand" className="grid gap-4 rounded-xl bg-surface-brand p-6">
      <Button variant="secondary">On the pink field</Button>
      <div data-surface="light" className="rounded-lg bg-surface-card p-4">
        <Button variant="secondary">On a white card inside it</Button>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const onField = canvas.getByRole("button", { name: "On the pink field" });
    const onIsland = canvas.getByRole("button", { name: "On a white card inside it" });
    await expect(getComputedStyle(onField).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    await expect(getComputedStyle(onIsland).backgroundColor).toBe("rgb(255, 255, 255)");
  },
};

export const AsChild: Story = {
  name: "asChild (a link)",
  render: () => (
    <Button asChild variant="secondary" icon={MessageCircle}>
      <a href="https://wa.me/919090704001">Order on WhatsApp</a>
    </Button>
  ),
};

export const LongLabel: Story = {
  name: "long label at 360px",
  render: () => (
    <div data-testid="frame" className="grid w-90 gap-3">
      <Button icon={ShoppingBag}>Order the full Sunday thali for the whole family</Button>
      <Button isFullWidth variant="secondary" iconAfter={ArrowRight}>
        See the full menu, every category and every price
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const frame = canvas.getByTestId("frame").getBoundingClientRect();
    for (const button of canvas.getAllByRole("button")) {
      const box = button.getBoundingClientRect();
      await expect(box.right).toBeLessThanOrEqual(frame.right + 0.5);
      await expect(box.height).toBe(44);
    }
  },
};
```

- [ ] **Step 7: Export**

```ts
export { Button, type ButtonProps, buttonVariants } from "./atoms/button/button";
```

- [ ] **Step 8: Gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/button packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens packages/design-tokens/contrast-pairs.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: green; Storybook builds.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the Button atom with surface-driven skins and asChild

Four variants, three sizes, leading and trailing glyphs, loading and a real
grey disabled fill. On a pink field primary flips to white and secondary to a
white outline through surface tokens restored on light islands; inverse stays
ink (spec C9). asChild slots glyphs into an anchor without button attributes,
and long labels truncate inside the pill instead of overflowing.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

