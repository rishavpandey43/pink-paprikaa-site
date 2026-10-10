### Task 16: PricingCard

**Files:**

- Create: `packages/design-tokens/tokens/component/pricing-card.json`
- Create: `packages/ui/src/molecules/pricing-card/pricing-card.tsx`, `pricing-card.test.tsx`, `pricing-card.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`, `SPACING`), `packages/ui/src/index.ts`

**Dev reference:** none (handoff component)

**Interfaces:**

- Consumes: `formatRupees` (`@pink-paprikaa-web/utils`), `Icon` (`Check`), `headingTag`; semantic surface tokens (the card sets `data-surface`: `default`/`featured` → `light`, `flooded` → `brand`).
- Produces: `PricingCard`, `type PricingCardProps` (contract §6 + deviation 3). Defaults: `variant = "default"`, `headingLevel = 3`. Documented accessible default: the visually hidden "Was" before the struck price.

The handoff draws this card four ways (Home 20px padding / 40px price; Homely Meals fluid padding / 48px price; Catering 14px padding / 34px price; Office 24px / 44px). The system normalises to one card: `rounded-xl`, fluid padding 20→28px, fluid price 36→48px, the name on `text-h4` black. The per-page differences are listed in the Task 21 parity notes.

- [ ] **Step 1: Component tokens**

Create `packages/design-tokens/tokens/component/pricing-card.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "pricing-card-pad": {
      "$value": "clamp(20px, 3vw, 28px)",
      "$description": "Card padding (handoff Homely Meals plates)."
    }
  },
  "text": {
    "$type": "typography",
    "pricing-card-price": {
      "$value": {
        "fontSize": "clamp(36px, 4.4vw, 48px)",
        "lineHeight": 1,
        "letterSpacing": "-0.03em",
        "fontWeight": "{font-weight.black}"
      },
      "$description": "The per-unit price; the handoff's 34–48px range, fluid."
    }
  }
}
```

Append `"pricing-card-price",` to `TEXT` and `"pricing-card-pad",` to `SPACING`. Run `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache`.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/pricing-card/pricing-card.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { PricingCard } from "./pricing-card";

const CLASSIC = {
  name: "Classic",
  price: 130,
  was: 140,
  unit: "a meal",
  blurb: "The full Pink Paprikaa menu. Our recommendation.",
  points: [
    "30 dishes: Rajma, Chole, Dal Makhani, Kofta, Gatte",
    "Raita three times a week",
    "Weekly biryani + Gulab Jamun",
  ],
} as const;

