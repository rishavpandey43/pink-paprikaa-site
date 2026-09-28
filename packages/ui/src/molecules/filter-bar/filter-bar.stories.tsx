import type { Meta, StoryObj } from "@storybook/react-vite";

import { Clock, Flame, Leaf, Search } from "lucide-react";
import { expect } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { OnSurfaces } from "../../lib/story-surfaces";
import { FilterBar } from "./filter-bar";

const WEBSITE = [
  { value: "all", label: "All" },
  { value: "small-plates", label: "Small Plates" },
  { value: "all-day", label: "All Day" },
  { value: "chai-coffee", label: "Chai & Coffee" },
  { value: "sweets", label: "Sweets" },
];

const meta = {
  title: "Molecules/FilterBar",
  component: FilterBar,
  args: { label: "Menu category", options: WEBSITE, note: "100% Vegetarian", isWrapping: true },
  decorators: [
    (Story) => (
      <div className="w-full max-w-article">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Menu category rail on both the website and the app. Scrolls horizontally by default (the app pattern); pass `isWrapping` for the website. Exactly one option is selected at a time — pressing the chosen filter keeps it. Radix ToggleGroup items styled with the Tag skin; arrow keys move, Space/Enter choose.",
      },
    },
  },
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "wrap" — the website, with the statement badge. */
export const Wrap: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Sweets" }));
    await expect(canvas.getByRole("radio", { name: "Sweets" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    await userEvent.keyboard("{ArrowLeft} ");
    await expect(canvas.getByRole("radio", { name: "Chai & Coffee" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
  },
};

/** Card row "scroll" — the app rail, one line. */
export const Scroll: Story = {
  args: {
    isWrapping: false,
    note: undefined,
    options: [...WEBSITE, { value: "bar", label: "Bar" }],
  },
  decorators: [
    (Story) => (
      <div className="w-90">
        <Story />
      </div>
    ),
  ],
};

/** Card row "icons". */
export const Icons: Story = {
  args: {
    label: "Dietary and speed filters",
    note: undefined,
    defaultValue: "jain",
    options: [
      { value: "jain", label: "Jain", icon: Leaf },
      { value: "spicy", label: "Hot", icon: Flame },
      { value: "quick", label: "Under 15 min", icon: Clock },
    ],
  },
};

/** `trailing`: a control pinned to the end of the rail, never squeezed by it. */
export const WithTrailing: Story = {
  args: {
    trailing: (
      <Button size="sm" variant="ghost" icon={Search}>
        Search
      </Button>
    ),
  },
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: (args) => (
    <OnSurfaces>
      <div className="min-w-0 flex-1">
        <FilterBar {...args} />
      </div>
    </OnSurfaces>
  ),
};
