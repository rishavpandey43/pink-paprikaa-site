import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { StepTracker, type TrackerStep } from "./step-tracker";

const ORDER: TrackerStep[] = [
  { label: "Order in", note: "Kitchen's on it." },
  { label: "On the tandoor", note: "Chilli paneer is charring." },
  { label: "Ready for pickup", note: "Counter 2, ask for Paprikaa." },
];

const CHECKOUT: TrackerStep[] = [
  { label: "Cart" },
  { label: "Details" },
  { label: "Pay" },
  { label: "Done" },
];

const meta = {
  title: "Molecules/StepTracker",
  component: StepTracker,
  args: { steps: ORDER, current: 1 },
  parameters: {
    docs: {
      description: {
        component:
          'Order tracking and multi-step checkout. Vertical markers are brand diamonds with a check when complete; horizontal renders as a segmented bar. The current step carries `aria-current="step"`. Step copy is the brand voice, not system status text. On a pink or ink field it follows the surface — the bar turns white — so there is no `tone` prop.',
      },
    },
  },
} satisfies Meta<typeof StepTracker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "vertical". */
export const Playground: Story = {};

/** Card row "horizontal". */
export const Horizontal: Story = {
  args: { steps: CHECKOUT, current: 1, orientation: "horizontal" },
};

/** Card row "inverse" — horizontal on a pink field. */
export const OnBrand: Story = {
  args: { steps: CHECKOUT, current: 2, orientation: "horizontal" },
  render: (args) => (
    <div data-surface="brand" className="rounded-lg bg-surface-brand p-6">
      <StepTracker {...args} />
    </div>
  ),
};

/** Every step complete. */
export const Complete: Story = { args: { current: 3 } };

export const Surfaces: Story = {
  args: { steps: CHECKOUT, current: 2, orientation: "horizontal" },
  render: (args) => (
    <OnSurfaces>
      <StepTracker {...args} className="w-full" />
    </OnSurfaces>
  ),
};

/** Dev parity: nothing has started yet — every diamond stays grey. */
export const NotStarted: Story = { args: { current: -1 } };

/** Dev parity: the vertical markers on every field — filled diamonds keep their own colours. */
export const VerticalSurfaces: Story = {
  render: (args) => (
    <OnSurfaces>
      <StepTracker {...args} />
    </OnSurfaces>
  ),
};

/** Dev parity: the smallest supported width — labels wrap, the diamonds hold their column. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-full max-w-80">
        <Story />
      </div>
    ),
  ],
};
