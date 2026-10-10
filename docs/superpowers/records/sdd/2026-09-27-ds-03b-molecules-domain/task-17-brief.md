### Task 17: LinkCard

**Files:**

- Create: `packages/design-tokens/tokens/component/link-card.json`
- Create: `packages/ui/src/molecules/link-card/link-card.tsx`, `link-card.test.tsx`, `link-card.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`), `packages/ui/src/index.ts`

**Dev reference:** none (handoff component)

**Interfaces:**

- Consumes: `Slot` from `radix-ui`, used the way Plan 2a does (verified in `@radix-ui/react-slot`): `const Component: ElementType = asChild ? Slot.Root : "a"`, and `<Slot.Slottable child={children}>{() => content}</Slot.Slottable>` replaces the child's children with the card's media and text, so they land **inside** the consumer's link element. Classes go on the component, never on the slotted child (Slot joins child classes without tailwind-merge). `Icon` (`ArrowRight`, `xs`), `headingTag`; the `lift` utility (Plan 1).
- Produces: `LinkCard`, `type LinkCardProps` (contract §6). Defaults: `layout = "row"`, `tone = "default"`, `headingLevel = 3`. Sets `data-surface` from `tone` (`default` → `light`). With `asChild`, `children` is the link element (e.g. `<NextLink href="/homely-meals" />`); without it, `children` is not rendered — content comes from props.

- [ ] **Step 1: Component tokens**

Create `packages/design-tokens/tokens/component/link-card.json`:

```json
{
  "text": {
    "$type": "typography",
    "link-card-title": {
      "$value": {
        "fontSize": "18px",
        "lineHeight": 1.3,
        "letterSpacing": "-0.005em",
        "fontWeight": "{font-weight.bold}"
      },
      "$description": "Row layout title (Home \"doors\")."
    },
    "link-card-title-lg": {
      "$value": {
        "fontSize": "22px",
        "lineHeight": 1.2,
        "letterSpacing": "-0.01em",
        "fontWeight": "{font-weight.black}"
      },
      "$description": "Stack layout title (About CTA cards)."
    }
  }
}
```

Append `"link-card-title", "link-card-title-lg",` to `TEXT`. Run `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache`.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/link-card/link-card.test.tsx`:

```tsx
import type { ComponentProps } from "react";

import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { LinkCard } from "./link-card";

/** Stands in for next/link: the card must render into it, not around it. */
function RouterLink(props: ComponentProps<"a">) {
  return <a data-router="" {...props} />;
}

const DOOR = {
  href: "/homely-meals",
  title: "Homely Meals",
  description: "Daily veg meals from ₹120",
  cta: "See plans",
} as const;

