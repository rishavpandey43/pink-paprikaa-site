import type { Meta, StoryObj } from "@storybook/react-vite";

import { Flame, Leaf, Star } from "lucide-react";

import { Text } from "../text/text";
import { Badge } from "./badge";

const meta = {
  title: "Atoms/Badge",
  component: Badge,
  args: { children: "Bestseller" },
  argTypes: {
    icon: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Uppercase status marker for menu items, orders and cards — non-interactive, always " +
          "ALL CAPS, two words maximum. For a tappable filter pill use `Tag` instead.",
      },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Tones: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge {...args} tone="brand">
        Bestseller
      </Badge>
      <Badge {...args} tone="soft">
        New
      </Badge>
      <Badge {...args} tone="ink">
        Tonight Only
      </Badge>
      <Badge {...args} tone="neutral">
        Veg
      </Badge>
    </div>
  ),
};

/** The soft ground carries the state; the ink is the status colour itself. */
export const StatusTones: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge {...args} tone="success">
        Confirmed
      </Badge>
      <Badge {...args} tone="warning">
        Kitchen Busy
      </Badge>
      <Badge {...args} tone="danger">
        Sold Out
      </Badge>
    </div>
  ),
};

export const WithIcons: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge {...args} icon={Flame} tone="soft">
        Hot
      </Badge>
      <Badge {...args} icon={Leaf} tone="success">
        100% Veg
      </Badge>
      <Badge {...args} icon={Star} tone="brand">
        Chef Pick
      </Badge>
    </div>
  ),
};

/** In context: the markers that sit on a menu card, above the dish name. */
export const OnAMenuCard: Story = {
  parameters: { layout: "padded" },
  render: (args) => (
    <div className="flex max-w-72 flex-col gap-2 rounded-4 bg-surface-card p-4 shadow-elevation1">
      <div className="flex flex-wrap items-center gap-2">
        <Badge {...args} tone="brand">
          Bestseller
        </Badge>
        <Badge {...args} icon={Flame} tone="soft">
          Hot
        </Badge>
      </div>
      <Text variant="subtitle1">Paneer Tikka Masala</Text>
      <Text variant="body2" tone="muted">
        ₹280
      </Text>
    </div>
  ),
};
