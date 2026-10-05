import type { Meta, StoryObj } from "@storybook/react-vite";

import { Info } from "lucide-react";
import { useState } from "react";
import { expect, screen, waitFor } from "storybook/test";

import { DemoIconTrigger, DemoTrigger } from "../../lib/demo-triggers";
import { OnSurfaces } from "../../lib/story-surfaces";
import { Popover } from "./popover";

const THALI = "Dal, sabzi, 3 rotis, rice, raita.";

const meta = {
  title: "Atoms/Popover",
  component: Popover,
  args: {
    trigger: <DemoTrigger>What&apos;s in the thali?</DemoTrigger>,
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
          trigger={<DemoTrigger>{side}</DemoTrigger>}
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
    trigger: <DemoIconTrigger icon={Info} label="About the packaging charge" />,
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
      <DemoTrigger
        onClick={() => {
          setIsOpen((current) => !current);
        }}
      >
        {isOpen ? "Hide from outside" : "Show from outside"}
      </DemoTrigger>
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
      <Popover {...args} trigger={<DemoTrigger>Open</DemoTrigger>} />
    </OnSurfaces>
  ),
  parameters: { docs: { story: { inline: false, height: "600px" } } },
};

/** The smallest supported viewport: the panel stays inside it, even from a trigger at the edge. */
export const Mobile360: Story = {
  args: { align: "end", side: "bottom", defaultOpen: true, sheet: false },
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

/** Card row: inline sheet. */
export const Sheet: Story = {
  args: {
    inline: true,
    sheet: true,
    title: "How spicy?",
    children: "Mild · Medium · Hot",
    trigger: <span />,
  },
  play: async () => {
    await expect(screen.getByText("How spicy?")).toBeVisible();
    await expect(document.querySelector(".max-h-menu-sheet")).not.toBeNull();
  },
};

/** Live sheet at 360. */
export const Sheet360: Story = {
  args: { sheet: true, defaultOpen: true, title: "Thali" },
  globals: { viewport: { value: "floor360", isRotated: false } },
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: "color-contrast", enabled: false },
          { id: "scrollable-region-focusable", enabled: false },
        ],
      },
    },
  },
  play: async () => {
    await waitFor(() => expect(screen.getByText("Thali")).toBeVisible());
    await expect(document.querySelector("[class*=animate-sheet-in]")).not.toBeNull();
    await expect(document.querySelector(".max-h-menu-sheet")).not.toBeNull();
  },
};

/** Floating panel at 641 (not a sheet). */
export const Floating641: Story = {
  args: { sheet: false, defaultOpen: true },
  parameters: { viewport: { width: 641, height: 800 } },
  play: async () => {
    await expect(await screen.findByRole("dialog", { name: "Thali" })).toBeVisible();
    await expect(document.querySelector("[class*=animate-pop-in]")).not.toBeNull();
    await expect(document.querySelector(".animate-sheet-in")).toBeNull();
  },
};
