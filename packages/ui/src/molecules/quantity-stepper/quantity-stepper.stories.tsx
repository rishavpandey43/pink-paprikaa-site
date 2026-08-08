import type { Meta, StoryObj } from "@storybook/react-vite";

import { QuantityStepper } from "./quantity-stepper";

const meta = {
  title: "Molecules/QuantityStepper",
  component: QuantityStepper,
  args: { defaultValue: 2 },
  parameters: {
    docs: {
      description: {
        component:
          "The minus/plus count used in cart rows, on item detail and beside add-ons. Use " +
          "`min={0}` where reaching zero removes the line item and `min={1}` where it must not. " +
          "Name the dish in `label` wherever a page shows more than one stepper.",
      },
    },
  },
} satisfies Meta<typeof QuantityStepper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 36 / 44px — `md` clears the 44px hit-target floor, `sm` is for dense desktop cart rows. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <QuantityStepper {...args} size="md" />
      <QuantityStepper {...args} size="sm" />
    </div>
  ),
};

/** Both buttons stop at their end of the range and grey out there — never fade. */
export const AtTheEndsOfTheRange: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <QuantityStepper {...args} label="Paneer Tikka quantity" min={1} value={1} />
      <QuantityStepper {...args} label="Gulab Jamun quantity" min={0} value={0} />
      <QuantityStepper {...args} label="Masala Chai quantity" max={5} value={5} />
    </div>
  ),
};

/** In a cart row — the stepper holds its width while the dish name takes the rest. */
export const InACartRow: Story = {
  parameters: { layout: "padded" },
  render: (args) => (
    <div className="flex w-full max-w-md items-center gap-4 rounded-4 bg-surface-card p-4">
      <div className="flex min-w-0 flex-col gap-0-5">
        <span className="font-display text-body1 font-bold text-text-heading">
          Paneer Butter Masala
        </span>
        <span className="font-body text-body2 text-text-muted">Medium · ₹280</span>
      </div>
      <div className="ml-auto">
        <QuantityStepper {...args} label="Paneer Butter Masala quantity" min={1} />
      </div>
    </div>
  ),
};
