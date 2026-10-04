import type { Meta, StoryObj } from "@storybook/react-vite";

import { AlignCenter, AlignLeft, AlignRight, LayoutGrid, List } from "lucide-react";
import { useState } from "react";
import { expect } from "storybook/test";

import { ToggleButton } from "../../atoms/toggle-button/toggle-button";
import { OnSurfaces } from "../../lib/story-surfaces";
import { ToggleButtonGroup } from "./toggle-button-group";

const meta = {
  title: "Molecules/ToggleButtonGroup",
  component: ToggleButtonGroup,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "MUI's ToggleButtonGroup, on Radix ToggleGroup. `exclusive` holds one `value` or `null` (pressing the chosen button again clears it, unless `isValueRequired`); without it `value` is an array and each button toggles on its own. One tab stop, arrows move, Home/End jump, Space/Enter toggle. A toolbar control — view switcher, alignment, quick filters. For a submitted, labelled choice with a status and message, use ChipGroup.",
      },
    },
  },
} satisfies Meta<typeof ToggleButtonGroup>;

export default meta;
// Plain `StoryObj`: the props are a union (exclusive | multiple), which Storybook's args collapse.
type Story = StoryObj;

/** MUI "Exclusive selection": text alignment. */
export const Exclusive: Story = {
  render: () => {
    function Alignment() {
      const [alignment, setAlignment] = useState<string | null>("left");
      return (
        <div className="grid gap-2">
          <ToggleButtonGroup
            exclusive
            aria-label="Text alignment"
            value={alignment}
            onValueChange={setAlignment}
          >
            <ToggleButton value="left" icon={AlignLeft} aria-label="Align left" />
            <ToggleButton value="center" icon={AlignCenter} aria-label="Align center" />
            <ToggleButton value="right" icon={AlignRight} aria-label="Align right" />
          </ToggleButtonGroup>
          <p className="text-body-sm text-text-subtle">Aligned: {alignment ?? "nothing"}</p>
        </div>
      );
    }
    return <Alignment />;
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Align center" }));
    await expect(canvas.getByRole("radio", { name: "Align center" })).toBeChecked();
    await expect(canvas.getByText("Aligned: center")).toBeInTheDocument();
    // MUI default: pressing the chosen button again clears the value to null.
    await userEvent.click(canvas.getByRole("radio", { name: "Align center" }));
    await expect(canvas.getByText("Aligned: nothing")).toBeInTheDocument();
  },
};

