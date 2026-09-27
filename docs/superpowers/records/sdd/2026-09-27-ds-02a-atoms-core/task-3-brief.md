### Task 3: Link

**Dev reference:** `git show dev:packages/ui/src/atoms/link/link.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                                                    | Ruling  | Where / reason                                                                                     |
| ----------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------- |
| `href` required                                                                                             | DROP    | contracts §2 (`LinkProps extends ComponentProps<"a">`); with `asChild` the href lives on the child |
| Sizes on `text-body2/body1/subtitle2`, `decoration-2`, `rounded-*` names                                    | DROP    | D4; `Link.jsx` sizes 13.5/15/17 (`text-link-*`) and the base `a` rule's 1.5px underline            |
| Glyph shrinks to 14px at `sm`                                                                               | DROP    | `Link.jsx` draws `size="sm"` (16px) at every size (spec §2, rank-1 source)                         |
| `quiet` hovers pink with an underline                                                                       | DROP    | `Link.jsx` keeps it transparent; Task 15 accepted list                                             |
| `inverse` = `text-text-on-brand`                                                                            | ALREADY | `text-ink-000` + white-alpha underline, the same on pink and ink                                   |
| On-brand story sets the link at 20px bold for AA-large                                                      | DROP    | spec §5.1: white on the brand fill is the declared exception                                       |
| External arrow announced "Opens in a new tab" (`role="img"`)                                                | ADD     | Step 2 external tests; Step 4 implementation                                                       |
| Test: an internal link has no `target`/`rel`                                                                | ADD     | Step 2                                                                                             |
| Test: `onClick` fires when followed                                                                         | ADD     | Step 2                                                                                             |
| Test: caller className replaces the variant colour                                                          | ADD     | Step 2                                                                                             |
| Tests: href and name, default colour, variants, sizes, underline in every variant, glyph not announced, axe | ALREADY | Step 2 existing cases                                                                              |
| Story `WithIcons` (`iconAfter`)                                                                             | ADD     | Step 6 `Default` gains an `iconAfter` link                                                         |
| Story `OnBrand` also shows an ink panel and an external link                                                | ADD     | Step 6 `Inverse`                                                                                   |
| Story `InFooterNav` (a column of quiet links)                                                               | ADD     | Step 6                                                                                             |
| Stories `Default`, `Variants`, `Sizes`, `External`                                                          | ALREADY | `Playground`, `Default` + `SubtleQuiet`, `Sizes`, `External`                                       |

Implementer: copy this table into your report, extended with anything the plan missed.

Source: `components/atoms/Link.{jsx,d.ts,card.html,prompt.md}`. Visuals: DM Sans 500 at 13.5 / 15 / 17px, a 6px gap to the 16px glyphs, and an underline 1.5px thick at a 3px offset. The underline's rest and hover colours differ per variant. Tailwind has no 1.5px `decoration-*` utility (verified: `decoration-1.5` compiles to nothing), so the thickness and offset come from Plan 1's base `a` rule, and Link decides only colours.

**Files:**

- Create: `packages/design-tokens/tokens/component/link.json`
- Modify: `packages/design-tokens/tokens/primitive/color.json`, `tokens/surface/brand.json`, `tokens/surface/ink.json`, `tokens/surface/light.json`, `packages/design-tokens/contrast-pairs.json`
- Create: `packages/ui/src/atoms/link/link.tsx`, `link.test.tsx`, `link.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `Icon`, `IconComponent`; `Slot` from `radix-ui`; `ArrowUpRight` from `lucide-react`; semantic `text-text-{link,link-hover,muted,heading}`, `decoration-border-default`.
- Produces: `Link`, `interface LinkProps extends ComponentProps<"a">` (contracts §2); tokens `text-link-{sm,md,lg}`, `color-link-underline`, `color-link-quiet`, primitives `color-white-alpha-{40,90}`.

- [ ] **Step 1: Component tokens, surface skins, contrast pairs**

In `tokens/primitive/color.json`, inside `color.white-alpha`, add these two entries (keep the keys in ascending order):

