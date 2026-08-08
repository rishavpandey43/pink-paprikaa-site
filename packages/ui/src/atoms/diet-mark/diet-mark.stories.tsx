import type { Meta, StoryObj } from "@storybook/react-vite";

import { Text } from "../text/text";
import { DietMark } from "./diet-mark";

const meta = {
  title: "Atoms/DietMark",
  component: DietMark,
  parameters: {
    docs: {
      description: {
        component:
          "The statutory Indian vegetarian mark, carried by every menu item on every surface. " +
          "Pink Paprikaa runs a 100% vegetarian kitchen, so only the green square-and-dot and the " +
          "turmeric egg mark exist — there is no non-veg mark and none should be added.",
      },
    },
  },
} satisfies Meta<typeof DietMark>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Green square-and-dot for veg; turmeric for the few bakes that contain egg. */
export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-6">
      <span className="flex items-center gap-2">
        <DietMark {...args} variant="veg" />
        <Text variant="body2">Vegetarian</Text>
      </span>
      <span className="flex items-center gap-2">
        <DietMark {...args} variant="egg" />
        <Text variant="body2">Contains egg</Text>
      </span>
    </div>
  ),
};

/** 14 / 16 / 20px. The mark keeps its square-and-dot proportions at every step. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <DietMark {...args} size="xs" />
      <DietMark {...args} size="sm" />
      <DietMark {...args} size="md" />
      <DietMark {...args} size="lg" />
      <DietMark {...args} size="sm" variant="egg" />
      <DietMark {...args} size="md" variant="egg" />
      <DietMark {...args} size="lg" variant="egg" />
    </div>
  ),
};

/** How it actually appears: leading the dish name, at the size of the line it sits on. */
export const InContext: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <span className="flex items-center gap-2">
        <DietMark {...args} size="sm" />
        <Text as="span" variant="subtitle1">
          Paprikaa Chilli Paneer
        </Text>
      </span>
      <span className="flex items-center gap-2">
        <DietMark {...args} size="sm" variant="egg" />
        <Text as="span" variant="subtitle1">
          Chocolate Truffle Pastry
        </Text>
      </span>
    </div>
  ),
};
