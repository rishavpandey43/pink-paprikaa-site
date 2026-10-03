import type { Meta, StoryObj } from "@storybook/react-vite";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { Button } from "../../atoms/button/button";
import { StickyActionBar } from "./sticky-action-bar";

/** Classic, launch price, Weekday plan, lunch: 24 × ₹130 + 5% GST. */
const PLAN_TOTAL = 24 * 130 + Math.round(24 * 130 * 0.05);
/** Signature Dawat for 30 guests + 5% GST. */
const DAWAT_TOTAL = 30 * 199 + Math.round(30 * 199 * 0.05);

const meta = {
  title: "Molecules/StickyActionBar",
  component: StickyActionBar,
  args: {
    amount: formatRupees(PLAN_TOTAL),
    caption: `${formatRupees(130)}/meal · Classic · Weekday plan · Lunch`,
    action: <Button size="md">Send plan</Button>,
    hideFrom: "never",
  },
  decorators: [
    (Story) => (
      <div className="w-90 max-w-full">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'The calculators\' ink pill: the running total, one caption line and the send action. `position: sticky` at `--spacing-dock-clearance` above the viewport bottom, so the mobile ActionDock never covers it. Hidden from `lg` up (`hideFrom="lg"`, default), where the quote panel sits beside the form.',
      },
    },
  },
} satisfies Meta<typeof StickyActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** PlanCalculator bar. */
export const PlanCalculator: Story = {};

/** DawatCalculator bar. */
export const DawatCalculator: Story = {
  args: {
    amount: formatRupees(DAWAT_TOTAL),
    caption: `${formatRupees(DAWAT_TOTAL / 30)}/head · 30 guests`,
    action: <Button size="md">Check date</Button>,
  },
};

/** The bar sticks at the dock clearance while the form scrolls under it. */
export const InAScrollingPage: Story = {
  render: (args) => (
    <div className="h-100 overflow-y-auto rounded-lg border border-border-subtle">
      <div className="grid h-250 content-start gap-3 p-4">
        {[
          "1. Your plate",
          "2. Which meals",
          "3. How many meals",
          "4. People at one address",
          "5. Make it yours",
        ].map((step) => (
          <p key={step} className="m-0 font-display text-body font-bold text-text-heading">
            {step}
          </p>
        ))}
      </div>
      <StickyActionBar {...args} />
    </div>
  ),
};
