import type { Meta, StoryObj } from "@storybook/react-vite";

import { Building2, TrendingDown } from "lucide-react";
import { expect, fn } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { OnSurfaces } from "../../lib/story-surfaces";
import { Alert } from "./alert";

const meta = {
  title: "Molecules/Alert",
  component: Alert,
  args: {
    tone: "warning",
    title: "Kitchen is busy",
    children: "Pickup is running 25 minutes today.",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Persistent inline message — kitchen delays, closed outlets, payment problems, calculator nudges. Soft tint fill with a matching **full** 1px border, never a coloured left border only. Tones: info, success, warning, danger (announced as an alert), brand, and neutral (the handoff's quiet hint). `action` takes one small Button; `onDismiss` adds a dismiss button. An Alert is a light island: on a pink or ink field it stays a tinted panel with light-skinned actions. Use Toast for transient confirmations instead.",
      },
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "tone" — info and success. */
export const InfoAndSuccess: Story = {
  render: () => (
    <div className="grid gap-3">
      <Alert tone="info" title="Pickup only">
        Delivery starts in 2027.
      </Alert>
      <Alert tone="success" title="Order confirmed">
        Kitchen has it. Counter 2.
      </Alert>
    </div>
  ),
};

/** Card row "warning danger". */
export const WarningAndDanger: Story = {
  render: () => (
    <div className="grid gap-3">
      <Alert tone="warning" title="Kitchen is busy">
        Pickup is running 25 minutes today.
      </Alert>
      <Alert tone="danger" title="That card didn't go through">
        Try another card or pay by UPI.
      </Alert>
    </div>
  ),
};

/** Card row "brand + action". */
export const BrandWithAction: Story = {
  args: {
    tone: "brand",
    title: "New in Sector 57",
    children: "Doors open Friday, 8am.",
    action: <Button size="sm">See the Menu</Button>,
  },
};

/** Card row "dismissible". */
export const Dismissible: Story = {
  args: {
    tone: "info",
    title: undefined,
    children: "We now take UPI at every counter.",
    onDismiss: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Dismiss" }));
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
  },
};

/** Handoff Plan calculator nudge — `tone="brand"`, own glyph, no title. */
export const Nudge: Story = {
  args: {
    tone: "brand",
    title: undefined,
    icon: TrendingDown,
    children: "Add 2 more people and every meal drops to ₹120.",
  },
};

/** Handoff Plan calculator PG hint — `tone="neutral"`. */
export const Neutral: Story = {
  args: {
    tone: "neutral",
    title: undefined,
    icon: Building2,
    children: "Ordering for a PG, hostel or office of 20+? Talk to us about group pricing.",
  },
};

/** Dev parity: 360px, the floor — title, message and dismiss wrap; the glyphs hold their size. */
export const Narrow: Story = {
  args: {
    tone: "danger",
    title: "That card didn't go through",
    children: "Try another card or pay by UPI at the counter.",
    onDismiss: fn(),
  },
  decorators: [
    (Story) => (
      <div className="max-w-90">
        <Story />
      </div>
    ),
  ],
};

/** Handoff Dawat calculator warning on the ink quote panel — a light island on every surface. */
export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  args: { title: undefined, children: "Full setup and service starts at 50 guests." },
  render: (args) => (
    <OnSurfaces>
      <Alert {...args} />
    </OnSurfaces>
  ),
};
