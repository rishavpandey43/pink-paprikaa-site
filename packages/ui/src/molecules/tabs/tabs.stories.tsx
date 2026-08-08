import type { Meta, StoryObj } from "@storybook/react-vite";

import { Croissant, IceCreamCone, Soup } from "lucide-react";

import { Text } from "../../atoms/text/text";
import { type TabItem, Tabs } from "./tabs";

const ALL_DAY: TabItem = {
  value: "all-day",
  label: "All Day",
  content: (
    <Text tone="muted" variant="body2">
      Paneer tikka, dal makhani and the tandoori platter, 8am – 11:30pm.
    </Text>
  ),
};

const BREAKFAST: TabItem = {
  value: "breakfast",
  label: "Breakfast",
  content: (
    <Text tone="muted" variant="body2">
      Poha, chole bhature and filter coffee, until 11:30am. ₹90–₹180.
    </Text>
  ),
};

const BAR: TabItem = {
  value: "bar",
  label: "Bar",
  content: (
    <Text tone="muted" variant="body2">
      Cold-pressed juices, masala soda and the house lemon iced tea.
    </Text>
  ),
};

const SWEETS: TabItem = {
  value: "sweets",
  label: "Sweets",
  content: (
    <Text tone="muted" variant="body2">
      Gulab jamun, rasmalai and the daily halwa, made in-house.
    </Text>
  ),
};

const SECTIONS: TabItem[] = [ALL_DAY, BREAKFAST, BAR, SWEETS];

const meta = {
  title: "Molecules/Tabs",
  component: Tabs,
  args: { items: SECTIONS, label: "Menu sections" },
  argTypes: {
    items: { control: false },
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Underline tabs for switching sections inside one page — menu courses, outlet " +
          "details, a careers listing. For filtering a list reach for `Tag` pills instead; for " +
          "app-level navigation use the tab bar. Keyboard arrows, roving focus and the panel " +
          "wiring come from Radix.",
      },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Two sections is the smallest set worth a tab row — below that, use a heading. */
export const TwoSections: Story = {
  args: { items: SECTIONS.slice(0, 2), label: "Feed sections" },
};

export const WithIcons: Story = {
  args: {
    items: [
      { ...ALL_DAY, icon: Soup },
      { ...BREAKFAST, icon: Croissant },
      { ...SWEETS, icon: IceCreamCone },
    ],
  },
};

/** Equal shares across the row — for two or three short sections inside a card. */
export const FullWidth: Story = {
  args: { isFullWidth: true, items: SECTIONS.slice(0, 3) },
};

/** A section that is off today stays visible but inert, so the row does not change shape. */
export const WithDisabledSection: Story = {
  args: {
    items: [ALL_DAY, BREAKFAST, { value: "bar", label: "Bar", isDisabled: true, content: null }],
  },
};

/** The smallest supported width — the row scrolls sideways rather than wrapping. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
  render: (args) => (
    <div className="w-full max-w-80">
      <Tabs {...args} />
    </div>
  ),
};
