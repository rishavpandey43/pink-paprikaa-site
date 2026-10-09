import type { Meta, StoryObj } from "@storybook/react-vite";
import { Search, ShoppingBag } from "lucide-react";
import { expect } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { groundOf } from "../../lib/story-paint";
import { OnSurfaces } from "../../lib/story-surfaces";
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

/** On every field: the symbol and the glyph turn white on pink, where pink would vanish (R89). */
export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  args: { action: undefined },
  render: (args) => (
    <OnSurfaces>
      <EmptyState {...args} size="md" />
      <EmptyState {...args} variant="icon" size="md" />
    </OnSurfaces>
  ),
  play: async ({ canvasElement }) => {
    const marks = [...canvasElement.querySelectorAll(".mask-symbol, svg.lucide")];
    // A symbol and a glyph on each of the 5 grounds.
    await expect(marks).toHaveLength(10);
    for (const mark of marks) {
      await expect(getComputedStyle(mark).color).not.toBe(groundOf(mark));
    }
  },
};
