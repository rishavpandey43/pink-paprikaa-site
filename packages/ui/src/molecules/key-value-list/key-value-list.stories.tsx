import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { OnSurfaces } from "../../lib/story-surfaces";
import { KeyValueList } from "./key-value-list";

/** PlanCalculator "Your box" for Classic (`rates.js` → homely.plates[1].box). */
const YOUR_BOX = [
  { key: "Dal", value: "1, from 8 dals incl. Rajma, Chole, Dal Makhani" },
  { key: "Sabji", value: "1, from 18 sabjis incl. Mix Veg, Kofta, Gatte" },
  { key: "Rice", value: "200g · jeera rice Tue & Wed" },
  { key: "Roti", value: "3 fresh tawa roti" },
  { key: "Salad", value: "Salad + chutney" },
  { key: "Raita", value: "3× a week, incl. biryani day" },
  { key: "Paneer", value: "Mon lunch · Wed dinner — restaurant-style" },
  { key: "Dessert", value: "Biryani day only" },
  {
    key: "Biryani",
    value: "Veg Dum Biryani, Fri lunch · Tue dinner — with Salan, Raita, Gulab Jamun",
  },
  { key: "Add-on", value: "Sweet Lassi (250ml)", isEmphasised: true },
];

const meta = {
  title: "Molecules/KeyValueList",
  component: KeyValueList,
  args: { items: YOUR_BOX, keyWidth: "sm", density: "compact" },
  decorators: [
    (Story) => (
      <div className="w-160 max-w-full">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Label/value rows as a `<dl>` — the calculator\'s "Your box", the catering booking rules, the customisation list, price lists and quote lines. `keyWidth` fixes a key column; without it key and value sit at either end of the row. `emphasis="key"` leads with the key; `isEmphasised` picks out a changed or added value. Semantic tokens only, so it reads on any surface.',
      },
    },
  },
} satisfies Meta<typeof KeyValueList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** PlanCalculator "Your box". */
export const YourBox: Story = {};

/** Catering "How to book" rules panel — strong keys on the ink section. */
export const BookingRules: Story = {
  args: {
    keyWidth: "md",
    density: "default",
    emphasis: "key",
    items: [
      {
        key: "Minimum",
        value: "15 guests for a Dawat · 50 pieces for snacks · 25 guests for setup and service",
      },
      { key: "Notice", value: "24 hours up to 50 guests · 48 hours above 50" },
      { key: "Advance", value: "50% to confirm the date, balance on delivery" },
      { key: "GST", value: "Prices exclude GST, charged at 5%" },
      { key: "Changes", value: "Menu and headcount free up to 24 hours before" },
      { key: "Trial Dawat", value: "Normal per-head rate, credited in full when you confirm" },
    ],
  },
  render: (args) => (
    // The handoff's padding steps down to 16px on a phone (`clamp(16px, …, 24px)`).
    <div data-surface="ink" className="rounded-xl bg-surface-inverse p-4 sm:p-6">
      <div className="rounded-xl bg-surface-card px-4 py-1 sm:px-6">
        <KeyValueList {...args} />
      </div>
    </div>
  ),
};

/**
 * BookingRules at 360px: the frame's padding steps down so the value column keeps at least 128px
 * beside the 120px key column (a word or two a line otherwise).
 */
export const BookingRulesAt360: Story = {
  ...BookingRules,
  globals: { viewport: { value: "floor360", isRotated: false } },
  play: async ({ canvasElement }) => {
    const values = [...canvasElement.querySelectorAll("dd")];
    await expect(values).toHaveLength(6);
    for (const value of values) {
      await expect(value.getBoundingClientRect().width).toBeGreaterThanOrEqual(128);
    }
    const page = document.documentElement;
    await expect(page.scrollWidth).toBeLessThanOrEqual(page.clientWidth);
  },
};

/** HomelyMeals "Make it yours" — split rows. */
export const Customisations: Story = {
  args: {
    keyWidth: undefined,
    density: "default",
    emphasis: "key",
    items: [
      { key: "Rice only, no roti", value: "Rice raised to 300g" },
      { key: "Roti only, no rice", value: "2 extra roti" },
      { key: "Less spicy, or no chilli", value: "Same food, cooked mild" },
      { key: "Skip a single meal", value: "No charge for that meal" },
      { key: "No onion, no garlic", value: `${formatRupees(30)} a meal · separate pan` },
    ],
  },
};

/** Catering "Upgrades, per head" — a price list. */
export const UpgradePrices: Story = {
  args: {
    keyWidth: undefined,
    density: "default",
    items: [
      { key: "Paneer gravy instead of Mix Veg", value: `+${formatRupees(25)}` },
      { key: "Dal Makhani instead of Dal Fry", value: `+${formatRupees(25)}` },
      { key: "Jeera Rice instead of Steamed Rice", value: `+${formatRupees(20)}` },
      { key: "Lachha Paratha in place of one roti", value: `+${formatRupees(25)}` },
      { key: "Gulab Jamun, 2 pc instead of 1", value: `+${formatRupees(15)}` },
    ],
  },
};

/** PlanCalculator quote lines on the brand panel (Classic launch price, Weekday plan). */
export const QuoteLines: Story = {
  args: {
    keyWidth: undefined,
    hasDividers: false,
    items: [
      { key: `${formatRupees(130)} × 24 meals`, value: formatRupees(3120) },
      { key: "Offer: free meals (1)", value: formatRupees(0) },
      { key: "GST 5%", value: formatRupees(156) },
      { key: "Meals delivered", value: "25" },
    ],
  },
  render: (args) => (
    <div data-surface="brand" className="rounded-xl bg-surface-brand p-6">
      <KeyValueList {...args} />
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: (args) => (
    <OnSurfaces>
      <div className="min-w-0 flex-1">
        <KeyValueList {...args} />
      </div>
    </OnSurfaces>
  ),
};
