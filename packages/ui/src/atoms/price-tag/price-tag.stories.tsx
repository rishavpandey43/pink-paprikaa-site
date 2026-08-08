import type { Meta, StoryObj } from "@storybook/react-vite";

import { PriceTag } from "./price-tag";

const meta = {
  title: "Atoms/PriceTag",
  component: PriceTag,
  args: { amount: 280 },
  parameters: {
    docs: {
      description: {
        component:
          "The only correct way to print a price: rupee sign with no space, Indian digit " +
          "grouping, no decimals on whole rupees, en-dash ranges, and a struck original when " +
          "something is discounted. Never hand-write a price string.",
      },
    },
  },
} satisfies Meta<typeof PriceTag>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Whole rupees never carry decimals, and thousands group the Indian way. */
export const Amounts: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-baseline gap-6">
      <PriceTag {...args} amount={90} />
      <PriceTag {...args} amount={280} />
      <PriceTag {...args} amount={1240} />
      <PriceTag {...args} amount={125000} />
    </div>
  ),
};

/** A discount keeps both numbers on one baseline — live price first, original struck through. */
export const Discounted: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-baseline gap-6">
      <PriceTag {...args} amount={240} was={320} />
      <PriceTag {...args} amount={149} size="lg" was={199} />
    </div>
  ),
};

/** A range is an en dash, never a hyphen and never the word "to". */
export const Range: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-baseline gap-6">
      <PriceTag {...args} amount={180} size="sm" to={320} />
      <PriceTag {...args} amount={180} to={320} />
      <PriceTag {...args} amount={180} size="lg" to={320} />
    </div>
  ),
};

/** 14 / 20 / 25px — menu row, card, item page. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-baseline gap-6">
      <PriceTag {...args} size="sm" />
      <PriceTag {...args} size="md" />
      <PriceTag {...args} size="lg" />
    </div>
  ),
};

export const Tones: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-baseline gap-6">
      <PriceTag {...args} tone="ink" was={320} />
      <PriceTag {...args} tone="brand" was={320} />
    </div>
  ),
};

/** On a flooded pink panel the ink tones vanish, so the price flips to white. */
export const OnBrand: Story = {
  globals: { backgrounds: { value: "brand" } },
  render: (args) => (
    <div className="flex flex-wrap items-baseline gap-6 rounded-4 bg-surface-brand p-8">
      <PriceTag {...args} size="lg" tone="inverse" />
      <PriceTag {...args} amount={240} tone="inverse" was={320} />
    </div>
  ),
};
