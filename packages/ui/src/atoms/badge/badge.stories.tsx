import type { Meta, StoryObj } from "@storybook/react-vite";
import { Flame, Leaf, Star } from "lucide-react";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Badge } from "./badge";

const meta = {
  title: "Atoms/Badge",
  component: Badge,
  args: { children: "Bestseller", color: "brand", variant: "solid" },
  argTypes: { icon: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          "Uppercase status marker for menu items, orders and cards — non-interactive. Always ALL CAPS and two words maximum. For a filterable, tappable pill use `Tag` instead. The solid `brand` skin turns white on a pink field so it never vanishes; the other skins carry their own fills and read on any surface. `color` is the palette, `variant` is `solid` or `soft`; the status colours (success, warning, danger) only have a soft skin.",
      },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Colors: Story = {
  name: "color × variant",
  render: () => (
    <div className="grid gap-3">
      {(["solid", "soft"] as const).map((variant) => (
        <div key={variant} className="flex flex-wrap items-center gap-3">
          <Badge color="brand" variant={variant}>
            Bestseller
          </Badge>
          <Badge color="neutral" variant={variant}>
            {variant === "solid" ? "Tonight Only" : "Veg"}
          </Badge>
        </div>
      ))}
    </div>
  ),
};

export const StatusColors: Story = {
  name: 'color="success" · "warning" · "danger"',
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge color="success">Confirmed</Badge>
      <Badge color="warning">Kitchen Busy</Badge>
      <Badge color="danger">Sold Out</Badge>
    </div>
  ),
};

export const WithIcon: Story = {
  name: "icon",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge color="brand" icon={Flame}>
        Hot
      </Badge>
      <Badge color="success" icon={Leaf}>
        100% Veg
      </Badge>
      <Badge color="brand" variant="solid" icon={Star}>
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
        <Badge color="brand" variant="solid">
          Bestseller
        </Badge>
        <Badge color="brand" icon={Flame}>
          Hot
        </Badge>
      </div>
      <h4 className="m-0">Paneer Tikka Masala</h4>
      <p className="m-0 font-body text-body-sm text-text-muted">₹280</p>
    </div>
  ),
};

export const Sx: Story = {
  name: "sx",
  render: () => (
    <div className="flex items-center">
      <Badge sx={{ ms: 4 }}>Margin start</Badge>
      <Badge sx={{ px: 4 }}>Wide padding</Badge>
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Badge color="brand" variant="solid">
        Bestseller
      </Badge>
      <Badge color="brand">New</Badge>
      <Badge color="neutral" variant="solid">
        Signature
      </Badge>
    </OnSurfaces>
  ),
};