describe("PricingCard", () => {
  it("names the plate as a heading and prints the price per unit the brand way", () => {
    render(<PricingCard {...CLASSIC} points={[...CLASSIC.points]} />);
    expect(screen.getByRole("heading", { level: 3, name: "Classic" })).toBeInTheDocument();
    expect(screen.getByRole("article")).toHaveTextContent("₹130");
    expect(screen.getByRole("article")).toHaveTextContent("a meal");
  });

  it("strikes the regular price and announces it as the old one", () => {
    const { container } = render(<PricingCard {...CLASSIC} points={[...CLASSIC.points]} />);
    expect(container.querySelector("s")).toHaveTextContent("Was ₹140");
  });

  it("lists what the plate includes, each with a tick", () => {
    render(<PricingCard {...CLASSIC} points={[...CLASSIC.points]} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    for (const item of items) expect(item.querySelector("svg")).not.toBeNull();
  });

  it.each([
    ["default", "light"],
    ["featured", "light"],
    ["flooded", "brand"],
  ] as const)("sets the %s card's surface to %s", (variant, surface) => {
    render(<PricingCard {...CLASSIC} points={[...CLASSIC.points]} variant={variant} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-surface", surface);
  });

  it("centres the badge on the top edge and sets the tag beside the name", () => {
    render(
      <PricingCard
        {...CLASSIC}
        points={[...CLASSIC.points]}
        badge={<span>Our recommendation</span>}
        tag={<span>Launch price</span>}
      />
    );
    expect(screen.getByText("Our recommendation").parentElement).toHaveClass(
      "absolute",
      "-top-3",
      "left-1/2"
    );
    expect(screen.getByRole("heading", { name: "Classic" }).parentElement).toContainElement(
      screen.getByText("Launch price")
    );
  });

  it("puts the footnote and the action together at the foot of the card", () => {
    render(
      <PricingCard
        {...CLASSIC}
        points={[...CLASSIC.points]}
        footnote="Weekday plan: ₹3,120 · 24 meals"
        action={<a href="#builder">Build with Classic</a>}
      />
    );
    const footer = screen.getByText("Weekday plan: ₹3,120 · 24 meals").parentElement;
    expect(footer).toHaveClass("mt-auto");
    expect(footer).toContainElement(screen.getByRole("link", { name: "Build with Classic" }));
  });

  it("shows the media slot above the name", () => {
    render(
      <PricingCard {...CLASSIC} points={[...CLASSIC.points]} media={<div data-testid="photo" />} />
    );
    expect(screen.getByRole("article").firstElementChild).toContainElement(
      screen.getByTestId("photo")
    );
  });

  it("lets a very long plate name wrap instead of widening the card", () => {
    render(
      <PricingCard
        {...CLASSIC}
        points={[...CLASSIC.points]}
        name="Classic-with-Dal-Makhani-Jeera-Rice-and-Gulab-Jamun-every-single-day"
        tag={<span>Launch price</span>}
      />
    );
    const name = screen.getByRole("heading");
    expect(name).toHaveClass("min-w-0", "wrap-anywhere");
    expect(name.parentElement).toHaveClass("flex-wrap");
  });

  it("has no accessibility violations flooded with every part", async () => {
    const { container } = render(
      <PricingCard
        {...CLASSIC}
        points={[...CLASSIC.points]}
        variant="flooded"
        badge={<span>Our recommendation</span>}
        footnote="Weekday plan: ₹3,120 · 24 meals"
        action={<a href="#builder">Build with Classic</a>}
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- pricing-card 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./pricing-card`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/pricing-card/pricing-card.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { Check } from "lucide-react";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";

type PricingCardVariant = "default" | "featured" | "flooded";

/** White cards are light islands; the flooded card is a brand field. */
const SURFACE_OF: Readonly<Record<PricingCardVariant, "light" | "brand">> = {
  default: "light",
  featured: "light",
  flooded: "brand",
};

const pricingCard = componentVariants({
  slots: {
    root: "p-pricing-card-pad relative flex h-full flex-col gap-3.5 rounded-xl",
    badge: "absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap",
    header: "flex flex-wrap items-center justify-between gap-2",
    // A long name wraps (anywhere, if it must) rather than widening the card.
    name: "min-w-0 font-display text-h4 font-black wrap-anywhere text-text-heading",
    priceRow: "m-0 flex max-w-none flex-wrap items-baseline gap-x-2 gap-y-1",
    price: "text-pricing-card-price font-display text-text-heading",
    unit: "text-body-sm text-text-muted",
    was: "text-body text-text-muted",
    blurb: "m-0 max-w-none text-body-sm text-text-body",
    points: "m-0 flex flex-1 flex-col",
    point:
      "flex items-start gap-2.5 border-t border-border-subtle py-2 text-body-sm text-text-body",
    pointIcon: "mt-0.5 text-text-brand",
    footer: "mt-auto flex flex-col gap-3.5",
    footnote: "m-0 max-w-none text-caption text-text-muted",
  },
  variants: {
    variant: {
      default: { root: "border border-border-subtle bg-surface-card shadow-1" },
      featured: { root: "border-2 border-border-brand bg-surface-card shadow-3" },
      flooded: { root: "bg-surface-brand shadow-4" },
    },
  },
});

export interface PricingCardProps extends Omit<ComponentProps<"article">, "title"> {
  name: ReactNode;
  /** A chip beside the name, e.g. "Launch price". */
  tag?: ReactNode | undefined;
  /** A marker centred on the card's top edge, e.g. "Our recommendation". */
  badge?: ReactNode | undefined;
  price: number;
  /** "a meal", "a head", "/head". */
  unit: string;
  was?: number | undefined;
  blurb?: ReactNode | undefined;
  /** What the plate includes; each gets a tick. */
  points?: ReactNode[] | undefined;
  footnote?: ReactNode | undefined;
  action?: ReactNode | undefined;
  /** An ImageSlot above the name (Catering dawats). */
  media?: ReactNode | undefined;
  variant?: PricingCardVariant | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/** A plate, dawat or office plan with its price per unit — Home, Homely Meals, Catering, Office. */
export function PricingCard({
  name,
  tag,
  badge,
  price,
  unit,
  was,
  blurb,
  points,
  footnote,
  action,
  media,
  variant = "default",
  headingLevel = 3,
  className,
  ...props
}: PricingCardProps) {
  const styles = pricingCard({ variant });
  const Heading = headingTag(headingLevel);

  return (
    <article data-surface={SURFACE_OF[variant]} className={styles.root({ className })} {...props}>
      {badge ? <div className={styles.badge()}>{badge}</div> : null}
      {media}
      <div className={styles.header()}>
        <Heading className={styles.name()}>{name}</Heading>
        {tag}
      </div>
      <p className={styles.priceRow()}>
        <span className={styles.price()}>{formatRupees(price)}</span>
        <span className={styles.unit()}>{unit}</span>
        {was === undefined ? null : (
          <s className={styles.was()}>
            <span className="sr-only">Was </span>
            {formatRupees(was)}
          </s>
        )}
      </p>
      {blurb ? <p className={styles.blurb()}>{blurb}</p> : null}
      {points && points.length > 0 ? (
        <ul className={styles.points()}>
          {points.map((point, index) => (
            <li key={index} className={styles.point()}>
              <Icon icon={Check} size="sm" className={styles.pointIcon()} />
              {point}
            </li>
          ))}
        </ul>
      ) : null}
      {footnote || action ? (
        <div className={styles.footer()}>
          {footnote ? <p className={styles.footnote()}>{footnote}</p> : null}
          {action}
        </div>
      ) : null}
    </article>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- pricing-card 2>&1 | tail -8`
Expected: PASS (11 tests).

- [ ] **Step 6: Stories — Home plates, Homely Meals plates (flooded), Catering dawats (media), Office plates, the long-name check**

`packages/ui/src/molecules/pricing-card/pricing-card.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowRight, Star } from "lucide-react";
import { expect } from "storybook/test";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { Badge } from "../../atoms/badge/badge";
import { Button } from "../../atoms/button/button";
import { ImageSlot } from "../../atoms/image-slot/image-slot";
import { PricingCard } from "./pricing-card";

/** `rates.js` → homely.plates (Classic at its launch price). */
const PLATE_POINTS = {
  everyday: [
    "4 home dals, 7 seasonal sabjis",
    "2 fresh tawa roti + steamed rice",
    "Home-style paneer once a week",
    "Biryani once a week, with raita",
  ],
  classic: [
    "30 dishes: Rajma, Chole, Dal Makhani, Kofta, Gatte",
    "3 fresh tawa roti + rice, jeera rice Tue & Wed",
    "Raita three times a week",
    "Weekly biryani + Gulab Jamun",
    "Restaurant-style paneer once a week",
  ],
  signature: [
    "Everything in Classic",
    "Restaurant-style paneer gravy every day",
    "Dessert and papad daily",
    "Soup twice a week",
    "Raita every day",
  ],
} as const;

const build = (plate: string, variant: "secondary" | "inverse" = "secondary") => (
  <Button variant={variant} size="md" isFullWidth iconAfter={ArrowRight}>
    Build with {plate}
  </Button>
);

const meta = {
  title: "Molecules/PricingCard",
  component: PricingCard,
  args: {
    name: "Classic",
    price: 130,
    was: 140,
    unit: "a meal",
    blurb: "The full Pink Paprikaa menu. Our recommendation.",
    points: [...PLATE_POINTS.classic],
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
          'A plate, dawat or office plan with its price per unit. `variant="featured"` adds the 2px brand border (Home\'s recommended plate); `variant="flooded"` floods pink and sets the brand surface (Homely Meals, Catering). `tag` sits beside the name; `badge` is centred on the top edge; `media` goes above the name; `points` get a tick each; the footnote and action pin to the bottom so cards in a row line up. Prices are numbers, formatted by the card.',
      },
    },
  },
} satisfies Meta<typeof PricingCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Home "Three plates. Pick yours." */
export const HomePlates: Story = {
  decorators: [],
  render: () => (
    <div className="grid max-w-content grid-cols-1 gap-4 md:grid-cols-3">
      <PricingCard
        name="Everyday"
        price={120}
        unit="a meal"
        blurb={PLATE_POINTS.everyday.join(" · ")}
      />
      <PricingCard
        variant="featured"
        name="Classic"
        tag={<Badge tone="brand">Launch price</Badge>}
        price={130}
        unit="a meal"
        blurb={PLATE_POINTS.classic.join(" · ")}
      />
      <PricingCard
        name="Signature"
        price={200}
        unit="a meal"
        blurb={PLATE_POINTS.signature.join(" · ")}
      />
    </div>
  ),
};

/** Homely Meals "You pay per meal." — the flooded recommendation. */
export const HomelyPlates: Story = {
  decorators: [],
  render: () => (
    <div className="grid max-w-content grid-cols-1 gap-4 pt-4 md:grid-cols-3">
      <PricingCard
        name="Everyday"
        price={120}
        unit="a meal"
        blurb="Home-style basics, kept simple."
        points={[...PLATE_POINTS.everyday]}
        footnote={`Weekday plan: ${formatRupees(120 * 24)} · 24 meals`}
        action={build("Everyday")}
      />
      <PricingCard
        variant="flooded"
        badge={
          <Badge tone="ink" icon={Star}>
            Our recommendation
          </Badge>
        }
        name="Classic"
        price={130}
        was={140}
        unit="a meal"
        blurb="The full Pink Paprikaa menu. Our recommendation."
        points={[...PLATE_POINTS.classic]}
        footnote={`Weekday plan: ${formatRupees(130 * 24)} · 24 meals`}
        action={build("Classic", "inverse")}
      />
      <PricingCard
        name="Signature"
        price={200}
        unit="a meal"
        blurb="A different plate, every single day."
        points={[...PLATE_POINTS.signature]}
        footnote={`Weekday plan: ${formatRupees(200 * 24)} · 24 meals`}
        action={build("Signature")}
      />
    </div>
  ),
};

/** Catering "Dawat packages" — media, per head (`rates.js` → catering.dawats). */
export const CateringDawats: Story = {
  decorators: [],
  render: () => (
    <div className="grid max-w-content grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-4">
      {[
        {
          name: "Classic Dawat",
          price: 149,
          blurb: "Honest, homely food, and plenty of it.",
          points: [
            "Mix Veg — seasonal, light homely masala",
            "Dal Fry — jeera and hing tadka",
            "4 Butter Tandoori Roti",
            "Steamed Rice",
            "Boondi Raita",
            "Sirka Pyaaz",
            "Mint Chutney",
            "Roasted Papad (2 pc)",
          ],
          bestFor: "Office lunches, pooja prasad, small family gatherings, staff meals",
        },
        {
          name: "Signature Dawat",
          price: 199,
          tag: <Badge tone="soft">Most ordered</Badge>,
          isFlooded: true,
          blurb: "The one we would put in front of our own family.",
          points: [
            "Paneer gravy — Do Pyaza, Matar or Kadhai",
            "Mix Veg",
            "Dal Fry",
            "4 Butter Tandoori Roti",
            "Steamed Rice",
            "Boondi Raita",
            "Kachumber Salad",
            "Mint Chutney",
            "Roasted Papad (2 pc)",
            "Gulab Jamun (1 pc)",
          ],
          bestFor: "Birthdays, family functions, client lunches, house parties",
        },
        {
          name: "Maharaja Dawat",
          price: 269,
          blurb: "For the days that deserve a proper table.",
          points: [
            "Premium paneer — Butter Masala, Lababdar or Tawa",
            "Mix Veg",
            "Dal Makhani — slow-cooked overnight",
            "3 Butter Tandoori Roti + 1 Lachha Paratha",
            "Jeera Rice",
            "Mix Veg Raita",
            "Kachumber Salad",
            "Mint Chutney",
            "Roasted Papad (2 pc)",
            "Gulab Jamun (2 pc)",
          ],
          bestFor: "Anniversaries, engagements, festivals",
        },
        {
          name: "Royal Dawat",
          price: 549,
          tag: <Badge tone="ink">50+ guests</Badge>,
          blurb: "The full evening, course by course. 50 guests and above.",
          points: [
            "Soup — Manchow, Tomato or Sweet Corn",
            "4 starters — Chilli Potato, Veg Manchurian, Hakka Noodles, Tandoori Veg Seekh",
            "Premium paneer gravy + Soya Chaap",
            "Mix Veg · Dal Makhani",
            "3 Butter Tandoori Roti + 1 Lachha Paratha",
            "Veg Dum Biryani with Mirchi ka Salan",
            "Boondi Raita · Kachumber · Chutney · Papad",
            "Gulab Jamun (2 pc) + Rice Kheer",
            "Shikanji",
          ],
          bestFor: "Large corporate events, big family functions, milestones",
        },
      ].map(({ name, price, tag, isFlooded, blurb, points, bestFor }) => (
        <PricingCard
          key={name}
          variant={isFlooded === true ? "flooded" : "default"}
          media={<ImageSlot ratio="16:10" radius="md" label={`PHOTO: ${name} plated`} />}
          name={name}
          tag={tag}
          price={price}
          unit="a head"
          blurb={blurb}
          points={points}
          footnote={
            <>
              <strong>Best for</strong> — {bestFor}
            </>
          }
          action={
            <Button
              variant={isFlooded === true ? "inverse" : "secondary"}
              size="md"
              isFullWidth
              iconAfter={ArrowRight}
            >
              Build this Dawat
            </Button>
          }
        />
      ))}
    </div>
  ),
};

/** Office & PG lunch "Two plates" (`rates.js` → office.plates). */
export const OfficePlates: Story = {
  decorators: [],
  render: () => (
    <div className="grid max-w-content grid-cols-1 gap-4 md:grid-cols-2">
      <PricingCard
        name="Everyday"
        price={99}
        unit="a meal"
        blurb="4 home dals, 7 seasonal sabjis, 2 roti, rice, salad. Home-style paneer and biryani once a week."
      />
      <PricingCard
        name="Classic"
        price={119}
        unit="a meal"
        blurb="The full 30-dish menu, 3 roti, jeera rice twice a week, weekly biryani."
      />
    </div>
  ),
};

/** A very long plate name at 360px: it wraps inside the card; nothing overflows. */
export const LongName: Story = {
  args: {
    name: "Classic-with-Dal-Makhani-Jeera-Rice-and-Gulab-Jamun-every-single-day",
    tag: <Badge tone="brand">Launch price</Badge>,
    variant: "featured",
  },
  decorators: [
    (Story) => (
      <div className="w-90">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas }) => {
    const card = canvas.getByRole("article");
    const name = canvas.getByRole("heading");
    await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
    await expect(name.getBoundingClientRect().right).toBeLessThanOrEqual(
      card.getBoundingClientRect().right
    );
  },
};
```

- [ ] **Step 7: Export**

```ts
export { PricingCard, type PricingCardProps } from "./molecules/pricing-card/pricing-card";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/design-tokens/tokens/component/pricing-card.json packages/ui/src/molecules/pricing-card packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts`; then the long-name check in Chromium:

```bash
pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache -- pricing-card 2>&1 | tail -10
```

Expected: every PricingCard story passes, including `LongName`'s play.

- [ ] **Step 9: Commit**

```bash
git add packages/design-tokens/tokens/component/pricing-card.json packages/ui/src/molecules/pricing-card packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): PricingCard molecule

One pricing card for the handoff's plates, dawats and office plans:
default, featured (2px brand border) and flooded (brand surface), with
tag, top-edge badge, media, ticked points and a footer that pins to the
bottom. Long names wrap inside the card; a story play measures it at
360px in Chromium.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

