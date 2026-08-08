import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowRight, MapPin, ShoppingBag } from "lucide-react";

import { Button } from "./button";

const meta = {
  title: "Atoms/Button",
  component: Button,
  args: { children: "Order Now" },
  argTypes: {
    icon: { control: false },
    iconAfter: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "The brand's action button — pill, Poppins Bold, Title Case. Use `primary` once per " +
          "view. Press is a 0.97 scale *and* a darkening, together; disabled is a real grey fill, " +
          "never a faded one.",
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <Button {...args} variant="primary">
        Order Now
      </Button>
      <Button {...args} variant="secondary">
        See Full Menu
      </Button>
      <Button {...args} variant="ghost">
        Find a Paprikaa
      </Button>
      <Button {...args} variant="inverse">
        Franchise With Us
      </Button>
    </div>
  ),
};

/** 36 / 44 / 54px — fixed heights, so a button never wraps or shrinks in a tight row. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <Button {...args} icon={ShoppingBag} size="lg">
        Order Now
      </Button>
      <Button {...args} iconAfter={ArrowRight} variant="ghost">
        Find a Paprikaa
      </Button>
      <Button {...args} icon={MapPin} variant="secondary">
        Outlets
      </Button>
    </div>
  ),
};

/** On a flooded pink panel the fills invert — pink-on-pink has no contrast to work with. */
export const OnBrand: Story = {
  globals: { backgrounds: { value: "brand" } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4 rounded-4 bg-surface-brand p-8">
      <Button {...args} icon={ShoppingBag} on="brand" variant="primary">
        Order Now
      </Button>
      <Button {...args} on="brand" variant="secondary">
        See Full Menu
      </Button>
      <Button {...args} on="brand" variant="ghost">
        Find a Paprikaa
      </Button>
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <Button {...args}>Rest</Button>
      <Button {...args} isLoading>
        Adding
      </Button>
      <Button {...args} disabled>
        Sold Out
      </Button>
      <Button {...args} disabled variant="secondary">
        Unavailable
      </Button>
    </div>
  ),
};

/** Full width is the mobile cart-bar shape — one action, edge to edge. */
export const FullWidth: Story = {
  parameters: { layout: "padded" },
  render: (args) => (
    <div className="w-full max-w-80">
      <Button {...args} icon={ShoppingBag} isFullWidth size="lg">
        Add to Cart · ₹280
      </Button>
    </div>
  ),
};
