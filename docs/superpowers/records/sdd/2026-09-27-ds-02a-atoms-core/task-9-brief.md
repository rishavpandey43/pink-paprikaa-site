### Task 9: Card

**Dev reference:** `git show dev:packages/ui/src/atoms/card/card.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                                    | Ruling  | Where / reason                                                   |
| ------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------- |
| Flooded skins set `text-text-on-brand` / `on-inverse` on the root                           | ALREADY | the card sets `data-surface` (D5), so all of its content follows |
| `rounded-4/5`, `shadow-elevation*`, `translate-y-(--motion-lift-y)`                         | DROP    | D4; AUTHORING §6 (`hover:lift`)                                  |
| A transition on every card                                                                  | ALREADY | only an interactive card changes, so only it animates            |
| Tests: default skin, five skins, per-skin radius, paddings, lift only when interactive, axe | ALREADY | Step 2                                                           |
| Test: an interactive card never fades (no opacity)                                          | ADD     | Step 2                                                           |
| Test: a nested link owns the interaction inside an interactive card                         | ADD     | Step 2                                                           |
| Test: caller className replaces the radius                                                  | ADD     | Step 2                                                           |
| Brand-card support line stepped up to 20px bold (AA-large)                                  | DROP    | spec §5.1: white on the brand fill is the declared exception     |
| Stories `Default`, `Skins`, `MediaCard`                                                     | ALREADY | `Default`, `FeatureQuiet` + `BrandInk`, `PaddingNone`            |
| Story `Padding` (sm/md/lg)                                                                  | ADD     | Step 6 `Paddings`                                                |
| Story `Interactive` with a nested link                                                      | ADD     | Step 6 `InteractiveWithLink`                                     |

Implementer: copy this table into your report, extended with anything the plan missed.

Source: `components/atoms/Card.{jsx,d.ts,card.html,prompt.md}`, readme §3.5.

**Visuals:**

- `default`: surface-card white, 16px radius, 1px border-subtle, `--shadow-1`.
- `feature`: pink-100, 24px radius, no border, no shadow.
- `brand`: pink-500, 24px radius, `--shadow-brand`.
- `ink`: ink-900, 24px radius.
- `quiet`: surface-sunken, 16px radius.
- Content clips (`overflow: hidden`, for flush media).
- `isInteractive` hovers up −2px to `--shadow-3` over `--duration-base`.
- `padding`: none 0, sm 16, **md 20** (the zip default), lg 28. The zip's other paddings (16 in OrderTracker and CartPanel, 28 in the prompt) map to sm and lg.

Every value is a base token, so Card adds **no** component tokens. It sets `data-surface` from its variant: default and quiet → `light` (a light island inside any field), feature → `soft`, brand → `brand`, ink → `ink`.

**Files:**

- Create: `packages/ui/src/atoms/card/card.tsx`, `card.test.tsx`, `card.stories.tsx`
- Modify: `packages/ui/src/index.ts`
- Tokens, `component-variants.ts`, `contrast-pairs.json`: unchanged. Text inside each variant is covered by Plan 1's semantic surface groups (light, soft, brand, ink, and the card-on-surface groups).

**Interfaces:**

- Consumes: `componentVariants`, `Slot`; `bg-surface-{card,brand-soft,brand,inverse,sunken}`, `shadow-{1,3,brand}`, `hover:lift`, `duration-base`.
- Produces: `Card`, `interface CardProps extends ComponentProps<"div">` (contracts §2).

- [ ] **Step 1: Tokens** — none. Confirm with `rtk proxy grep -nE "radius-lg|radius-xl|shadow-3" packages/design-tokens/dist/theme.css`. It must print all three.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/card/card.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Card } from "./card";

describe("Card", () => {
  it("is a white card and a light island by default", () => {
    render(<Card>Sector 57</Card>);
    const card = screen.getByText("Sector 57");
    expect(card).toHaveAttribute("data-surface", "light");
    expect(card).toHaveClass(
      "bg-surface-card",
      "border",
      "border-border-subtle",
      "rounded-lg",
      "shadow-1",
      "p-5",
      "overflow-hidden"
    );
  });

  it.each([
    ["default", "light", "bg-surface-card", "rounded-lg"],
    ["feature", "soft", "bg-surface-brand-soft", "rounded-xl"],
    ["brand", "brand", "bg-surface-brand", "rounded-xl"],
    ["ink", "ink", "bg-surface-inverse", "rounded-xl"],
    ["quiet", "light", "bg-surface-sunken", "rounded-lg"],
  ] as const)(
    "the %s card sets data-surface=%s, a %s field and %s",
    (variant, surface, fill, radius) => {
      render(<Card variant={variant}>Card</Card>);
      const card = screen.getByText("Card");
      expect(card).toHaveAttribute("data-surface", surface);
      expect(card).toHaveClass(fill, radius);
    }
  );

  it("gives only the brand card the brand glow and only the default card a border", () => {
    render(
      <>
        <Card variant="brand">Brand</Card>
        <Card variant="feature">Feature</Card>
      </>
    );
    expect(screen.getByText("Brand")).toHaveClass("shadow-brand");
    expect(screen.getByText("Feature").className).not.toMatch(/(^|\s)(border|shadow-)/);
  });

  it.each([
    ["none", "p-0"],
    ["sm", "p-4"],
    ["md", "p-5"],
    ["lg", "p-7"],
  ] as const)("pads %s with %s", (padding, paddingClass) => {
    render(<Card padding={padding}>Card</Card>);
    expect(screen.getByText("Card")).toHaveClass(paddingClass);
  });

  it("lifts to shadow-3 on hover only when interactive", () => {
    render(
      <>
        <Card isInteractive>Interactive</Card>
        <Card>Static</Card>
      </>
    );
    expect(screen.getByText("Interactive")).toHaveClass(
      "cursor-pointer",
      "transition",
      "duration-base",
      "hover:lift",
      "hover:shadow-3"
    );
    expect(screen.getByText("Static")).not.toHaveClass("hover:lift");
  });

  it("never fades: an interactive card keeps a real surface", () => {
    render(
      <Card isInteractive variant="feature">
        Feature
      </Card>
    );
    expect(screen.getByText("Feature").className).not.toMatch(/opacity/);
  });

  it("stays a plain container, so a nested link owns the interaction", () => {
    render(
      <Card isInteractive>
        <a href="/menu">See Full Menu</a>
      </Card>
    );
    const link = screen.getByRole("link", { name: "See Full Menu" });
    expect(link).toHaveAttribute("href", "/menu");
    expect(link.parentElement?.tagName).toBe("DIV");
  });

  it("stays a light island inside a flooded field (Review Focus 5)", () => {
    render(
      <div data-surface="brand">
        <Card>Island</Card>
      </div>
    );
    expect(screen.getByText("Island")).toHaveAttribute("data-surface", "light");
  });

  it("becomes the link itself through asChild, without underlining its content", () => {
    render(
      <Card asChild isInteractive>
        <a href="/outlets/sector-57">
          <h3>Sector 57</h3>
        </a>
      </Card>
    );
    const link = screen.getByRole("link", { name: "Sector 57" });
    expect(link).toHaveAttribute("data-surface", "light");
    expect(link).toHaveClass("no-underline", "hover:lift", "bg-surface-card");
  });

  it("merges a consumer className and forwards native props", () => {
    render(
      <Card className="w-50" aria-label="Outlet" role="group">
        Card
      </Card>
    );
    const card = screen.getByRole("group", { name: "Outlet" });
    expect(card).toHaveClass("w-50", "p-5");
  });

  it("lets a consumer className replace its radius", () => {
    render(<Card className="rounded-md">Card</Card>);
    const card = screen.getByText("Card");
    expect(card).toHaveClass("rounded-md");
    expect(card).not.toHaveClass("rounded-lg");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Card>
          <h3>Sector 57</h3>
          <p>8am – 11:30pm</p>
        </Card>
        <Card asChild isInteractive variant="brand">
          <a href="/menu">Menu</a>
        </Card>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: FAIL — `Failed to resolve import "./card"`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/card/card.tsx`:

