import type { Meta, StoryObj } from "@storybook/react-vite";

import { Clock, Leaf, Star, UtensilsCrossed } from "lucide-react";

import { StatBand, type StatBandItem } from "./stat-band";

const STATS: StatBandItem[] = [
  { value: "100%", label: "vegetarian kitchen" },
  { value: "7", label: "sections on the menu" },
  { value: "4.6", label: "average guest rating" },
];

const meta = {
  title: "Organisms/StatBand",
  component: StatBand,
  args: { stats: STATS },
  argTypes: { stats: { control: false } },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A proof band of big numbers, dropped between two content sections. Three or four " +
          "items — more reads as noise. Every number has to be one the kitchen can stand behind: " +
          "a guest who checks it and finds it wrong stops believing the rest of the page.",
      },
    },
  },
} satisfies Meta<typeof StatBand>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Pale pink, flooded pink and ink. Pick the one the sections either side are not already using. */
export const Tones: Story = {
  render: (args) => (
    <div>
      <StatBand {...args} tone="soft" />
      <StatBand {...args} tone="brand" />
      <StatBand {...args} tone="ink" />
    </div>
  ),
};

/** Glyphs go on every item or none — a half-set row reads as a rendering bug. */
export const WithIcons: Story = {
  args: {
    stats: [
      { value: "100%", label: "vegetarian kitchen", icon: Leaf },
      { value: "7", label: "sections on the menu", icon: UtensilsCrossed },
      { value: "4.6", label: "average guest rating", icon: Star },
    ],
  },
};

/** The sub line carries the detail behind a number that needs one. */
export const WithSubLines: Story = {
  args: {
    stats: [
      {
        value: "8am",
        label: "the counter opens",
        sub: "Breakfast and chai until the lunch menu starts",
        icon: Clock,
      },
      {
        value: "7",
        label: "sections on the menu",
        sub: "North Indian, Chinese, momos, chaat, sandwiches, drinks and desserts",
        icon: UtensilsCrossed,
      },
      {
        value: "4.6",
        label: "average guest rating",
        sub: "Across every ordering channel",
        icon: Star,
      },
    ],
  },
};

/** Four is the ceiling. Beyond it the row stops being a claim and becomes a table. */
export const FourAcross: Story = {
  args: {
    tone: "brand",
    stats: [
      { value: "100%", label: "vegetarian kitchen" },
      { value: "7", label: "sections on the menu" },
      { value: "4.6", label: "average guest rating" },
      { value: "₹200", label: "average spend a head" },
    ],
  },
};

/** At 360px the grid folds to one column and each number steps down with the fluid ramp. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
};
