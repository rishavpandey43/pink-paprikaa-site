import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";

import { House, Receipt, ShoppingBag, User, Utensils } from "lucide-react";

import { TabBar, type TabBarItem } from "./tab-bar";

const FOUR: TabBarItem[] = [
  { value: "home", label: "Home", icon: House },
  { value: "menu", label: "Menu", icon: Utensils },
  { value: "cart", label: "Cart", icon: ShoppingBag, count: 2 },
  { value: "you", label: "You", icon: User },
];

const FIVE: TabBarItem[] = [
  { value: "home", label: "Home", icon: House },
  { value: "menu", label: "Menu", icon: Utensils },
  { value: "cart", label: "Cart", icon: ShoppingBag },
  { value: "orders", label: "Orders", icon: Receipt },
  { value: "you", label: "You", icon: User },
];

const meta = {
  title: "Organisms/TabBar",
  component: TabBar,
  args: { items: FOUR, defaultValue: "menu" },
  argTypes: { items: { control: false } },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The ordering app's fixed bottom navigation — 64px tall, four or five destinations, " +
          "never more. Each destination is a page, so the one in view carries `aria-current` " +
          "rather than a tab-list role, and every item clears the 44px hit target at 360px.",
      },
    },
  },
} satisfies Meta<typeof TabBar>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A phone-width frame, so the bar is seen at the width it actually ships at. */
function Phone({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-97.5 overflow-hidden rounded-4 border border-border-subtle">
      {children}
    </div>
  );
}

export const Default: Story = {
  render: (args) => (
    <Phone>
      <TabBar {...args} />
    </Phone>
  ),
};

/** Four destinations with a cart count — the shape the app ships with. */
export const FourDestinations: Story = {
  render: (args) => (
    <Phone>
      <TabBar {...args} defaultValue="menu" items={FOUR} />
    </Phone>
  ),
};

/** Five is the ceiling. At 360px each destination still holds a 72px column. */
export const FiveDestinations: Story = {
  render: (args) => (
    <Phone>
      <TabBar {...args} defaultValue="home" items={FIVE} />
    </Phone>
  ),
};

/**
 * Every destination, one after another, so the active treatment can be compared at a glance.
 *
 * Four bars means four `navigation` landmarks in one document, and landmarks are identified by
 * their role and accessible name together — four of them called "Primary" is four landmarks a
 * screen-reader user cannot tell apart. Each specimen therefore names itself.
 */
export const EachDestinationActive: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {FOUR.map((item) => (
        <Phone key={item.value}>
          <TabBar
            {...args}
            defaultValue={item.value}
            items={FOUR}
            label={`Primary, ${item.label} in view`}
          />
        </Phone>
      ))}
    </div>
  ),
};

/** The smallest supported viewport. Nothing wraps and nothing truncates. */
export const Smallest: Story = {
  globals: { viewport: { value: "floor360" } },
  render: (args) => (
    <div className="w-90 overflow-hidden rounded-4 border border-border-subtle">
      <TabBar {...args} items={FIVE} />
    </div>
  ),
};