```tsx
import type { ComponentProps, ElementType } from "react";

import { Slot } from "radix-ui";

import { componentVariants } from "../../lib/component-variants";

export interface CardProps extends ComponentProps<"div"> {
  /** default white · feature light pink · brand flooded pink · ink · quiet sunken grey. */
  variant?: "default" | "feature" | "brand" | "ink" | "quiet";
  /** none (flush media) · sm 16 · md 20 · lg 28. */
  padding?: "none" | "sm" | "md" | "lg";
  /** The −2px hover lift to shadow-3. */
  isInteractive?: boolean;
  /** Make the single child (usually an `<a>`) the card. */
  asChild?: boolean;
}

/** The surface each skin sets: white cards are light islands, flooded ones remap their content. */
const SURFACE = {
  default: "light",
  quiet: "light",
  feature: "soft",
  brand: "brand",
  ink: "ink",
} as const;

const card = componentVariants({
  // no-underline: a card rendered as a link (asChild) must not underline its whole content.
  base: "overflow-hidden no-underline",
  variants: {
    variant: {
      default: "rounded-lg border border-border-subtle bg-surface-card shadow-1",
      feature: "rounded-xl bg-surface-brand-soft",
      brand: "rounded-xl bg-surface-brand shadow-brand",
      ink: "rounded-xl bg-surface-inverse",
      quiet: "rounded-lg bg-surface-sunken",
    },
    padding: { none: "p-0", sm: "p-4", md: "p-5", lg: "p-7" },
    isInteractive: {
      true: "cursor-pointer transition duration-base ease-out hover:lift hover:shadow-3",
    },
  },
  defaultVariants: { variant: "default", padding: "md", isInteractive: false },
});

/** Content container in the brand's five surface skins. Never gets a coloured left border. */
export function Card({
  variant = "default",
  padding,
  isInteractive,
  asChild = false,
  className,
  ...props
}: CardProps) {
  const Component: ElementType = asChild ? Slot.Root : "div";
  return (
    <Component
      data-surface={SURFACE[variant]}
      className={card({ variant, padding, isInteractive, className })}
      {...props}
    />
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: PASS.

- [ ] **Step 6: Stories**

Card rows (`Card.card.html`, cards 200px wide): `default` (+ interactive), `feature quiet`, `brand ink`, `padding={0}` (→ `padding="none"`). Extras:

- `asChild`.
- `LightIsland`: Review Focus 5, `play` reads computed colours.
- `Paddings` (sm/md/lg) and `InteractiveWithLink` (dev parity).

Inner content is plain `<h4>`/`<p>`, which follow the card's own surface. That is the D5 point: the zip passed `tone="inverse"` by hand.

`packages/ui/src/atoms/card/card.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { Card } from "./card";

