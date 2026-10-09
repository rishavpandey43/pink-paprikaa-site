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

import { formatRupees } from "@pink-paprikaa-web/utils";

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
            description: `Join at ${formatRupees(130)} and it stays ${formatRupees(130)} while you stay subscribed.`,
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

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: (args) => (
    <OnSurfaces>
      <FeatureItem {...args} className="min-w-0 flex-1" />
    </OnSurfaces>
  ),
};
