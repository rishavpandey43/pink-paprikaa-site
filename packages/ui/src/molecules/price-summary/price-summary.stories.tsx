import type { Meta, StoryObj } from "@storybook/react-vite";

import { PriceSummary } from "./price-summary";

const meta = {
  title: "Molecules/PriceSummary",
  component: PriceSummary,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Cart totals, checkout summaries and order receipts. Labels and amounts sit on two grid " +
          "tracks and the figures are set in Space Mono, so every rupee amount ends on the same " +
          "right edge with its digits lined up. It formats the money itself — never hand-write a " +
          "price string into it.",
      },
    },
  },
  args: {
    total: 1239,
    lines: [
      { label: "Subtotal", amount: 1180 },
      { label: "GST (5%)", amount: 59 },
    ],
  },
} satisfies Meta<typeof PriceSummary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="max-w-100">
      <PriceSummary {...args} />
    </div>
  ),
};

/** A saving prints in mint with a leading minus. Pass the amount as a positive number. */
export const WithDiscount: Story = {
  args: {
    total: 1139,
    note: "Inclusive of all taxes.",
    lines: [
      { label: "Subtotal", amount: 1180 },
      { label: "GST (5%)", amount: 59 },
      { label: "First order", amount: 100, isDiscount: true },
    ],
  },
  render: (args) => (
    <div className="max-w-100">
      <PriceSummary {...args} />
    </div>
  ),
};

/** `isStrong` pulls one line up to heading weight — a running subtotal above the taxes. */
export const WithStrongLine: Story = {
  args: {
    total: 1239,
    lines: [
      { label: "Two thalis", amount: 560 },
      { label: "Paneer tikka masala", amount: 320 },
      { label: "Chilli garlic momos", amount: 300 },
      { label: "Items", amount: 1180, isStrong: true },
      { label: "GST (5%)", amount: 59 },
    ],
  },
  render: (args) => (
    <div className="max-w-100">
      <PriceSummary {...args} />
    </div>
  ),
};

/** The receipt shape — a renamed total and the statutory fine print under it. */
export const Receipt: Story = {
  args: {
    total: 1239,
    totalLabel: "Amount Paid",
    note: "Inclusive of all taxes. Paid by UPI.",
    lines: [
      { label: "Subtotal", amount: 1180 },
      { label: "GST (5%)", amount: 59 },
    ],
  },
  render: (args) => (
    <div className="max-w-100">
      <PriceSummary {...args} />
    </div>
  ),
};

/** On a flooded ink panel every ink tone lifts, and the saving takes the soft mint. */
export const OnInk: Story = {
  globals: { backgrounds: { value: "inverse" } },
  args: {
    tone: "inverse",
    total: 1139,
    note: "Inclusive of all taxes.",
    lines: [
      { label: "Subtotal", amount: 1180 },
      { label: "GST (5%)", amount: 59 },
      { label: "First order", amount: 100, isDiscount: true },
    ],
  },
  render: (args) => (
    <div className="max-w-100 rounded-5 bg-surface-inverse p-6">
      <PriceSummary {...args} />
    </div>
  ),
};

/** A single item, no lines at all — the smallest useful summary. */
export const TotalOnly: Story = {
  args: { total: 280, lines: [], note: "Inclusive of all taxes." },
  render: (args) => (
    <div className="max-w-100">
      <PriceSummary {...args} />
    </div>
  ),
};

/** At 360px the label column gives way first; the amount column never wraps. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
  args: {
    total: 1139,
    note: "Inclusive of all taxes.",
    lines: [
      { label: "Subtotal before the counter discount", amount: 1180 },
      { label: "GST (5%)", amount: 59 },
      { label: "First order", amount: 100, isDiscount: true },
    ],
  },
};