```json
"40": { "$value": "rgba(255, 255, 255, 0.4)" },
"90": { "$value": "rgba(255, 255, 255, 0.9)" },
```

`packages/design-tokens/tokens/component/link.json`:

```json
{
  "text": {
    "$type": "typography",
    "link-sm": { "$value": { "fontSize": "13.5px", "fontWeight": "{font-weight.medium}" } },
    "link-md": { "$value": { "fontSize": "15px", "fontWeight": "{font-weight.medium}" } },
    "link-lg": { "$value": { "fontSize": "17px", "fontWeight": "{font-weight.medium}" } }
  },
  "color": {
    "$type": "color",
    "link": {
      "underline": {
        "$value": "{color.pink.200}",
        "$description": "Resting underline of the default link; white at 40% on pink and ink fields."
      },
      "quiet": {
        "$value": "{color.ink.700}",
        "$description": "Nav-link text (variant quiet); white at 85% on pink and ink fields."
      }
    }
  }
}
```

(No `lineHeight`: the design system lets links inherit the surrounding line height.)

`tokens/surface/brand.json`: inside `surface-brand.color`, add:

```json
"link": {
  "underline": { "$value": "{color.white-alpha.40}" },
  "quiet": { "$value": "{color.white-alpha.85}" }
}
```

`tokens/surface/ink.json`: inside `surface-ink.color`, add the same `link` block.

`tokens/surface/light.json`: inside `surface-light.color`, add:

```json
"link": {
  "underline": { "$value": "{color.pink.200}" },
  "quiet": { "$value": "{color.ink.700}" }
}
```

`packages/design-tokens/contrast-pairs.json`: append to `groups`:

```json
{
  "id": "link",
  "surface": null,
  "pairs": [
    ["color-link-quiet", "color-surface-page"],
    ["color-link-quiet", "color-surface-page-alt"]
  ],
  "min": 4.5
},
{
  "id": "link-on-soft",
  "surface": "soft",
  "pairs": [["color-link-quiet", "color-surface-brand-soft"]],
  "min": 4.5
},
{
  "id": "link-on-ink",
  "surface": "ink",
  "pairs": [
    ["color-link-quiet", "color-surface-inverse"],
    ["color-ink-000", "color-surface-inverse"]
  ],
  "min": 4.5
},
{
  "id": "link-on-brand",
  "surface": "brand",
  "pairs": [
    ["color-link-quiet", "color-surface-brand"],
    ["color-ink-000", "color-surface-brand"]
  ],
  "min": 3,
  "exception": "brand-fill"
}
```

(Measured: ink-700 on white 11.19, on pink-50 10.48, on pink-100 ≈ 9.2; white 85% on ink-900 13.38, on pink 3.26; white on pink 4.04.)

In `component-variants.ts`, append to `TEXT`: `"link-sm", "link-md", "link-lg",`.

Run: `pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -6`
Expected: PASS. The contrast groups pass, the light-restore and alias-guard tests pass, and `surfaces.css` now declares `--color-link-underline` in the brand, ink and light blocks.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/link/link.test.tsx`:

```tsx
import type { ComponentProps, MouseEvent } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ArrowRight, MapPin } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Link } from "./link";

function RouterLink({ children, ...props }: ComponentProps<"a">) {
  return (
    <a data-router="" {...props}>
      {children}
    </a>
  );
}

