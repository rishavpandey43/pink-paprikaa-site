import type { Meta, StoryObj } from "@storybook/react-vite";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import { expect } from "storybook/test";

import { SpeedDial, type SpeedDialAction, type SpeedDialProps } from "./speed-dial";

const ACTIONS: SpeedDialAction[] = [
  { icon: Phone, label: "Call", href: "tel:+911244000000" },
  { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/911244000000", target: "_blank" },
  {
    icon: MapPin,
    label: "Directions",
    href: "https://maps.google.com/?q=Pink+Paprikaa+Gurgaon",
    target: "_blank",
  },
];

const meta = {
  title: "Molecules/SpeedDial",
  component: SpeedDial,
  args: { label: "Contact us", actions: ACTIONS },
  parameters: {
    docs: {
      story: { inline: false, height: "340px" },
      description: {
        component:
          "A floating trigger that fans out a few related actions: call, WhatsApp, directions. The trigger is a Fab (`aria-expanded`, `aria-controls`); each action is a link or a button with a visible label chip and a screen-reader name. Arrow keys move along the dial's axis, Escape closes it and returns focus to the trigger, and a press outside closes it. With one action use a Fab. `position` pins it to a viewport corner above the mobile action dock.",
      },
    },
  },
} satisfies Meta<typeof SpeedDial>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  decorators: [
    (Story) => (
      <div className="flex min-h-72 items-end justify-end">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Contact us" });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("link", { name: "Call" })).toBeVisible();
    await userEvent.keyboard("{ArrowUp}");
    await expect(canvas.getByRole("link", { name: "Call" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toHaveFocus();
  },
};

/** The four directions, each open. */
export const Directions: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-x-24 gap-y-32 p-24">
      {(["up", "down", "left", "right"] as const).map((direction) => (
        <div key={direction} className="flex items-center justify-center">
          <SpeedDial
            {...args}
            label={`Contact us (${direction})`}
            direction={direction}
            defaultOpen
          />
        </div>
      ))}
    </div>
  ),
  parameters: { docs: { story: { inline: false, height: "560px" } } },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("button", { name: /^Contact us/ })).toHaveLength(4);
  },
};

function ControlledDial(args: SpeedDialProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex min-h-72 flex-col items-start gap-3">
      <p className="text-body-sm text-text-muted">
        State: <output>{isOpen ? "open" : "closed"}</output>
      </p>
      <SpeedDial {...args} open={isOpen} onOpenChange={setIsOpen} />
    </div>
  );
}

export const Controlled: Story = {
  render: (args) => <ControlledDial {...args} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Contact us" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("open");
  },
};

/** Pinned bottom-end on a phone-width viewport: clear of the edge and of the action dock. */
export const Mobile360: Story = {
  globals: { viewport: { value: "floor360", isRotated: false } },
  parameters: { layout: "fullscreen" },
  args: { position: "bottom-end", defaultOpen: true },
  play: async ({ canvas }) => {
    for (const link of canvas.getAllByRole("link")) {
      const rect = link.getBoundingClientRect();
      await expect(rect.left).toBeGreaterThanOrEqual(0);
      await expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
    }
  },
};
