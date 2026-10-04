import type { Meta, StoryObj } from "@storybook/react-vite";

import { Info } from "lucide-react";
import { useState } from "react";
import { expect, screen, waitFor } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { IconButton } from "../../atoms/icon-button/icon-button";
import { OnSurfaces } from "../../lib/story-surfaces";
import { Popover } from "./popover";

const THALI = "Dal, sabzi, 3 rotis, rice, raita.";

const meta = {
  title: "Molecules/Popover",
  component: Popover,
  args: {
    trigger: <Button variant="secondary">What&apos;s in the thali?</Button>,
    title: "Thali",
    children: THALI,
  },
  parameters: {
    docs: {
      story: { inline: false, height: "280px" },
      description: {
        component:
          "A small panel anchored to a trigger: what is in the thali, why a charge applies. Not modal: the page stays usable, Escape and an outside click close it, and focus returns to the trigger. It flips and shifts to stay inside the viewport (16px padding). For a decision that must be made use Dialog; for a list of actions use Menu.",
      },
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "What's in the thali?" });
    await userEvent.click(trigger);
    await expect(await screen.findByRole("dialog", { name: "Thali" })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

/** The four sides, each open at once. */
export const Sides: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-x-48 gap-y-24 p-24">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Popover
          key={side}
          {...args}
          defaultOpen
          side={side}
          title={`Side ${side}`}
          trigger={<Button variant="secondary">{side}</Button>}
        />
      ))}
    </div>
  ),
  parameters: { docs: { story: { inline: false, height: "520px" } } },
};

export const WithTitle: Story = {
  args: { hasArrow: true, hasCloseButton: true },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "What's in the thali?" }));
    const dialog = await screen.findByRole("dialog", { name: "Thali" });
    await expect(dialog).toBeVisible();
    await userEvent.click(await screen.findByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  },
};

/** An Info IconButton beside a charge. */
export const InfoPopover: Story = {
  args: {
    trigger: <IconButton icon={Info} label="About the packaging charge" size="sm" />,
    title: "Packaging charge",
    children: "₹10 per order covers the compostable box and bag.",
    hasArrow: true,
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "About the packaging charge" }));
    await expect(await screen.findByRole("dialog", { name: "Packaging charge" })).toBeVisible();
  },
};

function ControlledPopover(args: Story["args"]) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="grid gap-3">
      <Button
        size="sm"
        onClick={() => {
          setIsOpen((current) => !current);
        }}
      >
        {isOpen ? "Hide from outside" : "Show from outside"}
      </Button>
      {args === undefined ? null : (
        <Popover {...args} trigger={args.trigger} open={isOpen} onOpenChange={setIsOpen}>
          {args.children}
        </Popover>
      )}
    </div>
  );
}

export const Controlled: Story = {
  render: (args) => <ControlledPopover {...args} />,
  play: async ({ userEvent }) => {
    await expect(await screen.findByRole("dialog", { name: "Thali" })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  },
};

export const OnSurfaces_: Story = {
  name: "OnSurfaces",
  render: (args) => (
    <OnSurfaces>
      <Popover {...args} trigger={<Button variant="secondary">Open</Button>} />
    </OnSurfaces>
  ),
  parameters: { docs: { story: { inline: false, height: "600px" } } },
};

/** The smallest supported viewport: the panel stays inside it, even from a trigger at the edge. */
export const Mobile360: Story = {
  args: { align: "end", side: "bottom", defaultOpen: true },
  globals: { viewport: { value: "floor360", isRotated: false } },
  decorators: [
    (Story) => (
      <div className="flex justify-end">
        <Story />
      </div>
    ),
  ],
  play: async () => {
    const dialog = await screen.findByRole("dialog", { name: "Thali" });
    const rect = dialog.getBoundingClientRect();
    await expect(rect.left).toBeGreaterThanOrEqual(0);
    await expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
  },
};