describe("Link", () => {
  it("is a link to its href, named by its text", () => {
    render(<Link href="/menu">See the full menu</Link>);
    expect(screen.getByRole("link", { name: "See the full menu" })).toHaveAttribute(
      "href",
      "/menu"
    );
  });

  it.each([
    ["default", "text-text-link", "decoration-link-underline"],
    ["subtle", "text-text-muted", "decoration-transparent"],
    ["inverse", "text-ink-000", "decoration-white-alpha-40"],
    ["quiet", "text-link-quiet", "decoration-transparent"],
  ] as const)("paints the %s variant with %s and a %s underline", (variant, colour, underline) => {
    render(
      <Link href="/outlets" variant={variant}>
        Outlets
      </Link>
    );
    expect(screen.getByRole("link")).toHaveClass("underline", colour, underline);
  });

  it.each([
    ["default", "hover:text-text-link-hover", "hover:decoration-current"],
    ["subtle", "hover:text-text-heading", "hover:decoration-border-default"],
    ["inverse", "text-ink-000", "hover:decoration-white-alpha-90"],
    ["quiet", "hover:text-text-link", "decoration-transparent"],
  ] as const)(
    "gives the %s variant its hover state (%s, %s)",
    (variant, hoverColour, hoverLine) => {
      render(
        <Link href="/outlets" variant={variant}>
          Outlets
        </Link>
      );
      expect(screen.getByRole("link")).toHaveClass(hoverColour, hoverLine);
    }
  );

  it.each([
    ["sm", "text-link-sm"],
    ["md", "text-link-md"],
    ["lg", "text-link-lg"],
  ] as const)("sets size %s with %s on DM Sans", (size, sizeClass) => {
    render(
      <Link href="/menu" size={size}>
        Menu
      </Link>
    );
    expect(screen.getByRole("link")).toHaveClass("font-body", sizeClass);
  });

  it("puts decorative glyphs before and after the label", () => {
    render(
      <Link href="/outlets" icon={MapPin} iconAfter={ArrowRight}>
        Find a Paprikaa
      </Link>
    );
    const link = screen.getByRole("link", { name: "Find a Paprikaa" });
    expect(link.querySelector(".lucide-map-pin")).not.toBeNull();
    expect(link.querySelector(".lucide-arrow-right")).not.toBeNull();
    expect(link.lastElementChild).toHaveClass("size-icon-sm");
  });

  it("opens an external link in a new tab with a safe rel and an announced outward arrow", () => {
    render(
      <Link href="https://www.zomato.com" isExternal>
        Zomato listing
      </Link>
    );
    const link = screen.getByRole("link", { name: /^Zomato listing/ });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer noopener");
    expect(link.querySelector(".lucide-arrow-up-right")).not.toBeNull();
    // The jump is spoken as well as drawn.
    expect(screen.getByRole("img", { name: "Opens in a new tab" })).toBeInTheDocument();
  });

  it("keeps an explicit iconAfter instead of the external arrow", () => {
    render(
      <Link href="https://www.zomato.com" isExternal iconAfter={ArrowRight}>
        Zomato
      </Link>
    );
    const link = screen.getByRole("link");
    expect(link.querySelector(".lucide-arrow-right")).not.toBeNull();
    expect(link.querySelector(".lucide-arrow-up-right")).toBeNull();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("keeps an internal link in the same tab", () => {
    render(<Link href="/menu">See the full menu</Link>);
    const link = screen.getByRole("link");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });

  it("calls onClick when followed", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
    });
    render(
      <Link href="/menu" onClick={onClick}>
        See the full menu
      </Link>
    );
    await user.click(screen.getByRole("link"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders a router link through asChild with the link classes and glyphs", () => {
    render(
      <Link asChild icon={MapPin}>
        <RouterLink href="/outlets">Outlets</RouterLink>
      </Link>
    );
    const link = screen.getByRole("link", { name: "Outlets" });
    expect(link).toHaveAttribute("data-router");
    expect(link).toHaveAttribute("href", "/outlets");
    expect(link).toHaveClass("text-text-link");
    expect(link.querySelector(".lucide-map-pin")).not.toBeNull();
  });

  it("is reachable from the keyboard", async () => {
    const user = userEvent.setup();
    render(<Link href="/menu">See the full menu</Link>);
    await user.tab();
    expect(screen.getByRole("link")).toHaveFocus();
  });

  it("merges a consumer className", () => {
    render(
      <Link href="/menu" className="whitespace-nowrap">
        Menu
      </Link>
    );
    expect(screen.getByRole("link")).toHaveClass("whitespace-nowrap", "inline-flex");
  });

  it("lets a consumer className replace the variant colour", () => {
    render(
      <Link href="/menu" className="text-text-muted">
        See the full menu
      </Link>
    );
    const link = screen.getByRole("link");
    expect(link).toHaveClass("text-text-muted");
    expect(link).not.toHaveClass("text-text-link");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Link href="/outlets" icon={MapPin}>
          Find a Paprikaa
        </Link>
        <Link href="https://www.zomato.com" isExternal>
          Zomato listing
        </Link>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: FAIL — `Failed to resolve import "./link"`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/link/link.tsx`:

```tsx
import type { ComponentProps, ElementType } from "react";

import { ArrowUpRight } from "lucide-react";
import { Slot } from "radix-ui";

import { componentVariants } from "../../lib/component-variants";
import { Icon, type IconComponent } from "../icon/icon";

export interface LinkProps extends ComponentProps<"a"> {
  /** default = pink underline · subtle = muted · inverse = white, on pink/ink · quiet = nav links. */
  variant?: "default" | "subtle" | "inverse" | "quiet";
  size?: "sm" | "md" | "lg";
  icon?: IconComponent;
  iconAfter?: IconComponent;
  /** Opens in a new tab with a safe `rel` and appends the outward arrow, announced "Opens in a new tab". */
  isExternal?: boolean;
  /** Render the single child (e.g. `next/link`) with Link styling. */
  asChild?: boolean;
}

/*
 * Colours only: the underline's 1.5px thickness and 3px offset come from the base `a` rule every
 * anchor gets (Tailwind has no 1.5px decoration utility). `default` and `subtle` paint with
 * semantic tokens and `quiet` with a surface-aware token, so all three follow a pink or ink field.
 */
const link = componentVariants({
  base: "inline-flex items-center gap-1.5 font-body underline transition-colors duration-fast ease-out",
  variants: {
    variant: {
      default:
        "decoration-link-underline text-text-link hover:text-text-link-hover hover:decoration-current",
      subtle:
        "text-text-muted decoration-transparent hover:text-text-heading hover:decoration-border-default",
      inverse: "decoration-white-alpha-40 hover:decoration-white-alpha-90 text-ink-000",
      quiet: "text-link-quiet decoration-transparent hover:text-text-link",
    },
    size: { sm: "text-link-sm", md: "text-link-md", lg: "text-link-lg" },
  },
  defaultVariants: { variant: "default", size: "md" },
});

const EXTERNAL = { target: "_blank", rel: "noreferrer noopener" } as const;

/** Inline or standalone link. Underline is the brand's link signal. */
export function Link({
  variant,
  size,
  icon,
  iconAfter,
  isExternal = false,
  asChild = false,
  className,
  children,
  ...props
}: LinkProps) {
  const Component: ElementType = asChild ? Slot.Root : "a";
  // The outward arrow is the one glyph that speaks: it tells a screen reader the link opens a new
  // tab. A caller's own `iconAfter` is decorative and replaces it. (Icon's `label` predates R13,
  // so the named arrow is its own element rather than `label={cond ? … : undefined}`.)
  const hasExternalArrow = isExternal && iconAfter === undefined;
  return (
    <Component
      className={link({ variant, size, className })}
      {...(isExternal ? EXTERNAL : undefined)}
      {...props}
    >
      {icon ? <Icon icon={icon} size="sm" /> : null}
      <Slot.Slottable child={children}>{(label) => label}</Slot.Slottable>
      {iconAfter ? <Icon icon={iconAfter} size="sm" /> : null}
      {hasExternalArrow ? <Icon icon={ArrowUpRight} size="sm" label="Opens in a new tab" /> : null}
    </Component>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: PASS.

- [ ] **Step 6: Stories**

Card rows (`Link.card.html`): `default` (plain + `icon`, plus `iconAfter`), `subtle quiet`, `inverse` (on brand, plus an ink panel), `size`, `external` (→ `isExternal`). Extras: `asChild`, `OnSurfaces`, `InFooterNav` (dev parity).

`packages/ui/src/atoms/link/link.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";

import { ArrowRight, MapPin } from "lucide-react";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Link } from "./link";

function DemoRouterLink({ children, ...props }: ComponentProps<"a">) {
  return (
    <a data-router="" {...props}>
      {children}
    </a>
  );
}

const meta = {
  title: "Atoms/Link",
  component: Link,
  args: { href: "/menu", children: "See the full menu", variant: "default", size: "md" },
  argTypes: { icon: { control: false }, iconAfter: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          "Text links. Never leave an `<a>` unstyled — browser blue is not in the palette. `quiet` is the header/footer nav treatment (no underline). `isExternal` adds the arrow and the safe `rel`, and opens a new tab. `default`, `subtle` and `quiet` follow the surface; `inverse` is the explicit white link for pink and ink fields. `asChild` renders your router link (e.g. `next/link`) with the same styling. In running prose a bare `<a>` already carries the link style from the base layer.",
      },
    },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Default: Story = {
  name: 'variant="default"',
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Link href="/menu">See the full menu</Link>
      <Link href="/outlets" icon={MapPin}>
        Find a Paprikaa
      </Link>
      <Link href="/about" iconAfter={ArrowRight}>
        Our story
      </Link>
    </div>
  ),
};

export const SubtleQuiet: Story = {
  name: 'variant="subtle" · "quiet"',
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Link href="/legal" variant="subtle">
        Privacy
      </Link>
      <Link href="/outlets" variant="quiet">
        Outlets
      </Link>
    </div>
  ),
};

export const Inverse: Story = {
  name: 'variant="inverse"',
  render: () => (
    <div className="grid gap-3">
      <div
        data-surface="brand"
        className="flex flex-wrap items-center gap-4 rounded-lg bg-surface-brand p-3.5"
      >
        <Link href="/legal" variant="inverse">
          FSSAI licence
        </Link>
        <Link href="https://www.zomato.com" isExternal variant="inverse">
          Zomato listing
        </Link>
      </div>
      <div
        data-surface="ink"
        className="flex flex-wrap items-center gap-4 rounded-lg bg-surface-inverse p-3.5"
      >
        <Link href="/legal" variant="inverse">
          FSSAI licence
        </Link>
        <Link href="https://www.zomato.com" isExternal variant="inverse">
          Zomato listing
        </Link>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Link href="/menu" size="sm">
        Small
      </Link>
      <Link href="/menu" size="md">
        Medium
      </Link>
      <Link href="/menu" size="lg">
        Large
      </Link>
    </div>
  ),
};

export const External: Story = {
  name: "isExternal",
  args: { href: "https://www.zomato.com", isExternal: true, children: "Zomato listing" },
};

export const AsChild: Story = {
  name: "asChild (router link)",
  render: () => (
    <Link asChild icon={MapPin}>
      <DemoRouterLink href="/outlets">Outlets</DemoRouterLink>
    </Link>
  ),
};

/** In context: a footer column, where `quiet` keeps the nav calm until it is pointed at. */
export const InFooterNav: Story = {
  name: "in context: footer nav",
  render: () => (
    <nav aria-label="Footer" className="flex flex-col items-start gap-3">
      <Link href="/menu" variant="quiet">
        Menu
      </Link>
      <Link href="/outlets" variant="quiet">
        Outlets
      </Link>
      <Link href="/catering" variant="quiet">
        Party Orders
      </Link>
      <Link href="/contact" variant="quiet">
        Contact
      </Link>
    </nav>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Link href="/menu">Default</Link>
      <Link href="/legal" variant="subtle">
        Subtle
      </Link>
      <Link href="/outlets" variant="quiet">
        Quiet
      </Link>
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { Link, type LinkProps } from "./atoms/link/link";
```

- [ ] **Step 8: Gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/link packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens packages/design-tokens/contrast-pairs.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: green; Storybook builds.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the Link atom with surface-aware underline and nav tones

Four variants, three sizes, glyphs, external links and asChild for router
links. Default and quiet links flip to white on pink and ink fields through
surface tokens restored on light islands; new pairs are in the contrast gate.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

