import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

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

/**
 * One card at the prose measure. A story decorator, not a `meta` one: Storybook concatenates story
 * and meta decorators (`decorators: []` on a story removes nothing), so a meta-level width would
 * squeeze the page-section stories too.
 */
const prose: Decorator = (Story) => (
  <div className="w-160 max-w-full">
    <Story />
  </div>
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

export const Playground: Story = { decorators: [prose] };

/** Home "Three plates. Pick yours." */
export const HomePlates: Story = {
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
        tag={
          <Badge color="brand" variant="solid">
            Launch price
          </Badge>
        }
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
          <Badge color="neutral" variant="solid" icon={Star}>
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
          tag: <Badge color="brand">Most ordered</Badge>,
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
          tag: (
            <Badge color="neutral" variant="solid">
              50+ guests
            </Badge>
          ),
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

/**
 * A very long plate name at 360px: it wraps inside the card; nothing overflows. One unbroken word,
 * the worst case: a hyphenated name wraps at its hyphens anyway, so only this one proves the
 * `wrap-anywhere` guard.
 */
export const LongName: Story = {
  args: {
    name: "ClassicWithDalMakhaniJeeraRiceAndGulabJamunEverySingleDay",
    tag: (
      <Badge color="brand" variant="solid">
        Launch price
      </Badge>
    ),
    variant: "featured",
  },
  decorators: [
    (Story) => (
      <div className="w-90 max-w-full">
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
