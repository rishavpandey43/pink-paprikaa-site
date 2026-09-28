import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { groundOf } from "../../lib/story-paint";
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

/**
 * The vertical markers on every field. On pink the reached diamonds turn white with a pink mark and
 * the ones to come fade to white at 25% (R89) — a pink diamond on the pink field would vanish.
 */
export const VerticalSurfaces: Story = {
  render: (args) => (
    <OnSurfaces>
      <StepTracker {...args} />
    </OnSurfaces>
  ),
  play: async ({ canvasElement }) => {
    const diamonds = [
      ...canvasElement.querySelectorAll('li > [aria-hidden="true"] > span:first-child'),
    ];
    // 3 steps on each of the 5 grounds.
    await expect(diamonds).toHaveLength(15);
    for (const diamond of diamonds) {
      const fill = getComputedStyle(diamond).backgroundColor;
      await expect(fill).not.toBe(groundOf(diamond));
      // The brand mark, and the check on a complete step, stand out from their own diamond.
      for (const glyph of [diamond.firstElementChild, diamond.nextElementSibling]) {
        if (glyph !== null) await expect(getComputedStyle(glyph).color).not.toBe(fill);
      }
    }
  },
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