/** MUI "Multiple selection": each button toggles on its own. */
export const Multiple: Story = {
  render: () => (
    <ToggleButtonGroup aria-label="Diet" defaultValue={["jain"]}>
      <ToggleButton value="jain">Jain</ToggleButton>
      <ToggleButton value="no-onion-garlic">No onion-garlic</ToggleButton>
      <ToggleButton value="gluten-free">Gluten-free</ToggleButton>
    </ToggleButtonGroup>
  ),
  play: async ({ canvas, userEvent }) => {
    // Joined: only the outer corners are round, and neighbours overlap by their shared border.
    const first = getComputedStyle(canvas.getByRole("button", { name: "Jain" }));
    const middle = getComputedStyle(canvas.getByRole("button", { name: "No onion-garlic" }));
    const last = getComputedStyle(canvas.getByRole("button", { name: "Gluten-free" }));
    await expect(first.borderStartStartRadius).not.toBe("0px");
    await expect(middle.borderRadius).toBe("0px");
    await expect(last.borderEndEndRadius).not.toBe("0px");
    await expect(middle.marginInlineStart).toBe("-1px");
    await userEvent.click(canvas.getByRole("button", { name: "Gluten-free" }));
    await expect(canvas.getByRole("button", { name: "Jain" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    await expect(canvas.getByRole("button", { name: "Gluten-free" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    await userEvent.click(canvas.getByRole("button", { name: "Jain" }));
    await expect(canvas.getByRole("button", { name: "Jain" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  },
};

/** MUI "Enforce value set": `isValueRequired` keeps one selected. */
export const EnforceValueSet: Story = {
  render: () => (
    <ToggleButtonGroup exclusive isValueRequired aria-label="Spice" defaultValue="regular">
      <ToggleButton value="less">Less spicy</ToggleButton>
      <ToggleButton value="regular">Regular</ToggleButton>
      <ToggleButton value="extra">Extra</ToggleButton>
    </ToggleButtonGroup>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Regular" }));
    await expect(canvas.getByRole("radio", { name: "Regular" })).toBeChecked();
    await userEvent.click(canvas.getByRole("radio", { name: "Extra" }));
    await expect(canvas.getByRole("radio", { name: "Extra" })).toBeChecked();
  },
};

/** The menu page's grid / list switch. */
export const ViewSwitcher: Story = {
  render: () => (
    <ToggleButtonGroup exclusive isValueRequired aria-label="View" defaultValue="grid">
      <ToggleButton value="grid" icon={LayoutGrid} aria-label="Grid view" />
      <ToggleButton value="list" icon={List} aria-label="List view" />
    </ToggleButtonGroup>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("radio", { name: "Grid view" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight} ");
    await expect(canvas.getByRole("radio", { name: "List view" })).toBeChecked();
  },
};

export const Vertical: Story = {
  render: () => (
    <ToggleButtonGroup exclusive orientation="vertical" aria-label="Align" defaultValue="left">
      <ToggleButton value="left" icon={AlignLeft} aria-label="Align left" />
      <ToggleButton value="center" icon={AlignCenter} aria-label="Align center" />
      <ToggleButton value="right" icon={AlignRight} aria-label="Align right" />
    </ToggleButtonGroup>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("radio", { name: "Align center" })).toHaveFocus();
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <ToggleButtonGroup
          key={size}
          exclusive
          size={size}
          aria-label={`Size ${size}`}
          defaultValue="a"
        >
          <ToggleButton value="a">Lunch</ToggleButton>
          <ToggleButton value="b">Dinner</ToggleButton>
        </ToggleButtonGroup>
      ))}
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      {(["brand", "neutral"] as const).map((color) => (
        <ToggleButtonGroup
          key={color}
          exclusive
          color={color}
          aria-label={`Color ${color}`}
          defaultValue="a"
        >
          <ToggleButton value="a">Lunch</ToggleButton>
          <ToggleButton value="b">Dinner</ToggleButton>
        </ToggleButtonGroup>
      ))}
    </div>
  ),
};

export const FullWidth: Story = {
  render: () => (
    <ToggleButtonGroup exclusive isFullWidth aria-label="Meal" defaultValue="lunch">
      <ToggleButton value="lunch">Lunch</ToggleButton>
      <ToggleButton value="dinner">Dinner</ToggleButton>
      <ToggleButton value="both">Both</ToggleButton>
    </ToggleButtonGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="grid justify-items-start gap-4">
      <ToggleButtonGroup exclusive disabled aria-label="Whole group" defaultValue="a">
        <ToggleButton value="a">Lunch</ToggleButton>
        <ToggleButton value="b">Dinner</ToggleButton>
      </ToggleButtonGroup>
      <ToggleButtonGroup exclusive aria-label="One button" defaultValue="a">
        <ToggleButton value="a">Lunch</ToggleButton>
        <ToggleButton value="b" disabled>
          Dinner
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  ),
  play: async ({ canvas }) => {
    for (const dinner of canvas.getAllByRole("radio", { name: "Dinner" })) {
      await expect(dinner).toBeDisabled();
    }
    await expect(canvas.getAllByRole("radio", { name: "Lunch" })[1]).toBeEnabled();
  },
};

export const OnSurfaces_: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces grounds={["page", "alt", "soft"]}>
      <ToggleButtonGroup exclusive aria-label="Meal" defaultValue="lunch">
        <ToggleButton value="lunch">Lunch</ToggleButton>
        <ToggleButton value="dinner">Dinner</ToggleButton>
      </ToggleButtonGroup>
      <ToggleButtonGroup exclusive color="neutral" aria-label="Meal neutral" defaultValue="lunch">
        <ToggleButton value="lunch">Lunch</ToggleButton>
        <ToggleButton value="dinner">Dinner</ToggleButton>
      </ToggleButtonGroup>
    </OnSurfaces>
  ),
};

/** The smallest supported viewport: a full-width three-button group fits. */
export const Mobile360: Story = {
  render: () => (
    <ToggleButtonGroup exclusive isFullWidth aria-label="Meal" defaultValue="lunch">
      <ToggleButton value="lunch">Lunch</ToggleButton>
      <ToggleButton value="dinner">Dinner</ToggleButton>
      <ToggleButton value="both">Both</ToggleButton>
    </ToggleButtonGroup>
  ),
  globals: { viewport: { value: "floor360", isRotated: false } },
  play: async ({ canvas }) => {
    const group = canvas.getByRole("radiogroup", { name: "Meal" });
    await expect(group.scrollWidth).toBeLessThanOrEqual(group.clientWidth);
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      document.documentElement.clientWidth
    );
  },
};
