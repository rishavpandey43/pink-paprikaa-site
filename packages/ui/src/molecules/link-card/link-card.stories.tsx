import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { ImageSlot } from "../../atoms/image-slot/image-slot";
import { LinkCard } from "./link-card";

/** Stands in for the app's router link in the asChild story. */
function RouterLink({ children, ...props }: ComponentProps<"a">) {
  return (
    <a data-router="" {...props}>
      {children}
    </a>
  );
}

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
  title: "Molecules/LinkCard",
  component: LinkCard,
  args: {
    href: "#homely-meals",
    title: "Homely Meals",
    description: `Daily veg meals from ${formatRupees(120)}`,
    cta: "See plans",
    media: <ImageSlot ratio="square" radius="md" label="Box" />,
  },
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

export const Playground: Story = { decorators: [prose] };

/** Home "One kitchen, three ways to eat". */
export const HomeDoors: Story = {
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
  render: () => (
    <div className="grid max-w-content grid-cols-1 gap-4 md:grid-cols-3">
      <LinkCard
        layout="stack"
        surface="brand"
        href="#homely-meals"
        title="Homely Meals"
        description="Eat from our kitchen every day"
      />
      <LinkCard
        layout="stack"
        surface="ink"
        href="#catering"
        title="Dawat catering"
        description="For your next occasion"
      />
      <LinkCard
        layout="stack"
        surface="soft"
        href="#contact"
        title="Visit us"
        description="MKM Market, Sector 57"
      />
    </div>
  ),
};

/** `asChild`: the card renders into the consumer's link element. */
export const AsChild: Story = {
  decorators: [prose],
  args: { asChild: true, href: undefined, children: <RouterLink href="#homely-meals" /> },
};
