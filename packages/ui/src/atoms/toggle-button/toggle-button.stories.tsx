import type { Meta, StoryObj } from "@storybook/react-vite";

import { LayoutGrid, Leaf } from "lucide-react";
import { expect } from "storybook/test";

import { ToggleButton } from "./toggle-button";

const meta = {
  title: "Atoms/ToggleButton",
  component: ToggleButton,
  args: { value: "veg", children: "Veg only" },
  parameters: {
    docs: {
      description: {
        component:
          "MUI's ToggleButton, on Radix `Toggle`: a pressable that holds on or off (`aria-pressed`). Standalone, `selected` / `defaultSelected` / `onSelectedChange` own the state. Inside a `ToggleButtonGroup` it becomes a group item and the group's `value` decides. An icon-only button must be given an `aria-label`.",
      },
    },
  },
} satisfies Meta<typeof ToggleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Standalone: Story = {
  args: { icon: Leaf },
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Veg only" });
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await userEvent.keyboard(" ");
    await expect(button).toHaveAttribute("aria-pressed", "false");
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <ToggleButton value="sm" size="sm" defaultSelected>
        Small
      </ToggleButton>
      <ToggleButton value="md" size="md" defaultSelected>
        Medium
      </ToggleButton>
      <ToggleButton value="lg" size="lg" defaultSelected>
        Large
      </ToggleButton>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <ToggleButton value="brand" color="brand" defaultSelected>
        Brand
      </ToggleButton>
      <ToggleButton value="neutral" color="neutral" defaultSelected>
        Neutral
      </ToggleButton>
      <ToggleButton value="off">Off</ToggleButton>
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <ToggleButton value="sm" size="sm" icon={LayoutGrid} aria-label="Grid view small" />
      <ToggleButton value="md" icon={LayoutGrid} aria-label="Grid view" defaultSelected />
      <ToggleButton value="lg" size="lg" icon={LayoutGrid} aria-label="Grid view large" />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Grid view" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <ToggleButton value="off" disabled>
        Off
      </ToggleButton>
      <ToggleButton value="on" disabled defaultSelected>
        On
      </ToggleButton>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Off" })).toBeDisabled();
  },
};