describe("LinkCard", () => {
  it("is one link carrying its title, description and call to action", () => {
    render(<LinkCard {...DOOR} />);
    const link = screen.getByRole("link", { name: /Homely Meals/ });
    expect(link).toHaveAttribute("href", "/homely-meals");
    expect(link).toHaveTextContent("Daily veg meals from ₹120");
    expect(link).toHaveTextContent("See plans");
  });

  it("titles the card as a level-3 heading inside the link", () => {
    render(<LinkCard {...DOOR} />);
    expect(screen.getByRole("link")).toContainElement(
      screen.getByRole("heading", { level: 3, name: "Homely Meals" })
    );
  });

  it.each([
    ["default", "light"],
    ["brand", "brand"],
    ["ink", "ink"],
    ["soft", "soft"],
  ] as const)("sets the %s tone's surface to %s", (tone, surface) => {
    render(<LinkCard {...DOOR} tone={tone} />);
    expect(screen.getByRole("link")).toHaveAttribute("data-surface", surface);
  });

  it("puts 88px media beside the text in a row, and full-width media above it in a stack", () => {
    const { rerender } = render(<LinkCard {...DOOR} media={<div data-testid="photo" />} />);
    expect(screen.getByTestId("photo").parentElement).toHaveClass("size-22");
    rerender(<LinkCard {...DOOR} layout="stack" media={<div data-testid="photo" />} />);
    expect(screen.getByTestId("photo").parentElement).toHaveClass("w-full");
  });

  it("renders into the app's router link with asChild", () => {
    render(
      <LinkCard asChild title="Homely Meals">
        <RouterLink href="/homely-meals" />
      </LinkCard>
    );
    const link = screen.getByRole("link", { name: "Homely Meals" });
    expect(link).toHaveAttribute("data-router");
    expect(link).toHaveAttribute("data-surface", "light");
  });

  it("draws the arrow only when there is a call to action", () => {
    const { container, rerender } = render(<LinkCard href="/menu" title="Restaurant Menu" />);
    expect(container.querySelector("svg")).toBeNull();
    rerender(<LinkCard href="/menu" title="Restaurant Menu" cta="Open menu" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<LinkCard {...DOOR} media={<span>Box</span>} />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- link-card 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./link-card`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/link-card/link-card.tsx`:

```tsx
import type { ComponentProps, ElementType, ReactNode } from "react";

import { ArrowRight } from "lucide-react";
import { Slot } from "radix-ui";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";

type LinkCardTone = "default" | "brand" | "ink" | "soft";

const SURFACE_OF: Readonly<Record<LinkCardTone, "light" | "brand" | "ink" | "soft">> = {
  default: "light",
  brand: "brand",
  ink: "ink",
  soft: "soft",
};

const linkCard = componentVariants({
  slots: {
    root: "flex text-inherit no-underline transition duration-fast motion-safe:hover:lift",
    media: "shrink-0",
    body: "flex min-w-0 flex-col",
    title: "font-display text-text-heading",
    description: "m-0 max-w-none",
    cta: "inline-flex items-center gap-1 font-display text-body-sm font-bold text-text-brand",
  },
  variants: {
    layout: {
      row: {
        root: "items-center gap-3.5 rounded-lg p-3",
        media: "size-22",
        body: "gap-1",
        title: "text-link-card-title",
        description: "text-body-sm text-text-muted",
      },
      stack: {
        root: "flex-col gap-3 rounded-xl p-7",
        media: "w-full",
        body: "gap-1.5",
        title: "text-link-card-title-lg",
        description: "text-body text-text-body",
      },
    },
    tone: {
      default: { root: "border border-border-subtle bg-surface-card shadow-1 hover:shadow-3" },
      brand: { root: "bg-surface-brand" },
      ink: { root: "bg-surface-inverse" },
      soft: { root: "bg-surface-brand-soft" },
    },
  },
});

export interface LinkCardProps extends Omit<ComponentProps<"a">, "title"> {
  title: ReactNode;
  description?: ReactNode | undefined;
  /** Link words under the text, followed by an arrow ("See plans"). */
  cta?: string | undefined;
  /** An ImageSlot: 88px square in a row, full width in a stack. */
  media?: ReactNode | undefined;
  layout?: "row" | "stack" | undefined;
  tone?: LinkCardTone | undefined;
  /** Render into the child link element (next/link, an external anchor) instead of an `<a>`. */
  asChild?: boolean | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/** A whole-card link: Home's three "doors" (row) and About's CTA cards (stack, tones). */
export function LinkCard({
  title,
  description,
  cta,
  media,
  layout = "row",
  tone = "default",
  asChild = false,
  headingLevel = 3,
  className,
  children,
  ...props
}: LinkCardProps) {
  const styles = linkCard({ layout, tone });
  const Heading = headingTag(headingLevel);
  const Component: ElementType = asChild ? Slot.Root : "a";
  const content = (
    <>
      {media ? <div className={styles.media()}>{media}</div> : null}
      <div className={styles.body()}>
        <Heading className={styles.title()}>{title}</Heading>
        {description ? <p className={styles.description()}>{description}</p> : null}
        {cta ? (
          <span className={styles.cta()}>
            {cta}
            <Icon icon={ArrowRight} size="xs" />
          </span>
        ) : null}
      </div>
    </>
  );

  return (
    <Component data-surface={SURFACE_OF[tone]} className={styles.root({ className })} {...props}>
      {asChild ? <Slot.Slottable child={children}>{() => content}</Slot.Slottable> : content}
    </Component>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- link-card 2>&1 | tail -8`
Expected: PASS (10 tests).

- [ ] **Step 6: Stories — Home "doors" (row), About CTA cards (stack in three tones), asChild**

`packages/ui/src/molecules/link-card/link-card.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { ImageSlot } from "../../atoms/image-slot/image-slot";
import { LinkCard } from "./link-card";

/** Stands in for the app's router link in the asChild story. */
function RouterLink(props: ComponentProps<"a">) {
  return <a data-router="" {...props} />;
}

const meta = {
  title: "Molecules/LinkCard",
  component: LinkCard,
  args: {
    href: "#homely-meals",
    title: "Homely Meals",
    description: `Daily veg meals from ${formatRupees(120)}`,
    cta: "See plans",
    media: <ImageSlot ratio="square" radius="md" label="Box" />,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-text-measure-prose">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'A whole-card link. `layout="row"` puts 88px media beside the text (Home\'s "One kitchen, three ways to eat" doors); `layout="stack"` is the About page\'s CTA card in `brand`, `ink` or `soft`. It lifts on hover (reduced motion: no lift). Use `asChild` to render into `next/link` or an external anchor; the card\'s content lands inside it.',
      },
    },
  },
} satisfies Meta<typeof LinkCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Home "One kitchen, three ways to eat". */
export const HomeDoors: Story = {
  decorators: [],
  render: () => (
    <div className="grid max-w-content grid-cols-1 gap-4 md:grid-cols-3">
      <LinkCard
        href="#homely-meals"
        title="Homely Meals"
        description={`Daily veg meals from ${formatRupees(120)}`}
        cta="See plans"
        media={<ImageSlot ratio="square" radius="md" label="Box" />}
      />
      <LinkCard
        href="#catering"
        title="Catering & Bulk Orders"
        description={`Dawats from ${formatRupees(149)} a head · snacks from ${formatRupees(99)}`}
        cta="See Dawats"
        media={<ImageSlot ratio="square" radius="md" label="Buffet" />}
      />
      <LinkCard
        href="#menu"
        title="Restaurant Menu"
        description="Dine in or order online"
        cta="Open menu"
        media={<ImageSlot ratio="square" radius="md" label="Dish" />}
      />
    </div>
  ),
};

/** About page CTA cards — stack, brand / ink / soft. */
export const AboutCtas: Story = {
  decorators: [],
  render: () => (
    <div className="grid max-w-content grid-cols-1 gap-4 md:grid-cols-3">
      <LinkCard
        layout="stack"
        tone="brand"
        href="#homely-meals"
        title="Homely Meals"
        description="Eat from our kitchen every day"
      />
      <LinkCard
        layout="stack"
        tone="ink"
        href="#catering"
        title="Dawat catering"
        description="For your next occasion"
      />
      <LinkCard
        layout="stack"
        tone="soft"
        href="#contact"
        title="Visit us"
        description="MKM Market, Sector 57"
      />
    </div>
  ),
};

/** `asChild`: the card renders into the consumer's link element. */
export const AsChild: Story = {
  args: { asChild: true, href: undefined, children: <RouterLink href="#homely-meals" /> },
};
```

- [ ] **Step 7: Export**

```ts
export { LinkCard, type LinkCardProps } from "./molecules/link-card/link-card";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/design-tokens/tokens/component/link-card.json packages/ui/src/molecules/link-card packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/design-tokens/tokens/component/link-card.json packages/ui/src/molecules/link-card packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): LinkCard molecule

Whole-card link for Home's doors (row, 88px media) and About's CTA cards
(stack in brand/ink/soft, each setting its surface). asChild renders the
card into next/link or an external anchor via Radix Slottable, so the
content lands inside the consumer's link.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

