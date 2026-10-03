import type { Meta, StoryObj } from "@storybook/react-vite";

import { Clock, Leaf, Truck, UtensilsCrossed } from "lucide-react";

import { VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { StatBand, type StatBandItem } from "./stat-band";

const STATS: StatBandItem[] = [
  { value: "30", label: "dishes on the Classic plan" },
  { value: "3 km", label: "free delivery radius" },
  { value: "100%", label: "pure vegetarian kitchen" },
];

const meta = {
  title: "Organisms/StatBand",
  component: StatBand,
  args: { stats: STATS },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A proof band of big numbers between two content sections. Three or four real, verifiable numbers — never more. Auto-fits to one column on phones.",
      },
    },
  },
} satisfies Meta<typeof StatBand>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row: `surface="soft"` (default). */
export const Soft: Story = { args: { surface: "soft" } };

/** Card row: `surface="brand"`. */
export const Brand: Story = { args: { surface: "brand" } };

/** The third surface named on the card. */
export const Ink: Story = { args: { surface: "ink" } };

export const FourStats: Story = {
  args: { stats: [...STATS, { value: "8 km", label: "free catering delivery" }] },
};

/** Glyphs go on every stat or none — a half-set row reads as a rendering bug. */
export const WithIcons: Story = {
  args: {
    stats: [
      { value: "30", label: "dishes on the Classic plan", icon: UtensilsCrossed },
      { value: "3 km", label: "free delivery radius", icon: Truck },
      { value: "100%", label: "pure vegetarian kitchen", icon: Leaf },
    ],
  },
};

/** The sub-line carries the detail behind a number that needs one. */
export const WithSubLines: Story = {
  args: {
    stats: [
      {
        value: "8am",
        label: "the kitchen opens",
        sub: "Open till 11:30pm, every day",
        icon: Clock,
      },
      {
        value: "3 km",
        label: "free delivery radius",
        sub: "From MKM Market, Sector 57",
        icon: Truck,
      },
      {
        value: "100%",
        label: "pure vegetarian kitchen",
        sub: "No egg, no meat, ever",
        icon: Leaf,
      },
    ],
  },
};

export const Mobile: Story = { globals: VIEWPORT_360 };
export const Tablet: Story = { globals: VIEWPORT_768 };
export const Desktop: Story = { globals: VIEWPORT_1280 };
