import type { Meta, StoryObj } from "@storybook/react-vite";

import { StatusDot } from "./status-dot";

const meta = {
  title: "Atoms/StatusDot",
  component: StatusDot,
  args: { tone: "open", label: "Open till 11:30pm", size: "sm" },
  parameters: {
    docs: {
      description: {
        component:
          'Outlet open/closed state and live order state. A rotated diamond with the brand mark inside, not a circle — the brand shape carries all the way down. `isPulsing` is for live orders only (and stops under reduced motion). State is never colour alone: give a `label`, or a bare dot is announced by its tone ("Open"), which `aria-label` can override.',
      },
    },
  },
} satisfies Meta<typeof StatusDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tones: Story = {
  name: "tone",
  render: () => (
    <div className="grid gap-2.5">
      <StatusDot tone="open" label="Open till 11:30pm" />
      <StatusDot tone="busy" label="Kitchen is busy" />
      <StatusDot tone="closed" label="Opens 9am" />
      <StatusDot tone="danger" label="Not taking orders" />
    </div>
  ),
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <StatusDot size="sm" label="Small (14px)" />
      <StatusDot size="md" label="Medium (16px)" />
    </div>
  ),
};

export const Pulse: Story = {
  name: "isPulsing",
  args: { tone: "live", label: "On the tandoor", isPulsing: true },
};

export const Bare: Story = {
  name: 'bare (size="md", no label)',
  render: () => (
    <div className="flex items-center gap-3">
      <StatusDot tone="open" size="md" />
      <StatusDot tone="busy" size="md" />
      <StatusDot tone="closed" size="md" />
      <StatusDot tone="danger" size="md" />
    </div>
  ),
};

/** In context: the outlet strip under the header. */
export const OutletStrip: Story = {
  name: "in context: outlet strip",
  render: () => (
    <div className="grid justify-items-start gap-3 rounded-lg bg-surface-sunken p-4">
      <StatusDot tone="open" label="Sector 57 — open till 11:30pm" />
      <StatusDot tone="busy" label="Kitchen is busy — about 25 minutes" />
      <StatusDot tone="live" label="Your order is on the tandoor" isPulsing />
    </div>
  ),
};
