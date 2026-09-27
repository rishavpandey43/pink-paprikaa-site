import type { Meta, StoryObj } from "@storybook/react-vite";

import { Flame, Leaf, Star } from "lucide-react";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Badge } from "./badge";

const meta = {
  title: "Atoms/Badge",
  component: Badge,
  args: { children: "Bestseller", tone: "brand" },
  argTypes: { icon: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          "Uppercase status marker for menu items, orders and cards — non-interactive. Always ALL CAPS and two words maximum. For a filterable, tappable pill use `Tag` instead. The `brand` tone turns white on a pink field so it never vanishes; the other tones carry their own fills and read on any surface.",
      },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tones: Story = {
  name: "tone",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge tone="brand">Bestseller</Badge>
      <Badge tone="soft">New</Badge>
      <Badge tone="ink">Tonight Only</Badge>
      <Badge tone="neutral">Veg</Badge>
    </div>
  ),
};

export const StatusTones: Story = {
  name: 'tone="success" · "warning" · "danger"',
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge tone="success">Confirmed</Badge>
      <Badge tone="warning">Kitchen Busy</Badge>
      <Badge tone="danger">Sold Out</Badge>
    </div>
  ),
};

export const WithIcon: Story = {
  name: "icon",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge tone="soft" icon={Flame}>
        Hot
      </Badge>
      <Badge tone="success" icon={Leaf}>
        100% Veg
      </Badge>
      <Badge tone="brand" icon={Star}>
        Chef Pick
      </Badge>
    </div>
  ),
};

/** In context: the markers on a menu card, above the dish name. */
export const OnAMenuCard: Story = {
  name: "in context: on a menu card",
  render: () => (
    <div className="grid max-w-72 gap-2 rounded-lg bg-surface-card p-4 shadow-1">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="brand">Bestseller</Badge>
        <Badge tone="soft" icon={Flame}>
          Hot
        </Badge>
      </div>
      <h4 className="m-0">Paneer Tikka Masala</h4>
      <p className="m-0 font-body text-body-sm text-text-muted">₹280</p>
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Badge tone="brand">Bestseller</Badge>
      <Badge tone="soft">New</Badge>
      <Badge tone="ink">Signature</Badge>
    </OnSurfaces>
  ),
};
