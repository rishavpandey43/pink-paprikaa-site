import type { Meta, StoryObj } from "@storybook/react-vite";

import { Search, ShoppingBag } from "lucide-react";

import { Button } from "../../atoms/button/button";
import { EmptyState } from "./empty-state";

const meta = {
  title: "Molecules/EmptyState",
  component: EmptyState,
  argTypes: { icon: { control: false } },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The nothing-here state — an empty cart, a search that matched nothing, a first-time " +
          "order list. Two short sentences, never apologetic, and exactly one action.",
      },
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The brand diamond is the warmer of the two marks, and the default for an empty cart. */
export const Symbol: Story = {
  args: {
    hasSymbol: true,
    action: <Button icon={ShoppingBag}>Browse the Menu</Button>,
  },
};

/** A Lucide glyph at 32px when the state is about a specific thing rather than the brand. */
export const WithIcon: Story = {
  args: {
    icon: Search,
    title: "Nothing matches that yet.",
    body: "Try another category.",
  },
};

/** `lg` is for a full page; `md` sits inside a card or a panel. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div className="rounded-4 bg-surface-card">
        <EmptyState
          {...args}
          hasSymbol
          size="md"
          title="No orders yet."
          body="Your first one is a tap away."
        />
      </div>
      <div className="rounded-4 bg-surface-card">
        <EmptyState
          {...args}
          hasSymbol
          size="lg"
          title="No orders yet."
          body="Your first one is a tap away."
        />
      </div>
    </div>
  ),
};

/** In place: inside a cart panel, with the single action that fills it. */
export const InCart: Story = {
  render: (args) => (
    <div className="max-w-90 rounded-4 border border-border-subtle bg-surface-card">
      <EmptyState
        {...args}
        action={<Button icon={ShoppingBag}>Browse the Menu</Button>}
        body="Add something from the menu and it will show up here."
        hasSymbol
        title="Your cart is empty."
      />
    </div>
  ),
};
