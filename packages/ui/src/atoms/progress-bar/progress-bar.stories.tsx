import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProgressBar } from "./progress-bar";

const meta = {
  title: "Atoms/ProgressBar",
  component: ProgressBar,
  args: { value: 70, label: "Uploading your photo" },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Loyalty stamps and order progress. Segmented is the loyalty pattern, continuous is for " +
          "checkout steps and uploads. Pass a `label` or an `aria-label` — a bar with neither " +
          "reaches a screen reader unnamed.",
      },
    },
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The loyalty look: one stamp per visit, earned stamps filled. */
export const Segments: Story = {
  args: { segments: 6, value: 3, label: "Three more visits and chai is on us" },
};

/** Checkout steps and uploads fill continuously. */
export const Continuous: Story = {
  render: (args) => (
    <div className="flex max-w-96 flex-col gap-6">
      <ProgressBar {...args} label="Order placed" value={20} />
      <ProgressBar {...args} label="In the kitchen" value={55} />
      <ProgressBar {...args} label="Out for delivery" value={90} />
    </div>
  ),
};

export const Tones: Story = {
  render: (args) => (
    <div className="flex max-w-96 flex-col gap-6">
      <ProgressBar {...args} label="Brand" tone="brand" value={70} />
      <ProgressBar {...args} label="Mint, for a finished step" tone="mint" value={100} />
    </div>
  ),
};

/** On a flooded pink panel the pair inverts — white fill on a glass track. */
export const OnBrand: Story = {
  globals: { backgrounds: { value: "brand" } },
  render: (args) => (
    <div className="flex max-w-96 flex-col gap-6 rounded-4 bg-surface-brand p-8">
      <ProgressBar
        {...args}
        label="Four stamps in, two to go"
        segments={6}
        tone="inverse"
        value={4}
      />
      <ProgressBar {...args} label="Uploading your photo" tone="inverse" value={70} />
    </div>
  ),
};

/** 6 / 8 / 12px tracks. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex max-w-96 flex-col gap-6">
      <ProgressBar {...args} label="Small" size="sm" value={40} />
      <ProgressBar {...args} label="Medium" size="md" value={40} />
      <ProgressBar {...args} label="Large" size="lg" value={40} />
    </div>
  ),
};

/** The smallest supported width — six stamps still fit without wrapping. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
  render: (args) => (
    <div className="w-80">
      <ProgressBar {...args} label="Three more visits and chai is on us" segments={6} value={3} />
    </div>
  ),
};
