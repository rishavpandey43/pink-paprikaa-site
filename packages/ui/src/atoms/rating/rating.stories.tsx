import type { Meta, StoryObj } from "@storybook/react-vite";

import { Rating } from "./rating";

const meta = {
  title: "Atoms/Rating",
  component: Rating,
  args: { value: 4.6 },
  parameters: {
    docs: {
      description: {
        component:
          "The review score for outlet cards and social proof. Diamonds, not stars — each one a " +
          "rotated square carrying the brand symbol. A fractional score fills by real percentage, " +
          "clipped in screen space, so 4.3 fills exactly 30% of the fifth mark.",
      },
    },
  },
} satisfies Meta<typeof Rating>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Values: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Rating {...args} value={5} />
      <Rating {...args} value={4.6} />
      <Rating {...args} value={4.3} />
      <Rating {...args} value={2.5} />
      <Rating {...args} value={0} />
    </div>
  ),
};

/** 12 / 16 / 24px marks. Below 16 the embedded symbol thins out, so its opacity steps up. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Rating {...args} size="xs" value={4.3} />
      <Rating {...args} size="sm" value={4.3} />
      <Rating {...args} size="md" value={4.3} />
      <Rating {...args} size="lg" value={4.3} />
    </div>
  ),
};

/** `symbol` drops the diamond for the bare mark — the review-card and artwork treatment. */
export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Rating {...args} value={4.6} variant="diamond" />
      <Rating {...args} value={4.6} variant="symbol" />
      <Rating {...args} size="lg" value={5} variant="symbol" />
    </div>
  ),
};

/** Counts group the Indian way: 2,184 — never 2.1k, never a comma in the wrong place. */
export const WithCount: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Rating {...args} count={2184} value={4.6} />
      <Rating {...args} count={912} value={4.8} variant="symbol" />
      <Rating {...args} count={106} hasValueLabel={false} size="sm" value={4.4} />
    </div>
  ),
};

/** Half-point steps side by side, at the size the fill is easiest to read. */
export const PartialFill: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Rating {...args} size="lg" value={4.1} />
      <Rating {...args} size="lg" value={4.5} />
      <Rating {...args} size="lg" value={4.9} />
    </div>
  ),
};

/** Where it usually lands: under an outlet name, next to the count. */
export const OnAnOutletCard: Story = {
  parameters: { layout: "padded" },
  render: (args) => (
    <div className="flex max-w-96 flex-col gap-2 rounded-4 bg-surface-card p-4 shadow-elevation1">
      <p className="m-0 font-display text-h3 font-bold text-text-heading">
        Pink Paprikaa · Sector 57
      </p>
      <Rating {...args} count={2184} size="sm" value={4.6} />
      <p className="m-0 font-body text-caption text-text-muted">
        100% vegetarian kitchen · ₹180–₹320 for two
      </p>
    </div>
  ),
};
