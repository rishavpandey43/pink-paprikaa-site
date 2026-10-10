### Task 15: FeatureItem

**Files:**

- Create: `packages/design-tokens/tokens/component/feature-item.json`
- Modify: `packages/design-tokens/tokens/surface/ink.json`, `packages/design-tokens/tokens/surface/light.json`, `packages/ui/src/lib/component-variants.ts` (`TEXT`)
- Create: `packages/ui/src/molecules/feature-item/feature-item.tsx`, `feature-item.test.tsx`, `feature-item.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** none (handoff component)

**Interfaces:**

- Consumes: `Icon` (`size="md"`, 20px, decorative), `headingTag`.
- Produces: `FeatureItem`, `type FeatureItemProps` (contract §6; deviation 14 on the trust cards). Defaults: `size = "md"`, `headingLevel = 3`. Surface-aware tile: pink-100 / pink-600 on light, ink-800 / pink-300 on ink (component tokens remapped by the ink surface).

- [ ] **Step 1: Component tokens — the tile skin follows the surface**

Create `packages/design-tokens/tokens/component/feature-item.json`:

```json
{
  "color": {
    "$type": "color",
    "feature-item-tile": {
      "$value": "{color.pink.100}",
      "$description": "Icon tile fill; ink-800 on the ink surface."
    },
    "feature-item-icon": {
      "$value": "{color.pink.600}",
      "$description": "Icon colour in the tile; pink-300 on the ink surface."
    }
  },
  "text": {
    "$type": "typography",
    "feature-item-title-md": {
      "$value": { "fontSize": "17px", "lineHeight": 1.3, "fontWeight": "{font-weight.bold}" },
      "$description": "Catering \"Why us\"."
    },
    "feature-item-title-sm": {
      "$value": { "fontSize": "16px", "lineHeight": 1.35, "fontWeight": "{font-weight.bold}" },
      "$description": "Office perks, Homely Meals \"What you get\"."
    }
  }
}
```

In `packages/design-tokens/tokens/surface/ink.json`, add inside `surface-ink` → `color`:

```json
"feature-item-tile": { "$value": "{color.ink.800}" },
"feature-item-icon": { "$value": "{color.pink.300}" }
```

In `packages/design-tokens/tokens/surface/light.json`, add inside `surface-light` → `color` (the light island restores every override — `theme.spec.ts` asserts it):

```json
"feature-item-tile": { "$value": "{color.pink.100}" },
"feature-item-icon": { "$value": "{color.pink.600}" }
```

Append `"feature-item-title-md", "feature-item-title-sm",` to `TEXT`. The icon is a graphic (WCAG 1.4.11, 3:1 — pink-600 on pink-100 is 4.08, pink-300 on ink-800 7.05), not text, so no contrast-policy pair is added; the title and description use `text-heading` / `text-muted`, already declared on every surface.

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -6 && rtk proxy grep -n "feature-item" packages/design-tokens/dist/surfaces.css`
Expected: PASS; `surfaces.css` shows `--color-feature-item-tile: var(--color-ink-800);` in the ink block and `var(--color-pink-100)` in the light block.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/feature-item/feature-item.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { Store } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { FeatureItem } from "./feature-item";

const WHY = {
  icon: Store,
  title: "We are a restaurant, not a contractor",
  description:
    "Come and eat here before you book. What you taste at our table is exactly what reaches yours.",
} as const;

