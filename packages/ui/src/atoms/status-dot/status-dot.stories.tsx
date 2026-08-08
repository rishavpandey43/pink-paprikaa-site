import type { Meta, StoryObj } from "@storybook/react-vite";

import { StatusDot } from "./status-dot";

const meta = {
  title: "Atoms/StatusDot",
  component: StatusDot,
  args: { tone: "open", label: "Open till 11:30pm" },
  parameters: {
    docs: {
      description: {
        component:
          "Outlet open/closed state and live order state. A rotated diamond, not a circle — the " +
          "brand shape carries all the way down. `isPulsing` is for live orders only; a dot with " +
          "no visible label announces its tone's own name, so colour never carries meaning alone.",
      },
    },
  },
} satisfies Meta<typeof StatusDot>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Tones: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-3">
      <StatusDot {...args} label="Open till 11:30pm" tone="open" />
      <StatusDot {...args} label="Kitchen is busy" tone="busy" />
      <StatusDot {...args} label="Opens 9am" tone="closed" />
      <StatusDot {...args} label="Not taking orders" tone="danger" />
    </div>
  ),
};

/** The throb is reserved for live orders — never for a static open/closed mark. */
export const Live: Story = {
  render: (args) => <StatusDot {...args} isPulsing label="On the tandoor" tone="live" />,
};

/** 10 / 14 / 18px. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <StatusDot {...args} label="Extra small" size="xs" />
      <StatusDot {...args} label="Small" size="sm" />
      <StatusDot {...args} label="Medium" size="md" />
      <StatusDot {...args} label="Large" size="lg" />
    </div>
  ),
};

/** Without a visible label the dot keeps an accessible name of its own. */
export const Bare: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <StatusDot size="lg" tone="open" />
      <StatusDot size="lg" tone="busy" />
      <StatusDot size="lg" tone="closed" />
      <StatusDot size="lg" tone="danger" />
    </div>
  ),
};

/** In context: the outlet strip that sits under the header. */
export const OutletStrip: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex flex-col items-start gap-3 rounded-4 bg-surface-sunken p-4">
      <StatusDot label="Sector 57 — open till 11:30pm" tone="open" />
      <StatusDot label="MKM Market — kitchen is busy" tone="busy" />
      <StatusDot isPulsing label="Your order is on the tandoor" tone="live" />
    </div>
  ),
};
