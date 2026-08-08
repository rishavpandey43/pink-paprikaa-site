import type { Meta, StoryObj } from "@storybook/react-vite";

import { Clock, Flame, Leaf } from "lucide-react";
import { useState } from "react";

import { FilterBar, type FilterBarProps } from "./filter-bar";

const CATEGORIES = ["All", "Small Plates", "All Day", "Chai & Coffee", "Sweets"];

/**
 * The rail is controlled, so every story owns the selection. A named component rather than an
 * inline `render` arrow: hooks may only be called from a component.
 */
function ControlledFilterBar({ value: initialValue, ...props }: FilterBarProps) {
  const [value, setValue] = useState(initialValue ?? CATEGORIES[0]);
  return <FilterBar {...props} onChange={setValue} value={value} />;
}

const meta = {
  title: "Molecules/FilterBar",
  component: FilterBar,
  args: { options: CATEGORIES, value: "All" },
  argTypes: { trailing: { control: false } },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The menu category rail. Exactly one category is selected at a time. It scrolls on one " +
          "line by default — the app pattern — and wraps with `isWrapping` for the website, where " +
          "every category should be visible at once.",
      },
    },
  },
} satisfies Meta<typeof FilterBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <ControlledFilterBar {...args} />,
};

/** The website rail: every category visible at once, no hidden right edge. */
export const Wrapping: Story = {
  args: { isWrapping: true, note: "100% Vegetarian Kitchen" },
  render: (args) => <ControlledFilterBar {...args} />,
};

/** The app rail: one line tall on a phone, the overflow scrolled rather than wrapped. */
export const Scrolling: Story = {
  args: { options: [...CATEGORIES, "Breakfast", "Momos", "Sandwiches", "Desserts"] },
  render: (args) => (
    <div className="max-w-90">
      <ControlledFilterBar {...args} />
    </div>
  ),
};

/** Options can carry a glyph, and a value that is not the visible label. */
export const WithIcons: Story = {
  args: {
    isWrapping: true,
    options: [
      { value: "jain", label: "Jain", icon: Leaf },
      { value: "spicy", label: "Hot", icon: Flame },
      { value: "quick", label: "Under 15 Min", icon: Clock },
    ],
    value: "jain",
  },
  render: (args) => <ControlledFilterBar {...args} />,
};

/** The kitchen statement is a badge pinned after the pills — it is never a filter. */
export const WithStatement: Story = {
  args: { isWrapping: true, note: "100% Vegetarian Kitchen" },
  render: (args) => <ControlledFilterBar {...args} />,
};

/** A trailing control sits at the end of the rail and never gets squeezed. */
export const WithTrailingControl: Story = {
  args: {
    isWrapping: true,
    trailing: (
      <button className="font-body text-body2 text-text-link underline" type="button">
        Clear All
      </button>
    ),
  },
  render: (args) => <ControlledFilterBar {...args} />,
};

/** At 360px the rail scrolls; the pills keep their 38px height and never wrap mid-label. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
  args: { options: [...CATEGORIES, "Breakfast", "Momos"] },
  render: (args) => (
    <div className="w-full max-w-80">
      <ControlledFilterBar {...args} />
    </div>
  ),
};
