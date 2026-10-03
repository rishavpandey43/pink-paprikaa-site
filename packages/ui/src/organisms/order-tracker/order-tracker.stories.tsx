import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import type { TrackerStep } from "../../molecules/step-tracker/step-tracker";

import { Badge } from "../../atoms/badge/badge";
import { Button } from "../../atoms/button/button";
import { ringClippers } from "../../lib/story-ring";
import { VIEWPORT_360 } from "../story-fixtures";
import { OrderTracker } from "./order-tracker";

/** The design system's brand-voice steps. */
const STEPS: TrackerStep[] = [
  { label: "Order in", note: "Kitchen's on it." },
  { label: "On the tandoor", note: "Chilli paneer is charring." },
  { label: "Ready for pickup", note: "Counter 2, ask for Paprikaa." },
];

const BACK_HOME = (
  <Button asChild variant="secondary" isFullWidth>
    <a href="#home">Back to Home</a>
  </Button>
);

const meta = {
  title: "Organisms/OrderTracker",
  component: OrderTracker,
  args: {
    steps: STEPS,
    current: 0,
    code: "PPK-4821",
    outlet: "Sector 57, Gurgaon",
    total: 1239,
    payment: "UPI",
    badge: <Badge tone="ink">Preparing</Badge>,
    action: BACK_HOME,
  },
  decorators: [
    // The flush tracker fills a phone screen; the card sits on a page at its own width, so the
    // 340px frame would cut its edge. The frame shrinks to the 328px a 360 canvas leaves.
    (Story, { args }) =>
      args.variant === "card" ? (
        <Story />
      ) : (
        <div className="flex h-165 w-full max-w-85 flex-col overflow-hidden rounded-lg border border-border-subtle">
          <Story />
        </div>
      ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Live order status after checkout — the screen a guest watches while the kitchen cooks. Step copy is brand voice ("Kitchen\'s on it."), never system status. The header is a flooded pink field and a polite live region, so each step change is read out.',
      },
    },
  },
} satisfies Meta<typeof OrderTracker>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The flush tracker scrolls (`overflow-y-auto`) and the card clips (`overflow-hidden`), so the
 * body's padding must hold the action's focus ring whole: tab to it and prove nothing cuts it.
 */
const proveActionRingWhole: Story["play"] = async ({ canvas, userEvent }) => {
  await userEvent.tab();
  const action = canvas.getByRole("link", { name: "Back to Home" });
  await expect(action).toHaveFocus();
  await expect(action.matches(":focus-visible")).toBe(true);
  await expect(ringClippers(action)).toEqual([]);
};

export const Playground: Story = {};

/** Card row: the start — order in. */
export const OrderIn: Story = { args: { current: 0 }, play: proveActionRingWhole };

export const OnTheTandoor: Story = { args: { current: 1 } };

/** Card row: ready for pickup. */
export const Ready: Story = { args: { current: 2, badge: <Badge tone="ink">Ready</Badge> } };

export const AsCard: Story = {
  args: { variant: "card", current: 1 },
  decorators: [
    (Story) => (
      <div className="w-100">
        <Story />
      </div>
    ),
  ],
  play: proveActionRingWhole,
};

/** Delivery runs its own two steps — as short as the tracker is worth drawing. */
export const DeliverySteps: Story = {
  args: {
    current: 1,
    steps: [
      { label: "Order in", note: "Kitchen's on it." },
      { label: "On its way", note: "Riding out to you now." },
    ],
  },
};

/** The smallest supported viewport: the header copy wraps, nothing clips. */
export const Mobile: Story = {
  args: { current: 1 },
  globals: VIEWPORT_360,
  play: async (context) => {
    await expect(context.canvasElement.scrollWidth).toBeLessThanOrEqual(
      context.canvasElement.clientWidth
    );
    await proveActionRingWhole(context);
  },
};