describe("FeatureItem", () => {
  it("titles the feature as a level-3 heading beside its description", () => {
    render(<FeatureItem {...WHY} />);
    expect(screen.getByRole("heading", { level: 3, name: WHY.title })).toBeInTheDocument();
    expect(screen.getByText(WHY.description)).toBeInTheDocument();
  });

  it("puts the icon in a surface-aware tile, hidden from assistive tech", () => {
    const { container } = render(<FeatureItem {...WHY} />);
    const tile = container.querySelector("svg")?.closest(".rounded-md");
    expect(tile).toHaveClass("bg-feature-item-tile", "text-feature-item-icon");
    expect(container.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
  });

  it.each([
    ["md", "size-11", "text-feature-item-title-md", "text-body"],
    ["sm", "size-10", "text-feature-item-title-sm", "text-body-sm"],
  ] as const)("at size %s uses a %s tile", (size, tileClass, titleClass, descriptionClass) => {
    const { container } = render(<FeatureItem {...WHY} size={size} />);
    expect(container.querySelector("svg")?.closest(".rounded-md")).toHaveClass(tileClass);
    expect(screen.getByRole("heading")).toHaveClass(titleClass);
    expect(screen.getByText(WHY.description)).toHaveClass(descriptionClass);
  });

  it("uses the heading level the page needs", () => {
    render(<FeatureItem {...WHY} headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<FeatureItem {...WHY} />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- feature-item 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./feature-item`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/feature-item/feature-item.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";

export interface FeatureItemProps extends Omit<ComponentProps<"div">, "title"> {
  icon: IconComponent;
  title: ReactNode;
  description?: ReactNode | undefined;
  /** md: 44px tile, 17px title (Catering "Why us"). sm: 40px tile, 16px title (perks, "What you get"). */
  size?: "sm" | "md" | undefined;
  headingLevel?: HeadingLevel | undefined;
}

const featureItem = componentVariants({
  slots: {
    root: "flex items-start gap-3.5",
    tile: "bg-feature-item-tile text-feature-item-icon grid shrink-0 place-items-center rounded-md",
    body: "flex min-w-0 flex-col gap-1",
    title: "font-display text-text-heading",
    description: "m-0 max-w-none text-text-muted",
  },
  variants: {
    size: {
      md: { tile: "size-11", title: "text-feature-item-title-md", description: "text-body" },
      sm: { tile: "size-10", title: "text-feature-item-title-sm", description: "text-body-sm" },
    },
  },
});

/** An icon tile, a title and a line — "Why people call us back", office perks, "What you get". */
export function FeatureItem({
  icon,
  title,
  description,
  size = "md",
  headingLevel = 3,
  className,
  ...props
}: FeatureItemProps) {
  const styles = featureItem({ size });
  const Heading = headingTag(headingLevel);

  return (
    <div className={styles.root({ className })} {...props}>
      <span className={styles.tile()}>
        <Icon icon={icon} size="md" />
      </span>
      <div className={styles.body()}>
        <Heading className={styles.title()}>{title}</Heading>
        {description ? <p className={styles.description()}>{description}</p> : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- feature-item 2>&1 | tail -8`
Expected: PASS (6 tests).

- [ ] **Step 6: Stories — Catering "Why us", Office perks, Homely Meals "What you get" (ink), OnSurfaces**

`packages/ui/src/molecules/feature-item/feature-item.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  CirclePause,
  CreditCard,
  Flame,
  Gift,
  Lock,
  PartyPopper,
  Pencil,
  Presentation,
  Receipt,
  RefreshCw,
  Soup,
  Store,
  Truck,
  Users,
} from "lucide-react";

import { OnSurfaces } from "../../lib/story-surfaces";
import { FeatureItem } from "./feature-item";

/** Catering "Why people call us back." (`rates.js` → catering.why). */
const WHY_US = [
  {
    icon: Store,
    title: "We are a restaurant, not a contractor",
    description:
      "Come and eat here before you book. What you taste at our table is exactly what reaches yours.",
  },
  {
    icon: Flame,
    title: "Cooked the same day, for you",
    description:
      "Gravies, breads and starters are made for your order on the morning of. Nothing is reheated.",
  },
  {
    icon: Receipt,
    title: "One price per head, and that is it",
    description:
      "Food, packing and delivery are inside the number we quote. No fuel line, no service line.",
  },
  {
    icon: Pencil,
    title: "Your menu, not ours",
    description: "Swap any gravy, dal, rice or starter. Tell us what your family actually eats.",
  },
  {
    icon: Truck,
    title: "The transport is our problem",
    description:
      "We book the vehicle ourselves, in insulated trays, so food arrives hot and in one piece.",
  },
  {
    icon: Users,
    title: "Staff and setup, if you want it",
    description:
      "Buffet tables, chafing dishes, serving staff for the evening, and we clear up afterwards.",
  },
];

const meta = {
  title: "Molecules/FeatureItem",
  component: FeatureItem,
  args: {
    icon: Store,
    title: "We are a restaurant, not a contractor",
    description:
      "Come and eat here before you book. What you taste at our table is exactly what reaches yours.",
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'An icon tile, a title and a line. The tile follows the surface: pink-100 with a pink-600 icon on light grounds, ink-800 with a pink-300 icon on ink. `size="md"` (44px tile) for Catering "Why us"; `size="sm"` (40px) for the office perks and Homely Meals "What you get".',
      },
    },
  },
} satisfies Meta<typeof FeatureItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Catering "Why us" — md, in a grid. */
export const WhyUs: Story = {
  render: () => (
    <div className="grid max-w-content grid-cols-1 gap-x-9 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
      {WHY_US.map((item) => (
        <FeatureItem key={item.title} {...item} />
      ))}
    </div>
  ),
};

/** Office & PG lunch perks — sm. */
export const OfficePerks: Story = {
  render: () => (
    <div className="grid max-w-content grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
      {[
        {
          icon: Receipt,
          title: "One GST invoice a month",
          description: "No daily bills. Input credit ready.",
        },
        {
          icon: CreditCard,
          title: "Pluxee (Sodexo) accepted",
          description: "Employees can pay with their Pluxee meal card, UPI or card.",
        },
        {
          icon: Truck,
          title: "Free delivery anywhere in Gurgaon",
          description: "Fixed slot: lunch 12:00–1:30pm, dinner 7:30–9:00pm.",
        },
        {
          icon: Users,
          title: "Change headcount daily",
          description: "Update numbers by 9pm the night before.",
        },
        {
          icon: Presentation,
          title: "We come and present",
          description: "Free tasting for your group before you sign anything.",
        },
      ].map((item) => (
        <FeatureItem key={item.title} size="sm" {...item} />
      ))}
    </div>
  ),
};

/** Homely Meals "What ₹130 a meal gets you" — sm, on the ink section. */
export const WhatYouGet: Story = {
  render: () => (
    <div data-surface="ink" className="rounded-xl bg-surface-inverse p-8">
      <div className="grid max-w-content grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            icon: Soup,
            title: "A full meal from a restaurant kitchen",
            description: "Dal, sabji, rice, 3 tawa roti, salad and chutney, cooked the same day.",
          },
          {
            icon: RefreshCw,
            title: "30 dishes on rotation",
            description: "The same sabji never comes back within 8 meals.",
          },
          {
            icon: PartyPopper,
            title: "Biryani every week, no extra charge",
            description:
              "Veg Dum Biryani, Mirchi ka Salan, Raita and a Gulab Jamun: Friday lunch, Tuesday dinner.",
          },
          {
            icon: Gift,
            title: "Limited offer: 1 meal free a month",
            description:
              "Weekday plan: 25 meals for the price of 24. Full month: 31 for 30. Till 31 Oct.",
          },
          {
            icon: Lock,
            title: "Your price is locked",
            description: "Join at ₹130 and it stays ₹130 while you stay subscribed.",
          },
          {
            icon: CirclePause,
            title: "Free skips and pauses",
            description: "Skipped meals aren’t charged; your plan simply runs longer.",
          },
          {
            icon: Truck,
            title: "Free delivery within 3 km",
            description: "No packaging fee, no delivery fee, no platform fee.",
          },
        ].map((item) => (
          <FeatureItem key={item.title} size="sm" {...item} />
        ))}
      </div>
    </div>
  ),
};

export const OnSurfaces: Story = {
  render: (args) => (
    <OnSurfaces>
      <FeatureItem {...args} className="min-w-0 flex-1" />
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { FeatureItem, type FeatureItemProps } from "./molecules/feature-item/feature-item";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/design-tokens/tokens/component/feature-item.json packages/design-tokens/tokens/surface/ink.json packages/design-tokens/tokens/surface/light.json packages/ui/src/molecules/feature-item packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/design-tokens/tokens/component/feature-item.json packages/design-tokens/tokens/surface/ink.json packages/design-tokens/tokens/surface/light.json packages/ui/src/molecules/feature-item packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): FeatureItem molecule

Icon tile + title + line for Catering's why-us, the office perks and
Homely Meals' what-you-get. The tile skin is a component token the ink
surface remaps (ink-800 / pink-300) and the light island restores.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

