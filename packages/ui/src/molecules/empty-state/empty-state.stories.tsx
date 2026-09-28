import type { Meta, StoryObj } from "@storybook/react-vite";

import { Search, ShoppingBag } from "lucide-react";

import { Button } from "../../atoms/button/button";
import { EmptyState } from "./empty-state";

const meta = {
  title: "Molecules/EmptyState",
  component: EmptyState,
  args: {
    variant: "symbol",
    title: "Nothing here yet.",
    body: "Let's fix that.",
    action: <Button>Browse the Menu</Button>,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Empty cart, no search results, no orders yet. Copy is two short sentences and never apologetic — the title says what is missing, the body what to do next. Exactly one action, never two. `variant="symbol"` uses the brand diamond (the warmer option); otherwise a Lucide glyph (default Utensils). `headingLevel` (default 3) fits the page\'s outline.',
      },
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "symbol". */
export const Playground: Story = {};

/** Card row "icon". */
export const WithIcon: Story = {
  args: {
    variant: "icon",
    icon: Search,
    title: "Nothing matches that yet.",
    body: "Try another category.",
    action: undefined,
  },
};

/** Card row `size="lg"`. */
export const Large: Story = {
  args: {
    size: "lg",
    title: "No orders yet.",
    body: "Your first order will show up here.",
    action: undefined,
  },
};

/** Dev parity: in place — inside a cart panel, with the single action that fills it. */
export const InCart: Story = {
  args: {
    title: "Your cart is empty.",
    body: "Add something from the menu and it will show up here.",
    action: <Button icon={ShoppingBag}>Browse the Menu</Button>,
  },
  render: (args) => (
    <div className="max-w-90 rounded-lg border border-border-subtle bg-surface-card">
      <EmptyState {...args} />
    </div>
  ),
};
