import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { PriceSummary } from "./price-summary";

const SUBTOTAL_AND_GST = [
  { label: "Subtotal", amount: 1180 },
  { label: "GST (5%)", amount: 59 },
];

const meta = {
  title: "Molecules/PriceSummary",
  component: PriceSummary,
  args: { lines: SUBTOTAL_AND_GST, total: 1239 },
  parameters: {
    docs: {
      description: {
        component:
          "Cart totals, checkout summary and order receipts, as a definition list. Never hand-format a rupee amount — this component and PriceTag are the only correct sources: `₹` with no space, Indian grouping, discounts with a true minus in mint. On an ink or pink field it follows the surface (no `tone` prop): every line turns light and the discount turns white, the minus carrying its meaning.",
      },
    },
  },
} satisfies Meta<typeof PriceSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "simple". */
export const Playground: Story = {};

/** Card row "discount". */
export const WithDiscount: Story = {
  args: {
    total: 1139,
    note: "Inclusive of all taxes.",
    lines: [...SUBTOTAL_AND_GST, { label: "First order", amount: 100, isDiscount: true }],
  },
};

/** Card row "inverse" — on an ink field. */
export const OnInk: Story = {
  render: (args) => (
    <div data-surface="ink" className="rounded-lg bg-surface-inverse p-6">
      <PriceSummary {...args} />
    </div>
  ),
};

export const Surfaces: Story = {
  args: {
    total: 1139,
    lines: [...SUBTOTAL_AND_GST, { label: "First order", amount: 100, isDiscount: true }],
  },
  render: (args) => (
    <OnSurfaces>
      <PriceSummary {...args} className="w-full" />
    </OnSurfaces>
  ),
};

/** Dev parity: `isStrong` pulls a running subtotal up to heading weight above the taxes. */
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
};

/** Dev parity: the receipt shape — a renamed total and the fine print under it. */
export const Receipt: Story = {
  args: { totalLabel: "Amount paid", note: "Inclusive of all taxes. Paid by UPI." },
};

/** Dev parity: a total with no lines — the smallest useful summary. */
export const TotalOnly: Story = {
  args: { lines: [], total: 280, note: "Inclusive of all taxes." },
};

/** Dev parity: at 360px the label gives way first; the amount never wraps. */
export const Narrow: Story = {
  args: {
    total: 1139,
    lines: [
      { label: "Subtotal before the counter discount", amount: 1180 },
      { label: "GST (5%)", amount: 59 },
      { label: "First order", amount: 100, isDiscount: true },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-80 max-w-full">
        <Story />
      </div>
    ),
  ],
};
