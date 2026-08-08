import type { Meta, StoryObj } from "@storybook/react-vite";

import { StepTracker } from "./step-tracker";

const ORDER_STEPS = [
  { label: "Order in", note: "The kitchen is on it." },
  { label: "On the tandoor", note: "Chilli paneer is charring." },
  { label: "Ready for pickup", note: "Counter 2, ask for Pink Paprikaa." },
];

const meta = {
  title: "Molecules/StepTracker",
  component: StepTracker,
  args: { steps: ORDER_STEPS, current: 1, label: "Order progress" },
  argTypes: {
    steps: { control: false },
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Order tracking and multi-step checkout. Vertical markers are brand diamonds that take " +
          "a check once the step is done; horizontal renders as a segmented bar. Step copy is " +
          "written in the brand's voice, never as system status text.",
      },
    },
  },
} satisfies Meta<typeof StepTracker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Nothing has started yet — every diamond stays grey. */
export const NotStarted: Story = { args: { current: -1 } };

/** The last step reached: everything behind it carries a check. */
export const Complete: Story = { args: { current: 2 } };

/** Checkout progress — a segmented bar with captions, notes dropped for want of room. */
export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
    current: 1,
    label: "Checkout progress",
    steps: ["Cart", "Details", "Pay", "Done"],
  },
};

/** On a brand-flooded panel the markers and the type invert to white, straight onto the fill. */
export const OnBrand: Story = {
  globals: { backgrounds: { value: "brand" } },
  args: { tone: "inverse", current: 1 },
  render: (args) => (
    <div className="rounded-4 bg-surface-brand p-8">
      <StepTracker {...args} />
    </div>
  ),
};

/** The horizontal bar on a brand-flooded panel — the checkout header shape. */
export const HorizontalOnBrand: Story = {
  globals: { backgrounds: { value: "brand" } },
  args: {
    orientation: "horizontal",
    tone: "inverse",
    current: 2,
    label: "Checkout progress",
    steps: ["Cart", "Details", "Pay", "Done"],
  },
  render: (args) => (
    <div className="rounded-4 bg-surface-brand p-8">
      <StepTracker {...args} />
    </div>
  ),
};

/** The smallest supported width — labels wrap, the diamonds hold their column. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
  render: (args) => (
    <div className="w-full max-w-80">
      <StepTracker {...args} />
    </div>
  ),
};
