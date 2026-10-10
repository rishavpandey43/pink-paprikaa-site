import type { Meta, StoryObj } from "@storybook/react-vite";

import { StatusDot } from "./status-dot";

const meta = {
  title: "Atoms/StatusDot",
  component: StatusDot,
  args: { status: "open", label: "Open till 11:30pm", size: "sm" },
  parameters: {
    docs: {
      description: {
        component:
          'Outlet open/closed state and live order state. A rotated diamond with the brand mark inside, not a circle — the brand shape carries all the way down. `isPulsing` is for live orders only (and stops under reduced motion). State is never colour alone: give a `label`, or a bare dot is announced by its status ("Open"), which `aria-label` can override.',
      },
    },
  },
} satisfies Meta<typeof StatusDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Statuses: Story = {
  name: "status",
  render: () => (
    <div className="grid gap-2.5">
      <StatusDot status="open" label="Open till 11:30pm" />
      <StatusDot status="busy" label="Kitchen is busy" />
      <StatusDot status="closed" label="Opens 9am" />
      <StatusDot status="danger" label="Not taking orders" />
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
  args: { status: "live", label: "On the tandoor", isPulsing: true },
};

export const Bare: Story = {
  name: 'bare (size="md", no label)',
  render: () => (
    <div className="flex items-center gap-3">
      <StatusDot status="open" size="md" />
      <StatusDot status="busy" size="md" />
      <StatusDot status="closed" size="md" />
      <StatusDot status="danger" size="md" />
    </div>
  ),
};

/** In context: the outlet strip under the header. */
export const OutletStrip: Story = {
  name: "in context: outlet strip",
  render: () => (
    <div className="grid justify-items-start gap-3 rounded-lg bg-surface-sunken p-4">
      <StatusDot status="open" label="Sector 57 — open till 11:30pm" />
      <StatusDot status="busy" label="Kitchen is busy — about 25 minutes" />
      <StatusDot status="live" label="Your order is on the tandoor" isPulsing />
    </div>
  ),
};

export const Sx: Story = {
  args: { label: "Open till 11:30pm", sx: { gap: 4, mt: 4 } },
};
