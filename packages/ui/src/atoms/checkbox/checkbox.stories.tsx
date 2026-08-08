import type { Meta, StoryObj } from "@storybook/react-vite";

import { Checkbox } from "./checkbox";

// `meta` is annotated rather than `satisfies`-inferred: under pnpm's isolated node_modules,
// declaration emit for an inferred decorator type reaches for Storybook/Radix internals it
// cannot name from here (TS2883). The annotation keeps the emitted type nameable.
const meta: Meta<typeof Checkbox> = {
  title: "Atoms/Checkbox",
  component: Checkbox,
  args: { label: "Extra burnt chilli mayo" },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The multi-select choice — menu add-ons, dietary preferences, consent. Pass `price` " +
          "for an add-on and it right-aligns as `+₹40` in Poppins Bold. Reach for `Radio` when " +
          "exactly one option must be chosen.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-96">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

/** The price is part of the row's accessible name, so the cost is never colour-only. */
export const WithPrice: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Checkbox {...args} defaultChecked price={40} />
      <Checkbox {...args} label="Masala fries on the side" price={90} />
    </div>
  ),
};

export const WithDescription: Story = {
  args: {
    label: "Make it a meal",
    description: "Adds masala fries and a kulhad chai.",
    price: 120,
  },
};

/** Mixed is for a select-all row whose children are only partly chosen. */
export const States: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Checkbox {...args} label="Rest" />
      <Checkbox {...args} defaultChecked label="Checked" />
      <Checkbox {...args} checked="indeterminate" label="All add-ons" />
      <Checkbox {...args} hasError label="I agree to the terms" />
      <Checkbox {...args} description="Sold out today." disabled label="Truffle oil" />
    </div>
  ),
};

/** The real shape: an add-on list inside an item sheet, priced and totalled. */
export const AddOnList: Story = {
  render: () => (
    <fieldset className="flex flex-col gap-3 rounded-4 border border-border-subtle p-5">
      <legend className="px-1 font-display text-subtitle1 font-bold text-text-heading">
        Add to your order
      </legend>
      <Checkbox defaultChecked label="Extra burnt chilli mayo" price={40} />
      <Checkbox label="Masala fries on the side" price={90} />
      <Checkbox
        description="Adds masala fries and a kulhad chai."
        label="Make it a meal"
        price={120}
      />
      <Checkbox description="Sold out today." disabled label="Truffle oil" price={60} />
    </fieldset>
  ),
};
