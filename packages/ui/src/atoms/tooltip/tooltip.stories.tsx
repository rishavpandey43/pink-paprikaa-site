import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heart, Info, Milk, Share2 } from "lucide-react";
import type { ComponentProps } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Icon, type IconComponent } from "../icon/icon";
import { Tooltip } from "./tooltip";

interface TriggerProps extends ComponentProps<"button"> {
  icon: IconComponent;
  label: string;
}

/** Story-only stand-in for IconButton (an atom may not import another atom). Forwards every prop. */
function Trigger({ icon, label, ...props }: TriggerProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex size-11 items-center justify-center rounded-pill border border-border-default bg-surface-card text-text-heading hover:bg-pink-50"
      {...props}
    >
      <Icon icon={icon} size="md" />
    </button>
  );
}

const meta = {
  title: "Atoms/Tooltip",
  component: Tooltip,
  args: { label: "Contains dairy", side: "top", children: <Trigger icon={Milk} label="Dairy" /> },
  parameters: {
    docs: {
      description: {
        component:
          "Names an icon-only control or explains a mark; never holds essential copy. Ink pill, 12.5px, no arrow, 140ms fade; max ~5 words, no full stop. Opens on hover and on keyboard focus, closes on Escape, and becomes the trigger's accessible description. The child must forward props and ref to a focusable element — Button, IconButton or a native button. Client component (Radix Tooltip, provider included).",
      },
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvas, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Dairy" });

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await expect(await page.findByRole("tooltip")).toHaveTextContent("Contains dairy");
    await expect(trigger).toHaveAccessibleDescription("Contains dairy");

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("tooltip")).not.toBeInTheDocument());

    await userEvent.hover(trigger);
    await expect(await page.findByRole("tooltip")).toHaveTextContent("Contains dairy");
  },
};

const SIDES = [
  { side: "top", label: "Contains dairy", name: "Dairy", icon: Milk },
  { side: "bottom", label: "Save for later", name: "Save", icon: Heart },
  { side: "left", label: "Share", name: "Share", icon: Share2 },
  { side: "right", label: "Ground this morning", name: "Info", icon: Info },
] as const;

export const Sides: Story = {
  name: "side",
  render: () => (
    <div className="flex flex-wrap items-center gap-8 p-16">
      {SIDES.map(({ side, label, name, icon }) => (
        <Tooltip key={side} label={label} side={side}>
          <Trigger icon={icon} label={name} />
        </Tooltip>
      ))}
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    for (const { side, name } of SIDES) {
      await userEvent.tab();
      await expect(canvas.getByRole("button", { name })).toHaveFocus();
      const tooltip = await page.findByRole("tooltip");
      await expect(tooltip).toHaveAttribute("data-side", side);
    }
  },
};

/** A hint past ~5 words wraps at a 224px cap instead of running off a 360px screen. */
export const LongHint: Story = {
  name: "long hint",
  args: {
    label: "Cooked to order, so it takes about twelve minutes",
    children: <Trigger icon={Info} label="Prep time" />,
  },
  play: async ({ canvas, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.hover(canvas.getByRole("button", { name: "Prep time" }));
    const tooltip = await page.findByRole("tooltip");
    await expect(tooltip.getBoundingClientRect().width).toBeLessThanOrEqual(224);
  },
};

export const OnAButton: Story = {
  name: "on a button",
  args: {
    label: "Pickup only for now",
    children: (
      <button
        type="button"
        className="inline-flex h-9 items-center rounded-pill border-2 border-border-brand px-4 font-display text-body-sm font-bold text-text-brand"
      >
        Delivery
      </button>
    ),
  },
};
