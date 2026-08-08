import type { Meta, StoryObj } from "@storybook/react-vite";

import { Text } from "../text/text";
import { Divider } from "./divider";

const meta = {
  title: "Atoms/Divider",
  component: Divider,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The hairline that separates menu rows — reach for it instead of wrapping every row in " +
          "its own card. The `diamond` variant is the brand's section break.",
      },
    },
  },
} satisfies Meta<typeof Divider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-80">
      <Divider {...args} />
    </div>
  ),
};

export const Variants: Story = {
  render: (args) => (
    <div className="grid w-80 gap-8">
      <Divider {...args} />
      <Divider {...args} label="Also Try" />
      <Divider {...args} variant="diamond" />
    </div>
  ),
};

/** On a flooded pink panel the rule, the label and the mark all flip to white. */
export const OnBrand: Story = {
  globals: { backgrounds: { value: "brand" } },
  render: (args) => (
    <div className="grid w-80 gap-8 rounded-4 bg-surface-brand p-8">
      <Divider {...args} on="brand" />
      <Divider {...args} label="Company" on="brand" />
      <Divider {...args} on="brand" variant="diamond" />
    </div>
  ),
};

/** How it actually reads: menu rows separated by a rule, not by cards. */
export const BetweenMenuRows: Story = {
  render: (args) => (
    <div className="w-80">
      {[
        { name: "Paneer Tikka Masala", price: "₹280" },
        { name: "Veg Steamed Momos", price: "₹180" },
        { name: "Masala Cold Brew", price: "₹200" },
      ].map((dish, index) => (
        <div key={dish.name}>
          {index > 0 ? <Divider {...args} /> : null}
          <div className="flex min-w-0 items-baseline justify-between gap-4 py-4">
            <Text className="min-w-0" variant="subtitle1">
              {dish.name}
            </Text>
            <Text tone="brand" variant="subtitle1">
              {dish.price}
            </Text>
          </div>
        </div>
      ))}
      <Divider {...args} className="my-8" variant="diamond" />
      <Text align="center" tone="muted" variant="caption">
        100% vegetarian kitchen
      </Text>
    </div>
  ),
};