function Inner({ title, detail }: { title: string; detail: string }) {
  return (
    <>
      <h4 className="m-0">{title}</h4>
      <p className="mt-1.5 mb-0 font-body text-caption text-text-subtle">{detail}</p>
    </>
  );
}

const meta = {
  title: "Atoms/Card",
  component: Card,
  args: {
    variant: "default",
    padding: "md",
    className: "w-50",
    children: <Inner title="Sector 57" detail="8am – 11:30pm" />,
  },
  parameters: {
    docs: {
      description: {
        component:
          'The surface every block of content sits on. `default` white + 1px subtle border + shadow-1; `feature` light pink, 24px radius, no shadow; `brand` flooded pink; `ink` dark, footer-style; `quiet` sunken grey. Each sets `data-surface`, so content inside follows its field — a white card inside a pink section is a light island, with no colour props. Use `padding="none"` when the card starts with an image; `isInteractive` adds the −2px hover lift; `asChild` makes the whole card a link. No card ever has a coloured left border.',
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Default: Story = {
  name: 'variant="default" · isInteractive',
  render: () => (
    <div className="flex flex-wrap items-start gap-3">
      <Card className="w-50">
        <Inner title="Sector 57" detail="8am – 11:30pm" />
      </Card>
      <Card isInteractive className="w-50">
        <Inner title="isInteractive" detail="hovers −2px to shadow-3" />
      </Card>
    </div>
  ),
};

export const FeatureQuiet: Story = {
  name: 'variant="feature" · "quiet"',
  render: () => (
    <div className="flex flex-wrap items-start gap-3">
      <Card variant="feature" className="w-50">
        <Inner title="feature" detail="no border, no shadow" />
      </Card>
      <Card variant="quiet" className="w-50">
        <Inner title="quiet" detail="ink-100" />
      </Card>
    </div>
  ),
};

export const BrandInk: Story = {
  name: 'variant="brand" · "ink"',
  render: () => (
    <div className="flex flex-wrap items-start gap-3">
      <Card variant="brand" className="w-50">
        <Inner title="brand" detail="flooded pink" />
      </Card>
      <Card variant="ink" className="w-50">
        <Inner title="ink" detail="footer surfaces" />
      </Card>
    </div>
  ),
};

export const PaddingNone: Story = {
  name: 'padding="none"',
  render: () => (
    <Card padding="none" className="w-50">
      <div className="h-14 bg-surface-brand-soft" />
      <div className="p-3.5">
        <Inner title="media" detail="image sits flush" />
      </div>
    </Card>
  ),
};

export const Paddings: Story = {
  name: 'padding="sm" · "md" · "lg"',
  render: () => (
    <div className="flex flex-wrap items-start gap-3">
      {(["sm", "md", "lg"] as const).map((padding) => (
        <Card key={padding} padding={padding} className="w-50">
          <Inner title={`padding ${padding}`} detail="16 / 20 / 28px" />
        </Card>
      ))}
    </div>
  ),
};

export const AsChild: Story = {
  name: "asChild (a link)",
  render: () => (
    <Card asChild isInteractive className="w-50">
      <a href="/outlets/sector-57">
        <Inner title="Sector 57" detail="Booth No. 67P, MKM Market" />
      </a>
    </Card>
  ),
};

/** The other interactive pattern: the lift is styling only, and the real link inside owns the click. */
export const InteractiveWithLink: Story = {
  name: "isInteractive with a nested link",
  render: () => (
    <Card isInteractive className="w-60">
      <h4 className="m-0">
        <a href="/menu">See Full Menu</a>
      </h4>
      <p className="mt-1.5 mb-0 font-body text-caption text-text-subtle">
        Momos, chaat and North Indian plates · ₹180–₹320
      </p>
    </Card>
  ),
};

export const LightIsland: Story = {
  name: "light island inside a brand field",
  render: () => (
    <div data-surface="brand" className="rounded-xl bg-surface-brand p-6">
      <Card className="w-60">
        <h4 className="m-0">Sector 57</h4>
        <p data-testid="island-copy" className="m-0 font-body text-caption">
          8am – 11:30pm
        </p>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const copy = within(canvasElement).getByTestId("island-copy");
    const card = copy.parentElement;
    await expect(getComputedStyle(copy).color).toBe("rgb(43, 31, 37)");
    await expect(card === null ? "" : getComputedStyle(card).backgroundColor).toBe(
      "rgb(255, 255, 255)"
    );
  },
};
```

(`rgb(43, 31, 37)` is ink-800, `--color-text-body` restored on the light island. Inside the brand field without the card it would be white.)

- [ ] **Step 7: Export**

```ts
export { Card, type CardProps } from "./atoms/card/card";
```

- [ ] **Step 8: Gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/card packages/ui/src/index.ts
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: green; Storybook builds.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui
git commit -m "feat(ui): add the Card atom, five skins that set their own surface

Default and quiet cards are light islands, feature is soft, brand and ink
remap their content, so text inside needs no colour props. Four paddings,
the hover lift when interactive, and asChild to make the card a link.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

